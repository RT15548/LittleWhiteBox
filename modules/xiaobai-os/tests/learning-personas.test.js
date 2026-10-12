import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createClassroomFixture, fixtureLesson } from './fixtures/learning-classroom.js';
import { createLearningConversationStorage } from '../apps/learning/application/conversation-storage.js';
import { emptyLearningMemory } from '../apps/learning/domain/conversation.js';
import { learningTurnNotice } from '../apps/learning/ui/learning-notice.js';
import { learningActionAvailable } from '../apps/learning/application/action-availability.js';

const desert = 'Do you know how to survive on a desert island? The word "desert" here does not mean a dry land full of sand. It means "deserted" — nobody lives there. If you are ever stranded on one, remember three basic needs: water, food, and shelter.';
const inputOf = request => JSON.parse(request.messages.findLast(entry => entry.role === 'user' && entry.content.includes('<learning_request>')).content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
const plain = '这里的 desert island 是荒岛，强调无人居住，不是沙漠。';
const send = (h, action, input = {}) => h.bridge.request(`learning/${action}`, { chatIdentity: h.state().chatIdentity, ...input });
function until(h, predicate) {
    if (predicate(h.state())) { return Promise.resolve(); }
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { unsubscribe(); reject(new Error('Expected learning state not published')); }, 3000);
        const unsubscribe = h.bridge.subscribe(() => { if (predicate(h.state())) { clearTimeout(timer); unsubscribe(); resolve(); } });
    });
}

test('a desert-island quotation receives one plain companion reply and writes only its own conversation', async t => {
    const lesson = structuredClone(fixtureLesson); lesson.materials[0].text = desert;
    const h = await createClassroomFixture({ lesson }); t.after(h.dispose); await h.openLesson();
    const before = structuredClone(h.repository.snapshot().document); const writes = h.counts.userWrites; const calls = h.counts.provider;
    const material = h.state().unit.materials[0];
    h.flags.teacherResponse = request => {
        const input = inputOf(request);
        assert.equal(input.action.kind, 'talk');
        assert.equal(input.training.materials[0].paragraphs[0].text, desert);
        assert.equal(input.selection.quote, desert);
        for (const tool of request.tools) { assert.ok(!['LearningAssess', 'LearningProfileEdit', 'LearningLessonEdit', 'LearningComplete'].includes(tool.function.name)); }
        return { text: plain };
    };
    await h.command('talk', { message: '这是什么意思？', selection: { materialId: material.id, paragraphId: material.paragraphs[0].id, start: 0, end: desert.length, quote: desert } });
    assert.equal(h.counts.provider, calls + 1);
    assert.equal(h.counts.userWrites, writes); assert.deepEqual(h.repository.snapshot().document, before);
    assert.equal(h.state().conversation.turns.at(-1).teacher, plain);
    assert.equal(h.state().conversation.turns.at(-1).messages.some(message => message.role === 'tool'), false);
    assert.equal(h.state().chatMessage, ''); assert.equal(h.state().conversation.turns.at(-1).message, '');
    await h.reenter();
    assert.equal(h.counts.provider, calls + 1);
    assert.equal(h.state().conversation.turns.at(-1).teacher, plain);
});

test('learning needs no companion, chatting needs no article, and identities and histories remain separate', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    assert.equal(h.state().teacher, null);
    await h.command('profile', { message: '高中英语基础，希望提高写作。' });
    assert.ok(h.state().profile); assert.equal(h.counts.captures, 0);
    h.flags.teacherResponse = () => ({ text: '教学中的约定。' });
    await h.command('talk', { target: 'workbench', message: '教学私聊问题。' });
    await h.command('teacher', { teacher: { name: 'Lin', note: 'gentle' } });
    h.flags.teacherResponse = request => {
        assert.equal(inputOf(request).training, null);
        assert.ok(!JSON.stringify(request.messages).includes('教学私聊问题。'));
        assert.ok(!JSON.stringify(request.messages).includes('教学中的约定。'));
        return { text: '搭子的私人回应。' };
    };
    await h.command('talk', { message: '今天好累。' });
    assert.equal(h.counts.captures, 1);
    h.flags.teacherResponse = request => {
        assert.ok(!JSON.stringify(request.messages).includes('搭子的私人回应。'));
        assert.ok(!JSON.stringify(request.messages).includes('<teacher_reference>'));
        assert.equal(inputOf(request).background, undefined);
        return { text: '继续教学。' };
    };
    await h.command('talk', { target: 'workbench', message: '继续我们的教学讨论。' });
    assert.equal(h.counts.captures, 1); assert.equal(h.state().unit, null);
    assert.deepEqual(h.failures, []);
});

