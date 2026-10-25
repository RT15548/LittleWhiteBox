import { createPreviewUrlScope } from './preview-image-url.js';
import { DRAW_SLOT_COPY, hasPreviewImage } from './image-record.js';

export async function resolveImageTaskOrientations(tasks, overrideSize, signal) {
    return Promise.all(tasks.map(async ({ sourceImage, ...task }) => ({
        ...task,
        orientation: task.orientation ?? (overrideSize === 'auto' ? await resolveImageOrientation(sourceImage, signal) : null),
    })));
}

// Released records without orientation recover it from the actual image at
// the redraw boundary. A failed attempt with no image retains preset sizing.
export async function resolveImageOrientation(record, signal) {
    signal?.throwIfAborted();
    if (record?.orientation === 'landscape' || record?.orientation === 'portrait') return record.orientation;
    if (!hasPreviewImage(record)) return null;
    const urls = createPreviewUrlScope();
    const image = new Image();
    let abort;
    try {
        await new Promise((resolve, reject) => {
            abort = () => reject(signal.reason);
            signal?.addEventListener('abort', abort, { once: true });
            image.onload = resolve;
            image.onerror = () => reject(new Error(DRAW_SLOT_COPY.imageLoadFailed));
            image.src = urls.get(record);
        });
        if (!image.naturalWidth || !image.naturalHeight) throw new Error(DRAW_SLOT_COPY.imageLoadFailed);
        if (image.naturalWidth === image.naturalHeight) return null;
        return image.naturalWidth > image.naturalHeight ? 'landscape' : 'portrait';
    } finally {
        signal?.removeEventListener('abort', abort);
        image.onload = image.onerror = null;
        image.src = '';
        urls.dispose();
    }
}
