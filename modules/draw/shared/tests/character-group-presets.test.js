import test from 'node:test';
import assert from 'node:assert/strict';

import { countEnabledCharacters, isGroupEnabled, normalizeCharacterLibrary } from '../character-library.js';
import {
    MAX_BINDING_NAME_LENGTH,
    MAX_GROUP_PRESETS,
    MAX_PRESET_BINDINGS,
    MAX_PRESET_NAME_LENGTH,
    addBinding,
    captureGroupStatesFromLibrary,
    captureGroupPresetReferences,
    restoreGroupPresetReferences,
    computePresetApplication,
    createPreset,
    deletePreset,
    duplicatePreset,
    findMatchingPreset,
    findPresetsBoundToAvatar,
    getPresetGroupRows,
    isValidGroupKey,
    movePreset,
    normalizeBinding,
    normalizeBindings,
    normalizeGroupPresetApplied,
    normalizeGroupPresetState,
    normalizeGroupPresets,
    normalizeGroupStates,
    placePreset,
    planPresetApplication,
    removeBinding,
    renamePreset,
    setGroupState,
    setGroupStates,
    shouldApplyPreset,
} from '../character-group-presets.js';

test('restoring deleted-group references rejects a concurrently edited or deleted preset without mutation', () => {
    const original = [
        { id: 'p1', name: 'First', revision: 1, groupStates: { g1: false }, bindings: [] },
        { id: 'p2', name: 'Second', revision: 2, groupStates: { g1: true }, bindings: [] },
    ];
    const snapshot = captureGroupPresetReferences(original, 'g1');
    for (const current of [
        [{ ...original[0], groupStates: {} }],
        [{ ...original[0], groupStates: {} }, { ...original[1], groupStates: {}, revision: 3 }],
    ]) {
        const before = structuredClone(current);
        assert.throws(() => restoreGroupPresetReferences(current, snapshot), TypeError);
        assert.deepEqual(current, before);
    }
});

function counterIds() {
    let n = 0;
    return prefix => `${prefix}-t${++n}`;
}

const GROUP_IDS = ['gA', 'gB', 'gC', 'gD'];

// 分组 A B C D 各两个角色，另有两个未分组角色；全部启用。
function makeLibrary(overrides = {}) {
    const characters = [];
    for (const groupId of GROUP_IDS) {
        for (const n of [1, 2]) {
            characters.push({ id: `${groupId}-${n}`, name: `${groupId}${n}`, groupId, ...overrides[`${groupId}-${n}`] });
        }
    }
    characters.push({ id: 'u-1', name: 'U1', ...overrides['u-1'] });
    characters.push({ id: 'u-2', name: 'U2', ...overrides['u-2'] });
    const normalized = normalizeCharacterLibrary({
        characters,
        groups: GROUP_IDS.map(id => ({ id, name: id.slice(1) })),
    });
    return { characters: normalized.characters, groups: normalized.groups };
}

// 角色自己的 enabled（嵌套模型里预设永远不应该改它）
function enabledMap(library) {
    return Object.fromEntries(library.characters.map(character => [character.id, character.enabled]));
}

// 各分组当前的开关
function switchMap(library) {
    return Object.fromEntries(library.groups.map(group => [group.id, isGroupEnabled(library, group.id)]));
}

function deepFreeze(value) {
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
        Object.freeze(value);
        Object.values(value).forEach(deepFreeze);
    }
    return value;
}

function bind(avatar, name = '') {
    return { type: 'character', avatar, name };
}

// 预设数组：alpha 开 AB 关 CD 绑角色卡 1；beta 开 ACD 关 B 绑角色卡 2。
function makePresets() {
    let presets = [];
    let id;
    ({ presets, presetId: id } = createPreset(presets, 'alpha', { makeId: counterIds() }));
    presets = setGroupStates(presets, id, { gA: true, gB: true, gC: false, gD: false });
    presets = addBinding(presets, id, bind('card1.png', '卡一'));
    ({ presets, presetId: id } = createPreset(presets, 'beta', { makeId: () => 'gpreset-beta' }));
    presets = setGroupStates(presets, id, { gA: true, gB: false, gC: true, gD: true });
    presets = addBinding(presets, id, bind('card2.png', '卡二'));
    return presets;
}

test('normalizeGroupStates accepts only own boolean values for valid keys', () => {
    assert.deepEqual(normalizeGroupStates({ gA: true, gB: false, gC: 'true', gD: 1, gE: null }), {
        gA: true,
        gB: false,
    });
    assert.deepEqual(normalizeGroupStates(undefined), {});
    assert.deepEqual(normalizeGroupStates([true, false]), {});
    assert.deepEqual(normalizeGroupStates('x'), {});
    assert.deepEqual(normalizeGroupStates({ '': true, ['x'.repeat(200)]: true, ok: true }), { ok: true });
});

test('normalizeGroupStates drops keys of deleted groups when groupIds is given', () => {
    const raw = { gA: true, gGone: false };
    assert.deepEqual(normalizeGroupStates(raw, { groupIds: ['gA', 'gB'] }), { gA: true });
    assert.deepEqual(normalizeGroupStates(raw, { groupIds: [] }), {});
    // 不给 groupIds 时不按库过滤
    assert.deepEqual(normalizeGroupStates(raw), raw);
});