test('each companion resumes a stable private session while workbench dialogue follows the language', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    h.flags.teacherResponse = () => ({ text: 'English study agreement.' });
    await h.command('talk', { target: 'workbench', message: 'English question.' });
    await h.command('teacher', { teacher: { name: 'Lin', note: '' } });
    const first = h.state().companionSessionId;
    await h.command('talk', { message: 'Private to Lin.' });
    await h.command('teacher', { teacher: { name: 'Sam', note: '' } });
    assert.notEqual(h.state().companionSessionId, first); assert.equal(h.state().conversation.turns.length, 0);
    await h.command('teacher', { teacher: { name: 'Lin', note: 'new note' } });
    assert.equal(h.state().companionSessionId, first); assert.equal(h.state().conversation.turns[0].user, 'Private to Lin.');
    await h.command('language', { language: 'ja' }); await h.reenter();
    assert.equal(h.state().workbenchConversation.turns.length, 0);
    await h.command('language', { language: 'en' }); await h.reenter();
    assert.equal(h.state().workbenchConversation.turns[0].user, 'English question.');
    await h.command('forget-conversation', { target: 'workbench' });
    assert.equal(h.state().workbenchConversation.turns.length, 0);
    assert.equal(h.state().conversation.turns[0].user, 'Private to Lin.');
});

for (const target of ['workbench', 'companion']) {
    test(`${target} retains a reply on unknown history save and verifies without another model call`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose);
        await h.command('teacher', { teacher: { name: 'Lin', note: '' } });
        h.flags.teacherResponse = () => ({ text: plain });
        if (target === 'companion') { h.flags.teacherReceiptLost = true; } else { h.flags.ledgerUnknown = true; }
        await h.command('talk', { target, message: '解释荒岛。' });
        const lane = target === 'companion' ? 'conversation' : 'workbenchConversation';
        assert.equal(h.state()[lane].turns.at(-1).teacher, plain); assert.ok(h.state()[lane].turns.at(-1).message);
        const calls = h.counts.provider;
        if (target === 'companion') { h.flags.teacherReceiptLost = false; } else { h.confirmLedger(); }
        await h.command(target === 'companion' ? 'verify-teacher' : 'verify-workbench');
        assert.equal(h.counts.provider, calls);
        assert.equal(h.state()[lane].turns.at(-1).teacher, plain);
        assert.equal(h.state()[lane].turns.at(-1).message, '');
    });
}

test('clearing all learning data retires both conversations and their summaries', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    h.flags.teacherResponse = () => ({ text: plain });
    await h.command('talk', { message: '引用当前文章。' }); await h.command('talk', { target: 'workbench', message: '讨论文章。' });
    await h.command('clear');
    assert.equal(h.profile(), undefined);
    assert.equal(h.state().conversation.turns.length, 0); assert.equal(h.state().workbenchConversation.turns.length, 0);
    await h.reenter();
    assert.equal(h.state().conversation.turns.length, 0); assert.equal(h.state().workbenchConversation.turns.length, 0);
});

test('the frozen upstream companion preference upgrades once without changing coursework or schedules', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const before = structuredClone(h.repository.snapshot().document);
    const historical = JSON.parse(await readFile(new URL('./fixtures/learning-companion-v1.json', import.meta.url), 'utf8'));
    await h.store.transact(transaction => transaction.replace(historical));
    await h.reenter();
    assert.deepEqual(h.state().teacher, historical.teacher);
    assert.deepEqual(h.repository.snapshot().document, before);
    assert.equal(h.state().conversation.turns.length, 0);
    const id = h.state().companionSessionId; const writes = h.counts.teacherWrites;
    assert.ok(id); await h.reenter();
    assert.equal(h.state().companionSessionId, id); assert.equal(h.counts.teacherWrites, writes);
});

