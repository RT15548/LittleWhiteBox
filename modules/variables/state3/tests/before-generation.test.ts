import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { fixture, accepted } from './fixture.js';
import { equipmentExample } from '../definition/example.js';
import { compileDefinition } from '../definition/compile.js';
import { digest } from '../definition/digest.js';
import { modelSource } from '../definition/stages.js';
import { beforeReceipt, beforeOutcome, beforeFloorOutcome } from '../runtime/before-result.js';
import { buildUpdateTask, beforeProsePrompt } from '../model/prompts.js';
import { correctionTask } from '../../updater/correction.js';
import { handoffReceipt } from '../../updater/handoff.js';
import { readResponseCompletion } from '../../../agent-core/runtime/response-completion.js';
import { mergeAbortSignals } from '../../../../shared/common/abort-utils.js';
import { diagnostic, reject } from '../engine/diagnostics.js';
import { runFunctionInVm, type FunctionOptions } from '../engine/functions-vm.js';
import { CHAT_KEY } from '../definition/format.js';
import { activeTools, TOOL_CALL_LIMIT } from '../extensions/definition.js';
import type { createBeforeGeneration } from '../runtime/before-generation.js';
import type { createState3Updater } from '../model/updater.js';
import type { ChatMessage } from '../runtime/host.js';
import type { Result } from '../types.js';
import type { AgentChatInput } from '../../../agent-core/public-api.js';

const source = (file: string) => ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '').replaceAll('import.meta.url', "'before-test'");

// The handoff mounts each payload as compact JSON after the tool description's last blank line.
function mounted(task: AgentChatInput, name: string) {
    const description = task.tools!.find(tool => tool.function.name === name)!.function.description!;
    return JSON.parse(description.slice(description.lastIndexOf('\n\n') + 2));
}

async function harness() {
    const f = fixture(), bundle = equipmentExample(); bundle.definition.updates = ['before', 'after'];
    bundle.definition.actions.forEach(action => {action.stages = ['before'];});
    bundle.definition.access.filter(entry => entry.direct).forEach(entry => {entry.stages = ['after'];});
    accepted(await f.service.enable(bundle));
    let chat: ChatMessage[] = [{ mes: 'opening', name: 'Hero' }], generating = false, prompt = '', selected = true, composer = '';
    let interceptor: (...args: unknown[]) => Promise<void>;
    const handlers = new Map<string, Set<(...args: unknown[]) => unknown>>(), pending = new Set<Promise<unknown>>();
    const requests: AgentChatInput[] = [], prose: { state: unknown; prompt: string }[] = [], results: Result[] = [], captures: string[] = [];
    const event_types = Object.fromEntries(['GENERATION_STARTED', 'GENERATION_AFTER_COMMANDS', 'MESSAGE_SENT', 'GENERATION_STOPPED',
        'GENERATION_ENDED', 'CHAT_CHANGED', 'MESSAGE_EDITED', 'MESSAGE_DELETED'].map(key => [key, key]));
    const emit = async (key: string, ...args: unknown[]) => { for (const listener of [...handlers.get(key) || []]) {await listener(...args);} };
    const ctx = () => ({ chat, chatId: 'isolated', chatMetadata: { [CHAT_KEY]: {} } });
    const latestUserIndex = (messages: ChatMessage[], end = messages.length) => {
        for (let index = end - 1; index >= 0; index--) {if (messages[index].is_user) {return index;}} return -1;
    };
    let disposedSessions = 0;
    let answer: () => unknown | Promise<unknown> = () => ({ completion: 'complete', truncated: false, text: '',
        toolCalls: [{ name: 'write', arguments: JSON.stringify({ state: [{ action: 'unequip', params: {} }] }) }] });
    const env = {
        getContext: ctx, latestUserIndex, digest, modelSource, beforeReceipt, beforeOutcome, beforeFloorOutcome, beforeProsePrompt,
        compileDefinition, buildUpdateTask, correctionTask, handoffReceipt, mergeAbortSignals, diagnostic, reject, CHAT_KEY, activeTools, TOOL_CALL_LIMIT,
        AbortController, setTimeout, structuredClone, Promise, isGenerating: () => generating, inGroup: () => false,
        document: { getElementById: () => ({ value: composer }) },
        state3Selected: () => selected, passageText: (text: string) => text, exposeVariableReads: () => () => {},
        readSettings: () => ({ auto: false, source: 'main' }), SUBMIT_TOOL: 'write',
        captureContext: async (_ctx: unknown, target: { message: ChatMessage }) => {
            assert.equal(generating, false); captures.push(target.message.mes!);
            return { messages: [{ role: target.message.is_user ? 'user' : 'assistant', content: target.message.mes }] };
        },
        window: { xiaobaixAgent: { openSession: async () => ({ chat: async (task: AgentChatInput) => {requests.push(task); return answer();}, dispose() {disposedSessions++;} }) } },
        Generate: (type: string) => generate(type),
        setExtensionPrompt: (_id: string, value: string) => {prompt = value;}, extension_prompt_types: { IN_CHAT: 1 }, extension_prompt_roles: { SYSTEM: 0 },
        registerGenerateInterceptor: (_id: string, fn: typeof interceptor) => {interceptor = fn;}, unregisterGenerateInterceptor() {}, GENERATE_INTERCEPTOR_ORDER: { VARIABLES: 350 },
        event_types, createModuleEvents: () => {
            const owned: [string, (...args: unknown[]) => unknown][] = [];
            return { on(key: string, fn: (...args: unknown[]) => unknown) {
                if (!handlers.has(key)) {handlers.set(key, new Set());} handlers.get(key)!.add(fn); owned.push([key, fn]);
            }, cleanup() {owned.forEach(([key, fn]) => handlers.get(key)!.delete(fn));} };
        }, observeBackgroundTask(promise: Promise<unknown>) {pending.add(promise); promise.then(() => pending.delete(promise), () => pending.delete(promise));},
    };
    const updaterFactory = runInNewContext(source('model/updater.ts') + '\ncreateState3Updater', env) as typeof createState3Updater;
    const adapter = { ...f.adapter, submissionBasis: (index: number) => digest({ ...f.saved(), text: chat[index]?.mes, index }) };
    const updater = updaterFactory({ service: f.service as never, adapter: adapter as never, available() {if (generating || !selected) {reject('commit-busy');}} });
    const factory = runInNewContext(source('runtime/before-generation.ts') + '\ncreateBeforeGeneration', env) as typeof createBeforeGeneration;
    const retain = async (promise: Promise<Result>) => {const result = await promise; results.push(result); return result;};
    const create = () => factory({ adapter: f.adapter as never, service: f.service as never, updater, retain, refresh() {}, report: promise => promise });
    let before = create();
    function append(message: ChatMessage) {chat.push(message); const saved = f.saved(); saved.records.push({ entries: [] }); f.load(saved);}
    async function generate(type = 'normal', text?: string, deferred = false, automatic_trigger = false) {
        composer = text || '';
        generating = true;
        await emit(event_types.GENERATION_STARTED, type, {}, false);
        await emit(event_types.GENERATION_AFTER_COMMANDS, type, { automatic_trigger }, false);
        if (text !== undefined) {append({ mes: text, is_user: true, name: 'Player' }); await emit(event_types.MESSAGE_SENT, chat.length - 1);}
        let aborted = false;
        const dispatch = { input: { deferred, rebuild: false } };
        await interceptor([], 2048, () => {aborted = true;}, type, dispatch);
        generating = false;
        if (!aborted && !deferred) {prose.push({ state: f.saved().state, prompt }); await emit(event_types.GENERATION_ENDED);}
        return dispatch;
    }
    return { f, updater, generate, append, requests, prose, captures, results, emit, event_types, disposedSessions: () => disposedSessions,
        before: () => before, chat: () => chat, answer: (next: typeof answer) => {answer = next;},
        failOpen(error: unknown) {env.window.xiaobaixAgent.openSession = async () => {throw error;};},
        async drain() {while (pending.size) {await Promise.all([...pending]);}},
        reopen() {before.dispose(); f.load(f.saved()); chat = structuredClone(chat); before = create();},
        dispose() {selected = false; before.dispose();},
    };
}

