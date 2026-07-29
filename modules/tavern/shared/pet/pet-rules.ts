import {
    collectTavernPetEventCandidates,
    getTavernPetEvent,
} from './pet-events';
import {
    renderTavernPetEventCopy,
    renderTavernPetInterferenceText,
    renderTavernPetMilestoneActivity,
    renderTavernPetStatusActivity,
    TAVERN_PET_REGULAR_CURIO_IDS,
} from './pet-copy';
import {
    getTavernPetDialogueProfile,
    tavernPetFaceForEmotion,
} from './pet-personas';
import { normalizeTavernPetChatResponse } from './pet-chat';
import {
    drawTavernPetInclusiveInteger,
    drawWeightedTavernPetEventCandidate,
    tavernPetProbabilityPasses,
    type TavernPetRandomSource,
} from './pet-random';
import {
    isTavernPetInterferenceEventId,
    type TavernPetAxes,
    type TavernPetChatResponse,
    type TavernPetEmotion,
    type TavernPetEventId,
    type TavernPetInteractionId,
    type TavernPetInteractionWindow,
    type TavernPetLifetimeStats,
    type TavernPetOrigin,
    type TavernPetPersonaId,
    type TavernPetState,
    type TavernPetTurnContext,
    type TavernPetTurnOutcome,
    type TavernPetTurnTransition,
    throwTavernPetError,
} from './pet-types';

export const TAVERN_PET_INTERACTION_COSTS: Readonly<Record<TavernPetInteractionId, number>> = Object.freeze({
    lure: 10,
    feed: 10,
    'tap-shell': 0,
    'play-bgm': 0,
    pat: 0,
    hit: 0,
    toy: 20,
    chat: 0,
    wake: 50,
});

function clone<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function assertTurn(value: unknown): number {
    const turn = Number(value);
    if (!Number.isSafeInteger(turn) || turn < 0) {throwTavernPetError('pet_turn_invalid', String(value));}
    return turn;
}

function emptyAxes(): TavernPetAxes {
    return { tameness: 0, generosity: 0, brightness: 0 };
}

function emptyStats(): TavernPetLifetimeStats {
    return {
        feedCount: 0,
        tapCount: 0,
        bgmCount: 0,
        patCount: 0,
        hitCount: 0,
        toyCount: 0,
        chatCount: 0,
        dormantCount: 0,
        stolenTotal: 0,
        giftedTotal: 0,
    };
}

export function createTavernPetInteractionWindow(turn: number): TavernPetInteractionWindow {
    return {
        turn: assertTurn(turn),
        feedCount: 0,
        tapCount: 0,
        bgmCount: 0,
        patCount: 0,
        annoyCount: 0,
        chatCount: 0,
        interactionCount: 0,
    };
}

export function createTavernPetLuringState(input: {
    origin: TavernPetOrigin;
    currentTurn: number;
    observedEconomyLedgerOrder: number;
}): TavernPetState {
    return {
        phase: 'luring',
        dormant: false,
        origin: clone(input.origin),
        phaseTurnCount: 0,
        axes: emptyAxes(),
        satiety: 0,
        emotion: 'calm',
        emotionRemainingTurns: 0,
        nestCoins: 0,
        curios: [],
        interactionWindow: createTavernPetInteractionWindow(input.currentTurn),
        idleTurns: 0,
        observedEconomyLedgerOrder: input.observedEconomyLedgerOrder,
        toyCooldownTurns: 0,
        eventCooldowns: {},
        interferenceEnabled: true,
        interferenceGateTurns: 0,
        chatMemory: { summary: '', recent: [] },
        lifetimeStats: emptyStats(),
    };
}

export function clampTavernPetAxis(value: number): number {
    if (!Number.isSafeInteger(value)) {throwTavernPetError('pet_state_invalid', `axis:${String(value)}`);}
    return Math.max(-100, Math.min(100, value));
}

function adultAdjustedDelta(value: number): number {
    return value === 0 ? 0 : Math.trunc(value / 2);
}

