// ═══════════════════════════════════════════════════════════════════════════
// query-builder.js - 确定性查询构建器（无 LLM）
//
// 职责：
// 1. 从最近 3 条消息构建 QueryBundle（加权向量段）
// 2. 用第一轮召回结果产出 hints 段用于 R2 增强
//
// 加权向量设计：
// - 每条消息独立 embed，得到独立向量
// - 按位置分配基础权重（焦点 > 近上下文 > 远上下文）
// - 短消息通过 lengthFactor 自动降权（下限 35%）
// - recall.js 负责 embed + 归一化 + 加权平均
//
// 焦点确定：
// - pendingUserMessage 存在 → 它是焦点
// - 否则 → lastMessages 最后一条是焦点
//
// 不负责：向量化、检索、rerank
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from '../../../../../../../extensions.js';
import { buildEntityLexicon, buildDisplayNameMap, extractEntitiesFromText, buildCharacterPools } from './entity-lexicon.js';
import { getSummaryStore } from '../../data/store.js';
import { filterText } from '../utils/text-filter.js';
import { tokenizeForIndex as tokenizerTokenizeForIndex } from '../utils/tokenizer.js';

// ─────────────────────────────────────────────────────────────────────────
// 权重常量
// ─────────────────────────────────────────────────────────────────────────

// R1 基础权重：[...context(oldest→newest), focus]
// 焦点消息占 55%，最近上下文 30%，更早上下文 15%
export const FOCUS_BASE_WEIGHT = 0.55;
export const CONTEXT_BASE_WEIGHTS = [0.15, 0.30];

// R2 基础权重：焦点让权给 hints
export const FOCUS_BASE_WEIGHT_R2 = 0.45;
export const CONTEXT_BASE_WEIGHTS_R2 = [0.10, 0.20];
export const HINTS_BASE_WEIGHT = 0.25;

// 长度惩罚：< 50 字线性衰减，下限 35%
export const LENGTH_FULL_THRESHOLD = 50;
export const LENGTH_MIN_FACTOR = 0.35;
// 归一化后的焦点最小占比（由 recall.js 在归一化后硬保底）
// 语义：即使焦点文本很短，也不能被稀释到过低权重
export const FOCUS_MIN_NORMALIZED_WEIGHT = 0.35;

// ─────────────────────────────────────────────────────────────────────────
// 其他常量
// ─────────────────────────────────────────────────────────────────────────

const MEMORY_HINT_ATOMS_MAX = 5;
const MEMORY_HINT_EVENTS_MAX = 3;
const LEXICAL_TERMS_MAX = 10;

// ─────────────────────────────────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────────────────────────────────

/**
 * 清洗消息文本（与 chunk-builder / recall 保持一致）
 * @param {string} text
 * @returns {string}
 */
function cleanMessageText(text) {
    return filterText(text)
        .replace(/\[tts:[^\]]*\]/gi, '')
        .replace(/<state>[\s\S]*?<\/state>/gi, '')
        .trim();
}

/**
 * 清理事件摘要（移除楼层标记）
 * @param {string} summary
 * @returns {string}
 */
