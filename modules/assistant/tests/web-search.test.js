import test from 'node:test';
import assert from 'node:assert/strict';
import { createAssistantRuntime } from '../app-src/runtime.js';
import { TOOL_DEFINITIONS, TOOL_NAMES, formatToolResultDisplay } from '../app-src/tooling.js';

test('assistant sends selected Exa search results through its ordinary tool continuation', async t => {
    const state = { messages: [{ role: 'user', content: 'Find a public reference.' }], historySummary: '', archivedTurnCount: 0 };
    const run = { id: 'web', controller: new AbortController(), toolRequestIds: new Set() };
    state.activeRun = run;
    const requests = [], http = [];
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        http.push(url);
        assert.equal(options.headers['x-api-key'], 'exa-fixture');
        return Response.json({ results: [{ title: 'Reference', url: 'https://example.org/', highlights: ['Actual excerpt'] }] });
    });
    const runtime = createAssistantRuntime({ state, pendingToolCalls: new Map(), pendingApprovals: new Map(),
        render() {}, persistSession() {}, showToast() {}, createRequestId: () => 'web-call',
        post() { assert.fail('web search must not be sent to host tools'); },
        safeJsonParse: JSON.parse, describeError: String, isAbortError: error => error?.name === 'AbortError',
        formatToolResultDisplay, buildTextWithAttachmentSummary: text => text, buildUserContentParts: message => message.content,
        normalizeAttachments: value => value || [], normalizeThoughtBlocks: value => value || [],
        getActiveProviderConfig: () => ({ provider: 'openai-compatible', model: 'fixture', webProvider: 'exa', exaApiKey: 'exa-fixture' }),
        SYSTEM_PROMPT: '', SUMMARY_SYSTEM_PROMPT: '', HISTORY_SUMMARY_PREFIX: '',
        MAX_CONTEXT_TOKENS: 258000, SUMMARY_TRIGGER_TOKENS: 228000,
        DEFAULT_PRESERVED_TURNS: 1, MIN_PRESERVED_TURNS: 1, MAX_TOOL_ROUNDS: 4, REQUEST_TIMEOUT_MS: 1000,
        TOOL_DEFINITIONS, TOOL_NAMES, countTokens: async () => ({ tokens: 100, source: 'estimated' }),
        createAdapter: () => ({ async chat(request) {
            requests.push(request);
            return requests.length === 1 ? { toolCalls: [{ id: 'search', name: TOOL_NAMES.WEB_SEARCH, arguments: '{"query":"reference"}' }] }
                : { text: 'reference checked' };
        } }),
    });
    await runtime.runAssistantLoop(run);
    assert.deepEqual(http, ['https://api.exa.ai/search']);
    assert.equal(requests.length, 2);
    const result = JSON.parse(requests[1].messages.findLast(message => message.role === 'tool').content);
    assert.equal(result.results[0].content, 'Actual excerpt');
    assert.equal(state.messages.at(-1).content, 'reference checked');
});
