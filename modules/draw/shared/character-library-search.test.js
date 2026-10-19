import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import { createCharacterLibraryUi } from './character-library-ui.js';
import { CHARACTER_EXPORT_TYPE, parseCharacterImport, planCharacterImport } from './character-library.js';

// Acceptance contracts (cost: lost character data):
// - Search preserves unsaved card inputs; bulk deletion only affects matching selections.
// - Same-name imports preserve local IDs and do not overwrite a previously renamed character.
test('search includes every same-name match and bulk selection excludes hidden drafts', () => {
    const { document, window } = parseHTML('<html><body><input id="search"><div id="toolbar"></div><div id="list"></div></body></html>');
    const list = document.querySelector('#list');
    const search = document.querySelector('#search');
    const ui = createCharacterLibraryUi({ document, listElement: list, toolbarElement: document.querySelector('#toolbar'), searchInput: search,
        getStorage: () => null, confirm: () => true,
        readCharacters: () => [...list.querySelectorAll('.sd-char-card')].map(card => ({ id: card.dataset.characterId, name: card.querySelector('input').value, enabled: true })),
        renderCard: ({ character }) => {
            const card = document.createElement('div'); card.className = 'sd-char-card'; card.dataset.characterId = character.id;
            const input = document.createElement('input'); input.value = character.name; card.append(input);
            return card;
        }, renderEmpty: () => document.createElement('div'),
    });
    ui.render({ characters: [{ id: 'a', name: 'Alice' }, { id: 'b', name: 'Bob' }, { id: 'c', name: 'Alice' }], groups: [] });
    const draft = list.querySelector('[data-character-id="b"] input'); draft.value = 'Bobby';
    search.value = 'alice'; search.dispatchEvent(new window.Event('input'));
    assert.equal(ui.getVisibleCardCount(), 2);
    assert.equal(list.querySelector('[data-character-id="b"] input'), draft);
    assert.equal(draft.value, 'Bobby');
    document.querySelector('[data-role="select-toggle"]').click();
    document.querySelector('[data-batch="select-all"]').click();
    assert.deepEqual(new Set(ui.getSelectedIds()), new Set(['a', 'c']));
    document.querySelector('[data-batch="delete"]').click();
    assert.deepEqual(ui.getLibrary().characters.map(c => [c.id, c.name]), [['b', 'Bobby']]);
    ui.destroy();
});

test('rename then same-name import does not overwrite the renamed local entry', () => {
    const parsed = parseCharacterImport({ type: CHARACTER_EXPORT_TYPE, characters: [{ id: 'local-a', name: 'Bob', appearance: 'first' }, { id: 'new-a', name: 'Alice', appearance: 'second' }] });
    const result = planCharacterImport({ characters: [{ id: 'local-a', name: 'Alice' }], groups: [] }, parsed, { policy: 'replace', overwriteSameName: true });
    assert.deepEqual(result.library.characters.map(c => [c.id, c.name, c.appearance]), [['local-a', 'Bob', 'first'], ['new-a', 'Alice', 'second']]);
});
