// ═══════════════════════════════════════════════════════════════════════════
// lexical-index.js - MiniSearch 词法检索索引
//
// 职责：
// 1. 对 L0 atoms + L1 chunks + L2 events 建立词法索引
// 2. 提供词法检索接口（专名精确匹配兜底）
// 3. 惰性构建 + 异步预热 + 缓存失效机制
//
// 索引存储：纯内存（不持久化）
// 分词器：统一使用 tokenizer.js（结巴 + 实体保护 + 降级）
// 重建时机：CHAT_CHANGED / L0提取完成 / L2总结完成
// ═══════════════════════════════════════════════════════════════════════════

import MiniSearch from '../../../../libs/minisearch.mjs';
import { getContext } from '../../../../../../../extensions.js';
import { getSummaryStore } from '../../data/store.js';
import { getAllChunks } from '../storage/chunk-store.js';
import { xbLog } from '../../../../core/debug-core.js';
import { tokenizeForIndex } from '../utils/tokenizer.js';

const MODULE_ID = 'lexical-index';

// ─────────────────────────────────────────────────────────────────────────
// 缓存
// ─────────────────────────────────────────────────────────────────────────

/** @type {MiniSearch|null} */
let cachedIndex = null;

/** @type {string|null} */
let cachedChatId = null;

/** @type {string|null} 数据指纹（atoms + chunks + events 数量） */
let cachedFingerprint = null;

/** @type {boolean} 是否正在构建 */
let building = false;

/** @type {Promise<MiniSearch|null>|null} 当前构建 Promise（防重入） */
let buildPromise = null;
/** @type {Map<number, string[]>} floor → 该楼层的 doc IDs（仅 L1 chunks） */
let floorDocIds = new Map();

// ─────────────────────────────────────────────────────────────────────────
// 工具函数
// ─────────────────────────────────────────────────────────────────────────

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
 * 计算缓存指纹
 * @param {number} chunkCount
 * @param {number} eventCount
 * @returns {string}
 */
function computeFingerprint(chunkCount, eventCount) {
    return `${chunkCount}:${eventCount}`;
}

/**
 * 让出主线程（避免长时间阻塞 UI）
 * @returns {Promise<void>}
 */
function yieldToMain() {
    return new Promise(resolve => setTimeout(resolve, 0));
}

// ─────────────────────────────────────────────────────────────────────────
// 文档收集
// ─────────────────────────────────────────────────────────────────────────

/**
 * 收集所有待索引文档
 *
 * @param {object[]} chunks - getAllChunks(chatId) 返回值
 * @param {object[]} events - store.json.events
 * @returns {object[]} 文档数组
 */
function collectDocuments(chunks, events) {
    const docs = [];

    // L1 chunks + 填充 floorDocIds
    for (const chunk of (chunks || [])) {
        if (!chunk?.chunkId || !chunk.text) continue;

        const floor = chunk.floor ?? -1;
        docs.push({
            id: chunk.chunkId,
            type: 'chunk',
            floor,
            text: chunk.text,
        });

        if (floor >= 0) {
            if (!floorDocIds.has(floor)) {
                floorDocIds.set(floor, []);
            }
            floorDocIds.get(floor).push(chunk.chunkId);
        }
    }

    // L2 events
    for (const ev of (events || [])) {
        if (!ev?.id) continue;
        const parts = [];
        if (ev.title) parts.push(ev.title);
        if (ev.participants?.length) parts.push(ev.participants.join(' '));
        const summary = cleanSummary(ev.summary);
        if (summary) parts.push(summary);
        const text = parts.join(' ').trim();
        if (!text) continue;

        docs.push({
            id: ev.id,
            type: 'event',
            floor: null,
            text,
        });
    }

    return docs;
}

// ─────────────────────────────────────────────────────────────────────────
// 索引构建（分片，不阻塞主线程）
// ─────────────────────────────────────────────────────────────────────────