test('the legacy ungrouped key from phase A presets is always dropped (ungrouped has no switch)', () => {
    const raw = { gA: true, __ungrouped__: false };
    assert.deepEqual(normalizeGroupStates(raw), { gA: true });
    assert.deepEqual(normalizeGroupStates(raw, { groupIds: ['gA', '__ungrouped__'] }), { gA: true });
    assert.equal(isValidGroupKey('__ungrouped__'), false);
    assert.equal(isValidGroupKey('gA'), true);
    const state = normalizeGroupPresetState({ presets: [{ id: 'p1', name: 'old', groupStates: raw }] }, { groupIds: ['gA'] });
    assert.deepEqual(state.presets[0].groupStates, { gA: true });
    const created = createPreset([], 'new', { groupStates: raw, makeId: counterIds() });
    assert.deepEqual(created.presets[0].groupStates, { gA: true });
    assert.throws(() => setGroupState(makePresets(), makePresets()[0].id, '__ungrouped__', true), /分组无效/);
    assert.deepEqual(setGroupStates(makePresets(), makePresets()[0].id, { __ungrouped__: false })[0].groupStates, makePresets()[0].groupStates);
});

test('normalizeGroupStates rejects prototype-pollution keys and never pollutes Object.prototype', () => {
    const raw = JSON.parse('{"__proto__":true,"constructor":false,"prototype":true,"polluted":true,"gA":true}');
    const result = normalizeGroupStates(raw);
    assert.deepEqual(result, { polluted: true, gA: true });
    assert.equal(Object.hasOwn(result, '__proto__'), false);
    assert.equal(Object.getPrototypeOf(result), Object.prototype);
    assert.equal(({}).polluted, undefined);
    const merged = normalizeGroupPresets([{ name: 'p', groupStates: raw }]);
    assert.deepEqual(merged[0].groupStates, { polluted: true, gA: true });
    assert.equal(({}).polluted, undefined);
    assert.throws(() => setGroupState(makePresets(), makePresets()[0].id, '__proto__', true), /分组无效/);
    assert.throws(() => setGroupState(makePresets(), makePresets()[0].id, 'constructor', true), /分组无效/);
});

test('normalizeBinding validates type and avatar and treats name as display text only', () => {
    assert.deepEqual(normalizeBinding({ avatar: 'a.png', name: ' 阿璃 ' }), { type: 'character', avatar: 'a.png', name: '阿璃' });
    assert.deepEqual(normalizeBinding({ type: 'character', avatar: 'a.png' }), { type: 'character', avatar: 'a.png', name: '' });
    assert.equal(normalizeBinding({ type: 'worldbook', avatar: 'a.png' }), null);
    assert.equal(normalizeBinding({ avatar: '' }), null);
    assert.equal(normalizeBinding({ avatar: '   ' }), null);
    assert.equal(normalizeBinding({ avatar: 12 }), null);
    assert.equal(normalizeBinding({ avatar: 'x'.repeat(300) }), null);
    assert.equal(normalizeBinding(null), null);
    assert.equal(normalizeBinding('a.png'), null);
    assert.equal(normalizeBinding({ avatar: 'a.png', name: { evil: true } }).name, '');
    assert.equal(Array.from(normalizeBinding({ avatar: 'a.png', name: 'n'.repeat(200) }).name).length, MAX_BINDING_NAME_LENGTH);
});

test('normalizeBindings dedupes by avatar, keeps order and caps the count', () => {
    assert.deepEqual(normalizeBindings([bind('a.png', '1'), bind('b.png'), bind('a.png', '2'), { avatar: '' }, 5]), [
        bind('a.png', '1'),
        bind('b.png'),
    ]);
    assert.deepEqual(normalizeBindings('nope'), []);
    const many = Array.from({ length: MAX_PRESET_BINDINGS + 10 }, (_, n) => bind(`c${n}.png`));
    assert.equal(normalizeBindings(many).length, MAX_PRESET_BINDINGS);
});

test('normalizeGroupPresets fills ids, dedupes ids and names, defaults revision and filters content', () => {
    const presets = normalizeGroupPresets([
        { id: 'p1', name: ' 甲 ', revision: 3, groupStates: { gA: true, gGone: true }, bindings: [bind('a.png')] },
        { id: 'p1', name: '甲' },
        { name: '' },
        { id: 'p4', name: 12, revision: 0 },
        { id: 'p5', name: '乙', revision: '7' },
        null,
        'junk',
        [],
    ], { groupIds: ['gA'], makeId: counterIds() });
    assert.deepEqual(presets.map(p => p.id), ['p1', 'gpreset-t1', 'gpreset-t2', 'p4', 'p5']);
    assert.deepEqual(presets.map(p => p.name), ['甲', '甲 2', '未命名预设', '未命名预设 2', '乙']);
    assert.deepEqual(presets.map(p => p.revision), [3, 1, 1, 1, 1]);
    assert.deepEqual(presets[0].groupStates, { gA: true });
    assert.deepEqual(presets[0].bindings, [bind('a.png')]);
    assert.deepEqual(normalizeGroupPresets(undefined), []);
    assert.deepEqual(normalizeGroupPresets({ 0: { name: 'x' } }), []);
});

