import {
    ECONOMY_TRANSACTION_CAPABILITY,
    type EconomyReadCapability,
    type EconomyTransactionCapability,
} from '../../../capabilities/economy/index.js';
import type {
    PendingCommitRecoveryResult,
    PartitionStore,
    XiaobaiOsFileControls,
    XiaobaiOsFileState,
} from '../../../kernel/contracts.js';
import type { UserTransactions } from '../../../kernel/user-transactions.js';
import { upgradeTasksUserFile } from '../upgrade/user-file.js';
import { TASKS_PARTITION } from '../partition.js';
import { createPartitionDocument, type PartitionDocument } from '../../../kernel/partition-document.js';
import { collectTaskIdentityIds } from '../../../domains/tasks/invariants.js';
import { cancelTask } from '../../../domains/tasks/commands/recruitment.js';
import { projectTaskRecords } from '../../../domains/tasks/projection.js';
import type {
    TaskCandidateDraft,
    TaskDomainV1,
    TaskListingDraft,
    TaskPublishedForm,
    TaskRecord,
} from '../../../domains/tasks/types.js';
import { createTaskIdFactory, type TaskIdFactory } from './ids.js';
import { createTaskLocalActions } from './local-actions.js';
import { createTaskMaintenanceCommit } from './maintenance-commit.js';
import { postTaskEconomyEvent, validateTaskEconomyConsistency } from './economy-protocol.js';

export type CommitGuard = () => boolean | Promise<boolean>;

export interface TasksServiceView {
    initialization: 'loading' | 'ready' | 'failed';
    domain: TaskDomainV1 | null;
    records: TaskRecord[];
    commissions: Array<{ scopeId: string; sourceLabel: string; task: TaskRecord }>;
    currentScopeId: string | null;
    playerBalance: number;
    writeState: XiaobaiOsFileState;
    pendingSave: boolean;
}

export interface TasksActionResult {
    changed: boolean;
    staleTaskIds?: string[];
    record?: TaskRecord;
    view: TasksServiceView;
}

export interface AcceptListingRequest {
    actionId: string;
    boardId: string;
    listingId: string;
}

export interface PublishRequest {
    actionId: string;
    form: TaskPublishedForm;
}

export interface ReplaceBoardRequest {
    expectedBoardId: string | null;
    listings: readonly TaskListingDraft[];
    generatedAt: number;
}

export interface ReplaceCandidatesRequest {
    actionId: string;
    taskId: string;
    expectedTaskRevision: number;
    expectedEventId: string;
    candidates: readonly TaskCandidateDraft[];
}

export interface AssignCandidateRequest {
    actionId: string;
    taskId: string;
    expectedTaskRevision: number;
    expectedEventId: string;
    candidateId: string;
}

export interface CancelTaskRequest {
    actionId: string;
    taskId: string;
    expectedTaskRevision: number;
    expectedEventId: string;
}

interface TaskMaintenanceCommandBase {
    actionId: string;
    taskId: string;
    expectedTaskRevision: number;
    expectedEventId: string;
}

export type TaskMaintenanceCommand =
    | (TaskMaintenanceCommandBase & { kind: 'progress'; progressSummary: string })
    | (TaskMaintenanceCommandBase & { kind: 'complete'; resultSummary: string })
    | (TaskMaintenanceCommandBase & { kind: 'fail'; resultSummary: string });

export interface MaintenanceCommitRequest {
    commands: readonly TaskMaintenanceCommand[];
    checkedTasks: readonly { taskId: string; expectedTaskRevision: number; expectedEventId: string }[];
    evidenceDigest: string;
}

