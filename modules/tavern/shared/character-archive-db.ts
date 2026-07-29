import db, {
    tavernManagerMemorySnapshotsTable,
    tavernAssistantChatMessagesTable,
    tavernAssistantChatMessageSummariesTable,
    buildTavernAssistantChatMessageSummary,
    rebuildTavernTranscriptLineCounts,
    tavernManagerCandidatesTable,
    tavernManagerRunsTable,
    tavernManagerStateSnapshotsTable,
    tavernMemoryFilesTable,
    tavernMemoryIndexesTable,
    tavernMemorySnapshotsTable,
    tavernMessagesTable,
    tavernMetaTable,
    tavernSessionsTable,
    tavernStateDocumentsTable,
    tavernStatePatchesTable,
    tavernStatusSnapshotsTable,
    tavernCommunicationContactsTable,
    tavernCommunicationMessagesTable,
    tavernCommunicationSnapshotsTable,
    tavernCommunicationThreadsTable,
    tavernEconomyAccountsTable,
    tavernEconomyTransactionsTable,
    tavernTaskBoardsTable,
    tavernTaskVersionsTable,
    tavernShopStateVersionsTable,
    tavernBankStateVersionsTable,
    tavernBankActivitiesTable,
    tavernPetStateVersionsTable,
    tavernPetActivitiesTable,
    TAVERN_COMMUNICATION_REPLY_INTERRUPTED_ERROR,
    type TavernCommunicationSnapshotRecord,
    type TavernCommunicationThreadRecord,
    type TavernManagerMemorySnapshotRecord,
    type TavernManagerRunRecord,
    type TavernManagerStateSnapshotRecord,
    type TavernMemorySnapshotRecord,
    type TavernSessionRecord,
    type TavernStatusSnapshotRecord,
    type TavernStructuredStateDocumentRecord,
    type TavernStructuredStatePatchRecord,
} from './session-db';
import {
    CURRENT_TAVERN_CHARACTER_ARCHIVE_VERSION,
    createEmptyTavernCharacterArchiveCounts,
    TAVERN_CHARACTER_ARCHIVE_TABLES,
    type TavernCharacterArchiveCharacter,
    type TavernCharacterArchiveCounts,
    type TavernCharacterArchiveExportSummary,
    type TavernCharacterArchiveManifest,
    type TavernCharacterArchiveRecord,
    type TavernCharacterArchiveRecordPayload,
    type TavernCharacterArchiveRestoreSummary,
    type TavernCharacterArchiveTable,
} from './character-archive-types';
import { assertTavernManagerSnapshotStable } from './manager-snapshot-integrity';
import {
    TAVERN_ECONOMY_OPENING_GRANT,
    TAVERN_ECONOMY_OPENING_IDEMPOTENCY_KEY,
    TAVERN_PLAYER_ACCOUNT_ID,
    TAVERN_SYSTEM_MINT_ACCOUNT_ID,
    TAVERN_SYSTEM_SINK_ACCOUNT_ID,
    type TavernEconomyAccountKind,
    type TavernEconomyAccountRecord,
    type TavernEconomyTransactionRecord,
} from './economy/economy-types';
import {
    TAVERN_TASK_CURRENT_MARKER,
    normalizeTavernTaskVersionRecord,
    type TavernTaskBoardRecord,
    type TavernTaskParty,
    type TavernTaskVersionRecord,
} from './tasks/task-types';
import {
    findTavernShopItem,
} from './shop/shop-catalog';
import {
    parseCanonicalTavernShopStateVersionRecord,
    TAVERN_SHOP_CURRENT_MARKER,
    type TavernShopActivation,
    type TavernShopStateVersionRecord,
} from './shop/shop-types';
import {
    findTavernShopStateInvariantViolation,
} from './shop/shop-invariants';
import {
    findTavernBankActivitiesInvariantViolation,
    parseCanonicalTavernBankActivityRecord,
    parseCanonicalTavernBankStateVersionRecord,
} from './bank/bank-invariants';
import {
    findTavernBankHistoryInvariantViolation,
} from './bank/bank-history';
import { TAVERN_BANK_PUSH_BET } from './bank/games/push-your-luck';
import {
    TAVERN_BANK_CURRENT_MARKER,
    type TavernBankActivityRecord,
    type TavernBankStateVersionRecord,
} from './bank/bank-types';
import {
    parseCanonicalTavernPetActivityRecord,
    parseCanonicalTavernPetStateVersionRecord,
} from './pet/pet-invariants';
import { assertTavernPetHistoryInvariant } from './pet/pet-history';

const RESTORE_TEMP_CHARACTER_PREFIX = '__lwb_restore__';
const RESTORE_BATCH_SIZE = 500;
const ARCHIVE_DB_BATCH_SIZE = 500;
const ARCHIVE_COUNT_FIELDS = [
    'sessions',
    'messages',
    'memoryFiles',
    'stateDocuments',
    'communications',
    'economy',
    'tasks',
    'shop',
    'bank',
    'pet',
] as const satisfies readonly (keyof TavernCharacterArchiveCounts)[];
const ARCHIVE_TABLE_NAMES = new Set<string>(TAVERN_CHARACTER_ARCHIVE_TABLES);

type ArchiveWritable = {
    write(record: TavernCharacterArchiveRecord): Promise<void>;
};

interface ArchiveRuntimeTable {
    where(index: string): {
        equals(value: unknown): ArchiveRuntimeCollection;
    };
    bulkAdd(records: unknown[]): Promise<unknown>;
    bulkDelete(keys: unknown[]): Promise<unknown>;
}

interface ArchiveRuntimeCollection {
    offset(count: number): ArchiveRuntimeCollection;
    limit(count: number): ArchiveRuntimeCollection;
    toArray(): Promise<unknown[]>;
    primaryKeys(): Promise<unknown[]>;
    count(): Promise<number>;
}

type ArchiveTableMap = Record<TavernCharacterArchiveTable, {
    table: ArchiveRuntimeTable;
    sessionIndex: 'sessionId' | 'characterKey';
}>;

