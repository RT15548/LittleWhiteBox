import assert from 'node:assert/strict';
import test from 'node:test';
import { userEconomyHarness } from './user-economy-harness.js';
import { BUILDING_PARTITION } from '../apps/game/building/partition.ts';
import { createBuildingService } from '../apps/game/building/service.ts';
import { basicPlans, constructionPlans } from '../apps/game/building/generation.ts';
import { projectBlueprint } from '../apps/game/building/domain.ts';
import { delivery } from '../apps/game/building/delivery.ts';
import { SUPPLY_ROUNDS, drawOffers } from '../apps/game/building/supply.ts';
import { testOffers, chooseFor } from './fixtures/building-supply-fixture.mjs';
import { BUILDING_POLICY as P, PROJECT_TIER, TIER_RULES } from '../apps/game/building/policy.ts';
const award = TIER_RULES[PROJECT_TIER].award;
async function setup(files, dependencies = {}) {
    const h = await userEconomyHarness({ files });
    const service = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy,
        { seed: () => 17, id: () => crypto.randomUUID(), draw: testOffers, ...dependencies });
    await h.economy.ensureOpen(); await service.refresh();
    const request = command => ({ actionId: crypto.randomUUID(), revision: service.view().revision, command });
    const act = command => service.act(request(command), () => true);
    const plan = () => constructionPlans(projectBlueprint(service.view().active))[0];
    async function acquire(parts) {
        while (service.view().active.supply.remaining) {
            await act({ type: 'choose', choice: chooseFor(service.view().active.supply, parts) });
        }
    }
    async function build(parts = plan()) {
        await acquire(parts);
        for (const part of parts.filter(p => p.kind !== 'hall')) await act({ type: 'put', part });
    }
    return { ...h, service, request, act, plan, build, acquire };
}

test('full goals leave construction open; only deliberate delivery settles the remaining award', async () => {
    const h = await setup(); await h.act({ type: 'start' });
    assert.equal(h.service.view().balance, 100 - P.fee);
    await assert.rejects(h.act({ type: 'finish' }), { code: 'building_incomplete' });
    await h.build();
    const built = h.service.view();
    assert.equal(delivery(projectBlueprint(built.active), built.active.rooms).bonus, true);
    assert.equal(built.active.state, 'building');
    assert.equal(built.award, P.habitableAward);
    assert.ok(built.active.supply);
    const finish = h.request({ type: 'finish' });
    await h.service.act(finish, () => true); await h.service.act(finish, () => true);
    assert.equal(h.service.view().active.state, 'living');
    assert.equal(h.service.view().active.supply, null);
    assert.equal(h.service.view().award, award);
    assert.equal(h.service.view().balance, 100 - P.fee + award);
    const receipt = structuredClone(h.document().partitions.building.receipts[0]);
    const minimum = basicPlans(projectBlueprint(h.service.view().active))[0];
    await h.act({ type: 'restore', rooms: minimum });
    assert.equal(h.service.view().balance, 100 - P.fee + award);
    assert.deepEqual(h.document().partitions.building.receipts[0], receipt);
    await assert.rejects(h.act({ type: 'finish' }), { code: 'building_finished' });
});

test('minimum delivery is explicit and final; free home remodeling never backfills the forgone bonus', async () => {
    const h = await setup(); await h.act({ type: 'start' });
    const full = h.plan(), study = full.find(p => p.kind === 'study');
    const minimum = full.map(p => p === study ? { ...p, kind: 'room' } : p);
    await h.build(minimum);
    const result = delivery(projectBlueprint(h.service.view().active), minimum);
    assert.equal(result.ready, true); assert.equal(result.bonus, false);
    await h.act({ type: 'finish' });
    assert.equal(h.service.view().active.state, 'living'); assert.equal(h.service.view().award, P.habitableAward);
    await h.act({ type: 'refit', x: study.x, y: study.y, z: study.z, kind: 'study' });
    assert.equal(delivery(projectBlueprint(h.service.view().active), h.service.view().active.rooms).bonus, true);
    assert.equal(h.service.view().award, P.habitableAward);
    assert.equal(h.document().partitions.building.receipts[0].finished, null);
    const reopened = await setup(h.state.files);
    assert.equal(reopened.service.view().balance, 100);
    assert.deepEqual(reopened.service.view().active, h.service.view().active);
});

