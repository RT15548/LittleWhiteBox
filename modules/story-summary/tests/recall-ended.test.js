import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import vm from 'node:vm';
import { parse } from 'acorn';
import { usesStoryRecall } from '../generate/recall-policy.js';
import { getRecallPrefetchStartAction } from '../generate/recall-prefetch.js';
import { createMessageSourceTracker } from '../data/message-sources.js';
import mod from './fixtures/recall-query.mjs';

const flush = async () => { for (let i = 0; i < 40; i++) await Promise.resolve(); };
const success = () => new Response(JSON.stringify({ data: [{ index: 0, embedding: [1, 0] }] }));
const stalled = signal => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(signal.reason), { once: true });
});

// Execute the production entry's registration and quiet hooks, rather than
// duplicating its ENDED handler in a fixture. Only startup/UI/maintenance
// boundaries are replaced; assertions concern prompt data and notifications,
// not source spelling. This keeps the test independent of model/DB requests.
const source = readFileSync(new URL('../story-summary.js', import.meta.url), 'utf8');
const entryFunctions = new Set([
    'registerEvents', 'clearExtensionPrompt',
    'handleGenerationAfterCommands', 'runStorySummaryRecallInterceptor',
    'discardIdleRecallPrefetch', 'notifyStorySummaryAfterAi',
    'runContentChangeSync',
]);
const executable = parse(source, { sourceType: 'module', ecmaVersion: 'latest' }).body
    .filter(node => node.type === 'FunctionDeclaration' && entryFunctions.has(node.id.name))
    .map(node => source.slice(node.start, node.end)).join('\n');

async function fixture(t, chat = [{ mes: 'greeting', is_user: false }]) {
    if (t) {
        t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 0 });
        t.mock.method(performance, 'now', () => Date.now());
    }
    const eventSource = new EventEmitter();
    const eventTypes = Object.fromEntries([
        'CHAT_CHANGED', 'MESSAGE_DELETED', 'MESSAGE_RECEIVED', 'MESSAGE_SENT',
        'MESSAGE_SWIPED', 'MESSAGE_SWIPE_DELETED', 'MESSAGE_EDITED', 'USER_MESSAGE_RENDERED',
        'CHARACTER_MESSAGE_RENDERED', 'GENERATION_AFTER_COMMANDS', 'GENERATION_ENDED', 'GENERATION_STOPPED',
        'GROUP_WRAPPER_FINISHED',
    ].map(type => [type, type]));
    const prompts = {};
    const notifications = [];
    const cancellations = [];
    const requests = [];
    const hostContext = { chatId: 'chat', chat };
    const state = { generating: false, group: false, commits: 0, aborted: 0, notice: false, maintenance: 0,
        sourceSyncs: 0, maintenanceStops: 0 };
    let respond = signal => stalled(signal);
    if (t) t.mock.method(globalThis, 'fetch', (_url, options) => {
        requests.push(options);
        return respond(options.signal);
    });
    const coordinator = mod.createRecallPrefetchCoordinator({
        getContext: () => hostContext,
        prepare: async (_type, signal, _diagnostics, withQueryEmbedding) => {
            await mod.embedRecallQuery(['fixture'], {
                embeddingApi: { url: 'https://embedding.invalid/v1', key: 'fixture', model: 'fixture' },
            }, { signal, withQueryEmbedding });
            return { text: 'foreground memory' };
        },
        createRetryNotice: () => ({ show() { state.notice = true; }, clear() { state.notice = false; } }),
    });
    let interceptor;
    const promptKey = 'fixture-memory';
    const noOp = () => {};
    const context = vm.createContext({
        events: null, storySummaryTeardown: null, activeChatId: null, MODULE_ID: 'fixture',
        EXT_PROMPT_KEY: promptKey, extension_prompts: prompts,
        event_types: eventTypes, createModuleEvents: () => eventSource,
        getContext: () => hostContext,
        messageSources: createMessageSourceTracker(),
        isStorySummaryEnabledForCurrentChat: () => true,
        isGenerating: () => state.generating || state.group,
        isStorySummaryConsumableForCurrentChat: () => true, getVectorConfig: () => ({ enabled: true }),
        recallPrefetch: coordinator, recallSourceSignal: null, performance,
        runRequiredRecall: mod.runRequiredRecall,
        commitMemoryPrompt: value => { state.commits++; prompts[promptKey] = value; return value; },
        selectBestStoryMemoryResult: value => value,
        recallFailureNotice: mod.recallFailureNotice,
        xbLog: { info: noOp },
        window: { addEventListener: noOp }, document: { addEventListener: noOp },
        resumeVectorWriteCoordinator: noOp, memoryMaintenance: { start: noOp, cancel: () => { state.maintenanceStops++; } },
        synchronizeCurrentSources: async () => { state.sourceSyncs++; },
        registerAfterAiGateHandler: noOp, initButtonsForAll: noOp,
        CacheRegistry: { register: noOp },
        handleVisibilityChangeForBackground: noOp, handleViewportChangeForBackground: noOp,
        registerGenerateInterceptor: (_id, handler) => { interceptor = handler; },
        GENERATE_INTERCEPTOR_ORDER: { STORY_SUMMARY: 200 },
        notifyAfterAiHint: hint => notifications.push(hint),
        rememberVectorMaintenance: () => { state.maintenance++; },
        scheduleAutoL0Backfill: noOp, AUTO_L0_BACKFILL_DELAY_MS: 5000,
        cancelActiveRecall: (reason, options) => {
            cancellations.push(reason);
            context.recallSourceSignal = null;
            return coordinator.cancel(reason, { abortDispatch: true, ...options });
        },
        usesStoryRecall, getRecallPrefetchStartAction,
    });
    vm.runInContext(executable, context);
    await context.registerEvents();
    return {
        prompts, promptKey, notifications, cancellations, coordinator, state, requests,
        respond: callback => { respond = callback; },
        context: hostContext,
        inspectSources: () => context.messageSources.inspect(hostContext),
        received: floor => eventSource.emit(eventTypes.MESSAGE_RECEIVED, floor),
        async swipeDeleted(detail) {
            for (const listener of eventSource.listeners(eventTypes.MESSAGE_SWIPE_DELETED)) await listener(detail);
        },
        async begin(signal = null) {
            state.generating = true;
            eventSource.emit(eventTypes.GENERATION_AFTER_COMMANDS, 'normal', { signal }, false);
            hostContext.chat.push({ is_user: true, mes: 'fixture' });
            t.mock.timers.tick(16);
            await flush();
        },
        join() {
            const controller = new AbortController();
            const abort = () => { state.aborted++; controller.abort(); };
            return interceptor([], 0, abort, 'normal', { abort, signal: controller.signal });
        },
        commit: value => { prompts[promptKey] = value; },
        // ST clears is_send_press BEFORE emitting ENDED. The group flag remains
        // true between members; its finally emits WRAPPER_FINISHED even when
        // the stop button is already hidden and no second ENDED can be emitted.
        ended: () => { state.generating = false; eventSource.emit(eventTypes.GENERATION_ENDED, 12); },
        groupFinished: () => { state.group = false; eventSource.emit(eventTypes.GROUP_WRAPPER_FINISHED); },
        async quiet() {
            eventSource.emit(eventTypes.GENERATION_AFTER_COMMANDS, 'quiet', {}, false);
            await interceptor([], 0, () => assert.fail('quiet must not abort'), 'quiet', {});
        },
        stop: () => eventSource.emit(eventTypes.GENERATION_STOPPED),
    };
}

