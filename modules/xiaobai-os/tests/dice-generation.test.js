import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import { build } from 'esbuild';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { captureDiceTarget } from '../apps/dice/host/message-records.ts';

// These regressions live at the native event/API boundary, which the session's continuation stub cannot cover.
// Run the actual adapter, readiness barrier, session, saver and protocol; replace native I/O only.
const compiled = await build({
    stdin: { contents: `export { createDiceGenerationAdapter } from '../apps/dice/host/generation-adapter.ts';
        export { captureDiceChat, waitForDiceHost } from '../apps/dice/host/sillytavern-port.ts';
        export { host } from 'dice-generation-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    plugins: [{ name: 'dice-generation-host', setup(builder) {
        builder.onResolve({ filter: /^js-sha256$/ }, () => ({ path: import.meta.resolve('js-sha256'), external: true }));
        builder.onResolve({ filter: /(?:^dice-generation-host$|\/(?:script|group-chats|utils|extensions|event-manager|generate-interceptor|sillytavern-runtime-adapters|sillytavern-chat-save)\.js$|\/extensions\/regex\/engine\.js$)/ },
            () => ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            const listeners = new Map();
            export let is_group_generating = false;
            export let isChatSaving = false;
            export const host = {
                source: null, busy: false, draft: '', enabled: true, requests: [], prompts: new Map(), writes: 0,
                preflight: async () => {}, controller: null, stream: null, reply: normalReply,
                async emit(name, ...args) { for (const fn of [...(listeners.get(name) ?? [])]) await fn(...args); },
                group(value) { is_group_generating = value; },
                saving(value) { isChatSaving = value; },
                async intercept(type) { let aborted = false; await host.interceptor([], 0, () => { aborted = true; }, type); return aborted; },
                reset(source) {
                    Object.assign(host, { source, busy: false, draft: '', enabled: true, requests: [], writes: 0,
                        preflight: async () => {}, controller: null, stream: null, reply: normalReply });
                    host.prompts.clear(); is_group_generating = false; isChatSaving = false;
                },
            };
            export const event_types = new Proxy({}, { get: (_, name) => name });
            export function createModuleEvents() { const owned = []; return {
                on(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); owned.push([name,fn]); },
                cleanup() { for (const [name,fn] of owned) listeners.get(name).delete(fn); },
            }; }
            export const registerGenerateInterceptor = (_, fn) => { host.interceptor = fn; };
            export const unregisterGenerateInterceptor = () => { host.interceptor = null; };
            export const GENERATE_INTERCEPTOR_ORDER = {};
            export const setSillyTavernPrompt = (key, value) => host.prompts.set(key, value);
            export const uuidv4 = () => 'generated-' + host.writes;
            export const getContext = () => ({ ...host.source, name2: host.source.characterName, generate,
                streamingProcessor: host.stream,
                characters: { [host.source.characterId]: { avatar:host.source.avatar, name:host.source.characterName } } });
            export const extension_settings = { disabledExtensions: [] };
            export const SCRIPT_TYPES = { GLOBAL: 0 };
            export const getScriptsByType = () => [];
            export const saveScriptsByType = () => host.preflight();
            export const getRequestHeaders = () => ({});
            export const saveSillyTavernChat = async guard => {
                if (!guard()) throw new Error('stale target'); host.writes++; return {status:'confirmed'};
            };
            export const isGenerating = () => host.busy || is_group_generating;
            export const setSendButtonState = value => { host.busy = value; };
            export const deactivateSendButtons = () => { host.stopVisible = true; };
            export const activateSendButtons = () => { host.stopVisible = false; host.busy = false; };
            export const setCharacterId = value => { host.source.characterId = value; };
            export const setCharacterName = value => { host.source.characterName = value; };
            export const setExternalAbortController = value => { host.controller = value; };
            export function stopGeneration() { host.controller?.abort(); void host.emit('GENERATION_STOPPED'); }

            // Frozen ST 1.18 boundary: nonzero depth skips composer consumption; outer Generate drops depth
            // when delegating to a group wrapper, while the wrapper forwards its own params to each member.
            async function generate(type, options = {}) {
                await host.emit('GENERATION_STARTED', type, options, false);
                await host.emit('GENERATION_AFTER_COMMANDS', type, options, false);
                if (host.source.groupId && !is_group_generating) {
                    return generateGroupWrapper(false, type, {signal:options.signal, force_chid:options.force_chid});
                }
                if (!options.depth && host.draft) {
                    host.source.chat.push({mes:host.draft,is_user:true,extra:{}}); host.draft = '';
                }
                if (await host.intercept(type) || options.signal?.aborted) return;
                host.requests.push({type, busy:isGenerating(), prompt:host.prompts.get('xiaobai_os_dice')});
                await host.reply();
            }
            async function normalReply() {
                host.source.chat.at(-1).mes += '\\n\\nAfterward.';
                await host.emit('MESSAGE_RECEIVED', host.source.chat.length - 1, 'appendFinal');
                host.stream = null;
            }
            export async function generateGroupWrapper(_auto, type, options) {
                is_group_generating = true;
                try { return await generate(type, options); }
                finally { is_group_generating = false; await host.emit('GROUP_WRAPPER_FINISHED'); }
            }
        ` }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Compiled repository modules and fixed native I/O fixture only.
const { createDiceGenerationAdapter, captureDiceChat, waitForDiceHost, host } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

const call = 'Attempt.\n\n<xb_action_check>{"action":"Climb","stat":"Agility","difficulty":"hard"}</xb_action_check>';
const message = mes => ({ name: 'Mira', mes, extra: {} });
function setup(t, group = false, reveal = async () => {}) {
    host.reset({ key: group ? 'group:g:chat' : 'character:mira.png:chat', chatId: 'chat', chat: [message('Old reply')],
        characterId: 0, characterName: 'Mira', avatar: 'mira.png', ...(group ? { groupId: 'g' } : {}) });
    const adapter = createDiceGenerationAdapter(() => host.enabled, () => {}, reveal);
    adapter.start();
    t.after(() => adapter.stop());
    return adapter;
}
async function begin(type = 'normal', options = {}) {
    await host.emit('GENERATION_STARTED', type, options, false);
    await host.emit('GENERATION_AFTER_COMMANDS', type, options, false);
}
async function received() { await host.emit('MESSAGE_RECEIVED', host.source.chat.length - 1, 'normal'); }
async function settled(adapter) {
    for (let count = 0; count < 50; count++) {
        await setImmediate();
        if (!adapter.view() || ['invalid','save-error','continue-error'].includes(adapter.view().phase.kind)) return;
    }
    assert.fail('Dice chain did not settle');
}

for (const mode of ['single', 'group-member', 'group-finished']) {
    test(`autonomous ${mode} continuation preserves an unsent draft and writes only the original AI floor`, async t => {
        const adapter = setup(t, mode !== 'single');
        if (mode !== 'single') host.group(true);
        await begin('normal', { signal: new AbortController().signal });
        await host.intercept('normal');
        const target = message(call);
        host.source.chat.push(target);
        host.draft = '/echo UNSENT_DRAFT';
        await received();
        if (mode === 'group-member') await host.emit('GROUP_MEMBER_DRAFTED');
        if (mode === 'group-finished') { host.group(false); await host.emit('GROUP_WRAPPER_FINISHED'); }
        await settled(adapter);
        assert.equal(host.draft, '/echo UNSENT_DRAFT');
        assert.equal(host.source.chat.length, 2);
        assert.equal(host.source.chat.at(-1), target);
        assert.equal(target.mes, 'Attempt.\n\nAfterward.');
        assert.equal(target.extra.xiaobaiOsDice.checks.length, 1);
        assert.equal(host.requests.length, 1);
        assert.equal(host.requests[0].busy, true);
        assert.equal(host.busy, false);
        const data = JSON.parse(host.requests[0].prompt.split('\n').at(-1));
        assert.equal(data[0].roll, target.extra.xiaobaiOsDice.checks[0].roll);
    });
}

test('native regenerate deletion preserves the new generation, but a later user deletion still cancels it', async t => {
    const adapter = setup(t);
    await begin('regenerate');
    host.source.chat.pop();
    await host.emit('MESSAGE_DELETED', 0);
    await host.intercept('regenerate');
    host.source.chat.push(message(call));
    await received();
    await settled(adapter);
    assert.equal(host.writes, 1);
    assert.equal(host.requests.length, 1);
    assert.equal(host.source.chat[0].extra.xiaobaiOsDice.checks.length, 1);

    await begin('regenerate');
    host.source.chat.pop();
    await host.emit('MESSAGE_DELETED', 0);
    await host.intercept('regenerate');
    host.source.chat.push(message(call));
    await host.emit('MESSAGE_DELETED', 0);
    await received();
    await settled(adapter);
    assert.equal(host.writes, 1, 'a later deletion must not revive the canceled observation');
    assert.equal(host.requests.length, 1);
});

test('reveal owns native busy/Stop controls and late completion cannot unlock a replacement generation', async t => {
    let release;
    let shown;
    const revealing = new Promise(resolve => { shown = resolve; });
    const adapter = setup(t, false, async () => {
        shown(); await new Promise(resolve => { release = resolve; });
    });
    await begin(); await host.intercept('normal');
    host.source.chat.push(message(call)); await received(); await revealing;
    assert.equal(host.busy, true);
    assert.equal(host.stopVisible, true);
    assert.equal(host.requests.length, 0);
    await host.emit('GENERATION_STOPPED');
    assert.equal(host.busy, false);
    assert.equal(host.stopVisible, false);
    assert.equal(adapter.view(), null);
    host.busy = true; host.stopVisible = true; // A later native generation now owns the controls.
    release(); await setImmediate();
    assert.equal(host.busy, true);
    assert.equal(host.stopVisible, true);
    assert.equal(host.requests.length, 0);
    assert.equal(host.source.chat.at(-1).extra.xiaobaiOsDice.checks.length, 1);
});

test('disabled checks still isolate a new swipe and preserve the old candidate and unrelated fields', async t => {
    setup(t);
    const original = prepareActionCheck({ body: call, generatedFrom: 0, id: 'old', random: () => .4 });
    const oldExtra = { xiaobaiOsDice: original.records, other: 'retained' };
    const target = { ...message(original.body), swipe_id: 1, swipes: [original.body, ''], extra: structuredClone(oldExtra),
        swipe_info: [{ extra: oldExtra }, { extra: structuredClone(oldExtra) }] };
    host.source.chat = [target]; host.enabled = false;
    await begin('swipe');
    await host.intercept('swipe');
    target.mes = 'A different reply.';
    await received();
    assert.equal(target.extra.xiaobaiOsDice, undefined);
    assert.equal(target.swipe_info[1].extra.xiaobaiOsDice, undefined);
    assert.deepEqual(target.swipe_info[0].extra.xiaobaiOsDice, original.records);
    assert.equal(target.extra.other, 'retained');
    assert.equal(host.writes, 0);
    assert.equal(host.requests.length, 0);
});

test('a target changed during continuation preparation is rejected before any provider request', async t => {
    const adapter = setup(t);
    await begin();
    await host.intercept('normal');
    const target = message(call);
    host.source.chat.push(target);
    host.preflight = async () => { host.source.chat.push({ mes: 'New user message', is_user: true, extra: {} }); };
    await received();
    await settled(adapter);
    assert.equal(host.writes, 1, 'the original roll is already confirmed');
    assert.equal(target.extra.xiaobaiOsDice.checks.length, 1);
    assert.equal(host.requests.length, 0);
    assert.equal(host.source.chat.at(-1).mes, 'New user message');
    assert.equal(host.busy, false);
});

test('readiness waits through stream finalization, saving and generation but releases an abandoned stopped stream', async t => {
    setup(t);
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const target = captureDiceTarget(captureDiceChat(), 0, 0);
    host.stream = { isStopped: false, isFinished: true };
    let ready = false;
    const operation = waitForDiceHost(target, new AbortController().signal, false).then(() => { ready = true; });
    await setImmediate();
    assert.equal(ready, false, 'finished tokens do not mean finalization has released the message');
    const stopped = { isStopped: true, isFinished: false };
    host.stream = stopped; host.saving(true);
    t.mock.timers.tick(40); await setImmediate();
    assert.equal(ready, false, 'a stopped stream cannot bypass an active save');
    host.saving(false); host.busy = true;
    t.mock.timers.tick(40); await setImmediate();
    assert.equal(ready, false, 'a stopped stream cannot bypass another generation');
    host.busy = false;
    t.mock.timers.tick(40); await operation;
    assert.equal(ready, true);
    assert.equal(host.stream, stopped, 'Dice must not clear native processor state');

    host.stream = { isStopped: false };
    const controller = new AbortController();
    const cancelled = waitForDiceHost(target, controller.signal, false);
    controller.abort();
    await assert.rejects(cancelled);
});

test('a failed incoming stream never rolls, and its residual processor cannot reject the next non-streaming reply', async t => {
    const adapter = setup(t);
    await begin();
    await host.intercept('normal');
    const failedReply = message(call);
    host.source.chat.push(failedReply);
    host.stream = { isStopped: true, isFinished: false };
    await received();
    await settled(adapter);
    assert.equal(host.writes, 0);
    assert.equal(host.requests.length, 0);
    assert.equal(failedReply.extra.xiaobaiOsDice, undefined);

    await begin('regenerate');
    host.source.chat.pop();
    await host.emit('MESSAGE_DELETED', 1);
    await host.intercept('regenerate');
    host.source.chat.push(message(call));
    await received();
    await settled(adapter);
    assert.equal(host.writes, 1);
    assert.equal(host.requests.length, 1);
    assert.equal(host.source.chat.at(-1).extra.xiaobaiOsDice.checks.length, 1);
});

for (const partial of [false, true]) {
    test(`failed Dice stream ${partial ? 'with partial output stops the chain without replaying it' : 'can retry using exactly the saved roll'}`, async t => {
        const adapter = setup(t);
        const normalReply = host.reply;
        await begin();
        await host.intercept('normal');
        const target = message(call);
        host.source.chat.push(target);
        host.reply = async () => {
            host.stream = { isStopped: true, isFinished: false };
            // Even a complete new request inside a failed stream is not eligible for another roll.
            if (partial) target.mes += '\n\n' + call;
        };
        await received();
        await settled(adapter);
        const saved = structuredClone(target.extra.xiaobaiOsDice);
        assert.equal(host.writes, 1);
        assert.equal(host.requests.length, 1);
        assert.equal(saved.checks.length, 1);
        if (partial) {
            assert.equal(target.mes, 'Attempt.\n\n' + call, 'partial output is never rolled back');
            assert.equal(adapter.view().phase.kind, 'invalid');
            await assert.rejects(adapter.retry(1));
            assert.equal(host.requests.length, 1);
        } else {
            assert.equal(adapter.view().phase.kind, 'continue-error');
            host.reply = normalReply;
            await adapter.retry(1);
            assert.equal(host.requests.length, 2);
            assert.equal(host.writes, 1, 'retry does not save or roll again');
            assert.equal(target.mes, 'Attempt.\n\nAfterward.');
            assert.equal(adapter.view(), null);
        }
        assert.deepEqual(target.extra.xiaobaiOsDice, saved);
    });
}
