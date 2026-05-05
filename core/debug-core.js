let eventCenterPromise = null;

async function getEventCenter() {
    if (!eventCenterPromise) {
        eventCenterPromise = import("./event-manager.js")
            .then((module) => module.EventCenter)
            .catch(() => null);
    }
    return await eventCenterPromise;
}

const DEFAULT_MAX_LOGS = 200;

function now() {
    return Date.now();
}

function safeStringify(value) {
    try {
        if (typeof value === "string") return value;
        return JSON.stringify(value);
    } catch {
        try {
            return String(value);
        } catch {
            return "[unstringifiable]";
        }
    }
}

function errorToStack(err) {
    try {
        if (!err) return null;
        if (typeof err === "string") return err;
        if (err && typeof err.stack === "string") return err.stack;
        return safeStringify(err);
    } catch {
        return null;
    }
}

const CONSOLE_PREFIX_RULES = [
    { prefix: "[NovelDraw]", module: "novelDraw" },
    { prefix: "[LLM-Service]", module: "novelDrawLlm" },
    { prefix: "[GalleryCache]", module: "novelDrawGallery" },
    { prefix: "[CloudPresets]", module: "novelDrawCloudPresets" },
    { prefix: "[Live]", module: "novelDrawLive" },
    { prefix: "[recall-runtime]", module: "recall-runtime" },
    { prefix: "[recall-runtime-worker]", module: "recall-runtime-worker" },
    { prefix: "[SiliconFlow]", module: "storySummarySiliconFlow" },
];

function getInterceptedConsoleEntry(args) {
    try {
        const parts = Array.isArray(args) ? args : [];
        const msg = parts.map(a => (typeof a === "string" ? a : safeStringify(a))).join(" ");
        const matched = CONSOLE_PREFIX_RULES.find(rule => msg.startsWith(rule.prefix));
        if (!matched) return null;
        return {
            moduleId: matched.module,
            message: msg,
        };
    } catch {
        return null;
    }
}

class LoggerCore {
    constructor() {
        this._enabled = false;
        this._buffer = [];
        this._maxSize = DEFAULT_MAX_LOGS;
        this._seq = 0;
        this._originalConsole = null;
        this._originalOnError = null;
        this._originalOnUnhandledRejection = null;
        this._windowHooksMounted = false;
        this._consoleHooksMounted = false;
    }

    setMaxSize(n) {
        const v = Number.parseInt(n, 10);
        if (Number.isFinite(v) && v > 0) this._maxSize = v;
        if (this._buffer.length > this._maxSize) {
            this._buffer.splice(0, this._buffer.length - this._maxSize);
        }
    }

    isEnabled() {
        return !!this._enabled;
    }

    enable() {
        if (this._enabled) return;
        this._enabled = true;
        this._mountWindowHooks();
        this._mountConsoleHooks();
    }

    disable(options = {}) {
        const shouldClear = options?.clear === true;
        this._enabled = false;
        if (shouldClear) {
            this.clear();
        }
        this._unmountWindowHooks();
    }

    clear() {
        this._buffer.length = 0;
    }

    getAll() {
        return this._buffer.slice();
    }

    export() {
        return JSON.stringify(
            {
                version: 1,
                exportedAt: now(),
                maxSize: this._maxSize,
                logs: this.getAll(),
            },
            null,
            2
        );
    }

    _push(entry) {
        if (!this._enabled) return;
        this._buffer.push(entry);
        if (this._buffer.length > this._maxSize) {
            this._buffer.splice(0, this._buffer.length - this._maxSize);
        }
    }

    _log(level, moduleId, message, err) {
        if (!this._enabled) return;
        const id = ++this._seq;
        const timestamp = now();
        const stack = err ? errorToStack(err) : null;
        this._push({
            id,
            timestamp,
            level,
            module: moduleId || "unknown",
            message: typeof message === "string" ? message : safeStringify(message),
            stack,
        });
    }

    info(moduleId, ...args) {
        const msg = args.map(a => (typeof a === 'string' ? a : safeStringify(a))).join(' ');
        this._log('info', moduleId, msg, null);
    }
    warn(moduleId, ...args) {
        const msg = args.map(a => (typeof a === 'string' ? a : safeStringify(a))).join(' ');
        this._log('warn', moduleId, msg, null);
    }
    error(moduleId, message, err) {
        this._log("error", moduleId, message, err || null);
    }

    _mountWindowHooks() {
        if (this._windowHooksMounted) return;
        this._windowHooksMounted = true;
        if (typeof window !== "undefined") {
            try {
                this._originalOnError = window.onerror;
            } catch {}
            try {
                this._originalOnUnhandledRejection = window.onunhandledrejection;
            } catch {}

            try {
                window.onerror = (message, source, lineno, colno, error) => {
                    try {
                        const loc = source ? `${source}:${lineno || 0}:${colno || 0}` : "";
                        this.error("window", `${String(message || "error")} ${loc}`.trim(), error || null);
                    } catch {}
                    try {
                        if (typeof this._originalOnError === "function") {
                            return this._originalOnError(message, source, lineno, colno, error);
                        }
                    } catch {}
                    return false;
                };
            } catch {}

            try {
                window.onunhandledrejection = (event) => {
                    try {
                        const reason = event?.reason;
                        this.error("promise", "Unhandled promise rejection", reason || null);
                    } catch {}
                    try {
                        if (typeof this._originalOnUnhandledRejection === "function") {
                            return this._originalOnUnhandledRejection(event);
                        }
                    } catch {}
                    return undefined;
                };
            } catch {}
        }

    }

