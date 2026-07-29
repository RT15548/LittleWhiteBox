import {
    TAVERN_PET_CURRENT_MARKER,
    TAVERN_PET_CURIO_IDS,
    TAVERN_PET_EMOTIONS,
    TAVERN_PET_EVENT_IDS,
    TAVERN_PET_INTERACTION_IDS,
    TAVERN_PET_PERSONA_IDS,
    TAVERN_PET_PHASES,
    isTavernPetInterferenceEventId,
    type TavernPetActivityDetail,
    type TavernPetActivityDraft,
    type TavernPetActivityRecord,
    type TavernPetAxes,
    type TavernPetChatResponse,
    type TavernPetEvolutionRequest,
    type TavernPetInteractionWindow,
    type TavernPetLifetimeStats,
    type TavernPetOrigin,
    type TavernPetRandomDraw,
    type TavernPetState,
    type TavernPetStateAction,
    type TavernPetStateVersionRecord,
    type TavernPetTurnOutcome,
    throwTavernPetError,
} from './pet-types';
import { isTavernPetVerdictText } from './pet-copy';

const TAVERN_PET_MILESTONE_IDS = new Set(['arrival', 'hatch', 'adulthood', 'repattern']);

function assertVerdictText(value: unknown, detail: string, code: 'pet_state_invalid' | 'pet_activity_invalid'): void {
    if (typeof value !== 'string' || !isTavernPetVerdictText(value)) {
        throwTavernPetError(code, detail);
    }
}

export interface TavernPetInvariantViolation {
    code: 'state-invalid' | 'version-invalid' | 'activity-invalid';
    detail: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertPlainObject(
    value: unknown,
    required: readonly string[],
    optional: readonly string[],
    detail: string,
): Record<string, unknown> {
    if (!isRecord(value)) {throwTavernPetError('pet_state_invalid', `${detail}.shape`);}
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
        throwTavernPetError('pet_state_invalid', `${detail}.prototype`);
    }
    const keys = Object.keys(value);
    const allowed = new Set([...required, ...optional]);
    if (keys.some((key) => !allowed.has(key)) || required.some((key) => !keys.includes(key))) {
        throwTavernPetError('pet_state_invalid', `${detail}.keys`);
    }
    for (const key of optional) {
        if (keys.includes(key) && value[key] === undefined) {
            throwTavernPetError('pet_state_invalid', `${detail}.${key}.undefined`);
        }
    }
    return value;
}

function assertString(value: unknown, detail: string, maximum = 240, allowEmpty = false): string {
    if (typeof value !== 'string' || value !== value.trim() || (!allowEmpty && !value) || [...value].length > maximum) {
        throwTavernPetError('pet_state_invalid', detail);
    }
    return value;
}

function assertInteger(value: unknown, minimum: number, maximum: number, detail: string): number {
    if (!Number.isSafeInteger(value) || Number(value) < minimum || Number(value) > maximum) {
        throwTavernPetError('pet_state_invalid', detail);
    }
    return Number(value);
}

function assertBoolean(value: unknown, detail: string): boolean {
    if (typeof value !== 'boolean') {throwTavernPetError('pet_state_invalid', detail);}
    return value;
}

function assertEnum<T extends string>(value: unknown, values: readonly T[], detail: string): T {
    if (typeof value !== 'string' || !values.includes(value as T)) {
        throwTavernPetError('pet_state_invalid', detail);
    }
    return value as T;
}

function assertAxes(value: unknown, detail: string): asserts value is TavernPetAxes {
    const axes = assertPlainObject(value, ['tameness', 'generosity', 'brightness'], [], detail);
    assertInteger(axes.tameness, -100, 100, `${detail}.tameness`);
    assertInteger(axes.generosity, -100, 100, `${detail}.generosity`);
    assertInteger(axes.brightness, -100, 100, `${detail}.brightness`);
}

function assertBirthBiasAxes(value: unknown, detail: string): asserts value is TavernPetAxes {
    assertAxes(value, detail);
    for (const [key, axis] of Object.entries(value as TavernPetAxes)) {
        if (axis === 0 || Math.abs(axis) > 15) {throwTavernPetError('pet_state_invalid', `${detail}.${key}`);}
    }
}

