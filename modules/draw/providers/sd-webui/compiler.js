import { assembleCharacterPrompts, joinTags } from '../../shared/character-prompts.js';

export const SD_REQUEST_DELAY_MS = 1000;

function clampNumber(value, fallback, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
}

function requireObject(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new TypeError(`${label}必须是对象`);
    }
    return value;
}

function requireFiniteNumber(value, label, { allowZero = true } = {}) {
    const number = Number(value);
    if (!Number.isFinite(number) || (allowZero ? number < 0 : number <= 0)) {
        throw new TypeError(`${label}必须是${allowZero ? '非负' : '正'}数`);
    }
    return number;
}

export function buildSdImageRequest({ prompt, negativePrompt = '', params = {} } = {}) {
    const effective = requireObject(params, 'SD WebUI params');
    const body = {
        prompt: String(prompt || '').trim(),
        negative_prompt: String(negativePrompt || '').trim(),
    };

    if (Number.isFinite(Number(effective.width))) body.width = clampNumber(effective.width, 512, 64, 2048);
    if (Number.isFinite(Number(effective.height))) body.height = clampNumber(effective.height, 512, 64, 2048);
    if (Number.isFinite(Number(effective.steps))) body.steps = clampNumber(effective.steps, 20, 1, 150);
    if (Number.isFinite(Number(effective.cfg_scale))) body.cfg_scale = clampNumber(effective.cfg_scale, 7, 1, 30);
    if (effective.sampler_name) body.sampler_name = String(effective.sampler_name);
    if (Number.isFinite(Number(effective.seed))) body.seed = Number(effective.seed);
    if (Number.isFinite(Number(effective.batch_size))) body.batch_size = clampNumber(effective.batch_size, 1, 1, 16);
    if (Number.isFinite(Number(effective.n_iter))) body.n_iter = clampNumber(effective.n_iter, 1, 1, 16);
    body.restore_faces = effective.restore_faces === true;
    body.tiling = effective.tiling === true;
    body.enable_hr = effective.enable_hr === true;
    if (body.enable_hr) {
        if (Number.isFinite(Number(effective.hr_scale))) body.hr_scale = clampNumber(effective.hr_scale, 1.5, 1, 4);
        if (effective.hr_upscaler) body.hr_upscaler = String(effective.hr_upscaler);
        if (Number.isFinite(Number(effective.denoising_strength))) {
            body.denoising_strength = clampNumber(effective.denoising_strength, 0.45, 0, 1);
        }
    }

    const model = effective.selectedModel ?? effective.model;
    const overrideSettings = {};
    if (model) overrideSettings.sd_model_checkpoint = model;
    if (Number.isFinite(Number(effective.clip_skip))) {
        overrideSettings.CLIP_stop_at_last_layers = clampNumber(effective.clip_skip, 1, 1, 12);
    }
    if (Object.keys(overrideSettings).length) body.override_settings = overrideSettings;
    if (!body.prompt) throw new Error('Prompt 不能为空');
    return body;
}

export function compileSdPromptForTask(task, recipe = {}) {
    const characterPrompts = Array.isArray(task?.characterPrompts)
        ? task.characterPrompts.filter(Boolean)
        : assembleCharacterPrompts(task?.chars || [], recipe.knownCharacters || [], {
            preserveDanbooruCanonical: true,
        });
    const promptOverride = String(recipe.promptOverride || '').trim();
    const negativeOverride = String(recipe.negativePromptOverride || '').trim();
    if (promptOverride) {
        return {
            positive: joinTags(recipe.positivePrefix, promptOverride),
            negative: joinTags(recipe.negativePrefix, negativeOverride),
            characterPrompts,
        };
    }
    const charPositive = characterPrompts.map(item => item.prompt).filter(Boolean).join(', ');
    const charNegative = characterPrompts.map(item => item.uc).filter(Boolean).join(', ');
    return {
        positive: joinTags(recipe.positivePrefix, task?.scene, charPositive),
        negative: joinTags(recipe.negativePrefix, negativeOverride, charNegative),
        characterPrompts,
    };
}

export function compile(scenePlan, generationRecipe) {
    const recipe = requireObject(generationRecipe, 'SD WebUI generationRecipe');
    const tasks = Array.isArray(scenePlan) ? scenePlan : scenePlan?.tasks;
    if (!Array.isArray(tasks) || tasks.length === 0) throw new TypeError('SD WebUI scenePlan 必须包含图片任务');
    const timeout = requireFiniteNumber(recipe.timeout, 'SD WebUI generationRecipe.timeout', { allowZero: false });
    const delay = requireFiniteNumber(recipe.delayMs, 'SD WebUI generationRecipe.delayMs');
    const params = requireObject(recipe.params, 'SD WebUI generationRecipe.params');
    const artifacts = tasks.map((task) => ({
        task,
        promptData: compileSdPromptForTask(task, recipe),
        tags: task?.scene || recipe.promptOverride || '',
    }));

    return {
        provider: 'sd-webui',
        context: {
            url: String(recipe.host || '').trim(),
            auth: String(recipe.auth || ''),
        },
        delay: { min: delay, max: delay },
        items: artifacts.map(({ promptData }) => ({
            request: {
                payload: buildSdImageRequest({
                    prompt: promptData.positive,
                    negativePrompt: promptData.negative,
                    params,
                }),
            },
            timeout,
        })),
        artifacts,
    };
}
