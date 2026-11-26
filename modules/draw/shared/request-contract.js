import { DRAW_DIMENSION_BOUNDS, NOVEL_FIXED_DRAW_SIZES } from './draw-size.js';
import { GEMINI_ASPECT_RATIOS, GEMINI_IMAGE_SIZES, OPENAI_SIZES, OPENAI_QUALITIES, OPENAI_BACKGROUNDS, OPENAI_OUTPUT_FORMATS } from '../providers/multimodal/settings-model.js';
// JSON-representable public drawing fields. Callback controls stay host-owned.
const text = description => ({ type: 'string', ...(description ? { description } : {}) });
const number = { type: 'number' }, integer = { type: 'integer' }, positiveInteger = { type: 'integer', minimum: 1 }, boolean = { type: 'boolean' };
export const DRAW_REQUEST_PROPERTIES = Object.freeze({
    provider: { type: 'string', enum: ['novelai', 'sdwebui', 'comfyui', 'gemini', 'openai'], description: 'Omitted: the currently selected drawing provider. openai uses GPT Image.' },
    apiPresetId: text('Connection preset ID from DrawPresets. Omitted: current connection.'),
    paramsPresetId: text('Parameter preset ID from DrawPresets. Explicit request parameters override its defaults.'),
    workflowPresetId: text('ComfyUI workflow preset ID from DrawPresets.'),
    prompt: text('Positive scene prompt. Provider-specific tag syntax or natural language as appropriate.'),
    negativePrompt: text('Complete negative prompt; an explicit empty string clears the preset negative prompt.'),
    positivePrefix: text('Replaces the preset positive prefix; an empty string uses only the supplied prompt and character prompts.'),
    characterPrompts: { type: 'array', items: { type: 'object', properties: {
        prompt: text('Character positive prompt.'), uc: text('Character negative prompt.'),
        center: { type: 'object', properties: { x: { type: 'number', minimum: 0, maximum: 1 }, y: { type: 'number', minimum: 0, maximum: 1 } }, required: ['x', 'y'], additionalProperties: false },
    }, additionalProperties: false } },
    overrideSize: text(`Image size. Omitted: the size currently chosen in the user's drawing panel. "default": the size of the selected parameter preset. NovelAI accepts ${NOVEL_FIXED_DRAW_SIZES.join(', ')}. SD WebUI and ComfyUI accept WIDTHxHEIGHT with each side ${DRAW_DIMENSION_BOUNDS.join('–')}; ComfyUI custom workflows need both size node mappings. Gemini accepts aspect ratios ${GEMINI_ASPECT_RATIOS.join(', ')}. GPT Image accepts ${OPENAI_SIZES.join(', ')}. Explicit provider-specific size parameters in params override this selection.`),
    params: { type: 'object', description: [
        'Per-request generation parameters. Omitted fields keep the parameter preset\'s values. Each provider accepts only its own fields:',
        'NovelAI: model, width, height, steps, seed, sampler, scheduler, scale. V5 models add cfg_rescale, v5QualityPresetId, v5UcPresetId, transparentBackground. V3 models add ucPreset, sm, sm_dyn, decrisper. Other models add ucPreset, qualityToggle, autoSmea, cfg_rescale, and variety_boost on 4.5 models.',
        'SD WebUI: model, sampler_name, width, height, steps, cfg_scale, seed, batch_size, n_iter, restore_faces, tiling, enable_hr, hr_scale, hr_upscaler, denoising_strength, clip_skip, positivePrefix, negativePrefix. batch_size × n_iter images are produced.',
        'ComfyUI simple workflow: model, sampler, scheduler, steps, cfg, width, height, positivePrefix, negativePrefix. Custom workflows accept width, height, positivePrefix and negativePrefix when the workflow maps those nodes.',
        `Gemini: model, aspectRatio (${GEMINI_ASPECT_RATIOS.join(', ')}), imageSize (${GEMINI_IMAGE_SIZES.join(', ')}). GPT Image (openai): model, size (${OPENAI_SIZES.join(', ')}), quality (${OPENAI_QUALITIES.join(', ')}), background (${OPENAI_BACKGROUNDS.join(', ')}). These services use the scene Agent to adapt all text inputs into a complete non-explicit image description.`,
    ].join('\n'), properties: {
        model: text(), width: positiveInteger, height: positiveInteger, steps: positiveInteger, seed: integer,
        sampler: text(), scheduler: text(), scale: number, qualityToggle: boolean, autoSmea: boolean,
        ucPreset: integer, cfg_rescale: number, variety_boost: boolean, sm: boolean, sm_dyn: boolean, decrisper: boolean,
        v5QualityPresetId: text('NovelAI V5 quality preset ID.'), v5UcPresetId: text('NovelAI V5 undesired-content preset ID.'), transparentBackground: boolean,
        sampler_name: text(), cfg_scale: number, batch_size: positiveInteger, n_iter: positiveInteger,
        restore_faces: boolean, tiling: boolean, enable_hr: boolean, hr_scale: number, hr_upscaler: text(), denoising_strength: number, clip_skip: positiveInteger,
        cfg: number, positivePrefix: text(), negativePrefix: text(),
        aspectRatio: text(), imageSize: text(), size: text(), quality: text(), background: text(),
        outputFormat: { type: 'string', enum: OPENAI_OUTPUT_FORMATS, description: 'GPT Image output format. Omitted: use the parameter preset. Transparent backgrounds require PNG or WebP.' },
    }, additionalProperties: false },
    seed: { type: 'integer', minimum: 0, description: 'ComfyUI seed. NovelAI and SD WebUI use params.seed.' },
    workflowMode: { type: 'string', enum: ['simple', 'custom'], description: 'ComfyUI workflow mode.' },
    customWorkflow: { type: 'object', properties: Object.fromEntries(['json', 'nodePositive', 'nodeNegative', 'nodeWidth', 'nodeHeight', 'nodeSeed', 'nodeSaveImage'].map(key => [key, text()])), additionalProperties: false },
});
// Binary inputs belong to programmatic callers, not the model-facing parameter schema.
export const DRAW_REQUEST_FIELDS = Object.freeze([...Object.keys(DRAW_REQUEST_PROPERTIES), 'referenceImages', 'signal', 'onProgress']);