function localFailures(count: number) {
    let remaining = count, created = 0, terminated = 0;
    class Worker {
        onmessage?: (event: { data: unknown }) => void;
        stopped = false;
        constructor() { created++; queueMicrotask(() => this.onmessage?.({ data: { type: 'ready' } })); }
        terminate() { this.stopped = true; terminated++; }
        postMessage(request: FunctionOptions) {
            if (remaining-- > 0) {
                queueMicrotask(() => this.onmessage?.({ data: { error: { code: 'function_worker_error', functionId: request.id } } }));
                return;
            }
            void runFunctionInVm(request).then(value => {
                if (!this.stopped) {this.onmessage?.({ data: { value } });}
            }).catch(error => { if (!this.stopped) {this.onmessage?.({ data: { error: diagnostic(error) } });} });
        }
    }
    return { Worker: Worker as unknown as typeof globalThis.Worker, counts: () => ({ created, terminated }) };
}

// An explicit API failure cannot buy a model correction or publish a gameplay
// change, in either phase (duplicate billing / false settlement).
test('provider failures end before/after updates after one request with state unchanged', async t => {
    for (const stage of ['before', 'after'] as const) {
        const h = await harness(); t.after(() => h.dispose());
        h.append({ mes: 'Player action', is_user: true, name: 'Player' });
        if (stage === 'after') {h.append({ mes: 'Completed passage', name: 'Hero' });}
        const start = h.f.saved().state;
        h.answer(() => readResponseCompletion('openai', 'Proxy error (HTTP 400 Bad Request)', false, undefined, 'INVALID_ARGUMENT'));
        const result = await h.updater.update({ stage, index: h.chat().length - 1 });
        assert.equal(result.ok, false);
        assert.equal(result.diagnostics[0].code, 'model-request');
        assert.equal((result.diagnostics[0].cause as { code: string }).code, 'AGENT_PROVIDER_ERROR');
        assert.equal((result.diagnostics[0].cause as { status: number }).status, 400);
        assert.deepEqual(h.f.saved().state, start);
        assert.equal(h.requests.length, 1);
    }
});

