import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { administratorHarness, settled, withLoadedTools } from './administrator-harness.js';
import { createAdministratorData, parseAdministratorData } from '../apps/administrator/domain/data.js';
import { administratorContext } from '../apps/administrator/agent/history.js';

const call = (name, args, id = 'call') => ({ text: 'checking', toolCalls: [{ id, name, arguments: JSON.stringify(args) }] });
const toolResults = messages => messages.filter(message => message.role === 'tool');

test('existing v1 file converts once without inventing lost tool evidence, and the next save uses current format', async () => {
    const old = JSON.parse(readFileSync(new URL('./fixtures/administrator-v1.json', import.meta.url), 'utf8'));
    const h = await administratorHarness({ administrator: old });
    const current = h.conversation.read();
    assert.deepEqual(current.turns.map(({ toolMessages, ...turn }) => { assert.deepEqual(toolMessages, []); return turn; }), old.turns);
    assert.deepEqual(parseAdministratorData(current), current);
    await h.request('send', { text: '继续' }); await settled(h.runtime);
    assert.equal(h.state.persisted.partitions.administrator.schemaVersion, createAdministratorData().schemaVersion);
    assert.deepEqual(h.conversation.read().turns[0], current.turns[0]);
});

test('returned tool evidence and provider payloads survive completion, reopening and the next user turn', async () => {
    const h = await administratorHarness();
    const payload = { google: { parts: [{ thoughtSignature: 'opaque-signature', functionCall: { name: 'ChatRead', args: { from: 55 } } }] } };
    const finalPayload = { google: { parts: [{ text: 'answer', thoughtSignature: 'final-signature' }] } };
    let requests = 0;
    h.state.generate = withLoadedTools([], async () => ++requests === 1
        ? { ...call('ChatRead', { from: 55 }), providerPayload: payload, toolCalls: [{ ...call('ChatRead', { from: 55 }).toolCalls[0], providerId: '' }] }
        : { text: 'answer', providerPayload: finalPayload });
    await h.request('send', { text: '核对55楼' }); await settled(h.runtime);
    const saved = h.repository.read().turns[0];
    const readCall = messages => messages.find(message => (message.toolCalls ?? message.tool_calls)?.some(call => (call.name ?? call.function?.name) === 'ChatRead'));
    assert.deepEqual(readCall(saved.toolMessages).providerPayload, payload);
    assert.deepEqual(saved.assistantPayload, finalPayload);
    assert.equal(readCall(saved.toolMessages).content, 'checking');
    const evidence = toolResults(h.state.requests.at(-1).messages);
    assert.deepEqual(toolResults(administratorContext(h.repository.read()).messages), evidence);
    assert.ok(h.runtime.context().runtime > 0);
    const reload = await administratorHarness(h.state.persisted.partitions);
    assert.equal(reload.state.requests.length, 0);
    assert.deepEqual(administratorContext(reload.repository.read()).runtime, administratorContext(h.repository.read()).runtime);
    // Whole-request rounding can shift the marginal count when idle history adds receipts.
    assert.ok(reload.runtime.context().runtime > 0);
    await reload.request('send', { text: '接着说' }); await settled(reload.runtime);
    const replay = reload.state.requests[0].messages;
    assert.deepEqual(toolResults(replay), evidence);
    assert.deepEqual(readCall(replay).providerPayload, payload);
    assert.equal(readCall(replay).tool_calls[0].providerToolCallId, '');
    assert.deepEqual(replay.find(message => message.content === 'answer').providerPayload, finalPayload);
    assert.equal(reload.runtime.context().runtime, 0);
    assert.ok(reload.runtime.context().history > h.runtime.context().history);
    assert.deepEqual(reload.repository.read().turns[0], saved);
});

test('saving a completed tool result fails closed and confirmation only persists history, without another business dispatch', async () => {
    for (const status of ['failed', 'unconfirmed']) {
        const h = await administratorHarness();
        h.state.generate = withLoadedTools(['world'], async () => call('WorldEdit', { overview: 'saved business' }));
        h.state.replace = async input => {
            const results = input.candidate.partitions.administrator?.turns[0]?.toolMessages.filter(message => message.role === 'tool') ?? [];
            if (results.some(message => JSON.parse(message.content).status === 'saved')) {
                return status === 'failed' ? { status, error: { code: 'offline', message: 'offline', retryable: true } } : { status, observed: h.state.persisted };
            }
            h.state.persisted = structuredClone(input.candidate); return { status: 'confirmed' };
        };
        await h.request('send', { text: '修改概况' }); await settled(h.runtime);
        assert.equal(h.conversation.unsaved(), true);
        assert.equal(h.state.requests.length, 2);
        const business = structuredClone(h.state.persisted.partitions.world);
        assert.equal(business.overview, 'saved business');
        h.state.replace = null;
        await h.request('confirm'); await settled(h.runtime);
        assert.equal(h.conversation.unsaved(), false);
        assert.equal(h.state.requests.length, 2);
        assert.deepEqual(h.state.persisted.partitions.world, business);
        const turn = h.repository.read().turns[0];
        assert.equal(JSON.parse(turn.toolMessages.at(-1).content).status, 'saved');
        assert.equal(turn.operations.at(-1).status, 'saved');
        const reload = await administratorHarness(h.state.persisted.partitions);
        assert.equal(reload.state.requests.length, 0);
        assert.deepEqual(reload.repository.read().turns[0], turn);
    }
});