const archiveTables: ArchiveTableMap = {
    sessions: { table: tavernSessionsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'characterKey' },
    messages: { table: tavernMessagesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    assistantChatMessages: { table: tavernAssistantChatMessagesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    managerRuns: { table: tavernManagerRunsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    managerCandidates: { table: tavernManagerCandidatesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    memoryFiles: { table: tavernMemoryFilesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    memorySnapshots: { table: tavernMemorySnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    memoryIndexes: { table: tavernMemoryIndexesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    managerMemorySnapshots: { table: tavernManagerMemorySnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    stateDocuments: { table: tavernStateDocumentsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    statePatches: { table: tavernStatePatchesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    statusSnapshots: { table: tavernStatusSnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    managerStateSnapshots: { table: tavernManagerStateSnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    communicationContacts: { table: tavernCommunicationContactsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    communicationThreads: { table: tavernCommunicationThreadsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    communicationMessages: { table: tavernCommunicationMessagesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    communicationSnapshots: { table: tavernCommunicationSnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    economyAccounts: { table: tavernEconomyAccountsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    economyTransactions: { table: tavernEconomyTransactionsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    taskBoards: { table: tavernTaskBoardsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    taskVersions: { table: tavernTaskVersionsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    shopStateVersions: { table: tavernShopStateVersionsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    bankStateVersions: { table: tavernBankStateVersionsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    bankActivities: { table: tavernBankActivitiesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    petStateVersions: { table: tavernPetStateVersionsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    petActivities: { table: tavernPetActivitiesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
};

function now(): number {
    return Date.now();
}

function createRestoreJobId(): string {
    return `${now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function cloneSerializable<T>(value: T): T {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeCharacterKey(characterKey = ''): string {
    const key = String(characterKey || '').trim();
    if (!key) {throw new Error('character_key_required');}
    return key;
}

function emptyCounts(): TavernCharacterArchiveCounts {
    return createEmptyTavernCharacterArchiveCounts();
}

function incrementArchiveCounts(counts: TavernCharacterArchiveCounts, table: TavernCharacterArchiveTable) {
    if (table === 'sessions') {counts.sessions += 1;}
    if (table === 'messages') {counts.messages += 1;}
    if (table === 'memoryFiles') {counts.memoryFiles += 1;}
    if (table === 'stateDocuments') {counts.stateDocuments += 1;}
    if (table.startsWith('communication')) {counts.communications = (Number(counts.communications) || 0) + 1;}
    if (table.startsWith('economy')) {counts.economy += 1;}
    if (table.startsWith('task')) {counts.tasks += 1;}
    if (table.startsWith('shop')) {counts.shop += 1;}
    if (table.startsWith('bank')) {counts.bank += 1;}
    if (table.startsWith('pet')) {counts.pet += 1;}
}

function totalManifestCount(manifest: TavernCharacterArchiveManifest): number {
    const counts = manifest.counts || createEmptyTavernCharacterArchiveCounts();
    return (Number(counts.sessions) || 0)
        + (Number(counts.messages) || 0)
        + (Number(counts.memoryFiles) || 0)
        + (Number(counts.stateDocuments) || 0)
        + (Number(counts.communications) || 0)
        + (Number(counts.economy) || 0)
        + (Number(counts.tasks) || 0)
        + (Number(counts.shop) || 0)
        + (Number(counts.bank) || 0)
        + (Number(counts.pet) || 0);
}

type CapturedCharacterArchiveSession = {
    session: TavernSessionRecord;
    records: TavernCharacterArchiveRecord[];
};

const CHARACTER_ARCHIVE_SESSION_TABLES = TAVERN_CHARACTER_ARCHIVE_TABLES
    .filter((table) => table !== 'sessions');

function assertCapturedArchiveStateStable(records: Map<TavernCharacterArchiveTable, unknown[]>): void {
    assertTavernManagerSnapshotStable({
        runs: records.get('managerRuns') as TavernManagerRunRecord[] || [],
        memorySnapshots: records.get('managerMemorySnapshots') as TavernManagerMemorySnapshotRecord[] || [],
        stateSnapshots: records.get('managerStateSnapshots') as TavernManagerStateSnapshotRecord[] || [],
        statePatches: records.get('statePatches') as TavernStructuredStatePatchRecord[] || [],
    }, 'manager_archive_unaccepted_writes');
}

async function captureCharacterArchiveSession(sessionId = ''): Promise<CapturedCharacterArchiveSession> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('archive_session_required');}
    return await db.transaction(
        'r',
        tavernSessionsTable,
        tavernMessagesTable,
        tavernAssistantChatMessagesTable,
        tavernAssistantChatMessageSummariesTable,
        tavernManagerRunsTable,
        tavernManagerCandidatesTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernMemoryIndexesTable,
        tavernStateDocumentsTable,
        tavernStatePatchesTable,
        tavernStatusSnapshotsTable,
        tavernCommunicationContactsTable,
        tavernCommunicationThreadsTable,
        tavernCommunicationMessagesTable,
        tavernCommunicationSnapshotsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        tavernTaskBoardsTable,
        tavernTaskVersionsTable,
        tavernShopStateVersionsTable,
        tavernBankStateVersionsTable,
        tavernBankActivitiesTable,
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
        async () => {
            const session = await tavernSessionsTable.get(id);
            if (!session) {throw new Error('archive_session_missing');}
            const records = new Map<TavernCharacterArchiveTable, unknown[]>();
            for (const table of CHARACTER_ARCHIVE_SESSION_TABLES) {
                const tableInfo = archiveTables[table];
                records.set(table, await tableInfo.table.where(tableInfo.sessionIndex).equals(id).toArray());
            }
            assertCapturedArchiveStateStable(records);
            return {
                session: cloneSerializable(session),
                records: CHARACTER_ARCHIVE_SESSION_TABLES.flatMap((table) => (records.get(table) || []).map((record) => ({
                    table,
                    record: cloneSerializable(record) as never,
                } as TavernCharacterArchiveRecord))),
            };
        },
    );
}

function taskPartyAccountId(party: TavernTaskParty | undefined): string {
    if (!party) {return '';}
    return party.kind === 'player' ? TAVERN_PLAYER_ACCOUNT_ID : `counterparty:${party.id}`;
}

function archiveEconomyAccountKind(accountId = ''): TavernEconomyAccountKind | null {
    const id = String(accountId || '').trim();
    if (id === TAVERN_PLAYER_ACCOUNT_ID) {return 'player';}
    if (id === TAVERN_SYSTEM_MINT_ACCOUNT_ID || id === TAVERN_SYSTEM_SINK_ACCOUNT_ID) {return 'system';}
    if (/^contact:[^:\s][^\s]*$/u.test(id)) {return 'contact';}
    if (/^counterparty:[^:\s][^\s]*$/u.test(id)) {return 'counterparty';}
    if (/^escrow:[^:\s][^\s]*$/u.test(id)) {return 'escrow';}
    return null;
}

/** Replays the persisted Economy ledger so archived balances cannot diverge from its facts. */
function assertEconomyArchiveLedgerStable(input: {
    session: TavernSessionRecord;
    accounts: TavernEconomyAccountRecord[];
    transactions: TavernEconomyTransactionRecord[];
}): void {
    const sessionId = input.session.id;
    const accounts = new Map<string, TavernEconomyAccountRecord>();
    for (const account of input.accounts) {
        const kind = archiveEconomyAccountKind(account.id);
        if (
            account.sessionId !== sessionId
            || !kind
            || account.kind !== kind
            || accounts.has(account.id)
            || !Number.isSafeInteger(account.balance)
            || ((kind === 'player' || kind === 'escrow') && account.balance < 0)
            || !Number.isSafeInteger(account.createdAt)
            || account.createdAt < 0
            || !Number.isSafeInteger(account.updatedAt)
            || account.updatedAt < 0
        ) {
            throw new Error(`archive_economy_account_invalid:${sessionId}:${String(account.id || '')}`);
        }
        accounts.set(account.id, account);
    }

    const transactions = input.transactions.slice().sort((left, right) => left.ledgerOrder - right.ledgerOrder);
    if (!transactions.length) {
        if (accounts.size) {throw new Error(`archive_economy_accounts_without_ledger:${sessionId}`);}
        return;
    }
    const opening = transactions[0];
    if (
        opening.ledgerOrder !== 0
        || opening.idempotencyKey !== TAVERN_ECONOMY_OPENING_IDEMPOTENCY_KEY
        || opening.fromAccountId !== TAVERN_SYSTEM_MINT_ACCOUNT_ID
        || opening.toAccountId !== TAVERN_PLAYER_ACCOUNT_ID
        || opening.amount !== TAVERN_ECONOMY_OPENING_GRANT
        || opening.kind !== 'opening_grant'
        || opening.sourceDomain !== 'economy'
        || opening.sourceId !== 'opening-grant'
        || opening.anchorOrder !== -1
        || opening.reversalOfTransactionId !== undefined
    ) {
        throw new Error(`archive_economy_opening_invalid:${sessionId}`);
    }

    const balances = new Map(Array.from(accounts.keys(), (accountId) => [accountId, 0]));
    const transactionIds = new Map<string, TavernEconomyTransactionRecord>();
    const idempotencyKeys = new Set<string>();
    const ledgerOrders = new Set<number>();
    const reversedTransactionIds = new Set<string>();
    for (const transaction of transactions) {
        const from = accounts.get(transaction.fromAccountId);
        const to = accounts.get(transaction.toAccountId);
        if (
            transaction.sessionId !== sessionId
            || !String(transaction.id || '').trim()
            || transactionIds.has(transaction.id)
            || !String(transaction.idempotencyKey || '').trim()
            || idempotencyKeys.has(transaction.idempotencyKey)
            || !from
            || !to
            || transaction.fromAccountId === transaction.toAccountId
            || !Number.isSafeInteger(transaction.amount)
            || transaction.amount <= 0
            || !Number.isSafeInteger(transaction.anchorOrder)
            || transaction.anchorOrder < -1
            || !Number.isSafeInteger(transaction.ledgerOrder)
            || transaction.ledgerOrder < 0
            || ledgerOrders.has(transaction.ledgerOrder)
            || !Number.isSafeInteger(transaction.playerBalanceAfter)
            || transaction.playerBalanceAfter < 0
            || !Number.isSafeInteger(transaction.createdAt)
            || transaction.createdAt < 0
        ) {
            throw new Error(`archive_economy_transaction_invalid:${sessionId}:${String(transaction.id || '')}`);
        }
        if (transaction.reversalOfTransactionId !== undefined) {
            const originalId = String(transaction.reversalOfTransactionId || '').trim();
            const original = transactionIds.get(originalId);
            if (
                !originalId
                || !original
                || reversedTransactionIds.has(originalId)
                || transaction.fromAccountId !== original.toAccountId
                || transaction.toAccountId !== original.fromAccountId
                || transaction.amount !== original.amount
                || transaction.anchorOrder < original.anchorOrder
            ) {
                throw new Error(`archive_economy_reversal_invalid:${sessionId}:${originalId}`);
            }
            reversedTransactionIds.add(originalId);
        }

        const fromBalance = Number(balances.get(from.id) || 0) - transaction.amount;
        const toBalance = Number(balances.get(to.id) || 0) + transaction.amount;
        if (
            !Number.isSafeInteger(fromBalance)
            || !Number.isSafeInteger(toBalance)
            || ((from.kind === 'player' || from.kind === 'escrow') && fromBalance < 0)
        ) {
            throw new Error(`archive_economy_balance_transition_invalid:${sessionId}:${transaction.id}`);
        }
        balances.set(from.id, fromBalance);
        balances.set(to.id, toBalance);
        const playerBalance = Number(balances.get(TAVERN_PLAYER_ACCOUNT_ID) || 0);
        if (transaction.playerBalanceAfter !== playerBalance) {
            throw new Error(`archive_economy_player_balance_invalid:${sessionId}:${transaction.id}`);
        }
        transactionIds.set(transaction.id, transaction);
        idempotencyKeys.add(transaction.idempotencyKey);
        ledgerOrders.add(transaction.ledgerOrder);
    }
    for (const account of accounts.values()) {
        if (account.balance !== Number(balances.get(account.id) || 0)) {
            throw new Error(`archive_economy_account_balance_invalid:${sessionId}:${account.id}`);
        }
    }
}

function assertTaskEconomyArchiveStable(input: {
    session: TavernSessionRecord;
    board: TavernTaskBoardRecord | null;
    versions: TavernTaskVersionRecord[];
    accounts: TavernEconomyAccountRecord[];
    transactions: TavernEconomyTransactionRecord[];
}): void {
    const sessionId = input.session.id;
    const sessionEpoch = Number(input.session.taskBoardEpoch);
    if (!Number.isSafeInteger(sessionEpoch) || sessionEpoch < 1) {
        throw new Error(`archive_task_board_epoch_invalid:${sessionId}`);
    }
    if (input.board && (input.board.sessionId !== sessionId || input.board.epoch !== sessionEpoch)) {
        throw new Error(`archive_task_board_epoch_mismatch:${sessionId}`);
    }
    const accounts = new Map(input.accounts.map((account) => [account.id, account]));
    for (const account of input.accounts) {
        if (account.sessionId !== sessionId) {throw new Error(`archive_economy_session_mismatch:${sessionId}`);}
    }
    for (const transaction of input.transactions) {
        if (transaction.sessionId !== sessionId) {throw new Error(`archive_economy_session_mismatch:${sessionId}`);}
        if (!accounts.has(transaction.fromAccountId) || !accounts.has(transaction.toAccountId)) {
            throw new Error(`archive_economy_account_missing:${sessionId}:${transaction.id}`);
        }
    }
    const taskTransactions = input.transactions.filter((transaction) => transaction.sourceDomain === 'tasks');
    const versionsByTask = new Map<string, TavernTaskVersionRecord[]>();
    const versionIds = new Set<string>();
    for (const rawVersion of input.versions) {
        const version = normalizeTavernTaskVersionRecord(rawVersion);
        if (version.sessionId !== sessionId) {throw new Error(`archive_task_session_mismatch:${sessionId}`);}
        if (versionIds.has(version.versionId)) {throw new Error(`archive_task_version_id_duplicate:${version.versionId}`);}
        versionIds.add(version.versionId);
        const rows = versionsByTask.get(version.taskId) || [];
        rows.push(version);
        versionsByTask.set(version.taskId, rows);
    }
    const knownTaskIds = new Set(versionsByTask.keys());
    if (taskTransactions.some((transaction) => !knownTaskIds.has(transaction.sourceId))) {
        throw new Error(`archive_task_transaction_orphan:${sessionId}`);
    }
    for (const [taskId, rows] of versionsByTask) {
        rows.sort((left, right) => left.revision - right.revision);
        if (rows.some((row, index) => row.taskId !== taskId || row.revision !== index + 1)) {
            throw new Error(`archive_task_version_chain_invalid:${taskId}`);
        }
        const currentRows = rows.filter((row) => row.currentMarker === TAVERN_TASK_CURRENT_MARKER);
        const current = rows.at(-1)!;
        if (currentRows.length !== 1 || currentRows[0].versionId !== current.versionId) {
            throw new Error(`archive_task_current_marker_invalid:${taskId}`);
        }
        if (rows.some((row) => row.escrowAccountId !== current.escrowAccountId || row.reward !== current.reward)) {
            throw new Error(`archive_task_immutable_fields_changed:${taskId}`);
        }
        const escrow = accounts.get(current.escrowAccountId);
        if (!escrow || escrow.kind !== 'escrow') {throw new Error(`archive_task_escrow_missing:${taskId}`);}
        const transactions = taskTransactions.filter((transaction) => transaction.sourceId === taskId);
        const fundingRows = transactions.filter((transaction) => transaction.kind === 'task_escrow');
        if (fundingRows.length !== 1) {throw new Error(`archive_task_funding_invalid:${taskId}`);}
        const funding = fundingRows[0];
        if (
            funding.amount !== current.reward
            || funding.toAccountId !== current.escrowAccountId
            || funding.fromAccountId !== taskPartyAccountId(current.issuer)
        ) {throw new Error(`archive_task_funding_invalid:${taskId}`);}
        const settlements = transactions.filter((transaction) => transaction.kind === 'task_reward');
        const refunds = transactions.filter((transaction) => transaction.kind === 'task_refund');
        if (current.status === 'completed') {
            if (
                settlements.length !== 1
                || refunds.length !== 0
                || settlements[0].fromAccountId !== current.escrowAccountId
                || settlements[0].toAccountId !== taskPartyAccountId(current.assignee)
                || settlements[0].amount !== current.reward
                || escrow.balance !== 0
            ) {throw new Error(`archive_task_settlement_invalid:${taskId}`);}
        } else if (current.status === 'failed' || current.status === 'cancelled') {
            if (
                refunds.length !== 1
                || settlements.length !== 0
                || refunds[0].fromAccountId !== current.escrowAccountId
                || refunds[0].toAccountId !== taskPartyAccountId(current.issuer)
                || refunds[0].amount !== current.reward
                || refunds[0].reversalOfTransactionId !== funding.id
                || escrow.balance !== 0
            ) {throw new Error(`archive_task_refund_invalid:${taskId}`);}
        } else if (settlements.length !== 0 || refunds.length !== 0 || escrow.balance !== current.reward) {
            throw new Error(`archive_task_escrow_state_invalid:${taskId}`);
        }
    }
}

/**
 * Shop invariants for an archived session: a continuous 1..N revision chain,
 * exactly one current marker on the highest revision, and only catalog-known
 * item ids. Unknown or malformed shop state fails the whole archive.
 */
function assertShopArchiveStateInvariants(state: TavernShopStateVersionRecord['state']): void {
    const violation = findTavernShopStateInvariantViolation(state);
    if (!violation) {return;}
    const detail = `${violation.itemId}:${violation.activationId || ''}`;
    if (violation.code === 'item-unknown') {
        throw new Error(`archive_shop_item_unknown:${violation.itemId}`);
    }
    if (violation.code === 'purchase-limit') {
        throw new Error(`archive_shop_purchase_limit_invalid:${violation.itemId}`);
    }
    if (violation.code === 'activation-id-duplicate') {
        throw new Error(`archive_shop_activation_id_duplicate:${violation.activationId || ''}`);
    }
    if (violation.code === 'parameters-invalid') {
        throw new Error(`archive_shop_parameters_invalid:${detail}`);
    }
    if (violation.code === 'activation-lifecycle-invalid') {
        throw new Error(`archive_shop_activation_end_invalid:${violation.activationId || ''}`);
    }
    if (violation.code === 'activation-overlap') {
        throw new Error(`archive_shop_activation_overlap_invalid:${detail}`);
    }
    throw new Error(`archive_shop_state_invalid:${detail}`);
}

function assertShopArchiveStable(input: {
    session: TavernSessionRecord;
    versions: TavernShopStateVersionRecord[];
    transactions: TavernEconomyTransactionRecord[];
}): void {
    const sessionId = input.session.id;
    const rows = input.versions.map((row) => cloneSerializable(row));
    const versionIds = new Set<string>();
    const actionIds = new Set<string>();
    for (const row of rows) {
        if (row.sessionId !== sessionId) {throw new Error(`archive_shop_session_mismatch:${sessionId}`);}
        if (versionIds.has(row.versionId)) {throw new Error(`archive_shop_version_id_duplicate:${row.versionId}`);}
        versionIds.add(row.versionId);
        if (actionIds.has(row.actionId)) {throw new Error(`archive_shop_action_id_duplicate:${row.actionId}`);}
        actionIds.add(row.actionId);
        if (!findTavernShopItem(row.action.itemId)) {
            throw new Error(`archive_shop_item_unknown:${row.action.itemId}`);
        }
        assertShopArchiveStateInvariants(row.state);
        const actionActivationId = String(row.action.activationId || '');
        if (row.action.kind === 'purchase') {
            if (actionActivationId) {throw new Error(`archive_shop_action_invalid:${row.actionId}`);}
        } else {
            const activation = row.state.items[row.action.itemId]?.activations
                .find((candidate) => candidate.id === actionActivationId);
            if (!actionActivationId || !activation) {
                throw new Error(`archive_shop_action_invalid:${row.actionId}`);
            }
            if (row.action.kind === 'deactivate' && activation.endReason !== 'manual') {
                throw new Error(`archive_shop_action_invalid:${row.actionId}`);
            }
        }
    }
    if (!rows.length) {return;}
    rows.sort((left, right) => left.revision - right.revision);
    if (rows.some((row, index) => row.revision !== index + 1)) {
        throw new Error(`archive_shop_version_chain_invalid:${sessionId}`);
    }
    const currentRows = rows.filter((row) => row.currentMarker === TAVERN_SHOP_CURRENT_MARKER);
    const current = rows.at(-1)!;
    if (currentRows.length !== 1 || currentRows[0].versionId !== current.versionId) {
        throw new Error(`archive_shop_current_marker_invalid:${sessionId}`);
    }
    const canonicalJson = (value: unknown): string => JSON.stringify(value, (_key, entry) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {return entry;}
        return Object.fromEntries(Object.entries(entry as Record<string, unknown>).sort(([left], [right]) => (
            left.localeCompare(right)
        )));
    });
    const activationOrigin = (activation: TavernShopActivation) => ({
        id: activation.id,
        itemId: activation.itemId,
        parameters: activation.parameters,
        startsAtTurn: activation.startsAtTurn,
        activatedAtOrder: activation.activatedAtOrder,
        activatedAt: activation.activatedAt,
    });
    let previousState = { items: {} } as TavernShopStateVersionRecord['state'];
    let previousAnchor = -1;
    for (const row of rows) {
        if (row.anchorOrder < previousAnchor) {
            throw new Error(`archive_shop_anchor_regression:${row.actionId}`);
        }
        const expected = cloneSerializable(previousState);
        const beforeEntry = expected.items[row.action.itemId];
        const rowEntry = row.state.items[row.action.itemId];
        if (row.action.kind === 'purchase') {
            const source = beforeEntry || { itemId: row.action.itemId, quantity: 0, activations: [] };
            expected.items[row.action.itemId] = {
                itemId: row.action.itemId,
                quantity: source.quantity + 1,
                activations: [...source.activations],
            };
        } else if (row.action.kind === 'activate') {
            const activationId = String(row.action.activationId || '');
            const activation = rowEntry?.activations.find((candidate) => candidate.id === activationId);
            if (
                !beforeEntry
                || beforeEntry.quantity < 1
                || !activation
                || beforeEntry.activations.some((candidate) => candidate.id === activationId)
                || activation.activatedAtOrder !== row.anchorOrder
            ) {
                throw new Error(`archive_shop_transition_invalid:${row.actionId}`);
            }
            expected.items[row.action.itemId] = {
                itemId: row.action.itemId,
                quantity: beforeEntry.quantity - 1,
                activations: [...beforeEntry.activations, activation],
            };
        } else {
            const activationId = String(row.action.activationId || '');
            const beforeActivation = beforeEntry?.activations.find((candidate) => candidate.id === activationId);
            const endedActivation = rowEntry?.activations.find((candidate) => candidate.id === activationId);
            if (
                !beforeEntry
                || !beforeActivation
                || beforeActivation.endedAtTurn !== undefined
                || !endedActivation
                || endedActivation.endReason !== 'manual'
                || endedActivation.endedAtOrder !== row.anchorOrder
                || canonicalJson(activationOrigin(beforeActivation)) !== canonicalJson(activationOrigin(endedActivation))
            ) {
                throw new Error(`archive_shop_transition_invalid:${row.actionId}`);
            }
            expected.items[row.action.itemId] = {
                itemId: row.action.itemId,
                quantity: beforeEntry.quantity,
                activations: beforeEntry.activations.map((activation) => (
                    activation.id === activationId ? endedActivation : activation
                )),
            };
        }
        if (canonicalJson(expected) !== canonicalJson(row.state)) {
            throw new Error(`archive_shop_transition_invalid:${row.actionId}`);
        }
        previousState = row.state;
        previousAnchor = row.anchorOrder;
    }
    const purchases = rows.filter((row) => row.action.kind === 'purchase');
    const shopTransactions = input.transactions.filter((transaction) => (
        transaction.kind === 'shop_purchase' || transaction.sourceDomain === 'shop'
    ));
    if (shopTransactions.length !== purchases.length) {
        throw new Error(`archive_shop_ledger_count_invalid:${sessionId}`);
    }
    for (const purchase of purchases) {
        const item = findTavernShopItem(purchase.action.itemId)!;
        const transaction = shopTransactions.find((candidate) => (
            candidate.idempotencyKey === `shop:purchase:${purchase.actionId}`
        ));
        if (
            !transaction
            || transaction.fromAccountId !== TAVERN_PLAYER_ACCOUNT_ID
            || transaction.toAccountId !== TAVERN_SYSTEM_SINK_ACCOUNT_ID
            || transaction.amount !== item.price
            || transaction.kind !== 'shop_purchase'
            || transaction.sourceDomain !== 'shop'
            || transaction.sourceId !== item.id
            || transaction.anchorOrder !== purchase.anchorOrder
        ) {
            throw new Error(`archive_shop_ledger_invalid:${purchase.actionId}`);
        }
    }
}

type TavernBankOpenedFact = {
    kind: 'deposit' | 'fund' | 'dice' | 'push' | 'ladder';
    amount: number;
    anchorOrder: number;
};

function assertBankArchiveStable(input: {
    session: TavernSessionRecord;
    versions: TavernBankStateVersionRecord[];
    activities: TavernBankActivityRecord[];
    transactions: TavernEconomyTransactionRecord[];
}): void {
    const sessionId = input.session.id;
    const rows = input.versions.map((row) => parseCanonicalTavernBankStateVersionRecord(row));
    const activities = input.activities.map((activity) => parseCanonicalTavernBankActivityRecord(activity));
    const activityViolation = findTavernBankActivitiesInvariantViolation(activities);
    if (activityViolation) {
        throw new Error(`archive_bank_activity_invalid:${activityViolation.code}:${activityViolation.detail}`);
    }
    const versionIds = new Set<string>();
    const actionIds = new Set<string>();
    for (const row of rows) {
        if (row.sessionId !== sessionId) {throw new Error(`archive_bank_session_mismatch:${sessionId}`);}
        if (versionIds.has(row.versionId)) {throw new Error(`archive_bank_version_id_duplicate:${row.versionId}`);}
        if (actionIds.has(row.actionId)) {throw new Error(`archive_bank_action_id_duplicate:${row.actionId}`);}
        versionIds.add(row.versionId);
        actionIds.add(row.actionId);
    }
    for (const activity of activities) {
        if (activity.sessionId !== sessionId) {throw new Error(`archive_bank_activity_session_mismatch:${sessionId}`);}
    }
    if (!rows.length) {
        if (activities.length || input.transactions.some((transaction) => transaction.sourceDomain === 'bank')) {
            throw new Error(`archive_bank_orphan_facts:${sessionId}`);
        }
        return;
    }
    rows.sort((left, right) => left.revision - right.revision);
    if (rows.some((row, index) => row.revision !== index + 1)) {
        throw new Error(`archive_bank_version_chain_invalid:${sessionId}`);
    }
    const currentRows = rows.filter((row) => row.currentMarker === TAVERN_BANK_CURRENT_MARKER);
    const current = rows.at(-1)!;
    if (currentRows.length !== 1 || currentRows[0].versionId !== current.versionId) {
        throw new Error(`archive_bank_current_marker_invalid:${sessionId}`);
    }
    const sessionTurn = Number(input.session.state?.turn);
    const currentSessionTurn = Number.isSafeInteger(sessionTurn) && sessionTurn >= 0 ? sessionTurn : 0;
    if (current.turn > currentSessionTurn) {
        throw new Error(`archive_bank_turn_ahead_of_session:${sessionId}`);
    }
    const historyViolation = findTavernBankHistoryInvariantViolation({ versions: rows, activities });
    if (historyViolation) {
        throw new Error(`archive_bank_${historyViolation.code.replaceAll('-', '_')}:${historyViolation.detail}`);
    }

    const opened = new Map<string, TavernBankOpenedFact>();
    let previousAnchor = -1;
    for (const row of rows) {
        if (row.anchorOrder < previousAnchor) {throw new Error(`archive_bank_anchor_regression:${row.actionId}`);}
        previousAnchor = row.anchorOrder;
        const action = row.action;
        let openedId = '';
        let openedFact: TavernBankOpenedFact | null = null;
        if (action.kind === 'deposit-open') {
            openedId = action.positionId;
            openedFact = { kind: 'deposit', amount: action.amount, anchorOrder: row.anchorOrder };
            if (!row.state.openDeposits.some((position) => position.id === openedId)) {
                throw new Error(`archive_bank_transition_invalid:${row.actionId}`);
            }
        } else if (action.kind === 'fund-open') {
            openedId = action.positionId;
            openedFact = { kind: 'fund', amount: action.amount, anchorOrder: row.anchorOrder };
            if (!row.state.openInvestments.some((position) => position.id === openedId)) {
                throw new Error(`archive_bank_transition_invalid:${row.actionId}`);
            }
        } else if (action.kind === 'dice-start') {
            openedId = action.gameId;
            openedFact = { kind: 'dice', amount: action.bet, anchorOrder: row.anchorOrder };
        } else if (action.kind === 'push-start') {
            openedId = action.gameId;
            openedFact = { kind: 'push', amount: TAVERN_BANK_PUSH_BET, anchorOrder: row.anchorOrder };
        } else if (action.kind === 'ladder-start') {
            openedId = action.gameId;
            openedFact = { kind: 'ladder', amount: action.bet, anchorOrder: row.anchorOrder };
        }
        if (openedFact) {
            if (opened.has(openedId)) {throw new Error(`archive_bank_source_id_duplicate:${openedId}`);}
            opened.set(openedId, openedFact);
            if (openedFact.kind === 'dice' || openedFact.kind === 'push' || openedFact.kind === 'ladder') {
                if (row.state.activeGame?.kind !== openedFact.kind || row.state.activeGame.game.id !== openedId) {
                    throw new Error(`archive_bank_transition_invalid:${row.actionId}`);
                }
            }
        }
        const referencedGameId = 'gameId' in action ? action.gameId : '';
        if (referencedGameId && !action.kind.endsWith('-start')) {
            const fact = opened.get(referencedGameId);
            const expectedKind = action.kind.startsWith('dice-') ? 'dice'
                : action.kind.startsWith('push-') ? 'push'
                    : action.kind.startsWith('ladder-') ? 'ladder' : '';
            if (!fact || fact.kind !== expectedKind) {throw new Error(`archive_bank_game_reference_invalid:${row.actionId}`);}
        }
        if (action.kind === 'deposit-withdraw-early' && opened.get(action.positionId)?.kind !== 'deposit') {
            throw new Error(`archive_bank_position_reference_invalid:${row.actionId}`);
        }
        for (const positionId of action.settledPositionIds) {
            const fact = opened.get(positionId);
            if (!fact || (fact.kind !== 'deposit' && fact.kind !== 'fund')) {
                throw new Error(`archive_bank_settlement_reference_invalid:${row.actionId}`);
            }
            const activity = activities.find((candidate) => candidate.sourceId === positionId);
            if (!activity || activity.anchorOrder !== row.anchorOrder) {
                throw new Error(`archive_bank_settlement_activity_invalid:${row.actionId}`);
            }
        }

    }

    const activitiesBySource = new Map(activities.map((activity) => [activity.sourceId, activity]));
    for (const activity of activities) {
        const fact = opened.get(activity.sourceId);
        if (!fact || fact.amount !== activity.amountIn || activity.anchorOrder < fact.anchorOrder) {
            throw new Error(`archive_bank_activity_source_invalid:${activity.sourceId}`);
        }
        if (activity.detail.kind !== fact.kind) {
            throw new Error(`archive_bank_activity_kind_invalid:${activity.sourceId}`);
        }
    }
    for (const row of rows) {
        if (row.action.kind !== 'deposit-withdraw-early') {continue;}
        const activity = activitiesBySource.get(row.action.positionId);
        if (!activity || activity.anchorOrder !== row.anchorOrder || activity.detail.kind !== 'deposit') {
            throw new Error(`archive_bank_withdraw_activity_invalid:${row.actionId}`);
        }
        const maturedInSameAction = row.action.settledPositionIds.includes(row.action.positionId);
        if (
            (maturedInSameAction && activity.detail.outcome !== 'matured')
            || (!maturedInSameAction && activity.detail.outcome !== 'withdrawn-early')
        ) {
            throw new Error(`archive_bank_withdraw_outcome_invalid:${row.actionId}`);
        }
    }

    const expectedTransactions = new Map<string, {
        sourceId: string;
        amount: number;
        kind: 'bank_deposit_lock' | 'bank_fund_lock' | 'bank_wager' | 'bank_settlement' | 'bank_payout';
        fromAccountId: string;
        toAccountId: string;
        anchorOrder: number;
    }>();
    for (const [sourceId, fact] of opened) {
        expectedTransactions.set(fact.kind === 'deposit' || fact.kind === 'fund'
            ? `bank:lock:${sourceId}`
            : `bank:wager:${sourceId}`, {
            sourceId,
            amount: fact.amount,
            kind: fact.kind === 'deposit' ? 'bank_deposit_lock'
                : fact.kind === 'fund' ? 'bank_fund_lock' : 'bank_wager',
            fromAccountId: TAVERN_PLAYER_ACCOUNT_ID,
            toAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
            anchorOrder: fact.anchorOrder,
        });
    }
    for (const activity of activities) {
        if (activity.payout <= 0) {continue;}
        const position = activity.detail.kind === 'deposit' || activity.detail.kind === 'fund';
        expectedTransactions.set(position ? `bank:settle:${activity.sourceId}` : `bank:payout:${activity.sourceId}`, {
            sourceId: activity.sourceId,
            amount: activity.payout,
            kind: position ? 'bank_settlement' : 'bank_payout',
            fromAccountId: TAVERN_SYSTEM_SINK_ACCOUNT_ID,
            toAccountId: TAVERN_PLAYER_ACCOUNT_ID,
            anchorOrder: activity.anchorOrder,
        });
    }
    const bankTransactions = input.transactions.filter((transaction) => transaction.sourceDomain === 'bank');
    if (bankTransactions.length !== expectedTransactions.size) {
        throw new Error(`archive_bank_ledger_count_invalid:${sessionId}`);
    }
    const transactionKeys = new Set<string>();
    for (const transaction of bankTransactions) {
        if (transactionKeys.has(transaction.idempotencyKey)) {
            throw new Error(`archive_bank_ledger_duplicate:${transaction.idempotencyKey}`);
        }
        transactionKeys.add(transaction.idempotencyKey);
        const expected = expectedTransactions.get(transaction.idempotencyKey);
        if (
            !expected
            || transaction.sourceId !== expected.sourceId
            || transaction.amount !== expected.amount
            || transaction.kind !== expected.kind
            || transaction.fromAccountId !== expected.fromAccountId
            || transaction.toAccountId !== expected.toAccountId
            || transaction.anchorOrder !== expected.anchorOrder
        ) {
            throw new Error(`archive_bank_ledger_invalid:${transaction.idempotencyKey}`);
        }
    }
}

async function assertCharacterArchiveStable(characterKey = ''): Promise<void> {
    const key = normalizeCharacterKey(characterKey);
    await db.transaction(
        'r',
        tavernSessionsTable,
        tavernManagerRunsTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernStatePatchesTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        tavernTaskBoardsTable,
        tavernTaskVersionsTable,
        tavernShopStateVersionsTable,
        tavernBankStateVersionsTable,
        tavernBankActivitiesTable,
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
        async () => {
            const sessions = await tavernSessionsTable.where('characterKey').equals(key).toArray();
            for (const session of sessions) {
                const [
                    runs,
                    memorySnapshots,
                    stateSnapshots,
                    statePatches,
                    accounts,
                    transactions,
                    board,
                    versions,
                    shopVersions,
                    bankVersions,
                    bankActivities,
                    petVersions,
                    petActivities,
                ] = await Promise.all([
                    tavernManagerRunsTable.where('sessionId').equals(session.id).toArray(),
                    tavernManagerMemorySnapshotsTable.where('sessionId').equals(session.id).toArray(),
                    tavernManagerStateSnapshotsTable.where('sessionId').equals(session.id).toArray(),
                    tavernStatePatchesTable.where('sessionId').equals(session.id).toArray(),
                    tavernEconomyAccountsTable.where('sessionId').equals(session.id).toArray(),
                    tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray(),
                    tavernTaskBoardsTable.get(session.id),
                    tavernTaskVersionsTable.where('sessionId').equals(session.id).toArray(),
                    tavernShopStateVersionsTable.where('sessionId').equals(session.id).toArray(),
                    tavernBankStateVersionsTable.where('sessionId').equals(session.id).toArray(),
                    tavernBankActivitiesTable.where('sessionId').equals(session.id).toArray(),
                    tavernPetStateVersionsTable.where('sessionId').equals(session.id).toArray(),
                    tavernPetActivitiesTable.where('sessionId').equals(session.id).toArray(),
                ]);
                assertTavernManagerSnapshotStable({ runs, memorySnapshots, stateSnapshots, statePatches }, 'manager_archive_unaccepted_writes');
                assertTaskEconomyArchiveStable({
                    session,
                    board: board || null,
                    versions,
                    accounts,
                    transactions,
                });
                assertShopArchiveStable({ session, versions: shopVersions, transactions });
                assertBankArchiveStable({
                    session,
                    versions: bankVersions,
                    activities: bankActivities,
                    transactions,
                });
                assertTavernPetHistoryInvariant({
                    sessionId: session.id,
                    versions: petVersions,
                    activities: petActivities,
                    economyTransactions: transactions,
                });
                assertEconomyArchiveLedgerStable({ session, accounts, transactions });
            }
        },
    );
}

export async function listTavernCharacterArchiveSessions(characterKey = ''): Promise<TavernSessionRecord[]> {
    const key = normalizeCharacterKey(characterKey);
    return (await tavernSessionsTable.where('characterKey').equals(key).toArray())
        .sort((left, right) => Number(right.updatedAt) - Number(left.updatedAt));
}

async function forEachCharacterArchiveSession(
    characterKey = '',
    sessionCount: number,
    callback: (session: TavernSessionRecord, sessionIndex: number, sessionCount: number) => Promise<void>,
): Promise<number> {
    const key = normalizeCharacterKey(characterKey);
    let offset = 0;
    let sessionIndex = 0;
    while (true) {
        const sessions = await (tavernSessionsTable as unknown as ArchiveRuntimeTable)
            .where('characterKey')
            .equals(key)
            .offset(offset)
            .limit(ARCHIVE_DB_BATCH_SIZE)
            .toArray() as TavernSessionRecord[];
        for (const session of sessions) {
            sessionIndex += 1;
            await callback(cloneSerializable(session), sessionIndex, sessionCount);
        }
        if (sessions.length < ARCHIVE_DB_BATCH_SIZE) {break;}
        offset += sessions.length;
    }
    return sessionCount;
}

export async function exportTavernCharacterArchive(input: {
    character: TavernCharacterArchiveCharacter;
    archiveId: string;
    writer: ArchiveWritable;
    onProgress?: (progress: {
        phase: 'scan' | 'export';
        table: TavernCharacterArchiveTable | '';
        sessionId: string;
        sessionIndex: number;
        sessionCount: number;
        counts: TavernCharacterArchiveCounts;
        rowCount: number;
    }) => void;
}): Promise<TavernCharacterArchiveExportSummary> {
    const characterKey = normalizeCharacterKey(input.character.characterKey);
    const counts = emptyCounts();
    const sessionCount = await tavernSessionsTable.where('characterKey').equals(characterKey).count();
    await assertCharacterArchiveStable(characterKey);
    let rowCount = 0;
    let rawBytes = 0;
    input.onProgress?.({
        phase: 'scan',
        table: '',
        sessionId: '',
        sessionIndex: 0,
        sessionCount,
        counts,
        rowCount,
    });

    await forEachCharacterArchiveSession(characterKey, sessionCount, async (listedSession, sessionIndex, totalSessions) => {
        const captured = await captureCharacterArchiveSession(listedSession.id);
        await input.writer.write({ table: 'sessions', record: captured.session });
        incrementArchiveCounts(counts, 'sessions');
        rowCount += 1;
        rawBytes += JSON.stringify({ table: 'sessions', record: captured.session }).length + 1;
        input.onProgress?.({
            phase: 'export',
            table: 'sessions',
            sessionId: captured.session.id,
            sessionIndex,
            sessionCount: totalSessions,
            counts,
            rowCount,
        });

        for (const archiveRecord of captured.records) {
            await input.writer.write(archiveRecord);
            incrementArchiveCounts(counts, archiveRecord.table);
            rowCount += 1;
            rawBytes += JSON.stringify(archiveRecord).length + 1;
            input.onProgress?.({
                phase: 'export',
                table: archiveRecord.table,
                sessionId: captured.session.id,
                sessionIndex,
                sessionCount: totalSessions,
                counts,
                rowCount,
            });
        }
    });

    return {
        archiveId: input.archiveId,
        character: {
            characterKey,
            name: String(input.character.name || ''),
            avatar: String(input.character.avatar || ''),
            nativeCharacterId: String(input.character.nativeCharacterId || ''),
        },
        counts,
        exportedAt: now(),
        rawBytes,
        rowCount,
    };
}

function validateManifestCounts(manifest: TavernCharacterArchiveManifest): TavernCharacterArchiveCounts {
    if (!manifest.counts || typeof manifest.counts !== 'object' || Array.isArray(manifest.counts)) {
        throw new Error('archive_manifest_counts_invalid');
    }
    const counts = emptyCounts();
    for (const field of ARCHIVE_COUNT_FIELDS) {
        const value = Number(manifest.counts[field]);
        if (!Number.isSafeInteger(value) || value < 0) {
            throw new Error(`archive_manifest_count_invalid:${field}`);
        }
        counts[field] = value;
    }
    return counts;
}

function validateRestoreManifest(manifest: TavernCharacterArchiveManifest, characterKey = ''): {
    expectedCounts: TavernCharacterArchiveCounts;
    expectedRowCount: number;
} {
    const key = normalizeCharacterKey(characterKey);
    if (!manifest || typeof manifest !== 'object') {throw new Error('archive_manifest_invalid');}
    if (manifest.complete !== true) {throw new Error('archive_manifest_incomplete');}
    if (manifest.version !== CURRENT_TAVERN_CHARACTER_ARCHIVE_VERSION) {
        throw new Error(`archive_version_unsupported:${String(manifest.version)}`);
    }
    if (String(manifest.character?.characterKey || '').trim() !== key) {
        throw new Error('archive_character_mismatch');
    }
    if (!Array.isArray(manifest.parts)) {
        throw new Error('archive_parts_missing');
    }
    const expectedCounts = validateManifestCounts(manifest);
    if (!manifest.parts.length && totalManifestCount({ ...manifest, counts: expectedCounts }) > 0) {
        throw new Error('archive_parts_missing');
    }
    let expectedRowCount = 0;
    const expectedIndexes = manifest.parts.map((part) => {
        if (!part || typeof part !== 'object') {throw new Error('archive_part_manifest_invalid');}
        const index = Number(part.index);
        const rowCount = Number(part.rowCount);
        const rawBytes = Number(part.rawBytes);
        const compressedBytes = Number(part.compressedBytes);
        if (!Number.isSafeInteger(index) || index <= 0) {throw new Error('archive_part_index_invalid');}
        if (!Number.isSafeInteger(rowCount) || rowCount <= 0) {throw new Error(`archive_part_row_count_invalid:${index}`);}
        if (!Number.isSafeInteger(rawBytes) || rawBytes <= 0) {throw new Error(`archive_part_raw_bytes_invalid:${index}`);}
        if (!Number.isSafeInteger(compressedBytes) || compressedBytes <= 0) {throw new Error(`archive_part_compressed_bytes_invalid:${index}`);}
        if (!String(part.filename || '').trim() || !String(part.sha256 || '').trim()) {
            throw new Error(`archive_part_identity_invalid:${index}`);
        }
        expectedRowCount += rowCount;
        if (!Number.isSafeInteger(expectedRowCount)) {throw new Error('archive_row_count_invalid');}
        return index;
    }).sort((left, right) => left - right);
    expectedIndexes.forEach((index, offset) => {
        if (index !== offset + 1) {
            throw new Error('archive_parts_incomplete');
        }
    });
    return { expectedCounts, expectedRowCount };
}

function assertArchiveCountsMatch(
    actual: TavernCharacterArchiveCounts,
    expected: TavernCharacterArchiveCounts,
): void {
    for (const field of ARCHIVE_COUNT_FIELDS) {
        if (actual[field] !== expected[field]) {
            throw new Error(`archive_count_mismatch:${field}:${actual[field]}:${expected[field]}`);
        }
    }
}

function buildTempCharacterKey(jobId = '', characterKey = ''): string {
    return `${RESTORE_TEMP_CHARACTER_PREFIX}:${jobId}:${characterKey}`;
}

function buildTempSessionId(jobId = '', oldSessionId = ''): string {
    return `restore-${jobId}-${String(oldSessionId || '').trim()}`;
}

function createRestoreIdMapper(jobId = '') {
    const sessionIds = new Map<string, string>();
    const runIds = new Map<string, string>();
    const patchIds = new Map<string, string>();
    const mapSessionId = (value = '') => {
        const id = String(value || '').trim();
        if (!id) {return id;}
        if (!sessionIds.has(id)) {
            sessionIds.set(id, buildTempSessionId(jobId, id));
        }
        return sessionIds.get(id) || id;
    };
    const mapManagerRunId = (value = '') => {
        const id = String(value || '').trim();
        if (!id) {return id;}
        if (!runIds.has(id)) {
            runIds.set(id, `restore-${jobId}-${id}`);
        }
        return runIds.get(id) || id;
    };
    const mapPatchId = (value = '') => {
        const id = String(value || '').trim();
        if (!id) {return id;}
        if (!patchIds.has(id)) {
            patchIds.set(id, `restore-${jobId}-${id}`);
        }
        return patchIds.get(id) || id;
    };
    return { mapSessionId, mapManagerRunId, mapPatchId, sessionIds };
}

function remapContextCharacterKey(value: unknown, characterKey = ''): unknown {
    if (!value || typeof value !== 'object') {return value;}
    const snapshot = cloneSerializable(value) as Record<string, unknown>;
    const character = snapshot.character && typeof snapshot.character === 'object'
        ? { ...snapshot.character as Record<string, unknown> }
        : {};
    character.characterKey = characterKey;
    snapshot.character = character;
    return snapshot;
}

function remapStateDocument<T extends TavernStructuredStateDocumentRecord | undefined>(
    document: T,
    mapSessionId: (value?: string) => string,
): T {
    if (!document) {return document;}
    return {
        ...document,
        sessionId: mapSessionId(document.sessionId),
    };
}

function remapArchiveRecord(
    input: TavernCharacterArchiveRecord,
    options: {
        characterKey: string;
        tempCharacterKey: string;
        mapSessionId: (value?: string) => string;
        mapManagerRunId: (value?: string) => string;
        mapPatchId: (value?: string) => string;
    },
): TavernCharacterArchiveRecord {
    if (!input || typeof input !== 'object' || !ARCHIVE_TABLE_NAMES.has(String(input.table || ''))) {
        throw new Error(`archive_table_unsupported:${String(input?.table || '')}`);
    }
    if (!input.record || typeof input.record !== 'object' || Array.isArray(input.record)) {
        throw new Error(`archive_record_invalid:${input.table}`);
    }
    const record = cloneSerializable(input.record) as unknown as Record<string, unknown>;
    const table = input.table;
    if (table === 'sessions') {
        const sessionId = options.mapSessionId(String(record.id || ''));
        if (!sessionId) {throw new Error('archive_session_id_invalid');}
        return {
            table,
            record: {
                ...record,
                id: sessionId,
                characterKey: options.tempCharacterKey,
                contextSnapshot: remapContextCharacterKey(record.contextSnapshot, options.characterKey),
            } as TavernCharacterArchiveRecordPayload['sessions'],
        };
    }
    const sessionId = options.mapSessionId(String(record.sessionId || ''));
    if (!sessionId) {throw new Error(`archive_record_session_missing:${table}`);}
    record.sessionId = sessionId;
    if ('managerRunId' in record && record.managerRunId) {
        record.managerRunId = options.mapManagerRunId(String(record.managerRunId || ''));
    }
    if (table === 'managerRuns') {
        if (!['accepted_turn', 'after_turn'].includes(String(record.trigger || ''))) {
            throw new Error('archive_maintenance_run_trigger_invalid');
        }
        record.id = options.mapManagerRunId(String(record.id || ''));
        if (record.recoverySourceRunId) {
            record.recoverySourceRunId = options.mapManagerRunId(String(record.recoverySourceRunId));
        }
        if (String(record.status || '') === 'running') {
            throw new Error('archive_manager_run_unaccepted');
        } else if (String(record.status || '') === 'queued') {
            record.leaseOwnerId = '';
            record.leaseExpiresAt = 0;
        }
    }
    if (table === 'managerCandidates') {
        record.id = options.mapManagerRunId(String(record.id || ''));
    }
    if (table === 'statePatches') {
        record.id = options.mapPatchId(String(record.id || ''));
    }
    if ((table === 'messages' || table === 'assistantChatMessages') && record.contextSnapshot) {
        record.contextSnapshot = remapContextCharacterKey(record.contextSnapshot, options.characterKey);
    }
    if (table === 'memorySnapshots') {
        const snapshot = record as unknown as TavernMemorySnapshotRecord;
        record.files = (snapshot.files || []).map((entry) => ({
            ...entry,
            file: entry.file ? { ...entry.file, sessionId: options.mapSessionId(entry.file.sessionId) } : entry.file,
        }));
    }
    if (table === 'managerMemorySnapshots') {
        const snapshot = record as unknown as TavernManagerMemorySnapshotRecord;
        if (snapshot.beforeFile) {
            record.beforeFile = {
                ...snapshot.beforeFile,
                sessionId: options.mapSessionId(snapshot.beforeFile.sessionId),
            };
        }
    }
    if (table === 'managerStateSnapshots') {
        const snapshot = record as unknown as TavernManagerStateSnapshotRecord;
        if (snapshot.beforeDocument) {
            record.beforeDocument = remapStateDocument(snapshot.beforeDocument, options.mapSessionId);
        }
    }
    if (table === 'statusSnapshots') {
        const snapshot = record as unknown as TavernStatusSnapshotRecord;
        if (snapshot.document) {
            record.document = remapStateDocument(snapshot.document, options.mapSessionId);
        }
    }
    if (table === 'communicationThreads') {
        const thread = record as unknown as TavernCommunicationThreadRecord;
        if (thread.replyRequest?.status === 'pending') {
            record.replyRequest = {
                ...thread.replyRequest,
                status: 'failed',
                error: TAVERN_COMMUNICATION_REPLY_INTERRUPTED_ERROR,
            };
        }
    }
    if (table === 'communicationSnapshots') {
        const snapshot = record as unknown as TavernCommunicationSnapshotRecord;
        record.contacts = (snapshot.contacts || []).map((contact) => ({
            ...contact,
            sessionId: options.mapSessionId(contact.sessionId),
        }));
        record.threads = (snapshot.threads || []).map((thread) => ({
            ...thread,
            sessionId: options.mapSessionId(thread.sessionId),
            ...(thread.replyRequest?.status === 'pending' ? {
                replyRequest: {
                    ...thread.replyRequest,
                    status: 'failed' as const,
                    error: TAVERN_COMMUNICATION_REPLY_INTERRUPTED_ERROR,
                },
            } : {}),
        }));
        record.messages = (snapshot.messages || []).map((message) => ({
            ...message,
            sessionId: options.mapSessionId(message.sessionId),
        }));
    }
    return { table, record } as unknown as TavernCharacterArchiveRecord;
}

/** Domain restore ingress: remap, strict canonical parse, then write exactly that record. */
function canonicalizeArchiveRecordForRestore(record: TavernCharacterArchiveRecord): TavernCharacterArchiveRecord {
    if (record.table === 'shopStateVersions') {
        try {
            return {
                ...record,
                record: parseCanonicalTavernShopStateVersionRecord(record.record),
            } as TavernCharacterArchiveRecord;
        } catch (error) {
            const detail = error instanceof Error ? error.message : String(error || 'invalid');
            throw new Error(`archive_shop_noncanonical:${detail}`);
        }
    }
    if (record.table === 'bankStateVersions') {
        try {
            return {
                ...record,
                record: parseCanonicalTavernBankStateVersionRecord(record.record),
            } as TavernCharacterArchiveRecord;
        } catch (error) {
            const detail = error instanceof Error ? error.message : String(error || 'invalid');
            throw new Error(`archive_bank_version_noncanonical:${detail}`);
        }
    }
    if (record.table === 'bankActivities') {
        try {
            return {
                ...record,
                record: parseCanonicalTavernBankActivityRecord(record.record),
            } as TavernCharacterArchiveRecord;
        } catch (error) {
            const detail = error instanceof Error ? error.message : String(error || 'invalid');
            throw new Error(`archive_bank_activity_noncanonical:${detail}`);
        }
    }
    if (record.table === 'petStateVersions') {
        try {
            return {
                ...record,
                record: parseCanonicalTavernPetStateVersionRecord(record.record),
            } as TavernCharacterArchiveRecord;
        } catch (error) {
            const detail = error instanceof Error ? error.message : String(error || 'invalid');
            throw new Error(`archive_pet_version_noncanonical:${detail}`);
        }
    }
    if (record.table === 'petActivities') {
        try {
            return {
                ...record,
                record: parseCanonicalTavernPetActivityRecord(record.record),
            } as TavernCharacterArchiveRecord;
        } catch (error) {
            const detail = error instanceof Error ? error.message : String(error || 'invalid');
            throw new Error(`archive_pet_activity_noncanonical:${detail}`);
        }
    }
    return record;
}

async function deleteTableRecordsBySessionId(table: ArchiveRuntimeTable, sessionId = ''): Promise<number> {
    let deletedCount = 0;
    while (true) {
        const keys = await table
            .where('sessionId')
            .equals(sessionId)
            .limit(ARCHIVE_DB_BATCH_SIZE)
            .primaryKeys();
        if (!keys.length) {break;}
        await table.bulkDelete(keys);
        deletedCount += keys.length;
    }
    return deletedCount;
}

async function deleteArchiveForSessionId(sessionId = ''): Promise<void> {
    const id = String(sessionId || '').trim();
    if (!id) {return;}
    for (const table of TAVERN_CHARACTER_ARCHIVE_TABLES) {
        if (table !== 'sessions') {
            await deleteTableRecordsBySessionId(archiveTables[table].table, id);
        }
    }
    await deleteTableRecordsBySessionId(tavernAssistantChatMessageSummariesTable as unknown as ArchiveRuntimeTable, id);
    await tavernSessionsTable.delete(id);
}

async function deleteArchiveForCharacterKey(characterKey = ''): Promise<number> {
    const key = normalizeCharacterKey(characterKey);
    let deletedCount = 0;
    while (true) {
        const sessionIds = await (tavernSessionsTable as unknown as ArchiveRuntimeTable)
            .where('characterKey')
            .equals(key)
            .limit(ARCHIVE_DB_BATCH_SIZE)
            .primaryKeys();
        if (!sessionIds.length) {break;}
        for (const sessionId of sessionIds) {
            await deleteArchiveForSessionId(String(sessionId || ''));
            deletedCount += 1;
        }
    }
    return deletedCount;
}

async function cleanupTempRestoreArchive(
    tempCharacterKey = '',
    mappedSessionIds: Iterable<string> = [],
): Promise<void> {
    await deleteArchiveForCharacterKey(tempCharacterKey);
    for (const sessionId of new Set(Array.from(mappedSessionIds, (value) => String(value || '').trim()).filter(Boolean))) {
        await deleteArchiveForSessionId(sessionId);
    }
}

async function writeArchiveRecordBatch(batch: TavernCharacterArchiveRecord[]): Promise<void> {
    if (!batch.length) {return;}
    await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernMessagesTable,
        tavernAssistantChatMessagesTable,
        tavernAssistantChatMessageSummariesTable,
        tavernManagerRunsTable,
        tavernManagerCandidatesTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernMemoryIndexesTable,
        tavernStateDocumentsTable,
        tavernStatePatchesTable,
        tavernStatusSnapshotsTable,
        tavernCommunicationContactsTable,
        tavernCommunicationThreadsTable,
        tavernCommunicationMessagesTable,
        tavernCommunicationSnapshotsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        tavernTaskBoardsTable,
        tavernTaskVersionsTable,
        tavernShopStateVersionsTable,
        tavernBankStateVersionsTable,
        tavernBankActivitiesTable,
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
        async () => {
            for (const table of TAVERN_CHARACTER_ARCHIVE_TABLES) {
                const rows = batch.filter((record) => record.table === table).map((record) => record.record);
                if (rows.length) {
                    await archiveTables[table].table.bulkAdd(rows);
                }
            }
            const assistantMessages = batch
                .filter((record): record is Extract<TavernCharacterArchiveRecord, { table: 'assistantChatMessages' }> => record.table === 'assistantChatMessages')
                .map((record) => record.record);
            if (assistantMessages.length) {
                await tavernAssistantChatMessageSummariesTable.bulkPut(assistantMessages.map(buildTavernAssistantChatMessageSummary));
            }
        },
    );
}

async function promoteTempArchiveToCharacter(tempCharacterKey = '', characterKey = '', expectedSessionCount = 0): Promise<string> {
    let selectedSessionId = '';
    let selectedSessionUpdatedAt = Number.NEGATIVE_INFINITY;
    await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernMessagesTable,
        tavernAssistantChatMessagesTable,
        tavernAssistantChatMessageSummariesTable,
        tavernManagerRunsTable,
        tavernManagerCandidatesTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernMemoryIndexesTable,
        tavernStateDocumentsTable,
        tavernStatePatchesTable,
        tavernStatusSnapshotsTable,
        tavernCommunicationContactsTable,
        tavernCommunicationThreadsTable,
        tavernCommunicationMessagesTable,
        tavernCommunicationSnapshotsTable,
        tavernEconomyAccountsTable,
        tavernEconomyTransactionsTable,
        tavernTaskBoardsTable,
        tavernTaskVersionsTable,
        tavernShopStateVersionsTable,
        tavernBankStateVersionsTable,
        tavernBankActivitiesTable,
        tavernPetStateVersionsTable,
        tavernPetActivitiesTable,
        tavernMetaTable,
        async () => {
            const tempSessionCount = await tavernSessionsTable.where('characterKey').equals(tempCharacterKey).count();
            if (tempSessionCount !== expectedSessionCount) {
                throw new Error(`archive_restore_session_count_mismatch:${tempSessionCount}:${expectedSessionCount}`);
            }
            await deleteArchiveForCharacterKey(characterKey);
            while (true) {
                const tempSessions = await (tavernSessionsTable as unknown as ArchiveRuntimeTable)
                    .where('characterKey')
                    .equals(tempCharacterKey)
                    .limit(ARCHIVE_DB_BATCH_SIZE)
                    .toArray() as TavernSessionRecord[];
                if (!tempSessions.length) {break;}
                for (const session of tempSessions) {
                    await tavernSessionsTable.update(session.id, { characterKey });
                    const updatedAt = Number(session.updatedAt) || 0;
                    if (!selectedSessionId || updatedAt > selectedSessionUpdatedAt) {
                        selectedSessionId = session.id;
                        selectedSessionUpdatedAt = updatedAt;
                    }
                }
            }
            await tavernMetaTable.put({ key: 'selectedSessionId', value: selectedSessionId, updatedAt: now() });
        },
    );
    return selectedSessionId;
}

export async function restoreTavernCharacterArchiveFromRecords(input: {
    manifest: TavernCharacterArchiveManifest;
    characterKey: string;
    recordBatches: AsyncIterable<TavernCharacterArchiveRecord[]>;
    jobId?: string;
    onProgress?: (progress: {
        phase: 'restore-temp' | 'promote';
        table: TavernCharacterArchiveTable | '';
        counts: TavernCharacterArchiveCounts;
        rowCount: number;
        selectedSessionId: string;
    }) => void;
}): Promise<TavernCharacterArchiveRestoreSummary> {
    const characterKey = normalizeCharacterKey(input.characterKey);
    const { expectedCounts, expectedRowCount } = validateRestoreManifest(input.manifest, characterKey);
    const jobId = String(input.jobId || '').trim() || createRestoreJobId();
    const tempCharacterKey = buildTempCharacterKey(jobId, characterKey);
    const mapper = createRestoreIdMapper(jobId);
    const counts = emptyCounts();
    let rowCount = 0;
    let pendingBatch: TavernCharacterArchiveRecord[] = [];
    let selectedSessionId = '';
    const stagedSessionIds = new Set<string>();

    const flush = async () => {
        if (!pendingBatch.length) {return;}
        await writeArchiveRecordBatch(pendingBatch);
        pendingBatch = [];
    };

    await cleanupTempRestoreArchive(tempCharacterKey);
    try {
        for await (const records of input.recordBatches) {
            for (const record of records) {
                const remapped = canonicalizeArchiveRecordForRestore(remapArchiveRecord(record, {
                    characterKey,
                    tempCharacterKey,
                    mapSessionId: mapper.mapSessionId,
                    mapManagerRunId: mapper.mapManagerRunId,
                    mapPatchId: mapper.mapPatchId,
                }));
                if (remapped.table === 'sessions') {
                    const sessionId = String(remapped.record.id || '').trim();
                    if (stagedSessionIds.has(sessionId)) {throw new Error(`archive_session_duplicate:${sessionId}`);}
                    stagedSessionIds.add(sessionId);
                }
                incrementArchiveCounts(counts, remapped.table);
                rowCount += 1;
                pendingBatch.push(remapped);
                input.onProgress?.({
                    phase: 'restore-temp',
                    table: remapped.table,
                    counts,
                    rowCount,
                    selectedSessionId: '',
                });
                if (pendingBatch.length >= RESTORE_BATCH_SIZE) {
                    await flush();
                }
            }
        }
        await flush();
        await rebuildTavernTranscriptLineCounts(stagedSessionIds);

        if (rowCount !== expectedRowCount) {
            throw new Error(`archive_row_count_mismatch:${rowCount}:${expectedRowCount}`);
        }
        assertArchiveCountsMatch(counts, expectedCounts);
        if (stagedSessionIds.size !== expectedCounts.sessions) {
            throw new Error(`archive_session_count_mismatch:${stagedSessionIds.size}:${expectedCounts.sessions}`);
        }
        for (const sessionId of mapper.sessionIds.values()) {
            if (!stagedSessionIds.has(sessionId)) {
                throw new Error(`archive_session_reference_missing:${sessionId}`);
            }
        }

        await assertCharacterArchiveStable(tempCharacterKey);

        selectedSessionId = await promoteTempArchiveToCharacter(tempCharacterKey, characterKey, expectedCounts.sessions);
        input.onProgress?.({
            phase: 'promote',
            table: '',
            counts,
            rowCount,
            selectedSessionId,
        });
    } catch (error) {
        await cleanupTempRestoreArchive(tempCharacterKey, mapper.sessionIds.values()).catch((_error: unknown): void => undefined);
        throw error;
    }

    return {
        counts,
        restoredSessionIds: Array.from(mapper.sessionIds.values()),
        selectedSessionId,
        rowCount,
    };
}

export async function deleteCurrentTavernCharacterArchive(characterKey = ''): Promise<number> {
    return await deleteArchiveForCharacterKey(characterKey);
}
