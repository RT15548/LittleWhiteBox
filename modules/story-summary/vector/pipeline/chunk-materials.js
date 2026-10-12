import { chunkMessage } from './chunk-text.js';

// Saved inputs own an already processed floor. Later chat additions must not
// manufacture extra chunks. Read current prose only for an absent floor or a
// missing material whose identity is still evidenced by an orphan vector.
export function collectChunkMaterials(chat, storedChunks, vectorDescriptors) {
    const materials = new Map(storedChunks.map(chunk => [chunk.chunkId, chunk]));
    const storedFloors = new Set(storedChunks.map(chunk => chunk.floor));
    const orphanIds = new Set(vectorDescriptors
        .filter(record => !materials.has(record.chunkId)).map(record => record.chunkId));
    for (let floor = 0; floor < chat.length; floor++) {
        const absentFloor = !storedFloors.has(floor);
        if (!absentFloor && !orphanIds.size) continue;
        for (const chunk of chunkMessage(floor, chat[floor])) {
            if (absentFloor || orphanIds.has(chunk.chunkId)) materials.set(chunk.chunkId, chunk);
        }
    }
    return [...materials.values()];
}
