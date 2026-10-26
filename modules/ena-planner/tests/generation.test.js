import test from 'node:test';
import { setImmediate } from 'node:timers';
import assert from 'node:assert/strict';
import { createPlannerGeneration } from '../ena-planner-generation.js';

const tick = () => new Promise(resolve => setImmediate(resolve));
function fixture(overrides = {}) {
    const chat = [{ is_user: true, mes: 'input' }];
    const state = { chatId: 'a', chat, slot: null, calls: [], errors: [], stops: 0, aborts: 0,
        commits: 0, sourceSaves: 0, run: null, actions: null };
    let marker = 0;
    const host = {
        identity: () => state.chatId, chat: () => state.chat, enabled: () => true,
        createMarker: () => `slot-${++marker}`, resolveApi: async () => ({ model: 'fixture' }),
        saveSource: async () => { state.sourceSaves++; },
        reserveSlot(_chat, _source, value) { state.slot = value; return () => { if (state.slot === value) state.slot = null; }; },
        orderHooks() {}, stop: () => state.stops++,
        preview(run, actions) { state.run = run; state.actions = actions; },
        clearPreview() {}, onError: error => state.errors.push(error), checkBudget: async () => {},
        plan: async (context, options) => { state.calls.push({ context, options }); return { filtered: '<plot>plan</plot>' }; },
        commit: async (run, plan) => {
            run.source.mes = `${run.sourceText}\n\n${plan}`;
            run.saveState = { applied: true, text: run.source.mes, plan, status: 'confirmed' };
            state.commits++;
        },
        ...overrides,
    };
    const runtime = createPlannerGeneration(host);
    const prepare = (type = 'normal', dispatch) => runtime.prepare(chat, 100, () => state.aborts++, type, dispatch);
    const payload = () => {
        const data = { messages: [{ role: 'system', content: 'resolved worldbook\ncurrent recall' },
            { role: 'user', content: state.slot }], api_key: 'not for planner' };
        runtime.bindRequest(data, 'messages');
        return data;
    };
    async function start() {
        await prepare();
        const data = payload();
        const pending = runtime.consume(data);
        await tick();
        return { data, pending };
    }
    return { state, host, runtime, prepare, payload, start };
}

test('preview keeps native turn suspended and source saved; only Send commits and releases it', async () => {
    const f = fixture();
    const { data, pending } = await f.start();
    let finished = false;
    pending.then(() => { finished = true; }, assert.fail);
    await tick();
    assert.equal(f.state.sourceSaves, 1);
    assert.equal(f.state.commits, 0);
    assert.equal(f.state.chat[0].mes, 'input');
    assert.equal(finished, false);
    assert.equal(f.state.run.phase, 'preview');
    assert.throws(() => JSON.stringify(data), { name: 'AbortError' });
    await f.state.actions.send();
    await pending;
    assert.equal(f.state.calls.length, 1);
    assert.deepEqual(f.state.calls[0].context, [{ role: 'system', content: 'resolved worldbook\ncurrent recall' }]);
    assert.equal(f.state.chat.length, 1);
    assert.equal(f.state.chat[0].mes, 'input\n\n<plot>plan</plot>');
    assert.equal(data.messages[1].content, '<plot>plan</plot>');
    assert.equal(JSON.parse(JSON.stringify(data)).api_key, 'not for planner');
    assert.equal(f.state.commits, 1);
    assert.equal(f.state.stops, 0);
});

test('stream Stop preserves partial preview and ignores a late provider result; Send adopts it', async () => {
    let finish;
    const f = fixture({ plan: async (_context, options) => {
        options.onPreview('<plot>partial');
        return new Promise(resolve => { finish = resolve; });
    } });
    const { data, pending } = await f.start();
    assert.equal(f.state.run.phase, 'planning');
    f.state.actions.stop();
    assert.equal(f.state.run.phase, 'stopped');
    assert.equal(f.state.run.previewText, '<plot>partial');
    finish({ filtered: '<plot>late</plot>' });
    await tick();
    assert.equal(f.state.run.previewText, '<plot>partial');
    assert.equal(f.state.stops, 0);
    await f.state.actions.send();
    await pending;
    assert.equal(data.messages[1].content, '<plot>partial');
    assert.equal(f.state.chat.length, 1);
});

