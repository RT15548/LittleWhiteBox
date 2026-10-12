import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { MEMORY_IDS, MEMORY_MATERIALS, memoryOpportunity, nextMemory, keepsakePlacements } from '../apps/game/building/memories.ts';
import { advance, emptyBuilding, projectBlueprint } from '../apps/game/building/domain.ts';
import { blueprint, generateConstruction, constructionPlans } from '../apps/game/building/generation.ts';
import { testOffers, fundBuilding } from './fixtures/building-supply-fixture.mjs';
import { placementIssue } from '../apps/game/building/rules.ts';
import { BUILDING_PARTITION, parseCommand, validateBuilding } from '../apps/game/building/partition.ts';
import { createBuildingService } from '../apps/game/building/service.ts';
import { userEconomyHarness } from './user-economy-harness.js';
import { memoryLayout } from './fixtures/building-memory-layouts.mjs';

const brief = { ...blueprint(17, 'sunroom'), materials: 20 };
const rooms = memoryLayout(brief);

test('memories certify real room relationships; nearby-looking alternatives do not count', () => {
    for (const id of MEMORY_IDS) { assert.ok(memoryOpportunity(id, brief, rooms).part, id); }
    const noGardenPath = rooms.map(p => p.kind === 'path' ? { ...p, kind: 'room' } : p);
    assert.equal(memoryOpportunity('gardenWalk', brief, noGardenPath).part, null);
    const noStudy = rooms.map(p => p.kind === 'study' ? { ...p, kind: 'room' } : p);
    assert.equal(memoryOpportunity('gardenReading', brief, noStudy).part, null);
    const noLounge = rooms.filter(p => p.kind !== 'wide');
    assert.equal(memoryOpportunity('gardenTea', brief, noLounge).part, null);
    const sharedBedroom = rooms.filter(p => !(p.kind === 'room' && p.z === 0));
    assert.equal(memoryOpportunity('quietBedroom', brief, sharedBedroom).part, null);
    assert.equal(memoryOpportunity('courtyard', brief, noLounge).part, null);
    assert.throws(() => parseCommand({ type: 'remember', memory: 'invented' }), { code: 'building_invalid' });
});

test('new procured houses can grow through every memory after delivery, using only the budget already earned', async () => {
        for (let n = 1; n <= 40; n++) {
            const seed = await generateConstruction(Math.imul(n, 2654435761) >>> 0);
            let state = emptyBuilding();
            state = advance(state, { type: 'start' }, 'start', { id: 'home', seed, offers: testOffers() });
            const b = projectBlueprint(state.projects[0]), plan = constructionPlans(b)[0];
            state = fundBuilding(state, plan);
            const layout = memoryLayout(b);
            state = advance(state, { type: 'restore', rooms: plan }, 'complete');
            state = advance(state, { type: 'finish' }, 'deliver');
            state = advance(state, { type: 'restore', rooms: layout.slice(0, 2) }, 'remodel');
            for (const room of layout.slice(2)) {
                state = advance(state, { type: 'put', part: room }, 'put-' + state.revision);
                const opportunity = nextMemory(projectBlueprint(state.projects[0]), state.projects[0].rooms, state.projects[0].memories);
                if (opportunity?.part) { state = advance(state, { type: 'remember', memory: opportunity.id }, 'memory-' + state.revision); }
            }
            while (state.projects[0].memories.length < MEMORY_IDS.length) {
                const opportunity = nextMemory(projectBlueprint(state.projects[0]), state.projects[0].rooms, state.projects[0].memories);
                assert.ok(opportunity.part); state = advance(state, { type: 'remember', memory: opportunity.id }, 'memory-' + state.revision);
            }
            assert.equal(placementIssue(projectBlueprint(state.projects[0]), state.projects[0].rooms), null);
            assert.equal(state.projects[0].site.materials, b.materials);
            assert.equal(projectBlueprint(state.projects[0]).materials, b.materials + MEMORY_IDS.length * MEMORY_MATERIALS);
        }
});