export function applyTavernPetAxesDelta(
    state: TavernPetState,
    delta: TavernPetAxes,
    options: { ignoreAge?: boolean } = {},
): void {
    const effective = options.ignoreAge || state.phase !== 'adult'
        ? delta
        : {
            tameness: adultAdjustedDelta(delta.tameness),
            generosity: adultAdjustedDelta(delta.generosity),
            brightness: adultAdjustedDelta(delta.brightness),
        };
    state.axes = {
        tameness: clampTavernPetAxis(state.axes.tameness + effective.tameness),
        generosity: clampTavernPetAxis(state.axes.generosity + effective.generosity),
        brightness: clampTavernPetAxis(state.axes.brightness + effective.brightness),
    };
}

function emotionDuration(emotion: TavernPetEmotion): number {
    return {
        calm: 0,
        happy: 3,
        aggrieved: 4,
        resentful: 5,
        excited: 2,
        bored: 0,
    }[emotion];
}

export function tavernPetBaselineEmotion(state: TavernPetState): TavernPetEmotion {
    if (state.axes.brightness < -60) {return 'bored';}
    if (state.axes.tameness < -60) {return 'resentful';}
    if (state.axes.brightness > 60) {return 'happy';}
    return 'calm';
}

export function setTavernPetEmotion(state: TavernPetState, emotion: TavernPetEmotion): void {
    state.emotion = emotion;
    state.emotionRemainingTurns = emotionDuration(emotion);
}

function resetEmotionToBaseline(state: TavernPetState): void {
    state.emotion = tavernPetBaselineEmotion(state);
    state.emotionRemainingTurns = 0;
}

function currentWindow(state: TavernPetState, currentTurn: number): TavernPetInteractionWindow {
    if (state.interactionWindow.turn !== currentTurn) {
        state.interactionWindow = createTavernPetInteractionWindow(currentTurn);
    }
    return state.interactionWindow;
}

export function deriveTavernPetPersona(state: Pick<TavernPetState, 'axes' | 'origin'>): TavernPetPersonaId {
    const axes = state.axes;
    if (Math.abs(axes.tameness) <= 20 && Math.abs(axes.generosity) <= 20 && Math.abs(axes.brightness) <= 20) {
        return 'blank';
    }
    const sign = (value: number, bias: number) => value > 20 ? '+' : value < -20 ? '-' : bias > 0 ? '+' : '-';
    const key = `${sign(axes.tameness, state.origin.birthBias.tameness)}${sign(axes.generosity, state.origin.birthBias.generosity)}${sign(axes.brightness, state.origin.birthBias.brightness)}`;
    const personas: Record<string, TavernPetPersonaId> = {
        '+++': 'sunlet',
        '++-': 'rain-courier',
        '+-+': 'ledger-keeper',
        '+--': 'under-bed-hoarder',
        '-++': 'wanderer',
        '-+-': 'lone-blade',
        '--+': 'merry-bandit',
        '---': 'abyss-tenant',
    };
    return personas[key];
}

