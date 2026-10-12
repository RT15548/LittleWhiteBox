import { learningRecord, learningText } from '../../../domains/learning/profile.js';
import { combineLearningScope, learningArray, learningId, learningInteger, requireLearning } from '../../../domains/learning/validation.js';
import type { LearningScope } from '../../../domains/learning/types.js';
import { emptyLearningMemory, parseLearningMemory, type LearningConversationMemory } from '../domain/conversation.js';

/**
 * Frozen reference-owned conversation format from a98b159. Conversion is only at the storage boundary.
 * Keep while saved Learning partitions may contain this format; new saves always contain explicit access scopes.
 */
interface LearningMemoryV1 {
    exchanges: { id: string; user: string; reply: string; replyTo: string | null; summarized: boolean; references: string[] }[];
    summary: string;
    summaryReferences: string[];
    archivedCount: number;
}
export type LearningStoredMemory = LearningMemoryV1 | LearningConversationMemory;

export function parseLearningStoredMemory(value: unknown): LearningStoredMemory {
    if (value && typeof value === 'object' && 'summaryScope' in value) { return parseLearningMemory(value); }
    const record = learningRecord(value, 'conversation', ['exchanges', 'summary', 'summaryReferences', 'archivedCount']);
    const references = (value: unknown) => learningArray(value, 'references', learningId);
    return {
        exchanges: learningArray(record.exchanges, 'exchanges', (raw, path) => {
            const turn = learningRecord(raw, path, ['id', 'user', 'reply', 'replyTo', 'summarized', 'references']);
            requireLearning(typeof turn.summarized === 'boolean' && (!turn.summarized || turn.replyTo !== null), path, 'Only retained paragraph feedback can also belong to a summary');
            return { id: learningId(turn.id, `${path}.id`), user: learningText(turn.user, `${path}.user`, 12000, true),
                reply: learningText(turn.reply, `${path}.reply`, 100000), replyTo: turn.replyTo === null ? null : learningId(turn.replyTo, `${path}.replyTo`),
                summarized: turn.summarized, references: references(turn.references) };
        }),
        summary: learningText(record.summary, 'summary', 100000, true), summaryReferences: references(record.summaryReferences),
        archivedCount: learningInteger(record.archivedCount, 'archivedCount'),
    };
}

export function upgradeLearningMemory(memory: LearningStoredMemory, scopes: ReadonlyMap<string, LearningScope>): LearningConversationMemory {
    if ('summaryScope' in memory) { return memory; }
    const valid = (references: string[]) => references.every(id => scopes.has(id));
    const scopeOf = (references: string[]) => references.reduce<LearningScope>((scope, id) => combineLearningScope(scope, scopes.get(id)!), { kind: 'public' });
    // The old format already retired records with missing sources; their former story cannot be reconstructed.
    // Never turn an unresolved private record into a public one by guessing its provenance.
    return { ...emptyLearningMemory(),
        exchanges: memory.exchanges.filter(exchange => valid(exchange.references)).map(exchange => ({ ...exchange, scope: scopeOf(exchange.references) })),
        ...(valid(memory.summaryReferences) ? { summary: memory.summary, summaryReferences: memory.summaryReferences,
            summaryScope: scopeOf(memory.summaryReferences), archivedCount: memory.archivedCount } : {}) };
}
