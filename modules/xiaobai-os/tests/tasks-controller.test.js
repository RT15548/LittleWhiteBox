import assert from 'node:assert/strict';
import test from 'node:test';
import { setImmediate } from 'node:timers';
import { parseHTML } from 'linkedom';
import { installDialogDom } from './fixtures/dialog-dom.js';

import { createTaskController } from '../apps/tasks/host/controller.js';
import { createXiaobaiOsBootstrap } from '../host/bootstrap.js';
import { createAppModuleRegistry } from '../kernel/app-registry.js';

function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((resolvePromise, rejectPromise) => {resolve = resolvePromise; reject = rejectPromise;});
    return { promise, resolve, reject };
}

function createHarness() {
    const initialMaintenanceStatus = { state: 'idle', mode: null, message: '', reason: '', lastRunAt: null };
    const host = {
        identity: { key: 'character:1:chat-a' },
        posts: [],
        calls: [],
        reports: [],
        autoMaintenance: false,
        economyReady: true,
        mainGenerationActive: false,
        writeState: 'ready',
        dataListener: null,
        generationListener: null,
        settingsListener: null,
        maintenanceListener: null,
        maintenanceStatus: initialMaintenanceStatus,
        maintenanceStatuses: new Map([['character:1:chat-a', initialMaintenanceStatus]]),
        boardRequest: null,
        candidateRequest: null,
        refreshRequest: null,
        taskError: null,
    };
    const emptyView = () => ({
        domain: null,
        records: [],
        commissions: [],
        currentScopeId: null,
        playerBalance: 100,
        writeState: host.writeState,
    });
    const tasks = {
        ensureReady: async () => undefined,
        readCurrent: emptyView,
        refreshCurrent: async () => {
            await host.refreshRequest?.promise;
            return emptyView();
        },
        getWriteState: () => host.writeState,
        createActionId: () => 'action-1',
        confirmPending: async () => ({ status: 'confirmed' }),
        adoptServerState: async () => {host.writeState = 'ready'; return { status: 'adopted' };},
        publish: async () => {
            if (host.taskError) {throw host.taskError;}
            return { changed: false, view: emptyView() };
        },
        subscribe(listener) {
            host.dataListener = listener;
            return () => {host.dataListener = null;};
        },
    };
    const economy = {
        isOpen: () => host.economyReady,
        refresh: async () => undefined,
        ensureOpen: async () => {host.economyReady = true; return 'opened';},
    };
    const generation = {
        refreshBoard() {
            host.calls.push(['refresh-board']);
            return host.boardRequest?.promise ?? Promise.resolve({ kind: 'board', status: 'updated', changed: true, compile: { data: { listings: [] } } });
        },
        refreshCandidates(input) {
            host.calls.push(['refresh-candidates', input]);
            return host.candidateRequest?.promise ?? Promise.resolve({ kind: 'candidates', status: 'unchanged', changed: false });
        },
        cancelAll: reason => host.calls.push(['cancel-generation', reason]),
    };
    const settings = {
        read: () => ({ apps: { tasks: { autoMaintenance: host.autoMaintenance } } }),
        async setTasksAutoMaintenance(enabled) {
            host.autoMaintenance = enabled;
            host.settingsListener?.(settings.read());
            return settings.read();
        },
        subscribe(listener) {
            host.settingsListener = listener;
            return () => {host.settingsListener = null;};
        },
    };
    const maintenance = {
        startManual() {
            host.calls.push(['manual']);
            host.maintenanceStatus = {
                state: 'running', mode: 'manual', message: '', reason: '', lastRunAt: null,
            };
            host.maintenanceStatuses.set(host.identity.key, host.maintenanceStatus);
            host.maintenanceListener?.('tasks', host.identity.key, host.maintenanceStatus);
            return { status: 'started', mode: 'manual', completion: new Promise(() => {}) };
        },
        cancelRequested: (_id, reason) => host.calls.push(['cancel-maintenance', reason]),
        invalidateAutomatic: (_id, reason) => host.calls.push(['invalidate-automatic', reason]),
        getStatus: (_participantId, chatIdentity) => host.maintenanceStatuses.get(chatIdentity)
            ?? { state: 'idle', mode: null, message: '', reason: '', lastRunAt: null },
        subscribeStatus(listener) {
            host.maintenanceListener = listener;
            return () => {host.maintenanceListener = null;};
        },
    };
    const controller = createTaskController({
        tasks,
        economy,
        generation,
        settings,
        maintenance,
        getChatIdentity: () => host.identity,
        isMainGenerationActive: () => host.mainGenerationActive,
        subscribeGeneration(listener) {
            host.generationListener = listener;
            return () => {host.generationListener = null;};
        },
        report: error => host.reports.push(error),
    });
    controller.startBackground();
    return { controller, host };
}

