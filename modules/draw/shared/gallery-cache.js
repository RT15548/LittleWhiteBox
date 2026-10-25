// gallery-cache.js
// 画廊和缓存管理模块

import { getContext } from "../../../../../../extensions.js";
import { saveBase64AsFile } from "../../../../../../utils.js";
import { hasPreviewImage, DRAW_SLOT_COPY, PreviewStatus } from './image-record.js';

import { getSharedDrawSettings } from './draw-settings.js';
import { convertImageToJpeg, GALLERY_JPEG_COPY } from './gallery-image-codec.js';
import { IMAGE_SAVE_LABEL_HTML } from './image-save-ui.js';
import { normalizeMediaUrl } from './media-url.js';
import { parseBase64Image, base64ToBlob } from './preview-image-url.js';
import { GALLERY_METADATA_INDEX, withGalleryMetadata, galleryMetadataFromKey } from './gallery-metadata.js';
import { createGalleryImageWindow } from './gallery-image-window.js';
import { getSafeViewportStyles, observeViewport } from '../../../shared/common/viewport.js';
import { getImageChatIdentity } from './chat-image-persistence.js';
import { observeAsyncCallback } from '../../../shared/common/async-errors.js';

const useCurrentGalleryImageEvent = observeAsyncCallback(useCurrentGalleryImage, { source: import.meta.url, operation: "useCurrentGalleryImage" });
const saveCurrentGalleryImageEvent = observeAsyncCallback(saveCurrentGalleryImage, { source: import.meta.url, operation: "saveCurrentGalleryImage" });
const deleteCurrentGalleryImageEvent = observeAsyncCallback(deleteCurrentGalleryImage, { source: import.meta.url, operation: "deleteCurrentGalleryImage" });


// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const DB_NAME = 'xb_novel_draw_previews';
const DB_STORE = 'previews';
const DB_SELECTIONS_STORE = 'selections';
const DB_VERSION = 4;
const CACHE_TTL = 5 * 60 * 1000;
const PREVIEW_CACHE_LIMIT = 64;
const PREVIEW_OBJECT_URL_LIMIT = 128;
const PREVIEW_PRELOAD_LIMIT = 128;
const CACHE_SYNC_CHANNEL_NAME = 'xb_novel_draw_preview_changes';
// 图片管理分页：每页默认 24 个图组，单次最多 500 个（数据变化后“重新加载到先前数量”一次请求的上限）。
export const GALLERY_PAGE_DEFAULT_LIMIT = 24;
export const GALLERY_PAGE_MAX_LIMIT = 500;
const SLOT_ORDER_CACHE_TTL = 30 * 1000;

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

let db = null;
let dbOpening = null;
let galleryOverlayCreated = false;
let currentGalleryData = null;
let galleryOpenRequest = 0;

const previewCache = new Map();
const previewObjectUrlCache = new Map();
const previewPreloadCache = new Map();
// 角色 → 图组完整排序（只含元数据，不含 base64）；任何写入 / 删除 / 跨标签页变更都会清空。
const slotOrderCache = new Map();
let slotOrderGeneration = 0;
const cacheChangeListeners = new Set();
let cacheSyncChannel = null;

function storageWriteError(tx) { return tx.error || new Error(DRAW_SLOT_COPY.storageWriteFailed); }

// ═══════════════════════════════════════════════════════════════════════════
// 图片显示 URL
// ═══════════════════════════════════════════════════════════════════════════

export function getBase64ImagePayload(value) {
    const parsed = parseBase64Image(value);
    if (!parsed?.data) return { base64: '', format: 'png' };
    const format = parsed.mime === 'image/jpeg'
        ? 'jpg'
        : parsed.mime === 'image/webp'
            ? 'webp'
            : 'png';
    return { base64: parsed.data, format };
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('blob_read_failed'));
        reader.readAsDataURL(blob);
    });
}

async function savedUrlToDataUrl(savedUrl = '') {
    const url = normalizeMediaUrl(savedUrl);
    if (!url) return '';
    if (/^data:[^;]+;base64,/i.test(url)) return url;
    if (/^blob:/i.test(url)) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('image_fetch_failed');
        return blobToDataUrl(await response.blob());
    }
    if (/^https?:\/\//i.test(url) || url.startsWith('/')) {
        const response = await fetch(url);
        if (!response.ok) throw new Error('image_fetch_failed');
        return blobToDataUrl(await response.blob());
    }
    return '';
}

function getObjectUrlCacheKey(imgId, base64) {
    return String(imgId || '').trim() || `inline-${String(base64 || '').slice(0, 80)}`;
}

function isObjectUrlInUse(url) {
    if (typeof document === 'undefined') return true;
    return Array.from(document.images || []).some(img => img?.src === url);
}

function prunePreviewObjectUrls() {
    if (previewObjectUrlCache.size <= PREVIEW_OBJECT_URL_LIMIT) return;
    for (const [key, url] of previewObjectUrlCache.entries()) {
        if (previewObjectUrlCache.size <= PREVIEW_OBJECT_URL_LIMIT) break;
        if (isObjectUrlInUse(url)) continue;
        try { URL.revokeObjectURL(url); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "prunePreviewObjectUrls" }, caughtError); }
        previewObjectUrlCache.delete(key);
    }
}

function prunePreviewPreloads() {
    while (previewPreloadCache.size > PREVIEW_PRELOAD_LIMIT) {
        const oldestKey = previewPreloadCache.keys().next().value;
        if (oldestKey === undefined) break;
        const cached = previewPreloadCache.get(oldestKey);
        if (cached?.img) {
            try { cached.img.src = ''; } catch (caughtError) { console.warn({ source: import.meta.url, operation: "prunePreviewPreloads" }, caughtError); }
        }
        previewPreloadCache.delete(oldestKey);
    }
}

export function revokePreviewObjectUrl(imgId) {
    const key = String(imgId || '').trim();
    if (!key) return;
    const url = previewObjectUrlCache.get(key);
    if (url) {
        try { URL.revokeObjectURL(url); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "revokePreviewObjectUrl" }, caughtError); }
        previewObjectUrlCache.delete(key);
    }
    const preload = previewPreloadCache.get(key);
    if (preload?.img) {
        try { preload.img.src = ''; } catch (caughtError) { console.warn({ source: import.meta.url, operation: "revokePreviewObjectUrl" }, caughtError); }
    }
    previewPreloadCache.delete(key);
}

export function clearPreviewObjectUrls() {
    for (const url of previewObjectUrlCache.values()) {
        try { URL.revokeObjectURL(url); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "clearPreviewObjectUrls" }, caughtError); }
    }
    previewObjectUrlCache.clear();
    for (const cached of previewPreloadCache.values()) {
        if (cached?.img) {
            try { cached.img.src = ''; } catch (caughtError) { console.warn({ source: import.meta.url, operation: "clearPreviewObjectUrls" }, caughtError); }
        }
    }
    previewPreloadCache.clear();
}

export function getPreviewDisplayUrl(preview = {}) {
    const savedUrl = normalizeMediaUrl(preview?.savedUrl);
    if (savedUrl) return savedUrl;
    const parsed = parseBase64Image(preview?.base64);
    if (!parsed?.data) return '';

    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function' || typeof atob !== 'function') {
        return `data:${parsed.mime};base64,${parsed.data}`;
    }

    const key = getObjectUrlCacheKey(preview?.imgId, parsed.data);
    const cached = previewObjectUrlCache.get(key);
    if (cached) return cached;

    try {
        const url = URL.createObjectURL(base64ToBlob(parsed.data, parsed.mime));
        previewObjectUrlCache.set(key, url);
        prunePreviewObjectUrls();
        return url;
    } catch {
        return `data:${parsed.mime};base64,${parsed.data}`;
    }
}

function getPreviewPreloadKey(preview = {}, url = '') {
    return String(preview?.imgId || '').trim() || String(url || '').trim();
}

