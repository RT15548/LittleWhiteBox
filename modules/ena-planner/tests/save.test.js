import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers';
import { savePlannerResult } from '../ena-planner-save.js';

// Contract: only confirmed saves can release the main request; failed writes
// preserve the user floor, and a delayed save never targets a different chat.
function fixture(t, { group = false, save = 'ok', read = 'ok' } = {}) {
    const source = { is_user: true, mes: 'input' };
    const state = { identity: 'a', disk: [{ chat_metadata: {} }, structuredClone(source)], saves: 0, reads: [], updates: 0 };
    const context = { chat: [source], chatId: 'chat-a', characterId: 0, groupId: group ? 'group-a' : null,
        characters: [{ name: 'fixture', avatar: 'fixture.png' }],
        getRequestHeaders: () => ({}),
        async saveChat() {
            state.saves++;
            if (save === 'throw') throw new Error('fixture save failure');
            if (save === 'ok') state.disk = [{ chat_metadata: {} }, structuredClone(source)];
        },
    };
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        state.reads.push({ url, body: JSON.parse(options.body) });
        if (read === 'fail-after-save' && state.saves) return { ok: false, status: 503 };
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

test('a read-back failure cannot be interpreted as success', async t => {
    const f = fixture(t, { read: 'fail-after-save' });
    await assert.rejects(f.commit(), { code: 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN' });
    assert.equal(f.source.mes, 'input');
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

test('saving timeout does not release the request or leave a temporary plan in RAM', async t => {
    const f = fixture(t);
    let entered = false;
    f.context.saveChat = () => { entered = true; return new Promise(() => {}); };
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const pending = f.commit();
    while (!entered) await new Promise(resolve => setImmediate(resolve));
    t.mock.timers.tick(60_001);
    await assert.rejects(pending, { code: 'CONFIRMABLE_CHAT_SAVE_UNCERTAIN' });
    assert.equal(f.source.mes, 'input');
    assert.equal(f.state.updates, 0);
});