test('workbench private exchanges and summaries survive another story without becoming visible there', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const document = structuredClone(h.repository.snapshot().document);
    const unit = document.data.profiles[0].unit;
    unit.scope = { kind: 'story', osId: unit.originOsId };
    h.replaceUser(document); await h.command('read');
    let osId = unit.originOsId;
    const storage = createLearningConversationStorage({ data: () => h.repository.snapshot().document.data,
        osId: () => osId, companions: h.store, workbench: h.workbenchStore });
    const port = storage.port('workbench', 'en', null);
    const privateMemory = { exchanges: [{ id: 'private-dialogue', user: 'Private question', reply: 'Private reply', replyTo: null, summarized: false, references: [unit.id], scope: unit.scope }],
        summary: 'Private summary', summaryReferences: [unit.id], summaryScope: unit.scope, archivedCount: 3 };
    await port.save(privateMemory, () => true);
    osId = 'another-story';
    assert.deepEqual(await port.read(), emptyLearningMemory());
    const publicMemory = { ...emptyLearningMemory(), summary: 'Public study preferences', archivedCount: 2 };
    await port.save(publicMemory, () => true);
    assert.deepEqual(await port.read(), publicMemory);
    osId = unit.originOsId;
    const restored = await port.read();
    assert.deepEqual(restored.exchanges, privateMemory.exchanges);
    assert.equal(restored.archivedCount, 5);
    assert.ok(restored.summary.includes(privateMemory.summary));
    assert.ok(restored.summary.includes(publicMemory.summary));
    await storage.clear('workbench', 'en', null, () => true);
    assert.deepEqual(await port.read(), emptyLearningMemory());
});

test('reading private lesson content makes the replacement private without copying private history', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const document = structuredClone(h.repository.snapshot().document);
    document.data.profiles[0].unit.scope = { kind: 'story', osId: h.profile().unit.originOsId };
    h.replaceUser(document); await h.command('read');
    h.flags.teacherResponse = () => ({ text: 'PRIVATE_STUDY_CONTEXT' });
    await h.command('talk', { target: 'workbench', message: 'Discuss the private article.' });
    const previousId = h.profile().unit.id;
    h.flags.teacherResponse = (request, round) => {
        const input = inputOf(request);
        assert.equal(input.training, null);
        assert.equal(input.profile.blockedCurrentUnit, true);
        assert.ok(!JSON.stringify(request.messages).includes('PRIVATE_STUDY_CONTEXT'));
        if (round === 1) { return { toolCalls: [{ id: 'read', name: 'LearningRead', arguments: JSON.stringify({ section: 'unit' }) }] }; }
        if (round === 2) {
            assert.equal(JSON.parse(request.messages.findLast(message => message.role === 'tool').content).data.id, previousId);
            return { toolCalls: [{ id: 'new', name: 'LearningLessonEdit', arguments: JSON.stringify(fixtureLesson) }] };
        }
        return { text: 'The new public lesson is ready.' };
    };
    await h.command('replace-lesson', { unitId: previousId, message: 'Replace the lesson.' });
    assert.notEqual(h.profile().unit.id, previousId);
    assert.deepEqual(h.profile().unit.scope, { kind: 'story', osId: h.profile().unit.originOsId });
});

