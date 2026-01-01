// ════════════════════════════════════════════════════════════════════════════
// 语音模块 - TTS 合成服务
// ════════════════════════════════════════════════════════════════════════════

export const TTS_WORKER_URL = 'https://hstts.velure.top';
export const DEFAULT_VOICE = 'female_1';
export const DEFAULT_SPEED = 1.0;

export const VALID_EMOTIONS = ['happy', 'sad', 'angry', 'surprise', 'scare', 'hate'];
export const EMOTION_ICONS = {
    happy: '😄', sad: '😢', angry: '😠', surprise: '😮', scare: '😨', hate: '🤢'
};

let voiceListCache = null;
let defaultVoiceKey = DEFAULT_VOICE;

// ════════════════════════════════════════════════════════════════════════════
// 声音列表管理
// ════════════════════════════════════════════════════════════════════════════

/**
 * 加载可用声音列表
 */
export async function loadVoices() {
    if (voiceListCache) return { voices: voiceListCache, defaultVoice: defaultVoiceKey };
    
    try {
        const res = await fetch(`${TTS_WORKER_URL}/voices`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        voiceListCache = data.voices || [];
        defaultVoiceKey = data.defaultVoice || DEFAULT_VOICE;
        return { voices: voiceListCache, defaultVoice: defaultVoiceKey };
    } catch (err) {
        console.error('[FW Voice] 加载声音列表失败:', err);
        return { voices: [], defaultVoice: DEFAULT_VOICE };
    }
}

/**
 * 获取已缓存的声音列表
 */
export function getVoiceList() {
    return voiceListCache || [];
}

/**
 * 获取默认声音
 */
export function getDefaultVoice() {
    return defaultVoiceKey;
}

// ════════════════════════════════════════════════════════════════════════════
// TTS 合成
// ════════════════════════════════════════════════════════════════════════════

/**
 * 合成语音
 * @param {string} text - 要合成的文本
 * @param {Object} options - 选项
 * @param {string} [options.voiceKey] - 声音标识
 * @param {number} [options.speed] - 语速 0.5-2.0
 * @param {string} [options.emotion] - 情绪
 * @returns {Promise<string>} base64 编码的音频数据
 */
export async function synthesizeSpeech(text, options = {}) {
    const {
        voiceKey = defaultVoiceKey,
        speed = DEFAULT_SPEED,
        emotion = null
    } = options;

    const requestBody = {
        voiceKey,
        text: String(text || ''),
        speed: Number(speed) || DEFAULT_SPEED,
        uid: 'xb_' + Date.now(),
        reqid: crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`
    };

    if (emotion && VALID_EMOTIONS.includes(emotion)) {
        requestBody.emotion = emotion;
        requestBody.emotionScale = 5;
    }

    const res = await fetch(TTS_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);

    const data = await res.json();
    if (data.code !== 3000) throw new Error(data.message || 'TTS 合成失败');

    return data.data; // base64 音频
}

// ════════════════════════════════════════════════════════════════════════════
// 提示词指南
// ════════════════════════════════════════════════════════════════════════════

export const VOICE_GUIDELINE = `## 模拟语音
如需发送语音消息，使用以下格式：
[voice:情绪:语音内容]

### 情绪参数（7选1）：
- 空 = 平静/默认（例：[voice::今天天气不错]）
- happy = 开心/兴奋
- sad = 悲伤/低落
- angry = 生气/愤怒
- surprise = 惊讶/震惊
- scare = 恐惧/害怕
- hate = 厌恶/反感

### 标点辅助控制语气：
- ……省略号：拖长音、犹豫
- ！感叹号：语气有力
- ？问号：疑问上扬
- ～波浪号：撒娇拖音
- ——	拉长、强调、戏剧化
### 示例：
[voice:happy:太好了！终于见到你了～]
[voice:sad:我……我没事的……]
[voice:angry:你怎么能这样！]
[voice::——啊！——不要！]

注意：voice部分需要在<msg>内`;
