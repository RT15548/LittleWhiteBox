import {
    challengeTavernBankDiceGame,
    respondToTavernBankDicePlayerBid,
    type TavernBankDiceSettlement,
} from './games/dice-bluff';
import {
    cashOutTavernBankPushGame,
    drawTavernBankPushCard,
    type TavernBankPushTransition,
} from './games/push-your-luck';
import {
    cashOutTavernBankLadderGame,
    stepTavernBankLadderGame,
    type TavernBankLadderTransition,
} from './games/risk-ladder';
import type { TavernBankRandomSource } from './bank-random';
import type {
    TavernBankActivityDetail,
    TavernBankActivityRecord,
    TavernBankDepositPosition,
    TavernBankFundPosition,
    TavernBankPrivateDiceGame,
    TavernBankPrivateLadderGame,
    TavernBankPrivatePushGame,
    TavernBankState,
    TavernBankStateAction,
    TavernBankStateVersionRecord,
} from './bank-types';

export type TavernBankHistoryViolationCode =
    | 'version-replay-invalid'
    | 'position-replay-invalid'
    | 'game-replay-invalid'
    | 'activity-replay-invalid';

export interface TavernBankHistoryViolation {
    code: TavernBankHistoryViolationCode;
    detail: string;
}

class TavernBankHistoryViolationError extends Error {
    readonly violation: TavernBankHistoryViolation;

    constructor(code: TavernBankHistoryViolationCode, detail: string) {
        super(`${code}:${detail}`);
        this.name = 'TavernBankHistoryViolationError';
        this.violation = { code, detail };
    }
}

const LOWEST_RANDOM: TavernBankRandomSource = Object.freeze({
    nextInt(): number {return 0;},
});

const HIGHEST_RANDOM: TavernBankRandomSource = Object.freeze({
    nextInt(maxExclusive: number): number {return maxExclusive - 1;},
});

function fail(code: TavernBankHistoryViolationCode, detail: string): never {
    throw new TavernBankHistoryViolationError(code, detail);
}

function canonicalJson(value: unknown): string {
    return JSON.stringify(value ?? null, (_key, entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {return entry;}
        return Object.fromEntries(Object.entries(entry as Record<string, unknown>).sort(([left], [right]) => (
            left.localeCompare(right)
        )));
    });
}

function sameCanonical(left: unknown, right: unknown): boolean {
    return canonicalJson(left) === canonicalJson(right);
}

function emptyState(): TavernBankState {
    return { openDeposits: [], openInvestments: [] };
}

function activityForSource(
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>,
    sourceId: string,
): TavernBankActivityRecord {
    const activity = activitiesBySource.get(sourceId);
    if (!activity) {fail('activity-replay-invalid', `missing:${sourceId}`);}
    return activity;
}

function activityMatches(input: {
    activity: TavernBankActivityRecord;
    row: TavernBankStateVersionRecord;
    amountIn: number;
    payout: number;
    detail: TavernBankActivityDetail;
}): boolean {
    return input.activity.sessionId === input.row.sessionId
        && input.activity.anchorOrder === input.row.anchorOrder
        && input.activity.amountIn === input.amountIn
        && input.activity.payout === input.payout
        && input.activity.net === input.payout - input.amountIn
        && sameCanonical(input.activity.detail, input.detail);
}

function consumeActivity(input: {
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>;
    consumedSourceIds: Set<string>;
    row: TavernBankStateVersionRecord;
    sourceId: string;
    amountIn: number;
    payout: number;
    detail: TavernBankActivityDetail;
}): void {
    if (input.consumedSourceIds.has(input.sourceId)) {
        fail('activity-replay-invalid', `duplicate:${input.sourceId}`);
    }
    const activity = activityForSource(input.activitiesBySource, input.sourceId);
    if (!activityMatches({ ...input, activity })) {
        fail('activity-replay-invalid', `mismatch:${input.row.actionId}:${input.sourceId}`);
    }
    input.consumedSourceIds.add(input.sourceId);
}

function findPreviousPosition(
    state: TavernBankState,
    positionId: string,
): TavernBankDepositPosition | TavernBankFundPosition | null {
    return state.openDeposits.find((position) => position.id === positionId)
        || state.openInvestments.find((position) => position.id === positionId)
        || null;
}

function duePositionIds(state: TavernBankState, turn: number): string[] {
    return [
        ...state.openDeposits.filter((position) => position.maturityTurn <= turn),
        ...state.openInvestments.filter((position) => position.maturityTurn <= turn),
    ].map((position) => position.id);
}

