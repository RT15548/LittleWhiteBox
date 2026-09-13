import type { PartitionRegistration } from '../../kernel/contracts.js';
import { emptyMessages, type MessagesDomainV2 } from '../../domains/messages/types.js';
import { validateMessages } from '../../domains/messages/invariants.js';
import { upgradeMessagesV1 } from '../../domains/messages/migrations/upgrade.js';

export const MESSAGES_PARTITION: PartitionRegistration<MessagesDomainV2> = Object.freeze({
    key: 'messages', ownerId: 'messages', schemaVersion: 2,
    createInitial: emptyMessages,
    parse(value: unknown) {
        try {
            if (value && typeof value === 'object' && 'version' in value && value.version === 1) {value = upgradeMessagesV1(value);}
            validateMessages(value); return { ok: true as const, value: structuredClone(value) };
        }
        catch {return { ok: false as const, error: { code: 'partition_invalid' as const, message: '信息记录格式无效，请核实文件。' } };}
    },
    serialize(value: MessagesDomainV2) {validateMessages(value); return structuredClone(value);},
});
