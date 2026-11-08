import assert from 'node:assert/strict';
import test from 'node:test';
import { markNewGroupsOff } from '../character-group-presets.js';

// Acceptance contracts (cost: a freshly created group gets switched on or left "don't care" by every saved preset):
// - A group that was not in the previously saved groups is recorded as off (false) in every preset that does not mention it yet.
// - Existing groups, and keys a preset already holds, are never touched; no new group means the same array comes back.
// - Without a previously saved group list (first ever save) nothing is marked; presets missing revision / groupStates and invalid group ids are handled safely.

const preset = (id, groupStates) => ({ id, name: id, revision: 3, groupStates, bindings: [] });
const groups = (...ids) => ids.map(id => ({ id, name: id, enabled: true }));

test('a new group becomes off in every preset, other keys stay', () => {
    const presets = [preset('p1', { a: true }), preset('p2', {})];
    const next = markNewGroupsOff(presets, groups('a', 'b'), groups('a', 'b', 'c'));
    assert.deepEqual(next.map(item => item.groupStates), [{ a: true, c: false }, { c: false }]);
    assert.deepEqual(next.map(item => item.revision), [4, 4]);
    assert.deepEqual(presets[0].groupStates, { a: true }, 'the input is not mutated');
});

test('an old group that a preset leaves as "don\'t care" stays that way', () => {
    const [only] = markNewGroupsOff([preset('p1', { a: true })], groups('a', 'b'), groups('a', 'b', 'c'));
    assert.equal(Object.hasOwn(only.groupStates, 'b'), false);
});

test('no previous groups to compare with (first ever save): presets come back untouched', () => {
    const presets = [preset('p1', { a: true })];
    for (const previous of [undefined, null, 'a', { a: 1 }]) {
        assert.equal(markNewGroupsOff(presets, previous, groups('a', 'b')), presets);
    }
    assert.deepEqual(markNewGroupsOff(presets, [], groups('a')).map(item => item.groupStates), [{ a: true }], 'an empty previous list is a real "no groups yet"');
    assert.deepEqual(markNewGroupsOff(presets, [], groups('b')).map(item => item.groupStates), [{ a: true, b: false }]);
});

test('a preset without revision or groupStates gets neither NaN nor a crash', () => {
    const bare = { id: 'p1', name: 'p1', bindings: [] };
    const noStates = { id: 'p2', name: 'p2', revision: 5, bindings: [] };
    const next = markNewGroupsOff([bare, noStates], groups('a'), groups('a', 'c'));
    assert.deepEqual(next.map(item => [item.revision, item.groupStates]), [[1, { c: false }], [6, { c: false }]]);
    assert.equal(Object.hasOwn(bare, 'groupStates'), false, 'the input is not mutated');
});

test('invalid group ids are ignored', () => {
    const presets = [preset('p1', { a: true })];
    const invalid = ['', '__ungrouped__', '__proto__', 'constructor', 'prototype', 'x'.repeat(129), undefined, null, 7];
    const next = [...invalid.map(id => ({ id })), null, undefined, { name: 'no id' }, ...groups('a')];
    assert.equal(markNewGroupsOff(presets, groups('a'), next), presets, 'only invalid ids: nothing changes');
    const [marked] = markNewGroupsOff(presets, groups('a'), [...next, ...groups('c')]);
    assert.deepEqual(marked.groupStates, { a: true, c: false });
    assert.equal(marked.revision, 4);
});

test('no new group, no presets or a key the preset already holds: nothing changes', () => {
    const presets = [preset('p1', { c: true })];
    assert.equal(markNewGroupsOff(presets, groups('a'), groups('a')), presets);
    assert.equal(markNewGroupsOff([], groups('a'), groups('a', 'c')).length, 0);
    const [kept] = markNewGroupsOff(presets, groups('a'), groups('a', 'c'));
    assert.deepEqual([kept.groupStates, kept.revision], [{ c: true }, 3]);
});

test('groupStates that is null or an array, and a revision that is not a safe integer, are replaced by safe values', () => {
    const groups = ids => ids.map(id => ({ id, name: id }));
    const odd = [
        { id: 'p1', name: 'p1', revision: 2, groupStates: null, bindings: [] },
        { id: 'p2', name: 'p2', revision: 2, groupStates: ['x'], bindings: [] },
        { id: 'p3', name: 'p3', revision: 1.5, groupStates: { a: true }, bindings: [] },
    ];
    const next = markNewGroupsOff(odd, groups(['a']), groups(['a', 'c']));
    assert.deepEqual(next.map(item => item.groupStates), [{ c: false }, { c: false }, { a: true, c: false }]);
    assert.deepEqual(next.map(item => item.revision), [3, 3, 1]);
});