export function tavernPetInteractionUnavailableReason(
    state: TavernPetState | null,
    interactionId: TavernPetInteractionId,
    currentTurn: number,
    playerBalance: number,
): string {
    if (!state) {
        if (interactionId !== 'lure') {return '它还没有出现';}
        return playerBalance < TAVERN_PET_INTERACTION_COSTS.lure ? '小白币不足' : '';
    }
    if (state.phase === 'luring') {return '房间里还没有东西';}
    if (state.dormant) {
        if (interactionId !== 'wake') {return '它睡着了';}
        return playerBalance < TAVERN_PET_INTERACTION_COSTS.wake ? '小白币不足' : '';
    }
    if (interactionId === 'lure' || interactionId === 'wake') {return '现在不能这样做';}
    const window = state.interactionWindow.turn === currentTurn
        ? state.interactionWindow
        : createTavernPetInteractionWindow(currentTurn);
    if (interactionId === 'feed') {
        if (state.satiety >= 100) {return '已经吃不下了';}
        return playerBalance < TAVERN_PET_INTERACTION_COSTS.feed ? '小白币不足' : '';
    }
    if (interactionId === 'tap-shell') {
        if (state.phase !== 'egg') {return '现在没有蛋壳可敲';}
        return window.tapCount >= 2 ? '它不想再被敲了' : '';
    }
    if (interactionId === 'play-bgm') {
        if (state.phase !== 'egg') {return '它已经不住在壳里了';}
        return window.bgmCount >= 1 ? '这一回合已经放过了' : '';
    }
    if (interactionId === 'pat' || interactionId === 'hit' || interactionId === 'toy' || interactionId === 'chat') {
        if (state.phase !== 'juvenile' && state.phase !== 'adult') {return interactionId === 'chat' ? '它还不会说话' : '它还没有破壳';}
    }
    if (interactionId === 'toy') {
        if (state.toyCooldownTurns > 0) {return '它暂时不想玩';}
        return playerBalance < TAVERN_PET_INTERACTION_COSTS.toy ? '小白币不足' : '';
    }
    return '';
}

export interface TavernPetInteractionTransition {
    state: TavernPetState;
    appliedAxes: boolean;
}

export function applyTavernPetInteraction(
    source: TavernPetState,
    interactionId: Exclude<TavernPetInteractionId, 'lure' | 'chat' | 'wake'>,
    currentTurn: number,
): TavernPetInteractionTransition {
    const turn = assertTurn(currentTurn);
    const state = clone(source);
    const reason = tavernPetInteractionUnavailableReason(state, interactionId, turn, Number.MAX_SAFE_INTEGER);
    if (reason) {throwTavernPetError('pet_interaction_unavailable', `${interactionId}:${reason}`);}
    const window = currentWindow(state, turn);
    let appliedAxes = false;
    window.interactionCount += 1;
    if (interactionId === 'feed') {
        state.satiety = Math.min(100, state.satiety + 30);
        window.feedCount += 1;
        state.lastFeedTurn = turn;
        delete state.beggingDeadlineTurn;
        state.lifetimeStats.feedCount += 1;
        if (state.phase === 'egg') {
            state.incubation!.feedCount += 1;
        } else {
            applyTavernPetAxesDelta(state, { tameness: 2, generosity: -2, brightness: 2 });
            appliedAxes = true;
        }
        setTavernPetEmotion(state, 'happy');
    } else if (interactionId === 'tap-shell') {
        window.tapCount += 1;
        state.incubation!.tapCount += 1;
        state.lifetimeStats.tapCount += 1;
    } else if (interactionId === 'play-bgm') {
        window.bgmCount += 1;
        state.incubation!.bgmCount += 1;
        state.lifetimeStats.bgmCount += 1;
    } else if (interactionId === 'pat') {
        window.patCount += 1;
        state.lifetimeStats.patCount += 1;
        if (window.patCount <= 2) {
            applyTavernPetAxesDelta(state, { tameness: 4, generosity: 0, brightness: 2 });
            setTavernPetEmotion(state, 'happy');
            appliedAxes = true;
        } else {
            window.annoyCount += 1;
            if (window.annoyCount >= 5) {
                window.annoyCount = 0;
                setTavernPetEmotion(state, 'resentful');
            }
        }
    } else if (interactionId === 'hit') {
        state.lifetimeStats.hitCount += 1;
        applyTavernPetAxesDelta(state, { tameness: -4, generosity: -2, brightness: -2 });
        setTavernPetEmotion(state, 'resentful');
        appliedAxes = true;
    } else if (interactionId === 'toy') {
        state.lifetimeStats.toyCount += 1;
        state.toyCooldownTurns = 3;
        applyTavernPetAxesDelta(state, { tameness: 2, generosity: 2, brightness: 4 });
        setTavernPetEmotion(state, 'happy');
        appliedAxes = true;
    }
    return { state, appliedAxes };
}

