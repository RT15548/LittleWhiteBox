// ═══════════════════════════════════════════════════════════════════════════
// Vector Import/Export
// 向量数据导入导出（当前 chatId 级别）
// ═══════════════════════════════════════════════════════════════════════════

import { zipSync, unzipSync, strToU8, strFromU8 } from '../../../../libs/fflate.mjs';
import { getContext } from '../../../../../../../extensions.js';
import { xbLog } from '../../../../core/debug-core.js';
import {
    getMeta,
    updateMeta,
    getAllChunks,
    getAllChunkVectors,
    getAllEventVectors,
    saveChunks,
    saveChunkVectors,
    clearAllChunks,
    clearEventVectors,
    saveEventVectors,
} from './chunk-store.js';
import {
    getStateAtoms,
    saveStateAtoms,
    clearStateAtoms,
    getAllStateVectors,
    saveStateVectors,
    clearStateVectors,
} from './state-store.js';
import { getEngineFingerprint } from '../utils/embedder.js';
import { getVectorConfig } from '../../data/config.js';

const MODULE_ID = 'vector-io';
const EXPORT_VERSION = 2;

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

function float32ToBytes(vectors, dims) {
    const totalFloats = vectors.length * dims;
    const buffer = new ArrayBuffer(totalFloats * 4);
    const view = new Float32Array(buffer);
    
    let offset = 0;
    for (const vec of vectors) {
        for (let i = 0; i < dims; i++) {
            view[offset++] = vec[i] || 0;
        }
    }
    
    return new Uint8Array(buffer);
}

