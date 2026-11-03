import assert from 'node:assert/strict';
import test from 'node:test';
import { journey } from './fixtures/expedition-traveler.js';
import { ref } from 'vue';
import { createExpeditionClient } from '../apps/game/expedition/client.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
const state = (revision, fileRevision = revision) => ({ data: { ...emptyExpedition(), revision }, fileRevision, balance: 100, ready: true, pending: false, writeState: 'ready', memories: {} });
function fixture(handler) {
    let listener;
    const requests = [], bridge = { subscribe(fn) { listener = fn; return () => { listener = null; }; },
        async request(type, payload) { const cloned = structuredClone(payload); requests.push({ type, payload: cloned }); return handler(type, cloned); } };
    const client = createExpeditionClient(bridge, 'chat-a');
    return { client, requests, push(next, chatIdentity = 'chat-a') { listener?.({ type: 'game/expedition/state', payload: { chatIdentity, state: next } }); } };
}
test('ordinary loading and saving are not error notices; unresolved persistence stays visible', async () => {
    const h = fixture(async () => ({ result: state(0) })); await h.client.read();
    for (const writeState of ['loading', 'saving']) {
        h.push({ ...state(0), writeState, pending: true });
        assert.equal(h.client.notice.value, ''); assert.equal(h.client.blocked.value, true);
    }
    for (const writeState of ['failed', 'conflict', 'unconfirmed']) {
        h.push({ ...state(0), writeState }); assert.notEqual(h.client.notice.value, '');
    }
    h.push(state(0)); assert.equal(h.client.notice.value, ''); h.client.dispose();
});

test('reactive loadout selections cross the real structured-clone boundary as plain protocol data', async () => {
    const h = fixture(async type => ({ result: state(type.endsWith('/act') ? 1 : 0) }));
    await h.client.read(); const equipped = ref(['cinder']);
    assert.equal(await h.client.act({ type: 'loadout', equipped: equipped.value }), true);
    assert.deepEqual(h.requests[1].payload.command.equipped, ['cinder']); assert.equal(h.client.view.value.data.revision, 1); h.client.dispose();
});
test('lost response recovery retries only the same action when storage has not advanced', async () => {
    let attempts = 0;
    const h = fixture(async type => {
        if (type.endsWith('/act') && ++attempts === 1) throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' });
        return { result: state(type.endsWith('/act') ? 1 : 0) };
    });
    await h.client.read(); assert.equal(await h.client.act({ type: 'start', weapon: 'blade', outfit: 'traveler', ...journey }), false);
    assert.equal(h.client.blocked.value, true); assert.equal(await h.client.recover(), true);
    const writes = h.requests.filter(r => r.type.endsWith('/act')); assert.deepEqual(writes[0].payload, writes[1].payload); assert.equal(h.client.failed.value, null);
    h.client.dispose();
});
test('confirmed late state and unrelated chats cannot cause repeated or rolled-back progress', async () => {
    let revision = 0;
    const h = fixture(async type => {
        if (type.endsWith('/act')) { revision = 1; h.push(state(1)); throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' }); }
        return { result: state(revision) };
    });
    await h.client.read(); await h.client.act({ type: 'start', weapon: 'blade', outfit: 'traveler', ...journey }); await h.client.recover();
    assert.equal(h.requests.filter(r => r.type.endsWith('/act')).length, 1);
    h.push(state(4), 'chat-b'); h.push(state(0)); assert.equal(h.client.view.value.data.revision, 1);
    h.client.dispose(); h.push(state(9)); assert.equal(h.client.view.value.data.revision, 1);
});

test('a business rejection never becomes a saved operation that is blindly retried', async () => {
    const h = fixture(async type => { if (type.endsWith('/act')) throw Object.assign(new Error('locked'), { code: 'expedition_locked' }); return { result: state(0) }; });
    await h.client.read(); await h.client.act({ type: 'start', weapon: 'bow', outfit: 'traveler', ...journey });
    assert.equal(h.client.failed.value, null); await h.client.recover(); assert.equal(h.requests.filter(r => r.type.endsWith('/act')).length, 1); h.client.dispose();
});

test('memory-only file updates win over older read responses or pushes without changing the game revision', async () => {
    let reply = state(4, 8), pushed;
    const h = fixture(async () => { if (pushed) h.push(pushed); return { result: reply }; });
    await h.client.read();
    pushed = state(4, 8); reply = state(4, 9); await h.client.read();
    assert.equal(h.client.view.value.fileRevision, 9);
    h.push(state(4, 8)); assert.equal(h.client.view.value.fileRevision, 9);
    pushed = state(4, 10); await h.client.read(); assert.equal(h.client.view.value.fileRevision, 10);
    assert.equal(h.client.view.value.data.revision, 4); h.client.dispose();
});

test('conversation errors can be dismissed without a file operation, but unknown saves cannot', async () => {
    const h = fixture(async type => {
        if (type.endsWith('/talk')) { throw Object.assign(new Error('not configured'), { code: 'expedition_agent_not_configured' }); }
        if (type.endsWith('/act')) { throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' }); }
        return { result: state(0) };
    });
    await h.client.read(); await h.client.talk('sanniang', 'Hello');
    assert.equal(h.client.recoveryRequired.value, false); h.client.dismissError(); assert.equal(h.client.notice.value, '');
    await h.client.act({ type: 'start', weapon: 'blade', outfit: 'traveler', ...journey });
    assert.equal(h.client.recoveryRequired.value, true); h.client.dismissError(); assert.notEqual(h.client.notice.value, '');
    assert.equal(h.requests.length, 3); h.client.dispose();
});
