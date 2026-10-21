// 场景规划请求的"块布局"：存储、设置界面、请求组装三方共用的契约（纯函数）。
// 零依赖：不得 import 任何模块；也不在逻辑里读时间或随机数（id 随机源由调用方注入）。
// 布局 = 有序块列表：8 个内置块（内容与角色由代码决定，只能移动）+ 任意数量的自定义消息块。
// 稀疏存储：预设只有在布局偏离默认时才带 layout 字段；内置块只存 {id}，避免内容随版本漂移。

export const SCENE_PLANNER_LAYOUT_VERSION = 1;

function freezeBlock(block) {
    return Object.freeze(block);
}

// 数组顺序 = 默认顺序，也是"补回缺失内置块"时的规范顺序。
export const BUILTIN_BLOCKS = Object.freeze([
    freezeBlock({ id: 'opening', label: '开场与视角', role: 'system' }),
    freezeBlock({ id: 'frame', label: '材料说明与输出去向', role: 'system' }),
    freezeBlock({ id: 'guide', label: 'TAG指南', role: 'system' }),
    freezeBlock({ id: 'rules', label: '场景规则', role: 'system' }),
    freezeBlock({ id: 'tools', label: '工具说明', role: 'system' }),
    freezeBlock({ id: 'worldInfo', label: '世界书', role: 'user' }),
    freezeBlock({ id: 'content', label: '角色与正文', role: 'user', required: true }),
    freezeBlock({ id: 'limits', label: '数量约束', role: 'user', required: true }),
]);

export const BUILTIN_BLOCK_IDS = Object.freeze(BUILTIN_BLOCKS.map(block => block.id));
export const CUSTOM_BLOCK_ROLES = Object.freeze(['system', 'user', 'assistant']);

const CUSTOM_LABEL_FALLBACK = '自定义消息';
const CUSTOM_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const CUSTOM_ID_PREFIX = 'msg-';
const CUSTOM_ID_DIGITS = 6;
const CUSTOM_ID_SPACE = 36 ** CUSTOM_ID_DIGITS;
// 注入的 random 连续撞库时的上限；超过后改走确定性扫描，保证一定产出唯一 id。
const RANDOM_ATTEMPTS = 32;

const BUILTIN_BY_ID = new Map(BUILTIN_BLOCKS.map(block => [block.id, block]));

function isBuiltinId(id) {
    return typeof id === 'string' && BUILTIN_BY_ID.has(id);
}

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function formatCustomId(n) {
    return CUSTOM_ID_PREFIX + n.toString(36).padStart(CUSTOM_ID_DIGITS, '0');
}

function toIdSet(existingIds) {
    if (existingIds instanceof Set) return new Set(existingIds);
    return new Set(Array.isArray(existingIds) ? existingIds : []);
}

// 在 used 里找一个未占用的 id：先用 random，撞满次数后顺序扫描（确定性，必然终止）。
function pickFreeId(used, random) {
    if (typeof random === 'function') {
        for (let i = 0; i < RANDOM_ATTEMPTS; i += 1) {
            const r = Number(random());
            const n = Number.isFinite(r) ? Math.min(CUSTOM_ID_SPACE - 1, Math.max(0, Math.floor(r * CUSTOM_ID_SPACE))) : 0;
            const id = formatCustomId(n);
            if (!used.has(id) && !isBuiltinId(id)) return id;
        }
    }
    for (let n = 1; ; n += 1) {
        const id = formatCustomId(n);
        if (!used.has(id) && !isBuiltinId(id)) return id;
    }
}

// 非字符串字段的宽松转字符串：对象/数组转出来是 "[object Object]" 这类垃圾，宁可当空串。
function coerceText(value) {
    if (typeof value === 'string') return { text: value, coerced: false };
    if (value === undefined || value === null) return { text: '', coerced: false };
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
        return { text: String(value), coerced: true };
    }
    return { text: '', coerced: true };
}

export function createDefaultLayout() {
    return {
        version: SCENE_PLANNER_LAYOUT_VERSION,
        blocks: BUILTIN_BLOCK_IDS.map(id => ({ id })),
    };
}

export function createCustomBlock(
    { role = 'user', name = '', content = '', enabled = true } = {},
    existingIds = [],
    random = Math.random,
) {
    const used = toIdSet(existingIds);
    return {
        id: pickFreeId(used, random),
        // 显式构造时角色写错按 user 兜底；"来历不明的数据"才走 normalizeLayout 的禁用逻辑。
        role: CUSTOM_BLOCK_ROLES.includes(role) ? role : 'user',
        name: coerceText(name).text.trim(),
        content: coerceText(content).text,
        enabled: enabled !== false,
    };
}

