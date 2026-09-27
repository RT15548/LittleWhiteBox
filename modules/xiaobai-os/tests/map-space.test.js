import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyMapDomain } from '../domains/map/state.js';
import { parseMapDomain, MAX_MAP_COORDINATE } from '../domains/map/invariants.js';
import { parseMapDomain as parseV1, MAX_MAP_BYTES as V1_BYTES } from '../domains/map/upgrades/v1/invariants.js';
import { readMapPartition } from '../domains/map/upgrades/read.js';
import { frameTransform, mapFrameId, transformPoint } from '../domains/map/space/frames.js';
import { mapBrowseScope, projectAtlas } from '../domains/map/space/projection.js';
import { MAX_SPACE_DETAILS } from '../domains/map/space/types.js';
import { clippedGeometryBounds, transformGeometry } from '../domains/map/space/geometry.js';
import { createMapMaintenanceSession } from '../apps/map/maintenance/session.js';
import { atlasDetails } from '../apps/map/ui/atlas/details.js';
import { atlasOccluders } from '../domains/map/space/composition.js';
import { compileAtlasIntent } from '../apps/map/tools/atlas-intent-compiler.js';
import { readAtlas } from '../apps/map/tools/atlas-reader.js';
import { ATLAS_EXAMPLES } from '../apps/map/tools/atlas-examples.js';
import { createMapManagement } from '../apps/map/management/participant.js';
import { createMapKernelHarness } from './map-kernel-harness.js';

const player = { actorKey: 'player', displayName: 'Player' };
const compile = (map, input) => compileAtlasIntent(map, input, player);
const fresh = id => {
    const result = compile(createEmptyMapDomain(), ATLAS_EXAMPLES.find(e => e.id === id).input);
    assert.equal(result.result.status, 'updated', JSON.stringify(result.result));
    return result.domain;
};
const view = (map, region = null) => projectAtlas(map.atlas, mapBrowseScope(map.atlas, region));

// Protect spatial/data contracts below Vue: the old scene tests cannot detect lost coordinate meaning.
test('multi-level map transforms round-trip and never use viewport extents', () => {
    const map = fresh('nature');
    const result = compile(map, { maps: [
        { map: 'east', mapping: { map: 'west', scale: .25, offset: [100, 80] } },
        { map: 'west', mapping: { map: null, scale: 2, offset: [20, 50] } },
    ] });
    assert.equal(result.result.status, 'updated');
    const forward = frameTransform(result.domain.atlas.frames, mapFrameId('east'), 'atlas');
    const reverse = frameTransform(result.domain.atlas.frames, 'atlas', mapFrameId('east'));
    assert.deepEqual(transformPoint([16, 24], forward), [228, 222]);
    assert.deepEqual(transformPoint(transformPoint([16, 24], forward), reverse), [16, 24]);
    const expanded = compile(result.domain, { features: [{ id: 'far', map: null, role: 'landmark', material: 'rock', geometry: { shape: 'point', x: 4000, y: 3000 } }] }).domain;
    assert.deepEqual(view(expanded).nodes, view(result.domain).nodes);
});

test('unlocated places stay in the correct list; known local maps do not imply a shared plane', () => {
    const map = fresh('nature');
    const result = compile(map, { locations: [{ key: 'room', name: 'Upper room', parent: 'station', position: { map: 'station', at: [12, 30] } }] });
    assert.equal(result.result.status, 'updated');
    const projected = view(result.domain, 'west');
    assert.equal(projected.scope.locations.length, 3);
    assert.equal(projected.nodes.length, 1);
    assert.equal(projected.unlocated.find(x => x.location.key === 'room').reason, 'mapping_unknown');
    assert.equal(projected.unlocated.find(x => x.location.key === 'unlocated').reason, 'position_unknown');
    assert.equal(view(result.domain).scope.locations.length, 2);
});

