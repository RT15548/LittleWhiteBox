import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { migrateLegacyNovelPromptSettings } from '../novel-prompt-migration.js';
import { PROMPT_TEMPLATE_VERSION } from '../novel-prompts.js';
import { SCENE_PLANNER_PRESET_NAMES } from '../../../shared/scene-planner-presets.js';

const CURRENT = Object.freeze({
    topSystem: 'current model-independent system',
    topSystemPov: 'current model-independent pov system',
    sceneRules: 'current model-independent scene rules',
});
const TARGET = PROMPT_TEMPLATE_VERSION;

async function loadFixture(name) {
    return JSON.parse(await readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
}
const loadUpstreamV7Fixture = () => loadFixture('novel-settings-upstream-v7.json');

for (const version of [6, 7]) {
    test(`offers new defaults alongside frozen v${version} presets without overwriting their text`, async () => {
        const fixture = await loadFixture(`novel-settings-template-v${version}.json`);
        fixture.promptPresets[0].name = '用户改过的名字';
        fixture.promptPresets[1].sceneRules += '\nuser edit';
        fixture.selectedPromptPresetId = fixture.promptPresets[1].id;
        const before = structuredClone(fixture);
        const result = migrateLegacyNovelPromptSettings(fixture, CURRENT, TARGET);
        assert.equal(result.migrated, true);
        assert.equal(result.settings._promptTemplateVersion, TARGET);
        assert.deepEqual(fixture, before);
        for (let index = 0; index < fixture.promptPresets.length; index++) {
            const original = fixture.promptPresets[index];
            const migrated = result.presets[index];
            for (const key of ['id', 'name', 'topSystem', 'sceneRules']) {
                assert.equal(migrated[key], original[key]);
            }
            if (Object.hasOwn(original, 'tagGuideContent')) {
                assert.equal(Object.hasOwn(migrated, 'tagGuideContent'), false);
                assert.equal(migrated.modelGuideOverrides['v4.5'], original.tagGuideContent);
            }
        }
        const added = result.presets.slice(fixture.promptPresets.length);
        assert.equal(added.length, 2);
        assert.deepEqual(added.map(preset => preset.name), Object.values(SCENE_PLANNER_PRESET_NAMES));
        assert.equal(added[0].topSystem, CURRENT.topSystem);
        assert.equal(added[1].topSystem, CURRENT.topSystemPov);
        for (const preset of added) {
            assert.equal(preset.sceneRules, CURRENT.sceneRules);
            assert.deepEqual(preset.modelGuideOverrides, {});
        }
        // The selected (edited) legacy POV default hands the selection to its new counterpart.
        assert.equal(result.settings.selectedPromptPresetId, added[1].id);
        // Deleted/renamed new presets stay deleted/renamed after a save and reload.
        const persisted = JSON.parse(JSON.stringify(result.settings));
        persisted.promptPresets = persisted.promptPresets.filter(preset => preset.id !== added[1].id);
        persisted.promptPresets.find(preset => preset.id === added[0].id).name = '自定义的新预设';
        const repeated = migrateLegacyNovelPromptSettings(persisted, CURRENT, TARGET);
        assert.equal(repeated.migrated, false);
        assert.deepEqual(repeated.settings, persisted);
    });
}

for (const version of [8, 9, 10, 11, 12]) {
    test(`preserves frozen v${version} rules and edited copies when offering this release's presets`, async () => {
        const sceneRules = await readFile(new URL(`./fixtures/novel-scene-rules-template-v${version}.md`, import.meta.url), 'utf8');
        const presets = [
            { id: 'default', name: '默认-完整规则', topSystem: 'custom system', sceneRules },
            { id: 'edited', name: '我的规则', topSystem: '', sceneRules: `${sceneRules}\nuser edit` },
        ];
        const result = migrateLegacyNovelPromptSettings({
            _promptTemplateVersion: version, promptPresets: presets, selectedPromptPresetId: 'edited',
        }, CURRENT, TARGET);
        assert.deepEqual(result.presets.slice(0, 2), presets);
        assert.equal(result.presets.length, 4);
        // A selected custom preset also hands over: its rules predate the tool contract.
        assert.equal(result.settings.selectedPromptPresetId, result.presets[2].id);
        assert.equal(result.presets[2].name, SCENE_PLANNER_PRESET_NAMES.normal);
    });
}

test('drops retired fields at the format boundary and preserves both model guide overrides', () => {
    const result = migrateLegacyNovelPromptSettings({
        _promptTemplateVersion: 12,
        promptPresets: [{
            id: 'mixed-guides', topSystem: 'system', sceneRules: 'rules',
            tagGuideContent: 'legacy V4.5 guide',
            modelGuideOverrides: { v5: 'current V5 guide' },
            modelContractOverrides: { 'v4.5': 'retired contract' },
        }],
    }, CURRENT, TARGET);
    assert.deepEqual(result.presets[0], {
        id: 'mixed-guides', topSystem: 'system', sceneRules: 'rules',
        modelGuideOverrides: { 'v4.5': 'legacy V4.5 guide', v5: 'current V5 guide' },
    });
});

test('new NovelAI installations receive only the two current presets', () => {
    const result = migrateLegacyNovelPromptSettings(null, CURRENT, TARGET);
    assert.equal(result.presets.length, 2);
    assert.equal(result.settings.selectedPromptPresetId, result.presets[0].id);
    assert.equal(result.settings._promptTemplateVersion, TARGET);
});

test('requires an explicit target version', () => {
    assert.throws(() => migrateLegacyNovelPromptSettings({}, CURRENT), /targetVersion is required/);
});

test('converts the released upstream v7 YAML preset shape before current normalization', async () => {
    const fixture = await loadUpstreamV7Fixture();
    const result = migrateLegacyNovelPromptSettings(fixture, CURRENT, TARGET);

    assert.equal(result.migrated, true);
    assert.equal(result.upstreamPresetCount, 4);
    assert.equal(result.customPresetCount, 1);
    assert.equal(result.settings.selectedPromptPresetId, result.settings.promptPresets[4].id);
    assert.equal(result.settings._promptTemplateVersion, TARGET);
    assert.deepEqual(
        result.settings.promptPresets.map(preset => preset.name),
        ['默认-完整规则', '默认-第一人称完整规则', '旧版-模型要求低（已升级）', '我的构图规则', ...Object.values(SCENE_PLANNER_PRESET_NAMES)],
    );
    assert.equal(result.settings.promptPresets[0].topSystem, CURRENT.topSystem);
    assert.equal(result.settings.promptPresets[1].topSystem, CURRENT.topSystemPov);
    assert.equal(result.settings.promptPresets[2].sceneRules, CURRENT.sceneRules);
    assert.deepEqual(result.settings.promptPresets[0].modelGuideOverrides, {});
    assert.deepEqual(result.settings.promptPresets[1].modelGuideOverrides, {});
    assert.deepEqual(result.settings.promptPresets[2].modelGuideOverrides, {});

    const custom = result.settings.promptPresets[3];
    assert.equal(custom.topSystem, 'keep my system prompt');
    assert.match(custom.sceneRules, /current model-independent scene rules/);
    assert.doesNotMatch(custom.sceneRules, /keep my custom tag guide/);
    assert.match(custom.sceneRules, /keep my custom scene instructions/);
    assert.deepEqual(custom.modelGuideOverrides, { 'v4.5': 'keep my custom tag guide' });
    assert.equal('tagGuideContent' in custom, false);
    assert.equal('userJsonFormat' in custom, false);
});

test('preserves upstream edits even when the preset still has a managed default name', async () => {
    const fixture = await loadUpstreamV7Fixture();
    fixture.promptPresets[0].topSystem += '\nmy system edit';
    fixture.promptPresets[0].userJsonFormat += '\nmy scene edit';
    const result = migrateLegacyNovelPromptSettings(fixture, CURRENT, TARGET);
    const migrated = result.settings.promptPresets[0];

    assert.equal(migrated.name, '默认-完整规则');
    assert.match(migrated.topSystem, /my system edit$/);
    assert.match(migrated.sceneRules, /my scene edit/);
    assert.match(migrated.sceneRules, /迁移约束：旧内容中的 YAML\/JSON 输出格式/);
    assert.equal(result.customPresetCount, 2);
});

test('preserves an intentionally empty upstream model guide', async () => {
    const fixture = await loadUpstreamV7Fixture();
    fixture.promptPresets[0].tagGuideContent = '';

    const result = migrateLegacyNovelPromptSettings(fixture, CURRENT, TARGET);

    assert.deepEqual(result.settings.promptPresets[0].modelGuideOverrides, { 'v4.5': '' });
    assert.equal(result.customPresetCount, 2);
});

test('does not interpret the upstream-only fields after the one-time conversion', async () => {
    const fixture = await loadUpstreamV7Fixture();
    const first = migrateLegacyNovelPromptSettings(fixture, CURRENT, TARGET);
    const second = migrateLegacyNovelPromptSettings({
        ...first.settings,
        configVersion: 8,
    }, CURRENT, TARGET);

    assert.equal(second.migrated, false);
    assert.equal(second.settings.configVersion, 8);
    assert.equal(second.settings._promptTemplateVersion, TARGET);
    assert.deepEqual(second.settings.promptPresets, first.settings.promptPresets);
});
