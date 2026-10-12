import assert from 'node:assert/strict';
import test from 'node:test';
import { Box3, Scene, Vector3, WebGLRenderTarget } from 'three';
import { MAP_ARTIFICIAL_LIGHTS, MAP_LIGHTING_SPACES, MAP_NATURAL_LIGHTS } from '../domains/map/semantics.js';
import { parseMapDomain } from '../domains/map/invariants.js';
import { applyMapDomainEdits } from '../domains/map/edit.js';
import { compileSceneIntent } from '../apps/map/tools/scene-intent-compiler.js';
import { sceneForTool } from '../apps/map/tools/scene-reader.js';
import { MAX_SCENE_LIGHT_SOURCES, MAX_SCENE_LIGHT_SHADOWS, sceneLighting, sceneLightingMatrix, sceneLightingStyle, sceneLightSources } from '../apps/map/ui/scene-lighting.js';
import { MAP_MOOD_RECIPES } from '../apps/map/ui/map-presentation.js';
import { createSceneModel } from '../apps/map/ui/three/scene3d-model.js';
import { createSceneMaterials } from '../apps/map/ui/three/scene3d-materials.js';
import { Scene3DResources } from '../apps/map/ui/three/scene3d-resources.js';
import { createSceneLighting } from '../apps/map/ui/three/scene3d-lighting.js';
import { sceneFrame } from '../apps/map/ui/three/scene3d-geometry.js';
import { mapAtlasFixture } from './fixtures/map-atlas.js';
import { sceneMapInputs } from './fixtures/scene-maps.js';

const player = { actorKey: 'player', displayName: 'Player' };
const input = sceneMapInputs[0];
const lightingStates = MAP_LIGHTING_SPACES.flatMap(space => MAP_NATURAL_LIGHTS.flatMap(natural => MAP_ARTIFICIAL_LIGHTS.map(artificial => ({ space, natural, artificial }))));
const fixture = () => compileSceneIntent(mapAtlasFixture([{ key: input.scene }]), input, player).domain;

test('absent lighting stays absent in existing scenes, readback and presentation', () => {
    const map = parseMapDomain(fixture());
    const scene = map.scenes[input.scene];
    assert.equal(Object.hasOwn(scene, 'lighting'), false);
    const read = sceneForTool(scene, map.atlas.locations.find(location => location.sceneKey === scene.key));
    assert.equal(Object.hasOwn(read, 'lighting'), false);
    assert.equal(compileSceneIntent(map, read, player).result.status, 'unchanged');
    assert.equal(sceneLightingMatrix(scene.lighting), undefined);
    assert.deepEqual(sceneLightingStyle(scene), { '--scene-glow': MAP_MOOD_RECIPES[scene.mood || 'neutral'].glow });
    // This protects the pre-environment renderer contract, not an inferred default environment.
    assert.deepEqual(sceneLighting(), {
        sky: { color: '#f5f8ff', intensity: 1.65 }, ground: '#9c8c7a',
        key: { color: '#fff3df', intensity: 3.1 }, fill: { color: '#daeaff', intensity: .65 },
        shadows: true, lampEmission: .18,
    });
});

test('all lighting combinations create, read and update without changing geometry or mood; omit preserves, null clears', () => {
    const original = fixture();
    for (const lighting of lightingStates) {
        const created = compileSceneIntent(mapAtlasFixture([{ key: input.scene }]), { ...input, lighting }, player);
        assert.equal(created.result.status, 'updated');
        const compiled = compileSceneIntent(original, { scene: input.scene, lighting }, player);
        assert.equal(compiled.result.status, 'updated');
        const map = parseMapDomain(compiled.domain), scene = map.scenes[input.scene];
        assert.deepEqual(scene.lighting, lighting);
        assert.deepEqual(scene, created.domain.scenes[input.scene]);
        const owner = map.atlas.locations.find(location => location.sceneKey === scene.key);
        const read = sceneForTool(scene, owner);
        assert.equal(compileSceneIntent(map, read, player).result.status, 'unchanged');
        read.lighting.artificial = 'invalid';
        assert.deepEqual(scene.lighting, lighting);
        const omit = compileSceneIntent(map, { scene: input.scene, elements: [{ id: 'table', rotation: 35 }] }, player);
        assert.deepEqual(omit.domain.scenes[input.scene].lighting, lighting);
        const cleared = compileSceneIntent(map, { scene: input.scene, lighting: null }, player);
        assert.deepEqual(cleared.domain.scenes, original.scenes);
        assert.equal(compileSceneIntent(original, { scene: input.scene, lighting: null }, player).result.status, 'unchanged');
    }
});

