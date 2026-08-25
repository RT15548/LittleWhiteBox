import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
    migrateLegacyNovelPromptPresets,
    migrateLegacyNovelPromptSettings,
} from '../novel-prompt-migration.js';

const CURRENT = Object.freeze({
    topSystem: 'current model-independent system',
    topSystemPov: 'current model-independent pov system',
    sceneRules: 'current model-independent scene rules',
});

const TARGET = 10;

async function loadFixture(name) {
    const text = await readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
    return JSON.parse(text);
}

const loadTemplateV6Fixture = () => loadFixture('novel-settings-template-v6.json');
const loadTemplateV7Fixture = () => loadFixture('novel-settings-template-v7.json');
const loadUpstreamV7Fixture = () => loadFixture('novel-settings-upstream-v7.json');
const loadTemplateV8SceneRules = () => readFile(
    new URL('./fixtures/novel-scene-rules-template-v8.md', import.meta.url),
    'utf8',
);
const loadTemplateV9SceneRules = () => readFile(
    new URL('./fixtures/novel-scene-rules-template-v9.md', import.meta.url),
    'utf8',
);

test('refreshes the frozen template v6 defaults without relying on preset names', async () => {
    const fixture = await loadTemplateV6Fixture();
    fixture.promptPresets[0].name = '用户改过的名字';
    fixture.promptPresets[1].name = '另一个名字';

    const result = migrateLegacyNovelPromptPresets(fixture.promptPresets, {
        configVersion: fixture.configVersion,
        templateVersion: fixture._promptTemplateVersion,
        targetVersion: TARGET,
        currentDefaults: CURRENT,
    });

    assert.equal(result.migrated, true);
    assert.equal(result.templateVersion, TARGET);
    assert.equal(result.presets[0].topSystem, CURRENT.topSystem);
    assert.equal(result.presets[0].sceneRules, CURRENT.sceneRules);
    assert.equal(result.presets[1].topSystem, CURRENT.topSystemPov);
    assert.equal(result.presets[1].sceneRules, CURRENT.sceneRules);
});

test('moves a Tool-era legacy guide into the V4.5 override without losing it', async () => {
    const fixture = await loadTemplateV6Fixture();
    const result = migrateLegacyNovelPromptPresets(fixture.promptPresets, {
        configVersion: fixture.configVersion,
        templateVersion: fixture._promptTemplateVersion,
        targetVersion: TARGET,
        currentDefaults: CURRENT,
    });

    for (const preset of result.presets) {
        assert.equal('tagGuideContent' in preset, false);
        assert.deepEqual(preset.modelGuideOverrides, { 'v4.5': 'legacy provider guide copy' });
    }
});

test('fills only the missing V4.5 guide when a preset already has a V5 override', () => {
    const result = migrateLegacyNovelPromptPresets([{
        id: 'mixed-guides',
        topSystem: 'current system',
        sceneRules: 'current scene rules',
        tagGuideContent: 'legacy V4.5 guide',
        modelGuideOverrides: { v5: 'current V5 guide' },
    }], {
        targetVersion: TARGET,
        currentDefaults: CURRENT,
    });

    assert.deepEqual(result.presets[0].modelGuideOverrides, {
        'v4.5': 'legacy V4.5 guide',
        v5: 'current V5 guide',
    });
});

test('refreshes the frozen template v7 defaults without relying on preset names', async () => {
    const fixture = await loadTemplateV7Fixture();
    fixture.promptPresets[0].name = '用户改过的名字';
    fixture.promptPresets[1].name = '另一个名字';

    const result = migrateLegacyNovelPromptPresets(fixture.promptPresets, {
        configVersion: fixture.configVersion,
        templateVersion: fixture._promptTemplateVersion,
        targetVersion: TARGET,
        currentDefaults: CURRENT,
    });

    assert.equal(result.migrated, true);
    assert.equal(result.templateVersion, TARGET);
    assert.equal(result.presets[0].topSystem, CURRENT.topSystem);
    assert.equal(result.presets[0].sceneRules, CURRENT.sceneRules);
    assert.equal(result.presets[1].topSystem, CURRENT.topSystemPov);
    assert.equal(result.presets[1].sceneRules, CURRENT.sceneRules);
});