// Provider codes are not settlement codes; session setup and network failures
// preserve their cause, publish nothing, dispose ownership, and buy no correction.
test('model boundary classifies arbitrary provider codes and session setup failures', async t => {
    const errors = [
        Object.assign(new Error('Connection error.'), { code: 'AGENT_REQUEST_FAILED' }),
        Object.assign(new Error('Invalid API key'), { code: 'invalid_api_key', status: 401 }),
        Object.assign(new Error('quota exhausted'), { code: 'resource_exhausted', status: 429 }),
        Object.assign(new Error('provider constraint'), { code: 'constraint', status: 503 }),
        new Error('Failed to fetch'),
    ];
    for (const stage of ['before', 'after'] as const) {
        for (const error of errors) {
            const h = await harness(); t.after(() => h.dispose());
            h.append({ mes: 'Player action', is_user: true });
            if (stage === 'after') {h.append({ mes: 'Completed passage' });}
            const start = h.f.saved();
            h.answer(() => {throw error;});
            const result = await h.updater.update({ stage, index: h.chat().length - 1 });
            assert.equal(result.ok, false);
            assert.deepEqual(result.diagnostics[0], { code: 'model-request', cause: diagnostic(error) });
            assert.deepEqual(h.f.saved(), start);
            assert.equal(h.requests.length, 1);
            assert.equal(h.disposedSessions(), 1);
            assert.equal(h.updater.status().busy, false);
        }
        const h = await harness(); t.after(() => h.dispose());
        h.append({ mes: 'Player action', is_user: true });
        if (stage === 'after') {h.append({ mes: 'Completed passage' });}
        const error = Object.assign(new Error('Select a model'), { code: 'AGENT_NOT_CONFIGURED' });
        h.failOpen(error);
        const start = h.f.saved();
        const result = await h.updater.update({ stage, index: h.chat().length - 1 });
        assert.equal(result.ok, false);
        assert.deepEqual(result.diagnostics[0], { code: 'model-request', cause: diagnostic(error) });
        assert.deepEqual(h.f.saved(), start);
        assert.equal(h.requests.length, 0);
        assert.equal(h.disposedSessions(), 0);
        assert.equal(h.updater.status().busy, false);
    }
});

// D9：JSON 解析与提交形状错误必须区分，纠正请求收到原始原因；代价：付费重试仍猜错协议。
test('D9: malformed submissions preserve their cause in the sole correction request', async t => {
    for (const [argument, reason] of [['{broken', 'invalid-json'], ['{"state":{}}', 'invalid-shape']]) {
        const h = await harness(); t.after(() => h.dispose());
        h.append({mes:'Remove the charm.', is_user:true});
        h.answer(() => ({completion:'complete',truncated:false,text:'',toolCalls:[{name:'write',arguments:argument}]}));
        const before = h.f.saved().state;
        const result = await h.updater.update({stage:'before',index:1});
        assert.equal(result.ok,false); assert.equal(result.diagnostics[0].reason,reason);
        assert.equal(h.requests.length,2); assert.deepEqual(h.f.saved().state,before);
        const content=String(h.requests[1].messages.at(-1)!.content);
        const correction=JSON.parse(content.slice(content.indexOf('\n\n')+2));
        assert.equal(correction.errors[0].reason,reason);
        if (reason==='invalid-json') {
            assert.equal(correction.errors[0].arguments,argument);
            assert.equal(correction.errors[0].cause.errorName,'SyntaxError');
            assert.ok(correction.errors[0].cause.message);
        } else {assert.deepEqual(correction.errors[0].actual,{state:{}});}
    }
});
function useFunction(h: Awaited<ReturnType<typeof harness>>) {
    const bundle = h.f.saved().card;
    bundle.definition.functions = { maximum: { reads: [['hero', 'amulet']], description: 'Equipment changes the health maximum.' } };
    bundle.functions = { maximum: '(_, {get}) => get(["hero", "amulet"]) ? 100 : 60' };
    bundle.definition.rules[0].value = { call: 'maximum', args: [] };
    h.f.setCard(bundle);
}

