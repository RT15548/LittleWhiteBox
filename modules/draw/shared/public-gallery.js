import { drawNotify } from './draw-toast.js';
import { getContext } from '../../../../../../extensions.js';
import { createIdentifier } from '../../../shared/common/identifier.js';
import { observeBackgroundTask } from '../../../shared/common/async-errors.js';
import { blobToDataUrl, storePreview } from './gallery-cache.js';
import { autoSaveDeliveredImage, imageFilePrefix } from './image-autosave.js';
import { getImageFolderName } from './image-save.js';
import { DRAW_SLOT_COPY, PUBLIC_DRAW_SOURCE } from './image-record.js';

// The public call owns a gallery group, not a host message attachment. Capture
// ownership before queuing; neither late delivery nor navigation can change it.
export function capturePublicGallery(request, provider) {
    const generatedAt = Date.now();
    const filePrefix = imageFilePrefix(provider);
    const ctx = getContext();
    const owner = {
        chatId: String(ctx.chatId || (ctx.characterId ?? 'unknown')),
        characterName: getImageFolderName(),
    };
    const slotId = `public-${createIdentifier()}`;
    return async (images, metadata = {}) => {
        const gallery = [], failures = [];
        for (const [index, blob] of images.entries()) {
            const imgId = `${slotId}-${index}`;
            try {
                await storePreview({
                    ...owner, slotId, imgId, source: PUBLIC_DRAW_SOURCE,
                    base64: await blobToDataUrl(blob), tags: request.prompt,
                    negativePrompt: request.negativePrompt,
                    characterPrompts: request.characterPrompts,
                    presetId: metadata.presetId ?? request.paramsPresetId,
                    vibeNames: metadata.vibeNames || '',
                    providerMetadata: metadata.providerMetadata,
                });
            } catch (error) {
                failures.push(error);
                gallery.push({ saved: false });
                continue;
            }
            gallery.push({ saved: true });
            // Use the existing switch, but never make the card wait for a server upload.
            observeBackgroundTask(autoSaveDeliveredImage({ imgId, slotId, filePrefix, generatedAt }),
                { source: import.meta.url, operation: 'autoSaveDeliveredImage' });
        }
        if (failures.length) {
            // Local collection and generation are independent outcomes.
            console.error({ source: import.meta.url, operation: 'savePublicGallery' }, new AggregateError(failures));
            drawNotify.error(DRAW_SLOT_COPY.publicGallerySaveFailed);
        }
        return gallery;
    };
}
