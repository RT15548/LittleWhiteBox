import { requestWebJson, requireWebResults, redactWebDiagnostic } from './transport.js';

export async function searchTavily(provider, query, maxResults, options) {
    const payload = await requestWebJson(provider, '/search', {
        api_key: provider.apiKey, query, max_results: maxResults,
        search_depth: 'advanced', include_answer: false, include_raw_content: false,
    }, {}, options);
    return requireWebResults(payload, provider.id).map(item => ({
        title: String(item.title || '').trim(), url: String(item.url || '').trim(),
        content: String(item.content || '').trim(), score: Number(item.score || 0),
    }));
}

export async function contentsTavily(provider, urls, options) {
    const payload = await requestWebJson(provider, '/extract', {
        urls, extract_depth: 'basic', format: 'text', include_images: false,
    }, { Authorization: `Bearer ${provider.apiKey}` }, options);
    return {
        results: requireWebResults(payload, provider.id).map(item => ({
            url: String(item.url || ''), title: String(item.title || ''), text: String(item.raw_content || ''),
        })),
        failures: (payload.failed_results ?? []).map(item => ({
            url: String(item.url || ''), code: 'web_source_unavailable',
            message: redactWebDiagnostic(item.error, provider.apiKey),
        })),
        requestId: redactWebDiagnostic(payload.request_id, provider.apiKey),
    };
}
