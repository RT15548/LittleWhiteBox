import {
    getTavernPetMomentCopy,
    renderTavernPetEventCopy,
    renderTavernPetInterferenceText,
    renderTavernPetMomentJournal,
    TAVERN_PET_REGULAR_CURIO_IDS,
} from './pet-copy';
import { collectTavernPetEventCandidates, getTavernPetEvent } from './pet-events';
import {
    getTavernPetDialogueProfile,
    tavernPetFaceForEmotion,
} from './pet-personas';
import {
    drawTavernPetInclusiveInteger,
    drawWeightedTavernPetEventCandidate,
    tavernPetProbabilityPasses,
    type TavernPetRandomSource,
} from './pet-random';
import {
    type TavernPetChatResponse,
    type TavernPetEmotion,
    type TavernPetEventId,
    type TavernPetGiftId,
    type TavernPetInteractionId,
    type TavernPetJournalDraft,
    type TavernPetMomentChoiceId,
    type TavernPetMomentId,
    type TavernPetPersonaId,
    type TavernPetState,
    type TavernPetTurnContext,
    type TavernPetTurnOutcome,
    type TavernPetTurnTransition,
    isTavernPetInterferenceEventId,
    throwTavernPetError,
} from './pet-types';

export const TAVERN_PET_INTERACTION_COSTS: Readonly<Record<TavernPetInteractionId, number>> = Object.freeze({
    lure: 10,
    feed: 10,
    toy: 20,
    chat: 0,
});

const JUVENILE_ACTIVE_TURNS = 24;
const ADULTHOOD_PET_TURN = JUVENILE_ACTIVE_TURNS + 1;
const MOMENT_INTERVAL_TURNS = 6;
const EVOLUTION_COOLDOWN_PET_TURNS = 30;
const BLANK_PERSONA_BALANCE_THRESHOLD = 5;
const MOMENT_ORDER = ['glass-hand', 'bottle-cap', 'quiet-corner'] as const;

function clone<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function clampTrait(value: number): number {
    return Math.max(-100, Math.min(100, Math.trunc(value)));
}

function assertPetTurn(value: unknown): number {
    if (!Number.isSafeInteger(value) || Number(value) < 0) {
        throwTavernPetError('pet_turn_invalid', String(value));
    }
    return Number(value);
}

function isActivePhase(state: TavernPetState): state is TavernPetState & { phase: 'juvenile' | 'adult' } {
    return state.phase === 'juvenile' || state.phase === 'adult';
}

function nextMomentId(momentCount: number): TavernPetMomentId {
    return MOMENT_ORDER[momentCount % MOMENT_ORDER.length];
}

function momentTraitDelta(momentId: TavernPetMomentId, choiceId: TavernPetMomentChoiceId): number {
    const option = getTavernPetMomentCopy(momentId).options.find((entry) => entry.id === choiceId);
    if (!option) {throwTavernPetError('pet_moment_stale', `${momentId}:${choiceId}`);}
    return option.traitDelta;
}

function appendMomentMemory(state: TavernPetState, momentId: TavernPetMomentId, choiceId: TavernPetMomentChoiceId): void {
    const option = getTavernPetMomentCopy(momentId).options.find((entry) => entry.id === choiceId);
    if (!option) {throwTavernPetError('pet_moment_stale', `${momentId}:${choiceId}`);}
    state.chatMemory.moments = [...state.chatMemory.moments, option.memory].slice(-12);
}

function decrementCooldowns(state: TavernPetState): void {
    const next: Partial<Record<TavernPetEventId, number>> = {};
    for (const [eventId, remaining] of Object.entries(state.eventCooldowns) as Array<[TavernPetEventId, number]>) {
        const nextRemaining = Math.max(0, remaining - 1);
        if (nextRemaining > 0) {next[eventId] = nextRemaining;}
    }
    state.eventCooldowns = next;
}

export function tavernPetBaselineEmotion(_state: TavernPetState): TavernPetEmotion {
    return 'calm';
}

