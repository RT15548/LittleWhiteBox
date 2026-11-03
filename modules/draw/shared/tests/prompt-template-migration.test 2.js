import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { PROMPT_TEMPLATE_VERSION as COMFY_VERSION } from '../../providers/comfyui/comfy-prompts.js';
import { PROMPT_TEMPLATE_VERSION as SD_VERSION } from '../../providers/sd-webui/sd-prompts.js';
import { PROMPT_TEMPLATE_VERSION as NOVEL_VERSION } from '../../providers/novelai/novel-prompts.js';
import { migrateLegacyNovelPromptSettings } from '../../providers/novelai/novel-prompt-migration.js';
import {
    installScenePlannerPresets,
    isPovPromptPreset,
    SCENE_PLANNER_PRESET_NAMES,
} from '../scene-planner-presets.js';

async function loadDefaults(provider) {
    const guide = provider === 'sd-webui' ? 'SD_TAG编写指南.md' : 'COMFY_TAG编写指南.md';
    const paths = {
        topSystem: '../prompts/opening.md',
        topSystemPov: '../prompts/opening-pov.md',
        sceneRules: '../prompts/scene-rules.md',
        ...(provider === 'novelai'
            ? { sceneRulesPro: '../prompts/scene-rules-pro.md' }
            : { tagGuideContent: `../../providers/${provider}/${guide}` }),
    };
    return Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([key, path]) => (
        [key, await readFile(new URL(path, import.meta.url), 'utf8')]
    ))));
}

for (const [provider, targetVersion, installVersion, versions] of [
    ['sd-webui', SD_VERSION, 9, [6, 7, 8]],
    ['comfyui', COMFY_VERSION, 10, [7, 8, 9]],
]) {
    for (const version of versions) {
        test(`${provider} offers new presets alongside unchanged v${version} presets, once across reloads`, async () => {
            const fixture = JSON.parse(await readFile(
                new URL(`../../providers/${provider}/tests/fixtures/prompt-template-v${version}.json`, import.meta.url),
                'utf8',
            ));
            const defaults = await loadDefaults(provider);
            const normal = {
                id: 'old-normal', name: '默认-完整规则',
                topSystem: fixture.topSystem, sceneRules: fixture.sceneRules, tagGuideContent: fixture.tagGuideContent,
            };
            const pov = { ...normal, id: 'old-pov', name: '默认-第一人称完整规则', topSystem: fixture.topSystemPov };
            const custom = { ...normal, id: 'custom', name: '我的预设', topSystem: `${fixture.topSystem}\nuser edit`, tagGuideContent: '' };
            const saved = {
                _promptTemplateVersion: fixture.templateVersion,
                promptPresets: [normal, pov, custom],
                selectedPromptPresetId: custom.id,
                selectedPresetId: 'unchanged-image-params',
            };
            const snapshot = structuredClone(saved);
            const result = installScenePlannerPresets(saved, defaults, targetVersion, { installVersion });
            assert.equal(result.installed, true);
            assert.deepEqual(saved, snapshot);
            assert.deepEqual(result.settings.promptPresets.slice(0, 3), saved.promptPresets);
            assert.equal(result.settings.selectedPresetId, saved.selectedPresetId);
            assert.equal(result.settings._promptTemplateVersion, targetVersion);

            const [newNormal, newPov] = result.settings.promptPresets.slice(3);
            // Even a selected custom preset hands over: its rules predate the tool contract.
            assert.equal(result.settings.selectedPromptPresetId, newNormal.id);
            assert.equal(newNormal.name, SCENE_PLANNER_PRESET_NAMES.normal);
            assert.equal(newPov.name, SCENE_PLANNER_PRESET_NAMES.pov);
            assert.equal(newNormal.topSystem, defaults.topSystem);
            assert.equal(newPov.topSystem, defaults.topSystemPov);
            assert.equal(isPovPromptPreset(newPov.name), true);
            for (const preset of [newNormal, newPov]) {
                assert.equal(preset.sceneRules, defaults.sceneRules);
                assert.equal(preset.tagGuideContent, defaults.tagGuideContent);
            }
            assert.equal(new Set(result.settings.promptPresets.map(preset => preset.id)).size, 5);

            // Simulate save/restart, a rename, an edit and deletion of the other new copy.
            const persisted = JSON.parse(JSON.stringify(result.settings));
            persisted.promptPresets = persisted.promptPresets.filter(preset => preset.id !== newPov.id);
            persisted.promptPresets.find(preset => preset.id === newNormal.id).name = '我改过名';
            persisted.promptPresets.find(preset => preset.id === newNormal.id).sceneRules = 'my new rules';
            const repeated = installScenePlannerPresets(persisted, {}, targetVersion, { installVersion });
            assert.equal(repeated.installed, false);
            assert.equal(repeated.settings, persisted);
            assert.equal(repeated.settings.promptPresets.length, 4);
        });

        test(`${provider} keeps the first-person perspective when moving a selected v${version} preset onto a new copy`, async () => {
            const fixture = JSON.parse(await readFile(
                new URL(`../../providers/${provider}/tests/fixtures/prompt-template-v${version}.json`, import.meta.url),
                'utf8',
            ));
            const defaults = await loadDefaults(provider);
            const normal = { id: 'old-normal', name: '默认-完整规则', topSystem: fixture.topSystem, sceneRules: fixture.sceneRules };
            const editedPov = { id: 'old-pov', name: '默认-第一人称完整规则', topSystem: `${fixture.topSystemPov}\nuser edit`, sceneRules: fixture.sceneRules };

            for (const [selectedId, expectedName] of [
                [normal.id, SCENE_PLANNER_PRESET_NAMES.normal],
                [editedPov.id, SCENE_PLANNER_PRESET_NAMES.pov],
                ['no-longer-exists', SCENE_PLANNER_PRESET_NAMES.normal],
            ]) {
                const result = installScenePlannerPresets({
                    _promptTemplateVersion: fixture.templateVersion,
                    promptPresets: [normal, editedPov],
                    selectedPromptPresetId: selectedId,
                }, defaults, targetVersion, { installVersion });
                const active = result.settings.promptPresets.find(preset => preset.id === result.settings.selectedPromptPresetId);
                assert.equal(active.name, expectedName);
                assert.notEqual(active.id, selectedId);
                assert.ok(result.settings.promptPresets.some(preset => preset.id === normal.id), '旧预设仍在列表中');
            }
        });
    }
}

