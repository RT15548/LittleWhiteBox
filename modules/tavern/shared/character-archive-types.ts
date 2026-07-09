import type {
    TavernManagerMemorySnapshotRecord,
    TavernManagerMessageRecord,
    TavernManagerRunRecord,
    TavernManagerStateSnapshotRecord,
    TavernManagerTaskSnapshotRecord,
    TavernMemoryFileRecord,
    TavernMemoryIndexRecord,
    TavernMemorySnapshotRecord,
    TavernMessageRecord,
    TavernSessionRecord,
    TavernStatusSnapshotRecord,
    TavernStructuredStateDocumentRecord,
    TavernStructuredStatePatchRecord,
    TavernTaskFingerprintStateRecord,
    TavernTaskRecord,
    TavernTaskSnapshotRecord,
} from './session-db';

export type TavernCharacterArchiveMode = 'backup' | 'restore' | '';

export type TavernCharacterArchivePhase =
    | 'scan'
    | 'export'
    | 'upload'
    | 'manifest'
    | 'download-manifest'
    | 'download'
    | 'verify'
    | 'restore-temp'
    | 'promote'
    | 'refresh'
    | 'complete'
    | 'error'
    | '';

export interface TavernCharacterArchiveCharacter {
    characterKey: string;
    name: string;
    avatar?: string;
    nativeCharacterId?: string;
}

export interface TavernCharacterArchiveCounts {
    sessions: number;
    messages: number;
    memoryFiles: number;
    stateDocuments: number;
    tasks: number;
}

export interface TavernCharacterArchivePartManifest {
    index: number;
    filename: string;
    rowCount: number;
    rawBytes: number;
    compressedBytes: number;
    sha256: string;
}

export interface TavernCharacterArchiveManifest {
    version: 1;
    archiveId: string;
    complete: true;
    exportedAt: number;
    character: TavernCharacterArchiveCharacter;
    counts: TavernCharacterArchiveCounts;
    parts: TavernCharacterArchivePartManifest[];
}

export interface TavernCharacterArchiveProgress {
    busy: boolean;
    mode: TavernCharacterArchiveMode;
    phase: string;
    percent: number;
    partIndex: number;
    partCount: number;
    loadedBytes: number;
    totalBytes: number;
    message: string;
    error: string;
    result?: {
        counts: TavernCharacterArchiveCounts;
        exportedAt: number;
        size: number;
    };
}

export const TAVERN_CHARACTER_ARCHIVE_TABLES = [
    'sessions',
    'messages',
    'managerMessages',
    'managerRuns',
    'memoryFiles',
    'memorySnapshots',
    'memoryIndexes',
    'managerMemorySnapshots',
    'stateDocuments',
    'statePatches',
    'statusSnapshots',
    'managerStateSnapshots',
    'tasks',
    'taskSnapshots',
    'managerTaskSnapshots',
    'taskFingerprintStates',
] as const;

export type TavernCharacterArchiveTable = typeof TAVERN_CHARACTER_ARCHIVE_TABLES[number];

export type TavernCharacterArchiveRecordPayload = {
    sessions: TavernSessionRecord;
    messages: TavernMessageRecord;
    managerMessages: TavernManagerMessageRecord;
    managerRuns: TavernManagerRunRecord;
    memoryFiles: TavernMemoryFileRecord;
    memorySnapshots: TavernMemorySnapshotRecord;
    memoryIndexes: TavernMemoryIndexRecord;
    managerMemorySnapshots: TavernManagerMemorySnapshotRecord;
    stateDocuments: TavernStructuredStateDocumentRecord;
    statePatches: TavernStructuredStatePatchRecord;
    statusSnapshots: TavernStatusSnapshotRecord;
    managerStateSnapshots: TavernManagerStateSnapshotRecord;
    tasks: TavernTaskRecord;
    taskSnapshots: TavernTaskSnapshotRecord;
    managerTaskSnapshots: TavernManagerTaskSnapshotRecord;
    taskFingerprintStates: TavernTaskFingerprintStateRecord;
};

export type TavernCharacterArchiveRecord<TTable extends TavernCharacterArchiveTable = TavernCharacterArchiveTable> = {
    [Table in TTable]: {
        table: Table;
        record: TavernCharacterArchiveRecordPayload[Table];
    }
}[TTable];

export interface TavernCharacterArchiveExportSummary {
    archiveId: string;
    character: TavernCharacterArchiveCharacter;
    counts: TavernCharacterArchiveCounts;
    exportedAt: number;
    rawBytes: number;
    rowCount: number;
}

export interface TavernCharacterArchiveRestoreSummary {
    counts: TavernCharacterArchiveCounts;
    restoredSessionIds: string[];
    selectedSessionId: string;
    rowCount: number;
}

export function createEmptyTavernCharacterArchiveCounts(): TavernCharacterArchiveCounts {
    return {
        sessions: 0,
        messages: 0,
        memoryFiles: 0,
        stateDocuments: 0,
        tasks: 0,
    };
}
