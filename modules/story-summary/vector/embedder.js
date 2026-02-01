// ═══════════════════════════════════════════════════════════════════════════
// Story Summary - Embedding Service
// 统一的向量生成接口（本地模型 / 在线服务）
// ═══════════════════════════════════════════════════════════════════════════

import { xbLog } from '../../../core/debug-core.js';

const MODULE_ID = 'embedding';

// ═══════════════════════════════════════════════════════════════════════════
// 本地模型配置
// ═══════════════════════════════════════════════════════════════════════════

export const LOCAL_MODELS = {
    'bge-small-zh': {
        id: 'bge-small-zh',
        name: '中文轻量 (51MB)',
        hfId: 'Xenova/bge-small-zh-v1.5',
        dims: 512,
        desc: '手机/低配适用',
    },
    'bge-base-zh': {
        id: 'bge-base-zh',
        name: '中文标准 (102MB)',
        hfId: 'Xenova/bge-base-zh-v1.5',
        dims: 768,
        desc: 'PC 推荐，效果更好',
    },
    'e5-small': {
        id: 'e5-small',
        name: '多语言 (118MB)',
        hfId: 'Xenova/multilingual-e5-small',
        dims: 384,
        desc: '非中文用户',
    },
};

export const DEFAULT_LOCAL_MODEL = 'bge-small-zh';

// ═══════════════════════════════════════════════════════════════════════════
// 在线服务配置
// ═══════════════════════════════════════════════════════════════════════════

