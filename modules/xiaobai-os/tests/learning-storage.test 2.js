import assert from 'node:assert/strict';
import test from 'node:test';

import { createSillyTavernUserJsonFilePort } from '../storage/sillytavern-file-storage.js';
import { createLearningRepository } from '../apps/learning/storage/repository.js';
import { LEARNING_FILENAME, parseLearningDocument } from '../apps/learning/storage/document.js';

const profile = (language = 'en', description = '读懂英文报道') => ({
    language, explanationLanguage: 'zh-CN', selfAssessment: '不确定', level: null, interests: null,
    goal: { description, exam: null, targetLevel: null, targetDate: null },
    unit: null, review: null, items: [], completions: [],
});
const data = (...profiles) => ({ profiles });

// HTTP-boundary fault injection: exercise the production UTF-8 upload/no-store read adapter.
function harness() {
    const state = { file: null, rawText: null, uploads: [], requests: [], read: null, upload: null };
    const request = async (url, options) => {
        state.requests.push({ url, options });
        if (options.method === 'POST') {
            const body = JSON.parse(options.body);
            assert.equal(body.name, LEARNING_FILENAME);
            const document = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(body.data), char => char.charCodeAt(0))));
            state.uploads.push(document);
            if (state.upload) { return state.upload(document); }
            state.file = structuredClone(document);
            state.rawText = null;
            return new Response('{}', { status: 200 });
        }
        assert.equal(options.cache, 'no-store');
        assert.match(url, /^\/user\/files\/LittleWhiteBox_Learning.json\?v=/);
        if (state.read) { return state.read(); }
        if (state.rawText !== null) { return new Response(state.rawText); }
        return new Response(state.file === null ? '' : JSON.stringify(state.file), { status: state.file === null ? 404 : 200 });
    };
    let id = 0;
    const files = createSillyTavernUserJsonFilePort({ fetch: request });
    const make = () => createLearningRepository(files, { createId: () => `commit-${++id}` });
    return { state, make, repository: make() };
}

test('learning profiles survive reopening; reading empty storage does not create a file', async () => {
    const { state, repository, make } = harness();
    const receipts = [];
    assert.deepEqual(await repository.read(), { status: 'ready', document: null });
    assert.equal(state.uploads.length, 0);
    const original = data(profile());
    const first = await repository.save(null, original, () => true, receipt => receipts.push(receipt));
    original.profiles[0].goal.description = '修改调用方对象';
    assert.equal(first.status, 'confirmed');
    assert.equal(first.document.data.profiles[0].goal.description, '读懂英文报道');
    assert.deepEqual((await make().read()).document, first.document);
    const second = await repository.save(first.document, data(profile(), profile('ja', '日常阅读')), () => true);
    assert.equal(second.document.revision, 2);
    assert.deepEqual(second.document.data.profiles.map(item => item.language), ['en', 'ja']);
    const noChange = await repository.save(second.document, second.document.data, () => true, receipt => receipts.push(receipt));
    assert.equal(noChange.status, 'unchanged');
    assert.equal(state.uploads.length, 2);
    assert.deepEqual(receipts, [first, noChange]);
});

test('invalid files and failed reads are not converted into empty writable profiles', async () => {
    for (const response of [() => new Response('{'), () => new Response('{"schemaVersion":99}'),
        () => new Response('private upstream response', { status: 503 })]) {
        const { state, repository } = harness();
        state.read = response;
        await assert.rejects(repository.read(), error => /learning_(read_failed|file_invalid)/.test(error.code));
        await assert.rejects(repository.save(null, data(profile()), () => true));
        assert.equal(state.uploads.length, 0);
        assert.equal(repository.snapshot().document, undefined);
    }
});

test('stored documents validate facts, not prompt budgets, and reject unsupported data', () => {
    const document = { schemaVersion: 2, revision: 1, commitId: 'one', data: data(profile()) };
    document.data.profiles[0].goal.description = '<>&'.repeat(250);
    assert.deepEqual(parseLearningDocument(document), document);
    for (const bad of [
        { ...document, prompt: 'instruction' },
        { ...document, revision: Infinity },
        { ...document, data: data(profile('en'), profile('EN')) },
        { ...document, data: data({ ...profile(), language: '../chat' }) },
        { ...document, data: data({ ...profile(), goal: { ...profile().goal, targetDate: '2026-02-30' } }) },
    ]) { assert.throws(() => parseLearningDocument(bad)); }
});

