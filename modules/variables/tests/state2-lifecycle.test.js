import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers';
import { createHarness, loadVariablesCore, readStoredValue } from './helpers/state2-harness.js';

// Exercise actual core callbacks with controlled readiness and post-turn dependencies.
// Host DOM readiness itself and neighbouring task modules are not simulated.
let harness;
let core;
let host;
const KEY = 'LittleWhiteBox_state2';
const ctx = () => harness.env.state.ctx;
const block = body => `<state>\n${body}\n</state>`;
const text = amount => block(`角色.金钱: ${amount}`);
const jsonIncrement = (path, delta) => block(JSON.stringify({ ops: [{ op: 'inc', path, delta }] }));
const money = () => readStoredValue(ctx(), '角色')?.金钱;
const emit = (event, ...args) => host.handlers.get(event)?.(...(args.length ? args : [1]));
const settled = () => new Promise(resolve => setImmediate(resolve));
const spend = () => globalThis.LWB_StateV2.apply({ ops: [{ op: 'inc', path: '角色.金钱', delta: -20 }] });
const record = () => ctx().chat[1].extra?.[KEY];
const storedOps = floor => (ctx().chat[floor].extra?.[KEY]?.entries || []).flatMap(entry => entry.ops);
const syncBody = (floor, body) => {
    ctx().chat[floor].mes = body;
    return harness.executor.applyStateForMessage(floor, body);
};
const addFutureRoot = () => {
    ctx().chat.push({ mes: '', swipe_id: 0 });
    syncBody(2, block('历史.计数: +100'));
};

test.before(async () => {
    harness = await createHarness();
    ({ core, host } = await loadVariablesCore(harness));
    globalThis.document = {};
    globalThis.$ = () => ({ trigger() {} });
});
test.beforeEach(async () => {
    harness.reset();
    host.extension_settings.LittleWhiteBox.variablesMode = '2.0';
    host.afterAi.ready = async () => true;
    host.afterAi.afterTurn = async () => {};
    host.afterAi.waits.length = 0;
    host.afterAi.hints.length = 0;
    host.afterAi.xbCalls.length = 0;
    host.afterAi.vareventCalls = 0;
    ctx().chat = [{ mes: text(100), swipe_id: 0 }, { mes: text(-10), swipe_id: 0 }];
    core.initVariablesCore();
    globalThis.LWB_StateV2.applyText(ctx().chat[0].mes, { floor: 0, silent: true });
    await emit('MESSAGE_UPDATED');
    spend();
    assert.equal(money(), 70);
    host.afterAi.xbCalls.length = 0;
});
test.afterEach(() => core.cleanupVariablesCore());
test.after(() => { delete globalThis.document; delete globalThis.$; harness.cleanup(); });

test('the preserved public text API supports await and then while publishing state immediately', async () => {
    const api = globalThis.LWB_StateV2;
    const pending = api.applyText(text(-5), { floor: 1, silent: true });
    assert.equal(typeof pending.then, 'function');
    assert.equal(money(), 65);
    const result = await pending;
    assert.deepEqual(Object.keys(result).sort(), ['atoms', 'errors', 'skipped']);
    assert.equal(result.skipped, false);
    assert.deepEqual(result.errors, []);

    const duplicate = await api.applyText(text(-5), { floor: 1, silent: true }).then(value => value);
    assert.equal(duplicate.skipped, true);
    assert.equal(money(), 65);
    const throughThen = api.applyText(text(-2), { floor: 1, silent: true }).then(value => value);
    assert.equal(money(), 63);
    core.cleanupVariablesCore();
    assert.equal(globalThis.LWB_StateV2, undefined);
    assert.deepEqual((await throughThen).errors, []);
    assert.equal(money(), 63);
});

test('the registered public continuation API appends without resetting and full replacement owns both batches', () => {
    const api = globalThis.LWB_StateV2;
    const target = { floor: 1, swipeId: 0 };
    const input = delta => ({ ops: [{ op: 'inc', path: '角色.金钱', delta }] });
    api.beginTurn(target).commit(input(-20));
    assert.equal(money(), 50);
    const continuation = api.beginContinuation(target);
    assert.equal(money(), 50);
    assert.equal(continuation.commit(input(-5)).status, 'success');
    assert.equal(money(), 45);
    const replacement = api.beginTurn(target);
    assert.equal(money(), 70, 'body and ordinary API changes remain');
    replacement.commit(input(-7));
    assert.equal(money(), 63);
});

