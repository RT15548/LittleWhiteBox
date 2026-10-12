import test from 'node:test';
import assert from 'node:assert/strict';

import {
    BACKEND_ENABLED_CHARACTER_LIMIT,
    characterLibraryFromSettings,
    CHARACTER_EXPORT_TYPE,
    MAX_GROUPS,
    MAX_IMPORT_CHARACTERS,
    addCharacter,
    countEnabledCharacters,
    createGroup,
    deleteCharacters,
    deleteGroup,
    duplicateCharacters,
    exportCharacters,
    getDisplayOrder,
    getGroupSummary,
    getGroupedView,
    isCharacterEffectivelyEnabled,
    isGroupEnabled,
    moveCharacters,
    moveGroup,
    normalizeCharacter,
    normalizeCharacterGroups,
    normalizeCharacterLibrary,
    parseCharacterImport,
    placeCharactersAfterGroupMembers,
    placeGroup,
    planCharacterImport,
    renameGroup,
    selectEnabledCharacters,
    setCharactersEnabled,
    setGroupEnabled,
    shiftCharacter,
} from '../character-library.js';

function counterIds() {
    let n = 0;
    return (prefix) => `${prefix}-t${++n}`;
}

function char(id, name, extra = {}) {
    return { id, name, ...extra };
}

function lib(characters, groups = []) {
    return normalizeCharacterLibrary({ characters, groups }, { makeId: counterIds() });
}

function ids(library) {
    return library.characters.map(character => character.id);
}

function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.values(value).forEach(deepFreeze);
    }
    return value;
}

// ───────────── 规范化 ─────────────

test('legacy library without groups round-trips without adding group keys', () => {
    const normalized = normalizeCharacterLibrary({
        characters: [{ id: 'a', name: '阿璃', tags: 'silver hair', costumes: [{ name: '常服', tags: 'dress' }] }],
    });
    assert.deepEqual(normalized.groups, []);
    assert.equal(Object.hasOwn(normalized.characters[0], 'groupId'), false);
    assert.equal(normalized.characters[0].appearance, 'silver hair');
    assert.deepEqual(normalized.characters[0].outfits, [{ name: '常服', tags: 'dress' }]);
    assert.deepEqual(normalized.repairs, { idFilled: 0, idDeduped: 0, groupCleared: 0 });
});

test('missing and duplicate ids are repaired so every id is unique', () => {
    const normalized = normalizeCharacterLibrary({
        characters: [char('a', 'A'), char('a', 'B'), { name: 'C' }, char('b', 'D')],
    }, { makeId: counterIds() });
    const unique = new Set(ids(normalized));
    assert.equal(unique.size, 4);
    assert.equal(normalized.characters[0].id, 'a');
    assert.equal(normalized.characters[3].id, 'b');
    assert.equal(normalized.repairs.idDeduped, 1);
    assert.equal(normalized.repairs.idFilled, 1);
});

test('groupId pointing at a missing group is cleared', () => {
    const normalized = normalizeCharacterLibrary({
        characters: [char('a', 'A', { groupId: 'ghost' }), char('b', 'B', { groupId: 'g1' })],
        groups: [{ id: 'g1', name: '主线' }],
    });
    assert.equal(Object.hasOwn(normalized.characters[0], 'groupId'), false);
    assert.equal(normalized.characters[1].groupId, 'g1');
    assert.equal(normalized.repairs.groupCleared, 1);
});

test('group names: empty, reserved, duplicate and overlong are handled', () => {
    const groups = normalizeCharacterGroups([
        { id: 'g1', name: ' 主线 ' },
        { id: 'g2', name: '主线' },
        { id: 'g3', name: '' },
        { id: 'g4', name: '未分组' },
        { id: 'g1', name: '配角' },
        { id: 'g5', name: 'x'.repeat(40) },
        'garbage',
    ], { makeId: counterIds() });
    assert.deepEqual(groups.map(group => group.name), ['主线', '配角', 'x'.repeat(32)]);
    assert.equal(new Set(groups.map(group => group.id)).size, 3);
    const many = normalizeCharacterGroups(Array.from({ length: 80 }, (_, i) => ({ id: `g${i}`, name: `组${i}` })));
    assert.equal(many.length, MAX_GROUPS);
});

// ───────────── 分组管理 ─────────────

test('createGroup/renameGroup validate names', () => {
    let library = lib([]);
    const created = createGroup(library, '主线', { makeId: counterIds() });
    library = created.library;
    assert.equal(library.groups[0].name, '主线');
    assert.throws(() => createGroup(library, ' 主线 '), /已存在/);
    assert.throws(() => createGroup(library, ''), /不能为空/);
    assert.throws(() => createGroup(library, '未分组'), /保留/);
    library = createGroup(library, '配角', { makeId: counterIds() }).library;
    assert.throws(() => renameGroup(library, library.groups[1].id, '主线'), /已存在/);
    assert.equal(renameGroup(library, library.groups[0].id, '主线'). groups[0].name, '主线');
    assert.equal(renameGroup(library, library.groups[1].id, '路人').groups[1].name, '路人');
});

test('deleteGroup dissolves by default and can delete members', () => {
    const library = lib(
        [char('a', 'A', { groupId: 'g1' }), char('b', 'B'), char('c', 'C', { groupId: 'g1' })],
        [{ id: 'g1', name: '主线' }],
    );
    const dissolved = deleteGroup(library, 'g1');
    assert.deepEqual(ids(dissolved), ['a', 'b', 'c']);
    assert.equal(dissolved.characters.some(character => Object.hasOwn(character, 'groupId')), false);
    assert.deepEqual(dissolved.groups, []);
    const removed = deleteGroup(library, 'g1', { deleteCharacters: true });
    assert.deepEqual(ids(removed), ['b']);
    assert.throws(() => deleteGroup(library, 'nope'), /不存在/);
});

test('moveGroup and placeGroup reorder groups', () => {
    const library = lib([], [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }]);
    assert.deepEqual(moveGroup(library, 'a', 1).groups.map(g => g.id), ['b', 'a', 'c']);
    assert.equal(moveGroup(library, 'a', -1), library);
    assert.equal(moveGroup(library, 'c', 1), library);
    assert.deepEqual(placeGroup(library, 'c', 'a').groups.map(g => g.id), ['c', 'a', 'b']);
    assert.deepEqual(placeGroup(library, 'a', '').groups.map(g => g.id), ['b', 'c', 'a']);
    assert.equal(placeGroup(library, 'a', 'a'), library);
});

// ───────────── 展示与启用状态 ─────────────

