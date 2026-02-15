// ═══════════════════════════════════════════════════════════════════════════
// entity-lexicon.js - 实体词典（确定性，无 LLM）
//
// 职责：
// 1. 从已有结构化存储构建可信实体词典
// 2. 从文本中提取命中的实体
//
// 硬约束：name1 永不进入词典
// ═══════════════════════════════════════════════════════════════════════════

import { getStateAtoms } from '../storage/state-store.js';

// 人名词典黑名单：代词、标签词、明显非人物词
const PERSON_LEXICON_BLACKLIST = new Set([
    '我', '你', '他', '她', '它', '我们', '你们', '他们', '她们', '它们',
    '自己', '对方', '用户', '助手', 'user', 'assistant',
    '男人', '女性', '成熟女性', '主人', '主角',
    '龟头', '子宫', '阴道', '阴茎',
    '电脑', '电脑屏幕', '手机', '监控画面', '摄像头', '阳光', '折叠床', '书房', '卫生间隔间',
]);

/**
 * 标准化字符串（用于实体匹配）
 * @param {string} s
 * @returns {string}
 */
function normalize(s) {
    return String(s || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .toLowerCase();
}

function isBlacklistedPersonTerm(raw) {
    return PERSON_LEXICON_BLACKLIST.has(normalize(raw));
}

function addPersonTerm(set, raw) {
    const n = normalize(raw);
    if (!n || n.length < 2) return;
    if (isBlacklistedPersonTerm(n)) return;
    set.add(n);
}

function collectTrustedCharacters(store, context) {
    const trusted = new Set();

    const main = store?.json?.characters?.main || [];
    for (const m of main) {
        addPersonTerm(trusted, typeof m === 'string' ? m : m.name);
    }

    const arcs = store?.json?.arcs || [];
    for (const a of arcs) {
        addPersonTerm(trusted, a.name);
    }

    if (context?.name2) {
        addPersonTerm(trusted, context.name2);
    }

    const events = store?.json?.events || [];
    for (const ev of events) {
        for (const p of (ev?.participants || [])) {
            addPersonTerm(trusted, p);
        }
    }

    if (context?.name1) {
        trusted.delete(normalize(context.name1));
    }

    return trusted;
}

/**
 * Build trusted character pool only (without scanning L0 candidate atoms).
 * trustedCharacters: main/arcs/name2/L2 participants, excludes name1.
 *
 * @param {object} store
 * @param {object} context
 * @returns {Set<string>}
 */
export function buildTrustedCharacters(store, context) {
    return collectTrustedCharacters(store, context);
}

function collectCandidateCharactersFromL0(context) {
    const candidate = new Set();
    const atoms = getStateAtoms();
    for (const atom of atoms) {
        for (const e of (atom.edges || [])) {
            addPersonTerm(candidate, e?.s);
            addPersonTerm(candidate, e?.t);
        }
    }
    if (context?.name1) {
        candidate.delete(normalize(context.name1));
    }
    return candidate;
}

/**
 * Build character pools with trust tiers.
 * trustedCharacters: main/arcs/name2/L2 participants (clean source)
 * candidateCharacters: L0 edges.s/t (blacklist-cleaned)
 */
export function buildCharacterPools(store, context) {
    const trustedCharacters = collectTrustedCharacters(store, context);
    const candidateCharacters = collectCandidateCharactersFromL0(context);
    const allCharacters = new Set([...trustedCharacters, ...candidateCharacters]);
    return { trustedCharacters, candidateCharacters, allCharacters };
}

/**
 * 构建实体词典
 *
 * 来源（按可信度）：
 *   1. store.json.characters.main  — 已确认主要角色
 *   2. store.json.arcs[].name      — 弧光对象
 *   3. context.name2               — 当前角色
 *   4. store.json.events[].participants — L2 事件参与者
 *   5. L0 atoms edges.s/edges.t
 *
 * 硬约束：永远排除 normalize(context.name1)
 *
 * @param {object} store  - getSummaryStore() 返回值
 * @param {object} context - { name1: string, name2: string }
 * @returns {Set<string>} 标准化后的实体集合
 */
export function buildEntityLexicon(store, context) {
    return buildCharacterPools(store, context).allCharacters;
}

/**
 * 构建"原词形 → 标准化"映射表
 * 用于从 lexicon 反查原始显示名
 *
 * @param {object} store
 * @param {object} context
 * @returns {Map<string, string>} normalize(name) → 原词形
 */
export function buildDisplayNameMap(store, context) {
    const map = new Map();

    const register = (raw) => {
        const n = normalize(raw);
        if (!n || n.length < 2) return;
        if (isBlacklistedPersonTerm(n)) return;
        if (!map.has(n)) {
            map.set(n, String(raw).trim());
        }
    };

    const main = store?.json?.characters?.main || [];
    for (const m of main) {
        register(typeof m === 'string' ? m : m.name);
    }

    const arcs = store?.json?.arcs || [];
    for (const a of arcs) {
        register(a.name);
    }

    if (context?.name2) register(context.name2);

    // 4. L2 events 参与者
    const events = store?.json?.events || [];
    for (const ev of events) {
        for (const p of (ev?.participants || [])) {
            register(p);
        }
    }

    // 5. L0 atoms 的 edges.s/edges.t
    const atoms = getStateAtoms();
    for (const atom of atoms) {
        for (const e of (atom.edges || [])) {
            register(e?.s);
            register(e?.t);
        }
    }

    // ★ 硬约束：删除 name1
    if (context?.name1) {
        map.delete(normalize(context.name1));
    }

    return map;
}

/**
 * 从文本中提取命中的实体
 *
 * 逻辑：遍历词典，检查文本中是否包含（不区分大小写）
 * 返回命中的实体原词形（去重）
 *
 * @param {string} text - 清洗后的文本
 * @param {Set<string>} lexicon - 标准化后的实体集合
 * @param {Map<string, string>} displayMap - normalize → 原词形
 * @returns {string[]} 命中的实体（原词形）
 */
export function extractEntitiesFromText(text, lexicon, displayMap) {
    if (!text || !lexicon?.size) return [];

    const textNorm = normalize(text);
    const hits = [];
    const seen = new Set();

    for (const entity of lexicon) {
        if (textNorm.includes(entity) && !seen.has(entity)) {
            seen.add(entity);
            // 优先返回原词形
            const display = displayMap?.get(entity) || entity;
            hits.push(display);
        }
    }

    return hits;
}
