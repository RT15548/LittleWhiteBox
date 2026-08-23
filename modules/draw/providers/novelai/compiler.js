import { assembleCharacterPrompts, joinTags } from '../../shared/character-prompts.js';
import { getNovelModelCapability, isNovelV5Model } from './novel-model-capabilities.js';
import { resolveNovelAIBackendImageApi, resolveNovelAIImageApi } from './novel-request-config.js';
import { buildNovelV5RequestBody } from './novel-v5-request.js';

const MAX_SEED = 0xFFFFFFFF;

function requireObject(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError(`${label}必须是对象`);
    }
    return value;
}

function normalizeSeed(value, index = 0) {
    const seed = Number(value);
    if (!Number.isInteger(seed) || seed < 0 || seed > MAX_SEED) {
        throw new TypeError(`NovelAI 第 ${index + 1} 项 seed 必须是 0～${MAX_SEED} 的整数`);
    }
    return seed;
}

function requireFiniteNumber(value, label, { allowZero = true } = {}) {
    const number = Number(value);
    if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) {
        throw new TypeError(`${label}必须是${allowZero ? '非负' : '正'}数`);
    }
    return number;
}

function mergeNovelParams(defaultParams, params) {
    const merged = { ...requireObject(defaultParams, 'NovelAI defaultParams') };
    Object.entries(requireObject(params, 'NovelAI params')).forEach(([key, value]) => {
        if (value !== null && value !== undefined) merged[key] = value;
    });
    return merged;
}

function applySizeOverride(params, overrideSize) {
    const match = String(overrideSize || '').trim().match(/^(832x1216|1216x832|1024x1024|768x1280|1280x768)$/i);
    if (!match) return { ...params };
    const [width, height] = match[1].toLowerCase().split('x').map(Number);
    return { ...params, width, height };
}

export function buildNovelAIRequestBody({
    scene,
    characterPrompts = [],
    negativePrompt,
    params = {},
    defaultParams = {},
    seed,
} = {}) {
    const effective = mergeNovelParams(defaultParams, params);
    const width = effective.width;
    const height = effective.height;
    const modelName = String(effective.model || '').trim();
    const normalizedSeed = normalizeSeed(seed);
    if (isNovelV5Model(modelName)) {
        return buildNovelV5RequestBody({
            scene,
            characterPrompts,
            negativePrompt,
            params: { ...effective, model: modelName },
            seed: normalizedSeed,
        });
    }
    const isV3 = modelName.includes('nai-diffusion-3') || modelName.includes('furry-3');
    const isV45 = modelName.includes('nai-diffusion-4-5');
    if (isV3) {
        const allCharPrompts = characterPrompts.map(prompt => prompt.prompt).filter(Boolean).join(', ');
        const fullPrompt = scene ? `${scene}, ${allCharPrompts}` : allCharPrompts;
        const allNegative = [negativePrompt, ...characterPrompts.map(prompt => prompt.uc)].filter(Boolean).join(', ');
        return {
            action: 'generate',
            input: String(fullPrompt || ''),
            model: modelName,
            parameters: {
                width,
                height,
                scale: effective.scale,
                seed: normalizedSeed,
                sampler: effective.sampler,
                noise_schedule: effective.scheduler,
                steps: effective.steps,
                n_samples: 1,
                negative_prompt: String(allNegative || ''),
                ucPreset: effective.ucPreset,
                sm: effective.sm,
                sm_dyn: effective.sm_dyn,
                dynamic_thresholding: effective.decrisper,
            },
        };
    }

    const useCoords = characterPrompts.some(prompt => (
        prompt.center && (prompt.center.x !== 0.5 || prompt.center.y !== 0.5)
    ));
    const skipCfgAboveSigma = isV45 && effective.variety_boost
        ? Math.pow((width * height) / 1011712, 0.5) * 58
        : null;
    const charCaptions = characterPrompts.map(prompt => ({
        char_caption: prompt.prompt || '',
        centers: [prompt.center || { x: 0.5, y: 0.5 }],
    }));
    const negativeCharCaptions = characterPrompts.map(prompt => ({
        char_caption: prompt.uc || '',
        centers: [prompt.center || { x: 0.5, y: 0.5 }],
    }));
    return {
        action: 'generate',
        input: String(scene || ''),
        model: modelName,
        parameters: {
            params_version: 3,
            width,
            height,
            scale: effective.scale,
            seed: normalizedSeed,
            sampler: effective.sampler,
            noise_schedule: effective.scheduler,
            steps: effective.steps,
            n_samples: 1,
            ucPreset: effective.ucPreset,
            qualityToggle: effective.qualityToggle,
            autoSmea: effective.autoSmea,
            cfg_rescale: effective.cfg_rescale,
            dynamic_thresholding: false,
            controlnet_strength: 1,
            legacy: false,
            legacy_v3_extend: false,
            use_coords: useCoords,
            legacy_uc: false,
            normalize_reference_strength_multiple: true,
            deliberate_euler_ancestral_bug: false,
            prefer_brownian: true,
            image_format: 'png',
            skip_cfg_above_sigma: skipCfgAboveSigma,
            characterPrompts: characterPrompts.map(prompt => ({
                prompt: prompt.prompt || '',
                uc: prompt.uc || '',
                center: prompt.center || { x: 0.5, y: 0.5 },
                enabled: true,
            })),
            v4_prompt: {
                caption: { base_caption: String(scene || ''), char_captions: charCaptions },
                use_coords: useCoords,
                use_order: true,
            },
            v4_negative_prompt: {
                caption: { base_caption: String(negativePrompt || ''), char_captions: negativeCharCaptions },
                legacy_uc: false,
            },
            negative_prompt: String(negativePrompt || ''),
        },
    };
}