test('same-stamp continuation waits for readiness and coalesces all assistant completion hints', async () => {
    const message = ctx().chat[1];
    message.send_date = 'unchanged host timestamp';
    message.mes += jsonIncrement('角色.金钱', -2);
    let release;
    host.afterAi.ready = () => new Promise(resolve => { release = resolve; });
    emit('MESSAGE_RECEIVED');
    emit('CHARACTER_MESSAGE_RENDERED');
    emit('GENERATION_ENDED', 'continue');
    assert.equal(money(), 70);
    assert.equal(host.afterAi.waits.length, 1);
    assert.deepEqual(host.afterAi.hints, []);
    release(true);
    await settled();
    assert.equal(money(), 68);
    assert.equal(message.send_date, 'unchanged host timestamp');
    assert.deepEqual(record().entries.map(entry => entry.kind), ['text', 'call', 'text']);
    assert.deepEqual(host.afterAi.xbCalls, [[1, true]]);
    assert.equal(host.afterAi.vareventCalls, 1);

    host.afterAi.ready = async () => true;
    emit('CHARACTER_MESSAGE_RENDERED');
    await settled();
    host.afterAi.handler({ chatId: ctx().chatId, messageId: 1 });
    await settled();
    assert.equal(money(), 68);
    assert.equal(host.afterAi.xbCalls.length, 1);
    assert.equal(host.afterAi.vareventCalls, 1);
});

test('post-turn dedup is generation-scoped and dry runs do not create another turn', async () => {
    emit('MESSAGE_RECEIVED');
    await settled();
    spend();
    assert.equal(money(), 50);
    emit('GENERATION_STARTED', 'normal', {}, true);
    emit('GENERATION_ENDED');
    await settled();
    assert.equal(host.afterAi.vareventCalls, 1);
    emit('GENERATION_STARTED', 'continue', {}, false);
    emit('GENERATION_ENDED');
    await settled();
    assert.equal(money(), 50);
    assert.equal(host.afterAi.xbCalls.length, 2);
    assert.equal(host.afterAi.vareventCalls, 2);
});

test('another continuation arriving during post-turn work is applied after that work exactly once', async () => {
    let release;
    const firstTurn = new Promise(resolve => { release = resolve; });
    let turns = 0;
    host.afterAi.afterTurn = () => ++turns === 1 ? firstTurn : Promise.resolve();
    ctx().chat[1].mes += jsonIncrement('角色.金钱', -2);
    emit('MESSAGE_RECEIVED');
    await settled();
    assert.equal(money(), 68);
    ctx().chat[1].mes += jsonIncrement('角色.金钱', -3);
    emit('MESSAGE_RECEIVED');
    emit('CHARACTER_MESSAGE_RENDERED');
    emit('GENERATION_ENDED');
    release();
    await settled();
    assert.equal(money(), 65);
    assert.deepEqual(record().entries.map(entry => entry.kind), ['text', 'call', 'text', 'text']);
    assert.equal(host.afterAi.xbCalls.length, 2);
    assert.equal(host.afterAi.vareventCalls, 2);
});

test('a completion arriving immediately after post-turn settlement is not lost', async () => {
    let turns = 0;
    host.afterAi.afterTurn = () => ++turns === 1 ? {
        then(resolve) {
            resolve();
            queueMicrotask(() => queueMicrotask(() => {
                ctx().chat[1].mes += jsonIncrement('角色.金钱', -3);
                emit('MESSAGE_RECEIVED');
            }));
        },
    } : Promise.resolve();
    ctx().chat[1].mes += jsonIncrement('角色.金钱', -2);
    emit('MESSAGE_RECEIVED');
    await settled();
    assert.equal(money(), 65);
    assert.equal(host.afterAi.xbCalls.length, 2);
    assert.equal(host.afterAi.vareventCalls, 2);
});

for (const cancellation of ['cleanup', 'chat change']) {
    test(`pending assistant completion cannot write after ${cancellation}`, async () => {
        let release;
        host.afterAi.ready = () => new Promise(resolve => { release = resolve; });
        ctx().chat[1].mes += jsonIncrement('角色.金钱', -2);
        emit('MESSAGE_RECEIVED');
        const { signal } = host.afterAi.waits[0];
        if (cancellation === 'cleanup') core.cleanupVariablesCore();
        else {
            ctx().chat = structuredClone(ctx().chat);
            emit('CHAT_CHANGED');
        }
        assert.equal(signal.aborted, true);
        release(true);
        await settled();
        assert.equal(money(), 70);
        assert.equal(record().entries.length, 2);
        assert.equal(host.afterAi.xbCalls.length, 0);
        assert.equal(host.afterAi.vareventCalls, 0);
    });
}