test('supply choices survive reload, cannot be rerolled or spent twice, and share the layout revision boundary', async () => {
    const h = await setup(); await h.act({ type: 'start' });
    const original = h.service.view(), packs = original.active.supply.offers;
    const pick = h.request({ type: 'choose', choice: 1 });
    await h.service.act(pick, () => true); await h.service.act(pick, () => true);
    assert.deepEqual(h.service.view().active.supply.owned, [...original.active.supply.owned, ...packs[1]]);
    assert.equal(h.service.view().active.supply.remaining, SUPPLY_ROUNDS - 1);
    assert.equal(h.service.view().balance, original.balance);
    await assert.rejects(h.service.act({ ...pick, command: { type: 'choose', choice: 2 } }, () => true), { code: 'building_identity' });
    const reopened = await setup(h.state.files);
    assert.deepEqual(reopened.service.view().active.supply, h.service.view().active.supply);
    assert.deepEqual(reopened.service.view().active.supply.offers, h.service.view().active.supply.offers);
    for (let i = 1; i < SUPPLY_ROUNDS; i++) await reopened.act({ type: 'choose', choice: 0 });
    await assert.rejects(reopened.act({ type: 'choose', choice: 0 }), { code: 'building_supply' });
});

test('put, restore and refit all enforce acquired room kinds; demolition returns stock without reclaiming base money', async () => {
    const h = await setup(); await h.act({ type: 'start' });
    const minimum = basicPlans(projectBlueprint(h.service.view().active))[0], room = minimum[1];
    await assert.rejects(h.act({ type: 'put', part: { ...room, kind: 'study' } }), { code: 'building_stock' });
    await h.build(minimum); assert.equal(h.service.view().award, P.habitableAward);
    await assert.rejects(h.act({ type: 'refit', ...room, kind: 'study' }), { code: 'building_stock' });
    await assert.rejects(h.act({ type: 'restore', rooms: minimum.map(p => p === room ? { ...p, kind: 'study' } : p) }), { code: 'building_stock' });
    await h.act({ type: 'remove', x: room.x, y: room.y, z: room.z });
    await h.act({ type: 'put', part: room });
    assert.equal(h.service.view().balance, 100);
    assert.equal(h.document().partitions.economy.transactions.filter(t => t.kind === 'building_ready').length, 1);
});

test('a different previous choice cannot bias the next random draw; the last selection does not draw a fourth batch', async () => {
    const original = await setup(); await original.act({ type: 'start' });
    const files = new Map([...original.state.files].map(([key, value]) => [key, structuredClone(value)]));
    let drawsA = 0, drawsB = 0;
    const a = await setup(new Map(files), { draw: (...args) => { assert.deepEqual(args, []); drawsA++; return drawOffers(() => 37); } });
    const b = await setup(new Map(files), { draw: (...args) => { assert.deepEqual(args, []); drawsB++; return drawOffers(() => 37); } });
    await a.act({ type: 'choose', choice: 0 }); await b.act({ type: 'choose', choice: 2 });
    assert.notDeepEqual(a.service.view().active.supply.owned, b.service.view().active.supply.owned);
    assert.deepEqual(a.service.view().active.supply.offers, b.service.view().active.supply.offers);
    const displayed = structuredClone(a.service.view().active.supply.offers);
    const reopened = await setup(a.state.files, { draw: () => { throw new Error('a read cannot draw'); } });
    assert.deepEqual(reopened.service.view().active.supply.offers, displayed);
    await a.act({ type: 'choose', choice: 0 }); await a.act({ type: 'choose', choice: 0 });
    assert.equal(drawsA, SUPPLY_ROUNDS - 1); assert.equal(drawsB, 1);
    assert.deepEqual(a.service.view().active.supply.offers, []);
    await assert.rejects(a.act({ type: 'choose', choice: 0 }), { code: 'building_supply' });
    assert.equal(drawsA, SUPPLY_ROUNDS - 1);
});

test('unconfirmed selection retains the same candidate next draw through confirmation, with no duplicate acquisition', async () => {
    const h = await setup(undefined, { draw: () => drawOffers(() => 91) }); await h.act({ type: 'start' });
    const before = h.service.view().active.supply;
    h.state.mode = 'unknown'; const request = h.request({ type: 'choose', choice: 1 });
    await assert.rejects(h.service.act(request, () => true));
    assert.deepEqual(h.service.view().active.supply, before);
    h.state.mode = 'confirmed'; await h.service.confirm(() => true); await h.service.act(request, () => true);
    assert.deepEqual(h.service.view().active.supply.offers, drawOffers(() => 91));
    assert.deepEqual(h.service.view().active.supply.owned, [...before.owned, ...before.offers[1]]);
    assert.equal(h.service.view().active.supply.remaining, SUPPLY_ROUNDS - 1);
});