test('normalizeGroupPresets caps the count, truncates names and is idempotent', () => {
    const raw = Array.from({ length: MAX_GROUP_PRESETS + 5 }, (_, n) => ({ id: `p${n}`, name: `预设${n}` }));
    assert.equal(normalizeGroupPresets(raw).length, MAX_GROUP_PRESETS);
    const longName = normalizeGroupPresets([{ id: 'x', name: '长'.repeat(100) }, { id: 'y', name: '长'.repeat(100) }]);
    assert.ok(longName.every(p => Array.from(p.name).length <= MAX_PRESET_NAME_LENGTH));
    assert.notEqual(longName[0].name, longName[1].name);
    const once = normalizeGroupPresets(makePresets());
    assert.deepEqual(normalizeGroupPresets(once), once);
});

test('normalizeGroupPresetApplied requires an existing preset and a well-formed record', () => {
    const presets = [{ id: 'p1', name: 'a', revision: 2, groupStates: {}, bindings: [] }];
    assert.deepEqual(normalizeGroupPresetApplied({ presetId: 'p1', revision: 2, appliedAt: 1234.9 }, presets), {
        presetId: 'p1', revision: 2, appliedAt: 1234,
    });
    assert.equal(normalizeGroupPresetApplied({ presetId: 'gone', revision: 1 }, presets), null);
    assert.equal(normalizeGroupPresetApplied(null, presets), null);
    assert.equal(normalizeGroupPresetApplied('p1', presets), null);
    assert.equal(normalizeGroupPresetApplied({ presetId: '', revision: 1 }, presets), null);
    assert.deepEqual(normalizeGroupPresetApplied({ presetId: 'p1', revision: 'x', appliedAt: 'x' }, presets), {
        presetId: 'p1', revision: 1, appliedAt: 0,
    });
});

test('normalizeGroupPresetState clears dangling groups and the record of a deleted preset', () => {
    const state = normalizeGroupPresetState({
        presets: [{ id: 'p1', name: 'a', groupStates: { gA: true, gGone: false } }],
        applied: { presetId: 'p1', revision: 1, appliedAt: 5 },
    }, { groupIds: ['gA'] });
    assert.deepEqual(state.presets[0].groupStates, { gA: true });
    assert.equal(state.applied.presetId, 'p1');
    assert.equal(normalizeGroupPresetState({ presets: [], applied: { presetId: 'p1', revision: 1 } }).applied, null);
});

test('createPreset validates the name, caps the count and appends at lowest priority', () => {
    let { presets, presetId } = createPreset([], '  alpha  ', {
        groupStates: { gA: true, gX: 'yes' },
        bindings: [bind('a.png'), bind('a.png')],
        makeId: counterIds(),
    });
    assert.equal(presetId, 'gpreset-t1');
    assert.deepEqual(presets[0], {
        id: 'gpreset-t1', name: 'alpha', revision: 1, groupStates: { gA: true }, bindings: [bind('a.png')],
    });
    ({ presets } = createPreset(presets, 'beta'));
    assert.deepEqual(presets.map(p => p.name), ['alpha', 'beta']);
    assert.throws(() => createPreset(presets, '   '), /不能为空/);
    assert.throws(() => createPreset(presets, undefined), /不能为空/);
    assert.throws(() => createPreset(presets, 42), /不能为空/);
    assert.throws(() => createPreset(presets, 'ALPHA'), /已存在/);
    assert.throws(() => createPreset(presets, 'x'.repeat(MAX_PRESET_NAME_LENGTH + 1)), /不能超过/);
    let full = [];
    for (let n = 0; n < MAX_GROUP_PRESETS; n += 1) ({ presets: full } = createPreset(full, `p${n}`));
    assert.throws(() => createPreset(full, 'one more'), /不能超过/);
});

test('createPreset keeps the input array untouched', () => {
    const before = makePresets();
    const snapshot = structuredClone(before);
    createPreset(before, 'gamma');
    assert.deepEqual(before, snapshot);
});

test('renamePreset validates, does not bump revision, and is a no-op for the same name', () => {
    const presets = makePresets();
    const [alpha, beta] = presets;
    const renamed = renamePreset(presets, alpha.id, ' 阿尔法 ');
    assert.equal(renamed[0].name, '阿尔法');
    assert.equal(renamed[0].revision, alpha.revision);
    assert.equal(renamed[1], beta);
    assert.equal(renamePreset(presets, alpha.id, 'alpha'), presets);
    assert.equal(renamePreset(presets, alpha.id, 'ALPHA')[0].name, 'ALPHA');
    assert.throws(() => renamePreset(presets, alpha.id, 'beta'), /已存在/);
    assert.throws(() => renamePreset(presets, alpha.id, ''), /不能为空/);
    assert.throws(() => renamePreset(presets, 'nope', 'x'), /预设不存在/);
});

test('deletePreset removes only the target and rejects unknown ids', () => {
    const presets = makePresets();
    assert.deepEqual(deletePreset(presets, presets[0].id).map(p => p.name), ['beta']);
    assert.throws(() => deletePreset(presets, 'nope'), /预设不存在/);
});

