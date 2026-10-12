import assert from 'node:assert/strict';
import test from 'node:test';
import { constructionBlueprint, constructionPlans, generateConstruction } from '../apps/game/building/generation.ts';
import { delivery } from '../apps/game/building/delivery.ts';
import { drawOffers, validOffers, SUPPLY_CHOICES, SUPPLY_ROUNDS } from '../apps/game/building/supply.ts';
import { placementIssue, legalPlaces } from '../apps/game/building/rules.ts';
import { ROOM_CHOICES, cells, columnHeight } from '../apps/game/building/policy.ts';

test('land certification checks spatial routes without guaranteeing future random materials', async () => {
    for (let seed = 0; seed < 40; seed++) {
        const admitted = await generateConstruction(Math.imul(seed + 1, 2654435761) >>> 0);
        const brief = constructionBlueprint(admitted), plans = constructionPlans(brief);
        assert.equal(plans.length, 2);
        assert.ok(plans.some(rooms => rooms.every(p => p.y === 0)));
        assert.ok(plans.some(rooms => rooms.some(p => p.kind === 'terrace')));
        for (const rooms of plans) {
            assert.equal(placementIssue(brief, rooms), null);
            assert.equal(delivery(brief, rooms).bonus, true);
        }
    }
});

test('fresh independent draws can omit terraces for all three rounds; no wish material is forced into the pool', () => {
    let omittedRun = false;
    const variants = new Set();
    for (let seed = 0; seed < 256; seed++) {
        let entropy = seed;
        const random = () => { entropy = (Math.imul(entropy, 1664525) + 1013904223) >>> 0; return entropy; };
        const draws = Array.from({length: SUPPLY_ROUNDS}, () => drawOffers(random));
        for (const offered of draws) {
            assert.equal(offered.length, SUPPLY_CHOICES);
            assert.equal(validOffers(offered), true);
            variants.add(JSON.stringify(offered));
        }
        if (!draws.flat(2).includes('terrace')) omittedRun = true;
    }
    assert.equal(omittedRun, true);
    assert.ok(variants.size > 20);
    const first = drawOffers(() => 17), second = drawOffers(() => 17);
    first[0].pop();
    assert.notDeepEqual(first, second);
    assert.deepEqual(drawOffers(() => 17), second);
    assert.equal(validOffers([second[0], second[0], second[0]]), false);
});

test('cut-out land cannot accept any room footprint, including a wide room crossing its edge', () => {
    const brief = constructionBlueprint(17), rooms = [{ kind: 'hall', x: brief.entrance, y: 0, z: brief.entryZ }];
    assert.ok(brief.heights.includes(0));
    for (const kind of ROOM_CHOICES) {
        for (const part of legalPlaces(brief, rooms, kind)) {
            assert.ok(cells(part).every(c => c.y < columnHeight(brief, c.x, c.z)));
        }
    }
    assert.ok(placementIssue(brief, [...rooms, { kind: 'path', x: 0, y: 0, z: 0 }]));
});
