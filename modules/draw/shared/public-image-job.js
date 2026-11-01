import { readImageCollection } from './image-collection.js';
import { createBackendItemError } from './backend-image-jobs.js';
import { MediaApiError } from '../../../shared/media-api.js';

export async function runPublicImageJob(client, request, { signal, onProgress }) {
    let images = null;
    let failure = null;
    try { await client.runJob(request, {
        signal,
        retryCreate: false,
        onStateChange: state => onProgress?.({ state }),
        onItemReady: async ({ response }) => {
            try { images = await readImageCollection(response); }
            catch (error) {
                failure = error;
                if (!error.partialResult?.images?.length) {
                    // Keep the sole backend copy when decoding/delivery failed before any result.
                    error.preserveBackendResult = true;
                    throw error;
                }
            }
        },
        onItemSettled: item => { if (item.state !== 'ready') failure ||= createBackendItemError(item); },
    }); } catch (error) {
        if (images?.length) error.partialResult = { images };
        else if (failure?.partialResult) error.partialResult = failure.partialResult;
        throw error;
    }
    if (failure) throw failure;
    if (!images) {
        signal?.throwIfAborted();
        throw new MediaApiError('invalid_result');
    }
    return images;
}
