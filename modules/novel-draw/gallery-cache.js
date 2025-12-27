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

// ═══════════════════════════════════════════════════════════════════════════
// 状态
// ═══════════════════════════════════════════════════════════════════════════

let db = null;
let dbOpening = null;
let galleryOverlayCreated = false;
let currentGalleryData = null;

// ═══════════════════════════════════════════════════════════════════════════
// 日志
// ═══════════════════════════════════════════════════════════════════════════

function log(...args) {
    console.log('[GalleryCache]', ...args);
}

function logDbState(label) {
    log(label, {
        dbExists: !!db,
        dbOpening: !!dbOpening,
        dbName: db?.name,
        dbVersion: db?.version,
        stores: db ? [...db.objectStoreNames] : null
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getChatCharacterName() {
    const ctx = getContext();
    if (ctx.groupId) return String(ctx.groups?.[ctx.groupId]?.id ?? 'group');
    return String(ctx.characters?.[ctx.characterId]?.name || 'character');
}

function showToast(message, type = 'success', duration = 2500) {
    const colors = { success: 'rgba(62,207,142,0.95)', error: 'rgba(248,113,113,0.95)', info: 'rgba(212,165,116,0.95)' };
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:' + (colors[type] || colors.info) + ';color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;z-index:99999;animation:fadeInOut ' + (duration/1000) + 's ease-in-out;max-width:80vw;text-align:center;word-break:break-all';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, duration);
}

// ═══════════════════════════════════════════════════════════════════════════
// IndexedDB 操作
// ═══════════════════════════════════════════════════════════════════════════

function isDbValid() {
    if (!db) {
        log('isDbValid: db is null');
        return false;
    }
    try {
        const valid = db.objectStoreNames.length > 0;
        log('isDbValid:', valid);
        return valid;
    } catch (e) {
        log('isDbValid: error', e.message);
        return false;
    }
}

export async function openDB() {
    logDbState('openDB called');
    
    if (dbOpening) {
        log('openDB: waiting for existing open...');
        return dbOpening;
    }
    
    if (isDbValid()) {
        if (db.objectStoreNames.contains(DB_SELECTIONS_STORE)) {
            log('openDB: reusing existing connection');
            return db;
        }
        log('openDB: missing store, closing...');
        try {
            db.close();
        } catch (e) {
            log('openDB: close error', e.message);
        }
        db = null;
    }
    
    log('openDB: creating new connection...');
    
    dbOpening = new Promise(function(resolve, reject) {
        var request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = function() {
            log('openDB: onerror', request.error);
            dbOpening = null;
            reject(request.error);
        };
        
        request.onsuccess = function() {
            db = request.result;
            log('openDB: success, version:', db.version);
            
            db.onclose = function() {
                log('openDB: onclose event!');
                db = null;
            };
            
            db.onerror = function(e) {
                log('openDB: db onerror', e);
            };
            
            db.onversionchange = function() {
                log('openDB: onversionchange, closing...');
                db.close();
                db = null;
            };
            
            dbOpening = null;
            resolve(db);
        };
        
        request.onupgradeneeded = function(e) {
            log('openDB: upgrade', e.oldVersion, '->', e.newVersion);
            var database = e.target.result;
            
            if (!database.objectStoreNames.contains(DB_STORE)) {
                log('openDB: creating', DB_STORE);
                var store = database.createObjectStore(DB_STORE, { keyPath: 'imgId' });
                ['messageId', 'chatId', 'timestamp', 'slotId'].forEach(function(idx) {
                    store.createIndex(idx, idx);
                });
            }
            
            if (!database.objectStoreNames.contains(DB_SELECTIONS_STORE)) {
                log('openDB: creating', DB_SELECTIONS_STORE);
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
    log('setSlotSelection:', slotId, imgId);
    var database = await openDB();
    logDbState('setSlotSelection got db');
    if (!database.objectStoreNames.contains(DB_SELECTIONS_STORE)) {
        log('setSlotSelection: no store');
        return;
    }
    return new Promise(function(resolve, reject) {
        try {
            var tx = database.transaction(DB_SELECTIONS_STORE, 'readwrite');
            tx.objectStore(DB_SELECTIONS_STORE).put({ slotId: slotId, selectedImgId: imgId, timestamp: Date.now() });
            tx.oncomplete = function() { log('setSlotSelection: done'); resolve(); };
            tx.onerror = function() { log('setSlotSelection: error', tx.error); reject(tx.error); };
        } catch (e) {
            log('setSlotSelection: tx error', e.message);
            reject(e);
        }
    });
}

export async function getSlotSelection(slotId) {
    log('getSlotSelection:', slotId);
    var database = await openDB();
    if (!database.objectStoreNames.contains(DB_SELECTIONS_STORE)) return null;
    return new Promise(function(resolve, reject) {
        try {
            var tx = database.transaction(DB_SELECTIONS_STORE, 'readonly');
            var request = tx.objectStore(DB_SELECTIONS_STORE).get(slotId);
            request.onsuccess = function() { resolve(request.result?.selectedImgId || null); };
            request.onerror = function() { reject(request.error); };
        } catch (e) {
            log('getSlotSelection: tx error', e.message);
            reject(e);
        }
    });
}

export async function clearSlotSelection(slotId) {
    log('clearSlotSelection:', slotId);
    var database = await openDB();
    if (!database.objectStoreNames.contains(DB_SELECTIONS_STORE)) return;
    return new Promise(function(resolve, reject) {
        try {
            var tx = database.transaction(DB_SELECTIONS_STORE, 'readwrite');
            tx.objectStore(DB_SELECTIONS_STORE).delete(slotId);
            tx.oncomplete = resolve;
            tx.onerror = function() { reject(tx.error); };
        } catch (e) {
            log('clearSlotSelection: tx error', e.message);
            reject(e);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 预览存储
// ═══════════════════════════════════════════════════════════════════════════

export async function storePreview(opts) {
    var imgId = opts.imgId;
    var slotId = opts.slotId;
    var messageId = opts.messageId;
    var base64 = opts.base64 || null;
    var tags = opts.tags;
    var positive = opts.positive;
    var savedUrl = opts.savedUrl || null;
    var status = opts.status || 'success';
    var errorType = opts.errorType || null;
    var errorMessage = opts.errorMessage || null;
    
    log('storePreview:', imgId);
    var database = await openDB();
    logDbState('storePreview got db');
    var ctx = getContext();
    return new Promise(function(resolve, reject) {
        try {
            var tx = database.transaction(DB_STORE, 'readwrite');
            tx.objectStore(DB_STORE).put({
                imgId: imgId,
                slotId: slotId || imgId,
                messageId: messageId,
                chatId: ctx.chatId || (ctx.characterId || 'unknown'),
                characterName: getChatCharacterName(),
                base64: base64,
                tags: tags,
                positive: positive,
                savedUrl: savedUrl,
                status: status,
                errorType: errorType,
                errorMessage: errorMessage,
                timestamp: Date.now()
            });
            tx.oncomplete = function() { log('storePreview: done'); resolve(); };
            tx.onerror = function() { log('storePreview: error', tx.error); reject(tx.error); };
        } catch (e) {
            log('storePreview: tx error', e.message);
            reject(e);
        }
    });
}

export async function storeFailedPlaceholder(opts) {
    var imgId = 'failed-' + opts.slotId + '-' + Date.now();
    return storePreview({
        imgId: imgId,
        slotId: opts.slotId,
        messageId: opts.messageId,
        base64: null,
        tags: opts.tags,
        positive: opts.positive,
        status: 'failed',
        errorType: opts.errorType,
        errorMessage: opts.errorMessage
    });
}

export async function getPreview(imgId) {
    log('getPreview:', imgId);
    var database = await openDB();
    logDbState('getPreview got db');
    return new Promise(function(resolve, reject) {
        try {
            var tx = database.transaction(DB_STORE, 'readonly');
            var request = tx.objectStore(DB_STORE).get(imgId);
            request.onsuccess = function() {
                log('getPreview: found:', !!request.result);
                resolve(request.result);
            };
            request.onerror = function() {
                log('getPreview: error', request.error);
                reject(request.error);
            };
        } catch (e) {
            log('getPreview: tx error', e.message);
            reject(e);
        }
    });
}

export async function getPreviewsBySlot(slotId) {
    log('getPreviewsBySlot:', slotId);
    var database = await openDB();
    return new Promise(function(resolve, reject) {
        try {
            var tx = database.transaction(DB_STORE, 'readonly');
            var store = tx.objectStore(DB_STORE);
            
            if (store.indexNames.contains('slotId')) {
                var index = store.index('slotId');
                var request = index.getAll(slotId);
                request.onsuccess = function() {
                    var results = request.result || [];
                    if (results.length === 0) {
                        var allRequest = store.getAll();
                        allRequest.onsuccess = function() {
                            var allRecords = allRequest.result || [];
                            results = allRecords.filter(function(r) {
                                return r.slotId === slotId || r.imgId === slotId || (!r.slotId && r.imgId === slotId);
                            });
                            results.sort(function(a, b) { return b.timestamp - a.timestamp; });
                            resolve(results);
                        };
                        allRequest.onerror = function() { reject(allRequest.error); };
                    } else {
                        results.sort(function(a, b) { return b.timestamp - a.timestamp; });
                        resolve(results);
                    }
                };
                request.onerror = function() { reject(request.error); };
            } else {
                var request2 = store.getAll();
                request2.onsuccess = function() {
                    var allRecords = request2.result || [];
                    var results = allRecords.filter(function(r) { return r.slotId === slotId || r.imgId === slotId; });
                    results.sort(function(a, b) { return b.timestamp - a.timestamp; });
                    resolve(results);
                };
                request2.onerror = function() { reject(request2.error); };
            }
        } catch (e) {
            log('getPreviewsBySlot: tx error', e.message);
            reject(e);
        }
    });
}

export async function getDisplayPreviewForSlot(slotId) {
    var previews = await getPreviewsBySlot(slotId);
    if (!previews.length) return { preview: null, historyCount: 0, hasData: false, isFailed: false };
    
    var successPreviews = previews.filter(function(p) { return p.status !== 'failed' && p.base64; });
    var failedPreviews = previews.filter(function(p) { return p.status === 'failed' || !p.base64; });
    
    if (successPreviews.length === 0) {
        var latestFailed = failedPreviews[0];
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
    
    var selectedImgId = await getSlotSelection(slotId);
    if (selectedImgId) {
        var selected = successPreviews.find(function(p) { return p.imgId === selectedImgId; });
        if (selected) {
            return { preview: selected, historyCount: successPreviews.length, hasData: true, isFailed: false };
        }
    }
    
    return { preview: successPreviews[0], historyCount: successPreviews.length, hasData: true, isFailed: false };
}

export async function getLatestPreviewForSlot(slotId) {
    var result = await getDisplayPreviewForSlot(slotId);
    return result.preview;
}

export async function deletePreview(imgId) {
    log('deletePreview:', imgId);
    var database = await openDB();
    return new Promise(function(resolve, reject) {
        try {
            var tx = database.transaction(DB_STORE, 'readwrite');
            tx.objectStore(DB_STORE).delete(imgId);
            tx.oncomplete = function() { log('deletePreview: done'); resolve(); };
            tx.onerror = function() { reject(tx.error); };
        } catch (e) {
            log('deletePreview: tx error', e.message);
            reject(e);
        }
    });
}

export async function deleteFailedRecordsForSlot(slotId) {
    var previews = await getPreviewsBySlot(slotId);
    var failedRecords = previews.filter(function(p) { return p.status === 'failed' || !p.base64; });
    for (var i = 0; i < failedRecords.length; i++) {
        await deletePreview(failedRecords[i].imgId);
    }
}

export async function updatePreviewSavedUrl(imgId, savedUrl) {
    log('updatePreviewSavedUrl:', imgId, savedUrl);
    var database = await openDB();
    logDbState('updatePreviewSavedUrl got db');
    
    var preview = await getPreview(imgId);
    if (!preview) {
        log('updatePreviewSavedUrl: not found');
        return;
    }
    
    preview.savedUrl = savedUrl;
    
    log('updatePreviewSavedUrl: re-getting db for write...');
    database = await openDB();
    logDbState('updatePreviewSavedUrl got db again');
    
    return new Promise(function(resolve, reject) {
        try {
            var tx = database.transaction(DB_STORE, 'readwrite');
            tx.objectStore(DB_STORE).put(preview);
            tx.oncomplete = function() { log('updatePreviewSavedUrl: done'); resolve(); };
            tx.onerror = function() { log('updatePreviewSavedUrl: error', tx.error); reject(tx.error); };
        } catch (e) {
            log('updatePreviewSavedUrl: tx error', e.message);
            reject(e);
        }
    });
}

export async function getCacheStats() {
    log('getCacheStats');
    var database = await openDB();
    return new Promise(function(resolve) {
        try {
            var tx = database.transaction(DB_STORE, 'readonly');
            var store = tx.objectStore(DB_STORE);
            var countReq = store.count();
            var totalSize = 0;
            var successCount = 0;
            var failedCount = 0;
            
            store.openCursor().onsuccess = function(e) {
                var cursor = e.target.result;
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
            tx.oncomplete = function() {
                resolve({ 
                    count: countReq.result || 0, 
                    successCount: successCount,
                    failedCount: failedCount,
                    sizeBytes: Math.round(totalSize), 
                    sizeMB: (totalSize / 1024 / 1024).toFixed(2) 
                });
            };
        } catch (e) {
            log('getCacheStats: error', e.message);
            resolve({ count: 0, successCount: 0, failedCount: 0, sizeBytes: 0, sizeMB: '0' });
        }
    });
}

export async function clearExpiredCache(cacheDays) {
    cacheDays = cacheDays || 3;
    log('clearExpiredCache:', cacheDays, 'days');
    var cutoff = Date.now() - cacheDays * 24 * 60 * 60 * 1000;
    var database = await openDB();
    var deleted = 0;
    return new Promise(function(resolve) {
        try {
            var tx = database.transaction(DB_STORE, 'readwrite');
            var store = tx.objectStore(DB_STORE);
            store.openCursor().onsuccess = function(e) {
                var cursor = e.target.result;
                if (cursor) { 
                    var record = cursor.value;
                    var isExpiredUnsaved = record.timestamp < cutoff && !record.savedUrl;
                    var isFailed = record.status === 'failed' || !record.base64;
                    if (isExpiredUnsaved || (isFailed && record.timestamp < cutoff)) { 
                        cursor.delete(); 
                        deleted++; 
                    } 
                    cursor.continue(); 
                }
            };
            tx.oncomplete = function() {
                log('clearExpiredCache: deleted', deleted);
                resolve(deleted);
            };
        } catch (e) {
            log('clearExpiredCache: error', e.message);
            resolve(0);
        }
    });
}

export async function clearAllCache() {
    log('clearAllCache');
    var database = await openDB();
    return new Promise(function(resolve, reject) {
        try {
            var stores = [DB_STORE];
            if (database.objectStoreNames.contains(DB_SELECTIONS_STORE)) {
                stores.push(DB_SELECTIONS_STORE);
            }
            var tx = database.transaction(stores, 'readwrite');
            tx.objectStore(DB_STORE).clear();
            if (stores.length > 1) {
                tx.objectStore(DB_SELECTIONS_STORE).clear();
            }
            tx.oncomplete = function() { log('clearAllCache: done'); resolve(); };
            tx.onerror = function() { reject(tx.error); };
        } catch (e) {
            log('clearAllCache: error', e.message);
            reject(e);
        }
    });
}

export async function getGallerySummary() {
    log('getGallerySummary');
    var database = await openDB();
    return new Promise(function(resolve) {
        try {
            var tx = database.transaction(DB_STORE, 'readonly');
            var store = tx.objectStore(DB_STORE);
            var request = store.getAll();
            
            request.onsuccess = function() {
                var results = request.result || [];
                var summary = {};
                
                for (var i = 0; i < results.length; i++) {
                    var item = results[i];
                    if (item.status === 'failed' || !item.base64) continue;
                    
                    var charName = item.characterName || 'Unknown';
                    if (!summary[charName]) {
                        summary[charName] = { count: 0, totalSize: 0, slots: {}, latestTimestamp: 0 };
                    }
                    
                    var slotId = item.slotId || item.imgId;
                    if (!summary[charName].slots[slotId]) {
                        summary[charName].slots[slotId] = {
                            count: 0, hasSaved: false, latestTimestamp: 0, latestImgId: null,
                        };
                    }
                    
                    var slot = summary[charName].slots[slotId];
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
            request.onerror = function() { resolve({}); };
        } catch (e) {
            log('getGallerySummary: error', e.message);
            resolve({});
        }
    });
}

export async function getCharacterPreviews(charName) {
    log('getCharacterPreviews:', charName);
    var database = await openDB();
    return new Promise(function(resolve) {
        try {
            var tx = database.transaction(DB_STORE, 'readonly');
            var store = tx.objectStore(DB_STORE);
            var request = store.getAll();
            
            request.onsuccess = function() {
                var results = request.result || [];
                var slots = {};
                
                for (var i = 0; i < results.length; i++) {
                    var item = results[i];
                    if ((item.characterName || 'Unknown') !== charName) continue;
                    if (item.status === 'failed' || !item.base64) continue;
                    
                    var slotId = item.slotId || item.imgId;
                    if (!slots[slotId]) slots[slotId] = [];
                    slots[slotId].push(item);
                }
                
                for (var sid in slots) {
                    slots[sid].sort(function(a, b) { return b.timestamp - a.timestamp; });
                }
                
                resolve(slots);
            };
            request.onerror = function() { resolve({}); };
        } catch (e) {
            log('getCharacterPreviews: error', e.message);
            resolve({});
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// 小画廊 UI
// ═══════════════════════════════════════════════════════════════════════════

function ensureGalleryStyles() {
    if (document.getElementById('nd-gallery-styles')) return;
    var style = document.createElement('style');
    style.id = 'nd-gallery-styles';
    style.textContent = '#nd-gallery-overlay{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100000;display:none;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px)}#nd-gallery-overlay.visible{display:flex;flex-direction:column;align-items:center;justify-content:center}.nd-gallery-close{position:absolute;top:16px;right:16px;width:40px;height:40px;border:none;background:rgba(255,255,255,0.1);border-radius:50%;color:#fff;font-size:20px;cursor:pointer;z-index:10}.nd-gallery-close:hover{background:rgba(255,255,255,0.2)}.nd-gallery-main{display:flex;align-items:center;gap:16px;max-width:90vw;max-height:70vh}.nd-gallery-nav{width:48px;height:48px;border:none;background:rgba(255,255,255,0.1);border-radius:50%;color:#fff;font-size:24px;cursor:pointer;flex-shrink:0}.nd-gallery-nav:hover{background:rgba(255,255,255,0.2)}.nd-gallery-nav:disabled{opacity:0.3;cursor:not-allowed}.nd-gallery-img-wrap{position:relative;max-width:calc(90vw - 140px);max-height:70vh}.nd-gallery-img{max-width:100%;max-height:70vh;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5)}.nd-gallery-saved-badge{position:absolute;top:12px;left:12px;background:rgba(62,207,142,0.9);padding:4px 10px;border-radius:6px;font-size:11px;color:#fff;font-weight:600}.nd-gallery-thumbs{display:flex;gap:8px;margin-top:20px;padding:12px;background:rgba(0,0,0,0.3);border-radius:12px;max-width:90vw;overflow-x:auto}.nd-gallery-thumb{width:64px;height:64px;border-radius:8px;object-fit:cover;cursor:pointer;border:2px solid transparent;opacity:0.6;transition:all 0.15s;flex-shrink:0}.nd-gallery-thumb:hover{opacity:0.9}.nd-gallery-thumb.active{border-color:#d4a574;opacity:1}.nd-gallery-thumb.saved{border-color:rgba(62,207,142,0.8)}.nd-gallery-actions{display:flex;gap:12px;margin-top:16px}.nd-gallery-btn{padding:10px 20px;border:1px solid rgba(255,255,255,0.2);border-radius:8px;background:rgba(255,255,255,0.1);color:#fff;font-size:13px;cursor:pointer;transition:all 0.15s}.nd-gallery-btn:hover{background:rgba(255,255,255,0.2)}.nd-gallery-btn.primary{background:rgba(212,165,116,0.3);border-color:rgba(212,165,116,0.5)}.nd-gallery-btn.danger{color:#f87171;border-color:rgba(248,113,113,0.3)}.nd-gallery-btn.danger:hover{background:rgba(248,113,113,0.15)}.nd-gallery-info{text-align:center;margin-top:12px;font-size:12px;color:rgba(255,255,255,0.6)}';
    document.head.appendChild(style);
}

function createGalleryOverlay() {
    if (galleryOverlayCreated) return;
    galleryOverlayCreated = true;
    ensureGalleryStyles();
    
    var overlay = document.createElement('div');
    overlay.id = 'nd-gallery-overlay';
    overlay.innerHTML = '<button class="nd-gallery-close" id="nd-gallery-close">\u2715</button><div class="nd-gallery-main"><button class="nd-gallery-nav" id="nd-gallery-prev">\u2039</button><div class="nd-gallery-img-wrap"><img class="nd-gallery-img" id="nd-gallery-img" src="" alt=""><div class="nd-gallery-saved-badge" id="nd-gallery-saved-badge" style="display:none">\u5DF2\u4FDD\u5B58</div></div><button class="nd-gallery-nav" id="nd-gallery-next">\u203A</button></div><div class="nd-gallery-thumbs" id="nd-gallery-thumbs"></div><div class="nd-gallery-actions" id="nd-gallery-actions"><button class="nd-gallery-btn primary" id="nd-gallery-use">\u4F7F\u7528\u6B64\u56FE</button><button class="nd-gallery-btn" id="nd-gallery-save">\uD83D\uDCBE \u4FDD\u5B58\u5230\u670D\u52A1\u5668</button><button class="nd-gallery-btn danger" id="nd-gallery-delete">\uD83D\uDDD1\uFE0F \u5220\u9664</button></div><div class="nd-gallery-info" id="nd-gallery-info"></div>';
    document.body.appendChild(overlay);
    
    document.getElementById('nd-gallery-close').addEventListener('click', closeGallery);
    document.getElementById('nd-gallery-prev').addEventListener('click', function() { navigateGallery(-1); });
    document.getElementById('nd-gallery-next').addEventListener('click', function() { navigateGallery(1); });
    document.getElementById('nd-gallery-use').addEventListener('click', useCurrentGalleryImage);
    document.getElementById('nd-gallery-save').addEventListener('click', saveCurrentGalleryImage);
    document.getElementById('nd-gallery-delete').addEventListener('click', deleteCurrentGalleryImage);
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeGallery();
    });
}

export async function openGallery(slotId, messageId, callbacks) {
    callbacks = callbacks || {};
    log('openGallery:', slotId, messageId);
    createGalleryOverlay();
    
    var previews = await getPreviewsBySlot(slotId);
    var validPreviews = previews.filter(function(p) { return p.status !== 'failed' && p.base64; });
    
    if (!validPreviews.length) {
        showToast('\u6CA1\u6709\u627E\u5230\u56FE\u7247\u5386\u53F2', 'error');
        return;
    }
    
    var selectedImgId = await getSlotSelection(slotId);
    var startIndex = 0;
    if (selectedImgId) {
        var idx = validPreviews.findIndex(function(p) { return p.imgId === selectedImgId; });
        if (idx >= 0) startIndex = idx;
    }
    
    currentGalleryData = { slotId: slotId, messageId: messageId, previews: validPreviews, currentIndex: startIndex, callbacks: callbacks };
    renderGallery();
    document.getElementById('nd-gallery-overlay').classList.add('visible');
}

export function closeGallery() {
    log('closeGallery');
    var el = document.getElementById('nd-gallery-overlay');
    if (el) el.classList.remove('visible');
    currentGalleryData = null;
}

function renderGallery() {
    if (!currentGalleryData) return;
    
    var previews = currentGalleryData.previews;
    var currentIndex = currentGalleryData.currentIndex;
    var current = previews[currentIndex];
    if (!current) return;
    
    var img = document.getElementById('nd-gallery-img');
    img.src = current.savedUrl || ('data:image/png;base64,' + current.base64);
    
    document.getElementById('nd-gallery-saved-badge').style.display = current.savedUrl ? 'block' : 'none';
    
    var reversedPreviews = previews.slice().reverse();
    var thumbsContainer = document.getElementById('nd-gallery-thumbs');
    
    thumbsContainer.innerHTML = reversedPreviews.map(function(p, i) {
        var src = p.savedUrl || ('data:image/png;base64,' + p.base64);
        var originalIndex = previews.length - 1 - i;
        var classes = ['nd-gallery-thumb'];
        if (originalIndex === currentIndex) classes.push('active');
        if (p.savedUrl) classes.push('saved');
        return '<img class="' + classes.join(' ') + '" src="' + src + '" data-index="' + originalIndex + '" alt="" loading="lazy">';
    }).join('');
    
    thumbsContainer.querySelectorAll('.nd-gallery-thumb').forEach(function(thumb) {
        thumb.addEventListener('click', function() {
            currentGalleryData.currentIndex = parseInt(thumb.dataset.index);
            renderGallery();
        });
    });
    
    document.getElementById('nd-gallery-prev').disabled = currentIndex >= previews.length - 1;
    document.getElementById('nd-gallery-next').disabled = currentIndex <= 0;
    
    var saveBtn = document.getElementById('nd-gallery-save');
    if (current.savedUrl) {
        saveBtn.textContent = '\u2713 \u5DF2\u4FDD\u5B58';
        saveBtn.disabled = true;
    } else {
        saveBtn.textContent = '\uD83D\uDCBE \u4FDD\u5B58\u5230\u670D\u52A1\u5668';
        saveBtn.disabled = false;
    }
    
    var displayVersion = previews.length - currentIndex;
    var date = new Date(current.timestamp).toLocaleString();
    document.getElementById('nd-gallery-info').textContent = '\u7248\u672C ' + displayVersion + ' / ' + previews.length + ' \u00B7 ' + date;
}

function navigateGallery(delta) {
    if (!currentGalleryData) return;
    var newIndex = currentGalleryData.currentIndex - delta;
    if (newIndex >= 0 && newIndex < currentGalleryData.previews.length) {
        currentGalleryData.currentIndex = newIndex;
        renderGallery();
    }
}

async function useCurrentGalleryImage() {
    if (!currentGalleryData) return;
    log('useCurrentGalleryImage');
    
    var slotId = currentGalleryData.slotId;
    var messageId = currentGalleryData.messageId;
    var previews = currentGalleryData.previews;
    var currentIndex = currentGalleryData.currentIndex;
    var callbacks = currentGalleryData.callbacks;
    var selected = previews[currentIndex];
    if (!selected) return;
    
    await setSlotSelection(slotId, selected.imgId);
    
    if (callbacks.onUse) callbacks.onUse(slotId, messageId, selected, previews.length);
    closeGallery();
    showToast('\u5DF2\u5207\u6362\u663E\u793A\u56FE\u7247');
}

async function saveCurrentGalleryImage() {
    if (!currentGalleryData) return;
    log('saveCurrentGalleryImage');
    
    var slotId = currentGalleryData.slotId;
    var previews = currentGalleryData.previews;
    var currentIndex = currentGalleryData.currentIndex;
    var callbacks = currentGalleryData.callbacks;
    var current = previews[currentIndex];
    if (!current || current.savedUrl) return;
    
    try {
        var charName = current.characterName || getChatCharacterName();
        var url = await saveBase64AsFile(current.base64, charName, 'novel_' + current.imgId, 'png');
        await updatePreviewSavedUrl(current.imgId, url);
        current.savedUrl = url;
        
        await setSlotSelection(slotId, current.imgId);
        
        showToast('\u5DF2\u4FDD\u5B58: ' + url, 'success', 4000);
        renderGallery();
        if (callbacks.onSave) callbacks.onSave(current.imgId, url);
    } catch (e) {
        console.error('[GalleryCache] save failed:', e);
        showToast('\u4FDD\u5B58\u5931\u8D25: ' + e.message, 'error');
    }
}

async function deleteCurrentGalleryImage() {
    if (!currentGalleryData) return;
    log('deleteCurrentGalleryImage');
    
    var slotId = currentGalleryData.slotId;
    var messageId = currentGalleryData.messageId;
    var previews = currentGalleryData.previews;
    var currentIndex = currentGalleryData.currentIndex;
    var callbacks = currentGalleryData.callbacks;
    var current = previews[currentIndex];
    if (!current) return;
    
    var msg = current.savedUrl ? '\u786E\u5B9A\u5220\u9664\u8FD9\u6761\u8BB0\u5F55\u5417\uFF1F\u670D\u52A1\u5668\u4E0A\u7684\u56FE\u7247\u6587\u4EF6\u4E0D\u4F1A\u88AB\u5220\u9664\u3002' : '\u786E\u5B9A\u5220\u9664\u8FD9\u5F20\u56FE\u7247\u5417\uFF1F';
    if (!confirm(msg)) return;
    
    try {
        await deletePreview(current.imgId);
        
        var selectedId = await getSlotSelection(slotId);
        if (selectedId === current.imgId) {
            await clearSlotSelection(slotId);
        }
        
        previews.splice(currentIndex, 1);
        
        if (previews.length === 0) {
            closeGallery();

            if (callbacks.onBecameEmpty) {
                callbacks.onBecameEmpty(slotId, messageId, {
                    tags: current.tags || '',
                    positive: current.positive || ''
                });
            }
            showToast('\u56FE\u7247\u5DF2\u5220\u9664\uFF0C\u53EF\u70B9\u51FB\u91CD\u8BD5\u91CD\u65B0\u751F\u6210');
        } else {
            if (currentGalleryData.currentIndex >= previews.length) {
                currentGalleryData.currentIndex = previews.length - 1;
            }
            renderGallery();
            if (callbacks.onDelete) callbacks.onDelete(slotId, current.imgId, previews);
            showToast('\u56FE\u7247\u5DF2\u5220\u9664');
        }
    } catch (e) {
        console.error('[GalleryCache] delete failed:', e);
        showToast('\u5220\u9664\u5931\u8D25: ' + e.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 清理
// ═══════════════════════════════════════════════════════════════════════════

export function destroyGalleryCache() {
    log('destroyGalleryCache called');
    console.trace('destroyGalleryCache trace');
    closeGallery();
    var el1 = document.getElementById('nd-gallery-overlay');
    if (el1) el1.remove();
    var el2 = document.getElementById('nd-gallery-styles');
    if (el2) el2.remove();
    galleryOverlayCreated = false;
    if (db) {
        try {
            db.close();
            log('destroyGalleryCache: closed db');
        } catch (e) {
            log('destroyGalleryCache: close error', e.message);
        }
        db = null;
    }
    dbOpening = null;
}
