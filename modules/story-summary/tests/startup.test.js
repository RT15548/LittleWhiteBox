import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { entry, startupEntry } from './helpers/story-summary-entry.js';
import { createHideStateController, HIDE_OWNERSHIP_CLAIMED_KEY } from '../hide-state.js';
import { isUserHidden } from '../data/message-visibility.js';
import { createAbortError, throwIfSignalAborted } from '../../../shared/common/abort-utils.js';

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
        getState: () => ({ chatId: 'startup', chat, managed: state.master && state.enabled, enabled: state.hide, claimed: true, summaryBoundary: 2, useVectorBoundary: false, keepVisibleCount: 0 }),
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

// Only initial ownership restoration blocks new raw input. Use the real gate
// and hide controller together so concurrent waiters cannot cancel adoption.
function ownershipFixture({ mode = 'vector', pendingSave = false } = {}) {
    const chat = Array.from({ length: 100 }, (_, floor) => ({ mes: `floor-${floor + 1}`, is_system: floor < 80 || floor === 94 }));
    const state = {
        context: { chatId: 'ownership', chat }, metadata: { extensions: { LittleWhiteBox: {} } },
        loaded: true, boundary: deferred(), pending: null,
    };
    const metadataSave = deferred();
    if (pendingSave) state.pending = metadataSave.promise;
    const errors = [];
    const inputs = [];
    let boundaryReads = 0;
    const settings = mode === 'summary'
        ? { summaryBoundary: 85, useVectorBoundary: false, keepVisibleCount: 6 }
        : { summaryBoundary: 69, useVectorBoundary: true, keepVisibleCount: 10 };
    const hideState = createHideStateController({
        getState: () => ({ ...state.context, ...settings, managed: true, enabled: true,
            claimed: state.metadata.extensions.LittleWhiteBox[HIDE_OWNERSHIP_CLAIMED_KEY] === true }),
        getPendingSave: () => state.pending,
        readVectorBoundary: () => { boundaryReads++; return state.boundary.promise; },
        renderMessage() {}, refresh() {}, save: async () => {},
        markClaimed: () => { state.metadata.extensions.LittleWhiteBox[HIDE_OWNERSHIP_CLAIMED_KEY] = true; },
        onError: (error, stage) => errors.push({ error, stage }),
    });
    const runtime = entry(['hideOwnershipPreparation', 'applyHideState', 'ensureHideOwnership',
        'applyHideStateDebounced', 'cancelPendingHide', 'waitForSummaryPreparation'], {
        hideState, getContext: () => state.context, chat_metadata: state.metadata,
        messageSources: { isLoaded: () => state.loaded }, EXT_ID: 'LittleWhiteBox',
        createAbortError, throwIfSignalAborted, MODULE_ID: 'startup-test', xbLog: { error() {} },
    });
    const consume = async signal => {
        await runtime.ensureHideOwnership(signal);
        const floors = state.context.chat.flatMap((message, floor) => isUserHidden(message) ? [] : [floor + 1]);
        inputs.push(floors);
        return floors;
    };
    return { state, settings, runtime, errors, inputs, consume, metadataSave, reads: () => boundaryReads,
        releaseMetadata: () => { state.pending = null; metadataSave.resolve(); } };
}

const eligibleInitialFloors = Array.from({ length: 100 }, (_, floor) => floor + 1).filter(floor => floor !== 95);

for (const mode of ['summary', 'vector']) {
    test(`${mode} ownership restoration shares load and two consumers across pending metadata`, async () => {
        const f = ownershipFixture({ mode, pendingSave: true });
        const loading = f.runtime.applyHideState();
        const consumers = [f.consume(), f.consume()];
        await nextTurn();
        assert.equal(f.reads(), 0);
        assert.deepEqual(f.inputs, []);
        f.releaseMetadata();
        await nextTurn();
        if (mode === 'vector') {
            assert.equal(f.reads(), 1);
            assert.deepEqual(f.inputs, []);
            f.state.boundary.resolve(89);
        }
        await loading;
        for (const floors of await Promise.all(consumers)) assert.deepEqual(floors, eligibleInitialFloors);
        assert.equal(f.reads(), mode === 'vector' ? 1 : 0);
        assert.equal(f.state.metadata.extensions.LittleWhiteBox[HIDE_OWNERSHIP_CLAIMED_KEY], true);
        assert.equal(f.state.context.chat.slice(0, 80).every(message => message.xb_summary_hidden === true), true);
        assert.equal(f.state.context.chat[94].xb_summary_hidden, undefined);
        const reads = f.reads();
        await Promise.all([f.runtime.ensureHideOwnership(), f.runtime.ensureHideOwnership()]);
        assert.equal(f.reads(), reads);
        const stopped = new AbortController();
        stopped.abort();
        await assert.rejects(f.consume(stopped.signal), { name: 'AbortError' });
        assert.equal(f.inputs.length, 2);
        assert.deepEqual(f.errors, []);
    });

    test(`${mode} ownership restoration does not admit raw reads after metadata failure`, async () => {
        const f = ownershipFixture({ mode, pendingSave: true });
        const results = Promise.allSettled([f.runtime.applyHideState(), f.consume(), f.consume()]);
        const error = new Error('metadata unavailable');
        f.metadataSave.reject(error);
        for (const result of await results) {
            assert.equal(result.status, 'rejected');
            assert.equal(result.reason, error);
        }
        assert.deepEqual(f.inputs, []);
        assert.equal(f.reads(), 0);
        assert.notEqual(f.state.metadata.extensions.LittleWhiteBox[HIDE_OWNERSHIP_CLAIMED_KEY], true);
    });
}

