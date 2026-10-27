import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { webcrypto } from 'node:crypto';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { build } from 'esbuild';

// Mirrors ST EventEmitter's relevant semantics: snapshot listeners, await each,
// swallow listener exceptions, and move (not duplicate) ordered listeners.
// This is an event-contract fixture, not a real ST/Prompt Template/EJS browser run.
class HostEvents {
    events = new Map();
    errors = [];
    on(event, listener) {
        if (!this.events.has(event)) this.events.set(event, []);
        this.events.get(event).push(listener);
    }
    removeListener(event, listener) {
        const listeners = this.events.get(event) || [];
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
    }
    makeFirst(event, listener) {
        this.removeListener(event, listener);
        if (!this.events.has(event)) this.events.set(event, []);
        this.events.get(event).unshift(listener);
    }
    makeLast(event, listener) {
        this.removeListener(event, listener);
        this.on(event, listener);
    }
    async emit(event, ...args) {
        for (const listener of [...(this.events.get(event) || [])]) {
            try { await listener(...args); } catch (error) { this.errors.push(error); }
        }
    }
    count(event) { return (this.events.get(event) || []).length; }
}

const types = Object.fromEntries(['GENERATE_AFTER_DATA', 'CHAT_COMPLETION_SETTINGS_READY',
    'GENERATION_STOPPED', 'GENERATION_ENDED', 'CHAT_CHANGED', 'MESSAGE_EDITED', 'MESSAGE_DELETED']
    .map(name => [name, name]));
const stubs = {
    'script.js': `export const eventSource=__fixture.events, event_types=__fixture.types,
        main_api=__fixture.api, is_send_press=false, updateMessageBlock=()=>{ __fixture.commits++; };
        export function stopGeneration(){ __fixture.stops++; void eventSource.emit(event_types.GENERATION_STOPPED); }`,
    'generate-interceptor.js': `export const GENERATE_INTERCEPTOR_ORDER={ENA_PLANNER:300};
        export function registerGenerateInterceptor(id, handler){ __fixture.registrations++; __fixture.handlers.set(id,handler); }
        export function unregisterGenerateInterceptor(id){ __fixture.unregistrations++; __fixture.handlers.delete(id); }`,
    'ena-planner-preview.js': `export function createPlannerPreview(){ return {
        render(run,actions){ __fixture.run=run; __fixture.actions=actions; }, clear(){}, cleanup(){} }; }`,

};
const built = await build({
    entryPoints: [fileURLToPath(new URL('../ena-planner-host.js', import.meta.url))],
    bundle: true, write: false, format: 'cjs', platform: 'node',
    plugins: [{ name: 'planner-host-boundaries', setup(api) {
        api.onResolve({ filter: /\.js$/ }, ({ path }) => {
            const name = path.split('/').at(-1);
            return Object.hasOwn(stubs, name) ? { path: name, namespace: 'fixture' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents: stubs[path] }));
    } }],
});

function fixture(t, api = 'textgenerationwebui') {
    const f = { api, types, events: new HostEvents(), handlers: new Map(), registrations: 0, unregistrations: 0,
        stops: 0, saves: 0, commits: 0, generations: [], errors: [], plans: [], ejsCalls: new WeakMap(),
        chat: [{ is_user: true, mes: 'user {{EJS}}' }], run: null, actions: null };
    const box = { __fixture: f, module: { exports: {} }, AbortController, DOMException, crypto: webcrypto, console };
    // Locally bundled production code with explicit IO boundaries.
    runInNewContext(built.outputFiles[0].text, box);
    f.host = box.module.exports.createPlannerHost({
        getContext: () => ({ chat: f.chat, saveChat: async () => { f.saves++; }, generate: async type => { f.generations.push(type); } }),
        identity: () => 'chat', enabled: () => true, resolveApi: async () => ({ model: 'test' }),
        onError: error => f.errors.push(error),
        plan: async context => { f.plans.push(context); return { filtered: '<plot>approved</plot>' }; },
    });
    f.host.install();
    // Simulated EJS handler added after install; prepare must order host hooks
    // around it. It intentionally reads `prompt` for NovelAI's alias coverage.
    const transform = value => value.replaceAll('{{EJS}}', 'EJS_ONCE');
    const ejs = (data, field) => {
        f.ejsCalls.set(data, (f.ejsCalls.get(data) || 0) + 1);
        if (typeof data[field] === 'string') data[field] = transform(data[field]);
        else if (Array.isArray(data[field])) data[field] = data[field].map(message => ({ ...message, content: transform(message.content) }));
    };
    f.events.on(types.GENERATE_AFTER_DATA, data => { if (api !== 'openai') ejs(data, 'prompt'); });
    f.events.on(types.CHAT_COMPLETION_SETTINGS_READY, data => { if (api === 'openai') ejs(data, 'messages'); });
    f.prepare = async (type = 'normal') => {
        const copy = f.chat.map(message => ({ ...message }));
        let aborted = false;
        await f.handlers.get('ena-planner')(copy, 4096, () => { aborted = true; }, type,
            { signal: new AbortController().signal });
        return { copy, aborted, text: copy.at(-1).mes };
    };
    f.emit = (data, event = types.GENERATE_AFTER_DATA) => f.events.emit(event, data, false);
    f.adopt = async pending => {
        await nextTurn();
        assert.equal(f.run.phase, 'preview');
        await f.actions.send();
        await pending;
    };
    t.after(() => f.host.cleanup());
    return f;
}

