import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { mergeAbortSignals } from '../../../../shared/common/abort-utils.js';
import { createSettlementService } from '../runtime/service.js';
import { createSaveQueue } from '../runtime/persistence.js';
import { migrateHistoryV2 } from '../runtime/history-format.js';
import { clone, equal } from '../engine/data.js';
import { readVariables, writeVariables, variableRoots } from '../runtime/variables.js';
import { reject, diagnostic } from '../engine/diagnostics.js';
import { recordResult, isOpeningReceipt } from '../runtime/history.js';
import { digest } from '../definition/digest.js';
import { modelSource } from '../definition/stages.js';
import { beforeReceipt, beforeOutcome, beforeFloorOutcome } from '../runtime/before-result.js';
import { compileDefinition } from '../definition/compile.js';
import { decodeBundle } from '../definition/card-files.js';
import { equipmentExample } from '../definition/example.js';
import { CHAT_KEY, CARD_EXTENSION } from '../definition/format.js';
import type { State3Api } from '../runtime/api.js';
import type { Context, ChatMessage, createHostAdapter } from '../runtime/host.js';
import { accepted } from './fixture.js';
import { runFunctionInVm } from '../engine/functions-vm.js';
import type { Bundle, History } from '../types.js';
import { activeTools, TOOL_CALL_LIMIT } from '../extensions/definition.js';
import { createRuleRefresh } from '../definition/refresh.js';
import type { FloorResult } from '../ui/result-dialog.js';
import { resultStage } from '../ui/result.js';

const source = (file: string) => ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText.replace(/^import .*;\r?\n/gm, '').replace(/^export \{[^\n]*\n/gm, '').replace(/^export /gm, '').replaceAll('import.meta.url', "'host-test'");

function harness() {
    const message: ChatMessage = { mes: 'old', swipe_id: 0, swipes: ['old'], swipe_info: [{ extra: {} }], extra: {} };
    let saves = 0;
    const ctx = { chat: [message], chatMetadata: { variables: { neighbor: 'keep' } }, chatId: 'test', characterId: 0,
        characters: [{ name: 'test', chat: 'test', avatar: 'test.png', data: { extensions: { [CARD_EXTENSION]: JSON.stringify(equipmentExample()) } } }], saveChat: async () => { saves++; } } as unknown as Context;
    const env = { getContext: () => ctx, getRequestHeaders: () => ({}), saveChat: () => ctx.saveChat(), CHAT_KEY, clone, equal, reject,
        createSaveQueue, migrateHistoryV2, readVariables, writeVariables, variableRoots, CARD_EXTENSION, decodeBundle, digest, isOpeningReceipt,
        fetch: async (_url?: string, _options?: RequestInit) => ({ ok: true, json: async () => [{ chat_metadata: clone(ctx.chatMetadata) }] }),
    };
    const exports = runInNewContext(source('runtime/host.ts') + '\n({createHostAdapter,inGroup,latestUserIndex})', env) as {
        createHostAdapter(): ReturnType<typeof createHostAdapter>; inGroup(ctx: Context): boolean; latestUserIndex(chat: ChatMessage[], end?: number): number;
    };
    return { ctx, message, exports, io: env, saves: () => saves };
}

function runtimeHarness(bundle: Bundle | null = equipmentExample(), initialMode = '3.0', ready: (chatId: string, signal: AbortSignal) => Promise<boolean> = async () => true, realBefore = false, authorize: () => Promise<void> = async () => {}) {
    const h = harness(), pending = new Set<Promise<unknown>>(), handlers = new Map<string, (...args: unknown[]) => unknown>();
    const listeners = new Map<string, ((...args: unknown[]) => unknown)[]>();
    const createModuleEvents = () => ({
        on(key: string, fn: (...args: unknown[]) => unknown) {
            if (!realBefore) {handlers.set(key, fn); return;}
            const registered = listeners.get(key) ?? []; registered.push(fn); listeners.set(key, registered);
            handlers.set(key, async (...args) => { for (const listener of registered) {await listener(...args);} });
        },
        cleanup() { handlers.clear(); listeners.clear(); },
    });
    if (bundle) {h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(bundle);}
    else {delete h.ctx.characters[0].data!.extensions![CARD_EXTENSION];}
    const selector = { value: initialMode };
    const preferences = { LittleWhiteBox: { variablesMode: initialMode, state3Updater: { auto: false, source: 'main' } } };
    const settings = runInNewContext(source('runtime/settings.ts') + '\n({readSettings,saveSettings,state3Selected,selectState3})', {
        extension_settings: preferences, reject, saveSettingsDebounced() {}, structuredClone,
        document: { getElementById: () => selector },
    });
    let finish!: (value: unknown) => void, fail!: (error: Error) => void, requested!: () => void, disposed = false, lateControls = 0, lateMacros = 0, controls = false, requests = 0;
    let rendered: { index: number; results: FloorResult[] } | undefined;
    const started = new Promise<void>(resolve => { requested = resolve; });
    const response = new Promise((resolve, reject) => { finish = resolve; fail = reject; });
    const agentWindow = { xiaobaixAgent: { openSession: async () => ({ chat: async () => { requests++; requested(); return response; }, dispose() {} }) } };
    const { createState3Updater } = runInNewContext(source('model/updater.ts') + '\n({createState3Updater})', {
        getContext: () => h.ctx, exposeVariableReads: () => () => {}, captureContext: async () => ({}), passageText: (text: string) => text,
        compileDefinition, buildUpdateTask: () => ({}), SUBMIT_TOOL: 'write', ...settings, reject, diagnostic, activeTools, TOOL_CALL_LIMIT,
        digest, modelSource, beforeReceipt, beforeOutcome, beforeFloorOutcome, mergeAbortSignals, latestUserIndex: h.exports.latestUserIndex,
        AbortController, structuredClone, window: agentWindow, correctionTask() { throw new Error('unexpected correction'); }, handoffReceipt: () => undefined,
    });
    const event_types = Object.fromEntries(['CHAT_CHANGED', 'MESSAGE_DELETED', 'MESSAGE_SWIPED', 'MESSAGE_EDITED', 'SETTINGS_UPDATED',
        'CHARACTER_MESSAGE_RENDERED', 'GENERATION_STARTED', 'GENERATION_AFTER_COMMANDS', 'GENERATION_STOPPED', 'MESSAGE_SENT', 'MESSAGE_RECEIVED', 'GENERATION_ENDED', 'CHAT_CREATED'].map(key => [key, key]));
    const emitted: { state: unknown }[] = [], resumed: number[] = [], macroVersions: string[] = [];
    let remoteCard = structuredClone(h.ctx.characters[0]);
    let interceptor: ((chat: unknown, size: number, abort: (immediately: boolean) => void, type: string, dispatch: { input: { deferred: boolean; rebuild: boolean } }) => Promise<void>) | undefined;
    const beforeHost = {
        ...settings, createModuleEvents, event_types, ...h.exports, getContext: () => h.ctx,
        CHAT_KEY, digest, diagnostic, reject, beforeReceipt, beforeFloorOutcome, AbortController,
        isGenerating: () => false, setExtensionPrompt() {}, extension_prompt_types: { IN_CHAT: 1 }, extension_prompt_roles: { SYSTEM: 0 },
        Generate: async () => { resumed.push(h.ctx.chat.length - 1); },
        registerGenerateInterceptor(_id: string, handler: NonNullable<typeof interceptor>) {interceptor = handler;}, unregisterGenerateInterceptor() {interceptor = undefined;}, GENERATE_INTERCEPTOR_ORDER: { VARIABLES: 0 },
        document: { getElementById: () => ({ value: '' }) },
    };
    const realBeforeGeneration = realBefore ? runInNewContext(source('runtime/before-generation.ts') + '\ncreateBeforeGeneration', beforeHost) : undefined;
    const env = {
        authorizeExtensions: authorize, assertExtensionTrust: async () => {}, revokeExtensionTrust() {}, extensionTrust: () => 'unused',
        ...settings, createModuleEvents, event_types,
        observeBackgroundTask(p: Promise<unknown>) { pending.add(p); p.then(() => pending.delete(p), () => pending.delete(p)); },
        isGenerating: () => false, waitForAfterAiReady: ready, createSettlementService,
        ...h.exports, getContext: () => h.ctx, compileDefinition, diagnostic, reject, recordResult, isOpeningReceipt, CHAT_KEY, CARD_EXTENSION, digest,
        exportRules() {}, prepareRuleImport() {}, importRules() {}, onRulesSaved: () => () => {},
        createRuleRefresh, currentCard: () => h.ctx.characters[h.ctx.characterId], readCharacter: async () => structuredClone(remoteCard),
        createState3Macros: () => ({ clear() {macroVersions.length = 0;}, set(compiled: ReturnType<typeof compileDefinition>) { macroVersions.push(digest(compiled.bundle)); if (disposed) {lateMacros++;} }, dispose() {} }),
        createState3Updater,
        createBeforeGeneration: realBeforeGeneration ?? (({ updater }: { updater: ReturnType<typeof createState3Updater> }) => ({
            status: updater.status, cancel: updater.cancel, changed: updater.cancel, dispose: updater.cancel,
            async resume(index: number) { resumed.push(index); },
        })),
        createState3Page: () => ({ mountControl(index: number, results: FloorResult[]) { rendered = { index, results }; controls = true; if (disposed) {lateControls++;} }, targetChanged() {}, dispose() { disposed = true; } }),
        notifyError(error: Error) { throw error; }, openDraft() {}, saveDraft() {}, checkDraft() {}, saveCardDraft() {},
        AbortController, structuredClone, mergeAbortSignals, CustomEvent: class { constructor(public type: string, public options: { detail: { state: unknown } }) {} },
        MutationObserver: class { observe() {} disconnect() {} },
        document: { getElementById: () => ({ querySelector: () => ({}) }), querySelectorAll: () => controls ? [{ remove() { controls = false; } }] : [], dispatchEvent(event: { options: { detail: { state: unknown } } }) { emitted.push(event.options.detail); } },
        window: {} as { LWB_StateV3: State3Api },
    };
    const runtime = runInNewContext(source('index.ts') + '\ninitState3(); ({cleanupState3})', env);
    return { ...h, api: env.window.LWB_StateV3, handlers, preferences, selector, started, finish, fail, emitted, resumed, macroVersions,
        setRemote(card: typeof remoteCard) {remoteCard = structuredClone(card);},
        cleanup: () => runtime.cleanupState3(), late: () => ({ controls: lateControls, macros: lateMacros }), controls: () => controls, rendered: () => rendered, requests: () => requests,
        async prepare(type = 'normal') {
            let aborted = false;
            await interceptor?.([], 0, () => {aborted = true;}, type, { input: { deferred: false, rebuild: false } });
            return { aborted };
        },
        async drain() { while (pending.size) {await Promise.all([...pending]);} },
    };
}

// O4: external refresh replaces only rules, updates macros before resolving,
// preserves progress and makes pending old-rule work stale (silent state loss).
test('O4: external refresh updates rules/macros, preserves progress, rejects old stages and surfaces malformed rules', async t => {
    const h = runtimeHarness(); t.after(() => h.cleanup()); await h.drain();
    accepted(await h.api.enable());
    const before = structuredClone(h.ctx.chatMetadata), stage = await h.api.stage();
    const next = equipmentExample();
    next.definition.rules.find(rule => rule.id === 'base-health')!.value = { literal: 30 };
    const remote = structuredClone(h.ctx.characters[0]); remote.data!.extensions![CARD_EXTENSION] = JSON.stringify(next);
    remote.name = 'unrelated remote name'; h.setRemote(remote);
    assert.equal((await h.api.refreshRules({ avatar: 'test.png' })).changed, true);
    assert.deepEqual(h.ctx.chatMetadata, before);
    assert.equal(h.ctx.characters[0].name, 'test');
    assert.deepEqual(h.macroVersions, [digest(next)]);
    await assert.rejects(stage.run([], { preview: false }), { code: 'stale-target' });
    const result = accepted(await h.api.apply([{ action: 'unequip', params: {} }]));
    assert.equal((result.state as { hero: { health: number } }).hero.health, 30);
    assert.equal((await h.api.refreshRules({ avatar: 'test.png' })).changed, false);
    remote.data!.extensions![CARD_EXTENSION] = '{broken'; h.setRemote(remote);
    const progress = structuredClone(h.ctx.chatMetadata);
    await assert.rejects(h.api.refreshRules({ avatar: 'test.png' }));
    assert.deepEqual(h.ctx.chatMetadata, progress);
    assert.deepEqual(h.macroVersions, []);
    assert.equal(h.ctx.characters[0].data!.extensions![CARD_EXTENSION], '{broken');
});

// A1: completion signals may arrive in any order, but one reply must start only
// one update request, including after request failure (lost state / API cost).
test('A1: late reply notifications recover automatic updates without duplicate requests', async t => {
    for (const first of ['MESSAGE_RECEIVED', 'CHARACTER_MESSAGE_RENDERED']) {
        const h = runtimeHarness(); t.after(() => h.cleanup()); await h.drain();
        accepted(await h.api.enable()); h.preferences.LittleWhiteBox.state3Updater.auto = true;
        await h.handlers.get('GENERATION_STARTED')!('normal', {}, false);
        await h.handlers.get('GENERATION_ENDED')!(); await h.drain();
        assert.equal(h.requests(), 0);
        h.ctx.chat.push({ mes: 'New reply.', extra: {} });
        const index = h.ctx.chat.length - 1;
        await h.handlers.get(first)!(index);
        // Late events must not buy another request after either success or failure.
        await new Promise(resolve => setImmediate(resolve));
        assert.equal(h.requests(), 1);
        if (first === 'MESSAGE_RECEIVED') {h.finish({ completion: 'complete', truncated: false, text: '', toolCalls: [{ name: 'write', arguments: '{"state":[{"op":"inc","path":["hero","health"],"delta":-1}]}' }] });}
        else {h.fail(new Error('offline'));}
        await h.drain(); assert.equal(h.requests(), 1);
        assert.equal((accepted(await h.api.inspect()).state as { hero: { health: number } }).hero.health, first === 'MESSAGE_RECEIVED' ? 79 : 80);
        for (const event of ['MESSAGE_RECEIVED', 'CHARACTER_MESSAGE_RENDERED', 'GENERATION_ENDED']) {await h.handlers.get(event)!(index);}
        await h.drain(); assert.equal(h.requests(), 1);
    }
});

// A1 also covers replacing/reusing a floor: a legitimate new generation gets one
// request, while replaying its completion notifications never buys another.
test('A1: regeneration, continuation and new swipes each retain their own automatic update', async t => {
    const h = runtimeHarness(); t.after(() => h.cleanup()); await h.drain(); accepted(await h.api.enable());
    h.preferences.LittleWhiteBox.state3Updater.auto = true;
    h.finish({ completion: 'complete', truncated: false, text: '', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] });
    for (const [count, type] of ['normal', 'continue', 'regenerate', 'swipe'].entries()) {
        if (type === 'swipe') {await h.handlers.get('MESSAGE_SWIPED')!(h.ctx.chat.length - 1); await h.drain();}
        await h.handlers.get('GENERATION_STARTED')!(type, {}, false);
        if (type === 'regenerate') {h.ctx.chat.pop(); await h.handlers.get('MESSAGE_DELETED')!(); await h.drain();}
        if (type === 'normal' || type === 'regenerate') {h.ctx.chat.push({ mes: 'Reply.', extra: {} });}
        const index = h.ctx.chat.length - 1;
        if (type === 'continue') {h.ctx.chat[index].mes += ' Continued.';}
        if (type === 'swipe') {h.ctx.chat[index] = { mes: 'New swipe.', extra: {}, swipe_id: 0 };}
        for (const event of ['MESSAGE_RECEIVED', 'GENERATION_ENDED', 'CHARACTER_MESSAGE_RENDERED']) {await h.handlers.get(event)!(index);}
        await h.drain(); assert.equal(h.requests(), count + 1, type);
        for (const event of ['MESSAGE_RECEIVED', 'GENERATION_ENDED', 'CHARACTER_MESSAGE_RENDERED']) {await h.handlers.get(event)!(index);}
        await h.drain(); assert.equal(h.requests(), count + 1, type);
    }
});

