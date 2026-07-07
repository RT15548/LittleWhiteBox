export const AGENT_MESSAGE_WINDOW_DEFAULT = 5;
export const AGENT_MESSAGE_WINDOW_CHUNK = 20;

function normalizePositiveInteger(value: unknown, fallback: number) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

export function normalizeHiddenOutsideCount(value: unknown, fallback = AGENT_MESSAGE_WINDOW_DEFAULT) {
    const number = Number(value);
    if (!Number.isFinite(number)) {return Math.min(20, Math.max(1, Math.floor(fallback)));}
    return Math.min(20, Math.max(1, Math.floor(number)));
}

export function normalizeMessageLoadBatchSize(value: unknown, fallback = AGENT_MESSAGE_WINDOW_CHUNK) {
    const number = Number(value);
    if (!Number.isFinite(number)) {return Math.min(50, Math.max(1, Math.floor(fallback)));}
    return Math.min(50, Math.max(1, Math.floor(number)));
}

export function getMessageWindow(state: { uiMessageWindowLimit?: number } = {}, totalItems = 0, options: {
    defaultLimit?: number;
} = {}) {
    const total = Math.max(0, Number(totalItems) || 0);
    const defaultLimit = normalizeHiddenOutsideCount(options.defaultLimit, AGENT_MESSAGE_WINDOW_DEFAULT);
    const rawLimit = normalizePositiveInteger(state.uiMessageWindowLimit, defaultLimit);
    const limit = Math.min(Math.max(defaultLimit, rawLimit), Math.max(total, defaultLimit));
    state.uiMessageWindowLimit = limit;

    const startIndex = Math.max(0, total - limit);
    return {
        startIndex,
        hiddenBefore: startIndex,
        visibleCount: total - startIndex,
        limit,
        total,
    };
}

export function expandMessageWindow(state: { uiMessageWindowLimit?: number } = {}, totalItems = 0, options: {
    defaultLimit?: number;
    chunk?: number;
} = {}) {
    const total = Math.max(0, Number(totalItems) || 0);
    const current = getMessageWindow(state, total, options);
    if (!current.hiddenBefore) {return false;}
    const chunk = normalizeMessageLoadBatchSize(options.chunk, AGENT_MESSAGE_WINDOW_CHUNK);
    state.uiMessageWindowLimit = Math.min(total, current.limit + chunk);
    return true;
}

export function resetMessageWindow(state: { uiMessageWindowLimit?: number } = {}, options: {
    defaultLimit?: number;
} = {}) {
    state.uiMessageWindowLimit = normalizeHiddenOutsideCount(options.defaultLimit, AGENT_MESSAGE_WINDOW_DEFAULT);
}
