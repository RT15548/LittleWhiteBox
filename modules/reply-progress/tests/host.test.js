import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';

async function loadHost() {
    const compiled = await build({
        stdin: {
            contents: `export { createReplyProgressHostRuntime } from '../host.js';
                export { registerGenerateInterceptor, unregisterGenerateInterceptor } from '../../../shared/common/generate-interceptor.js';
                export { host } from 'reply-progress-native-host';`,
            resolveDir: fileURLToPath(new URL('.', import.meta.url)),
        },
        bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
        plugins: [{ name: 'reply-progress-host-boundary', setup(builder) {
            builder.onResolve({ filter: /(?:^reply-progress-native-host$|\/(?:script|group-chats|extensions|events)\.js$)/ },
                () => ({ path: 'native', namespace: 'fixture' }));
            builder.onLoad({ filter: /^native$/, namespace: 'fixture' }, () => ({ contents: `
                // Public read-only surface shared by ST 1.14 and 1.18.
                // Control APIs are deliberately unavailable to this observer.
                export let online_status = 'connected';
                export let streamingProcessor = null;
                export let is_send_press = false;
                const listeners = new Map();
                export const event_types = Object.fromEntries([
                    'GENERATION_STARTED', 'GENERATION_AFTER_COMMANDS', 'MESSAGE_SENT', 'USER_MESSAGE_RENDERED',
                    'STREAM_TOKEN_RECEIVED', 'MESSAGE_RECEIVED', 'GENERATION_STOPPED', 'GENERATION_ENDED',
                    'CHAT_CHANGED', 'GROUP_WRAPPER_STARTED', 'GROUP_WRAPPER_FINISHED', 'CHAT_COMPLETION_SETTINGS_READY',
                ].map(name => [name, name]));
                export const eventSource = {
                    makeFirst(event, fn) { listeners.set(event, [fn, ...(listeners.get(event) || [])]); },
                    on(event, fn) { listeners.set(event, [...(listeners.get(event) || []), fn]); },
                    removeListener(event, fn) { listeners.set(event, (listeners.get(event) || []).filter(other => other !== fn)); },
                    async emit(event, ...args) { for (const fn of [...(listeners.get(event) || [])]) await fn(...args); },
                };
                const context = { chat: [], groupId: null, mainApi: 'openai' };
                export const getContext = () => context;
                export const host = { context, events: eventSource,
                    stream(value) { streamingProcessor = value; },
                    get listenerCount() { return [...listeners.values()].reduce((n, list) => n + list.length, 0); },
                };
            ` }));
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compiled repository code and fixed host fixture only.
    return import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
}

test('enabled and disabled tracking leave host state, requests, results and other listener order identical', async t => {
    const { createReplyProgressHostRuntime, registerGenerateInterceptor, unregisterGenerateInterceptor, host } = await loadHost();
    const { document, Event } = parseHTML('<html><head></head><body><textarea id="send_textarea" placeholder="original"></textarea><button id="mes_stop"><span></span></button></body></html>');
    const previousDocument = globalThis.document;
    const previousFetch = globalThis.fetch;
    const requests = [];
    const response = Object.freeze({ ok: true });
    const nativeFetch = (url, options) => { requests.push({ url, options }); return Promise.resolve(response); };
    globalThis.document = document;
    globalThis.fetch = nativeFetch;
    const textarea = document.querySelector('textarea');
    textarea.value = 'draft';
    textarea.readOnly = false;
    textarea.disabled = false;
    const runtime = createReplyProgressHostRuntime();
    registerGenerateInterceptor('test-foreground', async () => {});
    t.after(() => {
        runtime.destroy();
        unregisterGenerateInterceptor('test-foreground');
        globalThis.fetch = previousFetch;
        if (previousDocument === undefined) delete globalThis.document;
        else globalThis.document = previousDocument;
    });
    const order = [];
    const checkpoints = [];
    const snapshot = () => ({
        generating: document.body.dataset.generating, value: textarea.value,
        readOnly: textarea.readOnly, disabled: textarea.disabled,
    });
    host.events.on('GENERATION_AFTER_COMMANDS', () => { order.push(1); checkpoints.push(snapshot()); });
    host.events.on('GENERATION_AFTER_COMMANDS', () => { order.push(2); checkpoints.push(snapshot()); });
    const existingListeners = host.listenerCount;
    const outcomes = [];
    for (const enabled of [false, true]) {
        runtime.setEnabled(enabled);
        host.context.chat.length = 0;
        order.length = checkpoints.length = 0;
        requests.length = 0;
        const signal = new AbortController().signal;
        const params = Object.freeze({ signal });
        await host.events.emit('GENERATION_STARTED', 'normal', params, false);
        await host.events.emit('GENERATION_AFTER_COMMANDS', 'normal', params, false);
        if (enabled) assert.notEqual(textarea.placeholder, 'original');
        assert.equal(document.body.dataset.generating, undefined);
        // Only the host changes its real busy state.
        document.body.dataset.generating = 'true';
        await globalThis.xiaobaixGenerateInterceptor([], 0, () => assert.fail('observer aborted host'), 'normal');
        const data = Object.freeze({ type: 'normal', stream: false, messages: Object.freeze([]) });
        await host.events.emit('CHAT_COMPLETION_SETTINGS_READY', data);
        assert.equal(globalThis.fetch, nativeFetch);
        const options = Object.freeze({ method: 'POST', body: JSON.stringify(data), signal });
        const result = await globalThis.fetch('/api/backends/chat-completions/generate', options);
        assert.equal(result, response);
        assert.equal(requests[0].options, options);
        host.context.chat.push({ is_user: false, mes: 'answer' });
        await host.events.emit('MESSAGE_RECEIVED', 0, 'normal');
        assert.equal(textarea.placeholder, 'original');
        // Other background work still owns the busy state after our reply.
        assert.equal(document.body.dataset.generating, 'true');
        await host.events.emit('GENERATION_STARTED', 'normal', params, false);
        await host.events.emit('GENERATION_AFTER_COMMANDS', 'normal', params, false);
        if (enabled) assert.notEqual(textarea.placeholder, 'original');
        const click = new Event('click', { bubbles: true, cancelable: true });
        let reachedHost = false;
        const nativeStop = () => { reachedHost = true; };
        document.querySelector('#mes_stop').addEventListener('click', nativeStop);
        document.querySelector('#mes_stop span').dispatchEvent(click);
        document.querySelector('#mes_stop').removeEventListener('click', nativeStop);
        assert.equal(reachedHost, true);
        assert.equal(click.defaultPrevented, false);
        assert.equal(signal.aborted, false);
        assert.equal(textarea.placeholder, 'original');
        outcomes.push({ checkpoints: [...checkpoints], order: [...order], state: snapshot(),
            requests: requests.map(({ url, options: init }) => ({ url, method: init.method, body: init.body })) });
        delete document.body.dataset.generating;
        runtime.setEnabled(false);
        assert.equal(host.listenerCount, existingListeners);
    }
    assert.deepEqual(outcomes[1], outcomes[0]);
});
