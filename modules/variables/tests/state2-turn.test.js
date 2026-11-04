import test from 'node:test';
import assert from 'node:assert/strict';
import { createHarness, readStoredValue } from './helpers/state2-harness.js';

// Acceptance contracts (invisible data corruption): replace only this floor's
// submission; preserve other owners; reject stale/partial results; survive reload.
let h, api;
const ctx = () => h.env.state.ctx;
const money = () => readStoredValue(ctx(), '角色').金钱;
const inc = delta => ({ ops: [{ op: 'inc', path: '角色.金钱', delta }] });
const begin = () => api.beginTurn({ floor: ctx().chat.length - 1, swipeId: ctx().chat.at(-1).swipe_id });
const key = 'LittleWhiteBox_state2';
test.before(async () => { h = await createHarness(); });
test.beforeEach(() => {
    h.reset();
    ctx().chat = [{ mes: 'init', swipe_id: 0 }, { mes: 'prose', swipe_id: 0, swipe_info: [{ extra: {} }] }];
    h.executor.applyStateForMessage(0, '<state>角色: {"金钱":100,"背包":[]}</state>');
    api = h.executor.createStateApi();
});
test.after(() => h.cleanup());

test('missing submission on last floor never rolls back the preceding floor', () => {
    begin().commit(inc(-20));
    const previous = structuredClone(ctx().chat[1]);
    ctx().chat.push({ mes: 'new prose', swipe_id: 0 });
    const before = structuredClone(ctx().chatMetadata);
    const turn = begin();
    assert.equal(money(), 80);
    assert.deepEqual(ctx().chatMetadata, before);
    assert.deepEqual(ctx().chat[1], previous);
    turn.commit(inc(-5));
    assert.equal(money(), 75);
});

test('real rollback precedes request; repeated replacement retains ordinary calls and order', () => {
    api.apply(inc(3));
    begin().commit(inc(-20));
    api.apply(inc(7));
    for (let i = 0; i < 3; i++) {
        const turn = begin();
        assert.equal(money(), 110);
        assert.equal(turn.commit(inc(-20)).status, 'success');
        assert.equal(money(), 90);
        assert.equal(ctx().chat[1].extra[key].entries.length, 3);
        assert.throws(() => turn.commit(inc(-20)), { code: 'stale_turn_target' });
    }
    assert.deepEqual(ctx().chat[1].swipe_info[0].extra[key], ctx().chat[1].extra[key]);
});

test('invalid replacement publishes nothing; rolled-back slot survives reload', () => {
    begin().commit(inc(-20));
    const turn = begin();
    assert.throws(() => turn.commit({ ops: [{ op: 'bad' }] }));
    const failed = turn.commit({ ops: [...inc(-5).ops, { op: 'inc', path: '未管理.值', delta: 1 }] });
    assert.equal(failed.status, 'failed');
    assert.equal(money(), 100);
    h.executor.cleanupStateService();
    ctx().chat = structuredClone(ctx().chat);
    ctx().chatMetadata = structuredClone(ctx().chatMetadata);
    h.executor.rebuildStateV2();
    assert.equal(money(), 100);
    assert.equal(begin().commit({ ops: [] }).status, 'noop');
    assert.equal(money(), 100);
});

test('swipe, body, chat and variable changes invalidate pending results', () => {
    for (const mutate of [
        () => { ctx().chat[1].swipe_id++; },
        () => { ctx().chat[1].mes += ' edit'; },
        () => { ctx().chatMetadata = structuredClone(ctx().chatMetadata); },
        () => { ctx().chat = ctx().chat.slice(); },
        () => api.apply(inc(1)),
        () => { h.executor.cleanupStateService(); ctx().chatId += '-other'; },
    ]) {
        const turn = begin();
        mutate();
        assert.throws(() => turn.commit(inc(-10)), { code: 'stale_turn_target' });
    }
});

test('only the selected swipe is reset; deleting that floor restores the prefix', () => {
    begin().commit(inc(-20));
    const message = ctx().chat[1];
    message.swipe_info.push({ extra: {} });
    message.swipe_id = 1; message.extra = {};
    h.executor.rebuildStateV2();
    begin().commit(inc(-5));
    assert.equal(money(), 95);
    message.swipe_id = 0; message.extra = structuredClone(message.swipe_info[0].extra);
    h.executor.rebuildStateV2();
    assert.equal(money(), 80);
    begin();
    assert.equal(money(), 100);
    assert.equal(message.swipe_info[1].extra[key].entries[0].ops[0].delta, -5);
    ctx().chat.pop(); h.executor.rebuildStateV2();
    assert.equal(money(), 100);
});

test('replacement invalidates a cached terminal checkpoint without losing its prefix', () => {
    for (let floor = 2; floor < 100; floor++) {
        ctx().chat.push({ mes: 'prose', swipe_id: 0 });
        api.apply(inc(1));
        if (floor !== 49 && floor !== 99) continue;
        const before = money();
        begin().commit(inc(-20));
        assert.equal(money(), before - 20);
        const turn = begin();
        assert.equal(money(), before);
        turn.commit(inc(-5));
        h.executor.rebuildStateV2();
        assert.equal(money(), before - 5);
    }
});
