import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { BUILDING_PARTITION } from '../apps/game/building/partition.ts';
import { createBuildingService } from '../apps/game/building/service.ts';
import { userEconomyHarness } from './user-economy-harness.js';
import { houseParts } from '../apps/game/building/house.ts';
import { projectBlueprint } from '../apps/game/building/domain.ts';
import { materialUsed } from '../apps/game/building/rules.ts';

// Real v1 user-file capture from the previous isolated browser run. Its fee is paid,
// but the unfinished roof has not earned any reward. No synthetic current-type cast.
const fixture = JSON.parse(await readFile(new URL('./fixtures/building-v1-user.json', import.meta.url), 'utf8'));

test('v1 room geometry, project identity and paid receipts survive a one-way conversion', () => {
    const original = fixture.partitions.building;
    const parsed = BUILDING_PARTITION.parse(original);
    assert.equal(parsed.ok, true);
    const data = parsed.value, before = original.projects[0], after = data.projects[0];
    assert.equal(data.format, 7);
    assert.deepEqual(data.receipts, original.receipts);
    assert.deepEqual(after.rooms, [{ kind: 'hall', x: 3, y: 0, z: 1 }, { kind: 'room', x: 4, y: 0, z: 1 }]);
    assert.equal(after.id, before.id); assert.equal(after.saved, before.saved);
    assert.equal(data.last.id, original.last.id);
    const house = houseParts(projectBlueprint(after), after.rooms);
    assert.equal(house.filter(p => p.kind === 'roof').length, 2);
    const serialized = BUILDING_PARTITION.serialize(data);
    assert.equal('parts' in serialized.projects[0], false);
    assert.deepEqual(BUILDING_PARTITION.parse(serialized).value, data);
    assert.deepEqual(original, fixture.partitions.building);
});

test('reading a converted eligible house never mints money; a normal edit settles the missing base leg once', async () => {
    const h = await userEconomyHarness(); await h.economy.ensureOpen();
    const filename = [...h.state.files.keys()][0]; h.state.files.set(filename, structuredClone(fixture));
    const service = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy);
    await service.refresh();
    assert.equal(service.view().balance, 50); assert.equal(service.view().award, 0);
    assert.equal(service.view().inspection.habitable, true);
    const request = { actionId: 'edit-converted', revision: service.view().revision, command: { type: 'put', part: { kind: 'path', x: service.view().active.site.entrance, y: 0, z: 0 } } };
    await service.act(request, () => true); await service.act(request, () => true);
    assert.equal(service.view().balance, 100); assert.equal(service.view().award, 50);
    assert.equal(h.document().partitions.building.format, 7);
    assert.equal(h.document().partitions.economy.transactions.filter(t => t.kind === 'building_ready').length, 1);
    assert.deepEqual(h.document().partitions.economy.transactions.slice(0, 2), fixture.partitions.economy.transactions);
});

// Actual user-played v2 work from the isolated preview, including its original ledger.
const v2 = JSON.parse(await readFile(new URL('./fixtures/building-v2-user.json', import.meta.url), 'utf8'));
test('a paid v2 work keeps its original plot, budget, rooms and money through save and reload', async () => {
    const h = await userEconomyHarness(); await h.economy.ensureOpen();
    const filename = [...h.state.files.keys()][0]; h.state.files.set(filename, structuredClone(v2));
    const service = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy);
    await service.refresh();
    const old = v2.partitions.building.projects[0], current = service.view().active, balance = service.view().balance;
    assert.deepEqual(current.rooms, old.rooms.map(p => ({ ...p, z: 1 }))); assert.equal(current.site.width, 5); assert.equal(current.site.entrance, 3);
    assert.equal(current.site.materials, 17); assert.deepEqual(current.site.heights, [...Array(5).fill(1), ...Array(5).fill(2), ...Array(5).fill(1)]);
    assert.ok(materialUsed(current.rooms) > 6, 'this actual work would fail the new-project budget');
    assert.equal(service.view().award, 140);
    await service.act({ actionId: 'keep-v2-work', revision: service.view().revision, command: { type: 'collect', runId: old.id, save: true } }, () => true);
    const reloaded = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy); await reloaded.refresh();
    assert.equal(reloaded.view().balance, balance);
    assert.deepEqual(reloaded.view().collection[0].site, current.site);
    assert.deepEqual(h.document().partitions.economy, v2.partitions.economy);
    assert.deepEqual(h.document().partitions.building.receipts, v2.partitions.building.receipts);
    for (const broken of [{ ...current.site, heights: [2] }, { ...current.site, entrance: 8 }, { ...current.site, materials: 1 }]) {
        const bad = structuredClone(h.document().partitions.building); bad.projects[0].site = broken;
        assert.equal(BUILDING_PARTITION.parse(bad).ok, false);
    }
});

