import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { build } from 'esbuild';

// Acceptance contracts (all failures corrupt the request/chat protocol):
// 1. Later fetch wrappers are observed once, after rewriting; only real host
//    MESSAGE_RECEIVED events associate records, never a guessed nearby floor.
// 2. Observation preserves arguments, promise, response, errors and chat data;
//    slow/unreadable bodies must not delay or block the actual request.
// 3. Preview sees the same final body, sends nothing, and creates no real log.
// 4. Toggle/reinitialization/cleanup must not remove other fetch wrappers,
//    resurrect observers, or leak an old chat's request into the next chat.
// 5. Background calls must not replace a foreground log or its floor owner,
//    including nested quiet generation and late body decoding.

const target = '/api/backends/chat-completions/generate';
const body = text => JSON.stringify({ model: 'test', messages: [{ role: 'user', content: text }] });
const types = Object.fromEntries(['GENERATION_STARTED', 'GENERATION_ENDED', 'GENERATION_STOPPED',
    'MESSAGE_RECEIVED', 'CHARACTER_MESSAGE_RENDERED', 'USER_MESSAGE_RENDERED', 'CHAT_CHANGED',
    'MESSAGE_DELETED', 'CHAT_COMPLETION_SETTINGS_READY'].map(name => [name, name]));
class Events {
    listeners = new Map();
    on(event, fn) { this.listeners.set(event, [...(this.listeners.get(event) || []), fn]); }
    removeListener(event, fn) { this.listeners.set(event, (this.listeners.get(event) || []).filter(item => item !== fn)); }
    makeLast(event, fn) { this.removeListener(event, fn); this.on(event, fn); }
    async emit(event, ...args) { for (const fn of [...(this.listeners.get(event) || [])]) await fn(...args); }
}
const built = await build({
    stdin: {
        contents: fs.readFileSync(new URL('./message-preview.js', import.meta.url), 'utf8') +
            '\nexport const probe = { S, setupFetch, restoreFetch, updateFetchState, addEvents, findRec, waitIntercept, showHistoryPreview, buildPreviewHtml };',
        resolveDir: fileURLToPath(new URL('.', import.meta.url)),
        sourcefile: 'message-preview.js',
    },
    bundle: true, write: false, format: 'cjs', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'preview-host', setup(api) {
        api.onResolve({ filter: /(?:extensions|script)\.js$/ }, ({ path }) => ({ path, namespace: 'host' }));
        api.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: path.endsWith('extensions.js')
            ? 'export const extension_settings=__fixture.settings; export const getContext=()=>__fixture.ctx;'
            : 'export const eventSource=__fixture.events,event_types=__fixture.types; export const saveSettingsDebounced=()=>{};' }));
    } }],
});

