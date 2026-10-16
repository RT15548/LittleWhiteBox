import type { createAgentKnowledge } from '../agent-knowledge.js';
import type { IslandMemory } from './memory-store.js';
import { islandEmbedding, type EmbeddingConnection } from './embedding.js';
import { AGENT_POLICY as P } from './policy.js';
import { integer, person, text } from '../validation.js';
import { fail } from '../fault.js';
import { createObservationReader } from './observation-updates.js';

export interface MemoryOptions {
    memory: IslandMemory; signal: AbortSignal; guard: () => boolean;
    embedding?: () => Promise<EmbeddingConnection>;
}
export function knowledgeExecutor(work: ReturnType<typeof createAgentKnowledge>, journey: string, options: MemoryOptions) {
    const observations = createObservationReader(work.context);
    return { initial: observations.initial, async execute(name: string, args: Record<string, unknown>) {
        switch (name) {
            case 'Observe': return observations.read(integer(args.offset));
            case 'BrowseMemory': return work.browse(person(args.observer), integer(args.after), integer(args.limit, 1, P.pageSize));
            case 'ReadMemory': return work.read(person(args.observer), integer(args.sequence, 1));
            case 'RecallMemory': {
                const observer = person(args.observer), inputs = work.indexInputs(observer);
                if (!inputs.length) { return { hits: [], complete: true, missing: [] }; }
                const query = text(args.query, P.queryCharacters), connection = await (options.embedding ?? islandEmbedding)();
                const index = await options.memory.index(journey, inputs, connection, options.signal, options.guard);
                if (!index) { return { hits: [], complete: true, missing: [] }; }
                const [vector] = await connection.embed([query], options.signal);
                return work.recall(observer, index, { space: connection.space, vector }, P.recallHits, P.chunkCharacters);
            }
            default: return fail('invalid');
        }
    } };
}