for (const target of ['companion', 'workbench']) {
    for (const failSummary of [false, true]) {
        test(`${target} ${failSummary ? 'keeps raw history when summary fails' : 'resumes its persisted summary'} without replaying model calls`, async t => {
            const h = await createClassroomFixture(); t.after(h.dispose);
            await h.command('teacher', { teacher: { name: 'Lin', note: '' } });
            h.flags.teacherResponse = () => ({ text: 'A completed explanation. '.repeat(300) });
            for (let index = 0; index < 3; index++) { await h.command('talk', { target, message: `question-${index}` }); }
            let summaries = 0; let first = true;
            h.flags.teacherResponse = request => {
                if (!request.tools.length) {
                    summaries++;
                    if (failSummary) { throw new Error('fixture summary unavailable'); }
                    return { text: 'Persisted study agreement.' };
                }
                if (first) { first = false; throw Object.assign(new Error('maximum context length exceeded'), { status: 400, code: 'context_length_exceeded' }); }
                return { text: 'Continue studying.' };
            };
            await h.command('talk', { target, message: 'continue' });
            assert.equal(summaries, 1);
            const calls = h.counts.provider;
            h.runtime.handleChatChanged(); await h.reenter(); assert.equal(h.counts.provider, calls);
            const dialogue = target === 'companion' ? h.state().conversation : h.state().workbenchConversation;
            assert.equal(dialogue.removedTurns, failSummary ? 0 : 1);
            assert.equal(dialogue.turns.length, 3);
            h.flags.teacherResponse = request => {
                const memory = request.messages.find(message => message.content.includes('<conversation_memory>'));
                assert.equal(!!memory, !failSummary);
                return { text: 'Fresh reply.' };
            };
            await h.command('talk', { target, message: 'resume' });
            await h.command('forget-conversation', { target }); await h.reenter();
            const cleared = target === 'companion' ? h.state().conversation : h.state().workbenchConversation;
            assert.equal(cleared.removedTurns, 0); assert.equal(cleared.turns.length, 0);
        });
    }
}

test('a formal failure before any tool has a visible workbench owner, while storage errors use one recovery location', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    h.flags.providerFailure = true;
    await h.command('profile', { message: 'Set a writing goal.' });
    const turn = h.state().workbenchConversation.turns.at(-1);
    assert.equal(turn.status, 'failed'); assert.ok(turn.message);
    assert.ok(learningTurnNotice(turn, 'ready', 'ready'));
    assert.equal(h.state().message, ''); assert.equal(h.state().conversation.turns.length, 0);
    const saveNotice = { ...turn, notice: 'history-save' };
    assert.equal(learningTurnNotice(saveNotice, 'unconfirmed', 'ready'), '');
    assert.ok(learningTurnNotice(saveNotice, 'ready', 'ready'));
});

test('saved paragraph feedback resumes at its original answer rather than becoming companion chat', async t => {
    const h = await createClassroomFixture({ lesson: { ...fixtureLesson, kind: 'reading-writing' } }); t.after(h.dispose);
    await h.openLesson(); await h.command('choose-original');
    const unit = h.state().unit;
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'text', text: 'The passage describes the value of trees.' } });
    const before = h.state().workbenchConversation.summaryReviews;
    assert.equal(before.length, 1); assert.equal(h.state().conversation.turns.length, 0);
    h.runtime.handleChatChanged(); await h.reenter();
    assert.deepEqual(h.state().workbenchConversation.summaryReviews, before);
    assert.equal(h.state().conversation.turns.length, 0);
    h.flags.teacherResponse = () => ({ text: 'A complete teaching discussion. '.repeat(200) });
    for (let index = 0; index < 2; index++) { await h.command('talk', { target: 'workbench', message: `Teaching followup ${index}` }); }
    let overflowed = false;
    h.flags.teacherResponse = request => {
        if (!request.tools.length) { return { text: 'Remembered.' }; }
        if (!overflowed) { overflowed = true; throw Object.assign(new Error('maximum context length exceeded'), { status: 400, code: 'context_length_exceeded' }); }
        return { text: 'Continue.' };
    };
    await h.command('talk', { target: 'workbench', message: 'Continue teaching.' });
    assert.ok(h.state().workbenchConversation.removedTurns >= 2);
    h.runtime.handleChatChanged(); await h.reenter();
    assert.deepEqual(h.state().workbenchConversation.summaryReviews, before);
});

