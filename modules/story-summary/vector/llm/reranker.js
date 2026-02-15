// ═══════════════════════════════════════════════════════════════════════════
// Reranker - 硅基 bge-reranker-v2-m3
// 对候选文档进行精排，过滤与 query 不相关的内容
// ═══════════════════════════════════════════════════════════════════════════

import { xbLog } from '../../../../core/debug-core.js';
import { getApiKey } from './siliconflow.js';

const MODULE_ID = 'reranker';
const RERANK_URL = 'https://api.siliconflow.cn/v1/rerank';
const RERANK_MODEL = 'BAAI/bge-reranker-v2-m3';
const DEFAULT_TIMEOUT = 15000;
const MAX_DOCUMENTS = 100;  // API 限制
const RERANK_BATCH_SIZE = 20;
const RERANK_MAX_CONCURRENCY = 5;

/**
 * 对文档列表进行 Rerank 精排
 * 
 * @param {string} query - 查询文本
 * @param {Array<string>} documents - 文档文本列表
 * @param {object} options - 选项
 * @param {number} options.topN - 返回前 N 个结果，默认 40
 * @param {number} options.timeout - 超时时间，默认 15000ms
 * @param {AbortSignal} options.signal - 取消信号
 * @returns {Promise<Array<{index: number, relevance_score: number}>>} 排序后的结果
 */
export async function rerank(query, documents, options = {}) {
    const { topN = 40, timeout = DEFAULT_TIMEOUT, signal } = options;

    if (!query?.trim()) {
        xbLog.warn(MODULE_ID, 'query 为空，跳过 rerank');
        return { results: documents.map((_, i) => ({ index: i, relevance_score: 0 })), failed: true };
    }

    if (!documents?.length) {
        return { results: [], failed: false };
    }

    const key = getApiKey();
    if (!key) {
        xbLog.warn(MODULE_ID, '未配置 API Key，跳过 rerank');
        return { results: documents.map((_, i) => ({ index: i, relevance_score: 0 })), failed: true };
    }

    // 截断超长文档列表
    const truncatedDocs = documents.slice(0, MAX_DOCUMENTS);
    if (documents.length > MAX_DOCUMENTS) {
        xbLog.warn(MODULE_ID, `文档数 ${documents.length} 超过限制 ${MAX_DOCUMENTS}，已截断`);
    }

    // 过滤空文档，记录原始索引
    const validDocs = [];
    const indexMap = [];  // validDocs index → original index
    
    for (let i = 0; i < truncatedDocs.length; i++) {
        const text = String(truncatedDocs[i] || '').trim();
        if (text) {
            validDocs.push(text);
            indexMap.push(i);
        }
    }

    if (!validDocs.length) {
        xbLog.warn(MODULE_ID, '无有效文档，跳过 rerank');
        return { results: [], failed: false };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const T0 = performance.now();

        const response = await fetch(RERANK_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: RERANK_MODEL,
                // Zero-darkbox: do not silently truncate query.
                query,
                documents: validDocs,
                top_n: Math.min(topN, validDocs.length),
                return_documents: false,
            }),
            signal: signal || controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`Rerank API ${response.status}: ${errorText.slice(0, 200)}`);
        }

        const data = await response.json();
        const results = data.results || [];

        // 映射回原始索引
        const mapped = results.map(r => ({
            index: indexMap[r.index],
            relevance_score: r.relevance_score ?? 0,
        }));

        const elapsed = Math.round(performance.now() - T0);
        xbLog.info(MODULE_ID, `Rerank 完成: ${validDocs.length} docs → ${results.length} selected (${elapsed}ms)`);

        return { results: mapped, failed: false };

    } catch (e) {
        clearTimeout(timeoutId);

        if (e?.name === 'AbortError') {
            xbLog.warn(MODULE_ID, 'Rerank 超时或取消');
        } else {
            xbLog.error(MODULE_ID, 'Rerank 失败', e);
        }

        // 降级：返回原顺序，分数均匀分布
        return {
            results: documents.slice(0, topN).map((_, i) => ({
                index: i,
                relevance_score: 0,
            })),
            failed: true,
        };
    }
}