test('explicit reset replaces an invalid learning file with a writable empty document', async () => {
    const { state, repository, make } = harness();
    state.file = { schemaVersion: 99 };
    await assert.rejects(repository.read(), { code: 'learning_file_invalid' });
    assert.equal(repository.snapshot().status, 'invalid');
    assert.equal(state.uploads.length, 0);
    const result = await repository.resetInvalid(() => true);
    assert.equal(result.status, 'confirmed');
    assert.deepEqual((await make().read()).document.data, { profiles: [] });
    assert.equal(repository.snapshot().status, 'ready');
    assert.equal((await repository.save(result.document, data(profile()), () => true)).status, 'confirmed');
});

test('malformed JSON and truncated files expose the same explicit reset as invalid learning documents', async () => {
    for (const rawText of ['{', '']) {
        const { state, repository, make } = harness();
        state.rawText = rawText;
        await assert.rejects(repository.read(), { code: 'learning_file_invalid' });
        assert.equal(repository.snapshot().status, 'invalid');
        assert.equal(state.uploads.length, 0);
        assert.equal((await repository.resetInvalid(() => true)).status, 'confirmed');
        assert.deepEqual((await make().read()).document.data, { profiles: [] });
    }
});

test('reset does not erase a repaired file, write after cancellation, or mistake a failed read for invalid data', async () => {
    for (const scenario of ['repaired', 'cancelled', 'read-failed']) {
        const { state, repository } = harness();
        state.file = { schemaVersion: 99 };
        await assert.rejects(repository.read());
        if (scenario === 'repaired') { state.file = { schemaVersion: 2, revision: 2, commitId: 'repaired', data: data(profile()) }; }
        if (scenario === 'read-failed') {
            state.read = () => new Response('', { status: 503 });
            await assert.rejects(repository.resetInvalid(() => true), { code: 'learning_read_failed' });
        } else {
            assert.equal((await repository.resetInvalid(() => scenario !== 'cancelled')).status, 'cancelled');
        }
        assert.equal(state.uploads.length, 0);
        if (scenario === 'repaired') { assert.deepEqual(repository.snapshot().document, state.file); }
    }
});

test('an uncertain reset can be verified or retried without overwriting a changed file', async () => {
    for (const recovery of ['verify', 'retry', 'conflict']) {
        const { state, repository } = harness();
        state.file = { schemaVersion: 99 };
        await assert.rejects(repository.read());
        state.upload = () => { throw new TypeError('lost receipt'); };
        const result = await repository.resetInvalid(() => true);
        assert.equal(result.status, 'unconfirmed');
        assert.equal(repository.snapshot().status, 'unconfirmed');
        const candidate = state.uploads[0];
        if (recovery === 'verify') {
            state.file = candidate;
            assert.equal((await repository.verify()).status, 'confirmed');
            assert.equal(state.uploads.length, 1);
        } else if (recovery === 'retry') {
            state.upload = null;
            assert.equal((await repository.retry(() => true)).status, 'confirmed');
            assert.deepEqual(state.uploads[1], candidate);
        } else {
            state.file = { schemaVersion: 100 };
            assert.equal((await repository.retry(() => true)).status, 'conflict');
            assert.equal(state.uploads.length, 1);
            assert.equal(repository.snapshot().status, 'invalid');
            state.upload = null;
            assert.equal((await repository.resetInvalid(() => true)).status, 'confirmed');
            assert.deepEqual(state.uploads[1], candidate);
        }
    }
});

test('a malformed reset conflict is recoverable, but offline or repaired files are never overwritten', async () => {
    for (const recovery of ['reset', 'repaired', 'offline', 'late-confirmation']) {
        const { state, repository } = harness();
        state.rawText = '{';
        await assert.rejects(repository.read());
        state.upload = () => { throw new TypeError('lost receipt'); };
        assert.equal((await repository.resetInvalid(() => true)).status, 'unconfirmed');
        state.rawText = '';
        assert.equal((await repository.verify()).status, 'conflict');
        assert.equal(repository.snapshot().status, 'invalid');
        const candidate = state.uploads[0];
        state.upload = null;
        if (recovery === 'offline') {
            state.read = () => new Response('', { status: 503 });
            await assert.rejects(repository.resetInvalid(() => true), { code: 'learning_read_failed' });
            assert.equal(state.uploads.length, 1);
        } else if (recovery === 'repaired' || recovery === 'late-confirmation') {
            state.rawText = null;
            state.file = recovery === 'repaired'
                ? { schemaVersion: 2, revision: 3, commitId: 'repaired', data: data(profile()) } : candidate;
            assert.equal((await repository.resetInvalid(() => true)).status, recovery === 'repaired' ? 'cancelled' : 'confirmed');
            assert.deepEqual(repository.snapshot().document, state.file);
            assert.equal(state.uploads.length, 1);
        } else {
            assert.equal((await repository.resetInvalid(() => true)).status, 'confirmed');
            assert.deepEqual(state.file, candidate);
            assert.equal(state.uploads.length, 2);
        }
    }
});