export async function preloadPreviewDisplayUrl(preview = {}) {
    const url = getPreviewDisplayUrl(preview);
    if (!url || typeof Image === 'undefined') return false;

    const key = getPreviewPreloadKey(preview, url);
    const cached = previewPreloadCache.get(key);
    if (cached) return cached.promise;

    const img = new Image();
    img.decoding = 'async';
    const promise = new Promise((resolve) => {
        const done = (ok) => resolve(ok);
        img.onload = async () => {
            if (typeof img.decode === 'function') {
                try { await img.decode(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "promise" }, caughtError); }
            }
            done(true);
        };
        img.onerror = () => {
            previewPreloadCache.delete(key);
            done(false);
        };
        img.src = url;
    });
    previewPreloadCache.set(key, { img, promise, timestamp: Date.now() });
    prunePreviewPreloads();
    return promise;
}

export async function warmSlotPreviewNeighbors(slotId, currentIndex = 0, range = 1) {
    const previews = await getPreviewsBySlot(slotId).catch(() => []);
    const successPreviews = previews.filter(hasPreviewImage);
    if (successPreviews.length <= 1) return;

    const start = Math.max(0, currentIndex - range);
    const end = Math.min(successPreviews.length - 1, currentIndex + range);
    for (let index = start; index <= end; index++) {
        if (index === currentIndex) continue;
        const preload = () => {
            void preloadPreviewDisplayUrl(successPreviews[index]).catch((caughtError) => { console.warn({ source: import.meta.url, operation: "preload" }, caughtError); });
        };
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(preload, { timeout: 500 });
        } else {
            setTimeout(preload, 0);
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 内存缓存
// ═══════════════════════════════════════════════════════════════════════════

function prunePreviewCache() {
    const now = Date.now();
    for (const [slotId, cached] of previewCache.entries()) {
        if (!cached || now - cached.timestamp >= CACHE_TTL) {
            previewCache.delete(slotId);
        }
    }
    while (previewCache.size > PREVIEW_CACHE_LIMIT) {
        const oldestKey = previewCache.keys().next().value;
        if (oldestKey === undefined) break;
        previewCache.delete(oldestKey);
    }
}

function getCachedPreviews(slotId) {
    prunePreviewCache();
    const cached = previewCache.get(slotId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedPreviews(slotId, data) {
    prunePreviewCache();
    previewCache.set(slotId, { data, timestamp: Date.now() });
    prunePreviewCache();
}

function invalidateCache(slotId) {
    slotOrderCache.clear();
    slotOrderGeneration++;
    if (slotId) {
        previewCache.delete(slotId);
    } else {
        previewCache.clear();
    }
}

function normalizeChangedSlotIds(slotIds) {
    if (slotIds === null) return null;
    return [...new Set((Array.isArray(slotIds) ? slotIds : [])
        .map(slotId => String(slotId || '').trim())
        .filter(Boolean))];
}

function notifyCacheChangeListeners(slotIds) {
    for (const listener of cacheChangeListeners) {
        try {
            listener({ slotIds });
        } catch (error) {
            console.error('[GalleryCache] 处理跨标签页缓存变更失败:', error);
        }
    }
}

function ensureCacheSyncChannel() {
    if (cacheSyncChannel || typeof globalThis.BroadcastChannel !== 'function') return cacheSyncChannel;
    try {
        cacheSyncChannel = new globalThis.BroadcastChannel(CACHE_SYNC_CHANNEL_NAME);
        cacheSyncChannel.onmessage = (event) => {
            if (event.data?.type !== 'invalidate') return;
            const slotIds = normalizeChangedSlotIds(event.data.slotIds);
            if (slotIds !== null && slotIds.length === 0) return;
            if (slotIds === null) {
                invalidateCache();
            } else {
                slotIds.forEach(invalidateCache);
            }
            notifyCacheChangeListeners(slotIds);
        };
    } catch {
        cacheSyncChannel = null;
    }
    return cacheSyncChannel;
}

function publishCacheChange(slotIds) {
    const normalized = normalizeChangedSlotIds(slotIds);
    if (normalized !== null && normalized.length === 0) return;
    try {
        ensureCacheSyncChannel()?.postMessage({ type: 'invalidate', slotIds: normalized });
    } catch (caughtError) { console.warn({ source: import.meta.url, operation: "publishCacheChange" }, caughtError); }
}

export function subscribeGalleryCacheChanges(listener) {
    if (typeof listener !== 'function') return () => {};
    cacheChangeListeners.add(listener);
    ensureCacheSyncChannel();
    return () => cacheChangeListeners.delete(listener);
}

function normalizePreviewBase64(value = '') {
    const parsed = parseBase64Image(value);
    if (!parsed?.data) return '';
    return `data:${parsed.mime};base64,${parsed.data}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

function getChatCharacterName() {
    const ctx = getContext();
    if (ctx.groupId) return String(ctx.groups?.[ctx.groupId]?.id ?? 'group');
    return String(ctx.characters?.[ctx.characterId]?.name || 'character');
}

function showToast(message, type = 'success', duration = 2500) {
    const colors = { success: 'rgba(62,207,142,0.95)', error: 'rgba(248,113,113,0.95)', info: 'rgba(212,165,116,0.95)' };
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${colors[type] || colors.info};color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;z-index:99999;animation:fadeInOut ${duration/1000}s ease-in-out;max-width:80vw;text-align:center;word-break:break-all`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// ═══════════════════════════════════════════════════════════════════════════
// IndexedDB 操作
// ═══════════════════════════════════════════════════════════════════════════

function isDbValid() {
    if (!db) return false;
    try {
        return db.objectStoreNames.length > 0;
    } catch {
        return false;
    }
}

export async function openDB() {
    if (dbOpening) return dbOpening;

    if (isDbValid() && db.objectStoreNames.contains(DB_SELECTIONS_STORE)) {
        return db;
    }

    if (db) {
        try { db.close(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "openDB" }, caughtError); }
        db = null;
    }

    dbOpening = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            dbOpening = null;
            reject(request.error);
        };

        request.onsuccess = () => {
            db = request.result;
            db.onclose = () => { db = null; };
            db.onversionchange = () => { db.close(); db = null; };
            dbOpening = null;
            resolve(db);
        };

        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(DB_STORE)) {
                const store = database.createObjectStore(DB_STORE, { keyPath: 'imgId' });
                ['messageId', 'chatId', 'timestamp', 'slotId', 'characterName'].forEach(idx => store.createIndex(idx, idx));
            } else {
                const store = e.target.transaction.objectStore(DB_STORE);
                ['messageId', 'chatId', 'timestamp', 'slotId', 'characterName'].forEach((idx) => {
                    if (!store.indexNames.contains(idx)) {
                        store.createIndex(idx, idx);
                    }
                });
            }
            // Released v1-v3 rows have inline base64. Upgrade one row at a time;
            // an aborted upgrade leaves the original database intact.
            const previews = e.target.transaction.objectStore(DB_STORE);
            if (!previews.indexNames.contains(GALLERY_METADATA_INDEX)) {
                previews.createIndex(GALLERY_METADATA_INDEX, GALLERY_METADATA_INDEX);
                previews.openCursor().onsuccess = event => {
                    const cursor = event.target.result;
                    if (!cursor) return;
                    cursor.update(withGalleryMetadata(cursor.value));
                    cursor.continue();
                };
            }
            if (!database.objectStoreNames.contains(DB_SELECTIONS_STORE)) {
                database.createObjectStore(DB_SELECTIONS_STORE, { keyPath: 'slotId' });
            }
        };
    });

    return dbOpening;
}

// ═══════════════════════════════════════════════════════════════════════════
// 选中状态管理
// ═══════════════════════════════════════════════════════════════════════════

