import db, {
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernSessionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
} from '../session-db';
import {
    getTavernPlayerBalance,
    postTavernEconomyTransactionInCurrentDbTransaction,
    reverseTavernEconomyTransactionInCurrentDbTransaction,
} from '../economy/economy-service';
import {
    TAVERN_PLAYER_ACCOUNT_ID,
    type TavernEconomyTransactionRecord,
} from '../economy/economy-types';
import {
    TAVERN_TASK_CURRENT_MARKER,
    TAVERN_TASK_PLAYER_PARTY_ID,
    normalizeTavernTaskAnchorOrder,
    normalizeTavernTaskCandidate,
    normalizeTavernTaskCandidates,
    normalizeTavernTaskGrade,
    normalizeTavernTaskReward,
    normalizeTavernTaskTags,
    normalizeTavernTaskVersionRecord,
    throwTavernTaskError,
    type AcceptTavernTaskListingInput,
    type CancelTavernTaskInput,
    type CompleteTavernTaskInput,
    type FailTavernTaskInput,
    type ProgressTavernTaskInput,
    type PublishTavernTaskInput,
    type SelectTavernTaskCandidateInput,
    type TavernTaskParty,
    type TavernTaskStagedAction,
    type TavernTaskStagingContext,
    type TavernTaskStatus,
    type TavernTaskVersionRecord,
    type UpdateTavernTaskCandidatesInput,
} from './task-types';

const TASK_TEXT_LIMIT = 8_000;
const ECONOMY_ACCOUNT_ID_MAX_LENGTH = 180;
const TASK_ESCROW_ACCOUNT_PREFIX = 'escrow:task:';
const TASK_COUNTERPARTY_ACCOUNT_PREFIX = 'counterparty:';
const TASK_ID_MAX_LENGTH = ECONOMY_ACCOUNT_ID_MAX_LENGTH - TASK_ESCROW_ACCOUNT_PREFIX.length;
const TASK_PARTY_ID_MAX_LENGTH = ECONOMY_ACCOUNT_ID_MAX_LENGTH - TASK_COUNTERPARTY_ACCOUNT_PREFIX.length;

type TaskRangeCollection<T> = {
    reverse(): TaskRangeCollection<T>;
    offset(count: number): TaskRangeCollection<T>;
    limit(count: number): TaskRangeCollection<T>;
    toArray(): Promise<T[]>;
};

type TaskRangeTable<T> = {
    where(index: string): {
        between(
            lower: unknown,
            upper: unknown,
            includeLower?: boolean,
            includeUpper?: boolean,
        ): TaskRangeCollection<T>;
    };
};

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

function normalizeSessionId(value = ''): string {
    const sessionId = String(value || '').trim();
    if (!sessionId) {throwTavernTaskError('task_session_required');}
    return sessionId;
}

function normalizeTaskId(value = '', required = true): string {
    const taskId = String(value || '').trim();
    if (required && !taskId) {throwTavernTaskError('task_id_required');}
    if (taskId && (/\s/u.test(taskId) || taskId.length > TASK_ID_MAX_LENGTH)) {
        throwTavernTaskError('task_id_invalid', taskId);
    }
    return taskId;
}

function normalizeActionId(value = ''): string {
    const actionId = String(value || '').trim().slice(0, 220);
    if (!actionId) {throwTavernTaskError('task_action_required');}
    return actionId;
}

function normalizeRevision(value: unknown): number {
    const revision = Number(value);
    if (!Number.isSafeInteger(revision) || revision <= 0) {
        throwTavernTaskError('task_revision_invalid', String(value));
    }
    return revision;
}

function normalizeText(value: unknown, limit = TASK_TEXT_LIMIT, required = false): string {
    const normalized = String(value ?? '').replace(/\r\n?/g, '\n').trim().slice(0, limit);
    if (required && !normalized) {throwTavernTaskError('task_text_invalid');}
    return normalized;
}

function playerParty(name = ''): TavernTaskParty {
    return {
        kind: 'player',
        id: TAVERN_TASK_PLAYER_PARTY_ID,
        name: normalizeText(name, 120) || '玩家',
    };
}

export function buildTavernTaskEscrowAccountId(taskId = ''): string {
    return `${TASK_ESCROW_ACCOUNT_PREFIX}${normalizeTaskId(taskId)}`;
}

export function buildTavernTaskCounterpartyAccountId(partyId = ''): string {
    const id = String(partyId || '').trim();
    if (!id || id.length > TASK_PARTY_ID_MAX_LENGTH || id.startsWith(':') || /\s/u.test(id)) {
        throwTavernTaskError('task_party_invalid', id);
    }
    return `${TASK_COUNTERPARTY_ACCOUNT_PREFIX}${id}`;
}

function fundingIdempotencyKey(taskId: string): string {
    return `tasks:${taskId}:funding`;
}

function completionIdempotencyKey(taskId: string): string {
    return `tasks:${taskId}:completion`;
}

function refundIdempotencyKey(taskId: string): string {
    return `tasks:${taskId}:refund`;
}

async function assertSessionExists(sessionId: string): Promise<void> {
    if (!await tavernSessionsTable.get(sessionId)) {throwTavernTaskError('task_session_missing', sessionId);}
}

