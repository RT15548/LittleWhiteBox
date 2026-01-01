// ════════════════════════════════════════════════════════════════════════════
// 图片模块 - 缓存与生成（带队列）
// ════════════════════════════════════════════════════════════════════════════

const DB_NAME = 'xb_fourth_wall_images';
const DB_STORE = 'images';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

// 队列配置
const QUEUE_DELAY_MIN = 5000;
const QUEUE_DELAY_MAX = 10000;

let db = null;

// ═══════════════════════════════════════════════════════════════════════════
// 生成队列（全局共享）
// ═══════════════════════════════════════════════════════════════════════════

const generateQueue = [];
let isQueueProcessing = false;

function getRandomDelay() {
    return QUEUE_DELAY_MIN + Math.random() * (QUEUE_DELAY_MAX - QUEUE_DELAY_MIN);
}

/**
 * 将生成任务加入队列
 * @returns {Promise<string>} base64 图片
 */
function enqueueGeneration(tags, onProgress) {
    return new Promise((resolve, reject) => {
        const position = generateQueue.length + 1;
        onProgress?.('queued', position);
        
        generateQueue.push({ tags, resolve, reject, onProgress });
        processQueue();
    });
}

async function processQueue() {
    if (isQueueProcessing || generateQueue.length === 0) return;
    
    isQueueProcessing = true;
    
    while (generateQueue.length > 0) {
        const { tags, resolve, reject, onProgress } = generateQueue.shift();
        
        // 通知：开始生成
        onProgress?.('generating', generateQueue.length);
        
        try {
            const base64 = await doGenerateImage(tags);
            resolve(base64);
        } catch (err) {
            reject(err);
        }
        
        // 如果还有待处理的，等待冷却
        if (generateQueue.length > 0) {
            const delay = getRandomDelay();
            
            // 通知所有排队中的任务
            generateQueue.forEach((item, idx) => {
                item.onProgress?.('waiting', idx + 1, delay);
            });
            
            await new Promise(r => setTimeout(r, delay));
        }
    }
    
    isQueueProcessing = false;
}

/**
 * 获取队列状态
 */
export function getQueueStatus() {
    return {
        pending: generateQueue.length,
        isProcessing: isQueueProcessing
    };
}

/**
 * 清空队列
 */
export function clearQueue() {
    while (generateQueue.length > 0) {
        const { reject } = generateQueue.shift();
        reject(new Error('队列已清空'));
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// IndexedDB 操作（保持不变）
// ═══════════════════════════════════════════════════════════════════════════

async function openDB() {
    if (db) return db;
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => { db = request.result; resolve(db); };
        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(DB_STORE)) {
                database.createObjectStore(DB_STORE, { keyPath: 'hash' });
            }
        };
    });
}

function hashTags(tags) {
    let hash = 0;
    const str = String(tags || '').toLowerCase().replace(/\s+/g, ' ').trim();
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return 'fw_' + Math.abs(hash).toString(36);
}

async function getFromCache(tags) {
    try {
        const database = await openDB();
        const hash = hashTags(tags);
        return new Promise((resolve) => {
            const tx = database.transaction(DB_STORE, 'readonly');
            const req = tx.objectStore(DB_STORE).get(hash);
            req.onsuccess = () => {
                const result = req.result;
                resolve(result && Date.now() - result.timestamp < CACHE_TTL ? result.base64 : null);
            };
            req.onerror = () => resolve(null);
        });
    } catch { return null; }
}

async function saveToCache(tags, base64) {
    try {
        const database = await openDB();
        const tx = database.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put({ 
            hash: hashTags(tags), 
            tags, 
            base64, 
            timestamp: Date.now() 
        });
    } catch {}
}

export async function clearExpiredCache() {
    try {
        const database = await openDB();
        const cutoff = Date.now() - CACHE_TTL;
        const tx = database.transaction(DB_STORE, 'readwrite');
        const store = tx.objectStore(DB_STORE);
        store.openCursor().onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                if (cursor.value.timestamp < cutoff) cursor.delete();
                cursor.continue();
            }
        };
    } catch {}
}

