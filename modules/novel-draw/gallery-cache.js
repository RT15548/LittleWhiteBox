// gallery-cache.js
// 画廊和缓存管理模块

import { getContext } from "../../../../../extensions.js";
import { saveBase64AsFile } from "../../../../../utils.js";

// ═══════════════════════════════════════════════════════════════════════════
// 常量
// ═══════════════════════════════════════════════════════════════════════════

const DB_NAME = 'xb_novel_draw_previews';
const DB_STORE = 'previews';
const DB_SELECTIONS_STORE = 'selections';
const DB_VERSION = 2;
const CACHE_TTL = 5000;

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

let db = null;
let dbOpening = null;
let galleryOverlayCreated = false;
let currentGalleryData = null;

const previewCache = new Map();

// ═══════════════════════════════════════════════════════════════════════════
// 内存缓存
// ═══════════════════════════════════════════════════════════════════════════

function getCachedPreviews(slotId) {
    const cached = previewCache.get(slotId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedPreviews(slotId, data) {
    previewCache.set(slotId, { data, timestamp: Date.now() });
}

function invalidateCache(slotId) {
    if (slotId) {
        previewCache.delete(slotId);
    } else {
        previewCache.clear();
    }
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
        try { db.close(); } catch {}
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
                ['messageId', 'chatId', 'timestamp', 'slotId'].forEach(idx => store.createIndex(idx, idx));
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
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
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

export async function clearSlotSelection(slotId) {
    const database = await openDB();
    if (!database.objectStoreNames.contains(DB_SELECTIONS_STORE)) return;
    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_SELECTIONS_STORE, 'readwrite');
            tx.objectStore(DB_SELECTIONS_STORE).delete(slotId);
            tx.oncomplete = () => resolve();
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
    const { imgId, slotId, messageId, base64 = null, tags, positive, savedUrl = null, status = 'success', errorType = null, errorMessage = null, characterPrompts = null, negativePrompt = null } = opts;
    const database = await openDB();
    const ctx = getContext();
    
    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_STORE, 'readwrite');
            tx.objectStore(DB_STORE).put({
                imgId,
                slotId: slotId || imgId,
                messageId,
                chatId: ctx.chatId || (ctx.characterId || 'unknown'),
                characterName: getChatCharacterName(),
                base64,
                tags,
                positive,
                savedUrl,
                status,
                errorType,
                errorMessage,
                characterPrompts,
                negativePrompt,
                timestamp: Date.now()
            });
            tx.oncomplete = () => { invalidateCache(slotId); resolve(); };
            tx.onerror = () => reject(tx.error);
        } catch (e) {
            reject(e);
        }
    });
}

export async function storeFailedPlaceholder(opts) {
    return storePreview({
        imgId: `failed-${opts.slotId}-${Date.now()}`,
        slotId: opts.slotId,
        messageId: opts.messageId,
        base64: null,
        tags: opts.tags,
        positive: opts.positive,
        status: 'failed',
        errorType: opts.errorType,
        errorMessage: opts.errorMessage,
        characterPrompts: opts.characterPrompts || null,
        negativePrompt: opts.negativePrompt || null,
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
                        const allRequest = store.getAll();
                        allRequest.onsuccess = () => {
                            const results = (allRequest.result || []).filter(r => 
                                r.slotId === slotId || r.imgId === slotId || (!r.slotId && r.imgId === slotId)
                            );
                            processResults(results);
                        };
                        allRequest.onerror = () => reject(allRequest.error);
                    }
                };
                request.onerror = () => reject(request.error);
            } else {
                const request = store.getAll();
                request.onsuccess = () => {
                    const results = (request.result || []).filter(r => r.slotId === slotId || r.imgId === slotId);
                    processResults(results);
                };
                request.onerror = () => reject(request.error);
            }
        } catch (e) {
            reject(e);
        }
    });
}

