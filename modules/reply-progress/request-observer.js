// Typed settings are public on ST 1.14/1.18. They identify preparation, not
// actual network dispatch: another listener may still be doing work. Never
// replace fetch, retain prompts or touch request parameters to refine a hint.
export function observeHostRequest({ events, eventTypes, type, onRequest }) {
    function prepared(data) {
        if (String(data.type || 'normal') === type) onRequest();
    }

    events.makeFirst(eventTypes.CHAT_COMPLETION_SETTINGS_READY, prepared);
    return () => events.removeListener(eventTypes.CHAT_COMPLETION_SETTINGS_READY, prepared);
}