function fixture(t, fetchImpl, beforeInit = () => {}) {
    const f = { types, events: new Events(), sent: [], warnings: [], settings: { LittleWhiteBox: {
        preview: { enabled: true, timeoutSeconds: 30 }, recorded: { enabled: true },
    } }, ctx: { chat: [{ is_user: false, mes: 'greeting' }, { is_user: true, mes: 'question' }], characters: [] } };
    const chain = { prop: () => false, val: () => '', length: 0 };
    for (const name of ['off', 'on', 'remove', 'each', 'css', 'toggle', 'hide', 'before', 'find', 'last', 'removeClass', 'addClass']) chain[name] = () => chain;
    chain.prop = function (_key, value) { return arguments.length === 1 ? false : chain; };
    const windowEvents = new Events();
    const native = fetchImpl || function (input, options) {
        f.sent.push({ input, options, receiver: this });
        return Promise.resolve(new Response('reply'));
    };
    const timers = new Map(); let timerId = 0;
    const box = { __fixture: f, module: { exports: {} },
        console: { ...console, warn: (...args) => f.warnings.push(args), error: (...args) => f.warnings.push(args) },
        Request, Response, Blob, URL, URLSearchParams, ArrayBuffer, TextDecoder, Uint8Array, AbortController,
        structuredClone, queueMicrotask, $: () => chain, toastr: { error() {}, warning() {}, info() {}, clear() {} },
        setTimeout: (fn, ms) => { timers.set(++timerId, { fn, ms }); return timerId; }, clearTimeout: id => timers.delete(id),
        setInterval: () => 0, clearInterval() {},
        document: { addEventListener() {}, removeEventListener() {}, visibilityState: 'visible' },
        fetch: native, location: { href: 'http://localhost/' }, isXiaobaixEnabled: true,
        addEventListener: (event, fn) => windowEvents.on(event, fn),
        removeEventListener: (event, fn) => windowEvents.removeListener(event, fn),
    };
    box.window = box;
    vm.runInNewContext(built.outputFiles[0].text, box);
    f.box = box; f.native = native; f.api = box.module.exports; f.probe = f.api.probe;
    f.options = f.settings.LittleWhiteBox;
    f.start = (type = 'normal', options = {}, dryRun = false) => f.events.emit(types.GENERATION_STARTED, type, options, dryRun);
    f.flush = async () => { for (let i = 0; i < 4; i++) await nextTurn(); };
    f.rewrite = text => {
        const original = box.fetch;
        const wrapper = (input, init) => original(input, { ...init, body: body(text) });
        box.fetch = wrapper; return wrapper;
    };
    f.receive = async (index = 2, type = 'normal') => {
        if (!f.ctx.chat[index]) f.ctx.chat[index] = { is_user: false, mes: 'reply' };
        await f.events.emit(types.MESSAGE_RECEIVED, index, type);
        await f.flush();
    };
    beforeInit(f);
    f.probe.setupFetch(); f.probe.addEvents();
    t.after(() => f.api.cleanup());
    return f;
}

test('one rewritten network body becomes one exact floor record, not settings_ready or a neighboring floor', async t => {
    const f = fixture(t); f.rewrite('rewritten');
    await f.start();
    await f.events.emit(types.CHAT_COMPLETION_SETTINGS_READY, JSON.parse(body('original')));
    await f.box.fetch(target, { method: 'POST', body: body('original') });
    await f.receive();
    assert.equal(f.sent.length, 1);
    assert.equal(f.probe.S.history.length, 1);
    assert.equal(f.probe.findRec(2).requestData.messages[0].content, 'rewritten');
    assert.equal(f.probe.findRec(1), null);
    assert.equal(f.probe.findRec(3), null);
});

test('logging is immediate transparent pass-through, even while its body copy is unreadable or slow', async t => {
    const response = new Response('unchanged');
    const promise = Promise.resolve(response);
    const calls = [];
    const f = fixture(t, function (...args) { calls.push({ args, receiver: this }); return promise; });
    const before = structuredClone(f.ctx.chat);
    const settingsBefore = structuredClone(f.settings);
    const controller = new AbortController();
    const init = { method: 'POST', body: body('plain'), signal: controller.signal, headers: { 'X-Test': 'original' } };
    const receiver = {};
    assert.equal(f.box.fetch.call(receiver, target, init), promise);
    assert.equal(calls[0].args[1], init);
    assert.equal(calls[0].receiver, receiver);
    assert.equal(await promise, response);
    assert.equal(await response.text(), 'unchanged');
    const request = new Request('http://localhost' + target, { method: 'POST', body: body('slow') });
    request.clone = () => ({ text: () => new Promise(() => {}) });
    assert.equal(f.box.fetch(request), promise);
    request.clone = () => { throw new Error('cannot copy'); };
    assert.equal(f.box.fetch(request), promise);
    await f.flush();
    assert.deepEqual(f.ctx.chat, before);
    assert.deepEqual(f.settings, settingsBefore);
});

test('Request + init.body uses the overriding body and does not consume the Request', async t => {
    const f = fixture(t); await f.start();
    const request = new Request('http://localhost' + target, { method: 'POST', body: body('request') });
    await f.box.fetch(request, { body: body('override') });
    await f.receive();
    assert.equal(f.probe.findRec(2).requestData.messages[0].content, 'override');
    assert.equal(request.bodyUsed, false);
    assert.equal(await request.text(), body('request'));
});

