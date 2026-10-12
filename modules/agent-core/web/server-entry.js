import { requestDirectWebJson, WebRequestError } from './http.js';
import { resolveWebProvider } from './settings.js';
import { EXA_BACKEND_OPERATIONS } from './backend-contract.js';

export { EXA_BACKEND_PATH, EXA_BACKEND_CAPABILITY, WEB_BACKEND_ERROR_HEADER, WEB_REQUEST_BYTES } from './backend-contract.js';
export { WebRequestError } from './http.js';

export async function requestExaBackend(operation, input, options = {}) {
    if (!EXA_BACKEND_OPERATIONS.includes(operation) || !input || typeof input !== 'object'
        || typeof input.apiKey !== 'string' || !input.apiKey.trim()
        || !input.payload || typeof input.payload !== 'object' || Array.isArray(input.payload)
        || Object.keys(input).some(key => !['apiKey', 'payload'].includes(key))) {
        throw new WebRequestError('web_backend_invalid_request', { provider: 'exa' });
    }
    // The destination and auth header are server-owned; callers cannot forward arbitrary URLs or headers.
    const provider = resolveWebProvider({ webProvider: 'exa', exaApiKey: input.apiKey });
    return await requestDirectWebJson(provider, `/${operation}`, input.payload, { 'x-api-key': provider.apiKey },
        { ...options, redirect: 'error' });
}