test('unfinished work resumes; abandonment closes supplies and keeps already paid money', async () => {
    const h = await setup(); await h.act({ type: 'start' });
    await h.build(basicPlans(projectBlueprint(h.service.view().active))[0]);
    const reopened = await setup(h.state.files); assert.deepEqual(reopened.service.view().active, h.service.view().active);
    await reopened.act({ type: 'abandon' });
    assert.equal(reopened.service.view().award, P.habitableAward); assert.equal(reopened.service.view().active.supply, null);
    await assert.rejects(reopened.act({ type: 'finish' }));
    await assert.rejects(reopened.act({ type: 'choose', choice: 0 }));
    await reopened.act({ type: 'start' }); assert.equal(reopened.service.view().award, 0);
});

test('collection capacity rejects replacement before payment; removing a house preserves all its money facts', async () => {
    const h = await setup(); let first;
    for (let i = 0; i <= P.collectionSize; i++) {
        await h.act({ type: 'start' }); await h.build(); await h.act({ type: 'finish' });
        first ??= h.service.view().active.id;
    }
    const before = h.service.view(), receipts = structuredClone(h.document().partitions.building.receipts);
    await assert.rejects(h.act({ type: 'start' }), { code: 'building_collection_full' });
    assert.equal(h.service.view().balance, before.balance); assert.deepEqual(h.service.view().active, before.active);
    await h.act({ type: 'collect', runId: first, save: false });
    assert.equal(h.document().partitions.building.projects.some(p => p.id === first), false);
    assert.deepEqual(h.document().partitions.building.receipts, receipts);
    assert.equal(h.service.view().balance, before.balance);
    await h.act({ type: 'start' });
    assert.ok(h.service.view().collection.some(p => p.id === before.active.id));
});

for (const mode of ['rejected', 'unknown', 'written-unknown']) {
    test(`${mode}: manual delivery saves house and award atomically; exact restart recovery pays once`, async () => {
        const h = await setup(); await h.act({ type: 'start' }); await h.build();
        const before = h.service.view(), finish = h.request({ type: 'finish' });
        h.state.mode = mode;
        if (mode === 'written-unknown') await h.service.act(finish, () => true);
        else await assert.rejects(h.service.act(finish, () => true));
        const reopened = await setup(h.state.files), saved = reopened.service.view();
        assert.equal(saved.active.state, mode === 'written-unknown' ? 'living' : 'building');
        assert.equal(saved.balance, mode === 'written-unknown' ? 100 - P.fee + award : before.balance);
        await reopened.service.act(finish, () => true); await reopened.service.act(finish, () => true);
        assert.equal(reopened.service.view().active.supply, null);
        assert.equal(reopened.service.view().award, award);
        assert.equal(reopened.document().partitions.economy.transactions.filter(t => t.kind === 'building_finished').length, 1);
    });
    test(`${mode}: an uncertain pack resumes the same offered bundle and never advances two batches`, async () => {
        const h = await setup(); await h.act({ type: 'start' });
        const pick = h.request({ type: 'choose', choice: 2 }), before = h.service.view().active.supply;
        h.state.mode = mode;
        if (mode === 'written-unknown') await h.service.act(pick, () => true);
        else await assert.rejects(h.service.act(pick, () => true));
        const reopened = await setup(h.state.files);
        await reopened.service.act(pick, () => true); await reopened.service.act(pick, () => true);
        assert.deepEqual(reopened.service.view().active.supply.owned, [...before.owned, ...before.offers[2]]);
        assert.equal(reopened.service.view().active.supply.remaining, SUPPLY_ROUNDS - 1);
        assert.equal(reopened.service.view().balance, 50);
    });
    test(`${mode}: paid admission and first-bedroom refund recover once across chat changes`, async () => {
        const h = await setup(); const start = h.request({ type: 'start' }); h.state.mode = mode;
        if (mode === 'written-unknown') await h.service.act(start, () => true);
        else await assert.rejects(h.service.act(start, () => true));
        h.switchStory('b'); h.state.mode = 'confirmed'; await h.service.confirm(() => true); await h.service.act(start, () => true);
        assert.equal(h.service.view().balance, 50);
        const structure = basicPlans(projectBlueprint(h.service.view().active))[0];
        const ready = h.request({ type: 'put', part: structure.at(-1) }); h.state.mode = mode;
        if (mode === 'written-unknown') await h.service.act(ready, () => true);
        else await assert.rejects(h.service.act(ready, () => true));
        h.state.mode = 'confirmed'; await h.service.confirm(() => true); await h.service.act(ready, () => true);
        assert.equal(h.service.view().balance, 100);
        const txs = h.document().partitions.economy.transactions;
        assert.equal(txs.filter(t => t.kind === 'building_fee').length, 1);
        assert.equal(txs.filter(t => t.kind === 'building_ready').length, 1);
    });
}

