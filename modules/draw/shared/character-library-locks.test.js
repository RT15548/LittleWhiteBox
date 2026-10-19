import assert from 'node:assert/strict';
import test from 'node:test';
import { CHARACTER_EXPORT_TYPE, normalizeCharacterLibrary, parseCharacterImport, planCharacterImport } from './character-library.js';

// Matching by name must not bypass a group's import lock and overwrite local
// character data. Check the domain directly, without UI fixtures or mode matrices.
test('same-name import cannot overwrite a group-locked character without explicit consent', () => {
    const { characters, groups } = normalizeCharacterLibrary({
        characters: [{ id: 'local', name: 'Alice', appearance: 'local tags', groupId: 'group' }],
        groups: [{ id: 'group', name: 'Group', locked: true }],
    });
    const library = { characters, groups };
    const original = structuredClone(library);
    const incoming = parseCharacterImport({ type: CHARACTER_EXPORT_TYPE,
        characters: [{ id: 'foreign', name: 'Alice', appearance: 'imported tags' }],
    });
    const options = { overwriteSameName: true };
    const protectedPlan = planCharacterImport(library, incoming, options);
    assert.deepEqual(protectedPlan.library, original);
    assert.equal(protectedPlan.summary.lockedSkipped, 1);

    const allowed = planCharacterImport(library, incoming, { ...options, replaceLocked: true });
    assert.equal(allowed.summary.replaced, 1);
    assert.equal(allowed.library.characters[0].id, 'local');
    assert.equal(allowed.library.characters[0].appearance, 'imported tags');
    assert.deepEqual(allowed.library.groups, original.groups);
    assert.deepEqual(library, original);
});
