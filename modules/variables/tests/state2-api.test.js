import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { createHarness, readStoredValue, lwbMeta } from './helpers/state2-harness.js';

// Contracts: synchronous writes; immutable requests; B body synchronization;
// swipe ownership; prefix-validated bounded caches; atomic deployed-v1 conversion.
let harness;
let api;
let notifications;
const KEY = 'LittleWhiteBox_state2';
const state = () => harness.env.state.ctx;
const read = () => readStoredValue(state(), '角色');
const record = floor => state().chat[floor].extra?.[KEY];
const inc = delta => ({ ops: [{ op: 'inc', path: '角色.金钱', delta }] });
const text = body => `<state>\n${body}\n</state>`;
const sync = (floor, body) => {
    state().chat[floor].mes = body;
    return harness.executor.applyStateForMessage(floor, body);
};
const rebuild = () => harness.executor.rebuildStateV2();
const initialize = () => sync(0, text('角色: {"金钱":100,"背包":["a","b","c"],"位置":"家"}'));

function growChat(count) {
    while (state().chat.length < count) state().chat.push({ mes: 'turn', swipe_id: 0 });
}
function fillHistory(count) {
    harness.reset();
    for (let floor = 0; floor < count; floor++) {
        state().chat.push({ mes: '', swipe_id: 0 });
        sync(floor, text(floor === 0 ? '数据: {"列表":[0],"值":0}' : `数据.列表: +${JSON.stringify(String(floor))}\n数据.值: +1`));
    }
}

test.before(async () => { harness = await createHarness(); });
test.beforeEach(() => {
    harness.reset();
    state().chat = [{ mes: 'init', swipe_id: 0 }, { mes: 'turn', swipe_id: 0 }];
    notifications = [];
    api = harness.executor.createStateApi({ notify: event => notifications.push(event) });
    initialize();
});
test.after(() => harness.cleanup());

test('same-realm, cross-realm, and serialized JSON inputs execute synchronously', async () => {
    const inputs = [inc(-10), runInNewContext('({ops:[{op:"inc",path:"角色.金钱",delta:-10}]})'), JSON.stringify(inc(-10))];
    for (const input of inputs) {
        const before = read().金钱;
        const result = api.apply(input);
        assert.equal(result.then, undefined);
        assert.equal(result.status, 'success');
        assert.equal(read().金钱, before - 10);
        assert.equal(await result, result);
    }
    assert.equal(record(1).entries.length, 3);
});

test('invalid JSON rejects the complete batch without invoking accessors or altering records', () => {
    const circular = {}; circular.self = circular;
    let accessed = 0;
    const getter = { get value() { accessed++; return 1; } };
    const tagGetter = Object.create({ get [Symbol.toStringTag]() { accessed++; return 'Object'; } });
    const invalid = [
        '{', [], null, { ops: 'x' }, { ops: [], floor: 8 },
        { ops: [...inc(-20).ops, { op: 'unknown', path: '角色.金钱' }] },
        { ops: [...inc(-20).ops, { op: 'inc', path: '角色.金钱', delta: '2' }] },
        ...[Infinity, NaN, circular, undefined, getter, tagGetter, new Date(), () => 1, Symbol('bad')]
            .map(value => ({ ops: [...inc(-20).ops, { op: 'set', path: '角色.值', value }] })),
        ...['角色.__proto__.polluted', '角色.constructor.x', '角色.prototype.x', '角色[']
            .map(path => ({ ops: [...inc(-20).ops, { op: 'set', path, value: 1 }] })),
        { get ops() { accessed++; return inc(-20).ops; } },
        { ops: [{ op: 'del', path: '角色.金钱', value: 1 }] },
        { ops: [...inc(-20).ops, { op: ['set'], path: '角色.金钱', value: 1 }] },
        { ops: [...inc(-20).ops, { op: 'pop', path: '角色.背包', value: 'a' }] },
        { ops: [...inc(-20).ops, { op: 'remove', path: '角色.背包' }] },
    ];
    const before = structuredClone({ chat: state().chat, metadata: state().chatMetadata });
    for (const input of invalid) {
        const result = api.apply(input);
        assert.equal(result.status, 'failed');
        assert.deepEqual(result.changes, []);
        assert.deepEqual({ chat: state().chat, metadata: state().chatMetadata }, before);
    }
    assert.equal(accessed, 0);
});

