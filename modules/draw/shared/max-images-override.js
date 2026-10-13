// 悬浮菜单“数目”快速覆盖：纯逻辑（无宿主依赖，三个 Provider 的面板与规划器入口共用）。
// 覆盖值存放在 settings.overrideMaxImages：null/未设置 = 跟随参数预设，1-20 的整数 = 覆盖“要求出图数”。
// 覆盖只在读取时与预设合并，永远不写回参数预设。

export const MAX_IMAGES_OVERRIDE_MIN = 1;
export const MAX_IMAGES_OVERRIDE_MAX = 20;

/** 非法值（非整数、越界、空串、布尔等）一律视为“跟随预设”(null)。 */
export function normalizeMaxImagesOverride(value) {
    let number = value;
    if (typeof value === 'string') {
        const text = value.trim();
        if (!/^\d+$/.test(text)) return null;
        number = Number(text);
    }
    if (typeof number !== 'number' || !Number.isSafeInteger(number)) return null;
    return number >= MAX_IMAGES_OVERRIDE_MIN && number <= MAX_IMAGES_OVERRIDE_MAX ? number : null;
}

/** 传给场景规划器的有效“要求出图数”：有效覆盖优先，否则沿用预设（0 = 不指定）。 */
export function resolveEffectiveMaxImages(settings, preset) {
    return normalizeMaxImagesOverride(settings?.overrideMaxImages) ?? (preset?.maxImages || 0);
}

export const MAX_IMAGES_INVALID_INPUT_MESSAGE =
    `出图数目需为 ${MAX_IMAGES_OVERRIDE_MIN}–${MAX_IMAGES_OVERRIDE_MAX} 的整数`;

/**
 * 解析数字输入框里的文本。
 * - 空白 = { status: 'empty' }（清除覆盖，跟随预设）
 * - 1-20 的整数 = { status: 'ok', value }（输入法下的全角数字会折叠成半角）
 * - 其余（0、负数、>20、小数、非数字）= { status: 'invalid' }
 * badInput 表示浏览器已判定输入框里是无法解析的文本（此时 input.value 是空串，不能当作“清空”）。
 */
export function parseMaxImagesInput(raw, { badInput = false } = {}) {
    const text = String(raw ?? '').normalize('NFKC').trim();
    if (text === '') return badInput ? { status: 'invalid' } : { status: 'empty' };
    const value = normalizeMaxImagesOverride(text);
    return value == null ? { status: 'invalid' } : { status: 'ok', value };
}

/** “当前预设：n 张 / 不指定”。 */
export function describePresetMaxImages(presetMaxImages) {
    const count = normalizePresetMaxImages(presetMaxImages);
    return count > 0 ? `${count} 张` : '不指定';
}

export function buildMaxImagesInputTitle(presetMaxImages) {
    return `留空 = 跟随预设（当前预设：${describePresetMaxImages(presetMaxImages)}）`;
}

function normalizePresetMaxImages(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}
