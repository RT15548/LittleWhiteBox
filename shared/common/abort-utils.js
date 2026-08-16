export function createAbortError(message = 'Operation aborted') {
    if (typeof DOMException === 'function') {
        return new DOMException(message, 'AbortError');
    }
    const error = new Error(message);
    error.name = 'AbortError';
    return error;
}

export function mergeAbortSignals(...signals) {
    const sources = signals.filter(Boolean);
    if (!sources.length) return null;
    if (sources.length === 1) return sources[0];
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any === 'function') {
        return AbortSignal.any(sources);
    }

    const controller = new AbortController();
    const listenerController = new AbortController();
    const abortFrom = source => {
        listenerController.abort();
        controller.abort(source.reason);
    };
    for (const source of sources) {
        if (source.aborted) {
            abortFrom(source);
            break;
        }
        source.addEventListener('abort', () => abortFrom(source), {
            once: true,
            signal: listenerController.signal,
        });
    }
    return controller.signal;
}

function abortErrorFromSignal(signal, fallbackMessage) {
    if (signal?.reason && signal.reason.name === 'AbortError') {
        return signal.reason;
    }
    return createAbortError(fallbackMessage);
}

export function throwIfSignalAborted(signal, fallbackMessage = 'Operation aborted') {
    if (signal?.aborted) throw abortErrorFromSignal(signal, fallbackMessage);
}

export function waitForAbortableDelay(delayMs, signal) {
    const milliseconds = Math.max(0, Number(delayMs) || 0);
    throwIfSignalAborted(signal);
    return new Promise((resolve, reject) => {
        let settled = false;
        const finish = callback => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            signal?.removeEventListener('abort', onAbort);
            callback();
        };
        const onAbort = () => finish(() => reject(abortErrorFromSignal(signal, 'Operation aborted')));
        const timer = setTimeout(() => finish(resolve), milliseconds);
        signal?.addEventListener('abort', onAbort, { once: true });
        if (signal?.aborted) onAbort();
    });
}

/**
 * Race a task against an owned AbortController deadline.
 *
 * Cancellation is cooperative: this promise rejects as soon as the signal is
 * aborted, but JavaScript cannot forcibly stop task code that ignores it. The
 * task must pass the signal through awaited work, check it between stages, and
 * guard every final side effect with commitIfSignalActive().
 */
export async function runWithAbortDeadline(task, options = {}) {
    if (typeof task !== 'function') throw new TypeError('task must be a function');

    const timeoutMs = Number(options.timeoutMs);
    if (!Number.isFinite(timeoutMs) || timeoutMs < 0) {
        throw new RangeError('timeoutMs must be a non-negative finite number');
    }

    const controller = options.controller || new AbortController();
    const signal = controller.signal;
    const timeoutMessage = String(options.timeoutMessage || 'Operation deadline exceeded');
    throwIfSignalAborted(signal, timeoutMessage);

    let onAbort = null;
    const abortPromise = new Promise((_, reject) => {
        onAbort = () => reject(abortErrorFromSignal(signal, timeoutMessage));
        signal.addEventListener('abort', onAbort, { once: true });
    });
    const timeoutId = setTimeout(() => {
        controller.abort(createAbortError(timeoutMessage));
    }, timeoutMs);

    try {
        return await Promise.race([
            Promise.resolve().then(() => task(signal)),
            abortPromise,
        ]);
    } finally {
        clearTimeout(timeoutId);
        signal.removeEventListener('abort', onAbort);
    }
}

export function commitIfSignalActive(signal, commit) {
    if (typeof commit !== 'function') throw new TypeError('commit must be a function');
    if (signal?.aborted) return false;
    commit();
    return true;
}
