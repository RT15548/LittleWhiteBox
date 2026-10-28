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
    sceneRulesPro: 'current model-independent pro rules',
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
        assert.equal(result.settings._builtinPresetVersion, 1);
        assert.deepEqual(fixture, before);
        // preset[0] 已改名，不是内置，保留原文。
        const renamed = result.presets[0];
        assert.equal(renamed.id, fixture.promptPresets[0].id);
        assert.equal(renamed.name, '用户改过的名字');
        assert.equal(renamed.topSystem, fixture.promptPresets[0].topSystem);
        assert.equal(renamed.sceneRules, fixture.promptPresets[0].sceneRules);
        // preset[1] 仍是内置名，强制刷新为当前内置内容并锁定。
        const refreshed = result.presets[1];
        assert.equal(refreshed.id, fixture.promptPresets[1].id);
        assert.equal(refreshed.name, fixture.promptPresets[1].name);
        assert.equal(refreshed.builtin, true);
        assert.equal(refreshed.topSystem, CURRENT.topSystemPov);
        assert.equal(refreshed.sceneRules, CURRENT.sceneRules);
        if (Object.hasOwn(fixture.promptPresets[1], 'tagGuideContent')) {
            assert.equal(Object.hasOwn(refreshed, 'tagGuideContent'), false);
            assert.equal(refreshed.modelGuideOverrides['v4.5'], fixture.promptPresets[1].tagGuideContent);
        }
        const added = result.presets.slice(fixture.promptPresets.length);
        assert.equal(added.length, 3);
        assert.deepEqual(added.map(preset => preset.name), Object.values(SCENE_PLANNER_PRESET_NAMES));
        assert.equal(added[0].topSystem, CURRENT.topSystem);
        assert.equal(added[1].topSystem, CURRENT.topSystemPov);
        for (const preset of added) {
            assert.deepEqual(preset.modelGuideOverrides, {});
            assert.equal(preset.builtin, true);
        }
        assert.equal(added[0].sceneRules, CURRENT.sceneRules);
        assert.equal(added[1].sceneRules, CURRENT.sceneRules);
        assert.equal(added[2].sceneRules, CURRENT.sceneRulesPro);
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
        // default 仍用内置名 → 强制刷新；edited 改名 → 保留用户编辑。
        assert.deepEqual(result.presets[0], {
            id: 'default', name: '默认-完整规则', builtin: true,
            topSystem: CURRENT.topSystem, sceneRules: CURRENT.sceneRules,
        });
        assert.deepEqual(result.presets[1], presets[1]);
        assert.equal(result.presets.length, 5);
        assert.equal(result.presets[4].name, SCENE_PLANNER_PRESET_NAMES.pro);
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

test('new NovelAI installations receive the three current presets and open on the enhanced one', () => {
    const result = migrateLegacyNovelPromptSettings(null, CURRENT, TARGET);
    assert.equal(result.presets.length, 3);
    assert.deepEqual(result.presets.map(preset => preset.name), Object.values(SCENE_PLANNER_PRESET_NAMES));
    assert.equal(result.proSelected, true);
    assert.equal(result.settings.selectedPromptPresetId, result.presets[2].id);
    assert.equal(result.settings._promptTemplateVersion, TARGET);
});

test('a user on a current version keeps their custom preset while built-ins refresh behind them', () => {
    const builtin = { id: 'normal', name: SCENE_PLANNER_PRESET_NAMES.normal, builtin: true, topSystem: 'old', sceneRules: 'old' };
    const custom = { id: 'mine', name: '我的自定义', topSystem: 'system', sceneRules: 'rules' };
    const result = migrateLegacyNovelPromptSettings({
        _promptTemplateVersion: TARGET,
        _proPresetVersion: 3,
        promptPresets: [builtin, custom],
        selectedPromptPresetId: 'mine',
    }, CURRENT, TARGET);
    // 自定義預設原樣保留，選擇不變；內置預設在背景刷新為當前內容並鎖定。
    assert.equal(result.settings.selectedPromptPresetId, 'mine');
    assert.equal(result.proSelected, false);
    assert.deepEqual(result.presets[1], custom);
    assert.deepEqual(result.presets[0], {
        ...builtin, topSystem: CURRENT.topSystem, sceneRules: CURRENT.sceneRules,
    });
    assert.equal(result.builtinRefreshed, true);
});

