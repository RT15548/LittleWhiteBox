import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createClassroomFixture, fixtureLesson } from './fixtures/learning-classroom.js';
import { createLearningConversationStorage } from '../apps/learning/application/conversation-storage.js';
import { emptyLearningMemory } from '../apps/learning/domain/conversation.js';
import { parseLearningStoredMemory, upgradeLearningMemory } from '../apps/learning/upgrade/memory-v1.js';
import { learningScheduleAt } from '../domains/learning/schedule.js';

const inputOf = request => JSON.parse(request.messages.findLast(message => message.role === 'user' && message.content.includes('<learning_request>')).content.split('<learning_request>\n')[1].split('\n</learning_request>')[0]);
const lane = target => target === 'companion' ? 'conversation' : 'workbenchConversation';
async function memoryOf(h, target) {
    if (target === 'companion') { return (await h.store.read()).value.sessions[0].memory; }
    return (await h.workbenchStore.read()).value.conversations.find(entry => entry.language === 'en')?.memories[0] ?? emptyLearningMemory();
}

for (const target of ['workbench', 'companion']) {
    test(`${target} verifies a lost clear receipt without resurrecting old exchanges or its summary`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose);
        await h.command('teacher', { teacher: { name: 'Lin', note: '' } });
        const storage = createLearningConversationStorage({ data: () => h.repository.snapshot().document?.data,
            osId: () => h.store.peekCurrent().osId, companions: h.store, workbench: h.workbenchStore });
        await storage.port(target, 'en', h.state().companionSessionId).save({ ...emptyLearningMemory(), summary: 'An old private agreement.', archivedCount: 3 }, () => true);
        h.runtime.handleChatChanged(); await h.reenter();
        h.flags.teacherResponse = () => ({ text: 'A private reply.' });
        await h.command('talk', { target, message: 'Please delete this exchange later.' });
        const before = h.counts.provider;
        if (target === 'companion') { h.flags.teacherReceiptLost = true; } else { h.flags.ledgerUnknown = true; }
        await h.command('forget-conversation', { target });
        assert.equal(h.state()[lane(target)].turns.length, 0);
        // Repeated verification while the candidate is still unknown must neither reload nor generate a reply.
        await h.command(target === 'companion' ? 'verify-teacher' : 'verify-workbench');
        if (target === 'companion') { h.flags.teacherReceiptLost = false; } else { h.confirmLedger(); }
        await h.command(target === 'companion' ? 'verify-teacher' : 'verify-workbench');
        assert.equal(h.counts.provider, before);
        assert.equal(h.state()[lane(target)].turns.length, 0);
        assert.equal(h.state()[lane(target)].removedTurns, 0);
        assert.deepEqual(await memoryOf(h, target), emptyLearningMemory());
        await h.command('talk', { target, message: 'Start a new conversation.' });
        const memory = await memoryOf(h, target);
        assert.deepEqual(memory.exchanges.map(exchange => exchange.user), ['Start a new conversation.']);
        assert.equal(memory.summary, ''); assert.equal(memory.archivedCount, 0);
        h.runtime.handleChatChanged(); await h.reenter();
        assert.deepEqual(h.state()[lane(target)].turns.map(turn => turn.user), ['Start a new conversation.']);
        assert.deepEqual(h.failures, []);
    });

    test(`${target} keeps personal conversation when replacing an article, including after reopening`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
        const personal = 'Next month is my birthday. Let us talk about travel then.';
        await h.command('talk', { target, message: personal });
        const previous = h.state().unit.id;
        await h.command('replace-lesson', { unitId: previous, message: 'Find another article.' });
        assert.notEqual(h.state().unit.id, previous);
        assert.ok(h.state()[lane(target)].turns.some(turn => turn.user === personal));
        h.runtime.handleChatChanged(); await h.reenter();
        assert.ok(h.state()[lane(target)].turns.some(turn => turn.user === personal));
        h.flags.teacherResponse = request => {
            assert.ok(request.messages.some(message => message.role === 'user' && message.content === personal));
            return { text: 'I remember our travel plan.' };
        };
        await h.command('talk', { target, message: 'What did we agree?' });
        assert.equal(h.state()[lane(target)].turns.at(-1).status, 'finished');
        assert.ok((await memoryOf(h, target)).exchanges.some(exchange => exchange.user === personal));
    });
}

test('a private summary keeps its access boundary after its source article is replaced', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const document = structuredClone(h.repository.snapshot().document);
    const unit = document.data.profiles[0].unit;
    unit.scope = { kind: 'story', osId: unit.originOsId };
    h.replaceUser(document); await h.command('read');
    const storage = createLearningConversationStorage({ data: () => h.repository.snapshot().document.data,
        osId: () => h.store.peekCurrent().osId, companions: h.store, workbench: h.workbenchStore });
    const privateMemory = { ...emptyLearningMemory(), summary: 'PRIVATE_STORY_AGREEMENT', summaryScope: unit.scope, summaryReferences: [unit.id], archivedCount: 4 };
    await storage.port('workbench', 'en', null).save(privateMemory, () => true);
    h.runtime.handleChatChanged(); await h.reenter();
    await h.command('replace-lesson', { unitId: unit.id, message: 'Find another article.' });
    h.runtime.handleChatChanged(); await h.reenter();
    assert.equal(h.state().workbenchConversation.removedTurns, 4);
    assert.equal((await storage.port('workbench', 'en', null).read()).summary, privateMemory.summary);
    await h.changeChat();
    const publicMemory = await storage.port('workbench', 'en', null).read();
    assert.equal(publicMemory.summary, '');
    h.flags.teacherResponse = request => {
        assert.ok(!JSON.stringify(request.messages).includes(privateMemory.summary));
        return { text: 'A separate study conversation.' };
    };
    await h.command('talk', { target: 'workbench', message: 'Continue studying here.' });
    assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'finished');
    assert.ok((await h.workbenchStore.read()).value.conversations[0].memories.some(memory => memory.summary === privateMemory.summary));
});

