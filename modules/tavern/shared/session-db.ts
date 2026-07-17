import Dexie, { type DexieTable } from '../../../libs/dexie.mjs';
import type {
    XbTavernBuildSnapshot,
    XbTavernContext,
    XbTavernMessage,
    XbTavernNativeWorldInfoTimedEffect,
    XbTavernNativeWorldInfoTimedState,
    TavernChatPromptPresetBundle,
    XbTavernWorldEntryState,
} from './message-assembler';
import {
    createDefaultTavernAssistantPreset,
    DEFAULT_TAVERN_ASSISTANT_PRESET_ID,
    DEFAULT_TAVERN_ASSISTANT_PRESET_VERSION,
    normalizeTavernAssistantPreset,
    type TavernAssistantPreset,
} from './assistant-presets';
import {
    createFallbackTavernChatPromptPresetBundle,
    FALLBACK_TAVERN_CHAT_PRESET_ID,
    normalizeTavernChatPromptPresetBundle,
} from './chat-presets';
import {
    createSeedMapDocument,
    TAVERN_MAP_DOC_ID,
    TAVERN_MAP_DOC_TYPE,
} from './map-state-seed';
import {
    createSeedAtlasDocument,
    TAVERN_ATLAS_DOC_ID,
    TAVERN_ATLAS_DOC_TYPE,
} from './atlas-state-seed';
import {
    hasTavernSessionContractOverride,
    mergeTavernSessionContract,
    normalizeTavernSessionContract,
    type TavernSessionContract,
} from './session-contract';
import {
    normalizeTavernRuntimeEvents,
    type TavernRuntimeEvent,
} from './runtime-events';
import { assertTavernManagerSnapshotStable } from './manager-snapshot-integrity';

type TavernDexieUpgradeTable = {
    clear: () => Promise<unknown>;
    toArray: () => Promise<Record<string, unknown>[]>;
    bulkDelete: (keys: unknown[]) => Promise<unknown>;
    where: (index: string) => {
        anyOf: (values: unknown[]) => { delete: () => Promise<unknown> };
    };
    toCollection: () => {
        modify: (callback: (record: Record<string, unknown>) => void) => Promise<unknown>;
    };
};

type TavernDexieUpgradeTransaction = {
    table: (name: string) => TavernDexieUpgradeTable;
};

type TavernDexieVersionWithUpgrade = {
    stores: (schema: Record<string, string | null>) => void;
    upgrade: (fn: (transaction: TavernDexieUpgradeTransaction) => Promise<void>) => void;
};

export interface TavernSessionRecord {
    id: string;
    title: string;
    characterKey?: string;
    characterName?: string;
    createdAt: number;
    updatedAt: number;
    contextSnapshot?: XbTavernContext;
    buildSnapshot?: XbTavernBuildSnapshot;
    chatPresetId?: string;
    chatPresetName?: string;
    presetId?: string;
    presetName?: string;
    summary?: string;
    state?: TavernSessionState;
}

export interface TavernSessionState {
    turn?: number;
    contextWindowStartOrder?: number;
    activeMapDocId?: string;
    contract?: TavernSessionContract;
    worldEntryStates?: Record<string, XbTavernWorldEntryState>;
    nativeWorldInfoTimedState?: XbTavernNativeWorldInfoTimedState;
    lastBuildSnapshot?: XbTavernBuildSnapshot;
    lastRequestSnapshot?: unknown;
    lastProvider?: string;
    lastModel?: string;
    [key: string]: unknown;
}

export type TavernManagerRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'superseded' | 'rolled_back';

export interface TavernMessageRecord {
    sessionId: string;
    order: number;
    role: string;
    content: string;
    name?: string;
    error?: boolean;
    createdAt: number;
    provider?: string;
    model?: string;
    finishReason?: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    providerPayload?: unknown;
    contextSnapshot?: XbTavernContext;
    buildSnapshot?: XbTavernBuildSnapshot;
    chatPresetId?: string;
    chatPresetName?: string;
    presetId?: string;
    presetName?: string;
    requestSnapshot?: unknown;
    runtimeEvents?: TavernRuntimeEvent[];
    timelineRevision?: number;
}

export type TavernCommunicationContactSource = 'character' | 'memory' | 'manual';
export type TavernCommunicationMessageRole = 'user' | 'contact';
export type TavernCommunicationMessageStatus = 'sent';
export type TavernCommunicationReplyRequestStatus = 'pending' | 'failed';
export type TavernCommunicationMessagePayload =
    | { type: 'text'; text: string }
    | { type: 'voice'; transcript: string; emotion?: string }
    | { type: 'image'; description: string; generationPrompt?: string; assetRef?: string };

export const TAVERN_COMMUNICATION_REPLY_INTERRUPTED_ERROR = '回复请求已中断，请重试。';
export const TAVERN_COMMUNICATION_REPLY_LEASE_MS = 90_000;

export interface TavernCommunicationReplyRequestRecord {
    id: string;
    userSequence: number;
    anchorOrder: number;
    status: TavernCommunicationReplyRequestStatus;
    error?: string;
    createdAt: number;
    updatedAt: number;
    leaseExpiresAt: number;
}

export interface TavernCommunicationContactRecord {
    sessionId: string;
    id: string;
    name: string;
    avatar?: string;
    memoryPath?: string;
    source: TavernCommunicationContactSource;
    createdAt: number;
    updatedAt: number;
}

export interface TavernCommunicationThreadRecord {
    sessionId: string;
    id: string;
    contactId: string;
    summary?: string;
    summarizedThroughSequence?: number;
    unreadCount: number;
    lastResult?: 'reply' | 'silent' | 'unavailable';
    replyRequest?: TavernCommunicationReplyRequestRecord;
    createdAt: number;
    updatedAt: number;
}

export interface TavernCommunicationMessageRecord {
    sessionId: string;
    threadId: string;
    sequence: number;
    anchorOrder: number;
    role: TavernCommunicationMessageRole;
    payload: TavernCommunicationMessagePayload;
    status: TavernCommunicationMessageStatus;
    createdAt: number;
    updatedAt: number;
    provider?: string;
    model?: string;
}

export interface TavernCommunicationSnapshotRecord {
    sessionId: string;
    floor: number;
    contacts: TavernCommunicationContactRecord[];
    threads: TavernCommunicationThreadRecord[];
    messages: TavernCommunicationMessageRecord[];
    createdAt: number;
}

export interface TavernAssistantChatMessageRecord {
    sessionId: string;
    order: number;
    role: XbTavernMessage['role'];
    content: string;
    name?: string;
    error?: boolean;
    createdAt: number;
    updatedAt: number;
    provider?: string;
    model?: string;
    finishReason?: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    providerPayload?: unknown;
    toolCalls?: Array<{ id?: string; name?: string; arguments?: string }>;
    toolCallId?: string;
    toolName?: string;
    toolDisplay?: unknown;
}

export type TavernMaintenanceRunTrigger = 'accepted_turn' | 'after_turn';

export interface TavernManagerRunRecord {
    id: string;
    sessionId: string;
    turn: number;
    userOrder: number;
    assistantOrder: number;
    confirmedByUserOrder?: number;
    sourceUserCreatedAt?: number;
    sourceAssistantCreatedAt?: number;
    sourceUserRevision?: number;
    sourceAssistantRevision?: number;
    recoverySourceRunId?: string;
    trigger: TavernMaintenanceRunTrigger;
    status: TavernManagerRunStatus;
    provider?: string;
    model?: string;
    inputSummary?: string;
    outputText?: string;
    parsedAction?: string;
    toolTrace?: unknown;
    changedFiles?: string[];
    changedStates?: string[];
    changedTasks?: string[];
    leaseOwnerId?: string;
    leaseExpiresAt?: number;
    error?: string;
    createdAt: number;
    updatedAt: number;
}

export interface TavernManagerCandidateRecord {
    id: string;
    sessionId: string;
    turn: number;
    userOrder: number;
    assistantOrder: number;
    inputSummary?: string;
    createdAt: number;
    updatedAt: number;
}

export type TavernMemoryFileStatus = 'active' | 'stale';
export type TavernMemoryIndexStatus = 'ready' | 'stale' | 'failed';
export type TavernStructuredStateStatus = 'active' | 'stale';
export type TavernStructuredStateDocType = 'tavern.map' | 'tavern.atlas' | 'tavern.status';
export type TavernTaskStatus = 'active' | 'completed' | 'abandoned';

export interface TavernMemoryFileRecord {
    sessionId: string;
    path: string;
    content: string;
    status: TavernMemoryFileStatus;
    createdAt: number;
    updatedAt: number;
    source?: string;
    staleFromOrder?: number;
}

export interface TavernMemorySnapshotFileEntry {
    path: string;
    file: TavernMemoryFileRecord;
}

export interface TavernMemorySnapshotRecord {
    sessionId: string;
    floor: number;
    files: TavernMemorySnapshotFileEntry[];
    createdAt: number;
}

export interface TavernMemoryFileListEntry {
    path: string;
    status: TavernMemoryFileStatus;
    createdAt: number;
    updatedAt: number;
    source?: string;
    staleFromOrder?: number;
    contentLength: number;
    preview?: string;
}

export interface TavernMemoryIndexFileEntry extends TavernMemoryFileListEntry {
    title?: string;
    searchText?: string;
}

export type TavernManagerMemorySnapshotStatus = 'pending' | 'rolled_back' | 'conflict' | 'skipped';

export interface TavernManagerMemorySnapshotRecord {
    managerRunId: string;
    sessionId: string;
    path: string;
    beforeExists: boolean;
    beforeFile?: TavernMemoryFileRecord;
    beforeHash: string;
    afterHash?: string;
    rollbackStatus: TavernManagerMemorySnapshotStatus;
    error?: string;
    createdAt: number;
    updatedAt: number;
}

export interface TavernStructuredStateDocumentRecord {
    sessionId: string;
    docType: TavernStructuredStateDocType;
    docId: string;
    title: string;
    revision: number;
    data: unknown;
    digest: string;
    status: TavernStructuredStateStatus;
    source?: string;
    staleFromOrder?: number;
    createdAt: number;
    updatedAt: number;
}

export interface TavernStructuredStatePatchRecord {
    id: string;
    sessionId: string;
    docType: TavernStructuredStateDocType;
    docId: string;
    revision: number;
    status?: 'active' | 'rolled_back';
    managerRunId?: string;
    sourceUserOrder?: number;
    sourceAssistantOrder?: number;
    source?: string;
    summary?: string;
    ops?: unknown[];
    changedIds?: string[];
    removedElements?: unknown[];
    beforeData?: unknown;
    afterData?: unknown;
    createdAt: number;
    updatedAt: number;
}

export type TavernManagerStateSnapshotStatus = 'pending' | 'rolled_back' | 'conflict' | 'skipped';

export interface TavernManagerStateSnapshotRecord {
    managerRunId: string;
    sessionId: string;
    docType: TavernStructuredStateDocType;
    docId: string;
    beforeExists: boolean;
    beforeDocument?: TavernStructuredStateDocumentRecord;
    beforeHash: string;
    afterHash?: string;
    rollbackStatus: TavernManagerStateSnapshotStatus;
    error?: string;
    createdAt: number;
    updatedAt: number;
}

export interface TavernTaskRecord {
    id: string;
    sessionId: string;
    status: TavernTaskStatus;
    title: string;
    vision: string;
    doneWhen: string;
    hookForModel: string;
    fingerprint: string;
    createdOrder: number;
    updatedOrder: number;
    completedOrder?: number;
    abandonedOrder?: number;
    sourceManagerRunId?: string;
    createdAt: number;
    updatedAt: number;
}

export interface TavernTaskSnapshotRecord {
    sessionId: string;
    floor: number;
    tasks: TavernTaskRecord[];
    abandonedFingerprints: string[];
    createdAt: number;
}

export interface TavernStatusSnapshotRecord {
    sessionId: string;
    floor: number;
    document?: TavernStructuredStateDocumentRecord;
    digest: string;
    createdAt: number;
}

export type TavernManagerTaskSnapshotStatus = 'pending' | 'rolled_back' | 'conflict' | 'skipped';

export interface TavernManagerTaskSnapshotRecord {
    managerRunId: string;
    sessionId: string;
    beforeTasks: TavernTaskRecord[];
    beforeFingerprints: string[];
    beforeHash: string;
    afterHash?: string;
    rollbackStatus: TavernManagerTaskSnapshotStatus;
    error?: string;
    createdAt: number;
    updatedAt: number;
}

export interface TavernTaskFingerprintStateRecord {
    sessionId: string;
    abandonedFingerprints: string[];
    updatedAt: number;
}

export interface TavernMemoryIndexRecord {
    sessionId: string;
    kind: string;
    status: TavernMemoryIndexStatus;
    error?: string;
    sourceFingerprint?: string;
    derivedAt?: number;
    updatedAt: number;
    files?: TavernMemoryIndexFileEntry[];
}

export type TavernAppendMessageInput = XbTavernMessage & {
    error?: boolean;
    provider?: string;
    model?: string;
    finishReason?: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    providerPayload?: unknown;
    contextSnapshot?: XbTavernContext;
    buildSnapshot?: XbTavernBuildSnapshot;
    chatPresetId?: string;
    chatPresetName?: string;
    presetId?: string;
    presetName?: string;
    requestSnapshot?: unknown;
    runtimeEvents?: TavernRuntimeEvent[];
};

export type TavernAppendAssistantChatMessageInput = {
    role: XbTavernMessage['role'];
    content: string;
    name?: string;
    error?: boolean;
    provider?: string;
    model?: string;
    finishReason?: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    providerPayload?: unknown;
    toolCalls?: Array<{ id?: string; name?: string; arguments?: string }>;
    tool_calls?: Array<{
        id?: string;
        type?: string;
        function?: {
            name?: string;
            arguments?: string;
        };
    }>;
    toolCallId?: string;
    tool_call_id?: string;
    toolName?: string;
    toolDisplay?: unknown;
};

export interface TavernMetaRecord {
    key: string;
    value: unknown;
    updatedAt: number;
}

export interface TavernPresetRecord {
    id: string;
    name: string;
    description?: string;
    version?: string;
    sourcePresetId?: string;
    isBuiltIn?: boolean;
    createdAt: number;
    updatedAt: number;
    preset: TavernChatPromptPresetBundle;
}

export interface TavernAssistantPresetRecord {
    id: string;
    name: string;
    description?: string;
    version?: string;
    isBuiltIn?: boolean;
    createdAt: number;
    updatedAt: number;
    preset: TavernAssistantPreset;
}

class TavernDatabase extends Dexie {
    sessions!: DexieTable<TavernSessionRecord>;
    messages!: DexieTable<TavernMessageRecord>;
    assistantChatMessages!: DexieTable<TavernAssistantChatMessageRecord>;
    meta!: DexieTable<TavernMetaRecord>;
    presets!: DexieTable<TavernPresetRecord>;
    managerRuns!: DexieTable<TavernManagerRunRecord>;
    managerCandidates!: DexieTable<TavernManagerCandidateRecord>;
    memoryFiles!: DexieTable<TavernMemoryFileRecord>;
    memorySnapshots!: DexieTable<TavernMemorySnapshotRecord>;
    memoryIndexes!: DexieTable<TavernMemoryIndexRecord>;
    assistantPresets!: DexieTable<TavernAssistantPresetRecord>;
    managerMemorySnapshots!: DexieTable<TavernManagerMemorySnapshotRecord>;
    stateDocuments!: DexieTable<TavernStructuredStateDocumentRecord>;
    statePatches!: DexieTable<TavernStructuredStatePatchRecord>;
    managerStateSnapshots!: DexieTable<TavernManagerStateSnapshotRecord>;
    tasks!: DexieTable<TavernTaskRecord>;
    taskSnapshots!: DexieTable<TavernTaskSnapshotRecord>;
    statusSnapshots!: DexieTable<TavernStatusSnapshotRecord>;
    managerTaskSnapshots!: DexieTable<TavernManagerTaskSnapshotRecord>;
    taskFingerprintStates!: DexieTable<TavernTaskFingerprintStateRecord>;
    communicationContacts!: DexieTable<TavernCommunicationContactRecord>;
    communicationThreads!: DexieTable<TavernCommunicationThreadRecord>;
    communicationMessages!: DexieTable<TavernCommunicationMessageRecord>;
    communicationSnapshots!: DexieTable<TavernCommunicationSnapshotRecord>;

