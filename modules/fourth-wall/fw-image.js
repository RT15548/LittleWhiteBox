// ════════════════════════════════════════════════════════════════════════════
// 图片模块 - 缓存与生成
// ════════════════════════════════════════════════════════════════════════════

const DB_NAME = 'xb_fourth_wall_images';
const DB_STORE = 'images';
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

let db = null;

/**
 * 图片提示词指南 - 注入给 LLM
 */
export const IMG_GUIDELINE = `## 模拟图片
如果需要发图、照片给对方时，可以在聊天文本中穿插以下格式行，进行图片模拟：
[image: Subject, Appearance, Background, Atmosphere, Extra descriptors]
- tag必须为英文，用逗号分隔，使用Danbooru风格的tag，5-15个tag
- 第一个tag须固定为人物数量标签，如: 1girl, 1boy, 2girls, solo, etc.
- 可以多张照片: 每行一张 [image: ...]
- 当需要发送的内容尺度较大时加上nsfw相关tag
- image部分也需要在<msg>内`;

// ════════════════════════════════════════════════════════════════════════════
// IndexedDB 操作
// ════════════════════════════════════════════════════════════════════════════

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

/**
 * 清理过期缓存
 */
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

// ════════════════════════════════════════════════════════════════════════════
// 图片请求处理
// ════════════════════════════════════════════════════════════════════════════

/**
 * 处理缓存检查请求
 * @param {Object} data - { requestId, tags }
 * @param {Function} postToFrame - 发送消息到 iframe 的函数
 */
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

/**
 * 处理图片生成请求
 * @param {Object} data - { requestId, tags }
 * @param {Function} postToFrame - 发送消息到 iframe 的函数
 */
export async function handleGenerate(data, postToFrame) {
    const { requestId, tags } = data;
    
    if (!tags?.trim()) {
        postToFrame({ type: 'IMAGE_RESULT', requestId, error: '无效的图片标签' });
        return;
    }
    
    const novelDraw = window.xiaobaixNovelDraw;
    if (!novelDraw) {
        postToFrame({ type: 'IMAGE_RESULT', requestId, error: 'NovelDraw 模块未启用' });
        return;
    }
    
    try {
        const settings = novelDraw.getSettings();
        const paramsPreset = settings.paramsPresets?.find(p => p.id === settings.selectedParamsPresetId) 
            || settings.paramsPresets?.[0];
        
        if (!paramsPreset) {
            postToFrame({ type: 'IMAGE_RESULT', requestId, error: '无可用的参数预设' });
            return;
        }
        
        const scene = [paramsPreset.positivePrefix, tags].filter(Boolean).join(', ');
        
        const base64 = await novelDraw.generateNovelImage({
            scene,
            characterPrompts: [],
            negativePrompt: paramsPreset.negativePrefix || '',
            params: paramsPreset.params || {}
        });
        
        await saveToCache(tags, base64);
        postToFrame({ type: 'IMAGE_RESULT', requestId, base64 });
        
    } catch (e) {
        postToFrame({ type: 'IMAGE_RESULT', requestId, error: e?.message || '生成失败' });
    }
}
