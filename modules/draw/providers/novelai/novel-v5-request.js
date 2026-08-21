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
    const model = String(params.model || NOVEL_MODEL_IDS.V5_FULL).trim();
    const capability = getNovelModelCapability(model);
    if (capability.family !== 'v5') {
        throw new TypeError(`NovelAI V5 请求不支持模型：${model}`);
    }
    if (!Array.isArray(characterPrompts)) {
        throw new TypeError('NovelAI V5 characterPrompts 必须是数组');
    }
    if (characterPrompts.length > capability.maxCharactersPerImage) {
        throw new RangeError(`NovelAI V5 每张图最多支持 ${capability.maxCharactersPerImage} 个角色提示词`);
    }
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
    const centers = characterPrompts.map((character) => character?.center || { x: 0.5, y: 0.5 });
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
            width: Number(params.width) || 832,
            height: Number(params.height) || 1216,
            scale: Number.isFinite(Number(params.scale)) ? Number(params.scale) : 7,
            sampler: String(params.sampler || 'k_euler_ancestral'),
            steps: Number(params.steps) > 0 ? Math.floor(Number(params.steps)) : 23,
            n_samples: 1,
            ucPresetId,
            qualityPresetId,
            autoSmea: false,
            dynamic_thresholding: false,
            controlnet_strength: 1,
            legacy: false,
            add_original_image: true,
            cfg_rescale: Number.isFinite(Number(params.cfg_rescale)) ? Number(params.cfg_rescale) : 0,
            legacy_v3_extend: false,
            use_coords: true,
            legacy_uc: false,
            normalize_reference_strength_multiple: true,
            inpaintImg2ImgStrength: 1,
            seed,
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
            noise_schedule: String(params.scheduler || 'karras'),
            image_format: 'png',
            stream: 'msgpack',
        },
        use_new_shared_trial: true,
    };
}
