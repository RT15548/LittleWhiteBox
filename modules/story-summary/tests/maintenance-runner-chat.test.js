import assert from 'node:assert/strict';
import test from 'node:test';
import { runMemoryAgent, estimateMemoryChatContext } from '../maintenance/runner.js';
import { createMemorySession } from '../maintenance/session.js';
import { buildMemoryChatMessages, memoryRegenerationNote } from '../maintenance/conversation.js';
import { commitMemorySession, publishedMaintenanceCommit } from '../maintenance/commit.js';
import { invalidateMemoryAnchorsAtFloors } from '../data/anchor-invalidation.js';
import { projectMaintenanceRun } from '../maintenance/history.js';
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
    const commits = [], finishes = [];
    const ports = { read: () => current, commit: async next => {
        commits.push(next);
        current.store = next.storySummary; current.json = next.storySummary.json;
        current.atoms = next.stateAtoms; current.l0Index = next.l0Index;
        return next;
    } };
    const finish = async payload => { finishes.push(payload); return commitMemorySession(payload.session, payload, ports); };
    return { current, session: createMemorySession(current), commits, finishes,
        options: { config, countTokens, readCurrent: async () => current, onFinish: finish } };
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

// Acceptance: a confirmed save whose source changed reports only remaining results,
// never retries the old draft or blocks the next turn. Completion-only work is valid.
// Cost: false saved/completed feedback or duplicate writes after a successful save.
for (const scenario of ['all', 'mixed', 'completion-retired', 'completion-valid']) {
    test(`real Agent finalization reports post-save source retirement: ${scenario}`, async () => {
        const h = harness(); h.session.initial();
        let requests = 0;
        const anchor = { kind: 'edit', collection: 'anchors', key: 'atom-1-0', patch: { semantic: '只是推测' } };
        const tool = scenario.startsWith('completion') ? call('complete', 'CompleteMaintenance', { from: 2, to: 2 })
            : call('edit', 'EditMemory', { edits: [anchor, ...(scenario === 'mixed' ? [{ kind: 'edit', collection: 'facts', key: 'f-1', patch: { o: '未证实' } }] : [])] });
        const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '处理这部分',
            adapter: { chat: async () => ++requests === 1 ? { toolCalls: [tool] } : { text: '已处理' } },
            onFinish: async payload => {
                const saved = await h.options.onFinish(payload);
                const snapshot = { storySummary: h.current.store, stateAtoms: h.current.atoms, l0Index: h.current.l0Index };
                const next = scenario === 'completion-valid' ? snapshot : invalidateMemoryAnchorsAtFloors(snapshot, [1]).next;
                h.current.store = next.storySummary; h.current.json = next.storySummary.json;
                h.current.atoms = next.stateAtoms; h.current.l0Index = next.l0Index;
                return publishedMaintenanceCommit(saved, next);
            },
        });
        const status = scenario === 'completion-valid' ? 'completed' : scenario === 'mixed' ? 'partially_superseded' : 'superseded';
        assert.equal(result.status, status);
        assert.equal(result.saved, Number(scenario === 'mixed'));
        assert.equal(result.staged, 0);
        assert.equal(result.error, undefined);
        assert.equal(requests, 2);
        assert.equal(h.commits.length, 1);
        const history = projectMaintenanceRun(h.current.store, result.runId);
        assert.equal(history.outcome.status, status);
        assert.equal(history.counts.anchors, 0);
        assert.deepEqual(history.completed, scenario === 'completion-valid' ? [{ from: 2, to: 2 }] : []);
        const nextRun = await runMemoryAgent(createMemorySession(h.current), { ...h.options,
            mode: 'chat', question: '继续', adapter: { chat: async () => ({ text: '可以继续' }) } });
        assert.equal(nextRun.status, 'completed');
    });
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
        assert.equal(result.receipts.length, tool.name === 'CompleteMaintenance' ? 2 : 1);
        assert.equal(h.commits.length, 1);
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

