import {
    ScenePlannerErrorCategory,
    getScenePlannerErrorCategory,
} from './scene-plan-contract.js';

const ERROR_TYPE_KEYS_BY_CATEGORY = Object.freeze({
    [ScenePlannerErrorCategory.AGENT_CONFIG]: 'AGENT_CONFIG',
    [ScenePlannerErrorCategory.PROMPT]: 'PROMPT_EXPANSION',
    [ScenePlannerErrorCategory.TOOL_PROTOCOL]: 'TOOL_PROTOCOL',
    [ScenePlannerErrorCategory.SCHEMA]: 'SCENE_SCHEMA',
    [ScenePlannerErrorCategory.TIMEOUT]: 'TIMEOUT',
    [ScenePlannerErrorCategory.ABORTED]: 'ABORTED',
    [ScenePlannerErrorCategory.PROVIDER]: 'PROVIDER',
});

export function classifyScenePlannerErrorForUi(error, errorTypes) {
    const typeKey = ERROR_TYPE_KEYS_BY_CATEGORY[getScenePlannerErrorCategory(error)];
    const type = errorTypes[typeKey] || errorTypes.LLM;
    return { ...type, desc: error?.message || type.desc };
}
