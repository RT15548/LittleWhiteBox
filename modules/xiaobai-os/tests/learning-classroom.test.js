import assert from 'node:assert/strict';
import test from 'node:test';
import { createClassroomFixture, fixtureLesson } from './fixtures/learning-classroom.js';
import { createLearningSpeech } from '../apps/learning/application/speech.js';
import { createLearningService } from '../apps/learning/application/service.js';
import { learningClassView } from '../apps/learning/application/projection.js';
import { parseLearningData } from '../domains/learning/data.js';
import { learningSpeechParts } from '../domains/learning/speech.js';
import { createLearningPractice } from '../apps/learning/application/practice.js';
import { independentLearningSuccess } from '../domains/learning/progress.js';
import { MAX_LEARNING_WRITE_BYTES } from '../apps/learning/storage/document.js';
import { learningActionAvailable } from '../apps/learning/application/action-availability.js';
import { createLearningConversationStorage } from '../apps/learning/application/conversation-storage.js';
import { emptyLearningMemory } from '../apps/learning/domain/conversation.js';

test('invalid learning data exposes reset and the learner can start a new lesson afterwards', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture({ initialLearningFile: { schemaVersion: 99 } });
    t.after(h.dispose);
    assert.equal(h.state().storage, 'invalid');
    assert.equal(learningActionAvailable('reset-learning', h.state()), true);
    assert.equal(learningActionAvailable('clear', h.state()), false);
    await h.economy.ensureOpen();
    const balance = h.economy.getPlayerBalance();
    const transactions = h.economy.listTransactions();
    await h.command('reset-learning');
    assert.equal(h.state().storage, 'ready');
    assert.equal(h.state().busy, false);
    assert.deepEqual(h.repository.snapshot().document.data, { profiles: [] });
    assert.equal(learningActionAvailable('reset-learning', h.state()), false);
    assert.equal(h.economy.getPlayerBalance(), balance);
    assert.deepEqual(h.economy.listTransactions(), transactions);
    await h.openLesson();
    assert.ok(h.profile().unit);
    assert.deepEqual(h.failures, []);
});

test('a lost reset receipt recovers through the normal save recovery without repeating the reset', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture({ initialLearningFile: { schemaVersion: 99 } });
    t.after(h.dispose);
    h.flags.userFailure = true;
    await h.command('reset-learning');
    assert.equal(h.state().storage, 'unconfirmed');
    assert.equal(learningActionAvailable('reset-learning', h.state()), false);
    await h.reenter();
    assert.equal(h.state().storage, 'unconfirmed');
    const writes = h.counts.userWrites;
    h.confirmUser();
    await h.command('verify');
    assert.equal(h.state().storage, 'ready');
    assert.equal(h.counts.userWrites, writes);
    await h.openLesson();
    assert.ok(h.profile().unit);
    assert.deepEqual(h.failures, []);
});

for (const recovery of ['direct', 'verify', 'retry-save']) {
    test(`reset retires stale preparation and coursework through ${recovery}, retaining saved conversations`, async t => {
        t.mock.method(console, 'error', () => {});
        const h = await createClassroomFixture(); t.after(h.dispose);
        await h.command('teacher', { teacher: { name: '林老师', note: '' } });
        await h.command('profile', { message: '学习英语。' });
        await h.command('talk', { message: '这段对话要保留。' });
        await h.command('talk', { target: 'workbench', message: '想读城市生活的话题。' });
        await h.command('prepare', { kind: 'reading-writing', message: '准备新文章。' });
        h.flags.providerFailure = true;
        await h.command('choose-original');
        h.flags.providerFailure = false;
        assert.equal(h.state().sourceChoice, 'unavailable');
        assert.equal(h.state().preparation.running, false);
        assert.ok(h.state().reply);
        assert.ok(h.state().companionReply);
        const companions = (await h.store.read()).value;
        const workbench = (await h.workbenchStore.read()).value;
        h.replaceUser({ schemaVersion: 99 }); await h.command('read');
        h.flags.userFailure = recovery !== 'direct';
        await h.command('reset-learning');
        const writes = h.counts.userWrites;
        if (recovery === 'verify') { h.confirmUser(); await h.command('verify'); }
        if (recovery === 'retry-save') { h.flags.userFailure = false; await h.command('retry-save'); }
        assert.equal(h.state().storage, 'ready');
        assert.equal(h.state().sourceChoice, null);
        assert.equal(h.state().preparation, null);
        assert.equal(h.state().reply, null);
        assert.equal(h.state().companionReply, null);
        assert.equal(h.state().workbenchConversation.turns.some(turn => turn.retryable || turn.presentation), false);
        assert.equal(h.state().conversation.turns.some(turn => turn.retryable || turn.presentation), false);
        assert.deepEqual((await h.store.read()).value, companions);
        assert.deepEqual((await h.workbenchStore.read()).value, workbench);
        assert.equal(h.counts.userWrites, writes + (recovery === 'retry-save' ? 1 : 0));
        await h.command('prepare', { kind: 'reading-writing', message: '重新开课。' });
        await h.command('choose-original');
        assert.ok(h.state().unit);
        assert.deepEqual(h.failures, []);
    });
}

for (const applied of [true, false]) {
    test(`reset resumes the actual saved companion history after a lost receipt (applied=${applied})`, async t => {
        t.mock.method(console, 'error', () => {});
        const h = await createClassroomFixture(); t.after(h.dispose);
        await h.openLesson();
        await h.command('talk', { message: 'saved-before' });
        h.flags.teacherReceiptLost = true; h.flags.teacherWriteApplied = applied;
        await h.command('talk', { message: 'lost-receipt' });
        assert.equal(h.state().chatStorage, 'unconfirmed');
        h.replaceUser({ schemaVersion: 99 }); await h.command('read');
        await h.command('reset-learning');
        assert.equal(h.state().storage, 'ready');
        await h.reenter();
        h.flags.teacherReceiptLost = false; h.flags.teacherWriteApplied = true;
        await h.command(applied ? 'verify-teacher' : 'adopt-teacher');
        assert.equal(h.state().chatStorage, 'ready');
        const expected = ['saved-before', ...(applied ? ['lost-receipt'] : [])];
        assert.deepEqual(h.state().conversation.turns.map(turn => turn.user), expected);
        await h.command('talk', { message: 'new-after-reset' });
        assert.deepEqual((await h.store.read()).value.sessions[0].memory.exchanges.map(exchange => exchange.user), [...expected, 'new-after-reset']);
        await h.openLesson();
        assert.ok(h.profile().unit);
        assert.deepEqual(h.failures, []);
    });
}

test('an ordinary uncertain save cannot hide the reset exit for a proven invalid file', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose);
    await h.openLesson();
    h.flags.userFailure = true;
    await h.command('settings', { value: { level: 'B2' } });
    assert.equal(h.state().storage, 'unconfirmed');
    h.replaceUser({ schemaVersion: 99 });
    await h.command('verify');
    assert.equal(h.state().storage, 'invalid');
    assert.equal(learningActionAvailable('reset-learning', h.state()), true);
    await h.reenter();
    assert.equal(learningActionAvailable('reset-learning', h.state()), true);
    h.flags.userFailure = false;
    await h.command('reset-learning');
    assert.deepEqual(h.repository.snapshot().document.data, { profiles: [] });
    await h.openLesson();
    assert.ok(h.profile().unit);
    assert.deepEqual(h.failures, []);
});

