import { createPreviewUrlScope } from './preview-image-url.js';

export const GALLERY_IMAGE_COPY = Object.freeze({ failed: '图片加载失败，点击重试' });

function decodeWhileVisible(element, signal) {
    return new Promise((resolve, reject) => {
        const finish = (error) => {
            signal.removeEventListener('abort', abort);
            if (error) reject(error);
            else resolve();
        };
        const abort = () => finish(signal.reason);
        signal.addEventListener('abort', abort, { once: true });
        if (signal.aborted) { abort(); return; }
        // Clearing src does not reliably settle decode() immediately in WebViews.
        // Release the queue on visibility cancellation, observing either late result.
        element.decode().then(() => finish(), finish);
    });
}

async function decodeNode(element, node) {
    const controller = new AbortController();
    node.decodeController = controller;
    try {
        await decodeWhileVisible(element, controller.signal);
    } catch (error) {
        // A reused/offscreen node does not invalidate another node's image.
        if (!controller.signal.aborted) throw error;
    } finally {
        node.decodeController = null;
    }
}

// Both gallery surfaces retain only visible images. Nodes outside the window
// keep their layout, ID and controls, but no src, base64, Blob or decoded image.
export function createGalleryImageWindow({ load, onUrl = () => {}, onError = error => console.error('[Gallery]', error) }) {
    const nodes = new Map();
    const images = new Map();
    const urls = createPreviewUrlScope();
    let running = false;
    let disposed = false;

    function releaseUnused() {
        for (const [id, entry] of images) {
            if ([...nodes.values()].some(node => node.visible && node.id === id)) continue;
            entry.controller.abort();
            images.delete(id);
        }
        urls.retain(images.keys());
    }

    function paint(id, url) {
        for (const [element, node] of nodes) {
            if (node.id !== id || !node.visible) continue;
            element.removeAttribute('title');
            element.alt = '';
            if (element.getAttribute('src') !== url) element.src = url;
            onUrl(element, url);
        }
    }

    async function pump() {
        if (running || disposed) return;
        running = true;
        try {
            for (;;) {
                const target = [...nodes.values()].find(node => node.visible && !images.has(node.id));
                if (!target || disposed) break;
                const id = target.id;
                const entry = { controller: new AbortController(), url: null };
                images.set(id, entry);
                try {
                    const record = await load(id, entry.controller.signal);
                    if (images.get(id) !== entry || disposed) continue;
                    const url = urls.get(record);
                    if (!url) throw new Error(GALLERY_IMAGE_COPY.failed);
                    entry.url = url;
                    paint(id, url);
                    // Do not start decoding a batch of full-size originals together.
                    const candidate = [...nodes].find(([, node]) => node.id === id && node.visible);
                    if (candidate?.[0].decode) await decodeNode(...candidate);
                } catch (error) {
                    if (entry.controller.signal.aborted || images.get(id) !== entry || disposed) continue;
                    onError(error);
                    entry.url = null;
                    entry.failed = true;
                    for (const [element, node] of nodes) if (node.id === id && node.visible) {
                        element.removeAttribute('src');
                        onUrl(element, null);
                        element.alt = GALLERY_IMAGE_COPY.failed;
                        element.title = GALLERY_IMAGE_COPY.failed;
                    }
                    urls.retain([...images].filter(([, item]) => item.url).map(([key]) => key));
                }
            }
        } finally { running = false; }
    }

    const observer = new IntersectionObserver(entries => {
        for (const { target, isIntersecting } of entries) {
            const node = nodes.get(target);
            if (!node) continue;
            node.visible = isIntersecting || target.hasAttribute('data-gallery-pinned');
            if (!node.visible) releaseNodeImage(target, node);
        }
        releaseUnused();
        for (const [id, entry] of images) if (entry.url) paint(id, entry.url);
        void pump().catch(onError);
    }, { rootMargin: '100px', threshold: 0 });

    function releaseNodeImage(element, node) {
        node.decodeController?.abort();
        element.removeAttribute('src');
        onUrl(element, null);
    }

    function unwatch(element, node) {
        observer.unobserve(element);
        element.removeEventListener('click', node.retry);
        releaseNodeImage(element, node);
        nodes.delete(element);
    }

    return {
        sync(elements) {
            if (disposed) return;
            const next = new Set(elements);
            for (const [element, node] of nodes) {
                if (!next.has(element) || node.id !== element.dataset.galleryId) unwatch(element, node);
            }
            for (const element of next) {
                if (nodes.has(element) || !element.dataset.galleryId) continue;
                const id = element.dataset.galleryId;
                const retry = () => {
                    const entry = images.get(id);
                    if (entry?.failed) { entry.controller.abort(); images.delete(id); void pump().catch(onError); }
                };
                nodes.set(element, { id, visible: element.hasAttribute('data-gallery-pinned'), retry });
                element.addEventListener('click', retry);
                observer.observe(element);
            }
            releaseUnused();
            for (const [id, entry] of images) if (entry.url) paint(id, entry.url);
            void pump().catch(onError);
        },
        dispose() {
            disposed = true;
            observer.disconnect();
            for (const [element, node] of nodes) unwatch(element, node);
            for (const entry of images.values()) entry.controller.abort();
            images.clear();
            urls.dispose();
        },
    };
}