test('a fresh installation creates exactly two current presets and selects the normal one', async () => {
    const defaults = await loadDefaults('sd-webui');
    const { settings } = installScenePlannerPresets(null, defaults, SD_VERSION, { installVersion: 9 });
    assert.equal(settings.promptPresets.length, 2);
    assert.equal(settings.selectedPromptPresetId, settings.promptPresets[0].id);
    assert.equal(settings.promptPresets[0].name, SCENE_PLANNER_PRESET_NAMES.normal);
});

test('a user-owned preset with the new default name is preserved but the new copy still becomes active', async () => {
    const defaults = await loadDefaults('sd-webui');
    const saved = {
        promptPresets: [{ id: 'mine', name: SCENE_PLANNER_PRESET_NAMES.normal, topSystem: '', sceneRules: '' }],
        selectedPromptPresetId: 'mine',
    };
    const { settings } = installScenePlannerPresets(saved, defaults, SD_VERSION, { installVersion: 9 });
    assert.equal(settings.promptPresets.length, 3);
    assert.deepEqual(settings.promptPresets[0], saved.promptPresets[0]);
    assert.equal(settings.selectedPromptPresetId, settings.promptPresets[1].id);
});

test('missing templates do not mark an installation complete or change existing settings', async () => {
    const defaults = await loadDefaults('sd-webui');
    for (const key of Object.keys(defaults)) {
        const saved = { _promptTemplateVersion: SD_VERSION - 1, promptPresets: [] };
        assert.throws(() => installScenePlannerPresets(saved, { ...defaults, [key]: '' }, SD_VERSION, { installVersion: 9 }));
        assert.deepEqual(saved, { _promptTemplateVersion: SD_VERSION - 1, promptPresets: [] });
    }
});

