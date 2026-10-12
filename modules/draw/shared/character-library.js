// 角色标签库：分组、排序、批量操作与导入导出的纯函数。
// 不得 import 任何模块：NovelAI 面板在 iframe 里用动态 import 引入本文件，依赖酒馆内部模块会把整个酒馆脚本拖进来。
// 库对象为 { characters: [], groups: [] }；所有函数返回新对象，不修改入参。
// 启用采用嵌套模型：分组有自己的开关（groups[].enabled，缺省=开，只在关闭时才写 enabled:false），角色有自己的 enabled；
// 角色实际是否参与出图（“有效启用”）= 所在分组是开的 且 角色自己 enabled !== false。未分组没有开关，始终视为开。
// 分组开关与角色自己的状态互不改写：关掉分组再打开，组内每个角色保持关闭前的样子。
// 排序的唯一事实来源是 characters 数组顺序；groupId 缺省（空）表示“未分组”。

export const UNGROUPED_ID = '';
export const UNGROUPED_NAME = '未分组';
export const CHARACTER_EXPORT_TYPE = 'novel-draw-characters';
export const CHARACTER_EXPORT_VERSION = 4;
export const MAX_GROUPS = 50;
export const MAX_GROUP_NAME_LENGTH = 32;
export const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024;
// 单次导入的角色条目数上限：最小的角色约 14 字节，5MB 文件理论上能塞十几万条，对话框每次切换选项都会重算预览。
export const MAX_IMPORT_CHARACTERS = 5000;
// 后台出图任务只携带已启用角色，且服务端限制不超过此数量（server-plugin/.../draw-runs/envelope.js）。
export const BACKEND_ENABLED_CHARACTER_LIMIT = 500;

const COPY_SUFFIX = '副本';
// 文件字段名 → 角色字段名；兼容旧版字段。
const IMPORT_FIELD_MAP = Object.freeze({
    name: 'name',
    aliases: 'aliases',
    type: 'type',
    appearance: 'appearance',
    tags: 'appearance',
    negativeTags: 'negativeTags',
    danbooruTag: 'danbooruTag',
    outfits: 'outfits',
    costumes: 'outfits',
    clothes: 'outfits',
    dynamicStates: 'dynamicStates',
});

function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function lowerKey(value) {
    return String(value ?? '').trim().toLocaleLowerCase();
}

function defaultMakeId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function takeUniqueId(prefix, used, makeId = defaultMakeId) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
        const id = String(makeId(prefix));
        if (id && !used.has(id)) {
            used.add(id);
            return id;
        }
    }
    let counter = used.size + 1;
    while (used.has(`${prefix}-${counter}`)) counter += 1;
    const id = `${prefix}-${counter}`;
    used.add(id);
    return id;
}

function normalizeNamedTagList(list = []) {
    return (Array.isArray(list) ? list : [])
        .map(item => ({
            name: String(item?.name || '').trim(),
            tags: String(item?.tags || '').trim(),
        }))
        .filter(item => item.name || item.tags);
}

function truncateName(name) {
    return Array.from(name).slice(0, MAX_GROUP_NAME_LENGTH).join('');
}

function stripGroupId(character) {
    const rest = { ...character };
    delete rest.groupId;
    return rest;
}

function withGroupId(character, groupId) {
    return groupId ? { ...stripGroupId(character), groupId } : stripGroupId(character);
}

/** 白名单规范化单个角色；groupId 为空时省略该键，保证没用分组的旧数据字节级不变。 */
export function normalizeCharacter(raw, { id } = {}) {
    const char = isPlainObject(raw) ? raw : {};
    const groupId = String(char.groupId || '').trim();
    return {
        id: String(id ?? char.id ?? ''),
        enabled: char.enabled !== false,
        name: String(char.name || ''),
        aliases: (Array.isArray(char.aliases) ? char.aliases : [])
            .map(alias => String(alias || '').trim())
            .filter(Boolean),
        type: String(char.type || 'girl'),
        appearance: String(char.appearance || char.tags || ''),
        negativeTags: String(char.negativeTags || ''),
        danbooruTag: String(char.danbooruTag || ''),
        outfits: normalizeNamedTagList(char.outfits || char.costumes || char.clothes || []),
        dynamicStates: normalizeNamedTagList(char.dynamicStates || []),
        ...(groupId ? { groupId } : {}),
    };
}

