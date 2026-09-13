import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { setImmediate } from 'node:timers';
import { Box3, Matrix4, Raycaster, Vector3 } from 'three';
import { MAP_ICON_TOKENS, MAP_OBJECT_ICONS } from '../domains/map/semantics.js';
import { createEmptyMapDomain } from '../domains/map/state.js';
import { parseMapDomain, validateMapDomain } from '../domains/map/invariants.js';
import { compileSceneIntent } from '../apps/map/maintenance/scene-intent-compiler.js';
import { sceneForTool } from '../apps/map/maintenance/scene-reader.js';
import { elementPresentation } from '../apps/map/ui/map-presentation.js';
import { isAreaElement, sceneElementOutline } from '../apps/map/ui/scene-geometry.js';
import { createSceneModel } from '../apps/map/ui/three/scene3d-model.js';
import { decodeSceneAsset, createSceneAssetSession } from '../apps/map/ui/three/scene3d-assets.js';
import { sceneAssetKind } from '../apps/map/ui/three/scene3d-asset-fit.js';
import { sceneFrame, elementFootprint } from '../apps/map/ui/three/scene3d-geometry.js';
import { createMapKernelHarness } from './map-kernel-harness.js';
import { sceneObjectInputs } from './fixtures/scene-map-objects.js';

const player = { actorKey: 'player', displayName: '小白' };
const compile = input => {
    const result = compileSceneIntent(createEmptyMapDomain(), input, player);
    assert.deepEqual(result.result.skipped, []);
    validateMapDomain(result.domain);
    return result.domain;
};
function freeze(value) {if (value && typeof value === 'object') {Object.values(value).forEach(freeze); Object.freeze(value);} return value;}
const directory = new URL('../apps/map/ui/three/assets/kenney/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', directory), 'utf8'));

test('all 37 object types survive compilation, persisted reads and icon-only patches', async () => {
    assert.equal(new Set(MAP_OBJECT_ICONS).size, 37);
    assert.equal(new Set(MAP_ICON_TOKENS).size, 55);
    const covered = new Set();
    for (const input of sceneObjectInputs) {
        const map = compile(input), harness = createMapKernelHarness();
        const saved = await harness.map.replaceCurrent(map, { expectedRevision: 0 });
        const restored = parseMapDomain(JSON.parse(JSON.stringify(harness.state.persisted.partitions.map)));
        assert.deepEqual(restored, saved.map);
        const scene = restored.scenes[input.scene], owner = restored.atlas.locations.find(p => p.sceneKey === scene.key);
        const read = sceneForTool(scene, owner);
        assert.equal(compileSceneIntent(restored, read, player).result.changed, false);
        for (const element of scene.elements) if (element.icon) covered.add(element.icon);
        const target = scene.elements.find(e => e.icon && e.category !== 'door');
        const changed = compileSceneIntent(restored, { scene: input.scene, elements: [{ id: target.id, icon: null }] }, player).domain;
        const expected = structuredClone(scene.elements);
        delete expected.find(e => e.id === target.id).icon;
        assert.deepEqual(changed.scenes[input.scene].elements, expected);
        assert.equal(changed.schemaVersion, 1);
    }
    assert.deepEqual(covered, new Set(MAP_OBJECT_ICONS));
});

test('every icon maps to a bundled Material Symbol and has a text fallback', async () => {
    const codepoints = await readFile(new URL('../../../libs/material-symbols/codepoints', import.meta.url), 'utf8');
    const available = new Set(codepoints.trim().split(/\r?\n/).map(line => line.split(' ')[0]));
    for (const icon of MAP_ICON_TOKENS) {
        const presentation = elementPresentation({ category: 'decoration', shape: 'icon', geometry: { x: 0, y: 0 }, icon }, 'test');
        assert.ok(available.has(presentation.icon), `${icon}: ${presentation.icon} is absent from the local font`);
        assert.ok(presentation.fallback);
    }
});

