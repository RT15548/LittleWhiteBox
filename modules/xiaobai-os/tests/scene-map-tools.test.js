import assert from 'node:assert/strict';
import test from 'node:test';
import { createMapMaintenanceParticipant, MAP_MAINTENANCE_TOOL_NAMES as TOOLS } from '../apps/map/host/maintenance-participant.js';
import { parseMapDomain } from '../domains/map/invariants.js';
import { mapAtlasFixture } from './fixtures/map-atlas.js';
import { createMapKernelHarness } from './map-kernel-harness.js';
import { sceneMapInputs, sceneMapLocations } from './fixtures/scene-maps.js';
import { sceneElementPath } from '../apps/map/ui/scene-geometry.js';
import { SCENE_EXAMPLES } from '../apps/map/tools/scene-examples.js';
import { createMapManagement } from '../apps/map/management/participant.js';
import { locationRegion } from '../domains/map/hierarchy.js';

const source = { chatIdentity: 'scene-map-verification', messages: [{ index: 0, role: 'assistant', text: 'Independent scene verification.', swipeId: 0, speakerName: 'Narrator' }], messageCount: 1, assistantCount: 1, player: { actorKey: 'player', displayName: '小白' } };
const sessionFor = kernel => createMapMaintenanceParticipant({ map: kernel.map, readSettings: () => ({ autoMaintenance: false }) }).createSession(source, 'manual');

test('Scene readback targets the owning location even when its internal key collides with another location', async () => {
    const domain = mapAtlasFixture([
        { key: 'owner', name: 'Owner', scale: 'room', status: 'mentioned', sceneKey: 'layout' },
        { key: 'layout', name: 'Other', scale: 'room', status: 'mentioned', sceneKey: 'other-layout' },
    ]);
    domain.scenes = {
        layout: { key: 'layout', name: 'Owner', status: 'active', viewBox: [0, 0, 400, 300], elements: [{ id: 'mark', category: 'marker', shape: 'icon', geometry: { x: 20, y: 30 } }] },
        'other-layout': { key: 'other-layout', name: 'Other', status: 'active', viewBox: [0, 0, 400, 300], elements: [] },
    };
    const kernel = createMapKernelHarness(domain);
    const session = await sessionFor(kernel);
    const read = await session.executeTool(TOOLS.SCENE_READ, { scene: 'owner' });
    assert.equal(read.data.scene.scene, 'owner');
    assert.equal((await session.executeTool(TOOLS.SCENE_EDIT, read.data.scene)).status, 'unchanged');
    read.data.scene.elements[0].geo.at = [30, 40];
    assert.equal((await session.executeTool(TOOLS.SCENE_EDIT, read.data.scene)).status, 'updated');
    await session.commit(() => true);
    assert.deepEqual(kernel.state.persisted.partitions.map.scenes['other-layout'], domain.scenes['other-layout']);
    assert.deepEqual(kernel.state.persisted.partitions.map.scenes.layout.elements[0].geometry, { x: 30, y: 40 });
});

test('Scene read returns editable vocabulary for every shape without exposing or mutating storage', async () => {
    const kernel = createMapKernelHarness(mapAtlasFixture([{ key: 'readback', name: 'Readback' }]));
    let session = await sessionFor(kernel);
    const input = {
        scene: 'readback', mood: 'cold', viewBox: [0, 0, 400, 300],
        elements: [
            { id: 'rect', cat: 'furniture', shape: 'rect', geo: { center: [100.25, 80.5], size: [30.5, 40.25] }, icon: 'chair', rotation: 180, material: 'metal', certainty: 'inferred' },
            { id: 'circle', cat: 'decoration', shape: 'circle', geo: { at: [220, 90], radius: 15 }, icon: 'rock', rotation: 0 },
            { id: 'path', cat: 'wall', shape: 'path', geo: { points: [[20, 20], [380, 20], [380, 280]] }, closed: false },
            { id: 'curve', cat: 'water', shape: 'curve', geo: { curve: [[30, 230], [200, 250], [360, 230]] }, closed: false },
            { id: 'icon', cat: 'marker', shape: 'icon', geo: { at: [40, 60] }, kind: 'marker' },
            { id: 'label', cat: 'label', shape: 'label', geo: { at: [200, 35] }, label: 'North' },
        ],
    };
    assert.deepEqual((await session.executeTool(TOOLS.SCENE_EDIT, input)).skipped, []);
    await session.commit(() => true);
    const stored = structuredClone(kernel.state.persisted.partitions.map);
    session = await sessionFor(kernel);
    const read = await session.executeTool(TOOLS.SCENE_READ, { scene: 'readback' });
    assert.deepEqual(read.data.scene, input);
    assert.equal((await session.executeTool(TOOLS.SCENE_EDIT, read.data.scene)).status, 'unchanged');
    const chair = read.data.scene.elements.find(e => e.id === 'rect');
    chair.geo.center[0] += 20;
    assert.deepEqual((await session.executeTool(TOOLS.SCENE_READ, { scene: 'readback' })).data.scene, input);
    assert.equal((await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'readback', elements: [chair] })).status, 'updated');
    await session.commit(() => true);
    const saved = kernel.state.persisted.partitions.map;
    for (const original of stored.scenes.readback.elements) {
        const expected = structuredClone(original);
        if (expected.id === 'rect') expected.geometry.x += 20;
        assert.deepEqual(saved.scenes.readback.elements.find(e => e.id === expected.id), expected);
    }
});