test('cancelling a tool batch retains paired completed, uncertain and undispatched results without replaying execution on reload', async () => {
    const h = await administratorHarness(); const executions = [];
    const tools = [{ effect: 'read', label: 'probe', target: () => '', definition: { type: 'function', function: { name: 'Probe', parameters: {} } } }];
    h.registry.register({ id: 'probe', label: 'Probe', prompt: '', tools, async open() { return {
        prompt: '', initial: {}, tools,
        async execute(_, args) {
            executions.push(args.step);
            if (args.step === 2) { await h.request('stop'); throw new DOMException('cancelled', 'AbortError'); }
            return { ok: true, status: 'read', data: { step: args.step } };
        },
    }; } });
    h.state.generate = withLoadedTools(['probe'], async () => ({ toolCalls: [1, 2, 3].map(step => call('Probe', { step }, String(step)).toolCalls[0]) }));
    await h.request('send', { text: '检查' }); await settled(h.runtime);
    assert.deepEqual(executions, [1, 2]);
    const saved = h.repository.read();
    assert.equal(saved.turns[0].status, 'interrupted');
    assert.deepEqual(parseAdministratorData(saved), saved);
    const results = toolResults(saved.turns[0].toolMessages).map(message => JSON.parse(message.content));
    assert.equal(results[0].status, 'read');
    assert.equal(results[1].status, 'read');
    assert.equal(results[2].status, 'unconfirmed');
    assert.equal(results[3].code, 'tool_not_executed');
    const reload = await administratorHarness(h.state.persisted.partitions);
    assert.equal(reload.state.requests.length, 0);
    await reload.request('send', { text: '哪些完成了' }); await settled(reload.runtime);
    assert.deepEqual(toolResults(reload.state.requests[0].messages).map(message => JSON.parse(message.content)), results);
    assert.deepEqual(executions, [1, 2]);
});

test('deleting a reply removes its tool history and affected summary without reverting business data', async () => {
    const h = await administratorHarness(); let step = 0;
    h.state.generate = withLoadedTools(['world'], async () => ++step === 1 ? call('WorldEdit', { overview: 'keep business' }) : { text: 'done', providerPayload: { opaque: 'payload' } });
    await h.request('send', { text: '修改' }); await settled(h.runtime);
    const candidate = structuredClone(h.conversation.read()), turnId = candidate.turns[0].id;
    candidate.summary = { text: 'summary', throughId: turnId, throughToolMessage: 2 };
    await h.conversation.save(candidate, () => true);
    const business = structuredClone(h.state.persisted.partitions.world);
    await h.request('delete', { turnId, role: 'assistant', revision: h.repository.read().revision });
    const turn = h.repository.read().turns[0];
    assert.deepEqual(turn.toolMessages, []); assert.equal(turn.assistantPayload, undefined);
    assert.equal(turn.assistant, null); assert.equal(h.repository.read().summary, null);
    assert.deepEqual(administratorContext(h.repository.read()).messages, [{ role: 'user', content: '修改' }]);
    await h.request('clear');
    assert.deepEqual(h.repository.read().turns, []);
    assert.deepEqual(h.state.persisted.partitions.world, business);
});

test('incomplete tool pairs and summary cursors inside a group are rejected at the data boundary', () => {
    const group = [{ role: 'assistant', content: '', toolCalls: call('Read', {}).toolCalls }, { role: 'tool', toolName: 'Read', toolCallId: 'call', content: '{}' }];
    const data = { ...createAdministratorData(), turns: [{ id: 'turn', createdAt: 1, user: { text: 'request' }, assistant: 'done', toolMessages: group, operations: [], status: 'finished', error: '' }] };
    assert.deepEqual(parseAdministratorData(data), data);
    for (const mutate of [
        candidate => candidate.turns[0].toolMessages.pop(),
        candidate => { candidate.turns[0].toolMessages[1].toolCallId = 'wrong'; },
        candidate => { candidate.summary = { text: 'summary', throughId: 'turn', throughToolMessage: 1 }; },
    ]) {
        const invalid = structuredClone(data); mutate(invalid); assert.throws(() => parseAdministratorData(invalid));
    }
});

test('late stream callbacks from a previous model step cannot become the interrupted answer', async () => {
    const h = await administratorHarness(); let oldStream, step = 0;
    h.state.generate = withLoadedTools([], async request => {
        if (++step === 1) { oldStream = request.onStreamProgress; return call('ChatRead', { from: 55 }); }
        oldStream({ text: 'stale intermediate text' });
        throw new Error('offline');
    });
    await h.request('send', { text: '检查' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].assistant, null);
    assert.equal(h.repository.read().turns[0].toolMessages.find(message => message.toolCalls?.some(call => call.name === 'ChatRead')).content, 'checking');
});