export function wakeTavernPetState(source: TavernPetState, currentTurn: number): TavernPetState {
    const state = clone(source);
    if (!state.dormant) {throwTavernPetError('pet_not_dormant');}
    state.dormant = false;
    state.satiety = 30;
    applyTavernPetAxesDelta(state, { tameness: -6, generosity: 0, brightness: -10 }, { ignoreAge: true });
    resetEmotionToBaseline(state);
    state.interactionWindow = createTavernPetInteractionWindow(currentTurn);
    return state;
}

export function renameTavernPetState(source: TavernPetState, petName?: string): TavernPetState {
    const state = clone(source);
    if (petName) {state.petName = petName;} else {delete state.petName;}
    return state;
}

export function setTavernPetInterferenceState(source: TavernPetState, enabled: boolean): TavernPetState {
    const state = clone(source);
    state.interferenceEnabled = enabled;
    return state;
}

export function applyTavernPetChatResponse(
    source: TavernPetState,
    currentTurn: number,
    playerText: string,
    response: TavernPetChatResponse,
): TavernPetInteractionTransition {
    const state = clone(source);
    const reason = tavernPetInteractionUnavailableReason(state, 'chat', currentTurn, Number.MAX_SAFE_INTEGER);
    if (reason) {throwTavernPetError('pet_chat_unavailable', reason);}
    const canonicalResponse = normalizeTavernPetChatResponse(response, state);
    const window = currentWindow(state, currentTurn);
    const appliedAxes = window.chatCount === 0;
    window.chatCount += 1;
    window.interactionCount += 1;
    state.lifetimeStats.chatCount += 1;
    if (appliedAxes) {applyTavernPetAxesDelta(state, { tameness: 2, generosity: 2, brightness: 2 });}
    setTavernPetEmotion(state, canonicalResponse.emotionShift || 'happy');
    state.chatMemory.recent = [
        ...state.chatMemory.recent,
        { playerText, petText: canonicalResponse.text },
    ].slice(-6);
    if (canonicalResponse.summaryUpdate !== null) {state.chatMemory.summary = canonicalResponse.summaryUpdate;}
    return { state, appliedAxes };
}

function decrementCooldowns(state: TavernPetState): void {
    state.toyCooldownTurns = Math.max(0, state.toyCooldownTurns - 1);
    state.interferenceGateTurns = Math.max(0, state.interferenceGateTurns - 1);
    const next: Partial<Record<TavernPetEventId, number>> = {};
    for (const [eventId, remaining] of Object.entries(state.eventCooldowns) as Array<[TavernPetEventId, number]>) {
        const value = Math.max(0, remaining - 1);
        if (value > 0) {next[eventId] = value;}
    }
    state.eventCooldowns = next;
}

function decayEmotion(state: TavernPetState, random: TavernPetRandomSource): void {
    if (state.emotion === 'calm' || state.emotion === 'bored') {return;}
    state.emotionRemainingTurns = Math.max(0, state.emotionRemainingTurns - 1);
    if (state.emotionRemainingTurns > 0) {return;}
    if (state.emotion === 'aggrieved' && tavernPetProbabilityPasses(30, random)) {
        setTavernPetEmotion(state, 'resentful');
        return;
    }
    resetEmotionToBaseline(state);
}

function settleIncubation(state: TavernPetState): void {
    const incubation = state.incubation || { feedCount: 0, tapCount: 0, bgmCount: 0 };
    applyTavernPetAxesDelta(state, {
        tameness: Math.min(incubation.feedCount, 5) * 2 - Math.min(incubation.tapCount, 5) * 2,
        generosity: 0,
        brightness: Math.min(incubation.bgmCount, 3) * 2,
    }, { ignoreAge: true });
    delete state.incubation;
}

function buildEvolutionRequest(
    state: TavernPetState,
    context: TavernPetTurnContext,
    milestoneId: 'adulthood' | 'repattern',
    previousPersonaId?: TavernPetPersonaId,
): void {
    state.pendingEvolution = {
        requestId: context.evolutionRequestId,
        milestoneId,
        personaId: state.personaId!,
        ...(previousPersonaId ? { previousPersonaId } : {}),
        axes: clone(state.axes),
        stats: clone(state.lifetimeStats),
        turn: context.turn,
        anchorOrder: context.anchorOrder,
    };
}

