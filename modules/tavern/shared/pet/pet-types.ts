import type { TavernExpectedPhoneBoundary } from '../phone-boundary';

export const TAVERN_PET_COMPANION_ID = 'companion' as const;

export const TAVERN_PET_PHASES = ['egg', 'juvenile', 'adult'] as const;
export type TavernPetPhase = typeof TAVERN_PET_PHASES[number];

export const TAVERN_PET_EMOTIONS = [
    'calm', 'happy', 'aggrieved', 'resentful', 'excited', 'bored',
] as const;
export type TavernPetEmotion = typeof TAVERN_PET_EMOTIONS[number];

export const TAVERN_PET_PERSONA_IDS = [
    'sunlet', 'rain-courier', 'ledger-keeper', 'under-bed-hoarder', 'wanderer',
    'lone-blade', 'merry-bandit', 'abyss-tenant', 'blank',
] as const;
export type TavernPetPersonaId = typeof TAVERN_PET_PERSONA_IDS[number];

export const TAVERN_PET_CURIO_IDS = [
    'bottle-cap', 'glass-bead', 'paper-star', 'rusted-key', 'old-ticket', 'dry-flower',
] as const;
export type TavernPetCurioId = typeof TAVERN_PET_CURIO_IDS[number];

export const TAVERN_PET_INTERACTION_IDS = ['lure', 'feed', 'toy', 'chat'] as const;
export type TavernPetInteractionId = typeof TAVERN_PET_INTERACTION_IDS[number];
export type TavernPetGiftId = Extract<TavernPetInteractionId, 'feed' | 'toy'>;

export const TAVERN_PET_INTERFERENCE_EVENT_IDS = [
    'nibble-sleeve', 'tip-over-cup', 'avert-mishap', 'brief-glimpse',
] as const;
export type TavernPetInterferenceEventId = typeof TAVERN_PET_INTERFERENCE_EVENT_IDS[number];

export const TAVERN_PET_EVENT_IDS = [
    'arrival', 'hatch', 'adulthood', 'repattern',
    'watch-cursor', 'sleep-on-status', 'count-wallet', 'mimic-typing', 'hum-static',
    'guard-curios', 'stare-at-door', 'fake-alert',
    'steal-small', 'steal-large', 'hoard-coins', 'spam-dots', 'bite-notification',
    'scratch-glass', 'hide-in-corner', 'beg-for-food',
    'find-coins', 'offer-treasure', 'bring-curio', 'return-cache', 'pocket-change',
    'leave-dry-flower',
    ...TAVERN_PET_INTERFERENCE_EVENT_IDS,
] as const;
export type TavernPetEventId = typeof TAVERN_PET_EVENT_IDS[number];
export type TavernPetMilestoneId = 'arrival' | 'hatch' | 'adulthood' | 'repattern';
export type TavernPetJournalEventId = Exclude<TavernPetEventId, TavernPetMilestoneId>;
export type TavernPetNonInterferenceEventId = Exclude<
    TavernPetJournalEventId,
    TavernPetInterferenceEventId
>;

export const TAVERN_PET_MOMENT_IDS = [
    'glass-hand', 'bottle-cap', 'quiet-corner',
] as const;
export type TavernPetMomentId = typeof TAVERN_PET_MOMENT_IDS[number];
export const TAVERN_PET_MOMENT_TRAITS = ['closeness', 'sharing', 'tempo'] as const;
export type TavernPetMomentTrait = typeof TAVERN_PET_MOMENT_TRAITS[number];
export type TavernPetMomentChoiceId =
    | 'touch-glass' | 'wait-nearby' | 'leave-space'
    | 'roll-together' | 'keep-it' | 'look-away'
    | 'tap-back' | 'leave-a-light' | 'let-it-be';
export type TavernPetMomentResolutionId = TavernPetMomentChoiceId | 'skip';

export function isTavernPetInterferenceEventId(value: unknown): value is TavernPetInterferenceEventId {
    return typeof value === 'string'
        && TAVERN_PET_INTERFERENCE_EVENT_IDS.some((eventId) => eventId === value);
}

export function isTavernPetMomentId(value: unknown): value is TavernPetMomentId {
    return typeof value === 'string' && TAVERN_PET_MOMENT_IDS.some((id) => id === value);
}

export function isTavernPetMomentChoiceId(value: unknown): value is TavernPetMomentChoiceId {
    return value === 'touch-glass' || value === 'wait-nearby' || value === 'leave-space'
        || value === 'roll-together' || value === 'keep-it' || value === 'look-away'
        || value === 'tap-back' || value === 'leave-a-light' || value === 'let-it-be';
}