async function findActionVersion(sessionId: string, actionId: string): Promise<TavernTaskVersionRecord | null> {
    const rows = await tavernTaskVersionsTable
        .where('[sessionId+actionId]')
        .equals([sessionId, actionId])
        .toArray();
    return rows[0] || null;
}

async function findVersionAtRevision(
    sessionId: string,
    taskId: string,
    revision: number,
): Promise<TavernTaskVersionRecord | null> {
    const row = await tavernTaskVersionsTable.get([sessionId, taskId, revision]);
    return row || null;
}

function assertActionReplay(
    replay: TavernTaskVersionRecord,
    matches: boolean,
    actionId: string,
): TavernTaskVersionRecord {
    if (!matches) {throwTavernTaskError('task_action_conflict', actionId);}
    return replay;
}

async function assertMutationReplayPredecessor(
    replay: TavernTaskVersionRecord,
    options: {
        sessionId: string;
        taskId: string;
        expectedRevision: number;
        predecessorStatus: Extract<TavernTaskStatus, 'recruiting' | 'active'>;
        actionId: string;
    },
): Promise<TavernTaskVersionRecord> {
    assertActionReplay(replay,
        replay.sessionId === options.sessionId
        && replay.taskId === options.taskId
        && replay.revision === options.expectedRevision + 1,
    options.actionId);
    const predecessor = await findVersionAtRevision(
        options.sessionId,
        options.taskId,
        options.expectedRevision,
    );
    if (
        !predecessor
        || predecessor.sessionId !== options.sessionId
        || predecessor.taskId !== options.taskId
        || predecessor.revision !== options.expectedRevision
        || predecessor.status !== options.predecessorStatus
    ) {
        throwTavernTaskError('task_action_conflict', options.actionId);
    }
    return predecessor;
}

function sameJson(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

async function getCurrentVersionInTransaction(sessionId: string, taskId: string): Promise<TavernTaskVersionRecord | null> {
    const rows = await tavernTaskVersionsTable
        .where('[sessionId+taskId+currentMarker]')
        .equals([sessionId, taskId, TAVERN_TASK_CURRENT_MARKER])
        .toArray();
    return rows[0] || null;
}

async function requireCurrentVersionInTransaction(
    sessionId: string,
    taskId: string,
    expectedRevision: number,
): Promise<TavernTaskVersionRecord> {
    const current = await getCurrentVersionInTransaction(sessionId, taskId);
    if (!current) {throwTavernTaskError('task_missing', taskId);}
    if (current.revision !== expectedRevision) {
        throwTavernTaskError('task_revision_conflict', `${expectedRevision}:${current.revision}`);
    }
    return current;
}

function buildNextVersion(
    current: TavernTaskVersionRecord,
    actionId: string,
    anchorOrder: number,
    patch: Partial<TavernTaskVersionRecord>,
    timestamp = now(),
): TavernTaskVersionRecord {
    if (anchorOrder < current.anchorOrder) {
        throwTavernTaskError(
            'task_anchor_order_regression',
            `${anchorOrder}<${current.anchorOrder}`,
        );
    }
    return normalizeTavernTaskVersionRecord({
        ...clone(current),
        ...clone(patch),
        sessionId: current.sessionId,
        taskId: current.taskId,
        revision: current.revision + 1,
        currentMarker: TAVERN_TASK_CURRENT_MARKER,
        actionId,
        anchorOrder,
        createdAt: timestamp,
        updatedAt: timestamp,
    });
}

async function appendVersionInTransaction(
    current: TavernTaskVersionRecord | null,
    next: TavernTaskVersionRecord,
): Promise<void> {
    if (current) {
        await tavernTaskVersionsTable.put({ ...clone(current), currentMarker: undefined });
    }
    await (tavernTaskVersionsTable as unknown as {
        add(record: TavernTaskVersionRecord): Promise<unknown>;
    }).add(next);
}

async function touchSession(sessionId: string): Promise<void> {
    await tavernSessionsTable.update(sessionId, { updatedAt: now() });
}

async function findFundingTransaction(sessionId: string, taskId: string): Promise<TavernEconomyTransactionRecord> {
    const rows = await tavernEconomyTransactionsTable
        .where('[sessionId+idempotencyKey]')
        .equals([sessionId, fundingIdempotencyKey(taskId)])
        .toArray();
    const transaction = rows[0];
    if (!transaction) {throwTavernTaskError('task_transition_invalid', `funding_missing:${taskId}`);}
    return transaction;
}

async function hasAcceptedListing(sessionId: string, boardId: string, listingId: string): Promise<boolean> {
    return (await tavernTaskVersionsTable
        .where('[sessionId+sourceBoardId+sourceListingId]')
        .equals([sessionId, boardId, listingId])
        .count()) > 0;
}

async function runTaskWriteTransaction<T>(callback: () => Promise<T>): Promise<T> {
    return await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernTaskBoardsTable,
        tavernTaskVersionsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        callback,
    );
}

export interface ListCurrentTavernTasksOptions {
    statuses?: TavernTaskStatus[];
    issuerKind?: TavernTaskParty['kind'];
    limit?: number;
}

