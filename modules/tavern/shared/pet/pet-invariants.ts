import {
    TAVERN_PET_COMPANION_ID,
    TAVERN_PET_CURIO_IDS,
    TAVERN_PET_EMOTIONS,
    TAVERN_PET_EVENT_IDS,
    TAVERN_PET_INTERACTION_IDS,
    TAVERN_PET_PERSONA_IDS,
    TAVERN_PET_PHASES,
    isTavernPetInterferenceEventId,
    type TavernPetActionRecord,
    type TavernPetAxes,
    type TavernPetChatResponse,
    type TavernPetCompanionRecord,
    type TavernPetEvolutionRequest,
    type TavernPetInteractionWindow,
    type TavernPetJournalDetail,
    type TavernPetJournalDraft,
    type TavernPetJournalRecord,
    type TavernPetLifetimeStats,
    type TavernPetOrigin,
    type TavernPetState,
    type TavernPetStateAction,
    type TavernPetTurnOutcome,
    throwTavernPetError,
} from './pet-types';
import { isTavernPetVerdictText } from './pet-copy';

const MILESTONE_IDS = new Set(['arrival', 'hatch', 'adulthood', 'repattern']);

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
    if (!isRecord(value)) {return fail(detail + '.shape');}
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {return fail(detail + '.prototype');}
    const keys = Object.keys(value);
    const allowed = new Set([...required, ...optional]);
    if (keys.some((key) => !allowed.has(key)) || required.some((key) => !keys.includes(key))) {
        return fail(detail + '.keys');
    }
    for (const key of optional) {
        if (keys.includes(key) && value[key] === undefined) {return fail([detail, key, 'undefined'].join('.'));}
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

function assertAxes(value: unknown, detail: string): asserts value is TavernPetAxes {
    const axes = assertPlainObject(value, ['tameness', 'generosity', 'brightness'], [], detail);
    assertInteger(axes.tameness, -100, 100, detail + '.tameness');
    assertInteger(axes.generosity, -100, 100, detail + '.generosity');
    assertInteger(axes.brightness, -100, 100, detail + '.brightness');
}

function assertBirthBiasAxes(value: unknown, detail: string): asserts value is TavernPetAxes {
    assertAxes(value, detail);
    for (const [key, axis] of Object.entries(value as TavernPetAxes)) {
        if (axis === 0 || Math.abs(axis) > 15) {return fail([detail, key].join('.'));}
    }
}

function assertOrigin(value: unknown, detail: string): asserts value is TavernPetOrigin {
    const origin = assertPlainObject(value, ['specimenNumber', 'arrivalAfterTurns', 'birthBias'], [], detail);
    assertInteger(origin.specimenNumber, 1, 999, detail + '.specimenNumber');
    assertInteger(origin.arrivalAfterTurns, 1, 3, detail + '.arrivalAfterTurns');
    assertBirthBiasAxes(origin.birthBias, detail + '.birthBias');
}

function assertWindow(value: unknown, detail: string): asserts value is TavernPetInteractionWindow {
    const window = assertPlainObject(value, [
        'petTurn', 'feedCount', 'tapCount', 'bgmCount', 'patCount', 'annoyCount', 'chatCount', 'interactionCount',
    ], [], detail);
    assertInteger(window.petTurn, 0, Number.MAX_SAFE_INTEGER, detail + '.petTurn');
    assertInteger(window.feedCount, 0, Number.MAX_SAFE_INTEGER, detail + '.feedCount');
    assertInteger(window.tapCount, 0, 2, detail + '.tapCount');
    assertInteger(window.bgmCount, 0, 1, detail + '.bgmCount');
    assertInteger(window.patCount, 0, Number.MAX_SAFE_INTEGER, detail + '.patCount');
    assertInteger(window.annoyCount, 0, 4, detail + '.annoyCount');
    assertInteger(window.chatCount, 0, Number.MAX_SAFE_INTEGER, detail + '.chatCount');
    assertInteger(window.interactionCount, 0, Number.MAX_SAFE_INTEGER, detail + '.interactionCount');
}

function assertStats(value: unknown, detail: string): asserts value is TavernPetLifetimeStats {
    const stats = assertPlainObject(value, [
        'feedCount', 'tapCount', 'bgmCount', 'patCount', 'hitCount', 'toyCount', 'chatCount',
        'dormantCount', 'stolenTotal', 'giftedTotal',
    ], [], detail);
    for (const key of Object.keys(stats)) {
        assertInteger(stats[key], 0, Number.MAX_SAFE_INTEGER, [detail, key].join('.'));
    }
}

function assertEvolution(value: unknown, detail: string): asserts value is TavernPetEvolutionRequest {
    const request = assertPlainObject(value, [
        'requestId', 'milestoneId', 'personaId', 'axes', 'stats',
        'sourceSessionId', 'sourceTurn', 'sourcePetTurn', 'sourceAnchorOrder',
    ], ['previousPersonaId'], detail);
    assertString(request.requestId, detail + '.requestId', 240);
    assertEnum(request.milestoneId, ['adulthood', 'repattern'], detail + '.milestoneId');
    assertEnum(request.personaId, TAVERN_PET_PERSONA_IDS, detail + '.personaId');
    if (request.previousPersonaId !== undefined) {
        assertEnum(request.previousPersonaId, TAVERN_PET_PERSONA_IDS, detail + '.previousPersonaId');
    }
    assertAxes(request.axes, detail + '.axes');
    assertStats(request.stats, detail + '.stats');
    assertString(request.sourceSessionId, detail + '.sourceSessionId', 240);
    assertInteger(request.sourceTurn, 0, Number.MAX_SAFE_INTEGER, detail + '.sourceTurn');
    assertInteger(request.sourcePetTurn, 0, Number.MAX_SAFE_INTEGER, detail + '.sourcePetTurn');
    assertInteger(request.sourceAnchorOrder, 0, Number.MAX_SAFE_INTEGER, detail + '.sourceAnchorOrder');
}

function assertChatMemory(value: unknown, detail: string): void {
    const memory = assertPlainObject(value, ['summary', 'recent'], [], detail);
    assertString(memory.summary, detail + '.summary', 100, true);
    if (!Array.isArray(memory.recent) || memory.recent.length > 6) {return fail(detail + '.recent');}
    memory.recent.forEach((entry, index) => {
        const round = assertPlainObject(entry, ['playerText', 'petText'], [], [detail, 'recent', String(index)].join('.'));
        assertString(round.playerText, [detail, 'recent', String(index), 'playerText'].join('.'), 120);
        assertString(round.petText, [detail, 'recent', String(index), 'petText'].join('.'), 120);
    });
}

function assertCooldowns(value: unknown, detail: string): void {
    const cooldowns = assertPlainObject(value, [], TAVERN_PET_EVENT_IDS, detail);
    for (const [eventId, remaining] of Object.entries(cooldowns)) {
        assertEnum(eventId, TAVERN_PET_EVENT_IDS, [detail, eventId, 'id'].join('.'));
        if (MILESTONE_IDS.has(eventId)) {return fail([detail, eventId].join('.'));}
        assertInteger(remaining, 1, Number.MAX_SAFE_INTEGER, [detail, eventId].join('.'));
    }
}

function assertState(value: unknown): asserts value is TavernPetState {
    const state = assertPlainObject(value, [
        'petTurn', 'phase', 'dormant', 'origin', 'phaseTurnCount', 'axes', 'satiety', 'emotion',
        'emotionRemainingTurns', 'nestCoins', 'curios', 'interactionWindow', 'idleTurns',
        'toyCooldownTurns', 'eventCooldowns', 'interferenceEnabled', 'interferenceGateTurns',
        'chatMemory', 'lifetimeStats',
    ], [
        'personaId', 'petName', 'incubation', 'beggingDeadlinePetTurn',
        'lastEvolutionActiveTurn', 'pendingEvolution',
    ], 'state');
    const petTurn = assertInteger(state.petTurn, 0, Number.MAX_SAFE_INTEGER, 'state.petTurn');
    const phase = assertEnum(state.phase, TAVERN_PET_PHASES, 'state.phase');
    const dormant = assertBoolean(state.dormant, 'state.dormant');
    assertOrigin(state.origin, 'state.origin');
    const phaseTurnCount = assertInteger(state.phaseTurnCount, 0, Number.MAX_SAFE_INTEGER, 'state.phaseTurnCount');
    assertAxes(state.axes, 'state.axes');
    const satiety = assertInteger(state.satiety, 0, 100, 'state.satiety');
    const emotion = assertEnum(state.emotion, TAVERN_PET_EMOTIONS, 'state.emotion');
    const emotionTurns = assertInteger(state.emotionRemainingTurns, 0, 5, 'state.emotionRemainingTurns');
    if ((emotion === 'calm' || emotion === 'bored') && emotionTurns !== 0) {
        return fail('state.emotionRemainingTurns');
    }
    if (state.personaId !== undefined) {assertEnum(state.personaId, TAVERN_PET_PERSONA_IDS, 'state.personaId');}
    if (state.petName !== undefined) {assertString(state.petName, 'state.petName', 12);}
    assertInteger(state.nestCoins, 0, Number.MAX_SAFE_INTEGER, 'state.nestCoins');
    if (!Array.isArray(state.curios) || new Set(state.curios).size !== state.curios.length) {
        return fail('state.curios');
    }
    state.curios.forEach((curio, index) => assertEnum(curio, TAVERN_PET_CURIO_IDS, ['state.curios', String(index)].join('.')));
    if (state.incubation !== undefined) {
        const incubation = assertPlainObject(state.incubation, ['feedCount', 'tapCount', 'bgmCount'], [], 'state.incubation');
        assertInteger(incubation.feedCount, 0, Number.MAX_SAFE_INTEGER, 'state.incubation.feedCount');
        assertInteger(incubation.tapCount, 0, Number.MAX_SAFE_INTEGER, 'state.incubation.tapCount');
        assertInteger(incubation.bgmCount, 0, Number.MAX_SAFE_INTEGER, 'state.incubation.bgmCount');
    }
    assertWindow(state.interactionWindow, 'state.interactionWindow');
    if (state.interactionWindow.petTurn > petTurn) {return fail('state.interactionWindow.petTurn');}
    assertInteger(state.idleTurns, 0, Number.MAX_SAFE_INTEGER, 'state.idleTurns');
    if (state.beggingDeadlinePetTurn !== undefined) {
        assertInteger(state.beggingDeadlinePetTurn, 0, Number.MAX_SAFE_INTEGER, 'state.beggingDeadlinePetTurn');
    }
    assertInteger(state.toyCooldownTurns, 0, 3, 'state.toyCooldownTurns');
    assertCooldowns(state.eventCooldowns, 'state.eventCooldowns');
    assertBoolean(state.interferenceEnabled, 'state.interferenceEnabled');
    assertInteger(state.interferenceGateTurns, 0, 15, 'state.interferenceGateTurns');
    if (state.lastEvolutionActiveTurn !== undefined) {
        assertInteger(state.lastEvolutionActiveTurn, 0, phaseTurnCount, 'state.lastEvolutionActiveTurn');
    }
    if (state.pendingEvolution !== undefined) {
        assertEvolution(state.pendingEvolution, 'state.pendingEvolution');
        if (state.pendingEvolution.sourcePetTurn > petTurn) {
            return fail('state.pendingEvolution.sourcePetTurn');
        }
    }
    assertChatMemory(state.chatMemory, 'state.chatMemory');
    assertStats(state.lifetimeStats, 'state.lifetimeStats');

    const incubation = state.incubation as TavernPetState['incubation'];
    const personaId = state.personaId as TavernPetState['personaId'];
    const pending = state.pendingEvolution as TavernPetState['pendingEvolution'];
    if (phase === 'luring') {
        if (dormant
            || satiety !== 0
            || phaseTurnCount >= state.origin.arrivalAfterTurns
            || incubation !== undefined
            || personaId !== undefined
            || state.petName !== undefined
            || state.lastEvolutionActiveTurn !== undefined
            || pending !== undefined
        ) {
            return fail('state.luring');
        }
        return;
    }
    if (dormant !== (satiety === 0)) {return fail('state.dormant-satiety');}
    if (phase === 'egg') {
        if (!incubation
            || personaId !== undefined
            || phaseTurnCount > 7
            || state.lastEvolutionActiveTurn !== undefined
            || pending !== undefined
        ) {
            return fail('state.egg');
        }
    } else if (incubation !== undefined) {
        return fail('state.incubation-phase');
    }
    if (phase === 'juvenile' && (personaId !== undefined
        || phaseTurnCount > 39
        || state.lastEvolutionActiveTurn !== undefined
        || pending !== undefined
    )) {
        return fail('state.juvenile-persona');
    }
    if (phase === 'adult' && (personaId === undefined || state.lastEvolutionActiveTurn === undefined)) {
        return fail('state.adult-persona');
    }
    if (pending && (phase !== 'adult' || pending.personaId !== personaId)) {
        return fail('state.pendingEvolution.persona');
    }
    if (pending?.milestoneId === 'adulthood' && pending.previousPersonaId !== undefined) {
        return fail('state.pendingEvolution.previousPersonaId');
    }
    if (pending?.milestoneId === 'repattern'
        && (!pending.previousPersonaId || pending.previousPersonaId === pending.personaId)
    ) {
        return fail('state.pendingEvolution.previousPersonaId');
    }
}

function assertChatResponse(value: unknown, detail: string): asserts value is TavernPetChatResponse {
    const response = assertPlainObject(value, [
        'face', 'text', 'motion', 'emotionShift', 'murmur', 'summaryUpdate',
    ], [], detail);
    assertString(response.face, detail + '.face', 80);
    assertString(response.text, detail + '.text', 120);
    assertEnum(response.motion, ['none', 'shake', 'bounce', 'turn-away', 'hide', 'approach', 'stare'], detail + '.motion');
    if (response.emotionShift !== null) {assertEnum(response.emotionShift, TAVERN_PET_EMOTIONS, detail + '.emotionShift');}
    if (response.murmur !== null) {assertString(response.murmur, detail + '.murmur', 30);}
    if (response.summaryUpdate !== null) {assertString(response.summaryUpdate, detail + '.summaryUpdate', 100);}
}

function assertJournalDetail(value: unknown, detail: string): asserts value is TavernPetJournalDetail {
    if (!isRecord(value)) {return fail(detail + '.shape');}
    if (value.kind === 'event') {
        const eventId = assertEnum(value.eventId, TAVERN_PET_EVENT_IDS, detail + '.eventId');
        if (MILESTONE_IDS.has(eventId)) {return fail(detail + '.eventId');}
        const event = assertPlainObject(
            value,
            isTavernPetInterferenceEventId(eventId)
                ? ['kind', 'eventId', 'renderedText', 'face', 'motion', 'injectedText']
                : ['kind', 'eventId', 'renderedText', 'face', 'motion'],
            [],
            detail,
        );
        assertString(event.renderedText, detail + '.renderedText', 500);
        assertString(event.face, detail + '.face', 80);
        assertEnum(event.motion, ['none', 'shake', 'bounce', 'turn-away', 'hide', 'approach', 'stare'], detail + '.motion');
        if (isTavernPetInterferenceEventId(eventId)) {
            assertString(event.injectedText, detail + '.injectedText', 500);
        }
        return;
    }
    if (value.kind === 'milestone') {
        const milestone = assertPlainObject(value, [
            'kind', 'milestoneId', 'renderedText', 'motion', 'milestonePetTurn', 'milestoneSourceAnchorOrder',
        ], ['personaId', 'verdict'], detail);
        assertEnum(milestone.milestoneId, ['arrival', 'hatch', 'adulthood', 'repattern'], detail + '.milestoneId');
        assertString(milestone.renderedText, detail + '.renderedText', 500);
        if (milestone.motion !== 'bounce') {return fail(detail + '.motion');}
        assertInteger(milestone.milestonePetTurn, 0, Number.MAX_SAFE_INTEGER, detail + '.milestonePetTurn');
        assertInteger(milestone.milestoneSourceAnchorOrder, 0, Number.MAX_SAFE_INTEGER, detail + '.milestoneSourceAnchorOrder');
        if (milestone.personaId !== undefined) {
            assertEnum(milestone.personaId, TAVERN_PET_PERSONA_IDS, detail + '.personaId');
        }
        if (milestone.verdict !== undefined && !isTavernPetVerdictText(String(milestone.verdict))) {
            return fail(detail + '.verdict');
        }
        return;
    }
    if (value.kind === 'chat') {
        const chat = assertPlainObject(value, ['kind', 'playerText', 'petText', 'face', 'motion'], ['murmur'], detail);
        assertString(chat.playerText, detail + '.playerText', 120);
        assertString(chat.petText, detail + '.petText', 120);
        assertString(chat.face, detail + '.face', 80);
        assertEnum(chat.motion, ['none', 'shake', 'bounce', 'turn-away', 'hide', 'approach', 'stare'], detail + '.motion');
        if (chat.murmur !== undefined) {assertString(chat.murmur, detail + '.murmur', 30);}
        return;
    }
    if (value.kind === 'status') {
        const status = assertPlainObject(value, ['kind', 'status', 'renderedText', 'motion'], [], detail);
        assertEnum(status.status, ['dormant', 'woke'], detail + '.status');
        assertString(status.renderedText, detail + '.renderedText', 500);
        assertEnum(status.motion, ['none', 'shake', 'bounce', 'turn-away', 'hide', 'approach', 'stare'], detail + '.motion');
        return;
    }
    return fail(detail + '.kind');
}

function assertJournalDraft(value: unknown, detail: string): asserts value is TavernPetJournalDraft {
    const draft = assertPlainObject(value, ['detail', 'coinDelta'], ['notificationText'], detail);
    assertJournalDetail(draft.detail, detail + '.detail');
    assertInteger(draft.coinDelta, -40, 40, detail + '.coinDelta');
    if (draft.notificationText !== undefined) {assertString(draft.notificationText, detail + '.notificationText', 240);}
}

function assertTurnOutcome(value: unknown, detail: string): asserts value is TavernPetTurnOutcome {
    const outcome = assertPlainObject(value, [], ['eventId', 'milestoneId', 'journal', 'coinEffect'], detail);
    if (outcome.eventId !== undefined) {assertEnum(outcome.eventId, TAVERN_PET_EVENT_IDS, detail + '.eventId');}
    if (outcome.milestoneId !== undefined) {
        assertEnum(outcome.milestoneId, ['arrival', 'hatch', 'adulthood', 'repattern'], detail + '.milestoneId');
    }
    if (outcome.journal !== undefined) {assertJournalDraft(outcome.journal, detail + '.journal');}
    if (outcome.coinEffect !== undefined) {
        const coin = assertPlainObject(outcome.coinEffect, [
            'amount', 'direction', 'kind', 'idempotencyKey', 'title', 'sourceId',
        ], [], detail + '.coinEffect');
        assertInteger(coin.amount, 1, 40, detail + '.coinEffect.amount');
        assertEnum(coin.direction, ['debit', 'credit'], detail + '.coinEffect.direction');
        assertEnum(coin.kind, ['pet_steal', 'pet_hoard', 'pet_find', 'pet_gift', 'pet_return'], detail + '.coinEffect.kind');
        assertString(coin.idempotencyKey, detail + '.coinEffect.idempotencyKey', 240);
        assertString(coin.title, detail + '.coinEffect.title', 140);
        assertString(coin.sourceId, detail + '.coinEffect.sourceId', 180);
    }
}

function assertTurnContext(value: unknown, detail: string): void {
    const context = assertPlainObject(value, [
        'sourceSessionId', 'sourceTurn', 'sourceAnchorOrder', 'petTurn',
        'recentExternalSpend', 'playerBalance', 'knownTargetName', 'evolutionRequestId',
    ], [], detail);
    assertString(context.sourceSessionId, detail + '.sourceSessionId', 240);
    assertInteger(context.sourceTurn, 0, Number.MAX_SAFE_INTEGER, detail + '.sourceTurn');
    assertInteger(context.sourceAnchorOrder, 0, Number.MAX_SAFE_INTEGER, detail + '.sourceAnchorOrder');
    assertInteger(context.petTurn, 1, Number.MAX_SAFE_INTEGER, detail + '.petTurn');
    assertInteger(context.recentExternalSpend, 0, Number.MAX_SAFE_INTEGER, detail + '.recentExternalSpend');
    assertInteger(context.playerBalance, 0, Number.MAX_SAFE_INTEGER, detail + '.playerBalance');
    const knownTargetName = assertString(context.knownTargetName, detail + '.knownTargetName', 40, true);
    if (/[<>&]/u.test(knownTargetName)) {return fail(detail + '.knownTargetName');}
    assertString(context.evolutionRequestId, detail + '.evolutionRequestId', 240);
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
        const interaction = assertEnum(action.interactionId, TAVERN_PET_INTERACTION_IDS, 'action.interactionId');
        if (interaction === 'lure' || interaction === 'chat' || interaction === 'wake') {
            return fail('action.interactionId');
        }
        return;
    }
    if (value.kind === 'wake') {
        assertPlainObject(value, ['kind'], [], 'action');
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
        const action = assertPlainObject(value, ['kind', 'playerText', 'response', 'appliedAxes'], [], 'action');
        assertString(action.playerText, 'action.playerText', 120);
        assertChatResponse(action.response, 'action.response');
        assertBoolean(action.appliedAxes, 'action.appliedAxes');
        return;
    }
    if (value.kind === 'resolve-evolution') {
        const action = assertPlainObject(value, ['kind', 'requestId', 'verdict', 'usedFallback'], [], 'action');
        assertString(action.requestId, 'action.requestId', 240);
        if (!isTavernPetVerdictText(String(action.verdict))) {return fail('action.verdict');}
        assertBoolean(action.usedFallback, 'action.usedFallback');
        return;
    }
    return fail('action.kind');
}

export function assertTavernPetStateInvariant(state: TavernPetState): void {
    assertState(state);
}

export function parseCanonicalTavernPetCompanionRecord(value: unknown): TavernPetCompanionRecord {
    const record = assertPlainObject(value, [
        'id', 'revision', 'versionId', 'state', 'createdAt', 'updatedAt',
    ], [], 'companion');
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