// Generate(regenerate) does not wait for an extension's in-flight save: STARTED,
// AFTER_COMMANDS, native suffix deletion, MESSAGE_DELETED, then reply notifications.
// The real before owner cancels the old updater but persistence may still own it.
// A replacement reply must receive one settlement, not lose its turn to commit-busy.
test('regeneration waits for a cancelled updater still saving the previous reply', async t => {
    for (const boundary of ['saved', 'save-failed', 'chat', 'generation', 'edit', 'cancel', 'dispose']) {
        await t.test(boundary, async t => {
            const h = runtimeHarness(equipmentExample(), '3.0', async () => true, true);
            t.after(() => h.cleanup()); await h.drain(); accepted(await h.api.enable());
            h.message.is_user = true;
            h.ctx.chat.push({ mes: 'Old reply.', extra: {} });
            h.finish({ completion: 'complete', truncated: false, text: '', toolCalls: [{ name: 'write', arguments: '{"state":[{"op":"inc","path":["hero","health"],"delta":-1}]}' }] });
            let saving!: () => void, release!: () => void, saves = 0;
            const started = new Promise<void>(resolve => { saving = resolve; });
            const gate = new Promise<void>(resolve => { release = resolve; });
            t.after(() => release());
            h.ctx.saveChat = async () => {
                const first = saves++ === 0; saving(); await gate;
                if (first && boundary === 'save-failed') {throw new Error('save unavailable');}
            };
            const previous = h.api.update(); await started;
            assert.equal(h.requests(), 1);
            assert.equal((accepted(await h.api.inspect()).state as { hero: { health: number } }).hero.health, 79);
            h.preferences.LittleWhiteBox.state3Updater.auto = true;
            await h.handlers.get('GENERATION_STARTED')!('regenerate', {}, false);
            await h.handlers.get('GENERATION_AFTER_COMMANDS')!('regenerate', {}, false);
            h.ctx.chat.pop(); await h.handlers.get('MESSAGE_DELETED')!(h.ctx.chat.length);
            assert.equal((accepted(await h.api.inspect()).state as { hero: { health: number } }).hero.health, 80);
            h.ctx.chat.push({ mes: 'Replacement reply.', extra: {} });
            for (const event of ['MESSAGE_RECEIVED', 'CHARACTER_MESSAGE_RENDERED', 'GENERATION_ENDED']) {await h.handlers.get(event)!(1);}
            // Do not drain selection persistence before the generation completes.
            await new Promise(resolve => setImmediate(resolve));
            assert.equal(h.requests(), 1);
            if (boundary === 'chat') {
                h.ctx.chatId = 'other'; h.ctx.chat = [{ mes: 'Another chat.', extra: {} }];
                h.ctx.chatMetadata = clone(h.ctx.chatMetadata); await h.handlers.get('CHAT_CHANGED')!();
            }
            if (boundary === 'generation') {await h.handlers.get('GENERATION_STARTED')!('normal', {}, false);}
            if (boundary === 'edit') {await h.handlers.get('MESSAGE_EDITED')!(1);}
            if (boundary === 'cancel') {h.api.cancel();}
            if (boundary === 'dispose') {h.cleanup();}
            release(); await previous; await h.drain();
            if (!['saved', 'save-failed'].includes(boundary)) {
                assert.equal(h.requests(), 1);
                assert.equal(accepted(await h.api.inspect()).receipt, undefined);
                assert.deepEqual(h.late(), { controls: 0, macros: 0 });
                return;
            }
            assert.equal(h.requests(), 2);
            const result = accepted(await h.api.inspect());
            assert.equal((result.state as { hero: { health: number } }).hero.health, 79);
            assert.equal(result.receipt?.source, modelSource('after'));
            for (const event of ['MESSAGE_RECEIVED', 'CHARACTER_MESSAGE_RENDERED', 'GENERATION_ENDED']) {await h.handlers.get(event)!(1);}
            await h.drain(); assert.equal(h.requests(), 2);
        });
    }
});