test('native empty opening-message swipe remains usable, even after an abandoned bypass', async t => {
    const f = fixture(t);
    await f.prepare('quiet'); // Native early return: no transport event follows.
    let aborted = false;
    await f.handlers.get('ena-planner')([], 4096, () => { aborted = true; }, 'swipe',
        { signal: new AbortController().signal });
    const data = { prompt: 'native opening-message replacement' };
    await f.emit(data);
    assert.equal(aborted, false);
    assert.doesNotThrow(() => JSON.stringify(data));
    assert.equal(f.plans.length, 0);
    assert.equal(f.stops, 0);
});

test('unidentified empty quiet payload cannot claim or stop an unbound foreground', async t => {
    const f = fixture(t);
    const front = await f.prepare();
    let aborted = false;
    await f.handlers.get('ena-planner')([], 4096, () => { aborted = true; }, 'quiet',
        { signal: new AbortController().signal });
    const empty = { prompt: 'native empty quiet request' };
    await f.emit(empty);
    assert.equal(aborted, false);
    assert.throws(() => JSON.stringify(empty), { name: 'AbortError' });
    assert.equal(f.run.phase, 'ready');
    assert.equal(f.stops, 0);
    await f.adopt(f.emit({ prompt: front.text }));
    assert.equal(f.commits, 1);
});

for (const field of ['prompt', 'input']) for (const order of ['quiet-first', 'foreground-first']) {
    test(`untyped ${field}: ${order} preserves same-turn snapshot and original request`, async t => {
        const f = fixture(t, field === 'input' ? 'novel' : 'textgenerationwebui');
        const front = await f.prepare();
        const quiet = await f.prepare('quiet');
        const fg = { [field]: front.text };
        const bg = { [field]: quiet.text };
        let pending;
        if (order === 'quiet-first') {
            await f.emit(bg);
            assert.equal(f.run.phase, 'ready');
            pending = f.emit(fg);
        } else {
            pending = f.emit(fg);
            await nextTurn();
            await f.emit(bg);
        }
        await f.events.emit(types.GENERATION_ENDED, f.chat.length);
        await nextTurn();
        assert.equal(f.run.phase, 'preview');
        assert.equal(f.stops, 0);
        assert.equal(f.plans.length, 1);
        assert.match(f.plans[0][0].content, /EJS_ONCE/);
        assert.doesNotMatch(f.plans[0][0].content, /\{\{EJS\}\}/);
        assert.equal(f.ejsCalls.get(fg), 1);
        assert.throws(() => JSON.stringify(fg), { name: 'AbortError' });
        assert.doesNotThrow(() => JSON.stringify(bg));
        assert.equal(Object.hasOwn(fg, 'prompt'), field === 'prompt');
        let resumed = false;
        pending.then(() => { resumed = true; });
        await nextTurn();
        assert.equal(resumed, false);
        await f.adopt(pending);
        assert.match(JSON.stringify(fg), /<plot>approved<\/plot>/);
        assert.equal(f.commits, 1);
        assert.equal(f.saves, 0);
        assert.equal(f.chat.length, 1);
        assert.equal(f.ejsCalls.get(fg), 1);
        assert.equal(f.events.errors.length, 0);
    });
}

test('CC identities survive after-data and a newly allocated settings messages array', async t => {
    const f = fixture(t, 'openai');
    const front = await f.prepare();
    const quiet = await f.prepare('quiet');
    const fgData = { prompt: [{ role: 'user', content: front.text }] };
    const bgData = { prompt: [{ role: 'user', content: quiet.text }] };
    await f.emit(bgData);
    await f.emit(fgData);
    assert.equal(f.plans.length, 0);
    const fg = { messages: fgData.prompt.filter(Boolean).map(message => ({ ...message })), type: 'normal' };
    const bg = { messages: bgData.prompt.filter(Boolean).map(message => ({ ...message })), type: 'quiet' };
    assert.notEqual(fg.messages, fgData.prompt);
    await f.emit(bg, types.CHAT_COMPLETION_SETTINGS_READY);
    assert.doesNotThrow(() => JSON.stringify(bg));
    const pending = f.emit(fg, types.CHAT_COMPLETION_SETTINGS_READY);
    await f.adopt(pending);
    assert.equal(f.plans.length, 1);
    assert.match(f.plans[0][0].content, /EJS_ONCE/);
    assert.equal(f.ejsCalls.get(fg), 1);
    assert.match(JSON.stringify(fg), /approved/);
});

