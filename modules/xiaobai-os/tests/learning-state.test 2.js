import assert from 'node:assert/strict';
import test from 'node:test';
import { createRenderer, reactive } from 'vue';
import { useLearningState } from '../apps/learning/ui/use-learning-state.js';
import { createLearningUiSession } from '../apps/learning/ui/learning-session.js';
import { FrameRequestError, HostRequestError } from '../shell/app-src/frame-bridge.js';
import { createClassroomFixture } from './fixtures/learning-classroom.js';

function mountState(t, initialState, bridge) {
    let ui;
    const renderer = createRenderer({
        createComment: () => ({}), insert() {}, remove() {}, parentNode: () => null, nextSibling: () => null,
    });
    const app = renderer.createApp({ setup() {
        ui = useLearningState({ initialState, bridge });
        return () => null;
    } });
    app.mount({});
    t.after(() => app.unmount());
    return ui;
}

test('each language selection reaches the mounted UI on its first request, without calling a model', async t => {
    const classroom = await createClassroomFixture();
    t.after(classroom.dispose);
    const ui = mountState(t, classroom.state(), classroom.bridge);
    const calls = classroom.counts.provider;
    for (const language of ['ja', 'de', 'fr', 'en', 'ja']) {
        await ui.request('language', { language });
        assert.equal(ui.state.value.language, language);
        assert.equal(ui.pending.value, false);
    }
    assert.equal(classroom.counts.provider, calls);
});

test('learning requests snapshot nested reactive quotes, settings and answer collections at the wire boundary', async t => {
    const initial = { chatIdentity: 'a', storage: 'ready', chatStorage: 'ready' };
    const delivered = [];
    const ui = mountState(t, initial, {
        subscribe: () => () => {},
        request: async (type, payload) => {
            delivered.push({ type, payload: structuredClone(payload) });
            return { result: { state: initial } };
        },
    });
    const session = createLearningUiSession();
    const selection = { materialId: 'm1', paragraphId: 'p1', start: 2, end: 6, quote: '树 🌳' };
    session.unit('lesson').selection = selection;
    session.chat.focus = { exerciseId: 'q1', selection: session.unit('lesson').selection };
    // Same shallow spread as the quote composer. Its nested selection is still a Proxy.
    await ui.request('talk', { message: '为什么？', ...session.chat.focus });
    await ui.request('say', { selection: session.unit('lesson').selection });
    const value = reactive({ exam: null, level: 'B1', targetLevel: 'B2', explanationLanguage: 'zh-CN', interests: null });
    await ui.request('settings', { value });
    const ids = reactive(['a', 'b']);
    await ui.request('submit', { unitId: 'lesson', exerciseId: 'q1', answer: { kind: 'choice', ids } });
    const values = reactive([{ id: 'blank', text: 'goes' }]);
    await ui.request('submit', { unitId: 'lesson', exerciseId: 'q2', answer: { kind: 'gaps', values } });
    const revisions = reactive([{ attemptId: 'a1', text: 'Revised.' }]);
    await ui.request('submit-revision', { unitId: 'lesson', revisions });
    assert.equal(ui.localIssue.value, null);
    assert.deepEqual(delivered, [
        { type: 'learning/talk', payload: { chatIdentity: 'a', message: '为什么？', exerciseId: 'q1', selection } },
        { type: 'learning/say', payload: { chatIdentity: 'a', selection } },
        { type: 'learning/settings', payload: { chatIdentity: 'a', value: { ...value } } },
        { type: 'learning/submit', payload: { chatIdentity: 'a', unitId: 'lesson', exerciseId: 'q1', answer: { kind: 'choice', ids: ['a', 'b'] } } },
        { type: 'learning/submit', payload: { chatIdentity: 'a', unitId: 'lesson', exerciseId: 'q2', answer: { kind: 'gaps', values: [{ id: 'blank', text: 'goes' }] } } },
        { type: 'learning/submit-revision', payload: { chatIdentity: 'a', unitId: 'lesson', revisions: [{ attemptId: 'a1', text: 'Revised.' }] } },
    ]);
    session.chat.focus.selection.quote = 'changed'; ids.push('c'); values[0].text = 'went'; revisions[0].text = 'Later edit.';
    assert.equal(delivered[0].payload.selection.quote, '树 🌳');
    assert.deepEqual(delivered[3].payload.answer.ids, ['a', 'b']);
    assert.equal(delivered[4].payload.answer.values[0].text, 'goes');
    assert.equal(delivered[5].payload.revisions[0].text, 'Revised.');
});

for (const [error, issue, needsRefresh] of [
    [new FrameRequestError('host_request_not_sent'), 'notSent', false],
    [new FrameRequestError('host_request_timeout'), 'unknown', true],
    [new HostRequestError({ error: 'app_request_failed' }), 'rejected', true],
]) {
    test(`request failure ${issue} offers the matching recovery without auto-resending`, async t => {
        const initial = { chatIdentity: 'a', storage: 'ready', chatStorage: 'ready' };
        let publish;
        let calls = 0;
        const ui = mountState(t, initial, {
            subscribe: listener => { publish = listener; return () => {}; },
            request: async () => { calls++; throw error; },
        });
        await ui.request('talk', { message: 'Why?' });
        assert.equal(ui.localIssue.value, issue);
        assert.equal(ui.needsRefresh.value, needsRefresh);
        assert.equal(ui.pending.value, false);
        assert.equal(ui.canChat.value, true);
        publish({ type: 'learning/state', payload: { state: { ...initial, busy: true } } });
        assert.equal(ui.localIssue.value, issue); // Background preparation must not erase a failed-send notice.
        assert.equal(calls, 1);
    });
}

test('context controls and Host dispatch agree while a conversation is running', async t => {
    let release;
    const h = await createClassroomFixture(); t.after(async () => { release?.(); await h.dispose(); });
    await h.command('teacher', { teacher: { name: '林老师', note: '' } });
    const ui = mountState(t, h.state(), h.bridge);
    h.flags.providerGate = new Promise(resolve => { release = resolve; });
    await ui.request('talk', { target: 'companion', message: 'Explain this slowly.' });
    assert.equal(ui.state.value.chatBusy, true);
    for (const [action, extra] of [['language', { language: 'ja' }], ['teacher', { teacher: { name: 'A new companion', note: '' } }], ['forget-conversation', {}]]) {
        assert.equal(ui.canRequest(action), false);
        const response = await h.bridge.request(`learning/${action}`, { chatIdentity: h.state().chatIdentity, ...extra });
        assert.equal(response.result.rejected, 'busy');
        assert.equal(response.result.state.language, 'en');
        assert.equal(response.result.state.teacher.name, '林老师');
        assert.equal(response.result.state.chatBusy, true);
    }
    await ui.request('cancel-chat', { target: 'companion' });
    assert.equal(ui.canRequest('language'), true);
    await ui.request('language', { language: 'ja' });
    assert.equal(ui.state.value.language, 'ja');
});
