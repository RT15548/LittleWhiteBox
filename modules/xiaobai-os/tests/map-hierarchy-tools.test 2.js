import assert from 'node:assert/strict';
import test from 'node:test';
import { compileAtlasIntent } from '../apps/map/tools/atlas-intent-compiler.js';
import { compileSceneIntent } from '../apps/map/tools/scene-intent-compiler.js';
import { readAtlas } from '../apps/map/tools/atlas-reader.js';
import { mapBrowseScope } from '../apps/map/ui/map-browse.js';
import { validateMapDomain } from '../domains/map/invariants.js';
import { createEmptyMapDomain } from '../domains/map/state.js';
import { locationRegion } from '../domains/map/hierarchy.js';
import { mapAtlasFixture } from './fixtures/map-atlas.js';

const player = { actorKey: 'player', displayName: 'Alice' };
const floor = { id: 'floor', cat: 'terrain', shape: 'rect', geo: { center: [80, 60], size: [160, 120] } };

// Protect ownership at the model-write boundary without invalidating readable, current-format data.
test('Scene edits require an existing concrete place with a region and never create orphan places', () => {
    const domain = mapAtlasFixture([
        { key: 'orphan', parent: undefined },
        { key: 'world', scale: 'world', parent: undefined },
    ]);
    for (const [scene, reason] of [
        ['missing', 'scene_location_required'],
        ['world', 'scene_location_required'],
        ['fixture-region', 'scene_location_required'],
        ['orphan', 'location_region_required'],
    ]) {
        const result = compileSceneIntent(domain, { scene, elements: [floor] }, player);
        assert.equal(result.result.status, 'failed');
        assert.equal(result.result.skipped[0].reason, reason);
        assert.equal(result.domain, domain);
        assert.deepEqual(result.edits, []);
    }
});

test('Atlas rejects new unassigned places and edits that orphan assigned descendants', () => {
    const domain = mapAtlasFixture([{ key: 'inn', scale: 'building' }, { key: 'room', parent: 'inn' }]);
    for (const location of [
        { key: 'missing', name: 'Missing' },
        { key: 'inn', name: 'Inn', parent: null },
        { key: 'fixture-region', name: 'World', scale: 'world' },
    ]) {
        const result = compileAtlasIntent(domain, { locations: [location] }, player);
        assert.equal(result.result.status, 'failed');
        assert.equal(result.result.skipped[0].reason, 'location_region_required');
        assert.equal(result.domain, domain);
        assert.deepEqual(result.edits, []);
    }
});

test('same-call hierarchy is order-independent and creates browsable scenes', () => {
    const result = compileAtlasIntent(createEmptyMapDomain(), {
        locations: [
            { key: 'room', name: 'Room', parent: 'inn' },
            { key: 'inn', name: 'Inn', scale: 'building', parent: 'town' },
            { key: 'town', name: 'Town', scale: 'region' },
            { key: 'mountains', name: 'Mountains', scale: 'region' },
        ],
    }, player);
    assert.equal(result.result.status, 'updated');
    const drawn = compileSceneIntent(result.domain, { scene: 'room', elements: [floor], playerHere: true }, player);
    assert.equal(drawn.result.status, 'updated');
    validateMapDomain(drawn.domain);
    const world = mapBrowseScope(drawn.domain.atlas, null);
    const region = mapBrowseScope(drawn.domain.atlas, 'town');
    assert.deepEqual(world.locations.map(item => item.key), ['town', 'mountains']);
    assert.equal(world.unvisited, 1);
    const visited = readAtlas(drawn.domain, { mode: 'locations', status: 'visited' }).data.locations;
    assert.deepEqual(new Set(visited.map(item => item.key)), new Set(['town', 'inn', 'room']));
    assert.ok(visited.every(item => item.status === 'visited'));
    assert.deepEqual(new Set(region.locations.map(item => item.key)), new Set(['inn', 'room']));
    assert.equal(locationRegion(drawn.domain.atlas, 'room').key, 'town');
    assert.equal(drawn.domain.atlas.locations.find(item => item.key === 'room').sceneKey, 'room');
});