test('inclusive provider bounds cannot store zero-sized physical footprints', async () => {
    const kernel = createMapKernelHarness(mapAtlasFixture([{ key: 'invalid-size' }, { key: 'point' }]));
    const session = await sessionFor(kernel);
    const result = await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'invalid-size', elements: [
        { id: 'rect', cat: 'furniture', shape: 'rect', geo: { center: [20, 20], size: [0, 30] } },
    ] });
    assert.equal(result.status, 'failed');
    assert.deepEqual(result.skipped.map(item => item.id), ['rect']);
    assert.equal(session.canCommit(), false);
    // An explicit physical circle cannot silently turn into a point marker.
    const point = await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'point', elements: [
        { id: 'circle', cat: 'decoration', shape: 'circle', geo: { at: [20, 20], radius: 0 } },
    ] });
    assert.equal(point.status, 'failed');
    const read = await session.executeTool(TOOLS.SCENE_READ, { scene: 'point' });
    assert.equal(read.data.scene, null);
});

for (const example of SCENE_EXAMPLES) {
    test(`model-facing ${example.create.scene} example saves and its next-turn patch changes only the named element`, async () => {
        const kernel = createMapKernelHarness();
        let session = await sessionFor(kernel);
        assert.equal((await session.executeTool(TOOLS.ATLAS_EDIT, example.atlas)).status, 'updated');
        const created = await session.executeTool(TOOLS.SCENE_EDIT, example.create);
        assert.equal(created.status, 'updated');
        assert.deepEqual(created.skipped, []);
        assert.deepEqual(created.warnings, []);
        await session.commit(() => true);
        const initial = parseMapDomain(kernel.state.persisted.partitions.map).scenes[example.create.scene];
        session = await sessionFor(kernel);
        const updated = await session.executeTool(TOOLS.SCENE_EDIT, example.update.edit);
        assert.equal(updated.status, 'updated');
        assert.deepEqual(updated.skipped, []);
        assert.deepEqual(updated.warnings, []);
        await session.commit(() => true);
        const final = parseMapDomain(kernel.state.persisted.partitions.map).scenes[example.create.scene];
        assert.deepEqual(final.viewBox, initial.viewBox);
        const patch = example.update.edit.elements[0];
        for (const element of initial.elements) {
            const current = final.elements.find(e => e.id === element.id);
            if (element.id !== patch.id) assert.deepEqual(current, element);
            else if (patch.geo) assert.deepEqual(current, { ...element, geometry: { x: patch.geo.at[0], y: patch.geo.at[1] } });
            else assert.deepEqual(current, { ...element, rotation: patch.rotation });
        }
    });

    test(`administrator can establish ${example.create.scene} from an empty atlas and draw it without a failed attempt`, async t => {
        const kernel = createMapKernelHarness();
        t.after(kernel.map.dispose);
        const session = await createMapManagement(kernel.map, () => source.player).open();
        const atlas = await session.execute(TOOLS.ATLAS_EDIT, example.atlas, () => true);
        assert.equal(atlas.status, 'saved');
        assert.deepEqual(atlas.data.skipped, []);
        assert.equal(kernel.state.writes.length, 1);
        const drawn = await session.execute(TOOLS.SCENE_EDIT, example.create, () => true);
        assert.equal(drawn.status, 'saved');
        assert.deepEqual(drawn.data.skipped, []);
        assert.equal(kernel.state.writes.length, 2);
        const saved = parseMapDomain(kernel.state.persisted.partitions.map);
        const place = saved.atlas.locations.find(location => location.key === example.create.scene);
        const region = locationRegion(saved.atlas, place.key);
        assert.ok(region);
        assert.equal(place.parent, region.key);
        assert.ok(saved.scenes[place.sceneKey]);
        for (const declared of example.atlas.locations) {
            const stored = saved.atlas.locations.find(location => location.key === declared.key);
            assert.equal(stored.parent, declared.parent);
            assert.equal(stored.scale, declared.scale);
        }
    });
}

for (const fixture of sceneMapInputs) {
    test(`${fixture.scene}: Tool compiler → domain → persistence → readback → renderer geometry`, async () => {
        const kernel = createMapKernelHarness(mapAtlasFixture([sceneMapLocations.find(place => place.key === fixture.scene)]));
        const session = await sessionFor(kernel);
        const result = await session.executeTool(TOOLS.SCENE_EDIT, fixture);
        assert.equal(result.status, 'updated');
        assert.deepEqual(result.skipped, []);
        await session.commit(() => true);
        const persisted = parseMapDomain(kernel.state.persisted.partitions.map);
        const reloaded = createMapKernelHarness(persisted);
        await reloaded.map.refreshCurrent();
        assert.deepEqual(reloaded.map.readCurrent().map, persisted);
        for (const element of persisted.scenes[fixture.scene].elements) {
            if (!['icon', 'label'].includes(element.shape)) { assert.ok(sceneElementPath(element)); }
        }
    });
}

