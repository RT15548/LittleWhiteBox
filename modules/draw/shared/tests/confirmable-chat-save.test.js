import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers';

import {
    ConfirmableChatSaveBlockedError,
    ConfirmableChatSaveUncertainError,
    createConfirmableChatSnapshot,
    persistedChatMatchesSnapshot,
    saveChatAndConfirm,
    withConfirmableChatMutation,
} from '../confirmable-chat-save.js';

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function characterContext(overrides = {}) {
    return {
        chatId: 'chat-a',
        groupId: null,
        characterId: 0,
        characters: [{ name: 'Alice', avatar: 'alice.png' }],
        getRequestHeaders: () => ({ 'Content-Type': 'application/json', 'X-CSRF-Token': 'csrf' }),
        saveChat: async () => {},
        ...overrides,
    };
}

test('character chat save is confirmed only after reading its persisted file', async () => {
    const order = [];
    let releaseSave;
    const ctx = characterContext({
        saveChat: async () => {
            order.push('save-started');
            await new Promise(resolve => { releaseSave = resolve; });
            order.push('save-finished');
        },
    });

    const confirmation = saveChatAndConfirm({
        ctx,
        fetchImpl: async (url, options) => {
            order.push('read');
            assert.equal(url, '/api/chats/get');
            assert.equal(options.method, 'POST');
            assert.equal(options.cache, 'no-cache');
            assert.equal(options.headers['X-CSRF-Token'], 'csrf');
            assert.deepEqual(JSON.parse(options.body), {
                ch_name: 'Alice',
                file_name: 'chat-a',
                avatar_url: 'alice.png',
            });
            return jsonResponse([
                { chat_metadata: {} },
                { mes: 'story', extra: { xbDrawRuns: { 'run-1': { version: 1 } } } },
            ]);
        },
        verify: (persistedChat, target) => {
            order.push('verify');
            assert.equal(target.kind, 'character');
            return persistedChat[1]?.extra?.xbDrawRuns?.['run-1']?.version === 1;
        },
    });
    while (!releaseSave) await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(order, ['save-started']);
    ctx.chatId = 'chat-b';
    ctx.characterId = 1;
    ctx.characters[0].name = 'Changed Alice';
    ctx.characters[0].avatar = 'changed-alice.png';

    releaseSave();
    const result = await confirmation;

    assert.deepEqual(order, ['save-started', 'save-finished', 'read', 'verify']);
    assert.equal(result.target.chatId, 'chat-a');
});

test('group chat read-back uses the frozen chat id even if the context changes while saving', async () => {
    const ctx = {
        chatId: 'group-chat-a',
        groupId: 'group-a',
        getRequestHeaders: () => ({ 'Content-Type': 'application/json' }),
        saveChat: async () => {
            ctx.chatId = 'group-chat-b';
            ctx.groupId = 'group-b';
        },
    };

    const result = await saveChatAndConfirm({
        ctx,
        fetchImpl: async (url, options) => {
            assert.equal(url, '/api/chats/group/get');
            assert.deepEqual(JSON.parse(options.body), { id: 'group-chat-a' });
            return jsonResponse([{ chat_metadata: {} }, { extra: { marker: true } }]);
        },
        verify: chat => chat[1]?.extra?.marker === true,
    });

    assert.equal(result.target.kind, 'group');
    assert.equal(result.target.chatId, 'group-chat-a');
});

test('a thrown save is still confirmed when read-back proves the write completed', async () => {
    let reads = 0;
    const result = await saveChatAndConfirm({
        ctx: characterContext({
            saveChat: async () => { throw new Error('response lost'); },
        }),
        fetchImpl: async () => {
            reads++;
            return jsonResponse([{ chat_metadata: {} }, { extra: { marker: true } }]);
        },
        verify: chat => chat[1]?.extra?.marker === true,
    });

    assert.equal(reads, 1);
    assert.equal(result.target.chatId, 'chat-a');
});

test('a stalled save is bounded and still followed by read-back confirmation', { timeout: 500 }, async () => {
    let reads = 0;
    const result = await saveChatAndConfirm({
        ctx: characterContext({
            saveChat: async () => await new Promise(() => {}),
        }),
        fetchImpl: async () => {
            reads++;
            return jsonResponse([{ chat_metadata: {} }, { extra: { marker: true } }]);
        },
        timeoutMs: 5,
        verify: chat => chat[1]?.extra?.marker === true,
    });

    assert.equal(reads, 1);
    assert.equal(result.target.chatId, 'chat-a');
});