test('native unselected swipe deletion does not cancel recall, stop maintenance or enqueue consistency writes', async () => {
    const message = { mes: 'greeting', is_user: false, swipes: ['unused', 'greeting'], swipe_id: 1 };
    const host = await fixture(null, [message]);
    const prepared = { value: 'adopted memory' };
    host.commit(prepared);
    message.swipes.splice(0, 1); message.swipe_id = 0;
    await host.swipeDeleted({ messageId: 0, swipeId: 0, newSwipeId: 0 });
    assert.equal(host.state.sourceSyncs, 0);
    assert.equal(host.state.maintenanceStops, 0);
    assert.equal(host.state.maintenance, 0);
    assert.deepEqual(host.cancellations, []);
    assert.equal(host.prompts[host.promptKey], prepared);
    message.mes += ' ordinary edit'; message.swipes[0] = message.mes;
    assert.equal(host.inspectSources().rollbackFromFloor, null);
    assert.deepEqual(host.inspectSources().editedFloors, [0]);
});

test('quiet ending after foreground memory commit cannot erase memory before prompt assembly', async () => {
    const host = await fixture();
    const prepared = { value: 'foreground memory', position: 1, depth: 2, role: 0 };
    host.commit(prepared);
    await host.quiet();
    host.ended();

    // The foreground host has not assembled its prompt yet. It must still
    // read exactly the adopted memory, including the injection metadata.
    assert.equal(host.prompts[host.promptKey], prepared);
    const request = { messages: [{ role: 'system', content: host.prompts[host.promptKey].value }] };
    assert.equal(request.messages[0].content, prepared.value);
    assert.equal(host.notifications.length, 0);
    assert.equal(host.state.maintenance, 0);
    assert.deepEqual(host.cancellations, []);
});

