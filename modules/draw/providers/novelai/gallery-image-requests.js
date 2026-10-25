import { GALLERY_IMAGE_COPY } from '../../shared/gallery-image-window.js';
import { createIdentifier } from '../../../../shared/common/identifier.js';

// The viewport serializes reads. Cancellation removes the waiting consumer;
// late parent replies cannot attach an image to a closed/reused view.
export function createGalleryImageRequests(post) {
    const session = createIdentifier();
    let sequence = 0;
    const pending = new Map();
    return {
        load(imgId, signal) {
            return new Promise((resolve, reject) => {
                const requestId = `${session}:${++sequence}`;
                const finish = (value, error) => {
                    clearTimeout(timer);
                    signal.removeEventListener('abort', abort);
                    pending.delete(requestId);
                    if (error) reject(error);
                    else resolve(value);
                };
                const abort = () => finish(null, new DOMException('Aborted', 'AbortError'));
                const timer = setTimeout(() => finish(null, new Error(GALLERY_IMAGE_COPY.failed)), 15000);
                pending.set(requestId, finish);
                signal.addEventListener('abort', abort, { once: true });
                if (signal.aborted) { abort(); return; }
                post({ type: 'LOAD_GALLERY_IMAGE', imgId, requestId });
            });
        },
        receive(data) {
            pending.get(data.requestId)?.(data.image, data.image ? null : new Error(GALLERY_IMAGE_COPY.failed));
        },
    };
}