test('terrain-only projection is drawable and a regional extent excludes the rest of a world river', () => {
    const result = compile(createEmptyMapDomain(), { features: [{ id: 'sand', map: null, role: 'surface', material: 'sand', geometry: { shape: 'rect', x: -50, y: -20, width: 200, height: 100 } }] });
    assert.equal(result.result.status, 'updated');
    assert.equal(view(result.domain).drawable, true);
    assert.equal(view(result.domain).scope.locations.length, 0);
    const local = view(fresh('nature'), 'east');
    const river = local.features.find(f => f.source.id === 'river');
    assert.ok(river.bounds[0] >= 0 && river.bounds[0] + river.bounds[2] <= 500);
    assert.ok(local.viewBox[2] < view(fresh('nature')).viewBox[2]);
});

test('invalid linked spatial edits roll back as a group; an independent feature can still succeed', () => {
    const map = fresh('nature'), original = structuredClone(map);
    for (const scale of [0, -1, Infinity]) {
        const result = compile(map, { maps: [{ map: 'west', mapping: { map: null, scale, offset: [0, 0] } }], features: [
            { id: 'local', map: 'west', role: 'cover', material: 'snow', geometry: { shape: 'rect', x: 0, y: 0, width: 100, height: 80 } },
            { id: 'independent', map: null, role: 'landmark', material: 'rock', geometry: { shape: 'point', x: 1400, y: 600 } },
        ] });
        assert.equal(result.result.status, 'partial');
        assert.deepEqual(result.domain.atlas.frames, map.atlas.frames);
        assert.ok(!result.domain.atlas.features.some(f => f.id === 'local'));
        assert.ok(result.domain.atlas.features.some(f => f.id === 'independent'));
    }
    assert.deepEqual(map, original);
    const cycle = compile(map, { maps: [{ map: 'west', mapping: { map: 'east', scale: 1, offset: [0, 0] } }, { map: 'east', mapping: { map: 'west', scale: 1, offset: [0, 0] } }] });
    assert.equal(cycle.result.status, 'failed');
    assert.deepEqual(cycle.domain, original);
});

test('same-call geometry and mapping corrections are order independent; reframe preserves positions', () => {
    const map = fresh('nature');
    const features = [{ id: 'one', map: 'west', role: 'cover', material: 'snow', geometry: { shape: 'rect', x: 0, y: 0, width: 50, height: 60 } }, { id: 'two', map: 'east', role: 'landmark', material: 'rock', geometry: { shape: 'point', x: 10, y: 20 } }];
    const edits = { maps: [{ map: 'west', mapping: { map: null, scale: 2, offset: [50, 80] } }], features };
    for (const declarations of [features, [...features].reverse()]) {
        const result = compile(map, { ...edits, features: declarations });
        assert.equal(result.result.status, 'updated');
        const local = view(result.domain, 'west').features.find(f => f.source.id === 'one');
        assert.deepEqual(transformGeometry(local.geometry, frameTransform(result.domain.atlas.frames, mapFrameId('west'), 'atlas')), { shape: 'rect', x: 50, y: 80, width: 100, height: 120 });
        assert.ok(!view(result.domain).features.some(f => f.source.id === 'one'));
    }
    const before = view(map, 'west').nodes;
    const reframed = compile(map, { locations: [{ key: 'station', name: 'Station', reframe: null }] });
    assert.equal(reframed.result.status, 'updated');
    assert.deepEqual(view(reframed.domain, 'west').nodes.map(n => [n.x, n.y]), before.map(n => [n.x, n.y]));
});

test('deleting a region preserves a world river and its other regional projection', async () => {
    const map = fresh('nature'), harness = createMapKernelHarness(map);
    await harness.map.refreshCurrent();
    const river = structuredClone(map.atlas.features.find(f => f.id === 'river'));
    const other = view(map, 'east').features.find(f => f.source.id === 'river');
    const result = compile(map, { remove: { locationKeys: ['west'] } });
    assert.equal(result.result.status, 'updated', JSON.stringify(result.result));
    await harness.map.replaceCurrent(result.domain, { expectedRevision: map.revision });
    const saved = harness.state.persisted.partitions.map;
    assert.deepEqual(saved.atlas.features.find(f => f.id === 'river'), river);
    assert.deepEqual(view(saved, 'east').features.find(f => f.source.id === 'river'), other);
    assert.ok(!saved.atlas.frames.some(f => f.owner === 'west'));
});