// ═══════════════════════════════════════════════════════════════════════════
// 图片生成（内部函数，直接调用 NovelDraw）
// ═══════════════════════════════════════════════════════════════════════════

async function doGenerateImage(tags) {
    const novelDraw = window.xiaobaixNovelDraw;
    if (!novelDraw) {
        throw new Error('NovelDraw 模块未启用');
    }
    
    const settings = novelDraw.getSettings();
    const paramsPreset = settings.paramsPresets?.find(p => p.id === settings.selectedParamsPresetId) 
        || settings.paramsPresets?.[0];
    
    if (!paramsPreset) {
        throw new Error('无可用的参数预设');
    }
    
    const scene = [paramsPreset.positivePrefix, tags].filter(Boolean).join(', ');
    
    const base64 = await novelDraw.generateNovelImage({
        scene,
        characterPrompts: [],
        negativePrompt: paramsPreset.negativePrefix || '',
        params: paramsPreset.params || {}
    });
    
    await saveToCache(tags, base64);
    return base64;
}

// ═══════════════════════════════════════════════════════════════════════════
// 公开接口
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 检查缓存
 */
export async function checkImageCache(tags) {
    return await getFromCache(tags);
}

/**
 * 生成图片（自动排队）
 * @param {string} tags - 图片标签
 * @param {Function} [onProgress] - 进度回调 (status, position, delay?)
 * @returns {Promise<string>} base64 图片
 */
export async function generateImage(tags, onProgress) {
    // 先检查缓存
    const cached = await getFromCache(tags);
    if (cached) return cached;
    
    // 加入队列生成
    return enqueueGeneration(tags, onProgress);
}

// ═══════════════════════════════════════════════════════════════════════════
// postMessage 接口（用于 iframe）
// ═══════════════════════════════════════════════════════════════════════════

export async function handleCheckCache(data, postToFrame) {
    const { requestId, tags } = data;
    
    if (!tags?.trim()) {
        postToFrame({ type: 'CACHE_MISS', requestId, tags: '' });
        return;
    }
    
    const cached = await getFromCache(tags);
    
    if (cached) {
        postToFrame({ type: 'IMAGE_RESULT', requestId, base64: cached, fromCache: true });
    } else {
        postToFrame({ type: 'CACHE_MISS', requestId, tags });
    }
}

export async function handleGenerate(data, postToFrame) {
    const { requestId, tags } = data;
    
    if (!tags?.trim()) {
        postToFrame({ type: 'IMAGE_RESULT', requestId, error: '无效的图片标签' });
        return;
    }
    
    try {
        // 使用队列生成，发送进度更新
        const base64 = await generateImage(tags, (status, position, delay) => {
            postToFrame({ 
                type: 'IMAGE_PROGRESS', 
                requestId, 
                status, 
                position,
                delay: delay ? Math.round(delay / 1000) : undefined
            });
        });
        
        postToFrame({ type: 'IMAGE_RESULT', requestId, base64 });
        
    } catch (e) {
        postToFrame({ type: 'IMAGE_RESULT', requestId, error: e?.message || '生成失败' });
    }
}

export const IMG_GUIDELINE = `## 模拟图片
如果需要发图、照片给对方时，可以在聊天文本中穿插以下格式行，进行图片模拟：
[image: Subject, Appearance, Background, Atmosphere, Extra descriptors]
- tag必须为英文，用逗号分隔，使用Danbooru风格的tag，5-15个tag
- 第一个tag须固定为人物数量标签，如: 1girl, 1boy, 2girls, solo, etc.
- 可以多张照片: 每行一张 [image: ...]
- 当需要发送的内容尺度较大时加上nsfw相关tag
- image部分也需要在<msg>内`;
