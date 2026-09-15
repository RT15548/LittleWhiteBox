import assert from 'node:assert/strict';
import test from 'node:test';
import { createDiceController } from '../apps/dice/host/controller.ts';

test('encounter preferences neither prepare the action display rule nor cancel action checks', async () => {
    let value = { schemaVersion: 1, actionChecksEnabled: true, encountersEnabled: false };
    const cancelled = [];
    const controller = createDiceController({
        peekCurrent: () => ({ identityKey: 'chat-a', value }), async read() {},
        async transact(command, options) {
            assert.equal(options.commitGuard(), true);
            command({ currentOrInitial: () => value, replace: next => { value = next; } });
            return { status: 'confirmed' };
        },
    }, { getFileState: () => 'ready', hasPendingCommit: () => false },
    async () => assert.fail('encounters do not need the action regex'), feature => cancelled.push(feature));
    await controller.activate({ isCurrent: () => true, post() {} });
    for (const enabled of [true, false]) {
        const state = await controller.handleMessage({ type: 'dice/set-feature', payload: { chatIdentity: 'chat-a', feature: 'encountersEnabled', enabled } });
        assert.equal(state.actionChecksEnabled, true);
        assert.equal(state.encountersEnabled, enabled);
    }
    assert.deepEqual(cancelled, ['encountersEnabled']);
});

test('enabling cannot write into a chat selected during the display-rule preflight', async () => {
    let identity = 'chat-a';
    let release;
    let writes = 0;
    const controller = createDiceController({
        peekCurrent: () => ({ identityKey: identity, value: { actionChecksEnabled: false } }),
        async read() {}, async transact() { writes++; return { status: 'confirmed' }; },
    }, { getFileState: () => 'ready', hasPendingCommit: () => false },
    () => new Promise(resolve => { release = resolve; }), () => {});
    await controller.activate({ isCurrent: () => identity === 'chat-a', post() {} });
    const operation = controller.handleMessage({ type: 'dice/set-feature', payload: { chatIdentity: 'chat-a', feature: 'actionChecksEnabled', enabled: true } });
    identity = 'chat-b';
    release();
    await assert.rejects(operation);
    assert.equal(writes, 0);
});

test('the preference commit guard and late confirmation belong to the captured page, never a new chain', async () => {
    let current = true;
    let commitGuard;
    let release;
    let cancels = 0;
    const controller = createDiceController({
        peekCurrent: () => ({ identityKey: 'chat-a', value: { actionChecksEnabled: true } }),
        async read() {}, async transact(_command, options) {
            commitGuard = options.commitGuard;
            return new Promise(resolve => { release = resolve; });
        },
    }, { getFileState: () => 'ready', hasPendingCommit: () => false }, async () => {}, () => { cancels++; });
    await controller.activate({ isCurrent: () => current, post() {} });
    const operation = controller.handleMessage({ type: 'dice/set-feature', payload: { chatIdentity: 'chat-a', feature: 'actionChecksEnabled', enabled: false } });
    assert.equal(commitGuard(), true);
    current = false;
    assert.equal(commitGuard(), false);
    release({ status: 'confirmed' });
    await assert.rejects(operation);
    assert.equal(cancels, 0);
});