export async function getDisplayPreviewForSlot(slotId) {
    const previews = await getPreviewsBySlot(slotId);
    if (!previews.length) return { preview: null, historyCount: 0, hasData: false, isFailed: false };
    
    const successPreviews = previews.filter(p => p.status !== 'failed' && p.base64);
    const failedPreviews = previews.filter(p => p.status === 'failed' || !p.base64);
    
    if (successPreviews.length === 0) {
        const latestFailed = failedPreviews[0];
        return { 
            preview: latestFailed, 
            historyCount: 0, 
            hasData: false,
            isFailed: true,
            failedInfo: {
                tags: latestFailed?.tags || '',
                positive: latestFailed?.positive || '',
                errorType: latestFailed?.errorType,
                errorMessage: latestFailed?.errorMessage
            }
        };
    }
    
    const selectedImgId = await getSlotSelection(slotId);
    if (selectedImgId) {
        const selected = successPreviews.find(p => p.imgId === selectedImgId);
        if (selected) {
            return { preview: selected, historyCount: successPreviews.length, hasData: true, isFailed: false };
        }
    }
    
    return { preview: successPreviews[0], historyCount: successPreviews.length, hasData: true, isFailed: false };
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
            const tx = database.transaction(DB_STORE, 'readwrite');
            tx.objectStore(DB_STORE).delete(imgId);
            tx.oncomplete = () => { if (slotId) invalidateCache(slotId); resolve(); };
            tx.onerror = () => reject(tx.error);
        } catch (e) {
            reject(e);
        }
    });
}

export async function deleteFailedRecordsForSlot(slotId) {
    const previews = await getPreviewsBySlot(slotId);
    const failedRecords = previews.filter(p => p.status === 'failed' || !p.base64);
    for (const record of failedRecords) {
        await deletePreview(record.imgId);
    }
}

export async function updatePreviewSavedUrl(imgId, savedUrl) {
    const database = await openDB();
    const preview = await getPreview(imgId);
    if (!preview) return;
    
    preview.savedUrl = savedUrl;
    
    return new Promise((resolve, reject) => {
        try {
            const tx = database.transaction(DB_STORE, 'readwrite');
            tx.objectStore(DB_STORE).put(preview);
            tx.oncomplete = () => { invalidateCache(preview.slotId); resolve(); };
            tx.onerror = () => reject(tx.error);
        } catch (e) {
            reject(e);
        }
    });
}

export async function getCacheStats() {
    const database = await openDB();
    return new Promise((resolve) => {
        try {
            const tx = database.transaction(DB_STORE, 'readonly');
            const store = tx.objectStore(DB_STORE);
            const countReq = store.count();
            let totalSize = 0, successCount = 0, failedCount = 0;
            
            store.openCursor().onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) { 
                    totalSize += (cursor.value.base64?.length || 0) * 0.75;
                    if (cursor.value.status === 'failed' || !cursor.value.base64) {
                        failedCount++;
                    } else {
                        successCount++;
                    }
                    cursor.continue(); 
                }
            };
            tx.oncomplete = () => resolve({ 
                count: countReq.result || 0, 
                successCount,
                failedCount,
                sizeBytes: Math.round(totalSize), 
                sizeMB: (totalSize / 1024 / 1024).toFixed(2) 
            });
        } catch {
            resolve({ count: 0, successCount: 0, failedCount: 0, sizeBytes: 0, sizeMB: '0' });
        }
    });
}

export async function clearExpiredCache(cacheDays = 3) {
    const cutoff = Date.now() - cacheDays * 24 * 60 * 60 * 1000;
    const database = await openDB();
    let deleted = 0;
    
    return new Promise((resolve) => {
        try {
            const tx = database.transaction(DB_STORE, 'readwrite');
            const store = tx.objectStore(DB_STORE);
            store.openCursor().onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) { 
                    const record = cursor.value;
                    const isExpiredUnsaved = record.timestamp < cutoff && !record.savedUrl;
                    const isFailed = record.status === 'failed' || !record.base64;
                    if (isExpiredUnsaved || (isFailed && record.timestamp < cutoff)) { 
                        cursor.delete(); 
                        deleted++; 
                    } 
                    cursor.continue(); 
                }
            };
            tx.oncomplete = () => { invalidateCache(); resolve(deleted); };
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
            tx.oncomplete = () => { invalidateCache(); resolve(); };
            tx.onerror = () => reject(tx.error);
        } catch (e) {
            reject(e);
        }
    });
}

