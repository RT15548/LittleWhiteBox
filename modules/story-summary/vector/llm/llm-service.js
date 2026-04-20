// ═══════════════════════════════════════════════════════════════════════════
// vector/llm/llm-service.js - L0 前端直连 Chat Completions
// ═══════════════════════════════════════════════════════════════════════════
import { xbLog } from '../../../../core/debug-core.js';
import { getVectorConfig } from '../../data/config.js';
import { getDefaultApiPrefix, resolveApiBaseUrl } from '../../../openai-url-utils.js';

const MODULE_ID = 'vector-llm-service';
const DEFAULT_L0_MODEL = 'Qwen/Qwen3-8B';
const DEFAULT_L0_API_URL = 'https://api.siliconflow.cn/v1';

const activeL0Controllers = new Set();
let l0KeyIndex = 0;

function getL0ApiConfig() {
    const cfg = getVectorConfig() || {};
    return cfg.l0Api || {
        provider: 'siliconflow',
        url: DEFAULT_L0_API_URL,
        key: '',
        model: DEFAULT_L0_MODEL,
    };
}

function normalizeL0ApiConfig(apiConfig = null) {
    const fallback = getL0ApiConfig();
    const next = apiConfig || {};
    return {
        provider: String(next.provider || fallback.provider || 'siliconflow').trim(),
        url: String(next.url || fallback.url || DEFAULT_L0_API_URL).trim(),
        key: String(next.key || fallback.key || '').trim(),
        model: String(next.model || fallback.model || DEFAULT_L0_MODEL).trim(),
    };
}

function getNextKey(rawKey) {
    const keys = String(rawKey || '')
        .split(/[,;|\n]+/)
        .map(k => k.trim())
        .filter(Boolean);
    if (!keys.length) return '';
    if (keys.length === 1) return keys[0];
    const idx = l0KeyIndex % keys.length;
    l0KeyIndex = (l0KeyIndex + 1) % keys.length;
    return keys[idx];
}

function normalizeMessages(messages) {
    if (!Array.isArray(messages)) return [];
    return messages
        .filter(msg => {
            if (!msg || typeof msg !== 'object') return false;
            const role = String(msg.role || '').trim();
            const content = msg.content;
            if (!role) return false;
            if (typeof content === 'string') return content.trim().length > 0;
            return content != null;
        })
        .map(msg => ({
            role: String(msg.role).trim(),
            content: msg.content,
        }));
}

function mergeSignals(primary, secondary) {
    if (!primary) return secondary;
    if (!secondary) return primary;

    const controller = new AbortController();
    const abort = () => controller.abort();

    if (primary.aborted || secondary.aborted) {
        abort();
        return controller.signal;
    }

    primary.addEventListener('abort', abort, { once: true });
    secondary.addEventListener('abort', abort, { once: true });
    return controller.signal;
}

function extractMessageText(data) {
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content
            .map(part => {
                if (typeof part === 'string') return part;
                if (part?.type === 'text' && typeof part.text === 'string') return part.text;
                return '';
            })
            .join('');
    }
    return '';
}

/**
 * 统一 L0 调用 - 浏览器直连 OpenAI-compatible Chat Completions（非流式）
 */
export async function callLLM(messages, options = {}) {
    const {
        temperature = 0.2,
        max_tokens = 500,
        timeout = 40000,
        apiConfig = null,
        signal = null,
    } = options;

    const apiCfg = normalizeL0ApiConfig(apiConfig);
    const apiKey = getNextKey(apiCfg.key);
    if (!apiKey) {
        throw new Error('L0 requires siliconflow API key');
    }

    const normalizedMessages = normalizeMessages(messages);
    if (!normalizedMessages.length) {
        throw new Error('L0 requires at least one valid message');
    }

    const model = String(apiCfg.model || DEFAULT_L0_MODEL).trim();
    const baseUrl = resolveApiBaseUrl(
        String(apiCfg.url || DEFAULT_L0_API_URL).trim(),
        getDefaultApiPrefix(apiCfg.provider || 'openai')
    );
    const body = {
        model,
        messages: normalizedMessages,
        temperature,
        max_tokens,
        stream: false,
    };
    if (model.toLowerCase().includes('qwen3')) {
        body.enable_thinking = false;
    }

    const timeoutController = new AbortController();
    const requestSignal = mergeSignals(signal, timeoutController.signal);
    let timedOut = false;
    const timeoutId = setTimeout(() => {
        timedOut = true;
        timeoutController.abort();
    }, timeout);

    try {
        activeL0Controllers.add(timeoutController);
        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: requestSignal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`L0 API ${response.status}: ${errorText.slice(0, 200)}`);
        }

        const data = await response.json();
        return String(extractMessageText(data) ?? '');
    } catch (e) {
        clearTimeout(timeoutId);
        if (e?.name === 'AbortError' && timedOut) {
            throw new Error(`L0 request timeout after ${timeout}ms`);
        }
        xbLog.error(MODULE_ID, 'LLM调用失败', e);
        throw e;
    } finally {
        clearTimeout(timeoutId);
        activeL0Controllers.delete(timeoutController);
    }
}

export async function testL0Service(apiConfig = {}) {
    if (!apiConfig?.key) {
        throw new Error('请配置 L0 API Key');
    }
    const result = await callLLM([
        { role: 'system', content: '你是一个测试助手。请只输出 OK。' },
        { role: 'user', content: '只输出 OK' },
    ], {
        apiConfig,
        temperature: 0,
        max_tokens: 16,
        timeout: 15000,
    });
    const text = String(result || '').trim();
    if (!text) throw new Error('返回为空');
    return { success: true, message: `连接成功：${text.slice(0, 60)}` };
}

export function cancelAllL0Requests() {
    for (const controller of activeL0Controllers) {
        try { controller.abort(); } catch {}
    }
    activeL0Controllers.clear();
}

export function parseJson(text) {
    if (!text) return null;
    let s = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try { return JSON.parse(s); } catch { }
    const i = s.indexOf('{'), j = s.lastIndexOf('}');
    if (i !== -1 && j > i) try { return JSON.parse(s.slice(i, j + 1)); } catch { }
    return null;
}
