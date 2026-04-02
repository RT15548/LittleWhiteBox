// ═══════════════════════════════════════════════════════════════════════════
// vector/llm/llm-service.js - 修复 prefill 传递方式
// ═══════════════════════════════════════════════════════════════════════════
import { xbLog } from '../../../../core/debug-core.js';
import { getApiKey } from './siliconflow.js';

const MODULE_ID = 'vector-llm-service';
const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1';
const DEFAULT_L0_MODEL = 'Qwen/Qwen3-8B';

let callCounter = 0;

function getStreamingModule() {
    const mod = window.xiaobaixStreamingGeneration;
    return mod?.xbgenrawCommand ? mod : null;
}

function generateUniqueId(prefix = 'llm') {
    callCounter = (callCounter + 1) % 100000;
    return `${prefix}-${callCounter}-${Date.now().toString(36)}`;
}

function b64UrlEncode(str) {
    const utf8 = new TextEncoder().encode(String(str));
    let bin = '';
    utf8.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * 统一LLM调用 - 走酒馆后端（非流式）
 * 临时改为标准 messages 调用，避免 bottomassistant prefill 兼容性问题。
 */
export async function callLLM(messages, options = {}) {
    const {
        temperature = 0.2,
        max_tokens = 500,
        timeout = 40000,
    } = options;

    const mod = getStreamingModule();
    if (!mod) throw new Error('Streaming module not ready');

    const apiKey = getApiKey() || '';
    if (!apiKey) {
        throw new Error('L0 requires siliconflow API key');
    }

    const topMessages = [...messages].filter(msg => msg?.role !== 'assistant');

    const top64 = b64UrlEncode(JSON.stringify(topMessages));
    const uniqueId = generateUniqueId('l0');

    const args = {
        as: 'user',
        nonstream: 'true',
        top64,
        id: uniqueId,
        temperature: String(temperature),
        max_tokens: String(max_tokens),
        api: 'openai',
        apiurl: SILICONFLOW_API_URL,
        apipassword: apiKey,
        model: DEFAULT_L0_MODEL,
    };
    const isQwen3 = String(DEFAULT_L0_MODEL || '').includes('Qwen3');
    if (isQwen3) {
        args.enable_thinking = 'false';
    }

    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`L0 request timeout after ${timeout}ms`)), timeout);
        });
        const result = await Promise.race([
            mod.xbgenrawCommand(args, ''),
            timeoutPromise,
        ]);
        return String(result ?? '');
    } catch (e) {
        xbLog.error(MODULE_ID, 'LLM调用失败', e);
        throw e;
    }
}

export function parseJson(text) {
    if (!text) return null;
    let s = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try { return JSON.parse(s); } catch { }
    const i = s.indexOf('{'), j = s.lastIndexOf('}');
    if (i !== -1 && j > i) try { return JSON.parse(s.slice(i, j + 1)); } catch { }
    return null;
}