export async function listCurrentTavernTasks(
    value = '',
    options: ListCurrentTavernTasksOptions = {},
): Promise<TavernTaskVersionRecord[]> {
    const sessionId = normalizeSessionId(value);
    const statuses = new Set(options.statuses || []);
    const limit = Math.max(0, Math.min(500, Math.floor(Number(options.limit) || 0)));
    const rows = await tavernTaskVersionsTable
        .where('[sessionId+currentMarker]')
        .equals([sessionId, TAVERN_TASK_CURRENT_MARKER])
        .toArray();
    const filtered = rows
        .filter((row) => !statuses.size || statuses.has(row.status))
        .filter((row) => !options.issuerKind || row.issuer.kind === options.issuerKind)
        .sort((left, right) => right.updatedAt - left.updatedAt || left.taskId.localeCompare(right.taskId));
    return clone(limit ? filtered.slice(0, limit) : filtered);
}

export async function listTavernTasksAtAnchor(
    value = '',
    anchorValue = -1,
    options: ListCurrentTavernTasksOptions = {},
): Promise<TavernTaskVersionRecord[]> {
    const sessionId = normalizeSessionId(value);
    const anchorOrder = normalizeTavernTaskAnchorOrder(anchorValue);
    const statuses = new Set(options.statuses || []);
    const limit = Math.max(0, Math.min(500, Math.floor(Number(options.limit) || 0)));
    const rows = await (tavernTaskVersionsTable as unknown as TaskRangeTable<TavernTaskVersionRecord>)
        .where('[sessionId+anchorOrder]')
        .between([sessionId, -1], [sessionId, anchorOrder], true, true)
        .toArray();
    const latestByTask = new Map<string, TavernTaskVersionRecord>();
    for (const row of rows) {
        const current = latestByTask.get(row.taskId);
        if (!current || row.revision > current.revision) {latestByTask.set(row.taskId, row);}
    }
    const filtered = [...latestByTask.values()]
        .filter((row) => !statuses.size || statuses.has(row.status))
        .filter((row) => !options.issuerKind || row.issuer.kind === options.issuerKind)
        .sort((left, right) => right.updatedAt - left.updatedAt || left.taskId.localeCompare(right.taskId));
    return clone(limit ? filtered.slice(0, limit) : filtered);
}

export async function hasMaintainableTavernTasksAtAnchor(value = '', anchorValue = -1): Promise<boolean> {
    return (await listTavernTasksAtAnchor(value, anchorValue, { statuses: ['active'], limit: 1 })).length > 0;
}

export async function getCurrentTavernTask(value = '', taskValue = ''): Promise<TavernTaskVersionRecord | null> {
    const sessionId = normalizeSessionId(value);
    const taskId = normalizeTaskId(taskValue);
    const current = await getCurrentVersionInTransaction(sessionId, taskId);
    return current ? clone(current) : null;
}

export interface ListTavernTaskVersionsOptions {
    offset?: number;
    limit?: number;
}

export async function listTavernTaskVersions(
    value = '',
    taskValue = '',
    options: ListTavernTaskVersionsOptions = {},
): Promise<TavernTaskVersionRecord[]> {
    const sessionId = normalizeSessionId(value);
    const taskId = normalizeTaskId(taskValue);
    const offset = Math.max(0, Math.floor(Number(options.offset) || 0));
    const limit = Math.max(1, Math.min(100, Math.floor(Number(options.limit) || 30)));
    const rows = await (tavernTaskVersionsTable as unknown as TaskRangeTable<TavernTaskVersionRecord>)
        .where('[sessionId+taskId+revision]')
        .between(
            [sessionId, taskId, 0],
            [sessionId, taskId, Number.MAX_SAFE_INTEGER],
            true,
            true,
        )
        .reverse()
        .offset(offset)
        .limit(limit)
        .toArray();
    return clone(rows);
}

export async function getTavernTaskPlayerBalance(sessionId = ''): Promise<number> {
    return await getTavernPlayerBalance(normalizeSessionId(sessionId));
}