    _mountConsoleHooks() {
        if (this._consoleHooksMounted) return;
        this._consoleHooksMounted = true;

        if (typeof console !== "undefined" && console) {
            this._originalConsole = this._originalConsole || {
                log: console.log?.bind(console),
                info: console.info?.bind(console),
                warn: console.warn?.bind(console),
                error: console.error?.bind(console),
            };

            try {
                if (typeof this._originalConsole.log === "function") {
                    console.log = (...args) => {
                        try {
                            const intercepted = getInterceptedConsoleEntry(args);
                            if (intercepted) {
                                if (this._enabled) this.info(intercepted.moduleId, intercepted.message);
                                return;
                            }
                        } catch {}
                        return this._originalConsole.log(...args);
                    };
                }
            } catch {}

            try {
                if (typeof this._originalConsole.info === "function") {
                    console.info = (...args) => {
                        try {
                            const intercepted = getInterceptedConsoleEntry(args);
                            if (intercepted) {
                                if (this._enabled) this.info(intercepted.moduleId, intercepted.message);
                                return;
                            }
                        } catch {}
                        return this._originalConsole.info(...args);
                    };
                }
            } catch {}

            try {
                if (typeof this._originalConsole.warn === "function") {
                    console.warn = (...args) => {
                        try {
                            const intercepted = getInterceptedConsoleEntry(args);
                            if (intercepted) {
                                if (this._enabled) this.warn(intercepted.moduleId, intercepted.message);
                                return;
                            }
                            const msg = args.map(a => (typeof a === "string" ? a : safeStringify(a))).join(" ");
                            this.warn("console", msg);
                        } catch {}
                        return this._originalConsole.warn(...args);
                    };
                }
            } catch {}

            try {
                if (typeof this._originalConsole.error === "function") {
                    console.error = (...args) => {
                        try {
                            const intercepted = getInterceptedConsoleEntry(args);
                            if (intercepted) {
                                if (this._enabled) this.error(intercepted.moduleId, intercepted.message, null);
                                return;
                            }
                            const msg = args.map(a => (typeof a === "string" ? a : safeStringify(a))).join(" ");
                            this.error("console", msg, null);
                        } catch {}
                        return this._originalConsole.error(...args);
                    };
                }
            } catch {}
        }
    }

    _unmountWindowHooks() {
        if (!this._windowHooksMounted) return;
        this._windowHooksMounted = false;
        if (typeof window !== "undefined") {
            try {
                if (this._originalOnError !== null && this._originalOnError !== undefined) {
                    window.onerror = this._originalOnError;
                } else {
                    window.onerror = null;
                }
            } catch {}
            try {
                if (this._originalOnUnhandledRejection !== null && this._originalOnUnhandledRejection !== undefined) {
                    window.onunhandledrejection = this._originalOnUnhandledRejection;
                } else {
                    window.onunhandledrejection = null;
                }
            } catch {}
        }
    }

    ensureConsoleFilters() {
        this._mountConsoleHooks();
    }
}

const logger = new LoggerCore();

export const xbLog = {
    enable: () => logger.enable(),
    disable: (options) => logger.disable(options),
    isEnabled: () => logger.isEnabled(),
    setMaxSize: (n) => logger.setMaxSize(n),
    info: (moduleId, message) => logger.info(moduleId, message),
    warn: (moduleId, message) => logger.warn(moduleId, message),
    error: (moduleId, message, err) => logger.error(moduleId, message, err),
    getAll: () => logger.getAll(),
    clear: () => logger.clear(),
    export: () => logger.export(),
};

logger.ensureConsoleFilters();

export const CacheRegistry = (() => {
    const _registry = new Map();

    function register(moduleId, cacheInfo) {
        if (!moduleId || !cacheInfo || typeof cacheInfo !== "object") return;
        _registry.set(String(moduleId), cacheInfo);
    }

    function unregister(moduleId) {
        if (!moduleId) return;
        _registry.delete(String(moduleId));
    }

    function getStats() {
        const out = [];
        for (const [moduleId, info] of _registry.entries()) {
            let size = null;
            let bytes = null;
            let name = null;
            let hasDetail = false;
            try { name = info?.name || moduleId; } catch { name = moduleId; }
            try { size = typeof info?.getSize === "function" ? info.getSize() : null; } catch { size = null; }
            try { bytes = typeof info?.getBytes === "function" ? info.getBytes() : null; } catch { bytes = null; }
            try { hasDetail = typeof info?.getDetail === "function"; } catch { hasDetail = false; }
            out.push({ moduleId, name, size, bytes, hasDetail });
        }
        return out;
    }

    function getDetail(moduleId) {
        const info = _registry.get(String(moduleId));
        if (!info || typeof info.getDetail !== "function") return null;
        try {
            return info.getDetail();
        } catch {
            return null;
        }
    }

    function clear(moduleId) {
        const info = _registry.get(String(moduleId));
        if (!info || typeof info.clear !== "function") return false;
        try {
            info.clear();
            return true;
        } catch {
            return false;
        }
    }

    function clearAll() {
        const results = {};
        for (const moduleId of _registry.keys()) {
            results[moduleId] = clear(moduleId);
        }
        return results;
    }

    return { register, unregister, getStats, getDetail, clear, clearAll };
})();

export function enableDebugMode() {
    getEventCenter().then((EventCenter) => {
        try { EventCenter?.enableDebug?.(); } catch {}
    });
}

export function disableDebugMode() {
    getEventCenter().then((EventCenter) => {
        try { EventCenter?.disableDebug?.(); } catch {}
    });
}

export function enablePersistentDebugLogging() {
    xbLog.enable();
}

export function disablePersistentDebugLogging(options = {}) {
    xbLog.disable(options);
}

if (typeof window !== "undefined") {
    window.xbLog = xbLog;
    window.xbCacheRegistry = CacheRegistry;
}

