// Story Summary - Recall Engine
// L1 chunk + L2 event 召回
// - 全量向量打分
// - 指数衰减加权 Query Embedding
// - L0 floor 加权
// - RRF 混合检索（向量 + 文本）
// - MMR 去重（融合后执行）
// - floor 稀疏去重

import { getAllEventVectors, getAllChunkVectors, getChunksByFloors, getMeta } from './chunk-store.js';
import { embed, getEngineFingerprint } from './embedder.js';
import { xbLog } from '../../../core/debug-core.js';
import { getContext } from '../../../../../../extensions.js';
import { getSummaryStore } from '../data/store.js';
import { filterText } from './text-filter.js';
import {
    searchStateAtoms,
    buildL0FloorBonus,
    stateToVirtualChunks,
    mergeAndSparsify,
} from './state-recall.js';
import { ensureEventTextIndex, searchEventsByText } from './text-search.js';

const MODULE_ID = 'recall';

const CONFIG = {
    QUERY_MSG_COUNT: 5,
    QUERY_DECAY_BETA: 0.7,
    QUERY_MAX_CHARS: 600,
    QUERY_CONTEXT_CHARS: 240,

    CAUSAL_CHAIN_MAX_DEPTH: 10,
    CAUSAL_INJECT_MAX: 30,

    CANDIDATE_CHUNKS: 200,
    CANDIDATE_EVENTS: 150,

    MAX_CHUNKS: 40,
    MAX_EVENTS: 120,

    MIN_SIMILARITY_CHUNK: 0.6,
    MIN_SIMILARITY_CHUNK_RECENT: 0.5,
    MIN_SIMILARITY_EVENT: 0.65,
    MMR_LAMBDA: 0.72,

    L0_FLOOR_BONUS_FACTOR: 0.10,
    FLOOR_MAX_CHUNKS: 2,
    FLOOR_LIMIT: 1,

    RRF_K: 60,
    TEXT_SEARCH_LIMIT: 80,
};

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

function cosineSimilarity(a, b) {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;
    let dot = 0, nA = 0, nB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        nA += a[i] * a[i];
        nB += b[i] * b[i];
    }
    return nA && nB ? dot / (Math.sqrt(nA) * Math.sqrt(nB)) : 0;
}

function normalizeVec(v) {
    let s = 0;
    for (let i = 0; i < v.length; i++) s += v[i] * v[i];
    s = Math.sqrt(s) || 1;
    return v.map(x => x / s);
}

// ═══════════════════════════════════════════════════════════════════════════
// RRF 融合
// ═══════════════════════════════════════════════════════════════════════════

function fuseEventsByRRF(vectorRanked, textRanked, eventById, k = CONFIG.RRF_K) {
    const map = new Map();

    const upsert = (id) => {
        if (!map.has(id)) {
            map.set(id, { id, rrf: 0, vRank: Infinity, tRank: Infinity, type: 'TEXT' });
        }
        return map.get(id);
    };

    vectorRanked.forEach((r, i) => {
        const id = r.event?.id;
        if (!id) return;
        const o = upsert(id);
        o.vRank = i + 1;
        o.rrf += 1 / (k + i + 1);
        o.type = o.tRank !== Infinity ? 'HYBRID' : 'VECTOR';
        o.vector = r.vector;
    });

    textRanked.forEach((r) => {
        const o = upsert(r.id);
        o.tRank = r.textRank;
        o.rrf += 1 / (k + r.textRank);
        o.type = o.vRank !== Infinity ? 'HYBRID' : 'TEXT';
    });

    const typePriority = { HYBRID: 0, VECTOR: 1, TEXT: 2 };

    return Array.from(map.values())
        .map(o => ({ ...o, event: eventById.get(o.id) }))
        .filter(x => x.event)
        .sort((a, b) => {
            if (b.rrf !== a.rrf) return b.rrf - a.rrf;
            if (typePriority[a.type] !== typePriority[b.type]) {
                return typePriority[a.type] - typePriority[b.type];
            }
            if (a.vRank !== b.vRank) return a.vRank - b.vRank;
            return a.tRank - b.tRank;
        });
}

// ═══════════════════════════════════════════════════════════════════════════
// 因果链追溯
// ═══════════════════════════════════════════════════════════════════════════