test('caller-owned input cannot mutate stored requests after return', () => {
    const input = { ops: [{ op: 'push', path: '角色.背包', value: { 名称: '药' } }] };
    api.apply(input);
    input.ops[0].value.名称 = 'changed';
    assert.deepEqual(record(1).entries[0].ops[0].value, { 名称: '药' });
    rebuild();
    assert.deepEqual(read().背包.at(-1), { 名称: '药' });
});

test('record replacement and replay never mutate an earlier request payload or record object', () => {
    const initial = record(0);
    const originalRequest = structuredClone(initial.entries[0].ops);
    api.apply({ ops: [{ op: 'push', path: '角色.背包', value: 'new' }] });
    const first = record(1);
    api.apply(inc(-10));
    assert.notEqual(record(1), first);
    assert.equal(first.entries.length, 1);
    rebuild();
    rebuild();
    assert.equal(record(0), initial);
    assert.deepEqual(initial.entries[0].ops, originalRequest);
    assert.deepEqual(read().背包, ['a', 'b', 'c', 'new']);
});

test('JSON cannot acquire unmanaged roots and independent variables survive rebuild', () => {
    state().chatMetadata.variables.独立 = 'keep';
    const result = api.apply({ ops: [
        { op: 'set', path: '独立', value: 'bad' },
        { op: 'set', path: '新根.x', value: 1 },
        ...inc(-20).ops,
    ] });
    assert.equal(result.status, 'partial');
    assert.deepEqual(result.errors.map(item => item.code), ['unmanaged_root', 'unmanaged_root']);
    assert.deepEqual(record(1).entries[0].ops, [{ ...inc(-20).ops[0], source: 'json' }]);
    rebuild();
    assert.equal(read().金钱, 80);
    assert.equal(state().chatMetadata.variables.独立, 'keep');
    assert.equal(state().chatMetadata.variables.新根, undefined);
});

test('requests retain original deltas, values, refusals and noops, then replay under new preceding state', () => {
    sync(0, text('$range=[0,100] 角色.金钱\n角色: {"金钱":100,"位置":"家","背包":[]}'));
    const result = api.apply({ ops: [
        ...inc(-200).ops,
        { op: 'push', path: '角色.位置', value: 'arrived' },
        { op: 'set', path: '角色.金钱', value: 0 },
    ] });
    assert.equal(result.status, 'partial');
    assert.equal(result.corrections[0].value, 0);
    assert.equal(result.changes[0].delta, -100);
    assert.equal(result.errors[0].code, 'operation_failed');
    assert.deepEqual(record(1).entries[0].ops, [
        { ...inc(-200).ops[0], source: 'json' },
        { op: 'push', path: '角色.位置', value: 'arrived', source: 'json' },
        { op: 'set', path: '角色.金钱', value: 0, source: 'json' },
    ]);
    sync(0, text('角色: {"金钱":500,"位置":[],"背包":[]}'));
    assert.deepEqual(read().位置, ['arrived']);
    assert.equal(read().金钱, 0);
    assert.equal(state().chatMetadata.LWB_RULES_V2['角色.金钱'], undefined);
});

test('corrected increments replay the request, not the original clamped effect', () => {
    sync(0, text('$range=[0,100] 角色.金钱\n角色.金钱: 100'));
    api.apply(inc(-200));
    assert.equal(read().金钱, 0);
    sync(0, text('角色.金钱: 500'));
    assert.equal(read().金钱, 300);
});

test('a rule-refused request remains recorded and can succeed after its earlier rule is removed', () => {
    sync(0, text('角色.金钱: 100\n$ro 角色.金钱'));
    const result = api.apply(inc(-20));
    assert.equal(result.errors[0].code, 'rule_rejected');
    assert.equal(record(1).entries[0].ops[0].delta, -20);
    sync(0, text('角色.金钱: 100'));
    assert.equal(read().金钱, 80);
});

