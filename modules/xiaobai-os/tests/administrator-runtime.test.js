import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled, tick, withLoadedTools, COMMON_TOOL_NAMES } from './administrator-harness.js';
import { createAdministratorData } from '../apps/administrator/domain/data.js';
import { administratorPage } from '../apps/administrator/application/projection.js';
import { ADMINISTRATOR_POLICY } from '../apps/administrator/domain/policy.js';
import { administratorTurnMessages, historyBefore } from '../apps/administrator/agent/history.js';

const call = (name, args, id = 'test-call') => ({ text: '', toolCalls: [{ id, name, arguments: JSON.stringify(args) }] });
const userTurn = (id, assistant = '原回复') => ({ id, createdAt: 1, user: { text: '请检查任务' }, assistant, toolMessages: [], operations: [], status: 'finished', error: '' });

test('live activity follows observed stream changes, retains prose between thinking blocks and resets for tool continuation', async t => {
    const h = await administratorHarness();
    const requests = [], completions = [];
    h.state.generate = request => new Promise((resolve, reject) => {
        requests.push(request); completions.push(resolve);
        request.signal.addEventListener('abort', () => reject(request.signal.reason), { once: true });
    });
    t.after(() => h.runtime.reset());
    await h.request('send', { text: 'Check' });
    while (!requests.length) { await tick(); }
    const update = snapshot => requests[0].onStreamProgress(snapshot);
    assert.equal(h.runtime.live().phase, 'waiting');
    update({ text: '', thoughts: [] });
    assert.equal(h.runtime.live().phase, 'waiting');
    update({ thoughts: [{ text: 'thinking' }] });
    assert.equal(h.runtime.live().phase, 'thinking');
    update({ text: 'Checking.', thoughts: [{ text: 'thinking' }] });
    assert.equal(h.runtime.live().phase, 'replying');
    update({ thoughts: [{ text: 'thinking more' }] });
    assert.equal(h.runtime.live().phase, 'thinking');
    assert.equal(h.runtime.live().text, 'Checking.');
    update({ text: 'Checking.', thoughts: [{ text: 'thinking more' }] });
    assert.equal(h.runtime.live().phase, 'thinking', 'Repeated cumulative text is not new reply activity');
    update({ toolCalls: [{ id: 'read', name: 'ChatRead', arguments: '{"from":55}' }] });
    assert.equal(h.runtime.live().phase, 'tools');
    completions[0](call('ChatRead', { from: 55 }, 'read'));
    while (requests.length < 2) { await tick(); }
    assert.equal(h.runtime.live().phase, 'waiting');
    assert.equal(h.runtime.live().text, '');
    update({ activity: 'thinking', text: 'late first request' });
    assert.equal(h.runtime.live().phase, 'waiting');
    assert.equal(h.runtime.live().text, '');
    completions[1]({ text: 'Done.' }); await settled(h.runtime);
    assert.equal(h.runtime.live(), null);
    assert.equal(h.repository.read().turns[0].assistant, 'Done.');
});

test('native reasoning without visible text is observable; stop and regeneration keep activity and timing run-local', async t => {
    t.mock.timers.enable({ apis: ['Date'], now: 50000 });
    const h = await administratorHarness();
    let request, finish;
    h.state.generate = next => new Promise((resolve, reject) => {
        request = next; finish = resolve;
        next.signal.addEventListener('abort', () => reject(next.signal.reason), { once: true });
    });
    t.after(() => h.runtime.reset());
    const sent = await h.request('send', { text: 'Check' });
    while (!request) { await tick(); }
    assert.equal(h.runtime.live().startedAt, 50000);
    request.onStreamProgress({ activity: 'thinking', text: '', thoughts: [] });
    assert.equal(h.runtime.live().phase, 'thinking');
    request.onStreamProgress({ activity: 'waiting', text: '', thoughts: [] });
    assert.equal(h.runtime.live().phase, 'waiting');
    request.onStreamProgress({ activity: 'replying', text: 'First.' });
    request.onStreamProgress({ activity: 'thinking', text: 'First.', thoughts: [] });
    assert.equal(h.runtime.live().phase, 'thinking');
    assert.equal(h.runtime.live().text, 'First.');
    finish({ text: 'First.' }); await settled(h.runtime);
    assert.equal(Object.hasOwn(h.repository.read().turns[0], 'startedAt'), false);
    assert.equal(Object.hasOwn(h.repository.read().turns[0], 'phase'), false);
    const previous = request; request = null; t.mock.timers.tick(8000);
    await h.request('regenerate', { turnId: sent.turnId });
    while (!request) { await tick(); }
    assert.equal(h.runtime.live().startedAt, 58000);
    assert.equal(h.runtime.live().phase, 'waiting');
    previous.onStreamProgress({ activity: 'thinking', text: 'stale reply' });
    assert.equal(h.runtime.live().phase, 'waiting');
    request.onStreamProgress({ activity: 'thinking', text: '', thoughts: [] });
    h.runtime.stop();
    request.onStreamProgress({ activity: 'replying', text: 'late reply' });
    assert.equal(h.runtime.live().phase, 'stopping');
    assert.equal(h.runtime.live().text, '');
    await settled(h.runtime);
    assert.equal(h.runtime.live(), null);
    assert.equal(h.repository.read().turns[0].status, 'interrupted');
});

