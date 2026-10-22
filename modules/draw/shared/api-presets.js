// 画图 API 配置预设：保存多套 API 设置并随时切换的纯函数（NovelAI / SD WebUI / ComfyUI 共用）。
// 不依赖宿主；NovelAI iframe 与两个宿主 Provider 共用。
// 预设数组元素：{ id, name, config: { ...API 配置字段 } }。三个 Provider 的 API 字段各不相同，
// 字段白名单（fields）由调用方传入，config 里不在白名单内的键一律丢弃；本模块不认识任何具体字段名。
// config 里可能含 API Key / 认证信息：本模块的错误信息、返回值都不带 config 内容，调用方也不得把它写进日志、提示或导出文件。
// 所有函数返回新对象，不修改入参；没有实际变化时返回原引用（便于调用方判断“有没有改动”）。
// 数据存入各 Provider 的酒馆设置文件，不进入角色库导入导出。
import { API_PRESET_COPY } from './api-presets-copy.js';

export const MAX_API_PRESETS = 30;
export const MAX_API_PRESET_NAME_LENGTH = 40;

export class ApiPresetError extends Error {
    constructor(code, message) {
        super(message);
        this.name = 'ApiPresetError';
        this.code = code;
    }
}

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

function takeUniqueName(base, usedKeys) {
    let name = base;
    for (let n = 2; usedKeys.has(lowerKey(name)); n += 1) {
        const suffix = ` ${n}`;
        name = `${truncate(base, MAX_API_PRESET_NAME_LENGTH - suffix.length)}${suffix}`;
    }
    usedKeys.add(lowerKey(name));
    return name;
}

function normalizeFields(fields) {
    const list = [];
    for (const field of Array.isArray(fields) ? fields : []) {
        if (typeof field === 'string' && field && !list.includes(field)) list.push(field);
    }
    return list;
}

// 配置值只会是字符串 / 数字 / 布尔 / 简单对象（如 { min, max }）：递归复制，函数等不可序列化的值按缺省处理。
function cloneValue(value) {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (isPlainObject(value)) {
        const copy = {};
        for (const key of Object.keys(value)) {
            if (key === '__proto__') continue;
            copy[key] = cloneValue(value[key]);
        }
        return copy;
    }
    return typeof value === 'function' || typeof value === 'symbol' ? undefined : value;
}

function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    if (isPlainObject(value)) {
        return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
    }
    return JSON.stringify(value === undefined ? null : value);
}

// ───────────── 配置 ─────────────

/** 只挑白名单字段（按白名单顺序），深拷贝；入参里没有的字段不出现在结果里。 */
export function pickApiConfig(config, fields) {
    const source = isPlainObject(config) ? config : {};
    const picked = {};
    for (const field of normalizeFields(fields)) {
        if (!Object.hasOwn(source, field)) continue;
        const value = cloneValue(source[field]);
        if (value !== undefined) picked[field] = value;
    }
    return picked;
}

/** 两份配置在白名单字段上是否一致（字段缺失与 undefined 视为相同，对象键顺序无关）。 */
export function isSameApiConfig(a, b, fields) {
    return stableStringify(pickApiConfig(a, fields)) === stableStringify(pickApiConfig(b, fields));
}

// ───────────── 规范化 ─────────────

/**
 * 宽松规范化（读取 / 保存时用）：丢弃非对象项，补发缺失 / 重复的 id，名称截断并唯一化（重名追加序号而不是丢弃预设），
 * config 只留白名单字段；数量上限只限制新建，不截断已存配置。normalizeConfig 由 Provider 提供字段规范化。
 */
export function normalizeApiPresets(raw, { fields, normalizeConfig, makeId } = {}) {
    const usedIds = new Set();
    const usedNames = new Set();
    const presets = [];
    for (const item of Array.isArray(raw) ? raw : []) {
        if (!isPlainObject(item)) continue;
        const givenId = typeof item.id === 'string' ? item.id.trim() : '';
        const id = givenId && !usedIds.has(givenId)
            ? (usedIds.add(givenId), givenId)
            : takeUniqueId('apipreset', usedIds, makeId);
        const rawName = typeof item.name === 'string' ? truncate(item.name.trim(), MAX_API_PRESET_NAME_LENGTH) : '';
        const picked = pickApiConfig(item.config, fields);
        const config = typeof normalizeConfig === 'function'
            ? pickApiConfig(normalizeConfig(picked), fields)
            : picked;
        presets.push({ id, name: takeUniqueName(rawName || API_PRESET_COPY.unnamed, usedNames), config });
    }
    return presets;
}

/** 解析已存选择；无有效选择时由 normalizeApiPresetState 收纳当前配置。 */
export function normalizeActiveApiPresetId(id, presets = []) {
    return typeof id === 'string' && id && presets.some(preset => preset.id === id) ? id : null;
}

/**
 * 配置读取入口：正式线的单套 API 配置收纳为第一条真实预设，配置值不变。
 * 已有有效选择时保留它；否则复用相同配置或保留当前配置为独立预设，不自动换用另一套凭据。
 */