/** 宽松规范化：去空名、保留名、重名，名称截断，id 唯一化，数量封顶。 */
export function normalizeCharacterGroups(raw, { makeId } = {}) {
    const usedIds = new Set();
    const usedNames = new Set([lowerKey(UNGROUPED_NAME)]);
    const groups = [];
    for (const item of Array.isArray(raw) ? raw : []) {
        if (!isPlainObject(item) || groups.length >= MAX_GROUPS) continue;
        const name = truncateName(String(item.name ?? '').trim());
        if (!name || usedNames.has(lowerKey(name))) continue;
        usedNames.add(lowerKey(name));
        const givenId = String(item.id ?? '').trim();
        const id = givenId && !usedIds.has(givenId)
            ? (usedIds.add(givenId), givenId)
            : takeUniqueId('grp', usedIds, makeId);
        // enabled 只接受布尔值且只在为 false 时保留该键：没用到分组开关的旧数据保持字节级不变。
        groups.push(item.enabled === false ? { id, name, enabled: false } : { id, name });
    }
    return groups;
}

/**
 * 规范化整个库：补发缺失 id、重发重复 id（保证全局唯一）、清除指向不存在分组的 groupId。
 * repairs 记录发生过的修复，供调用方决定是否需要持久化。
 */
export function normalizeCharacterLibrary({ characters, groups } = {}, { makeId } = {}) {
    const normalizedGroups = normalizeCharacterGroups(groups, { makeId });
    const groupIds = new Set(normalizedGroups.map(group => group.id));
    const usedIds = new Set();
    const repairs = { idFilled: 0, idDeduped: 0, groupCleared: 0 };
    const normalizedCharacters = (Array.isArray(characters) ? characters : [])
        .filter(isPlainObject)
        .map((raw) => {
            const givenId = String(raw.id || '').trim();
            let id = givenId;
            if (!givenId) {
                id = takeUniqueId('char', usedIds, makeId);
                repairs.idFilled += 1;
            } else if (usedIds.has(givenId)) {
                id = takeUniqueId('char', usedIds, makeId);
                repairs.idDeduped += 1;
            } else {
                usedIds.add(givenId);
            }
            const character = normalizeCharacter(raw, { id });
            if (character.groupId && !groupIds.has(character.groupId)) {
                repairs.groupCleared += 1;
                return stripGroupId(character);
            }
            return character;
        });
    return { characters: normalizedCharacters, groups: normalizedGroups, repairs };
}

function ownGroupId(character) {
    return String(character?.groupId || '');
}

function disabledGroupIdSet(library) {
    return new Set((library?.groups || []).filter(group => group?.enabled === false).map(group => group.id));
}

/** 从共享设置（characterTags / characterGroups）取出角色库；缺省字段按空处理。 */
export function characterLibraryFromSettings(settings) {
    return {
        characters: Array.isArray(settings?.characterTags) ? settings.characterTags : [],
        groups: Array.isArray(settings?.characterGroups) ? settings.characterGroups : [],
    };
}

/** 分组开关；未分组（空 id）和不存在的分组一律视为开。 */
export function isGroupEnabled(library, groupId = UNGROUPED_ID) {
    const id = String(groupId || '');
    if (!id) return true;
    return !(library?.groups || []).some(group => group.id === id && group.enabled === false);
}

/** 有效启用 = 所在分组是开的 且 角色自己 enabled !== false。 */
export function isCharacterEffectivelyEnabled(library, character) {
    return Boolean(character) && character.enabled !== false && isGroupEnabled(library, ownGroupId(character));
}

/** 有效启用的角色数。 */
export function countEnabledCharacters(library) {
    return selectEnabledCharacters(library).length;
}

/**
 * 有效启用的角色（数组顺序不变）。入参是带 groups 的库 { characters, groups }：
 * 只传角色数组会丢失分组开关信息，所以不接受（数组按“没有任何角色”处理）。
 */
export function selectEnabledCharacters(library) {
    const characters = Array.isArray(library?.characters) ? library.characters : [];
    const disabledGroups = disabledGroupIdSet(library);
    return characters.filter(character => (
        character?.enabled !== false && !disabledGroups.has(ownGroupId(character))
    ));
}