export function setTavernPetEmotion(state: TavernPetState, emotion: TavernPetEmotion): void {
    state.emotion = emotion;
    state.emotionRemainingTurns = emotion === 'calm' || emotion === 'bored' ? 0 : 3;
}

function decayEmotion(state: TavernPetState): void {
    if (state.emotion === 'calm' || state.emotion === 'bored') {return;}
    state.emotionRemainingTurns = Math.max(0, state.emotionRemainingTurns - 1);
    if (state.emotionRemainingTurns === 0) {state.emotion = tavernPetBaselineEmotion(state);}
}

export function createTavernPetEggState(input: {
    origin: TavernPetState['origin'];
    petTurn?: number;
}): TavernPetState {
    const petTurn = assertPetTurn(input.petTurn ?? 0);
    return {
        petTurn,
        phase: 'egg',
        origin: clone(input.origin),
        traits: clone(input.origin.birthBias),
        appetite: 60,
        emotion: 'calm',
        emotionRemainingTurns: 0,
        nextMomentPetTurn: 0,
        lastMeaningfulInteractionPetTurn: petTurn,
        chatMemory: { summary: '', recent: [], moments: [] },
        nestCoins: 0,
        curios: [],
        eventCooldowns: {},
        interferenceEnabled: true,
        lifetimeStats: {
            feedCount: 0,
            toyCount: 0,
            chatCount: 0,
            momentCount: 0,
            stolenTotal: 0,
            giftedTotal: 0,
        },
    };
}

export function deriveTavernPetPersona(
    state: Pick<TavernPetState, 'traits' | 'origin'>,
): TavernPetPersonaId {
    const { traits } = state;
    if (Math.abs(traits.closeness) <= BLANK_PERSONA_BALANCE_THRESHOLD
        && Math.abs(traits.sharing) <= BLANK_PERSONA_BALANCE_THRESHOLD
        && Math.abs(traits.tempo) <= BLANK_PERSONA_BALANCE_THRESHOLD
    ) {
        return 'blank';
    }
    const sign = (value: number, birthBias: number) => value === 0 ? (birthBias >= 0 ? '+' : '-') : value > 0 ? '+' : '-';
    const key = `${sign(traits.closeness, state.origin.birthBias.closeness)}${sign(traits.sharing, state.origin.birthBias.sharing)}${sign(traits.tempo, state.origin.birthBias.tempo)}`;
    const personaByTraits: Readonly<Record<string, TavernPetPersonaId>> = {
        '+++': 'sunlet',
        '++-': 'rain-courier',
        '+-+': 'ledger-keeper',
        '+--': 'under-bed-hoarder',
        '-++': 'wanderer',
        '-+-': 'lone-blade',
        '--+': 'merry-bandit',
        '---': 'abyss-tenant',
    };
    return personaByTraits[key];
}

export function tavernPetInteractionUnavailableReason(
    state: TavernPetState | null,
    interactionId: TavernPetInteractionId,
    playerBalance: number,
): string {
    const cost = TAVERN_PET_INTERACTION_COSTS[interactionId];
    if (interactionId === 'lure') {
        if (state) {return '暗室里已经有住户了';}
        return playerBalance >= cost ? '' : '小白币不足';
    }
    if (!state) {return '暗室里还没有东西';}
    if (interactionId === 'chat') {
        return state.phase === 'egg' ? '蛋壳还没有裂开' : '';
    }
    if (interactionId === 'feed') {
        return playerBalance >= cost ? '' : '小白币不足';
    }
    if (interactionId === 'toy') {
        if (state.phase === 'egg') {return '它还没长出能玩玩具的手';}
        return playerBalance >= cost ? '' : '小白币不足';
    }
    return '现在不能这样做';
}