test('identical calls execute immediately once each without a queue or lifecycle API', () => {
    const first = api.apply(inc(-20));
    assert.equal(read().金钱, 80);
    const second = api.apply(inc(-20));
    assert.equal(read().金钱, 60);
    assert.equal(first.status, 'success');
    assert.equal(second.status, 'success');
    assert.deepEqual(Object.keys(api).sort(), ['apply', 'applyText']);
    assert.equal(record(1).entries.length, 2);
    rebuild();
    assert.equal(read().金钱, 60);
});

test('missing chats, missing messages, and nonexistent applyText floors never create synthetic history', () => {
    const before = structuredClone(state().chatMetadata);
    assert.ok(api.applyText(text('角色.金钱: -10'), { floor: 8 }).errors.length);
    assert.deepEqual(state().chatMetadata, before);
    state().chat = [];
    assert.equal(api.apply(inc(-20)).errors[0].code, 'no_chat');
    assert.ok(api.applyText(text('角色.金钱: -10')).errors.length);
    assert.deepEqual(state().chatMetadata, before);
});

test('body JSON executes only inside state tags and a malformed block preserves the complete previous record', () => {
    const before = structuredClone({ record: record(0), variables: state().chatMetadata.variables });
    const result = sync(0, text('角色.金钱: -20') + text('{bad'));
    assert.equal(result.atoms.length, 0);
    assert.ok(result.errors.length);
    assert.deepEqual(record(0), before.record);
    assert.deepEqual(state().chatMetadata.variables, before.variables);
    sync(1, JSON.stringify(inc(-20)));
    assert.equal(read().金钱, 100);
    sync(1, text(JSON.stringify(inc(-20))));
    assert.equal(read().金钱, 80);
});

test('text, body JSON and direct JSON share operation semantics and request replay', () => {
    const ops = [
        { op: 'del', path: '角色.背包[1]' },
        { op: 'del', path: '角色.背包[0]' },
        { op: 'push', path: '角色.背包', value: ['d', 'e'] },
        { op: 'remove', path: '角色.背包', value: 'd' },
        ...inc(-20).ops,
        { op: 'set', path: '角色.位置', value: '商店' },
    ];
    const outcomes = [];
    for (const run of [
        () => sync(1, text('角色.背包[1]: null\n角色.背包[0]: null\n角色.背包: +["d","e"]\n角色.背包: -"d"\n角色.金钱: -20\n角色.位置: 商店')),
        () => sync(1, text(JSON.stringify({ ops }))),
        () => {
            const result = api.apply({ ops });
            assert.deepEqual(result.changes.map(change => change.op), ['del', 'del', 'push', 'remove', 'inc', 'set']);
        },
    ]) {
        harness.reset();
        state().chat = [{ mes: '' }, { mes: '' }];
        initialize();
        run();
        outcomes.push(read());
        rebuild();
        assert.deepEqual(read(), outcomes.at(-1));
    }
    assert.deepEqual(outcomes[0], { 金钱: 80, 背包: ['c', 'e'], 位置: '商店' });
    assert.deepEqual(outcomes[1], outcomes[0]);
    assert.deepEqual(outcomes[2], outcomes[0]);
});

test('body and calls preserve occurrence order across multiple continues and body replacement', () => {
    api.apply(inc(5));
    const first = text('角色.金钱: 10');
    sync(1, first);
    api.apply(inc(2));
    const second = text('角色.金钱: +3');
    sync(1, first + second);
    api.apply(inc(4));
    sync(1, first + second + text('角色.金钱: +6'));
    assert.equal(read().金钱, 25);
    assert.deepEqual(record(1).entries.map(entry => entry.kind), ['call', 'text', 'call', 'text', 'call', 'text']);
    rebuild();
    assert.equal(read().金钱, 25);
    sync(1, text('角色.金钱: 20'));
    assert.deepEqual(record(1).entries.map(entry => entry.kind), ['call', 'text', 'call', 'call']);
    assert.equal(read().金钱, 26);
    rebuild();
    assert.equal(read().金钱, 26);
});