test('an upgrade hands an existing user to the standard preset, never the enhanced one', () => {
    const result = migrateLegacyNovelPromptSettings({
        _promptTemplateVersion: 12,
        promptPresets: [{ id: 'mine', name: '我的预设', topSystem: 'system', sceneRules: 'rules' }],
        selectedPromptPresetId: 'mine',
    }, CURRENT, TARGET);
    assert.equal(result.proSelected, false);
    const active = result.presets.find(preset => preset.id === result.settings.selectedPromptPresetId);
    assert.equal(active.name, SCENE_PLANNER_PRESET_NAMES.normal);
});

test('replaces an untouched released enhanced preset with the current rules', async () => {
    const released = await readFile(new URL('./fixtures/novel-scene-rules-pro-released.md', import.meta.url), 'utf8');
    const result = migrateLegacyNovelPromptSettings({
        _promptTemplateVersion: TARGET,
        _proPresetVersion: 1,
        promptPresets: [{ id: 'pro', name: SCENE_PLANNER_PRESET_NAMES.pro, topSystem: '', sceneRules: released }],
    }, CURRENT, TARGET);

    assert.equal(result.proRefreshed, true);
    assert.equal(result.proAppended, false);
    const pro = result.settings.promptPresets[0];
    assert.equal(pro.sceneRules, CURRENT.sceneRulesPro);
    assert.equal(pro.builtin, true);
    assert.equal(pro.topSystem, CURRENT.topSystem);
    assert.equal(result.settings._proPresetVersion, 3);
    assert.equal(result.settings._builtinPresetVersion, 1);
    assert.equal(result.migrated, true);
});

test('force-overwrites an edited enhanced preset instead of appending a built-in copy', () => {
    const edited = migrateLegacyNovelPromptSettings({
        _promptTemplateVersion: TARGET,
        _proPresetVersion: 1,
        promptPresets: [{ id: 'pro', name: SCENE_PLANNER_PRESET_NAMES.pro, topSystem: '', sceneRules: 'my own rules' }],
    }, CURRENT, TARGET);

    // 内置进阶预设一律覆盖，不再保留用户修改或旁挂内置副本。
    assert.equal(edited.proRefreshed, true);
    assert.equal(edited.proAppended, false);
    assert.equal(edited.settings.promptPresets.length, 1);
    const pro = edited.settings.promptPresets[0];
    assert.equal(pro.name, SCENE_PLANNER_PRESET_NAMES.pro);
    assert.equal(pro.builtin, true);
    assert.equal(pro.sceneRules, CURRENT.sceneRulesPro);
    assert.equal(pro.topSystem, CURRENT.topSystem);
    assert.equal(edited.settings._proPresetVersion, 3);
    assert.equal(edited.settings._builtinPresetVersion, 1);
    assert.equal(edited.migrated, true);
});

test('does not recreate the enhanced preset when it was removed', () => {
    const removed = migrateLegacyNovelPromptSettings({
        _promptTemplateVersion: TARGET,
        _proPresetVersion: 1,
        promptPresets: [{ id: 'normal', name: SCENE_PLANNER_PRESET_NAMES.normal, topSystem: '', sceneRules: 'rules' }],
    }, CURRENT, TARGET);

    assert.equal(removed.proRefreshed, false);
    assert.equal(removed.proAppended, false);
    assert.equal(removed.settings.promptPresets.length, 1);
    const normal = removed.settings.promptPresets[0];
    assert.equal(normal.name, SCENE_PLANNER_PRESET_NAMES.normal);
    assert.equal(normal.builtin, true);
    assert.equal(normal.topSystem, CURRENT.topSystem);
    assert.equal(normal.sceneRules, CURRENT.sceneRules);
    assert.equal(removed.settings._proPresetVersion, 3);
    assert.equal(removed.settings._builtinPresetVersion, 1);
    assert.equal(removed.migrated, true);
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

test('force-refreshes upstream presets that keep a managed default name', async () => {
    const fixture = await loadUpstreamV7Fixture();
    fixture.promptPresets[0].topSystem += '\nmy system edit';
    fixture.promptPresets[0].userJsonFormat += '\nmy scene edit';
    const result = migrateLegacyNovelPromptSettings(fixture, CURRENT, TARGET);
    const migrated = result.settings.promptPresets[0];

    // 保留默认名的上游预设在内置刷新阶段被覆盖为当前内置内容。
    assert.equal(migrated.name, '默认-完整规则');
    assert.equal(migrated.builtin, true);
    assert.equal(migrated.topSystem, CURRENT.topSystem);
    assert.equal(migrated.sceneRules, CURRENT.sceneRules);
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
