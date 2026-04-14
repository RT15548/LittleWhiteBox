// LLM Service

import {
    getSummaryPanelConfig,
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
import { getDefaultApiPrefix, resolveApiBaseUrl } from "../../openai-url-utils.js";

const PROVIDER_MAP = {
    openai: "openai",
    google: "gemini",
    gemini: "gemini",
    claude: "claude",
    anthropic: "claude",
    deepseek: "deepseek",
    cohere: "cohere",
    custom: "custom",
};

const JSON_PREFILL = DEFAULT_SUMMARY_ASSISTANT_PREFILL_PROMPT;

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

function waitForStreamingComplete(sessionId, streamingMod, timeout = 120000) {
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
    const promptCfg = getSummaryPanelConfig()?.prompts || {};
    const summarySystemPrompt = String(promptCfg.summarySystemPrompt || DEFAULT_SUMMARY_SYSTEM_PROMPT).trim() || DEFAULT_SUMMARY_SYSTEM_PROMPT;
    const assistantDocPrompt = String(promptCfg.summaryAssistantDocPrompt || DEFAULT_SUMMARY_ASSISTANT_DOC_PROMPT).trim() || DEFAULT_SUMMARY_ASSISTANT_DOC_PROMPT;
    const assistantAskSummaryPrompt = String(promptCfg.summaryAssistantAskSummaryPrompt || DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT).trim() || DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT;
    const assistantAskContentPrompt = String(promptCfg.summaryAssistantAskContentPrompt || DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT).trim() || DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT;
    const metaProtocolStartPrompt = String(promptCfg.summaryMetaProtocolStartPrompt || DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT).trim() || DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT;
    const userJsonFormatPrompt = String(promptCfg.summaryUserJsonFormatPrompt || DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT).trim() || DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT;
    const assistantCheckPrompt = String(promptCfg.summaryAssistantCheckPrompt || DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT).trim() || DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT;
    const userConfirmPrompt = String(promptCfg.summaryUserConfirmPrompt || DEFAULT_SUMMARY_USER_CONFIRM_PROMPT).trim() || DEFAULT_SUMMARY_USER_CONFIRM_PROMPT;
    const assistantPrefillPrompt = String(promptCfg.summaryAssistantPrefillPrompt || DEFAULT_SUMMARY_ASSISTANT_PREFILL_PROMPT).trim() || DEFAULT_SUMMARY_ASSISTANT_PREFILL_PROMPT;
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
        assistantPrefill: assistantPrefillPrompt
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
        timeout = 120000,
        sessionId = 'xb_summary'
    } = options;

    if (!newHistoryText?.trim()) {
        throw new Error('新对话内容为空');
    }

    const streamingMod = getStreamingModule();
    if (!streamingMod) {
        throw new Error('生成模块未加载');
    }

    const promptData = buildSummaryMessages(
        existingSummary,
        existingFacts,
        newHistoryText,
        historyRange,
        nextEventId,
        existingEventCount
    );

    const args = {
        as: 'user',
        nonstream: useStream ? 'false' : 'true',
        top64: promptData.top64,
        bottom64: promptData.bottom64,
        bottomassistant: promptData.assistantPrefill,
        id: sessionId,
    };

    if (llmApi.provider && llmApi.provider !== 'st') {
        const mappedApi = PROVIDER_MAP[String(llmApi.provider).toLowerCase()];
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

    console.group('%c[Story-Summary] LLM输出', 'color: #7c3aed; font-weight: bold');
    console.log(rawOutput);
    console.groupEnd();

    return JSON_PREFILL + rawOutput;
}
