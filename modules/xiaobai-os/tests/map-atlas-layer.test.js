import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyMapDomain } from '../domains/map/state.js';
import { validateMapDomain } from '../domains/map/invariants.js';
import { compileAtlasIntent } from '../apps/map/tools/atlas-intent-compiler.js';
import { readAtlas } from '../apps/map/tools/atlas-reader.js';
import { buildMapAtlasDataMessage } from '../apps/map/tools/atlas-data-message.js';
import { mapBrowseScope, projectAtlas } from '../domains/map/space/projection.js';
import { atlasBaseCoverage, atlasBaseGaps } from '../domains/map/space/coverage.js';
import { atlasClipPlan } from '../domains/map/space/composition.js';
import { pointInGeometry } from '../domains/map/space/geometry.js';
import { atlasShapeKey, atlasDetailPlan } from '../apps/map/ui/atlas/gpu-content.js';

const box = (x, y, width, height) => ({ shape: 'rect', x, y, width, height });
const player = { actorKey: 'player', displayName: 'Player' };
const edit = (domain, input) => {
    const result = compileAtlasIntent(domain, input, player);
    assert.equal(result.result.ok, true, JSON.stringify(result.result)); return result;
};
const view = (domain, key = null) => projectAtlas(domain.atlas, mapBrowseScope(domain.atlas, key));
function example() {
    return edit(createEmptyMapDomain(), {
        locations: [
            { key: 'town', name: 'Town', scale: 'region', position: { map: null, at: [50, 50] } },
            { key: 'next', name: 'Next', scale: 'region' },
            { key: 'house', name: 'House', parent: 'town', position: { map: 'town', at: [30, 40] } },
        ],
        maps: ['town', 'next'].map(map => ({ map, mapping: { map: null, scale: 1, offset: [0, 0] } })),
        features: [
            { id: 'land', map: null, role: 'surface', material: 'grass', geometry: box(0, 0, 200, 200) },
            { id: 'homes', map: 'town', role: 'structure', material: 'stone', support: 'land', geometry: box(20, 20, 60, 60), form: 'blocks' },
            { id: 'neighbor', map: 'next', role: 'cover', material: 'forest', geometry: box(20, 20, 60, 60) },
        ],
    }).domain;
}
// Coordinate paths once made hidden local details enlarge/draw on the world map.
test('scope follows ownership through reframing, destination links and nested places, never coordinate expression', () => {
    const map = example(), world = view(map);
    const far = edit(map, { features: [{ id: 'homes', geometry: box(9000, 9000, 60, 60) }] }).domain;
    assert.deepEqual(view(far).viewBox, world.viewBox);
    assert.deepEqual(world.features.map(f => f.source.id), ['land']);
    const reframed = edit(map, { features: [{ id: 'homes', reframe: null }] }).domain;
    assert.deepEqual(view(reframed, 'town').features.map(f => f.source.id), ['homes']);
    assert.deepEqual(view(reframed).features, world.features);
    const linked = edit(reframed, { features: [{ id: 'linked', map: null, role: 'structure', material: 'tile', destination: 'house', geometry: box(20, 30, 10, 10) }] }).domain;
    assert.deepEqual(view(linked).features.map(f => f.source.id), ['land']);
    assert.ok(view(linked, 'town').features.some(f => f.source.id === 'linked'));
    assert.ok(!view(linked, 'town').features.some(f => f.source.id === 'neighbor'));
    assert.deepEqual(view(linked, 'missing').features, []);
});
test('unknown-region destination footprints do not become global geography', () => {
    const map = example();
    map.atlas.locations.push({ key: 'lost', name: 'Lost', scale: 'building', status: 'mentioned' });
    map.atlas.features.push({ id: 'lost-building', frame: 'atlas', destination: 'lost', role: 'structure', material: 'wood', geometry: box(1, 1, 10, 10) });
    validateMapDomain(map);
    assert.ok(!view(map).features.some(f => f.source.id === 'lost-building'));
});
// The no-boundary support bug is a mask-expression contract, not an SVG implementation test.
test('a boundary-free region retains hidden support geometry without painting its world or neighbors', () => {
    const map = example(), region = view(map, 'town'), original = structuredClone(map);
    assert.deepEqual(region.features.map(f => f.source.id), ['homes']);
    assert.deepEqual(region.carriers.map(f => f.source.id), ['land']);
    const mask = atlasClipPlan(region.features[0], [...region.features, ...region.carriers]);
    assert.ok(mask.intersections.every(g => pointInGeometry([30, 40], g)));
    assert.equal(mask.exclusions.length, 0);
    assert.deepEqual(map, original);
});
test('a mapped boundary admits one global river and exposes only a regional outline to the world', () => {
    const map = edit(example(), { maps: [{ map: 'town', boundary: 'edge' }], features: [
        { id: 'edge', map: 'town', role: 'boundary', material: 'unknown', geometry: box(0, 0, 100, 100) },
        { id: 'river', map: null, role: 'channel', material: 'water', support: 'land', geometry: { shape: 'path', points: [[0, 50], [200, 50]], width: 10 } },
        { id: 'bridge', map: 'town', role: 'structure', material: 'wood', support: 'land', crosses: ['river'], geometry: box(35, 35, 10, 30) },
    ] }).domain;
    const world = view(map), region = view(map, 'town'), pool = [...region.features, ...region.carriers];
    assert.equal(world.regions.length, 1);
    assert.equal(world.regions[0].location.key, 'town');
    assert.ok(!world.features.some(f => ['homes', 'edge', 'bridge'].includes(f.source.id)));
    assert.ok(region.features.some(f => f.source.id === 'river'));
    assert.equal(map.atlas.features.filter(f => f.id === 'river').length, 1);
    assert.ok(atlasClipPlan(region.features.find(f => f.source.id === 'homes'), pool).exclusions.some(f => f.source.id === 'river'));
    assert.ok(!atlasClipPlan(region.features.find(f => f.source.id === 'bridge'), pool).exclusions.some(f => f.source.id === 'river'));
});
test('coverage reports visible bases and uncovered located entrances consistently without persisting completion', () => {
    const map = example(), original = structuredClone(map);
    assert.deepEqual(atlasBaseCoverage(map.atlas, null), { hasBase: true, uncoveredLocationKeys: [] });
    assert.deepEqual(atlasBaseCoverage(map.atlas, 'town'), { hasBase: false, uncoveredLocationKeys: ['house'] });
    const result = edit(map, { features: [{ id: 'local-land', map: 'town', role: 'surface', material: 'grass', geometry: box(0, 0, 100, 100) }] });
    assert.deepEqual(atlasBaseCoverage(result.domain.atlas, 'town'), { hasBase: true, uncoveredLocationKeys: [] });
    assert.deepEqual(result.result.data.baseGaps, atlasBaseGaps(result.domain.atlas));
    const summary = readAtlas(result.domain, { mode: 'summary' }).data;
    assert.equal(summary.counts.needsBase, result.result.data.baseGaps.length);
    const document = readAtlas(result.domain, { mode: 'document' }).data;
    assert.deepEqual(document.atlas.maps.find(m => m.map === 'town').baseCoverage, atlasBaseCoverage(result.domain.atlas, 'town'));
    const message = buildMapAtlasDataMessage(result.domain);
    // Decode the actual injected document rather than asserting prompt prose.
    const payload = JSON.parse(message.slice(message.indexOf('{'), message.lastIndexOf('}') + 1));
    assert.deepEqual(payload.atlas.maps, document.atlas.maps);
    assert.deepEqual(map, original);
});
test('renaming and moving actors preserve geometry and source-stable detail plans', () => {
    const map = example(), initial = view(map, 'town').features[0];
    const next = edit(map, { features: [{ id: 'homes', name: 'Another label' }], actors: [{ actorKey: 'player', locationKey: 'house' }] }).domain;
    const updated = view(next, 'town').features[0];
    assert.equal(atlasShapeKey(initial), atlasShapeKey(updated));
    assert.deepEqual(atlasDetailPlan(initial, [0, 0, 100, 100], .1, 80, 100), atlasDetailPlan(updated, [0, 0, 100, 100], .1, 80, 100));
});
test('a river alone does not count as the main geographic base', () => {
    const map = edit(createEmptyMapDomain(), { features: [{ id: 'river', map: null, role: 'channel', material: 'water', geometry: { shape: 'path', points: [[0, 50], [200, 50]], width: 20 } }] }).domain;
    assert.equal(atlasBaseCoverage(map.atlas, null).hasBase, false);
});
test('a bridge crossing survives water exclusions inherited from its carrier', () => {
    const map = edit(example(), { features: [
        { id: 'river', map: null, role: 'channel', material: 'water', geometry: { shape: 'path', points: [[0, 50], [200, 50]], width: 10 } },
        { id: 'bridge', map: 'town', role: 'structure', material: 'wood', support: 'land', crosses: ['river'], geometry: box(35, 35, 10, 30) },
    ] }).domain;
    const region = view(map, 'town'), pool = [...region.features, ...region.carriers];
    const mask = atlasClipPlan(region.features.find(f => f.source.id === 'bridge'), pool);
    assert.ok(mask.intersections.every(g => pointInGeometry([40, 50], g)));
    assert.ok(!mask.exclusions.some(f => pointInGeometry([40, 50], f.geometry)));
});
test('a crowded view retains finite source-stable decoration across the coordinate origin', () => {
    const feature = { source: { id: 'forest', frame: 'atlas', role: 'cover', form: 'forest', material: 'forest', geometry: box(-100, -100, 200, 200) }, mapping: { frame: 'atlas', scale: 1, offset: [0, 0] } };
    const plan = atlasDetailPlan(feature, [-100, -100, 200, 200], .01, 4, 16);
    assert.ok(plan.samples.length > 0 && plan.samples.length <= 4);
    assert.ok(plan.samples.every(s => Number.isFinite(s.x) && Number.isFinite(s.y)));
});
test('very long thin relief stays within the visible mesh budget', () => {
    const feature = { source: { id: 'ridge', frame: 'atlas', role: 'relief', form: 'ridge', material: 'rock', geometry: box(0, 0, 10000, 1) }, mapping: { frame: 'atlas', scale: 1, offset: [0, 0] } };
    const plan = atlasDetailPlan(feature, [0, 0, 10000, 1], .01, 30, 160);
    assert.ok((plan.grid[2] - plan.grid[0]) * (plan.grid[3] - plan.grid[1]) <= 160);
});
test('a concrete building footprint does not invent a settlement without an explicit grouped form', () => {
    const map = edit(example(), { features: [{ id: 'homes', form: null, destination: 'house' }] }).domain;
    const feature = view(map, 'town').features.find(f => f.source.id === 'homes');
    assert.deepEqual(atlasDetailPlan(feature, [0, 0, 100, 100], .1, 80, 100).samples, []);
    const grouped = edit(map, { features: [{ id: 'homes', form: 'blocks' }] }).domain;
    assert.ok(atlasDetailPlan(view(grouped, 'town').features.find(f => f.source.id === 'homes'), [0, 0, 100, 100], .1, 80, 100).samples.length > 0);
});
test('overlapping forests and hidden same-material carriers do not remove the visible base', () => {
    const map = edit(example(), { features: [
        { id: 'trees-a', map: 'town', role: 'cover', material: 'forest', geometry: box(0, 0, 60, 60) },
        { id: 'trees-b', map: 'town', role: 'cover', material: 'forest', geometry: box(30, 0, 60, 60) },
        { id: 'local-land', map: 'town', role: 'surface', material: 'grass', geometry: box(0, 0, 100, 100) },
    ] }).domain;
    const region = view(map, 'town'), a = region.features.find(f => f.source.id === 'trees-a'), b = region.features.find(f => f.source.id === 'trees-b');
    const pool = [...region.features, ...region.carriers];
    assert.ok(!atlasClipPlan(a, pool).exclusions.some(f => f.source.id === b.source.id));
    assert.ok(!atlasClipPlan(b, pool).exclusions.some(f => f.source.id === a.source.id));
    const land = region.features.find(f => f.source.id === 'local-land');
    assert.ok(!atlasClipPlan(land, [...region.features, ...region.carriers]).exclusions.some(f => f.source.id === 'land'));
});
