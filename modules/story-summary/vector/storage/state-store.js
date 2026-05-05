// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - State Store (L0)
// StateAtom 存 chat_metadata（持久化）
// StateVector 存 IndexedDB（可重建）
// ═══════════════════════════════════════════════════════════════════════════

import { getContext, saveMetadataDebounced } from '../../../../../../../extensions.js';
import { chat_metadata } from '../../../../../../../../script.js';
import * as stScript from '../../../../../../../../script.js';
import { stateVectorsTable } from '../../data/db.js';
import { EXT_ID } from '../../../../core/constants.js';
import { xbLog } from '../../../../core/debug-core.js';
import {
    applyRecallRuntimeMutationBestEffort,
    clearRecallRuntime,
} from '../runtime/runtime.js';

const MODULE_ID = 'state-store';
const L0_METADATA_FAST_RETRY_MS = 1000;
const L0_METADATA_SLOW_RETRY_MS = 3000;
const L0_METADATA_SLOW_AFTER_MS = 10000;
const L0_METADATA_WAIT_LOG_MS = 15000;

let l0MetadataBatchDepth = 0;
let l0MetadataDirty = false;
let l0MetadataDirtyChatId = null;
let l0MetadataDirtySince = 0;
let l0MetadataDirtyVersion = 0;
let l0MetadataSaveInFlight = false;
let l0MetadataRetryTimer = null;
let l0MetadataRetryStartedAt = 0;
let l0MetadataLastWaitLogAt = 0;
const l0MetadataDirtySources = new Set();

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

export function float32ToBuffer(arr) {
    return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
}

export function bufferToFloat32(buffer) {
    return new Float32Array(buffer);
}

// ═══════════════════════════════════════════════════════════════════════════
// StateAtom 操作（chat_metadata）
// ═══════════════════════════════════════════════════════════════════════════

function ensureStateAtomsArray() {
    chat_metadata.extensions ||= {};
    chat_metadata.extensions[EXT_ID] ||= {};
    chat_metadata.extensions[EXT_ID].stateAtoms ||= [];
    return chat_metadata.extensions[EXT_ID].stateAtoms;
}

// L0Index: per-floor status (ok | empty | fail)
function ensureL0Index() {
    chat_metadata.extensions ||= {};
    chat_metadata.extensions[EXT_ID] ||= {};
    chat_metadata.extensions[EXT_ID].l0Index ||= { version: 1, byFloor: {} };
    chat_metadata.extensions[EXT_ID].l0Index.byFloor ||= {};
    return chat_metadata.extensions[EXT_ID].l0Index;
}

function getCurrentChatId() {
    try {
        return getContext()?.chatId || null;
    } catch {
        return null;
    }
}

function clearL0MetadataRetryTimer() {
    if (l0MetadataRetryTimer) {
        clearTimeout(l0MetadataRetryTimer);
        l0MetadataRetryTimer = null;
    }
}

function scheduleL0MetadataFlush(delayMs = L0_METADATA_FAST_RETRY_MS) {
    clearL0MetadataRetryTimer();
    l0MetadataRetryTimer = setTimeout(() => {
        l0MetadataRetryTimer = null;
        flushL0MetadataSave('scheduled');
    }, Math.max(0, delayMs));
}

function markL0MetadataDirty(source = 'unknown') {
    const chatId = getCurrentChatId();
    if (!chatId) {
        xbLog.warn(MODULE_ID, `L0 metadata 已修改但当前 chatId 为空，source=${source}`);
        return;
    }

    if (l0MetadataDirty && l0MetadataDirtyChatId && l0MetadataDirtyChatId !== chatId) {
        xbLog.warn(MODULE_ID, `丢弃过期 L0 metadata dirty 标记: old=${l0MetadataDirtyChatId} new=${chatId}`);
        l0MetadataDirtySources.clear();
        l0MetadataDirtySince = 0;
    }

    l0MetadataDirty = true;
    l0MetadataDirtyChatId = chatId;
    if (!l0MetadataDirtySince) l0MetadataDirtySince = Date.now();
    l0MetadataDirtyVersion++;
    l0MetadataDirtySources.add(source);

    if (l0MetadataBatchDepth <= 0 && !l0MetadataSaveInFlight) {
        scheduleL0MetadataFlush(0);
    }
}

