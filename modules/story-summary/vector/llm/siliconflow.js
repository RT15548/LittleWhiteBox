// ═══════════════════════════════════════════════════════════════════════════
// siliconflow.js - OpenAI-compatible Embedding + 多 Key 轮询
//
// 在 API Key 输入框中用逗号、分号、竖线或换行分隔多个 Key，例如：
//   sk-aaa,sk-bbb,sk-ccc
// 每次调用自动轮询到下一个 Key，并发请求会均匀分布到所有 Key 上。
// ═══════════════════════════════════════════════════════════════════════════

import { getVectorConfig } from '../../data/config.js';
import { getDefaultApiPrefix, resolveApiBaseUrl } from '../../../../shared/common/openai-url-utils.js';

const BASE_URL = 'https://api.siliconflow.cn';
const DEFAULT_MODEL = 'BAAI/bge-m3';

let _keyIndex = 0;

function getEmbeddingApiConfig() {
    const cfg = getVectorConfig() || {};
    return cfg.embeddingApi || {
        provider: 'siliconflow',
        url: `${BASE_URL}/v1`,
        key: '',
        model: EMBEDDING_MODEL,
    };
}

/**
 * 从 localStorage 解析所有 Key（支持逗号、分号、竖线、换行分隔）
 */
function parseKeys(rawKey) {
    try {
        const keyStr = String(rawKey || '');
        return keyStr
            .split(/[,;|\n]+/)
            .map(k => k.trim())
            .filter(k => k.length > 0);
    } catch { }
    return [];
}

/**
 * 获取下一个可用的 API Key（轮询）
 * 每次调用返回不同的 Key，自动循环
 */
export function getApiKey(rawKey = null) {
    const keys = parseKeys(rawKey ?? getEmbeddingApiConfig().key);
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
    return Math.max(1, parseKeys(getEmbeddingApiConfig().key).length);
}

export async function embed(texts, options = {}) {
    if (!texts?.length) return [];

    const apiCfg = options.apiConfig || getEmbeddingApiConfig();
    const key = getApiKey(apiCfg.key);
    if (!key) throw new Error('未配置 Embedding API Key');

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
        const baseUrl = resolveApiBaseUrl(
            String(apiCfg.url || `${BASE_URL}/v1`),
            getDefaultApiPrefix(apiCfg.provider || 'siliconflow')
        );
        const response = await fetch(`${baseUrl}/embeddings`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: String(apiCfg.model || EMBEDDING_MODEL),
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

export { DEFAULT_MODEL as MODELS };
