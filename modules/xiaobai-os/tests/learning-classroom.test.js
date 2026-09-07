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

test('profile clarification returns the teacher reply without inventing a saved goal, and accepts a follow-up', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    await h.command('teacher', { teacher: { name: '林老师', note: '' } });
    h.flags.profileReply = '你准备哪一次四级考试？更想先练听力还是阅读？';
    const writes = h.counts.userWrites;
    const question = await h.command('profile', { message: '想考四级，水平还不确定。' });
    assert.equal(question.profile, null);
    assert.equal(question.busy, false);
    assert.equal(question.message, '');
    assert.deepEqual(question.reply, { action: 'profile', text: h.flags.profileReply });
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
            if (replacement === 'other-story') { server.data.profiles[0].unit.scope.osId = 'other'; server.data.profiles[0].unit.originOsId = 'other'; }
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
    const assessed = await h.command('complete');
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
            reward: { originOsId: profile.unit.originOsId, amount: 20, title: 'Lesson', note: 'Completed' } };
        const overhead = size(completion) - 2000 + (profile.completions.length ? 1 : 0);
        const available = target - bytes - overhead;
        if (available < 1) { profile.selfAssessment += 'x'.repeat(target - bytes); break; }
        completion.summary = 'x'.repeat(Math.min(2000, available));
        profile.completions.push(completion); bytes += overhead + completion.summary.length;
    }
    assert.equal(size(document), target);
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
    assert.equal(after.completions[0].paid, true, after.message);
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
    h.flags.userFailure = true;
    const result = await h.command('complete');
    assert.equal(result.storage, 'unconfirmed'); assert.equal(result.completions.length, 0); assert.equal(h.economy.getPlayerBalance(), 100);
    const calls = h.counts.provider; h.confirmUser();
    const verified = await h.command('verify');
    assert.equal(verified.completions[0].paid, true, verified.message);
    assert.equal(h.counts.provider, calls); assert.equal(h.economy.getPlayerBalance(), 120);
});

test('ledger failure and receipt failure retain the completed lesson and never multiply the reward', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson(); await h.economy.ensureOpen();
    const unit = h.profile().unit; h.flags.ledgerFailure = true;
    let state = await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(state.completions.length, 1); assert.equal(state.completions[0].paid, false);
    const calls = h.counts.provider; h.flags.ledgerFailure = false; h.flags.userFailure = true;
    state = await h.command('reward', { unitId: unit.id });
    assert.equal(h.economy.getPlayerBalance(), 120); assert.equal(state.storage, 'unconfirmed'); assert.equal(state.completions[0].paid, false);
    h.confirmUser(); await h.command('verify'); await h.command('reward', { unitId: unit.id });
    assert.equal(h.economy.getPlayerBalance(), 120); assert.equal(h.counts.provider, calls);
    assert.equal(h.profile().completions[0].receipt.transactionId.length > 0, true);
});