for (const scenario of [
    { name: 'v1' },
    { name: 'learning', learning: true },
    { name: 'workbench', shared: 'workbench' },
    { name: 'wallet', shared: 'wallet' },
    { name: 'learning + workbench + companion', shared: 'workbench', learning: true, companion: true },
    { name: 'learning + wallet + companion', shared: 'wallet', learning: true, companion: true },
]) {
    test(`invalid v1 reset reaches a saved new answer without resolving unrelated receipts: ${scenario.name}`, async t => {
        t.mock.method(console, 'error', () => {});
        const h = await createClassroomFixture(); t.after(h.dispose);
        await h.openLesson(); await h.economy.ensureOpen();
        await h.command('talk', { message: 'saved-companion' });
        await h.command('talk', { target: 'workbench', message: 'saved-workbench' });
        if (scenario.companion) {
            h.flags.teacherReceiptLost = true;
            await h.command('talk', { message: 'companion-receipt-lost' });
        }
        if (scenario.shared) {
            h.flags.ledgerUnknown = true;
            if (scenario.shared === 'workbench') { await h.command('talk', { target: 'workbench', message: 'workbench-receipt-lost' }); }
            else {
                const unit = h.profile().unit;
                await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
            }
            assert.equal(h.wallet.getFileState(), 'unconfirmed');
        }
        if (scenario.learning) { h.flags.userFailure = true; await h.command('settings', { value: { level: 'B2' } }); }
        const oldUnit = h.profile().unit.id;
        const wallet = { balance: h.economy.getPlayerBalance(), transactions: h.economy.listTransactions() };
        const sharedCandidate = structuredClone(h.flags.heldLedger);
        const writes = { shared: h.counts.ledgerWrites, companion: h.counts.teacherWrites };
        h.replaceUser({ schemaVersion: 1, revision: 1, commitId: 'unreadable-v1', data: { profiles: null } });
        await h.command(scenario.learning ? 'verify' : 'read');
        assert.equal(learningActionAvailable('reset-learning', h.state()), true);
        h.flags.userFailure = false;
        await h.command('reset-learning');
        assert.equal(h.state().storage, 'ready');
        assert.deepEqual(h.repository.snapshot().document.data, { profiles: [] });
        assert.equal(h.counts.ledgerWrites, writes.shared);
        assert.equal(h.counts.teacherWrites, writes.companion);
        await h.reenter();
        await h.command('settings', { value: { level: 'A2' } });
        await h.command('prepare', { kind: 'reading-writing', message: 'new-course-after-reset' });
        await h.command('choose-original');
        const unit = h.profile().unit;
        assert.ok(unit); assert.notEqual(unit.id, oldUnit);
        await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'text', text: 'A saved answer after reset.' } });
        assert.equal(h.profile().unit.attempts[0].answer.text, 'A saved answer after reset.');
        assert.equal(h.storedFiles().learning.data.profiles[0].unit.attempts[0].answer.text, 'A saved answer after reset.');
        assert.equal(h.state().storage, 'ready');
        const newHistory = h.state().workbenchConversation.turns.map(turn => turn.id);
        assert.ok(newHistory.length);
        assert.deepEqual({ balance: h.economy.getPlayerBalance(), transactions: h.economy.listTransactions() }, wallet);
        if (scenario.shared) {
            assert.equal(h.counts.ledgerWrites, writes.shared);
            assert.deepEqual(h.flags.heldLedger, sharedCandidate);
            assert.equal(h.wallet.hasPendingCommit(), true);
            assert.ok(h.state().workbenchConversation.turns.some(turn => turn.notice === 'history-save'));
            h.confirmLedger(); await h.command('verify-workbench');
            assert.deepEqual(h.storedFiles().wallet, sharedCandidate);
            const restored = h.state().workbenchConversation.turns;
            assert.ok(newHistory.every(id => restored.some(turn => turn.id === id)));
            assert.equal(restored.filter(turn => turn.user === 'saved-workbench').length, 1);
            if (scenario.shared === 'workbench') { assert.equal(restored.filter(turn => turn.user === 'workbench-receipt-lost').length, 1); }
        }
        await h.command('talk', { target: 'workbench', message: 'continue-after-recovery' });
        const stored = (await h.workbenchStore.read()).value.conversations.find(entry => entry.language === 'en').memories.flatMap(memory => memory.exchanges);
        assert.ok(newHistory.every(id => stored.some(exchange => exchange.id === id)));
        assert.equal(stored.filter(exchange => exchange.user === 'saved-workbench').length, 1);
        if (scenario.companion) { h.flags.teacherReceiptLost = false; await h.command('verify-teacher'); }
        await h.command('talk', { message: 'continue-companion' });
        assert.deepEqual((await h.store.read()).value.sessions[0].memory.exchanges.map(exchange => exchange.user),
            ['saved-companion', ...(scenario.companion ? ['companion-receipt-lost'] : []), 'continue-companion']);
        await h.reenter();
        assert.equal(h.profile().unit.attempts[0].answer.text, 'A saved answer after reset.');
        assert.deepEqual(h.failures, []);
    });
}

test('an unreadable v1 learning file offers reset and can start a new course', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture({ initialLearningFile: {
        schemaVersion: 1, revision: 1, commitId: 'unreadable-v1', data: { profiles: null },
    } });
    t.after(h.dispose);
    assert.equal(h.state().storage, 'invalid');
    assert.equal(learningActionAvailable('reset-learning', h.state()), true);
    await h.command('reset-learning');
    assert.equal(h.state().storage, 'ready');
    await h.openLesson();
    assert.ok(h.state().unit);
});

test('reset preserves learning records and conversation if the file was repaired before confirmation', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture();
    t.after(h.dispose);
    await h.openLesson();
    await h.command('talk', { message: '我们接着学。' });
    const document = h.repository.snapshot().document;
    const conversation = h.state().conversation;
    h.replaceUser({ schemaVersion: 99 });
    await h.command('read');
    assert.equal(h.state().storage, 'invalid');
    h.replaceUser(document);
    const writes = h.counts.userWrites;
    await h.command('reset-learning');
    assert.equal(h.state().storage, 'ready');
    assert.equal(h.counts.userWrites, writes);
    assert.deepEqual(h.repository.snapshot().document, document);
    assert.deepEqual(h.state().conversation, conversation);
    assert.deepEqual(h.failures, []);
});

test('reset only replaces learning assets, preserving all story conversations even when their storage rejects writes', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture();
    t.after(h.dispose);
    await h.openLesson();
    const history = createLearningConversationStorage({ data: () => h.repository.snapshot().document?.data,
        osId: () => h.store.peekCurrent()?.osId, companions: h.store, workbench: h.workbenchStore });
    await history.port('workbench', 'en', null).save({ ...emptyLearningMemory(), summary: 'Story A private history',
        summaryScope: { kind: 'story', osId: h.store.peekCurrent().osId }, archivedCount: 2 }, () => true);
    await h.changeChat();
    await h.command('teacher', { teacher: { name: '林老师', note: '' } });
    await h.command('talk', { target: 'companion', message: 'Story B companion conversation.' });
    const workbench = (await h.workbenchStore.read()).value;
    const companions = (await h.store.read()).value;
    h.replaceUser({ schemaVersion: 99 }); await h.command('read');
    const { teacherWrites, ledgerWrites } = h.counts;
    h.flags.ledgerFailure = true;
    await h.command('reset-learning');
    assert.equal(h.state().storage, 'ready');
    assert.deepEqual(h.repository.snapshot().document.data, { profiles: [] });
    await h.reenter();
    assert.equal(h.state().storage, 'ready');
    assert.equal(h.state().workbenchConversation.removedTurns, 0); // Other-story history stays private.
    assert.deepEqual((await h.workbenchStore.read()).value, workbench);
    assert.deepEqual((await h.store.read()).value, companions);
    assert.equal(h.counts.teacherWrites, teacherWrites);
    assert.equal(h.counts.ledgerWrites, ledgerWrites);
    assert.deepEqual(h.failures, []);
});

