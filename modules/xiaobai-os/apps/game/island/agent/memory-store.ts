import type { PartitionRegistration, PartitionStore, XiaobaiOsFileControls } from '../../../../kernel/contracts.js';
import type { VectorIndex } from '../memory.js';
import { identifier, integer, list, number, shape, text } from '../validation.js';
import { fail } from '../fault.js';
import type { EmbeddingConnection } from './embedding.js';
import { AGENT_POLICY } from './policy.js';

interface IslandIndex { journey: string | null; index: VectorIndex | null }
function validate(raw: unknown): asserts raw is IslandIndex {
    const d = shape(raw, ['journey', 'index']);
    if (d.journey === null) { if (d.index !== null) { fail('invalid'); } return; }
    identifier(d.journey); const idx = shape(d.index, ['space', 'dimensions', 'entries']); text(idx.space, 100);
    const dimensions = integer(idx.dimensions, 1, 65536), ids = new Set<string>();
    list(idx.entries, value => {
        const e = shape(value, ['chunk', 'digest', 'vector']), id = text(e.chunk, 160); text(e.digest, 64);
        const vector = list(e.vector, v => number(v, -Number.MAX_VALUE));
        if (vector.length !== dimensions || !Math.hypot(...vector) || ids.has(id)) { fail('invalid'); } ids.add(id);
    });
}
// Paid derived results survive reload; only the current journey/embedding space is retained.
// Restart or model change replaces this cache. Removing both island partitions deletes it.
export const ISLAND_MEMORY_PARTITION: PartitionRegistration<IslandIndex> = {
    key: 'islandMemory', ownerId: 'game', schemaVersion: 1, storage: 'user', createInitial: () => ({ journey: null, index: null }),
    parse(raw) {
        try { validate(raw); return { ok: true, value: structuredClone(raw) }; }
        catch (error) {
            if (!(error instanceof Error) || !('code' in error) || typeof error.code !== 'string' || !error.code.startsWith('island_')) { throw error; }
            return { ok: false, error: { code: 'partition_invalid', message: error.message } };
        }
    },
    serialize(value) { validate(value); return structuredClone(value); },
};

export function createIslandMemory(store: PartitionStore<IslandIndex>, files: XiaobaiOsFileControls) {
    return {
        pending: () => files.hasPendingCommit(ISLAND_MEMORY_PARTITION.key),
        async confirm(guard: () => boolean) {
            const result = await files.retryPending({ beforeRetry: guard });
            if (['failed', 'unconfirmed', 'conflict'].includes(result.status)) { fail('memory_save'); }
        },
        async index(journey: string, inputs: { chunk: string; digest: string; text: string }[], connection: EmbeddingConnection, signal: AbortSignal, guard: () => boolean) {
            if (files.hasPendingCommit()) { fail('memory_save'); }
            await store.read(); signal.throwIfAborted();
            const saved = store.peekCurrent()?.value;
            let index = saved?.journey === journey && saved.index?.space === connection.space ? structuredClone(saved.index) : null;
            const entries = new Map(index?.entries.map(e => [e.chunk, e]) ?? []);
            const missing = inputs.filter(i => entries.get(i.chunk)?.digest !== i.digest);
            for (let offset = 0; offset < missing.length; offset += AGENT_POLICY.embedBatch) {
                if (!guard()) { fail('stale'); } signal.throwIfAborted();
                const batch = missing.slice(offset, offset + AGENT_POLICY.embedBatch), vectors = await connection.embed(batch.map(b => b.text), signal);
                signal.throwIfAborted(); if (!guard()) { fail('stale'); }
                if (vectors.length !== batch.length) { fail('vector_space'); }
                index ??= { space: connection.space, dimensions: vectors[0]?.length ?? 0, entries: [] };
                for (const [i, input] of batch.entries()) {
                    entries.set(input.chunk, { chunk: input.chunk, digest: input.digest, vector: vectors[i] });
                }
                index.entries = [...entries.values()];
                const value = { journey, index }; validate(value);
                let accepted = false;
                const result = await store.transact(tx => { if (!guard()) { fail('stale'); } tx.replace(value); accepted = true; },
                    { retainFailedCandidate: true, commitGuard: () => accepted || guard() });
                if (['failed', 'unconfirmed', 'conflict'].includes(result.status)) { fail('memory_save'); }
            }
            return index;
        },
    };
}
export type IslandMemory = ReturnType<typeof createIslandMemory>;