// A2: delayed readiness coalesces signals and cancellation discards the waiting
// turn; it must not update another chat or a restored swipe (wrong state / cost).
test('A2: waiting completion coalesces signals and cannot survive chat or generation changes', async t => {
    for (const boundary of ['ready', 'chat', 'generation', 'edit', 'dispose']) {
        let release!: (ready: boolean) => void, waits = 0;
        const h = runtimeHarness(equipmentExample(), '3.0', () => { waits++; return new Promise(resolve => { release = resolve; }); });
        t.after(() => h.cleanup()); await h.drain(); accepted(await h.api.enable());
        h.preferences.LittleWhiteBox.state3Updater.auto = true;
        await h.handlers.get('GENERATION_STARTED')!('normal', {}, false);
        h.ctx.chat.push({ mes: 'New reply.', extra: {} }); const index = h.ctx.chat.length - 1;
        for (let repeat = 0; repeat < 3; repeat++) {
            for (const event of ['MESSAGE_RECEIVED', 'CHARACTER_MESSAGE_RENDERED', 'GENERATION_ENDED']) {await h.handlers.get(event)!(index);}
        }
        assert.equal(waits, 1); assert.equal(h.requests(), 0);
        if (boundary === 'chat') {h.ctx.chatId = 'other'; await h.handlers.get('CHAT_CHANGED')!();}
        if (boundary === 'generation') {await h.handlers.get('GENERATION_STARTED')!('continue', {}, false);}
        if (boundary === 'edit') {await h.handlers.get('MESSAGE_EDITED')!(index);}
        if (boundary === 'dispose') {h.cleanup();}
        release(true);
        h.finish({ completion: 'complete', truncated: false, text: '', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] });
        await h.drain(); assert.equal(h.requests(), boundary === 'ready' ? 1 : 0);
    }
});

// R9: selecting 3.0 does not enroll ordinary cards. Opening/rendering/generating
// must neither fail nor request updates; missing rules on an enabled chat still fail
// visibly without touching its progress (broken chat / unexpected API cost / hidden data loss).
test('R9: ordinary cards stay inactive; explicit enable reports missing rules and enabled rule loss remains an error', async t => {
    const h = runtimeHarness(null); t.after(() => h.cleanup()); await h.drain();
    const ordinary = clone(h.ctx.chatMetadata);
    h.preferences.LittleWhiteBox.state3Updater.auto = true;
    for (let repeat = 0; repeat < 2; repeat++) {
        for (const event of ['CHAT_CHANGED', 'CHARACTER_MESSAGE_RENDERED', 'MESSAGE_EDITED', 'CHAT_CREATED']) {await h.handlers.get(event)!(0);}
        await h.handlers.get('GENERATION_STARTED')!('normal', {}, false);
        h.ctx.chat.push({ mes: 'Ordinary reply.', extra: {} });
        await h.handlers.get('MESSAGE_RECEIVED')!(h.ctx.chat.length - 1);
        await h.handlers.get('GENERATION_ENDED')!(); await h.drain();
        assert.equal(h.controls(), false); assert.equal(h.requests(), 0);
        assert.deepEqual(h.ctx.chatMetadata, ordinary);
    }
    const missing = await h.api.enable();
    assert.equal(missing.ok, false);
    assert.equal(missing.diagnostics[0].code, 'definition-missing');
    assert.equal(h.controls(), false); assert.deepEqual(h.ctx.chatMetadata, ordinary);

    const extensions = h.ctx.characters[0].data!.extensions!, rules = JSON.stringify(equipmentExample());
    extensions[CARD_EXTENSION] = rules;
    accepted(await h.api.enable()); assert.equal(h.controls(), true);
    const progress = clone(h.ctx.chatMetadata);
    delete extensions[CARD_EXTENSION];
    assert.throws(() => h.handlers.get('CHARACTER_MESSAGE_RENDERED')!(0), { code: 'definition-missing' });
    extensions[CARD_EXTENSION] = '{broken';
    assert.throws(() => h.handlers.get('CHARACTER_MESSAGE_RENDERED')!(0));
    assert.deepEqual(h.ctx.chatMetadata, progress);
    extensions[CARD_EXTENSION] = rules;
    await h.handlers.get('CHARACTER_MESSAGE_RENDERED')!(0); assert.equal(h.controls(), true);
    delete extensions[CARD_EXTENSION]; h.ctx.chatId = 'ordinary'; h.ctx.chatMetadata = ordinary;
    await h.handlers.get('CHAT_CHANGED')!(); await h.drain();
    assert.equal(h.controls(), false); assert.equal(h.requests(), 0);
});

// R6/R7: delay worker delivery, not the rule or settlement implementation.
function workerGate() {
    let hold = false, announce!: () => void;
    const started = new Promise<void>(resolve => { announce = resolve; });
    const held: (() => void)[] = [];
    class ControlledWorker {
        onmessage?: (event: { data: { type?: string; value?: unknown; error?: ReturnType<typeof diagnostic> } }) => void;
        stopped = false;
        constructor() { queueMicrotask(() => this.onmessage?.({ data: { type: 'ready' } })); }
        terminate() { this.stopped = true; }
        postMessage(request: Parameters<typeof runFunctionInVm>[0]) {
            const delaying = hold; hold = false;
            void runFunctionInVm(request).then(value => {
                const finish = () => { if (!this.stopped) {this.onmessage?.({ data: { value } });} };
                if (delaying) { held.push(finish); announce(); } else {finish();}
            }).catch(error => this.onmessage?.({ data: { error: diagnostic(error) } }));
        }
    }
    return { Worker: ControlledWorker as unknown as typeof Worker, hold: () => { hold = true; }, started, release: () => held.splice(0).forEach(finish => finish()) };
}

function doorBundle(): Bundle {
    const bundle = equipmentExample();
    bundle.definition = { ...bundle.definition, schema: {}, initial: { key: false, door: false },
        access: ['key', 'door'].map(key => ({ path: [key], direct: true, description: key })),
        rules: [], actions: [], triggers: [], views: {},
        functions: { valid: { reads: [['key'], ['door']], description: '钥匙与门' } },
        constraints: [{ id: 'door-key', description: '开门必须持有钥匙', test: { call: 'valid', args: [] } }] };
    bundle.functions = { valid: '(_, {get}) => !get(["door"]) || get(["key"])' };
    return bundle;
}

// R6: an older recovery must never replace a later successful repair or announce stale state.
// Cost: false failure feedback and stale state sent to other interfaces.
test('R6: late recovery diagnostics cannot overwrite a successful repair', async t => {
    const gate = workerGate(), previousWorker = globalThis.Worker;
    globalThis.Worker = gate.Worker; t.after(() => { globalThis.Worker = previousWorker; });
    const h = runtimeHarness(doorBundle()); await h.drain(); accepted(await h.api.enable());
    accepted(await h.api.apply([{ op: 'set', path: ['key'], value: true }]));
    h.ctx.chat.push({ mes: 'door opens', swipe_id: 0, swipes: ['door opens'], swipe_info: [{ extra: {} }], extra: {} });
    accepted(await h.api.apply([{ op: 'set', path: ['door'], value: true }]));
    gate.hold(); h.message.swipe_id = 1;
    await h.handlers.get('MESSAGE_SWIPED')!(0); await gate.started;
    const repaired = accepted(await h.api.apply([{ op: 'set', path: ['key'], value: true }]));
    const events = h.emitted.length;
    gate.release(); await h.drain();
    assert.equal(h.api.lastResult(), repaired);
    assert.deepEqual(accepted(await h.api.inspect()).state, { key: true, door: true });
    assert.equal(h.emitted.length, events);
    h.cleanup();
});

// R7: disabling the feature stops uncommitted work and all late UI effects, not an already published save.
// Cost: state changes after shutdown, resurrected controls, or loss of a successful result.
test('R7: disposed model updates and staged calls cannot publish or resurrect controls', async t => {
    const h = runtimeHarness(); await h.drain(); accepted(await h.api.enable());
    const before = accepted(await h.api.inspect()).state;
    const updating = h.api.update(); await h.started; h.cleanup();
    h.finish({ completion: 'complete', truncated: false, text: '', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] });
    assert.equal((await updating).ok, false); await h.drain();
    assert.deepEqual(accepted(await h.api.inspect()).state, before);
    assert.deepEqual(h.late(), { controls: 0, macros: 0 });
    const previousWorker = globalThis.Worker; t.after(() => { globalThis.Worker = previousWorker; });
    for (const entry of ['apply', 'stage'] as const) {
        const gate = workerGate(); globalThis.Worker = gate.Worker;
        const active = runtimeHarness(doorBundle()); await active.drain(); accepted(await active.api.enable());
        gate.hold();
        const input = [{ op: 'set', path: ['key'], value: true }];
        const run = entry === 'apply' ? active.api.apply(input) : (await active.api.stage()).run(input, { preview: false, signal: new AbortController().signal });
        await gate.started; active.cleanup();
        assert.equal((await run).ok, false); gate.release(); await active.drain();
        assert.deepEqual(accepted(await active.api.inspect()).state, { key: false, door: false });
        assert.deepEqual(active.late(), { controls: 0, macros: 0 });
    }
});

