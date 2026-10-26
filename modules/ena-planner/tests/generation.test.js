import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlannerGeneration } from '../ena-planner-generation.js';

// Acceptance contracts (silent state corruption / paid-request risk):
// - The planner consumes one native request, never retrieves or evaluates it.
// - Failure/cancellation prevents dispatch, preserving the user's source.
// - Retry does not add a message; stale/chat-switched/quiet runs cannot claim it.
// - Debug only projects the current chat's last captured text.
function fixture(overrides = {}) {
    const chat = [{ is_user: true, mes: 'input' }];
    const state = { chatId: 'a', chat, slot: null, calls: [], errors: [], stops: 0, aborts: 0, commits: 0, requests: 0 };
    let nextMarker = 0;
    const host = {
        identity: () => state.chatId, chat: () => state.chat, enabled: () => true,
        createMarker: () => `slot-${++nextMarker}`, resolveApi: async () => ({ model: 'fixture' }),
        reserveSlot(_chat, _source, marker) {
            state.slot = marker;
            return () => { if (state.slot === marker) state.slot = null; };
        },
        orderHooks() {}, stop: () => state.stops++, notice: () => () => {},
        onError: error => state.errors.push(error), checkBudget: async () => {},
        plan: async (context, options) => { state.calls.push({ context, options }); return { filtered: '<plot>plan</plot>' }; },
        commit: async (run, text) => { run.source.mes += `\n\n${text}`; state.commits++; },
        ...overrides,
    };
    const runtime = createPlannerGeneration(host);
    const prepare = (type = 'normal', dispatch) => runtime.prepare(chat, 100, () => state.aborts++, type, dispatch);
    const payload = () => { const data = { messages: [
        { role: 'system', content: 'resolved worldbook\ncurrent recall' },
        { role: 'user', content: state.slot },
    ], api_key: 'not for planner' }; runtime.bindRequest(data, 'messages'); return data; };
    return { state, host, runtime, prepare, payload };
}

test('consumes resolved context once, fills the native request and saves to the same user message', async () => {
    const f = fixture();
    await f.prepare();
    const data = f.payload();
    await f.runtime.consume(data, 'messages');
    await f.runtime.consume(data, 'messages');
    assert.equal(f.state.calls.length, 1);
    assert.deepEqual(f.state.calls[0].context, [{ role: 'system', content: 'resolved worldbook\ncurrent recall' }]);
    assert.equal(f.state.chat.length, 1);
    assert.equal(f.state.chat[0].mes, 'input\n\n<plot>plan</plot>');
    assert.equal(data.messages[1].content, '<plot>plan</plot>');
    assert.equal(data.api_key, 'not for planner');
    assert.equal(f.state.slot, null);
    assert.equal(f.state.stops, 0);
    assert.equal(f.state.commits, 1);
});

for (const reason of ['missing-slot', 'duplicate-slot', 'empty', 'api', 'budget', 'save']) {
    test(`${reason} stops the host before dispatch and keeps the user message`, async () => {
        const f = fixture({
            ...(reason === 'empty' ? { plan: async () => ({ filtered: '' }) } : {}),
            ...(reason === 'api' ? { plan: async () => { throw new Error('fixture'); } } : {}),
            ...(reason === 'budget' ? { checkBudget: async () => { throw new Error('budget'); } } : {}),
            ...(reason === 'save' ? { commit: async () => { throw new Error('save'); } } : {}),
        });
        await f.prepare();
        const data = f.payload();
        if (reason === 'missing-slot') data.messages.pop();
        if (reason === 'duplicate-slot') data.messages.push({ role: 'user', content: f.state.slot });
        await f.runtime.consume(data, 'messages');
        assert.equal(f.state.stops, 1);
        assert.equal(f.state.errors.length, 1);
        assert.equal(f.state.chat[0].mes, 'input');
        assert.equal(f.state.slot, null);
    });
}

test('native text completion keeps the assistant prefix after filling the reserved position', async () => {
    const f = fixture();
    await f.prepare();
    const data = { prompt: `System: memory\nUser: input\nUser: ${f.state.slot}\nAssistant:` };
    f.runtime.bindRequest(data, 'prompt');
    await f.runtime.consume(data, 'prompt');
    assert.equal(data.prompt, 'System: memory\nUser: input\nUser: <plot>plan</plot>\nAssistant:');
    assert.equal(f.state.calls.length, 1);
});

test('failed planning retries the same message without another user floor', async () => {
    let attempts = 0;
    const f = fixture({ plan: async () => {
        if (++attempts === 1) throw new Error('fixture');
        return { filtered: '<plot>retry</plot>' };
    } });
    await f.prepare();
    await f.runtime.consume(f.payload(), 'messages');
    await f.prepare('regenerate');
    await f.runtime.consume(f.payload(), 'messages');
    assert.equal(attempts, 2);
    assert.equal(f.state.chat.length, 1);
    assert.equal(f.state.chat[0].mes, 'input\n\n<plot>retry</plot>');
    await f.prepare('regenerate');
    assert.equal(f.state.slot, null);
});