for (const phase of ['request', 'delay']) {
    test(`host exits before summary interception during ${phase}: no orphan requests or warning`, async t => {
        const host = await fixture(t);
        await host.begin();
        if (phase === 'delay') { t.mock.timers.tick(3000); await flush(); }
        const abandoned = host.coordinator.getCurrent();
        assert.equal(abandoned.joinedAt, null);
        host.ended();
        await abandoned.outcome;
        assert.equal(abandoned.controller.signal.aborted, true);
        assert.equal(host.coordinator.getCurrent(), null);
        assert.equal(host.requests[0].signal.aborted, true);
        t.mock.timers.tick(60_000);
        await flush();
        assert.equal(host.requests.length, 1);
        assert.equal(host.state.commits, 0);
        assert.equal(host.state.aborted, 0);
        assert.equal(host.state.notice, false);
    });
}

test('quiet idle discards only prefetch; the original foreground can still join and commit, ignoring a late old result', async t => {
    const host = await fixture(t);
    let completeOldRequest;
    host.respond(() => new Promise(resolve => { completeOldRequest = resolve; }));
    await host.begin();
    const abandoned = host.coordinator.getCurrent();
    await host.quiet();
    host.ended();
    assert.equal(host.coordinator.getCurrent(), null);
    host.respond(success);
    const result = await host.join();
    assert.equal(result.text, 'foreground memory');
    assert.equal(host.state.commits, 1);
    assert.equal(host.state.aborted, 0);
    assert.equal(host.requests.length, 2);
    completeOldRequest(success());
    await abandoned.outcome;
    assert.equal(host.state.commits, 1);
    assert.equal(host.coordinator.getCurrent(), null);
});

test('discarding a speculative run does not lose the initiating signal for a later join', async t => {
    const host = await fixture(t);
    const source = new AbortController();
    await host.begin(source.signal);
    host.ended();
    source.abort();
    await host.join();
    assert.equal(host.state.commits, 0);
    assert.equal(host.state.aborted, 1);
    assert.equal(host.requests.length, 1);
});

test('an untyped end cannot cancel joined foreground retries or their eventual memory commit', async t => {
    const host = await fixture(t);
    await host.begin();
    const joined = host.coordinator.getCurrent();
    const pending = host.join();
    await host.quiet();
    host.ended();
    assert.equal(host.coordinator.getCurrent(), joined);
    assert.equal(joined.controller.signal.aborted, false);
    host.respond(success);
    t.mock.timers.tick(3000);
    await flush();
    t.mock.timers.tick(1000);
    const result = await pending;
    assert.equal(result.text, 'foreground memory');
    assert.equal(host.state.commits, 1);
    assert.equal(host.state.aborted, 0);
    assert.equal(host.requests.length, 2);
});

test('group member ending preserves prefetch; wrapper finish reclaims it without another ENDED', async t => {
    const host = await fixture(t);
    host.state.group = true;
    await host.begin();
    const run = host.coordinator.getCurrent();
    host.ended();
    assert.equal(host.coordinator.getCurrent(), run);
    assert.equal(run.controller.signal.aborted, false);
    host.groupFinished();
    await run.outcome;
    assert.equal(run.controller.signal.aborted, true);
    assert.equal(host.coordinator.getCurrent(), null);
    t.mock.timers.tick(60_000);
    await flush();
    assert.equal(host.requests.length, 1);
});

test('idle reclamation preserves a real Stop cancellation, so a late join cannot restart work', async t => {
    const host = await fixture(t);
    await host.begin();
    host.stop();
    host.ended();
    await host.join();
    assert.equal(host.state.commits, 0);
    assert.equal(host.state.aborted, 1);
    assert.equal(host.requests.length, 1);
});

test('an unattributed end leaves explicit Stop responsible for clearing the memory', async () => {
    const host = await fixture();
    host.commit({ value: 'memory' });
    host.ended();
    host.stop();
    assert.equal(host.prompts[host.promptKey], undefined);
    assert.equal(host.cancellations.length, 1);
    assert.equal(host.notifications.length, 0);
});

test('a native reply or continuation schedules maintenance once; quiet and duplicate end do not', async () => {
    const host = await fixture();
    host.ended();
    assert.equal(host.state.maintenance, 0);
    host.context.chat.push({ mes: 'new native reply', is_user: false });
    host.received(1);
    host.ended();
    assert.equal(host.state.maintenance, 1);
    host.context.chat[1].mes += ' continued';
    host.ended();
    assert.equal(host.state.maintenance, 2);
    await host.quiet();
    host.ended();
    assert.equal(host.state.maintenance, 2);
});
