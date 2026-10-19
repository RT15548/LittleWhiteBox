import assert from 'node:assert/strict';
import test from 'node:test';
import { parseHTML } from 'linkedom';
import {
    CHARACTER_EXPORT_TYPE, duplicateCharacters, exportCharacters, isCharacterLocked,
    normalizeCharacterLibrary, parseCharacterImport, planCharacterImport, setCharactersLocked, setGroupLocked,
} from './character-library.js';
import { openCharacterImportDialog } from './character-library-dialog.js';
import { createCharacterLibraryUi } from './character-library-ui.js';

// Protect local character data: importing by ID or by name must share the same lock
// boundary. Ordinary build/lint checks cannot detect a semantically bypassed lock.
const parse = characters => parseCharacterImport({ type: CHARACTER_EXPORT_TYPE, characters });
const fixture = lock => {
    const { characters, groups } = normalizeCharacterLibrary({
        characters: [{ id: 'local', name: 'Alice', appearance: 'local tags', enabled: false,
            groupId: 'source', ...(lock === 'own' ? { locked: true } : {}) }],
        groups: [{ id: 'source', name: 'Source', ...(lock === 'group' ? { locked: true } : {}) },
            { id: 'target', name: 'Target' }],
    });
    return { characters, groups };
};
const modeOptions = mode => ({ mode, ...(mode === 'existing-group' ? { groupId: 'target' } : {}),
    ...(mode === 'new-group' ? { newGroupName: 'Imported' } : {}) });

for (const match of ['id', 'name']) for (const lock of ['own', 'group']) for (const mode of ['auto', 'existing-group', 'new-group']) {
    test(`${match} import respects ${lock} lock in ${mode}, explicit override preserves local identity/state`, () => {
        const library = fixture(lock);
        const before = structuredClone(library);
        const parsed = parse([{ id: match === 'id' ? 'local' : 'foreign', name: 'Alice', appearance: 'imported tags', enabled: true }]);
        const options = { ...modeOptions(mode), overwriteSameName: true };
        const protectedPlan = planCharacterImport(library, parsed, options);
        assert.deepEqual(protectedPlan.library, before);
        assert.equal(protectedPlan.summary.lockedSkipped, 1);
        assert.equal(protectedPlan.summary.replaced, 0);
        assert.equal(protectedPlan.summary.groupsCreated, 0);
        assert.deepEqual(protectedPlan.warnings.filter(w => w.code === 'locked-skipped').map(w => w.count), [1]);
        const allowed = planCharacterImport(library, parsed, { ...options, replaceLocked: true });
        const character = allowed.library.characters[0];
        assert.equal(allowed.summary.replaced, 1);
        assert.equal(allowed.summary.lockedSkipped, 0);
        assert.equal(character.id, 'local');
        assert.equal(character.appearance, 'imported tags');
        assert.equal(character.enabled, false);
        assert.equal(character.locked, before.characters[0].locked);
        assert.deepEqual(allowed.library.groups.find(g => g.id === 'source'), before.groups[0]);
        const target = mode === 'auto' ? 'source' : mode === 'existing-group' ? 'target' : allowed.library.groups.find(g => g.name === 'Imported').id;
        assert.equal(character.groupId, target);
        assert.deepEqual(library, before);
    });
}

test('only an explicit boolean override may replace a locked character', () => {
    for (const replaceLocked of [undefined, false, 'true', 'false', 1]) {
        const plan = planCharacterImport(fixture('own'), parse([{ id: 'local', name: 'Alice', appearance: 'new' }]), { replaceLocked });
        assert.equal(plan.summary.lockedSkipped, 1);
        assert.equal(plan.library.characters[0].appearance, 'local tags');
    }
});

