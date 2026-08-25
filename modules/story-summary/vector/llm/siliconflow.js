// ═══════════════════════════════════════════════════════════════════════════
// siliconflow.js - OpenAI-compatible Embedding + 多 Key 轮询
//
// 在 API Key 输入框中用逗号、分号、竖线或换行分隔多个 Key，例如：
//   sk-aaa,sk-bbb,sk-ccc
// 每次调用自动轮询到下一个 Key，并发请求会均匀分布到所有 Key 上。
// ═══════════════════════════════════════════════════════════════════════════

import { getVectorConfig } from '../../data/config.js';
import { getDefaultApiPrefix, resolveApiBaseUrl } from '../../../../shared/common/openai-url-utils.js';
import { mergeAbortSignals } from '../../../../shared/common/abort-utils.js';
import { xbLog } from '../../../../core/debug-core.js';
import {
    createEmbeddingFailureError,
    readEmbeddingVectors,
} from './embedding-failure.js';

const BASE_URL = 'https://api.siliconflow.cn';
const EMBEDDING_MODEL = 'BAAI/bge-m3';

// ★ 多 Key 轮询状态
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
    if (xbLog.isEnabled()) {
        console.log(`[SiliconFlow] 使用 Key ${idx + 1}/${keys.length}: ${masked}`);
    }
    return key;
}

/**
 * 获取当前配置的 Key 数量（供外部模块动态调整并发用）
 */
export function getKeyCount() {
    return Math.max(1, parseKeys(getEmbeddingApiConfig().key).length);
}

// ═══════════════════════════════════════════════════════════════════════════
// Embedding
// ═══════════════════════════════════════════════════════════════════════════

export async function embed(texts, options = {}) {
    if (!texts?.length) return [];

    const apiCfg = options.apiConfig || getEmbeddingApiConfig();
    const key = getApiKey(apiCfg.key);
    if (!key) {
        throw createEmbeddingFailureError(
            '未配置 Embedding API Key',
            { kind: 'configuration' },
        );
    }

    const { timeout = 30000, signal } = options;
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, timeout);
    const requestSignal = mergeAbortSignals(signal, controller.signal);

    try {
        const baseUrl = resolveApiBaseUrl(
            String(apiCfg.url || `${BASE_URL}/v1`),
            getDefaultApiPrefix(apiCfg.provider || 'siliconflow')
        );
        let endpoint;
        try {
            endpoint = new URL(`${baseUrl}/embeddings`);
            if (endpoint.protocol !== 'http:' && endpoint.protocol !== 'https:') throw new TypeError('unsupported protocol');
        } catch (error) {
            throw createEmbeddingFailureError(
                'Embedding API URL 无效',
                { kind: 'configuration_url' },
                error,
            );
        }
        const response = await fetch(endpoint.href, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: String(apiCfg.model || EMBEDDING_MODEL),
                input: texts,
            }),
            signal: requestSignal,
        });

        if (!response.ok) {
            throw createEmbeddingFailureError(
                `Embedding HTTP ${response.status}`,
                { kind: 'http', status: response.status },
            );
        }

        let data;
        try {
            data = await response.json();
        } catch (error) {
            if (error?.name === 'AbortError') throw error;
            if (error instanceof TypeError) throw error;
            throw createEmbeddingFailureError(
                'Embedding API 响应不是有效 JSON',
                { kind: 'invalid_response' },
                error,
            );
        }
        return readEmbeddingVectors(data, texts.length);
    } catch (error) {
        if (signal?.aborted) throw error;
        if (error?.embeddingFailure) throw error;
        if (error?.name === 'AbortError' && timedOut) {
            throw createEmbeddingFailureError(
                `Embedding request timeout after ${timeout}ms`,
                { kind: 'timeout' },
                error,
            );
        }
        if (error instanceof TypeError) {
            throw createEmbeddingFailureError(
                `Embedding network error: ${error.message}`,
                { kind: 'network' },
                error,
            );
        }
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
}

export { EMBEDDING_MODEL as MODELS };
