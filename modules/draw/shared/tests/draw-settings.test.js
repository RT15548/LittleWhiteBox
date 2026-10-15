import test from 'node:test';
import assert from 'node:assert/strict';

import {
    mergeNovelDrawProviderSettingsIntoStorageRoot,
    mergeSharedDrawSettingsIntoStorageRoot,
    normalizeSharedDrawSettings,
} from '../draw-settings.js';

test('shared draw settings retain current domain data and discard former LLM configuration', () => {
    const normalized = normalizeSharedDrawSettings({
        cacheDays: 9,
        timeout: 45000,
        useWorldInfo: true,
        danbooruLocalDB: true,
        characterTags: [{
            id: 'char-1',
            name: '阿璃',
            aliases: ['小璃', ''],
            type: 'girl',
            appearance: 'silver hair',
            negativeTags: 'bad hands',
            danbooruTag: 'ali_(original)',
            outfits: [{ name: '常服', tags: 'white dress' }],
            dynamicStates: [{ name: '害羞', tags: 'blush' }],
        }],
        messageFilterRules: [{ start: '<think>', end: '</think>' }],
        worldbooks: {
            enabled: true,
            uploadedBooks: [{ name: '设定集', entries: [] }],
            keywordFilterMode: 'all_active',
        },
        llmApi: { provider: 'openai', key: 'must-disappear' },
        useStream: true,
        disablePrefill: true,
        unknownLegacyField: 'must-disappear',
    });

    assert.equal(normalized.cacheDays, 9);
    assert.equal(normalized.timeout, 45000);
    assert.equal(normalized.useWorldInfo, true);
    assert.equal(normalized.worldbooks.keywordFilterMode, 'all_active');
    assert.deepEqual(normalized.characterTags[0].aliases, ['小璃']);
    assert.deepEqual(normalized.characterTags[0].dynamicStates, [{ name: '害羞', tags: 'blush' }]);
    assert.equal(normalized.characterTags[0].enabled, true);
    assert.equal(Object.hasOwn(normalized, 'llmApi'), false);
    assert.equal(Object.hasOwn(normalized, 'useStream'), false);
    assert.equal(Object.hasOwn(normalized, 'disablePrefill'), false);
    assert.equal(Object.hasOwn(normalized, 'unknownLegacyField'), false);
});

test('shared and NovelAI provider saves preserve the other owner without reviving stale LLM fields', () => {
    const currentRoot = {
        configVersion: 6,
        apiKey: 'old-image-key',
        useImageBackendJobs: false,
        paramsPresets: [{ id: 'current-image-preset' }],
        characterTags: [{ id: 'new', name: '新角色' }],
        worldbooks: { enabled: true, uploadedBooks: [{ name: '新设定' }] },
        llmApi: { key: 'obsolete-key' },
    };
    const providerSave = mergeNovelDrawProviderSettingsIntoStorageRoot(currentRoot, {
        configVersion: 7,
        apiKey: 'new-image-key',
        useImageBackendJobs: true,
        paramsPresets: [{ id: 'new-image-preset' }],
        characterTags: [{ id: 'stale', name: '旧角色' }],
        worldbooks: { enabled: false, uploadedBooks: [] },
        llmApi: { key: 'must-not-return' },
    });

    assert.equal(providerSave.apiKey, 'new-image-key');
    assert.equal(providerSave.useImageBackendJobs, true);
    assert.deepEqual(providerSave.characterTags, [{
        id: 'new',
        enabled: true,
        name: '新角色',
        aliases: [],
        type: 'girl',
        appearance: '',
        negativeTags: '',
        danbooruTag: '',
        outfits: [],
        dynamicStates: [],
    }]);
    assert.equal(providerSave.worldbooks.enabled, true);
    assert.equal(Object.hasOwn(providerSave, 'llmApi'), false);

    const sharedSave = mergeSharedDrawSettingsIntoStorageRoot(providerSave, {
        ...providerSave,
        characterTags: [{ id: 'latest', name: '最新角色' }],
    });
    assert.equal(sharedSave.apiKey, 'new-image-key');
    assert.equal(sharedSave.useImageBackendJobs, true);
    assert.equal(sharedSave.paramsPresets[0].id, 'new-image-preset');
    assert.equal(sharedSave.characterTags[0].name, '最新角色');
});

