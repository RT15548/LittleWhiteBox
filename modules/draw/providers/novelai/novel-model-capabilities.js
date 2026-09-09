export const NOVEL_MODEL_IDS = Object.freeze({
    V5_FULL: 'nai-diffusion-5-full',
    V5_CURATED: 'nai-diffusion-5-curated',
});

export const NOVEL_PROMPT_GUIDES = Object.freeze({
    V45: 'v4.5',
    V5: 'v5',
});

export const NOVEL_V5_MAX_CHARACTERS = 22;

const LEGACY_CAPABILITY = Object.freeze({
    family: 'legacy',
    transport: 'image',
    promptGuide: NOVEL_PROMPT_GUIDES.V45,
    centerMode: 'grid',
    maxCharactersPerImage: 0,
    supportsV5Presets: false,
    supportsTransparentBackground: false,
});

const V5_CAPABILITY = Object.freeze({
    family: 'v5',
    transport: 'msgpack-stream',
    promptGuide: NOVEL_PROMPT_GUIDES.V5,
    centerMode: 'normalized',
    maxCharactersPerImage: NOVEL_V5_MAX_CHARACTERS,
    supportsV5Presets: true,
    supportsTransparentBackground: true,
});

const V5_MODELS = new Set(Object.values(NOVEL_MODEL_IDS));

/**
 * V5 is an external protocol boundary, so it is enabled only for model IDs
 * confirmed against NovelAI's production client. Custom and older IDs keep
 * the established JSON/ZIP path.
 */
export function getNovelModelCapability(model) {
    return V5_MODELS.has(String(model || '').trim()) ? V5_CAPABILITY : LEGACY_CAPABILITY;
}

export function isNovelV5Model(model) {
    return getNovelModelCapability(model).family === 'v5';
}

export function getNovelModelCapabilitiesForUi() {
    return Object.fromEntries(
        Object.values(NOVEL_MODEL_IDS).map(model => [model, { ...getNovelModelCapability(model) }]),
    );
}
