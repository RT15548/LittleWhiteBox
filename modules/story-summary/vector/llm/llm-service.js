// ═══════════════════════════════════════════════════════════════════════════
// vector/llm/llm-service.js - 修复 prefill 传递方式
// ═══════════════════════════════════════════════════════════════════════════
import { xbLog } from '../../../../core/debug-core.js';
import { getVectorConfig } from '../../data/config.js';

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
 * assistant prefill 用 bottomassistant 参数传递
 */
export async function callLLM(messages, options = {}) {
    const {
        temperature = 0.2,
        max_tokens = 500,
    } = options;

    const mod = getStreamingModule();
    if (!mod) throw new Error('Streaming module not ready');

    const cfg = getVectorConfig();
    const apiKey = cfg?.online?.key || '';
    if (!apiKey) {
        throw new Error('L0 requires siliconflow API key');
    }

    // 分离 assistant prefill
    let topMessages = [...messages];
    let assistantPrefill = '';

    if (topMessages.length > 0 && topMessages[topMessages.length - 1]?.role === 'assistant') {
        const lastMsg = topMessages.pop();
        assistantPrefill = lastMsg.content || '';
    }

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

    // ★ 用 bottomassistant 参数传递 prefill
    if (assistantPrefill) {
        args.bottomassistant = assistantPrefill;
    }

    try {
        const result = await mod.xbgenrawCommand(args, '');
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
