// LLM Service

import {
    DEFAULT_SUMMARY_SYSTEM_PROMPT,
    DEFAULT_SUMMARY_ASSISTANT_DOC_PROMPT,
    DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT,
    DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT,
    DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT,
    DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT,
    DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT,
    DEFAULT_SUMMARY_USER_CONFIRM_PROMPT,
    DEFAULT_SUMMARY_ASSISTANT_PREFILL_PROMPT,
} from "../data/config.js";
import { getRequestHeaders } from "../../../../../../../script.js";
import { getStreamingReply } from "../../../../../../../scripts/openai.js";
import { getDefaultApiPrefix, resolveApiBaseUrl } from "../../../shared/common/openai-url-utils.js";
import {
    buildHostOpenAICompatibleGeneratePayload,
    createHostChatCompletion,
    setHostChatCompletionsRequestHeadersProvider,
    streamHostChatCompletion,
} from "../../../shared/host-llm/chat-completions/client.js";
import { xbLog } from "../../../core/debug-core.js";

const PROVIDER_MAP = {
    openai: "openai",
    google: "gemini",
    gemini: "gemini",
    claude: "claude",
    anthropic: "claude",
    deepseek: "deepseek",
    cohere: "cohere",
};

const JSON_PREFILL = DEFAULT_SUMMARY_ASSISTANT_PREFILL_PROMPT;
const HOST_GENERATION_PROVIDERS = new Set(['openai']);
const SUMMARY_GENERATION_TIMEOUT_MS = 180_000;

// ═══════════════════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════════════════

function b64UrlEncode(str) {
    const utf8 = new TextEncoder().encode(String(str));
    let bin = '';
    utf8.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function getStreamingModule() {
    const mod = window.xiaobaixStreamingGeneration;
    return mod?.xbgenrawCommand ? mod : null;
}

function waitForStreamingComplete(sessionId, streamingMod, timeout = SUMMARY_GENERATION_TIMEOUT_MS) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const poll = () => {
            const { isStreaming, text } = streamingMod.getStatus(sessionId);
            if (!isStreaming) return resolve(text || '');
            if (Date.now() - start > timeout) return reject(new Error('生成超时'));
            setTimeout(poll, 300);
        };
        poll();
    });
}

function createTimeoutSignal(timeout) {
    const controller = new AbortController();
    let timedOut = false;
    let timer = null;
    if (timeout > 0) {
        timer = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, timeout);
    }
    return {
        signal: controller.signal,
        isTimedOut: () => timedOut,
        cleanup: () => {
            if (timer) clearTimeout(timer);
        },
    };
}

function flattenMessageContent(content) {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.map(part => {
            if (typeof part === 'string') return part;
            if (part?.type === 'text' && typeof part.text === 'string') return part.text;
            return '';
        }).join('');
    }
    return '';
}

function extractHostMessageText(data) {
    const choice = data?.choices?.[0] || {};
    const message = choice.message || {};
    return String(
        flattenMessageContent(message.content)
        || message.reasoning_content
        || choice.text
        || data?.content?.[0]?.text
        || data?.content
        || data?.reasoning_content
        || ''
    );
}

function mergeStreamText(current, incoming) {
    const next = String(incoming || '');
    const previous = String(current || '');
    if (!next) return previous;
    if (!previous) return next;
    if (next.startsWith(previous)) return next;
    return `${previous}${next}`;
}

function shouldUseHostGeneration(llmApi = {}) {
    const provider = normalizeSummaryProvider(llmApi.provider);
    return HOST_GENERATION_PROVIDERS.has(provider);
}

function normalizeSummaryProvider(provider) {
    const value = String(provider || 'st').trim().toLowerCase();
    return value === 'custom' ? 'openai' : value;
}

function buildHostMessages(promptData) {
    return [
        ...(Array.isArray(promptData.topMessages) ? promptData.topMessages : []),
        ...(Array.isArray(promptData.bottomMessages) ? promptData.bottomMessages : []),
        { role: 'assistant', content: promptData.assistantPrefill },
    ].filter(message => String(message?.content || '').trim());
}

function buildHostTask(genParams = {}) {
    return {
        temperature: genParams.temperature ?? undefined,
        top_p: genParams.top_p ?? undefined,
        top_k: genParams.top_k ?? undefined,
        presence_penalty: genParams.presence_penalty ?? undefined,
        frequency_penalty: genParams.frequency_penalty ?? undefined,
    };
}

function attachSamplingParams(payload, genParams = {}) {
    if (genParams.top_p != null) payload.top_p = genParams.top_p;
    if (genParams.top_k != null) payload.top_k = genParams.top_k;
    if (genParams.presence_penalty != null) payload.presence_penalty = genParams.presence_penalty;
    if (genParams.frequency_penalty != null) payload.frequency_penalty = genParams.frequency_penalty;
    return payload;
}

