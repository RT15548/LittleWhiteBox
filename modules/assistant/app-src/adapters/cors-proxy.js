function getAbsoluteUrl(rawUrl) {
    const text = String(rawUrl || '').trim();
    if (!text) return '';

    try {
        return new URL(text, window.location.origin).toString();
    } catch {
        return '';
    }
}

export function buildCorsProxyUrl(rawUrl) {
    const absoluteUrl = getAbsoluteUrl(rawUrl);
    if (!absoluteUrl) return '';

    const parsed = new URL(absoluteUrl);
    const currentOrigin = window.location.origin;
    if (!['http:', 'https:'].includes(parsed.protocol)) return absoluteUrl;
    if (parsed.origin === currentOrigin) return absoluteUrl;
    if (parsed.pathname.startsWith('/proxy/')) return absoluteUrl;

    return `${currentOrigin}/proxy/${encodeURIComponent(absoluteUrl)}`;
}

export function createCorsProxyFetch(enabled) {
    if (!enabled) return undefined;

    return async function corsProxyFetch(input, init) {
        const rawUrl = typeof input === 'string' || input instanceof URL
            ? String(input)
            : String(input?.url || '');
        const proxiedUrl = buildCorsProxyUrl(rawUrl);

        if (!proxiedUrl || proxiedUrl === rawUrl) {
            return fetch(input, init);
        }

        if (typeof Request !== 'undefined' && input instanceof Request) {
            return fetch(new Request(proxiedUrl, input), init);
        }

        return fetch(proxiedUrl, init);
    };
}