for (const action of ['stop', 'chat-change', 'edit', 'disable', 'unload']) {
    test(`${action} during planning never commits a late result`, async () => {
        let finish;
        const f = fixture({ plan: () => new Promise(resolve => { finish = resolve; }) });
        await f.prepare();
        const data = f.payload();
        const pending = f.runtime.consume(data, 'messages');
        if (action === 'chat-change') { f.state.chatId = 'b'; f.runtime.cancel(true, true); }
        else if (action === 'edit') f.state.chat[0].mes = 'edited';
        else f.runtime.cancel(true);
        finish({ filtered: '<plot>late</plot>' });
        await pending;
        assert.equal(f.state.commits, 0);
        assert.equal(f.state.stops, 1);
        assert.equal(f.state.slot, null);
        assert.equal(f.runtime.context() === null, action === 'chat-change');
    });
}

test('quiet dispatch and diagnostic reads cannot consume or change the foreground result', async () => {
    const f = fixture();
    await f.prepare();
    const data = f.payload();
    await f.prepare('quiet');
    const quiet = structuredClone(data);
    f.runtime.stripSlot(quiet, 'messages');
    assert.equal(quiet.messages[1].content, '');
    assert.equal(data.messages[1].content, f.state.slot);
    await f.runtime.consume(data, 'messages');
    const first = structuredClone(f.runtime.context());
    assert.deepEqual(f.runtime.context(), first);
    assert.equal(f.state.calls.length, 1);
    assert.equal(f.state.commits, 1);
    f.state.chatId = 'b';
    assert.equal(f.runtime.context(), null);
});

test('failed API preflight and an aborted recall dispatch stop before native preparation', async () => {
    const f = fixture({ resolveApi: async () => { throw new Error('no preset'); } });
    await f.prepare();
    assert.equal(f.state.stops, 1);
    assert.equal(f.state.aborts, 1);
    assert.equal(f.state.slot, null);
    const g = fixture();
    const controller = new AbortController();
    controller.abort();
    await g.prepare('normal', { signal: controller.signal });
    assert.equal(g.state.stops, 1);
    assert.equal(g.state.aborts, 1);
    assert.equal(g.state.slot, null);
});

test('an unrelated request cannot claim an awaiting foreground plan', async () => {
    const f = fixture();
    await f.prepare();
    const foreground = f.payload();
    const background = structuredClone(foreground);
    f.runtime.bindRequest(background, 'messages');
    await f.runtime.consume(background, 'messages');
    assert.equal(f.state.calls.length, 0);
    assert.equal(f.state.stops, 0);
    await f.runtime.consume(foreground, 'messages');
    assert.equal(f.state.calls.length, 1);
    assert.equal(f.state.commits, 1);
});

test('a cancelled payload arriving before the next payload cannot claim the next run', async () => {
    const f = fixture();
    await f.prepare();
    const stale = { messages: [{ role: 'user', content: f.state.slot }] };
    f.runtime.cancel(true);
    await f.prepare('regenerate');
    assert.equal(f.runtime.bindRequest(stale, 'messages'), false);
    await f.runtime.consume(stale);
    assert.equal(f.state.stops, 1);
    await f.runtime.consume(f.payload());
    assert.equal(f.state.calls.length, 1);
    assert.equal(f.state.commits, 1);
});

for (const field of ['prompt', 'input']) test(`${field} binds only its own marker and fills before the native prefix`, async () => {
    const f = fixture();
    await f.prepare();
    assert.equal(f.runtime.bindRequest({ [field]: 'background' }, field), false);
    const data = { [field]: `user ${f.state.slot}\nassistant:` };
    assert.equal(f.runtime.bindRequest(data, field), true);
    await f.runtime.consume(data);
    assert.equal(data[field], 'user <plot>plan</plot>\nassistant:');
    assert.equal(f.state.commits, 1);
});

test('CFG companions receive the same plan without entering the planning request twice', async () => {
    const f = fixture();
    await f.prepare();
    const data = { prompt: `positive ${f.state.slot}`, negative_prompt: `negative ${f.state.slot}` };
    f.runtime.bindRequest(data, 'prompt', ['negative_prompt']);
    await f.runtime.consume(data);
    assert.equal(data.prompt, 'positive <plot>plan</plot>');
    assert.equal(data.negative_prompt, 'negative <plot>plan</plot>');
    assert.deepEqual(f.state.calls[0].context, [{ role: 'text', content: 'positive ' }]);
});

test('a duplicate marker before binding stops rather than quietly sending a malformed prompt', async () => {
    const f = fixture();
    await f.prepare();
    assert.equal(f.runtime.bindRequest({ prompt: f.state.slot.repeat(2) }, 'prompt'), false);
    assert.equal(f.state.stops, 1);
    assert.equal(f.state.calls.length, 0);
});

test('editing the completed source clears its captured context without cancelling another message', async () => {
    const f = fixture();
    await f.prepare();
    await f.runtime.consume(f.payload());
    assert.ok(f.runtime.context());
    f.state.chat.push({ is_user: true, mes: 'next' });
    f.runtime.sourceEdited(1);
    assert.ok(f.runtime.context());
    f.runtime.sourceEdited(0);
    assert.equal(f.runtime.context(), null);
    assert.equal(f.state.stops, 0);
});