for (const privateItem of [false, true]) {
    test(`new review ${privateItem ? 'inherits private item access' : 'stays public without reading unrelated private items'}`, async t => {
        const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
        const document = structuredClone(h.repository.snapshot().document);
        const profile = document.data.profiles[0];
        const scope = { kind: 'story', osId: profile.unit.originOsId };
        profile.items.push({ id: 'due-item', label: 'Selected phrase', skill: 'grammar', scope: privateItem ? scope : { kind: 'public' },
            evidence: [], schedule: learningScheduleAt('2000-01-01T00:00:00.000Z') },
        { id: 'future-item', label: 'PRIVATE_UNSELECTED', skill: 'grammar', scope, evidence: [], schedule: learningScheduleAt('2099-01-01T00:00:00.000Z') });
        const beforeItems = structuredClone(profile.items);
        h.replaceUser(document); await h.command('read');
        h.flags.teacherResponse = (request, round) => {
            const input = inputOf(request);
            if (!privateItem) { assert.ok(!JSON.stringify(request.messages).includes('PRIVATE_UNSELECTED')); }
            if (round === 1) { return { toolCalls: [{ id: 'review', name: 'LearningLessonEdit', arguments: JSON.stringify({ kind: 'review', title: 'Review', goal: 'Recall', materials: [],
                exercises: input.focus.items.map(item => ({ key: item.id, itemId: item.id, skill: 'grammar', materialKeys: [], prompt: item.label,
                    response: { kind: 'text' }, rule: { kind: 'semantic' } })) }) }] }; }
            return { text: 'Review ready.' };
        };
        await h.command('start-review');
        assert.deepEqual(h.profile().items, beforeItems);
        assert.deepEqual(h.profile().review.scope, privateItem ? scope : { kind: 'public' });
        await h.changeChat();
        assert.equal(!!h.state().review, !privateItem);
        assert.deepEqual(h.failures, []);
    });
}

test('the frozen reference-owned memory converts to durable access once, without copying its source', async () => {
    // Captured from the real a98b159 fixture runtime, not fabricated with the current memory type.
    const fixture = JSON.parse(await readFile(new URL('./fixtures/learning-memory-v1.json', import.meta.url), 'utf8'));
    const scopes = new Map(fixture.memory.exchanges[0].references.map(id => [id, fixture.scope]));
    const upgraded = upgradeLearningMemory(parseLearningStoredMemory(fixture.memory), scopes);
    assert.deepEqual(upgraded.exchanges[0], { ...fixture.memory.exchanges[0], scope: fixture.scope });
    assert.deepEqual(upgradeLearningMemory(parseLearningStoredMemory(upgraded), new Map()), upgraded);
    assert.equal(upgradeLearningMemory(parseLearningStoredMemory(fixture.memory), new Map()).exchanges.length, 0);
});

test('reviewing a public knowledge item keeps the private scope of its available answer evidence', async t => {
    const lesson = { ...fixtureLesson, exercises: fixtureLesson.exercises.map(exercise => ({ ...exercise, skill: 'grammar' })) };
    const h = await createClassroomFixture({ lesson }); t.after(h.dispose); await h.openLesson();
    const original = structuredClone(h.repository.snapshot().document);
    const scope = { kind: 'story', osId: h.profile().unit.originOsId };
    original.data.profiles[0].unit.scope = scope;
    h.replaceUser(original); await h.command('read');
    const exercise = h.state().unit.exercises[0];
    await h.command('submit', { unitId: h.state().unit.id, exerciseId: exercise.id, answer: { kind: 'choice', ids: [exercise.response.options[0].id] } });
    const document = structuredClone(h.repository.snapshot().document);
    const item = document.data.profiles[0].items[0];
    assert.equal(item.evidence.length, 1);
    item.scope = { kind: 'public' }; item.schedule = learningScheduleAt('2000-01-01T00:00:00.000Z');
    h.replaceUser(document); await h.command('read');
    h.flags.teacherResponse = (request, round) => round === 1 ? { toolCalls: [{ id: 'review', name: 'LearningLessonEdit', arguments: JSON.stringify({
        kind: 'review', title: 'Review', goal: 'Recall', materials: [], exercises: inputOf(request).focus.items.map(item => ({ key: item.id, itemId: item.id,
            skill: 'grammar', materialKeys: [], prompt: item.label, response: { kind: 'text' }, rule: { kind: 'semantic' } })) }) }] } : { text: 'Ready.' };
    await h.command('start-review');
    assert.deepEqual(h.profile().review.scope, scope);
    await h.changeChat(); assert.equal(h.state().review, null);
});

test('confirming a pending clear after changing language leaves the other conversation intact', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    h.flags.teacherResponse = () => ({ text: 'A study reply.' });
    await h.command('talk', { target: 'workbench', message: 'English agreement.' });
    await h.command('language', { language: 'ja' });
    await h.command('talk', { target: 'workbench', message: 'Japanese agreement.' });
    await h.command('language', { language: 'en' });
    h.flags.ledgerUnknown = true;
    await h.command('forget-conversation', { target: 'workbench' });
    await h.command('language', { language: 'ja' });
    h.confirmLedger();
    await h.command('verify-wallet');
    assert.deepEqual(h.state().workbenchConversation.turns.map(turn => turn.user), ['Japanese agreement.']);
    await h.command('language', { language: 'en' });
    assert.equal(h.state().workbenchConversation.turns.length, 0);
});
