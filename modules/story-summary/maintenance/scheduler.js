import { memoryFailureCode, requireMemory } from './errors.js';
import { memoryRunError } from './run-feedback.js';

/** One in-memory execution slot. Automatic triggers coalesce; an explicit question has priority. */
export function createMemoryScheduler({ enabled, run, changed = () => {} }) {
    let active = null;
    let pending = null;
    let interaction = null;
    let last = null;
    let drainPromise = null;
    const seen = new WeakSet();
    const notify = () => changed();
    const cancelled = () => ({ status: 'cancelled', code: 'cancelled' });
    const owns = (task, chatId, identity) => task?.chatId === chatId && (identity === undefined || task.identity === identity);

    async function drain() {
        while (interaction || pending) {
            const manual = interaction;
            const task = manual ? manual.task : pending;
            if (manual) interaction = null;
            else pending = null;
            if (!manual && !enabled()) { notify(); continue; }
            const controller = new AbortController();
            active = { ...task, kind: manual ? 'chat' : 'auto', controller, phase: 'running' };
            notify();
            try {
                const result = await (manual ? manual.execute : run)(task, controller.signal, (phase, progress) => {
                    active.phase = phase;
                    if (progress) active.progress = progress;
                    notify();
                });
                if (manual) manual.resolve(result);
                else {
                    last = { chatId: task.chatId, identity: task.identity, status: result.status || 'completed',
                        code: result.error ? memoryFailureCode(result.error) : result.code,
                        receiptId: result.error?.receiptId || result.receipt?.id, index: result.index, progress: active.progress,
                        ...(result.error ? { error: memoryRunError(result.error) } : {}) };
                    if (last.code === 'conflict') last.scope = task;
                }
            } catch (error) {
                if (manual && controller.signal.aborted && !error.uncertain) manual.resolve(cancelled());
                else if (manual) manual.reject(error);
                else {
                    last = { chatId: task.chatId, identity: task.identity, status: error.uncertain ? 'unconfirmed' : controller.signal.aborted ? 'cancelled' : 'failed',
                        code: memoryFailureCode(error), receiptId: error.receiptId, progress: active.progress,
                        error: memoryRunError(error) };
                    if (last.status === 'failed' && last.code === 'conflict') last.scope = task;
                }
            } finally {
                active = null;
                notify();
            }
        }
        drainPromise = null;
    }
    function kick() {
        if (!drainPromise) drainPromise = Promise.resolve().then(drain);
        notify();
    }
    function cancelInteraction() {
        interaction?.resolve(cancelled());
        interaction = null;
        if (active?.kind === 'chat') active.controller.abort();
    }
    function cancelAutomatic() {
        pending = null;
        if (active?.kind === 'auto') active.controller.abort();
        if (last?.scope) delete last.scope;
    }
    return {
        submitted(batch) {
            const { identity } = batch;
            if (seen.has(batch)) return;
            seen.add(batch);
            if (!enabled()) return;
            if (active && !owns(active, batch.chatId, identity)) active.controller.abort();
            const queued = owns(pending, batch.chatId, identity) ? pending : null;
            const abandoned = owns(last, batch.chatId, identity) && batch.cutoff > last.scope?.cutoff ? last.scope : null;
            pending = { ...batch, identity, start: Math.min(batch.start, queued?.start ?? batch.start, abandoned?.start ?? batch.start) };
            kick();
        },
        interact(task, execute) {
            requireMemory(!interaction && (active?.kind !== 'chat' || active.controller.signal.aborted), 'memory_chat_busy');
            const result = new Promise((resolve, reject) => { interaction = { task, execute, resolve, reject }; });
            kick();
            return result;
        },
        cancel() { cancelAutomatic(); cancelInteraction(); notify(); },
        cancelAutomatic() { cancelAutomatic(); notify(); },
        cancelInteraction() { cancelInteraction(); notify(); },
        takeover() { if (interaction && active?.kind === 'auto') active.controller.abort(); notify(); },
        snapshot(chatId, identity) {
            const outcome = { ...last };
            delete outcome.scope;
            delete outcome.identity;
            return active?.kind === 'auto' && owns(active, chatId, identity)
                ? { status: active.phase, cutoff: active.cutoff + 1, progress: active.progress }
                : owns(pending, chatId, identity) ? { status: 'queued' } : owns(last, chatId, identity) ? outcome : { status: 'idle' };
        },
        settled: () => drainPromise || Promise.resolve(),
    };
}