test('superseded assistant message cannot publish into a reused floor', async () => {
    let release;
    const ready = new Promise(resolve => { release = resolve; });
    host.afterAi.ready = () => ready;
    ctx().chat[1].mes += jsonIncrement('角色.金钱', -2);
    emit('MESSAGE_RECEIVED');
    ctx().chat[1] = { ...structuredClone(ctx().chat[1]), mes: text(-10) + jsonIncrement('角色.金钱', -3) };
    emit('MESSAGE_RECEIVED');
    release(true);
    await settled();
    assert.equal(money(), 67);
    assert.equal(host.afterAi.xbCalls.length, 1);
    assert.equal(host.afterAi.vareventCalls, 1);
    assert.equal(storedOps(1).some(op => op.delta === -2), false);
});

test('mode1 continues through its existing shared gate rather than State2 readiness', () => {
    host.extension_settings.LittleWhiteBox.variablesMode = '1.0';
    emit('MESSAGE_RECEIVED');
    emit('CHARACTER_MESSAGE_RENDERED');
    emit('GENERATION_ENDED');
    assert.deepEqual(host.afterAi.hints.map(hint => hint.source), ['message_received', 'character_message_rendered', 'generation_ended']);
    assert.equal(host.afterAi.waits.length, 0);
});

test('opening a saved chat does not replay requests or lose body deduplication', async () => {
    harness.executor.cleanupStateService();
    ctx().chatMetadata = structuredClone(ctx().chatMetadata);
    ctx().chat = structuredClone(ctx().chat);
    const opened = emit('CHAT_CHANGED');
    assert.equal(money(), 70);
    await opened;
    const updated = emit('MESSAGE_UPDATED');
    assert.equal(money(), 70);
    assert.deepEqual(record().entries.map(entry => entry.kind), ['text', 'call']);
    await updated;
});

test('MESSAGE_UPDATED publishes the complete body change before its callback yields', async () => {
    ctx().chat[1].mes = text(-5);
    const pending = emit('MESSAGE_UPDATED');
    assert.equal(money(), 75);
    assert.deepEqual(record().entries.map(entry => entry.kind), ['text', 'call']);
    await pending;
});

test('MESSAGE_EDITED replaces body only, preserving direct calls synchronously', async () => {
    ctx().chat[1].mes = text(-5);
    const pending = emit('MESSAGE_EDITED');
    assert.equal(money(), 75);
    assert.equal(record().entries[1].ops[0].delta, -20);
    await pending;
    ctx().chat[1].mes = 'all blocks cleaned';
    const cleaned = emit('MESSAGE_EDITED');
    assert.equal(money(), 75);
    await cleaned;
});

test('USER_MESSAGE_RENDERED synchronizes an existing user body without an after-ai gate', async () => {
    ctx().chat.push({ mes: text(-3), is_user: true, swipe_id: 0 });
    const pending = emit('USER_MESSAGE_RENDERED', 2);
    assert.equal(money(), 67);
    assert.equal(ctx().chat[2].extra[KEY].entries[0].kind, 'text');
    await pending;
});

test('new swipe clears inherited records immediately and generation start cannot cancel that publication', async () => {
    const message = ctx().chat[1];
    message.swipes = [message.mes];
    const oldExtra = structuredClone(message.extra);
    message.swipe_info = [{ extra: structuredClone(oldExtra) }];
    message.swipe_id = 1;
    const pending = emit('MESSAGE_SWIPED');
    assert.equal(money(), 100);
    assert.equal(record(), undefined);
    assert.deepEqual(message.swipe_info[0].extra, oldExtra);
    emit('GENERATION_STARTED', 'swipe');
    assert.equal(money(), 100);
    await pending;
    spend();
    assert.equal(money(), 80);
    message.mes = text(-5);
    const updated = emit('MESSAGE_UPDATED');
    assert.equal(money(), 75);
    assert.deepEqual(record().entries.map(entry => entry.kind), ['call', 'text']);
    await updated;
    message.swipe_id = 0;
    message.extra = structuredClone(oldExtra);
    message.mes = 'old body already cleaned';
    const restored = emit('MESSAGE_SWIPED');
    assert.equal(money(), 70);
    await restored;
});

