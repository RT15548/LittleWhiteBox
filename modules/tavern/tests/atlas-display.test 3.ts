import test from 'node:test';
import assert from 'node:assert/strict';

import { layoutTavernAtlasDocument } from '../app-src/atlas-display';
import type { TavernAtlasDocument } from '../shared/structured-state';

function doc(locations: TavernAtlasDocument['locations'], links: TavernAtlasDocument['links'] = []): TavernAtlasDocument {
    return {
        version: 1,
        locations,
        links,
        actors: [],
    };
}

test('layoutTavernAtlasDocument handles empty, single root, and stable sibling order', () => {
    const empty = layoutTavernAtlasDocument(doc([]));
    assert.equal(empty.nodes.length, 0);
    assert.deepEqual(empty.viewBox, [0, 0, 640, 360]);

    const single = layoutTavernAtlasDocument(doc([
        { key: 'office', name: '办公室', scale: 'room', status: 'visited' },
    ]));
    assert.equal(single.nodes.length, 1);
    assert.equal(single.nodes[0].key, 'office');

    const first = layoutTavernAtlasDocument(doc([
        { key: 'b', name: 'B', scale: 'room', status: 'visited', parent: 'root' },
        { key: 'root', name: 'Root', scale: 'building', status: 'visited' },
        { key: 'a', name: 'A', scale: 'room', status: 'mentioned', parent: 'root' },
    ]));
    const second = layoutTavernAtlasDocument(doc([
        { key: 'a', name: 'A', scale: 'room', status: 'visited', parent: 'root' },
        { key: 'root', name: 'Root', scale: 'building', status: 'visited' },
        { key: 'b', name: 'B', scale: 'room', status: 'visited', parent: 'root' },
    ]));
    assert.deepEqual(
        first.nodes.map((node) => [node.key, node.x, node.y]),
        second.nodes.map((node) => [node.key, node.x, node.y]),
    );
    assert.equal(first.nodes.find((node) => node.key === 'root')?.depth, 0);
    assert.equal(first.nodes.find((node) => node.key === 'a')?.depth, 1);
});

test('layoutTavernAtlasDocument defends against dangling parent, cycles, and dangling links', () => {
    const danglingParent = layoutTavernAtlasDocument(doc([
        { key: 'office', name: '办公室', scale: 'room', status: 'visited', parent: 'missing' },
    ]));
    assert.equal(danglingParent.nodes.length, 1);
    assert.equal(danglingParent.warnings.includes('atlas_parent_missing:office'), true);

    const cycle = layoutTavernAtlasDocument(doc([
        { key: 'a', name: 'A', scale: 'room', status: 'visited', parent: 'b' },
        { key: 'b', name: 'B', scale: 'room', status: 'visited', parent: 'a' },
    ]));
    assert.equal(cycle.nodes.length, 2);
    assert.equal(cycle.warnings.includes('atlas_parent_cycle'), true);

    const linkSkip = layoutTavernAtlasDocument(doc([
        { key: 'office', name: '办公室', scale: 'room', status: 'visited' },
    ], [
        { id: 'bad', from: 'office', to: 'missing', kind: 'door', bidirectional: true },
    ]));
    assert.equal(linkSkip.links.length, 0);
    assert.equal(linkSkip.warnings.includes('atlas_link_endpoint_missing:bad'), true);
});

test('layoutTavernAtlasDocument keeps mentioned-location roads visible as separate lanes', () => {
    const layout = layoutTavernAtlasDocument(doc([
        { key: 'tavern', name: '小酒馆', scale: 'building', status: 'visited', mapDocId: 'main' },
        { key: 'test_blue_creek_canyon', name: '蓝溪峡谷', scale: 'outdoor', status: 'visited', mapDocId: 'test_complex_terrain' },
        { key: 'north_mountain', name: '北山', scale: 'outdoor', status: 'mentioned' },
        { key: 'east_forest', name: '东林', scale: 'outdoor', status: 'mentioned' },
        { key: 'lake_temple', name: '湖畔祠堂', scale: 'building', status: 'mentioned' },
        { key: 'old_ruins', name: '旧遗迹', scale: 'building', status: 'mentioned' },
        { key: 'river_city', name: '河湾城', scale: 'city', status: 'mentioned' },
    ], [
        { id: 'link:tavern:test_blue_creek_canyon:road', from: 'tavern', to: 'test_blue_creek_canyon', kind: 'road', label: '城外道路', bidirectional: true },
        { id: 'link:test_blue_creek_canyon:north_mountain:road', from: 'test_blue_creek_canyon', to: 'north_mountain', kind: 'road', label: '北山道', bidirectional: true },
        { id: 'link:test_blue_creek_canyon:east_forest:path', from: 'test_blue_creek_canyon', to: 'east_forest', kind: 'path', label: '林间小径', bidirectional: true },
        { id: 'link:east_forest:lake_temple:path', from: 'east_forest', to: 'lake_temple', kind: 'path', label: '林湖小径', bidirectional: true },
        { id: 'link:north_mountain:old_ruins:path', from: 'north_mountain', to: 'old_ruins', kind: 'path', label: '山中古道', bidirectional: true },
        { id: 'link:river_city:lake_temple:road', from: 'river_city', to: 'lake_temple', kind: 'road', label: '湖畔大路', bidirectional: true },
    ]));

    assert.equal(layout.links.length, 6);
    assert.equal(layout.warnings.length, 0);
    assert.deepEqual(
        layout.links.map((link) => link.id).sort(),
        [
            'link:east_forest:lake_temple:path',
            'link:north_mountain:old_ruins:path',
            'link:river_city:lake_temple:road',
            'link:tavern:test_blue_creek_canyon:road',
            'link:test_blue_creek_canyon:east_forest:path',
            'link:test_blue_creek_canyon:north_mountain:road',
        ],
    );
    assert.equal(new Set(layout.links.map((link) => link.path)).size, 6);
    assert.ok(new Set(layout.links.map((link) => link.labelY)).size > 1);
    assert.ok(layout.viewBox[1] < -48);
});