function assertOrigin(value: unknown, detail: string): asserts value is TavernPetOrigin {
    const origin = assertPlainObject(value, ['specimenNumber', 'arrivalTurn', 'birthBias'], [], detail);
    assertInteger(origin.specimenNumber, 1, 999, `${detail}.specimenNumber`);
    assertInteger(origin.arrivalTurn, 1, Number.MAX_SAFE_INTEGER, `${detail}.arrivalTurn`);
    assertBirthBiasAxes(origin.birthBias, `${detail}.birthBias`);
}

function assertWindow(value: unknown, detail: string): asserts value is TavernPetInteractionWindow {
    const window = assertPlainObject(value, [
        'turn', 'feedCount', 'tapCount', 'bgmCount', 'patCount', 'annoyCount', 'chatCount', 'interactionCount',
    ], [], detail);
    assertInteger(window.turn, 0, Number.MAX_SAFE_INTEGER, `${detail}.turn`);
    assertInteger(window.feedCount, 0, Number.MAX_SAFE_INTEGER, `${detail}.feedCount`);
    assertInteger(window.tapCount, 0, 2, `${detail}.tapCount`);
    assertInteger(window.bgmCount, 0, 1, `${detail}.bgmCount`);
    assertInteger(window.patCount, 0, Number.MAX_SAFE_INTEGER, `${detail}.patCount`);
    assertInteger(window.annoyCount, 0, 4, `${detail}.annoyCount`);
    assertInteger(window.chatCount, 0, Number.MAX_SAFE_INTEGER, `${detail}.chatCount`);
    assertInteger(window.interactionCount, 0, Number.MAX_SAFE_INTEGER, `${detail}.interactionCount`);
}

function assertStats(value: unknown, detail: string): asserts value is TavernPetLifetimeStats {
    const stats = assertPlainObject(value, [
        'feedCount', 'tapCount', 'bgmCount', 'patCount', 'hitCount', 'toyCount', 'chatCount',
        'dormantCount', 'stolenTotal', 'giftedTotal',
    ], [], detail);
    for (const key of Object.keys(stats)) {
        assertInteger(stats[key], 0, Number.MAX_SAFE_INTEGER, `${detail}.${key}`);
    }
}

function assertEvolution(value: unknown, detail: string): asserts value is TavernPetEvolutionRequest {
    const request = assertPlainObject(value, [
        'requestId', 'milestoneId', 'personaId', 'axes', 'stats', 'turn', 'anchorOrder',
    ], ['previousPersonaId'], detail);
    assertString(request.requestId, `${detail}.requestId`, 240);
    assertEnum(request.milestoneId, ['adulthood', 'repattern'], `${detail}.milestoneId`);
    assertEnum(request.personaId, TAVERN_PET_PERSONA_IDS, `${detail}.personaId`);
    if (request.previousPersonaId !== undefined) {
        assertEnum(request.previousPersonaId, TAVERN_PET_PERSONA_IDS, `${detail}.previousPersonaId`);
    }
    assertAxes(request.axes, `${detail}.axes`);
    assertStats(request.stats, `${detail}.stats`);
    assertInteger(request.turn, 0, Number.MAX_SAFE_INTEGER, `${detail}.turn`);
    assertInteger(request.anchorOrder, 0, Number.MAX_SAFE_INTEGER, `${detail}.anchorOrder`);
}

function assertChatMemory(value: unknown, detail: string): void {
    const memory = assertPlainObject(value, ['summary', 'recent'], [], detail);
    assertString(memory.summary, `${detail}.summary`, 100, true);
    if (!Array.isArray(memory.recent) || memory.recent.length > 6) {
        throwTavernPetError('pet_state_invalid', `${detail}.recent`);
    }
    memory.recent.forEach((entry, index) => {
        const round = assertPlainObject(entry, ['playerText', 'petText'], [], `${detail}.recent.${index}`);
        assertString(round.playerText, `${detail}.recent.${index}.playerText`, 120);
        assertString(round.petText, `${detail}.recent.${index}.petText`, 120);
    });
}

