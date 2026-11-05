// A covering IndexedDB key: browsing/counting never deserializes image payloads.
// Derived on every write, removed with the image; not a second source of truth.
// Prompt fields ride along so the enlarged view can show them without reading
// the full image record (prompt text is tiny next to the image payload).
import { hasPreviewImage } from './image-record.js';

export const GALLERY_METADATA_INDEX = 'galleryMetadata';

const promptKeyText = value => String(value ?? '');

export function withGalleryMetadata(record) {
    return { ...record, galleryMetadata: [
        Number(record.timestamp) || 0,
        String(record.slotId || record.imgId),
        String(record.characterName || 'Unknown'),
        hasPreviewImage(record) ? 1 : 0,
        (record.base64?.length || 0) * 0.75,
        String(record.savedUrl || ''),
        promptKeyText(record.tags),
        promptKeyText(record.positive),
        promptKeyText(record.characterPrompts != null ? JSON.stringify(record.characterPrompts) : ''),
        promptKeyText(record.negativePrompt),
        promptKeyText(record.vibeNames),
    ] };
}

export function galleryMetadataFromKey(key, imgId) {
    const [timestamp, slotId, characterName, displayable, sizeBytes, savedUrl,
        tags, positive, characterPrompts, negativePrompt, vibeNames] = key;
    const metadata = { imgId, timestamp, slotId, characterName, displayable: !!displayable, sizeBytes, savedUrl: savedUrl || null };
    if (tags) metadata.tags = tags;
    if (positive) metadata.positive = positive;
    if (characterPrompts) {
        try { metadata.characterPrompts = JSON.parse(characterPrompts); } catch { /* legacy row without prompts */ }
    }
    if (negativePrompt) metadata.negativePrompt = negativePrompt;
    if (vibeNames) metadata.vibeNames = vibeNames;
    return metadata;
}
