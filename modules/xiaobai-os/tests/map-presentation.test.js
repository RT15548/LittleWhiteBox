import assert from 'node:assert/strict';
import test from 'node:test';

import {
    elementPresentation,
} from '../apps/map/ui/map-presentation.js';
import { sceneElementPath } from '../apps/map/ui/scene-geometry.js';

import { layoutWorldMap, locationInScope, connectedPlaces } from '../apps/map/ui/world-map.js';

function atlas(locations, links) {
    return {
        locations,
        links,
        actors: [],
    };
}

test('world layout preserves authored geography and gives unpositioned destinations a read-only layout', () => {
    const locations = [
        { key: 'town', name: 'Town', scale: 'city', status: 'mentioned' },
        { key: 'home', name: 'Home', scale: 'building', status: 'visited', parent: 'town', position: [200, 650] },
        { key: 'forest', name: 'Forest', scale: 'outdoor', status: 'mentioned', parent: 'town', position: [500, 100] },
        { key: 'lake', name: 'Lake', scale: 'outdoor', status: 'mentioned', parent: 'town' },
        { key: 'room', name: 'Room', scale: 'room', status: 'visited', parent: 'home' },
    ];
    const links = [{ id: 'trail', from: 'room', to: 'forest', kind: 'path', bidirectional: false }];
    const world = atlas(locations, links);
    const original = structuredClone(world);
    const scope = { locations: locations.filter(place => place.parent === 'town'), positionParent: 'town' };
    const layout = layoutWorldMap(world, scope);
    assert.deepEqual(layoutWorldMap(atlas([...locations].reverse(), links), { ...scope, locations: [...scope.locations].reverse() }), layout);
    assert.deepEqual(world, original);
    assert.deepEqual(layout.nodes.map(node => node.location.key), ['forest', 'home', 'lake']);
    assert.equal(layout.nodes.find(node => node.location.key === 'forest').y, 100);
    assert.equal(layout.nodes.find(node => node.location.key === 'home').x, 200);
    for (const node of layout.nodes.filter(item => !item.placed)) {
        assert.ok(layout.nodes.every(other => other === node || Math.hypot(other.x - node.x, other.y - node.y) >= 160));
    }
    assert.equal(locationInScope(world, 'room', scope.locations), 'home');
    assert.equal(layout.routes[0].from.location.key, 'home');
    assert.equal(layout.routes[0].to.location.key, 'forest');
    assert.equal(layout.routes[0].link.bidirectional, false);
    assert.equal(connectedPlaces(world, 'forest')[0].outgoing, false);
    assert.equal(connectedPlaces(world, 'room')[0].outgoing, true);
});

test('Scene paths close area semantics while routes remain open and curves stay smooth', () => {
    const geometry = { points: [[0, 0], [20, 0], [20, 20]] };
    const terrain = { id: 'yard', category: 'terrain', shape: 'path', geometry };
    const road = { id: 'road', category: 'road', shape: 'path', geometry };
    const river = { id: 'river', category: 'water', shape: 'curve', geometry };

    assert.equal(sceneElementPath(terrain), 'M 0 0 L 20 0 L 20 20 Z');
    assert.equal(sceneElementPath(road), 'M 0 0 L 20 0 L 20 20');
    assert.match(sceneElementPath(river), /^M 0 0 C .+ Z$/);
});

test('Element presentation resolves closed semantic recipes without accepting arbitrary styling', () => {
    const presentation = elementPresentation({
        id: 'exit',
        category: 'door',
        shape: 'icon',
        geometry: { x: 12, y: 8 },
        kind: 'door',
        material: 'wood',
        certainty: 'inferred',
    }, 'scene-one');

    assert.equal(presentation.icon, 'door_open');
    assert.equal(presentation.fallback, 'D');
    assert.equal(presentation.fill, 'none');
    assert.equal(presentation.dash, '8 6');
    assert.equal(presentation.opacity, 0.72);
});
