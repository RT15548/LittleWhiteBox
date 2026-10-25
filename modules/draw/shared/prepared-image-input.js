import { compile as compileNovel } from '../providers/novelai/compiler.js';
import { compile as compileSd } from '../providers/sd-webui/compiler.js';
import { compile as compileComfy } from '../providers/comfyui/compiler.js';

const compilers = { novelai: compileNovel, 'sd-webui': compileSd, comfyui: compileComfy };

// Provider preparation is local and deterministic for the captured recipe.
// The existing provider batch runners consume these exact compiled requests;
// cards and message adoption share the same saved, editable input.
export function prepareImageInput(provider, tasks, recipe) {
    const compiledBatch = compilers[provider](tasks, recipe);
    const novel = provider === 'novelai';
    const requests = compiledBatch.artifacts.map(({ promptData }) => ({
        ...(novel ? { scene: promptData.scene } : { prompt: promptData.positive }),
        characterPrompts: promptData.characterPrompts,
        negativePrompt: novel ? promptData.negativePrompt : promptData.negative,
        params: recipe.params,
    }));
    const metadata = compiledBatch.artifacts.map(({ task, promptData }) => ({
        tags: task.scene || '',
        orientation: task.orientation ?? null,
        positive: novel ? promptData.scene : promptData.positive,
        characterPrompts: promptData.characterPrompts,
        negativePrompt: novel ? promptData.negativePrompt : promptData.negative,
        // ComfyUI 的整图追加位（post_prompt 已被编译器拼进 positive，这里单独带上供编辑重建）
        postPrompt: task.post_prompt || '',
    }));
    return { compiledBatch, requests, metadata };
}
