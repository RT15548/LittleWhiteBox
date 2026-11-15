import { getAllChunks, getChunkVectorDescriptors, getMeta, updateMeta, saveChunks, saveChunkVectors, deleteChunkVectorsByIds } from '../storage/chunk-store.js';
import { collectChunkMaterials } from './chunk-materials.js';
import { getContext } from '../../../../../../../extensions.js';
import { getChatIdentity } from '../../data/chat-identity.js';
import { getEngineFingerprint } from '../utils/embedder.js';
import { embedForStorage, acknowledgeStoredEmbeddings } from '../runtime/embedding-receipts.js';
import { getEmbeddingFailureDetails } from '../llm/embedding-failure.js';
import { selectChunksForRepair } from './chunk-repair-policy.js';
import { inputDigest } from '../utils/vector-input-digest.js';
import { orphanVectorIds } from '../utils/vector-source.js';
import { trackVectorActivity } from '../runtime/vector-activity.js';

const REPAIR_BATCH_SIZE = 20;

/** 自动维护与手动补齐共用：按已保存材料补向量，不重新解释已有楼层。 */
export async function repairMissingChunks(options) {
    return trackVectorActivity({ chatId: options.chatId, phase: 'l1-vector-repair', api: options.vectorConfig?.embeddingApi, unit: 'chunks' },
        activity => repairMissingChunksInner(options, activity));
}

async function repairMissingChunksInner({ chatId, chat, vectorConfig, signal, shouldCancel, onProgress, retryFailed = false, commit = task => task() }, activity) {
    const identity = getChatIdentity(getContext());
    const isCancelled = () => signal?.aborted || shouldCancel?.() === true
        || getChatIdentity(getContext()) !== identity;
    let repaired = 0;
    const chunks = [];
    let phase = 'read';
    const cancelled = () => ({ success: false, cancelled: true, repaired, chunks });
    try {
        if (isCancelled()) return cancelled();
        if (!identity) return { success: false, repaired, chunks, code: 'no_active_chat' };
        const fingerprint = getEngineFingerprint(vectorConfig);
        const meta = await getMeta(chatId);
        if (meta.fingerprint && meta.fingerprint !== fingerprint) {
            return { success: false, repaired, chunks, code: 'fingerprint_mismatch' };
        }
        const [stored, vectors] = await Promise.all([getAllChunks(chatId), getChunkVectorDescriptors(chatId)]);
        if (isCancelled()) return cancelled();
        const materials = collectChunkMaterials(chat, stored, vectors);
        const missing = selectChunksForRepair(materials, stored, vectors, fingerprint);
        const obsoleteIds = orphanVectorIds(vectors, new Set(materials.map(chunk => chunk.chunkId)), 'chunkId');
        if (obsoleteIds.length) {
            phase = 'write';
            await commit(() => deleteChunkVectorsByIds(chatId, obsoleteIds));
            if (isCancelled()) return cancelled();
        }
        activity.update({ total: missing.length });
        const storedIds = new Set(stored.map(chunk => chunk.chunkId));
        const newMaterials = materials.filter(chunk => !storedIds.has(chunk.chunkId));
        if (newMaterials.length) {
            phase = 'materials';
            await commit(() => saveChunks(chatId, newMaterials));
            chunks.push(...newMaterials);
            if (isCancelled()) return cancelled();
        }
        onProgress?.(0, missing.length);
        for (let i = 0; i < missing.length; i += REPAIR_BATCH_SIZE) {
            if (isCancelled()) return cancelled();
            const batch = missing.slice(i, i + REPAIR_BATCH_SIZE);
            phase = 'embedding';
            activity.update({ state: 'embedding', activeUnits: batch.length });
            const texts = batch.map(chunk => chunk.text);
            const embeddings = await embedForStorage(texts, vectorConfig, { chatId: identity, signal, retryFailed });
            if (isCancelled()) return cancelled();
            phase = 'write';
            activity.update({ state: 'saving', activeUnits: 0 });
            await commit(() => saveChunkVectors(chatId, batch.map((chunk, index) => ({
                chunkId: chunk.chunkId, vector: embeddings[index], sourceHash: inputDigest('chunk', chunk.text),
            })), fingerprint));
            acknowledgeStoredEmbeddings(texts, vectorConfig, { chatId: identity });
            repaired += batch.length;
            activity.update({ completed: repaired });
            onProgress?.(repaired, missing.length);
        }
        if (isCancelled()) return cancelled();
        phase = 'metadata';
        if (meta.lastChunkFloor !== chat.length - 1 || meta.fingerprint !== fingerprint) {
            await commit(() => updateMeta(chatId, { lastChunkFloor: chat.length - 1, fingerprint }));
        }
        return { success: true, repaired, chunks };
    } catch (error) {
        if (isCancelled()) return cancelled();
        if (phase === 'embedding') {
            return { success: false, repaired, chunks, ...getEmbeddingFailureDetails(error), error };
        }
        const code = phase === 'materials'
            ? 'chunk_write_failed'
            : phase === 'write'
                ? 'vector_write_failed'
                : phase === 'metadata'
                    ? 'metadata_write_failed'
                    : 'chunk_read_failed';
        return { success: false, repaired, chunks, code, error };
    }
}