test('replanning uses the captured context without a second user message or unconfirmed plan', async () => {
    const f = fixture();
    const { pending } = await f.start();
    await f.state.actions.replan();
    assert.equal(f.state.calls.length, 2);
    assert.deepEqual(f.state.calls[0].context, f.state.calls[1].context);
    assert.equal(f.state.chat[0].mes, 'input');
    assert.equal(f.state.chat.length, 1);
    assert.equal(f.state.sourceSaves, 1);
    assert.equal(f.state.commits, 0);
    await f.state.actions.send();
    await pending;
});

for (const kind of ['missing', 'duplicate', 'absent-field']) test(`${kind} slot before binding explicitly stops transport`, async () => {
    const f = fixture();
    await f.prepare();
    const data = kind === 'absent-field' ? {} : { prompt: kind === 'missing' ? 'no slot' : f.state.slot.repeat(2) };
    assert.equal(f.runtime.bindRequest(data, 'prompt'), false);
    assert.equal(f.state.stops, kind === 'duplicate' ? 1 : 0);
    assert.equal(f.state.errors.length, 1);
    assert.equal(f.state.calls.length, 0);
    assert.throws(() => JSON.stringify(data), { name: 'AbortError' });
    if (kind !== 'duplicate') assert.equal(f.runtime.ready(), true);
});

test('slot removed after binding fails before the planner and blocks transport even if host signal is replaced', async () => {
    const f = fixture();
    await f.prepare();
    const data = f.payload();
    data.messages.pop();
    await f.runtime.consume(data);
    assert.equal(f.state.stops, 1);
    assert.equal(f.state.calls.length, 0);
    assert.throws(() => JSON.stringify(data), { name: 'AbortError' });
});

for (const kind of ['empty', 'api', 'budget', 'save']) test(`${kind} error never releases native request or discards original`, async () => {
    const f = fixture({
        ...(kind === 'empty' ? { plan: async () => ({ filtered: '' }) } : {}),
        ...(kind === 'api' ? { plan: async () => { throw new Error('api'); } } : {}),
        ...(kind === 'budget' ? { checkBudget: async () => { throw new Error('budget'); } } : {}),
        ...(kind === 'save' ? { commit: async () => { throw new Error('save'); } } : {}),
    });
    const { data, pending } = await f.start();
    if (['budget', 'save'].includes(kind)) await f.state.actions.send();
    assert.equal(f.state.run.phase, 'error');
    assert.equal(f.state.errors.length, 1);
    assert.equal(f.state.chat[0].mes, 'input');
    assert.throws(() => JSON.stringify(data), { name: 'AbortError' });
    f.runtime.cancel();
    await pending;
});

test('uncertain save retry retains the same run and plan without repeating the model', async () => {
    let attempts = 0;
    const f = fixture({ commit: async (run, plan) => {
        attempts++;
        run.saveState = { applied: true, text: `input\n\n${plan}`, plan, status: attempts === 1 ? 'uncertain' : 'confirmed' };
        run.source.mes = run.saveState.text;
        if (attempts === 1) throw new Error('readback failed');
    } });
    const { data, pending } = await f.start();
    const run = f.state.run;
    await f.state.actions.send();
    assert.equal(f.state.run.phase, 'error');
    await f.state.actions.replan();
    assert.equal(f.state.calls.length, 1);
    await f.state.actions.send();
    await pending;
    assert.equal(f.state.run, run);
    assert.equal(attempts, 2);
    assert.equal(f.state.calls.length, 1);
    assert.equal(JSON.parse(JSON.stringify(data)).messages[1].content, '<plot>plan</plot>');
});