// trimName=false 仅供编辑类纯操作使用：用户边打字边调用时不能把刚输入的空格吃掉。
// 存储与指纹一律走默认的 trimName=true。
function normalizeCore(raw, { trimName = true } = {}) {
    if (raw === undefined || raw === null) {
        return { layout: createDefaultLayout(), repaired: false, notes: [] };
    }

    const notes = [];
    let rawBlocks = [];

    if (Array.isArray(raw)) {
        notes.push('根节点是数组，已按块列表处理');
        rawBlocks = raw;
    } else if (typeof raw === 'object') {
        if (raw.version !== undefined) {
            if (typeof raw.version === 'number' && raw.version > SCENE_PLANNER_LAYOUT_VERSION) {
                notes.push(`布局版本 ${raw.version} 高于当前支持的 ${SCENE_PLANNER_LAYOUT_VERSION}，已尽力按已知字段读取`);
            } else if (raw.version !== SCENE_PLANNER_LAYOUT_VERSION) {
                notes.push('布局版本无效，已按当前版本处理');
            }
        }
        if (Array.isArray(raw.blocks)) {
            rawBlocks = raw.blocks;
        } else if (raw.blocks !== undefined) {
            notes.push('blocks 不是数组，已忽略');
        }
    } else {
        notes.push('布局格式无效，已恢复默认布局');
        return { layout: createDefaultLayout(), repaired: true, notes };
    }

    // 第一遍：分拣内置/自定义，内置只留首次出现；有效自定义 id 先占位，避免后面重新生成的 id 撞上它。
    const used = new Set(BUILTIN_BLOCK_IDS);
    const seenBuiltin = new Set();
    const slots = [];
    let droppedEntries = 0;
    let duplicateBuiltins = 0;
    let regeneratedIds = 0;

    for (const entry of rawBlocks) {
        if (!isRecord(entry)) {
            droppedEntries += 1;
            continue;
        }
        const id = entry.id;
        if (isBuiltinId(id)) {
            if (seenBuiltin.has(id)) {
                duplicateBuiltins += 1;
            } else {
                seenBuiltin.add(id);
                slots.push({ builtin: id });
            }
            continue;
        }
        const idOk = typeof id === 'string' && CUSTOM_ID_PATTERN.test(id) && !used.has(id);
        if (idOk) used.add(id);
        slots.push({ entry, id: idOk ? id : null });
    }

    // 第二遍：生成自定义块。id 缺失/非法/重复时用计数器兜底（不用随机数，保证同一输入永远得到同一输出）。
    const blocks = [];
    let invalidRoles = 0;
    let coercedFields = 0;
    for (const slot of slots) {
        if (slot.builtin) {
            blocks.push({ id: slot.builtin });
            continue;
        }
        const { entry } = slot;
        let id = slot.id;
        if (id === null) {
            id = pickFreeId(used, null);
            used.add(id);
            regeneratedIds += 1;
        }
        const roleValid = CUSTOM_BLOCK_ROLES.includes(entry.role);
        if (!roleValid) invalidRoles += 1;
        const nameInfo = coerceText(entry.name);
        const contentInfo = coerceText(entry.content);
        const nameText = trimName ? nameInfo.text.trim() : nameInfo.text;
        if (nameInfo.coerced || contentInfo.coerced || (trimName && nameText !== nameInfo.text)) coercedFields += 1;
        if (entry.enabled !== undefined && typeof entry.enabled !== 'boolean') coercedFields += 1;
        blocks.push({
            id,
            role: roleValid ? entry.role : 'user',
            name: nameText,
            content: contentInfo.text,
            // 角色无效时强制停用：宁可不发，也不悄悄发一条用户没选过角色的消息。
            enabled: roleValid && entry.enabled !== false,
        });
    }

    if (droppedEntries > 0) notes.push(`丢弃了 ${droppedEntries} 个无效的块条目`);
    if (duplicateBuiltins > 0) notes.push(`丢弃了 ${duplicateBuiltins} 个重复的内置块`);
    if (regeneratedIds > 0) notes.push(`为 ${regeneratedIds} 个自定义块重新生成了 id（缺失、非法或重复）`);
    if (invalidRoles > 0) notes.push(`${invalidRoles} 个自定义块的角色无效，已设为 user 并停用`);
    if (coercedFields > 0) notes.push(`${coercedFields} 处自定义块字段类型不符，已转换`);

    // 补回缺失的内置块：按规范顺序处理，每个插在"最近的、已存在的前驱内置块"之后，没有前驱则放最前。
    // 因为已补回的块也算存在，连续缺失时自然保持规范顺序。
    const restored = [];
    BUILTIN_BLOCK_IDS.forEach((id, canonicalIndex) => {
        if (seenBuiltin.has(id)) return;
        let insertAt = 0;
        for (let prev = canonicalIndex - 1; prev >= 0; prev -= 1) {
            const at = blocks.findIndex(block => block.id === BUILTIN_BLOCK_IDS[prev]);
            if (at !== -1) {
                insertAt = at + 1;
                break;
            }
        }
        blocks.splice(insertAt, 0, { id });
        restored.push(BUILTIN_BY_ID.get(id).label);
    });
    if (restored.length > 0) notes.push(`补回了缺失的内置块：${restored.join('、')}`);

    return {
        layout: { version: SCENE_PLANNER_LAYOUT_VERSION, blocks },
        repaired: notes.length > 0,
        notes,
    };
}

