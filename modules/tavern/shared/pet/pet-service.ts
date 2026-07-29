import db, {
    getLatestTavernMessage,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernMessagesTable,
    tavernPetActivitiesTable,
    tavernPetStateVersionsTable,
    tavernSessionsTable,
    type TavernSessionRecord,
} from '../session-db';
import {
    ensureTavernEconomy,
    ensureTavernEconomyInCurrentDbTransaction,
    postTavernEconomyTransactionInCurrentDbTransaction,
} from '../economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
    type TavernEconomyTransactionRecord,
} from '../economy/economy-types';
import {
    assertTavernPhoneBoundaryInCurrentTransaction,
    tavernPhoneBoundaryAnchorOrder,
} from '../phone-boundary';
import {
    canonicalTavernPetStaticVerdict,
    isTavernPetVerdictText,
    renderTavernPetMilestoneActivity,
    renderTavernPetStatusActivity,
} from './pet-copy';
import {
    normalizeTavernPetChatResponse,
    normalizeTavernPetPlayerText,
} from './pet-chat';
import {
    assertTavernPetStateInvariant,
    parseCanonicalTavernPetActivityRecord,
    parseCanonicalTavernPetStateVersionRecord,
} from './pet-invariants';
import {
    createTavernPetRecordingRandomSource,
    drawTavernPetOrigin,
    tavernPetRandomSource,
    type TavernPetRandomSource,
} from './pet-random';
import {
    applyTavernPetChatResponse,
    applyTavernPetInteraction,
    createTavernPetLuringState,
    renameTavernPetState,
    resolveTavernPetEvolutionState,
    setTavernPetInterferenceState,
    TAVERN_PET_INTERACTION_COSTS,
    wakeTavernPetState,
} from './pet-rules';
import {
    TAVERN_PET_CURRENT_MARKER,
    TAVERN_PET_INSUFFICIENT_FUNDS_REASON,
    type CommitTavernPetChatResponseInput,
    type InteractWithTavernPetInput,
    type LureTavernPetInput,
    type RenameTavernPetInput,
    type ResolveTavernPetEvolutionInput,
    type SetTavernPetInterferenceInput,
    type TavernPetActivityDraft,
    type TavernPetActivityRecord,
    type TavernPetEvolutionRequest,
    type TavernPetInteractionId,
    type TavernPetMutationBoundary,
    type TavernPetMutationResult,
    type TavernPetPrivateChatSnapshot,
    type TavernPetState,
    type TavernPetStateAction,
    type TavernPetStateVersionReceipt,
    type TavernPetStateVersionRecord,
    type WakeTavernPetInput,
    throwTavernPetError,
} from './pet-types';
import { createTavernPetView } from './pet-view';

const DEFAULT_ACTIVITY_LIMIT = 30;
const MAX_ACTIVITY_LIMIT = 100;

type PetRangeCollection<T> = {
    reverse(): PetRangeCollection<T>;
    limit(count: number): PetRangeCollection<T>;
    first(): Promise<T | undefined>;
    toArray(): Promise<T[]>;
};

type PetRangeTable<T> = {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): PetRangeCollection<T>;
    };
};

type PetBulkGetTable<T> = {
    bulkGet(keys: unknown[]): Promise<Array<T | undefined>>;
};

interface TavernPetPaymentSpec {
    idempotencyKey: string;
    amount: number;
    kind: 'pet_upkeep' | 'pet_wake';
    title: string;
    note: string;
    sourceId: string;
}

interface TavernPetPlayerMutationPlan {
    action: TavernPetStateAction;
    state: TavernPetState;
    activity?: TavernPetActivityDraft;
    observePostedLedger?: boolean;
}

interface TavernPetPlayerMutationOptions {
    payment: TavernPetPaymentSpec | null;
    replayMatches: (record: TavernPetStateVersionRecord) => boolean;
    build: (input: {
        current: TavernPetStateVersionRecord | null;
        session: TavernSessionRecord;
        currentTurn: number;
        playerBalance: number;
    }) => TavernPetPlayerMutationPlan;
}

export interface ListTavernPetActivitiesOptions {
    limit?: number;
    beforeCreatedAt?: number | null;
}

function now(): number {
    return Date.now();
}

function createId(prefix: string): string {
    return [prefix, String(now()), Math.random().toString(36).slice(2, 9)].join('-');
}

function clone<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId || [...sessionId].length > 240) {throwTavernPetError('pet_session_required');}
    return sessionId;
}

function normalizeActionId(value = ''): string {
    const actionId = String(value || '').trim();
    if (!actionId || [...actionId].length > 240) {throwTavernPetError('pet_action_required');}
    return actionId;
}