export async function acceptTavernTaskListing(input: AcceptTavernTaskListingInput): Promise<TavernTaskVersionRecord> {
    const sessionId = normalizeSessionId(input.sessionId);
    const actionId = normalizeActionId(input.actionId);
    const boardId = String(input.boardId || input.generationId || '').trim();
    const listingId = String(input.listingId || '').trim();
    const boardRevision = Number(input.boardRevision);
    const anchorOrder = normalizeTavernTaskAnchorOrder(input.anchorOrder);
    if (!boardId) {throwTavernTaskError('task_board_generation_conflict');}
    if (!listingId) {throwTavernTaskError('task_listing_missing');}
    if (!Number.isSafeInteger(boardRevision) || boardRevision <= 0) {
        throwTavernTaskError('task_board_revision_invalid', String(input.boardRevision));
    }
    return await runTaskWriteTransaction(async () => {
        const replay = await findActionVersion(sessionId, actionId);
        if (replay) {
            assertActionReplay(replay,
                (!input.taskId || replay.taskId === normalizeTaskId(input.taskId))
                && replay.sourceBoardId === boardId
                && replay.sourceListingId === listingId
                && replay.sourceBoardRevision === boardRevision
                && replay.revision === 1
                && replay.assignee?.kind === 'player'
                && replay.assignee.name === (normalizeText(input.playerName, 120) || '玩家')
                && replay.anchorOrder === anchorOrder,
            actionId);
            return clone(replay);
        }
        await assertSessionExists(sessionId);
        const board = await tavernTaskBoardsTable.get(sessionId);
        if (!board) {throwTavernTaskError('task_board_missing', sessionId);}
        if (board.generationId !== boardId) {
            throwTavernTaskError('task_board_generation_conflict', `${boardId}:${board.generationId}`);
        }
        if (board.revision !== boardRevision) {
            throwTavernTaskError('task_board_revision_conflict', `${boardRevision}:${board.revision}`);
        }
        const listing = board.listings.find((item) => item.id === listingId);
        if (!listing) {throwTavernTaskError('task_listing_missing', listingId);}
        if (await hasAcceptedListing(sessionId, boardId, listingId)) {
            throwTavernTaskError('task_listing_already_accepted', listingId);
        }
        const taskId = normalizeTaskId(input.taskId || createId('task'));
        if (await getCurrentVersionInTransaction(sessionId, taskId)) {
            throwTavernTaskError('task_action_conflict', taskId);
        }
        const timestamp = now();
        const escrowAccountId = buildTavernTaskEscrowAccountId(taskId);
        const version = normalizeTavernTaskVersionRecord({
            sessionId,
            taskId,
            revision: 1,
            currentMarker: TAVERN_TASK_CURRENT_MARKER,
            actionId,
            status: 'active',
            issuer: {
                kind: 'world',
                id: listing.issuer.id,
                name: listing.issuer.name,
                description: listing.issuer.description,
            },
            assignee: playerParty(input.playerName),
            reward: listing.reward,
            escrowAccountId,
            title: listing.title,
            objective: listing.objective,
            ...(listing.requirements ? { requirements: listing.requirements } : {}),
            location: listing.location,
            risk: listing.risk,
            grade: listing.grade,
            tags: listing.tags,
            hook: listing.hook,
            progressSummary: '尚未开始',
            resultSummary: '',
            candidates: [],
            sourceBoardId: boardId,
            sourceListingId: listingId,
            sourceBoardRevision: boardRevision,
            anchorOrder,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        await postTavernEconomyTransactionInCurrentDbTransaction({
            sessionId,
            idempotencyKey: fundingIdempotencyKey(taskId),
            fromAccountId: buildTavernTaskCounterpartyAccountId(listing.issuer.id),
            toAccountId: escrowAccountId,
            amount: listing.reward,
            kind: 'task_escrow',
            title: `托管 · ${listing.title}`,
            note: `发布者 ${listing.issuer.name} 锁定任务报酬。`,
            sourceDomain: 'tasks',
            sourceId: taskId,
            anchorOrder,
        }, { touchSessionOnCreate: false });
        await appendVersionInTransaction(null, version);
        await touchSession(sessionId);
        return clone(version);
    });
}

export async function publishTavernTask(input: PublishTavernTaskInput): Promise<TavernTaskVersionRecord> {
    const sessionId = normalizeSessionId(input.sessionId);
    const actionId = normalizeActionId(input.actionId);
    const anchorOrder = normalizeTavernTaskAnchorOrder(input.anchorOrder);
    const reward = normalizeTavernTaskReward(input.reward);
    const title = normalizeText(input.title, 180, true);
    const objective = normalizeText(input.objective, TASK_TEXT_LIMIT, true);
    const requirements = normalizeText(input.requirements, TASK_TEXT_LIMIT);
    const location = normalizeText(input.location, 600, true);
    const risk = normalizeText(input.risk, 2_000);
    const grade = normalizeTavernTaskGrade(input.grade || 'CUSTOM');
    const tags = normalizeTavernTaskTags(input.tags || []);
    return await runTaskWriteTransaction(async () => {
        const replay = await findActionVersion(sessionId, actionId);
        if (replay) {
            assertActionReplay(replay,
                (!input.taskId || replay.taskId === normalizeTaskId(input.taskId))
                && replay.revision === 1
                && replay.status === 'recruiting'
                && replay.issuer.kind === 'player'
                && replay.issuer.name === (normalizeText(input.playerName, 120) || '玩家')
                && replay.title === title
                && replay.objective === objective
                && String(replay.requirements || '') === requirements
                && replay.location === location
                && replay.risk === risk
                && replay.reward === reward
                && replay.grade === grade
                && sameJson(replay.tags, tags)
                && replay.anchorOrder === anchorOrder,
            actionId);
            return clone(replay);
        }
        await assertSessionExists(sessionId);
        const taskId = normalizeTaskId(input.taskId || createId('task'));
        if (await getCurrentVersionInTransaction(sessionId, taskId)) {
            throwTavernTaskError('task_action_conflict', taskId);
        }
        const timestamp = now();
        const escrowAccountId = buildTavernTaskEscrowAccountId(taskId);
        const version = normalizeTavernTaskVersionRecord({
            sessionId,
            taskId,
            revision: 1,
            currentMarker: TAVERN_TASK_CURRENT_MARKER,
            actionId,
            status: 'recruiting',
            issuer: playerParty(input.playerName),
            reward,
            escrowAccountId,
            title,
            objective,
            ...(requirements ? { requirements } : {}),
            location,
            risk,
            grade,
            tags,
            progressSummary: '等待应征者',
            resultSummary: '',
            candidates: [],
            anchorOrder,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        await postTavernEconomyTransactionInCurrentDbTransaction({
            sessionId,
            idempotencyKey: fundingIdempotencyKey(taskId),
            fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
            toAccountId: escrowAccountId,
            amount: reward,
            kind: 'task_escrow',
            title: `发布任务 · ${title}`,
            note: '玩家发布任务并锁定报酬。',
            sourceDomain: 'tasks',
            sourceId: taskId,
            anchorOrder,
        }, { touchSessionOnCreate: false });
        await appendVersionInTransaction(null, version);
        await touchSession(sessionId);
        return clone(version);
    });
}

type MutationCommitResult = { version: TavernTaskVersionRecord; changed: boolean };

interface TaskMutationCommitOptions {
    allowDelayedAnchorCommit?: boolean;
}

async function updateCandidatesInCurrentTransaction(input: UpdateTavernTaskCandidatesInput): Promise<MutationCommitResult> {
    const sessionId = normalizeSessionId(input.sessionId);
    const taskId = normalizeTaskId(input.taskId);
    const actionId = normalizeActionId(input.actionId);
    const expectedRevision = normalizeRevision(input.expectedRevision);
    const anchorOrder = normalizeTavernTaskAnchorOrder(input.anchorOrder);
    const candidates = normalizeTavernTaskCandidates(input.candidates, {
        min: 3,
        max: 4,
        allowEmpty: true,
    });
    const replay = await findActionVersion(sessionId, actionId);
    if (replay) {
        await assertMutationReplayPredecessor(replay, {
            sessionId,
            taskId,
            expectedRevision,
            predecessorStatus: 'recruiting',
            actionId,
        });
        assertActionReplay(replay,
            replay.status === 'recruiting'
            && replay.anchorOrder === anchorOrder
            && sameJson(replay.candidates, candidates),
        actionId);
        return { version: clone(replay), changed: false };
    }
    const current = await requireCurrentVersionInTransaction(sessionId, taskId, expectedRevision);
    if (current.status !== 'recruiting') {throwTavernTaskError('task_task_not_recruiting', current.status);}
    if (current.issuer.kind !== 'player') {throwTavernTaskError('task_player_only', taskId);}
    const version = buildNextVersion(current, actionId, anchorOrder, { candidates });
    await appendVersionInTransaction(current, version);
    return { version: clone(version), changed: true };
}

export async function updateTavernTaskCandidates(input: UpdateTavernTaskCandidatesInput): Promise<TavernTaskVersionRecord> {
    return await runTaskWriteTransaction(async () => {
        await assertSessionExists(normalizeSessionId(input.sessionId));
        const result = await updateCandidatesInCurrentTransaction(input);
        if (result.changed) {await touchSession(input.sessionId);}
        return result.version;
    });
}

async function selectCandidateInCurrentTransaction(input: SelectTavernTaskCandidateInput): Promise<MutationCommitResult> {
    const sessionId = normalizeSessionId(input.sessionId);
    const taskId = normalizeTaskId(input.taskId);
    const actionId = normalizeActionId(input.actionId);
    const expectedRevision = normalizeRevision(input.expectedRevision);
    const anchorOrder = normalizeTavernTaskAnchorOrder(input.anchorOrder);
    const candidateId = String(input.candidateId || '').trim();
    if (!candidateId) {throwTavernTaskError('task_candidate_missing');}
    const replay = await findActionVersion(sessionId, actionId);
    if (replay) {
        const predecessor = await assertMutationReplayPredecessor(replay, {
            sessionId,
            taskId,
            expectedRevision,
            predecessorStatus: 'recruiting',
            actionId,
        });
        const predecessorCandidate = predecessor.candidates.find((item) => item.id === candidateId);
        const expectedAssignee = predecessorCandidate
            ? {
                kind: 'world' as const,
                id: predecessorCandidate.id,
                name: predecessorCandidate.name,
                description: predecessorCandidate.description,
                pitch: predecessorCandidate.pitch,
                capability: predecessorCandidate.capability,
                risk: predecessorCandidate.risk,
            }
            : null;
        assertActionReplay(replay,
            Boolean(predecessorCandidate)
            && replay.status === 'active'
            && sameJson(replay.assignee, expectedAssignee)
            && replay.candidates.length === 0
            && replay.anchorOrder === anchorOrder,
        actionId);
        return { version: clone(replay), changed: false };
    }
    const current = await requireCurrentVersionInTransaction(sessionId, taskId, expectedRevision);
    if (current.status !== 'recruiting') {throwTavernTaskError('task_task_not_recruiting', current.status);}
    if (current.issuer.kind !== 'player') {throwTavernTaskError('task_player_only', taskId);}
    const candidate = current.candidates.find((item) => item.id === candidateId);
    if (!candidate) {throwTavernTaskError('task_candidate_missing', candidateId);}
    const normalizedCandidate = normalizeTavernTaskCandidate(candidate, candidate.id);
    const version = buildNextVersion(current, actionId, anchorOrder, {
        status: 'active',
        assignee: {
            kind: 'world',
            id: normalizedCandidate.id,
            name: normalizedCandidate.name,
            description: normalizedCandidate.description,
            pitch: normalizedCandidate.pitch,
            capability: normalizedCandidate.capability,
            risk: normalizedCandidate.risk,
        },
        candidates: [],
        progressSummary: `${normalizedCandidate.name} 已接取任务`,
    });
    await appendVersionInTransaction(current, version);
    return { version: clone(version), changed: true };
}

export async function selectTavernTaskCandidate(input: SelectTavernTaskCandidateInput): Promise<TavernTaskVersionRecord> {
    return await runTaskWriteTransaction(async () => {
        await assertSessionExists(normalizeSessionId(input.sessionId));
        const result = await selectCandidateInCurrentTransaction(input);
        if (result.changed) {await touchSession(input.sessionId);}
        return result.version;
    });
}

async function cancelTaskInCurrentTransaction(input: CancelTavernTaskInput): Promise<MutationCommitResult> {
    const sessionId = normalizeSessionId(input.sessionId);
    const taskId = normalizeTaskId(input.taskId);
    const actionId = normalizeActionId(input.actionId);
    const expectedRevision = normalizeRevision(input.expectedRevision);
    const anchorOrder = normalizeTavernTaskAnchorOrder(input.anchorOrder);
    const replay = await findActionVersion(sessionId, actionId);
    if (replay) {
        await assertMutationReplayPredecessor(replay, {
            sessionId,
            taskId,
            expectedRevision,
            predecessorStatus: 'recruiting',
            actionId,
        });
        assertActionReplay(replay,
            replay.status === 'cancelled'
            && replay.anchorOrder === anchorOrder,
        actionId);
        return { version: clone(replay), changed: false };
    }
    const current = await requireCurrentVersionInTransaction(sessionId, taskId, expectedRevision);
    if (current.status !== 'recruiting') {throwTavernTaskError('task_task_not_recruiting', current.status);}
    if (current.issuer.kind !== 'player') {throwTavernTaskError('task_player_only', taskId);}
    const funding = await findFundingTransaction(sessionId, taskId);
    await reverseTavernEconomyTransactionInCurrentDbTransaction({
        sessionId,
        transactionId: funding.id,
        anchorOrder,
        idempotencyKey: refundIdempotencyKey(taskId),
        kind: 'task_refund',
        title: `撤回任务 · ${current.title}`,
        note: '任务尚未选定承接者，托管报酬退回玩家。',
        sourceDomain: 'tasks',
        sourceId: taskId,
    }, { touchSessionOnCreate: false });
    const version = buildNextVersion(current, actionId, anchorOrder, {
        status: 'cancelled',
        candidates: [],
        resultSummary: '玩家撤回了任务。',
    });
    await appendVersionInTransaction(current, version);
    return { version: clone(version), changed: true };
}

export async function cancelTavernTask(input: CancelTavernTaskInput): Promise<TavernTaskVersionRecord> {
    return await runTaskWriteTransaction(async () => {
        await assertSessionExists(normalizeSessionId(input.sessionId));
        const result = await cancelTaskInCurrentTransaction(input);
        if (result.changed) {await touchSession(input.sessionId);}
        return result.version;
    });
}

export const withdrawTavernTask = cancelTavernTask;

async function progressTaskInCurrentTransaction(input: ProgressTavernTaskInput): Promise<MutationCommitResult> {
    const sessionId = normalizeSessionId(input.sessionId);
    const taskId = normalizeTaskId(input.taskId);
    const actionId = normalizeActionId(input.actionId);
    const expectedRevision = normalizeRevision(input.expectedRevision);
    const anchorOrder = normalizeTavernTaskAnchorOrder(input.anchorOrder);
    const progressSummary = normalizeText(input.progressSummary, TASK_TEXT_LIMIT, true);
    const replay = await findActionVersion(sessionId, actionId);
    if (replay) {
        await assertMutationReplayPredecessor(replay, {
            sessionId,
            taskId,
            expectedRevision,
            predecessorStatus: 'active',
            actionId,
        });
        assertActionReplay(replay,
            replay.status === 'active'
            && replay.progressSummary === progressSummary
            && replay.anchorOrder === anchorOrder,
        actionId);
        return { version: clone(replay), changed: false };
    }
    const current = await requireCurrentVersionInTransaction(sessionId, taskId, expectedRevision);
    if (current.status !== 'active') {throwTavernTaskError('task_task_not_active', current.status);}
    if (current.progressSummary === progressSummary) {return { version: clone(current), changed: false };}
    const version = buildNextVersion(current, actionId, anchorOrder, { progressSummary });
    await appendVersionInTransaction(current, version);
    return { version: clone(version), changed: true };
}

export async function progressTavernTask(input: ProgressTavernTaskInput): Promise<TavernTaskVersionRecord> {
    return await runTaskWriteTransaction(async () => {
        await assertSessionExists(normalizeSessionId(input.sessionId));
        const result = await progressTaskInCurrentTransaction(input);
        if (result.changed) {await touchSession(input.sessionId);}
        return result.version;
    });
}

function taskAssigneeAccountId(task: TavernTaskVersionRecord): string {
    if (!task.assignee) {throwTavernTaskError('task_transition_invalid', 'assignee_missing');}
    return task.assignee.kind === 'player'
        ? TAVERN_PLAYER_ACCOUNT_ID
        : buildTavernTaskCounterpartyAccountId(task.assignee.id);
}

async function completeTaskInCurrentTransaction(
    input: CompleteTavernTaskInput,
    options: TaskMutationCommitOptions = {},
): Promise<MutationCommitResult> {
    const sessionId = normalizeSessionId(input.sessionId);
    const taskId = normalizeTaskId(input.taskId);
    const actionId = normalizeActionId(input.actionId);
    const expectedRevision = normalizeRevision(input.expectedRevision);
    const anchorOrder = normalizeTavernTaskAnchorOrder(input.anchorOrder);
    const resultSummary = normalizeText(input.resultSummary, TASK_TEXT_LIMIT, true);
    const replay = await findActionVersion(sessionId, actionId);
    if (replay) {
        await assertMutationReplayPredecessor(replay, {
            sessionId,
            taskId,
            expectedRevision,
            predecessorStatus: 'active',
            actionId,
        });
        assertActionReplay(replay,
            replay.status === 'completed'
            && replay.resultSummary === resultSummary
            && replay.anchorOrder === anchorOrder,
        actionId);
        return { version: clone(replay), changed: false };
    }
    const current = await requireCurrentVersionInTransaction(sessionId, taskId, expectedRevision);
    if (current.status !== 'active') {throwTavernTaskError('task_task_not_active', current.status);}
    await postTavernEconomyTransactionInCurrentDbTransaction({
        sessionId,
        idempotencyKey: completionIdempotencyKey(taskId),
        fromAccountId: current.escrowAccountId,
        toAccountId: taskAssigneeAccountId(current),
        amount: current.reward,
        kind: 'task_reward',
        title: `任务完成 · ${current.title}`,
        note: resultSummary,
        sourceDomain: 'tasks',
        sourceId: taskId,
        anchorOrder,
    }, {
        touchSessionOnCreate: false,
        allowDelayedAnchorCommit: options.allowDelayedAnchorCommit === true,
    });
    const version = buildNextVersion(current, actionId, anchorOrder, {
        status: 'completed',
        resultSummary,
        progressSummary: current.progressSummary || '任务已完成',
    });
    await appendVersionInTransaction(current, version);
    return { version: clone(version), changed: true };
}

export async function completeTavernTask(input: CompleteTavernTaskInput): Promise<TavernTaskVersionRecord> {
    return await runTaskWriteTransaction(async () => {
        await assertSessionExists(normalizeSessionId(input.sessionId));
        const result = await completeTaskInCurrentTransaction(input);
        if (result.changed) {await touchSession(input.sessionId);}
        return result.version;
    });
}

async function failTaskInCurrentTransaction(
    input: FailTavernTaskInput,
    options: TaskMutationCommitOptions = {},
): Promise<MutationCommitResult> {
    const sessionId = normalizeSessionId(input.sessionId);
    const taskId = normalizeTaskId(input.taskId);
    const actionId = normalizeActionId(input.actionId);
    const expectedRevision = normalizeRevision(input.expectedRevision);
    const anchorOrder = normalizeTavernTaskAnchorOrder(input.anchorOrder);
    const resultSummary = normalizeText(input.resultSummary, TASK_TEXT_LIMIT, true);
    const replay = await findActionVersion(sessionId, actionId);
    if (replay) {
        await assertMutationReplayPredecessor(replay, {
            sessionId,
            taskId,
            expectedRevision,
            predecessorStatus: 'active',
            actionId,
        });
        assertActionReplay(replay,
            replay.status === 'failed'
            && replay.resultSummary === resultSummary
            && replay.anchorOrder === anchorOrder,
        actionId);
        return { version: clone(replay), changed: false };
    }
    const current = await requireCurrentVersionInTransaction(sessionId, taskId, expectedRevision);
    if (current.status !== 'active') {throwTavernTaskError('task_task_not_active', current.status);}
    const funding = await findFundingTransaction(sessionId, taskId);
    await reverseTavernEconomyTransactionInCurrentDbTransaction({
        sessionId,
        transactionId: funding.id,
        anchorOrder,
        idempotencyKey: refundIdempotencyKey(taskId),
        kind: 'task_refund',
        title: `任务失败 · ${current.title}`,
        note: resultSummary,
        sourceDomain: 'tasks',
        sourceId: taskId,
    }, {
        touchSessionOnCreate: false,
        allowDelayedAnchorCommit: options.allowDelayedAnchorCommit === true,
    });
    const version = buildNextVersion(current, actionId, anchorOrder, {
        status: 'failed',
        resultSummary,
    });
    await appendVersionInTransaction(current, version);
    return { version: clone(version), changed: true };
}

export async function failTavernTask(input: FailTavernTaskInput): Promise<TavernTaskVersionRecord> {
    return await runTaskWriteTransaction(async () => {
        await assertSessionExists(normalizeSessionId(input.sessionId));
        const result = await failTaskInCurrentTransaction(input);
        if (result.changed) {await touchSession(input.sessionId);}
        return result.version;
    });
}

export async function createTavernTaskStagingContext(value: string, anchorValue: number): Promise<TavernTaskStagingContext> {
    const sessionId = normalizeSessionId(value);
    const anchorOrder = normalizeTavernTaskAnchorOrder(anchorValue);
    await assertSessionExists(sessionId);
    const current = await listTavernTasksAtAnchor(sessionId, anchorOrder);
    return {
        sessionId,
        anchorOrder,
        actions: [],
        projected: new Map(current.map((task) => [task.taskId, clone(task)])),
        projectedByAction: new Map(),
    };
}

export function applyTavernTaskStagedAction(
    context: TavernTaskStagingContext,
    input: TavernTaskStagedAction,
): { version: TavernTaskVersionRecord; changed: boolean } {
    normalizeSessionId(context?.sessionId || '');
    if (
        !(context.projected instanceof Map)
        || !(context.projectedByAction instanceof Map)
        || !Array.isArray(context.actions)
    ) {
        throwTavernTaskError('task_staging_invalid');
    }
    const taskId = normalizeTaskId(input.taskId);
    const actionId = normalizeActionId(input.actionId);
    const expectedRevision = normalizeRevision(input.expectedRevision);
    const anchorOrder = normalizeTavernTaskAnchorOrder(input.anchorOrder);
    if (anchorOrder !== normalizeTavernTaskAnchorOrder(context.anchorOrder)) {
        throwTavernTaskError('task_staging_invalid', `anchor:${anchorOrder}:${context.anchorOrder}`);
    }
    const previousAction = context.actions.find((action) => action.actionId === actionId);
    if (previousAction) {
        const summaryMatches = input.kind === 'progress'
            ? previousAction.progressSummary === normalizeText(input.progressSummary, TASK_TEXT_LIMIT, true)
            : previousAction.resultSummary === normalizeText(input.resultSummary, TASK_TEXT_LIMIT, true);
        if (
            previousAction.taskId !== taskId
            || previousAction.kind !== input.kind
            || previousAction.expectedRevision !== expectedRevision
            || previousAction.anchorOrder !== anchorOrder
            || !summaryMatches
        ) {
            throwTavernTaskError('task_action_conflict', actionId);
        }
        const existing = context.projectedByAction.get(actionId);
        if (!existing) {throwTavernTaskError('task_missing', taskId);}
        return { version: clone(existing), changed: false };
    }
    const current = context.projected.get(taskId);
    if (!current) {throwTavernTaskError('task_missing', taskId);}
    if (current.revision !== expectedRevision) {
        throwTavernTaskError('task_revision_conflict', `${expectedRevision}:${current.revision}`);
    }
    if (current.status !== 'active') {throwTavernTaskError('task_task_not_active', current.status);}
    let patch: Partial<TavernTaskVersionRecord>;
    const action: TavernTaskStagedAction = {
        actionId,
        taskId,
        expectedRevision,
        kind: input.kind,
        anchorOrder,
    };
    if (input.kind === 'progress') {
        const progressSummary = normalizeText(input.progressSummary, TASK_TEXT_LIMIT, true);
        if (progressSummary === current.progressSummary) {return { version: clone(current), changed: false };}
        action.progressSummary = progressSummary;
        patch = { progressSummary };
    } else {
        const resultSummary = normalizeText(input.resultSummary, TASK_TEXT_LIMIT, true);
        action.resultSummary = resultSummary;
        patch = {
            status: input.kind === 'complete' ? 'completed' : 'failed',
            resultSummary,
        };
    }
    const projected = buildNextVersion(current, actionId, anchorOrder, patch);
    context.actions.push(action);
    context.projected.set(taskId, clone(projected));
    context.projectedByAction.set(actionId, clone(projected));
    return { version: clone(projected), changed: true };
}

export interface CommitTavernTaskStagedActionsResult {
    changed: boolean;
    versions: TavernTaskVersionRecord[];
}

/** Caller must already be inside a transaction containing task + economy + session tables. */
export async function commitTavernTaskStagedActionsInCurrentDbTransaction(input: {
    sessionId: string;
    actions: TavernTaskStagedAction[];
    touchSession?: boolean;
}): Promise<CommitTavernTaskStagedActionsResult> {
    const sessionId = normalizeSessionId(input.sessionId);
    await assertSessionExists(sessionId);
    const versions: TavernTaskVersionRecord[] = [];
    let changed = false;
    for (const action of input.actions || []) {
        if (action.kind === 'progress') {
            const result = await progressTaskInCurrentTransaction({
                sessionId,
                taskId: action.taskId,
                expectedRevision: action.expectedRevision,
                progressSummary: action.progressSummary || '',
                anchorOrder: action.anchorOrder,
                actionId: action.actionId,
            });
            versions.push(result.version);
            changed ||= result.changed;
            continue;
        }
        if (action.kind === 'complete') {
            const result = await completeTaskInCurrentTransaction({
                sessionId,
                taskId: action.taskId,
                expectedRevision: action.expectedRevision,
                resultSummary: action.resultSummary || '',
                anchorOrder: action.anchorOrder,
                actionId: action.actionId,
            }, { allowDelayedAnchorCommit: true });
            versions.push(result.version);
            changed ||= result.changed;
            continue;
        }
        if (action.kind === 'fail') {
            const result = await failTaskInCurrentTransaction({
                sessionId,
                taskId: action.taskId,
                expectedRevision: action.expectedRevision,
                resultSummary: action.resultSummary || '',
                anchorOrder: action.anchorOrder,
                actionId: action.actionId,
            }, { allowDelayedAnchorCommit: true });
            versions.push(result.version);
            changed ||= result.changed;
            continue;
        }
        throwTavernTaskError('task_staging_invalid', String((action as { kind?: unknown }).kind || ''));
    }
    if (changed && input.touchSession !== false) {await touchSession(sessionId);}
    return { changed, versions: clone(versions) };
}

export async function commitTavernTaskStagingContext(
    context: TavernTaskStagingContext,
): Promise<CommitTavernTaskStagedActionsResult> {
    const sessionId = normalizeSessionId(context?.sessionId || '');
    const actions = clone(context.actions || []);
    return await runTaskWriteTransaction(async () => commitTavernTaskStagedActionsInCurrentDbTransaction({
        sessionId,
        actions,
    }));
}
