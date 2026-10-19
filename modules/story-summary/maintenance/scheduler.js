import { memoryFailureCode } from './errors.js';

/** In-memory only. A settings page never owns this queue or revives paid work on reload. */
export function createMemoryScheduler({ enabled, run, changed = () => {} }) {
    let active = null;
    let pending = null;
    let last = null;
    let drainPromise = null;
    const seen = new WeakSet();
    const notify = () => changed();

    async function drain() {
        while (pending) {
            const task = pending;
            pending = null;
            if (!enabled()) { notify(); continue; }
            const controller = new AbortController();
            active = { ...task, controller, phase: 'running' };
            notify();
            try {
                const result = await run(task, controller.signal, (phase, progress) => {
                    if (active) {
                        active.phase = phase;
                        if (progress) active.progress = progress;
                    }
                    notify();
                });
                last = { chatId: task.chatId, status: result.status || 'completed',
                    code: result.error ? memoryFailureCode(result.error) : result.code,
                    receiptId: result.error?.receiptId || result.receipt?.id, index: result.index, progress: active.progress };
                if (last.code === 'conflict') last.scope = task;
            } catch (error) {
                last = { chatId: task.chatId, status: error.uncertain ? 'unconfirmed' : controller.signal.aborted ? 'cancelled' : 'failed',
                    code: memoryFailureCode(error), receiptId: error.receiptId, progress: active.progress };
                // A new summary can change memory before its confirmed-save notification arrives.
                // Keep only the abandoned scope, never the draft or a request to retry the model.
                if (last.status === 'failed' && last.code === 'conflict') last.scope = task;
            } finally {
                active = null;
                notify();
            }
        }
        drainPromise = null;
    }

    function enqueue(task) {
        if (!enabled()) return;
        if (active && active.chatId !== task.chatId) active.controller.abort();
        const queued = pending?.chatId === task.chatId ? pending : null;
        const abandoned = last?.chatId === task.chatId && task.cutoff > last.scope?.cutoff ? last.scope : null;
        pending = { ...task,
            start: Math.min(task.start, queued?.start ?? task.start, abandoned?.start ?? task.start),
        };
        if (!drainPromise) drainPromise = Promise.resolve().then(drain);
        notify();
    }

    return {
        submitted(batch) {
            if (seen.has(batch)) return;
            seen.add(batch);
            enqueue(batch);
        },
        cancel() {
            pending = null;
            active?.controller.abort();
            if (last?.scope) delete last.scope;
            notify();
        },
        snapshot(chatId) {
            const outcome = { ...last };
            delete outcome.scope;
            return active?.chatId === chatId ? { status: active.phase, cutoff: active.cutoff + 1, progress: active.progress }
                : pending?.chatId === chatId ? { status: 'queued' } : last?.chatId === chatId ? outcome : { status: 'idle' };
        },
        settled: () => drainPromise || Promise.resolve(),
    };
}
