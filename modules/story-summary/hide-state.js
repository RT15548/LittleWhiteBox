// Automatic hiding owns only the floors it hid itself. The host's is_system flag
// is shared with manual hiding (eye button, /hide, scripts), so each floor this
// module hides carries OWNED_KEY beside it; floors hidden without it are never
// revealed. managed=false releases control without changing flags; enabled=false
// reveals owned floors only while the module still manages this chat. Explicit
// clear() is reserved for active repairs or the one-time disable transition.
// OWNED_KEY lives on the message itself (not extra, which the host replaces per
// swipe) so it moves with the floor on deletion, reordering and chat copies.
// OWNED_KEY means "inside the automatic range", not "last hidden by us": the host
// emits no event for manual hide/unhide, so a user who reveals and re-hides an
// owned floor leaves the mark in place. Inside the range such a floor would be
// re-hidden anyway; tracking DOM changes would still miss off-screen /hide.
import { SUMMARY_HIDDEN_KEY as OWNED_KEY } from './data/message-visibility.js';
// Chat-level marker (in this extension's chat metadata) that legacy unmarked
// automatic hiding has been adopted. Retire with OWNED_KEY.
export const HIDE_OWNERSHIP_CLAIMED_KEY = 'hideOwnershipClaimed';

export function countOwnedHidden(chat) {
    return (Array.isArray(chat) ? chat : []).reduce((count, message) => count + Number(!!message?.is_system && message[OWNED_KEY] === true), 0);
}

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
    markClaimed,
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
        return current.managed && ownsCurrentChat(state, current)
            && state.length === (current.chat?.length || 0)
            && state.enabled === current.enabled
            && state.summaryBoundary === current.summaryBoundary
            && state.useVectorBoundary === current.useVectorBoundary
            && state.keepVisibleCount === current.keepVisibleCount
            && matchesMessagePrefix(current, state.messages);
    }

    // Chats saved before ownership existed carry unmarked automatic hiding.
    // The old version re-projected the same range on every load, so the floors
    // it hid are exactly those this load would hide; when the summary is
    // unusable or hiding is off it had already revealed them, and any floor
    // still hidden is the user's. Adopt once per chat; later manual hides,
    // inside or outside the boundary, stay with the user.
    function claimLegacy(state, end) {
        for (let id = 0; id <= Math.min(end, state.length - 1); id++) {
            const message = state.chat[id];
            if (message?.is_system && message[OWNED_KEY] !== true) message[OWNED_KEY] = true;
        }
        markClaimed(state);
    }

    function apply(state, end, messageId, claim = false) {
        if (!state.chatId || !Array.isArray(state.chat)) return 0;
        const previous = applied;
        const audit = claim || !previous || !ownsCurrentChat(previous, state)
            || !matchesMessagePrefix(state, previous.messages);
        if (claim) claimLegacy(state, end);
        let changed = 0;
        const updateRange = (start, last) => {
            for (let id = Math.max(0, start); id <= Math.min(last, state.length - 1); id++) {
                const message = state.chat[id];
                if (!message) continue;
                if (id <= end) {
                    // A manual hide inside the range stays the user's.
                    if (message.is_system) continue;
                    message.is_system = true;
                    message[OWNED_KEY] = true;
                    renderMessage(id, true);
                } else {
                    if (message[OWNED_KEY] !== true) continue;
                    delete message[OWNED_KEY];
                    if (message.is_system) {
                        message.is_system = false;
                        renderMessage(id, false);
                    }
                }
                changed++;
            }
        };
        if (audit) {
            updateRange(0, state.length - 1);
        } else {
            updateRange(Math.min(previous.end, end) + 1, Math.max(previous.end, end));
            // New messages outside the moving boundary must not stay owned-hidden.
            updateRange(Math.max(previous.messages.length, Math.max(previous.end, end) + 1), state.length - 1);
            if (Number.isInteger(messageId) && messageId >= 0) updateRange(messageId, messageId);
        }
        applied = { chatId: state.chatId, chat: state.chat, messages: state.messages, end };
        // Adoption alone writes nothing: its marks ride the next host save, and an
        // unsaved adoption is simply repeated with the same result on next load.
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

    // false means superseded before application; callers may await a fresh projection.
    async function reconcile({ full = true, messageId } = {}) {
        if (full) applied = null;
        const version = invalidate();
        const owner = getState();
        while (version === revision && ownsCurrentChat(owner)) {
            // Stopping management is not a request to make the chat visible.
            // Only the explicit disable transition may restore flags once.
            if (!getState().managed) return true;
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
            if (!isCurrent(state, version)) return false;
            // Without the vector boundary the old range is unknown; adopt later.
            // An empty array may be a host reload window, not this chat's floors.
            const claim = !state.claimed && !readError && state.length > 0;
            const changed = apply(state, getHiddenThrough({ ...state, vectorBoundary }), messageId, claim);
            if (readError) onError(readError, 'boundary');
            await saveChanges(state, changed);
            return true;
        }
        return false;
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
            // Reveals owned floors only; an unadopted legacy chat waits for reconcile.
            const changed = apply(state, -1);
            // Chat-level disable also saves its metadata; that caller includes
            // these synchronous flag changes in the same host save.
            return persist ? saveChanges(state, changed) : Promise.resolve();
        },
    };
}