test('deleting an associated destination does not delete terrain; deleting a live support rejects the group', () => {
    const map = fresh('nature');
    const linked = compile(map, { features: [{ id: 'forest', destination: 'station' }] }).domain;
    const removed = compile(linked, { remove: { locationKeys: ['station'] } });
    assert.equal(removed.result.status, 'updated');
    assert.equal(removed.domain.atlas.features.find(f => f.id === 'forest').destination, undefined);
    assert.deepEqual(removed.domain.atlas.features.find(f => f.id === 'forest').geometry, map.atlas.features.find(f => f.id === 'forest').geometry);
    const ocean = fresh('ocean');
    const rejected = compile(ocean, { remove: { featureIds: ['platform'] } });
    assert.equal(rejected.result.status, 'failed');
    assert.deepEqual(rejected.domain, ocean);
});

test('source-stable details use nested LOD subsets and remain bounded; water masks full ground decorations but not a deck', () => {
    const map = fresh('nature'), forest = map.atlas.features.find(f => f.id === 'forest');
    const near = atlasDetails(forest, [0, 0, 1000, 600], 1), far = atlasDetails(forest, [0, 0, 1000, 600], 8);
    assert.ok(near.length <= MAX_SPACE_DETAILS && far.length <= MAX_SPACE_DETAILS);
    for (const point of far) { const same = near.find(p => p.id === point.id); assert.deepEqual(same, point); }
    const projection = view(map), projected = projection.features.find(f => f.source.id === 'forest');
    assert.ok(atlasOccluders(projected, projection.features).some(f => f.source.id === 'river'));
    const sea = view(fresh('ocean'));
    assert.ok(!atlasOccluders(sea.features.find(f => f.source.id === 'platform-buildings'), sea.features).some(f => f.source.id === 'sea'));
    const deck = view(fresh('megastructure'));
    assert.ok(atlasOccluders(deck.features.find(f => f.source.id === 'modules'), deck.features).some(f => f.source.id === 'corridor'));
});

test('contradictory surfaces are rejected together regardless of input order', () => {
    const features = ['sand', 'snow'].map(material => ({ id: material, map: null, role: 'surface', material, geometry: { shape: 'rect', x: 0, y: 0, width: 100, height: 100 } }));
    for (const input of [features, [...features].reverse()]) {
        const map = createEmptyMapDomain(), result = compile(map, { features: input });
        assert.equal(result.result.status, 'failed'); assert.deepEqual(result.domain, map);
    }
});

// Different surface materials may share boundaries; bounds alone cannot distinguish that from occupied area.
test('surface adjacency accepts diagonal and concave shared edges but still rejects positive-area overlap', () => {
    const polygon = points => ({ shape: 'path', closed: true, points });
    const rectangle = (x, y, width, height) => ({ shape: 'rect', x, y, width, height });
    const lower = [[0, 0], [100, 0], [100, 100]], upper = [[0, 0], [100, 100], [0, 100]];
    const concave = polygon([[0, 0], [100, 0], [100, 40], [40, 40], [40, 100], [0, 100]]);
    const cases = [
        [polygon(lower), polygon(upper), true],
        [polygon([...lower].reverse()), polygon(upper), true],
        [rectangle(0, 0, 100, 100), rectangle(100, 0, 100, 100), true],
        [concave, rectangle(40, 40, 60, 60), true],
        [concave, rectangle(39, 39, 60, 60), false],
        [polygon(lower), polygon([...lower].reverse()), false],
        [rectangle(0, 0, 100, 100), rectangle(10, 10, 10, 10), false],
        [rectangle(0, 0, 100, 100), polygon([[50, 0], [100, 50], [50, 100], [0, 50]]), false],
        [rectangle(0, 0, 100, 100), polygon([[50, -10], [110, 50], [50, 110], [-10, 50]]), false],
    ];
    for (const [a, b, accepted] of cases) {
        const features = [a, b].map((geometry, i) => ({ id: `surface-${i}`, map: null, role: 'surface', material: i ? 'sand' : 'grass', geometry }));
        for (const input of [features, [...features].reverse()]) {
            const result = compile(createEmptyMapDomain(), { features: input });
            assert.equal(result.result.status, accepted ? 'updated' : 'failed', JSON.stringify({ a, b, result: result.result }));
            assert.equal(result.domain.atlas.features.length, accepted ? 2 : 0);
        }
    }
});

