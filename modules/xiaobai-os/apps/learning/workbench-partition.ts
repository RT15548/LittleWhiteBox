import type { PartitionRegistration } from '../../kernel/contracts.js';
import { parseLearningWorkbenchHistory, type LearningWorkbenchHistory } from './domain/conversation.js';
import { parseLearningStoredMemory, type LearningStoredMemory } from './upgrade/memory-v1.js';

export type LearningStoredWorkbench = LearningWorkbenchHistory<LearningStoredMemory>;
const parse = (value: unknown) => parseLearningWorkbenchHistory(value, parseLearningStoredMemory);
export const LEARNING_WORKBENCH_PARTITION: PartitionRegistration<LearningStoredWorkbench> = Object.freeze({
    key: 'learning-workbench', ownerId: 'learning', schemaVersion: 1, storage: 'user',
    parse(value: unknown) {
        try { return { ok: true as const, value: parse(value) }; }
        catch (error) { return { ok: false as const, error: { code: 'partition_invalid' as const,
            message: error instanceof Error ? error.message : 'Invalid learning conversation' } }; }
    },
    serialize: parse,
    createInitial: () => ({ conversations: [] }),
});