for (const uncertain of [false, true]) test(`final ${uncertain ? 'unknown' : 'not saved'} result stays in this turn without replaying edits`, async () => {
    const h = harness(), requests = []; let saves = 0;
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '修改',
        onFinish: async () => { saves++; throw Object.assign(new Error('storage disconnected'), { code: 'store_failure', uncertain }); },
        adapter: { chat: async request => {
            requests.push({ messages: structuredClone(request.messages), systemPrompt: request.systemPrompt });
            if (requests.length === 1) return { toolCalls: [edit(), call('later', 'ReadMemory', {})] };
            return { text: requests.length === 2 ? '修改已暂存。' : '保存还需要核对。' };
        } },
    });
    assert.equal(requests.length, 3);
    assert.equal(saves, 1);
    assert.equal(result.status, uncertain ? 'unconfirmed' : 'failed');
    assert.equal(result.saved, 0);
    assert.equal(h.session.stagedCount, 1);
    const staged = JSON.parse(result.messages.find(message => message.tool_call_id === 'write').content);
    assert.equal(staged.status, 'staged');
    assert.equal(JSON.parse(requests[2].systemPrompt.split('\n').at(-1)).saveState.state, uncertain ? 'unknown' : 'not_saved');
    assertPaired(result.messages);
});

test('stop after staging saves valid work once and does not execute remaining tools', async () => {
    const h = harness(), abort = new AbortController();
    const result = await runMemoryAgent(h.session, { ...h.options, signal: abort.signal, mode: 'chat', question: '处理这些',
        onProgress: value => { if (value.action === 'reading' && h.session.stagedCount) abort.abort(); },
        adapter: { chat: async () => ({ toolCalls: [edit(), call('read', 'ReadMemory', {}), edit('second', 'f-2')] }) },
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

test('multiple write tools and completion share one final transaction in both entry modes', async () => {
    for (const mode of ['auto', 'chat']) {
        const h = harness(); let turn = 0;
        const result = await runMemoryAgent(h.session, { ...h.options, mode, question: '维护这些记忆',
            adapter: { chat: async () => {
                turn++;
                if (turn === 1) return { toolCalls: [edit()] };
                if (turn === 2) {
                    assert.equal(h.commits.length, 0);
                    assert.notEqual(h.current.json.facts[0].o, '尚未查证');
                    return { toolCalls: [edit('second', 'f-2'), call('done', 'CompleteMaintenance', { from: 1, to: 24 })] };
                }
                assert.equal(h.commits.length, 0);
                return { text: '本轮处理完成。' };
            } },
        });
        assert.equal(result.status, 'completed');
        assert.equal(result.saved, 2);
        assert.equal(h.commits.length, 1);
        assert.equal(result.ranges.pending.length, 0);
        assertPaired(result.messages);
    }
});

test('same-turn read-only confirmation accepts the original receipt without a duplicate save', async () => {
    const h = harness(); let attempt = 0, prepared, recoveries = 0;
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '修改',
        onFinish: async payload => {
            prepared = await h.options.onFinish(payload);
            throw Object.assign(new Error('readback offline'), { code: 'metadata_save_unconfirmed', uncertain: true, receiptId: prepared.receipt.id });
        },
        onRecover: async ({ action }) => { assert.equal(action, 'check'); recoveries++; return { ...prepared, state: 'confirmed' }; },
        adapter: { chat: async () => {
            attempt++;
            if (attempt === 1) return { toolCalls: [edit()] };
            if (attempt === 3) return { toolCalls: [call('check', 'RecoverMaintenanceSave', { action: 'check' })] };
            return { text: attempt === 2 ? '修改已暂存。' : '已核对保存。' };
        } },
    });
    assert.equal(result.status, 'completed');
    assert.equal(result.saved, 1);
    assert.equal(h.commits.length, 1);
    assert.equal(recoveries, 1);
    assert.deepEqual(result.receipts, [prepared.receipt.id]);
    assert.equal(JSON.parse(result.messages.find(message => message.tool_call_id === 'check').content).state, 'confirmed');
    assertPaired(result.messages);
});

test('unknown persistence rejects a retry but retains read-only recovery in the same task', async () => {
    const h = harness(); let attempt = 0, recoveryCalls = 0, writes = 0;
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '修改',
        onFinish: async () => { writes++; throw Object.assign(new Error('read timeout'), { code: 'metadata_save_unconfirmed', uncertain: true }); },
        onRecover: async ({ action }) => { assert.equal(action, 'check'); recoveryCalls++; return { state: 'unknown' }; },
        adapter: { chat: async () => {
            attempt++;
            if (attempt === 1) return { toolCalls: [edit()] };
            if (attempt === 3) return { toolCalls: [call('retry', 'RecoverMaintenanceSave', { action: 'retry' }), call('check', 'RecoverMaintenanceSave', { action: 'check' })] };
            return { text: '保存尚待核对。' };
        } },
    });
    assert.equal(result.status, 'unconfirmed');
    assert.equal(writes, 1);
    assert.equal(recoveryCalls, 1);
    assert.equal(h.session.stagedCount, 1);
    assert.equal(JSON.parse(result.messages.find(message => message.tool_call_id === 'retry').content).code, 'save_retry_unconfirmed');
    assertPaired(result.messages);
});

