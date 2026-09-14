import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Exercise the real subscription boundary; only host events, dispatcher and prompt sink are fixtures.
const compiled = await build({
    stdin: { contents: `export * from '../host/sillytavern-runtime-adapters.ts'; export { host } from 'prompt-test-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'prompt-events-host', setup(builder) {
        builder.onResolve({ filter: /(?:^prompt-test-host$|\/(?:script|event-manager|generate-interceptor)\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            const listeners = new Map();
            export const host = { interceptors: new Map(), prompts: new Map(),
                emit(name, ...args) { for (const callback of listeners.get(name) ?? []) callback(...args); },
                get listenerCount() { return [...listeners.values()].reduce((sum, set) => sum + set.size, 0); } };
            export const event_types = Object.fromEntries(['GENERATION_STARTED','GENERATE_AFTER_DATA','GENERATION_ENDED',
                'GENERATION_STOPPED','MESSAGE_RECEIVED'].map(name => [name,name]));
            export function createModuleEvents() { const owned = []; return {
                on(name, callback) { if (!listeners.has(name)) listeners.set(name,new Set()); listeners.get(name).add(callback); owned.push([name,callback]); },
                cleanup() { for (const [name,callback] of owned) listeners.get(name).delete(callback); } }; }
            export const GENERATE_INTERCEPTOR_ORDER = {};
            export const registerGenerateInterceptor = (key, callback) => host.interceptors.set(key,callback);
            export const unregisterGenerateInterceptor = key => host.interceptors.delete(key);
            export const extension_prompt_roles = { SYSTEM: 0 };
            export const extension_prompt_types = { IN_CHAT: 1 };
            export const setExtensionPrompt = (key, value, ...options) => host.prompts.set(key,{value,options});
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Fixed repository code and local host fixture, not model or user content.
const adapter = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

test('token-count dry runs cannot clear a real request injection; real completion and disposal still clear ownership', () => {
    const { host } = adapter;
    for (const subscribe of [adapter.subscribeShopPromptEvents, adapter.subscribeMapPromptEvents,
        adapter.subscribeTaskPromptEvents, adapter.subscribeWorldPromptEvents]) {
        const clear = () => adapter.setSillyTavernPrompt('fixture', '');
        const dispose = subscribe({ generationStarted: clear, requestBuilt: clear, generationEnded: clear,
            generationStopped: clear, messageReceived() {}, intercept: () => adapter.setSillyTavernPrompt('fixture', 'context') });
        host.emit('GENERATION_STARTED', 'continue', {}, false);
        [...host.interceptors.values()][0]([], 0, () => {}, 'continue');
        host.emit('GENERATION_STARTED', 'quiet', {}, true);
        host.emit('GENERATE_AFTER_DATA', {}, true);
        assert.deepEqual(host.prompts.get('fixture'), { value: 'context', options: [1, 1, false, 0] });
        host.emit('GENERATE_AFTER_DATA', {}, false);
        assert.equal(host.prompts.get('fixture').value, '');
        dispose();
        assert.equal(host.listenerCount, 0);
        assert.equal(host.interceptors.size, 0);
    }
});
