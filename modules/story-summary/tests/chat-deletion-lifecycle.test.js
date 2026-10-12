import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { EventEmitter } from 'node:events';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Real deletion lifecycle + event registry; only the SillyTavern event bus is
// replaced. Exercise cleanup/re-enable and dispatch, not source-code spelling.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const previousWindow = globalThis.window;
const previousDocument = globalThis.document;
const hostEvents = globalThis.__chatDeletionEvents = new EventEmitter();
const bundled = await build({
    stdin: { resolveDir: root, contents: `
        export * from './modules/story-summary/chat-deletion-lifecycle.js';
        export { EventCenter } from './core/event-manager.js';
        export { event_types } from 'script.js';` },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'host-events', setup(api) {
        api.onResolve({ filter: /(^|\/)script\.js$/ }, () => ({ path: 'script.js', namespace: 'host' }));
        api.onLoad({ filter: /.*/, namespace: 'host' }, () => ({ contents: `
            export const eventSource=globalThis.__chatDeletionEvents;
            export const event_types={CHAT_DELETED:'chat-deleted',GROUP_CHAT_DELETED:'group-chat-deleted'};` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Generated local test bundle, never external code.
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
let cleanups;
let deleted;

beforeEach(() => {
    mod.EventCenter.cleanupAll();
    cleanups = new Map();
    deleted = [];
    globalThis.document = new EventTarget();
    globalThis.window = { isXiaobaixEnabled: true,
        registerModuleCleanup: (id, cleanup) => cleanups.set(id, cleanup) };
});
after(() => {
    mod.EventCenter.cleanupAll();
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
    delete globalThis.__chatDeletionEvents;
});

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
