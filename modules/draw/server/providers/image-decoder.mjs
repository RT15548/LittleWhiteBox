import { imageSize } from 'image-size';
import { GifReader } from 'omggif';
import decodePng, { init as initPng } from '@jsquash/png/decode.js';
import decodeJpeg, { init as initJpeg } from '@jsquash/jpeg/decode.js';
import decodeWebp, { init as initWebp } from '@jsquash/webp/decode.js';
import { loadDecoderAsset } from './image-decoder-assets.mjs';

// Bound the decoded allocation independently of the upstream response byte limit.
const MAX_PIXELS = 64 * 1024 * 1024;
const decoders = {
    'image/png': { init: initPng, decode: decodePng },
    'image/jpeg': { init: initJpeg, decode: decodeJpeg },
    'image/webp': { init: initWebp, decode: decodeWebp },
};
const initialized = new Map();
// The PNG WASM binding returns ImageData; Node has no DOM implementation.
globalThis.ImageData ??= class ImageData {
    constructor(data, width, height) { Object.assign(this, { data, width, height }); }
};

export async function isDecodableImage(buffer, mime) {
    let dimensions;
    try { dimensions = imageSize(buffer); }
    catch { return false; }
    const { width, height } = dimensions;
    if (!width || !height || width * height > MAX_PIXELS) return false;
    if (mime === 'image/gif') {
        try {
            const gif = new GifReader(buffer);
            if (!gif.numFrames() || buffer.at(-1) !== 0x3b) return false;
            const frame = gif.frameInfo(0);
            if (!frame.width || !frame.height || frame.x + frame.width > width || frame.y + frame.height > height) return false;
            gif.decodeAndBlitFrameRGBA(0, new Uint8Array(width * height * 4));
            return true;
        } catch { return false; }
    }
    const decoder = decoders[mime];
    if (!decoder) return false;
    if (!initialized.has(mime)) {
        initialized.set(mime, Promise.resolve(loadDecoderAsset(mime)).then(bytes => WebAssembly.compile(bytes))
            .then(wasm => decoder.init(wasm)));
    }
    await initialized.get(mime);
    try {
        const result = await decoder.decode(buffer);
        return result.width > 0 && result.height > 0 && result.data.byteLength === result.width * result.height * 4;
    } catch { return false; }
}
