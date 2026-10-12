import { SERVER_PLUGIN_ID } from '../../../shared/server-plugin/identity.js';

export const WEB_PROVIDERS = Object.freeze([
    { id: 'tavily', label: 'Tavily', baseUrl: 'https://api.tavily.com' },
    { id: 'exa', label: 'Exa', baseUrl: 'https://api.exa.ai' },
]);
export const DEFAULT_WEB_PROVIDER = 'tavily';
export const WEB_SETTINGS_COPY = Object.freeze({ provider: '联网渠道（全局）', key: 'API Key', show: '显示',
    exaBackend: `Exa 官方接口需安装并启用 ${SERVER_PLUGIN_ID}。` });

export function normalizeWebProvider(value) {
    return WEB_PROVIDERS.some(provider => provider.id === value) ? value : DEFAULT_WEB_PROVIDER;
}

export function normalizeWebApiKey(value = '') { return String(value || '').trim(); }

export function normalizeWebBaseUrl(value = '', provider = DEFAULT_WEB_PROVIDER) {
    return String(value || '').trim().replace(/\/+$/, '') || WEB_PROVIDERS.find(item => item.id === provider).baseUrl;
}

/** Global, durable user preferences; partial updates retain the other provider's credentials. */
export function normalizeWebSettings(value = {}, current = {}) {
    return {
        webProvider: normalizeWebProvider(value.webProvider ?? current.webProvider),
        ...Object.fromEntries(WEB_PROVIDERS.flatMap(({ id }) => [
            [`${id}ApiKey`, normalizeWebApiKey(value[`${id}ApiKey`] ?? current[`${id}ApiKey`])],
            [`${id}BaseUrl`, normalizeWebBaseUrl(value[`${id}BaseUrl`] ?? current[`${id}BaseUrl`], id)],
        ])),
    };
}

export function resolveWebProvider(config = {}) {
    const id = normalizeWebProvider(config.webProvider);
    return { ...WEB_PROVIDERS.find(item => item.id === id),
        apiKey: normalizeWebApiKey(config[`${id}ApiKey`]),
        baseUrl: normalizeWebBaseUrl(config[`${id}BaseUrl`], id) };
}

export function isWebConfigured(config = {}) { return Boolean(resolveWebProvider(config).apiKey); }

export function removeWebSettings(config) {
    for (const field of Object.keys(normalizeWebSettings())) { delete config[field]; }
}