test('a changed invalid reset baseline returns to the reset button and can recover after fresh confirmation', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture({ initialLearningFile: { schemaVersion: 99 } });
    t.after(h.dispose);
    h.flags.userFailure = true;
    await h.command('reset-learning');
    h.replaceUser({ schemaVersion: 100 });
    await h.command('verify');
    assert.equal(h.state().storage, 'invalid');
    assert.equal(learningActionAvailable('reset-learning', h.state()), true);
    const candidate = h.flags.heldUser;
    h.flags.userFailure = false;
    await h.command('reset-learning');
    assert.equal(h.state().storage, 'ready');
    assert.deepEqual(h.repository.snapshot().document, candidate);
    await h.openLesson();
    assert.ok(h.profile().unit);
    assert.deepEqual(h.failures, []);
});

test('an uncertain cross-story draft replacement preserves hidden originals through receipt recovery', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture({ lesson: { ...fixtureLesson, kind: 'reading-writing' } });
    t.after(h.dispose); await h.openLesson(); await h.command('choose-original');
    const document = h.repository.snapshot().document; const data = structuredClone(document.data);
    data.profiles[0].unit.scope = { kind: 'story', osId: h.profile().unit.originOsId };
    await h.repository.save(document, data, () => true);
    const unit = h.profile().unit; const exerciseId = unit.exercises.find(entry => !entry.paragraphId).id;
    await h.command('submit', { unitId: unit.id, exerciseId, answer: { kind: 'text', text: 'Original private writing.' } });
    const original = structuredClone(h.profile().unit.attempts[0]);
    await h.command('share-course', { unitId: unit.id, commitId: h.repository.snapshot().document.commitId, approved: true });
    await h.changeChat();
    await h.command('submit', { unitId: unit.id, exerciseId, answer: { kind: 'text', text: 'B initial writing.' } });
    const oldB = h.profile().unit.attempts.at(-1).id;
    h.flags.userFailure = true;
    await h.command('submit', { unitId: unit.id, exerciseId, answer: { kind: 'text', text: 'B revised writing.' } });
    assert.equal(h.repository.snapshot().status, 'unconfirmed');
    assert.deepEqual(h.profile().unit.attempts[0], original);
    assert.equal(h.state().unit.attempts[0].id, oldB);
    h.confirmUser(); await h.command('verify');
    assert.equal(h.repository.snapshot().status, 'ready');
    assert.deepEqual(h.profile().unit.attempts[0], original);
    assert.equal(h.profile().unit.attempts.some(entry => entry.id === oldB), false);
    assert.equal(h.state().unit.attempts.length, 1);
    assert.equal(h.state().unit.attempts[0].answer.text, 'B revised writing.');
    await h.reenter(); assert.deepEqual(h.profile().unit.attempts[0], original);
});

test('unconfirmed global rewards block learning deletion until the saved wallet is explicitly adopted', async t => {
    t.mock.method(console, 'error', () => {});
    const h = await createClassroomFixture(); t.after(h.dispose);
    await h.openLesson();
    const unit = h.profile().unit;
    h.flags.ledgerUnknown = true;
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(h.wallet.getFileState(), 'unconfirmed');
    assert.equal(h.coordinator.getFileState(), 'ready');
    const before = structuredClone(h.repository.snapshot().document);
    for (const action of ['abandon', 'delete-language', 'clear']) {
        await h.command(action);
        assert.deepEqual(h.repository.snapshot().document, before);
    }
    assert.equal((await h.wallet.adoptServerState()).status, 'adopted');
    h.flags.ledgerUnknown = false;
    await h.command('clear');
    assert.equal((await h.wallet.retryPending()).status, 'none');
    assert.equal(h.repository.snapshot().document.data.profiles.length, 0);
    assert.equal(h.economy.getPlayerBalance(), 100);
});

test('profile clarification returns the teacher reply without inventing a saved goal, and accepts a follow-up', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    await h.command('teacher', { teacher: { name: '林老师', note: '' } });
    h.flags.profileReply = '你准备哪一次四级考试？更想先练听力还是阅读？';
    const writes = h.counts.userWrites;
    const question = await h.command('profile', { message: '想考四级，水平还不确定。' });
    assert.equal(question.profile, null);
    assert.equal(question.busy, false);
    assert.equal(question.message, '');
    assert.equal(question.reply.action, 'profile');
    assert.equal(question.reply.text, h.flags.profileReply);
    assert.equal(question.reply.id, question.workbenchConversation.turns.at(-1).id);
    assert.equal(h.counts.userWrites, writes);
    h.flags.profileReply = null;
    const saved = await h.command('profile', { message: '准备十二月四级，先练听力。' });
    assert.ok(saved.profile);
    assert.equal(saved.storage, 'ready');
});

test('records stay on a populated page after deletion, verification and server replacement', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const initial = h.repository.snapshot().document;
    const data = structuredClone(initial.data);
    data.profiles[0].items = Array.from({ length: 61 }, (_, index) => ({
        id: `item-${index}`, label: `学习项 ${index + 1}`, skill: 'reading', scope: { kind: 'public' }, evidence: [],
    }));
    await h.repository.save(initial, data, () => true);
    const calls = h.counts.provider;
    assert.equal((await h.command('records', { offset: 60, id: 'item-60' })).record.id, 'item-60');
    h.flags.userFailure = true;
    const uncertain = await h.command('delete-item', { id: 'item-60' });
    assert.equal(uncertain.storage, 'unconfirmed');
    assert.equal(uncertain.records.offset, 60);
    assert.equal(uncertain.records.items[0].id, 'item-60');
    h.confirmUser();
    const verified = await h.command('verify');
    assert.equal(verified.records.offset, 30);
    assert.equal(verified.records.items.length, 30);
    const server = h.repository.snapshot().document;
    server.revision++; server.commitId = 'records-trimmed';
    server.data.profiles[0].items = server.data.profiles[0].items.slice(0, 31);
    h.replaceUser(server);
    assert.equal((await h.command('read')).records.offset, 30);
    await h.command('records', { offset: 30, id: 'item-30' });
    const deleted = await h.command('delete-item', { id: 'item-30' });
    assert.equal(deleted.record, null);
    assert.equal(deleted.records.total, 30);
    assert.equal(deleted.records.offset, 0);
    assert.equal(deleted.records.items.length, 30);
    // A later growth must not resurrect the stale page that was already corrected.
    await h.repository.save(h.repository.snapshot().document, data, () => true);
    assert.equal((await h.command('read')).records.offset, 0);
    await h.command('records', { offset: 60 });
    const replacement = h.repository.snapshot().document;
    replacement.revision++; replacement.commitId = 'records-replaced';
    replacement.data.profiles[0].items = replacement.data.profiles[0].items.slice(0, 1);
    h.replaceUser(replacement);
    h.flags.userFailure = true;
    assert.equal((await h.command('delete-item', { id: 'item-60' })).storage, 'conflict');
    const adopted = await h.command('adopt-server');
    h.flags.userFailure = false;
    assert.equal(adopted.records.offset, 0);
    assert.equal(adopted.records.items.length, 1);
    const empty = await h.command('delete-item', { id: 'item-0' });
    assert.deepEqual(empty.records, { offset: 0, total: 0, items: [] });
    assert.equal(h.counts.provider, calls);
});