/** 展示结构：未分组在最前，其后按分组顺序；组内保持数组相对顺序。visibleIds 用于筛选，计数仍按完整成员。 */
export function getGroupedView(library, { visibleIds } = {}) {
    const visible = visibleIds ? new Set(visibleIds) : null;
    const buckets = new Map([[UNGROUPED_ID, []]]);
    library.groups.forEach(group => buckets.set(group.id, []));
    for (const character of library.characters) {
        const key = buckets.has(ownGroupId(character)) ? ownGroupId(character) : UNGROUPED_ID;
        buckets.get(key).push(character);
    }
    // own：组内自己开着的角色数（不看分组开关）；enabled：分组开关（未分组恒为 true）。
    const describe = (id, name, virtual, enabled) => {
        const members = buckets.get(id);
        return {
            id,
            name,
            virtual,
            enabled,
            total: members.length,
            own: members.filter(character => character.enabled !== false).length,
            characters: visible ? members.filter(character => visible.has(character.id)) : members,
        };
    };
    return [
        describe(UNGROUPED_ID, UNGROUPED_NAME, true, true),
        ...library.groups.map(group => describe(group.id, group.name, false, group.enabled !== false)),
    ];
}

/**
 * 分组头信息 { own, total, enabled }：own=组内自己开着的角色数，total=成员总数，enabled=分组开关。
 * 未分组（空 id）恒为开；groupId 指向不存在的分组时按未分组处理，与 getGroupedView 一致。
 */
export function getGroupSummary(library, groupId = UNGROUPED_ID) {
    const view = getGroupedView(library);
    const group = view.find(item => item.id === groupId) ?? view[0];
    return { own: group.own, total: group.total, enabled: group.enabled };
}

function validateGroupName(groups, name, exceptId = '') {
    const trimmed = String(name ?? '').trim();
    if (!trimmed) throw new TypeError('分组名不能为空');
    if (lowerKey(trimmed) === lowerKey(UNGROUPED_NAME)) throw new TypeError(`“${UNGROUPED_NAME}”是保留名称`);
    if (Array.from(trimmed).length > MAX_GROUP_NAME_LENGTH) {
        throw new TypeError(`分组名不能超过 ${MAX_GROUP_NAME_LENGTH} 个字符`);
    }
    if (groups.some(group => group.id !== exceptId && lowerKey(group.name) === lowerKey(trimmed))) {
        throw new TypeError(`分组“${trimmed}”已存在`);
    }
    return trimmed;
}

export function createGroup(library, name, { makeId } = {}) {
    if (library.groups.length >= MAX_GROUPS) throw new TypeError(`分组数量不能超过 ${MAX_GROUPS} 个`);
    const trimmed = validateGroupName(library.groups, name);
    const used = new Set(library.groups.map(group => group.id));
    const id = takeUniqueId('grp', used, makeId);
    return {
        library: { characters: library.characters, groups: [...library.groups, { id, name: trimmed }] },
        groupId: id,
    };
}

function requireGroup(library, groupId) {
    if (!library.groups.some(group => group.id === groupId)) throw new TypeError('分组不存在');
}

export function renameGroup(library, groupId, name) {
    requireGroup(library, groupId);
    const trimmed = validateGroupName(library.groups, name, groupId);
    return {
        characters: library.characters,
        groups: library.groups.map(group => (group.id === groupId ? { ...group, name: trimmed } : group)),
    };
}

/**
 * 设置分组开关。只改 groups[].enabled，不碰任何角色；关闭时写 enabled:false，开启时删除该键（保持“缺省=开”的最小形态）。
 * 未分组（空 id）没有开关、分组不存在都抛 TypeError；开关已是目标值时返回原库。
 */
export function setGroupEnabled(library, groupId, enabled) {
    if (!groupId) throw new TypeError('未分组没有开关');
    requireGroup(library, groupId);
    if (typeof enabled !== 'boolean') throw new TypeError('分组开关必须是布尔值');
    if (isGroupEnabled(library, groupId) === enabled) return library;
    return {
        characters: library.characters,
        groups: library.groups.map((group) => {
            if (group.id !== groupId) return group;
            const rest = { ...group };
            delete rest.enabled;
            return enabled ? rest : { ...rest, enabled: false };
        }),
    };
}