export const ONLINE_PROVIDERS = {
    siliconflow: {
        id: 'siliconflow',
        name: '硅基流动',
        baseUrl: 'https://api.siliconflow.cn',
        canFetchModels: false,
        defaultModels: [
            'BAAI/bge-m3',
            'BAAI/bge-large-zh-v1.5',
            'BAAI/bge-small-zh-v1.5',
        ],
    },
    cohere: {
        id: 'cohere',
        name: 'Cohere',
        baseUrl: 'https://api.cohere.ai',
        canFetchModels: false,
        defaultModels: [
            'embed-multilingual-v3.0',
            'embed-english-v3.0',
        ],
        // Cohere 使用不同的 API 格式
        customEmbed: true,
    },
    openai: {
        id: 'openai',
        name: 'OpenAI 兼容',
        baseUrl: '',
        canFetchModels: true,
        defaultModels: [],
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// 本地模型状态管理
// ═══════════════════════════════════════════════════════════════════════════

// 已加载的模型实例：{ modelId: pipeline }
const loadedPipelines = {};

// 当前正在下载的模型
let downloadingModelId = null;
let downloadAbortController = null;

// Worker for local embedding
let embeddingWorker = null;
let workerRequestId = 0;
const workerCallbacks = new Map();

function getWorker() {
    if (!embeddingWorker) {
        const workerPath = new URL('./embedder.worker.js', import.meta.url).href;
        embeddingWorker = new Worker(workerPath, { type: 'module' });

        embeddingWorker.onmessage = (e) => {
            const { requestId, ...data } = e.data || {};
            const callback = workerCallbacks.get(requestId);
            if (callback) {
                callback(data);
                if (data.type === 'result' || data.type === 'error' || data.type === 'loaded') {
                    workerCallbacks.delete(requestId);
                }
            }
        };
    }
    return embeddingWorker;
}

function workerRequest(message) {
    return new Promise((resolve, reject) => {
        const requestId = ++workerRequestId;
        const worker = getWorker();

        workerCallbacks.set(requestId, (data) => {
            if (data.type === 'error') {
                reject(new Error(data.error));
            } else if (data.type === 'result') {
                resolve(data.vectors);
            } else if (data.type === 'loaded') {
                resolve(true);
            }
        });

        worker.postMessage({ ...message, requestId });
    });
}


// ═══════════════════════════════════════════════════════════════════════════
// 本地模型操作
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 检查指定本地模型的状态
 * 只读取缓存，绝不触发下载
 */
export async function checkLocalModelStatus(modelId = DEFAULT_LOCAL_MODEL) {
    const modelConfig = LOCAL_MODELS[modelId];
    if (!modelConfig) {
        return { status: 'error', message: '未知模型' };
    }

    // 已加载到内存
    if (loadedPipelines[modelId]) {
        return { status: 'ready', message: '已就绪' };
    }

    // 正在下载
    if (downloadingModelId === modelId) {
        return { status: 'downloading', message: '下载中' };
    }

    // 检查 IndexedDB 缓存
    const hasCache = await checkModelCache(modelConfig.hfId);
    if (hasCache) {
        return { status: 'cached', message: '已缓存，可加载' };
    }

    return { status: 'not_downloaded', message: '未下载' };
}

/**
 * 检查 IndexedDB 中是否有模型缓存
 */
async function checkModelCache(hfId) {
    return new Promise((resolve) => {
        try {
            const request = indexedDB.open('transformers-cache', 1);
            request.onerror = () => resolve(false);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const storeNames = Array.from(db.objectStoreNames);
                db.close();
                // 检查是否有该模型的缓存
                const modelKey = hfId.replace('/', '_');
                const hasModel = storeNames.some(name =>
                    name.includes(modelKey) || name.includes('onnx')
                );
                resolve(hasModel);
            };
            request.onupgradeneeded = () => resolve(false);
        } catch {
            resolve(false);
        }
    });
}

/**
 * 下载/加载本地模型
 * @param {string} modelId - 模型ID
 * @param {Function} onProgress - 进度回调 (0-100)
 * @returns {Promise<boolean>}
 */
export async function downloadLocalModel(modelId = DEFAULT_LOCAL_MODEL, onProgress) {
    const modelConfig = LOCAL_MODELS[modelId];
    if (!modelConfig) {
        throw new Error(`未知模型: ${modelId}`);
    }
    // 已加载
    if (loadedPipelines[modelId]) {
        onProgress?.(100);
        return true;
    }
    // 正在下载其他模型
    if (downloadingModelId && downloadingModelId !== modelId) {
        throw new Error(`正在下载其他模型: ${downloadingModelId}`);
    }
    // 正在下载同一模型，等待完成
    if (downloadingModelId === modelId) {
        xbLog.info(MODULE_ID, `模型 ${modelId} 正在加载中...`);
        return new Promise((resolve, reject) => {
            const check = () => {
                if (loadedPipelines[modelId]) {
                    resolve(true);
                } else if (downloadingModelId !== modelId) {
                    reject(new Error('下载已取消'));
                } else {
                    setTimeout(check, 200);
                }
            };
            check();
        });
    }
downloadingModelId = modelId;
    downloadAbortController = new AbortController();

    try {
        xbLog.info(MODULE_ID, `开始下载模型: ${modelId}`);

        return await new Promise((resolve, reject) => {
            const requestId = ++workerRequestId;
            const worker = getWorker();

            workerCallbacks.set(requestId, (data) => {
                if (data.type === 'progress') {
                    onProgress?.(data.percent);
                } else if (data.type === 'loaded') {
                    loadedPipelines[modelId] = true;
                    workerCallbacks.delete(requestId);
                    resolve(true);
                } else if (data.type === 'error') {
                    workerCallbacks.delete(requestId);
                    reject(new Error(data.error));
                }
            });

            worker.postMessage({
                type: 'load',
                modelId,
                hfId: modelConfig.hfId,
                requestId
            });
        });
    } finally {
        downloadingModelId = null;
        downloadAbortController = null;
    }
}

export function cancelDownload() {
    if (downloadAbortController) {
        downloadAbortController.abort();
        xbLog.info(MODULE_ID, '下载已取消');
    }
    downloadingModelId = null;
    downloadAbortController = null;
}

/**
 * 删除指定模型的缓存
 */
export async function deleteLocalModelCache(modelId = null) {
    try {
        // 删除 IndexedDB
        await new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase('transformers-cache');
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
            request.onblocked = () => {
                xbLog.warn(MODULE_ID, 'IndexedDB 删除被阻塞');
                resolve();
            };
        });

        // 删除 CacheStorage
        if (window.caches) {
            const cacheNames = await window.caches.keys();
            for (const name of cacheNames) {
                if (name.includes('transformers') || name.includes('huggingface') || name.includes('xenova')) {
                    await window.caches.delete(name);
                }
            }
        }

        // 清除内存中的 pipeline
        if (modelId && loadedPipelines[modelId]) {
            delete loadedPipelines[modelId];
        } else {
            Object.keys(loadedPipelines).forEach(key => delete loadedPipelines[key]);
        }

        xbLog.info(MODULE_ID, '模型缓存已清除');
        return true;
    } catch (e) {
        xbLog.error(MODULE_ID, '清除缓存失败', e);
        throw e;
    }
}

