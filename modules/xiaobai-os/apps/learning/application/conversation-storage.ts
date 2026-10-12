import { canReadLearningScope, type LearningData } from '../../../domains/learning/types.js';
import { learningReferenceScopes } from './conversation-references.js';
import type { PartitionStore } from '../../../kernel/contracts.js';
import { combineLearningScope } from '../../../domains/learning/validation.js';
import { emptyLearningMemory, parseLearningMemory, pruneLearningMemory, type LearningActor, type LearningConversationMemory } from '../domain/conversation.js';
import type { LearningStoredCompanions } from '../partition.js';
import type { LearningStoredWorkbench } from '../workbench-partition.js';
import { upgradeLearningMemory, type LearningStoredMemory } from '../upgrade/memory-v1.js';

export interface LearningConversationPort {
    read(): Promise<LearningConversationMemory>;
    save(memory: LearningConversationMemory, guard: () => boolean): Promise<{ status: string }>;
}

/** These records preserve dialogue across reopening; model protocol and in-flight work stay in the runner. */
export function createLearningConversationStorage(options: {
    data(): LearningData | undefined;
    osId(): string | null;
    companions: PartitionStore<LearningStoredCompanions>;
    workbench: PartitionStore<LearningStoredWorkbench>;
}) {
    const upgrade = (memory: LearningStoredMemory) => upgradeLearningMemory(memory, learningReferenceScopes(options.data()));
    function retain(stored: LearningStoredMemory, readable: boolean): LearningConversationMemory {
        const memory = upgrade(stored);
        return { ...emptyLearningMemory(), exchanges: memory.exchanges.filter(exchange => canReadLearningScope(exchange.scope, options.osId()) === readable),
            ...(canReadLearningScope(memory.summaryScope, options.osId()) === readable ? { summary: memory.summary, summaryReferences: memory.summaryReferences,
                summaryScope: memory.summaryScope, archivedCount: memory.archivedCount } : {}) };
    }
    function port(actor: LearningActor, language: string, sessionId: string | null): LearningConversationPort {
        const identity = actor === 'companion' ? options.companions.peekBinding()?.identityKey : options.workbench.peekBinding()?.identityKey;
        return {
            async read() {
                if (actor === 'workbench') {
                    const state = await options.workbench.read();
                    const memories = (state.value?.conversations.find(entry => entry.language === language)?.memories ?? []).map(memory => retain(memory, true));
                    return structuredClone({ exchanges: memories.flatMap(memory => memory.exchanges),
                        summary: memories.map(memory => memory.summary).filter(Boolean).join('\n\n'),
                        summaryReferences: [...new Set(memories.flatMap(memory => memory.summaryReferences))],
                        summaryScope: memories.reduce((scope, memory) => combineLearningScope(scope, memory.summaryScope), emptyLearningMemory().summaryScope),
                        archivedCount: memories.reduce((sum, memory) => sum + memory.archivedCount, 0) });
                }
                const state = await options.companions.read();
                const value = state.value;
                if (!value || !('schemaVersion' in value)) { throw new Error('learning_companion_unavailable'); }
                const session = value.sessions.find(entry => entry.id === sessionId);
                if (!session) { throw new Error('learning_companion_unavailable'); }
                return structuredClone(retain(session.memory, true));
            },
            save(memory, guard) {
                const saved = parseLearningMemory(memory);
                if (actor === 'workbench') {
                    return options.workbench.transact(transaction => {
                        const state = transaction.currentOrInitial();
                        const existing = state.conversations.find(entry => entry.language === language);
                        if (existing) {
                            const hidden = existing.memories.map(memory => retain(memory, false)).filter(memory => memory.exchanges.length || memory.summary);
                            existing.memories = [...hidden, saved];
                        }
                        else { state.conversations.push({ language, memories: [saved] }); }
                        transaction.replace(state);
                    }, { commitGuard: () => guard() && options.workbench.peekBinding()?.identityKey === identity });
                }
                return options.companions.transact(transaction => {
                    const state = transaction.currentOrInitial();
                    if (!('schemaVersion' in state)) { throw new Error('learning_companion_unavailable'); }
                    const session = state.sessions.find(entry => entry.id === sessionId);
                    if (!session) { throw new Error('learning_companion_unavailable'); }
                    session.memory = saved;
                    transaction.replace(state);
                }, { commitGuard: () => guard() && options.companions.peekBinding()?.identityKey === identity });
            },
        };
    }
    return {
        port,
        async clear(actor: LearningActor, language: string, sessionId: string | null, guard: () => boolean) {
            if (actor === 'workbench') {
                return options.workbench.transact(transaction => {
                    const state = transaction.currentOrInitial();
                    state.conversations = state.conversations.filter(entry => entry.language !== language);
                    transaction.replace(state);
                }, { commitGuard: guard });
            }
            return port(actor, language, sessionId).save(emptyLearningMemory(), guard);
        },
        async prune(references: ReadonlySet<string>, guard: () => boolean, language?: string, clearAll = false) {
            const workbench = await options.workbench.transact(transaction => {
                const state = transaction.currentOrInitial();
                if (clearAll) { state.conversations = []; }
                else if (language) { state.conversations = state.conversations.filter(entry => entry.language !== language); }
                for (const entry of state.conversations) {
                    entry.memories = entry.memories.map(stored => { const memory = upgrade(stored); pruneLearningMemory(memory, references); return memory; });
                }
                transaction.replace(state);
            }, { commitGuard: guard });
            if (workbench.status !== 'confirmed' && workbench.status !== 'unchanged') { return workbench; }
            return options.companions.transact(transaction => {
                const state = transaction.currentOrInitial();
                if (!('schemaVersion' in state)) { throw new Error('learning_companion_unavailable'); }
                for (const session of state.sessions) {
                    if (clearAll) { session.memory = emptyLearningMemory(); }
                    else { const memory = upgrade(session.memory); pruneLearningMemory(memory, references); session.memory = memory; }
                }
                transaction.replace(state);
            }, { commitGuard: guard });
        },
    };
}
