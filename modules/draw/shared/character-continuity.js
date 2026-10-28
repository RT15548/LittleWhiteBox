/**
 * 上镜锚点（On-screen Continuity Ledger）
 *
 * 与角色库（characterTags）的分工：
 * - 角色库是用户维护的权威身份资料，本模块不修改它；
 * - 这里只缓存「每个角色最近一次实际入画时，下发给生图模型的身份/着装英文 tag」。
 *   下次规划时作为跨楼层画面事实喂给 LLM：默认逐字复用，仅在正文出现明确变化事实时改写。
 *
 * 设计取舍（刻意保持简单）：
 * - last-snapshot 覆盖更新，不做事件流、不按楼层重放；
 * - 已录入角色只记当前着装（身份外貌以角色库为唯一权威）；
 * - 纯数据 + 纯函数，宿主 IO 全部走可注入的 context，便于单测与后台任务复用。
 */
import { isGenericCharacterName } from './generic-char-name.js';

export const CONTINUITY_META_KEY = 'xbDrawContinuity';
const CONTINUITY_VERSION = 1;
const MAX_ENTRIES = 40;
const MAX_TAG_LENGTH = 600;

function sanitizeTags(value) {
    return String(value || '').replace(/\s+/g, ' ').trim().slice(0, MAX_TAG_LENGTH);
}

function normalizeEntry(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const name = String(raw.name || '').trim();
    if (!name) return null;
    const appear = sanitizeTags(raw.appear);
    const costume = sanitizeTags(raw.costume);
    if (!appear && !costume) return null;
    return { name, appear, costume, at: Number(raw.at) || 0 };
}

/** 容忍脏数据/乱序/重复键，产出按时间升序、键唯一的快照集。 */
export function normalizeContinuity(raw) {
    const list = Array.isArray(raw?.entries) ? raw.entries : [];
    const map = new Map();
    for (const item of list) {
        const entry = normalizeEntry(item);
        if (!entry) continue;
        const key = entry.name.toLocaleLowerCase();
        const existing = map.get(key);
        if (!existing || entry.at >= existing.at) map.set(key, entry);
    }
    return {
        version: CONTINUITY_VERSION,
        entries: [...map.values()].sort((a, b) => a.at - b.at),
    };
}

function toNameSet(names) {
    return new Set(
        (Array.isArray(names) ? names : [])
            .map(name => String(name || '').trim().toLocaleLowerCase())
            .filter(Boolean),
    );
}

/**
 * 本次请求只注入相关锚点：已录入角色（presentCharacters 已按本楼正文过滤）全部保留；
 * 未录入角色仅当名字仍出现在本楼正文时保留；通用称呼永远不进锚点。
 */
export function selectContinuityEntries(entries, { knownNames = [], bodyText = '' } = {}) {
    const known = toNameSet(knownNames);
    const text = String(bodyText || '').toLocaleLowerCase();
    return (Array.isArray(entries) ? entries : []).filter((entry) => {
        const key = String(entry?.name || '').toLocaleLowerCase();
        if (!key) return false;
        if (known.has(key)) return true;
        if (isGenericCharacterName(entry.name)) return false;
        return text.includes(key);
    });
}

/** 渲染给规划 LLM 的【上镜锚点】区块；无可用锚点时返回空串。 */
export function buildContinuityBlock(entries, { knownNames = [] } = {}) {
    const known = toNameSet(knownNames);
    const lines = [];
    for (const entry of Array.isArray(entries) ? entries : []) {
        if (!entry || (!entry.appear && !entry.costume)) continue;
        const isKnown = known.has(String(entry.name || '').toLocaleLowerCase());
        const parts = [];
        // 已录入角色的身份外貌来自角色库，锚点不重复，避免两处描述漂移后互相打架。
        if (!isKnown && entry.appear) parts.push(`上镜外貌: ${entry.appear}`);
        if (entry.costume) parts.push(`当前着装: ${entry.costume}`);
        if (!parts.length) continue;
        const suffix = isKnown ? '（角色库已录入，身份外貌以【已录入角色】为准）' : '';
        lines.push(`- ${entry.name}${suffix}｜${parts.join('｜')}`);
    }
    if (!lines.length) return '';
    return [
        '【上镜锚点】',
        '下列角色最近一次实际入画时使用的英文 tag，是仍然成立的跨楼层画面事实（不是新角色设定）：',
        lines.join('\n'),
    ].join('\n');
}

