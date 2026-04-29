// Story Summary - recall runtime scoring helpers
// Pure functions shared by the main-thread emergency backend and the Worker.

export function toFloat32(value) {
    if (!value) return null;
    if (value instanceof Float32Array) return value;
    if (value instanceof ArrayBuffer) return new Float32Array(value);
    if (ArrayBuffer.isView(value)) {
        return new Float32Array(value.buffer, value.byteOffset, Math.floor(value.byteLength / 4));
    }
    if (Array.isArray(value)) return new Float32Array(value);
    return null;
}

export function toArrayBuffer(value) {
    if (!value) return null;
    if (value instanceof ArrayBuffer) return value;
    if (ArrayBuffer.isView(value)) {
        return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength);
    }
    if (Array.isArray(value)) {
        return new Float32Array(value).buffer;
    }
    return null;
}

export function cosineSimilarity(a, b) {
    const va = toFloat32(a);
    const vb = toFloat32(b);
    if (!va?.length || !vb?.length || va.length !== vb.length) return 0;

    let dot = 0;
    let nA = 0;
    let nB = 0;
    for (let i = 0; i < va.length; i++) {
        dot += va[i] * vb[i];
        nA += va[i] * va[i];
        nB += vb[i] * vb[i];
    }
    return nA && nB ? dot / (Math.sqrt(nA) * Math.sqrt(nB)) : 0;
}

export function scoreAnchorsFromStateVectors(stateVectors = [], queryVector) {
    const scored = [];
    const query = toFloat32(queryVector);
    if (!query?.length) return scored;

    for (const item of stateVectors || []) {
        if (!item?.atomId) continue;
        scored.push({
            atomId: item.atomId,
            floor: item.floor,
            similarity: cosineSimilarity(query, item.vector),
        });
    }
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored;
}

export function scoreEventsFromEventVectors(eventVectors = [], queryVector) {
    const scored = [];
    const query = toFloat32(queryVector);
    if (!query?.length) return scored;

    for (const item of eventVectors || []) {
        if (!item?.eventId) continue;
        scored.push({
            eventId: item.eventId,
            similarity: cosineSimilarity(query, item.vector),
        });
    }
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored;
}

export function scoreL1FromRecords(chunks = [], chunkVectors = [], queryVector) {
    const startedAt = performance.now();
    const stats = {
        requestedFloors: 0,
        chunkCount: chunks?.length || 0,
        vectorHits: 0,
        missingVectors: 0,
        chunkFetchTime: 0,
        vectorFetchTime: 0,
        deserializeTime: 0,
        scoreTime: 0,
        sortTime: 0,
        totalTime: 0,
        chunkCacheHits: 0,
        chunkCacheMisses: 0,
        vectorCacheHits: 0,
        vectorCacheMisses: 0,
        cacheFallbackDbTime: 0,
        cacheWarm: true,
        backend: 'runtime',
    };

    const result = [];
    const query = toFloat32(queryVector);
    if (!query?.length || !chunks?.length) {
        stats.totalTime = Math.round(performance.now() - startedAt);
        return { result, stats };
    }

    const deserializeStarted = performance.now();
    const vectorMap = new Map();
    for (const item of chunkVectors || []) {
        if (!item?.chunkId) continue;
        const vec = toFloat32(item.vector);
        if (vec?.length) vectorMap.set(item.chunkId, vec);
    }
    stats.deserializeTime = Math.round(performance.now() - deserializeStarted);
    stats.vectorHits = vectorMap.size;
    stats.missingVectors = Math.max(0, chunks.length - vectorMap.size);

    const scoreStarted = performance.now();
    for (const chunk of chunks) {
        const vec = vectorMap.get(chunk.chunkId);
        result.push({
            chunkId: chunk.chunkId,
            floor: chunk.floor,
            chunkIdx: chunk.chunkIdx,
            speaker: chunk.speaker,
            isUser: chunk.isUser,
            text: chunk.text,
            _cosineScore: vec?.length ? cosineSimilarity(query, vec) : 0,
        });
    }
    stats.scoreTime = Math.round(performance.now() - scoreStarted);

    const sortStarted = performance.now();
    result.sort((a, b) => {
        const floorDiff = Number(a.floor || 0) - Number(b.floor || 0);
        if (floorDiff !== 0) return floorDiff;
        return b._cosineScore - a._cosineScore;
    });
    stats.sortTime = Math.round(performance.now() - sortStarted);
    stats.totalTime = Math.round(performance.now() - startedAt);
    return { result, stats };
}
