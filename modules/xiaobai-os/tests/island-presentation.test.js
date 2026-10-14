import assert from 'node:assert/strict';
import test from 'node:test';
import { transcriptRows } from '../apps/game/island/presentation/transcript.ts';
import { groupMaterials, selectMaterials } from '../apps/game/island/presentation/material-selection.ts';

test('the conversation folds repeated gathering without folding speech or changing original memory evidence', () => {
    const events = [
        { kind: 'worked', actor: 'player', task: 'gather', target: 'wood', outputs: ['a'] },
        { kind: 'worked', actor: 'player', task: 'gather', target: 'wood', outputs: ['b'] },
        { kind: 'speech', actor: 'lin', text: '先留一些。' },
        { kind: 'worked', actor: 'player', task: 'gather', target: 'wood', outputs: ['c'] },
        { kind: 'worked', actor: 'lin', task: 'gather', target: 'wood', outputs: ['d'] },
        { kind: 'worked', actor: 'lin', task: 'gather', target: 'palm', outputs: ['e'] },
    ].map((payload, sequence) => ({ payload, sequence: sequence + 1, at: sequence * 45, audience: ['player', 'lin'], position: { x: 0, y: 0 } }));
    const original = structuredClone(events), rows = transcriptRows(events);
    assert.deepEqual(rows.map(row => row.repetitions), [2, 1, 1, 1, 1]);
    assert.deepEqual(rows.map(row => row.event.sequence), [1, 3, 4, 5, 6]);
    assert.deepEqual(events, original);
});

test('a material quantity selects actual pieces, keeps worn clothing separate and rejects an excessive or fractional selection', () => {
    const items = [
        { id: 'a', kind: 'palm_leaf', location: { kind: 'carried', person: 'player' }, quantity: 2, wetness: .8, water: null },
        { id: 'b', kind: 'palm_leaf', location: { kind: 'carried', person: 'player' }, quantity: 3, wetness: .1, water: null },
        { id: 'c', kind: 'shirt', location: { kind: 'worn', person: 'player' }, quantity: 1, wetness: .1, water: null },
        { id: 'd', kind: 'shirt', location: { kind: 'carried', person: 'player' }, quantity: 1, wetness: .1, water: null },
    ];
    for (const item of items) item.food = null;
    const original = structuredClone(items), groups = groupMaterials(items), leaves = groups.find(g => g.kind === 'palm_leaf');
    assert.equal(groups.length, 3); assert.equal(leaves.quantity, 5);
    assert.deepEqual(selectMaterials(groups, { [leaves.key]: 4 }), [{ item: 'b', units: 3 }, { item: 'a', units: 1 }]);
    assert.equal(selectMaterials(groups, { [leaves.key]: 6 }), null);
    assert.equal(selectMaterials(groups, { [leaves.key]: .5 }), null);
    assert.deepEqual(items, original);
});
