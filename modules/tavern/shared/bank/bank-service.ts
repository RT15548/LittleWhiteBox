import db, {
    tavernBankActivitiesTable,
    tavernBankStateVersionsTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernMessagesTable,
    tavernSessionsTable,
    type TavernSessionRecord,
} from '../session-db';
import {
    ensureTavernEconomyInCurrentDbTransaction,
    postTavernEconomyTransactionInCurrentDbTransaction,
} from '../economy/economy-service';
import {
    throwTavernEconomyError,
} from '../economy/economy-errors';
import {
    TAVERN_ECONOMY_OPENING_GRANT,
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
    type TavernEconomyTransactionRecord,
} from '../economy/economy-types';
import {
    assertTavernPhoneBoundaryInCurrentTransaction,
    tavernPhoneBoundaryAnchorOrder,
} from '../phone-boundary';
import {
    createTavernBankDepositContract,
    createTavernBankFundContract,
    assertTavernBankProductAmount,
    getTavernBankDepositProduct,
    getTavernBankFundProduct,
} from './bank-products';
import {
    assertTavernBankActivityInvariant,
    assertTavernBankStateInvariant,
} from './bank-invariants';
import {
    drawTavernBankInclusiveInteger,
    tavernBankRandomSource,
    type TavernBankRandomSource,
} from './bank-random';
import {
    challengeTavernBankDiceGame as resolveTavernBankDiceChallenge,
    createTavernBankDiceGame,
    normalizeTavernBankDiceBet,
    normalizeTavernBankDiceBid,
    respondToTavernBankDicePlayerBid,
} from './games/dice-bluff';
import {
    cashOutTavernBankPushGame as resolveTavernBankPushCashOut,
    createTavernBankPushGame,
    drawTavernBankPushCard as resolveTavernBankPushDraw,
    TAVERN_BANK_PUSH_BET,
} from './games/push-your-luck';
import {
    cashOutTavernBankLadderGame as resolveTavernBankLadderCashOut,
    createTavernBankLadderGame,
    getTavernBankLadderOption,
    normalizeTavernBankLadderBet,
    stepTavernBankLadderGame as resolveTavernBankLadderStep,
} from './games/risk-ladder';
import {
    TAVERN_BANK_CURRENT_MARKER,
    throwTavernBankError,
    type BidTavernBankDiceGameInput,
    type CashOutTavernBankLadderGameInput,
    type CashOutTavernBankPushGameInput,
    type ChallengeTavernBankDiceGameInput,
    type DrawTavernBankPushCardInput,
    type OpenTavernBankDepositInput,
    type OpenTavernBankFundInput,
    type SettleDueTavernBankPositionsInput,
    type StartTavernBankDiceGameInput,
    type StartTavernBankLadderGameInput,
    type StartTavernBankPushGameInput,
    type StepTavernBankLadderGameInput,
    type TavernBankActivityRecord,
    type TavernBankDiceBid,
    type TavernBankMutationBoundary,
    type TavernBankMutationResult,
    type TavernBankState,
    type TavernBankStateAction,
    type TavernBankStateVersionRecord,
    type TavernBankStateVersionReceipt,
    type WithdrawTavernBankDepositEarlyInput,
} from './bank-types';
import {
    createTavernBankView,
} from './bank-view';

function now(): number {
    return Date.now();
}