function normalizeExpectedRevision(value: unknown): number {
    const revision = Number(value);
    if (!Number.isSafeInteger(revision) || revision < 0) {
        throwTavernPetError('pet_revision_invalid', String(value));
    }
    return revision;
}

function normalizeExpectedVersionId(value: unknown, expectedRevision: number): string {
    const versionId = String(value ?? '').trim();
    if (expectedRevision === 0) {
        if (versionId) {throwTavernPetError('pet_version_id_invalid', versionId);}
        return '';
    }
    if (!versionId || [...versionId].length > 240) {
        throwTavernPetError('pet_version_id_invalid', versionId);
    }
    return versionId;
}

function normalizeTurn(value: unknown): number {
    const turn = Number(value);
    if (!Number.isSafeInteger(turn) || turn < 0) {throwTavernPetError('pet_turn_invalid', String(value));}
    return turn;
}

function sessionTurn(session: TavernSessionRecord): number {
    return normalizeTurn(session.state?.turn ?? 0);
}

function normalizeVisibleText(
    value: unknown,
    maximum: number,
    options: { allowEmpty?: boolean; preserveNewlines?: boolean } = {},
): string {
    let text = String(value ?? '')
        .normalize('NFKC')
        .replace(/\r\n?/gu, '\n')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/gu, '');
    text = options.preserveNewlines
        ? text.replace(/[^\S\n]+/gu, ' ').replace(/ *\n */gu, '\n')
        : text.replace(/\s+/gu, ' ');
    text = text.trim();
    if ((!options.allowEmpty && !text) || [...text].length > maximum) {
        throwTavernPetError('pet_chat_invalid', String(maximum));
    }
    return text;
}

function normalizePetName(value: unknown): string | undefined {
    const text = normalizeVisibleText(value, 12, { allowEmpty: true });
    if (!text) {return undefined;}
    if (/[\n\r]/u.test(text)) {throwTavernPetError('pet_name_invalid');}
    return text;
}

function normalizePlayerText(value: unknown): string {
    const text = normalizeTavernPetPlayerText(value);
    if (!text) {throwTavernPetError('pet_chat_invalid', 'player-text');}
    return text;
}

type TavernPetDirectInteractionId = Exclude<TavernPetInteractionId, 'lure' | 'chat' | 'wake'>;

function isTavernPetDirectInteractionId(value: unknown): value is TavernPetDirectInteractionId {
    return value === 'feed'
        || value === 'tap-shell'
        || value === 'play-bgm'
        || value === 'pat'
        || value === 'hit'
        || value === 'toy';
}

function isTavernPetPaidInteractionId(
    value: TavernPetDirectInteractionId,
): value is 'feed' | 'toy' {
    return value === 'feed' || value === 'toy';
}

