import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Matrix4, Vector3 } from 'three';
import { compileSceneIntent } from '../apps/map/tools/scene-intent-compiler.js';
import { parseMapDomain } from '../domains/map/invariants.js';
import { sceneForTool } from '../apps/map/tools/scene-reader.js';
import { sceneElementBounds, sceneElementLabelPoint, sceneElementOutline } from '../apps/map/ui/scene-geometry.js';
import { hasSculptedForm, isGrowth } from '../apps/map/ui/scene-forms.js';
import { createSceneModel } from '../apps/map/ui/three/scene3d-model.js';
import { layoutSceneLabels } from '../apps/map/ui/three/scene3d-label-layout.js';
import { sceneFrame } from '../apps/map/ui/three/scene3d-geometry.js';
import { mapAtlasFixture } from './fixtures/map-atlas.js';
import { sceneVisualInputs } from './fixtures/scene-visuals.js';
import { sceneCreatureInput, withOrganicSemantics } from './fixtures/scene-creatures.js';

const player = { actorKey: 'player', displayName: 'Player' };
const compile = input => {
    const result = compileSceneIntent(mapAtlasFixture([{ key: input.scene }]), input, player);
    assert.deepEqual(result.result.skipped, []);
    return parseMapDomain(result.domain);
};

test('existing scene documents remain unchanged through reading, drawing and editable readback', () => {
    for (const input of sceneVisualInputs) {
        const map = compile(input), original = structuredClone(map), scene = map.scenes[input.scene];
        const owner = map.atlas.locations.find(location => location.sceneKey === scene.key);
        assert.equal(compileSceneIntent(map, sceneForTool(scene, owner), player).result.status, 'unchanged');
        for (const dark of [false, true]) {
            const model = createSceneModel(scene, dark);
            assert.ok(model.bounds.min.toArray().every(Number.isFinite));
            assert.ok(model.bounds.max.toArray().every(Number.isFinite));
            model.dispose();
        }
        assert.deepEqual(map, original);
    }
});

test('new visual semantics patch existing elements without adding, moving or replacing entities', () => {
    const input = sceneVisualInputs.find(s => s.scene === 'organic'), map = compile(input);
    const typed = withOrganicSemantics(input);
    const patches = typed.elements.map(({ id, icon, material }) => ({ id, ...(icon && { icon }), ...(material && { material }) }));
    const result = compileSceneIntent(map, { scene: input.scene, elements: patches }, player);
    assert.deepEqual(result.result.skipped, []);
    const restored = parseMapDomain(JSON.parse(JSON.stringify(result.domain)));
    const before = map.scenes[input.scene], after = restored.scenes[input.scene];
    assert.equal(after.elements.length, before.elements.length);
    after.elements.forEach(element => {
        const old = before.elements.find(item => item.id === element.id);
        assert.deepEqual(element.geometry, old.geometry);
        assert.equal(element.actorKey, old.actorKey);
        assert.equal(element.category, old.category);
    });
    assert.deepEqual(restored.atlas, map.atlas);
    const owner = restored.atlas.locations.find(location => location.sceneKey === after.key);
    assert.equal(compileSceneIntent(restored, sceneForTool(after, owner), player).result.status, 'unchanged');
});

test('sized sculptures respect circles, rectangles and facing while keeping actor ground anchors', () => {
    const source = compile(sceneCreatureInput).scenes.creatures;
    for (const initial of source.elements.filter(hasSculptedForm)) for (const shape of ['circle', 'rect']) for (const rotation of [0, 75]) {
        const element = { ...initial, shape, rotation, geometry: shape === 'circle' ? { x: 250, y: 250, radius: 24 } : { x: 200, y: 210, width: 110, height: 40 } };
        const scene = { ...source, elements: [element] }, original = structuredClone(scene);
        const model = createSceneModel(scene, false), frame = sceneFrame(scene), b = sceneElementBounds(element);
        const center = frame.point(b.x + b.width / 2, b.y + b.height / 2);
        const inverse = new Matrix4().makeRotationY(rotation * Math.PI / 180).multiply(new Matrix4().makeTranslation(-center.x, 0, -center.z));
        model.group.updateMatrixWorld(true);
        let hasVolume = false;
        model.group.traverse(object => {
            if (!object.isMesh) return;
            const positions = object.geometry.getAttribute('position');
            const matrix = object.matrixWorld.clone().premultiply(inverse);
            for (let i = 0; i < positions.count; i++) {
                const p = new Vector3().fromBufferAttribute(positions, i).applyMatrix4(matrix);
                assert.ok(p.toArray().every(Number.isFinite));
                if (p.y > .1) hasVolume = true;
                if (shape === 'circle') assert.ok(Math.hypot(p.x, p.z) <= 24 / frame.scale + 1e-5, `${element.icon} exceeded its circle`);
                else {
                    assert.ok(Math.abs(p.x) <= b.width / frame.scale / 2 + 1e-5);
                    assert.ok(Math.abs(p.z) <= b.height / frame.scale / 2 + 1e-5);
                }
            }
        });
        assert.ok(hasVolume);
        if (element.category === 'actor') {
            const ground = model.anchors.get(element.id), top = model.markerTops.get(element.id);
            assert.ok(Math.abs(ground.x - center.x) < 1e-6 && Math.abs(ground.z - center.z) < 1e-6);
            assert.ok(ground.y < .1 && top.y > ground.y);
        }
        model.dispose(); assert.deepEqual(scene, original);
    }
});