test('getGroupedView lists ungrouped first, then groups, members keep array order', () => {
    const library = lib(
        [char('1', 'A', { groupId: 'g2' }), char('2', 'B'), char('3', 'C', { groupId: 'g1' }),
            char('4', 'D', { groupId: 'g2', enabled: false }), char('5', 'E', { groupId: 'g1' })],
        [{ id: 'g1', name: '甲' }, { id: 'g2', name: '乙' }],
    );
    const view = getGroupedView(library);
    assert.deepEqual(view.map(group => group.id), ['', 'g1', 'g2']);
    assert.deepEqual(view[0].characters.map(c => c.id), ['2']);
    assert.deepEqual(view[1].characters.map(c => c.id), ['3', '5']);
    assert.deepEqual(view[2].characters.map(c => c.id), ['1', '4']);
    assert.equal(view[2].own, 1);
    assert.equal(view[2].enabled, true);
    assert.equal(view[0].enabled, true);
    assert.deepEqual(getDisplayOrder(library).map(c => c.id), ['2', '3', '5', '1', '4']);
    const filtered = getGroupedView(library, { visibleIds: ['3'] });
    assert.deepEqual(filtered[1].characters.map(c => c.id), ['3']);
    assert.equal(filtered[1].total, 2);
});

test('getGroupSummary reports own enabled count, total and the group switch (no tri-state)', () => {
    const library = lib(
        [char('1', 'A', { groupId: 'g1' }), char('2', 'B', { groupId: 'g1', enabled: false }),
            char('3', 'C', { groupId: 'g2' }), char('4', 'D')],
        [{ id: 'g1', name: '1' }, { id: 'g2', name: '2', enabled: false }, { id: 'g3', name: '3' }],
    );
    assert.deepEqual(getGroupSummary(library, 'g1'), { own: 1, total: 2, enabled: true });
    assert.deepEqual(getGroupSummary(library, 'g2'), { own: 1, total: 1, enabled: false }, 'own ignores the group switch');
    assert.deepEqual(getGroupSummary(library, 'g3'), { own: 0, total: 0, enabled: true });
    assert.deepEqual(getGroupSummary(library, ''), { own: 1, total: 1, enabled: true });
    assert.deepEqual(getGroupSummary(library, 'nope'), { own: 1, total: 1, enabled: true }, 'unknown group falls back to ungrouped');
    const view = getGroupedView(library);
    assert.deepEqual(view.map(g => [g.id, g.enabled, g.own, g.total]), [['', true, 1, 1], ['g1', true, 1, 2], ['g2', false, 1, 1], ['g3', true, 0, 0]]);
});

// ───────────── 分组开关（嵌套启用）─────────────

test('normalizeCharacterGroups keeps enabled only when it is exactly false', () => {
    const groups = normalizeCharacterGroups([
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B', enabled: false },
        { id: 'c', name: 'C', enabled: true },
        { id: 'd', name: 'D', enabled: 'false' },
        { id: 'e', name: 'E', enabled: 0 },
        { id: 'f', name: 'F', enabled: null },
    ]);
    assert.deepEqual(groups, [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B', enabled: false },
        { id: 'c', name: 'C' },
        { id: 'd', name: 'D' },
        { id: 'e', name: 'E' },
        { id: 'f', name: 'F' },
    ]);
    assert.equal(normalizeCharacterLibrary({ characters: [], groups: [{ id: 'b', name: 'B', enabled: false }] }).groups[0].enabled, false);
});

test('isGroupEnabled: groups default to on; ungrouped and unknown groups are always on', () => {
    const library = lib([], [{ id: 'g1', name: '甲' }, { id: 'g2', name: '乙', enabled: false }]);
    assert.equal(isGroupEnabled(library, 'g1'), true);
    assert.equal(isGroupEnabled(library, 'g2'), false);
    assert.equal(isGroupEnabled(library, ''), true);
    assert.equal(isGroupEnabled(library), true);
    assert.equal(isGroupEnabled(library, 'nope'), true);
    assert.equal(isGroupEnabled({ characters: [] }, 'g2'), true);
});

test('isCharacterEffectivelyEnabled = group on AND character own enabled', () => {
    const library = lib([], [{ id: 'on', name: '开' }, { id: 'off', name: '关', enabled: false }]);
    const check = (character) => isCharacterEffectivelyEnabled(library, character);
    assert.equal(check(char('1', 'A', { groupId: 'on' })), true);
    assert.equal(check(char('2', 'B', { groupId: 'on', enabled: false })), false);
    assert.equal(check(char('3', 'C', { groupId: 'off' })), false);
    assert.equal(check(char('4', 'D', { groupId: 'off', enabled: false })), false);
    assert.equal(check(char('5', 'E')), true);
    assert.equal(check(char('6', 'F', { enabled: false })), false);
    assert.equal(check(char('7', 'G', { groupId: 'ghost' })), true, 'dangling groupId behaves as ungrouped');
    assert.equal(check(undefined), false);
});

test('setGroupEnabled only touches the group switch and keeps every character as it was', () => {
    const library = lib(
        [char('1', 'A', { groupId: 'g1' }), char('2', 'B', { groupId: 'g1', enabled: false }), char('3', 'C')],
        [{ id: 'g1', name: '甲' }, { id: 'g2', name: '乙' }],
    );
    const off = setGroupEnabled(library, 'g1', false);
    assert.deepEqual(off.groups, [{ id: 'g1', name: '甲', enabled: false }, { id: 'g2', name: '乙' }]);
    assert.equal(off.characters, library.characters, 'characters array is the same reference');
    assert.deepEqual(off.characters.map(c => c.enabled), [true, false, true]);
    assert.equal(countEnabledCharacters(off), 1);
    const back = setGroupEnabled(off, 'g1', true);
    assert.deepEqual(back.groups, library.groups, 'turning back on removes the key again');
    assert.equal(Object.hasOwn(back.groups[0], 'enabled'), false);
    assert.deepEqual(back.characters.map(c => c.enabled), [true, false, true], 'character 1 stays on, character 2 stays off');
    assert.equal(setGroupEnabled(library, 'g1', true), library, 'no-op returns the same reference');
    assert.equal(setGroupEnabled(off, 'g1', false), off);
});

test('setGroupEnabled rejects ungrouped, unknown groups and non-boolean values', () => {
    const library = lib([], [{ id: 'g1', name: '甲' }]);
    assert.throws(() => setGroupEnabled(library, '', false), /未分组没有开关/);
    assert.throws(() => setGroupEnabled(library, undefined, false), TypeError);
    assert.throws(() => setGroupEnabled(library, 'nope', false), /不存在/);
    assert.throws(() => setGroupEnabled(library, 'g1', 'false'), TypeError);
    assert.throws(() => setGroupEnabled(library, 'g1', undefined), TypeError);
});

test('group operations keep the group switch: rename, move, place, delete other group, add character', () => {
    let library = lib([], [{ id: 'g1', name: '甲', enabled: false }, { id: 'g2', name: '乙' }, { id: 'g3', name: '丙', enabled: false }]);
    library = renameGroup(library, 'g1', '改名');
    assert.deepEqual(library.groups[0], { id: 'g1', name: '改名', enabled: false });
    library = moveGroup(library, 'g1', 1);
    library = placeGroup(library, 'g3', 'g2');
    assert.deepEqual(library.groups.map(g => [g.id, g.enabled]), [['g3', false], ['g2', undefined], ['g1', false]]);
    library = deleteGroup(library, 'g2');
    assert.deepEqual(library.groups.map(g => [g.id, g.enabled]), [['g3', false], ['g1', false]]);
    const { library: withChar } = addCharacter(library, { name: 'N' }, { groupId: 'g1', makeId: counterIds() });
    assert.equal(withChar.groups, library.groups);
    assert.equal(createGroup(library, '新', { makeId: counterIds() }).library.groups.at(-1).enabled, undefined, 'new groups start on without an enabled key');
});