test('occupying old surface space forms an atomic move, swap or removal independently of declaration order', () => {
    const box = x => ({ shape: 'rect', x, y: 0, width: 10, height: 10 });
    const initial = compile(createEmptyMapDomain(), { features: [
        { id: 'a', map: null, role: 'surface', material: 'grass', geometry: box(0) },
        { id: 'b', map: null, role: 'surface', material: 'sand', geometry: box(20) },
    ] }).domain;
    for (const x of [0, 40]) {
        const declarations = [{ id: 'a', geometry: box(20) }, { id: 'b', geometry: box(x) }];
        for (const features of [declarations, [...declarations].reverse()]) {
            const result = compile(initial, { features });
            assert.equal(result.result.status, 'updated');
            assert.deepEqual(result.domain.atlas.features.map(f => [f.id, f.geometry.x]), [['a', 20], ['b', x]]);
        }
    }
    const failed = compile(initial, { features: [
        { id: 'a', geometry: box(20) }, { id: 'b', geometry: { ...box(40), width: 0 } },
        { id: 'independent', map: null, role: 'surface', material: 'snow', geometry: box(80) },
    ] });
    assert.equal(failed.result.status, 'partial');
    assert.deepEqual(failed.result.applied.map(e => e.id), ['independent']);
    assert.deepEqual(failed.domain.atlas.features.filter(f => f.id !== 'independent'), initial.atlas.features);
    const removed = compile(initial, { features: [{ id: 'a', geometry: box(20) }], remove: { featureIds: ['b'] } });
    assert.equal(removed.result.status, 'updated');
    assert.deepEqual(removed.domain.atlas.features.map(f => [f.id, f.geometry.x]), [['a', 20]]);
});

test('surface dependencies use both versions of frame mappings when maps exchange positions', () => {
    const initial = compile(createEmptyMapDomain(), {
        locations: ['a', 'b'].map(key => ({ key, name: key, scale: 'region' })),
        maps: ['a', 'b'].map((map, i) => ({ map, mapping: { map: null, scale: 1, offset: [i * 20, 0] } })),
        features: ['a', 'b'].map((map, i) => ({ id: `surface-${map}`, map, role: 'surface', material: i ? 'sand' : 'grass', geometry: { shape: 'rect', x: 0, y: 0, width: 10, height: 10 } })),
    }).domain;
    const declarations = [{ map: 'a', mapping: { map: null, scale: 1, offset: [20, 0] } }, { map: 'b', mapping: { map: null, scale: 1, offset: [0, 0] } }];
    for (const maps of [declarations, [...declarations].reverse()]) {
        const result = compile(initial, { maps });
        assert.equal(result.result.status, 'updated');
        assert.deepEqual(result.domain.atlas.features.map(f => [f.id, transformGeometry(f.geometry, frameTransform(result.domain.atlas.frames, f.frame, 'atlas')).x]), [['surface-a', 20], ['surface-b', 0]]);
        assert.deepEqual(view(result.domain).features, []);
    }
});

test('malformed spatial declarations return failed groups rather than escaping the tool', () => {
    const map = fresh('nature');
    for (const mapping of [{ map: null, scale: 1 }, { map: null, scale: 1, offset: {} }, { map: null, scale: '1', offset: [0, 0] }]) {
        const result = compile(map, { maps: [{ map: 'west', mapping }] });
        assert.equal(result.result.status, 'failed'); assert.deepEqual(result.domain, map);
    }
    const result = compile(map, { features: [{ id: 'land', crosses: 123 }] });
    assert.equal(result.result.status, 'failed'); assert.deepEqual(result.domain, map);
});

