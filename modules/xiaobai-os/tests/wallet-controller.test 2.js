import assert from 'node:assert/strict';
import test from 'node:test';
import { userEconomyHarness } from './user-economy-harness.js';
import { createWalletController } from '../apps/wallet/host/controller.js';
import { DICE_PARTITION } from '../apps/dice/partition.js';

async function fixture(mode = 'confirmed') {
    const h = await userEconomyHarness();
    h.state.mode = mode;
    const posts = [];
    const controller = createWalletController({ economy: h.economy, confirmPending: h.transactions.retryPending, adoptServerState: h.transactions.adoptServerState });
    controller.startBackground();
    const activate = () => controller.activate({ post: (_type, payload) => posts.push(payload.state) });
    async function settled() {
        for (let index = 0; index < 20; index++) {
            await new Promise(resolve => setTimeout(resolve, 0));
            if (posts.at(-1)?.status !== 'loading' && posts.length) { return posts.at(-1); }
        }
        assert.fail('wallet preparation did not settle');
    }
    return { ...h, controller, activate, settled, posts };
}

test('Wallet works without a chat and retains one account through card changes', async t => {
    const h = await fixture(); t.after(() => h.controller.stopBackground());
    h.switchStory(null);
    const first = h.activate();
    assert.equal(first.status, 'loading');
    const ready = await h.settled();
    assert.equal(ready.balance, 100);
    assert.equal(ready.transactionCount, 1);
    assert.equal(h.state.referencesCreated, 0);
    h.switchStory('b');
    h.controller.handleChatChanged();
    const updated = await h.controller.handleMessage({ type: 'wallet/refresh', payload: { activationId: first.activationId } });
    assert.equal(updated.balance, 100);
    assert.equal(h.state.writes.length, 1);
});

test('Wallet rejects an old page activation, not another chat identity', async t => {
    const h = await fixture(); t.after(() => h.controller.stopBackground());
    const old = h.activate(); await h.settled();
    const current = h.activate();
    assert.notEqual(current.activationId, old.activationId);
    await assert.rejects(h.controller.handleMessage({ type: 'wallet/refresh', payload: { activationId: old.activationId } }));
    assert.equal((await h.controller.handleMessage({ type: 'wallet/refresh', payload: { activationId: current.activationId } })).balance, 100);
});

test('Wallet confirms one pending opening after a card switch, without a second grant', async t => {
    const h = await fixture('unknown'); t.after(() => h.controller.stopBackground());
    const page = h.activate(); await h.settled();
    assert.equal(h.transactions.getFileState(), 'unconfirmed');
    assert.equal(h.economy.getPlayerBalance(), 0);
    const candidate = structuredClone(h.state.writes[0]);
    h.switchStory('b'); h.state.mode = 'confirmed';
    const confirmed = await h.controller.handleMessage({ type: 'wallet/confirm-save', payload: { activationId: page.activationId } });
    assert.equal(confirmed.state.balance, 100);
    assert.deepEqual(h.state.writes.at(-1), candidate);
    assert.equal(h.economy.getTransactionCount(), 1);
});

test('a definitely rejected opening does not display candidate money', async t => {
    const h = await fixture('rejected'); t.after(() => h.controller.stopBackground());
    h.activate(); const state = await h.settled();
    assert.equal(state.balance, 0);
    assert.notEqual(state.status, 'ready');
    assert.equal(h.document(), undefined);
});

test('Wallet reports a rejected retry and lets the user adopt saved state without another write', async t => {
    const h = await fixture(); t.after(() => h.controller.stopBackground());
    const page = h.activate(); await h.settled();
    let valid = true;
    h.state.mode = 'unknown';
    assert.equal((await h.store(DICE_PARTITION).transact(tx => tx.replace(tx.currentOrInitial()), { commitGuard: () => valid })).status, 'unconfirmed');
    const writes = h.state.writes.length;
    valid = false;
    h.state.mode = 'confirmed';
    const payload = { activationId: page.activationId };
    const rejected = await h.controller.handleMessage({ type: 'wallet/confirm-save', payload });
    assert.equal(rejected.confirmation, 'failed');
    assert.equal(rejected.state.status, 'blocked');
    assert.equal(h.state.writes.length, writes);
    const adopted = await h.controller.handleMessage({ type: 'wallet/adopt-save', payload });
    assert.equal(adopted.confirmation, 'adopted');
    assert.equal(adopted.state.status, 'ready');
    assert.equal(adopted.state.balance, 100);
    assert.equal(h.transactions.hasPendingCommit(), false);
    assert.equal(h.state.writes.length, writes);
});