export async function setSlotSelection(slotId, imgId) {
    const database = await openDB();
    if (!database.objectStoreNames.contains(DB_SELECTIONS_STORE)) return;
    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_SELECTIONS_STORE, 'readwrite');
            tx.objectStore(DB_SELECTIONS_STORE).put({ slotId, selectedImgId: imgId, timestamp: Date.now() });
            tx.oncomplete = () => {
                publishCacheChange([slotId]);
                resolve();
            };
            tx.onerror = tx.onabort = () => reject(storageWriteError(tx));
        } catch (e) {
            reject(e);
        }
    });
}

export async function getSlotSelection(slotId) {
    const database = await openDB();
    if (!database.objectStoreNames.contains(DB_SELECTIONS_STORE)) return null;
    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_SELECTIONS_STORE, 'readonly');
            const request = tx.objectStore(DB_SELECTIONS_STORE).get(slotId);
            request.onsuccess = () => resolve(request.result?.selectedImgId || null);
            request.onerror = () => reject(request.error);
        } catch (e) {
            reject(e);
        }
    });
}

export async function exportPortablePreviewsForSlots(slotIds = []) {
    const slots = [...new Set((Array.isArray(slotIds) ? slotIds : [])
        .map((slotId) => String(slotId || '').trim())
        .filter(Boolean))];
    const previews = [];
    const selections = [];
    const skipped = [];
    for (const slotId of slots) {
        const display = await getDisplayPreviewForSlot(slotId).catch(() => null);
        const preview = display?.preview || null;
        const imgId = String(preview?.imgId || '').trim();
        if (!imgId) {
            skipped.push({ slotId, imgId: '', reason: 'image_preview_missing' });
            continue;
        }
        let base64 = normalizePreviewBase64(preview.base64);
        if (!base64 && preview.savedUrl) {
            base64 = await savedUrlToDataUrl(preview.savedUrl).catch(() => '');
        }
        if (!base64) {
            skipped.push({ slotId, imgId, reason: 'image_data_missing' });
            continue;
        }
        previews.push({
            imgId,
            slotId,
            messageId: String(preview.messageId || ''),
            chatId: String(preview.chatId || ''),
            characterName: String(preview.characterName || ''),
            source: String(preview.source || ''),
            bookId: String(preview.bookId || ''),
            bookTitle: String(preview.bookTitle || ''),
            chapterPath: String(preview.chapterPath || ''),
            chapterTitle: String(preview.chapterTitle || ''),
            base64,
            tags: String(preview.tags || ''),
            title: String(preview.title || ''),
            positive: String(preview.positive || ''),
            status: preview.status === 'failed' ? 'failed' : 'success',
            errorType: preview.errorType || null,
            errorMessage: preview.errorMessage || null,
            characterPrompts: preview.characterPrompts || null,
            negativePrompt: preview.negativePrompt || null,
            postPrompt: preview.postPrompt ?? null,
            orientation: preview.orientation ?? null,
            timestamp: Number(preview.timestamp) || Date.now(),
        });
        selections.push({ slotId, selectedImgId: imgId });
    }
    return { slots, previews, selections, skipped };
}

export async function importPortablePreviews(previews = [], selections = [], options = {}) {
    const database = await openDB();
    const bookId = String(options.bookId || '').trim();
    const bookTitle = String(options.bookTitle || '').trim();
    const records = (Array.isArray(previews) ? previews : [])
        .map((preview) => ({
            ...preview,
            imgId: String(preview?.imgId || '').trim(),
            slotId: String(preview?.slotId || preview?.imgId || '').trim(),
            bookId: bookId || String(preview?.bookId || ''),
            bookTitle: bookTitle || String(preview?.bookTitle || ''),
            base64: normalizePreviewBase64(preview?.base64),
            timestamp: Number(preview?.timestamp) || Date.now(),
            savedUrl: null,
        }))
        .filter((preview) => preview.imgId && preview.slotId && preview.base64);
    const selectionRows = (Array.isArray(selections) ? selections : [])
        .map((selection) => ({
            slotId: String(selection?.slotId || '').trim(),
            selectedImgId: String(selection?.selectedImgId || '').trim(),
            timestamp: Date.now(),
        }))
        .filter((selection) => selection.slotId && selection.selectedImgId);
    if (!records.length && !selectionRows.length) return { importedPreviews: 0, importedSelections: 0 };

    await new Promise((resolve, reject) => {
        try {
            const stores = [DB_STORE];
            if (database.objectStoreNames.contains(DB_SELECTIONS_STORE)) stores.push(DB_SELECTIONS_STORE);
            const tx = database.transaction(stores, 'readwrite');
            const previewStore = tx.objectStore(DB_STORE);
            records.forEach((record) => previewStore.put(withGalleryMetadata(record)));
            if (stores.includes(DB_SELECTIONS_STORE)) {
                const selectionStore = tx.objectStore(DB_SELECTIONS_STORE);
                selectionRows.forEach((selection) => selectionStore.put(selection));
            }
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        } catch (error) {
            reject(error);
        }
    });
    const changedSlotIds = [...new Set([
        ...records.map(record => record.slotId),
        ...selectionRows.map(selection => selection.slotId),
    ])];
    records.forEach((record) => invalidateCache(record.slotId));
    publishCacheChange(changedSlotIds);
    return {
        importedPreviews: records.length,
        importedSelections: selectionRows.length,
    };
}

export async function clearSlotSelection(slotId) {
    const database = await openDB();
    if (!database.objectStoreNames.contains(DB_SELECTIONS_STORE)) return;
    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_SELECTIONS_STORE, 'readwrite');
            tx.objectStore(DB_SELECTIONS_STORE).delete(slotId);
            tx.oncomplete = () => {
                publishCacheChange([slotId]);
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        } catch (e) {
            reject(e);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 预览存储
// ═══════════════════════════════════════════════════════════════════════════

export async function storePreview(opts) {
    const {
        imgId,
        slotId,
        messageId,
        base64 = null,
        tags,
        title = '',
        positive,
        savedUrl = null,
        status = PreviewStatus.SUCCESS,
        errorType = null,
        errorMessage = null,
        characterPrompts = null,
        negativePrompt = null,
        // 整图正向提示词追加位（ComfyUI 编译器拼在最后），落盘以便画廊编辑重生成时重建
        postPrompt = null,
        orientation = null,
        placement,
        source = '',
        chatId = '',
        characterName = '',
        bookId = '',
        bookTitle = '',
        chapterPath = '',
        chapterTitle = '',
    } = opts;
    const database = await openDB();
    const ctx = getContext();
    const resolvedChatId = String(chatId || ctx.chatId || (ctx.characterId || 'unknown'));
    const resolvedCharacterName = String(characterName || getChatCharacterName());
    const resolvedSlotId = slotId || imgId;

    // Encode only the incoming result, before opening its write transaction.
    let workingBase64 = base64;
    if (workingBase64) {
        try {
            const policy = getSharedDrawSettings();
            if (policy?.saveAsJpeg) {
                workingBase64 = await convertImageToJpeg(workingBase64);
            }
        } catch (e) {
            console.warn(GALLERY_JPEG_COPY.conversionFailed, e);
            globalThis.toastr?.warning(GALLERY_JPEG_COPY.conversionFailed);
        }
    }

    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_STORE, 'readwrite');
            const store = tx.objectStore(DB_STORE);
            const previous = store.get(imgId);
            previous.onsuccess = () => store.put(withGalleryMetadata({
                imgId,
                slotId: resolvedSlotId,
                messageId,
                chatId: resolvedChatId,
                characterName: resolvedCharacterName,
                source,
                bookId,
                bookTitle,
                chapterPath,
                chapterTitle,
                base64: workingBase64,
                tags,
                title: String(title || ''),
                positive,
                savedUrl,
                status,
                errorType,
                errorMessage,
                characterPrompts,
                negativePrompt,
                postPrompt,
                orientation,
                // Only creation grants attachment authority. Progress/late paid
                // results cannot restore authority withdrawn by save or editing.
                placement: previous.result ? previous.result.placement ?? null : placement ?? null,
                timestamp: Date.now()
            }));
            tx.oncomplete = () => {
                invalidateCache(resolvedSlotId);
                publishCacheChange([resolvedSlotId]);
                resolve();
            };
            tx.onerror = tx.onabort = () => reject(storageWriteError(tx));
        } catch (e) {
            reject(e);
        }
    });
}

