import { buildIncrementalChunks } from './chunk-builder.js';
import { repairMissingChunks } from './chunk-repair.js';
import { getMeta, hasStoredChunksAfterFloor } from '../storage/chunk-store.js';

// Keep incremental retries/atomic writes for new floors, then check actual
// records for holes behind the watermark. Restored/partially rebuilt chunks
// beyond the watermark use gap repair directly, without buying them again.
export async function maintainChunks(options) {
    let incremental = { built: 0, chunks: [] };
    try {
        const { lastChunkFloor } = await getMeta(options.targetChatId);
        const storedBeyondProgress = await hasStoredChunksAfterFloor(options.targetChatId, lastChunkFloor, options.chatSnapshot.length);
        if (!storedBeyondProgress) {
            incremental = await buildIncrementalChunks(options);
            if (!incremental.success) return incremental;
        }
        const repair = await repairMissingChunks({
            chatId: options.targetChatId,
            chat: options.chatSnapshot,
            vectorConfig: options.vectorConfig,
            signal: options.signal,
            shouldCancel: options.shouldCancel,
        });
        return { ...incremental, ...repair };
    } catch (error) {
        return {
            ...incremental, success: false, code: 'chunk_read_failed', error,
            cancelled: options.signal?.aborted || options.shouldCancel?.() === true,
        };
    }
}