    constructor() {
        super('LittleWhiteBox_Tavern');
        this.version(1).stores({
            sessions: 'id, updatedAt, characterId, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            turnSummaries: 'id, sessionId, episodeId, turn, userOrder, assistantOrder, status, updatedAt',
            episodeSummaries: 'id, sessionId, status, updatedAt, startTurn, endTurn',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
        });
        this.version(2).stores({
            sessions: 'id, updatedAt, characterId, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            turnSummaries: 'id, sessionId, turn, userOrder, assistantOrder, status, updatedAt',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
        });
        this.version(3).stores({
            sessions: 'id, updatedAt, characterId, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
        });
        this.version(4).stores({
            sessions: 'id, updatedAt, characterId, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
        });
        this.version(5).stores({
            sessions: 'id, updatedAt, characterId, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: null,
            memorySnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
        });
        this.version(6).stores({
            sessions: 'id, updatedAt, characterId, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: null,
            memorySnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
            tasks: '[sessionId+id], sessionId, status, fingerprint, updatedOrder, updatedAt',
            taskSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            managerTaskSnapshots: 'managerRunId, sessionId, updatedAt',
            taskFingerprintStates: 'sessionId, updatedAt',
        });
        this.version(7).stores({
            sessions: 'id, updatedAt, characterId, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: null,
            memorySnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
            tasks: '[sessionId+id], sessionId, status, fingerprint, updatedOrder, updatedAt',
            taskSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            managerTaskSnapshots: 'managerRunId, sessionId, updatedAt',
            taskFingerprintStates: 'sessionId, updatedAt',
        });
        this.version(8).stores({
            sessions: 'id, updatedAt, characterKey, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: null,
            memorySnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
            tasks: '[sessionId+id], sessionId, status, fingerprint, updatedOrder, updatedAt',
            taskSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            managerTaskSnapshots: 'managerRunId, sessionId, updatedAt',
            taskFingerprintStates: 'sessionId, updatedAt',
        });
        this.version(9).stores({
            sessions: 'id, updatedAt, characterKey, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: null,
            memorySnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
            tasks: '[sessionId+id], sessionId, status, fingerprint, updatedOrder, updatedAt',
            taskSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            managerTaskSnapshots: 'managerRunId, sessionId, updatedAt',
            taskFingerprintStates: 'sessionId, updatedAt',
        });
        const version10 = this.version(10) as unknown as TavernDexieVersionWithUpgrade;
        version10.stores({
            sessions: 'id, updatedAt, characterKey, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: null,
            memorySnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
            tasks: '[sessionId+id], sessionId, status, fingerprint, updatedOrder, updatedAt',
            taskSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            managerTaskSnapshots: 'managerRunId, sessionId, updatedAt',
            taskFingerprintStates: 'sessionId, updatedAt',
        });
        version10.upgrade(async (transaction: TavernDexieUpgradeTransaction) => {
            await transaction.table('tasks').clear();
            await transaction.table('taskSnapshots').clear();
            await transaction.table('managerTaskSnapshots').clear();
            await transaction.table('taskFingerprintStates').clear();
        });
        this.version(11).stores({
            sessions: 'id, updatedAt, characterKey, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: null,
            memorySnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
            tasks: '[sessionId+id], sessionId, status, fingerprint, updatedOrder, updatedAt',
            taskSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            managerTaskSnapshots: 'managerRunId, sessionId, updatedAt',
            taskFingerprintStates: 'sessionId, updatedAt',
            communicationContacts: '[sessionId+id], sessionId, updatedAt',
            communicationThreads: '[sessionId+id], sessionId, contactId, updatedAt',
            communicationMessages: '[sessionId+threadId+sequence], sessionId, threadId, sequence, status, updatedAt',
            communicationSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
        });
        const version12 = this.version(12) as unknown as TavernDexieVersionWithUpgrade;
        version12.stores({
            sessions: 'id, updatedAt, characterKey, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: null,
            memorySnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
            tasks: '[sessionId+id], sessionId, status, fingerprint, updatedOrder, updatedAt',
            taskSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            managerTaskSnapshots: 'managerRunId, sessionId, updatedAt',
            taskFingerprintStates: 'sessionId, updatedAt',
            communicationContacts: '[sessionId+id], sessionId, updatedAt',
            communicationThreads: '[sessionId+id], sessionId, contactId, updatedAt',
            communicationMessages: '[sessionId+threadId+sequence], sessionId, threadId, sequence, status, updatedAt',
            communicationSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
        });
        version12.upgrade(async (transaction: TavernDexieUpgradeTransaction) => {
            await transaction.table('communicationContacts').clear();
            await transaction.table('communicationThreads').clear();
            await transaction.table('communicationMessages').clear();
            await transaction.table('communicationSnapshots').clear();
        });
        const version13 = this.version(13) as unknown as TavernDexieVersionWithUpgrade;
        version13.stores({
            sessions: 'id, updatedAt, characterKey, characterName',
            messages: '[sessionId+order], sessionId, order',
            managerMessages: null,
            assistantChatMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: null,
            memorySnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
            tasks: '[sessionId+id], sessionId, status, fingerprint, updatedOrder, updatedAt',
            taskSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            managerTaskSnapshots: 'managerRunId, sessionId, updatedAt',
            taskFingerprintStates: 'sessionId, updatedAt',
            communicationContacts: '[sessionId+id], sessionId, updatedAt',
            communicationThreads: '[sessionId+id], sessionId, contactId, updatedAt',
            communicationMessages: '[sessionId+threadId+sequence], sessionId, threadId, sequence, status, updatedAt',
            communicationSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
        });
        version13.upgrade(async (transaction: TavernDexieUpgradeTransaction) => {
            const managerRuns = await transaction.table('managerRuns').toArray() as unknown as TavernManagerRunRecord[];
            const legacyRunIds = managerRuns
                .filter((run) => !['accepted_turn', 'after_turn'].includes(String(run.trigger || '')))
                .map((run) => String(run.id || ''))
                .filter(Boolean);
            if (!legacyRunIds.length) {return;}

            await transaction.table('managerRuns').bulkDelete(legacyRunIds);
            await transaction.table('managerMemorySnapshots').where('managerRunId').anyOf(legacyRunIds).delete();
            await transaction.table('managerStateSnapshots').where('managerRunId').anyOf(legacyRunIds).delete();
            await transaction.table('managerTaskSnapshots').where('managerRunId').anyOf(legacyRunIds).delete();
            const legacyRunIdSet = new Set(legacyRunIds);
            await transaction.table('statePatches').toCollection().modify((patch) => {
                if (legacyRunIdSet.has(String(patch.managerRunId || ''))) {
                    patch.managerRunId = '';
                }
            });
            await transaction.table('tasks').toCollection().modify((task) => {
                if (legacyRunIdSet.has(String(task.sourceManagerRunId || ''))) {
                    task.sourceManagerRunId = '';
                }
            });
        });
        const version14 = this.version(14) as unknown as TavernDexieVersionWithUpgrade;
        version14.stores({
            sessions: 'id, updatedAt, characterKey, characterName',
            messages: '[sessionId+order], sessionId, order',
            assistantChatMessages: '[sessionId+order], sessionId, order',
            meta: 'key',
            presets: 'id, updatedAt, sourcePresetId',
            managerRuns: 'id, sessionId, status, turn, assistantOrder, updatedAt',
            managerCandidates: 'sessionId, assistantOrder, updatedAt',
            memoryFiles: '[sessionId+path], sessionId, path, status, updatedAt',
            memoryStateSnapshots: null,
            memorySnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            memoryIndexes: '[sessionId+kind], sessionId, kind, status, updatedAt',
            assistantPresets: 'id, updatedAt',
            managerMemorySnapshots: '[managerRunId+path], managerRunId, sessionId, path, updatedAt',
            stateDocuments: '[sessionId+docType+docId], sessionId, docType, docId, status, updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, updatedAt',
            managerStateSnapshots: '[managerRunId+docType+docId], managerRunId, sessionId, docType, docId, updatedAt',
            tasks: '[sessionId+id], sessionId, status, fingerprint, updatedOrder, updatedAt',
            taskSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            managerTaskSnapshots: 'managerRunId, sessionId, updatedAt',
            taskFingerprintStates: 'sessionId, updatedAt',
            communicationContacts: '[sessionId+id], sessionId, updatedAt',
            communicationThreads: '[sessionId+id], sessionId, contactId, updatedAt',
            communicationMessages: '[sessionId+threadId+sequence], sessionId, threadId, sequence, status, updatedAt',
            communicationSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
        });
        version14.upgrade(async (transaction: TavernDexieUpgradeTransaction) => {
            await transaction.table('managerRuns').clear();
            await transaction.table('managerMemorySnapshots').clear();
            await transaction.table('managerStateSnapshots').clear();
            await transaction.table('managerTaskSnapshots').clear();
            await transaction.table('statePatches').toCollection().modify((patch) => {
                patch.managerRunId = '';
            });
            await transaction.table('tasks').toCollection().modify((task) => {
                task.sourceManagerRunId = '';
            });
        });
    }
}

const db = new TavernDatabase();

export const tavernSessionsTable = db.sessions;
export const tavernMessagesTable = db.messages;
export const tavernAssistantChatMessagesTable = db.assistantChatMessages;
export const tavernMetaTable = db.meta;
export const tavernPresetsTable = db.presets;
export const tavernManagerRunsTable = db.managerRuns;
export const tavernManagerCandidatesTable = db.managerCandidates;
export const tavernMemoryFilesTable = db.memoryFiles;
export const tavernMemorySnapshotsTable = db.memorySnapshots;
export const tavernMemoryIndexesTable = db.memoryIndexes;
export const tavernAssistantPresetsTable = db.assistantPresets;
export const tavernManagerMemorySnapshotsTable = db.managerMemorySnapshots;
export const tavernStateDocumentsTable = db.stateDocuments;
export const tavernStatePatchesTable = db.statePatches;
export const tavernManagerStateSnapshotsTable = db.managerStateSnapshots;
export const tavernTasksTable = db.tasks;
export const tavernTaskSnapshotsTable = db.taskSnapshots;
export const tavernStatusSnapshotsTable = db.statusSnapshots;
export const tavernManagerTaskSnapshotsTable = db.managerTaskSnapshots;
export const tavernTaskFingerprintStatesTable = db.taskFingerprintStates;
export const tavernCommunicationContactsTable = db.communicationContacts;
export const tavernCommunicationThreadsTable = db.communicationThreads;
export const tavernCommunicationMessagesTable = db.communicationMessages;
export const tavernCommunicationSnapshotsTable = db.communicationSnapshots;

type DexieRangeCollection<T> = {
    reverse(): DexieRangeCollection<T>;
    filter(predicate: (value: T) => boolean): DexieRangeCollection<T>;
    offset(count: number): DexieRangeCollection<T>;
    limit(count: number): DexieRangeCollection<T>;
    first(): Promise<T | undefined>;
    count(): Promise<number>;
    toArray(): Promise<T[]>;
    primaryKeys(): Promise<unknown[]>;
};

type DexieRangeTable<T> = {
    where(index: string): {
        between(lower: unknown, upper: unknown, includeLower?: boolean, includeUpper?: boolean): DexieRangeCollection<T>;
    };
};

const DexieRangeKeys = Dexie as unknown as { minKey: unknown; maxKey: unknown };

function now(): number {
    return Date.now();
}

