import { NOVEL_PROMPT_GUIDES } from './novel-model-capabilities.js';
import { migrateLegacyNovelTagGuide } from './novel-prompt-migration.js';

const PROMPT_TEMPLATE_TYPE = 'novel-draw-prompt-template';
const SUPPORTED_GUIDE_IDS = new Set(Object.values(NOVEL_PROMPT_GUIDES));

function requirePromptFields(payload) {
    if (typeof payload.topSystem !== 'string' || typeof payload.sceneRules !== 'string') {
        throw new TypeError('提示词模板缺少 topSystem 或 sceneRules');
    }
}

function parseGuideOverrides(value, version) {
    if (value == null) return {};
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError(`V${version} 提示词模板的 modelGuideOverrides 格式无效`);
    }
    const entries = Object.entries(value);
    if (entries.some(([guideId, content]) =>
        !SUPPORTED_GUIDE_IDS.has(guideId) || typeof content !== 'string')) {
        throw new TypeError(`V${version} 提示词模板包含无效的模型指南覆盖`);
    }
    return Object.fromEntries(entries);
}

function parseV3ContractOverrides(value) {
    if (value == null) return {};
    if (typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError('V3 提示词模板的 modelContractOverrides 格式无效');
    }
    const entries = Object.entries(value);
    if (entries.some(([guideId, content]) =>
        !SUPPORTED_GUIDE_IDS.has(guideId) || typeof content !== 'string')) {
        throw new TypeError('V3 提示词模板包含无效的模型契约覆盖');
    }
    return Object.fromEntries(entries);
}

/**
 * Parses the released NovelAI prompt-template formats at the import boundary.
 * The runtime only receives the current prompt preset shape.
 */
export function parseNovelPromptPresetImport(payload, { fallbackName = '' } = {}) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)
        || payload._type !== PROMPT_TEMPLATE_TYPE) {
        throw new TypeError('不是有效的提示词模板文件');
    }
    if (![1, 2, 3].includes(payload._version)) {
        throw new TypeError(`不支持的提示词模板版本：${payload._version ?? '缺失'}`);
    }
    requirePromptFields(payload);

    let modelGuideOverrides;
    if (payload._version === 1) {
        if (typeof payload.tagGuideContent !== 'string') {
            throw new TypeError('V1 提示词模板缺少 tagGuideContent');
        }
        modelGuideOverrides = migrateLegacyNovelTagGuide(payload.tagGuideContent);
    } else {
        modelGuideOverrides = parseGuideOverrides(payload.modelGuideOverrides, payload._version);
    }

    const importedName = typeof payload.name === 'string' ? payload.name.trim() : '';
    return {
        name: importedName || String(fallbackName || '').trim() || '导入的提示词预设',
        topSystem: payload.topSystem,
        sceneRules: payload.sceneRules,
        modelGuideOverrides,
        modelContractOverrides: payload._version === 3
            ? parseV3ContractOverrides(payload.modelContractOverrides)
            : {},
    };
}
