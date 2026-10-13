// 悬浮菜单“数目”快速覆盖：纯逻辑（无宿主依赖，三个 Provider 的面板与规划器入口共用）。
// 覆盖值存放在 settings.overrideMaxImages：null/未设置 = 跟随参数预设，1-20 的整数 = 覆盖“要求出图数”。
// 覆盖只在读取时与预设合并，永远不写回参数预设。

export const MAX_IMAGES_OVERRIDE_MIN = 1;
export const MAX_IMAGES_OVERRIDE_MAX = 20;
export const MAX_IMAGES_QUICK_VALUES = Object.freeze([3, 5, 7]);
export const MAX_IMAGES_FOLLOW_PRESET_VALUE = 'default';
export const MAX_IMAGES_CUSTOM_VALUE = 'custom';

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

/**
 * 下拉选项。同一个 <select> 再次选中已选项不会触发 change，所以覆盖值为自定义数字时
 * 额外保留一个“自定义…”触发项，用来再次修改。
 */
export function getMaxImagesSelectOptions(override) {
    const current = normalizeMaxImagesOverride(override);
    const isCustom = current != null && !MAX_IMAGES_QUICK_VALUES.includes(current);
    const options = [
        { value: MAX_IMAGES_FOLLOW_PRESET_VALUE, label: '跟随预设', selected: current == null },
        ...MAX_IMAGES_QUICK_VALUES.map(count => ({
            value: String(count),
            label: String(count),
            selected: count === current,
        })),
    ];
    if (isCustom) options.push({ value: String(current), label: `自定义（${current}）`, selected: true });
    options.push({ value: MAX_IMAGES_CUSTOM_VALUE, label: '自定义…', selected: false });
    return options;
}

export function fillMaxImagesSelect(selectEl, override) {
    if (!selectEl) return;
    const doc = selectEl.ownerDocument;
    selectEl.replaceChildren();
    for (const item of getMaxImagesSelectOptions(override)) {
        const option = doc.createElement('option');
        option.value = item.value;
        option.textContent = item.label;
        if (item.selected) option.selected = true;
        selectEl.appendChild(option);
    }
}

/** window.prompt 的返回值：null = 取消；空串/非整数/越界 = 非法。 */
export function parseCustomMaxImagesInput(raw) {
    if (raw == null) return { status: 'cancel' };
    // 输入法下可能是全角数字，统一折叠成半角。
    const value = normalizeMaxImagesOverride(String(raw).normalize('NFKC'));
    return value == null ? { status: 'invalid' } : { status: 'ok', value };
}

export const MAX_IMAGES_INVALID_INPUT_MESSAGE =
    `请输入 ${MAX_IMAGES_OVERRIDE_MIN}-${MAX_IMAGES_OVERRIDE_MAX} 的整数`;

export const MAX_IMAGES_PROMPT_UNAVAILABLE_MESSAGE = '当前环境无法弹出输入框，请选择 3 / 5 / 7，或到绘图参数里设置要求出图数';

/**
 * 把下拉选中的值翻译成要写入的覆盖值。
 * 返回 { type: 'set', value }（value 为 null 即清除覆盖）或 { type: 'keep' }（保持原值）。
 */
export function resolveMaxImagesChange(selectedValue, currentOverride, { prompt, notify } = {}) {
    const selected = String(selectedValue ?? '');
    if (selected === MAX_IMAGES_FOLLOW_PRESET_VALUE) return { type: 'set', value: null };
    if (selected === MAX_IMAGES_CUSTOM_VALUE) {
        if (typeof prompt !== 'function') {
            notify?.(MAX_IMAGES_PROMPT_UNAVAILABLE_MESSAGE);
            return { type: 'keep' };
        }
        const current = normalizeMaxImagesOverride(currentOverride);
        let answer;
        try {
            answer = prompt(
                `请输入要求出图数（${MAX_IMAGES_OVERRIDE_MIN}-${MAX_IMAGES_OVERRIDE_MAX} 的整数）：`,
                current == null ? '' : String(current),
            );
        } catch {
            return { type: 'keep' };
        }
        const parsed = parseCustomMaxImagesInput(answer);
        if (parsed.status === 'ok') return { type: 'set', value: parsed.value };
        if (parsed.status === 'invalid') notify?.(MAX_IMAGES_INVALID_INPUT_MESSAGE);
        return { type: 'keep' };
    }
    const value = normalizeMaxImagesOverride(selected);
    return value == null ? { type: 'keep' } : { type: 'set', value };
}