/**
 * 用本次已解析的计划更新锚点。
 * - 已录入角色：只更新「当前着装」，appear 永不写入；
 * - 未录入角色：appear/costume 各自仅在本次非空时覆盖（模型漏写不清空记忆）；
 * - 通用称呼跳过；超过上限淘汰最久未出现的角色。
 */
export function mergePlanIntoContinuity(entries, tasks, { knownNames = [], now = Date.now() } = {}) {
    const map = new Map(
        (Array.isArray(entries) ? entries : [])
            .map(entry => [String(entry.name || '').toLocaleLowerCase(), { ...entry }]),
    );
    const known = toNameSet(knownNames);
    const timestamp = Number.isFinite(Number(now)) ? Number(now) : Date.now();

    for (const task of Array.isArray(tasks) ? tasks : []) {
        for (const char of Array.isArray(task?.chars) ? task.chars : []) {
            const name = String(char?.name || '').trim();
            if (!name || isGenericCharacterName(name)) continue;
            const key = name.toLocaleLowerCase();
            const isKnown = known.has(key);
            const appear = sanitizeTags(char.appear);
            const costume = sanitizeTags(char.costume);
            if (isKnown) {
                if (!costume) continue;
            } else if (!appear && !costume) {
                continue;
            }
            const previous = map.get(key);
            const next = {
                name: previous?.name || name,
                appear: isKnown ? (previous?.appear || '') : (appear || previous?.appear || ''),
                costume: costume || previous?.costume || '',
                at: timestamp,
            };
            if (!next.appear && !next.costume) continue;
            map.set(key, next);
        }
    }

    const merged = [...map.values()].sort((a, b) => a.at - b.at);
    return normalizeContinuity({
        version: CONTINUITY_VERSION,
        entries: merged.slice(-MAX_ENTRIES),
    });
}

export function readContinuityContext(context) {
    const metadata = context?.chatMetadata;
    if (!metadata || typeof metadata !== 'object') {
        return { version: CONTINUITY_VERSION, entries: [] };
    }
    return normalizeContinuity(metadata[CONTINUITY_META_KEY]);
}

export function writeContinuityContext(context, state) {
    if (!context?.chatMetadata || typeof context.chatMetadata !== 'object') return false;
    context.chatMetadata[CONTINUITY_META_KEY] = {
        version: CONTINUITY_VERSION,
        entries: Array.isArray(state?.entries) ? state.entries : [],
    };
    return true;
}

async function resolveHostContext(injected) {
    if (injected) return injected;
    // 动态加载保持本模块对纯 node 测试环境零宿主依赖。
    const { getContext } = await import('../../../../../../extensions.js');
    return getContext();
}

/** 规划前调用：选出本楼相关锚点并渲染成区块。任何宿主异常都退化为「无锚点」。 */
export async function buildContinuityBlockForRequest({
    presentCharacters = [],
    bodyText = '',
    context = null,
} = {}) {
    try {
        const ctx = await resolveHostContext(context);
        const state = readContinuityContext(ctx);
        const knownNames = (Array.isArray(presentCharacters) ? presentCharacters : [])
            .map(character => character?.name);
        const selected = selectContinuityEntries(state.entries, {
            knownNames,
            bodyText: String(bodyText || ''),
        });
        return buildContinuityBlock(selected, { knownNames });
    } catch (error) {
        console.warn('[Draw Continuity] 读取上镜锚点失败:', error);
        return '';
    }
}

/** 规划成功后调用：把本次实际入画的身份/着装快照写回聊天元数据。best-effort。 */
export async function recordPlanContinuity(tasks, {
    knownNames = [],
    context = null,
    now = Date.now(),
} = {}) {
    try {
        const ctx = await resolveHostContext(context);
        if (!ctx?.chatMetadata) return false;
        const state = readContinuityContext(ctx);
        const next = mergePlanIntoContinuity(state.entries, tasks, { knownNames, now });
        if (!writeContinuityContext(ctx, next)) return false;
        ctx.saveMetadataDebounced?.();
        return true;
    } catch (error) {
        console.warn('[Draw Continuity] 写入上镜锚点失败:', error);
        return false;
    }
}
