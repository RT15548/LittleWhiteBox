// 角色「服装列表 / 动态标签（dynamicStates）」条目（{ name, tags, enabled? }）的纯函数：规范化、启用过滤、折叠规则、文本行互转。
// 只依赖语言内建；NovelAI iframe、SD / ComfyUI 页面、规划器输入都从这里取同一份实现，不要各写一份。
// 条目启用：enabled 缺省 = 开，只在关闭时才写 enabled:false（没用到这个开关的旧数据保持字节级不变）。
// 折叠状态（expanded）只存在于编辑器的界面里，规范化后的数据不含该键，也不会保存或导出。

// 一个列表至少有这么多条才自动折叠；0–1 条时直接展开，与加开关之前的编辑器一致。
export const NAMED_TAG_FOLD_MIN_ITEMS = 2;
// 折叠头里 TAG 预览的最大字符数（按码点算），超出加省略号。
export const NAMED_TAG_PREVIEW_LIMIT = 36;

/** 复制条目 / 形态时在名称后加的后缀（与复制角色一致）。 */
export const COPY_NAME_SUFFIX = '副本';

/** 副本的名称：原名称 + “ 副本”；原名称为空时就是“副本”。 */
export function makeCopyLabel(name) {
    const base = String(name || '').trim();
    return base ? `${base} ${COPY_NAME_SUFFIX}` : COPY_NAME_SUFFIX;
}

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

/** 只留启用的条目，并去掉 enabled 键：发给场景规划器的就是这份，AI 看不到停用的服装 / 动态标签。 */
export function selectEnabledNamedTags(list = []) {
    return normalizeNamedTagList(list)
        .filter(isNamedTagEnabled)
        .map(({ name, tags }) => ({ name, tags }));
}

/** 去掉每个条目的 enabled 键（其余原样保留）：启用状态只属于本机，导出文件不带，导入文件里的也一律不认。 */
export function stripNamedTagEnabled(list = []) {
    return (Array.isArray(list) ? list : []).map(({ enabled: _enabled, ...rest }) => rest);
}

/**
 * 导入替换服装 / 动态标签列表时保留本机的启用状态：文件里的条目按名称（去首尾空白）对应本机已有的同名条目，
 * 本机停用的继续停用；对不上的新条目默认启用。同名条目按先后顺序一一对应，文件本身的 enabled 不起作用。
 */
export function applyLocalNamedTagEnabled(incoming = [], local = []) {
    const disabledByName = new Map();
    for (const item of normalizeNamedTagList(local)) {
        const key = item.name;
        const flags = disabledByName.get(key) || [];
        flags.push(!isNamedTagEnabled(item));
        disabledByName.set(key, flags);
    }
    return stripNamedTagEnabled(normalizeNamedTagList(incoming)).map((item) => {
        const disabled = disabledByName.get(item.name)?.shift() === true;
        return disabled ? { ...item, enabled: false } : item;
    });
}

/** 启用条目数（动态标签的状态芯片只在 > 0 时出现）。 */
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