test('countEnabledCharacters and selectEnabledCharacters use the effective state and accept a library', () => {
    const library = lib(
        [char('1', 'A', { groupId: 'off' }), char('2', 'B', { groupId: 'on' }), char('3', 'C', { groupId: 'on', enabled: false }),
            char('4', 'D'), char('5', 'E', { enabled: false })],
        [{ id: 'off', name: '关', enabled: false }, { id: 'on', name: '开' }],
    );
    assert.deepEqual(selectEnabledCharacters(library).map(c => c.id), ['2', '4']);
    assert.equal(countEnabledCharacters(library), 2);
    assert.equal(countEnabledCharacters(setGroupEnabled(library, 'off', true)), 3);
    assert.deepEqual(selectEnabledCharacters(undefined), []);
    assert.deepEqual(selectEnabledCharacters({}), []);
});

test('characterLibraryFromSettings maps characterTags/characterGroups and tolerates missing fields', () => {
    const tags = [char('1', 'A')];
    const groups = [{ id: 'g', name: 'G', enabled: false }];
    const library = characterLibraryFromSettings({ characterTags: tags, characterGroups: groups });
    assert.equal(library.characters, tags);
    assert.equal(library.groups, groups);
    assert.deepEqual(characterLibraryFromSettings({}), { characters: [], groups: [] });
    assert.deepEqual(characterLibraryFromSettings(null), { characters: [], groups: [] });
    assert.deepEqual(characterLibraryFromSettings({ characterTags: 'x', characterGroups: {} }), { characters: [], groups: [] });
});

test('setCharactersEnabled ignores unknown ids and counts enabled', () => {
    const library = lib([char('1', 'A'), char('2', 'B'), char('3', 'C', { enabled: false })]);
    const off = setCharactersEnabled(library, ['1', 'zzz'], false);
    assert.equal(countEnabledCharacters(off), 1);
    assert.equal(off.characters[1], library.characters[1]);
    assert.equal(countEnabledCharacters(setCharactersEnabled(off, ['1', '3'], true)), 3);
});

// ───────────── 添加 / 移动 / 排序 ─────────────

test('addCharacter appends after the last member of the target group', () => {
    const library = lib(
        [char('1', 'A', { groupId: 'g1' }), char('2', 'B'), char('3', 'C', { groupId: 'g1' }), char('4', 'D')],
        [{ id: 'g1', name: '甲' }, { id: 'g2', name: '乙' }],
    );
    const inG1 = addCharacter(library, { name: 'N' }, { groupId: 'g1', makeId: counterIds() });
    assert.deepEqual(ids(inG1.library), ['1', '2', '3', inG1.id, '4']);
    assert.equal(inG1.library.characters[3].groupId, 'g1');
    const inEmpty = addCharacter(library, { name: 'M' }, { groupId: 'g2', makeId: counterIds() });
    assert.equal(inEmpty.library.characters.at(-1).id, inEmpty.id);
    const ungrouped = addCharacter(library, { name: 'U' }, { makeId: counterIds() });
    assert.equal(Object.hasOwn(ungrouped.library.characters.find(c => c.id === ungrouped.id), 'groupId'), false);
    assert.throws(() => addCharacter(library, {}, { groupId: 'nope' }), /不存在/);
});

test('moveCharacters keeps relative order and appends to the target group', () => {
    const library = lib(
        [char('1', 'A'), char('2', 'B', { groupId: 'g1' }), char('3', 'C'), char('4', 'D', { groupId: 'g1' })],
        [{ id: 'g1', name: '甲' }],
    );
    const moved = moveCharacters(library, ['3', '1'], { groupId: 'g1' });
    assert.deepEqual(ids(moved), ['2', '4', '1', '3']);
    assert.equal(moved.characters.filter(c => c.groupId === 'g1').length, 4);
    const toEmptyGroup = moveCharacters(
        lib([char('1', 'A')], [{ id: 'g9', name: '空' }]), ['1'], { groupId: 'g9' },
    );
    assert.equal(toEmptyGroup.characters[0].groupId, 'g9');
    const back = moveCharacters(moved, ['1', '3'], { groupId: '' });
    assert.equal(back.characters.some(c => c.id === '1' && Object.hasOwn(c, 'groupId')), false);
    assert.throws(() => moveCharacters(library, ['1'], { groupId: 'nope' }), /不存在/);
    assert.equal(moveCharacters(library, ['zzz'], { groupId: 'g1' }), library);
});

test('moveCharacters with beforeId inserts there and adopts that row\'s group (drag & drop)', () => {
    const library = lib(
        [char('1', 'A'), char('2', 'B', { groupId: 'g1' }), char('3', 'C', { groupId: 'g1' }), char('4', 'D')],
        [{ id: 'g1', name: '甲' }],
    );
    const dropped = moveCharacters(library, ['4'], { beforeId: '3' });
    assert.deepEqual(ids(dropped), ['1', '2', '4', '3']);
    assert.equal(dropped.characters[2].groupId, 'g1');
    const multi = moveCharacters(library, ['1', '4'], { beforeId: '2' });
    assert.deepEqual(ids(multi), ['1', '4', '2', '3']);
    assert.ok(multi.characters.slice(0, 2).every(c => c.groupId === 'g1'));
    // 把自己放到自己前面：beforeId 在被移集合内则忽略，退回到 groupId 末尾。
    const self = moveCharacters(library, ['2'], { groupId: 'g1', beforeId: '2' });
    assert.deepEqual(ids(self), ['1', '3', '2', '4']);
});

test('shiftCharacter swaps only with same-group neighbours', () => {
    const library = lib(
        [char('1', 'A', { groupId: 'g1' }), char('2', 'B'), char('3', 'C', { groupId: 'g1' }), char('4', 'D', { groupId: 'g1' })],
        [{ id: 'g1', name: '甲' }],
    );
    assert.deepEqual(ids(shiftCharacter(library, '3', -1)), ['3', '2', '1', '4']);
    assert.deepEqual(ids(shiftCharacter(library, '3', 1)), ['1', '2', '4', '3']);
    assert.equal(shiftCharacter(library, '1', -1), library);
    assert.equal(shiftCharacter(library, '4', 1), library);
    assert.equal(shiftCharacter(library, '2', -1), library);
    assert.throws(() => shiftCharacter(library, 'zzz', 1), /不存在/);
});

test('deleteCharacters removes only the given ids', () => {
    const library = lib([char('1', 'A'), char('2', 'B'), char('3', 'C')]);
    assert.deepEqual(ids(deleteCharacters(library, ['2', 'zzz'])), ['1', '3']);
});

// ───────────── 复制人设 ─────────────