export function applyTavernPetGift(
    source: TavernPetState,
    giftId: TavernPetGiftId,
): TavernPetState {
    const state = clone(source);
    if (giftId === 'feed') {
        state.appetite = Math.min(100, state.appetite + 30);
        state.lifetimeStats.feedCount += 1;
        setTavernPetEmotion(state, 'happy');
    } else if (giftId === 'toy') {
        if (!isActivePhase(state)) {throwTavernPetError('pet_interaction_unavailable', 'toy-phase');}
        state.lifetimeStats.toyCount += 1;
        setTavernPetEmotion(state, 'excited');
    } else {
        throwTavernPetError('pet_interaction_invalid', String(giftId));
    }
    state.lastMeaningfulInteractionPetTurn = state.petTurn;
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
    playerText: string,
    response: TavernPetChatResponse,
): TavernPetState {
    const state = clone(source);
    if (!isActivePhase(state)) {throwTavernPetError('pet_chat_unavailable', state.phase);}
    state.lifetimeStats.chatCount += 1;
    state.lastMeaningfulInteractionPetTurn = state.petTurn;
    state.chatMemory.recent = [...state.chatMemory.recent, { playerText, petText: response.text }].slice(-6);
    if (response.summaryUpdate !== null) {state.chatMemory.summary = response.summaryUpdate;}
    if (response.emotionShift !== null) {setTavernPetEmotion(state, response.emotionShift);}
    return state;
}

export interface TavernPetMomentTransition {
    state: TavernPetState;
    journal: TavernPetJournalDraft;
}

export function resolveTavernPetMomentState(
    source: TavernPetState,
    momentId: TavernPetMomentId,
    choiceId: TavernPetMomentChoiceId,
): TavernPetMomentTransition {
    const state = clone(source);
    const pending = state.pendingMoment;
    if (!pending || pending.id !== momentId) {throwTavernPetError('pet_moment_stale', momentId);}
    const moment = getTavernPetMomentCopy(momentId);
    const delta = momentTraitDelta(momentId, choiceId);
    const trait = moment.trait;
    state.traits[trait] = clampTrait(state.traits[trait] + delta);
    appendMomentMemory(state, momentId, choiceId);
    state.lifetimeStats.momentCount += 1;
    state.lastMeaningfulInteractionPetTurn = state.petTurn;
    state.nextMomentPetTurn = state.petTurn + MOMENT_INTERVAL_TURNS;
    delete state.pendingMoment;
    setTavernPetEmotion(state, choiceId === 'leave-space' || choiceId === 'look-away' || choiceId === 'let-it-be' ? 'calm' : 'happy');
    return { state, journal: renderTavernPetMomentJournal({ momentId, choiceId }) };
}

export function skipTavernPetMomentState(
    source: TavernPetState,
    momentId: TavernPetMomentId,
): TavernPetMomentTransition {
    const state = clone(source);
    if (!state.pendingMoment || state.pendingMoment.id !== momentId) {
        throwTavernPetError('pet_moment_stale', momentId);
    }
    state.lifetimeStats.momentCount += 1;
    state.lastMeaningfulInteractionPetTurn = state.petTurn;
    state.nextMomentPetTurn = state.petTurn + MOMENT_INTERVAL_TURNS;
    delete state.pendingMoment;
    return { state, journal: renderTavernPetMomentJournal({ momentId, choiceId: 'skip' }) };
}

function buildEvolutionRequest(
    state: TavernPetState,
    context: TavernPetTurnContext,
    milestoneId: 'adulthood' | 'repattern',
    previousPersonaId?: TavernPetPersonaId,
): void {
    const personaId = state.personaId;
    if (!personaId) {throwTavernPetError('pet_state_invalid', 'evolution-persona');}
    state.pendingEvolution = {
        requestId: context.evolutionRequestId,
        milestoneId,
        personaId,
        ...(previousPersonaId ? { previousPersonaId } : {}),
        traits: clone(state.traits),
        stats: clone(state.lifetimeStats),
        sourceSessionId: context.sourceSessionId,
        sourceTurn: context.sourceTurn,
        sourcePetTurn: context.petTurn,
        sourceAnchorOrder: context.sourceAnchorOrder,
    };
}

