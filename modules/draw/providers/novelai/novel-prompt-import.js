import { NOVEL_PROMPT_GUIDES } from './novel-model-capabilities.js';
import { migrateLegacyNovelTagGuide } from './novel-prompt-migration.js';
import { isDefaultLayout, layoutForStorage, normalizeLayout } from '../../shared/scene-planner-layout.js';

const PROMPT_TEMPLATE_TYPE = 'novel-draw-prompt-template';
const SUPPORTED_GUIDE_IDS = new Set(Object.values(NOVEL_PROMPT_GUIDES));
// V3 = 不带消息布局的最后一个版本；V4 起可带 layout 字段。
const LAYOUT_FREE_EXPORT_VERSION = 3;
const LAYOUT_EXPORT_VERSION = 4;
const SUPPORTED_IMPORT_VERSIONS = [1, 2, 3, 4];

/**
 * 导出文件该写哪个版本号：默认 / 缺省布局仍写 3，旧版本插件照常能导入；
 * 带自定义布局的写 4，旧版本会按"不支持的版本"明确拒绝，而不是悄悄丢掉布局后导入成另一个模样。
 */
export function promptTemplateExportVersion(layout) {
    return isDefaultLayout(layout) ? LAYOUT_FREE_EXPORT_VERSION : LAYOUT_EXPORT_VERSION;
}

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

// 只在 V4 文件里读 layout。类型明显不对（字符串 / 数字 / 数组）直接报错；
// 对象里的细节问题（缺内置块、重复 id 等）交给 normalizeLayout 修复并把修复说明带回去。
function parseLayout(payload) {
    if (payload.layout == null) return { notes: [] };
    if (typeof payload.layout !== 'object' || Array.isArray(payload.layout)) {
        throw new TypeError(`V${payload._version} 提示词模板的 layout 格式无效`);
    }
    const { layout, notes } = normalizeLayout(payload.layout);
    return { layout: layoutForStorage(layout), notes };
}

/**
 * Parses the released NovelAI prompt-template formats at the import boundary.
 * The runtime only receives the current prompt preset shape.
 * V3 files may carry `modelContractOverrides` (template v12 era); the field has no
 * runtime reader any more and is ignored.
 * V4 files may carry `layout` (消息布局). It is returned only when it differs from the default;
 * `layoutNotes` (repair notes) is returned only when something was repaired. Both keys are absent otherwise,
 * so older shapes stay strictly equal to what they were.
 */
export function parseNovelPromptPresetImport(payload, { fallbackName = '' } = {}) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)
        || payload._type !== PROMPT_TEMPLATE_TYPE) {
        throw new TypeError('不是有效的提示词模板文件');
    }
    if (!SUPPORTED_IMPORT_VERSIONS.includes(payload._version)) {
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
    const result = {
        name: importedName || String(fallbackName || '').trim() || '导入的提示词预设',
        topSystem: payload.topSystem,
        sceneRules: payload.sceneRules,
        modelGuideOverrides,
    };
    if (payload._version >= LAYOUT_EXPORT_VERSION) {
        const { layout, notes } = parseLayout(payload);
        if (layout) result.layout = layout;
        if (notes.length > 0) result.layoutNotes = notes;
    }
    return result;
}
