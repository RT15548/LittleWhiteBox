// A covering IndexedDB key: browsing/counting never deserializes image payloads.
// Derived on every write, removed with the image; not a second source of truth.
import { hasPreviewImage } from './image-record.js';

export const GALLERY_METADATA_INDEX = 'galleryMetadata';

export function withGalleryMetadata(record) {
    return { ...record, galleryMetadata: [
        Number(record.timestamp) || 0,
        String(record.slotId || record.imgId),
        String(record.characterName || 'Unknown'),
        hasPreviewImage(record) ? 1 : 0,
        (record.base64?.length || 0) * 0.75,
        String(record.savedUrl || ''),
    ] };
}

export function galleryMetadataFromKey(key, imgId) {
    const [timestamp, slotId, characterName, displayable, sizeBytes, savedUrl] = key;
    return { imgId, timestamp, slotId, characterName, displayable: !!displayable, sizeBytes, savedUrl: savedUrl || null };
}
