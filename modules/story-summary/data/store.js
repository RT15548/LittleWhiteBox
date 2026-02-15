// Story Summary - Store
// L2 (events/characters/arcs) + L3 (facts) 统一存储

import { getContext, saveMetadataDebounced } from "../../../../../../extensions.js";
import { chat_metadata } from "../../../../../../../script.js";
import { EXT_ID } from "../../../core/constants.js";
import { xbLog } from "../../../core/debug-core.js";
import { clearEventVectors, deleteEventVectorsByIds } from "../vector/storage/chunk-store.js";

const MODULE_ID = 'summaryStore';
const FACTS_LIMIT_PER_SUBJECT = 10;

// ═══════════════════════════════════════════════════════════════════════════
// 基础存取
// ═══════════════════════════════════════════════════════════════════════════

export function getSummaryStore() {
    const { chatId } = getContext();
    if (!chatId) return null;
    chat_metadata.extensions ||= {};
    chat_metadata.extensions[EXT_ID] ||= {};
    chat_metadata.extensions[EXT_ID].storySummary ||= {};

    const store = chat_metadata.extensions[EXT_ID].storySummary;

    // ★ 自动迁移旧数据
    if (store.json && !store.json.facts) {
        const hasOldData = store.json.world?.length || store.json.characters?.relationships?.length;
        if (hasOldData) {
            store.json.facts = migrateToFacts(store.json);
            // 删除旧字段
            delete store.json.world;
            if (store.json.characters) {
                delete store.json.characters.relationships;
            }
            store.updatedAt = Date.now();
            saveSummaryStore();
            xbLog.info(MODULE_ID, `自动迁移完成: ${store.json.facts.length} 条 facts`);
        }
    }

    return store;
}

export function saveSummaryStore() {
    saveMetadataDebounced?.();
}

export function getKeepVisibleCount() {
    const store = getSummaryStore();
    return store?.keepVisibleCount ?? 3;
}

export function calcHideRange(boundary) {
    if (boundary == null || boundary < 0) return null;

    const keepCount = getKeepVisibleCount();
    const hideEnd = boundary - keepCount;
    if (hideEnd < 0) return null;
    return { start: 0, end: hideEnd };
}

export function addSummarySnapshot(store, endMesId) {
    store.summaryHistory ||= [];
    store.summaryHistory.push({ endMesId });
}

// ═══════════════════════════════════════════════════════════════════════════
// Fact 工具函数
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 判断是否为关系类 fact
 */
export function isRelationFact(f) {
    return /^对.+的/.test(f.p);
}

// ═══════════════════════════════════════════════════════════════════════════
// 从 facts 提取关系（供关系图 UI 使用）
// ═══════════════════════════════════════════════════════════════════════════

export function extractRelationshipsFromFacts(facts) {
    return (facts || [])
        .filter(f => !f.retracted && isRelationFact(f))
        .map(f => {
            const match = f.p.match(/^对(.+)的/);
            const to = match ? match[1] : '';
            if (!to) return null;
            return {
                from: f.s,
                to,
                label: f.o,
                trend: f.trend || '陌生',
            };
        })
        .filter(Boolean);
}

/**
 * 生成 fact 的唯一键（s + p）
 */
function factKey(f) {
    return `${f.s}::${f.p}`;
}

/**
 * 生成下一个 fact ID
 */
function getNextFactId(existingFacts) {
    let maxId = 0;
    for (const f of existingFacts || []) {
        const match = f.id?.match(/^f-(\d+)$/);
        if (match) {
            maxId = Math.max(maxId, parseInt(match[1], 10));
        }
    }
    return maxId + 1;
}

// ═══════════════════════════════════════════════════════════════════════════
// Facts 合并（KV 覆盖模型）
// ═══════════════════════════════════════════════════════════════════════════

