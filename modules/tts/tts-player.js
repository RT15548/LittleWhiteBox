/**
 * TTS 队列播放器
 */

export class TtsPlayer {
    constructor({ ownership = null } = {}) {
        this.queue = [];
        this.currentAudio = null;
        this.currentItem = null;
        this.currentStream = null;
        this.currentCleanup = null;
        this.isPlaying = false;
        this.playbackRate = 1;
        this.onStateChange = null; // 回调：(state, item, info) => void
        this._disposed = false;
        this._suspended = false;
        this._ownership = ownership?.register(reason => {
            if (reason === 'disposed') this.dispose();
            else this.pause();
        });
    }

    /**
     * 入队
     * @param {Object} item - { id, audioBlob, text? }
     * @returns {boolean} 是否成功入队（重复id会跳过）
     */
    enqueue(item) {
        if (this._disposed) return false;
        if (!item?.audioBlob && !item?.streamFactory) return false;
        // 防重复
        if (item.id && this.queue.some(q => q.id === item.id)) {
            return false;
        }
        this.queue.push(item);
        this._notifyState('enqueued', item);
        if (!this.currentAudio && !this._suspended) {
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
        this._suspended = false;
        this._ownership?.release();
        this._notifyState('cleared', null);
    }

    dispose() {
        if (this._disposed) return;
        this.clear();
        this._disposed = true;
        this._ownership?.dispose();
        this._notifyState('disposed', null);
        this.onStateChange = null;
    }

    // Explicit playback may take ownership; enqueue/automatic continuation may not.
    activate() {
        if (this._disposed || (this._ownership && !this._ownership.acquire(true))) return false;
        this._suspended = false;
        return true;
    }

    pause() {
        this._suspended = true;
        this.isPlaying = false;
        const alreadyPaused = !this.currentAudio || this.currentAudio.paused;
        this.currentAudio?.pause();
        this._ownership?.release();
        if (alreadyPaused) this._notifyState('paused', this.currentItem);
    }

    resume() {
        if (!this.activate()) return false;
        if (this.currentAudio) this._playAudio(this.currentAudio, this.currentItem);
        else this._playNext();
        return true;
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
        if (!this.activate()) return false;
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
                this.resume();
            } else {
                this.pause();
            }
            return true;
        }
        return this.playNow(item);
    }

    setPlaybackRate(rate) {
        const nextRate = Math.max(0.5, Math.min(2, Number(rate) || 1));
        this.playbackRate = nextRate;
        if (this.currentAudio) {
            try {
                this.currentAudio.playbackRate = nextRate;
            } catch (caughtError) { console.warn({ source: import.meta.url, operation: "setPlaybackRate" }, caughtError); }
        }
        this._notifyState('ratechange', this.currentItem, { playbackRate: nextRate });
        return nextRate;
    }

    seek(seconds) {
        if (!this.currentAudio) return false;
        const duration = Number(this.currentAudio.duration);
        if (!Number.isFinite(duration) || duration <= 0) return false;
        const nextTime = Math.max(0, Math.min(duration, Number(seconds) || 0));
        try {
            this.currentAudio.currentTime = nextTime;
            this._notifyState('progress', this.currentItem, { currentTime: nextTime, duration });
            return true;
        } catch {
            return false;
        }
    }

    _playNext() {
        if (this._disposed || this._suspended) return;
        if (this.queue.length === 0) {
            this.isPlaying = false;
            this.currentItem = null;
            this._ownership?.release();
            this._notifyState('idle', null);
            return;
        }

        if (this._ownership && !this._ownership.acquire()) {
            this._suspended = true;
            return;
        }

        const item = this.queue.shift();
        this._playItem(item);
    }

    _playItem(item) {
        this.isPlaying = false;
        this.currentItem = item;
        this._notifyState('loading', item);

        if (item.streamFactory) {
            this._playStreamItem(item);
            return;
        }

        const url = URL.createObjectURL(item.audioBlob);
        const audio = new Audio(url);
        audio.playbackRate = this.playbackRate;
        this.currentAudio = audio;
        this.currentCleanup = () => {
            URL.revokeObjectURL(url);
        };

        audio.onloadedmetadata = () => {
            if (this.currentAudio !== audio) return;
            this._notifyState('metadata', item, { duration: audio.duration || 0 });
        };

        audio.ontimeupdate = () => {
            if (this.currentAudio !== audio) return;
            this._notifyState('progress', item, { currentTime: audio.currentTime || 0, duration: audio.duration || 0 });
        };

        audio.onplay = () => {
            if (this.currentAudio !== audio) return;
            if (this._suspended) { audio.pause(); return; }
            this.isPlaying = true;
            this._notifyState('playing', item);
        };

        audio.onpause = () => {
            if (this.currentAudio !== audio) return;
            this.isPlaying = false;
            if (!audio.ended) this._notifyState('paused', item);
        };

        audio.onended = () => {
            if (this.currentAudio !== audio || this._suspended) return;
            this._stopCurrent();
            this.currentItem = null;
            this._notifyState('ended', item);
            this._playNext();
        };

        audio.onerror = (e) => {
            if (this.currentAudio !== audio) return;
            console.error('[TTS Player] 播放失败:', e);
            this._stopCurrent();
            this.currentItem = null;
            this._notifyState('error', item);
            this._playNext();
        };

        this._playAudio(audio, item);
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
        audio.playbackRate = this.playbackRate;
        this.currentAudio = audio;

        const cleanup = () => {
            audio.pause();
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
                objectUrl = '';
            }
        };
        this.currentCleanup = cleanup;

        const pump = () => {
            if (this.currentAudio !== audio) return;
            if (!sourceBuffer || sourceBuffer.updating || queue.length === 0) {
                if (streamEnded && sourceBuffer && !sourceBuffer.updating && queue.length === 0) {
                    try {
                        if (mediaSource?.readyState === 'open') mediaSource.endOfStream();
                    } catch (caughtError) { console.warn({ source: import.meta.url, operation: "pump" }, caughtError); }
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
            if (this.currentAudio !== audio) return;
            hasError = true;
            console.error('[TTS Player] 流式播放失败:', err);
            this._stopCurrent(true);
            this.currentItem = null;
            this._notifyState('error', item);
            this._playNext();
        };

        mediaSource = new MediaSource();
        objectUrl = URL.createObjectURL(mediaSource);
        audio.src = objectUrl;

        mediaSource.addEventListener('sourceopen', () => {
            if (hasError) return;
            if (this.currentAudio !== audio) return;
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
                if (hasError || this.currentAudio !== audio) return;
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
            if (this.currentAudio !== audio) return;
            this._notifyState('metadata', item, { duration: audio.duration || 0 });
        };

        audio.ontimeupdate = () => {
            if (this.currentAudio !== audio) return;
            this._notifyState('progress', item, { currentTime: audio.currentTime || 0, duration: audio.duration || 0 });
        };

        audio.onplay = () => {
            if (this.currentAudio !== audio) return;
            if (this._suspended) { audio.pause(); return; }
            this.isPlaying = true;
            this._notifyState('playing', item);
        };

        audio.onpause = () => {
            if (this.currentAudio !== audio) return;
            this.isPlaying = false;
            if (!audio.ended) this._notifyState('paused', item);
        };

        audio.onended = () => {
            if (this.currentAudio !== audio || this._suspended) return;
            this._stopCurrent(true);
            this.currentItem = null;
            this._notifyState('ended', item);
            this._playNext();
        };

        audio.onerror = (e) => {
            console.error('[TTS Player] 播放失败:', e);
            handleStreamError(e);
        };

        this._playAudio(audio, item);
    }

    _playAudio(audio, item) {
        audio.play().catch(err => {
            if (this.currentAudio !== audio || this._suspended) return;
            console.warn('[TTS Player] 播放被阻止（需用户手势）:', err);
            this.pause();
            this._notifyState('blocked', item);
        });
    }

    _stopCurrent(abortStream = false) {
        const audio = this.currentAudio;
        this.currentAudio = null;
        if (abortStream) {
            try { this.currentStream?.abort?.(); } catch (caughtError) { console.warn({ source: import.meta.url, operation: "_stopCurrent" }, caughtError); }
        }
        if (audio) {
            audio.onloadedmetadata = audio.ontimeupdate = audio.onplay = audio.onpause = audio.onended = audio.onerror = null;
            audio.pause();
        }
        this.currentCleanup?.();
        this.currentCleanup = null;
        this.currentStream = null;
    }

    _notifyState(state, item, info = null) {
        if (typeof this.onStateChange === 'function') {
            try { this.onStateChange(state, item, info); } catch (e) { console.warn({ source: import.meta.url, operation: "_notifyState" }, e); }
        }
    }
}