test('shared character settings preserve explicit disabled state and default older records to enabled', () => {
    const normalized = normalizeSharedDrawSettings({
        characterTags: [
            { id: 'disabled', name: '同名角色', enabled: false },
            { id: 'legacy', name: '同名角色' },
        ],
    });

    assert.equal(normalized.characterTags[0].enabled, false);
    assert.equal(normalized.characterTags[1].enabled, true);
});

test('character groups survive normalization, provider saves and shared saves', () => {
    const normalized = normalizeSharedDrawSettings({
        characterGroups: [{ id: 'g1', name: '主线' }, { id: 'g2', name: '主线' }, { id: 'g3', name: '' }],
        characterTags: [
            { id: 'a', name: '阿璃', groupId: 'g1' },
            { id: 'b', name: '路人', groupId: 'ghost' },
            { id: 'c', name: '无组' },
        ],
    });
    assert.deepEqual(normalized.characterGroups, [{ id: 'g1', name: '主线' }]);
    assert.equal(normalized.characterTags[0].groupId, 'g1');
    assert.equal(Object.hasOwn(normalized.characterTags[1], 'groupId'), false);
    assert.equal(Object.hasOwn(normalized.characterTags[2], 'groupId'), false);

    const providerSave = mergeNovelDrawProviderSettingsIntoStorageRoot(normalized, { apiKey: 'k' });
    assert.deepEqual(providerSave.characterGroups, [{ id: 'g1', name: '主线' }]);
    assert.equal(providerSave.characterTags[0].groupId, 'g1');

    const sharedSave = mergeSharedDrawSettingsIntoStorageRoot(providerSave, providerSave);
    assert.deepEqual(sharedSave.characterGroups, [{ id: 'g1', name: '主线' }]);
});

test('settings without groups normalize to an empty group list and no groupId keys', () => {
    const normalized = normalizeSharedDrawSettings({ characterTags: [{ id: 'a', name: 'A' }] });
    assert.deepEqual(normalized.characterGroups, []);
    assert.equal(Object.hasOwn(normalized.characterTags[0], 'groupId'), false);
    assert.deepEqual(normalizeSharedDrawSettings({}).characterGroups, []);
});

test('an old client saving characters without groups keeps stored groups and group membership', () => {
    const stored = normalizeSharedDrawSettings({
        characterGroups: [{ id: 'g1', name: '主线' }],
        characterTags: [{ id: 'a', name: '阿璃', groupId: 'g1' }],
    });
    // 旧 iframe 就地修改对象并整体回传 characterTags，不带 characterGroups。
    const edited = { ...stored.characterTags[0], appearance: 'silver hair' };
    const next = normalizeSharedDrawSettings({ ...stored, characterTags: [edited], characterGroups: stored.characterGroups });
    assert.equal(next.characterTags[0].groupId, 'g1');
    assert.equal(next.characterGroups.length, 1);
});

test('planner retry count defaults to 3, is clamped to 0-10 and survives provider and shared saves', () => {
    assert.equal(normalizeSharedDrawSettings({}).plannerMaxRetries, 3);
    assert.equal(normalizeSharedDrawSettings({ plannerMaxRetries: 0 }).plannerMaxRetries, 0);
    assert.equal(normalizeSharedDrawSettings({ plannerMaxRetries: 6.8 }).plannerMaxRetries, 6);
    assert.equal(normalizeSharedDrawSettings({ plannerMaxRetries: 50 }).plannerMaxRetries, 10);
    assert.equal(normalizeSharedDrawSettings({ plannerMaxRetries: -2 }).plannerMaxRetries, 3);
    assert.equal(normalizeSharedDrawSettings({ plannerMaxRetries: 'x' }).plannerMaxRetries, 3);

    const stored = normalizeSharedDrawSettings({ plannerMaxRetries: 5 });
    const providerSave = mergeNovelDrawProviderSettingsIntoStorageRoot(stored, { apiKey: 'k' });
    assert.equal(providerSave.plannerMaxRetries, 5);
    assert.equal(mergeSharedDrawSettingsIntoStorageRoot(providerSave, providerSave).plannerMaxRetries, 5);
});

