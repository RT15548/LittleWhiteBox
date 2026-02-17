// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Recall Engine (v9 - Dense-Gated Lexical + Entity Bypass Tuning)
//
// 命名规范：
// - 存储层用 L0/L1/L2/L3（StateAtom/Chunk/Event/Fact）
// - 召回层用语义名称：anchor/evidence/event/constraint
//
// v8 → v9 变更：
// - recallEvents() 返回 { events, vectorMap }，暴露 event 向量映射
// - Lexical Event 合并前验 dense similarity ≥ 0.50（CONFIG.LEXICAL_EVENT_DENSE_MIN）
// - Lexical Floor 进入融合前验 dense similarity ≥ 0.50（CONFIG.LEXICAL_FLOOR_DENSE_MIN）
// - Entity Bypass 阈值 0.85 → 0.80（CONFIG.EVENT_ENTITY_BYPASS_SIM）
// - metrics 新增 lexical.eventFilteredByDense / lexical.floorFilteredByDense
//
// 架构：
// 阶段 1: Query Build（确定性，无 LLM）
// 阶段 2: Round 1 Dense Retrieval（batch embed 3 段 → 加权平均）
// 阶段 3: Query Refinement（用已命中记忆产出 hints 段）
// 阶段 4: Round 2 Dense Retrieval（复用 R1 vec + embed hints → 加权平均）
// 阶段 5: Lexical Retrieval + Dense-Gated Event Merge
// 阶段 6: Floor W-RRF Fusion + Rerank + L1 配对
// 阶段 7: L1 配对组装（L0 → top-1 AI L1 + top-1 USER L1）
// 阶段 7.5: PPR Diffusion
// 阶段 8: L0 → L2 反向查找（后置，基于最终 l0Selected）
// 阶段 9: Causation Trace
// ═══════════════════════════════════════════════════════════════════════════

import { getAllEventVectors, getChunksByFloors, getMeta, getChunkVectorsByIds } from '../storage/chunk-store.js';
import { getAllStateVectors, getStateAtoms } from '../storage/state-store.js';
import { getEngineFingerprint, embed } from '../utils/embedder.js';
import { xbLog } from '../../../../core/debug-core.js';
import { getContext } from '../../../../../../../extensions.js';
import {
    buildQueryBundle,
    refineQueryBundle,
    computeLengthFactor,
    FOCUS_BASE_WEIGHT_R2,
    CONTEXT_BASE_WEIGHTS_R2,
    FOCUS_MIN_NORMALIZED_WEIGHT,
} from './query-builder.js';
import { getLexicalIndex, searchLexicalIndex } from './lexical-index.js';
import { rerankChunks } from '../llm/reranker.js';
import { createMetrics, calcSimilarityStats } from './metrics.js';
import { diffuseFromSeeds } from './diffusion.js';

const MODULE_ID = 'recall';

// ═══════════════════════════════════════════════════════════════════════════
// 配置
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
    // 窗口：取 3 条消息（对齐 L0 对结构），pending 存在时取 2 条上下文
    LAST_MESSAGES_K: 3,
    LAST_MESSAGES_K_WITH_PENDING: 2,

    // Anchor (L0 StateAtoms)
    ANCHOR_MIN_SIMILARITY: 0.58,

    // Event (L2 Events)
    EVENT_CANDIDATE_MAX: 100,
    EVENT_SELECT_MAX: 50,
    EVENT_MIN_SIMILARITY: 0.60,
    EVENT_MMR_LAMBDA: 0.72,
    EVENT_ENTITY_BYPASS_SIM: 0.70,

    // Lexical Dense 门槛
    LEXICAL_EVENT_DENSE_MIN: 0.60,
    LEXICAL_FLOOR_DENSE_MIN: 0.50,

    // W-RRF 融合（L0-only）
    RRF_K: 60,
    RRF_W_DENSE: 1.0,
    RRF_W_LEX: 0.9,
    FUSION_CAP: 60,

    // Lexical floor 聚合密度加成
    LEX_DENSITY_BONUS: 0.3,

    // Rerank（floor-level）
    RERANK_TOP_N: 20,
    RERANK_MIN_SCORE: 0.10,

    // 因果链
    CAUSAL_CHAIN_MAX_DEPTH: 10,
    CAUSAL_INJECT_MAX: 30,
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

/**
 * 从事件 summary 末尾解析楼层范围 (#X) 或 (#X-Y)
 * @param {string} summary
 * @returns {{start: number, end: number}|null}
 */
