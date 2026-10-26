import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers';
import { savePlannerResult } from '../ena-planner-save.js';

// Contract: only confirmed saves can release the main request; uncertain writes
// keep their attempted RAM text until read-only recovery proves success/failure.
function fixture(t, { group = false, save = 'ok', read = 'ok' } = {}) {
    const source = { is_user: true, mes: 'input' };
    const state = { identity: 'a', disk: [{ chat_metadata: {} }, structuredClone(source)],
        saves: 0, reads: [], updates: 0, save, read };
    const context = { chat: [source], chatId: 'chat-a', characterId: 0, groupId: group ? 'group-a' : null,
        characters: [{ name: 'fixture', avatar: 'fixture.png' }],
        getRequestHeaders: () => ({}),
        async saveChat() {
            state.saves++;
            if (state.save === 'throw') throw new Error('fixture save failure');
            if (state.save === 'ok' || state.save === 'write-then-throw') {
                state.disk = [{ chat_metadata: {} }, structuredClone(source)];
            }
            if (state.save === 'write-then-throw') throw new Error('fixture lost save response');
        },
    };
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        state.reads.push({ url, body: JSON.parse(options.body) });
        if (state.read === 'fail' || (state.read === 'fail-after-save' && state.saves)) return { ok: false, status: 503 };
        return { ok: true, json: async () => structuredClone(state.disk) };
    });
    const run = { source, sourceText: source.mes, index: 0, chatId: 'a', controller: new AbortController() };
    const host = { getContext: () => context, identity: () => state.identity, update: () => state.updates++ };
    return { source, state, context, run, host, commit: () => savePlannerResult(run, '<plot>plan</plot>', host) };
}

for (const group of [false, true]) test(`confirmed ${group ? 'group' : 'character'} save stays on its original file`, async t => {
    const f = fixture(t, { group });
    await f.commit();
    assert.equal(f.state.saves, 1);
    assert.equal(f.state.updates, 1);
    assert.equal(f.source.mes, 'input\n\n<plot>plan</plot>');
    assert.equal(f.state.disk[1].mes, f.source.mes);
    assert.equal(f.state.reads.length, 2);
    assert.equal(f.state.reads[0].url, group ? '/api/chats/group/get' : '/api/chats/get');
});

