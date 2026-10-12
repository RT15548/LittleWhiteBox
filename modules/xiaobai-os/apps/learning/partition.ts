import type { PartitionRegistration } from '../../kernel/contracts.js';
import { emptyLearningCompanions, parseLearningCompanions, type LearningCompanionState } from './domain/conversation.js';
import { parseLearningCompanionV1, type LearningCompanionV1 } from './upgrade/companion-v1.js';
import { parseLearningStoredMemory, type LearningStoredMemory } from './upgrade/memory-v1.js';

export type LearningCompanionConfiguration = LearningCompanionState<LearningStoredMemory>;
export type LearningStoredCompanions = LearningCompanionConfiguration | LearningCompanionV1;
function parse(value: unknown): LearningStoredCompanions {
    return value && typeof value === 'object' && 'schemaVersion' in value ? parseLearningCompanions(value, parseLearningStoredMemory) : parseLearningCompanionV1(value);
}
/** Role choice and private companionship belong to the story; learning assets do not. */
export const LEARNING_PARTITION: PartitionRegistration<LearningStoredCompanions> = Object.freeze({
    key: 'learning', ownerId: 'learning', schemaVersion: 2,
    parse(value: unknown) {
        try { return { ok: true as const, value: parse(value) }; }
        catch (error) {
            return { ok: false as const, error: { code: 'partition_invalid' as const,
                message: error instanceof Error ? error.message : 'Invalid teacher preference' } };
        }
    },
    serialize: parse,
    createInitial: emptyLearningCompanions,
});
