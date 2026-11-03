import assert from 'node:assert/strict';
import test from 'node:test';
import { Group, Mesh, Raycaster, Vector3 } from 'three';
import { COURTYARD } from '../apps/game/expedition/content/courtyard.ts';
import { defineLandscapeScene } from '../apps/game/expedition/world/landscape.ts';
import { canStandInWorld, createWorldSpace, worldCell } from '../apps/game/expedition/world/geometry.ts';
import { createSceneKit } from '../apps/game/expedition/scene-kit.ts';
import { buildLandscape } from '../apps/game/expedition/presentation/landscape-scenery.ts';
import { CAMERA_EIGHTH_TURNS, WORLD_CAMERA } from '../apps/game/expedition/visuals.ts';
import { roadSurface } from '../apps/game/expedition/presentation/landscape-roads.ts';
import { buildExplorableWorld } from '../apps/game/expedition/presentation/world-scenery.ts';
import { landscapeFeature } from '../apps/game/expedition/presentation/landscape-models.ts';

// Moving the camera exposed two different materials at exactly the same wall-foot depth.
// Ray intersections test the rendered surface, before and after static batching.
test('wall feet have one surface per side and remain solid when the upper wall cuts away', () => {
    for (const interior of [false, true]) {
        const kit = createSceneKit(), base = new Group(), upper = new Group();
        landscapeFeature(kit, base, upper, { id: 'wall', kind: 'wall', height: 5, footprint: { x: 0, z: 0, width: 6, depth: 2 } }, interior);
        const disposers = [];
        try {
            for (const batched of [false, true]) {
                if (batched) { disposers.push(kit.bake(base), kit.bake(upper)); }
                base.updateMatrixWorld(true); upper.updateMatrixWorld(true);
                for (const [origin, direction] of [
                    [new Vector3(.37, .21, 3), new Vector3(0, 0, -1)],
                    [new Vector3(.37, .21, -3), new Vector3(0, 0, 1)],
                    [new Vector3(4, .21, .37), new Vector3(-1, 0, 0)],
                    [new Vector3(-4, .21, .37), new Vector3(1, 0, 0)],
                ]) {
                    const ray = new Raycaster(origin, direction);
                    const hits = ray.intersectObjects([base, upper]);
                    assert.equal(hits.length, 2);
                    const retained = ray.intersectObject(base);
                    assert.equal(retained.length, 2);
                    assert.equal(retained[0].distance, hits[0].distance);
                }
            }
        } finally { disposers.forEach(dispose => dispose()); kit.dispose(); }
    }
});

// Reachability alone cannot detect a moved building whose old collision footprint was left behind.
test('every authored outdoor solid and water surface blocks its actual footprint', () => {
    for (const scene of Object.values(COURTYARD).filter(scene => scene.landscape)) {
        const space = createWorldSpace(scene.map, new Set(scene.map.gates.map(g => g.id)));
        for (const { kind, footprint: f } of scene.landscape.features) {
            if (kind === 'arch') { assert.equal(canStandInWorld(space, { x: f.x, y: f.z }, .3), true); continue; }
            for (let x = f.x - f.width / 2 + .5; x < f.x + f.width / 2; x++) {
                for (let z = f.z - f.depth / 2 + .5; z < f.z + f.depth / 2; z++) {
                    const cell = worldCell(scene.map, { x, y: z });
                    assert.equal(space.blocked(cell.column, cell.row), true);
                    assert.equal(canStandInWorld(space, { x, y: z }, .3), false);
                }
            }
        }
    }
});

test('outdoor authoring rejects unaligned or out-of-bounds solids and degenerate paths', () => {
    const scene = COURTYARD.camp, landscape = scene.landscape, original = landscape.features[0];
    for (const footprint of [
        { ...original.footprint, x: .3 }, { ...original.footprint, width: -2 },
        { ...original.footprint, x: 1000 }, { ...original.footprint, depth: NaN },
    ]) {
        assert.throws(() => defineLandscapeScene({ ...scene, landscape: { ...landscape, features: [{ ...original, footprint }] } }),
            { code: 'expedition_world_map_invalid' });
    }
    assert.throws(() => defineLandscapeScene({ ...scene, landscape: { ...landscape, roads: [{ width: 3, points: [[0, 0], [0, 0]] }] } }),
        { code: 'expedition_world_map_invalid' });
    assert.throws(() => defineLandscapeScene({ ...scene, anchors: { start: { x: 1000, y: 1000 } } }), { code: 'expedition_world_map_invalid' });
    assert.throws(() => defineLandscapeScene({ ...scene, objects: [{ id: 'rest', kind: 'rest', anchor: 'missing' }] }), { code: 'expedition_world_map_invalid' });
});

