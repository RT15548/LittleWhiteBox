import { FREE_DEFAULT_VOICE, FREE_VOICES } from './tts-api.js';
import { mediaFailure, MediaApiError, requireFields } from '../../shared/media-api.js';
import { TTS_OPTION_FIELDS } from './tts-request.js';

/** Public speech configuration contains only selectable voices, never provider credentials. */
export function readTtsVoices(config) {
    const voices = FREE_VOICES.map(voice => ({
        id: voice.key, name: `${voice.name} · ${voice.tag}`, source: 'free', available: true,
    }));
    const configured = Boolean(config?.volc?.appId && config?.volc?.accessKey);
    for (const voice of config?.volc?.mySpeakers ?? []) {
        if (!voice.value || voices.some(item => item.id === voice.value)) continue;
        voices.push({ id: voice.value, name: voice.name || voice.value, source: 'auth', available: configured });
    }
    const defaultVoice = config?.volc?.defaultSpeaker || FREE_DEFAULT_VOICE;
    if (!voices.some(voice => voice.id === defaultVoice)) {
        voices.push({ id: defaultVoice, name: defaultVoice, source: 'auth', available: configured });
    }
    return { voices, defaultVoice };
}

/** Disabling TTS cancels all external downloads, including a late cache result. */
export function createTtsExternalSynthesis({ isEnabled, synthesize }) {
    const requests = new Set();
    let closed = false;
    return {
        async synthesize(text, options = {}) {
            if (closed || !isEnabled()) throw new MediaApiError('disabled');
            requireFields(options, TTS_OPTION_FIELDS);
            if (options.signal !== undefined && (typeof options.signal?.addEventListener !== 'function' || typeof options.signal?.aborted !== 'boolean')) throw new MediaApiError('invalid_request', { field: 'signal' });
            if (options.onProgress !== undefined && typeof options.onProgress !== 'function') throw new MediaApiError('invalid_request', { field: 'onProgress' });
            const controller = new AbortController();
            const abort = () => controller.abort();
            if (options.signal?.aborted) abort();
            else options.signal?.addEventListener('abort', abort, { once: true });
            requests.add(controller);
            try {
                controller.signal.throwIfAborted();
                const blob = await synthesize(text, { ...options, signal: controller.signal });
                controller.signal.throwIfAborted();
                if (closed || !isEnabled()) throw new MediaApiError('disabled');
                return blob;
            } catch (error) { throw mediaFailure(error, controller.signal); }
            finally {
                requests.delete(controller);
                options.signal?.removeEventListener('abort', abort);
            }
        },
        dispose() {
            closed = true;
            for (const request of requests) request.abort();
            requests.clear();
        },
    };
}