// F7: both paid update phases send per-item facts on the sole correction request;
// failed attempts write nothing, successful corrections execute only the returned batch.
test('F7: before and after carry precise correction results and never request a third attempt', async t => {
    for (const stage of ['before', 'after'] as const) {
        for (const kind of ['direct-not-allowed', 'direct-other-stage', 'action-other-stage', 'derived-write'] as const) {
            const h = await harness(); t.after(() => h.dispose());
            const bundle = h.f.saved().card;
            bundle.definition.actions.forEach(action => {action.stages = [stage];});
            bundle.definition.access[1].stages = [stage === 'before' ? 'after' : 'before'];
            if (kind === 'action-other-stage') {bundle.definition.actions[1].stages = [stage === 'before' ? 'after' : 'before'];}
            h.f.setCard(bundle);
            h.append({ mes: 'Take off the amulet.', is_user: stage === 'before', name: 'Player' });
            const valid = { action: 'unequip', params: {} };
            const invalid = kind === 'action-other-stage' ? { action: 'equip', params: {} }
                : { path: ['hero', kind === 'derived-write' ? 'maxHealth' : kind === 'direct-other-stage' ? 'health' : 'amulet'], value: 40 };
            const batch = [valid, invalid], saved = h.f.saved(), counts = h.f.counts();
            h.answer(() => {
                if (h.requests.length === 2) {
                    assert.deepEqual(h.f.saved(), saved); assert.deepEqual(h.f.counts(), counts);
                    const task = h.requests[1];
                    assert.deepEqual(task.messages.slice(0, -1), h.requests[0].messages);
                    const report = JSON.parse(String(task.messages.at(-1)!.content).split('\n\n').at(-1)!);
                    const items = report.errors[0].items;
                    assert.deepEqual(items.map((item: { status: string }) => item.status), ['static-passed', 'rejected']);
                    assert.deepEqual(items.map((item: { item: unknown }) => item.item), batch);
                    assert.equal(items[1].diagnostics[0].code, kind);
                    assert.equal(items[1].diagnostics[0].message, undefined);
                    assert.equal(items[1].diagnostics[0].operation, undefined);
                    assert.equal(items[1].diagnostics[0].actions, undefined);
                }
                return { completion: 'complete', truncated: false, text: '', toolCalls: [{ name: 'write',
                    arguments: JSON.stringify({ state: h.requests.length === 1 ? batch : [valid] }) }] };
            });
            accepted(await h.updater.update({ stage, index: 1 }));
            assert.equal(h.requests.length, 2); assert.equal(h.disposedSessions(), 1);
            assert.equal((h.f.saved().state as { hero: { health: number } }).hero.health, 60);
            assert.equal(h.f.saved().records[1].entries.length, 1);
            h.dispose();
        }
        const h = await harness(); t.after(() => h.dispose());
        h.append({ mes: 'Unsupported edit.', is_user: stage === 'before', name: 'Player' });
        h.answer(() => ({ completion: 'complete', toolCalls: [{ name: 'write', arguments: JSON.stringify({ state: [{ path: ['hero', 'amulet'], value: false }] }) }] }));
        const saved = h.f.saved(), counts = h.f.counts();
        assert.equal((await h.updater.update({ stage, index: 1 })).ok, false);
        assert.equal(h.requests.length, 2);
        assert.deepEqual(h.f.saved(), saved); assert.deepEqual(h.f.counts(), counts);
        h.dispose();
    }
});

// Recalculation must expose the real rollback while saving, then build the paid
// request from that state; the latest USER may still have a later AI outcome.
test('B12: USER recalculation waits for rollback persistence and never retains the old AI outcome', async t => {
    const h = await harness(); t.after(() => h.dispose());
    const initial = h.f.saved().state;
    h.append({ mes: 'Take off the amulet.', is_user: true, name: 'Player' });
    accepted(await h.updater.update({ index: 1, stage: 'before' }));
    h.append({ mes: 'The player was wounded.', name: 'Hero' });
    accepted(await h.f.service.apply([{ op: 'set', path: ['hero', 'health'], value: 30 }], { index: 2 }));
    const oldIds = h.f.saved().records.flatMap(record => record.entries.map(entry => entry.id));
    const beforePreview = h.f.saved(), savesBeforePreview = h.f.counts().saves;
    await h.updater.previewRequest({ index: 1, stage: 'before' });
    assert.deepEqual(h.f.saved(), beforePreview); assert.equal(h.f.counts().saves, savesBeforePreview);
    const requests = h.requests.length, gate = h.f.holdNextSave();
    const recomputing = h.before().run(1);
    try {
        await gate.started;
        assert.deepEqual(h.f.saved().state, initial);
        assert.ok(h.f.saved().records.slice(1).every(record => record.entries.length === 0));
        assert.equal(h.requests.length, requests);
    } finally {gate.release();}
    accepted((await recomputing)!);
    assert.equal(h.requests.length, requests + 1);
    assert.deepEqual(mounted(h.requests.at(-1)!, 'read_writing_guide').state, initial);
    assert.equal((h.f.saved().state as { hero: { health: number } }).hero.health, 60);
    assert.equal(h.f.saved().records[1].entries.length, 1);
    assert.equal(h.f.saved().records[2].entries.length, 0);
    assert.ok(h.f.saved().records.flatMap(record => record.entries).every(entry => !oldIds.includes(entry.id)));
});

test('B12: rollback save failure blocks a fresh paid request and retains only the rolled-back state', async t => {
    const h = await harness(); t.after(() => h.dispose());
    const initial = h.f.saved().state;
    h.append({ mes: 'Take off the amulet.', is_user: true, name: 'Player' });
    accepted(await h.updater.update({ index: 1, stage: 'before' }));
    const requests = h.requests.length;
    h.f.failSave();
    const result = accepted((await h.before().run(1))!);
    assert.equal(result.saved, false);
    assert.equal(h.requests.length, requests);
    assert.deepEqual(h.f.saved().state, initial);
    assert.equal(h.f.saved().records[1].entries.length, 0);
});