test('known unsaved draft can be retried without replaying its edit tools', async () => {
    const h = harness(); let attempt = 0, submissions = 0;
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '修改',
        onFinish: async () => { submissions++; throw Object.assign(new Error('not saved'), { code: 'metadata_not_saved', uncertain: false }); },
        onRecover: async payload => { assert.equal(payload.action, 'retry'); submissions++; return { ...await h.options.onFinish(payload), state: 'confirmed' }; },
        adapter: { chat: async () => {
            attempt++;
            if (attempt === 1) return { toolCalls: [edit()] };
            if (attempt === 3) return { toolCalls: [call('retry', 'RecoverMaintenanceSave', { action: 'retry' })] };
            return { text: '本轮处理结果。' };
        } },
    });
    assert.equal(result.status, 'completed');
    assert.equal(submissions, 2);
    assert.equal(h.commits.length, 1);
    assert.equal(result.saved, 1);
    assertPaired(result.messages);
});

test('cancelling a recovery wait never turns an unknown save into an unsaved draft', async () => {
    const h = harness(), controller = new AbortController(); let attempt = 0, submissions = 0;
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '修改', signal: controller.signal,
        onFinish: async () => { submissions++; throw Object.assign(new Error('read timeout'), { code: 'metadata_save_unconfirmed', uncertain: true }); },
        onRecover: async () => { controller.abort(); throw new DOMException('Stopped waiting', 'AbortError'); },
        adapter: { chat: async () => {
            attempt++;
            if (attempt === 1) return { toolCalls: [edit()] };
            if (attempt === 3) return { toolCalls: [call('check', 'RecoverMaintenanceSave', { action: 'check' })] };
            return { text: '本轮修改已暂存。' };
        } },
    });
    assert.equal(result.status, 'unconfirmed');
    assert.equal(submissions, 1);
    assert.equal(JSON.parse(result.messages.find(message => message.tool_call_id === 'check').content).state, 'unknown');
    assertPaired(result.messages);
});