/** 默认只解散分组（成员回到未分组）；deleteCharacters 为 true 时连成员一起删。 */
export function deleteGroup(library, groupId, { deleteCharacters = false } = {}) {
    requireGroup(library, groupId);
    const characters = deleteCharacters
        ? library.characters.filter(character => ownGroupId(character) !== groupId)
        : library.characters.map(character => (ownGroupId(character) === groupId ? stripGroupId(character) : character));
    return { characters, groups: library.groups.filter(group => group.id !== groupId) };
}

/** 上移 / 下移分组；越界时返回原库。 */
export function moveGroup(library, groupId, delta) {
    const index = library.groups.findIndex(group => group.id === groupId);
    if (index < 0) throw new TypeError('分组不存在');
    const target = index + (delta < 0 ? -1 : 1);
    if (target < 0 || target >= library.groups.length) return library;
    const groups = [...library.groups];
    [groups[index], groups[target]] = [groups[target], groups[index]];
    return { characters: library.characters, groups };
}

/** 拖拽排序分组：放到 beforeGroupId 之前；beforeGroupId 为空则放到末尾。 */
export function placeGroup(library, groupId, beforeGroupId = '') {
    const moving = library.groups.find(group => group.id === groupId);
    if (!moving) throw new TypeError('分组不存在');
    if (beforeGroupId === groupId) return library;
    const rest = library.groups.filter(group => group.id !== groupId);
    const at = beforeGroupId ? rest.findIndex(group => group.id === beforeGroupId) : -1;
    const groups = at >= 0
        ? [...rest.slice(0, at), moving, ...rest.slice(at)]
        : [...rest, moving];
    return { characters: library.characters, groups };
}

function indexAfterLastMember(characters, groupId) {
    let last = -1;
    characters.forEach((character, index) => {
        if (ownGroupId(character) === groupId) last = index;
    });
    return last < 0 ? characters.length : last + 1;
}

export function addCharacter(library, partial = {}, { groupId = UNGROUPED_ID, makeId } = {}) {
    if (groupId) requireGroup(library, groupId);
    const used = new Set(library.characters.map(character => character.id));
    const id = takeUniqueId('char', used, makeId);
    const character = normalizeCharacter({ ...partial, groupId }, { id });
    const characters = [...library.characters];
    characters.splice(indexAfterLastMember(characters, groupId), 0, character);
    return { library: { characters, groups: library.groups }, id };
}

export function setCharactersEnabled(library, ids, enabled) {
    const idSet = new Set(ids);
    return {
        groups: library.groups,
        characters: library.characters.map(character => (
            idSet.has(character.id) && (character.enabled !== false) !== Boolean(enabled)
                ? { ...character, enabled: Boolean(enabled) }
                : character
        )),
    };
}

export function deleteCharacters(library, ids) {
    const idSet = new Set(ids);
    return { groups: library.groups, characters: library.characters.filter(character => !idSet.has(character.id)) };
}

/**
 * 移动角色（批量迁移与拖拽共用）。被移角色保持彼此相对顺序。
 * 给出 beforeId（且不在被移集合内）时插到它前面并加入它所在的分组；否则放到 groupId 分组的末尾。
 */
export function moveCharacters(library, ids, { groupId = UNGROUPED_ID, beforeId = '' } = {}) {
    const idSet = new Set(ids);
    const moving = library.characters.filter(character => idSet.has(character.id));
    if (!moving.length) return library;
    const rest = library.characters.filter(character => !idSet.has(character.id));
    let target = String(groupId || '');
    let insertAt = -1;
    if (beforeId && !idSet.has(beforeId)) {
        insertAt = rest.findIndex(character => character.id === beforeId);
        if (insertAt >= 0) target = ownGroupId(rest[insertAt]);
    }
    if (target) requireGroup(library, target);
    if (insertAt < 0) insertAt = indexAfterLastMember(rest, target);
    const placed = moving.map(character => withGroupId(character, target));
    return {
        groups: library.groups,
        characters: [...rest.slice(0, insertAt), ...placed, ...rest.slice(insertAt)],
    };
}

/** 在同组内上移 / 下移一位；已在边界时返回原库。 */
export function shiftCharacter(library, id, delta) {
    const index = library.characters.findIndex(character => character.id === id);
    if (index < 0) throw new TypeError('角色不存在');
    const step = delta < 0 ? -1 : 1;
    const groupId = ownGroupId(library.characters[index]);
    let swapWith = index + step;
    while (swapWith >= 0 && swapWith < library.characters.length
        && ownGroupId(library.characters[swapWith]) !== groupId) {
        swapWith += step;
    }
    if (swapWith < 0 || swapWith >= library.characters.length) return library;
    const characters = [...library.characters];
    [characters[index], characters[swapWith]] = [characters[swapWith], characters[index]];
    return { groups: library.groups, characters };
}