test('a missing marker is reported as uncertain without rolling back memory', async () => {
    const message = { mes: 'story', extra: { marker: true } };
    const ctx = characterContext({ chat: [message] });
    const chatReference = ctx.chat;
    const chatSnapshot = structuredClone(ctx.chat);
    await assert.rejects(saveChatAndConfirm({
        ctx,
        fetchImpl: async () => jsonResponse([{ chat_metadata: {} }, { mes: 'story' }]),
        verify: chat => chat[1]?.extra?.marker === true,
    }), error => {
        assert.ok(error instanceof ConfirmableChatSaveUncertainError);
        assert.equal(error.code, 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN');
        assert.equal(error.reason, 'content_mismatch');
        return true;
    });
    assert.strictEqual(ctx.chat, chatReference);
    assert.deepEqual(ctx.chat, chatSnapshot);
});

test('concurrent stale writers serialize and only the first may save', async () => {
    const originalMessages = [{ mes: 'first' }, { mes: 'second' }];
    const originalSnapshot = createConfirmableChatSnapshot({ chat: originalMessages });
    let persistedChat = [{ chat_metadata: {} }, ...structuredClone(originalMessages)];
    let saves = 0;
    const makeWrite = (runId, messageId) => {
        const nextMessages = structuredClone(originalMessages);
        nextMessages[messageId].extra = { xbDrawRuns: { [runId]: { version: 1 } } };
        const nextChat = [{ chat_metadata: {} }, ...nextMessages];
        return saveChatAndConfirm({
            ctx: characterContext({
                chat: nextMessages,
                saveChat: async () => {
                    saves += 1;
                    persistedChat = structuredClone(nextChat);
                },
            }),
            fetchImpl: async () => jsonResponse(structuredClone(persistedChat)),
            precondition: chat => persistedChatMatchesSnapshot(chat, originalSnapshot),
            verify: chat => chat[messageId + 1]?.extra?.xbDrawRuns?.[runId]?.version === 1,
        });
    };

    const results = await Promise.allSettled([makeWrite('run-a', 0), makeWrite('run-b', 1)]);

    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(saves, 1);
    const rejected = results.find(result => result.status === 'rejected');
    assert.ok(rejected?.reason instanceof ConfirmableChatSaveBlockedError);
    assert.equal(rejected.reason.reason, 'precondition_failed');
    assert.equal(rejected.reason.saveAttempted, false);
});

test('same-page chat mutations remain serialized until their confirmed save finishes', async () => {
    const ctx = characterContext({ chat: [{ mes: 'story' }] });
    const order = [];
    let releaseFirst;
    const first = withConfirmableChatMutation(ctx, async () => {
        order.push('first-mutate');
        ctx.chat[0].extra = { first: true };
        await new Promise(resolve => { releaseFirst = resolve; });
        order.push('first-confirmed');
    });
    while (!releaseFirst) await new Promise(resolve => setImmediate(resolve));

    const second = withConfirmableChatMutation(ctx, async () => {
        order.push('second-mutate');
        assert.equal(ctx.chat[0].extra?.first, true);
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(order, ['first-mutate']);

    releaseFirst();
    await Promise.all([first, second]);
    assert.deepEqual(order, ['first-mutate', 'first-confirmed', 'second-mutate']);
});

test('a read-back timeout is reported as uncertain', { timeout: 500 }, async () => {
    await assert.rejects(saveChatAndConfirm({
        ctx: characterContext(),
        fetchImpl: async (_url, { signal }) => await new Promise((resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        }),
        timeoutMs: 5,
        verify: () => true,
    }), error => error instanceof ConfirmableChatSaveUncertainError
        && error.reason === 'readback_failed'
        && error.cause?.name === 'AbortError');
});

test('read-back transport and payload failures are reported as uncertain', async (t) => {
    await t.test('network failure', async () => {
        await assert.rejects(saveChatAndConfirm({
            ctx: characterContext(),
            fetchImpl: async () => { throw new Error('connection lost'); },
            verify: () => true,
        }), error => error instanceof ConfirmableChatSaveUncertainError
            && error.reason === 'readback_failed'
            && error.cause?.message === 'connection lost');
    });

    await t.test('HTTP failure', async () => {
        await assert.rejects(saveChatAndConfirm({
            ctx: characterContext(),
            fetchImpl: async () => jsonResponse({ error: true }, 500),
            verify: () => true,
        }), error => error instanceof ConfirmableChatSaveUncertainError
            && error.reason === 'readback_failed');
    });

    await t.test('non-array payload', async () => {
        await assert.rejects(saveChatAndConfirm({
            ctx: characterContext(),
            fetchImpl: async () => jsonResponse({}),
            verify: () => true,
        }), error => error instanceof ConfirmableChatSaveUncertainError
            && error.reason === 'readback_failed');
    });
});

test('missing persistent identity fails before save or read-back', async () => {
    let saves = 0;
    let reads = 0;
    await assert.rejects(saveChatAndConfirm({
        ctx: characterContext({
            chatId: '',
            saveChat: async () => { saves++; },
        }),
        fetchImpl: async () => {
            reads++;
            return jsonResponse([]);
        },
        verify: () => true,
    }), error => error instanceof ConfirmableChatSaveUncertainError
        && error.reason === 'target_unavailable');

    assert.equal(saves, 0);
    assert.equal(reads, 0);
});