export interface TasksService {
    document: Pick<PartitionDocument, 'read'>;
    ensureReady(evidenceDigest?: string, identityKey?: string): Promise<void>;
    cancelCommission(input: CancelTaskRequest & { scopeId: string }): Promise<TasksActionResult>;
    readCommission(scopeId: string, taskId: string): { domain: TaskDomainV1; record: TaskRecord };
    readCurrent: () => TasksServiceView;
    refreshCurrent: () => Promise<TasksServiceView>;
    createActionId: () => string;
    acceptListing: (input: AcceptListingRequest, guard: CommitGuard) => Promise<TasksActionResult>;
    publish: (input: PublishRequest, guard: CommitGuard) => Promise<TasksActionResult>;
    replaceCandidates: (input: ReplaceCandidatesRequest, guard: CommitGuard) => Promise<TasksActionResult>;
    assignCandidate: (input: AssignCandidateRequest, guard: CommitGuard) => Promise<TasksActionResult>;
    cancel: (input: CancelTaskRequest, guard: CommitGuard) => Promise<TasksActionResult>;
    replaceBoard: (input: ReplaceBoardRequest, guard: CommitGuard) => Promise<TasksActionResult>;
    commitMaintenance: (input: MaintenanceCommitRequest, guard: CommitGuard) => Promise<TasksActionResult>;
    getWriteState: () => XiaobaiOsFileState;
    subscribeWriteState: (listener: () => void) => () => void;
    confirmPending: (guard?: () => boolean) => Promise<PendingCommitRecoveryResult>;
    adoptServerState: () => Promise<PendingCommitRecoveryResult>;
    subscribe: (listener: () => void) => () => void;
    dispose: () => void;
}

export interface TasksServiceDependencies {
    now?: () => number;
    ids?: TaskIdFactory;
    getPlayerDisplayName?: () => string;
    getEvidenceDigest?: () => string;
    getStoryLabel?: () => string;
    userTransactions?: UserTransactions;
}

export interface PreparedTaskAction {
    domain: TaskDomainV1;
    changed: boolean;
    persist?: boolean;
    record?: TaskRecord;
    staleTaskIds?: string[];
}

export interface TaskApplicationContext {
    now: () => number;
    ids: TaskIdFactory;
    getPlayerDisplayName: () => string;
    getEvidenceDigest: () => string;
    getStoryLabel: () => string;
    execute(
        guard: CommitGuard,
        mutate: (domain: TaskDomainV1, economy: EconomyTransactionCapability) => PreparedTaskAction,
    ): Promise<TasksActionResult>;
}

function transactionError(result: {
    status: 'failed' | 'unconfirmed' | 'conflict';
    error?: { code: string; message: string; retryable: boolean };
}): Error {
    const commitRejected = result.error?.code === 'commit_guard_rejected';
    return Object.assign(new Error(commitRejected
        ? 'tasks_commit_guard_failed'
        : result.error?.message || `tasks_save_${result.status}`), {
        code: commitRejected ? 'tasks_commit_guard_failed' : result.error?.code ?? `storage_${result.status}`,
        retryable: result.error?.retryable ?? true,
        uncertain: result.status === 'unconfirmed',
        saveStatus: result.status,
    });
}

async function assertCommitGuard(guard: CommitGuard): Promise<void> {
    if (typeof guard !== 'function' || await guard() !== true) {
        throw Object.assign(new Error('tasks_commit_guard_failed'), { code: 'tasks_commit_guard_failed' });
    }
}