test('duplicateCharacters deep-copies with new id, suffixed name, no aliases, always enabled', () => {
    const library = lib(
        [char('1', '阿璃', { aliases: ['小璃'], outfits: [{ name: '常服', tags: 'dress' }], groupId: 'g1' }),
            char('2', '路人', { enabled: false })],
        [{ id: 'g1', name: '甲' }],
    );
    const { library: copied, newIds } = duplicateCharacters(library, ['1'], { makeId: counterIds() });
    assert.equal(newIds.length, 1);
    assert.deepEqual(ids(copied), ['1', newIds[0], '2']);
    const copy = copied.characters[1];
    assert.equal(copy.name, '阿璃 副本');
    assert.deepEqual(copy.aliases, []);
    assert.equal(copy.groupId, 'g1');
    assert.equal(copy.enabled, true);
    assert.deepEqual(copy.outfits, [{ name: '常服', tags: 'dress' }]);
    assert.notEqual(copy.outfits, library.characters[0].outfits);
    const again = duplicateCharacters(copied, ['1'], { makeId: counterIds() });
    assert.equal(again.library.characters[1].name, '阿璃 副本 2');
    const disabledCopy = duplicateCharacters(library, ['2'], { makeId: counterIds() });
    assert.equal(disabledCopy.library.characters[2].enabled, true, '复制出的角色一律默认启用，即使原角色是停用的');
    assert.equal(disabledCopy.library.characters[1].enabled, false, '原角色状态不变');
});

test('duplicateCharacters can copy into another group', () => {
    const library = lib(
        [char('1', 'A'), char('2', 'B', { groupId: 'g1' }), char('3', 'C')],
        [{ id: 'g1', name: '甲' }],
    );
    const { library: copied, newIds } = duplicateCharacters(library, ['1', '3'], { toGroupId: 'g1', makeId: counterIds() });
    assert.deepEqual(ids(copied), ['1', '2', newIds[0], newIds[1], '3']);
    assert.ok(newIds.every(id => copied.characters.find(c => c.id === id).groupId === 'g1'));
    assert.throws(() => duplicateCharacters(library, ['1'], { toGroupId: 'nope' }), /不存在/);
});

// ───────────── 导出 ─────────────

function sampleLibrary() {
    return lib(
        [char('1', 'A', { groupId: 'g2' }), char('2', 'B'), char('3', 'C', { groupId: 'g1' }), char('4', 'D', { groupId: 'g2' })],
        [{ id: 'g1', name: '甲' }, { id: 'g2', name: '乙' }, { id: 'g3', name: '空组' }],
    );
}

test('exportCharacters: all/group/selection scopes in display order', () => {
    const library = sampleLibrary();
    const all = exportCharacters(library, { scope: 'all' }, { now: 0 });
    assert.equal(all.type, CHARACTER_EXPORT_TYPE);
    assert.equal(all.version, 4);
    assert.equal(all.exportedAt, '1970-01-01T00:00:00.000Z');
    assert.deepEqual(all.characters.map(c => c.id), ['2', '3', '1', '4']);
    assert.deepEqual(all.groups.map(g => g.id), ['g1', 'g2', 'g3']);

    const group = exportCharacters(library, { scope: 'group', groupId: 'g2' });
    assert.deepEqual(group.characters.map(c => c.id), ['1', '4']);
    assert.deepEqual(group.groups.map(g => g.id), ['g2']);

    const selection = exportCharacters(library, { scope: 'selection', ids: ['4', '3', 'zzz'] });
    assert.deepEqual(selection.characters.map(c => c.id), ['3', '4']);
    assert.deepEqual(selection.groups.map(g => g.id), ['g1', 'g2']);

    assert.throws(() => exportCharacters(library, { scope: 'selection', ids: [] }), /没有可导出/);
    assert.throws(() => exportCharacters(library, { scope: 'group', groupId: 'g3' }), /没有可导出/);
    assert.throws(() => exportCharacters(library, { scope: 'bogus' }), /范围无效/);
});

// ───────────── 导入解析 ─────────────

test('parseCharacterImport rejects wrong shapes and warns on newer versions', () => {
    assert.throws(() => parseCharacterImport(null), /不是角色标签文件/);
    assert.throws(() => parseCharacterImport({ type: 'novel-draw-prompt-template' }), /不是角色标签文件/);
    assert.throws(() => parseCharacterImport({ type: CHARACTER_EXPORT_TYPE, characters: {} }), /characters/);
    const newer = parseCharacterImport({ type: CHARACTER_EXPORT_TYPE, version: 9, characters: [] });
    assert.equal(newer.warnings[0].code, 'newer-version');
    const v3 = parseCharacterImport({ type: CHARACTER_EXPORT_TYPE, version: 3, characters: [char('a', 'A')] });
    assert.equal(v3.version, 3);
    assert.equal(v3.entries.length, 1);
});

test('parseCharacterImport skips nameless entries, flags duplicate ids, resolves group names, ignores file group trust', () => {
    const parsed = parseCharacterImport({
        type: CHARACTER_EXPORT_TYPE,
        version: 4,
        groups: [{ id: 'fg1', name: '文件组' }],
        characters: [
            char('a', 'A', { groupId: 'fg1', outfits: [] }),
            char('a', 'A2'),
            { id: 'x' },
            char('b', 'B', { groupId: 'ghost' }),
            { name: 'NoId', tags: 'legacy', evil: 'dropped' },
        ],
    });
    assert.equal(parsed.skipped, 1);
    assert.equal(parsed.entries.length, 4);
    assert.equal(parsed.entries[0].groupName, '文件组');
    assert.equal(parsed.entries[1].duplicate, true);
    assert.equal(parsed.entries[3].groupName, '');
    assert.equal(parsed.entries[2].groupName, '');
    assert.deepEqual(parsed.entries[3].fields.sort(), ['appearance', 'name']);
    assert.equal(parsed.entries[3].character.appearance, 'legacy');
    assert.equal(Object.hasOwn(parsed.entries[3].character, 'evil'), false);
    assert.equal(Object.hasOwn(parsed.entries[0].character, 'groupId'), false);
    assert.ok(parsed.warnings.some(w => w.code === 'duplicate-id'));
});

// ───────────── 导入合并 ─────────────

function parsedOf(characters, groups = [], version = 4) {
    return parseCharacterImport({ type: CHARACTER_EXPORT_TYPE, version, groups, characters }, { makeId: counterIds() });
}

test('import into an empty library: v3 file without groups lands in ungrouped', () => {
    const plan = planCharacterImport(lib([]), parsedOf([char('a', 'A'), char('b', 'B')], [], 3), {}, { makeId: counterIds() });
    assert.equal(plan.summary.added, 2);
    assert.deepEqual(ids(plan.library), ['a', 'b']);
    assert.equal(plan.library.characters.some(c => Object.hasOwn(c, 'groupId')), false);
});