function assertCooldowns(value: unknown, detail: string): void {
    const cooldowns = assertPlainObject(value, [], TAVERN_PET_EVENT_IDS, detail);
    for (const [eventId, remaining] of Object.entries(cooldowns)) {
        assertEnum(eventId, TAVERN_PET_EVENT_IDS, `${detail}.${eventId}.id`);
        if (TAVERN_PET_MILESTONE_IDS.has(eventId)) {
            throwTavernPetError('pet_state_invalid', `${detail}.${eventId}`);
        }
        assertInteger(remaining, 1, Number.MAX_SAFE_INTEGER, `${detail}.${eventId}`);
    }
}

function assertState(value: unknown): asserts value is TavernPetState {
    const state = assertPlainObject(value, [
        'phase', 'dormant', 'origin', 'phaseTurnCount', 'axes', 'satiety', 'emotion', 'emotionRemainingTurns',
        'nestCoins', 'curios', 'interactionWindow', 'idleTurns', 'observedEconomyLedgerOrder',
        'toyCooldownTurns', 'eventCooldowns', 'interferenceEnabled', 'interferenceGateTurns',
        'chatMemory', 'lifetimeStats',
    ], [
        'personaId', 'petName', 'incubation', 'beggingDeadlineTurn', 'lastFeedTurn',
        'lastEvolutionActiveTurn', 'pendingEvolution',
    ], 'state');
    const phase = assertEnum(state.phase, TAVERN_PET_PHASES, 'state.phase');
    const dormant = assertBoolean(state.dormant, 'state.dormant');
    assertOrigin(state.origin, 'state.origin');
    const phaseTurnCount = assertInteger(state.phaseTurnCount, 0, Number.MAX_SAFE_INTEGER, 'state.phaseTurnCount');
    assertAxes(state.axes, 'state.axes');
    const satiety = assertInteger(state.satiety, 0, 100, 'state.satiety');
    const emotion = assertEnum(state.emotion, TAVERN_PET_EMOTIONS, 'state.emotion');
    const emotionTurns = assertInteger(state.emotionRemainingTurns, 0, 5, 'state.emotionRemainingTurns');
    if ((emotion === 'calm' || emotion === 'bored') && emotionTurns !== 0) {
        throwTavernPetError('pet_state_invalid', 'state.emotionRemainingTurns');
    }
    if (state.personaId !== undefined) {assertEnum(state.personaId, TAVERN_PET_PERSONA_IDS, 'state.personaId');}
    if (state.petName !== undefined) {assertString(state.petName, 'state.petName', 12);}
    assertInteger(state.nestCoins, 0, Number.MAX_SAFE_INTEGER, 'state.nestCoins');
    if (!Array.isArray(state.curios) || new Set(state.curios).size !== state.curios.length) {
        throwTavernPetError('pet_state_invalid', 'state.curios');
    }
    state.curios.forEach((curio, index) => assertEnum(curio, TAVERN_PET_CURIO_IDS, `state.curios.${index}`));
    if (state.incubation !== undefined) {
        const incubation = assertPlainObject(state.incubation, ['feedCount', 'tapCount', 'bgmCount'], [], 'state.incubation');
        assertInteger(incubation.feedCount, 0, Number.MAX_SAFE_INTEGER, 'state.incubation.feedCount');
        assertInteger(incubation.tapCount, 0, Number.MAX_SAFE_INTEGER, 'state.incubation.tapCount');
        assertInteger(incubation.bgmCount, 0, Number.MAX_SAFE_INTEGER, 'state.incubation.bgmCount');
    }
    assertWindow(state.interactionWindow, 'state.interactionWindow');
    assertInteger(state.idleTurns, 0, Number.MAX_SAFE_INTEGER, 'state.idleTurns');
    assertInteger(state.observedEconomyLedgerOrder, -1, Number.MAX_SAFE_INTEGER, 'state.observedEconomyLedgerOrder');
    if (state.beggingDeadlineTurn !== undefined) {
        assertInteger(state.beggingDeadlineTurn, 0, Number.MAX_SAFE_INTEGER, 'state.beggingDeadlineTurn');
    }
    if (state.lastFeedTurn !== undefined) {assertInteger(state.lastFeedTurn, 0, Number.MAX_SAFE_INTEGER, 'state.lastFeedTurn');}
    assertInteger(state.toyCooldownTurns, 0, 3, 'state.toyCooldownTurns');
    assertCooldowns(state.eventCooldowns, 'state.eventCooldowns');
    assertBoolean(state.interferenceEnabled, 'state.interferenceEnabled');
    assertInteger(state.interferenceGateTurns, 0, 15, 'state.interferenceGateTurns');
    if (state.lastEvolutionActiveTurn !== undefined) {
        assertInteger(state.lastEvolutionActiveTurn, 0, Number.MAX_SAFE_INTEGER, 'state.lastEvolutionActiveTurn');
    }
    if (state.pendingEvolution !== undefined) {assertEvolution(state.pendingEvolution, 'state.pendingEvolution');}
    assertChatMemory(state.chatMemory, 'state.chatMemory');
    assertStats(state.lifetimeStats, 'state.lifetimeStats');

    const incubation = state.incubation as TavernPetState['incubation'];
    const personaId = state.personaId as TavernPetState['personaId'];
    const pendingEvolution = state.pendingEvolution as TavernPetState['pendingEvolution'];
    if (phase === 'luring') {
        if (dormant
            || satiety !== 0
            || state.phaseTurnCount !== 0
            || incubation !== undefined
            || personaId !== undefined
            || state.petName !== undefined
            || state.lastEvolutionActiveTurn !== undefined
            || pendingEvolution !== undefined
        ) {
            throwTavernPetError('pet_state_invalid', 'state.luring');
        }
    } else {
        if (dormant !== (satiety === 0)) {throwTavernPetError('pet_state_invalid', 'state.dormant-satiety');}
        if (phase === 'egg') {
            if (!incubation
                || personaId !== undefined
                || phaseTurnCount > 7
                || state.lastEvolutionActiveTurn !== undefined
                || pendingEvolution !== undefined
            ) {
                throwTavernPetError('pet_state_invalid', 'state.egg');
            }
        } else if (incubation !== undefined) {
            throwTavernPetError('pet_state_invalid', 'state.incubation-phase');
        }
        if (phase === 'juvenile' && (personaId !== undefined
            || phaseTurnCount > 39
            || state.lastEvolutionActiveTurn !== undefined
            || pendingEvolution !== undefined
        )) {
            throwTavernPetError('pet_state_invalid', 'state.juvenile-persona');
        }
        if (phase === 'adult' && (personaId === undefined || state.lastEvolutionActiveTurn === undefined)) {
            throwTavernPetError('pet_state_invalid', 'state.adult-persona');
        }
    }
    if (pendingEvolution && (phase !== 'adult' || pendingEvolution.personaId !== personaId)) {
        throwTavernPetError('pet_state_invalid', 'state.pendingEvolution.persona');
    }
    if (pendingEvolution?.milestoneId === 'adulthood' && pendingEvolution.previousPersonaId !== undefined) {
        throwTavernPetError('pet_state_invalid', 'state.pendingEvolution.previousPersonaId');
    }
    if (pendingEvolution?.milestoneId === 'repattern'
        && (!pendingEvolution.previousPersonaId || pendingEvolution.previousPersonaId === pendingEvolution.personaId)) {
        throwTavernPetError('pet_state_invalid', 'state.pendingEvolution.previousPersonaId');
    }
    if (phase === 'adult'
        && (Number(state.lastEvolutionActiveTurn) > phaseTurnCount
            || (pendingEvolution && pendingEvolution.turn > state.interactionWindow.turn))) {
        throwTavernPetError('pet_state_invalid', 'state.lastEvolutionActiveTurn');
    }
}