test('formal grading and companion chat run concurrently; results stay in their own spaces', async t => {
    let release;
    const h = await createClassroomFixture({ lesson: { ...fixtureLesson, kind: 'reading-writing' } });
    t.after(() => { release?.(); return h.dispose(); }); await h.openLesson(); await h.command('choose-original');
    const unit = h.state().unit;
    for (const exercise of unit.exercises.slice(0, -1)) {
        await h.command('submit', { unitId: unit.id, exerciseId: exercise.id, answer: { kind: 'text', text: 'The article explains how trees help a city.' } });
    }
    const gate = new Promise(resolve => { release = resolve; });
    h.flags.teacherResponse = async (request, round) => {
        const input = inputOf(request);
        if (input.action.kind === 'grade' && round === 1) {
            await gate;
            return { toolCalls: input.focus.drafts.map(({ attempt }) => ({ id: attempt.id, name: 'LearningAssess', arguments: JSON.stringify({ attemptId: attempt.id,
                verdict: 'partial', understanding: 'Relevant idea.', expression: 'Check tense.', guidance: 'Keep your own argument.',
                annotations: attempt.answer.text.includes('is go') ? [{ category: 'grammar', severity: 'error', paragraphIndex: 0,
                    quote: 'is go', explanation: 'Use past tense with yesterday.', suggestion: 'went' }] : [] }) })) };
        }
        return { text: input.action.kind === 'talk' ? 'I am here with you.' : 'Your feedback is ready.' };
    };
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises.at(-1).id, answer: { kind: 'text', text: 'Yesterday he is go to a park. Trees matter.' } });
    await send(h, 'grade', { unitId: unit.id });
    await until(h, state => state.pending?.purpose === 'grade');
    await send(h, 'talk', { target: 'companion', message: '陪我聊聊吧。' });
    await until(h, state => !state.chatBusy && state.conversation.turns.at(-1)?.status === 'finished');
    assert.equal(h.state().busy, true); assert.equal(h.state().conversation.turns.length, 1);
    release(); await until(h, state => !state.busy);
    assert.equal(h.profile().unit.assessments.length, unit.exercises.length);
    assert.equal(h.state().conversation.turns.length, 1);
    assert.equal(h.state().workbenchConversation.turns.at(-1).purpose, 'grade');
    h.flags.teacherResponse = request => {
        assert.equal(inputOf(request).profile.unit.attempts.filter(attempt => attempt.assessed).length, unit.exercises.length);
        return { text: 'We can look at the published feedback together.' };
    };
    await h.command('talk', { message: '看见我的批改了吗？' });
    assert.deepEqual(h.failures, []);
});

for (const change of ['article', 'language', 'companion']) {
    test(`changing ${change} ${change === 'article' ? 'preserves an ordinary conversation' : 'retires the previous companion response'}`, async t => {
        let release; let entered;
        const h = await createClassroomFixture(); t.after(() => { release?.(); return h.dispose(); }); await h.openLesson();
        const gate = new Promise(resolve => { release = resolve; });
        const ready = new Promise(resolve => { entered = resolve; });
        h.flags.teacherResponse = async (request, round) => {
            if (inputOf(request).action.kind === 'talk') { entered(); await gate; return { text: 'STALE_REPLY' }; }
            return round === 1 ? { toolCalls: [{ id: 'replacement', name: 'LearningLessonEdit', arguments: JSON.stringify(fixtureLesson) }] } : { text: 'New article ready.' };
        };
        await send(h, 'talk', { target: 'companion', message: 'Read this with me.' }); await ready;
        if (change === 'article') {
            const previous = h.state().unit.id;
            await send(h, 'replace-lesson', { unitId: previous, kind: 'lesson', message: 'Replace this article.' });
            await until(h, state => !state.busy && state.unit.id !== previous);
        } else {
            await send(h, 'cancel-chat', { target: 'companion' });
            if (change === 'language') { await h.command('language', { language: 'ja' }); }
            else { await h.command('teacher', { teacher: { name: 'Sam', note: '' } }); }
        }
        release(); await until(h, state => !state.chatBusy);
        h.runtime.handleChatChanged(); await h.reenter();
        assert.equal(h.state().conversation.turns.some(turn => turn.teacher === 'STALE_REPLY'), change === 'article');
        const saved = (await h.store.read()).value;
        assert.equal(saved.sessions.some(session => session.memory.exchanges.some(exchange => exchange.reply === 'STALE_REPLY')), change === 'article');
    });
}

test('a companion history save failure does not disable independent learning work', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    h.flags.teacherReceiptLost = true;
    await h.command('talk', { message: 'A private conversation.' });
    assert.equal(h.state().chatStorage, 'unconfirmed');
    assert.equal(learningActionAvailable('settings', h.state()), true);
    assert.equal(learningActionAvailable('workbench-talk', h.state()), true);
    await h.command('settings', { value: { targetLevel: 'B2' } });
    assert.equal(h.profile().goal.targetLevel, 'B2');
});
