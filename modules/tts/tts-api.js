import { createIdentifier } from '../../shared/common/identifier.js';
import { ttsAudioMime } from './tts-audio-format.js';
import { buildTtsV3Body } from './tts-request-body.js';
import { MediaApiError } from '../../shared/media-api.js';
/**
 * 火山引擎 TTS API 封装
 * V3 单向流式 + V1试用
 */

const V3_URL = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional';
const FREE_V1_URL = 'https://edgetts.velure.codes';

export const FREE_VOICES = [
    { key: 'female_1',    name: '晓晓',   tag: '温暖百变', gender: 'female' },
    { key: 'female_2',    name: '晓伊',   tag: '清冷知性', gender: 'female' },
    { key: 'female_3',    name: '小北',   tag: '东北甜妹', gender: 'female' },
    { key: 'female_4',    name: '小妮',   tag: '陕西姑娘', gender: 'female' },
    { key: 'hk_female_1', name: '曉佳',   tag: '粤语女声', gender: 'female' },
    { key: 'hk_female_2', name: '曉曼',   tag: '粤语温柔', gender: 'female' },
    { key: 'hk_male_1',   name: '雲龍',   tag: '粤语男声', gender: 'male' },
    { key: 'tw_female_1', name: '曉臻',   tag: '台灣女聲', gender: 'female' },
    { key: 'tw_female_2', name: '曉雨',   tag: '台灣温柔', gender: 'female' },
    { key: 'tw_male_1',   name: '雲哲',   tag: '台灣男聲', gender: 'male' },
    { key: 'male_1',      name: '云希',   tag: '少年温暖', gender: 'male' },
    { key: 'male_2',      name: '云健',   tag: '阳刚有力', gender: 'male' },
    { key: 'male_3',      name: '云扬',   tag: '专业播报', gender: 'male' },
    { key: 'male_4',      name: '云夏',   tag: '少年活力', gender: 'male' },
    { key: 'en_female_1', name: 'Jenny',  tag: '美式甜美', gender: 'female' },
    { key: 'en_female_2', name: 'Aria',   tag: '美式知性', gender: 'female' },
    { key: 'en_female_3', name: 'Sonia',  tag: '英式优雅', gender: 'female' },
    { key: 'en_male_1',   name: 'Guy',    tag: '美式磁性', gender: 'male' },
    { key: 'en_male_2',   name: 'Ryan',   tag: '英式绅士', gender: 'male' },
    { key: 'ja_female_1', name: '七海',   tag: '日式温柔', gender: 'female' },
    { key: 'ja_male_1',   name: '圭太',   tag: '日式少年', gender: 'male' },
];

export const FREE_DEFAULT_VOICE = 'female_1';

// ============ 内部工具 ============

async function proxyFetch(url, options = {}) {
    const proxyUrl = '/proxy/' + encodeURIComponent(url);
    return fetch(proxyUrl, options);
}

function safeTail(value) {
    return value ? String(value).slice(-4) : '';
}

// ============ V3 鉴权模式 ============

/**
 * V3 单向流式合成（完整下载）
 */
export async function synthesizeV3(params, authHeaders = {}) {
    const {
        appId,
        accessKey,
        resourceId = 'seed-tts-2.0',
        text,
        speaker,
        format = 'mp3',
        emotion,
        contextTexts,
    } = params;

    if (!appId || !accessKey || !text || !speaker) {
        throw new Error('缺少必要参数: appId/accessKey/text/speaker');
    }

    console.log('[TTS API] V3 request:', {
        appIdTail: safeTail(appId),
        accessKeyTail: safeTail(accessKey),
        resourceId,
        speaker,
        textLength: text.length,
        hasContextTexts: !!contextTexts?.length,
        hasEmotion: !!emotion,
    });

    const body = buildTtsV3Body(params);

    params.onProgress?.({ state: 'generating' });
    const resp = await proxyFetch(V3_URL, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(body),
        signal: params.signal,
    });

    const logid = resp.headers.get('X-Tt-Logid') || '';
    if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`V3 请求失败: ${resp.status} ${errText}${logid ? ` (logid: ${logid})` : ''}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    const audioChunks = [];
    let usage = null;
    let buffer = '';
    let receivedBytes = 0;
    let completed = false;

    const readLine = (line) => {
        if (!line.trim()) return;
        const json = JSON.parse(line);
        if (json.code !== undefined && json.code !== 20000000 && json.code !== 0) throw new MediaApiError('provider_error');
        if (json.data) {
            const binary = atob(json.data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            audioChunks.push(bytes);
            receivedBytes += bytes.byteLength;
            params.onProgress?.({ state: 'receiving', receivedBytes });
        }
        if (json.code === 20000000) {
            completed = true;
            if (json.usage) usage = json.usage;
        }
    };
    try {
        while (true) {
            params.signal?.throwIfAborted();
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) readLine(line);
        }
        params.signal?.throwIfAborted();
        readLine(buffer + decoder.decode());
    } finally {
        await reader.cancel().catch((caughtError) => { console.debug({ source: import.meta.url, operation: "synthesizeV3" }, caughtError); });
        reader.releaseLock();
    }

    if (!completed) throw new MediaApiError('invalid_result');
    if (audioChunks.length === 0) {
        throw new Error(`未收到音频数据${logid ? ` (logid: ${logid})` : ''}`);
    }

    params.onProgress?.({ state: 'complete', receivedBytes });
    return {
        audioBlob: new Blob(audioChunks, { type: ttsAudioMime(format) }),
        usage,
        logid,
    };
}

/**
 * V3 单向流式合成（边生成边回调）
 */
export async function synthesizeV3Stream(params, authHeaders = {}, options = {}) {
    const {
        appId,
        accessKey,
        text,
        speaker,
    } = params;

    if (!appId || !accessKey || !text || !speaker) {
        throw new Error('缺少必要参数: appId/accessKey/text/speaker');
    }

    const body = buildTtsV3Body(params);

    const resp = await proxyFetch(V3_URL, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(body),
        signal: options.signal,
    });

    const logid = resp.headers.get('X-Tt-Logid') || '';
    if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        throw new Error(`V3 请求失败: ${resp.status} ${errText}${logid ? ` (logid: ${logid})` : ''}`);
    }

    const reader = resp.body?.getReader();
    if (!reader) throw new Error('V3 响应流不可用');

    const decoder = new TextDecoder();
    let usage = null;
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (!line.trim()) continue;
            try {
                const json = JSON.parse(line);
                if (json.data) {
                    const binary = atob(json.data);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    options.onChunk?.(bytes);
                }
                if (json.code === 20000000 && json.usage) {
                    usage = json.usage;
                }
            } catch (caughtError) { console.debug({ source: import.meta.url, operation: "synthesizeV3Stream" }, caughtError); }
        }
    }

    return { usage, logid };
}

// ============ 试用模式 ============

export async function synthesizeFreeV1(params, options = {}) {
    const {
        voiceKey = FREE_DEFAULT_VOICE,
        text,
        speed = 1.0,
        emotion = null,
    } = params || {};

    if (!text) {
        throw new Error('缺少必要参数: text');
    }

    const requestBody = {
        voiceKey,
        text: String(text || ''),
        speed: Number(speed) || 1.0,
        uid: 'xb_' + Date.now(),
        reqid: createIdentifier(),
    };

    if (emotion) {
        requestBody.emotion = emotion;
        requestBody.emotionScale = 5;
    }

    const res = await fetch(FREE_V1_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: options.signal,
    });

    if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);

    const data = await res.json();
    if (data.code !== 3000) throw new Error(data.message || 'TTS 合成失败');

    return { audioBase64: data.data };
}
