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
    TAVERN_PLAYER_ACCOUNT_ID,
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
}

function totalManifestCount(manifest: TavernCharacterArchiveManifest): number {
    const counts = manifest.counts || createEmptyTavernCharacterArchiveCounts();
    return (Number(counts.sessions) || 0)
        + (Number(counts.messages) || 0)
        + (Number(counts.memoryFiles) || 0)
        + (Number(counts.stateDocuments) || 0)
        + (Number(counts.communications) || 0)
        + (Number(counts.economy) || 0)
        + (Number(counts.tasks) || 0);
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
        async () => {
            const sessions = await tavernSessionsTable.where('characterKey').equals(key).toArray();
            for (const session of sessions) {
                const [runs, memorySnapshots, stateSnapshots, statePatches, accounts, transactions, board, versions] = await Promise.all([
                    tavernManagerRunsTable.where('sessionId').equals(session.id).toArray(),
                    tavernManagerMemorySnapshotsTable.where('sessionId').equals(session.id).toArray(),
                    tavernManagerStateSnapshotsTable.where('sessionId').equals(session.id).toArray(),
                    tavernStatePatchesTable.where('sessionId').equals(session.id).toArray(),
                    tavernEconomyAccountsTable.where('sessionId').equals(session.id).toArray(),
                    tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray(),
                    tavernTaskBoardsTable.get(session.id),
                    tavernTaskVersionsTable.where('sessionId').equals(session.id).toArray(),
                ]);
                assertTavernManagerSnapshotStable({ runs, memorySnapshots, stateSnapshots, statePatches }, 'manager_archive_unaccepted_writes');
                assertTaskEconomyArchiveStable({
                    session,
                    board: board || null,
                    versions,
                    accounts,
                    transactions,
                });
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
                const remapped = remapArchiveRecord(record, {
                    characterKey,
                    tempCharacterKey,
                    mapSessionId: mapper.mapSessionId,
                    mapManagerRunId: mapper.mapManagerRunId,
                    mapPatchId: mapper.mapPatchId,
                });
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