test('duplicatePreset copies content deeply right after the source with a unique name', () => {
    const presets = makePresets();
    const { presets: next, presetId } = duplicatePreset(presets, presets[0].id, { makeId: counterIds() });
    assert.deepEqual(next.map(p => p.name), ['alpha', 'alpha 副本', 'beta']);
    const copy = next[1];
    assert.equal(copy.id, presetId);
    assert.notEqual(copy.id, presets[0].id);
    assert.equal(copy.revision, 1);
    assert.deepEqual(copy.groupStates, presets[0].groupStates);
    assert.deepEqual(copy.bindings, presets[0].bindings);
    assert.notEqual(copy.groupStates, presets[0].groupStates);
    assert.notEqual(copy.bindings[0], presets[0].bindings[0]);
    const again = duplicatePreset(next, presets[0].id).presets;
    assert.equal(again[1].name, 'alpha 副本 2');
    assert.throws(() => duplicatePreset(presets, 'nope'), /预设不存在/);
    let full = [];
    for (let n = 0; n < MAX_GROUP_PRESETS; n += 1) ({ presets: full } = createPreset(full, `p${n}`));
    assert.throws(() => duplicatePreset(full, full[0].id), /不能超过/);
    const longName = createPreset([], '长'.repeat(MAX_PRESET_NAME_LENGTH)).presets;
    assert.ok(Array.from(duplicatePreset(longName, longName[0].id).presets[1].name).length <= MAX_PRESET_NAME_LENGTH);
});

test('setGroupState sets, clears, bumps revision on change only and validates input', () => {
    const presets = makePresets();
    const id = presets[0].id;
    const snapshot = structuredClone(presets);
    const flipped = setGroupState(presets, id, 'gC', true);
    assert.equal(flipped[0].groupStates.gC, true);
    assert.equal(flipped[0].revision, presets[0].revision + 1);
    assert.deepEqual(presets, snapshot);
    assert.equal(setGroupState(presets, id, 'gC', false), presets);
    const cleared = setGroupState(presets, id, 'gC', null);
    assert.equal(Object.hasOwn(cleared[0].groupStates, 'gC'), false);
    assert.equal(cleared[0].revision, presets[0].revision + 1);
    assert.equal(setGroupState(presets, id, 'gNotSet', null), presets);
    assert.throws(() => setGroupState(presets, id, 'gA', 'true'), /true、false 或 null/);
    assert.throws(() => setGroupState(presets, id, 'gA', undefined), /true、false 或 null/);
    assert.throws(() => setGroupState(presets, id, '', true), /分组无效/);
    assert.throws(() => setGroupState(presets, id, 'gGone', true, { groupIds: GROUP_IDS }), /分组不存在/);
    assert.equal(setGroupState(presets, id, 'gA', false, { groupIds: GROUP_IDS })[0].groupStates.gA, false);
    assert.throws(() => setGroupState(presets, 'nope', 'gA', true), /预设不存在/);
});

test('setGroupStates merges by default, replaces on request and ignores invalid entries', () => {
    const presets = makePresets();
    const id = presets[0].id;
    const merged = setGroupStates(presets, id, { gC: true, gX: 'bad' });
    assert.deepEqual(merged[0].groupStates, { gA: true, gB: true, gC: true, gD: false });
    assert.equal(merged[0].revision, presets[0].revision + 1);
    const replaced = setGroupStates(presets, id, { gD: true }, { replace: true });
    assert.deepEqual(replaced[0].groupStates, { gD: true });
    assert.equal(setGroupStates(presets, id, { gA: true }), presets);
    assert.equal(setGroupStates(presets, id, presets[0].groupStates, { replace: true }), presets);
    assert.deepEqual(setGroupStates(presets, id, { gA: false, gGone: true }, { groupIds: GROUP_IDS })[0].groupStates.gA, false);
    assert.equal(Object.hasOwn(setGroupStates(presets, id, { gGone: true }, { groupIds: GROUP_IDS, replace: false })[0].groupStates, 'gGone'), false);
});

test('addBinding / removeBinding dedupe, update display names without bumping, and respect the cap', () => {
    const presets = makePresets();
    const id = presets[0].id;
    const revision = presets[0].revision;
    const added = addBinding(presets, id, bind('card9.png', '新'));
    assert.deepEqual(added[0].bindings.map(b => b.avatar), ['card1.png', 'card9.png']);
    assert.equal(added[0].revision, revision + 1);
    assert.equal(addBinding(added, id, bind('card9.png', '新')), added);
    assert.equal(addBinding(added, id, bind('card9.png')), added);
    const renamed = addBinding(added, id, bind('card9.png', '新名字'));
    assert.equal(renamed[0].bindings[1].name, '新名字');
    assert.equal(renamed[0].revision, added[0].revision);
    assert.throws(() => addBinding(presets, id, { avatar: '' }), /绑定无效/);
    assert.throws(() => addBinding(presets, id, { type: 'worldbook', avatar: 'x' }), /绑定无效/);
    assert.throws(() => addBinding(presets, 'nope', bind('x.png')), /预设不存在/);
    // 同一角色卡可绑定到多个预设
    const both = addBinding(presets, presets[1].id, bind('card1.png'));
    assert.deepEqual(findPresetsBoundToAvatar(both, 'card1.png').map(p => p.name), ['alpha', 'beta']);

    const removed = removeBinding(added, id, { avatar: 'card1.png' });
    assert.deepEqual(removed[0].bindings.map(b => b.avatar), ['card9.png']);
    assert.equal(removed[0].revision, added[0].revision + 1);
    assert.equal(removeBinding(added, id, { avatar: 'ghost.png' }), added);
    assert.equal(removeBinding(added, id, { type: 'worldbook', avatar: 'card1.png' }), added);

    let full = presets;
    for (let n = 0; n < MAX_PRESET_BINDINGS - 1; n += 1) full = addBinding(full, id, bind(`f${n}.png`));
    assert.equal(full[0].bindings.length, MAX_PRESET_BINDINGS);
    assert.throws(() => addBinding(full, id, bind('overflow.png')), /最多绑定/);
});

