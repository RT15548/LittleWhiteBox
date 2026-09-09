import type {
    FourthWallChatSettings,
    FourthWallChatState,
    FourthWallMessageData,
    FourthWallSession,
} from '../types.js';

function clone<T>(value: T): T {
    return structuredClone(value);
}

export class FourthWallStateError extends Error {
    readonly code: string;

    constructor(code: string, message: string) {
        super(message);
        this.name = 'FourthWallStateError';
        this.code = code;
    }
}

function requireSession(state: FourthWallChatState, sessionId: string): FourthWallSession {
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) {
        throw new FourthWallStateError('SESSION_NOT_FOUND', '四次元壁记录不存在');
    }
    return session;
}

function requireMessage(session: FourthWallSession, messageIndex: number): FourthWallMessageData {
    if (!Number.isInteger(messageIndex) || messageIndex < 0 || messageIndex >= session.history.length) {
        throw new FourthWallStateError('MESSAGE_NOT_FOUND', '四次元壁消息不存在');
    }
    return session.history[messageIndex];
}

function normalizeName(name: unknown): string {
    const normalized = String(name || '').trim();
    if (!normalized) {
        throw new FourthWallStateError('SESSION_NAME_REQUIRED', '记录名称不能为空');
    }
    return normalized.slice(0, 80);
}

function normalizeChatSettings(
    settings: FourthWallChatSettings,
    patch: Partial<FourthWallChatSettings>,
): FourthWallChatSettings {
    const next = { ...settings };
    if (Object.hasOwn(patch, 'maxChatLayers')) {
        next.maxChatLayers = Number(patch.maxChatLayers);
    }
    if (Object.hasOwn(patch, 'stream')) {
        next.stream = patch.stream === true;
    }
    if (Object.hasOwn(patch, 'disableAssistantPrefill')) {
        next.disableAssistantPrefill = patch.disableAssistantPrefill === true;
    }
    if (!Number.isInteger(next.maxChatLayers) || next.maxChatLayers < 1 || next.maxChatLayers > 9999) {
        throw new FourthWallStateError('INVALID_SETTINGS', '普通聊天层数必须是 1 到 9999 的整数');
    }
    return next;
}

export function getActiveSession(state: FourthWallChatState): FourthWallSession | null {
    return state.sessions.find((session) => session.id === state.activeSessionId) || null;
}

export function updateChatSettings(
    state: FourthWallChatState,
    patch: Partial<FourthWallChatSettings> = {},
): FourthWallChatState {
    const next = clone(state);
    next.settings = normalizeChatSettings(next.settings, patch);
    return next;
}

export function switchSession(state: FourthWallChatState, sessionId: string): FourthWallChatState {
    const next = clone(state);
    requireSession(next, sessionId);
    next.activeSessionId = sessionId;
    return next;
}

export function addSession(
    state: FourthWallChatState,
    { id, name, createdAt }: { id: string; name: unknown; createdAt: number },
): FourthWallChatState {
    const next = clone(state);
    const normalizedId = String(id || '').trim();
    if (!normalizedId || next.sessions.some((session) => session.id === normalizedId)) {
        throw new FourthWallStateError('INVALID_SESSION_ID', '无法创建四次元壁记录');
    }
    next.sessions.push({
        id: normalizedId,
        name: normalizeName(name),
        createdAt: Number(createdAt),
        history: [],
        memory: '',
        archivedCount: 0,
    });
    next.activeSessionId = normalizedId;
    return next;
}

export function renameSession(state: FourthWallChatState, sessionId: string, name: unknown): FourthWallChatState {
    const next = clone(state);
    requireSession(next, sessionId).name = normalizeName(name);
    return next;
}

export function deleteSession(state: FourthWallChatState, sessionId: string): FourthWallChatState {
    if (state.sessions.length <= 1) {
        throw new FourthWallStateError('LAST_SESSION', '至少保留一份四次元壁记录');
    }
    const next = clone(state);
    requireSession(next, sessionId);
    next.sessions = next.sessions.filter((session) => session.id !== sessionId);
    if (next.activeSessionId === sessionId) {
        next.activeSessionId = next.sessions[0].id;
    }
    return next;
}

export function appendMessage(
    state: FourthWallChatState,
    sessionId: string,
    message: FourthWallMessageData,
): FourthWallChatState {
    const next = clone(state);
    const session = requireSession(next, sessionId);
    const content = String(message?.content || '').trim();
    if (!content) {
        throw new FourthWallStateError('MESSAGE_EMPTY', '消息不能为空');
    }
    if (message?.role !== 'user' && message?.role !== 'ai') {
        throw new FourthWallStateError('INVALID_MESSAGE', '消息角色无效');
    }
    const nextMessage: FourthWallMessageData = {
        role: message.role,
        content,
        ts: Number(message.ts),
    };
    if (message.thinking) {
        nextMessage.thinking = String(message.thinking);
    }
    if (message.type) {
        nextMessage.type = String(message.type);
    }
    session.history.push(nextMessage);
    return next;
}

export function editMessage(
    state: FourthWallChatState,
    sessionId: string,
    messageIndex: number,
    content: unknown,
): FourthWallChatState {
    const next = clone(state);
    const session = requireSession(next, sessionId);
    const message = requireMessage(session, messageIndex);
    const normalized = String(content || '').trim();
    if (!normalized) {
        throw new FourthWallStateError('MESSAGE_EMPTY', '消息不能为空');
    }
    message.content = normalized;
    return next;
}

export function deleteMessage(
    state: FourthWallChatState,
    sessionId: string,
    messageIndex: number,
): FourthWallChatState {
    const next = clone(state);
    const session = requireSession(next, sessionId);
    requireMessage(session, messageIndex);
    session.history.splice(messageIndex, 1);
    if (messageIndex < session.archivedCount) { session.archivedCount -= 1; }
    return next;
}