function maybeAdvanceMilestone(
    state: TavernPetState,
    context: TavernPetTurnContext,
): TavernPetTurnOutcome | null {
    if (state.phase === 'juvenile' && state.petTurn >= ADULTHOOD_PET_TURN) {
        state.phase = 'adult';
        state.personaId = deriveTavernPetPersona(state);
        state.lastEvolutionPetTurn = state.petTurn;
        setTavernPetEmotion(state, 'excited');
        buildEvolutionRequest(state, context, 'adulthood');
        return { milestoneId: 'adulthood' };
    }
    if (state.phase === 'adult') {
        const nextPersona = deriveTavernPetPersona(state);
        const lastEvolutionPetTurn = state.lastEvolutionPetTurn;
        if (!state.pendingEvolution
            && nextPersona !== state.personaId
            && lastEvolutionPetTurn !== undefined
            && state.petTurn - lastEvolutionPetTurn >= EVOLUTION_COOLDOWN_PET_TURNS
        ) {
            const previousPersonaId = state.personaId;
            state.personaId = nextPersona;
            state.lastEvolutionPetTurn = state.petTurn;
            setTavernPetEmotion(state, 'excited');
            buildEvolutionRequest(state, context, 'repattern', previousPersonaId);
            return { milestoneId: 'repattern' };
        }
    }
    return null;
}

function eventChance(state: TavernPetState): number {
    let chance = 30;
    if (state.appetite <= 24) {chance += 10;}
    if (state.emotion === 'excited' || state.emotion === 'bored') {chance += 5;}
    return Math.min(45, chance);
}

function isRegularEventId(eventId: TavernPetEventId): eventId is Exclude<TavernPetEventId, 'arrival' | 'hatch' | 'adulthood' | 'repattern'> {
    return eventId !== 'arrival' && eventId !== 'hatch' && eventId !== 'adulthood' && eventId !== 'repattern';
}

function applyEventEffect(
    state: TavernPetState & { phase: 'juvenile' | 'adult' },
    eventId: TavernPetEventId,
    context: TavernPetTurnContext,
    random: TavernPetRandomSource,
): TavernPetTurnOutcome {
    const spec = getTavernPetEvent(eventId);
    if (!isRegularEventId(eventId) || spec.category === 'milestone') {
        throwTavernPetError('pet_state_invalid', `event:${eventId}`);
    }
    let amount: number | undefined;
    let curioId: TavernPetState['curios'][number] | undefined;
    let coinDelta = 0;
    let coinEffect: TavernPetTurnOutcome['coinEffect'];
    let injectedText: string | undefined;
    if (spec.effect.kind === 'emotion') {
        setTavernPetEmotion(state, spec.effect.emotion);
    } else if (spec.effect.kind === 'steal') {
        amount = drawTavernPetInclusiveInteger(spec.effect.minimum, spec.effect.maximum, random);
        coinDelta = -amount;
        state.lifetimeStats.stolenTotal += amount;
        coinEffect = {
            amount,
            direction: 'debit',
            kind: spec.effect.ledgerKind,
            idempotencyKey: `pet:event:${context.sourceSessionId}:${context.sourceTurn}:${eventId}`,
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
            idempotencyKey: `pet:event:${context.sourceSessionId}:${context.sourceTurn}:${eventId}`,
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
            idempotencyKey: `pet:event:${context.sourceSessionId}:${context.sourceTurn}:${eventId}`,
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
            idempotencyKey: `pet:return:${context.sourceSessionId}:${context.sourceTurn}:${eventId}`,
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
            idempotencyKey: `pet:event:${context.sourceSessionId}:${context.sourceTurn}:${eventId}`,
            title: '住户捡回小白币',
            sourceId: eventId,
        };
    } else if (spec.effect.kind === 'curio') {
        if (spec.effect.source === 'dry-flower') {
            curioId = 'dry-flower';
        } else {
            const missing = TAVERN_PET_REGULAR_CURIO_IDS.filter((id) => !state.curios.includes(id));
            if (!missing.length) {throwTavernPetError('pet_state_invalid', 'event-curio-empty');}
            curioId = missing[random.nextInt(missing.length)];
        }
        state.curios = [...state.curios, curioId];
    } else if (spec.effect.kind === 'interference') {
        injectedText = renderTavernPetInterferenceText(
            spec.effect.templateId,
            eventId === 'nibble-sleeve' ? context.knownTargetName : '',
        );
    }
    state.eventCooldowns[eventId] = spec.cooldownTurns;
    const face = tavernPetFaceForEmotion(state.phase, state.personaId, state.emotion);
    const base = { state, amount, curioId, targetName: context.knownTargetName, face, coinDelta };
    const journal = isTavernPetInterferenceEventId(eventId)
        ? renderTavernPetEventCopy({
            ...base,
            eventId,
            injectedText: injectedText || throwTavernPetError('pet_state_invalid', `event:${eventId}:injectedText`),
        })
        : renderTavernPetEventCopy({ ...base, eventId });
    return { eventId, journal, ...(coinEffect ? { coinEffect } : {}) };
}