/** 每批添加的文档数 */
const BUILD_BATCH_SIZE = 500;

/**
 * 构建 MiniSearch 索引（分片异步）
 *
 * @param {object[]} docs - 文档数组
 * @returns {Promise<MiniSearch>}
 */
async function buildIndexAsync(docs) {
    const T0 = performance.now();

    const index = new MiniSearch({
        fields: ['text'],
        storeFields: ['type', 'floor'],
        idField: 'id',
        searchOptions: {
            boost: { text: 1 },
            fuzzy: 0.2,
            prefix: true,
        },
        tokenize: tokenizeForIndex,
    });

    if (!docs.length) {
        return index;
    }

    // 分片添加，每批 BUILD_BATCH_SIZE 条后让出主线程
    for (let i = 0; i < docs.length; i += BUILD_BATCH_SIZE) {
        const batch = docs.slice(i, i + BUILD_BATCH_SIZE);
        index.addAll(batch);

        // 非最后一批时让出主线程
        if (i + BUILD_BATCH_SIZE < docs.length) {
            await yieldToMain();
        }
    }

    const elapsed = Math.round(performance.now() - T0);
    xbLog.info(MODULE_ID,
        `索引构建完成: ${docs.length} 文档 (${elapsed}ms)`
    );

    return index;
}

// ─────────────────────────────────────────────────────────────────────────
// 检索
// ─────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} LexicalSearchResult
 * @property {string[]} atomIds    - 命中的 L0 atom IDs
 * @property {Set<number>} atomFloors - 命中的 L0 楼层集合
 * @property {string[]} chunkIds   - 命中的 L1 chunk IDs
 * @property {Set<number>} chunkFloors - 命中的 L1 楼层集合
 * @property {string[]} eventIds   - 命中的 L2 event IDs
 * @property {object[]} chunkScores - chunk 命中详情 [{ chunkId, score }]
 * @property {number}   searchTime - 检索耗时 ms
 */

/**
 * 在词法索引中检索
 *
 * @param {MiniSearch} index - 索引实例
 * @param {string[]} terms - 查询词列表
 * @returns {LexicalSearchResult}
 */
export function searchLexicalIndex(index, terms) {
    const T0 = performance.now();

    const result = {
        atomIds: [],
        atomFloors: new Set(),
        chunkIds: [],
        chunkFloors: new Set(),
        eventIds: [],
        chunkScores: [],
        searchTime: 0,
    };

    if (!index || !terms?.length) {
        result.searchTime = Math.round(performance.now() - T0);
        return result;
    }

    // 用所有 terms 联合查询
    const queryString = terms.join(' ');

    let hits;
    try {
        hits = index.search(queryString, {
            boost: { text: 1 },
            fuzzy: 0.2,
            prefix: true,
            combineWith: 'OR',
            // 使用与索引相同的分词器
            tokenize: tokenizeForIndex,
        });
    } catch (e) {
        xbLog.warn(MODULE_ID, '检索失败', e);
        result.searchTime = Math.round(performance.now() - T0);
        return result;
    }

    // 分类结果
    const chunkIdSet = new Set();
    const eventIdSet = new Set();

    for (const hit of hits) {
        const type = hit.type;
        const id = hit.id;
        const floor = hit.floor;

        switch (type) {
            case 'chunk':
                if (!chunkIdSet.has(id)) {
                    chunkIdSet.add(id);
                    result.chunkIds.push(id);
                    result.chunkScores.push({ chunkId: id, score: hit.score });
                    if (typeof floor === 'number' && floor >= 0) {
                        result.chunkFloors.add(floor);
                    }
                }
                break;

            case 'event':
                if (!eventIdSet.has(id)) {
                    eventIdSet.add(id);
                    result.eventIds.push(id);
                }
                break;
        }
    }

    result.searchTime = Math.round(performance.now() - T0);

    xbLog.info(MODULE_ID,
        `检索完成: terms=[${terms.slice(0, 5).join(',')}] → atoms=${result.atomIds.length} chunks=${result.chunkIds.length} events=${result.eventIds.length} (${result.searchTime}ms)`
    );

    return result;
}

