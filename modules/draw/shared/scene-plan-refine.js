import { DEFAULT_MAX_ENTRIES, fillOmittedCostumes, findOmittedCostumes, positiveInteger } from './character-continuity.js';
import { dedupeTaskTags } from './character-field-dedupe.js';

/**
 * 规划解析完之后的收尾：浏览器和后台 Draw Run 共用同一个入口（executePreparedScenePlanner），所以两条路径行为一致。
 * 收尾要用到的数据由页面在准备规划数据时放进 planner.refine，随快照一起送到后台：
 *   { dedupe?: boolean, continuity?: { entries: 记忆条目[], maxEntries: 正整数 } }
 * - continuity：去掉模型抄回来的“（空＝没穿）”；整个没写 costume 的角色沿用记忆里的衣着，补不上的打 costumeOmitted 标记；
 * - dedupe：同一个词只留优先级最高的一处（外貌 > costume > action > scene）。
 * 没有 refine 就什么都不做（SD WebUI / ComfyUI 等其它调用方不受影响）。
 */
const MAX_REFINE_ENTRIES = 500;
const MAX_ENTRIES_LIMIT = 99999;

// 记忆条目只认这几个字段，文字类字段限长（名字 200、其余 1000 字），别的一律不收。
const ENTRY_TEXT_LIMITS = { name: 200, form: 1000, appear: 1000, costume: 1000 };
const ENTRY_NUMBER_KEYS = ['at', 'floor'];

const isPlainObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function isValidEntry(entry) {
    if (!isPlainObject(entry)) return false;
    return Object.entries(entry).every(([key, value]) => {
        if (key in ENTRY_TEXT_LIMITS) return typeof value === 'string' && value.length <= ENTRY_TEXT_LIMITS[key];
        if (ENTRY_NUMBER_KEYS.includes(key)) return typeof value === 'number' && Number.isFinite(value);
        return key === 'edited' && typeof value === 'boolean';
    });
}

/** 页面这边：只留下认识的字段，并把文字截到限长以内。 */
function cleanEntry(entry) {
    const out = {};
    for (const [key, limit] of Object.entries(ENTRY_TEXT_LIMITS)) {
        if (typeof entry[key] === 'string') out[key] = entry[key].slice(0, limit);
    }
    for (const key of ENTRY_NUMBER_KEYS) {
        if (Number.isFinite(entry[key])) out[key] = entry[key];
    }
    if (entry.edited === true) out.edited = true;
    return out;
}

/** 校验 planner.refine 的形状；不合格就抛错（后台入口用它拒收坏数据）。 */
export function assertScenePlanRefine(raw) {
    if (!isPlainObject(raw)) throw new TypeError('planner.refine must be an object');
    for (const key of Object.keys(raw)) {
        if (key !== 'dedupe' && key !== 'continuity') throw new TypeError(`planner.refine.${key} is not allowed`);
    }
    if (raw.dedupe !== undefined && typeof raw.dedupe !== 'boolean') throw new TypeError('planner.refine.dedupe must be a boolean');
    if (raw.continuity === undefined) return raw;
    const continuity = raw.continuity;
    if (!isPlainObject(continuity)) throw new TypeError('planner.refine.continuity must be an object');
    for (const key of Object.keys(continuity)) {
        if (key !== 'entries' && key !== 'maxEntries') throw new TypeError(`planner.refine.continuity.${key} is not allowed`);
    }
    if (!Array.isArray(continuity.entries) || continuity.entries.length > MAX_REFINE_ENTRIES
        || !continuity.entries.every(isValidEntry)) {
        throw new TypeError(`planner.refine.continuity.entries must be an array of at most ${MAX_REFINE_ENTRIES} entries with known, size-limited fields`);
    }
    if (!Number.isInteger(continuity.maxEntries) || continuity.maxEntries < 1 || continuity.maxEntries > MAX_ENTRIES_LIMIT) {
        throw new TypeError('planner.refine.continuity.maxEntries must be a positive integer');
    }
    return raw;
}

/** 页面这边：把要送出去的 refine 整理成可序列化的干净形状。 */
export function normalizeScenePlanRefine(raw) {
    if (!isPlainObject(raw)) return null;
    const refine = {};
    if (raw.dedupe === true) refine.dedupe = true;
    if (isPlainObject(raw.continuity) && Array.isArray(raw.continuity.entries)) {
        refine.continuity = {
            entries: raw.continuity.entries.filter(isPlainObject).slice(-MAX_REFINE_ENTRIES).map(cleanEntry),
            maxEntries: Math.min(positiveInteger(raw.continuity.maxEntries, DEFAULT_MAX_ENTRIES), MAX_ENTRIES_LIMIT),
        };
    }
    return Object.keys(refine).length ? refine : null;
}

/** 模型原始提交的参数（整个没写 costume 字段的角色，解析后的计划里已经分不出来了，要从这里看）。 */
export function readRawPlanArguments(result) {
    const calls = Array.isArray(result?.toolCalls) ? result.toolCalls : [];
    return (calls.find(call => call?.name === 'submit_scene_plan') ?? calls[0])?.arguments ?? null;
}

export function refineScenePlanTasks(tasks, { refine, presentCharacters = [], rawArguments = null } = {}) {
    if (!refine || !Array.isArray(tasks)) return tasks;
    let refined = tasks;
    if (refine.continuity) {
        refined = fillOmittedCostumes(refined, {
            entries: refine.continuity.entries,
            presentCharacters,
            maxEntries: refine.continuity.maxEntries,
            omitted: findOmittedCostumes(rawArguments),
        });
    }
    if (refine.dedupe) refined = dedupeTaskTags(refined, { presentCharacters });
    return refined;
}
