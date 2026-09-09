import { extensionFolderPath } from "../../../../core/constants.js";
import { buildScenePlannerChainPreview } from '../../shared/scene-planner-frame.js';
import {
    fetchPromptTemplateFiles,
    SHARED_PROMPT_TEMPLATE_FILES,
} from '../../shared/scene-planner-templates.js';
import {
    getNovelModelCapability,
    NOVEL_PROMPT_GUIDES,
} from './novel-model-capabilities.js';

const GUIDE_PATHS = Object.freeze({
    [NOVEL_PROMPT_GUIDES.V45]: `${extensionFolderPath}/modules/draw/providers/novelai/TAG编写指南-V4.5.md`,
    [NOVEL_PROMPT_GUIDES.V5]: `${extensionFolderPath}/modules/draw/providers/novelai/提示词编写指南-V5.md`,
});

/**
 * 升级时提供独立的新版预设，版本标记与预设一起保存；不覆盖旧正文。
 */
const PROMPT_TEMPLATE_VERSION = 13;

/** 用户可编辑的默认值；内置骨架由 scene-planner-frame.js 生成，不在此列。 */
let LLM_PROMPT_CONFIG = {
    topSystem: '',
    topSystemPov: '',
    sceneRules: '',
};

const promptGuides = new Map();
const PROMPT_GUIDE_IDS = Object.freeze(Object.values(NOVEL_PROMPT_GUIDES));

/** 导出默认提示词配置（供 UI 显示默认值 / 重置） */
export { LLM_PROMPT_CONFIG as DEFAULT_PROMPT_CONFIG, PROMPT_TEMPLATE_VERSION };

/** 获取当前模型对应的指南键。 */
export function getNovelPromptGuideId(model) {
    return getNovelModelCapability(model).promptGuide;
}

/** Frontend-only planner instructions, derived from the model's execution capabilities. */
export function getNovelPlannerProfile(model) {
    const capability = getNovelModelCapability(model);
    return {
        imageModelName: capability.promptGuide === NOVEL_PROMPT_GUIDES.V5
            ? 'NovelAI Diffusion V5' : 'NovelAI Diffusion V4.5',
        centerMode: capability.centerMode,
        interactSyntax: 'directional',
        ucScope: 'character',
    };
}

/**
 * 只保留当前数据模型支持的用户指南覆盖。
 * 字段缺失表示跟随插件内置 MD；空字符串表示用户明确不注入指南。
 */
export function normalizeNovelPromptGuideOverrides(value) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const normalized = {};
    for (const guideId of PROMPT_GUIDE_IDS) {
        if (Object.prototype.hasOwnProperty.call(source, guideId)
            && typeof source[guideId] === 'string') {
            normalized[guideId] = source[guideId];
        }
    }
    return normalized;
}

/** 获取指定指南键的插件内置 MD。 */
export function getLoadedTagGuideById(guideId) {
    return promptGuides.get(guideId) || '';
}

/** 当前提示词预设有覆盖时使用覆盖，否则跟随对应的内置 MD。 */
export function getEffectiveNovelModelGuide(model, promptPreset) {
    const guideId = getNovelPromptGuideId(model);
    const overrides = normalizeNovelPromptGuideOverrides(promptPreset?.modelGuideOverrides);
    return Object.prototype.hasOwnProperty.call(overrides, guideId)
        ? overrides[guideId]
        : getLoadedTagGuideById(guideId);
}

/** 请求结构只读预览：system / user / tools 三节。 */
export function getPromptChainPreview(customPrompts, model) {
    return buildScenePlannerChainPreview({
        profile: getNovelPlannerProfile(model),
        hasTagGuide: !!getEffectiveNovelModelGuide(model, customPrompts).trim(),
    });
}

export async function loadTagGuide() {
    const { texts, ok } = await fetchPromptTemplateFiles(GUIDE_PATHS, '[NovelDraw Prompts]');
    promptGuides.clear();
    for (const [guideId, text] of Object.entries(texts)) promptGuides.set(guideId, text);
    if (ok) console.log('[NovelDraw Prompts] V4.5 / V5 模型提示词指南已加载');
    return ok;
}

/**
 * 加载可编辑默认模板（topSystem, topSystemPov, sceneRules）。
 * 必须在 loadSettings() 之前调用。
 */
export async function loadPromptTemplates() {
    const { texts, ok } = await fetchPromptTemplateFiles(SHARED_PROMPT_TEMPLATE_FILES, '[NovelDraw Prompts]');
    Object.assign(LLM_PROMPT_CONFIG, texts);
    if (ok) {
        console.log('[NovelDraw Prompts] 提示词模板已加载 (topSystem, topSystemPov, sceneRules)');
    } else {
        console.warn('[NovelDraw Prompts] 部分提示词文件加载失败，将使用空默认值');
    }
    return ok;
}
