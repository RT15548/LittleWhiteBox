import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';

// Exercise the real subscription boundary; only host events and dispatcher are fixtures.
const compiled = await build({
    stdin: { contents: `export * from '../host/sillytavern-runtime-adapters.ts'; export { host } from 'prompt-test-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'prompt-events-host', setup(builder) {
        builder.onResolve({ filter: /(?:^prompt-test-host$|\/(?:script|group-chats|event-manager|generate-interceptor)\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            const listeners = new Map();
            export let is_group_generating = false;
            export const host = { interceptors: new Map(),
                group(value) { is_group_generating = value; },
                emit(name, ...args) { for (const callback of listeners.get(name) ?? []) callback(...args); },
                get listenerCount() { return [...listeners.values()].reduce((sum, set) => sum + set.size, 0); } };
            export const event_types = Object.fromEntries(['GENERATION_STARTED','GENERATE_AFTER_DATA','GENERATION_ENDED',
                'GENERATION_STOPPED','MESSAGE_RECEIVED','STREAM_TOKEN_RECEIVED',
                'GROUP_WRAPPER_STARTED','GROUP_WRAPPER_FINISHED'].map(name => [name,name]));
            export function createModuleEvents() { const owned = []; return {
                on(name, callback) { if (!listeners.has(name)) listeners.set(name,new Set()); listeners.get(name).add(callback); owned.push([name,callback]); },
                cleanup() { for (const [name,callback] of owned) listeners.get(name).delete(callback); } }; }
            export const GENERATE_INTERCEPTOR_ORDER = {};
            export const registerGenerateInterceptor = (key, callback) => host.interceptors.set(key,callback);
            export const unregisterGenerateInterceptor = key => host.interceptors.delete(key);
            export const isStreamingEnabled = () => false;
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Fixed repository code and local host fixture, not model or user content.
const adapter = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('late startup between group members observes the native wrapper until its completion', t => {
    const { document, window } = parseHTML('<html><body></body></html>');
    const previous = new Map();
    for (const [key, value] of Object.entries({ document, MutationObserver: window.MutationObserver })) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value, configurable: true });
    }
    const runtime = adapter.createSillyTavernMainGenerationRuntime();
    t.after(() => {
        runtime.stopBackground(); adapter.host.group(false);
        for (const [key, descriptor] of previous) {
            if (descriptor) { Object.defineProperty(globalThis, key, descriptor); } else { delete globalThis[key]; }
        }
    });
    adapter.host.group(true);
    const states = [];
    runtime.subscribe(active => states.push(active));
    runtime.startBackground();
    assert.equal(runtime.isActive(), true, 'an idle member UI is not the end of the group turn');
    adapter.host.group(false);
    adapter.host.emit('GROUP_WRAPPER_FINISHED', { type: 'normal' });
    assert.equal(runtime.isActive(), false);
    assert.deepEqual(states, [true, false]);
});

test('token-count dry runs cannot clear a real request injection; real completion and disposal still clear ownership', () => {
    const { host } = adapter;
    for (const subscribe of [adapter.subscribeShopPromptEvents, adapter.subscribeMapPromptEvents,
        adapter.subscribeTaskPromptEvents, adapter.subscribeWorldPromptEvents]) {
        let content = '';
        const clear = () => { content = ''; };
        const dispose = subscribe({ generationStarted: clear, requestBuilt: clear, generationEnded: clear,
            generationStopped: clear, messageReceived() {}, intercept: () => { content = 'context'; } });
        host.emit('GENERATION_STARTED', 'continue', {}, false);
        [...host.interceptors.values()][0]([], 0, () => {}, 'continue');
        host.emit('GENERATION_STARTED', 'quiet', {}, true);
        host.emit('GENERATE_AFTER_DATA', {}, true);
        assert.equal(content, 'context');
        host.emit('GENERATE_AFTER_DATA', {}, false);
        assert.equal(content, '');
        dispose();
        assert.equal(host.listenerCount, 0);
        assert.equal(host.interceptors.size, 0);
    }
});
