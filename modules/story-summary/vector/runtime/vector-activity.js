import { getVectorWriteState, observeVectorWrites } from './maintenance-coordinator.js';

// Live stages only. A query owns its bounded observation window and releases
// its observer in finally. Nothing is persisted in chat, config or IndexedDB.
const active = new Map();
const observers = new Set();
let nextId = 1;
const TRACE_LIMIT = 100;

function originOf(api) {
    try { return new URL(api?.url).origin; } catch { return null; }
}

function publish() { for (const observer of observers) observer(); }

export async function trackVectorActivity({ chatId, phase, api = null, unit }, work) {
    const id = nextId++;
    const state = { id, chatId, phase, unit, origin: originOf(api), total: null, completed: 0, deferredUnits: 0, activeUnits: 0, activeFloors: [], state: 'preparing', outcome: null };
    active.set(id, state);
    publish();
    try {
        const result = await work({
            update({ total = state.total, completed = state.completed, deferredUnits = state.deferredUnits, activeUnits = state.activeUnits, activeFloors = state.activeFloors, state: nextState = state.state }) {
                Object.assign(state, { total, completed, deferredUnits, activeUnits, activeFloors, state: nextState });
                publish();
            },
        });
        state.outcome = { code: result?.code ?? null, success: result?.success ?? null, cancelled: result?.cancelled ?? null, failed: result?.failed ?? null };
        return result;
    } catch (error) {
        state.outcome = { errorName: error.name, code: error.code ?? null };
        throw error;
    } finally {
        Object.assign(state, { state: 'finished', activeUnits: 0, activeFloors: [] });
        publish();
        active.delete(id);
        publish();
    }
}

export function observeVectorActivity(api) {
    const queryOrigin = originOf(api);
    const startedAt = performance.now();
    const timeline = [];
    let dropped = 0;
    const capture = () => {
        const writer = getVectorWriteState();
        const entry = {
            elapsedMs: Math.round(performance.now() - startedAt),
            writer: writer.activeWrite,
            queuedWrites: writer.pendingWrites,
            activities: [...active.values()].map(state => ({
                ...state,
                remaining: state.total === null ? null : Math.max(0, state.total - state.completed),
                sameOrigin: queryOrigin && state.origin ? queryOrigin === state.origin : null,
            })),
        };
        if (timeline.length >= TRACE_LIMIT) { timeline.splice(1, 1); dropped++; }
        timeline.push(entry);
    };
    capture();
    observers.add(capture);
    const stopWatchingWrites = observeVectorWrites(capture);
    return {
        finish() {
            capture();
            observers.delete(capture);
            stopWatchingWrites();
            return { queryOrigin, timeline, dropped };
        },
    };
}
