import {
    TAVERN_PET_COMPANION_ID,
    TAVERN_PET_CURIO_IDS,
    TAVERN_PET_EMOTIONS,
    TAVERN_PET_EVENT_IDS,
    TAVERN_PET_MOMENT_IDS,
    TAVERN_PET_PERSONA_IDS,
    TAVERN_PET_PHASES,
    isTavernPetInterferenceEventId,
    type TavernPetActionRecord,
    type TavernPetChatResponse,
    type TavernPetCompanionRecord,
    type TavernPetEvolutionRequest,
    type TavernPetJournalDetail,
    type TavernPetJournalDraft,
    type TavernPetJournalRecord,
    type TavernPetLifetimeStats,
    type TavernPetMomentChoiceId,
    type TavernPetMomentId,
    type TavernPetMomentResolutionId,
    type TavernPetOrigin,
    type TavernPetState,
    type TavernPetStateAction,
    type TavernPetTraits,
    type TavernPetTurnOutcome,
    throwTavernPetError,
} from './pet-types';
import { isTavernPetVerdictText } from './pet-copy';
import { TAVERN_PET_JUVENILE_PROFILE, TAVERN_PET_PERSONAS } from './pet-personas';

const MILESTONE_IDS = ['arrival', 'hatch', 'adulthood', 'repattern'] as const;
const MOTIONS = ['none', 'shake', 'bounce', 'turn-away', 'hide', 'approach', 'stare'] as const;
const MOMENT_CHOICES: Readonly<Record<TavernPetMomentId, readonly TavernPetMomentChoiceId[]>> = Object.freeze({
    'glass-hand': ['touch-glass', 'wait-nearby', 'leave-space'],
    'bottle-cap': ['roll-together', 'keep-it', 'look-away'],
    'quiet-corner': ['tap-back', 'leave-a-light', 'let-it-be'],
});
const KNOWN_FACES = new Set([
    ...Object.values(TAVERN_PET_JUVENILE_PROFILE.faces),
    ...Object.values(TAVERN_PET_PERSONAS).flatMap((profile) => Object.values(profile.faces)),
]);