test('gifts follow a matching room, go into storage when it is removed, and reappear without resetting earned memories', () => {
    const gifts = keepsakePlacements(brief, rooms, [...MEMORY_IDS]);
    assert.equal(gifts.length, MEMORY_IDS.length);
    const noStudy = rooms.filter(p => p.kind !== 'study');
    assert.equal(keepsakePlacements(brief, noStudy, [...MEMORY_IDS]).some(g => g.id === 'gardenReading'), false);
    assert.equal(keepsakePlacements(brief, rooms, [...MEMORY_IDS]).length, MEMORY_IDS.length);
});

test('retained historical plots support all memories with only budgets already earned', async () => {
    for (const version of [1, 2, 3, 4]) {
        const file = JSON.parse(await readFile(new URL(`./fixtures/building-v${version}-user.json`, import.meta.url), 'utf8'));
        const parsed = BUILDING_PARTITION.parse(file.partitions.building); assert.ok(parsed.ok);
        let state = parsed.value;
        const home = () => state.projects.find(p => p.id === state.activeId);
        const site = structuredClone(home().site), layout = memoryLayout(projectBlueprint(home()));
        // Certify a possible remodel on the actual retained land, not a newly generated replacement plot.
        if (home().state !== 'living') {
            const plan = constructionPlans(projectBlueprint(home()))[0];
            state = fundBuilding(state, plan);
            state = advance(state, { type: 'restore', rooms: plan }, 'complete');
            state = advance(state, { type: 'finish' }, 'deliver');
        }
        state = advance(state, { type: 'restore', rooms: layout.slice(0, 2) }, 'remodel');
        for (const part of layout.slice(2)) {
            state = advance(state, { type: 'put', part }, 'put-' + state.revision);
            let opportunity = nextMemory(projectBlueprint(home()), home().rooms, home().memories);
            while (opportunity?.part) {
                state = advance(state, { type: 'remember', memory: opportunity.id }, 'memory-' + state.revision);
                opportunity = nextMemory(projectBlueprint(home()), home().rooms, home().memories);
            }
        }
        assert.equal(home().memories.length, MEMORY_IDS.length);
        assert.deepEqual(home().site, site);
        validateBuilding(state);
    }
});

const v4 = JSON.parse(await readFile(new URL('./fixtures/building-v4-user.json', import.meta.url), 'utf8'));
test('retained v4 homes open with no invented memories or money; progression persists once through uncertain writes', async () => {
    for (const mode of ['confirmed', 'rejected', 'unknown', 'written-unknown']) {
        const h = await userEconomyHarness(); await h.economy.ensureOpen();
        h.state.files.set([...h.state.files.keys()][0], structuredClone(v4));
        const service = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy); await service.refresh();
        const before = service.view(), original = structuredClone(v4.partitions.building.projects[0]);
        assert.deepEqual(before.active.rooms, original.rooms); assert.deepEqual(before.active.site, original.site);
        assert.deepEqual(before.active.memories, []);
        const request = { actionId: 'first-memory', revision: before.revision, command: { type: 'remember', memory: 'gardenWalk' } };
        h.state.mode = mode;
        if (mode === 'rejected' || mode === 'unknown') { await assert.rejects(service.act(request, () => true)); }
        else { await service.act(request, () => true); }
        h.state.mode = 'confirmed'; await service.confirm(() => true); await service.act(request, () => true);
        assert.deepEqual(service.view().active.memories, ['gardenWalk']);
        assert.equal(service.view().balance, before.balance);
        assert.equal(projectBlueprint(service.view().active).materials, original.site.materials + MEMORY_MATERIALS);
        assert.deepEqual(h.document().partitions.economy, v4.partitions.economy);
        assert.deepEqual(h.document().partitions.building.receipts, v4.partitions.building.receipts);
        await assert.rejects(service.act({ ...request, actionId: 'duplicate-memory', revision: service.view().revision }, () => true), { code: 'building_memory_incomplete' });
        const reopened = createBuildingService(h.store(BUILDING_PARTITION), h.transactions, h.economy); await reopened.refresh();
        assert.deepEqual(reopened.view().active.memories, ['gardenWalk']);
        const forged = structuredClone(h.document().partitions.building); forged.projects[0].memories.push('gardenWalk');
        assert.throws(() => validateBuilding(forged), { code: 'building_invalid' });
    }
});
