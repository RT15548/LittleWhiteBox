import { db, metaTable, chunksTable, chunkVectorsTable, eventVectorsTable, stateVectorsTable } from '../../../data/db.js';
import { makeChunkRecords, makeChunkVectorRecords, makeEventVectorRecords } from '../chunk-store.js';
import { makeStateVectorRecords } from '../state-store.js';
import { vectorSourceRecord } from '../cache-consistency.js';

const TABLES = [metaTable, chunksTable, chunkVectorsTable, eventVectorsTable, stateVectorsTable];

export async function readVectorCache(chatId) {
    const cacheTables = TABLES.slice(1);
    return db.transaction('r', TABLES, async () => {
        const [chunks, chunkVectors, eventVectors, stateVectors] = await Promise.all(
            cacheTables.map(table => table.where('chatId').equals(chatId).toArray()),
        );
        const meta = await metaTable.get(chatId);
        return { chunks, chunkVectors, eventVectors, stateVectors, meta };
    });
}

// Cursor projection avoids retaining/copying the full embedding payload for an
// idle integrity check. IndexedDB still deserializes each visited record.
export async function readVectorCacheSources(chatId) {
    return db.transaction('r', TABLES, async () => {
        const [meta, chunks, chunkVectors, eventVectors, stateVectors] = await Promise.all([
            metaTable.get(chatId),
            chunksTable.where('chatId').equals(chatId).toArray(),
            ...[chunkVectorsTable, eventVectorsTable, stateVectorsTable].map(async table => {
                const records = [];
                await table.where('chatId').equals(chatId).each(record => records.push(vectorSourceRecord(record)));
                return records;
            }),
        ]);
        return { meta, chunks, chunkVectors, eventVectors, stateVectors };
    });
}

// Validation/encoding happens before opening the transaction. Runtime and
// lexical caches are invalidated by the caller only after commit, never halfway.
export async function replaceVectorCache(chatId, data, resolved, assertCurrent) {
    const chunkRecords = makeChunkRecords(chatId, resolved.chunks);
    const chunkVectors = makeChunkVectorRecords(chatId, data.chunks.map(row => ({ ...row, chunkId: row.id })), data.fingerprint);
    const eventVectors = makeEventVectorRecords(chatId, data.events.map(row => ({ ...row, eventId: row.id })), data.fingerprint);
    const stateVectors = makeStateVectorRecords(chatId, data.states.map(row => ({ ...row, atomId: row.id })), data.fingerprint);
    const records = [chunkRecords, chunkVectors, eventVectors, stateVectors];
    try {
        await db.transaction('rw', TABLES, async () => {
            assertCurrent();
            for (let i = 1; i < TABLES.length; i++) {
                await TABLES[i].where('chatId').equals(chatId).delete();
                assertCurrent();
                if (records[i - 1].length) await TABLES[i].bulkPut(records[i - 1]);
                assertCurrent();
            }
            await metaTable.put({ chatId, fingerprint: data.fingerprint, lastChunkFloor: resolved.lastChunkFloor, updatedAt: Date.now() });
            assertCurrent();
        });
    } catch (error) {
        // Dexie wraps DOM-named errors (including our AbortError) in its own
        // exception. Preserve the domain cancellation code at the storage boundary.
        if (error.name === 'AbortError' && error.inner?.code === 'cancelled') throw error.inner;
        throw error;
    }
}