function advancePhaseMilestone(state: TavernPetState, context: TavernPetTurnContext): TavernPetTurnOutcome | null {
    if (state.phase === 'egg' && state.phaseTurnCount >= 8) {
        settleIncubation(state);
        state.phase = 'juvenile';
        state.phaseTurnCount = 0;
        setTavernPetEmotion(state, 'excited');
        return {
            milestoneId: 'hatch',
            eventId: 'hatch',
            activity: renderTavernPetMilestoneActivity({
                milestoneId: 'hatch', state, turn: context.turn, anchorOrder: context.anchorOrder,
            }),
        };
    }
    if (state.phase === 'juvenile' && state.phaseTurnCount >= 40) {
        const personaId = deriveTavernPetPersona(state);
        state.phase = 'adult';
        state.phaseTurnCount = 0;
        state.personaId = personaId;
        state.lastEvolutionActiveTurn = 0;
        setTavernPetEmotion(state, 'excited');
        buildEvolutionRequest(state, context, 'adulthood');
        return { milestoneId: 'adulthood', eventId: 'adulthood' };
    }
    if (state.phase === 'adult') {
        const derived = deriveTavernPetPersona(state);
        const lastEvolutionActiveTurn = state.lastEvolutionActiveTurn ?? 0;
        if (!state.pendingEvolution
            && derived !== state.personaId
            && state.phaseTurnCount - lastEvolutionActiveTurn >= 30
        ) {
            const previousPersonaId = state.personaId;
            state.personaId = derived;
            state.lastEvolutionActiveTurn = state.phaseTurnCount;
            setTavernPetEmotion(state, 'excited');
            buildEvolutionRequest(state, context, 'repattern', previousPersonaId);
            return { milestoneId: 'repattern', eventId: 'repattern' };
        }
    }
    return null;
}

function eventChance(state: TavernPetState): number {
    let chance = 30;
    if (state.satiety >= 1 && state.satiety <= 29) {chance += 10;}
    if (state.emotion === 'excited' || state.emotion === 'bored') {chance += 5;}
    return Math.min(45, chance);
}

type TavernPetRegularEventId = Exclude<
    TavernPetEventId,
    'arrival' | 'hatch' | 'adulthood' | 'repattern'
>;

function isTavernPetRegularEventId(eventId: TavernPetEventId): eventId is TavernPetRegularEventId {
    return eventId !== 'arrival'
        && eventId !== 'hatch'
        && eventId !== 'adulthood'
        && eventId !== 'repattern';
}

