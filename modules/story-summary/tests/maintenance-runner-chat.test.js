import assert from 'node:assert/strict';
import test from 'node:test';
import { runMemoryAgent, estimateMemoryChatContext } from '../maintenance/runner.js';
import { createMemorySession } from '../maintenance/session.js';
import { buildMemoryChatMessages, memoryRegenerationNote } from '../maintenance/conversation.js';
import { commitMemorySession } from '../maintenance/commit.js';
import { createSummaryBaseline } from '../data/summary-history.js';
import { maintenanceFixture } from './fixtures/memory-maintenance.js';

// These tests protect the side-effect boundary: a conversation is not a whole-
// library maintenance run, and failed/retried provider messages cannot replay writes.
const config = { provider: 'openai', model: 'offline-test', maxTokens: 1000 };
const countTokens = async () => ({ tokens: 100, source: 'test-counter' });
const call = (id, name, args) => ({ id, name, arguments: JSON.stringify(args) });
const edit = (id = 'write', key = 'f-1') => call(id, 'EditMemory', { edits: [
    { kind: 'edit', collection: 'facts', key, patch: { o: '尚未查证' } },
] });
function harness() {
    const current = maintenanceFixture();
    current.store = { json: current.json, lastSummarizedMesId: current.cutoff, summaryHistory: [createSummaryBaseline(current.cutoff)] };
    const ports = { read: () => current, commit: async next => {
        current.store = next.storySummary; current.json = next.storySummary.json;
        current.atoms = next.stateAtoms; current.l0Index = next.l0Index;
    } };
    const commits = [], finishes = [];
    const save = async payload => { commits.push(payload); return commitMemorySession(payload.session, payload, ports); };
    const finish = async payload => { finishes.push(payload); return commitMemorySession(payload.session, payload, ports); };
    return { current, session: createMemorySession(current), commits, finishes,
        options: { config, countTokens, readCurrent: async () => current, onSave: save, onFinish: finish } };
}
function assertPaired(messages) {
    for (let i = 0; i < messages.length; i++) {
        const tools = messages[i].tool_calls || [];
        if (!tools.length) continue;
        const results = [];
        for (let j = i + 1; j < messages.length && messages[j].role === 'tool'; j++) results.push(messages[j].tool_call_id);
        assert.deepEqual(new Set(results), new Set(tools.map(tool => tool.id)));
        assert.equal(results.length, tools.length);
    }
}

test('chat question remains a user instruction without an initial full-memory read or no-op receipt', async () => {
    const h = harness(), requests = [], contexts = [], streams = [];
    h.session.initial = () => { throw new Error('Chat must not request an opening memory dump'); };
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '为什么停在140？',
        history: [{ role: 'user', content: '之前的问题' }, { role: 'assistant', content: '之前的答复' }],
        onContext: value => contexts.push(value), onStream: value => streams.push(value),
        adapter: { chat: async request => {
            requests.push({ ...request, messages: structuredClone(request.messages) }); request.onStreamProgress({ text: '查询中' }); return { text: '还有未完成的工作。' };
        } },
    });
    assert.equal(result.status, 'completed');
    assert.equal(result.ranges.pending.length > 0, true);
    assert.equal(requests[0].messages[2].role, 'user');
    assert.equal(requests[0].messages[2].content, '为什么停在140？');
    assert.equal(requests[0].messages.length, 3);
    assert.equal(h.finishes.length, 0);
    assert.equal(h.commits.length, 0);
    assert.equal(result.messages.at(-1).content, '还有未完成的工作。');
    assert.equal(result.replayBeforeTurn.length, 2);
    assert.equal(streams[0].text, '查询中');
    assert.equal(streams.at(-1).text, result.summary);
    assert.equal(contexts[0].used, 100);
    assert.equal(Object.values(contexts[0].sections).reduce((sum, n) => sum + n, 0), contexts[0].used);
});