test('one deletion group removes disconnected coordinate owners and references regardless of order', () => {
    const initial = compile(createEmptyMapDomain(), { locations: [
        { key: 'r', name: 'Region', scale: 'region' },
        { key: 'a', name: 'A', parent: 'r', position: { map: 'b', at: [10, 20] } },
        { key: 'b', name: 'B', parent: 'r' },
    ] }).domain;
    for (const locationKeys of [['a', 'b'], ['b', 'a']]) {
        const result = compile(initial, { remove: { locationKeys } });
        assert.equal(result.result.status, 'updated', JSON.stringify(result.result));
        assert.deepEqual(result.domain.atlas.locations.map(l => l.key), ['r']);
        assert.deepEqual(result.domain.atlas.frames.map(f => f.id), ['atlas']);
    }
    const ocean = fresh('ocean');
    const result = compile(ocean, { remove: { featureIds: ['platform', 'platform-buildings'] } });
    assert.equal(result.result.status, 'updated');
    assert.ok(result.domain.atlas.features.some(f => f.id === 'sea'));
});

test('self-crossing contours are rejected and diagonal bands do not fill their bounding box', () => {
    const map = createEmptyMapDomain();
    const result = compile(map, { features: [{ id: 'bad', map: null, role: 'surface', material: 'grass', geometry: { shape: 'path', closed: true, points: [[0, 0], [100, 100], [0, 100], [80, 0], [100, 0]] } }] });
    assert.equal(result.result.status, 'failed'); assert.deepEqual(result.domain, map);
    const band = { shape: 'path', points: [[0, 0], [100, 100]], width: 10 };
    assert.equal(clippedGeometryBounds(band, { shape: 'rect', x: 0, y: 90, width: 10, height: 10 }), null);
    assert.ok(clippedGeometryBounds(band, { shape: 'rect', x: 25, y: 30, width: 2, height: 2 }));
});

test('directed route arrows follow authored endpoints, not the order of unrelated channel points', () => {
    const map = fresh('nature');
    const result = compile(map, {
        locations: [{ key: 'unlocated', name: 'Destination', position: { map: 'west', at: [350, 160] } }],
        features: [{ id: 'road', map: 'west', role: 'channel', material: 'stone', geometry: { shape: 'path', points: [[350, 160], [170, 160]], width: 10 } }],
        links: [{ from: 'station', to: 'unlocated', kind: 'road', bidirectional: false, feature: 'road' }],
    });
    assert.equal(result.result.status, 'updated');
    assert.equal(view(result.domain, 'west').routes[0].arrow, 'start');
    const noEndpoint = compile(result.domain, { locations: [{ key: 'unlocated', name: 'Destination', position: null }] });
    assert.deepEqual(view(noEndpoint.domain, 'west').routes, []);
    assert.ok(view(noEndpoint.domain, 'west').features.some(f => f.source.id === 'road'));
});

test('spatial edits use the actual maintenance staging and complete-run save boundary', async () => {
    const initial = fresh('desert'), harness = createMapKernelHarness(initial);
    await harness.map.refreshCurrent();
    const session = createMapMaintenanceSession(harness.map, { player }, 'manual');
    const read = await session.executeTool('MapAtlasRead', { mode: 'features' });
    const original = structuredClone(initial.atlas.features.find(f => f.id === 'oasis'));
    const oasis = read.data.features.find(f => f.id === 'oasis');
    const result = await session.executeTool('MapAtlasEdit', { features: [{ id: oasis.id, name: 'Oasis' }] });
    assert.equal(result.status, 'updated'); assert.equal(harness.state.writes.length, 0);
    await session.commit(() => true);
    assert.deepEqual(harness.state.persisted.partitions.map.atlas.features.find(f => f.id === oasis.id), { ...original, name: 'Oasis' });
    const saved = structuredClone(harness.state.persisted);
    const rebuild = createMapMaintenanceSession(harness.map, { player }, 'rebuild');
    const failed = await rebuild.executeTool('MapAtlasEdit', { ...ATLAS_EXAMPLES[0].input, maps: [{ map: 'west', mapping: { map: null, scale: 0, offset: [0, 0] } }] });
    assert.equal(failed.status, 'partial'); assert.equal(rebuild.canCommit(), false);
    await assert.rejects(rebuild.commit(() => true));
    assert.deepEqual(harness.state.persisted, saved);
});

