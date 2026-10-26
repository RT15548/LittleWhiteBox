import { GALLERY_BATCH_COPY as COPY } from './gallery-batch.js';

// Owns just the currently offered archive. Preparing another part, cancelling,
// or closing the panel releases it. Each download remains a real user gesture.
export function createGalleryZipDownload({ document, container, send, status }) {
    let requestId = null;
    let url = null;
    let part = 0;
    let remaining = [];
    const clear = () => {
        if (url) URL.revokeObjectURL(url);
        url = null;
        container.replaceChildren();
        container.hidden = true;
    };
    const cancel = () => {
        if (requestId !== null) status('', '');
        requestId = null;
        remaining = [];
        clear();
        send({ type: 'BATCH_CANCEL_EXPORT' });
    };
    function prepare(ids) {
        clear();
        requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        part++;
        status('loading', COPY.preparing);
        send({ type: 'BATCH_DOWNLOAD', ids, requestId });
    }
    return {
        start(ids) { cancel(); part = 0; prepare(ids); },
        handle(data) {
            if (data.requestId !== requestId) return;
            requestId = null;
            remaining = data.remainingIds || [];
            if (data.error || !data.blob) {
                status('error', COPY.failed(data.error || data.failures?.[0]?.message || COPY.empty));
                return;
            }
            url = URL.createObjectURL(data.blob);
            const link = document.createElement('a');
            link.className = 'btn btn-primary btn-sm';
            link.href = url;
            link.download = `gallery-${Date.now()}-part-${part}.zip`;
            link.textContent = COPY.download(part, data.exportedIds.length);
            container.append(link);
            if (remaining.length) {
                const next = document.createElement('button');
                next.type = 'button';
                next.className = 'btn btn-sm';
                next.textContent = COPY.next(remaining.length);
                next.disabled = true;
                link.addEventListener('click', () => { next.disabled = false; });
                next.addEventListener('click', () => prepare(remaining));
                container.append(next);
            }
            container.hidden = false;
            status(data.failures.length ? 'error' : 'success', COPY.ready(data.exportedIds.length, data.failures.length));
        },
        dispose: cancel,
    };
}