function buildEventIndex(allEvents) {
    const map = new Map();
    for (const e of allEvents || []) {
        if (e?.id) map.set(e.id, e);
    }
    return map;
}

function traceCausalAncestors(recalledEvents, eventIndex, maxDepth = CONFIG.CAUSAL_CHAIN_MAX_DEPTH) {
    const out = new Map();
    const idRe = /^evt-\d+$/;

    function visit(parentId, depth, chainFrom) {
        if (depth > maxDepth) return;
        if (!idRe.test(parentId)) return;

        const ev = eventIndex.get(parentId);
        if (!ev) return;

        const existed = out.get(parentId);
        if (!existed) {
            out.set(parentId, { event: ev, depth, chainFrom: [chainFrom] });
        } else {
            if (depth < existed.depth) existed.depth = depth;
            if (!existed.chainFrom.includes(chainFrom)) existed.chainFrom.push(chainFrom);
        }

        for (const next of (ev.causedBy || [])) {
            visit(String(next || '').trim(), depth + 1, chainFrom);
        }
    }

    for (const r of recalledEvents || []) {
        const rid = r?.event?.id;
        if (!rid) continue;
        for (const cid of (r.event?.causedBy || [])) {
            visit(String(cid || '').trim(), 1, rid);
        }
    }

    return out;
}

function sortCausalEvents(causalArray) {
    return causalArray.sort((a, b) => {
        const refDiff = b.chainFrom.length - a.chainFrom.length;
        if (refDiff !== 0) return refDiff;
        const depthDiff = a.depth - b.depth;
        if (depthDiff !== 0) return depthDiff;
        return String(a.event.id).localeCompare(String(b.event.id));
    });
}