export function normalizeLayout(raw) {
    try {
        return normalizeCore(raw);
    } catch {
        // 带 getter/Proxy 的恶意或损坏输入：宁可回默认，也不能让设置界面或请求组装崩掉。
        return { layout: createDefaultLayout(), repaired: true, notes: ['布局读取失败，已恢复默认布局'] };
    }
}

function safeNormalize(raw, options) {
    try {
        return normalizeCore(raw, options).layout;
    } catch {
        return createDefaultLayout();
    }
}

export function layoutFingerprint(layout) {
    return JSON.stringify(normalizeLayout(layout).layout);
}

const DEFAULT_FINGERPRINT = JSON.stringify(createDefaultLayout());

export function isDefaultLayout(layout) {
    return layoutFingerprint(layout) === DEFAULT_FINGERPRINT;
}

export function layoutForStorage(raw) {
    const { layout } = normalizeLayout(raw);
    return JSON.stringify(layout) === DEFAULT_FINGERPRINT ? undefined : layout;
}

export function describeBlock(block) {
    const id = isRecord(block) && typeof block.id === 'string' ? block.id : '';
    const builtin = BUILTIN_BY_ID.get(id);
    if (builtin) return { id, builtin: true, role: builtin.role, label: builtin.label };
    const role = isRecord(block) && CUSTOM_BLOCK_ROLES.includes(block.role) ? block.role : 'user';
    const name = isRecord(block) ? coerceText(block.name).text.trim() : '';
    return { id, builtin: false, role, label: name || CUSTOM_LABEL_FALLBACK };
}

// ---- 纯操作：入参先规范化再改副本，结果再规范化一次，保证出来的永远是合法布局，且不改动入参 ----

function editBlocks(layout, edit) {
    const blocks = safeNormalize(layout, { trimName: false }).blocks;
    const next = edit(blocks) || blocks;
    return safeNormalize({ version: SCENE_PLANNER_LAYOUT_VERSION, blocks: next }, { trimName: false });
}

function clampIndex(index, length) {
    if (typeof index !== 'number' || !Number.isFinite(index)) return length;
    return Math.min(length, Math.max(0, Math.trunc(index)));
}

export function addBlock(layout, block, index) {
    return editBlocks(layout, blocks => {
        // 内置块永远存在于布局中，不能"再加一个"。
        if (!isRecord(block) || isBuiltinId(block.id)) return blocks;
        const next = blocks.slice();
        next.splice(clampIndex(index, next.length), 0, { ...block });
        return next;
    });
}

/** 插到 afterId 那一块的正下方；afterId 不存在（或没给）时放到最后。 */
export function addBlockAfter(layout, block, afterId) {
    return editBlocks(layout, blocks => {
        if (!isRecord(block) || isBuiltinId(block.id)) return blocks;
        const at = blocks.findIndex(item => item.id === afterId);
        const next = blocks.slice();
        next.splice(at === -1 ? next.length : at + 1, 0, { ...block });
        return next;
    });
}

function toIdList(ids) {
    return Array.isArray(ids) ? ids.filter(id => typeof id === 'string') : [];
}

/**
 * 复制自定义块：每个副本紧跟在它的原块后面（内容、角色、名称、启用状态原样带过去），id 由 random 生成。
 * 内置块和不存在的 id 不复制，放进 skipped。
 * @returns {{layout: object, copies: Array<{sourceId: string, id: string}>, skipped: string[]}}
 */
