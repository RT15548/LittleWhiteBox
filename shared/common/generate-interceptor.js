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
    XIAOBAI_OS_SHOP: 400,
    XIAOBAI_OS_MAP: 410,
    XIAOBAI_OS_TASKS: 420,
    XIAOBAI_OS_WORLD: 430,
    XIAOBAI_OS_DICE: 440,
});

const handlers = new Map();
const observers = new Set();
let installedEntry = null;
let nextSequence = 0;

function notifyObservers(phase, id, type, run, detail = null) {
    for (const observe of observers) {
        try {
            observe({ phase, id, type, run, detail });
        } catch (error) {
            xbLog.warn(MODULE_ID, 'interceptor observer failed', error);
        }
    }
}

// Read-only lifecycle signal. Observers cannot change handler order or results.
export function observeGenerateInterceptors(observe) {
    observers.add(observe);
    return () => observers.delete(observe);
}

async function dispatch(chat, contextSize, abort, type) {
    let aborted = false;
    const controller = new AbortController();
    const wrappedAbort = (immediately) => {
        if (aborted) return;
        aborted = true;
        controller.abort();
        abort(immediately);
    };
    const dispatchRun = { abort: wrappedAbort, signal: controller.signal };
    const runContext = Object.freeze({
        abort: wrappedAbort,
        results: new Map(),
        signal: controller.signal,
        reportProgress: detail => notifyObservers('handler-progress', null, type, dispatchRun, detail),
    });

    try {
        notifyObservers('dispatch-start', null, type, dispatchRun);
        const orderedHandlers = [...handlers.entries()].sort(([, a], [, b]) => (
            a.order - b.order || a.sequence - b.sequence
        ));
        for (const [id, entry] of orderedHandlers) {
            if (handlers.get(id) !== entry) continue;
            notifyObservers('handler-start', id, type, dispatchRun);
            try {
                const result = await entry.handler(chat, contextSize, wrappedAbort, type, runContext);
                runContext.results.set(id, result);
            } catch (error) {
                xbLog.warn(MODULE_ID, `interceptor handler failed: ${id}`, error);
            } finally {
                notifyObservers('handler-end', id, type, dispatchRun);
            }
            if (aborted) break;
        }
    } finally {
        notifyObservers('dispatch-end', null, type, dispatchRun);
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