test('published GLBs contain only bounded static local geometry with verified provenance', async () => {
    // GLB is an external file protocol, so inspect the actual files, not TS source strings.
    let bytesTotal = 0, geometryTotal = 0;
    const packs = new Set();
    for (const entry of manifest) {
        const bytes = await readFile(new URL(entry.file, directory));
        assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
        assert.equal(bytes.readUInt32LE(0), 0x46546c67);
        assert.equal(bytes.readUInt32LE(8), bytes.length);
        const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)));
        for (const field of ['animations', 'skins', 'images', 'textures', 'cameras', 'extensions', 'extensionsRequired']) assert.equal(json[field], undefined, `${entry.file}: ${field}`);
        assert.ok(json.buffers.every(buffer => !buffer.uri));
        assert.ok(json.nodes.every(node => node.mesh !== undefined && !node.extensions && !node.matrix && !node.rotation && !node.translation));
        const parts = json.meshes.flatMap(mesh => mesh.primitives);
        const triangles = parts.reduce((sum, part) => sum + json.accessors[part.attributes.POSITION].count / 3, 0);
        assert.ok(parts.length <= 3 && triangles <= 5000 && bytes.length <= 250 * 1024);
        assert.equal(triangles, entry.triangles);
        assert.equal(bytes.length, entry.bytes);
        bytesTotal += bytes.length; geometryTotal += entry.geometryBytes;
        packs.add(entry.originalFile.split('/')[0]);
        const decoded = await decodeSceneAsset(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
        assert.ok(decoded.size.toArray().every(n => n > 0 && Number.isFinite(n)));
        assert.deepEqual(decoded.size.toArray(), entry.size, 'Offline dimensions must describe the published GLB');
        assert.equal(decoded.radius, entry.radius, 'Offline radial extent must describe the published GLB');
        decoded.dispose();
    }
    for (const pack of packs) {
        const license = await readFile(new URL(`LICENSE-${pack}.txt`, directory), 'utf8');
        assert.ok(license.includes('Creative Commons Zero, CC0'));
    }
    assert.ok(bytesTotal <= 2 * 1024 * 1024, 'Even all distinct models together fit the per-scene download budget');
    assert.ok(geometryTotal <= 32 * 1024 * 1024);
});