function collectNameKeys(characters) {
    const keys = new Set();
    for (const character of characters) {
        keys.add(lowerKey(character.name));
        (character.aliases || []).forEach(alias => keys.add(lowerKey(alias)));
    }
    keys.delete('');
    return keys;
}

function makeCopyName(name, takenKeys) {
    const base = String(name || '').trim();
    let candidate = base ? `${base} ${COPY_SUFFIX}` : COPY_SUFFIX;
    for (let n = 2; takenKeys.has(lowerKey(candidate)); n += 1) {
        candidate = `${base ? `${base} ` : ''}${COPY_SUFFIX} ${n}`;
    }
    takenKeys.add(lowerKey(candidate));
    return candidate;
}

/**
 * 复制人设：深拷贝、新 id、名字加“副本”、别名清空（避免与原角色重名或别名冲突）、一律默认启用（enabled: true，即使原件是停用的）。
 * 默认放在原件之后同组；给出 toGroupId（含空串=未分组）时放到该组末尾。
 */
export function duplicateCharacters(library, ids, { toGroupId, makeId } = {}) {
    const idSet = new Set(ids);
    const used = new Set(library.characters.map(character => character.id));
    const takenNames = collectNameKeys(library.characters);
    const hasTarget = toGroupId !== undefined;
    if (hasTarget && toGroupId) requireGroup(library, toGroupId);
    const newIds = [];
    const copies = [];
    let characters = [];
    for (const character of library.characters) {
        characters.push(character);
        if (!idSet.has(character.id)) continue;
        const id = takeUniqueId('char', used, makeId);
        const copy = {
            ...cloneJson(character),
            id,
            name: makeCopyName(character.name, takenNames),
            aliases: [],
            enabled: true,
        };
        newIds.push(id);
        if (hasTarget) copies.push(withGroupId(copy, String(toGroupId || '')));
        else characters.push(copy);
    }
    if (hasTarget) {
        for (const copy of copies) {
            characters.splice(indexAfterLastMember(characters, ownGroupId(copy)), 0, copy);
        }
    }
    return { library: { groups: library.groups, characters }, newIds };
}

/** 展示顺序：未分组 → 各分组 → 组内数组顺序。 */
export function getDisplayOrder(library) {
    return getGroupedView(library).flatMap(group => group.characters);
}

/** scope: 'all' | 'group'（需 groupId，空串为未分组）| 'selection'（需 ids，可跨组） */
export function exportCharacters(library, { scope = 'all', groupId, ids } = {}, { now = Date.now() } = {}) {
    let characters = getDisplayOrder(library);
    if (scope === 'group') {
        if (groupId) requireGroup(library, groupId);
        characters = characters.filter(character => ownGroupId(character) === String(groupId || ''));
    } else if (scope === 'selection') {
        const idSet = new Set(ids || []);
        characters = characters.filter(character => idSet.has(character.id));
    } else if (scope !== 'all') {
        throw new TypeError('导出范围无效');
    }
    if (!characters.length) throw new TypeError('没有可导出的角色');
    const referenced = new Set(characters.map(ownGroupId));
    const groups = scope === 'all'
        ? library.groups
        : library.groups.filter(group => referenced.has(group.id));
    return {
        type: CHARACTER_EXPORT_TYPE,
        version: CHARACTER_EXPORT_VERSION,
        exportedAt: new Date(now).toISOString(),
        scope,
        // 分组开关属于本机的使用状态，不进入导出文件：只带 id 与名称。
        groups: groups.map(group => ({ id: group.id, name: group.name })),
        characters: cloneJson(characters),
    };
}

// 导入文件是不受信任的输入：这些文本字段若是对象 / 数组 / 布尔，String() 会得到 "[object Object]" 之类并进入提示词。
// undefined 与 null 视为未提供；数字允许（按字符串处理）。
function isProvided(value) {
    return value !== undefined && value !== null;
}

function isTextValue(value) {
    return typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
}

function hasBadText(source, keys) {
    return keys.some(key => isProvided(source[key]) && !isTextValue(source[key]));
}

