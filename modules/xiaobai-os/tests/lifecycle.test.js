import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';

import { createXiaobaiOsLifecycle } from '../host/lifecycle.js';
import { xiaobaiOsLaunchers } from '../shell/app-launchers.js';

async function waitFor(predicate, message = 'condition was not reached') {
    for (let attempt = 0; attempt < 20; attempt += 1) {
        if (predicate()) return;
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    assert.fail(message);
}

function createHarness({ appRuntime = {}, captureChatBinding = () => ({
    identityKey: 'character:fixture.png:chat', binding: { kind: 'character', ownerLocator: 'fixture.png', chatId: 'chat' }, reference: null,
}), isChatBindingCurrent, onError, onChatRequired, getAppOrder, saveAppOrder, subscribeAppOrderChanged } = {}) {
    const { document, window } = parseHTML(`<!doctype html><html><head></head><body>
        <div id="send-controls"><button id="message_preview_btn"></button><button id="send_but"></button></div>
    </body></html>`);
    let chatChanged = null;
    let appDescriptorsChanged = null;
    let appStatusChanged = null;
    let appDescriptors = [{ id: 'fourth-wall', name: '四次元壁' }];
    const appStatuses = {};
    let subscriptions = 0;
    let unsubscriptions = 0;
    let bridgeDisposals = 0;
    let bridgeOptions = null;
    const posts = [];
    const bridgeFactory = (options) => {
        bridgeOptions = options;
        const instance = {
            post(type, payload, requestId, app) {
                posts.push({ type, payload, requestId, ...app });
                return true;
            },
            isReady: () => true,
            dispose() { bridgeDisposals += 1; },
        };
        bridgeOptions.bridge = instance;
        return instance;
    };
    const runtimeCalls = [];
    const lifecycle = createXiaobaiOsLifecycle({
        documentTarget: document,
        windowTarget: window,
        stylesheetHref: '/xiaobai-os/host.css',
        frameSrc: '/xiaobai-os/shell.html',
        bridgeFactory,
        subscribeChatChanged(handler) {
            subscriptions += 1;
            chatChanged = handler;
            return () => {
                unsubscriptions += 1;
                chatChanged = null;
            };
        },
        subscribeAppDescriptorsChanged(handler) {
            appDescriptorsChanged = handler;
            return () => {appDescriptorsChanged = null;};
        },
        subscribeAppStatusChanged(handler) {
            appStatusChanged = handler;
            return () => {appStatusChanged = null;};
        },
        getInitSnapshot: () => ({ theme: 'dark', chat: null }),
        getAppDescriptors: () => appDescriptors,
        getAppStatuses: () => appStatuses,
        captureChatBinding,
        onChatRequired,
        isChatBindingCurrent,
        onError,
        getAppOrder,
        saveAppOrder,
        subscribeAppOrderChanged,
        appRuntime: {
            cancelAll: reason => runtimeCalls.push(['cancelAll', reason]),
            cancelForeground: reason => runtimeCalls.push(['cancelForeground', reason]),
            deactivate: (id, reason) => runtimeCalls.push(['deactivate', id, reason]),
            startBackground: () => runtimeCalls.push(['startBackground']),
            stopBackground: () => runtimeCalls.push(['stopBackground']),
            ...appRuntime,
        },
    });
    return {
        bridgeDisposals: () => bridgeDisposals,
        bridgeOptions: () => bridgeOptions,
        chatChanged: () => chatChanged,
        appDescriptorsChanged: () => appDescriptorsChanged,
        document,
        lifecycle,
        posts,
        runtimeCalls,
        subscriptions: () => subscriptions,
        setAppDescriptors(next) {appDescriptors = next;},
        setAppStatus(appId, status) {
            appStatuses[appId] = status;
            appStatusChanged?.(appId, status);
        },
        unsubscriptions: () => unsubscriptions,
        window,
    };
}

test('launcher refuses to open without a chat, then accepts a character or group with no existing OS file', async () => {
    let binding = null; let prompts = 0; let opened = 0;
    const harness = createHarness({ captureChatBinding: () => binding, onChatRequired: () => {prompts++;},
        appRuntime: { handleWindowOpened: () => {opened++;} } });
    harness.lifecycle.init();
    harness.document.getElementById('xiaobaix-os-button').click();
    assert.equal(prompts, 1); assert.equal(harness.lifecycle.isOpen(), false);
    assert.equal(harness.document.querySelector('iframe'), null); assert.equal(opened, 0);
    for (const kind of ['character', 'group']) {
        binding = { identityKey: kind + ':owner:chat', binding: { kind, ownerLocator: 'owner', chatId: 'chat' }, reference: null };
        assert.equal(harness.lifecycle.open(), true);
        await waitFor(() => opened > 0);
        assert.ok(harness.document.querySelector('iframe'));
        await harness.lifecycle.closeWindow();
    }
    assert.equal(prompts, 1);
    await harness.lifecycle.cleanup();
});

test('init is idempotent and mounts one launcher before preview and send', () => {
    const harness = createHarness();

    assert.equal(harness.lifecycle.init(), true);
    assert.equal(harness.lifecycle.init(), true);

    const controls = harness.document.getElementById('send-controls');
    assert.deepEqual(Array.from(controls.children).map(element => element.id), [
        'xiaobaix-os-button',
        'message_preview_btn',
        'send_but',
    ]);
    assert.equal(harness.document.querySelectorAll('#xiaobaix-os-button').length, 1);
    assert.equal(harness.document.querySelectorAll('#xiaobaix-os-host-styles').length, 1);
    assert.equal(harness.subscriptions(), 1);
    assert.deepEqual(harness.runtimeCalls, [['startBackground']]);
});

test('shortcuts expose the desktop first six without opening a window or activating apps', async () => {
    let activations = 0; let opened = 0;
    const harness = createHarness({ appRuntime: {
        activate: () => { activations++; }, handleWindowOpened: () => { opened++; },
    } });
    harness.setAppDescriptors([...xiaobaiOsLaunchers].reverse());
    harness.lifecycle.init();
    const launcher = harness.document.getElementById('xiaobaix-os-button');
    const panel = harness.document.getElementById('xiaobaix-os-shortcuts');
    for (let index = 0; index < 3; index++) { launcher.click(); launcher.click(); }
    launcher.click();
    assert.equal(launcher.getAttribute('aria-expanded'), 'true');
    assert.equal(panel.getAttribute('aria-hidden'), 'false');
    assert.deepEqual([...panel.querySelectorAll('[data-app-id]')].map(button => button.dataset.appId),
        xiaobaiOsLaunchers.slice(0, 6).map(app => app.id));
    assert.equal(harness.document.querySelector('iframe'), null);
    assert.equal(opened, 0); assert.equal(activations, 0);

    panel.querySelector('[data-app-id="world"]').click();
    assert.equal(launcher.getAttribute('aria-expanded'), 'false');
    const options = harness.bridgeOptions();
    await options.onReady(options.bridge);
    assert.equal(harness.posts.find(post => post.type === 'os/init').payload.initialAppId, 'world');
    assert.equal(opened, 1);
    await harness.lifecycle.cleanup();
});

test('shortcut desktop entry has no app target and unavailable apps cannot be opened', async () => {
    const harness = createHarness();
    harness.lifecycle.init();
    const launcher = harness.document.getElementById('xiaobaix-os-button');
    launcher.click();
    harness.document.querySelector('[aria-label="打开桌面"]').click();
    const options = harness.bridgeOptions();
    await options.onReady(options.bridge);
    assert.equal(harness.posts.at(-1).payload.initialAppId, null);
    assert.equal(harness.lifecycle.open('missing-app'), false);
    assert.equal(harness.lifecycle.open('fourth-wall'), true);
    assert.deepEqual(harness.posts.at(-1).payload, { appId: 'fourth-wall' });
    await harness.lifecycle.cleanup();
});

test('outside pointer, Escape, chat changes and cleanup dismiss shortcuts without opening an app', async () => {
    const harness = createHarness();
    harness.lifecycle.init();
    const launcher = harness.document.getElementById('xiaobaix-os-button');
    launcher.click();
    harness.document.getElementById('send_but').dispatchEvent(new harness.window.Event('pointerdown', { bubbles: true }));
    assert.equal(launcher.getAttribute('aria-expanded'), 'false');
    launcher.click();
    const escape = new harness.window.Event('keydown', { bubbles: true, cancelable: true });
    Object.defineProperty(escape, 'key', { value: 'Escape' });
    harness.document.dispatchEvent(escape);
    assert.equal(launcher.getAttribute('aria-expanded'), 'false');
    assert.equal(escape.defaultPrevented, true);
    launcher.click();
    harness.chatChanged()();
    assert.equal(launcher.getAttribute('aria-expanded'), 'false');
    assert.equal(harness.document.querySelector('iframe'), null);
    await harness.lifecycle.cleanup();
    assert.equal(harness.document.getElementById('xiaobaix-os-shortcuts'), null);
});

test('shortcuts refresh availability and a late frame cannot consume the next window destination', async () => {
    const harness = createHarness();
    harness.lifecycle.init();
    harness.lifecycle.open('fourth-wall');
    const old = harness.bridgeOptions();
    await harness.lifecycle.closeWindow();
    harness.setAppDescriptors(xiaobaiOsLaunchers.filter(app => app.id === 'world'));
    harness.appDescriptorsChanged()();
    assert.deepEqual([...harness.document.querySelectorAll('[data-app-id]')].map(button => button.dataset.appId), ['world']);
    harness.lifecycle.open('world');
    const current = harness.bridgeOptions();
    await old.onReady(old.bridge);
    assert.equal(harness.posts.length, 0);
    await current.onReady(current.bridge);
    assert.equal(harness.posts.at(-1).payload.initialAppId, 'world');
    await harness.lifecycle.cleanup();
});

test('open is idempotent and closing a window preserves host resources', () => {
    const harness = createHarness();
    harness.lifecycle.init();

    assert.equal(harness.lifecycle.open(), true);
    assert.equal(harness.lifecycle.open(), true);
    assert.equal(harness.document.querySelectorAll('#xiaobaix-os-overlay').length, 1);

    harness.lifecycle.closeWindow('test-close');
    assert.equal(harness.document.getElementById('xiaobaix-os-overlay'), null);
    assert.ok(harness.document.getElementById('xiaobaix-os-button'));
    assert.ok(harness.document.getElementById('xiaobaix-os-host-styles'));
    assert.equal(harness.bridgeDisposals(), 1);
});

test('desktop order is persisted once, shared with shortcuts and reused by a new frame', async () => {
    let order = [];
    let changed;
    let saves = 0;
    const harness = createHarness({ getAppOrder: () => order,
        saveAppOrder: async next => { order = next; saves++; changed(); },
        subscribeAppOrderChanged: callback => { changed = callback; return () => { changed = null; }; },
    });
    harness.setAppDescriptors(xiaobaiOsLaunchers);
    harness.lifecycle.init();
    harness.lifecycle.open();
    const frame = harness.bridgeOptions();
    const custom = xiaobaiOsLaunchers.map(app => app.id).reverse();
    await frame.onMessage({ type: 'os/set-app-order', requestId: 'sort', payload: { appOrder: custom } }, frame.bridge);
    assert.equal(saves, 1);
    assert.deepEqual(harness.posts.find(post => post.requestId === 'sort').payload, { ok: true, appOrder: custom });
    assert.deepEqual([...harness.document.querySelectorAll('.xiaobaix-os-shortcut')].map(tile => tile.dataset.appId), custom.slice(0, 6));
    await harness.lifecycle.closeWindow();
    harness.lifecycle.open();
    const reopened = harness.bridgeOptions();
    await reopened.onReady(reopened.bridge);
    assert.deepEqual(harness.posts.filter(post => post.type === 'os/init').at(-1).payload.appOrder, custom);
    assert.equal(saves, 1);
    for (const invalid of [['world', 'world'], ['unknown-app'], null]) {
        await reopened.onMessage({ type: 'os/set-app-order', requestId: 'invalid', payload: { appOrder: invalid } }, reopened.bridge);
        assert.equal(harness.posts.at(-1).payload.ok, false);
    }
    assert.equal(saves, 1);
    await harness.lifecycle.cleanup();
    assert.equal(changed, null);
});

test('failed order saves report locally; late user-setting completion cannot post into the next chat frame', async () => {
    let complete;
    let failing = true;
    const harness = createHarness({ onError: () => {}, saveAppOrder: async () => {
        if (failing) { throw new Error('offline'); }
        await new Promise(resolve => { complete = resolve; });
    } });
    harness.lifecycle.init(); harness.lifecycle.open();
    const frame = harness.bridgeOptions();
    await frame.onMessage({ type: 'os/set-app-order', requestId: 'failed-sort', payload: { appOrder: [] } }, frame.bridge);
    assert.equal(harness.posts.at(-1).payload.error, 'app_order_save_failed');
    assert.equal(harness.lifecycle.isOpen(), true);
    failing = false;
    const pending = frame.onMessage({ type: 'os/set-app-order', requestId: 'late-sort', payload: { appOrder: [] } }, frame.bridge);
    await waitFor(() => !!complete);
    harness.chatChanged()();
    harness.lifecycle.open();
    complete();
    await pending;
    assert.equal(harness.posts.some(post => post.requestId === 'late-sort'), false);
    await harness.lifecycle.cleanup();
});

test('trusted frame ready receives a fresh snapshot and unknown apps stay inactive', async () => {
    const harness = createHarness();
    harness.lifecycle.init();
    harness.lifecycle.open();
    const options = harness.bridgeOptions();

    await options.onReady(options.bridge);
    assert.equal(harness.posts[0].type, 'os/init');
    assert.deepEqual(harness.posts[0].payload.apps, [{
        id: 'fourth-wall',
        name: '四次元壁',
        status: { state: 'loading', phase: 'install' },
    }]);
});

test('frame initialization waits for the window-open refresh boundary', async () => {
    let finishRefresh;
    const harness = createHarness({
        appRuntime: {
            handleWindowOpened: () => new Promise(resolve => { finishRefresh = resolve; }),
        },
    });
    harness.lifecycle.init();
    harness.lifecycle.open();
    const options = harness.bridgeOptions();
    const ready = options.onReady(options.bridge);
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(harness.posts.some(post => post.type === 'os/init'), false);

    finishRefresh();
    await ready;
    assert.equal(harness.posts.at(-1).type, 'os/init');
});

test('leaving an app route invalidates an activation that is still pending', async () => {
    let finishActivation;
    const harness = createHarness({
        appRuntime: {
            activate: () => new Promise(resolve => { finishActivation = resolve; }),
        },
    });
    harness.lifecycle.init();
    harness.lifecycle.open();
    const options = harness.bridgeOptions();
    const pending = options.onMessage({
        type: 'app/activate',
        requestId: 'activate-1',
        payload: { appId: 'fourth-wall' },
    }, options.bridge);

    await waitFor(() => typeof finishActivation === 'function', 'APP activation did not start');
    await options.onMessage({ type: 'app/deactivate', requestId: 'deactivate-1' }, options.bridge);
    finishActivation({ stale: true });
    await pending;

    assert.equal(harness.posts.some(item => item.type === 'app/activation-result' && item.payload.ok === true), false);
    assert.equal(
        harness.posts.some(item => item.type === 'app/activation-result' && item.payload.error === 'activation_cancelled'),
        true,
    );
});

test('an async app request cannot settle as success after the same app is reopened', async () => {
    let finishRequest;
    const harness = createHarness({
        appRuntime: {
            activate: async () => ({}),
            handleMessage: () => new Promise(resolve => { finishRequest = resolve; }),
        },
    });
    harness.lifecycle.init();
    harness.lifecycle.open();
    const options = harness.bridgeOptions();
    await options.onMessage({
        type: 'app/activate',
        requestId: 'activate-1',
        payload: { appId: 'fourth-wall' },
    }, options.bridge);
    const firstActivation = harness.posts.find(item => item.requestId === 'activate-1');
    const firstSession = {
        appId: 'fourth-wall',
        activationToken: firstActivation.payload.activationToken,
    };
    const pending = options.onMessage({
        type: 'fourth-wall/refresh',
        requestId: 'stale-request',
        ...firstSession,
        payload: {},
    }, options.bridge);
    await waitFor(() => typeof finishRequest === 'function', 'APP request did not start');
    await options.onMessage({ type: 'app/deactivate', ...firstSession }, options.bridge);
    await options.onMessage({
        type: 'app/activate',
        requestId: 'activate-2',
        payload: { appId: 'fourth-wall' },
    }, options.bridge);

    finishRequest({ stale: true });
    await pending;

    const response = harness.posts.find(item => item.requestId === 'stale-request');
    assert.equal(response.type, 'fourth-wall/result');
    assert.deepEqual(response.payload, { ok: false, error: 'app_inactive' });
    assert.equal(response.activationToken, firstSession.activationToken);
});

test('an in-flight APP request is rejected when its captured sidecar binding changes', async () => {
    let finishRequest;
    let currentBinding = {
        identityKey: 'character:avatar.png:chat-a',
        binding: { kind: 'character', ownerLocator: 'avatar.png', chatId: 'chat-a' },
        reference: { formatVersion: 1, osId: 'os-a' },
    };
    const harness = createHarness({
        captureChatBinding: () => currentBinding,
        isChatBindingCurrent: captured => captured.reference?.osId === currentBinding.reference?.osId,
        appRuntime: {
            activate: async () => ({}),
            handleMessage: () => new Promise(resolve => { finishRequest = resolve; }),
        },
    });
    harness.lifecycle.init();
    harness.lifecycle.open();
    const options = harness.bridgeOptions();
    await options.onMessage({
        type: 'app/activate',
        requestId: 'activate-binding',
        payload: { appId: 'fourth-wall' },
    }, options.bridge);
    const activation = harness.posts.find(item => item.requestId === 'activate-binding');
    const session = { appId: 'fourth-wall', activationToken: activation.payload.activationToken };
    const pending = options.onMessage({
        type: 'fourth-wall/refresh',
        requestId: 'binding-request',
        ...session,
    }, options.bridge);
    await waitFor(() => typeof finishRequest === 'function', 'APP request did not start');
    currentBinding = {
        ...currentBinding,
        reference: { formatVersion: 1, osId: 'os-b' },
    };
    finishRequest({ stale: true });
    await pending;

    const response = harness.posts.find(item => item.requestId === 'binding-request');
    assert.deepEqual(response.payload, { ok: false, error: 'app_inactive' });
    assert.equal(response.activationToken, session.activationToken);
});

test('activation failures expose a stable public failure and keep the cause in host logging', async () => {
    const errors = [];
    const harness = createHarness({
        onError: error => errors.push(error),
        appRuntime: {
            activate: async () => {
                throw Object.assign(new Error('private activation details'), {
                    code: 'storage_missing',
                    retryable: true,
                });
            },
        },
    });
    harness.lifecycle.init();
    harness.lifecycle.open();
    const options = harness.bridgeOptions();
    await options.onMessage({
        type: 'app/activate',
        requestId: 'activate-failed',
        payload: { appId: 'fourth-wall' },
    }, options.bridge);

    assert.deepEqual(harness.posts.find(item => item.requestId === 'activate-failed').payload, {
        ok: false,
        error: 'storage_missing',
        message: 'private activation details',
        phase: 'activate',
        retryable: true,
    });
    assert.equal(errors.length, 1);
});

test('a synchronous failed status cannot mask its pending activation error', async () => {
    let failActivation;
    let harness;
    harness = createHarness({
        onError: () => undefined,
        appRuntime: {
            activate: () => new Promise((_resolve, reject) => {
                failActivation = () => {
                    const error = Object.assign(new Error('private activation details'), {
                        code: 'storage_missing',
                        retryable: true,
                    });
                    harness.setAppStatus('fourth-wall', {
                        state: 'failed',
                        failure: {
                            code: 'storage_missing',
                            message: error.message,
                            phase: 'activate',
                            retryable: true,
                        },
                    });
                    reject(error);
                };
            }),
        },
    });
    harness.lifecycle.init();
    harness.lifecycle.open();
    const options = harness.bridgeOptions();
    const pending = options.onMessage({
        type: 'app/activate',
        requestId: 'activate-status-failed',
        payload: { appId: 'fourth-wall' },
    }, options.bridge);
    await waitFor(() => typeof failActivation === 'function', 'APP activation did not start');
    failActivation();
    await pending;

    assert.deepEqual(harness.posts.find(item => item.requestId === 'activate-status-failed').payload, {
        ok: false,
        error: 'storage_missing',
        message: 'private activation details',
        phase: 'activate',
        retryable: true,
        requiresAppRetry: true,
    });
});

test('descriptor changes update an open shell and deactivate an app that was removed', async () => {
    const harness = createHarness({ appRuntime: { activate: async () => ({}) } });
    harness.lifecycle.init();
    harness.lifecycle.open();
    const options = harness.bridgeOptions();
    await options.onReady(options.bridge);
    await options.onMessage({
        type: 'app/activate',
        requestId: 'activate-1',
        payload: { appId: 'fourth-wall' },
    }, options.bridge);

    harness.setAppDescriptors([{ id: 'agent-api', name: 'Agent API' }]);
    harness.appDescriptorsChanged()();

    assert.deepEqual(harness.runtimeCalls.at(-1), ['deactivate', 'fourth-wall', 'app-disabled']);
    assert.deepEqual(harness.posts.at(-1), {
        type: 'os/apps-changed',
        payload: {
            apps: [{
                id: 'agent-api',
                name: 'Agent API',
                status: { state: 'loading', phase: 'install' },
            }],
        },
        requestId: undefined,
    });
});

test('removing an app while activation is pending prevents a late success', async () => {
    let finishActivation;
    const harness = createHarness({
        appRuntime: {
            activate: () => new Promise(resolve => {finishActivation = resolve;}),
        },
    });
    harness.lifecycle.init();
    harness.lifecycle.open();
    const options = harness.bridgeOptions();
    const pending = options.onMessage({
        type: 'app/activate',
        requestId: 'activate-pending',
        payload: { appId: 'fourth-wall' },
    }, options.bridge);
    await waitFor(() => typeof finishActivation === 'function', 'APP activation did not start');

    harness.setAppDescriptors([]);
    harness.appDescriptorsChanged()();
    finishActivation({ stale: true });
    await pending;

    const response = harness.posts.find(item => item.requestId === 'activate-pending');
    assert.deepEqual(response.payload, { ok: false, error: 'activation_cancelled' });
    assert.equal(harness.runtimeCalls.some(call => call[0] === 'cancelForeground' && call[1] === 'app-disabled'), true);
});

test('chat changes close the foreground window without unloading the launcher', async () => {
    const harness = createHarness();
    harness.lifecycle.init();
    harness.lifecycle.open();

    harness.chatChanged()();

    await waitFor(() => harness.document.getElementById('xiaobaix-os-overlay') === null, 'window did not close');

    assert.equal(harness.document.getElementById('xiaobaix-os-overlay'), null);
    assert.ok(harness.document.getElementById('xiaobaix-os-button'));
    assert.deepEqual(harness.runtimeCalls.slice(-2), [
        ['cancelAll', 'chat-changed'],
        ['cancelForeground', 'chat-changed'],
    ]);
});

test('cleanup is repeatable and removes every owned host resource', () => {
    const harness = createHarness();
    harness.lifecycle.init();
    harness.lifecycle.open();

    harness.lifecycle.cleanup();
    harness.lifecycle.cleanup();

    assert.equal(harness.document.getElementById('xiaobaix-os-overlay'), null);
    assert.equal(harness.document.getElementById('xiaobaix-os-button'), null);
    assert.equal(harness.document.getElementById('xiaobaix-os-host-styles'), null);
    assert.equal(harness.unsubscriptions(), 1);
    assert.equal(harness.lifecycle.isInitialized(), false);
});

test('persisted pagehide preserves the runtime while a final pagehide cleans it', () => {
    const harness = createHarness();
    harness.lifecycle.init();
    const persisted = new harness.window.Event('pagehide');
    Object.defineProperty(persisted, 'persisted', { value: true });
    harness.window.dispatchEvent(persisted);
    assert.equal(harness.lifecycle.isInitialized(), true);

    const final = new harness.window.Event('pagehide');
    Object.defineProperty(final, 'persisted', { value: false });
    harness.window.dispatchEvent(final);
    assert.equal(harness.lifecycle.isInitialized(), false);
});
