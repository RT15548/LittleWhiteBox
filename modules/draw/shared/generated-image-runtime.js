import { hashStableValue, stableSerialize } from './generation-fingerprint.js';

const DB_NAME = 'xb_draw_generated_images';
const DB_STORE = 'images';
const DB_VERSION = 1;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

const inflightRequests = new Map();
let databasePromise = null;

function createAbortError() {
    try {
        return new DOMException('图片生成已取消', 'AbortError');
    } catch {
        const error = new Error('图片生成已取消');
        error.name = 'AbortError';
        return error;
    }
}

function getDrawFacade() {
    const facade = window.xiaobaixDraw;
    if (!facade || (
        typeof facade.prepareGeneration !== 'function'
        && typeof facade.generateImage !== 'function'
    )) {
        throw new Error('画图模块未启用');
    }
    return facade;
}

function buildDescriptor(input = {}) {
    const facade = getDrawFacade();
    const payload = typeof input === 'string' ? { prompt: input } : (input || {});
    const prompt = String(payload.prompt || '').trim();
    if (!prompt) throw new Error('无效的图片标签');
    const cacheEnabled = payload.cache !== false;
    const provider = String(facade.getProvider?.() || 'disabled');
    const generationPlan = typeof facade.prepareGeneration === 'function'
        ? facade.prepareGeneration(payload)
        : null;
    const generationFingerprint = generationPlan?.fingerprint || {
            provider,
            promptData: typeof facade.buildPromptData === 'function'
                ? facade.buildPromptData(payload)
                : { prompt },
        };
    const fingerprint = stableSerialize({
        namespace: String(payload.cacheNamespace || 'shared'),
        cacheEnabled,
        generation: generationFingerprint,
    });
    return {
        cacheEnabled,
        cacheKey: hashStableValue(fingerprint, 'draw'),
        facade,
        fingerprint,
        generationPlan,
        payload,
        prompt,
        provider,
    };
}

function openDatabase() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const database = event.target.result;
            if (!database.objectStoreNames.contains(DB_STORE)) {
                database.createObjectStore(DB_STORE, { keyPath: 'cacheKey' });
            }
        };
    }).catch((error) => {
        databasePromise = null;
        throw error;
    });
    return databasePromise;
}

async function readCache(descriptor) {
    if (!descriptor.cacheEnabled || typeof indexedDB === 'undefined') return null;
    try {
        const database = await openDatabase();
        return await new Promise((resolve) => {
            const transaction = database.transaction(DB_STORE, 'readonly');
            const request = transaction.objectStore(DB_STORE).get(descriptor.cacheKey);
            request.onsuccess = () => {
                const record = request.result;
                const valid = record
                    && record.provider === descriptor.provider
                    && record.prompt === descriptor.prompt
                    && Date.now() - Number(record.timestamp || 0) < CACHE_TTL;
                resolve(valid ? record.base64 : null);
            };
            request.onerror = () => resolve(null);
        });
    } catch {
        return null;
    }
}

async function writeCache(descriptor, base64) {
    if (!descriptor.cacheEnabled || !base64 || typeof indexedDB === 'undefined') return;
    try {
        const database = await openDatabase();
        await new Promise((resolve, reject) => {
            const transaction = database.transaction(DB_STORE, 'readwrite');
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error);
            transaction.objectStore(DB_STORE).put({
                cacheKey: descriptor.cacheKey,
                provider: descriptor.provider,
                prompt: descriptor.prompt,
                base64,
                timestamp: Date.now(),
            });
        });
    } catch { }
}

function notifyEntry(entry, status, ahead, delay) {
    entry.progress = { status, ahead, delay };
    entry.consumers.forEach((consumer) => {
        if (!consumer.active) return;
        try { consumer.onProgress?.(status, ahead, delay); } catch (error) {
            console.error('[GeneratedImageRuntime] 进度回调失败:', error);
        }
    });
}