test('regeneration after repeated provider failures reloads API configuration and sends only the original request', async () => {
    const h = await administratorHarness();
    let config = { api: 'first' };
    const opened = [], openSession = h.gateway.openSession;
    h.gateway.loadConfig = async () => config;
    h.gateway.openSession = async value => { opened.push(value); return openSession(value); };
    const providerError = 'HTTP 429 fixture-private-provider-error';
    h.state.generate = async () => { throw new Error(providerError); };
    const sent = await h.request('send', { text: 'original request' }); await settled(h.runtime);
    const original = structuredClone(h.state.requests[0].messages);
    await h.request('regenerate', { turnId: sent.turnId }); await settled(h.runtime);
    assert.deepEqual(h.state.requests[1].messages, original);
    config = { api: 'replacement' };
    h.state.generate = async () => ({ text: 'new answer' });
    await h.request('regenerate', { turnId: sent.turnId }); await settled(h.runtime);
    assert.deepEqual(opened, [{ api: 'first' }, { api: 'first' }, { api: 'replacement' }]);
    assert.deepEqual(h.state.requests[2].messages, original);
    const turns = h.conversation.read().turns;
    assert.equal(turns.length, 1); assert.equal(turns[0].assistant, 'new answer');
    assert.equal(turns[0].error, ''); assert.equal(turns[0].status, 'finished');
    await assert.rejects(h.request('retry', { turnId: sent.turnId }));
    assert.equal(h.state.requests.length, 3);
});

test('regeneration excludes the target reply, its receipts, later turns and summaries covering them', async () => {
    const turns = [userTurn('before', 'earlier answer'), userTurn('target', 'discarded answer'), userTurn('later', 'later answer')];
    turns.forEach(turn => { turn.user.text = `${turn.id} request`; });
    turns[1].operations = [{ id: 'target-op', appId: 'story', name: 'read', target: '#55', status: 'read', elapsedMs: 1, summary: 'old receipt' }];
    turns[1].assistantPayload = { opaque: 'discarded payload' };
    turns[1].toolMessages = [
        { role: 'assistant', content: 'discarded intermediate text', toolCalls: call('ChatRead', { from: 55 }).toolCalls },
        { role: 'tool', toolName: 'ChatRead', toolCallId: 'test-call', content: JSON.stringify({ data: 'discarded evidence' }) },
    ];
    turns[1].status = 'failed'; turns[1].error = 'HTTP 429';
    const h = await administratorHarness({ administrator: { ...createAdministratorData(), turns, summary: { throughId: 'later', throughToolMessage: null, text: 'contaminated summary' } } });
    await h.request('regenerate', { turnId: 'target' }); await settled(h.runtime);
    const messages = h.state.requests[0].messages;
    assert.deepEqual(messages.slice(1), [
        { role: 'user', content: 'before request' }, { role: 'assistant', content: 'earlier answer' },
        { role: 'user', content: 'target request' },
    ]);
    const reference = JSON.parse(messages[0].content.slice(messages[0].content.indexOf('\n') + 1));
    assert.deepEqual(Object.keys(reference).sort(), ['apps', 'environment', 'readErrors', 'story']);
    assert.deepEqual(h.conversation.read().turns[1].operations, []);
    assert.deepEqual(h.conversation.read().turns[1].toolMessages, []);
    assert.equal(h.conversation.read().turns[1].assistantPayload, undefined);
    assert.deepEqual(h.conversation.read().turns.map(turn => turn.id), ['before', 'target']);
    assert.equal(h.conversation.read().summary, null);
});