test('invalid lighting rejects the call atomically, and invalid stored lighting never becomes a silent default', () => {
    const original = fixture();
    const valid = { space: 'indoor', natural: 'night', artificial: 'on' };
    for (const lighting of [{}, { space: 'indoor' }, 'night', [], { ...valid, natural: 'moon' }, { ...valid, artificial: true }, { ...valid, color: '#fff' }]) {
        const compiled = compileSceneIntent(original, { scene: input.scene, lighting, elements: [{ id: 'table', rotation: 80 }] }, player);
        assert.equal(compiled.result.status, 'failed');
        assert.deepEqual(compiled.domain, original);
        assert.deepEqual(compiled.edits, []);
        const stored = structuredClone(original);
        stored.scenes[input.scene].lighting = lighting;
        assert.throws(() => parseMapDomain(stored), error => error.code === 'map_invalid_domain');
        assert.throws(() => applyMapDomainEdits(original, [{ op: 'update-scene', sceneKey: input.scene, changes: { lighting } }]), error => error.code === 'map_invalid_domain');
    }
    const storedNull = structuredClone(original);
    storedNull.scenes[input.scene].lighting = null;
    assert.throws(() => parseMapDomain(storedNull), error => error.code === 'map_invalid_domain');
});

test('daylight, sunlight, darkness and lamps have distinct illumination without moving scene geometry', () => {
    const scene = fixture().scenes[input.scene];
    const baseline = createSceneModel(scene, false);
    try {
        for (const lighting of lightingStates) {
            const model = createSceneModel({ ...scene, lighting }, false, undefined, baseline.frame);
            try {
                assert.deepEqual(model.bounds, baseline.bounds);
                assert.deepEqual(model.anchors, baseline.anchors);
                assert.equal(model.group.children.length, baseline.group.children.length);
            } finally {model.dispose();}
        }
    } finally {baseline.dispose();}
    for (const space of MAP_LIGHTING_SPACES) {
        const recipe = (natural, artificial = 'off') => sceneLighting({ space, natural, artificial });
        assert.ok(recipe('night').sky.intensity < recipe('daylight').sky.intensity);
        // Artificial light is local: it must not replace sunlight with a global warm wash.
        assert.deepEqual(recipe('night', 'on').key, recipe('night').key);
        assert.ok(recipe('sunlight').key.intensity > recipe('daylight').key.intensity);
        assert.equal(recipe('sunlight').shadows, true);
        assert.equal(recipe('daylight').shadows, false);
        assert.equal(recipe('night').lampEmission, 0);
        assert.ok(recipe('night').sky.intensity > 0);
        assert.notDeepEqual(recipe('daylight').surface, recipe('night').surface);
        assert.deepEqual(recipe('night', 'on').surface, recipe('night').surface);
    }
});

test('lamps lose emission when switched off; magical materials keep their independent glow', () => {
    const resources = new Scene3DResources();
    try {
        const get = lighting => createSceneMaterials(resources, false, lighting);
        const off = get({ space: 'indoor', natural: 'night', artificial: 'off' });
        const on = get({ space: 'indoor', natural: 'night', artificial: 'on' });
        const material = token => ({ id: token, category: 'light', material: token, shape: 'circle', geometry: { x: 0, y: 0, radius: 10 } });
        for (const token of ['warm-light', 'cold-light']) {
            assert.equal(off.mesh(material(token)).emissiveIntensity, 0);
            assert.ok(on.mesh(material(token)).emissiveIntensity > 0);
        }
        assert.equal(off.mesh(material('rune')).emissiveIntensity, on.mesh(material('rune')).emissiveIntensity);
    } finally {resources.dispose();}
});