function activation(host) {
    return {
        post(type, payload) {
            host.posts.push({ type, payload });
            return true;
        },
    };
}

test('Tasks activation is local-only and maintenance returns after Host admission', async () => {
    const { controller, host } = createHarness();
    const state = await controller.activate(activation(host));
    host.calls.length = 0;

    assert.equal(state.status, 'ready');
    assert.equal(state.board, null);
    assert.equal(host.calls.length, 0);
    const payload = { chatIdentity: host.identity.key };
    assert.equal((await controller.handleMessage({
        type: 'tasks/settings/update', payload: { ...payload, autoMaintenance: true },
    })).settings.autoMaintenance, true);
    const maintenance = await controller.handleMessage({ type: 'tasks/maintenance/run', payload });
    assert.equal(maintenance.started, true);
    assert.equal(maintenance.state.maintenance.state, 'running');
    assert.equal((await controller.handleMessage({ type: 'tasks/save/confirm', payload })).confirmation, 'confirmed');
    host.writeState = 'conflict';
    assert.equal((await controller.handleMessage({ type: 'tasks/save/adopt-server', payload })).adoption, 'adopted');
});

for (const kind of ['board', 'candidates']) {
    test(`${kind} generation is admitted immediately and survives leaving and reopening Tasks`, async () => {
        const { controller, host } = createHarness();
        await controller.activate(activation(host));
        host.calls.length = 0;
        const request = deferred();
        host[kind === 'board' ? 'boardRequest' : 'candidateRequest'] = request;
        const payload = { chatIdentity: host.identity.key, taskId: 'task-1', expectedTaskRevision: 1, expectedEventId: 'event-1' };
        const message = { type: kind === 'board' ? 'tasks/refresh' : 'tasks/candidates/refresh', payload };

        const started = await controller.handleMessage(message);
        assert.equal(started.started, true);
        assert.equal(started.state.generation.state, 'running');
        assert.equal(started.state.generation.kind, kind);
        assert.equal(started.state.generation.taskId, kind === 'board' ? null : 'task-1');
        assert.equal((await controller.handleMessage({ type: 'tasks/activate', payload })).generation.state, 'running');
        controller.deactivate('route-left');
        controller.cancelForeground('frame-close');
        assert.equal((await controller.activate(activation(host))).generation.state, 'running');
        await assert.rejects(controller.handleMessage(message), /tasks_generation_active/);
        assert.equal(host.calls.length, 1);

        host.posts.length = 0;
        request.resolve({ kind, status: 'updated', changed: true, compile: { data: { listings: [{}], candidates: [{}] } } });
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(host.posts.at(-1).payload.state.generation.state, 'idle');
        assert.equal(host.posts.at(-1).payload.state.generationActive, false);
        assert.match(host.posts.at(-1).payload.state.generation.message, kind === 'board' ? /已刷新 1/ : /找到 1/);
        assert.deepEqual(host.reports, []);
    });
}

test('completion and failures while Tasks is closed are visible on the next activation', async () => {
    const { controller, host } = createHarness();
    await controller.activate(activation(host));
    const payload = { chatIdentity: host.identity.key };
    for (const fails of [false, true]) {
        const request = deferred();
        host.boardRequest = request;
        await controller.handleMessage({ type: 'tasks/refresh', payload });
        controller.deactivate('frame-close');
        host.posts.length = 0;
        if (fails) {request.reject(new Error('provider failure'));}
        else {request.resolve({ kind: 'board', status: 'unchanged', changed: false });}
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(host.posts.length, 0);
        const reopened = await controller.activate(activation(host));
        assert.equal(reopened.generation.state, 'idle');
        assert.match(reopened.generation.message, fails ? /刷新失败/ : /没有新任务/);
    }
    assert.equal(host.reports.length, 1);
});