export function beginL0MetadataBatch() {
    l0MetadataBatchDepth++;
}

export function endL0MetadataBatch() {
    l0MetadataBatchDepth = Math.max(0, l0MetadataBatchDepth - 1);
    if (l0MetadataBatchDepth === 0 && l0MetadataDirty) {
        scheduleL0MetadataFlush(0);
    }
}

export function flushL0MetadataSave(reason = 'manual') {
    if (!l0MetadataDirty) return false;
    if (l0MetadataSaveInFlight) return false;

    const currentChatId = getCurrentChatId();
    if (!currentChatId || currentChatId !== l0MetadataDirtyChatId) {
        xbLog.warn(MODULE_ID, `丢弃未落盘 L0 metadata：chat 已切换 dirty=${l0MetadataDirtyChatId || '-'} current=${currentChatId || '-'}`);
        clearL0MetadataRetryTimer();
        l0MetadataDirty = false;
        l0MetadataDirtyChatId = null;
        l0MetadataDirtySince = 0;
        l0MetadataDirtyVersion++;
        l0MetadataRetryStartedAt = 0;
        l0MetadataLastWaitLogAt = 0;
        l0MetadataDirtySources.clear();
        return false;
    }

    if (stScript.isChatSaving) {
        const now = Date.now();
        if (!l0MetadataRetryStartedAt) l0MetadataRetryStartedAt = now;
        const waitedMs = now - l0MetadataRetryStartedAt;
        const retryMs = waitedMs >= L0_METADATA_SLOW_AFTER_MS ? L0_METADATA_SLOW_RETRY_MS : L0_METADATA_FAST_RETRY_MS;
        if (now - l0MetadataLastWaitLogAt >= L0_METADATA_WAIT_LOG_MS) {
            l0MetadataLastWaitLogAt = now;
            const dirtyForMs = l0MetadataDirtySince ? now - l0MetadataDirtySince : waitedMs;
            xbLog.info(MODULE_ID, `L0 metadata 等待酒馆保存空闲，暂缓落盘 waited=${Math.round(waitedMs / 1000)}s dirty=${Math.round(dirtyForMs / 1000)}s reason=${reason}`);
        }
        scheduleL0MetadataFlush(retryMs);
        return false;
    }

    const sources = [...l0MetadataDirtySources].join(',');
    const versionToSave = l0MetadataDirtyVersion;
    clearL0MetadataRetryTimer();
    l0MetadataSaveInFlight = true;

    try {
        const ctx = getContext?.();
        if (typeof ctx?.saveMetadata === 'function') {
            const attemptedChatId = currentChatId;
            const saveStartedAt = Date.now();
            let enteredHostSave = false;
            const tracker = setInterval(() => {
                if (stScript.isChatSaving) enteredHostSave = true;
            }, 20);

            Promise.resolve(ctx.saveMetadata())
                .then(() => {
                    if (!enteredHostSave) {
                        const elapsedMs = Date.now() - saveStartedAt;
                        if (elapsedMs < 200 && getCurrentChatId() === attemptedChatId && l0MetadataDirtyVersion === versionToSave) {
                            l0MetadataDirty = false;
                            l0MetadataDirtyChatId = null;
                            l0MetadataDirtySince = 0;
                            l0MetadataRetryStartedAt = 0;
                            l0MetadataLastWaitLogAt = 0;
                            l0MetadataDirtySources.clear();
                            return;
                        }
                        xbLog.warn(MODULE_ID, `L0 metadata 保存未进入酒馆保存流程，继续等待重试 reason=${reason}`);
                        if (getCurrentChatId() === attemptedChatId && l0MetadataDirtyVersion === versionToSave) {
                            scheduleL0MetadataFlush(L0_METADATA_FAST_RETRY_MS);
                        } else if (l0MetadataDirty) {
                            scheduleL0MetadataFlush(0);
                        }
                        return;
                    }

                    if (getCurrentChatId() === attemptedChatId && l0MetadataDirtyVersion === versionToSave) {
                        l0MetadataDirty = false;
                        l0MetadataDirtyChatId = null;
                        l0MetadataDirtySince = 0;
                        l0MetadataRetryStartedAt = 0;
                        l0MetadataLastWaitLogAt = 0;
                        l0MetadataDirtySources.clear();
                    } else if (l0MetadataDirty) {
                        scheduleL0MetadataFlush(0);
                    }
                })
                .catch(e => {
                    xbLog.warn(MODULE_ID, `L0 metadata 保存失败: ${e?.message || e}`);
                    if (getCurrentChatId() === attemptedChatId && l0MetadataDirtyVersion === versionToSave) {
                        scheduleL0MetadataFlush(L0_METADATA_FAST_RETRY_MS);
                    } else if (l0MetadataDirty) {
                        scheduleL0MetadataFlush(0);
                    }
                })
                .finally(() => {
                    clearInterval(tracker);
                    l0MetadataSaveInFlight = false;
                    if (l0MetadataDirty && l0MetadataDirtyVersion !== versionToSave) {
                        scheduleL0MetadataFlush(0);
                    }
                });
        } else {
            saveMetadataDebounced?.();
            l0MetadataDirty = false;
            l0MetadataDirtyChatId = null;
            l0MetadataDirtySince = 0;
            l0MetadataRetryStartedAt = 0;
            l0MetadataLastWaitLogAt = 0;
            l0MetadataDirtySources.clear();
            l0MetadataSaveInFlight = false;
        }
        xbLog.info(MODULE_ID, `L0 metadata 保存已触发 reason=${reason} sources=${sources || '-'}`);
        return true;
    } catch (e) {
        xbLog.warn(MODULE_ID, `L0 metadata 保存触发失败: ${e?.message || e}`);
        l0MetadataSaveInFlight = false;
        markL0MetadataDirty('save_throw');
        return false;
    }
}

