import { NOVEL_PROMPT_GUIDES } from './novel-model-capabilities.js';
import { promptTemplateFingerprint } from '../../shared/prompt-template-migration.js';
import { installScenePlannerPresets } from '../../shared/scene-planner-presets.js';

// Upgrade boundary for prompt formats that have actually shipped.
// - upstream config v7 / prompt template v4: YAML-era preset fields.
// - prompt template v12: `modelContractOverrides` (per-model coordinate contract text);
//   the field has no runtime reader any more and is dropped.
// Remove the corresponding branch when that released input version is no longer supported.
const UPSTREAM_V4_PROMPT_FINGERPRINTS = Object.freeze({
    topSystem: '1280:7fa69e8a:fea74076',
    topSystemPov: '2674:753f2a61:208d9b17',
    tagGuide: '2488:54a0f676:0ec97a9a',
    userJsonFormat: '9753:8aae4f39:f6eaf107',
    legacyUserJsonFormat: '2280:fbc8792d:9d385adb',
});


const UPSTREAM_MANAGED_PRESETS = Object.freeze({
    '默认-模型要求高': { name: '默认-完整规则', pov: false },
    '默认-第一人称视角': { name: '默认-第一人称完整规则', pov: true },
    '默认-模型要求低': { name: '旧版-模型要求低（已升级）', pov: false },
});

/**
 * Converts the frozen V1/upstream tag guide field into the current override map.
 * A released default remains linked to the bundled guide; an edited value,
 * including an intentional empty string, becomes a V4.5 override.
 */
export function migrateLegacyNovelTagGuide(value) {
    if (typeof value !== 'string'
        || promptTemplateFingerprint(value) === UPSTREAM_V4_PROMPT_FINGERPRINTS.tagGuide) {
        return {};
    }
    return { [NOVEL_PROMPT_GUIDES.V45]: value };
}

function hasUpstreamV4Shape(preset) {
    return preset && typeof preset === 'object'
        && typeof preset.sceneRules !== 'string'
        && ('userJsonFormat' in preset || 'tagGuideContent' in preset);
}

function appendMigratedSection(sections, title, value, suffix = '') {
    const text = String(value || '').trim();
    if (!text) return;
    sections.push(`## ${title}\n\n${text}${suffix ? `\n\n${suffix}` : ''}`);
}

function convertUpstreamV4Preset(preset, currentDefaults) {
    const managed = UPSTREAM_MANAGED_PRESETS[String(preset.name || '')];
    const topFingerprint = promptTemplateFingerprint(preset.topSystem);
    const topSystem = topFingerprint === UPSTREAM_V4_PROMPT_FINGERPRINTS.topSystem
        ? currentDefaults.topSystem
        : topFingerprint === UPSTREAM_V4_PROMPT_FINGERPRINTS.topSystemPov
            ? currentDefaults.topSystemPov
            : typeof preset.topSystem === 'string'
                ? preset.topSystem
                : (managed?.pov ? currentDefaults.topSystemPov : currentDefaults.topSystem);
    const sections = [String(currentDefaults.sceneRules || '').trim()].filter(Boolean);
    let customContentPreserved = topFingerprint !== UPSTREAM_V4_PROMPT_FINGERPRINTS.topSystem
        && topFingerprint !== UPSTREAM_V4_PROMPT_FINGERPRINTS.topSystemPov;

    const modelGuideOverrides = migrateLegacyNovelTagGuide(preset.tagGuideContent);
    if (Object.prototype.hasOwnProperty.call(modelGuideOverrides, NOVEL_PROMPT_GUIDES.V45)) {
        customContentPreserved = true;
    }

    const rawFormat = String(preset.userJsonFormat || '');
    const format = rawFormat.trim();
    const formatFingerprint = promptTemplateFingerprint(rawFormat);
    if (format
        && formatFingerprint !== UPSTREAM_V4_PROMPT_FINGERPRINTS.userJsonFormat
        && formatFingerprint !== UPSTREAM_V4_PROMPT_FINGERPRINTS.legacyUserJsonFormat) {
        appendMigratedSection(
            sections,
            '从旧版预设迁移的自定义场景规则',
            format,
            '> 迁移约束：旧内容中的 YAML/JSON 输出格式、字段结构、anchor 定位和直接输出指令均已失效；提交方式只以当前 submit_scene_plan Tool Schema 为准。',
        );
        customContentPreserved = true;
    }

    return {
        preset: {
            id: preset.id,
            name: managed?.name || preset.name,
            topSystem,
            sceneRules: sections.join('\n\n'),
            modelGuideOverrides,
        },
        customContentPreserved,
    };
}