function parseFloorRange(summary) {
    if (!summary) return null;
    const match = String(summary).match(/\(#(\d+)(?:-(\d+))?\)/);
    if (!match) return null;
    const start = Math.max(0, parseInt(match[1], 10) - 1);
    const end = Math.max(0, (match[2] ? parseInt(match[2], 10) : parseInt(match[1], 10)) - 1);
    return { start, end };
}

function normalize(s) {
    return String(s || '')
        .normalize('NFKC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim()
        .toLowerCase();
}

function getLastMessages(chat, count = 3, excludeLastAi = false) {
    if (!chat?.length) return [];
    let messages = [...chat];
    if (excludeLastAi && messages.length > 0 && !messages[messages.length - 1]?.is_user) {
        messages = messages.slice(0, -1);
    }
    return messages.slice(-count);
}

// ═══════════════════════════════════════════════════════════════════════════
// 加权向量工具
// ═══════════════════════════════════════════════════════════════════════════

function weightedAverageVectors(vectors, weights) {
    if (!vectors?.length || !weights?.length || vectors.length !== weights.length) return null;

    const dims = vectors[0].length;
    const result = new Array(dims).fill(0);

    for (let i = 0; i < vectors.length; i++) {
        const w = weights[i];
        const v = vectors[i];
        if (!v?.length) continue;
        for (let d = 0; d < dims; d++) {
            result[d] += w * v[d];
        }
    }

    return result;
}

function clampMinNormalizedWeight(weights, targetIdx, minWeight) {
    if (!weights?.length) return [];
    if (targetIdx < 0 || targetIdx >= weights.length) return weights;

    const current = weights[targetIdx];
    if (current >= minWeight) return weights;

    const otherSum = 1 - current;
    if (otherSum <= 0) {
        const out = new Array(weights.length).fill(0);
        out[targetIdx] = 1;
        return out;
    }

    const remain = 1 - minWeight;
    const scale = remain / otherSum;

    const out = weights.map((w, i) => (i === targetIdx ? minWeight : w * scale));
    const drift = 1 - out.reduce((a, b) => a + b, 0);
    out[targetIdx] += drift;
    return out;
}

function computeSegmentWeights(segments) {
    if (!segments?.length) return [];

    const adjusted = segments.map(s => s.baseWeight * computeLengthFactor(s.charCount));
    const sum = adjusted.reduce((a, b) => a + b, 0);
    const normalized = sum <= 0
        ? segments.map(() => 1 / segments.length)
        : adjusted.map(w => w / sum);

    const focusIdx = segments.length - 1;
    return clampMinNormalizedWeight(normalized, focusIdx, FOCUS_MIN_NORMALIZED_WEIGHT);
}

function computeR2Weights(segments, hintsSegment) {
    if (!segments?.length) return [];

    const contextCount = segments.length - 1;
    const r2Base = [];
    for (let i = 0; i < contextCount; i++) {
        const weightIdx = Math.max(0, CONTEXT_BASE_WEIGHTS_R2.length - contextCount + i);
        r2Base.push(CONTEXT_BASE_WEIGHTS_R2[weightIdx] || CONTEXT_BASE_WEIGHTS_R2[0]);
    }
    r2Base.push(FOCUS_BASE_WEIGHT_R2);

    const adjusted = r2Base.map((w, i) => w * computeLengthFactor(segments[i].charCount));

    if (hintsSegment) {
        adjusted.push(hintsSegment.baseWeight * computeLengthFactor(hintsSegment.charCount));
    }

    const sum = adjusted.reduce((a, b) => a + b, 0);
    const normalized = sum <= 0
        ? adjusted.map(() => 1 / adjusted.length)
        : adjusted.map(w => w / sum);

    const focusIdx = segments.length - 1;
    return clampMinNormalizedWeight(normalized, focusIdx, FOCUS_MIN_NORMALIZED_WEIGHT);
}

// ═══════════════════════════════════════════════════════════════════════════
// MMR 选择算法
// ═══════════════════════════════════════════════════════════════════════════

function mmrSelect(candidates, k, lambda, getVector, getScore) {
    const selected = [];
    const ids = new Set();

    while (selected.length < k && candidates.length) {
        let best = null;
        let bestScore = -Infinity;

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
// [Anchors] L0 StateAtoms 检索
// ═══════════════════════════════════════════════════════════════════════════

async function recallAnchors(queryVector, vectorConfig, metrics) {
    const { chatId } = getContext();
    if (!chatId || !queryVector?.length) {
        return { hits: [], floors: new Set(), stateVectors: [] };
    }

    const meta = await getMeta(chatId);
    const fp = getEngineFingerprint(vectorConfig);
    if (meta.fingerprint && meta.fingerprint !== fp) {
        xbLog.warn(MODULE_ID, 'Anchor fingerprint 不匹配');
        return { hits: [], floors: new Set(), stateVectors: [] };
    }

    const stateVectors = await getAllStateVectors(chatId);
    if (!stateVectors.length) {
        return { hits: [], floors: new Set(), stateVectors: [] };
    }

    const atomsList = getStateAtoms();
    const atomMap = new Map(atomsList.map(a => [a.atomId, a]));

    const scored = stateVectors
        .map(sv => {
            const atom = atomMap.get(sv.atomId);
            if (!atom) return null;
            return {
                atomId: sv.atomId,
                floor: sv.floor,
                similarity: cosineSimilarity(queryVector, sv.vector),
                atom,
            };
        })
        .filter(Boolean)
        .filter(s => s.similarity >= CONFIG.ANCHOR_MIN_SIMILARITY)
        .sort((a, b) => b.similarity - a.similarity);

    const floors = new Set(scored.map(s => s.floor));

    if (metrics) {
        metrics.anchor.matched = scored.length;
        metrics.anchor.floorsHit = floors.size;
        metrics.anchor.topHits = scored.slice(0, 5).map(s => ({
            floor: s.floor,
            semantic: s.atom?.semantic?.slice(0, 50),
            similarity: Math.round(s.similarity * 1000) / 1000,
        }));
    }

    return { hits: scored, floors, stateVectors };
}

// ═══════════════════════════════════════════════════════════════════════════
// [Events] L2 Events 检索
// 返回 { events, vectorMap }
// ═══════════════════════════════════════════════════════════════════════════

async function recallEvents(queryVector, allEvents, vectorConfig, focusCharacters, metrics) {
    const { chatId } = getContext();
    if (!chatId || !queryVector?.length || !allEvents?.length) {
        return { events: [], vectorMap: new Map() };
    }

    const meta = await getMeta(chatId);
    const fp = getEngineFingerprint(vectorConfig);
    if (meta.fingerprint && meta.fingerprint !== fp) {
        xbLog.warn(MODULE_ID, 'Event fingerprint 不匹配');
        return { events: [], vectorMap: new Map() };
    }

    const eventVectors = await getAllEventVectors(chatId);
    const vectorMap = new Map(eventVectors.map(v => [v.eventId, v.vector]));

    if (!vectorMap.size) {
        return { events: [], vectorMap };
    }

    const focusSet = new Set((focusCharacters || []).map(normalize));

    const scored = allEvents.map(event => {
        const v = vectorMap.get(event.id);
        const baseSim = v ? cosineSimilarity(queryVector, v) : 0;

        const participants = (event.participants || []).map(p => normalize(p));
        const hasEntityMatch = participants.some(p => focusSet.has(p));

        return {
            _id: event.id,
            event,
            similarity: baseSim,
            _hasEntityMatch: hasEntityMatch,
            vector: v,
        };
    });

    if (metrics) {
        metrics.event.inStore = allEvents.length;
    }

    let candidates = scored
        .filter(s => s.similarity >= CONFIG.EVENT_MIN_SIMILARITY)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, CONFIG.EVENT_CANDIDATE_MAX);

    if (metrics) {
        metrics.event.considered = candidates.length;
    }

    // 实体过滤
    if (focusSet.size > 0) {
        const beforeFilter = candidates.length;

        candidates = candidates.filter(c => {
            if (c.similarity >= CONFIG.EVENT_ENTITY_BYPASS_SIM) return true;
            return c._hasEntityMatch;
        });

        if (metrics) {
            metrics.event.entityFilter = {
                focusCharacters: focusCharacters || [],
                focusEntities: focusCharacters || [],
                before: beforeFilter,
                after: candidates.length,
                filtered: beforeFilter - candidates.length,
            };
        }
    }

    // MMR 选择
    const selected = mmrSelect(
        candidates,
        CONFIG.EVENT_SELECT_MAX,
        CONFIG.EVENT_MMR_LAMBDA,
        c => c.vector,
        c => c.similarity
    );

    let directCount = 0;
    let relatedCount = 0;

    const results = selected.map(s => {
        const recallType = s._hasEntityMatch ? 'DIRECT' : 'RELATED';
        if (recallType === 'DIRECT') directCount++;
        else relatedCount++;

        return {
            event: s.event,
            similarity: s.similarity,
            _recallType: recallType,
        };
    });

    if (metrics) {
        metrics.event.selected = results.length;
        metrics.event.byRecallType = { direct: directCount, related: relatedCount, causal: 0, lexical: 0, l0Linked: 0 };
        metrics.event.similarityDistribution = calcSimilarityStats(results.map(r => r.similarity));
    }

    return { events: results, vectorMap };
}

// ═══════════════════════════════════════════════════════════════════════════
// [Causation] 因果链追溯
// ═══════════════════════════════════════════════════════════════════════════

function buildEventIndex(allEvents) {
    const map = new Map();
    for (const e of allEvents || []) {
        if (e?.id) map.set(e.id, e);
    }
    return map;
}

function traceCausation(eventHits, eventIndex, maxDepth = CONFIG.CAUSAL_CHAIN_MAX_DEPTH) {
    const out = new Map();
    const idRe = /^evt-\d+$/;
    let maxActualDepth = 0;

    function visit(parentId, depth, chainFrom) {
        if (depth > maxDepth) return;
        if (!idRe.test(parentId)) return;

        const ev = eventIndex.get(parentId);
        if (!ev) return;

        if (depth > maxActualDepth) maxActualDepth = depth;

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

    for (const r of eventHits || []) {
        const rid = r?.event?.id;
        if (!rid) continue;
        for (const cid of (r.event?.causedBy || [])) {
            visit(String(cid || '').trim(), 1, rid);
        }
    }

    const results = Array.from(out.values())
        .sort((a, b) => {
            const refDiff = b.chainFrom.length - a.chainFrom.length;
            if (refDiff !== 0) return refDiff;
            return a.depth - b.depth;
        })
        .slice(0, CONFIG.CAUSAL_INJECT_MAX);

    return { results, maxDepth: maxActualDepth };
}

// ═══════════════════════════════════════════════════════════════════════════
// [W-RRF] 加权倒数排名融合（floor 粒度）
// ═══════════════════════════════════════════════════════════════════════════

function fuseByFloor(denseRank, lexRank, cap = CONFIG.FUSION_CAP) {
    const k = CONFIG.RRF_K;
    const wD = CONFIG.RRF_W_DENSE;
    const wL = CONFIG.RRF_W_LEX;

    const buildRankMap = (ranked) => {
        const map = new Map();
        for (let i = 0; i < ranked.length; i++) {
            const id = ranked[i].id;
            if (!map.has(id)) map.set(id, i);
        }
        return map;
    };

    const denseMap = buildRankMap(denseRank || []);
    const lexMap = buildRankMap(lexRank || []);

    const allIds = new Set([...denseMap.keys(), ...lexMap.keys()]);
    const totalUnique = allIds.size;

    const scored = [];
    for (const id of allIds) {
        let score = 0;
        if (denseMap.has(id)) score += wD / (k + denseMap.get(id));
        if (lexMap.has(id)) score += wL / (k + lexMap.get(id));
        scored.push({ id, fusionScore: score });
    }

    scored.sort((a, b) => b.fusionScore - a.fusionScore);
    return { top: scored.slice(0, cap), totalUnique };
}

// ═══════════════════════════════════════════════════════════════════════════
// [Stage 6] Floor 融合 + Rerank
// ═══════════════════════════════════════════════════════════════════════════

async function locateAndPullEvidence(anchorHits, queryVector, rerankQuery, lexicalResult, metrics) {
    const { chatId, chat, name1, name2 } = getContext();
    if (!chatId) return { l0Selected: [], l1ScoredByFloor: new Map() };

    const T_Start = performance.now();

    // ─────────────────────────────────────────────────────────────────
    // 6a. Dense floor rank（加权聚合：maxSim×0.6 + meanSim×0.4）
    // ─────────────────────────────────────────────────────────────────

    const denseFloorMax = new Map();
    for (const a of (anchorHits || [])) {
        const cur = denseFloorMax.get(a.floor);
        if (!cur || a.similarity > cur) {
            denseFloorMax.set(a.floor, a.similarity);
        }
    }

    const denseFloorRank = [...denseFloorMax.entries()]
        .map(([floor, maxSim]) => ({
            id: floor,
            score: maxSim,
        }))
        .sort((a, b) => b.score - a.score);

    // ─────────────────────────────────────────────────────────────────
    // 6b. Lexical floor rank（密度加成 + Dense 门槛过滤）
    // ─────────────────────────────────────────────────────────────────

    const atomFloorSet = new Set(getStateAtoms().map(a => a.floor));

    const lexFloorAgg = new Map();
    let lexFloorFilteredByDense = 0;

    for (const { chunkId, score } of (lexicalResult?.chunkScores || [])) {
        const match = chunkId?.match(/^c-(\d+)-/);
        if (!match) continue;
        let floor = parseInt(match[1], 10);

        // USER floor → AI floor 映射
        if (chat?.[floor]?.is_user) {
            const aiFloor = floor + 1;
            if (aiFloor < chat.length && !chat[aiFloor]?.is_user) {
                floor = aiFloor;
            } else {
                continue;
            }
        }

        // 预过滤：必须有 L0 atoms
        if (!atomFloorSet.has(floor)) continue;

        // Dense 门槛：lexical floor 必须有最低 dense 相关性
        const denseMax = denseFloorMax.get(floor);
        if (!denseMax || denseMax < CONFIG.LEXICAL_FLOOR_DENSE_MIN) {
            lexFloorFilteredByDense++;
            continue;
        }

        const cur = lexFloorAgg.get(floor);
        if (!cur) {
            lexFloorAgg.set(floor, { maxScore: score, hitCount: 1 });
        } else {
            cur.maxScore = Math.max(cur.maxScore, score);
            cur.hitCount++;
        }
    }

    const lexFloorRank = [...lexFloorAgg.entries()]
        .map(([floor, info]) => ({
            id: floor,
            score: info.maxScore * (1 + CONFIG.LEX_DENSITY_BONUS * Math.log2(Math.max(1, info.hitCount))),
        }))
        .sort((a, b) => b.score - a.score);

    if (metrics) {
        metrics.lexical.floorFilteredByDense = lexFloorFilteredByDense;
    }

    // ─────────────────────────────────────────────────────────────────
    // 6c. Floor W-RRF 融合
    // ─────────────────────────────────────────────────────────────────

    const T_Fusion_Start = performance.now();
    const { top: fusedFloors, totalUnique } = fuseByFloor(denseFloorRank, lexFloorRank, CONFIG.FUSION_CAP);
    const fusionTime = Math.round(performance.now() - T_Fusion_Start);

    if (metrics) {
        metrics.fusion.denseFloors = denseFloorRank.length;
        metrics.fusion.lexFloors = lexFloorRank.length;
        metrics.fusion.totalUnique = totalUnique;
        metrics.fusion.afterCap = fusedFloors.length;
        metrics.fusion.time = fusionTime;
        metrics.fusion.denseAggMethod = 'maxSim';
        metrics.fusion.lexDensityBonus = CONFIG.LEX_DENSITY_BONUS;
        metrics.evidence.floorCandidates = fusedFloors.length;
    }

    if (fusedFloors.length === 0) {
        if (metrics) {
            metrics.evidence.floorsSelected = 0;
            metrics.evidence.l0Collected = 0;
            metrics.evidence.l1Pulled = 0;
            metrics.evidence.l1Attached = 0;
            metrics.evidence.l1CosineTime = 0;
            metrics.evidence.rerankApplied = false;
        }
        return { l0Selected: [], l1ScoredByFloor: new Map() };
    }

    // ─────────────────────────────────────────────────────────────────
    // 6d. 拉取 L1 chunks + cosine 打分
    // ─────────────────────────────────────────────────────────────────

    const floorsToFetch = new Set();
    for (const f of fusedFloors) {
        floorsToFetch.add(f.id);
        const userFloor = f.id - 1;
        if (userFloor >= 0 && chat?.[userFloor]?.is_user) {
            floorsToFetch.add(userFloor);
        }
    }

    const l1ScoredByFloor = await pullAndScoreL1(chatId, [...floorsToFetch], queryVector, chat);

    // ─────────────────────────────────────────────────────────────────
    // 6e. 构建 rerank documents（每个 floor: USER chunks + AI chunks）
    // ─────────────────────────────────────────────────────────────────

    const rerankCandidates = [];
    for (const f of fusedFloors) {
        const aiFloor = f.id;
        const userFloor = aiFloor - 1;

        const aiChunks = l1ScoredByFloor.get(aiFloor) || [];
        const userChunks = (userFloor >= 0 && chat?.[userFloor]?.is_user)
            ? (l1ScoredByFloor.get(userFloor) || [])
            : [];

        const parts = [];
        const userName = chat?.[userFloor]?.name || name1 || '用户';
        const aiName = chat?.[aiFloor]?.name || name2 || '角色';

        if (userChunks.length > 0) {
            parts.push(`${userName}：${userChunks.map(c => c.text).join(' ')}`);
        }
        if (aiChunks.length > 0) {
            parts.push(`${aiName}：${aiChunks.map(c => c.text).join(' ')}`);
        }

        const text = parts.join('\n');
        if (!text.trim()) continue;

        rerankCandidates.push({
            floor: aiFloor,
            text,
            fusionScore: f.fusionScore,
        });
    }

    // ─────────────────────────────────────────────────────────────────
    // 6f. Rerank
    // ─────────────────────────────────────────────────────────────────

    const T_Rerank_Start = performance.now();

    const reranked = await rerankChunks(rerankQuery, rerankCandidates, {
        topN: CONFIG.RERANK_TOP_N,
        minScore: CONFIG.RERANK_MIN_SCORE,
    });

    const rerankTime = Math.round(performance.now() - T_Rerank_Start);

    if (metrics) {
        metrics.evidence.rerankApplied = true;
        metrics.evidence.beforeRerank = rerankCandidates.length;
        metrics.evidence.afterRerank = reranked.length;
        metrics.evidence.rerankFailed = reranked.some(c => c._rerankFailed);
        metrics.evidence.rerankTime = rerankTime;
        metrics.timing.evidenceRerank = rerankTime;

        const scores = reranked.map(c => c._rerankScore || 0).filter(s => s > 0);
        if (scores.length > 0) {
            scores.sort((a, b) => a - b);
            metrics.evidence.rerankScores = {
                min: Number(scores[0].toFixed(3)),
                max: Number(scores[scores.length - 1].toFixed(3)),
                mean: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(3)),
            };
        }

        if (rerankCandidates.length > 0) {
            const totalLen = rerankCandidates.reduce((s, c) => s + (c.text?.length || 0), 0);
            metrics.evidence.rerankDocAvgLength = Math.round(totalLen / rerankCandidates.length);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // 6g. 收集 L0 atoms
    // ─────────────────────────────────────────────────────────────────

    // 仅保留“真实 dense 命中”的 L0 原子：
    // 旧逻辑按 floor 全塞，容易把同层无关原子带进来。
    const atomById = new Map(getStateAtoms().map(a => [a.atomId, a]));
    const matchedAtomsByFloor = new Map();
    for (const hit of (anchorHits || [])) {
        const atom = hit.atom || atomById.get(hit.atomId);
        if (!atom) continue;
        if (!matchedAtomsByFloor.has(hit.floor)) matchedAtomsByFloor.set(hit.floor, []);
        matchedAtomsByFloor.get(hit.floor).push({
            atom,
            similarity: hit.similarity,
        });
    }
    for (const arr of matchedAtomsByFloor.values()) {
        arr.sort((a, b) => b.similarity - a.similarity);
    }

    const l0Selected = [];

    for (const item of reranked) {
        const floor = item.floor;
        const rerankScore = item._rerankScore || 0;

        // 仅收集该 floor 中真实命中的 L0 atoms
        const floorMatchedAtoms = matchedAtomsByFloor.get(floor) || [];
        for (const { atom, similarity } of floorMatchedAtoms) {
            l0Selected.push({
                id: `anchor-${atom.atomId}`,
                atomId: atom.atomId,
                floor: atom.floor,
                similarity,
                rerankScore,
                atom,
                text: atom.semantic || '',
            });
        }

    }

    if (metrics) {
        metrics.evidence.floorsSelected = reranked.length;
        metrics.evidence.l0Collected = l0Selected.length;

        metrics.evidence.l1Pulled = 0;
        metrics.evidence.l1Attached = 0;
        metrics.evidence.l1CosineTime = 0;
        metrics.evidence.contextPairsAdded = 0;
    }

    const totalTime = Math.round(performance.now() - T_Start);
    if (metrics) {
        metrics.timing.evidenceRetrieval = Math.max(0, totalTime - fusionTime - rerankTime);
    }

    xbLog.info(MODULE_ID,
        `Evidence: ${denseFloorRank.length} dense floors + ${lexFloorRank.length} lex floors (${lexFloorFilteredByDense} lex filtered by dense) → fusion=${fusedFloors.length} → rerank=${reranked.length} floors → L0=${l0Selected.length} (${totalTime}ms)`
    );

    return { l0Selected, l1ScoredByFloor };
}

// ═══════════════════════════════════════════════════════════════════════════
// [L1] 拉取 + Cosine 打分
// ═══════════════════════════════════════════════════════════════════════════

async function pullAndScoreL1(chatId, floors, queryVector, chat) {
    const T0 = performance.now();

    const result = new Map();

    if (!chatId || !floors?.length || !queryVector?.length) {
        result._cosineTime = 0;
        return result;
    }

    let dbChunks = [];
    try {
        dbChunks = await getChunksByFloors(chatId, floors);
    } catch (e) {
        xbLog.warn(MODULE_ID, 'L1 chunks 拉取失败', e);
        result._cosineTime = Math.round(performance.now() - T0);
        return result;
    }

    if (!dbChunks.length) {
        result._cosineTime = Math.round(performance.now() - T0);
        return result;
    }

    const chunkIds = dbChunks.map(c => c.chunkId);
    let chunkVectors = [];
    try {
        chunkVectors = await getChunkVectorsByIds(chatId, chunkIds);
    } catch (e) {
        xbLog.warn(MODULE_ID, 'L1 向量拉取失败', e);
        result._cosineTime = Math.round(performance.now() - T0);
        return result;
    }

    const vectorMap = new Map(chunkVectors.map(v => [v.chunkId, v.vector]));

    for (const chunk of dbChunks) {
        const vec = vectorMap.get(chunk.chunkId);
        const cosineScore = vec?.length ? cosineSimilarity(queryVector, vec) : 0;

        const scored = {
            chunkId: chunk.chunkId,
            floor: chunk.floor,
            chunkIdx: chunk.chunkIdx,
            speaker: chunk.speaker,
            isUser: chunk.isUser,
            text: chunk.text,
            _cosineScore: cosineScore,
        };

        if (!result.has(chunk.floor)) {
            result.set(chunk.floor, []);
        }
        result.get(chunk.floor).push(scored);
    }

    for (const [, chunks] of result) {
        chunks.sort((a, b) => b._cosineScore - a._cosineScore);
    }

    result._cosineTime = Math.round(performance.now() - T0);

    xbLog.info(MODULE_ID,
        `L1 pull: ${floors.length} floors → ${dbChunks.length} chunks → scored (${result._cosineTime}ms)`
    );

    return result;
}

async function buildL1PairsForSelectedFloors(l0Selected, queryVector, prefetchedL1ByFloor, metrics) {
    const T0 = performance.now();
    const { chatId, chat } = getContext();

    const l1ByFloor = new Map();
    if (!chatId || !queryVector?.length || !l0Selected?.length) {
        if (metrics) {
            metrics.evidence.l1Pulled = 0;
            metrics.evidence.l1Attached = 0;
            metrics.evidence.l1CosineTime = 0;
            metrics.evidence.contextPairsAdded = 0;
        }
        return l1ByFloor;
    }

    const requiredFloors = new Set();
    const selectedFloors = new Set();
    for (const l0 of l0Selected) {
        const floor = Number(l0?.floor);
        if (!Number.isInteger(floor) || floor < 0) continue;
        selectedFloors.add(floor);
        requiredFloors.add(floor);
        const userFloor = floor - 1;
        if (userFloor >= 0 && chat?.[userFloor]?.is_user) {
            requiredFloors.add(userFloor);
        }
    }

    const merged = new Map();
    const prefetched = prefetchedL1ByFloor || new Map();
    let totalCosineTime = Number(prefetched._cosineTime || 0);

    for (const [floor, chunks] of prefetched) {
        if (!requiredFloors.has(floor)) continue;
        merged.set(floor, chunks);
    }

    const missingFloors = [...requiredFloors].filter(f => !merged.has(f));
    if (missingFloors.length > 0) {
        const extra = await pullAndScoreL1(chatId, missingFloors, queryVector, chat);
        totalCosineTime += Number(extra._cosineTime || 0);
        for (const [floor, chunks] of extra) {
            if (floor === '_cosineTime') continue;
            if (!requiredFloors.has(floor)) continue;
            merged.set(floor, chunks);
        }
    }

    let contextPairsAdded = 0;
    let totalAttached = 0;
    for (const floor of selectedFloors) {
        const aiChunks = merged.get(floor) || [];
        const userFloor = floor - 1;
        const userChunks = (userFloor >= 0 && chat?.[userFloor]?.is_user)
            ? (merged.get(userFloor) || [])
            : [];

        const aiTop1 = aiChunks.length > 0
            ? aiChunks.reduce((best, c) => (c._cosineScore > best._cosineScore ? c : best))
            : null;
        const userTop1 = userChunks.length > 0
            ? userChunks.reduce((best, c) => (c._cosineScore > best._cosineScore ? c : best))
            : null;

        if (aiTop1) totalAttached++;
        if (userTop1) {
            totalAttached++;
            contextPairsAdded++;
        }
        l1ByFloor.set(floor, { aiTop1, userTop1 });
    }

    if (metrics) {
        let totalPulled = 0;
        for (const [, chunks] of merged) {
            totalPulled += chunks.length;
        }
        metrics.evidence.l1Pulled = totalPulled;
        metrics.evidence.l1Attached = totalAttached;
        metrics.evidence.l1CosineTime = totalCosineTime;
        metrics.evidence.contextPairsAdded = contextPairsAdded;
        metrics.timing.evidenceRetrieval += Math.round(performance.now() - T0);
    }

    return l1ByFloor;
}

// ═══════════════════════════════════════════════════════════════════════════
// 主函数
// ═══════════════════════════════════════════════════════════════════════════

export async function recallMemory(allEvents, vectorConfig, options = {}) {
    const T0 = performance.now();
    const { chat } = getContext();
    const { pendingUserMessage = null, excludeLastAi = false } = options;

    const metrics = createMetrics();

    if (!allEvents?.length) {
        metrics.anchor.needRecall = false;
        metrics.timing.total = Math.round(performance.now() - T0);
        return {
            events: [],
            l0Selected: [],
            l1ByFloor: new Map(),
            causalChain: [],
            focusEntities: [],
            focusTerms: [],
            focusCharacters: [],
            elapsed: metrics.timing.total,
            logText: 'No events.',
            metrics,
        };
    }

    metrics.anchor.needRecall = true;

    // ═══════════════════════════════════════════════════════════════════
    // 阶段 1: Query Build
    // ═══════════════════════════════════════════════════════════════════

    const T_Build_Start = performance.now();

    const lastMessagesCount = pendingUserMessage
        ? CONFIG.LAST_MESSAGES_K_WITH_PENDING
        : CONFIG.LAST_MESSAGES_K;
    const lastMessages = getLastMessages(chat, lastMessagesCount, excludeLastAi);

    const bundle = buildQueryBundle(lastMessages, pendingUserMessage);
    const focusTerms = bundle.focusTerms || bundle.focusEntities || [];
    const focusCharacters = bundle.focusCharacters || [];

    metrics.query.buildTime = Math.round(performance.now() - T_Build_Start);
    metrics.anchor.focusTerms = focusTerms;
    metrics.anchor.focusEntities = focusTerms; // compat
    metrics.anchor.focusCharacters = focusCharacters;

    if (metrics.query?.lengths) {
        metrics.query.lengths.v0Chars = bundle.querySegments.reduce((sum, s) => sum + s.text.length, 0);
        metrics.query.lengths.v1Chars = null;
        metrics.query.lengths.rerankChars = String(bundle.rerankQuery || '').length;
    }

    xbLog.info(MODULE_ID,
        `Query Build: focus_terms=[${focusTerms.join(',')}] focus_characters=[${focusCharacters.join(',')}] segments=${bundle.querySegments.length} lexTerms=[${bundle.lexicalTerms.slice(0, 5).join(',')}]`
    );

    // ═══════════════════════════════════════════════════════════════════
    // 阶段 2: Round 1 Dense Retrieval（batch embed → 加权平均）
    // ═══════════════════════════════════════════════════════════════════

    const segmentTexts = bundle.querySegments.map(s => s.text);
    if (!segmentTexts.length) {
        metrics.timing.total = Math.round(performance.now() - T0);
        return {
            events: [], l0Selected: [], l1ByFloor: new Map(), causalChain: [],
            focusEntities: focusTerms,
            focusTerms,
            focusCharacters,
            elapsed: metrics.timing.total,
            logText: 'No query segments.',
            metrics,
        };
    }

    let r1Vectors;
    try {
        r1Vectors = await embed(segmentTexts, vectorConfig, { timeout: 10000 });
    } catch (e1) {
        xbLog.warn(MODULE_ID, 'Round 1 向量化失败，500ms 后重试', e1);
        await new Promise(r => setTimeout(r, 500));
        try {
            r1Vectors = await embed(segmentTexts, vectorConfig, { timeout: 15000 });
        } catch (e2) {
            xbLog.error(MODULE_ID, 'Round 1 向量化重试仍失败', e2);
            metrics.timing.total = Math.round(performance.now() - T0);
            return {
                events: [], l0Selected: [], l1ByFloor: new Map(), causalChain: [],
                focusEntities: focusTerms,
                focusTerms,
                focusCharacters,
                elapsed: metrics.timing.total,
                logText: 'Embedding failed (round 1, after retry).',
                metrics,
            };
        }
    }

    if (!r1Vectors?.length || r1Vectors.some(v => !v?.length)) {
        metrics.timing.total = Math.round(performance.now() - T0);
        return {
            events: [], l0Selected: [], l1ByFloor: new Map(), causalChain: [],
            focusEntities: focusTerms,
            focusTerms,
            focusCharacters,
            elapsed: metrics.timing.total,
            logText: 'Empty query vectors (round 1).',
            metrics,
        };
    }

    const r1Weights = computeSegmentWeights(bundle.querySegments);
    const queryVector_v0 = weightedAverageVectors(r1Vectors, r1Weights);

    if (metrics) {
        metrics.query.segmentWeights = r1Weights.map(w => Number(w.toFixed(3)));
    }

    if (!queryVector_v0?.length) {
        metrics.timing.total = Math.round(performance.now() - T0);
        return {
            events: [], l0Selected: [], l1ByFloor: new Map(), causalChain: [],
            focusEntities: focusTerms,
            focusTerms,
            focusCharacters,
            elapsed: metrics.timing.total,
            logText: 'Weighted average produced empty vector.',
            metrics,
        };
    }

    const T_R1_Anchor_Start = performance.now();
    const { hits: anchorHits_v0 } = await recallAnchors(queryVector_v0, vectorConfig, null);
    const r1AnchorTime = Math.round(performance.now() - T_R1_Anchor_Start);

    const T_R1_Event_Start = performance.now();
    const { events: eventHits_v0 } = await recallEvents(queryVector_v0, allEvents, vectorConfig, focusCharacters, null);
    const r1EventTime = Math.round(performance.now() - T_R1_Event_Start);

    xbLog.info(MODULE_ID,
        `Round 1: anchors=${anchorHits_v0.length} events=${eventHits_v0.length} weights=[${r1Weights.map(w => w.toFixed(2)).join(',')}] (anchor=${r1AnchorTime}ms event=${r1EventTime}ms)`
    );

    // ═══════════════════════════════════════════════════════════════════
    // 阶段 3: Query Refinement
    // ═══════════════════════════════════════════════════════════════════

    const T_Refine_Start = performance.now();

    refineQueryBundle(bundle, anchorHits_v0, eventHits_v0);

    metrics.query.refineTime = Math.round(performance.now() - T_Refine_Start);

    if (metrics.query?.lengths && bundle.hintsSegment) {
        metrics.query.lengths.v1Chars = metrics.query.lengths.v0Chars + bundle.hintsSegment.text.length;
    }

    xbLog.info(MODULE_ID,
        `Refinement: focus_terms=[${focusTerms.join(',')}] focus_characters=[${focusCharacters.join(',')}] hasHints=${!!bundle.hintsSegment} (${metrics.query.refineTime}ms)`
    );

    // ═══════════════════════════════════════════════════════════════════
    // 阶段 4: Round 2 Dense Retrieval（复用 R1 向量 + embed hints）
    // ═══════════════════════════════════════════════════════════════════

    let queryVector_v1;

    if (bundle.hintsSegment) {
        try {
            const [hintsVec] = await embed([bundle.hintsSegment.text], vectorConfig, { timeout: 10000 });

            if (hintsVec?.length) {
                const r2Weights = computeR2Weights(bundle.querySegments, bundle.hintsSegment);
                queryVector_v1 = weightedAverageVectors([...r1Vectors, hintsVec], r2Weights);

                if (metrics) {
                    metrics.query.r2Weights = r2Weights.map(w => Number(w.toFixed(3)));
                }

                xbLog.info(MODULE_ID,
                    `Round 2 weights: [${r2Weights.map(w => w.toFixed(2)).join(',')}]`
                );
            } else {
                queryVector_v1 = queryVector_v0;
            }
        } catch (e) {
            xbLog.warn(MODULE_ID, 'Round 2 hints 向量化失败，降级使用 Round 1 向量', e);
            queryVector_v1 = queryVector_v0;
        }
    } else {
        queryVector_v1 = queryVector_v0;
    }

    const T_R2_Anchor_Start = performance.now();
    const { hits: anchorHits, floors: anchorFloors_dense, stateVectors: allStateVectors } = await recallAnchors(queryVector_v1, vectorConfig, metrics);
    metrics.timing.anchorSearch = Math.round(performance.now() - T_R2_Anchor_Start);

    const T_R2_Event_Start = performance.now();
    let { events: eventHits, vectorMap: eventVectorMap } = await recallEvents(queryVector_v1, allEvents, vectorConfig, focusCharacters, metrics);
    metrics.timing.eventRetrieval = Math.round(performance.now() - T_R2_Event_Start);

    xbLog.info(MODULE_ID,
        `Round 2: anchors=${anchorHits.length} floors=${anchorFloors_dense.size} events=${eventHits.length}`
    );

    // ═══════════════════════════════════════════════════════════════════
    // 阶段 5: Lexical Retrieval + Dense-Gated Event Merge
    // ═══════════════════════════════════════════════════════════════════

    const T_Lex_Start = performance.now();

    let lexicalResult = {
        atomIds: [], atomFloors: new Set(),
        chunkIds: [], chunkFloors: new Set(),
        eventIds: [], chunkScores: [], searchTime: 0,
    };

    let indexReadyTime = 0;
    try {
        const T_Index_Ready = performance.now();
        const index = await getLexicalIndex();
        indexReadyTime = Math.round(performance.now() - T_Index_Ready);
        if (index) {
            lexicalResult = searchLexicalIndex(index, bundle.lexicalTerms);
        }
    } catch (e) {
        xbLog.warn(MODULE_ID, 'Lexical 检索失败', e);
    }

    const lexTime = Math.round(performance.now() - T_Lex_Start);

    if (metrics) {
        metrics.lexical.atomHits = lexicalResult.atomIds.length;
        metrics.lexical.chunkHits = lexicalResult.chunkIds.length;
        metrics.lexical.eventHits = lexicalResult.eventIds.length;
        metrics.lexical.searchTime = lexicalResult.searchTime || 0;
        metrics.lexical.indexReadyTime = indexReadyTime;
        metrics.lexical.terms = bundle.lexicalTerms.slice(0, 10);
    }

    // 合并 L2 events（lexical 命中但 dense 未命中的 events）
    // ★ Dense 门槛：验证 event 向量与 queryVector_v1 的 cosine similarity
    const existingEventIds = new Set(eventHits.map(e => e.event?.id).filter(Boolean));
    const eventIndex = buildEventIndex(allEvents);
    let lexicalEventCount = 0;
    let lexicalEventFilteredByDense = 0;
    let l0LinkedCount = 0;
    const focusSetForLexical = new Set((focusCharacters || []).map(normalize));

    for (const eid of lexicalResult.eventIds) {
        if (existingEventIds.has(eid)) continue;

        const ev = eventIndex.get(eid);
        if (!ev) continue;

        // Dense gate: 验证 event 向量与 query 的语义相关性
        const evVec = eventVectorMap.get(eid);
        if (!evVec?.length) {
            // 无向量无法验证相关性，丢弃
            lexicalEventFilteredByDense++;
            continue;
        }

        const sim = cosineSimilarity(queryVector_v1, evVec);
        if (sim < CONFIG.LEXICAL_EVENT_DENSE_MIN) {
            lexicalEventFilteredByDense++;
            continue;
        }

        // 实体分类：与 Dense 路径统一标准
        const participants = (ev.participants || []).map(p => normalize(p));
        const hasEntityMatch = focusSetForLexical.size > 0 && participants.some(p => focusSetForLexical.has(p));

        eventHits.push({
            event: ev,
            similarity: sim,
            _recallType: hasEntityMatch ? 'DIRECT' : 'RELATED',
        });
        existingEventIds.add(eid);
        lexicalEventCount++;
    }

    if (metrics) {
        metrics.lexical.eventFilteredByDense = lexicalEventFilteredByDense;

        if (lexicalEventCount > 0) {
            metrics.event.byRecallType.lexical = lexicalEventCount;
            metrics.event.selected += lexicalEventCount;
        }
    }

    xbLog.info(MODULE_ID,
        `Lexical: chunks=${lexicalResult.chunkIds.length} events=${lexicalResult.eventIds.length} mergedEvents=+${lexicalEventCount} filteredByDense=${lexicalEventFilteredByDense} floorFiltered=${metrics.lexical.floorFilteredByDense || 0} (indexReady=${indexReadyTime}ms search=${lexicalResult.searchTime || 0}ms total=${lexTime}ms)`
    );

    // ═══════════════════════════════════════════════════════════════════
    // 阶段 6: Floor 粒度融合 + Rerank + L1 配对
    // ═══════════════════════════════════════════════════════════════════

    const { l0Selected, l1ScoredByFloor } = await locateAndPullEvidence(
        anchorHits,
        queryVector_v1,
        bundle.rerankQuery,
        lexicalResult,
        metrics
    );

    // ═══════════════════════════════════════════════════════════════════
    // Stage 7.5: PPR Diffusion Activation
    //
    // Spread from reranked seeds through entity co-occurrence graph.
    // Diffused atoms merge into l0Selected at lower scores than seeds,
    // consumed by prompt.js through the same budget pipeline.
    // ═══════════════════════════════════════════════════════════════════

    const diffused = diffuseFromSeeds(
        l0Selected,          // seeds (rerank-verified)
        getStateAtoms(),     // all L0 atoms
        allStateVectors,     // all L0 vectors (already read by recallAnchors)
        queryVector_v1,      // R2 query vector (for cosine gate)
        metrics,             // metrics collector
    );

    for (const da of diffused) {
        l0Selected.push({
            id: `diffused-${da.atomId}`,
            atomId: da.atomId,
            floor: da.floor,
            similarity: da.finalScore,
            rerankScore: da.finalScore,
            atom: da.atom,
            text: da.atom.semantic || '',
        });
    }
    metrics.timing.diffusion = metrics.diffusion?.time || 0;

    // ═══════════════════════════════════════════════════════════════════
    // Stage 8: L0 → L2 反向查找（后置，基于最终 l0Selected）
    // ═══════════════════════════════════════════════════════════════════

    const recalledL0Floors = new Set(l0Selected.map(x => x.floor));

    for (const event of allEvents) {
        if (existingEventIds.has(event.id)) continue;

        const range = parseFloorRange(event.summary);
        if (!range) continue;

        let hasOverlap = false;
        for (const floor of recalledL0Floors) {
            if (floor >= range.start && floor <= range.end) {
                hasOverlap = true;
                break;
            }
        }
        if (!hasOverlap) continue;

        // Dense similarity 门槛（与 Lexical Event 对齐）
        const evVec = eventVectorMap.get(event.id);
        const sim = evVec?.length ? cosineSimilarity(queryVector_v1, evVec) : 0;
        if (sim < CONFIG.LEXICAL_EVENT_DENSE_MIN) continue;

        // 实体分类：与所有路径统一标准
        const participants = (event.participants || []).map(p => normalize(p));
        const hasEntityMatch = focusSetForLexical.size > 0
            && participants.some(p => focusSetForLexical.has(p));

        eventHits.push({
            event,
            similarity: sim,
            _recallType: hasEntityMatch ? 'DIRECT' : 'RELATED',
        });
        existingEventIds.add(event.id);
        l0LinkedCount++;
    }

    if (metrics && l0LinkedCount > 0) {
        metrics.event.byRecallType.l0Linked = l0LinkedCount;
        metrics.event.selected += l0LinkedCount;
    }

    xbLog.info(MODULE_ID,
        `L0-linked events: ${recalledL0Floors.size} floors → ${l0LinkedCount} events linked (sim≥${CONFIG.LEXICAL_EVENT_DENSE_MIN})`
    );

    const l1ByFloor = await buildL1PairsForSelectedFloors(
        l0Selected,
        queryVector_v1,
        l1ScoredByFloor,
        metrics
    );

    // ═══════════════════════════════════════════════════════════════════
    // 阶段 9: Causation Trace
    // ═══════════════════════════════════════════════════════════════════

    const { results: causalMap, maxDepth: causalMaxDepth } = traceCausation(eventHits, eventIndex);

    const recalledIdSet = new Set(eventHits.map(x => x?.event?.id).filter(Boolean));
    const causalChain = causalMap
        .filter(x => x?.event?.id && !recalledIdSet.has(x.event.id))
        .map(x => ({
            event: x.event,
            similarity: 0,
            _recallType: 'CAUSAL',
            _causalDepth: x.depth,
            chainFrom: x.chainFrom,
        }));

    if (metrics.event.byRecallType) {
        metrics.event.byRecallType.causal = causalChain.length;
    }
    metrics.event.causalChainDepth = causalMaxDepth;
    metrics.event.causalCount = causalChain.length;

    // ═══════════════════════════════════════════════════════════════════
    // 完成
    // ═══════════════════════════════════════════════════════════════════

    metrics.timing.total = Math.round(performance.now() - T0);
    metrics.event.entityNames = focusCharacters;
    metrics.event.entitiesUsed = focusCharacters.length;
    metrics.event.focusTermsCount = focusTerms.length;

    console.group('%c[Recall v9]', 'color: #7c3aed; font-weight: bold');
    console.log(`Total: ${metrics.timing.total}ms`);
    console.log(`Query Build: ${metrics.query.buildTime}ms | Refine: ${metrics.query.refineTime}ms`);
    console.log(`R1 weights: [${r1Weights.map(w => w.toFixed(2)).join(', ')}]`);
    console.log(`Focus terms: [${focusTerms.join(', ')}]`);
    console.log(`Focus characters: [${focusCharacters.join(', ')}]`);
    console.log(`Round 2 Anchors: ${anchorHits.length} hits → ${anchorFloors_dense.size} floors`);
    console.log(`Lexical: chunks=${lexicalResult.chunkIds.length} events=${lexicalResult.eventIds.length} evtMerged=+${lexicalEventCount} evtFiltered=${lexicalEventFilteredByDense} floorFiltered=${metrics.lexical.floorFilteredByDense || 0} (idx=${indexReadyTime}ms search=${lexicalResult.searchTime || 0}ms total=${lexTime}ms)`);
    console.log(`Fusion (floor, weighted): dense=${metrics.fusion.denseFloors} lex=${metrics.fusion.lexFloors} → cap=${metrics.fusion.afterCap} (${metrics.fusion.time}ms)`);
    console.log(`Floor Rerank: ${metrics.evidence.beforeRerank || 0} → ${metrics.evidence.floorsSelected || 0} floors → L0=${metrics.evidence.l0Collected || 0} (${metrics.evidence.rerankTime || 0}ms)`);
    console.log(`L1: ${metrics.evidence.l1Pulled || 0} pulled → ${metrics.evidence.l1Attached || 0} attached (${metrics.evidence.l1CosineTime || 0}ms)`);
    console.log(`Events: ${eventHits.length} hits (l0Linked=+${l0LinkedCount}), ${causalChain.length} causal`);
    console.log(`Diffusion: ${metrics.diffusion?.seedCount || 0} seeds → ${metrics.diffusion?.pprActivated || 0} activated → ${metrics.diffusion?.finalCount || 0} final (${metrics.diffusion?.time || 0}ms)`);
    console.groupEnd();

    return {
        events: eventHits,
        causalChain,
        l0Selected,
        l1ByFloor,
        focusEntities: focusTerms,
        focusTerms,
        focusCharacters,
        elapsed: metrics.timing.total,
        metrics,
    };
}