test('no-summary chat has only read-only diagnostics with validated paging and complete replay history', async () => {
    const reads = [], requests = [], observed = [];
    const result = await runMemoryAgent(null, { config, countTokens, mode: 'chat', question: '上次怎么失败的？',
        readMaintenance: async args => { reads.push(args); return { status: 'invalid_history', runs: [] }; },
        onFinish: () => assert.fail('Diagnostics must not write a maintenance receipt'),
        onCall: event => observed.push(event),
        adapter: { supportsSessionToolLoop: true, chat: async request => {
            requests.push({ ...request, messages: structuredClone(request.messages) });
            return requests.length === 1 ? { toolCalls: [call('diagnose', 'ReadMaintenance', {})] } : { text: '先检查历史记录。' };
        } },
    });
    assert.equal(result.status, 'completed');
    assert.deepEqual(requests[0].tools.map(tool => tool.function.name), ['ReadMaintenance']);
    assert.deepEqual(reads, [{ offset: 0, limit: 10 }]);
    assert.equal(requests[1].toolResponses[0].response.status, 'invalid_history');
    assert.equal(observed[0].tools[0].arguments, '{}');
    assertPaired(result.messages);
    assert.equal(result.receipts.length, 0);
});

for (const tool of [edit(), call('done', 'CompleteMaintenance', { from: 1, to: 2 })]) {
    test(`chat ${tool.name} saves and concludes without relabeling global pending as partial`, async () => {
        const h = harness(); let attempts = 0;
        const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '处理这部分。',
            adapter: { chat: async () => ++attempts === 1 ? { toolCalls: [tool] } : { text: '这部分已处理。' } },
        });
        assert.equal(result.status, 'completed');
        assert.equal(result.ranges.pending.length > 0, true);
        assert.equal(h.finishes.length, 1);
        assert.equal(h.finishes[0].mode, 'chat');
        assert.equal(result.receipts.length, 2);
        assert.equal(h.current.store.summaryHistory[0].maintenance.at(-1).outcome.status, 'completed');
        assertPaired(result.messages);
    });
}

test('new chat turn reads live state with a fresh session rather than a stale historical tool value', async () => {
    const h = harness(); let first = 0;
    const old = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '读一下记忆',
        adapter: { chat: async () => ++first === 1 ? { toolCalls: [call('read', 'ReadMemory', { collection: 'facts', key: 'f-1' })] }
            : { text: '已读取。', providerPayload: { anthropicContent: [{ type: 'thinking', thinking: 'old', signature: 'stale' }, { type: 'text', text: '已读取。' }] } } },
    });
    h.current.json.facts[0].o = '本轮之前已经更新';
    const requests = []; let second = 0;
    const result = await runMemoryAgent(createMemorySession(h.current), { ...h.options, mode: 'chat', question: '现在呢？', history: old.messages,
        adapter: { chat: async request => { requests.push({ ...request, messages: structuredClone(request.messages) }); return ++second === 1
            ? { toolCalls: [call('fresh', 'ReadMemory', { collection: 'facts', key: 'f-1' })] } : { text: '已更新。' }; } },
    });
    const read = result.messages.find(message => message.tool_call_id === 'fresh');
    assert.equal(JSON.parse(read.content).items[0].value.o, '本轮之前已经更新');
    assert.equal(requests[0].messages.some(message => message.providerPayload?.anthropicContent?.some(block => block.type === 'thinking')), false);
    assert.equal(old.messages.at(-1).providerPayload.anthropicContent[0].type, 'thinking');
    assertPaired(result.messages);
});

test('automatic entry is independent even if manual history and a question are supplied', async () => {
    const h = harness(), requests = [];
    const result = await runMemoryAgent(h.session, { ...h.options, history: [{ role: 'user', content: 'manual' }], question: 'manual',
        adapter: { chat: async request => { requests.push({ ...request, messages: structuredClone(request.messages) }); return { text: 'No completion was declared.' }; } },
    });
    assert.equal(result.mode, 'auto');
    assert.equal(result.status, 'partial');
    assert.equal(JSON.parse(requests[0].messages[0].content).memory !== undefined, true);
    assert.equal(requests[0].messages.length, 1);
    assert.equal(h.finishes.length, 1);
});

for (const invalid of [
    { completion: 'incomplete', truncated: true, finishReason: 'length', toolCalls: [call('valid', 'ReadSource', { floor: 2 }), { id: 'bad', name: 'EditMemory', arguments: '{"edits":[' }] },
    { text: '', completion: 'incomplete', truncated: true, finishReason: 'length' },
]) test(`received ${invalid.toolCalls ? 'incomplete arguments' : 'empty truncated text'} gets one safe correction, not malformed replay`, async () => {
    const h = harness(), requests = [], observed = [];
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '检查一下',
        onCall: event => observed.push(event), adapter: { supportsSessionToolLoop: true, chat: async request => {
            requests.push({ ...request, messages: structuredClone(request.messages) }); return requests.length === 1 ? invalid : { text: '本次没有修改。' };
        } },
    });
    assert.equal(result.status, 'completed');
    assert.equal(requests.length, 2);
    assert.equal(requests[1].toolResponses, undefined);
    assert.equal(result.messages.some(message => message.tool_calls?.length), false);
    assert.equal(h.commits.length, 0);
    assert.equal(observed[0].call.truncated, true);
    assert.equal(observed[0].call.finishReason, 'length');
    assert.equal(observed[0].call.error.code, invalid.toolCalls ? 'AGENT_TOOL_ARGUMENTS_INVALID' : 'empty_response');
    assert.equal(observed[0].tools.every(tool => tool.response.status === 'not_executed'), true);
    assertPaired(result.messages);
});

