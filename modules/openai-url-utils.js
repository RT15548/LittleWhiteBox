export function normalizeApiBaseUrl(url) {
    return String(url || '').trim().replace(/\/+$/, '');
}

export function normalizeApiPrefix(prefix) {
    const raw = String(prefix || '').trim();
    if (!raw) return '';
    return `/${raw.replace(/^\/+/, '').replace(/\/+$/, '')}`;
}

export function hasExplicitApiVersion(url) {
    const baseUrl = normalizeApiBaseUrl(url);
    return /\/v\d[\w.-]*$/i.test(baseUrl);
}

export function getDefaultApiPrefix(provider) {
    const key = String(provider || '').trim().toLowerCase();
    if (key === 'google' || key === 'gemini') return '/v1beta';
    return '/v1';
}

export function resolveApiBaseUrl(url, defaultPrefix = '') {
    const baseUrl = normalizeApiBaseUrl(url);
    const prefix = normalizeApiPrefix(defaultPrefix);
    if (!baseUrl || !prefix || hasExplicitApiVersion(baseUrl)) return baseUrl;
    if (baseUrl.toLowerCase().endsWith(prefix.toLowerCase())) return baseUrl;
    return `${baseUrl}${prefix}`;
}

export function joinApiUrl(baseUrl, path) {
    const normalizedBase = normalizeApiBaseUrl(baseUrl);
    const normalizedPath = String(path || '').startsWith('/') ? String(path || '') : `/${String(path || '')}`;
    return normalizedBase ? `${normalizedBase}${normalizedPath}` : normalizedPath;
}

export function getModelListCandidateUrls(url, defaultPrefix = '') {
    const baseUrl = normalizeApiBaseUrl(url);
    if (!baseUrl) return [];

    const candidates = [joinApiUrl(baseUrl, '/models')];
    const resolvedBase = resolveApiBaseUrl(baseUrl, defaultPrefix);
    if (resolvedBase && resolvedBase !== baseUrl) {
        candidates.push(joinApiUrl(resolvedBase, '/models'));
    }

    return [...new Set(candidates)];
}
