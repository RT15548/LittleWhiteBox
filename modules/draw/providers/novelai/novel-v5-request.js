import {
    getNovelModelCapability,
    NOVEL_MODEL_IDS,
} from './novel-model-capabilities.js';

export const V5_QUALITY_PRESETS = Object.freeze({
    standard: 'very aesthetic, masterpiece, no text',
    light: 'very aesthetic, amazing quality, no text',
    none: '',
});

export const V5_UC_PRESETS = Object.freeze({
    heavy: 'lowres, artistic error, film grain, scan artifacts, worst quality, bad quality, jpeg artifacts, very displeasing, chromatic aberration, dithering, halftone, screentone, multiple views, logo, too many watermarks, negative space, blank page',
    light: 'lowres, bad hands, bad anatomy, artistic error, sepia, white haze, worst quality, very displeasing, jpeg artifacts, 0::ai-generated::',
    furryFocus: '{worst quality}, distracting watermark, unfinished, bad quality, {widescreen}, upscale, {sequence}, {{grandfathered content}}, blurred foreground, chromatic aberration, sketch, everyone, [sketch background], simple, [flat colors], ych (character), outline, multiple scenes, [[horror (theme)]], comic',
    humanFocus: 'lowres, artistic error, film grain, scan artifacts, worst quality, bad quality, jpeg artifacts, very displeasing, chromatic aberration, dithering, halftone, screentone, multiple views, logo, too many watermarks, negative space, blank page, @_@, mismatched pupils, glowing eyes, bad anatomy',
    none: '',
});

export const V5_QUALITY_IDS = Object.freeze(Object.keys(V5_QUALITY_PRESETS));
export const V5_UC_IDS = Object.freeze(Object.keys(V5_UC_PRESETS));

const MAX_SEED = 0xFFFFFFFF;

export class NovelV5RequestError extends Error {
    constructor(message, code = 'V5_REQUEST_INVALID') {
        super(message);
        this.name = 'NovelV5RequestError';
        this.code = code;
    }
}

function normalizeNumber(value, name, fallback, {
    integer = false,
    min = -Infinity,
    max = Infinity,
} = {}) {
    if (value === undefined) return fallback;
    if (value === null || (typeof value === 'string' && !value.trim())) {
        throw new NovelV5RequestError(`NovelAI V5 ${name} 不能为空`);
    }
    const normalized = Number(value);
    if (!Number.isFinite(normalized)
        || (integer && !Number.isInteger(normalized))
        || normalized < min
        || normalized > max) {
        const range = Number.isFinite(min) || Number.isFinite(max)
            ? `，范围 ${Number.isFinite(min) ? min : '-∞'}～${Number.isFinite(max) ? max : '+∞'}`
            : '';
        throw new NovelV5RequestError(
            `NovelAI V5 ${name} 必须是${integer ? '整数' : '有限数字'}${range}`,
        );
    }
    return normalized;
}

function normalizeRequiredText(value, name, fallback) {
    const normalized = value === undefined ? fallback : String(value).trim();
    if (!normalized) throw new NovelV5RequestError(`NovelAI V5 ${name} 不能为空`);
    return normalized;
}

function normalizeCharacterCenter(center, index) {
    if (center === undefined || center === null) return { x: 0.5, y: 0.5 };
    if (typeof center !== 'object' || Array.isArray(center)) {
        throw new NovelV5RequestError(`NovelAI V5 第 ${index + 1} 个角色的 center 必须是坐标对象`);
    }
    if (center.x === null || center.y === null
        || (typeof center.x === 'string' && !center.x.trim())
        || (typeof center.y === 'string' && !center.y.trim())) {
        throw new NovelV5RequestError(`NovelAI V5 第 ${index + 1} 个角色的 center.x/y 不能为空`);
    }
    const x = Number(center.x);
    const y = Number(center.y);
    if (!Number.isFinite(x) || x < 0 || x > 1 || !Number.isFinite(y) || y < 0 || y > 1) {
        throw new NovelV5RequestError(`NovelAI V5 第 ${index + 1} 个角色的 center.x/y 必须在 0～1`);
    }
    return { x, y };
}

function normalizePresetId(value, allowed, fallback) {
    const id = String(value || '');
    return allowed.includes(id) ? id : fallback;
}

function cleanPromptPart(value) {
    return String(value || '').trim().replace(/^[,\s]+|[,\s]+$/g, '');
}

function joinPromptParts(...values) {
    return values.map(cleanPromptPart).filter(Boolean).join(', ');
}

export function appendV5AutomaticPrompt(scene, suffixes = []) {
    const source = String(scene || '').trim();
    const textBlockIndex = source.search(/\bText\s*:/i);
    const promptBody = (textBlockIndex < 0 ? source : source.slice(0, textBlockIndex)).trimEnd();
    const existingParts = new Set(
        promptBody.split(',').map(cleanPromptPart).filter(Boolean).map(part => part.toLowerCase()),
    );
    const automatic = joinPromptParts(
        ...suffixes
            .flatMap(value => String(value || '').split(','))
            .filter(value => !existingParts.has(cleanPromptPart(value).toLowerCase())),
    );
    if (!automatic) return source;
    if (textBlockIndex < 0) return joinPromptParts(source, automatic);
    const textBlock = source.slice(textBlockIndex).trimStart();
    return `${joinPromptParts(promptBody, automatic)}\n${textBlock}`.trim();
}

