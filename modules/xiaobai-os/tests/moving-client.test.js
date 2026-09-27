import assert from 'node:assert/strict';
import test from 'node:test';
import { createMovingClient } from '../apps/game/moving/client.ts';
import { challengeProgress, emptyMoving } from '../apps/game/moving/domain.ts';
const state = (extra = {}) => ({ revision: 0, completed: [], active: null, board: null, balance: 100,
    award: 0, challenge: challengeProgress(emptyMoving()), writeState: 'ready', pending: false, ready: true, ...extra });
function harness() {
    let subscriber, handler = async () => ({ result: state() });
    const calls = [];
    const client = createMovingClient({
        subscribe(fn) { subscriber = fn; return () => { subscriber = null; }; },
        request(type, payload) { calls.push({ type, payload }); return handler(type, payload); },
    }, 'chat-a');
    return { client, calls, handle(fn) { handler = fn; }, push(value, chatIdentity = 'chat-a') { subscriber?.({ type: 'game/moving/state', payload: { chatIdentity, state: value } }); } };
}
test('a newer host push survives a late reply; wrong-chat pushes and disposed replies cannot replace state', async () => {
    const h = harness(); await h.client.read();
    let finish;
    h.handle(() => new Promise(resolve => { finish = resolve; }));
    const read = h.client.read();
    h.push(state({ revision: 2, balance: 150 }));
    finish({ result: state({ revision: 1 }) }); await read;
    assert.equal(h.client.view.value.revision, 2);
    assert.equal(h.client.view.value.balance, 150);
    h.push(state({ revision: 99 }), 'chat-b');
    assert.equal(h.client.view.value.revision, 2);
    const late = h.client.read(); h.client.dispose(); finish({ result: state({ revision: 3 }) }); await late;
    assert.equal(h.client.view.value.revision, 2);
});
test('uncertain admission freezes new actions and confirmation never buys a second run', async () => {
    const h = harness(); await h.client.read();
    h.handle(async () => { throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' }); });
    await h.client.act({ type: 'challenge' });
    const original = h.calls.at(-1).payload;
    assert.equal(h.client.blocked.value, true);
    await h.client.act({ type: 'challenge' });
    assert.equal(h.calls.length, 2);
    h.handle(async () => ({ result: state({ revision: 1, balance: 50 }) }));
    await h.client.recover();
    assert.equal(h.calls.length, 3);
    assert.equal(h.client.failed.value, null);
    assert.equal(h.client.view.value.balance, 50);
    assert.ok(original.actionId);
});
test('a definitely unapplied request retries its identical identity, but business rejections do not trap the UI', async () => {
    const h = harness(); await h.client.read();
    h.handle(async () => { throw Object.assign(new Error('timeout'), { code: 'host_request_timeout' }); });
    await h.client.act({ type: 'challenge' });
    const original = h.calls.at(-1).payload;
    h.handle(async type => ({ result: state(type.endsWith('/act') ? { revision: 1, balance: 50 } : {}) }));
    await h.client.recover();
    assert.deepEqual(h.calls.at(-1).payload, original);
    h.handle(async () => { throw Object.assign(new Error('funds'), { code: 'moving_funds' }); });
    await h.client.act({ type: 'challenge' });
    assert.equal(h.client.failed.value, null);
    assert.equal(h.client.blocked.value, false);
});
