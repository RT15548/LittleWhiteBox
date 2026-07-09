import db, {
    tavernManagerMemorySnapshotsTable,
    tavernManagerMessagesTable,
    tavernManagerRunsTable,
    tavernManagerStateSnapshotsTable,
    tavernManagerTaskSnapshotsTable,
    tavernMemoryFilesTable,
    tavernMemoryIndexesTable,
    tavernMemorySnapshotsTable,
    tavernMessagesTable,
    tavernMetaTable,
    tavernSessionsTable,
    tavernStateDocumentsTable,
    tavernStatePatchesTable,
    tavernStatusSnapshotsTable,
    tavernTaskFingerprintStatesTable,
    tavernTasksTable,
    tavernTaskSnapshotsTable,
    type TavernManagerMemorySnapshotRecord,
    type TavernManagerStateSnapshotRecord,
    type TavernManagerTaskSnapshotRecord,
    type TavernMemorySnapshotRecord,
    type TavernSessionRecord,
    type TavernStatusSnapshotRecord,
    type TavernStructuredStateDocumentRecord,
    type TavernTaskRecord,
    type TavernTaskSnapshotRecord,
} from './session-db';
import {
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

const RESTORE_TEMP_CHARACTER_PREFIX = '__lwb_restore__';
const RESTORE_BATCH_SIZE = 500;
const ARCHIVE_DB_BATCH_SIZE = 500;

type ArchiveWritable = {
    write(record: TavernCharacterArchiveRecord): Promise<void>;
};

interface ArchiveRuntimeTable {
    where(index: string): {
        equals(value: unknown): ArchiveRuntimeCollection;
    };
    bulkPut(records: unknown[]): Promise<unknown>;
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
    managerMessages: { table: tavernManagerMessagesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    managerRuns: { table: tavernManagerRunsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    memoryFiles: { table: tavernMemoryFilesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    memorySnapshots: { table: tavernMemorySnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    memoryIndexes: { table: tavernMemoryIndexesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    managerMemorySnapshots: { table: tavernManagerMemorySnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    stateDocuments: { table: tavernStateDocumentsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    statePatches: { table: tavernStatePatchesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    statusSnapshots: { table: tavernStatusSnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    managerStateSnapshots: { table: tavernManagerStateSnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    tasks: { table: tavernTasksTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    taskSnapshots: { table: tavernTaskSnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    managerTaskSnapshots: { table: tavernManagerTaskSnapshotsTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
    taskFingerprintStates: { table: tavernTaskFingerprintStatesTable as unknown as ArchiveRuntimeTable, sessionIndex: 'sessionId' },
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
    if (table === 'tasks') {counts.tasks += 1;}
}

function totalManifestCount(manifest: TavernCharacterArchiveManifest): number {
    const counts = manifest.counts || createEmptyTavernCharacterArchiveCounts();
    return (Number(counts.sessions) || 0)
        + (Number(counts.messages) || 0)
        + (Number(counts.memoryFiles) || 0)
        + (Number(counts.stateDocuments) || 0)
        + (Number(counts.tasks) || 0);
}

async function forEachTableSessionRecord<TTable extends TavernCharacterArchiveTable>(
    table: TTable,
    sessionId: string,
    callback: (record: TavernCharacterArchiveRecord<TTable>) => Promise<void>,
): Promise<void> {
    const tableInfo = archiveTables[table];
    let offset = 0;
    while (true) {
        const records = await tableInfo.table
            .where(tableInfo.sessionIndex)
            .equals(sessionId)
            .offset(offset)
            .limit(ARCHIVE_DB_BATCH_SIZE)
            .toArray();
        for (const record of records) {
            const archiveRecord = {
                table,
                record: cloneSerializable(record) as TavernCharacterArchiveRecordPayload[TTable],
            } as TavernCharacterArchiveRecord<TTable>;
            await callback(archiveRecord);
        }
        if (records.length < ARCHIVE_DB_BATCH_SIZE) {break;}
        offset += records.length;
    }
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

    await forEachCharacterArchiveSession(characterKey, sessionCount, async (session, sessionIndex, totalSessions) => {
        await input.writer.write({ table: 'sessions', record: session });
        incrementArchiveCounts(counts, 'sessions');
        rowCount += 1;
        rawBytes += JSON.stringify({ table: 'sessions', record: session }).length + 1;
        input.onProgress?.({
            phase: 'export',
            table: 'sessions',
            sessionId: session.id,
            sessionIndex,
            sessionCount: totalSessions,
            counts,
            rowCount,
        });

        const tables = TAVERN_CHARACTER_ARCHIVE_TABLES.filter((table) => table !== 'sessions');
        for (const table of tables) {
            await forEachTableSessionRecord(table, session.id, async (archiveRecord) => {
                await input.writer.write(archiveRecord);
                incrementArchiveCounts(counts, table);
                rowCount += 1;
                rawBytes += JSON.stringify(archiveRecord).length + 1;
                input.onProgress?.({
                    phase: 'export',
                    table,
                    sessionId: session.id,
                    sessionIndex,
                    sessionCount: totalSessions,
                    counts,
                    rowCount,
                });
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

function validateRestoreManifest(manifest: TavernCharacterArchiveManifest, characterKey = '') {
    const key = normalizeCharacterKey(characterKey);
    if (!manifest || typeof manifest !== 'object') {throw new Error('archive_manifest_invalid');}
    if (manifest.complete !== true) {throw new Error('archive_manifest_incomplete');}
    if (manifest.version !== 1) {throw new Error(`archive_version_unsupported:${String(manifest.version)}`);}
    if (String(manifest.character?.characterKey || '').trim() !== key) {
        throw new Error('archive_character_mismatch');
    }
    if (!Array.isArray(manifest.parts)) {
        throw new Error('archive_parts_missing');
    }
    if (!manifest.parts.length && totalManifestCount(manifest) > 0) {
        throw new Error('archive_parts_missing');
    }
    const expectedIndexes = manifest.parts.map((part) => Number(part.index)).sort((left, right) => left - right);
    expectedIndexes.forEach((index, offset) => {
        if (index !== offset + 1) {
            throw new Error('archive_parts_incomplete');
        }
    });
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

function remapTask(task: TavernTaskRecord, mapSessionId: (value?: string) => string, mapManagerRunId: (value?: string) => string): TavernTaskRecord {
    return {
        ...task,
        sessionId: mapSessionId(task.sessionId),
        sourceManagerRunId: task.sourceManagerRunId ? mapManagerRunId(task.sourceManagerRunId) : task.sourceManagerRunId,
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
    const record = cloneSerializable(input.record) as unknown as Record<string, unknown>;
    const table = input.table;
    if (table === 'sessions') {
        return {
            table,
            record: {
                ...record,
                id: options.mapSessionId(String(record.id || '')),
                characterKey: options.tempCharacterKey,
                contextSnapshot: remapContextCharacterKey(record.contextSnapshot, options.characterKey),
            } as TavernCharacterArchiveRecordPayload['sessions'],
        };
    }
    if ('sessionId' in record) {
        record.sessionId = options.mapSessionId(String(record.sessionId || ''));
    }
    if ('managerRunId' in record && record.managerRunId) {
        record.managerRunId = options.mapManagerRunId(String(record.managerRunId || ''));
    }
    if (table === 'managerRuns') {
        record.id = options.mapManagerRunId(String(record.id || ''));
    }
    if (table === 'statePatches') {
        record.id = options.mapPatchId(String(record.id || ''));
    }
    if (table === 'tasks' && record.sourceManagerRunId) {
        record.sourceManagerRunId = options.mapManagerRunId(String(record.sourceManagerRunId || ''));
    }
    if ((table === 'messages' || table === 'managerMessages') && record.contextSnapshot) {
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
    if (table === 'taskSnapshots') {
        const snapshot = record as unknown as TavernTaskSnapshotRecord;
        record.tasks = (snapshot.tasks || []).map((task) => remapTask(task, options.mapSessionId, options.mapManagerRunId));
    }
    if (table === 'managerTaskSnapshots') {
        const snapshot = record as unknown as TavernManagerTaskSnapshotRecord;
        record.beforeTasks = (snapshot.beforeTasks || []).map((task) => remapTask(task, options.mapSessionId, options.mapManagerRunId));
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

async function cleanupTempRestoreArchive(tempCharacterKey = ''): Promise<void> {
    await deleteArchiveForCharacterKey(tempCharacterKey);
}

async function writeArchiveRecordBatch(batch: TavernCharacterArchiveRecord[]): Promise<void> {
    if (!batch.length) {return;}
    await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernMessagesTable,
        tavernManagerMessagesTable,
        tavernManagerRunsTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernManagerTaskSnapshotsTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernMemoryIndexesTable,
        tavernStateDocumentsTable,
        tavernStatePatchesTable,
        tavernStatusSnapshotsTable,
        tavernTasksTable,
        tavernTaskSnapshotsTable,
        tavernTaskFingerprintStatesTable,
        async () => {
            for (const table of TAVERN_CHARACTER_ARCHIVE_TABLES) {
                const rows = batch.filter((record) => record.table === table).map((record) => record.record);
                if (rows.length) {
                    await archiveTables[table].table.bulkPut(rows);
                }
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
        tavernManagerMessagesTable,
        tavernManagerRunsTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernManagerTaskSnapshotsTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernMemoryIndexesTable,
        tavernStateDocumentsTable,
        tavernStatePatchesTable,
        tavernStatusSnapshotsTable,
        tavernTasksTable,
        tavernTaskSnapshotsTable,
        tavernTaskFingerprintStatesTable,
        tavernMetaTable,
        async () => {
            const tempSessionCount = await tavernSessionsTable.where('characterKey').equals(tempCharacterKey).count();
            if (!tempSessionCount && expectedSessionCount > 0) {throw new Error('archive_restore_no_sessions');}
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
    validateRestoreManifest(input.manifest, characterKey);
    const jobId = String(input.jobId || '').trim() || createRestoreJobId();
    const tempCharacterKey = buildTempCharacterKey(jobId, characterKey);
    const mapper = createRestoreIdMapper(jobId);
    const counts = emptyCounts();
    let rowCount = 0;
    let pendingBatch: TavernCharacterArchiveRecord[] = [];
    let selectedSessionId = '';

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

        selectedSessionId = await promoteTempArchiveToCharacter(tempCharacterKey, characterKey, Number(input.manifest.counts?.sessions) || 0);
        input.onProgress?.({
            phase: 'promote',
            table: '',
            counts,
            rowCount,
            selectedSessionId,
        });
    } catch (error) {
        await cleanupTempRestoreArchive(tempCharacterKey).catch((_error: unknown): void => undefined);
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