for (const [provider, targetVersion] of [
    ['novelai', NOVEL_VERSION],
    ['sd-webui', SD_VERSION],
    ['comfyui', COMFY_VERSION],
]) {
    const upgrade = (saved, defaults, installVersion) => provider === 'novelai'
        ? migrateLegacyNovelPromptSettings(saved, defaults, targetVersion)
        : installScenePlannerPresets(saved, defaults, targetVersion, { installVersion });

    test(`${provider} upgrades frozen default openings in place, preserving selection and all user edits`, async () => {
        const fixture = JSON.parse(await readFile(new URL('./fixtures/scene-planner-opening-v1.json', import.meta.url), 'utf8'));
        const defaults = await loadDefaults(provider);
        const installVersion = fixture.templateVersions[provider];
        const guide = provider === 'novelai'
            ? { modelGuideOverrides: { 'v4.5': '', v5: 'my model guide' } }
            : { tagGuideContent: 'my model guide' };
        const normal = { id: 'normal', name: 'renamed default', topSystem: fixture.topSystem, sceneRules: 'my scene rules', ...guide };
        const pov = { ...normal, id: 'pov', name: 'renamed pov', topSystem: fixture.topSystemPov.replace(/\n/g, '\r\n') };
        const custom = { ...normal, id: 'custom', name: SCENE_PLANNER_PRESET_NAMES.normal, topSystem: `${fixture.topSystem}\nmy edit` };
        const customPov = { ...pov, id: 'custom-pov', topSystem: `${fixture.topSystemPov}\nmy camera rules` };
        const empty = { ...normal, id: 'empty', topSystem: '' };
        const saved = {
            _promptTemplateVersion: installVersion,
            promptPresets: [normal, pov, custom, customPov, empty],
            selectedPresetId: 'keep-image-parameters',
        };
        // A content-only update never takes over the selected normal, POV or custom preset.
        for (const selectedPromptPresetId of saved.promptPresets.map(preset => preset.id)) {
            const input = { ...saved, selectedPromptPresetId };
            const before = structuredClone(input);
            const result = upgrade(input, defaults, installVersion);
            assert.equal(result.installed, false);
            assert.equal(provider === 'novelai' ? result.migrated : result.changed, true);
            assert.deepEqual(input, before);

            if (provider === 'novelai') {
                // NAI 强制刷新所有内置预设（含以 stock 名命名的用户副本），并补上进阶预设。
                assert.equal(result.settings._promptTemplateVersion, targetVersion);
                assert.equal(result.settings._builtinPresetVersion, 1);
                assert.equal(result.settings._proPresetVersion, 3);
                const presets = result.settings.promptPresets;
                assert.equal(presets.length, 6);
                assert.deepEqual(presets[0], { ...normal, topSystem: defaults.topSystem });
                assert.deepEqual(presets[1], { ...pov, topSystem: defaults.topSystemPov });
                assert.deepEqual(presets[2], {
                    ...custom,
                    builtin: true,
                    topSystem: defaults.topSystem,
                    sceneRules: defaults.sceneRules,
                });
                assert.deepEqual(presets[3], customPov);
                assert.deepEqual(presets[4], empty);
                const pro = presets[5];
                assert.equal(pro.name, SCENE_PLANNER_PRESET_NAMES.pro);
                assert.equal(pro.builtin, true);
                assert.equal(pro.sceneRules, defaults.sceneRulesPro);
            } else {
                assert.deepEqual(result.settings, {
                    ...input,
                    _promptTemplateVersion: targetVersion,
                    promptPresets: [
                        { ...normal, topSystem: defaults.topSystem },
                        { ...pov, topSystem: defaults.topSystemPov },
                        custom, customPov, empty,
                    ],
                });
            }

            const persisted = JSON.parse(JSON.stringify(result.settings));
            persisted.promptPresets = persisted.promptPresets.filter(preset => preset.id !== 'normal');
            persisted.promptPresets[0].topSystem = 'edited after update';
            const repeated = upgrade(persisted, {}, installVersion);
            assert.equal(repeated.installed, false);
            assert.equal(provider === 'novelai' ? repeated.migrated : repeated.changed, false);
            assert.deepEqual(repeated.settings, persisted);
        }
    });

    test(`${provider} does not recreate deleted default presets during an opening update`, async () => {
        const fixture = JSON.parse(await readFile(new URL('./fixtures/scene-planner-opening-v1.json', import.meta.url), 'utf8'));
        const defaults = await loadDefaults(provider);
        const saved = {
            _promptTemplateVersion: fixture.templateVersions[provider],
            promptPresets: [{ id: 'only-custom', name: 'my preset', topSystem: 'my opening', sceneRules: 'my rules' }],
            selectedPromptPresetId: 'only-custom',
        };
        const result = upgrade(saved, defaults, fixture.templateVersions[provider]);
        assert.equal(result.installed, false);
        if (provider === 'novelai') {
            // NAI 不重建已删除的常规内置预设，但会确保进阶预设存在。
            assert.equal(result.settings._promptTemplateVersion, targetVersion);
            assert.equal(result.settings._builtinPresetVersion, 1);
            assert.equal(result.settings._proPresetVersion, 3);
            const presets = result.settings.promptPresets;
            assert.equal(presets.length, 2);
            assert.deepEqual(presets[0], saved.promptPresets[0]);
            assert.equal(presets[1].name, SCENE_PLANNER_PRESET_NAMES.pro);
            assert.equal(presets[1].builtin, true);
            assert.equal(presets[1].sceneRules, defaults.sceneRulesPro);
        } else {
            assert.deepEqual(result.settings, { ...saved, _promptTemplateVersion: targetVersion });
        }
    });
}
