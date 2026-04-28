// Story Summary - Store
// L2 (events/characters/arcs) + L3 (facts) 统一存储

import { getContext, saveMetadataDebounced } from "../../../../../../extensions.js";
import { chat_metadata } from "../../../../../../../script.js";
import { EXT_ID } from "../../../core/constants.js";
import { xbLog } from "../../../core/debug-core.js";
import { clearEventVectors, deleteEventVectorsByIds } from "../vector/storage/chunk-store.js";

const MODULE_ID = 'summaryStore';
const FACTS_LIMIT_PER_SUBJECT = 10;

function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeStringArray(value) {
    if (!Array.isArray(value)) {
        return { value: [], changed: value != null };
    }

    const next = [];
    let changed = false;
    for (const item of value) {
        let text = '';
        if (typeof item === 'string') {
            text = item.trim();
        } else if (isPlainObject(item)) {
            // Old data may store names/ids as lightweight objects; only accept explicit text-like fields.
            text = String(item.name || item.text || item.id || '').trim();
            changed = true;
        } else if (item != null) {
            changed = true;
        }
        if (!text) {
            if (item != null) changed = true;
            continue;
        }
        next.push(text);
        if (typeof item !== 'string' || item !== text) {
            changed = true;
        }
    }

    if (!changed && next.length !== value.length) {
        changed = true;
    }

    return { value: changed ? next : value, changed };
}

function normalizeSummaryHistory(history) {
    if (!Array.isArray(history)) {
        return { value: [], changed: history != null };
    }

    const next = [];
    let changed = false;
    for (const item of history) {
        const endMesId = Number(item?.endMesId);
        if (!Number.isFinite(endMesId)) {
            changed = true;
            continue;
        }
        const normalized = { endMesId: Math.trunc(endMesId) };
        next.push(normalized);
        if (!isPlainObject(item) || item.endMesId !== normalized.endMesId) {
            changed = true;
        }
    }

    if (!changed && next.length !== history.length) {
        changed = true;
    }

    return { value: changed ? next : history, changed };
}

function normalizeSummaryJson(json) {
    if (json == null) {
        return { value: null, changed: false };
    }

    if (!isPlainObject(json)) {
        return {
            value: {
                keywords: [],
                events: [],
                characters: { main: [] },
                arcs: [],
                facts: [],
            },
            changed: true,
        };
    }

    let changed = false;
    const next = json;

    const normalizedKeywords = Array.isArray(next.keywords)
        ? next.keywords.filter(isPlainObject)
        : [];
    if (!Array.isArray(next.keywords) || normalizedKeywords.length !== next.keywords.length) {
        next.keywords = normalizedKeywords;
        changed = true;
    }

    if (!Array.isArray(next.events)) {
        next.events = [];
        changed = true;
    } else {
        const events = [];
        for (const event of next.events) {
            if (!isPlainObject(event)) {
                changed = true;
                continue;
            }

            let normalizedEvent = event;

            const participants = normalizeStringArray(event.participants);
            if (participants.changed) {
                normalizedEvent = normalizedEvent === event ? { ...event } : normalizedEvent;
                normalizedEvent.participants = participants.value;
                changed = true;
            }

            const causedBy = normalizeStringArray(event.causedBy);
            if (causedBy.changed) {
                normalizedEvent = normalizedEvent === event ? { ...event } : normalizedEvent;
                normalizedEvent.causedBy = causedBy.value;
                changed = true;
            }

            events.push(normalizedEvent);
        }

        if (events.length !== next.events.length) {
            changed = true;
        }
        if (changed) {
            next.events = events;
        }
    }

    if (!isPlainObject(next.characters)) {
        next.characters = { main: [] };
        changed = true;
    } else if (!Array.isArray(next.characters.main)) {
        next.characters.main = [];
        changed = true;
    } else {
        const main = next.characters.main.filter(item => typeof item === 'string' || isPlainObject(item));
        if (main.length !== next.characters.main.length) {
            next.characters.main = main;
            changed = true;
        }
    }

    if (!Array.isArray(next.arcs)) {
        next.arcs = [];
        changed = true;
    } else {
        const arcs = [];
        for (const arc of next.arcs) {
            if (!isPlainObject(arc)) {
                changed = true;
                continue;
            }

            const moments = Array.isArray(arc.moments)
                ? arc.moments.filter(item => typeof item === 'string' || isPlainObject(item))
                : [];

            if (!Array.isArray(arc.moments) || moments.length !== arc.moments.length) {
                arcs.push({ ...arc, moments });
                changed = true;
                continue;
            }

            arcs.push(arc);
        }

        if (arcs.length !== next.arcs.length) {
            changed = true;
        }
        if (changed) {
            next.arcs = arcs;
        }
    }

    if (!Array.isArray(next.facts)) {
        const hasOldData = next.world?.length || next.characters?.relationships?.length;
        if (hasOldData) {
            next.facts = migrateToFacts(next);
            delete next.world;
            delete next.characters.relationships;
        } else {
            next.facts = [];
        }
        changed = true;
    } else {
        const facts = next.facts.filter(isPlainObject);
        if (facts.length !== next.facts.length) {
            next.facts = facts;
            changed = true;
        }
    }

    return { value: next, changed };
}