function sameJson(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

function normalizeMutationBoundary(input: TavernPetMutationBoundary): TavernPetMutationBoundary & {
    anchorOrder: number;
} {
    const expectedRevision = normalizeExpectedRevision(input.expectedRevision);
    return {
        sessionId: normalizeSessionId(input.sessionId),
        boundary: input.boundary,
        actionId: normalizeActionId(input.actionId),
        expectedRevision,
        expectedVersionId: normalizeExpectedVersionId(input.expectedVersionId, expectedRevision),
        anchorOrder: tavernPhoneBoundaryAnchorOrder(input.boundary),
    };
}

function versionReceipt(record: TavernPetStateVersionRecord | null): TavernPetStateVersionReceipt | null {
    if (!record) {return null;}
    return {
        sessionId: record.sessionId,
        revision: record.revision,
        versionId: record.versionId,
        actionId: record.actionId,
        action: clone(record.action),
        ...(record.activityId ? { activityId: record.activityId } : {}),
        anchorOrder: record.anchorOrder,
        turn: record.turn,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
    };
}

async function findActionVersionInCurrentTransaction(
    sessionId: string,
    actionId: string,
): Promise<TavernPetStateVersionRecord | null> {
    const rows = await tavernPetStateVersionsTable
        .where('[sessionId+actionId]')
        .equals([sessionId, actionId])
        .toArray();
    const row = rows[0];
    return row ? parseCanonicalTavernPetStateVersionRecord(row) : null;
}

export async function findTavernPetActionVersionInCurrentDbTransaction(
    sessionId: string,
    actionId: string,
): Promise<TavernPetStateVersionRecord | null> {
    return await findActionVersionInCurrentTransaction(
        normalizeSessionId(sessionId),
        normalizeActionId(actionId),
    );
}

export async function getCurrentTavernPetStateVersionInCurrentDbTransaction(
    sessionId: string,
): Promise<TavernPetStateVersionRecord | null> {
    const rows = await tavernPetStateVersionsTable
        .where('[sessionId+currentMarker]')
        .equals([sessionId, TAVERN_PET_CURRENT_MARKER])
        .toArray();
    if (rows.length > 1) {throwTavernPetError('pet_history_invalid', 'multiple-current');}
    return rows[0] ? parseCanonicalTavernPetStateVersionRecord(rows[0]) : null;
}

async function getCurrentRecord(sessionId: string): Promise<TavernPetStateVersionRecord | null> {
    return await getCurrentTavernPetStateVersionInCurrentDbTransaction(sessionId);
}

function assertVersionCas(
    current: TavernPetStateVersionRecord | null,
    expectedRevision: number,
    expectedVersionId: string,
): void {
    if (!current) {
        if (expectedRevision !== 0) {
            throwTavernPetError('pet_revision_conflict', [String(expectedRevision), 'empty'].join(':'));
        }
        if (expectedVersionId) {throwTavernPetError('pet_version_conflict', expectedVersionId);}
        return;
    }
    if (current.revision !== expectedRevision) {
        throwTavernPetError(
            'pet_revision_conflict',
            [String(expectedRevision), String(current.revision)].join(':'),
        );
    }
    if (current.versionId !== expectedVersionId) {
        throwTavernPetError('pet_version_conflict', [expectedVersionId, current.versionId].join(':'));
    }
}

async function appendVersionInCurrentTransaction(
    current: TavernPetStateVersionRecord | null,
    next: TavernPetStateVersionRecord,
): Promise<void> {
    if (current) {
        const historical = clone(current);
        delete historical.currentMarker;
        await tavernPetStateVersionsTable.put(historical);
    }
    await (tavernPetStateVersionsTable as unknown as {
        add(record: TavernPetStateVersionRecord): Promise<unknown>;
    }).add(next);
}

async function listActivitiesInCurrentTransaction(
    sessionId: string,
    options: ListTavernPetActivitiesOptions = {},
): Promise<TavernPetActivityRecord[]> {
    const limit = Math.min(
        MAX_ACTIVITY_LIMIT,
        Math.max(1, Math.floor(Number(options.limit) || DEFAULT_ACTIVITY_LIMIT)),
    );
    const before = Number(options.beforeCreatedAt);
    const hasBefore = options.beforeCreatedAt !== null
        && options.beforeCreatedAt !== undefined
        && Number.isSafeInteger(before)
        && before >= 0;
    const upperCreatedAt = hasBefore ? before : Number.MAX_SAFE_INTEGER;
    const rows = await (tavernPetActivitiesTable as unknown as PetRangeTable<TavernPetActivityRecord>)
        .where('[sessionId+createdAt]')
        .between(
            [sessionId, 0],
            [sessionId, upperCreatedAt],
            true,
            !hasBefore,
        )
        .reverse()
        .limit(limit)
        .toArray();
    return rows.map((row) => parseCanonicalTavernPetActivityRecord(row));
}

async function currentPlayerBalanceInTransaction(sessionId: string): Promise<number> {
    const account = await tavernEconomyAccountsTable.get([sessionId, TAVERN_PLAYER_ACCOUNT_ID]);
    if (!account || !Number.isSafeInteger(account.balance) || account.balance < 0) {
        throwTavernPetError('pet_state_invalid', 'player-balance');
    }
    return account.balance;
}

async function buildMutationResultInCurrentTransaction(input: {
    session: TavernSessionRecord;
    current: TavernPetStateVersionRecord | null;
    actionRecord: TavernPetStateVersionRecord | null;
    replay: boolean;
    changed: boolean;
}): Promise<TavernPetMutationResult> {
    const [activities, playerBalance] = await Promise.all([
        listActivitiesInCurrentTransaction(input.session.id),
        currentPlayerBalanceInTransaction(input.session.id),
    ]);
    return {
        record: versionReceipt(input.current),
        actionRecord: versionReceipt(input.actionRecord),
        view: createTavernPetView({
            record: input.current,
            activities,
            currentTurn: sessionTurn(input.session),
            playerBalance,
        }),
        playerBalance,
        activities: clone(activities),
        replay: input.replay,
        changed: input.changed,
    };
}

async function findPaymentTransaction(
    sessionId: string,
    idempotencyKey: string,
): Promise<TavernEconomyTransactionRecord | null> {
    const rows = await tavernEconomyTransactionsTable
        .where('[sessionId+idempotencyKey]')
        .equals([sessionId, idempotencyKey])
        .toArray();
    return rows[0] || null;
}

function assertPaymentTransaction(
    transaction: TavernEconomyTransactionRecord | null,
    sessionId: string,
    anchorOrder: number,
    payment: TavernPetPaymentSpec,
): TavernEconomyTransactionRecord {
    if (!transaction
        || transaction.sessionId !== sessionId
        || transaction.idempotencyKey !== payment.idempotencyKey
        || transaction.fromAccountId !== TAVERN_PLAYER_ACCOUNT_ID
        || transaction.toAccountId !== TAVERN_SYSTEM_SINK_ACCOUNT_ID
        || transaction.amount !== payment.amount
        || transaction.kind !== payment.kind
        || transaction.title !== payment.title
        || transaction.note !== payment.note
        || transaction.sourceDomain !== 'pet'
        || transaction.sourceId !== payment.sourceId
        || transaction.anchorOrder !== anchorOrder
    ) {
        throwTavernPetError('pet_action_conflict', payment.idempotencyKey);
    }
    return transaction;
}

async function assertReplayArtifacts(
    replay: TavernPetStateVersionRecord,
    payment: TavernPetPaymentSpec | null,
): Promise<void> {
    const activityRows = await tavernPetActivitiesTable
        .where('[sessionId+sourceActionId]')
        .equals([replay.sessionId, replay.actionId])
        .toArray();
    if (replay.activityId) {
        const activity = activityRows[0]
            ? parseCanonicalTavernPetActivityRecord(activityRows[0])
            : null;
        if (!activity
            || activityRows.length !== 1
            || activity.id !== replay.activityId
            || activity.turn !== replay.turn
            || activity.anchorOrder !== replay.anchorOrder
        ) {
            throwTavernPetError('pet_action_conflict', replay.actionId);
        }
    } else if (activityRows.length) {
        throwTavernPetError('pet_action_conflict', replay.actionId);
    }
    if (payment) {
        assertPaymentTransaction(
            await findPaymentTransaction(replay.sessionId, payment.idempotencyKey),
            replay.sessionId,
            replay.anchorOrder,
            payment,
        );
    }
}

function buildVersion(input: {
    current: TavernPetStateVersionRecord | null;
    sessionId: string;
    actionId: string;
    action: TavernPetStateAction;
    activityId?: string;
    anchorOrder: number;
    turn: number;
    state: TavernPetState;
    timestamp: number;
}): TavernPetStateVersionRecord {
    if (input.current && input.anchorOrder < input.current.anchorOrder) {
        throwTavernPetError(
            'pet_anchor_order_regression',
            [String(input.anchorOrder), String(input.current.anchorOrder)].join('<'),
        );
    }
    if (input.current && input.turn < input.current.turn) {
        throwTavernPetError(
            'pet_turn_regression',
            [String(input.turn), String(input.current.turn)].join('<'),
        );
    }
    assertTavernPetStateInvariant(input.state);
    return parseCanonicalTavernPetStateVersionRecord({
        sessionId: input.sessionId,
        revision: input.current ? input.current.revision + 1 : 1,
        versionId: createId('pet-version'),
        currentMarker: TAVERN_PET_CURRENT_MARKER,
        actionId: input.actionId,
        action: clone(input.action),
        ...(input.activityId ? { activityId: input.activityId } : {}),
        anchorOrder: input.anchorOrder,
        turn: input.turn,
        state: clone(input.state),
        createdAt: input.timestamp,
        updatedAt: input.timestamp,
    });
}

function buildActivity(input: {
    sessionId: string;
    id: string;
    sourceActionId: string;
    turn: number;
    anchorOrder: number;
    draft: TavernPetActivityDraft;
    timestamp: number;
}): TavernPetActivityRecord {
    return parseCanonicalTavernPetActivityRecord({
        sessionId: input.sessionId,
        id: input.id,
        sourceActionId: input.sourceActionId,
        turn: input.turn,
        anchorOrder: input.anchorOrder,
        detail: clone(input.draft.detail),
        coinDelta: input.draft.coinDelta,
        ...(input.draft.notificationText
            ? { notificationText: input.draft.notificationText }
            : {}),
        createdAt: input.timestamp,
    });
}

export async function appendTavernPetTransitionInCurrentDbTransaction(input: {
    current: TavernPetStateVersionRecord | null;
    sessionId: string;
    actionId: string;
    action: TavernPetStateAction;
    anchorOrder: number;
    turn: number;
    state: TavernPetState;
    activity?: TavernPetActivityDraft;
    timestamp?: number;
}): Promise<{
    record: TavernPetStateVersionRecord;
    activity: TavernPetActivityRecord | null;
}> {
    const timestamp = input.timestamp ?? now();
    const activityId = input.activity ? createId('pet-activity') : undefined;
    const activity = input.activity && activityId
        ? buildActivity({
            sessionId: input.sessionId,
            id: activityId,
            sourceActionId: input.actionId,
            turn: input.turn,
            anchorOrder: input.anchorOrder,
            draft: input.activity,
            timestamp,
        })
        : null;
    const record = buildVersion({
        current: input.current,
        sessionId: input.sessionId,
        actionId: input.actionId,
        action: input.action,
        ...(activityId ? { activityId } : {}),
        anchorOrder: input.anchorOrder,
        turn: input.turn,
        state: input.state,
        timestamp,
    });
    if (activity) {
        await (tavernPetActivitiesTable as unknown as {
            add(record: TavernPetActivityRecord): Promise<unknown>;
        }).add(activity);
    }
    await appendVersionInCurrentTransaction(input.current, record);
    return { record: clone(record), activity: activity ? clone(activity) : null };
}

async function runTavernPetPlayerMutation(
    boundaryInput: TavernPetMutationBoundary,
    options: TavernPetPlayerMutationOptions,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(boundaryInput);
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const session = await tavernSessionsTable.get(input.sessionId);
            if (!session) {throwTavernPetError('pet_session_missing', input.sessionId);}
            const replay = await findActionVersionInCurrentTransaction(input.sessionId, input.actionId);
            if (replay) {
                if (replay.revision !== input.expectedRevision + 1
                    || replay.anchorOrder !== input.anchorOrder
                    || !options.replayMatches(replay)
                ) {
                    throwTavernPetError('pet_action_conflict', input.actionId);
                }
                await ensureTavernEconomyInCurrentDbTransaction(input.sessionId);
                await assertReplayArtifacts(replay, options.payment);
                const current = await getCurrentRecord(input.sessionId);
                if (!current) {throwTavernPetError('pet_history_invalid', 'replay-current-missing');}
                return await buildMutationResultInCurrentTransaction({
                    session,
                    current,
                    actionRecord: replay,
                    replay: true,
                    changed: false,
                });
            }
            await assertTavernPhoneBoundaryInCurrentTransaction(input.sessionId, input.boundary);
            const current = await getCurrentRecord(input.sessionId);
            assertVersionCas(current, input.expectedRevision, input.expectedVersionId);
            const economy = await ensureTavernEconomyInCurrentDbTransaction(input.sessionId);
            const currentTurn = sessionTurn(session);
            const plan = options.build({
                current,
                session,
                currentTurn,
                playerBalance: economy.playerBalance,
            });
            let transaction: TavernEconomyTransactionRecord | null = null;
            if (options.payment) {
                transaction = await postTavernEconomyTransactionInCurrentDbTransaction({
                    sessionId: input.sessionId,
                    idempotencyKey: options.payment.idempotencyKey,
                    fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
                    toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
                    amount: options.payment.amount,
                    kind: options.payment.kind,
                    title: options.payment.title,
                    note: options.payment.note,
                    sourceDomain: 'pet',
                    sourceId: options.payment.sourceId,
                    anchorOrder: input.anchorOrder,
                }, { touchSessionOnCreate: false });
                assertPaymentTransaction(
                    transaction,
                    input.sessionId,
                    input.anchorOrder,
                    options.payment,
                );
            }
            if (plan.observePostedLedger) {
                if (!transaction) {throwTavernPetError('pet_state_invalid', 'observed-ledger-without-payment');}
                plan.state.observedEconomyLedgerOrder = transaction.ledgerOrder;
            }
            assertTavernPetStateInvariant(plan.state);
            const timestamp = now();
            const activityId = plan.activity ? createId('pet-activity') : undefined;
            const activity = plan.activity && activityId
                ? buildActivity({
                    sessionId: input.sessionId,
                    id: activityId,
                    sourceActionId: input.actionId,
                    turn: currentTurn,
                    anchorOrder: input.anchorOrder,
                    draft: plan.activity,
                    timestamp,
                })
                : null;
            const next = buildVersion({
                current,
                sessionId: input.sessionId,
                actionId: input.actionId,
                action: plan.action,
                ...(activityId ? { activityId } : {}),
                anchorOrder: input.anchorOrder,
                turn: currentTurn,
                state: plan.state,
                timestamp,
            });
            if (activity) {
                await (tavernPetActivitiesTable as unknown as {
                    add(record: TavernPetActivityRecord): Promise<unknown>;
                }).add(activity);
            }
            await appendVersionInCurrentTransaction(current, next);
            await tavernSessionsTable.update(input.sessionId, { updatedAt: timestamp });
            return await buildMutationResultInCurrentTransaction({
                session,
                current: next,
                actionRecord: next,
                replay: false,
                changed: true,
            });
        },
    );
}

