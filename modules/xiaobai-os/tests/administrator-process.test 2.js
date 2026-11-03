import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled, tick, withLoadedTools } from './administrator-harness.js';
import { administratorProcess } from '../apps/administrator/application/process.js';
import { administratorPage } from '../apps/administrator/application/projection.js';
import { createAdministratorData } from '../apps/administrator/domain/data.js';

test('work projection retains round order and narration without transferring tool arguments, results or provider payloads', () => {
    const turn = { id: 'turn', createdAt: 1, user: { text: 'request' }, assistant: 'answer', toolMessages: [], operations: [], status: 'finished', error: '' };
    for (let index = 0; index < 40; index++) {
        turn.toolMessages.push({ role: 'assistant', content: `${index}:` + '播报'.repeat(4000), providerPayload: { opaque: 'private-payload' },
            toolCalls: [{ id: 'reused', name: 'Read', arguments: JSON.stringify({ secret: 'private-arguments' }) }] },
        { role: 'tool', toolName: 'Read', toolCallId: 'reused', content: JSON.stringify({ status: 'read', data: 'private-result'.repeat(2000) }) });
        turn.operations.push({ id: `run:${index + 1}:reused`, appId: 'story', name: 'Read', target: String(index), status: index % 2 ? 'failed' : 'read', elapsedMs: 1, summary: 'receipt' });
    }
    const page = administratorPage({ ...createAdministratorData(), turns: [turn] });
    assert.equal(page.rows[1].processCount, 40);
    assert.equal(page.rows[1].text, 'answer');
    assert.ok(JSON.stringify(page).length < 1000);
    const projected = administratorProcess(turn);
    assert.equal(JSON.stringify(projected).includes('private-'), false);
    assert.deepEqual(projected.map(round => round.index), Array.from({ length: 40 }, (_, index) => index));
    assert.deepEqual(projected.map(round => round.text), turn.toolMessages.filter(message => message.role === 'assistant').map(message => message.content));
    assert.deepEqual(projected.map(round => round.tools[0].status), turn.operations.map(operation => operation.status));
});

test('live, completed and reopened work uses the same saved narration and actual operation status', async () => {
    const h = await administratorHarness(); let finish;
    const narration = '检查进度。'.repeat(1800);
    const tools = [{ effect: 'read', label: 'Probe', target: () => '', definition: { type: 'function', function: { name: 'Probe', parameters: {} } } }];
    h.registry.register({ id: 'probe', label: 'Probe', prompt: '', tools, async open() { return {
        prompt: '', initial: {}, tools,
        async execute() { await new Promise(resolve => { finish = resolve; }); return { ok: true, status: 'read', data: 'private-result' }; },
    }; } });
    let step = 0;
    h.state.generate = withLoadedTools(['probe'], async () => step++ === 0
        ? { text: narration, toolCalls: [{ id: 'same-id', name: 'Probe', arguments: '{}' }] } : { text: 'done' });
    const sent = await h.request('send', { text: 'check' });
    while (!finish) { await tick(); }
    const live = h.runtime.live();
    assert.equal(live.process.length, 2);
    assert.equal(live.process[1].text, narration);
    assert.equal(live.process[1].tools[0].status, 'reading');
    let revision = h.conversation.read().revision;
    assert.equal((await h.request('process', { turnId: sent.turnId, revision }))[1].tools[0].status, 'reading');
    finish(); await settled(h.runtime);
    revision = h.conversation.read().revision;
    const completed = await h.request('process', { turnId: sent.turnId, revision });
    assert.equal(completed[1].tools[0].status, 'read');
    assert.equal(completed[1].text, narration);
    assert.equal(h.pushed.some(message => JSON.stringify(message).includes('private-result')), false);
    const reload = await administratorHarness(h.state.persisted.partitions);
    assert.deepEqual(await reload.request('process', { turnId: sent.turnId, revision }), completed);
    assert.equal(reload.state.requests.length, 0);
    await assert.rejects(h.request('process', { turnId: sent.turnId, revision: revision - 1 }));
});