test('movePreset and placePreset change priority and keep identity when nothing moves', () => {
    const presets = makePresets();
    const [alpha, beta] = presets;
    assert.deepEqual(movePreset(presets, beta.id, -1).map(p => p.id), [beta.id, alpha.id]);
    assert.equal(movePreset(presets, alpha.id, -1), presets);
    assert.equal(movePreset(presets, beta.id, 1), presets);
    assert.deepEqual(placePreset(presets, beta.id, alpha.id).map(p => p.id), [beta.id, alpha.id]);
    assert.deepEqual(placePreset(presets, alpha.id).map(p => p.id), [beta.id, alpha.id]);
    assert.equal(placePreset(presets, alpha.id, alpha.id), presets);
    assert.equal(placePreset(presets, beta.id), presets);
    assert.throws(() => movePreset(presets, 'nope', 1), /预设不存在/);
    assert.throws(() => placePreset(presets, 'nope'), /预设不存在/);
});

test('findMatchingPreset: single chat, group chat, multiple matches and no match', () => {
    const presets = makePresets();
    assert.equal(findMatchingPreset(presets, ['card1.png']).name, 'alpha');
    assert.equal(findMatchingPreset(presets, ['card2.png']).name, 'beta');
    assert.equal(findMatchingPreset(presets, ['other.png']), null);
    assert.equal(findMatchingPreset(presets, []), null);
    assert.equal(findMatchingPreset(presets, undefined), null);
    assert.equal(findMatchingPreset([], ['card1.png']), null);
    // 群聊：任一成员命中即可
    assert.equal(findMatchingPreset(presets, ['x.png', 'card2.png', 'y.png']).name, 'beta');
    // 群里同时有两个预设的角色卡：数组靠前者优先，调整顺序后改变
    assert.equal(findMatchingPreset(presets, ['card2.png', 'card1.png']).name, 'alpha');
    assert.equal(findMatchingPreset(movePreset(presets, presets[1].id, -1), ['card2.png', 'card1.png']).name, 'beta');
    // 一个角色卡绑定多个预设：仍按数组顺序
    const shared = addBinding(presets, presets[1].id, bind('card1.png'));
    assert.equal(findMatchingPreset(shared, ['card1.png']).name, 'alpha');
    assert.equal(findMatchingPreset(movePreset(shared, shared[1].id, -1), ['card1.png']).name, 'beta');
    // 精确匹配：不做大小写 / 前缀模糊
    assert.equal(findMatchingPreset(presets, ['CARD1.png']), null);
    assert.equal(findMatchingPreset(presets, ['card1']), null);
    // 脏数据不抛
    assert.equal(findMatchingPreset([null, {}, { bindings: 'x' }, { bindings: [null, { type: 'character' }] }], ['card1.png']), null);
    assert.equal(findMatchingPreset(presets, [null, 12, '', 'card1.png']).name, 'alpha');
    // 非 character 类型的绑定不参与匹配
    assert.equal(findMatchingPreset([{ bindings: [{ type: 'worldbook', avatar: 'card1.png' }] }], ['card1.png']), null);
});

test('shouldApplyPreset is true only for a new preset or a changed revision', () => {
    const preset = { id: 'p1', revision: 2 };
    assert.equal(shouldApplyPreset(null, preset), true);
    assert.equal(shouldApplyPreset(undefined, preset), true);
    assert.equal(shouldApplyPreset({ presetId: 'p1', revision: 2 }, preset), false);
    assert.equal(shouldApplyPreset({ presetId: 'p2', revision: 2 }, preset), true);
    assert.equal(shouldApplyPreset({ presetId: 'p1', revision: 1 }, preset), true);
    assert.equal(shouldApplyPreset(null, null), false);
});

test('computePresetApplication: alpha opens AB and closes CD, beta opens ACD and closes B', () => {
    const [alpha, beta] = makePresets();
    const library = makeLibrary();
    const afterAlpha = computePresetApplication(library, alpha);
    assert.equal(afterAlpha.changed, true);
    assert.equal(afterAlpha.changedCount, 2);
    assert.deepEqual(afterAlpha.affected, [
        { key: 'gC', enabled: false },
        { key: 'gD', enabled: false },
    ]);
    assert.deepEqual(switchMap(afterAlpha.library), { gA: true, gB: true, gC: false, gD: false });
    const afterBeta = computePresetApplication(afterAlpha.library, beta);
    assert.deepEqual(switchMap(afterBeta.library), { gA: true, gB: false, gC: true, gD: true });
    assert.equal(afterBeta.changedCount, 3);
    assert.deepEqual(afterBeta.affected, [
        { key: 'gB', enabled: false },
        { key: 'gC', enabled: true },
        { key: 'gD', enabled: true },
    ]);
});

