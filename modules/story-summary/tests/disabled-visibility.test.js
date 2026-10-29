import assert from 'node:assert/strict';
import test from 'node:test';
import { entry, startupEntry } from './helpers/story-summary-entry.js';
import { createHideStateController } from '../hide-state.js';
import { isXiaobaiMasterEnabled } from '../runtime-gate.js';
import { getChatStorySummaryEnabled, setChatStorySummaryEnabled, resolveStorySummaryEnabled } from '../data/chat-toggle.js';
import { getChatIdentity } from '../data/chat-identity.js';

function fixture() {
    const chat = [false, true, true, false].map(is_system => ({ is_system }));
    const state = { master: false, enabled: true };
    const saves = [];
    const context = { chatId: 'issue-121', chat, saveChat: async () => saves.push(chat.map(message => message.is_system)) };
    const mod = entry(['hideState', 'getStorySummaryEnablement', 'isStorySummaryEnabledForCurrentChat',
        'applyHideState', 'applyHideStateDebounced', 'cancelPendingHide', 'clearHideState', 'unregisterEvents', 'runStorySummaryTeardown',
        'getStorySummaryChatState', 'setStorySummaryEnabledForCurrentChat'], {
        createHideStateController,
        getContext: () => context,
        getChatIdentity,
        getSettings: () => ({ storySummary: { enabled: state.enabled } }),
        isXiaobaiMasterEnabled: () => state.master,
        getChatStorySummaryEnabled, setChatStorySummaryEnabled, resolveStorySummaryEnabled,
        chatSummaryStateChanging: false,
        saveChatSummaryState: current => current.saveChat(),
        handleChatChanged: async () => {},
        chat_metadata: {}, EXT_ID: 'LittleWhiteBox',
        getPendingMemoryCommit: () => state.pending || null,
        getHideUiSettings: () => ({ hideSummarized: false, keepVisibleCount: 0 }),
        getPublishedSummaryStore: () => null,
        isSummarySourceValid: () => false,
        getVectorConfig: () => ({ enabled: false }),
        assertMemoryWritable: () => {},
        document: { querySelector: () => null, removeEventListener() {} },
        window: { isXiaobaixEnabled: false, removeEventListener() {} },
        events: null,
        storySummaryTeardown: null,
        summaryDiagnostics: { clear() {} },
        messageSources: { reset() {} },
        embeddingConnection: { cancel() {} },
        serviceTests: { cancel() {} },
        memoryMaintenance: { stop() {}, cancel() {} },
        cancelActiveSummaryExecution() {}, activeSummaryExecution: null,
        cancelRecallAndClearPrompt() {}, postToFrame() {}, invalidateLexicalIndex() {},
        shutdownVectorWriteCoordinator: async () => {},
        clearWarningCooldowns() {}, clearRecallFailureNotice() {},
        CacheRegistry: { unregister() {} }, MODULE_ID: 'story-summary',
        afterAiGateDispose: null, activeChatId: 'issue-121',
        clearDeferredBackgroundTasks() {},
        messageButtonOwnership: { runOwnedCleanup: callback => callback() },
        $: () => ({ remove() {} }), hideOverlay() {}, unregisterGenerateInterceptor() {},
        handleVisibilityChangeForBackground() {}, handleViewportChangeForBackground() {},
        logRecallRuntimeCheckpoint() {}, shutdownRecallRuntime: async () => {},
        notifyStorySummaryChatState() {},
        setTimeout, clearTimeout,
    });
    return { mod, state, context, chat, saves };
}

for (const childEnabled of [true, false]) {
    test(`issue 121: master-off refresh and chat reentry preserve manual hides (child=${childEnabled})`, async () => {
        const f = fixture();
        f.state.enabled = childEnabled;
        const failures = [];
        let ready;
        const startup = startupEntry(['initializeStorySummary', 'handleChatChanged'], {
            ...f.mod,
            STORY_SUMMARY_TOGGLE_EVENT: 'summary-toggle',
            $: () => ({ on() {} }),
            jQuery: callback => { ready = callback; },
            observeAsyncCallback: callback => callback,
            initChatDeletionLifecycle() {}, handleChatDeleted() {},
            loadConfigFromServer: () => assert.fail('disabled startup must not load config'),
            registerEvents: () => assert.fail('disabled startup must not register chat handlers'),
            reportStartupFailure: error => failures.push(error),
        });
        ready();
        await startup.handleChatChanged(f.context.chatId);
        await f.mod.applyHideState({ full: false, messageId: 1 });
        assert.deepEqual(f.chat.map(message => message.is_system), [false, true, true, false]);
        assert.deepEqual(f.saves, []);
        assert.deepEqual(failures, []);
    });
}

