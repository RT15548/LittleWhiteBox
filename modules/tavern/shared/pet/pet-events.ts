import { getTavernPetDialogueProfile } from './pet-personas';
import { TAVERN_PET_REGULAR_CURIO_IDS } from './pet-copy';
import {
    TAVERN_PET_EVENT_IDS,
    type TavernPetEventEvaluationContext,
    type TavernPetEventId,
    type TavernPetEventSpec,
    type TavernPetPhase,
} from './pet-types';

function event(input: TavernPetEventSpec): TavernPetEventSpec {
    return Object.freeze({ ...input, effect: Object.freeze({ ...input.effect }) });
}

export const TAVERN_PET_EVENTS: readonly TavernPetEventSpec[] = Object.freeze([
    event({ id: 'arrival', category: 'milestone', weight: 0, cooldownTurns: 0, minimumPhase: 'luring', predicateId: 'always', effect: { kind: 'milestone', milestoneId: 'arrival' } }),
    event({ id: 'hatch', category: 'milestone', weight: 0, cooldownTurns: 0, minimumPhase: 'egg', predicateId: 'always', effect: { kind: 'milestone', milestoneId: 'hatch' } }),
    event({ id: 'adulthood', category: 'milestone', weight: 0, cooldownTurns: 0, minimumPhase: 'juvenile', predicateId: 'always', effect: { kind: 'milestone', milestoneId: 'adulthood' } }),
    event({ id: 'repattern', category: 'milestone', weight: 0, cooldownTurns: 0, minimumPhase: 'adult', predicateId: 'always', effect: { kind: 'milestone', milestoneId: 'repattern' } }),
    event({ id: 'watch-cursor', category: 'ambient', weight: 12, cooldownTurns: 3, minimumPhase: 'juvenile', predicateId: 'always', effect: { kind: 'ambient' } }),
    event({ id: 'sleep-on-status', category: 'ambient', weight: 8, cooldownTurns: 6, minimumPhase: 'juvenile', predicateId: 'rested-and-full', effect: { kind: 'ambient' } }),
    event({ id: 'count-wallet', category: 'ambient', weight: 9, cooldownTurns: 8, minimumPhase: 'juvenile', predicateId: 'wallet-watcher', effect: { kind: 'ambient' } }),
    event({ id: 'mimic-typing', category: 'ambient', weight: 8, cooldownTurns: 7, minimumPhase: 'juvenile', predicateId: 'has-chat-history', effect: { kind: 'ambient' } }),
    event({ id: 'hum-static', category: 'ambient', weight: 8, cooldownTurns: 5, minimumPhase: 'juvenile', predicateId: 'bright-emotion', effect: { kind: 'ambient' } }),
    event({ id: 'guard-curios', category: 'ambient', weight: 8, cooldownTurns: 8, minimumPhase: 'juvenile', predicateId: 'has-curio', effect: { kind: 'ambient' } }),
    event({ id: 'stare-at-door', category: 'ambient', weight: 7, cooldownTurns: 6, minimumPhase: 'juvenile', predicateId: 'idle-three-turns', effect: { kind: 'ambient' } }),
    event({ id: 'fake-alert', category: 'ambient', weight: 5, cooldownTurns: 10, minimumPhase: 'adult', predicateId: 'adult-only', effect: { kind: 'ambient' } }),
    event({ id: 'steal-small', category: 'mischief', weight: 7, cooldownTurns: 6, minimumPhase: 'juvenile', predicateId: 'small-theft', effect: { kind: 'steal', minimum: 5, maximum: 15, ledgerKind: 'pet_steal' } }),
    event({ id: 'steal-large', category: 'mischief', weight: 2, cooldownTurns: 14, minimumPhase: 'adult', predicateId: 'large-theft', effect: { kind: 'steal', minimum: 20, maximum: 40, ledgerKind: 'pet_steal' } }),
    event({ id: 'hoard-coins', category: 'mischief', weight: 5, cooldownTurns: 10, minimumPhase: 'adult', predicateId: 'hoarder-persona', effect: { kind: 'hoard', amount: 10, ledgerKind: 'pet_hoard' } }),
    event({ id: 'spam-dots', category: 'mischief', weight: 8, cooldownTurns: 5, minimumPhase: 'juvenile', predicateId: 'always', effect: { kind: 'ambient' } }),
    event({ id: 'bite-notification', category: 'mischief', weight: 6, cooldownTurns: 7, minimumPhase: 'juvenile', predicateId: 'always', effect: { kind: 'ambient' } }),
    event({ id: 'scratch-glass', category: 'mischief', weight: 6, cooldownTurns: 8, minimumPhase: 'juvenile', predicateId: 'wild-axis', effect: { kind: 'ambient' } }),
    event({ id: 'hide-in-corner', category: 'mischief', weight: 7, cooldownTurns: 7, minimumPhase: 'juvenile', predicateId: 'hurt-emotion', effect: { kind: 'emotion', emotion: 'bored' } }),
    event({ id: 'beg-for-food', category: 'mischief', weight: 9, cooldownTurns: 6, minimumPhase: 'juvenile', predicateId: 'can-beg', effect: { kind: 'beg' } }),
    event({ id: 'find-coins', category: 'foray', weight: 7, cooldownTurns: 6, minimumPhase: 'adult', predicateId: 'adult-bright-emotion', effect: { kind: 'gift', minimum: 3, maximum: 10, ledgerKind: 'pet_find' } }),
    event({ id: 'offer-treasure', category: 'foray', weight: 4, cooldownTurns: 10, minimumPhase: 'adult', predicateId: 'generous-and-happy', effect: { kind: 'gift', minimum: 10, maximum: 20, ledgerKind: 'pet_gift' } }),
    event({ id: 'bring-curio', category: 'foray', weight: 7, cooldownTurns: 9, minimumPhase: 'juvenile', predicateId: 'missing-regular-curio', effect: { kind: 'curio', source: 'regular' } }),
    event({ id: 'return-cache', category: 'foray', weight: 4, cooldownTurns: 10, minimumPhase: 'juvenile', predicateId: 'can-return-cache', effect: { kind: 'return-cache' } }),
    event({ id: 'pocket-change', category: 'foray', weight: 3, cooldownTurns: 15, minimumPhase: 'juvenile', predicateId: 'recent-spend-ten', effect: { kind: 'pocket-change' } }),
    event({ id: 'leave-dry-flower', category: 'foray', weight: 2, cooldownTurns: 20, minimumPhase: 'adult', predicateId: 'dry-flower-persona', effect: { kind: 'curio', source: 'dry-flower' } }),
    event({ id: 'nibble-sleeve', category: 'interference', weight: 1, cooldownTurns: 30, minimumPhase: 'adult', predicateId: 'interference-nibble', effect: { kind: 'interference', templateId: 'nibble-sleeve' } }),
    event({ id: 'tip-over-cup', category: 'interference', weight: 1, cooldownTurns: 28, minimumPhase: 'adult', predicateId: 'interference-any', effect: { kind: 'interference', templateId: 'tip-over-cup' } }),
    event({ id: 'avert-mishap', category: 'interference', weight: 1, cooldownTurns: 35, minimumPhase: 'adult', predicateId: 'interference-bright', effect: { kind: 'interference', templateId: 'avert-mishap' } }),
    event({ id: 'brief-glimpse', category: 'interference', weight: 1, cooldownTurns: 25, minimumPhase: 'adult', predicateId: 'interference-any', effect: { kind: 'interference', templateId: 'brief-glimpse' } }),
]);