test('reset abandons an ordinary uncertain edit only while the server file remains invalid', async () => {
    for (const recovery of ['reset', 'reset-receipt-lost', 'repaired', 'late-confirmation', 'offline']) {
        const { state, repository } = harness();
        const receipts = []; const resets = [];
        const initial = await repository.save(null, data(profile()), () => true);
        state.upload = () => { throw new TypeError('lost receipt'); };
        await repository.save(initial.document, data(profile('ja')), () => true, receipt => receipts.push(receipt));
        const edit = state.uploads.at(-1);
        state.rawText = '{';
        assert.equal((await repository.verify()).status, 'conflict');
        assert.equal(repository.snapshot().status, 'invalid');
        const writes = state.uploads.length;
        assert.equal((await repository.retry(() => true)).status, 'conflict');
        assert.equal(state.uploads.length, writes);
        state.upload = null;
        if (recovery === 'offline') {
            state.read = () => new Response('', { status: 503 });
            await assert.rejects(repository.resetInvalid(() => true), { code: 'learning_read_failed' });
            assert.equal(state.uploads.length, writes);
        } else if (recovery === 'repaired' || recovery === 'late-confirmation') {
            state.rawText = null;
            state.file = recovery === 'repaired' ? initial.document : edit;
            const result = await repository.resetInvalid(() => true, receipt => resets.push(receipt));
            assert.equal(result.status, recovery === 'repaired' ? 'cancelled' : 'confirmed');
            assert.deepEqual(repository.snapshot().document, state.file);
            assert.equal(state.uploads.length, writes);
            assert.deepEqual(resets, []);
        } else {
            if (recovery === 'reset-receipt-lost') { state.upload = () => { throw new TypeError('reset receipt lost'); }; }
            await repository.resetInvalid(() => true, receipt => resets.push(receipt));
            const reset = state.uploads.at(-1);
            assert.notEqual(reset.commitId, edit.commitId);
            assert.deepEqual(reset.data, { profiles: [] });
            if (recovery === 'reset-receipt-lost') {
                state.rawText = null; state.file = reset;
                assert.equal((await repository.verify()).status, 'confirmed');
            }
            assert.equal(repository.snapshot().status, 'ready');
            assert.equal(resets.length, 1);
            assert.deepEqual(repository.snapshot().document.data, { profiles: [] });
        }
        assert.equal(receipts.length, recovery === 'late-confirmation' ? 1 : 0);
    }
});

test('confirmed uploads and ordinary reads reuse the session; only explicit refresh downloads again', async () => {
    const { state, repository } = harness();
    const saved = await repository.save(null, data(profile()), () => true);
    assert.equal(saved.status, 'confirmed');
    assert.equal(state.requests.length, 2); // initial load + upload, no success read-back
    state.file = { ...state.file, commitId: 'server-edit', data: data(profile('ja')) };
    assert.equal((await repository.read()).document.data.profiles[0].language, 'en');
    assert.equal(state.requests.length, 2);
    assert.equal((await repository.refresh()).document.data.profiles[0].language, 'ja');
    assert.equal(state.requests.length, 3);
});

test('unknown writes keep the old facts; ordinary reads do not retry; recovery has an adoption exit', async () => {
    const { state, repository } = harness();
    const receipts = [];
    const initial = await repository.save(null, data(profile()), () => true);
    state.upload = () => { throw new TypeError('response lost'); };
    const saved = await repository.save(initial.document, data(profile('ja')), () => true, receipt => receipts.push(receipt));
    assert.equal(saved.status, 'unconfirmed');
    assert.deepEqual(repository.snapshot().document, initial.document);
    const reads = state.requests.length;
    assert.equal((await repository.read()).status, 'unconfirmed');
    assert.equal((await repository.refresh()).status, 'unconfirmed');
    assert.equal(state.requests.length, reads);
    await assert.rejects(repository.clear(initial.document, () => true), { code: 'learning_resolve_pending_first' });
    state.file = { ...initial.document, revision: 2, commitId: 'other-writer' };
    assert.equal((await repository.verify()).status, 'conflict');
    assert.equal((await repository.adoptServer()).status, 'ready');
    assert.equal(state.uploads.length, 2);
    assert.equal(repository.snapshot().document.commitId, 'other-writer');
    assert.deepEqual(receipts, []);
    assert.equal((await repository.clear(repository.snapshot().document, () => true)).status, 'unconfirmed');
});