export async function getGallerySummary() {
    const database = await openDB();
    return new Promise((resolve) => {
        try {
            const tx = database.transaction(DB_STORE, 'readonly');
            const request = tx.objectStore(DB_STORE).getAll();
            
            request.onsuccess = () => {
                const results = request.result || [];
                const summary = {};
                
                for (const item of results) {
                    if (item.status === 'failed' || !item.base64) continue;
                    
                    const charName = item.characterName || 'Unknown';
                    if (!summary[charName]) {
                        summary[charName] = { count: 0, totalSize: 0, slots: {}, latestTimestamp: 0 };
                    }
                    
                    const slotId = item.slotId || item.imgId;
                    if (!summary[charName].slots[slotId]) {
                        summary[charName].slots[slotId] = { count: 0, hasSaved: false, latestTimestamp: 0, latestImgId: null };
                    }
                    
                    const slot = summary[charName].slots[slotId];
                    slot.count++;
                    if (item.savedUrl) slot.hasSaved = true;
                    if (item.timestamp > slot.latestTimestamp) {
                        slot.latestTimestamp = item.timestamp;
                        slot.latestImgId = item.imgId;
                    }
                    
                    summary[charName].count++;
                    summary[charName].totalSize += (item.base64?.length || 0) * 0.75;
                    if (item.timestamp > summary[charName].latestTimestamp) {
                        summary[charName].latestTimestamp = item.timestamp;
                    }
                }
                
                resolve(summary);
            };
            request.onerror = () => resolve({});
        } catch {
            resolve({});
        }
    });
}

