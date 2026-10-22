import type { CapturedChatBinding, ChatReferencePort, ChatPersistence, XiaobaiOsSidecarV1 } from '../kernel/contracts.js';
import type { ChatBindingManager } from '../storage/chat-binding.js';

const unconfirmed = (status: string) => Object.assign(new Error('Story reference is not confirmed'), { code: `storage_${status}` });
const changed = () => new Error('Chat changed while preparing its reference');

/** Resolve story ownership through its file; automatic work leaves the reference save to the host. */
export function createUserStoryResolver(options: {
    ready(): Promise<void>;
    references: ChatReferencePort;
    manager: ChatBindingManager;
    install(envelope: XiaobaiOsSidecarV1): Promise<void>;
}): (write: boolean, chatPersistence?: ChatPersistence) => Promise<CapturedChatBinding> {
    return async (write, chatPersistence = 'immediate') => {
        await options.ready();
        const requested = options.references.capture();
        if (!requested) { throw new Error('No chat is open'); }
        // Views do not request reference persistence. Business writes resolve
        // their scope using the caller's chat persistence policy.
        if (!write) { return requested; }
        let resolved = await options.manager.retryPendingCurrent({ chatPersistence });
        if (resolved.status === 'empty') { resolved = await options.manager.ensureCurrent({ chatPersistence }); }
        if (resolved.status !== 'ready') {
            throw unconfirmed(resolved.status);
        }
        const current = options.references.capture();
        if (!current || current.identityKey !== requested.identityKey) { throw changed(); }
        // The chat coordinator may have published this reference without saving
        // chat. Only an immediate operation requires its persistence acknowledgement.
        const installed = await options.references.install(current, { formatVersion: 1, osId: resolved.envelope.osId }, { chatPersistence });
        if (installed.status !== 'confirmed' && installed.status !== 'deferred') {
            throw unconfirmed(installed.status);
        }
        if (resolved.created) { await options.install(resolved.envelope); }
        if (!await options.references.isCurrent(current)) { throw changed(); }
        return current;
    };
}