/**
 * `tagGuideContent` also existed in the released Tool-era preset shape.  It is
 * an obsolete field regardless of the surrounding template version, so remove
 * it at this upgrade boundary after the older YAML shape has been converted.
 * Current overrides win per guide key; the legacy V4.5 value only fills a
 * missing V4.5 override and never replaces another model's guide.
 */
function migrateLegacyTagGuideFields(presets) {
    let migrated = false;
    const next = presets.map((preset) => {
        if (!preset || typeof preset !== 'object'
            || !Object.prototype.hasOwnProperty.call(preset, 'tagGuideContent')) {
            return preset;
        }

        migrated = true;
        const copy = { ...preset };
        const existingOverrides = copy.modelGuideOverrides;
        const hasCurrentV45Override = existingOverrides
            && typeof existingOverrides === 'object'
            && !Array.isArray(existingOverrides)
            && Object.prototype.hasOwnProperty.call(existingOverrides, NOVEL_PROMPT_GUIDES.V45)
            && typeof existingOverrides[NOVEL_PROMPT_GUIDES.V45] === 'string';
        delete copy.tagGuideContent;
        if (!hasCurrentV45Override) {
            const currentOverrides = existingOverrides
                && typeof existingOverrides === 'object'
                && !Array.isArray(existingOverrides)
                ? existingOverrides
                : {};
            copy.modelGuideOverrides = {
                ...currentOverrides,
                ...migrateLegacyNovelTagGuide(preset.tagGuideContent),
            };
        }
        return copy;
    });
    return { presets: next, migrated };
}

/** Template v12 shipped `modelContractOverrides`; nothing reads it now, so it leaves here. */
function dropModelContractOverrides(presets) {
    let migrated = false;
    const next = presets.map((preset) => {
        if (!preset || typeof preset !== 'object'
            || !Object.prototype.hasOwnProperty.call(preset, 'modelContractOverrides')) {
            return preset;
        }
        migrated = true;
        const copy = { ...preset };
        delete copy.modelContractOverrides;
        return copy;
    });
    return { presets: next, migrated };
}

/**
 * Converts released prompt preset inputs once, before current normalization.
 * The returned presets contain only current runtime fields.
 */
function migrateLegacyNovelPromptPresets(
    presets,
    { configVersion = 0, currentDefaults } = {},
) {
    if (!Array.isArray(presets)) {
        return {
            presets,
            migrated: false,
            upstreamPresetCount: 0,
            customPresetCount: 0,
        };
    }
    if (!currentDefaults || typeof currentDefaults !== 'object') {
        throw new TypeError('currentDefaults is required');
    }

    let upstreamPresetCount = 0;
    let customPresetCount = 0;
    let converted = presets;
    if (Number(configVersion) <= 7 && presets.some(hasUpstreamV4Shape)) {
        converted = presets.map((preset) => {
            if (!hasUpstreamV4Shape(preset)) return preset;
            const result = convertUpstreamV4Preset(preset, currentDefaults);
            upstreamPresetCount += 1;
            if (result.customContentPreserved) customPresetCount += 1;
            return result.preset;
        });
    }

    const legacyGuideMigration = migrateLegacyTagGuideFields(converted);
    const contractRemoval = dropModelContractOverrides(legacyGuideMigration.presets);
    const migrated = upstreamPresetCount > 0
        || legacyGuideMigration.migrated
        || contractRemoval.migrated;
    return {
        presets: contractRemoval.presets,
        migrated,
        upstreamPresetCount,
        customPresetCount,
    };
}

export function migrateLegacyNovelPromptSettings(saved, currentDefaults, targetVersion) {
    const source = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    const result = migrateLegacyNovelPromptPresets(source.promptPresets, {
        configVersion: source.configVersion,
        currentDefaults,
    });
    const installation = installScenePlannerPresets({
        ...source,
        promptPresets: result.presets,
    }, currentDefaults, targetVersion);
    return {
        ...result,
        settings: installation.settings,
        presets: installation.settings.promptPresets,
        templateVersion: installation.settings._promptTemplateVersion,
        migrated: result.migrated || installation.installed,
        installed: installation.installed,
    };
}
