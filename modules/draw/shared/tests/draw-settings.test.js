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
        paramsPresets: [{ id: 'current-image-preset' }],
        characterTags: [{ id: 'new', name: '新角色' }],
        worldbooks: { enabled: true, uploadedBooks: [{ name: '新设定' }] },
        llmApi: { key: 'obsolete-key' },
    };
    const providerSave = mergeNovelDrawProviderSettingsIntoStorageRoot(currentRoot, {
        configVersion: 7,
        apiKey: 'new-image-key',
        paramsPresets: [{ id: 'new-image-preset' }],
        characterTags: [{ id: 'stale', name: '旧角色' }],
        worldbooks: { enabled: false, uploadedBooks: [] },
        llmApi: { key: 'must-not-return' },
    });

    assert.equal(providerSave.apiKey, 'new-image-key');
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
