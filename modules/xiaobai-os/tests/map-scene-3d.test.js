import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, BoxGeometry, Matrix4, Vector3 } from 'three';
import { resolveInitialMapView } from '../apps/map/ui/map-view.js';
import { isSceneMarker, sceneElementOutline } from '../apps/map/ui/scene-geometry.js';
import { sceneTemplate } from '../apps/map/ui/three/scene3d-presentation.js';
import { elementFootprint, sceneFrame, wallSegments, footprintGeometry } from '../apps/map/ui/three/scene3d-geometry.js';
import { createSceneModel } from '../apps/map/ui/three/scene3d-model.js';
import { createSceneMaterials } from '../apps/map/ui/three/scene3d-materials.js';
import { Scene3DResources } from '../apps/map/ui/three/scene3d-resources.js';
import { createSceneAssetSession } from '../apps/map/ui/three/scene3d-assets.js';
import { sceneAssetKind } from '../apps/map/ui/three/scene3d-asset-fit.js';
import { SCENE_MATERIAL_COLORS } from '../apps/map/ui/scene-materials.js';
import { compileSceneIntent } from '../apps/map/maintenance/scene-intent-compiler.js';
import { createEmptyMapDomain } from '../domains/map/state.js';
import { sceneMapInputs } from './fixtures/scene-maps.js';

const domain = input => compileSceneIntent(createEmptyMapDomain(), input, { actorKey: 'player', displayName: '小白' }).domain;
const rectangle = (icon, shape = 'rect') => ({ id: icon, category: 'furniture', shape, icon, geometry: shape === 'rect' ? { x: 30, y: 50, width: 100, height: 60 } : { x: 60, y: 80, radius: 20 } });

test('opening chooses only the player-owned active scene and never another recorded scene', () => {
    const map = domain(sceneMapInputs[0]);
    assert.equal(resolveInitialMapView(map), 'scene');
    assert.equal(resolveInitialMapView(null), 'world');
    assert.equal(resolveInitialMapView(createEmptyMapDomain()), 'world');
    const cases = [
        d => {d.atlas.actors = [];},
        d => {d.atlas.actors[0].locationKey = 'missing';},
        d => {delete d.atlas.locations[0].sceneKey;},
        d => {d.scenes.tavern.status = 'uninitialized';},
        d => {d.atlas.locations[0].sceneKey = 'missing';},
    ];
    for (const mutate of cases) {const copy = structuredClone(map); mutate(copy); assert.equal(resolveInitialMapView(copy), 'world');}
});

test('3D maps original footprint centres, radius and clockwise rotation onto the ground plane', () => {
    const element = { ...rectangle('table'), rotation: 90 };
    const fp = elementFootprint(element, 50);
    assert.deepEqual(fp.center, [80, 80]);
    const point = new Vector3(fp.points[0].x, 0, fp.points[0].y).applyAxisAngle(new Vector3(0, 1, 0), fp.rotation);
    assert.ok(Math.abs(point.x - .6) < 1e-7 && Math.abs(point.z + 1) < 1e-7);
    const round = elementFootprint(rectangle('table', 'circle'), 50);
    assert.ok(round.points.every(p => Math.abs(p.length() - .4) < 1e-7));
    const frame = sceneFrame({ viewBox: [100, -40, 700, 350] });
    assert.deepEqual(frame.point(450, 135).toArray(), [0, 0, 0]);
});

test('walls preserve every authored segment and the entrance gap, including rounded contours', () => {
    const map = domain(sceneMapInputs[0]);
    const wall = map.scenes.tavern.elements.find(e => e.id === 'walls');
    const outline = sceneElementOutline(wall);
    assert.deepEqual(outline.points, wall.geometry.points);
    assert.equal(outline.closed, false);
    const fp = elementFootprint(wall, 50);
    assert.equal(wallSegments(fp.points, fp.closed).length, wall.geometry.points.length - 1);
    for (const shape of ['path', 'curve']) {
        const open = { ...wall, shape, geometry: { points: [[0, 0], [20, 0], [20, 20]] }, closed: false };
        const sampled = sceneElementOutline(open);
        assert.deepEqual(sampled.points[0], [0, 0]);
        assert.deepEqual(sampled.points.at(-1), [20, 20]);
        assert.equal(sampled.closed, false);
        assert.ok(sampled.points.every(([x, y]) => x >= -1e-10 && x <= 20 + 1e-10 && y >= -1e-10 && y <= 20 + 1e-10));
    }
    const repeated = { ...wall, geometry: { points: [[0, 0], [10, 0], [0, 0]] } };
    assert.equal(elementFootprint(repeated, 1).points.length, 3);
});

