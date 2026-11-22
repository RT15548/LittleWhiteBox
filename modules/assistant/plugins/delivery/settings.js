import { DEFAULT_REQUIREMENTS } from './protocol.js';

// These are preferences for this browser's assistant, not a model preset or a chat turn.
const KEY = 'littlewhitebox.assistant.delivery';

export function loadDeliverySettings(storage = window.localStorage) {
    const saved = JSON.parse(storage.getItem(KEY) ?? '{}');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)
        || (saved.enabled !== undefined && typeof saved.enabled !== 'boolean')
        || (saved.requirements !== undefined && typeof saved.requirements !== 'string')) {
        throw new Error('答复交付设置格式无效');
    }
    return { enabled: saved.enabled === true, requirements: saved.requirements ?? DEFAULT_REQUIREMENTS };
}

export function deliverySettingsForRun(reportError) {
    try {
        return loadDeliverySettings();
    } catch (error) {
        reportError(`无法读取答复交付设置，本轮使用普通回复：${error.message || error}`);
        return { enabled: false, requirements: DEFAULT_REQUIREMENTS };
    }
}

export function saveDeliverySettings({ enabled, requirements }, storage = window.localStorage) {
    const overrides = {
        ...(enabled ? { enabled: true } : {}),
        ...(requirements === DEFAULT_REQUIREMENTS ? {} : { requirements }),
    };
    if (Object.keys(overrides).length) storage.setItem(KEY, JSON.stringify(overrides));
    else storage.removeItem(KEY);
}
