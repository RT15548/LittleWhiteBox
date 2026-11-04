import { VAREVENT_COPY } from './copy.js';

const REPLY_TYPES = new Set(['normal', 'regenerate', 'swipe', 'continue']);
// saveReply normalizes regenerated messages to normal and non-stream continuations to appendFinal.
const RECEIVED_TYPES = new Set([...REPLY_TYPES, 'append', 'appendFinal']);
const signature = message => ({ message, text: message?.mes, swipe: message?.swipe_id ?? 0, started: String(message?.gen_started ?? '') });
const sameReply = (left, right) => left.message === right.message && left.text === right.text
    && left.swipe === right.swipe && left.started === right.started;

/** Ephemeral owner of exactly one host generation, never stored in chat metadata. */
export function createEventRun({ getContext, execute, report }) {
    let active = null;

    function current(run) {
        const ctx = getContext();
        if (!run || active !== run || run.abort.signal.aborted || run.complete
            || String(ctx?.chatId ?? '') !== run.chatId || ctx?.chat !== run.chat) return false;
        if (!run.target) return true;
        const message = ctx.chat[run.target.id];
        // Normal variable-macro writeback changes mes after reception. Identity,
        // swipe and generation stamp own the reply; user edits cancel via events.
        return message === run.target.message && (message?.swipe_id ?? 0) === run.target.swipe
            && String(message?.gen_started ?? '') === run.target.started;
    }

    function cancel() {
        if (!active) return;
        active.abort.abort();
        clearTimeout(active.timer);
        active.resume?.();
        active.actions.length = 0;
        active = null;
    }

    function begin(type, _options = {}, dryRun = false) {
        if (dryRun) return;
        cancel();
        if (!REPLY_TYPES.has(type || 'normal')) return;
        const ctx = getContext();
        if (!ctx?.chatId || !Array.isArray(ctx.chat)) return;
        active = {
            type: type || 'normal', prepared: false, removedForRegenerate: false,
            chatId: String(ctx.chatId), chat: ctx.chat, baseline: ctx.chat.map(signature),
            actions: [], ended: false, target: null, complete: false, abort: new AbortController(),
            flushing: null, timer: null, resume: null,
        };
    }

    function enqueue(event, source) {
        if (!current(active) || active.ended || !event?.js?.trim()) return;
        active.actions.push({ ...event, source });
    }

    function received(id, type) {
        const run = active, ctx = getContext();
        if (!current(run) || !Number.isInteger(id) || id !== ctx.chat.length - 1) return;
        if (type && !RECEIVED_TYPES.has(type)) return;
        const message = ctx.chat[id];
        if (!message || message.is_user) return;
        const next = signature(message), previous = run.baseline[id];
        if (previous && sameReply(previous, next)) return;
        const processor = ctx.streamingProcessor;
        if (processor && (processor.isStopped || processor.abortController?.signal.aborted)) { cancel(); return; }
        run.target = { ...next, id };
        return flush();
    }

    function ended() {
        const run = active;
        if (!current(run)) return;
        const processor = getContext().streamingProcessor;
        if (processor && (!processor.isFinished || processor.isStopped || processor.abortController?.signal.aborted)) {
            cancel(); return;
        }
        run.ended = true;
        return flush();
    }

    function flush() {
        const run = active;
        if (!current(run) || !run.ended || !run.target) return Promise.resolve();
        if (run.flushing) return run.flushing;
        run.flushing = (async () => {
            // Host stop/end notifications can occur in either order in the same turn.
            await new Promise(resolve => { run.resume = resolve; run.timer = setTimeout(resolve, 0); });
            run.resume = null; run.timer = null;
            while (current(run) && run.actions.length) {
                const event = run.actions.shift();
                const assertCurrent = () => {
                    if (!current(run)) throw new DOMException(VAREVENT_COPY.invalidRun, 'AbortError');
                };
                try { await execute(event.js, assertCurrent, run.abort.signal); }
                catch (error) {
                    if (error?.name !== 'AbortError') report(event, error);
                }
            }
            run.actions.length = 0;
            run.complete = true;
        })();
        return run.flushing;
    }

    function prepare() {
        const run = active;
        if (!current(run) || run.ended) return;
        run.prepared = true; run.actions.length = 0;
        return (event, source) => { if (active === run) enqueue(event, source); };
    }
    function changed(kind, id) {
        const run = active, chat = getContext()?.chat;
        // Generate('regenerate') removes its old reply after STARTED, before prompt assembly.
        if (current(run) && kind === 'MESSAGE_DELETED' && run.type === 'regenerate'
            && !run.prepared && !run.removedForRegenerate && id === run.baseline.length - 1
            && chat.length === id && chat.every((message, index) => message === run.baseline[index].message)) {
            run.removedForRegenerate = true;
            return;
        }
        cancel();
    }
    return { begin, prepare, enqueue, received, ended, flush, cancel, changed };
}

/** Compatibility with persisted queues from <=3.2.4 ends at chat-load intake. */
export function removeLegacyEventQueue(ctx) {
    if (!ctx?.chatMetadata || !Object.hasOwn(ctx.chatMetadata, 'LWB_PENDING_VAREVENT_BLOCKS')) return;
    delete ctx.chatMetadata.LWB_PENDING_VAREVENT_BLOCKS;
    ctx.saveMetadataDebounced?.();
}