function isBadAliasList(value) {
    return isProvided(value) && (!Array.isArray(value) || value.some(item => !isTextValue(item)));
}

function isBadNamedTagList(value) {
    return isProvided(value) && (!Array.isArray(value)
        || value.some(item => !isPlainObject(item) || hasBadText(item, ['name', 'tags'])));
}

/** 文件里的角色条目是否含有类型不合规的字段（决定整条跳过）。 */
function hasInvalidImportFieldType(raw) {
    return hasBadText(raw, ['name', 'id', 'type', 'appearance', 'tags', 'negativeTags', 'danbooruTag', 'groupId'])
        || isBadAliasList(raw.aliases)
        || ['outfits', 'costumes', 'clothes', 'dynamicStates'].some(key => isBadNamedTagList(raw[key]));
}

/**
 * 解析导入文件（已 JSON.parse）。只做校验与规范化，不接触本地库。
 * 返回 entries：{ character, fields, groupName, duplicate }，其中 fields 是文件里实际出现的字段，
 * 供“字段级覆盖”使用（v3 老文件缺 outfits 时不会清空本地服饰）。
 * 条目数超过 MAX_IMPORT_CHARACTERS 直接抛 TypeError；字段类型不合规的条目整条跳过并计入 skipped，汇总成一条 invalid-field-type 警告。
 */
export function parseCharacterImport(payload, { makeId } = {}) {
    if (!isPlainObject(payload) || payload.type !== CHARACTER_EXPORT_TYPE) {
        throw new TypeError('不是角色标签文件');
    }
    if (!Array.isArray(payload.characters)) throw new TypeError('文件缺少 characters 数组');
    if (payload.characters.length > MAX_IMPORT_CHARACTERS) {
        throw new TypeError(`文件包含 ${payload.characters.length} 个角色，超过单次导入上限 ${MAX_IMPORT_CHARACTERS}`);
    }
    const warnings = [];
    const version = Number.isFinite(Number(payload.version)) ? Number(payload.version) : 1;
    if (version > CHARACTER_EXPORT_VERSION) {
        warnings.push({ code: 'newer-version', message: '文件来自更新的版本，无法识别的字段会被忽略' });
    }
    let invalidGroups = 0;
    const fileGroups = (Array.isArray(payload.groups) ? payload.groups : []).filter((item) => {
        if (isPlainObject(item) && hasBadText(item, ['name', 'id'])) {
            invalidGroups += 1;
            return false;
        }
        return true;
    });
    // 文件里的分组开关一律忽略（导出本来也不带）：导入新建的分组默认开。
    const groups = normalizeCharacterGroups(fileGroups, { makeId }).map(group => ({ id: group.id, name: group.name }));
    const groupNameById = new Map(groups.map(group => [group.id, group.name]));
    const seenIds = new Set();
    let skipped = 0;
    let duplicates = 0;
    let invalidTypes = 0;
    const entries = [];
    for (const raw of payload.characters) {
        if (!isPlainObject(raw)) {
            skipped += 1;
            continue;
        }
        if (hasInvalidImportFieldType(raw)) {
            skipped += 1;
            invalidTypes += 1;
            continue;
        }
        if (!String(raw.name || '').trim()) {
            skipped += 1;
            continue;
        }
        const fileId = String(raw.id || '').trim();
        const duplicate = Boolean(fileId) && seenIds.has(fileId);
        if (duplicate) duplicates += 1;
        if (fileId) seenIds.add(fileId);
        const fields = [...new Set(Object.keys(raw)
            .filter(key => Object.hasOwn(IMPORT_FIELD_MAP, key))
            .map(key => IMPORT_FIELD_MAP[key]))];
        entries.push({
            character: stripGroupId(normalizeCharacter(raw, { id: fileId })),
            fields,
            groupName: groupNameById.get(String(raw.groupId || '').trim()) || '',
            duplicate,
        });
    }
    if (duplicates) {
        warnings.push({ code: 'duplicate-id', count: duplicates, message: `文件内有 ${duplicates} 个重复 id，将作为新角色导入` });
    }
    if (invalidTypes) {
        warnings.push({
            code: 'invalid-field-type',
            count: invalidTypes,
            message: `${invalidTypes} 个角色的字段类型不合规（应为文本、数字或数组），已跳过`,
        });
    }
    if (invalidGroups) {
        warnings.push({
            code: 'invalid-group-field-type',
            count: invalidGroups,
            message: `${invalidGroups} 个分组的名称或 id 类型不合规，已忽略`,
        });
    }
    return { version, groups, entries, skipped, warnings };
}

