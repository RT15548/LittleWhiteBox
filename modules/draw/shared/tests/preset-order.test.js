import test from 'node:test';
import assert from 'node:assert/strict';

import { movePresetId, pickNeighborAfterRemoval, reorderPresetsByIds } from '../preset-order.js';

const presets = ids => ids.map(id => ({ id, name: `n-${id}` }));

test('movePresetId swaps with the neighbour and stops at both ends', () => {
    assert.deepEqual(movePresetId(['a', 'b', 'c'], 'b', -1), ['b', 'a', 'c']);
    assert.deepEqual(movePresetId(['a', 'b', 'c'], 'b', 1), ['a', 'c', 'b']);
    assert.deepEqual(movePresetId(['a', 'b', 'c'], 'a', -1), ['a', 'b', 'c']);
    assert.deepEqual(movePresetId(['a', 'b', 'c'], 'c', 1), ['a', 'b', 'c']);
    assert.deepEqual(movePresetId(['a', 'b'], 'zzz', 1), ['a', 'b']);
});

test('movePresetId never mutates its input', () => {
    const ids = ['a', 'b', 'c'];
    movePresetId(ids, 'a', 1);
    assert.deepEqual(ids, ['a', 'b', 'c']);
});

test('reorderPresetsByIds follows the given order and keeps the preset objects', () => {
    const list = presets(['a', 'b', 'c']);
    const result = reorderPresetsByIds(list, ['c', 'a', 'b']);
    assert.deepEqual(result.map(p => p.id), ['c', 'a', 'b']);
    assert.equal(result[0], list[2]);
});

test('reorderPresetsByIds cannot add, drop or duplicate presets', () => {
    const list = presets(['a', 'b', 'c']);
    assert.deepEqual(reorderPresetsByIds(list, ['c', 'ghost', 'c']).map(p => p.id), ['c', 'a', 'b'], 'unknown ids ignored, listed once, the rest keep their order');
    assert.deepEqual(reorderPresetsByIds(list, []).map(p => p.id), ['a', 'b', 'c']);
    assert.deepEqual(reorderPresetsByIds(list, undefined).map(p => p.id), ['a', 'b', 'c']);
    assert.deepEqual(reorderPresetsByIds(undefined, ['a']), []);
});

test('pickNeighborAfterRemoval selects the preset that takes the removed one\'s place', () => {
    assert.equal(pickNeighborAfterRemoval(['a', 'b', 'c'], 'a'), 'b');
    assert.equal(pickNeighborAfterRemoval(['a', 'b', 'c'], 'b'), 'c');
    assert.equal(pickNeighborAfterRemoval(['a', 'b', 'c'], 'c'), 'b');
    assert.equal(pickNeighborAfterRemoval(['a'], 'a'), null);
    assert.equal(pickNeighborAfterRemoval(['a', 'b'], 'ghost'), 'a');
});