test('auto mode replaces same-id characters in place across groups, keeping local group/position/enabled', () => {
    const library = lib(
        [char('1', '旧A', { groupId: 'g1', enabled: false, appearance: 'old' }),
            char('2', '旧B', { groupId: 'g2', outfits: [{ name: '常服', tags: 'dress' }] }),
            char('3', 'C')],
        [{ id: 'g1', name: '甲' }, { id: 'g2', name: '乙' }],
    );
    const parsed = parsedOf([
        char('2', '新B', { enabled: false, appearance: 'new b' }),
        char('1', '新A', { enabled: true, groupId: 'fg9' }),
    ]);
    const plan = planCharacterImport(library, parsed, { mode: 'auto' }, { makeId: counterIds() });
    assert.equal(plan.summary.replaced, 2);
    assert.deepEqual(ids(plan.library), ['1', '2', '3']);
    const [one, two] = plan.library.characters;
    assert.equal(one.name, '新A');
    assert.equal(one.groupId, 'g1');
    assert.equal(one.enabled, false);
    assert.equal(two.name, '新B');
    assert.equal(two.groupId, 'g2');
    assert.equal(two.enabled, true);
    assert.equal(two.appearance, 'new b');
});

test('field-level overwrite: fields absent from the file keep local values', () => {
    const library = lib([char('1', 'A', { outfits: [{ name: '常服', tags: 'dress' }], negativeTags: 'bad' })]);
    const parsed = parsedOf([{ id: '1', name: 'A', tags: 'from v3 file' }], [], 3);
    const plan = planCharacterImport(library, parsed, {}, { makeId: counterIds() });
    const result = plan.library.characters[0];
    assert.equal(result.appearance, 'from v3 file');
    assert.deepEqual(result.outfits, [{ name: '常服', tags: 'dress' }]);
    assert.equal(result.negativeTags, 'bad');
});

test('auto mode places new characters by file group name, merging into same-named local group', () => {
    const library = lib([char('1', 'A', { groupId: 'g1' })], [{ id: 'g1', name: '主线' }]);
    const parsed = parsedOf(
        [char('n1', 'N1', { groupId: 'fg1' }), char('n2', 'N2', { groupId: 'fg2' }), char('n3', 'N3')],
        [{ id: 'fg1', name: '主线' }, { id: 'fg2', name: '新组' }],
    );
    const plan = planCharacterImport(library, parsed, {}, { makeId: counterIds() });
    assert.equal(plan.summary.groupsCreated, 1);
    assert.deepEqual(plan.library.groups.map(g => g.name), ['主线', '新组']);
    const byId = Object.fromEntries(plan.library.characters.map(c => [c.id, c]));
    assert.equal(byId.n1.groupId, 'g1');
    assert.equal(byId.n2.groupId, plan.library.groups[1].id);
    assert.equal(Object.hasOwn(byId.n3, 'groupId'), false);
    assert.deepEqual(ids(plan.library).slice(0, 2), ['1', 'n1']);
});

test('importNewAsDisabled only affects new characters', () => {
    const library = lib([char('1', 'A')]);
    const parsed = parsedOf([char('1', 'A', { enabled: false }), char('2', 'B', { enabled: true })]);
    const plan = planCharacterImport(library, parsed, { importNewAsDisabled: true }, { makeId: counterIds() });
    assert.equal(plan.library.characters[0].enabled, true);
    assert.equal(plan.library.characters[1].enabled, false);
    assert.equal(plan.summary.enabledAfter, 1);
});

test('duplicate ids inside a file: later ones become new characters with fresh ids', () => {
    const plan = planCharacterImport(lib([]), parsedOf([char('a', 'A1'), char('a', 'A2')]), {}, { makeId: counterIds() });
    assert.equal(plan.summary.added, 2);
    assert.equal(new Set(ids(plan.library)).size, 2);
    assert.equal(plan.library.characters[0].id, 'a');
    assert.ok(plan.warnings.some(w => w.code === 'duplicate-id'));
});

test('missing id imports as new; same-name different-id only warns', () => {
    const library = lib([char('1', '阿璃', { aliases: ['小璃'] })]);
    const plan = planCharacterImport(library, parsedOf([{ name: '阿璃' }, { name: '小璃' }, { name: '别人' }]), {}, { makeId: counterIds() });
    assert.equal(plan.summary.added, 3);
    assert.equal(plan.summary.replaced, 0);
    const conflict = plan.warnings.find(w => w.code === 'name-conflict');
    assert.equal(conflict.count, 2);
});

test('existing-group mode: replace moves into target, skip leaves untouched, keep-both adds a renamed copy', () => {
    const library = lib(
        [char('1', 'A', { groupId: 'g1' }), char('2', 'B'), char('3', 'C', { groupId: 'g2' })],
        [{ id: 'g1', name: '甲' }, { id: 'g2', name: '乙' }],
    );
    const parsed = parsedOf([char('2', 'B新'), char('9', 'Z')]);
    const replace = planCharacterImport(library, parsed, { mode: 'existing-group', groupId: 'g2' }, { makeId: counterIds() });
    assert.deepEqual(ids(replace.library), ['1', '3', '2', '9']);
    assert.equal(replace.library.characters[2].groupId, 'g2');
    assert.equal(replace.library.characters[2].name, 'B新');
    assert.equal(replace.library.characters[3].groupId, 'g2');

    const skip = planCharacterImport(library, parsed, { mode: 'existing-group', groupId: 'g2', sameIdPolicy: 'skip' }, { makeId: counterIds() });
    assert.equal(skip.summary.skipped, 1);
    assert.equal(skip.library.characters.find(c => c.id === '2').name, 'B');
    assert.equal(Object.hasOwn(skip.library.characters.find(c => c.id === '2'), 'groupId'), false);

    const both = planCharacterImport(library, parsed, { mode: 'existing-group', groupId: 'g2', sameIdPolicy: 'keep-both' }, { makeId: counterIds() });
    assert.equal(both.summary.keptBoth, 1);
    assert.equal(both.library.characters.length, 5);
    assert.equal(both.library.characters.find(c => c.id === '2').name, 'B');
    const copy = both.library.characters.find(c => c.name === 'B新 副本');
    assert.ok(copy);
    assert.notEqual(copy.id, '2');

    assert.throws(() => planCharacterImport(library, parsed, { mode: 'existing-group', groupId: 'nope' }), /不存在/);
});

test('new-group mode creates the group, rejects bad names, merges nothing silently', () => {
    const library = lib([char('1', 'A')], [{ id: 'g1', name: '甲' }]);
    const parsed = parsedOf([char('1', 'A新'), char('2', 'B')]);
    const plan = planCharacterImport(library, parsed, { mode: 'new-group', newGroupName: '导入组' }, { makeId: counterIds() });
    assert.equal(plan.summary.groupsCreated, 1);
    const groupId = plan.library.groups.find(g => g.name === '导入组').id;
    assert.deepEqual(plan.library.characters.map(c => [c.id, c.groupId]), [['1', groupId], ['2', groupId]]);
    assert.throws(() => planCharacterImport(library, parsed, { mode: 'new-group', newGroupName: '甲' }), /已存在/);
    assert.throws(() => planCharacterImport(library, parsed, { mode: 'new-group', newGroupName: '' }), /不能为空/);
    assert.throws(() => planCharacterImport(library, parsed, { mode: 'new-group', newGroupName: '未分组' }), /保留/);
    assert.throws(() => planCharacterImport(library, parsed, { mode: 'bogus' }), /模式无效/);
});

