/**
 * TTS 队列播放器
 */

export class TtsPlayer {
    constructor() {
        this.queue = [];
        this.currentAudio = null;
        this.currentItem = null;
        this.currentStream = null;
        this.currentCleanup = null;
        this.isPlaying = false;
        this.onStateChange = null; // 回调：(state, item, info) => void
    }

    /**
     * 入队
     * @param {Object} item - { id, audioBlob, text? }
     * @returns {boolean} 是否成功入队（重复id会跳过）
     */
    enqueue(item) {
        if (!item?.audioBlob && !item?.streamFactory) return false;
        // 防重复
        if (item.id && this.queue.some(q => q.id === item.id)) {
            return false;
        }
        this.queue.push(item);
        this._notifyState('enqueued', item);
        if (!this.isPlaying) {
            this._playNext();
        }
        return true;
    }

    /**
     * 清空队列并停止播放
     */
    clear() {
        this.queue = [];
        this._stopCurrent(true);
        this.currentItem = null;
        this.isPlaying = false;
        this._notifyState('cleared', null);
    }

    /**
     * 获取队列长度
     */
    get length() {
        return this.queue.length;
    }

    /**
     * 立即播放（打断队列）
     * @param {Object} item
     */
    playNow(item) {
        if (!item?.audioBlob && !item?.streamFactory) return false;
        this.queue = [];
        this._stopCurrent(true);
        this._playItem(item);
        return true;
    }

    /**
     * 切换播放（同一条则暂停/继续）
     * @param {Object} item
     */
    toggle(item) {
        if (!item?.audioBlob && !item?.streamFactory) return false;
        if (this.currentItem?.id === item.id && this.currentAudio) {
            if (this.currentAudio.paused) {
                this.currentAudio.play().catch(err => {
                    console.warn('[TTS Player] 播放被阻止（需用户手势）:', err);
                    this._notifyState('blocked', item);
                });
            } else {
                this.currentAudio.pause();
            }
            return true;
        }
        return this.playNow(item);
    }

    _playNext() {
        if (this.queue.length === 0) {
            this.isPlaying = false;
            this.currentItem = null;
            this._notifyState('idle', null);
            return;
        }

        const item = this.queue.shift();
        this._playItem(item);
    }

    _playItem(item) {
        this.isPlaying = true;
        this.currentItem = item;
        this._notifyState('playing', item);

        if (item.streamFactory) {
            this._playStreamItem(item);
            return;
        }

        const url = URL.createObjectURL(item.audioBlob);
        const audio = new Audio(url);
        this.currentAudio = audio;
        this.currentCleanup = () => {
            URL.revokeObjectURL(url);
        };

        audio.onloadedmetadata = () => {
            this._notifyState('metadata', item, { duration: audio.duration || 0 });
        };

        audio.ontimeupdate = () => {
            this._notifyState('progress', item, { currentTime: audio.currentTime || 0, duration: audio.duration || 0 });
        };

        audio.onplay = () => {
            this._notifyState('playing', item);
        };

        audio.onpause = () => {
            if (!audio.ended) this._notifyState('paused', item);
        };

        audio.onended = () => {
            this.currentCleanup?.();
            this.currentCleanup = null;
            this.currentAudio = null;
            this.currentItem = null;
            this._notifyState('ended', item);
            this._playNext();
        };

        audio.onerror = (e) => {
            console.error('[TTS Player] 播放失败:', e);
            this.currentCleanup?.();
            this.currentCleanup = null;
            this.currentAudio = null;
            this.currentItem = null;
            this._notifyState('error', item);
            this._playNext();
        };

        audio.play().catch(err => {
            console.warn('[TTS Player] 播放被阻止（需用户手势）:', err);
            this._notifyState('blocked', item);
            this._playNext();
        });
    }

    _playStreamItem(item) {
        let objectUrl = '';
        let mediaSource = null;
        let sourceBuffer = null;
        let streamEnded = false;
        let hasError = false;
        const queue = [];

        const stream = item.streamFactory();
        this.currentStream = stream;

        const audio = new Audio();
        this.currentAudio = audio;

        const cleanup = () => {
            if (this.currentAudio) {
                this.currentAudio.pause();
            }
            this.currentAudio = null;
            this.currentItem = null;
            this.currentStream = null;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                objectUrl = '';
            }
        };
        this.currentCleanup = cleanup;

        const pump = () => {
            if (!sourceBuffer || sourceBuffer.updating || queue.length === 0) {
                if (streamEnded && sourceBuffer && !sourceBuffer.updating && queue.length === 0) {
                    try {
                        if (mediaSource?.readyState === 'open') mediaSource.endOfStream();
                    } catch {}
                }
                return;
            }
            const chunk = queue.shift();
            if (chunk) {
                try {
                    sourceBuffer.appendBuffer(chunk);
                } catch (err) {
                    handleStreamError(err);
                }
            }
        };

        const handleStreamError = (err) => {
            if (hasError) return;
            if (this.currentItem !== item) return;
            hasError = true;
            console.error('[TTS Player] 流式播放失败:', err);
            try { stream?.abort?.(); } catch {}
            cleanup();
            this.currentCleanup = null;
            this._notifyState('error', item);
            this._playNext();
        };

        mediaSource = new MediaSource();
        objectUrl = URL.createObjectURL(mediaSource);
        audio.src = objectUrl;

        mediaSource.addEventListener('sourceopen', () => {
            if (hasError) return;
            if (this.currentItem !== item) return;
            try {
                const mimeType = stream?.mimeType || 'audio/mpeg';
                if (!MediaSource.isTypeSupported(mimeType)) {
                    throw new Error(`不支持的流式音频类型: ${mimeType}`);
                }
                sourceBuffer = mediaSource.addSourceBuffer(mimeType);
                sourceBuffer.mode = 'sequence';
                sourceBuffer.addEventListener('updateend', pump);
            } catch (err) {
                handleStreamError(err);
                return;
            }

            const append = (chunk) => {
                if (hasError) return;
                queue.push(chunk);
                pump();
            };

            const end = () => {
                streamEnded = true;
                pump();
            };

            const fail = (err) => {
                handleStreamError(err);
            };

            Promise.resolve(stream?.start?.(append, end, fail)).catch(fail);
        });

        audio.onloadedmetadata = () => {
            this._notifyState('metadata', item, { duration: audio.duration || 0 });
        };

        audio.ontimeupdate = () => {
            this._notifyState('progress', item, { currentTime: audio.currentTime || 0, duration: audio.duration || 0 });
        };

        audio.onplay = () => {
            this._notifyState('playing', item);
        };

        audio.onpause = () => {
            if (!audio.ended) this._notifyState('paused', item);
        };

        audio.onended = () => {
            if (this.currentItem !== item) return;
            cleanup();
            this.currentCleanup = null;
            this._notifyState('ended', item);
            this._playNext();
        };

        audio.onerror = (e) => {
            console.error('[TTS Player] 播放失败:', e);
            handleStreamError(e);
        };

        audio.play().catch(err => {
            console.warn('[TTS Player] 播放被阻止（需用户手势）:', err);
            try { stream?.abort?.(); } catch {}
            cleanup();
            this._notifyState('blocked', item);
            this._playNext();
        });
    }

    _stopCurrent(abortStream = false) {
        if (abortStream) {
            try { this.currentStream?.abort?.(); } catch {}
        }
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        this.currentCleanup?.();
        this.currentCleanup = null;
        this.currentStream = null;
    }

    _notifyState(state, item, info = null) {
        if (typeof this.onStateChange === 'function') {
            try { this.onStateChange(state, item, info); } catch (e) {}
        }
    }
}
