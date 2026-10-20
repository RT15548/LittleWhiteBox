/** The summary iframe and its host share these routes; no domain state lives here. */
export const MEMORY_CHAT_MESSAGES = Object.freeze({
    query: 'MEMORY_CHAT_QUERY',
    send: 'MEMORY_CHAT_SEND',
    draft: 'MEMORY_CHAT_DRAFT',
    regenerate: 'MEMORY_CHAT_REGENERATE',
    stop: 'MEMORY_CHAT_STOP',
    clear: 'MEMORY_CHAT_CLEAR',
    takeover: 'MEMORY_CHAT_TAKEOVER',
    state: 'MEMORY_CHAT_STATE',
});