/**
 * 对 chunk 对象列表进行 Rerank
 * 
 * @param {string} query - 查询文本
 * @param {Array<object>} chunks - chunk 对象列表，需要有 text 字段
 * @param {object} options - 选项
 * @returns {Promise<Array<object>>} 排序后的 chunk 列表，带 _rerankScore 字段
 */
export async function rerankChunks(query, chunks, options = {}) {
    const { topN = 40, minScore = 0.1 } = options;

    if (!chunks?.length) return [];

    const texts = chunks.map(c => c.text || c.semantic || '');

    // ─── 单批：直接调用 ───
    if (texts.length <= RERANK_BATCH_SIZE) {
        const { results, failed } = await rerank(query, texts, {
            topN: Math.min(topN, texts.length),
            timeout: options.timeout,
            signal: options.signal,
        });

        if (failed) {
            return chunks.map(c => ({ ...c, _rerankScore: 0, _rerankFailed: true }));
        }

        return results
            .filter(r => r.relevance_score >= minScore)
            .sort((a, b) => b.relevance_score - a.relevance_score)
            .slice(0, topN)
            .map(r => ({
                ...chunks[r.index],
                _rerankScore: r.relevance_score,
            }));
    }

    // ─── 多批：拆分 → 并发 → 合并 ───
    const batches = [];
    for (let i = 0; i < texts.length; i += RERANK_BATCH_SIZE) {
        batches.push({
            texts: texts.slice(i, i + RERANK_BATCH_SIZE),
            offset: i,
        });
    }

    const concurrency = Math.min(batches.length, RERANK_MAX_CONCURRENCY);
    xbLog.info(MODULE_ID, `并发 Rerank: ${batches.length} 批 × ≤${RERANK_BATCH_SIZE} docs, concurrency=${concurrency}`);

    const batchResults = new Array(batches.length);
    let failedBatches = 0;

    const runBatch = async (batchIdx) => {
        const batch = batches[batchIdx];
        const { results, failed } = await rerank(query, batch.texts, {
            topN: batch.texts.length,
            timeout: options.timeout,
            signal: options.signal,
        });

        if (failed) {
            failedBatches++;
            // 单批降级：保留原始顺序，score=0
            batchResults[batchIdx] = batch.texts.map((_, i) => ({
                globalIndex: batch.offset + i,
                relevance_score: 0,
                _batchFailed: true,
            }));
        } else {
            batchResults[batchIdx] = results.map(r => ({
                globalIndex: batch.offset + r.index,
                relevance_score: r.relevance_score,
            }));
        }
    };

    // 并发池
    let nextIdx = 0;
    const worker = async () => {
        while (nextIdx < batches.length) {
            const idx = nextIdx++;
            await runBatch(idx);
        }
    };
    await Promise.all(Array.from({ length: concurrency }, () => worker()));

    // 全部失败 → 整体降级
    if (failedBatches === batches.length) {
        xbLog.warn(MODULE_ID, `全部 ${batches.length} 批 rerank 失败，整体降级`);
        return chunks.slice(0, topN).map(c => ({
            ...c,
            _rerankScore: 0,
            _rerankFailed: true,
        }));
    }

    // 合并所有批次结果
    const merged = batchResults.flat();

    const selected = merged
        .filter(r => r._batchFailed || r.relevance_score >= minScore)
        .sort((a, b) => b.relevance_score - a.relevance_score)
        .slice(0, topN)
        .map(r => ({
            ...chunks[r.globalIndex],
            _rerankScore: r.relevance_score,
            ...(r._batchFailed ? { _rerankFailed: true } : {}),
        }));

    xbLog.info(MODULE_ID,
        `Rerank 合并: ${merged.length} candidates, ${failedBatches}/${batches.length} 批失败, 选中 ${selected.length}`
    );

    return selected;
}
/**
 * 测试 Rerank 服务连接
 */
export async function testRerankService() {
    const key = getApiKey();
    if (!key) {
        throw new Error('请配置硅基 API Key');
    }

    try {
        const { results } = await rerank('测试查询', ['测试文档1', '测试文档2'], { topN: 2 });
        return { 
            success: true, 
            message: `连接成功，返回 ${results.length} 个结果`,
        };
    } catch (e) {
        throw new Error(`连接失败: ${e.message}`);
    }
}