for (const location of ['primary', 'companion']) {
    test(`mixed planner and bypass markers in ${location} reject only that payload`, async t => {
        const f = fixture(t);
        const front = await f.prepare();
        const run = f.run;
        const quiet = await f.prepare('quiet');
        const mixed = location === 'primary'
            ? { prompt: front.text + quiet.text }
            : { prompt: quiet.text, negative_prompt: front.text };
        await f.emit(mixed);
        assert.throws(() => JSON.stringify(mixed), { name: 'AbortError' });
        assert.equal(f.run, run);
        assert.equal(run.phase, 'ready');
        assert.equal(f.stops, 0);
        const fg = { prompt: front.text };
        await f.adopt(f.emit(fg));
        assert.equal(f.commits, 1);
    });
}

test('quiet whose identity was lost is denied without cancelling foreground', async t => {
    const f = fixture(t);
    const front = await f.prepare();
    await f.prepare('quiet');
    const lost = { prompt: 'formatter removed whitespace identity' };
    await f.emit(lost);
    assert.throws(() => JSON.stringify(lost), { name: 'AbortError' });
    assert.equal(f.run.phase, 'ready');
    assert.equal(f.stops, 0);
    await f.adopt(f.emit({ prompt: front.text }));
});

test('new foreground supersedes an unbound preparation; late old payload stays denied', async t => {
    const f = fixture(t);
    const old = await f.prepare();
    const oldRun = f.run;
    // Simulates a host return before AFTER_DATA, as with Horde adjust failure.
    const fresh = await f.prepare('regenerate');
    assert.equal(fresh.aborted, false);
    assert.equal(oldRun.controller.signal.aborted, true);
    const current = f.run;
    const late = { prompt: old.text };
    await f.emit(late);
    assert.throws(() => JSON.stringify(late), { name: 'AbortError' });
    assert.equal(f.run, current);
    assert.equal(current.phase, 'ready');
    assert.equal(f.stops, 0);
    await f.adopt(f.emit({ prompt: fresh.text }));
});

test('cleanup retains late-request guard while disabled native requests may bypass', async t => {
    const f = fixture(t);
    const old = await f.prepare();
    f.host.cleanup();
    assert.equal(f.handlers.has('ena-planner'), true);
    const bypass = await f.prepare();
    assert.equal(bypass.aborted, false);
    const disabledData = { prompt: bypass.text };
    await f.emit(disabledData);
    assert.doesNotThrow(() => JSON.stringify(disabledData));
    const late = { prompt: old.text };
    await f.emit(late);
    assert.throws(() => JSON.stringify(late), { name: 'AbortError' });
    assert.equal(f.plans.length, 0);
    assert.equal(f.commits, 0);
    assert.equal(f.handlers.has('ena-planner'), false);
});

test('reinstall with retained guard does not duplicate interceptor or event listeners', async t => {
    const f = fixture(t);
    const old = await f.prepare();
    const counts = [f.events.count(types.GENERATE_AFTER_DATA), f.events.count(types.CHAT_COMPLETION_SETTINGS_READY)];
    f.host.cleanup();
    f.host.install();
    f.host.install();
    assert.equal(f.registrations, 1);
    assert.deepEqual([f.events.count(types.GENERATE_AFTER_DATA), f.events.count(types.CHAT_COMPLETION_SETTINGS_READY)], counts);
    const fresh = await f.prepare();
    await f.emit({ prompt: old.text });
    await f.adopt(f.emit({ prompt: fresh.text }));
    assert.equal(f.plans.length, 1);
    assert.equal(f.commits, 1);
});
for (const api of ['openai', 'textgenerationwebui', 'novel']) test(`${api}: host Stop retains editable draft and sends without any planner save`, async t => {
    const f = fixture(t, api);
    const front = await f.prepare();
    const field = api === 'openai' ? 'messages' : api === 'novel' ? 'input' : 'prompt';
    const data = { [field]: field === 'messages' ? [{role:'user',content:front.text}] : front.text };
    const event = api === 'openai' ? types.CHAT_COMPLETION_SETTINGS_READY : types.GENERATE_AFTER_DATA;
    const pending = f.emit(data, event);
    await nextTurn();
    await f.events.emit(types.GENERATION_STOPPED);
    await pending;
    f.actions.edit('revised by user');
    await f.actions.send();
    assert.equal(f.saves, 0);
    assert.deepEqual(f.generations, ['regenerate']);
    assert.equal(f.chat.length, 1);
    assert.equal(f.chat[0].mes, 'user {{EJS}}\n\nrevised by user');
    assert.throws(() => JSON.stringify(data), {name:'AbortError'});
    assert.equal(f.events.errors.length, 0);
});