export function getL0Index() {
    return ensureL0Index();
}

export function getL0FloorStatus(floor) {
    const idx = ensureL0Index();
    return idx.byFloor?.[String(floor)] || null;
}

export function setL0FloorStatus(floor, record) {
    const idx = ensureL0Index();
    idx.byFloor[String(floor)] = {
        ...record,
        floor,
        updatedAt: Date.now(),
    };
    markL0MetadataDirty('setL0FloorStatus');
}

export function clearL0Index() {
    const idx = ensureL0Index();
    idx.byFloor = {};
    markL0MetadataDirty('clearL0Index');
}

export function deleteL0IndexFromFloor(fromFloor) {
    const idx = ensureL0Index();
    const keys = Object.keys(idx.byFloor || {});
    let deleted = 0;
    for (const k of keys) {
        const f = Number(k);
        if (Number.isFinite(f) && f >= fromFloor) {
            delete idx.byFloor[k];
            deleted++;
        }
    }
    if (deleted > 0) {
        markL0MetadataDirty('deleteL0IndexFromFloor');
        xbLog.info(MODULE_ID, `删除 ${deleted} 条 L0Index (floor >= ${fromFloor})`);
    }
    return deleted;
}

/**
 * 获取当前聊天的所有 StateAtoms
 */
export function getStateAtoms() {
    return ensureStateAtomsArray();
}

/**
 * 保存新的 StateAtoms（追加，去重）
 */
export function saveStateAtoms(atoms) {
    if (!atoms?.length) return;

    const arr = ensureStateAtomsArray();
    const existing = new Set(arr.map(a => a.atomId));

    let added = 0;
    for (const atom of atoms) {
        // 有效性检查
        if (!atom?.atomId || typeof atom.floor !== 'number' || atom.floor < 0 || !atom.semantic) {
            xbLog.warn(MODULE_ID, `跳过无效 atom: ${atom?.atomId}`);
            continue;
        }

        if (!existing.has(atom.atomId)) {
            arr.push(atom);
            existing.add(atom.atomId);
            added++;
        }
    }

    if (added > 0) {
        markL0MetadataDirty('saveStateAtoms');
        xbLog.info(MODULE_ID, `存储 ${added} 个 StateAtom`);
    }
}

/**
 * 删除指定楼层及之后的 StateAtoms
 */