for (const hostLoadsBeforeEvent of [false, true]) {
    test(`MESSAGE_SWIPE_DELETED restores selected record with host sync ${hostLoadsBeforeEvent ? 'before' : 'after'} the event`, async () => {
        const message = ctx().chat[1];
        const oldExtra = structuredClone(message.extra);
        message.swipes = ['old body already cleaned', text(-5)];
        message.swipe_info = [{ extra: structuredClone(oldExtra) }, { extra: {} }];
        message.swipe_id = 1;
        message.mes = message.swipes[1];
        message.extra = {};
        await emit('MESSAGE_SWIPED');
        assert.equal(money(), 95);
        spend();
        assert.equal(money(), 75);
        message.swipes.splice(1, 1);
        message.swipe_info.splice(1, 1);
        message.swipe_id = 0;
        if (hostLoadsBeforeEvent) {
            message.extra = structuredClone(oldExtra);
            message.mes = message.swipes[0];
        }
        message.extra.independentLiveExtra = 'preserve';
        const pending = emit('MESSAGE_SWIPE_DELETED', { messageId: 1, newSwipeId: 0 });
        assert.equal(money(), 70);
        assert.deepEqual(record(), oldExtra[KEY]);
        assert.equal(message.extra.independentLiveExtra, 'preserve');
        await pending;
        if (!hostLoadsBeforeEvent) {
            message.extra = structuredClone(message.swipe_info[0].extra);
            message.mes = message.swipes[0];
            const swiped = emit('MESSAGE_SWIPED');
            assert.equal(money(), 70);
            await swiped;
        }
    });
}

test('MESSAGE_DELETED rebuilds retained host history synchronously and cannot resurrect discarded calls', async () => {
    ctx().chat.splice(1);
    const pending = emit('MESSAGE_DELETED', 1);
    assert.equal(money(), 100);
    await pending;
    harness.executor.rebuildStateV2();
    assert.equal(money(), 100);
});

test('historical body append discards unmanaged JSON so an earlier initializer cannot resurrect it', () => {
    ctx().chat.push({ mes: '', swipe_id: 0 });
    syncBody(2, block('A.other: 7'));
    const result = syncBody(1, ctx().chat[1].mes + jsonIncrement('A.n', -10));
    assert.equal(result.errors.length, 1);
    assert.deepEqual(result.atoms, []);
    assert.deepEqual(readStoredValue(ctx(), 'A'), { other: 7 });
    const retained = storedOps(1).filter(op => op.path === 'A.n');

    syncBody(0, block('A.n: 100'));
    harness.executor.rebuildStateV2();
    assert.deepEqual({ value: readStoredValue(ctx(), 'A'), retained }, { value: { n: 100, other: 7 }, retained: [] });
});

test('body replacement cannot authorize JSON with the initializer it removes', () => {
    syncBody(1, block('历史.计数: 100'));
    const result = syncBody(1, jsonIncrement('历史.计数', 7));
    assert.equal(result.errors.length, 1);
    assert.deepEqual(result.atoms, []);
    assert.equal(readStoredValue(ctx(), '历史'), undefined);
    const retained = storedOps(1).filter(op => op.path === '历史.计数');

    syncBody(0, block('历史.计数: 10'));
    harness.executor.rebuildStateV2();
    assert.deepEqual({ value: readStoredValue(ctx(), '历史').计数, retained }, { value: 10, retained: [] });
});

test('historical applyText discards unmanaged JSON rather than recording a dormant call', async () => {
    addFutureRoot();
    const result = await globalThis.LWB_StateV2.applyText(jsonIncrement('历史.计数', 7), { floor: 1, silent: true });
    assert.equal(result.errors.length, 1);
    assert.deepEqual(result.atoms, []);
    assert.equal(readStoredValue(ctx(), '历史').计数, 100);
    const retained = storedOps(1).filter(op => op.path === '历史.计数');

    syncBody(0, block('历史.计数: 10'));
    harness.executor.rebuildStateV2();
    assert.deepEqual({ value: readStoredValue(ctx(), '历史').计数, retained }, { value: 110, retained: [] });
});

test('unrecorded swipe rejects JSON owned only by a future floor and stores no rejected request', () => {
    addFutureRoot();
    const message = ctx().chat[1];
    message.swipes = [message.mes, jsonIncrement('历史.计数', 7)];
    message.swipe_info = [{ extra: structuredClone(message.extra) }, { extra: {} }];
    message.swipe_id = 1;
    message.mes = message.swipes[1];
    message.extra = {};
    const result = harness.executor.handleStateSwipe(1);
    assert.equal(result.errors.length, 1);
    assert.deepEqual(result.atoms, []);
    assert.equal(readStoredValue(ctx(), '历史').计数, 100);
    const retained = structuredClone(storedOps(1));
    const savedOps = structuredClone((message.swipe_info[1].extra[KEY]?.entries || []).flatMap(entry => entry.ops));

    syncBody(0, block('历史.计数: 10'));
    harness.executor.rebuildStateV2();
    assert.deepEqual(
        { value: readStoredValue(ctx(), '历史').计数, retained, savedOps },
        { value: 110, retained: [], savedOps: [] },
    );
});