export async function storeFailedPlaceholder(opts) {
    return storePreview({
        imgId: opts.imgId || `failed-${opts.slotId}-${Date.now()}`,
        slotId: opts.slotId,
        messageId: opts.messageId,
        source: opts.source || '',
        chatId: opts.chatId || '',
        characterName: opts.characterName || '',
        bookId: opts.bookId || '',
        bookTitle: opts.bookTitle || '',
        chapterPath: opts.chapterPath || '',
        chapterTitle: opts.chapterTitle || '',
        base64: null,
        tags: opts.tags,
        title: opts.title || '',
        positive: opts.positive,
        status: 'failed',
        errorType: opts.errorType,
        errorMessage: opts.errorMessage,
        characterPrompts: opts.characterPrompts ?? null,
        negativePrompt: opts.negativePrompt ?? null,
        postPrompt: opts.postPrompt ?? null,
        orientation: opts.orientation ?? null,
    });
}

export async function getPreview(imgId) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_STORE, 'readonly');
            const request = tx.objectStore(DB_STORE).get(imgId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (e) {
            reject(e);
        }
    });
}

// Bounded by the floor, never by the size of the chat or image archive.
export async function getPreviewsForMessage(chatId, messageId) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(DB_STORE, 'readonly');
        const store = tx.objectStore(DB_STORE);
        // Intersect existing indexes before loading records. This also works
        // with released databases, without another blocking schema upgrade.
        const requests = [store.index('chatId').getAllKeys(String(chatId)),
            store.index('messageId').getAllKeys(Number(messageId)), store.index('messageId').getAllKeys(String(messageId))];
        const records = [];
        let remaining = requests.length;
        for (const request of requests) request.onsuccess = () => {
            if (--remaining) return;
            const chatKeys = new Set(requests[0].result);
            for (const key of new Set(requests.slice(1).flatMap(item => item.result))) {
                if (chatKeys.has(key)) store.get(key).onsuccess = event => records.push(event.target.result);
            }
        };
        tx.oncomplete = () => resolve(records);
        tx.onerror = tx.onabort = () => reject(tx.error || new Error(DRAW_SLOT_COPY.storageReadFailed));
    });
}

// Quick-test pages contain positions only, just like the main gallery.
export async function getSlotPreviewPage(slotId, { offset = 0, limit = GALLERY_PAGE_DEFAULT_LIMIT, exclude = [] } = {}) {
    const skip = new Set(exclude);
    const rows = (await getSlotVersions(undefined, slotId)).filter(item => !skip.has(item.imgId));
    return { items: rows.slice(offset, offset + limit), hasMore: offset + limit < rows.length };
}

export async function getPreviewsBySlot(slotId) {
    const cached = getCachedPreviews(slotId);
    if (cached) return cached;

    const database = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_STORE, 'readonly');
            const store = tx.objectStore(DB_STORE);

            const processResults = (results) => {
                results.sort((a, b) => b.timestamp - a.timestamp);
                setCachedPreviews(slotId, results);
                resolve(results);
            };

            if (store.indexNames.contains('slotId')) {
                const request = store.index('slotId').getAll(slotId);
                request.onsuccess = () => {
                    if (request.result?.length) {
                        processResults(request.result);
                    } else {
                        const legacyRequest = store.get(slotId);
                        legacyRequest.onsuccess = () => {
                            const legacy = legacyRequest.result;
                            const results = legacy && (legacy.slotId === slotId || legacy.imgId === slotId || (!legacy.slotId && legacy.imgId === slotId))
                                ? [legacy]
                                : [];
                            processResults(results);
                        };
                        legacyRequest.onerror = () => reject(legacyRequest.error);
                    }
                };
                request.onerror = () => reject(request.error);
            } else {
                const results = [];
                store.openCursor().onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (!cursor) {
                        processResults(results);
                        return;
                    }
                    const record = cursor.value;
                    if (record?.slotId === slotId || record?.imgId === slotId) {
                        results.push(record);
                    }
                    cursor.continue();
                };
                tx.onerror = () => reject(tx.error);
            }
        } catch (e) {
            reject(e);
        }
    });
}

export async function getDisplayPreviewForSlot(slotId) {
    const previews = await getPreviewsBySlot(slotId);
    const selectedImgId = await getSlotSelection(slotId);
    if (!previews.length) return { preview: null, selectedImgId, historyCount: 0, hasData: false, isFailed: false };

    const successPreviews = previews.filter(hasPreviewImage);
    const failedPreviews = previews.filter(p => !hasPreviewImage(p));
    const asFailure = (preview) => ({
        preview,
        selectedImgId,
        historyCount: successPreviews.length,
        hasData: false,
        isFailed: preview?.status !== PreviewStatus.UNGENERATED,
        isUngenerated: preview?.status === PreviewStatus.UNGENERATED,
        isPending: preview?.status === PreviewStatus.PENDING || preview?.status === PreviewStatus.UNKNOWN,
        failedInfo: {
            tags: preview?.tags || '',
            positive: preview?.positive || '',
            errorType: preview?.errorType,
            errorMessage: preview?.errorMessage,
        },
    });

    if (successPreviews.length === 0) {
        return asFailure(failedPreviews[0]);
    }

    if (selectedImgId) {
        const selectedFailure = failedPreviews.find(p => p.imgId === selectedImgId);
        if (selectedFailure) return asFailure(selectedFailure);
        const currentIndex = successPreviews.findIndex(p => p.imgId === selectedImgId);
        if (currentIndex >= 0) {
            return { preview: successPreviews[currentIndex], selectedImgId, currentIndex, historyCount: successPreviews.length, hasData: true, isFailed: false };
        }
    }

    return { preview: successPreviews[0], selectedImgId, currentIndex: 0, historyCount: successPreviews.length, hasData: true, isFailed: false };
}

// All card editors update the selected record, including interrupted attempts.
// This transaction preserves fields unrelated to the edit and never reports a
// successful save after an aborted transaction.
export async function updatePreviewRecord(imgId, changes) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        let updated;
        let failure;
        const request = store.get(imgId);
        request.onsuccess = () => {
            if (!request.result) {
                failure = new Error(DRAW_SLOT_COPY.missingRecord);
                tx.abort();
                return;
            }
            updated = { ...request.result, ...changes, imgId: request.result.imgId, slotId: request.result.slotId };
            store.put(withGalleryMetadata(updated));
        };
        tx.oncomplete = () => {
            invalidateCache(updated.slotId);
            publishCacheChange([updated.slotId]);
            resolve(updated);
        };
        tx.onerror = tx.onabort = () => reject(failure || storageWriteError(tx));
    });
}

// Revoke attachment only; never remove the paid image or its reusable input.
// The transaction also serializes against late full-record transport writes.
export async function clearPreviewPlacements(owner, slotIds) {
    const database = await openDB();
    const ids = [...new Set(slotIds)];
    if (!owner || !ids.length) return;
    return new Promise((resolve, reject) => {
        const tx = database.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        for (const slotId of ids) {
            const request = store.index('slotId').openCursor(slotId);
            request.onsuccess = () => {
                const cursor = request.result;
                if (!cursor) return;
                if (cursor.value.placement?.owner === owner) cursor.update({ ...cursor.value, placement: null });
                cursor.continue();
            };
        }
        tx.oncomplete = () => {
            ids.forEach(invalidateCache);
            publishCacheChange(ids);
            resolve();
        };
        tx.onerror = tx.onabort = () => reject(storageWriteError(tx));
    });
}