function createId(prefix = 'tavern-session'): string {
    return `${prefix}-${now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeTitle(value = '', fallback = '小白酒馆会话'): string {
    const normalized = String(value || '').trim();
    return normalized.slice(0, 120) || fallback;
}

function cleanSessionDisplayText(value = ''): string {
    const cleaned = String(value || '')
        .replace(/\s*[·-]\s*小白酒馆\s*$/g, '')
        .replace(/\s*[·-]\s*会话\s*$/g, '')
        .replace(/^小白酒馆会话$/g, '')
        .replace(/\s*·\s*第\s*\d+\s*轮\s*·\s*\d+\s*条可用消息\s*$/g, '')
        .trim();
    return /^(sillytavern\s+system|system)\b/i.test(cleaned) ? '' : cleaned;
}

function normalizeStructuredStateDocId(value: unknown = TAVERN_MAP_DOC_ID): string {
    const text = String(value || TAVERN_MAP_DOC_ID).trim() || TAVERN_MAP_DOC_ID;
    return /^[\w.-]{1,80}$/i.test(text) ? text : TAVERN_MAP_DOC_ID;
}

function cloneJson<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function cloneSerializable<T>(value: T, fallback: T): T {
    if (value === undefined) {return fallback;}
    try {
        return JSON.parse(JSON.stringify(value)) as T;
    } catch {
        return fallback;
    }
}

function cloneStableCommunicationThread(
    thread: TavernCommunicationThreadRecord,
    sessionId: string,
): TavernCommunicationThreadRecord {
    const cloned = cloneSerializable(thread, thread);
    return {
        ...cloned,
        sessionId,
        ...(cloned.replyRequest?.status === 'pending' ? {
            replyRequest: {
                ...cloned.replyRequest,
                status: 'failed' as const,
                error: TAVERN_COMMUNICATION_REPLY_INTERRUPTED_ERROR,
            },
        } : {}),
    };
}

function cloneStableCommunicationMessage(
    message: TavernCommunicationMessageRecord,
    sessionId: string,
): TavernCommunicationMessageRecord {
    return {
        ...cloneSerializable(message, message),
        sessionId,
    };
}

function normalizePresetName(value = '', fallback = '酒馆聊天预设'): string {
    const normalized = String(value || '').trim();
    return normalized.slice(0, 120) || fallback;
}

function normalizeTavernPresetSchema(preset: TavernChatPromptPresetBundle = {}): TavernChatPromptPresetBundle {
    return normalizeTavernChatPromptPresetBundle(preset);
}

function normalizeStringArray(value: unknown, limit = 12): string[] {
    const items = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
    return items
        .map((item) => String(item || '').trim())
        .filter(Boolean)
        .slice(0, limit);
}

function normalizeAssistantChatMessageRole(value: unknown): XbTavernMessage['role'] {
    const role = String(value || '').trim();
    return role === 'assistant' || role === 'tool' || role === 'system' ? role : 'user';
}

function normalizeAssistantChatToolCalls(input: TavernAppendAssistantChatMessageInput | Partial<TavernAssistantChatMessageRecord>): Array<{ id?: string; name?: string; arguments?: string }> | undefined {
    const direct = Array.isArray(input.toolCalls) ? input.toolCalls : [];
    const provider = 'tool_calls' in input && Array.isArray(input.tool_calls) ? input.tool_calls : [];
    const seen = new Set<string>();
    const normalized = [
        ...direct.map((toolCall) => ({
            id: String(toolCall?.id || ''),
            name: String(toolCall?.name || ''),
            arguments: String(toolCall?.arguments || '{}'),
        })),
        ...provider.map((toolCall) => ({
            id: String(toolCall?.id || ''),
            name: String(toolCall?.function?.name || ''),
            arguments: String(toolCall?.function?.arguments || '{}'),
        })),
    ].filter((toolCall) => {
        if (!toolCall.name) {return false;}
        const key = `${toolCall.id}\u0000${toolCall.name}\u0000${toolCall.arguments}`;
        if (seen.has(key)) {return false;}
        seen.add(key);
        return true;
    });
    return normalized.length ? normalized : undefined;
}

function normalizeMessageRuntimeEvents(value: unknown): TavernRuntimeEvent[] {
    return normalizeTavernRuntimeEvents(value);
}

function normalizeStoredTavernMessageRecord(record: TavernMessageRecord): TavernMessageRecord {
    return {
        ...record,
        runtimeEvents: normalizeMessageRuntimeEvents(record.runtimeEvents),
        timelineRevision: Math.max(1, Math.floor(Number(record.timelineRevision) || 1)),
    };
}

function normalizeManagerRunStatus(value: unknown): TavernManagerRunStatus {
    return ['queued', 'running', 'completed', 'failed', 'cancelled', 'superseded', 'rolled_back'].includes(String(value || ''))
        ? value as TavernManagerRunStatus
        : 'queued';
}

function normalizeWorldEntryStates(value: unknown): Record<string, XbTavernWorldEntryState> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {return {};}
    const states: Record<string, XbTavernWorldEntryState> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, state]) => {
        if (!key || !state || typeof state !== 'object' || Array.isArray(state)) {return;}
        const normalized: XbTavernWorldEntryState = {};
        const source = state as Record<string, unknown>;
        ['stickyUntilTurn', 'cooldownUntilTurn', 'delayUntilTurn'].forEach((field) => {
            const turn = Number(source[field]);
            if (Number.isFinite(turn)) {
                normalized[field as keyof XbTavernWorldEntryState] = turn;
            }
        });
        if (Object.keys(normalized).length) {
            states[key] = normalized;
        }
    });
    return states;
}

function normalizeNativeWorldInfoTimedEffect(value: unknown): XbTavernNativeWorldInfoTimedEffect | null {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {return null;}
    const source = value as Record<string, unknown>;
    const normalized: XbTavernNativeWorldInfoTimedEffect = {};
    const hash = Number(source.hash);
    const start = Number(source.start);
    const end = Number(source.end);
    if (Number.isFinite(hash)) {normalized.hash = hash;}
    if (Number.isFinite(start)) {normalized.start = start;}
    if (Number.isFinite(end)) {normalized.end = end;}
    if (source.protected === true) {normalized.protected = true;}
    return (normalized.hash !== undefined || normalized.start !== undefined || normalized.end !== undefined || normalized.protected)
        ? normalized
        : null;
}

function normalizeNativeWorldInfoTimedState(value: unknown): XbTavernNativeWorldInfoTimedState {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return { sticky: {}, cooldown: {} };
    }
    const source = value as Record<string, unknown>;
    const normalizeBucket = (bucket: unknown): Record<string, XbTavernNativeWorldInfoTimedEffect> => {
        if (!bucket || typeof bucket !== 'object' || Array.isArray(bucket)) {return {};}
        const result: Record<string, XbTavernNativeWorldInfoTimedEffect> = {};
        Object.entries(bucket as Record<string, unknown>).forEach(([key, item]) => {
            const normalized = normalizeNativeWorldInfoTimedEffect(item);
            if (key && normalized) {
                result[key] = normalized;
            }
        });
        return result;
    };
    return {
        sticky: normalizeBucket(source.sticky),
        cooldown: normalizeBucket(source.cooldown),
    };
}

export function normalizeTavernSessionState(value: unknown): TavernSessionState {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
    const activeMapDocId = normalizeStructuredStateDocId(source.activeMapDocId || TAVERN_MAP_DOC_ID);
    const state: TavernSessionState = {
        ...source,
        turn: Math.max(0, Number(source.turn) || 0),
        contextWindowStartOrder: Math.max(0, Math.floor(Number(source.contextWindowStartOrder) || 0)),
        activeMapDocId,
        contract: normalizeTavernSessionContract(source.contract),
        worldEntryStates: normalizeWorldEntryStates(source.worldEntryStates),
        nativeWorldInfoTimedState: normalizeNativeWorldInfoTimedState(source.nativeWorldInfoTimedState),
    };
    return state;
}

function hasOwnStateField(value: unknown, key: keyof TavernSessionState): boolean {
    return !!value && typeof value === 'object' && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, key);
}

export function mergeWorldEntryStates(
    existing: Record<string, XbTavernWorldEntryState> = {},
    updates: Record<string, XbTavernWorldEntryState> = {},
): Record<string, XbTavernWorldEntryState> {
    const merged: Record<string, XbTavernWorldEntryState> = cloneJson(existing || {});
    Object.entries(updates || {}).forEach(([key, update]) => {
        if (!key || !update || typeof update !== 'object') {return;}
        merged[key] = {
            ...(merged[key] || {}),
            ...update,
        };
    });
    return merged;
}

export async function createTavernSession(input: Partial<TavernSessionRecord> = {}): Promise<TavernSessionRecord> {
    const timestamp = now();
    const characterName = cleanSessionDisplayText(input.characterName || '');
    const title = cleanSessionDisplayText(input.title || '');
    const session: TavernSessionRecord = {
        id: String(input.id || createId()),
        title: normalizeTitle(title, characterName || '未选择角色'),
        characterKey: String(input.characterKey || ''),
        characterName,
        createdAt: Number(input.createdAt) || timestamp,
        updatedAt: timestamp,
        contextSnapshot: cloneSerializable(input.contextSnapshot, undefined),
        buildSnapshot: cloneSerializable(input.buildSnapshot, undefined),
        chatPresetId: String(input.chatPresetId || input.presetId || ''),
        chatPresetName: String(input.chatPresetName || input.presetName || ''),
        presetId: String(input.presetId || ''),
        presetName: String(input.presetName || ''),
        summary: String(input.summary || ''),
        state: cloneSerializable(normalizeTavernSessionState(input.state || {}), {}),
    };
    await db.transaction('rw', tavernSessionsTable, tavernMetaTable, tavernStateDocumentsTable, async () => {
        await tavernSessionsTable.put(session);
        await tavernMetaTable.put({ key: 'selectedSessionId', value: session.id, updatedAt: timestamp });
        await ensureSeedStructuredStateDocument(session.id, { touchSession: false });
    });
    return session;
}

export async function listTavernSessions(): Promise<TavernSessionRecord[]> {
    return tavernSessionsTable.orderBy('updatedAt').reverse().toArray();
}

export async function getSelectedTavernSessionId(): Promise<string> {
    const entry = await tavernMetaTable.get('selectedSessionId');
    return String(entry?.value || '').trim();
}

export async function setSelectedTavernSessionId(sessionId = ''): Promise<string> {
    const value = String(sessionId || '').trim();
    await tavernMetaTable.put({ key: 'selectedSessionId', value, updatedAt: now() });
    return value;
}

export async function getTavernSession(sessionId = ''): Promise<TavernSessionRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    return await tavernSessionsTable.get(id) || null;
}

function cloneBranchMemorySnapshotFiles(files: TavernMemorySnapshotFileEntry[] = [], sessionId = ''): TavernMemorySnapshotFileEntry[] {
    return files.map((entry) => ({
        ...cloneSerializable(entry, entry),
        file: {
            ...cloneSerializable(entry.file, entry.file),
            sessionId,
        },
    }));
}

function cloneBranchTask(task: TavernTaskRecord, sessionId = '', mapManagerRunId: (managerRunId?: string) => string): TavernTaskRecord {
    const cloned = cloneSerializable(task, task);
    return {
        ...cloned,
        sessionId,
        sourceManagerRunId: cloned.sourceManagerRunId ? mapManagerRunId(cloned.sourceManagerRunId) : cloned.sourceManagerRunId,
    };
}

export async function branchTavernSession(sessionId = ''): Promise<TavernSessionRecord | null> {
    const sourceSessionId = String(sessionId || '').trim();
    if (!sourceSessionId) {return null;}
    const timestamp = now();
    const nextSessionId = createId();
    const managerRunIdMap = new Map<string, string>();
    const mapManagerRunId = (managerRunId = '') => {
        const original = String(managerRunId || '').trim();
        if (!original) {return '';}
        const existing = managerRunIdMap.get(original);
        if (existing) {return existing;}
        const next = createId('manager-run');
        managerRunIdMap.set(original, next);
        return next;
    };
    return await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernMessagesTable,
        tavernAssistantChatMessagesTable,
        tavernManagerRunsTable,
        tavernManagerCandidatesTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernManagerTaskSnapshotsTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernMemoryIndexesTable,
        tavernStateDocumentsTable,
        tavernStatePatchesTable,
        tavernTasksTable,
        tavernTaskSnapshotsTable,
        tavernStatusSnapshotsTable,
        tavernTaskFingerprintStatesTable,
        tavernCommunicationContactsTable,
        tavernCommunicationThreadsTable,
        tavernCommunicationMessagesTable,
        tavernCommunicationSnapshotsTable,
        async () => {
            const sourceSession = await tavernSessionsTable.get(sourceSessionId);
            if (!sourceSession) {return null;}
            const managerCandidate = await tavernManagerCandidatesTable.get(sourceSessionId);
            const [
                messages,
                assistantChatMessages,
                managerRuns,
                managerMemorySnapshots,
                managerStateSnapshots,
                managerTaskSnapshots,
                memoryFiles,
                memorySnapshots,
                memoryIndexes,
                stateDocuments,
                statePatches,
                tasks,
                taskSnapshots,
                statusSnapshots,
                fingerprintStates,
                communicationContacts,
                communicationThreads,
                communicationMessages,
                communicationSnapshots,
            ] = await Promise.all([
                tavernMessagesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernAssistantChatMessagesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernManagerRunsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernManagerMemorySnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernManagerStateSnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernManagerTaskSnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernMemoryFilesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernMemorySnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernMemoryIndexesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernStateDocumentsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernStatePatchesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernTasksTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernTaskSnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernStatusSnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernTaskFingerprintStatesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernCommunicationContactsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernCommunicationThreadsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernCommunicationMessagesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernCommunicationSnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
            ]);
            assertTavernManagerSnapshotStable({
                runs: managerRuns,
                memorySnapshots: managerMemorySnapshots,
                stateSnapshots: managerStateSnapshots,
                taskSnapshots: managerTaskSnapshots,
                statePatches,
            }, 'manager_branch_unaccepted_writes');
            const session: TavernSessionRecord = {
                ...cloneSerializable(sourceSession, sourceSession),
                id: nextSessionId,
                title: normalizeTitle(`${sourceSession.title || sourceSession.characterName || '未命名会话'} · 分支`),
                createdAt: timestamp,
                updatedAt: timestamp,
                contextSnapshot: cloneSerializable(sourceSession.contextSnapshot, undefined),
                buildSnapshot: cloneSerializable(sourceSession.buildSnapshot, undefined),
                state: cloneSerializable(normalizeTavernSessionState(sourceSession.state || {}), {}),
            };
            managerRuns.forEach((run) => {
                managerRunIdMap.set(run.id, createId('manager-run'));
            });
            await tavernSessionsTable.put(session);
            await Promise.all([
                messages.length ? tavernMessagesTable.bulkPut(messages.map((message) => ({
                    ...cloneSerializable(message, message),
                    sessionId: nextSessionId,
                }))) : 0,
                assistantChatMessages.length ? tavernAssistantChatMessagesTable.bulkPut(assistantChatMessages.map((message) => ({
                    ...cloneSerializable(message, message),
                    sessionId: nextSessionId,
                }))) : 0,
                managerRuns.length ? tavernManagerRunsTable.bulkPut(managerRuns.map((run) => ({
                    ...cloneSerializable(run, run),
                    id: mapManagerRunId(run.id),
                    sessionId: nextSessionId,
                    recoverySourceRunId: run.recoverySourceRunId ? mapManagerRunId(run.recoverySourceRunId) : undefined,
                    ...(run.status === 'queued' ? {
                        leaseOwnerId: '',
                        leaseExpiresAt: 0,
                    } : {}),
                }))) : 0,
                managerCandidate ? tavernManagerCandidatesTable.put({
                    ...cloneSerializable(managerCandidate, managerCandidate),
                    id: createId('manager-candidate'),
                    sessionId: nextSessionId,
                    createdAt: timestamp,
                    updatedAt: timestamp,
                }) : 0,
                memoryFiles.length ? tavernMemoryFilesTable.bulkPut(memoryFiles.map((file) => ({
                    ...cloneSerializable(file, file),
                    sessionId: nextSessionId,
                }))) : 0,
                memorySnapshots.length ? tavernMemorySnapshotsTable.bulkPut(memorySnapshots.map((snapshot) => ({
                    ...cloneSerializable(snapshot, snapshot),
                    sessionId: nextSessionId,
                    files: cloneBranchMemorySnapshotFiles(snapshot.files || [], nextSessionId),
                }))) : 0,
                memoryIndexes.length ? tavernMemoryIndexesTable.bulkPut(memoryIndexes.map((index) => ({
                    ...cloneSerializable(index, index),
                    sessionId: nextSessionId,
                }))) : 0,
                managerMemorySnapshots.length ? tavernManagerMemorySnapshotsTable.bulkPut(managerMemorySnapshots.map((snapshot) => ({
                    ...cloneSerializable(snapshot, snapshot),
                    managerRunId: mapManagerRunId(snapshot.managerRunId),
                    sessionId: nextSessionId,
                    beforeFile: snapshot.beforeFile
                        ? {
                            ...cloneSerializable(snapshot.beforeFile, snapshot.beforeFile),
                            sessionId: nextSessionId,
                        }
                        : undefined,
                }))) : 0,
                stateDocuments.length ? tavernStateDocumentsTable.bulkPut(stateDocuments.map((document) => ({
                    ...cloneSerializable(document, document),
                    sessionId: nextSessionId,
                }))) : 0,
                statePatches.length ? tavernStatePatchesTable.bulkPut(statePatches.map((patch) => ({
                    ...cloneSerializable(patch, patch),
                    id: createId('state-patch'),
                    sessionId: nextSessionId,
                    managerRunId: patch.managerRunId ? mapManagerRunId(patch.managerRunId) : patch.managerRunId,
                }))) : 0,
                managerStateSnapshots.length ? tavernManagerStateSnapshotsTable.bulkPut(managerStateSnapshots.map((snapshot) => ({
                    ...cloneSerializable(snapshot, snapshot),
                    managerRunId: mapManagerRunId(snapshot.managerRunId),
                    sessionId: nextSessionId,
                    beforeDocument: snapshot.beforeDocument
                        ? {
                            ...cloneSerializable(snapshot.beforeDocument, snapshot.beforeDocument),
                            sessionId: nextSessionId,
                        }
                        : undefined,
                }))) : 0,
                tasks.length ? tavernTasksTable.bulkPut(tasks.map((task) => cloneBranchTask(task, nextSessionId, mapManagerRunId))) : 0,
                taskSnapshots.length ? tavernTaskSnapshotsTable.bulkPut(taskSnapshots.map((snapshot) => ({
                    ...cloneSerializable(snapshot, snapshot),
                    sessionId: nextSessionId,
                    tasks: (snapshot.tasks || []).map((task) => cloneBranchTask(task, nextSessionId, mapManagerRunId)),
                }))) : 0,
                statusSnapshots.length ? tavernStatusSnapshotsTable.bulkPut(statusSnapshots.map((snapshot) => ({
                    ...cloneSerializable(snapshot, snapshot),
                    sessionId: nextSessionId,
                    document: snapshot.document
                        ? {
                            ...cloneSerializable(snapshot.document, snapshot.document),
                            sessionId: nextSessionId,
                        }
                        : undefined,
                }))) : 0,
                managerTaskSnapshots.length ? tavernManagerTaskSnapshotsTable.bulkPut(managerTaskSnapshots.map((snapshot) => ({
                    ...cloneSerializable(snapshot, snapshot),
                    managerRunId: mapManagerRunId(snapshot.managerRunId),
                    sessionId: nextSessionId,
                    beforeTasks: (snapshot.beforeTasks || []).map((task) => cloneBranchTask(task, nextSessionId, mapManagerRunId)),
                }))) : 0,
                fingerprintStates.length ? tavernTaskFingerprintStatesTable.bulkPut(fingerprintStates.map((state) => ({
                    ...cloneSerializable(state, state),
                    sessionId: nextSessionId,
                }))) : 0,
                communicationContacts.length ? tavernCommunicationContactsTable.bulkPut(communicationContacts.map((contact) => ({
                    ...cloneSerializable(contact, contact),
                    sessionId: nextSessionId,
                }))) : 0,
                communicationThreads.length ? tavernCommunicationThreadsTable.bulkPut(communicationThreads.map((thread) => (
                    cloneStableCommunicationThread(thread, nextSessionId)
                ))) : 0,
                communicationMessages.length ? tavernCommunicationMessagesTable.bulkPut(communicationMessages.map((message) => (
                    cloneStableCommunicationMessage(message, nextSessionId)
                ))) : 0,
                communicationSnapshots.length ? tavernCommunicationSnapshotsTable.bulkPut(communicationSnapshots.map((snapshot) => ({
                    ...cloneSerializable(snapshot, snapshot),
                    sessionId: nextSessionId,
                    contacts: (snapshot.contacts || []).map((contact) => ({ ...cloneSerializable(contact, contact), sessionId: nextSessionId })),
                    threads: (snapshot.threads || []).map((thread) => cloneStableCommunicationThread(thread, nextSessionId)),
                    messages: (snapshot.messages || []).map((message) => cloneStableCommunicationMessage(message, nextSessionId)),
                }))) : 0,
            ]);
            return session;
        },
    );
}

export async function deleteTavernSession(sessionId = ''): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    const existing = await getTavernSession(id);
    if (!existing) {return 0;}
    await db.transaction(
        'rw',
        tavernSessionsTable,
        tavernMessagesTable,
        tavernAssistantChatMessagesTable,
        tavernManagerRunsTable,
        tavernManagerCandidatesTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernManagerTaskSnapshotsTable,
        tavernMemoryFilesTable,
        tavernMemorySnapshotsTable,
        tavernMemoryIndexesTable,
        tavernStateDocumentsTable,
        tavernStatePatchesTable,
        tavernTasksTable,
        tavernTaskSnapshotsTable,
        tavernStatusSnapshotsTable,
        tavernTaskFingerprintStatesTable,
        tavernCommunicationContactsTable,
        tavernCommunicationThreadsTable,
        tavernCommunicationMessagesTable,
        tavernCommunicationSnapshotsTable,
        tavernMetaTable,
        async () => {
            const [messages, assistantChatMessages, runs, snapshots, stateSnapshots, taskRunSnapshots, files, memorySnapshots, indexes, stateDocuments, statePatches, tasks, taskSnapshots, statusSnapshots, fingerprintStates, communicationContacts, communicationThreads, communicationMessages, communicationSnapshots] = await Promise.all([
                tavernMessagesTable.where('sessionId').equals(id).toArray(),
                tavernAssistantChatMessagesTable.where('sessionId').equals(id).toArray(),
                tavernManagerRunsTable.where('sessionId').equals(id).toArray(),
                tavernManagerMemorySnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernManagerStateSnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernManagerTaskSnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernMemoryFilesTable.where('sessionId').equals(id).toArray(),
                tavernMemorySnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernMemoryIndexesTable.where('sessionId').equals(id).toArray(),
                tavernStateDocumentsTable.where('sessionId').equals(id).toArray(),
                tavernStatePatchesTable.where('sessionId').equals(id).toArray(),
                tavernTasksTable.where('sessionId').equals(id).toArray(),
                tavernTaskSnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernStatusSnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernTaskFingerprintStatesTable.where('sessionId').equals(id).toArray(),
                tavernCommunicationContactsTable.where('sessionId').equals(id).toArray(),
                tavernCommunicationThreadsTable.where('sessionId').equals(id).toArray(),
                tavernCommunicationMessagesTable.where('sessionId').equals(id).toArray(),
                tavernCommunicationSnapshotsTable.where('sessionId').equals(id).toArray(),
            ]);
            const managerCandidate = await tavernManagerCandidatesTable.get(id);
            await Promise.all([
                messages.length ? tavernMessagesTable.bulkDelete(messages.map((message) => [message.sessionId, message.order])) : 0,
                assistantChatMessages.length ? tavernAssistantChatMessagesTable.bulkDelete(assistantChatMessages.map((message) => [message.sessionId, message.order])) : 0,
                runs.length ? tavernManagerRunsTable.bulkDelete(runs.map((run) => run.id)) : 0,
                managerCandidate ? tavernManagerCandidatesTable.delete(id) : 0,
                snapshots.length ? tavernManagerMemorySnapshotsTable.bulkDelete(snapshots.map((snapshot) => [snapshot.managerRunId, snapshot.path])) : 0,
                stateSnapshots.length ? tavernManagerStateSnapshotsTable.bulkDelete(stateSnapshots.map((snapshot) => [snapshot.managerRunId, snapshot.docType, snapshot.docId])) : 0,
                taskRunSnapshots.length ? tavernManagerTaskSnapshotsTable.bulkDelete(taskRunSnapshots.map((snapshot) => snapshot.managerRunId)) : 0,
                files.length ? tavernMemoryFilesTable.bulkDelete(files.map((file) => [file.sessionId, file.path])) : 0,
                memorySnapshots.length ? tavernMemorySnapshotsTable.bulkDelete(memorySnapshots.map((snapshot) => [snapshot.sessionId, snapshot.floor])) : 0,
                indexes.length ? tavernMemoryIndexesTable.bulkDelete(indexes.map((index) => [index.sessionId, index.kind])) : 0,
                stateDocuments.length ? tavernStateDocumentsTable.bulkDelete(stateDocuments.map((document) => [document.sessionId, document.docType, document.docId])) : 0,
                statePatches.length ? tavernStatePatchesTable.bulkDelete(statePatches.map((patch) => patch.id)) : 0,
                tasks.length ? tavernTasksTable.bulkDelete(tasks.map((task) => [task.sessionId, task.id])) : 0,
                taskSnapshots.length ? tavernTaskSnapshotsTable.bulkDelete(taskSnapshots.map((snapshot) => [snapshot.sessionId, snapshot.floor])) : 0,
                statusSnapshots.length ? tavernStatusSnapshotsTable.bulkDelete(statusSnapshots.map((snapshot) => [snapshot.sessionId, snapshot.floor])) : 0,
                fingerprintStates.length ? tavernTaskFingerprintStatesTable.bulkDelete(fingerprintStates.map((state) => state.sessionId)) : 0,
                communicationContacts.length ? tavernCommunicationContactsTable.bulkDelete(communicationContacts.map((contact) => [contact.sessionId, contact.id])) : 0,
                communicationThreads.length ? tavernCommunicationThreadsTable.bulkDelete(communicationThreads.map((thread) => [thread.sessionId, thread.id])) : 0,
                communicationMessages.length ? tavernCommunicationMessagesTable.bulkDelete(communicationMessages.map((message) => [message.sessionId, message.threadId, message.sequence])) : 0,
                communicationSnapshots.length ? tavernCommunicationSnapshotsTable.bulkDelete(communicationSnapshots.map((snapshot) => [snapshot.sessionId, snapshot.floor])) : 0,
            ]);
            await tavernSessionsTable.delete(id);
            const selected = await tavernMetaTable.get('selectedSessionId');
            if (String(selected?.value || '') === id) {
                const [nextSession] = await tavernSessionsTable.orderBy('updatedAt').reverse().toArray();
                await tavernMetaTable.put({
                    key: 'selectedSessionId',
                    value: nextSession?.id || '',
                    updatedAt: now(),
                });
            }
        },
    );
    return 1;
}

export async function updateTavernSessionState(sessionId = '', patch: Partial<TavernSessionState> = {}): Promise<TavernSessionRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const existing = await getTavernSession(id);
    if (!existing) {return null;}
    const timestamp = now();
    const currentState = normalizeTavernSessionState(existing.state || {});
    const patchState = normalizeTavernSessionState(patch);
    const state: TavernSessionState = {
        ...currentState,
        ...patch,
        turn: Math.max(0, Number(patch.turn ?? currentState.turn) || 0),
        contract: hasOwnStateField(patch, 'contract')
            ? mergeTavernSessionContract(currentState.contract, hasTavernSessionContractOverride(patch.contract) ? patch.contract : undefined)
            : currentState.contract,
        worldEntryStates: mergeWorldEntryStates(currentState.worldEntryStates || {}, patchState.worldEntryStates || {}),
        nativeWorldInfoTimedState: hasOwnStateField(patch, 'nativeWorldInfoTimedState')
            ? patchState.nativeWorldInfoTimedState
            : currentState.nativeWorldInfoTimedState,
        activeMapDocId: hasOwnStateField(patch, 'activeMapDocId')
            ? patchState.activeMapDocId
            : currentState.activeMapDocId,
    };
    await tavernSessionsTable.update(id, {
        state: cloneSerializable(state, {}),
        updatedAt: timestamp,
        buildSnapshot: cloneSerializable(patch.lastBuildSnapshot || existing.buildSnapshot, undefined),
    });
    return await getTavernSession(id);
}

export async function replaceTavernSessionState(sessionId = '', stateInput: Partial<TavernSessionState> = {}): Promise<TavernSessionRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const existing = await getTavernSession(id);
    if (!existing) {return null;}
    const timestamp = now();
    const currentState = normalizeTavernSessionState(existing.state || {});
    const normalized = normalizeTavernSessionState(stateInput);
    const state: TavernSessionState = {
        ...stateInput,
        turn: Math.max(0, Number(normalized.turn) || 0),
        activeMapDocId: hasOwnStateField(stateInput, 'activeMapDocId')
            ? normalized.activeMapDocId
            : currentState.activeMapDocId || TAVERN_MAP_DOC_ID,
        contract: hasOwnStateField(stateInput, 'contract')
            ? mergeTavernSessionContract(currentState.contract, hasTavernSessionContractOverride(stateInput.contract) ? stateInput.contract : undefined)
            : currentState.contract,
        worldEntryStates: normalized.worldEntryStates || {},
        nativeWorldInfoTimedState: normalized.nativeWorldInfoTimedState,
    };
    await tavernSessionsTable.update(id, {
        state: cloneSerializable(state, {}),
        updatedAt: timestamp,
        buildSnapshot: cloneSerializable(state.lastBuildSnapshot || existing.buildSnapshot, undefined),
    });
    return await getTavernSession(id);
}

export async function updateTavernSessionSnapshot(sessionId = '', patch: {
    contextSnapshot?: XbTavernContext;
    buildSnapshot?: XbTavernBuildSnapshot;
    chatPresetId?: string;
    chatPresetName?: string;
    presetId?: string;
    presetName?: string;
    characterKey?: string;
    characterName?: string;
} = {}): Promise<TavernSessionRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const existing = await getTavernSession(id);
    if (!existing) {return null;}
    const contextSnapshot = 'contextSnapshot' in patch ? patch.contextSnapshot : existing.contextSnapshot;
    const character = contextSnapshot?.character || {};
    const update: Partial<TavernSessionRecord> = {
        updatedAt: now(),
        contextSnapshot: cloneSerializable(contextSnapshot, undefined),
        buildSnapshot: cloneSerializable('buildSnapshot' in patch ? patch.buildSnapshot : existing.buildSnapshot, undefined),
        chatPresetId: 'chatPresetId' in patch ? String(patch.chatPresetId || '') : existing.chatPresetId,
        chatPresetName: 'chatPresetName' in patch ? String(patch.chatPresetName || '') : existing.chatPresetName,
        presetId: 'presetId' in patch ? String(patch.presetId || '') : existing.presetId,
        presetName: 'presetName' in patch ? String(patch.presetName || '') : existing.presetName,
        characterKey: 'characterKey' in patch ? String(patch.characterKey || '') : String(character.characterKey || existing.characterKey || ''),
        characterName: 'characterName' in patch ? String(patch.characterName || '') : String(character.name || existing.characterName || ''),
    };
    await tavernSessionsTable.update(id, update);
    return await getTavernSession(id);
}

function buildTavernMessageRecord(
    sessionId: string,
    order: number,
    message: TavernAppendMessageInput,
    timestamp: number,
): TavernMessageRecord {
    return {
        sessionId,
        order,
        role: String(message.role || ''),
        content: String(message.content || ''),
        name: message.name ? String(message.name) : undefined,
        error: message.error === true,
        createdAt: timestamp,
        provider: 'provider' in message ? String(message.provider || '') : undefined,
        model: 'model' in message ? String(message.model || '') : undefined,
        finishReason: 'finishReason' in message ? String(message.finishReason || '') : undefined,
        thoughts: 'thoughts' in message ? cloneSerializable(message.thoughts, undefined) : undefined,
        providerPayload: 'providerPayload' in message ? cloneSerializable(message.providerPayload, undefined) : undefined,
        contextSnapshot: 'contextSnapshot' in message ? cloneSerializable(message.contextSnapshot, undefined) : undefined,
        buildSnapshot: 'buildSnapshot' in message ? cloneSerializable(message.buildSnapshot, undefined) : undefined,
        chatPresetId: 'chatPresetId' in message ? String(message.chatPresetId || '') : String(message.presetId || ''),
        chatPresetName: 'chatPresetName' in message ? String(message.chatPresetName || '') : String(message.presetName || ''),
        presetId: 'presetId' in message ? String(message.presetId || '') : undefined,
        presetName: 'presetName' in message ? String(message.presetName || '') : undefined,
        requestSnapshot: 'requestSnapshot' in message ? cloneSerializable(message.requestSnapshot, undefined) : undefined,
        runtimeEvents: 'runtimeEvents' in message ? normalizeMessageRuntimeEvents(message.runtimeEvents) : [],
        timelineRevision: 1,
    };
}

export async function appendTavernMessage(sessionId: string, message: TavernAppendMessageInput): Promise<TavernMessageRecord> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('session_required');}
    const timestamp = now();
    let record: TavernMessageRecord | null = null;
    await db.transaction('rw', tavernMessagesTable, tavernSessionsTable, async () => {
        const latest = await getLatestTavernMessage(id);
        const order = (latest ? Math.floor(Number(latest.order)) : -1) + 1;
        record = buildTavernMessageRecord(id, order, message, timestamp);
        await tavernMessagesTable.put(record);
        await tavernSessionsTable.update(id, { updatedAt: timestamp });
    });
    if (!record) {throw new Error('message_append_failed');}
    return normalizeStoredTavernMessageRecord(record);
}

export async function putTavernManagerCandidate(input: {
    sessionId: string;
    turn: number;
    userOrder: number;
    assistantOrder: number;
    inputSummary?: string;
}): Promise<TavernManagerCandidateRecord> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {throw new Error('manager_session_required');}
    const timestamp = now();
    const record: TavernManagerCandidateRecord = {
        id: createId('manager-candidate'),
        sessionId,
        turn: Math.max(0, Math.floor(Number(input.turn) || 0)),
        userOrder: Math.floor(Number(input.userOrder)),
        assistantOrder: Math.floor(Number(input.assistantOrder)),
        inputSummary: String(input.inputSummary || ''),
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    return await db.transaction('rw', tavernManagerCandidatesTable, tavernSessionsTable, async () => {
        if (!await tavernSessionsTable.get(sessionId)) {throw new Error('manager_session_missing');}
        await tavernManagerCandidatesTable.put(record);
        await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
        return record;
    });
}

export async function getTavernManagerCandidate(sessionId = ''): Promise<TavernManagerCandidateRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    return await tavernManagerCandidatesTable.get(id) || null;
}

export async function deleteTavernManagerCandidateForMessageRange(sessionId = '', fromOrder = 0): Promise<boolean> {
    const id = String(sessionId || '').trim();
    const order = Number(fromOrder);
    if (!id || !Number.isFinite(order)) {return false;}
    return await db.transaction('rw', tavernManagerCandidatesTable, tavernSessionsTable, async () => {
        const candidate = await tavernManagerCandidatesTable.get(id);
        if (!candidate || (candidate.userOrder < order && candidate.assistantOrder < order)) {return false;}
        await tavernManagerCandidatesTable.delete(id);
        await tavernSessionsTable.update(id, { updatedAt: now() });
        return true;
    });
}

export async function appendTavernUserMessageAndConfirmManagerCandidate(
    sessionId: string,
    message: TavernAppendMessageInput,
    options: { confirmManagerCandidate?: boolean } = {},
): Promise<{ userMessage: TavernMessageRecord; managerRun: TavernManagerRunRecord | null }> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('session_required');}
    if (String(message.role || '') !== 'user') {throw new Error('manager_confirmation_user_required');}
    const timestamp = now();
    let userMessage: TavernMessageRecord | null = null;
    let managerRun: TavernManagerRunRecord | null = null;
    await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernManagerCandidatesTable,
        tavernManagerRunsTable,
        async () => {
            const latest = await getLatestTavernMessage(id);
            const order = (latest ? Math.floor(Number(latest.order)) : -1) + 1;
            userMessage = buildTavernMessageRecord(id, order, message, timestamp);
            await tavernMessagesTable.put(userMessage);

            const candidate = await tavernManagerCandidatesTable.get(id);
            if (candidate) {
                const [sourceUser, sourceAssistant] = await Promise.all([
                    tavernMessagesTable.get([id, candidate.userOrder]),
                    tavernMessagesTable.get([id, candidate.assistantOrder]),
                ]);
                const sourceValid = sourceUser?.role === 'user'
                    && sourceUser.error !== true
                    && sourceAssistant?.role === 'assistant'
                    && sourceAssistant.error !== true
                    && !['aborted', 'error'].includes(String(sourceAssistant.finishReason || '').trim())
                    && candidate.assistantOrder === order - 1;
                if (options.confirmManagerCandidate === true && sourceValid) {
                    managerRun = {
                        id: candidate.id,
                        sessionId: id,
                        turn: candidate.turn,
                        userOrder: candidate.userOrder,
                        assistantOrder: candidate.assistantOrder,
                        confirmedByUserOrder: order,
                        sourceUserCreatedAt: Number(sourceUser.createdAt),
                        sourceAssistantCreatedAt: Number(sourceAssistant.createdAt),
                        sourceUserRevision: Math.max(1, Math.floor(Number(sourceUser.timelineRevision) || 1)),
                        sourceAssistantRevision: Math.max(1, Math.floor(Number(sourceAssistant.timelineRevision) || 1)),
                        trigger: 'accepted_turn',
                        status: 'queued',
                        inputSummary: String(candidate.inputSummary || ''),
                        outputText: '已由下一条用户消息确认，等待按剧情顺序维护。',
                        createdAt: timestamp,
                        updatedAt: timestamp,
                    };
                    await tavernManagerRunsTable.put(managerRun);
                }
                await tavernManagerCandidatesTable.delete(id);
            }
            await tavernSessionsTable.update(id, { updatedAt: timestamp });
        },
    );
    if (!userMessage) {throw new Error('message_append_failed');}
    return {
        userMessage: normalizeStoredTavernMessageRecord(userMessage),
        managerRun,
    };
}

export async function claimNextQueuedAcceptedTurnManagerRun(sessionId = '', options: {
    leaseOwnerId?: string;
    leaseDurationMs?: number;
} = {}): Promise<TavernManagerRunRecord | null> {
    const id = String(sessionId || '').trim();
    const leaseOwnerId = String(options.leaseOwnerId || '').trim();
    if (!id || !leaseOwnerId) {return null;}
    return await db.transaction('rw', tavernManagerRunsTable, tavernSessionsTable, async () => {
        const runs = await tavernManagerRunsTable.where('sessionId').equals(id).toArray();
        const timestamp = now();
        if (runs.some((run) => run.trigger === 'accepted_turn' && run.status === 'running')) {
            return null;
        }
        const queued = runs
            .filter((run) => run.trigger === 'accepted_turn' && run.status === 'queued')
            .sort((left, right) => Number(left.assistantOrder) - Number(right.assistantOrder)
                || Number(left.createdAt) - Number(right.createdAt))[0];
        if (!queued) {return null;}
        const leaseDurationMs = Math.max(5000, Math.floor(Number(options.leaseDurationMs) || 30000));
        await tavernManagerRunsTable.update(queued.id, {
            status: 'running',
            leaseOwnerId,
            leaseExpiresAt: timestamp + leaseDurationMs,
            updatedAt: timestamp,
        });
        await tavernSessionsTable.update(id, { updatedAt: timestamp });
        return await tavernManagerRunsTable.get(queued.id) || null;
    });
}

export async function getAcceptedTurnManagerQueueState(sessionId = ''): Promise<{
    queued: number;
    running: number;
    nextLeaseExpiresAt: number;
}> {
    const id = String(sessionId || '').trim();
    if (!id) {return { queued: 0, running: 0, nextLeaseExpiresAt: 0 };}
    const runs = await tavernManagerRunsTable.where('sessionId').equals(id).toArray();
    const queued = runs.filter((run) => run.trigger === 'accepted_turn' && run.status === 'queued');
    const running = runs.filter((run) => run.trigger === 'accepted_turn' && run.status === 'running');
    return {
        queued: queued.length,
        running: running.length,
        nextLeaseExpiresAt: running.reduce((earliest, run) => {
            const expiresAt = Number(run.leaseExpiresAt) || 0;
            if (!expiresAt) {return earliest;}
            return !earliest || expiresAt < earliest ? expiresAt : earliest;
        }, 0),
    };
}

export async function markExpiredAcceptedTurnManagerRunsInterrupted(
    sessionId = '',
    observedAt = now(),
): Promise<TavernManagerRunRecord[]> {
    const id = String(sessionId || '').trim();
    const timestamp = Number(observedAt) || now();
    if (!id) {return [];}
    return await db.transaction('rw', tavernManagerRunsTable, tavernSessionsTable, async () => {
        const runs = await tavernManagerRunsTable.where('sessionId').equals(id).toArray();
        const expired = runs.filter((run) => run.trigger === 'accepted_turn'
            && run.status === 'running'
            && Number(run.leaseExpiresAt) <= timestamp);
        if (!expired.length) {return [];}
        await Promise.all(expired.map((run) => tavernManagerRunsTable.update(run.id, {
            status: 'failed',
            leaseOwnerId: '',
            leaseExpiresAt: 0,
            error: 'manager_worker_interrupted',
            updatedAt: timestamp,
        })));
        await tavernSessionsTable.update(id, { updatedAt: timestamp });
        return (await Promise.all(expired.map((run) => tavernManagerRunsTable.get(run.id))))
            .filter(Boolean) as TavernManagerRunRecord[];
    });
}

export async function assertRunningTavernManagerRunLease(managerRunId = '', leaseOwnerId = ''): Promise<TavernManagerRunRecord> {
    const id = String(managerRunId || '').trim();
    const owner = String(leaseOwnerId || '').trim();
    const run = id ? await (Dexie as unknown as {
        ignoreTransaction<T>(scope: () => Promise<T>): Promise<T>;
    }).ignoreTransaction(() => tavernManagerRunsTable.get(id)) : null;
    if (!run || run.status !== 'running' || !owner || run.leaseOwnerId !== owner || Number(run.leaseExpiresAt) <= now()) {
        throw new Error('manager_lease_lost');
    }
    return run;
}

export async function updateTavernMessage(
    sessionId = '',
    order = -1,
    patch: Partial<Pick<TavernMessageRecord,
        | 'content'
        | 'error'
        | 'thoughts'
        | 'runtimeEvents'
        | 'contextSnapshot'
        | 'buildSnapshot'
        | 'chatPresetId'
        | 'chatPresetName'
        | 'presetId'
        | 'presetName'
        | 'requestSnapshot'
        | 'provider'
        | 'model'
        | 'finishReason'
    >>,
    options: { incrementTimelineRevision?: boolean } = {},
): Promise<TavernMessageRecord | null> {
    const id = String(sessionId || '').trim();
    const messageOrder = Number(order);
    if (!id || !Number.isInteger(messageOrder) || messageOrder < 0) {return null;}
    const existing = await tavernMessagesTable.get([id, messageOrder]);
    if (!existing) {return null;}
    const update: Partial<TavernMessageRecord> = {};
    if ('content' in patch) {update.content = String(patch.content || '');}
    if ('error' in patch) {update.error = patch.error === true;}
    if ('thoughts' in patch) {update.thoughts = cloneSerializable(patch.thoughts, undefined);}
    if ('runtimeEvents' in patch) {update.runtimeEvents = normalizeMessageRuntimeEvents(patch.runtimeEvents);}
    if ('contextSnapshot' in patch) {update.contextSnapshot = cloneSerializable(patch.contextSnapshot, undefined);}
    if ('buildSnapshot' in patch) {update.buildSnapshot = cloneSerializable(patch.buildSnapshot, undefined);}
    if ('chatPresetId' in patch) {update.chatPresetId = String(patch.chatPresetId || '');}
    if ('chatPresetName' in patch) {update.chatPresetName = String(patch.chatPresetName || '');}
    if ('presetId' in patch) {update.presetId = String(patch.presetId || '');}
    if ('presetName' in patch) {update.presetName = String(patch.presetName || '');}
    if ('requestSnapshot' in patch) {update.requestSnapshot = cloneSerializable(patch.requestSnapshot, undefined);}
    if ('provider' in patch) {update.provider = String(patch.provider || '');}
    if ('model' in patch) {update.model = String(patch.model || '');}
    if ('finishReason' in patch) {update.finishReason = String(patch.finishReason || '');}
    if (options.incrementTimelineRevision === true) {
        update.timelineRevision = Math.max(1, Math.floor(Number(existing.timelineRevision) || 1)) + 1;
    }
    await tavernMessagesTable.update([id, messageOrder], update);
    await tavernSessionsTable.update(id, { updatedAt: now() });
    const updated = await tavernMessagesTable.get([id, messageOrder]);
    return updated ? normalizeStoredTavernMessageRecord(updated) : null;
}

export async function deleteTavernMessages(sessionId = '', orders: number[] = []): Promise<number> {
    const id = String(sessionId || '').trim();
    const uniqueOrders = [...new Set((Array.isArray(orders) ? orders : [])
        .map((order) => Number(order))
        .filter((order) => Number.isInteger(order) && order >= 0))];
    if (!id || !uniqueOrders.length) {return 0;}
    const existingKeys: Array<[string, number]> = [];
    await Promise.all(uniqueOrders.map(async (order) => {
        const existing = await tavernMessagesTable.get([id, order]);
        if (existing) {existingKeys.push([id, order]);}
    }));
    if (!existingKeys.length) {return 0;}
    await db.transaction('rw', tavernMessagesTable, tavernSessionsTable, async () => {
        await tavernMessagesTable.bulkDelete(existingKeys);
        await tavernSessionsTable.update(id, { updatedAt: now() });
    });
    return existingKeys.length;
}

export async function listTavernMessages(sessionId = ''): Promise<TavernMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    return (await tavernMessagesTable.where('sessionId').equals(id).sortBy('order'))
        .map(normalizeStoredTavernMessageRecord);
}

export async function getTavernMessage(sessionId = '', order = -1): Promise<TavernMessageRecord | null> {
    const id = String(sessionId || '').trim();
    const messageOrder = Number(order);
    if (!id || !Number.isInteger(messageOrder) || messageOrder < 0) {return null;}
    const message = await tavernMessagesTable.get([id, messageOrder]);
    return message ? normalizeStoredTavernMessageRecord(message) : null;
}

export async function getLatestTavernMessage(sessionId = ''): Promise<TavernMessageRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const latest = await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, DexieRangeKeys.maxKey])
        .reverse()
        .first();
    return latest ? normalizeStoredTavernMessageRecord(latest) : null;
}

export async function getLatestTavernAssistantOrder(sessionId = ''): Promise<number | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const latest = await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, DexieRangeKeys.maxKey])
        .reverse()
        .filter((message) => message.role === 'assistant' && message.error !== true)
        .first();
    return latest ? Math.floor(Number(latest.order)) : null;
}

export async function listLatestTavernMessages(
    sessionId = '',
    limit = 12,
    offset = 0,
): Promise<TavernMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const safeLimit = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 12)));
    const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));
    const rows = await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, DexieRangeKeys.maxKey])
        .reverse()
        .offset(safeOffset)
        .limit(safeLimit)
        .toArray();
    return rows
        .reverse()
        .map(normalizeStoredTavernMessageRecord);
}

export async function listLatestTavernMessagesWithCount(
    sessionId = '',
    limit = 12,
    offset = 0,
): Promise<{ messages: TavernMessageRecord[]; total: number }> {
    const id = String(sessionId || '').trim();
    if (!id) {return { messages: [], total: 0 };}
    const safeLimit = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 12)));
    const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));
    return await db.transaction('r', tavernMessagesTable, async () => {
        const [rows, total] = await Promise.all([
            (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
                .where('[sessionId+order]')
                .between([id, DexieRangeKeys.minKey], [id, DexieRangeKeys.maxKey])
                .reverse()
                .offset(safeOffset)
                .limit(safeLimit)
                .toArray(),
            tavernMessagesTable.where('sessionId').equals(id).count(),
        ]);
        return {
            messages: rows.reverse().map(normalizeStoredTavernMessageRecord),
            total,
        };
    });
}

export interface TavernMessageWindowLoadResult {
    messages: TavernMessageRecord[];
    total: number;
    loadedStartOrder: number | null;
    loadedEndOrder: number | null;
}

export async function loadTavernMessageWindow(
    sessionId = '',
    limit = 12,
    offsetFromEnd = 0,
): Promise<TavernMessageWindowLoadResult> {
    const result = await listLatestTavernMessagesWithCount(sessionId, limit, offsetFromEnd);
    return {
        ...result,
        loadedStartOrder: result.messages[0]?.order ?? null,
        loadedEndOrder: result.messages.at(-1)?.order ?? null,
    };
}

export async function listTavernMessagesInRange(
    sessionId = '',
    startOrder = 0,
    endOrder = Number.POSITIVE_INFINITY,
    limit = 1000,
    offset = 0,
): Promise<TavernMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const start = Math.max(0, Math.floor(Number(startOrder) || 0));
    const finiteEnd = Number.isFinite(Number(endOrder));
    const end = finiteEnd ? Math.max(start, Math.floor(Number(endOrder) || start)) : Number.POSITIVE_INFINITY;
    const upperOrder = finiteEnd ? end : DexieRangeKeys.maxKey;
    const safeLimit = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 1000)));
    const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));
    return (await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, start], [id, upperOrder], true, true)
        .offset(safeOffset)
        .limit(safeLimit)
        .toArray())
        .map(normalizeStoredTavernMessageRecord);
}

export async function listTavernMessagesInRangeWithCount(
    sessionId = '',
    startOrder = 0,
    endOrder = Number.POSITIVE_INFINITY,
    limit = 1000,
    offset = 0,
): Promise<{ messages: TavernMessageRecord[]; total: number }> {
    const id = String(sessionId || '').trim();
    if (!id) {return { messages: [], total: 0 };}
    const start = Math.max(0, Math.floor(Number(startOrder) || 0));
    const finiteEnd = Number.isFinite(Number(endOrder));
    const end = finiteEnd ? Math.max(start, Math.floor(Number(endOrder) || start)) : Number.POSITIVE_INFINITY;
    const upperOrder = finiteEnd ? end : DexieRangeKeys.maxKey;
    const safeLimit = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 1000)));
    const safeOffset = Math.max(0, Math.floor(Number(offset) || 0));
    return await db.transaction('r', tavernMessagesTable, async () => {
        const range = () => (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
            .where('[sessionId+order]')
            .between([id, start], [id, upperOrder], true, true);
        const [rows, total] = await Promise.all([
            range()
                .offset(safeOffset)
                .limit(safeLimit)
                .toArray(),
            range().count(),
        ]);
        return {
            messages: rows.map(normalizeStoredTavernMessageRecord),
            total,
        };
    });
}

export async function listTavernMessageOrdersFrom(sessionId = '', fromOrder = 0): Promise<number[]> {
    const id = String(sessionId || '').trim();
    const start = Math.max(0, Math.floor(Number(fromOrder) || 0));
    if (!id) {return [];}
    const keys = await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, start], [id, DexieRangeKeys.maxKey], true, true)
        .primaryKeys();
    return keys
        .map((key) => Array.isArray(key) ? key[1] : undefined)
        .map((order) => Math.floor(Number(order)))
        .filter((order) => Number.isInteger(order) && order >= 0);
}

export async function listLatestTavernUserMessages(
    sessionId = '',
    limit = 5,
): Promise<TavernMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 5)));
    const rows = await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, DexieRangeKeys.maxKey])
        .reverse()
        .filter((message) => message.role === 'user')
        .limit(safeLimit)
        .toArray();
    return rows.reverse().map(normalizeStoredTavernMessageRecord);
}

export async function listLatestTavernUserMessagesBefore(
    sessionId = '',
    beforeOrder = Number.POSITIVE_INFINITY,
    limit = 5,
): Promise<TavernMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const safeLimit = Math.max(1, Math.min(100, Math.floor(Number(limit) || 5)));
    const finiteBefore = Number.isFinite(Number(beforeOrder));
    const before = Math.floor(Number(beforeOrder) || 0);
    if (finiteBefore && before <= 0) {return [];}
    const upperOrder = finiteBefore ? Math.max(0, before - 1) : DexieRangeKeys.maxKey;
    const rows = await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, upperOrder], true, true)
        .reverse()
        .filter((message) => message.role === 'user')
        .limit(safeLimit)
        .toArray();
    return rows.reverse().map(normalizeStoredTavernMessageRecord);
}

export async function getLatestTavernUserMessageAtOrBefore(
    sessionId = '',
    order = Number.POSITIVE_INFINITY,
): Promise<TavernMessageRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const finiteOrder = Number.isFinite(Number(order));
    const upperOrder = finiteOrder ? Math.max(0, Math.floor(Number(order) || 0)) : DexieRangeKeys.maxKey;
    const row = await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, upperOrder], true, true)
        .reverse()
        .filter((message) => message.role === 'user')
        .first();
    return row ? normalizeStoredTavernMessageRecord(row) : null;
}

export async function countTavernMessagesInRange(
    sessionId = '',
    startOrder = 0,
    endOrder = Number.POSITIVE_INFINITY,
): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    const start = Math.max(0, Math.floor(Number(startOrder) || 0));
    const finiteEnd = Number.isFinite(Number(endOrder));
    const end = finiteEnd ? Math.max(start, Math.floor(Number(endOrder) || start)) : Number.POSITIVE_INFINITY;
    const upperOrder = finiteEnd ? end : DexieRangeKeys.maxKey;
    return (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, start], [id, upperOrder], true, true)
        .count();
}

export async function countTavernMessages(sessionId = ''): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    return tavernMessagesTable.where('sessionId').equals(id).count();
}

export async function getLatestTavernAssistantChatMessage(sessionId = ''): Promise<TavernAssistantChatMessageRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    return await (tavernAssistantChatMessagesTable as unknown as DexieRangeTable<TavernAssistantChatMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, DexieRangeKeys.maxKey])
        .reverse()
        .first() || null;
}

function buildTavernAssistantChatMessageRecord(
    sessionId: string,
    order: number,
    message: TavernAppendAssistantChatMessageInput,
    timestamp: number,
): TavernAssistantChatMessageRecord {
    return {
        sessionId,
        order,
        role: normalizeAssistantChatMessageRole(message.role),
        content: String(message.content || ''),
        name: message.name ? String(message.name) : undefined,
        error: message.error === true,
        createdAt: timestamp,
        updatedAt: timestamp,
        provider: 'provider' in message ? String(message.provider || '') : undefined,
        model: 'model' in message ? String(message.model || '') : undefined,
        finishReason: 'finishReason' in message ? String(message.finishReason || '') : undefined,
        thoughts: 'thoughts' in message ? cloneSerializable(message.thoughts, undefined) : undefined,
        providerPayload: 'providerPayload' in message ? cloneSerializable(message.providerPayload, undefined) : undefined,
        toolCalls: normalizeAssistantChatToolCalls(message),
        toolCallId: String(message.toolCallId || message.tool_call_id || '').trim() || undefined,
        toolName: String(message.toolName || '').trim() || undefined,
        toolDisplay: 'toolDisplay' in message ? cloneSerializable(message.toolDisplay, undefined) : undefined,
    };
}

export async function replaceTavernAssistantChatMessages(
    sessionId: string,
    deleteOrders: number[] = [],
    messages: TavernAppendAssistantChatMessageInput[] = [],
): Promise<TavernAssistantChatMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('session_required');}
    const uniqueDeleteOrders = [...new Set((Array.isArray(deleteOrders) ? deleteOrders : [])
        .map((order) => Number(order))
        .filter((order) => Number.isInteger(order) && order >= 0))];
    const inputs = Array.isArray(messages) ? messages : [];
    if (!uniqueDeleteOrders.length && !inputs.length) {return [];}
    const timestamp = now();
    let records: TavernAssistantChatMessageRecord[] = [];
    await db.transaction('rw', tavernAssistantChatMessagesTable, tavernSessionsTable, async () => {
        if (uniqueDeleteOrders.length) {
            await tavernAssistantChatMessagesTable.bulkDelete(uniqueDeleteOrders.map((order) => [id, order]));
        }
        const latest = await getLatestTavernAssistantChatMessage(id);
        const firstOrder = (latest ? Math.floor(Number(latest.order)) : -1) + 1;
        records = inputs.map((message, index) => buildTavernAssistantChatMessageRecord(
            id,
            firstOrder + index,
            message,
            timestamp,
        ));
        if (records.length) {
            await tavernAssistantChatMessagesTable.bulkPut(records);
        }
        await tavernSessionsTable.update(id, { updatedAt: timestamp });
    });
    return records;
}

export async function appendTavernAssistantChatMessages(
    sessionId: string,
    messages: TavernAppendAssistantChatMessageInput[],
): Promise<TavernAssistantChatMessageRecord[]> {
    return await replaceTavernAssistantChatMessages(sessionId, [], messages);
}

export async function appendTavernAssistantChatMessage(
    sessionId: string,
    message: TavernAppendAssistantChatMessageInput,
): Promise<TavernAssistantChatMessageRecord> {
    const [record] = await appendTavernAssistantChatMessages(sessionId, [message]);
    if (!record) {throw new Error('assistant_chat_message_append_failed');}
    return record;
}

export async function updateTavernAssistantChatMessage(
    sessionId = '',
    order = -1,
    patch: Partial<Pick<TavernAssistantChatMessageRecord, 'content' | 'error' | 'provider' | 'model' | 'finishReason' | 'thoughts' | 'providerPayload' | 'toolCalls' | 'toolCallId' | 'toolName' | 'toolDisplay'>> & {
        clearProtocolPayload?: boolean;
    },
): Promise<TavernAssistantChatMessageRecord | null> {
    const id = String(sessionId || '').trim();
    const messageOrder = Number(order);
    if (!id || !Number.isInteger(messageOrder) || messageOrder < 0) {return null;}
    const existing = await tavernAssistantChatMessagesTable.get([id, messageOrder]);
    if (!existing) {return null;}
    const timestamp = now();
    const update: Partial<TavernAssistantChatMessageRecord> = {
        updatedAt: timestamp,
    };
    if ('content' in patch) {update.content = String(patch.content || '');}
    if ('error' in patch) {update.error = patch.error === true;}
    if ('provider' in patch) {update.provider = String(patch.provider || '');}
    if ('model' in patch) {update.model = String(patch.model || '');}
    if ('finishReason' in patch) {update.finishReason = String(patch.finishReason || '');}
    if ('thoughts' in patch) {update.thoughts = cloneSerializable(patch.thoughts, undefined);}
    if ('providerPayload' in patch) {update.providerPayload = cloneSerializable(patch.providerPayload, undefined);}
    if ('toolCalls' in patch) {update.toolCalls = normalizeAssistantChatToolCalls(patch);}
    if ('toolCallId' in patch) {update.toolCallId = String(patch.toolCallId || '').trim();}
    if ('toolName' in patch) {update.toolName = String(patch.toolName || '').trim();}
    if ('toolDisplay' in patch) {update.toolDisplay = cloneSerializable(patch.toolDisplay, undefined);}
    if (patch.clearProtocolPayload === true) {
        update.providerPayload = undefined;
        update.toolCalls = undefined;
        update.toolCallId = undefined;
        update.toolName = undefined;
        update.toolDisplay = undefined;
    }
    await tavernAssistantChatMessagesTable.update([id, messageOrder], update);
    await tavernSessionsTable.update(id, { updatedAt: timestamp });
    return await tavernAssistantChatMessagesTable.get([id, messageOrder]) || null;
}

export async function deleteTavernAssistantChatMessages(sessionId = '', orders: number[] = []): Promise<number> {
    const id = String(sessionId || '').trim();
    const uniqueOrders = [...new Set((Array.isArray(orders) ? orders : [])
        .map((order) => Number(order))
        .filter((order) => Number.isInteger(order) && order >= 0))];
    if (!id || !uniqueOrders.length) {return 0;}
    const existingKeys: Array<[string, number]> = [];
    await Promise.all(uniqueOrders.map(async (order) => {
        const existing = await tavernAssistantChatMessagesTable.get([id, order]);
        if (existing) {existingKeys.push([id, order]);}
    }));
    if (!existingKeys.length) {return 0;}
    await db.transaction('rw', tavernAssistantChatMessagesTable, tavernSessionsTable, async () => {
        await tavernAssistantChatMessagesTable.bulkDelete(existingKeys);
        await tavernSessionsTable.update(id, { updatedAt: now() });
    });
    return existingKeys.length;
}

export async function listTavernAssistantChatMessages(sessionId = ''): Promise<TavernAssistantChatMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    return tavernAssistantChatMessagesTable.where('sessionId').equals(id).sortBy('order');
}

export async function clearTavernAssistantChatMessages(sessionId = ''): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    return await db.transaction('rw', tavernAssistantChatMessagesTable, tavernSessionsTable, async () => {
        const messages = await tavernAssistantChatMessagesTable.where('sessionId').equals(id).toArray();
        if (!messages.length) {return 0;}
        await tavernAssistantChatMessagesTable.bulkDelete(messages.map((message) => [message.sessionId, message.order]));
        await tavernSessionsTable.update(id, { updatedAt: now() });
        return messages.length;
    });
}

export async function createTavernManagerRun(input: Partial<TavernManagerRunRecord> = {}): Promise<TavernManagerRunRecord> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {throw new Error('manager_run_session_required');}
    const timestamp = now();
    const trigger = String(input.trigger || 'accepted_turn');
    if (!['accepted_turn', 'after_turn'].includes(trigger)) {
        throw new Error('maintenance_run_trigger_invalid');
    }
    const record: TavernManagerRunRecord = {
        id: String(input.id || createId('manager-run')),
        sessionId,
        turn: Math.max(0, Number(input.turn) || 0),
        userOrder: Number.isInteger(Number(input.userOrder)) ? Number(input.userOrder) : -1,
        assistantOrder: Number.isInteger(Number(input.assistantOrder)) ? Number(input.assistantOrder) : -1,
        confirmedByUserOrder: Number.isInteger(Number(input.confirmedByUserOrder)) ? Number(input.confirmedByUserOrder) : undefined,
        sourceUserCreatedAt: Number.isFinite(Number(input.sourceUserCreatedAt)) ? Number(input.sourceUserCreatedAt) : undefined,
        sourceAssistantCreatedAt: Number.isFinite(Number(input.sourceAssistantCreatedAt)) ? Number(input.sourceAssistantCreatedAt) : undefined,
        sourceUserRevision: Number.isFinite(Number(input.sourceUserRevision)) ? Number(input.sourceUserRevision) : undefined,
        sourceAssistantRevision: Number.isFinite(Number(input.sourceAssistantRevision)) ? Number(input.sourceAssistantRevision) : undefined,
        recoverySourceRunId: String(input.recoverySourceRunId || '').trim() || undefined,
        trigger: trigger as TavernMaintenanceRunTrigger,
        status: normalizeManagerRunStatus(input.status),
        provider: String(input.provider || ''),
        model: String(input.model || ''),
        inputSummary: String(input.inputSummary || ''),
        outputText: String(input.outputText || ''),
        parsedAction: String(input.parsedAction || ''),
        toolTrace: 'toolTrace' in input ? cloneSerializable(input.toolTrace, undefined) : undefined,
        changedFiles: normalizeStringArray(input.changedFiles, 100),
        changedStates: normalizeStringArray(input.changedStates, 100),
        changedTasks: normalizeStringArray(input.changedTasks, 100),
        leaseOwnerId: String(input.leaseOwnerId || ''),
        leaseExpiresAt: Math.max(0, Number(input.leaseExpiresAt) || 0),
        error: String(input.error || ''),
        createdAt: Number(input.createdAt) || timestamp,
        updatedAt: timestamp,
    };
    await tavernManagerRunsTable.put(record);
    await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
    return record;
}

export async function createRecoveredAcceptedTurnManagerRun(
    sourceManagerRunId = '',
): Promise<{ run: TavernManagerRunRecord; created: boolean } | null> {
    const sourceId = String(sourceManagerRunId || '').trim();
    if (!sourceId) {return null;}
    return await db.transaction('rw', tavernManagerRunsTable, tavernSessionsTable, async () => {
        const source = await tavernManagerRunsTable.get(sourceId);
        if (!source || source.trigger !== 'accepted_turn') {return null;}
        const runs = await tavernManagerRunsTable.where('sessionId').equals(source.sessionId).toArray();
        const existing = runs.find((run) => String(run.recoverySourceRunId || '').trim() === source.id);
        if (existing) {return { run: existing, created: false };}
        if (source.status !== 'failed' || source.error !== 'manager_worker_interrupted') {return null;}
        const timestamp = now();
        const run: TavernManagerRunRecord = {
            id: createId('manager-run'),
            sessionId: source.sessionId,
            turn: source.turn,
            userOrder: source.userOrder,
            assistantOrder: source.assistantOrder,
            confirmedByUserOrder: source.confirmedByUserOrder,
            sourceUserCreatedAt: source.sourceUserCreatedAt,
            sourceAssistantCreatedAt: source.sourceAssistantCreatedAt,
            sourceUserRevision: source.sourceUserRevision,
            sourceAssistantRevision: source.sourceAssistantRevision,
            recoverySourceRunId: source.id,
            trigger: 'accepted_turn',
            status: 'queued',
            provider: '',
            model: '',
            inputSummary: String(source.inputSummary || ''),
            outputText: '上次后台进程中断，任务已恢复队列。',
            parsedAction: '',
            changedFiles: [],
            changedStates: [],
            changedTasks: [],
            leaseOwnerId: '',
            leaseExpiresAt: 0,
            error: '',
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        await tavernManagerRunsTable.put(run);
        await tavernSessionsTable.update(source.sessionId, { updatedAt: timestamp });
        return { run, created: true };
    });
}

export async function updateTavernManagerRun(
    managerRunId = '',
    patch: Partial<TavernManagerRunRecord> = {},
): Promise<TavernManagerRunRecord | null> {
    const id = String(managerRunId || '').trim();
    if (!id) {return null;}
    const existing = await tavernManagerRunsTable.get(id);
    if (!existing) {return null;}
    const update: Partial<TavernManagerRunRecord> = {
        updatedAt: now(),
    };
    if ('status' in patch) {update.status = normalizeManagerRunStatus(patch.status);}
    ['provider', 'model', 'inputSummary', 'outputText', 'parsedAction', 'error'].forEach((key) => {
        if (key in patch) {
            (update as Record<string, unknown>)[key] = String((patch as Record<string, unknown>)[key] || '');
        }
    });
    if ('trigger' in patch) {
        const trigger = String(patch.trigger || '');
        if (!['accepted_turn', 'after_turn'].includes(trigger)) {
            throw new Error('maintenance_run_trigger_invalid');
        }
        update.trigger = trigger as TavernMaintenanceRunTrigger;
    }
    if ('toolTrace' in patch) {update.toolTrace = cloneSerializable(patch.toolTrace, undefined);}
    if ('changedFiles' in patch) {update.changedFiles = normalizeStringArray(patch.changedFiles, 100);}
    if ('changedStates' in patch) {update.changedStates = normalizeStringArray(patch.changedStates, 100);}
    if ('changedTasks' in patch) {update.changedTasks = normalizeStringArray(patch.changedTasks, 100);}
    if ('turn' in patch) {update.turn = Math.max(0, Number(patch.turn) || 0);}
    if ('userOrder' in patch) {update.userOrder = Number(patch.userOrder);}
    if ('assistantOrder' in patch) {update.assistantOrder = Number(patch.assistantOrder);}
    if ('confirmedByUserOrder' in patch) {update.confirmedByUserOrder = Number(patch.confirmedByUserOrder);}
    if ('sourceUserCreatedAt' in patch) {update.sourceUserCreatedAt = Number(patch.sourceUserCreatedAt);}
    if ('sourceAssistantCreatedAt' in patch) {update.sourceAssistantCreatedAt = Number(patch.sourceAssistantCreatedAt);}
    if ('sourceUserRevision' in patch) {update.sourceUserRevision = Number(patch.sourceUserRevision);}
    if ('sourceAssistantRevision' in patch) {update.sourceAssistantRevision = Number(patch.sourceAssistantRevision);}
    if ('leaseOwnerId' in patch) {update.leaseOwnerId = String(patch.leaseOwnerId || '');}
    if ('leaseExpiresAt' in patch) {update.leaseExpiresAt = Math.max(0, Number(patch.leaseExpiresAt) || 0);}
    await tavernManagerRunsTable.update(id, update);
    await tavernSessionsTable.update(existing.sessionId, { updatedAt: now() });
    return await tavernManagerRunsTable.get(id) || null;
}

export async function touchRunningTavernManagerRun(managerRunId = '', options: {
    leaseOwnerId?: string;
    leaseDurationMs?: number;
} = {}): Promise<TavernManagerRunRecord | null> {
    const id = String(managerRunId || '').trim();
    if (!id) {return null;}
    const existing = await tavernManagerRunsTable.get(id);
    const leaseOwnerId = String(options.leaseOwnerId || '').trim();
    if (!existing || existing.status !== 'running') {
        return existing || null;
    }
    if (existing.leaseOwnerId && existing.leaseOwnerId !== leaseOwnerId) {return existing;}
    const timestamp = now();
    const leaseDurationMs = Math.max(5000, Math.floor(Number(options.leaseDurationMs) || 30000));
    await tavernManagerRunsTable.update(id, {
        ...(existing.leaseOwnerId ? { leaseExpiresAt: timestamp + leaseDurationMs } : {}),
        updatedAt: timestamp,
    });
    await tavernSessionsTable.update(existing.sessionId, { updatedAt: timestamp });
    return await tavernManagerRunsTable.get(id) || null;
}

export async function listTavernManagerRuns(sessionId = '', options: {
    limit?: number;
} = {}): Promise<TavernManagerRunRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const rows = (await tavernManagerRunsTable.where('sessionId').equals(id).sortBy('updatedAt'))
        .filter((run) => ['accepted_turn', 'after_turn'].includes(String(run.trigger || '')));
    const limit = Math.max(0, Number(options.limit) || 0);
    if (!limit) {return rows.reverse();}
    const selected = new Map<string, TavernManagerRunRecord>();
    rows.slice(-limit).forEach((run) => selected.set(run.id, run));
    rows.filter((run) => ['queued', 'running'].includes(run.status)).forEach((run) => selected.set(run.id, run));
    return [...selected.values()].sort((left, right) => Number(right.updatedAt) - Number(left.updatedAt));
}

export function hashTavernMemoryRecord(file?: Pick<TavernMemoryFileRecord, 'content' | 'status' | 'source' | 'staleFromOrder'> | null): string {
    const text = JSON.stringify({
        content: String(file?.content || ''),
        status: String(file?.status || ''),
        source: String(file?.source || ''),
        staleFromOrder: Number.isFinite(Number(file?.staleFromOrder)) ? Number(file?.staleFromOrder) : null,
    });
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(16);
}

function hashSerializableState(value: unknown): string {
    const text = JSON.stringify(value ?? null);
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(16);
}

export function hashTavernStateDocument(document?: TavernStructuredStateDocumentRecord | null): string {
    return hashSerializableState(document ? {
        docType: document.docType,
        docId: document.docId,
        title: String(document.title || ''),
        revision: Number(document.revision) || 0,
        data: document.data ?? null,
        digest: String(document.digest || ''),
        status: String(document.status || ''),
        source: String(document.source || ''),
        staleFromOrder: Number.isFinite(Number(document.staleFromOrder)) ? Number(document.staleFromOrder) : null,
    } : null);
}

function mergeRollbackError(existing = '', conflicts: string[] = []): string {
    const current = String(existing || '').trim();
    if (!conflicts.length) {return current;}
    const prefix = 'rollback_conflict:';
    const currentConflicts = current.startsWith(prefix)
        ? current.slice(prefix.length).split(',').map((item) => item.trim()).filter(Boolean)
        : [];
    const merged = [...new Set([...currentConflicts, ...conflicts])];
    return `${prefix}${merged.join(',')}`;
}

export async function listTavernStructuredStateDocuments(sessionId = '', options: {
    docType?: TavernStructuredStateDocType | string;
    includeStale?: boolean;
} = {}): Promise<TavernStructuredStateDocumentRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const rows = await tavernStateDocumentsTable.where('sessionId').equals(id).sortBy('updatedAt');
    const type = String(options.docType || '').trim();
    return rows
        .filter((row) => !type || row.docType === type)
        .filter((row) => options.includeStale || row.status !== 'stale');
}

export async function getTavernStructuredStateDocument(
    sessionId = '',
    docType: TavernStructuredStateDocType | string = 'tavern.map',
    docId = 'main',
): Promise<TavernStructuredStateDocumentRecord | null> {
    const id = String(sessionId || '').trim();
    const type = String(docType || '').trim() as TavernStructuredStateDocType;
    const documentId = String(docId || 'main').trim() || 'main';
    if (!id || !type || !documentId) {return null;}
    return await tavernStateDocumentsTable.get([id, type, documentId]) || null;
}

export async function ensureSeedStructuredStateDocument(
    sessionId = '',
    options: {
        touchSession?: boolean;
    } = {},
): Promise<TavernStructuredStateDocumentRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    return await db.transaction('rw', tavernStateDocumentsTable, tavernSessionsTable, async () => {
        const timestamp = now();
        const existingMap = await tavernStateDocumentsTable.get([id, TAVERN_MAP_DOC_TYPE, TAVERN_MAP_DOC_ID]);
        const existingAtlas = await tavernStateDocumentsTable.get([id, TAVERN_ATLAS_DOC_TYPE, TAVERN_ATLAS_DOC_ID]);
        const mapRecord: TavernStructuredStateDocumentRecord = existingMap || {
            sessionId: id,
            docType: TAVERN_MAP_DOC_TYPE,
            docId: TAVERN_MAP_DOC_ID,
            title: '地图',
            revision: 0,
            data: createSeedMapDocument(),
            digest: '',
            status: 'active',
            source: 'system-seed',
            staleFromOrder: undefined,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        const atlasRecord: TavernStructuredStateDocumentRecord = existingAtlas || {
            sessionId: id,
            docType: TAVERN_ATLAS_DOC_TYPE,
            docId: TAVERN_ATLAS_DOC_ID,
            title: '世界图',
            revision: 0,
            data: createSeedAtlasDocument(),
            digest: '',
            status: 'active',
            source: 'system-seed',
            staleFromOrder: undefined,
            createdAt: timestamp,
            updatedAt: timestamp,
        };
        if (!existingMap) {await tavernStateDocumentsTable.put(mapRecord);}
        if (!existingAtlas) {await tavernStateDocumentsTable.put(atlasRecord);}
        if (options.touchSession !== false) {
            await tavernSessionsTable.update(id, { updatedAt: timestamp });
        }
        return mapRecord;
    });
}

export async function putTavernStructuredStateDocument(
    document: TavernStructuredStateDocumentRecord,
): Promise<TavernStructuredStateDocumentRecord> {
    const timestamp = now();
    const record: TavernStructuredStateDocumentRecord = {
        ...cloneSerializable(document, document),
        sessionId: String(document.sessionId || '').trim(),
        docType: String(document.docType || 'tavern.map') as TavernStructuredStateDocType,
        docId: String(document.docId || 'main').trim() || 'main',
        title: String(document.title || ''),
        revision: Math.max(0, Number(document.revision) || 0),
        digest: String(document.digest || ''),
        status: document.status === 'stale' ? 'stale' : 'active',
        createdAt: Number(document.createdAt) || timestamp,
        updatedAt: timestamp,
    };
    if (!record.sessionId) {throw new Error('state_session_required');}
    await tavernStateDocumentsTable.put(record);
    await tavernSessionsTable.update(record.sessionId, { updatedAt: timestamp });
    return record;
}

export async function appendTavernStructuredStatePatch(input: Partial<TavernStructuredStatePatchRecord> = {}): Promise<TavernStructuredStatePatchRecord> {
    const sessionId = String(input.sessionId || '').trim();
    const docType = String(input.docType || 'tavern.map') as TavernStructuredStateDocType;
    const docId = String(input.docId || 'main').trim() || 'main';
    if (!sessionId) {throw new Error('state_patch_session_required');}
    const timestamp = now();
    const record: TavernStructuredStatePatchRecord = {
        id: String(input.id || createId('state-patch')),
        sessionId,
        docType,
        docId,
        revision: Math.max(0, Number(input.revision) || 0),
        status: input.status === 'rolled_back' ? 'rolled_back' : 'active',
        managerRunId: String(input.managerRunId || ''),
        sourceUserOrder: Number.isFinite(Number(input.sourceUserOrder)) ? Number(input.sourceUserOrder) : undefined,
        sourceAssistantOrder: Number.isFinite(Number(input.sourceAssistantOrder)) ? Number(input.sourceAssistantOrder) : undefined,
        source: String(input.source || ''),
        summary: String(input.summary || ''),
        ops: Array.isArray(input.ops) ? cloneSerializable(input.ops, []) : [],
        changedIds: normalizeStringArray(input.changedIds, 200),
        removedElements: Array.isArray(input.removedElements) ? cloneSerializable(input.removedElements, []) : [],
        beforeData: 'beforeData' in input ? cloneSerializable(input.beforeData, undefined) : undefined,
        afterData: 'afterData' in input ? cloneSerializable(input.afterData, undefined) : undefined,
        createdAt: Number(input.createdAt) || timestamp,
        updatedAt: timestamp,
    };
    await tavernStatePatchesTable.put(record);
    await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
    return record;
}

export async function listTavernStructuredStatePatches(input: {
    sessionId?: string;
    docType?: TavernStructuredStateDocType | string;
    docId?: string;
    limit?: number;
    includeRolledBack?: boolean;
} = {}): Promise<TavernStructuredStatePatchRecord[]> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return [];}
    const docType = String(input.docType || '').trim();
    const docId = String(input.docId || '').trim();
    const rows = await tavernStatePatchesTable.where('sessionId').equals(sessionId).sortBy('revision');
    const filtered = rows.filter((row) => (!docType || row.docType === docType)
        && (!docId || row.docId === docId)
        && (input.includeRolledBack || row.status !== 'rolled_back'));
    const limit = Math.max(0, Number(input.limit) || 0);
    return limit ? filtered.slice(-limit) : filtered;
}

export async function ensureTavernManagerMemorySnapshot(input: {
    managerRunId?: string;
    sessionId?: string;
    path?: string;
}): Promise<TavernManagerMemorySnapshotRecord | null> {
    const managerRunId = String(input.managerRunId || '').trim();
    const sessionId = String(input.sessionId || '').trim();
    const path = String(input.path || '').trim();
    if (!managerRunId || !sessionId || !path) {return null;}
    const existingSnapshot = await tavernManagerMemorySnapshotsTable.get([managerRunId, path]);
    if (existingSnapshot) {return existingSnapshot;}
    const timestamp = now();
    const beforeFile = await tavernMemoryFilesTable.get([sessionId, path]) || null;
    const snapshot: TavernManagerMemorySnapshotRecord = {
        managerRunId,
        sessionId,
        path,
        beforeExists: !!beforeFile,
        beforeFile: beforeFile ? cloneSerializable(beforeFile, undefined) : undefined,
        beforeHash: hashTavernMemoryRecord(beforeFile),
        afterHash: '',
        rollbackStatus: 'pending',
        error: '',
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    await tavernManagerMemorySnapshotsTable.put(snapshot);
    return snapshot;
}

export async function updateTavernManagerMemorySnapshotAfter(input: {
    managerRunId?: string;
    sessionId?: string;
    path?: string;
}): Promise<TavernManagerMemorySnapshotRecord | null> {
    const managerRunId = String(input.managerRunId || '').trim();
    const sessionId = String(input.sessionId || '').trim();
    const path = String(input.path || '').trim();
    if (!managerRunId || !sessionId || !path) {return null;}
    const snapshot = await ensureTavernManagerMemorySnapshot({ managerRunId, sessionId, path });
    if (!snapshot) {return null;}
    const afterFile = await tavernMemoryFilesTable.get([sessionId, path]) || null;
    await tavernManagerMemorySnapshotsTable.update([managerRunId, path], {
        afterHash: hashTavernMemoryRecord(afterFile),
        updatedAt: now(),
    });
    return await tavernManagerMemorySnapshotsTable.get([managerRunId, path]) || null;
}

export async function ensureTavernManagerStateSnapshot(input: {
    managerRunId?: string;
    sessionId?: string;
    docType?: TavernStructuredStateDocType | string;
    docId?: string;
}): Promise<TavernManagerStateSnapshotRecord | null> {
    const managerRunId = String(input.managerRunId || '').trim();
    const sessionId = String(input.sessionId || '').trim();
    const docType = String(input.docType || 'tavern.map') as TavernStructuredStateDocType;
    const docId = String(input.docId || 'main').trim() || 'main';
    if (!managerRunId || !sessionId || !docType || !docId) {return null;}
    const existingSnapshot = await tavernManagerStateSnapshotsTable.get([managerRunId, docType, docId]);
    if (existingSnapshot) {return existingSnapshot;}
    const timestamp = now();
    const beforeDocument = await getTavernStructuredStateDocument(sessionId, docType, docId);
    const snapshot: TavernManagerStateSnapshotRecord = {
        managerRunId,
        sessionId,
        docType,
        docId,
        beforeExists: !!beforeDocument,
        beforeDocument: beforeDocument ? cloneSerializable(beforeDocument, undefined) : undefined,
        beforeHash: hashTavernStateDocument(beforeDocument),
        afterHash: '',
        rollbackStatus: 'pending',
        error: '',
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    await tavernManagerStateSnapshotsTable.put(snapshot);
    return snapshot;
}

export async function updateTavernManagerStateSnapshotAfter(input: {
    managerRunId?: string;
    sessionId?: string;
    docType?: TavernStructuredStateDocType | string;
    docId?: string;
}): Promise<TavernManagerStateSnapshotRecord | null> {
    const managerRunId = String(input.managerRunId || '').trim();
    const sessionId = String(input.sessionId || '').trim();
    const docType = String(input.docType || 'tavern.map') as TavernStructuredStateDocType;
    const docId = String(input.docId || 'main').trim() || 'main';
    if (!managerRunId || !sessionId || !docType || !docId) {return null;}
    const snapshot = await ensureTavernManagerStateSnapshot({ managerRunId, sessionId, docType, docId });
    if (!snapshot) {return null;}
    const afterDocument = await getTavernStructuredStateDocument(sessionId, docType, docId);
    await tavernManagerStateSnapshotsTable.update([managerRunId, docType, docId], {
        afterHash: hashTavernStateDocument(afterDocument),
        updatedAt: now(),
    });
    return await tavernManagerStateSnapshotsTable.get([managerRunId, docType, docId]) || null;
}

export async function listTavernManagerMemorySnapshots(managerRunId = ''): Promise<TavernManagerMemorySnapshotRecord[]> {
    const id = String(managerRunId || '').trim();
    if (!id) {return [];}
    return await tavernManagerMemorySnapshotsTable.where('managerRunId').equals(id).sortBy('updatedAt');
}

export async function listTavernManagerStateSnapshots(managerRunId = ''): Promise<TavernManagerStateSnapshotRecord[]> {
    const id = String(managerRunId || '').trim();
    if (!id) {return [];}
    return await tavernManagerStateSnapshotsTable.where('managerRunId').equals(id).sortBy('updatedAt');
}

export async function clearTavernManagerRunSnapshots(managerRunId = ''): Promise<void> {
    const id = String(managerRunId || '').trim();
    if (!id) {return;}
    const [memorySnapshots, stateSnapshots] = await Promise.all([
        listTavernManagerMemorySnapshots(id),
        listTavernManagerStateSnapshots(id),
    ]);
    await db.transaction('rw', tavernManagerMemorySnapshotsTable, tavernManagerStateSnapshotsTable, tavernManagerTaskSnapshotsTable, async () => {
        if (memorySnapshots.length) {
            await tavernManagerMemorySnapshotsTable.bulkDelete(memorySnapshots.map((snapshot) => [snapshot.managerRunId, snapshot.path]));
        }
        if (stateSnapshots.length) {
            await tavernManagerStateSnapshotsTable.bulkDelete(stateSnapshots.map((snapshot) => [snapshot.managerRunId, snapshot.docType, snapshot.docId]));
        }
        await tavernManagerTaskSnapshotsTable.delete(id);
    });
}

export async function rollbackManagerRunMemoryWrites(managerRunId = ''): Promise<{
    rolledBack: number;
    conflicts: string[];
    skipped: number;
}> {
    const id = String(managerRunId || '').trim();
    if (!id) {return { rolledBack: 0, conflicts: [], skipped: 0 };}
    const run = await tavernManagerRunsTable.get(id);
    if (!run) {return { rolledBack: 0, conflicts: [], skipped: 0 };}
    const snapshots = (await listTavernManagerMemorySnapshots(id)).reverse();
    let rolledBack = 0;
    let skipped = 0;
    const conflicts: string[] = [];
    for (const snapshot of snapshots) {
        if (snapshot.rollbackStatus === 'rolled_back' || snapshot.rollbackStatus === 'skipped') {
            skipped += 1;
            continue;
        }
        if (snapshot.rollbackStatus === 'conflict') {
            conflicts.push(snapshot.path);
            skipped += 1;
            continue;
        }
        const current = await tavernMemoryFilesTable.get([snapshot.sessionId, snapshot.path]) || null;
        if (!snapshot.afterHash) {
            skipped += 1;
            await tavernManagerMemorySnapshotsTable.update([snapshot.managerRunId, snapshot.path], {
                rollbackStatus: 'skipped',
                error: 'snapshot_after_hash_missing',
                updatedAt: now(),
            });
            continue;
        }
        if (hashTavernMemoryRecord(current) !== snapshot.afterHash) {
            conflicts.push(snapshot.path);
            await tavernManagerMemorySnapshotsTable.update([snapshot.managerRunId, snapshot.path], {
                rollbackStatus: 'conflict',
                error: 'rollback_conflict_current_file_changed',
                updatedAt: now(),
            });
            continue;
        }
        if (snapshot.beforeExists && snapshot.beforeFile) {
            await tavernMemoryFilesTable.put(cloneSerializable(snapshot.beforeFile, snapshot.beforeFile));
        } else {
            await tavernMemoryFilesTable.delete([snapshot.sessionId, snapshot.path]);
        }
        rolledBack += 1;
        await tavernManagerMemorySnapshotsTable.update([snapshot.managerRunId, snapshot.path], {
            rollbackStatus: 'rolled_back',
            error: '',
            updatedAt: now(),
        });
    }
    const existingIndex = await tavernMemoryIndexesTable.get([run.sessionId, 'markdown-derived']);
    await tavernMemoryIndexesTable.put({
        sessionId: run.sessionId,
        kind: 'markdown-derived',
        status: 'stale',
        error: conflicts.length ? `rollback_conflict:${conflicts.join(',')}` : '',
        sourceFingerprint: '',
        derivedAt: now(),
        updatedAt: now(),
        files: Array.isArray(existingIndex?.files) ? existingIndex.files : [],
    });
    await updateTavernManagerRun(id, {
        status: 'rolled_back',
        error: mergeRollbackError(run.error, conflicts),
    });
    await tavernSessionsTable.update(run.sessionId, { updatedAt: now() });
    return { rolledBack, conflicts, skipped };
}

export async function rollbackManagerRunStateWrites(managerRunId = ''): Promise<{
    rolledBack: number;
    conflicts: string[];
    skipped: number;
}> {
    const id = String(managerRunId || '').trim();
    if (!id) {return { rolledBack: 0, conflicts: [], skipped: 0 };}
    return { rolledBack: 0, conflicts: [], skipped: 0 };
}

export async function rollbackManagerRunsForMessageRange(sessionId = '', fromOrder = 0): Promise<{
    runIds: string[];
    rolledBack: number;
    conflicts: string[];
    skipped: number;
}> {
    const id = String(sessionId || '').trim();
    const order = Number(fromOrder);
    if (!id || !Number.isFinite(order)) {
        return { runIds: [], rolledBack: 0, conflicts: [], skipped: 0 };
    }
    const runs = (await tavernManagerRunsTable.where('sessionId').equals(id).toArray())
        .filter((run) => ['accepted_turn', 'after_turn'].includes(run.trigger)
            && (Number(run.userOrder) >= order || Number(run.assistantOrder) >= order))
        .sort((left, right) => right.updatedAt - left.updatedAt);
    let rolledBack = 0;
    let skipped = 0;
    const conflicts: string[] = [];
    for (const run of runs) {
        const snapshots = await listTavernManagerMemorySnapshots(run.id);
        const hasWrittenSnapshot = snapshots.some((snapshot) => String(snapshot.afterHash || '').trim());
        if (hasWrittenSnapshot) {
            const result = await rollbackManagerRunMemoryWrites(run.id);
            rolledBack += result.rolledBack;
            skipped += result.skipped;
            conflicts.push(...result.conflicts);
            continue;
        }
        await updateTavernManagerRun(run.id, {
            status: ['queued', 'running'].includes(run.status) ? 'cancelled' : 'superseded',
            error: 'manager_source_messages_superseded',
        });
    }
    return {
        runIds: runs.map((run) => run.id),
        rolledBack,
        conflicts,
        skipped,
    };
}

export async function rollbackManagerStateRunsForMessageRange(sessionId = '', fromOrder = 0): Promise<{
    runIds: string[];
    rolledBack: number;
    conflicts: string[];
    skipped: number;
}> {
    void sessionId;
    void fromOrder;
    return { runIds: [], rolledBack: 0, conflicts: [], skipped: 0 };
}

export function createUserPresetFromBuiltIn(name = '酒馆聊天预设'): TavernChatPromptPresetBundle {
    return normalizeTavernChatPromptPresetBundle({
        ...createFallbackTavernChatPromptPresetBundle(),
        name: normalizePresetName(name),
    });
}

export async function saveTavernPreset(preset: TavernChatPromptPresetBundle, options: {
    sourcePresetId?: string;
    isBuiltIn?: boolean;
} = {}): Promise<TavernPresetRecord> {
    const timestamp = now();
    const normalizedPreset = normalizeTavernPresetSchema(cloneSerializable({
        ...preset,
        id: FALLBACK_TAVERN_CHAT_PRESET_ID,
        name: normalizePresetName(preset.name),
    }, createFallbackTavernChatPromptPresetBundle()));
    return {
        id: FALLBACK_TAVERN_CHAT_PRESET_ID,
        name: normalizePresetName(normalizedPreset.name),
        description: String(normalizedPreset.description || ''),
        version: String(normalizedPreset.version || ''),
        sourcePresetId: String(options.sourcePresetId || FALLBACK_TAVERN_CHAT_PRESET_ID),
        isBuiltIn: options.isBuiltIn === true,
        createdAt: timestamp,
        updatedAt: timestamp,
        preset: normalizedPreset,
    };
}

export async function listUserTavernPresets(): Promise<TavernPresetRecord[]> {
    return [];
}

export async function getActiveTavernPresetId(): Promise<string> {
    return FALLBACK_TAVERN_CHAT_PRESET_ID;
}

export async function setActiveTavernPresetId(presetId = FALLBACK_TAVERN_CHAT_PRESET_ID): Promise<string> {
    void presetId;
    await tavernMetaTable.delete('activePresetId');
    return FALLBACK_TAVERN_CHAT_PRESET_ID;
}

export async function loadActiveTavernPreset(): Promise<TavernChatPromptPresetBundle> {
    return createFallbackTavernChatPromptPresetBundle();
}

export async function deriveAndActivateDefaultTavernPreset(name = '酒馆聊天预设'): Promise<TavernPresetRecord> {
    const preset = createUserPresetFromBuiltIn(name);
    return saveTavernPreset(preset, { sourcePresetId: FALLBACK_TAVERN_CHAT_PRESET_ID });
}

export async function getActiveTavernAssistantPresetId(): Promise<string> {
    const entry = await tavernMetaTable.get('activeAssistantPresetId');
    return String(entry?.value || DEFAULT_TAVERN_ASSISTANT_PRESET_ID).trim() || DEFAULT_TAVERN_ASSISTANT_PRESET_ID;
}

export async function setActiveTavernAssistantPresetId(
    presetId = DEFAULT_TAVERN_ASSISTANT_PRESET_ID,
): Promise<string> {
    const value = String(presetId || DEFAULT_TAVERN_ASSISTANT_PRESET_ID).trim()
        || DEFAULT_TAVERN_ASSISTANT_PRESET_ID;
    await tavernMetaTable.put({ key: 'activeAssistantPresetId', value, updatedAt: now() });
    return value;
}

export async function saveTavernAssistantPreset(
    preset: Partial<TavernAssistantPreset>,
    options: { isBuiltIn?: boolean } = {},
): Promise<TavernAssistantPresetRecord> {
    const timestamp = now();
    const id = String(preset.id || createId('assistant-preset'));
    const existing = await tavernAssistantPresetsTable.get(id);
    const normalized = normalizeTavernAssistantPreset({
        ...preset,
        id,
        updatedAt: timestamp,
    });
    const record: TavernAssistantPresetRecord = {
        id,
        name: normalized.name,
        description: normalized.description,
        version: options.isBuiltIn === true
            ? DEFAULT_TAVERN_ASSISTANT_PRESET_VERSION
            : String(existing?.version || ''),
        isBuiltIn: options.isBuiltIn === true,
        createdAt: Number(existing?.createdAt) || timestamp,
        updatedAt: timestamp,
        preset: normalized,
    };
    await tavernAssistantPresetsTable.put(record);
    return record;
}

export async function deleteTavernAssistantPreset(
    presetId = '',
): Promise<boolean> {
    const id = String(presetId || '').trim();
    if (!id || id === DEFAULT_TAVERN_ASSISTANT_PRESET_ID) {return false;}
    await tavernAssistantPresetsTable.delete(id);
    const activeId = await getActiveTavernAssistantPresetId();
    if (activeId === id) {
        await setActiveTavernAssistantPresetId(DEFAULT_TAVERN_ASSISTANT_PRESET_ID);
    }
    return true;
}

export async function ensureDefaultTavernAssistantPreset(): Promise<TavernAssistantPresetRecord> {
    const existing = await tavernAssistantPresetsTable.get(DEFAULT_TAVERN_ASSISTANT_PRESET_ID);
    if (existing?.version === DEFAULT_TAVERN_ASSISTANT_PRESET_VERSION) {return existing;}
    return saveTavernAssistantPreset(createDefaultTavernAssistantPreset(), { isBuiltIn: true });
}

export async function listTavernAssistantPresets(): Promise<TavernAssistantPresetRecord[]> {
    await ensureDefaultTavernAssistantPreset();
    return tavernAssistantPresetsTable.orderBy('updatedAt').reverse().toArray();
}

export async function loadActiveTavernAssistantPreset(): Promise<TavernAssistantPreset> {
    await ensureDefaultTavernAssistantPreset();
    const activeId = await getActiveTavernAssistantPresetId();
    const record = await tavernAssistantPresetsTable.get(activeId)
        || await tavernAssistantPresetsTable.get(DEFAULT_TAVERN_ASSISTANT_PRESET_ID);
    return normalizeTavernAssistantPreset(record?.preset || createDefaultTavernAssistantPreset());
}

export default db;
