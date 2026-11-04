import { parentPort } from 'node:worker_threads';
import { newQuickJSWASMModuleFromVariant } from 'quickjs-emscripten-core';
import variant from '@jitl/quickjs-singlefile-cjs-release-sync';

const engineReady = newQuickJSWASMModuleFromVariant(variant);
let engine;
let toolRuntime;
const contexts = new Map();
const fetches = new Map();
let sequence = 0;

function pump(context) {
    const result = context.runtime.executePendingJobs();
    if (result.error) {
        const error = context.dump(result.error);
        result.error.dispose();
        throw new Error(error?.message || String(error));
    }
}

async function evaluate(context, source) {
    const value = context.unwrapResult(context.evalCode(source));
    try {
        const promise = context.resolvePromise(value);
        pump(context);
        const resolved = context.unwrapResult(await promise);
        try { return context.dump(resolved); }
        finally { resolved.dispose(); }
    } finally { value.dispose(); }
}

function createContext(blockId) {
    if (!toolRuntime) {
        toolRuntime = engine.newRuntime();
        toolRuntime.setMemoryLimit(32 * 1024 * 1024);
        toolRuntime.setMaxStackSize(512 * 1024);
    }
    const runtime = toolRuntime;
    const context = runtime.newContext();
    const bridge = context.newFunction('__fetch', (url, options) => {
        const deferred = context.newPromise();
        const id = ++sequence;
        fetches.set(id, { context, deferred });
        parentPort.postMessage({ type: 'fetch', id, url: context.getString(url), options: JSON.parse(context.getString(options)) });
        return deferred.handle;
    });
    context.setProp(context.global, '__fetch', bridge);
    bridge.dispose();
    const initialized = context.evalCode(`
        globalThis.fetch = async (url, options = {}) => {
            const response = JSON.parse(await __fetch(String(url), JSON.stringify(options)));
            return { url: response.url, status: response.status, ok: response.status >= 200 && response.status < 300,
                headers: { get: name => response.headers[String(name).toLowerCase()] ?? null },
                text: async () => response.body, json: async () => JSON.parse(response.body) };
        };
    `);
    context.unwrapResult(initialized).dispose();
    contexts.set(blockId, context);
    return context;
}

async function handle(message) {
    engine ||= await engineReady;
    if (message.type === 'fetch-result') {
        const pending = fetches.get(message.id);
        if (!pending) return;
        fetches.delete(message.id);
        const { context, deferred } = pending;
        const value = message.error ? context.newError(message.error) : context.newString(JSON.stringify(message.value));
        if (message.error) deferred.reject(value);
        else deferred.resolve(value);
        value.dispose();
        deferred.dispose();
        pump(context);
        return;
    }
    try {
        const context = message.type === 'define' ? createContext(message.blockId) : contexts.get(message.blockId);
        if (!context) throw new Error('Tool is not defined');
        const deadline = Date.now() + message.timeout;
        context.runtime.setInterruptHandler(() => Date.now() > deadline);
        const source = message.type === 'define'
            ? `(async () => { globalThis.__definition = await (async () => {\n${message.code}\n})();
                if (!__definition || typeof __definition.action !== 'function') throw new Error('Tool requires an action function');
                const { name, description, parameters, stealth } = __definition;
                return JSON.stringify({ name, description, parameters, stealth }); })()`
            : `(async () => { const value = await __definition.action(${JSON.stringify(message.args)});
                return typeof value === 'string' ? value : JSON.stringify(value === undefined ? {} : value); })()`;
        const value = await evaluate(context, source);
        parentPort.postMessage({ type: 'result', id: message.id, value: message.type === 'define' ? JSON.parse(value) : value });
    } catch (error) {
        parentPort.postMessage({ type: 'result', id: message.id, error: String(error?.message || error) });
    }
}

parentPort.on('message', message => {
    handle(message).catch(error => { throw error; });
});
engineReady.then(() => parentPort.postMessage({ type: 'ready' })).catch(error => { throw error; });