function assertChatResponse(value: unknown, detail: string): asserts value is TavernPetChatResponse {
    const response = assertPlainObject(value, [
        'face', 'text', 'motion', 'emotionShift', 'murmur', 'summaryUpdate',
    ], [], detail);
    assertString(response.face, `${detail}.face`, 80);
    assertString(response.text, `${detail}.text`, 120);
    assertEnum(response.motion, ['none', 'shake', 'bounce', 'turn-away', 'hide', 'approach', 'stare'], `${detail}.motion`);
    if (response.emotionShift !== null) {assertEnum(response.emotionShift, TAVERN_PET_EMOTIONS, `${detail}.emotionShift`);}
    if (response.murmur !== null) {assertString(response.murmur, `${detail}.murmur`, 30);}
    if (response.summaryUpdate !== null) {assertString(response.summaryUpdate, `${detail}.summaryUpdate`, 100);}
}

function assertActivityDetail(value: unknown, detail: string): asserts value is TavernPetActivityDetail {
    if (!isRecord(value)) {throwTavernPetError('pet_activity_invalid', `${detail}.shape`);}
    if (value.kind === 'event') {
        const eventId = assertEnum(value.eventId, TAVERN_PET_EVENT_IDS, `${detail}.eventId`);
        if (TAVERN_PET_MILESTONE_IDS.has(eventId)) {
            throwTavernPetError('pet_activity_invalid', `${detail}.eventId`);
        }
        const event = assertPlainObject(
            value,
            isTavernPetInterferenceEventId(eventId)
                ? ['kind', 'eventId', 'renderedText', 'face', 'motion', 'injectedText']
                : ['kind', 'eventId', 'renderedText', 'face', 'motion'],
            [],
            detail,
        );
        assertString(event.renderedText, `${detail}.renderedText`, 500);
        assertString(event.face, `${detail}.face`, 80);
        assertEnum(event.motion, ['none', 'shake', 'bounce', 'turn-away', 'hide', 'approach', 'stare'], `${detail}.motion`);
        if (isTavernPetInterferenceEventId(eventId)) {
            assertString(event.injectedText, `${detail}.injectedText`, 500);
        }
        return;
    }
    if (value.kind === 'milestone') {
        const milestone = assertPlainObject(value, [
            'kind', 'milestoneId', 'renderedText', 'motion', 'milestoneTurn', 'milestoneAnchor',
        ], ['personaId', 'verdict'], detail);
        assertEnum(milestone.milestoneId, ['arrival', 'hatch', 'adulthood', 'repattern'], `${detail}.milestoneId`);
        assertString(milestone.renderedText, `${detail}.renderedText`, 500);
        if (milestone.motion !== 'bounce') {throwTavernPetError('pet_activity_invalid', `${detail}.motion`);}
        assertInteger(milestone.milestoneTurn, 0, Number.MAX_SAFE_INTEGER, `${detail}.milestoneTurn`);
        assertInteger(milestone.milestoneAnchor, 0, Number.MAX_SAFE_INTEGER, `${detail}.milestoneAnchor`);
        if (milestone.personaId !== undefined) {assertEnum(milestone.personaId, TAVERN_PET_PERSONA_IDS, `${detail}.personaId`);}
        if (milestone.verdict !== undefined) {
            assertVerdictText(milestone.verdict, `${detail}.verdict`, 'pet_activity_invalid');
        }
        return;
    }
    if (value.kind === 'chat') {
        const chat = assertPlainObject(value, ['kind', 'playerText', 'petText', 'face', 'motion'], ['murmur'], detail);
        assertString(chat.playerText, `${detail}.playerText`, 120);
        assertString(chat.petText, `${detail}.petText`, 120);
        assertString(chat.face, `${detail}.face`, 80);
        assertEnum(chat.motion, ['none', 'shake', 'bounce', 'turn-away', 'hide', 'approach', 'stare'], `${detail}.motion`);
        if (chat.murmur !== undefined) {assertString(chat.murmur, `${detail}.murmur`, 30);}
        return;
    }
    if (value.kind === 'status') {
        const status = assertPlainObject(value, ['kind', 'status', 'renderedText', 'motion'], [], detail);
        assertEnum(status.status, ['dormant', 'woke'], `${detail}.status`);
        assertString(status.renderedText, `${detail}.renderedText`, 500);
        assertEnum(status.motion, ['none', 'shake', 'bounce', 'turn-away', 'hide', 'approach', 'stare'], `${detail}.motion`);
        return;
    }
    throwTavernPetError('pet_activity_invalid', `${detail}.kind`);
}

