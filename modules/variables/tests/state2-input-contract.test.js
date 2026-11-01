import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHarness, readStoredValue } from './helpers/state2-harness.js';

let harness;
let api;
const ctx = () => harness.env.state.ctx;
const deduct = () => ({ op: 'inc', path: '角色.金钱', delta: -10 });

test.before(async () => { harness = await createHarness(); });
test.beforeEach(() => {
    harness.reset();
    ctx().chat = [{ mes: '', swipe_id: 0 }, { mes: '', swipe_id: 0 }];
    harness.executor.applyStateForMessage(0, '<state>角色: {"金钱":100,"背包":["药","钥匙"]}</state>');
    api = harness.executor.createStateApi();
});
test.after(() => harness.cleanup());

test('invalid submissions cannot trigger legacy conversion before being rejected', () => {
    const fixture = JSON.parse(readFileSync(new URL('./fixtures/state2-wal-v1.json', import.meta.url), 'utf8'));
    const input = { ops: [{ op: 'del', path: '角色.背包.0' }, { op: 'del', path: '角色.背包[0]' }] };
    for (const submit of [
        () => api.apply(input),
        () => api.applyText(`<state>${JSON.stringify(input)}</state>`),
        () => harness.executor.applyStateForMessage(3, `<state>${JSON.stringify(input)}</state>`),
    ]) {
        harness.reset();
        ctx().chat = Array.from({ length: 4 }, () => ({ mes: '', swipe_id: 0 }));
        ctx().chatMetadata = structuredClone(fixture.metadata);
        const before = structuredClone({ chat: ctx().chat, meta: ctx().chatMetadata });
        assert.ok(submit().errors.length);
        assert.deepEqual({ chat: ctx().chat, meta: ctx().chatMetadata }, before);
    }
});

test('continue validates only its new batch even before the v1 prefix has been published', () => {
    const oldBody = '<state>角色.背包.0: null</state>';
    for (const operation of [
        { op: 'del', path: '角色.背包[0]' },
        { op: 'set', path: '角色.背包[0]', value: '新钥匙' },
    ]) {
        for (const openFirst of [false, true]) {
            harness.reset();
            ctx().chatMetadata = JSON.parse(readFileSync(new URL('./fixtures/state2-wal-v1.json', import.meta.url), 'utf8')).metadata;
            ctx().chat = Array.from({ length: 4 }, () => ({ mes: '', swipe_id: 0 }));
            const last = ctx().chatMetadata.extensions.LittleWhiteBox.stateLogV2.floors['3'];
            last.signature = oldBody;
            last.ops = [{ op: 'del', path: '角色.背包.0' }];
            const role = readStoredValue(ctx(), '角色');
            ctx().chatMetadata.variables.角色 = JSON.stringify({ ...role, 金钱: 0, 背包: ['钥匙'] });
            if (openFirst) harness.executor.openStateChat();
            const body = oldBody + `<state>${JSON.stringify({ ops: [operation] })}</state>`;
            const result = harness.executor.applyStateForMessage(3, body);
            assert.deepEqual(result.errors, []);
            const expected = operation.op === 'del' ? [] : ['新钥匙'];
            assert.deepEqual(readStoredValue(ctx(), '角色').背包, expected);
            assert.equal(ctx().chat[3].extra.LittleWhiteBox_state2.entries.length, 2);
            harness.executor.rebuildStateV2();
            assert.deepEqual(readStoredValue(ctx(), '角色').背包, expected);
        }
    }
});

test('invalid unrecorded swipe input leaves pending v1 conversion unpublished', () => {
    const body = `<state>${JSON.stringify({ ops: [{ op: 'del', path: '角色.背包.0' }, { op: 'del', path: '角色.背包[0]' }] })}</state>`;
    for (const withSelection of [false, true]) {
        harness.reset();
        ctx().chatMetadata = JSON.parse(readFileSync(new URL('./fixtures/state2-wal-v1.json', import.meta.url), 'utf8')).metadata;
        ctx().chat = Array.from({ length: 4 }, () => ({ mes: '', swipe_id: 0 }));
        ctx().chat.push({ mes: body, swipes: [body], swipe_id: 0 });
        const before = structuredClone({ chat: ctx().chat, meta: ctx().chatMetadata });
        assert.throws(() => harness.executor.handleStateSwipe(4, ctx(), withSelection ? { mes: body } : undefined), { code: 'conflicting_operations' });
        assert.deepEqual({ chat: ctx().chat, meta: ctx().chatMetadata }, before);
    }
});

