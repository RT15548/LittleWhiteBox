/**
 * 沿用角色着装（On-screen Continuity）
 *
 * 与角色库（characterTags）的分工：
 * - 角色库是用户维护的权威身份资料，本模块不修改它；
 * - 这里只汇总「每个角色最近一次实际入画时，下发给生图模型的身份/着装英文 tag」。
 *   下次规划时作为跨楼层画面事实喂给 LLM：默认逐字复用，仅在正文出现明确变化事实时改写。
 *
 * 数据源（刻意保持简单，不单独维护历史系统）：
 * - 直接复用图库图片记录：每张成功图片入库时随存 continuityChars（规划时的原始角色快照）；
 * - 读取时按当前聊天每层的可见图位和选中版本合并，
 *   删楼/切分支/图片删除后锚点自然失效；
 * - 纯数据 + 纯函数，图片记录由宿主查询后注入，便于单测与后台任务复用。
 */
import { isGenericCharacterName } from './generic-char-name.js';

// 只有 NovelAI 规划会注入这块，所以说明随数据走，不写进三家共用的材料说明和字段说明。
const CONTINUITY_BLOCK_HEADER = [
    '【前文画面中的角色】',
    '本聊天前面楼层已经画出的图里，每个角色当时画成的样子。本图画到同一个角色时照这里画，长相和衣服保持一致；这里列出的衣服优先于该角色的服装参考。正文写了换衣服、受伤、弄湿等变化，才按正文改。已录入角色的长相由角色库提供，这里只列衣服。',
].join('\n');
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

/** 渲染给规划 LLM 的【前文画面中的角色】区块；无可用条目时返回空串。 */
export function buildContinuityBlock(entries, { knownNames = [] } = {}) {
    const known = toNameSet(knownNames);
    const lines = [];
    for (const entry of Array.isArray(entries) ? entries : []) {
        if (!entry || (!entry.appear && !entry.costume)) continue;
        const isKnown = known.has(String(entry.name || '').toLocaleLowerCase());
        const parts = [];
        // 已录入角色的身份外貌来自角色库，这里不重复，避免两处描述漂移后互相打架。
        if (!isKnown && entry.appear) parts.push(`appear: ${entry.appear}`);
        if (entry.costume) parts.push(`costume: ${entry.costume}`);
        if (!parts.length) continue;
        lines.push(`- ${entry.name}｜${parts.join('｜')}`);
    }
    if (!lines.length) return '';
    return [CONTINUITY_BLOCK_HEADER, ...lines].join('\n');
}

/**
 * 用一批角色快照更新锚点（时间序调用即按图片顺序生效）。
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
            // An edited prompt can no longer attest to its structured snapshot.
            // An empty named snapshot also revokes older appearances of that name.
            if (!appear && !costume) {
                map.delete(key);
                continue;
            }
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

/**
 * 从图片记录重建锚点状态：记录需按（楼层、时间）升序传入，
 * 每条记录的 continuityChars 视作该图入画时的角色快照。
 */
export function buildContinuityFromImageRecords(records, { knownNames = [] } = {}) {
    let state = normalizeContinuity(null);
    for (const record of Array.isArray(records) ? records : []) {
        const chars = Array.isArray(record?.continuityChars) ? record.continuityChars : [];
        if (!chars.length) continue;
        state = mergePlanIntoContinuity(state.entries, [{ chars }], {
            knownNames,
            now: Number(record?.timestamp) || 0,
        });
    }
    return state;
}

/**
 * 规划前调用：由宿主注入过滤后的图片记录，选出本楼相关锚点并渲染成区块。
 */
export function buildContinuityBlockForRequest({
    records = [],
    presentCharacters = [],
    bodyText = '',
} = {}) {
    const knownNames = (Array.isArray(presentCharacters) ? presentCharacters : [])
        .map(character => character?.name);
    const state = buildContinuityFromImageRecords(records, { knownNames });
    const selected = selectContinuityEntries(state.entries, {
        knownNames,
        bodyText: String(bodyText || ''),
    });
    return buildContinuityBlock(selected, { knownNames });
}

export function continuityAfterTagEdit(record, characterPrompts) {
    const previous = record?.characterPrompts || [];
    return (record?.continuityChars || []).map((char, index) =>
        previous[index]?.prompt === characterPrompts[index]?.prompt
            ? char : { name: char.name, appear: '', costume: '' });
}