// ─────────────────────────────────────────────────────────────────────────
// 内部构建流程（收集数据 + 构建索引）
// ─────────────────────────────────────────────────────────────────────────

/**
 * 收集数据并构建索引
 *
 * @param {string} chatId
 * @returns {Promise<{index: MiniSearch, fingerprint: string}>}
 */
async function collectAndBuild(chatId) {
    // 清空侧索引（全量重建）
    floorDocIds = new Map();

    // 收集数据（不含 L0 atoms）
    const store = getSummaryStore();
    const events = store?.json?.events || [];

    let chunks = [];
    try {
        chunks = await getAllChunks(chatId);
    } catch (e) {
        xbLog.warn(MODULE_ID, '获取 chunks 失败', e);
    }

    const fp = computeFingerprint(chunks.length, events.length);

    // 检查是否在收集过程中缓存已被其他调用更新
    if (cachedIndex && cachedChatId === chatId && cachedFingerprint === fp) {
        return { index: cachedIndex, fingerprint: fp };
    }

    // 收集文档（同时填充 floorDocIds）
    const docs = collectDocuments(chunks, events);

    // 异步分片构建
    const index = await buildIndexAsync(docs);

    return { index, fingerprint: fp };
}

// ─────────────────────────────────────────────────────────────────────────
// 公开接口：getLexicalIndex（惰性获取）
// ─────────────────────────────────────────────────────────────────────────

/**
 * 获取词法索引（惰性构建 + 缓存）
 *
 * 如果缓存有效则直接返回；否则自动构建。
 * 如果正在构建中，等待构建完成。
 *
 * @returns {Promise<MiniSearch|null>}
 */
export async function getLexicalIndex() {
    const { chatId } = getContext();
    if (!chatId) return null;

    // 快速路径：如果缓存存在且 chatId 未变，则直接命中
    // 指纹校验放到构建流程中完成，避免为指纹而额外读一次 IndexedDB
    if (cachedIndex && cachedChatId === chatId && cachedFingerprint) {
        return cachedIndex;
    }

    // 正在构建中，等待结果
    if (building && buildPromise) {
        try {
            await buildPromise;
            if (cachedIndex && cachedChatId === chatId && cachedFingerprint) {
                return cachedIndex;
            }
        } catch {
            // 构建失败，继续往下重建
        }
    }

    // 需要重建（指纹将在 collectAndBuild 内部计算并写入缓存）
    xbLog.info(MODULE_ID, `缓存失效，重建索引 (chatId=${chatId.slice(0, 8)})`);

    building = true;
    buildPromise = collectAndBuild(chatId);

    try {
        const { index, fingerprint } = await buildPromise;

        // 原子替换缓存
        cachedIndex = index;
        cachedChatId = chatId;
        cachedFingerprint = fingerprint;

        return index;
    } catch (e) {
        xbLog.error(MODULE_ID, '索引构建失败', e);
        return null;
    } finally {
        building = false;
        buildPromise = null;
    }
}

// ─────────────────────────────────────────────────────────────────────────
// 公开接口：warmupIndex（异步预建）
// ─────────────────────────────────────────────────────────────────────────

/**
 * 异步预建索引
 *
 * 在 CHAT_CHANGED 时调用，后台构建索引。
 * 不阻塞调用方，不返回结果。
 * 构建完成后缓存自动更新，后续 getLexicalIndex() 直接命中。
 *
 * 调用时机：
 * - handleChatChanged（实体注入后）
 * - L0 提取完成
 * - L2 总结完成
 */
export function warmupIndex() {
    const { chatId } = getContext();
    if (!chatId) return;

    // 已在构建中，不重复触发
    if (building) return;

    // fire-and-forget
    getLexicalIndex().catch(e => {
        xbLog.warn(MODULE_ID, '预热索引失败', e);
    });
}