for (const closeFromDesktop of [false, true]) {
    test(`closing the OS from ${closeFromDesktop ? 'its desktop' : 'Tasks'} keeps generation alive until plugin cleanup`, async (context) => {
        const { controller, host } = createHarness();
        const apps = createAppModuleRegistry([{
            descriptor: { id: 'tasks', name: '任务', accent: '#fff' },
            capabilities: [],
            install: async () => controller,
            dispose: runtime => runtime.stopBackground(),
        }], {
            createStore: () => assert.fail('this lifecycle test does not use storage'),
            hasCapability: () => false,
            requireCapability: () => assert.fail('this lifecycle test does not use capabilities'),
            files: {},
        });
        const { document, window } = parseHTML('<html><head></head><body><div><button id="send_but"></button></div></body></html>');
        installDialogDom(document);
        let bridgeOptions;
        const posts = [];
        const bootstrap = createXiaobaiOsBootstrap({
            composition: { apps, install: apps.installAll, dispose: apps.dispose },
            documentTarget: document,
            windowTarget: window,
            stylesheetHref: '/host.css',
            frameSrc: '/shell.html',
            captureChatBinding: () => ({ identityKey: host.identity.key, binding: { kind: 'character', ownerLocator: 'fixture.png', chatId: 'fixture' }, reference: null }),
            bridgeFactory(options) {
                const bridge = {
                    post(type, payload) {posts.push({ type, payload }); return true;},
                    isReady: () => true,
                    dispose() {},
                };
                bridgeOptions = { ...options, bridge };
                return bridge;
            },
            onError: error => host.reports.push(error),
        });
        context.after(() => bootstrap.cleanup());
        await bootstrap.init();

        async function openTasks() {
            bootstrap.lifecycle.open();
            await bridgeOptions.onMessage({
                type: 'app/activate', payload: { appId: 'tasks' }, requestId: 'activate',
            }, bridgeOptions.bridge);
            const result = posts.findLast(post => post.type === 'app/activation-result').payload;
            assert.equal(result.ok, true);
            return result;
        }

        const activated = await openTasks();
        host.calls.length = 0;
        const request = deferred();
        host.boardRequest = request;
        await controller.handleMessage({ type: 'tasks/refresh', payload: { chatIdentity: host.identity.key } });
        if (closeFromDesktop) {
            await bridgeOptions.onMessage({
                type: 'app/deactivate', appId: 'tasks', activationToken: activated.activationToken,
            }, bridgeOptions.bridge);
        }
        await bootstrap.lifecycle.closeWindow('frame-close');
        assert.equal(bootstrap.lifecycle.isOpen(), false);
        assert.deepEqual(host.calls, [['refresh-board']]);
        assert.equal((await openTasks()).state.generation.state, 'running');
        request.resolve({ kind: 'board', status: 'updated', changed: true, compile: { data: { listings: [{}] } } });
        await new Promise(resolve => setImmediate(resolve));
        assert.match(posts.findLast(post => post.type === 'tasks/state').payload.state.generation.message, /已刷新 1/);

        const pendingCleanup = deferred();
        host.boardRequest = pendingCleanup;
        await controller.handleMessage({ type: 'tasks/refresh', payload: { chatIdentity: host.identity.key } });
        await bootstrap.cleanup();
        assert.equal(host.calls.some(call => call[0] === 'cancel-generation' && call[1] === 'cleanup'), true);
        const postCount = posts.length;
        pendingCleanup.resolve({ kind: 'board', status: 'updated', changed: true });
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(posts.length, postCount);
        assert.deepEqual(host.reports, []);
    });
}

test('a cancelled generation cannot overwrite the status of a newer run', async () => {
    const { controller, host } = createHarness();
    await controller.activate(activation(host));
    const message = { type: 'tasks/refresh', payload: { chatIdentity: host.identity.key } };
    const oldRequest = deferred();
    host.boardRequest = oldRequest;
    await controller.handleMessage(message);
    host.mainGenerationActive = true;
    host.generationListener(true);
    host.mainGenerationActive = false;
    host.generationListener(false);
    const nextRequest = deferred();
    host.boardRequest = nextRequest;
    await controller.handleMessage(message);
    oldRequest.reject(new Error('late cancelled provider failure'));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal((await controller.handleMessage({ type: 'tasks/activate', payload: message.payload })).generation.state, 'running');
    nextRequest.resolve({ kind: 'board', status: 'unchanged', changed: false });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(host.posts.at(-1).payload.state.generation.state, 'idle');
    assert.deepEqual(host.reports, []);
});

test('leaving Tasks does not cancel Host-owned maintenance', async () => {
    const { controller, host } = createHarness();
    await controller.activate(activation(host));
    host.calls.length = 0;
    await controller.handleMessage({
        type: 'tasks/maintenance/run', payload: { chatIdentity: host.identity.key },
    });

    controller.deactivate('route-left');
    assert.equal(host.calls.some(call => call[0] === 'cancel-maintenance'), false);
});

test('activation consumes the OS snapshot without starting another storage refresh', async () => {
    const { controller, host } = createHarness();
    let refreshCalls = 0;
    host.refreshRequest = {
        get promise() {
            refreshCalls += 1;
            return Promise.resolve();
        },
    };
    await controller.activate(activation(host));
    await controller.activate(activation(host));

    assert.equal(refreshCalls, 0);
    await assert.rejects(
        controller.handleMessage({
            type: 'tasks/settings/update', payload: { chatIdentity: 'other-chat', autoMaintenance: true },
        }),
        /tasks_chat_changed/,
    );
});