// A real rendered defect: coplanar strips produced flickering triangles and borders across junctions.
test('crossing and reversed roads cover their union once, with no doubled surface at the junction', () => {
    const roads = [{ width: 4, points: [[-10, 0], [10, 0]] }, { width: 4, points: [[0, -10], [0, 10]] }];
    const area = poly => Math.abs(poly.reduce((sum, p, i) => sum + p[0] * poly[(i + 1) % poly.length][1] - p[1] * poly[(i + 1) % poly.length][0], 0)) / 2;
    for (const source of [roads, [...roads, { ...roads[0], points: [...roads[0].points].reverse() }]]) {
        const polygons = roadSurface(source);
        assert.ok(Math.abs(polygons.reduce((sum, p) => sum + area(p), 0) - 144) < 1e-6);
        for (const point of [[.31, .73], [8.12, .45], [.27, -8.15]]) {
            const covering = polygons.filter(poly => poly.every((p, i) => {
                const q = poly[(i + 1) % poly.length]; return (q[0] - p[0]) * (point[1] - p[1]) - (q[1] - p[1]) * (point[0] - p[0]) >= -1e-7;
            }));
            assert.equal(covering.length, 1);
        }
    }
});

test('opening a sluice keeps the uploaded architecture and releases the replaced mechanism geometry', () => {
    const kit = createSceneKit(), root = new Group(), scene = COURTYARD.waterway;
    const scenery = buildExplorableWorld(kit, root, scene, new Set());
    try {
        const before = new Set(), disposed = new Set();
        root.traverse(o => { if (o instanceof Mesh) { before.add(o.geometry); o.geometry.addEventListener('dispose', () => disposed.add(o.geometry)); } });
        scenery.setFacts(new Set(['sluice_opened']));
        const after = new Set(); root.traverse(o => { if (o instanceof Mesh) after.add(o.geometry); });
        assert.ok(disposed.size > 0); assert.ok([...after].some(g => before.has(g)));
        for (const geo of before) { assert.equal(disposed.has(geo), !after.has(geo)); }
        assert.equal(scene.map.gates.length, 1);
    } finally { scenery.dispose(); kit.dispose(); }
});

test('static batching preserves per-surface shadow policy even for a shared material', () => {
    const kit = createSceneKit(), root = new Group();
    kSet(false, false, -2); kSet(true, true, 2);
    function kSet(cast, receive, x) {
        const mesh = kit.mesh(root, 'box', '#779977', [1, 1, 1], [x, 0, 0]); mesh.castShadow = cast; mesh.receiveShadow = receive;
    }
    const dispose = kit.bake(root);
    try {
        const policies = root.children.filter(o => o instanceof Mesh).map(o => {
            o.geometry.computeBoundingBox(); return { x: o.geometry.boundingBox.min.x, cast: o.castShadow, receive: o.receiveShadow };
        }).sort((a, b) => a.x - b.x);
        assert.deepEqual(policies, [{ x: -2.5, cast: false, receive: false }, { x: 1.5, cast: true, receive: true }]);
    } finally { dispose(); kit.dispose(); }
});

test('a foreground building cuts away for the player and restores after they leave, without moving collision', () => {
    const kit = createSceneKit(), root = new Group(), land = COURTYARD.camp.landscape;
    const house = land.features.find(f => f.kind === 'clinic').footprint, before = structuredClone(land);
    const scenery = buildLandscape(kit, root, land);
    try {
        const building = root.getObjectByName(land.features.find(f => f.kind === 'clinic').id);
        scenery.update({ x: 1000, y: 1000 }, 0); assert.equal(building.visible, true);
        scenery.update({ x: house.x, y: house.z - house.depth / 2 - 1 }, 0);
        assert.equal(building.visible, false);
        scenery.update({ x: 1000, y: 1000 }, 0);
        assert.equal(building.visible, true); assert.deepEqual(land, before);
    } finally { scenery.dispose(); kit.dispose(); }
});

test('architecture leaves the arrival character visible while keeping distant walls intact', () => {
    const kit = createSceneKit(), root = new Group(), scene = COURTYARD.crossroads;
    const scenery = buildLandscape(kit, root, scene.landscape);
    try {
        scenery.update(scene.anchors.camp, CAMERA_EIGHTH_TURNS * Math.PI / 4);
        root.updateMatrixWorld(true);
        const visible = [];
        root.traverseVisible(o => { if (o instanceof Mesh) visible.push(o); });
        const angle = CAMERA_EIGHTH_TURNS * Math.PI / 4;
        for (const height of [.1, 1.6]) {
            const ray = new Raycaster(new Vector3(scene.anchors.camp.x, height, scene.anchors.camp.y), new Vector3(Math.sin(angle), WORLD_CAMERA.height / WORLD_CAMERA.distance, Math.cos(angle)).normalize());
            assert.equal(ray.intersectObjects(visible, false).length, 0);
        }
        assert.ok(root.getObjectByName('south-boundary-east').children.some(section => section.visible));
        assert.equal(canStandInWorld(createWorldSpace(scene.map, new Set()), scene.anchors.camp, .34), true);
    } finally { scenery.dispose(); kit.dispose(); }
});

test('standing in front of the clinic awning does not erase the entire building', () => {
    const kit = createSceneKit(), root = new Group(), scenery = buildLandscape(kit, root, COURTYARD.camp.landscape);
    try {
        scenery.update({ x: -12.014830637824288, y: 10.914009230206624 }, CAMERA_EIGHTH_TURNS * Math.PI / 4);
        assert.equal(root.getObjectByName('clinic').visible, true);
    } finally { scenery.dispose(); kit.dispose(); }
});