// ─────────────────────────────────────────────────────────────────────────
// 公开接口：invalidateLexicalIndex（缓存失效）
// ─────────────────────────────────────────────────────────────────────────

/**
 * 使缓存失效（下次 getLexicalIndex / warmupIndex 时自动重建）
 *
 * 调用时机：
 * - CHAT_CHANGED
 * - L0 提取完成
 * - L2 总结完成
 */
export function invalidateLexicalIndex() {
    if (cachedIndex) {
        xbLog.info(MODULE_ID, '索引缓存已失效');
    }
    cachedIndex = null;
    cachedChatId = null;
    cachedFingerprint = null;
    floorDocIds = new Map();
}

// ─────────────────────────────────────────────────────────────────────────
// 增量更新接口
// ─────────────────────────────────────────────────────────────────────────

/**
 * 为指定楼层添加 L1 chunks 到索引
 *
 * 先移除该楼层旧文档，再添加新文档。
 * 如果索引不存在（缓存失效），静默跳过（下次 getLexicalIndex 全量重建）。
 *
 * @param {number} floor - 楼层号
 * @param {object[]} chunks - chunk 对象列表（需有 chunkId、text、floor）
 */
export function addDocumentsForFloor(floor, chunks) {
    if (!cachedIndex || !chunks?.length) return;

    // 先移除旧文档
    removeDocumentsByFloor(floor);

    const docs = [];
    const docIds = [];

    for (const chunk of chunks) {
        if (!chunk?.chunkId || !chunk.text) continue;
        docs.push({
            id: chunk.chunkId,
            type: 'chunk',
            floor: chunk.floor ?? floor,
            text: chunk.text,
        });
        docIds.push(chunk.chunkId);
    }

    if (docs.length > 0) {
        cachedIndex.addAll(docs);
        floorDocIds.set(floor, docIds);
        xbLog.info(MODULE_ID, `增量添加: floor ${floor}, ${docs.length} 个 chunk`);
    }
}

/**
 * 从索引中移除指定楼层的所有 L1 chunk 文档
 *
 * 使用 MiniSearch discard()（软删除）。
 * 如果索引不存在，静默跳过。
 *
 * @param {number} floor - 楼层号
 */
export function removeDocumentsByFloor(floor) {
    if (!cachedIndex) return;

    const docIds = floorDocIds.get(floor);
    if (!docIds?.length) return;

    for (const id of docIds) {
        try {
            cachedIndex.discard(id);
        } catch {
            // 文档可能不存在（已被全量重建替换）
        }
    }

    floorDocIds.delete(floor);
    xbLog.info(MODULE_ID, `增量移除: floor ${floor}, ${docIds.length} 个文档`);
}

/**
 * 将新 L2 事件添加到索引
 *
 * 如果事件 ID 已存在，先 discard 再 add（覆盖）。
 * 如果索引不存在，静默跳过。
 *
 * @param {object[]} events - 事件对象列表（需有 id、title、summary 等）
 */
export function addEventDocuments(events) {
    if (!cachedIndex || !events?.length) return;

    const docs = [];

    for (const ev of events) {
        if (!ev?.id) continue;

        const parts = [];
        if (ev.title) parts.push(ev.title);
        if (ev.participants?.length) parts.push(ev.participants.join(' '));
        const summary = cleanSummary(ev.summary);
        if (summary) parts.push(summary);
        const text = parts.join(' ').trim();
        if (!text) continue;

        // 覆盖：先尝试移除旧的
        try {
            cachedIndex.discard(ev.id);
        } catch {
            // 不存在则忽略
        }

        docs.push({
            id: ev.id,
            type: 'event',
            floor: null,
            text,
        });
    }

    if (docs.length > 0) {
        cachedIndex.addAll(docs);
        xbLog.info(MODULE_ID, `增量添加: ${docs.length} 个事件`);
    }
}