export function deleteStateAtomsFromFloor(floor) {
    const arr = ensureStateAtomsArray();
    const before = arr.length;

    const filtered = arr.filter(a => a.floor < floor);
    chat_metadata.extensions[EXT_ID].stateAtoms = filtered;

    const deleted = before - filtered.length;
    if (deleted > 0) {
        markL0MetadataDirty('deleteStateAtomsFromFloor');
        xbLog.info(MODULE_ID, `删除 ${deleted} 个 StateAtom (floor >= ${floor})`);
    }

    return deleted;
}

/**
 * 清空所有 StateAtoms
 */
export function clearStateAtoms() {
    const arr = ensureStateAtomsArray();
    const count = arr.length;

    chat_metadata.extensions[EXT_ID].stateAtoms = [];

    if (count > 0) {
        markL0MetadataDirty('clearStateAtoms');
        xbLog.info(MODULE_ID, `清空 ${count} 个 StateAtom`);
    }
}

/**
 * 获取 StateAtoms 数量
 */
export function getStateAtomsCount() {
    return ensureStateAtomsArray().length;
}

/**
 * Return floors that already have extracted atoms.
 */
export function getExtractedFloors() {
    const floors = new Set();
    const arr = ensureStateAtomsArray();
    for (const atom of arr) {
        if (typeof atom?.floor === 'number' && atom.floor >= 0) {
            floors.add(atom.floor);
        }
    }
    return floors;
}

/**
 * Replace all stored StateAtoms.
 */
export function replaceStateAtoms(atoms) {
    const next = Array.isArray(atoms) ? atoms : [];
    chat_metadata.extensions[EXT_ID].stateAtoms = next;
    markL0MetadataDirty('replaceStateAtoms');
    xbLog.info(MODULE_ID, `替换 StateAtoms: ${next.length} 条`);
}

// ═══════════════════════════════════════════════════════════════════════════
// StateVector 操作（IndexedDB）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 保存 StateVectors
 */
export async function saveStateVectors(chatId, items, fingerprint) {
    if (!chatId || !items?.length) return;

    const records = items.map(item => ({
        chatId,
        atomId: item.atomId,
        floor: item.floor,
        vector: float32ToBuffer(new Float32Array(item.vector)),
        dims: item.vector.length,
        rVector: item.rVector?.length ? float32ToBuffer(new Float32Array(item.rVector)) : null,
        rDims: item.rVector?.length ? item.rVector.length : 0,
        fingerprint,
    }));

    await stateVectorsTable.bulkPut(records);
    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'upsertStateVectors',
        items: records,
    });
    xbLog.info(MODULE_ID, `存储 ${records.length} 个 StateVector`);
}

/**
 * 获取所有 StateVectors
 */
export async function getAllStateVectors(chatId) {
    if (!chatId) return [];

    const records = await stateVectorsTable.where('chatId').equals(chatId).toArray();
    return records.map(r => ({
        ...r,
        vector: bufferToFloat32(r.vector),
        rVector: r.rVector ? bufferToFloat32(r.rVector) : null,
    }));
}

/**
 * 删除指定楼层及之后的 StateVectors
 */
export async function deleteStateVectorsFromFloor(chatId, floor) {
    if (!chatId) return;

    const deleted = await stateVectorsTable
        .where('chatId')
        .equals(chatId)
        .filter(v => v.floor >= floor)
        .delete();

    applyRecallRuntimeMutationBestEffort(chatId, {
        type: 'deleteStateVectorsFromFloor',
        floor,
    });
    if (deleted > 0) {
        xbLog.info(MODULE_ID, `删除 ${deleted} 个 StateVector (floor >= ${floor})`);
    }
}

/**
 * 清空所有 StateVectors
 */
export async function clearStateVectors(chatId) {
    if (!chatId) return;

    const deleted = await stateVectorsTable.where('chatId').equals(chatId).delete();
    await clearRecallRuntime(chatId, 'state');
    if (deleted > 0) {
        xbLog.info(MODULE_ID, `清空 ${deleted} 个 StateVector`);
    }
}

/**
 * 获取 StateVectors 数量
 */
export async function getStateVectorsCount(chatId) {
    if (!chatId) return 0;
    return await stateVectorsTable.where('chatId').equals(chatId).count();
}