export function mergeFacts(existingFacts, updates, floor) {
    const map = new Map();

    for (const f of existingFacts || []) {
        if (!f.retracted) {
            map.set(factKey(f), f);
        }
    }

    let nextId = getNextFactId(existingFacts);

    for (const u of updates || []) {
        if (!u.s || !u.p) continue;

        const key = factKey(u);

        if (u.retracted === true) {
            map.delete(key);
            continue;
        }

        if (!u.o || !String(u.o).trim()) continue;

        const existing = map.get(key);
        const newFact = {
            id: existing?.id || `f-${nextId++}`,
            s: u.s.trim(),
            p: u.p.trim(),
            o: String(u.o).trim(),
            since: floor,
            _isState: existing?._isState ?? !!u.isState,
        };

        if (isRelationFact(newFact) && u.trend) {
            newFact.trend = u.trend;
        }

        if (existing?._addedAt != null) {
            newFact._addedAt = existing._addedAt;
        } else {
            newFact._addedAt = floor;
        }

        map.set(key, newFact);
    }

    const factsBySubject = new Map();
    for (const f of map.values()) {
        if (f._isState) continue;
        const arr = factsBySubject.get(f.s) || [];
        arr.push(f);
        factsBySubject.set(f.s, arr);
    }

    const toRemove = new Set();
    for (const arr of factsBySubject.values()) {
        if (arr.length > FACTS_LIMIT_PER_SUBJECT) {
            arr.sort((a, b) => (a._addedAt || 0) - (b._addedAt || 0));
            for (let i = 0; i < arr.length - FACTS_LIMIT_PER_SUBJECT; i++) {
                toRemove.add(factKey(arr[i]));
            }
        }
    }

    return Array.from(map.values()).filter(f => !toRemove.has(factKey(f)));
}


// ═══════════════════════════════════════════════════════════════════════════
// 旧数据迁移
// ═══════════════════════════════════════════════════════════════════════════

export function migrateToFacts(json) {
    if (!json) return [];

    // 已有 facts 则跳过迁移
    if (json.facts?.length) return json.facts;

    const facts = [];
    let nextId = 1;

    // 迁移 world（worldUpdate 的持久化结果）
    for (const w of json.world || []) {
        if (!w.category || !w.topic || !w.content) continue;

        let s, p;

        // 解析 topic 格式：status/knowledge/relation 用 "::" 分隔
        if (w.topic.includes('::')) {
            [s, p] = w.topic.split('::').map(x => x.trim());
        } else {
            // inventory/rule 类
            s = w.topic.trim();
            p = w.category;
        }

        if (!s || !p) continue;

        facts.push({
            id: `f-${nextId++}`,
            s,
            p,
            o: w.content.trim(),
            since: w.floor ?? w._addedAt ?? 0,
            _addedAt: w._addedAt ?? w.floor ?? 0,
        });
    }

    // 迁移 relationships
    for (const r of json.characters?.relationships || []) {
        if (!r.from || !r.to) continue;

        facts.push({
            id: `f-${nextId++}`,
            s: r.from,
            p: `对${r.to}的看法`,
            o: r.label || '未知',
            trend: r.trend,
            since: r._addedAt ?? 0,
            _addedAt: r._addedAt ?? 0,
        });
    }

    return facts;
}

// ═══════════════════════════════════════════════════════════════════════════
// 数据合并（L2 + L3）
// ═══════════════════════════════════════════════════════════════════════════

export function mergeNewData(oldJson, parsed, endMesId) {
    const merged = structuredClone(oldJson || {});

    // L2 初始化
    merged.keywords ||= [];
    merged.events ||= [];
    merged.characters ||= {};
    merged.characters.main ||= [];
    merged.arcs ||= [];

    // L3 初始化（不再迁移，getSummaryStore 已处理）
    merged.facts ||= [];

    // L2 数据合并
    if (parsed.keywords?.length) {
        merged.keywords = parsed.keywords.map(k => ({ ...k, _addedAt: endMesId }));
    }

    (parsed.events || []).forEach(e => {
        e._addedAt = endMesId;
        merged.events.push(e);
    });

    // newCharacters
    const existingMain = new Set(
        (merged.characters.main || []).map(m => typeof m === 'string' ? m : m.name)
    );
    (parsed.newCharacters || []).forEach(name => {
        if (!existingMain.has(name)) {
            merged.characters.main.push({ name, _addedAt: endMesId });
        }
    });

    // arcUpdates
    const arcMap = new Map((merged.arcs || []).map(a => [a.name, a]));
    (parsed.arcUpdates || []).forEach(update => {
        const existing = arcMap.get(update.name);
        if (existing) {
            existing.trajectory = update.trajectory;
            existing.progress = update.progress;
            if (update.newMoment) {
                existing.moments = existing.moments || [];
                existing.moments.push({ text: update.newMoment, _addedAt: endMesId });
            }
        } else {
            arcMap.set(update.name, {
                name: update.name,
                trajectory: update.trajectory,
                progress: update.progress,
                moments: update.newMoment ? [{ text: update.newMoment, _addedAt: endMesId }] : [],
                _addedAt: endMesId,
            });
        }
    });
    merged.arcs = Array.from(arcMap.values());

    // L3 factUpdates 合并
    merged.facts = mergeFacts(merged.facts, parsed.factUpdates || [], endMesId);

    return merged;
}

