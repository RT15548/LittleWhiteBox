import { requestWebJson, requireWebResults, WebRequestError, redactWebDiagnostic } from './transport.js';

export async function searchExa(provider, query, maxResults, options) {
    const payload = await requestWebJson(provider, '/search', {
        query, numResults: maxResults, contents: { highlights: true },
    }, { 'x-api-key': provider.apiKey }, options);
    return requireWebResults(payload, provider.id).map(item => ({
        title: String(item.title || '').trim(), url: String(item.url || '').trim(),
        content: Array.isArray(item.highlights) ? item.highlights.join('\n\n') : '', score: Number(item.score || 0),
    }));
}

export async function contentsExa(provider, urls, options) {
    const payload = await requestWebJson(provider, '/contents', { urls, text: true },
        { 'x-api-key': provider.apiKey }, options);
    const results = requireWebResults(payload, provider.id);
    if (!Array.isArray(payload.statuses)) { throw new WebRequestError('web_invalid_response', { provider: provider.id }); }
    const canonicalUrl = value => {
        try { return new URL(value).href; }
        catch { throw new WebRequestError('web_invalid_response', { provider: provider.id }); }
    };
    // We request URLs, so statuses.id identifies the requested URL. A result's id is a document ID, not its URL.
    const succeeded = new Set(payload.statuses.filter(item => item.status === 'success').map(item => canonicalUrl(item.id)));
    return {
        results: results.filter(item => succeeded.has(canonicalUrl(item.url))).map(item => ({
            url: String(item.url), title: String(item.title || ''), text: String(item.text || ''),
        })),
        failures: payload.statuses.filter(item => item.status === 'error').map(item => ({
            url: String(item.id), code: redactWebDiagnostic(item.error?.tag || 'web_source_unavailable', provider.apiKey),
            ...(item.error?.httpStatusCode != null ? { httpStatus: item.error.httpStatusCode } : {}),
        })),
        requestId: redactWebDiagnostic(payload.requestId, provider.apiKey),
    };
}
