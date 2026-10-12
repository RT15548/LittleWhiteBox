import { SERVER_PLUGIN_COPY } from '../../../shared/server-plugin/copy.js';

export const WEB_RESPONSE_BYTES = 2 * 1024 * 1024;
export const WEB_TIMEOUT_MS = 30_000;
const WEB_ERRORS = Object.freeze({
    empty_query: '搜索词不能为空',
    web_search_not_configured: '请填写所选联网渠道的 API Key',
    web_response_too_large: '网页服务返回的内容过大',
    web_invalid_response: '网页服务返回了无效数据',
    web_http_failed: '网页服务请求失败',
    web_timeout: '网页服务请求超时',
    web_request_failed: '无法连接网页服务',
    web_url_invalid: '请输入不含账号密码的公开 HTTP(S) 网页地址',
    web_url_limit: '网页地址数量不符合工具要求',
    web_extract_failed: '网页正文提取失败',
    web_backend_unavailable: `Exa 联网需要小白盒后端。${SERVER_PLUGIN_COPY.install}`,
    web_backend_access_denied: '酒馆拒绝了联网请求，请确认已登录并刷新页面后再试',
    web_backend_invalid_request: '联网后端收到的请求格式无效',
    web_backend_input_limit: '联网请求内容过大',
});

export function redactWebDiagnostic(value, apiKey) {
    const text = String(value ?? '');
    return apiKey ? text.split(apiKey).join('[redacted]') : text;
}

export class WebRequestError extends Error {
    constructor(code, { provider = '', httpStatus, detail = '' } = {}) {
        super([provider, WEB_ERRORS[code] || code, httpStatus, detail].filter(Boolean).join(': '));
        this.name = 'WebRequestError';
        this.code = code;
        this.provider = provider;
        this.httpStatus = httpStatus;
        this.detail = detail;
    }
}

export async function boundedWebText(response) {
    if (Number(response.headers.get('content-length')) > WEB_RESPONSE_BYTES) {
        await response.body?.cancel();
        throw new WebRequestError('web_response_too_large');
    }
    const reader = response.body?.getReader();
    if (!reader) { throw new WebRequestError('web_invalid_response'); }
    const decoder = new TextDecoder();
    let bytes = 0;
    let text = '';
    try {
        while (true) {
            const item = await reader.read();
            if (item.done) break;
            bytes += item.value.byteLength;
            if (bytes > WEB_RESPONSE_BYTES) {
                await reader.cancel();
                throw new WebRequestError('web_response_too_large');
            }
            text += decoder.decode(item.value, { stream: true });
        }
        return text + decoder.decode();
    } finally { reader.releaseLock(); }
}

export async function requestDirectWebJson(provider, path, body, headers, options = {}) {
    if (!provider.apiKey) { throw new WebRequestError('web_search_not_configured', { provider: provider.id }); }
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener('abort', abort, { once: true });
    if (options.signal?.aborted) abort();
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; abort(); }, options.timeoutMs ?? WEB_TIMEOUT_MS);
    try {
        controller.signal.throwIfAborted();
        const response = await (options.fetch ?? globalThis.fetch)(`${provider.baseUrl}${path}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify(body), signal: controller.signal,
            ...(options.redirect ? { redirect: options.redirect } : {}),
        });
        const text = await boundedWebText(response);
        controller.signal.throwIfAborted();
        if (!response.ok) {
            // Preserve provider diagnostics without echoing the configured credential.
            throw new WebRequestError('web_http_failed', { provider: provider.id, httpStatus: response.status,
                detail: redactWebDiagnostic(text, provider.apiKey).slice(0, 2000) });
        }
        try { return JSON.parse(text); }
        catch { throw new WebRequestError('web_invalid_response', { provider: provider.id }); }
    } catch (error) {
        if (options.signal?.aborted) { throw new DOMException('Aborted', 'AbortError'); }
        if (timedOut) { throw new WebRequestError('web_timeout', { provider: provider.id }); }
        if (error instanceof WebRequestError) throw error;
        throw new WebRequestError('web_request_failed', { provider: provider.id,
            detail: redactWebDiagnostic(error?.message || error, provider.apiKey) });
    } finally {
        clearTimeout(timer);
        options.signal?.removeEventListener('abort', abort);
    }
}

export function requireWebResults(payload, provider) {
    if (!payload || !Array.isArray(payload.results)) {
        throw new WebRequestError('web_invalid_response', { provider });
    }
    return payload.results;
}