// Constructed frozen-v1 inputs, not user samples. Exhaust the format's structural/limit boundaries first.
function oldMap() {
    return { schemaVersion: 1, revision: 7, atlas: { locations: [
        { key: 'region', name: 'Region', scale: 'region', status: 'visited', position: [MAX_MAP_COORDINATE, -MAX_MAP_COORDINATE], terrain: 'desert' },
        { key: 'building', name: 'Building', scale: 'building', status: 'visited', parent: 'region', position: [20, 30] },
        { key: 'room', name: 'Room', scale: 'room', status: 'visited', parent: 'building', position: [-5, 12], sceneKey: 'inside' },
        { key: 'unknown', name: 'Unknown', scale: 'outdoor', status: 'mentioned', parent: 'region' },
    ], links: [{ id: 'door', from: 'room', to: 'building', kind: 'door', bidirectional: true }], actors: [{ actorKey: 'player', displayName: 'Player', locationKey: 'room' }] }, scenes: { inside: { key: 'inside', name: 'Room', status: 'active', viewBox: [0, 0, 100, 100], elements: [{ id: 'player', category: 'actor', shape: 'icon', actorKey: 'player', geometry: { x: 20, y: 30 } }] } } };
}
test('v1 upgrades without reinterpreting local coordinates, Scene or visits; rereads are idempotent', () => {
    const old = oldMap(), original = structuredClone(old);
    parseV1(old);
    const current = readMapPartition(old);
    assert.deepEqual(current.scenes, old.scenes);
    assert.deepEqual(current.atlas.actors, old.atlas.actors);
    assert.deepEqual(current.atlas.links, old.atlas.links);
    assert.deepEqual(current.atlas.features, []);
    for (const location of old.atlas.locations) {
        const converted = current.atlas.locations.find(l => l.key === location.key);
        const { position, ...rest } = converted;
        const { position: previous, ...oldRest } = location;
        assert.deepEqual(rest, oldRest);
        if (previous) { assert.deepEqual(position, { frame: mapFrameId(location.parent), at: previous }); }
    }
    assert.equal(view(current, 'region').unlocated.find(l => l.location.key === 'room').reason, 'mapping_unknown');
    assert.deepEqual(readMapPartition(current), current);
    assert.deepEqual(old, original);
    assert.throws(() => parseMapDomain(old));
});

test('maximum old location/frame counts and near-limit serialized inputs still fit the new format', () => {
    const old = { schemaVersion: 1, revision: 0, atlas: { locations: [], links: [], actors: [] }, scenes: {} };
    for (let i = 0; i < 512; i++) { old.atlas.locations.push({ key: `p${i}`, name: '地'.repeat(120), scale: 'region', status: 'mentioned', ...(i ? { parent: `p${i - 1}` } : {}), position: [i, -i], brief: 'x'.repeat(500) }); }
    for (let i = 0; i < 1024; i++) {
        const link = { id: `l${i}`, from: `p${i % 512}`, to: `p${(i + 1) % 512}`, kind: 'road', bidirectional: true, label: 'x'.repeat(160) };
        old.atlas.links.push(link);
        if (new TextEncoder().encode(JSON.stringify(old)).length > V1_BYTES) { old.atlas.links.pop(); break; }
    }
    parseV1(old);
    const current = readMapPartition(old);
    assert.equal(current.atlas.locations.length, 512);
    assert.equal(current.atlas.frames.length, 512);
    assert.deepEqual(current.atlas.locations.map(l => l.position.at), old.atlas.locations.map(l => l.position));
    assert.doesNotThrow(() => parseMapDomain(current));
});