/**
 * 使用本地模型生成向量
 */
async function embedLocal(texts, modelId = DEFAULT_LOCAL_MODEL) {
    if (!loadedPipelines[modelId]) {
        await downloadLocalModel(modelId);
    }

    return await workerRequest({ type: 'embed', texts });
}

export function isLocalModelLoaded(modelId = DEFAULT_LOCAL_MODEL) {
    return !!loadedPipelines[modelId];
}

/**
 * 获取本地模型信息
 */
export function getLocalModelInfo(modelId = DEFAULT_LOCAL_MODEL) {
    return LOCAL_MODELS[modelId] || null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 在线服务操作
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 测试在线服务连接
 */
export async function testOnlineService(provider, config) {
    const { url, key, model } = config;

    if (!key) {
        throw new Error('请填写 API Key');
    }
    if (!model) {
        throw new Error('请选择模型');
    }

    const providerConfig = ONLINE_PROVIDERS[provider];
    const baseUrl = (providerConfig?.baseUrl || url || '').replace(/\/+$/, '');

    if (!baseUrl) {
        throw new Error('请填写 API URL');
    }

    try {
        if (provider === 'cohere') {
            // Cohere 使用不同的 API 格式
            const response = await fetch(`${baseUrl}/v1/embed`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    texts: ['测试连接'],
                    input_type: 'search_document',
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API 返回 ${response.status}: ${error}`);
            }

            const data = await response.json();
            const dims = data.embeddings?.[0]?.length || 0;

            if (dims === 0) {
                throw new Error('API 返回的向量维度为 0');
            }

            return { success: true, dims };

        } else {
            // OpenAI 兼容格式
            const response = await fetch(`${baseUrl}/v1/embeddings`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    input: ['测试连接'],
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API 返回 ${response.status}: ${error}`);
            }

            const data = await response.json();
            const dims = data.data?.[0]?.embedding?.length || 0;

            if (dims === 0) {
                throw new Error('API 返回的向量维度为 0');
            }

            return { success: true, dims };
        }

    } catch (e) {
        if (e.name === 'TypeError' && e.message.includes('fetch')) {
            throw new Error('网络错误，请检查 URL 是否正确');
        }
        throw e;
    }
}

/**
 * 拉取在线模型列表（仅 OpenAI 兼容）
 */
