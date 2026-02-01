// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - State Recall (L0)
// L0 语义锚点召回 + floor bonus + 虚拟 chunk 转换
// ═══════════════════════════════════════════════════════════════════════════

import { getContext } from '../../../../../../extensions.js';
import { getAllStateVectors, getStateAtoms } from './state-store.js';
import { getMeta } from './chunk-store.js';
import { getEngineFingerprint } from './embedder.js';
import { xbLog } from '../../../core/debug-core.js';

const MODULE_ID = 'state-recall';

const CONFIG = {
    MAX_RESULTS: 20,
    MIN_SIMILARITY: 0.55,
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

// ═══════════════════════════════════════════════════════════════════════════
// L0 向量检索
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 检索与 query 相似的 StateAtoms
 * @returns {Array<{atom, similarity}>}
 */
export async function searchStateAtoms(queryVector, vectorConfig) {
    const { chatId } = getContext();
    if (!chatId || !queryVector?.length) return [];

    // 检查 fingerprint
    const meta = await getMeta(chatId);
    const fp = getEngineFingerprint(vectorConfig);
    if (meta.fingerprint && meta.fingerprint !== fp) {
        xbLog.warn(MODULE_ID, 'fingerprint 不匹配，跳过 L0 召回');
        return [];
    }

    // 获取向量
    const stateVectors = await getAllStateVectors(chatId);
    if (!stateVectors.length) return [];

    // 获取 atoms（用于关联 semantic 等字段）
    const atoms = getStateAtoms();
    const atomMap = new Map(atoms.map(a => [a.atomId, a]));

    // 计算相似度
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
        .filter(s => s.similarity >= CONFIG.MIN_SIMILARITY)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, CONFIG.MAX_RESULTS);

    return scored;
}

// ═══════════════════════════════════════════════════════════════════════════
// Floor Bonus 构建
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 构建 L0 相关楼层的加权映射
 * @returns {Map<number, number>}
 */
export function buildL0FloorBonus(l0Results, bonusFactor = 0.10) {
    const floorBonus = new Map();

    for (const r of l0Results || []) {
        // 每个楼层只加一次，取最高相似度对应的 bonus
        // 简化处理：统一加 bonusFactor，不区分相似度高低
        if (!floorBonus.has(r.floor)) {
            floorBonus.set(r.floor, bonusFactor);
        }
    }

    return floorBonus;
}

// ═══════════════════════════════════════════════════════════════════════════
// 虚拟 Chunk 转换
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 将 L0 结果转换为虚拟 chunk 格式
 * 用于和 L1 chunks 统一处理
 */
export function stateToVirtualChunks(l0Results) {
    return (l0Results || []).map(r => ({
        chunkId: `state-${r.atomId}`,
        floor: r.floor,
        chunkIdx: -1,           // 负值，排序时排在 L1 前面
        speaker: '📌',          // 固定标记
        isUser: false,
        text: r.atom.semantic,
        textHash: null,
        similarity: r.similarity,
        isL0: true,             // 标记字段
        // 保留原始 atom 信息
        _atom: r.atom,
    }));
}

// ═══════════════════════════════════════════════════════════════════════════
// 每楼层稀疏去重
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 合并 L0 和 L1 chunks，每楼层最多保留 limit 条
 * @param {Array} l0Chunks - 虚拟 chunks（已按相似度排序）
 * @param {Array} l1Chunks - 真实 chunks（已按相似度排序）
 * @param {number} limit - 每楼层上限
 * @returns {Array} 合并后的 chunks
 */
export function mergeAndSparsify(l0Chunks, l1Chunks, limit = 2) {
    // 合并并按相似度排序
    const all = [...(l0Chunks || []), ...(l1Chunks || [])]
        .sort((a, b) => b.similarity - a.similarity);

    // 每楼层稀疏去重
    const byFloor = new Map();

    for (const c of all) {
        const arr = byFloor.get(c.floor) || [];
        if (arr.length < limit) {
            arr.push(c);
            byFloor.set(c.floor, arr);
        }
    }

    // 扁平化并保持相似度排序
    return Array.from(byFloor.values())
        .flat()
        .sort((a, b) => b.similarity - a.similarity);
}
