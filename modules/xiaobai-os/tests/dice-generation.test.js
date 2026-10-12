import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import { build } from 'esbuild';
import { parseHTML } from 'linkedom';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { captureDiceTarget } from '../apps/dice/host/message-records.ts';
import { createDiceRerollService } from '../apps/dice/application/reroll-service.ts';
import { createDiceResults } from '../apps/dice/application/results.ts';
import { DICE_PARTITION } from '../apps/dice/partition.ts';
import { userEconomyHarness } from './user-economy-harness.js';
import { buildActionCheckRules, projectActionCheckResults } from '../apps/dice/protocol/prompt.ts';
import { parseDiceRecords } from '../apps/dice/domain/check-records.ts';
import { generateCoc7Sheet } from '../apps/dice/domain/coc7-creation.ts';
import { readDicePromptResults } from './helpers/dice-prompt.js';
import { createPromptInjectionRegistry } from '../capabilities/prompt-injection/registry.ts';
import { DICE_CHECK_PROMPTS } from '../apps/dice/prompt-registration.ts';

// These regressions live at the native event/API boundary, which the session's continuation stub cannot cover.
// Run the actual adapter, readiness barrier, session and protocol; replace native I/O only.
const compiled = await build({
    stdin: { contents: `export { createDiceGenerationAdapter } from '../apps/dice/host/generation-adapter.ts';
        export { createDiceMessageDisplay } from '../apps/dice/host/message-display.ts';
        export { captureDiceChat, waitForDiceHost } from '../apps/dice/host/sillytavern-port.ts';
        export { commitChatImagePlacement } from '../../draw/shared/chat-image-placement.js';
        export { parseChatImageTags } from '../../draw/shared/chat-message-image-markup.js';
        export { host } from 'dice-generation-host';`,
        resolveDir: fileURLToPath(new URL('.', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    footer: { js: '//# sourceURL=dice-generation-fixture.js' },
    plugins: [{ name: 'dice-generation-host', setup(builder) {
        builder.onResolve({ filter: /^js-sha256$/ }, () => ({ path: import.meta.resolve('js-sha256'), external: true }));
        builder.onResolve({ filter: /(?:^dice-generation-host$|\/(?:script|group-chats|utils|extensions|event-manager|generate-interceptor|sillytavern-chat-save)\.js$|\/extensions\/regex\/engine\.js$)/ },
            args => args.importer.includes('node_modules') ? undefined : ({ path: 'host', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
            const listeners = new Map();
            export let is_group_generating = false;
            export let isChatSaving = false;
            export let swipesHidden = false;
            export let is_send_press = false;
            export const host = {
                source: null, get busy() { return is_send_press; }, set busy(value) { is_send_press = value; },
                get savingActive() { return isChatSaving; },
                draft: '', enabled: true, requests: [], prompts: new Map(), diceWrites: 0, ids: 0, nativeSaves: [],
                preflight: async () => {}, controller: null, stream: null, streaming: false, reply: normalReply, editing: false,
                ping: async () => true, saveBarrier: async () => {}, saveFails: false,
                generate,
                async saveNative() {
                    isChatSaving = true;
                    try { await Promise.resolve(); host.nativeSaves.push(JSON.parse(JSON.stringify(host.source.chat))); }
                    finally { isChatSaving = false; }
                },
                async emit(name, ...args) { for (const fn of [...(listeners.get(name) ?? [])]) await fn(...args); },
                listen(name, fn) {
                    if (!listeners.has(name)) listeners.set(name, new Set());
                    listeners.get(name).add(fn);
                    return () => listeners.get(name).delete(fn);
                },
                group(value) { is_group_generating = value; },
                promptMessages() { return [...host.prompts.values()].map(({ value, role }) => ({ role: role === 1 ? 'user' : 'system', content: value })); },
                saving(value) { isChatSaving = value; },
                hideSwipes(value) { swipesHidden = value; },
                lock() { setSendButtonState(true); deactivateSendButtons(); },
                unlock: activateSendButtons,
                stop: stopGeneration,
                async intercept(type) { let aborted = false; await host.interceptor([], 0, () => { aborted = true; }, type); return aborted; },
                reset(source) {
                    Object.assign(host, { source, busy: false, draft: '', enabled: true, requests: [], diceWrites: 0, ids: 0, nativeSaves: [],
                        preflight: async () => {}, ping: async () => true, saveBarrier: async () => {}, saveFails: false,
                        controller: null, stream: null, streaming: false, reply: normalReply, editing: false,
                        stopVisible: false, dataGenerating: false, locks: 0 });
                    host.prompts.clear(); is_group_generating = false; isChatSaving = false; is_send_press = false; swipesHidden = false;
                },
            };
            export const event_types = new Proxy({}, { get: (_, name) => name });
            export const eventSource = {
                makeFirst(name, fn) { listeners.set(name, new Set([fn, ...(listeners.get(name) ?? [])])); },
                removeListener(name, fn) { listeners.get(name)?.delete(fn); },
            };
            export function createModuleEvents() { const owned = []; return {
                on(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); owned.push([name,fn]); },
                cleanup() { for (const [name,fn] of owned) listeners.get(name).delete(fn); },
            }; }
            export const registerGenerateInterceptor = (_, fn) => { host.interceptor = fn; };
            export const unregisterGenerateInterceptor = () => { host.interceptor = null; };
            export const GENERATE_INTERCEPTOR_ORDER = {};
            export const uuidv4 = () => 'generated-' + host.ids++;
            export const getContext = () => ({ ...host.source, name2: host.source.characterName, generate,
                streamingProcessor: host.stream,
                characters: { [host.source.characterId]: { avatar:host.source.avatar, name:host.source.characterName } } });
            export const extension_settings = { disabledExtensions: [] };
            export const SCRIPT_TYPES = { GLOBAL: 0 };
            export const getScriptsByType = () => [];
            export const saveScriptsByType = () => host.preflight();
            export const getRequestHeaders = () => ({});
            export const updateMessageBlock = () => { throw new Error('Unexpected native repaint'); };
            export const saveChatConditional = async () => { host.diceWrites++; if (isChatSaving) return; await host.saveNative(); };
            // Like native saveChat/saveGroupChat, bind/serialize before the first await.
            export async function saveChat() {
                host.diceWrites++;
                const captured = JSON.parse(JSON.stringify(host.source.chat));
                await host.saveBarrier();
                if (!host.saveFails) host.nativeSaves.push(captured);
            }
            export const saveGroupChat = saveChat;
            // Match ST 1.14's native boundary: live flags, without an isGenerating export.
            export const setSendButtonState = value => { is_send_press = value; };
            export const deactivateSendButtons = () => { host.stopVisible = true; host.dataGenerating = true; host.locks++; };
            function hideStopButton() {
                if (!host.stopVisible) return;
                host.stopVisible = false; void host.emit('GENERATION_ENDED');
            }
            export function activateSendButtons() {
                setSendButtonState(false); hideStopButton(); host.dataGenerating = false;
            }
            export const setCharacterId = value => { host.source.characterId = value; };
            export const setCharacterName = value => { host.source.characterName = value; };
            export const setExternalAbortController = value => { host.controller = value; };
            export function stopGeneration() { host.stream?.onStopStreaming?.(); host.controller?.abort(); hideStopButton(); void host.emit('GENERATION_STOPPED'); }

            // Frozen ST 1.18 boundary: nonzero depth skips composer consumption; outer Generate drops depth
            // when delegating to a group wrapper, while the wrapper forwards its own params to each member.
            async function generate(type, options = {}) {
                await host.emit('GENERATION_STARTED', type, options, false);
                if (!(host.controller && options.signal)) host.controller = new AbortController();
                await host.emit('GENERATION_AFTER_COMMANDS', type, options, false);
                if (!await host.ping()) { is_send_press = false; return; }
                if (host.source.groupId && !is_group_generating) {
                    return generateGroupWrapper(false, type, {signal:options.signal, force_chid:options.force_chid});
                }
                if (!options.depth && host.draft) {
                    host.source.chat.push({mes:host.draft,is_user:true,extra:{}}); host.draft = '';
                }
                host.lock();
                if (await host.intercept(type) || options.signal?.aborted) { activateSendButtons(); return; }
                // Native continue moves its pending assistant reply after in-chat extension prompts.
                const data = { prompt: [...host.promptMessages(), {role:'assistant',content:host.source.chat.at(-1)?.mes ?? ''}] };
                await host.emit('GENERATE_AFTER_DATA', data, false);
                if (host.controller.signal.aborted || options.signal?.aborted) { activateSendButtons(); return; }
                host.requests.push({type, signal:host.controller.signal, busy:is_send_press || is_group_generating, prompt:data.prompt});
                try {
                    await host.reply(host.controller.signal);
                    if (host.streaming) {
                        // ST 1.14/1.18 check the shared processor after streaming, then
                        // unconditionally release it AFTER awaited listeners and saving.
                        if (host.stream && !host.stream.isStopped && host.stream.isFinished) {
                            await host.stream.onFinishStreaming();
                            host.stream = null;
                        }
                    } else if (!host.stream?.isStopped) await host.saveNative();
                }
                finally { activateSendButtons(); }
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
const { createDiceGenerationAdapter, createDiceMessageDisplay, captureDiceChat, waitForDiceHost, host,
    // eslint-disable-next-line no-unsanitized/method -- Compiled repository modules and fixed native I/O fixture only.
    commitChatImagePlacement, parseChatImageTags } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);

const call = 'Attempt.\n\n<xb_action_check>{"action":"Climb","stat":"Agility","difficulty":"hard"}</xb_action_check>';

for (const cancel of ['none', 'stop', 'initiator']) test(`Dice keeps one continuation while recall waits without rerolling; cancel=${cancel}`, async t => {
    const adapter = setup(t);
    await begin();
    await host.intercept('normal');
    host.source.chat.push(message(call));
    await received(); await setImmediate();
    const saved = structuredClone(adapter.records(host.source.chat.at(-1)));
    assert.equal(saved.checks.length, 1);
    const ids = host.ids;
    const intercept = host.intercept.bind(host);
    let release;
    const ready = new Promise(resolve => { release = resolve; });
    let requestSignal;
    let entries = 0;
    t.mock.method(host, 'intercept', async type => {
        entries++;
        requestSignal = host.controller.signal;
        await ready;
        return intercept(type);
    });
    const pending = choose(adapter, 1);
    await setImmediate();
    assert.equal(requestSignal.aborted, false);
    assert.equal(host.busy, true);
    assert.equal(adapter.view().phase.kind, 'continuing');
    await host.emit('GENERATION_STARTED', 'quiet', {}, false);
    await host.emit('GENERATION_ENDED');
    assert.equal(adapter.view().phase.kind, 'continuing');
    if (cancel === 'initiator') adapter.cancel();
    else if (cancel === 'stop') host.stop();
    release();
    await pending;
    assert.equal(entries, 1);
    assert.equal(requestSignal.aborted, cancel !== 'none');
    assert.equal(host.requests.length, cancel === 'none' ? 1 : 0);
    assert.equal(host.ids, ids);
    assert.deepEqual(adapter.records(host.source.chat.at(-1)), saved);
});

test('a native image placement during continuation preparation preserves the incoming DICE check', async t => {
    const adapter = setup(t);
    const target = host.source.chat[0];
    target.mes = '[img: prior] prose'; target.swipe_id = 0; target.swipes = [target.mes];
    await begin('continue'); await host.intercept('continue');
    const before = target.mes;
    commitChatImagePlacement({ message: target, swipeIndex: 0, before,
        edits: parseChatImageTags(before).map(tag => ({ ...tag, content: '[image:prior-slot]' })) });
    target.mes += call;
    await host.emit('MESSAGE_RECEIVED', 0, 'continue'); await setImmediate();
    assert.equal(adapter.records(target).checks.length, 1);
    assert.equal(adapter.view().phase.kind, 'awaiting-choice');
});
const cocCall = '<xb_action_check>' + JSON.stringify({ action: 'Force the door', stat: 'body', difficulty: 'regular' }) + '</xb_action_check>';
const message = mes => ({ name: 'Mira', mes, extra: {} });

test('reply pause follows the selected message ending, not a retained Dice session', async t => {
    const adapter = setup(t);
    await begin(); await host.intercept('normal');
    const target = message(call + '\n</fictional_scenarios>'); host.source.chat.push(target);
    assert.equal(adapter.isReplyPaused(target), true);
    await received(); await setImmediate();
    assert.equal(adapter.view().phase.kind, 'awaiting-choice');
    const pausedBody = target.mes;
    target.mes += '\n\nAfterward.';
    assert.ok(adapter.view(), 'the workflow has not been cleared yet');
    assert.equal(adapter.isReplyPaused(target), false, 'historical Dice cannot hide completed prose');
    target.mes = pausedBody + '\n \t';
    assert.equal(adapter.isReplyPaused(target), true, 'whitespace after a stored result is still a pause');
    for (const following of [{ is_user: true, mes: 'Continue' }, { is_system: true, extra: { type: 'narrator' }, mes: 'Note' }]) {
        host.source.chat.push(following);
        assert.equal(adapter.isReplyPaused(target), true, 'the caller-selected AI floor is authoritative');
        host.source.chat.pop();
    }
    target.mes = pausedBody + '\nAfterward.\n' + call;
    assert.equal(adapter.isReplyPaused(target), true, 'another executable request pauses again');
});

test('finished prose releases the pause before the native continuation promise settles', async t => {
    const adapter = setup(t);
    await begin(); await host.intercept('normal');
    const target = message(call); host.source.chat.push(target);
    await received(); await setImmediate();
    const finalizing = Promise.withResolvers();
    t.after(() => finalizing.resolve());
    host.reply = async () => {
        target.mes += '\n\nAfterward.';
        await received();
        host.unlock();
        await finalizing.promise;
    };
    const continuation = choose(adapter, 1);
    try {
        await setImmediate();
        assert.equal(host.busy, false);
        assert.equal(adapter.isBusy(), true, 'Dice still owns the unsettled continuation');
        assert.equal(adapter.isReplyPaused(target), false, 'in-flight finalization is not a content pause');
    } finally { finalizing.resolve(); await continuation; }
});

for (const group of [false, true]) test(`reply pause outlives native stop, reload and failed continuation (group: ${group})`, async t => {
    const revealing = Promise.withResolvers();
    const adapter = setup(t, group, () => revealing.promise);
    t.after(() => revealing.resolve());
    assert.equal(adapter.isReplyPaused(host.source.chat.at(-1)), false, 'ordinary replies have no Dice hold');
    await begin(); await host.intercept('normal');
    const target = message(call); host.source.chat.push(target);
    assert.equal(adapter.isReplyPaused(target), true, 'the received request already holds the reply before Dice listeners run');
    await received();
    assert.equal(adapter.isReplyPaused(target), true, 'revealing the roll is not completion');
    revealing.resolve(); await setImmediate();
    if (group) {
        host.group(true); await host.emit('GROUP_MEMBER_DRAFTED');
        host.group(false); await host.emit('GROUP_WRAPPER_FINISHED');
    }
    assert.equal(host.busy, false);
    assert.equal(adapter.isReplyPaused(target), true, 'the native host can be idle while Dice waits for a choice');
    const pausedBody = target.mes;
    adapter.cancel();
    assert.equal(adapter.isReplyPaused(target), true, 'saved terminal checks retain their pause without a live session');
    host.enabled = false;
    assert.equal(adapter.isReplyPaused(target), false, 'disabled Dice never blocks projection');
    host.enabled = true;
    target.swipe_id = 1; target.mes = 'Already completed candidate'; await host.emit('MESSAGE_SWIPED', 1);
    assert.equal(adapter.isReplyPaused(target), false, 'unreferenced records cannot pause another swipe');
    target.swipe_id = 0; target.mes = pausedBody; await host.emit('MESSAGE_SWIPED', 1);
    assert.equal(adapter.isReplyPaused(target), true, 'returning to the paused swipe derives its state again');
    const normalReply = host.reply;
    host.reply = async () => { throw new Error('fixture-provider-rejection'); };
    await choose(adapter, 1);
    assert.equal(adapter.isReplyPaused(target), true, 'a failed continuation still awaits an outcome');
    host.reply = normalReply;
    await choose(adapter, 1);
    assert.equal(adapter.isReplyPaused(target), false, 'only the completed continuation releases the pause');
    host.source.chat.push({ is_user: true, mes: call });
    assert.equal(adapter.isReplyPaused(host.source.chat.at(-1)), false, 'user text is never a Dice pause');
    host.source.chat = [message('Another chat')]; host.source.key += '-other';
    assert.equal(adapter.isReplyPaused(host.source.chat.at(-1)), false, 'old choices cannot hold another chat');
});

for (const group of [false, true]) test(`validated native image placement preserves the live DICE choice and roll (group: ${group})`, async t => {
    const revealing = Promise.withResolvers();
    const adapter = setup(t, group, () => revealing.promise);
    if (group) host.group(true);
    t.after(host.listen('MESSAGE_RECEIVED', index => {
        const target = host.source.chat[index];
        const before = target.mes;
        const tags = parseChatImageTags(before);
        if (tags.length) commitChatImagePlacement({ message: target, swipeIndex: target.swipe_id ?? 0, before,
            edits: tags.map((tag, i) => ({ ...tag, content: `[image:dice-img-${i}]` })) });
    }));
    await begin('normal', { signal: new AbortController().signal }); await host.intercept('normal');
    const body = '[img: castle] ' + call + ' [img: discarded-tail]';
    const target = { ...message(body), swipe_id: 0, swipes: [body] };
    host.source.chat.push(target); await received();
    const records = structuredClone(adapter.records(target));
    assert.equal(records.checks.length, 1);
    assert.equal(adapter.view().phase.kind, 'revealing');
    assert.equal(adapter.current(adapter.view().target), true);
    assert.equal(parseChatImageTags(target.mes).length, 0);
    assert.equal(target.mes.includes('[image:dice-img-0]'), true);
    assert.equal(target.mes.includes('[image:dice-img-1]'), false);
    assert.equal(target.swipes[0], target.mes);
    await host.saveNative();
    revealing.resolve(); await setImmediate();
    assert.equal(adapter.view().phase.kind, 'awaiting-choice');
    assert.deepEqual(adapter.records(target), records);
    assert.equal(adapter.actions(1).kind, 'choice');
    if (group) {
        await host.emit('GROUP_MEMBER_DRAFTED');
        host.group(false); await host.emit('GROUP_WRAPPER_FINISHED');
    }
    await choose(adapter, 1);
    assert.equal(host.requests.length, 1);
    assert.deepEqual(adapter.records(target), records);
});
function setup(t, group = false, reveal = async () => {}, rerolls = null, results = createDiceResults({
    subscribe: () => () => {}, peekCurrent: () => ({ value: DICE_PARTITION.createInitial() }),
})) {
    t.mock.method(console, 'error', () => {});
    const network = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected Dice network request'); });
    t.after(() => {
        assert.equal(network.mock.calls.length, 0, 'checks and retries never read back or write chat over HTTP');
    });
    const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const { document } = parseHTML('<html><head></head><body><div id="chat"><div class="mes" mesid="0"><div class="mes_buttons"><div class="mes_edit"></div></div></div><div class="mes" mesid="1"><div class="mes_buttons"><div class="mes_edit"></div></div></div></div><textarea id="send_textarea"></textarea></body></html>');
    const query = document.querySelector.bind(document);
    t.mock.method(document, 'querySelector', selector => selector.includes('.edit_textarea') && host.editing ? {} : query(selector));
    Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { toastr: { error: () => assert.fail('Dice must not add error toasts') } } });
    t.after(() => { if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow); else delete globalThis.window; });
    t.after(() => { if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument); else delete globalThis.document; });
    host.reset({ key: group ? 'group:g:chat' : 'character:mira.png:chat', chatId: 'chat', chat: [message('Old reply')],
        characterId: 0, characterName: 'Mira', avatar: 'mira.png', ...(group ? { groupId: 'g' } : {}) });
    host.frequency = 'standard';
    host.rule = 'd20';
    host.sheet = generateCoc7Sheet(() => 0.5);
    host.sheetReads = 0;
    host.busyViews = [];
    const registry = createPromptInjectionRegistry([DICE_CHECK_PROMPTS], entry => {
        if (entry.content) host.prompts.set(entry.identifier, { value: entry.content, role: entry.role === 'user' ? 1 : 0,
            depth: entry.depth, position: 1, scan: false });
        else host.prompts.delete(entry.identifier);
    });
    const prompts = registry.register(DICE_CHECK_PROMPTS);
    t.after(registry.dispose);
    const adapter = createDiceGenerationAdapter(() => host.enabled, () => host.frequency, () => host.busyViews.push(adapter.isBusy()), reveal, () => host.rule, () => { host.sheetReads++; return host.sheet; }, rerolls, results,
        { setRules: content => prompts.set('rules', content), setResult: content => prompts.set('result', content) });
    adapter.start();
    t.after(() => adapter.stop());
    return adapter;
}
async function begin(type = 'normal', options = {}) {
    await host.emit('GENERATION_STARTED', type, options, false);
    await host.emit('GENERATION_AFTER_COMMANDS', type, options, false);
    // Manually driven reply fixtures omit native preflight; actual generate() tests retain its flag.
    host.busy = false;
}
async function received() { await host.emit('MESSAGE_RECEIVED', host.source.chat.length - 1, 'normal'); }

// Native streaming unlocks the UI before awaited message handlers and the chat save.
// Keep that ordering separate from non-streaming, whose send flag covers its save.
function streamingReply(type) {
    const stream = {
        messageId: host.source.chat.length - 1, isStopped: false, isFinished: true,
        onStopStreaming() { this.isFinished = true; },
        async onFinishStreaming() {
            host.unlock();
            await host.emit('MESSAGE_RECEIVED', this.messageId, type);
            await host.emit('CHARACTER_MESSAGE_RENDERED', this.messageId, type);
            await host.saveNative();
        },
    };
    host.stream = stream;
    return stream;
}

test('Continue waits across native message finalization and saving so both replies persist', { timeout: 3000 }, async t => {
    const adapter = setup(t);
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const messagePending = Promise.withResolvers();
    const releaseMessage = Promise.withResolvers();
    const savePending = Promise.withResolvers();
    const releaseSave = Promise.withResolvers();
    t.after(host.listen('MESSAGE_RECEIVED', async (_index, type) => {
        if (type === 'normal') { messagePending.resolve(); await releaseMessage.promise; }
    }));
    let saves = 0;
    t.mock.method(host, 'saveNative', async () => {
        const snapshot = structuredClone(host.source.chat);
        host.saving(true);
        try {
            if (++saves === 1) { savePending.resolve(); await releaseSave.promise; }
            host.nativeSaves.push(snapshot);
        } finally { host.saving(false); }
    });
    host.streaming = true;
    host.reply = async () => {
        const first = host.requests.length === 1;
        if (first) host.source.chat.push(message(call));
        else host.source.chat.at(-1).mes += '\n\nAfterward.';
        streamingReply(first ? 'normal' : 'continue');
    };
    const originating = host.generate('normal', { depth: 1 });
    let continuation;
    try {
        await messagePending.promise;
        await setImmediate();
        const card = adapter.actions(1);
        assert.equal(card.disabled, false);
        assert.equal(adapter.view().phase.kind, 'awaiting-choice');
        assert.equal(host.ids, 1);
        assert.equal(host.busy, false);
        assert.equal(host.savingActive, false);
        continuation = adapter.act(card.target, 'continue-check');
        await setImmediate();
        assert.deepEqual(adapter.view().wait.blockers, ['finalization']);
        assert.deepEqual(host.requests.map(request => request.type), ['normal']);
        assert.equal(host.nativeSaves.length, 0);

        releaseMessage.resolve();
        await savePending.promise;
        t.mock.timers.tick(40); await setImmediate();
        assert.deepEqual(adapter.view().wait.blockers, ['save']);
        assert.equal(host.requests.length, 1);

        releaseSave.resolve();
        await originating;
        t.mock.timers.tick(40); await continuation;
        assert.deepEqual(host.requests.map(request => request.type), ['normal', 'continue']);
        assert.equal(host.diceWrites, 0);
        assert.equal(host.nativeSaves.length, 2);
        assert.equal(host.nativeSaves.at(-1).at(-1).mes, host.source.chat.at(-1).mes);
        assert.ok(host.nativeSaves.at(-1).at(-1).mes.length > host.nativeSaves[0].at(-1).mes.length);
        assert.equal(host.nativeSaves[0].at(-1).extra.xiaobaiOsDice.checks.length, 1);
        assert.equal(host.ids, 1);
        assert.equal(adapter.view(), null);
    } finally {
        releaseMessage.resolve(); releaseSave.resolve(); adapter.cancel();
        await originating; await continuation;
    }
});

test('stopping a queued Continue does not release native finalization for its retry', { timeout: 3000 }, async t => {
    const adapter = setup(t);
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const pending = Promise.withResolvers();
    const release = Promise.withResolvers();
    t.after(host.listen('MESSAGE_RECEIVED', async (_index, type) => {
        if (type === 'normal') { pending.resolve(); await release.promise; }
    }));
    host.streaming = true;
    host.reply = async () => {
        const first = host.requests.length === 1;
        if (first) host.source.chat.push(message(call));
        else host.source.chat.at(-1).mes += '\n\nAfterward.';
        streamingReply(first ? 'normal' : 'continue');
    };
    const originating = host.generate('normal', { depth: 1 });
    let continuation;
    let retry;
    try {
        await pending.promise; await setImmediate();
        continuation = adapter.act(adapter.actions(1).target, 'continue-check');
        await setImmediate();
        host.stop(); await continuation;
        assert.equal(adapter.view(), null);
        retry = adapter.act(adapter.actions(1).target, 'continue-check');
        await setImmediate();
        assert.deepEqual(adapter.view().wait.blockers, ['finalization']);
        assert.equal(host.requests.length, 1);
        release.resolve(); await originating;
        t.mock.timers.tick(40); await retry;
        assert.equal(host.requests.length, 2);
        assert.equal(host.ids, 1);
        assert.equal(host.nativeSaves.length, 2);
    } finally {
        release.resolve(); adapter.cancel();
        await originating; await continuation; await retry;
    }
});

for (const blocker of ['finalization', 'save']) {
    test(`the visible Continue control cancels its ${blocker} queue without stopping native work or losing the roll`, { timeout: 3000 }, async t => {
        const adapter = setup(t);
        t.mock.timers.enable({ apis: ['setTimeout'] });
        const frames = new Map();
        let nextFrame = 0;
        const globals = {
            MutationObserver: document.defaultView.MutationObserver,
            requestAnimationFrame: fn => { frames.set(++nextFrame, fn); return nextFrame; },
            cancelAnimationFrame: id => frames.delete(id),
        };
        const previous = new Map();
        for (const [key, value] of Object.entries(globals)) {
            previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
            Object.defineProperty(globalThis, key, { configurable: true, value });
        }
        t.after(() => { for (const [key, descriptor] of previous) {
            if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
        } });
        const display = createDiceMessageDisplay(adapter, () => host.enabled);
        const paint = async () => {
            display.refresh(); await Promise.resolve();
            const work = [...frames.values()]; frames.clear(); for (const fn of work) fn();
        };
        const pending = Promise.withResolvers();
        const release = Promise.withResolvers();
        if (blocker === 'finalization') {
            t.after(host.listen('MESSAGE_RECEIVED', async (_index, type) => {
                if (type === 'normal') { pending.resolve(); await release.promise; }
            }));
        } else {
            const save = host.saveNative.bind(host);
            t.mock.method(host, 'saveNative', async () => {
                if (host.requests.length === 1) { host.saving(true); pending.resolve(); await release.promise; }
                await save();
            });
        }
        let stops = 0;
        t.after(host.listen('GENERATION_STOPPED', () => { stops++; }));
        host.streaming = true;
        host.reply = async () => {
            const first = host.requests.length === 1;
            if (first) host.source.chat.push(message(call));
            else host.source.chat.at(-1).mes += '\n\nAfterward.';
            streamingReply(first ? 'normal' : 'continue');
        };
        const originating = host.generate('normal', { depth: 1 });
        try {
            await pending.promise; await setImmediate();
            const stream = host.stream;
            const savedRoll = structuredClone(host.source.chat[1].extra.xiaobaiOsDice);
            const content = document.createElement('div'); content.className = 'mes_text';
            content.textContent = host.source.chat[1].mes;
            document.querySelector('.mes[mesid="1"]').append(content);
            display.start(); await paint();
            const button = content.querySelector('[data-dice-action="continue-check"]');
            assert.ok(button); assert.equal(button.disabled, false);
            button.click(); await setImmediate(); await paint();
            assert.deepEqual(adapter.view().wait.blockers, [blocker]);
            assert.equal(host.stopVisible, false);
            assert.equal(content.querySelector('[data-dice-action="cancel-continue"]'), button);
            assert.equal(button.disabled, false);
            button.click(); await setImmediate(); await paint();
            assert.equal(adapter.view(), null);
            assert.equal(host.stream, stream);
            assert.equal(host.controller.signal.aborted, false);
            assert.equal(stops, 0);
            assert.equal(content.querySelector('[data-dice-action="continue-check"]'), button);
            assert.equal(button.disabled, false);

            release.resolve(); await originating;
            t.mock.timers.tick(80); await setImmediate(); await paint();
            assert.equal(host.requests.length, 1, 'cancelled Continue cannot dispatch when native saving finishes');
            assert.deepEqual(host.source.chat[1].extra.xiaobaiOsDice, savedRoll);
            assert.equal(host.diceWrites, 0);
            button.click(); await setImmediate(); await settled(adapter); await paint();
            assert.equal(host.requests.length, 2);
            assert.equal(host.nativeSaves.length, 2);
            assert.equal(host.ids, 1);
        } finally {
            adapter.cancel(); release.resolve(); await originating; display.stop();
        }
    });
}

for (const event of ['CHAT_CHANGED', 'MESSAGE_EDITED', 'GENERATION_STARTED']) {
    test(`${event} cancels a queued Continue before native finalization releases`, { timeout: 3000 }, async t => {
        const adapter = setup(t);
        t.mock.timers.enable({ apis: ['setTimeout'] });
        await begin(); await host.intercept('normal');
        host.source.chat.push(message(call));
        const stream = streamingReply('normal');
        await received(); await setImmediate();
        const continuation = adapter.act(adapter.actions(1).target, 'continue-check');
        await setImmediate();
        assert.deepEqual(adapter.view().wait.blockers, ['finalization']);
        await host.emit(event, 'normal', {}, false);
        await continuation;
        assert.equal(host.stream, stream, 'Cancelling a choice must not clear the native processor');
        host.stream = null;
        t.mock.timers.tick(80); await setImmediate();
        assert.equal(host.requests.length, 0);
        assert.equal(host.ids, 1);
    });
}

for (const residual of [false, true]) {
    test(`a loaded result has no pending finalization${residual ? ', even with an unobserved residual processor' : ''}`, { timeout: 3000 }, async t => {
        const adapter = setup(t);
        t.mock.timers.enable({ apis: ['setTimeout'] });
        const saved = prepareActionCheck({ body: call, generatedFrom: 0, id: 'saved', random: () => .3 });
        host.source.chat = [{ ...message(saved.body), extra: { xiaobaiOsDice: saved.records } }];
        if (residual) streamingReply('normal');
        const continuation = adapter.act(adapter.actions(0).target, 'continue-check');
        await setImmediate();
        assert.equal(host.requests.length, 1);
        await continuation;
        assert.equal(host.ids, 0);
        assert.deepEqual(host.source.chat[0].extra.xiaobaiOsDice, saved.records);
    });
}

test('a pre-existing successful processor is not the tail of a new non-streaming reply', { timeout: 3000 }, async t => {
    const adapter = setup(t);
    t.mock.timers.enable({ apis: ['setTimeout'] });
    streamingReply('normal');
    await begin(); await host.intercept('normal');
    host.source.chat.push(message(call));
    await received(); await setImmediate();
    const continuation = adapter.act(adapter.actions(1).target, 'continue-check');
    await setImmediate();
    assert.equal(host.requests.length, 1);
    await continuation;
    assert.equal(host.ids, 1);
});

test('an old card credential cannot continue a replaced result even when its rolled values are identical', async t => {
    const adapter = setup(t);
    const prepared = prepareActionCheck({ body: call, generatedFrom: 0, id: 'same-result', random: () => .3 });
    host.source.chat[0].mes = prepared.body;
    host.source.chat[0].extra.xiaobaiOsDice = prepared.records;
    const old = adapter.actions(0).target;
    host.source.chat[0].extra.xiaobaiOsDice = structuredClone(prepared.records);
    await assert.rejects(adapter.act(old, 'continue-check'), { code: 'dice_target_changed' });
    assert.equal(host.requests.length, 0);
    await adapter.act(adapter.actions(0).target, 'continue-check');
    assert.equal(host.requests.length, 1);
});

async function startContinuation(adapter) {
    for (let count = 0; count < 50; count++) {
        await setImmediate();
        if (adapter.view()?.phase.kind === 'awaiting-choice') {
            void choose(adapter, adapter.view().target.index);
            await setImmediate();
            return;
        }
    }
    assert.fail('Dice did not reach its explicit choice');
}
async function choose(adapter, index) {
    const actions = adapter.actions(index);
    if (!actions) throw new Error('No action available');
    const action = actions.kind === 'request' ? 'retry-check' : 'continue-check';
    await adapter.act(actions.target, action);
    if (action === 'retry-check' && adapter.view()?.phase.kind === 'awaiting-choice') {
        await adapter.act(adapter.actions(index).target, 'continue-check');
    }
}

// Legacy native-boundary scenarios now explicitly choose Continue after observing the pause.
async function settled(adapter) {
    for (let count = 0; count < 50; count++) {
        await setImmediate();
        if (!adapter.view() || ['invalid','continue-error'].includes(adapter.view().phase.kind)) return;
        if (adapter.view().phase.kind === 'awaiting-choice') { await choose(adapter, adapter.view().target.index); }
    }
    assert.fail('Dice chain did not settle');
}

const upstreamMessage = JSON.parse(readFileSync(new URL('./fixtures/dice-message-a32c28d0.json', import.meta.url), 'utf8'));

test('external native preflight blocks Continue; early exit without ENDED releases it through native occupancy', async t => {
    const adapter = setup(t);
    const prepared = prepareActionCheck({ body: call, generatedFrom: 0, id: 'preflight', random: () => .3 });
    host.source.chat[0] = { ...message(prepared.body), extra: { xiaobaiOsDice: prepared.records } };
    const ping = Promise.withResolvers();
    host.ping = () => ping.promise;
    const native = host.generate('normal', { depth: 1 });
    await setImmediate();
    const continuation = choose(adapter, 0);
    await setImmediate();
    assert.equal(host.requests.length, 0);
    assert.deepEqual(adapter.view().wait.blockers, ['generation']);
    host.ping = async () => true;
    ping.resolve(false); await native; await continuation;
    assert.equal(host.requests.length, 1);
    assert.equal(host.requests[0].type, 'continue');
    assert.equal(host.busy, false);
});

test('free roll requires no independent save and never invokes the model by itself', async t => {
    const adapter = setup(t);
    await begin(); await host.intercept('normal');
    host.source.chat.push(message(call));
    await received(); await setImmediate();
    assert.equal(adapter.actions(1).kind, 'choice');
    assert.equal(adapter.actions(1).disabled, false);
    assert.equal(host.requests.length, 0);
    assert.equal(host.diceWrites, 0);
    await adapter.act(adapter.actions(1).target, 'continue-check');
    assert.equal(host.requests.length, 1);
    assert.equal(adapter.view(), null);
});

test('turning off native swipe visibility does not block Continue on an idle host', { timeout: 2000 }, async t => {
    const adapter = setup(t);
    const prepared = prepareActionCheck({ body: call, generatedFrom: 0, id: 'saved', random: () => .3 });
    host.source.chat = [{ ...message(prepared.body), extra: { xiaobaiOsDice: prepared.records } }];
    host.hideSwipes(true);
    await adapter.act(adapter.actions(0).target, 'continue-check');
    assert.equal(host.requests.length, 1);
    assert.equal(host.diceWrites, 0);
});

for (const group of [false, true]) {
    test(`${group ? 'group' : 'single'} manual first roll saves its marker once; reroll survives reload, rename and swipe renumbering`, async t => {
        const wallet = await userEconomyHarness();
        await wallet.economy.refresh();
        const results = createDiceResults(wallet.store(DICE_PARTITION));
        const rerolls = createDiceRerollService(wallet.store(DICE_PARTITION), wallet.transactions, wallet.economy, results,
            target => adapter.current(target), { random: () => .8, onError: error => assert.fail(error) });
        t.after(() => { rerolls.dispose(); results.dispose(); });
        const adapter = setup(t, group, async () => {}, rerolls, results);
        host.source.chat = [{ ...message(call), swipe_id: 1, swipes: ['Other swipe', call],
            extra: { foreign: { keep: true } }, swipe_info: [{ extra: { untouched: true } }, { extra: { foreign: true } }] }];
        await adapter.act(adapter.actions(0).target, 'retry-check');
        assert.equal(host.diceWrites, 1);
        assert.equal(host.nativeSaves.length, 1);
        assert.equal(host.requests.length, 0);
        const saved = host.nativeSaves[0][0];
        const first = structuredClone(saved.extra.xiaobaiOsDice);
        assert.deepEqual(saved.swipe_info[1].extra.xiaobaiOsDice, first);
        assert.deepEqual(saved.extra.foreign, { keep: true });
        assert.deepEqual(saved.swipe_info[0], { extra: { untouched: true } });
        await adapter.act(adapter.actions(0).target, 'reroll-check');
        await rerolls.idle();
        assert.equal(wallet.economy.getPlayerBalance(), 90);
        assert.equal(host.diceWrites, 1);
        assert.equal(host.requests.length, 0);

        const reloaded = structuredClone(saved);
        reloaded.swipes.splice(0, 1); reloaded.swipe_info.splice(0, 1); reloaded.swipe_id = 0;
        host.source = { ...host.source, key: 'renamed', chatId: 'renamed', chat: [reloaded] };
        await host.emit('CHAT_CHANGED');
        const restarted = createDiceResults(wallet.store(DICE_PARTITION));
        assert.equal(restarted.records(reloaded.extra.xiaobaiOsDice).checks[0].roll, 17);
        restarted.dispose();
        assert.equal(adapter.records(reloaded).checks[0].roll, 17);
        assert.equal(adapter.actions(0).kind, 'choice');
        await adapter.act(adapter.actions(0).target, 'continue-check');
        assert.equal(host.requests.length, 1);
        const injected = readDicePromptResults(host.requests[0].prompt.findLast(item => item.role === 'user').content);
        assert.equal(injected[0].roll, 17);
        assert.deepEqual(reloaded.extra.xiaobaiOsDice, first);
    });
}

test('Continue cannot overtake the native save of a manually recovered first roll', { timeout: 2000 }, async t => {
    const adapter = setup(t);
    const saved = Promise.withResolvers();
    t.after(() => saved.resolve());
    host.source.chat = [message(call)];
    host.saveBarrier = () => saved.promise;
    const recovery = adapter.act(adapter.actions(0).target, 'retry-check');
    await setImmediate();
    assert.equal(host.diceWrites, 1);
    const continuation = adapter.act(adapter.actions(0).target, 'continue-check');
    await setImmediate();
    assert.equal(host.requests.length, 0);
    saved.resolve();
    await Promise.all([recovery, continuation]);
    assert.equal(host.requests.length, 1);
    assert.equal(host.nativeSaves[0][0].extra.xiaobaiOsDice.checks.length, 1);
});

for (const group of [false, true]) {
    for (const fails of [false, true]) {
        test(`${group ? 'group' : 'single'} recovery save holds historical controls through Stop and releases after ${fails ? 'failure' : 'success'}`, async t => {
            const adapter = setup(t, group);
            const saved = Promise.withResolvers();
            t.after(() => saved.resolve());
            t.mock.method(window.toastr, 'error', () => {});
            host.source.chat = [message('Historical prose'), message(call)];
            host.saveBarrier = () => saved.promise;
            const operation = adapter.act(adapter.actions(1).target, 'retry-check');
            await setImmediate();
            const controls = document.querySelector('#chat .mes[mesid="0"] .mes_buttons');
            assert.equal(controls.hasAttribute('inert'), true);
            assert.equal(document.querySelector('#send_textarea').hasAttribute('inert'), false);
            await host.emit('GENERATION_STOPPED');
            assert.equal(controls.hasAttribute('inert'), true);
            if (fails) { saved.reject(new Error('native save rejected')); } else { saved.resolve(); }
            await operation;
            await setImmediate();
            assert.equal(controls.hasAttribute('inert'), false);
            assert.equal(controls.hasAttribute('aria-disabled'), false);
            assert.equal(host.nativeSaves.length, fails ? 0 : 1);
        });
    }
}

for (const editorClass of ['edit_textarea', 'reasoning_edit_textarea']) {
test(`an existing historical ${editorClass} prevents a manual first roll without consuming its request`, async t => {
    const adapter = setup(t);
    host.source.chat = [message('Historical prose'), message(call)];
    const editor = document.createElement('textarea'); editor.className = editorClass; editor.value = 'Uncommitted edit';
    document.querySelector('#chat .mes[mesid="0"]').append(editor);
    const actions = adapter.actions(1);
    assert.equal(actions.disabled, true);
    await assert.rejects(adapter.act(actions.target, 'retry-check'), { code: 'dice_busy' });
    assert.equal(host.diceWrites, 0);
    assert.equal(host.ids, 0);
    assert.equal(editor.value, 'Uncommitted edit');
    editor.remove();
    await adapter.act(adapter.actions(1).target, 'retry-check');
    assert.equal(host.diceWrites, 1);
});
}

test('manual recovery blocks native click-to-edit without blocking content button handlers or defaults', async t => {
    const adapter = setup(t);
    const saved = Promise.withResolvers();
    t.after(() => saved.resolve());
    host.source.chat = [message(call)];
    host.saveBarrier = () => saved.promise;
    const text = document.createElement('div'); text.className = 'mes_text';
    const button = document.createElement('button'); text.append(button);
    document.querySelector('#chat .mes').append(text);
    let edits = 0, actions = 0;
    document.addEventListener('click', event => { if (event.target.closest('.mes_text')) { edits++; } });
    button.addEventListener('click', () => { actions++; });
    const recovery = adapter.act(adapter.actions(0).target, 'retry-check');
    await setImmediate();
    const click = () => button.dispatchEvent(new document.defaultView.Event('click', { bubbles: true, cancelable: true }));
    assert.equal(click(), true);
    assert.equal(actions, 1);
    assert.equal(edits, 0);
    saved.resolve(); await recovery;
    assert.equal(click(), true);
    assert.equal(actions, 2);
    assert.equal(edits, 1);
});

test('switching chats during the native recovery save cannot redirect its captured data', async t => {
    const adapter = setup(t);
    const saved = Promise.withResolvers();
    t.after(() => saved.resolve());
    host.source.chat = [message(call)];
    host.saveBarrier = () => saved.promise;
    const recovery = adapter.act(adapter.actions(0).target, 'retry-check');
    await setImmediate();
    const original = structuredClone(host.source.chat);
    // Native ST reuses the same chat array across opens; the reference is not its identity.
    host.source.chat.splice(0, host.source.chat.length, message('Unrelated'));
    host.source = { ...host.source, chatId: 'other' };
    await host.emit('CHAT_CHANGED');
    document.querySelector('#chat').append(document.createElement('div'));
    await setImmediate();
    assert.equal(document.querySelector('#chat .mes_buttons').hasAttribute('inert'), false);
    saved.resolve(); await recovery;
    assert.deepEqual(host.nativeSaves, [original]);
    assert.deepEqual(host.source.chat, [message('Unrelated')]);
    assert.equal(host.requests.length, 0);
});

test('a native recovery save failure keeps this page result usable without resampling or model calls', async t => {
    const adapter = setup(t);
    host.source.chat = [message(call)];
    host.saveFails = true;
    await adapter.act(adapter.actions(0).target, 'retry-check');
    const first = structuredClone(adapter.records(host.source.chat[0]));
    assert.equal(host.nativeSaves.length, 0);
    assert.equal(host.requests.length, 0);
    assert.equal(adapter.actions(0).disabled, false);
    await adapter.act(adapter.actions(0).target, 'continue-check');
    assert.deepEqual(adapter.records(host.source.chat[0]), first);
    assert.equal(host.ids, 1);
    assert.equal(host.diceWrites, 1);
    assert.equal(host.requests.length, 1);
});
test('rerolls use no model, do not wait for payment, and their late completion cannot cancel a new chat continuation', async t => {
    const wallet = await userEconomyHarness();
    await wallet.economy.refresh();
    const saving = Promise.withResolvers();
    const results = createDiceResults(wallet.store(DICE_PARTITION));
    const replace = wallet.storage.replace;
    wallet.storage.replace = async (...args) => { await saving.promise; return replace(...args); };
    const rerolls = createDiceRerollService(wallet.store(DICE_PARTITION), wallet.transactions, wallet.economy, results,
        target => adapter.current(target), { random: () => .3, onError: error => assert.fail(error) });
    t.after(rerolls.dispose);
    const adapter = setup(t, false, async () => {}, rerolls, results);
    const prepared = prepareActionCheck({ body: call, generatedFrom: 0, id: 'old-chat-check', random: () => .3 });
    host.source.chat = [{ ...message(prepared.body), extra: { xiaobaiOsDice: prepared.records } }];
    const old = adapter.actions(0).target;
    const rerolling = adapter.act(old, 'reroll-check');
    await setImmediate();
    assert.equal(host.requests.length, 0);
    assert.equal(adapter.actions(0).disabled, false);
    assert.equal(wallet.economy.getPlayerBalance(), 100);
    await assert.rejects(adapter.act(old, 'reroll-check'), { code: 'dice_target_changed' });
    const next = prepareActionCheck({ body: call, generatedFrom: 0, id: 'new-chat-check', random: () => .3 });
    host.source = { ...host.source, chatId: 'next', key: 'character:mira.png:next',
        chat: [{ ...message(next.body), extra: { xiaobaiOsDice: next.records } }] };
    await host.emit('CHAT_CHANGED');
    const responding = Promise.withResolvers();
    const reply = host.reply;
    host.reply = async signal => { await responding.promise; await reply(signal); };
    const continuing = adapter.act(adapter.actions(0).target, 'continue-check');
    await setImmediate();
    assert.equal(host.requests.length, 1);
    const newSignal = host.requests[0].signal;
    saving.resolve(true);
    await rerolling;
    await rerolls.idle();
    assert.equal(adapter.view().phase.kind, 'continuing');
    assert.equal(newSignal.aborted, false);
    assert.equal(wallet.economy.getPlayerBalance(), 90);
    responding.resolve(); await continuing;
    assert.equal(host.requests.length, 1);
});

test('continuation injection follows retained markers after edits, moves, deletions and reinsertion', async t => {
    setup(t);
    const target = structuredClone(upstreamMessage);
    host.source.chat = [target];
    const raw = structuredClone(target.extra.xiaobaiOsDice);
    const [wall, door] = parseDiceRecords(raw).checks;
    for (const frequency of ['standard', 'active']) {
        host.frequency = frequency;
        for (const [body, referenced] of [
            ['Rewritten approach. [dice:wall] Different transition. [dice:door]', [wall, door]],
            ['Door first. [dice:door] Wall afterward. [dice:wall]', [door, wall]],
            ['Only the wall remains. [dice:wall]', [wall]],
            ['All references removed.', []],
            ['Restored door. [dice:door]', [door]],
        ]) {
            target.mes = body;
            await begin('continue');
            assert.equal(await host.intercept('continue'), false);
            const data = { prompt: [...host.promptMessages(), { role: 'assistant', content: body }] };
            await host.emit('GENERATE_AFTER_DATA', data, false);
            if (referenced.length) {
                assert.deepEqual(readDicePromptResults(data.prompt.findLast(item => item.role === 'user').content), projectActionCheckResults(referenced));
            } else {
                assert.equal(data.prompt.filter(item => item.role === 'user').length, 1, 'only rules remain after deleting all result references');
            }
            assert.deepEqual(target.extra.xiaobaiOsDice, raw, 'reading a migrated result never rewrites saved history');
        }
    }
});

test('rerolled D0 and the next free check share effective results while native saving preserves the first roll', async t => {
    const wallet = await userEconomyHarness(); await wallet.economy.refresh();
    const results = createDiceResults(wallet.store(DICE_PARTITION));
    const rerolls = createDiceRerollService(wallet.store(DICE_PARTITION), wallet.transactions, wallet.economy, results,
        target => adapter.current(target), { random: () => .8, onError: error => assert.fail(error) });
    t.after(() => { rerolls.dispose(); results.dispose(); });
    const adapter = setup(t, false, async () => {}, rerolls, results);
    const prepared = prepareActionCheck({ body: call, generatedFrom: 0, id: 'original', random: () => .3 });
    host.source.chat = [{ ...message(prepared.body), extra: { xiaobaiOsDice: prepared.records, other: { kept: true } } }];
    await adapter.act(adapter.actions(0).target, 'reroll-check');
    const replying = host.reply;
    host.reply = async signal => {
        host.source.chat[0].mes += '\n\n' + call;
        await host.emit('MESSAGE_RECEIVED', 0, 'appendFinal');
        host.reply = replying;
    };
    await adapter.act(adapter.actions(0).target, 'continue-check');
    await setImmediate();
    assert.equal(host.requests.length, 1);
    assert.equal(readDicePromptResults(host.requests[0].prompt.findLast(message => message.role === 'user').content)[0].roll, 17);
    assert.equal(adapter.view().phase.kind, 'awaiting-choice');
    assert.equal(adapter.records(host.source.chat[0]).checks[0].roll, 17);
    assert.deepEqual(host.nativeSaves[0][0].extra.xiaobaiOsDice.checks[0], prepared.records.checks[0]);
    assert.equal(host.nativeSaves[0][0].extra.xiaobaiOsDice.checks.length, 2);
    assert.deepEqual(host.nativeSaves[0][0].extra.other, { kept: true });
    assert.equal(host.diceWrites, 0);
    await rerolls.idle();
});

test('an instant reveal can reroll during native save cleanup but not during a new generation', async t => {
    const wallet = await userEconomyHarness(); await wallet.economy.refresh();
    const results = createDiceResults(wallet.store(DICE_PARTITION));
    const rerolls = createDiceRerollService(wallet.store(DICE_PARTITION), wallet.transactions, wallet.economy, results,
        target => adapter.current(target), { random: () => .8, onError: error => assert.fail(error) });
    t.after(() => { rerolls.dispose(); results.dispose(); });
    const adapter = setup(t, false, async () => {}, rerolls, results);
    await begin(); await host.intercept('normal');
    host.source.chat.push(message(call));
    await received(); await setImmediate();
    host.saving(true);
    assert.equal(adapter.actions(1).rerollDisabled, false);
    await adapter.act(adapter.actions(1).target, 'reroll-check');
    assert.equal(adapter.records(host.source.chat[1]).checks[0].roll, 17);
    assert.equal(host.requests.length, 0);
    host.saving(false);
    await host.emit('GENERATION_STARTED', 'normal', {}, false);
    await host.emit('GENERATION_AFTER_COMMANDS', 'normal', {}, false);
    assert.equal(adapter.actions(1).rerollDisabled, true);
    await assert.rejects(adapter.act(adapter.actions(1).target, 'reroll-check'), { code: 'dice_busy' });
    await rerolls.idle();
});

test('unavailable Dice results do not interrupt native saving of new prose', async t => {
    const results = createDiceResults({ subscribe: () => () => {}, peekCurrent: () => null });
    setup(t, false, async () => {}, null, results);
    const prepared = prepareActionCheck({ body: call, generatedFrom: 0, id: 'original', random: () => .3 });
    host.source.chat = [{ ...message(prepared.body), extra: { xiaobaiOsDice: prepared.records } }];
    await host.generate('normal', { depth: 1 });
    assert.equal(host.nativeSaves.length, 1);
    assert.equal(host.nativeSaves[0][0].mes, prepared.body + '\n\nAfterward.');
    assert.deepEqual(host.nativeSaves[0][0].extra.xiaobaiOsDice, prepared.records);
});

test('same-roll recovery accepts an edited terminal marker even after removing a later saved check', async t => {
    const adapter = setup(t);
    const target = structuredClone(upstreamMessage);
    const raw = structuredClone(target.extra.xiaobaiOsDice);
    const wall = parseDiceRecords(raw).checks[0];
    host.source.chat = [target];
    t.mock.method(Math, 'random', () => assert.fail('retained markers never reroll'));
    for (const body of ['Edited approach. [dice:wall]', 'Reordered. [dice:door] Moved wall. [dice:wall]']) {
        target.mes = body;
        await choose(adapter, 0);
        assert.equal(target.mes, body + '\n\nAfterward.');
        assert.deepEqual(readDicePromptResults(host.requests.at(-1).prompt.findLast(item => item.role === 'user').content).at(-1), projectActionCheckResults([wall])[0]);
        assert.equal(adapter.view(), null);
        assert.deepEqual(target.extra.xiaobaiOsDice, raw);
    }
    assert.equal(host.requests.length, 2);
});

// The native event boundary is the cheapest place to verify installation, request projection and cleanup together.
test('each generation uses the current frequency, including continuations with already-confirmed results', async t => {
    setup(t);
    const rules = new Set();
    for (const frequency of ['standard', 'active']) {
        host.frequency = frequency;
        await begin();
        await host.intercept('normal');
        const [prompt] = host.prompts.values();
        assert.equal(host.prompts.size, 1);
        assert.deepEqual(prompt, { value: buildActionCheckRules(frequency, 'd20', true),
            position: 1, depth: 1, scan: false, role: 1 });
        rules.add(prompt.value);
    }
    assert.equal(rules.size, 2, 'the two preferences produce distinct model instructions');
    const saved = prepareActionCheck({ body: call, generatedFrom: 0, id: 'saved', random: () => 0.4 });
    host.source.chat.push({ ...message(saved.body), extra: { xiaobaiOsDice: saved.records } });
    for (const frequency of ['standard', 'active']) {
        host.frequency = frequency;
        await begin('continue');
        await host.intercept('continue');
        const prompt = [...host.prompts.values()].find(item => item.depth === 1);
        assert.deepEqual(prompt, { value: buildActionCheckRules(frequency, 'd20', true),
            position: 1, depth: 1, scan: false, role: 1 });
        const request = { prompt: [...host.promptMessages(), { role: 'assistant', content: saved.body }] };
        await host.emit('GENERATE_AFTER_DATA', request, false);
        assert.deepEqual(readDicePromptResults(request.prompt.findLast(item => item.role === 'user').content), projectActionCheckResults(saved.records.checks));
        assert.deepEqual(host.source.chat.at(-1).extra.xiaobaiOsDice, saved.records, 'switching frequency preserves rolled results');
    }
    host.enabled = false;
    await begin();
    await host.intercept('normal');
    assert.equal(host.prompts.size, 0);
});

test('CoC checks apply once and retry a failed continuation without rolling or revealing again', async t => {
    let reveals = 0;
    const adapter = setup(t, false, async () => { reveals++; });
    host.rule = 'coc7';
    const samples = [0.5, 0.1];
    let draws = 0;
    t.mock.method(Math, 'random', () => { assert.ok(draws < samples.length); return samples[draws++]; });
    const original = cocCall + '\n</fictional_scenarios>';
    host.source.chat = [{ ...message(original), swipe_id: 1, swipes: ['Inactive', original],
        swipe_info: [{ extra: { foreign: 1 } }, { extra: { foreign: 2 } }] }];
    await begin(); await host.intercept('normal');
    await host.saveNative();
    host.reply = async () => { throw new Error('provider unavailable'); };
    await received(); await received(); await settled(adapter);
    assert.equal(adapter.view().phase.kind, 'continue-error');
    assert.equal(draws, 2);
    assert.equal(reveals, 1);
    const current = host.source.chat[0];
    const records = structuredClone(current.extra.xiaobaiOsDice);
    assert.equal(current.mes, `[dice:${records.checks[0].id}]`, 'continuation starts at the saved result, without the preset suffix');
    assert.equal(records.checks.length, 1);
    assert.equal(records.checks[0].rule, 'coc7');
    assert.equal(records.checks[0].result.verdict, 'achieved');
    assert.equal(current.swipes[1], current.mes);
    assert.deepEqual(current.swipe_info[1].extra.xiaobaiOsDice, records);
    assert.deepEqual(current.swipe_info[0], { extra: { foreign: 1 } });
    assert.equal(current.swipes[0], 'Inactive');
    host.rule = 'd20'; adapter.cancel();
    host.reply = async () => { current.mes += '\nThe door opens.'; await host.emit('MESSAGE_RECEIVED', 0, 'appendFinal'); };
    await choose(adapter, 0);
    assert.equal(draws, 2);
    assert.equal(reveals, 1);
    assert.equal(host.nativeSaves.length, 2, 'only native reply and continuation saves');
    assert.deepEqual(parseDiceRecords(host.nativeSaves.at(-1)[0].extra.xiaobaiOsDice), records);
    assert.equal(host.requests.length, 2);
    assert.deepEqual(readDicePromptResults(host.requests.at(-1).prompt.findLast(item => item.role === 'user').content), projectActionCheckResults(records.checks));
    assert.equal(adapter.isBusy(), false);
});

test('retrying a retained CoC chain does not read the current player sheet again', async t => {
    const adapter = setup(t);
    host.rule = 'coc7';
    host.source.chat = [message(cocCall)];
    host.reply = async () => { throw new Error('provider unavailable'); };
    await begin(); await host.intercept('normal'); await received(); await settled(adapter);
    const reads = host.sheetReads;
    const records = structuredClone(host.source.chat[0].extra.xiaobaiOsDice);
    host.sheet = null;
    host.reply = async () => { host.source.chat[0].mes += '\nFinished.'; await host.emit('MESSAGE_RECEIVED', 0, 'appendFinal'); };
    await choose(adapter, 0);
    assert.equal(host.sheetReads, reads);
    assert.deepEqual(host.source.chat[0].extra.xiaobaiOsDice, records);
});

test('native stream UI ending before MESSAGE_RECEIVED still resolves CoC; failures without a message release the selector', async t => {
    const adapter = setup(t);
    host.rule = 'coc7';
    host.source.chat = [message(cocCall)];
    await begin(); host.lock(); await host.intercept('normal');
    assert.equal(adapter.isBusy(), true);
    assert.equal(host.busyViews.at(-1), true, 'the settings page receives native generation occupancy');
    host.unlock(); // ST 1.18 finalizeIntermediaryMessage unlocks before emitting the reply.
    await received(); await settled(adapter);
    assert.equal(host.source.chat[0].extra.xiaobaiOsDice.checks[0].rule, 'coc7');
    assert.equal(adapter.isBusy(), false);
    await begin(); host.lock(); await host.intercept('normal');
    host.unlock(); // A provider error without MESSAGE_RECEIVED must not leave a persistent UI lock.
    assert.equal(adapter.isBusy(), false);
});

test('the reply snapshot survives edits and rule changes; next replies capture the new configuration', async t => {
    const adapter = setup(t);
    host.rule = 'coc7';
    Object.assign(host.sheet.attributes, { body: 40, mind: 50, will: 60, appearance: 50 });
    host.source.chat = [message(cocCall)];
    await begin(); await host.intercept('normal');
    Object.assign(host.sheet.attributes, { body: 80, mind: 50, will: 20, appearance: 50 });
    host.rule = 'd20';
    let continuations = 0;
    host.reply = async () => {
        host.source.chat[0].mes += ++continuations === 1 ? '\n\n' + cocCall : '\nFinished.';
        await host.emit('MESSAGE_RECEIVED', 0, 'appendFinal');
    };
    await received(); await settled(adapter);
    const records = host.source.chat[0].extra.xiaobaiOsDice.checks;
    assert.deepEqual(records.map(record => [record.rule, record.result.value]), [['coc7',40],['coc7',40]]);
    host.rule = 'coc7';
    host.source.chat = [message(cocCall)];
    await begin(); await host.intercept('normal');
    await received(); await settled(adapter);
    assert.equal(host.source.chat[0].extra.xiaobaiOsDice.checks[0].result.value, 80);
});

test('uninitialized CoC has no request prompt and cannot roll, but saved results can still resume', async t => {
    const adapter = setup(t);
    host.rule = 'coc7'; host.sheet = null;
    host.source.chat = [message('Ordinary conversation.')];
    await begin(); await host.intercept('normal');
    assert.equal(host.prompts.size, 0);
    await received(); await settled(adapter);
    assert.equal(host.source.chat[0].extra.xiaobaiOsDice, undefined);
    const retained = prepareActionCheck({ body: cocCall, rule: 'coc7', coc7Sheet: generateCoc7Sheet(() => 0.5), generatedFrom: 0, id: 'retained' });
    host.source.chat = [{ ...message(retained.body), extra: { xiaobaiOsDice: retained.records } }];
    t.mock.method(Math, 'random', () => assert.fail('history retry must not roll'));
    await choose(adapter, 0);
    assert.deepEqual(host.source.chat[0].extra.xiaobaiOsDice, retained.records);
    assert.equal(adapter.view(), null);
});

test('a damaged stored sheet does not abort ordinary chat or enable CoC rolls', async t => {
    const adapter = setup(t);
    host.rule = 'coc7';
    host.sheet = { ...host.sheet, luck: '50' };
    const raw = structuredClone(host.sheet);
    t.mock.method(Math, 'random', () => assert.fail('a damaged sheet must not roll'));
    host.source.chat = [message('Ordinary conversation.')];
    await begin();
    assert.equal(await host.intercept('normal'), false);
    assert.equal(host.prompts.size, 0);
    await received(); await settled(adapter);
    assert.equal(host.source.chat[0].extra.xiaobaiOsDice, undefined);
    host.source.chat = [message(cocCall)];
    await begin(); await host.intercept('normal'); await received(); await settled(adapter);
    assert.equal(adapter.view().phase.kind, 'invalid');
    assert.equal(host.source.chat[0].extra.xiaobaiOsDice, undefined);
    assert.deepEqual(host.sheet, raw);
});

test('final requests hide Dice markers without changing source messages, non-text parts or result data', async t => {
    setup(t);
    const saved = prepareActionCheck({ body: call, generatedFrom: 0, id: 'saved', random: () => 0.4 });
    host.source.chat.push({ ...message(saved.body), extra: { xiaobaiOsDice: saved.records } });
    await begin('continue');
    await host.intercept('continue');
    const sourceMessages = [
        { role: 'assistant', content: saved.body, extra: host.source.chat.at(-1).extra },
        { role: 'user', content: [
            { type: 'text', text: 'Before[dice:saved]\n[dice:second-ID_2]After [image:keep] [ordinary] <xb_action_check>' },
            { type: 'image_url', image_url: { url: 'https://example.test/[dice:keep].png' } },
        ] },
        { role: 'assistant', content: null, tool_calls: [{ id: 'keep', function: { arguments: '[dice:keep]' } }] },
        { role: 'assistant', tool_calls: [] },
        ...host.promptMessages(),
    ];
    const original = structuredClone(sourceMessages);
    const savedChat = structuredClone(host.source.chat);
    const data = { prompt: sourceMessages, temperature: 0.5 };
    await host.emit('GENERATE_AFTER_DATA', data, false);
    assert.equal(data.prompt[0].content, 'Attempt.\n\n');
    assert.equal(data.prompt[1].content[0].text, 'Before\nAfter [image:keep] [ordinary] <xb_action_check>');
    assert.deepEqual(data.prompt[1].content[1], original[1].content[1]);
    assert.deepEqual(data.prompt.slice(2), original.slice(2));
    assert.deepEqual(readDicePromptResults(data.prompt.at(-1).content), projectActionCheckResults(saved.records.checks));
    assert.deepEqual(sourceMessages, original, 'host-owned prompt objects are not mutated');
    assert.deepEqual(host.source.chat, savedChat, 'body, records and continuation anchors remain unchanged');
    assert.equal(data.temperature, 0.5);
    assert.equal(host.prompts.size, 0, 'the native prompt is cleared after assembly');
});

// Protect the extension API contract, not a second implementation of native budgeting/formatting.
test('rules use native D1 USER and results use D0 USER without duplicate lore injection', async t => {
    setup(t);
    const saved = prepareActionCheck({ body: call, generatedFrom: 0, id: 'saved', random: () => 0.4 });
    host.source.chat.push({ ...message(saved.body), extra: { xiaobaiOsDice: saved.records } });
    await begin('continue'); await host.intercept('continue');
    const prompts = [...host.prompts.values()];
    const prompt = prompts.find(item => item.depth === 0);
    assert.equal(prompts.length, 2);
    assert.deepEqual({ position: prompt.position, depth: prompt.depth, scan: prompt.scan, role: prompt.role },
        { position: 1, depth: 0, scan: false, role: 1 });
    assert.deepEqual(readDicePromptResults(prompt.value), projectActionCheckResults(saved.records.checks));
    const loaded = { globalLore: [] };
    await host.emit('WORLDINFO_ENTRIES_LOADED', loaded);
    assert.deepEqual(loaded.globalLore, []);
    assert.deepEqual(prompts.find(item => item.depth === 1), {
        value: buildActionCheckRules('standard', 'd20', true), position: 1, depth: 1, scan: false, role: 1,
    });
    const data = { prompt: [...host.promptMessages(), { role: 'assistant', content: saved.body }] };
    await host.emit('GENERATE_AFTER_DATA', data, true);
    assert.equal(host.prompts.size, 2, 'a preview does not consume live injections');
    await host.emit('GENERATE_AFTER_DATA', data, false);
    assert.equal(host.prompts.size, 0);
    assert.equal(data.prompt.length, 3, 'no extra message is appended after assembly');
    assert.deepEqual(readDicePromptResults(data.prompt.findLast(item => item.role === 'user').content), projectActionCheckResults(saved.records.checks));
    await begin('normal'); await host.intercept('normal');
    assert.equal(host.prompts.size, 1);
    assert.equal([...host.prompts.values()].some(item => item.depth === 0), false, 'an unrelated turn does not inherit the result');
});

test('pending rule and result injections clear on cancellation, chat changes and disabling Dice', async t => {
    const adapter = setup(t);
    const saved = prepareActionCheck({ body: call, generatedFrom: 0, id: 'saved', random: () => 0.4 });
    host.source.chat.push({ ...message(saved.body), extra: { xiaobaiOsDice: saved.records } });
    for (const clear of [
        () => host.emit('GENERATION_STOPPED'),
        () => host.emit('CHAT_CHANGED'),
        () => adapter.cancel(),
        () => { host.enabled = false; adapter.stop(); },
    ]) {
        await begin('continue'); await host.intercept('continue');
        assert.equal(host.prompts.size, 2);
        await clear();
        assert.equal(host.prompts.size, 0);
    }
});

test('historical Dice markers filter for text requests and previews even with checks disabled', async t => {
    setup(t);
    host.enabled = false;
    const original = 'Before\n[dice:one][dice:two-ID_3]\nAfter [image:keep] [ordinary] [dice:] [dice:unfinished';
    for (const dryRun of [true, false]) {
        const data = { prompt: original, max_length: 80 };
        await host.emit('GENERATE_AFTER_DATA', data, dryRun);
        assert.equal(data.prompt, 'Before\n\nAfter [image:keep] [ordinary] [dice:] [dice:unfinished');
        assert.equal(data.max_length, 80);
        assert.equal(host.prompts.size, 0);
    }
    assert.equal(host.requests.length, 0);
});

test('NovelAI input hides Dice markers without requiring or adding a prompt field', async t => {
    setup(t);
    host.enabled = false;
    for (const dryRun of [true, false]) {
        const data = { input: 'Before[dice:one]\n[dice:two-ID_3]After [ordinary]', model: 'kayra-v1', use_string: true };
        await host.emit('GENERATE_AFTER_DATA', data, dryRun);
        assert.deepEqual(data, { input: 'Before\nAfter [ordinary]', model: 'kayra-v1', use_string: true });
    }
});

test('CFG requests hide Dice markers in both positive and negative context', async t => {
    setup(t);
    const source = 'History[dice:one]\nContinuation[dice:two-ID_3]';
    host.source.chat.at(-1).mes = source;
    const data = { prompt: source, negative_prompt: source + '\nAvoid repetition', guidance_scale: 1.5,
        stopping_strings: ['[dice:keep]'] };
    await host.emit('GENERATE_AFTER_DATA', data, false);
    assert.deepEqual(data, { prompt: 'History\nContinuation', negative_prompt: 'History\nContinuation\nAvoid repetition',
        guidance_scale: 1.5, stopping_strings: ['[dice:keep]'] });
    assert.equal(host.source.chat.at(-1).mes, source);
});

test('Dice request filtering detaches on stop and reattaches on restart', async t => {
    const adapter = setup(t);
    await adapter.stop();
    const stopped = { prompt: 'Before[dice:one]After' };
    await host.emit('GENERATE_AFTER_DATA', stopped, false);
    assert.equal(stopped.prompt, 'Before[dice:one]After');
    adapter.start();
    adapter.start();
    const restarted = { prompt: stopped.prompt };
    await host.emit('GENERATE_AFTER_DATA', restarted, false);
    assert.equal(restarted.prompt, 'BeforeAfter');
});

test('ordinary prose, examples and invalid requests never acquire post-processing controls', async t => {
    const adapter = setup(t);
    const block = call.slice(call.indexOf('<xb_action_check>'));
    const bodies = ['Plain reply.', '```json\n' + block + '\n```', '~~~\n' + block + '\n~~~',
        '`' + block + '`', '> ' + block, '> Example:\n' + block, '    ' + block,
        block.slice(0, -4), block.replace('hard', 'unknown'), '<xb_action_check>{bad}</xb_action_check>\n</fictional_scenarios>', block + '\n' + block];
    for (const body of bodies) {
        await begin(); await host.intercept('normal');
        host.lock();
        const nativeLocks = host.locks;
        host.source.chat.push(message(body)); await received();
        assert.equal(host.locks, nativeLocks, body);
        host.unlock(); await setImmediate();
        assert.equal(host.stopVisible, false, body);
        assert.equal(host.busy, false, body);
        assert.equal(host.requests.length, 0, body);
    }
    host.source.chat.push(message(call));
    await begin('continue'); await host.intercept('continue');
    host.source.chat.at(-1).mes += '\nNormal continuation.';
    await received();
    assert.equal(adapter.view(), null, 'an old request is not a newly generated check');
    assert.equal(host.busy, false);
});

test('first roll is included in native save before animation completes without acquiring native controls', async t => {
    const revealing = Promise.withResolvers();
    const adapter = setup(t, false, () => revealing.promise);
    await begin(); await host.intercept('normal'); host.lock();
    const target = { ...message(call), swipe_id: 0, swipes: [call], swipe_info: [{ extra: { foreign: true } }] };
    host.source.chat.push(target);
    await received(); await received();
    assert.equal(adapter.view().phase.kind, 'revealing');
    assert.equal(target.extra.xiaobaiOsDice.checks.length, 1);
    await host.saveNative(); host.unlock(); await setImmediate();
    assert.equal(host.nativeSaves.length, 1);
    assert.deepEqual(host.nativeSaves[0].at(-1).extra.xiaobaiOsDice, target.extra.xiaobaiOsDice);
    assert.equal(host.busy, false);
    assert.equal(host.requests.length, 0);
    revealing.resolve(); await setImmediate(); await choose(adapter, 1);
    assert.equal(host.requests.length, 1);
    assert.equal(host.nativeSaves.length, 2);
    assert.equal(host.diceWrites, 0);
    const reloaded = host.nativeSaves.at(-1).at(-1);
    assert.deepEqual(reloaded.swipe_info[0].extra.xiaobaiOsDice, target.extra.xiaobaiOsDice);
    assert.equal(reloaded.swipe_info[0].extra.foreign, true);
});

for (const replacement of [false, true]) {
    test(`${replacement ? 'a replacement generation' : 'Stop'} cancels delayed reveal without late continuation or control theft`, async t => {
        const revealing = Promise.withResolvers();
        const adapter = setup(t, false, () => revealing.promise);
        await adapter.stop();
        const otherListener = Promise.withResolvers();
        const event = replacement ? 'GENERATION_STARTED' : 'GENERATION_STOPPED';
        let blocked = false;
        t.after(host.listen(event, () => blocked ? otherListener.promise : undefined));
        adapter.start();
        await begin(); await host.intercept('normal');
        host.source.chat.push(message(call)); await received(); await setImmediate();
        assert.equal(adapter.view().phase.kind, 'revealing');
        assert.equal(host.stopVisible, false);
        blocked = true;
        let starting;
        if (replacement) {
            host.lock(); starting = begin();
        } else { host.stop(); }
        await setImmediate();
        assert.equal(adapter.view(), null, 'cancellation must precede unrelated slow native listeners');
        assert.equal(host.busy, replacement);
        assert.equal(host.stopVisible, replacement);
        revealing.resolve(); await setImmediate();
        assert.equal(host.requests.length, 0);
        assert.equal(host.busy, replacement);
        assert.equal(host.stopVisible, replacement);
        assert.equal(host.prompts.size, 0);
        otherListener.resolve(); await starting;
    });
}

for (const mode of ['request', 'stream', 'already-stopped']) {
    const streaming = mode === 'stream';
    test(`replacement generation cancels the old ${mode} and waits for its native cleanup`, async t => {
        const adapter = setup(t);
        const cleanup = Promise.withResolvers();
        const replacementReply = Promise.withResolvers();
        t.after(() => { cleanup.resolve(); replacementReply.resolve(); });
        const streamController = new AbortController();
        const normalReply = host.reply;
        host.reply = async signal => {
            if (host.requests.length === 1) {
                if (streaming) host.stream = { isStopped: false,
                    onStopStreaming() { streamController.abort(); this.isStopped = true; } };
                await cleanup.promise;
                host.stream = null;
                (streaming ? streamController.signal : signal).throwIfAborted();
                await normalReply();
            } else { await replacementReply.promise; await normalReply(); }
        };
        await begin(); await host.intercept('normal');
        const target = message(call); host.source.chat.push(target);
        await received(); await startContinuation(adapter); await setImmediate();
        assert.equal(host.requests.length, 1);
        const oldSignal = host.requests[0].signal;
        if (mode === 'already-stopped') { host.stop(); await setImmediate(); }
        // Native callers may install their controller before emitting GENERATION_STARTED.
        const nextController = new AbortController(); host.controller = nextController;
        const replacement = host.generate('normal', { signal: nextController.signal, depth: 1 });
        await setImmediate();
        assert.equal(oldSignal.aborted, true);
        if (streaming) assert.equal(streamController.signal.aborted, true);
        assert.equal(nextController.signal.aborted, false, 'cancellation must not stop the incoming request');
        assert.equal(host.requests.length, 1, 'the old native finalizer must finish before dispatching a new request');
        assert.equal(host.busy, true);
        assert.equal(host.stopVisible, true, 'waiting for the old native call remains stoppable');
        cleanup.resolve(); await setImmediate();
        assert.equal(host.requests.length, 2);
        assert.equal(host.busy, true);
        assert.equal(host.stopVisible, true);
        assert.equal(target.mes, 'Attempt.\n\n[dice:generated-0]', 'the aborted request cannot append late text');
        replacementReply.resolve(); await replacement;
        assert.equal(adapter.view(), null);
        assert.equal(host.busy, false);
        assert.equal(host.stopVisible, false);
    });
}

test('Stop during replacement handoff prevents the incoming native call from dispatching', async t => {
    const adapter = setup(t);
    const cleanup = Promise.withResolvers();
    t.after(() => cleanup.resolve());
    host.reply = async signal => { await cleanup.promise; signal.throwIfAborted(); };
    await begin(); await host.intercept('normal');
    host.source.chat.push(message(call)); await received(); await startContinuation(adapter); await setImmediate();
    const replacement = host.generate('normal', { depth: 1 });
    await setImmediate();
    assert.equal(host.requests.length, 1);
    assert.equal(host.stopVisible, true);
    host.stop(); await setImmediate();
    assert.equal(host.busy, false);
    assert.equal(host.stopVisible, false);
    cleanup.resolve(); await replacement;
    assert.equal(host.requests.length, 1);
    assert.equal(host.busy, false);
    assert.equal(host.stopVisible, false);
    assert.equal(adapter.view(), null);
});

// Same-roll recovery waits for the cancelled native call's complete Promise.
// Exercise the real adapter with delayed requests/saves and out-of-order completion.
for (const rule of ['d20', 'coc7']) {
    for (const pending of ['request', 'save']) {
        test(`${rule} retry after Stop waits for the old ${pending} to finish and retains ownership`, async t => {
            let reveals = 0;
            const adapter = setup(t, false, async () => { reveals++; });
            host.rule = rule;
            const cleanup = Promise.withResolvers();
            const retryReply = Promise.withResolvers();
            t.after(() => { cleanup.resolve(); retryReply.resolve(); });
            const nativeSave = host.saveNative;
            let saves = 0;
            t.mock.method(host, 'saveNative', async () => {
                if (++saves === 1 && pending === 'save') { await cleanup.promise; }
                await nativeSave();
            });
            host.reply = async signal => {
                if (host.requests.length === 1) {
                    if (pending === 'request') { await cleanup.promise; signal.throwIfAborted(); }
                    host.unlock();
                    await host.emit('MESSAGE_RECEIVED', 1, 'continue');
                } else {
                    await retryReply.promise;
                    signal.throwIfAborted();
                    host.source.chat.at(-1).mes += '\n\nAfterward.';
                    await host.emit('MESSAGE_RECEIVED', 1, 'continue');
                }
            };
            await begin(); await host.intercept('normal');
            const target = message(rule === 'd20' ? call : cocCall); host.source.chat.push(target);
            await received(); await startContinuation(adapter); await setImmediate();
            assert.equal(host.requests.length, 1);
            const saved = structuredClone(target.extra.xiaobaiOsDice);
            host.stop(); await setImmediate();
            assert.equal(host.requests[0].signal.aborted, true);
            const retry = choose(adapter, 1); await setImmediate();
            assert.equal(host.requests.length, 1, 'no request before old I/O completion');
            await assert.rejects(choose(adapter, 1));
            assert.equal(host.ids, 1);
            assert.equal(reveals, 1);
            cleanup.resolve();
            await new Promise(resolve => setTimeout(resolve, 60));
            assert.equal(host.requests[1].signal.aborted, false);
            assert.equal(adapter.view().phase.kind, 'continuing');
            assert.equal(host.busy, true);
            assert.equal(host.stopVisible, true);
            retryReply.resolve(); await retry;
            assert.equal(host.requests.length, 2);
            assert.deepEqual(target.extra.xiaobaiOsDice, saved);
            assert.equal(adapter.view(), null);
            assert.equal(host.busy, false);
        });
    }
}

for (const failed of [false, true]) {
    test(`cancelled preparation ${failed ? 'failure' : 'completion'} cannot clear the retry result`, async t => {
        const adapter = setup(t);
        await begin(); await host.intercept('normal');
        const preparing = Promise.withResolvers();
        const assembly = Promise.withResolvers();
        t.after(() => { preparing.resolve(); assembly.resolve(); });
        let preparations = 0;
        host.preflight = async () => { if (++preparations === 1) { await preparing.promise; } };
        // Native prompt assembly continues asynchronously after extension interceptors.
        const intercept = host.intercept;
        t.mock.method(host, 'intercept', async type => {
            const aborted = await intercept(type);
            if (!aborted) { await assembly.promise; }
            return aborted;
        });
        const target = message(call); host.source.chat.push(target);
        await received(); await startContinuation(adapter); await setImmediate();
        const saved = structuredClone(target.extra.xiaobaiOsDice);
        host.stop(); await setImmediate();
        const retry = choose(adapter, 1); await setImmediate();
        const retryPrompt = host.promptMessages();
        assert.equal(retryPrompt.length, 0);
        assert.equal(host.requests.length, 0);
        if (failed) { preparing.reject(new Error('preparation_failed')); }
        else { preparing.resolve(); }
        await new Promise(resolve => setTimeout(resolve, 60));
        assert.equal(host.promptMessages().length, 2);
        assert.equal(host.requests.length, 0);
        assert.equal(host.busy, true);
        assembly.resolve(); await retry;
        assert.equal(host.requests.length, 1, 'only the retry reaches the provider');
        assert.deepEqual(readDicePromptResults(host.requests[0].prompt.findLast(item => item.role === 'user').content), projectActionCheckResults(saved.checks));
        assert.equal(host.ids, 1);
        assert.deepEqual(target.extra.xiaobaiOsDice, saved);
        assert.equal(adapter.view(), null);
    });
}

test('stopped native save finishes before a same-roll retry can dispatch', async t => {
    const adapter = setup(t);
    const cleanup = Promise.withResolvers();
    t.after(() => cleanup.resolve());
    const nativeSave = host.saveNative;
    let saves = 0;
    t.mock.method(host, 'saveNative', async () => {
        if (++saves === 1) { await cleanup.promise; }
        await nativeSave();
    });
    const normalReply = host.reply;
    host.reply = async () => { if (host.requests.length > 1) { await normalReply(); } };
    await begin(); await host.intercept('normal');
    const target = message(call); host.source.chat.push(target);
    await received(); await startContinuation(adapter); await setImmediate();
    host.stop(); await setImmediate();
    const retry = choose(adapter, 1); await setImmediate();
    assert.equal(host.requests.length, 1);
    cleanup.resolve(); await retry;
    assert.equal(host.requests.length, 2);
    assert.equal(adapter.view(), null);
    assert.equal(host.busy, false);
    assert.equal(host.ids, 1);
});

test('native auto-swipe can re-enter Generate from the completed continuation without waiting on itself', { timeout: 2000 }, async t => {
    const adapter = setup(t);
    const completed = Promise.withResolvers();
    const normalReply = host.reply;
    host.reply = async () => {
        await normalReply();
        const target = host.source.chat.at(-1);
        target.swipe_id = 1; target.mes = '';
        await host.emit('MESSAGE_SWIPED', host.source.chat.length - 1);
        host.reply = normalReply;
        await host.generate('swipe');
        completed.resolve();
    };
    await begin(); await host.intercept('normal');
    host.source.chat.push(message(call)); await received(); await startContinuation(adapter);
    await completed.promise; await setImmediate();
    assert.equal(host.requests.length, 2);
    assert.equal(host.source.chat.at(-1).extra.xiaobaiOsDice, undefined);
    assert.equal(adapter.view(), null);
    assert.equal(host.busy, false);
    assert.equal(host.stopVisible, false);
});

test('continuation progress follows native preparation and response events without inventing a save wait', async t => {
    const adapter = setup(t);
    const prepared = prepareActionCheck({ body: call, generatedFrom: 0, id: 'progress', random: () => .3 });
    host.source.chat = [message(prepared.body)];
    host.source.chat[0].extra.xiaobaiOsDice = prepared.records;
    const preparing = Promise.withResolvers(), requesting = Promise.withResolvers(), reply = Promise.withResolvers();
    const normalReply = host.reply;
    let now = 1000;
    t.mock.method(Date, 'now', () => now);
    host.preflight = () => preparing.promise;
    host.reply = async () => { requesting.resolve(); await reply.promise; await normalReply(); };
    const operation = choose(adapter, 0);
    await setImmediate();
    assert.deepEqual(adapter.view().continuation, { stage: 'preparing', elapsedSeconds: 0 });
    now += 3500;
    assert.deepEqual(adapter.view().continuation, { stage: 'preparing', elapsedSeconds: 3 });
    await host.emit('GENERATE_AFTER_DATA', {}, true);
    assert.equal(adapter.view().continuation.stage, 'preparing', 'dry runs cannot advance the live request');
    preparing.resolve(); await requesting.promise;
    assert.deepEqual(adapter.view().continuation, { stage: 'requesting', elapsedSeconds: 0 });
    now += 7000;
    assert.equal(adapter.view().continuation.elapsedSeconds, 7);
    await host.emit('STREAM_TOKEN_RECEIVED', '');
    assert.deepEqual(adapter.view().continuation, { stage: 'responding', elapsedSeconds: 0 });
    assert.equal(host.source.chat[0].mes, prepared.body, 'response chunks need not contain visible prose yet');
    now += 2000;
    await host.emit('STREAM_TOKEN_RECEIVED', '');
    assert.equal(adapter.view().continuation.elapsedSeconds, 2, 'more chunks do not reset stage time');
    reply.resolve(); await operation;
    assert.equal(adapter.view(), null);
    assert.equal(host.requests.length, 1);
    assert.deepEqual(host.source.chat[0].extra.xiaobaiOsDice, prepared.records);
});

test('Stop cancels a continuation retry during native preparation without another request', async t => {
    const adapter = setup(t);
    await begin(); await host.intercept('normal');
    host.source.chat.push(message(call));
    host.reply = async () => { throw new Error('provider unavailable'); };
    await received(); await settled(adapter);
    assert.equal(adapter.view().phase.kind, 'continue-error');
    const requests = host.requests.length;
    const preparing = Promise.withResolvers();
    host.preflight = () => preparing.promise;
    host.stream = { isStopped: false };
    const retry = choose(adapter, 1);
    await setImmediate();
    assert.equal(adapter.view().continuation.stage, 'preparing');
    assert.equal(host.busy, true);
    assert.equal(host.stopVisible, true);
    host.stop(); await setImmediate();
    assert.equal(adapter.view(), null);
    assert.equal(host.busy, true, 'native preparation still owns its controls');
    assert.equal(host.stopVisible, false);
    preparing.resolve(); await retry;
    assert.equal(host.busy, false);
    assert.equal(host.requests.length, requests);
});

test('successive checks in one reply retain busy ownership across native continuation unlocks', async t => {
    const adapter = setup(t);
    await begin(); await host.intercept('normal');
    host.source.chat.push(message(call));
    const finalReply = host.reply;
    host.reply = async () => {
        host.source.chat.at(-1).mes += '\n\n' + call;
        await host.emit('MESSAGE_RECEIVED', host.source.chat.length - 1, 'appendFinal');
        host.reply = finalReply;
    };
    await received(); await settled(adapter);
    assert.equal(host.requests.length, 2);
    assert.ok(host.requests.every(request => request.busy));
    assert.equal(host.source.chat.at(-1).extra.xiaobaiOsDice.checks.length, 2);
    assert.equal(host.stopVisible, false);
    assert.equal(host.busy, false);
});

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
        if (mode === 'group-member') {
            await host.emit('GROUP_MEMBER_DRAFTED');
            assert.equal(host.requests.length, 0, 'the group pauses before another member can generate');
            assert.equal(adapter.view().phase.kind, 'awaiting-choice');
            host.group(false); await host.emit('GROUP_WRAPPER_FINISHED');
        }
        if (mode === 'group-finished') { host.group(false); await host.emit('GROUP_WRAPPER_FINISHED'); }
        await settled(adapter);
        assert.equal(host.draft, '/echo UNSENT_DRAFT');
        assert.equal(host.source.chat.length, 2);
        assert.equal(host.source.chat.at(-1), target);
        assert.equal(target.mes, 'Attempt.\n\n[dice:generated-0]\n\nAfterward.');
        assert.equal(target.extra.xiaobaiOsDice.checks.length, 1);
        assert.equal(host.requests.length, 1);
        assert.equal(host.requests[0].busy, true);
        assert.equal(host.busy, false);
        const data = readDicePromptResults(host.requests[0].prompt.findLast(item => item.role === 'user').content);
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
    assert.equal(host.requests.length, 1);
});

test('reveal does not hold native controls and late completion cannot unlock a replacement generation', async t => {
    let release;
    let shown;
    const revealing = new Promise(resolve => { shown = resolve; });
    const adapter = setup(t, false, async () => {
        shown(); await new Promise(resolve => { release = resolve; });
    });
    await begin(); await host.intercept('normal');
    host.source.chat.push(message(call)); await received(); await revealing;
    assert.equal(host.busy, false);
    assert.equal(host.stopVisible, false);
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

for (const change of ['edit', 'chat', 'swipe']) {
    test(`${change} during reveal keeps the local result but prevents late continuation`, async t => {
        const revealing = Promise.withResolvers();
        let signal;
        const adapter = setup(t, false, async (_target, _candidate, currentSignal) => { signal = currentSignal; await revealing.promise; });
        await begin(); await host.intercept('normal');
        const target = message(call); host.source.chat.push(target);
        await received(); await setImmediate();
        const records = structuredClone(target.extra.xiaobaiOsDice);
        if (change === 'edit') { target.mes = 'User edit. [dice:generated-0]'; await host.emit('MESSAGE_EDITED', 1); }
        if (change === 'chat') { host.source = { ...host.source, key: 'other', chat: [message('Other chat')] }; await host.emit('CHAT_CHANGED'); }
        if (change === 'swipe') { target.swipe_id = 1; target.mes = 'Other swipe'; await host.emit('MESSAGE_SWIPED', 1); }
        const body = target.mes;
        assert.equal(signal.aborted, true);
        revealing.resolve(); await setImmediate();
        assert.equal(adapter.view(), null);
        assert.equal(host.requests.length, 0);
        assert.equal(target.mes, body);
        assert.deepEqual(target.extra.xiaobaiOsDice, records);
    });
}

test('shutdown does not roll back the local result and reload restores the native saved result without replay', async t => {
    const revealing = Promise.withResolvers();
    const adapter = setup(t, false, () => revealing.promise);
    t.mock.timers.enable({ apis: ['setTimeout'] });
    await begin(); await host.intercept('normal');
    host.lock(); const target = message(call); host.source.chat.push(target);
    await received(); await host.saveNative(); host.unlock();
    t.mock.timers.tick(40); await setImmediate();
    assert.equal(adapter.view().phase.kind, 'revealing');
    const records = structuredClone(target.extra.xiaobaiOsDice);
    adapter.stop();
    assert.equal(adapter.view(), null);
    assert.deepEqual(target.extra.xiaobaiOsDice, records, 'stopping leaves the result in the current message');
    host.source.chat = structuredClone(host.nativeSaves.at(-1));
    assert.deepEqual(host.source.chat.at(-1).extra.xiaobaiOsDice, records);
    adapter.start(); revealing.resolve(); await setImmediate();
    assert.equal(host.requests.length, 0, 'reload never re-executes a historical request');
    assert.equal(host.nativeSaves.length, 1);
    assert.equal(adapter.view(), null);
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
    assert.equal(target.extra.xiaobaiOsDice.checks.length, 1);
    assert.equal(host.requests.length, 0);
    assert.equal(host.source.chat.at(-1).mes, 'New user message');
    assert.equal(host.busy, false);
});

test('readiness follows native generation occupancy without waiting for or clearing the stream', async t => {
    setup(t);
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const target = captureDiceTarget(captureDiceChat(), 0, 0);
    host.saving(true);
    const stream = { isStopped: false, isFinished: true };
    host.stream = stream; host.busy = true;
    let ready = false;
    const operation = waitForDiceHost(target, new AbortController().signal, false).then(() => { ready = true; });
    await setImmediate();
    assert.equal(ready, false, 'native generation occupancy still blocks admission');
    host.group(true); host.busy = false;
    t.mock.timers.tick(40); await setImmediate();
    assert.equal(ready, false, 'the group wrapper remains busy between member generations');
    host.group(false);
    t.mock.timers.tick(40); await operation;
    assert.equal(ready, true);
    assert.equal(host.stream, stream, 'Dice must not clear native processor state');

    host.busy = true;
    const controller = new AbortController();
    const cancelled = waitForDiceHost(target, controller.signal, false);
    controller.abort();
    await assert.rejects(cancelled);
});

// Both restored results and new rolls wait for native cleanup only when Continue is chosen.
for (const rule of ['d20', 'coc7']) {
    for (const entry of ['automatic', 'reloaded-request', 'reloaded-result']) {
        test(`${rule} ${entry} respects result persistence while native cleanup is pending`, async t => {
            const adapter = setup(t);
            host.rule = rule;
            const body = rule === 'd20' ? call : cocCall;
            const target = message(body);
            let saved;
            if (entry === 'reloaded-result') {
                const candidate = prepareActionCheck({ body, records: undefined, generatedFrom: 0,
                    rule, coc7Sheet: host.sheet, id: 'persisted-check', random: () => 0.5 });
                assert.equal(candidate.kind, 'candidate');
                target.mes = candidate.body;
                target.extra.xiaobaiOsDice = candidate.records;
                saved = structuredClone(candidate.records);
            }
            if (entry === 'automatic') { await begin(); await host.intercept('normal'); }
            host.source.chat.push(JSON.parse(JSON.stringify(target)));
            const savingAtDispatch = [];
            const streamsAtDispatch = [];
            const normalReply = host.reply;
            host.reply = async () => {
                savingAtDispatch.push(host.savingActive);
                streamsAtDispatch.push(host.stream);
                await normalReply();
            };
            const stream = { messageId: 1, isStopped: false, isFinished: true };
            host.stream = stream;
            host.saving(true);
            let operation = entry === 'automatic' ? received() : entry === 'reloaded-request' ? Promise.resolve() : choose(adapter, 1);
            await setImmediate();
            if (entry === 'automatic') {
                assert.equal(host.requests.length, 0);
                assert.equal(adapter.view().phase.kind, 'awaiting-choice');
                assert.equal(adapter.actions(1).disabled, false);
                operation = choose(adapter, 1);
            }
            assert.deepEqual(savingAtDispatch, []);
            host.saving(false);
            // A received native stream is released after saving. Loaded entries have
            // no observed native call, so their residual processor is not a wait gate.
            if (entry === 'automatic') { host.stream = null; }
            if (entry === 'reloaded-request') { operation = choose(adapter, 1); }
            await operation;
            assert.deepEqual(savingAtDispatch, [false]);
            assert.deepEqual(streamsAtDispatch, [entry === 'automatic' ? null : stream], 'Only native code releases its processor');
            await operation;
            await settled(adapter);
            assert.equal(host.requests.length, 1);
            const records = host.source.chat.at(-1).extra.xiaobaiOsDice;
            assert.equal(records.checks.length, 1);
            assert.equal(host.ids, saved ? 0 : 1);
            if (saved) { assert.deepEqual(records, saved); }
            assert.equal(adapter.view(), null);
            assert.equal(host.busy, false);
        });
    }
}

test('a failed incoming stream never rolls, and its residual processor cannot reject the next non-streaming reply', async t => {
    const adapter = setup(t);
    await begin();
    await host.intercept('normal');
    const failedReply = message(call);
    host.source.chat.push(failedReply);
    host.stream = { isStopped: true, isFinished: false };
    await received();
    await settled(adapter);
    assert.equal(host.requests.length, 0);
    assert.equal(failedReply.extra.xiaobaiOsDice, undefined);

    await begin('regenerate');
    host.source.chat.pop();
    await host.emit('MESSAGE_DELETED', 1);
    await host.intercept('regenerate');
    host.source.chat.push(message(call));
    await received();
    await settled(adapter);
    assert.equal(host.requests.length, 1);
    assert.equal(host.source.chat.at(-1).extra.xiaobaiOsDice.checks.length, 1);
});

test('Continue reports elapsed native occupancy and never unlocks by a fixed timeout', async t => {
    const adapter = setup(t);
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: 1000 });
    await begin(); await host.intercept('normal');
    const target = message(call); host.source.chat.push(target); host.lock();
    await received(); await setImmediate();
    assert.equal(target.extra.xiaobaiOsDice.checks.length, 1);
    const continuing = choose(adapter, 1);
    await setImmediate();
    assert.deepEqual(adapter.view().wait, { blockers: ['generation'], elapsedSeconds: 0 });
    t.mock.timers.tick(12000); await setImmediate();
    assert.equal(host.requests.length, 0);
    assert.equal(host.busy, true);
    assert.equal(adapter.view().wait.elapsedSeconds, 12);
    host.unlock(); t.mock.timers.tick(40); await continuing;
    assert.equal(host.requests.length, 1);
    assert.equal(host.ids, 1);
});

test('reload offers explicit recovery of only the latest unrolled request and never rolls by displaying it', async t => {
    const adapter = setup(t);
    host.source.chat = [message(call), message(call)];
    assert.equal(adapter.canRetryRequest(0), false);
    assert.equal(adapter.canRetryRequest(1), true);
    assert.equal(host.ids, 0);
    assert.equal(host.requests.length, 0);
    host.busy = true;
    assert.equal(adapter.canRetryRequest(1), false);
    host.busy = false;
    await choose(adapter, 1);
    assert.equal(host.source.chat[0].mes, call);
    assert.equal(host.source.chat[1].extra.xiaobaiOsDice.checks.length, 1);
    assert.equal(host.requests.length, 1);
    assert.equal(adapter.canRetryRequest(1), false);
});

test('a saved-result retry waits for pending native cleanup and cannot start a duplicate', async t => {
    const adapter = setup(t);
    await begin(); await host.intercept('normal');
    const target = message(call); host.source.chat.push(target);
    host.reply = async () => {};
    await received(); await settled(adapter);
    const saved = structuredClone(target.extra.xiaobaiOsDice);
    host.saving(true);
    const retry = choose(adapter, 1);
    await setImmediate();
    assert.equal(adapter.view().phase.kind, 'settling');
    await assert.rejects(choose(adapter, 1));
    assert.equal(host.requests.length, 1);
    host.saving(false); await retry;
    assert.equal(host.requests.length, 2);
    assert.deepEqual(target.extra.xiaobaiOsDice, saved);
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
        assert.equal(host.requests.length, 1);
        assert.equal(saved.checks.length, 1);
        assert.equal(adapter.view().phase.error, '', 'native stream failures are not repeated in Dice feedback');
        if (partial) {
            assert.equal(target.mes, 'Attempt.\n\n[dice:generated-0]\n\n' + call, 'partial output is never rolled back');
            assert.equal(adapter.view().phase.kind, 'invalid');
            await assert.rejects(choose(adapter, 1));
            assert.equal(host.requests.length, 1);
        } else {
            assert.equal(adapter.view().phase.kind, 'continue-error');
            host.reply = normalReply;
            await choose(adapter, 1);
            assert.equal(host.requests.length, 2);
            assert.equal(target.mes, 'Attempt.\n\n[dice:generated-0]\n\nAfterward.');
            assert.equal(adapter.view(), null);
        }
        assert.deepEqual(target.extra.xiaobaiOsDice, saved);
    });
}

for (const group of [false, true]) {
    test(`failed optional check preparation leaves ${group ? 'group' : 'single'} replies running without rolling`, async t => {
        const adapter = setup(t, group);
        if (group) host.group(true);
        host.preflight = async () => { throw new Error('internal setup details'); };
        await begin('normal', { signal: new AbortController().signal });
        assert.equal(await host.intercept('normal'), false);
        assert.equal(host.prompts.size, 0);
        const target = message(call);
        host.source.chat.push(target);
        await received();
        if (group) await host.emit('GROUP_MEMBER_DRAFTED');
        await settled(adapter);
        assert.equal(host.requests.length, 0, 'no Dice follow-up is dispatched');
        assert.equal(target.mes, call);
        assert.equal(adapter.view().phase.kind, 'invalid');
        assert.ok(adapter.view().phase.error);
        assert.equal(adapter.view().phase.error.includes('internal setup details'), false);
    });
}

test('host rejection keeps silent same-roll recovery while Dice preparation failure stays local', async t => {
    const adapter = setup(t);
    const normalReply = host.reply;
    await begin(); await host.intercept('normal');
    const target = message(call); host.source.chat.push(target);
    host.reply = async () => { throw new Error('provider error already shown by host'); };
    await received(); await settled(adapter);
    const saved = structuredClone(target.extra.xiaobaiOsDice);
    assert.equal(adapter.view().phase.kind, 'continue-error');
    assert.equal(adapter.view().phase.error, '');
    host.preflight = async () => { throw new Error('private implementation failure'); };
    await choose(adapter, 1);
    assert.equal(adapter.view().phase.kind, 'continue-error');
    assert.ok(adapter.view().phase.error);
    assert.equal(adapter.view().phase.error.includes('private implementation failure'), false);
    assert.equal(host.requests.length, 1, 'Dice preparation failure must not call the provider without the saved result');
    host.preflight = async () => {}; host.reply = normalReply;
    await choose(adapter, 1);
    assert.equal(host.requests.length, 2);
    assert.deepEqual(target.extra.xiaobaiOsDice, saved);
    assert.equal(adapter.view(), null);
});

test('an open native message editor blocks both new checks and same-roll continuation', async t => {
    const adapter = setup(t, false, async () => { host.editing = true; });
    await begin(); await host.intercept('normal');
    const target = message(call); host.source.chat.push(target);
    host.editing = true;
    await received(); await settled(adapter);
    assert.equal(host.requests.length, 0);
    assert.equal(target.mes, call);

    host.editing = false;
    await begin(); await host.intercept('normal');
    await received(); await settled(adapter);
    assert.equal(host.requests.length, 0, 'Dice cannot continue into a message editor');
    const saved = structuredClone(target.extra.xiaobaiOsDice);
    host.editing = false;
    await choose(adapter, 1);
    assert.equal(host.requests.length, 1);
    assert.deepEqual(target.extra.xiaobaiOsDice, saved);
});
