/** 从统一的材料集合中挑出缺失或无效的配对。 */
export function selectChunksForRepair(materials, storedChunks, vectorDescriptors, fingerprint) {
    const stored = new Set(storedChunks.map(chunk => chunk.chunkId));
    const validIds = new Set(vectorDescriptors
        .filter(item => item.valid && item.fingerprint === fingerprint)
        .map(item => item.chunkId));
    // 缺材料时，即使同 ID 留有向量，也需按补出的材料重新配对。
    return materials
        .filter(chunk => !stored.has(chunk.chunkId) || !validIds.has(chunk.chunkId));
}