test('wallet closed is not auto-opened; cross-story copies cannot read the private course or take its reward', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose); await h.openLesson();
    const unit = h.profile().unit;
    let state = await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
    assert.equal(h.economy.isOpen(), false); assert.equal(state.completions[0].paid, false);
    const view = learningClassView(h.repository.snapshot().document.data, 'en', 'other');
    assert.equal(view.unit, null); assert.equal(view.blockedUnit, true); assert.equal(view.completions[0].originHere, false);
    state = await h.command('reward', { unitId: unit.id, openWallet: true });
    assert.equal(state.completions[0].paid, true); assert.equal(h.economy.getPlayerBalance(), 120);
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
    await h.command('explain', { exerciseId: exercise.id, message: '解释这一句。', selection: { materialId: material.id, paragraphId: material.paragraphs[0].id,
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

test('opening a wallet honours the queued guard and does not leave an account after cancellation', async t => {
    const h = await createClassroomFixture(); t.after(h.dispose);
    const writes = h.counts.ledgerWrites;
    await assert.rejects(h.economy.ensureOpen(() => false));
    await h.economy.refresh(); assert.equal(h.economy.isOpen(), false); assert.equal(h.counts.ledgerWrites, writes);
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
test('the teacher conversation survives stopping and reentry, records assistance, and resets without deleting learning assets', async () => {
    const h = await createClassroomFixture({ listening: true });
    try {
        await h.openLesson();
        const unit = h.profile().unit;
        const before = h.counts.provider;
        await h.command('cancel');
        await h.reenter();
        assert.equal(h.counts.provider, before);
        assert.equal(h.state().conversation.turns.length, 2);
        h.flags.talkTools = [{ name: 'LearningHelp', args: { exerciseIds: [unit.exercises[0].id], materialIds: [unit.materials[0].id] } }];
        await h.command('talk', { message: '把听力的原文给我讲一下。' });
        assert.equal(h.state().conversation.turns.at(-1).user, '把听力的原文给我讲一下。');
        assert.equal(h.profile().unit.materials[0].transcriptRevealed, true);
        await h.command('submit', { unitId: unit.id, exerciseId: unit.exercises[0].id, answer: { kind: 'choice', ids: ['a'] } });
        assert.equal(h.profile().unit.attempts[0].help.hint, true);
        assert.equal(h.profile().unit.attempts[0].help.transcript, true);
        const saved = structuredClone(h.profile());
        await h.command('forget-conversation');
        assert.equal(h.state().conversation.turns.length, 0);
        assert.deepEqual(h.profile(), saved);
        await h.changeChat();
        assert.equal(h.state().conversation.turns.length, 0);
    } finally { await h.dispose(); }
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
            const turns = h.state().conversation.turns;
            const unit = h.profile().unit;
            h.flags.talkTools = [{ name: 'LearningProfileEdit', args: { selfAssessment: '想加强阅读。' } },
                { name: 'LearningPresent', args: { kind: 'exercise', id: unit.exercises[0].id } }];
            h.flags.userFailure = true;
            assert.equal((await h.command('talk', { message: '给我阅读练习。' })).storage, 'unconfirmed');
            assert.deepEqual(h.state().conversation.turns, turns);
            const calls = h.counts.provider;
            if (recovery === 'cancel-then-verify') { await h.command('cancel'); }
            h.confirmUser();
            let restored = recovery === 'reenter' ? await h.reenter() : await h.command(recovery === 'cancel-then-verify' ? 'verify' : recovery);
            if (recovery === 'read' || recovery === 'reenter') {
                assert.equal(restored.storage, 'unconfirmed');
                assert.deepEqual(restored.conversation.turns, turns);
                restored = await h.command('verify');
            }
            assert.equal(restored.storage, 'ready');
            assert.deepEqual(restored.conversation.turns.slice(0, -1), turns);
            assert.equal(restored.conversation.turns.at(-1).user, '给我阅读练习。');
            assert.equal(restored.conversation.turns.at(-1).presentation.id, unit.exercises[0].id);
            assert.equal(restored.reply.text, restored.conversation.turns.at(-1).teacher);
            await h.command('verify'); await h.command('read');
            assert.equal(h.state().conversation.turns.length, turns.length + 1);
            assert.equal(h.counts.provider, calls);
        });
    }
});

test('abandoning an uncertain reply or adopting a different commit never revives its conversation', async t => {
    for (const exit of ['forget-conversation', 'chat', 'adopt-server']) {
        await t.test(exit, async sub => {
            const h = await createClassroomFixture(); sub.after(h.dispose); await h.openLesson();
            h.flags.userFailure = true;
            h.flags.talkTools = [{ name: 'LearningProfileEdit', args: { selfAssessment: '未确认的自评。' } }];
            await h.command('talk', { message: 'PRIVATE_REPLY' });
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
                else { await h.command(exit); }
                h.confirmUser(); await h.command('verify');
            }
            assert.equal(h.state().conversation.turns.length, 0);
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

test('teacher-requested replacement waits for exact-lesson confirmation and keeps the old course on failure', async t => {
    for (const blocked of [false, true]) {
        await t.test(blocked ? 'other-story lesson' : 'current lesson', async sub => {
            const h = await createClassroomFixture(); sub.after(h.dispose); await h.openLesson();
            const old = structuredClone(h.profile().unit);
            if (blocked) { await h.changeChat(); await h.command('teacher', { teacher: { name: '林老师', note: '' } }); }
            h.flags.talkTools = [{ name: 'LearningPresent', args: { kind: 'replacement' } }];
            await h.command('talk', { message: '这课太难了，换成基础句子练习。' });
            const target = h.state().conversation.turns.at(-1).presentation;
            assert.equal(target.kind, 'replacement'); assert.equal(target.unitId, old.id);
            assert.deepEqual(h.profile().unit, old);
            const calls = h.counts.provider;
            await h.command('replace-lesson', { unitId: 'stale-unit', message: target.message });
            assert.equal(h.counts.provider, calls);
            h.flags.providerFailure = true;
            await h.command('replace-lesson', { unitId: target.unitId, message: target.message });
            assert.deepEqual(h.profile().unit, old);
            h.flags.providerFailure = false; h.flags.userRejected = true;
            await h.command('replace-lesson', { unitId: target.unitId, message: target.message });
            assert.deepEqual(h.profile().unit, old);
            h.flags.userRejected = false;
            await h.command('replace-lesson', { unitId: target.unitId, message: target.message });
            assert.notEqual(h.profile().unit.id, old.id);
            const finishedCalls = h.counts.provider;
            await h.command('replace-lesson', { unitId: target.unitId, message: target.message });
            assert.equal(h.counts.provider, finishedCalls);
        });
    }
});