function applyEventEffect(
    state: TavernPetState,
    eventId: TavernPetEventId,
    context: TavernPetTurnContext,
    random: TavernPetRandomSource,
): TavernPetTurnOutcome {
    const spec = getTavernPetEvent(eventId);
    if (!isTavernPetRegularEventId(eventId) || spec.category === 'milestone') {
        throwTavernPetError('pet_state_invalid', `event:${eventId}`);
    }
    if (state.phase !== 'juvenile' && state.phase !== 'adult') {
        throwTavernPetError('pet_phase_invalid', state.phase);
    }
    let amount: number | undefined;
    let curioId: (typeof state.curios)[number] | undefined;
    let coinDelta = 0;
    let coinEffect: TavernPetTurnOutcome['coinEffect'];
    let injectedText: string | undefined;
    if (spec.effect.kind === 'emotion') {
        setTavernPetEmotion(state, spec.effect.emotion);
    } else if (spec.effect.kind === 'beg') {
        state.beggingDeadlineTurn = context.turn + 2;
    } else if (spec.effect.kind === 'steal') {
        amount = drawTavernPetInclusiveInteger(spec.effect.minimum, spec.effect.maximum, random);
        coinDelta = -amount;
        state.lifetimeStats.stolenTotal += amount;
        coinEffect = {
            amount,
            direction: 'debit',
            kind: spec.effect.ledgerKind,
            idempotencyKey: `pet:event:${context.turn}:${eventId}`,
            title: '住户拿走小白币',
            sourceId: eventId,
        };
    } else if (spec.effect.kind === 'hoard') {
        amount = spec.effect.amount;
        coinDelta = -amount;
        state.nestCoins += amount;
        state.lifetimeStats.stolenTotal += amount;
        coinEffect = {
            amount,
            direction: 'debit',
            kind: spec.effect.ledgerKind,
            idempotencyKey: `pet:event:${context.turn}:${eventId}`,
            title: '住户窝藏小白币',
            sourceId: eventId,
        };
    } else if (spec.effect.kind === 'gift') {
        amount = drawTavernPetInclusiveInteger(spec.effect.minimum, spec.effect.maximum, random);
        coinDelta = amount;
        state.lifetimeStats.giftedTotal += amount;
        coinEffect = {
            amount,
            direction: 'credit',
            kind: spec.effect.ledgerKind,
            idempotencyKey: `pet:event:${context.turn}:${eventId}`,
            title: spec.effect.ledgerKind === 'pet_find' ? '住户带回小白币' : '住户赠送小白币',
            sourceId: eventId,
        };
    } else if (spec.effect.kind === 'return-cache') {
        amount = drawTavernPetInclusiveInteger(1, Math.min(20, state.nestCoins), random);
        coinDelta = amount;
        state.nestCoins -= amount;
        state.lifetimeStats.giftedTotal += amount;
        coinEffect = {
            amount,
            direction: 'credit',
            kind: 'pet_return',
            idempotencyKey: `pet:return:${context.turn}:${eventId}`,
            title: '住户归还窝藏小白币',
            sourceId: eventId,
        };
    } else if (spec.effect.kind === 'pocket-change') {
        amount = drawTavernPetInclusiveInteger(1, 5, random);
        coinDelta = amount;
        state.lifetimeStats.giftedTotal += amount;
        coinEffect = {
            amount,
            direction: 'credit',
            kind: 'pet_find',
            idempotencyKey: `pet:event:${context.turn}:${eventId}`,
            title: '住户捡回小白币',
            sourceId: eventId,
        };
    } else if (spec.effect.kind === 'curio') {
        if (spec.effect.source === 'dry-flower') {
            curioId = 'dry-flower';
        } else {
            const missing = TAVERN_PET_REGULAR_CURIO_IDS.filter((id) => !state.curios.includes(id));
            curioId = missing[random.nextInt(missing.length)];
        }
        state.curios = [...state.curios, curioId];
    } else if (spec.effect.kind === 'interference') {
        injectedText = renderTavernPetInterferenceText(
            spec.effect.templateId,
            eventId === 'nibble-sleeve' ? context.knownTargetName : '',
        );
        state.interferenceGateTurns = 15;
    }
    state.eventCooldowns[eventId] = spec.cooldownTurns;
    const face = tavernPetFaceForEmotion(state.phase, state.personaId, state.emotion);
    const copyInput = {
        state,
        amount,
        curioId,
        targetName: context.knownTargetName,
        face,
        coinDelta,
    };
    const activity = isTavernPetInterferenceEventId(eventId)
        ? renderTavernPetEventCopy({
            ...copyInput,
            eventId,
            injectedText: injectedText || throwTavernPetError('pet_state_invalid', `event:${eventId}:injectedText`),
        })
        : renderTavernPetEventCopy({ ...copyInput, eventId });
    return {
        eventId,
        activity,
        ...(coinEffect ? { coinEffect } : {}),
    };
}

