import test from 'node:test';
import assert from 'node:assert/strict';
import { createHarness, readStoredValue } from './helpers/state2-harness.js';

// Acceptance contracts (invisible data corruption): replace only this floor's
// submission; preserve other owners; reject stale/partial results; survive reload.
let h, api;
const ctx = () => h.env.state.ctx;
const money = () => readStoredValue(ctx(), '角色').金钱;
const inc = delta => ({ ops: [{ op: 'inc', path: '角色.金钱', delta }] });
const target = () => ({ floor: ctx().chat.length - 1, swipeId: ctx().chat.at(-1).swipe_id });
const begin = () => api.beginTurn(target());
const continueTurn = () => api.beginContinuation(target());
const snapshot = () => structuredClone({ chat: ctx().chat, metadata: ctx().chatMetadata });
const record = () => ctx().chat.at(-1).extra?.[key];
const key = 'LittleWhiteBox_state2';
test.before(async () => { h = await createHarness(); });
test.beforeEach(() => {
    h.reset();
    ctx().chat = [{ mes: 'init', swipe_id: 0 }, { mes: 'prose', swipe_id: 0, swipe_info: [{ extra: {} }] }];
    h.executor.applyStateForMessage(0, '<state>角色: {"金钱":100,"背包":[]}</state>');
    api = h.executor.createStateApi();
});
test.after(() => h.cleanup());

test('same-floor continuations preserve the original submission and append one separate batch each', () => {
    begin().commit(inc(-20));
    const original = record();
    const before = snapshot();
    const continuation = continueTurn();
    assert.equal(money(), 80);
    assert.deepEqual(snapshot(), before);
    assert.equal(continuation.commit(inc(-5)).status, 'success');
    assert.equal(money(), 75);
    for (const [delta, expected] of [[-3, 72], [-2, 70]]) {
        assert.equal(continueTurn().commit(inc(delta)).status, 'success');
        assert.equal(money(), expected);
    }
    assert.deepEqual(record().entries.map(entry => [entry.scope, entry.ops[0].delta]), [
        ['turn', -20], ['turn', -5], ['turn', -3], ['turn', -2],
    ]);
    assert.equal(original.entries.length, 1);
    assert.deepEqual(ctx().chat[1].swipe_info[0].extra[key], record());
    h.executor.rebuildStateV2();
    assert.equal(money(), 70);
});

test('abandoned, invalid and rejected continuations never publish even the valid operations', () => {
    begin().commit(inc(-20));
    h.executor.cleanupStateService();
    const saved = ctx().saveCount;
    const before = snapshot();
    continueTurn(); // Cancelled request: dropping the handle is enough.
    const continuation = continueTurn();
    assert.throws(() => continuation.commit({ ops: [{ op: 'bad' }] }));
    const rejected = continuation.commit({ ops: [...inc(-5).ops, { op: 'inc', path: '未管理.值', delta: 1 }] });
    assert.equal(rejected.status, 'failed');
    assert.ok(rejected.errors.length);
    assert.deepEqual(rejected.changes, []);
    assert.deepEqual(rejected.corrections, []);
    assert.deepEqual(snapshot(), before);
    h.executor.cleanupStateService();
    assert.equal(ctx().saveCount, saved, 'no continuation mutation schedules a save');
    h.executor.rebuildStateV2();
    assert.equal(money(), 80);
});

test('successful and competing continuation handles cannot commit twice or overwrite newer state', () => {
    begin().commit(inc(-20));
    const first = continueTurn();
    const competing = continueTurn();
    first.commit(inc(-5));
    const before = snapshot();
    for (const handle of [first, competing]) {
        assert.throws(() => handle.assertCurrent(), { code: 'stale_turn_target' });
        assert.throws(() => handle.commit(inc(-5)), { code: 'stale_turn_target' });
        assert.deepEqual(snapshot(), before);
    }
    const noop = continueTurn();
    assert.equal(noop.commit({ ops: [] }).status, 'noop');
    assert.equal(record().entries.length, 3);
    assert.throws(() => noop.commit(inc(-5)), { code: 'stale_turn_target' });
    assert.equal(money(), 75);
});

test('full replacement removes all turn batches but preserves ordinary and body entries in order', () => {
    api.apply(inc(3));
    begin().commit({ ops: [{ op: 'set', path: '角色.金钱', value: 80 }] });
    h.executor.applyStateForMessage(1, '<state>角色.金钱: +4</state>');
    continueTurn().commit({ ops: [{ op: 'set', path: '角色.金钱', value: 20 }] });
    api.apply(inc(7));
    continueTurn().commit(inc(-2));
    assert.equal(money(), 25);
    const retained = record().entries.filter(entry => entry.scope !== 'turn');
    const turn = begin();
    assert.equal(money(), 114);
    assert.equal(record().entries.filter(entry => entry.scope === 'turn').length, 1);
    assert.deepEqual(record().entries.filter(entry => entry.scope !== 'turn'), retained);
    assert.equal(turn.commit({ ops: [{ op: 'set', path: '角色.金钱', value: 60 }] }).status, 'success');
    assert.equal(money(), 71, 'replacement runs before later body and ordinary entries');
    assert.deepEqual(record().entries.map(entry => entry.scope || entry.kind), ['call', 'turn', 'text', 'call']);
    h.executor.rebuildStateV2();
    assert.equal(money(), 71);
});