test('canonical Kernel write failures retain their specific public Tasks errors', async () => {
    const { controller, host } = createHarness();
    await controller.activate(activation(host));
    const payload = { chatIdentity: host.identity.key, form: {
        title: '护送药箱',
        objective: '送达南门诊所',
        location: '南门诊所',
        risk: '道路封锁',
        reward: 80,
    } };

    host.taskError = Object.assign(new Error('frozen'), { code: 'storage_unconfirmed' });
    await assert.rejects(
        controller.handleMessage({ type: 'tasks/publish', payload }),
        /tasks_save_unconfirmed/,
    );
    host.taskError = Object.assign(new Error('changed'), { code: 'chat_changed' });
    await assert.rejects(
        controller.handleMessage({ type: 'tasks/publish', payload }),
        /tasks_chat_changed/,
    );
});

test('late generation results are rejected after chat change without publishing stale state or expected-error logs', async () => {
    const { controller, host } = createHarness();
    await controller.activate(activation(host));
    host.posts.length = 0;
    host.calls.length = 0;
    const request = deferred();
    host.boardRequest = request;
    const started = await controller.handleMessage({
        type: 'tasks/refresh', payload: { chatIdentity: host.identity.key },
    });
    host.identity = { key: 'character:1:chat-b' };
    controller.handleChatChanged();
    request.resolve({ kind: 'board', status: 'cancelled', changed: false });

    assert.equal(started.started, true);
    const reopened = await controller.activate(activation(host));
    assert.equal(reopened.generation.state, 'idle');
    assert.equal(reopened.generation.message, '');
    const stalePosts = host.posts.filter(post => post.payload?.state?.chatIdentity === 'character:1:chat-a').length;
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(host.reports, []);
    assert.equal(host.posts.filter(post => post.payload?.state?.chatIdentity === 'character:1:chat-a').length, stalePosts);
    assert.deepEqual(host.calls.slice(-3), [
        ['cancel-generation', 'chat-changed'],
        ['cancel-maintenance', 'chat-changed'],
        ['invalidate-automatic', 'chat-changed'],
    ]);
});

test('subscriptions publish only for the active chat and expose Tasks maintenance state', async () => {
    const { controller, host } = createHarness();
    await controller.activate(activation(host));
    host.posts.length = 0;

    host.identity = { key: 'character:1:chat-b' };
    host.dataListener();
    assert.equal(host.posts.length, 0);
    host.identity = { key: 'character:1:chat-a' };
    host.maintenanceStatus = { state: 'running', mode: 'manual', message: '', reason: '', lastRunAt: null };
    host.maintenanceStatuses.set('character:1:chat-a', host.maintenanceStatus);
    host.maintenanceListener('tasks', 'character:1:chat-a', host.maintenanceStatus);
    assert.equal(host.posts.at(-1).payload.state.maintenance.state, 'running');
    host.identity = { key: 'character:1:chat-b' };
    host.generationListener();
    assert.equal(host.posts.length, 1);

    const next = await controller.activate(activation(host));
    assert.equal(next.maintenance.state, 'idle');
    host.maintenanceListener('tasks', 'character:1:chat-a', host.maintenanceStatus);
    assert.equal(host.posts.length, 1);
});

test('main generation start aborts in-flight Tasks generation before publishing the new state', async () => {
    const { controller, host } = createHarness();
    await controller.activate(activation(host));
    host.calls.length = 0;
    const request = deferred();
    host.boardRequest = request;
    await controller.handleMessage({
        type: 'tasks/refresh', payload: { chatIdentity: host.identity.key },
    });

    host.mainGenerationActive = true;
    host.generationListener(true);
    request.resolve({ kind: 'board', status: 'cancelled', changed: false });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(host.posts.at(-1).payload.state.generation.state, 'idle');
    assert.equal(host.posts.at(-1).payload.state.generationActive, true);
    assert.deepEqual(host.calls.slice(-1), [['cancel-generation', 'main-generation-started']]);
});

test('manual maintenance cannot bypass unopened economy or the root write gate', async () => {
    const { controller, host } = createHarness();
    await controller.activate(activation(host));
    const payload = { chatIdentity: host.identity.key };
    host.economyReady = false;

    await assert.rejects(
        controller.handleMessage({ type: 'tasks/maintenance/run', payload }),
        /tasks_state_unavailable/,
    );
    host.economyReady = true;
    host.writeState = 'unconfirmed';
    await assert.rejects(
        controller.handleMessage({ type: 'tasks/maintenance/run', payload }),
        /tasks_write_blocked/,
    );
});
