import assert from 'node:assert/strict';
import test from 'node:test';
import { CHARACTER_EXPORT_TYPE, normalizeCharacterLibrary, parseCharacterImport, planCharacterImport } from '../character-library.js';

// Same-name entries with different file IDs must converge on one character,
// regardless of where import places it. Normalization must not hide duplicate
// placements by minting a second ID. Test the parser + planner domain boundary.
for (const mode of ['existing-group', 'new-group', 'auto']) {
    for (const hasLocalAlice of [false, true]) {
        test(`${mode}: repeated same-name imports ${hasLocalAlice ? 'replace the local character' : 'add then replace'} only once`, () => {
            const library = normalizeCharacterLibrary({
                groups: [{ id: 'old', name: 'Old' }, { id: 'target', name: 'Target' }],
                characters: [
                    { id: 'before', name: 'Before', groupId: 'old' },
                    ...(hasLocalAlice ? [{ id: 'local-alice', name: 'Alice', enabled: false, groupId: 'old' }] : []),
                    { id: 'anchor', name: 'Anchor', groupId: 'target' },
                    { id: 'tail', name: 'Tail', groupId: 'old' },
                ],
            });
            const parsed = parseCharacterImport({ type: CHARACTER_EXPORT_TYPE, version: 4,
                groups: [{ id: 'file-one', name: 'File One' }, { id: 'file-two', name: 'File Two' }],
                characters: [
                    { id: 'alice-one', name: 'Alice', appearance: 'first', outfits: [{ name: 'coat', tags: 'blue coat' }], groupId: 'file-one' },
                    { id: 'bob', name: 'Bob', groupId: 'file-one' },
                    { id: 'alice-two', name: 'Alice', appearance: 'last', groupId: 'file-two' },
                ],
            });
            const originalLibrary = structuredClone(library);
            const originalParsed = structuredClone(parsed);
            let sequence = 0;
            const plan = planCharacterImport(library, parsed, {
                mode, overwriteSameName: true, groupId: 'target', newGroupName: 'Imported', importNewAsDisabled: true,
            }, { makeId: prefix => `${prefix}-${++sequence}` });
            const alice = plan.library.characters.filter(character => character.name === 'Alice');
            assert.equal(alice.length, 1);
            assert.equal(alice[0].id, hasLocalAlice ? 'local-alice' : 'alice-one');
            assert.equal(alice[0].appearance, 'last');
            assert.deepEqual(alice[0].outfits, [{ name: 'coat', tags: 'blue coat' }]);
            assert.equal(alice[0].enabled, false);
            const target = mode === 'auto'
                ? (hasLocalAlice ? 'old' : plan.library.groups.find(group => group.name === 'File One').id)
                : (mode === 'existing-group' ? 'target' : plan.library.groups.find(group => group.name === 'Imported').id);
            assert.equal(alice[0].groupId, target);
            assert.deepEqual(plan.library.characters.map(character => character.id), mode === 'existing-group'
                ? ['before', 'anchor', alice[0].id, 'bob', 'tail']
                : (mode === 'auto' && hasLocalAlice
                    ? ['before', 'local-alice', 'anchor', 'tail', 'bob']
                    : ['before', 'anchor', 'tail', alice[0].id, 'bob']));
            assert.equal(plan.summary.added, hasLocalAlice ? 1 : 2);
            assert.equal(plan.summary.replaced, hasLocalAlice ? 2 : 1);
            assert.equal(plan.summary.totalAfter, 5);
            assert.equal(plan.summary.groupsCreated, mode === 'existing-group' ? 0 : 1);
            assert.deepEqual(plan.details.filter(detail => detail.name === 'Alice').map(detail => [detail.id, detail.action]), [
                [alice[0].id, hasLocalAlice ? 'replaced' : 'added'], [alice[0].id, 'replaced'],
            ]);
            assert.deepEqual(library, originalLibrary);
            assert.deepEqual(parsed, originalParsed);
        });
    }
}

test('without same-name overwrite distinct file IDs remain distinct characters', () => {
    const parsed = parseCharacterImport({ type: CHARACTER_EXPORT_TYPE,
        characters: [{ id: 'alice-one', name: 'Alice', appearance: 'first' }, { id: 'alice-two', name: 'Alice', appearance: 'last' }],
    });
    const plan = planCharacterImport({ characters: [], groups: [{ id: 'target', name: 'Target' }] }, parsed,
        { mode: 'existing-group', groupId: 'target' });
    assert.deepEqual(plan.library.characters.map(character => [character.id, character.appearance, character.groupId]), [
        ['alice-one', 'first', 'target'], ['alice-two', 'last', 'target'],
    ]);
    assert.equal(plan.summary.added, 2);
    assert.equal(plan.summary.replaced, 0);
});