test('computePresetApplication only changes group switches: no character is touched, own states survive a close and re-open', () => {
    const library = makeLibrary({ 'gC-1': { enabled: true }, 'gC-2': { enabled: false }, 'gD-1': { enabled: false } });
    const ownBefore = enabledMap(library);
    const closed = computePresetApplication(library, { groupStates: { gC: false, gD: false } });
    assert.equal(closed.library.characters, library.characters, 'same characters array reference');
    assert.deepEqual(enabledMap(closed.library), ownBefore);
    assert.equal(countEnabledCharacters(closed.library), 6, 'only A, B and the ungrouped characters take part');
    const reopened = computePresetApplication(closed.library, { groupStates: { gC: true, gD: true } });
    assert.deepEqual(switchMap(reopened.library), { gA: true, gB: true, gC: true, gD: true });
    assert.deepEqual(enabledMap(reopened.library), ownBefore, 'character 1 stays on, character 2 stays off');
    assert.equal(reopened.library.characters.find(c => c.id === 'gC-1').enabled, true);
    assert.equal(reopened.library.characters.find(c => c.id === 'gC-2').enabled, false);
});

test('computePresetApplication leaves unmentioned groups, ungrouped characters, order and names untouched, and never mutates input', () => {
    const library = makeLibrary({ 'gA-1': { enabled: false }, 'gC-2': { enabled: false }, 'u-1': { enabled: false } });
    const snapshot = structuredClone(library);
    const preset = { id: 'p', name: 'p', revision: 1, groupStates: { gA: true, gB: false }, bindings: [] };
    deepFreeze(library);
    const result = computePresetApplication(library, preset);
    assert.deepEqual(library, snapshot);
    assert.deepEqual(switchMap(result.library), { gA: true, gB: false, gC: true, gD: true });
    assert.deepEqual(enabledMap(result.library), enabledMap(library));
    assert.deepEqual(result.library.groups.map(g => [g.id, g.name]), library.groups.map(g => [g.id, g.name]));
    assert.equal(result.library.characters, library.characters);
    // 没动的分组保持同一引用
    assert.equal(result.library.groups[0], library.groups[0]);
    assert.equal(result.library.groups[2], library.groups[2]);
});

test('computePresetApplication reports no change when every switch already matches', () => {
    const library = makeLibrary();
    const already = computePresetApplication(library, { groupStates: { gA: true, gB: true } });
    assert.equal(already.changed, false);
    assert.equal(already.changedCount, 0);
    assert.equal(already.library, library);
    assert.deepEqual(already.affected, []);

    const empty = computePresetApplication(library, { groupStates: {} });
    assert.equal(empty.changed, false);
    assert.equal(empty.library, library);
    assert.equal(computePresetApplication(library, null).changed, false);
    assert.equal(computePresetApplication(library, { groupStates: 'bad' }).changed, false);
});

test('computePresetApplication ignores keys of missing groups, the legacy ungrouped key and non-boolean values', () => {
    const library = {
        groups: [{ id: 'gA', name: 'A' }],
        characters: [
            { id: 'a', name: 'a', groupId: 'gA', enabled: true },
            { id: 'orphan', name: 'orphan', groupId: 'ghost', enabled: true },
            { id: 'u', name: 'u', enabled: true },
        ],
    };
    const result = computePresetApplication(library, { groupStates: { ghost: false, gA: false, __ungrouped__: false } });
    assert.deepEqual(result.library.groups, [{ id: 'gA', name: 'A', enabled: false }]);
    assert.deepEqual(result.affected, [{ key: 'gA', enabled: false }]);
    assert.deepEqual(result.library.characters.map(c => c.enabled), [true, true, true], 'ungrouped / dangling characters are never touched');
    assert.equal(computePresetApplication(library, { groupStates: { ghost: false } }).changed, false);
    assert.equal(computePresetApplication(library, { groupStates: { __ungrouped__: false } }).changed, false);
    // 值不是布尔 / 原型链上的键不生效
    assert.equal(computePresetApplication(library, { groupStates: { gA: 'false' } }).changed, false);
    assert.equal(computePresetApplication(library, { groupStates: Object.create({ gA: false }) }).changed, false);
});

test('a library group whose id is the legacy ungrouped key cannot be targeted by a preset', () => {
    const library = { groups: [{ id: '__ungrouped__', name: '冲突' }, { id: 'gA', name: 'A' }], characters: [] };
    assert.equal(computePresetApplication(library, { groupStates: { __ungrouped__: false } }).changed, false);
    assert.deepEqual(captureGroupStatesFromLibrary(library).groupStates, { gA: true });
    assert.deepEqual(getPresetGroupRows(library, null).map(row => row.key), ['gA']);
});

