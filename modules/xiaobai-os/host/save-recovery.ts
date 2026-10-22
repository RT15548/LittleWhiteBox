import type { XiaobaiOsFileControls } from '../kernel/contracts.js';
import { observeBackgroundTask } from '../../../shared/common/async-errors.js';

/** Recover the existing candidate; never replay the operation that produced it. */
export function startSaveRecovery(files: XiaobaiOsFileControls): () => void {
    let stopped = false;
    let running = false;
    let delay = 2_000;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function schedule(): void {
        if (stopped || running || timer !== undefined) { return; }
        if (files.getFileState() !== 'unconfirmed') { delay = 2_000; return; }
        timer = setTimeout(() => {
            timer = undefined;
            observeBackgroundTask(recover(), { source: import.meta.url, operation: 'recover' });
        }, delay);
    }

    async function recover(): Promise<void> {
        if (stopped || files.getFileState() !== 'unconfirmed') { return; }
        running = true;
        try {
            // The coordinator reads back first, preserves commit IDs and rechecks
            // the original owner's guard before sending the same candidate again.
            await files.retryPending({ chatPersistence: 'host', beforeRetry: () => !stopped });
        } catch (error) {
            console.debug('[Xiaobai OS] Background save recovery', error);
        } finally {
            running = false;
            delay = Math.min(delay * 2, 30_000);
            schedule();
        }
    }

    const unsubscribe = files.subscribeFileState(schedule);
    schedule();
    return () => {
        stopped = true;
        unsubscribe();
        if (timer !== undefined) { clearTimeout(timer); }
    };
}