function upkeepPayment(actionId: string, sourceId: 'lure' | 'feed' | 'toy'): TavernPetPaymentSpec {
    const amount = TAVERN_PET_INTERACTION_COSTS[sourceId];
    return {
        idempotencyKey: sourceId === 'lure'
            ? ['pet', 'lure', actionId].join(':')
            : ['pet', 'upkeep', actionId].join(':'),
        amount,
        kind: 'pet_upkeep',
        title: sourceId === 'lure' ? '放下住户食物' : sourceId === 'feed' ? '投喂住户' : '给住户玩具',
        note: sourceId === 'lure' ? '在暗室角落放下一点食物。' : sourceId === 'feed' ? '给住户投喂食物。' : '给住户一个玩具。',
        sourceId,
    };
}

function wakePayment(actionId: string): TavernPetPaymentSpec {
    return {
        idempotencyKey: ['pet', 'wake', actionId].join(':'),
        amount: TAVERN_PET_INTERACTION_COSTS.wake,
        kind: 'pet_wake',
        title: '唤醒住户',
        note: '让休眠的住户重新活动。',
        sourceId: 'wake',
    };
}

export async function getCurrentTavernPetView(sessionId = '') {
    const id = normalizeSessionId(sessionId);
    const [session, record, activities, economy] = await Promise.all([
        tavernSessionsTable.get(id),
        getCurrentRecord(id),
        listActivitiesInCurrentTransaction(id),
        ensureTavernEconomy(id),
    ]);
    if (!session) {throwTavernPetError('pet_session_missing', id);}
    return createTavernPetView({
        record,
        activities,
        currentTurn: sessionTurn(session),
        playerBalance: economy.playerBalance,
    });
}

