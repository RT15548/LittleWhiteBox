// tts-auth-provider.js
/**
 * TTS 鉴权模式播放服务
 * 负责火山引擎 V3 API 的调用与流式播放
 */

import { synthesizeV3, synthesizeV3Stream } from './tts-api.js';
import { normalizeEmotion } from './tts-text.js';
import { inferResourceIdBySpeaker } from './tts-voices.js';
import { getRequestHeaders } from "../../../../../../script.js";
import { buildSynthesizeParams, speedToSpeechRate } from './tts-request.js';

// ============ 工具函数（内部） ============

function estimateDuration(text) {
    return Math.max(2, Math.ceil(String(text || '').length / 4));
}

function supportsStreaming() {
    try {
        return typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported('audio/mpeg');
    } catch {
        return false;
    }
}

function resolveContextTexts(context, resourceId) {
    const text = String(context || '').trim();
    if (!text || resourceId !== 'seed-tts-2.0') return [];
    return [text];
}

// ============ 导出的工具函数 ============

export function speedToV3SpeechRate(speed) {
    return speedToSpeechRate(speed);
}

export function buildV3Headers(resourceId, config) {
    const stHeaders = getRequestHeaders() || {};
    const headers = {
        ...stHeaders,
        'Content-Type': 'application/json',
        'X-Api-App-Id': config.volc.appId,
        'X-Api-Access-Key': config.volc.accessKey,
        'X-Api-Resource-Id': resourceId,
    };
    if (config.volc.usageReturn) {
        headers['X-Control-Require-Usage-Tokens-Return'] = 'text_words';
    }
    return headers;
}

// ============ 参数构建 ============

// ============ 单段播放（导出供混合模式使用） ============

export async function speakSegmentAuth(messageId, segment, segmentIndex, batchId, ctx) {
    const { 
        isFirst, 
        config, 
        player, 
        tryLoadLocalCache, 
        updateState 
    } = ctx;
    
    const speaker = segment.resolvedSpeaker;
    const resourceId = segment.resolvedResourceId || inferResourceIdBySpeaker(speaker);
    const params = buildSynthesizeParams({ text: segment.text, speaker, resourceId }, config);
    const emotion = normalizeEmotion(segment.emotion);
    const contextTexts = resolveContextTexts(segment.context, resourceId);

    if (emotion) params.emotion = emotion;
    if (contextTexts.length) params.contextTexts = contextTexts;

    // 首段初始化状态
    if (isFirst) {
        updateState({
            status: 'sending',
            text: segment.text,
            textLength: segment.text.length,
            cached: false,
            usage: null,
            error: '',
            duration: estimateDuration(segment.text),
        });
    }

    updateState({ currentSegment: segmentIndex + 1 });

    // 尝试缓存
    const cacheHit = await tryLoadLocalCache(params);
    if (cacheHit?.entry?.blob) {
        updateState({ 
            cached: true, 
            status: 'cached', 
            audioBlob: cacheHit.entry.blob, 
            cacheKey: cacheHit.key 
        });
        player.enqueue({
            id: `msg-${messageId}-batch-${batchId}-seg-${segmentIndex}`,
            messageId,
            segmentIndex,
            batchId,
            audioBlob: cacheHit.entry.blob,
            text: segment.text,
        });
        return;
    }

    const headers = buildV3Headers(resourceId, config);

    try {
        if (supportsStreaming()) {
            await playWithStreaming(messageId, segment, segmentIndex, batchId, params, headers, ctx);
        } else {
            await playWithoutStreaming(messageId, segment, segmentIndex, batchId, params, headers, ctx);
        }
    } catch (err) {
        updateState({ status: 'error', error: err?.message || '请求失败' });
    }
}

// ============ 流式播放 ============

async function playWithStreaming(messageId, segment, segmentIndex, batchId, params, headers, ctx) {
    const { player, storeLocalCache, buildCacheKey, updateState } = ctx;
    const speaker = segment.resolvedSpeaker;
    const resourceId = params.resourceId;
    
    const controller = new AbortController();
    const chunks = [];
    let resolved = false;

    const donePromise = new Promise((resolve, reject) => {
        const streamItem = {
            id: `msg-${messageId}-batch-${batchId}-seg-${segmentIndex}`,
            messageId,
            segmentIndex,
            batchId,
            text: segment.text,
            streamFactory: () => ({
                mimeType: 'audio/mpeg',
                abort: () => controller.abort(),
                start: async (append, end, fail) => {
                    try {
                        const result = await synthesizeV3Stream(params, headers, {
                            signal: controller.signal,
                            onChunk: (bytes) => {
                                chunks.push(bytes);
                                append(bytes);
                            },
                        });
                        end();
                        if (!resolved) {
                            resolved = true;
                            resolve({ 
                                audioBlob: new Blob(chunks, { type: 'audio/mpeg' }), 
                                usage: result.usage || null, 
                                logid: result.logid 
                            });
                        }
                    } catch (err) {
                        if (!resolved) {
                            resolved = true;
                            fail(err);
                            reject(err);
                        }
                    }
                },
            }),
        };

        const ok = player.enqueue(streamItem);
        if (!ok && !resolved) {
            resolved = true;
            reject(new Error('播放队列已存在相同任务'));
        }
    });

    donePromise.then(async (result) => {
        if (!result?.audioBlob) return;
        updateState({ audioBlob: result.audioBlob, usage: result.usage || null });
        
        const cacheKey = buildCacheKey(params);
        updateState({ cacheKey });
        
        await storeLocalCache(cacheKey, result.audioBlob, {
            text: segment.text.slice(0, 200),
            textLength: segment.text.length,
            speaker,
            resourceId,
            usage: result.usage || null,
        });
    }).catch((err) => {
        if (err?.name === 'AbortError' || /aborted/i.test(err?.message || '')) return;
        updateState({ status: 'error', error: err?.message || '请求失败' });
    });

    updateState({ status: 'queued' });
}

// ============ 非流式播放 ============

async function playWithoutStreaming(messageId, segment, segmentIndex, batchId, params, headers, ctx) {
    const { player, storeLocalCache, buildCacheKey, updateState } = ctx;
    const speaker = segment.resolvedSpeaker;
    const resourceId = params.resourceId;
    
    const result = await synthesizeV3(params, headers);
    updateState({ audioBlob: result.audioBlob, usage: result.usage, status: 'queued' });

    const cacheKey = buildCacheKey(params);
    updateState({ cacheKey });
    
    await storeLocalCache(cacheKey, result.audioBlob, {
        text: segment.text.slice(0, 200),
        textLength: segment.text.length,
        speaker,
        resourceId,
        usage: result.usage || null,
    });

    player.enqueue({
        id: `msg-${messageId}-batch-${batchId}-seg-${segmentIndex}`,
        messageId,
        segmentIndex,
        batchId,
        audioBlob: result.audioBlob,
        text: segment.text,
    });
}

// ============ 主入口 ============

export async function speakMessageAuth(options) {
    const {
        messageId,
        segments,
        batchId,
        config,
        player,
        tryLoadLocalCache,
        storeLocalCache,
        buildCacheKey,
        updateState,
        isModuleEnabled,
    } = options;

    const ctx = { 
        config, 
        player, 
        tryLoadLocalCache, 
        storeLocalCache, 
        buildCacheKey, 
        updateState 
    };

    for (let i = 0; i < segments.length; i++) {
        if (isModuleEnabled && !isModuleEnabled()) return;
        await speakSegmentAuth(messageId, segments[i], i, batchId, { 
            isFirst: i === 0, 
            ...ctx 
        });
    }
}
