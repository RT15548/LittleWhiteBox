import { event_types } from '../../../../../../script.js';
import { getContext } from '../../../../../extensions.js';
import { createModuleEvents } from '../../core/event-manager.js';
import { getChatIdentity } from './data/chat-identity.js';
import { hasStoredEmbeddings, forgetStoredEmbeddings } from './vector/runtime/embedding-receipts.js';

const MODULE_ID = 'storySummary:chat-deletion';
const DELETION_CHECK_FAILED = 'Could not verify deleted chat before clearing embedding receipts';

async function forgetDeletedChatReceipts(chatId, isGroup) {
    // Host 1.14/1.18 deletion events contain only a filename. The selected chat
    // may already have changed, and named deletion can target an inactive owner.
    const context = getContext();
    const targets = isGroup
        ? [{ identities: context.groups.map(group => getChatIdentity({ ...context, chatId, groupId: group.id })),
            body: { is_group: true } }]
        : context.characters.map((character, characterId) => ({
            identities: [getChatIdentity({ ...context, chatId, groupId: null, characterId })],
            body: { is_group: false, avatar_url: character.avatar },
        }));
    for (const target of targets) target.identities = target.identities.filter(hasStoredEmbeddings);
    await Promise.all(targets.filter(target => target.identities.length).map(async ({ identities, body }) => {
        // This read-only host endpoint distinguishes missing files (404) from
        // empty/corrupt existing files and server failures. Group chat files are
        // shared by filename; character chat files are scoped by avatar.
        const response = await fetch('/api/chats/export', {
            method: 'POST', headers: context.getRequestHeaders(),
            body: JSON.stringify({ ...body, file: `${chatId}.jsonl`, exportfilename: `${chatId}.jsonl`, format: 'jsonl' }),
        });
        await response.body?.cancel();
        if (response.status === 404) {
            for (const identity of identities) forgetStoredEmbeddings(identity);
        } else if (!response.ok) {
            throw new Error(`${DELETION_CHECK_FAILED}: HTTP ${response.status}`);
        }
    }));
}

export function initChatDeletionLifecycle(onChatDeleted) {
    const deletionEvents = createModuleEvents(MODULE_ID);
    const deleted = (chatId, isGroup) => Promise.all([
        onChatDeleted(chatId),
        forgetDeletedChatReceipts(chatId, isGroup),
    ]);
    const register = () => {
        if (deletionEvents.count()) return;
        deletionEvents.on(event_types.CHAT_DELETED, chatId => deleted(chatId, false));
        deletionEvents.on(event_types.GROUP_CHAT_DELETED, chatId => deleted(chatId, true));
        window.registerModuleCleanup?.(MODULE_ID, () => deletionEvents.cleanup());
    };

    // This page-lifetime bridge survives EventCenter.cleanupAll(), so a master
    // off/on restores deletion handling even while summary generation is off.
    document.addEventListener('xiaobaixEnabledChanged', event => {
        if (event.detail?.enabled) register();
    });
    if (window.isXiaobaixEnabled !== false) register();
}
