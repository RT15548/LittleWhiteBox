/* global Buffer */
// Real summary adapter + raw generation, with only host/transport boundaries
// replaced. Protects failure propagation, cancellation and the slash-command API.
import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { EventEmitter } from 'node:events';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const previousWindow = globalThis.window;
const host = globalThis.__summaryGenerationTest = { events: new EventEmitter(), chat: [], locked: false };
globalThis.window = { frames: [], postMessage() {} };
const shims = {
    'script.js': `const h=globalThis.__summaryGenerationTest;
        export const eventSource=h.events, chat=h.chat, name1='User';
        export const event_types={CHAT_COMPLETION_PROMPT_READY:'prompt-ready',GENERATE_AFTER_DATA:'generate-data'};
        export const activateSendButtons=()=>{h.locked=false;}, deactivateSendButtons=()=>{h.locked=true;};
        export const substituteParams=s=>s, getRequestHeaders=()=>({});`,
    'openai.js': `export const chat_completion_sources={OPENAI:'openai',CLAUDE:'claude',MAKERSUITE:'google',COHERE:'cohere',DEEPSEEK:'deepseek',CUSTOM:'custom'};
        export const oai_settings={chat_completion_source:'openai'}, promptManager={};
        export const getChatCompletionModel=()=>'test-model', getStreamingReply=()=>'';`,
    'custom-request.js': `export const ChatCompletionService={createRequestData:data=>data,
        sendRequest:(data,_extract,signal)=>globalThis.__summaryGenerationTest.transport(data,signal)};`,
    'st-context.js': `export const getContext=()=>({chat:globalThis.__summaryGenerationTest.chat,
        generate:async()=>globalThis.__summaryGenerationTest.events.emit('generate-data',{prompt:[{role:'user',content:'host context'}]})});`,
    'extensions.js': 'export const extension_settings={};',
    'SlashCommandParser.js': 'export const SlashCommandParser={addCommandObject(){}};',
    'SlashCommand.js': 'export const SlashCommand={fromProps:p=>p};',
    'SlashCommandArgument.js': 'export const ARGUMENT_TYPE={STRING:"string"}, SlashCommandArgument={fromProps:p=>p}, SlashCommandNamedArgument=SlashCommandArgument;',
    'power-user.js': 'export const power_user={};',
    'world-info.js': 'export const world_info=[];',
    'debug-core.js': 'export const xbLog={info(){},warn(){},error(){},isEnabled:()=>false}, CacheRegistry={register(){}};',
    'iframe-messaging.js': 'export const getTrustedOrigin=()=>"https://test.invalid";',
    'server-storage.js': 'export const CommonSettingStorage={};',
    'modules/variables/var-commands.js': 'export const replaceXbGetVarInString=s=>s, replaceXbGetVarYamlInString=s=>s;',
    'shared/host-llm/chat-completions/client.js': `const unused=()=>{throw new Error('unexpected host-helper route');};
        export const buildHostOpenAICompatibleGeneratePayload=unused, createHostChatCompletion=unused,
        setHostChatCompletionsRequestHeadersProvider=unused, streamHostChatCompletion=unused;`,
};
const bundled = await build({
    stdin: { resolveDir: root, contents: `export * from './modules/story-summary/generate/llm.js';
        export { streamingGeneration } from './modules/streaming-generation.js';` },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'generation-host-boundaries', setup(api) {
        api.onResolve({ filter: /.*/ }, args => {
            const relative = path.relative(root, path.resolve(args.resolveDir, args.path)).replaceAll('\\', '/');
            const key = Object.hasOwn(shims, relative) ? relative : path.basename(args.path);
            return Object.hasOwn(shims, key) ? { path: key, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path], resolveDir: root }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Generated local test bundle, never external input.
const mod = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
const streaming = mod.streamingGeneration;
const doneEvent = 'xiaobaix_streaming_completed'; // Public event consumed by story-outline.
const options = { existingSummary: '', existingFacts: [], newHistoryText: 'A new scene.', historyRange: '1-1',
    llmApi: { provider: 'st' }, sessionId: 'summary-test' };

function deferred() {
    let resolve;
    const promise = new Promise(r => { resolve = r; });
    return { promise, resolve };
}

function pausePromptPreparation(t) {
    const entered = deferred(), release = deferred();
    const emit = host.events.emit.bind(host.events);
    t.mock.method(host.events, 'emit', async (event, ...args) => {
        if (event === 'prompt-ready') {
            entered.resolve();
            await release.promise;
        }
        return emit(event, ...args);
    });
    return { entered: entered.promise, release: release.resolve };
}

beforeEach(() => {
    streaming.cleanup();
    host.events.removeAllListeners();
    host.locked = false;
    host.transport = () => assert.fail('unexpected request');
});
after(() => {
    streaming.cleanup();
    globalThis.window = previousWindow;
    delete globalThis.__summaryGenerationTest;
});

for (const useStream of [false, true]) {
    test(`cancelling summary preparation prevents any model request (stream=${useStream})`, async t => {
        const preparation = pausePromptPreparation(t);
        const controller = new AbortController();
        let calls = 0;
        host.transport = async () => { calls++; throw new Error('unexpected model request'); };
        const pending = mod.generateSummary({ ...options, useStream, signal: controller.signal });
        const rejected = assert.rejects(pending, mod.isSummaryGenerationCancelledError);
        await preparation.entered;
        controller.abort();
        preparation.release();
        await rejected;
        assert.equal(calls, 0);
    });
}

for (const addon of ['', 'chatHistory']) {
    for (const stream of [false, true]) {
        test(`cancelled raw preparation releases the input lock without sending (stream=${stream}, addon=${!!addon})`, async t => {
            const preparation = pausePromptPreparation(t);
            const controller = new AbortController();
            let calls = 0;
            host.transport = async () => { calls++; throw new Error('unexpected model request'); };
            const pending = (async () => {
                const task = await streaming.startRawGeneration({ id: 'xb10', nonstream: String(!stream), addon, lock: 'on' },
                    'scene', { signal: controller.signal });
                return task.completion;
            })();
            const rejected = assert.rejects(pending, error => error.name === 'AbortError');
            await preparation.entered;
            assert.equal(host.locked, true);
            controller.abort();
            preparation.release();
            await rejected;
            assert.equal(calls, 0);
            assert.equal(host.locked, false);
        });
    }
}

for (const failure of ['http', 'stream']) {
    test(`summary rejects a ${failure} failure with its original cause instead of returning empty/partial text`, async t => {
        t.mock.method(console, 'error', () => {});
        const upstream = Object.assign(new Error('provider rejected request'), { status: 429 });
        let completed = false;
        host.events.on(doneEvent, () => { completed = true; });
        host.transport = async () => {
            if (failure === 'http') throw upstream;
            return (async function* () { yield '{"events":'; throw upstream; })();
        };
        await assert.rejects(mod.generateSummary(options), error => error.cause === upstream);
        assert.equal(completed, false);
        assert.equal(streaming.getStatus(options.sessionId).isStreaming, false);
    });
}

for (const useStream of [false, true]) {
    test(`summary returns the actual complete result (stream=${useStream})`, async () => {
        const result = { events: [], factUpdates: [] };
        host.transport = async data => {
            assert.equal(data.stream, useStream);
            return useStream ? (async function* () { yield JSON.stringify(result); })() : JSON.stringify(result);
        };
        assert.deepEqual(JSON.parse(await mod.generateSummary({ ...options, useStream })), result);
    });
}

for (const ending of ['cancel', 'timeout']) {
    test(`summary ${ending} aborts the request and never returns its partial result`, async t => {
        t.mock.method(console, 'error', () => {});
        const started = deferred();
        const controller = new AbortController();
        let transportSignal;
        host.transport = async (_data, signal) => {
            transportSignal = signal;
            started.resolve();
            return (async function* () {
                yield '{"events":';
                if (!signal.aborted) await new Promise(resolve => signal.addEventListener('abort', resolve, { once: true }));
                signal.throwIfAborted();
            })();
        };
        const run = mod.generateSummary({ ...options, signal: controller.signal, timeout: ending === 'timeout' ? 20 : 1000 });
        const rejected = assert.rejects(run, error => ending === 'cancel'
            ? mod.isSummaryGenerationCancelledError(error) : error instanceof Error && !mod.isSummaryGenerationCancelledError(error));
        await started.promise;
        if (ending === 'cancel') controller.abort();
        await rejected;
        assert.equal(transportSignal.aborted, true);
        await nextTurn();
    });
}

for (const addon of ['', 'chatHistory']) {
    for (const stream of [false, true]) {
        test(`raw command retains return value, completion event and input lock (stream=${stream}, addon=${!!addon})`, async () => {
            const started = deferred(), release = deferred(), completed = deferred();
            const result = { events: [] };
            host.events.once(doneEvent, completed.resolve);
            host.transport = async data => {
                assert.equal(data.stream, stream);
                started.resolve();
                if (!stream) { await release.promise; return JSON.stringify(result); }
                return (async function* () { await release.promise; yield JSON.stringify(result); })();
            };
            let returned = false;
            const command = streaming.xbgenrawCommand({ id: 'xb10', nonstream: String(!stream), lock: 'on', addon }, 'scene')
                .then(value => { returned = true; return value; });
            await started.promise;
            assert.equal(host.locked, true);
            if (stream) assert.equal(await command, 'xb10');
            else assert.equal(returned, false);
            release.resolve();
            const value = await command;
            if (!stream) assert.deepEqual(JSON.parse(value), result);
            const event = await completed.promise;
            assert.equal(event.sessionId, 'xb10');
            assert.deepEqual(JSON.parse(event.finalText), result);
            // Completion is emitted before the raw task's finally releases the lock.
            await nextTurn();
            assert.equal(host.locked, false);
        });
    }
}

test('streaming command failure is observed and releases its input lock', async t => {
    t.mock.method(console, 'error', () => {});
    host.transport = async () => { throw new Error('provider unavailable'); };
    assert.equal(await streaming.xbgenrawCommand({ id: 'xb10', lock: 'on' }, 'scene'), 'xb10');
    await nextTurn();
    assert.equal(host.locked, false);
    assert.equal(streaming.getStatus('xb10').isStreaming, false);
    // node:test fails this test if the detached completion creates an unhandled rejection.
});
