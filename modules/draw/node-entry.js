import { compile as compileComfyUi } from './providers/comfyui/compiler.js';
import { compile as compileNovelAi } from './providers/novelai/compiler.js';
import { compile as compileSdWebUi } from './providers/sd-webui/compiler.js';
import {
    assertDrawRunId,
    createDrawRunId,
    deriveDrawRunChildJobId,
    deriveDrawRunItemIds,
} from './shared/draw-run-identifiers.js';
import { executePreparedScenePlanner } from './shared/scene-planner-executor.js';
import { hashSceneSource } from './shared/scene-source.js';

const PROVIDER_COMPILERS = Object.freeze({
    novelai: compileNovelAi,
    'sd-webui': compileSdWebUi,
    comfyui: compileComfyUi,
});

export function compileDrawRunImages(provider, scenePlan, generationRecipe) {
    const compiler = PROVIDER_COMPILERS[String(provider || '')];
    if (!compiler) throw new TypeError('Draw Run 图片 Provider 无效');
    return compiler(scenePlan, generationRecipe);
}

export {
    assertDrawRunId,
    createDrawRunId,
    deriveDrawRunChildJobId,
    deriveDrawRunItemIds,
    executePreparedScenePlanner,
    hashSceneSource,
};