test('export then auto-import into the same library is idempotent', () => {
    const library = sampleLibrary();
    const payload = exportCharacters(library, { scope: 'all' });
    const plan = planCharacterImport(library, parseCharacterImport(payload), {}, { makeId: counterIds() });
    assert.equal(plan.summary.added, 0);
    assert.equal(plan.summary.replaced, 4);
    assert.deepEqual(plan.library, { characters: library.characters, groups: library.groups });
});

test('export from one library imported into another merges groups by name', () => {
    const source = sampleLibrary();
    const target = lib([char('x', 'X', { groupId: 'tg' })], [{ id: 'tg', name: '甲' }]);
    const payload = exportCharacters(source, { scope: 'all' });
    const plan = planCharacterImport(target, parseCharacterImport(payload), {}, { makeId: counterIds() });
    assert.deepEqual(plan.library.groups.map(g => g.name), ['甲', '乙']);
    const c3 = plan.library.characters.find(c => c.id === '3');
    assert.equal(c3.groupId, 'tg');
});

test('export files never carry the group switch, even when the local group is off', () => {
    const library = lib(
        [char('1', 'A', { groupId: 'g1' }), char('2', 'B', { groupId: 'g2' })],
        [{ id: 'g1', name: '甲', enabled: false }, { id: 'g2', name: '乙' }],
    );
    for (const request of [{ scope: 'all' }, { scope: 'group', groupId: 'g1' }, { scope: 'selection', ids: ['1', '2'] }]) {
        const exported = exportCharacters(library, request);
        assert.ok(exported.groups.length > 0);
        for (const group of exported.groups) {
            assert.deepEqual(Object.keys(group).sort(), ['id', 'name']);
            assert.equal(Object.hasOwn(group, 'enabled'), false);
        }
    }
    assert.equal(JSON.stringify(exportCharacters(library, { scope: 'all' }).groups).includes('enabled'), false);
});

test('parseCharacterImport ignores an enabled field on file groups', () => {
    const parsed = parseCharacterImport({
        type: CHARACTER_EXPORT_TYPE,
        version: 4,
        groups: [{ id: 'f1', name: '文件组', enabled: false }],
        characters: [char('a', 'A', { groupId: 'f1' })],
    }, { makeId: counterIds() });
    assert.deepEqual(parsed.groups, [{ id: 'f1', name: '文件组' }]);
    const plan = planCharacterImport(lib([]), parsed, {}, { makeId: counterIds() });
    assert.deepEqual(plan.library.groups.map(g => Object.hasOwn(g, 'enabled')), [false]);
});

test('import: groups created by the file start on; groups mapped to a local group keep the local switch', () => {
    const library = lib(
        [char('1', 'A', { groupId: 'g1' })],
        [{ id: 'g1', name: '主线', enabled: false }],
    );
    const parsed = parsedOf(
        [char('n1', 'N1', { groupId: 'fg1' }), char('n2', 'N2', { groupId: 'fg2' })],
        [{ id: 'fg1', name: '主线' }, { id: 'fg2', name: '新组', enabled: false }],
    );
    const plan = planCharacterImport(library, parsed, {}, { makeId: counterIds() });
    assert.equal(plan.summary.groupsCreated, 1);
    const [mapped, created] = plan.library.groups;
    assert.deepEqual(mapped, { id: 'g1', name: '主线', enabled: false }, 'existing closed group stays closed');
    assert.equal(Object.hasOwn(created, 'enabled'), false, 'new group has no enabled key (on)');
    assert.equal(isGroupEnabled(plan.library, created.id), true);
    // 新增进已关闭分组的角色自己仍是开的，但不计入有效启用
    assert.equal(plan.library.characters.find(c => c.id === 'n1').enabled, true);
    assert.equal(plan.summary.enabledAfter, 1, 'only n2 (new, on group) counts; 1 and n1 sit in the closed group');
    assert.equal(plan.summary.totalAfter, 3);
});

test('import: existing-group and new-group modes keep the local switch / start on', () => {
    const library = lib([], [{ id: 'g1', name: '关着', enabled: false }]);
    const parsed = parsedOf([char('a', 'A'), char('b', 'B')]);
    const into = planCharacterImport(library, parsed, { mode: 'existing-group', groupId: 'g1' }, { makeId: counterIds() });
    assert.equal(into.library.groups[0].enabled, false);
    assert.equal(into.summary.enabledAfter, 0);
    const fresh = planCharacterImport(library, parsed, { mode: 'new-group', newGroupName: '新建' }, { makeId: counterIds() });
    assert.equal(fresh.library.groups.length, 2);
    assert.equal(fresh.library.groups[0].enabled, false);
    assert.equal(Object.hasOwn(fresh.library.groups[1], 'enabled'), false);
    assert.equal(fresh.summary.enabledAfter, 2);
});

test('import: a same-id replacement keeps the local character state and a closed group', () => {
    const library = lib(
        [char('1', '旧', { groupId: 'g1', enabled: true })],
        [{ id: 'g1', name: '甲', enabled: false }],
    );
    const plan = planCharacterImport(library, parsedOf([char('1', '新', { enabled: false })]), {}, { makeId: counterIds() });
    const [one] = plan.library.characters;
    assert.equal(one.name, '新');
    assert.equal(one.groupId, 'g1');
    assert.equal(one.enabled, true);
    assert.equal(plan.library.groups[0].enabled, false);
});

test('import name-conflict warning ignores characters that are not effectively enabled', () => {
    const library = lib(
        [char('1', '阿璃', { groupId: 'g1' })],
        [{ id: 'g1', name: '甲', enabled: false }],
    );
    const parsed = parsedOf([char('2', '阿璃')]);
    const closed = planCharacterImport(library, parsed, {}, { makeId: counterIds() });
    assert.equal(closed.warnings.some(w => w.code === 'name-conflict'), false);
    const opened = planCharacterImport(setGroupEnabled(library, 'g1', true), parsed, {}, { makeId: counterIds() });
    assert.equal(opened.warnings.some(w => w.code === 'name-conflict'), true);
    const intoClosed = planCharacterImport(
        lib([char('1', '阿璃')], [{ id: 'g1', name: '甲', enabled: false }]),
        parsed, { mode: 'existing-group', groupId: 'g1' }, { makeId: counterIds() },
    );
    assert.equal(intoClosed.warnings.some(w => w.code === 'name-conflict'), false, 'new character lands in a closed group');
});