test('character group presets default to empty and old settings stay compatible', () => {
    const empty = normalizeSharedDrawSettings({});
    assert.deepEqual(empty.characterGroupPresets, []);
    assert.equal(empty.characterGroupPresetApplied, null);
    const old = normalizeSharedDrawSettings({
        characterGroups: [{ id: 'g1', name: '主线' }],
        characterTags: [{ id: 'a', name: '阿璃', groupId: 'g1' }],
    });
    assert.deepEqual(old.characterGroupPresets, []);
    assert.equal(old.characterGroupPresetApplied, null);
    assert.deepEqual(old.characterTags.map(c => c.id), ['a']);
    assert.deepEqual(normalizeSharedDrawSettings({ characterGroupPresets: 'junk', characterGroupPresetApplied: 5 }).characterGroupPresets, []);
});

test('character group presets are normalized against the current groups and the applied record against presets', () => {
    const normalized = normalizeSharedDrawSettings({
        characterGroups: [{ id: 'g1', name: '主线' }, { id: 'g2', name: '支线' }],
        characterTags: [{ id: 'a', name: '阿璃', groupId: 'g1' }],
        characterGroupPresets: [{
            id: 'p1',
            name: 'alpha',
            revision: 4,
            groupStates: { g1: true, g2: false, ghost: true, __ungrouped__: false, bad: 'yes' },
            bindings: [{ type: 'character', avatar: 'a.png', name: '甲' }, { type: 'character', avatar: 'a.png' }, { avatar: '' }],
        }],
        characterGroupPresetApplied: { presetId: 'p1', revision: 4, appliedAt: 99 },
    });
    assert.deepEqual(normalized.characterGroupPresets, [{
        id: 'p1',
        name: 'alpha',
        revision: 4,
        groupStates: { g1: true, g2: false },
        bindings: [{ type: 'character', avatar: 'a.png', name: '甲' }],
    }]);
    assert.deepEqual(normalized.characterGroupPresetApplied, { presetId: 'p1', revision: 4, appliedAt: 99 });

    // 分组被删除后，预设里的悬空键被清理；预设被删除后，应用记录被清空
    const afterGroupDelete = normalizeSharedDrawSettings({ ...normalized, characterGroups: [{ id: 'g1', name: '主线' }] });
    assert.deepEqual(afterGroupDelete.characterGroupPresets[0].groupStates, { g1: true });
    const afterPresetDelete = normalizeSharedDrawSettings({ ...normalized, characterGroupPresets: [] });
    assert.equal(afterPresetDelete.characterGroupPresetApplied, null);

    // 规范化是幂等的
    assert.deepEqual(normalizeSharedDrawSettings(normalized), { ...normalized, updatedAt: 0 });
});