test('B semantics preserve records when all blocks disappear but revoke a partially removed block', () => {
    const first = text('角色.金钱: -10');
    const second = text('角色.金钱: -20');
    sync(1, first + second);
    const original = record(1);
    sync(1, 'ordinary text, all state blocks removed');
    assert.equal(record(1), original);
    assert.equal(read().金钱, 70);
    rebuild();
    assert.equal(read().金钱, 70);
    sync(1, `changed prose ${first}`);
    assert.notEqual(record(1), original);
    assert.equal(read().金钱, 90);
    assert.equal(record(1).entries[0].blocks.length, 1);
    assert.equal(sync(1, `more prose ${first}`).skipped, true);
});

test('applyText is synchronous, supports old floors and silent notifications, and deduplicates only text calls', () => {
    const body = text('角色.金钱: -20');
    const result = api.applyText(body, { floor: 1, silent: true });
    assert.equal(result.then, undefined);
    assert.deepEqual(Object.keys(result).sort(), ['atoms', 'errors', 'skipped']);
    assert.equal(read().金钱, 80);
    assert.equal(notifications.length, 0);
    assert.equal(api.applyText(body, { floor: 1 }).skipped, true);
    assert.equal(record(1).entries.length, 1);
    assert.equal(record(1).entries[0].source, 'text');
    sync(1, body);
    assert.equal(read().金钱, 60);
    growChat(3);
    api.applyText(text('角色.金钱: +5'), { floor: 1 });
    assert.equal(read().金钱, 65);
    assert.equal(notifications.length, 1);
    assert.equal(notifications[0].messageId, 1);
});

test('first call without a body belongs to the actual terminal message and stays ahead of later body input', () => {
    state().chat.push({ mes: '', is_user: false, swipe_id: 0 });
    api.apply(inc(5));
    assert.equal(record(2).entries[0].kind, 'call');
    sync(2, text('角色.金钱: 10'));
    api.apply(inc(2));
    assert.equal(read().金钱, 12);
    rebuild();
    assert.equal(read().金钱, 12);
    // Tool-only host flow has removed the empty reply: the actual terminal user message owns the call.
    state().chat.pop();
    state().chat[1].is_user = true;
    rebuild();
    api.apply(inc(-3));
    assert.equal(record(1).entries.at(-1).ops[0].delta, -3);
    assert.equal(read().金钱, 97);
});

test('the one-second save timer restarts on each mutation and saves the complete chat once', t => {
    harness.executor.cleanupStateService();
    const before = state().saveCount;
    t.mock.timers.enable({ apis: ['setTimeout'] });
    api.apply(inc(-20));
    t.mock.timers.tick(900);
    assert.equal(state().saveCount, before);
    api.apply(inc(-10));
    t.mock.timers.tick(999);
    assert.equal(state().saveCount, before);
    t.mock.timers.tick(1);
    assert.equal(state().saveCount, before + 1);
    assert.equal(read().金钱, 70);
    assert.equal(record(1).entries.length, 2);
    harness.executor.cleanupStateService();
    assert.equal(state().saveCount, before + 1);
});

test('save requests debounce and cleanup synchronously flushes one save and cancels its timer', () => {
    api.apply(inc(-20));
    api.apply(inc(-10));
    assert.equal(state().saveCount, 0);
    harness.executor.cleanupStateService();
    assert.equal(state().saveCount, 1);
    harness.executor.cleanupStateService();
    assert.equal(state().saveCount, 1);
});

test('new swipe clears inherited record, preserves old snapshot, and existing swipe restores cleaned body records', () => {
    const message = state().chat[1];
    message.swipes = ['old'];
    message.swipe_info = [{ extra: { unrelated: 'old' } }];
    sync(1, text('角色.金钱: -10'));
    api.apply(inc(-20));
    const oldExtra = structuredClone(message.swipe_info[0].extra);
    assert.deepEqual(message.extra[KEY], oldExtra[KEY]);
    message.mes = 'old body with blocks already cleaned';
    message.swipe_id = 1;
    harness.executor.handleStateSwipe(1);
    assert.equal(read().金钱, 100);
    assert.equal(message.extra[KEY], undefined);
    assert.deepEqual(message.swipe_info[0].extra, oldExtra);
    api.apply(inc(5));
    sync(1, text('角色.金钱: 20'));
    assert.equal(read().金钱, 20);
    message.swipe_id = 0;
    message.extra = structuredClone(oldExtra);
    message.mes = 'old body with blocks already cleaned';
    harness.executor.handleStateSwipe(1);
    assert.equal(read().金钱, 70);
    assert.deepEqual(message.extra[KEY], oldExtra[KEY]);
});

