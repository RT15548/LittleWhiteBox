import assert from 'node:assert/strict';
import test from 'node:test';
import { TIERS, cells, partKey } from '../apps/game/building/policy.ts';
import { blueprint, basicPlans, certifiedPlans, generate, generateConstruction, constructionPlans, constructionBlueprint } from '../apps/game/building/generation.ts';
import { testOffers, fundBuilding } from './fixtures/building-supply-fixture.mjs';
import { inspect, placementIssue } from '../apps/game/building/rules.ts';
import { houseParts } from '../apps/game/building/house.ts';
import { routeTo } from '../apps/game/building/layout.ts';
import { advance, emptyBuilding } from '../apps/game/building/domain.ts';
import { validateBuilding, parseCommand } from '../apps/game/building/partition.ts';
const brief = { seed: 0, tier: 'terrace', width: 6, depth: 1, entryZ: 0, floors: 3, heights: [3, 3, 3, 3, 3, 3], entrance: 2, living: 2, gardenSide: -1, terraces: 1, materials: 24, sunSide: 1 };
const entry = { kind: 'hall', x: 2, y: 0, z: 0 };

test('spatial rules enforce budget, support and connected footprint independently of supply availability', () => {
    const ground = [entry, { kind: 'wide', x: 3, y: 0, z: 0 }];
    assert.equal(placementIssue(brief, ground), null);
    assert.equal(placementIssue(brief, [...ground, { kind: 'room', x: 4, y: 0, z: 0 }]), 'occupied');
    assert.equal(placementIssue(brief, [...ground, { kind: 'wide', x: 4, y: 1, z: 0 }]), 'support');
    assert.equal(placementIssue(brief, [...ground, { kind: 'wide', x: 3, y: 1, z: 0 }]), null);
    assert.equal(placementIssue({ ...brief, materials: 1 }, ground), 'materials');
    assert.equal(placementIssue(brief, [entry, { kind: 'room', x: 0, y: 0, z: 0 }]), 'connected');
    const large = [...Array.from({ length: 6 }, (_, x) => ({ kind: x === 2 ? 'hall' : 'room', x, y: 0, z: 0 })),
        ...Array.from({ length: 6 }, (_, x) => ({ kind: 'room', x, y: 1, z: 0 }))];
    assert.equal(placementIssue(brief, large), null);
    assert.equal(inspect(brief, large).habitable, true);
});

test('roofs move automatically on upward expansion and stairs join real life routes', () => {
    const rooms = [entry, { kind: 'room', x: 3, y: 0, z: 0 }];
    const before = houseParts(brief, rooms);
    assert.ok(before.some(p => p.kind === 'roof' && p.x === 3 && p.y === 1));
    rooms.push({ kind: 'study', x: 3, y: 1, z: 0 });
    const after = houseParts(brief, rooms);
    assert.equal(after.some(p => p.kind === 'roof' && p.x === 3 && p.y === 1), false);
    assert.ok(after.some(p => p.kind === 'roof' && p.x === 3 && p.y === 2));
    assert.deepEqual(routeTo(brief, after, rooms[2]), [{ x: 2, y: 0, z: 0 }, { x: 3, y: 0, z: 0 }, { x: 3, y: 1, z: 0 }]);
    assert.equal(inspect(brief, rooms).habitable, true);
    assert.equal(placementIssue(brief, [entry, rooms[2]]), 'support');
});

test('garden remains open sky and terraces occupy supported upper-floor cells', () => {
    assert.equal(placementIssue(brief, [entry, { kind: 'garden', x: 2, y: 1, z: 0 }]), 'garden');
    assert.equal(placementIssue(brief, [entry, { kind: 'terrace', x: 3, y: 0, z: 0 }]), 'terrace');
    assert.equal(placementIssue(brief, [entry, { kind: 'terrace', x: 2, y: 1, z: 0 }]), null);
    assert.equal(placementIssue(brief, [entry, { kind: 'terrace', x: 2, y: 1, z: 0 }, { kind: 'room', x: 2, y: 2, z: 0 }]), 'support');
});

for (const tier of TIERS) {
    test(`${tier}: varied seeds certify two genuinely different buildable layouts within every constraint`, async () => {
        const variants = new Set();
        for (let i = 0; i < 80; i++) {
            const seed = await generate(Math.imul(i + 1, 2654435761) >>> 0, tier), b = blueprint(seed, tier);
            const plans = certifiedPlans(b);
            assert.equal(plans.length, 2);
            variants.add(JSON.stringify([b.width, b.entrance, b.heights, b.gardenSide, b.living, b.materials]));
            const shapes = new Set();
            for (const plan of plans) {
                for (let n = 1; n <= plan.length; n++) { assert.equal(placementIssue(b, plan.slice(0, n)), null); }
                assert.equal(inspect(b, plan).fulfilled, true);
                assert.ok(houseParts(b, plan).some(p => p.kind === 'roof'));
                shapes.add(plan.flatMap(p => cells(p).map(c => `${partKey(c)}:${['room', 'wide'].includes(p.kind) ? 'living' : p.kind}`)).sort().join('|'));
            }
            assert.equal(shapes.size, 2);
            const minimums = basicPlans(b); assert.equal(minimums.length, 2);
            for (const minimum of minimums) {
                assert.equal(inspect(b, minimum).habitable, true);
                assert.equal(inspect(b, minimum).fulfilled, false);
                assert.equal(inspect(b, minimum).wishes.length, 2);
            }
        }
        assert.ok(variants.size >= 10);
    });
}