test('character group presets are shared by every provider save path and never pollute prototypes', () => {
    const stored = normalizeSharedDrawSettings({
        characterGroups: [{ id: 'g1', name: '主线' }],
        characterGroupPresets: [{ id: 'p1', name: 'alpha', groupStates: { g1: true }, bindings: [{ avatar: 'a.png' }] }],
        characterGroupPresetApplied: { presetId: 'p1', revision: 1, appliedAt: 5 },
    });
    // 三个 Provider 共用的共享 key：provider 保存、共享保存都不能丢掉预设与应用记录
    const providerSave = mergeNovelDrawProviderSettingsIntoStorageRoot(stored, { apiKey: 'k', characterGroupPresets: [] });
    assert.equal(providerSave.characterGroupPresets.length, 1);
    assert.equal(providerSave.characterGroupPresetApplied.presetId, 'p1');
    const sharedSave = mergeSharedDrawSettingsIntoStorageRoot(providerSave, providerSave);
    assert.deepEqual(sharedSave.characterGroupPresets, stored.characterGroupPresets);
    assert.deepEqual(sharedSave.characterGroupPresetApplied, stored.characterGroupPresetApplied);
    // 旧客户端只回传角色库字段：预设随草稿保留
    const edited = normalizeSharedDrawSettings({ ...stored, characterTags: [{ id: 'a', name: '阿璃', groupId: 'g1' }], characterGroups: stored.characterGroups });
    assert.equal(edited.characterGroupPresets.length, 1);

    const hostile = normalizeSharedDrawSettings(JSON.parse(
        '{"characterGroupPresets":[{"id":"p","name":"x","groupStates":{"__proto__":true,"constructor":false}}]}',
    ));
    assert.deepEqual(hostile.characterGroupPresets[0].groupStates, {});
    assert.equal(({}).polluted, undefined);
    assert.equal(Object.getPrototypeOf(hostile.characterGroupPresets[0].groupStates), Object.prototype);
});

test('group switches (enabled:false) survive normalization, provider saves, shared saves and old-client round trips', () => {
    const normalized = normalizeSharedDrawSettings({
        characterGroups: [
            { id: 'g1', name: '主线' },
            { id: 'g2', name: '支线', enabled: false },
            { id: 'g3', name: '杂项', enabled: true },
            { id: 'g4', name: '怪', enabled: 'false' },
        ],
        characterTags: [
            { id: 'a', name: '阿璃', groupId: 'g2' },
            { id: 'b', name: '小白', groupId: 'g2', enabled: false },
        ],
    });
    // 只有 false 保留该键；true / 非布尔值按缺省处理
    assert.deepEqual(normalized.characterGroups, [
        { id: 'g1', name: '主线' },
        { id: 'g2', name: '支线', enabled: false },
        { id: 'g3', name: '杂项' },
        { id: 'g4', name: '怪' },
    ]);
    // 分组开关不改角色自己的 enabled
    assert.deepEqual(normalized.characterTags.map(c => c.enabled), [true, false]);

    const providerSave = mergeNovelDrawProviderSettingsIntoStorageRoot(normalized, { apiKey: 'k' });
    assert.equal(providerSave.characterGroups[1].enabled, false);
    const sharedSave = mergeSharedDrawSettingsIntoStorageRoot(providerSave, providerSave);
    assert.deepEqual(sharedSave.characterGroups, normalized.characterGroups);
    assert.deepEqual(normalizeSharedDrawSettings(sharedSave).characterGroups, normalized.characterGroups, 'idempotent');

    // 旧客户端整体回传 characterTags 和（带开关的）characterGroups：开关保留
    const edited = normalizeSharedDrawSettings({ ...sharedSave, characterTags: [{ id: 'a', name: '阿璃', groupId: 'g2' }], characterGroups: sharedSave.characterGroups });
    assert.equal(edited.characterGroups[1].enabled, false);
});

test('groups that never used the switch stay byte-identical (no enabled key invented)', () => {
    const normalized = normalizeSharedDrawSettings({ characterGroups: [{ id: 'g1', name: '主线' }], characterTags: [] });
    assert.equal(JSON.stringify(normalized.characterGroups), '[{"id":"g1","name":"主线"}]');
});

test('phase-A presets carrying the legacy ungrouped key are cleaned on load', () => {
    const normalized = normalizeSharedDrawSettings({
        characterGroups: [{ id: 'g1', name: '主线' }],
        characterGroupPresets: [{ id: 'p1', name: 'old', groupStates: { g1: false, __ungrouped__: true } }],
    });
    assert.deepEqual(normalized.characterGroupPresets[0].groupStates, { g1: false });
});
