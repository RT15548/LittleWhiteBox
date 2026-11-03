import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { parse, compileScript } from 'vue/compiler-sfc';
import { build } from 'esbuild';
import { learningClassView } from '../apps/learning/application/projection.js';
import { defaultLearningProfile } from '../domains/learning/profile.js';

test('finishing a review retains readable answers and feedback, and questions keep their identity when asking the companion', async t => {
    const dom = parseHTML('<html><body><div id="app"></div></body></html>');
    const previous = new Map();
    for (const key of ['window', 'document', 'Document', 'Node', 'Element', 'HTMLElement', 'SVGElement']) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
    }
    t.after(() => { for (const [key, descriptor] of previous) {
        if (descriptor) { Object.defineProperty(globalThis, key, descriptor); } else { delete globalThis[key]; }
    } });
    const { createApp, h, shallowRef, nextTick } = await import('vue');
    // Compile the real component and its session together, retaining one injection key.
    const compiled = await build({ stdin: { resolveDir: fileURLToPath(new URL('../', import.meta.url)), contents:
        "export { default as Review } from './apps/learning/ui/LearningReview.vue'; export { provideLearningUiSession } from './apps/learning/ui/learning-session.ts';" },
        bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent', plugins: [{ name: 'vue-components', setup(builder) {
            builder.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }));
            builder.onLoad({ filter: /\.vue$/ }, args => {
                const { descriptor } = parse(readFileSync(args.path, 'utf8'), { filename: args.path });
                return { contents: compileScript(descriptor, { id: args.path, inlineTemplate: true }).content, loader: 'ts' };
            });
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compiled repository components, not external content.
    const { Review, provideLearningUiSession } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
    const scope = { kind: 'public' };
    const review = { id: 'review-1', kind: 'review', title: 'Recall', goal: '', scope, originOsId: 'story', reward: { tier: 'short', amount: 20 },
        materials: [], exercises: ['q1', 'q2'].map(id => ({ id, prompt: `Question ${id}`, skill: 'grammar', materialIds: [],
            response: { kind: 'text' }, rule: { kind: 'semantic' }, hint: '' })),
        attempts: [], assessments: [], revealed: { answers: [], hints: [] } };
    const data = { profiles: [{ ...defaultLearningProfile('en'), unit: null, review, items: [], completions: [] }] };
    const view = () => ({ ...learningClassView(data, 'en', 'story'), language: 'en', chatIdentity: 'story', storage: 'ready', chatStorage: 'ready', walletStorage: 'ready',
        busy: false, chatBusy: false, preparation: null, conversation: { turns: [], removedTurns: 0 } });
    const state = shallowRef(view());
    const questions = [];
    const app = createApp({ setup() {
        provideLearningUiSession(state);
        return () => h(Review, { state: state.value, review: state.value.review, disabled: false, pending: false,
            onAsk: (exerciseId, unitId) => questions.push({ exerciseId, unitId }) });
    } });
    app.mount(dom.document.getElementById('app')); t.after(() => app.unmount());
    for (const exercise of review.exercises) {
        review.attempts.push({ id: `answer-${exercise.id}`, exerciseId: exercise.id, answer: { kind: 'text', text: `My answer ${exercise.id}` }, scope });
        review.assessments.push({ attemptId: `answer-${exercise.id}`, verdict: 'incorrect', understanding: '', expression: '', guidance: `Explanation ${exercise.id}`, scope });
    }
    state.value = view(); await nextTick();
    assert.equal(state.value.review.stage.stage, 'complete');
    const content = () => dom.document.getElementById('app').textContent;
    assert.ok(content().includes('My answer q1'));
    assert.ok(content().includes('Explanation q1'));
    dom.document.querySelectorAll('nav button')[1].click(); await nextTick();
    assert.ok(content().includes('My answer q2'));
    assert.ok(content().includes('Explanation q2'));
    dom.document.querySelector('[data-action="ask"]').click();
    assert.deepEqual(questions, [{ unitId: 'review-1', exerciseId: 'q2' }]);
});
