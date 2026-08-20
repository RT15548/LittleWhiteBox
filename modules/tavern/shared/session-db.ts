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
import type {
    TavernEconomyAccountRecord,
    TavernEconomyTransactionRecord,
} from './economy/economy-types';
import type {
    TavernTaskBoardRecord,
    TavernTaskVersionRecord,
} from './tasks/task-types';
import type {
    TavernShopStateVersionRecord,
} from './shop/shop-types';
import type {
    TavernBankActivityRecord,
    TavernBankStateVersionRecord,
} from './bank/bank-types';
import type {
    TavernPetActionRecord,
    TavernPetCompanionRecord,
    TavernPetJournalRecord,
} from './pet/pet-types';

type TavernDexieUpgradeCollection = {
    each: (callback: (record: Record<string, unknown>) => void) => Promise<unknown>;
    limit: (count: number) => TavernDexieUpgradeCollection;
    modify: (callback: (record: Record<string, unknown>) => void) => Promise<unknown>;
    toArray: () => Promise<Record<string, unknown>[]>;
};

type TavernDexieUpgradeTable = {
    clear: () => Promise<unknown>;
    toArray: () => Promise<Record<string, unknown>[]>;
    bulkPut: (records: Record<string, unknown>[]) => Promise<unknown>;
    bulkDelete: (keys: unknown[]) => Promise<unknown>;
    where: (index: string) => {
        anyOf: (values: unknown[]) => { delete: () => Promise<unknown> };
        above: (value: unknown) => TavernDexieUpgradeCollection;
    };
    toCollection: () => TavernDexieUpgradeCollection;
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
    /** Monotonic identity of the main roleplay message timeline. */
    storyTimelineRevision: number;
    /** Monotonic task-board CAS epoch; never decremented by timeline rollback. */
    taskBoardEpoch: number;
    /** Physical line count of the derived chat/transcript.md source file. */
    transcriptLineCount?: number;
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

export interface TavernTurnStateSnapshot {
    turn: number;
    contextWindowStartOrder: number;
    worldEntryStates: Record<string, XbTavernWorldEntryState>;
    nativeWorldInfoTimedState: XbTavernNativeWorldInfoTimedState;
}

export type TavernManagerRunStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'superseded';

export interface TavernMessageRecord {
    messageId: string;
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
    runtimeStateSnapshot?: TavernTurnStateSnapshot;
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
    toolCalls?: Array<{ id?: string; name?: string; arguments?: string; providerId?: string }>;
    toolCallId?: string;
    toolName?: string;
    toolDisplay?: unknown;
}

/**
 * Lightweight, derived projection for assistant-chat UI lists. The full
 * protocol record remains in assistantChatMessages for exact provider replay.
 */
export interface TavernAssistantChatMessageSummaryRecord {
    sessionId: string;
    order: number;
    role: XbTavernMessage['role'];
    content: string;
    name?: string;
    error?: boolean;
    createdAt: number;
    updatedAt: number;
    finishReason?: string;
    thoughtCount?: number;
    toolCalls?: Array<{ id?: string; name?: string; providerId?: string }>;
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
    sourceUserMessageId?: string;
    sourceAssistantMessageId?: string;
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
export type TavernManagerStateSnapshotResourceType = TavernStructuredStateDocType | 'tavern.session';
export const TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_TYPE = 'tavern.session' as const;
export const TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_ID = 'activeMapDocId' as const;

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
    status: 'active' | 'rolled_back';
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
    docType: TavernManagerStateSnapshotResourceType;
    docId: string;
    beforeExists: boolean;
    beforeDocument?: TavernStructuredStateDocumentRecord;
    beforeValue?: unknown;
    beforeHash: string;
    afterHash?: string;
    afterValue?: unknown;
    rollbackStatus: TavernManagerStateSnapshotStatus;
    error?: string;
    createdAt: number;
    updatedAt: number;
}

export interface TavernStatusSnapshotRecord {
    sessionId: string;
    floor: number;
    document?: TavernStructuredStateDocumentRecord;
    digest: string;
    createdAt: number;
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
    runtimeStateSnapshot?: TavernTurnStateSnapshot;
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
    toolCalls?: Array<{ id?: string; name?: string; arguments?: string; providerId?: string }>;
    tool_calls?: Array<{
        id?: string;
        type?: string;
        providerToolCallId?: string;
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
    assistantChatMessageSummaries!: DexieTable<TavernAssistantChatMessageSummaryRecord>;
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
    statusSnapshots!: DexieTable<TavernStatusSnapshotRecord>;
    communicationContacts!: DexieTable<TavernCommunicationContactRecord>;
    communicationThreads!: DexieTable<TavernCommunicationThreadRecord>;
    communicationMessages!: DexieTable<TavernCommunicationMessageRecord>;
    communicationSnapshots!: DexieTable<TavernCommunicationSnapshotRecord>;
    economyAccounts!: DexieTable<TavernEconomyAccountRecord>;
    economyTransactions!: DexieTable<TavernEconomyTransactionRecord>;
    taskBoards!: DexieTable<TavernTaskBoardRecord>;
    taskVersions!: DexieTable<TavernTaskVersionRecord>;
    shopStateVersions!: DexieTable<TavernShopStateVersionRecord>;
    bankStateVersions!: DexieTable<TavernBankStateVersionRecord>;
    bankActivities!: DexieTable<TavernBankActivityRecord>;
    petCompanion!: DexieTable<TavernPetCompanionRecord>;
    petActions!: DexieTable<TavernPetActionRecord>;
    petJournal!: DexieTable<TavernPetJournalRecord>;

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
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
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
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
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
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
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
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
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
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
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
            const legacyRunIdSet = new Set(legacyRunIds);
            await transaction.table('statePatches').toCollection().modify((patch) => {
                if (legacyRunIdSet.has(String(patch.managerRunId || ''))) {
                    patch.managerRunId = '';
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
            statusSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
            communicationContacts: '[sessionId+id], sessionId, updatedAt',
            communicationThreads: '[sessionId+id], sessionId, contactId, updatedAt',
            communicationMessages: '[sessionId+threadId+sequence], sessionId, threadId, sequence, status, updatedAt',
            communicationSnapshots: '[sessionId+floor], sessionId, floor, createdAt',
        });
        version14.upgrade(async (transaction: TavernDexieUpgradeTransaction) => {
            await transaction.table('managerRuns').clear();
            await transaction.table('managerMemorySnapshots').clear();
            await transaction.table('managerStateSnapshots').clear();
            await transaction.table('statePatches').toCollection().modify((patch) => {
                patch.managerRunId = '';
            });
        });
        this.version(15).stores({
            managerRuns: 'id, sessionId, status, turn, assistantOrder, [sessionId+assistantOrder], updatedAt',
        });
        const version16 = this.version(16) as unknown as TavernDexieVersionWithUpgrade;
        version16.stores({
            messages: '[sessionId+order], sessionId, order',
            managerRuns: 'id, sessionId, status, turn, assistantOrder, [sessionId+assistantOrder], updatedAt',
        });
        version16.upgrade(async (transaction: TavernDexieUpgradeTransaction) => {
            const messagesTable = transaction.table('messages');
            const messages = await messagesTable.toArray();
            const messageIdsByKey = new Map<string, string>();
            for (const message of messages) {
                const messageId = String(message.messageId || '').trim() || createId('message');
                message.messageId = messageId;
                messageIdsByKey.set(`${String(message.sessionId || '')}\u0000${Number(message.order)}`, messageId);
            }
            if (messages.length) {await messagesTable.bulkPut(messages);}

            const managerRunsTable = transaction.table('managerRuns');
            const managerRuns = await managerRunsTable.toArray();
            for (const run of managerRuns) {
                const sessionId = String(run.sessionId || '');
                const userMessageId = messageIdsByKey.get(`${sessionId}\u0000${Number(run.userOrder)}`);
                const assistantMessageId = messageIdsByKey.get(`${sessionId}\u0000${Number(run.assistantOrder)}`);
                if (userMessageId) {run.sourceUserMessageId = userMessageId;}
                if (assistantMessageId) {run.sourceAssistantMessageId = assistantMessageId;}
            }
            if (managerRuns.length) {await managerRunsTable.bulkPut(managerRuns);}
        });
        const version17 = this.version(17) as unknown as TavernDexieVersionWithUpgrade;
        version17.stores({
            tasks: null,
            taskSnapshots: null,
            managerTaskSnapshots: null,
            taskFingerprintStates: null,
        });
        version17.upgrade(async (transaction: TavernDexieUpgradeTransaction) => {
            await transaction.table('sessions').toCollection().modify((session) => {
                const state = session.state && typeof session.state === 'object' && !Array.isArray(session.state)
                    ? session.state as Record<string, unknown>
                    : null;
                const contract = state?.contract && typeof state.contract === 'object' && !Array.isArray(state.contract)
                    ? state.contract as Record<string, unknown>
                    : null;
                if (contract) {delete contract.questOrchestration;}
            });
            await transaction.table('managerRuns').toCollection().modify((run) => {
                delete run.changedTasks;
                if (!Array.isArray(run.toolTrace)) {return;}
                const filteredTrace = run.toolTrace.filter((item) => {
                    const name = item && typeof item === 'object' && !Array.isArray(item)
                        ? String((item as Record<string, unknown>).name || '').trim()
                        : '';
                    return name !== 'EventInspect' && name !== 'EventPatch';
                });
                if (filteredTrace.length) {
                    run.toolTrace = filteredTrace;
                } else {
                    delete run.toolTrace;
                }
            });
        });
        this.version(18).stores({
            economyAccounts: '[sessionId+id], sessionId, kind, updatedAt',
            economyTransactions: '[sessionId+id], sessionId, &[sessionId+idempotencyKey], &[sessionId+reversalOfTransactionId], &[sessionId+ledgerOrder], [sessionId+anchorOrder+ledgerOrder], createdAt, anchorOrder, ledgerOrder',
        });
        this.version(19).stores({
            taskBoards: 'sessionId, generationId, revision, anchorOrder, generatedAt',
            taskVersions: '[sessionId+taskId+revision], sessionId, taskId, revision, &[sessionId+actionId], &[sessionId+taskId+currentMarker], [sessionId+currentMarker], [sessionId+status+currentMarker], [sessionId+anchorOrder], [sessionId+sourceBoardId+sourceListingId], updatedAt',
        });
        const version20 = this.version(20) as unknown as TavernDexieVersionWithUpgrade;
        version20.stores({
            taskBoards: 'sessionId, generationId, revision, epoch, anchorOrder, generatedAt',
            taskVersions: '[sessionId+taskId+revision], sessionId, taskId, revision, versionId, &[sessionId+actionId], &[sessionId+taskId+currentMarker], [sessionId+currentMarker], [sessionId+currentMarker+updatedAt], [sessionId+status+currentMarker], [sessionId+status+currentMarker+updatedAt], [sessionId+issuer.kind+currentMarker+updatedAt], [sessionId+issuer.kind+status+currentMarker+updatedAt], [sessionId+taskId+anchorOrder+revision], [sessionId+anchorOrder], [sessionId+sourceBoardId+sourceListingId], updatedAt',
        });
        version20.upgrade(async (transaction: TavernDexieUpgradeTransaction) => {
            const sessionsTable = transaction.table('sessions');
            const taskBoardsTable = transaction.table('taskBoards');
            const taskVersionsTable = transaction.table('taskVersions');
            const economyAccountsTable = transaction.table('economyAccounts');
            const economyTransactionsTable = transaction.table('economyTransactions');
            await taskBoardsTable.clear();
            await taskVersionsTable.clear();
            await economyAccountsTable.clear();
            await economyTransactionsTable.clear();
            await sessionsTable.toCollection().modify((session) => {
                session.taskBoardEpoch = 1;
            });
        });
        this.version(21).stores({
            managerRuns: 'id, sessionId, status, turn, assistantOrder, [sessionId+assistantOrder], [sessionId+updatedAt], [sessionId+status+updatedAt], updatedAt',
            statePatches: 'id, sessionId, docType, docId, managerRunId, revision, status, [sessionId+status+revision], [sessionId+docType+status+revision], [sessionId+docId+status+revision], [sessionId+docType+docId+status+revision], updatedAt',
        });
        this.version(22).stores({
            managerRuns: 'id, sessionId, status, turn, assistantOrder, [sessionId+assistantOrder], [sessionId+updatedAt], [sessionId+status+updatedAt], [sessionId+status+error+updatedAt], updatedAt',
        });
        this.version(23).stores({
            assistantChatMessageSummaries: '[sessionId+order], sessionId, order',
        });
        const version24 = this.version(24) as unknown as TavernDexieVersionWithUpgrade;
        version24.stores({});
        version24.upgrade(async (transaction: TavernDexieUpgradeTransaction) => {
            const sessionsTable = transaction.table('sessions');
            const messagesTable = transaction.table('messages');
            const assistantMessagesTable = transaction.table('assistantChatMessages');
            const summaryTable = transaction.table('assistantChatMessageSummaries');
            const transcriptLinesBySession = new Map<string, number>();
            await messagesTable.toCollection().each((message) => {
                const sessionId = String(message.sessionId || '').trim();
                if (!sessionId) {return;}
                transcriptLinesBySession.set(
                    sessionId,
                    (transcriptLinesBySession.get(sessionId) || 0)
                        + countTavernTranscriptMessageLines(message),
                );
            });
            await sessionsTable.toCollection().modify((session) => {
                session.transcriptLineCount = transcriptLinesBySession.get(String(session.id || '')) || 0;
            });
            await summaryTable.clear();
            const assistantSummaryBatchSize = 16;
            let afterKey: [string, number] | null = null;
            while (true) {
                const page = await (afterKey
                    ? assistantMessagesTable.where(':id').above(afterKey)
                    : assistantMessagesTable.toCollection())
                    .limit(assistantSummaryBatchSize)
                    .toArray() as unknown as TavernAssistantChatMessageRecord[];
                if (!page.length) {break;}
                await summaryTable.bulkPut(page
                    .map(buildTavernAssistantChatMessageSummary) as unknown as Record<string, unknown>[]);
                const last = page.at(-1);
                if (!last) {break;}
                afterKey = [String(last.sessionId || ''), Number(last.order)];
            }
        });
        this.version(25).stores({
            shopStateVersions: '[sessionId+revision], sessionId, versionId, &[sessionId+actionId], &[sessionId+currentMarker], [sessionId+anchorOrder], updatedAt',
        });
        this.version(26).stores({
            bankStateVersions: '[sessionId+revision], sessionId, versionId, &[sessionId+actionId], &[sessionId+currentMarker], [sessionId+anchorOrder], updatedAt',
            bankActivities: '[sessionId+id], sessionId, &[sessionId+sourceId], [sessionId+anchorOrder], [sessionId+createdAt]',
        });
        this.version(27).stores({
            petStateVersions: '[sessionId+revision], sessionId, versionId, &[sessionId+actionId], &[sessionId+currentMarker], [sessionId+anchorOrder], updatedAt',
            petActivities: '[sessionId+id], sessionId, &[sessionId+sourceActionId], [sessionId+turn], [sessionId+anchorOrder], [sessionId+createdAt]',
        });
        this.version(28).stores({
            petStateVersions: null,
            petActivities: null,
            petCompanion: 'id',
            petActions: 'id, &revision, sourceSessionId, [sourceSessionId+sourceTurn], [sourceSessionId+sourceAnchorOrder], [sourceSessionId+sourceAnchorOrder+createdAt+id], createdAt',
            petJournal: 'id, sourceActionId, sourceSessionId, [sourceSessionId+sourceAnchorOrder], [sourceSessionId+createdAt+id], petTurn, [createdAt+id]',
        });
        this.version(29).stores({
            petCompanion: null,
            petActions: null,
            petJournal: null,
        });
        this.version(30).stores({
            petCompanion: 'id',
            petActions: 'id, &revision, sourceSessionId, [sourceSessionId+sourceTurn], [sourceSessionId+sourceAnchorOrder], [sourceSessionId+sourceAnchorOrder+createdAt+id], createdAt',
            petJournal: 'id, &sourceActionId, sourceSessionId, [sourceSessionId+sourceAnchorOrder], [sourceSessionId+createdAt+id], petTurn, [petTurn+createdAt+id], [createdAt+id]',
        });
    }
}

const db = new TavernDatabase();

export const tavernSessionsTable = db.sessions;
export const tavernMessagesTable = db.messages;
export const tavernAssistantChatMessagesTable = db.assistantChatMessages;
export const tavernAssistantChatMessageSummariesTable = db.assistantChatMessageSummaries;
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
export const tavernStatusSnapshotsTable = db.statusSnapshots;
export const tavernCommunicationContactsTable = db.communicationContacts;
export const tavernCommunicationThreadsTable = db.communicationThreads;
export const tavernCommunicationMessagesTable = db.communicationMessages;
export const tavernCommunicationSnapshotsTable = db.communicationSnapshots;
export const tavernEconomyAccountsTable = db.economyAccounts;
export const tavernEconomyTransactionsTable = db.economyTransactions;
export const tavernTaskBoardsTable = db.taskBoards;
export const tavernTaskVersionsTable = db.taskVersions;
export const tavernShopStateVersionsTable = db.shopStateVersions;
export const tavernBankStateVersionsTable = db.bankStateVersions;
export const tavernBankActivitiesTable = db.bankActivities;
export const tavernPetCompanionTable = db.petCompanion;
export const tavernPetActionsTable = db.petActions;
export const tavernPetJournalTable = db.petJournal;

type DexieRangeCollection<T> = {
    reverse(): DexieRangeCollection<T>;
    filter(predicate: (value: T) => boolean): DexieRangeCollection<T>;
    offset(count: number): DexieRangeCollection<T>;
    limit(count: number): DexieRangeCollection<T>;
    first(): Promise<T | undefined>;
    count(): Promise<number>;
    each(callback: (value: T) => void): Promise<void>;
    toArray(): Promise<T[]>;
    primaryKeys(): Promise<unknown[]>;
};

type DexieRangeTable<T> = {
    where(index: string): {
        between(lower: unknown, upper: unknown, includeLower?: boolean, includeUpper?: boolean): DexieRangeCollection<T>;
        equals(value: unknown): DexieRangeCollection<T>;
    };
};

const DexieRangeKeys = Dexie as unknown as { minKey: unknown; maxKey: unknown };

function now(): number {
    return Date.now();
}

/**
 * chat/transcript.md renders a heading, normalized body lines, and one blank
 * separator for every roleplay message. Keep this alongside message writes so
 * the session aggregate remains the exact Read-tool line count.
 */
export function countTavernTranscriptMessageLines(message: { content?: unknown }): number {
    const body = String(message.content || '').replace(/\r\n?/g, '\n').trim();
    return 2 + body.split('\n').length;
}

function normalizedTavernTranscriptLineCount(value: unknown): number {
    return Math.max(0, Math.floor(Number(value) || 0));
}

function nextTavernTranscriptLineCount(session: Pick<TavernSessionRecord, 'transcriptLineCount'>, delta: number): number {
    return Math.max(0, normalizedTavernTranscriptLineCount(session.transcriptLineCount) + delta);
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

function normalizeAssistantChatToolCalls(input: TavernAppendAssistantChatMessageInput | Partial<TavernAssistantChatMessageRecord>): Array<{ id?: string; name?: string; arguments?: string; providerId?: string }> | undefined {
    const direct = Array.isArray(input.toolCalls) ? input.toolCalls : [];
    const provider = 'tool_calls' in input && Array.isArray(input.tool_calls) ? input.tool_calls : [];
    const seen = new Set<string>();
    const normalized = [
        ...direct.map((toolCall) => ({
            id: String(toolCall?.id || ''),
            name: String(toolCall?.name || ''),
            arguments: String(toolCall?.arguments || '{}'),
            ...(Object.prototype.hasOwnProperty.call(toolCall || {}, 'providerId')
                ? { providerId: String(toolCall?.providerId || '') }
                : {}),
        })),
        ...provider.map((toolCall) => ({
            id: String(toolCall?.id || ''),
            name: String(toolCall?.function?.name || ''),
            arguments: String(toolCall?.function?.arguments || '{}'),
            ...(Object.prototype.hasOwnProperty.call(toolCall || {}, 'providerToolCallId')
                ? { providerId: String(toolCall?.providerToolCallId || '') }
                : {}),
        })),
    ].filter((toolCall) => {
        if (!toolCall.name) {return false;}
        const key = `${toolCall.id}\u0000${toolCall.name}\u0000${toolCall.arguments}\u0000${Object.prototype.hasOwnProperty.call(toolCall, 'providerId') ? `provider:${toolCall.providerId}` : 'provider:absent'}`;
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
    const messageId = String(record.messageId || '').trim();
    if (!messageId) {throw new Error('message_id_missing');}
    return {
        ...record,
        messageId,
        runtimeEvents: normalizeMessageRuntimeEvents(record.runtimeEvents),
        runtimeStateSnapshot: record.runtimeStateSnapshot
            ? createTavernTurnStateSnapshot(record.runtimeStateSnapshot)
            : undefined,
        timelineRevision: Math.max(1, Math.floor(Number(record.timelineRevision) || 1)),
    };
}

function normalizeManagerRunStatus(value: unknown): TavernManagerRunStatus {
    return ['queued', 'running', 'completed', 'failed', 'cancelled', 'superseded'].includes(String(value || ''))
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

export function createTavernTurnStateSnapshot(value: unknown): TavernTurnStateSnapshot {
    const state = normalizeTavernSessionState(value);
    return {
        turn: Math.max(0, Math.floor(Number(state.turn) || 0)),
        contextWindowStartOrder: Math.max(0, Math.floor(Number(state.contextWindowStartOrder) || 0)),
        worldEntryStates: cloneSerializable(state.worldEntryStates || {}, {}),
        nativeWorldInfoTimedState: cloneSerializable(state.nativeWorldInfoTimedState || { sticky: {}, cooldown: {} }, { sticky: {}, cooldown: {} }),
    };
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
        storyTimelineRevision: Math.max(1, Math.floor(Number(input.storyTimelineRevision) || 1)),
        taskBoardEpoch: Math.max(1, Math.floor(Number(input.taskBoardEpoch) || 1)),
        transcriptLineCount: normalizedTavernTranscriptLineCount(input.transcriptLineCount),
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
                memoryFiles,
                memorySnapshots,
                memoryIndexes,
                stateDocuments,
                statePatches,
                statusSnapshots,
                communicationContacts,
                communicationThreads,
                communicationMessages,
                communicationSnapshots,
                economyAccounts,
                economyTransactions,
                taskBoard,
                taskVersions,
                shopVersions,
                bankVersions,
                bankActivities,
            ] = await Promise.all([
                tavernMessagesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernAssistantChatMessagesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernManagerRunsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernManagerMemorySnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernManagerStateSnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernMemoryFilesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernMemorySnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernMemoryIndexesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernStateDocumentsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernStatePatchesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernStatusSnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernCommunicationContactsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernCommunicationThreadsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernCommunicationMessagesTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernCommunicationSnapshotsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernEconomyAccountsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernEconomyTransactionsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernTaskBoardsTable.get(sourceSessionId),
                tavernTaskVersionsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernShopStateVersionsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernBankStateVersionsTable.where('sessionId').equals(sourceSessionId).toArray(),
                tavernBankActivitiesTable.where('sessionId').equals(sourceSessionId).toArray(),
            ]);
            assertTavernManagerSnapshotStable({
                runs: managerRuns,
                memorySnapshots: managerMemorySnapshots,
                stateSnapshots: managerStateSnapshots,
                statePatches,
            }, 'manager_branch_unaccepted_writes');
            const session: TavernSessionRecord = {
                ...cloneSerializable(sourceSession, sourceSession),
                id: nextSessionId,
                title: normalizeTitle(`${sourceSession.title || sourceSession.characterName || '未命名会话'} · 分支`),
                createdAt: timestamp,
                updatedAt: timestamp,
                storyTimelineRevision: 1,
                transcriptLineCount: normalizedTavernTranscriptLineCount(sourceSession.transcriptLineCount),
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
                assistantChatMessages.length ? tavernAssistantChatMessageSummariesTable.bulkPut(assistantChatMessages.map((message) => buildTavernAssistantChatMessageSummary({
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
                economyAccounts.length ? tavernEconomyAccountsTable.bulkPut(economyAccounts.map((account) => ({
                    ...cloneSerializable(account, account),
                    sessionId: nextSessionId,
                }))) : 0,
                economyTransactions.length ? tavernEconomyTransactionsTable.bulkPut(economyTransactions.map((transaction) => ({
                    ...cloneSerializable(transaction, transaction),
                    sessionId: nextSessionId,
                }))) : 0,
                taskBoard ? tavernTaskBoardsTable.put({
                    ...cloneSerializable(taskBoard, taskBoard),
                    sessionId: nextSessionId,
                }) : 0,
                taskVersions.length ? tavernTaskVersionsTable.bulkPut(taskVersions.map((version) => ({
                    ...cloneSerializable(version, version),
                    sessionId: nextSessionId,
                }))) : 0,
                shopVersions.length ? tavernShopStateVersionsTable.bulkPut(shopVersions.map((version) => ({
                    ...cloneSerializable(version, version),
                    sessionId: nextSessionId,
                }))) : 0,
                bankVersions.length ? tavernBankStateVersionsTable.bulkPut(bankVersions.map((version) => ({
                    ...cloneSerializable(version, version),
                    sessionId: nextSessionId,
                }))) : 0,
                bankActivities.length ? tavernBankActivitiesTable.bulkPut(bankActivities.map((activity) => ({
                    ...cloneSerializable(activity, activity),
                    sessionId: nextSessionId,
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
        tavernMetaTable,
        async () => {
            const [messages, assistantChatMessages, assistantChatSummaryKeys, runs, snapshots, stateSnapshots, files, memorySnapshots, indexes, stateDocuments, statePatches, statusSnapshots, communicationContacts, communicationThreads, communicationMessages, communicationSnapshots, economyAccounts, economyTransactions, taskBoard, taskVersions, shopVersions, bankVersions, bankActivities] = await Promise.all([
                tavernMessagesTable.where('sessionId').equals(id).toArray(),
                tavernAssistantChatMessagesTable.where('sessionId').equals(id).toArray(),
                (tavernAssistantChatMessageSummariesTable as unknown as DexieRangeTable<TavernAssistantChatMessageSummaryRecord>)
                    .where('sessionId').equals(id).primaryKeys(),
                tavernManagerRunsTable.where('sessionId').equals(id).toArray(),
                tavernManagerMemorySnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernManagerStateSnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernMemoryFilesTable.where('sessionId').equals(id).toArray(),
                tavernMemorySnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernMemoryIndexesTable.where('sessionId').equals(id).toArray(),
                tavernStateDocumentsTable.where('sessionId').equals(id).toArray(),
                tavernStatePatchesTable.where('sessionId').equals(id).toArray(),
                tavernStatusSnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernCommunicationContactsTable.where('sessionId').equals(id).toArray(),
                tavernCommunicationThreadsTable.where('sessionId').equals(id).toArray(),
                tavernCommunicationMessagesTable.where('sessionId').equals(id).toArray(),
                tavernCommunicationSnapshotsTable.where('sessionId').equals(id).toArray(),
                tavernEconomyAccountsTable.where('sessionId').equals(id).toArray(),
                tavernEconomyTransactionsTable.where('sessionId').equals(id).toArray(),
                tavernTaskBoardsTable.get(id),
                tavernTaskVersionsTable.where('sessionId').equals(id).toArray(),
                tavernShopStateVersionsTable.where('sessionId').equals(id).toArray(),
                tavernBankStateVersionsTable.where('sessionId').equals(id).toArray(),
                tavernBankActivitiesTable.where('sessionId').equals(id).toArray(),
            ]);
            const managerCandidate = await tavernManagerCandidatesTable.get(id);
            await Promise.all([
                messages.length ? tavernMessagesTable.bulkDelete(messages.map((message) => [message.sessionId, message.order])) : 0,
                assistantChatMessages.length ? tavernAssistantChatMessagesTable.bulkDelete(assistantChatMessages.map((message) => [message.sessionId, message.order])) : 0,
                assistantChatSummaryKeys.length ? tavernAssistantChatMessageSummariesTable.bulkDelete(assistantChatSummaryKeys) : 0,
                runs.length ? tavernManagerRunsTable.bulkDelete(runs.map((run) => run.id)) : 0,
                managerCandidate ? tavernManagerCandidatesTable.delete(id) : 0,
                snapshots.length ? tavernManagerMemorySnapshotsTable.bulkDelete(snapshots.map((snapshot) => [snapshot.managerRunId, snapshot.path])) : 0,
                stateSnapshots.length ? tavernManagerStateSnapshotsTable.bulkDelete(stateSnapshots.map((snapshot) => [snapshot.managerRunId, snapshot.docType, snapshot.docId])) : 0,
                files.length ? tavernMemoryFilesTable.bulkDelete(files.map((file) => [file.sessionId, file.path])) : 0,
                memorySnapshots.length ? tavernMemorySnapshotsTable.bulkDelete(memorySnapshots.map((snapshot) => [snapshot.sessionId, snapshot.floor])) : 0,
                indexes.length ? tavernMemoryIndexesTable.bulkDelete(indexes.map((index) => [index.sessionId, index.kind])) : 0,
                stateDocuments.length ? tavernStateDocumentsTable.bulkDelete(stateDocuments.map((document) => [document.sessionId, document.docType, document.docId])) : 0,
                statePatches.length ? tavernStatePatchesTable.bulkDelete(statePatches.map((patch) => patch.id)) : 0,
                statusSnapshots.length ? tavernStatusSnapshotsTable.bulkDelete(statusSnapshots.map((snapshot) => [snapshot.sessionId, snapshot.floor])) : 0,
                communicationContacts.length ? tavernCommunicationContactsTable.bulkDelete(communicationContacts.map((contact) => [contact.sessionId, contact.id])) : 0,
                communicationThreads.length ? tavernCommunicationThreadsTable.bulkDelete(communicationThreads.map((thread) => [thread.sessionId, thread.id])) : 0,
                communicationMessages.length ? tavernCommunicationMessagesTable.bulkDelete(communicationMessages.map((message) => [message.sessionId, message.threadId, message.sequence])) : 0,
                communicationSnapshots.length ? tavernCommunicationSnapshotsTable.bulkDelete(communicationSnapshots.map((snapshot) => [snapshot.sessionId, snapshot.floor])) : 0,
                economyAccounts.length ? tavernEconomyAccountsTable.bulkDelete(economyAccounts.map((account) => [account.sessionId, account.id])) : 0,
                economyTransactions.length ? tavernEconomyTransactionsTable.bulkDelete(economyTransactions.map((transaction) => [transaction.sessionId, transaction.id])) : 0,
                taskBoard ? tavernTaskBoardsTable.delete(id) : 0,
                taskVersions.length ? tavernTaskVersionsTable.bulkDelete(taskVersions.map((version) => [version.sessionId, version.taskId, version.revision])) : 0,
                shopVersions.length ? tavernShopStateVersionsTable.bulkDelete(shopVersions.map((version) => [version.sessionId, version.revision])) : 0,
                bankVersions.length ? tavernBankStateVersionsTable.bulkDelete(bankVersions.map((version) => [version.sessionId, version.revision])) : 0,
                bankActivities.length ? tavernBankActivitiesTable.bulkDelete(bankActivities.map((activity) => [activity.sessionId, activity.id])) : 0,
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
    const state = buildUpdatedTavernSessionState(existing, patch);
    await tavernSessionsTable.update(id, {
        state: cloneSerializable(state, {}),
        updatedAt: timestamp,
        buildSnapshot: cloneSerializable(patch.lastBuildSnapshot || existing.buildSnapshot, undefined),
    });
    return await getTavernSession(id);
}

function buildUpdatedTavernSessionState(
    existing: TavernSessionRecord,
    patch: Partial<TavernSessionState>,
): TavernSessionState {
    const currentState = normalizeTavernSessionState(existing.state || {});
    const patchState = normalizeTavernSessionState(patch);
    return {
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
}

export async function replaceTavernSessionState(sessionId = '', stateInput: Partial<TavernSessionState> = {}): Promise<TavernSessionRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const existing = await getTavernSession(id);
    if (!existing) {return null;}
    const timestamp = now();
    const state = buildReplacementTavernSessionState(existing, stateInput);
    await tavernSessionsTable.update(id, {
        state: cloneSerializable(state, {}),
        updatedAt: timestamp,
        buildSnapshot: cloneSerializable(state.lastBuildSnapshot || existing.buildSnapshot, undefined),
    });
    return await getTavernSession(id);
}

function buildReplacementTavernSessionState(
    existing: TavernSessionRecord,
    stateInput: Partial<TavernSessionState>,
): TavernSessionState {
    const currentState = normalizeTavernSessionState(existing.state || {});
    const normalized = normalizeTavernSessionState(stateInput);
    return {
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
        messageId: createId('message'),
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
        runtimeStateSnapshot: 'runtimeStateSnapshot' in message
            ? createTavernTurnStateSnapshot(message.runtimeStateSnapshot)
            : undefined,
        timelineRevision: 1,
    };
}

export async function appendTavernMessage(sessionId: string, message: TavernAppendMessageInput): Promise<TavernMessageRecord> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('session_required');}
    const timestamp = now();
    let record: TavernMessageRecord | null = null;
    await db.transaction('rw', tavernMessagesTable, tavernSessionsTable, async () => {
        const session = await tavernSessionsTable.get(id);
        if (!session) {throw new Error('session_missing');}
        const latest = await getLatestTavernMessage(id);
        const order = (latest ? Math.floor(Number(latest.order)) : -1) + 1;
        record = buildTavernMessageRecord(id, order, message, timestamp);
        await tavernMessagesTable.put(record);
        await tavernSessionsTable.update(id, {
            storyTimelineRevision: nextTavernStoryTimelineRevision(session),
            transcriptLineCount: nextTavernTranscriptLineCount(session, countTavernTranscriptMessageLines(record)),
            updatedAt: timestamp,
        });
    });
    if (!record) {throw new Error('message_append_failed');}
    return normalizeStoredTavernMessageRecord(record);
}

interface TavernLatestAssistantRerollPreparationBase {
    userMessage: TavernMessageRecord;
    runtimeState: TavernSessionState;
}

export type TavernLatestAssistantRerollPreparation = TavernLatestAssistantRerollPreparationBase & (
    | {
        mode: 'reply_to_user';
        previousAssistantMessage: null;
        candidate: null;
    }
    | {
        mode: 'replace_assistant';
        previousAssistantMessage: TavernMessageRecord;
        candidate: TavernManagerCandidateRecord | null;
    }
);

function normalizedMessageTimelineRevision(message?: Pick<TavernMessageRecord, 'timelineRevision'> | null): number {
    return Math.max(1, Math.floor(Number(message?.timelineRevision) || 1));
}

export function normalizedTavernStoryTimelineRevision(
    session?: Pick<TavernSessionRecord, 'storyTimelineRevision'> | null,
): number {
    return Math.max(1, Math.floor(Number(session?.storyTimelineRevision) || 1));
}

function nextTavernStoryTimelineRevision(session: Pick<TavernSessionRecord, 'storyTimelineRevision'>): number {
    return normalizedTavernStoryTimelineRevision(session) + 1;
}

export type TavernMessageIdentity = Pick<
    TavernMessageRecord,
    'messageId' | 'sessionId' | 'order' | 'role' | 'createdAt' | 'timelineRevision'
>;

function isSameTavernMessageIdentity(
    current: TavernMessageRecord | null | undefined,
    expected: TavernMessageIdentity,
): current is TavernMessageRecord {
    return !!current
        && !!expected.messageId
        && current.messageId === expected.messageId
        && current.sessionId === expected.sessionId
        && current.order === expected.order
        && current.role === expected.role
        && Number(current.createdAt) === Number(expected.createdAt)
        && normalizedMessageTimelineRevision(current) === normalizedMessageTimelineRevision(expected);
}

export type TavernManagerRunSourceIdentity = Pick<TavernManagerRunRecord,
    | 'sourceUserMessageId'
    | 'sourceAssistantMessageId'
    | 'sourceUserCreatedAt'
    | 'sourceAssistantCreatedAt'
    | 'sourceUserRevision'
    | 'sourceAssistantRevision'
>;

export function assertTavernManagerRunSourceMessages(
    expected: TavernManagerRunSourceIdentity,
    messages: { userMessage: TavernMessageRecord; assistantMessage: TavernMessageRecord },
): void {
    const sourceUserMessageId = String(expected.sourceUserMessageId || '').trim();
    const sourceAssistantMessageId = String(expected.sourceAssistantMessageId || '').trim();
    const userRevision = normalizedMessageTimelineRevision(messages.userMessage);
    const assistantRevision = normalizedMessageTimelineRevision(messages.assistantMessage);
    if (!sourceUserMessageId
        || !sourceAssistantMessageId
        || messages.userMessage.messageId !== sourceUserMessageId
        || messages.assistantMessage.messageId !== sourceAssistantMessageId
    ) {
        throw new Error('manager_source_messages_changed');
    }
    if (Number.isFinite(Number(expected.sourceUserCreatedAt))
        && Number(messages.userMessage.createdAt) !== Number(expected.sourceUserCreatedAt)) {
        throw new Error('manager_source_messages_changed');
    }
    if (Number.isFinite(Number(expected.sourceAssistantCreatedAt))
        && Number(messages.assistantMessage.createdAt) !== Number(expected.sourceAssistantCreatedAt)) {
        throw new Error('manager_source_messages_changed');
    }
    if (Number.isFinite(Number(expected.sourceUserRevision)) && userRevision !== Number(expected.sourceUserRevision)) {
        throw new Error('manager_source_messages_changed');
    }
    if (Number.isFinite(Number(expected.sourceAssistantRevision)) && assistantRevision !== Number(expected.sourceAssistantRevision)) {
        throw new Error('manager_source_messages_changed');
    }
}

function isSameTavernManagerCandidateIdentity(
    current: TavernManagerCandidateRecord | null | undefined,
    expected: TavernManagerCandidateRecord | null | undefined,
): boolean {
    if (!current || !expected) {return !current && !expected;}
    return current.id === expected.id
        && current.sessionId === expected.sessionId
        && current.userOrder === expected.userOrder
        && current.assistantOrder === expected.assistantOrder
        && Number(current.createdAt) === Number(expected.createdAt);
}

async function hasTavernManagerRunForAssistant(sessionId: string, assistantOrder: number): Promise<boolean> {
    return await tavernManagerRunsTable
        .where('[sessionId+assistantOrder]')
        .equals([sessionId, assistantOrder])
        .count() > 0;
}

export async function prepareTavernLatestAssistantReroll(
    sessionId = '',
): Promise<TavernLatestAssistantRerollPreparation> {
    const id = String(sessionId || '').trim();
    if (!id) {throw new Error('reroll_session_required');}
    return await db.transaction(
        'r',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernManagerCandidatesTable,
        tavernManagerRunsTable,
        async () => {
            const existingSession = await tavernSessionsTable.get(id);
            if (!existingSession) {throw new Error('session_missing');}
            const latestMessage = await getLatestTavernMessage(id);
            if (!latestMessage || !['user', 'assistant'].includes(latestMessage.role)) {
                throw new Error('reroll_latest_assistant_required');
            }
            const mode = latestMessage.role === 'user' ? 'reply_to_user' : 'replace_assistant';
            const userMessage = mode === 'reply_to_user'
                ? latestMessage
                : await getLatestTavernUserMessageAtOrBefore(id, latestMessage.order - 1);
            if (!userMessage
                || userMessage.error
                || (mode === 'replace_assistant' && userMessage.order + 1 !== latestMessage.order)
                || !userMessage.runtimeStateSnapshot
            ) {
                throw new Error('reroll_latest_pair_invalid');
            }
            if (mode === 'replace_assistant' && await hasTavernManagerRunForAssistant(id, latestMessage.order)) {
                throw new Error('reroll_latest_pair_already_confirmed');
            }
            const candidate = await tavernManagerCandidatesTable.get(id);
            if (candidate && (mode === 'reply_to_user'
                || candidate.userOrder !== userMessage.order
                || candidate.assistantOrder !== latestMessage.order
            )) {
                throw new Error('reroll_candidate_mismatch');
            }
            const restoredStateInput: Partial<TavernSessionState> = {
                ...userMessage.runtimeStateSnapshot,
            };
            const restoredState = buildReplacementTavernSessionState(existingSession, restoredStateInput);
            const normalizedUserMessage = normalizeStoredTavernMessageRecord(userMessage);
            if (mode === 'reply_to_user') {
                return {
                    mode,
                    userMessage: normalizedUserMessage,
                    previousAssistantMessage: null,
                    candidate: null,
                    runtimeState: restoredState,
                };
            }
            return {
                mode,
                userMessage: normalizedUserMessage,
                previousAssistantMessage: normalizeStoredTavernMessageRecord(latestMessage),
                candidate: candidate ? cloneSerializable(candidate, candidate) : null,
                runtimeState: restoredState,
            };
        },
    );
}

export interface TavernAssistantResponseCommitOptions {
    sessionState: Partial<TavernSessionState>;
    replaceSessionState?: boolean;
    userMessagePatch?: Partial<Pick<TavernMessageRecord,
        | 'runtimeEvents'
        | 'contextSnapshot'
        | 'buildSnapshot'
        | 'chatPresetId'
        | 'chatPresetName'
        | 'presetId'
        | 'presetName'
        | 'requestSnapshot'
    >>;
    sessionSnapshot?: Partial<Pick<TavernSessionRecord,
        | 'contextSnapshot'
        | 'buildSnapshot'
        | 'chatPresetId'
        | 'chatPresetName'
        | 'presetId'
        | 'presetName'
    >>;
    managerCandidate?: {
        turn: number;
        inputSummary?: string;
    };
}

function buildTavernUserMessageCommitPatch(
    patch: NonNullable<TavernAssistantResponseCommitOptions['userMessagePatch']>,
): Partial<TavernMessageRecord> {
    return {
        ...('runtimeEvents' in patch ? { runtimeEvents: normalizeMessageRuntimeEvents(patch.runtimeEvents) } : {}),
        ...('contextSnapshot' in patch ? { contextSnapshot: cloneSerializable(patch.contextSnapshot, undefined) } : {}),
        ...('buildSnapshot' in patch ? { buildSnapshot: cloneSerializable(patch.buildSnapshot, undefined) } : {}),
        ...('chatPresetId' in patch ? { chatPresetId: String(patch.chatPresetId || '') } : {}),
        ...('chatPresetName' in patch ? { chatPresetName: String(patch.chatPresetName || '') } : {}),
        ...('presetId' in patch ? { presetId: String(patch.presetId || '') } : {}),
        ...('presetName' in patch ? { presetName: String(patch.presetName || '') } : {}),
        ...('requestSnapshot' in patch ? { requestSnapshot: cloneSerializable(patch.requestSnapshot, undefined) } : {}),
    };
}

function buildTavernAssistantSessionUpdate(
    existingSession: TavernSessionRecord,
    state: TavernSessionState,
    sessionSnapshot: TavernAssistantResponseCommitOptions['sessionSnapshot'],
    timestamp: number,
): Partial<TavernSessionRecord> {
    return {
        state: cloneSerializable(state, {}),
        updatedAt: timestamp,
        contextSnapshot: cloneSerializable(sessionSnapshot?.contextSnapshot ?? existingSession.contextSnapshot, undefined),
        buildSnapshot: cloneSerializable(
            sessionSnapshot?.buildSnapshot ?? state.lastBuildSnapshot ?? existingSession.buildSnapshot,
            undefined,
        ),
        chatPresetId: 'chatPresetId' in (sessionSnapshot || {})
            ? String(sessionSnapshot?.chatPresetId || '')
            : existingSession.chatPresetId,
        chatPresetName: 'chatPresetName' in (sessionSnapshot || {})
            ? String(sessionSnapshot?.chatPresetName || '')
            : existingSession.chatPresetName,
        presetId: 'presetId' in (sessionSnapshot || {})
            ? String(sessionSnapshot?.presetId || '')
            : existingSession.presetId,
        presetName: 'presetName' in (sessionSnapshot || {})
            ? String(sessionSnapshot?.presetName || '')
            : existingSession.presetName,
    };
}

function buildTavernAssistantManagerCandidate(
    sessionId: string,
    userOrder: number,
    assistantOrder: number,
    input: NonNullable<TavernAssistantResponseCommitOptions['managerCandidate']>,
    timestamp: number,
): TavernManagerCandidateRecord {
    return {
        id: createId('manager-candidate'),
        sessionId,
        turn: Math.max(0, Math.floor(Number(input.turn) || 0)),
        userOrder,
        assistantOrder,
        inputSummary: String(input.inputSummary || ''),
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

export interface TavernAssistantResponseCommitResult {
    assistantMessage: TavernMessageRecord;
    session: TavernSessionRecord;
    managerCandidate: TavernManagerCandidateRecord | null;
}

/**
 * Commits an Assistant response inside a caller-owned Dexie transaction.
 * The caller must include messages, sessions and managerCandidates.
 */
export async function commitTavernAssistantResponseForLatestUserInCurrentDbTransaction(
    sessionId: string,
    expectedUser: TavernMessageIdentity,
    message: TavernAppendMessageInput,
    options: TavernAssistantResponseCommitOptions,
): Promise<TavernAssistantResponseCommitResult> {
    const id = String(sessionId || '').trim();
    if (!id || expectedUser.sessionId !== id || expectedUser.role !== 'user') {
        throw new Error('assistant_expected_user_invalid');
    }
    if (String(message.role || '') !== 'assistant') {throw new Error('assistant_message_required');}
    const timestamp = now();
    const existingSession = await tavernSessionsTable.get(id);
    if (!existingSession) {throw new Error('session_missing');}
    const latest = await getLatestTavernMessage(id);
    if (!isSameTavernMessageIdentity(latest, expectedUser) || latest.error) {
        throw new Error('assistant_timeline_advanced');
    }
    const existingCandidate = await tavernManagerCandidatesTable.get(id);
    if (existingCandidate) {throw new Error('assistant_candidate_conflict');}
    const assistantMessage = buildTavernMessageRecord(id, latest.order + 1, message, timestamp);
    const state = options.replaceSessionState
        ? buildReplacementTavernSessionState(existingSession, options.sessionState)
        : buildUpdatedTavernSessionState(existingSession, options.sessionState);
    if (options.userMessagePatch) {
        await tavernMessagesTable.update(
            [id, latest.order],
            buildTavernUserMessageCommitPatch(options.userMessagePatch),
        );
    }
    await tavernMessagesTable.put(assistantMessage);
    let managerCandidate: TavernManagerCandidateRecord | null = null;
    if (options.managerCandidate) {
        managerCandidate = buildTavernAssistantManagerCandidate(
            id,
            latest.order,
            assistantMessage.order,
            options.managerCandidate,
            timestamp,
        );
        await tavernManagerCandidatesTable.put(managerCandidate);
    }
    await tavernSessionsTable.update(
        id,
        {
            ...buildTavernAssistantSessionUpdate(existingSession, state, options.sessionSnapshot, timestamp),
            storyTimelineRevision: nextTavernStoryTimelineRevision(existingSession),
            transcriptLineCount: nextTavernTranscriptLineCount(existingSession, countTavernTranscriptMessageLines(assistantMessage)),
        },
    );
    const session = await tavernSessionsTable.get(id);
    if (!session) {throw new Error('session_missing');}
    return {
        assistantMessage: normalizeStoredTavernMessageRecord(assistantMessage),
        session,
        managerCandidate,
    };
}

export async function commitTavernAssistantResponseForLatestUser(
    sessionId: string,
    expectedUser: TavernMessageIdentity,
    message: TavernAppendMessageInput,
    options: TavernAssistantResponseCommitOptions,
): Promise<TavernAssistantResponseCommitResult> {
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernManagerCandidatesTable,
        async () => commitTavernAssistantResponseForLatestUserInCurrentDbTransaction(
            sessionId,
            expectedUser,
            message,
            options,
        ),
    );
}

export async function commitTavernLatestAssistantReroll(
    sessionId: string,
    expectedUser: TavernMessageIdentity,
    expectedAssistant: TavernMessageIdentity,
    expectedCandidate: TavernManagerCandidateRecord | null,
    message: TavernAppendMessageInput,
    options: TavernAssistantResponseCommitOptions,
): Promise<{
    assistantMessage: TavernMessageRecord;
    session: TavernSessionRecord;
    managerCandidate: TavernManagerCandidateRecord | null;
}> {
    const id = String(sessionId || '').trim();
    if (!id
        || expectedUser.sessionId !== id
        || expectedUser.role !== 'user'
        || expectedAssistant.sessionId !== id
        || expectedAssistant.role !== 'assistant'
        || expectedUser.order + 1 !== expectedAssistant.order
    ) {
        throw new Error('reroll_expected_pair_invalid');
    }
    if (String(message.role || '') !== 'assistant') {throw new Error('assistant_message_required');}
    const timestamp = now();
    return await db.transaction(
        'rw',
        tavernMessagesTable,
        tavernSessionsTable,
        tavernManagerCandidatesTable,
        tavernManagerRunsTable,
        async () => {
            const existingSession = await tavernSessionsTable.get(id);
            if (!existingSession) {throw new Error('session_missing');}
            const [currentUser, currentAssistant] = await Promise.all([
                tavernMessagesTable.get([id, expectedUser.order]),
                getLatestTavernMessage(id),
            ]);
            if (!isSameTavernMessageIdentity(currentUser, expectedUser)
                || currentUser.error
                || !isSameTavernMessageIdentity(currentAssistant, expectedAssistant)
            ) {
                throw new Error('assistant_timeline_advanced');
            }
            if (await hasTavernManagerRunForAssistant(id, currentAssistant.order)) {
                throw new Error('reroll_latest_pair_already_confirmed');
            }
            const currentCandidate = await tavernManagerCandidatesTable.get(id) || null;
            if (!isSameTavernManagerCandidateIdentity(currentCandidate, expectedCandidate)) {
                throw new Error('assistant_candidate_conflict');
            }
            const assistantMessage = buildTavernMessageRecord(id, currentAssistant.order, message, timestamp);
            const state = options.replaceSessionState
                ? buildReplacementTavernSessionState(existingSession, options.sessionState)
                : buildUpdatedTavernSessionState(existingSession, options.sessionState);
            if (options.userMessagePatch) {
                await tavernMessagesTable.update(
                    [id, currentUser.order],
                    buildTavernUserMessageCommitPatch(options.userMessagePatch),
                );
            }
            await tavernMessagesTable.put(assistantMessage);
            let managerCandidate: TavernManagerCandidateRecord | null = null;
            if (options.managerCandidate) {
                managerCandidate = buildTavernAssistantManagerCandidate(
                    id,
                    currentUser.order,
                    assistantMessage.order,
                    options.managerCandidate,
                    timestamp,
                );
                await tavernManagerCandidatesTable.put(managerCandidate);
            } else if (currentCandidate) {
                await tavernManagerCandidatesTable.delete(id);
            }
            await tavernSessionsTable.update(
                id,
                {
                    ...buildTavernAssistantSessionUpdate(existingSession, state, options.sessionSnapshot, timestamp),
                    storyTimelineRevision: nextTavernStoryTimelineRevision(existingSession),
                    transcriptLineCount: nextTavernTranscriptLineCount(
                        existingSession,
                        countTavernTranscriptMessageLines(assistantMessage) - countTavernTranscriptMessageLines(currentAssistant),
                    ),
                },
            );
            const session = await tavernSessionsTable.get(id);
            if (!session) {throw new Error('session_missing');}
            return {
                assistantMessage: normalizeStoredTavernMessageRecord(assistantMessage),
                session,
                managerCandidate,
            };
        },
    );
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
            const session = await tavernSessionsTable.get(id);
            if (!session) {throw new Error('session_missing');}
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
                        sourceUserMessageId: sourceUser.messageId,
                        sourceAssistantMessageId: sourceAssistant.messageId,
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
            await tavernSessionsTable.update(id, {
                storyTimelineRevision: nextTavernStoryTimelineRevision(session),
                transcriptLineCount: nextTavernTranscriptLineCount(session, countTavernTranscriptMessageLines(userMessage)),
                updatedAt: timestamp,
            });
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
        const managerRunTable = tavernManagerRunsTable as unknown as DexieRangeTable<TavernManagerRunRecord>;
        const runsWithStatus = (status: 'queued' | 'running') => managerRunTable
            .where('[sessionId+status+updatedAt]')
            .between([id, status, DexieRangeKeys.minKey], [id, status, DexieRangeKeys.maxKey], true, true);
        const timestamp = now();
        const running = await runsWithStatus('running')
            .filter((run) => run.trigger === 'accepted_turn')
            .first();
        if (running) {
            return null;
        }
        const queued = (await runsWithStatus('queued')
            .filter((run) => run.trigger === 'accepted_turn' && !String(run.leaseOwnerId || '').trim())
            .toArray())
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
    const managerRunTable = tavernManagerRunsTable as unknown as DexieRangeTable<TavernManagerRunRecord>;
    const runsWithStatus = (status: 'queued' | 'running') => managerRunTable
        .where('[sessionId+status+updatedAt]')
        .between([id, status, DexieRangeKeys.minKey], [id, status, DexieRangeKeys.maxKey], true, true)
        .filter((run) => run.trigger === 'accepted_turn');
    const [queued, running] = await Promise.all([
        runsWithStatus('queued').toArray(),
        runsWithStatus('running').toArray(),
    ]);
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

export async function listInterruptedAcceptedTurnManagerRuns(sessionId = ''): Promise<TavernManagerRunRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const managerRunTable = tavernManagerRunsTable as unknown as DexieRangeTable<TavernManagerRunRecord>;
    return await managerRunTable
        .where('[sessionId+status+error+updatedAt]')
        .between(
            [id, 'failed', 'manager_worker_interrupted', DexieRangeKeys.minKey],
            [id, 'failed', 'manager_worker_interrupted', DexieRangeKeys.maxKey],
            true,
            true,
        )
        .filter((run) => run.trigger === 'accepted_turn')
        .toArray();
}

export async function listExpiredAcceptedTurnManagerRuns(sessionId = '', observedAt = now()): Promise<TavernManagerRunRecord[]> {
    const id = String(sessionId || '').trim();
    const timestamp = Number(observedAt) || now();
    if (!id) {return [];}
    return (await tavernManagerRunsTable.where('sessionId').equals(id).toArray())
        .filter((run) => run.trigger === 'accepted_turn'
            && run.status === 'running'
            && Number(run.leaseExpiresAt) <= timestamp);
}

export async function claimExpiredAcceptedTurnManagerRun(input: {
    sessionId: string;
    managerRunId: string;
    leaseOwnerId: string;
    leaseDurationMs?: number;
    observedAt?: number;
}): Promise<TavernManagerRunRecord | null> {
    const sessionId = String(input.sessionId || '').trim();
    const managerRunId = String(input.managerRunId || '').trim();
    const leaseOwnerId = String(input.leaseOwnerId || '').trim();
    if (!sessionId || !managerRunId || !leaseOwnerId) {return null;}
    const observedAt = Number(input.observedAt) || now();
    const leaseDurationMs = Math.max(5000, Math.floor(Number(input.leaseDurationMs) || 30000));
    return await db.transaction('rw', tavernManagerRunsTable, tavernSessionsTable, async () => {
        const run = await tavernManagerRunsTable.get(managerRunId);
        if (!run || run.sessionId !== sessionId || run.trigger !== 'accepted_turn'
            || run.status !== 'running' || Number(run.leaseExpiresAt) > observedAt) {
            return null;
        }
        const timestamp = now();
        await tavernManagerRunsTable.update(managerRunId, {
            leaseOwnerId,
            leaseExpiresAt: timestamp + leaseDurationMs,
            updatedAt: timestamp,
        });
        await tavernSessionsTable.update(sessionId, { updatedAt: timestamp });
        return await tavernManagerRunsTable.get(managerRunId) || null;
    });
}

export async function assertRunningTavernManagerRunLease(managerRunId = '', leaseOwnerId = ''): Promise<TavernManagerRunRecord> {
    const id = String(managerRunId || '').trim();
    const owner = String(leaseOwnerId || '').trim();
    const run = id ? await tavernManagerRunsTable.get(id) : null;
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
        | 'runtimeStateSnapshot'
    >>,
    options: { incrementTimelineRevision?: boolean } = {},
): Promise<TavernMessageRecord | null> {
    const id = String(sessionId || '').trim();
    const messageOrder = Number(order);
    if (!id || !Number.isInteger(messageOrder) || messageOrder < 0) {return null;}
    return await db.transaction('rw', tavernMessagesTable, tavernSessionsTable, async () => (
        updateTavernMessageInCurrentDbTransaction(id, messageOrder, patch, options)
    ));
}

export type TavernMessageContentUpdateResult =
    | { status: 'updated'; message: TavernMessageRecord }
    | { status: 'conflict'; message: TavernMessageRecord }
    | { status: 'missing'; message: null };

export async function updateTavernMessageContentIfMatches(
    sessionId = '',
    order = -1,
    expectedContent = '',
    nextContent = '',
): Promise<TavernMessageContentUpdateResult> {
    const id = String(sessionId || '').trim();
    const messageOrder = Number(order);
    if (!id || !Number.isInteger(messageOrder) || messageOrder < 0) {
        return { status: 'missing', message: null };
    }
    const expected = String(expectedContent ?? '');
    return await db.transaction('rw', tavernMessagesTable, tavernSessionsTable, async () => {
        const existing = await tavernMessagesTable.get([id, messageOrder]);
        if (!existing) {return { status: 'missing', message: null };}
        if (String(existing.content || '') !== expected) {
            return { status: 'conflict', message: normalizeStoredTavernMessageRecord(existing) };
        }
        const updated = await updateTavernMessageInCurrentDbTransaction(
            id,
            messageOrder,
            { content: String(nextContent ?? '') },
        );
        return updated
            ? { status: 'updated', message: updated }
            : { status: 'missing', message: null };
    });
}

/** Caller must include messages and sessions in the active transaction. */
export async function updateTavernMessageInCurrentDbTransaction(
    sessionId: string,
    order: number,
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
        | 'runtimeStateSnapshot'
    >>,
    options: { incrementTimelineRevision?: boolean } = {},
): Promise<TavernMessageRecord | null> {
    const [existing, session] = await Promise.all([
        tavernMessagesTable.get([sessionId, order]),
        tavernSessionsTable.get(sessionId),
    ]);
    if (!existing || !session) {return null;}
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
    if ('runtimeStateSnapshot' in patch) {
        update.runtimeStateSnapshot = patch.runtimeStateSnapshot
            ? createTavernTurnStateSnapshot(patch.runtimeStateSnapshot)
            : undefined;
    }
    if (options.incrementTimelineRevision === true) {
        update.timelineRevision = Math.max(1, Math.floor(Number(existing.timelineRevision) || 1)) + 1;
    }
    await tavernMessagesTable.update([sessionId, order], update);
    await tavernSessionsTable.update(sessionId, {
        storyTimelineRevision: nextTavernStoryTimelineRevision(session),
        ...(Object.hasOwn(update, 'content') ? {
            transcriptLineCount: nextTavernTranscriptLineCount(
                session,
                countTavernTranscriptMessageLines(update) - countTavernTranscriptMessageLines(existing),
            ),
        } : {}),
        updatedAt: now(),
    });
    const updated = await tavernMessagesTable.get([sessionId, order]);
    return updated ? normalizeStoredTavernMessageRecord(updated) : null;
}

export async function deleteTavernMessages(sessionId = '', orders: number[] = []): Promise<number> {
    const id = String(sessionId || '').trim();
    const uniqueOrders = [...new Set((Array.isArray(orders) ? orders : [])
        .map((order) => Number(order))
        .filter((order) => Number.isInteger(order) && order >= 0))];
    if (!id || !uniqueOrders.length) {return 0;}
    return await db.transaction('rw', tavernMessagesTable, tavernSessionsTable, async () => {
        const session = await tavernSessionsTable.get(id);
        if (!session) {return 0;}
        const existing = await Promise.all(uniqueOrders.map((order) => tavernMessagesTable.get([id, order])));
        const existingKeys = existing
            .filter((message): message is TavernMessageRecord => !!message)
            .map((message) => [id, message.order] as [string, number]);
        if (!existingKeys.length) {return 0;}
        await tavernMessagesTable.bulkDelete(existingKeys);
        await tavernSessionsTable.update(id, {
            storyTimelineRevision: nextTavernStoryTimelineRevision(session),
            transcriptLineCount: nextTavernTranscriptLineCount(
                session,
                -existing
                    .filter((message): message is TavernMessageRecord => !!message)
                    .reduce((total, message) => total + countTavernTranscriptMessageLines(message), 0),
            ),
            updatedAt: now(),
        });
        return existingKeys.length;
    });
}

export async function truncateTavernMessagesAndReplaceSessionState(
    sessionId = '',
    fromOrder = 0,
    stateInput: Partial<TavernSessionState> = {},
): Promise<{ deleted: number; session: TavernSessionRecord | null }> {
    const id = String(sessionId || '').trim();
    const firstDeletedOrder = Math.max(0, Math.floor(Number(fromOrder) || 0));
    if (!id) {return { deleted: 0, session: null };}
    return await db.transaction('rw', tavernMessagesTable, tavernSessionsTable, async () => (
        truncateTavernMessagesAndReplaceSessionStateInCurrentDbTransaction(id, firstDeletedOrder, stateInput)
    ));
}

/** Caller must include messages and sessions in the active transaction. */
export async function truncateTavernMessagesAndReplaceSessionStateInCurrentDbTransaction(
    sessionId: string,
    fromOrder: number,
    stateInput: Partial<TavernSessionState> = {},
): Promise<{ deleted: number; session: TavernSessionRecord | null }> {
    const existingSession = await tavernSessionsTable.get(sessionId);
    if (!existingSession) {return { deleted: 0, session: null };}
    const deletedMessages = await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([sessionId, fromOrder], [sessionId, DexieRangeKeys.maxKey], true, true)
        .toArray();
    const messageKeys = deletedMessages.map((message) => [sessionId, message.order] as [string, number]);
    const state = buildReplacementTavernSessionState(existingSession, stateInput);
    if (messageKeys.length) {
        await tavernMessagesTable.bulkDelete(messageKeys);
    }
    const timestamp = now();
    await tavernSessionsTable.update(sessionId, {
        state: cloneSerializable(state, {}),
        ...(messageKeys.length
            ? { storyTimelineRevision: nextTavernStoryTimelineRevision(existingSession) }
            : {}),
        ...(messageKeys.length ? {
            transcriptLineCount: nextTavernTranscriptLineCount(
                existingSession,
                -deletedMessages.reduce((total, message) => total + countTavernTranscriptMessageLines(message), 0),
            ),
        } : {}),
        updatedAt: timestamp,
        buildSnapshot: cloneSerializable(state.lastBuildSnapshot || existingSession.buildSnapshot, undefined),
    });
    return {
        deleted: messageKeys.length,
        session: await tavernSessionsTable.get(sessionId) || null,
    };
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

/**
 * Returns the next chronological page after a known message order. Unlike an
 * offset query, this keeps IndexedDB work proportional to the page itself.
 */
export async function listTavernMessagesAfterOrder(
    sessionId = '',
    afterOrder = -1,
    limit = 1000,
): Promise<TavernMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const after = Math.floor(Number(afterOrder));
    const start = Number.isFinite(after) ? Math.max(0, after + 1) : 0;
    const safeLimit = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 1000)));
    return (await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, start], [id, DexieRangeKeys.maxKey], true, true)
        .limit(safeLimit)
        .toArray())
        .map(normalizeStoredTavernMessageRecord);
}

/** Returns one chronological page immediately before an order boundary. */
export async function listTavernMessagesBeforeOrder(
    sessionId = '',
    beforeOrder = Number.POSITIVE_INFINITY,
    limit = 1000,
): Promise<TavernMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const finiteBefore = Number.isFinite(Number(beforeOrder));
    const boundary = Math.floor(Number(beforeOrder) || 0);
    if (finiteBefore && boundary <= 0) {return [];}
    const upperOrder = finiteBefore ? boundary : DexieRangeKeys.maxKey;
    const includeUpper = !finiteBefore;
    const safeLimit = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 1000)));
    const rows = await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, upperOrder], true, includeUpper)
        .reverse()
        .limit(safeLimit)
        .toArray();
    return rows.reverse().map(normalizeStoredTavernMessageRecord);
}

export async function getTavernTranscriptStats(sessionId = ''): Promise<{ totalLines: number; totalMessages: number }> {
    const id = String(sessionId || '').trim();
    if (!id) {return { totalLines: 0, totalMessages: 0 };}
    return await db.transaction('r', tavernSessionsTable, tavernMessagesTable, async () => {
        const [session, totalMessages] = await Promise.all([
            tavernSessionsTable.get(id),
            tavernMessagesTable.where('sessionId').equals(id).count(),
        ]);
        return {
            totalLines: normalizedTavernTranscriptLineCount(session?.transcriptLineCount),
            totalMessages,
        };
    });
}

/** Repairs the derived transcript aggregate at import and upgrade boundaries. */
export async function rebuildTavernTranscriptLineCounts(sessionIds: Iterable<string> = []): Promise<void> {
    const ids = [...new Set(Array.from(sessionIds, (value) => String(value || '').trim()).filter(Boolean))];
    if (!ids.length) {return;}
    await db.transaction('rw', tavernSessionsTable, tavernMessagesTable, async () => {
        for (const id of ids) {
            let transcriptLineCount = 0;
            await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
                .where('sessionId')
                .equals(id)
                .each((message) => {
                    transcriptLineCount += countTavernTranscriptMessageLines(message);
                });
            await tavernSessionsTable.update(id, {
                transcriptLineCount,
            });
        }
    });
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

export async function countCompletedTavernAssistantTurnsBefore(
    sessionId = '',
    beforeOrder = Number.POSITIVE_INFINITY,
): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    const finiteBefore = Number.isFinite(Number(beforeOrder));
    const boundary = Math.floor(Number(beforeOrder) || 0);
    if (finiteBefore && boundary <= 0) {return 0;}
    const upperOrder = finiteBefore ? boundary - 1 : DexieRangeKeys.maxKey;
    let hasPendingUser = false;
    let completedTurns = 0;
    await (tavernMessagesTable as unknown as DexieRangeTable<TavernMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, upperOrder], true, true)
        .each((message) => {
            if (message.role === 'user' && message.error !== true) {
                hasPendingUser = true;
                return;
            }
            if (hasPendingUser && message.role === 'assistant' && message.error !== true) {
                completedTurns += 1;
                hasPendingUser = false;
            }
        });
    return completedTurns;
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

function compactAssistantChatToolText(value: unknown, limit = 600): string {
    const text = String(value || '');
    return text.length > limit ? `${text.slice(0, Math.max(1, limit - 1))}…` : text;
}

/**
 * The single "effective tool call" verdict shared by the summary index and
 * the chat projection. A failed or cancelled assistant message keeps its full
 * content and renders as a plain message even when it carries toolCalls.
 */
export function tavernAssistantChatMessageHasEffectiveToolCalls(
    message: { role?: unknown; error?: unknown; finishReason?: unknown; toolCalls?: unknown } | null | undefined,
): boolean {
    if (!message || message.role !== 'assistant') {return false;}
    if (message.error === true) {return false;}
    if (['aborted', 'error'].includes(String(message.finishReason || '').trim())) {return false;}
    return Array.isArray(message.toolCalls) && message.toolCalls.length > 0;
}

export function buildTavernAssistantChatMessageSummary(
    message: TavernAssistantChatMessageRecord,
): TavernAssistantChatMessageSummaryRecord {
    const hasToolCalls = tavernAssistantChatMessageHasEffectiveToolCalls(message);
    return {
        sessionId: message.sessionId,
        order: message.order,
        role: message.role,
        content: message.role === 'tool'
            ? ''
            : hasToolCalls
                ? compactAssistantChatToolText(message.content)
                : String(message.content || ''),
        name: message.name,
        error: message.error === true,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        finishReason: message.finishReason,
        thoughtCount: Array.isArray(message.thoughts) ? message.thoughts.length : 0,
        toolCalls: hasToolCalls
            ? message.toolCalls?.map((toolCall) => ({
                id: String(toolCall?.id || ''),
                name: String(toolCall?.name || ''),
                ...(Object.prototype.hasOwnProperty.call(toolCall || {}, 'providerId')
                    ? { providerId: String(toolCall?.providerId || '') }
                    : {}),
            }))
            : undefined,
        toolCallId: message.toolCallId,
        toolName: message.toolName,
        toolDisplay: cloneSerializable(message.toolDisplay, undefined),
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
    await db.transaction('rw', tavernAssistantChatMessagesTable, tavernAssistantChatMessageSummariesTable, tavernSessionsTable, async () => {
        if (!await tavernSessionsTable.get(id)) {throw new Error('session_missing');}
        if (uniqueDeleteOrders.length) {
            await tavernAssistantChatMessagesTable.bulkDelete(uniqueDeleteOrders.map((order) => [id, order]));
            await tavernAssistantChatMessageSummariesTable.bulkDelete(uniqueDeleteOrders.map((order) => [id, order]));
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
            await tavernAssistantChatMessageSummariesTable.bulkPut(records.map(buildTavernAssistantChatMessageSummary));
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
    return await db.transaction('rw', tavernAssistantChatMessagesTable, tavernAssistantChatMessageSummariesTable, tavernSessionsTable, async () => {
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
        const saved = await tavernAssistantChatMessagesTable.get([id, messageOrder]) || null;
        if (saved) {await tavernAssistantChatMessageSummariesTable.put(buildTavernAssistantChatMessageSummary(saved));}
        return saved;
    });
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
    await db.transaction('rw', tavernAssistantChatMessagesTable, tavernAssistantChatMessageSummariesTable, tavernSessionsTable, async () => {
        await tavernAssistantChatMessagesTable.bulkDelete(existingKeys);
        await tavernAssistantChatMessageSummariesTable.bulkDelete(existingKeys);
        await tavernSessionsTable.update(id, { updatedAt: now() });
    });
    return existingKeys.length;
}

export async function listTavernAssistantChatMessages(sessionId = ''): Promise<TavernAssistantChatMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    return tavernAssistantChatMessagesTable.where('sessionId').equals(id).sortBy('order');
}

export async function listTavernAssistantChatMessageSummariesBefore(
    sessionId = '',
    beforeOrder = Number.POSITIVE_INFINITY,
    limit = 32,
): Promise<TavernAssistantChatMessageSummaryRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const finiteBefore = Number.isFinite(Number(beforeOrder));
    const boundary = Math.floor(Number(beforeOrder) || 0);
    if (finiteBefore && boundary <= 0) {return [];}
    const upperOrder = finiteBefore ? boundary : DexieRangeKeys.maxKey;
    const includeUpper = !finiteBefore;
    const safeLimit = Math.max(1, Math.min(500, Math.floor(Number(limit) || 32)));
    const rows = await (tavernAssistantChatMessageSummariesTable as unknown as DexieRangeTable<TavernAssistantChatMessageSummaryRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, upperOrder], true, includeUpper)
        .reverse()
        .limit(safeLimit)
        .toArray();
    return rows.reverse();
}

export async function listTavernAssistantChatMessageSummariesInRange(
    sessionId = '',
    startOrder = 0,
    endOrder = Number.POSITIVE_INFINITY,
): Promise<TavernAssistantChatMessageSummaryRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const start = Math.max(0, Math.floor(Number(startOrder) || 0));
    const finiteEnd = Number.isFinite(Number(endOrder));
    const end = finiteEnd ? Math.max(start, Math.floor(Number(endOrder) || start)) : DexieRangeKeys.maxKey;
    const rows = await (tavernAssistantChatMessageSummariesTable as unknown as DexieRangeTable<TavernAssistantChatMessageSummaryRecord>)
        .where('[sessionId+order]')
        .between([id, start], [id, end], true, true)
        .toArray();
    return rows;
}

export async function getTavernAssistantChatMessage(
    sessionId = '',
    order = -1,
): Promise<TavernAssistantChatMessageRecord | null> {
    const id = String(sessionId || '').trim();
    const messageOrder = Number(order);
    if (!id || !Number.isInteger(messageOrder) || messageOrder < 0) {return null;}
    return await tavernAssistantChatMessagesTable.get([id, messageOrder]) || null;
}

export async function listTavernAssistantChatMessagesBefore(
    sessionId = '',
    beforeOrder = Number.POSITIVE_INFINITY,
    limit = 32,
): Promise<TavernAssistantChatMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const finiteBefore = Number.isFinite(Number(beforeOrder));
    const boundary = Math.floor(Number(beforeOrder) || 0);
    if (finiteBefore && boundary <= 0) {return [];}
    const upperOrder = finiteBefore ? boundary : DexieRangeKeys.maxKey;
    const includeUpper = !finiteBefore;
    const safeLimit = Math.max(1, Math.min(500, Math.floor(Number(limit) || 32)));
    const rows = await (tavernAssistantChatMessagesTable as unknown as DexieRangeTable<TavernAssistantChatMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, upperOrder], true, includeUpper)
        .reverse()
        .limit(safeLimit)
        .toArray();
    return rows.reverse();
}

export async function listTavernAssistantChatMessagesInRange(
    sessionId = '',
    startOrder = 0,
    endOrder = Number.POSITIVE_INFINITY,
): Promise<TavernAssistantChatMessageRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const start = Math.max(0, Math.floor(Number(startOrder) || 0));
    const finiteEnd = Number.isFinite(Number(endOrder));
    const end = finiteEnd ? Math.max(start, Math.floor(Number(endOrder) || start)) : DexieRangeKeys.maxKey;
    return await (tavernAssistantChatMessagesTable as unknown as DexieRangeTable<TavernAssistantChatMessageRecord>)
        .where('[sessionId+order]')
        .between([id, start], [id, end], true, true)
        .toArray();
}

export async function listTavernAssistantChatMessageOrdersFrom(
    sessionId = '',
    startOrder = 0,
): Promise<number[]> {
    const id = String(sessionId || '').trim();
    const start = Math.max(0, Math.floor(Number(startOrder) || 0));
    if (!id) {return [];}
    const keys = await (tavernAssistantChatMessagesTable as unknown as DexieRangeTable<TavernAssistantChatMessageRecord>)
        .where('[sessionId+order]')
        .between([id, start], [id, DexieRangeKeys.maxKey], true, true)
        .primaryKeys();
    return keys
        .map((key) => Array.isArray(key) ? key[1] : undefined)
        .map((order) => Math.floor(Number(order)))
        .filter((order) => Number.isInteger(order) && order >= 0);
}

export async function getLatestTavernAssistantChatUserMessageAtOrBefore(
    sessionId = '',
    order = Number.POSITIVE_INFINITY,
): Promise<TavernAssistantChatMessageRecord | null> {
    const id = String(sessionId || '').trim();
    if (!id) {return null;}
    const finiteOrder = Number.isFinite(Number(order));
    const upperOrder = finiteOrder ? Math.max(0, Math.floor(Number(order) || 0)) : DexieRangeKeys.maxKey;
    const message = await (tavernAssistantChatMessagesTable as unknown as DexieRangeTable<TavernAssistantChatMessageRecord>)
        .where('[sessionId+order]')
        .between([id, DexieRangeKeys.minKey], [id, upperOrder], true, true)
        .reverse()
        .filter((item) => item.role === 'user')
        .first();
    return message || null;
}

export async function getNextTavernAssistantChatUserOrderAfter(
    sessionId = '',
    order = -1,
): Promise<number | null> {
    const id = String(sessionId || '').trim();
    const afterOrder = Math.floor(Number(order));
    if (!id || !Number.isInteger(afterOrder)) {return null;}
    const message = await (tavernAssistantChatMessagesTable as unknown as DexieRangeTable<TavernAssistantChatMessageRecord>)
        .where('[sessionId+order]')
        .between([id, afterOrder], [id, DexieRangeKeys.maxKey], false, true)
        .filter((item) => item.role === 'user')
        .first();
    return message ? message.order : null;
}

export async function listTavernAssistantChatMessageOrdersInRange(
    sessionId = '',
    startOrder = 0,
    endOrder = Number.POSITIVE_INFINITY,
): Promise<number[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const start = Math.max(0, Math.floor(Number(startOrder) || 0));
    const finiteEnd = Number.isFinite(Number(endOrder));
    const end = finiteEnd ? Math.max(start, Math.floor(Number(endOrder) || start)) : DexieRangeKeys.maxKey;
    const keys = await (tavernAssistantChatMessagesTable as unknown as DexieRangeTable<TavernAssistantChatMessageRecord>)
        .where('[sessionId+order]')
        .between([id, start], [id, end], true, true)
        .primaryKeys();
    return keys
        .map((key) => Array.isArray(key) ? key[1] : undefined)
        .map((messageOrder) => Math.floor(Number(messageOrder)))
        .filter((messageOrder) => Number.isInteger(messageOrder) && messageOrder >= 0);
}

export async function clearTavernAssistantChatMessages(sessionId = ''): Promise<number> {
    const id = String(sessionId || '').trim();
    if (!id) {return 0;}
    return await db.transaction('rw', tavernAssistantChatMessagesTable, tavernAssistantChatMessageSummariesTable, tavernSessionsTable, async () => {
        const keys = await (tavernAssistantChatMessagesTable as unknown as DexieRangeTable<TavernAssistantChatMessageRecord>)
            .where('sessionId')
            .equals(id)
            .primaryKeys();
        const messageKeys = keys.filter((key): key is [string, number] => (
            Array.isArray(key) && key[0] === id && Number.isInteger(Number(key[1]))
        ));
        if (!messageKeys.length) {return 0;}
        await tavernAssistantChatMessagesTable.bulkDelete(messageKeys);
        await tavernAssistantChatMessageSummariesTable.bulkDelete(messageKeys);
        await tavernSessionsTable.update(id, { updatedAt: now() });
        return messageKeys.length;
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
        sourceUserMessageId: String(input.sourceUserMessageId || '').trim() || undefined,
        sourceAssistantMessageId: String(input.sourceAssistantMessageId || '').trim() || undefined,
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
        const existing = await (tavernManagerRunsTable as unknown as DexieRangeTable<TavernManagerRunRecord>)
            .where('[sessionId+assistantOrder]')
            .equals([source.sessionId, source.assistantOrder])
            .filter((run) => String(run.recoverySourceRunId || '').trim() === source.id)
            .first();
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
            sourceUserMessageId: source.sourceUserMessageId,
            sourceAssistantMessageId: source.sourceAssistantMessageId,
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

export async function getRecoveredAcceptedTurnManagerRun(sourceManagerRunId = ''): Promise<TavernManagerRunRecord | null> {
    const sourceId = String(sourceManagerRunId || '').trim();
    if (!sourceId) {return null;}
    const source = await tavernManagerRunsTable.get(sourceId);
    if (!source || source.trigger !== 'accepted_turn') {return null;}
    return await (tavernManagerRunsTable as unknown as DexieRangeTable<TavernManagerRunRecord>)
        .where('[sessionId+assistantOrder]')
        .equals([source.sessionId, source.assistantOrder])
        .filter((run) => String(run.recoverySourceRunId || '').trim() === source.id)
        .first() || null;
}

export async function queueAcceptedTurnManagerRetry(
    sourceManagerRunId = '',
): Promise<TavernManagerRunRecord | null> {
    const sourceId = String(sourceManagerRunId || '').trim();
    if (!sourceId) {return null;}
    return await db.transaction(
        'rw',
        tavernManagerRunsTable,
        tavernMessagesTable,
        tavernSessionsTable,
        async () => {
            const source = await tavernManagerRunsTable.get(sourceId);
            if (!source || !['accepted_turn', 'after_turn'].includes(source.trigger)) {return null;}
            if (source.status !== 'failed') {return null;}
            const [userMessage, assistantMessage] = await Promise.all([
                tavernMessagesTable.get([source.sessionId, source.userOrder]),
                tavernMessagesTable.get([source.sessionId, source.assistantOrder]),
            ]);
            if (!userMessage || !assistantMessage) {throw new Error('manager_source_messages_changed');}
            assertTavernManagerRunSourceMessages(source, { userMessage, assistantMessage });
            const existing = await (tavernManagerRunsTable as unknown as DexieRangeTable<TavernManagerRunRecord>)
                .where('[sessionId+assistantOrder]')
                .equals([source.sessionId, source.assistantOrder])
                .filter((run) => run.recoverySourceRunId === source.id && ['queued', 'running'].includes(run.status))
                .first();
            if (existing) {return existing;}
            const timestamp = now();
            const run: TavernManagerRunRecord = {
                id: createId('manager-run'),
                sessionId: source.sessionId,
                turn: source.turn,
                userOrder: source.userOrder,
                assistantOrder: source.assistantOrder,
                confirmedByUserOrder: source.confirmedByUserOrder,
                sourceUserMessageId: userMessage.messageId,
                sourceAssistantMessageId: assistantMessage.messageId,
                sourceUserCreatedAt: Number(userMessage.createdAt),
                sourceAssistantCreatedAt: Number(assistantMessage.createdAt),
                sourceUserRevision: Math.max(1, Math.floor(Number(userMessage.timelineRevision) || 1)),
                sourceAssistantRevision: Math.max(1, Math.floor(Number(assistantMessage.timelineRevision) || 1)),
                recoverySourceRunId: source.id,
                trigger: 'accepted_turn',
                status: 'queued',
                provider: '',
                model: '',
                inputSummary: String(source.inputSummary || ''),
                outputText: '已加入维护队列。',
                parsedAction: '',
                changedFiles: [],
                changedStates: [],
                leaseOwnerId: '',
                leaseExpiresAt: 0,
                error: '',
                createdAt: timestamp,
                updatedAt: timestamp,
            };
            await tavernManagerRunsTable.put(run);
            await tavernSessionsTable.update(source.sessionId, { updatedAt: timestamp });
            return run;
        },
    );
}

type TavernManagerRunUpdatePatch = Omit<Partial<TavernManagerRunRecord>, 'status' | 'leaseOwnerId' | 'leaseExpiresAt'>;

export interface TavernManagerRunTransitionConditions {
    expectedStatus: TavernManagerRunStatus;
    expectedLeaseOwnerId: string;
    /** A worker transition requires a live lease unless an external user action explicitly opts out. */
    requireUnexpiredLease?: boolean;
}

function assertTavernManagerRunTransitionConditions(
    existing: TavernManagerRunRecord,
    options: TavernManagerRunTransitionConditions,
): void {
    if (existing.status !== options.expectedStatus
        || String(existing.leaseOwnerId || '') !== String(options.expectedLeaseOwnerId || '')) {
        throw new Error('manager_lease_lost');
    }
    const requireUnexpiredLease = options.requireUnexpiredLease ?? Boolean(options.expectedLeaseOwnerId);
    if (requireUnexpiredLease && Number(existing.leaseExpiresAt) <= now()) {
        throw new Error('manager_lease_lost');
    }
}

function buildTavernManagerRunUpdate(patch: TavernManagerRunUpdatePatch): TavernManagerRunUpdatePatch {
    const update: TavernManagerRunUpdatePatch = { updatedAt: now() };
    ['provider', 'model', 'inputSummary', 'outputText', 'parsedAction', 'error'].forEach((key) => {
        if (key in patch) {(update as Record<string, unknown>)[key] = String((patch as Record<string, unknown>)[key] || '');}
    });
    if ('trigger' in patch) {
        const trigger = String(patch.trigger || '');
        if (!['accepted_turn', 'after_turn'].includes(trigger)) {throw new Error('maintenance_run_trigger_invalid');}
        update.trigger = trigger as TavernMaintenanceRunTrigger;
    }
    if ('toolTrace' in patch) {update.toolTrace = cloneSerializable(patch.toolTrace, undefined);}
    if ('changedFiles' in patch) {update.changedFiles = normalizeStringArray(patch.changedFiles, 100);}
    if ('changedStates' in patch) {update.changedStates = normalizeStringArray(patch.changedStates, 100);}
    if ('turn' in patch) {update.turn = Math.max(0, Number(patch.turn) || 0);}
    if ('userOrder' in patch) {update.userOrder = Number(patch.userOrder);}
    if ('assistantOrder' in patch) {update.assistantOrder = Number(patch.assistantOrder);}
    if ('confirmedByUserOrder' in patch) {update.confirmedByUserOrder = Number(patch.confirmedByUserOrder);}
    if ('sourceUserMessageId' in patch) {update.sourceUserMessageId = String(patch.sourceUserMessageId || '').trim();}
    if ('sourceAssistantMessageId' in patch) {update.sourceAssistantMessageId = String(patch.sourceAssistantMessageId || '').trim();}
    if ('sourceUserCreatedAt' in patch) {update.sourceUserCreatedAt = Number(patch.sourceUserCreatedAt);}
    if ('sourceAssistantCreatedAt' in patch) {update.sourceAssistantCreatedAt = Number(patch.sourceAssistantCreatedAt);}
    if ('sourceUserRevision' in patch) {update.sourceUserRevision = Number(patch.sourceUserRevision);}
    if ('sourceAssistantRevision' in patch) {update.sourceAssistantRevision = Number(patch.sourceAssistantRevision);}
    return update;
}

export async function updateTavernManagerRun(
    managerRunId = '',
    patch: TavernManagerRunUpdatePatch = {},
    options: {
        expectedStatus?: TavernManagerRunStatus;
        expectedLeaseOwnerId?: string;
        requireUnexpiredLease?: boolean;
    } = {},
): Promise<TavernManagerRunRecord | null> {
    const id = String(managerRunId || '').trim();
    if (!id) {return null;}
    if ('status' in patch || 'leaseOwnerId' in patch || 'leaseExpiresAt' in patch) {
        throw new Error('manager_run_transition_required');
    }
    return await db.transaction('rw', tavernManagerRunsTable, tavernSessionsTable, async () => {
        const existing = await tavernManagerRunsTable.get(id);
        if (!existing) {return null;}
        if (options.expectedStatus && existing.status !== options.expectedStatus) {
            throw new Error('manager_lease_lost');
        }
        if (options.expectedLeaseOwnerId !== undefined
            && String(existing.leaseOwnerId || '') !== String(options.expectedLeaseOwnerId || '')) {
            throw new Error('manager_lease_lost');
        }
        if (options.requireUnexpiredLease && Number(existing.leaseExpiresAt) <= now()) {
            throw new Error('manager_lease_lost');
        }
        const update = buildTavernManagerRunUpdate(patch);
        await tavernManagerRunsTable.update(id, update);
        await tavernSessionsTable.update(existing.sessionId, { updatedAt: now() });
        return await tavernManagerRunsTable.get(id) || null;
    });
}

export async function transitionTavernManagerRun(
    managerRunId = '',
    patch: TavernManagerRunUpdatePatch & { status: TavernManagerRunStatus },
    conditions: TavernManagerRunTransitionConditions,
): Promise<TavernManagerRunRecord | null> {
    const id = String(managerRunId || '').trim();
    if (!id) {return null;}
    const nextStatus = normalizeManagerRunStatus(patch.status);
    if (nextStatus === 'running') {throw new Error('manager_run_transition_invalid');}
    return await db.transaction('rw', tavernManagerRunsTable, tavernSessionsTable, async () => {
        const existing = await tavernManagerRunsTable.get(id);
        if (!existing) {return null;}
        assertTavernManagerRunTransitionConditions(existing, conditions);
        const update = buildTavernManagerRunUpdate(patch);
        await tavernManagerRunsTable.update(id, {
            ...update,
            status: nextStatus,
            leaseOwnerId: '',
            leaseExpiresAt: 0,
        });
        await tavernSessionsTable.update(existing.sessionId, { updatedAt: now() });
        return await tavernManagerRunsTable.get(id) || null;
    });
}

export async function getTavernManagerRun(managerRunId = ''): Promise<TavernManagerRunRecord | null> {
    const id = String(managerRunId || '').trim();
    if (!id) {return null;}
    return await tavernManagerRunsTable.get(id) || null;
}

export async function touchRunningTavernManagerRun(managerRunId = '', options: {
    leaseOwnerId?: string;
    leaseDurationMs?: number;
} = {}): Promise<TavernManagerRunRecord | null> {
    const id = String(managerRunId || '').trim();
    if (!id) {return null;}
    const leaseOwnerId = String(options.leaseOwnerId || '').trim();
    const leaseDurationMs = Math.max(5000, Math.floor(Number(options.leaseDurationMs) || 30000));
    return await db.transaction('rw', tavernManagerRunsTable, tavernSessionsTable, async () => {
        const existing = await tavernManagerRunsTable.get(id);
        if (!existing || existing.status !== 'running' || existing.leaseOwnerId !== leaseOwnerId || Number(existing.leaseExpiresAt) <= now()) {
            return existing || null;
        }
        const timestamp = now();
        await tavernManagerRunsTable.update(id, {
            leaseExpiresAt: timestamp + leaseDurationMs,
            updatedAt: timestamp,
        });
        return await tavernManagerRunsTable.get(id) || null;
    });
}

export async function listTavernManagerRuns(sessionId = '', options: {
    limit?: number;
} = {}): Promise<TavernManagerRunRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const requestedLimit = Number(options.limit);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.floor(requestedLimit)
        : 0;
    const isMaintenanceRun = (run: TavernManagerRunRecord) => (
        run.trigger === 'accepted_turn' || run.trigger === 'after_turn'
    );
    const compareNewestFirst = (left: TavernManagerRunRecord, right: TavernManagerRunRecord) => {
        const updatedAtDelta = Number(right.updatedAt) - Number(left.updatedAt);
        if (updatedAtDelta) {return updatedAtDelta;}
        if (left.id === right.id) {return 0;}
        return left.id < right.id ? 1 : -1;
    };
    const managerRunTable = tavernManagerRunsTable as unknown as DexieRangeTable<TavernManagerRunRecord>;
    const latestRange = () => managerRunTable
        .where('[sessionId+updatedAt]')
        .between([id, DexieRangeKeys.minKey], [id, DexieRangeKeys.maxKey], true, true)
        .reverse()
        .filter(isMaintenanceRun);

    if (!limit) {
        return await latestRange().toArray();
    }

    return await db.transaction('r', tavernManagerRunsTable, async () => {
        const activeRange = (status: 'queued' | 'running') => managerRunTable
            .where('[sessionId+status+updatedAt]')
            .between([id, status, DexieRangeKeys.minKey], [id, status, DexieRangeKeys.maxKey], true, true)
            .filter(isMaintenanceRun)
            .toArray();
        const [latest, queued, running] = await Promise.all([
            latestRange().limit(limit).toArray(),
            activeRange('queued'),
            activeRange('running'),
        ]);
        const selected = new Map<string, TavernManagerRunRecord>();
        [...latest, ...queued, ...running].forEach((run) => selected.set(run.id, run));
        return [...selected.values()].sort(compareNewestFirst);
    });
}

export interface TavernManagerToolTraceSummary {
    total: number;
    failed: number;
    running: number;
}

export function projectTavernManagerRunSummary(run: TavernManagerRunRecord): TavernManagerRunRecord {
    const trace = Array.isArray(run.toolTrace) ? run.toolTrace : [];
    const compactText = (value: unknown, limit: number) => String(value || '').slice(0, limit);
    const toolTrace: TavernManagerToolTraceSummary | undefined = trace.length
        ? {
            total: trace.length,
            failed: trace.filter((item) => item && typeof item === 'object' && (item as { ok?: unknown }).ok === false).length,
            running: trace.filter((item) => (
                item && typeof item === 'object' && String((item as { status?: unknown }).status || '') === 'running'
            )).length,
        }
        : undefined;
    return {
        ...run,
        inputSummary: compactText(run.inputSummary, 300),
        outputText: compactText(run.outputText, 500),
        parsedAction: '',
        error: compactText(run.error, 500),
        toolTrace,
    };
}

export async function listTavernManagerRunSummaries(sessionId = '', options: {
    settledLimit?: number;
} = {}): Promise<TavernManagerRunRecord[]> {
    const id = String(sessionId || '').trim();
    if (!id) {return [];}
    const settledLimit = Math.max(1, Math.floor(Number(options.settledLimit) || 18));
    const isMaintenanceRun = (run: TavernManagerRunRecord) => (
        run.trigger === 'accepted_turn' || run.trigger === 'after_turn'
    );
    const compareNewestFirst = (left: TavernManagerRunRecord, right: TavernManagerRunRecord) => (
        Number(right.updatedAt) - Number(left.updatedAt)
        || String(right.id).localeCompare(String(left.id))
    );
    const table = tavernManagerRunsTable as unknown as DexieRangeTable<TavernManagerRunRecord>;
    const collectSummaries = async (collection: DexieRangeCollection<TavernManagerRunRecord>) => {
        const summaries: TavernManagerRunRecord[] = [];
        await collection.each((run) => summaries.push(projectTavernManagerRunSummary(run)));
        return summaries;
    };
    return await db.transaction('r', tavernManagerRunsTable, async () => {
        const latest = table
            .where('[sessionId+updatedAt]')
            .between([id, DexieRangeKeys.minKey], [id, DexieRangeKeys.maxKey], true, true)
            .reverse()
            .filter((run) => isMaintenanceRun(run) && run.status !== 'queued' && run.status !== 'running')
            .limit(settledLimit);
        const active = (status: 'queued' | 'running') => table
            .where('[sessionId+status+updatedAt]')
            .between([id, status, DexieRangeKeys.minKey], [id, status, DexieRangeKeys.maxKey], true, true)
            .filter(isMaintenanceRun);
        const [latestRuns, queuedRuns, runningRuns] = await Promise.all([
            collectSummaries(latest),
            collectSummaries(active('queued')),
            collectSummaries(active('running')),
        ]);
        const selected = new Map<string, TavernManagerRunRecord>();
        [...latestRuns, ...queuedRuns, ...runningRuns].forEach((run) => selected.set(run.id, run));
        const activeRuns = [...selected.values()]
            .filter((run) => run.status === 'queued' || run.status === 'running');
        const settledRuns = [...selected.values()]
            .filter((run) => run.status !== 'queued' && run.status !== 'running')
            .sort(compareNewestFirst)
            .slice(0, settledLimit);
        return [...activeRuns, ...settledRuns].sort(compareNewestFirst);
    });
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

export function hashTavernManagerStateValue(value: unknown): string {
    return hashSerializableState(value);
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

export async function rollbackManagerRunWrites(managerRunId = '', options: {
    expectedLeaseOwnerId: string;
    expectedStatus: TavernManagerRunStatus;
    /** Workers default to a live lease; external message-range rollback opts out explicitly. */
    requireUnexpiredLease?: boolean;
    finalStatus?: TavernManagerRunStatus;
    finalError?: string;
    domains?: Array<'memory' | 'state'>;
}): Promise<{
    rolledBack: number;
    conflicts: string[];
    skipped: number;
    managerRun: TavernManagerRunRecord | null;
}> {
    const id = String(managerRunId || '').trim();
    if (!id) {return { rolledBack: 0, conflicts: [], skipped: 0, managerRun: null };}
    const domains = new Set(options.domains || ['memory', 'state']);
    return await db.transaction(
        'rw',
        tavernManagerRunsTable,
        tavernManagerMemorySnapshotsTable,
        tavernManagerStateSnapshotsTable,
        tavernMemoryFilesTable,
        tavernMemoryIndexesTable,
        tavernStateDocumentsTable,
        tavernStatePatchesTable,
        tavernSessionsTable,
        async () => {
            const run = await tavernManagerRunsTable.get(id);
            if (!run) {return { rolledBack: 0, conflicts: [], skipped: 0, managerRun: null };}
            if (run.status !== options.expectedStatus) {
                throw new Error('manager_lease_lost');
            }
            if (String(run.leaseOwnerId || '') !== String(options.expectedLeaseOwnerId || '')) {
                throw new Error('manager_lease_lost');
            }
            const requireUnexpiredLease = options.requireUnexpiredLease ?? Boolean(options.expectedLeaseOwnerId);
            if (requireUnexpiredLease && Number(run.leaseExpiresAt) <= now()) {
                throw new Error('manager_lease_lost');
            }
            let rolledBack = 0;
            let skipped = 0;
            const conflicts: string[] = [];
            const timestamp = now();

            if (domains.has('memory')) {
                const snapshots = (await tavernManagerMemorySnapshotsTable.where('managerRunId').equals(id).toArray())
                    .sort((left, right) => Number(right.updatedAt) - Number(left.updatedAt));
                for (const snapshot of snapshots) {
                    if (['rolled_back', 'skipped'].includes(snapshot.rollbackStatus)) {
                        skipped += 1;
                        continue;
                    }
                    if (!snapshot.afterHash) {
                        skipped += 1;
                        await tavernManagerMemorySnapshotsTable.update([snapshot.managerRunId, snapshot.path], {
                            rollbackStatus: 'skipped',
                            error: 'snapshot_after_hash_missing',
                            updatedAt: timestamp,
                        });
                        continue;
                    }
                    const current = await tavernMemoryFilesTable.get([snapshot.sessionId, snapshot.path]) || null;
                    if (hashTavernMemoryRecord(current) !== snapshot.afterHash) {
                        conflicts.push(snapshot.path);
                        await tavernManagerMemorySnapshotsTable.update([snapshot.managerRunId, snapshot.path], {
                            rollbackStatus: 'conflict',
                            error: 'rollback_conflict_current_file_changed',
                            updatedAt: timestamp,
                        });
                        continue;
                    }
                    if (snapshot.beforeExists && snapshot.beforeFile) {
                        await tavernMemoryFilesTable.put(cloneSerializable(snapshot.beforeFile, snapshot.beforeFile));
                    } else {
                        await tavernMemoryFilesTable.delete([snapshot.sessionId, snapshot.path]);
                    }
                    await tavernManagerMemorySnapshotsTable.update([snapshot.managerRunId, snapshot.path], {
                        rollbackStatus: 'rolled_back',
                        error: '',
                        updatedAt: timestamp,
                    });
                    rolledBack += 1;
                }
                if (snapshots.length) {
                    const existingIndex = await tavernMemoryIndexesTable.get([run.sessionId, 'markdown-derived']);
                    await tavernMemoryIndexesTable.put({
                        sessionId: run.sessionId,
                        kind: 'markdown-derived',
                        status: 'stale',
                        error: conflicts.length ? `rollback_conflict:${conflicts.join(',')}` : '',
                        sourceFingerprint: '',
                        derivedAt: timestamp,
                        updatedAt: timestamp,
                        files: Array.isArray(existingIndex?.files) ? existingIndex.files : [],
                    });
                }
            }

            if (domains.has('state')) {
                const snapshots = (await tavernManagerStateSnapshotsTable.where('managerRunId').equals(id).toArray())
                    .sort((left, right) => Number(right.updatedAt) - Number(left.updatedAt));
                for (const snapshot of snapshots) {
                    if (['rolled_back', 'skipped'].includes(snapshot.rollbackStatus)) {
                        skipped += 1;
                        continue;
                    }
                    if (!snapshot.afterHash) {
                        skipped += 1;
                        await tavernManagerStateSnapshotsTable.update([snapshot.managerRunId, snapshot.docType, snapshot.docId], {
                            rollbackStatus: 'skipped',
                            error: 'snapshot_after_hash_missing',
                            updatedAt: timestamp,
                        });
                        continue;
                    }
                    if (snapshot.docType === TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_TYPE) {
                        const session = await tavernSessionsTable.get(snapshot.sessionId);
                        const currentValue = String(session?.state?.activeMapDocId || TAVERN_MAP_DOC_ID);
                        if (hashTavernManagerStateValue(currentValue) !== snapshot.afterHash) {
                            conflicts.push(`state/${snapshot.docType}/${snapshot.docId}`);
                            await tavernManagerStateSnapshotsTable.update([snapshot.managerRunId, snapshot.docType, snapshot.docId], {
                                rollbackStatus: 'conflict',
                                error: 'rollback_conflict_current_session_state_changed',
                                updatedAt: timestamp,
                            });
                            continue;
                        }
                        if (session) {
                            await tavernSessionsTable.update(snapshot.sessionId, {
                                state: {
                                    ...(session.state || {}),
                                    activeMapDocId: String(snapshot.beforeValue || TAVERN_MAP_DOC_ID),
                                },
                                updatedAt: timestamp,
                            });
                        }
                    } else {
                        const current = await tavernStateDocumentsTable.get([snapshot.sessionId, snapshot.docType, snapshot.docId]) || null;
                        if (hashTavernStateDocument(current) !== snapshot.afterHash) {
                            conflicts.push(`state/${snapshot.docType}/${snapshot.docId}`);
                            await tavernManagerStateSnapshotsTable.update([snapshot.managerRunId, snapshot.docType, snapshot.docId], {
                                rollbackStatus: 'conflict',
                                error: 'rollback_conflict_current_document_changed',
                                updatedAt: timestamp,
                            });
                            continue;
                        }
                        if (snapshot.beforeExists && snapshot.beforeDocument) {
                            await tavernStateDocumentsTable.put(cloneSerializable(snapshot.beforeDocument, snapshot.beforeDocument));
                        } else {
                            await tavernStateDocumentsTable.delete([snapshot.sessionId, snapshot.docType, snapshot.docId]);
                        }
                    }
                    await tavernManagerStateSnapshotsTable.update([snapshot.managerRunId, snapshot.docType, snapshot.docId], {
                        rollbackStatus: 'rolled_back',
                        error: '',
                        updatedAt: timestamp,
                    });
                    const patches = (await tavernStatePatchesTable.where('managerRunId').equals(id).toArray())
                        .filter((patch: TavernStructuredStatePatchRecord) => patch.docType === snapshot.docType
                            && patch.docId === snapshot.docId
                            && patch.status !== 'rolled_back');
                    await Promise.all(patches.map((patch) => tavernStatePatchesTable.update(patch.id, {
                        status: 'rolled_back',
                        updatedAt: timestamp,
                    })));
                    rolledBack += 1;
                }
            }

            const finalError = mergeRollbackError(
                options.finalError === undefined ? run.error : options.finalError,
                conflicts,
            );
            if (options.finalStatus) {
                await tavernManagerRunsTable.update(id, {
                    status: options.finalStatus,
                    leaseOwnerId: '',
                    leaseExpiresAt: 0,
                    error: finalError,
                    updatedAt: timestamp,
                });
            }
            await tavernSessionsTable.update(run.sessionId, { updatedAt: timestamp });
            return {
                rolledBack,
                conflicts,
                skipped,
                managerRun: await tavernManagerRunsTable.get(id) || run,
            };
        },
    );
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
    const requestedLimit = Number(input.limit);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.floor(requestedLimit)
        : 0;
    const prefix = [sessionId];
    let index = '[sessionId+status+revision]';
    if (docType && docId) {
        index = '[sessionId+docType+docId+status+revision]';
        prefix.push(docType, docId);
    } else if (docType) {
        index = '[sessionId+docType+status+revision]';
        prefix.push(docType);
    } else if (docId) {
        index = '[sessionId+docId+status+revision]';
        prefix.push(docId);
    }
    const statePatchTable = tavernStatePatchesTable as unknown as DexieRangeTable<TavernStructuredStatePatchRecord>;
    const loadStatus = (status: TavernStructuredStatePatchRecord['status']) => {
        const rows = statePatchTable
            .where(index)
            .between(
                [...prefix, status, DexieRangeKeys.minKey],
                [...prefix, status, DexieRangeKeys.maxKey],
                true,
                true,
            );
        return limit ? rows.reverse().limit(limit).toArray() : rows.toArray();
    };
    const compareOldestFirst = (
        left: TavernStructuredStatePatchRecord,
        right: TavernStructuredStatePatchRecord,
    ) => {
        const revisionDelta = Number(left.revision) - Number(right.revision);
        if (revisionDelta) {return revisionDelta;}
        if (left.id === right.id) {return 0;}
        return left.id < right.id ? -1 : 1;
    };
    return await db.transaction('r', tavernStatePatchesTable, async () => {
        const statuses: TavernStructuredStatePatchRecord['status'][] = input.includeRolledBack
            ? ['active', 'rolled_back']
            : ['active'];
        const branches = await Promise.all(statuses.map(loadStatus));
        const rows = branches.flat();
        if (!limit) {return rows.sort(compareOldestFirst);}
        return rows
            .sort((left, right) => compareOldestFirst(right, left))
            .slice(0, limit)
            .sort(compareOldestFirst);
    });
}

/**
 * Reads one active structured-state history page without materializing the
 * rest of the document's patch log in JavaScript. The full patch records
 * remain the audit and rollback source in IndexedDB.
 */
export async function listTavernStructuredStatePatchPage(input: {
    sessionId?: string;
    docType?: TavernStructuredStateDocType | string;
    docId?: string;
    limit?: number;
    offset?: number;
    tail?: number;
} = {}): Promise<{
    patches: TavernStructuredStatePatchRecord[];
    total: number;
    truncated: boolean;
    nextOffset: number;
}> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return { patches: [], total: 0, truncated: false, nextOffset: 0 };}
    const docType = String(input.docType || '').trim();
    const docId = String(input.docId || '').trim();
    const requestedLimit = Math.floor(Number(input.limit) || 20);
    const limit = Math.max(1, requestedLimit);
    const offset = Math.max(0, Math.floor(Number(input.offset) || 0));
    const requestedTail = Math.max(0, Math.floor(Number(input.tail) || 0));
    const prefix = [sessionId];
    let index = '[sessionId+status+revision]';
    if (docType && docId) {
        index = '[sessionId+docType+docId+status+revision]';
        prefix.push(docType, docId);
    } else if (docType) {
        index = '[sessionId+docType+status+revision]';
        prefix.push(docType);
    } else if (docId) {
        index = '[sessionId+docId+status+revision]';
        prefix.push(docId);
    }
    const compareOldestFirst = (
        left: TavernStructuredStatePatchRecord,
        right: TavernStructuredStatePatchRecord,
    ) => Number(left.revision) - Number(right.revision)
        || (left.id === right.id ? 0 : left.id < right.id ? -1 : 1);
    const statePatchTable = tavernStatePatchesTable as unknown as DexieRangeTable<TavernStructuredStatePatchRecord>;
    return await db.transaction('r', tavernStatePatchesTable, async () => {
        const range = () => statePatchTable
            .where(index)
            .between(
                [...prefix, 'active', DexieRangeKeys.minKey],
                [...prefix, 'active', DexieRangeKeys.maxKey],
                true,
                true,
            );
        const [total, rows] = await Promise.all([
            range().count(),
            requestedTail > 0
                ? range().reverse().limit(Math.min(limit, requestedTail)).toArray()
                : range().offset(offset).limit(limit).toArray(),
        ]);
        const patches = rows.sort(compareOldestFirst);
        const start = requestedTail > 0 ? Math.max(0, total - patches.length) : offset;
        const nextOffset = start + patches.length < total ? start + patches.length : 0;
        return {
            patches,
            total,
            truncated: nextOffset > 0,
            nextOffset,
        };
    });
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
    docType?: TavernManagerStateSnapshotResourceType | string;
    docId?: string;
}): Promise<TavernManagerStateSnapshotRecord | null> {
    const managerRunId = String(input.managerRunId || '').trim();
    const sessionId = String(input.sessionId || '').trim();
    const docType = String(input.docType || 'tavern.map') as TavernManagerStateSnapshotResourceType;
    const docId = String(input.docId || 'main').trim() || 'main';
    if (!managerRunId || !sessionId || !docType || !docId) {return null;}
    const existingSnapshot = await tavernManagerStateSnapshotsTable.get([managerRunId, docType, docId]);
    if (existingSnapshot) {return existingSnapshot;}
    const timestamp = now();
    const beforeDocument = docType === TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_TYPE
        ? undefined
        : await getTavernStructuredStateDocument(sessionId, docType, docId);
    const session = docType === TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_TYPE
        ? await tavernSessionsTable.get(sessionId)
        : null;
    const beforeValue = docType === TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_TYPE
        ? String(session?.state?.activeMapDocId || TAVERN_MAP_DOC_ID)
        : undefined;
    const snapshot: TavernManagerStateSnapshotRecord = {
        managerRunId,
        sessionId,
        docType,
        docId,
        beforeExists: !!beforeDocument,
        beforeDocument: beforeDocument ? cloneSerializable(beforeDocument, undefined) : undefined,
        beforeValue,
        beforeHash: docType === TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_TYPE
            ? hashTavernManagerStateValue(beforeValue)
            : hashTavernStateDocument(beforeDocument),
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
    docType?: TavernManagerStateSnapshotResourceType | string;
    docId?: string;
}): Promise<TavernManagerStateSnapshotRecord | null> {
    const managerRunId = String(input.managerRunId || '').trim();
    const sessionId = String(input.sessionId || '').trim();
    const docType = String(input.docType || 'tavern.map') as TavernManagerStateSnapshotResourceType;
    const docId = String(input.docId || 'main').trim() || 'main';
    if (!managerRunId || !sessionId || !docType || !docId) {return null;}
    const snapshot = await ensureTavernManagerStateSnapshot({ managerRunId, sessionId, docType, docId });
    if (!snapshot) {return null;}
    const afterDocument = docType === TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_TYPE
        ? undefined
        : await getTavernStructuredStateDocument(sessionId, docType, docId);
    const session = docType === TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_TYPE
        ? await tavernSessionsTable.get(sessionId)
        : null;
    const afterValue = docType === TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_TYPE
        ? String(session?.state?.activeMapDocId || TAVERN_MAP_DOC_ID)
        : undefined;
    await tavernManagerStateSnapshotsTable.update([managerRunId, docType, docId], {
        afterHash: docType === TAVERN_MANAGER_ACTIVE_MAP_RESOURCE_TYPE
            ? hashTavernManagerStateValue(afterValue)
            : hashTavernStateDocument(afterDocument),
        afterValue,
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
        // A range rollback invalidates work that could still be adopted from the
        // removed message source.  A prior worker cancellation/failure is already
        // its own terminal audit fact; revisiting the range must not relabel it.
        if (!['queued', 'running', 'completed'].includes(run.status)) {
            continue;
        }
        const [memorySnapshots, stateSnapshots] = await Promise.all([
            listTavernManagerMemorySnapshots(run.id),
            listTavernManagerStateSnapshots(run.id),
        ]);
        const hasWrittenSnapshot = memorySnapshots.some((snapshot) => String(snapshot.afterHash || '').trim())
            || stateSnapshots.some((snapshot) => String(snapshot.afterHash || '').trim());
        const lifecycleOptions = {
            expectedStatus: run.status,
            expectedLeaseOwnerId: String(run.leaseOwnerId || ''),
            // This path is a user-initiated source-history change, not work by the leased worker.
            requireUnexpiredLease: false,
        } as const;
        if (hasWrittenSnapshot) {
            let result;
            try {
                result = await rollbackManagerRunWrites(run.id, {
                    ...lifecycleOptions,
                    finalStatus: 'superseded',
                    finalError: 'manager_source_messages_superseded',
                });
            } catch (error) {
                if (error instanceof Error && error.message === 'manager_lease_lost') {continue;}
                throw error;
            }
            rolledBack += result.rolledBack;
            skipped += result.skipped;
            conflicts.push(...result.conflicts);
            continue;
        }
        try {
            await transitionTavernManagerRun(run.id, {
                status: 'superseded',
                error: 'manager_source_messages_superseded',
            }, lifecycleOptions);
        } catch (error) {
            if (!(error instanceof Error && error.message === 'manager_lease_lost')) {throw error;}
        }
    }
    return {
        runIds: runs.map((run) => run.id),
        rolledBack,
        conflicts,
        skipped,
    };
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
