// Story Summary - Store
// 大总结以一份 JSON 保存 events、characters、arcs、facts 等；L3 Facts 是召回时的投影名称，不是另一份总结存储。

import { getContext } from "../../../../../../extensions.js";
import { chat_metadata } from "../../../../../../../script.js";
import { EXT_ID } from "../../../core/constants.js";
import { xbLog } from "../../../core/debug-core.js";
import { clearEventVectors, deleteEventVectorsByIds } from "../vector/storage/chunk-store.js";
import {
    applyCharacterAliasUpdates,
    canonicalizeIncrementalSummaryData,
    normalizeCharacterAliases,
} from "./character-aliases.js";
import {
    applyExactSummaryHistoryUndo,
    buildSummaryUndo,
} from "./summary-undo.js";
import { isRelationFact, parseRelationTarget, factKey } from "./fact-predicates.js";
import { createFactIdAllocator } from './fact-identity.js';
import { projectSummaryEvent, normalizeEventStringArray } from "./events.js";
import { upgradeStoredEventMemoryRoles } from "./migrations/event-memory-role.js";
import { upgradeSummaryHistory, createSummaryBatch } from './summary-history.js';
export { getRollbackOnceTargetEndMesId } from './summary-history.js';
import { getRollbackOnceTargetEndMesId } from './summary-history.js';
import { maintenanceImpact, sameMemory, restoreMaintenance } from '../maintenance/domain.js';
import { deleteStateVectorsByIds, deleteStateVectorsFromFloor, deleteStateVectorsAtFloors } from '../vector/storage/state-store.js';
import { readSummaryMemory, commitSummaryMemory, getMemoryCommitState, assertMemoryWritable, rememberLoadedMemory,
    getRuntimeInvalidSourceFloor, noteInvalidMemorySource } from './memory-commit.js';
import { invalidateMemoryAnchors, invalidateMemoryAnchorsAtFloors, updateMaintainedAnchorIndex } from './anchor-invalidation.js';

const MODULE_ID = 'summaryStore';
const FACTS_LIMIT_PER_SUBJECT = 10;
const loadedEventStores = new WeakSet();

function isPlainObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeSummaryHistory(history) {
    return upgradeSummaryHistory(history);
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

            const participants = normalizeEventStringArray(event.participants);
            if (participants.changed) {
                normalizedEvent = normalizedEvent === event ? { ...event } : normalizedEvent;
                normalizedEvent.participants = participants.value;
                changed = true;
            }

            const causedBy = normalizeEventStringArray(event.causedBy);
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

    const normalizedAliases = normalizeCharacterAliases(next.characterAliases);
    if (next.characterAliases == null) {
        // Keep the optional alias table absent until it is actually needed.
    } else if (!Array.isArray(next.characterAliases)) {
        next.characterAliases = normalizedAliases;
        changed = true;
    } else if (JSON.stringify(normalizedAliases) !== JSON.stringify(next.characterAliases)) {
        next.characterAliases = normalizedAliases;
        changed = true;
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

    const pendingImportBoundary = store.pendingImportBoundary;
    if (pendingImportBoundary == null || pendingImportBoundary === false) {
        if ('pendingImportBoundary' in store) {
            delete store.pendingImportBoundary;
            changed = true;
        }
    } else if (pendingImportBoundary !== true) {
        store.pendingImportBoundary = true;
        changed = true;
    }

    // Persistent integrity state: a failed rollback must remain blocked after reload
    // until a successful rollback, clear, or import establishes a new canonical base.
    if (store.summaryInvalid !== true && 'summaryInvalid' in store) {
        delete store.summaryInvalid;
        changed = true;
    }

    const json = normalizeSummaryJson(store.json);
    if (json.changed) {
        store.json = json.value;
        changed = true;
    }

    // Alias mappings are identity vocabulary, not summary-history state.
    // Old versions persisted rollback-only migration snapshots; they no
    // longer describe any live behavior and are discarded at the upgrade edge.
    if (Object.hasOwn(store, 'aliasMigrations')) {
        delete store.aliasMigrations;
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
    rememberLoadedMemory();
    chat_metadata.extensions[EXT_ID].storySummary ||= {};

    const store = chat_metadata.extensions[EXT_ID].storySummary;
    let changed = false;
    if (!loadedEventStores.has(store)) {
        try { changed = normalizeSummaryStore(store); }
        catch (error) {
            if (!['summary_history_invalid', 'invalid_history'].includes(error.code)) throw error;
            // Malformed history stays available for export, never becomes a baseline.
            // This is real structural damage, unlike runtime-only save uncertainty.
            store.summaryInvalid = true;
            xbLog.error(MODULE_ID, 'summary_history_invalid', error);
        }
        changed = upgradeStoredEventMemoryRoles(store) || changed;
        loadedEventStores.add(store);
    }

    // One-time migration: v3.0.4 and earlier persisted this derived Ena cache.
    // Canonical story-summary data is now the only source, so the old cache is discarded.
    if (Object.hasOwn(chat_metadata, 'ena_cached_story_summary')) {
        delete chat_metadata.ena_cached_story_summary;
        changed = true;
    }

    if (changed) {
        store.updatedAt = Date.now();
        // Load conversion stays in memory until the next atomic commit. Never start an
        // unconfirmed background write while merely reading or switching chats.
        xbLog.info(MODULE_ID, '已自动修正总结存储中的旧结构或异常字段');
    }

    return store;
}

export function addSummarySnapshot(store, previousEndMesId, endMesId, undo, policy) {
    store.summaryHistory ||= [];
    store.summaryHistory.push(createSummaryBatch(previousEndMesId, endMesId, undo, policy));
}

export function isSummaryRollbackRequired(store, currentLength) {
    const lastSummarized = Number(store?.lastSummarizedMesId);
    if (!Number.isInteger(lastSummarized) || lastSummarized < 0) return false;
    const length = Math.max(0, Math.trunc(Number(currentLength) || 0));
    return length <= lastSummarized && lastSummarized + 1 - length >= 1;
}

export function isSummaryConsumable(store, currentLength) {
    return getMemoryCommitState() === 'ready' && store?.summaryInvalid !== true
        && store?.sourceInvalidFromFloor == null
        && !isSummaryRollbackRequired(store, currentLength);
}

// ═══════════════════════════════════════════════════════════════════════════
// 从 facts 提取关系（供关系图 UI 使用）
// ═══════════════════════════════════════════════════════════════════════════

export function extractRelationshipsFromFacts(facts) {
    return (facts || [])
        .filter(f => !f.retracted && isRelationFact(f))
        .map(f => {
            const to = parseRelationTarget(f.p);
            if (!to) return null;
            return {
                from: f.s,
                to,
                label: f.o,
                trend: f.trend || '',
            };
        })
        .filter(Boolean);
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

    const allocateFactId = createFactIdAllocator(existingFacts);

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
            id: existing?.id || allocateFactId(),
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
    const allocateFactId = createFactIdAllocator();

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
            id: allocateFactId(),
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
            id: allocateFactId(),
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
// 大总结数据合并
// ═══════════════════════════════════════════════════════════════════════════

export function mergeNewData(oldJson, parsed, endMesId, options = {}) {
    const beforeJson = structuredClone(oldJson || {});
    const merged = structuredClone(oldJson || {});
    const incoming = canonicalizeIncrementalSummaryData(parsed || {}, merged.characterAliases || []);

    // 初始化大总结的各部分
    merged.keywords ||= [];
    merged.events ||= [];
    merged.characters ||= {};
    merged.characters.main ||= [];
    merged.arcs ||= [];

    merged.facts ||= [];

    if (incoming.keywords?.length) {
        merged.keywords = incoming.keywords.map(k => ({ ...k, _addedAt: endMesId }));
    }

    (incoming.events || []).forEach(e => {
        merged.events.push(projectSummaryEvent({ ...e, _addedAt: endMesId }));
    });

    // newCharacters
    const existingMain = new Set(
        (merged.characters.main || [])
            .map(m => normalizeCharacterNameKey(typeof m === 'string' ? m : m.name))
            .filter(Boolean)
    );
    (incoming.newCharacters || []).forEach(rawName => {
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
    (incoming.arcUpdates || []).forEach(update => {
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

    // facts 与其他大总结字段参与同一次合并及撤销差量。
    merged.facts = mergeFacts(merged.facts, incoming.factUpdates || [], endMesId);

    const aliasResult = applyCharacterAliasUpdates(merged, incoming.characterAliasUpdates || [], endMesId);
    const undo = buildSummaryUndo(beforeJson, aliasResult.json, {
        aliasChanged: aliasResult.aliasChanged,
    });

    if (options?.returnMeta) {
        return {
            json: aliasResult.json,
            aliasChanged: aliasResult.aliasChanged,
            undo,
        };
    }

    return aliasResult.json;
}

// ═══════════════════════════════════════════════════════════════════════════
// 回滚
// ═══════════════════════════════════════════════════════════════════════════

// 删除时有效原文前缀由聊天长度决定；swipe 则从被替换楼层起失效。
export async function rollbackSummaryIfNeeded({ changedFromFloor = null, invalidateFromFloor = null, invalidateFloors = null, invalidateSourceCache = null } = {}) {
    const { chat, chatId } = getContext();
    const currentLength = Array.isArray(chat) ? chat.length : 0;
    let validPrefixLength = Number.isInteger(changedFromFloor) && changedFromFloor >= 0
        ? Math.min(currentLength, changedFromFloor) : currentLength;
    const store = getSummaryStore();
    if (store?.sourceInvalidFromFloor != null) validPrefixLength = Math.min(validPrefixLength, store.sourceInvalidFromFloor);
    if (getRuntimeInvalidSourceFloor() != null) validPrefixLength = Math.min(validPrefixLength, getRuntimeInvalidSourceFloor());
    assertMemoryWritable(chatId);
    const previous = readSummaryMemory();
    // Retire before undo, including operations whose anchors were already deleted by the Agent.
    const rollbackRequired = store && isSummaryRollbackRequired(store, validPrefixLength);
    const localEdit = invalidateFloors !== null && validPrefixLength === currentLength && changedFromFloor === null && !rollbackRequired;
    const invalidFrom = Math.min(validPrefixLength, invalidateFromFloor ?? changedFromFloor ?? currentLength, ...(invalidateFloors || []));
    let { next } = localEdit ? invalidateMemoryAnchorsAtFloors(previous, invalidateFloors) : invalidateMemoryAnchors(previous, invalidFrom);
    const invalidate = async () => {
        if (localEdit) await deleteStateVectorsAtFloors(chatId, invalidateFloors);
        else await deleteStateVectorsFromFloor(chatId, invalidFrom);
        await invalidateSourceCache?.();
    };
    if (!rollbackRequired) {
        if (Object.hasOwn(next.storySummary, 'sourceInvalidFromFloor')) {
            const storySummary = { ...next.storySummary };
            delete storySummary.sourceInvalidFromFloor;
            next = { ...next, storySummary };
        }
        try {
            if (next !== previous || getRuntimeInvalidSourceFloor() != null) {
                await commitSummaryMemory(chatId, next, { previous, invalidate, resolvesSourceInvalidity: true });
            }
            else await invalidate();
        } catch (error) {
            // The host has already edited/deleted the source. A failed cleanup must not
            // leave its old anchors consumable, even when no L2 rollback was required.
            if (getContext().chatId === chatId && getMemoryCommitState() !== 'unconfirmed') {
                noteInvalidMemorySource(invalidFrom);
                const blocked = structuredClone(previous);
                blocked.storySummary.sourceInvalidFromFloor = invalidFrom;
                await commitSummaryMemory(chatId, blocked, { previous });
            }
            throw error;
        }
        return store?.summaryInvalid ? { status: 'failed', reason: 'history_discontinuous' }
            : store?.sourceInvalidFromFloor != null ? { status: 'failed', reason: 'source_boundary_invalid' }
                : { status: 'not_needed' };
    }
    noteInvalidMemorySource(validPrefixLength);
    // Real L2 undo mutates its draft; never let it change the detached baseline.
    next = structuredClone(next);
    const history = next.storySummary.summaryHistory || [];
    const target = [...history].reverse().find(entry => entry.endMesId < validPrefixLength)?.endMesId ?? -1;
    const baseline = history.find(entry => entry.kind === 'baseline');
    if (baseline && target < baseline.endMesId) {
        next.storySummary.sourceInvalidFromFloor = validPrefixLength;
        await commitSummaryMemory(chatId, next, { previous, invalidate });
        return { status: 'failed', reason: 'source_boundary_invalid', targetEndMesId: target };
    }
    const rollback = await executeRollback(chatId, store, target, { previous, next, invalidate });
    if (rollback.status === 'failed' && getMemoryCommitState() !== 'unconfirmed') {
        const blocked = structuredClone(previous);
        if (rollback.reason === 'history_discontinuous') blocked.storySummary.summaryInvalid = true;
        else blocked.storySummary.sourceInvalidFromFloor = validPrefixLength;
        // Cache cleanup failed or undo conflicted: preserve memory, persist only the source/integrity block.
        await commitSummaryMemory(chatId, blocked, { previous });
    }
    return rollback;
}

export async function invalidateSummaryAnchors(chatId, fromFloor = 0, reason = 'source_changed') {
    getSummaryStore();
    const previous = readSummaryMemory();
    const { next, ...impact } = invalidateMemoryAnchors(previous, fromFloor, reason);
    await commitSummaryMemory(chatId, next, { previous,
        invalidate: () => deleteStateVectorsFromFloor(chatId, fromFloor) });
    return impact;
}

function hasSummaryContent(json) {
    if (!json) return false;
    const hasKnownContent = (
        (json.keywords || []).length > 0
        || (json.events || []).length > 0
        || (json.characters?.main || []).length > 0
        || (json.arcs || []).length > 0
        || (json.facts || []).length > 0
        || (json.characterAliases || []).length > 0
    );
    if (hasKnownContent) return true;

    const knownFields = new Set(['keywords', 'events', 'characters', 'arcs', 'facts', 'characterAliases']);
    if (Object.keys(json).some(field => !knownFields.has(field))) return true;
    return isPlainObject(json.characters)
        && Object.keys(json.characters).some(field => field !== 'main');
}

export async function executeRollback(chatId, store, targetEndMesId, options = {}) {
    if (getSummaryStore() !== store) throw new Error('summary_store_changed');
    assertMemoryWritable(chatId);
    const previous = options.previous || readSummaryMemory();
    const next = options.next || structuredClone(previous);
    const draft = next.storySummary;
    const currentBatch = draft.summaryHistory?.find(entry => entry.endMesId === draft.lastSummarizedMesId);
    const maintenanceOnly = targetEndMesId === draft.lastSummarizedMesId && currentBatch?.kind === 'baseline';
    const maintenance = (draft.summaryHistory || []).filter(entry => entry.endMesId > targetEndMesId || (maintenanceOnly && entry === currentBatch))
        .flatMap(entry => entry.maintenance || []);
    const impact = maintenanceImpact(maintenance.flatMap(receipt => receipt.operations));
    let restored;
    try {
        restored = maintenanceOnly
            ? restoreMaintenance({ json: draft.json, atoms: next.stateAtoms }, maintenance)
            : applyExactSummaryHistoryUndo(draft.json, draft.summaryHistory, targetEndMesId, draft.lastSummarizedMesId, next.stateAtoms);
    } catch {
        return { status: 'failed', reason: 'history_discontinuous', targetEndMesId };
    }
    if (restored.historyDiscontinuous) return { status: 'failed',
        reason: restored.baselineCrossed ? 'source_boundary_invalid' : 'history_discontinuous', targetEndMesId };
    const oldEvents = draft.json?.events || [];
    const retainedEvents = new Map((restored.json.events || []).map(event => [event.id, event]));
    const deletedEventIds = oldEvents.filter(event => !sameMemory(event, retainedEvents.get(event.id))).map(event => event.id);
    draft.json = hasSummaryContent(restored.json) ? restored.json : null;
    next.stateAtoms = restored.atoms;
    updateMaintainedAnchorIndex(next, impact.floors);
    draft.lastSummarizedMesId = targetEndMesId;
    draft.summaryHistory = (draft.summaryHistory || []).filter(entry => entry.endMesId <= targetEndMesId);
    if (maintenanceOnly) draft.summaryHistory.find(entry => entry.endMesId === targetEndMesId).maintenance = [];
    delete draft.summaryInvalid;
    const invalidSourceFloor = Math.min(draft.sourceInvalidFromFloor ?? Infinity, getRuntimeInvalidSourceFloor() ?? Infinity);
    const sourceResolved = targetEndMesId < invalidSourceFloor;
    if (sourceResolved) delete draft.sourceInvalidFromFloor;
    else draft.sourceInvalidFromFloor = invalidSourceFloor;
    if (targetEndMesId < 0) {
        draft.hideSummarizedHistory = false;
        if (draft.json) draft.pendingImportBoundary = true;
        else delete draft.pendingImportBoundary;
    } else delete draft.pendingImportBoundary;
    draft.updatedAt = Date.now();
    try {
        await commitSummaryMemory(chatId, next, { previous, resolvesSourceInvalidity: sourceResolved, invalidate: async () => {
            await options.invalidate?.();
            if (targetEndMesId < 0 && !draft.json) await clearEventVectors(chatId);
            else if (deletedEventIds.length) await deleteEventVectorsByIds(chatId, deletedEventIds);
            if (impact.atomIds.length) await deleteStateVectorsByIds(chatId, impact.atomIds);
        } });
    } catch (error) {
        xbLog.error(MODULE_ID, '总结回滚未提交', error);
        return { status: 'failed', reason: error.code || 'metadata_persistence_failed', targetEndMesId };
    }
    return { status: 'rolled_back', targetEndMesId };
}

export async function rollbackSummaryOnce(chatId) {
    const store = getSummaryStore();
    if (!store) {
        return { success: false, reason: 'store_unavailable', targetEndMesId: null, clearedAll: false, clearedBoundary: false };
    }

    const targetEndMesId = getRollbackOnceTargetEndMesId(store);
    if (targetEndMesId == null) {
        return { success: false, reason: 'rollback_unavailable', targetEndMesId: null, clearedAll: false, clearedBoundary: false };
    }

    let rollback;
    try {
        rollback = await executeRollback(chatId, store, targetEndMesId);
    } catch (error) {
        xbLog.error(MODULE_ID, '手动总结回滚发生未处理异常', error);
        rollback = { status: 'failed', reason: 'rollback_exception', targetEndMesId };
    }
    if (rollback.status !== 'rolled_back') {
        return { success: false, reason: rollback.reason || 'rollback_failed', targetEndMesId, clearedAll: false, clearedBoundary: false };
    }
    return {
        success: true,
        targetEndMesId,
        clearedAll: targetEndMesId < 0 && !hasSummaryContent(store.json),
        clearedBoundary: targetEndMesId < 0,
    };
}

export async function clearSummaryData(chatId) {
    getSummaryStore();
    const previous = readSummaryMemory();
    const invalidSourceFloor = Math.min(previous.storySummary.sourceInvalidFromFloor ?? Infinity, getRuntimeInvalidSourceFloor() ?? Infinity);
    const retired = Number.isFinite(invalidSourceFloor) ? invalidateMemoryAnchors(previous, invalidSourceFloor).next : previous;
    const next = structuredClone(retired);
    const store = next.storySummary;
    delete store.json;
    store.lastSummarizedMesId = -1;
    store.summaryHistory = [];
    delete store.pendingImportBoundary;
    delete store.summaryInvalid;
    delete store.sourceInvalidFromFloor;
    store.hideSummarizedHistory = false;
    store.updatedAt = Date.now();
    await commitSummaryMemory(chatId, next, { previous, resolvesSourceInvalidity: true, invalidate: async () => {
        if (Number.isFinite(invalidSourceFloor)) await deleteStateVectorsFromFloor(chatId, invalidSourceFloor);
        await clearEventVectors(chatId);
    } });
}

// ═══════════════════════════════════════════════════════════════════════════
// facts 数据读取（供提示词装配和召回使用）
// ═══════════════════════════════════════════════════════════════════════════

export function getFacts() {
    const store = getSummaryStore();
    if (!isSummaryConsumable(store, getContext().chat?.length || 0)) return [];
    return (store?.json?.facts || []).filter(f => !f.retracted);
}

export function getNewCharacters() {
    const store = getSummaryStore();
    return (store?.json?.characters?.main || []).map(m =>
        typeof m === 'string' ? m : m.name
    );
}
