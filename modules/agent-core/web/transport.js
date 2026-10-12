import { requestDirectWebJson } from './http.js';
import { createExaBackendFetch } from './browser-backend.js';
import { WEB_PROVIDERS } from './settings.js';

export { WEB_RESPONSE_BYTES, WEB_TIMEOUT_MS, WebRequestError, redactWebDiagnostic, requireWebResults } from './http.js';

export function requestWebJson(provider, path, body, headers, options = {}) {
    // Native Node consumers already run server-side. Explicit custom relays retain their own CORS contract.
    const useBackend = typeof window !== 'undefined' && provider.id === 'exa'
        && provider.baseUrl === WEB_PROVIDERS.find(item => item.id === 'exa').baseUrl;
    return requestDirectWebJson(provider, path, body, headers, useBackend
        ? { ...options, fetch: createExaBackendFetch(provider, path, options.fetch ?? globalThis.fetch) }
        : options);
}
