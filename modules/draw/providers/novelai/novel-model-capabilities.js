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

export function getNovelScenePlannerContract(model) {
    const capability = getNovelModelCapability(model);
    if (capability.centerMode === 'normalized') {
        return `## 角色坐标契约

- characters[].center 必须提交归一化坐标对象 { "x": 0..1, "y": 0..1 }。
- 左上角是 (0, 0)，右下角是 (1, 1)，画面中心是 (0.5, 0.5)。
- 坐标应表达角色在最终画面中的实际中心，可重叠。
- 每个实际可见角色必须对应一个独立的 characters[] 条目。
- 每张图最多 ${capability.maxCharactersPerImage} 个角色条目；不要为了填满上限而虚构角色。`;
    }
    return `## 角色坐标契约

- characters[].center 必须提交 A1-E5 的 5×5 网格字符串。
- 列 A-E 从左到右，行 1-5 从上到下；C3 是画面中心。
- 坐标应表达角色在最终画面中的实际位置，可重叠。`;
}