function normalize(s) {
    return String(s || '').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

function parseFloorRange(summary) {
    if (!summary) return null;
    const match = String(summary).match(/\(#(\d+)(?:-(\d+))?\)/);
    if (!match) return null;
    const start = Math.max(0, parseInt(match[1], 10) - 1);
    const end = Math.max(0, (match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10)) - 1);
    return { start, end };
}

function cleanForRecall(text) {
    return filterText(text).replace(/\[tts:[^\]]*\]/gi, '').trim();
}

function buildExpDecayWeights(n, beta) {
    const last = n - 1;
    const w = Array.from({ length: n }, (_, i) => Math.exp(beta * (i - last)));
    const sum = w.reduce((a, b) => a + b, 0) || 1;
    return w.map(x => x / sum);
}

// ═══════════════════════════════════════════════════════════════════════════
// Query 构建
// ═══════════════════════════════════════════════════════════════════════════

function buildQuerySegments(chat, count, excludeLastAi, pendingUserMessage = null) {
    if (!chat?.length) return [];

    const { name1 } = getContext();

    let messages = chat;
    if (excludeLastAi && messages.length > 0 && !messages[messages.length - 1]?.is_user) {
        messages = messages.slice(0, -1);
    }

    if (pendingUserMessage) {
        const lastMsg = messages[messages.length - 1];
        const lastMsgText = lastMsg?.mes?.trim() || "";
        const pendingText = pendingUserMessage.trim();

        if (lastMsgText !== pendingText) {
            messages = [...messages, { is_user: true, name: name1 || "用户", mes: pendingUserMessage }];
        }
    }

    return messages.slice(-count).map((m, idx, arr) => {
        const speaker = m.name || (m.is_user ? (name1 || "用户") : "角色");
        const clean = cleanForRecall(m.mes);
        if (!clean) return '';
        const limit = idx === arr.length - 1 ? CONFIG.QUERY_MAX_CHARS : CONFIG.QUERY_CONTEXT_CHARS;
        return `${speaker}: ${clean.slice(0, limit)}`;
    }).filter(Boolean);
}

async function embedWeightedQuery(segments, vectorConfig) {
    if (!segments?.length) return null;

    const weights = buildExpDecayWeights(segments.length, CONFIG.QUERY_DECAY_BETA);
    const vecs = await embed(segments, vectorConfig);
    const dims = vecs?.[0]?.length || 0;
    if (!dims) return null;

    const out = new Array(dims).fill(0);
    for (let i = 0; i < vecs.length; i++) {
        for (let j = 0; j < dims; j++) out[j] += (vecs[i][j] || 0) * weights[i];
    }

    return { vector: normalizeVec(out), weights };
}

// ═══════════════════════════════════════════════════════════════════════════
// 实体抽取
// ═══════════════════════════════════════════════════════════════════════════

function buildEntityLexicon(store, allEvents) {
    const { name1 } = getContext();
    const userName = normalize(name1);
    const set = new Set();

    for (const e of allEvents || []) {
        for (const p of e.participants || []) {
            const s = normalize(p);
            if (s) set.add(s);
        }
    }

    const json = store?.json || {};

    for (const m of json.characters?.main || []) {
        const s = normalize(typeof m === 'string' ? m : m?.name);
        if (s) set.add(s);
    }

    for (const a of json.arcs || []) {
        const s = normalize(a?.name);
        if (s) set.add(s);
    }

    for (const w of json.world || []) {
        const t = normalize(w?.topic);
        if (t && !t.includes('::')) set.add(t);
    }

    for (const r of json.characters?.relationships || []) {
        const from = normalize(r?.from);
        const to = normalize(r?.to);
        if (from) set.add(from);
        if (to) set.add(to);
    }

    const stop = new Set([userName, '我', '你', '他', '她', '它', '用户', '角色', 'assistant'].map(normalize).filter(Boolean));

    return Array.from(set)
        .filter(s => s.length >= 2 && !stop.has(s) && !/^[\s\p{P}\p{S}]+$/u.test(s) && !/<[^>]+>/.test(s))
        .slice(0, 5000);
}

function extractEntities(text, lexicon) {
    const t = normalize(text);
    if (!t || !lexicon?.length) return [];

    const sorted = [...lexicon].sort((a, b) => b.length - a.length);
    const hits = [];
    for (const e of sorted) {
        if (t.includes(e)) hits.push(e);
        if (hits.length >= 20) break;
    }
    return hits;
}

// ═══════════════════════════════════════════════════════════════════════════
// MMR
// ═══════════════════════════════════════════════════════════════════════════

function mmrSelect(candidates, k, lambda, getVector, getScore) {
    const selected = [];
    const ids = new Set();

    while (selected.length < k && candidates.length) {
        let best = null, bestScore = -Infinity;

        for (const c of candidates) {
            if (ids.has(c._id)) continue;

            const rel = getScore(c);
            let div = 0;

            if (selected.length) {
                const vC = getVector(c);
                if (vC?.length) {
                    for (const s of selected) {
                        const sim = cosineSimilarity(vC, getVector(s));
                        if (sim > div) div = sim;
                    }
                }
            }

            const score = lambda * rel - (1 - lambda) * div;
            if (score > bestScore) {
                bestScore = score;
                best = c;
            }
        }

        if (!best) break;
        selected.push(best);
        ids.add(best._id);
    }

    return selected;
}

// ═══════════════════════════════════════════════════════════════════════════
// L1 Chunks 检索
// ═══════════════════════════════════════════════════════════════════════════

async function searchChunks(queryVector, vectorConfig, l0FloorBonus = new Map(), lastSummarizedFloor = -1) {
    const { chatId } = getContext();
    if (!chatId || !queryVector?.length) return [];

    const meta = await getMeta(chatId);
    const fp = getEngineFingerprint(vectorConfig);
    if (meta.fingerprint && meta.fingerprint !== fp) return [];

    const chunkVectors = await getAllChunkVectors(chatId);
    if (!chunkVectors.length) return [];

    const scored = chunkVectors.map(cv => {
        const match = String(cv.chunkId).match(/c-(\d+)-(\d+)/);
        const floor = match ? parseInt(match[1], 10) : 0;
        const baseSim = cosineSimilarity(queryVector, cv.vector);
        const l0Bonus = l0FloorBonus.get(floor) || 0;

        return {
            _id: cv.chunkId,
            chunkId: cv.chunkId,
            floor,
            chunkIdx: match ? parseInt(match[2], 10) : 0,
            similarity: baseSim + l0Bonus,
            _baseSimilarity: baseSim,
            _l0Bonus: l0Bonus,
            vector: cv.vector,
        };
    });

    const candidates = scored
        .filter(s => {
            const threshold = s.floor > lastSummarizedFloor
                ? CONFIG.MIN_SIMILARITY_CHUNK_RECENT
                : CONFIG.MIN_SIMILARITY_CHUNK;
            return s.similarity >= threshold;
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, CONFIG.CANDIDATE_CHUNKS);

    const preFilterStats = {
        total: scored.length,
        passThreshold: candidates.length,
        thresholdRemote: CONFIG.MIN_SIMILARITY_CHUNK,
        thresholdRecent: CONFIG.MIN_SIMILARITY_CHUNK_RECENT,
        distribution: {
            '0.8+': scored.filter(s => s.similarity >= 0.8).length,
            '0.7-0.8': scored.filter(s => s.similarity >= 0.7 && s.similarity < 0.8).length,
            '0.6-0.7': scored.filter(s => s.similarity >= 0.6 && s.similarity < 0.7).length,
            '0.55-0.6': scored.filter(s => s.similarity >= 0.55 && s.similarity < 0.6).length,
            '<0.55': scored.filter(s => s.similarity < 0.55).length,
        },
    };

    const dynamicK = Math.min(CONFIG.MAX_CHUNKS, candidates.length);

    const selected = mmrSelect(
        candidates,
        dynamicK,
        CONFIG.MMR_LAMBDA,
        c => c.vector,
        c => c.similarity
    );

    const bestByFloor = new Map();
    for (const s of selected) {
        const prev = bestByFloor.get(s.floor);
        if (!prev || s.similarity > prev.similarity) {
            bestByFloor.set(s.floor, s);
        }
    }

    const sparse = Array.from(bestByFloor.values()).sort((a, b) => b.similarity - a.similarity);

    const floors = [...new Set(sparse.map(c => c.floor))];
    const chunks = await getChunksByFloors(chatId, floors);
    const chunkMap = new Map(chunks.map(c => [c.chunkId, c]));

    const results = sparse.map(item => {
        const chunk = chunkMap.get(item.chunkId);
        if (!chunk) return null;
        return {
            chunkId: item.chunkId,
            floor: item.floor,
            chunkIdx: item.chunkIdx,
            speaker: chunk.speaker,
            isUser: chunk.isUser,
            text: chunk.text,
            similarity: item.similarity,
        };
    }).filter(Boolean);

    if (results.length > 0) {
        results._preFilterStats = preFilterStats;
    }

    return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// L2 Events 检索（RRF 混合 + MMR 后置）
// ═══════════════════════════════════════════════════════════════════════════

async function searchEvents(queryVector, queryTextForSearch, allEvents, vectorConfig, store, queryEntities, l0FloorBonus = new Map()) {
    const { chatId } = getContext();
    if (!chatId || !queryVector?.length) return [];

    const meta = await getMeta(chatId);
    const fp = getEngineFingerprint(vectorConfig);
    if (meta.fingerprint && meta.fingerprint !== fp) return [];

    const eventVectors = await getAllEventVectors(chatId);
    const vectorMap = new Map(eventVectors.map(v => [v.eventId, v.vector]));
    if (!vectorMap.size) return [];

    // 构建/更新文本索引
    const revision = `${chatId}:${store?.updatedAt || 0}:${allEvents.length}`;
    ensureEventTextIndex(allEvents, revision);

    // 文本路检索
    const textRanked = searchEventsByText(queryTextForSearch, CONFIG.TEXT_SEARCH_LIMIT);

    // ═══════════════════════════════════════════════════════════════════════
    // 向量路检索（只保留 L0 加权）
    // ═══════════════════════════════════════════════════════════════════════

    const scored = (allEvents || []).map((event, idx) => {
        const v = vectorMap.get(event.id);
        const sim = v ? cosineSimilarity(queryVector, v) : 0;

        let bonus = 0;

        // L0 加权
        const range = parseFloorRange(event.summary);
        if (range) {
            for (let f = range.start; f <= range.end; f++) {
                if (l0FloorBonus.has(f)) {
                    bonus += l0FloorBonus.get(f);
                    break;
                }
            }
        }

        return {
            _id: event.id,
            _idx: idx,
            event,
            similarity: sim,
            finalScore: sim + bonus,
            vector: v,
        };
    });

    const preFilterDistribution = {
        total: scored.length,
        '0.85+': scored.filter(s => s.finalScore >= 0.85).length,
        '0.7-0.85': scored.filter(s => s.finalScore >= 0.7 && s.finalScore < 0.85).length,
        '0.6-0.7': scored.filter(s => s.finalScore >= 0.6 && s.finalScore < 0.7).length,
        '0.5-0.6': scored.filter(s => s.finalScore >= 0.5 && s.finalScore < 0.6).length,
        '<0.5': scored.filter(s => s.finalScore < 0.5).length,
        passThreshold: scored.filter(s => s.finalScore >= CONFIG.MIN_SIMILARITY_EVENT).length,
        threshold: CONFIG.MIN_SIMILARITY_EVENT,
    };

    // 向量路：纯相似度排序（不在这里做 MMR）
    const candidates = scored
        .filter(s => s.finalScore >= CONFIG.MIN_SIMILARITY_EVENT)
        .sort((a, b) => b.finalScore - a.finalScore)
        .slice(0, CONFIG.CANDIDATE_EVENTS);

    const vectorRanked = candidates.map(s => ({
        event: s.event,
        similarity: s.finalScore,
        vector: s.vector,
    }));

    // RRF 融合
    const eventById = new Map(allEvents.map(e => [e.id, e]));
    const fused = fuseEventsByRRF(vectorRanked, textRanked, eventById);

    // 向量非空时过滤纯 TEXT
    const hasVector = vectorRanked.length > 0;
    const filtered = hasVector ? fused.filter(x => x.type !== 'TEXT') : fused;

    // MMR 放在融合后：对最终候选集去重
    const mmrInput = filtered.slice(0, CONFIG.CANDIDATE_EVENTS).map(x => ({
        ...x,
        _id: x.id,
    }));

    const mmrOutput = mmrSelect(
        mmrInput,
        CONFIG.MAX_EVENTS,
        CONFIG.MMR_LAMBDA,
        c => c.vector || null,
        c => c.rrf
    );

    // 构造结果
    const results = mmrOutput.map(x => ({
        event: x.event,
        similarity: x.rrf,
        _recallType: x.type === 'HYBRID' ? 'DIRECT' : 'SIMILAR',
        _recallReason: x.type,
        _rrfDetail: { vRank: x.vRank, tRank: x.tRank, rrf: x.rrf },
    }));

    // 统计信息附加到第一条结果
    if (results.length > 0) {
        results[0]._preFilterDistribution = preFilterDistribution;
        results[0]._rrfStats = {
            vectorCount: vectorRanked.length,
            textCount: textRanked.length,
            hybridCount: fused.filter(x => x.type === 'HYBRID').length,
            vectorOnlyCount: fused.filter(x => x.type === 'VECTOR').length,
            textOnlyFiltered: fused.filter(x => x.type === 'TEXT').length,
        };
    }

    return results;
}

// ═══════════════════════════════════════════════════════════════════════════
// 日志
// ═══════════════════════════════════════════════════════════════════════════

function formatRecallLog({
    elapsed,
    segments,
    weights,
    chunkResults,
    eventResults,
    allEvents,
    queryEntities,
    causalEvents = [],
    chunkPreFilterStats = null,
    l0Results = [],
}) {
    const lines = [
        '\u2554' + '\u2550'.repeat(62) + '\u2557',
        '\u2551                    记忆召回报告                              \u2551',
        '\u2560' + '\u2550'.repeat(62) + '\u2563',
        `\u2551  耗时: ${elapsed}ms`,
        '\u255a' + '\u2550'.repeat(62) + '\u255d',
        '',
        '\u250c' + '\u2500'.repeat(61) + '\u2510',
        '\u2502 【查询构建】最近 5 条消息，指数衰减加权 (β=0.7)              \u2502',
        '\u2514' + '\u2500'.repeat(61) + '\u2518',
    ];

    const segmentsSorted = segments.map((s, i) => ({
        idx: i + 1,
        weight: weights?.[i] ?? 0,
        text: s,
    })).sort((a, b) => b.weight - a.weight);

    segmentsSorted.forEach((s, rank) => {
        const bar = '\u2588'.repeat(Math.round(s.weight * 20));
        const preview = s.text.length > 60 ? s.text.slice(0, 60) + '...' : s.text;
        const marker = rank === 0 ? ' ◀ 主导' : '';
        lines.push(`  ${(s.weight * 100).toFixed(1).padStart(5)}% ${bar.padEnd(12)} ${preview}${marker}`);
    });

    lines.push('');
    lines.push('\u250c' + '\u2500'.repeat(61) + '\u2510');
    lines.push('\u2502 【提取实体】                                                 \u2502');
    lines.push('\u2514' + '\u2500'.repeat(61) + '\u2518');
    lines.push(`  ${queryEntities?.length ? queryEntities.join('、') : '(无)'}`);

    lines.push('');
    lines.push('\u250c' + '\u2500'.repeat(61) + '\u2510');
    lines.push('\u2502 【召回统计】                                                 \u2502');
    lines.push('\u2514' + '\u2500'.repeat(61) + '\u2518');

    // L0
    const l0Floors = [...new Set(l0Results.map(r => r.floor))].sort((a, b) => a - b);
    lines.push('  L0 语义锚点:');
    if (l0Results.length) {
        lines.push(`    选入: ${l0Results.length} 条 | 影响楼层: ${l0Floors.join(', ')} (+${CONFIG.L0_FLOOR_BONUS_FACTOR} 加权)`);
    } else {
        lines.push('    (无数据)');
    }

    // L1
    lines.push('');
    lines.push('  L1 原文片段:');
    if (chunkPreFilterStats) {
        const dist = chunkPreFilterStats.distribution || {};
        lines.push(`    \u5168\u91cf: ${chunkPreFilterStats.total} \u6761 | \u901a\u8fc7\u9608\u503c(\u8fdc\u671f\u2265${chunkPreFilterStats.thresholdRemote}, \u5f85\u6574\u7406\u2265${chunkPreFilterStats.thresholdRecent}): ${chunkPreFilterStats.passThreshold} \u6761 | \u6700\u7ec8: ${chunkResults.length} \u6761`);
        lines.push(`    匹配度: 0.8+: ${dist['0.8+'] || 0} | 0.7-0.8: ${dist['0.7-0.8'] || 0} | 0.6-0.7: ${dist['0.6-0.7'] || 0}`);
    } else {
        lines.push(`    选入: ${chunkResults.length} 条`);
    }

    // L2
    const rrfStats = eventResults[0]?._rrfStats || {};

    lines.push('');
    lines.push('  L2 事件记忆 (RRF 混合检索):');
    lines.push(`    总事件: ${allEvents.length} 条 | 最终: ${eventResults.length} 条`);
    lines.push(`    向量路: ${rrfStats.vectorCount || 0} 条 | 文本路: ${rrfStats.textCount || 0} 条`);
    lines.push(`    HYBRID: ${rrfStats.hybridCount || 0} 条 | 纯 VECTOR: ${rrfStats.vectorOnlyCount || 0} 条 | 纯 TEXT (已过滤): ${rrfStats.textOnlyFiltered || 0} 条`);

    // Causal
    if (causalEvents.length) {
        const maxRefs = Math.max(...causalEvents.map(c => c.chainFrom?.length || 0));
        const maxDepth = Math.max(...causalEvents.map(c => c.depth || 0));
        lines.push('');
        lines.push('  因果链追溯:');
        lines.push(`    追溯: ${causalEvents.length} 条 | 最大被引: ${maxRefs} 次 | 最大深度: ${maxDepth}`);
    }

    lines.push('');
    return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// 主入口
// ═══════════════════════════════════════════════════════════════════════════

export async function recallMemory(queryText, allEvents, vectorConfig, options = {}) {
    const T0 = performance.now();
    const { chat } = getContext();
    const store = getSummaryStore();
    const lastSummarizedFloor = store?.lastSummarizedMesId ?? -1;
    const { pendingUserMessage = null } = options;

    if (!allEvents?.length) {
        return { events: [], chunks: [], elapsed: 0, logText: 'No events.' };
    }

    const segments = buildQuerySegments(chat, CONFIG.QUERY_MSG_COUNT, !!options.excludeLastAi, pendingUserMessage);

    let queryVector, weights;
    try {
        const result = await embedWeightedQuery(segments, vectorConfig);
        queryVector = result?.vector;
        weights = result?.weights;
    } catch (e) {
        xbLog.error(MODULE_ID, '查询向量生成失败', e);
        return { events: [], chunks: [], elapsed: Math.round(performance.now() - T0), logText: 'Query embedding failed.' };
    }

    if (!queryVector?.length) {
        return { events: [], chunks: [], elapsed: Math.round(performance.now() - T0), logText: 'Empty query vector.' };
    }

    const lexicon = buildEntityLexicon(store, allEvents);
    const queryEntities = extractEntities(segments.join('\n'), lexicon);

    // 构建文本查询串：最后一条消息 + 实体 + 关键词
    const lastSeg = segments[segments.length - 1] || '';
    const queryTextForSearch = [
        lastSeg,
        ...queryEntities,
        ...(store?.json?.keywords || []).slice(0, 5).map(k => k.text),
    ].join(' ');

    // L0 召回
    let l0Results = [];
    let l0FloorBonus = new Map();
    let l0VirtualChunks = [];

    try {
        l0Results = await searchStateAtoms(queryVector, vectorConfig);
        l0FloorBonus = buildL0FloorBonus(l0Results, CONFIG.L0_FLOOR_BONUS_FACTOR);
        l0VirtualChunks = stateToVirtualChunks(l0Results);
    } catch (e) {
        xbLog.warn(MODULE_ID, 'L0 召回失败，降级处理', e);
    }

    const [chunkResults, eventResults] = await Promise.all([
        searchChunks(queryVector, vectorConfig, l0FloorBonus, lastSummarizedFloor),
        searchEvents(queryVector, queryTextForSearch, allEvents, vectorConfig, store, queryEntities, l0FloorBonus),
    ]);

    const chunkPreFilterStats = chunkResults._preFilterStats || null;

    const mergedChunks = mergeAndSparsify(l0VirtualChunks, chunkResults, CONFIG.FLOOR_MAX_CHUNKS);

    // 因果链追溯
    const eventIndex = buildEventIndex(allEvents);
    const causalMap = traceCausalAncestors(eventResults, eventIndex);

    const recalledIdSet = new Set(eventResults.map(x => x?.event?.id).filter(Boolean));
    const causalEvents = Array.from(causalMap.values())
        .filter(x => x?.event?.id && !recalledIdSet.has(x.event.id))
        .map(x => ({
            event: x.event,
            similarity: 0,
            _recallType: 'CAUSAL',
            _recallReason: `因果链(${x.chainFrom.join(',')})`,
            _causalDepth: x.depth,
            _chainFrom: x.chainFrom,
            chainFrom: x.chainFrom,
            depth: x.depth,
        }));

    sortCausalEvents(causalEvents);
    const causalEventsTruncated = causalEvents.slice(0, CONFIG.CAUSAL_INJECT_MAX);

    const elapsed = Math.round(performance.now() - T0);
    const logText = formatRecallLog({
        elapsed,
        queryText,
        segments,
        weights,
        chunkResults: mergedChunks,
        eventResults,
        allEvents,
        queryEntities,
        causalEvents: causalEventsTruncated,
        chunkPreFilterStats,
        l0Results,
    });

    console.group('%c[Recall]', 'color: #7c3aed; font-weight: bold');
    console.log(`Elapsed: ${elapsed}ms | L0: ${l0Results.length} | Entities: ${queryEntities.join(', ') || '(none)'}`);
    console.log(`L1: ${mergedChunks.length} | L2: ${eventResults.length}/${allEvents.length} | Causal: ${causalEventsTruncated.length}`);
    console.groupEnd();

    return { events: eventResults, causalEvents: causalEventsTruncated, chunks: mergedChunks, elapsed, logText, queryEntities, l0Results };
}

export function buildQueryText(chat, count = 2, excludeLastAi = false) {
    if (!chat?.length) return '';

    let messages = chat;
    if (excludeLastAi && messages.length > 0 && !messages[messages.length - 1]?.is_user) {
        messages = messages.slice(0, -1);
    }

    return messages.slice(-count).map(m => {
        const text = cleanForRecall(m.mes);
        const speaker = m.name || (m.is_user ? '用户' : '角色');
        return `${speaker}: ${text.slice(0, 500)}`;
    }).filter(Boolean).join('\n');
}