export async function fetchOnlineModels(config) {
    const { url, key } = config;

    if (!url || !key) {
        throw new Error('请填写 URL 和 Key');
    }

    const baseUrl = url.replace(/\/+$/, '').replace(/\/v1$/, '');

    const response = await fetch(`${baseUrl}/v1/models`, {
        headers: {
            'Authorization': `Bearer ${key}`,
            'Accept': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`获取模型列表失败: ${response.status}`);
    }

    const data = await response.json();
    const models = data.data?.map(m => m.id).filter(Boolean) || [];

    // 过滤出 embedding 相关的模型
    const embeddingModels = models.filter(m => {
        const lower = m.toLowerCase();
        return lower.includes('embed') ||
            lower.includes('bge') ||
            lower.includes('e5') ||
            lower.includes('gte');
    });

    return embeddingModels.length > 0 ? embeddingModels : models.slice(0, 20);
}

/**
 * 使用在线服务生成向量
 */
async function embedOnline(texts, provider, config, options = {}) {
    const { url, key, model } = config;
    const signal = options?.signal;

    const providerConfig = ONLINE_PROVIDERS[provider];
    const baseUrl = (providerConfig?.baseUrl || url || '').replace(/\/+$/, '');

    // 永远重试：指数退避 + 上限 + 抖动
    const BASE_WAIT_MS = 1200;
    const MAX_WAIT_MS = 15000;

    const sleepAbortable = (ms) => new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
        const t = setTimeout(resolve, ms);
        if (signal) {
            signal.addEventListener('abort', () => {
                clearTimeout(t);
                reject(new DOMException('Aborted', 'AbortError'));
            }, { once: true });
        }
    });

    let attempt = 0;
    while (true) {
        attempt++;
        try {
            let response;

            if (provider === 'cohere') {
                response = await fetch(`${baseUrl}/v1/embed`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: model,
                        texts: texts,
                        input_type: 'search_document',
                    }),
                    signal,
                });
            } else {
                response = await fetch(`${baseUrl}/v1/embeddings`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: model,
                        input: texts,
                    }),
                    signal,
                });
            }

            // 需要“永远重试”的典型状态：
            // - 429：限流
            // - 403：配额/风控/未实名等（你提到的硅基未认证）
            // - 5xx：服务端错误
            const retryableStatus = (s) => s === 429 || s === 403 || (s >= 500 && s <= 599);

            if (!response.ok) {
                const errorText = await response.text().catch(() => '');

                if (retryableStatus(response.status)) {
                    const exp = Math.min(MAX_WAIT_MS, BASE_WAIT_MS * Math.pow(2, Math.min(attempt, 6) - 1));
                    const jitter = Math.floor(Math.random() * 350);
                    const waitMs = exp + jitter;
                    await sleepAbortable(waitMs);
                    continue;
                }

                // 非可恢复错误：直接抛出（比如 400 参数错、401 key 错等）
                const err = new Error(`API 返回 ${response.status}: ${errorText}`);
                err.status = response.status;
                throw err;
            }

            const data = await response.json();

            if (provider === 'cohere') {
                return (data.embeddings || []).map(e => Array.isArray(e) ? e : Array.from(e));
            }
            return (data.data || []).map(item => {
                const embedding = item.embedding;
                return Array.isArray(embedding) ? embedding : Array.from(embedding);
            });
        } catch (e) {
            // 取消：必须立刻退出
            if (e?.name === 'AbortError') throw e;

            // 网络错误：永远重试
            const exp = Math.min(MAX_WAIT_MS, BASE_WAIT_MS * Math.pow(2, Math.min(attempt, 6) - 1));
            const jitter = Math.floor(Math.random() * 350);
            const waitMs = exp + jitter;
            await sleepAbortable(waitMs);
        }
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// 统一接口
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 生成向量（统一接口）
 * @param {string[]} texts - 要向量化的文本数组
 * @param {Object} config - 配置
 * @returns {Promise<number[][]>}
 */
export async function embed(texts, config, options = {}) {
    if (!texts?.length) return [];

    const { engine, local, online } = config;

    if (engine === 'local') {
        const modelId = local?.modelId || DEFAULT_LOCAL_MODEL;
        return await embedLocal(texts, modelId);

    } else if (engine === 'online') {
        const provider = online?.provider || 'siliconflow';
        if (!online?.key || !online?.model) {
            throw new Error('在线服务配置不完整');
        }
        return await embedOnline(texts, provider, online, options);

    } else {
        throw new Error(`未知的引擎类型: ${engine}`);
    }
}

/**
 * 获取当前引擎的唯一标识（用于检查向量是否匹配）
 */

// Concurrent embed for online services (local falls back to sequential)
export async function embedBatchesConcurrent(textBatches, config, concurrency = 3) {
    if (config.engine === 'local' || textBatches.length <= 1) {
        const results = [];
        for (const batch of textBatches) {
            results.push(await embed(batch, config));
        }
        return results;
    }

    const results = new Array(textBatches.length);
    let index = 0;

    async function worker() {
        while (index < textBatches.length) {
            const i = index++;
            results[i] = await embed(textBatches[i], config);
        }
    }

    await Promise.all(
        Array(Math.min(concurrency, textBatches.length))
            .fill(null)
            .map(() => worker())
    );

    return results;
}

export function getEngineFingerprint(config) {
    if (config.engine === 'local') {
        const modelId = config.local?.modelId || DEFAULT_LOCAL_MODEL;
        const modelConfig = LOCAL_MODELS[modelId];
        return `local:${modelId}:${modelConfig?.dims || 512}`;

    } else if (config.engine === 'online') {
        const provider = config.online?.provider || 'unknown';
        const model = config.online?.model || 'unknown';
        return `online:${provider}:${model}`;

    } else {
        return 'unknown';
    }
}
