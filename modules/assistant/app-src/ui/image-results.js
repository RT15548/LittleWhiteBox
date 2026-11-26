import { readWorkspaceImageById } from '../../shared/workspace-images.js';
import { IMAGE_COPY } from '../../shared/image-tools.js';

export function createImageResultGallery(images, { open, readBlob = readWorkspaceImageById } = {}) {
    const node = document.createElement('section');
    node.className = 'xb-assistant-attachment-gallery xb-assistant-image-results';
    node.setAttribute('aria-label', IMAGE_COPY.preview);
    const urls = new Set();
    let disposed = false;
    for (const file of images) {
        const card = document.createElement('div'), image = document.createElement('img'), caption = document.createElement('button');
        card.className = 'xb-assistant-attachment-card'; image.className = 'xb-assistant-attachment-image';
        image.alt = file.name; caption.type = 'button'; caption.className = 'xb-assistant-attachment-name xb-assistant-local-path-link';
        caption.textContent = file.name; caption.title = IMAGE_COPY.open;
        caption.addEventListener('click', () => open?.(file.path));
        card.append(image, caption); node.append(card);
        const unavailable = () => {
            if (disposed) return;
            image.remove();
            caption.disabled = true;
            const failure = document.createElement('p'); failure.setAttribute('role', 'alert');
            failure.textContent = IMAGE_COPY.unavailable;
            card.append(failure);
        };
        if (file.unavailable) { unavailable(); continue; }
        image.onerror = unavailable;
        void readBlob(file.blobId).then(blob => {
            if (disposed) return;
            const url = URL.createObjectURL(blob); urls.add(url); image.src = url;
            const download = document.createElement('a');
            download.className = 'xb-assistant-local-path-link';
            download.href = url; download.download = file.name; download.textContent = IMAGE_COPY.download;
            card.append(download);
        }).catch(error => {
            console.warn({ source: import.meta.url, operation: 'readWorkspaceImageById' }, error);
            unavailable();
        });
    }
    return { node, dispose() { disposed = true; for (const url of urls) URL.revokeObjectURL(url); urls.clear(); } };
}
