import assert from 'node:assert/strict';
import test from 'node:test';

import { createSillyTavernUserJsonFilePort } from '../storage/sillytavern-file-storage.js';
import { createLearningRepository } from '../apps/learning/storage/repository.js';
import { LEARNING_FILENAME, parseLearningDocument } from '../apps/learning/storage/document.js';

const profile = (language = 'en', description = '读懂英文报道') => ({
    language, explanationLanguage: 'zh-CN', selfAssessment: '不确定',
    goal: { description, exam: null, targetLevel: null, targetDate: null },
    unit: null, items: [], completions: [],
});
const data = (...profiles) => ({ profiles });

// HTTP-boundary fault injection: exercise the production UTF-8 upload/no-store read adapter.
function harness() {
    const state = { file: null, uploads: [], requests: [], read: null, upload: null };
    const request = async (url, options) => {
        state.requests.push({ url, options });
        if (options.method === 'POST') {
            const body = JSON.parse(options.body);
            assert.equal(body.name, LEARNING_FILENAME);
            const document = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(body.data), char => char.charCodeAt(0))));
            state.uploads.push(document);
            if (state.upload) { return state.upload(document); }
            state.file = structuredClone(document);
            return new Response('{}', { status: 200 });
        }
        assert.equal(options.cache, 'no-store');
        assert.match(url, /^\/user\/files\/LittleWhiteBox_Learning.json\?v=/);
        if (state.read) { return state.read(); }
        return new Response(state.file === null ? '' : JSON.stringify(state.file), { status: state.file === null ? 404 : 200 });
    };
    let id = 0;
    const files = createSillyTavernUserJsonFilePort({ fetch: request });
    const make = () => createLearningRepository(files, { createId: () => `commit-${++id}` });
    return { state, make, repository: make() };
}

test('learning profiles survive reopening; reading empty storage does not create a file', async () => {
    const { state, repository, make } = harness();
    assert.deepEqual(await repository.read(), { status: 'ready', document: null });
    assert.equal(state.uploads.length, 0);
    const original = data(profile());
    const first = await repository.save(null, original, () => true);
    original.profiles[0].goal.description = '修改调用方对象';
    assert.equal(first.status, 'confirmed');
    assert.equal(first.document.data.profiles[0].goal.description, '读懂英文报道');
    assert.deepEqual((await make().read()).document, first.document);
    const second = await repository.save(first.document, data(profile(), profile('ja', '日常阅读')), () => true);
    assert.equal(second.document.revision, 2);
    assert.deepEqual(second.document.data.profiles.map(item => item.language), ['en', 'ja']);
    const noChange = await repository.save(second.document, second.document.data, () => true);
    assert.equal(noChange.status, 'unchanged');
    assert.equal(state.uploads.length, 2);
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
    const document = { schemaVersion: 1, revision: 1, commitId: 'one', data: data(profile()) };
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
    const initial = await repository.save(null, data(profile()), () => true);
    state.upload = () => { throw new TypeError('response lost'); };
    const saved = await repository.save(initial.document, data(profile('ja')), () => true);
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
    state.upload = document => { state.file = structuredClone(document); throw new TypeError('disconnected'); };
    assert.equal((await repository.save(null, data(profile()), () => true)).status, 'confirmed');
    assert.equal(state.uploads.length, 1);
});

test('definite HTTP rejection is retryable by the user, whereas 408/429/5xx need verification', async () => {
    for (const status of [400, 403, 408, 429, 500]) {
        const { state, repository } = harness();
        state.upload = () => new Response('do not expose this response', { status });
        const attempt = repository.save(null, data(profile()), () => true);
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
    }
});

test('queued stale edits are cancelled locally; cancellation after send still confirms facts', async () => {
    const { state, repository } = harness();
    let active = false;
    assert.equal((await repository.save(null, data(profile()), () => active)).status, 'cancelled');
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
    const afterSend = await repository.save(adopted.document, data(profile('ja')), () => active);
    assert.equal(afterSend.status, 'confirmed');
    assert.equal(state.uploads.length, 2);
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