export function compileNovelPromptForTask(task, recipe = {}) {
    const characterPrompts = Array.isArray(task?.characterPrompts)
        ? task.characterPrompts.filter(Boolean)
        : assembleCharacterPrompts(task?.chars || [], recipe.knownCharacters || [], { acceptGrid: false })
            .map(({ prompt, uc, center }) => ({ prompt, uc, center }));
    return {
        scene: joinTags(recipe.positivePrefix, task?.scene),
        negativePrompt: String(recipe.negativePrefix || ''),
        characterPrompts,
    };
}

export function compileNovelImageRequest(request, generationRecipe, seed) {
    const recipe = requireObject(generationRecipe, 'NovelAI generationRecipe');
    const params = applySizeOverride(mergeNovelParams(
        recipe.defaultParams || {},
        request?.params || recipe.params || {},
    ), recipe.overrideSize);
    const capability = getNovelModelCapability(params.model);
    const transport = capability.transport === 'msgpack-stream' ? 'msgpack-stream' : 'legacy-image';
    const apiUrl = recipe.resolveForBackend === false
        ? resolveNovelAIImageApi(recipe.apiBaseUrl, capability.transport)
        : resolveNovelAIBackendImageApi(recipe.apiBaseUrl, capability.transport, recipe.baseHref);
    return {
        apiUrl,
        legacyBaseUrl: String(recipe.apiBaseUrl || ''),
        payload: buildNovelAIRequestBody({
            scene: request?.scene,
            characterPrompts: request?.characterPrompts || [],
            negativePrompt: request?.negativePrompt,
            params,
            seed,
        }),
        isV5: capability.transport === 'msgpack-stream',
        transport,
    };
}

export function compile(scenePlan, generationRecipe) {
    const recipe = requireObject(generationRecipe, 'NovelAI generationRecipe');
    const tasks = Array.isArray(scenePlan) ? scenePlan : scenePlan?.tasks;
    if (!Array.isArray(tasks) || tasks.length === 0) throw new TypeError('NovelAI scenePlan 必须包含图片任务');
    if (!Array.isArray(recipe.seeds) || recipe.seeds.length !== tasks.length) {
        throw new TypeError('NovelAI generationRecipe.seeds 必须与图片任务一一对应');
    }
    const timeout = requireFiniteNumber(recipe.timeout, 'NovelAI generationRecipe.timeout', { allowZero: false });
    const minDelay = requireFiniteNumber(recipe.requestDelay?.min, 'NovelAI generationRecipe.requestDelay.min');
    const maxDelay = requireFiniteNumber(recipe.requestDelay?.max, 'NovelAI generationRecipe.requestDelay.max');
    if (maxDelay < minDelay) {
        throw new TypeError('NovelAI generationRecipe.requestDelay.max 不得小于 min');
    }
    const artifacts = tasks.map((task) => {
        const promptData = compileNovelPromptForTask(task, recipe);
        return { task, promptData, tags: task?.scene || '' };
    });
    return {
        provider: 'novelai',
        context: { key: String(recipe.apiKey || ''), insecure: recipe.insecureTLS === true },
        delay: { min: minDelay, max: maxDelay },
        items: artifacts.map(({ promptData }, index) => {
            const prepared = compileNovelImageRequest({
                ...promptData,
                params: recipe.params,
            }, recipe, normalizeSeed(recipe.seeds[index], index));
            return {
                request: {
                    transport: prepared.transport,
                    url: prepared.apiUrl,
                    payload: prepared.payload,
                },
                timeout,
            };
        }),
        artifacts,
    };
}
