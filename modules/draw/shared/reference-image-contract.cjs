'use strict';

// Per image request, across all reference images, before base64 expansion.
const MAX_REFERENCE_BYTES = 4 * 1024 * 1024;
const MAX_REFERENCE_IMAGES = 14;
const MIME_EXTENSIONS = Object.freeze({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' });
const MIME_TYPES = Object.freeze(Object.keys(MIME_EXTENSIONS));

function base64Size(data) {
    if (typeof data !== 'string' || !data || data.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}(?![\s\S])/.test(data)) return -1;
    return data.length / 4 * 3 - (data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0);
}

function hasDeclaredSignature(data, mimeType) {
    const header = atob(data.slice(0, 16));
    switch (mimeType) {
        case 'image/png': return header.startsWith('\x89PNG\r\n\x1a\n');
        case 'image/jpeg': return header.startsWith('\xff\xd8\xff');
        case 'image/webp': return header.startsWith('RIFF') && header.slice(8, 12) === 'WEBP';
        default: return false;
    }
}

function validateReferenceImages(value, field = 'referenceImages') {
    if (value === undefined) return [];
    if (!Array.isArray(value) || value.length > MAX_REFERENCE_IMAGES) throw new Error(`${field} must contain at most ${MAX_REFERENCE_IMAGES} images`);
    let total = 0;
    return Array.from(value, (reference, index) => {
        const { mimeType, data } = reference ?? {};
        if (!MIME_TYPES.includes(mimeType)) throw new Error(`${field}[${index}].mimeType must be PNG, JPEG or WebP`);
        const size = base64Size(data);
        if (size <= 0 || !hasDeclaredSignature(data, mimeType)) throw new Error(`${field}[${index}].data must contain base64 image bytes matching its MIME type`);
        total += size;
        if (total > MAX_REFERENCE_BYTES) throw new Error(`${field} exceeds the ${MAX_REFERENCE_BYTES} byte limit`);
        return { mimeType, data };
    });
}

module.exports = Object.freeze({ base64Size, validateReferenceImages, MAX_REFERENCE_BYTES, MAX_REFERENCE_IMAGES, MIME_TYPES, MIME_EXTENSIONS });
