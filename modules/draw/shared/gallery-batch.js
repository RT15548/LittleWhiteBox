import { Zip, ZipPassThrough } from '../../../libs/fflate.mjs';
import { parseBase64Image, base64ToBlob } from './preview-image-url.js';
import { normalizeMediaUrl } from './media-url.js';

// A part contains roughly 16 MiB, plus at most one image. Only one part is
// prepared at a time; the user explicitly downloads it before requesting more.
export const GALLERY_ZIP_PART_BYTES = 16 * 1024 * 1024;
export const GALLERY_EXPORT_IMAGE_BYTES = 64 * 1024 * 1024;
const CHUNK_BYTES = 64 * 1024;

export const GALLERY_BATCH_COPY = Object.freeze({
    empty: '没有可导出的图片',
    tooLarge: '单张图片超过 64 MB，请单独下载原图',
    missing: '图片已不存在',
    preparing: '正在准备 ZIP…',
    deleteConfirm: count => `删除所选的 ${count} 张图片记录？此操作不可撤销，已保存到服务器的文件不会删除。`,
    selected: count => count ? `已选 ${count} 张` : '勾选图片；点“查看”可选择历史版本',
    deleted: (count, failed) => `已删除 ${count} 张${failed ? `，${failed} 张失败，仍保留勾选` : ''}`,
    ready: (count, failed) => `ZIP 已准备好（${count} 张）${failed ? `；${failed} 张未能导出` : ''}`,
    download: (part, count) => `下载第 ${part} 包（${count} 张）`,
    next: count => `准备下一包（还剩 ${count} 张）`,
    failed: error => `导出失败：${error}`,
});

export function uniqueGalleryIds(ids) {
    return [...new Set((Array.isArray(ids) ? ids : []).filter(id => typeof id === 'string' && id))];
}

export async function deleteGalleryImages(ids, remove) {
    const deletedIds = [];
    const failures = [];
    for (const id of uniqueGalleryIds(ids)) {
        try { await remove(id); deletedIds.push(id); }
        catch (error) { failures.push({ id, message: error.message }); }
    }
    return { deletedIds, failures };
}

async function imageBlob(preview, fetchImage, signal, maxBytes) {
    if (!preview) throw new Error(GALLERY_BATCH_COPY.missing);
    const parsed = parseBase64Image(preview.base64);
    if (parsed?.data) {
        if (parsed.data.length * 0.75 > maxBytes + 2) throw new Error(GALLERY_BATCH_COPY.tooLarge);
        return base64ToBlob(parsed.data, parsed.mime);
    }
    const url = normalizeMediaUrl(preview.savedUrl);
    if (!url) throw new Error(GALLERY_BATCH_COPY.missing);
    const response = await fetchImage(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const reader = response.body.getReader();
    let done = false;
    try {
        if (Number(response.headers.get('content-length')) > maxBytes) throw new Error(GALLERY_BATCH_COPY.tooLarge);
        const chunks = [];
        let size = 0;
        while (true) {
            signal?.throwIfAborted();
            const part = await reader.read();
            if (part.done) { done = true; break; }
            size += part.value.length;
            if (size > maxBytes) throw new Error(GALLERY_BATCH_COPY.tooLarge);
            chunks.push(part.value);
        }
        const mime = response.headers.get('content-type')?.split(';')[0];
        if (!mime?.startsWith('image/')) throw new Error('响应不是图片');
        return new Blob(chunks, { type: mime });
    } finally {
        if (!done) await reader.cancel();
        reader.releaseLock();
    }
}

const extension = mime => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' })[mime] || 'img';
const safeName = value => String(value || 'image').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 80);

// No shared image cache and no original-image array. ZIP stores already
// compressed image bytes; pushing small chunks yields between image reads.
export async function exportGalleryZipPart(ids, { readPreview, fetchImage = fetch, signal,
    partBytes = GALLERY_ZIP_PART_BYTES, maxImageBytes = GALLERY_EXPORT_IMAGE_BYTES } = {}) {
    const queue = uniqueGalleryIds(ids);
    const chunks = [];
    const exportedIds = [];
    const failures = [];
    let bytes = 0;
    let offset = 0;
    let zipError;
    const zip = new Zip((error, chunk) => {
        if (error) zipError = error;
        else chunks.push(new Blob([chunk]));
    });
    try {
        for (; offset < queue.length && bytes < partBytes; offset++) {
            signal?.throwIfAborted();
            const id = queue[offset];
            let blob, preview;
            try {
                preview = await readPreview(id);
                blob = await imageBlob(preview, fetchImage, signal, maxImageBytes);
            } catch (error) {
                signal?.throwIfAborted();
                failures.push({ id, message: error.message });
                continue;
            }
            const file = new ZipPassThrough(`${offset + 1}-${safeName(preview.characterName)}-${safeName(id)}.${extension(blob.type)}`);
            preview = null;
            zip.add(file);
            for (let start = 0; start < blob.size; start += CHUNK_BYTES) {
                signal?.throwIfAborted();
                file.push(new Uint8Array(await blob.slice(start, start + CHUNK_BYTES).arrayBuffer()));
                if (zipError) throw zipError;
            }
            file.push(new Uint8Array(), true);
            bytes += blob.size;
            exportedIds.push(id);
        }
        zip.end();
        if (zipError) throw zipError;
        return { blob: exportedIds.length ? new Blob(chunks, { type: 'application/zip' }) : null,
            exportedIds, failures, remainingIds: queue.slice(offset) };
    } finally { zip.terminate(); }
}