test('unknown nonrectangular furniture retains its concave occupied area rather than a box', () => {
    const element = { id: 'unknown', category: 'furniture', shape: 'path', geometry: { points: [[0, 0], [4, 0], [4, 1], [1, 1], [1, 4], [0, 4]] } };
    assert.equal(sceneTemplate(element), undefined);
    const fp = elementFootprint(element, 1);
    const geometry = footprintGeometry(fp.points, .2);
    const positions = geometry.getAttribute('position');
    let area = 0;
    for (let i = 0; i < positions.count; i += 3) {
        if ([i, i + 1, i + 2].every(n => Math.abs(positions.getY(n) - .2) < 1e-6)) {
            const a = new Vector3().fromBufferAttribute(positions, i), b = new Vector3().fromBufferAttribute(positions, i + 1), c = new Vector3().fromBufferAttribute(positions, i + 2);
            area += b.sub(a).cross(c.sub(a)).length() / 2;
        }
    }
    assert.ok(Math.abs(area - 7) < 1e-6);
    geometry.dispose();
});

test('nine templates render within positive authored footprints; incompatible shapes remain honest', () => {
    const elements = ['table', 'counter', 'chair', 'bed', 'shelf', 'sofa', 'bridge', 'tree', 'rock'].map(id => rectangle(id));
    const data = { key: 'all', name: 'All templates', status: 'active', viewBox: [0, 0, 200, 200] };
    for (const element of elements) {assert.equal(sceneTemplate(element), element.icon);}
    assert.equal(sceneTemplate(rectangle('chair', 'circle')), undefined);
    assert.equal(sceneTemplate({ ...rectangle('bed'), shape: 'icon', geometry: { x: 0, y: 0 } }), undefined);
    const scale = sceneFrame(data).scale;
    for (const element of elements) {
        const model = createSceneModel({ ...data, elements: [element] }, false);
        const box = new Box3().setFromObject(model.group);
        assert.ok(box.max.y > box.min.y);
        assert.ok(box.max.x - box.min.x <= 100 / scale + 1e-5);
        assert.ok(box.max.z - box.min.z <= 60 / scale + 1e-5);
        model.dispose();
    }
});

test('sized actors, doors and stairs retain footprints and marker identity without invented models', () => {
    const input = structuredClone(sceneMapInputs[0]);
    Object.assign(input.elements.find(e => e.id === 'player'), { shape: 'circle', geo: { at: [395, 250], radius: 15 } });
    Object.assign(input.elements.find(e => e.id === 'door'), { shape: 'rect', geo: { center: [355, 480], size: [50, 15] } });
    input.elements.push({ id: 'stairs', cat: 'door', kind: 'stairs', shape: 'rect', geo: { center: [620, 420], size: [45, 80] } });
    const map = domain(input), original = structuredClone(map), scene = map.scenes.tavern;
    const frame = sceneFrame(scene);
    for (const id of ['player', 'door', 'stairs']) {
        const element = scene.elements.find(e => e.id === id);
        assert.ok(isSceneMarker(element));
        const model = createSceneModel({ ...scene, elements: [element] }, false);
        const box = new Box3().setFromObject(model.group);
        assert.ok(box.max.y - box.min.y < .1);
        const center = frame.point(...elementFootprint(element, frame.scale).center);
        assert.equal(model.anchors.get(id).x, center.x);
        assert.equal(model.anchors.get(id).z, center.z);
        model.dispose();
    }
    assert.equal(scene.elements.find(e => e.id === 'player').actorKey, 'player');
    assert.deepEqual(map, original);
});

