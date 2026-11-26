import { getPreviewDisplayUrl, setSlotSelection, storeFailedPlaceholder, storePreview } from '../../shared/gallery-cache.js';
import { autoSaveDeliveredImage } from '../../shared/image-autosave.js';
import { createImageIdentifiers } from '../../shared/prepared-image-placement.js';
import { classifyError } from '../../shared/draw-common.js';
import { observeBackgroundTask } from '../../../../shared/common/async-errors.js';
import { PreviewStatus } from '../../shared/image-record.js';
import protocol from '../../shared/multimodal-image-protocol.cjs';

function textGalleryMeta(options) {
    if (options.source === 'ebook') {
        const bookId = String(options.bookId || '').trim();
        const bookTitle = String(options.bookTitle || options.title || '未命名书稿').trim();
        const chapterPath = String(options.chapterPath || '').trim();
        const chapterTitle = String(options.chapterTitle || options.title || chapterPath || '章节').trim();
        return { source: 'ebook', bookId, bookTitle, chapterPath, chapterTitle,
            chatId: bookId ? `ebook:${bookId}` : 'ebook', characterName: `电纸书 / ${bookTitle}`,
            messageId: `ebook:${bookId || 'unknown'}:${chapterPath || chapterTitle}` };
    }
    if (options.source === 'tavern') {
        const sessionId = String(options.sessionId || '').trim();
        const order = Number.isFinite(Number(options.messageOrder)) ? Math.max(0, Math.floor(Number(options.messageOrder))) : null;
        const role = String(options.role || options.title || 'assistant').trim();
        return { source: 'tavern', chatId: sessionId || 'tavern',
            characterName: String(options.characterName || '小白酒馆').trim(),
            messageId: sessionId ? `tavern:${sessionId}:${order ?? role}` : `tavern:${order ?? role}` };
    }
    return {};
}

export async function runTextImages({ options, sceneSource, filePrefix, signal, compiledBatch, tasks, metadata, run }) {
    const gallery = textGalleryMeta(options);
    gallery.messageId = String(options.messageId || gallery.messageId || `text:${Date.now()}`);
    const items = metadata.map((previewMetadata, index) => ({ index, ...createImageIdentifiers(), previewMetadata }));
    const generatedAt = Date.now();
    const images = [];
    const total = tasks.length;
    options.onStateChange?.('gen', { current: 0, total });
    await run({ compiledBatch, onStateChange: options.onStateChange,
        recoverable: { plan: { delivery: { mode: 'gallery' }, gallery, items }, commitPlacements: () => !signal?.aborted },
        async onItemReady({ index, base64, guard }) {
            const { slotId, imgId, previewMetadata } = items[index];
            await guard?.();
            await storePreview({ ...gallery, ...previewMetadata, slotId, imgId, base64 });
            await setSlotSelection(slotId, imgId);
            images[index] = { slotId, imgId, ...previewMetadata, placement: tasks[index].placement,
                displayUrl: getPreviewDisplayUrl({ imgId, base64 }), success: true };
            observeBackgroundTask(autoSaveDeliveredImage({ imgId, slotId, filePrefix, generatedAt }), {
                source: import.meta.url, operation: 'autoSaveDeliveredImage',
            });
        },
        async onItemSettled({ index, error, state, guard }) {
            if (signal?.aborted || state === 'ready' || state === 'consumed') return;
            const { slotId, imgId, previewMetadata } = items[index];
            const problem = classifyError(error);
            await guard?.();
            const { interrupted, timedOut } = protocol.OPENAI_IMAGE_CODES;
            const unknown = error?.code === interrupted || error?.code === timedOut;
            const storeFailure = unknown ? storePreview : storeFailedPlaceholder;
            await storeFailure({ ...gallery, ...previewMetadata, slotId, imgId, status: unknown ? PreviewStatus.UNKNOWN : PreviewStatus.FAILED,
                errorType: problem.code, errorMessage: error?.message || problem.desc });
            images[index] = { slotId, ...previewMetadata, placement: tasks[index].placement, success: false, error: problem };
        },
    });
    signal?.throwIfAborted();
    const success = images.filter(image => image.success).length;
    options.onStateChange?.('success', { success, total });
    return { ok: true, source: options.source || 'text', success, total, images: images.filter(Boolean), sourceHash: sceneSource?.sourceHash || '' };
}