export function advanceTavernPetTurn(
    source: TavernPetState,
    context: TavernPetTurnContext,
    random: TavernPetRandomSource,
): TavernPetTurnTransition {
    const turn = assertTurn(context.turn);
    if (turn <= source.interactionWindow.turn && source.phase !== 'luring') {
        throwTavernPetError('pet_turn_regression', `${turn}<=${source.interactionWindow.turn}`);
    }
    const state = clone(source);
    if (state.phase === 'luring') {
        if (turn < state.origin.arrivalTurn) {return { changed: false, state, outcome: {} };}
        state.phase = 'egg';
        state.phaseTurnCount = 0;
        state.satiety = 50;
        state.incubation = { feedCount: 0, tapCount: 0, bgmCount: 0 };
        state.interactionWindow = createTavernPetInteractionWindow(turn);
        state.observedEconomyLedgerOrder = context.latestEconomyLedgerOrder;
        const activity = renderTavernPetMilestoneActivity({
            milestoneId: 'arrival', state, turn, anchorOrder: context.anchorOrder,
        });
        return { changed: true, state, outcome: { eventId: 'arrival', milestoneId: 'arrival', activity } };
    }
    if (state.dormant) {return { changed: false, state, outcome: {} };}

    const previousWindow = clone(state.interactionWindow);
    const hadInteraction = previousWindow.interactionCount > 0;
    const wasFed = previousWindow.feedCount > 0;
    decrementCooldowns(state);
    state.observedEconomyLedgerOrder = context.latestEconomyLedgerOrder;
    state.satiety = Math.max(0, state.satiety - 3);
    if (state.satiety === 0) {
        state.dormant = true;
        state.lifetimeStats.dormantCount += 1;
        state.interactionWindow = createTavernPetInteractionWindow(turn);
        return {
            changed: true,
            state,
            outcome: { activity: renderTavernPetStatusActivity('dormant', state) },
        };
    }

    decayEmotion(state, random);
    if (state.phase === 'egg') {
        state.idleTurns = 0;
    } else {
        state.idleTurns = hadInteraction ? 0 : state.idleTurns + 1;
        if (!hadInteraction && state.idleTurns % 5 === 0) {
            applyTavernPetAxesDelta(state, { tameness: -2, generosity: 0, brightness: -2 });
        }
        if (!hadInteraction && state.idleTurns >= 8) {setTavernPetEmotion(state, 'bored');}
        if (state.beggingDeadlineTurn !== undefined && turn >= state.beggingDeadlineTurn) {
            applyTavernPetAxesDelta(state, { tameness: -2, generosity: -2, brightness: -2 });
            delete state.beggingDeadlineTurn;
            setTavernPetEmotion(state, 'aggrieved');
        }
        if (context.recentExternalSpend > 0 && !wasFed) {
            applyTavernPetAxesDelta(state, { tameness: 0, generosity: -2, brightness: -2 });
        }
    }
    state.phaseTurnCount += 1;
    state.interactionWindow = createTavernPetInteractionWindow(turn);
    const milestone = advancePhaseMilestone(state, context);
    if (milestone) {return { changed: true, state, outcome: milestone };}
    if (state.phase === 'egg') {return { changed: true, state, outcome: {} };}

    const candidates = collectTavernPetEventCandidates({
        state,
        playerBalance: context.playerBalance,
        recentExternalSpend: context.recentExternalSpend,
        knownTargetName: context.knownTargetName,
    });
    if (!candidates.length || !tavernPetProbabilityPasses(eventChance(state), random)) {
        return { changed: true, state, outcome: {} };
    }
    const selected = drawWeightedTavernPetEventCandidate(candidates, random);
    const outcome = applyEventEffect(state, selected.spec.id, context, random);
    return { changed: true, state, outcome };
}

export function resolveTavernPetEvolutionState(source: TavernPetState, requestId: string): TavernPetState {
    const state = clone(source);
    if (!state.pendingEvolution || state.pendingEvolution.requestId !== requestId) {
        throwTavernPetError('pet_evolution_stale', requestId);
    }
    delete state.pendingEvolution;
    return state;
}

export function currentTavernPetDialogueProfile(state: TavernPetState) {
    if (state.phase !== 'juvenile' && state.phase !== 'adult') {return null;}
    return getTavernPetDialogueProfile(state.phase, state.personaId);
}
