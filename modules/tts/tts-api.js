/**
 * 火山引擎 TTS API 封装
 * V3 单向流式 + V1试用
 */

const V3_URL = 'https://openspeech.bytedance.com/api/v3/tts/unidirectional';
const FREE_V1_URL = 'https://hstts.velure.codes';

export const FREE_VOICES = [
    { key: 'female_1', name: '桃夭', tag: '甜蜜仙子', gender: 'female' },
    { key: 'female_2', name: '霜华', tag: '清冷仙子', gender: 'female' },
    { key: 'female_3', name: '顾姐', tag: '御姐烟嗓', gender: 'female' },
    { key: 'female_4', name: '苏菲', tag: '优雅知性', gender: 'female' },
    { key: 'female_5', name: '嘉欣', tag: '港风甜心', gender: 'female' },
    { key: 'female_6', name: '青梅', tag: '清秀少年音', gender: 'female' },
    { key: 'female_7', name: '可莉', tag: '奶音萝莉', gender: 'female' },
    { key: 'male_1', name: '夜枭', tag: '磁性低音', gender: 'male' },
    { key: 'male_2', name: '君泽', tag: '温润公子', gender: 'male' },
    { key: 'male_3', name: '沐阳', tag: '沉稳暖男', gender: 'male' },
    { key: 'male_4', name: '梓辛', tag: '青春少年', gender: 'male' },
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
        uid = 'st_user',
        text,
        speaker,
        model,
        format = 'mp3',
        sampleRate = 24000,
        speechRate = 0,
        loudnessRate = 0,
        emotion,
        emotionScale,
        contextTexts,
        explicitLanguage,
        disableMarkdownFilter = true,
        disableEmojiFilter,
        enableLanguageDetector,
        maxLengthToFilterParenthesis,
        postProcessPitch,
        cacheConfig,
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

    const additions = {};
    if (contextTexts?.length) additions.context_texts = contextTexts;
    if (explicitLanguage) additions.explicit_language = explicitLanguage;
    if (disableMarkdownFilter) additions.disable_markdown_filter = true;
    if (disableEmojiFilter) additions.disable_emoji_filter = true;
    if (enableLanguageDetector) additions.enable_language_detector = true;
    if (Number.isFinite(maxLengthToFilterParenthesis)) {
        additions.max_length_to_filter_parenthesis = maxLengthToFilterParenthesis;
    }
    if (Number.isFinite(postProcessPitch) && postProcessPitch !== 0) {
        additions.post_process = { pitch: postProcessPitch };
    }
    if (cacheConfig && typeof cacheConfig === 'object') {
        additions.cache_config = cacheConfig;
    }

    const body = {
        user: { uid },
        req_params: {
            text,
            speaker,
            audio_params: {
                format,
                sample_rate: sampleRate,
                speech_rate: speechRate,
                loudness_rate: loudnessRate,
            },
        },
    };
    
    if (model) body.req_params.model = model;
    if (emotion) {
        body.req_params.audio_params.emotion = emotion;
        body.req_params.audio_params.emotion_scale = emotionScale || 4;
    }
    if (Object.keys(additions).length > 0) {
        body.req_params.additions = JSON.stringify(additions);
    }

    const resp = await proxyFetch(V3_URL, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(body),
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
                    audioChunks.push(bytes);
                }
                if (json.code === 20000000 && json.usage) {
                    usage = json.usage;
                }
            } catch {}
        }
    }

    if (audioChunks.length === 0) {
        throw new Error(`未收到音频数据${logid ? ` (logid: ${logid})` : ''}`);
    }

    return {
        audioBlob: new Blob(audioChunks, { type: 'audio/mpeg' }),
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
        uid = 'st_user',
        text,
        speaker,
        model,
        format = 'mp3',
        sampleRate = 24000,
        speechRate = 0,
        loudnessRate = 0,
        emotion,
        emotionScale,
        contextTexts,
        explicitLanguage,
        disableMarkdownFilter = true,
        disableEmojiFilter,
        enableLanguageDetector,
        maxLengthToFilterParenthesis,
        postProcessPitch,
        cacheConfig,
    } = params;

    if (!appId || !accessKey || !text || !speaker) {
        throw new Error('缺少必要参数: appId/accessKey/text/speaker');
    }

    const additions = {};
    if (contextTexts?.length) additions.context_texts = contextTexts;
    if (explicitLanguage) additions.explicit_language = explicitLanguage;
    if (disableMarkdownFilter) additions.disable_markdown_filter = true;
    if (disableEmojiFilter) additions.disable_emoji_filter = true;
    if (enableLanguageDetector) additions.enable_language_detector = true;
    if (Number.isFinite(maxLengthToFilterParenthesis)) {
        additions.max_length_to_filter_parenthesis = maxLengthToFilterParenthesis;
    }
    if (Number.isFinite(postProcessPitch) && postProcessPitch !== 0) {
        additions.post_process = { pitch: postProcessPitch };
    }
    if (cacheConfig && typeof cacheConfig === 'object') {
        additions.cache_config = cacheConfig;
    }

    const body = {
        user: { uid },
        req_params: {
            text,
            speaker,
            audio_params: {
                format,
                sample_rate: sampleRate,
                speech_rate: speechRate,
                loudness_rate: loudnessRate,
            },
        },
    };
    
    if (model) body.req_params.model = model;
    if (emotion) {
        body.req_params.audio_params.emotion = emotion;
        body.req_params.audio_params.emotion_scale = emotionScale || 4;
    }
    if (Object.keys(additions).length > 0) {
        body.req_params.additions = JSON.stringify(additions);
    }

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
            } catch {}
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
        reqid: crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
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