function playbackFixture() {
    const players = []; const calls = [];
    const facade = { isEnabled: () => true,
        getVoices: () => ({ defaultVoice: 'voice-a', voices: [{ id: 'voice-a', available: true }, { id: 'voice-b', available: true }] }),
        createPlayer() {
            const player = { activate: () => true, playNow: () => true, dispose() {}, setPlaybackRate: value => value };
            players.push(player); return player;
        },
        synthesize: async (text, options) => { calls.push({ text, ...options }); return new Blob(['fixture']); },
        openSettings() {},
    };
    return { facade, players, calls };
}

test('adopting a lesson replacement retires obsolete queued hearing events without blocking the classroom', async t => {
    for (const replacement of ['removed-unit', 'replaced-unit', 'removed-question', 'changed-span', 'other-story']) {
        await t.test(replacement, async sub => {
            const audio = playbackFixture();
            const lesson = structuredClone(fixtureLesson);
            lesson.exercises.push({ ...structuredClone(lesson.exercises[0]), key: 'q2', skill: 'listening' });
            const h = await createClassroomFixture({ listening: true, lesson, getTtsFacade: () => audio.facade });
            sub.after(h.dispose); await h.openLesson();
            const unit = h.profile().unit; const material = unit.materials[0];
            await h.command('play', { materialId: material.id, exerciseId: unit.exercises[0].id, partKey: learningSpeechParts(material)[0].key });
            const server = structuredClone(h.repository.snapshot().document);
            server.revision++; server.commitId = 'external-replacement';
            if (replacement === 'removed-unit') { server.data.profiles[0].unit = null; }
            if (replacement === 'replaced-unit') { server.data.profiles[0].unit.id = 'new-server-lesson'; }
            if (replacement === 'removed-question') { server.data.profiles[0].unit.exercises.shift(); }
            if (replacement === 'changed-span') { server.data.profiles[0].unit.materials[0].paragraphs[0].text = 'A different audio passage.'; }
            if (replacement === 'other-story') { server.data.profiles[0].unit.scope = { kind: 'story', osId: 'other' }; server.data.profiles[0].unit.originOsId = 'other'; }
            h.replaceUser(server);
            h.flags.userFailure = true;
            // An uncertain playing write discovers a different saved lesson during recovery.
            audio.players[0].onStateChange('playing');
            await h.command('rate', { value: 0.75 });
            assert.equal((await h.command('read')).storage, 'conflict');
            await h.command('adopt-server');
            h.flags.userFailure = false;
            const writes = h.counts.userWrites;
            const read = await h.command('read');
            assert.equal(read.storage, 'ready'); assert.equal(read.message, '');
            assert.equal(h.counts.userWrites, writes);
            assert.equal(h.profile().unit?.listening, undefined);
            await h.reenter();
            const calls = h.counts.provider;
            const prepared = await h.command('prepare', { message: '准备新课。', replaceCurrent: !!h.profile().unit });
            assert.equal(prepared.storage, 'ready'); assert.ok(prepared.unit);
            assert.ok(h.counts.provider > calls);
        });
    }
});

test('shared material carries real listening, replay and slow-play facts across questions, but not unrelated audio', async t => {
    const audio = playbackFixture();
    const lesson = structuredClone(fixtureLesson);
    lesson.materials.push({ key: 'other', title: 'Another audio', kind: 'authored', text: 'The train leaves at seven.' });
    const question = lesson.exercises[0]; question.skill = 'listening';
    lesson.exercises = [question, { ...structuredClone(question), key: 'q2' },
        { ...structuredClone(question), key: 'q3', materialKeys: ['other'] },
        { ...structuredClone(question), key: 'q4', materialKeys: ['text', 'other'] }];
    const h = await createClassroomFixture({ lesson, getTtsFacade: () => audio.facade }); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit; const [first, second, unrelated, combined] = unit.exercises;
    const [material, other] = unit.materials;
    const key = learningSpeechParts(material)[0].key;
    await h.command('play', { materialId: material.id, exerciseId: first.id, partKey: key });
    audio.players.at(-1).onStateChange('playing'); await h.command('read');
    const service = createLearningService(h.repository);
    const answer = async exercise => {
        await service.prepareAttempt({ language: 'en', unitId: unit.id, exerciseId: exercise.id, answer: { kind: 'choice', ids: ['a'] },
            scope: unit.scope, osId: unit.originOsId, replays: 0, slowPlayback: false }).save(() => true);
        return h.profile().unit.attempts.at(-1);
    };
    const attempt = await answer(second);
    assert.equal(attempt.listening[0].voice.voiceId, 'voice-a');
    assert.equal(attempt.help.replays, 0); assert.equal(attempt.help.slowPlayback, false);
    assert.equal(independentLearningSuccess({ exercise: second, materials: unit.materials, attempt, assessment: { verdict: 'correct' } }), true);
    assert.equal((await answer(unrelated)).listening, undefined);
    await service.setVoice('en', { voiceId: 'voice-b', language: 'en', speed: 1 }, () => true);
    await h.command('play', { materialId: material.id, exerciseId: second.id, partKey: key });
    assert.equal(audio.calls.at(-1).speaker, 'voice-a');
    audio.players.at(-1).onStateChange('playing'); await h.command('rate', { value: 0.75 }); await h.command('read');
    const repeated = await answer(second);
    assert.equal(repeated.help.replays, 1); assert.equal(repeated.help.slowPlayback, true);
    await h.reenter();
    const originalAgain = await answer(first);
    assert.equal(originalAgain.help.replays, 1); assert.equal(originalAgain.help.slowPlayback, true);
    // The same question also plays another material, at normal speed. Its slow flag stays span-local.
    await h.command('play', { materialId: material.id, exerciseId: combined.id, partKey: key });
    audio.players.at(-1).onStateChange('playing'); await h.command('rate', { value: 0.75 }); await h.command('read');
    await h.command('play', { materialId: other.id, exerciseId: combined.id, partKey: learningSpeechParts(other)[0].key });
    assert.equal(audio.calls.at(-1).speaker, 'voice-b');
    audio.players.at(-1).onStateChange('playing'); await h.command('read');
    const otherAttempt = await answer(unrelated);
    assert.ok(otherAttempt.listening); assert.equal(otherAttempt.help.replays, 0); assert.equal(otherAttempt.help.slowPlayback, false);
    const combinedAttempt = await answer(combined);
    assert.deepEqual(combinedAttempt.listening, [
        { key, voice: { voiceId: 'voice-a', language: 'en', speed: 1 }, count: 3, slowPlayback: true },
        { key: learningSpeechParts(other)[0].key, voice: { voiceId: 'voice-b', language: 'en', speed: 1 }, count: 1, slowPlayback: false },
    ]);
    assert.equal(combinedAttempt.help.replays, 2); assert.equal(combinedAttempt.help.slowPlayback, true);
    assert.deepEqual(h.profile().unit.attempts.find(entry => entry.id === attempt.id), attempt);
    // Representative evidence must keep all voices even after the original lesson is removed.
    const assessed = await h.command('assess', { attemptId: combinedAttempt.id, message: '记录这次听力表现。' });
    assert.equal(assessed.storage, 'ready');
    await h.command('abandon'); await h.reenter();
    assert.deepEqual(h.profile().items.flatMap(item => item.evidence).find(entry => entry.attempt.id === combinedAttempt.id).attempt, combinedAttempt);
    // An earlier answer is a snapshot, not a moving view of later listening.
    assert.equal(attempt.listening.length, 1); assert.equal(attempt.listening[0].count, 1);
    assert.doesNotThrow(() => parseLearningData(h.repository.snapshot().document.data));
});

