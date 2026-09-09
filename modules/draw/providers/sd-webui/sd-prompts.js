import { extensionFolderPath } from "../../../../core/constants.js";
import { buildScenePlannerChainPreview } from '../../shared/scene-planner-frame.js';
import {
    fetchPromptTemplateFiles,
    SHARED_PROMPT_TEMPLATE_FILES,
} from '../../shared/scene-planner-templates.js';

const TAG_GUIDE_PATH = `${extensionFolderPath}/modules/draw/providers/sd-webui/SD_TAG编写指南.md`;

/** 升级时提供独立的新版预设，版本标记与预设一起保存；不覆盖旧正文。 */
export const PROMPT_TEMPLATE_VERSION = 9;

/** SD WebUI 的场景规划差异：整图负向、interact 为普通 tag、无坐标字段。 */
export const SD_PLANNER_PROFILE = Object.freeze({
    imageModelName: 'Stable Diffusion WebUI',
    centerMode: 'none',
    interactSyntax: 'plain',
    ucScope: 'global',
});


/** 用户可编辑的默认值；内置骨架由 scene-planner-frame.js 生成，不在此列。 */
export const SD_SCENE_PROMPTS = {
    topSystem: '',
    topSystemPov: '',
    sceneRules: '',
    tagGuideContent: '',
};

let tagGuideContent = '';

export { SD_SCENE_PROMPTS as DEFAULT_PROMPT_CONFIG };

export function getEffectiveTagGuide(customGuide) {
    if (typeof customGuide === 'string') return customGuide;
    return tagGuideContent;
}

export function getLoadedTagGuide() {
    return tagGuideContent;
}

/** 请求结构只读预览：system / user / tools 三节。 */
export function getPromptChainPreview(customPrompts) {
    return buildScenePlannerChainPreview({
        profile: SD_PLANNER_PROFILE,
        hasTagGuide: !!getEffectiveTagGuide(customPrompts?.tagGuideContent).trim(),
    });
}

export async function loadTagGuide() {
    const { texts, ok } = await fetchPromptTemplateFiles({ guide: TAG_GUIDE_PATH }, '[SD-Draw Prompts]');
    if (!ok) return false;
    tagGuideContent = texts.guide;
    SD_SCENE_PROMPTS.tagGuideContent = tagGuideContent;
    console.log('[SD-Draw Prompts] SD_TAG编写指南已加载');
    return true;
}

export async function loadPromptTemplates() {
    const { texts, ok } = await fetchPromptTemplateFiles(SHARED_PROMPT_TEMPLATE_FILES, '[SD-Draw Prompts]');
    Object.assign(SD_SCENE_PROMPTS, texts);
    if (ok) {
        console.log('[SD-Draw Prompts] 提示词模板已加载 (topSystem, topSystemPov, sceneRules)');
    } else {
        console.warn('[SD-Draw Prompts] 部分提示词文件加载失败，将使用空默认值');
    }
    return ok;
}