function cleanSummary(summary) {
    return String(summary || '')
        .replace(/\s*\(#\d+(?:-\d+)?\)\s*$/, '')
        .trim();
}

/**
 * 计算长度因子
 *
 * charCount >= 50 → 1.0
 * charCount = 0  → 0.35
 * 中间线性插值
 *
 * @param {number} charCount - 清洗后内容字符数（不含 speaker 前缀）
 * @returns {number} 0.35 ~ 1.0
 */
export function computeLengthFactor(charCount) {
    if (charCount >= LENGTH_FULL_THRESHOLD) return 1.0;
    if (charCount <= 0) return LENGTH_MIN_FACTOR;
    return LENGTH_MIN_FACTOR + (1.0 - LENGTH_MIN_FACTOR) * (charCount / LENGTH_FULL_THRESHOLD);
}

/**
 * 从文本中提取高频实词（用于词法检索）
 *
 * @param {string} text - 清洗后的文本
 * @param {number} maxTerms - 最大词数
 * @returns {string[]}
 */
function extractKeyTerms(text, maxTerms = LEXICAL_TERMS_MAX) {
    if (!text) return [];

    const tokens = tokenizerTokenizeForIndex(text);
    const freq = new Map();
    for (const token of tokens) {
        const key = String(token || '').toLowerCase();
        if (!key) continue;
        freq.set(key, (freq.get(key) || 0) + 1);
    }

    return Array.from(freq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxTerms)
        .map(([term]) => term);
}

// ─────────────────────────────────────────────────────────────────────────
// 类型定义
// ─────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} QuerySegment
 * @property {string} text        - 待 embed 的文本（含 speaker 前缀，纯自然语言）
 * @property {number} baseWeight  - R1 基础权重
 * @property {number} charCount   - 内容字符数（不含 speaker 前缀，用于 lengthFactor）
 */

/**
 * @typedef {object} QueryBundle
 * @property {QuerySegment[]}    querySegments  - R1 向量段（上下文 oldest→newest，焦点在末尾）
 * @property {QuerySegment|null} hintsSegment   - R2 hints 段（refinement 后填充）
 * @property {string}   rerankQuery     - rerank 用的纯自然语言查询（焦点在前）
 * @property {string[]} lexicalTerms    - MiniSearch 查询词
 * @property {string[]} focusTerms      - 焦点词（原 focusEntities）
 * @property {string[]} focusCharacters - 焦点人物（focusTerms ∩ trustedCharacters）
 * @property {string[]} focusEntities   - Deprecated alias of focusTerms
 * @property {Set<string>} allEntities         - Full entity lexicon (includes non-character entities)
 * @property {Set<string>} allCharacters       - Union of trusted and candidate character pools
 * @property {Set<string>} trustedCharacters   - Clean character pool (main/arcs/name2/L2 participants)
 * @property {Set<string>} candidateCharacters - Extended character pool from L0 edges.s/t after cleanup
 * @property {Set<string>}       _lexicon     - 实体词典（内部使用）
 * @property {Map<string, string>} _displayMap - 标准化→原词形映射（内部使用）
 */

// ─────────────────────────────────────────────────────────────────────────
// 内部：消息条目构建
// ─────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} MessageEntry
 * @property {string} text      - speaker：内容（完整文本）
 * @property {number} charCount - 内容字符数（不含 speaker 前缀）
 */

/**
 * 清洗消息并构建条目
 * @param {object} message - chat 消息对象
 * @param {object} context - { name1, name2 }
 * @returns {MessageEntry|null}
 */
function buildMessageEntry(message, context) {
    if (!message?.mes) return null;

    const speaker = message.is_user
        ? (context.name1 || '用户')
        : (message.name || context.name2 || '角色');

    const clean = cleanMessageText(message.mes);
    if (!clean) return null;

    return {
        text: `${speaker}：${clean}`,
        charCount: clean.length,
    };
}

// ─────────────────────────────────────────────────────────────────────────
// 阶段 1：构建 QueryBundle
// ─────────────────────────────────────────────────────────────────────────

/**
 * 构建初始查询包
 *
 * 消息布局（K=3 时）：
 *   msg[0] = USER(#N-2)  上下文    baseWeight = 0.15
 *   msg[1] = AI(#N-1)    上下文    baseWeight = 0.30
 *   msg[2] = USER(#N)    焦点      baseWeight = 0.55
 *
 * 焦点确定：
 *   pendingUserMessage 存在 → 焦点，所有 lastMessages 为上下文
 *   pendingUserMessage 不存在 → lastMessages[-1] 为焦点，其余为上下文
 *
 * @param {object[]} lastMessages - 最近 K 条消息（由 recall.js 传入）
 * @param {string|null} pendingUserMessage - 用户刚输入但未进 chat 的消息
 * @param {object|null} store
 * @param {object|null} context - { name1, name2 }
 * @returns {QueryBundle}
 */
export function buildQueryBundle(lastMessages, pendingUserMessage, store = null, context = null) {
    if (!store) store = getSummaryStore();
    if (!context) {
        const ctx = getContext();
        context = { name1: ctx.name1, name2: ctx.name2 };
    }

    // 1. 实体/人物词典
    const lexicon = buildEntityLexicon(store, context);
    const displayMap = buildDisplayNameMap(store, context);
    const { trustedCharacters, candidateCharacters, allCharacters } = buildCharacterPools(store, context);

    // 2. 分离焦点与上下文
    const contextEntries = [];
    let focusEntry = null;
    const allCleanTexts = [];

    if (pendingUserMessage) {
        // pending 是焦点，所有 lastMessages 是上下文
        const pendingClean = cleanMessageText(pendingUserMessage);
        if (pendingClean) {
            const speaker = context.name1 || '用户';
            focusEntry = {
                text: `${speaker}：${pendingClean}`,
                charCount: pendingClean.length,
            };
            allCleanTexts.push(pendingClean);
        }

        for (const m of (lastMessages || [])) {
            const entry = buildMessageEntry(m, context);
            if (entry) {
                contextEntries.push(entry);
                allCleanTexts.push(cleanMessageText(m.mes));
            }
        }
    } else {
        // 无 pending → lastMessages[-1] 是焦点
        const msgs = lastMessages || [];

        if (msgs.length > 0) {
            const lastMsg = msgs[msgs.length - 1];
            const entry = buildMessageEntry(lastMsg, context);
            if (entry) {
                focusEntry = entry;
                allCleanTexts.push(cleanMessageText(lastMsg.mes));
            }
        }

        for (let i = 0; i < msgs.length - 1; i++) {
            const entry = buildMessageEntry(msgs[i], context);
            if (entry) {
                contextEntries.push(entry);
                allCleanTexts.push(cleanMessageText(msgs[i].mes));
            }
        }
    }

    // 3. 提取焦点词与焦点人物
    const combinedText = allCleanTexts.join(' ');
    const focusTerms = extractEntitiesFromText(combinedText, lexicon, displayMap);
    const focusCharacters = focusTerms.filter(term => trustedCharacters.has(term.toLowerCase()));

    // 4. 构建 querySegments
    //    上下文在前（oldest → newest），焦点在末尾
    //    上下文权重从 CONTEXT_BASE_WEIGHTS 尾部对齐分配
    const querySegments = [];

    for (let i = 0; i < contextEntries.length; i++) {
        const weightIdx = Math.max(0, CONTEXT_BASE_WEIGHTS.length - contextEntries.length + i);
        querySegments.push({
            text: contextEntries[i].text,
            baseWeight: CONTEXT_BASE_WEIGHTS[weightIdx] || CONTEXT_BASE_WEIGHTS[0],
            charCount: contextEntries[i].charCount,
        });
    }

    if (focusEntry) {
        querySegments.push({
            text: focusEntry.text,
            baseWeight: FOCUS_BASE_WEIGHT,
            charCount: focusEntry.charCount,
        });
    }

    // 5. rerankQuery（焦点在前，纯自然语言，无前缀）
    const contextLines = contextEntries.map(e => e.text);
    const rerankQuery = focusEntry
        ? [focusEntry.text, ...contextLines].join('\n')
        : contextLines.join('\n');

    // 6. lexicalTerms（实体优先 + 高频实词补充）
    const entityTerms = focusTerms.map(e => e.toLowerCase());
    const textTerms = extractKeyTerms(combinedText);
    const termSet = new Set(entityTerms);
    for (const t of textTerms) {
        if (termSet.size >= LEXICAL_TERMS_MAX) break;
        termSet.add(t);
    }

    return {
        querySegments,
        hintsSegment: null,
        rerankQuery,
        lexicalTerms: Array.from(termSet),
        focusTerms,
        focusCharacters,
        focusEntities: focusTerms, // deprecated alias (compat)
        allEntities: lexicon,
        allCharacters,
        trustedCharacters,
        candidateCharacters,
        _lexicon: lexicon,
        _displayMap: displayMap,
    };
}

// ─────────────────────────────────────────────────────────────────────────
// 阶段 3：Query Refinement（用第一轮召回结果产出 hints 段）
// ─────────────────────────────────────────────────────────────────────────

/**
 * 用第一轮召回结果增强 QueryBundle
 *
 * 原地修改 bundle（仅 query/rerank 辅助项）：
 * - hintsSegment：填充 hints 段（供 R2 加权使用）
 * - lexicalTerms：可能追加 hints 中的关键词
 * - rerankQuery：不变（保持焦点优先的纯自然语言）
 *
 * @param {QueryBundle} bundle - 原始查询包
 * @param {object[]} anchorHits - 第一轮 L0 命中（按相似度降序）
 * @param {object[]} eventHits - 第一轮 L2 命中（按相似度降序）
 */
export function refineQueryBundle(bundle, anchorHits, eventHits) {
    const hints = [];

    // 1. 从 top anchorHits 提取 memory hints
    const topAnchors = (anchorHits || []).slice(0, MEMORY_HINT_ATOMS_MAX);
    for (const hit of topAnchors) {
        const semantic = hit.atom?.semantic || '';
        if (semantic) hints.push(semantic);
    }

    // 2. 从 top eventHits 提取 memory hints
    const topEvents = (eventHits || []).slice(0, MEMORY_HINT_EVENTS_MAX);
    for (const hit of topEvents) {
        const ev = hit.event || {};
        const title = String(ev.title || '').trim();
        const summary = cleanSummary(ev.summary);
        const line = title && summary
            ? `${title}: ${summary}`
            : title || summary;
        if (line) hints.push(line);
    }

    // 3. 构建 hintsSegment
    if (hints.length > 0) {
        const hintsText = hints.join('\n');
        bundle.hintsSegment = {
            text: hintsText,
            baseWeight: HINTS_BASE_WEIGHT,
            charCount: hintsText.length,
        };
    } else {
        bundle.hintsSegment = null;
    }

    // 4. rerankQuery 不变
    //    cross-encoder 接收纯自然语言 query，不受 hints 干扰

    // 5. 增强 lexicalTerms
    if (hints.length > 0) {
        const hintTerms = extractKeyTerms(hints.join(' '), 5);
        const termSet = new Set(bundle.lexicalTerms);
        for (const t of hintTerms) {
            if (termSet.size >= LEXICAL_TERMS_MAX) break;
            if (!termSet.has(t)) {
                termSet.add(t);
                bundle.lexicalTerms.push(t);
            }
        }
    }
}