test('double Send while saving cannot double commit', async () => {
    let finish;
    const f = fixture({ commit: async (run, plan) => {
        f.state.commits++;
        await new Promise(resolve => { finish = resolve; });
        run.source.mes = `input\n\n${plan}`;
        run.saveState = { applied: true, text: run.source.mes, plan };
    } });
    const { pending } = await f.start();
    const send = f.state.actions.send();
    await tick();
    await f.state.actions.send();
    assert.equal(f.state.commits, 1);
    finish();
    await send;
    await pending;
});

for (const action of ['stop-host', 'chat-change', 'edit', 'delete', 'disable']) test(`${action} invalidates pending request and rejects late output`, async () => {
    let finish;
    const f = fixture({ plan: () => new Promise(resolve => { finish = resolve; }) });
    const { data, pending } = await f.start();
    if (action === 'chat-change') { f.state.chatId = 'b'; f.runtime.cancel(true, true); }
    else if (action === 'edit') { f.state.chat[0].mes = 'edited'; f.runtime.sourceEdited(0); }
    else if (action === 'delete') { f.state.chat.splice(0, 1); f.runtime.sourceDeleted(); }
    else f.runtime.cancel(true);
    finish({ filtered: '<plot>late</plot>' });
    await pending;
    await tick();
    assert.equal(f.state.commits, 0);
    assert.equal(f.state.stops, 1);
    assert.throws(() => JSON.stringify(data), { name: 'AbortError' });
});

for (const field of ['prompt', 'input']) test(`${field} and CFG keep native prefix and only adopt after Send`, async () => {
    const f = fixture({ checkBudget: async (data, run) => {
        assert.deepEqual(run.companionFields, ['negative_prompt']);
        assert.equal(data.negative_prompt, 'negative <plot>plan</plot>');
    } });
    await f.prepare();
    const data = { [field]: `positive ${f.state.slot}\nassistant:`, negative_prompt: `negative ${f.state.slot}` };
    f.runtime.bindRequest(data, field, ['negative_prompt']);
    const pending = f.runtime.consume(data);
    await tick();
    await f.state.actions.send();
    await pending;
    assert.equal(data[field], 'positive <plot>plan</plot>\nassistant:');
    assert.equal(data.negative_prompt, 'negative <plot>plan</plot>');
    assert.deepEqual(f.state.calls[0].context, [{ role: 'text', content: 'positive \nassistant:' }]);
});

test('quiet calls cannot claim or modify the foreground request', async () => {
    const f = fixture();
    await f.prepare();
    const data = f.payload();
    await f.prepare('quiet');
    const quiet = structuredClone(data);
    f.runtime.stripSlot(quiet, 'messages');
    assert.equal(quiet.messages[1].content, '');
    await f.runtime.consume(quiet);
    assert.equal(f.state.calls.length, 0);
    const pending = f.runtime.consume(data);
    await tick();
    await f.state.actions.send();
    await pending;
    assert.equal(f.state.calls.length, 1);
});

test('a request arriving after cancellation is blocked without taking a newer run', async () => {
    const f = fixture();
    await f.prepare();
    const marker = f.state.slot;
    f.runtime.cancel(false);
    assert.equal(f.state.slot, marker);
    const old = { prompt: `old ${marker}` };
    assert.equal(f.runtime.bindRequest(old, 'prompt'), false);
    assert.throws(() => JSON.stringify(old), { name: 'AbortError' });
    assert.equal(f.state.slot, null);
    await f.prepare();
    const nextMarker = f.state.slot;
    assert.equal(f.runtime.bindRequest({ prompt: `old ${marker}` }, 'prompt'), false);
    assert.equal(f.state.slot, nextMarker);
    assert.equal(f.runtime.ready(), true);
    const pending = f.runtime.consume(f.payload());
    await tick();
    await f.state.actions.send();
    await pending;
    assert.equal(f.state.commits, 1);
});

