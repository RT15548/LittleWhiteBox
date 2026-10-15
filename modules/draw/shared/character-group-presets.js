// 角色分组预设：分组开关的预设、角色卡绑定、匹配与应用的纯函数。
// 只允许 import ./character-library.js（同样零宿主依赖）；不得引入任何酒馆模块，NovelAI 面板在 iframe 里会动态 import 本文件。
// 预设数组元素：{ id, name, revision, groupStates: { [groupId]: boolean }, bindings: [{ type, avatar, name }] }。
// groupStates 只记录“哪些分组开、哪些分组关”（嵌套启用模型里分组开关与角色自己的 enabled 互相独立），
// 没写的分组“保持不动”；未分组没有开关，不出现在预设里；应用预设只改 characterGroups[].enabled，不碰任何角色。
// revision 在会影响应用结果的编辑（groupStates / bindings 变化）时加一，用于边沿触发判断“预设自上次应用后是否被编辑过”。
// 所有函数返回新对象，不修改入参；没有实际变化时返回原引用。

import { setGroupEnabled } from './character-library.js';

export const BINDING_TYPE_CHARACTER = 'character';
export const MAX_GROUP_PRESETS = 30;
export const MAX_PRESET_NAME_LENGTH = 32;
export const MAX_PRESET_BINDINGS = 50;
export const MAX_BINDING_AVATAR_LENGTH = 260;
export const MAX_BINDING_NAME_LENGTH = 64;
export const MAX_GROUP_KEY_LENGTH = 128;

const COPY_SUFFIX = '副本';
// 对象键白名单之外的危险键：即使 JSON.parse 产生了自有的 "__proto__" 属性也一律丢弃。
// 另外，阶段 A 的旧预设曾用 '__ungrouped__' 表示未分组：现在未分组没有开关，该键一律丢弃（真实分组 id 取这个值也无法被预设引用）。
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype', '__ungrouped__']);

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function lowerKey(value) {
    return String(value ?? '').trim().toLocaleLowerCase();
}

