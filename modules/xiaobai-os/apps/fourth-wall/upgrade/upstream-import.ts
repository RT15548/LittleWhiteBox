import type { CapturedChatBinding } from '../../../kernel/contracts.js';
import type {
    ChatMetadata,
    ChatMetadataAdapter,
    ChatMetadataCapture,
    ChatReferenceInstallEffect,
} from '../../../storage/chat-reference.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';
import { createDefaultFourthWallChatState } from '../domain/defaults.js';
import { parseFourthWallChatState } from '../domain/state.js';
import type {
    FourthWallChatState,
    FourthWallMessageData,
    FourthWallPartition,
} from '../types.js';

type UnknownRecord = Record<string, unknown>;

export class UpstreamFourthWallImportError extends Error {
    readonly code = 'invalid_upstream_fourth_wall';
    readonly retryable = false;

    constructor(message: string) {
        super(message);
        this.name = 'UpstreamFourthWallImportError';
    }
}

function isRecord(value: unknown): value is UnknownRecord {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function requireRecord(value: unknown, path: string): UnknownRecord {
    if (!isRecord(value)) { throw new UpstreamFourthWallImportError(`${path} must be an object`); }
    return value;
}

function requireString(value: unknown, path: string): string {
    if (typeof value !== 'string') { throw new UpstreamFourthWallImportError(`${path} must be a string`); }
    return value;
}

function requireFinite(value: unknown, path: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new UpstreamFourthWallImportError(`${path} must be a finite number`);
    }
    return value;
}

function optionalBoolean(value: unknown, fallback: boolean, path: string): boolean {
    if (value === undefined) { return fallback; }
    if (typeof value !== 'boolean') { throw new UpstreamFourthWallImportError(`${path} must be a boolean`); }
    return value;
}

function optionalInteger(value: unknown, fallback: number, path: string): number {
    if (value === undefined) { return fallback; }
    if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 9999) {
        throw new UpstreamFourthWallImportError(`${path} must be an integer from 1 to 9999`);
    }
    return Number(value);
}

function copyHistory(value: unknown, path: string): FourthWallMessageData[] {
    if (!Array.isArray(value)) { throw new UpstreamFourthWallImportError(`${path} must be an array`); }
    return value.map((raw, index) => {
        const message = requireRecord(raw, `${path}[${index}]`);
        if (message.role !== 'user' && message.role !== 'ai') {
            throw new UpstreamFourthWallImportError(`${path}[${index}].role must be user or ai`);
        }
        const copied: FourthWallMessageData = {
            role: message.role,
            content: requireString(message.content, `${path}[${index}].content`),
            ts: requireFinite(message.ts, `${path}[${index}].ts`),
        };
        if (message.thinking !== undefined) {
            copied.thinking = requireString(message.thinking, `${path}[${index}].thinking`);
        }
        if (message.type !== undefined) {
            copied.type = requireString(message.type, `${path}[${index}].type`);
        }
        return copied;
    });
}

export function readUpstreamFourthWall(metadata: unknown, chatId: string): UnknownRecord | null {
    if (!isRecord(metadata) || !chatId) { return null; }
    const chat = metadata[chatId];
    if (chat === undefined) { return null; }
    const chatRecord = requireRecord(chat, `chat_metadata.${chatId}`);
    const extensions = chatRecord.extensions;
    if (extensions === undefined) { return null; }
    const extensionRecord = requireRecord(extensions, `chat_metadata.${chatId}.extensions`);
    const root = extensionRecord.LittleWhiteBox;
    if (root === undefined) { return null; }
    const rootRecord = requireRecord(root, `chat_metadata.${chatId}.extensions.LittleWhiteBox`);
    if (rootRecord.fw === undefined) { return null; }
    return requireRecord(rootRecord.fw, `chat_metadata.${chatId}.extensions.LittleWhiteBox.fw`);
}

export function convertUpstreamFourthWall(
    legacy: unknown,
    createdAt = Date.now(),
): FourthWallPartition {
    const source = requireRecord(legacy, 'fw');
    const defaults = createDefaultFourthWallChatState(createdAt);
    const rawSettings = source.settings === undefined ? {} : requireRecord(source.settings, 'fw.settings');
    const settings = {
        maxChatLayers: rawSettings.maxChatLayers === 9999 ? 20 : optionalInteger(rawSettings.maxChatLayers, 20, 'fw.settings.maxChatLayers'),
        stream: optionalBoolean(rawSettings.stream, true, 'fw.settings.stream'),
        disableAssistantPrefill: optionalBoolean(
            rawSettings.disableAssistantPrefill,
            false,
            'fw.settings.disableAssistantPrefill',
        ),
    };
    let sessions: FourthWallChatState['sessions'];
    if (source.sessions !== undefined) {
        if (!Array.isArray(source.sessions) || source.sessions.length === 0) {
            throw new UpstreamFourthWallImportError('fw.sessions must be a non-empty array');
        }
        sessions = source.sessions.map((raw, index) => {
            const path = `fw.sessions[${index}]`;
            const session = requireRecord(raw, path);
            return {
                id: requireString(session.id, `${path}.id`),
                name: requireString(session.name, `${path}.name`),
                createdAt: requireFinite(session.createdAt, `${path}.createdAt`),
                history: copyHistory(session.history, `${path}.history`),
                memory: '',
                archivedCount: 0,
            };
        });
    } else {
        sessions = [{
            ...defaults.sessions[0],
            history: copyHistory(source.history ?? [], 'fw.history'),
        }];
    }
    const sessionIds = new Set(sessions.map(session => session.id));
    const activeSessionId = typeof source.activeSessionId === 'string' && sessionIds.has(source.activeSessionId)
        ? source.activeSessionId
        : sessions[0]?.id ?? '';
    return {
        schemaVersion: 2,
        state: parseFourthWallChatState({ settings, sessions, activeSessionId }),
    };
}

