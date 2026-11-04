import { compile as compileComfyUi } from './providers/comfyui/compiler.js';
import { compile as compileNovelAi } from './providers/novelai/compiler.js';
import { getNovelModelCapability } from './providers/novelai/novel-model-capabilities.js';
import { compile as compileSdWebUi } from './providers/sd-webui/compiler.js';
import {
    assertDrawRunId,
    createDrawRunId,
    deriveDrawRunChildJobId,
    deriveDrawRunItemIds,
} from './shared/draw-run-identifiers.js';
import { executePreparedScenePlanner } from './shared/scene-planner-executor.js';
import { assertSubmitScenePlanTool } from './shared/scene-plan-contract.js';
import { assertScenePlannerMessages } from './shared/scene-planner-messages.js';
import { hashSceneSource } from './shared/scene-source.js';
export { assertCustomToolSources } from './shared/custom-tools.js';
export { buildDisplayMetadata, createProgressDiagnostic } from './server/draw-runs/projection.js';
import { buildDisplayMetadata } from './server/draw-runs/projection.js';

export function createDrawRunHandoff(runId, provider, sourceHash, compiled, scenePoints) {
    if (!Array.isArray(compiled.items) || !Array.isArray(compiled.artifacts)
        || compiled.items.length === 0 || compiled.items.length !== compiled.artifacts.length) {
        throw new Error('Draw Run compiler returned misaligned image items and artifacts');
    }
    const items = compiled.artifacts.map((artifact, index) => {
        const point = scenePoints?.[Number(artifact.task?.placement?.insertAfter) - 1];
        if (!point || !Number.isInteger(point.offset)) throw new Error(`Draw Run compiler artifact ${index + 1} has an invalid placement`);
        return { index, ...deriveDrawRunItemIds(runId, index), insertOffset: point.offset, displayMetadata: buildDisplayMetadata(artifact) };
    });
    return { childJobId: deriveDrawRunChildJobId(runId), provider, sourceHash, placementContract: 1, items };
}

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
    assertScenePlannerMessages,
    assertSubmitScenePlanTool,
    createDrawRunId,
    deriveDrawRunChildJobId,
    deriveDrawRunItemIds,
    executePreparedScenePlanner,
    getNovelModelCapability,
    hashSceneSource,
};
