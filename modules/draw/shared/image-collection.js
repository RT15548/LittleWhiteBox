import { zipSync, unzipSync, strToU8, strFromU8 } from '../../../libs/fflate.mjs';
import { MediaApiError } from '../../../shared/media-api.js';

const MAX_BYTES = 128 * 1024 * 1024;
export const IMAGE_COLLECTION_MIME = 'application/vnd.littlewhitebox.images+zip';

export function imageMime(bytes) {
    if (bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value)) return 'image/png';
    if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
    if (strFromU8(bytes.subarray(0, 4)) === 'RIFF' && strFromU8(bytes.subarray(8, 12)) === 'WEBP') return 'image/webp';
    if (/^GIF8[79]a$/.test(strFromU8(bytes.subarray(0, 6)))) return 'image/gif';
    throw new MediaApiError('invalid_result');
}

export function imageBlob(value) {
    const bytes = typeof value === 'string'
        ? Uint8Array.from(atob(value.replace(/^data:[^,]*,/, '')), c => c.charCodeAt(0))
        : value;
    return new Blob([bytes], { type: imageMime(bytes) });
}

export function decodeImageList(values) {
    const images = [];
    if (!Array.isArray(values) || !values.length) throw new MediaApiError('invalid_result');
    let failure;
    for (const value of values) {
        try { images.push(imageBlob(value)); }
        catch (error) { failure ||= error; }
    }
    if (failure) throw new MediaApiError(images.length ? 'partial_result' : 'invalid_result', { cause: failure, partialResult: { images } });
    return images;
}

/** One existing backend-result buffer, with ordered members and a completion marker. */
export function packImageCollection(images, incomplete = false) {
    const files = {};
    const entries = images.map((bytes, index) => {
        const name = `${index}.image`;
        files[name] = bytes;
        return { name, mime: imageMime(bytes) };
    });
    files['manifest.json'] = strToU8(JSON.stringify({ images: entries, incomplete }));
    return zipSync(files, { level: 0 });
}

export async function readImageCollection(response) {
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length > MAX_BYTES) throw new MediaApiError('invalid_result');
    if (response.headers.get('content-type')?.split(';')[0] !== IMAGE_COLLECTION_MIME) return [imageBlob(bytes)];
    let size = 0;
    const files = unzipSync(bytes, { filter(file) {
        size += file.originalSize;
        if (size > MAX_BYTES) throw new MediaApiError('invalid_result');
        return true;
    } });
    const manifest = JSON.parse(strFromU8(files['manifest.json']));
    const images = decodeImageList(manifest.images.map(item => files[item.name]));
    if (manifest.incomplete) throw new MediaApiError('partial_result', { partialResult: { images } });
    return images;
}
