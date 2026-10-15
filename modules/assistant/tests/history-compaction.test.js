import test from 'node:test';
import assert from 'node:assert/strict';

import { SUMMARY_SYSTEM_PROMPT } from '../app-src/prompts/system-prompt.js';
import { createContextStatsController } from '../app-src/runtime/context-stats.js';
import { createHistoryCompactionController } from '../app-src/runtime/history-compaction.js';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';
import { createAssistantRuntime } from '../app-src/runtime.js';
import { estimateConversationTokens } from '../../agent-core/runtime/context-tokens.js';

test('assistant estimates track the current replayed reasoning and tool definitions', () => {
    const state = { historySummary: '', contextStats: {} };
    const config = { provider: 'openai-compatible', model: 'deepseek-chat', reasoning: { mode: 'on' } };
    const tools = [{ type: 'function', function: { name: 'Read', parameters: {} } }];
    const preserved = { role: 'assistant', content: '', reasoning_content: 'thinking '.repeat(1000) };
    const messages = [{ role: 'assistant', content: '', providerPayload: { openaiCompatibleMessage: preserved } },
        { role: 'user', content: 'next' }];
    const controller = createContextStatsController({ state, MAX_CONTEXT_TOKENS: 258000,
        getToolDefinitions: () => tools, getActiveProviderConfig: () => config });
    const initial = controller.updateContextStats(messages);
    assert.equal(initial, estimateConversationTokens({ messages, tools, providerConfig: config }));
    assert.equal(state.contextStats.source, 'estimated');
    preserved.reasoning_content += 'more reasoning '.repeat(1000);
    assert.ok(controller.updateContextStats(messages) > initial);
    config.reasoning.mode = 'off';
    const withoutReasoning = controller.updateContextStats(messages);
    assert.ok(withoutReasoning < initial);
    preserved.reasoning_content += 'not replayed';
    assert.equal(controller.updateContextStats(messages), withoutReasoning);
    tools.push({ type: 'function', function: { name: 'Search', parameters: { query: { type: 'string' } } } });
    assert.ok(controller.updateContextStats(messages) > withoutReasoning);
    assert.equal(controller.updateContextStats(messages, []),
        estimateConversationTokens({ messages, tools: [], providerConfig: config }));
});

test('replayed historical reasoning alone triggers local compaction and cancellation leaves history untouched', async () => {
    const state = { messages: [
        { role: 'user', content: 'old' },
        { role: 'assistant', content: 'answer', providerPayload: { openaiCompatibleMessage: {
            role: 'assistant', content: 'answer', reasoning_content: 'r'.repeat(800000),
        } } },
        { role: 'user', content: 'next' },
    ], historySummary: '', archivedTurnCount: 0, contextStats: {} };
    const config = { provider: 'openai-compatible', model: 'deepseek-chat', reasoning: { mode: 'on' } };
    const tools = [{ type: 'function', function: { name: 'Read', parameters: {} } }];
    const meter = createContextStatsController({ state, MAX_CONTEXT_TOKENS: 258000, TOOL_DEFINITIONS: tools,
        getActiveProviderConfig: () => config });
    assert.ok(estimateConversationTokens({ messages: state.messages, tools }) < 228000);
    assert.ok(meter.updateContextStats(state.messages) > 228000);
    const controller = createHistoryCompactionController({ state, ...meter,
        render() {}, persistSession() {}, showToast() {}, getActiveProviderConfig: () => config,
        buildTextWithAttachmentSummary: text => text, trimForSummary: text => text,
        SUMMARY_SYSTEM_PROMPT, DEFAULT_PRESERVED_TURNS: 1, MIN_PRESERVED_TURNS: 1,
        SUMMARY_TRIGGER_TOKENS: 228000,
        toProviderMessages: messages => [{ role: 'system', content: state.historySummary }, ...messages],
    });
    let summaries = 0;
    const adapter = { chat: async () => { summaries++; return { text: 'summary' }; } };
    const originalMessages = structuredClone(state.messages);
    await assert.rejects(controller.ensureContextBudget(adapter, AbortSignal.abort()), { name: 'AbortError' });
    assert.deepEqual(state.messages, originalMessages);
    assert.equal(state.historySummary, '');
    assert.equal(summaries, 0);
    const result = await controller.ensureContextBudget(adapter);
    assert.equal(summaries, 1);
    assert.equal(state.historySummary, 'summary');
    assert.deepEqual(state.messages, [{ role: 'user', content: 'next' }]);
    assert.ok(state.contextStats.usedTokens < 228000);
    assert.equal(state.contextStats.source, 'estimated');
    assert.ok(result.every(m => !m.providerPayload));
});