export type TavernPetEventCategory = 'ambient' | 'mischief' | 'foray' | 'interference' | 'milestone';
export type TavernPetMotion = 'none' | 'shake' | 'bounce' | 'turn-away' | 'hide' | 'approach' | 'stare';
export type TavernPetFaceKey = 'default' | 'happy' | 'excited' | 'aggrieved' | 'wary' | 'resentful' | 'sleepy' | 'thinking';

export interface TavernPetTraits {
    closeness: number;
    sharing: number;
    tempo: number;
}

export interface TavernPetOrigin {
    specimenNumber: number;
    birthBias: TavernPetTraits;
}

export interface TavernPetMoment {
    id: TavernPetMomentId;
}

export interface TavernPetChatRound {
    playerText: string;
    petText: string;
}

export interface TavernPetChatMemory {
    summary: string;
    recent: TavernPetChatRound[];
    moments: string[];
}

export interface TavernPetLifetimeStats {
    feedCount: number;
    toyCount: number;
    chatCount: number;
    momentCount: number;
    stolenTotal: number;
    giftedTotal: number;
}

export interface TavernPetEvolutionRequest {
    requestId: string;
    milestoneId: 'adulthood' | 'repattern';
    personaId: TavernPetPersonaId;
    previousPersonaId?: TavernPetPersonaId;
    traits: TavernPetTraits;
    stats: TavernPetLifetimeStats;
    sourceSessionId: string;
    sourceTurn: number;
    sourcePetTurn: number;
    sourceAnchorOrder: number;
}

export interface TavernPetState {
    petTurn: number;
    phase: TavernPetPhase;
    origin: TavernPetOrigin;
    traits: TavernPetTraits;
    appetite: number;
    emotion: TavernPetEmotion;
    emotionRemainingTurns: number;
    personaId?: TavernPetPersonaId;
    petName?: string;
    pendingMoment?: TavernPetMoment;
    nextMomentPetTurn: number;
    lastMeaningfulInteractionPetTurn: number;
    lastEvolutionPetTurn?: number;
    chatMemory: TavernPetChatMemory;
    nestCoins: number;
    curios: TavernPetCurioId[];
    eventCooldowns: Partial<Record<TavernPetEventId, number>>;
    interferenceEnabled: boolean;
    pendingEvolution?: TavernPetEvolutionRequest;
    lifetimeStats: TavernPetLifetimeStats;
}

export interface TavernPetDialogueProfile {
    id: 'juvenile' | TavernPetPersonaId;
    displayName: string;
    faces: Record<TavernPetFaceKey, string>;
    selfAddress: string;
    playerAddress: string;
    toneGuide: string;
    blockedEventIds: readonly TavernPetEventId[];
    boostedEventIds: readonly TavernPetEventId[];
}

export type TavernPetChatProfile =
    | { phase: 'juvenile'; personaId?: never }
    | { phase: 'adult'; personaId: TavernPetPersonaId };

export interface TavernPetCurioSpec {
    id: TavernPetCurioId;
    label: string;
    description: string;
    sourceEventId: 'bring-curio' | 'leave-dry-flower';
}

export type TavernPetEventPredicateId =
    | 'always'
    | 'appetite-full'
    | 'wallet-watcher'
    | 'has-chat-history'
    | 'bright-emotion'
    | 'has-curio'
    | 'quiet-eight-turns'
    | 'adult-only'
    | 'small-theft'
    | 'large-theft'
    | 'collector-persona'
    | 'solitary-preference'
    | 'hurt-emotion'
    | 'appetite-low'
    | 'adult-bright-emotion'
    | 'sharing-and-happy'
    | 'missing-regular-curio'
    | 'can-return-cache'
    | 'recent-spend-ten'
    | 'dry-flower-persona'
    | 'interference-nibble'
    | 'interference-any'
    | 'interference-bright';

export type TavernPetEventEffect =
    | { kind: 'ambient' }
    | { kind: 'emotion'; emotion: TavernPetEmotion }
    | { kind: 'steal'; minimum: number; maximum: number; ledgerKind: 'pet_steal' }
    | { kind: 'hoard'; amount: 10; ledgerKind: 'pet_hoard' }
    | { kind: 'gift'; minimum: number; maximum: number; ledgerKind: 'pet_find' | 'pet_gift' }
    | { kind: 'curio'; source: 'regular' | 'dry-flower' }
    | { kind: 'return-cache' }
    | { kind: 'pocket-change' }
    | { kind: 'interference'; templateId: TavernPetInterferenceEventId }
    | { kind: 'milestone'; milestoneId: TavernPetMilestoneId };