function consumeMaturedPositionActivity(input: {
    position: TavernBankDepositPosition | TavernBankFundPosition;
    row: TavernBankStateVersionRecord;
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>;
    consumedSourceIds: Set<string>;
}): void {
    const position = input.position;
    if ('maturityAmount' in position) {
        consumeActivity({
            ...input,
            sourceId: position.id,
            amountIn: position.principal,
            payout: position.maturityAmount,
            detail: { kind: 'deposit', productId: position.productId, outcome: 'matured' },
        });
        return;
    }
    consumeActivity({
        ...input,
        sourceId: position.id,
        amountIn: position.principal,
        payout: position.settlementAmount,
        detail: {
            kind: 'fund',
            productId: position.productId,
            resolvedReturnBps: position.resolvedReturnBps,
        },
    });
}

function validatePositionTransition(input: {
    previous: TavernBankState;
    row: TavernBankStateVersionRecord;
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>;
    consumedSourceIds: Set<string>;
}): void {
    const { previous, row } = input;
    const action = row.action;
    const dueIds = duePositionIds(previous, row.turn);
    const dueIdSet = new Set(dueIds);
    const listedIdSet = new Set(action.settledPositionIds);
    if (
        listedIdSet.size !== action.settledPositionIds.length
        || listedIdSet.size !== dueIdSet.size
        || [...listedIdSet].some((positionId) => !dueIdSet.has(positionId))
    ) {
        fail('position-replay-invalid', `${row.actionId}:settlement-turn`);
    }
    const removedIds = new Set<string>();
    for (const positionId of action.settledPositionIds) {
        const position = findPreviousPosition(previous, positionId);
        if (!position || removedIds.has(positionId)) {
            fail('position-replay-invalid', `${row.actionId}:settled:${positionId}`);
        }
        consumeMaturedPositionActivity({ ...input, position });
        removedIds.add(positionId);
    }
    if (action.kind === 'settle-due' && removedIds.size === 0) {
        fail('position-replay-invalid', `${row.actionId}:empty-settlement`);
    }
    if (action.kind === 'deposit-withdraw-early' && !removedIds.has(action.positionId)) {
        const position = previous.openDeposits.find((candidate) => candidate.id === action.positionId);
        if (!position) {fail('position-replay-invalid', `${row.actionId}:withdraw:${action.positionId}`);}
        consumeActivity({
            ...input,
            sourceId: position.id,
            amountIn: position.principal,
            payout: position.earlyWithdrawalAmount,
            detail: { kind: 'deposit', productId: position.productId, outcome: 'withdrawn-early' },
        });
        removedIds.add(position.id);
    }

    const expectedDeposits = previous.openDeposits.filter((position) => !removedIds.has(position.id));
    const expectedFunds = previous.openInvestments.filter((position) => !removedIds.has(position.id));
    if (action.kind === 'deposit-open') {
        if (findPreviousPosition(previous, action.positionId)) {
            fail('position-replay-invalid', `${row.actionId}:duplicate-open:${action.positionId}`);
        }
        const opened = row.state.openDeposits.find((position) => position.id === action.positionId);
        if (!opened
            || opened.productId !== action.productId
            || opened.principal !== action.amount
            || opened.startTurn !== row.turn
            || opened.openedAtOrder !== row.anchorOrder) {
            fail('position-replay-invalid', `${row.actionId}:deposit-open:${action.positionId}`);
        }
        expectedDeposits.push(opened);
    } else if (action.kind === 'fund-open') {
        if (findPreviousPosition(previous, action.positionId)) {
            fail('position-replay-invalid', `${row.actionId}:duplicate-open:${action.positionId}`);
        }
        const opened = row.state.openInvestments.find((position) => position.id === action.positionId);
        if (!opened
            || opened.productId !== action.productId
            || opened.principal !== action.amount
            || opened.startTurn !== row.turn
            || opened.openedAtOrder !== row.anchorOrder) {
            fail('position-replay-invalid', `${row.actionId}:fund-open:${action.positionId}`);
        }
        expectedFunds.push(opened);
    }
    if (!sameCanonical(row.state.openDeposits, expectedDeposits)
        || !sameCanonical(row.state.openInvestments, expectedFunds)) {
        fail('position-replay-invalid', row.actionId);
    }
}

