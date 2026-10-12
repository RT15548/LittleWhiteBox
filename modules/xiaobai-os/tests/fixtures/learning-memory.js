import { emptyLearningMemory } from '../../apps/learning/domain/conversation.js';

// Low-level runner tests use an in-memory dialogue port; runtime tests use real partitions.
export function learningMemory() {
    let memory = emptyLearningMemory();
    return { read: async () => structuredClone(memory), save: async (next, guard) => {
        if (!guard()) { return { status: 'cancelled' }; }
        memory = structuredClone(next);
        return { status: 'confirmed' };
    } };
}
