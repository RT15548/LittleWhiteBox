import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { parse, compileScript } from 'vue/compiler-sfc';
import { build } from 'esbuild';

// Mount the actual SFC. Only the bridge is replaced, returning the host's public {ok,result} envelope.
test('Dice switch survives repeated confirmed replies, keeps newer file-state pushes and unsubscribes on exit', async t => {
    const dom = parseHTML('<html><body><div id="app"></div></body></html>');
    const previous = new Map();
    for (const key of ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement']) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
    }
    t.after(() => { for (const [key, descriptor] of previous) {
        if (descriptor) { Object.defineProperty(globalThis, key, descriptor); } else { delete globalThis[key]; }
    } });
    const { createApp, nextTick } = await import('vue');
    const path = new URL('../apps/dice/ui/DiceApp.vue', import.meta.url);
    const { descriptor } = parse(readFileSync(path, 'utf8'), { filename: fileURLToPath(path) });
    const script = compileScript(descriptor, { id: 'dice-test', inlineTemplate: true });
    const compiled = await build({ stdin: { contents: script.content, loader: 'ts', resolveDir: fileURLToPath(new URL('.', path)) },
        bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
        plugins: [{ name: 'shared-vue-runtime', setup(builder) {
            builder.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }));
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compiled repository Vue component, not user content.
    const { default: DiceApp } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
    let state = { chatIdentity: 'chat-a', actionChecksEnabled: false, encountersEnabled: false, fileState: 'ready', pending: false };
    const listeners = new Set();
    let calls = 0;
    let release;
    const bridge = {
        subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
        async request(type, payload) {
            assert.equal(type, 'dice/set-feature');
            assert.equal(payload.chatIdentity, 'chat-a');
            calls++;
            state = { ...state, [payload.feature]: payload.enabled };
            if (calls === 3) { await new Promise(resolve => { release = resolve; }); }
            return { ok: true, result: state };
        },
    };
    const app = createApp(DiceApp, { bridge, initialState: state });
    app.mount(dom.document.getElementById('app'));
    t.after(() => app.unmount());
    const button = dom.document.querySelector('[role="switch"]');
    for (const expected of ['true', 'false']) {
        button.click();
        await Promise.resolve(); await nextTick();
        assert.equal(button.getAttribute('aria-checked'), expected);
        assert.equal(button.disabled, false);
    }
    button.click();
    for (const listener of listeners) { listener({ type: 'dice/state', payload: { state: { ...state, fileState: 'saving' } } }); }
    release();
    await Promise.resolve(); await Promise.resolve(); await nextTick();
    assert.equal(button.disabled, true, 'late request reply cannot replace the newer saving projection');
    for (const listener of listeners) { listener({ type: 'dice/state', payload: { state } }); }
    await nextTick();
    assert.equal(button.disabled, false);
    const encounterButton = dom.document.querySelector('[aria-labelledby="dice-encounter-label"] button') || dom.document.querySelector('button[aria-labelledby="dice-encounter-label"]');
    encounterButton.click();
    await Promise.resolve(); await nextTick();
    assert.equal(encounterButton.getAttribute('aria-checked'), 'true');
    assert.equal(button.getAttribute('aria-checked'), 'true', 'enabling encounters leaves action checks unchanged');
    app.unmount();
    assert.equal(listeners.size, 0);
});