const PET_EVENT_BY_ID = new Map(TAVERN_PET_EVENTS.map((spec) => [spec.id, spec]));

export function getTavernPetEvent(eventId: TavernPetEventId): TavernPetEventSpec {
    const spec = PET_EVENT_BY_ID.get(eventId);
    if (!spec) {throw new Error(`pet_event_missing:${eventId}`);}
    return spec;
}

function phaseRank(phase: TavernPetPhase): number {
    return { luring: 0, egg: 1, juvenile: 2, adult: 3 }[phase];
}

function interferenceAllowed(context: TavernPetEventEvaluationContext): boolean {
    return context.state.phase === 'adult'
        && context.state.interferenceEnabled
        && context.state.interferenceGateTurns === 0;
}

function predicateMatches(spec: TavernPetEventSpec, context: TavernPetEventEvaluationContext): boolean {
    const { state } = context;
    switch (spec.predicateId) {
        case 'always': return true;
        case 'rested-and-full': return (state.emotion === 'calm' || state.emotion === 'bored') && state.satiety >= 60;
        case 'wallet-watcher': return state.personaId === 'ledger-keeper'
            || state.personaId === 'under-bed-hoarder'
            || context.recentExternalSpend > 0;
        case 'has-chat-history': return state.lifetimeStats.chatCount >= 1;
        case 'bright-emotion': return state.emotion === 'happy' || state.emotion === 'excited';
        case 'has-curio': return state.curios.length >= 1;
        case 'idle-three-turns': return state.idleTurns >= 3;
        case 'adult-only': return state.phase === 'adult';
        case 'small-theft': return (state.satiety >= 1 && state.satiety <= 29 || state.emotion === 'resentful')
            && state.axes.generosity < -20
            && context.playerBalance >= 50;
        case 'large-theft': return state.phase === 'adult'
            && (state.personaId === 'abyss-tenant' || state.personaId === 'merry-bandit')
            && state.emotion === 'resentful'
            && context.playerBalance >= 100;
        case 'hoarder-persona': return state.phase === 'adult'
            && (state.personaId === 'ledger-keeper' || state.personaId === 'under-bed-hoarder')
            && context.playerBalance >= 50;
        case 'wild-axis': return state.axes.tameness < -20;
        case 'hurt-emotion': return state.emotion === 'aggrieved' || state.emotion === 'resentful';
        case 'can-beg': return state.satiety >= 1 && state.satiety <= 59 && state.beggingDeadlinePetTurn === undefined;
        case 'adult-bright-emotion': return state.phase === 'adult'
            && (state.emotion === 'happy' || state.emotion === 'excited');
        case 'generous-and-happy': return state.phase === 'adult'
            && state.axes.generosity > 40
            && state.emotion === 'happy';
        case 'missing-regular-curio': return TAVERN_PET_REGULAR_CURIO_IDS.some((id) => !state.curios.includes(id));
        case 'can-return-cache': return state.nestCoins > 0
            && state.emotion === 'happy'
            && state.axes.generosity > 20;
        case 'recent-spend-ten': return context.recentExternalSpend >= 10;
        case 'dry-flower-persona': return (state.personaId === 'sunlet' || state.personaId === 'wanderer')
            && !state.curios.includes('dry-flower');
        case 'interference-nibble':
        case 'interference-any': return interferenceAllowed(context);
        case 'interference-bright': return interferenceAllowed(context)
            && (state.emotion === 'happy' || state.emotion === 'excited');
    }
}