export async function getTavernPetPrivateSnapshotForChat(
    sessionId = '',
): Promise<TavernPetPrivateChatSnapshot | null> {
    const id = normalizeSessionId(sessionId);
    const [session, record, recentActivities] = await Promise.all([
        tavernSessionsTable.get(id),
        getCurrentRecord(id),
        listActivitiesInCurrentTransaction(id, { limit: 5 }),
    ]);
    if (!session) {throwTavernPetError('pet_session_missing', id);}
    if (!record) {return null;}
    return { record: clone(record), recentActivities: clone(recentActivities) };
}

export async function getTavernPetPendingEvolutionRequest(
    sessionId = '',
): Promise<TavernPetEvolutionRequest | null> {
    const id = normalizeSessionId(sessionId);
    const [session, record] = await Promise.all([
        tavernSessionsTable.get(id),
        getCurrentRecord(id),
    ]);
    if (!session) {throwTavernPetError('pet_session_missing', id);}
    return record?.state.pendingEvolution
        ? clone(record.state.pendingEvolution)
        : null;
}

export async function getTavernPetStateAtAnchor(
    sessionId = '',
    targetFloor = -1,
): Promise<TavernPetStateVersionRecord | null> {
    const id = normalizeSessionId(sessionId);
    const floor = Number(targetFloor);
    if (!Number.isSafeInteger(floor) || floor < -1) {
        throwTavernPetError('pet_anchor_order_invalid', String(targetFloor));
    }
    if (floor < 0) {return null;}
    const row = await (tavernPetStateVersionsTable as unknown as PetRangeTable<TavernPetStateVersionRecord>)
        .where('[sessionId+anchorOrder]')
        .between([id, 0], [id, floor], true, true)
        .reverse()
        .first();
    return row ? parseCanonicalTavernPetStateVersionRecord(row) : null;
}