test('preview captures the rewritten Request body and never calls network or records it', async t => {
    const f = fixture(t); f.rewrite('preview rewrite');
    f.probe.S.isPreview = true;
    await f.start();
    const captured = f.probe.waitIntercept();
    const request = new Request('http://localhost' + target, { method: 'POST', body: body('request') });
    const reply = await f.box.fetch(request);
    const result = await captured;
    assert.equal(result.data.requestData.messages[0].content, 'preview rewrite');
    assert.equal((await reply.json()).choices[0].message.content, '');
    // A wrapper may retry after receiving the empty reply, after the popup opens.
    f.probe.S.isPreview = false;
    await f.box.fetch(target, { method: 'POST', body: body('retry') });
    assert.equal(f.sent.length, 0);
    assert.equal(f.probe.S.history.length, 0);
});

test('recording off is off even with preview enabled; settings events never record', async t => {
    const f = fixture(t); f.options.recorded.enabled = false;
    await f.start();
    await f.events.emit(types.CHAT_COMPLETION_SETTINGS_READY, JSON.parse(body('settings')));
    await f.box.fetch(target, { body: body('ordinary') });
    await f.flush();
    assert.equal(f.probe.S.history.length, 0);
    assert.equal(f.sent.length, 1);
});

test('retries retain only the last real body; streamed end-before-receive, swipe and continue associate precisely', async t => {
    const f = fixture(t);
    for (const type of ['normal', 'swipe', 'continue']) {
        await f.start(type);
        await f.box.fetch(target, { body: body('attempt') });
        await f.box.fetch(target, { body: body(type) });
        await f.events.emit(types.GENERATION_ENDED, 3);
        await f.receive(2, type);
        assert.equal(f.probe.findRec(2).requestData.messages[0].content, type);
    }
    assert.equal(f.probe.S.history.length, 3);
    assert.equal(f.sent.length, 6);
});

test('disable/re-enable, repeated initialization and cleanup preserve later wrappers without stacking', async t => {
    const f = fixture(t); const wrapper = f.rewrite('retained');
    f.options.preview.enabled = false; f.options.recorded.enabled = false;
    f.probe.updateFetchState();
    assert.equal(f.box.fetch, wrapper);
    await f.box.fetch(target, { body: body('off') });
    assert.equal(f.probe.S.history.length, 0);
    for (let i = 0; i < 3; i++) f.api.initMessagePreview();
    f.options.recorded.enabled = true; f.probe.updateFetchState(); f.probe.addEvents();
    await f.start(); await f.box.fetch(target, { body: body('on') }); await f.receive();
    assert.equal(f.probe.S.history.length, 1);
    assert.equal(f.probe.findRec(2).requestData.messages[0].content, 'retained');
    f.api.cleanup();
    assert.equal(f.box.fetch, wrapper);
    await f.box.fetch(target, { body: body('after cleanup') });
    assert.equal(JSON.parse(f.sent.at(-1).options.body).messages[0].content, 'retained');
    assert.equal(f.probe.S.history.length, 0);
    for (const listeners of f.events.listeners.values()) assert.equal(listeners.length, 0);
});

test('without other wrappers cleanup restores fetch identity; failed and switched chats do not steal records', async t => {
    const f = fixture(t); await f.start();
    await f.box.fetch(target, { body: body('unassociated') });
    await f.events.emit(types.GENERATION_ENDED, 2);
    await f.start(); await f.receive();
    assert.equal(f.probe.findRec(2), null);
    await f.events.emit(types.CHAT_CHANGED);
    assert.equal(f.probe.S.history.length, 0);
    f.api.cleanup(); assert.equal(f.box.fetch, f.native);
});

test('native failures and non-target requests retain exact arguments and outcomes', async t => {
    const error = new Error('network rejected');
    const failed = Promise.reject(error);
    const rejection = assert.rejects(failed, value => value === error);
    const f = fixture(t, () => failed);
    assert.equal(f.box.fetch(target, { body: body('failed') }), failed);
    await rejection;
    const thrown = fixture(t, () => { throw error; });
    assert.throws(() => thrown.box.fetch(target, { body: body('failed') }), value => value === error);
    const plain = fixture(t);
    const options = { method: 'POST', body: body('not generation') };
    await plain.box.fetch('/api/settings/save', options);
    assert.equal(plain.sent[0].options, options);
    assert.equal(plain.probe.S.history.length, 0);
});