function maybeCreateMoment(state: TavernPetState): boolean {
    if (!isActivePhase(state) || state.pendingMoment || state.petTurn < state.nextMomentPetTurn) {return false;}
    const id = nextMomentId(state.lifetimeStats.momentCount);
    state.pendingMoment = { id };
    return true;
}

export function advanceTavernPetTurn(
    source: TavernPetState,
    context: TavernPetTurnContext,
    random: TavernPetRandomSource,
): TavernPetTurnTransition {
    const petTurn = assertPetTurn(context.petTurn);
    if (petTurn !== source.petTurn + 1) {
        throwTavernPetError('pet_turn_invalid', `${String(source.petTurn)}->${String(petTurn)}`);
    }
    const state = clone(source);
    state.petTurn = petTurn;
    if (state.phase === 'egg') {
        state.phase = 'juvenile';
        state.nextMomentPetTurn = petTurn + MOMENT_INTERVAL_TURNS;
        setTavernPetEmotion(state, 'excited');
        return {
            changed: true,
            state,
            outcome: {
                milestoneId: 'hatch',
                journal: {
                    detail: {
                        kind: 'milestone',
                        milestoneId: 'hatch',
                        renderedText: '壳从里面裂开了。有什么东西抬头看你。',
                        motion: 'bounce',
                        milestonePetTurn: petTurn,
                        milestoneSourceAnchorOrder: context.sourceAnchorOrder,
                    },
                    coinDelta: 0,
                    notificationText: '住户破壳了。',
                },
            },
        };
    }
    if (!isActivePhase(state)) {throwTavernPetError('pet_phase_invalid', state.phase);}
    state.appetite = Math.max(0, state.appetite - 2);
    decrementCooldowns(state);
    decayEmotion(state);
    const milestone = maybeAdvanceMilestone(state, context);
    if (milestone) {return { changed: true, state, outcome: milestone };}
    maybeCreateMoment(state);
    const candidates = collectTavernPetEventCandidates({
        state,
        playerBalance: context.playerBalance,
        recentExternalSpend: context.recentExternalSpend,
        knownTargetName: context.knownTargetName,
    });
    if (!candidates.length) {return { changed: true, state, outcome: {} };}
    if (!tavernPetProbabilityPasses(eventChance(state), random)) {
        return { changed: true, state, outcome: {} };
    }
    const selected = drawWeightedTavernPetEventCandidate(candidates, random);
    return { changed: true, state, outcome: applyEventEffect(state, selected.spec.id, context, random) };
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
    return isActivePhase(state) ? getTavernPetDialogueProfile(state.phase, state.personaId) : null;
}