test('lamps follow authored geometry and share a fixed local-light budget without altering background or map facts', () => {
    const scene = fixture().scenes[input.scene];
    const unlit = structuredClone(scene);
    const lamp = (id, x, material = 'warm-light') => ({ id, category: 'decoration', shape: 'circle', geometry: { x, y: 130, radius: 10 }, icon: 'light', material });
    assert.deepEqual(sceneLightSources(scene), []);
    scene.lighting = { space: 'indoor', natural: 'night', artificial: 'on' };
    const overhead = sceneLightSources(scene);
    assert.equal(overhead.length, 1);
    assert.equal(overhead[0].overhead, true);
    scene.elements.push(lamp('warm', 150), lamp('cold', 400, 'cold-light'));
    const before = structuredClone(scene);
    const sources = sceneLightSources(scene);
    assert.deepEqual(sources.map(s => [s.id, s.x, s.y]).sort(), [['cold', 400, 130], ['warm', 150, 130]]);
    assert.notEqual(sources[0].color, sources[1].color);
    assert.deepEqual(scene, before);
    assert.deepEqual(sceneLightSources({ ...scene, viewBox: [0, 0, 2000, 1600] }), sources);
    assert.deepEqual(sceneLightingStyle(scene), sceneLightingStyle(unlit));
    scene.elements.push(...Array.from({ length: MAX_SCENE_LIGHT_SOURCES + 5 }, (_, i) => lamp(`lamp-${i}`, i * 20)));
    assert.equal(sceneLightSources(scene).length, MAX_SCENE_LIGHT_SOURCES);
    const limited = sceneLightSources(scene);
    scene.elements.reverse();
    assert.deepEqual(sceneLightSources(scene), limited);
    scene.lighting.artificial = 'off';
    assert.deepEqual(sceneLightSources(scene), []);
});

test('3D lights have distance falloff and bounded shadows; switching off or disposing releases their targets', () => {
    const data = fixture().scenes[input.scene], world = new Scene();
    const rig = createSceneLighting(world), frame = sceneFrame(data);
    const bounds = new Box3(new Vector3(-7, 0, -5), new Vector3(7, 2, 5));
    const update = () => rig.update(data, frame, bounds, new Map());
    const lamps = () => world.children.filter(child => child.isPointLight);
    update();
    assert.equal(lamps().length, 0);
    data.lighting = { space: 'indoor', natural: 'night', artificial: 'on' };
    update();
    assert.equal(lamps().length, 1);
    assert.ok(lamps()[0].distance > 0 && lamps()[0].decay > 0);
    assert.ok(lamps().filter(light => light.castShadow).length <= MAX_SCENE_LIGHT_SHADOWS);
    const live = lamps()[0];
    assert.equal(live.shadow.autoUpdate, false);
    live.shadow.needsUpdate = false;
    rig.invalidateShadows();
    assert.equal(live.shadow.needsUpdate, true);
    update();
    assert.equal(lamps()[0], live);
    let released = 0;
    const target = new WebGLRenderTarget(16, 16);
    target.addEventListener('dispose', () => released++);
    live.shadow.map = target;
    data.lighting.artificial = 'off';
    update();
    assert.equal(lamps().length, 0);
    assert.equal(released, 1);
    data.lighting.artificial = 'on';
    update();
    const finalTarget = new WebGLRenderTarget(16, 16);
    finalTarget.addEventListener('dispose', () => released++);
    lamps()[0].shadow.map = finalTarget;
    rig.dispose();
    assert.equal(released, 2);
    assert.equal(world.children.length, 0);
});