test('an unchanged server baseline permits explicit retry of exactly the original candidate', async () => {
    const { state, repository } = harness();
    const initial = await repository.save(null, data(profile()), () => true);
    state.upload = () => { throw new TypeError('response lost before persistence'); };
    assert.equal((await repository.save(initial.document, data(profile('ja')), () => true)).status, 'unconfirmed');
    const candidate = structuredClone(state.uploads.at(-1));
    state.read = () => { throw new Error('offline'); };
    assert.equal((await repository.retry(() => true)).status, 'unconfirmed');
    assert.equal(state.uploads.length, 2);
    state.read = null; state.upload = null;
    const requests = state.requests.length;
    assert.equal((await repository.retry(() => true)).status, 'confirmed');
    assert.deepEqual(state.uploads.at(-1), candidate);
    assert.equal(state.requests.length - requests, 2); // one verification, one upload
    assert.equal(repository.snapshot().document.data.profiles[0].language, 'ja');
});

test('response loss after writing confirms the saved file without resending', async () => {
    const { state, repository } = harness();
    const receipts = [];
    state.upload = document => { state.file = structuredClone(document); throw new TypeError('disconnected'); };
    const result = await repository.save(null, data(profile()), () => true, receipt => receipts.push(receipt));
    assert.equal(result.status, 'confirmed');
    await repository.verify(); await repository.refresh();
    assert.deepEqual(receipts, [result]);
    assert.equal(state.uploads.length, 1);
});

test('definite HTTP rejection is retryable by the user, whereas 408/429/5xx need verification', async () => {
    for (const status of [400, 403, 408, 429, 500]) {
        const { state, repository } = harness();
        state.upload = () => new Response('do not expose this response', { status });
        const receipts = [];
        const attempt = repository.save(null, data(profile()), () => true, receipt => receipts.push(receipt));
        if (status === 400 || status === 403) {
            await assert.rejects(attempt, { code: 'learning_write_rejected', message: 'learning_write_rejected' });
            state.upload = null;
            assert.equal((await repository.save(null, data(profile()), () => true)).status, 'confirmed');
        } else {
            assert.equal((await attempt).status, 'unconfirmed');
            state.read = () => { throw new Error('cannot verify'); };
            assert.equal((await repository.retry(() => true)).status, 'unconfirmed');
            assert.equal(state.uploads.length, 1);
        }
        assert.deepEqual(receipts, []);
    }
});

test('queued stale edits are cancelled locally; cancellation after send still confirms facts', async () => {
    const { state, repository } = harness();
    const receipts = [];
    let active = false;
    assert.equal((await repository.save(null, data(profile()), () => active, receipt => receipts.push(receipt))).status, 'cancelled');
    assert.deepEqual(receipts, []);
    assert.equal(state.requests.length, 0);
    active = true;
    const first = repository.save(null, data(profile()), () => active);
    const second = repository.save(null, data(profile('ja')), () => active);
    assert.equal((await first).status, 'confirmed');
    assert.equal((await second).status, 'cancelled');
    const adopted = repository.snapshot();
    assert.equal(adopted.status, 'ready');
    assert.equal(state.requests.length, 2);
    state.upload = document => { active = false; state.file = document; return new Response('{}'); };
    const afterSend = await repository.save(adopted.document, data(profile('ja')), () => active, receipt => receipts.push(receipt));
    assert.equal(afterSend.status, 'confirmed');
    assert.equal(state.uploads.length, 2);
    assert.deepEqual(receipts, [afterSend]);
});

test('clearing user assets is an explicit confirmed write and never touches a chat file', async () => {
    const { state, repository, make } = harness();
    const saved = await repository.save(null, data(profile()), () => true);
    assert.equal((await repository.clear(saved.document, () => true)).status, 'confirmed');
    assert.deepEqual((await make().read()).document.data, { profiles: [] });
    assert.equal(state.uploads.length, 2);
});

test('slow learning uploads wait for the actual ACK without a timed retry or read-back', async t => {
    const { state, repository } = harness();
    await repository.read();
    t.mock.timers.enable({ apis: ['setTimeout'] });
    let release, finished = false;
    state.upload = () => new Promise(resolve => { release = resolve; });
    const saving = repository.save(null, data(profile()), () => true).then(result => { finished = true; return result; });
    while (!release) { await Promise.resolve(); }
    t.mock.timers.tick(20_000); await Promise.resolve();
    assert.equal(finished, false); assert.equal(state.requests.length, 2);
    release(new Response('{}'));
    assert.equal((await saving).status, 'confirmed');
    assert.equal(state.requests.length, 2);
});