test('history retains interrupted reply status and business receipts, but not raw provider errors', () => {
    const failed = { ...userTurn('failed', 'unfinished answer'), status: 'failed', error: 'HTTP 429' };
    const partial = administratorTurnMessages(failed);
    assert.deepEqual(partial.slice(0, 2), [{ role: 'user', content: failed.user.text }, { role: 'assistant', content: failed.assistant }]);
    assert.deepEqual(JSON.parse(partial[2].content.slice(partial[2].content.indexOf('{'))), { status: 'failed', operations: [] });
    failed.operations = [{ id: 'saved', appId: 'world', name: 'edit', target: '', status: 'saved', elapsedMs: 1, summary: 'saved' }];
    const messages = administratorTurnMessages(failed);
    const receipts = JSON.parse(messages[2].content.slice(messages[2].content.indexOf('{')));
    assert.deepEqual(receipts, { status: 'failed', operations: failed.operations });
});

test('corrupt administrator data stays isolated, including JSON null, and explicit clearing recovers the APP', async () => {
    for (const raw of [null, { schemaVersion: 1, turns: 'broken' }]) {
        const h = await administratorHarness({ administrator: raw });
        assert.equal(h.conversation.corrupted(), true);
        await h.world.refreshCurrent(); assert.equal(h.economy.getPlayerBalance(), 100);
        await h.request('clear'); assert.equal(h.conversation.corrupted(), false); assert.deepEqual(h.repository.read().turns, []);
    }
});
test('regeneration runs normal read and write tools with fresh receipts', async () => {
    const turn = userTurn('one'); turn.operations = [{ id: 'old', appId: 'world', name: '修改', target: '', status: 'saved', elapsedMs: 3, summary: 'saved' }];
    const h = await administratorHarness({ administrator: { ...createAdministratorData(), turns: [turn] } });
    let step = 0;
    h.state.generate = withLoadedTools(['world'], async request => {
        assert.equal(request.tools.some(tool => tool.function.name === 'WorldEdit'), true);
        if (step++ === 0) { return call('ChatRead', { from: 55 }, 'read'); }
        if (step === 2) { return call('WorldEdit', { overview: '更正后的概况' }, 'edit'); }
        return { text: '核实了第55楼。' };
    });
    await h.request('regenerate', { turnId: 'one' }); await settled(h.runtime);
    assert.equal(h.world.readCurrent().world.overview, '更正后的概况');
    assert.equal(h.repository.read().turns[0].assistant, '核实了第55楼。');
    assert.deepEqual(h.repository.read().turns[0].operations.map(op => op.status), ['read', 'read', 'saved']);
    assert.equal(h.repository.read().turns[0].operations.some(op => op.id === 'old'), false);
});
test('regeneration saves truncation before requesting the model and confirmation resumes it once', async () => {
    const turns = [userTurn('a'), userTurn('b'), userTurn('c')];
    const h = await administratorHarness({ administrator: { ...createAdministratorData(), turns, summary: { throughId: 'b', throughToolMessage: null, text: 'old summary' } } });
    h.state.generate = async () => ({ text: '新的回复' });
    h.state.replace = async () => ({ status: 'failed', error: { code: 'offline', message: 'offline', retryable: true } });
    await assert.rejects(h.request('regenerate', { turnId: 'a' }));
    assert.equal(h.state.requests.length, 0);
    assert.equal(h.repository.read().turns[0].assistant, '原回复'); assert.equal(h.conversation.unsaved(), true);
    h.state.replace = null; await h.request('confirm'); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].assistant, '新的回复'); assert.equal(h.repository.read().summary, null);
    assert.deepEqual(h.repository.read().turns.map(t => t.id), ['a']);
    await h.request('confirm'); await settled(h.runtime);
    assert.equal(h.state.requests.length, 1);
});
test('successful business write survives a model failure; regeneration does not repeat it', async () => {
    const h = await administratorHarness(); let step = 0;
    h.state.generate = withLoadedTools(['world'], async () => { if (step++ === 0) { return call('WorldEdit', { overview: '记录已更正' }); } throw new Error('provider offline'); });
    const sent = await h.request('send', { text: '把世界概况改为记录已更正' }); await settled(h.runtime);
    assert.equal(h.world.readCurrent().world.overview, '记录已更正');
    const before = h.state.persisted.partitions.world;
    h.state.generate = async () => ({ text: '修改已保存。' });
    await h.request('regenerate', { turnId: sent.turnId }); await settled(h.runtime);
    assert.deepEqual(h.state.persisted.partitions.world, before);
    assert.deepEqual(h.repository.read().turns[0].operations, []);
});