test('a cancelled unbound request with a lost marker also fails closed', async () => {
    const f = fixture();
    await f.prepare();
    f.runtime.cancel(false);
    const data = { prompt: 'formatter removed the marker' };
    assert.equal(f.runtime.bindRequest(data, 'prompt'), false);
    assert.throws(() => JSON.stringify(data), { name: 'AbortError' });
    // Unknown identity cannot consume the retired run's marker. Its genuine
    // late payload must still be rejected, even after another unknown arrives.
    assert.notEqual(f.state.slot, null);
    const late = { prompt: f.state.slot };
    assert.equal(f.runtime.bindRequest(late, 'prompt'), false);
    assert.throws(() => JSON.stringify(late), { name: 'AbortError' });
    assert.equal(f.state.slot, null);
});

test('preflight failure preserves saved source and stops before native preparation', async () => {
    const f = fixture({ resolveApi: async () => { throw new Error('no preset'); } });
    await f.prepare();
    assert.equal(f.state.sourceSaves, 1);
    assert.equal(f.state.stops, 1);
    assert.equal(f.state.aborts, 1);
    assert.equal(f.state.slot, null);
});

test('a new foreground replaces unbound preparation after a native early return', async () => {
    const f = fixture();
    await f.prepare();
    const oldMarker = f.state.slot;
    const oldRun = f.state.run;
    // Model the host returning (e.g. Horde adjustment failure) without emitting
    // either transport event or a request-scoped stop. No synthetic cancel.
    await f.prepare('regenerate');
    assert.equal(f.state.aborts, 0);
    assert.equal(f.state.stops, 0);
    assert.equal(oldRun.controller.signal.aborted, true);
    assert.notEqual(f.state.slot, oldMarker);
    const current = f.state.run;
    const unknown = { prompt: 'background with a lost correlation token' };
    assert.equal(f.runtime.bindRequest(unknown, 'prompt'), false);
    assert.throws(() => JSON.stringify(unknown), { name: 'AbortError' });
    assert.equal(f.state.run, current);
    assert.equal(f.runtime.ready(), true);
    const old = { prompt: `old ${oldMarker}` };
    assert.equal(f.runtime.bindRequest(old, 'prompt'), false);
    assert.throws(() => JSON.stringify(old), { name: 'AbortError' });
    const data = f.payload();
    const pending = f.runtime.consume(data);
    await tick();
    await f.state.actions.send();
    await pending;
    assert.equal(f.state.calls.length, 1);
    assert.equal(f.state.commits, 1);
    assert.equal(f.state.stops, 0);
});

test('mixed old and current markers reject only the ambiguous payload', async () => {
    const f = fixture();
    await f.prepare();
    const oldMarker = f.state.slot;
    await f.prepare();
    const current = f.state.run;
    const mixed = { prompt: `${oldMarker} ${f.state.slot}` };
    assert.equal(f.runtime.bindRequest(mixed, 'prompt'), false);
    assert.throws(() => JSON.stringify(mixed), { name: 'AbortError' });
    assert.equal(f.state.run, current);
    assert.equal(f.runtime.ready(), true);
    assert.equal(f.state.stops, 0);
    f.runtime.cancel(false);
});

test('new generation cannot silently discard a pending preview', async () => {
    const f = fixture();
    const { pending } = await f.start();
    const run = f.state.run;
    await f.prepare();
    assert.equal(f.state.aborts, 1);
    assert.equal(f.state.run, run);
    assert.equal(f.state.calls.length, 1);
    f.runtime.cancel();
    await pending;
});

async function failedSave({ applied = true, recovery } = {}) {
    let attempts = 0;
    const f = fixture({ commit: async (run, plan) => {
        attempts++;
        if (attempts === 1) {
            run.saveState = { attempted: true, applied, text: `input\n\n${plan}`, plan,
                status: applied ? 'uncertain' : 'failed', writePending: false };
            if (applied) run.source.mes = run.saveState.text;
            throw new Error('save unresolved');
        }
        if (recovery) await recovery(run);
        run.saveState.status = 'confirmed';
        run.saveState.applied = true;
        run.source.mes = run.saveState.text;
    } });
    const start = await f.start();
    await f.state.actions.send();
    return { ...f, ...start, attempts: () => attempts };
}

