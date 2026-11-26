import limits from './image-job-limits.cjs';

// Source indices own slots for the whole reply. Each submitted journal and
// request share a fresh, dense index space scoped to that single job.
export async function runPreparedImageBatches({ pending, items, available, discard, fail, signal, submit }) {
    while (pending.size) {
        signal?.throwIfAborted();
        const indices = [];
        for (const index of pending) {
            if (!available(items[index])) {
                pending.delete(index);
                await discard(index);
            } else {
                indices.push(index);
                if (indices.length === limits.MAX_JOB_ITEMS) break;
            }
        }
        if (!indices.length) return;

        const isCreateCurrent = record => {
            signal?.throwIfAborted();
            let current = true;
            for (const [local, index] of indices.entries()) {
                const item = items[index];
                if (!available(item) || record.items[local].discarded) {
                    item.discarded = true;
                    current = false;
                }
            }
            return current;
        };
        try {
            if ((await submit(indices, isCreateCurrent))?.notSubmitted) continue;
        } catch (error) {
            // The current journal may still own paid work. Later chunks never
            // acquired a journal and must not be left looking recoverable.
            for (const index of pending) if (!indices.includes(index)) await fail(index, error);
            throw error;
        }
        for (const index of indices) pending.delete(index);
    }
}
