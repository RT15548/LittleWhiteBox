function getDrawFacade() {
    const facade = window.xiaobaixDraw;
    if (!facade) throw new Error('画图模块未启用');
    return facade;
}

const activeImageRequests = new Set();

export function cancelFourthWallImageRequests() {
    activeImageRequests.forEach(controller => controller.abort());
    activeImageRequests.clear();
}

export async function handleCheckCache(data, postToFrame) {
    const { requestId } = data;
    const tags = String(data.tags || '').trim();
    if (!tags) {
        postToFrame({ type: 'CACHE_MISS', requestId, tags: '' });
        return;
    }

    const checkCache = getDrawFacade().checkGeneratedImageCache;
    const cached = typeof checkCache === 'function'
        ? await checkCache({ prompt: tags, cacheNamespace: 'fourth-wall' })
        : null;
    if (cached) {
        postToFrame({ type: 'IMAGE_RESULT', requestId, base64: cached, fromCache: true });
        return;
    }
    postToFrame({ type: 'CACHE_MISS', requestId, tags });
}

export async function handleGenerate(data, postToFrame) {
    const { requestId } = data;
    const tags = String(data.tags || '').trim();
    if (!tags) {
        postToFrame({ type: 'IMAGE_RESULT', requestId, error: '无效的图片标签' });
        return;
    }

    const controller = new AbortController();
    activeImageRequests.add(controller);
    try {
        const generateSharedImage = getDrawFacade().generateSharedImage;
        if (typeof generateSharedImage !== 'function') throw new Error('画图共享运行时未初始化');
        const base64 = await generateSharedImage({
            prompt: tags,
            cacheNamespace: 'fourth-wall',
            signal: controller.signal,
            onProgress(status, ahead, delay) {
                postToFrame({
                    type: 'IMAGE_PROGRESS',
                    requestId,
                    status,
                    position: status === 'queued' ? Number(ahead || 0) + 1 : 0,
                    delay: delay ? Math.round(delay / 1000) : undefined,
                });
            },
        });
        postToFrame({ type: 'IMAGE_RESULT', requestId, base64 });
    } catch (error) {
        if (!controller.signal.aborted) {
            postToFrame({ type: 'IMAGE_RESULT', requestId, error: error?.message || '生成失败' });
        }
    } finally {
        activeImageRequests.delete(controller);
    }
}

export const IMG_GUIDELINE = `## 模拟图片
如果需要发图、照片给对方时，可以在聊天文本中穿插以下格式行，进行图片模拟：
[img: Subject, Appearance, Background, Atmosphere, Extra descriptors]
- tag必须为英文，用逗号分隔，使用Danbooru风格的tag，5-15个tag
- 第一个tag须固定为人物数量标签，如: 1girl, 1boy, 2girls, solo, etc.
- 可以多张照片: 每行一张 [img: ...]
- 当需要发送的内容尺度较大时加上nsfw相关tag
- image部分也需要在<msg>内`;