test('same-ID skip/keep-both remain independent of locks, while a same-name overwrite still checks locks', () => {
    for (const lock of ['own', 'group']) for (const sameIdPolicy of ['skip', 'keep-both']) for (const replaceLocked of [false, true]) {
        const library = fixture(lock);
        const parsed = parse([{ id: 'local', name: 'Alice', appearance: 'new' }]);
        const options = { mode: 'existing-group', groupId: 'target', overwriteSameName: true, sameIdPolicy, replaceLocked };
        const plan = planCharacterImport(library, parsed, options);
        assert.deepEqual(plan.library.characters.find(c => c.id === 'local'), library.characters[0]);
        assert.equal(plan.summary.lockedSkipped, 0);
        assert.equal(plan.library.characters.length, sameIdPolicy === 'skip' ? 1 : 2);
        if (sameIdPolicy === 'keep-both') {
            const copy = plan.library.characters.find(c => c.id !== 'local');
            assert.equal(copy.appearance, 'new');
            assert.equal(copy.groupId, 'target');
            assert.equal(copy.locked, undefined);
        }
        const byName = planCharacterImport(library, parse([{ id: 'foreign', name: 'Alice', appearance: 'new' }]), options);
        assert.equal(byName.summary.replaced, replaceLocked ? 1 : 0);
        assert.equal(byName.summary.lockedSkipped, replaceLocked ? 0 : 1);
        assert.equal(byName.library.characters.length, 1);
        assert.equal(byName.library.characters[0].id, 'local');
    }
});

test('ID match takes priority over a same-name candidate and locked entries cannot be moved by replacement', () => {
    const library = fixture('own');
    library.characters.push({ ...fixture('none').characters[0], id: 'second', name: 'Other', appearance: 'second local', groupId: 'target' });
    const plan = planCharacterImport(library, parse([{ id: 'local', name: 'Other', appearance: 'new' }]), {
        mode: 'existing-group', groupId: 'target', overwriteSameName: true,
    });
    assert.deepEqual(plan.library, library);
    assert.equal(plan.summary.lockedSkipped, 1);
});

test('locks are local, own/group independent, and do not prevent adding to a locked group', () => {
    const library = setGroupLocked(fixture('own'), 'source', true);
    const ownUnlocked = setCharactersLocked(library, ['local'], false);
    assert.equal(ownUnlocked.characters[0].locked, undefined);
    assert.equal(isCharacterLocked(ownUnlocked, ownUnlocked.characters[0]), true);
    const bothUnlocked = setGroupLocked(ownUnlocked, 'source', false);
    assert.equal(isCharacterLocked(bothUnlocked, bothUnlocked.characters[0]), false);
    const exported = exportCharacters(library);
    assert.equal(exported.characters[0].locked, undefined);
    assert.equal(exported.groups[0].locked, undefined);
    const fromFile = parse([{ id: 'new', name: 'New', locked: true }]);
    const plan = planCharacterImport(library, fromFile, { mode: 'existing-group', groupId: 'source' });
    assert.equal(plan.summary.added, 1);
    const added = plan.library.characters.find(c => c.id === 'new');
    assert.equal(added.locked, undefined);
    assert.equal(isCharacterLocked(plan.library, added), true);
    const copied = duplicateCharacters(library, ['local'], { toGroupId: 'target' });
    assert.equal(copied.library.characters.find(c => c.id === copied.newIds[0]).locked, undefined);
    assert.equal(copied.library.characters.find(c => c.id === 'local').locked, true);
});

function openDialog(t, getLibrary, incoming) {
    const { document, window } = parseHTML('<html><body></body></html>');
    const confirmations = [];
    const dialog = openCharacterImportDialog({ document, library: getLibrary, parsed: parse(incoming), fileName: 'roles.json',
        onConfirm: result => confirmations.push(result) });
    t.after(() => dialog.close());
    const node = role => dialog.element.querySelector(`[data-role="${role}"]`);
    const check = (role, checked) => { node(role).checked = checked; node(role).dispatchEvent(new window.Event('change')); };
    return { dialog, confirmations, node, check };
}