export async function getCardPreview({ imgId, slotId }) {
    if (!imgId) return null;
    const record = await getPreview(imgId);
    return record?.slotId === slotId ? record : null;
}

export async function getLatestPreviewForSlot(slotId) {
    const result = await getDisplayPreviewForSlot(slotId);
    return result.preview;
}

export async function deletePreview(imgId) {
    const database = await openDB();
    const preview = await getPreview(imgId);
    const slotId = preview?.slotId;

    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction([DB_STORE, DB_SELECTIONS_STORE], 'readwrite');
            tx.objectStore(DB_STORE).delete(imgId);
            if (slotId) {
                const selections = tx.objectStore(DB_SELECTIONS_STORE);
                const selected = selections.get(slotId);
                selected.onsuccess = () => {
                    if (selected.result?.selectedImgId === imgId) selections.delete(slotId);
                };
            }
            tx.oncomplete = () => {
                revokePreviewObjectUrl(imgId);
                if (slotId) invalidateCache(slotId);
                publishCacheChange(slotId ? [slotId] : []);
                resolve();
            };
            tx.onerror = tx.onabort = () => reject(storageWriteError(tx));
        } catch (e) {
            reject(e);
        }
    });
}

export async function deleteFailedRecordsForSlot(slotId) {
    const previews = await getPreviewsBySlot(slotId);
    const failedRecords = previews.filter(p => p.status === 'failed' || (!p.base64 && !p.savedUrl));
    for (const record of failedRecords) {
        await deletePreview(record.imgId);
    }
}

export async function updatePreviewSavedUrl(imgId, savedUrl) {
    const database = await openDB();
    const preview = await getPreview(imgId);
    if (!preview) return;

    preview.savedUrl = savedUrl;
    preview.base64 = null;

    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_STORE, 'readwrite');
            tx.objectStore(DB_STORE).put(withGalleryMetadata(preview));
            tx.oncomplete = () => {
                // 不在这里作废 blob URL：聊天里的图片卡（或尚未加载的懒加载图片）可能还在用它，
                // 提前作废会让它加载失败；闲置的 blob 由 prunePreviewObjectUrls 回收。
                invalidateCache(preview.slotId);
                publishCacheChange([preview.slotId]);
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        } catch (e) {
            reject(e);
        }
    });
}

export async function savePreviewImage(imgId, filePrefix = 'draw') {
    const preview = await getPreview(imgId);
    if (!preview) throw new Error('图片缓存不存在');
    if (preview.savedUrl) return preview.savedUrl;
    if (!preview.base64) throw new Error('图片缓存不存在');
    const charName = preview.characterName || getChatCharacterName();
    const image = getBase64ImagePayload(preview.base64);
    const url = await saveBase64AsFile(image.base64, charName, `${filePrefix}_${imgId}`, image.format);
    await updatePreviewSavedUrl(imgId, url);
    return url;
}

export async function getCacheStats() {
    return (await getGalleryOverview()).stats;
}

// Read keys, not values: the primary image record/base64 is never cloned here.
export async function getGalleryMetadata({ slotId, charName } = {}) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        const tx = database.transaction(DB_STORE, 'readonly');
        const rows = [];
        const request = tx.objectStore(DB_STORE).index(GALLERY_METADATA_INDEX).openKeyCursor();
        request.onsuccess = () => {
            const cursor = request.result;
            if (!cursor) return;
            const row = galleryMetadataFromKey(cursor.key, cursor.primaryKey);
            if ((slotId === undefined || row.slotId === slotId)
                && (charName === undefined || row.characterName === charName)) rows.push(row);
            cursor.continue();
        };
        tx.oncomplete = () => resolve(rows.sort((a, b) => b.timestamp - a.timestamp || compareText(a.imgId, b.imgId)));
        tx.onerror = tx.onabort = () => reject(tx.error || new Error(DRAW_SLOT_COPY.storageReadFailed));
    });
}

export async function getGalleryOverview() {
    const rows = await getGalleryMetadata();
    const summary = Object.create(null);
    let totalSize = 0, successCount = 0;
    for (const item of rows) {
        totalSize += item.sizeBytes;
        if (!item.displayable) continue;
        successCount++;
        const char = summary[item.characterName] ||= { count: 0, totalSize: 0, slots: Object.create(null), latestTimestamp: 0 };
        const slot = char.slots[item.slotId] ||= { count: 0, hasSaved: false, latestTimestamp: item.timestamp, latestImgId: item.imgId };
        slot.count++;
        slot.hasSaved ||= !!item.savedUrl;
        char.count++;
        char.totalSize += item.sizeBytes;
        char.latestTimestamp = Math.max(char.latestTimestamp, item.timestamp);
    }
    return { summary, stats: { count: rows.length, successCount, failedCount: rows.length - successCount,
        sizeBytes: Math.round(totalSize), sizeMB: (totalSize / 1024 / 1024).toFixed(2) } };
}

export async function clearExpiredCache(cacheDays = 3) {
    const cutoff = Date.now() - cacheDays * 24 * 60 * 60 * 1000;
    const database = await openDB();
    let cleaned = 0;

    return new Promise((resolve) => {
        try {
            const tx = database.transaction(DB_STORE, 'readwrite');
            const store = tx.objectStore(DB_STORE);
            store.openCursor().onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) { 
                    const record = cursor.value;
                    const isExpiredUnsaved = record.timestamp < cutoff && !record.savedUrl;
                    const isFailed = record.status === 'failed' || (!record.base64 && !record.savedUrl);
                    const shouldTrimSavedBase64 = !!record.savedUrl && !!record.base64;

                    // Chat image rows are durable user inputs/results, not a
                    // disposable request cache. Only explicit gallery/slot
                    // deletion may remove the last copy of their TAG or image.
                    const chatImage = record.chatId && record.messageId !== undefined
                        && record.messageId !== null && record.messageId !== '' && !record.source;
                    if (!chatImage && (isExpiredUnsaved || (isFailed && record.timestamp < cutoff))) {
                        revokePreviewObjectUrl(record.imgId);
                        cursor.delete(); 
                        cleaned++; 
                        cursor.continue(); 
                        return;
                    }

                    if (shouldTrimSavedBase64) {
                        record.base64 = null;
                        revokePreviewObjectUrl(record.imgId);
                        cursor.update(withGalleryMetadata(record));
                        cleaned++;
                    }

                    cursor.continue(); 
                }
            };
            tx.oncomplete = () => {
                invalidateCache();
                if (cleaned > 0) publishCacheChange(null);
                resolve(cleaned);
            };
        } catch {
            resolve(0);
        }
    });
}

export async function clearAllCache() {
    const database = await openDB();
    return new Promise((resolve, reject) => {
        try {
            const stores = [DB_STORE];
            if (database.objectStoreNames.contains(DB_SELECTIONS_STORE)) {
                stores.push(DB_SELECTIONS_STORE);
            }
            const tx = database.transaction(stores, 'readwrite');
            tx.objectStore(DB_STORE).clear();
            if (stores.length > 1) {
                tx.objectStore(DB_SELECTIONS_STORE).clear();
            }
            tx.oncomplete = () => {
                clearPreviewObjectUrls();
                invalidateCache();
                publishCacheChange(null);
                resolve();
            };
            tx.onerror = () => reject(tx.error);
        } catch (e) {
            reject(e);
        }
    });
}

export async function getGallerySummary() {
    return (await getGalleryOverview()).summary;
}

// ═══════════════════════════════════════════════════════════════════════════
// 图片管理：按图组分页读取（只把本页图组的“最新一张”带出去，版本按需另取）
// ═══════════════════════════════════════════════════════════════════════════

function compareText(a, b) {
    return a < b ? -1 : (a > b ? 1 : 0);
}