function diceActivityDetail(
    game: TavernBankPrivateDiceGame,
    settlement: TavernBankDiceSettlement,
): TavernBankActivityDetail {
    return {
        kind: 'dice',
        result: settlement.result,
        challenger: settlement.challenger,
        finalBid: { ...settlement.finalBid },
        bids: game.bids.map((bid) => ({ ...bid })),
        playerDice: [...game.playerDice] as TavernBankPrivateDiceGame['playerDice'],
        dealerDice: [...game.dealerDice] as TavernBankPrivateDiceGame['dealerDice'],
    };
}

function pushActivityDetail(
    transition: Extract<TavernBankPushTransition, { kind: 'settled' }>,
): TavernBankActivityDetail {
    return {
        kind: 'push',
        outcome: transition.outcome,
        revealedCoins: transition.revealedCoins,
    };
}

function ladderActivityDetail(
    game: TavernBankPrivateLadderGame,
    transition: Extract<TavernBankLadderTransition, { kind: 'settled' }>,
): TavernBankActivityDetail {
    const steps = game.history.map((step) => ({
        floor: step.floor,
        choice: step.choice,
        success: true,
        amountAfterStep: step.amountAfterSuccess,
    }));
    if (transition.step) {steps.push({ ...transition.step });}
    return { kind: 'ladder', outcome: transition.outcome, steps };
}

function requireActiveGame(
    previous: TavernBankState,
    kind: NonNullable<TavernBankState['activeGame']>['kind'],
    gameId: string,
    actionId: string,
): NonNullable<TavernBankState['activeGame']> {
    const active = previous.activeGame;
    if (!active || active.kind !== kind || active.game.id !== gameId) {
        fail('game-replay-invalid', `${actionId}:${kind}:${gameId}`);
    }
    return active;
}

function requireActiveDiceGame(previous: TavernBankState, gameId: string, actionId: string): TavernBankPrivateDiceGame {
    const active = requireActiveGame(previous, 'dice', gameId, actionId);
    if (active.kind !== 'dice') {fail('game-replay-invalid', `${actionId}:dice:${gameId}`);}
    return active.game;
}

function requireActivePushGame(previous: TavernBankState, gameId: string, actionId: string): TavernBankPrivatePushGame {
    const active = requireActiveGame(previous, 'push', gameId, actionId);
    if (active.kind !== 'push') {fail('game-replay-invalid', `${actionId}:push:${gameId}`);}
    return active.game;
}

function requireActiveLadderGame(previous: TavernBankState, gameId: string, actionId: string): TavernBankPrivateLadderGame {
    const active = requireActiveGame(previous, 'ladder', gameId, actionId);
    if (active.kind !== 'ladder') {fail('game-replay-invalid', `${actionId}:ladder:${gameId}`);}
    return active.game;
}

function validateGameStart(row: TavernBankStateVersionRecord): void {
    const action = row.action;
    const active = row.state.activeGame;
    if (!active) {fail('game-replay-invalid', `${row.actionId}:start-missing`);}
    if (action.kind === 'dice-start') {
        if (active.kind !== 'dice'
            || active.game.id !== action.gameId
            || active.game.bet !== action.bet
            || active.game.startedAtTurn !== row.turn
            || active.game.startedAtOrder !== row.anchorOrder
            || active.game.bids.length !== 0) {
            fail('game-replay-invalid', `${row.actionId}:dice-start`);
        }
        return;
    }
    if (action.kind === 'push-start') {
        if (active.kind !== 'push'
            || active.game.id !== action.gameId
            || active.game.startedAtTurn !== row.turn
            || active.game.startedAtOrder !== row.anchorOrder
            || active.game.drawIndex !== 0
            || active.game.revealedCoins !== 0
            || active.game.cashoutAmount !== 0) {
            fail('game-replay-invalid', `${row.actionId}:push-start`);
        }
        return;
    }
    if (action.kind === 'ladder-start' && (
        active.kind !== 'ladder'
        || active.game.id !== action.gameId
        || active.game.bet !== action.bet
        || active.game.startedAtTurn !== row.turn
        || active.game.startedAtOrder !== row.anchorOrder
        || active.game.completedFloors !== 0
        || active.game.history.length !== 0
        || active.game.cashoutAmount !== active.game.riskBase
    )) {
        fail('game-replay-invalid', `${row.actionId}:ladder-start`);
    }
}

function consumeDiceActivity(input: {
    game: TavernBankPrivateDiceGame;
    settlement: TavernBankDiceSettlement;
    row: TavernBankStateVersionRecord;
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>;
    consumedSourceIds: Set<string>;
}): void {
    consumeActivity({
        ...input,
        sourceId: input.game.id,
        amountIn: input.game.bet,
        payout: input.settlement.payout,
        detail: diceActivityDetail(input.game, input.settlement),
    });
}

