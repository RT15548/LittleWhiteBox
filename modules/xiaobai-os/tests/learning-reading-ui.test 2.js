import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { parse, compileScript } from 'vue/compiler-sfc';
import { build } from 'esbuild';
import { createClassroomFixture, fixtureLesson } from './fixtures/learning-classroom.js';

test('real reading forms retain failed answers and retire confirmed extras', async t => {
    t.mock.method(console, 'error', () => {});
    const dom = parseHTML('<html><body><div id="app"></div></body></html>');
    const previous = new Map();
    for (const key of ['window', 'document', 'Document', 'Node', 'Element', 'HTMLElement', 'SVGElement']) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
    }
    // linkedom lacks textarea selection; match only this browser API for editor remounts.
    dom.window.HTMLTextAreaElement.prototype.setSelectionRange = function(start, end, direction) {
        this.selectionStart = start; this.selectionEnd = end; this.selectionDirection = direction;
    };
    t.after(() => { for (const [key, descriptor] of previous) {
        if (descriptor) { Object.defineProperty(globalThis, key, descriptor); } else { delete globalThis[key]; }
    } });
    const { createApp, h: element, shallowRef, nextTick } = await import('vue');
    const compiled = await build({ stdin: { resolveDir: fileURLToPath(new URL('../', import.meta.url)), contents:
        "export { default as Reading } from './apps/learning/ui/LearningReading.vue'; export { provideLearningUiSession, hasLearningUnsavedInput } from './apps/learning/ui/learning-session.ts';" },
        bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent', plugins: [{ name: 'vue-components', setup(builder) {
            builder.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }));
            builder.onLoad({ filter: /\.vue$/ }, args => {
                const { descriptor } = parse(readFileSync(args.path, 'utf8'), { filename: args.path });
                return { contents: compileScript(descriptor, { id: args.path, inlineTemplate: true }).content, loader: 'ts' };
            });
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compiled repository components, not external content.
    const { Reading, provideLearningUiSession, hasLearningUnsavedInput } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
    const h = await createClassroomFixture({ lesson: { ...fixtureLesson, kind: 'reading-writing' } }); t.after(h.dispose);
    await h.openLesson(); if (h.state().sourceChoice) { await h.command('choose-original'); }
    const call = (name, args) => ({ id: name, name, arguments: JSON.stringify(args) });
    h.flags.teacherResponse = (_request, round) => round === 1 ? { toolCalls: [call('LearningLessonEdit', { exercises: fixtureLesson.exercises.map(exercise => ({ ...exercise, materialKeys: [] })) })] } : { text: 'Added.' };
    await h.command('talk', { target: 'workbench', message: 'Add a question.' });
    h.flags.teacherResponse = () => ({ text: 'Saved.' });
    const state = shallowRef(h.state()); const actions = []; const errors = [];
    const off = h.bridge.subscribe(event => { if (event.type === 'learning/state') { state.value = event.payload.state; } }); t.after(off);
    let session;
    const app = createApp({ setup() {
        session = provideLearningUiSession(state);
        return () => element(Reading, { state: state.value, unit: state.value.unit, disabled: state.value.busy, pending: false,
            onAction: (name, input) => { actions.push(h.command(name, input)); } });
    } });
    app.config.errorHandler = error => errors.push(error.message);
    app.mount(dom.document.getElementById('app')); t.after(() => app.unmount());
    const dirty = () => hasLearningUnsavedInput(session, state.value);
    const radio = () => dom.document.querySelector('input[type="radio"]');
    radio().dispatchEvent(new dom.window.Event('change', { bubbles: true })); await nextTick();
    assert.equal(dirty(), true);
    const submit = async selector => {
        dom.document.querySelector(selector).dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
        await actions.at(-1); await nextTick();
    };
    h.flags.userRejected = true;
    await submit('.learning-answer');
    assert.equal(dirty(), true);
    h.flags.userRejected = false;
    await submit('.learning-answer');
    assert.equal(dirty(), false);
    radio().dispatchEvent(new dom.window.Event('change', { bubbles: true })); await nextTick();
    assert.equal(dirty(), true);
    await submit('.learning-answer'); assert.equal(dirty(), false);

    assert.deepEqual(errors, []);
});
