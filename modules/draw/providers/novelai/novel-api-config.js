// NovelAI API 配置的唯一模型：宿主存储与 iframe 表单共用，不依赖酒馆宿主。
import { normalizeApiPresetState } from '../../shared/api-presets.js';

export const NOVEL_API_DEFAULTS = Object.freeze({
    apiKey: '', apiBaseUrl: '', sendMode: 'frontend', useImageBackendJobs: false, insecureTLS: false,
    timeout: 60000, requestDelay: Object.freeze({ min: 15000, max: 30000 }),
});
export const NOVEL_API_FIELDS = Object.freeze(Object.keys(NOVEL_API_DEFAULTS));

export function normalizeNovelApiConfig(raw = {}) {
    const source = raw && typeof raw === 'object' ? raw : {};
    const delay = source.requestDelay || {};
    const positive = (value, fallback) => Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : fallback;
    const min = positive(delay.min, NOVEL_API_DEFAULTS.requestDelay.min);
    const max = positive(delay.max, NOVEL_API_DEFAULTS.requestDelay.max);
    return {
        apiKey: String(source.apiKey || '').trim(),
        apiBaseUrl: String(source.apiBaseUrl || '').trim(),
        sendMode: source.sendMode === 'backend' ? 'backend' : 'frontend',
        useImageBackendJobs: source.useImageBackendJobs === true,
        insecureTLS: source.insecureTLS === true,
        timeout: Math.min(600000, Math.max(10000, Math.floor(positive(source.timeout, NOVEL_API_DEFAULTS.timeout)))),
        requestDelay: { min: Math.min(min, max), max: Math.max(min, max) },
    };
}

export const NOVEL_API_PRESET_OPTIONS = Object.freeze({ fields: NOVEL_API_FIELDS, normalizeConfig: normalizeNovelApiConfig });

export function normalizeNovelApiPresets(source) {
    return normalizeApiPresetState(source, NOVEL_API_PRESET_OPTIONS);
}