for (const operation of ['load', 'edit', 'clear']) {
    test(`issue 121: inactive ${operation} preserves manually hidden flags without saving`, async () => {
        const f = fixture();
        if (operation === 'clear') await f.mod.clearHideState();
        else await f.mod.applyHideState(operation === 'edit' ? { full: false, messageId: 1 } : undefined);
        assert.deepEqual(f.chat.map(message => message.is_system), [false, true, true, false]);
        assert.deepEqual(f.saves, []);
    });
}

test('current-chat effective enablement includes the master switch without losing the child setting', () => {
    const f = fixture();
    assert.equal(f.mod.isStorySummaryEnabledForCurrentChat(), false);
    assert.equal(f.mod.getStorySummaryEnablement().globalEnabled, true);
    f.state.master = true;
    assert.equal(f.mod.isStorySummaryEnabledForCurrentChat(), true);
});

test('a repeated or cold-start disable never runs teardown against manual hiding', async () => {
    const f = fixture();
    await f.mod.unregisterEvents();
    await f.mod.unregisterEvents();
    assert.deepEqual(f.chat.map(message => message.is_system), [false, true, true, false]);
    assert.deepEqual(f.saves, []);
});

test('shutdown restores once, then late callbacks and the second toggle preserve subsequent manual hiding', async () => {
    const f = fixture();
    let cleanups = 0;
    f.mod.events = { cleanup: () => { cleanups++; } };
    // The host sets master=false before invoking the registered module cleanup.
    await f.mod.unregisterEvents();
    assert.deepEqual(f.chat.map(message => message.is_system), [false, false, false, false]);
    assert.equal(f.saves.length, 1);
    f.chat[1].is_system = f.chat[2].is_system = true;
    await f.mod.unregisterEvents(); // Later feature-toggle notification.
    await f.mod.applyHideState(); // A config request settling after shutdown.
    await f.mod.clearHideState(); // A late failure-recovery callback.
    assert.equal(cleanups, 1);
    assert.deepEqual(f.chat.map(message => message.is_system), [false, true, true, false]);
    assert.equal(f.saves.length, 1);
});

test('pending visibility reconciliation cannot clear manual hides after management ends', async () => {
    const f = fixture();
    f.state.master = true;
    f.mod.events = { cleanup() {} };
    let finish;
    f.state.pending = new Promise(resolve => { finish = resolve; });
    const reconciling = f.mod.applyHideState();
    f.state.master = false;
    f.state.pending = null;
    finish();
    await reconciling;
    assert.deepEqual(f.chat.map(message => message.is_system), [false, true, true, false]);
    assert.deepEqual(f.saves, []);
});

test('scheduled visibility work after disabling preserves manual hiding', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const f = fixture();
    f.mod.applyHideStateDebounced();
    t.mock.timers.tick(300);
    await Promise.resolve();
    assert.deepEqual(f.chat.map(message => message.is_system), [false, true, true, false]);
    assert.deepEqual(f.saves, []);
});

test('chat disable restores once; later chat work and master shutdown leave new manual hides alone', async () => {
    const f = fixture();
    f.state.master = true;
    f.mod.events = { cleanup() {} };
    await f.mod.setStorySummaryEnabledForCurrentChat(false);
    assert.deepEqual(f.chat.map(message => message.is_system), [false, false, false, false]);
    assert.equal(f.saves.length, 1);
    f.chat[1].is_system = f.chat[2].is_system = true;
    await f.mod.applyHideState();
    await f.mod.clearHideState();
    await f.mod.setStorySummaryEnabledForCurrentChat(false);
    f.state.master = false;
    await f.mod.unregisterEvents();
    assert.deepEqual(f.chat.map(message => message.is_system), [false, true, true, false]);
    assert.equal(f.saves.length, 1);
});

test('the runtime master gate reads the published host master flag', () => {
    assert.equal(isXiaobaiMasterEnabled({ window: { isXiaobaixEnabled: false } }), false);
});
