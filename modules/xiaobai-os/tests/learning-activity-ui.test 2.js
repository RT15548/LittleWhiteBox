import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { parse, compileScript } from 'vue/compiler-sfc';
import { build } from 'esbuild';
import { createClassroomFixture } from './fixtures/learning-classroom.js';

test('lesson sheets leave companion navigation available and retain the study scene across pane retirement', async t => {
    const dom = parseHTML('<html><body><div id="app"></div></body></html>');
    const previous = new Map();
    let unmount = async () => {};
    for (const key of ['window', 'document', 'Document', 'Node', 'Element', 'HTMLElement', 'SVGElement']) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
    }
    t.after(async () => { await unmount(); for (const [key, descriptor] of previous) {
        if (descriptor) { Object.defineProperty(globalThis, key, descriptor); } else { delete globalThis[key]; }
    } });
    const { createApp, h: element, provide, ref, shallowRef, nextTick } = await import('vue');
    const compiled = await build({ stdin: { resolveDir: fileURLToPath(new URL('../', import.meta.url)), contents: `
        export { default as Activity } from './apps/learning/ui/LearningActivity.vue';
        export { provideLearningUiSession } from './apps/learning/ui/learning-session.ts';
        export { appNavigationKey, topModalLayer } from './shell/app-src/navigation/app-navigation.ts';
        export { createBackStack } from './shell/app-src/navigation/back-stack.ts';` },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent', plugins: [{ name: 'vue-components', setup(builder) {
        builder.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }));
        builder.onLoad({ filter: /\.vue$/ }, args => {
            const { descriptor } = parse(readFileSync(args.path, 'utf8'), { filename: args.path });
            return { contents: compileScript(descriptor, { id: args.path, inlineTemplate: true }).content, loader: 'ts' };
        });
    } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compile actual repository components, not external input.
    const { Activity, provideLearningUiSession, appNavigationKey, topModalLayer, createBackStack } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
    const classroom = await createClassroomFixture(); t.after(classroom.dispose);
    await classroom.openLesson();
    const state = shallowRef(classroom.state());
    const exercise = state.value.unit.exercises[0];
    const target = { unitId: state.value.unit.id, kind: 'exercise', id: exercise.id, title: exercise.prompt };
    const active = ref(true); const mounted = ref(true); const errors = []; let closed = 0;
    const navigation = { root: ref(null), layers: shallowRef([]), stack: createBackStack() };
    const app = createApp({ setup() {
        provideLearningUiSession(state); provide(appNavigationKey, navigation);
        return () => mounted.value ? element(Activity, { state: state.value, target, active: active.value, disabled: false,
            onClose: () => { closed++; mounted.value = false; } }) : null;
    } });
    app.config.errorHandler = error => errors.push(error);
    app.mount(dom.document.getElementById('app'));
    unmount = async () => { app.unmount(); await nextTick(); await nextTick(); };
    await nextTick();
    assert.equal(topModalLayer(navigation), undefined, 'a lesson must not make its companion inert');
    const radio = () => dom.document.querySelector('input[type="radio"]');
    radio().dispatchEvent(new dom.window.Event('change', { bubbles: true }));
    const materials = dom.document.querySelector('details');
    materials.open = true; materials.dispatchEvent(new dom.window.Event('toggle'));
    dom.document.querySelector('.learning-activity-body').scrollTop = 137;
    await nextTick();

    active.value = false; await nextTick();
    assert.equal(navigation.stack.back(), false, 'the outgoing pane must stop consuming Back before its animation ends');
    assert.equal(closed, 0);
    mounted.value = false; await nextTick();
    active.value = true; mounted.value = true; await nextTick();
    assert.equal(radio().hasAttribute('checked'), true);
    assert.equal(dom.document.querySelector('details').hasAttribute('open'), true);
    assert.equal(dom.document.querySelector('.learning-activity-body').scrollTop, 137);
    assert.equal(topModalLayer(navigation), undefined);
    assert.equal(navigation.stack.back(), true);
    await nextTick();
    assert.equal(closed, 1);
    assert.equal(navigation.stack.back(), false);
    assert.deepEqual(errors, []);
});