test('historical rejection at a checkpoint floor caches admitted records without filtering older requests', async () => {
    while (ctx().chat.length < 101) ctx().chat.push({ mes: '', swipe_id: 0 });
    syncBody(50, block('旧根.计数: 10'));
    const accepted = await globalThis.LWB_StateV2.applyText(jsonIncrement('旧根.计数', 3), { floor: 75, silent: true });
    assert.deepEqual(accepted.errors, []);
    const olderRecord = ctx().chat[75].extra[KEY];
    const olderPayload = structuredClone(olderRecord);
    syncBody(50, block('其他.计数: 1'));
    assert.equal(readStoredValue(ctx(), '旧根'), undefined);
    syncBody(100, block('历史.计数: +100'));

    const result = syncBody(99, jsonIncrement('历史.计数', 7));
    assert.equal(result.errors.length, 1);
    assert.deepEqual(result.atoms, []);
    assert.deepEqual(storedOps(99), []);
    assert.equal(ctx().chat[75].extra[KEY], olderRecord);
    assert.deepEqual(olderRecord, olderPayload);
    assert.equal(harness.executor.rebuildStateV2().usedCheckpoint, 99);
    assert.equal(readStoredValue(ctx(), '历史').计数, 100);

    syncBody(0, block('历史.计数: 10'));
    syncBody(50, block('旧根.计数: 10'));
    harness.executor.rebuildStateV2();
    assert.equal(readStoredValue(ctx(), '历史').计数, 110);
    assert.equal(readStoredValue(ctx(), '旧根').计数, 13);
    assert.deepEqual(storedOps(99), []);
    assert.equal(ctx().chat[75].extra[KEY], olderRecord);
    assert.deepEqual(olderRecord, olderPayload);

    delete ctx().chatMetadata.extensions.LittleWhiteBox.stateCkptV2;
    assert.equal(harness.executor.rebuildStateV2().usedCheckpoint, null);
    assert.equal(readStoredValue(ctx(), '历史').计数, 110);
    assert.equal(readStoredValue(ctx(), '旧根').计数, 13);
});

test('historical JSON may use a preceding initializer entry on the same floor', () => {
    ctx().chat.push({ mes: 'later turn', swipe_id: 0 });
    const initializer = block('历史.计数: 10');
    syncBody(1, initializer);
    const result = syncBody(1, initializer + jsonIncrement('历史.计数', 7));
    assert.deepEqual(result.errors, []);
    assert.equal(readStoredValue(ctx(), '历史').计数, 17);
    assert.equal(record().entries.filter(entry => entry.kind === 'text').length, 2);
    assert.deepEqual(storedOps(1).filter(op => op.source === 'json' && op.path === '历史.计数'), [
        { op: 'inc', path: '历史.计数', delta: 7, source: 'json' },
    ]);
    harness.executor.rebuildStateV2();
    assert.equal(readStoredValue(ctx(), '历史').计数, 17);
});

for (const [authority, declaration, expected] of [
    ['text', '历史.计数: 10', 17],
    ['rule', '$range=[0,100] 历史.计数', 7],
]) {
    test(`historical JSON may use preceding ${authority} authority in the same entry`, () => {
        ctx().chat.push({ mes: 'later turn', swipe_id: 0 });
        const result = syncBody(1, block(declaration) + jsonIncrement('历史.计数', 7));
        assert.deepEqual(result.errors, []);
        assert.equal(readStoredValue(ctx(), '历史').计数, expected);
        assert.equal(record().entries.filter(entry => entry.kind === 'text').length, 1);
        assert.deepEqual(storedOps(1).filter(op => op.source === 'json' && op.path === '历史.计数'), [
            { op: 'inc', path: '历史.计数', delta: 7, source: 'json' },
        ]);
        harness.executor.rebuildStateV2();
        assert.equal(readStoredValue(ctx(), '历史').计数, expected);
    });
}

test('cleanup removes registration and flushes saves without undoing an already completed call', () => {
    const result = spend();
    assert.equal(result.then, undefined);
    assert.equal(money(), 50);
    assert.equal(ctx().saveCount, 0);
    core.cleanupVariablesCore();
    assert.equal(globalThis.LWB_StateV2, undefined);
    assert.equal(host.handlers.size, 0);
    assert.equal(ctx().saveCount, 1);
    assert.equal(money(), 50);
    assert.equal(result.status, 'success');
});