export async function getCharacterPreviews(charName) {
    const database = await openDB();
    return new Promise((resolve) => {
        try {
            const tx = database.transaction(DB_STORE, 'readonly');
            const request = tx.objectStore(DB_STORE).getAll();
            
            request.onsuccess = () => {
                const results = request.result || [];
                const slots = {};
                
                for (const item of results) {
                    if ((item.characterName || 'Unknown') !== charName) continue;
                    if (item.status === 'failed' || !item.base64) continue;
                    
                    const slotId = item.slotId || item.imgId;
                    if (!slots[slotId]) slots[slotId] = [];
                    slots[slotId].push(item);
                }
                
                for (const sid in slots) {
                    slots[sid].sort((a, b) => b.timestamp - a.timestamp);
                }
                
                resolve(slots);
            };
            request.onerror = () => resolve({});
        } catch {
            resolve({});
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 小画廊 UI
// ═══════════════════════════════════════════════════════════════════════════

function ensureGalleryStyles() {
    if (document.getElementById('nd-gallery-styles')) return;
    const style = document.createElement('style');
    style.id = 'nd-gallery-styles';
    style.textContent = `#nd-gallery-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100000;display:none;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px)}#nd-gallery-overlay.visible{display:flex;flex-direction:column;align-items:center;justify-content:center}.nd-gallery-close{position:absolute;top:16px;right:16px;width:40px;height:40px;border:none;background:rgba(255,255,255,0.1);border-radius:50%;color:#fff;font-size:20px;cursor:pointer;z-index:10}.nd-gallery-close:hover{background:rgba(255,255,255,0.2)}.nd-gallery-main{display:flex;align-items:center;gap:16px;max-width:90vw;max-height:70vh}.nd-gallery-nav{width:48px;height:48px;border:none;background:rgba(255,255,255,0.1);border-radius:50%;color:#fff;font-size:24px;cursor:pointer;flex-shrink:0}.nd-gallery-nav:hover{background:rgba(255,255,255,0.2)}.nd-gallery-nav:disabled{opacity:0.3;cursor:not-allowed}.nd-gallery-img-wrap{position:relative;max-width:calc(90vw - 140px);max-height:70vh}.nd-gallery-img{max-width:100%;max-height:70vh;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5)}.nd-gallery-saved-badge{position:absolute;top:12px;left:12px;background:rgba(62,207,142,0.9);padding:4px 10px;border-radius:6px;font-size:11px;color:#fff;font-weight:600}.nd-gallery-thumbs{display:flex;gap:8px;margin-top:20px;padding:12px;background:rgba(0,0,0,0.3);border-radius:12px;max-width:90vw;overflow-x:auto}.nd-gallery-thumb{width:64px;height:64px;border-radius:8px;object-fit:cover;cursor:pointer;border:2px solid transparent;opacity:0.6;transition:all 0.15s;flex-shrink:0}.nd-gallery-thumb:hover{opacity:0.9}.nd-gallery-thumb.active{border-color:#d4a574;opacity:1}.nd-gallery-thumb.saved{border-color:rgba(62,207,142,0.8)}.nd-gallery-actions{display:flex;gap:12px;margin-top:16px}.nd-gallery-btn{padding:10px 20px;border:1px solid rgba(255,255,255,0.2);border-radius:8px;background:rgba(255,255,255,0.1);color:#fff;font-size:13px;cursor:pointer;transition:all 0.15s}.nd-gallery-btn:hover{background:rgba(255,255,255,0.2)}.nd-gallery-btn.primary{background:rgba(212,165,116,0.3);border-color:rgba(212,165,116,0.5)}.nd-gallery-btn.danger{color:#f87171;border-color:rgba(248,113,113,0.3)}.nd-gallery-btn.danger:hover{background:rgba(248,113,113,0.15)}.nd-gallery-info{text-align:center;margin-top:12px;font-size:12px;color:rgba(255,255,255,0.6)}`;
    document.head.appendChild(style);
}

function createGalleryOverlay() {
    if (galleryOverlayCreated) return;
    galleryOverlayCreated = true;
    ensureGalleryStyles();
    
    const overlay = document.createElement('div');
    overlay.id = 'nd-gallery-overlay';
    // Template-only UI markup.
    // eslint-disable-next-line no-unsanitized/property
    overlay.innerHTML = `<button class="nd-gallery-close" id="nd-gallery-close">✕</button><div class="nd-gallery-main"><button class="nd-gallery-nav" id="nd-gallery-prev">‹</button><div class="nd-gallery-img-wrap"><img class="nd-gallery-img" id="nd-gallery-img" src="" alt=""><div class="nd-gallery-saved-badge" id="nd-gallery-saved-badge" style="display:none">已保存</div></div><button class="nd-gallery-nav" id="nd-gallery-next">›</button></div><div class="nd-gallery-thumbs" id="nd-gallery-thumbs"></div><div class="nd-gallery-actions" id="nd-gallery-actions"><button class="nd-gallery-btn primary" id="nd-gallery-use">使用此图</button><button class="nd-gallery-btn" id="nd-gallery-save">💾 保存到服务器</button><button class="nd-gallery-btn danger" id="nd-gallery-delete">🗑️ 删除</button></div><div class="nd-gallery-info" id="nd-gallery-info"></div>`;
    document.body.appendChild(overlay);
    
    document.getElementById('nd-gallery-close').addEventListener('click', closeGallery);
    document.getElementById('nd-gallery-prev').addEventListener('click', () => navigateGallery(-1));
    document.getElementById('nd-gallery-next').addEventListener('click', () => navigateGallery(1));
    document.getElementById('nd-gallery-use').addEventListener('click', useCurrentGalleryImage);
    document.getElementById('nd-gallery-save').addEventListener('click', saveCurrentGalleryImage);
    document.getElementById('nd-gallery-delete').addEventListener('click', deleteCurrentGalleryImage);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeGallery(); });
}

export async function openGallery(slotId, messageId, callbacks = {}) {
    createGalleryOverlay();
    
    const previews = await getPreviewsBySlot(slotId);
    const validPreviews = previews.filter(p => p.status !== 'failed' && p.base64);
    
    if (!validPreviews.length) {
        showToast('没有找到图片历史', 'error');
        return;
    }
    
    const selectedImgId = await getSlotSelection(slotId);
    let startIndex = 0;
    if (selectedImgId) {
        const idx = validPreviews.findIndex(p => p.imgId === selectedImgId);
        if (idx >= 0) startIndex = idx;
    }
    
    currentGalleryData = { slotId, messageId, previews: validPreviews, currentIndex: startIndex, callbacks };
    renderGallery();
    document.getElementById('nd-gallery-overlay').classList.add('visible');
}

export function closeGallery() {
    const el = document.getElementById('nd-gallery-overlay');
    if (el) el.classList.remove('visible');
    currentGalleryData = null;
}

function renderGallery() {
    if (!currentGalleryData) return;
    
    const { previews, currentIndex } = currentGalleryData;
    const current = previews[currentIndex];
    if (!current) return;
    
    document.getElementById('nd-gallery-img').src = current.savedUrl || `data:image/png;base64,${current.base64}`;
    document.getElementById('nd-gallery-saved-badge').style.display = current.savedUrl ? 'block' : 'none';
    
    const reversedPreviews = previews.slice().reverse();
    const thumbsContainer = document.getElementById('nd-gallery-thumbs');
    
    // Generated from local preview data only.
    // eslint-disable-next-line no-unsanitized/property
    thumbsContainer.innerHTML = reversedPreviews.map((p, i) => {
        const src = p.savedUrl || `data:image/png;base64,${p.base64}`;
        const originalIndex = previews.length - 1 - i;
        const classes = ['nd-gallery-thumb'];
        if (originalIndex === currentIndex) classes.push('active');
        if (p.savedUrl) classes.push('saved');
        return `<img class="${classes.join(' ')}" src="${src}" data-index="${originalIndex}" alt="" loading="lazy">`;
    }).join('');
    
    thumbsContainer.querySelectorAll('.nd-gallery-thumb').forEach(thumb => {
        thumb.addEventListener('click', () => {
            currentGalleryData.currentIndex = parseInt(thumb.dataset.index);
            renderGallery();
        });
    });
    
    document.getElementById('nd-gallery-prev').disabled = currentIndex >= previews.length - 1;
    document.getElementById('nd-gallery-next').disabled = currentIndex <= 0;
    
    const saveBtn = document.getElementById('nd-gallery-save');
    if (current.savedUrl) {
        saveBtn.textContent = '✓ 已保存';
        saveBtn.disabled = true;
    } else {
        saveBtn.textContent = '💾 保存到服务器';
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
    const selected = previews[currentIndex];
    if (!selected) return;
    
    await setSlotSelection(slotId, selected.imgId);
    if (callbacks.onUse) callbacks.onUse(slotId, messageId, selected, previews.length);
    closeGallery();
    showToast('已切换显示图片');
}

async function saveCurrentGalleryImage() {
    if (!currentGalleryData) return;
    
    const { slotId, previews, currentIndex, callbacks } = currentGalleryData;
    const current = previews[currentIndex];
    if (!current || current.savedUrl) return;
    
    try {
        const charName = current.characterName || getChatCharacterName();
        const url = await saveBase64AsFile(current.base64, charName, `novel_${current.imgId}`, 'png');
        await updatePreviewSavedUrl(current.imgId, url);
        current.savedUrl = url;
        await setSlotSelection(slotId, current.imgId);
        showToast(`已保存: ${url}`, 'success', 4000);
        renderGallery();
        if (callbacks.onSave) callbacks.onSave(current.imgId, url);
    } catch (e) {
        console.error('[GalleryCache] save failed:', e);
        showToast(`保存失败: ${e.message}`, 'error');
    }
}

async function deleteCurrentGalleryImage() {
    if (!currentGalleryData) return;
    
    const { slotId, messageId, previews, currentIndex, callbacks } = currentGalleryData;
    const current = previews[currentIndex];
    if (!current) return;
    
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
            closeGallery();
            if (callbacks.onBecameEmpty) {
                callbacks.onBecameEmpty(slotId, messageId, { tags: current.tags || '', positive: current.positive || '' });
            }
            showToast('图片已删除，可点击重试重新生成');
        } else {
            if (currentGalleryData.currentIndex >= previews.length) {
                currentGalleryData.currentIndex = previews.length - 1;
            }
            renderGallery();
            if (callbacks.onDelete) callbacks.onDelete(slotId, current.imgId, previews);
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
    
    document.getElementById('nd-gallery-overlay')?.remove();
    document.getElementById('nd-gallery-styles')?.remove();
    galleryOverlayCreated = false;
    
    if (db) {
        try { db.close(); } catch {}
        db = null;
    }
    dbOpening = null;
}