test('a listening snapshot keeps distinct voices for the same span and validates span ownership', async t => {
    const lesson = structuredClone(fixtureLesson); lesson.exercises[0].skill = 'listening';
    lesson.exercises.push({ ...structuredClone(lesson.exercises[0]), key: 'q2' });
    const h = await createClassroomFixture({ lesson }); t.after(h.dispose); await h.openLesson();
    const service = createLearningService(h.repository); const unit = h.profile().unit;
    const key = learningSpeechParts(unit.materials[0])[0].key;
    for (const [index, voiceId] of ['voice-a', 'voice-b'].entries()) {
        await service.listening('en', unit.id, unit.exercises[index].id, { voiceId, language: 'en', speed: 1 }, key, true, index === 1, unit.originOsId, () => true);
    }
    await service.prepareAttempt({ language: 'en', unitId: unit.id, exerciseId: unit.exercises[1].id, answer: { kind: 'choice', ids: ['a'] },
        scope: unit.scope, osId: unit.originOsId, replays: 0, slowPlayback: false }).save(() => true);
    await h.reenter();
    const attempt = h.profile().unit.attempts[0];
    assert.deepEqual(attempt.listening.map(part => [part.key, part.voice.voiceId, part.count, part.slowPlayback]),
        [[key, 'voice-a', 1, false], [key, 'voice-b', 1, true]]);
    assert.equal(attempt.help.replays, 1); assert.equal(attempt.help.slowPlayback, true);
    for (const change of [parts => { parts[0].key = 'missing:0'; }, parts => { parts[0].count = 0; },
        parts => { parts.push(structuredClone(parts[0])); }, parts => { parts.length = 0; }]) {
        const bad = structuredClone(h.repository.snapshot().document.data);
        change(bad.profiles[0].unit.attempts[0].listening);
        assert.throws(() => parseLearningData(bad));
    }
});

async function fillLearningFile(h) {
    const document = structuredClone(h.repository.snapshot().document);
    document.revision++; document.commitId = 'capacity-fixture';
    const profile = document.data.profiles[0];
    const target = MAX_LEARNING_WRITE_BYTES - 16;
    const size = value => new TextEncoder().encode(JSON.stringify(value)).byteLength;
    let bytes = size(document);
    // Valid archived completions exercise the real 8 MiB check, not a mocked file-full error.
    while (bytes < target) {
        const completion = { unitId: `archived-${profile.completions.length}`, completedAt: '2026-09-01T00:00:00.000Z',
            summary: 'x'.repeat(2000), scope: { kind: 'public' }, attemptIds: ['archived-answer'],
            // Capacity data represents settled history, not thousands of outstanding payments.
            receipt: { transactionId: `paid-${profile.completions.length}`, receivedAt: Date.parse('2026-09-01T00:00:00.000Z') },
            reward: { originOsId: profile.unit.originOsId, amount: 20, title: 'Lesson', note: 'Completed' } };
        const overhead = size(completion) - 2000 + (profile.completions.length ? 1 : 0);
        const available = target - bytes - overhead;
        if (available < 1) { profile.selfAssessment += 'x'.repeat(target - bytes); break; }
        completion.summary = 'x'.repeat(Math.min(2000, available));
        profile.completions.push(completion); bytes += overhead + completion.summary.length;
    }
    assert.equal(size(document), target);
    assert.doesNotThrow(() => parseLearningData(document.data));
    h.replaceUser(document); await h.command('read');
    assert.equal(h.state().storage, 'ready');
}

test('file-full hearing writes permit cleanup, preserve retries, and never resurrect cleared lessons', async t => {
    const audio = playbackFixture();
    const h = await createClassroomFixture({ listening: true, getTtsFacade: () => audio.facade }); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit; const exercise = unit.exercises[0]; const material = unit.materials[0];
    await createLearningService(h.repository).note('en', unit.id, { id: 'old-note', text: 'x'.repeat(4000), exerciseId: exercise.id, selection: null }, () => true);
    await fillLearningFile(h);
    const play = { materialId: material.id, exerciseId: exercise.id, partKey: learningSpeechParts(material)[0].key };
    await h.command('play', play); const writes = h.counts.userWrites;
    audio.players.at(-1).onStateChange('playing'); await h.command('rate', { value: 0.75 });
    const failed = await h.command('read');
    assert.match(failed.message, /文件已满/); assert.equal(failed.storage, 'ready');
    assert.equal(h.counts.userWrites, writes); assert.equal(h.profile().unit.listening, undefined);
    h.flags.userRejected = true;
    await h.command('delete-note', { id: 'old-note' });
    assert.equal(h.profile().unit.notes.length, 1); // Failed cleanup does not discard the pending hearing fact.
    h.flags.userRejected = false;
    await h.command('delete-note', { id: 'old-note' });
    assert.equal(h.profile().unit.notes.length, 0);
    const recovered = await h.command('read');
    assert.equal(recovered.message, '');
    assert.equal(h.profile().unit.listening[0].parts[0].count, 1);
    assert.equal(h.profile().unit.listening[0].slowPlayback, true);
    // Fill the remaining space again; a second question creates a new hearing record.
    const server = structuredClone(h.repository.snapshot().document);
    server.data.profiles[0].unit.exercises.push({ ...structuredClone(exercise), id: 'second-listening' });
    server.revision++; server.commitId = 'second-question'; h.replaceUser(server); await h.command('read');
    await fillLearningFile(h);
    await h.command('play', { ...play, exerciseId: 'second-listening' }); audio.players.at(-1).onStateChange('playing');
    assert.match((await h.command('read')).message, /文件已满/);
    await h.command('clear');
    assert.deepEqual(h.repository.snapshot().document.data, { profiles: [] });
    assert.equal((await h.command('read')).message, '');
    await h.reenter(); assert.deepEqual(h.state().languages, []);
    const calls = h.counts.provider; await h.openLesson();
    assert.ok(h.counts.provider > calls); assert.equal(h.profile().unit.listening, undefined);
});

