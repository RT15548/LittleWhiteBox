import { resolveWebProvider } from './settings.js';
import { WebRequestError } from './transport.js';
import { searchTavily, contentsTavily } from './tavily.js';
import { searchExa, contentsExa } from './exa.js';

export const WEB_LIMITS = Object.freeze({ defaultResults: 5, maxResults: 8, urls: 2 });
const adapters = { tavily: { search: searchTavily, contents: contentsTavily }, exa: { search: searchExa, contents: contentsExa } };

export function normalizeWebMaxResults(value, fallback = WEB_LIMITS.defaultResults) {
    const numeric = Math.floor(Number(value));
    return Number.isFinite(numeric) && numeric > 0 ? Math.min(WEB_LIMITS.maxResults, numeric) : fallback;
}

export function publicWebUrl(value) {
    try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password
            || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)
            || /\.(localhost|local|internal)$/i.test(url.hostname)) { throw new Error(); }
        return url.href;
    } catch { throw new WebRequestError('web_url_invalid'); }
}

export async function searchWeb(config = {}, options = {}) {
    const query = String(options.query || '').trim();
    if (!query) throw new WebRequestError('empty_query');
    const provider = resolveWebProvider(config);
    const maxResults = normalizeWebMaxResults(options.maxResults);
    return (await adapters[provider.id].search(provider, query, maxResults, options))
        .filter(item => item.title || item.url || item.content).slice(0, maxResults);
}

export async function fetchWebContents(config, inputUrls, options = {}) {
    if (!Array.isArray(inputUrls) || inputUrls.length < 1 || inputUrls.length > WEB_LIMITS.urls) {
        throw new WebRequestError('web_url_limit');
    }
    const urls = [...new Set(inputUrls.map(publicWebUrl))];
    const provider = resolveWebProvider(config);
    const received = await adapters[provider.id].contents(provider, urls, options);
    const failuresByUrl = new Map();
    for (const failure of received.failures) {
        let url;
        try { url = publicWebUrl(failure.url); } catch { continue; }
        if (urls.includes(url)) failuresByUrl.set(url, { ...failure, url });
    }
    const texts = new Map();
    for (const item of received.results) {
        let url;
        try { url = publicWebUrl(item.url); } catch { continue; }
        if (urls.includes(url) && !failuresByUrl.has(url) && item.text.trim()) texts.set(url, { ...item, url });
    }
    const failures = urls.filter(url => !texts.has(url)).map(url => failuresByUrl.get(url) ?? { url, code: 'web_source_unavailable' });
    return {
        provider: provider.id, ...(received.requestId ? { requestId: received.requestId } : {}),
        results: urls.filter(url => texts.has(url)).map(url => texts.get(url)),
        failures, failedUrls: failures.map(failure => failure.url),
    };
}