/**
 * 把待放置角色追加到各自目标分组“最后一个成员之后”，分组没有成员时放到数组末尾；各分组内保持传入顺序。
 * 与逐个 splice(indexAfterLastMember) 的结果一致，但只遍历一次（O(n)）：
 * 先按目标分组分桶，再在 rest 里每个分组最后一个成员之后一次性接入对应桶，没有成员的分组按首次出现顺序接在末尾。
 * placements: [{ character, groupId }]；rest 不会被修改。
 */
export function placeCharactersAfterGroupMembers(rest, placements) {
    const buckets = new Map();
    for (const { character, groupId } of placements) {
        const placed = withGroupId(character, groupId);
        const bucket = buckets.get(groupId);
        if (bucket) bucket.push(placed);
        else buckets.set(groupId, [placed]);
    }
    if (!buckets.size) return [...rest];
    const lastIndexByGroup = new Map();
    rest.forEach((character, index) => lastIndexByGroup.set(ownGroupId(character), index));
    const result = [];
    const append = (bucket) => {
        if (bucket) for (const character of bucket) result.push(character);
    };
    rest.forEach((character, index) => {
        result.push(character);
        const groupId = ownGroupId(character);
        if (lastIndexByGroup.get(groupId) === index) append(buckets.get(groupId));
    });
    for (const [groupId, bucket] of buckets) {
        if (!lastIndexByGroup.has(groupId)) append(bucket);
    }
    return result;
}

/**
 * 计算导入结果，不修改入参；用户确认后再采用返回的 library。
 * options.mode:
 *   'auto'           按 id 替换（默认）。替换保留本地的启用状态、分组与位置；新角色按文件分组名归位（同名并入，没有则新建）。
 *   'existing-group' 导入到 options.groupId。
 *   'new-group'      新建 options.newGroupName 并导入。
 * options.sameIdPolicy（仅非 auto 模式）：'replace'（默认，替换并移入目标分组）| 'keep-both'（副本使用新 id）| 'skip'。
 * options.importNewAsDisabled：新增角色一律以停用状态导入（已有角色的替换不受影响）。
 */