export async function listTavernPetActivities(
    sessionId = '',
    options: ListTavernPetActivitiesOptions = {},
): Promise<TavernPetActivityRecord[]> {
    return clone(await listActivitiesInCurrentTransaction(normalizeSessionId(sessionId), options));
}

export async function listTavernPetActivitiesByIds(
    sessionId = '',
    activityIds: readonly string[] = [],
): Promise<TavernPetActivityRecord[]> {
    const id = normalizeSessionId(sessionId);
    const ids = [...new Set(activityIds.map((value) => String(value || '').trim()).filter(Boolean))];
    if (!ids.length) {return [];}
    const rows = await (tavernPetActivitiesTable as unknown as PetBulkGetTable<TavernPetActivityRecord>)
        .bulkGet(ids.map((activityId) => [id, activityId]));
    return rows.flatMap((row) => (
        row ? [parseCanonicalTavernPetActivityRecord(row)] : []
    ));
}

export async function lureTavernPet(
    rawInput: LureTavernPetInput,
    random: TavernPetRandomSource = tavernPetRandomSource,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    const payment = upkeepPayment(input.actionId, 'lure');
    return await runTavernPetPlayerMutation(input, {
        payment,
        replayMatches: (record) => record.action.kind === 'lure',
        build: ({ current, currentTurn, playerBalance }) => {
            if (current) {throwTavernPetError('pet_state_exists');}
            if (payment.amount > playerBalance) {
                throwTavernPetError('pet_interaction_unavailable', TAVERN_PET_INSUFFICIENT_FUNDS_REASON);
            }
            const recording = createTavernPetRecordingRandomSource(random);
            const origin = drawTavernPetOrigin(currentTurn, recording.random);
            return {
                action: { kind: 'lure', origin: clone(origin) },
                state: createTavernPetLuringState({
                    origin,
                    currentTurn,
                    observedEconomyLedgerOrder: -1,
                }),
                observePostedLedger: true,
            };
        },
    });
}