export function buildNovelV5RequestBody({ scene, characterPrompts = [], negativePrompt, params = {}, seed }) {
    if (!params || typeof params !== 'object' || Array.isArray(params)) {
        throw new NovelV5RequestError('NovelAI V5 params 必须是对象');
    }
    const model = normalizeRequiredText(params.model, 'model', NOVEL_MODEL_IDS.V5_FULL);
    const capability = getNovelModelCapability(model);
    if (capability.family !== 'v5') {
        throw new NovelV5RequestError(`NovelAI V5 请求不支持模型：${model}`, 'V5_MODEL_UNSUPPORTED');
    }
    if (!Array.isArray(characterPrompts)) {
        throw new NovelV5RequestError('NovelAI V5 characterPrompts 必须是数组');
    }
    if (characterPrompts.length > capability.maxCharactersPerImage) {
        throw new NovelV5RequestError(
            `NovelAI V5 每张图最多支持 ${capability.maxCharactersPerImage} 个角色提示词`,
            'V5_CHARACTER_LIMIT_EXCEEDED',
        );
    }
    characterPrompts.forEach((character, index) => {
        if (!character || typeof character !== 'object' || Array.isArray(character)) {
            throw new NovelV5RequestError(`NovelAI V5 第 ${index + 1} 个角色提示词必须是对象`);
        }
    });
    const width = normalizeNumber(params.width, 'width', 832, { integer: true, min: 1 });
    const height = normalizeNumber(params.height, 'height', 1216, { integer: true, min: 1 });
    const scale = normalizeNumber(params.scale, 'scale', 7, { min: 0 });
    const steps = normalizeNumber(params.steps, 'steps', 23, { integer: true, min: 1 });
    const cfgRescale = normalizeNumber(params.cfg_rescale, 'cfg_rescale', 0, { min: 0, max: 1 });
    const normalizedSeed = normalizeNumber(seed, 'seed', undefined, {
        integer: true,
        min: 0,
        max: MAX_SEED,
    });
    if (normalizedSeed === undefined) {
        throw new NovelV5RequestError('NovelAI V5 seed 不能为空');
    }
    const sampler = normalizeRequiredText(params.sampler, 'sampler', 'k_euler_ancestral');
    const scheduler = normalizeRequiredText(params.scheduler, 'scheduler', 'karras');
    const qualityPresetId = normalizePresetId(
        params.v5QualityPresetId,
        V5_QUALITY_IDS,
        'standard',
    );
    const ucPresetId = normalizePresetId(params.v5UcPresetId, V5_UC_IDS, 'heavy');
    const transparentBackground = params.transparentBackground === true;
    const basePrompt = appendV5AutomaticPrompt(scene, [
        transparentBackground ? 'transparent background' : '',
        V5_QUALITY_PRESETS[qualityPresetId],
    ]);
    const shouldPrependNsfw = model === NOVEL_MODEL_IDS.V5_FULL
        && ucPresetId !== 'none'
        && !/\bnsfw\b/i.test(basePrompt);
    const fullNegativePrompt = joinPromptParts(
        shouldPrependNsfw ? 'nsfw' : '',
        V5_UC_PRESETS[ucPresetId],
        negativePrompt,
    );
    const centers = characterPrompts.map((character, index) => normalizeCharacterCenter(character.center, index));
    const charCaptions = characterPrompts.map((character, index) => ({
        char_caption: String(character?.prompt || ''),
        centers: [centers[index]],
    }));
    const negativeCharCaptions = characterPrompts.map((character, index) => ({
        char_caption: String(character?.uc || ''),
        centers: [centers[index]],
    }));

    return {
        input: basePrompt,
        model,
        action: 'generate',
        parameters: {
            params_version: 4,
            width,
            height,
            scale,
            sampler,
            steps,
            n_samples: 1,
            ucPresetId,
            qualityPresetId,
            autoSmea: false,
            dynamic_thresholding: false,
            controlnet_strength: 1,
            legacy: false,
            add_original_image: true,
            cfg_rescale: cfgRescale,
            legacy_v3_extend: false,
            use_coords: true,
            legacy_uc: false,
            normalize_reference_strength_multiple: true,
            inpaintImg2ImgStrength: 1,
            seed: normalizedSeed,
            characterPrompts: characterPrompts.map((character, index) => ({
                prompt: String(character?.prompt || ''),
                uc: String(character?.uc || ''),
                center: centers[index],
                enabled: true,
            })),
            straight_alpha: true,
            ...(transparentBackground ? { tag_hint_transparent_background: true } : {}),
            v4_prompt: {
                caption: {
                    base_caption: basePrompt,
                    char_captions: charCaptions,
                },
                use_coords: true,
                use_order: true,
            },
            v4_negative_prompt: {
                caption: {
                    base_caption: fullNegativePrompt,
                    char_captions: negativeCharCaptions,
                },
                legacy_uc: false,
            },
            negative_prompt: fullNegativePrompt,
            deliberate_euler_ancestral_bug: false,
            prefer_brownian: true,
            noise_schedule: scheduler,
            image_format: 'png',
            stream: 'msgpack',
        },
        use_new_shared_trial: true,
    };
}

export function buildNovelV5ProbeRequest(model) {
    return buildNovelV5RequestBody({
        scene: 'test',
        characterPrompts: [],
        negativePrompt: '',
        params: {
            model,
            width: 64,
            height: 64,
            steps: 1,
            v5QualityPresetId: 'none',
            v5UcPresetId: 'none',
        },
        seed: 1,
    });
}