async function callHostSummaryGeneration(promptData, llmApi = {}, genParams = {}, useStream = true, timeout = SUMMARY_GENERATION_TIMEOUT_MS) {
    const provider = normalizeSummaryProvider(llmApi.provider);
    const model = String(llmApi.model || '').trim();
    if (!model) {
        throw new Error('请先填写总结模型 ID');
    }

    setHostChatCompletionsRequestHeadersProvider(() => getRequestHeaders());
    const payload = attachSamplingParams(buildHostOpenAICompatibleGeneratePayload(
        {
            baseUrl: resolveApiBaseUrl(llmApi.url, getDefaultApiPrefix(provider)),
            apiKey: llmApi.key,
            model,
        },
        buildHostTask(genParams),
        buildHostMessages(promptData),
        !!useStream,
    ), genParams);

    const abortable = createTimeoutSignal(Number(timeout) || SUMMARY_GENERATION_TIMEOUT_MS);
    try {
        if (!useStream) {
            const data = await createHostChatCompletion(payload, { signal: abortable.signal });
            return extractHostMessageText(data);
        }

        let output = '';
        let streamError = null;
        const state = { reasoning: '', images: [], signature: '', toolSignatures: {} };
        await streamHostChatCompletion(payload, (event) => {
            const rawData = event?.data ?? event;
            if (typeof rawData === 'string' && rawData !== '[DONE]') {
                try {
                    const parsed = JSON.parse(rawData);
                    const message = parsed?.error?.message || parsed?.message || '';
                    if (message) {
                        streamError = new Error(message);
                        return;
                    }
                } catch {}
            }
            if (streamError) return;
            const chunk = getStreamingReply(event, state, {
                chatCompletionSource: payload.chat_completion_source,
                overrideShowThoughts: true,
            });
            output = mergeStreamText(output, chunk);
        }, { signal: abortable.signal });
        if (streamError) throw streamError;
        return output;
    } catch (error) {
        if (abortable.isTimedOut()) {
            throw new Error('生成超时');
        }
        throw error;
    } finally {
        abortable.cleanup();
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// 提示词构建
// ═══════════════════════════════════════════════════════════════════════════

function formatFactsForLLM(facts) {
    if (!facts?.length) {
        return { text: '（空白，尚无事实记录）', predicates: [] };
    }

    const predicates = [...new Set(facts.map(f => f.p).filter(Boolean))];

    const lines = facts.map(f => {
        if (f.trend) {
            return `- ${f.s} | ${f.p} | ${f.o} [${f.trend}]`;
        }
        return `- ${f.s} | ${f.p} | ${f.o}`;
    });

    return {
        text: lines.join('\n') || '（空白，尚无事实记录）',
        predicates,
    };
}

function buildSummaryMessages(existingSummary, existingFacts, newHistoryText, historyRange, nextEventId, existingEventCount) {
    const summarySystemPrompt = DEFAULT_SUMMARY_SYSTEM_PROMPT;
    const assistantDocPrompt = DEFAULT_SUMMARY_ASSISTANT_DOC_PROMPT;
    const assistantAskSummaryPrompt = DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT;
    const assistantAskContentPrompt = DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT;
    const metaProtocolStartPrompt = DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT;
    const userJsonFormatPrompt = DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT;
    const assistantCheckPrompt = DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT;
    const userConfirmPrompt = DEFAULT_SUMMARY_USER_CONFIRM_PROMPT;
    const assistantPrefillPrompt = DEFAULT_SUMMARY_ASSISTANT_PREFILL_PROMPT;
    const { text: factsText, predicates } = formatFactsForLLM(existingFacts);

    const predicatesHint = predicates.length > 0
        ? `\n\n<\u5df2\u6709\u8c13\u8bcd\uff0c\u8bf7\u590d\u7528>\n${predicates.join('\u3001')}\n</\u5df2\u6709\u8c13\u8bcd\uff0c\u8bf7\u590d\u7528>`
        : '';

    const jsonFormat = userJsonFormatPrompt
        .replace(/\{\$nextEventId\}/g, String(nextEventId))
        .replace(/\{nextEventId\}/g, String(nextEventId))
        .replace(/\{\$historyRange\}/g, String(historyRange ?? ''))
        .replace(/\{historyRange\}/g, String(historyRange ?? ''));

    const checkContent = assistantCheckPrompt
        .replace(/\{\$existingEventCount\}/g, String(existingEventCount))
        .replace(/\{existingEventCount\}/g, String(existingEventCount));

    const topMessages = [
        { role: 'system', content: summarySystemPrompt },
        { role: 'assistant', content: assistantDocPrompt },
        { role: 'assistant', content: assistantAskSummaryPrompt },
        { role: 'user', content: `<\u5df2\u6709\u603b\u7ed3\u72b6\u6001>\n${existingSummary}\n</\u5df2\u6709\u603b\u7ed3\u72b6\u6001>\n\n<\u5f53\u524d\u4e8b\u5b9e\u56fe\u8c31>\n${factsText}\n</\u5f53\u524d\u4e8b\u5b9e\u56fe\u8c31>${predicatesHint}` },
        { role: 'assistant', content: assistantAskContentPrompt },
        { role: 'user', content: `<\u65b0\u5bf9\u8bdd\u5185\u5bb9>\uff08${historyRange}\uff09\n${newHistoryText}\n</\u65b0\u5bf9\u8bdd\u5185\u5bb9>` }
    ];

    const bottomMessages = [
        { role: 'user', content: metaProtocolStartPrompt + '\n' + jsonFormat },
        { role: 'assistant', content: checkContent },
        { role: 'user', content: userConfirmPrompt }
    ];

    return {
        top64: b64UrlEncode(JSON.stringify(topMessages)),
        bottom64: b64UrlEncode(JSON.stringify(bottomMessages)),
        assistantPrefill: assistantPrefillPrompt,
        topMessages,
        bottomMessages,
    };
}


// ═══════════════════════════════════════════════════════════════════════════
// JSON 解析
// ═══════════════════════════════════════════════════════════════════════════

export function parseSummaryJson(raw) {
    if (!raw) return null;

    let cleaned = String(raw).trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch { }

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
        let jsonStr = cleaned.slice(start, end + 1)
            .replace(/,(\s*[}\]])/g, '$1');
        try {
            return JSON.parse(jsonStr);
        } catch { }
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 主生成函数
// ═══════════════════════════════════════════════════════════════════════════

export async function generateSummary(options) {
    const {
        existingSummary,
        existingFacts,
        newHistoryText,
        historyRange,
        nextEventId,
        existingEventCount = 0,
        llmApi = {},
        genParams = {},
        useStream = true,
        timeout = SUMMARY_GENERATION_TIMEOUT_MS,
        sessionId = 'xb_summary'
    } = options;

    if (!newHistoryText?.trim()) {
        throw new Error('新对话内容为空');
    }

    const promptData = buildSummaryMessages(
        existingSummary,
        existingFacts,
        newHistoryText,
        historyRange,
        nextEventId,
        existingEventCount
    );

    if (shouldUseHostGeneration(llmApi)) {
        const rawOutput = await callHostSummaryGeneration(promptData, llmApi, genParams, useStream, timeout);
        if (xbLog.isEnabled()) {
            xbLog.info("storySummaryLlm", `LLM输出(len=${rawOutput?.length || 0}): ${String(rawOutput || "").slice(0, 1200)}`);
        }
        return JSON_PREFILL + rawOutput;
    }

    const streamingMod = getStreamingModule();
    if (!streamingMod) {
        throw new Error('生成模块未加载');
    }

    const args = {
        as: 'user',
        nonstream: useStream ? 'false' : 'true',
        top64: promptData.top64,
        bottom64: promptData.bottom64,
        bottomassistant: promptData.assistantPrefill,
        id: sessionId,
    };

    if (llmApi.provider && llmApi.provider !== 'st') {
        const mappedApi = PROVIDER_MAP[normalizeSummaryProvider(llmApi.provider)];
        if (mappedApi) {
            args.api = mappedApi;
            if (llmApi.url) args.apiurl = resolveApiBaseUrl(llmApi.url, getDefaultApiPrefix(llmApi.provider));
            if (llmApi.key) args.apipassword = llmApi.key;
            if (llmApi.model) args.model = llmApi.model;
        }
    }

    if (genParams.temperature != null) args.temperature = genParams.temperature;
    if (genParams.top_p != null) args.top_p = genParams.top_p;
    if (genParams.top_k != null) args.top_k = genParams.top_k;
    if (genParams.presence_penalty != null) args.presence_penalty = genParams.presence_penalty;
    if (genParams.frequency_penalty != null) args.frequency_penalty = genParams.frequency_penalty;

    let rawOutput;
    if (useStream) {
        const sid = await streamingMod.xbgenrawCommand(args, '');
        rawOutput = await waitForStreamingComplete(sid, streamingMod, timeout);
    } else {
        rawOutput = await streamingMod.xbgenrawCommand(args, '');
    }

    if (xbLog.isEnabled()) {
        xbLog.info("storySummaryLlm", `LLM输出(len=${rawOutput?.length || 0}): ${String(rawOutput || "").slice(0, 1200)}`);
    }

    return JSON_PREFILL + rawOutput;
}
