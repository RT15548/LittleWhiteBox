export const TAVILY_TOOL_NAME = 'web_search';
export const DEFAULT_TAVILY_BASE_URL = 'https://api.tavily.com';

const DEFAULT_TAVILY_MAX_RESULTS = 5;
const MAX_TAVILY_MAX_RESULTS = 8;

export function normalizeTavilyApiKey(value = '') {
    return String(value || '').trim();
}

export function normalizeTavilyBaseUrl(value = '') {
    return String(value || '').trim().replace(/\/+$/, '') || DEFAULT_TAVILY_BASE_URL;
}

export function normalizeTavilyMaxResults(value, fallback = DEFAULT_TAVILY_MAX_RESULTS) {
    const numeric = Math.floor(Number(value));
    if (!Number.isFinite(numeric) || numeric <= 0) {
        return fallback;
    }
    return Math.max(1, Math.min(MAX_TAVILY_MAX_RESULTS, numeric));
}

export function isTavilyConfigured(config = {}) {
    return Boolean(normalizeTavilyApiKey(config.tavilyApiKey));
}

export function getTavilySearchToolDefinition() {
    return {
        type: 'function',
        function: {
            name: TAVILY_TOOL_NAME,
            description: [
                'Use Tavily to search real-world facts, public documents, or time-sensitive information not available in the current book or imported sources.',
                'Use for real locations, historical background, institutions, professional details, daily-life facts, period facts, public references, or outside research. For book text, imported sources, and setting continuity, prefer LS / Grep / Read.',
                'Use focused queries. Verify facts first, then convert results into writing, setting, or review judgments. Do not treat web results as imported book sources.',
                'Only available when this tool appears in the tool list. If absent, do not claim to have searched the web.',
            ].join('\n'),
            parameters: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Focused and specific search query, for example `1997 Hong Kong police ranks` or `Kyoto Gion machiya layout`.' },
                    maxResults: { type: 'number', description: 'Optional number of results to return. Default 5, max 8.' },
                },
                required: ['query'],
                additionalProperties: false,
            },
        },
    };
}

function normalizeTavilyResult(item = {}) {
    return {
        title: String(item.title || '').trim(),
        url: String(item.url || '').trim(),
        content: String(item.content || '').trim(),
        score: Number(item.score || 0),
    };
}

export async function searchWithTavily(config = {}, options = {}) {
    const query = String(options.query || '').trim();
    if (!query) {
        throw new Error('empty_query');
    }
    const apiKey = normalizeTavilyApiKey(config.tavilyApiKey);
    if (!apiKey) {
        throw new Error('web_search_not_configured');
    }
    const baseUrl = normalizeTavilyBaseUrl(config.tavilyBaseUrl);
    const maxResults = normalizeTavilyMaxResults(options.maxResults);

    const response = await fetch(`${baseUrl}/search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            api_key: apiKey,
            query,
            max_results: maxResults,
            search_depth: 'advanced',
            include_answer: false,
            include_raw_content: false,
        }),
        signal: options.signal,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`tavily_search_failed:${response.status}:${errorText}`);
    }

    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        throw new Error(`tavily_search_invalid_json:${error instanceof Error ? error.message : String(error || 'json_parse_failed')}`);
    }

    return (Array.isArray(payload?.results) ? payload.results : [])
        .map((item) => normalizeTavilyResult(item))
        .filter((item) => item.title || item.content || item.url);
}

export function formatTavilySearchResults(results = []) {
    if (!Array.isArray(results) || !results.length) {
        return '没有找到联网结果。';
    }
    return results.map((result, index) => [
        `结果 ${index + 1}`,
        `标题：${result.title || '未命名'}`,
        `链接：${result.url || 'N/A'}`,
        `相关度：${result.score || 0}`,
        `摘要：${result.content || '无摘要'}`,
    ].join('\n')).join('\n\n');
}

export function buildTavilySearchTracePayload(result = {}) {
    const payload = [];
    const query = String(result.query || '').trim();
    if (query) {
        payload.push({ label: '搜索词', text: query });
    }
    if (Number.isFinite(Number(result.count))) {
        payload.push({ label: '结果数', text: String(Number(result.count)) });
    }
    const topTitles = (Array.isArray(result.results) ? result.results : [])
        .slice(0, 3)
        .map((item) => String(item?.title || '').trim())
        .filter(Boolean);
    if (topTitles.length) {
        payload.push({ label: '命中', text: topTitles.join('；') });
    }
    return payload;
}

export function buildTavilySearchToolResult(query = '', results = [], maxResults = DEFAULT_TAVILY_MAX_RESULTS) {
    const normalizedQuery = String(query || '').trim();
    const normalizedResults = Array.isArray(results) ? results : [];
    const count = normalizedResults.length;
    return {
        ok: true,
        query: normalizedQuery,
        maxResults: normalizeTavilyMaxResults(maxResults),
        count,
        results: normalizedResults,
        summary: count
            ? `已联网搜索“${normalizedQuery}”，返回 ${count} 条结果。`
            : `已联网搜索“${normalizedQuery}”，没有找到结果。`,
    };
}

export function buildTavilySearchFailureResult(query = '', error) {
    const raw = String(error?.message || error || 'tavily_search_failed');
    const [code, status, detail] = raw.split(':');
    if (code === 'empty_query') {
        return {
            ok: false,
            query: String(query || '').trim(),
            error: 'empty_query',
            raw,
            message: '搜索词不能为空。',
        };
    }
    if (code === 'web_search_not_configured') {
        return {
            ok: false,
            query: String(query || '').trim(),
            error: 'web_search_not_configured',
            raw,
            message: '当前还没有填写 Tavily API Key。',
        };
    }
    if (code === 'tavily_search_invalid_json') {
        return {
            ok: false,
            query: String(query || '').trim(),
            error: 'tavily_search_invalid_json',
            raw,
            message: `Tavily 返回了无法解析的结果：${detail || 'invalid_json'}`,
        };
    }
    if (code === 'tavily_search_failed') {
        return {
            ok: false,
            query: String(query || '').trim(),
            error: 'tavily_search_failed',
            raw,
            message: `Tavily 搜索失败（${status || 'unknown'}）：${detail || 'request_failed'}`,
        };
    }
    return {
        ok: false,
        query: String(query || '').trim(),
        error: code || 'tavily_search_failed',
        raw,
        message: raw,
    };
}

export async function runTavilySearchTool(config = {}, args = {}, options = {}) {
    const query = String(args.query || '').trim();
    const maxResults = normalizeTavilyMaxResults(args.maxResults);

    if (!query) {
        return buildTavilySearchFailureResult(query, 'empty_query');
    }
    if (!isTavilyConfigured(config)) {
        return buildTavilySearchFailureResult(query, 'web_search_not_configured');
    }

    try {
        const results = await searchWithTavily(config, {
            query,
            maxResults,
            signal: options.signal,
        });
        return buildTavilySearchToolResult(query, results, maxResults);
    } catch (error) {
        if (typeof options.isAbortError === 'function' && options.isAbortError(error)) {
            throw error;
        }
        if (error?.name === 'AbortError') {
            throw error;
        }
        return buildTavilySearchFailureResult(query, error);
    }
}
