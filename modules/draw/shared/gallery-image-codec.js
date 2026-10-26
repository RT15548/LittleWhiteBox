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

// Decode one original at a time, release both decoded image and canvas before
// starting the next one. This only encodes a new result; never rewrites records.
export function convertImageToJpeg(base64) {
    const raw = String(base64 || '').trim();
    const body = raw.startsWith('data:') ? raw.slice(raw.indexOf(',') + 1) : raw;
    if (!raw || body.startsWith('/9j/')) return Promise.resolve(base64);
    const result = conversionQueue.then(async () => {
        const image = new Image();
        const canvas = document.createElement('canvas');
        try {
            image.src = raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`;
            await image.decode();
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext('2d');
            context.fillStyle = '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);
            const blob = await new Promise((resolve, reject) => canvas.toBlob(value => {
                if (value?.type === 'image/jpeg') resolve(value);
                else reject(new Error(GALLERY_JPEG_COPY.conversionFailed));
            }, 'image/jpeg', GALLERY_JPEG_QUALITY));
            return await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(blob);
            });
        } finally {
            image.src = '';
            canvas.width = 0;
            canvas.height = 0;
        }
    });
    // The caller receives the rejection; the queue itself remains usable.
    conversionQueue = result.then(() => undefined, () => undefined);
    return result;
}