test('B12: failed, invalid and cancelled USER recalculations cannot resurrect old target or later effects', async t => {
    for (const failure of ['transport', 'submission', 'cancel']) {
        const h = await harness(); t.after(() => h.dispose());
        const initial = h.f.saved().state;
        h.append({ mes: 'Take off the amulet.', is_user: true, name: 'Player' });
        accepted(await h.updater.update({ index: 1, stage: 'before' }));
        h.append({ mes: 'The player was wounded.', name: 'Hero' });
        accepted(await h.f.service.apply([{ op: 'set', path: ['hero', 'health'], value: 30 }], { index: 2 }));
        const oldIds = h.f.saved().records.flatMap(record => record.entries.map(entry => entry.id));
        let started!: () => void, release!: (value: unknown) => void;
        const requesting = new Promise<void>(resolve => {started = resolve;});
        h.answer(() => {
            started();
            if (failure === 'transport') {throw new Error('offline');}
            if (failure === 'submission') {return { completion: 'complete', toolCalls: [] };}
            return new Promise(resolve => {release = resolve;});
        });
        const recomputing = h.before().run(1);
        await requesting;
        assert.deepEqual(h.f.saved().state, initial, failure);
        if (failure === 'cancel') {
            h.before().cancel();
            release({ completion: 'complete', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] });
        }
        await recomputing;
        assert.deepEqual(h.f.saved().state, initial, failure);
        assert.equal(h.f.saved().records[2].entries.length, 0, failure);
        assert.ok(h.f.saved().records.flatMap(record => record.entries).every(entry => !oldIds.includes(entry.id)), failure);
        h.f.load(JSON.parse(JSON.stringify(h.f.saved())));
        assert.deepEqual(accepted(await h.f.service.inspect()).state, initial, failure);
    }
});

// E3: a paid submission survives local faults, not a session or chat snapshot;
// retry commits once and releases resources (duplicate API charge / partial state).
test('E3: automatic and repeated manual local retries use one model request and commit once', async t => {
    const previousWorker = globalThis.Worker; t.after(() => {globalThis.Worker = previousWorker;});
    for (const failures of [1, 6]) {
        const h = await harness(); t.after(() => h.dispose()); useFunction(h);
        const gate = localFailures(failures); globalThis.Worker = gate.Worker;
        const initial = h.f.saved(), notices = h.f.counts().notices;
        await h.generate('normal', 'Take off the amulet.'); await h.drain();
        assert.equal(h.requests.length, 1); assert.equal(h.disposedSessions(), 1);
        if (failures > 1) {
            for (let retry = 0; retry < 3; retry++) {
                assert.equal(h.updater.status().retryIndex, 1);
                assert.deepEqual(h.f.saved().state, initial.state);
                assert.equal(h.f.saved().records[1].entries.length, 0);
                assert.equal(h.f.counts().notices, notices);
                assert.equal(gate.counts().created, gate.counts().terminated);
                await h.before().run(1);
            }
        }
        assert.equal(h.requests.length, 1); assert.equal(h.disposedSessions(), 1);
        assert.equal(h.updater.status().retryIndex, undefined);
        assert.equal(h.f.saved().records[1].entries.length, 1);
        assert.equal(h.f.counts().notices, notices + 1);
        assert.equal((h.f.saved().state as {hero: {health: number}}).hero.health, 60);
        assert.equal(gate.counts().created, gate.counts().terminated);
    }
});

// E5: host regeneration resumes an unchanged paid submission; reload loses only
// that temporary input, never the player's ability to settle (duplicate API charge / dead end).
test('E5: regenerate reuses pending input; reload and changed input require a fresh request', async t => {
    const previousWorker = globalThis.Worker; t.after(() => {globalThis.Worker = previousWorker;});
    for (const change of ['none', 'reload', 'edit', 'new-message']) {
        const h = await harness(); t.after(() => h.dispose()); useFunction(h);
        const gate = localFailures(2); globalThis.Worker = gate.Worker;
        await h.generate('normal', 'Take off the amulet.'); await h.drain();
        assert.equal(h.requests.length, 1); assert.equal(h.prose.length, 0);
        assert.equal(h.updater.status().retryIndex, 1);
        if (change === 'reload') {h.reopen();}
        if (change === 'edit') {h.chat()[1].mes = 'Remove it now.'; await h.emit(h.event_types.MESSAGE_EDITED, 1);}
        await h.generate(change === 'new-message' ? 'normal' : 'regenerate', change === 'new-message' ? 'Remove it now.' : undefined);
        await h.drain();
        assert.equal(h.requests.length, change === 'none' ? 1 : 2);
        assert.equal(h.prose.length, 1);
        assert.equal(h.f.saved().records.at(-1)!.entries.length, 1);
        assert.equal(h.updater.status().retryIndex, undefined);
        assert.equal(gate.counts().created, gate.counts().terminated);
    }
});

