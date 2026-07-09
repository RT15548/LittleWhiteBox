export const AGENT_MESSAGE_WINDOW_DEFAULT = 5;
export const AGENT_MESSAGE_WINDOW_CHUNK = 20;

function normalizePositiveInteger(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function normalizeNonNegativeInteger(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

export function getMessageWindow(state = {}, totalItems = 0, options = {}) {
    const total = Math.max(0, Number(totalItems) || 0);
    const defaultLimit = normalizePositiveInteger(options.defaultLimit, AGENT_MESSAGE_WINDOW_DEFAULT);
    const previousTotal = normalizeNonNegativeInteger(state.uiMessageWindowTotal, total);
    let rawLimit = normalizePositiveInteger(state.uiMessageWindowLimit, defaultLimit);
    if (options.preserveStartOnGrow && total > previousTotal) {
        rawLimit += total - previousTotal;
    }
    const limit = Math.min(Math.max(defaultLimit, rawLimit), Math.max(total, defaultLimit));
    state.uiMessageWindowLimit = limit;
    state.uiMessageWindowTotal = total;

    const startIndex = Math.max(0, total - limit);
    return {
        startIndex,
        hiddenBefore: startIndex,
        visibleCount: total - startIndex,
        limit,
        total,
    };
}

export function expandMessageWindow(state = {}, totalItems = 0, options = {}) {
    const total = Math.max(0, Number(totalItems) || 0);
    const current = getMessageWindow(state, total, options);
    if (!current.hiddenBefore) return false;
    const chunk = normalizePositiveInteger(options.chunk, AGENT_MESSAGE_WINDOW_CHUNK);
    state.uiMessageWindowLimit = Math.min(total, current.limit + chunk);
    return true;
}

export function resetMessageWindow(state = {}, options = {}) {
    state.uiMessageWindowLimit = normalizePositiveInteger(options.defaultLimit, AGENT_MESSAGE_WINDOW_DEFAULT);
    state.uiMessageWindowTotal = undefined;
}