test('point creatures remain symbols; labels do not infer species, materials or size', () => {
    const source = compile(sceneCreatureInput).scenes.creatures;
    for (const icon of ['slime', 'dragon', 'dwarf', 'elf']) {
        const element = { id: icon, category: 'actor', actorKey: icon, icon, shape: 'icon', geometry: { x: 250, y: 250 } };
        assert.equal(hasSculptedForm(element), false);
        const model = createSceneModel({ ...source, elements: [element] }, false);
        let meshes = 0; model.group.traverse(object => {if (object.isMesh) meshes++;});
        assert.equal(meshes, 0); assert.equal(model.markerTops.size, 0); model.dispose();
    }
    assert.equal(hasSculptedForm({ id: 'unknown', category: 'actor', shape: 'circle', geometry: { x: 0, y: 0, radius: 20 }, label: 'dragon' }), false);
});

test('growth keeps the source curve intact and releases every owned geometry and material once', () => {
    const source = compile(sceneCreatureInput).scenes.creatures;
    for (const element of source.elements.filter(isGrowth)) {
        const scene = { ...source, elements: [element] }, original = structuredClone(scene), model = createSceneModel(scene, false);
        const resources = new Set();
        model.group.traverse(object => {
            if (object.geometry) {
                resources.add(object.geometry);
                for (const attribute of Object.values(object.geometry.attributes)) assert.ok([...attribute.array].every(Number.isFinite));
            }
            if (object.material) {
                resources.add(object.material);
                if (object.material.map) resources.add(object.material.map);
            }
            if (object.isInstancedMesh) resources.add(object);
        });
        const counts = new Map([...resources].map(resource => [resource, 0]));
        resources.forEach(resource => resource.addEventListener('dispose', () => counts.set(resource, counts.get(resource) + 1)));
        model.dispose(); model.dispose();
        assert.ok(resources.size > 0 && [...counts.values()].every(count => count === 1));
        assert.deepEqual(scene, original);
        assert.equal(isGrowth({ ...element, closed: true }), false);
    }
});

test('elevated identity badges leave the true ground location unchanged', () => {
    const point = { x: 160, y: 220 }, top = { x: 160, y: 120 };
    const placed = layoutSceneLabels([{ id: 'dragon', anchor: point, badgeAnchor: top, priority: 2, badge: { w: 30, h: 30 } }], 320, 260).get('dragon');
    assert.deepEqual(placed.anchor, point);
    assert.ok(placed.badge.y + placed.badge.h < top.y);
});

test('growth uses the same open-path semantics as the scene outline, including omitted closed', () => {
    for (const shape of ['path', 'curve']) for (const cat of ['marker', 'decoration']) for (const closed of [undefined, false, true]) for (const points of [
        [[100, 100], [100, 400]], [[100, 100], [100, 400], [400, 400]],
    ]) {
        const scene = compile({ scene: 'closure', viewBox: [0, 0, 800, 800], elements: [
            { id: 'pipe', cat, shape, icon: 'pipe', ...(closed === undefined ? {} : { closed }), geo: shape === 'path' ? { points } : { curve: points } },
        ] }).scenes.closure;
        const element = scene.elements[0], original = structuredClone(scene);
        const open = !sceneElementOutline(element).closed;
        assert.equal(isGrowth(element), open, `${shape}/${cat}/${closed}`);
        const model = createSceneModel(scene, false);
        try {
            let volume = false;
            model.group.traverse(object => {
                if (!object.isMesh) return;
                object.geometry.computeBoundingBox();
                if (object.geometry.boundingBox.max.y > .1) volume = true;
            });
            if (open) assert.ok(volume);
            assert.deepEqual(scene, original);
        } finally { model.dispose(); }
    }
});