export function clearSession(state: FourthWallChatState, sessionId: string, clearMemory = false): FourthWallChatState {
    const next = clone(state);
    const session = requireSession(next, sessionId);
    session.history = [];
    session.archivedCount = 0;
    if (clearMemory) { session.memory = ''; }
    return next;
}

export function updateMemory(state: FourthWallChatState, sessionId: string, content: string): FourthWallChatState {
    const next = clone(state);
    requireSession(next, sessionId).memory = content.trim();
    return next;
}

export function prepareRegeneration(
    state: FourthWallChatState,
    sessionId: string,
): { state: FourthWallChatState; userInput: string } {
    const next = clone(state);
    const session = requireSession(next, sessionId);
    let userIndex = -1;
    for (let index = session.history.length - 1; index >= 0; index -= 1) {
        if (session.history[index].role === 'user') {
            userIndex = index;
            break;
        }
    }
    if (userIndex < 0) {
        throw new FourthWallStateError('NO_USER_MESSAGE', '没有可重答的用户消息');
    }
    const userInput = session.history[userIndex].content;
    session.history = session.history.slice(0, userIndex + 1);
    session.archivedCount = Math.min(session.archivedCount, userIndex);
    return { state: next, userInput };
}


function requirePersistedRecord(value: unknown, path: string): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new FourthWallStateError('INVALID_CURRENT_DATA', `${path} must be an object`);
    }
    return value as Record<string, unknown>;
}

function requireExactKeys(value: Record<string, unknown>, expected: readonly string[], path: string): void {
    const actual = Object.keys(value).sort();
    const canonical = [...expected].sort();
    if (actual.length !== canonical.length || actual.some((key, index) => key !== canonical[index])) {
        throw new FourthWallStateError('INVALID_CURRENT_DATA', `${path} has non-canonical fields`);
    }
}

function requirePersistedString(value: unknown, path: string): string {
    if (typeof value !== 'string') {
        throw new FourthWallStateError('INVALID_CURRENT_DATA', `${path} must be a string`);
    }
    return value;
}

function requirePersistedInteger(value: unknown, path: string, min: number, max: number): number {
    if (!Number.isInteger(value) || Number(value) < min || Number(value) > max) {
        throw new FourthWallStateError('INVALID_CURRENT_DATA', `${path} must be an integer from ${min} to ${max}`);
    }
    return Number(value);
}

export function validateFourthWallChatState(
    value: unknown,
    path = 'partitions.fourthWall',
): asserts value is FourthWallChatState {
    const state = requirePersistedRecord(value, path);
    requireExactKeys(state, ['settings', 'sessions', 'activeSessionId'], path);
    const settings = requirePersistedRecord(state.settings, `${path}.settings`);
    requireExactKeys(
        settings,
        ['maxChatLayers', 'stream', 'disableAssistantPrefill'],
        `${path}.settings`,
    );
    requirePersistedInteger(settings.maxChatLayers, `${path}.settings.maxChatLayers`, 1, 9999);
    if (typeof settings.stream !== 'boolean' || typeof settings.disableAssistantPrefill !== 'boolean') {
        throw new FourthWallStateError('INVALID_CURRENT_DATA', `${path}.settings flags must be boolean`);
    }
    if (!Array.isArray(state.sessions) || state.sessions.length === 0) {
        throw new FourthWallStateError('INVALID_CURRENT_DATA', `${path}.sessions must not be empty`);
    }
    const ids = new Set<string>();
    for (const [index, rawSession] of state.sessions.entries()) {
        const session = requirePersistedRecord(rawSession, `${path}.sessions[${index}]`);
        requireExactKeys(session, ['id', 'name', 'createdAt', 'history', 'memory', 'archivedCount'], `${path}.sessions[${index}]`);
        const id = requirePersistedString(session.id, `${path}.sessions[${index}].id`);
        if (!id || ids.has(id)) {
            throw new FourthWallStateError('INVALID_CURRENT_DATA', `${path}.sessions ids must be non-empty and unique`);
        }
        ids.add(id);
        requirePersistedString(session.name, `${path}.sessions[${index}].name`);
        if (!Number.isFinite(session.createdAt)) {
            throw new FourthWallStateError('INVALID_CURRENT_DATA', `${path}.sessions[${index}].createdAt must be finite`);
        }
        if (!Array.isArray(session.history)) {
            throw new FourthWallStateError('INVALID_CURRENT_DATA', `${path}.sessions[${index}].history must be an array`);
        }
        requirePersistedString(session.memory, `${path}.sessions[${index}].memory`);
        requirePersistedInteger(session.archivedCount, `${path}.sessions[${index}].archivedCount`, 0, session.history.length);
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
                throw new FourthWallStateError('INVALID_CURRENT_DATA', 'fourth-wall message role is invalid');
            }
            requirePersistedString(message.content, 'fourth-wall message content');
            if (!Number.isFinite(message.ts)) {
                throw new FourthWallStateError('INVALID_CURRENT_DATA', 'fourth-wall message timestamp must be finite');
            }
            if (message.thinking !== undefined) { requirePersistedString(message.thinking, 'message.thinking'); }
            if (message.type !== undefined) { requirePersistedString(message.type, 'message.type'); }
        }
    }
    const activeSessionId = requirePersistedString(state.activeSessionId, `${path}.activeSessionId`);
    if (!ids.has(activeSessionId)) {
        throw new FourthWallStateError('INVALID_CURRENT_DATA', `${path}.activeSessionId must reference a session`);
    }
}

export function parseFourthWallChatState(value: unknown): FourthWallChatState {
    validateFourthWallChatState(value);
    return structuredClone(value);
}
