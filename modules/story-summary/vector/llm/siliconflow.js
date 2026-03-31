// siliconflow.js - Embedding + API key rotation

const BASE_URL = 'https://api.siliconflow.cn';
const DEFAULT_MODEL = 'BAAI/bge-m3';

let _keyIndex = 0;

function parseKeys() {
    try {
        const raw = localStorage.getItem('summary_panel_config');
        if (raw) {
            const parsed = JSON.parse(raw);
            const keyStr = parsed.vector?.online?.key || '';
            return keyStr
                .split(/[,;|\n]+/)
                .map(k => k.trim())
                .filter(k => k.length > 0);
        }
    } catch { }
    return [];
}

export function getApiKey() {
    const keys = parseKeys();
    if (!keys.length) return null;
    if (keys.length === 1) return keys[0];

    const idx = _keyIndex % keys.length;
    const key = keys[idx];
    _keyIndex = (_keyIndex + 1) % keys.length;
    const masked = key.length > 10 ? key.slice(0, 6) + '***' + key.slice(-4) : '***';
    console.log(`[SiliconFlow] 使用 Key ${idx + 1}/${keys.length}: ${masked}`);
    return key;
}

export function getKeyCount() {
    return Math.max(1, parseKeys().length);
}

export async function embed(texts, options = {}) {
    if (!texts?.length) return [];

    const key = getApiKey();
    if (!key) throw new Error('未配置硅基 API Key');

    const {
        model = DEFAULT_MODEL,
        dimensions,
        timeout = 30000,
        signal,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const body = {
        model,
        input: texts,
    };
    if (Number.isFinite(dimensions) && dimensions > 0) {
        body.dimensions = dimensions;
    }

    try {
        const response = await fetch(`${BASE_URL}/v1/embeddings`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: signal || controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`Embedding ${response.status}: ${errorText.slice(0, 200)}`);
        }

        const data = await response.json();
        return (data.data || [])
            .sort((a, b) => a.index - b.index)
            .map(item => Array.isArray(item.embedding) ? item.embedding : Array.from(item.embedding));
    } finally {
        clearTimeout(timeoutId);
    }
}

export { DEFAULT_MODEL as MODELS };