test('an active uncertain save blocks every foreground type before the plot skip rule', async () => {
    const f = await failedSave();
    for (const type of ['normal', 'regenerate', 'continue', 'swipe']) await f.prepare(type);
    assert.equal(f.state.aborts, 4);
    assert.equal(f.attempts(), 1);
    f.runtime.cancel();
    await f.pending;
});

test('host Stop retains uncertain transaction; subsequent generation confirms without another model', async () => {
    const f = await failedSave();
    f.runtime.cancel(false);
    await f.pending;
    await f.prepare('regenerate');
    assert.equal(f.attempts(), 2);
    assert.equal(f.state.calls.length, 1);
    assert.equal(f.state.aborts, 0);
    assert.equal(f.state.slot, null);
    assert.throws(() => JSON.stringify(f.data), { name: 'AbortError' });
});

test('definite failure recovery aborts the stale native snapshot and adopts it on the next generation', async () => {
    const f = await failedSave({ applied: false });
    f.runtime.cancel(false);
    await f.pending;
    const staleCopy = structuredClone(f.state.chat);
    await f.runtime.prepare(staleCopy, 100, () => f.state.aborts++, 'regenerate');
    assert.equal(f.state.aborts, 1);
    assert.equal(f.state.chat[0].mes, 'input\n\n<plot>plan</plot>');
    assert.equal(staleCopy[0].mes, 'input');
    await f.prepare('regenerate');
    assert.equal(f.state.aborts, 1);
    assert.equal(f.state.calls.length, 1);
    assert.equal(f.attempts(), 2);
});

test('cancel during recovery aborts the host interceptor even if read-back finishes successfully', async () => {
    let finish;
    const f = await failedSave({ recovery: () => new Promise(resolve => { finish = resolve; }) });
    f.runtime.cancel(false);
    await f.pending;
    const recovery = f.prepare('regenerate');
    await tick();
    f.runtime.cancel(false);
    finish();
    await recovery;
    assert.equal(f.state.aborts, 1);
    assert.equal(f.state.calls.length, 1);
    assert.equal(f.state.slot, null);
});

test('concurrent recovery cannot replace the first controller or authorize two requests', async () => {
    let finish;
    const f = await failedSave({ recovery: () => new Promise(resolve => { finish = resolve; }) });
    f.runtime.cancel(false);
    await f.pending;
    const first = f.prepare('regenerate');
    await tick();
    const controller = f.state.run.controller;
    await f.prepare('normal');
    assert.equal(f.state.run.controller, controller);
    assert.equal(f.attempts(), 2);
    assert.equal(f.state.aborts, 1);
    finish();
    await first;
});

for (const kind of ['edit', 'move']) test(`${kind} supersedes a settled cancelled transaction instead of blocking the chat forever`, async () => {
    const f = await failedSave();
    f.runtime.cancel(false);
    await f.pending;
    if (kind === 'edit') {
        f.state.chat[0].mes = 'edited user text';
        f.runtime.sourceEdited(0);
    } else {
        f.state.chat.unshift({ is_user: false, mes: 'inserted history' });
        f.runtime.sourceDeleted();
    }
    await f.prepare();
    assert.equal(f.attempts(), 1);
    assert.equal(f.state.aborts, 0);
    f.runtime.cancel();
});

test('confirmed plain-text plan cancelled before continuation remains adopted', async () => {
    const f = fixture({
        plan: async () => ({ filtered: 'plain plan' }),
        commit: async (run, plan) => {
            run.source.mes = `input\n\n${plan}`;
            run.saveState = { attempted: true, applied: true, text: run.source.mes, plan, status: 'confirmed' };
            f.runtime.cancel(false);
        },
    });
    const { pending } = await f.start();
    await f.state.actions.send();
    await pending;
    await f.prepare('regenerate');
    assert.equal(f.state.slot, null);
    assert.equal(f.state.sourceSaves, 1);
});
