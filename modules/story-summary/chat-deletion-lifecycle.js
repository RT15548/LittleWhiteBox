import { event_types } from '../../../../../../script.js';
import { createModuleEvents } from '../../core/event-manager.js';

const MODULE_ID = 'storySummary:chat-deletion';

export function initChatDeletionLifecycle(onChatDeleted) {
    const deletionEvents = createModuleEvents(MODULE_ID);
    const register = () => {
        if (deletionEvents.count()) return;
        deletionEvents.on(event_types.CHAT_DELETED, onChatDeleted);
        deletionEvents.on(event_types.GROUP_CHAT_DELETED, onChatDeleted);
        window.registerModuleCleanup?.(MODULE_ID, () => deletionEvents.cleanup());
    };

    // This page-lifetime bridge survives EventCenter.cleanupAll(), so a master
    // off/on restores deletion handling even while summary generation is off.
    document.addEventListener('xiaobaixEnabledChanged', event => {
        if (event.detail?.enabled) register();
    });
    if (window.isXiaobaixEnabled !== false) register();
}