test('existing unrecorded swipe can parse its body, then later block removal does not erase it', () => {
    const message = state().chat[1];
    message.swipes = ['new-to-module'];
    message.swipe_info = [{ extra: {} }];
    message.mes = text('角色.金钱: -7');
    harness.executor.handleStateSwipe(1);
    assert.equal(read().金钱, 93);
    assert.deepEqual(message.extra[KEY], message.swipe_info[0].extra[KEY]);
    message.mes = 'cleaned';
    harness.executor.handleStateSwipe(1);
    assert.equal(read().金钱, 93);
});

test('deleting the last owning record clears its root and rules, not independent variables or rules', () => {
    state().chatMetadata.variables.独立 = 'keep';
    state().chatMetadata.LWB_RULES_V2['独立.值'] = { typeLock: 'string' };
    sync(0, text('$range=[0,100] 角色.金钱\n角色.金钱: 100'));
    api.apply(inc(-20));
    state().chat.shift();
    rebuild();
    assert.equal(state().chatMetadata.variables.角色, undefined);
    assert.equal(state().chatMetadata.variables.独立, 'keep');
    assert.deepEqual(state().chatMetadata.LWB_RULES_V2, { '独立.值': { typeLock: 'string' } });
    assert.equal(api.apply(inc(5)).errors[0].code, 'unmanaged_root');
});

test('request storage stays linear while decoded checkpoints retain only the highest two 50-message candidates', () => {
    fillHistory(160);
    const checkpoints = lwbMeta(state()).stateCkptV2;
    assert.deepEqual(checkpoints.points.map(point => point.floor), [99, 149]);
    for (const point of checkpoints.points) {
        assert.equal(typeof point.digest, 'string');
        assert.equal(point.variables.数据.列表.length, point.floor + 1);
        assert.equal(point.variables.数据.值, point.floor);
        assert.equal(typeof point.variables.数据, 'object');
    }
    for (let floor = 1; floor < 160; floor++) {
        const entry = record(floor).entries[0];
        assert.deepEqual(entry.ops, [
            { op: 'push', path: '数据.列表', value: String(floor), source: 'text' },
            { op: 'inc', path: '数据.值', delta: 1, source: 'text' },
        ]);
        assert.ok(JSON.stringify(record(floor)).length < 400);
    }
    const expected = readStoredValue(state(), '数据');
    rebuild();
    assert.deepEqual(readStoredValue(state(), '数据'), expected);
    delete lwbMeta(state()).stateCkptV2;
    rebuild();
    assert.deepEqual(readStoredValue(state(), '数据'), expected);
    assert.deepEqual(lwbMeta(state()).stateCkptV2.points.map(point => point.floor), [99, 149]);
});

test('later calls at a candidate floor replace its checkpoint with the complete decoded result', () => {
    fillHistory(50);
    const previous = structuredClone(lwbMeta(state()).stateCkptV2.points[0]);
    api.apply({ ops: [{ op: 'inc', path: '数据.值', delta: 7 }] });
    const point = lwbMeta(state()).stateCkptV2.points[0];
    assert.equal(point.floor, 49);
    assert.notEqual(point.digest, previous.digest);
    assert.equal(point.variables.数据.值, 56);
    assert.equal(previous.variables.数据.值, 49);
    rebuild();
    assert.equal(readStoredValue(state(), '数据').值, 56);
});

test('a failed replay publishes no partial values, rules or replacement checkpoints', () => {
    api.apply(inc(-20));
    growChat(3);
    state().chat[2].extra = { [KEY]: { v: 1, entries: [{ kind: 'text', blocks: [], roots: [], rules: [], ops: null }] } };
    const before = structuredClone(state().chatMetadata);
    assert.throws(() => rebuild());
    assert.deepEqual(state().chatMetadata, before);
    assert.equal(read().金钱, 80);
});

