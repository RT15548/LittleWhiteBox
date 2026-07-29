import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_MINT_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
    type TavernEconomyTransactionRecord,
} from '../economy/economy-types';
import {
    parseCanonicalTavernPetActivityRecord,
    parseCanonicalTavernPetStateVersionRecord,
} from './pet-invariants';
import {
    canonicalTavernPetStaticVerdict,
    renderTavernPetMilestoneActivity,
} from './pet-copy';
import { createTavernPetReplayRandomSource } from './pet-random';
import {
    advanceTavernPetTurn,
    applyTavernPetChatResponse,
    applyTavernPetInteraction,
    createTavernPetLuringState,
    currentTavernPetDialogueProfile,
    renameTavernPetState,
    resolveTavernPetEvolutionState,
    setTavernPetInterferenceState,
    TAVERN_PET_INTERACTION_COSTS,
    wakeTavernPetState,
} from './pet-rules';
import {
    TAVERN_PET_CURRENT_MARKER,
    type TavernPetActivityDraft,
    type TavernPetActivityRecord,
    type TavernPetState,
    type TavernPetStateVersionRecord,
    type TavernPetTurnOutcome,
    throwTavernPetError,
} from './pet-types';

export interface TavernPetHistoryInput {
    sessionId: string;
    versions: readonly unknown[];
    activities: readonly unknown[];
    economyTransactions: readonly TavernEconomyTransactionRecord[];
}

export interface TavernPetCanonicalHistory {
    versions: TavernPetStateVersionRecord[];
    activities: TavernPetActivityRecord[];
}