test('growth details spread along sparse and uneven paths rather than collecting at authored vertices', () => {
    const paths = [
        [[100, 100], [100, 600]],
        [[100, 100], [100, 100], [100, 115], [100, 600], [100, 600]],
        [[100, 100], [100, 125], [600, 125], [600, 600]],
    ];
    for (const icon of ['vine', 'tentacle']) for (const points of paths) {
        const scene = compile({ scene: 'details', viewBox: [0, 0, 800, 800], elements: [
            { id: icon, cat: 'decoration', shape: 'path', icon, closed: false, geo: { points } },
        ] }).scenes.details;
        const original = structuredClone(scene), model = createSceneModel(scene, false);
        try {
            const path = points.map(([x, y]) => model.frame.point(x, y));
            const length = path.slice(1).reduce((sum, point, i) => sum + point.distanceTo(path[i]), 0);
            const progress = [];
            model.group.updateMatrixWorld(true);
            model.group.traverse(object => {
                if (!object.isInstancedMesh) return;
                for (let i = 0; i < object.count; i++) {
                    const matrix = new Matrix4(); object.getMatrixAt(i, matrix);
                    assert.ok(matrix.elements.every(Number.isFinite));
                    const p = new Vector3().setFromMatrixPosition(matrix).applyMatrix4(object.matrixWorld); p.y = 0;
                    let travelled = 0, closest = Infinity, along = 0;
                    for (let j = 1; j < path.length; j++) {
                        const delta = path[j].clone().sub(path[j - 1]), segment = delta.length();
                        if (!segment) continue;
                        const t = Math.max(0, Math.min(1, p.clone().sub(path[j - 1]).dot(delta) / delta.lengthSq()));
                        const distance = p.distanceTo(path[j - 1].clone().addScaledVector(delta, t));
                        if (distance < closest) { closest = distance; along = travelled + t * segment; }
                        travelled += segment;
                    }
                    assert.ok(closest < .3, 'details stay attached to the authored path');
                    progress.push(along / length);
                }
            });
            assert.ok(progress.length > 2);
            assert.ok(progress.every(t => t > 0 && t < 1), 'details must not pile up at endpoints');
            assert.ok(new Set(progress.map(t => t.toFixed(4))).size >= progress.length * .9);
            for (let quarter = 0; quarter < 4; quarter++) {
                assert.ok(progress.filter(t => t >= quarter / 4 && t < (quarter + 1) / 4).length >= progress.length / 8, 'each quarter of the path receives details');
            }
            assert.deepEqual(scene, original);
        } finally { model.dispose(); }
    }
});

test('growth labels anchor to the actual open path rather than its empty bounding-box centre', () => {
    for (const icon of ['pipe', 'vine', 'tentacle', 'root']) for (const shape of ['path', 'curve']) {
        const points = [[100, 100], [100, 600], [600, 600], [600, 100]];
        const scene = compile({ scene: 'labels', viewBox: [0, 0, 800, 800], elements: [
            { id: icon, cat: 'decoration', shape, icon, closed: false, label: icon, geo: shape === 'path' ? { points } : { curve: points } },
        ] }).scenes.labels;
        const original = structuredClone(scene), model = createSceneModel(scene, false);
        try {
            const expected = model.frame.point(...sceneElementLabelPoint(scene.elements[0], 0)), anchor = model.anchors.get(icon);
            assert.ok(Math.abs(anchor.x - expected.x) < 1e-6 && Math.abs(anchor.z - expected.z) < 1e-6);
            assert.ok(anchor.y > new Box3().setFromObject(model.group).max.y, 'labels remain elevated above the drawn path');
            assert.deepEqual(scene, original);
        } finally { model.dispose(); }
    }
});

test('zero-length growth paths keep finite anchors without inventing a visible branch', () => {
    for (const icon of ['pipe', 'vine', 'tentacle', 'root']) {
        const scene = compile({ scene: 'empty-path', viewBox: [0, 0, 800, 800], elements: [
            { id: icon, cat: 'decoration', shape: 'path', icon, closed: false, geo: { points: [[100, 100], [100, 100]] } },
        ] }).scenes['empty-path'];
        const original = structuredClone(scene), model = createSceneModel(scene, false);
        try {
            let meshes = 0; model.group.traverse(object => { if (object.isMesh) meshes++; });
            assert.equal(meshes, 0);
            assert.ok(model.anchors.get(icon).toArray().every(Number.isFinite));
            assert.deepEqual(scene, original);
        } finally { model.dispose(); }
    }
});