// A v1 file as the first release wrote it: one lesson unit, several skill books and a paid completion.
const v1Evidence = {
    unitId: 'old-unit', scope: { kind: 'public' },
    exercise: { id: 'q1', skill: 'grammar', materialIds: [], prompt: 'Correct the verb.', response: { kind: 'text' }, rule: { kind: 'semantic' }, hint: '' },
    materials: [],
    attempt: { id: 'a1', exerciseId: 'q1', answer: { kind: 'text', text: 'He went home.' }, submittedAt: '2026-08-01T08:00:00.000Z',
        help: { answer: false, hint: false, feedback: false, transcript: false, replays: 0, slowPlayback: false }, scope: { kind: 'public' } },
    assessment: { attemptId: 'a1', verdict: 'correct', understanding: '', expression: '', guidance: '正确。', scope: { kind: 'public' } },
};
const v1Profile = () => ({
    language: 'en', explanationLanguage: 'zh-CN', selfAssessment: '初学', goal: { description: '读新闻', exam: null, targetLevel: 'B2', targetDate: null },
    unit: { id: 'old-unit', title: '旧课' },
    items: [
        { id: 'g1', label: 'past simple', scope: { kind: 'public' }, skill: 'grammar', evidence: [v1Evidence] },
        { id: 'r1', label: 'main idea', scope: { kind: 'public' }, skill: 'reading', evidence: [] },
        { id: 'v1', label: 'shade', scope: { kind: 'public' }, skill: 'vocabulary', evidence: [] },
    ],
    completions: [{ unitId: 'older', completedAt: '2026-08-01T08:00:00.000Z' }],
});
const v1Document = () => ({ schemaVersion: 1, revision: 3, commitId: 'v1-commit', data: { profiles: [v1Profile()] } });

test('a v1 file upgrades once: settings and grammar/vocabulary books stay, each due at the upgrade time', () => {
    const upgradedAt = '2026-09-30T08:00:00.000Z';
    const document = parseLearningDocument(v1Document(), () => upgradedAt);
    assert.equal(document.schemaVersion, 2);
    assert.equal(document.revision, 3);
    const [profile] = document.data.profiles;
    assert.deepEqual([profile.selfAssessment, profile.goal.targetLevel, profile.level, profile.interests], ['初学', 'B2', null, null]);
    assert.deepEqual([profile.unit, profile.review, profile.completions], [null, null, []]);
    assert.deepEqual(profile.items.map(item => item.id), ['g1', 'v1']);
    assert.deepEqual(profile.items[0].evidence, [v1Evidence]);
    for (const item of profile.items) {
        assert.deepEqual(item.schedule, { ef: 2.5, repetitions: 0, intervalDays: 0, dueAt: upgradedAt, lastAttemptId: null, lastQuality: null });
    }
    assert.deepEqual(parseLearningDocument(document), document);
    assert.throws(() => parseLearningDocument({ ...v1Document(), schemaVersion: 3 }));
    assert.throws(() => parseLearningDocument({ ...v1Document(), data: { profiles: [{ ...v1Profile(), mood: 'x' }] } }), /mood/);
    // A v2 file is not upgraded: missing v2 fields are an error, not a silent default.
    assert.throws(() => parseLearningDocument({ ...v1Document(), schemaVersion: 2 }));
});

test('rereading a v1 file gives the same document, and the next save writes v2', async () => {
    const { state } = harness();
    state.file = v1Document();
    let tick = 0;
    const files = createSillyTavernUserJsonFilePort({ fetch: async (url, options) => {
        if (options.method === 'POST') {
            state.file = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(JSON.parse(options.body).data), char => char.charCodeAt(0))));
            state.uploads.push(state.file);
            return new Response('{}');
        }
        return new Response(JSON.stringify(state.file));
    } });
    const repository = createLearningRepository(files, { createId: () => 'commit-v2', now: () => new Date(Date.UTC(2026, 8, 30, 8, tick++)).toISOString() });
    const first = (await repository.read()).document;
    assert.equal(first.data.profiles[0].items[0].schedule.dueAt, '2026-09-30T08:00:00.000Z');
    const again = await repository.refresh();
    assert.equal(again.status, 'ready');
    assert.deepEqual(again.document, first);
    assert.equal(state.uploads.length, 0);
    const data = structuredClone(first.data);
    data.profiles[0].interests = '城市';
    assert.equal((await repository.save(first, data, () => true)).status, 'confirmed');
    assert.equal(state.file.schemaVersion, 2);
    assert.equal(state.file.revision, 4);
    assert.equal(state.file.data.profiles[0].interests, '城市');
});
