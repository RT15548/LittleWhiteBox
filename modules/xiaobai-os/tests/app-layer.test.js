import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import { parse, compileScript } from 'vue/compiler-sfc';

// DOM integration: docking must release the neighbouring content without
// remounting the panel or losing its Back entry. Geometry is checked in a browser.
test('an app layer can dock and become modal again without replacing its content or Back ownership', async t => {
    const { window } = parseHTML('<html><body><div id="app"></div></body></html>');
    const previous = new Map();
    const environment = Object.fromEntries(['window', 'document', 'Document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'MutationObserver'].map(key => [key, key === 'window' ? window : window[key]]));
    environment.getComputedStyle = () => ({ visibility: 'visible' });
    // LinkeDOM supplies DOM, not layout; only focus eligibility needs rectangles.
    window.HTMLElement.prototype.getClientRects = () => [{}];
    for (const [key, value] of Object.entries(environment)) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value, configurable: true });
    }
    let app;
    t.after(async () => {
        app?.unmount();
        await Promise.resolve();
        await (await import('vue')).nextTick();
        for (const [key, descriptor] of previous) {
            if (descriptor) { Object.defineProperty(globalThis, key, descriptor); } else { delete globalThis[key]; }
        }
    });
    const { createApp, h, ref, nextTick, onMounted, onBeforeUnmount } = await import('vue');
    const compiled = await build({ stdin: {
        contents: "export { default as Scope } from './components/AppNavigationScope.vue'; export { useAppLayer } from './navigation/app-navigation.ts';",
        resolveDir: fileURLToPath(new URL('../shell/app-src/', import.meta.url)),
    }, bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent', plugins: [{ name: 'vue', setup(builder) {
        builder.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }));
        builder.onLoad({ filter: /\.vue$/ }, args => {
            const { descriptor } = parse(readFileSync(args.path, 'utf8'), { filename: args.path });
            return { contents: compileScript(descriptor, { id: args.path, inlineTemplate: true }).content, loader: 'ts' };
        });
    } }] });
    // eslint-disable-next-line no-unsanitized/method -- Compiled first-party components, not user input.
    const { Scope, useAppLayer } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
    const modal = ref(true), open = ref(true), dialogOpen = ref(false), scope = ref(null);
    let mounts = 0, unmounts = 0, backs = 0;
    const Panel = { setup() {
        const root = ref(null);
        useAppLayer(root, () => { backs++; open.value = false; }, () => modal.value);
        onMounted(() => mounts++); onBeforeUnmount(() => unmounts++);
        return () => h('section', { ref: root, 'data-panel': '' }, [h('input', { value: 'draft' })]);
    } };
    const Dialog = { setup() {
        const root = ref(null);
        useAppLayer(root, () => { dialogOpen.value = false; });
        return () => h('section', { ref: root, 'data-confirmation': '' }, [h('button', 'confirm')]);
    } };
    app = createApp({ setup: () => () => h(Scope, { owner: 'fixture', ref: scope }, () => [
        h('button', { 'data-background': '' }, 'action'), open.value ? h(Panel) : null,
        dialogOpen.value ? h(Dialog) : null,
    ]) });
    app.mount('#app');
    const flush = async () => { await nextTick(); await nextTick(); };
    await flush();
    const neighbour = window.document.querySelector('[data-background]');
    const input = window.document.querySelector('[data-panel] input');
    input.value = 'unsent';
    assert.equal(neighbour.inert, true);
    modal.value = false; await flush();
    assert.equal(neighbour.inert, false);
    assert.equal(window.document.querySelector('[data-panel] input'), input);
    assert.equal(input.value, 'unsent');
    modal.value = true; await flush();
    assert.equal(neighbour.inert, true);
    assert.equal(mounts, 1); assert.equal(unmounts, 0);
    assert.equal(scope.value.back(), true); await flush();
    assert.equal(backs, 1); assert.equal(unmounts, 1);
    assert.equal(neighbour.inert, false);
    assert.equal(scope.value.back(), false);

    // A responsive panel was opened first. Changing its modality must not put
    // it above a later confirmation, nor change the order consumed by Back.
    modal.value = false; open.value = true; await flush();
    const panel = window.document.querySelector('[data-panel]');
    const draft = panel.querySelector('input');
    draft.value = 'retained behind confirmation';
    dialogOpen.value = true; await flush();
    const confirmation = window.document.querySelector('[data-confirmation]');
    for (const dockedModal of [true, false, true]) {
        modal.value = dockedModal; await flush();
        assert.equal(panel.inert, true);
        assert.equal(Boolean(confirmation.inert), false);
        assert.equal(neighbour.inert, true);
        assert.equal(window.document.querySelector('[data-panel] input'), draft);
        assert.equal(draft.value, 'retained behind confirmation');
    }
    assert.equal(scope.value.back(), true); await flush();
    assert.equal(dialogOpen.value, false);
    assert.equal(open.value, true);
    assert.equal(panel.inert, false);
    assert.equal(neighbour.inert, true);
    assert.equal(scope.value.back(), true); await flush();
    assert.equal(neighbour.inert, false);
    assert.equal(scope.value.back(), false);
});
