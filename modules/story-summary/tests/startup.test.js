import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { entry, startupEntry } from './helpers/story-summary-entry.js';
import { createHideStateController } from '../hide-state.js';

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}

function fixture({ master = true, enabled = true, localHide = false } = {}) {
    const state = { master, enabled, hide: localHide };
    const calls = [];
    const warnings = [];
    const failures = [];
    const config = deferred();
    const chat = Array.from({ length: 5 }, () => ({ is_system: false }));
    const hide = createHideStateController({
        getState: () => ({ chatId: 'startup', chat, managed: state.master && state.enabled, enabled: state.hide, summaryBoundary: 2, useVectorBoundary: false, keepVisibleCount: 0 }),
        getPendingSave: () => null,
        readVectorBoundary: async () => -1,
        renderMessage: () => {},
        refresh: () => {},
        save: async () => {},
        onError: error => failures.push(error),
    });
    let ready;
    let toggle;
    startupEntry(['initializeStorySummary'], {
        document: {},
        STORY_SUMMARY_TOGGLE_EVENT: 'summary-toggle',
        $: () => ({ on: (_event, callback) => { toggle = callback; } }),
        jQuery: callback => { ready = callback; },
        observeAsyncCallback: callback => callback,
        isXiaobaiMasterEnabled: () => state.master,
        getSettings: () => ({ storySummary: { enabled: state.enabled } }),
        loadConfigFromServer: async () => {
            calls.push('load');
            state.hide = await config.promise;
            calls.push('loaded');
        },
        registerEvents: async () => { calls.push('register'); },
        initStateIntegration: () => { calls.push('state'); },
        maybePreloadTokenizer: () => { calls.push('tokenizer'); },
        handleChatChanged: async () => { calls.push('chat'); await hide.reconcile(); },
        initChatDeletionLifecycle: () => { calls.push('deletion'); },
        handleChatDeleted: () => {},
        cancelActiveSummaryExecution: () => {},
        cancelRecallAndClearPrompt: () => {},
        unregisterEvents: async () => { calls.push('unregister'); await hide.clear(); },
        notifyStorySummaryChatState: () => {},
        reportStartupFailure: error => failures.push(error),
        MODULE_ID: 'startup-test',
        xbLog: { warn: (...args) => warnings.push(args) },
    });
    return { state, calls, warnings, failures, config, chat, ready: () => ready(), toggle: value => toggle(null, value) };
}

for (const mode of ['page-load', 'master-reenable', 'feature-reenable']) {
    for (const serverHide of [true, false]) {
        test(`${mode} applies server hide=${serverHide} only after complete initialization`, async () => {
            const f = fixture({ master: mode !== 'master-reenable', enabled: mode !== 'feature-reenable', localHide: !serverHide });
            f.ready();
            let starting;
            if (mode !== 'page-load') {
                assert.deepEqual(f.calls, ['deletion']);
                f.state.master = true;
                f.state.enabled = true;
                starting = f.toggle(true);
            }
            assert.deepEqual(f.calls, ['deletion', 'load']);
            assert.equal(f.chat.some(message => message.is_system), false);
            f.config.resolve(serverHide);
            await starting;
            await nextTurn();
            assert.deepEqual(f.calls, ['deletion', 'load', 'loaded', 'register', 'state', 'tokenizer', 'chat']);
            assert.deepEqual(f.chat.map(message => message.is_system), [serverHide, serverHide, serverHide, false, false]);
            assert.deepEqual(f.failures, []);
            assert.deepEqual(f.warnings, []);
        });
    }
}

for (const mode of ['page-load', 'master-reenable']) {
    test(`${mode} falls back to local config when the server read fails`, async () => {
        const f = fixture({ master: mode === 'page-load', localHide: true });
        f.ready();
        f.state.master = true;
        const starting = mode === 'master-reenable' ? f.toggle(true) : undefined;
        const error = new Error('server unavailable');
        f.config.reject(error);
        await starting;
        await nextTurn();
        assert.deepEqual(f.calls, ['deletion', 'load', 'register', 'state', 'tokenizer', 'chat']);
        assert.deepEqual(f.chat.map(message => message.is_system), [true, true, true, false, false]);
        assert.equal(f.warnings.length, 1);
        assert.equal(f.warnings[0][2], error);
        assert.deepEqual(f.failures, []);
    });
}

for (const setting of ['master', 'enabled']) {
    test(`disabling ${setting} while loading config does not restart the module`, async () => {
        const f = fixture({ master: false });
        f.ready();
        f.state.master = true;
        const starting = f.toggle(true);
        f.state[setting] = false;
        await f.toggle(false);
        f.config.resolve(true);
        await starting;
        assert.deepEqual(f.calls, ['deletion', 'load', 'unregister', 'loaded']);
        assert.equal(f.chat.some(message => message.is_system), false);
        assert.deepEqual(f.failures, []);
    });

    test(`registration waiting for teardown rechecks ${setting}`, async () => {
        const teardown = deferred();
        const state = { master: true, enabled: true };
        const context = entry(['registerEvents'], {
            storySummaryTeardown: teardown.promise,
            isXiaobaiMasterEnabled: () => state.master,
            getSettings: () => ({ storySummary: { enabled: state.enabled } }),
            events: null,
            resumeVectorWriteCoordinator: () => assert.fail('must not restart after disabling'),
        });
        const registering = context.registerEvents();
        state[setting] = false;
        teardown.resolve();
        await registering;
    });
}

test('a previously initialized module uses complete initialization again after disabling', async () => {
    const f = fixture();
    f.ready();
    f.config.resolve(true);
    await nextTurn();
    assert.equal(f.chat[0].is_system, true);
    f.state.master = false;
    await f.toggle(false);
    assert.equal(f.chat.some(message => message.is_system), false);
    f.calls.length = 0;
    f.state.hide = false;
    f.state.master = true;
    await f.toggle(true);
    assert.deepEqual(f.calls, ['load', 'loaded', 'register', 'state', 'tokenizer', 'chat']);
    assert.equal(f.chat[0].is_system, true);
    assert.deepEqual(f.failures, []);
});