const v3 = JSON.parse(await readFile(new URL('./fixtures/building-v3-user.json', import.meta.url), 'utf8'));
test('actual v3 home gains courtyard depth without changing paid facts, awards or the existing footprint', async () => {
    const h = await userEconomyHarness(); await h.economy.ensureOpen();
    h.state.files.set([...h.state.files.keys()][0], structuredClone(v3));
    const service = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy); await service.refresh();
    const old = v3.partitions.building.projects[0], home = service.view().active;
    assert.equal(home.state, 'living');
    assert.deepEqual(home.rooms, old.rooms.map(p => ({ ...p, z: 1 })));
    assert.equal(home.site.materials, old.site.materials);
    assert.deepEqual(home.site.heights.slice(home.site.width, home.site.width * 2), old.site.heights);
    const before = service.view().balance;
    await service.act({ actionId: 'remodel-v3-path', revision: service.view().revision, command: { type: 'put', part: { kind: 'path', x: home.site.entrance, y: 0, z: 2 } } }, () => true);
    await assert.rejects(service.act({ actionId: 'redeliver-v3', revision: service.view().revision, command: { type: 'finish' } }, () => true), { code: 'building_finished' });
    assert.equal(service.view().balance, before);
    assert.deepEqual(h.document().partitions.building.receipts, v3.partitions.building.receipts);
    assert.deepEqual(h.document().partitions.economy, v3.partitions.economy);
});

// Actual current-format remodeled user home; earned completion is not re-judged against today's layout.
const v5 = JSON.parse(await readFile(new URL('./fixtures/building-v5-user.json', import.meta.url), 'utf8'));
const v6 = JSON.parse(await readFile(new URL('./fixtures/building-v6-user.json', import.meta.url), 'utf8'));
test('the actual five-batch user work keeps acquired materials and its last visible offer when the flow becomes three batches', async () => {
    const h = await userEconomyHarness(); await h.economy.ensureOpen();
    h.state.files.set([...h.state.files.keys()][0], structuredClone(v6));
    const service = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy); await service.refresh();
    const old = v6.partitions.building.projects.find(p => p.id === v6.partitions.building.activeId), current = service.view().active;
    assert.deepEqual(current.rooms, old.rooms); assert.deepEqual(current.site, old.site);
    assert.deepEqual(current.supply.owned, [...old.supply.initial, ...old.supply.picks.flat()]);
    assert.equal(current.supply.remaining, 1);
    assert.deepEqual(current.supply.offers, [['garden', 'room', 'room'], ['study', 'garden'], ['wide', 'room']]);
    assert.deepEqual(h.document(), v6);
    await service.act({actionId: 'take-retained-last-batch', revision: service.view().revision, command: {type: 'choose', choice: 2}}, () => true);
    assert.equal(service.view().active.supply.remaining, 0);
    assert.deepEqual(service.view().active.supply.owned, [...current.supply.owned, 'wide', 'room']);
    assert.deepEqual(h.document().partitions.economy, v6.partitions.economy);
    assert.deepEqual(h.document().partitions.building.receipts, v6.partitions.building.receipts);
    for (const p of h.document().partitions.building.projects.filter(p => p.id !== current.id)) {
        assert.deepEqual(p, v6.partitions.building.projects.find(old => old.id === p.id));
    }
    const reopened = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy); await reopened.refresh();
    assert.deepEqual(reopened.view().active, service.view().active);
});
const campaign = JSON.parse(await readFile(new URL('./fixtures/building-v5-campaign-user.json', import.meta.url), 'utf8'));
test('the user-played four-house campaign retains every house, receipt and wallet entry after procurement migration', async () => {
    const h = await userEconomyHarness(); await h.economy.ensureOpen();
    h.state.files.set([...h.state.files.keys()][0], structuredClone(campaign));
    const service = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy); await service.refresh();
    const parsed = BUILDING_PARTITION.parse(campaign.partitions.building);
    assert.equal(parsed.ok, true);
    assert.deepEqual(parsed.value.projects, campaign.partitions.building.projects.map(p => ({ ...p, supply: null })));
    assert.deepEqual(parsed.value.receipts, campaign.partitions.building.receipts);
    assert.equal(service.view().balance, 430);
    assert.deepEqual(h.document(), campaign);
    const home = service.view().active;
    await service.act({ actionId: 'persist-campaign', revision: service.view().revision, command: { type: 'collect', runId: home.id, save: true } }, () => true);
    assert.deepEqual(h.document().partitions.economy, campaign.partitions.economy);
    assert.deepEqual(h.document().partitions.building.receipts, campaign.partitions.building.receipts);
});
test('a retained completed home keeps its land, rooms, memories and settled money when procurement replaces stages', async () => {
    const h = await userEconomyHarness(); await h.economy.ensureOpen();
    h.state.files.set([...h.state.files.keys()][0], structuredClone(v5));
    const service = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy); await service.refresh();
    assert.deepEqual(service.view().active, { ...v5.partitions.building.projects[0], supply: null });
    assert.equal(service.view().inspection.fulfilled, false);
    assert.equal(service.view().award, 140);
    assert.deepEqual(h.document(), v5);
    const old = structuredClone(service.view().active);
    await service.act({ actionId: 'build-new-house', revision: service.view().revision, command: { type: 'start' } }, () => true);
    assert.deepEqual(service.view().collection.find(p => p.id === old.id), { ...old, saved: true });
    assert.equal(service.view().award, 0);
    assert.deepEqual(h.document().partitions.building.receipts.slice(0, -1), v5.partitions.building.receipts);
    assert.deepEqual(h.document().partitions.economy.transactions.slice(0, -1), v5.partitions.economy.transactions);
});
