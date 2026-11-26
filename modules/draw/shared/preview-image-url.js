import { normalizeMediaUrl } from './media-url.js';
import { detectImageMime } from './image-collection.js';

function readImageMime(data) {
    // All supported signatures fit in the first 12 bytes. Avoid decoding the full image again.
    const head = data.match(/^(?:\s*[A-Za-z0-9+/=]){1,16}/)?.[0];
    if (!head) return;
    try { return detectImageMime(Uint8Array.from(atob(head), c => c.charCodeAt(0))); }
    catch (error) { if (error.name !== 'InvalidCharacterError') throw error; }
}

export function parseBase64Image(value) {
    const raw = String(value || '').trim();
    if (!raw) return null;
    const match = raw.match(/^data:([^;]+);base64,(.*)$/i);
    const data = match ? match[2] : raw;
    return { mime: readImageMime(data) || match?.[1] || 'image/png', data };
}

export function base64ToBlob(base64, mime) {
    const binary = atob(base64);
    const chunks = [];
    for (let offset = 0; offset < binary.length; offset += 8192) {
        const slice = binary.slice(offset, offset + 8192);
        chunks.push(Uint8Array.from(slice, character => character.charCodeAt(0)));
    }
    return new Blob(chunks, { type: mime });
}

// A view owns its URLs until it replaces its content or closes. Other views,
// shared LRU eviction and cache deletion cannot revoke these URLs.
export function createPreviewUrlScope() {
    const urls = new Map();
    return {
        get(record) {
            const savedUrl = normalizeMediaUrl(record?.savedUrl);
            if (savedUrl) return savedUrl;
            const parsed = parseBase64Image(record?.base64);
            if (!parsed?.data) return '';
            const key = record.imgId || record.base64;
            if (!urls.has(key)) urls.set(key, URL.createObjectURL(base64ToBlob(parsed.data, parsed.mime)));
            return urls.get(key);
        },
        retain(ids) {
            const keep = new Set(ids);
            for (const [key, url] of urls) if (!keep.has(key)) {
                URL.revokeObjectURL(url);
                urls.delete(key);
            }
        },
        dispose() {
            for (const url of urls.values()) URL.revokeObjectURL(url);
            urls.clear();
        },
    };
}