test('a late body read cannot replace a retry, cross chats, or misassociate a moved message', async t => {
    const f = fixture(t); await f.start();
    let release;
    const slow = new Blob([body('slow')]); slow.text = () => new Promise(resolve => { release = resolve; });
    await f.box.fetch(target, { method: 'POST', body: slow });
    await f.box.fetch(target, { method: 'POST', body: body('latest') });
    await f.receive();
    release(body('slow')); await f.flush();
    assert.equal(f.probe.S.history.length, 1);
    assert.equal(f.probe.findRec(2).requestData.messages[0].content, 'latest');
    f.ctx.chat.splice(0, 1);
    assert.equal(f.probe.findRec(1).requestData.messages[0].content, 'latest');
    assert.equal(f.probe.findRec(2), null);
    await f.start(); await f.box.fetch(target, { method: 'POST', body: slow });
    f.ctx.chat = [{ is_user: false, mes: 'different chat' }];
    await f.events.emit(types.CHAT_CHANGED);
    release(body('late old chat')); await f.flush();
    assert.equal(f.probe.S.history.length, 0);
    assert.equal(f.probe.findRec(0), null);
});

test('an unreadable preview fails without sending; disabling continuous preview restores ordinary recording', async t => {
    const f = fixture(t); f.probe.S.isPreview = true; await f.start();
    const request = new Request('http://localhost' + target, { method: 'POST', body: body('preview') });
    const error = new Error('copy failed'); request.clone = () => { throw error; };
    const waiting = assert.rejects(f.probe.waitIntercept(), value => value === error);
    await assert.rejects(f.box.fetch(request), value => value === error);
    await waiting;
    assert.equal(f.sent.length, 0);
    f.probe.S.isPreview = false; f.probe.S.isLong = true;
    f.options.preview.enabled = false; f.probe.updateFetchState();
    await f.start(); await f.box.fetch(target, { body: body('ordinary') }); await f.receive();
    assert.equal(f.sent.length, 1);
    assert.equal(f.probe.findRec(2).requestData.messages[0].content, 'ordinary');
});

test('plain Request and byte bodies remain readable by transport; model simulation never changes the log', async t => {
    const f = fixture(t); await f.start();
    const request = new Request('http://localhost' + target, { method: 'POST', body: body('request') });
    await f.box.fetch(request); await f.receive();
    assert.equal(request.bodyUsed, false);
    assert.equal(f.probe.findRec(2).requestBody, await request.text());
    await f.start('continue');
    const bytes = new TextEncoder().encode(body('bytes'));
    await f.box.fetch(target, { body: bytes }); await f.receive(2, 'continue');
    const record = f.probe.findRec(2);
    const before = JSON.stringify(record.requestData);
    f.probe.buildPreviewHtml(record);
    assert.equal(JSON.stringify(record.requestData), before);
    assert.equal(record.requestData.messages[0].content, 'bytes');
});

test('wrappers loaded before delayed UI initialization stay inside the observation chain', async t => {
    const f = fixture(t, null, host => host.rewrite('early wrapper'));
    f.api.initMessagePreview();
    await f.start();
    await f.box.fetch(target, { method: 'POST', body: body('original') });
    f.api.initMessagePreview();
    await f.receive();
    assert.equal(f.sent.length, 1);
    assert.equal(f.probe.S.history.length, 1);
    assert.equal(f.probe.findRec(2).requestData.messages[0].content, 'early wrapper');
});