function clone<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function sameJson(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

function fail(detail: string): never {
    throwTavernPetError('pet_history_invalid', detail);
}

function playerPaymentSpec(record: TavernPetStateVersionRecord): {
    idempotencyKey: string;
    amount: number;
    kind: 'pet_upkeep' | 'pet_wake';
    sourceId: string;
} | null {
    const action = record.action;
    if (action.kind === 'lure') {
        return {
            idempotencyKey: ['pet', 'lure', record.actionId].join(':'),
            amount: TAVERN_PET_INTERACTION_COSTS.lure,
            kind: 'pet_upkeep',
            sourceId: 'lure',
        };
    }
    if (action.kind === 'wake') {
        return {
            idempotencyKey: ['pet', 'wake', record.actionId].join(':'),
            amount: TAVERN_PET_INTERACTION_COSTS.wake,
            kind: 'pet_wake',
            sourceId: 'wake',
        };
    }
    if (action.kind === 'interact'
        && (action.interactionId === 'feed' || action.interactionId === 'toy')
    ) {
        return {
            idempotencyKey: ['pet', 'upkeep', record.actionId].join(':'),
            amount: TAVERN_PET_INTERACTION_COSTS[action.interactionId],
            kind: 'pet_upkeep',
            sourceId: action.interactionId,
        };
    }
    return null;
}

function assertPlayerPayment(
    record: TavernPetStateVersionRecord,
    transaction: TavernEconomyTransactionRecord | undefined,
): TavernEconomyTransactionRecord {
    const expected = playerPaymentSpec(record);
    if (!expected
        || !transaction
        || transaction.idempotencyKey !== expected.idempotencyKey
        || transaction.fromAccountId !== TAVERN_PLAYER_ACCOUNT_ID
        || transaction.toAccountId !== TAVERN_SYSTEM_SINK_ACCOUNT_ID
        || transaction.amount !== expected.amount
        || transaction.kind !== expected.kind
        || transaction.sourceDomain !== 'pet'
        || transaction.sourceId !== expected.sourceId
        || transaction.anchorOrder !== record.anchorOrder
    ) {
        return fail(['payment', record.actionId].join(':'));
    }
    return transaction;
}

function assertTurnCoinTransaction(
    record: TavernPetStateVersionRecord,
    outcome: TavernPetTurnOutcome,
    transaction: TavernEconomyTransactionRecord | undefined,
): TavernEconomyTransactionRecord | null {
    const effect = outcome.coinEffect;
    if (!effect) {
        if (transaction) {fail(['unexpected-coin', record.actionId].join(':'));}
        return null;
    }
    const expectedFrom = effect.direction === 'debit'
        ? TAVERN_PLAYER_ACCOUNT_ID
        : effect.kind === 'pet_return'
            ? TAVERN_SYSTEM_SINK_ACCOUNT_ID
            : TAVERN_SYSTEM_MINT_ACCOUNT_ID;
    const expectedTo = effect.direction === 'debit'
        ? TAVERN_SYSTEM_SINK_ACCOUNT_ID
        : TAVERN_PLAYER_ACCOUNT_ID;
    if (!transaction
        || transaction.idempotencyKey !== effect.idempotencyKey
        || transaction.fromAccountId !== expectedFrom
        || transaction.toAccountId !== expectedTo
        || transaction.amount !== effect.amount
        || transaction.kind !== effect.kind
        || transaction.sourceDomain !== 'pet'
        || transaction.sourceId !== effect.sourceId
        || transaction.anchorOrder !== record.anchorOrder
    ) {
        return fail(['turn-coin', record.actionId].join(':'));
    }
    return transaction;
}

interface TavernPetEconomyReplayIndex {
    playerBalanceByLedgerOrder: ReadonlyMap<number, number>;
    externalSpendThroughLedgerOrder: ReadonlyMap<number, number>;
}

function buildEconomyReplayIndex(
    transactions: readonly TavernEconomyTransactionRecord[],
): TavernPetEconomyReplayIndex {
    const playerBalanceByLedgerOrder = new Map<number, number>();
    const externalSpendThroughLedgerOrder = new Map<number, number>();
    let externalSpend = 0;
    for (const transaction of transactions) {
        if (transaction.fromAccountId === TAVERN_PLAYER_ACCOUNT_ID
            && (transaction.sourceDomain === 'shop' || transaction.sourceDomain === 'bank')
        ) {
            externalSpend += transaction.amount;
        }
        playerBalanceByLedgerOrder.set(transaction.ledgerOrder, transaction.playerBalanceAfter);
        externalSpendThroughLedgerOrder.set(transaction.ledgerOrder, externalSpend);
    }
    return { playerBalanceByLedgerOrder, externalSpendThroughLedgerOrder };
}

function ledgerValue(
    values: ReadonlyMap<number, number>,
    ledgerOrder: number,
): number {
    if (ledgerOrder < 0) {return 0;}
    const value = values.get(ledgerOrder);
    if (value === undefined || !Number.isSafeInteger(value)) {
        return fail(['ledger-head', String(ledgerOrder)].join(':'));
    }
    return value;
}

function playerBalanceAtLedger(
    index: TavernPetEconomyReplayIndex,
    ledgerOrder: number,
): number {
    return ledgerValue(index.playerBalanceByLedgerOrder, ledgerOrder);
}

function expectedRecentExternalSpend(
    index: TavernPetEconomyReplayIndex,
    observedLedgerOrder: number,
    latestLedgerOrder: number,
): number {
    return ledgerValue(index.externalSpendThroughLedgerOrder, latestLedgerOrder)
        - ledgerValue(index.externalSpendThroughLedgerOrder, observedLedgerOrder);
}

function expectedActivityDraft(
    previous: TavernPetState | null,
    record: TavernPetStateVersionRecord,
): TavernPetActivityDraft | null {
    const action = record.action;
    if (action.kind === 'turn-advance') {return action.outcome.activity || null;}
    if (action.kind === 'chat') {
        return {
            detail: {
                kind: 'chat',
                playerText: action.playerText,
                petText: action.response.text,
                face: action.response.face,
                motion: action.response.motion,
                ...(action.response.murmur ? { murmur: action.response.murmur } : {}),
            },
            coinDelta: 0,
        };
    }
    if (action.kind === 'wake') {
        return {
            detail: {
                kind: 'status',
                status: 'woke',
                renderedText: '灰掉的轮廓动了一下。它回来了。',
                motion: 'approach',
            },
            coinDelta: 0,
            notificationText: '它回来了。',
        };
    }
    if (action.kind === 'resolve-evolution') {
        const pending = previous?.pendingEvolution;
        if (!pending || pending.requestId !== action.requestId) {
            return fail(['evolution-pending', record.actionId].join(':'));
        }
        if (action.usedFallback && action.verdict !== canonicalTavernPetStaticVerdict(pending.personaId)) {
            return fail(['evolution-fallback', record.actionId].join(':'));
        }
        return renderTavernPetMilestoneActivity({
            milestoneId: pending.milestoneId,
            state: record.state,
            turn: pending.turn,
            anchorOrder: pending.anchorOrder,
            personaId: pending.personaId,
            verdict: action.verdict,
        });
    }
    return null;
}

function assertActivityCausality(
    previous: TavernPetState | null,
    record: TavernPetStateVersionRecord,
    activitiesBySource: Map<string, TavernPetActivityRecord>,
): void {
    const expected = expectedActivityDraft(previous, record);
    const activity = activitiesBySource.get(record.actionId);
    if (!expected) {
        if (record.activityId || activity) {fail(['unexpected-activity', record.actionId].join(':'));}
        return;
    }
    if (!record.activityId
        || !activity
        || activity.id !== record.activityId
        || activity.turn !== record.turn
        || activity.anchorOrder !== record.anchorOrder
        || !sameJson(activity.detail, expected.detail)
        || activity.coinDelta !== expected.coinDelta
    ) {
        fail(['activity', record.actionId].join(':'));
    }
    if (String(activity.notificationText || '') !== String(expected.notificationText || '')) {
        fail(['activity-notification', record.actionId].join(':'));
    }
    if (record.action.kind === 'resolve-evolution'
        && activity.detail.kind === 'milestone'
        && activity.detail.verdict !== record.action.verdict
    ) {
        fail(['activity-verdict', record.actionId].join(':'));
    }
}

function replayState(
    previous: TavernPetState | null,
    record: TavernPetStateVersionRecord,
    transactionsByKey: Map<string, TavernEconomyTransactionRecord>,
    economyIndex: TavernPetEconomyReplayIndex,
    usedEconomyKeys: Set<string>,
): TavernPetState {
    const action = record.action;
    if (!previous) {
        if (action.kind !== 'lure' || record.revision !== 1) {return fail('first-action');}
        const transaction = assertPlayerPayment(
            record,
            transactionsByKey.get(['pet', 'lure', record.actionId].join(':')),
        );
        usedEconomyKeys.add(transaction.idempotencyKey);
        return createTavernPetLuringState({
            origin: action.origin,
            currentTurn: record.turn,
            observedEconomyLedgerOrder: transaction.ledgerOrder,
        });
    }
    if (action.kind === 'lure') {return fail(['duplicate-lure', record.actionId].join(':'));}
    if (action.kind === 'interact') {
        const payment = playerPaymentSpec(record);
        if (payment) {
            const transaction = assertPlayerPayment(record, transactionsByKey.get(payment.idempotencyKey));
            usedEconomyKeys.add(transaction.idempotencyKey);
        }
        return applyTavernPetInteraction(previous, action.interactionId, record.turn).state;
    }
    if (action.kind === 'wake') {
        const payment = playerPaymentSpec(record);
        const transaction = assertPlayerPayment(
            record,
            payment ? transactionsByKey.get(payment.idempotencyKey) : undefined,
        );
        usedEconomyKeys.add(transaction.idempotencyKey);
        const state = wakeTavernPetState(previous, record.turn);
        state.observedEconomyLedgerOrder = transaction.ledgerOrder;
        return state;
    }
    if (action.kind === 'rename') {
        return renameTavernPetState(previous, action.petName);
    }
    if (action.kind === 'toggle-interference') {
        return setTavernPetInterferenceState(previous, action.enabled);
    }
    if (action.kind === 'chat') {
        const profile = currentTavernPetDialogueProfile(previous);
        if (!profile
            || !Object.entries(profile.faces)
                .filter(([key]) => key !== 'thinking')
                .some(([, face]) => face === action.response.face)
        ) {
            return fail(['chat-face', record.actionId].join(':'));
        }
        const transition = applyTavernPetChatResponse(
            previous,
            record.turn,
            action.playerText,
            action.response,
        );
        if (transition.appliedAxes !== action.appliedAxes) {
            return fail(['chat-axes', record.actionId].join(':'));
        }
        return transition.state;
    }
    if (action.kind === 'resolve-evolution') {
        return resolveTavernPetEvolutionState(previous, action.requestId);
    }
    const context = action.context;
    if (context.turn !== record.turn || context.anchorOrder !== record.anchorOrder) {
        return fail(['turn-context', record.actionId].join(':'));
    }
    if (previous.phase === 'luring') {
        if (context.turn !== previous.origin.arrivalTurn) {
            return fail(['luring-gap', record.actionId].join(':'));
        }
    } else if (context.turn !== previous.interactionWindow.turn + 1) {
        return fail(['active-turn-gap', record.actionId].join(':'));
    }
    if (context.playerBalance !== playerBalanceAtLedger(economyIndex, context.latestEconomyLedgerOrder)) {
        return fail(['turn-balance', record.actionId].join(':'));
    }
    if (context.recentExternalSpend !== expectedRecentExternalSpend(
        economyIndex,
        previous.observedEconomyLedgerOrder,
        context.latestEconomyLedgerOrder,
    )) {
        return fail(['turn-spend-window', record.actionId].join(':'));
    }
    const random = createTavernPetReplayRandomSource(action.randomDraws);
    const transition = advanceTavernPetTurn(previous, context, random);
    random.assertExhausted();
    if (!transition.changed || !sameJson(transition.outcome, action.outcome)) {
        return fail(['turn-outcome', record.actionId].join(':'));
    }
    const transaction = assertTurnCoinTransaction(
        record,
        action.outcome,
        action.outcome.coinEffect
            ? transactionsByKey.get(action.outcome.coinEffect.idempotencyKey)
            : undefined,
    );
    if (transaction) {
        if (transaction.ledgerOrder !== context.latestEconomyLedgerOrder + 1) {
            return fail(['turn-ledger-order', record.actionId].join(':'));
        }
        usedEconomyKeys.add(transaction.idempotencyKey);
    }
    return transition.state;
}

export function parseAndAssertTavernPetHistory(
    input: TavernPetHistoryInput,
): TavernPetCanonicalHistory {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return fail('session');}
    const versions = input.versions
        .map((record) => parseCanonicalTavernPetStateVersionRecord(record))
        .sort((left, right) => left.revision - right.revision);
    const activities = input.activities
        .map((record) => parseCanonicalTavernPetActivityRecord(record))
        .sort((left, right) => left.createdAt - right.createdAt || left.id.localeCompare(right.id));
    if (versions.some((record) => record.sessionId !== sessionId)
        || activities.some((record) => record.sessionId !== sessionId)
        || input.economyTransactions.some((record) => record.sessionId !== sessionId)
    ) {
        return fail('session-mismatch');
    }
    const versionIds = new Set<string>();
    const actionIds = new Set<string>();
    const currentRows = versions.filter((record) => record.currentMarker === TAVERN_PET_CURRENT_MARKER);
    if (versions.length && (currentRows.length !== 1 || currentRows[0] !== versions.at(-1))) {
        return fail('current-marker');
    }
    const activitiesBySource = new Map<string, TavernPetActivityRecord>();
    const activityIds = new Set<string>();
    for (const activity of activities) {
        if (activityIds.has(activity.id) || activitiesBySource.has(activity.sourceActionId)) {
            return fail(['activity-duplicate', activity.id].join(':'));
        }
        activityIds.add(activity.id);
        activitiesBySource.set(activity.sourceActionId, activity);
    }
    const allTransactions = [...input.economyTransactions]
        .sort((left, right) => left.ledgerOrder - right.ledgerOrder);
    const transactionsByKey = new Map<string, TavernEconomyTransactionRecord>();
    for (const transaction of allTransactions) {
        if (transactionsByKey.has(transaction.idempotencyKey)) {
            return fail(['economy-key-duplicate', transaction.idempotencyKey].join(':'));
        }
        transactionsByKey.set(transaction.idempotencyKey, transaction);
    }
    const economyIndex = buildEconomyReplayIndex(allTransactions);
    const usedEconomyKeys = new Set<string>();
    let previousState: TavernPetState | null = null;
    let previousRecord: TavernPetStateVersionRecord | null = null;
    for (const [index, record] of versions.entries()) {
        if (record.revision !== index + 1
            || versionIds.has(record.versionId)
            || actionIds.has(record.actionId)
        ) {
            return fail(['version-chain', String(record.revision)].join(':'));
        }
        versionIds.add(record.versionId);
        actionIds.add(record.actionId);
        if (previousRecord
            && (record.anchorOrder < previousRecord.anchorOrder || record.turn < previousRecord.turn)
        ) {
            return fail(['timeline-regression', record.actionId].join(':'));
        }
        assertActivityCausality(previousState, record, activitiesBySource);
        const nextState = replayState(
            previousState,
            record,
            transactionsByKey,
            economyIndex,
            usedEconomyKeys,
        );
        if (!sameJson(nextState, record.state)) {
            return fail(['state-replay', record.actionId].join(':'));
        }
        previousState = clone(record.state);
        previousRecord = record;
    }
    if (activitiesBySource.size !== versions.filter((record) => record.activityId).length) {
        return fail('orphan-activity');
    }
    for (const transaction of allTransactions.filter((row) => row.sourceDomain === 'pet')) {
        if (!usedEconomyKeys.has(transaction.idempotencyKey)) {
            return fail(['orphan-economy', transaction.idempotencyKey].join(':'));
        }
    }
    return { versions: clone(versions), activities: clone(activities) };
}

export function assertTavernPetHistoryInvariant(input: TavernPetHistoryInput): void {
    parseAndAssertTavernPetHistory(input);
}