// E4: a pending submission cannot outlive its basis or owner (stale writes / memory).
test('E4: pending local submissions are released on cancel, edit, chat, state, rules and disposal', async t => {
    const previousWorker = globalThis.Worker; t.after(() => {globalThis.Worker = previousWorker;});
    for (const change of ['cancel', 'edit', 'chat', 'state', 'rules', 'dispose']) {
        const h = await harness(); t.after(() => h.dispose()); useFunction(h);
        const gate = localFailures(2); globalThis.Worker = gate.Worker;
        await h.generate('normal', 'Take off the amulet.'); await h.drain();
        assert.equal(h.updater.status().retryIndex, 1);
        if (change === 'cancel') {h.before().cancel();}
        if (change === 'edit') {h.chat()[1].mes = 'Keep it.'; await h.emit(h.event_types.MESSAGE_EDITED, 1);}
        if (change === 'chat') {await h.emit(h.event_types.CHAT_CHANGED);}
        if (change === 'state') {const saved = h.f.saved(); (saved.state as {hero: {health: number}}).hero.health = 70; h.f.load(saved);}
        if (change === 'rules') {const bundle = h.f.saved().card; bundle.definition.name = 'Changed rules'; h.f.setCard(bundle);}
        if (change === 'dispose') {h.dispose();}
        assert.equal(h.updater.status().retryIndex, undefined);
        assert.equal(h.requests.length, 1); assert.equal(h.disposedSessions(), 1);
        assert.equal(gate.counts().created, gate.counts().terminated);
    }
});

// B3: one player action settles once across stop/retry/reload, and prose reads
// settled native state rather than a private candidate (double charge / wrong story).
test('B3: saved USER outcomes survive regeneration, reload, edits and explicit undo', async t => {
    const h = await harness(); t.after(() => h.dispose());
    await h.generate('normal', 'Take off the amulet.'); await h.drain();
    assert.equal(h.requests.length, 1); assert.equal(h.prose.length, 1);
    assert.equal((h.prose[0].state as { hero: { health: number } }).hero.health, 60);
    assert.ok(JSON.parse(h.prose[0].prompt.slice(h.prose[0].prompt.indexOf('\n') + 1)).changes.length);
    await h.generate('regenerate'); h.reopen(); await h.generate('regenerate');
    assert.equal(h.requests.length, 1);
    h.chat()[1].mes = 'Actually, keep it on.'; await h.emit(h.event_types.MESSAGE_EDITED, 1);
    await h.generate('regenerate'); assert.equal(h.requests.length, 1);
    await h.before().undo(1); await h.generate('regenerate');
    assert.equal(h.requests.length, 1);
    assert.equal((h.f.saved().state as { hero: { health: number } }).hero.health, 80);
    assert.equal(h.prose.at(-1)!.prompt, '');
    h.reopen(); await h.generate('regenerate');
    assert.equal(h.prose.at(-1)!.prompt, ''); assert.equal(h.requests.length, 1);
    await h.before().run(1); assert.equal(h.requests.length, 2);
    assert.equal(h.f.saved().records[1].entries.length, 1);
});

// B4: plan preview is not an action; final adopted text is captured and after
// receives the same durable before outcome (extra paid requests / duplicate effects).
test('B4: deferred input waits for adoption; after gets before facts with only its own tools', async t => {
    const h = await harness(); t.after(() => h.dispose());
    const dispatch = await h.generate('normal', 'A player action.', true);
    assert.equal(dispatch.input.rebuild, true); assert.equal(h.requests.length, 0);
    h.chat()[1].mes += '\nAn adopted plan.';
    await h.generate('regenerate'); await h.drain();
    assert.equal(h.captures[0], h.chat()[1].mes); assert.equal(h.requests.length, 1);
    h.append({ mes: 'The amulet is off.', name: 'Hero' });
    h.answer(() => ({ completion: 'complete', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] }));
    accepted(await h.updater.update({ stage: 'after', index: 2 }));
    const manuscript = mounted(h.requests[1], 'read_manuscript'), guide = mounted(h.requests[1], 'read_writing_guide');
    assert.equal(manuscript.beforeUpdate.outcome, 'applied'); assert.equal(guide.actions.length, 0);
    assert.equal(guide.state.hero.health, 60);
});