test('refreshes frozen template v8 scene rules without overwriting an edited copy', async () => {
    const sceneRules = await loadTemplateV8SceneRules();
    const editedSceneRules = `${sceneRules}\nuser edit`;
    const result = migrateLegacyNovelPromptPresets([
        { id: 'default', topSystem: 'custom system', sceneRules },
        { id: 'edited', topSystem: 'custom system', sceneRules: editedSceneRules },
    ], {
        templateVersion: 8,
        targetVersion: TARGET,
        currentDefaults: CURRENT,
    });

    assert.equal(result.presets[0].sceneRules, CURRENT.sceneRules);
    assert.equal(result.presets[1].sceneRules, editedSceneRules);
});

test('refreshes frozen template v9 interaction rules without overwriting an edited copy', async () => {
    const sceneRules = await loadTemplateV9SceneRules();
    const editedSceneRules = `${sceneRules}\nuser edit`;
    const result = migrateLegacyNovelPromptPresets([
        { id: 'default', topSystem: 'custom system', sceneRules },
        { id: 'edited', topSystem: 'custom system', sceneRules: editedSceneRules },
    ], {
        templateVersion: 9,
        targetVersion: TARGET,
        currentDefaults: CURRENT,
    });

    assert.equal(result.presets[0].sceneRules, CURRENT.sceneRules);
    assert.equal(result.presets[1].sceneRules, editedSceneRules);
});

test('preserves any user-edited prompt field even when its preset keeps a default name', async () => {
    const fixture = await loadTemplateV7Fixture();
    fixture.promptPresets[0].topSystem += '\nuser edit';
    fixture.promptPresets[0].sceneRules = `user edit\n${fixture.promptPresets[0].sceneRules}`;

    const result = migrateLegacyNovelPromptPresets(fixture.promptPresets, {
        configVersion: fixture.configVersion,
        templateVersion: fixture._promptTemplateVersion,
        targetVersion: TARGET,
        currentDefaults: CURRENT,
    });

    assert.match(result.presets[0].topSystem, /user edit$/);
    assert.match(result.presets[0].sceneRules, /^user edit/);
    assert.equal(result.presets[0].name, '默认-完整规则');
    assert.equal(result.templateVersion, TARGET);
});

test('does not re-run the upgrade after the target version is recorded', async () => {
    const fixture = await loadTemplateV7Fixture();
    const result = migrateLegacyNovelPromptPresets(fixture.promptPresets, {
        configVersion: fixture.configVersion,
        templateVersion: TARGET,
        targetVersion: TARGET,
        currentDefaults: CURRENT,
    });

    assert.equal(result.migrated, false);
    assert.deepEqual(result.presets, fixture.promptPresets);
    assert.equal(result.templateVersion, TARGET);
});

test('requires an explicit target version so the boundary cannot drift from the templates', async () => {
    const fixture = await loadTemplateV7Fixture();
    assert.throws(
        () => migrateLegacyNovelPromptPresets(fixture.promptPresets, { currentDefaults: CURRENT }),
        /targetVersion is required/,
    );
});

test('converts the released upstream v7 YAML preset shape before current normalization', async () => {
    const fixture = await loadUpstreamV7Fixture();
    const result = migrateLegacyNovelPromptSettings(fixture, CURRENT, TARGET);

    assert.equal(result.migrated, true);
    assert.equal(result.upstreamPresetCount, 4);
    assert.equal(result.customPresetCount, 1);
    assert.equal(result.settings.selectedPromptPresetId, 'prompt-custom');
    assert.equal(result.settings._promptTemplateVersion, TARGET);
    assert.deepEqual(
        result.settings.promptPresets.map(preset => preset.name),
        ['默认-完整规则', '默认-第一人称完整规则', '旧版-模型要求低（已升级）', '我的构图规则'],
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
