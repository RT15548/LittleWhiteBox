// LLM Service

import {
    DEFAULT_SUMMARY_SYSTEM_PROMPT,
    getSummaryAssistantDocPrompt,
    DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT,
    DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT,
    DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT,
    DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT,
    DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT,
    DEFAULT_SUMMARY_USER_CONFIRM_PROMPT,
    DEFAULT_SUMMARY_USER_GENERATE_PROMPT,
} from "../data/config.js";
import { generateFeatureText } from '../../text-api/host.js';
import { tryParseJson } from '../../../shared/common/json-candidate.js';
const SUMMARY_CANCELLED_CODE = 'summary_generation_cancelled';

export function createSummaryGenerationCancelledError() {
    const error = new Error('生成已停止');
    error.name = 'AbortError';
    error.code = SUMMARY_CANCELLED_CODE;
    return error;
}

export function isSummaryGenerationCancelledError(error) {
    return error?.code === SUMMARY_CANCELLED_CODE;
}

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

function buildSummaryMessages(existingSummary, existingFacts, newHistoryText, historyRange, existingEventCount) {
    const summarySystemPrompt = DEFAULT_SUMMARY_SYSTEM_PROMPT;
    const assistantDocPrompt = getSummaryAssistantDocPrompt();
    const assistantAskSummaryPrompt = DEFAULT_SUMMARY_ASSISTANT_ASK_SUMMARY_PROMPT;
    const assistantAskContentPrompt = DEFAULT_SUMMARY_ASSISTANT_ASK_CONTENT_PROMPT;
    const metaProtocolStartPrompt = DEFAULT_SUMMARY_META_PROTOCOL_START_PROMPT;
    const userJsonFormatPrompt = DEFAULT_SUMMARY_USER_JSON_FORMAT_PROMPT;
    const assistantCheckPrompt = DEFAULT_SUMMARY_ASSISTANT_CHECK_PROMPT;
    const userConfirmPrompt = DEFAULT_SUMMARY_USER_CONFIRM_PROMPT;
    const userGeneratePrompt = DEFAULT_SUMMARY_USER_GENERATE_PROMPT;
    const { text: factsText, predicates } = formatFactsForLLM(existingFacts);

    const predicatesHint = predicates.length > 0
        ? `\n\n<\u5df2\u6709\u8c13\u8bcd\uff0c\u8bf7\u590d\u7528>\n${predicates.join('\u3001')}\n</\u5df2\u6709\u8c13\u8bcd\uff0c\u8bf7\u590d\u7528>`
        : '';

    const jsonFormat = userJsonFormatPrompt
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
        { role: 'user', content: userConfirmPrompt },
        { role: 'user', content: userGeneratePrompt }
    ];

    return {
        topMessages,
        bottomMessages,
    };
}


// ═══════════════════════════════════════════════════════════════════════════
// JSON 解析
// ═══════════════════════════════════════════════════════════════════════════

function removeJsonTrailingCommas(value) {
    let output = '';
    let inString = false;
    let escaped = false;
    for (let i = 0; i < value.length; i++) {
        const character = value[i];
        if (inString) {
            output += character;
            if (escaped) escaped = false;
            else if (character === '\\') escaped = true;
            else if (character === '"') inString = false;
            continue;
        }
        if (character === '"') {
            inString = true;
            output += character;
            continue;
        }
        if (character === ',') {
            let next = i + 1;
            while (/\s/u.test(value[next] || '')) next++;
            if (value[next] === '}' || value[next] === ']') continue;
        }
        output += character;
    }
    return output;
}

export function parseSummaryJson(raw) {
    if (!raw) return null;

    let cleaned = String(raw).trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    const candidate = tryParseJson(cleaned);
    if (candidate.ok) {
        const parsed = candidate.value;
        return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    }

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
        const jsonStr = removeJsonTrailingCommas(cleaned.slice(start, end + 1));
        try {
            const parsed = JSON.parse(jsonStr);
            return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
        } catch { return null; }
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 主生成函数
// ═══════════════════════════════════════════════════════════════════════════

export async function generateSummary({
    existingSummary, existingFacts, newHistoryText, historyRange, existingEventCount = 0,
    timeout = 180000, signal = null,
}) {
    if (signal?.aborted) throw createSummaryGenerationCancelledError();
    if (!newHistoryText?.trim()) throw new Error('新对话内容为空');
    const promptData = buildSummaryMessages(existingSummary, existingFacts, newHistoryText, historyRange, existingEventCount);
    try {
        const result = await generateFeatureText('summary', {
            messages: [...promptData.topMessages, ...promptData.bottomMessages],
            signal, timeoutMs: timeout,
        });
        return result.text;
    } catch (error) {
        if (signal?.aborted) throw createSummaryGenerationCancelledError();
        throw error;
    }
}
