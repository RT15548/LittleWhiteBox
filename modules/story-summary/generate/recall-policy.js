// One foreground policy for prefetch, injection and cross-generation recovery.
const RECALL_TYPES = new Set(['normal', 'regenerate', 'swipe', 'continue', 'impersonate']);

export function usesStoryRecall(type) {
    return RECALL_TYPES.has(type || 'normal');
}