test('a wrapper loaded while both switches are off is still observed after reopening', async t => {
    const f = fixture(t);
    f.options.preview.enabled = false; f.options.recorded.enabled = false;
    f.probe.updateFetchState();
    f.api.initMessagePreview();
    const wrapper = f.rewrite('loaded while off');
    await f.box.fetch(target, { method: 'POST', body: body('disabled') });
    assert.equal(f.probe.S.history.length, 0);
    f.options.preview.enabled = true; f.options.recorded.enabled = true;
    f.api.initMessagePreview();
    await f.start(); await f.box.fetch(target, { method: 'POST', body: body('ordinary') }); await f.receive();
    assert.equal(f.probe.findRec(2)?.requestData.messages[0].content, 'loaded while off');
    assert.equal(f.box.fetch, wrapper);
    const sends = f.sent.length;
    f.probe.S.isPreview = true; await f.start();
    const captured = f.probe.waitIntercept();
    await f.box.fetch(target, { method: 'POST', body: body('preview') });
    assert.equal((await captured).data.requestData.messages[0].content, 'loaded while off');
    assert.equal(f.sent.length, sends);
});

test('master suspension retains a transparent entry for later wrappers; actual uninstall detaches it', async t => {
    const f = fixture(t);
    f.box.isXiaobaixEnabled = false;
    f.api.cleanup({ detachFetch: false });
    const wrapper = f.rewrite('loaded during master suspension');
    await f.box.fetch(target, { method: 'POST', body: body('disabled') });
    assert.equal(f.probe.S.history.length, 0);
    f.box.isXiaobaixEnabled = true; f.api.initMessagePreview();
    await f.start(); await f.box.fetch(target, { method: 'POST', body: body('enabled') }); await f.receive();
    assert.equal(f.probe.findRec(2)?.requestData.messages[0].content, 'loaded during master suspension');
    f.api.cleanup();
    assert.equal(f.box.fetch, wrapper);
    const sends = f.sent.length;
    await f.box.fetch(target, { method: 'POST', body: body('uninstalled') });
    assert.equal(f.sent.length, sends + 1);
    assert.equal(f.probe.S.history.length, 0);
    const plain = fixture(t); plain.api.cleanup();
    assert.equal(plain.box.fetch, plain.native);
});

test('background bodies never overwrite a foreground record before or after its receipt', async t => {
    const f = fixture(t); await f.start();
    await f.box.fetch(target, { method: 'POST', body: body('foreground') });
    for (const type of ['quiet', 'impersonate']) {
        await f.box.fetch(target, { method: 'POST', body: JSON.stringify({ ...JSON.parse(body(type)), type }) });
    }
    await f.receive();
    assert.equal(f.probe.findRec(2)?.requestData.messages[0].content, 'foreground');
    await f.box.fetch(target, { method: 'POST', body: body('untyped background after receipt') });
    await f.flush();
    assert.equal(f.probe.findRec(2)?.requestData.messages[0].content, 'foreground');
});

test('nested quiet starts and ends do not discard the pending foreground association', async t => {
    const f = fixture(t);
    for (const beforeRequest of [true, false]) {
        await f.start();
        if (!beforeRequest) await f.box.fetch(target, { method: 'POST', body: body('foreground') });
        await f.start('quiet');
        await f.box.fetch(target, { method: 'POST', body: JSON.stringify({ ...JSON.parse(body('background')), type: 'quiet' }) });
        await f.events.emit(types.GENERATION_ENDED, 2);
        if (beforeRequest) await f.box.fetch(target, { method: 'POST', body: body('foreground') });
        await f.events.emit(types.GENERATION_ENDED, 3);
        await f.receive();
        assert.equal(f.probe.findRec(2)?.requestData.messages[0].content, 'foreground');
    }
});

test('late classification and a fast receipt still bind only the last foreground body', async t => {
    const f = fixture(t); await f.start();
    let releaseForeground, releaseBackground;
    const slow = new Blob([]); slow.text = () => new Promise(resolve => { releaseForeground = resolve; });
    const background = new Blob([]); background.text = () => new Promise(resolve => { releaseBackground = resolve; });
    await f.box.fetch(target, { method: 'POST', body: slow });
    await f.box.fetch(target, { method: 'POST', body: background });
    await f.receive();
    releaseForeground(body('foreground'));
    releaseBackground(JSON.stringify({ ...JSON.parse(body('background')), type: 'quiet' }));
    await f.flush();
    assert.equal(f.probe.findRec(2)?.requestData.messages[0].content, 'foreground');
});
