import { getHostRequestHeaders } from '../../../shared/host-request-headers.js';
import { SERVER_PLUGIN_BASE } from '../../../shared/server-plugin/identity.js';
import { boundedWebText, WebRequestError, redactWebDiagnostic } from './http.js';
import { EXA_BACKEND_PATH, WEB_BACKEND_ERROR_HEADER } from './backend-contract.js';

export function createExaBackendFetch(provider, path, fetchImpl) {
    return async (_url, request) => {
        // Host apps use the current Tavern context; the assistant iframe uses its registered host bridge.
        const headers = globalThis.SillyTavern
            ? globalThis.SillyTavern.getContext().getRequestHeaders()
            : await getHostRequestHeaders();
        request.signal.throwIfAborted();
        const response = await fetchImpl(`${SERVER_PLUGIN_BASE}${EXA_BACKEND_PATH}${path}`, {
            method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
            credentials: 'same-origin', redirect: 'error', signal: request.signal,
            body: JSON.stringify({ apiKey: provider.apiKey, payload: JSON.parse(request.body) }),
        });
        if (response.headers.get(WEB_BACKEND_ERROR_HEADER)) {
            const text = await boundedWebText(response);
            let error;
            try { error = JSON.parse(text); }
            catch { throw new WebRequestError('web_invalid_response', { provider: provider.id }); }
            if (!error || typeof error.code !== 'string') {
                throw new WebRequestError('web_invalid_response', { provider: provider.id });
            }
            throw new WebRequestError(error.code, { provider: provider.id, httpStatus: error.httpStatus,
                detail: redactWebDiagnostic(error.detail, provider.apiKey) });
        }
        if (response.status === 404 || response.status === 401 || response.status === 403) {
            await response.body?.cancel();
            throw new WebRequestError(response.status === 404 ? 'web_backend_unavailable' : 'web_backend_access_denied',
                { provider: provider.id, httpStatus: response.status });
        }
        return response;
    };
}