for (const mode of ['throw', 'silent']) test(`${mode} save failure rolls back instead of committing on resolved saveChat`, async t => {
    const f = fixture(t, { save: mode });
    await assert.rejects(f.commit(), { code: 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN' });
    assert.equal(f.source.mes, 'input');
    assert.equal(f.context.chat.length, 1);
    assert.equal(f.state.updates, 0);
});

test('a read-back failure blocks the request without undoing a possibly persisted plan', async t => {
    const f = fixture(t, { read: 'fail-after-save' });
    await assert.rejects(f.commit(), { code: 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN' });
    assert.equal(f.source.mes, 'input\n\n<plot>plan</plot>');
    assert.equal(f.source.mes, f.state.disk[1].mes);
    assert.equal(f.run.sourceText, 'input');
    assert.equal(f.run.saveState.status, 'uncertain');
    assert.equal(f.run.saveState.applied, true);
    assert.equal(f.state.updates, 0);
});

test('changed persisted source prevents overwriting an unrelated message', async t => {
    const f = fixture(t);
    f.state.disk[1].mes = 'edited elsewhere';
    await assert.rejects(f.commit(), { code: 'CONFIRMABLE_CHAT_SAVE_BLOCKED' });
    assert.equal(f.state.saves, 0);
    assert.equal(f.source.mes, 'input');
});

for (const action of ['switch', 'cancel', 'edit']) test(`${action} during precondition read cannot start a save`, async t => {
    const f = fixture(t);
    let finish;
    t.mock.method(globalThis, 'fetch', () => new Promise(resolve => { finish = resolve; }));
    const pending = f.commit();
    while (!finish) await new Promise(resolve => setImmediate(resolve));
    if (action === 'switch') f.state.identity = 'b';
    if (action === 'cancel') f.run.controller.abort();
    if (action === 'edit') f.source.mes = 'user edit';
    finish({ ok: true, json: async () => f.state.disk });
    await assert.rejects(pending);
    assert.equal(f.state.saves, 0);
    assert.equal(f.source.mes, action === 'edit' ? 'user edit' : 'input');
});

test('a confirmed original-chat save survives cancellation without updating the new chat', async t => {
    const f = fixture(t);
    const originalSave = f.context.saveChat;
    f.context.saveChat = async () => {
        await originalSave();
        f.state.identity = 'b';
        f.run.controller.abort();
    };
    await assert.rejects(f.commit(), { name: 'AbortError' });
    assert.equal(f.source.mes, f.state.disk[1].mes);
    assert.equal(f.state.updates, 0);
});

test('saving timeout keeps attempted text and blocks rewriting while the host write is pending', async t => {
    const f = fixture(t);
    let entered = false;
    let finishSave;
    f.context.saveChat = () => {
        entered = true;
        f.state.saves++;
        return new Promise(resolve => { finishSave = resolve; });
    };
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const pending = f.commit();
    while (!entered) await new Promise(resolve => setImmediate(resolve));
    t.mock.timers.tick(60_001);
    await assert.rejects(pending, { code: 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN' });
    assert.equal(f.source.mes, 'input\n\n<plot>plan</plot>');
    assert.equal(f.run.sourceText, 'input');
    assert.equal(f.run.saveState.writePending, true);
    await assert.rejects(f.commit(), { code: 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN' });
    assert.equal(f.state.saves, 1);
    assert.equal(f.state.updates, 0);
    // The timed-out operation can still succeed. Retry must only read it back.
    f.state.disk[1] = structuredClone(f.source);
    finishSave();
    await new Promise(resolve => setImmediate(resolve));
    await f.commit();
    assert.equal(f.run.saveState.writePending, false);
    assert.equal(f.run.saveState.status, 'confirmed');
    assert.equal(f.state.saves, 1);
    assert.equal(f.state.updates, 1);
});

for (const group of [false, true]) test(`uncertain ${group ? 'group' : 'character'} success retries read-only using the frozen plan`, async t => {
    const f = fixture(t, { group, read: 'fail-after-save' });
    await assert.rejects(f.commit(), { code: 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN' });
    const target = f.run.saveState.target;
    const reads = f.state.reads.length;
    f.state.read = 'ok';
    await savePlannerResult(f.run, '<plot>must not replace first plan</plot>', f.host);
    assert.equal(f.run.saveState.target, target);
    assert.equal(f.run.saveState.plan, '<plot>plan</plot>');
    assert.equal(f.run.saveState.status, 'confirmed');
    assert.equal(f.run.sourceText, 'input');
    assert.equal(f.source.mes, 'input\n\n<plot>plan</plot>');
    assert.equal(f.state.saves, 1);
    assert.equal(f.state.reads.length, reads + 1);
    assert.deepEqual(f.state.reads.at(-1), f.state.reads[0]);
    await f.commit();
    assert.equal(f.state.saves, 1);
    assert.equal(f.state.reads.length, reads + 2);
});

for (const save of ['throw', 'silent']) test(`a definitely failed ${save} write can retry the same plan`, async t => {
    const f = fixture(t, { save });
    await assert.rejects(f.commit(), { code: 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN' });
    assert.equal(f.run.saveState.status, 'failed');
    assert.equal(f.run.saveState.applied, false);
    assert.equal(f.run.sourceText, 'input');
    f.state.save = 'ok';
    const reads = f.state.reads.length;
    await savePlannerResult(f.run, '<plot>ignored new plan</plot>', f.host);
    assert.equal(f.state.saves, 2);
    assert.equal(f.state.reads.length, reads + 3); // recovery, write precondition, read-back
    assert.equal(f.source.mes, 'input\n\n<plot>plan</plot>');
    assert.equal(f.run.saveState.status, 'confirmed');
});

for (const read of ['fail-after-save', 'mismatch']) test(`retry remains blocked on ${read} without rollback or another write`, async t => {
    const f = fixture(t, { read: 'fail-after-save' });
    await assert.rejects(f.commit());
    if (read === 'mismatch') {
        f.state.read = 'ok';
        f.state.disk[1].mes = 'an unrelated persisted edit';
    }
    await assert.rejects(f.commit(), { code: 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN' });
    assert.equal(f.state.saves, 1);
    assert.equal(f.state.updates, 0);
    assert.equal(f.run.saveState.status, 'uncertain');
    assert.equal(f.run.saveState.applied, true);
    assert.equal(f.run.sourceText, 'input');
    assert.equal(f.source.mes, 'input\n\n<plot>plan</plot>');
});

test('read-only recovery of an initially unreadable failed save permits a new write', async t => {
    const f = fixture(t, { save: 'silent', read: 'fail-after-save' });
    await assert.rejects(f.commit());
    assert.equal(f.run.saveState.applied, true);
    f.state.read = 'ok';
    f.state.save = 'ok';
    await f.commit();
    assert.equal(f.state.saves, 2);
    assert.equal(f.source.mes, f.state.disk[1].mes);
    assert.equal(f.run.sourceText, 'input');
});

test('a save that writes then rejects is successful only after persisted confirmation', async t => {
    const f = fixture(t, { save: 'write-then-throw' });
    await f.commit();
    assert.equal(f.run.saveState.status, 'confirmed');
    assert.equal(f.source.mes, f.state.disk[1].mes);
    assert.equal(f.state.updates, 1);
});

test('a precondition read failure leaves original RAM and permits same-run retry', async t => {
    const f = fixture(t, { read: 'fail' });
    await assert.rejects(f.commit(), { code: 'CONFIRMABLE_CHAT_SAVE_BLOCKED' });
    assert.equal(f.run.saveState.status, 'ready');
    assert.equal(f.run.saveState.applied, false);
    assert.equal(f.run.saveState.attempted, false);
    assert.equal(f.state.saves, 0);
    assert.equal(f.source.mes, 'input');
    f.state.read = 'ok';
    await f.commit();
    assert.equal(f.state.saves, 1);
    assert.equal(f.run.saveState.status, 'confirmed');
});

for (const action of ['switch', 'cancel', 'edit']) test(`${action} while retry reads cannot update or rewrite the chat`, async t => {
    const f = fixture(t, { read: 'fail-after-save' });
    await assert.rejects(f.commit());
    let finish;
    t.mock.method(globalThis, 'fetch', () => new Promise(resolve => { finish = resolve; }));
    const pending = f.commit();
    while (!finish) await new Promise(resolve => setImmediate(resolve));
    if (action === 'switch') f.state.identity = 'b';
    if (action === 'cancel') f.run.controller.abort();
    if (action === 'edit') f.source.mes = 'user edit';
    finish({ ok: true, json: async () => structuredClone(f.state.disk) });
    await assert.rejects(pending, { name: 'AbortError' });
    assert.equal(f.state.saves, 1);
    assert.equal(f.state.updates, 0);
    assert.equal(f.source.mes, action === 'edit' ? 'user edit' : f.state.disk[1].mes);
});

test('an expired host save must settle before an original read permits retry', async t => {
    const f = fixture(t);
    const saveChat = f.context.saveChat;
    let finishSave;
    f.context.saveChat = () => {
        f.state.saves++;
        return new Promise(resolve => { finishSave = resolve; });
    };
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const pending = f.commit();
    while (!finishSave) await new Promise(resolve => setImmediate(resolve));
    t.mock.timers.tick(60_001);
    await assert.rejects(pending, { code: 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN' });
    assert.equal(f.run.saveState.writePending, true);
    assert.equal(f.run.saveState.applied, true);
    finishSave();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(f.run.saveState.writePending, false);
    f.context.saveChat = saveChat;
    await f.commit();
    assert.equal(f.state.saves, 2);
    assert.equal(f.run.saveState.status, 'confirmed');
    assert.equal(f.source.mes, f.state.disk[1].mes);
});

test('read-only success restores original RAM after a previously confirmed failure', async t => {
    const f = fixture(t, { save: 'silent' });
    await assert.rejects(f.commit());
    assert.equal(f.source.mes, 'input');
    f.state.disk[1].mes = f.run.saveState.text;
    await f.commit();
    assert.equal(f.run.saveState.status, 'confirmed');
    assert.equal(f.run.saveState.applied, true);
    assert.equal(f.state.saves, 1);
    assert.equal(f.source.mes, f.state.disk[1].mes);
});

test('original source including trailing whitespace never becomes the attempted text', async t => {
    const f = fixture(t, { read: 'fail-after-save' });
    f.run.sourceText = f.source.mes = 'input  \n';
    f.state.disk[1].mes = f.source.mes;
    await assert.rejects(f.commit());
    assert.equal(f.run.sourceText, 'input  \n');
    assert.equal(f.source.mes, 'input\n\n<plot>plan</plot>');
    f.state.read = 'ok';
    await f.commit();
    assert.equal(f.run.sourceText, 'input  \n');
    assert.equal(f.state.saves, 1);
});

test('concurrent calls on the same run serialize and never duplicate the write', async t => {
    const f = fixture(t);
    await Promise.all([f.commit(), f.commit()]);
    assert.equal(f.state.saves, 1);
    assert.equal(f.state.reads.length, 3);
    assert.equal(f.run.saveState.status, 'confirmed');
});
