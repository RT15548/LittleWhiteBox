// ════════════════════════════════════════════
// 语音运行时 - 统一合成与互斥播放
// ════════════════════════════════════════════

import { normalizeEmotion } from '../tts/tts-text.js';

let currentAudio = null;
let currentObjectUrl = null;
let currentAbort = null;
let currentRequestId = null;

/**
 * 合成并播放语音（后播覆盖前播）
 *
 * @param {string} text - 要合成的文本
 * @param {string} [emotion] - 原始情绪字符串（自动 normalize）
 * @param {Object} [callbacks] - 状态回调
 * @param {string} [callbacks.requestId] - 请求标识，用于防时序错乱
 * @param {(state: string, info?: object) => void} [callbacks.onState] - 状态变化回调
 *   state: 'loading' | 'playing' | 'ended' | 'error' | 'stopped'
 *   info: { duration?, message? }
 * @returns {{ stop: () => void }} 控制句柄
 */
export function synthesizeAndPlay(text, emotion, callbacks) {
    const requestId = callbacks?.requestId || `vr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const onState = callbacks?.onState;

    // 停掉前一个（回传 stopped）
    stopCurrent();

    const abortController = new AbortController();
    currentAbort = abortController;
    currentRequestId = requestId;

    const notify = (state, info) => {
        if (currentRequestId !== requestId && state !== 'stopped') return;
        onState?.(state, info);
    };

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

        if (abortController.signal.aborted) return;
        if (currentRequestId !== requestId) return;

        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);

        // 清理旧的（理论上 stopCurrent 已清理，防御性）
        cleanup();

        currentAudio = audio;
        currentObjectUrl = url;

        audio.onloadedmetadata = () => {
            if (currentRequestId !== requestId) return;
            notify('playing', { duration: audio.duration || 0 });
        };

        audio.onended = () => {
            if (currentRequestId !== requestId) return;
            notify('ended');
            cleanup();
        };

        audio.onerror = () => {
            if (currentRequestId !== requestId) return;
            notify('error', { message: '播放失败' });
            cleanup();
        };

        await audio.play();
    };

    run().catch(err => {
        if (abortController.signal.aborted) return;
        if (currentRequestId !== requestId) return;
        notify('error', { message: err?.message || '合成失败' });
        cleanup();
    });

    return {
        stop() {
            if (currentRequestId === requestId) {
                stopCurrent();
            }
        },
    };
}

/**
 * 停止当前语音（合成中止 + 播放停止 + 资源回收）
 */
export function stopCurrent() {
    if (currentAbort) {
        try { currentAbort.abort(); } catch { }
        currentAbort = null;
    }

    cleanup();

    currentRequestId = null;
}

// ════════════════════════════════════════════════════════════════════════════
// 内部
// ════════════════════════════════════════════════════════════════════════════

function cleanup() {
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