test('captureGroupStatesFromLibrary reads each group switch; own character states and ungrouped do not matter', () => {
    const closedD = computePresetApplication(makeLibrary({ 'gB-1': { enabled: false }, 'gB-2': { enabled: false }, 'u-1': { enabled: false } }), { groupStates: { gC: false } }).library;
    const captured = captureGroupStatesFromLibrary(closedD);
    assert.deepEqual(captured, { groupStates: { gA: true, gB: true, gC: false, gD: true } }, 'B stays true although all its characters are off');
    assert.deepEqual(Object.keys(captured), ['groupStates'], 'no mixed / empty fields any more');
    const withEmpty = { characters: closedD.characters, groups: [...closedD.groups, { id: 'gE', name: 'E', enabled: false }] };
    assert.deepEqual(captureGroupStatesFromLibrary(withEmpty).groupStates.gE, false, 'an empty group still has a switch');
    assert.deepEqual(captureGroupStatesFromLibrary({ groups: [], characters: [] }), { groupStates: {} });
    assert.deepEqual(captureGroupStatesFromLibrary(undefined), { groupStates: {} });
});

test('capturing the current switches and applying them is a no-op; applying to another library only flips switches', () => {
    const library = computePresetApplication(makeLibrary({ 'gC-1': { enabled: false } }), { groupStates: { gC: false, gD: false } }).library;
    const { groupStates } = captureGroupStatesFromLibrary(library);
    assert.equal(computePresetApplication(library, { groupStates }).changed, false);
    const other = computePresetApplication(makeLibrary({ 'gC-1': { enabled: false } }), { groupStates });
    assert.deepEqual(switchMap(other.library), { gA: true, gB: true, gC: false, gD: false });
    assert.equal(other.library.characters.find(c => c.id === 'gC-1').enabled, false);
    assert.equal(other.library.characters.find(c => c.id === 'gC-2').enabled, true);
});

test('getPresetGroupRows lists groups only (no ungrouped row) with the preset target and own enabled counts', () => {
    const library = makeLibrary({ 'gA-1': { enabled: false } });
    const [alpha] = makePresets();
    const rows = getPresetGroupRows(library, alpha);
    assert.deepEqual(rows.map(row => row.key), ['gA', 'gB', 'gC', 'gD']);
    assert.deepEqual(rows.map(row => row.state), [true, true, false, false]);
    assert.deepEqual(rows.map(row => [row.total, row.enabledCount]), [[2, 1], [2, 2], [2, 2], [2, 2]]);
    assert.deepEqual(Object.keys(rows[0]).sort(), ['enabledCount', 'key', 'name', 'state', 'total']);
    assert.equal(rows[0].name, 'A');
    assert.ok(getPresetGroupRows(library, null).every(row => row.state === null));
    // 预设没提到的分组 state 为 null；分组开关不影响 enabledCount（它是组内自己开着的数）
    const partial = { groupStates: { gB: false } };
    const closed = computePresetApplication(library, { groupStates: { gA: false } }).library;
    assert.deepEqual(getPresetGroupRows(closed, partial).map(row => row.state), [null, false, null, null]);
    assert.equal(getPresetGroupRows(closed, partial)[0].enabledCount, 1);
    // 悬空 groupId 的角色不计入任何分组
    const dangling = { groups: [{ id: 'gA', name: 'A' }], characters: [{ id: 'x', name: 'x', groupId: 'ghost' }, { id: 'y', name: 'y', groupId: 'gA' }] };
    assert.deepEqual(getPresetGroupRows(dangling, null).map(row => [row.key, row.total]), [['gA', 1]]);
});

// ─── 边沿触发：用一个小状态机模拟“聊天切换 → 规划 → 保存”，与运行时的读改写逻辑一致 ───
function makeWorld() {
    return { presets: makePresets(), applied: null, library: makeLibrary(), now: 1000 };
}

function step(world, activeAvatars, options = {}) {
    world.now += 1;
    const plan = planPresetApplication({
        presets: world.presets,
        applied: world.applied,
        library: world.library,
        activeAvatars,
        now: world.now,
        ...options,
    });
    if (plan.status === 'applied') {
        world.library = plan.library;
        if (plan.changed || plan.recordChanged) world.applied = plan.applied;
    }
    return plan;
}

test('edge trigger: first match applies, the same preset is not applied again, switching presets applies', () => {
    const world = makeWorld();
    const first = step(world, ['card1.png']);
    assert.equal(first.status, 'applied');
    assert.equal(first.changed, true);
    assert.equal(world.applied.presetId, world.presets[0].id);

    // 用户手动把 C 组重新打开，再次进入同一预设的聊天：不覆盖用户的调整
    world.library = computePresetApplication(world.library, { groupStates: { gC: true } }).library;
    const again = step(world, ['card1.png']);
    assert.equal(again.status, 'already-applied');
    assert.equal(isGroupEnabled(world.library, 'gC'), true);

    const switched = step(world, ['card2.png']);
    assert.equal(switched.status, 'applied');
    assert.equal(world.applied.presetId, world.presets[1].id);
    assert.equal(isGroupEnabled(world.library, 'gB'), false);

    // 回到 alpha：记录是 beta，所以重新应用
    const back = step(world, ['card1.png']);
    assert.equal(back.status, 'applied');
    assert.equal(isGroupEnabled(world.library, 'gB'), true);
    assert.equal(isGroupEnabled(world.library, 'gC'), false);
});