test('candidate checkpoints exclude native writes that have no request record', () => {
    harness.reset();
    state().chat = [{ mes: '', swipe_id: 0 }];
    sync(0, text('A.n: 1'));
    state().chatMetadata.variables.A = JSON.stringify({ n: 99 });
    growChat(50);
    sync(49, text('A.x: 2'));
    assert.deepEqual(readStoredValue(state(), 'A'), { n: 99, x: 2 });
    assert.deepEqual(lwbMeta(state()).stateCkptV2.points[0].variables.A, { n: 1, x: 2 });
    rebuild();
    const cached = readStoredValue(state(), 'A');
    delete lwbMeta(state()).stateCkptV2;
    rebuild();
    assert.deepEqual(cached, { n: 1, x: 2 });
    assert.deepEqual(readStoredValue(state(), 'A'), cached);
});

test('later records that re-own a root cannot change an earlier prefix result or revive orphaned calls', () => {
    harness.reset();
    state().chat = [{ mes: '', swipe_id: 0 }];
    sync(0, text('A.n: 100'));
    for (let floor = 1; floor <= 50; floor++) {
        growChat(floor + 1);
        assert.equal(api.apply({ ops: [{ op: 'inc', path: 'A.n', delta: 1 }] }).status, 'success');
    }
    state().chat.shift();
    rebuild();
    assert.equal(state().chatMetadata.variables.A, undefined);
    growChat(state().chat.length + 1);
    sync(state().chat.length - 1, text('A.other: 7'));
    const live = readStoredValue(state(), 'A');
    rebuild();
    const cached = readStoredValue(state(), 'A');
    delete lwbMeta(state()).stateCkptV2;
    rebuild();
    assert.deepEqual(live, { other: 7 });
    assert.deepEqual(cached, live);
    assert.deepEqual(readStoredValue(state(), 'A'), live);
});

test('replacing the host metadata object preserves prior ownership when its owning message is deleted', () => {
    state().chatMetadata.variables.独立 = 'keep';
    const chat = state().chat;
    state().chatMetadata = { ...state().chatMetadata };
    state().chat.shift();
    assert.equal(state().chat, chat);
    rebuild();
    assert.equal(state().chatMetadata.variables.角色, undefined);
    assert.equal(state().chatMetadata.variables.独立, 'keep');
});

test('saving accepts fresh context snapshots and replacement metadata for the same chat', () => {
    harness.executor.cleanupStateService();
    let saved = 0;
    let savedMetadata;
    const snapshotApi = harness.executor.createStateApi({ context: () => ({
        ...state(),
        saveChat() { saved++; savedMetadata = this.chatMetadata; },
    }) });
    snapshotApi.apply(inc(-20));
    const replacement = { ...state().chatMetadata };
    state().chatMetadata = replacement;
    harness.executor.cleanupStateService();
    assert.equal(saved, 1);
    assert.equal(savedMetadata, replacement);
    assert.equal(read().金钱, 80);
});

test('correction response objects do not alias stored requests or checkpoint replay inputs', () => {
    harness.reset();
    state().chat = [{ mes: '', swipe_id: 0 }];
    sync(0, text('$range=[0,10] A.n\nA.n: 1'));
    growChat(50);
    const result = api.apply({ ops: [{ op: 'set', path: 'A', value: { n: 20 } }] });
    assert.deepEqual(result.corrections[0].requested, { n: 20 });
    result.corrections[0].requested.n = 7;
    assert.deepEqual(record(49).entries[0].ops[0].value, { n: 20 });
    rebuild();
    assert.deepEqual(readStoredValue(state(), 'A'), { n: 10 });
    delete lwbMeta(state()).stateCkptV2;
    rebuild();
    assert.deepEqual(readStoredValue(state(), 'A'), { n: 10 });
    assert.deepEqual(record(49).entries[0].ops[0].value, { n: 20 });
});