test('assistant tool continuations never request Host counting and restart native sessions after local compaction', async t => {
    let headerRequests = 0;
    setHostChatCompletionsRequestHeadersProvider(() => { headerRequests++; return {}; });
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    for (const mode of ['stateless', 'session', 'oversize-tool', 'compact-session']) { await t.test(mode, async t => {
        const state = { messages: [{ role: 'user', content: '开始任务' }], historySummary: '', archivedTurnCount: 0 };
        if (mode === 'compact-session') state.messages.unshift(
            { role: 'user', content: '旧任务' }, { role: 'assistant', content: 'r'.repeat(500000) });
        const toolText = mode === 'oversize-tool' ? 'r'.repeat(900000)
            : mode === 'compact-session' ? 'r'.repeat(350000) : '工具结果';
        const requests = [], pending = new Map();
        const run = { id: 'test', controller: new AbortController(), toolRequestIds: new Set() };
        state.activeRun = run;
        const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 403 }));
        const runtime = createAssistantRuntime({ state, pendingToolCalls: pending, pendingApprovals: new Map(),
            render() {}, persistSession() {}, showToast() {}, createRequestId: () => 'tool-request',
            post(type, payload) { if (type === 'xb-assistant:tool-call') pending.get(payload.requestId).resolve({ ok: true, text: toolText }); },
            safeJsonParse: JSON.parse, describeError: String, isAbortError: e => e?.name === 'AbortError',
            formatToolResultDisplay: message => ({ details: message.content }),
            buildTextWithAttachmentSummary: text => text, buildUserContentParts: message => message.content,
            normalizeAttachments: value => value || [], normalizeThoughtBlocks: value => value || [],
            getActiveProviderConfig: () => ({ provider: 'google', model: 'gemini-test' }),
            SYSTEM_PROMPT: '规则', SUMMARY_SYSTEM_PROMPT: '总结', HISTORY_SUMMARY_PREFIX: '记忆',
            MAX_CONTEXT_TOKENS: 258000, SUMMARY_TRIGGER_TOKENS: 228000,
            DEFAULT_PRESERVED_TURNS: 1, MIN_PRESERVED_TURNS: 1, MAX_TOOL_ROUNDS: 4, REQUEST_TIMEOUT_MS: 1000,
            TOOL_DEFINITIONS: [], TOOL_NAMES: { READ: 'Read' },
            createAdapter: () => ({ supportsSessionToolLoop: mode !== 'stateless', async chat(request) {
                if (request.toolChoice === 'none') return { text: '历史摘要' };
                requests.push(request);
                return requests.length === 1 ? { text: '', toolCalls: [{ id: 'read', name: 'Read', arguments: '{}' }] } : { text: '完成' };
            } }),
        });
        await runtime.runAssistantLoop(run);
        assert.equal(requests.length, 2);
        assert.equal(fetch.mock.callCount(), 0);
        assert.equal(headerRequests, 0);
        assert.equal(state.messages.at(-1).content, '完成');
        assert.equal(state.contextStats.source, 'estimated');
        if (mode === 'session' || mode === 'oversize-tool') assert.equal(requests[1].toolResponses.length, 1);
        else {
            assert.equal(requests[1].toolResponses, undefined);
            assert.ok(Array.isArray(requests[1].messages));
            assert.ok(requests[1].messages.some(m => m.role === 'tool'));
        }
        if (mode === 'compact-session') {
            assert.ok(state.historySummary);
            assert.ok(!requests[1].messages.some(m => m.content === '旧任务'));
            assert.ok(state.contextStats.usedTokens < 228000);
        }
    }); }
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
        buildContextMeterLabel() {
            return '999 tokens';
        },
        updateContextStats() {
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

    assert.equal(summaryRequest?.maxTokens, 12000);
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
        buildContextMeterLabel() { return '999 tokens'; },
        updateContextStats() { state.contextStats.usedTokens = 999; },
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
