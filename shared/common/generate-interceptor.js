// Plugin-level generate_interceptor dispatcher.
//
// manifest.json exposes a single global entry (`xiaobaixGenerateInterceptor`).
// Every module that needs the host's pre-prompt hook registers here instead
// of overwriting that global, so multiple consumers (Draw, Story Summary,
// ...) can coexist with stable ordering. Handlers run in registration order
// and are awaited; a handler calling abort(true) stops the remaining ones.

import { xbLog } from '../../core/debug-core.js';

const MODULE_ID = 'generate-interceptor';

const handlers = new Map();
let installedEntry = null;

async function dispatch(chat, contextSize, abort, type) {
    let immediate = false;
    const wrappedAbort = (immediately) => {
        if (immediate) return;
        if (immediately === true) immediate = true;
        abort(immediately);
    };
    for (const [id, handler] of handlers) {
        try {
            await handler(chat, contextSize, wrappedAbort, type);
        } catch (error) {
            xbLog.warn(MODULE_ID, `interceptor handler failed: ${id}`, error);
        }
        if (immediate) break;
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

export function registerGenerateInterceptor(id, handler) {
    if (typeof handler !== 'function') {
        throw new Error(`generate interceptor '${id}' must be a function`);
    }
    handlers.set(String(id), handler);
    ensureInstalled();
}

export function unregisterGenerateInterceptor(id) {
    handlers.delete(String(id));
    if (!handlers.size && globalThis.xiaobaixGenerateInterceptor === installedEntry) {
        delete globalThis.xiaobaixGenerateInterceptor;
        installedEntry = null;
    }
}