function normalizeProviderProgress(entry, state, data = {}) {
    if (state === 'start') {
        notifyEntry(entry, 'generating', 0);
        return;
    }
    if (state === 'cooldown') {
        return;
    }
    const rawAhead = Number(data.ahead);
    const rawPosition = Number(data.position);
    const ahead = Number.isFinite(rawAhead)
        ? Math.max(0, rawAhead)
        : Math.max(0, Number.isFinite(rawPosition) ? rawPosition - 1 : 0);
    notifyEntry(entry, state || 'queued', ahead);
}

function subscribe(entry, signal, onProgress) {
    return new Promise((resolve, reject) => {
        const consumer = {
            active: true,
            abortHandler: null,
            onProgress: typeof onProgress === 'function' ? onProgress : null,
        };
        const cleanup = () => {
            if (!consumer.active) return;
            consumer.active = false;
            entry.consumers.delete(consumer);
            if (signal && consumer.abortHandler) signal.removeEventListener('abort', consumer.abortHandler);
        };
        consumer.abortHandler = () => {
            if (!consumer.active) return;
            cleanup();
            reject(createAbortError());
            if (entry.consumers.size === 0) entry.controller.abort();
        };
        entry.consumers.add(consumer);
        if (entry.progress && consumer.onProgress) {
            const { status, ahead, delay } = entry.progress;
            try { consumer.onProgress(status, ahead, delay); } catch (error) {
                console.error('[GeneratedImageRuntime] 进度回调失败:', error);
            }
        }
        signal?.addEventListener('abort', consumer.abortHandler, { once: true });
        entry.promise.then((base64) => {
            if (!consumer.active) return;
            cleanup();
            resolve(base64);
        }, (error) => {
            if (!consumer.active) return;
            cleanup();
            reject(error);
        });
    });
}

function createRequest(descriptor) {
    const entry = {
        controller: new AbortController(),
        consumers: new Set(),
        progress: null,
        promise: null,
    };
    entry.promise = (async () => {
        const cached = await readCache(descriptor);
        if (entry.controller.signal.aborted) throw createAbortError();
        if (cached) return cached;
        const runtimeOptions = {
            signal: entry.controller.signal,
            onQueueStateChange: (state, data) => normalizeProviderProgress(entry, state, data),
        };
        const base64 = typeof descriptor.generationPlan?.execute === 'function'
            ? await descriptor.generationPlan.execute(runtimeOptions)
            : await descriptor.facade.generateImage({
                ...descriptor.payload,
                prompt: descriptor.prompt,
                ...runtimeOptions,
            });
        if (entry.controller.signal.aborted) throw createAbortError();
        await writeCache(descriptor, base64);
        return base64;
    })().finally(() => {
        if (inflightRequests.get(descriptor.fingerprint) === entry) {
            inflightRequests.delete(descriptor.fingerprint);
        }
    });
    return entry;
}

export function generateSharedImage(input = {}) {
    const descriptor = buildDescriptor(input);
    const signal = descriptor.payload.signal;
    if (signal?.aborted) return Promise.reject(createAbortError());
    let entry = inflightRequests.get(descriptor.fingerprint);
    if (!entry || entry.controller.signal.aborted) {
        entry = createRequest(descriptor);
        inflightRequests.set(descriptor.fingerprint, entry);
    }
    return subscribe(entry, signal, descriptor.payload.onProgress);
}

export async function checkGeneratedImageCache(input = {}) {
    return await readCache(buildDescriptor(input));
}

export function clearSharedImageRequests() {
    inflightRequests.forEach(entry => entry.controller.abort());
    inflightRequests.clear();
}

export async function clearExpiredGeneratedImageCache() {
    if (typeof indexedDB === 'undefined') return;
    try {
        const database = await openDatabase();
        const cutoff = Date.now() - CACHE_TTL;
        await new Promise((resolve, reject) => {
            const transaction = database.transaction(DB_STORE, 'readwrite');
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            const request = transaction.objectStore(DB_STORE).openCursor();
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (!cursor) return;
                if (Number(cursor.value?.timestamp || 0) < cutoff) cursor.delete();
                cursor.continue();
            };
            request.onerror = () => reject(request.error);
        });
    } catch { }
}