function normalizeSummaryStore(store) {
    if (!store || !isPlainObject(store)) {
        return false;
    }

    let changed = false;

    if (store.lastSummarizedMesId != null) {
        const lastSummarizedMesId = Number(store.lastSummarizedMesId);
        if (!Number.isFinite(lastSummarizedMesId)) {
            if (store.lastSummarizedMesId !== -1) {
                store.lastSummarizedMesId = -1;
                changed = true;
            }
        } else {
            const normalizedMesId = Math.trunc(lastSummarizedMesId);
            if (store.lastSummarizedMesId !== normalizedMesId) {
                store.lastSummarizedMesId = normalizedMesId;
                changed = true;
            }
        }
    }

    const history = normalizeSummaryHistory(store.summaryHistory);
    if (history.changed) {
        store.summaryHistory = history.value;
        changed = true;
    }

    const json = normalizeSummaryJson(store.json);
    if (json.changed) {
        store.json = json.value;
        changed = true;
    }

    return changed;
}

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

    if (normalizeSummaryStore(store)) {
        store.updatedAt = Date.now();
        saveSummaryStore();
        xbLog.info(MODULE_ID, '已自动修正总结存储中的旧结构或异常字段');
    }

    return store;
}

export function saveSummaryStore() {
    saveMetadataDebounced?.();
}

export function getKeepVisibleCount() {
    const store = getSummaryStore();
    return store?.keepVisibleCount ?? 6;
}

export function calcHideRange(boundary, keepCountOverride = null) {
    if (boundary == null || boundary < 0) return null;

    const keepCount = Number.isFinite(keepCountOverride)
        ? Math.max(0, Math.min(50, Number(keepCountOverride)))
        : getKeepVisibleCount();
    const hideEnd = boundary - keepCount;
    if (hideEnd < 0) return null;
    return { start: 0, end: hideEnd };
}

export function addSummarySnapshot(store, endMesId) {
    store.summaryHistory ||= [];
    store.summaryHistory.push({ endMesId });
}

export function getRollbackOnceTargetEndMesId(store) {
    const currentEndMesId = Number(store?.lastSummarizedMesId);
    if (!Number.isFinite(currentEndMesId) || currentEndMesId < 0) {
        return null;
    }

    const history = Array.isArray(store?.summaryHistory) ? store.summaryHistory : [];
    for (let i = history.length - 1; i >= 0; i--) {
        const candidate = Number(history[i]?.endMesId);
        if (!Number.isFinite(candidate)) continue;
        if (candidate < currentEndMesId) {
            return Math.trunc(candidate);
        }
    }

    return -1;
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

function normalizeCharacterNameKey(name) {
    return String(name || '').trim().toLowerCase();
}

function normalizeArcProgress(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
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
        (merged.characters.main || [])
            .map(m => normalizeCharacterNameKey(typeof m === 'string' ? m : m.name))
            .filter(Boolean)
    );
    (parsed.newCharacters || []).forEach(rawName => {
        const name = String(typeof rawName === 'string' ? rawName : rawName?.name || '').trim();
        const key = normalizeCharacterNameKey(name);
        if (!key) return;
        if (!existingMain.has(key)) {
            merged.characters.main.push({ name, _addedAt: endMesId });
            existingMain.add(key);
        }
    });

    // arcUpdates
    const arcMap = new Map(
        (merged.arcs || [])
            .map(a => [normalizeCharacterNameKey(a.name), a])
            .filter(([key]) => key)
    );
    (parsed.arcUpdates || []).forEach(update => {
        const name = String(update?.name || '').trim();
        if (!name) return;
        const key = normalizeCharacterNameKey(name);
        const existing = arcMap.get(key);
        const progress = normalizeArcProgress(update.progress);
        if (existing) {
            existing.trajectory = update.trajectory;
            existing.progress = progress;
            if (update.newMoment) {
                existing.moments = existing.moments || [];
                existing.moments.push({ text: update.newMoment, _addedAt: endMesId });
            }
        } else {
            arcMap.set(key, {
                name,
                trajectory: update.trajectory,
                progress,
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

export async function rollbackSummaryOnce(chatId) {
    const store = getSummaryStore();
    if (!store) {
        return { success: false, reason: 'store_unavailable', targetEndMesId: null, clearedAll: false };
    }

    const targetEndMesId = getRollbackOnceTargetEndMesId(store);
    if (targetEndMesId == null) {
        return { success: false, reason: 'rollback_unavailable', targetEndMesId: null, clearedAll: false };
    }

    await executeRollback(chatId, store, targetEndMesId);
    return {
        success: true,
        targetEndMesId,
        clearedAll: targetEndMesId < 0,
    };
}

export async function clearSummaryData(chatId) {
    const store = getSummaryStore();
    if (store) {
        delete store.json;
        store.lastSummarizedMesId = -1;
        store.summaryHistory = [];
        store.hideSummarizedHistory = false;
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
