import test from 'node:test';
import assert from 'node:assert/strict';

import { SUMMARY_SYSTEM_PROMPT } from '../app-src/prompts/system-prompt.js';
import { createContextStatsController } from '../app-src/runtime/context-stats.js';
import { createHistoryCompactionController } from '../app-src/runtime/history-compaction.js';

test('context meter estimates during render and sends one complete payload only at the exact budget boundary', async () => {
    const originalFetch = globalThis.fetch;
    const requests = [];
    globalThis.fetch = async (url, options) => {
        requests.push({ url, options });
        return {
            ok: true,
            json: async () => ({ token_count: 47 }),
        };
    };

    try {
        const state = {
            historySummary: '',
            contextStats: {
                usedTokens: 0,
                budgetTokens: 258000,
                summaryActive: false,
            },
        };
        const toolDefinitions = [{ type: 'function', function: { name: 'Read' } }];
        const controller = createContextStatsController({
            state,
            getActiveProviderConfig: () => ({ provider: 'openai-compatible', model: 'gpt-4o-mini' }),
            getToolDefinitions: () => toolDefinitions,
            TOOL_DEFINITIONS: [],
            MAX_CONTEXT_TOKENS: 258000,
        });
        const messages = [
            { role: 'system', content: 'Rules.' },
            { role: 'user', content: 'Inspect the file.' },
        ];

        controller.updateContextStats(messages);
        assert.equal(requests.length, 0);

        await controller.forceUpdateContextStats(messages);
        assert.equal(requests.length, 1);
        assert.equal(requests[0].url, '/api/tokenizers/openai/count?model=gpt-4o-mini');
        assert.deepEqual(JSON.parse(requests[0].options.body), [
            ...messages,
            {
                role: 'system',
                content: `TOOLS\n${JSON.stringify(toolDefinitions)}`,
            },
        ]);
        assert.equal(state.contextStats.usedTokens, 47);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('history summary prompt preserves structured cross-domain memory', () => {
    assert.match(SUMMARY_SYSTEM_PROMPT, /目标是省上下文，不是失忆/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /# 当前目标/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /# 已确认内容/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /# 关键细节/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /# 未解决问题 \/ 下一步/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /# 用户偏好与约束/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /技术排查/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /写卡\/小说\/剧情/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /闲聊\/长期协作/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /不超过 10000 tokens/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /先判断对话类型/);
    assert.match(SUMMARY_SYSTEM_PROMPT, /不要把具体事实洗成/);
});

test('history compaction source includes full archived tool details', async () => {
    const longToolDetail = [
        '12 export const fragileConfig = true;',
        '13 export function boot() {}',
        'x'.repeat(1200),
        '1401 exactTechnicalMarkerAfterOldTinyLimit();',
    ].join('\n');
    const state = {
        messages: [
            { role: 'user', content: '检查这个配置为什么失效。' },
            {
                role: 'assistant',
                content: '',
                toolCalls: [{
                    name: 'Read',
                    arguments: '{"filePath":"modules/demo.js"}',
                }],
            },
            {
                role: 'tool',
                toolName: 'Read',
                content: '{}',
            },
            { role: 'assistant', content: '结论是 fragileConfig 没有被导出。' },
            { role: 'user', content: '继续。' },
        ],
        archivedTurnCount: 0,
        historySummary: '旧结论：modules/old.js 里有 pending 状态。',
        contextStats: { usedTokens: 999 },
        progressLabel: '',
        uiMessageWindowLimit: 100,
    };
    let summarySource = '';
    let summaryRequest = null;
    const toasts = [];
    const controller = createHistoryCompactionController({
        state,
        render() {},
        persistSession() {},
        showToast(message) {
            toasts.push(message);
        },
        getActiveProviderConfig() {
            return {
                temperature: 0.7,
                maxTokens: 12000,
                reasoning: { mode: 'on', effort: 'high', output: 'hide' },
            };
        },
        formatToolResultDisplay(message) {
            assert.equal(message.toolName, 'Read');
            return {
                summary: '已读取文件：modules/demo.js',
                details: longToolDetail,
            };
        },
        buildTextWithAttachmentSummary(text) {
            return text;
        },
        trimForSummary(text, limit = 1800) {
            const normalized = String(text || '').replace(/\s+/g, ' ').trim();
            if (normalized.length <= limit) return normalized;
            return `${normalized.slice(0, limit)}…`;
        },
        SUMMARY_SYSTEM_PROMPT,
        DEFAULT_PRESERVED_TURNS: 1,
        MIN_PRESERVED_TURNS: 1,
        SUMMARY_TRIGGER_TOKENS: 1,
        HISTORY_SUMMARY_MAX_TOKENS: 10000,
        buildContextMeterLabel() {
            return '999 tokens';
        },
        async forceUpdateContextStats() {
            state.contextStats.usedTokens = 999;
        },
        toProviderMessages(messages) {
            return messages;
        },
    });

    await controller.ensureContextBudget({
        async chat(request) {
            summaryRequest = request;
            summarySource = request.messages[0].content;
            return { text: '压缩后的摘要' };
        },
    }, new AbortController().signal);

    assert.equal(summaryRequest?.maxTokens, 10000);
    assert.deepEqual(summaryRequest?.reasoning, { mode: 'inherit', output: 'hide' });
    assert.match(summarySource, /已有历史摘要（当前记忆底稿/);
    assert.match(summarySource, /modules\/old\.js/);
    assert.match(summarySource, /工具输出详情:\n12 export const fragileConfig = true/);
    assert.match(summarySource, /exactTechnicalMarkerAfterOldTinyLimit/);
    assert.equal(state.uiMessageWindowLimit, 5);

    state.messages = [
        { role: 'user', content: '这段摘要调用会失败。' },
        { role: 'assistant', content: '需要保留的本地降级内容。' },
        { role: 'user', content: '继续当前任务。' },
    ];
    state.archivedTurnCount = 0;
    state.contextStats.usedTokens = 999;
    await controller.ensureContextBudget({
        async chat() {
            throw new Error('summary request failed');
        },
    }, new AbortController().signal);

    assert.equal(toasts.includes('历史摘要生成失败，已使用本地降级摘要。'), true);
    assert.match(state.historySummary, /压缩后的摘要/);
    assert.match(state.historySummary, /需要保留的本地降级内容/);
});

test('history compaction propagates cancellation without mutating archived history', async () => {
    const originalMessages = [
        { role: 'user', content: '需要归档的第一轮。' },
        { role: 'assistant', content: '第一轮答复。' },
        { role: 'user', content: '需要归档的第二轮。' },
        { role: 'assistant', content: '第二轮答复。' },
        { role: 'user', content: '保留当前轮。' },
    ];
    const state = {
        messages: structuredClone(originalMessages),
        archivedTurnCount: 0,
        historySummary: '取消前的摘要',
        contextStats: { usedTokens: 999 },
        progressLabel: '',
        uiMessageWindowLimit: 100,
    };
    const toasts = [];
    let persistCount = 0;
    const controller = createHistoryCompactionController({
        state,
        render() {},
        persistSession() { persistCount += 1; },
        showToast(message) { toasts.push(message); },
        getActiveProviderConfig() { return { maxTokens: 12000 }; },
        formatToolResultDisplay() { return {}; },
        buildTextWithAttachmentSummary(text) { return text; },
        trimForSummary(text, limit = 1800) { return String(text || '').slice(0, limit); },
        SUMMARY_SYSTEM_PROMPT,
        DEFAULT_PRESERVED_TURNS: 1,
        MIN_PRESERVED_TURNS: 1,
        SUMMARY_TRIGGER_TOKENS: 1,
        HISTORY_SUMMARY_MAX_TOKENS: 10000,
        buildContextMeterLabel() { return '999 tokens'; },
        async forceUpdateContextStats() { state.contextStats.usedTokens = 999; },
        toProviderMessages(messages) { return messages; },
    });
    const abortError = new DOMException('The operation was aborted.', 'AbortError');

    await assert.rejects(
        controller.ensureContextBudget({
            async chat() { throw abortError; },
        }, new AbortController().signal),
        error => error === abortError,
    );

    assert.equal(state.historySummary, '取消前的摘要');
    assert.equal(state.archivedTurnCount, 0);
    assert.deepEqual(state.messages, originalMessages);
    assert.equal(persistCount, 0);
    assert.deepEqual(toasts, []);
});
