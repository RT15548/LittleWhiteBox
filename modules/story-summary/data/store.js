// Story Summary - Store
// L2 (events/characters/arcs) + L3 (world) 统一存储

import { getContext, saveMetadataDebounced } from "../../../../../../extensions.js";
import { chat_metadata } from "../../../../../../../script.js";
import { EXT_ID } from "../../../core/constants.js";
import { xbLog } from "../../../core/debug-core.js";
import { clearEventVectors, deleteEventVectorsByIds } from "../vector/chunk-store.js";
import { clearEventTextIndex } from '../vector/text-search.js';

const MODULE_ID = 'summaryStore';

// ═══════════════════════════════════════════════════════════════════════════
// 基础存取
// ═══════════════════════════════════════════════════════════════════════════

export function getSummaryStore() {
    const { chatId } = getContext();
    if (!chatId) return null;
    chat_metadata.extensions ||= {};
    chat_metadata.extensions[EXT_ID] ||= {};
    chat_metadata.extensions[EXT_ID].storySummary ||= {};
    return chat_metadata.extensions[EXT_ID].storySummary;
}

export function saveSummaryStore() {
    saveMetadataDebounced?.();
}

export function getKeepVisibleCount() {
    const store = getSummaryStore();
    return store?.keepVisibleCount ?? 3;
}

// boundary：隐藏边界（由调用方决定语义：LLM总结边界 or 向量边界）
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
// L3 世界状态合并
// ═══════════════════════════════════════════════════════════════════════════

export function mergeWorldState(existingList, updates, floor) {
    const map = new Map();

    (existingList || []).forEach(item => {
        const key = `${item.category}:${item.topic}`;
        map.set(key, item);
    });

    (updates || []).forEach(up => {
        if (!up.category || !up.topic) return;

        const key = `${up.category}:${up.topic}`;

        if (up.cleared === true) {
            map.delete(key);
            return;
        }

        const content = up.content?.trim();
        if (!content) return;

        map.set(key, {
            category: up.category,
            topic: up.topic,
            content: content,
            floor: floor,
            _addedAt: floor,
        });
    });

    return Array.from(map.values());
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
    merged.characters.relationships ||= [];
    merged.arcs ||= [];

    // L3 初始化
    merged.world ||= [];

    // L2 数据合并
    if (parsed.keywords?.length) {
        merged.keywords = parsed.keywords.map(k => ({ ...k, _addedAt: endMesId }));
    }

    (parsed.events || []).forEach(e => {
        e._addedAt = endMesId;
        merged.events.push(e);
    });

    const existingMain = new Set(
        (merged.characters.main || []).map(m => typeof m === 'string' ? m : m.name)
    );
    (parsed.newCharacters || []).forEach(name => {
        if (!existingMain.has(name)) {
            merged.characters.main.push({ name, _addedAt: endMesId });
        }
    });

    const relMap = new Map(
        (merged.characters.relationships || []).map(r => [`${r.from}->${r.to}`, r])
    );
    (parsed.newRelationships || []).forEach(r => {
        const key = `${r.from}->${r.to}`;
        const existing = relMap.get(key);
        if (existing) {
            existing.label = r.label;
            existing.trend = r.trend;
        } else {
            r._addedAt = endMesId;
            relMap.set(key, r);
        }
    });
    merged.characters.relationships = Array.from(relMap.values());

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

    // L3 世界状态合并
    merged.world = mergeWorldState(
        merged.world || [],
        parsed.worldUpdate || [],
        endMesId
    );

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
            json.characters.relationships = (json.characters.relationships || []).filter(r =>
                (r._addedAt ?? 0) <= targetEndMesId
            );
        }

        // L3 回滚
        json.world = (json.world || []).filter(w => (w._addedAt ?? 0) <= targetEndMesId);

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
    
    clearEventTextIndex();
    
    xbLog.info(MODULE_ID, '总结数据已清空');
}

// ═══════════════════════════════════════════════════════════════════════════
// L3 数据读取（供 prompt.js 使用）
// ═══════════════════════════════════════════════════════════════════════════

export function getWorldSnapshot() {
    const store = getSummaryStore();
    return store?.json?.world || [];
}
