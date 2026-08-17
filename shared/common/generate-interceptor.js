// Plugin-level generate_interceptor dispatcher.
//
// manifest.json exposes a single global entry (`xiaobaixGenerateInterceptor`).
// Every module that needs the host's pre-prompt hook registers here instead
// of overwriting that global, so multiple consumers (Draw, Story Summary,
// ...) can coexist with stable ordering. Handlers run in explicit order and
// are awaited; a handler calling abort() stops the remaining ones.

import { xbLog } from '../../core/debug-core.js';

const MODULE_ID = 'generate-interceptor';

export const GENERATE_INTERCEPTOR_ORDER = Object.freeze({
    DRAW: 100,
    STORY_SUMMARY: 200,
    ENA_PLANNER: 300,
});

const handlers = new Map();
let installedEntry = null;
let nextSequence = 0;
let activeDispatch = null;

async function dispatch(chat, contextSize, abort, type) {
    activeDispatch?.abort(true);

    let aborted = false;
    const controller = new AbortController();
    const wrappedAbort = (immediately) => {
        if (aborted) return;
        aborted = true;
        controller.abort();
        abort(immediately);
    };
    const runContext = Object.freeze({
        abort: wrappedAbort,
        results: new Map(),
        signal: controller.signal,
    });
    const dispatchRun = { abort: wrappedAbort };
    activeDispatch = dispatchRun;

    try {
        const orderedHandlers = [...handlers.entries()].sort(([, a], [, b]) => (
            a.order - b.order || a.sequence - b.sequence
        ));
        for (const [id, entry] of orderedHandlers) {
            if (handlers.get(id) !== entry) continue;
            try {
                const result = await entry.handler(chat, contextSize, wrappedAbort, type, runContext);
                runContext.results.set(id, result);
            } catch (error) {
                xbLog.warn(MODULE_ID, `interceptor handler failed: ${id}`, error);
            }
            if (aborted) break;
        }
    } finally {
        if (activeDispatch === dispatchRun) activeDispatch = null;
    }
}

function ensureInstalled() {
    const entry = (chat, contextSize, abort, type) => dispatch(chat, contextSize, abort, type);
    if (typeof globalThis.xiaobaixGenerateInterceptor === 'function'
        && globalThis.xiaobaixGenerateInterceptor._lwbDispatcher === true) {
        return;
    }
    Object.defineProperty(entry, '_lwbDispatcher', {
        value: true,
        enumerable: false,
        configurable: false,
        writable: false,
    });
    installedEntry = entry;
    globalThis.xiaobaixGenerateInterceptor = entry;
}

export function registerGenerateInterceptor(id, handler, order = 0) {
    if (typeof handler !== 'function') {
        throw new Error(`generate interceptor '${id}' must be a function`);
    }
    const key = String(id);
    const existing = handlers.get(key);
    const normalizedOrder = Number(order);
    handlers.set(key, {
        handler,
        order: Number.isFinite(normalizedOrder) ? normalizedOrder : 0,
        sequence: existing?.sequence ?? nextSequence++,
    });
    ensureInstalled();
}

export function unregisterGenerateInterceptor(id) {
    handlers.delete(String(id));
    if (!handlers.size && globalThis.xiaobaixGenerateInterceptor === installedEntry) {
        delete globalThis.xiaobaixGenerateInterceptor;
        installedEntry = null;
    }
}
