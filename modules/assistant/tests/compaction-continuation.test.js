import assert from 'node:assert/strict';
import test from 'node:test';
import { createAssistantRuntime } from '../app-src/runtime.js';
import { TOOL_NAMES, TOOL_DEFINITIONS, formatToolResultDisplay } from '../app-src/tooling.js';
import { SUMMARY_TOOLS } from '../app-src/runtime/summary-request.js';
import { summaryResult, summarySource } from './helpers/summary.js';

// Contract: a single user action writes once, compacts, then reads and answers in the same run.
// Breaking this loses the user's task or re-executes an already committed write.
for (const { sessions, skip } of [{sessions: false}, {sessions: true}, {sessions: true, skip: true}]) test(
    'write → ' + (skip ? 'reject longer summary' : 'compact') + ' → read → answer, session transport: ' + sessions, async t => {
    t.mock.method(console, 'info', () => {});
    const run = { id: 'island', controller: new AbortController(), toolRequestIds: new Set(), workspaceBaseline: [] };
    const user = '开始写我的卡';
    const state = { activeRun: run, messages: [{ role: 'user', content: user }], compactions: [] };
    const files = new Map([['runtime/api.ts', 'API fixture']]);
    const pendingToolCalls = new Map(), operations = [], main = [], stages = new Set();
    let nextId = 0, summaries = 0;
    const call = (name, args) => ({ text: '', toolCalls: [{ id: name, name, arguments: JSON.stringify(args) }] });
    const adapter = {
        supportsSessionToolLoop: sessions,
        async chat(request) {
            if (request.tools.some(tool => tool.function.name === SUMMARY_TOOLS.submit)) {
                assert.equal(state.compactionPending, true);
                summaries++;
                return summaryResult(skip && summarySource(request).includes('END-OF-WRITE') ? 'm'.repeat(28000) : 'The island definition has been written.');
            }
            main.push(request);
            if (main.length === 1) return call('Write', { filePath: 'local/island.json', content: 'x'.repeat(24000) + 'END-OF-WRITE' });
            if (main.length === 2) return call('Read', { filePath: 'runtime/api.ts' });
            assert.equal(main.length, 3);
            request.onStreamProgress({ text: '岛屿卡完成。' });
            return { text: '岛屿卡完成。' };
        },
    };
    const runtime = createAssistantRuntime({
        state, TOOL_NAMES, TOOL_DEFINITIONS, pendingToolCalls, pendingApprovals: new Map(),
        render() { if (state.compactionPending) stages.add('pending'); }, persistSession() {}, showToast() {},
        post(type, payload) {
            if (type !== 'xb-assistant:tool-call') return;
            operations.push(payload.name);
            if (payload.name === 'Write') files.set(payload.arguments.filePath, payload.arguments.content);
            const result = { ok: true, content: payload.name === 'Read' ? files.get(payload.arguments.filePath) : 'saved' };
            queueMicrotask(() => pendingToolCalls.get(payload.requestId).resolve(result));
        },
        createRequestId: () => 'island-' + ++nextId, safeJsonParse: JSON.parse, describeError: error => error.message,
        formatToolResultDisplay, buildTextWithAttachmentSummary: text => text, buildUserContentParts: m => m.content,
        normalizeAttachments: () => [], normalizeThoughtBlocks: () => [], normalizeSlashSkillTrigger: () => '',
        getActiveProviderConfig: () => ({ provider: 'openai-compatible', maxTokens: 1000 }),
        getToolDefinitions: () => TOOL_DEFINITIONS.filter(tool => ['Write', 'Read'].includes(tool.function.name)),
        SYSTEM_PROMPT: 'Fixture', HISTORY_SUMMARY_PREFIX: 'Memory',
        MAX_CONTEXT_TOKENS: 15000, SUMMARY_TRIGGER_TOKENS: 5000, REQUEST_TIMEOUT_MS: 1200,
        isAbortError: error => error.name === 'AbortError', createAdapter: () => adapter,
    });
    await runtime.runAssistantLoop(run);
    assert.deepEqual(operations, ['Write', 'Read']);
    assert.ok(files.get('local/island.json').endsWith('END-OF-WRITE'));
    assert.ok(summaries > 0 && stages.has('pending'));
    assert.equal(state.compactions.length, 1);
    if (skip) {
        assert.equal(state.compactions[0].skipped, true);
        assert.ok(main[1].messages.some(m => m.tool_calls?.some(c => c.function.arguments.includes('END-OF-WRITE'))));
        assert.ok(main[2].toolResponses, 'incremental requests resume on the rebuilt main session');
    } else {
        assert.ok(main[1].messages.some(m => m.content.includes(state.compactions[0].summary)));
        assert.equal(main[1].messages.at(-1).content, user);
    }
    assert.equal(main[1].toolResponses, undefined, 'Do not continue the stale provider session');
    assert.deepEqual(state.messages.filter(m => m.role === 'user').map(m => m.content), [user]);
    assert.equal(state.messages.at(-1).content, '岛屿卡完成。');
    assert.equal(state.messages.at(-1).compactionEpoch, 1);
});