function truncate(text, max) {
    return Array.from(text).slice(0, max).join('');
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

// ───────────── 分组键 ─────────────
// 分组键就是角色库的分组 id。

/** 预设能引用的键：非空字符串、不超长、不是危险键（含旧版未分组键）。 */
export function isValidGroupKey(key) {
    return typeof key === 'string' && key !== '' && key.length <= MAX_GROUP_KEY_LENGTH && !FORBIDDEN_KEYS.has(key);
}

function buildAllowedKeys(groupIds) {
    if (groupIds === undefined || groupIds === null) return null;
    const allowed = new Set();
    for (const id of groupIds) {
        if (isValidGroupKey(id)) allowed.add(id);
    }
    return allowed;
}

/**
 * 白名单规范化 groupStates：只接受合法键 + 布尔值（不做类型转换）。
 * 给出 groupIds（库里现有分组 id 列表）时，丢弃指向已不存在分组的键。旧版的未分组键 '__ungrouped__' 始终丢弃。
 */
export function normalizeGroupStates(raw, { groupIds } = {}) {
    if (!isPlainObject(raw)) return {};
    const allowed = buildAllowedKeys(groupIds);
    const entries = [];
    for (const key of Object.keys(raw)) {
        if (!isValidGroupKey(key) || (allowed && !allowed.has(key))) continue;
        const value = raw[key];
        if (typeof value === 'boolean') entries.push([key, value]);
    }
    return Object.fromEntries(entries);
}

function sameGroupStates(a, b) {
    const keysA = Object.keys(a);
    return keysA.length === Object.keys(b).length
        && keysA.every(key => Object.hasOwn(b, key) && a[key] === b[key]);
}

// ───────────── 绑定 ─────────────

/** 单个绑定；不合规（非对象、类型未知、avatar 为空 / 非字符串 / 超长）返回 null。name 仅用于显示。 */
export function normalizeBinding(raw) {
    if (!isPlainObject(raw)) return null;
    const type = raw.type === undefined ? BINDING_TYPE_CHARACTER : raw.type;
    if (type !== BINDING_TYPE_CHARACTER) return null;
    if (typeof raw.avatar !== 'string' || !raw.avatar.trim() || raw.avatar.length > MAX_BINDING_AVATAR_LENGTH) return null;
    const name = typeof raw.name === 'string' ? truncate(raw.name.trim(), MAX_BINDING_NAME_LENGTH) : '';
    return { type, avatar: raw.avatar, name };
}

function bindingKey(binding) {
    return `${binding.type}\u0000${binding.avatar}`;
}

/** 规范化绑定列表：丢弃不合规项，按 (type, avatar) 去重（先出现的保留），数量封顶。 */
export function normalizeBindings(raw) {
    const seen = new Set();
    const bindings = [];
    for (const item of Array.isArray(raw) ? raw : []) {
        if (bindings.length >= MAX_PRESET_BINDINGS) break;
        const binding = normalizeBinding(item);
        if (!binding || seen.has(bindingKey(binding))) continue;
        seen.add(bindingKey(binding));
        bindings.push(binding);
    }
    return bindings;
}

// ───────────── 规范化 ─────────────

const FALLBACK_PRESET_NAME = '未命名预设';

function takeUniqueName(base, usedKeys) {
    let name = base;
    for (let n = 2; usedKeys.has(lowerKey(name)); n += 1) {
        const suffix = ` ${n}`;
        name = `${truncate(base, MAX_PRESET_NAME_LENGTH - suffix.length)}${suffix}`;
    }
    usedKeys.add(lowerKey(name));
    return name;
}

function normalizeRevision(value) {
    return Number.isSafeInteger(value) && value >= 1 ? value : 1;
}

/**
 * 宽松规范化（读取 / 保存时用）：丢弃非对象项，补发缺失 / 重复的 id，名称截断并唯一化（重名追加序号而不是丢弃预设），
 * revision 缺省为 1，数量封顶，groupStates / bindings 白名单过滤。
 */
export function normalizeGroupPresets(raw, { groupIds, makeId } = {}) {
    const usedIds = new Set();
    const usedNames = new Set();
    const presets = [];
    for (const item of Array.isArray(raw) ? raw : []) {
        if (!isPlainObject(item) || presets.length >= MAX_GROUP_PRESETS) continue;
        const givenId = typeof item.id === 'string' ? item.id.trim() : '';
        const id = givenId && !usedIds.has(givenId)
            ? (usedIds.add(givenId), givenId)
            : takeUniqueId('gpreset', usedIds, makeId);
        const rawName = typeof item.name === 'string' ? truncate(item.name.trim(), MAX_PRESET_NAME_LENGTH) : '';
        presets.push({
            id,
            name: takeUniqueName(rawName || FALLBACK_PRESET_NAME, usedNames),
            revision: normalizeRevision(item.revision),
            groupStates: normalizeGroupStates(item.groupStates, { groupIds }),
            bindings: normalizeBindings(item.bindings),
        });
    }
    return presets;
}

/** “最近一次应用记录”：{ presetId, revision, appliedAt }；指向不存在的预设或格式不对时为 null。 */
export function normalizeGroupPresetApplied(raw, presets = []) {
    if (!isPlainObject(raw) || typeof raw.presetId !== 'string' || !raw.presetId) return null;
    if (!presets.some(preset => preset.id === raw.presetId)) return null;
    const appliedAt = Number(raw.appliedAt);
    return {
        presetId: raw.presetId,
        revision: normalizeRevision(raw.revision),
        appliedAt: Number.isFinite(appliedAt) && appliedAt > 0 ? Math.floor(appliedAt) : 0,
    };
}

/** 设置层入口：presets 与 applied 一起规范化（applied 依赖规范化后的 presets）。 */
export function normalizeGroupPresetState({ presets, applied } = {}, { groupIds, makeId } = {}) {
    const normalizedPresets = normalizeGroupPresets(presets, { groupIds, makeId });
    return {
        presets: normalizedPresets,
        applied: normalizeGroupPresetApplied(applied, normalizedPresets),
    };
}

// ───────────── 增删改 ─────────────

const UNDO_CONFLICT = '分组预设已发生变化，无法撤销';

// 仅在撤销窗口内保存被删除分组的引用，不保留整份预设快照。
export function captureGroupPresetReferences(presets, groupId) {
    return {
        groupId,
        references: presets.filter(preset => Object.hasOwn(preset.groupStates, groupId))
            .map(preset => ({ presetId: preset.id, revision: preset.revision, enabled: preset.groupStates[groupId] })),
    };
}

// 宿主在同一次设置事务里恢复分组与引用。任一相关预设被改动/删除时整次撤销失败，
// 不覆盖其他预设、名称或绑定；恢复影响应用结果，因此增加 revision。
export function restoreGroupPresetReferences(presets, { groupId, references }) {
    if (!isValidGroupKey(groupId) || !Array.isArray(references)) throw new TypeError(UNDO_CONFLICT);
    const updates = new Map();
    for (const reference of references) {
        const preset = presets.find(item => item.id === reference.presetId);
        if (!preset || preset.revision !== reference.revision || typeof reference.enabled !== 'boolean') {
            throw new TypeError(UNDO_CONFLICT);
        }
        updates.set(preset.id, reference.enabled);
    }
    return presets.map(preset => updates.has(preset.id)
        ? { ...preset, revision: preset.revision + 1, groupStates: { ...preset.groupStates, [groupId]: updates.get(preset.id) } }
        : preset);
}

function validateName(presets, name, exceptId = '') {
    const trimmed = String(typeof name === 'string' ? name : '').trim();
    if (!trimmed) throw new TypeError('预设名不能为空');
    if (Array.from(trimmed).length > MAX_PRESET_NAME_LENGTH) {
        throw new TypeError(`预设名不能超过 ${MAX_PRESET_NAME_LENGTH} 个字符`);
    }
    if (presets.some(preset => preset.id !== exceptId && lowerKey(preset.name) === lowerKey(trimmed))) {
        throw new TypeError(`预设“${trimmed}”已存在`);
    }
    return trimmed;
}

function requirePreset(presets, presetId) {
    const preset = presets.find(item => item.id === presetId);
    if (!preset) throw new TypeError('预设不存在');
    return preset;
}

function updatePreset(presets, presetId, update) {
    return presets.map(preset => (preset.id === presetId ? update(preset) : preset));
}

/** 创建预设（名称非空、不超长、与现有预设不重名，数量上限 MAX_GROUP_PRESETS）。追加在末尾=优先级最低。 */
export function createPreset(presets, name, { groupStates, bindings, groupIds, makeId } = {}) {
    if (presets.length >= MAX_GROUP_PRESETS) throw new TypeError(`预设数量不能超过 ${MAX_GROUP_PRESETS} 个`);
    const trimmed = validateName(presets, name);
    const used = new Set(presets.map(preset => preset.id));
    const id = takeUniqueId('gpreset', used, makeId);
    const preset = {
        id,
        name: trimmed,
        revision: 1,
        groupStates: normalizeGroupStates(groupStates, { groupIds }),
        bindings: normalizeBindings(bindings),
    };
    return { presets: [...presets, preset], presetId: id };
}

/** 重命名不影响应用结果，因此不增加 revision。 */
export function renamePreset(presets, presetId, name) {
    const current = requirePreset(presets, presetId);
    const trimmed = validateName(presets, name, presetId);
    if (trimmed === current.name) return presets;
    return updatePreset(presets, presetId, preset => ({ ...preset, name: trimmed }));
}

export function deletePreset(presets, presetId) {
    requirePreset(presets, presetId);
    return presets.filter(preset => preset.id !== presetId);
}

/** 复制：紧跟在原预设之后，名称加“副本”（必要时追加序号以避开重名），revision 从 1 开始，绑定一并复制。 */
export function duplicatePreset(presets, presetId, { makeId } = {}) {
    const source = requirePreset(presets, presetId);
    if (presets.length >= MAX_GROUP_PRESETS) throw new TypeError(`预设数量不能超过 ${MAX_GROUP_PRESETS} 个`);
    const used = new Set(presets.map(preset => preset.id));
    const id = takeUniqueId('gpreset', used, makeId);
    const base = `${source.name} ${COPY_SUFFIX}`;
    const takenNames = new Set(presets.map(preset => lowerKey(preset.name)));
    let name = truncate(base, MAX_PRESET_NAME_LENGTH);
    for (let n = 2; takenNames.has(lowerKey(name)); n += 1) {
        const suffix = ` ${COPY_SUFFIX} ${n}`;
        name = `${truncate(source.name, MAX_PRESET_NAME_LENGTH - Array.from(suffix).length)}${suffix}`;
    }
    const copy = {
        id,
        name,
        revision: 1,
        groupStates: { ...source.groupStates },
        bindings: source.bindings.map(binding => ({ ...binding })),
    };
    const index = presets.findIndex(preset => preset.id === presetId);
    return { presets: [...presets.slice(0, index + 1), copy, ...presets.slice(index + 1)], presetId: id };
}

/**
 * 设置某个分组的目标开关：true=开 / false=关 / null=不管（移除该键）。
 * 给出 groupIds 时，键必须是其中之一，否则抛 TypeError。
 */
export function setGroupState(presets, presetId, groupKey, state, { groupIds } = {}) {
    const current = requirePreset(presets, presetId);
    if (!isValidGroupKey(groupKey)) throw new TypeError('分组无效');
    const allowed = buildAllowedKeys(groupIds);
    if (allowed && !allowed.has(groupKey)) throw new TypeError('分组不存在');
    if (state !== null && typeof state !== 'boolean') throw new TypeError('分组状态必须是 true、false 或 null');
    const has = Object.hasOwn(current.groupStates, groupKey);
    if (state === null ? !has : (has && current.groupStates[groupKey] === state)) return presets;
    const entries = Object.entries(current.groupStates).filter(([key]) => key !== groupKey);
    if (state !== null) entries.push([groupKey, state]);
    return updatePreset(presets, presetId, preset => ({
        ...preset,
        revision: preset.revision + 1,
        groupStates: Object.fromEntries(entries),
    }));
}

/** 批量设置：默认合并进现有 groupStates；replace 为 true 时整体替换（如“用当前分组开关覆盖预设”）。 */
export function setGroupStates(presets, presetId, groupStates, { groupIds, replace = false } = {}) {
    const current = requirePreset(presets, presetId);
    const incoming = normalizeGroupStates(groupStates, { groupIds });
    const next = replace ? incoming : { ...current.groupStates, ...incoming };
    if (sameGroupStates(current.groupStates, next)) return presets;
    return updatePreset(presets, presetId, preset => ({
        ...preset,
        revision: preset.revision + 1,
        groupStates: next,
    }));
}

/** 添加绑定：已存在（同 type + avatar）时只更新显示名（不增加 revision）；超过 MAX_PRESET_BINDINGS 抛 TypeError。 */
export function addBinding(presets, presetId, binding) {
    const current = requirePreset(presets, presetId);
    const normalized = normalizeBinding(binding);
    if (!normalized) throw new TypeError('绑定无效');
    const existing = current.bindings.find(item => bindingKey(item) === bindingKey(normalized));
    if (existing) {
        if (!normalized.name || normalized.name === existing.name) return presets;
        return updatePreset(presets, presetId, preset => ({
            ...preset,
            bindings: preset.bindings.map(item => (item === existing ? { ...item, name: normalized.name } : item)),
        }));
    }
    if (current.bindings.length >= MAX_PRESET_BINDINGS) {
        throw new TypeError(`单个预设最多绑定 ${MAX_PRESET_BINDINGS} 项`);
    }
    return updatePreset(presets, presetId, preset => ({
        ...preset,
        revision: preset.revision + 1,
        bindings: [...preset.bindings, normalized],
    }));
}

export function removeBinding(presets, presetId, { type = BINDING_TYPE_CHARACTER, avatar } = {}) {
    const current = requirePreset(presets, presetId);
    const bindings = current.bindings.filter(item => !(item.type === type && item.avatar === avatar));
    if (bindings.length === current.bindings.length) return presets;
    return updatePreset(presets, presetId, preset => ({ ...preset, revision: preset.revision + 1, bindings }));
}

/** 调整优先级：上移 / 下移一位；越界时返回原数组。数组靠前的预设优先命中。 */
export function movePreset(presets, presetId, delta) {
    const index = presets.findIndex(preset => preset.id === presetId);
    if (index < 0) throw new TypeError('预设不存在');
    const target = index + (delta < 0 ? -1 : 1);
    if (target < 0 || target >= presets.length) return presets;
    const next = [...presets];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

/** 拖拽排序：放到 beforePresetId 之前；为空则放到末尾。 */
export function placePreset(presets, presetId, beforePresetId = '') {
    const moving = presets.find(preset => preset.id === presetId);
    if (!moving) throw new TypeError('预设不存在');
    if (beforePresetId === presetId) return presets;
    const rest = presets.filter(preset => preset.id !== presetId);
    const at = beforePresetId ? rest.findIndex(preset => preset.id === beforePresetId) : -1;
    const next = at >= 0 ? [...rest.slice(0, at), moving, ...rest.slice(at)] : [...rest, moving];
    return next.every((preset, index) => preset === presets[index]) ? presets : next;
}

// ───────────── 匹配与边沿触发 ─────────────

function toAvatarSet(activeAvatars) {
    const avatars = new Set();
    for (const avatar of activeAvatars ?? []) {
        if (typeof avatar === 'string' && avatar) avatars.add(avatar);
    }
    return avatars;
}

/**
 * 命中规则：预设的任一角色绑定的 avatar 在 activeAvatars 中即命中（单聊传 1 个，群聊传全体成员）。
 * 多个预设同时命中时取数组中靠前的那个；没有命中返回 null。
 */
export function findMatchingPreset(presets, activeAvatars) {
    const avatars = toAvatarSet(activeAvatars);
    if (!avatars.size) return null;
    for (const preset of Array.isArray(presets) ? presets : []) {
        const bindings = Array.isArray(preset?.bindings) ? preset.bindings : [];
        if (bindings.some(binding => binding?.type === BINDING_TYPE_CHARACTER && avatars.has(binding.avatar))) {
            return preset;
        }
    }
    return null;
}

/** 反查：某个 avatar 被哪些预设绑定（供 UI 提示“该角色卡还绑定在 xx 预设，靠前者优先”）。 */
export function findPresetsBoundToAvatar(presets, avatar) {
    return (Array.isArray(presets) ? presets : []).filter(preset => (
        (preset?.bindings || []).some(binding => binding?.type === BINDING_TYPE_CHARACTER && binding.avatar === avatar)
    ));
}

/** 边沿触发：没有应用记录、预设 id 不同或 revision 不同（预设被编辑过）时才需要应用。 */
export function shouldApplyPreset(applied, preset) {
    if (!preset) return false;
    if (!applied) return true;
    return applied.presetId !== preset.id || applied.revision !== preset.revision;
}

function isSameApplied(a, b) {
    return Boolean(a) && Boolean(b) && a.presetId === b.presetId && a.revision === b.revision;
}

// ───────────── 与角色库的交互 ─────────────

/**
 * 把预设应用到角色库：对 groupStates 里每个 true / false 且分组确实存在的键，把该分组的开关设为对应值（setGroupEnabled）。
 * 只改 characterGroups[].enabled：不改任何角色（包括它们自己的 enabled）、顺序和分组；没写进 groupStates 的分组、
 * 指向不存在分组的键、非布尔值都不动。
 * 返回 { library, changed, changedCount, affected }：changedCount 是开关实际发生变化的分组数，
 * affected 按库中分组顺序列出这些分组 { key: 分组 id, enabled: 目标开关 }；无变化时 library 为入参原引用。
 */
export function computePresetApplication(library, preset) {
    const states = isPlainObject(preset?.groupStates) ? preset.groupStates : {};
    let next = library;
    const affected = [];
    for (const group of library.groups || []) {
        if (!isValidGroupKey(group.id) || !Object.hasOwn(states, group.id) || typeof states[group.id] !== 'boolean') continue;
        const target = states[group.id];
        const updated = setGroupEnabled(next, group.id, target);
        if (updated === next) continue;
        next = updated;
        affected.push({ key: group.id, enabled: target });
    }
    if (!affected.length) return { library, changed: false, changedCount: 0, affected: [] };
    return { library: next, changed: true, changedCount: affected.length, affected };
}

/**
 * 从当前库生成 groupStates：每个分组当前的开关（开=true / 关=false）。未分组没有开关，不出现。
 * 分组 id 无法作为预设键（超长 / 危险键）的分组被跳过。
 */
export function captureGroupStatesFromLibrary(library) {
    const entries = [];
    for (const group of library?.groups || []) {
        if (isValidGroupKey(group.id)) entries.push([group.id, group.enabled !== false]);
    }
    return { groupStates: Object.fromEntries(entries) };
}

/**
 * UI 用：每个分组在该预设里的目标开关，按库中分组顺序，没有未分组行。
 * 行 { key（=分组 id）, name, total（组内角色数）, enabledCount（组内自己开着的角色数，不看分组开关）, state }，
 * state 为预设里记录的 true / false，预设没提到该分组时为 null（保持不动）。
 */
export function getPresetGroupRows(library, preset) {
    const states = isPlainObject(preset?.groupStates) ? preset.groupStates : {};
    const rows = [];
    for (const group of library?.groups || []) {
        if (!isValidGroupKey(group.id)) continue;
        rows.push({ key: group.id, name: group.name, total: 0, enabledCount: 0 });
    }
    const byKey = new Map(rows.map(row => [row.key, row]));
    for (const character of library?.characters || []) {
        const row = byKey.get(String(character?.groupId || ''));
        if (!row) continue;
        row.total += 1;
        if (character.enabled !== false) row.enabledCount += 1;
    }
    return rows.map(row => ({
        ...row,
        state: Object.hasOwn(states, row.key) && typeof states[row.key] === 'boolean' ? states[row.key] : null,
    }));
}

/**
 * 一次完整的“要不要应用、应用什么”决策（纯函数，运行时与测试共用）。
 * 入参：presets / applied（最近一次应用记录）/ library / activeAvatars（当前聊天角色 avatar 列表）。
 * 选项：presetId 指定预设（手动“立即应用”，无视绑定与边沿）；force 对命中的预设忽略边沿触发；now 为应用时间戳。
 * status：
 *   'no-presets'      没有任何预设
 *   'preset-missing'  指定的 presetId 不存在
 *   'no-avatars'      当前没有角色 / 群成员（且未指定预设）：不动
 *   'no-match'        没有预设命中：不动，也不清除应用记录
 *   'already-applied' 命中的预设与记录一致（id 和 revision 都相同）且未 force：不重复应用
 *   'applied'         应该应用：library / changed / changedCount / affected 为应用结果，applied 为新的应用记录，
 *                     recordChanged 表示应用记录相对旧记录有变化（决定是否需要保存）
 */
export function planPresetApplication({
    presets, applied = null, library, activeAvatars = [], presetId = '', force = false, now = Date.now(),
}) {
    const list = Array.isArray(presets) ? presets : [];
    if (!list.length) return { status: 'no-presets', preset: null };
    let preset;
    if (presetId) {
        preset = list.find(item => item.id === presetId) ?? null;
        if (!preset) return { status: 'preset-missing', preset: null };
    } else {
        if (!toAvatarSet(activeAvatars).size) return { status: 'no-avatars', preset: null };
        preset = findMatchingPreset(list, activeAvatars);
        if (!preset) return { status: 'no-match', preset: null };
        if (!force && !shouldApplyPreset(applied, preset)) return { status: 'already-applied', preset };
    }
    const result = computePresetApplication(library, preset);
    const record = { presetId: preset.id, revision: preset.revision, appliedAt: Number(now) || 0 };
    return {
        status: 'applied',
        preset,
        library: result.library,
        changed: result.changed,
        changedCount: result.changedCount,
        affected: result.affected,
        applied: record,
        recordChanged: !isSameApplied(applied, record),
    };
}