test('library functions never mutate their inputs', () => {
    const library = deepFreeze(sampleLibrary());
    const parsed = deepFreeze(parsedOf([char('1', 'A新'), char('zz', 'Z', { groupId: 'f' })], [{ id: 'f', name: '乙' }]));
    const make = counterIds();
    assert.doesNotThrow(() => {
        getGroupedView(library);
        getGroupSummary(library, 'g1');
        isGroupEnabled(library, 'g1');
        setGroupEnabled(library, 'g1', false);
        selectEnabledCharacters(library);
        createGroup(library, '新', { makeId: make });
        renameGroup(library, 'g1', '改');
        deleteGroup(library, 'g1');
        moveGroup(library, 'g1', 1);
        placeGroup(library, 'g2', 'g1');
        addCharacter(library, { name: 'N' }, { groupId: 'g1', makeId: make });
        setCharactersEnabled(library, ['1'], false);
        deleteCharacters(library, ['1']);
        moveCharacters(library, ['1'], { groupId: 'g1' });
        shiftCharacter(library, '4', -1);
        duplicateCharacters(library, ['1'], { makeId: make });
        exportCharacters(library, { scope: 'all' });
        planCharacterImport(library, parsed, {}, { makeId: make });
        planCharacterImport(library, parsed, { mode: 'new-group', newGroupName: 'N' }, { makeId: make });
        planCharacterImport(library, parsed, { mode: 'existing-group', groupId: 'g1', sameIdPolicy: 'keep-both' }, { makeId: make });
    });
});

// ───────────── 500 条与配方过滤 ─────────────

test('selectEnabledCharacters keeps only enabled characters', () => {
    const characters = [char('1', 'A'), char('2', 'B', { enabled: false }), char('3', 'C', { enabled: true })];
    assert.deepEqual(selectEnabledCharacters({ characters, groups: [] }).map(c => c.id), ['1', '3']);
    assert.deepEqual(selectEnabledCharacters(undefined), []);
    assert.equal(BACKEND_ENABLED_CHARACTER_LIMIT, 500);
});

test('the 500 backend cap counts only effectively enabled characters', () => {
    const many = Array.from({ length: 600 }, (_, i) => char(`c${i}`, `N${i}`, i < 300 ? { groupId: 'off' } : {}));
    const library = lib(many, [{ id: 'off', name: '关' }]);
    assert.equal(countEnabledCharacters(library), 600);
    const closed = setGroupEnabled(library, 'off', false);
    assert.equal(countEnabledCharacters(closed), 300);
    assert.equal(selectEnabledCharacters(closed).length, 300);
    assert.ok(selectEnabledCharacters(closed).length <= BACKEND_ENABLED_CHARACTER_LIMIT);
    assert.ok(selectEnabledCharacters(library).length > BACKEND_ENABLED_CHARACTER_LIMIT);
});

test('plan reports enabled count so callers can warn above the backend limit', () => {
    const many = Array.from({ length: 501 }, (_, i) => char(`c${i}`, `N${i}`));
    const asEnabled = planCharacterImport(lib([]), parsedOf(many), {}, { makeId: counterIds() });
    assert.equal(asEnabled.summary.enabledAfter, 501);
    const asDisabled = planCharacterImport(lib([]), parsedOf(many), { importNewAsDisabled: true }, { makeId: counterIds() });
    assert.equal(asDisabled.summary.enabledAfter, 0);
    assert.equal(asDisabled.summary.totalAfter, 501);
});

// ───────────── 导入数量上限与类型校验 ─────────────

const fileOf = (characters, groups = []) => ({ type: CHARACTER_EXPORT_TYPE, version: 4, groups, characters });

test('parseCharacterImport enforces the per-import character cap before doing any work', () => {
    assert.equal(MAX_IMPORT_CHARACTERS, 5000);
    const atLimit = Array.from({ length: MAX_IMPORT_CHARACTERS }, (_, i) => char(`c${i}`, `N${i}`));
    assert.equal(parseCharacterImport(fileOf(atLimit)).entries.length, MAX_IMPORT_CHARACTERS);
    // 最小角色约 14 字节，5MB 文件能塞下十几万条：用条目数而不是文件大小兜底。
    const over = Array.from({ length: MAX_IMPORT_CHARACTERS + 1 }, (_, i) => ({ name: `N${i}` }));
    assert.throws(() => parseCharacterImport(fileOf(over)), (error) => {
        assert.ok(error instanceof TypeError);
        assert.equal(error.message, '文件包含 5001 个角色，超过单次导入上限 5000');
        return true;
    });
    // 非对象条目也计入条目数。
    assert.throws(() => parseCharacterImport(fileOf(new Array(MAX_IMPORT_CHARACTERS + 1).fill(null))), /超过单次导入上限/);
});

test('parseCharacterImport skips entries whose text fields are not strings or numbers, with one summarized warning', () => {
    const bad = [
        { name: { evil: 1 } },
        { name: ['A'] },
        { name: true },
        char({ x: 1 }, 'IdObject'),
        char('t1', 'TypeArray', { type: ['girl'] }),
        char('t2', 'Appearance', { appearance: { tags: 'x' } }),
        char('t3', 'LegacyTags', { tags: false }),
        char('t4', 'Negative', { negativeTags: [] }),
        char('t5', 'Danbooru', { danbooruTag: true }),
        char('t6', 'GroupObj', { groupId: {} }),
        char('t7', 'AliasString', { aliases: 'not-an-array' }),
        char('t8', 'AliasElement', { aliases: ['ok', { a: 1 }] }),
        char('t9', 'AliasNull', { aliases: ['ok', null] }),
        char('t10', 'OutfitsString', { outfits: 'dress' }),
        char('t11', 'OutfitElement', { outfits: ['dress'] }),
        char('t12', 'OutfitField', { outfits: [{ name: { a: 1 }, tags: 'x' }] }),
        char('t13', 'CostumesObj', { costumes: { name: 'x' } }),
        char('t14', 'DynamicStatesNull', { dynamicStates: [null] }),
    ];
    const good = [
        char('g1', 'Good', { type: 'girl', aliases: ['a', 7], outfits: [{ name: '常服', tags: 'dress' }], dynamicStates: [] }),
        char('g2', 'NullsAreMissing', { type: null, appearance: undefined, negativeTags: null, aliases: null, outfits: null, groupId: null }),
        { name: 123, id: 456, appearance: 7 },
    ];
    const parsed = parseCharacterImport(fileOf([...bad.slice(0, 5), good[0], ...bad.slice(5), good[1], good[2]]));
    assert.equal(parsed.skipped, bad.length);
    assert.deepEqual(parsed.entries.map(entry => entry.character.name), ['Good', 'NullsAreMissing', '123']);
    const warnings = parsed.warnings.filter(item => item.code === 'invalid-field-type');
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0].count, bad.length);
    assert.match(warnings[0].message, new RegExp(String(bad.length)));
    const stored = JSON.stringify(parsed.entries.map(entry => entry.character));
    assert.equal(stored.includes('[object Object]'), false);
    // 数字按字符串处理。
    const numeric = parsed.entries[2].character;
    assert.equal(numeric.id, '456');
    assert.equal(numeric.appearance, '7');
    assert.deepEqual(parsed.entries[0].character.aliases, ['a', '7']);
    assert.deepEqual(parsed.entries[1].character.aliases, []);
});

test('parseCharacterImport ignores file groups whose name or id is not text', () => {
    const parsed = parseCharacterImport(fileOf(
        [char('a', 'A', { groupId: 'g-obj' }), char('b', 'B', { groupId: 'g-ok' })],
        [{ id: 'g-obj', name: { x: 1 } }, { id: ['g'], name: 'ArrayId' }, { id: 'g-ok', name: '正常组' }],
    ));
    assert.deepEqual(parsed.groups.map(group => group.name), ['正常组']);
    assert.equal(parsed.entries[0].groupName, '');
    assert.equal(parsed.entries[1].groupName, '正常组');
    const warning = parsed.warnings.find(item => item.code === 'invalid-group-field-type');
    assert.equal(warning.count, 2);
});