test('dialog preview and confirmation combine same-name overwrite with explicit locked replacement', t => {
    const h = openDialog(t, fixture('group'), [{ id: 'foreign', name: 'Alice', appearance: 'new' }]);
    assert.equal(h.node('overwrite-same-name').checked, false);
    assert.equal(h.node('replace-locked').checked, false);
    h.check('overwrite-same-name', true);
    assert.equal(h.dialog.getPlan().summary.lockedSkipped, 1);
    assert.equal(h.node('confirm').disabled, true);
    h.check('replace-locked', true);
    assert.equal(h.dialog.getPlan().summary.replaced, 1);
    assert.equal(h.node('confirm').disabled, false);
    h.check('replace-locked', false);
    assert.equal(h.dialog.getPlan().summary.lockedSkipped, 1);
    h.check('replace-locked', true);
    h.node('confirm').click();
    assert.equal(h.confirmations.length, 1);
    const { plan, options } = h.confirmations[0];
    assert.equal(options.overwriteSameName, true);
    assert.equal(options.replaceLocked, true);
    assert.equal(plan.library.characters[0].id, 'local');
    assert.equal(plan.library.characters[0].appearance, 'new');
    assert.equal(plan.library.groups[0].locked, true);
});

test('dialog rechecks the live lock before confirming and does not submit a now-empty import', t => {
    let library = fixture('none');
    const h = openDialog(t, () => library, [{ id: 'local', name: 'Alice', appearance: 'new' }]);
    assert.equal(h.node('confirm').disabled, false);
    library = setCharactersLocked(library, ['local'], true);
    h.node('confirm').click();
    assert.equal(h.confirmations.length, 0);
    assert.equal(h.node('confirm').disabled, true);
    assert.equal(h.dialog.getPlan().summary.lockedSkipped, 1);
    assert.equal(h.dialog.element.isConnected, true);
});

test('shared UI lock toggles preserve search, unsaved fields and the independent group lock', t => {
    const { document, window } = parseHTML('<html><body><input id="search"><div id="toolbar"></div><div id="list"></div></body></html>');
    const list = document.querySelector('#list');
    const search = document.querySelector('#search');
    const ui = createCharacterLibraryUi({ document, listElement: list, toolbarElement: document.querySelector('#toolbar'), searchInput: search,
        getStorage: () => null,
        readCharacters: () => [...list.querySelectorAll('.sd-char-card')].map(card => ({ id: card.dataset.characterId,
            name: card.querySelector('[data-field="name"]').value, appearance: card.querySelector('[data-field="appearance"]').value, locked: true })),
        renderCard: ({ character }) => {
            const card = document.createElement('div'); card.className = 'sd-char-card'; card.dataset.characterId = character.id;
            const header = document.createElement('div'); header.className = 'sd-char-card-header';
            const title = document.createElement('div'); title.className = 'sd-char-card-title';
            const actions = document.createElement('div'); actions.className = 'btn-group';
            header.append(title, actions); card.append(header);
            for (const field of ['name', 'appearance']) {
                const input = document.createElement('input'); input.dataset.field = field; input.value = character[field] || ''; card.append(input);
            }
            return card;
        }, renderEmpty: () => document.createElement('div'),
    });
    t.after(() => ui.destroy());
    ui.render(setGroupLocked(fixture('own'), 'source', true));
    const draft = list.querySelector('[data-field="appearance"]'); draft.value = 'edited draft';
    search.value = 'edited'; search.dispatchEvent(new window.Event('input'));
    list.querySelector('[data-lwb-card-action="toggle-lock"]').click();
    const unlocked = ui.getLibrary();
    assert.equal(unlocked.characters[0].locked, undefined);
    assert.equal(unlocked.characters[0].appearance, 'edited draft');
    assert.equal(unlocked.groups[0].locked, true);
    assert.equal(isCharacterLocked(unlocked, unlocked.characters[0]), true);
    assert.equal(list.querySelector('[data-field="appearance"]'), draft);
    assert.equal(ui.getVisibleCardCount(), 1);
    list.querySelector('[data-group-id="source"] [data-lwb-group-action="toggle-lock"]').click();
    assert.equal(ui.getGroups()[0].locked, undefined);
    assert.equal(isCharacterLocked(ui.getLibrary(), ui.getLibrary().characters[0]), false);
    ui.render(ui.getLibrary());
    assert.equal(ui.getLibrary().characters[0].locked, undefined);
    assert.equal(ui.getLibrary().characters[0].appearance, 'edited draft');
    assert.equal(search.value, 'edited');
});
