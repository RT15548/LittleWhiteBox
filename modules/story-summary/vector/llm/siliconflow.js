// ═══════════════════════════════════════════════════════════════════════════
// siliconflow.js - 仅保留 Embedding
// ═══════════════════════════════════════════════════════════════════════════

const BASE_URL = 'https://api.siliconflow.cn';
const EMBEDDING_MODEL = 'BAAI/bge-m3';

export function getApiKey() {
    try {
        const raw = localStorage.getItem('summary_panel_config');
        if (raw) {
            const parsed = JSON.parse(raw);
            return parsed.vector?.online?.key || null;
        }
    } catch { }
    return null;
}

export async function embed(texts, options = {}) {
    if (!texts?.length) return [];

    const key = getApiKey();
    if (!key) throw new Error('未配置硅基 API Key');

    const { timeout = 30000, signal } = options;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`${BASE_URL}/v1/embeddings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: EMBEDDING_MODEL,
                input: texts,
            }),
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

export { EMBEDDING_MODEL as MODELS };
