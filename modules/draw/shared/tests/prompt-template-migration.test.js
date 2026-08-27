import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import {
    COMFY_RELEASED_PROMPT_DEFAULT_FINGERPRINTS,
    PROMPT_TEMPLATE_VERSION as COMFY_PROMPT_TEMPLATE_VERSION,
} from '../../providers/comfyui/comfy-prompts.js';
import {
    PROMPT_TEMPLATE_VERSION as SD_PROMPT_TEMPLATE_VERSION,
    SD_RELEASED_PROMPT_DEFAULT_FINGERPRINTS,
} from '../../providers/sd-webui/sd-prompts.js';
import {
    promptTemplateFingerprint,
    refreshReleasedPromptPresetDefaults,
} from '../prompt-template-migration.js';

const PROVIDERS = [{
    label: 'SD WebUI',
    fixtureUrl: new URL('../../providers/sd-webui/tests/fixtures/prompt-template-v6.json', import.meta.url),
    targetVersion: SD_PROMPT_TEMPLATE_VERSION,
    releasedFingerprints: SD_RELEASED_PROMPT_DEFAULT_FINGERPRINTS,
    currentPaths: {
        topSystem: '../../providers/sd-webui/prompts/top-system.md',
        topSystemPov: '../../providers/sd-webui/prompts/top-system-pov.md',
        tagGuideContent: '../../providers/sd-webui/SD_TAG编写指南.md',
        sceneRules: '../../providers/sd-webui/prompts/scene-rules.md',
    },
}, {
    label: 'ComfyUI',
    fixtureUrl: new URL('../../providers/comfyui/tests/fixtures/prompt-template-v7.json', import.meta.url),
    targetVersion: COMFY_PROMPT_TEMPLATE_VERSION,
    releasedFingerprints: COMFY_RELEASED_PROMPT_DEFAULT_FINGERPRINTS,
    currentPaths: {
        topSystem: '../../providers/comfyui/prompts/top-system.md',
        topSystemPov: '../../providers/comfyui/prompts/top-system-pov.md',
        tagGuideContent: '../../providers/comfyui/COMFY_TAG编写指南.md',
        sceneRules: '../../providers/comfyui/prompts/scene-rules.md',
    },
}];

async function loadProviderCase(provider) {
    const fixture = JSON.parse(await readFile(provider.fixtureUrl, 'utf8'));
    const entries = await Promise.all(Object.entries(provider.currentPaths).map(async ([key, relativePath]) => (
        [key, await readFile(new URL(relativePath, import.meta.url), 'utf8')]
    )));
    return { fixture, current: Object.fromEntries(entries) };
}

function assertFingerprintRegistered(registered, value) {
    const fingerprints = Array.isArray(registered) ? registered : [registered];
    assert.ok(fingerprints.includes(promptTemplateFingerprint(value)));
}

for (const provider of PROVIDERS) {
    test(`${provider.label} refreshes only frozen defaults and the upgrade is idempotent`, async () => {
        const { fixture, current } = await loadProviderCase(provider);
        const normalName = '默认-完整规则';
        const povName = '默认-第一人称完整规则';
        const releasedNormal = provider.releasedFingerprints[normalName];
        const releasedPov = provider.releasedFingerprints[povName];

        assert.equal(provider.targetVersion, fixture.templateVersion + 1);
        assertFingerprintRegistered(releasedNormal.topSystem, fixture.topSystem);
        assertFingerprintRegistered(releasedPov.topSystem, fixture.topSystemPov);
        assertFingerprintRegistered(releasedNormal.tagGuideContent, fixture.tagGuideContent);
        assertFingerprintRegistered(releasedNormal.sceneRules, fixture.sceneRules);

        const normal = {
            id: 'normal',
            name: normalName,
            topSystem: fixture.topSystem,
            tagGuideContent: fixture.tagGuideContent,
            sceneRules: fixture.sceneRules,
        };
        const pov = {
            id: 'pov',
            name: povName,
            topSystem: fixture.topSystemPov,
            tagGuideContent: fixture.tagGuideContent,
            sceneRules: fixture.sceneRules,
        };
        const edited = {
            ...normal,
            id: 'edited',
            topSystem: `${fixture.topSystem}\nuser edit`,
            tagGuideContent: `${fixture.tagGuideContent}\nuser edit`,
            sceneRules: `${fixture.sceneRules}\nuser edit`,
        };
        const custom = {
            id: 'custom',
            name: '我的预设',
            topSystem: fixture.topSystem,
            tagGuideContent: fixture.tagGuideContent,
            sceneRules: fixture.sceneRules,
        };
        const presets = [normal, pov, edited, custom];
        const getCurrentDefaults = (name) => ({
            topSystem: name === povName ? current.topSystemPov : current.topSystem,
            tagGuideContent: current.tagGuideContent,
            sceneRules: current.sceneRules,
        });

        const result = refreshReleasedPromptPresetDefaults(presets, {
            storedVersion: fixture.templateVersion,
            targetVersion: provider.targetVersion,
            releasedFingerprints: provider.releasedFingerprints,
            getCurrentDefaults,
        });

        assert.equal(result.templateVersion, provider.targetVersion);
        assert.deepEqual(result.presets[0], { ...normal, ...getCurrentDefaults(normalName) });
        assert.deepEqual(result.presets[1], { ...pov, ...getCurrentDefaults(povName) });
        assert.deepEqual(result.presets[2], edited);
        assert.deepEqual(result.presets[3], custom);
        assert.equal(normal.topSystem, fixture.topSystem);

        const repeated = refreshReleasedPromptPresetDefaults(result.presets, {
            storedVersion: result.templateVersion,
            targetVersion: provider.targetVersion,
            releasedFingerprints: provider.releasedFingerprints,
            getCurrentDefaults,
        });
        assert.equal(repeated.presets, result.presets);
        assert.equal(repeated.migrated, false);
    });
}