test('the response repair budget is shared and exhaustion saves a precise automatic failure outcome', async () => {
    const h = harness(); let attempts = 0;
    const result = await runMemoryAgent(h.session, { ...h.options,
        adapter: { chat: async () => { attempts++; return { text: '', truncated: true, finishReason: 'length' }; } },
    });
    assert.equal(attempts, 2);
    assert.equal(result.status, 'failed');
    assert.equal(result.calls.length, 2);
    const outcome = h.current.store.summaryHistory[0].maintenance.at(-1).outcome;
    assert.equal(outcome.error.code, 'empty_response');
    assert.equal(typeof outcome.error.message, 'string');
});

test('the repair request obeys the same model-call limit', async () => {
    const result = await runMemoryAgent(null, { config, countTokens, mode: 'chat', question: '诊断', limits: { turns: 1 },
        adapter: { chat: async () => ({ text: '', truncated: true }) } });
    assert.equal(result.calls.length, 1);
    assert.equal(result.status, 'failed');
});

test('unknown API failure is observed once, never retried, and saved diagnostics redact credentials', async () => {
    const h = harness(), observed = []; let attempts = 0;
    const result = await runMemoryAgent(h.session, { ...h.options, config: { ...config, apiKey: 'private-test-key' },
        onCall: event => observed.push(event), adapter: { chat: async () => { attempts++;
            throw Object.assign(new Error('invalid private-test-key; Authorization: Bearer another-secret'), { status: 401 }); } },
    });
    assert.equal(attempts, 1);
    assert.equal(result.status, 'failed');
    assert.equal(observed[0].call.stage, 'request');
    const receipt = h.current.store.summaryHistory[0].maintenance.at(-1);
    assert.equal(receipt.outcome.error.status, 401);
    assert.equal(receipt.outcome.error.code, 'agent_auth');
    assert.equal(JSON.stringify(receipt).includes('private-test-key'), false);
    assert.equal(JSON.stringify(receipt).includes('another-secret'), false);
    assert.equal(JSON.stringify(result.error).includes('private-test-key'), false);
    assert.equal(JSON.stringify(result.error).includes('another-secret'), false);
});

for (const uncertain of [false, true]) test(`real ${uncertain ? 'unconfirmed' : 'failed'} save stops without replay and pairs all skipped tools`, async () => {
    const h = harness(), observed = []; let attempts = 0;
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '修改',
        onSave: async () => { throw Object.assign(new Error('storage disconnected'), { code: 'store_failure', uncertain }); },
        onCall: event => observed.push(event), adapter: { chat: async () => { attempts++; return { toolCalls: [edit(), call('later', 'ReadMemory', {})] }; } },
    });
    assert.equal(attempts, 1);
    assert.equal(result.status, uncertain ? 'unconfirmed' : 'failed');
    assert.equal(result.saved, 0);
    assert.equal(h.finishes.length, 0);
    assert.equal(result.calls[0].stage, 'saving');
    assert.equal(observed[0].tools[0].response.status, uncertain ? 'unconfirmed' : 'error');
    assert.equal(observed[0].tools[1].response.status, 'not_executed');
    assertPaired(result.messages);
});

test('cancel after a confirmed write preserves that receipt, concludes it, and does not execute the remaining tools', async () => {
    const h = harness(), abort = new AbortController();
    const result = await runMemoryAgent(h.session, { ...h.options, signal: abort.signal, mode: 'chat', question: '处理这些',
        onSave: async payload => { const saved = await h.options.onSave(payload); abort.abort(); return saved; },
        adapter: { chat: async () => ({ toolCalls: [edit(), edit('second', 'f-2'), call('done', 'CompleteMaintenance', { from: 1, to: 24 })] }) },
    });
    assert.equal(result.status, 'cancelled');
    assert.equal(result.saved, 1);
    assert.equal(h.commits.length, 1);
    assert.equal(h.finishes.length, 1);
    assert.equal(h.current.json.facts[0].o, '尚未查证');
    assert.equal(h.current.json.facts[1].o, '拥有药箱');
    assert.equal(h.current.store.summaryHistory[0].maintenance.at(-1).outcome.status, 'cancelled');
    assertPaired(result.messages);
});

