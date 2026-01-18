import { synthesizeFreeV1, FREE_VOICES, FREE_DEFAULT_VOICE } from './tts-api.js';
import { normalizeEmotion, splitTtsSegmentsForFree } from './tts-text.js';

const MAX_RETRIES = 3;
const RETRY_DELAYS = [500, 1000, 2000];

const activeQueueManagers = new Map();

function normalizeSpeed(value) {
    const num = Number.isFinite(value) ? value : 1.0;
    if (num >= 0.5 && num <= 2.0) return num;
    return Math.min(2.0, Math.max(0.5, 1 + num / 100));
}

function generateBatchId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function estimateDuration(text) {
    return Math.max(2, Math.ceil(String(text || '').length / 4));
}

function resolveFreeVoiceByName(speakerName, mySpeakers, defaultSpeaker) {
    if (!speakerName) return defaultSpeaker;
    const list = Array.isArray(mySpeakers) ? mySpeakers : [];
    
    const byName = list.find(s => s.name === speakerName);
    if (byName?.value) return byName.value;
    
    const byValue = list.find(s => s.value === speakerName);
    if (byValue?.value) return byValue.value;
    
    const isFreeVoice = FREE_VOICES.some(v => v.key === speakerName);
    if (isFreeVoice) return speakerName;
    
    return defaultSpeaker;
}

class SegmentQueueManager {
    constructor(options) {
        const { player, messageId, batchId, totalSegments } = options;
        
        this.player = player;
        this.messageId = messageId;
        this.batchId = batchId;
        this.totalSegments = totalSegments;
        
        this.segments = Array(totalSegments).fill(null).map((_, i) => ({
            index: i,
            status: 'pending',
            audioBlob: null,
            text: '',
            retryCount: 0,
            error: null,
            retryTimer: null,
        }));
        
        this.nextEnqueueIndex = 0;
        this.onSegmentReady = null;
        this.onSegmentSkipped = null;
        this.onRetryNeeded = null;
        this.onComplete = null;
        this.onProgress = null;
        this._completed = false;
        this._destroyed = false;
        
        this.abortController = new AbortController();
    }
    
    get signal() {
        return this.abortController.signal;
    }
    
    markLoading(index) {
        if (this._destroyed) return;
        const seg = this.segments[index];
        if (seg && seg.status === 'pending') {
            seg.status = 'loading';
        }
    }
    
    setReady(index, audioBlob, text = '') {
        if (this._destroyed) return;
        const seg = this.segments[index];
        if (!seg) return;
        
        seg.status = 'ready';
        seg.audioBlob = audioBlob;
        seg.text = text;
        seg.error = null;
        
        this.onSegmentReady?.(index, seg);
        this._tryEnqueueNext();
    }
    
    setFailed(index, error) {
        if (this._destroyed) return false;
        const seg = this.segments[index];
        if (!seg) return false;
        
        seg.retryCount++;
        seg.error = error;
        
        if (seg.retryCount >= MAX_RETRIES) {
            seg.status = 'skipped';
            this.onSegmentSkipped?.(index, seg);
            this._tryEnqueueNext();
            return false;
        }
        
        seg.status = 'pending';
        const delay = RETRY_DELAYS[seg.retryCount - 1] || 2000;
        
        seg.retryTimer = setTimeout(() => {
            seg.retryTimer = null;
            if (!this._destroyed) {
                this.onRetryNeeded?.(index, seg.retryCount);
            }
        }, delay);
        
        return true;
    }
    
    _tryEnqueueNext() {
        if (this._destroyed) return;
        
        while (this.nextEnqueueIndex < this.totalSegments) {
            const seg = this.segments[this.nextEnqueueIndex];
            
            if (seg.status === 'ready' && seg.audioBlob) {
                this.player.enqueue({
                    id: `msg-${this.messageId}-batch-${this.batchId}-seg-${seg.index}`,
                    messageId: this.messageId,
                    segmentIndex: seg.index,
                    batchId: this.batchId,
                    audioBlob: seg.audioBlob,
                    text: seg.text,
                });
                seg.status = 'enqueued';
                this.nextEnqueueIndex++;
                this.onProgress?.(this.getStats());
                continue;
            }
            
            if (seg.status === 'skipped') {
                this.nextEnqueueIndex++;
                this.onProgress?.(this.getStats());
                continue;
            }
            
            break;
        }
        
        this._checkCompletion();
    }
    
    _checkCompletion() {
        if (this._completed || this._destroyed) return;
        if (this.nextEnqueueIndex >= this.totalSegments) {
            this._completed = true;
            this.onComplete?.(this.getStats());
        }
    }
    
    getStats() {
        let ready = 0, skipped = 0, pending = 0, loading = 0, enqueued = 0;
        for (const seg of this.segments) {
            switch (seg.status) {
                case 'ready': ready++; break;
                case 'enqueued': enqueued++; break;
                case 'skipped': skipped++; break;
                case 'loading': loading++; break;
                default: pending++; break;
            }
        }
        return { 
            total: this.totalSegments, 
            enqueued, 
            ready, 
            skipped, 
            pending, 
            loading, 
            nextEnqueue: this.nextEnqueueIndex, 
            completed: this._completed 
        };
    }
    