function bytesToFloat32(bytes, dims) {
    const view = new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
    const vectors = [];
    
    for (let i = 0; i < view.length; i += dims) {
        vectors.push(Array.from(view.slice(i, i + dims)));
    }
    
    return vectors;
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════════════════════
// 导出
// ═══════════════════════════════════════════════════════════════════════════

export async function exportVectors(onProgress) {
    const { chatId } = getContext();
    if (!chatId) {
        throw new Error('未打开聊天');
    }

    onProgress?.('读取数据...');

    const meta = await getMeta(chatId);
    const chunks = await getAllChunks(chatId);
    const chunkVectors = await getAllChunkVectors(chatId);
    const eventVectors = await getAllEventVectors(chatId);
    const stateAtoms = getStateAtoms();
    const stateVectors = await getAllStateVectors(chatId);

    if (chunkVectors.length === 0 && eventVectors.length === 0 && stateVectors.length === 0) {
        throw new Error('没有可导出的向量数据');
    }

    // 确定维度
    const dims = chunkVectors[0]?.vector?.length
        || eventVectors[0]?.vector?.length
        || stateVectors[0]?.vector?.length
        || 0;
    if (dims === 0) {
        throw new Error('无法确定向量维度');
    }

    onProgress?.('构建索引...');

    // 构建 chunk 索引（按 chunkId 排序保证顺序一致）
    const sortedChunks = [...chunks].sort((a, b) => a.chunkId.localeCompare(b.chunkId));
    const chunkVectorMap = new Map(chunkVectors.map(cv => [cv.chunkId, cv.vector]));

    // chunks.jsonl
    const chunksJsonl = sortedChunks.map(c => JSON.stringify({
        chunkId: c.chunkId,
        floor: c.floor,
        chunkIdx: c.chunkIdx,
        speaker: c.speaker,
        isUser: c.isUser,
        text: c.text,
        textHash: c.textHash,
    })).join('\n');

    // chunk_vectors.bin（按 sortedChunks 顺序）
    const chunkVectorsOrdered = sortedChunks.map(c => chunkVectorMap.get(c.chunkId) || new Array(dims).fill(0));

    onProgress?.('压缩向量...');

    // 构建 event 索引
    const sortedEventVectors = [...eventVectors].sort((a, b) => a.eventId.localeCompare(b.eventId));
    const eventsJsonl = sortedEventVectors.map(ev => JSON.stringify({
        eventId: ev.eventId,
    })).join('\n');

    // event_vectors.bin
    const eventVectorsOrdered = sortedEventVectors.map(ev => ev.vector);

    // state vectors
    const sortedStateVectors = [...stateVectors].sort((a, b) => String(a.atomId).localeCompare(String(b.atomId)));
    const stateVectorsOrdered = sortedStateVectors.map(v => v.vector);
    const rDims = sortedStateVectors.find(v => v.rVector?.length)?.rVector?.length || dims;
    const stateRVectorsOrdered = sortedStateVectors.map(v =>
        v.rVector?.length ? v.rVector : new Array(rDims).fill(0)
    );
    const stateVectorsJsonl = sortedStateVectors.map(v => JSON.stringify({
        atomId: v.atomId,
        floor: v.floor,
        hasRVector: !!(v.rVector?.length),
        rDims: v.rVector?.length || 0,
    })).join('\n');

    // manifest
    const manifest = {
        version: EXPORT_VERSION,
        exportedAt: Date.now(),
        chatId,
        fingerprint: meta.fingerprint || '',
        dims,
        chunkCount: sortedChunks.length,
        chunkVectorCount: chunkVectors.length,
        eventCount: sortedEventVectors.length,
        stateAtomCount: stateAtoms.length,
        stateVectorCount: stateVectors.length,
        stateRVectorCount: sortedStateVectors.filter(v => v.rVector?.length).length,
        rDims,
        lastChunkFloor: meta.lastChunkFloor ?? -1,
    };

    onProgress?.('打包文件...');

    // 打包 zip
    const zipData = zipSync({
        'manifest.json': strToU8(JSON.stringify(manifest, null, 2)),
        'chunks.jsonl': strToU8(chunksJsonl),
        'chunk_vectors.bin': float32ToBytes(chunkVectorsOrdered, dims),
        'events.jsonl': strToU8(eventsJsonl),
        'event_vectors.bin': float32ToBytes(eventVectorsOrdered, dims),
        'state_atoms.json': strToU8(JSON.stringify(stateAtoms)),
        'state_vectors.jsonl': strToU8(stateVectorsJsonl),
        'state_vectors.bin': stateVectorsOrdered.length
            ? float32ToBytes(stateVectorsOrdered, dims)
            : new Uint8Array(0),
        'state_r_vectors.bin': stateRVectorsOrdered.length
            ? float32ToBytes(stateRVectorsOrdered, rDims)
            : new Uint8Array(0),
    }, { level: 1 });  // 降低压缩级别，速度优先

    onProgress?.('下载文件...');

    // 生成文件名
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const shortChatId = chatId.slice(0, 8);
    const filename = `vectors_${shortChatId}_${timestamp}.zip`;

    downloadBlob(new Blob([zipData]), filename);

    const sizeMB = (zipData.byteLength / 1024 / 1024).toFixed(2);
    xbLog.info(MODULE_ID, `导出完成: ${filename} (${sizeMB}MB)`);

    return {
        filename,
        size: zipData.byteLength,
        chunkCount: sortedChunks.length,
        eventCount: sortedEventVectors.length,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 导入
// ═══════════════════════════════════════════════════════════════════════════

export async function importVectors(file, onProgress) {
    const { chatId } = getContext();
    if (!chatId) {
        throw new Error('未打开聊天');
    }

    onProgress?.('读取文件...');

    const arrayBuffer = await file.arrayBuffer();
    const zipData = new Uint8Array(arrayBuffer);

    onProgress?.('解压文件...');

    let unzipped;
    try {
        unzipped = unzipSync(zipData);
    } catch (e) {
        throw new Error('文件格式错误，无法解压');
    }

    // 读取 manifest
    if (!unzipped['manifest.json']) {
        throw new Error('缺少 manifest.json');
    }

    const manifest = JSON.parse(strFromU8(unzipped['manifest.json']));

    if (![1, 2].includes(manifest.version)) {
        throw new Error(`不支持的版本: ${manifest.version}`);
    }

    onProgress?.('校验数据...');

    // 校验 fingerprint
    const vectorCfg = getVectorConfig();
    const currentFingerprint = vectorCfg ? getEngineFingerprint(vectorCfg) : '';
    const fingerprintMismatch = manifest.fingerprint && currentFingerprint && manifest.fingerprint !== currentFingerprint;

    // chatId 校验（警告但允许）
    const chatIdMismatch = manifest.chatId !== chatId;

    const warnings = [];
    if (fingerprintMismatch) {
        warnings.push(`向量引擎不匹配（文件: ${manifest.fingerprint}, 当前: ${currentFingerprint}），导入后需重新生成`);
    }
    if (chatIdMismatch) {
        warnings.push(`聊天ID不匹配（文件: ${manifest.chatId}, 当前: ${chatId}）`);
    }

    onProgress?.('解析数据...');

    // 解析 chunks
    const chunksJsonl = unzipped['chunks.jsonl'] ? strFromU8(unzipped['chunks.jsonl']) : '';
    const chunkMetas = chunksJsonl.split('\n').filter(Boolean).map(line => JSON.parse(line));

    // 解析 chunk vectors
    const chunkVectorsBytes = unzipped['chunk_vectors.bin'];
    const chunkVectors = chunkVectorsBytes ? bytesToFloat32(chunkVectorsBytes, manifest.dims) : [];

    // 解析 events
    const eventsJsonl = unzipped['events.jsonl'] ? strFromU8(unzipped['events.jsonl']) : '';
    const eventMetas = eventsJsonl.split('\n').filter(Boolean).map(line => JSON.parse(line));

    // 解析 event vectors
    const eventVectorsBytes = unzipped['event_vectors.bin'];
    const eventVectors = eventVectorsBytes ? bytesToFloat32(eventVectorsBytes, manifest.dims) : [];

    // 解析 L0 state atoms
    const stateAtoms = unzipped['state_atoms.json']
        ? JSON.parse(strFromU8(unzipped['state_atoms.json']))
        : [];

    // 解析 L0 state vectors metas
    const stateVectorsJsonl = unzipped['state_vectors.jsonl'] ? strFromU8(unzipped['state_vectors.jsonl']) : '';
    const stateVectorMetas = stateVectorsJsonl.split('\n').filter(Boolean).map(line => JSON.parse(line));

    // Parse L0 semantic vectors
    const stateVectorsBytes = unzipped['state_vectors.bin'];
    const stateVectors = (stateVectorsBytes && stateVectorMetas.length)
        ? bytesToFloat32(stateVectorsBytes, manifest.dims)
        : [];
    // Parse optional L0 r-vectors (for diffusion r-sem edges)
    const stateRVectorsBytes = unzipped['state_r_vectors.bin'];
    const stateRVectors = (stateRVectorsBytes && stateVectorMetas.length)
        ? bytesToFloat32(stateRVectorsBytes, manifest.rDims || manifest.dims)
        : [];
    const hasRVectorMeta = stateVectorMetas.some(m => typeof m.hasRVector === 'boolean');

    // 校验数量
    if (chunkMetas.length !== chunkVectors.length) {
        throw new Error(`chunk 数量不匹配: 元数据 ${chunkMetas.length}, 向量 ${chunkVectors.length}`);
    }
    if (eventMetas.length !== eventVectors.length) {
        throw new Error(`event 数量不匹配: 元数据 ${eventMetas.length}, 向量 ${eventVectors.length}`);
    }
    if (stateVectorMetas.length !== stateVectors.length) {
        throw new Error(`state 向量数量不匹配: 元数据 ${stateVectorMetas.length}, 向量 ${stateVectors.length}`);
    }
    if (stateRVectors.length > 0 && stateVectorMetas.length !== stateRVectors.length) {
        throw new Error(`state r-vector count mismatch: meta=${stateVectorMetas.length}, vectors=${stateRVectors.length}`);
    }

    onProgress?.('清空旧数据...');

    // 清空当前数据
    await clearAllChunks(chatId);
    await clearEventVectors(chatId);
    await clearStateVectors(chatId);
    clearStateAtoms();

    onProgress?.('写入数据...');

    // 写入 chunks
    if (chunkMetas.length > 0) {
        const chunksToSave = chunkMetas.map(meta => ({
            chunkId: meta.chunkId,
            floor: meta.floor,
            chunkIdx: meta.chunkIdx,
            speaker: meta.speaker,
            isUser: meta.isUser,
            text: meta.text,
            textHash: meta.textHash,
        }));
        await saveChunks(chatId, chunksToSave);

        // 写入 chunk vectors
        const chunkVectorItems = chunkMetas.map((meta, idx) => ({
            chunkId: meta.chunkId,
            vector: chunkVectors[idx],
        }));
        await saveChunkVectors(chatId, chunkVectorItems, manifest.fingerprint);
    }

    // 写入 event vectors
    if (eventMetas.length > 0) {
        const eventVectorItems = eventMetas.map((meta, idx) => ({
            eventId: meta.eventId,
            vector: eventVectors[idx],
        }));
        await saveEventVectors(chatId, eventVectorItems, manifest.fingerprint);
    }

    // 写入 state atoms
    if (stateAtoms.length > 0) {
        saveStateAtoms(stateAtoms);
    }

    // Write state vectors (semantic + optional r-vector)
    if (stateVectorMetas.length > 0) {
        const stateVectorItems = stateVectorMetas.map((meta, idx) => ({
            atomId: meta.atomId,
            floor: meta.floor,
            vector: stateVectors[idx],
            rVector: (stateRVectors[idx] && (!hasRVectorMeta || meta.hasRVector)) ? stateRVectors[idx] : null,
        }));
        await saveStateVectors(chatId, stateVectorItems, manifest.fingerprint);
    }

    // 更新 meta
    await updateMeta(chatId, {
        fingerprint: manifest.fingerprint,
        lastChunkFloor: manifest.lastChunkFloor,
    });

    xbLog.info(MODULE_ID, `导入完成: ${chunkMetas.length} chunks, ${eventMetas.length} events, ${stateAtoms.length} state atoms`);

    return {
        chunkCount: chunkMetas.length,
        eventCount: eventMetas.length,
        warnings,
        fingerprintMismatch,
    };
}