export interface TavernPetEventSpec {
    id: TavernPetEventId;
    category: TavernPetEventCategory;
    weight: number;
    cooldownTurns: number;
    minimumPhase: TavernPetPhase;
    predicateId: TavernPetEventPredicateId;
    effect: TavernPetEventEffect;
}

export interface TavernPetEventEvaluationContext {
    state: TavernPetState;
    playerBalance: number;
    recentExternalSpend: number;
    knownTargetName: string;
}

export interface TavernPetTurnContext {
    sourceSessionId: string;
    sourceTurn: number;
    sourceAnchorOrder: number;
    petTurn: number;
    recentExternalSpend: number;
    playerBalance: number;
    knownTargetName: string;
    evolutionRequestId: string;
}

export interface TavernPetCoinEffect {
    amount: number;
    direction: 'debit' | 'credit';
    kind: 'pet_steal' | 'pet_hoard' | 'pet_find' | 'pet_gift' | 'pet_return';
    idempotencyKey: string;
    title: string;
    sourceId: string;
}

export type TavernPetJournalDetail =
    | {
        kind: 'event'; eventId: TavernPetInterferenceEventId; renderedText: string;
        face: string; motion: TavernPetMotion; injectedText: string;
    }
    | {
        kind: 'event'; eventId: TavernPetNonInterferenceEventId; renderedText: string;
        face: string; motion: TavernPetMotion; injectedText?: never;
    }
    | {
        kind: 'milestone'; milestoneId: TavernPetMilestoneId; renderedText: string;
        motion: TavernPetMotion; milestonePetTurn: number; milestoneSourceAnchorOrder: number;
        personaId?: TavernPetPersonaId; verdict?: string;
    }
    | {
        kind: 'chat'; playerText: string; petText: string; face: string;
        motion: TavernPetMotion; murmur?: string;
    }
    | {
        kind: 'moment'; momentId: TavernPetMomentId; choiceId: TavernPetMomentResolutionId;
        renderedText: string; motion: TavernPetMotion;
    };

export interface TavernPetJournalDraft {
    detail: TavernPetJournalDetail;
    coinDelta: number;
    notificationText?: string;
}

export interface TavernPetTurnOutcome {
    eventId?: TavernPetEventId;
    milestoneId?: TavernPetMilestoneId;
    journal?: TavernPetJournalDraft;
    coinEffect?: TavernPetCoinEffect;
}

export interface TavernPetTurnTransition {
    changed: boolean;
    state: TavernPetState;
    outcome: TavernPetTurnOutcome;
}

export interface TavernPetChatResponse {
    face: string;
    text: string;
    motion: TavernPetMotion;
    emotionShift: TavernPetEmotion | null;
    murmur: string | null;
    summaryUpdate: string | null;
}

export type TavernPetStateAction =
    | { kind: 'lure'; origin: TavernPetOrigin }
    | { kind: 'interact'; interactionId: TavernPetGiftId }
    | { kind: 'rename'; petName?: string }
    | { kind: 'toggle-interference'; enabled: boolean }
    | { kind: 'turn-advance'; context: TavernPetTurnContext; outcome: TavernPetTurnOutcome }
    | { kind: 'chat'; playerText: string; response: TavernPetChatResponse }
    | { kind: 'resolve-moment'; momentId: TavernPetMomentId; choiceId: TavernPetMomentChoiceId }
    | { kind: 'skip-moment'; momentId: TavernPetMomentId }
    | { kind: 'resolve-evolution'; requestId: string; verdict: string; usedFallback: boolean };

export interface TavernPetCompanionRecord {
    id: typeof TAVERN_PET_COMPANION_ID;
    revision: number;
    versionId: string;
    state: TavernPetState;
    createdAt: number;
    updatedAt: number;
}

export interface TavernPetActionRecord {
    id: string;
    revision: number;
    sourceSessionId: string;
    sourceTurn: number;
    sourceAnchorOrder: number;
    action: TavernPetStateAction;
    activityId?: string;
    createdAt: number;
}

export interface TavernPetJournalRecord {
    id: string;
    sourceActionId: string;
    sourceSessionId: string;
    sourceTurn: number;
    sourceAnchorOrder: number;
    petTurn: number;
    detail: TavernPetJournalDetail;
    coinDelta: number;
    notificationText?: string;
    createdAt: number;
}

export interface TavernPetMomentView {
    id: TavernPetMomentId;
    prompt: string;
    choices: Array<{ id: TavernPetMomentChoiceId; label: string }>;
}

export interface TavernPetAvailableAction {
    id: TavernPetInteractionId;
    cost: number;
    enabled: boolean;
    reason: string;
}

export interface TavernPetGuidanceView {
    kind: 'arrival' | 'egg' | 'first-chat' | 'moment' | 'hunger';
    text: string;
}

