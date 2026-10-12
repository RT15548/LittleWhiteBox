import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { userEconomyHarness } from './user-economy-harness.js';
import { EXPEDITION_PARTITION } from '../apps/game/expedition/partition.ts';
import { createExpeditionService } from '../apps/game/expedition/service.ts';
import { OUTFITS, ownsOutfit } from '../apps/game/expedition/outfits.ts';
import { emptyExpedition } from '../apps/game/expedition/domain.ts';
import { withExpeditionRuntime } from '../apps/game/expedition/host.ts';

// Captured wallet/receipt projection; old random-room progress is not part of this money contract.
const fixture = JSON.parse(await readFile(new URL('./fixtures/expedition-wallet.json', import.meta.url), 'utf8'));
fixture.expedition = { ...emptyExpedition(), ...fixture.expedition };
async function setup(files) {
    const h = await userEconomyHarness({ files, initialPartitions: async () => structuredClone(fixture) }); await h.economy.ensureOpen();
    const service = createExpeditionService(h.store(EXPEDITION_PARTITION), h.transactions, h.economy); await service.refresh();
    const request = command => ({ actionId: crypto.randomUUID(), revision: service.view().data.revision, command });
    return { ...h, service, request, act: command => service.act(request(command), () => true) };
}
test('purchase, wallet debit, ownership and reload are one transaction without altering awards or the active outfit', async () => {
    const h = await setup(), before = h.service.view();
    assert.ok(ownsOutfit(before.data, 'sovereign'));
    const purchase = h.request({ type: 'purchase', id: 'witch' }); await h.service.act(purchase, () => true);
    const bought = h.service.view(); assert.equal(bought.balance, before.balance - OUTFITS.witch.price); assert.ok(ownsOutfit(bought.data, 'witch'));
    assert.deepEqual(bought.data.awards, before.data.awards); assert.deepEqual(bought.data.active, before.data.active);
    await h.service.act(purchase, () => true); assert.equal(h.service.view().balance, bought.balance);
    await assert.rejects(h.act({ type: 'purchase', id: 'witch' }), { code: 'expedition_locked' });
    await h.act({ type: 'equip', id: 'witch' }); assert.equal(h.service.view().data.equippedOutfit, 'witch');
    const reloaded = await setup(h.state.files); assert.equal(reloaded.service.view().balance, bought.balance); assert.equal(reloaded.service.view().data.equippedOutfit, 'witch');
});
test('insufficient funds and achievement-only outfits never leave partial ownership', async () => {
    const h = await setup(); await h.act({ type: 'purchase', id: 'stargazer' }); const before = h.service.view();
    await assert.rejects(h.act({ type: 'purchase', id: 'frostbound' }), { code: 'expedition_funds' });
    await assert.rejects(h.act({ type: 'purchase', id: 'sovereign' }), { code: 'expedition_locked' });
    assert.deepEqual(h.service.view().data, before.data); assert.equal(h.service.view().balance, before.balance); assert.equal(h.service.view().pending, false);
});
for (const mode of ['rejected', 'unknown', 'lost-response']) {
    test(`outfit purchase recovers ${mode} persistence exactly once`, async () => {
        const h = await setup(), before = h.service.view(), request = h.request({ type: 'purchase', id: 'ranger' });
        h.state.mode = mode;
        if (mode === 'lost-response') { await h.service.act(request, () => true); assert.equal(h.service.view().balance, before.balance - OUTFITS.ranger.price); }
        else { await assert.rejects(h.service.act(request, () => true)); assert.equal(h.service.view().balance, before.balance); assert.equal(ownsOutfit(h.service.view().data, 'ranger'), false); }
        h.state.mode = 'confirmed'; await h.service.confirm(() => true); await h.service.confirm(() => true);
        assert.equal(h.service.view().balance, before.balance - OUTFITS.ranger.price); assert.equal(h.service.view().data.purchases.length, 1);
        await h.service.act(request, () => true); assert.equal(h.service.view().data.purchases.length, 1);
        const reloaded = await setup(h.state.files); assert.equal(reloaded.service.view().balance, h.service.view().balance);
    });
}

for (const mode of ['confirmed', 'rejected', 'unknown']) {
    test(`explicit invalid-journey rebuild preserves the current wallet and rights across ${mode} persistence`, async () => {
        const h = await userEconomyHarness({ initialPartitions: async () => ({ ...structuredClone(fixture), expedition: { unreadable: true } }) });
        await h.economy.ensureOpen();
        const service = createExpeditionService(h.store(EXPEDITION_PARTITION), h.transactions, h.economy);
        const messages = [], runtime = withExpeditionRuntime({}, service, () => 'chat');
        await runtime.activate({ post: (type, payload) => messages.push({ type, payload }) });
        await runtime.startBackground();
        const send = type => runtime.handleMessage({ type: `game/expedition/${type}`, payload: { chatIdentity: 'chat', actionId: 'explicit-discard' } });
        await assert.rejects(send('read'), { code: 'expedition_data_invalid' });
        const money = structuredClone(h.document().partitions.economy), balance = h.economy.getPlayerBalance();
        h.state.mode = mode;
        if (mode === 'confirmed') { await send('rebuild'); }
        else {
            await assert.rejects(send('rebuild'), { code: mode === 'rejected' ? 'expedition_save_failed' : 'expedition_save_unconfirmed' });
            assert.equal(messages.at(-1).payload.code, mode === 'rejected' ? 'expedition_save_failed' : 'expedition_save_unconfirmed');
            assert.deepEqual(h.document().partitions.expedition, { unreadable: true });
            h.state.mode = 'confirmed'; await send('confirm');
        }
        const after = service.view();
        assert.equal(after.data.active, null); assert.equal(after.balance, balance); assert.equal(after.pending, false);
        assert.deepEqual(after.data.awards, fixture.expedition.awards);
        assert.deepEqual(after.data.purchases, fixture.expedition.purchases);
        assert.deepEqual(h.document().partitions.economy, money);
        await assert.rejects(send('rebuild'), { code: 'expedition_unavailable' });
        const reloaded = await setup(h.state.files); assert.deepEqual(reloaded.service.view().data, after.data);
        await runtime.stopBackground();
    });
}