function sameCapture(left: ChatMetadataCapture, right: CapturedChatBinding): boolean {
    return left.identityKey === right.identityKey
        && left.binding.kind === right.binding.kind
        && left.binding.ownerLocator === right.binding.ownerLocator
        && left.binding.chatId === right.binding.chatId;
}

function removeLegacy(metadata: ChatMetadata, chatId: string, expected: UnknownRecord): void {
    const chat = metadata[chatId];
    if (!isRecord(chat) || !isRecord(chat.extensions)) { return; }
    const root = chat.extensions.LittleWhiteBox;
    if (!isRecord(root) || !jsonValuesEqual(root.fw, expected)) {
        throw new UpstreamFourthWallImportError('upstream Fourth Wall data changed during import');
    }
    delete root.fw;
    if (Object.keys(root).length === 0) { delete chat.extensions.LittleWhiteBox; }
    if (Object.keys(chat.extensions).length === 0) { delete chat.extensions; }
    if (Object.keys(chat).length === 0) { delete metadata[chatId]; }
}

function restoreLegacy(metadata: ChatMetadata, chatId: string, snapshot: UnknownRecord): void {
    if (!isRecord(metadata[chatId])) { metadata[chatId] = {}; }
    const chat = metadata[chatId] as UnknownRecord;
    if (!isRecord(chat.extensions)) { chat.extensions = {}; }
    const extensions = chat.extensions as UnknownRecord;
    if (!isRecord(extensions.LittleWhiteBox)) { extensions.LittleWhiteBox = {}; }
    const root = extensions.LittleWhiteBox as UnknownRecord;
    if (!Object.hasOwn(root, 'fw')) { root.fw = structuredClone(snapshot); }
}

export interface FourthWallUpstreamImport {
    prepareInitialPartitions(capture: CapturedChatBinding): Promise<Record<string, unknown>>;
    createReferenceInstallEffect(capture: ChatMetadataCapture): ChatReferenceInstallEffect | null;
    readCurrentPartition(): { identityKey: string; partition: FourthWallPartition } | null;
}

export function createFourthWallUpstreamImport(
    metadata: ChatMetadataAdapter,
    { now = Date.now }: { now?: () => number } = {},
): FourthWallUpstreamImport {
    const prepared = new Map<string, { legacy: UnknownRecord; partition: FourthWallPartition }>();
    return Object.freeze({
        readCurrentPartition() {
            const current = metadata.capture();
            if (!current) { return null; }
            const legacy = readUpstreamFourthWall(current.metadata, current.binding.chatId);
            return legacy
                ? {
                    identityKey: current.identityKey,
                    partition: convertUpstreamFourthWall(legacy, now()),
                }
                : null;
        },
        async prepareInitialPartitions(capture: CapturedChatBinding) {
            const current = metadata.capture();
            if (!current || !sameCapture(current, capture)) {
                throw Object.assign(new Error('chat changed before upstream Fourth Wall import'), {
                    code: 'chat_changed',
                    retryable: true,
                });
            }
            try {
                const legacy = readUpstreamFourthWall(current.metadata, current.binding.chatId);
                if (!legacy) {
                    prepared.delete(capture.identityKey);
                    return {};
                }
                const entry = {
                    legacy: structuredClone(legacy),
                    partition: convertUpstreamFourthWall(legacy, now()),
                };
                prepared.set(capture.identityKey, entry);
                return { fourthWall: structuredClone(entry.partition) };
            } catch (error) {
                if (!(error instanceof UpstreamFourthWallImportError)) { throw error; }
                prepared.delete(capture.identityKey);
                return {};
            }
        },
        createReferenceInstallEffect(capture: ChatMetadataCapture) {
            const entry = prepared.get(capture.identityKey);
            if (!entry) { return null; }
            const current = readUpstreamFourthWall(capture.metadata, capture.binding.chatId);
            if (!current || !jsonValuesEqual(current, entry.legacy)) {
                throw new UpstreamFourthWallImportError('upstream Fourth Wall data changed before reference install');
            }
            prepared.delete(capture.identityKey);
            let applied = false;
            return {
                apply() {
                    removeLegacy(capture.metadata, capture.binding.chatId, entry.legacy);
                    applied = true;
                },
                rollback() {
                    if (applied) { restoreLegacy(capture.metadata, capture.binding.chatId, entry.legacy); }
                    applied = false;
                },
                matches(persisted: ChatMetadata) {
                    try { return readUpstreamFourthWall(persisted, capture.binding.chatId) === null; }
                    catch { return false; }
                },
            };
        },
    });
}