async function scanCharacterSlotOrder(charName) {
    const slots = new Map();
    for (const item of await getGalleryMetadata({ charName })) {
        if (!item.displayable) continue;
        let slot = slots.get(item.slotId);
        if (!slot) {
            slot = { slotId: item.slotId, count: 0, hasSaved: false, latestTimestamp: item.timestamp, latestImgId: item.imgId, latest: item };
            slots.set(item.slotId, slot);
        }
        slot.count++;
        slot.hasSaved ||= !!item.savedUrl;
    }
    return Array.from(slots.values()).sort((a, b) => b.latestTimestamp - a.latestTimestamp || compareText(a.slotId, b.slotId));
}

function getCharacterSlotOrder(charName) {
    const cached = slotOrderCache.get(charName);
    if (cached && Date.now() - cached.at < SLOT_ORDER_CACHE_TTL) return cached.promise;
    const generation = slotOrderGeneration;
    const promise = scanCharacterSlotOrder(charName);
    const entry = { at: Date.now(), promise };
    slotOrderCache.set(charName, entry);
    // 失败、或扫描期间发生过写入（结果可能已过期）：不留缓存，本次调用仍可用这份结果作答。
    const drop = () => { if (slotOrderCache.get(charName) === entry) slotOrderCache.delete(charName); };
    promise.then(() => { if (generation !== slotOrderGeneration) drop(); }, drop);
    return promise;
}

// Pages contain metadata only. Image content is fetched individually by the viewport.

export async function getCharacterSlotsPage(charName, { offset = 0, limit = GALLERY_PAGE_DEFAULT_LIMIT } = {}) {
    const start = Math.max(0, Math.floor(Number(offset)) || 0);
    const size = Math.min(GALLERY_PAGE_MAX_LIMIT, Math.max(1, Math.floor(Number(limit)) || GALLERY_PAGE_DEFAULT_LIMIT));
    const all = await getCharacterSlotOrder(charName);
    const pageSlots = all.slice(start, start + size);
    const slots = {};
    const order = [];
    const slotMeta = {};
    pageSlots.forEach((slot) => {
        slots[slot.slotId] = [slot.latest];
        slotMeta[slot.slotId] = { count: slot.count, hasSaved: slot.hasSaved };
        order.push(slot.slotId);
    });
    const nextOffset = start + pageSlots.length;
    return { slots, order, slotMeta, offset: start, limit: size, total: all.length, hasMore: nextOffset < all.length, nextOffset };
}

// All version positions are cheap metadata; no original image payloads.
export async function getSlotVersions(charName, slotId) {
    return (await getGalleryMetadata({ charName, slotId })).filter(item => item.displayable);
}

// ═══════════════════════════════════════════════════════════════════════════
// 小画廊 UI
// ═══════════════════════════════════════════════════════════════════════════

function ensureGalleryStyles() {
    if (document.getElementById('nd-gallery-styles')) return;
    const style = document.createElement('style');
    style.id = 'nd-gallery-styles';
    style.textContent = `
#nd-gallery-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100003;display:none;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px)}
#nd-gallery-overlay.visible{display:flex;flex-direction:column;align-items:center;justify-content:center}
.nd-gallery-close{position:absolute;top:16px;right:16px;width:40px;height:40px;border:none;background:rgba(255,255,255,0.1);border-radius:50%;color:#fff;font-size:20px;cursor:pointer;z-index:10}
.nd-gallery-close:hover{background:rgba(255,255,255,0.2)}
#nd-gallery-overlay :focus-visible{outline:2px solid #fff;outline-offset:2px}
.nd-gallery-main{position:relative;display:flex;align-items:center;justify-content:center;width:100%;max-height:75%;flex:1;min-height:0;overflow:hidden}
.nd-gallery-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:10;width:48px;height:48px;border:none;background:rgba(0,0,0,0.35);backdrop-filter:blur(4px);border-radius:50%;color:#fff;font-size:24px;cursor:pointer}
#nd-gallery-prev{left:16px}
#nd-gallery-next{right:16px}
.nd-gallery-nav:hover{background:rgba(255,255,255,0.2)}
.nd-gallery-nav:disabled{opacity:0.3;cursor:not-allowed}
/* 图片与角标共享居中的图片网格区域，不以撑满高度的外壳作为角标边界。 */
.nd-gallery-img-wrap{position:relative;max-width:90%;height:100%;min-height:0;display:grid;grid-template-rows:minmax(0,max-content);align-content:center;justify-content:center;touch-action:none}
.nd-gallery-img,.nd-gallery-saved-badge{grid-area:1/1}
.nd-gallery-img{min-width:0;min-height:0;max-width:100%;max-height:100%;object-fit:contain;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5);user-select:none;-webkit-user-drag:none;will-change:transform}
.nd-gallery-saved-badge{position:absolute;top:min(12px,10%);left:min(12px,10%);z-index:10;background:rgba(62,207,142,0.9);padding:min(4px,5%) min(10px,5%);white-space:nowrap;border-radius:6px;font-size:11px;color:#fff;font-weight:600}
.nd-gallery-thumbs{flex-shrink:0;display:flex;gap:8px;margin-top:20px;padding:12px;background:rgba(0,0,0,0.3);border-radius:12px;box-sizing:border-box;max-width:90%;overflow-x:auto;transition:opacity 0.15s ease,visibility 0.15s ease}
#nd-gallery-overlay.zoomed .nd-gallery-thumbs{opacity:0;pointer-events:none;visibility:hidden}
.nd-gallery-thumb{width:64px;height:64px;border-radius:8px;object-fit:cover;cursor:pointer;border:2px solid transparent;opacity:0.6;transition:all 0.15s;flex-shrink:0}
.nd-gallery-thumb:hover{opacity:0.9}
.nd-gallery-thumb.active{border-color:#d4a574;opacity:1}
.nd-gallery-thumb.saved{border-color:rgba(62,207,142,0.8)}
.nd-gallery-actions{display:flex;flex-shrink:0;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:16px;max-width:100%}
.nd-gallery-btn{padding:10px 20px;border:1px solid rgba(255,255,255,0.32);border-radius:8px;background:rgba(255,255,255,0.1);color:#fff;font-size:13px;cursor:pointer;transition:all 0.15s}
.nd-gallery-btn:hover{background:rgba(255,255,255,0.2)}
.nd-gallery-btn.primary{background:#ece6d8;border-color:#ece6d8;color:#14151b;font-weight:600}
.nd-gallery-btn.primary:hover{background:#fff}
.nd-gallery-btn.danger{color:#f87171;border-color:rgba(248,113,113,0.3)}
.nd-gallery-btn.danger:hover{background:rgba(248,113,113,0.15)}
.nd-gallery-info{flex-shrink:0;text-align:center;margin:12px 0 8px;font-size:12px;color:#b4b1a9}
@media(max-height:500px){.nd-gallery-thumbs{margin-top:8px;padding:6px}.nd-gallery-thumb{width:40px;height:40px}.nd-gallery-actions{margin-top:8px}.nd-gallery-info{margin-top:6px}}`;
    document.head.appendChild(style);
}

let galleryZoomScale = 1;
let galleryZoomX = 0;
let galleryZoomY = 0;
let galleryPanning = false;
const galleryPointers = new Map();

function applyGalleryZoom(smooth = false) {
    const img = document.getElementById('nd-gallery-img');
    if (!img) return;
    img.style.transition = smooth ? 'transform 0.15s ease-out' : 'none';
    img.style.transform = galleryZoomScale > 1 ? `translate3d(${galleryZoomX}px, ${galleryZoomY}px, 0) scale(${galleryZoomScale})` : '';
    img.style.cursor = galleryZoomScale > 1 ? (galleryPanning ? 'grabbing' : 'grab') : '';
    document.getElementById('nd-gallery-overlay')?.classList.toggle('zoomed', galleryZoomScale > 1);
}

