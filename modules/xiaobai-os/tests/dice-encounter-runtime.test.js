import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

// Exercise the real runtime, message records and host port. Only native events/context/network
// are substituted: an encounter must never add its own chat save/readback or model request.
const compiled = await build({
    stdin: { contents: `export { createEncounterRuntime } from '../apps/dice/host/encounter-runtime.ts'; export { host } from 'encounter-runtime-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'native-host', setup(builder) {
        builder.onResolve({ filter: /^js-sha256$/ }, () => ({ path: import.meta.resolve('js-sha256'), external: true }));
        builder.onResolve({ filter: /(?:^encounter-runtime-host$|\/(?:script|extensions|group-chats|event-manager|generate-interceptor|sillytavern-runtime-adapters)\.js$|\/regex\/engine\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            const listeners = new Map();
            export const host = { context: null, disk: [], controller: null, prompt: '', requests: [], nativeSaves: 0,
                async emit(name, ...args) { for (const fn of [...(listeners.get(name) ?? [])]) await fn(...args); },
                saveNative() { host.nativeSaves++; host.disk = structuredClone(host.context.chat); },
                groupActive(value) { is_group_generating = value; },
            };
            export const getContext = () => host.context;
            export const extension_settings = { disabledExtensions: [] };
            export const getRequestHeaders = () => ({ 'Content-Type': 'application/json' });
            export const isChatSaving = false;
            export const isGenerating = () => false;
            export const cancelDebouncedChatSave = () => {};
            export const SCRIPT_TYPES = {};
            export const getScriptsByType = () => [];
            export const saveScriptsByType = async () => {};
            export const event_types = new Proxy({}, { get: (_, name) => name });
            export function createModuleEvents() { const owned = []; return {
                on(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); owned.push([name, fn]); },
                cleanup() { for (const [name, fn] of owned) listeners.get(name).delete(fn); },
            }; }
            export let is_group_generating = false;
            export function stopGeneration() { host.controller?.abort(); void host.emit('GENERATION_STOPPED'); }
            export const registerGenerateInterceptor = (_, fn) => { host.interceptor = fn; };
            export const unregisterGenerateInterceptor = () => { host.interceptor = null; };
            export const GENERATE_INTERCEPTOR_ORDER = {};
            export const setSillyTavernPrompt = (_, value) => { host.prompt = value; };
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Compiled repository modules with isolated native I/O.
const { createEncounterRuntime, host } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

function fixture(t, { references = () => ({ world: false, summary: false }), random = () => .02, group = false } = {}) {
    t.mock.method(console, 'error', () => {});
    host.context = { chat: [], chatId: 'chat', chatMetadata: {}, characterId: 0,
        characters: [{ name: 'Actor', avatar: 'actor.png' }], ...(group ? { groupId: 'group' } : {}) };
    host.disk = []; host.requests = []; host.nativeSaves = 0; host.groupActive(false);
    let enabled = true, draws = 0;
    const fresh = [], io = [];
    t.mock.method(globalThis, 'fetch', async (...args) => { io.push(args); return Response.json({ error: 'unexpected encounter I/O' }, { status: 400 }); });
    const runtime = createEncounterRuntime({ enabled: () => enabled, references, isAuxiliaryMessage: () => false,
        changed: message => { if (message) fresh.push(message); }, random: () => { draws++; return random(); },
    });
    runtime.start();
    t.after(() => { runtime.stop(); assert.deepEqual(io, [], 'encounters must not send chat saves, readbacks or extra model requests'); });
    return { runtime, fresh, draws: () => draws, enable(value) { enabled = value; if (!value) runtime.cancel(); } };
}

// ST 1.18 saves the user before MESSAGE_SENT, deletes the old AI before regenerate interception,
// then saves the completed reply. Encounter records should ride that last native save.
async function generate(type = 'normal', text, { failModel = false, dryRun = false, automatic_trigger = false } = {}) {
    host.controller = new AbortController();
    const options = { automatic_trigger, signal: host.controller.signal };
    await host.emit('GENERATION_STARTED', type, options, dryRun);
    await host.emit('GENERATION_AFTER_COMMANDS', type, options, dryRun);
    if (dryRun) return;
    try {
        if (text) {
            host.context.chat.push({ is_user: true, mes: text, extra: { foreign: 'kept' } });
            host.saveNative();
            await host.emit('MESSAGE_SENT', host.context.chat.length - 1);
        }
        if (type === 'regenerate' && host.context.chat.at(-1)?.is_user === false) {
            host.context.chat.pop();
            await host.emit('MESSAGE_DELETED', host.context.chat.length);
        }
        let aborted = false;
        await host.interceptor?.([], 0, () => { aborted = true; }, type);
        if (aborted || host.controller.signal.aborted) return;
        host.requests.push(host.prompt);
        await host.emit('GENERATE_AFTER_DATA', {}, false);
        if (failModel) return;
        if (['continue', 'swipe'].includes(type) && host.context.chat.at(-1)?.is_user === false) host.context.chat.at(-1).mes += ' reply';
        else host.context.chat.push({ is_user: false, mes: 'reply', extra: {} });
        host.saveNative();
    } finally { await host.emit('GENERATION_ENDED'); }
}
const outcome = message => message.extra?.xiaobaiOsDice?.encounter.outcome;

test('one local result follows native saves and survives regenerate/swipe/continue/reload without extra writes', async t => {
    const f = fixture(t);
    await generate('normal', 'first user');
    const user = host.context.chat[0];
    assert.equal(outcome(user), 'medium');
    assert.equal(user.extra.foreign, 'kept');
    assert.deepEqual(host.disk, host.context.chat);
    assert.equal(host.nativeSaves, 2, 'only the native user save and completed reply save');
    for (const type of ['regenerate', 'swipe', 'continue']) await generate(type);
    host.context.chat = structuredClone(host.disk);
    await host.emit('CHAT_CHANGED');
    await generate('regenerate');
    assert.equal(f.draws(), 1);
    assert.equal(f.fresh.length, 1);
    assert.equal(host.requests.length, 5);
    assert.ok(host.requests.every(Boolean));
    assert.equal(new Set(host.requests).size, 1, 'the same outcome and reference flags use the same prompt, including continue');
    assert.equal(host.prompt, '');
});

test('model failure leaves the same in-memory result for retry; an unsaved reload does not re-roll history', async t => {
    const f = fixture(t);
    await generate('normal', 'failed first reply', { failModel: true });
    assert.equal(outcome(host.context.chat[0]), 'medium');
    assert.equal(outcome(host.disk[0]), undefined, 'there was no native completion save');
    await generate('regenerate', undefined, { failModel: true });
    assert.equal(f.draws(), 1);
    assert.deepEqual(host.requests, [host.requests[0], host.requests[0]]);
    assert.ok(host.requests[0]);
    host.context.chat = structuredClone(host.disk);
    await host.emit('CHAT_CHANGED');
    await generate('regenerate');
    assert.equal(f.draws(), 1);
    assert.equal(host.requests.at(-1), '');
    assert.equal(outcome(host.context.chat[0]), undefined);
});

test('negative results, cooldown and disabled user turns keep their original semantics', async t => {
    let roll = .5;
    const f = fixture(t, { random: () => roll });
    await generate('normal', 'none');
    await generate('regenerate');
    assert.equal(f.draws(), 1);
    assert.equal(outcome(host.context.chat[0]), 'none');
    assert.deepEqual(host.requests, ['', '']);
    roll = 0;
    await generate('normal', 'high');
    f.enable(false);
    await generate('normal', 'disabled turn');
    f.enable(true);
    await generate('normal', 'cooldown turn');
    await generate('regenerate');
    await generate('normal', 'high again');
    assert.deepEqual(host.context.chat.filter(m => m.is_user).map(outcome), ['none', 'high', undefined, 'cooldown', 'high']);
    assert.equal(f.draws(), 3);
});

test('outer group, dry-run, automatic and non-RP generation never acquire a new draw; inner group draws once', async t => {
    const f = fixture(t, { group: true });
    await generate('normal', 'outer');
    await generate('quiet', 'quiet');
    await generate('impersonate', 'impersonate');
    await generate('normal', 'dry', { dryRun: true });
    host.groupActive(true);
    await generate('normal', 'automatic', { automatic_trigger: true });
    assert.equal(f.draws(), 0);
    await generate('normal', 'real group user');
    await generate('normal'); // The later member sees the first reply and gets no new instruction.
    assert.equal(f.draws(), 1);
    assert.ok(host.requests.at(-2));
    assert.equal(host.requests.at(-1), '');
});

test('late reference completion cannot inject after stop/edit/delete/chat switch/disable/dispose', async t => {
    for (const mode of ['stop', 'signal', 'edit', 'delete', 'bulk-delete', 'switch', 'disable', 'dispose']) {
        await t.test(mode, async t => {
            let release, ready;
            const started = new Promise(resolve => { ready = resolve; });
            const f = fixture(t, { references: () => { ready(); return new Promise(resolve => { release = resolve; }); } });
            const running = generate('normal', 'original');
            await started;
            if (mode === 'stop') await host.emit('GENERATION_STOPPED');
            if (mode === 'signal') host.controller.abort();
            if (mode === 'edit') { host.context.chat[0].mes = 'edited'; await host.emit('MESSAGE_EDITED', 0); host.saveNative(); }
            if (mode === 'delete') { host.context.chat.splice(0, 1); await host.emit('MESSAGE_DELETED', 0); host.saveNative(); }
            if (mode === 'bulk-delete') { host.context.chat.length = 0; host.saveNative(); await host.emit('MESSAGE_DELETED', 0); }
            if (mode === 'switch') { host.context = { ...host.context, chatId: 'other', chat: [] }; await host.emit('CHAT_CHANGED'); host.saveNative(); }
            if (mode === 'disable') f.enable(false);
            if (mode === 'dispose') f.runtime.stop();
            release({ world: true, summary: true });
            await running;
            assert.equal(host.requests.length, 0);
            assert.equal(host.prompt, '');
            assert.equal(f.draws(), 1);
            if (['edit', 'delete', 'bulk-delete', 'switch'].includes(mode)) assert.deepEqual(host.disk, host.context.chat, 'no late encounter snapshot may overwrite native edits/deletes');
        });
    }
});

test('preparation errors skip the encounter without blocking replies or re-drawing a recorded result', async t => {
    let fail = true;
    const f = fixture(t, { references: () => { if (fail) throw Error('reference unavailable'); return { world: false, summary: false }; } });
    await generate('normal', 'first user');
    assert.deepEqual(host.requests, ['']);
    assert.ok(f.runtime.view().error);
    assert.equal(f.runtime.view().error.includes('reference unavailable'), false);
    assert.equal(outcome(host.context.chat[0]), 'medium');
    fail = false;
    await generate('regenerate');
    assert.equal(host.requests.length, 2);
    assert.ok(host.requests.at(-1));
    assert.equal(f.draws(), 1);
    assert.equal(f.runtime.view(), null);
    host.context.chat[0].extra.xiaobaiOsDice = { invalid: true };
    await generate('regenerate');
    assert.equal(host.requests.length, 3);
    assert.equal(host.requests.at(-1), '');
    assert.equal(f.draws(), 1);
    assert.ok(f.runtime.view().error);
    assert.deepEqual(host.context.chat[0].extra.xiaobaiOsDice, { invalid: true });
});

test('encounter failures leave a group wrapper running, while stale failed lookups cannot resume a switched chat', async t => {
    const f = fixture(t, { group: true, references: () => { throw new Error('unavailable'); } });
    host.groupActive(true);
    await generate('normal', 'group user');
    assert.equal(host.controller.signal.aborted, false);
    assert.deepEqual(host.requests, ['']);
    await generate('normal');
    assert.deepEqual(host.requests, ['', '']);
    assert.equal(f.draws(), 1);
    f.runtime.stop();

    let reject, ready;
    const started = new Promise(resolve => { ready = resolve; });
    const late = fixture(t, { references: () => { ready(); return new Promise((_resolve, fail) => { reject = fail; }); } });
    const running = generate('normal', 'old chat');
    await started;
    host.context = { ...host.context, chatId: 'other', chat: [] };
    await host.emit('CHAT_CHANGED');
    reject(new Error('late failure'));
    await running;
    assert.equal(host.requests.length, 0);
    assert.equal(host.prompt, '');
    assert.equal(late.runtime.view(), null);
});