function createId(prefix: string): string {
    return `${prefix}-${now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clone<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function versionReceipt(record: TavernBankStateVersionRecord | null): TavernBankStateVersionReceipt | null {
    if (!record) {return null;}
    return {
        sessionId: record.sessionId,
        revision: record.revision,
        versionId: record.versionId,
        actionId: record.actionId,
        action: clone(record.action),
        anchorOrder: record.anchorOrder,
        turn: record.turn,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

function normalizeSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId) {throwTavernBankError('bank_session_required');}
    return sessionId;
}

function normalizeActionId(value = ''): string {
    const actionId = String(value || '').trim().slice(0, 220);
    if (!actionId) {throwTavernBankError('bank_action_required');}
    return actionId;
}

function normalizeExpectedRevision(value: unknown): number {
    const revision = Number(value);
    if (!Number.isSafeInteger(revision) || revision < 0) {
        throwTavernBankError('bank_revision_invalid', String(value));
    }
    return revision;
}

function normalizeExpectedVersionId(value: unknown, expectedRevision: number): string {
    const versionId = String(value ?? '').trim();
    if (expectedRevision === 0) {return '';}
    if (!versionId || versionId.length > 220) {
        throwTavernBankError('bank_version_id_invalid', versionId);
    }
    return versionId;
}

function normalizeAnchorOrder(value: unknown): number {
    const anchorOrder = Number(value);
    if (!Number.isSafeInteger(anchorOrder) || anchorOrder < 0) {
        throwTavernBankError('bank_anchor_order_invalid', String(value));
    }
    return anchorOrder;
}

function normalizeGameId(value = ''): string {
    const gameId = String(value || '').trim();
    if (!gameId) {throwTavernBankError('bank_game_id_required');}
    return gameId;
}

function normalizePositionId(value = ''): string {
    const positionId = String(value || '').trim();
    if (!positionId) {throwTavernBankError('bank_game_action_invalid', 'position');}
    return positionId;
}

function normalizeTurn(session: TavernSessionRecord): number {
    const turn = Number(session.state?.turn);
    return Number.isSafeInteger(turn) && turn >= 0 ? turn : 0;
}

async function findActionVersion(sessionId: string, actionId: string): Promise<TavernBankStateVersionRecord | null> {
    const rows = await tavernBankStateVersionsTable.where('[sessionId+actionId]').equals([sessionId, actionId]).toArray();
    return rows[0] || null;
}

async function getCurrentVersionInTransaction(sessionId: string): Promise<TavernBankStateVersionRecord | null> {
    const rows = await tavernBankStateVersionsTable
        .where('[sessionId+currentMarker]')
        .equals([sessionId, TAVERN_BANK_CURRENT_MARKER])
        .toArray();
    return rows[0] || null;
}

async function readPlayerBalanceInTransaction(sessionId: string, allowUnopened: boolean): Promise<number> {
    const player = await tavernEconomyAccountsTable.get([sessionId, TAVERN_PLAYER_ACCOUNT_ID]);
    if (!player) {
        if (allowUnopened) {return TAVERN_ECONOMY_OPENING_GRANT;}
        throwTavernEconomyError('economy_account_state_invalid', TAVERN_PLAYER_ACCOUNT_ID);
    }
    if (!Number.isSafeInteger(player.balance) || player.balance < 0) {
        throwTavernEconomyError('economy_account_state_invalid', TAVERN_PLAYER_ACCOUNT_ID);
    }
    return player.balance;
}

function assertVersionCas(
    current: TavernBankStateVersionRecord | null,
    expectedRevision: number,
    expectedVersionId: string,
): void {
    if (!current) {
        if (expectedRevision !== 0) {throwTavernBankError('bank_revision_conflict', `${expectedRevision}:empty`);}
        return;
    }
    if (current.revision !== expectedRevision) {
        throwTavernBankError('bank_revision_conflict', `${expectedRevision}:${current.revision}`);
    }
    if (current.versionId !== expectedVersionId) {
        throwTavernBankError('bank_version_conflict', `${expectedVersionId}:${current.versionId}`);
    }
}

type RequestedAction =
    | { kind: 'deposit-open'; productId: string; amount: number }
    | { kind: 'deposit-withdraw-early'; positionId: string }
    | { kind: 'fund-open'; productId: string; amount: number }
    | { kind: 'settle-due' }
    | { kind: 'dice-start'; bet: number }
    | { kind: 'dice-bid'; gameId: string; bid: Pick<TavernBankDiceBid, 'count' | 'face'> }
    | { kind: 'dice-challenge'; gameId: string }
    | { kind: 'push-start' }
    | { kind: 'push-draw'; gameId: string }
    | { kind: 'push-cash-out'; gameId: string }
    | { kind: 'ladder-start'; bet: number }
    | { kind: 'ladder-step'; gameId: string; choice: 'safe' | 'medium' | 'risky' }
    | { kind: 'ladder-cash-out'; gameId: string };

function actionMatchesRequest(action: TavernBankStateAction, request: RequestedAction): boolean {
    if (action.kind !== request.kind) {return false;}
    if (request.kind === 'deposit-open' || request.kind === 'fund-open') {
        const stored = action as Extract<TavernBankStateAction, { kind: 'deposit-open' | 'fund-open' }>;
        return stored.productId === request.productId && stored.amount === request.amount;
    }
    if (request.kind === 'deposit-withdraw-early') {
        return (action as Extract<TavernBankStateAction, { kind: 'deposit-withdraw-early' }>).positionId === request.positionId;
    }
    if (request.kind === 'dice-start' || request.kind === 'ladder-start') {
        return (action as Extract<TavernBankStateAction, { kind: 'dice-start' | 'ladder-start' }>).bet === request.bet;
    }
    if (request.kind === 'dice-bid') {
        const stored = action as Extract<TavernBankStateAction, { kind: 'dice-bid' }>;
        return stored.gameId === request.gameId && stored.bid.count === request.bid.count && stored.bid.face === request.bid.face;
    }
    if (request.kind === 'ladder-step') {
        const stored = action as Extract<TavernBankStateAction, { kind: 'ladder-step' }>;
        return stored.gameId === request.gameId && stored.choice === request.choice;
    }
    if (request.kind === 'dice-challenge' || request.kind === 'push-draw' || request.kind === 'push-cash-out'
        || request.kind === 'ladder-cash-out') {
        return (action as Extract<TavernBankStateAction, { kind: typeof request.kind }>).gameId === request.gameId;
    }
    return true;
}

function actionWithSettlements(
    action: Omit<TavernBankStateAction, 'settledPositionIds'>,
    settledPositionIds: string[],
): TavernBankStateAction {
    return { ...action, settledPositionIds } as TavernBankStateAction;
}

function copyState(current: TavernBankStateVersionRecord | null): TavernBankState {
    const state = current ? clone(current.state) : { openDeposits: [], openInvestments: [] };
    assertTavernBankStateInvariant(state);
    return state;
}

async function appendVersionInTransaction(
    current: TavernBankStateVersionRecord | null,
    next: TavernBankStateVersionRecord,
): Promise<void> {
    if (current) {
        const previous = clone(current);
        delete previous.currentMarker;
        await tavernBankStateVersionsTable.put(previous);
    }
    await (tavernBankStateVersionsTable as unknown as {
        add(record: TavernBankStateVersionRecord): Promise<unknown>;
    }).add(next);
}

function activitySourceIdsForAction(record: TavernBankStateVersionRecord): string[] {
    const ids = new Set(record.action.settledPositionIds);
    const action = record.action;
    if (action.kind === 'deposit-withdraw-early') {
        ids.add(action.positionId);
    } else if (
        action.kind === 'dice-challenge'
        || action.kind === 'push-cash-out'
        || action.kind === 'ladder-cash-out'
    ) {
        ids.add(action.gameId);
    } else if (
        action.kind === 'dice-bid'
        || action.kind === 'push-draw'
        || action.kind === 'ladder-step'
    ) {
        if (record.state.activeGame?.game.id !== action.gameId) {ids.add(action.gameId);}
    }
    return [...ids];
}

async function listActivitiesBySourceIds(
    sessionId: string,
    sourceIds: readonly string[],
): Promise<TavernBankActivityRecord[]> {
    const activities = await Promise.all(sourceIds.map(async (sourceId) => {
        const rows = await tavernBankActivitiesTable
            .where('[sessionId+sourceId]')
            .equals([sessionId, sourceId])
            .toArray();
        return rows[0] || null;
    }));
    return activities
        .filter((activity): activity is TavernBankActivityRecord => Boolean(activity))
        .sort((left, right) => right.createdAt - left.createdAt || right.id.localeCompare(left.id))
        .map((activity) => clone(activity));
}

async function listActionActivities(record: TavernBankStateVersionRecord): Promise<TavernBankActivityRecord[]> {
    return await listActivitiesBySourceIds(record.sessionId, activitySourceIdsForAction(record));
}

async function postBankTransaction(input: {
    sessionId: string;
    idempotencyKey: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    kind: string;
    title: string;
    sourceId: string;
    anchorOrder: number;
}): Promise<TavernEconomyTransactionRecord> {
    return await postTavernEconomyTransactionInCurrentDbTransaction({
        ...input,
        sourceDomain: 'bank',
        note: '',
    }, { touchSessionOnCreate: false });
}

interface MutationContext {
    sessionId: string;
    anchorOrder: number;
    currentTurn: number;
    state: TavernBankState;
    settledPositionIds: string[];
    activities: TavernBankActivityRecord[];
    random: TavernBankRandomSource;
    playerBalance: number;
    postCredit: (
        sourceId: string,
        amount: number,
        title: string,
        key: string,
        kind: 'bank_settlement' | 'bank_payout',
    ) => Promise<void>;
}

function activityBase(input: {
    sessionId: string;
    sourceId: string;
    amountIn: number;
    payout: number;
    anchorOrder: number;
    detail: TavernBankActivityRecord['detail'];
}): TavernBankActivityRecord {
    const record: TavernBankActivityRecord = {
        sessionId: input.sessionId,
        id: createId('bank-activity'),
        sourceId: input.sourceId,
        detail: input.detail,
        amountIn: input.amountIn,
        payout: input.payout,
        net: input.payout - input.amountIn,
        anchorOrder: input.anchorOrder,
        createdAt: now(),
    };
    assertTavernBankActivityInvariant(record);
    return record;
}

async function settleDuePositions(context: MutationContext): Promise<void> {
    const dueDeposits = context.state.openDeposits.filter((position) => position.maturityTurn <= context.currentTurn);
    const dueFunds = context.state.openInvestments.filter((position) => position.maturityTurn <= context.currentTurn);
    for (const position of dueDeposits) {
        await context.postCredit(position.id, position.maturityAmount, '存单到期结算', `bank:settle:${position.id}`, 'bank_settlement');
        context.activities.push(activityBase({
            sessionId: context.sessionId,
            sourceId: position.id,
            amountIn: position.principal,
            payout: position.maturityAmount,
            anchorOrder: context.anchorOrder,
            detail: { kind: 'deposit', productId: position.productId, outcome: 'matured' },
        }));
        context.settledPositionIds.push(position.id);
    }
    for (const position of dueFunds) {
        await context.postCredit(position.id, position.settlementAmount, '理财到期结算', `bank:settle:${position.id}`, 'bank_settlement');
        context.activities.push(activityBase({
            sessionId: context.sessionId,
            sourceId: position.id,
            amountIn: position.principal,
            payout: position.settlementAmount,
            anchorOrder: context.anchorOrder,
            detail: { kind: 'fund', productId: position.productId, resolvedReturnBps: position.resolvedReturnBps },
        }));
        context.settledPositionIds.push(position.id);
    }
    if (dueDeposits.length) {
        const dueIds = new Set(dueDeposits.map((position) => position.id));
        context.state.openDeposits = context.state.openDeposits.filter((position) => !dueIds.has(position.id));
    }
    if (dueFunds.length) {
        const dueIds = new Set(dueFunds.map((position) => position.id));
        context.state.openInvestments = context.state.openInvestments.filter((position) => !dueIds.has(position.id));
    }
}

function hasDuePositions(state: TavernBankState, currentTurn: number): boolean {
    return state.openDeposits.some((position) => position.maturityTurn <= currentTurn)
        || state.openInvestments.some((position) => position.maturityTurn <= currentTurn);
}

interface TavernBankServiceOptions {
    random?: TavernBankRandomSource;
}

async function runTavernBankMutation(
    boundary: TavernBankMutationBoundary,
    request: RequestedAction,
    options: TavernBankServiceOptions,
    execute: (context: MutationContext) => Promise<Omit<TavernBankStateAction, 'settledPositionIds'> | null>,
): Promise<TavernBankMutationResult> {
    const sessionId = normalizeSessionId(boundary.sessionId);
    const actionId = normalizeActionId(boundary.actionId);
    const expectedRevision = normalizeExpectedRevision(boundary.expectedRevision);
    const expectedVersionId = normalizeExpectedVersionId(boundary.expectedVersionId, expectedRevision);
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernBankStateVersionsTable,
        tavernBankActivitiesTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const [session, replay, current] = await Promise.all([
                tavernSessionsTable.get(sessionId),
                findActionVersion(sessionId, actionId),
                getCurrentVersionInTransaction(sessionId),
            ]);
            if (!session) {throwTavernBankError('bank_session_missing', sessionId);}
            if (replay) {
                if (!actionMatchesRequest(replay.action, request)) {throwTavernBankError('bank_action_conflict', actionId);}
                return {
                    record: versionReceipt(current || replay),
                    actionRecord: versionReceipt(replay),
                    playerBalance: await readPlayerBalanceInTransaction(sessionId, false),
                    activities: await listActionActivities(replay),
                    replay: true,
                    changed: false,
                };
            }
            const anchorOrder = normalizeAnchorOrder(tavernPhoneBoundaryAnchorOrder(boundary.boundary));
            await assertTavernPhoneBoundaryInCurrentTransaction(sessionId, boundary.boundary);
            assertVersionCas(current, expectedRevision, expectedVersionId);
            if (current && anchorOrder < current.anchorOrder) {
                throwTavernBankError('bank_anchor_order_regression', `${anchorOrder}<${current.anchorOrder}`);
            }
            const state = copyState(current);
            const currentTurn = normalizeTurn(session);
            if (current && current.turn > currentTurn) {
                throwTavernBankError('bank_turn_regression', `${current.turn}>${currentTurn}`);
            }
            if (request.kind === 'settle-due' && !hasDuePositions(state, currentTurn)) {
                return {
                    record: versionReceipt(current),
                    actionRecord: null,
                    playerBalance: await readPlayerBalanceInTransaction(sessionId, !current),
                    activities: [],
                    replay: false,
                    changed: false,
                };
            }
            const economy = await ensureTavernEconomyInCurrentDbTransaction(sessionId);
            const activities: TavernBankActivityRecord[] = [];
            const context: MutationContext = {
                sessionId,
                anchorOrder,
                currentTurn,
                state,
                settledPositionIds: [],
                activities,
                random: options.random || tavernBankRandomSource,
                playerBalance: economy.playerBalance,
                postCredit: async (sourceId, amount, title, key, kind) => {
                    const transaction = await postBankTransaction({
                        sessionId,
                        idempotencyKey: key,
                        fromAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
                        toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
                        amount,
                        kind,
                        title,
                        sourceId,
                        anchorOrder,
                    });
                    context.playerBalance = transaction.playerBalanceAfter;
                },
            };
            await settleDuePositions(context);
            const action = await execute(context);
            if (!action && context.settledPositionIds.length === 0) {
                return {
                    record: versionReceipt(current),
                    actionRecord: null,
                    playerBalance: context.playerBalance,
                    activities: [],
                    replay: false,
                    changed: false,
                };
            }
            const completedAction = actionWithSettlements(action || { kind: 'settle-due' }, context.settledPositionIds);
            assertTavernBankStateInvariant(context.state);
            const timestamp = now();
            const next: TavernBankStateVersionRecord = {
                sessionId,
                revision: current ? current.revision + 1 : 1,
                versionId: createId('bank-version'),
                currentMarker: TAVERN_BANK_CURRENT_MARKER,
                actionId,
                action: completedAction,
                anchorOrder,
                turn: currentTurn,
                state: clone(context.state),
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            await appendVersionInTransaction(current, next);
            if (activities.length) {
                await (tavernBankActivitiesTable as unknown as {
                    bulkAdd(records: TavernBankActivityRecord[]): Promise<unknown>;
                }).bulkAdd(activities);
            }
            await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
            return {
                record: versionReceipt(next),
                actionRecord: versionReceipt(next),
                playerBalance: context.playerBalance,
                activities: activities.map((activity) => clone(activity)),
                replay: false,
                changed: true,
            };
        },
    );
}

function assertPlayerCanPay(context: MutationContext, amount: number): void {
    if (context.playerBalance < amount) {
        throwTavernEconomyError('economy_balance_insufficient', TAVERN_PLAYER_ACCOUNT_ID);
    }
}

async function postBankDebit(context: MutationContext, input: {
    sourceId: string;
    amount: number;
    title: string;
    kind: 'bank_deposit_lock' | 'bank_fund_lock' | 'bank_wager';
    idempotencyKey: string;
}): Promise<void> {
    const transaction = await postBankTransaction({
        sessionId: context.sessionId,
        idempotencyKey: input.idempotencyKey,
        fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
        toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
        amount: input.amount,
        kind: input.kind,
        title: input.title,
        sourceId: input.sourceId,
        anchorOrder: context.anchorOrder,
    });
    context.playerBalance = transaction.playerBalanceAfter;
}

function assertNoActiveGame(state: TavernBankState): void {
    if (state.activeGame) {throwTavernBankError('bank_game_active', state.activeGame.game.id);}
}

function getActiveGame(
    state: TavernBankState,
    kind: NonNullable<TavernBankState['activeGame']>['kind'],
    gameId: string,
): NonNullable<TavernBankState['activeGame']> {
    const active = state.activeGame;
    if (!active) {throwTavernBankError('bank_game_missing');}
    if (active.kind !== kind) {throwTavernBankError('bank_game_kind_conflict', `${active.kind}:${String(kind)}`);}
    if (active.game.id !== gameId) {throwTavernBankError('bank_game_missing', gameId);}
    return active;
}

function getActiveDiceGame(state: TavernBankState, gameId: string) {
    const active = getActiveGame(state, 'dice', gameId);
    return active.game as Extract<NonNullable<TavernBankState['activeGame']>, { kind: 'dice' }>['game'];
}

function getActivePushGame(state: TavernBankState, gameId: string) {
    const active = getActiveGame(state, 'push', gameId);
    return active.game as Extract<NonNullable<TavernBankState['activeGame']>, { kind: 'push' }>['game'];
}

function getActiveLadderGame(state: TavernBankState, gameId: string) {
    const active = getActiveGame(state, 'ladder', gameId);
    return active.game as Extract<NonNullable<TavernBankState['activeGame']>, { kind: 'ladder' }>['game'];
}

function appendDiceActivity(
    context: MutationContext,
    game: Extract<NonNullable<TavernBankState['activeGame']>, { kind: 'dice' }>['game'],
    settlement: ReturnType<typeof resolveTavernBankDiceChallenge>,
): void {
    context.activities.push(activityBase({
        sessionId: context.sessionId,
        sourceId: game.id,
        amountIn: game.bet,
        payout: settlement.payout,
        anchorOrder: context.anchorOrder,
        detail: {
            kind: 'dice',
            result: settlement.result,
            challenger: settlement.challenger,
            finalBid: settlement.finalBid,
            bids: game.bids.map((bid) => ({ ...bid })),
            playerDice: [...game.playerDice],
            dealerDice: [...game.dealerDice],
        },
    }));
}

export async function getCurrentTavernBankState(sessionId = ''): Promise<TavernBankStateVersionRecord | null> {
    const id = normalizeSessionId(sessionId);
    const current = await getCurrentVersionInTransaction(id);
    return current ? clone(current) : null;
}

export async function getCurrentTavernBankView(sessionId = '') {
    const id = normalizeSessionId(sessionId);
    const [session, record] = await Promise.all([
        tavernSessionsTable.get(id),
        getCurrentVersionInTransaction(id),
    ]);
    if (!session) {throwTavernBankError('bank_session_missing', id);}
    return createTavernBankView({ currentTurn: normalizeTurn(session), record });
}

interface BankActivityRangeCollection {
    reverse(): BankActivityRangeCollection;
    limit(count: number): BankActivityRangeCollection;
    toArray(): Promise<TavernBankActivityRecord[]>;
}

interface BankActivityRangeTable {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): BankActivityRangeCollection;
    };
}

export async function listTavernBankActivities(sessionId = '', options: { limit?: number } = {}): Promise<TavernBankActivityRecord[]> {
    const id = normalizeSessionId(sessionId);
    const limit = Math.min(50, Math.max(1, Math.floor(Number(options.limit) || 50)));
    const rows = await (tavernBankActivitiesTable as unknown as BankActivityRangeTable)
        .where('[sessionId+createdAt]')
        .between([id, 0], [id, Number.MAX_SAFE_INTEGER], true, true)
        .reverse()
        .limit(limit)
        .toArray();
    return rows
        .sort((left, right) => right.createdAt - left.createdAt || right.id.localeCompare(left.id))
        .map((row) => clone(row));
}

export async function listTavernBankActivitiesBySourceIds(
    sessionId = '',
    sourceIds: readonly string[] = [],
): Promise<TavernBankActivityRecord[]> {
    const id = normalizeSessionId(sessionId);
    const normalizedSourceIds = [...new Set(sourceIds.map((value) => String(value || '').trim()).filter(Boolean))];
    if (!normalizedSourceIds.length) {return [];}
    return await listActivitiesBySourceIds(id, normalizedSourceIds);
}

export async function openTavernBankDeposit(input: OpenTavernBankDepositInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const product = getTavernBankDepositProduct(input.productId);
    const amount = assertTavernBankProductAmount(product, input.amount);
    const contract = createTavernBankDepositContract(product, amount);
    return await runTavernBankMutation(input, { kind: 'deposit-open', productId: product.id, amount }, options, async (context) => {
        assertPlayerCanPay(context, amount);
        const positionId = createId('bank-deposit');
        await postBankDebit(context, {
            sourceId: positionId,
            amount,
            title: '存入定期',
            kind: 'bank_deposit_lock',
            idempotencyKey: `bank:lock:${positionId}`,
        });
        context.state.openDeposits.push({
            id: positionId,
            productId: product.id,
            principal: amount,
            startTurn: context.currentTurn,
            maturityTurn: context.currentTurn + product.lockRounds,
            ...contract,
            openedAtOrder: context.anchorOrder,
            openedAt: now(),
        });
        return { kind: 'deposit-open', productId: product.id, positionId, amount };
    });
}

export async function withdrawTavernBankDepositEarly(input: WithdrawTavernBankDepositEarlyInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const positionId = normalizePositionId(input.positionId);
    return await runTavernBankMutation(input, { kind: 'deposit-withdraw-early', positionId }, options, async (context) => {
        const index = context.state.openDeposits.findIndex((position) => position.id === positionId);
        if (index < 0 && context.settledPositionIds.includes(positionId)) {
            return { kind: 'deposit-withdraw-early', positionId };
        }
        if (index < 0) {throwTavernBankError('bank_game_action_invalid', 'deposit-missing');}
        const [position] = context.state.openDeposits.splice(index, 1);
        await context.postCredit(position.id, position.earlyWithdrawalAmount, '存单提前支取', `bank:settle:${position.id}`, 'bank_settlement');
        context.activities.push(activityBase({
            sessionId: context.sessionId,
            sourceId: position.id,
            amountIn: position.principal,
            payout: position.earlyWithdrawalAmount,
            anchorOrder: context.anchorOrder,
            detail: { kind: 'deposit', productId: position.productId, outcome: 'withdrawn-early' },
        }));
        return { kind: 'deposit-withdraw-early', positionId };
    });
}

export async function openTavernBankFund(input: OpenTavernBankFundInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const product = getTavernBankFundProduct(input.productId);
    const principal = assertTavernBankProductAmount(product, input.amount);
    return await runTavernBankMutation(input, { kind: 'fund-open', productId: product.id, amount: principal }, options, async (context) => {
        assertPlayerCanPay(context, principal);
        const resolvedReturnBps = drawTavernBankInclusiveInteger(
            product.returnRangeBps.min,
            product.returnRangeBps.max,
            context.random,
        );
        const contract = createTavernBankFundContract(product, principal, resolvedReturnBps);
        const positionId = createId('bank-fund');
        await postBankDebit(context, {
            sourceId: positionId,
            amount: principal,
            title: '买入理财',
            kind: 'bank_fund_lock',
            idempotencyKey: `bank:lock:${positionId}`,
        });
        context.state.openInvestments.push({
            id: positionId,
            productId: product.id,
            principal,
            startTurn: context.currentTurn,
            maturityTurn: context.currentTurn + product.lockRounds,
            ...contract,
            openedAtOrder: context.anchorOrder,
            openedAt: now(),
        });
        return { kind: 'fund-open', productId: product.id, positionId, amount: principal };
    });
}

export async function settleDueTavernBankPositions(input: SettleDueTavernBankPositionsInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    return await runTavernBankMutation(input, { kind: 'settle-due' }, options, async () => null);
}

export async function startTavernBankDiceGame(input: StartTavernBankDiceGameInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const bet = normalizeTavernBankDiceBet(input.bet);
    return await runTavernBankMutation(input, { kind: 'dice-start', bet }, options, async (context) => {
        assertNoActiveGame(context.state);
        assertPlayerCanPay(context, bet);
        const game = createTavernBankDiceGame({
            id: createId('bank-dice'),
            bet,
            startedAtTurn: context.currentTurn,
            startedAtOrder: context.anchorOrder,
            createdAt: now(),
        }, context.random);
        await postBankDebit(context, {
            sourceId: game.id,
            amount: game.bet,
            title: '骰局下注',
            kind: 'bank_wager',
            idempotencyKey: `bank:wager:${game.id}`,
        });
        context.state.activeGame = { kind: 'dice', game };
        return { kind: 'dice-start', gameId: game.id, bet };
    });
}

export async function bidTavernBankDiceGame(input: BidTavernBankDiceGameInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const gameId = normalizeGameId(input.gameId);
    const normalizedBid = normalizeTavernBankDiceBid(input.bid, 'player');
    const bid = { count: normalizedBid.count, face: normalizedBid.face };
    return await runTavernBankMutation(input, { kind: 'dice-bid', gameId, bid }, options, async (context) => {
        const game = getActiveDiceGame(context.state, gameId);
        const response = respondToTavernBankDicePlayerBid(game, bid, context.random);
        if (response.kind === 'dealer-bid') {
            context.state.activeGame = { kind: 'dice', game: response.game };
            return { kind: 'dice-bid', gameId, bid };
        }
        const settledGame = { ...game, bids: [...game.bids, normalizedBid] };
        appendDiceActivity(context, settledGame, response.settlement);
        if (response.settlement.payout > 0) {
            await context.postCredit(gameId, response.settlement.payout, '骰局获胜', `bank:payout:${gameId}`, 'bank_payout');
        }
        context.state.activeGame = undefined;
        return { kind: 'dice-bid', gameId, bid };
    });
}

export async function challengeTavernBankDiceGame(input: ChallengeTavernBankDiceGameInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const gameId = normalizeGameId(input.gameId);
    return await runTavernBankMutation(input, { kind: 'dice-challenge', gameId }, options, async (context) => {
        const game = getActiveDiceGame(context.state, gameId);
        const settlement = resolveTavernBankDiceChallenge(game, 'player');
        appendDiceActivity(context, game, settlement);
        if (settlement.payout > 0) {
            await context.postCredit(gameId, settlement.payout, '骰局获胜', `bank:payout:${gameId}`, 'bank_payout');
        }
        context.state.activeGame = undefined;
        return { kind: 'dice-challenge', gameId };
    });
}

export async function startTavernBankPushGame(input: StartTavernBankPushGameInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    return await runTavernBankMutation(input, { kind: 'push-start' }, options, async (context) => {
        assertNoActiveGame(context.state);
        assertPlayerCanPay(context, TAVERN_BANK_PUSH_BET);
        const game = createTavernBankPushGame({
            id: createId('bank-push'),
            startedAtTurn: context.currentTurn,
            startedAtOrder: context.anchorOrder,
            createdAt: now(),
        }, context.random);
        await postBankDebit(context, {
            sourceId: game.id,
            amount: game.bet,
            title: '翻倍或收手入场',
            kind: 'bank_wager',
            idempotencyKey: `bank:wager:${game.id}`,
        });
        context.state.activeGame = { kind: 'push', game };
        return { kind: 'push-start', gameId: game.id };
    });
}

async function finishPushGame(
    context: MutationContext,
    game: Extract<NonNullable<TavernBankState['activeGame']>, { kind: 'push' }>['game'],
    transition: Exclude<ReturnType<typeof resolveTavernBankPushDraw>, { kind: 'continued' }>,
): Promise<void> {
    context.activities.push(activityBase({
        sessionId: context.sessionId,
        sourceId: game.id,
        amountIn: game.bet,
        payout: transition.payout,
        anchorOrder: context.anchorOrder,
        detail: { kind: 'push', outcome: transition.outcome, revealedCoins: transition.revealedCoins },
    }));
    if (transition.payout > 0) {
        await context.postCredit(game.id, transition.payout, '翻倍或收手结算', `bank:payout:${game.id}`, 'bank_payout');
    }
    context.state.activeGame = undefined;
}

export async function drawTavernBankPushCard(input: DrawTavernBankPushCardInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const gameId = normalizeGameId(input.gameId);
    return await runTavernBankMutation(input, { kind: 'push-draw', gameId }, options, async (context) => {
        const game = getActivePushGame(context.state, gameId);
        const transition = resolveTavernBankPushDraw(game);
        if (transition.kind === 'continued') {
            context.state.activeGame = { kind: 'push', game: transition.game };
        } else {
            await finishPushGame(context, game, transition);
        }
        return { kind: 'push-draw', gameId };
    });
}

export async function cashOutTavernBankPushGame(input: CashOutTavernBankPushGameInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const gameId = normalizeGameId(input.gameId);
    return await runTavernBankMutation(input, { kind: 'push-cash-out', gameId }, options, async (context) => {
        const game = getActivePushGame(context.state, gameId);
        const transition = resolveTavernBankPushCashOut(game);
        if (transition.kind === 'continued') {throwTavernBankError('bank_game_invalid', 'push-cashout');}
        await finishPushGame(context, game, transition);
        return { kind: 'push-cash-out', gameId };
    });
}

function ladderActivitySteps(
    game: Extract<NonNullable<TavernBankState['activeGame']>, { kind: 'ladder' }>['game'],
    transition: Exclude<ReturnType<typeof resolveTavernBankLadderStep>, { kind: 'continued' }> | null,
) {
    const steps = game.history.map((step) => ({
        floor: step.floor,
        choice: step.choice,
        success: true,
        amountAfterStep: step.amountAfterSuccess,
    }));
    if (transition?.step) {steps.push(transition.step);}
    return steps;
}

async function finishLadderGame(
    context: MutationContext,
    game: Extract<NonNullable<TavernBankState['activeGame']>, { kind: 'ladder' }>['game'],
    transition: Exclude<ReturnType<typeof resolveTavernBankLadderStep>, { kind: 'continued' }> | ReturnType<typeof resolveTavernBankLadderCashOut>,
): Promise<void> {
    context.activities.push(activityBase({
        sessionId: context.sessionId,
        sourceId: game.id,
        amountIn: game.bet,
        payout: transition.payout,
        anchorOrder: context.anchorOrder,
        detail: { kind: 'ladder', outcome: transition.outcome, steps: ladderActivitySteps(game, 'step' in transition ? transition : null) },
    }));
    if (transition.payout > 0) {
        await context.postCredit(game.id, transition.payout, '风险阶梯结算', `bank:payout:${game.id}`, 'bank_payout');
    }
    context.state.activeGame = undefined;
}

export async function startTavernBankLadderGame(input: StartTavernBankLadderGameInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const bet = normalizeTavernBankLadderBet(input.bet);
    return await runTavernBankMutation(input, { kind: 'ladder-start', bet }, options, async (context) => {
        assertNoActiveGame(context.state);
        assertPlayerCanPay(context, bet);
        const game = createTavernBankLadderGame({
            id: createId('bank-ladder'),
            bet,
            startedAtTurn: context.currentTurn,
            startedAtOrder: context.anchorOrder,
            createdAt: now(),
        });
        await postBankDebit(context, {
            sourceId: game.id,
            amount: game.bet,
            title: '风险阶梯下注',
            kind: 'bank_wager',
            idempotencyKey: `bank:wager:${game.id}`,
        });
        context.state.activeGame = { kind: 'ladder', game };
        return { kind: 'ladder-start', gameId: game.id, bet };
    });
}

export async function stepTavernBankLadderGame(input: StepTavernBankLadderGameInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const gameId = normalizeGameId(input.gameId);
    const choice = getTavernBankLadderOption(input.choice).choice;
    return await runTavernBankMutation(input, { kind: 'ladder-step', gameId, choice }, options, async (context) => {
        const game = getActiveLadderGame(context.state, gameId);
        const transition = resolveTavernBankLadderStep(game, choice, context.random);
        if (transition.kind === 'continued') {
            context.state.activeGame = { kind: 'ladder', game: transition.game };
        } else {
            await finishLadderGame(context, game, transition);
        }
        return { kind: 'ladder-step', gameId, choice };
    });
}

export async function cashOutTavernBankLadderGame(input: CashOutTavernBankLadderGameInput, options: TavernBankServiceOptions = {}): Promise<TavernBankMutationResult> {
    const gameId = normalizeGameId(input.gameId);
    return await runTavernBankMutation(input, { kind: 'ladder-cash-out', gameId }, options, async (context) => {
        const game = getActiveLadderGame(context.state, gameId);
        const transition = resolveTavernBankLadderCashOut(game);
        await finishLadderGame(context, game, transition);
        return { kind: 'ladder-cash-out', gameId };
    });
}
