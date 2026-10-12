// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - State Store (L0)
// StateAtom 存 chat_metadata（持久化）
// StateVector 存 IndexedDB（可重建）
// ═══════════════════════════════════════════════════════════════════════════

import { chat_metadata } from '../../../../../../../../script.js';
import { stateVectorsTable } from '../../data/db.js';
import { EXT_ID } from '../../../../core/constants.js';
import { xbLog } from '../../../../core/debug-core.js';
import {
    applyRecallRuntimeMutationBestEffort,
    clearRecallRuntime,
} from '../runtime/runtime.js';
import { assertFiniteVector } from './vector-validation.js';

const MODULE_ID = 'state-store';

// Read-only metadata access. All writes are drafts committed by the summary data layer.
export function float32ToBuffer(arr) {
    return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength);
}

export function bufferToFloat32(buffer) { return new Float32Array(buffer); }

export function getStateAtoms() { return chat_metadata.extensions?.[EXT_ID]?.stateAtoms || []; }
export function getL0Index() { return chat_metadata.extensions?.[EXT_ID]?.l0Index || { version: 1, byFloor: {} }; }
export function getL0FloorStatus(floor) { return getL0Index().byFloor?.[String(floor)] || null; }
export function getStateAtomsCount() { return getStateAtoms().length; }
export function getExtractedFloors() {
    return new Set(getStateAtoms().map(atom => atom.floor).filter(floor => Number.isInteger(floor) && floor >= 0));
}

export async function deleteStateVectorsByIds(chatId, atomIds) {
    if (!atomIds.length) return;
    const ids = new Set(atomIds);
    await stateVectorsTable.where('chatId').equals(chatId).filter(vector => ids.has(vector.atomId)).delete();
    await clearRecallRuntime(chatId, 'state');
}

// ═══════════════════════════════════════════════════════════════════════════
// StateVector 操作（IndexedDB）
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 保存 StateVectors
 */
export function makeStateVectorRecords(chatId, items, fingerprint) {
    let expectedDimensions = null;
    return items.map((item, index) => {
        const dims = assertFiniteVector(item.vector, `state vector ${index}`, expectedDimensions);
        expectedDimensions ??= dims;
        const rDims = item.rVector?.length
            ? assertFiniteVector(item.rVector, `state relation vector ${index}`, dims)
            : 0;
        return {
            chatId,
            atomId: item.atomId,
            floor: item.floor,
            vector: float32ToBuffer(new Float32Array(item.vector)),
            dims,
            rVector: rDims ? float32ToBuffer(new Float32Array(item.rVector)) : null,
            rDims,
            fingerprint,
            ...(item.sourceHash ? { sourceHash: item.sourceHash } : {}),
            ...(item.relationHash ? { relationHash: item.relationHash } : {}),
        };
    });
}

export async function saveStateVectors(chatId, items, fingerprint) {
    if (!chatId || !items?.length) return;
    const records = makeStateVectorRecords(chatId, items, fingerprint);
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
 * 获取完整性检查所需的轻量描述，不把整张 L0 向量表解码成 Float32Array。
 */
export async function getStateVectorDescriptors(chatId) {
    if (!chatId) return [];

    const descriptors = [];
    await stateVectorsTable.where('chatId').equals(chatId).each(record => {
        const dims = Number(record?.dims);
        const rDims = Number(record?.rDims);
        const dimensionsValid = Number.isInteger(dims) && dims > 0;
        const relationDimensionsValid = Number.isInteger(rDims) && rDims === dims;
        descriptors.push({
            atomId: record?.atomId,
            fingerprint: record?.fingerprint,
            ...(record?.sourceHash ? { sourceHash: record.sourceHash } : {}),
            ...(record?.relationHash ? { relationHash: record.relationHash } : {}),
            vectorValid: dimensionsValid
                && Number(record?.vector?.byteLength || 0) === dims * Float32Array.BYTES_PER_ELEMENT,
            rVectorValid: relationDimensionsValid
                && Number(record?.rVector?.byteLength || 0) === rDims * Float32Array.BYTES_PER_ELEMENT,
        });
    });
    return descriptors;
}

/**
 * 删除指定楼层及之后的 StateVectors
 */
export async function deleteStateVectorsFromFloor(chatId, floor) {
    if (!chatId) return 0;

    const deleted = await stateVectorsTable
        .where('[chatId+floor]')
        .between([chatId, floor], [chatId, Infinity], true, true)
        .delete();

    if (deleted > 0) {
        applyRecallRuntimeMutationBestEffort(chatId, {
            type: 'deleteStateVectorsFromFloor',
            floor,
        });
        xbLog.info(MODULE_ID, `删除 ${deleted} 个 StateVector (floor >= ${floor})`);
    }
    return deleted;
}

export async function deleteStateVectorsAtFloors(chatId, floors) {
    if (!chatId || !floors.length) return 0;
    const deleted = await stateVectorsTable.where('[chatId+floor]').anyOf(floors.map(floor => [chatId, floor])).delete();
    if (deleted) applyRecallRuntimeMutationBestEffort(chatId, { type: 'deleteStateVectorsAtFloors', floors });
    return deleted;
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