test('body validation retains deduplication against converted v1 requests', () => {
    harness.reset();
    ctx().chatMetadata = JSON.parse(readFileSync(new URL('./fixtures/state2-wal-v1.json', import.meta.url), 'utf8')).metadata;
    ctx().chat = Array.from({ length: 4 }, () => ({ mes: '', swipe_id: 0 }));
    const body = ctx().chatMetadata.extensions.LittleWhiteBox.stateLogV2.floors['3'].signature;
    const before = structuredClone(ctx().chatMetadata.variables);
    const result = harness.executor.applyStateForMessage(3, body);
    assert.equal(result.skipped, true);
    assert.deepEqual(ctx().chatMetadata.variables, before);
    assert.equal(ctx().chatMetadata.extensions.LittleWhiteBox.stateLogV2, undefined);
});

test('a later appended body batch is separate from earlier already-executed blocks', () => {
    const block = `<state>${JSON.stringify({ ops: [{ op: 'del', path: '角色.背包[0]' }] })}</state>`;
    assert.equal(harness.executor.applyStateForMessage(1, block).errors.length, 0);
    assert.deepEqual(readStoredValue(ctx(), '角色').背包, ['钥匙']);
    assert.equal(harness.executor.applyStateForMessage(1, block + block).errors.length, 0);
    assert.deepEqual(readStoredValue(ctx(), '角色').背包, []);
    harness.executor.rebuildStateV2();
    assert.deepEqual(readStoredValue(ctx(), '角色').背包, []);
});

// An AI/tool caller must be able to locate and correct a bad field without guessing from prose.
test('input errors locate the failing field and allow one corrected submission without a prior partial write', () => {
    const cases = [
        { operation: { op: ['set'], path: '角色.金钱', value: 1 }, code: 'invalid_operation', pointer: '/ops/1/op' },
        { operation: { op: 'pop', path: '角色.背包', value: '药' }, code: 'invalid_operation', pointer: '/ops/1/op', allowed: ['set', 'inc', 'push', 'remove', 'del'] },
        { operation: { op: 'remove', path: '角色.背包' }, code: 'missing_field', pointer: '/ops/1/value' },
        { operation: { op: 'inc', path: '角色.金钱', delta: '-5' }, code: 'invalid_delta', pointer: '/ops/1/delta' },
        { operation: { op: 'del', path: '角色.背包[0]', value: 1 }, code: 'unexpected_field', pointer: '/ops/1/value' },
        { operation: { op: 'set', path: '角色..金钱', value: 1 }, code: 'invalid_path', pointer: '/ops/1/path' },
        { operation: { op: 'set', path: '角色.值', value: { nested: Infinity } }, code: 'invalid_input', pointer: '/ops/1/value/nested' },
    ];
    const before = structuredClone({ chat: ctx().chat, meta: ctx().chatMetadata });
    for (const { operation, code, pointer, allowed } of cases) {
        const result = api.apply({ ops: [deduct(), operation] });
        assert.equal(result.status, 'failed');
        assert.equal(result.errors[0].code, code);
        assert.equal(result.errors[0].index, 1);
        assert.equal(result.errors[0].pointer, pointer);
        if (allowed) assert.deepEqual(result.errors[0].allowed, allowed);
        assert.deepEqual({ chat: ctx().chat, meta: ctx().chatMetadata }, before);
    }
    const corrected = api.apply({ ops: [deduct(), { op: 'remove', path: '角色.背包', value: '药' }] });
    assert.equal(corrected.status, 'success');
    assert.deepEqual(readStoredValue(ctx(), '角色'), { 金钱: 90, 背包: ['钥匙'] });
});

test('root whitespace cannot bypass ownership or create an untracked sibling root', () => {
    const before = structuredClone({ chat: ctx().chat, meta: ctx().chatMetadata });
    for (const path of ['角色 .金钱', '角色\t.金钱', '角色 ["金钱"]']) {
        const result = api.apply({ ops: [deduct(), { op: 'inc', path, delta: -20 }] });
        assert.equal(result.status, 'failed');
        assert.equal(result.errors[0].code, 'invalid_path');
        assert.equal(result.errors[0].pointer, '/ops/1/path');
        assert.deepEqual({ chat: ctx().chat, meta: ctx().chatMetadata }, before);
    }
    // Whitespace around the whole path remains accepted and resolves to exactly the owned root.
    assert.equal(api.apply({ ops: [{ op: 'inc', path: ' 角色.金钱 ', delta: -20 }] }).status, 'success');
    harness.executor.rebuildStateV2();
    assert.equal(readStoredValue(ctx(), '角色').金钱, 80);
    assert.equal(Object.keys(ctx().chatMetadata.variables).some(key => key !== key.trim()), false);
});
