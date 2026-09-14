import assert from 'node:assert/strict';
import test from 'node:test';
import { createDiceController } from '../apps/dice/host/controller.ts';

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
    const operation = controller.handleMessage({ type: 'dice/set-enabled', payload: { chatIdentity: 'chat-a', enabled: true } });
    identity = 'chat-b';
    release();
    await assert.rejects(operation, /聊天或页面已切换/);
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
    const operation = controller.handleMessage({ type: 'dice/set-enabled', payload: { chatIdentity: 'chat-a', enabled: false } });
    assert.equal(commitGuard(), true);
    current = false;
    assert.equal(commitGuard(), false);
    release({ status: 'confirmed' });
    await assert.rejects(operation, /聊天或页面已切换/);
    assert.equal(cancels, 0);
});
