import { Worker } from 'node:worker_threads';
import workerSource from 'lwb:tool-worker';
import { publicFetch } from './public-fetch.mjs';
import { TOOL_ACTION_TIMEOUT_MS, TOOL_DEFINE_TIMEOUT_MS, formatToolResult, normalizeToolDefinition } from '../../shared/custom-tools.js';
import { assertToolCodeLength } from '../../shared/scene-planner-layout.js';

export function createNodeToolHost() {
    const worker = new Worker(workerSource, { eval: true, execArgv: [], resourceLimits: { maxOldGenerationSizeMb: 64 } });
    const pending = new Map();
    const names = new Map();
    const network = new AbortController();
    let sequence = 0;
    let closed = false;
    let readyResolve;
    const ready = new Promise(resolve => { readyResolve = resolve; });

    function dispose(error = new Error('Tool sandbox was closed')) {
        if (closed) return;
        closed = true;
        network.abort();
        for (const entry of pending.values()) entry.reject(error);
        pending.clear();
        worker.terminate().catch(failure => console.error('[Draw Tools] worker termination failed', failure));
    }
    worker.on('error', dispose);
    worker.on('exit', code => { if (!closed) dispose(new Error(`Tool sandbox exited (${code})`)); });
    worker.on('message', message => {
        if (closed) return;
        if (message.type === 'ready') { readyResolve(); return; }
        if (message.type === 'fetch') {
            publicFetch(message.url, message.options, { signal: network.signal }).then(
                value => { if (!closed) worker.postMessage({ type: 'fetch-result', id: message.id, value }); },
                error => { if (!closed) worker.postMessage({ type: 'fetch-result', id: message.id, error: String(error.message || error) }); },
            ).catch(dispose);
            return;
        }
        const entry = pending.get(message.id);
        if (!entry) return;
        pending.delete(message.id);
        if (message.error) entry.reject(new Error(message.error));
        else entry.resolve(message.value);
    });

    async function request(message, timeout, signal) {
        if (closed) throw new Error('Tool sandbox was closed');
        signal?.throwIfAborted();
        const id = ++sequence;
        const onAbort = () => dispose(signal.reason || new Error('Tool execution cancelled'));
        let timer;
        try {
            return await new Promise((resolve, reject) => {
                pending.set(id, { resolve, reject });
                timer = setTimeout(() => dispose(new Error('Tool execution timed out')), timeout);
                signal?.addEventListener('abort', onAbort, { once: true });
                ready.then(() => { if (!closed) worker.postMessage({ ...message, id, timeout }); }).catch(dispose);
            });
        } finally {
            clearTimeout(timer);
            signal?.removeEventListener('abort', onAbort);
            pending.delete(id);
        }
    }
    return {
        async define(blockId, code, { signal } = {}) {
            assertToolCodeLength(code);
            const raw = await request({ type: 'define', blockId, code }, TOOL_DEFINE_TIMEOUT_MS, signal);
            const definition = normalizeToolDefinition(raw, { usedNames: [...names.keys()] });
            names.set(definition.name, blockId);
            return definition;
        },
        async invoke(name, args, { signal } = {}) {
            if (!names.has(name)) throw new Error(`Unknown tool: ${name}`);
            return formatToolResult(await request({ type: 'invoke', blockId: names.get(name), args }, TOOL_ACTION_TIMEOUT_MS, signal));
        },
        dispose,
    };
}