export interface TavernPetInvariantViolation {
    code: 'state-invalid' | 'companion-invalid' | 'action-invalid' | 'journal-invalid';
    detail: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cloneCanonical<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function fail(detail: string): never {
    throwTavernPetError('pet_state_invalid', detail);
}

function assertPlainObject(
    value: unknown,
    required: readonly string[],
    optional: readonly string[],
    detail: string,
): Record<string, unknown> {
    if (!isRecord(value)) {return fail(`${detail}.shape`);}
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {return fail(`${detail}.prototype`);}
    const keys = Object.keys(value);
    const allowed = new Set([...required, ...optional]);
    if (keys.some((key) => !allowed.has(key)) || required.some((key) => !keys.includes(key))) {
        return fail(`${detail}.keys`);
    }
    if (optional.some((key) => keys.includes(key) && value[key] === undefined)) {
        return fail(`${detail}.undefined`);
    }
    return value;
}

function assertString(value: unknown, detail: string, maximum = 240, allowEmpty = false): string {
    if (typeof value !== 'string'
        || value !== value.trim()
        || (!allowEmpty && !value)
        || [...value].length > maximum
    ) {
        return fail(detail);
    }
    return value;
}

function assertInteger(value: unknown, minimum: number, maximum: number, detail: string): number {
    if (!Number.isSafeInteger(value) || Number(value) < minimum || Number(value) > maximum) {
        return fail(detail);
    }
    return Number(value);
}

function assertBoolean(value: unknown, detail: string): boolean {
    if (typeof value !== 'boolean') {return fail(detail);}
    return value;
}

function assertEnum<T extends string>(value: unknown, values: readonly T[], detail: string): T {
    if (typeof value !== 'string' || !values.includes(value as T)) {return fail(detail);}
    return value as T;
}

function assertFace(value: unknown, detail: string): string {
    const face = assertString(value, detail, 80);
    if (!KNOWN_FACES.has(face)) {return fail(detail);}
    return face;
}

function assertMotion(value: unknown, detail: string): void {
    assertEnum(value, MOTIONS, detail);
}

function assertTraits(value: unknown, detail: string): asserts value is TavernPetTraits {
    const traits = assertPlainObject(value, ['closeness', 'sharing', 'tempo'], [], detail);
    assertInteger(traits.closeness, -100, 100, `${detail}.closeness`);
    assertInteger(traits.sharing, -100, 100, `${detail}.sharing`);
    assertInteger(traits.tempo, -100, 100, `${detail}.tempo`);
}

function assertBirthBias(value: unknown, detail: string): void {
    assertTraits(value, detail);
    const bias = value as TavernPetTraits;
    for (const [trait, amount] of Object.entries(bias)) {
        if (amount === 0 || Math.abs(amount) > 15) {return fail(`${detail}.${trait}`);}
    }
}

function assertOrigin(value: unknown, detail: string): asserts value is TavernPetOrigin {
    const origin = assertPlainObject(value, ['specimenNumber', 'birthBias'], [], detail);
    assertInteger(origin.specimenNumber, 1, 999, `${detail}.specimenNumber`);
    assertBirthBias(origin.birthBias, `${detail}.birthBias`);
}

function assertStats(value: unknown, detail: string): asserts value is TavernPetLifetimeStats {
    const stats = assertPlainObject(value, [
        'feedCount', 'toyCount', 'chatCount', 'momentCount', 'stolenTotal', 'giftedTotal',
    ], [], detail);
    for (const key of Object.keys(stats)) {
        assertInteger(stats[key], 0, Number.MAX_SAFE_INTEGER, `${detail}.${key}`);
    }
}

function assertMoment(
    value: unknown,
    detail: string,
): asserts value is { id: TavernPetMomentId } {
    const moment = assertPlainObject(value, ['id'], [], detail);
    assertEnum(moment.id, TAVERN_PET_MOMENT_IDS, `${detail}.id`);
}

function assertMomentChoice(
    momentId: TavernPetMomentId,
    choiceId: unknown,
    detail: string,
    allowSkip = false,
): TavernPetMomentResolutionId {
    if (allowSkip && choiceId === 'skip') {return 'skip';}
    const choice = assertString(choiceId, detail, 40) as TavernPetMomentChoiceId;
    if (!MOMENT_CHOICES[momentId].includes(choice)) {return fail(detail);}
    return choice;
}

function assertEvolution(value: unknown, detail: string): asserts value is TavernPetEvolutionRequest {
    const request = assertPlainObject(value, [
        'requestId', 'milestoneId', 'personaId', 'traits', 'stats',
        'sourceSessionId', 'sourceTurn', 'sourcePetTurn', 'sourceAnchorOrder',
    ], ['previousPersonaId'], detail);
    assertString(request.requestId, `${detail}.requestId`, 240);
    const milestoneId = assertEnum(request.milestoneId, ['adulthood', 'repattern'], `${detail}.milestoneId`);
    assertEnum(request.personaId, TAVERN_PET_PERSONA_IDS, `${detail}.personaId`);
    if (request.previousPersonaId !== undefined) {
        assertEnum(request.previousPersonaId, TAVERN_PET_PERSONA_IDS, `${detail}.previousPersonaId`);
    }
    if (milestoneId === 'adulthood' && request.previousPersonaId !== undefined) {
        return fail(`${detail}.previousPersonaId`);
    }
    if (milestoneId === 'repattern'
        && (request.previousPersonaId === undefined || request.previousPersonaId === request.personaId)
    ) {
        return fail(`${detail}.previousPersonaId`);
    }
    assertTraits(request.traits, `${detail}.traits`);
    assertStats(request.stats, `${detail}.stats`);
    assertString(request.sourceSessionId, `${detail}.sourceSessionId`, 240);
    assertInteger(request.sourceTurn, 0, Number.MAX_SAFE_INTEGER, `${detail}.sourceTurn`);
    assertInteger(request.sourcePetTurn, 0, Number.MAX_SAFE_INTEGER, `${detail}.sourcePetTurn`);
    assertInteger(request.sourceAnchorOrder, 0, Number.MAX_SAFE_INTEGER, `${detail}.sourceAnchorOrder`);
}

/**
 * Keep the type transition immediately beside the complete runtime validation.
 * Callers must never treat a DB payload as an evolution request before this
 * function returns.
 */
function requireEvolution(value: unknown, detail: string): TavernPetEvolutionRequest {
    assertEvolution(value, detail);
    return value;
}

function assertChatMemory(
    value: unknown,
    detail: string,
): asserts value is TavernPetState['chatMemory'] {
    const memory = assertPlainObject(value, ['summary', 'recent', 'moments'], [], detail);
    assertString(memory.summary, `${detail}.summary`, 100, true);
    if (!Array.isArray(memory.recent) || memory.recent.length > 6) {return fail(`${detail}.recent`);}
    memory.recent.forEach((entry, index) => {
        const round = assertPlainObject(entry, ['playerText', 'petText'], [], `${detail}.recent.${String(index)}`);
        assertString(round.playerText, `${detail}.recent.${String(index)}.playerText`, 120);
        assertString(round.petText, `${detail}.recent.${String(index)}.petText`, 120);
    });
    if (!Array.isArray(memory.moments) || memory.moments.length > 12) {return fail(`${detail}.moments`);}
    memory.moments.forEach((entry, index) => assertString(entry, `${detail}.moments.${String(index)}`, 180));
}

function assertCooldowns(value: unknown, detail: string): void {
    const cooldowns = assertPlainObject(value, [], TAVERN_PET_EVENT_IDS, detail);
    for (const [eventId, remaining] of Object.entries(cooldowns)) {
        assertEnum(eventId, TAVERN_PET_EVENT_IDS, `${detail}.${eventId}.id`);
        if ((MILESTONE_IDS as readonly string[]).includes(eventId)) {return fail(`${detail}.${eventId}`);}
        assertInteger(remaining, 1, Number.MAX_SAFE_INTEGER, `${detail}.${eventId}`);
    }
}

function assertState(value: unknown): asserts value is TavernPetState {
    const state = assertPlainObject(value, [
        'petTurn', 'phase', 'origin', 'traits', 'appetite', 'emotion',
        'emotionRemainingTurns', 'nextMomentPetTurn', 'lastMeaningfulInteractionPetTurn',
        'chatMemory', 'nestCoins', 'curios', 'eventCooldowns', 'interferenceEnabled', 'lifetimeStats',
    ], ['personaId', 'petName', 'pendingMoment', 'lastEvolutionPetTurn', 'pendingEvolution'], 'state');
    const petTurn = assertInteger(state.petTurn, 0, Number.MAX_SAFE_INTEGER, 'state.petTurn');
    const phase = assertEnum(state.phase, TAVERN_PET_PHASES, 'state.phase');
    assertOrigin(state.origin, 'state.origin');
    assertTraits(state.traits, 'state.traits');
    assertInteger(state.appetite, 0, 100, 'state.appetite');
    const emotion = assertEnum(state.emotion, TAVERN_PET_EMOTIONS, 'state.emotion');
    const emotionRemainingTurns = assertInteger(state.emotionRemainingTurns, 0, 5, 'state.emotionRemainingTurns');
    if ((emotion === 'calm' || emotion === 'bored') && emotionRemainingTurns !== 0) {
        return fail('state.emotionRemainingTurns');
    }
    assertInteger(state.nextMomentPetTurn, 0, Number.MAX_SAFE_INTEGER, 'state.nextMomentPetTurn');
    const lastMeaningful = assertInteger(
        state.lastMeaningfulInteractionPetTurn,
        0,
        petTurn,
        'state.lastMeaningfulInteractionPetTurn',
    );
    void lastMeaningful;
    if (state.personaId !== undefined) {assertEnum(state.personaId, TAVERN_PET_PERSONA_IDS, 'state.personaId');}
    if (state.petName !== undefined) {assertString(state.petName, 'state.petName', 12);}
    const pendingMoment = state.pendingMoment;
    if (pendingMoment !== undefined) {
        assertMoment(pendingMoment, 'state.pendingMoment');
    }
    if (state.lastEvolutionPetTurn !== undefined) {
        assertInteger(state.lastEvolutionPetTurn, 0, petTurn, 'state.lastEvolutionPetTurn');
    }
    const pendingEvolution = state.pendingEvolution === undefined
        ? undefined
        : requireEvolution(state.pendingEvolution, 'state.pendingEvolution');
    if (pendingEvolution !== undefined) {
        if (pendingEvolution.sourcePetTurn > petTurn) {return fail('state.pendingEvolution.sourcePetTurn');}
    }
    const chatMemory = state.chatMemory;
    assertChatMemory(chatMemory, 'state.chatMemory');
    assertInteger(state.nestCoins, 0, Number.MAX_SAFE_INTEGER, 'state.nestCoins');
    if (!Array.isArray(state.curios) || new Set(state.curios).size !== state.curios.length) {
        return fail('state.curios');
    }
    state.curios.forEach((curio, index) => assertEnum(curio, TAVERN_PET_CURIO_IDS, `state.curios.${String(index)}`));
    assertCooldowns(state.eventCooldowns, 'state.eventCooldowns');
    assertBoolean(state.interferenceEnabled, 'state.interferenceEnabled');
    assertStats(state.lifetimeStats, 'state.lifetimeStats');

    if (phase === 'egg') {
        if (petTurn !== 0
            || state.personaId !== undefined
            || state.pendingMoment !== undefined
            || state.lastEvolutionPetTurn !== undefined
            || state.pendingEvolution !== undefined
            || chatMemory.summary
            || chatMemory.recent.length
            || chatMemory.moments.length
        ) {
            return fail('state.egg');
        }
        return;
    }
    if (phase === 'juvenile') {
        if (petTurn < 1
            || petTurn > 24
            || state.personaId !== undefined
            || state.lastEvolutionPetTurn !== undefined
            || state.pendingEvolution !== undefined
        ) {
            return fail('state.juvenile');
        }
        return;
    }
    if (petTurn < 25 || state.personaId === undefined || state.lastEvolutionPetTurn === undefined) {
        return fail('state.adult');
    }
    if (pendingEvolution !== undefined && pendingEvolution.personaId !== state.personaId) {
        return fail('state.pendingEvolution.personaId');
    }
}

function assertChatResponse(value: unknown, detail: string): asserts value is TavernPetChatResponse {
    const response = assertPlainObject(value, [
        'face', 'text', 'motion', 'emotionShift', 'murmur', 'summaryUpdate',
    ], [], detail);
    assertFace(response.face, `${detail}.face`);
    assertString(response.text, `${detail}.text`, 120);
    assertMotion(response.motion, `${detail}.motion`);
    if (response.emotionShift !== null) {
        assertEnum(response.emotionShift, TAVERN_PET_EMOTIONS, `${detail}.emotionShift`);
    }
    if (response.murmur !== null) {assertString(response.murmur, `${detail}.murmur`, 30);}
    if (response.summaryUpdate !== null) {assertString(response.summaryUpdate, `${detail}.summaryUpdate`, 100);}
}

function assertJournalDetail(value: unknown, detail: string): asserts value is TavernPetJournalDetail {
    if (!isRecord(value)) {return fail(`${detail}.shape`);}
    if (value.kind === 'event') {
        const eventId = assertEnum(value.eventId, TAVERN_PET_EVENT_IDS, `${detail}.eventId`);
        if ((MILESTONE_IDS as readonly string[]).includes(eventId)) {return fail(`${detail}.eventId`);}
        const event = assertPlainObject(
            value,
            isTavernPetInterferenceEventId(eventId)
                ? ['kind', 'eventId', 'renderedText', 'face', 'motion', 'injectedText']
                : ['kind', 'eventId', 'renderedText', 'face', 'motion'],
            [],
            detail,
        );
        assertString(event.renderedText, `${detail}.renderedText`, 500);
        assertFace(event.face, `${detail}.face`);
        assertMotion(event.motion, `${detail}.motion`);
        if (isTavernPetInterferenceEventId(eventId)) {
            assertString(event.injectedText, `${detail}.injectedText`, 500);
        }
        return;
    }
    if (value.kind === 'milestone') {
        const milestone = assertPlainObject(value, [
            'kind', 'milestoneId', 'renderedText', 'motion', 'milestonePetTurn', 'milestoneSourceAnchorOrder',
        ], ['personaId', 'verdict'], detail);
        const milestoneId = assertEnum(milestone.milestoneId, MILESTONE_IDS, `${detail}.milestoneId`);
        assertString(milestone.renderedText, `${detail}.renderedText`, 500);
        if (milestone.motion !== 'bounce') {return fail(`${detail}.motion`);}
        assertInteger(milestone.milestonePetTurn, 0, Number.MAX_SAFE_INTEGER, `${detail}.milestonePetTurn`);
        assertInteger(milestone.milestoneSourceAnchorOrder, 0, Number.MAX_SAFE_INTEGER, `${detail}.milestoneSourceAnchorOrder`);
        if (milestoneId === 'adulthood' || milestoneId === 'repattern') {
            assertEnum(milestone.personaId, TAVERN_PET_PERSONA_IDS, `${detail}.personaId`);
            if (!isTavernPetVerdictText(String(milestone.verdict || ''))) {return fail(`${detail}.verdict`);}
        } else if (milestone.personaId !== undefined || milestone.verdict !== undefined) {
            return fail(`${detail}.persona`);
        }
        return;
    }
    if (value.kind === 'chat') {
        const chat = assertPlainObject(value, ['kind', 'playerText', 'petText', 'face', 'motion'], ['murmur'], detail);
        assertString(chat.playerText, `${detail}.playerText`, 120);
        assertString(chat.petText, `${detail}.petText`, 120);
        assertFace(chat.face, `${detail}.face`);
        assertMotion(chat.motion, `${detail}.motion`);
        if (chat.murmur !== undefined) {assertString(chat.murmur, `${detail}.murmur`, 30);}
        return;
    }
    if (value.kind === 'moment') {
        const moment = assertPlainObject(value, ['kind', 'momentId', 'choiceId', 'renderedText', 'motion'], [], detail);
        const momentId = assertEnum(moment.momentId, TAVERN_PET_MOMENT_IDS, `${detail}.momentId`);
        assertMomentChoice(momentId, moment.choiceId, `${detail}.choiceId`, true);
        assertString(moment.renderedText, `${detail}.renderedText`, 500);
        assertMotion(moment.motion, `${detail}.motion`);
        return;
    }
    return fail(`${detail}.kind`);
}

function assertJournalDraft(value: unknown, detail: string): asserts value is TavernPetJournalDraft {
    const draft = assertPlainObject(value, ['detail', 'coinDelta'], ['notificationText'], detail);
    assertJournalDetail(draft.detail, `${detail}.detail`);
    assertInteger(draft.coinDelta, -40, 40, `${detail}.coinDelta`);
    if (draft.notificationText !== undefined) {assertString(draft.notificationText, `${detail}.notificationText`, 240);}
}

/** Same validated-boundary helper as requireEvolution for action payloads. */
function requireJournalDraft(value: unknown, detail: string): TavernPetJournalDraft {
    assertJournalDraft(value, detail);
    return value;
}

function assertTurnOutcome(value: unknown, detail: string): asserts value is TavernPetTurnOutcome {
    const outcome = assertPlainObject(value, [], ['eventId', 'milestoneId', 'journal', 'coinEffect'], detail);
    if (outcome.eventId !== undefined) {assertEnum(outcome.eventId, TAVERN_PET_EVENT_IDS, `${detail}.eventId`);}
    if (outcome.milestoneId !== undefined) {assertEnum(outcome.milestoneId, MILESTONE_IDS, `${detail}.milestoneId`);}
    if (outcome.eventId !== undefined && outcome.milestoneId !== undefined) {return fail(`${detail}.kind`);}
    const journal = outcome.journal === undefined
        ? undefined
        : requireJournalDraft(outcome.journal, `${detail}.journal`);
    if (outcome.eventId !== undefined
        && journal !== undefined
        && journal.detail.kind !== 'event'
    ) {return fail(`${detail}.eventJournal`);}
    if (outcome.milestoneId !== undefined
        && journal !== undefined
        && journal.detail.kind !== 'milestone'
    ) {return fail(`${detail}.milestoneJournal`);}
    if (outcome.coinEffect !== undefined) {
        const coin = assertPlainObject(outcome.coinEffect, [
            'amount', 'direction', 'kind', 'idempotencyKey', 'title', 'sourceId',
        ], [], `${detail}.coinEffect`);
        assertInteger(coin.amount, 1, 40, `${detail}.coinEffect.amount`);
        assertEnum(coin.direction, ['debit', 'credit'], `${detail}.coinEffect.direction`);
        assertEnum(coin.kind, ['pet_steal', 'pet_hoard', 'pet_find', 'pet_gift', 'pet_return'], `${detail}.coinEffect.kind`);
        assertString(coin.idempotencyKey, `${detail}.coinEffect.idempotencyKey`, 240);
        assertString(coin.title, `${detail}.coinEffect.title`, 140);
        assertString(coin.sourceId, `${detail}.coinEffect.sourceId`, 180);
        if (!journal || journal.coinDelta === 0) {return fail(`${detail}.coinEffect.journal`);}
    }
}

function assertTurnContext(value: unknown, detail: string): void {
    const context = assertPlainObject(value, [
        'sourceSessionId', 'sourceTurn', 'sourceAnchorOrder', 'petTurn',
        'recentExternalSpend', 'playerBalance', 'knownTargetName', 'evolutionRequestId',
    ], [], detail);
    assertString(context.sourceSessionId, `${detail}.sourceSessionId`, 240);
    assertInteger(context.sourceTurn, 0, Number.MAX_SAFE_INTEGER, `${detail}.sourceTurn`);
    assertInteger(context.sourceAnchorOrder, 0, Number.MAX_SAFE_INTEGER, `${detail}.sourceAnchorOrder`);
    assertInteger(context.petTurn, 1, Number.MAX_SAFE_INTEGER, `${detail}.petTurn`);
    assertInteger(context.recentExternalSpend, 0, Number.MAX_SAFE_INTEGER, `${detail}.recentExternalSpend`);
    assertInteger(context.playerBalance, 0, Number.MAX_SAFE_INTEGER, `${detail}.playerBalance`);
    const knownTargetName = assertString(context.knownTargetName, `${detail}.knownTargetName`, 40, true);
    if (/[<>&]/u.test(knownTargetName)) {return fail(`${detail}.knownTargetName`);}
    assertString(context.evolutionRequestId, `${detail}.evolutionRequestId`, 240);
}

function assertAction(value: unknown): asserts value is TavernPetStateAction {
    if (!isRecord(value)) {return fail('action.shape');}
    if (value.kind === 'lure') {
        const action = assertPlainObject(value, ['kind', 'origin'], [], 'action');
        assertOrigin(action.origin, 'action.origin');
        return;
    }
    if (value.kind === 'interact') {
        const action = assertPlainObject(value, ['kind', 'interactionId'], [], 'action');
        if (action.interactionId !== 'feed' && action.interactionId !== 'toy') {return fail('action.interactionId');}
        return;
    }
    if (value.kind === 'rename') {
        const action = assertPlainObject(value, ['kind'], ['petName'], 'action');
        if (action.petName !== undefined) {assertString(action.petName, 'action.petName', 12);}
        return;
    }
    if (value.kind === 'toggle-interference') {
        const action = assertPlainObject(value, ['kind', 'enabled'], [], 'action');
        assertBoolean(action.enabled, 'action.enabled');
        return;
    }
    if (value.kind === 'turn-advance') {
        const action = assertPlainObject(value, ['kind', 'context', 'outcome'], [], 'action');
        assertTurnContext(action.context, 'action.context');
        assertTurnOutcome(action.outcome, 'action.outcome');
        return;
    }
    if (value.kind === 'chat') {
        const action = assertPlainObject(value, ['kind', 'playerText', 'response'], [], 'action');
        assertString(action.playerText, 'action.playerText', 120);
        assertChatResponse(action.response, 'action.response');
        return;
    }
    if (value.kind === 'resolve-moment') {
        const action = assertPlainObject(value, ['kind', 'momentId', 'choiceId'], [], 'action');
        const momentId = assertEnum(action.momentId, TAVERN_PET_MOMENT_IDS, 'action.momentId');
        assertMomentChoice(momentId, action.choiceId, 'action.choiceId');
        return;
    }
    if (value.kind === 'skip-moment') {
        const action = assertPlainObject(value, ['kind', 'momentId'], [], 'action');
        assertEnum(action.momentId, TAVERN_PET_MOMENT_IDS, 'action.momentId');
        return;
    }
    if (value.kind === 'resolve-evolution') {
        const action = assertPlainObject(value, ['kind', 'requestId', 'verdict', 'usedFallback'], [], 'action');
        assertString(action.requestId, 'action.requestId', 240);
        if (!isTavernPetVerdictText(String(action.verdict || ''))) {return fail('action.verdict');}
        assertBoolean(action.usedFallback, 'action.usedFallback');
        return;
    }
    return fail('action.kind');
}

export function assertTavernPetStateInvariant(state: TavernPetState): void {
    assertState(state);
}

export function parseCanonicalTavernPetCompanionRecord(value: unknown): TavernPetCompanionRecord {
    const record = assertPlainObject(value, ['id', 'revision', 'versionId', 'state', 'createdAt', 'updatedAt'], [], 'companion');
    if (record.id !== TAVERN_PET_COMPANION_ID) {return fail('companion.id');}
    assertInteger(record.revision, 1, Number.MAX_SAFE_INTEGER, 'companion.revision');
    assertString(record.versionId, 'companion.versionId', 240);
    assertState(record.state);
    assertInteger(record.createdAt, 0, Number.MAX_SAFE_INTEGER, 'companion.createdAt');
    assertInteger(record.updatedAt, 0, Number.MAX_SAFE_INTEGER, 'companion.updatedAt');
    return cloneCanonical(record as unknown as TavernPetCompanionRecord);
}

export function parseCanonicalTavernPetActionRecord(value: unknown): TavernPetActionRecord {
    const record = assertPlainObject(value, [
        'id', 'revision', 'sourceSessionId', 'sourceTurn', 'sourceAnchorOrder', 'action', 'createdAt',
    ], ['activityId'], 'action-record');
    assertString(record.id, 'action-record.id', 240);
    assertInteger(record.revision, 1, Number.MAX_SAFE_INTEGER, 'action-record.revision');
    assertString(record.sourceSessionId, 'action-record.sourceSessionId', 240);
    assertInteger(record.sourceTurn, 0, Number.MAX_SAFE_INTEGER, 'action-record.sourceTurn');
    assertInteger(record.sourceAnchorOrder, 0, Number.MAX_SAFE_INTEGER, 'action-record.sourceAnchorOrder');
    assertAction(record.action);
    if (record.activityId !== undefined) {assertString(record.activityId, 'action-record.activityId', 240);}
    assertInteger(record.createdAt, 0, Number.MAX_SAFE_INTEGER, 'action-record.createdAt');
    if (record.action.kind === 'turn-advance') {
        const context = record.action.context;
        if (context.sourceSessionId !== record.sourceSessionId
            || context.sourceTurn !== record.sourceTurn
            || context.sourceAnchorOrder !== record.sourceAnchorOrder
        ) {
            return fail('action-record.turn-context');
        }
    }
    return cloneCanonical(record as unknown as TavernPetActionRecord);
}

export function parseCanonicalTavernPetJournalRecord(value: unknown): TavernPetJournalRecord {
    const record = assertPlainObject(value, [
        'id', 'sourceActionId', 'sourceSessionId', 'sourceTurn', 'sourceAnchorOrder',
        'petTurn', 'detail', 'coinDelta', 'createdAt',
    ], ['notificationText'], 'journal');
    assertString(record.id, 'journal.id', 240);
    assertString(record.sourceActionId, 'journal.sourceActionId', 240);
    assertString(record.sourceSessionId, 'journal.sourceSessionId', 240);
    assertInteger(record.sourceTurn, 0, Number.MAX_SAFE_INTEGER, 'journal.sourceTurn');
    assertInteger(record.sourceAnchorOrder, 0, Number.MAX_SAFE_INTEGER, 'journal.sourceAnchorOrder');
    assertInteger(record.petTurn, 0, Number.MAX_SAFE_INTEGER, 'journal.petTurn');
    assertJournalDetail(record.detail, 'journal.detail');
    assertInteger(record.coinDelta, -40, 40, 'journal.coinDelta');
    if (record.notificationText !== undefined) {assertString(record.notificationText, 'journal.notificationText', 240);}
    assertInteger(record.createdAt, 0, Number.MAX_SAFE_INTEGER, 'journal.createdAt');
    return cloneCanonical(record as unknown as TavernPetJournalRecord);
}

export function assertTavernPetJournalInvariant(journal: TavernPetJournalRecord): void {
    parseCanonicalTavernPetJournalRecord(journal);
}

export function findTavernPetStateInvariantViolation(state: unknown): TavernPetInvariantViolation | null {
    try {
        assertState(state);
        return null;
    } catch (error) {
        return { code: 'state-invalid', detail: error instanceof Error ? error.message : String(error || 'invalid') };
    }
}

export function findTavernPetJournalInvariantViolation(journal: unknown): TavernPetInvariantViolation | null {
    try {
        parseCanonicalTavernPetJournalRecord(journal);
        return null;
    } catch (error) {
        return { code: 'journal-invalid', detail: error instanceof Error ? error.message : String(error || 'invalid') };
    }
}