// ═══════════════════════════════════════════════════════════════════════════
// 回滚
// ═══════════════════════════════════════════════════════════════════════════

export async function rollbackSummaryIfNeeded() {
    const { chat, chatId } = getContext();
    const currentLength = Array.isArray(chat) ? chat.length : 0;
    const store = getSummaryStore();

    if (!store || store.lastSummarizedMesId == null || store.lastSummarizedMesId < 0) {
        return false;
    }

    const lastSummarized = store.lastSummarizedMesId;

    if (currentLength <= lastSummarized) {
        const deletedCount = lastSummarized + 1 - currentLength;

        if (deletedCount < 2) {
            return false;
        }

        xbLog.warn(MODULE_ID, `删除已总结楼层 ${deletedCount} 条，触发回滚`);

        const history = store.summaryHistory || [];
        let targetEndMesId = -1;

        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].endMesId < currentLength) {
                targetEndMesId = history[i].endMesId;
                break;
            }
        }

        await executeRollback(chatId, store, targetEndMesId, currentLength);
        return true;
    }

    return false;
}

export async function executeRollback(chatId, store, targetEndMesId, currentLength) {
    const oldEvents = store.json?.events || [];

    if (targetEndMesId < 0) {
        store.lastSummarizedMesId = -1;
        store.json = null;
        store.summaryHistory = [];
        store.hideSummarizedHistory = false;

        await clearEventVectors(chatId);

    } else {
        const deletedEventIds = oldEvents
            .filter(e => (e._addedAt ?? 0) > targetEndMesId)
            .map(e => e.id);

        const json = store.json || {};

        // L2 回滚
        json.events = (json.events || []).filter(e => (e._addedAt ?? 0) <= targetEndMesId);
        json.keywords = (json.keywords || []).filter(k => (k._addedAt ?? 0) <= targetEndMesId);
        json.arcs = (json.arcs || []).filter(a => (a._addedAt ?? 0) <= targetEndMesId);
        json.arcs.forEach(a => {
            a.moments = (a.moments || []).filter(m =>
                typeof m === 'string' || (m._addedAt ?? 0) <= targetEndMesId
            );
        });

        if (json.characters) {
            json.characters.main = (json.characters.main || []).filter(m =>
                typeof m === 'string' || (m._addedAt ?? 0) <= targetEndMesId
            );
        }

        // L3 facts 回滚
        json.facts = (json.facts || []).filter(f => (f._addedAt ?? 0) <= targetEndMesId);

        store.json = json;
        store.lastSummarizedMesId = targetEndMesId;
        store.summaryHistory = (store.summaryHistory || []).filter(h => h.endMesId <= targetEndMesId);

        if (deletedEventIds.length > 0) {
            await deleteEventVectorsByIds(chatId, deletedEventIds);
            xbLog.info(MODULE_ID, `回滚删除 ${deletedEventIds.length} 个事件向量`);
        }
    }

    store.updatedAt = Date.now();
    saveSummaryStore();

    xbLog.info(MODULE_ID, `回滚完成，目标楼层: ${targetEndMesId}`);
}

export async function clearSummaryData(chatId) {
    const store = getSummaryStore();
    if (store) {
        delete store.json;
        store.lastSummarizedMesId = -1;
        store.updatedAt = Date.now();
        saveSummaryStore();
    }

    if (chatId) {
        await clearEventVectors(chatId);
    }


    xbLog.info(MODULE_ID, '总结数据已清空');
}

// ═══════════════════════════════════════════════════════════════════════════
// L3 数据读取（供 prompt.js / recall.js 使用）
// ═══════════════════════════════════════════════════════════════════════════

export function getFacts() {
    const store = getSummaryStore();
    return (store?.json?.facts || []).filter(f => !f.retracted);
}

export function getNewCharacters() {
    const store = getSummaryStore();
    return (store?.json?.characters?.main || []).map(m =>
        typeof m === 'string' ? m : m.name
    );
}