export function duplicateBlocks(layout, ids, random = Math.random) {
    const wanted = new Set(toIdList(ids));
    const copies = [];
    const normalized = safeNormalize(layout, { trimName: false }).blocks;
    const customIds = new Set(normalized.filter(block => !isBuiltinId(block.id)).map(block => block.id));
    const skipped = Array.from(wanted).filter(id => !customIds.has(id));
    const used = new Set(normalized.map(block => block.id));
    const next = editBlocks(layout, blocks => blocks.flatMap((block) => {
        if (!wanted.has(block.id) || isBuiltinId(block.id)) return [block];
        const id = pickFreeId(used, random);
        used.add(id);
        copies.push({ sourceId: block.id, id });
        return [block, { ...block, id }];
    }));
    return { layout: next, copies, skipped };
}

/** 批量删除自定义块；内置块永远不删，放进 skipped。 */
export function removeBlocks(layout, ids) {
    const wanted = new Set(toIdList(ids));
    const existing = safeNormalize(layout, { trimName: false }).blocks;
    const removedIds = existing.filter(block => wanted.has(block.id) && !isBuiltinId(block.id)).map(block => block.id);
    const skipped = Array.from(wanted).filter(id => !removedIds.includes(id));
    const removed = new Set(removedIds);
    const next = editBlocks(layout, blocks => blocks.filter(block => !removed.has(block.id)));
    return { layout: next, removedIds, skipped };
}

/** 批量启用 / 停用自定义块（内置块没有启用开关，忽略）。 */
export function setBlocksEnabled(layout, ids, enabled) {
    const wanted = new Set(toIdList(ids));
    return editBlocks(layout, blocks => blocks.map(block => (
        wanted.has(block.id) && !isBuiltinId(block.id) ? { ...block, enabled: enabled !== false } : block
    )));
}

/**
 * 把一组块整体上移 / 下移一格（内置块也可以一起动）。组按在布局里的先后顺序保持相对次序；
 * 上移 / 下移是相对“组外的块”算的：组里不连续时会先并拢到同一处。已在边界时原样返回。
 */
export function moveBlocks(layout, ids, direction) {
    return editBlocks(layout, blocks => {
        const wanted = new Set(toIdList(ids));
        const group = blocks.filter(block => wanted.has(block.id));
        const step = direction > 0 ? 1 : direction < 0 ? -1 : 0;
        if (!group.length || step === 0) return blocks;
        const rest = blocks.filter(block => !wanted.has(block.id));
        const outsideBefore = (index) => blocks.slice(0, index).filter(block => !wanted.has(block.id)).length;
        const first = blocks.findIndex(block => wanted.has(block.id));
        const last = blocks.length - 1 - blocks.slice().reverse().findIndex(block => wanted.has(block.id));
        const at = step < 0
            ? Math.max(0, outsideBefore(first) - 1)
            : Math.min(rest.length, outsideBefore(last) + 1);
        return [...rest.slice(0, at), ...group, ...rest.slice(at)];
    });
}

export function removeBlock(layout, id) {
    return editBlocks(layout, blocks => {
        if (isBuiltinId(id)) return blocks;
        return blocks.filter(block => block.id !== id);
    });
}

export function updateBlock(layout, id, patch) {
    return editBlocks(layout, blocks => {
        if (isBuiltinId(id) || !isRecord(patch)) return blocks;
        return blocks.map(block => {
            if (block.id !== id) return block;
            const next = { ...block };
            if (CUSTOM_BLOCK_ROLES.includes(patch.role)) next.role = patch.role;
            if (typeof patch.name === 'string') next.name = patch.name;
            if (typeof patch.content === 'string') next.content = patch.content;
            if (typeof patch.enabled === 'boolean') next.enabled = patch.enabled;
            return next;
        });
    });
}

export function moveBlock(layout, id, direction) {
    return editBlocks(layout, blocks => {
        const step = direction > 0 ? 1 : direction < 0 ? -1 : 0;
        const from = blocks.findIndex(block => block.id === id);
        const to = from + step;
        if (step === 0 || from === -1 || to < 0 || to >= blocks.length) return blocks;
        const next = blocks.slice();
        [next[from], next[to]] = [next[to], next[from]];
        return next;
    });
}

export function reorderBlocks(layout, orderedIds) {
    return editBlocks(layout, blocks => {
        if (!Array.isArray(orderedIds)) return blocks;
        const byId = new Map(blocks.map(block => [block.id, block]));
        const placed = new Set();
        const head = [];
        for (const id of orderedIds) {
            if (!byId.has(id) || placed.has(id)) continue;
            placed.add(id);
            head.push(byId.get(id));
        }
        // 没被列出的块保持原有相对顺序排在后面：只重排，绝不增删。
        return head.concat(blocks.filter(block => !placed.has(block.id)));
    });
}
