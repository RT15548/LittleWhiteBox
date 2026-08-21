export function orderCompleteChunkVectors(sortedChunks, chunkVectors) {
    const chunkVectorMap = new Map(chunkVectors.map(item => [item.chunkId, item.vector]));
    const hasCompleteMapping = chunkVectorMap.size === chunkVectors.length
        && chunkVectors.length === sortedChunks.length
        && sortedChunks.every(chunk => chunkVectorMap.has(chunk.chunkId));
    if (!hasCompleteMapping) {
        throw new Error('chunk 数据与向量不完整，请重新生成向量后再导出');
    }
    return sortedChunks.map(chunk => chunkVectorMap.get(chunk.chunkId));
}

export function assertVectorPackageChunkCounts(manifest, chunkCount, chunkVectorCount) {
    assertManifestCount('chunk 元数据', manifest?.chunkCount, chunkCount);
    assertManifestCount('chunk 向量', manifest?.chunkVectorCount, chunkVectorCount);
}

function assertManifestCount(label, declaredCount, actualCount) {
    if (!Number.isInteger(declaredCount) || declaredCount < 0 || declaredCount !== actualCount) {
        throw new Error(`${label} 数量与清单不匹配: 清单 ${declaredCount}, 实际 ${actualCount}`);
    }
}