test('new objects keep their authored footprints, facing and independent material/certainty', async () => {
    const assets = new Map();
    for (const entry of manifest) {
        const bytes = await readFile(new URL(entry.file, directory));
        assets.set(entry.icon, await decodeSceneAsset(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
    }
    try {
        const used = new Set();
        for (const input of sceneObjectInputs) {
            const scene = freeze(compile(input).scenes[input.scene]);
            const original = structuredClone(scene), frame = sceneFrame(scene);
            for (const originalElement of scene.elements.filter(e => e.icon && ['rect', 'circle'].includes(e.shape))) {
                for (const rotation of [0, 90, 217]) {
                    const element = freeze({ ...originalElement, rotation });
                    const kind = sceneAssetKind(element);
                    if (kind) used.add(kind);
                    const fp = elementFootprint(element, frame.scale), center = frame.point(...fp.center);
                    const model = createSceneModel({ ...scene, elements: [element] }, false, assets);
                    model.group.updateMatrixWorld(true);
                    model.group.traverse(mesh => {
                        if (!mesh.isMesh) return;
                        const position = mesh.geometry.getAttribute('position');
                        for (let instance = 0; instance < (mesh.isInstancedMesh ? mesh.count : 1); instance++) {
                            const matrix = new Matrix4();
                            if (mesh.isInstancedMesh) mesh.getMatrixAt(instance, matrix);
                            matrix.premultiply(mesh.matrixWorld);
                            for (let i = 0; i < position.count; i++) {
                                const point = new Vector3().fromBufferAttribute(position, i).applyMatrix4(matrix).sub(center).applyAxisAngle(new Vector3(0, 1, 0), -fp.rotation);
                                assert.ok(Math.abs(point.x) <= fp.width / 2 + 1e-5 && Math.abs(point.z) <= fp.depth / 2 + 1e-5, `${element.icon} exceeded footprint`);
                                if (element.shape === 'circle') assert.ok(Math.hypot(point.x, point.z) <= fp.width / 2 + 1e-5, `${element.icon} exceeded radius`);
                            }
                        }
                    });
                    model.dispose();
                }
            }
            assert.deepEqual(scene, original);
        }
        assert.deepEqual(used, new Set(manifest.map(entry => entry.icon)));
        const tentScene = compile(sceneObjectInputs[3]).scenes.courtyard;
        const tent = tentScene.elements.find(element => element.icon === 'tent');
        const shelter = createSceneModel({ ...tentScene, elements: [tent] }, false, assets);
        shelter.group.updateMatrixWorld(true);
        const tentFrame = sceneFrame(tentScene), { x, y, width, height } = tent.geometry;
        for (const side of [-1, 1]) {
            const ray = new Raycaster(tentFrame.point(x + width / 2 + side * width * .2, y + height / 2, 10), new Vector3(0, -1, 0));
            assert.ok(ray.intersectObject(shelter.group, true).some(hit => hit.point.y > .1), 'A tent must have a canopy, not only a bare frame');
        }
        shelter.dispose();
        const element = compile(sceneObjectInputs[2]).scenes.workshop.elements.find(e => e.icon === 'car');
        const model = createSceneModel({ key: 'pair', viewBox: [0, 0, 760, 580], elements: [
            { ...element, id: 'a', material: 'wood', certainty: 'confirmed' },
            { ...element, id: 'b', material: 'metal', certainty: 'unknown' },
        ] }, false, assets);
        const materials = [];
        model.group.traverse(mesh => {if (mesh.isMesh) materials.push(mesh.material);});
        assert.ok(materials.some(m => m.opacity === 1) && materials.some(m => m.opacity < .5));
        assert.ok(new Set(materials.map(m => m.color.getHexString())).size > 3);
        model.dispose();
    } finally {for (const asset of assets.values()) asset.dispose();}
});

test('initial framing contains loaded asset geometry and labels before any model has arrived', async () => {
    const assets = new Map();
    for (const entry of manifest) {
        const bytes = await readFile(new URL(entry.file, directory));
        assets.set(entry.icon, await decodeSceneAsset(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
    }
    try {
        for (const input of sceneObjectInputs) {
            const scene = compile(input).scenes[input.scene];
            for (const source of scene.elements.filter(element => sceneAssetKind(element))) {
                for (const scale of [.2, 1, 4]) {
                    const geometry = source.shape === 'circle'
                        ? { ...source.geometry, radius: source.geometry.radius * scale }
                        : { ...source.geometry, width: source.geometry.width * scale, height: source.geometry.height * scale };
                    const data = freeze({ ...scene, elements: [{ ...source, geometry, rotation: 217 }] });
                    const initial = createSceneModel(data, false), loaded = createSceneModel(data, false, assets);
                    try {
                        const frame = initial.bounds.clone().expandByScalar(1e-5);
                        assert.ok(frame.containsBox(new Box3().setFromObject(loaded.group)), `${source.icon}: loaded geometry escaped initial framing at scale ${scale}`);
                        for (const anchor of loaded.anchors.values()) assert.ok(frame.containsPoint(anchor), `${source.icon}: loaded label escaped initial framing`);
                    } finally {initial.dispose(); loaded.dispose();}
                }
            }
        }
    } finally {for (const asset of assets.values()) asset.dispose();}
});

test('height-limited or differently proportioned assets still show the entire authored occupied footprint', async () => {
    const assets = new Map();
    for (const icon of ['cabinet', 'table', 'shelf', 'barrel']) {
        const entry = manifest.find(item => item.icon === icon);
        const bytes = await readFile(new URL(entry.file, directory));
        assets.set(icon, await decodeSceneAsset(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
    }
    try {
        const elements = [
            { icon: 'cabinet', shape: 'rect', geometry: { x: 100, y: 100, width: 200, height: 200 } },
            { icon: 'table', shape: 'rect', geometry: { x: 100, y: 100, width: 720, height: 360 } },
            { icon: 'shelf', shape: 'rect', geometry: { x: 100, y: 100, width: 300, height: 80 } },
            { icon: 'barrel', shape: 'circle', geometry: { x: 200, y: 200, radius: 180 } },
        ];
        for (const source of elements) for (const rotation of [0, 37, 217]) {
            const element = freeze({ ...source, id: 'occupied', category: 'furniture', rotation, certainty: 'inferred' });
            const scene = freeze({ key: 'occupied', viewBox: [0, 0, 760, 580], elements: [element] });
            const model = createSceneModel(scene, false, assets);
            try {
                const frame = sceneFrame(scene), fp = elementFootprint(element, frame.scale);
                const parent = model.group.children[0];
                assert.equal(parent.rotation.y, fp.rotation);
                // Measure the actual rendered footprint in its own axes, including its visible outline.
                parent.rotation.y = 0;
                const rendered = new Box3().setFromObject(model.group).getSize(new Vector3());
                assert.ok(Math.abs(rendered.x - fp.width) < 1e-5, `${source.icon}: occupied width disappeared`);
                assert.ok(Math.abs(rendered.z - fp.depth) < 1e-5, `${source.icon}: occupied depth disappeared`);
                const outline = parent.children.find(child => child.isLine);
                assert.ok(outline, `${source.icon}: undersized asset needs a visible footprint`);
                const points = outline.geometry.getAttribute('position');
                assert.equal(points.count, fp.points.length + 1);
                fp.points.forEach((point, i) => {
                    assert.ok(Math.abs(points.getX(i) - point.x) < 1e-5 && Math.abs(points.getZ(i) - point.y) < 1e-5);
                    assert.ok(points.getY(i) < .03, 'Occupancy belongs on the ground, not at the model top');
                });
                assert.ok(outline.material.isLineDashedMaterial, 'Uncertain occupancy retains its line style');
            } finally {model.dispose();}
        }
    } finally {for (const asset of assets.values()) asset.dispose();}
});

test('procedural objects retain their full ground footprint without framing already fitted shapes', () => {
    const workshop = compile(sceneObjectInputs[2]).scenes.workshop;
    const courtyard = compile(sceneObjectInputs[3]).scenes.courtyard;
    const fixtures = [
        [workshop, 'ladder', true],
        [courtyard, 'flag', true],
        [courtyard, 'fire', true],
        [workshop, 'machine', false],
        [courtyard, 'column', false],
    ];
    for (const [source, icon, needsOutline] of fixtures) for (const rotation of [0, 37, 217]) for (const certainty of ['confirmed', 'inferred', 'unknown']) {
        const element = { ...source.elements.find(element => element.icon === icon), rotation, certainty };
        const scene = freeze({ ...source, elements: [element] }), original = structuredClone(scene);
        const frame = sceneFrame(scene), fp = elementFootprint(element, frame.scale);
        const center = frame.point(...fp.center);
        const toFootprint = new Matrix4().makeRotationY(-fp.rotation).multiply(new Matrix4().makeTranslation(-center.x, 0, -center.z));
        const expected = new Box3().setFromPoints(fp.points.map(point => new Vector3(point.x, 0, point.y)));
        const model = createSceneModel(scene, false);
        try {
            const rendered = new Box3(), outlines = [];
            model.group.updateMatrixWorld(true);
            // Measure drawn vertices in the footprint's axes, not an expanded world AABB.
            model.group.traverse(node => {
                if (node.isLine) outlines.push(node);
                if (!node.isMesh && !node.isLine) return;
                const points = node.geometry.getAttribute('position');
                for (let instance = 0; instance < (node.isInstancedMesh ? node.count : 1); instance++) {
                    const matrix = new Matrix4();
                    if (node.isInstancedMesh) node.getMatrixAt(instance, matrix);
                    matrix.premultiply(node.matrixWorld).premultiply(toFootprint);
                    for (let i = 0; i < points.count; i++) rendered.expandByPoint(new Vector3().fromBufferAttribute(points, i).applyMatrix4(matrix));
                }
            });
            for (const side of ['min', 'max']) for (const axis of ['x', 'z']) {
                assert.ok(Math.abs(rendered[side][axis] - expected[side][axis]) < 1e-5, `${icon}: lost authored ${side}.${axis}`);
            }
            assert.equal(outlines.length, needsOutline ? 1 : 0, `${icon}: footprint outline must reflect the actual fit`);
            for (const outline of outlines) {
                const points = outline.geometry.getAttribute('position');
                assert.equal(points.count, fp.points.length + 1);
                for (let i = 0; i < points.count; i++) {
                    const point = new Vector3().fromBufferAttribute(points, i).applyMatrix4(outline.matrixWorld);
                    const corner = fp.points[i % fp.points.length];
                    const expectedPoint = new Vector3(corner.x, 0, corner.y).applyAxisAngle(new Vector3(0, 1, 0), fp.rotation).add(frame.point(...fp.center));
                    assert.ok(Math.hypot(point.x - expectedPoint.x, point.z - expectedPoint.z) < 1e-5, `${icon}: outline changed the original contour`);
                    assert.ok(point.y > 0 && point.y < .03, 'Occupancy belongs at ground level');
                }
                assert.equal(outline.material.opacity, elementPresentation(element, '').opacity);
                assert.equal(outline.material.gapSize > 0, certainty !== 'confirmed');
            }
            assert.deepEqual(scene, original);
        } finally {model.dispose();}
    }
});

test('fence paths preserve open gaps and closed outlines without filling interiors', () => {
    for (const shape of ['path', 'curve']) for (const closed of [false, true]) {
        const element = { id: 'fence', category: 'decoration', shape, icon: 'fence', closed, geometry: { points: [[0, 0], [100, 0], [100, 100]] } };
        const original = structuredClone(element);
        assert.equal(isAreaElement(element), false);
        assert.equal(sceneElementOutline(element).closed, closed);
        const model = createSceneModel({ key: 'fence', viewBox: [-50, -50, 200, 200], elements: [element] }, false);
        const frame = sceneFrame({ viewBox: [-50, -50, 200, 200] });
        const middleOfGap = frame.point(50, 50, .22);
        let crossing = false;
        model.group.updateMatrixWorld(true);
        model.group.traverse(mesh => {
            if (!mesh.isInstancedMesh) return;
            mesh.geometry.computeBoundingBox();
            for (let i = 0; i < mesh.count; i++) {
                const matrix = new Matrix4(); mesh.getMatrixAt(i, matrix);
                const box = mesh.geometry.boundingBox.clone().applyMatrix4(matrix.premultiply(mesh.matrixWorld));
                if (box.containsPoint(middleOfGap)) crossing = true;
            }
        });
        if (!closed) assert.equal(crossing, false, 'The entrance gap was bridged');
        assert.ok(new Box3().setFromObject(model.group).max.y < .7);
        model.dispose(); assert.deepEqual(element, original);
    }
});

test('markers and structural geometry are not promoted by an object icon; unsupported footprints remain schematic', () => {
    const rect = { id: 'element', category: 'furniture', icon: 'car', shape: 'rect', geometry: { x: 10, y: 20, width: 50, height: 100 } };
    const special = [
        ...['actor', 'door', 'wall', 'grid'].map(category => ({ ...rect, category })),
        ...['icon', 'label'].map(shape => ({ ...rect, shape, geometry: { x: 40, y: 70 } })),
        { ...rect, icon: 'door-open' },
        { ...rect, geometry: { ...rect.geometry, width: 300 } },
        { ...rect, shape: 'circle', geometry: { x: 40, y: 70, radius: 20 } },
        { ...rect, shape: 'path', closed: true, geometry: { points: [[0, 0], [100, 0], [0, 100]] } },
    ];
    for (const element of special) {
        const original = structuredClone(element);
        const model = createSceneModel({ key: 'boundaries', viewBox: [0, 0, 500, 500], elements: [freeze(element)] }, false, {
            get() {assert.fail('A non-object/unsupported footprint tried to load a model');},
        });
        assert.ok(model.anchors.has(element.id));
        if (element.category === 'furniture' && !['icon', 'label'].includes(element.shape)) {
            const bounds = new Box3().setFromObject(model.group);
            assert.ok(bounds.max.y <= .21, 'Unsupported shape became a tall invented model');
        }
        model.dispose(); assert.deepEqual(element, original);
    }
});

test('asset sessions deduplicate, isolate failure and dispose replaced or late prototypes', async () => {
    const pending = new Map(), requests = [], reports = [], disposals = [];
    let changes = 0;
    const session = createSceneAssetSession((kind, signal) => {
        requests.push({ kind, signal });
        return new Promise((resolve, reject) => pending.set(kind, { resolve, reject }));
    }, () => {changes++;}, (kind, error) => reports.push([kind, error.message]));
    const settle = () => new Promise(resolve => setImmediate(resolve));
    session.sync(['car', 'car', 'toilet']); session.sync(['car', 'toilet']);
    assert.equal(requests.length, 2);
    pending.get('toilet').reject(Error('decode failed')); await settle();
    session.sync(['car', 'toilet']); assert.equal(requests.length, 2);
    pending.get('car').resolve({ dispose: () => disposals.push('car') }); await settle();
    assert.equal(changes, 1); assert.deepEqual(reports, [['toilet', 'decode failed']]);
    session.sync(['bench']);
    assert.deepEqual(disposals, ['car']); assert.ok(requests[0].signal.aborted);
    session.dispose();
    pending.get('bench').resolve({ dispose: () => disposals.push('bench') }); await settle();
    session.sync(['car']);
    assert.equal(requests.length, 3); assert.equal(changes, 1);
    assert.deepEqual(disposals, ['car', 'bench']);
});