export function planCharacterImport(library, parsed, options = {}, { makeId } = {}) {
    const mode = options.mode ?? 'auto';
    if (!['auto', 'existing-group', 'new-group'].includes(mode)) throw new TypeError('导入模式无效');
    const policy = mode === 'auto' ? 'replace' : (options.sameIdPolicy ?? 'replace');
    if (!['replace', 'keep-both', 'skip'].includes(policy)) throw new TypeError('相同 id 的处理方式无效');

    const characters = cloneJson(library.characters);
    const groups = cloneJson(library.groups);
    const usedCharacterIds = new Set(characters.map(character => character.id));
    const usedGroupIds = new Set(groups.map(group => group.id));
    const byId = new Map(characters.map(character => [character.id, character]));
    const warnings = [...parsed.warnings];
    const summary = { added: 0, replaced: 0, skipped: parsed.skipped, keptBoth: 0, groupsCreated: 0 };
    const details = [];

    let fixedGroupId = null;
    if (mode === 'existing-group') {
        if (options.groupId) requireGroup(library, options.groupId);
        fixedGroupId = String(options.groupId || '');
    }
    let newGroupName = '';
    if (mode === 'new-group') {
        if (groups.length >= MAX_GROUPS) throw new TypeError(`分组数量不能超过 ${MAX_GROUPS} 个`);
        newGroupName = validateGroupName(groups, options.newGroupName);
    }
    // 按名称（忽略大小写）索引分组；重名时取最先出现的，与逐个 find 的结果一致。
    const groupIdByNameKey = new Map();
    for (const group of groups) {
        const key = lowerKey(group.name);
        if (!groupIdByNameKey.has(key)) groupIdByNameKey.set(key, group.id);
    }
    let groupLimitWarned = false;
    const createGroupNamed = (name) => {
        if (groups.length >= MAX_GROUPS) {
            if (!groupLimitWarned) {
                groupLimitWarned = true;
                warnings.push({ code: 'group-limit', message: `分组已达 ${MAX_GROUPS} 个上限，部分角色放入未分组` });
            }
            return UNGROUPED_ID;
        }
        const id = takeUniqueId('grp', usedGroupIds, makeId);
        groups.push({ id, name });
        const key = lowerKey(name);
        if (!groupIdByNameKey.has(key)) groupIdByNameKey.set(key, id);
        summary.groupsCreated += 1;
        return id;
    };
    const resolveTargetGroup = (groupName) => {
        if (mode === 'existing-group') return fixedGroupId;
        const name = mode === 'new-group' ? newGroupName : groupName;
        if (!name) return UNGROUPED_ID;
        const existingId = groupIdByNameKey.get(lowerKey(name));
        return existingId === undefined ? createGroupNamed(name) : existingId;
    };
    // “保留两者”的副本名要避开库里与本次已新增的所有名称 / 别名；增量维护，避免每条都重扫整个库。
    const takenNameKeys = policy === 'keep-both' ? collectNameKeys(characters) : null;

    const toPlace = [];
    const movedIds = new Set();
    const addedNames = [];
    for (const entry of parsed.entries) {
        const { character, fields, duplicate } = entry;
        const existing = character.id && !duplicate ? byId.get(character.id) : undefined;
        const record = (action, id) => details.push({ name: character.name, id, action });

        if (existing && policy === 'skip') {
            summary.skipped += 1;
            record('skipped', existing.id);
            continue;
        }
        if (existing && policy === 'replace') {
            for (const field of fields) existing[field] = cloneJson(character[field]);
            summary.replaced += 1;
            record('replaced', existing.id);
            if (mode !== 'auto' && !movedIds.has(existing.id)) {
                movedIds.add(existing.id);
                toPlace.push({ character: existing, groupId: resolveTargetGroup(entry.groupName) });
            }
            continue;
        }

        const keepBoth = Boolean(existing);
        const id = !keepBoth && character.id && !duplicate && !usedCharacterIds.has(character.id)
            ? (usedCharacterIds.add(character.id), character.id)
            : takeUniqueId('char', usedCharacterIds, makeId);
        const added = {
            ...cloneJson(character),
            id,
            ...(keepBoth ? { aliases: [] } : {}),
            enabled: options.importNewAsDisabled ? false : character.enabled,
        };
        if (keepBoth) {
            added.name = makeCopyName(character.name, takenNameKeys);
            summary.keptBoth += 1;
        } else {
            summary.added += 1;
        }
        addedNames.push(added);
        if (takenNameKeys) {
            for (const key of [added.name, ...(added.aliases || [])].map(lowerKey)) {
                if (key) takenNameKeys.add(key);
            }
        }
        record(keepBoth ? 'kept-both' : 'added', id);
        toPlace.push({ character: added, groupId: resolveTargetGroup(entry.groupName) });
    }

    const result = placeCharactersAfterGroupMembers(
        characters.filter(character => !movedIds.has(character.id)),
        toPlace,
    );

    const normalized = normalizeCharacterLibrary({ characters: result, groups });
    const finalLibrary = { characters: normalized.characters, groups: normalized.groups };

    // 与现有有效启用的角色同名（id 不同）：不自动处理，仅提示，因为同名时数组靠前者优先命中。
    // 按导入后的分组开关判断：关闭分组里的角色不参与出图，不构成冲突。
    const effective = selectEnabledCharacters(finalLibrary);
    const effectiveIds = new Set(effective.map(character => character.id));
    const addedIds = new Set(addedNames.map(added => added.id));
    const enabledKeys = collectNameKeys(effective.filter(character => !addedIds.has(character.id)));
    const conflicts = addedNames
        .filter(added => effectiveIds.has(added.id)
            && [added.name, ...(added.aliases || [])].some(name => enabledKeys.has(lowerKey(name))))
        .map(added => added.name);
    if (conflicts.length) {
        warnings.push({
            code: 'name-conflict',
            count: conflicts.length,
            names: conflicts.slice(0, 5),
            message: `${conflicts.length} 个新增角色与现有启用角色同名或别名重复，可能造成重名`,
        });
    }

    return {
        library: finalLibrary,
        summary: { ...summary, enabledAfter: countEnabledCharacters(finalLibrary), totalAfter: normalized.characters.length },
        warnings,
        details,
    };
}