export function createTasksService(
    store: PartitionStore<TaskDomainV1>,
    files: XiaobaiOsFileControls,
    economy: EconomyReadCapability,
    {
        now = Date.now,
        ids = createTaskIdFactory({ now }),
        getPlayerDisplayName = () => '玩家',
        getEvidenceDigest = () => '',
        getStoryLabel = () => '',
        userTransactions,
    }: TasksServiceDependencies = {},
): TasksService {
    const listeners = new Set<() => void>();
    let publishScheduled = false;
    const schedulePublish = (): void => {
        if (publishScheduled) {return;}
        publishScheduled = true;
        queueMicrotask(() => {
            publishScheduled = false;
            for (const listener of listeners) {
                try { listener(); } catch (error) {
                    console.error('[LittleWhiteBox] Tasks state listener failed', error);
                }
            }
        });
    };
    const unsubscribeStore = store.subscribe(schedulePublish);
    const unsubscribeEconomy = economy.subscribe(schedulePublish);
    const unsubscribeFiles = files.subscribeFileState(schedulePublish);

    const currentDomain = (): TaskDomainV1 | null => store.peekCurrent()?.value ?? null;
    let upgraded = !userTransactions;
    let upgradeInFlight: Promise<void> | null = null;
    let readyIdentity = '';
    let initializing: { identity: string; work: Promise<void> } | null = null;
    let failedIdentity = '';

    async function ensureReady(evidenceDigest = getEvidenceDigest(), identityKey = store.peekBinding()?.identityKey): Promise<void> {
        if (!upgraded && userTransactions) {
            if (!upgradeInFlight) {
                upgradeInFlight = upgradeTasksUserFile(userTransactions).then(() => {upgraded = true;})
                    .finally(() => {upgradeInFlight = null;});
            }
            try {await upgradeInFlight;}
            catch (error) {failedIdentity = identityKey ?? ''; schedulePublish(); throw error;}
        }
        if (!identityKey || store.peekBinding()?.identityKey !== identityKey) {return;}
        if (readyIdentity === identityKey) {return;}
        if (initializing?.identity === identityKey) {return initializing.work;}
        const work = (async () => {
            await store.read();
            if (store.peekBinding()?.identityKey !== identityKey) {return;}
            const current = currentDomain();
            if (current && Object.values(current.checks).some(receipt => receipt.phase === 'pending')) {
                const result = await store.transact(transaction => {
                    const domain = transaction.currentOrInitial();
                    const pending = Object.values(domain.checks).filter(receipt => receipt.phase === 'pending');
                    if (!pending.length) {return;}
                    for (const receipt of pending) {receipt.phase = 'baseline'; receipt.digest = evidenceDigest;}
                    transaction.replace(domain);
                }, { commitGuard: () => store.peekBinding()?.identityKey === identityKey });
                if (result.status !== 'confirmed' && result.status !== 'unchanged') {throw transactionError(result);}
            }
            if (store.peekBinding()?.identityKey === identityKey) {readyIdentity = identityKey; failedIdentity = '';}
        })();
        initializing = { identity: identityKey, work };
        schedulePublish();
        try {await work;}
        catch (error) {failedIdentity = identityKey; throw error;}
        finally {if (initializing?.work === work) {initializing = null;} schedulePublish();}
    }

    function buildView(domain?: TaskDomainV1 | null): TasksServiceView {
        const identity = store.peekBinding()?.identityKey ?? '';
        const initialization = identity && readyIdentity === identity && upgraded ? 'ready'
            : identity && failedIdentity === identity ? 'failed' : 'loading';
        const current = initialization === 'ready' ? domain === undefined ? currentDomain() : domain : null;
        const currentScopeId = store.peekBinding()?.osId ?? null;
        return {
            initialization,
            domain: current ? structuredClone(current) : null,
            records: current ? projectTaskRecords(current) : [],
            commissions: (initialization === 'ready' ? userTransactions?.peekOwnedStories(TASKS_PARTITION)
                ?? (current && currentScopeId ? [{ scopeId: currentScopeId, value: current }] : []) : [])
                .flatMap(({ scopeId, value }) => projectTaskRecords(value)
                    .filter(record => record.source === 'published'
                        && (record.status === 'recruiting' || record.status === 'active'))
                    .map(record => ({ scopeId, sourceLabel: value.storyLabel || '旧聊天', task: record }))),
            currentScopeId,
            playerBalance: economy.getPlayerBalance(),
            writeState: files.getFileState(),
            pendingSave: files.hasPendingCommit(),
        };
    }

    async function refreshCurrent(): Promise<TasksServiceView> {
        await ensureReady();
        if (store.peekBinding()?.identityKey !== readyIdentity) {throw new Error('tasks_chat_changed');}
        await economy.refresh();
        const result = await store.transact(transaction => {
            const domain = transaction.current;
            validateTaskEconomyConsistency(
                domain ?? transaction.currentOrInitial(),
                transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY),
            );
            return domain;
        });
        if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') {
            throw transactionError(result);
        }
        if (result.status === 'confirmed') {throw new Error('tasks_refresh_wrote_state');}
        return buildView(result.result);
    }

    async function execute(
        guard: CommitGuard,
        mutate: (domain: TaskDomainV1, transactionEconomy: EconomyTransactionCapability) => PreparedTaskAction,
    ): Promise<TasksActionResult> {
        await ensureReady();
        await assertCommitGuard(guard);
        const result = await store.transact(transaction => {
            const domain = transaction.currentOrInitial();
            const transactionEconomy = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
            validateTaskEconomyConsistency(domain, transactionEconomy);
            const prepared = mutate(domain, transactionEconomy);
            validateTaskEconomyConsistency(prepared.domain, transactionEconomy);
            if (prepared.changed || prepared.persist) { transaction.replace(prepared.domain); }
            return prepared;
        }, {
            commitGuard: async () => {
                await assertCommitGuard(guard);
                return true;
            },
        });
        if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') {
            throw transactionError(result);
        }
        const prepared = result.result;
        return {
            changed: prepared.changed,
            ...(prepared.staleTaskIds?.length ? { staleTaskIds: prepared.staleTaskIds } : {}),
            ...(prepared.record ? { record: structuredClone(prepared.record) } : {}),
            view: buildView(result.status === 'confirmed' ? result.snapshot.value : prepared.domain),
        };
    }

    const context: TaskApplicationContext = {
        now,
        ids,
        getPlayerDisplayName,
        getEvidenceDigest,
        getStoryLabel,
        execute,
    };
    const localActions = createTaskLocalActions(context);

    async function cancelCommission(input: CancelTaskRequest & { scopeId: string }): Promise<TasksActionResult> {
        if (!userTransactions) {throw new Error('tasks_global_commissions_unavailable');}
        const result = await userTransactions.transactOwned(TASKS_PARTITION,
            [ECONOMY_TRANSACTION_CAPABILITY], access => {
                const entry = access.stories().find(story => story.scopeId === input.scopeId);
                if (!entry) {throw new Error('tasks_commission_not_found');}
                const parsed = TASKS_PARTITION.parse(entry.raw);
                if (!parsed.ok) {throw new Error(parsed.error.message);}
                const domain = parsed.value;
                const account = access.useCapability(input.scopeId, ECONOMY_TRANSACTION_CAPABILITY);
                validateTaskEconomyConsistency(domain, account);
                const record = projectTaskRecords(domain).find(candidate => candidate.taskId === input.taskId);
                if (!record || record.source !== 'published' || record.issuer.kind !== 'player') {
                    throw new Error('tasks_commission_not_found');
                }
                const { scopeId: _scopeId, ...command } = input;
                const action = cancelTask(domain, command, {
                    now, createId: () => ids.create('event', collectTaskIdentityIds(domain)),
                });
                if (action.changed && action.event) {
                    postTaskEconomyEvent(account, action.event, action.record);
                    access.replaceStory(input.scopeId, action.domain);
                    validateTaskEconomyConsistency(action.domain, account);
                }
                return { changed: action.changed, record: action.record };
            });
        if ('result' in result) {return { ...result.result, view: buildView() };}
        throw transactionError(result);
    }

    function readCommission(scopeId: string, taskId: string): { domain: TaskDomainV1; record: TaskRecord } {
        const entry = userTransactions?.peekOwnedStories(TASKS_PARTITION)
            .find(story => story.scopeId === scopeId);
        if (!entry) {throw new Error('tasks_commission_not_found');}
        const record = projectTaskRecords(entry.value).find(candidate => candidate.taskId === taskId);
        if (!record || record.source !== 'published' || record.issuer.kind !== 'player'
            || !['recruiting', 'active'].includes(record.status)) {
            throw new Error('tasks_commission_not_found');
        }
        return { domain: entry.value, record };
    }

    return Object.freeze({
        document: { read: createPartitionDocument(store, TASKS_PARTITION).read },
        ensureReady,
        readCurrent: () => buildView(),
        refreshCurrent,
        createActionId() {
            const domain = currentDomain();
            return ids.create('action', domain ? collectTaskIdentityIds(domain) : new Set());
        },
        ...localActions,
        cancelCommission,
        readCommission,
        commitMaintenance: createTaskMaintenanceCommit(context),
        getWriteState: () => files.getFileState(),
        subscribeWriteState: (listener: () => void) => files.subscribeFileState(listener),
        confirmPending: (guard?: () => boolean) => files.retryPending({ beforeRetry: guard }),
        adoptServerState: () => files.adoptServerState(),
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        dispose() {
            unsubscribeStore();
            unsubscribeEconomy();
            unsubscribeFiles();
            listeners.clear();
        },
    });
}
