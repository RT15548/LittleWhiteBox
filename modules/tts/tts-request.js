import { FREE_DEFAULT_VOICE, FREE_VOICES } from './tts-api.js';
import { inferResourceIdBySpeaker } from './tts-voices.js';
import { copyRequest, MediaApiError, requireFields } from '../../shared/media-api.js';

import { TTS_AUDIO_MIMES } from './tts-audio-format.js';
export const TTS_OPTION_FIELDS = Object.freeze([
    'speaker', 'resourceId', 'model', 'uid', 'format', 'sampleRate', 'speed', 'speechRate', 'loudnessRate',
    'emotion', 'emotionScale', 'contextTexts', 'language', 'explicitLanguage', 'disableMarkdownFilter',
    'disableEmojiFilter', 'enableLanguageDetector', 'maxLengthToFilterParenthesis', 'postProcessPitch', 'cacheConfig', 'signal', 'onProgress',
]);

export function speedToSpeechRate(speed) {
    const number = Number.isFinite(speed) ? speed : 1;
    const normalized = number >= 0.5 && number <= 2 ? number : Math.min(2, Math.max(0.5, 1 + number / 100));
    return Math.round((normalized - 1) * 100);
}

/** The configured authentication synthesis defaults used by both playback and public calls. */
export function buildSynthesizeParams({ text, speaker, resourceId }, config) {
    const params = {
        providerMode: 'auth', appId: config.volc.appId, accessKey: config.volc.accessKey,
        resourceId, speaker, text, format: 'mp3', sampleRate: 24000,
        speechRate: speedToSpeechRate(config.volc.speechRate), loudnessRate: 0,
        emotionScale: config.volc.emotionScale, explicitLanguage: config.volc.explicitLanguage,
        disableMarkdownFilter: config.volc.disableMarkdownFilter, disableEmojiFilter: config.volc.disableEmojiFilter,
        enableLanguageDetector: config.volc.enableLanguageDetector,
        maxLengthToFilterParenthesis: config.volc.maxLengthToFilterParenthesis,
        postProcessPitch: config.volc.postProcessPitch,
    };
    if (resourceId === 'seed-tts-1.0' && config.volc.useTts11 !== false) params.model = 'seed-tts-1.1';
    if (config.volc.serverCacheEnabled) params.cacheConfig = { text_type: 1, use_cache: true };
    return params;
}

export function prepareTtsRequest(config, text, input = {}) {
    requireFields(input, TTS_OPTION_FIELDS);
    const options = copyRequest(input);
    if (typeof text !== 'string' || !text.trim()) throw new MediaApiError('invalid_request', { field: 'text' });
    for (const field of ['speaker', 'resourceId', 'model', 'uid', 'format', 'emotion', 'language', 'explicitLanguage']) {
        if (options[field] !== undefined && typeof options[field] !== 'string') throw new MediaApiError('invalid_request', { field });
    }
    for (const field of ['sampleRate', 'speed', 'speechRate', 'loudnessRate', 'emotionScale', 'maxLengthToFilterParenthesis', 'postProcessPitch']) {
        if (options[field] !== undefined && !Number.isFinite(options[field])) throw new MediaApiError('invalid_request', { field });
    }
    for (const field of ['disableMarkdownFilter', 'disableEmojiFilter', 'enableLanguageDetector']) {
        if (options[field] !== undefined && typeof options[field] !== 'boolean') throw new MediaApiError('invalid_request', { field });
    }
    if (options.speed !== undefined && (options.speed < 0.5 || options.speed > 2 || options.speechRate !== undefined)) throw new MediaApiError('invalid_request', { field: 'speed' });
    if (options.language !== undefined && options.explicitLanguage !== undefined) throw new MediaApiError('invalid_request', { field: 'language' });
    if (options.contextTexts !== undefined && (!Array.isArray(options.contextTexts) || options.contextTexts.some(value => typeof value !== 'string'))) throw new MediaApiError('invalid_request', { field: 'contextTexts' });
    if (options.format !== undefined && !Object.hasOwn(TTS_AUDIO_MIMES, options.format)) throw new MediaApiError('invalid_request', { field: 'format' });
    if (options.sampleRate !== undefined && options.sampleRate <= 0) throw new MediaApiError('invalid_request', { field: 'sampleRate' });
    if (options.cacheConfig !== undefined) {
        requireFields(options.cacheConfig, ['text_type', 'use_cache'], 'cacheConfig');
        if (options.cacheConfig.text_type !== undefined && !Number.isInteger(options.cacheConfig.text_type)) throw new MediaApiError('invalid_request', { field: 'cacheConfig.text_type' });
        if (options.cacheConfig.use_cache !== undefined && typeof options.cacheConfig.use_cache !== 'boolean') throw new MediaApiError('invalid_request', { field: 'cacheConfig.use_cache' });
    }
    if (options.resourceId !== undefined && !options.resourceId.trim()) throw new MediaApiError('invalid_request', { field: 'resourceId' });

    const voice = options.speaker ?? config.volc.defaultSpeaker ?? FREE_DEFAULT_VOICE;
    if (!voice) throw new MediaApiError('invalid_request', { field: 'speaker' });
    const configured = config.volc.mySpeakers?.find(item => item.value === voice || item.name === voice);
    const speaker = configured?.value || voice;
    const free = FREE_VOICES.some(item => item.key === speaker);
    if (free) {
        for (const field of Object.keys(options)) {
            if (!['speaker', 'emotion', 'speed'].includes(field)) throw new MediaApiError('unsupported_field', { field });
        }
        return { providerMode: 'free', text: text.trim(), speaker, emotion: options.emotion ?? '', speed: options.speed ?? config.volc.speechRate };
    }
    if (!config.volc.appId || !config.volc.accessKey) throw new MediaApiError('not_configured');
    const resourceId = inferResourceIdBySpeaker(speaker, options.resourceId ?? configured?.resourceId);
    const params = buildSynthesizeParams({ text: text.trim(), speaker, resourceId }, config);
    for (const [key, value] of Object.entries(options)) {
        if (!['speaker', 'speed', 'language'].includes(key)) params[key] = value;
    }
    if (options.speed !== undefined) params.speechRate = speedToSpeechRate(options.speed);
    if (options.language !== undefined) params.explicitLanguage = options.language;
    return params;
}