    destroy() {
        if (this._destroyed) return;
        this._destroyed = true;
        
        try {
            this.abortController.abort();
        } catch {}
        
        for (const seg of this.segments) {
            if (seg.retryTimer) {
                clearTimeout(seg.retryTimer);
                seg.retryTimer = null;
            }
        }
        
        this.onComplete = null;
        this.onSegmentReady = null;
        this.onSegmentSkipped = null;
        this.onRetryNeeded = null;
        this.onProgress = null;
        this.segments = [];
    }
}

export function clearAllFreeQueues() {
    for (const qm of activeQueueManagers.values()) {
        qm.destroy();
    }
    activeQueueManagers.clear();
}

export function clearFreeQueueForMessage(messageId) {
    const qm = activeQueueManagers.get(messageId);
    if (qm) {
        qm.destroy();
        activeQueueManagers.delete(messageId);
    }
}

export async function speakMessageFree(options) {
    const {
        messageId,
        segments,
        defaultSpeaker = FREE_DEFAULT_VOICE,
        mySpeakers = [],
        player,
        config,
        tryLoadLocalCache,
        storeLocalCache,
        buildCacheKey,
        updateState,
        clearMessageFromQueue,
        mode = 'auto',
    } = options;
    
    if (!segments?.length) return { success: false };

    clearFreeQueueForMessage(messageId);

    const freeSpeed = normalizeSpeed(config?.volc?.speechRate);
    const splitSegments = splitTtsSegmentsForFree(segments);
    
    if (!splitSegments.length) return { success: false };
    
    const batchId = generateBatchId();
    
    if (mode === 'manual') clearMessageFromQueue?.(messageId);
    
    updateState?.({
        status: 'sending',
        text: splitSegments.map(s => s.text).join('\n').slice(0, 200),
        textLength: splitSegments.reduce((sum, s) => sum + s.text.length, 0),
        cached: false,
        error: '',
        duration: splitSegments.reduce((sum, s) => sum + estimateDuration(s.text), 0),
        currentSegment: 0,
        totalSegments: splitSegments.length,
    });
    
    const queueManager = new SegmentQueueManager({ 
        player, 
        messageId, 
        batchId, 
        totalSegments: splitSegments.length 
    });
    
    activeQueueManagers.set(messageId, queueManager);
    
    const fetchSegment = async (index) => {
        if (queueManager._destroyed) return;
        
        const segment = splitSegments[index];
        if (!segment) return;
        
        queueManager.markLoading(index);
        
        updateState?.({
            currentSegment: index + 1,
            status: 'sending',
        });
        
        const emotion = normalizeEmotion(segment.emotion);
        const voiceKey = segment.resolvedSpeaker 
            || (segment.speaker 
                ? resolveFreeVoiceByName(segment.speaker, mySpeakers, defaultSpeaker)
                : (defaultSpeaker || FREE_DEFAULT_VOICE));
        
        const cacheParams = {
            providerMode: 'free',
            text: segment.text,
            speaker: voiceKey,
            freeSpeed,
            emotion: emotion || '',
        };
        
        if (tryLoadLocalCache) {
            try {
                const cacheHit = await tryLoadLocalCache(cacheParams);
                if (cacheHit?.entry?.blob) {
                    queueManager.setReady(index, cacheHit.entry.blob, segment.text);
                    return;
                }
            } catch {}
        }
        
        try {
            const { audioBase64 } = await synthesizeFreeV1({
                text: segment.text,
                voiceKey,
                speed: freeSpeed,
                emotion: emotion || null,
            }, { signal: queueManager.signal });
            
            if (queueManager._destroyed) return;
            
            const byteString = atob(audioBase64);
            const bytes = new Uint8Array(byteString.length);
            for (let j = 0; j < byteString.length; j++) {
                bytes[j] = byteString.charCodeAt(j);
            }
            const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
            
            if (storeLocalCache && buildCacheKey) {
                const cacheKey = buildCacheKey(cacheParams);
                storeLocalCache(cacheKey, audioBlob, {
                    text: segment.text.slice(0, 200),
                    textLength: segment.text.length,
                    speaker: voiceKey,
                    resourceId: 'free',
                }).catch(() => {});
            }
            
            queueManager.setReady(index, audioBlob, segment.text);
            
        } catch (err) {
            if (err?.name === 'AbortError' || queueManager._destroyed) {
                return;
            }
            queueManager.setFailed(index, err);
        }
    };
    
    queueManager.onRetryNeeded = (index, retryCount) => {
        fetchSegment(index);
    };
    
    queueManager.onSegmentReady = (index, seg) => {
        const stats = queueManager.getStats();
        updateState?.({
            currentSegment: stats.enqueued + stats.ready,
            status: stats.enqueued > 0 ? 'queued' : 'sending',
        });
    };
    
    queueManager.onSegmentSkipped = (index, seg) => {
    };
    
    queueManager.onProgress = (stats) => {
        updateState?.({
            currentSegment: stats.enqueued,
            totalSegments: stats.total,
        });
    };
    
    queueManager.onComplete = (stats) => {
        if (stats.enqueued === 0) {
            updateState?.({
                status: 'error',
                error: '全部段落请求失败',
            });
        }
        activeQueueManagers.delete(messageId);
        queueManager.destroy();
    };
    
    for (let i = 0; i < splitSegments.length; i++) {
        fetchSegment(i);
    }
    
    return { success: true };
}

export { FREE_VOICES, FREE_DEFAULT_VOICE };
