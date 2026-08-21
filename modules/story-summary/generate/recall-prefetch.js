import { createAbortError } from '../../../shared/common/abort-utils.js';

const DEFAULT_POLL_MS = 16;
const DEFAULT_MAX_AGE_MS = 30_000;

export function getRecallPrefetchStartAction(type, params, isDryRun) {
    if (isDryRun) return 'ignore';
    const normalizedType = type || 'normal';
    if (normalizedType !== 'normal' || params?.automatic_trigger) return 'cancel-only';
    return 'watch';
}

function settle(promise) {
    return Promise.resolve(promise).then(
        value => ({ ok: true, value }),
        error => ({ ok: false, error }),
    );
}

/**
 * Owns the one transient Story Summary recall run that may exist for a host
 * generation. It never owns Prompt state; the generate interceptor remains the
 * only place allowed to publish a prepared result.
 */
export function createRecallPrefetchCoordinator(options) {
    if (typeof options?.getContext !== 'function') throw new TypeError('getContext must be a function');
    if (typeof options?.prepare !== 'function') throw new TypeError('prepare must be a function');

    const getContext = options.getContext;
    const prepare = options.prepare;
    const pollMs = Math.max(0, Number(options.pollMs) || DEFAULT_POLL_MS);
    const maxAgeMs = Math.max(1, Number(options.maxAgeMs) || DEFAULT_MAX_AGE_MS);
    const schedule = options.setTimeout || globalThis.setTimeout.bind(globalThis);
    const unschedule = options.clearTimeout || globalThis.clearTimeout.bind(globalThis);
    const now = options.now || (() => performance.now());

    let current = null;

    function clearTimers(slot) {
        if (slot.pollTimer !== null) {
            unschedule(slot.pollTimer);
            slot.pollTimer = null;
        }
        if (slot.expiryTimer !== null) {
            unschedule(slot.expiryTimer);
            slot.expiryTimer = null;
        }
    }

    function clearPollTimer(slot) {
        if (slot.pollTimer === null) return;
        unschedule(slot.pollTimer);
        slot.pollTimer = null;
    }

    function detachDispatch(slot) {
        slot.dispatchSignal?.removeEventListener?.('abort', slot.abortFromDispatch);
        slot.dispatchSignal = null;
        slot.abortFromDispatch = null;
    }

    function detachSource(slot) {
        slot.sourceSignal?.removeEventListener?.('abort', slot.abortFromSource);
        slot.sourceSignal = null;
        slot.abortFromSource = null;
    }

    function abortSlot(slot, reason, abortDispatch = false, retainForJoin = false) {
        if (!slot || slot.phase === 'idle') return;
        if (slot.phase === 'cancelled') {
            if (retainForJoin) slot.cancelReason = reason;
            else if (current === slot) current = null;
            return;
        }
        slot.cancelReason = reason;
        slot.phase = 'cancelled';
        clearTimers(slot);
        detachDispatch(slot);
        detachSource(slot);
        if (abortDispatch) slot.runContext?.abort?.(true);
        if (!slot.controller.signal.aborted) {
            slot.controller.abort(createAbortError(`Story Summary recall ${reason}`));
        }
        if (!retainForJoin && current === slot) current = null;
    }

    function expireSlot(slot) {
        abortSlot(slot, 'prefetch-timeout', false, true);
    }

    function scheduleExpiry(slot) {
        const delay = Math.max(0, slot.deadlineAt - now());
        slot.expiryTimer = schedule(() => {
            slot.expiryTimer = null;
            expireSlot(slot);
        }, delay);
    }

    function startCompute(slot) {
        if (slot.outcome) return;
        slot.computeStartedAt = now();
        slot.outcome = settle(Promise.resolve().then(() => {
            if (slot.controller.signal.aborted) {
                throw slot.controller.signal.reason || createAbortError('Story Summary recall cancelled');
            }
            return prepare(slot.type, slot.controller.signal);
        }));
    }

    function schedulePoll(slot) {
        slot.pollTimer = schedule(() => {
            slot.pollTimer = null;
            if (current !== slot || slot.phase !== 'watching') return;

            const context = getContext();
            const chat = context?.chat;
            if (String(context?.chatId || '') !== slot.chatId || !Array.isArray(chat)) {
                abortSlot(slot, 'chat-changed');
                return;
            }

            const messageIndex = chat.length - 1;
            const message = chat[messageIndex];
            if (chat.length > slot.initialLength && message?.is_user === true) {
                slot.messageIndex = messageIndex;
                slot.capturedRef = message;
                slot.phase = 'recalling';
                startCompute(slot);
                return;
            }

            schedulePoll(slot);
        }, pollMs);
    }

    function createSlot({ chatId, type, initialLength, phase, deadlineAt = null }) {
        return {
            phase,
            chatId,
            type,
            initialLength,
            messageIndex: null,
            capturedRef: null,
            controller: new AbortController(),
            outcome: null,
            pollTimer: null,
            expiryTimer: null,
            runContext: null,
            dispatchSignal: null,
            abortFromDispatch: null,
            sourceSignal: null,
            abortFromSource: null,
            cancelReason: null,
            computeStartedAt: null,
            joinedAt: null,
            deadlineAt: Number.isFinite(deadlineAt) ? deadlineAt : now() + maxAgeMs,
        };
    }

    function attachSource(slot, signal) {
        if (!signal?.addEventListener) return;

        const abortFromSource = () => {
            abortSlot(slot, 'generation-signal-aborted', false, true);
        };
        slot.sourceSignal = signal;
        slot.abortFromSource = abortFromSource;
        signal.addEventListener('abort', abortFromSource, { once: true });
        if (signal.aborted) abortFromSource();
    }

    function attachDispatch(slot, runContext) {
        slot.runContext = runContext || null;
        const signal = runContext?.signal;
        if (!signal) return;

        const abortFromDispatch = () => abortSlot(slot, 'dispatch-aborted');
        slot.dispatchSignal = signal;
        slot.abortFromDispatch = abortFromDispatch;
        signal.addEventListener('abort', abortFromDispatch, { once: true });
        if (signal.aborted) abortFromDispatch();
    }

    function startWatching({ chatId, type = 'normal', initialLength, signal = null }) {
        if (!chatId) return null;
        if (current) abortSlot(current, 'superseded', true);

        const slot = createSlot({
            chatId: String(chatId),
            type,
            initialLength: Math.max(0, Number(initialLength) || 0),
            phase: 'watching',
        });
        current = slot;
        attachSource(slot, signal);
        if (slot.controller.signal.aborted) return slot;
        scheduleExpiry(slot);
        schedulePoll(slot);
        return slot;
    }

    function startJoined({
        chatId,
        type,
        focusRef,
        runContext,
        sourceSignal = null,
        deadlineAt = null,
    }) {
        const context = getContext();
        const chat = Array.isArray(context?.chat) ? context.chat : [];
        const slot = createSlot({
            chatId: String(chatId || ''),
            type,
            initialLength: chat.length,
            phase: 'joined',
            deadlineAt,
        });
        slot.joinedAt = now();
        slot.messageIndex = focusRef ? chat.lastIndexOf(focusRef) : null;
        slot.capturedRef = focusRef || null;
        current = slot;
        attachSource(slot, sourceSignal);
        if (!slot.controller.signal.aborted) attachDispatch(slot, runContext);
        if (!slot.controller.signal.aborted && now() >= slot.deadlineAt) expireSlot(slot);
        if (!slot.controller.signal.aborted) {
            scheduleExpiry(slot);
            startCompute(slot);
        }
        return { slot, path: 'fallback', remainingMs: Math.max(0, slot.deadlineAt - now()) };
    }

    function join({ chatId, type, focusRef, runContext }) {
        const slot = current;
        const context = getContext();
        const chat = Array.isArray(context?.chat) ? context.chat : [];
        const focusIndex = chat.length - 1;
        const sameChat = !!slot
            && slot.chatId === String(chatId || '')
            && String(context?.chatId || '') === slot.chatId;
        const terminalMatches = sameChat
            && slot.phase === 'cancelled'
            && (slot.type === null || slot.type === type);
        const sameGeneration = !!slot
            && slot.type === 'normal'
            && type === 'normal'
            && sameChat;

        if (sameGeneration && now() >= slot.deadlineAt && slot.phase !== 'cancelled') {
            expireSlot(slot);
        }
        if (terminalMatches || (sameGeneration && slot.phase === 'cancelled')) {
            slot.joinedAt = now();
            return {
                slot,
                path: slot.cancelReason || 'cancelled',
                remainingMs: 0,
            };
        }

        const canReuse = !!slot
            && sameGeneration
            && slot.capturedRef
            && slot.capturedRef === focusRef
            && slot.messageIndex === focusIndex
            && chat[slot.messageIndex] === slot.capturedRef;

        if (!canReuse) {
            const sourceSignal = sameGeneration ? slot?.sourceSignal : null;
            const deadlineAt = sameGeneration ? slot?.deadlineAt : null;
            if (slot) abortSlot(slot, 'prefetch-mismatch', true);
            return startJoined({
                chatId,
                type,
                focusRef,
                runContext,
                sourceSignal,
                deadlineAt,
            });
        }

        clearPollTimer(slot);
        slot.phase = 'joined';
        slot.joinedAt = now();
        attachDispatch(slot, runContext);
        return {
            slot,
            path: 'prefetch',
            remainingMs: Math.max(0, slot.deadlineAt - now()),
        };
    }

    function cancel(reason = 'cancelled', options = {}) {
        const {
            abortDispatch = false,
            retainForJoin = false,
            chatId = null,
            type = null,
        } = options;
        const targetChatId = chatId ? String(chatId) : null;
        if (current && retainForJoin && targetChatId && current.chatId !== targetChatId) {
            abortSlot(current, reason, abortDispatch);
        }
        if (!current && retainForJoin && chatId) {
            current = createSlot({
                chatId: targetChatId,
                type,
                initialLength: 0,
                phase: 'watching',
            });
        }
        if (!current) return null;
        const slot = current;
        abortSlot(slot, reason, abortDispatch, retainForJoin);
        return slot;
    }

    function finish(slot) {
        if (!slot) return;
        clearTimers(slot);
        detachDispatch(slot);
        detachSource(slot);
        if (current === slot) current = null;
        slot.phase = 'idle';
    }

    return Object.freeze({
        startWatching,
        join,
        cancel,
        finish,
        getCurrent: () => current,
    });
}