function assertActivityDraft(value: unknown, detail: string): asserts value is TavernPetActivityDraft {
    const draft = assertPlainObject(value, ['detail', 'coinDelta'], ['notificationText'], detail);
    assertActivityDetail(draft.detail, `${detail}.detail`);
    assertInteger(draft.coinDelta, -40, 40, `${detail}.coinDelta`);
    if (draft.notificationText !== undefined) {assertString(draft.notificationText, `${detail}.notificationText`, 240);}
}

function assertTurnOutcome(value: unknown, detail: string): asserts value is TavernPetTurnOutcome {
    const outcome = assertPlainObject(value, [], ['eventId', 'milestoneId', 'activity', 'coinEffect'], detail);
    if (outcome.eventId !== undefined) {assertEnum(outcome.eventId, TAVERN_PET_EVENT_IDS, `${detail}.eventId`);}
    if (outcome.milestoneId !== undefined) {
        assertEnum(outcome.milestoneId, ['arrival', 'hatch', 'adulthood', 'repattern'], `${detail}.milestoneId`);
    }
    if (outcome.activity !== undefined) {assertActivityDraft(outcome.activity, `${detail}.activity`);}
    if (outcome.coinEffect !== undefined) {
        const coin = assertPlainObject(outcome.coinEffect, [
            'amount', 'direction', 'kind', 'idempotencyKey', 'title', 'sourceId',
        ], [], `${detail}.coinEffect`);
        assertInteger(coin.amount, 1, 40, `${detail}.coinEffect.amount`);
        assertEnum(coin.direction, ['debit', 'credit'], `${detail}.coinEffect.direction`);
        assertEnum(coin.kind, ['pet_steal', 'pet_hoard', 'pet_find', 'pet_gift', 'pet_return'], `${detail}.coinEffect.kind`);
        assertString(coin.idempotencyKey, `${detail}.coinEffect.idempotencyKey`, 220);
        assertString(coin.title, `${detail}.coinEffect.title`, 140);
        assertString(coin.sourceId, `${detail}.coinEffect.sourceId`, 180);
    }
}

