import { base64ToBlob } from './preview-image-url.js';

export const GALLERY_JPEG_QUALITY = 0.8;
export const GALLERY_JPEG_COPY = Object.freeze({
    label: '压缩新生成的图库图片',
    hint: '存入浏览器图库时转为 JPEG，节省空间；已有图片不变。',
    warning: '有损压缩，透明背景变白。',
    saved: '已保存',
    saveFailed: '保存失败，请重试',
    conversionFailed: 'JPEG 转换失败，已保留原图',
});

let conversionQueue = Promise.resolve();
const CONVERSION_TIMEOUT_MS = 10_000;
const isJpegBody = body => body.startsWith('/9j/');
const conversionError = () => new Error(GALLERY_JPEG_COPY.conversionFailed);

// WebViews can leave decode/toBlob callbacks pending indefinitely. Bound each
// attempt, release its resources and close even a bitmap delivered after timeout.
async function convertAttempt(body, mime, useBitmap) {
    let finished = false;
    let timer;
    let image;
    let bitmap;
    let canvas;
    let reader;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(conversionError()), CONVERSION_TIMEOUT_MS);
    });
    const work = async () => {
        if (useBitmap) {
            const decoded = await createImageBitmap(base64ToBlob(body, mime));
            if (finished) { decoded.close(); return; }
            bitmap = decoded;
        } else {
            image = new Image();
            image.src = `data:${mime};base64,${body}`;
            await image.decode();
        }
        if (finished) return;
        const source = bitmap || image;
        canvas = document.createElement('canvas');
        canvas.width = bitmap ? bitmap.width : image.naturalWidth;
        canvas.height = bitmap ? bitmap.height : image.naturalHeight;
        const context = canvas.getContext('2d');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(source, 0, 0);
        const blob = await new Promise((resolve, reject) => canvas.toBlob(value => {
            if (value?.type === 'image/jpeg') resolve(value);
            else reject(conversionError());
        }, 'image/jpeg', GALLERY_JPEG_QUALITY));
        if (finished) return;
        return await new Promise((resolve, reject) => {
            reader = new FileReader();
            reader.onload = () => {
                const result = String(reader.result || '');
                if (result.startsWith('data:image/jpeg;base64,') && isJpegBody(result.slice(result.indexOf(',') + 1))) resolve(result);
                else reject(conversionError());
            };
            reader.onerror = () => reject(reader.error);
            reader.onabort = () => reject(conversionError());
            reader.readAsDataURL(blob);
        });
    };
    try {
        return await Promise.race([work(), timeout]);
    } finally {
        finished = true;
        clearTimeout(timer);
        if (reader?.readyState === 1) reader.abort();
        if (image) image.src = '';
        bitmap?.close();
        if (canvas) { canvas.width = 0; canvas.height = 0; }
    }
}

// Serialize incoming images; never rewrite historical records. Whitespace is
// legal in base64, but arbitrary quotes/URL fragments must not be silently removed.
export function convertImageToJpeg(base64) {
    const raw = String(base64 || '').trim();
    const header = raw.match(/^data:([^,]*);base64,/i);
    const body = (header ? raw.slice(header[0].length) : raw).replace(/\s+/g, '');
    if (!raw || isJpegBody(body)) return Promise.resolve(base64);
    const mime = header?.[1] || 'image/png';
    const result = conversionQueue.then(async () => {
        let bitmapError;
        if (typeof createImageBitmap === 'function') {
            try { return await convertAttempt(body, mime, true); }
            catch (error) { bitmapError = error; }
        }
        try { return await convertAttempt(body, mime, false); }
        catch (error) {
            throw bitmapError ? new AggregateError([bitmapError, error], GALLERY_JPEG_COPY.conversionFailed) : error;
        }
    });
    // The caller receives the rejection; the queue itself remains usable.
    conversionQueue = result.then(() => undefined, () => undefined);
    return result;
}