test('opening reloaded messages rescans ownership even when the host reuses its chat array and ID', () => {
    harness.reset();
    state().chat = [{ mes: '', swipe_id: 0 }];
    sync(0, text('A.n: 1'));
    const chat = state().chat;
    state().chat.splice(0, state().chat.length, { mes: 'reloaded without state records', swipe_id: 0 });
    harness.executor.openStateChat();
    assert.equal(state().chat, chat);
    const result = api.apply({ ops: [{ op: 'inc', path: 'A.n', delta: 1 }] });
    assert.equal(result.errors[0].code, 'unmanaged_root');
    assert.deepEqual(result.changes, []);
    assert.deepEqual(readStoredValue(state(), 'A'), { n: 1 });
});

test('a candidate checkpoint replay failure leaves live state and request records unpublished', () => {
    harness.reset();
    state().chat = [{ mes: '', swipe_id: 0 }];
    sync(0, text(`A: '{"n":{"valueOf":null,"toString":null}}'`));
    state().chatMetadata.variables.A = JSON.stringify({ n: 1 });
    growChat(50);
    const before = structuredClone({ chat: state().chat, metadata: state().chatMetadata });
    assert.throws(() => api.apply({ ops: [{ op: 'inc', path: 'A.n', delta: 1 }] }));
    assert.deepEqual({ chat: state().chat, metadata: state().chatMetadata }, before);
    assert.deepEqual(readStoredValue(state(), 'A'), { n: 1 });
    assert.equal(record(49), undefined);
});

test('same terminal record identity does not validate an edited or reordered prefix checkpoint', () => {
    fillHistory(120);
    const terminal = record(119);
    sync(10, text('数据.列表: +"edited"\n数据.值: +10'));
    assert.equal(record(119), terminal);
    assert.equal(readStoredValue(state(), '数据').值, 128);
    [state().chat[20], state().chat[21]] = [state().chat[21], state().chat[20]];
    rebuild();
    assert.deepEqual(readStoredValue(state(), '数据').列表.slice(20, 22), ['21', '20']);
    assert.equal(record(119), terminal);
    const checkpointResult = readStoredValue(state(), '数据');
    delete lwbMeta(state()).stateCkptV2;
    rebuild();
    assert.deepEqual(readStoredValue(state(), '数据'), checkpointResult);
});

test('large deletions crossing both cached points refill two retained candidates when available', () => {
    fillHistory(260);
    assert.deepEqual(lwbMeta(state()).stateCkptV2.points.map(point => point.floor), [199, 249]);
    state().chat.splice(120);
    rebuild();
    assert.equal(readStoredValue(state(), '数据').列表.length, 120);
    assert.equal(readStoredValue(state(), '数据').值, 119);
    assert.deepEqual(lwbMeta(state()).stateCkptV2.points.map(point => point.floor), [49, 99]);
    state().chat.splice(25, 1);
    rebuild();
    assert.equal(readStoredValue(state(), '数据').值, 118);
    assert.ok(!readStoredValue(state(), '数据').列表.includes('25'));
});

test('a cold rebuild fills an earlier missing checkpoint even if the latest valid one exists', () => {
    fillHistory(120);
    const points = lwbMeta(state()).stateCkptV2.points;
    lwbMeta(state()).stateCkptV2.points = points.filter(point => point.floor === 99);
    harness.executor.cleanupStateService();
    harness.executor.openStateChat();
    rebuild();
    assert.deepEqual(lwbMeta(state()).stateCkptV2.points.map(point => point.floor), [49, 99]);
    assert.equal(readStoredValue(state(), '数据').值, 119);
});

const fixture = () => JSON.parse(readFileSync(new URL('./fixtures/state2-wal-v1.json', import.meta.url), 'utf8'));
function loadFixture() {
    harness.reset();
    state().chatMetadata = fixture().metadata;
    state().chat = Array.from({ length: 4 }, () => ({ mes: 'blocks already cleaned', swipe_id: 0 }));
}