// B5: technical failures stop prose and keep a visible retry/skip outcome;
// rejected gameplay does not turn into a transport error (unpaid/failed actions narrated as success).
test('B5: failed requests persist without prose, explicit skip resumes, valid rejection can be narrated', async t => {
    const h = await harness(); t.after(() => h.dispose());
    h.answer(() => {throw new Error('offline');});
    await h.generate('normal', 'Take off the amulet.'); await h.drain();
    assert.equal(h.prose.length, 0); assert.equal(h.f.saved().records[1].entries[0].beforeUpdate!.outcome, 'failed');
    h.reopen(); await h.generate('regenerate'); assert.equal(h.requests.length, 1);
    await h.before().skip(1); assert.equal(h.requests.length, 1); assert.equal(h.prose.length, 1);
    assert.equal(h.prose.at(-1)!.prompt, '');
    h.answer(() => ({ completion: 'complete', toolCalls: [{ name: 'write', arguments: '{"state":[{"action":"equip","params":{}}]}' }] }));
    await h.generate('normal', 'Equip another amulet.'); await h.drain();
    assert.equal(h.requests.length, 3); assert.equal(h.prose.length, 2);
    assert.equal(h.f.saved().records[2].entries[0].beforeUpdate!.outcome, 'rejected');
    const rejected = JSON.parse(h.prose.at(-1)!.prompt.split('\n').slice(1).join('\n'));
    assert.equal(rejected.outcome, 'rejected'); assert.deepEqual(rejected.changes, []);
    assert.equal(rejected.diagnostics[0].code, 'action-precondition');
    h.reopen(); await h.generate('regenerate');
    assert.deepEqual(JSON.parse(h.prose.at(-1)!.prompt.split('\n').slice(1).join('\n')), rejected);
    assert.equal(h.requests.length, 3);
});

test('X8: before failure keeps extension diagnostics available without adding them to history', async t => {
    const h = await harness(); t.after(() => h.dispose());
    const extensions = { calls: [{kind:'prepare' as const,name:'prepare',path:'variables/scripts/prepare.js',input:[],error:'unavailable'}],modelRequests:1 };
    h.updater.update = async () => ({ok:false,diagnostics:[{code:'extension-execution',path:'variables/scripts/prepare.js'}],extensions});
    await h.generate('normal','Try the extension.'); await h.drain();
    assert.deepEqual(h.results.at(-1)!.extensions,extensions);
    assert.equal(h.prose.length,0);
    assert.equal('extensions' in h.f.saved().records[1].entries[0],false);
});

// B10: empty/skip/undo outcomes stay out of prose while their receipts prevent
// paid reruns; actions and real rule changes remain visible (wrong story / cost).
test('B10: an empty before result clears prior prose context and survives reload without another request', async t => {
    const h = await harness(); t.after(() => h.dispose());
    await h.generate('normal', 'Take off the amulet.'); await h.drain();
    assert.ok(h.prose.at(-1)!.prompt);
    h.answer(() => ({ completion: 'complete', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] }));
    await h.generate('normal', 'Hello.'); await h.drain();
    const receipt = h.f.saved().records[2].entries[0];
    assert.equal(receipt.beforeUpdate!.outcome, 'applied');
    assert.deepEqual(beforeOutcome(receipt).changes, []); assert.deepEqual(receipt.actions, []);
    assert.equal(h.prose.at(-1)!.prompt, '');
    for (let attempt = 0; attempt < 2; attempt++) {
        h.reopen(); await h.generate('regenerate');
        assert.equal(h.prose.at(-1)!.prompt, ''); assert.equal(h.requests.length, 2);
        assert.equal(h.f.saved().records[2].entries[0].id, receipt.id);
    }
    await h.before().skip(2); h.reopen(); await h.generate('regenerate');
    assert.equal(h.prose.at(-1)!.prompt, ''); assert.equal(h.requests.length, 2);
});

test('B10: actions without net changes and empty submissions with rule changes both reach prose', async t => {
    for (const actionOnly of [true, false]) {
        const h = await harness(); t.after(() => h.dispose());
        const bundle = h.f.saved().card;
        if (actionOnly) {bundle.definition.actions.find(action => action.id === 'unequip')!.effects = [{ path: ['hero', 'amulet'], value: { literal: true } }];}
        else {
            bundle.definition.rules[0].value = { literal: 120 };
            h.answer(() => ({ completion: 'complete', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] }));
        }
        h.f.setCard(bundle);
        await h.generate('normal', 'A player message.'); await h.drain();
        const result = JSON.parse(h.prose.at(-1)!.prompt.split('\n').slice(1).join('\n'));
        assert.equal(result.outcome, 'applied');
        if (actionOnly) {assert.equal(result.actions[0].id, 'unequip'); assert.deepEqual(result.changes, []);}
        else {assert.deepEqual(result.actions, []); assert.ok(result.changes.length);}
        h.reopen(); await h.generate('regenerate');
        assert.deepEqual(JSON.parse(h.prose.at(-1)!.prompt.split('\n').slice(1).join('\n')), result);
        assert.equal(h.requests.length, 1);
    }
});

