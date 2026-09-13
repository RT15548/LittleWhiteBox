import type { ScopedChatStore, XiaobaiOsFileControls } from '../../../kernel/contracts.js';
import { emptyMessages, type MessagesDomainV2 } from '../../../domains/messages/types.js';
import { validateMessages } from '../../../domains/messages/invariants.js';

export function createMessagesService(store: ScopedChatStore<MessagesDomainV2>, files: XiaobaiOsFileControls) {
    function current(): MessagesDomainV2 {return structuredClone(store.peekCurrent()?.value ?? emptyMessages());}
    async function change<T>(command: (state: MessagesDomainV2) => T, guard: () => boolean = () => true): Promise<T> {
        const result = await store.transact(context => {
            const next = structuredClone(context.currentOrInitial());
            const result = command(next);
            validateMessages(next);
            if (JSON.stringify(next) !== JSON.stringify(context.current)) {context.replace(next);}
            return result;
        }, { commitGuard: guard, retainFailedCandidate: true });
        if (result.status === 'confirmed' || result.status === 'unchanged') {return result.result;}
        throw Object.assign(new Error('messages_save_' + result.status, { cause: result.status === 'failed' ? result.error : undefined }), { code: 'messages_save_pending' });
    }
    return { current, change, refresh: () => store.read(), subscribe: store.subscribe,
        fileState: files.getFileState, pending: () => files.hasPendingCommit('messages'),
        confirm: files.retryPending, adoptServerState: files.adoptServerState, subscribeFile: files.subscribeFileState };
}

export type MessagesService = ReturnType<typeof createMessagesService>;
