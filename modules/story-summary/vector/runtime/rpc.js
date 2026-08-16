// Story Summary - tiny Worker RPC helper

import { createAbortError } from '../../../../shared/common/abort-utils.js';

function abortErrorFromSignal(signal) {
    return signal?.reason?.name === 'AbortError'
        ? signal.reason
        : createAbortError('RecallRuntime request aborted');
}

export function createWorkerRpc(worker, options = {}) {
    let nextId = 1;
    const pending = new Map();
    const onLog = typeof options?.onLog === "function" ? options.onLog : null;

    worker.onmessage = (event) => {
        const data = event.data || {};
        if (data.type === "__log") {
            try { onLog?.(data.payload || {}); } catch {}
            return;
        }
        if (!data.id || !pending.has(data.id)) return;

        const item = pending.get(data.id);
        pending.delete(data.id);
        item.cleanup();

        if (data.ok) {
            item.resolve(data.result);
        } else {
            item.reject(new Error(data.error || 'RecallRuntime worker request failed'));
        }
    };

    worker.onerror = (event) => {
        const error = new Error(event?.message || 'RecallRuntime worker error');
        for (const item of pending.values()) {
            item.cleanup();
            item.reject(error);
        }
        pending.clear();
    };

    function call(type, payload = {}, options = {}) {
        const id = nextId++;
        const timeoutMs = Math.max(1000, Number(options.timeoutMs || 30000));
        const signal = options.signal || null;
        if (signal?.aborted) return Promise.reject(abortErrorFromSignal(signal));

        return new Promise((resolve, reject) => {
            let timer = null;
            let onAbort = null;
            const cleanup = () => {
                clearTimeout(timer);
                signal?.removeEventListener('abort', onAbort);
            };
            timer = setTimeout(() => {
                pending.delete(id);
                cleanup();
                reject(new Error(`RecallRuntime worker timeout: ${type}`));
            }, timeoutMs);

            onAbort = () => {
                if (!pending.delete(id)) return;
                cleanup();
                reject(abortErrorFromSignal(signal));
            };
            pending.set(id, { resolve, reject, cleanup });
            signal?.addEventListener('abort', onAbort, { once: true });
            if (signal?.aborted) {
                onAbort();
                return;
            }
            worker.postMessage({ id, type, payload });
        });
    }

    function rejectAll(error) {
        for (const item of pending.values()) {
            item.cleanup();
            item.reject(error);
        }
        pending.clear();
    }

    return { call, rejectAll };
}
