import type { ChatMetadataCapture } from '../../../storage/chat-reference.js';
import type { XiaobaiOsChatBindingV1 } from '../../../kernel/contracts.js';
import { branchMessages, resolveCopiedMessages } from '../application/branch.js';
import type { ChatMessage } from '../application/projection.js';
import { MESSAGES_PARTITION } from '../partition.js';

export function createMessagesBranchCopy(readChild: () => { identityKey: string; messages: readonly ChatMessage[] } | null) {
    return (capture: ChatMetadataCapture, source: XiaobaiOsChatBindingV1, partitions: Record<string, unknown>): void => {
        if (!Object.hasOwn(partitions, MESSAGES_PARTITION.key)) {return;}
        const child = readChild();
        if (!child || child.identityKey !== capture.identityKey) {throw new Error('messages_branch_chat_changed');}
        const parsed = MESSAGES_PARTITION.parse(partitions[MESSAGES_PARTITION.key]);
        if (!parsed.ok) {throw new Error('messages_branch_source_invalid');}
        const branch = capture.mainChatId === source.chatId && capture.binding.kind === source.kind && capture.binding.ownerLocator === source.ownerLocator;
        partitions[MESSAGES_PARTITION.key] = MESSAGES_PARTITION.serialize(branch
            ? branchMessages(parsed.value, child.messages) : resolveCopiedMessages(parsed.value, child.messages));
    };
}
