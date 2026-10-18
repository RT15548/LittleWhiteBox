const READ_CONCURRENCY = 3;

/**
 * Prefetches a bounded window, yielding settled reads in input order. The
 * caller owns file permissions and error policy; read must honor its signal.
 * Refill happens after consumption, so break never schedules another read.
 * @template T, V
 * @param {T[]} items
 * @param {(item: T, signal: AbortSignal) => Promise<V>} read
 * @param {AbortSignal} [signal]
 * @yields {object} The next file's value or original error, in input order.
 * @returns {AsyncGenerator<{item: T, ok: true, value: V} | {item: T, ok: false, error: unknown}>}
 */
export async function* orderedConcurrentRead(items, read, signal) {
    const controller = new AbortController();
    const abort = () => controller.abort(signal.reason);
    if (signal?.aborted) abort();
    else signal?.addEventListener('abort', abort, { once: true });

    const pending = [];
    let next = 0;
    function fill() {
        while (pending.length < READ_CONCURRENCY && next < items.length) {
            controller.signal.throwIfAborted();
            const item = items[next++];
            // Attach both handlers immediately, including for out-of-order failures.
            pending.push(Promise.resolve().then(() => {
                controller.signal.throwIfAborted();
                return read(item, controller.signal);
            }).then(value => ({ item, ok: true, value }), error => ({ item, ok: false, error })));
        }
    }

    try {
        controller.signal.throwIfAborted();
        fill();
        while (pending.length) {
            const result = await pending[0];
            controller.signal.throwIfAborted();
            pending.shift();
            yield result;
            controller.signal.throwIfAborted();
            fill();
        }
    } finally {
        signal?.removeEventListener('abort', abort);
        controller.abort();
        pending.length = 0;
    }
}