test('existing unassigned places are readable and repair preserves scene, visits, position and actor facts', () => {
    const located = mapAtlasFixture([{ key: 'inn', scale: 'building', position: [100, 200] }, { key: 'room', parent: 'inn' }]);
    const { domain } = compileSceneIntent(located, { scene: 'room', elements: [floor], playerHere: true }, player);
    delete domain.atlas.locations.find(item => item.key === 'inn').parent;
    domain.atlas.locations.push({ key: 'unrelated', name: 'Unrelated', scale: 'outdoor', status: 'mentioned' });
    validateMapDomain(domain);
    const original = structuredClone(domain);
    const reclassified = compileAtlasIntent(domain, { locations: [{ key: 'room', name: 'room', scale: 'region' }] }, player);
    assert.equal(reclassified.result.status, 'failed');
    assert.equal(reclassified.result.skipped[0].reason, 'scene_location_required');
    assert.equal(reclassified.domain, domain);
    assert.equal(readAtlas(domain, {}).data.counts.needsRegion, 3);
    const document = readAtlas(domain, { mode: 'document' }).data.atlas;
    assert.deepEqual(document.locations.filter(item => item.needsRegion).map(item => item.key), ['inn', 'room', 'unrelated']);
    const first = readAtlas(domain, { mode: 'locations', needsRegion: true, limit: 2 }).data;
    assert.equal(first.count, 3);
    assert.equal(first.nextOffset, 2);
    assert.deepEqual(first.locations.map(item => item.key), ['inn', 'room']);
    assert.deepEqual(readAtlas(domain, { mode: 'locations', needsRegion: true, offset: 2 }).data.locations.map(item => item.key), ['unrelated']);
    assert.deepEqual(domain, original);

    // The child appears first and references an existing parent whose ownership is repaired in this call.
    const repaired = compileAtlasIntent(domain, { locations: [
        { key: 'room', name: 'room' },
        { key: 'inn', name: 'inn', parent: 'fixture-region' },
    ] }, player);
    assert.equal(repaired.result.status, 'updated');
    const expected = structuredClone(original);
    expected.atlas.locations.find(item => item.key === 'inn').parent = 'fixture-region';
    assert.deepEqual(repaired.domain, expected);
    assert.equal(readAtlas(repaired.domain, {}).data.counts.needsRegion, 1);
    assert.deepEqual(readAtlas(repaired.domain, { mode: 'locations', needsRegion: true }).data.locations.map(item => item.key), ['unrelated']);
    assert.deepEqual(readAtlas(repaired.domain, { mode: 'locations', needsRegion: false }).data.locations.map(item => item.key), ['fixture-region', 'inn', 'room']);
    assert.throws(() => readAtlas(domain, { mode: 'locations', needsRegion: 'true' }), TypeError);
});

test('regions may be detached from a world without detaching their places', () => {
    const domain = mapAtlasFixture([{ key: 'inn' }]);
    domain.atlas.locations.unshift({ key: 'world', name: 'World', scale: 'world', status: 'mentioned' });
    domain.atlas.locations.find(item => item.key === 'fixture-region').parent = 'world';
    const result = compileAtlasIntent(domain, { locations: [{ key: 'fixture-region', name: 'Fixture Region', parent: null }] }, player);
    assert.equal(result.result.status, 'updated');
    assert.equal(result.domain.atlas.locations.find(item => item.key === 'fixture-region').parent, undefined);
    assert.equal(locationRegion(result.domain.atlas, 'inn').key, 'fixture-region');
});

// These operations have valid final hierarchies but cannot be validated one ancestor at a time.
test('same-call scale corrections are order-independent and preserve scene, actor and geography facts', () => {
    const { domain } = compileSceneIntent(mapAtlasFixture([
        { key: 'city', scale: 'city', position: [100, 200], terrain: 'urban' },
        { key: 'room', parent: 'city' },
    ]), { scene: 'room', elements: [floor], playerHere: true }, player);
    const original = structuredClone(domain);
    const changes = [
        { key: 'fixture-region', name: 'Fixture Region', scale: 'world' },
        { key: 'city', name: 'city', scale: 'region' },
    ];
    const expected = structuredClone(domain);
    expected.atlas.locations.find(location => location.key === 'fixture-region').scale = 'world';
    expected.atlas.locations.find(location => location.key === 'city').scale = 'region';
    for (const locations of [changes, [...changes].reverse()]) {
        const result = compileAtlasIntent(domain, { locations }, player);
        assert.equal(result.result.status, 'updated');
        assert.deepEqual(result.result.skipped, []);
        assert.deepEqual(result.domain, expected);
        assert.deepEqual(domain, original);
        assert.equal(locationRegion(result.domain.atlas, 'room').key, 'city');
        assert.equal(compileAtlasIntent(result.domain, { locations }, player).result.status, 'unchanged');
        validateMapDomain(result.domain);
    }
});