export async function interactWithTavernPet(
    rawInput: InteractWithTavernPetInput,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    const rawInteractionId: unknown = rawInput.interactionId;
    if (!isTavernPetDirectInteractionId(rawInteractionId)) {
        throwTavernPetError('pet_interaction_invalid', String(rawInteractionId));
    }
    const interactionId = rawInteractionId;
    const cost = TAVERN_PET_INTERACTION_COSTS[interactionId];
    const payment = isTavernPetPaidInteractionId(interactionId)
        ? upkeepPayment(input.actionId, interactionId)
        : null;
    return await runTavernPetPlayerMutation(input, {
        payment,
        replayMatches: (record) => record.action.kind === 'interact'
            && record.action.interactionId === interactionId,
        build: ({ current, currentTurn, playerBalance }) => {
            if (!current) {throwTavernPetError('pet_state_missing');}
            if (cost > playerBalance) {
                throwTavernPetError('pet_interaction_unavailable', TAVERN_PET_INSUFFICIENT_FUNDS_REASON);
            }
            const transition = applyTavernPetInteraction(current.state, interactionId, currentTurn);
            return {
                action: { kind: 'interact', interactionId },
                state: transition.state,
            };
        },
    });
}

export async function wakeTavernPet(
    rawInput: WakeTavernPetInput,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    const payment = wakePayment(input.actionId);
    return await runTavernPetPlayerMutation(input, {
        payment,
        replayMatches: (record) => record.action.kind === 'wake',
        build: ({ current, currentTurn, playerBalance }) => {
            if (!current) {throwTavernPetError('pet_state_missing');}
            if (payment.amount > playerBalance) {
                throwTavernPetError('pet_interaction_unavailable', TAVERN_PET_INSUFFICIENT_FUNDS_REASON);
            }
            const state = wakeTavernPetState(current.state, currentTurn);
            return {
                action: { kind: 'wake' },
                state,
                activity: renderTavernPetStatusActivity('woke', state),
                observePostedLedger: true,
            };
        },
    });
}

export async function renameTavernPet(
    rawInput: RenameTavernPetInput,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    let petName: string | undefined;
    try {
        petName = normalizePetName(rawInput.petName);
    } catch (error) {
        if (error instanceof Error) {throwTavernPetError('pet_name_invalid', error.message);}
        throw error;
    }
    return await runTavernPetPlayerMutation(input, {
        payment: null,
        replayMatches: (record) => record.action.kind === 'rename'
            && record.action.petName === petName,
        build: ({ current }) => {
            if (!current) {throwTavernPetError('pet_state_missing');}
            return {
                action: { kind: 'rename', ...(petName ? { petName } : {}) },
                state: renameTavernPetState(current.state, petName),
            };
        },
    });
}

export async function setTavernPetInterferenceEnabled(
    rawInput: SetTavernPetInterferenceInput,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    const enabled = rawInput.enabled === true;
    return await runTavernPetPlayerMutation(input, {
        payment: null,
        replayMatches: (record) => record.action.kind === 'toggle-interference'
            && record.action.enabled === enabled,
        build: ({ current }) => {
            if (!current) {throwTavernPetError('pet_state_missing');}
            return {
                action: { kind: 'toggle-interference', enabled },
                state: setTavernPetInterferenceState(current.state, enabled),
            };
        },
    });
}