export function normalizeApiPresetState(source = {}, options = {}) {
    const presets = normalizeApiPresets(source.apiPresets, options);
    const activeId = normalizeActiveApiPresetId(source.activeApiPresetId, presets);
    if (activeId) return { apiPresets: presets, activeApiPresetId: activeId };
    const config = pickApiConfig(options.normalizeConfig ? options.normalizeConfig(source) : source, options.fields);
    const matching = presets.find(preset => isSameApiConfig(preset.config, config, options.fields));
    if (matching) return { apiPresets: presets, activeApiPresetId: matching.id };
    // 稳定 ID：首次落盘前的重复读取仍指向同一条配置。
    const ids = new Set(presets.map(preset => preset.id));
    let id = 'apipreset-default';
    for (let n = 2; ids.has(id); n += 1) id = `apipreset-default-${n}`;
    const name = takeUniqueName(API_PRESET_COPY.initialName, new Set(presets.map(preset => lowerKey(preset.name))));
    return { apiPresets: [{ id, name, config }, ...presets], activeApiPresetId: id };
}

/** 深拷贝预设列表（交给界面 / 持久化前用，避免共享引用）。 */
export function cloneApiPresets(presets) {
    return (Array.isArray(presets) ? presets : [])
        .filter(isPlainObject)
        .map(preset => ({ ...preset, config: cloneValue(preset.config) ?? {} }));
}

export function findApiPreset(presets, presetId) {
    return (Array.isArray(presets) ? presets : []).find(preset => preset.id === presetId) || null;
}

// ───────────── 编辑 ─────────────

function validateName(presets, name, exceptId = '') {
    const trimmed = String(typeof name === 'string' ? name : '').trim();
    if (!trimmed) throw new ApiPresetError('EMPTY_NAME', API_PRESET_COPY.emptyName);
    if (Array.from(trimmed).length > MAX_API_PRESET_NAME_LENGTH) {
        throw new ApiPresetError('NAME_TOO_LONG', API_PRESET_COPY.nameTooLong(MAX_API_PRESET_NAME_LENGTH));
    }
    if (presets.some(preset => preset.id !== exceptId && lowerKey(preset.name) === lowerKey(trimmed))) {
        throw new ApiPresetError('DUPLICATE_NAME', API_PRESET_COPY.duplicateName(trimmed));
    }
    return trimmed;
}

function requirePreset(presets, presetId) {
    const preset = findApiPreset(presets, presetId);
    if (!preset) throw new ApiPresetError('PRESET_NOT_FOUND', API_PRESET_COPY.missingPreset);
    return preset;
}

/** 新建预设（名称非空、不超长、与现有预设不重名，数量上限 MAX_API_PRESETS）。追加在末尾。 */
export function createApiPreset(presets, name, config, { fields, makeId } = {}) {
    if (presets.length >= MAX_API_PRESETS) throw new ApiPresetError('PRESET_LIMIT', API_PRESET_COPY.tooMany(MAX_API_PRESETS));
    const trimmed = validateName(presets, name);
    const used = new Set(presets.map(preset => preset.id));
    const id = takeUniqueId('apipreset', used, makeId);
    return { presets: [...presets, { id, name: trimmed, config: pickApiConfig(config, fields) }], presetId: id };
}

/** 用新配置覆盖保存到已有预设（名称与 id 不变）；配置没变化时返回原数组。 */
export function overwriteApiPreset(presets, presetId, config, { fields } = {}) {
    const current = requirePreset(presets, presetId);
    const next = pickApiConfig(config, fields);
    if (isSameApiConfig(current.config, next, fields)) return presets;
    return presets.map(preset => (preset.id === presetId ? { ...preset, config: next } : preset));
}

export function renameApiPreset(presets, presetId, name) {
    const current = requirePreset(presets, presetId);
    const trimmed = validateName(presets, name, presetId);
    if (trimmed === current.name) return presets;
    return presets.map(preset => (preset.id === presetId ? { ...preset, name: trimmed } : preset));
}

export function deleteApiPreset(presets, presetId) {
    requirePreset(presets, presetId);
    if (presets.length === 1) throw new ApiPresetError('LAST_PRESET', API_PRESET_COPY.lastPreset);
    return presets.filter(preset => preset.id !== presetId);
}

/**
 * “保存”按钮用：把这次保存的生效配置同步回当前选中的预设。
 * 没选中预设（或选中的预设已不存在）时原样返回，不新建任何预设。
 */
export function syncActiveApiPreset(presets, activeApiPresetId, config, { fields } = {}) {
    if (!activeApiPresetId || !findApiPreset(presets, activeApiPresetId)) return presets;
    return overwriteApiPreset(presets, activeApiPresetId, config, { fields });
}

// ───────────── 未保存判断 ─────────────

/**
 * 切换预设会整体覆盖当前生效的 API 配置：这些情况下覆盖前需要用户确认（否则会悄悄丢掉没存进任何预设的 Key / 地址）。
 *  - 表单里有还没保存的修改（表单 ≠ 已生效配置）；
 *  - 选中了预设，但生效配置与它不一致；
 *  - 没选中预设，生效配置不是缺省值，且与现有任何一个预设都不一致。
 * defaults（可选）：缺省配置，生效配置等于它时视为“没有东西可丢”。
 */
export function hasUnsavedApiConfig({ presets = [], activeApiPresetId = null, formConfig, effectiveConfig, defaults, fields } = {}) {
    if (!isSameApiConfig(formConfig, effectiveConfig, fields)) return true;
    const active = findApiPreset(presets, activeApiPresetId);
    if (active) return !isSameApiConfig(effectiveConfig, active.config, fields);
    if (defaults && isSameApiConfig(effectiveConfig, defaults, fields)) return false;
    return !presets.some(preset => isSameApiConfig(effectiveConfig, preset.config, fields));
}
