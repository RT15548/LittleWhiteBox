// Only direct NovelAI HTTP failures authorize one retry. Proxy failures and
// transport interruptions do not say whether the provider generated an image.
export async function requestNovelImageWithRetry({ request, sendMode, signal, beforeRequest }) {
    for (let attempt = 0; attempt < 2; attempt++) {
        signal?.throwIfAborted();
        if (await beforeRequest?.() === false) return null;
        signal?.throwIfAborted();
        try {
            return await request();
        } catch (error) {
            if (attempt > 0 || sendMode !== 'frontend' || signal?.aborted
                || !(error?.status >= 500 && error.status < 600)) throw error;
        }
    }
}