test('rotation/material/movement/delete patches preserve unrelated facts through save and scene read', async () => {
    const kernel = createMapKernelHarness(mapAtlasFixture([sceneMapLocations[0]]));
    let session = await sessionFor(kernel);
    await session.executeTool(TOOLS.SCENE_EDIT, sceneMapInputs[0]);
    await session.commit(() => true);
    const initial = structuredClone(kernel.map.readCurrent().map.scenes.tavern);
    session = await sessionFor(kernel);
    for (const elements of [[{ id: 'table', rotation: 37 }], [{ id: 'table', material: 'metal' }], [{ id: 'player', geo: { at: [405, 255] } }]]) {
        assert.equal((await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'tavern', elements })).status, 'updated');
    }
    await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'tavern', remove: ['sofa'] });
    await session.commit(() => true);
    const saved = parseMapDomain(kernel.state.persisted.partitions.map).scenes.tavern;
    assert.equal(saved.elements.find(e => e.id === 'table').rotation, 37);
    assert.equal(saved.elements.find(e => e.id === 'table').material, 'metal');
    assert.equal(saved.elements.some(e => e.id === 'sofa'), false);
    for (const element of initial.elements.filter(e => !['table', 'player', 'sofa'].includes(e.id))) {
        assert.deepEqual(saved.elements.find(e => e.id === element.id), element);
    }
    session = await sessionFor(kernel);
    const read = await session.executeTool(TOOLS.SCENE_READ, { scene: 'tavern' });
    assert.equal(read.data.scene.elements.find(e => e.id === 'table').rotation, 37);
    await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'tavern', elements: [{ id: 'table', rotation: null }] });
    await session.commit(() => true);
    assert.equal(Object.hasOwn(kernel.state.persisted.partitions.map.scenes.tavern.elements.find(e => e.id === 'table'), 'rotation'), false);
});

test('bad orientations reject only that element, can be repaired, and cannot enter through stored data', async () => {
    const kernel = createMapKernelHarness(mapAtlasFixture([sceneMapLocations[0]]));
    const session = await sessionFor(kernel);
    await session.executeTool(TOOLS.SCENE_EDIT, sceneMapInputs[0]);
    for (const rotation of [-1, 360, Infinity, NaN, '90']) {
        const result = await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'tavern', elements: [{ id: 'table', rotation }, { id: 'bar', material: 'metal' }] });
        assert.deepEqual(result.skipped.map(e => e.id), ['table']);
        assert.equal(result.skipped[0].inputIssues[0].path, 'elements[0].rotation');
    }
    for (const id of ['walls', 'door']) {
        const result = await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'tavern', elements: [{ id, rotation: 0 }] });
        assert.deepEqual(result.skipped.map(e => e.id), [id]);
        await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'tavern', elements: [{ id, rotation: null }] });
    }
    await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'tavern', elements: [{ id: 'table', rotation: 359.9 }] });
    assert.equal(session.getResult().status, 'updated');
    await session.commit(() => true);
    const stored = structuredClone(kernel.state.persisted.partitions.map);
    const table = stored.scenes.tavern.elements.find(e => e.id === 'table');
    for (const rotation of [-1, 360, Infinity, null]) {
        table.rotation = rotation;
        assert.throws(() => parseMapDomain(stored), /rotation/);
    }
    delete table.rotation;
    assert.doesNotThrow(() => parseMapDomain(stored));
});

test('round footprints accept orientation; changing to a path requires explicitly clearing it', async () => {
    const kernel = createMapKernelHarness(mapAtlasFixture([{ key: 'circular' }]));
    const session = await sessionFor(kernel);
    assert.equal((await session.executeTool(TOOLS.SCENE_EDIT, {
        scene: 'circular', elements: [{ id: 'seat', cat: 'furniture', shape: 'circle', geo: { at: [40, 30], radius: 18 }, icon: 'chair', material: 'glass', rotation: 90 }],
    })).status, 'updated');
    const patch = { id: 'seat', shape: 'path', geo: { points: [[22, 12], [58, 12], [40, 48]] } };
    const rejected = await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'circular', elements: [patch] });
    assert.deepEqual(rejected.skipped.map(e => e.id), ['seat']);
    const unchanged = await session.executeTool(TOOLS.SCENE_READ, { scene: 'circular' });
    assert.equal(unchanged.data.scene.elements[0].shape, 'circle');
    assert.equal(unchanged.data.scene.elements[0].rotation, 90);
    assert.equal((await session.executeTool(TOOLS.SCENE_EDIT, { scene: 'circular', elements: [{ ...patch, rotation: null }] })).status, 'updated');
    await session.commit(() => true);
    const saved = kernel.state.persisted.partitions.map.scenes.circular.elements[0];
    assert.equal(saved.shape, 'path');
    assert.equal(Object.hasOwn(saved, 'rotation'), false);
    assert.equal(saved.material, 'glass');
});