test('formal classroom opens without a model, saves a lesson, submits, completes and automatically pays once', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    assert.equal(h.counts.provider, 0); assert.equal(h.counts.userWrites, 0);
    await h.openLesson(); await h.economy.ensureOpen();
    const initial = h.state();
    assert.equal(initial.unit.reward.amount, 20);
    assert.equal(initial.unit.exercises[0].solution, null);
    const q = initial.unit.exercises[0];
    const after = await h.command('submit', { unitId: initial.unit.id, exerciseId: q.id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(after.completions[0].rewardStatus, 'paid');
    assert.equal(h.economy.getPlayerBalance(), 120);
    const calls = h.counts.provider;
    await h.command('reward', { unitId: initial.unit.id });
    await h.command('records'); await h.command('read'); await h.reenter();
    assert.equal(h.counts.provider, calls); assert.equal(h.economy.getPlayerBalance(), 120);
    assert.equal(h.profile().unit.attempts.length, 1);
    assert.deepEqual(h.failures, []);
});

test('unconfirmed completion remains unpublished; recovery pays only after confirmation without asking a model again', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson(); await h.economy.ensureOpen();
    const unit = h.profile().unit;
    const service = createLearningService(h.repository);
    await service.prepareAttempt({ language: 'en', unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] },
        scope: unit.scope, osId: unit.originOsId, replays: 0, slowPlayback: false }).save(() => true);
    h.flags.teacherResponse = (_request, round) => round === 1 ? { toolCalls: [{ id: 'complete', name: 'LearningComplete', arguments: JSON.stringify({
        unitId: unit.id, attemptIds: [h.profile().unit.attempts[0].id], summary: '完成' }) }] } : { text: '完成了。' };
    h.flags.userFailure = true;
    const result = await h.command('complete');
    assert.equal(result.storage, 'unconfirmed'); assert.equal(result.completions.length, 0); assert.equal(h.economy.getPlayerBalance(), 100);
    const calls = h.counts.provider; h.confirmUser();
    const verified = await h.command('verify');
    assert.equal(verified.completions[0].rewardStatus, 'paid');
    assert.equal(h.counts.provider, calls); assert.equal(h.economy.getPlayerBalance(), 120);
});

test('ledger failure and receipt failure retain the completed lesson and never multiply the reward', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson(); await h.economy.ensureOpen();
    const unit = h.profile().unit; h.flags.ledgerFailure = true;
    let state = await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(state.completions.length, 1); assert.notEqual(state.completions[0].rewardStatus, 'paid');
    const calls = h.counts.provider; h.flags.ledgerFailure = false; h.flags.userFailure = true;
    state = await h.command('reward', { unitId: unit.id });
    assert.equal(h.economy.getPlayerBalance(), 120); assert.equal(state.storage, 'unconfirmed'); assert.notEqual(state.completions[0].rewardStatus, 'paid');
    h.confirmUser(); await h.command('verify'); await h.command('reward', { unitId: unit.id });
    assert.equal(h.economy.getPlayerBalance(), 120); assert.equal(h.counts.provider, calls);
    assert.equal(h.profile().completions[0].receipt.transactionId.length > 0, true);
});

test('cross-story historical learning content stays private while its reward can be claimed globally once', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const legacy = h.repository.snapshot().document;
    const privateData = structuredClone(legacy.data);
    privateData.profiles[0].unit.scope = { kind: 'story', osId: h.store.peekCurrent().osId };
    await h.repository.save(legacy, privateData, () => true);
    const unit = h.profile().unit;
    h.flags.ledgerFailure = true;
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(h.economy.getPlayerBalance(), 100);
    const view = learningClassView(h.repository.snapshot().document.data, 'en', 'other');
    assert.equal(view.unit, null); assert.equal(view.blockedUnit, true);
    h.flags.ledgerFailure = false;
    await h.changeChat();
    const state = await h.command('reward', { unitId: unit.id });
    assert.equal(state.completions[0].rewardStatus, 'paid'); assert.equal(h.economy.getPlayerBalance(), 120);
    await h.command('reward', { unitId: unit.id });
    assert.equal(h.economy.getPlayerBalance(), 120);
});

test('hidden listening text and keys stay off the reading surface; reveal/notes/selection are real saved facts', async t => {
    const h = await createClassroomFixture({ listening: true }); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit; const material = unit.materials[0]; const exercise = unit.exercises[0];
    assert.equal(h.state().unit.materials[0].paragraphs.length, 0);
    assert.equal(h.state().unit.exercises[0].solution, null);
    const calls = h.counts.provider;
    let state = await h.command('play', { materialId: material.id, partKey: learningSpeechParts(material)[0].key, exerciseId: exercise.id });
    assert.equal(state.media.status, 'unavailable'); assert.equal(h.profile().unit.listening, undefined); assert.equal(h.counts.provider, calls);
    state = await h.command('reveal', { kind: 'transcripts', id: material.id });
    assert.equal(state.unit.materials[0].paragraphs[0].text, material.paragraphs[0].text);
    await h.command('talk', { exerciseId: exercise.id, message: '解释这一句。', selection: { materialId: material.id, paragraphId: material.paragraphs[0].id,
        start: 0, end: 6, quote: material.paragraphs[0].text.slice(0, 6) } });
    await h.command('save-note');
    assert.equal((await h.reenter()).unit.notes.length, 1);
    const saved = structuredClone(h.repository.snapshot().document.data);
    saved.profiles[0].unit.notes[0].selection.quote = 'not the original';
    assert.throws(() => parseLearningData(saved));
});

test('only actual audio play records listening; replays freeze the original voice and submissions inherit the facts', async t => {
    const h = await createClassroomFixture({ listening: true }); t.after(h.dispose); await h.openLesson();
    const classroom = { language: 'en', osId: h.profile().unit.originOsId, chatIdentity: 'runtime-a', teacher: { name: '林老师', note: '' } };
    const players = []; const calls = []; const errors = [];
    const facade = { isEnabled: () => true, getVoices: () => ({ defaultVoice: 'voice-a', voices: [{ id: 'voice-a', available: true }, { id: 'voice-b', available: true }] }),
        createPlayer() { const player = { activate: () => true, playNow: () => true, dispose() {}, setPlaybackRate: value => value, pause() {}, resume() {}, seek: () => true }; players.push(player); return player; },
        synthesize: async (text, options) => { calls.push({ text, options }); return new Blob(['fixture']); }, openSettings() {},
    };
    const speech = createLearningSpeech({ repository: h.repository, current: () => classroom, getFacade: () => facade, onState() {}, onSave() {}, onError: () => errors.push('failure') });
    t.after(speech.stop);
    const unit = h.profile().unit; const material = unit.materials[0]; const exercise = unit.exercises[0];
    const part = learningSpeechParts(material)[0];
    await speech.play({ materialId: material.id, exerciseId: exercise.id, partKey: part.key });
    assert.equal(h.profile().unit.listening, undefined);
    players[0].onStateChange('blocked'); await speech.flush(); assert.equal(h.profile().unit.listening, undefined);
    players[0].onStateChange('playing'); await speech.flush();
    speech.media.setRate(0.75); await speech.flush();
    const service = createLearningService(h.repository);
    await service.setVoice('en', { voiceId: 'voice-b', language: 'en', speed: 1 }, () => true);
    await speech.play({ materialId: material.id, exerciseId: exercise.id, partKey: part.key });
    players[1].onStateChange('playing'); await speech.flush();
    assert.equal(calls[1].options.speaker, 'voice-a');
    await service.prepareAttempt({ language: 'en', unitId: unit.id, exerciseId: exercise.id, answer: { kind: 'choice', ids: ['a'] },
        scope: unit.scope, osId: unit.originOsId, replays: 0, slowPlayback: false }).save(() => true);
    const attempt = h.profile().unit.attempts[0];
    assert.equal(attempt.listening[0].voice.voiceId, 'voice-a'); assert.equal(attempt.help.replays, 1); assert.equal(attempt.help.slowPlayback, true);
    const bad = structuredClone(h.repository.snapshot().document.data); bad.profiles[0].unit.listening[0].parts[0].key = 'made-up';
    assert.throws(() => parseLearningData(bad)); assert.deepEqual(errors, []);
});

