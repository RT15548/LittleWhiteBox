import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { EventEmitter } from 'node:events';
import { createTestModuleUrl } from './helpers/bundle-module.js';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createSessionStorage } from './helpers/session-storage.js';

// Real deletion lifecycle + event registry; only the SillyTavern event bus is
// replaced. Exercise cleanup/re-enable and dispatch, not source-code spelling.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const previousWindow = globalThis.window;
const previousDocument = globalThis.document;
const previousFetch = globalThis.fetch;
const previousSessionStorage = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
const hostEvents = globalThis.__chatDeletionEvents = new EventEmitter();
const bundled = await build({
    stdin: { resolveDir: root, contents: `
        export * from './modules/story-summary/chat-deletion-lifecycle.js';
        export * from './modules/story-summary/vector/runtime/embedding-receipts.js';
        export { createEmbeddingAttempts } from './modules/story-summary/vector/runtime/embedding-attempts.js';
        export { getChatIdentity } from './modules/story-summary/data/chat-identity.js';
        export { EventCenter } from './core/event-manager.js';
        export { event_types } from 'script.js';` },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'host-events', setup(api) {
        api.onResolve({ filter: /utils\/embedder\.js$/ }, () => ({ path: 'embedder', namespace: 'fixture' }));
        api.onResolve({ filter: /(^|\/)extensions\.js$/ }, () => ({ path: 'context', namespace: 'fixture' }));
        api.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: path === 'context'
            ? 'export const getContext = () => globalThis.__chatDeletionContext;'
            : 'export const embed = () => { throw new Error("fixture failed request"); };' }));
        api.onResolve({ filter: /(^|\/)script\.js$/ }, () => ({ path: 'script.js', namespace: 'host' }));
        api.onLoad({ filter: /.*/, namespace: 'host' }, () => ({ contents: `
            export const eventSource=globalThis.__chatDeletionEvents;
            export const event_types={CHAT_DELETED:'chat-deleted',GROUP_CHAT_DELETED:'group-chat-deleted'};` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Generated local test bundle, never external code.
const mod = await import(await createTestModuleUrl(bundled.outputFiles[0].text));
let cleanups;
let deleted;
let context, requests, statuses;
const identities = new Set();
const config = { embeddingApi: { provider: 'fixture', url: 'https://embedding.test', model: 'fixture', key: 'fixture' } };

beforeEach(() => {
    mod.EventCenter.cleanupAll();
    cleanups = new Map();
    deleted = [];
    for (const identity of identities) mod.forgetStoredEmbeddings(identity);
    identities.clear();
    Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: createSessionStorage() });
    context = globalThis.__chatDeletionContext = {
        characters: [{ avatar: 'alice.png' }, { avatar: 'bob.png' }], characterId: 1,
        groups: [{ id: 'group-a' }, { id: 'group-b' }], groupId: null, chatId: 'current',
        getRequestHeaders: () => ({ 'Content-Type': 'application/json' }),
    };
    requests = [];
    statuses = new Map();
    globalThis.fetch = async (url, options) => {
        assert.equal(url, '/api/chats/export');
        const body = JSON.parse(options.body);
        requests.push(body);
        return new Response('', { status: statuses.get(body.is_group ? 'group' : body.avatar_url) ?? 200 });
    };
    globalThis.document = new EventTarget();
    globalThis.window = { isXiaobaixEnabled: true,
        registerModuleCleanup: (id, cleanup) => cleanups.set(id, cleanup) };
});
after(() => {
    mod.EventCenter.cleanupAll();
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    globalThis.fetch = previousFetch;
    if (previousSessionStorage) Object.defineProperty(globalThis, 'sessionStorage', previousSessionStorage);
    else delete globalThis.sessionStorage;
    delete globalThis.__chatDeletionEvents;
    delete globalThis.__chatDeletionContext;
});

async function rememberFailure({ characterId = 0, groupId = null, chatId = 'same-name', persistedOnly = false } = {}) {
    const identity = mod.getChatIdentity({ ...context, characterId, groupId, chatId });
    identities.add(identity);
    if (persistedOnly) {
        const api = config.embeddingApi;
        mod.createEmbeddingAttempts().reserve(identity, JSON.stringify([api.provider, api.url, api.model, api.key]), ['source']);
    } else {
        await assert.rejects(mod.embedForStorage(['source'], config, { chatId: identity }));
    }
    return identity;
}

const failureFor = chatId => mod.readStoredEmbeddingFailure(['source'], config, { chatId });

function masterToggle(enabled) {
    window.isXiaobaixEnabled = enabled;
    if (!enabled) {
        // Same cleanup order as the host's master switch.
        mod.EventCenter.cleanupAll();
        for (const cleanup of cleanups.values()) cleanup();
        cleanups.clear();
    }
    document.dispatchEvent(new CustomEvent('xiaobaixEnabledChanged', { detail: { enabled } }));
}

async function deleteChat(type, id) {
    // SillyTavern awaits event handlers before completing chat deletion.
    await Promise.all(hostEvents.listeners(type).map(handler => handler(id)));
}

function start() {
    mod.initChatDeletionLifecycle(async chatId => { deleted.push(chatId); });
}

test('master off/on restores both character and group chat deletion handling', async () => {
    start();
    await deleteChat(mod.event_types.CHAT_DELETED, 'before-toggle');
    masterToggle(false);
    await deleteChat(mod.event_types.CHAT_DELETED, 'while-disabled');
    masterToggle(true);
    await deleteChat(mod.event_types.CHAT_DELETED, 'after-toggle');
    await deleteChat(mod.event_types.GROUP_CHAT_DELETED, 'group-after-toggle');
    assert.deepEqual(deleted, ['before-toggle', 'after-toggle', 'group-after-toggle']);
});

test('repeated enabling and off/on cycles never duplicate deletion work', async () => {
    start();
    for (let cycle = 0; cycle < 3; cycle++) {
        masterToggle(false);
        masterToggle(true);
        masterToggle(true);
        await deleteChat(mod.event_types.CHAT_DELETED, `chat-${cycle}`);
        await deleteChat(mod.event_types.GROUP_CHAT_DELETED, `group-${cycle}`);
    }
    assert.deepEqual(deleted, ['chat-0', 'group-0', 'chat-1', 'group-1', 'chat-2', 'group-2']);
});

test('initially disabled plugin starts deletion handling on enable without any summary-feature event', async () => {
    window.isXiaobaixEnabled = false;
    start();
    await deleteChat(mod.event_types.CHAT_DELETED, 'before-enable');
    assert.deepEqual(deleted, []);
    // No summary-toggle event is sent when that feature remains disabled.
    masterToggle(true);
    await deleteChat(mod.event_types.CHAT_DELETED, 'summary-disabled');
    masterToggle(false);
    masterToggle(true);
    await deleteChat(mod.event_types.GROUP_CHAT_DELETED, 'group-summary-disabled');
    assert.deepEqual(deleted, ['summary-disabled', 'group-summary-disabled']);
});

// Deletion clears only the removed chat's request receipts, including after a
// reload. Cost: blocking a recreated chat or allowing another chat to pay again.
for (const persistedOnly of [false, true]) {
    test(`inactive character deletion preserves same-name owners (persisted only: ${persistedOnly})`, async () => {
        start();
        const alice = await rememberFailure({ persistedOnly });
        const bob = await rememberFailure({ characterId: 1, persistedOnly });
        const group = await rememberFailure({ groupId: 'group-a', persistedOnly });
        const otherChat = await rememberFailure({ chatId: 'different-chat', persistedOnly });
        statuses.set('alice.png', 404);
        await deleteChat(mod.event_types.CHAT_DELETED, 'same-name');
        assert.equal(failureFor(alice), null);
        for (const identity of [bob, group, otherChat]) assert.ok(failureFor(identity));
        assert.deepEqual(requests.map(request => request.avatar_url).sort(), ['alice.png', 'bob.png']);
        assert.deepEqual(deleted, ['same-name']);
    });
}

test('group deletion clears the removed group-chat file and preserves character namesakes and other group chats', async () => {
    start();
    const group = await rememberFailure({ groupId: 'group-a', persistedOnly: true });
    const character = await rememberFailure({ persistedOnly: true });
    const otherGroup = await rememberFailure({ groupId: 'group-b', chatId: 'other-group-chat', persistedOnly: true });
    statuses.set('group', 404);
    await deleteChat(mod.event_types.GROUP_CHAT_DELETED, 'same-name');
    assert.equal(failureFor(group), null);
    for (const identity of [character, otherGroup]) assert.ok(failureFor(identity));
});

test('a failed group deletion notification cannot discard receipts for a file that still exists', async () => {
    start();
    const group = await rememberFailure({ groupId: 'group-a' });
    await deleteChat(mod.event_types.GROUP_CHAT_DELETED, 'same-name');
    assert.ok(failureFor(group));
});

test('failed deletion verification preserves receipts and does not prevent existing cache cleanup', async () => {
    start();
    const alice = await rememberFailure();
    statuses.set('alice.png', 500);
    await assert.rejects(deleteChat(mod.event_types.CHAT_DELETED, 'same-name'));
    assert.ok(failureFor(alice));
    assert.deepEqual(deleted, ['same-name']);
});

test('deleting a chat without request receipts does not fetch any chat content', async () => {
    start();
    await deleteChat(mod.event_types.CHAT_DELETED, 'no-receipts');
    await deleteChat(mod.event_types.GROUP_CHAT_DELETED, 'no-receipts');
    assert.deepEqual(requests, []);
});
