let replayContext = {
    chatId: null,
    chat: [],
    name1: '用户',
    name2: '角色',
    groupId: null,
    characterId: null,
    saveMetadata: async () => {
        __saveMetadataCallCount += 1;
        __immediateMetadataSaveCallCount += 1;
    },
};

export let extension_settings = {};
export let __saveMetadataCallCount = 0;
export let __immediateMetadataSaveCallCount = 0;
export let __debouncedMetadataSaveCallCount = 0;

export function getContext() {
    return replayContext;
}

export function saveMetadataDebounced() {
    __saveMetadataCallCount += 1;
    __debouncedMetadataSaveCallCount += 1;
}

export function __setReplayContext(nextContext) {
    replayContext = {
        ...replayContext,
        ...(nextContext || {}),
    };
}

export function __setExtensionSettings(nextSettings) {
    extension_settings = nextSettings || {};
}

export function __resetMetadataSaveCount() {
    __saveMetadataCallCount = 0;
    __immediateMetadataSaveCallCount = 0;
    __debouncedMetadataSaveCallCount = 0;
}
