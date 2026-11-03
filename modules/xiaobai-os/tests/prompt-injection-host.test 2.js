import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createPromptInjectionRegistry } from '../capabilities/prompt-injection/registry.ts';
import { PROMPT_INJECTION_POLICY } from '../host/prompt-injection-policy.ts';
import { DICE_CHECK_PROMPTS } from '../apps/dice/prompt-registration.ts';

// Exercise production subscriptions and native extension writes; substitute only
// the external ST event bus, prompt manager and current-chat surface.
const compiled = await build({
    stdin: { contents: `export { createSillyTavernPromptInjectionHost } from '../host/sillytavern-prompt-injection.ts';
        export { host } from 'injection-host';`, resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'injection-native-boundary', setup(builder) {
        builder.onResolve({ filter: /(?:^injection-host$|\/(?:script|openai|PromptManager|event-manager|generate-interceptor|sillytavern-context)\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            const listeners = new Map(), observers = new Set();
            export let main_api = 'openai';
            export const extension_prompts = {};
            export const extension_prompt_types = { IN_CHAT: 1 };
            export const extension_prompt_roles = { SYSTEM: 0, USER: 1, ASSISTANT: 2 };
            export const INJECTION_POSITION = { ABSOLUTE: 1 };
            export const setExtensionPrompt = (id, value, position, depth, scan, role) => {
                extension_prompts[id] = { value, position, depth, scan, role };
            };
            export const getSillyTavernChatIdentity = () => ({ key: 'chat-a' });
            export const promptManager = {
                activeCharacter: { id: 'a' }, serviceSettings: { prompts: [], prompt_order: [] },
                getPromptCollection() { return { collection: [], add(entry) { this.collection.push(entry); } }; },
                preparePrompt: entry => ({ ...entry }),
            };
            export const event_types = new Proxy({}, { get: (_, name) => name });
            export function createModuleEvents() {
                const owned = [];
                return { on(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); owned.push([name, fn]); },
                    cleanup() { for (const [name, fn] of owned) listeners.get(name).delete(fn); } };
            }
            export function observeGenerateInterceptors(fn) { observers.add(fn); return () => observers.delete(fn); }
            export const host = {
                prompts: extension_prompts, manager: promptManager,
                api(value) { main_api = value; },
                emit(name, ...args) { for (const fn of listeners.get(name) ?? []) fn(...args); },
                dispatch(phase, type, run) { for (const fn of observers) fn({ phase, type, run }); },
                get subscribers() { return observers.size + [...listeners.values()].reduce((n, set) => n + set.size, 0); },
            };
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Bundled repository code and fixed native I/O fixture only.
const { createSillyTavernPromptInjectionHost, host } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

for (const api of ['openai', 'textgenerationwebui']) {
    test(`${api}: production events preserve previews and clear only owned injection on stop, switch and disposal`, () => {
        host.api(api);
        const original = host.manager.getPromptCollection;
        const adapter = createSillyTavernPromptInjectionHost();
        const registry = createPromptInjectionRegistry(PROMPT_INJECTION_POLICY, adapter.publish);
        const prompts = registry.register(DICE_CHECK_PROMPTS);
        const foreign = { value: 'other extension' };
        host.prompts.foreign = foreign;
        adapter.start(registry);
        const collect = () => host.manager.getPromptCollection('normal').collection;
        const populate = () => {
            host.emit('GENERATION_STARTED', 'normal', {}, false);
            const controller = new AbortController(), run = { signal: controller.signal };
            host.dispatch('dispatch-start', 'normal', run);
            prompts.set('rules', 'rules'); prompts.set('result', 'result');
            host.dispatch('dispatch-end', 'normal', run);
            return controller;
        };
        try {
            populate();
            host.emit('GENERATION_STARTED', 'quiet', {}, true);
            host.emit('GENERATE_AFTER_DATA', {}, true);
            assert.equal(registry.snapshot().length, 2);
            if (api === 'openai') {
                assert.deepEqual(collect().map(entry => [entry.injection_depth, entry.injection_order, entry.role]), [[1, 999, 'user'], [0, 999, 'user']]);
                assert.deepEqual(Object.keys(host.prompts), ['foreign']);
            } else {
                assert.deepEqual(Object.values(host.prompts).filter(entry => entry !== foreign), [
                    { value: 'rules', position: 1, depth: 1, scan: false, role: 1 },
                    { value: 'result', position: 1, depth: 0, scan: false, role: 1 },
                ]);
                assert.equal(collect().length, 0);
            }
            for (const event of ['GENERATE_AFTER_DATA', 'GENERATION_STOPPED', 'GENERATION_ENDED', 'CHAT_CHANGED']) {
                populate();
                host.emit(event, {}, false);
                assert.equal(registry.snapshot().length, 0);
                assert.equal(collect().length, 0);
                assert.deepEqual(Object.keys(host.prompts), ['foreign']);
            }
            populate().abort();
            assert.equal(registry.snapshot().length, 0, 'interceptor cancellation clears without a later host event');
            populate();
        } finally { registry.dispose(); adapter.stop(); }
        assert.equal(host.manager.getPromptCollection, original);
        assert.equal(host.subscribers, 0);
        assert.deepEqual(host.prompts, { foreign });
        delete host.prompts.foreign;
    });
}