test('low walls uniformly change only height, including off-centre rooms, reversed paths and isolated walls', () => {
    const wall = domain(sceneMapInputs[0]).scenes.tavern.elements.find(e => e.id === 'walls');
    function renderedSegments(model) {
        const boxes = [];
        model.group.updateMatrixWorld(true);
        model.group.traverse(mesh => {
            if (!mesh.isInstancedMesh) return;
            mesh.geometry.computeBoundingBox();
            for (let index = 0; index < mesh.count; index++) {
                const matrix = new Matrix4();
                mesh.getMatrixAt(index, matrix);
                boxes.push(mesh.geometry.boundingBox.clone().applyMatrix4(matrix.premultiply(mesh.matrixWorld)));
            }
        });
        return boxes;
    }
    for (const offset of [-700, 0, 700]) {
        for (const rotation of [0, 75]) {
            for (const reverse of [false, true]) {
                const points = wall.geometry.points.map(([x, y]) => [x + offset, y + offset]);
                if (reverse) points.reverse();
                const scene = { key: 'walls', name: 'Walls', status: 'active', viewBox: [0, 0, 1000, 1000], elements: [
                    { ...wall, rotation, geometry: { points } },
                    { id: 'single', category: 'wall', shape: 'path', closed: false, rotation, geometry: { points: [[offset, offset], [offset + 100, offset]] } },
                    { id: 'closed', category: 'wall', shape: 'rect', rotation, geometry: { x: offset + 800, y: offset, width: 100, height: 100 } },
                ] };
                const original = structuredClone(scene), model = createSceneModel(scene, false);
                const tall = renderedSegments(model);
                assert.equal(tall.length, points.length - 1 + 1 + 4);
                model.updateWalls(true);
                const low = renderedSegments(model);
                assert.equal(low.length, tall.length);
                low.forEach((box, i) => {
                    assert.ok(Math.abs(box.max.y - box.min.y - .2) < 1e-6);
                    assert.ok(Math.abs(tall[i].max.y - tall[i].min.y - 1.1) < 1e-6);
                    assert.ok(Math.abs(box.min.y - tall[i].min.y) < 1e-6);
                    assert.deepEqual([box.min.x, box.max.x, box.min.z, box.max.z], [tall[i].min.x, tall[i].max.x, tall[i].min.z, tall[i].max.z]);
                });
                model.updateWalls(false);
                assert.deepEqual(renderedSegments(model), tall);
                model.dispose();
                assert.deepEqual(scene, original);
            }
        }
    }
});

test('all current material tokens and certainty states render without changing source facts', () => {
    const resources = new Scene3DResources();
    for (const dark of [false, true]) {
        const materials = createSceneMaterials(resources, dark);
        for (const material of Object.keys(SCENE_MATERIAL_COLORS)) {
            const opacities = ['confirmed', 'inferred', 'unknown'].map(certainty => {
                const element = { ...rectangle('table'), material, certainty, label: '保留标签' };
                const original = structuredClone(element);
                const mesh = materials.mesh(element);
                assert.ok(mesh.color.toArray().every(Number.isFinite));
                assert.ok(mesh.roughness >= 0 && mesh.roughness <= 1);
                assert.deepEqual(element, original);
                return mesh.opacity;
            });
            assert.ok(opacities[0] > opacities[1] && opacities[1] > opacities[2]);
        }
    }
    resources.dispose();
});

test('pilot assets only opt in for compatible sized elements and late loads are disposed', async () => {
    assert.equal(sceneAssetKind(rectangle('table')), 'table');
    assert.equal(sceneAssetKind({ ...rectangle('table'), shape: 'circle' }), undefined);
    assert.equal(sceneAssetKind({ ...rectangle('shelf'), geometry: { x: 0, y: 0, width: 180, height: 30 } }), 'shelf');
    let release;
    let disposed = 0;
    const asset = { parts: [{ geometry: new BoxGeometry(1, 1, 1), role: 'main' }], size: new Vector3(1, 1, 1), radius: 1, dispose: () => {disposed += 1;} };
    const session = createSceneAssetSession(() => new Promise(resolve => {release = () => resolve(asset);}), () => {}, () => {});
    session.sync(['table']); session.sync([]); release(); await new Promise(resolve => setTimeout(resolve, 0));
    assert.equal(disposed, 1);
    session.dispose();
});

for (const input of sceneMapInputs) {
    test(`${input.scene}: real compiler output renders without mutating facts and disposes owned GPU assets`, () => {
        const map = domain(input), original = structuredClone(map);
        const model = createSceneModel(map.scenes[input.scene], false);
        const assets = new Set();
        model.group.traverse(child => {
            if (child.geometry) assets.add(child.geometry);
            if (child.material) {
                assets.add(child.material);
                if (child.material.map) assets.add(child.material.map);
            }
            if (child.isInstancedMesh) assets.add(child);
        });
        const disposals = new Map([...assets].map(asset => [asset, 0]));
        for (const asset of assets) asset.addEventListener('dispose', () => disposals.set(asset, disposals.get(asset) + 1));
        model.updateWalls(true);
        model.dispose(); model.dispose();
        assert.ok(assets.size > 5);
        assert.ok([...disposals.values()].every(count => count === 1));
        assert.deepEqual(map, original);
    });
}