test('frozen deployed v1 fixture converts requests once without changing current values or rules', () => {
    loadFixture();
    const old = structuredClone(lwbMeta(state()).stateLogV2);
    const variables = structuredClone(state().chatMetadata.variables);
    const rules = structuredClone(state().chatMetadata.LWB_RULES_V2);
    harness.executor.openStateChat();
    assert.deepEqual(state().chatMetadata.variables, variables);
    assert.deepEqual(state().chatMetadata.LWB_RULES_V2, rules);
    assert.equal(lwbMeta(state()).stateLogV2, undefined);
    assert.equal(lwbMeta(state()).stateCkptV2, undefined);
    assert.equal(state().chatMetadata.LWB_STATE_APPLIED_KEY, undefined);
    for (let floor = 0; floor < 4; floor++) {
        const entry = record(floor).entries[0];
        assert.equal(entry.kind, 'text');
        assert.deepEqual(entry.rules, old.floors[floor].rules);
        assert.deepEqual(entry.ops, old.floors[floor].ops.map(op => ({ ...op, source: 'text' })));
        assert.deepEqual(entry.roots, old.floors[floor].roots);
        assert.equal(entry.blocks.length, 1);
        assert.equal(record(floor).roots, undefined);
    }
    const once = structuredClone(state().chat);
    harness.executor.openStateChat();
    assert.deepEqual(state().chat, once);
    rebuild();
    assert.deepEqual(read(), { 金钱: 15, 位置: '家', 背包: ['药', '钥匙'] });
    assert.equal(state().chatMetadata.variables.独立, 'keep');
});

test('converted v1 requests replay correctly for each retained host history', () => {
    for (const [floor, money, bag] of [[1, 80, ['药']], [2, 0, ['药', '钥匙']], [3, 15, ['药', '钥匙']]]) {
        loadFixture();
        harness.executor.openStateChat();
        state().chat.splice(floor + 1);
        rebuild();
        assert.equal(read().金钱, money);
        assert.deepEqual(read().背包, bag);
        assert.equal(state().chatMetadata.variables.独立, 'keep');
    }
});

test('legacy conversion stages every record before deleting anything and blocks writes after failure', () => {
    loadFixture();
    lwbMeta(state()).stateLogV2.floors['2'].ops = 'corrupt';
    const before = structuredClone({ chat: state().chat, metadata: state().chatMetadata });
    assert.throws(() => harness.executor.openStateChat(), error => error.code === 'legacy_conversion_failed');
    const result = api.apply(inc(-20));
    assert.equal(result.errors[0].code, 'legacy_conversion_failed');
    assert.deepEqual({ chat: state().chat, metadata: state().chatMetadata }, before);
});

test('a malformed legacy rule fails conversion before any record or old metadata is changed', () => {
    loadFixture();
    lwbMeta(state()).stateLogV2.floors['2'].rules = [null];
    const before = structuredClone({ chat: state().chat, metadata: state().chatMetadata });
    assert.throws(() => harness.executor.openStateChat(), error => error.code === 'legacy_conversion_failed');
    assert.deepEqual({ chat: state().chat, metadata: state().chatMetadata }, before);
    const result = api.apply(inc(-20));
    assert.equal(result.errors[0].code, 'legacy_conversion_failed');
    assert.deepEqual({ chat: state().chat, metadata: state().chatMetadata }, before);
});

test('legacy conversion skips existing current records and out-of-range floors', () => {
    loadFixture();
    const existing = { v: 1, entries: [{ kind: 'call', source: 'json', roots: [], ops: [{ op: 'inc', path: '角色.金钱', delta: 3, source: 'json' }] }] };
    state().chat[1].extra = { [KEY]: existing };
    lwbMeta(state()).stateLogV2.floors['99'] = { deliberately: 'ignored' };
    harness.executor.openStateChat();
    assert.equal(record(1), existing);
    assert.equal(lwbMeta(state()).stateLogV2, undefined);
    assert.equal(state().chat.length, 4);
});

test('saved message records survive a fresh module instance without re-executing on open', async () => {
    api.apply(inc(-20));
    sync(1, 'body cleaned');
    const saved = structuredClone({ chat: state().chat, chatMetadata: state().chatMetadata });
    const reopened = await createHarness();
    try {
        Object.assign(reopened.env.state.ctx, saved);
        reopened.executor.openStateChat();
        assert.equal(readStoredValue(reopened.env.state.ctx, '角色').金钱, 80);
        reopened.executor.rebuildStateV2();
        assert.equal(readStoredValue(reopened.env.state.ctx, '角色').金钱, 80);
        assert.equal(reopened.env.state.ctx.chat[1].extra[KEY].entries.length, 1);
    } finally { reopened.cleanup(); }
});
