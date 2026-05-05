export let chat_metadata = {};
export let isChatSaving = false;
export const event_types = {};
export const eventSource = {
    on() {},
    removeListener() {},
    emit() {},
};

export function __setChatMetadata(nextMetadata) {
    chat_metadata = nextMetadata || {};
}

export function getRequestHeaders() {
    return {};
}
