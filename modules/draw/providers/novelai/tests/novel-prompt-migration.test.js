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

async function loadTestLineV7Fixture() {
    const text = await readFile(
        new URL('./fixtures/novel-settings-v7.json', import.meta.url),
        'utf8',
    );
    return JSON.parse(text);
}

async function loadUpstreamV7Fixture() {
    const text = await readFile(
        new URL('./fixtures/novel-settings-upstream-v7.json', import.meta.url),
        'utf8',
    );
    return JSON.parse(text);
}

test('migrates the frozen test-line v7 defaults without relying on preset names', async () => {
    const fixture = await loadTestLineV7Fixture();
    fixture.promptPresets[0].name = '用户改过的名字';
    fixture.promptPresets[1].name = '另一个名字';

    const result = migrateLegacyNovelPromptPresets(fixture.promptPresets, {
        configVersion: fixture.configVersion,
        templateVersion: fixture._promptTemplateVersion,
        currentDefaults: CURRENT,
    });

    assert.equal(result.migrated, true);
    assert.equal(result.templateVersion, 7);
    assert.equal(result.presets[0].topSystem, CURRENT.topSystem);
    assert.equal(result.presets[0].sceneRules, CURRENT.sceneRules);
    assert.equal(result.presets[1].topSystem, CURRENT.topSystemPov);
    assert.equal(result.presets[1].sceneRules, CURRENT.sceneRules);
});

test('preserves any user-edited prompt field even when its preset keeps a default name', async () => {
    const fixture = await loadTestLineV7Fixture();
    fixture.promptPresets[0].topSystem += '\nuser edit';
    fixture.promptPresets[0].sceneRules = `user edit\n${fixture.promptPresets[0].sceneRules}`;

    const result = migrateLegacyNovelPromptPresets(fixture.promptPresets, {
        configVersion: fixture.configVersion,
        templateVersion: fixture._promptTemplateVersion,
        currentDefaults: CURRENT,
    });

    assert.match(result.presets[0].topSystem, /user edit$/);
    assert.match(result.presets[0].sceneRules, /^user edit/);
    assert.equal(result.presets[0].name, '默认-完整规则');
    assert.equal(result.templateVersion, 7);
});

test('does not re-run the v7 upgrade after the boundary version is recorded', async () => {
    const fixture = await loadTestLineV7Fixture();
    const result = migrateLegacyNovelPromptPresets(fixture.promptPresets, {
        configVersion: fixture.configVersion,
        templateVersion: 7,
        currentDefaults: CURRENT,
    });

    assert.equal(result.migrated, false);
    assert.equal(result.presets, fixture.promptPresets);
    assert.equal(result.templateVersion, 7);
});

test('converts the released upstream v7 YAML preset shape before current normalization', async () => {
    const fixture = await loadUpstreamV7Fixture();
    const result = migrateLegacyNovelPromptSettings(fixture, CURRENT);

    assert.equal(result.migrated, true);
    assert.equal(result.upstreamPresetCount, 4);
    assert.equal(result.customPresetCount, 1);
    assert.equal(result.settings.selectedPromptPresetId, 'prompt-custom');
    assert.equal(result.settings._promptTemplateVersion, 7);
    assert.deepEqual(
        result.settings.promptPresets.map(preset => preset.name),
        ['默认-完整规则', '默认-第一人称完整规则', '旧版-模型要求低（已升级）', '我的构图规则'],
    );
    assert.equal(result.settings.promptPresets[0].topSystem, CURRENT.topSystem);
    assert.equal(result.settings.promptPresets[1].topSystem, CURRENT.topSystemPov);
    assert.equal(result.settings.promptPresets[2].sceneRules, CURRENT.sceneRules);

    const custom = result.settings.promptPresets[3];
    assert.equal(custom.topSystem, 'keep my system prompt');
    assert.match(custom.sceneRules, /current model-independent scene rules/);
    assert.match(custom.sceneRules, /keep my custom tag guide/);
    assert.match(custom.sceneRules, /keep my custom scene instructions/);
    assert.equal('tagGuideContent' in custom, false);
    assert.equal('userJsonFormat' in custom, false);
});

test('preserves upstream edits even when the preset still has a managed default name', async () => {
    const fixture = await loadUpstreamV7Fixture();
    fixture.promptPresets[0].topSystem += '\nmy system edit';
    fixture.promptPresets[0].userJsonFormat += '\nmy scene edit';
    const result = migrateLegacyNovelPromptSettings(fixture, CURRENT);
    const migrated = result.settings.promptPresets[0];

    assert.equal(migrated.name, '默认-完整规则');
    assert.match(migrated.topSystem, /my system edit$/);
    assert.match(migrated.sceneRules, /my scene edit/);
    assert.match(migrated.sceneRules, /迁移约束：旧内容中的 YAML\/JSON 输出格式/);
    assert.equal(result.customPresetCount, 2);
});

test('does not interpret the upstream-only fields after the one-time conversion', async () => {
    const fixture = await loadUpstreamV7Fixture();
    const first = migrateLegacyNovelPromptSettings(fixture, CURRENT);
    const second = migrateLegacyNovelPromptSettings({
        ...first.settings,
        configVersion: 8,
    }, CURRENT);

    assert.equal(second.migrated, false);
    assert.equal(second.settings.configVersion, 8);
    assert.equal(second.settings._promptTemplateVersion, 7);
    assert.deepEqual(second.settings.promptPresets, first.settings.promptPresets);
});