test('R7: shutdown during persistence leaves the published result saved without late feedback', async () => {
    const h = runtimeHarness(); await h.drain(); accepted(await h.api.enable());
    let started!: () => void, release!: () => void;
    const saving = new Promise<void>(resolve => { started = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
    h.ctx.saveChat = async () => { started(); await gate; };
    const updating = h.api.apply([{ op: 'set', path: ['hero', 'health'], value: 20 }]);
    await saving; h.cleanup(); release();
    const result = accepted(await updating); await h.drain();
    assert.equal(result.saved, true);
    assert.deepEqual(accepted(await h.api.inspect()).state, result.state);
    assert.deepEqual(h.late(), { controls: 0, macros: 0 });
});

// B9: retrying a before-result save may resume only the same current turn.
// Cost: an old chat silently starts a paid generation in a different chat.
test('B9: a late save retry never resumes another chat or replaces its result', async () => {
    for (const switchChat of [false, true]) {
        const bundle = equipmentExample(); bundle.definition.updates = ['before'];
        const h = runtimeHarness(bundle); await h.drain(); accepted(await h.api.enable());
        h.message.is_user = true;
        h.ctx.chat.push({ mes: 'An existing reply.', extra: {} });
        h.ctx.saveChat = async () => { throw new Error('save unavailable'); };
        const result = accepted(await h.api.apply([], { index: 0, source: modelSource('before'), stage: 'before',
            beforeUpdate: { inputDigest: digest(h.message.mes), outcome: 'applied', diagnostics: [] } }));
        assert.equal(result.saved, false);
        // A preview in between must not hide the pending save from lastResult().
        accepted(await h.api.preview([]));
        assert.equal(h.api.lastResult(), result);
        let started!: () => void, release!: () => void;
        const saving = new Promise<void>(resolve => { started = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
        h.ctx.saveChat = async () => { started(); await gate; };
        const retrying = h.api.retrySave(); await saving;
        let current: typeof result | undefined = result;
        if (switchChat) {
            h.ctx.chat = [{ mes: 'another chat', extra: {} }]; h.ctx.chatMetadata = clone(h.ctx.chatMetadata); h.ctx.chatId = 'another';
            await h.handlers.get('CHAT_CHANGED')!(); await h.drain();
            current = h.api.lastResult();
        }
        release(); await retrying; await h.drain();
        assert.deepEqual(h.resumed, switchChat ? [] : [0]);
        if (switchChat) {assert.equal(h.api.lastResult(), current);}
        else {assert.equal(accepted(h.api.lastResult()!).saved, true);}
        h.cleanup();
    }
});

// R8: turning automatic updates off is not a cancel command; selecting 3.0 must agree with the visible mode selector.
// Cost: a silently cancelled request or a UI that controls a different engine from the one displayed.
test('R8: enable synchronizes mode and disabling auto does not cancel an already requested update', async () => {
    const h = runtimeHarness(equipmentExample(), '2.0'); await h.drain(); accepted(await h.api.enable());
    assert.equal(h.selector.value, h.preferences.LittleWhiteBox.variablesMode);
    const updating = h.api.update(); await h.started;
    h.api.saveSettings({ auto: false, source: 'main' });
    h.finish({ completion: 'complete', truncated: false, text: '', toolCalls: [{ name: 'write', arguments: '{"state":[{"op":"set","path":["hero","health"],"value":20}]}' }] });
    const result = accepted(await updating); await h.drain();
    assert.equal(result.committed, true); assert.equal(h.api.settings().auto, false);
    assert.deepEqual(accepted(await h.api.inspect()).state, result.state);
    h.cleanup();
});

test('K11/K7: actual host publishes native values only and rejects stale panel edits', async () => {
    const h = harness(), adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
    accepted(await service.enable());
    const native = h.ctx.chatMetadata.variables as Record<string, unknown>;
    assert.equal(native.neighbor, 'keep');
    assert.equal(Object.hasOwn(h.ctx.chatMetadata[CHAT_KEY]!, 'state'), false);
    const staged = await service.stage();
    native.hero = JSON.stringify({ ...readVariables(native).hero as object, health: 17 });
    await assert.rejects(staged.run([{ op: 'set', path: ['hero', 'health'], value: 12 }], { preview: false }), { code: 'stale-target' });
    assert.equal((accepted(await service.inspect()).state as { hero: { health: number } }).hero.health, 17);
});

test('K14/K13: native silent swipe recovery restores values and controls without replaying updates or notes', async () => {
    const h = harness(), handlers = new Map<string, (...args: unknown[]) => unknown>(), pending = new Set<Promise<unknown>>();
    const observers: { callback(): void; active: boolean }[] = [];
    let controls = 0, updaterCalls = 0, mode = 'auto';
    const event_types = Object.fromEntries(['CHAT_CHANGED', 'MESSAGE_DELETED', 'MESSAGE_SWIPED', 'MESSAGE_EDITED', 'SETTINGS_UPDATED',
        'CHARACTER_MESSAGE_RENDERED', 'GENERATION_STARTED', 'MESSAGE_RECEIVED', 'GENERATION_ENDED', 'CHAT_CREATED'].map(key => [key, key]));
    const env = {
        authorizeExtensions: async () => {}, assertExtensionTrust: async () => {}, revokeExtensionTrust() {}, extensionTrust: () => 'unused',
        createModuleEvents: () => ({ on: (key: string, fn: (...args: unknown[]) => unknown) => handlers.set(key, fn), cleanup: () => handlers.clear() }), event_types,
        observeBackgroundTask(p: Promise<unknown>) { pending.add(p); p.then(() => pending.delete(p), () => pending.delete(p)); },
        isGenerating: () => false, waitForAfterAiReady: async () => true, createSettlementService,
        ...h.exports, getContext: () => h.ctx, compileDefinition, diagnostic, reject, recordResult, CHAT_KEY, CARD_EXTENSION, digest,
        createBeforeGeneration: () => ({ status: () => ({ phase: 'ready', busy: false }), cancel() {}, changed() {}, dispose() {} }),
        exportRules() {}, prepareRuleImport() {}, importRules() {}, onRulesSaved: () => () => {}, state3Selected: () => true, selectState3() {},
        createRuleRefresh, currentCard: () => h.ctx.characters[0], readCharacter: async () => structuredClone(h.ctx.characters[0]),
        readSettings: () => ({ auto: mode === 'auto', source: 'main' }), saveSettings() {},
        createState3Macros: () => ({ clear() {}, set() {}, dispose() {} }),
        createState3Updater: () => ({ cancel() {}, status: () => ({ phase: 'ready', busy: false }), async update() {
            updaterCalls++; return { ok: true, state: {}, changes: [], provenance: [], actions: [], diagnostics: [] };
        } }),
        createState3Page: () => ({ mountControl() { controls = 1; }, targetChanged() {}, dispose() {} }),
        notifyError(error: Error) { throw error; }, openDraft() {}, saveDraft() {}, checkDraft() {}, saveCardDraft() {},
        AbortController, structuredClone, mergeAbortSignals, CustomEvent: class {},
        MutationObserver: class {
            record: { callback(): void; active: boolean };
            constructor(callback: () => void) { this.record = { callback, active: true }; observers.push(this.record); }
            observe() {} disconnect() { this.record.active = false; }
        },
        document: { getElementById: () => ({ querySelector: () => ({}) }), querySelectorAll: () => [], dispatchEvent() {} },
        window: {} as { LWB_StateV3: State3Api },
    };
    runInNewContext(source('index.ts') + '\ninitState3();', env);
    const drain = async () => { while (pending.size) {await Promise.all([...pending]);} };
    const api = env.window.LWB_StateV3;
    await drain(); accepted(await api.enable());
    accepted(await api.apply([{ op: 'set', path: ['hero', 'health'], value: 20, reason: 'live-only' }]));
    const health = async () => (accepted(await api.inspect()).state as { hero: { health: number } }).hero.health;
    for (let attempt = 0; attempt < 2; attempt++) {
        h.message.swipe_id = 1;
        await handlers.get('MESSAGE_SWIPED')!(0); await drain();
        assert.equal(await health(), 80);
        assert.deepEqual(accepted(api.lastResult()!).changes, [{ path: ['hero', 'health'], before: 20, after: 80, removed: false }]);
        await handlers.get('GENERATION_STARTED')!('swipe', {}, false);
        await handlers.get('GENERATION_ENDED')!(); await drain();
        h.message.swipe_id = 0; h.message.extra = clone(h.message.swipe_info![0].extra); controls = 0;
        for (const observer of [...observers]) {if (observer.active) {observer.callback();}}
        await drain();
        assert.equal(await health(), 20); assert.equal(controls, 1); assert.equal(updaterCalls, 0);
        assert.equal(JSON.stringify(api.lastResult()).includes('live-only'), false);
        assert.equal(observers.filter(observer => observer.active).length, 1);
    }
    assert.equal(JSON.stringify(h.ctx.chatMetadata).includes('live-only'), false);
    // R4: prose is not an execution protocol; only automatic independent updates run after generation.
    // Cost: an invisible second writer or a blocked independent update.
    h.message.mes = '<state3>[{"op":"set","path":["hero","health"],"value":1}]</state3>';
    for (mode of ['manual', 'auto']) {
        await handlers.get('GENERATION_STARTED')!('normal', {}, false);
        await handlers.get('MESSAGE_RECEIVED')!(0);
        await handlers.get('GENERATION_ENDED')!(); await drain();
        assert.equal(await health(), 20);
        assert.equal(updaterCalls, mode === 'auto' ? 1 : 0);
    }
});
test('K11/K14: cancelling an old-floor swipe preserves already recorded later-floor effects', async () => {
    const h = harness(), adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
    accepted(await service.enable());
    accepted(await service.apply([{ op: 'set', path: ['hero', 'health'], value: 20 }]));
    h.ctx.chat.push({ mes: 'later', extra: {}, swipe_id: 0, swipes: ['later'], swipe_info: [{ extra: {} }] });
    accepted(await service.apply([{ op: 'set', path: ['hero', 'health'], value: 30 }]));
    h.message.swipe_id = 1;
    let selection = adapter.selectionChange('swipe', 0);
    assert.equal(selection.historical, true);
    await service.restoreSelection(selection.previous, selection.next);
    assert.equal((accepted(await service.inspect()).state as { hero: { health: number } }).hero.health, 30);
    h.message.swipe_id = 0;
    selection = adapter.selectionChange('swipe', 0);
    await service.restoreSelection(selection.previous, selection.next);
    assert.equal((accepted(await service.inspect()).state as { hero: { health: number } }).hero.health, 30);
});

test('K7: only the latest USER and latest AI accept explicit mutations; rejected history stays untouched', async () => {
    const h = harness(), adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
    accepted(await service.enable());
    accepted(await service.apply([{ op: 'set', path: ['hero', 'health'], value: 70 }]));
    for (const [isUser, health] of [[true, 60], [false, 50], [true, 40]] as const) {
        h.ctx.chat.push({ mes: String(health), is_user: isUser, extra: {} });
        accepted(await service.apply([{ op: 'set', path: ['hero', 'health'], value: health }], { index: h.ctx.chat.length - 1 }));
    }
    const metadata = clone(h.ctx.chatMetadata), chat = clone(h.ctx.chat), saves = h.saves();
    for (const index of [0, 1]) {
        await assert.rejects(service.stage({ index }), { code: 'target-missing' });
        await assert.rejects(service.apply([], { index }), { code: 'target-missing' });
        await assert.rejects(service.undo({ index, all: true }), { code: 'target-missing' });
        await assert.rejects(service.rollback({ index }), { code: 'target-missing' });
    }
    assert.deepEqual(h.ctx.chatMetadata, metadata); assert.deepEqual(h.ctx.chat, chat); assert.equal(h.saves(), saves);
    accepted(await service.preview([], { index: 2 }));
    accepted(await service.preview([], { index: 3 }));
    accepted(await service.rollback({ index: 3 }));
    assert.equal((accepted(await service.inspect()).state as { hero: { health: number } }).hero.health, 50);
    accepted(await service.rollback({ index: 2 }));
    assert.equal((accepted(await service.inspect()).state as { hero: { health: number } }).hero.health, 60);
    const staged = await service.stage({ index: 2 }), current = clone(h.ctx.chatMetadata), saved = h.saves();
    h.ctx.chat.push({ mes: 'A newer reply.', extra: {} });
    await assert.rejects(staged.run([], { preview: false }), { code: 'target-missing' });
    assert.deepEqual(h.ctx.chatMetadata, current); assert.equal(h.saves(), saved);
    const movedStage = await service.stage({ index: 4 });
    h.ctx.chat.unshift(h.ctx.chat.pop()!);
    const reordered = clone(h.ctx.chat);
    // The old numeric index now names the latest USER, not the captured AI.
    await assert.rejects(movedStage.run([{ op: 'set', path: ['hero', 'health'], value: 1 }], { preview: false }), { code: 'stale-target' });
    assert.deepEqual(h.ctx.chatMetadata, current); assert.deepEqual(h.ctx.chat, reordered); assert.equal(h.saves(), saved);
});

test('K5: USER rollback invalidates every later swipe receipt so selecting an old AI alternative cannot revive it', async () => {
    const h = harness(); h.message.is_user = true;
    let adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
    accepted(await service.enable());
    const initial = accepted(await service.inspect()).state;
    accepted(await service.apply([{ op: 'set', path: ['hero', 'health'], value: 70 }], { index: 0 }));
    const reply: ChatMessage = { mes: 'wounded', extra: {}, swipe_id: 0, swipes: ['wounded', 'alternate'], swipe_info: [{ extra: {} }, { extra: {} }] };
    h.ctx.chat.push(reply);
    accepted(await service.apply([{ op: 'set', path: ['hero', 'health'], value: 30 }], { index: 1 }));
    reply.swipe_info![1].extra = { ...clone(reply.swipe_info![0].extra), neighbor: 'keep' };
    const result = accepted(await service.rollback({ index: 0 }));
    assert.equal(result.saved, true); assert.deepEqual(result.state, initial);
    for (const message of h.ctx.chat) {
        for (const holder of [message, ...(message.swipe_info || [])]) {assert.equal(holder.extra?.[CHAT_KEY], undefined);}
    }
    assert.equal(reply.swipe_info![1].extra!.neighbor, 'keep');
    reply.swipe_id = 1;
    let change = adapter.selectionChange('swipe', 1);
    await service.restoreSelection(change.previous, change.next);
    assert.deepEqual(accepted(await service.inspect()).state, initial);
    h.ctx.chat = JSON.parse(JSON.stringify(h.ctx.chat)); h.ctx.chatMetadata = JSON.parse(JSON.stringify(h.ctx.chatMetadata));
    adapter = h.exports.createHostAdapter(); service = createSettlementService(adapter);
    h.ctx.chat[1].swipe_id = 0;
    change = adapter.selectionChange('swipe', 1);
    await service.restoreSelection(change.previous, change.next);
    assert.deepEqual(accepted(await service.inspect()).state, initial);

    // Selected suffix is empty; only the unselected AI alternative owns effects.
    accepted(await service.apply([{ op: 'set', path: ['hero', 'health'], value: 20 }], { index: 1 }));
    h.ctx.chat[1].swipe_id = 1;
    change = adapter.selectionChange('swipe', 1);
    await service.restoreSelection(change.previous, change.next);
    assert.ok(adapter.capture(0).records.every(record => record.entries.length === 0));
    assert.equal(adapter.capture(0).lastReceiptIndex, 1);
    const saves = h.saves();
    accepted(await service.rollback({ index: 0 }));
    assert.equal(h.saves(), saves + 1);
    assert.deepEqual(accepted(await service.inspect()).state, initial);
    assert.equal(adapter.capture(0).lastReceiptIndex, -1);
    h.ctx.chat[1].swipe_id = 0;
    change = adapter.selectionChange('swipe', 1);
    await service.restoreSelection(change.previous, change.next);
    assert.deepEqual(accepted(await service.inspect()).state, initial);
});

// R3: a copied reply owns no settlement, including non-selected swipes; moving it and reopening cannot change that.
// Cost: deleting a copy silently undoes the original reply's saved effect.
test('R3: copies lose only inherited receipts, regardless of their position; originals survive save and reopen', async () => {
    const h = harness();
    let adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
    accepted(await service.enable());
    accepted(await service.apply([{ op: 'set', path: ['hero', 'health'], value: 20 }]));
    h.message.swipe_info!.push(clone(h.message.swipe_info![0])); h.message.swipes!.push('alternate');
    adapter.remember();
    h.message.extra!.neighbor = { keep: true };
    const original = clone(h.message), copy = clone(h.message);
    h.ctx.chat.unshift(copy); // A move must not transfer ownership to the first occurrence.
    assert.equal(adapter.rememberOrder(), true);
    assert.deepEqual(h.message, original);
    for (const holder of [copy, ...copy.swipe_info!]) {assert.equal(holder.extra?.[CHAT_KEY], undefined);}
    assert.deepEqual(copy.extra!.neighbor, { keep: true });
    assert.equal(h.saves(), 2, 'topology observation never settles or saves chat variables');
    h.ctx.chat.reverse(); adapter.rememberOrder();
    // SillyTavern reloads into the same array, with fresh messages and metadata.
    h.ctx.chat.splice(0, h.ctx.chat.length, ...clone(h.ctx.chat)); h.ctx.chatMetadata = clone(h.ctx.chatMetadata);
    adapter.remember();
    assert.deepEqual(h.ctx.chat[0].extra?.[CHAT_KEY], original.extra?.[CHAT_KEY]);
    adapter = h.exports.createHostAdapter(); service = createSettlementService(adapter);
    h.ctx.chat.pop();
    const change = adapter.selectionChange('delete');
    assert.equal(change.previous.length, 0);
    await service.restoreSelection(change.previous, change.next);
    assert.equal((accepted(await service.inspect()).state as { hero: { health: number } }).hero.health, 20);
    assert.ok(h.ctx.chat[0].extra?.[CHAT_KEY]);
});

test('K15/K17: current card rules govern the next operation, owned roots do not expand, and typed native values survive', async () => {
    const h = harness();
    const bundle = equipmentExample();
    bundle.definition = { ...bundle.definition, schema: {}, initial: { own: {}, text: '123', flag: false },
        access: [{ path: ['own'], direct: true, description: 'test' }, { path: ['text'], direct: true, description: 'test' }],
        rules: [], actions: [], triggers: [], constraints: [], functions: {}, views: {} };
    const setCard = () => { h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(bundle); };
    setCard();
    const service = createSettlementService(h.exports.createHostAdapter());
    accepted(await service.enable());
    const native = h.ctx.chatMetadata.variables as Record<string, unknown>;
    assert.deepEqual(accepted(await service.inspect()).state, bundle.definition.initial);
    assert.equal(Object.hasOwn(h.ctx.chatMetadata[CHAT_KEY]!, 'bundle'), false);
    native.gold = 75;
    const staged = await service.stage();
    bundle.definition.name = 'new';
    bundle.definition.access.push({ path: ['gold'], direct: true, description: 'test' });
    bundle.definition.schema = { type: 'object', properties: { own: true, text: true, flag: true, gold: true } };
    bundle.definition.rules = [{ id: 'new-rule', kind: 'derive', path: ['own', 'calculated'], value: { literal: 3 }, description: 'test' }];
    setCard();
    await assert.rejects(staged.run([], { preview: false }), { code: 'stale-target' });
    accepted(await service.apply([{ op: 'set', path: ['own', 'gold'], value: 20 }]));
    assert.deepEqual(accepted(await service.inspect()).state, { own: { gold: 20, calculated: 3 }, text: '123', flag: false });
    assert.equal(native.gold, 75);
    await assert.rejects(service.apply([{ op: 'set', path: ['gold'], value: 4 }]), { code: 'unowned-root' });
    assert.equal(native.gold, 75);
    for (const value of ['123', 'true', 'null', '{"x":1}', '[1,2]', '"quoted"', '', 123, true, null, { x: 1 }, [1, 2]]) {
        accepted(await service.apply([{ op: 'set', path: ['text'], value }]));
        h.ctx.chatMetadata = JSON.parse(JSON.stringify(h.ctx.chatMetadata));
        assert.deepEqual((accepted(await service.inspect()).state as Record<string, unknown>).text, value);
    }
    accepted(await service.undo());
    assert.equal(native.gold, 75);
});

test('K16: native historical selections retain child effects, but explicit writes reject the old floor', async () => {
    for (const scenario of [
        { value: { person: { affinity: 10, obsolete: 'old' } }, path: ['own', 'person', 'affinity'], expected: { person: { affinity: 11 } } },
        { value: { '0': { affinity: 10, obsolete: 'old' } }, path: ['own', '0', 'affinity'], expected: { '0': { affinity: 11 } } },
        { value: [{ obsolete: 'old' }, { affinity: 10, obsolete: 'old' }], path: ['own', '1', 'affinity'], expected: [null, { affinity: 11 }] },
    ]) {
        const h = harness(), bundle = equipmentExample();
        bundle.definition = { ...bundle.definition, schema: {}, initial: { own: {} },
            access: [{ path: ['own'], direct: true, description: 'test' }], rules: [], actions: [], constraints: [], views: {} };
        h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(bundle);
        let adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
        accepted(await service.enable());
        accepted(await service.apply([{ op: 'set', path: ['own'], value: scenario.value }], { source: 'model' }));
        h.ctx.chat.push({ mes: 'later', extra: {}, swipe_id: 0, swipes: ['later'], swipe_info: [{ extra: {} }] });
        accepted(await service.apply([{ op: 'set', path: scenario.path, value: 11 }]));
        const original = accepted(await service.inspect()).state;
        for (let repeat = 0; repeat < 3; repeat++) {
            h.message.swipe_id = 1;
            let change = adapter.selectionChange('swipe', 0);
            await service.restoreSelection(change.previous, change.next);
            assert.deepEqual(accepted(await service.inspect()).state, { own: scenario.expected });
            h.message.swipe_id = 0;
            change = adapter.selectionChange('swipe', 0);
            await service.restoreSelection(change.previous, change.next);
            assert.deepEqual(accepted(await service.inspect()).state, original);
        }
        await assert.rejects(service.apply([{ op: 'set', path: ['own'], value: {} }], { index: 0, source: 'model', replace: true }), { code: 'target-missing' });
        await assert.rejects(service.undo({ index: 0, all: true }), { code: 'target-missing' });
        assert.deepEqual(accepted(await service.inspect()).state, original);
        h.ctx.chat = JSON.parse(JSON.stringify(h.ctx.chat));
        h.ctx.chatMetadata = JSON.parse(JSON.stringify(h.ctx.chatMetadata));
        adapter = h.exports.createHostAdapter(); service = createSettlementService(adapter);
        h.ctx.chat.pop();
        const change = adapter.selectionChange('delete');
        await service.restoreSelection(change.previous, change.next);
        assert.deepEqual(accepted(await service.inspect()).state, { own: scenario.value });
        accepted(await service.undo({ index: 0, all: true }));
        assert.deepEqual(accepted(await service.inspect()).state, { own: {} });
    }
});

function greetingBundle(): Bundle {
    const bundle = equipmentExample();
    bundle.definition.openings = [{ hero: { health: 33 } }, { hero: { amulet: false } }, {}];
    return bundle;
}
function selectGreeting(h: ReturnType<typeof harness>, swipeId: number) {
    h.message.swipes = ['same greeting', 'same greeting', 'same greeting', 'same greeting'];
    h.message.swipe_info ??= [];
    while (h.message.swipe_info.length < 4) {h.message.swipe_info.push({ extra: {} });}
    h.message.swipe_id = swipeId;
    h.message.mes = h.message.swipes[swipeId];
    h.message.extra = clone(h.message.swipe_info[swipeId].extra || {});
}
const hero = (result: ReturnType<typeof accepted>) => result.state as { hero: { health: number; amulet: boolean; maxHealth: number } };

test('opening state uses floor0 swipe identity, overlays native common values, and records default starts too', async () => {
    const h = harness(), bundle = greetingBundle();
    h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(bundle);
    (h.ctx.chatMetadata.variables as Record<string, unknown>).hero = JSON.stringify({ health: 75, amulet: true });
    selectGreeting(h, 1);
    const adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
    const enabled = accepted(await service.enable());
    assert.equal(hero(enabled).hero.health, 60);
    assert.equal(hero(enabled).hero.amulet, false);
    assert.equal((h.ctx.chatMetadata.variables as Record<string, unknown>).neighbor, 'keep');
    assert.equal(adapter.capture().records[0].entries.filter(isOpeningReceipt).length, 1);
    for (const [swipeId, health] of [[2, 75], [3, 75], [0, 33], [1, 60], [2, 75]] as const) {
        selectGreeting(h, swipeId);
        const change = adapter.selectionChange('swipe', 0);
        await service.restoreSelection(change.previous, change.next);
        await service.initializeOpening();
        assert.equal(hero(accepted(await service.inspect())).hero.health, health);
        assert.equal(adapter.capture().records[0].entries.filter(isOpeningReceipt).length, 1);
    }
    const saves = h.saves();
    assert.equal(await service.initializeOpening(), undefined);
    assert.equal(h.saves(), saves);
    assert.equal(Object.hasOwn(h.ctx.chatMetadata[CHAT_KEY]!, 'state'), false);
});

test('opening receipts survive ordinary undo, whole-floor replacement, and alternate invalidation', async () => {
    const h = harness(), bundle = greetingBundle();
    h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(bundle);
    selectGreeting(h, 0);
    const adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
    accepted(await service.enable());
    await assert.rejects(service.undo(), { code: 'nothing-to-undo' });
    await assert.rejects(service.apply([], { source: 'opening' }), { code: 'source-reserved' });
    const wound = [{ op: 'inc', path: ['hero', 'health'], delta: -1 }];
    for (let repeat = 0; repeat < 2; repeat++) {
        accepted(await service.apply(wound, { replace: true }));
        assert.equal(hero(accepted(await service.inspect())).hero.health, 32);
    }
    accepted(await service.undo());
    assert.equal(hero(accepted(await service.inspect())).hero.health, 33);
    accepted(await service.apply(wound));
    selectGreeting(h, 1);
    let change = adapter.selectionChange('swipe', 0);
    await service.restoreSelection(change.previous, change.next); accepted((await service.initializeOpening())!);
    accepted(await service.apply(wound));
    accepted(await service.rollback({ index: 0 }));
    assert.equal(hero(accepted(await service.inspect())).hero.health, 60);
    selectGreeting(h, 0); change = adapter.selectionChange('swipe', 0);
    await service.restoreSelection(change.previous, change.next);
    assert.equal(hero(accepted(await service.inspect())).hero.health, 33);
    assert.equal(adapter.capture().records[0].entries.length, 1);
});

test('an empty opening delta still owns its selected greeting and cannot be undone', async () => {
    const h = harness(), bundle = greetingBundle();
    bundle.definition = { ...bundle.definition, initial: { count: 0 }, openings: [{}, { count: 2 }], schema: {},
        access: [{ path: ['count'], direct: true, description: 'count' }], rules: [], actions: [], constraints: [], views: {} };
    h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(bundle);
    selectGreeting(h, 0);
    const adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
    accepted(await service.enable());
    assert.equal(adapter.capture().records[0].entries.length, 1);
    await assert.rejects(service.undo({ all: true }), { code: 'nothing-to-undo' });
    selectGreeting(h, 1);
    let change = adapter.selectionChange('swipe', 0);
    await service.restoreSelection(change.previous, change.next); await service.initializeOpening();
    assert.deepEqual(accepted(await service.inspect()).state, { count: 2 });
    selectGreeting(h, 0); change = adapter.selectionChange('swipe', 0);
    await service.restoreSelection(change.previous, change.next);
    assert.deepEqual(accepted(await service.inspect()).state, { count: 0 });
});

test('empty alternate greetings initialize and restore without model updates even with auto enabled', async t => {
    const bundle = greetingBundle();
    bundle.definition = { ...bundle.definition, initial: { count: 0 }, openings: [{}, {}, { count: 2 }], schema: {},
        access: [{ path: ['count'], direct: true, description: 'count' }], rules: [], actions: [], constraints: [], views: {} };
    const h = runtimeHarness(bundle); t.after(() => h.cleanup()); await h.drain();
    h.preferences.LittleWhiteBox.state3Updater.auto = true;
    const enabled = accepted(await h.api.enable());
    assert.ok(enabled.receipt && isOpeningReceipt(enabled.receipt));
    assert.equal(enabled.receipt.id, accepted(await h.api.inspect()).receipt!.id);
    for (const [swipeId, count] of [[1, 0], [2, 2], [0, 0], [1, 0]] as const) {
        selectGreeting(h, swipeId);
        await h.handlers.get('MESSAGE_SWIPED')!(0);
        await h.handlers.get('CHARACTER_MESSAGE_RENDERED')!(0); await h.drain();
        const inspected = accepted(await h.api.inspect());
        assert.deepEqual(inspected.state, { count });
        assert.ok(inspected.receipt && isOpeningReceipt(inspected.receipt));
        assert.equal(h.requests(), 0);
    }
    h.ctx.chat = JSON.parse(JSON.stringify(h.ctx.chat));
    h.ctx.chatMetadata = JSON.parse(JSON.stringify(h.ctx.chatMetadata));
    await h.handlers.get('CHAT_CHANGED')!(); await h.handlers.get('CHARACTER_MESSAGE_RENDERED')!(0); await h.drain();
    const snapshot = h.exports.createHostAdapter().capture();
    const projected = recordResult(snapshot.state, snapshot.records, 0)!;
    assert.ok(projected.receipt && isOpeningReceipt(projected.receipt));
    assert.deepEqual(projected.changes, []); assert.deepEqual(projected.actions, []);
    assert.equal(h.requests(), 0);
});

test('staged gameplay supersedes opening feedback and never labels subsequent replies as initialization', async t => {
    const h = runtimeHarness(greetingBundle()); t.after(() => h.cleanup()); await h.drain();
    const initialized = accepted(await h.api.enable());
    const staged = await h.api.stage();
    accepted(await staged.run([]));
    assert.equal(h.api.lastResult(), initialized, 'a preview must not replace live opening feedback');
    const committed = accepted(await staged.run([], { preview: false, source: modelSource('after') }));
    await h.handlers.get('SETTINGS_UPDATED')!();
    const currentStage = (index: number) => resultStage(h.rendered()!.results.find(item => item.index === index)?.result, 'after');
    assert.equal(currentStage(0), 'after');
    assert.equal(accepted(h.rendered()!.results.find(item => item.index === 0)!.result).receipt!.id, committed.receipt!.id);
    assert.equal(h.api.lastResult(), undefined, 'superseded feedback must not expose stale save or author actions');
    h.ctx.chat = JSON.parse(JSON.stringify(h.ctx.chat)); h.ctx.chatMetadata = JSON.parse(JSON.stringify(h.ctx.chatMetadata));
    await h.handlers.get('CHAT_CHANGED')!(); await h.drain();
    assert.equal(currentStage(0), 'after');
    for (const index of [2, 4]) {
        h.ctx.chat.push({ mes: 'player', is_user: true, extra: {} }, { mes: 'reply', extra: {} });
        await h.handlers.get('CHARACTER_MESSAGE_RENDERED')!(index); await h.drain();
        assert.equal(h.rendered()!.index, index);
        assert.equal(currentStage(index), 'after');
        accepted(await h.api.apply([], { index, source: modelSource('after') }));
        assert.equal(currentStage(index), 'after');
        assert.equal(h.rendered()!.results.some(item => item.index === index && item.result.ok && item.result.receipt && isOpeningReceipt(item.result.receipt)), false);
    }
});

test('a pending swipe restore keeps its receipt owner when native floor movement changes the index', async t => {
    const h = runtimeHarness(greetingBundle()); t.after(() => h.cleanup()); await h.drain();
    accepted(await h.api.enable());
    const reply: ChatMessage = { mes: 'reply', swipe_id: 0, swipes: ['reply', 'alternate'], swipe_info: [{ extra: {} }, { extra: {} }], extra: {} };
    h.ctx.chat.push(reply);
    accepted(await h.api.apply([], { source: modelSource('after') }));
    reply.swipe_id = 1; reply.mes = 'alternate'; reply.extra = {};
    await h.handlers.get('MESSAGE_SWIPED')!(1); await h.drain();
    accepted(await h.api.apply([], { source: modelSource('after') }));
    let started!: () => void, release!: () => void;
    const saving = new Promise<void>(resolve => { started = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });
    h.ctx.saveChat = async () => { started(); await gate; };
    reply.swipe_id = 0; reply.mes = 'reply'; reply.extra = clone(reply.swipe_info![0].extra!);
    await h.handlers.get('MESSAGE_SWIPED')!(1); await saving;
    h.ctx.chat.splice(0, 2, reply, h.message);
    await h.handlers.get('CHARACTER_MESSAGE_RENDERED')!(0);
    release(); await h.drain();
    h.ctx.chat.splice(0, 2, h.message, reply);
    await h.handlers.get('CHARACTER_MESSAGE_RENDERED')!(1); await h.drain();
    const shown = h.rendered()!.results.find(item => item.index === 1)!;
    assert.equal(resultStage(shown.result, shown.stage), 'after');
    assert.equal(accepted(shown.result).receipt!.source, modelSource('after'));
    assert.equal(accepted(await h.api.inspect()).receipt!.source, modelSource('after'));
});

test('rapid greeting swipes cancel stale pure initialization and preserve reopened progress', async t => {
    const gate = workerGate(), previousWorker = globalThis.Worker;
    globalThis.Worker = gate.Worker; t.after(() => { globalThis.Worker = previousWorker; });
    const bundle = greetingBundle();
    bundle.definition.functions = { starting: { reads: [], description: 'base health' } };
    bundle.functions.starting = '() => 60';
    bundle.definition.rules.find(rule => rule.id === 'base-health')!.value = { call: 'starting', args: [] };
    const h = runtimeHarness(bundle); t.after(() => h.cleanup()); await h.drain();
    selectGreeting(h, 0); accepted(await h.api.enable());
    gate.hold(); selectGreeting(h, 1);
    await h.handlers.get('MESSAGE_SWIPED')!(0); await gate.started;
    assert.throws(() => h.api.apply([]), { code: 'commit-busy' });
    selectGreeting(h, 2); await h.handlers.get('MESSAGE_SWIPED')!(0);
    gate.release(); await h.drain();
    assert.equal(hero(accepted(await h.api.inspect())).hero.health, 80);
    assert.equal(h.message.swipe_info![1].extra?.[CHAT_KEY], undefined);
    accepted(await h.api.apply([{ op: 'set', path: ['hero', 'health'], value: 17 }]));
    h.ctx.chat.splice(0, 1, clone(h.message)); h.ctx.chatMetadata = clone(h.ctx.chatMetadata);
    const progress = clone(h.ctx.chatMetadata), saved = h.saves();
    await h.handlers.get('CHAT_CHANGED')!(); await h.handlers.get('CHARACTER_MESSAGE_RENDERED')!(0); await h.drain();
    assert.deepEqual(h.ctx.chatMetadata, progress); assert.equal(h.saves(), saved);
    assert.equal(hero(accepted(await h.api.inspect())).hero.health, 17);
});

test('swiping during fresh-chat authorization retries the latest opening instead of leaving chat inactive', async t => {
    let announce!: () => void, release!: () => void, calls = 0;
    const started = new Promise<void>(resolve => { announce = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
    const h = runtimeHarness(greetingBundle(), '3.0', async () => true, false, async () => { if (++calls === 1) {announce(); await gate;} });
    t.after(() => {release(); h.cleanup();}); await h.drain(); selectGreeting(h, 0);
    const creating = h.handlers.get('CHAT_CREATED')!(); await started;
    selectGreeting(h, 1); await h.handlers.get('MESSAGE_SWIPED')!(0);
    // The new selection is allowed to initialize while the obsolete authorization still waits.
    await new Promise<void>(resolve => setImmediate(resolve));
    assert.equal(hero(accepted(await h.api.inspect())).hero.health, 60);
    release(); await creating; await h.drain();
    assert.equal(hero(accepted(await h.api.inspect())).hero.health, 60);
    assert.equal(h.message.swipe_info![0].extra?.[CHAT_KEY], undefined);
});

test('first generation waits for pending opening rules before the host can append its player message', async t => {
    const gate = workerGate(), previousWorker = globalThis.Worker;
    globalThis.Worker = gate.Worker; t.after(() => { globalThis.Worker = previousWorker; });
    const bundle = greetingBundle();
    bundle.definition.functions = { identity: { reads: [], description: 'base health' } };
    bundle.functions.identity = '() => 60';
    bundle.definition.rules.find(rule => rule.id === 'base-health')!.value = { call: 'identity', args: [] };
    const h = runtimeHarness(bundle); t.after(() => h.cleanup()); await h.drain(); selectGreeting(h, 0); accepted(await h.api.enable());
    gate.hold(); selectGreeting(h, 1); await h.handlers.get('MESSAGE_SWIPED')!(0); await gate.started;
    let prepared = false;
    const generation = Promise.resolve(h.handlers.get('GENERATION_STARTED')!('normal', {}, false)).then(() => {prepared = true;});
    await new Promise<void>(resolve => setImmediate(resolve));
    assert.equal(prepared, false);
    gate.release(); await generation; await h.drain();
    assert.equal(prepared, true); assert.equal(hero(accepted(await h.api.inspect())).hero.health, 60);
    assert.equal(h.requests(), 0);
});

test('failed opening initialization remains visible and cannot enter generation on the raw common baseline', async t => {
    const bundle = greetingBundle(); bundle.definition.openings![1] = { hero: { health: -10 } }; bundle.definition.updates = ['before', 'after'];
    for (const item of [...bundle.definition.actions, ...bundle.definition.access.filter(entry => entry.direct)]) {item.stages = ['after'];}
    const h = runtimeHarness(bundle, '3.0', async () => true, true); t.after(() => h.cleanup()); await h.drain(); selectGreeting(h, 0); accepted(await h.api.enable());
    selectGreeting(h, 1); await h.handlers.get('MESSAGE_SWIPED')!(0); await h.drain();
    assert.equal(h.api.lastResult()?.ok, false);
    assert.throws(() => h.api.apply([]), { code: 'commit-busy' });
    await assert.rejects(Promise.resolve(h.handlers.get('GENERATION_STARTED')!('normal', {}, false)));
    // SillyTavern catches event errors and still appends USER before invoking interceptors.
    h.ctx.chat.push({ mes: 'player turn', is_user: true });
    assert.deepEqual(await h.prepare(), { aborted: true });
    assert.throws(() => h.api.apply([]), { code: 'commit-busy' });
    const failedState = clone(h.ctx.chatMetadata), failedMessages = clone(h.ctx.chat);
    for (const run of [() => h.api.skipBefore(1), () => h.api.recomputeBefore(1), () => h.api.undoBefore(1)]) {
        await assert.rejects(Promise.resolve(run()), { code: 'commit-busy' });
    }
    assert.deepEqual(h.ctx.chatMetadata, failedState); assert.deepEqual(h.ctx.chat, failedMessages);
    assert.equal(h.api.lastResult()?.ok, false); assert.equal(h.requests(), 0);
    assert.equal(h.message.swipe_info![1].extra?.[CHAT_KEY], undefined);
    // Removing other successful greetings must not turn this failed greeting into a common start.
    for (const holder of h.message.swipe_info!) {delete holder.extra?.[CHAT_KEY];}
    for (const boundary of ['reload', 'mode']) {
        if (boundary === 'reload') {
            h.ctx.chatMetadata = clone(h.ctx.chatMetadata); h.ctx.chat.splice(0, h.ctx.chat.length, ...clone(h.ctx.chat));
            await h.handlers.get('CHAT_CHANGED')!();
        } else {
            for (const mode of ['2.0', '3.0']) {
                h.preferences.LittleWhiteBox.variablesMode = mode; await h.handlers.get('SETTINGS_UPDATED')!();
            }
        }
        await h.drain();
        await h.handlers.get('GENERATION_STARTED')!('normal', {}, false);
        assert.deepEqual(await h.prepare(), { aborted: true });
        assert.throws(() => h.api.apply([]), { code: 'commit-busy' });
    }
});

test('unconfirmed opening saves permit committed play and retry persistence without initializing twice', async t => {
    const h = runtimeHarness(greetingBundle(), '3.0', async () => true, true); t.after(() => h.cleanup()); await h.drain(); selectGreeting(h, 1);
    let saveCalls = 0;
    h.ctx.saveChat = async () => {saveCalls++; throw new Error('offline');};
    const result = accepted(await h.api.enable());
    assert.equal(result.committed, true); assert.equal(result.saved, false);
    const record = clone(h.message.extra![CHAT_KEY]), history = clone(h.ctx.chatMetadata[CHAT_KEY]);
    await h.handlers.get('GENERATION_STARTED')!('normal', {}, false);
    h.ctx.chat.push({ mes: 'player turn', is_user: true });
    assert.deepEqual(await h.prepare(), { aborted: false });
    assert.equal(hero(accepted(await h.api.inspect())).hero.health, 60);
    assert.equal(h.api.lastResult(), result); assert.equal(saveCalls, 1);
    h.ctx.saveChat = async () => {saveCalls++;};
    await h.api.retrySave();
    assert.equal(saveCalls, 2); assert.equal(accepted(h.api.lastResult()!).saved, true);
    assert.deepEqual(h.message.extra![CHAT_KEY], record); assert.deepEqual(h.ctx.chatMetadata[CHAT_KEY], history);
    assert.equal(h.requests(), 0);
});

test('opening-aware first enrollment requires greeting-only chat; failed enrollment blocks after-only dispatch without history', async t => {
    const h = harness(), bundle = greetingBundle();
    h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(bundle);
    h.ctx.chat.push({ mes: 'already started', is_user: true });
    const before = clone(h.ctx.chatMetadata), service = createSettlementService(h.exports.createHostAdapter());
    await assert.rejects(service.enable(), { code: 'opening-start-required' });
    assert.deepEqual(h.ctx.chatMetadata, before); assert.equal(h.saves(), 0);
    const invalid = greetingBundle(); invalid.definition.openings![0] = { hero: { health: -1 } };
    const active = runtimeHarness(invalid, '3.0', async () => true, true); t.after(() => active.cleanup()); await active.drain();
    assert.equal((await active.api.enable()).ok, false);
    assert.equal(active.ctx.chatMetadata[CHAT_KEY], undefined);
    active.ctx.chat.push({ mes: 'player turn', is_user: true });
    assert.deepEqual(await active.prepare(), { aborted: true });
    active.ctx.chatMetadata = clone(active.ctx.chatMetadata); active.ctx.chat.splice(0, active.ctx.chat.length, ...clone(active.ctx.chat));
    await active.handlers.get('CHAT_CHANGED')!(); await active.drain();
    assert.deepEqual(await active.prepare(), { aborted: true });
    assert.equal(active.requests(), 0);
});

// O7: adding opening values to an enabled conversation preserves progress and permits play,
// including a conversation without receipts (cost: a chat that cannot continue).
test('adding openings preserves enabled chats with no receipts or receipts on any floor', async t => {
    for (const receipts of ['none', 'greeting', 'later']) {
        const h = runtimeHarness(equipmentExample(), '3.0', async () => true, true); t.after(() => h.cleanup()); await h.drain();
        accepted(await h.api.enable());
        if (receipts !== 'greeting') {h.ctx.chat.push({ mes: 'previous player turn', is_user: true }, { mes: 'previous reply', extra: {} });}
        if (receipts !== 'none') {accepted(await h.api.apply([{ op: 'set', path: ['hero', 'health'], value: 17 }]));}
        else {h.ctx.chatMetadata.variables = { ...h.ctx.chatMetadata.variables as object, hero: JSON.stringify({ ...hero(accepted(await h.api.inspect())).hero, health: 17 }) };}
        h.ctx.chat.push({ mes: 'player turn', is_user: true });
        h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(greetingBundle());
        const progress = clone(h.ctx.chatMetadata), saves = h.saves();
        await h.handlers.get('CHAT_CHANGED')!(); await h.drain();
        assert.deepEqual(await h.prepare(), { aborted: false });
        assert.equal(hero(accepted(await h.api.inspect())).hero.health, 17);
        assert.deepEqual(h.ctx.chatMetadata, progress); assert.equal(h.saves(), saves);
        accepted(await h.api.apply([{ op: 'inc', path: ['hero', 'health'], delta: -1 }]));
        assert.equal(hero(accepted(await h.api.inspect())).hero.health, 16);
        h.ctx.chatMetadata = clone(h.ctx.chatMetadata); h.ctx.chat.splice(0, h.ctx.chat.length, ...clone(h.ctx.chat));
        await h.handlers.get('CHAT_CHANGED')!(); await h.drain();
        assert.deepEqual(await h.prepare(), { aborted: false });
        assert.equal(hero(accepted(await h.api.inspect())).hero.health, 16);
    }
});

// O7: even a greeting-only common-start chat keeps its progress when opening rules are added.
// Cost: reset progress or a chat that cannot continue.
test('adding openings to an enabled greeting does not initialize it again', async t => {
    for (const health of [33, -10]) {
        const h = runtimeHarness(equipmentExample(), '3.0', async () => true, true); t.after(() => h.cleanup()); await h.drain();
        accepted(await h.api.enable());
        const bundle = equipmentExample(); bundle.definition.openings = [{ hero: { health } }];
        h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(bundle);
        const progress = clone(h.ctx.chatMetadata), saves = h.saves();
        await h.handlers.get('GENERATION_STARTED')!('normal', {}, false);
        assert.deepEqual(h.ctx.chatMetadata, progress); assert.equal(h.saves(), saves);
        h.ctx.chat.push({ mes: 'player turn', is_user: true });
        assert.deepEqual(await h.prepare(), { aborted: false });
        assert.equal(hero(accepted(await h.api.inspect())).hero.health, 80);
    }
});

// O7: loading an existing format-2 save preserves progress and converts only once.
// Fixture: history metadata from the isolated 1.18 reproduction, with no chat text or user data.
test('format-2 chat histories are normalized once at load without saving or recalculating progress', () => {
    const stored = JSON.parse(readFileSync(new URL('./fixtures/history-v2.json', import.meta.url), 'utf8'));
    for (const opening of [false, true]) {
        const h = harness();
        h.ctx.chatMetadata = { variables: { hero: '{"health":80,"amulet":true,"baseHealth":60,"maxHealth":100,"condition":"受伤"}' }, [CHAT_KEY]: clone(stored) };
        if (opening) {h.message.swipe_info!.push({ extra: { [CHAT_KEY]: { entries: [{ id: 'opening', revision: 1, source: 'opening', delta: undefined, actions: [] }] } } });}
        const variables = clone(h.ctx.chatMetadata.variables), records = clone(h.ctx.chat);
        const adapter = h.exports.createHostAdapter(), history = h.ctx.chatMetadata[CHAT_KEY] as History;
        assert.deepEqual(history, { ...stored, format: 3, openingMode: opening ? 'per-swipe' : 'common' });
        adapter.capture(); adapter.remember();
        assert.equal(h.ctx.chatMetadata[CHAT_KEY], history);
        assert.deepEqual(h.ctx.chatMetadata.variables, variables); assert.deepEqual(h.ctx.chat, records); assert.equal(h.saves(), 0);
    }
});

// P3: active host saves finish before a settlement confirms its newer state.
// Cost: an older disk write silently erases confirmed progress.
test('settlement persistence participates in the native save queue', async () => {
    const h = harness(), adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
    accepted(await service.enable());
    let disk = clone(h.ctx.chatMetadata), release!: () => void;
    const old = clone(disk), gate = new Promise<void>(resolve => {release = resolve;});
    const nativeSave = gate.then(() => {disk = old;});
    h.io.saveChat = async () => {disk = clone(h.ctx.chatMetadata);};
    h.ctx.saveChat = async () => {await nativeSave; await h.io.saveChat();};
    h.io.fetch = async () => ({ ok: true, json: async () => [{ chat_metadata: clone(disk) }] });
    let finished = false;
    const pending = service.apply([{ op: 'set', path: ['hero', 'health'], value: 20 }]).then(result => {finished = true; return result;});
    try {
        await new Promise<void>(resolve => setImmediate(resolve));
        assert.equal(finished, false);
    } finally {release();}
    assert.equal(accepted(await pending).saved, true);
    await nativeSave;
    assert.equal((readVariables(disk.variables as Record<string, unknown>).hero as { health: number }).health, 20);
});

test('pending overswipe placeholders cannot initialize or fabricate native greeting holders', async () => {
    const h = harness(); h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(greetingBundle()); selectGreeting(h, 0);
    h.message.swipe_id = h.message.swipes!.length; h.message.extra = {};
    const adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter);
    assert.equal(adapter.capture(0).opening, false);
    await assert.rejects(service.enable(), { code: 'opening-start-required' });
    assert.equal(h.message.swipe_info!.length, 4); assert.equal(h.saves(), 0);
    selectGreeting(h, 0); accepted(await service.enable());
    assert.equal(hero(accepted(await service.inspect())).hero.health, 33);
});

test('opening initialization cannot write after a chat reload, cross-chat switch, or a newly appended player turn', async () => {
    for (const boundary of ['reload', 'chat', 'send']) {
        let announce!: () => void, release!: () => void;
        const started = new Promise<void>(resolve => {announce = resolve;}), gate = new Promise<void>(resolve => {release = resolve;});
        const h = harness(), bundle = greetingBundle();
        h.ctx.characters[0].data!.extensions![CARD_EXTENSION] = JSON.stringify(bundle); selectGreeting(h, 0);
        const adapter = h.exports.createHostAdapter(), service = createSettlementService(adapter, {
            requestAuthorization: async () => {announce(); await gate;}, authorize: async () => {}, context: () => ({}), passage: () => '',
        });
        const pending = service.enable(); await started;
        if (boundary === 'reload') {h.ctx.chatMetadata = clone(h.ctx.chatMetadata); h.ctx.chat.splice(0, 1, clone(h.message));}
        if (boundary === 'chat') {h.ctx.chatId = 'another'; h.ctx.chatMetadata = { variables: { neighbor: 'another' } };}
        if (boundary === 'send') {h.ctx.chat.push({ mes: 'player turn', is_user: true });}
        const untouched = clone(h.ctx.chatMetadata); release();
        await assert.rejects(pending, { code: 'stale-target' });
        assert.deepEqual(h.ctx.chatMetadata, untouched); assert.equal(h.saves(), 0);
    }
});
