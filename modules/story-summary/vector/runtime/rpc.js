// Story Summary - tiny Worker RPC helper

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
        clearTimeout(item.timer);

        if (data.ok) {
            item.resolve(data.result);
        } else {
            item.reject(new Error(data.error || 'RecallRuntime worker request failed'));
        }
    };

    worker.onerror = (event) => {
        const error = new Error(event?.message || 'RecallRuntime worker error');
        for (const item of pending.values()) {
            clearTimeout(item.timer);
            item.reject(error);
        }
        pending.clear();
    };

    function call(type, payload = {}, options = {}) {
        const id = nextId++;
        const timeoutMs = Math.max(1000, Number(options.timeoutMs || 30000));

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                pending.delete(id);
                reject(new Error(`RecallRuntime worker timeout: ${type}`));
            }, timeoutMs);

            pending.set(id, { resolve, reject, timer });
            worker.postMessage({ id, type, payload });
        });
    }

    function rejectAll(error) {
        for (const item of pending.values()) {
            clearTimeout(item.timer);
            item.reject(error);
        }
        pending.clear();
    }

    return { call, rejectAll };
}