test('an empty initial submission still owns later continuation batches during replacement', () => {
    begin().commit({ ops: [] });
    continueTurn().commit(inc(-5));
    continueTurn().commit({ ops: [] });
    const turn = begin();
    assert.equal(money(), 100);
    assert.equal(record().entries.length, 1);
    turn.commit(inc(-10));
    h.executor.rebuildStateV2();
    assert.equal(money(), 90);
});

test('turn entry points reject nonterminal, wrong-swipe, user and system targets without mutations', () => {
    begin().commit(inc(-20));
    for (const start of [api.beginTurn, api.beginContinuation]) {
        for (const invalid of [{ floor: 0, swipeId: 0 }, { floor: 1, swipeId: 1 }]) {
            const before = snapshot();
            assert.throws(() => start(invalid), { code: 'invalid_turn_target' });
            assert.deepEqual(snapshot(), before);
        }
        for (const flag of ['is_user', 'is_system']) {
            ctx().chat[1][flag] = true;
            const before = snapshot();
            assert.throws(() => start(target()), { code: 'invalid_turn_target' });
            assert.deepEqual(snapshot(), before);
            delete ctx().chat[1][flag];
        }
    }
});

test('continuations retain range/step corrections and replay the original requested deltas', () => {
    h.executor.applyStateForMessage(0, '<state>$range=[0,100] $step=30 角色.金钱\n角色: {"金钱":100,"背包":[]}</state>');
    begin().commit(inc(-20));
    const stepped = continueTurn().commit(inc(-50));
    assert.equal(money(), 50);
    assert.equal(stepped.status, 'success');
    assert.equal(stepped.changes[0].delta, -30);
    assert.ok(stepped.corrections.length);
    assert.equal(record().entries[1].ops[0].delta, -50);
    continueTurn().commit(inc(-50));
    const ranged = continueTurn().commit(inc(-50));
    assert.equal(money(), 0);
    assert.equal(ranged.changes[0].delta, -20);
    assert.ok(ranged.corrections.length);
    h.executor.rebuildStateV2();
    assert.equal(money(), 0);
    const turn = begin();
    assert.equal(money(), 100);
    assert.equal(turn.commit(inc(-50)).changes[0].delta, -30);
    assert.equal(money(), 70);
});

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

for (const [mode, start] of [['replacement', begin], ['continuation', continueTurn]]) {
    test(`${mode} rejects results after swipe, body, chat and variable changes`, () => {
        begin().commit(inc(-20));
        for (const mutate of [
            () => { ctx().chat[1].swipe_id++; },
            () => { ctx().chat[1].mes += ' edit'; },
            () => { ctx().chatMetadata = structuredClone(ctx().chatMetadata); },
            () => { ctx().chat = ctx().chat.slice(); },
            () => api.apply(inc(1)),
            () => { h.executor.cleanupStateService(); ctx().chatId += '-other'; },
        ]) {
            const turn = start();
            mutate();
            const before = snapshot();
            assert.throws(() => turn.commit(inc(-10)), { code: 'stale_turn_target' });
            assert.deepEqual(snapshot(), before);
        }
    });
}

test('only the selected swipe is reset; replay and deleting that floor restore every batch', () => {
    begin().commit(inc(-20));
    continueTurn().commit(inc(-5));
    h.executor.cleanupStateService();
    ctx().chat = structuredClone(ctx().chat);
    ctx().chatMetadata = structuredClone(ctx().chatMetadata);
    h.executor.openStateChat();
    h.executor.rebuildStateV2();
    assert.equal(money(), 75);
    const message = ctx().chat[1];
    message.swipes = ['old', 'new'];
    message.swipe_info.push({ extra: {} });
    message.swipe_id = 1; message.extra = {};
    h.executor.handleStateSwipe(1);
    assert.equal(money(), 100);
    begin().commit(inc(-5));
    continueTurn().commit(inc(-3));
    assert.equal(money(), 92);
    message.swipe_id = 0; message.extra = structuredClone(message.swipe_info[0].extra);
    h.executor.handleStateSwipe(1);
    assert.equal(money(), 75);
    begin().commit(inc(-10));
    assert.equal(money(), 90);
    assert.equal(record().entries.length, 1);
    assert.deepEqual(message.swipe_info[1].extra[key].entries.map(entry => entry.ops[0].delta), [-5, -3]);
    message.swipes.splice(0, 1);
    message.swipe_info.splice(0, 1);
    h.executor.handleStateSwipeDeleted({ messageId: 1, newSwipeId: 0 });
    assert.equal(money(), 92);
    assert.deepEqual(record().entries.map(entry => entry.ops[0].delta), [-5, -3]);
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
        continueTurn().commit(inc(-5));
        continueTurn().commit(inc(-3));
        assert.equal(money(), before - 28);
        const turn = begin();
        assert.equal(money(), before);
        turn.commit(inc(-5));
        h.executor.rebuildStateV2();
        assert.equal(money(), before - 5);
    }
});
