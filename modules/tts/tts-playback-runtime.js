import { normalizeEmotion } from './tts-text.js';

let currentAudio = null;
let currentObjectUrl = null;
let currentAbort = null;
let currentRequestId = null;
let currentNotify = null;

/**
 * 合成并播放一条临时语音。新请求会停止旧请求，适用于消息气泡等即时播放入口。
 *
 * @param {string} text
 * @param {string} [emotion]
 * @param {{requestId?: string, onState?: (state: string, info?: object) => void}} [callbacks]
 * @returns {{stop: () => void}}
 */
export function playTransientVoice(text, emotion, callbacks) {
    const requestId = callbacks?.requestId || `tts_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const onState = callbacks?.onState;

    stopTransientVoice();

    const abortController = new AbortController();
    currentAbort = abortController;
    currentRequestId = requestId;

    const notify = (state, info) => {
        if (currentRequestId !== requestId && state !== 'stopped') return;
        try { onState?.(state, info); } catch (error) {
            console.error('[TtsPlaybackRuntime] 状态回调失败:', error);
        }
    };
    currentNotify = notify;
    notify('loading');

    const run = async () => {
        const synthesize = window.xiaobaixTts?.synthesize;
        if (typeof synthesize !== 'function') {
            throw new Error('请先启用 TTS 模块');
        }

        const blob = await synthesize(text, {
            emotion: normalizeEmotion(emotion || ''),
            signal: abortController.signal,
        });

        if (abortController.signal.aborted || currentRequestId !== requestId) return;

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        cleanupPlaybackResources();
        currentAudio = audio;
        currentObjectUrl = url;

        audio.onloadedmetadata = () => {
            if (currentRequestId !== requestId) return;
            notify('playing', { duration: audio.duration || 0 });
        };
        audio.onended = () => {
            if (currentRequestId !== requestId) return;
            notify('ended');
            releaseTransientVoice(requestId);
        };
        audio.onerror = () => {
            if (currentRequestId !== requestId) return;
            notify('error', { message: '播放失败' });
            releaseTransientVoice(requestId);
        };

        await audio.play();
    };

    run().catch((error) => {
        if (abortController.signal.aborted || currentRequestId !== requestId) return;
        notify('error', { message: error?.message || '合成失败' });
        releaseTransientVoice(requestId);
    });

    return {
        stop() {
            if (currentRequestId === requestId) stopTransientVoice();
        },
    };
}

export function stopTransientVoice() {
    const notify = currentNotify;
    if (currentAbort) {
        try { currentAbort.abort(); } catch { }
    }

    cleanupPlaybackResources();
    currentAbort = null;
    currentRequestId = null;
    currentNotify = null;
    notify?.('stopped');
}

function cleanupPlaybackResources() {
    if (currentAudio) {
        currentAudio.onloadedmetadata = null;
        currentAudio.onended = null;
        currentAudio.onerror = null;
        try { currentAudio.pause(); } catch { }
        currentAudio = null;
    }

    if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
    }
}

function releaseTransientVoice(requestId) {
    if (currentRequestId !== requestId) return;
    cleanupPlaybackResources();
    currentAbort = null;
    currentRequestId = null;
    currentNotify = null;
}
