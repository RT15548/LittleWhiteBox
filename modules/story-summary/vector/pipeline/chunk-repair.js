import { getAllChunks, getChunkVectorDescriptors, getMeta, updateMeta, saveChunks, saveChunkVectors } from '../storage/chunk-store.js';
import { collectChunkMaterials } from './chunk-materials.js';
import { embed, getEngineFingerprint } from '../utils/embedder.js';
import { getEmbeddingFailureDetails } from '../llm/embedding-failure.js';
import { selectChunksForRepair } from './chunk-repair-policy.js';
import { inputDigest } from '../utils/vector-input-digest.js';
import { trackVectorActivity } from '../runtime/vector-activity.js';

const REPAIR_BATCH_SIZE = 20;

/** 自动维护与手动补齐共用：按已保存材料补向量，不重新解释已有楼层。 */
export async function repairMissingChunks(options) {
    return trackVectorActivity({ chatId: options.chatId, phase: 'l1-vector-repair', api: options.vectorConfig?.embeddingApi, unit: 'chunks' },
        activity => repairMissingChunksInner(options, activity));
}

async function repairMissingChunksInner({ chatId, chat, vectorConfig, signal, shouldCancel, onProgress }, activity) {
    const isCancelled = () => signal?.aborted || shouldCancel?.() === true;
    let repaired = 0;
    let phase = 'read';
    const cancelled = () => ({ success: false, cancelled: true, repaired });
    try {
        if (isCancelled()) return cancelled();
        const fingerprint = getEngineFingerprint(vectorConfig);
        const meta = await getMeta(chatId);
        if (meta.fingerprint && meta.fingerprint !== fingerprint) {
            return { success: false, repaired, code: 'fingerprint_mismatch' };
        }
        const [stored, vectors] = await Promise.all([getAllChunks(chatId), getChunkVectorDescriptors(chatId)]);
        if (isCancelled()) return cancelled();
        const materials = collectChunkMaterials(chat, stored, vectors);
        const missing = selectChunksForRepair(materials, stored, vectors, fingerprint);
        activity.update({ total: missing.length });
        const storedIds = new Set(stored.map(chunk => chunk.chunkId));
        const newMaterials = materials.filter(chunk => !storedIds.has(chunk.chunkId));
        if (newMaterials.length) {
            phase = 'materials';
            await saveChunks(chatId, newMaterials);
            if (isCancelled()) return cancelled();
        }
        onProgress?.(0, missing.length);
        for (let i = 0; i < missing.length; i += REPAIR_BATCH_SIZE) {
            if (isCancelled()) return cancelled();
            const batch = missing.slice(i, i + REPAIR_BATCH_SIZE);
            phase = 'embedding';
            activity.update({ state: 'embedding', activeUnits: batch.length });
            const embeddings = await embed(batch.map(chunk => chunk.text), vectorConfig, { signal });
            if (isCancelled()) return cancelled();
            phase = 'write';
            activity.update({ state: 'saving', activeUnits: 0 });
            await saveChunkVectors(chatId, batch.map((chunk, index) => ({
                chunkId: chunk.chunkId, vector: embeddings[index], sourceHash: inputDigest('chunk', chunk.text),
            })), fingerprint);
            repaired += batch.length;
            activity.update({ completed: repaired });
            onProgress?.(repaired, missing.length);
        }
        if (isCancelled()) return cancelled();
        phase = 'metadata';
        if (meta.lastChunkFloor !== chat.length - 1 || meta.fingerprint !== fingerprint) {
            await updateMeta(chatId, { lastChunkFloor: chat.length - 1, fingerprint });
        }
        return { success: true, repaired };
    } catch (error) {
        if (isCancelled()) return cancelled();
        if (phase === 'embedding') {
            return { success: false, repaired, ...getEmbeddingFailureDetails(error), error };
        }
        const code = phase === 'materials'
            ? 'chunk_write_failed'
            : phase === 'write'
                ? 'vector_write_failed'
                : phase === 'metadata'
                    ? 'metadata_write_failed'
                    : 'chunk_read_failed';
        return { success: false, repaired, code, error };
    }
}
