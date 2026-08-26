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

export class ConfirmableChatSaveBlockedError extends Error {
    constructor(reason, message, { cause } = {}) {
        super(message, cause ? { cause } : undefined);
        this.name = 'ConfirmableChatSaveBlockedError';
        this.code = 'CONFIRMABLE_CHAT_SAVE_BLOCKED';
        this.reason = reason;
        this.saveAttempted = false;
    }
}

const localSaveQueues = new Map();

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

function chatSaveLockName(target) {
    return `littlewhitebox:chat-save:${target.kind}:${target.chatId}`;
}

async function withLocalSaveLock(name, task) {
    const previous = localSaveQueues.get(name) || Promise.resolve();
    let release;
    const current = new Promise(resolve => { release = resolve; });
    const tail = previous.catch(() => {}).then(() => current);
    localSaveQueues.set(name, tail);
    await previous.catch(() => {});
    try {
        return await task();
    } finally {
        release();
        if (localSaveQueues.get(name) === tail) localSaveQueues.delete(name);
    }
}

async function withChatSaveLock(target, task, lockManager) {
    const name = chatSaveLockName(target);
    if (typeof lockManager?.request === 'function') {
        return lockManager.request(name, { mode: 'exclusive' }, task);
    }
    // Node tests and older WebViews still serialize writes in this realm. Modern
    // browsers use Web Locks above, which extends the same exclusion across tabs.
    return withLocalSaveLock(name, task);
}

// ctx.chat 是同一页面内所有画图流程共享的可变对象。同一页面必须把“修改内存
// → 保存并确认”整个区间串行，否则取消 marker 可能被另一条正在保存的流程顺手写入或回滚。
// 跨标签页的同源保存另由 saveChatAndConfirm 的 Web Lock 串行；恢复路径只对自己
// 实际修改的 marker / swipe / slot 叠加写前条件，首次提交以保存后 marker 读回为准。
export async function withConfirmableChatMutation(ctx, task) {
    if (typeof task !== 'function') throw new TypeError('chat mutation task must be a function');
    if (!isPresent(ctx?.chatId)) throw new TypeError('chat mutation requires a persistent chat id');
    const identity = {
        kind: isPresent(ctx?.groupId) ? 'group' : 'character',
        chatId: String(ctx.chatId),
    };
    return withLocalSaveLock(`${chatSaveLockName(identity)}:memory`, () => task(identity));
}

/**
 * Saves the active chat through SillyTavern's save coordinator and confirms the
 * write against the corresponding server-side chat file.
 *
 * @param {object} options
 * @param {object} options.ctx Snapshot returned by SillyTavern.getContext().
 * @param {(persistedChat: object[], target: object) => boolean|Promise<boolean>} options.verify
 * @param {(persistedChat: object[], target: object) => boolean|Promise<boolean>} [options.precondition]
 * @param {typeof fetch} [options.fetchImpl]
 * @param {number} [options.timeoutMs]
 * @param {object} [options.lockManager]
 * @returns {Promise<{target: object}>}
 */
export async function saveChatAndConfirm({
    ctx,
    verify,
    precondition,
    fetchImpl = globalThis.fetch,
    timeoutMs = CONFIRMABLE_CHAT_PHASE_TIMEOUT_MS,
    lockManager = globalThis.navigator?.locks,
} = {}) {
    if (typeof verify !== 'function') throw new TypeError('verify must be a function');
    if (precondition !== undefined && typeof precondition !== 'function') {
        throw new TypeError('precondition must be a function');
    }
    if (typeof fetchImpl !== 'function') throw new TypeError('fetchImpl must be a function');
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new TypeError('timeoutMs must be positive');

    const target = createConfirmableChatTarget(ctx);
    return withChatSaveLock(target, async () => {
        if (precondition) {
            let beforeSaveChat;
            try {
                beforeSaveChat = await readPersistedChat(ctx, target, fetchImpl, timeoutMs);
            } catch (error) {
                throw new ConfirmableChatSaveBlockedError(
                    'precondition_read_failed',
                    'Unable to verify the persisted chat before saving',
                    { cause: error },
                );
            }
            let allowed;
            try {
                allowed = await precondition(beforeSaveChat, target);
            } catch (error) {
                throw new ConfirmableChatSaveBlockedError(
                    'precondition_failed',
                    'Persisted chat precondition failed',
                    { cause: error },
                );
            }
            if (allowed !== true) {
                throw new ConfirmableChatSaveBlockedError(
                    'precondition_failed',
                    'Persisted chat changed before saving',
                );
            }
        }

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
    }, lockManager);
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
