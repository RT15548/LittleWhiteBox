// Compatibility: user-retained Fourth Wall sidecars written before context memory (schema 1).
// Remove only when importing these saved files is explicitly retired.
import { parseFourthWallChatState } from '../domain/state.js';
import type { FourthWallPartition } from '../types.js';

export interface FourthWallChatStateV1 {
    settings: { maxChatLayers: number; maxMetaTurns: number; stream: boolean; disableAssistantPrefill: boolean };
    sessions: Array<{
        id: string; name: string; createdAt: number;
        history: Array<{ role: 'user' | 'ai'; content: string; ts: number; thinking?: string; type?: string }>;
    }>;
    activeSessionId: string;
}
export interface FourthWallPartitionV1 { schemaVersion: 1; state: FourthWallChatStateV1 }

function requirePersistedRecord(value: unknown, path: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError(`${path} must be an object`);
    }
    return value as Record<string, unknown>;
}

function requireExactKeys(value: Record<string, unknown>, expected: readonly string[], path: string): void {
    const actual = Object.keys(value).sort();
    const canonical = [...expected].sort();
    if (actual.length !== canonical.length || actual.some((key, index) => key !== canonical[index])) {
        throw new TypeError(`${path} has non-canonical fields`);
    }
}

function requirePersistedString(value: unknown, path: string): string {
    if (typeof value !== 'string') {
        throw new TypeError(`${path} must be a string`);
    }
    return value;
}

function requirePersistedInteger(value: unknown, path: string, min: number, max: number): number {
    if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
        throw new TypeError(`${path} must be an integer from ${min} to ${max}`);
    }
    return Number(value);
}

export function validateFourthWallChatStateV1(
    value: unknown,
    path = 'partitions.fourthWall',
): asserts value is FourthWallChatStateV1 {
    const state = requirePersistedRecord(value, path);
    requireExactKeys(state, ['settings', 'sessions', 'activeSessionId'], path);
    const settings = requirePersistedRecord(state.settings, `${path}.settings`);
    requireExactKeys(
        settings,
        ['maxChatLayers', 'maxMetaTurns', 'stream', 'disableAssistantPrefill'],
        `${path}.settings`,
    );
    requirePersistedInteger(settings.maxChatLayers, `${path}.settings.maxChatLayers`, 1, 9999);
    requirePersistedInteger(settings.maxMetaTurns, `${path}.settings.maxMetaTurns`, 1, 9999);
    if (typeof settings.stream !== 'boolean' || typeof settings.disableAssistantPrefill !== 'boolean') {
        throw new TypeError(`${path}.settings flags must be boolean`);
    }
    if (!Array.isArray(state.sessions) || state.sessions.length === 0) {
        throw new TypeError(`${path}.sessions must not be empty`);
    }
    const ids = new Set<string>();
    for (const [index, rawSession] of state.sessions.entries()) {
        const session = requirePersistedRecord(rawSession, `${path}.sessions[${index}]`);
        requireExactKeys(session, ['id', 'name', 'createdAt', 'history'], `${path}.sessions[${index}]`);
        const id = requirePersistedString(session.id, `${path}.sessions[${index}].id`);
        if (!id || ids.has(id)) {
            throw new TypeError(`${path}.sessions ids must be non-empty and unique`);
        }
        ids.add(id);
        requirePersistedString(session.name, `${path}.sessions[${index}].name`);
        if (!Number.isFinite(session.createdAt)) {
            throw new TypeError(`${path}.sessions[${index}].createdAt must be finite`);
        }
        if (!Array.isArray(session.history)) {
            throw new TypeError(`${path}.sessions[${index}].history must be an array`);
        }
        for (const [messageIndex, rawMessage] of session.history.entries()) {
            const message = requirePersistedRecord(
                rawMessage,
                `${path}.sessions[${index}].history[${messageIndex}]`,
            );
            const messageKeys = ['role', 'content', 'ts'];
            if (message.thinking !== undefined) { messageKeys.push('thinking'); }
            if (message.type !== undefined) { messageKeys.push('type'); }
            requireExactKeys(message, messageKeys, `${path}.sessions[${index}].history[${messageIndex}]`);
            if (message.role !== 'user' && message.role !== 'ai') {
                throw new TypeError('fourth-wall message role is invalid');
            }
            requirePersistedString(message.content, 'fourth-wall message content');
            if (!Number.isFinite(message.ts)) {
                throw new TypeError('fourth-wall message timestamp must be finite');
            }
            if (message.thinking !== undefined) { requirePersistedString(message.thinking, 'message.thinking'); }
            if (message.type !== undefined) { requirePersistedString(message.type, 'message.type'); }
        }
    }
    const activeSessionId = requirePersistedString(state.activeSessionId, `${path}.activeSessionId`);
    if (!ids.has(activeSessionId)) {
        throw new TypeError(`${path}.activeSessionId must reference a session`);
    }
}

export function parseFourthWallChatStateV1(value: unknown): FourthWallChatStateV1 {
    validateFourthWallChatStateV1(value);
    return structuredClone(value);
}


export function upgradeFourthWallV1(partition: FourthWallPartitionV1): FourthWallPartition {
    const old = parseFourthWallChatStateV1(partition.state);
    return { schemaVersion: 2, state: parseFourthWallChatState({
        settings: {
            maxChatLayers: old.settings.maxChatLayers === 9999 ? 20 : old.settings.maxChatLayers,
            stream: old.settings.stream,
            disableAssistantPrefill: old.settings.disableAssistantPrefill,
        },
        activeSessionId: old.activeSessionId,
        sessions: old.sessions.map(session => ({ ...session, memory: '', archivedCount: 0 })),
    }) };
}