export async function commitTavernPetChatResponse(
    rawInput: CommitTavernPetChatResponseInput,
): Promise<TavernPetMutationResult> {
    const input = normalizeMutationBoundary(rawInput);
    const playerText = normalizePlayerText(rawInput.playerText);
    const rawResponse = clone(rawInput.response);
    return await runTavernPetPlayerMutation(input, {
        payment: null,
        replayMatches: (record) => record.action.kind === 'chat'
            && record.action.playerText === playerText
            && sameJson(record.action.response, rawResponse),
        build: ({ current, currentTurn }) => {
            if (!current) {throwTavernPetError('pet_state_missing');}
            const response = normalizeTavernPetChatResponse(rawResponse, current.state);
            const transition = applyTavernPetChatResponse(
                current.state,
                currentTurn,
                playerText,
                response,
            );
            return {
                action: {
                    kind: 'chat',
                    playerText,
                    response,
                    appliedAxes: transition.appliedAxes,
                },
                state: transition.state,
                activity: {
                    detail: {
                        kind: 'chat',
                        playerText,
                        petText: response.text,
                        face: response.face,
                        motion: response.motion,
                        ...(response.murmur ? { murmur: response.murmur } : {}),
                    },
                    coinDelta: 0,
                },
            };
        },
    });
}

export async function resolveTavernPetEvolution(
    rawInput: ResolveTavernPetEvolutionInput,
): Promise<TavernPetMutationResult> {
    const sessionId = normalizeSessionId(rawInput.sessionId);
    const requestId = normalizeActionId(rawInput.requestId);
    const verdict = normalizeVisibleText(rawInput.verdict, 80);
    if (!isTavernPetVerdictText(verdict)) {throwTavernPetError('pet_chat_invalid', 'verdict');}
    const usedFallback = rawInput.usedFallback === true;
    const actionId = ['pet', 'evolution', requestId].join(':');
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        async () => {
            const session = await tavernSessionsTable.get(sessionId);
            if (!session) {throwTavernPetError('pet_session_missing', sessionId);}
            await ensureTavernEconomyInCurrentDbTransaction(sessionId);
            const replay = await findActionVersionInCurrentTransaction(sessionId, actionId);
            if (replay) {
                if (replay.action.kind !== 'resolve-evolution'
                    || replay.action.requestId !== requestId
                ) {
                    throwTavernPetError('pet_action_conflict', actionId);
                }
                await assertReplayArtifacts(replay, null);
                const current = await getCurrentRecord(sessionId);
                if (!current) {throwTavernPetError('pet_history_invalid', 'evolution-current-missing');}
                return await buildMutationResultInCurrentTransaction({
                    session,
                    current,
                    actionRecord: replay,
                    replay: true,
                    changed: false,
                });
            }
            const current = await getCurrentRecord(sessionId);
            if (!current) {throwTavernPetError('pet_state_missing');}
            const pending = current.state.pendingEvolution;
            if (!pending || pending.requestId !== requestId) {
                throwTavernPetError('pet_evolution_stale', requestId);
            }
            if (usedFallback && verdict !== canonicalTavernPetStaticVerdict(pending.personaId)) {
                throwTavernPetError('pet_chat_invalid', 'fallback-verdict');
            }
            const latestMessage = await getLatestTavernMessage(sessionId);
            const anchorOrder = Math.max(current.anchorOrder, (latestMessage?.order ?? -1) + 1);
            const turn = Math.max(current.turn, sessionTurn(session));
            const state = resolveTavernPetEvolutionState(current.state, requestId);
            const draft = renderTavernPetMilestoneActivity({
                milestoneId: pending.milestoneId,
                state,
                turn: pending.turn,
                anchorOrder: pending.anchorOrder,
                personaId: pending.personaId,
                verdict,
            });
            const timestamp = now();
            const activityId = createId('pet-activity');
            const activity = buildActivity({
                sessionId,
                id: activityId,
                sourceActionId: actionId,
                turn,
                anchorOrder,
                draft,
                timestamp,
            });
            const next = buildVersion({
                current,
                sessionId,
                actionId,
                action: { kind: 'resolve-evolution', requestId, verdict, usedFallback },
                activityId,
                anchorOrder,
                turn,
                state,
                timestamp,
            });
            await (tavernPetActivitiesTable as unknown as {
                add(record: TavernPetActivityRecord): Promise<unknown>;
            }).add(activity);
            await appendVersionInCurrentTransaction(current, next);
            await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
            return await buildMutationResultInCurrentTransaction({
                session,
                current: next,
                actionRecord: next,
                replay: false,
                changed: true,
            });
        },
    );
}