test('undispatched tools distinguish running queues from a stopped batch, without implying success', () => {
    const turn = { id: 'turn', createdAt: 1, user: null, assistant: null, operations: [], status: 'interrupted', error: '', toolMessages: [
        { role: 'assistant', content: 'preface', toolCalls: [{ id: 'a', name: 'Read', arguments: '{}' }] },
        { role: 'tool', toolName: 'Read', toolCallId: 'a', content: JSON.stringify({ ok: false, status: 'failed', code: 'tool_not_executed' }) },
    ] };
    assert.equal(administratorProcess(turn, true)[0].tools[0].status, 'queued');
    assert.equal(administratorProcess(turn)[0].tools[0].status, 'not-executed');
});

test('a retained stopped process cannot keep reporting tools as running', () => {
    const turn = { id: 'turn', createdAt: 1, user: null, assistant: null, status: 'failed', error: '',
        operations: [], toolMessages: [
            { role: 'assistant', content: 'preface', toolCalls: [{ id: 'a', name: 'Write', arguments: '{}' }] },
            { role: 'tool', toolName: 'Write', toolCallId: 'a', content: JSON.stringify({ status: 'unconfirmed' }) },
        ] };
    for (const [running, stopped] of [['saving', 'unconfirmed'], ['reading', 'failed']]) {
        turn.operations = [{ id: 'run:1:a', appId: 'probe', name: 'Write', target: '', status: running, elapsedMs: 1, summary: '' }];
        assert.equal(administratorProcess(turn, true)[0].tools[0].status, running);
        assert.equal(administratorProcess(turn)[0].tools[0].status, stopped);
        assert.equal(turn.operations[0].status, running);
    }
});

// The save boundary, rather than a mocked UI prop, proves the failed run remains
// readable without promoting it into confirmed history or dispatching again.
for (const status of ['failed', 'unconfirmed']) {
    for (const recovery of ['confirm', 'adopt', 'switch-chat']) {
        test(`${status} history save retains the complete process until ${recovery}`, async () => {
            const h = await administratorHarness(); let finishSave;
            const narration = 'unsaved narration '.repeat(500);
            h.state.generate = async () => ({ text: narration, toolCalls: [{ id: 'load', name: 'ToolsLoad', arguments: '{}' }] });
            h.state.replace = async input => {
                if (input.candidate.partitions.administrator?.turns[0]?.toolMessages.length) {
                    await new Promise(resolve => { finishSave = resolve; });
                    return status === 'failed' ? { status, error: { code: 'offline', message: 'offline', retryable: true } } : { status, observed: h.state.persisted };
                }
                h.state.persisted = structuredClone(input.candidate); return { status: 'confirmed' };
            };
            const sent = await h.request('send', { text: 'request' });
            while (!finishSave) { await tick(); }
            assert.equal(h.runtime.live().process[0].text, narration);
            finishSave(); await settled(h.runtime);
            const failed = h.pushed.filter(message => message.type === 'administrator/state').at(-1).payload.state;
            assert.equal(failed.live, null); assert.equal(failed.unsaved, true);
            assert.equal(failed.page.rows[1].processCount, 0);
            assert.equal(failed.unsavedProcess.turnId, sent.turnId);
            assert.equal(failed.unsavedProcess.rounds[0].text, narration);
            assert.equal(failed.unsavedProcess.rounds[0].tools[0].status, 'not-executed');
            assert.equal(h.conversation.read().turns[0].toolMessages.length, 0);
            const revision = h.conversation.read().revision;
            assert.deepEqual(await h.request('process', { turnId: sent.turnId, revision }), failed.unsavedProcess.rounds);
            h.controller.deactivate();
            const reopened = await h.controller.activate({ isCurrent: () => true, activationToken: 'reopen', post: () => true });
            assert.deepEqual(reopened.unsavedProcess, failed.unsavedProcess);
            const requests = h.state.requests.length;
            h.state.replace = null;
            if (recovery === 'switch-chat') {
                await h.controller.handleChatChanged();
            } else {
                const recovered = await h.request(recovery);
                assert.equal(recovered.unsavedProcess, null);
                assert.equal(recovered.unsaved, false);
                const process = await h.request('process', { turnId: sent.turnId, revision: recovered.page.revision });
                assert.deepEqual(process.map(round => round.text), recovery === 'confirm' ? [narration] : []);
            }
            assert.equal(h.runtime.unsavedProcess(), null);
            assert.equal(h.state.requests.length, requests);
        });
    }
}
