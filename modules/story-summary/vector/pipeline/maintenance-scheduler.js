import { isL0FloorDeferred } from './l0-eligibility.js';
import { observeBackgroundTask } from '../../../../shared/common/async-errors.js';

/** One replaceable timer. Continuation or a new floor re-admits deferred work. */
export function createVectorMaintenanceScheduler({ getContext, isStale, getQuietWaitMs, waitForReady, run }) {
    let timer = null;
    let waiting = null;
    function clear() {
        waiting?.abort();
        waiting = null;
        clearTimeout(timer);
        timer = null;
    }
    function schedule(delayMs, chatIdOverride = null) {
        clear();
        const { chatId, chat = [] } = getContext();
        const scheduledChatId = chatIdOverride || chatId;
        if (isStale(scheduledChatId) || isL0FloorDeferred(chat)) return;
        const controller = waiting = new AbortController();
        observeBackgroundTask(arm(), { source: import.meta.url, operation: 'schedule' });
        async function arm() {
            if (!await waitForReady(scheduledChatId, controller.signal)
                || controller.signal.aborted || isStale(scheduledChatId)) return;
            timer = setTimeout(() => {
                timer = null;
                if (isStale(scheduledChatId) || isL0FloorDeferred(getContext().chat || [])) return;
                const quietWait = getQuietWaitMs();
                if (quietWait > 0) {
                    schedule(quietWait, scheduledChatId);
                    return;
                }
                observeBackgroundTask(run(scheduledChatId), { source: import.meta.url, operation: 'run' });
            }, delayMs);
        }
    }
    return { schedule, clear };
}