test('clearing populated history advances its revision and confirms an ambiguous save before deleting attachments', async () => {
    const h = await administratorHarness({ administrator: { ...createAdministratorData(), revision: 8, turns: [userTurn('old')] } });
    h.state.replace = async input => { h.state.persisted = structuredClone(input.candidate); return { status: 'unconfirmed', observed: null }; };
    await assert.rejects(h.request('clear'));
    assert.equal(h.state.removed.length, 0);
    h.state.replace = null;
    const writes = h.state.writes.length;
    const state = await h.request('confirm');
    assert.equal(state.page.revision, 9); assert.equal(state.page.total, 0);
    assert.equal(h.state.writes.length, writes);
    assert.deepEqual(h.state.removed, [{ osId: 'admin-os', all: true }]);
});

test('a saved USER tail generates normally without appending another USER', async () => {
    const turn = userTurn('old', null);
    const h = await administratorHarness({ administrator: { ...createAdministratorData(), turns: [turn] } });
    h.state.generate = async request => {
        assert.deepEqual(request.tools.map(tool => tool.function.name), COMMON_TOOL_NAMES);
        assert.deepEqual(request.messages.filter(message => message.role === 'user'), [{ role: 'user', content: turn.user.text }]);
        return { text: '已重新核查。' };
    };
    assert.equal(h.conversation.page().rows.find(row => row.role === 'user').canRegenerate, true);
    await h.request('regenerate', { turnId: 'old' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].assistant, '已重新核查。');
    assert.equal(h.repository.read().turns.length, 1);
    assert.equal(h.world.readCurrent().world.overview, '');
});

test('a failed reroll leaves the truncated conversation and partial reply, not the discarded answer', async () => {
    const turns = [userTurn('before'), userTurn('target'), userTurn('later')];
    const summary = { throughId: 'before', throughToolMessage: null, text: 'earlier confirmed facts' };
    const h = await administratorHarness({ administrator: { ...createAdministratorData(), turns, summary } });
    h.state.generate = async request => {
        assert.deepEqual(h.repository.read().turns.map(turn => turn.id), ['before', 'target']);
        assert.equal(h.repository.read().turns[1].assistant, null);
        request.onStreamProgress({ text: 'unfinished reply' });
        throw new Error('HTTP 429');
    };
    await h.request('regenerate', { turnId: 'target' }); await settled(h.runtime);
    assert.deepEqual(h.repository.read().summary, summary);
    assert.deepEqual(h.repository.read().turns.map(turn => turn.id), ['before', 'target']);
    assert.equal(h.repository.read().turns[1].assistant, 'unfinished reply');
    assert.equal(h.repository.read().turns[1].status, 'failed');
});

test('an unavailable floor is a failed read result, so the model can correct its range within the same exchange', async () => {
    const h = await administratorHarness(); let step = 0;
    h.state.generate = withLoadedTools([], async request => {
        if (step++ === 0) { return call('ChatRead', { from: 999 }, 'missing'); }
        if (step === 2) { assert.equal(JSON.parse(request.messages.at(-1).content).status, 'failed'); return call('ChatRead', { from: 55 }, 'corrected'); }
        return { text: '已核对当前第55楼。' };
    });
    await h.request('send', { text: '查看第55楼' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].status, 'finished');
    assert.deepEqual(h.repository.read().turns[0].operations.map(op => op.status), ['failed', 'read']);
});

test('story pages reach the next model request with direct continuation and stay out of frame progress and receipts', async () => {
    const h = await administratorHarness();
    h.state.messages[55].mes = '原文资料\n"<&>{}🙂'.repeat(1800);
    const expected = h.state.messages.slice(55, 57).map(message => message.mes);
    const joined = ['', ''], returned = [];
    h.state.generate = async request => {
        const message = request.messages.findLast(item => item.role === 'tool' && item.toolName === 'ChatRead');
        if (!message) { return call('ChatRead', { from: 55, to: 56 }); }
        const response = JSON.parse(message.content);
        assert.equal(response.status, 'read');
        assert.ok(Array.isArray(response.data.items));
        for (const item of response.data.items) { joined[item.floor - 55] += item.text; }
        returned.push(response);
        return response.data.next ? call('ChatRead', response.data.next) : { text: '已查阅。' };
    };
    await h.request('send', { text: '查看第55至56楼' }); await settled(h.runtime);
    assert.equal(h.repository.read().turns[0].status, 'finished', h.runtime.error());
    assert.deepEqual(joined, expected);
    assert.ok(returned.length > 1);
    assert.equal(h.state.requests.length, returned.length + 1);
    assert.ok(h.pushed.every(message => JSON.stringify(message).length < 5000));
    assert.deepEqual(h.repository.read().turns[0].toolMessages.filter(message => message.role === 'tool').map(message => JSON.parse(message.content)), returned);
    assert.ok(JSON.stringify(h.repository.read().turns[0].operations).length < 2000);
});