test('a failed initial vector boundary leaves all raw consumers blocked', async () => {
    const f = ownershipFixture();
    const results = Promise.allSettled([f.runtime.applyHideState(), f.consume(), f.consume()]);
    await nextTurn();
    const error = new Error('boundary unavailable');
    f.state.boundary.reject(error);
    const [load, ...consumers] = await results;
    assert.equal(load.status, 'fulfilled');
    for (const consumer of consumers) {
        assert.equal(consumer.status, 'rejected');
        assert.equal(consumer.reason.name, 'AbortError');
    }
    assert.deepEqual(f.inputs, []);
    assert.deepEqual(f.errors, [{ error, stage: 'boundary' }]);
    assert.notEqual(f.state.metadata.extensions.LittleWhiteBox[HIDE_OWNERSHIP_CLAIMED_KEY], true);
});

for (const replacement of ['chat', 'metadata']) {
    test(`replacing ${replacement} during adoption rejects old consumers and waits for the new owner`, async () => {
        const f = ownershipFixture();
        const oldBoundary = f.state.boundary;
        const old = Promise.allSettled([f.runtime.applyHideState(), f.consume(), f.consume()]);
        await nextTurn();
        if (replacement === 'chat') {
            f.runtime.cancelPendingHide();
            f.state.context = { chatId: 'next-chat', chat: structuredClone(f.state.context.chat) };
        }
        f.state.metadata = { extensions: { LittleWhiteBox: {} } };
        f.runtime.chat_metadata = f.state.metadata;
        f.state.boundary = deferred();
        const next = Promise.all([f.runtime.applyHideState(), f.consume(), f.consume()]);
        await nextTurn();
        assert.equal(f.reads(), 2);
        oldBoundary.resolve(89);
        const [oldLoad, ...oldConsumers] = await old;
        assert.equal(oldLoad.status, 'fulfilled');
        for (const consumer of oldConsumers) {
            assert.equal(consumer.status, 'rejected');
            assert.equal(consumer.reason.name, 'AbortError');
        }
        assert.deepEqual(f.inputs, []);
        f.state.boundary.resolve(89);
        const [, ...newInputs] = await next;
        for (const floors of newInputs) assert.deepEqual(floors, eligibleInitialFloors);
        assert.deepEqual(f.errors, []);
    });
}

test('aborting one ownership waiter never admits it or cancels the shared restoration', async () => {
    const f = ownershipFixture();
    const controller = new AbortController();
    const loading = f.runtime.applyHideState();
    const cancelled = assert.rejects(f.consume(controller.signal), { name: 'AbortError' });
    const continuing = f.consume();
    await nextTurn();
    controller.abort();
    await cancelled;
    assert.deepEqual(f.inputs, []);
    assert.equal(f.reads(), 1);
    f.state.boundary.resolve(89);
    await loading;
    assert.deepEqual(await continuing, eligibleInitialFloors);
    assert.equal(f.inputs.length, 1);
    assert.deepEqual(f.errors, []);
});

test('a debounced visibility update retries initial adoption without releasing its waiters', async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const f = ownershipFixture();
    t.after(() => f.runtime.cancelPendingHide());
    const staleBoundary = f.state.boundary;
    let settled = false;
    const result = Promise.allSettled([f.runtime.applyHideState(), f.consume(), f.consume()])
        .then(outcomes => { settled = true; return outcomes; });
    await nextTurn();
    assert.equal(f.reads(), 1);
    f.runtime.applyHideStateDebounced();
    f.state.boundary = deferred();
    staleBoundary.resolve(89);
    await nextTurn();
    assert.equal(f.reads(), 2);
    assert.equal(settled, false);
    assert.deepEqual(f.inputs, []);
    f.state.boundary.resolve(89);
    const [load, ...consumers] = await result;
    assert.equal(load.status, 'fulfilled');
    for (const consumer of consumers) {
        assert.equal(consumer.status, 'fulfilled');
        assert.deepEqual(consumer.value, eligibleInitialFloors);
    }
    assert.deepEqual(f.errors, []);
});

test('settings and appended chat changes share a fresh ownership read before supplying input', async () => {
    const f = ownershipFixture();
    const staleBoundary = f.state.boundary;
    const firstLoad = f.runtime.applyHideState();
    const firstConsumer = f.consume();
    await nextTurn();
    f.settings.keepVisibleCount = 20;
    f.state.context.chat.push({ mes: 'floor-101', is_system: false });
    f.state.boundary = deferred();
    let settled = false;
    const result = Promise.allSettled([firstLoad, firstConsumer, f.runtime.applyHideState(), f.consume()])
        .then(outcomes => { settled = true; return outcomes; });
    assert.equal(f.reads(), 1);
    staleBoundary.resolve(89);
    await nextTurn();
    assert.equal(f.reads(), 2);
    assert.equal(settled, false);
    assert.deepEqual(f.inputs, []);
    f.state.boundary.resolve(99);
    const outcomes = await result;
    assert.equal(outcomes.every(outcome => outcome.status === 'fulfilled'), true);
    for (const floors of f.inputs) assert.deepEqual(floors, [...eligibleInitialFloors, 101]);
    assert.equal(f.inputs.length, 2);
    assert.equal(f.state.context.chat.filter(message => message.is_system).length, 81);
    assert.equal(f.state.context.chat.slice(0, 80).every(message => message.xb_summary_hidden === true), true);
    assert.equal(f.state.context.chat[94].xb_summary_hidden, undefined);
    assert.deepEqual(f.errors, []);
});

test('unloaded chat sources cannot start ownership adoption or supply new input', async () => {
    const f = ownershipFixture();
    f.state.loaded = false;
    await assert.rejects(f.consume(), { name: 'AbortError' });
    assert.equal(f.reads(), 0);
    assert.deepEqual(f.inputs, []);
});