test('a file without type problems produces no invalid-field-type warning', () => {
    const parsed = parseCharacterImport(fileOf([char('a', 'A'), { id: 'b' }]));
    assert.equal(parsed.warnings.some(item => item.code === 'invalid-field-type'), false);
    assert.equal(parsed.skipped, 1);
});

test('storage normalization keeps its lenient behavior; only the import path rejects mismatched types', () => {
    // 已存储数据的规范化结果不能因为导入校验而改变。
    const stored = normalizeCharacter({ id: 'a', name: { x: 1 }, type: 5, appearance: ['x'], aliases: [1, null, ' b '] });
    assert.equal(stored.name, '[object Object]');
    assert.equal(stored.type, '5');
    assert.equal(stored.appearance, 'x');
    assert.deepEqual(stored.aliases, ['1', 'b']);
});

// ───────────── 导入放置：与逐个 splice 的旧实现行为等价，且线性 ─────────────

function indexAfterLastMemberReference(characters, groupId) {
    let last = -1;
    characters.forEach((character, index) => {
        if (String(character.groupId || '') === groupId) last = index;
    });
    return last < 0 ? characters.length : last + 1;
}

function placeByRepeatedSplice(rest, placements) {
    const result = [...rest];
    for (const { character, groupId } of placements) {
        const bare = { ...character };
        delete bare.groupId;
        result.splice(indexAfterLastMemberReference(result, groupId), 0, groupId ? { ...bare, groupId } : bare);
    }
    return result;
}

test('placeCharactersAfterGroupMembers appends to the last member of each group, empty groups at the end in first-seen order', () => {
    const rest = [
        { id: 'u1' }, { id: 'a1', groupId: 'A' }, { id: 'u2' }, { id: 'a2', groupId: 'A' }, { id: 'b1', groupId: 'B' }, { id: 'u3' },
    ];
    const placements = [
        { character: { id: 'n-z1' }, groupId: 'Z' },
        { character: { id: 'n-a1' }, groupId: 'A' },
        { character: { id: 'n-u1' }, groupId: '' },
        { character: { id: 'n-y1' }, groupId: 'Y' },
        { character: { id: 'n-a2', groupId: 'stale' }, groupId: 'A' },
        { character: { id: 'n-z2' }, groupId: 'Z' },
        { character: { id: 'n-b1' }, groupId: 'B' },
    ];
    const result = placeCharactersAfterGroupMembers(rest, placements);
    assert.deepEqual(result.map(item => item.id), [
        'u1', 'a1', 'u2', 'a2', 'n-a1', 'n-a2', 'b1', 'n-b1', 'u3', 'n-u1', 'n-z1', 'n-z2', 'n-y1',
    ]);
    assert.equal(result.find(item => item.id === 'n-a2').groupId, 'A');
    assert.equal(Object.hasOwn(result.find(item => item.id === 'n-u1'), 'groupId'), false);
    assert.equal(rest.length, 6);
    assert.deepEqual(placeCharactersAfterGroupMembers(rest, []).map(item => item.id), rest.map(item => item.id));
});

test('placeCharactersAfterGroupMembers matches the repeated-splice reference on random inputs', () => {
    let seed = 20240607;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
    const pickIndex = n => Math.floor(random() * n);
    const groupPool = ['', 'g1', 'g2', 'g3', 'g4', 'ghost'];
    for (let round = 0; round < 400; round += 1) {
        const rest = Array.from({ length: pickIndex(18) }, (_, i) => {
            const groupId = groupPool[pickIndex(groupPool.length)];
            return groupId ? { id: `r${i}`, groupId } : { id: `r${i}` };
        });
        const placements = Array.from({ length: pickIndex(18) }, (_, i) => ({
            character: { id: `p${i}`, ...(random() < 0.3 ? { groupId: 'stale' } : {}) },
            groupId: groupPool[pickIndex(groupPool.length - 1)],
        }));
        assert.deepEqual(
            placeCharactersAfterGroupMembers(rest, placements),
            placeByRepeatedSplice(rest, placements),
            `round ${round}`,
        );
    }
});

function bulkParsed(count, { grouped = false } = {}) {
    const entries = Array.from({ length: count }, (_, i) => ({
        character: normalizeCharacter({ id: `bulk-${i}`, name: `角色${i}`, aliases: [`别名${i}`], appearance: 'x' }),
        fields: ['name', 'aliases', 'appearance'],
        groupName: grouped ? `组${i % 10}` : '',
        duplicate: false,
    }));
    return { version: 4, groups: [], entries, skipped: 0, warnings: [] };
}

test('planCharacterImport stays fast for 20000 entries in every placement mode (was quadratic)', () => {
    const library = lib([char('e1', '本地甲'), char('e2', '本地乙', { enabled: false })]);
    const parsed = bulkParsed(20000, { grouped: true });
    const scenarios = [
        {},
        { mode: 'new-group', newGroupName: '批量' },
        { mode: 'existing-group', groupId: '' },
    ];
    for (const options of scenarios) {
        const started = performance.now();
        const plan = planCharacterImport(library, parsed, options, { makeId: counterIds() });
        const elapsed = performance.now() - started;
        assert.equal(plan.summary.added, 20000);
        assert.equal(plan.summary.totalAfter, 20002);
        assert.ok(elapsed < 1500, `${JSON.stringify(options)} took ${Math.round(elapsed)}ms`);
    }
});

test('keep-both import does not rescan the whole library for every copy name', () => {
    const existing = Array.from({ length: 5000 }, (_, i) => char(`bulk-${i}`, `角色${i}`));
    const library = lib(existing);
    const parsed = bulkParsed(5000);
    const started = performance.now();
    const plan = planCharacterImport(library, parsed, { mode: 'existing-group', groupId: '', sameIdPolicy: 'keep-both' }, { makeId: counterIds() });
    const elapsed = performance.now() - started;
    assert.equal(plan.summary.keptBoth, 5000);
    assert.equal(plan.library.characters.length, 10000);
    const names = plan.library.characters.map(character => character.name);
    assert.equal(new Set(names).size, 10000);
    assert.equal(names[5000], '角色0 副本');
    assert.ok(elapsed < 1500, `took ${Math.round(elapsed)}ms`);
});

test('keep-both copies avoid names added earlier in the same import and names already in the library', () => {
    const library = lib([char('e1', 'Hero'), char('e2', 'Hero'), char('e3', 'Hero 副本 2')]);
    const parsed = parsedOf([char('e1', 'Hero'), char('e2', 'Hero')]);
    const plan = planCharacterImport(library, parsed, { mode: 'existing-group', groupId: '', sameIdPolicy: 'keep-both' }, { makeId: counterIds() });
    const names = plan.library.characters.map(character => character.name);
    assert.deepEqual(names, ['Hero', 'Hero', 'Hero 副本 2', 'Hero 副本', 'Hero 副本 3']);
});