export interface TavernPetView {
    revision: number;
    versionId: string;
    existence: 'undiscovered' | 'present';
    phase?: TavernPetPhase;
    displayName: string;
    specimenLabel?: string;
    currentFace?: string;
    persona?: { id: TavernPetPersonaId; displayName: string };
    appetiteLabel?: string;
    emotionLabel?: string;
    phaseProgressLabel?: string;
    guidance?: TavernPetGuidanceView;
    storageMb?: number;
    pendingMoment?: TavernPetMomentView;
    pendingEvolution: boolean;
    interferenceEnabled: boolean;
    nest: { coins: number; curios: Array<{ id: TavernPetCurioId; label: string; description: string }> };
    latestUtterance?: { face: string; text: string; motion: TavernPetMotion; murmur?: string };
    availableActions: TavernPetAvailableAction[];
}

export interface TavernPetCompanionReceipt {
    id: typeof TAVERN_PET_COMPANION_ID;
    revision: number;
    versionId: string;
    createdAt: number;
    updatedAt: number;
}

export interface TavernPetActionReceipt {
    id: string;
    revision: number;
    sourceSessionId: string;
    sourceTurn: number;
    sourceAnchorOrder: number;
    action: TavernPetStateAction;
    activityId?: string;
    createdAt: number;
}

export interface TavernPetMutationResult {
    companion: TavernPetCompanionReceipt | null;
    actionRecord: TavernPetActionReceipt | null;
    view: TavernPetView;
    playerBalance: number;
    journal: TavernPetJournalRecord[];
    replay: boolean;
    changed: boolean;
}

export interface TavernPetMutationBoundary {
    sessionId: string;
    boundary: TavernExpectedPhoneBoundary;
    actionId: string;
    expectedRevision: number;
    expectedVersionId: string;
}

export interface LureTavernPetInput extends TavernPetMutationBoundary {}
export interface InteractWithTavernPetInput extends TavernPetMutationBoundary {
    interactionId: TavernPetGiftId;
}
export interface RenameTavernPetInput extends TavernPetMutationBoundary { petName?: string }
export interface SetTavernPetInterferenceInput extends TavernPetMutationBoundary { enabled: boolean }
export interface CommitTavernPetChatResponseInput extends TavernPetMutationBoundary {
    playerText: string;
    response: TavernPetChatResponse;
    responseProfile: TavernPetChatProfile;
}
export interface ResolveTavernPetMomentInput extends TavernPetMutationBoundary {
    momentId: TavernPetMomentId;
    choiceId: TavernPetMomentChoiceId;
}
export interface SkipTavernPetMomentInput extends TavernPetMutationBoundary {
    momentId: TavernPetMomentId;
}
export interface ResolveTavernPetEvolutionInput {
    sessionId: string;
    requestId: string;
    verdict: string;
    usedFallback: boolean;
}
export interface LetTavernPetLeaveInput {
    sessionId: string;
    boundary: TavernExpectedPhoneBoundary;
    expectedRevision: number;
    expectedVersionId: string;
}

export interface TavernPetPrivateChatSnapshot {
    companion: TavernPetCompanionRecord;
    recentJournal: TavernPetJournalRecord[];
}

export type TavernPetErrorCode =
    | 'pet_session_required' | 'pet_session_missing' | 'pet_action_required'
    | 'pet_action_conflict' | 'pet_revision_invalid' | 'pet_revision_conflict'
    | 'pet_version_id_invalid' | 'pet_version_conflict' | 'pet_anchor_order_invalid'
    | 'pet_turn_invalid' | 'pet_state_missing' | 'pet_state_exists' | 'pet_phase_invalid'
    | 'pet_interaction_invalid' | 'pet_interaction_unavailable' | 'pet_name_invalid'
    | 'pet_chat_invalid' | 'pet_chat_unavailable' | 'pet_moment_stale'
    | 'pet_evolution_stale' | 'pet_random_invalid' | 'pet_random_exhausted'
    | 'pet_state_invalid' | 'pet_journal_invalid' | 'pet_history_invalid';

export const TAVERN_PET_INSUFFICIENT_FUNDS_REASON = 'insufficient-funds';

export class TavernPetError extends Error {
    readonly code: TavernPetErrorCode;
    readonly detail: string;
    readonly reason: string;

    constructor(code: TavernPetErrorCode, detail = '') {
        super(detail ? `${code}:${detail}` : code);
        this.name = 'TavernPetError';
        this.code = code;
        this.detail = detail;
        this.reason = detail;
    }
}

export function throwTavernPetError(code: TavernPetErrorCode, detail = ''): never {
    throw new TavernPetError(code, detail);
}