function baseCandidate(spec: TavernPetEventSpec, context: TavernPetEventEvaluationContext): boolean {
    const { state } = context;
    if (spec.category === 'milestone' || state.dormant || state.phase === 'egg' || state.phase === 'luring') {return false;}
    if (phaseRank(state.phase) < phaseRank(spec.minimumPhase)) {return false;}
    if ((state.eventCooldowns[spec.id] || 0) > 0) {return false;}
    const profile = getTavernPetDialogueProfile(state.phase, state.personaId);
    if (profile.blockedEventIds.includes(spec.id)) {return false;}
    return predicateMatches(spec, context);
}

function tavernPetEventWeight(
    spec: TavernPetEventSpec,
    context: TavernPetEventEvaluationContext,
    phase: 'juvenile' | 'adult',
): number {
    const profile = getTavernPetDialogueProfile(phase, context.state.personaId);
    return profile.boostedEventIds.includes(spec.id) ? Math.trunc(spec.weight * 20_000 / 10_000) : spec.weight;
}

export interface TavernPetEventCandidate {
    spec: TavernPetEventSpec;
    weight: number;
}

export function collectTavernPetEventCandidates(context: TavernPetEventEvaluationContext): TavernPetEventCandidate[] {
    if (context.state.phase !== 'juvenile' && context.state.phase !== 'adult') {return [];}
    const phase = context.state.phase;
    const candidates: TavernPetEventCandidate[] = [];
    const seen = new Set<TavernPetEventId>();
    for (const spec of TAVERN_PET_EVENTS) {
        if (!baseCandidate(spec, context)) {continue;}
        let selected = spec;
        if (spec.id === 'nibble-sleeve' && !context.knownTargetName) {
            const fallback = getTavernPetEvent('brief-glimpse');
            if (!baseCandidate(fallback, context)) {continue;}
            selected = fallback;
        }
        if (seen.has(selected.id)) {continue;}
        seen.add(selected.id);
        candidates.push({ spec: selected, weight: tavernPetEventWeight(selected, context, phase) });
    }
    return candidates;
}

function assertEventCatalog(): void {
    if (TAVERN_PET_EVENTS.length !== 30 || PET_EVENT_BY_ID.size !== 30) {
        throw new Error('pet_event_catalog_count_invalid');
    }
    for (const eventId of TAVERN_PET_EVENT_IDS) {
        if (!PET_EVENT_BY_ID.has(eventId)) {throw new Error(`pet_event_catalog_missing:${eventId}`);}
    }
    const counts = TAVERN_PET_EVENTS.reduce<Record<string, number>>((result, spec) => {
        result[spec.category] = (result[spec.category] || 0) + 1;
        return result;
    }, {});
    if (counts.ambient !== 8 || counts.mischief !== 8 || counts.foray !== 6
        || counts.interference !== 4 || counts.milestone !== 4) {
        throw new Error('pet_event_category_count_invalid');
    }
    for (const spec of TAVERN_PET_EVENTS.filter((entry) => entry.category !== 'milestone')) {
        if (!Number.isSafeInteger(spec.weight) || spec.weight <= 0 || !Number.isSafeInteger(spec.cooldownTurns) || spec.cooldownTurns <= 0) {
            throw new Error(`pet_event_range_invalid:${spec.id}`);
        }
    }
}

assertEventCatalog();