test('failed first synthesis leaves no listening basis; changing voice recovers the same question', async t => {
    const h = await createClassroomFixture({ listening: true }); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit;
    const classroom = { language: 'en', osId: unit.originOsId, chatIdentity: 'runtime-a', teacher: { name: '林老师', note: '' } };
    const players = []; const calls = [];
    const facade = { isEnabled: () => true, getVoices: () => ({ defaultVoice: 'voice-a', voices: [{ id: 'voice-a', available: true }, { id: 'voice-b', available: true }] }),
        createPlayer() { const player = { activate: () => true, playNow: () => true, dispose() {} }; players.push(player); return player; },
        synthesize: async (_text, options) => { calls.push(options.speaker); if (options.speaker === 'voice-a') { throw new Error('fixed synthesis failure'); } return new Blob(['fixture']); },
    };
    const speech = createLearningSpeech({ repository: h.repository, current: () => classroom, getFacade: () => facade,
        onState() {}, onSave() {}, onError: () => assert.fail('no listening write should fail') });
    t.after(speech.stop);
    const play = { materialId: unit.materials[0].id, exerciseId: unit.exercises[0].id, partKey: learningSpeechParts(unit.materials[0])[0].key };
    const writes = h.counts.userWrites;
    await speech.play(play); await speech.flush();
    assert.equal(speech.media.snapshot().status, 'error');
    assert.equal(h.counts.userWrites, writes); assert.equal(h.profile().unit.listening, undefined);
    await createLearningService(h.repository).setVoice('en', { voiceId: 'voice-b', language: 'en', speed: 1 }, () => true);
    await speech.play(play);
    players[1].onStateChange('playing'); await speech.flush();
    assert.deepEqual(calls, ['voice-a', 'voice-b']);
    assert.equal(h.profile().unit.id, unit.id); assert.equal(h.profile().unit.listening[0].voice.voiceId, 'voice-b');
    assert.equal(h.profile().unit.listening[0].parts[0].count, 1);
});

test('preparation can return a visible-action reply without replacing a lesson or writing an empty one', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    await h.command('teacher', { teacher: { name: '林老师', note: '' } });
    await h.command('profile', { message: '准备四级考试。' });
    for (const withLesson of [false, true]) {
        if (withLesson) { h.flags.prepareReply = null; await h.command('prepare', { message: '准备一课。' }); }
        const unit = structuredClone(h.profile().unit); const writes = h.counts.userWrites;
        h.flags.prepareReply = '这篇文章暂时无法读取。要换另一篇吗？';
        const state = await h.command('prepare', { message: '用这篇文章备课。', replaceCurrent: withLesson });
        assert.equal(state.busy, false); assert.equal(state.reply.action, 'prepare'); assert.equal(state.reply.text, h.flags.prepareReply);
        assert.deepEqual(h.profile().unit, unit); assert.equal(h.counts.userWrites, writes);
    }
});

test('cancelling a classroom prevents a late provider response from publishing, and reentering never retries', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const unitId = h.profile().unit.id; const writes = h.counts.userWrites;
    let release; h.flags.providerGate = new Promise(resolve => { release = resolve; });
    await h.bridge.request('learning/prepare', { chatIdentity: 'runtime-a', message: '再来一课', replaceCurrent: true });
    await new Promise(resolve => setTimeout(resolve, 0));
    await h.command('cancel'); release(); h.flags.providerGate = null;
    await h.reenter();
    await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(h.profile().unit.id, unitId); assert.equal(h.counts.userWrites, writes);
    const calls = h.counts.provider; await h.reenter(); assert.equal(h.counts.provider, calls);
});

test('cancellation after a submitted answer was sent cannot start a new teacher request', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    let active = true; let finish;
    const saving = new Promise(resolve => { finish = resolve; });
    const wrapped = { ...h.repository, save: async (...args) => { const result = await h.repository.save(...args); await saving; return result; } };
    const unit = h.profile().unit; let requests = 0;
    const practice = createLearningPractice({ repository: wrapped, current: () => ({ language: 'en', osId: unit.originOsId,
        chatIdentity: 'runtime-a', teacher: { name: '林老师', note: '' } }), teaching: { run: async () => { requests++; return { status: 'finished' }; } } });
    const submitting = practice.submit({ unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] }, replays: 0, slowPlayback: false }, () => active);
    await new Promise(resolve => setTimeout(resolve, 0)); active = false; finish();
    assert.equal((await submitting).status, 'cancelled'); assert.equal(requests, 0);
    assert.equal(h.profile().unit.attempts.length, 1);
});

test('cancelled account operations do not change the existing global wallet', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    const writes = h.counts.ledgerWrites;
    await assert.rejects(h.economy.ensureOpen(() => false));
    await h.economy.refresh(); assert.equal(h.economy.getPlayerBalance(), 100); assert.equal(h.counts.ledgerWrites, writes);
});

test('unknown ledger writes are reconciled before receipt saving, without a second transaction', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson(); await h.economy.ensureOpen();
    const unit = h.profile().unit; h.flags.ledgerUnknown = true;
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(h.economy.getPlayerBalance(), 100); assert.equal(h.profile().completions.length, 1);
    h.confirmLedger(); await h.command('verify-wallet'); await h.command('reward', { unitId: unit.id });
    assert.equal(h.economy.getPlayerBalance(), 120); assert.equal(h.economy.listTransactions().transactions.filter(entry => entry.sourceDomain === 'learning').length, 1);
});

test('long speech keeps the exact original Unicode text in stable bounded spans', () => {
    const material = { id: 'm'.repeat(128), paragraphs: [{ id: 'p1', text: 'A short sentence. '.repeat(140) }, { id: 'p2', text: '中文🙂。'.repeat(400) }] };
    const parts = learningSpeechParts(material);
    assert.equal(parts.map(part => part.text).join(''), material.paragraphs.map(paragraph => paragraph.text).join('\n\n'));
    assert.ok(parts.every(part => [...part.text].length <= 1000));
    assert.deepEqual(parts, learningSpeechParts(structuredClone(material)));
});