test('upgrade reads do not write; failed saves preserve the original v1 file', async () => {
    const old = oldMap(), harness = createMapKernelHarness(old);
    const { map } = await harness.map.refreshCurrent();
    assert.equal(harness.state.writes.length, 0);
    harness.state.replaceImpl = async () => ({ status: 'failed', error: { code: 'disk_full', message: 'disk_full', retryable: true } });
    const changed = compile(map, { locations: [{ key: 'unknown', name: 'Known name' }] });
    await assert.rejects(harness.map.replaceCurrent(changed.domain, { expectedRevision: map.revision }));
    assert.deepEqual(harness.state.persisted.partitions.map, old);
    harness.state.replaceImpl = null;
    await harness.map.replaceCurrent(changed.domain, { expectedRevision: map.revision });
    assert.deepEqual(readMapPartition(harness.state.persisted.partitions.map).scenes, old.scenes);
    assert.equal(harness.state.persisted.partitions.map.schemaVersion, 2);
});

for (const example of ATLAS_EXAMPLES) {
    test(`${example.id}: normal source read/edit/save and administrator paging use the same spatial contract`, async () => {
        const initial = fresh(example.id), harness = createMapKernelHarness(initial);
        await harness.map.refreshCurrent();
        const result = compile(initial, example.patch);
        assert.equal(result.result.status, 'updated');
        await harness.map.replaceCurrent(result.domain, { expectedRevision: initial.revision });
        const reopened = createMapKernelHarness(harness.state.persisted.partitions.map);
        await reopened.map.refreshCurrent();
        const management = await createMapManagement(reopened.map, () => player).open();
        const page = await management.execute('MapAtlasRead', { mode: 'features', limit: 2 }, () => true);
        const expected = readAtlas(reopened.map.readCurrent().map, { mode: 'features', limit: 2 }).data;
        assert.deepEqual(page.data, expected);
        const feature = expected.features[0];
        const all = [];
        let offset = 0;
        do {
            const next = await management.execute('MapAtlasRead', { mode: 'features', limit: 2, offset }, () => true);
            all.push(...next.data.features); offset = next.data.nextOffset;
        } while (offset !== null);
        assert.deepEqual(all, readAtlas(reopened.map.readCurrent().map, { mode: 'features', limit: 300 }).data.features);
        const edited = await management.execute('MapAtlasEdit', { features: [{ ...feature, material: 'stone' }] }, () => true);
        assert.equal(edited.ok, true);
        assert.equal(reopened.map.readCurrent().map.atlas.features.find(f => f.id === feature.id).material, 'stone');
        assert.equal(view(reopened.map.readCurrent().map).scope.locations.length, 2);
        assert.equal(view(reopened.map.readCurrent().map, 'west').scope.locations.length, 2);
    });
}

test('an unbounded region carries world supports as mask-only carriers', () => {
    const result = compile(createEmptyMapDomain(), {
        locations: [{ key: 'town', name: 'Town', scale: 'region' }],
        maps: [{ map: 'town', mapping: { map: null, scale: 2, offset: [100, 50] } }],
        features: [
            { id: 'plain', map: null, role: 'surface', material: 'grass', geometry: { shape: 'rect', x: 0, y: 0, width: 400, height: 300 } },
            { id: 'houses', map: 'town', role: 'structure', material: 'wood', form: 'compact', support: 'plain', geometry: { shape: 'rect', x: 10, y: 10, width: 40, height: 30 } },
        ],
    });
    assert.equal(result.result.status, 'updated', JSON.stringify(result.result));
    const town = view(result.domain, 'town');
    assert.equal(town.clip, undefined);
    assert.deepEqual(town.features.map(f => f.source.id), ['houses']);
    assert.deepEqual(town.carriers.map(f => f.source.id), ['plain']);
    const plain = town.carriers[0];
    assert.deepEqual([plain.geometry.x, plain.geometry.y, plain.geometry.width, plain.geometry.height], [-50, -25, 200, 150]);
    assert.deepEqual(view(result.domain).carriers, []);
});
