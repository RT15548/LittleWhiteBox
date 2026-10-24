// 角色「服装列表 / 动态外貌」条目（{ name, tags, enabled? }）的纯函数：规范化、启用过滤、折叠规则、文本行互转。
// 只依赖语言内建；NovelAI iframe、SD / ComfyUI 页面、规划器输入都从这里取同一份实现，不要各写一份。
// 条目启用：enabled 缺省 = 开，只在关闭时才写 enabled:false（没用到这个开关的旧数据保持字节级不变）。
// 折叠状态（expanded）只存在于编辑器的界面里，规范化后的数据不含该键，也不会保存或导出。

// 一个列表至少有这么多条才自动折叠；0–1 条时直接展开，与加开关之前的编辑器一致。
export const NAMED_TAG_FOLD_MIN_ITEMS = 2;
// 折叠头里 TAG 预览的最大字符数（按码点算），超出加省略号。
export const NAMED_TAG_PREVIEW_LIMIT = 36;

/** 条目是否启用：只有明确写了 enabled:false 才算停用。 */
export function isNamedTagEnabled(item) {
    return item?.enabled !== false;
}

/** 规范化条目列表：去空条目、trim；停用的条目保留 enabled:false，启用的条目不带该键。 */
export function normalizeNamedTagList(list = []) {
    return (Array.isArray(list) ? list : [])
        .map(item => ({
            name: String(item?.name || '').trim(),
            tags: String(item?.tags || '').trim(),
            ...(item?.enabled === false ? { enabled: false } : {}),
        }))
        .filter(item => item.name || item.tags);
}

/** 只留启用的条目，并去掉 enabled 键：发给场景规划器的就是这份，AI 看不到停用的服装 / 状态。 */
export function selectEnabledNamedTags(list = []) {
    return normalizeNamedTagList(list)
        .filter(isNamedTagEnabled)
        .map(({ name, tags }) => ({ name, tags }));
}

/** 启用条目数（状态标签只在 > 0 时出现）。 */
export function countEnabledNamedTags(list = []) {
    return selectEnabledNamedTags(list).length;
}

/**
 * 条目渲染时是否展开。不足 NAMED_TAG_FOLD_MIN_ITEMS 条时一律展开；
 * 否则只有明确带 expanded:true 的条目（刚添加的、用户点开过的、草稿里原本展开的）展开，其余折叠。
 */
export function isNamedTagItemExpanded(item, total) {
    if (Number(total) < NAMED_TAG_FOLD_MIN_ITEMS) return true;
    return item?.expanded === true;
}

/**
 * 按“原下标的新顺序”重排条目（拖拽排序的纯数据版）：order 必须恰好是 0..n-1 的一个排列，
 * 否则（长度不符、重复、越界）原样返回副本，绝不会增删或复制条目。条目对象本身不复制。
 */
export function reorderNamedTagItems(items, order) {
    const list = Array.isArray(items) ? items : [];
    const indexes = Array.isArray(order) ? order.map(Number) : [];
    const valid = indexes.length === list.length
        && new Set(indexes).size === list.length
        && indexes.every(index => Number.isInteger(index) && index >= 0 && index < list.length);
    return valid ? indexes.map(index => list[index]) : [...list];
}

/** 折叠头里的 TAG 预览：压缩空白，超长截断加省略号；没填写时给占位文案。 */
export function previewNamedTags(tags, limit = NAMED_TAG_PREVIEW_LIMIT) {
    const text = String(tags || '').replace(/\s+/g, ' ').trim();
    if (!text) return '（未填写 TAG）';
    const chars = Array.from(text);
    return chars.length > limit ? `${chars.slice(0, limit).join('')}…` : text;
}

// ── SD WebUI / ComfyUI 的文本框写法（每行一条，“名称 = tags”）──
// 行首的“# ”表示该条已停用；其余格式与旧版一致。

const DISABLED_LINE_PREFIX = /^#\s+/;

/** 条目列表 → 文本框内容。 */
export function serializeNamedTagLines(list = []) {
    return (Array.isArray(list) ? list : [])
        .map((item) => {
            const name = String(item?.name || '').trim();
            const tags = String(item?.tags || '').trim();
            if (!name && !tags) return '';
            const line = name ? `${name} = ${tags}` : tags;
            return item?.enabled === false ? `# ${line}` : line;
        })
        .filter(Boolean)
        .join('\n');
}

/** 文本框内容 → 条目列表；“# ”开头的行是停用条目。 */
export function parseNamedTagLines(value = '') {
    return String(value || '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean)
        .map((rawLine) => {
            const disabled = DISABLED_LINE_PREFIX.test(rawLine);
            const line = disabled ? rawLine.replace(DISABLED_LINE_PREFIX, '').trim() : rawLine;
            const parts = line.split('=');
            const item = parts.length >= 2
                ? { name: parts.shift().trim(), tags: parts.join('=').trim() }
                : { name: '', tags: line };
            return disabled ? { ...item, enabled: false } : item;
        })
        .filter(item => item.name || item.tags);
}
