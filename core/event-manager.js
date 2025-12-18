import { eventSource, event_types } from "../../../../../script.js";

const registry = new Map();
const customEvents = new Map();
const handlerWrapperMap = new WeakMap();

export const EventCenter = {
    _debugEnabled: false,
    _eventHistory: [],
    _maxHistory: 100,
    _historySeq: 0,

    enableDebug() {
        this._debugEnabled = true;
    },

    disableDebug() {
        this._debugEnabled = false;
        this.clearHistory();
    },

    getEventHistory() {
        return this._eventHistory.slice();
    },

    clearHistory() {
        this._eventHistory.length = 0;
    },

    _pushHistory(type, eventName, triggerModule, data) {
        if (!this._debugEnabled) return;
        try {
            const now = Date.now();
            const last = this._eventHistory[this._eventHistory.length - 1];
            if (
                last &&
                last.type === type &&
                last.eventName === eventName &&
                now - last.timestamp < 100
            ) {
                last.repeatCount = (last.repeatCount || 1) + 1;
                return;
            }

            const id = ++this._historySeq;
            let dataSummary = null;
            try {
                if (data === undefined) {
                    dataSummary = "undefined";
                } else if (data === null) {
                    dataSummary = "null";
                } else if (typeof data === "string") {
                    dataSummary = data.length > 120 ? data.slice(0, 120) + "…" : data;
                } else if (typeof data === "number" || typeof data === "boolean") {
                    dataSummary = String(data);
                } else if (typeof data === "object") {
                    const keys = Object.keys(data).slice(0, 6);
                    dataSummary = `{ ${keys.join(", ")}${keys.length < Object.keys(data).length ? ", …" : ""} }`;
                } else {
                    dataSummary = String(data).slice(0, 80);
                }
            } catch {
                dataSummary = "[unstringifiable]";
            }
            this._eventHistory.push({
                id,
                timestamp: now,
                type,
                eventName,
                triggerModule,
                dataSummary,
                repeatCount: 1,
            });
            if (this._eventHistory.length > this._maxHistory) {
                this._eventHistory.splice(0, this._eventHistory.length - this._maxHistory);
            }
        } catch {}
    },

    on(moduleId, eventType, handler) {
        if (!moduleId || !eventType || typeof handler !== "function") return;
        if (!registry.has(moduleId)) {
            registry.set(moduleId, []);
        }
        const self = this;
        const wrappedHandler = function (...args) {
            if (self._debugEnabled) {
                self._pushHistory("ST_EVENT", eventType, moduleId, args[0]);
            }
            return handler.apply(this, args);
        };
        handlerWrapperMap.set(handler, wrappedHandler);
        try {
            eventSource.on(eventType, wrappedHandler);
            registry.get(moduleId).push({ eventType, handler, wrappedHandler });
        } catch (e) {
            console.error(`[EventCenter] Failed to register ${eventType} for ${moduleId}:`, e);
        }
    },

    onMany(moduleId, eventTypes, handler) {
        if (!Array.isArray(eventTypes)) return;
        eventTypes.filter(Boolean).forEach((type) => this.on(moduleId, type, handler));
    },

    off(moduleId, eventType, handler) {
        try {
            const listeners = registry.get(moduleId);
            if (!listeners) return;
            const idx = listeners.findIndex((l) => l.eventType === eventType && l.handler === handler);
            if (idx === -1) return;
            const entry = listeners[idx];
            eventSource.removeListener(eventType, entry.wrappedHandler);
            listeners.splice(idx, 1);
            handlerWrapperMap.delete(handler);
        } catch {}
    },

    cleanup(moduleId) {
        const listeners = registry.get(moduleId);
        if (!listeners) return;
        listeners.forEach(({ eventType, handler, wrappedHandler }) => {
            try {
                eventSource.removeListener(eventType, wrappedHandler);
                handlerWrapperMap.delete(handler);
            } catch {}
        });
        registry.delete(moduleId);
    },

    cleanupAll() {
        for (const moduleId of registry.keys()) {
            this.cleanup(moduleId);
        }
        customEvents.clear();
    },

    count(moduleId) {
        return registry.get(moduleId)?.length || 0;
    },

    /**
     * 获取统计：每个模块注册了多少监听器
     */
    stats() {
        const stats = {};
        for (const [moduleId, listeners] of registry) {
            stats[moduleId] = listeners.length;
        }
        return stats;
    },

    /**
     * 获取详细信息：每个模块监听了哪些具体事件
     */
    statsDetail() {
        const detail = {};
        for (const [moduleId, listeners] of registry) {
            const eventCounts = {};
            for (const l of listeners) {
                const t = l.eventType || "unknown";
                eventCounts[t] = (eventCounts[t] || 0) + 1;
            }
            detail[moduleId] = {
                total: listeners.length,
                events: eventCounts,
            };
        }
        return detail;
    },

    emit(eventName, data) {
        this._pushHistory("CUSTOM", eventName, null, data);
        const handlers = customEvents.get(eventName);
        if (!handlers) return;
        handlers.forEach(({ handler }) => {
            try {
                handler(data);
            } catch {}
        });
    },

    subscribe(moduleId, eventName, handler) {
        if (!customEvents.has(eventName)) {
            customEvents.set(eventName, []);
        }
        customEvents.get(eventName).push({ moduleId, handler });
    },

    unsubscribe(moduleId, eventName) {
        const handlers = customEvents.get(eventName);
        if (handlers) {
            const filtered = handlers.filter((h) => h.moduleId !== moduleId);
            if (filtered.length) {
                customEvents.set(eventName, filtered);
            } else {
                customEvents.delete(eventName);
            }
        }
    },
};

export function createModuleEvents(moduleId) {
    return {
        on: (eventType, handler) => EventCenter.on(moduleId, eventType, handler),
        onMany: (eventTypes, handler) => EventCenter.onMany(moduleId, eventTypes, handler),
        off: (eventType, handler) => EventCenter.off(moduleId, eventType, handler),
        cleanup: () => EventCenter.cleanup(moduleId),
        count: () => EventCenter.count(moduleId),
        emit: (eventName, data) => EventCenter.emit(eventName, data),
        subscribe: (eventName, handler) => EventCenter.subscribe(moduleId, eventName, handler),
        unsubscribe: (eventName) => EventCenter.unsubscribe(moduleId, eventName),
    };
}

if (typeof window !== "undefined") {
    window.xbEventCenter = {
        stats: () => EventCenter.stats(),
        statsDetail: () => EventCenter.statsDetail(),
        modules: () => Array.from(registry.keys()),
        history: () => EventCenter.getEventHistory(),
        clearHistory: () => EventCenter.clearHistory(),
        detail: (moduleId) => {
            const listeners = registry.get(moduleId);
            if (!listeners) return `模块 "${moduleId}" 未注册`;
            return listeners.map((l) => l.eventType).join(", ");
        },
        help: () =>
            console.log(`
📊 小白X 事件管理器调试命令:
  xbEventCenter.stats()          - 查看所有模块的事件数量
  xbEventCenter.statsDetail()    - 查看所有模块监听的具体事件
  xbEventCenter.modules()        - 列出所有已注册模块
  xbEventCenter.history()        - 查看事件触发历史
  xbEventCenter.clearHistory()   - 清空事件历史
  xbEventCenter.detail('模块名') - 查看模块监听的事件类型
        `),
    };
}

export { event_types };