function resetGalleryZoom(smooth = false) {
    galleryZoomScale = 1;
    galleryZoomX = 0;
    galleryZoomY = 0;
    galleryPanning = false;
    galleryPointers.clear();
    applyGalleryZoom(smooth);
}

function createGalleryOverlay() {
    if (galleryOverlayCreated) return;
    galleryOverlayCreated = true;
    ensureGalleryStyles();

    const overlay = document.createElement('div');
    overlay.id = 'nd-gallery-overlay';
    // eslint-disable-next-line no-unsanitized/property -- Template-only UI markup.
    overlay.innerHTML = `<button class="nd-gallery-close" id="nd-gallery-close">✕</button><div class="nd-gallery-main"><button class="nd-gallery-nav" id="nd-gallery-prev">‹</button><div class="nd-gallery-img-wrap"><img class="nd-gallery-img" id="nd-gallery-img" src="" alt=""><div class="nd-gallery-saved-badge" id="nd-gallery-saved-badge" style="display:none">已保存</div></div><button class="nd-gallery-nav" id="nd-gallery-next">›</button></div><div class="nd-gallery-thumbs" id="nd-gallery-thumbs"></div><div class="nd-gallery-actions" id="nd-gallery-actions"><button class="nd-gallery-btn primary" id="nd-gallery-use">使用此图</button><button class="nd-gallery-btn" id="nd-gallery-save">${IMAGE_SAVE_LABEL_HTML}</button><button class="nd-gallery-btn danger" id="nd-gallery-delete">🗑️ 删除</button></div><div class="nd-gallery-info" id="nd-gallery-info"></div>`;
    document.body.appendChild(overlay);

    document.getElementById('nd-gallery-close').addEventListener('click', closeGallery);
    document.getElementById('nd-gallery-prev').addEventListener('click', () => navigateGallery(-1));
    document.getElementById('nd-gallery-next').addEventListener('click', () => navigateGallery(1));
    document.getElementById('nd-gallery-use').addEventListener('click', useCurrentGalleryImageEvent);
    document.getElementById('nd-gallery-save').addEventListener('click', saveCurrentGalleryImageEvent);
    document.getElementById('nd-gallery-delete').addEventListener('click', deleteCurrentGalleryImageEvent);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeGallery(); });

    const img = document.getElementById('nd-gallery-img');

    img.addEventListener('wheel', (e) => {
        if (!img.src) return;
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.2 : 0.833;
        const newScale = Math.max(1, Math.min(6, galleryZoomScale * factor));
        if (newScale === galleryZoomScale) return;
        if (newScale <= 1.01) {
            galleryZoomScale = 1;
            galleryZoomX = 0;
            galleryZoomY = 0;
        } else {
            const rect = img.getBoundingClientRect();
            const cx = e.clientX - (rect.left + rect.width / 2);
            const cy = e.clientY - (rect.top + rect.height / 2);
            const ratio = newScale / galleryZoomScale;
            galleryZoomX += cx * (1 - ratio);
            galleryZoomY += cy * (1 - ratio);
            galleryZoomScale = newScale;
        }
        applyGalleryZoom(false);
    }, { passive: false });

    img.addEventListener('pointerdown', (e) => {
        if (e.button !== 0 || !img.src) return;
        galleryPointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        galleryPanning = galleryZoomScale > 1;
        applyGalleryZoom(false);
        img.setPointerCapture(e.pointerId);
    });

    img.addEventListener('pointermove', (e) => {
        const previous = galleryPointers.get(e.pointerId);
        if (!previous) return;
        const next = { x: e.clientX, y: e.clientY };
        const other = [...galleryPointers.entries()].find(([id]) => id !== e.pointerId)?.[1];
        if (other) {
            const oldDistance = Math.hypot(previous.x - other.x, previous.y - other.y);
            const distance = Math.hypot(next.x - other.x, next.y - other.y);
            const scale = Math.max(1, Math.min(6, galleryZoomScale * (oldDistance ? distance / oldDistance : 1)));
            const rect = img.getBoundingClientRect();
            const cx = (previous.x + other.x) / 2 - (rect.left + rect.width / 2);
            const cy = (previous.y + other.y) / 2 - (rect.top + rect.height / 2);
            const ratio = scale / galleryZoomScale;
            galleryZoomX += cx * (1 - ratio) + (next.x - previous.x) / 2;
            galleryZoomY += cy * (1 - ratio) + (next.y - previous.y) / 2;
            galleryZoomScale = scale;
        } else if (galleryZoomScale > 1) {
            galleryZoomX += next.x - previous.x;
            galleryZoomY += next.y - previous.y;
        }
        galleryPointers.set(e.pointerId, next);
        if (galleryZoomScale === 1) { galleryZoomX = 0; galleryZoomY = 0; }
        galleryPanning = galleryZoomScale > 1;
        applyGalleryZoom(false);
    });

    const endPan = (e) => {
        galleryPointers.delete(e.pointerId);
        galleryPanning = galleryPointers.size > 0 && galleryZoomScale > 1;
        applyGalleryZoom(false);
    };
    img.addEventListener('pointerup', endPan);
    img.addEventListener('pointercancel', endPan);
    img.addEventListener('lostpointercapture', endPan);
}

export async function openGallery(slotId, messageId, callbacks = {}, initialImgId = null) {
    closeGallery();
    const request = galleryOpenRequest;
    // Capture before IndexedDB yields; the host can reuse its chat array when
    // navigating, so neither an index nor a chat filename identifies the source.
    const ctx = getContext();
    const owner = getImageChatIdentity(ctx);
    const chatId = String(ctx.chatId || '');
    const msgIdx = messageId == null ? NaN : Number(messageId);
    const message = Number.isInteger(msgIdx) ? ctx.chat?.[msgIdx] : null;
    const swipeIndex = message?.swipe_id ?? 0;
    const assertCurrent = () => {
        const current = getContext();
        if (current.chat !== ctx.chat || getImageChatIdentity(current) !== owner
            || (Number.isInteger(msgIdx) && current.chat?.[msgIdx] !== message)
            || (message?.swipe_id ?? 0) !== swipeIndex) throw new Error(DRAW_SLOT_COPY.sourceChanged);
    };
    createGalleryOverlay();

    let previews = await getSlotVersions(undefined, slotId);
    if (request !== galleryOpenRequest) return;
    assertCurrent();
    let validPreviews = previews;

    if (!validPreviews.length && message && owner) {
        const { materializeDrawSavedPreview } = await import('./draw-common.js');
        assertCurrent();
        await materializeDrawSavedPreview(message, slotId, { messageId: msgIdx, chatId });
        if (request !== galleryOpenRequest) return;
        assertCurrent();
        previews = await getSlotVersions(undefined, slotId);
        if (request !== galleryOpenRequest) return;
        assertCurrent();
        validPreviews = previews;
    }

    if (!validPreviews.length) {
        showToast('没有找到图片历史', 'error');
        return;
    }

    const selectedImgId = initialImgId || await getSlotSelection(slotId);
    if (request !== galleryOpenRequest) return;
    assertCurrent();
    let startIndex = 0;
    if (selectedImgId) {
        const idx = validPreviews.findIndex(p => p.imgId === selectedImgId);
        if (idx >= 0) startIndex = idx;
    }

    currentGalleryData = { slotId, messageId, previews: validPreviews, currentIndex: startIndex, callbacks,
        imageWindow: createGalleryImageWindow({ load: getPreview }),
        stopViewport: observeViewport(() => {
            Object.assign(document.getElementById('nd-gallery-overlay').style, getSafeViewportStyles());
        }),
    };
    renderGalleryThumbs();
    renderGallery();
    document.getElementById('nd-gallery-use').hidden = messageId == null;
    document.getElementById('nd-gallery-overlay').classList.add('visible');
}