test('edge trigger: an edited preset is applied again, a renamed one is not', () => {
    const world = makeWorld();
    step(world, ['card1.png']);
    assert.equal(step(world, ['card1.png']).status, 'already-applied');

    world.presets = renamePreset(world.presets, world.presets[0].id, '阿尔法');
    assert.equal(step(world, ['card1.png']).status, 'already-applied');

    world.presets = setGroupState(world.presets, world.presets[0].id, 'gD', true);
    const edited = step(world, ['card1.png']);
    assert.equal(edited.status, 'applied');
    assert.equal(edited.applied.revision, world.presets[0].revision);
    assert.equal(isGroupEnabled(world.library, 'gD'), true);
    assert.equal(step(world, ['card1.png']).status, 'already-applied');

    // 新增绑定、移除绑定同样算编辑
    world.presets = addBinding(world.presets, world.presets[0].id, bind('card3.png'));
    assert.equal(step(world, ['card1.png']).status, 'applied');
});

test('edge trigger: no match leaves the library and the applied record alone', () => {
    const world = makeWorld();
    step(world, ['card1.png']);
    const recordBefore = world.applied;
    const libraryBefore = world.library;
    for (const avatars of [['stranger.png'], [], undefined]) {
        const plan = step(world, avatars);
        assert.ok(['no-match', 'no-avatars'].includes(plan.status));
        assert.equal(world.applied, recordBefore);
        assert.equal(world.library, libraryBefore);
    }
    // 中途经过无命中的聊天后回到同一预设：仍视为同一预设，不重复应用
    assert.equal(step(world, ['card1.png']).status, 'already-applied');
});

test('edge trigger: a deleted-and-recreated preset with the same name is a different preset', () => {
    const world = makeWorld();
    step(world, ['card1.png']);
    const oldId = world.presets[0].id;
    world.presets = deletePreset(world.presets, oldId);
    const created = createPreset(world.presets, 'alpha', { makeId: () => 'gpreset-new' });
    world.presets = addBinding(created.presets, created.presetId, bind('card1.png'));
    const plan = step(world, ['card1.png']);
    assert.equal(plan.status, 'applied');
    assert.equal(world.applied.presetId, 'gpreset-new');
});

test('planPresetApplication: force reapplies the matched preset, presetId applies a specific one regardless of bindings', () => {
    const world = makeWorld();
    step(world, ['card1.png']);
    world.library = computePresetApplication(world.library, { groupStates: { gC: true } }).library;
    assert.equal(step(world, ['card1.png']).status, 'already-applied');

    const forced = step(world, ['card1.png'], { force: true });
    assert.equal(forced.status, 'applied');
    assert.equal(forced.changed, true);
    assert.equal(forced.recordChanged, false);
    assert.equal(isGroupEnabled(world.library, 'gC'), false);

    // force 在没有命中时仍然不动
    assert.equal(step(world, ['stranger.png'], { force: true }).status, 'no-match');
    assert.equal(step(world, [], { force: true }).status, 'no-avatars');

    // 手动指定预设：无视当前聊天的绑定
    const manual = step(world, [], { presetId: world.presets[1].id });
    assert.equal(manual.status, 'applied');
    assert.equal(manual.recordChanged, true);
    assert.equal(world.applied.presetId, world.presets[1].id);
    assert.equal(isGroupEnabled(world.library, 'gB'), false);

    const missing = step(world, ['card1.png'], { presetId: 'nope' });
    assert.equal(missing.status, 'preset-missing');
});

test('planPresetApplication reports the record change separately from library changes', () => {
    const world = makeWorld();
    // 库已处于 alpha 的状态：没有角色变化，但需要记录“已应用 alpha”
    world.library = computePresetApplication(world.library, world.presets[0]).library;
    const plan = step(world, ['card1.png']);
    assert.equal(plan.status, 'applied');
    assert.equal(plan.changed, false);
    assert.equal(plan.recordChanged, true);
    assert.equal(plan.library, world.library);
    assert.equal(step(world, ['card1.png']).status, 'already-applied');

    const none = planPresetApplication({ presets: [], library: makeLibrary(), activeAvatars: ['card1.png'] });
    assert.equal(none.status, 'no-presets');
    const forcedSame = step(world, ['card1.png'], { force: true });
    assert.equal(forcedSame.changed, false);
    assert.equal(forcedSame.recordChanged, false);
});

test('planPresetApplication records the preset revision and timestamp it applied', () => {
    const world = makeWorld();
    world.presets = setGroupState(world.presets, world.presets[0].id, 'gD', true);
    const plan = step(world, ['card1.png']);
    assert.deepEqual(plan.applied, { presetId: world.presets[0].id, revision: world.presets[0].revision, appliedAt: 1001 });
    assert.equal(plan.preset, world.presets[0]);
});

test('planPresetApplication result only carries changed group switches: characters are the same array and own states are intact', () => {
    const library = makeLibrary({ 'gC-1': { enabled: false }, 'u-2': { enabled: false } });
    const plan = planPresetApplication({ presets: makePresets(), library, activeAvatars: ['card1.png'], now: 5 });
    assert.equal(plan.status, 'applied');
    assert.equal(plan.changed, true);
    assert.equal(plan.changedCount, 2);
    assert.equal(plan.library.characters, library.characters);
    assert.deepEqual(enabledMap(plan.library), enabledMap(library));
    assert.deepEqual(switchMap(plan.library), { gA: true, gB: true, gC: false, gD: false });
    assert.deepEqual(plan.affected, [{ key: 'gC', enabled: false }, { key: 'gD', enabled: false }]);
});
