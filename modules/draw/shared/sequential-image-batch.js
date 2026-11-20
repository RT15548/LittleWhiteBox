// Transport errors belong to one item. Delivery failures stop the batch before another purchase.
export async function runSequentialImageBatch({ count, signal, request, onItemReady, onItemSettled,
    normalizeError = error => error, outcomes }) {
    for (let index = 0; index < count; index++) {
        let base64;
        try {
            signal?.throwIfAborted();
            base64 = await request(index);
        } catch (cause) {
            if (cause?.localStorageFailure) throw cause;
            const error = normalizeError(cause);
            const state = signal?.aborted ? 'cancelled' : 'failed';
            if (outcomes) outcomes[index] = { state, error };
            await onItemSettled?.({ index, state, error, source: 'frontend' });
            continue;
        }
        if (base64 === null) continue;
        await onItemReady?.({ index, base64 });
        if (outcomes) outcomes[index] = { state: 'ready', base64 };
    }
}