export function closeGallery() {
    galleryOpenRequest++;
    resetGalleryZoom(false);
    currentGalleryData?.stopViewport();
    const el = document.getElementById('nd-gallery-overlay');
    if (el) el.classList.remove('visible');
    document.getElementById('nd-gallery-img')?.removeAttribute('src');
    document.getElementById('nd-gallery-thumbs')?.replaceChildren();
    currentGalleryData?.imageWindow.dispose();
    currentGalleryData = null;
}

function renderGalleryThumbs() {
    if (!currentGalleryData) return;
    const { previews } = currentGalleryData;
    const reversedPreviews = previews.slice().reverse();
    const thumbsContainer = document.getElementById('nd-gallery-thumbs');

    // eslint-disable-next-line no-unsanitized/property -- Generated from local preview data only.
    thumbsContainer.innerHTML = reversedPreviews.map((p, i) => {
        const originalIndex = previews.length - 1 - i;
        const classes = ['nd-gallery-thumb'];
        if (p.savedUrl) classes.push('saved');
        return `<img class="${classes.join(' ')}" data-index="${originalIndex}" alt="" loading="lazy">`;
    }).join('');

    thumbsContainer.querySelectorAll('.nd-gallery-thumb').forEach(thumb => {
        thumb.dataset.galleryId = previews[Number(thumb.dataset.index)].imgId;
        thumb.addEventListener('click', () => {
            currentGalleryData.currentIndex = parseInt(thumb.dataset.index);
            renderGallery();
        });
    });
}

function updateGalleryThumbState() {
    if (!currentGalleryData) return;
    const { currentIndex } = currentGalleryData;
    const thumbsContainer = document.getElementById('nd-gallery-thumbs');
    thumbsContainer.querySelectorAll('.nd-gallery-thumb').forEach((thumb) => {
        const isActive = parseInt(thumb.dataset.index) === currentIndex;
        thumb.classList.toggle('active', isActive);
        if (isActive) {
            thumb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    });
}

function syncHostGalleryImages() {
    currentGalleryData?.imageWindow.sync(document.getElementById('nd-gallery-overlay').querySelectorAll('[data-gallery-id]'));
}

function renderGallery() {
    if (!currentGalleryData) return;

    const { previews, currentIndex } = currentGalleryData;
    const current = previews[currentIndex];
    if (!current) return;

    const image = document.getElementById('nd-gallery-img');
    if (image.dataset.imgId !== current.imgId) resetGalleryZoom(false);
    image.dataset.imgId = current.imgId;
    image.dataset.galleryId = current.imgId;
    image.setAttribute('data-gallery-pinned', '');
    syncHostGalleryImages();
    document.getElementById('nd-gallery-saved-badge').style.display = current.savedUrl ? 'block' : 'none';
    updateGalleryThumbState();

    document.getElementById('nd-gallery-prev').disabled = currentIndex >= previews.length - 1;
    document.getElementById('nd-gallery-next').disabled = currentIndex <= 0;

    const saveBtn = document.getElementById('nd-gallery-save');
    if (current.savedUrl) {
        saveBtn.textContent = '✓ 已保存';
        saveBtn.disabled = true;
    } else {
        // eslint-disable-next-line no-unsanitized/property -- Static draw-owned markup, without user input.
        saveBtn.innerHTML = IMAGE_SAVE_LABEL_HTML;
        saveBtn.disabled = false;
    }

    const displayVersion = previews.length - currentIndex;
    const date = new Date(current.timestamp).toLocaleString();
    document.getElementById('nd-gallery-info').textContent = `版本 ${displayVersion} / ${previews.length} · ${date}`;
}

function navigateGallery(delta) {
    if (!currentGalleryData) return;
    const newIndex = currentGalleryData.currentIndex - delta;
    if (newIndex >= 0 && newIndex < currentGalleryData.previews.length) {
        currentGalleryData.currentIndex = newIndex;
        renderGallery();
    }
}

async function useCurrentGalleryImage() {
    if (!currentGalleryData) return;

    const { slotId, messageId, previews, currentIndex, callbacks } = currentGalleryData;
    const view = currentGalleryData;
    const selected = await getPreview(previews[currentIndex]?.imgId);
    if (!selected || currentGalleryData !== view) return;

    await setSlotSelection(slotId, selected.imgId);
    if (callbacks.onUse) callbacks.onUse(slotId, messageId, selected, previews.length);
    if (currentGalleryData === view) closeGallery();
    showToast('已切换显示图片');
}

async function saveCurrentGalleryImage() {
    if (!currentGalleryData) return;

    const { slotId, previews, currentIndex, callbacks } = currentGalleryData;
    const view = currentGalleryData;
    const metadata = previews[currentIndex];
    if (!metadata || metadata.savedUrl) return;

    try {
        const current = await getPreview(metadata.imgId);
        if (!current || currentGalleryData !== view) return;
        const charName = current.characterName || getChatCharacterName();
        const image = getBase64ImagePayload(current.base64);
        const url = await saveBase64AsFile(image.base64, charName, `novel_${current.imgId}`, image.format);
        await updatePreviewSavedUrl(current.imgId, url);
        metadata.savedUrl = url;
        await setSlotSelection(slotId, current.imgId);
        showToast(`已保存: ${url}`, 'success', 4000);
        if (currentGalleryData === view) { renderGalleryThumbs(); renderGallery(); }
        if (callbacks.onSave) callbacks.onSave(current.imgId, url);
    } catch (e) {
        console.error('[GalleryCache] save failed:', e);
        showToast(`保存失败: ${e.message}`, 'error');
    }
}

async function deleteCurrentGalleryImage() {
    if (!currentGalleryData) return;

    const { slotId, messageId, previews, currentIndex, callbacks } = currentGalleryData;
    const view = currentGalleryData;
    const current = await getPreview(previews[currentIndex]?.imgId);
    if (!current || currentGalleryData !== view) return;

    const msg = current.savedUrl ? '确定删除这条记录吗？服务器上的图片文件不会被删除。' : '确定删除这张图片吗？';
    if (!confirm(msg)) return;

    try {
        await deletePreview(current.imgId);

        const selectedId = await getSlotSelection(slotId);
        if (selectedId === current.imgId) {
            await clearSlotSelection(slotId);
        }

        previews.splice(currentIndex, 1);

        if (previews.length === 0) {
            if (currentGalleryData === view) closeGallery();
            if (callbacks.onBecameEmpty) {
                callbacks.onBecameEmpty(slotId, messageId, { tags: current.tags || '', title: current.title || '', positive: current.positive || '' });
            }
            showToast('图片已删除，可点击重试重新生成');
        } else {
            if (currentGalleryData === view) {
                view.currentIndex = Math.min(view.currentIndex, previews.length - 1);
                renderGalleryThumbs();
                renderGallery();
            }
            if (callbacks.onDelete) {
                // Existing chat callbacks need the replacement's prompt/orientation,
                // not every historical payload. Hydrate only their two candidates.
                const remaining = previews.slice();
                for (const index of new Set([0, previews.findIndex(item => item.savedUrl)])) {
                    if (index >= 0) remaining[index] = await getPreview(previews[index].imgId) || previews[index];
                }
                await callbacks.onDelete(slotId, current.imgId, remaining);
            }
            showToast('图片已删除');
        }
    } catch (e) {
        console.error('[GalleryCache] delete failed:', e);
        showToast(`删除失败: ${e.message}`, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 清理
// ═══════════════════════════════════════════════════════════════════════════

export function destroyGalleryCache() {
    closeGallery();
    invalidateCache();
    clearPreviewObjectUrls();

    document.getElementById('nd-gallery-overlay')?.remove();
    document.getElementById('nd-gallery-styles')?.remove();
    galleryOverlayCreated = false;

    if (db) {
        try { db.close(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "destroyGalleryCache" }, caughtError); }
        db = null;
    }
    dbOpening = null;
}