function consumePushActivity(input: {
    game: TavernBankPrivatePushGame;
    transition: Extract<TavernBankPushTransition, { kind: 'settled' }>;
    row: TavernBankStateVersionRecord;
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>;
    consumedSourceIds: Set<string>;
}): void {
    consumeActivity({
        ...input,
        sourceId: input.game.id,
        amountIn: input.game.bet,
        payout: input.transition.payout,
        detail: pushActivityDetail(input.transition),
    });
}

function consumeLadderActivity(input: {
    game: TavernBankPrivateLadderGame;
    transition: Extract<TavernBankLadderTransition, { kind: 'settled' }>;
    row: TavernBankStateVersionRecord;
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>;
    consumedSourceIds: Set<string>;
}): void {
    consumeActivity({
        ...input,
        sourceId: input.game.id,
        amountIn: input.game.bet,
        payout: input.transition.payout,
        detail: ladderActivityDetail(input.game, input.transition),
    });
}

function validateDiceBid(input: {
    previous: TavernBankState;
    row: TavernBankStateVersionRecord;
    action: Extract<TavernBankStateAction, { kind: 'dice-bid' }>;
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>;
    consumedSourceIds: Set<string>;
}): void {
    const game = requireActiveDiceGame(input.previous, input.action.gameId, input.row.actionId);
    const continued = respondToTavernBankDicePlayerBid(game, input.action.bid, LOWEST_RANDOM);
    if (input.row.state.activeGame) {
        if (continued.kind !== 'dealer-bid'
            || input.row.state.activeGame.kind !== 'dice'
            || !sameCanonical(input.row.state.activeGame.game, continued.game)) {
            fail('game-replay-invalid', `${input.row.actionId}:dice-bid-continued`);
        }
        return;
    }
    const terminal = respondToTavernBankDicePlayerBid(game, input.action.bid, HIGHEST_RANDOM);
    if (terminal.kind !== 'settled') {
        fail('game-replay-invalid', `${input.row.actionId}:dice-bid-terminal`);
    }
    const settledGame: TavernBankPrivateDiceGame = {
        ...game,
        playerDice: [...game.playerDice] as TavernBankPrivateDiceGame['playerDice'],
        dealerDice: [...game.dealerDice] as TavernBankPrivateDiceGame['dealerDice'],
        bids: [...game.bids, { by: 'player', ...input.action.bid }],
    };
    consumeDiceActivity({ ...input, game: settledGame, settlement: terminal.settlement });
}

function validatePushDraw(input: {
    previous: TavernBankState;
    row: TavernBankStateVersionRecord;
    action: Extract<TavernBankStateAction, { kind: 'push-draw' }>;
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>;
    consumedSourceIds: Set<string>;
}): void {
    const game = requireActivePushGame(input.previous, input.action.gameId, input.row.actionId);
    const transition = drawTavernBankPushCard(game);
    if (transition.kind === 'continued') {
        if (input.row.state.activeGame?.kind !== 'push'
            || !sameCanonical(input.row.state.activeGame.game, transition.game)) {
            fail('game-replay-invalid', `${input.row.actionId}:push-draw-continued`);
        }
        return;
    }
    if (input.row.state.activeGame) {fail('game-replay-invalid', `${input.row.actionId}:push-draw-terminal`);}
    consumePushActivity({ ...input, game, transition });
}

function validateLadderStep(input: {
    previous: TavernBankState;
    row: TavernBankStateVersionRecord;
    action: Extract<TavernBankStateAction, { kind: 'ladder-step' }>;
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>;
    consumedSourceIds: Set<string>;
}): void {
    const game = requireActiveLadderGame(input.previous, input.action.gameId, input.row.actionId);
    const success = stepTavernBankLadderGame(game, input.action.choice, LOWEST_RANDOM);
    if (input.row.state.activeGame) {
        if (success.kind !== 'continued'
            || input.row.state.activeGame.kind !== 'ladder'
            || !sameCanonical(input.row.state.activeGame.game, success.game)) {
            fail('game-replay-invalid', `${input.row.actionId}:ladder-step-continued`);
        }
        return;
    }
    const failure = stepTavernBankLadderGame(game, input.action.choice, HIGHEST_RANDOM);
    const activity = activityForSource(input.activitiesBySource, game.id);
    const candidates = [success, failure].filter((candidate): candidate is Extract<TavernBankLadderTransition, { kind: 'settled' }> => (
        candidate.kind === 'settled'
    ));
    const transition = candidates.find((candidate) => activityMatches({
        activity,
        row: input.row,
        amountIn: game.bet,
        payout: candidate.payout,
        detail: ladderActivityDetail(game, candidate),
    }));
    if (!transition || input.consumedSourceIds.has(game.id)) {
        fail('activity-replay-invalid', `mismatch:${input.row.actionId}:${game.id}`);
    }
    input.consumedSourceIds.add(game.id);
}

