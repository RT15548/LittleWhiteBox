// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - State Store (L0)
// StateAtom 存 chat_metadata（持久化）
// StateVector 存 IndexedDB（可重建）
// ═══════════════════════════════════════════════════════════════════════════

import { saveMetadataDebounced } from '../../../../../../../extensions.js';
import { chat_metadata } from '../../../../../../../../script.js';
import { stateVectorsTable } from '../../data/db.js';
import { EXT_ID } from '../../../../core/constants.js';
import { xbLog } from '../../../../core/debug-core.js';

const MODULE_ID = 'state-store';

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
    saveMetadataDebounced();
}

export function clearL0Index() {
    const idx = ensureL0Index();
    idx.byFloor = {};
    saveMetadataDebounced();
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
        saveMetadataDebounced();
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
        saveMetadataDebounced();
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
        saveMetadataDebounced();
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
        saveMetadataDebounced();
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
    saveMetadataDebounced();
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
