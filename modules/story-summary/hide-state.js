// Automatic hiding owns the host's message visibility while enabled, as before.
// Host flags are a projection, not a second boundary. All bookkeeping below is
// session-local; loading/deleting a chat audits its saved flags from scratch.
export function createHideStateController({
    getState,
    readVectorBoundary,
    renderMessage,
    refresh,
    save,
    onError,
    debounceMs = 250,
}) {
    let revision = 0;
    let timer = null;
    let applied = null;

    function invalidate() {
        clearTimeout(timer);
        timer = null;
        return ++revision;
    }

    function capture() {
        const state = getState();
        return { ...state, length: state.chat?.length || 0 };
    }

    function isCurrent(state, version) {
        if (version !== revision) return false;
        const current = capture();
        return state.chatId === current.chatId
            && state.chat === current.chat
            && state.length === current.length
            && state.enabled === current.enabled
            && state.summaryBoundary === current.summaryBoundary
            && state.useVectorBoundary === current.useVectorBoundary
            && state.keepVisibleCount === current.keepVisibleCount;
    }

    function hideEnd(state, boundary) {
        if (!state.enabled || !Number.isInteger(boundary) || boundary < 0) return -1;
        // Clamp BEFORE reserving visible floors: stale metadata must never hide
        // the entire shortened chat. This uses message counts, never tokens.
        return Math.max(-1, Math.min(boundary, state.length - 1) - state.keepVisibleCount);
    }

    function apply(state, end) {
        if (!state.chatId || !Array.isArray(state.chat)) return 0;
        const previous = applied;
        const audit = !previous || previous.chat !== state.chat || previous.chatId !== state.chatId
            || state.length < previous.length;
        let changed = 0;
        const updateRange = (start, last) => {
            for (let id = Math.max(0, start); id <= Math.min(last, state.length - 1); id++) {
                const message = state.chat[id];
                const hidden = id <= end;
                if (!message || Boolean(message.is_system) === hidden) continue;
                message.is_system = hidden;
                renderMessage(id, hidden);
                changed++;
            }
        };
        if (audit) {
            updateRange(0, state.length - 1);
        } else {
            updateRange(Math.min(previous.end, end) + 1, Math.max(previous.end, end));
            // New messages outside the moving boundary must also be visible.
            updateRange(Math.max(previous.length, Math.max(previous.end, end) + 1), state.length - 1);
        }
        applied = { chatId: state.chatId, chat: state.chat, length: state.length, end };
        if (changed) refresh();
        return changed;
    }

    async function saveChanges(state, changed) {
        if (!changed) return;
        try {
            // No await between mutating flags/DOM and handing the save to the
            // host. Never write flags again after this asynchronous boundary.
            await save(state);
        } catch (error) {
            onError(error, 'save');
        }
    }

    async function reconcile({ full = true } = {}) {
        if (full) applied = null;
        const version = invalidate();
        const state = capture();
        let boundary = state.summaryBoundary;
        let readError = null;
        if (state.chatId && state.length > 0 && state.enabled && boundary >= 0 && state.useVectorBoundary) {
            try {
                const vectorBoundary = await readVectorBoundary(state.chatId);
                if (Number.isInteger(vectorBoundary) && vectorBoundary >= 0) boundary = vectorBoundary;
            } catch (error) {
                // Only a currently valid summary is a safe fallback. The owner
                // supplies enabled=false when the summary itself is unusable.
                readError = error;
            }
        }
        if (!isCurrent(state, version)) return;
        const changed = apply(state, hideEnd(state, boundary));
        if (readError) onError(readError, 'boundary');
        await saveChanges(state, changed);
    }

    return {
        reconcile,
        schedule() {
            invalidate();
            timer = setTimeout(() => {
                timer = null;
                reconcile({ full: false }).catch(error => onError(error, 'apply'));
            }, debounceMs);
        },
        cancel() {
            invalidate();
            applied = null;
        },
        clear({ persist = true } = {}) {
            invalidate();
            applied = null;
            const state = capture();
            // Immediate, independent of config, vector IO and shutdown queues.
            const changed = apply(state, -1);
            // Chat-level disable also saves its metadata; that caller includes
            // these synchronous flag changes in the same host save.
            return persist ? saveChanges(state, changed) : Promise.resolve();
        },
    };
}