for (const recovering of [false, true]) test(`notification failure after ${recovering ? 'recovered' : 'normal'} confirmation keeps saved work and never retries it`, async () => {
    const h = harness(); let attempt = 0, prepared;
    const confirmedError = () => Object.assign(new Error('fixture notification failure'), {
        code: 'memory_refresh_failed', confirmed: true, commitResult: prepared,
    });
    const result = await runMemoryAgent(h.session, { ...h.options, mode: 'chat', question: '修改',
        onFinish: async payload => {
            prepared = await h.options.onFinish(payload);
            if (recovering) throw Object.assign(new Error('read timeout'), { code: 'metadata_save_unconfirmed', uncertain: true });
            throw confirmedError();
        },
        onRecover: async () => { throw confirmedError(); },
        adapter: { chat: async () => {
            attempt++;
            if (attempt === 1) return { toolCalls: [edit()] };
            if (attempt === 3 && recovering) return { toolCalls: [call('check', 'RecoverMaintenanceSave', { action: 'check' })] };
            return { text: '本轮处理结果。' };
        } },
    });
    assert.equal(result.status, 'failed');
    assert.equal(result.error.code, 'memory_refresh_failed');
    assert.equal(result.saved, 1);
    assert.equal(result.staged, 0);
    assert.equal(h.commits.length, 1);
    assert.equal(h.session.hasPending, false);
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

// Acceptance: transient recovery stays in this execution, even across compaction;
// archived calls/results remain paired (cost: stale instructions / protocol errors).
for (const mode of ['auto', 'chat']) test(`save recovery expires after confirmation and cannot enter the next request (${mode})`, async () => {
    const h = harness(), requests = [], countedPrompts = [], summaries = [];
    let prepared, recovering = false;
    const result = await runMemoryAgent(h.session, { ...h.options, mode, question: '修正记忆',
        limits: { compactTokens: 200, inputTokens: 1000, summaryTokens: 500 },
        countTokens: async input => {
            countedPrompts.push(input.messages[0].content);
            return { tokens: mode === 'auto' && recovering && input.tools.length
                && input.messages.filter(message => message.role === 'assistant').length > 2 ? 200 : 100, source: 'test' };
        },
        createSummaryAdapter: () => ({ chat: async request => {
            const fragment = JSON.parse(request.messages[0].content).workFragment;
            summaries.push(JSON.parse(fragment.text));
            return { text: '已检查记忆，修改仍需核对保存。' };
        } }),
        onFinish: async payload => {
            prepared = await h.options.onFinish(payload); recovering = true;
            throw Object.assign(new Error('offline readback'), { code: 'metadata_save_unconfirmed', uncertain: true });
        },
        onRecover: async () => { recovering = false; return { ...prepared, state: 'confirmed' }; },
        adapter: { supportsSessionToolLoop: true, chat: async request => {
            requests.push({ ...request, messages: structuredClone(request.messages), tools: [...request.tools] });
            assert.ok(countedPrompts.includes(request.systemPrompt));
            const attempt = requests.length;
            if (attempt === 1) return { toolCalls: [edit()] };
            if (attempt === 2 || attempt === 3) return { toolCalls: [call(`read-${attempt}`, 'ReadMemory', { collection: 'facts', key: 'f-1' })] };
            if (attempt === 5) {
                assert.equal(JSON.parse(request.systemPrompt.split('\n').at(-1)).saveState.state, 'unknown');
                assert.ok(request.tools.some(tool => tool.function.name === 'RecoverMaintenanceSave'));
                return { toolCalls: [call('check', 'RecoverMaintenanceSave', { action: 'check' })], providerPayload: { anthropicContent: [
                    { type: 'thinking', thinking: 'recovery', signature: 'recovery-signature' },
                    { type: 'tool_use', id: 'check', name: 'RecoverMaintenanceSave', input: { action: 'check' } },
                ] } };
            }
            return { text: '本轮结果。' };
        } },
    });
    assert.equal(result.saved, 1);
    assert.equal(h.commits.length, 1);
    assert.equal(requests.length, 6);
    assert.equal(requests[5].systemPrompt, requests[0].systemPrompt);
    assert.equal(requests[5].toolResponses, undefined);
    assert.equal(requests[5].messages.some(message => message.providerPayload?.anthropicContent?.some(block => block.type === 'thinking')), false);
    assert.equal(summaries.length, mode === 'auto' ? 1 : 0);
    assert.equal(summaries.flat(2).some(message => message.role === 'system'), false);
    assert.equal(result.messages.some(message => message.role === 'system'), false);
    assertPaired(result.messages);
    const next = await runMemoryAgent(createMemorySession(h.current), { ...h.options, mode: 'chat', question: '继续解释', history: result.messages,
        adapter: { chat: async request => {
            assert.equal(request.messages.some(message => message.role === 'system'), false);
            assert.equal(request.tools.some(tool => tool.function.name === 'RecoverMaintenanceSave'), false);
            assertPaired(request.messages);
            return { text: '解释。' };
        } },
    });
    assert.equal(next.status, 'completed');
    assert.equal(h.commits.length, 1);
});

// Acceptance: compressed model input retains staged completion, not just published
// progress (cost: duplicate paid maintenance); compaction itself cannot save it.
for (const mode of ['auto', 'chat']) test(`compaction keeps staged completion in the actual model input (${mode})`, async () => {
    const h = harness(); let attempts = 0, compacted = false, trigger = false;
    const result = await runMemoryAgent(h.session, { ...h.options, mode, question: '完成维护',
        limits: { compactTokens: 200, inputTokens: 1000, summaryTokens: 500 },
        countTokens: async () => {
            const force = trigger && !compacted;
            if (force) compacted = true;
            return { tokens: force ? 200 : 100, source: 'test' };
        },
        createSummaryAdapter: () => ({ chat: async () => ({ text: '已维护。' }) }),
        adapter: { chat: async request => {
            if (++attempts === 1) return { toolCalls: [call('done', 'CompleteMaintenance', { from: 1, to: 24 })] };
            if (attempts === 2) { trigger = true; return { toolCalls: [call('read', 'ReadMemory', { collection: 'facts', key: 'f-1' })] }; }
            const material = mode === 'auto' ? JSON.parse(request.messages[0].content)
                : JSON.parse(request.systemPrompt.split('\n').at(-1));
            assert.deepEqual(material.task.completed, [{ from: 1, to: 24 }]);
            assert.deepEqual(material.task.pending, []);
            assert.deepEqual(material.task.stagedCompletions, [{ from: 1, to: 24 }]);
            assert.equal(h.commits.length, 0);
            assert.deepEqual(h.session.task().completed, []);
            return { text: '完成。' };
        } },
    });
    assert.equal(compacted, true);
    assert.equal(result.status, 'completed');
    assert.equal(h.commits.length, 1);
    assertPaired(result.messages);
});