// B11: accepted before actions retain their executed parameters in prose and
// after requests, including after reload and without net changes (lost facts / wrong story).
test('B11: no-change before actions keep converted parameters across reload and after handoff', async t => {
    const h = await harness(); t.after(() => h.dispose());
    const bundle = h.f.saved().card;
    bundle.definition.actions.push({ id: 'heal', title: '治疗', stages: ['before'], description: 'Heal by twice the submitted amount.',
        parameters: { type: 'object', additionalProperties: false, required: ['amount'], properties: { amount: { type: 'number' } } },
        conversions: [{ path: ['amount'], value: { op: 'multiply', args: [{ param: ['amount'] }, { literal: 2 }] } }],
        requires: { literal: true }, effects: [{ path: ['hero', 'health'], value: { op: 'add', args: [{ get: ['hero', 'health'] }, { param: ['amount'] }] } }],
    });
    h.f.setCard(bundle);
    accepted(await h.f.service.apply([{ op: 'set', path: ['hero', 'health'], value: 100 }]));
    const initial = h.f.saved().state;
    h.answer(() => ({ completion: 'complete', toolCalls: [{ name: 'write', arguments: JSON.stringify({ state: [
        { action: 'heal', params: { amount: 5 } }, { action: 'heal', params: { amount: 10 } },
    ] }) }] }));
    await h.generate('normal', 'Use the small healing item, then the large one.'); await h.drain();
    const expected = [{ id: 'heal', params: { amount: 10 } }, { id: 'heal', params: { amount: 20 } }];
    const outcome = JSON.parse(h.prose.at(-1)!.prompt.split('\n').slice(1).join('\n'));
    assert.equal(outcome.outcome, 'applied'); assert.deepEqual(outcome.changes, []);
    assert.deepEqual(outcome.actions, expected); assert.deepEqual(h.f.saved().state, initial);
    assert.deepEqual(h.f.saved().records[1].entries[0].actions, expected);
    h.f.load(JSON.parse(JSON.stringify(h.f.saved()))); h.reopen();
    await h.generate('regenerate');
    assert.deepEqual(JSON.parse(h.prose.at(-1)!.prompt.split('\n').slice(1).join('\n')), outcome);
    assert.equal(h.requests.length, 1);
    h.append({ mes: 'Both healing items were used.', name: 'Hero' });
    h.answer(() => ({ completion: 'complete', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] }));
    accepted(await h.updater.update({ stage: 'after', index: 2 }));
    assert.deepEqual(mounted(h.requests[1], 'read_manuscript').beforeUpdate, outcome);
    assert.deepEqual(h.f.saved().state, initial);
});

// B6: quiet/continuation/automatic trigger and cancelled in-flight work must not
// create a paid before event or publish late results (cost / cross-context writes).
test('B6: auxiliary generation and cancellation do not publish; normal before hands off without a plugin save', async t => {
    const h = await harness(); t.after(() => h.dispose());
    h.append({ mes: 'Waiting player message.', name: 'Player', is_user: true });
    for (const type of ['quiet', 'continue', 'swipe', 'impersonate', 'normal']) {await h.generate(type);}
    await h.generate('normal', undefined, false, true); assert.equal(h.requests.length, 0);
    let release!: (value: unknown) => void, started!: () => void;
    const requestStarted = new Promise<void>(resolve => {started = resolve;});
    h.answer(() => {started(); return new Promise(resolve => {release = resolve;});});
    const proseCount = h.prose.length;
    await h.generate('regenerate'); await requestStarted; h.before().cancel();
    release({ completion: 'complete', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] }); await h.drain();
    assert.equal(h.f.saved().records[1].entries.length, 0); assert.equal(h.prose.length, proseCount);
    h.answer(() => ({ completion: 'complete', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] }));
    const saves = h.f.counts().saves;
    h.f.failSave(); await h.generate('regenerate'); await h.drain();
    assert.equal(h.prose.length, proseCount + 1); assert.equal(accepted(h.results.at(-1)!).saved, undefined);
    assert.equal(h.f.counts().saves, saves);
});

// B8: a new player turn while the prior before request is pending cancels that
// request and runs the new one once (late writes / silently missed player action).
test('B8: a newer player message takes over after the cancelled updater releases', async t => {
    const h = await harness(); t.after(() => h.dispose());
    let release!: (value: unknown) => void, started!: () => void;
    const requestStarted = new Promise<void>(resolve => {started = resolve;});
    const response = { completion: 'complete', toolCalls: [{ name: 'write', arguments: '{"state":[]}' }] };
    h.answer(() => {started(); return new Promise(resolve => {release = resolve;});});
    await h.generate('normal', 'Old player action.'); await requestStarted;
    await h.generate('normal', 'New player action.');
    h.answer(() => response); release(response); await h.drain();
    assert.equal(h.requests.length, 2); assert.equal(h.prose.length, 1);
    assert.equal(h.f.saved().records[1].entries.length, 0);
    assert.equal(h.f.saved().records[2].entries.length, 1);
    assert.equal(h.captures.at(-1), 'New player action.');
    const anotherStarted = new Promise<void>(resolve => {started = resolve;});
    h.answer(() => {started(); return new Promise(resolve => {release = resolve;});});
    await h.generate('normal', 'Another old action.'); await anotherStarted;
    await h.generate('normal', 'A queued action.'); h.before().cancel();
    h.answer(() => response); release(response); await h.drain();
    assert.equal(h.requests.length, 3); assert.equal(h.prose.length, 1);
    assert.equal(h.f.saved().records.at(-1)!.entries.length, 0);
});
