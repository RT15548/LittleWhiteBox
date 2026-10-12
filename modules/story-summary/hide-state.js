// Automatic hiding owns the host's message visibility while enabled, as before.
// Host flags are a projection, not a second boundary. All bookkeeping below is
// session-local; loading/deleting a chat audits its saved flags from scratch.
export function getHiddenThrough({ enabled, summaryBoundary, vectorBoundary = -1,
    useVectorBoundary, keepVisibleCount, length }) {
    if (!enabled || !Number.isInteger(summaryBoundary) || summaryBoundary < 0) return -1;
    const boundary = useVectorBoundary && Number.isInteger(vectorBoundary) && vectorBoundary >= 0
        ? vectorBoundary : summaryBoundary;
    // Clamp before reserving visible messages, including after chat deletion.
    return Math.max(-1, Math.min(boundary, length - 1) - keepVisibleCount);
}

export function createHideStateController({
    getState,
    getPendingSave,
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
        // The host reorders this array in place without a move event. Keep only
        // positional object references, not copies of messages or their flags.
        const messages = Array.isArray(state.chat) ? state.chat.slice() : [];
        return { ...state, messages, length: messages.length };
    }

    function matchesMessagePrefix(state, messages) {
        return messages.length <= (state.chat?.length || 0)
            && messages.every((message, id) => state.chat[id] === message);
    }

    function ownsCurrentChat(state, current = getState()) {
        return state.chatId === current.chatId && state.chat === current.chat;
    }

    function isCurrent(state, version) {
        if (version !== revision) return false;
        const current = getState();
        return ownsCurrentChat(state, current)
            && state.length === (current.chat?.length || 0)
            && state.enabled === current.enabled
            && state.summaryBoundary === current.summaryBoundary
            && state.useVectorBoundary === current.useVectorBoundary
            && state.keepVisibleCount === current.keepVisibleCount
            && matchesMessagePrefix(current, state.messages);
    }

    function apply(state, end, messageId) {
        if (!state.chatId || !Array.isArray(state.chat)) return 0;
        const previous = applied;
        const audit = !previous || !ownsCurrentChat(previous, state)
            || !matchesMessagePrefix(state, previous.messages);
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
            updateRange(Math.max(previous.messages.length, Math.max(previous.end, end) + 1), state.length - 1);
            if (Number.isInteger(messageId) && messageId >= 0) updateRange(messageId, messageId);
        }
        applied = { chatId: state.chatId, chat: state.chat, messages: state.messages, end };
        if (changed) refresh();
        return changed;
    }

    async function saveChanges(state, changed) {
        if (!changed) return;
        try {
            // Clear restores flags immediately, even during a memory commit.
            // Wait only to save; never rewrite flags or save another chat later.
            while (ownsCurrentChat(state)) {
                const pending = getPendingSave();
                if (pending) {
                    await pending;
                    continue;
                }
                await save(state);
                return;
            }
        } catch (error) {
            onError(error, 'save');
        }
    }

    async function reconcile({ full = true, messageId } = {}) {
        if (full) applied = null;
        const version = invalidate();
        const owner = getState();
        while (version === revision && ownsCurrentChat(owner)) {
            // A pending commit temporarily blocks consumption; it does not mean
            // hiding was disabled. Capture the projection only after settlement.
            const pending = getPendingSave();
            if (pending) {
                await pending;
                continue;
            }
            const state = capture();
            let vectorBoundary = -1;
            let readError = null;
            if (state.chatId && state.length > 0 && state.enabled && state.summaryBoundary >= 0 && state.useVectorBoundary) {
                try {
                    vectorBoundary = await readVectorBoundary(state.chatId);
                } catch (error) {
                    // Only a currently valid summary is a safe fallback. The owner
                    // supplies enabled=false when the summary itself is unusable.
                    readError = error;
                }
            }
            // A commit may have started during the vector read. Discard that
            // boundary and recapture after saving rather than publishing it.
            if (getPendingSave()) continue;
            if (!isCurrent(state, version)) return;
            const changed = apply(state, getHiddenThrough({ ...state, vectorBoundary }), messageId);
            if (readError) onError(readError, 'boundary');
            await saveChanges(state, changed);
            return;
        }
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
        cancel({ resetProjection = true } = {}) {
            invalidate();
            if (resetProjection) applied = null;
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