test('same-call reparenting joins old and new ancestry through untouched locations', () => {
    const domain = mapAtlasFixture([{ key: 'inn', scale: 'building' }, { key: 'room', parent: 'inn' }]);
    const changes = [
        { key: 'fixture-region', name: 'Fixture Region', parent: 'room' },
        { key: 'room', name: 'room', scale: 'region', parent: null },
    ];
    for (const locations of [changes, [...changes].reverse()]) {
        const result = compileAtlasIntent(domain, { locations }, player);
        assert.equal(result.result.status, 'updated');
        validateMapDomain(result.domain);
        assert.equal(result.domain.atlas.locations.find(location => location.key === 'fixture-region').parent, 'room');
        assert.equal(result.domain.atlas.locations.find(location => location.key === 'room').parent, undefined);
        assert.deepEqual(result.domain.atlas.locations.find(location => location.key === 'inn'), domain.atlas.locations.find(location => location.key === 'inn'));
    }
});

test('invalid related corrections roll back together while independent siblings still succeed', () => {
    const domain = mapAtlasFixture([{ key: 'city', scale: 'city' }, { key: 'room', parent: 'city' }]);
    domain.atlas.locations.unshift({ key: 'world', name: 'World', scale: 'world', status: 'mentioned' });
    domain.atlas.locations.find(location => location.key === 'fixture-region').parent = 'world';
    domain.atlas.locations.push({ key: 'independent', name: 'Independent', scale: 'region', status: 'mentioned', parent: 'world' });
    const original = structuredClone(domain);
    const expected = structuredClone(domain);
    expected.atlas.locations.find(location => location.key === 'independent').name = 'Corrected';
    for (const child of [
        { scale: 'city' }, // Leaves concrete descendants without any region.
        { scale: 'region', parent: 'missing' },
        { scale: 'region', parent: 'room' }, // Final cycle, not merely a transient one.
        { scale: 'region', position: [NaN, 0] },
        { scale: 'region', title: 'Unsupported' },
    ]) {
        const changes = [
            { key: 'fixture-region', name: 'Fixture Region', scale: 'world' },
            { key: 'city', name: 'city', ...child },
        ];
        for (const related of [changes, [...changes].reverse()]) {
            const result = compileAtlasIntent(domain, { locations: [...related, { key: 'independent', name: 'Corrected' }] }, player);
            assert.equal(result.result.status, 'partial');
            assert.deepEqual(new Set(result.result.skipped.map(item => item.id)), new Set(['fixture-region', 'city']));
            assert.deepEqual(result.result.applied.map(item => item.id), ['independent']);
            assert.deepEqual(result.domain, expected);
            assert.deepEqual(domain, original);
            validateMapDomain(result.domain);
        }
    }
});

test('a related scale correction cannot transfer scene ownership to a region', () => {
    const { domain } = compileSceneIntent(mapAtlasFixture([{ key: 'room' }]), { scene: 'room', elements: [floor] }, player);
    const result = compileAtlasIntent(domain, { locations: [
        { key: 'fixture-region', name: 'Fixture Region', scale: 'world' },
        { key: 'room', name: 'room', scale: 'region' },
    ] }, player);
    assert.equal(result.result.status, 'failed');
    assert.ok(result.result.skipped.every(item => item.reason === 'scene_location_required'));
    assert.equal(result.domain, domain);
    assert.deepEqual(result.edits, []);
});

test('location reports distinguish unchanged members of a successful related group', () => {
    const domain = mapAtlasFixture([{ key: 'room' }]);
    const result = compileAtlasIntent(domain, { locations: [
        { key: 'fixture-region', name: 'Renamed Region' },
        { key: 'room', name: 'room' },
    ] }, player);
    assert.equal(result.result.status, 'updated');
    assert.deepEqual(result.result.applied.map(({ id, changed }) => ({ id, changed })), [
        { id: 'fixture-region', changed: true },
        { id: 'room', changed: false },
    ]);
});
