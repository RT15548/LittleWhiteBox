/**
 * Local TTS cache (IndexedDB)
 */

const DB_NAME = 'xb-tts-cache';
const STORE_NAME = 'audio';
const DB_VERSION = 1;

let dbPromise = null;

function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
                store.createIndex('createdAt', 'createdAt', { unique: false });
                store.createIndex('lastAccessAt', 'lastAccessAt', { unique: false });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
    return dbPromise;
}

async function withStore(mode, fn) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const result = fn(store);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
    });
}

export async function getCacheEntry(key) {
    const entry = await withStore('readonly', store => {
        return new Promise((resolve, reject) => {
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    });

    if (!entry) return null;

    const now = Date.now();
    if (entry.lastAccessAt !== now) {
        entry.lastAccessAt = now;
        await withStore('readwrite', store => store.put(entry));
    }
    return entry;
}

export async function setCacheEntry(key, blob, meta = {}) {
    const now = Date.now();
    const entry = {
        key,
        blob,
        size: blob?.size || 0,
        createdAt: now,
        lastAccessAt: now,
        meta,
    };
    await withStore('readwrite', store => store.put(entry));
    return entry;
}

export async function deleteCacheEntry(key) {
    await withStore('readwrite', store => store.delete(key));
}

export async function getCacheStats() {
    const stats = await withStore('readonly', store => {
        return new Promise((resolve, reject) => {
            let count = 0;
            let totalBytes = 0;
            const req = store.openCursor();
            req.onsuccess = () => {
                const cursor = req.result;
                if (!cursor) return resolve({ count, totalBytes });
                count += 1;
                totalBytes += cursor.value?.size || 0;
                cursor.continue();
            };
            req.onerror = () => reject(req.error);
        });
    });
    return {
        count: stats.count,
        totalBytes: stats.totalBytes,
        sizeMB: (stats.totalBytes / (1024 * 1024)).toFixed(2),
    };
}

export async function clearExpiredCache(days = 7) {
    const cutoff = Date.now() - Math.max(1, days) * 24 * 60 * 60 * 1000;
    return withStore('readwrite', store => {
        return new Promise((resolve, reject) => {
            let removed = 0;
            const req = store.openCursor();
            req.onsuccess = () => {
                const cursor = req.result;
                if (!cursor) return resolve(removed);
                const createdAt = cursor.value?.createdAt || 0;
                if (createdAt && createdAt < cutoff) {
                    cursor.delete();
                    removed += 1;
                }
                cursor.continue();
            };
            req.onerror = () => reject(req.error);
        });
    });
}

export async function clearAllCache() {
    await withStore('readwrite', store => store.clear());
}

export async function pruneCache({ maxEntries, maxBytes }) {
    const limits = {
        maxEntries: Number.isFinite(maxEntries) ? maxEntries : null,
        maxBytes: Number.isFinite(maxBytes) ? maxBytes : null,
    };
    if (!limits.maxEntries && !limits.maxBytes) return 0;

    const entries = await withStore('readonly', store => {
        return new Promise((resolve, reject) => {
            const list = [];
            const req = store.openCursor();
            req.onsuccess = () => {
                const cursor = req.result;
                if (!cursor) return resolve(list);
                const v = cursor.value || {};
                list.push({
                    key: v.key,
                    size: v.size || 0,
                    lastAccessAt: v.lastAccessAt || v.createdAt || 0,
                });
                cursor.continue();
            };
            req.onerror = () => reject(req.error);
        });
    });

    if (!entries.length) return 0;

    let totalBytes = entries.reduce((sum, e) => sum + (e.size || 0), 0);
    entries.sort((a, b) => (a.lastAccessAt || 0) - (b.lastAccessAt || 0));

    let removed = 0;
    const shouldTrim = () => (
        (limits.maxEntries && entries.length - removed > limits.maxEntries) ||
        (limits.maxBytes && totalBytes > limits.maxBytes)
    );

    for (const entry of entries) {
        if (!shouldTrim()) break;
        await deleteCacheEntry(entry.key);
        totalBytes -= entry.size || 0;
        removed += 1;
    }

    return removed;
}