for (const failure of ['rejected', 'unknown']) {
    test(`${failure} hearing writes block assessment until recovered, retaining replay and slow-play evidence exactly once`, async t => {
        const players = [];
        const facade = { isEnabled: () => true, getVoices: () => ({ defaultVoice: 'voice-a', voices: [{ id: 'voice-a', available: true }] }),
            createPlayer() { const player = { activate: () => true, playNow: () => true, dispose() {}, setPlaybackRate: value => value }; players.push(player); return player; },
            synthesize: async () => new Blob(['fixture']), openSettings() {},
        };
        const h = await createClassroomFixture({ listening: true, getTtsFacade: () => facade }); t.after(h.dispose);
        await h.openLesson();
        const unit = h.profile().unit; const exercise = unit.exercises[0]; const material = unit.materials[0];
        const play = { materialId: material.id, exerciseId: exercise.id, partKey: learningSpeechParts(material)[0].key };
        await h.command('play', play); players[0].onStateChange('playing'); await h.command('read');
        assert.equal(h.profile().unit.listening[0].parts[0].count, 1);
        await h.command('play', play);
        h.flags.userRejected = failure === 'rejected'; h.flags.userFailure = failure === 'unknown';
        players[1].onStateChange('playing');
        await h.command('rate', { value: 0.75 });
        const calls = h.counts.provider;
        const submission = { unitId: unit.id, exerciseId: exercise.id, answer: { kind: 'choice', ids: ['a'] } };
        await h.command('submit', submission);
        assert.equal(h.profile().unit.attempts.length, 0); assert.equal(h.counts.provider, calls);
        if (failure === 'unknown') {
            const before = h.repository.snapshot().document; const writes = h.counts.userWrites;
            for (const name of ['delete-note', 'delete-item', 'delete-attempt', 'abandon', 'delete-language', 'clear']) {
                assert.equal((await h.command(name, { id: 'anything' })).storage, 'unconfirmed');
                assert.deepEqual(h.repository.snapshot().document, before);
            }
            assert.equal(h.counts.userWrites, writes);
            h.confirmUser(); await h.command('verify');
        }
        else { h.flags.userRejected = false; }
        await h.command('submit', submission);
        const attempt = h.profile().unit.attempts[0];
        assert.equal(attempt.help.replays, 1); assert.equal(attempt.help.slowPlayback, true);
        assert.equal(h.profile().unit.listening[0].parts[0].count, 2);
    });
}
test('companion conversation survives reopening and clearing it does not delete learning assets', async t => {
    const h = await createClassroomFixture({ listening: true }); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit;
    assert.equal(h.state().conversation.turns.length, 0);
    await h.command('talk', { message: '今天慢慢学。' });
    const history = h.state().conversation.turns.map(turn => [turn.user, turn.teacher]);
    const calls = h.counts.provider;
    await h.reenter();
    assert.equal(h.counts.provider, calls);
    assert.deepEqual(h.state().conversation.turns.map(turn => [turn.user, turn.teacher]), history);
    assert.equal(h.profile().unit.materials[0].transcriptRevealed, false);
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(h.profile().unit.attempts[0].help.hint, false);
    const saved = structuredClone(h.profile());
    await h.command('forget-conversation');
    assert.equal(h.state().conversation.turns.length, 0);
    assert.deepEqual(h.profile(), saved);
});

test('failed cleanup retains conversation, while confirmed deletion and server replacement retire its stale references', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const turns = h.state().conversation.turns;
    h.flags.userRejected = true;
    await h.command('clear');
    assert.deepEqual(h.state().conversation.turns, turns);
    assert.ok(h.profile().unit);
    h.flags.userRejected = false;
    h.flags.userFailure = true;
    assert.equal((await h.command('clear')).storage, 'unconfirmed');
    assert.deepEqual(h.state().conversation.turns, turns);
    h.confirmUser();
    await h.command('verify');
    assert.equal(h.state().conversation.turns.length, 0);
    assert.equal(h.profile(), undefined);
    await h.openLesson();
    const replacement = structuredClone(h.repository.snapshot().document);
    replacement.revision++; replacement.commitId = 'server-edited-learning';
    replacement.data.profiles[0].unit = null;
    h.replaceUser(replacement);
    await h.reenter();
    assert.ok(h.profile().unit, 'reenter uses the confirmed session, not a remote read');
    await h.command('read');
    assert.equal(h.state().conversation.turns.length, 0);
    assert.equal(h.profile().unit, null);
});

test('confirming an owned teacher save restores the reply and activity once without losing previous turns or requesting a model', async t => {
    for (const recovery of ['verify', 'retry-save', 'read', 'reenter', 'cancel-then-verify']) {
        await t.test(recovery, async sub => {
            const h = await createClassroomFixture(); sub.after(h.dispose); await h.openLesson();
            const turns = h.state().workbenchConversation.turns;
            const unit = h.profile().unit;
            h.flags.teacherResponse = ((_request, round) => round === 1 ? { toolCalls: [
                { id: 'edit', name: 'LearningLessonEdit', arguments: JSON.stringify({ title: '加强阅读' }) },
                { id: 'present', name: 'LearningPresent', arguments: JSON.stringify({ kind: 'exercise', id: unit.exercises[0].id }) },
            ] } : { text: '试试这道阅读练习。' });
            h.flags.userFailure = true;
            assert.equal((await h.command('prepare', { message: '给我阅读练习。' })).storage, 'unconfirmed');
            assert.deepEqual(h.state().workbenchConversation.turns.slice(0, -1), turns);
            assert.equal(h.state().workbenchConversation.turns.at(-1).status, 'unconfirmed');
            assert.equal(h.state().workbenchConversation.turns.at(-1).teacher, '');
            assert.equal(h.state().workbenchConversation.turns.at(-1).presentation, undefined);
            const calls = h.counts.provider;
            if (recovery === 'cancel-then-verify') { await h.command('cancel'); }
            h.confirmUser();
            let restored = recovery === 'reenter' ? await h.reenter() : await h.command(recovery === 'cancel-then-verify' ? 'verify' : recovery);
            if (recovery === 'read' || recovery === 'reenter') {
                assert.equal(restored.storage, 'unconfirmed');
                assert.deepEqual(restored.workbenchConversation.turns.slice(0, -1), turns);
                assert.equal(restored.workbenchConversation.turns.at(-1).status, 'unconfirmed');
                restored = await h.command('verify');
            }
            assert.equal(restored.storage, 'ready');
            assert.deepEqual(restored.workbenchConversation.turns.slice(0, -1), turns);
            assert.equal(restored.workbenchConversation.turns.at(-1).user, '给我阅读练习。');
            assert.equal(restored.workbenchConversation.turns.at(-1).presentation, undefined);
            assert.equal(restored.reply.text, restored.workbenchConversation.turns.at(-1).teacher);
            await h.command('verify'); await h.command('read');
            assert.equal(h.state().workbenchConversation.turns.length, turns.length + 1);
            assert.equal(h.counts.provider, calls);
        });
    }
});

test('abandoning an uncertain reply or adopting a different commit never revives its conversation', async t => {
    for (const exit of ['forget-conversation', 'chat', 'adopt-server']) {
        await t.test(exit, async sub => {
            const h = await createClassroomFixture(); sub.after(h.dispose); await h.openLesson();
            h.flags.userFailure = true;
            h.flags.teacherResponse = ((_request, round) => round === 1 ? { toolCalls: [
                { id: 'edit', name: 'LearningProfileEdit', arguments: JSON.stringify({ selfAssessment: '未确认的自评。' }) },
            ] } : { text: 'PRIVATE_REPLY' });
            await h.command('profile', { message: 'PRIVATE_REPLY' });
            const calls = h.counts.provider;
            if (exit === 'adopt-server') {
                const external = h.repository.snapshot().document;
                external.revision++; external.commitId = 'another-writer';
                external.data.profiles[0].selfAssessment = '服务器上的自评';
                h.replaceUser(external); await h.command('verify');
                assert.equal(h.state().storage, 'conflict');
                await h.command('adopt-server');
            } else {
                if (exit === 'chat') { await h.changeChat(); }
                else { await h.command(exit, { target: 'workbench' }); }
                h.confirmUser(); await h.command('verify');
            }
            assert.ok(h.state().workbenchConversation.turns.every(turn => turn.teacher !== 'PRIVATE_REPLY'));
            assert.equal(h.state().reply, null);
            assert.equal(h.counts.provider, calls);
        });
    }
});

test('an uncertain native answer preserves dialogue on verification and remains available for assessment', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const turns = h.state().conversation.turns;
    const unit = h.profile().unit; const calls = h.counts.provider;
    h.flags.userFailure = true;
    await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    h.confirmUser(); await h.command('verify');
    assert.deepEqual(h.state().conversation.turns, turns);
    assert.equal(h.state().unit.attempts.length, 1);
    assert.equal(h.counts.provider, calls);
});
