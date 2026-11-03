import assert from 'node:assert/strict';
import test from 'node:test';
import { NoColorSpace, SRGBColorSpace } from 'three';
import { createGroundSurface, GROUND_SURFACES } from '../apps/map/ui/scene-ground-surfaces.js';
import { createSceneMaterials } from '../apps/map/ui/three/scene3d-materials.js';
import { Scene3DResources } from '../apps/map/ui/three/scene3d-resources.js';
import { createSceneModel } from '../apps/map/ui/three/scene3d-model.js';

test('ground appearance is deterministic, bounded and has independent colour, relief and finish', () => {
    let bytes = 0;
    for (const material of Object.keys(GROUND_SURFACES)) {
        const surface = createGroundSurface(material), repeat = createGroundSurface(material);
        assert.deepEqual(surface, repeat);
        assert.equal(surface.color.length, surface.size ** 2 * 4);
        assert.equal(surface.height.length, surface.size ** 2);
        assert.equal(surface.roughness.length, surface.size ** 2);
        assert.ok(new Set(surface.height).size > 1);
        assert.ok(new Set(surface.roughness).size > 1);
        // Different physical channels cannot accidentally share the albedo buffer.
        assert.notEqual(surface.color.buffer, surface.height.buffer);
        assert.notEqual(surface.height.buffer, surface.roughness.buffer);
        bytes += surface.color.byteLength + surface.height.byteLength + surface.roughness.byteLength;
    }
    assert.ok(bytes <= 4 * 1024 * 1024, 'all CPU surface data remains within a small per-view budget');
});

test('ground channels share within a scene, use linear scalar data and release exactly once', () => {
    const resources = new Scene3DResources(), materials = createSceneMaterials(resources, false);
    const observed = new Set();
    for (const material of Object.keys(GROUND_SURFACES)) {
        const element = { id: material, category: 'terrain', shape: 'rect', material, geometry: { x: 0, y: 0, width: 600, height: 400 } };
        const ground = materials.ground(element), uncertain = materials.ground({ ...element, certainty: 'inferred' });
        assert.equal(ground.map, uncertain.map);
        assert.equal(ground.bumpMap, uncertain.bumpMap);
        assert.equal(ground.roughnessMap, uncertain.roughnessMap);
        assert.equal(ground.map.colorSpace, SRGBColorSpace);
        assert.equal(ground.bumpMap.colorSpace, NoColorSpace);
        assert.equal(ground.roughnessMap.colorSpace, NoColorSpace);
        assert.notEqual(ground.map, ground.bumpMap);
        assert.ok(uncertain.opacity < ground.opacity);
        for (const texture of [ground.map, ground.bumpMap, ground.roughnessMap]) {
            assert.deepEqual(texture.repeat.toArray(), ground.map.repeat.toArray());
            assert.ok(texture.repeat.x > 0 && texture.generateMipmaps);
            observed.add(texture);
        }
        observed.add(ground); observed.add(uncertain);
        const object = materials.mesh({ ...element, category: 'furniture' });
        assert.notEqual(object.map, ground.map, 'a ground recipe must not repaint furniture');
    }
    const disposed = new Map([...observed].map(resource => [resource, 0]));
    observed.forEach(resource => resource.addEventListener('dispose', () => disposed.set(resource, disposed.get(resource) + 1)));
    resources.dispose(); resources.dispose();
    assert.ok([...disposed.values()].every(count => count === 1));
});

test('terrain surfaces are selected without adding geometry, altering occupancy or mutating facts', () => {
    const data = { key: 'ground', name: 'Ground', status: 'active', viewBox: [0, 0, 800, 600], elements: [
        { id: 'floor', category: 'terrain', material: 'sand', shape: 'path', closed: true, geometry: { points: [[0, 0], [700, 0], [700, 150], [220, 150], [220, 500], [0, 500]] } },
        { id: 'stone', category: 'decoration', material: 'stone', icon: 'rock', shape: 'circle', geometry: { x: 130, y: 240, radius: 30 } },
    ] };
    const original = structuredClone(data), model = createSceneModel(data, false);
    const ground = model.group.children[0].children.find(object => object.isMesh);
    assert.ok(ground.material.roughnessMap && ground.material.bumpMap);
    const positions = ground.geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
        assert.ok(positions.getY(i) <= .015 + 1e-6, 'relief stays in shading, never in occupied terrain geometry');
    }
    assert.deepEqual(data, original);
    model.dispose();
});