function validateGameTransition(input: {
    previous: TavernBankState;
    row: TavernBankStateVersionRecord;
    activitiesBySource: ReadonlyMap<string, TavernBankActivityRecord>;
    consumedSourceIds: Set<string>;
}): void {
    const { previous, row } = input;
    const action = row.action;
    if (action.kind === 'dice-start' || action.kind === 'push-start' || action.kind === 'ladder-start') {
        if (previous.activeGame) {fail('game-replay-invalid', `${row.actionId}:start-while-active`);}
        validateGameStart(row);
        return;
    }
    if (action.kind === 'dice-bid') {
        validateDiceBid({ ...input, action });
        return;
    }
    if (action.kind === 'dice-challenge') {
        const game = requireActiveDiceGame(previous, action.gameId, row.actionId);
        if (row.state.activeGame) {fail('game-replay-invalid', `${row.actionId}:dice-challenge-active`);}
        consumeDiceActivity({ ...input, game, settlement: challengeTavernBankDiceGame(game, 'player') });
        return;
    }
    if (action.kind === 'push-draw') {
        validatePushDraw({ ...input, action });
        return;
    }
    if (action.kind === 'push-cash-out') {
        const game = requireActivePushGame(previous, action.gameId, row.actionId);
        const transition = cashOutTavernBankPushGame(game);
        if (transition.kind !== 'settled' || row.state.activeGame) {
            fail('game-replay-invalid', `${row.actionId}:push-cash-out`);
        }
        consumePushActivity({ ...input, game, transition });
        return;
    }
    if (action.kind === 'ladder-step') {
        validateLadderStep({ ...input, action });
        return;
    }
    if (action.kind === 'ladder-cash-out') {
        const game = requireActiveLadderGame(previous, action.gameId, row.actionId);
        const transition = cashOutTavernBankLadderGame(game);
        if (row.state.activeGame) {fail('game-replay-invalid', `${row.actionId}:ladder-cash-out`);}
        consumeLadderActivity({ ...input, game, transition });
        return;
    }
    if (!sameCanonical(previous.activeGame, row.state.activeGame)) {
        fail('game-replay-invalid', `${row.actionId}:unrelated-action`);
    }
}

function validateTavernBankHistory(input: {
    versions: readonly TavernBankStateVersionRecord[];
    activities: readonly TavernBankActivityRecord[];
}): void {
    const activitiesBySource = new Map(input.activities.map((activity) => [activity.sourceId, activity]));
    if (activitiesBySource.size !== input.activities.length) {
        fail('activity-replay-invalid', 'source-id-duplicate');
    }
    const consumedSourceIds = new Set<string>();
    let previous = emptyState();
    let previousTurn = -1;
    for (const row of input.versions) {
        if (!Number.isSafeInteger(row.turn) || row.turn < 0 || row.turn < previousTurn) {
            fail('version-replay-invalid', `${row.actionId}:turn`);
        }
        validatePositionTransition({ previous, row, activitiesBySource, consumedSourceIds });
        validateGameTransition({ previous, row, activitiesBySource, consumedSourceIds });
        previous = row.state;
        previousTurn = row.turn;
    }
    const orphan = input.activities.find((activity) => !consumedSourceIds.has(activity.sourceId));
    if (orphan) {fail('activity-replay-invalid', `orphan:${orphan.sourceId}`);}
}

/**
 * Replays every persisted Bank action against the previous private state. This
 * is intentionally separate from single-record invariants: a valid frame can
 * still be an impossible transition.
 */
export function findTavernBankHistoryInvariantViolation(input: {
    versions: readonly TavernBankStateVersionRecord[];
    activities: readonly TavernBankActivityRecord[];
}): TavernBankHistoryViolation | null {
    try {
        validateTavernBankHistory(input);
        return null;
    } catch (error) {
        if (error instanceof TavernBankHistoryViolationError) {return error.violation;}
        return {
            code: 'game-replay-invalid',
            detail: error instanceof Error ? error.message : String(error || 'unknown'),
        };
    }
}
