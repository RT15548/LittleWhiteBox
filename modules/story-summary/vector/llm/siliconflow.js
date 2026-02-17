// ═══════════════════════════════════════════════════════════════════════════
// siliconflow.js - Embedding + 多 Key 轮询
//
// 在 API Key 输入框中用逗号、分号、竖线或换行分隔多个 Key，例如：
//   sk-aaa,sk-bbb,sk-ccc
// 每次调用自动轮询到下一个 Key，并发请求会均匀分布到所有 Key 上。
// ═══════════════════════════════════════════════════════════════════════════

const BASE_URL = 'https://api.siliconflow.cn';
const EMBEDDING_MODEL = 'BAAI/bge-m3';

// ★ 多 Key 轮询状态
let _keyIndex = 0;

/**
 * 从 localStorage 解析所有 Key（支持逗号、分号、竖线、换行分隔）
 */
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

/**
 * 获取下一个可用的 API Key（轮询）
 * 每次调用返回不同的 Key，自动循环
 */
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

/**
 * 获取当前配置的 Key 数量（供外部模块动态调整并发用）
 */
export function getKeyCount() {
    return Math.max(1, parseKeys().length);
}

// ═══════════════════════════════════════════════════════════════════════════
// Embedding
// ═══════════════════════════════════════════════════════════════════════════

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