test('persisted receipts cannot omit an admission identity or forge completed house criteria', async () => {
    const seed = await generateConstruction(17);
    let state = advance(emptyBuilding(), { type: 'start' }, 'admit', { id: 'run', seed, offers: testOffers() });
    validateBuilding(state);
    const malformed = structuredClone(state); malformed.receipts[0].admission = null;
    assert.throws(() => validateBuilding(malformed));
    assert.throws(() => parseCommand({ type: 'put', part: { kind: 'roof', x: NaN, y: 0, z: 0 } }));
    const plan = constructionPlans(constructionBlueprint(seed))[0];
    state = fundBuilding(state, plan);
    for (const [i, part] of plan.filter(p => p.kind !== 'hall').entries()) { state = advance(state, { type: 'put', part }, `place-${i}`); validateBuilding(state); }
    state = advance(state, { type: 'finish' }, 'finish'); validateBuilding(state);
    state.projects[0].rooms = []; assert.throws(() => validateBuilding(state));
});

test('plot height applies to every cell of a wide room, not just its origin', () => {
    const plot = { ...brief, heights: [1, 1, 3, 2, 1, 1] };
    const rooms = [entry, { kind: 'wide', x: 3, y: 0, z: 0 }];
    assert.equal(placementIssue(plot, [...rooms, { kind: 'wide', x: 3, y: 1, z: 0 }]), 'bounds');
    assert.equal(placementIssue(plot, [...rooms, { kind: 'room', x: 3, y: 1, z: 0 }]), null);
});

test('sunroom plots require different spatial decisions, not one mirrored reward recipe', async () => {
    const plots = [], recipes = new Map();
    for (let i = 0; i < 96; i++) {
        const b = blueprint(await generate(Math.imul(i + 1, 2654435761) >>> 0, 'sunroom'), 'sunroom'); plots.push(b);
        const plans = certifiedPlans(b, Infinity);
        const wishes = new Set(plans.map(plan => JSON.stringify(plan.filter(p => ['study', 'terrace'].includes(p.kind)))));
        assert.ok(wishes.size >= 2, 'alternatives must move a wish room, not just add decoration');
        assert.ok(b.depth > 1);
        for (const plan of plans) {
            const recipe = plan.map(p => ({ ...p, x: (p.x - b.entrance) * b.sunSide }));
            recipes.set(JSON.stringify(recipe), recipe);
        }
        const oldRecipe = [{ kind: 'hall', x: b.entrance, y: 0, z: b.entryZ }, { kind: 'room', x: b.entrance + b.sunSide, y: 0, z: b.entryZ },
            { kind: 'study', x: b.entrance, y: 1, z: b.entryZ }, { kind: 'terrace', x: b.entrance + b.sunSide, y: 1, z: b.entryZ }];
        assert.equal(inspect(b, oldRecipe).fulfilled, false);
    }
    assert.deepEqual(new Set(plots.map(p => p.sunSide)), new Set([-1, 1]));
    for (const recipe of recipes.values()) {
        const wins = plots.filter(b => inspect(b, recipe.map(p => ({ ...p, x: b.entrance + p.x * b.sunSide }))).fulfilled).length;
        assert.ok(wins < plots.length * .85, 'a fixed mirrored recipe must not dominate varied plots');
    }
});

test('delivery can record both eligible award legs together, but admission and other projects cannot reuse their action identity', () => {
    const b = constructionBlueprint(17), plan = constructionPlans(b)[0];
    let active = advance(emptyBuilding(), { type: 'start' }, 'admit', { id: 'run', seed: b.seed, offers: testOffers() });
    active = fundBuilding(active, plan);
    active.projects[0].rooms = plan;
    // Eligibility is not payment: only the next accepted action may create a receipt.
    validateBuilding(active);
    const finished = advance(active, { type: 'finish' }, 'deliver'); validateBuilding(finished);
    assert.equal(finished.receipts[0].ready, 'deliver'); assert.equal(finished.receipts[0].finished, 'deliver');
    const forged = structuredClone(finished); forged.receipts[0].ready = 'admit';
    assert.throws(() => validateBuilding(forged), { code: 'building_identity' });
    const next = advance(finished, { type: 'start' }, 'admit-next', { id: 'next', seed: 17, offers: testOffers() });
    next.receipts[1].ready = 'deliver';
    assert.throws(() => validateBuilding(next), { code: 'building_identity' });
});

test('courtyard paths join wings in depth but cannot carry a floor or bridge a disconnected gap', () => {
    const b = { ...brief, depth: 3, entryZ: 2, heights: Array(18).fill(3) };
    const hall = { kind: 'hall', x: 2, y: 0, z: 2 }, path = { kind: 'path', x: 2, y: 0, z: 1 }, room = { kind: 'room', x: 2, y: 0, z: 0 };
    assert.equal(placementIssue(b, [hall, room]), 'connected');
    assert.equal(placementIssue(b, [hall, path, room]), null);
    assert.equal(placementIssue(b, [hall, path, room, { kind: 'room', x: 2, y: 1, z: 1 }]), 'support');
    assert.equal(placementIssue(b, [hall, path, room, { kind: 'path', x: 2, y: 1, z: 0 }]), 'path');
    assert.deepEqual(routeTo(b, [hall, path, room], room), [hall, path, room].map(({ x, y, z }) => ({ x, y, z })));
});