function assertRandomDraw(value: unknown, detail: string): asserts value is TavernPetRandomDraw {
    const draw = assertPlainObject(value, ['maxExclusive', 'value'], [], detail);
    const max = assertInteger(draw.maxExclusive, 1, Number.MAX_SAFE_INTEGER, `${detail}.maxExclusive`);
    assertInteger(draw.value, 0, max - 1, `${detail}.value`);
}

function assertAction(value: unknown): asserts value is TavernPetStateAction {
    if (!isRecord(value)) {throwTavernPetError('pet_state_invalid', 'action.shape');}
    if (value.kind === 'lure') {
        const action = assertPlainObject(value, ['kind', 'origin'], [], 'action');
        assertOrigin(action.origin, 'action.origin');
        return;
    }
    if (value.kind === 'interact') {
        const action = assertPlainObject(value, ['kind', 'interactionId'], [], 'action');
        const interaction = assertEnum(action.interactionId, TAVERN_PET_INTERACTION_IDS, 'action.interactionId');
        if (interaction === 'lure' || interaction === 'chat' || interaction === 'wake') {
            throwTavernPetError('pet_state_invalid', 'action.interactionId');
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
        const action = assertPlainObject(value, ['kind', 'context', 'randomDraws', 'outcome'], [], 'action');
        const context = assertPlainObject(action.context, [
            'turn', 'anchorOrder', 'latestEconomyLedgerOrder', 'recentExternalSpend',
            'playerBalance', 'knownTargetName', 'evolutionRequestId',
        ], [], 'action.context');
        assertInteger(context.turn, 0, Number.MAX_SAFE_INTEGER, 'action.context.turn');
        assertInteger(context.anchorOrder, 0, Number.MAX_SAFE_INTEGER, 'action.context.anchorOrder');
        assertInteger(context.latestEconomyLedgerOrder, -1, Number.MAX_SAFE_INTEGER, 'action.context.latestEconomyLedgerOrder');
        assertInteger(context.recentExternalSpend, 0, Number.MAX_SAFE_INTEGER, 'action.context.recentExternalSpend');
        assertInteger(context.playerBalance, 0, Number.MAX_SAFE_INTEGER, 'action.context.playerBalance');
        assertString(context.knownTargetName, 'action.context.knownTargetName', 40, true);
        assertString(context.evolutionRequestId, 'action.context.evolutionRequestId', 240);
        if (!Array.isArray(action.randomDraws)) {throwTavernPetError('pet_state_invalid', 'action.randomDraws');}
        action.randomDraws.forEach((draw, index) => assertRandomDraw(draw, `action.randomDraws.${index}`));
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
        assertVerdictText(action.verdict, 'action.verdict', 'pet_state_invalid');
        assertBoolean(action.usedFallback, 'action.usedFallback');
        return;
    }
    throwTavernPetError('pet_state_invalid', 'action.kind');
}

function cloneCanonical<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

export function assertTavernPetStateInvariant(state: TavernPetState): void {
    assertState(state);
}

export function parseCanonicalTavernPetStateVersionRecord(value: unknown): TavernPetStateVersionRecord {
    const record = assertPlainObject(value, [
        'sessionId', 'revision', 'versionId', 'actionId', 'action', 'anchorOrder', 'turn',
        'state', 'createdAt', 'updatedAt',
    ], ['currentMarker', 'activityId'], 'version');
    assertString(record.sessionId, 'version.sessionId', 240);
    assertInteger(record.revision, 1, Number.MAX_SAFE_INTEGER, 'version.revision');
    assertString(record.versionId, 'version.versionId', 240);
    if (record.currentMarker !== undefined && record.currentMarker !== TAVERN_PET_CURRENT_MARKER) {
        throwTavernPetError('pet_state_invalid', 'version.currentMarker');
    }
    assertString(record.actionId, 'version.actionId', 240);
    assertAction(record.action);
    if (record.activityId !== undefined) {assertString(record.activityId, 'version.activityId', 240);}
    assertInteger(record.anchorOrder, 0, Number.MAX_SAFE_INTEGER, 'version.anchorOrder');
    assertInteger(record.turn, 0, Number.MAX_SAFE_INTEGER, 'version.turn');
    assertState(record.state);
    assertInteger(record.createdAt, 0, Number.MAX_SAFE_INTEGER, 'version.createdAt');
    assertInteger(record.updatedAt, 0, Number.MAX_SAFE_INTEGER, 'version.updatedAt');
    if (record.action.kind === 'turn-advance') {
        if (record.action.context.turn !== record.turn || record.action.context.anchorOrder !== record.anchorOrder) {
            throwTavernPetError('pet_state_invalid', 'version.turn-context');
        }
    }
    return cloneCanonical(record as unknown as TavernPetStateVersionRecord);
}

export function parseCanonicalTavernPetActivityRecord(value: unknown): TavernPetActivityRecord {
    const record = assertPlainObject(value, [
        'sessionId', 'id', 'sourceActionId', 'turn', 'anchorOrder', 'detail', 'coinDelta', 'createdAt',
    ], ['notificationText'], 'activity');
    assertString(record.sessionId, 'activity.sessionId', 240);
    assertString(record.id, 'activity.id', 240);
    assertString(record.sourceActionId, 'activity.sourceActionId', 240);
    assertInteger(record.turn, 0, Number.MAX_SAFE_INTEGER, 'activity.turn');
    assertInteger(record.anchorOrder, 0, Number.MAX_SAFE_INTEGER, 'activity.anchorOrder');
    assertActivityDetail(record.detail, 'activity.detail');
    assertInteger(record.coinDelta, -40, 40, 'activity.coinDelta');
    if (record.notificationText !== undefined) {assertString(record.notificationText, 'activity.notificationText', 240);}
    assertInteger(record.createdAt, 0, Number.MAX_SAFE_INTEGER, 'activity.createdAt');
    return cloneCanonical(record as unknown as TavernPetActivityRecord);
}

export function assertTavernPetActivityInvariant(activity: TavernPetActivityRecord): void {
    parseCanonicalTavernPetActivityRecord(activity);
}

export function findTavernPetStateInvariantViolation(state: unknown): TavernPetInvariantViolation | null {
    try {
        assertState(state);
        return null;
    } catch (error) {
        return { code: 'state-invalid', detail: error instanceof Error ? error.message : String(error || 'invalid') };
    }
}

export function findTavernPetActivityInvariantViolation(activity: unknown): TavernPetInvariantViolation | null {
    try {
        parseCanonicalTavernPetActivityRecord(activity);
        return null;
    } catch (error) {
        return { code: 'activity-invalid', detail: error instanceof Error ? error.message : String(error || 'invalid') };
    }
}
