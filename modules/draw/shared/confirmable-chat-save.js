export const CONFIRMABLE_CHAT_PHASE_TIMEOUT_MS = 15_000;

export class ConfirmableChatSaveUncertainError extends Error {
    constructor(reason, message, { cause, saveError } = {}) {
        super(message);
        this.name = 'ConfirmableChatSaveUncertainError';
        this.code = 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN';
        this.reason = reason;
        this.uncertain = true;
        if (cause !== undefined) this.cause = cause;
        if (saveError !== undefined) this.saveError = saveError;
    }
}

function isPresent(value) {
    return value !== undefined && value !== null && String(value).length > 0;
}

export function createConfirmableChatTarget(ctx) {
    if (!ctx || typeof ctx.saveChat !== 'function' || typeof ctx.getRequestHeaders !== 'function') {
        throw new ConfirmableChatSaveUncertainError(
            'target_unavailable',
            'Current chat cannot be saved and read back',
        );
    }

    if (!isPresent(ctx.chatId)) {
        throw new ConfirmableChatSaveUncertainError(
            'target_unavailable',
            'Current chat has no persistent identity',
        );
    }

    const chatId = String(ctx.chatId);
    if (isPresent(ctx.groupId)) {
        return Object.freeze({
            kind: 'group',
            chatId,
            endpoint: '/api/chats/group/get',
            body: Object.freeze({ id: chatId }),
        });
    }

    const character = ctx.characters?.[ctx.characterId];
    if (!character || !isPresent(character.avatar)) {
        throw new ConfirmableChatSaveUncertainError(
            'target_unavailable',
            'Current character chat has no persistent identity',
        );
    }

    return Object.freeze({
        kind: 'character',
        chatId,
        endpoint: '/api/chats/get',
        body: Object.freeze({
            ch_name: String(character.name || ''),
            file_name: chatId,
            avatar_url: String(character.avatar),
        }),
    });
}

async function readPersistedChat(ctx, target, fetchImpl, timeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetchImpl(target.endpoint, {
            method: 'POST',
            headers: ctx.getRequestHeaders(),
            body: JSON.stringify(target.body),
            cache: 'no-cache',
            signal: controller.signal,
        });
        if (!response?.ok) {
            throw new Error(`Chat read-back failed with HTTP ${response?.status || 0}`);
        }
        const persistedChat = await response.json();
        if (!Array.isArray(persistedChat)) {
            throw new Error('Chat read-back response is not an array');
        }
        return persistedChat;
    } finally {
        clearTimeout(timeout);
    }
}

async function saveWithinTimeout(ctx, timeoutMs) {
    let timeout;
    const save = Promise.resolve().then(() => ctx.saveChat());
    const timedOut = new Promise((_, reject) => {
        timeout = setTimeout(() => {
            const error = new Error('Timed out waiting for SillyTavern to save the chat');
            error.name = 'TimeoutError';
            reject(error);
        }, timeoutMs);
    });
    try {
        await Promise.race([save, timedOut]);
    } finally {
        clearTimeout(timeout);
    }
}

/**
 * Saves the active chat through SillyTavern's save coordinator and confirms the
 * write against the corresponding server-side chat file.
 *
 * @param {object} options
 * @param {object} options.ctx Snapshot returned by SillyTavern.getContext().
 * @param {(persistedChat: object[], target: object) => boolean|Promise<boolean>} options.verify
 * @param {typeof fetch} [options.fetchImpl]
 * @param {number} [options.timeoutMs]
 * @returns {Promise<{target: object}>}
 */
export async function saveChatAndConfirm({
    ctx,
    verify,
    fetchImpl = globalThis.fetch,
    timeoutMs = CONFIRMABLE_CHAT_PHASE_TIMEOUT_MS,
} = {}) {
    if (typeof verify !== 'function') throw new TypeError('verify must be a function');
    if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl must be a function');
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new TypeError('timeoutMs must be positive');

    const target = createConfirmableChatTarget(ctx);
    let saveError;
    try {
        await saveWithinTimeout(ctx, timeoutMs);
    } catch (error) {
        saveError = error;
    }

    let persistedChat;
    try {
        persistedChat = await readPersistedChat(ctx, target, fetchImpl, timeoutMs);
    } catch (error) {
        throw new ConfirmableChatSaveUncertainError(
            'readback_failed',
            'Unable to read back the persisted chat',
            { cause: error, saveError },
        );
    }

    let confirmed;
    try {
        confirmed = await verify(persistedChat, target);
    } catch (error) {
        throw new ConfirmableChatSaveUncertainError(
            'verification_failed',
            'Persisted chat verification failed',
            { cause: error, saveError },
        );
    }
    if (confirmed !== true) {
        throw new ConfirmableChatSaveUncertainError(
            'content_mismatch',
            'Persisted chat does not contain the expected state',
            { saveError },
        );
    }

    return { target };
}

// 只读确认入口。恢复器可凭 journal 中冻结的 target 检查原聊天，即使用户当前已切到别处；
// 它绝不保存当前内存聊天，因此不能用陈旧标签页覆盖服务端正文。
export async function readChatAndConfirm({
    ctx,
    target = createConfirmableChatTarget(ctx),
    verify,
    fetchImpl = globalThis.fetch,
    timeoutMs = CONFIRMABLE_CHAT_PHASE_TIMEOUT_MS,
} = {}) {
    if (!ctx || typeof ctx.getRequestHeaders !== 'function') throw new TypeError('ctx must provide request headers');
    if (!target?.endpoint || !target?.body) throw new TypeError('target must describe a persisted chat');
    if (typeof verify !== 'function') throw new TypeError('verify must be a function');
    if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl must be a function');
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new TypeError('timeoutMs must be positive');
    const persistedChat = await readPersistedChat(ctx, target, fetchImpl, timeoutMs);
    const confirmed = await verify(persistedChat, target);
    return { target, persistedChat, confirmed: confirmed === true };
}