test('generation failure, invalid placement, stale identity and insufficient money cannot spend or reroll a paid plot', async () => {
    const broken = await setup(undefined, { generate: async () => { throw new Error('generation'); } });
    await assert.rejects(broken.act({ type: 'start' })); assert.equal(broken.service.view().balance, 100);
    const h = await setup(), start = h.request({ type: 'start' }); await h.service.act(start, () => true);
    await assert.rejects(h.act({ type: 'start' }));
    await assert.rejects(h.act({ type: 'put', part: { kind: 'roof', x: 0, y: 0, z: 2 } }));
    assert.equal(h.service.view().active.rooms.length, 1); assert.equal(h.service.view().balance, 50);
    await assert.rejects(h.service.act({ ...start, command: { type: 'abandon' } }, () => true), { code: 'building_identity' });
    await h.act({ type: 'abandon' }); await h.act({ type: 'start' }); await h.act({ type: 'abandon' });
    await assert.rejects(h.act({ type: 'start' }), { code: 'building_funds' });
    assert.equal(h.service.view().balance, 0);
});

test('late generation after chat invalidation or story activity cannot authorize a debit', async () => {
    let resolveSeed, allowed = true, idle = true;
    const h = await setup(undefined, { generate: () => new Promise(resolve => { resolveSeed = resolve; }), idle: () => idle });
    const pending = h.service.act(h.request({ type: 'start' }), () => allowed);
    allowed = false; resolveSeed(17); await assert.rejects(pending, { code: 'building_unavailable' });
    assert.equal(h.service.view().balance, 100); assert.equal(h.service.view().active, null);
    allowed = true; idle = false;
    await assert.rejects(h.service.act(h.request({ type: 'start' }), () => allowed), { code: 'building_unavailable' });
});

test('a building write preserves unrelated legacy data and rejects forged building ledger entries', async () => {
    const h = await setup(), document = h.document(), filename = [...h.state.files.keys()][0];
    document.partitions.retired_game = { retained: 'user-owned-data' }; h.state.files.set(filename, document);
    await h.service.refresh(); await h.act({ type: 'start' });
    assert.deepEqual(h.document().partitions.retired_game, document.partitions.retired_game);
    const tampered = h.document(), fee = tampered.partitions.economy.transactions.find(t => t.kind === 'building_fee');
    fee.actionId = 'forged-action'; h.state.files.set(filename, tampered);
    const reopened = await setup(h.state.files);
    await assert.rejects(reopened.act({ type: 'abandon' }), { code: 'building_invalid' });
});

test('a delivered house remains freely editable across new construction and returning home', async () => {
    const h = await setup(); await h.act({ type: 'start' }); await h.build(); await h.act({ type: 'finish' });
    const home = h.service.view().active, balance = h.service.view().balance;
    await h.act({ type: 'restore', rooms: basicPlans(projectBlueprint(home))[0] });
    await h.act({ type: 'start' });
    assert.ok(h.service.view().collection.some(p => p.id === home.id));
    await assert.rejects(h.act({ type: 'reside', runId: home.id }), { code: 'building_active' });
    await h.act({ type: 'abandon' }); await h.act({ type: 'reside', runId: home.id });
    assert.equal(h.service.view().active.supply, null);
    await h.act({ type: 'put', part: { kind: 'path', x: home.site.entrance, y: 0, z: 1 } });
    assert.equal(h.service.view().balance, balance - P.fee);
});
