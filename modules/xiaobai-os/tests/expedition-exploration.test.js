import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Mesh } from 'three';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { RULES } from '../apps/game/expedition/content.ts';
import { canStandInWorld } from '../apps/game/expedition/world/geometry.ts';
import { findWorldPath } from '../apps/game/expedition/world/navigation.ts';
import { interactWorld, reachableInteractions, sceneSpace, startWorld, walkWorld } from '../apps/game/expedition/world/exploration.ts';
import { buildExplorableWorld } from '../apps/game/expedition/presentation/world-scenery.ts';
import { createSceneKit } from '../apps/game/expedition/scene-kit.ts';

const allFacts = new Set(['briefed', 'crossroads_cleared', 'patrol_cleared', 'sluice_opened', 'waterway_cleared', 'alarm_silenced',
    'captives_released', 'postern_opened', 'receiving_arranged', 'captives_arrived', 'warden_defeated', 'roots_cleared']);
const at = (scene, anchor) => ({ scene, position: { ...COURTYARD[scene].anchors[anchor] }, facing: 0, visited: [scene] });

test('every authored entrance and interaction is physically connected once its doors are open', () => {
    for (const scene of Object.values(COURTYARD)) {
        const space = sceneSpace(scene, allFacts), start = Object.values(scene.anchors)[0];
        for (const point of Object.values(scene.anchors)) {
            assert.equal(canStandInWorld(space, point, RULES.playerRadius), true);
            assert.ok(findWorldPath(space, start, point, RULES.playerRadius), `${scene.id}: ${JSON.stringify(point)}`);
        }
        for (const exit of scene.exits) {
            const destination = COURTYARD[exit.to];
            assert.ok(destination.exits.some(back => back.to === scene.id && back.anchor === exit.arrival));
            const result = interactWorld(COURTYARD, at(scene.id, exit.anchor), allFacts, exit.id);
            assert.equal(result.kind, 'travel'); assert.equal(result.location.scene, destination.id);
            assert.equal(canStandInWorld(sceneSpace(destination, allFacts), result.location.position, RULES.playerRadius), true);
        }
    }
});

test('sluice, prison doors, postern and optional roots have no walkable bypass', () => {
    for (const [id, from, to, fact] of [
        ['waterway', 'crossroads', 'cells', 'sluice_opened'],
        ['cells', 'release', 'kouzi', 'captives_released'],
        ['cells', 'release', 'anian', 'captives_released'],
        ['cells', 'latch', 'postern', 'postern_opened'],
        ['camp', 'start', 'postern', 'postern_opened'],
        ['crossroads', 'camp', 'roots', 'warden_defeated'],
    ]) {
        const scene = COURTYARD[id], facts = new Set(allFacts); facts.delete(fact);
        assert.equal(findWorldPath(sceneSpace(scene, facts), scene.anchors[from], scene.anchors[to], RULES.playerRadius), null);
        facts.add(fact);
        assert.ok(findWorldPath(sceneSpace(scene, facts), scene.anchors[from], scene.anchors[to], RULES.playerRadius));
    }
});

test('interaction requires authored availability, real proximity and unblocked sight', () => {
    assert.throws(() => interactWorld(COURTYARD, startWorld(COURTYARD.camp, 'start'), new Set(['briefed']), 'road'), { code: 'expedition_world_out_of_reach' });
    assert.throws(() => interactWorld(COURTYARD, at('camp', 'postern'), new Set(), 'postern'), { code: 'expedition_world_interaction_unavailable' });
    assert.throws(() => interactWorld(COURTYARD, at('waterway', 'sluice'), new Set(['sluice_opened']), 'sluice'), { code: 'expedition_world_interaction_unavailable' });
    assert.equal(interactWorld(COURTYARD, at('waterway', 'sluice'), new Set(), 'sluice').object.fact, 'sluice_opened');
    assert.deepEqual(reachableInteractions(COURTYARD.cells, at('cells', 'release'), new Set()).map(i => i.target.id), ['release']);
});

test('travel records discovery once and neither mutates the old location nor supplies story results', () => {
    const location = at('camp', 'road'), before = structuredClone(location), facts = new Set(['briefed']);
    const result = interactWorld(COURTYARD, location, facts, 'road');
    assert.deepEqual(location, before); assert.deepEqual([...facts], ['briefed']);
    assert.deepEqual(result.location.visited, ['camp', 'crossroads']);
    const back = interactWorld(COURTYARD, result.location, facts, 'camp');
    assert.deepEqual(back.location.visited, ['camp', 'crossroads']);
});

test('fixed movement stays in the authored walkable space and rejects forged directions', () => {
    const a = startWorld(COURTYARD.camp, 'start'), b = structuredClone(a), space = sceneSpace(COURTYARD.camp, new Set());
    for (const location of [a, b]) for (let i = 0; i < 800; i++) {
        walkWorld(location, 2, space); assert.equal(canStandInWorld(space, location.position, RULES.playerRadius), true);
    }
    assert.deepEqual(a, b);
    for (const move of [-1, 9, NaN, Infinity, .5]) { assert.throws(() => walkWorld(a, move, space), { code: 'expedition_world_input_invalid' }); }
});

test('authored scenes render finite batched geometry and release it without changing map or gate facts', () => {
    const kit = createSceneKit(), root = new Group();
    try {
        for (const scene of Object.values(COURTYARD)) for (const facts of [new Set(), allFacts]) {
            const before = structuredClone({ scene, facts }), scenery = buildExplorableWorld(kit, root, scene, facts);
            assert.ok(root.children.length > 0);
            const batches = [];
            root.traverse(object => {
                if (!(object instanceof Mesh)) return;
                object.geometry.computeBoundingBox();
                const bounds = object.geometry.boundingBox;
                assert.ok([...bounds.min, ...bounds.max].every(Number.isFinite));
                if (Object.values(kit.geometries).includes(object.geometry)) { return; } // Shared primitives belong to the scene kit, not the visit.
                let released = false; object.geometry.addEventListener('dispose', () => { released = true; });
                batches.push(() => released);
            });
            assert.deepEqual({ scene, facts }, before);
            scenery.dispose(); assert.equal(root.children.length, 0); assert.ok(batches.every(released => released()));
        }
    } finally { kit.dispose(); }
});