test('concurrent administrator edits expose an adopt path instead of trapping the APP behind an unsavable candidate', async () => {
    const h = await administratorHarness({ administrator: { ...createAdministratorData(), turns: [userTurn('one')] } });
    h.state.generate = async () => {
        h.state.persisted.partitions.administrator.revision++;
        h.state.persisted.partitions.administrator.turns[0].assistant = '另一个窗口保存的回复';
        h.state.persisted.revision++; h.state.persisted.commitId = 'concurrent-save';
        await h.coordinator.refresh();
        return { text: '旧请求生成的回复' };
    };
    await h.request('regenerate', { turnId: 'one' }); await settled(h.runtime);
    assert.equal(h.conversation.conflict(), true); assert.equal(h.conversation.unsaved(), true);
    const adopted = await h.request('adopt');
    assert.equal(adopted.conflict, false); assert.equal(adopted.unsaved, false);
    assert.equal(h.repository.read().turns[0].assistant, '另一个窗口保存的回复');
});
test('image failure retains the user request and attachment; confirmed deletion reclaims only its attachment', async () => {
    const h = await administratorHarness(); h.state.imageFailure = true;
    await h.request('send', { text: '看看这里', image: { name: 'screen.png', dataUrl: 'data:image/png;base64,YQ==' } }); await settled(h.runtime);
    const turn = h.repository.read().turns[0]; assert.equal(turn.user.text, '看看这里'); assert.ok(turn.user.image);
    assert.equal(h.state.requests.length, 0); assert.equal(h.state.removed.length, 0);
    h.state.replace = async () => ({ status: 'unconfirmed', observed: h.state.persisted });
    await assert.rejects(h.request('delete', { turnId: turn.id, role: 'user', revision: h.repository.read().revision }));
    assert.equal(h.state.removed.length, 0);
    h.state.replace = null; await h.request('confirm');
    assert.deepEqual(h.state.removed, [{ osId: 'admin-os', image: turn.user.image }]);
});
test('closing the panel keeps a run alive; changing chat stops subsequent calls and never posts old output into new chat', async () => {
    const h = await administratorHarness(); let finish;
    h.state.generate = request => new Promise((resolve, reject) => { finish = resolve; request.signal.addEventListener('abort', () => reject(request.signal.reason), { once: true }); });
    await h.request('send', { text: '核实一下' }); while (!finish) { await tick(); }
    h.controller.deactivate(); assert.equal(h.runtime.busy(), true);
    h.state.capture.identityKey = 'other-chat'; await h.controller.handleChatChanged();
    finish(call('WorldEdit', { overview: '旧运行不应继续' })); await tick();
    assert.equal(h.state.persisted.partitions.world, undefined);
});
test('history deletion is local, drops affected summary, and frame pages stay bounded for long histories', async () => {
    const turns = Array.from({ length: 100 }, (_, i) => userTurn(String(i), '长'.repeat(9000)));
    const data = { ...createAdministratorData(), turns, summary: { throughId: '50', throughToolMessage: null, text: 'older notes' } };
    assert.equal(historyBefore(data, '20').summary, null);
    const h = await administratorHarness({ administrator: data });
    await h.request('delete', { turnId: '10', role: 'assistant', revision: 0 });
    const actual = h.repository.read(); assert.equal(actual.summary, null); assert.equal(actual.turns.length, 100); assert.equal(actual.turns[11].assistant.length, 9000);
    const page = administratorPage(actual);
    assert.equal(page.rows.length, ADMINISTRATOR_POLICY.pageSize);
    assert.ok(page.rows.every(row => row.text.length <= ADMINISTRATOR_POLICY.textBlock));
    assert.ok(page.rows.every(row => row.processCount === 0));
});