test('response correction invalidates old native thinking as well as rebuilding the session', async () => {
    const h = harness(), requests = [];
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '先检查',
        adapter: { supportsSessionToolLoop: true, chat: async request => {
            requests.push({ ...request, messages: structuredClone(request.messages) });
            if (requests.length === 1) return { toolCalls: [call('read', 'ReadMemory', {})], providerPayload: { anthropicContent: [
                { type: 'thinking', thinking: 'old', signature: 'signed' }, { type: 'tool_use', id: 'read', name: 'ReadMemory', input: {} },
            ] } };
            return requests.length === 2 ? { text: '', completion: 'incomplete', truncated: true } : { text: '检查完毕。' };
        } },
    });
    assert.equal(result.status, 'completed');
    assert.equal(requests.length, 3);
    assert.equal(requests[1].toolResponses.length, 1);
    assert.equal(requests[2].toolResponses, undefined);
    assert.equal(requests[2].messages.some(message => message.providerPayload?.anthropicContent?.some(block => block.type === 'thinking')), false);
    assertPaired(result.messages);
});

test('regeneration carries attempt metadata but keeps the repeated question as a real user message', async () => {
    const attempt = { runId: 'run-before', receipts: ['receipt-before'], saved: 1, status: 'unconfirmed' };
    const note = memoryRegenerationNote(attempt);
    const metadata = JSON.parse(note.content.slice(note.content.lastIndexOf('\n') + 1));
    assert.deepEqual(metadata.previousAttempt, attempt);
    const result = await runMemoryAgent(null, { config, countTokens, mode: 'chat', question: '继续处理', history: [note],
        adapter: { chat: async request => {
            assert.equal(request.messages.at(-1).role, 'user');
            assert.equal(request.messages.at(-1).content, '继续处理');
            return { text: '需要先核对保存状态。' };
        } },
    });
    assert.equal(result.status, 'completed');
    assert.equal(result.replayBeforeTurn[0].role, 'system');
    const next = buildMemoryChatMessages('这是新的问题', result.messages);
    assert.equal(next.some(message => message.memoryRegeneration), false);
    const latest = memoryRegenerationNote({ runId: 'newer-attempt' });
    const retry = buildMemoryChatMessages('继续处理', [...result.replayBeforeTurn, latest]);
    assert.equal(retry.filter(message => message.memoryRegeneration).length, 1);
    assert.deepEqual(retry[0], latest);
});

test('unchanged chat edits do not manufacture no-modification maintenance receipts', async () => {
    const h = harness(); let attempts = 0;
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '保留这个值',
        adapter: { chat: async () => ++attempts === 1 ? { toolCalls: [call('same', 'EditMemory', { edits: [
            { kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: h.current.json.facts[0].o } },
        ] })] } : { text: '原值未变。' } },
    });
    assert.equal(result.status, 'completed');
    assert.equal(h.commits.length, 0);
    assert.equal(h.finishes.length, 0);
    assert.equal(result.receipts.length, 0);
});

test('cancellation after a received response still reports the model call without executing its tools', async () => {
    const h = harness(), abort = new AbortController(), observed = [];
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '处理', signal: abort.signal,
        onCall: event => observed.push(event), adapter: { chat: async () => { abort.abort(); return { toolCalls: [edit()] }; } },
    });
    assert.equal(result.status, 'cancelled');
    assert.equal(observed.length, 1);
    assert.equal(observed[0].call.error.code, 'cancelled');
    assert.equal(observed[0].tools[0].response.status, 'not_executed');
    assert.equal(h.commits.length, 0);
    assertPaired(result.messages);
});

test('local context preview is bounded by configured maintenance limits and needs no provider', () => {
    const preview = estimateMemoryChatContext({ question: '查进度', task: null });
    assert.equal(preview.source, 'estimated');
    assert.equal(preview.used > 0, true);
    assert.equal(preview.limit, 198000);
    assert.equal(preview.trigger, 178000);
    assert.equal(preview.sections.history, 0);
    assert.equal(Object.values(preview.sections).reduce((sum, n) => sum + n, 0), preview.used);
});
