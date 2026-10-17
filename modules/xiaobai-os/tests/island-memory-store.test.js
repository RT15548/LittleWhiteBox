import assert from 'node:assert/strict';
import test from 'node:test';
import { userEconomyHarness } from './user-economy-harness.js';
import { createIslandMemory, ISLAND_MEMORY_PARTITION } from '../apps/game/island/agent/memory-store.js';
import { AGENT_POLICY } from '../apps/game/island/agent/policy.js';

const journey = 'memory-journey';
const space = 'memory-space';
const input = (chunk, digest = chunk) => ({ chunk, digest, text: `text:${digest}` });
const entry = ({ chunk, digest }, vector) => ({ chunk, digest, vector });
const entriesByChunk = index => new Map(index.entries.map(value => [value.chunk, value]));

async function memoryHarness(files) {
    const h = await userEconomyHarness({ files, additionalPartitions: [ISLAND_MEMORY_PARTITION] });
    const store = h.store(ISLAND_MEMORY_PARTITION);
    await store.read();
    return { ...h, store, memory: createIslandMemory(store, h.transactions),
        saved: () => h.document().partitions[ISLAND_MEMORY_PARTITION.key] ?? null };
}

// Explicit embedding barriers force stale reads and chosen commit orders, without timers.
function gatedEmbedding(count = 1) {
    const batches = Array.from({ length: count }, () => ({ started: Promise.withResolvers(), completed: Promise.withResolvers() }));
    const calls = [];
    return { calls,
        connection: { space, async embed(texts) {
            const batch = batches[calls.length];
            calls.push(texts);
            assert.ok(batch, 'No additional embedding request is expected');
            batch.started.resolve();
            return await batch.completed.promise;
        } },
        started: (batch = 0) => batches[batch].started.promise,
        complete: (vectors, batch = 0) => batches[batch].completed.resolve(vectors),
    };
}

for (const first of [0, 1]) {
    test(`concurrent character indexes retain both paid vectors when writer ${first} commits first`, async () => {
        const h = await memoryHarness();
        const shared = input('shared'), sharedEntry = entry(shared, [1, 1]);
        await h.store.transact(tx => tx.replace({ journey, index: { space, dimensions: 2, entries: [sharedEntry] } }));
        const characters = [input('gm-character'), input('intent-character')];
        const embeddings = [gatedEmbedding(), gatedEmbedding()];
        const vectors = [[1, 0], [0, 1]];
        const runs = characters.map((value, i) => h.memory.index(journey, [shared, value], embeddings[i].connection,
            new AbortController().signal, () => true));
        await Promise.all(embeddings.map(embedding => embedding.started()));
        const last = 1 - first;
        embeddings[first].complete([vectors[first]]);
        await runs[first];
        embeddings[last].complete([vectors[last]]);
        const result = await runs[last];
        const expected = new Map([sharedEntry, ...characters.map((value, i) => entry(value, vectors[i]))].map(value => [value.chunk, value]));
        assert.deepEqual(entriesByChunk(h.saved().index), expected);
        assert.deepEqual(entriesByChunk(result), expected);
        assert.deepEqual(embeddings.map(embedding => embedding.calls), characters.map(value => [[value.text]]));

        const restored = await memoryHarness(h.state.files);
        const cached = await restored.memory.index(journey, [shared, ...characters], embeddings[0].connection,
            new AbortController().signal, () => true);
        assert.deepEqual(entriesByChunk(cached), expected);
        assert.equal(embeddings[0].calls.length, 1);
    });
}

test('interleaved batches merge only new vectors, preserving another writer and its newer cached digest', async () => {
    const h = await memoryHarness();
    const oldShared = input('shared', 'old-shared'), newShared = input('shared', 'new-shared');
    await h.store.transact(tx => tx.replace({ journey, index: { space, dimensions: 2, entries: [entry(oldShared, [1, 1])] } }));
    const gmInputs = [newShared, ...Array.from({ length: AGENT_POLICY.embedBatch }, (_, i) => input(`gm-${i}`))];
    const gmVectors = gmInputs.map((_, i) => [i + 1, 1]);
    const intentInput = input('intent-character'), intentVector = [0, 1];
    const gm = gatedEmbedding(2), intent = gatedEmbedding();
    const gmRun = h.memory.index(journey, gmInputs, gm.connection, new AbortController().signal, () => true);
    const intentRun = h.memory.index(journey, [oldShared, intentInput], intent.connection, new AbortController().signal, () => true);
    await Promise.all([gm.started(), intent.started()]);
    gm.complete(gmVectors.slice(0, AGENT_POLICY.embedBatch));
    await gm.started(1);
    intent.complete([intentVector]);
    await intentRun;
    const afterIntent = h.saved().index;
    gm.complete(gmVectors.slice(AGENT_POLICY.embedBatch), 1);
    const result = await gmRun;
    assert.deepEqual(entriesByChunk(afterIntent).get(newShared.chunk), entry(newShared, gmVectors[0]));
    const expected = new Map([...gmInputs.map((value, i) => entry(value, gmVectors[i])), entry(intentInput, intentVector)]
        .map(value => [value.chunk, value]));
    assert.deepEqual(entriesByChunk(result), expected);
    assert.deepEqual(entriesByChunk(h.saved().index), expected);
    const cached = await h.memory.index(journey, [...gmInputs, intentInput], gm.connection, new AbortController().signal, () => true);
    assert.deepEqual(entriesByChunk(cached), expected);
    assert.equal(gm.calls.length, 2);
    assert.deepEqual(intent.calls, [[intentInput.text]]);
});

for (const mode of ['rejected', 'unknown']) {
    test(`a ${mode} merged candidate retains all paid vectors for guarded recovery without re-embedding`, async () => {
        const h = await memoryHarness();
        const firstInput = input('first'), lastInput = input('last');
        const first = gatedEmbedding(), last = gatedEmbedding();
        const abort = new AbortController();
        let current = true;
        const lastRun = h.memory.index(journey, [lastInput], last.connection, abort.signal, () => current);
        await last.started();
        const firstRun = h.memory.index(journey, [firstInput], first.connection, new AbortController().signal, () => true);
        await first.started();
        first.complete([[1, 0]]);
        await firstRun;
        h.state.mode = mode;
        const rejected = assert.rejects(lastRun, { code: 'island_memory_save' });
        last.complete([[0, 1]]);
        await rejected;
        const expected = new Map([entry(firstInput, [1, 0]), entry(lastInput, [0, 1])].map(value => [value.chunk, value]));
        const candidate = h.state.writes.at(-1);
        assert.deepEqual(entriesByChunk(candidate.partitions[ISLAND_MEMORY_PARTITION.key].index), expected);
        assert.equal(h.memory.pending(), true);
        assert.deepEqual(h.saved().index.entries, [entry(firstInput, [1, 0])]);
        await assert.rejects(h.memory.index(journey, [lastInput], last.connection, abort.signal, () => true), { code: 'island_memory_save' });
        const writes = h.state.writes.length;
        h.state.mode = 'confirmed';
        current = false;
        abort.abort();
        await assert.rejects(h.memory.confirm(() => false), { code: 'island_memory_save' });
        assert.equal(h.state.writes.length, writes);
        assert.equal(h.memory.pending(), true);
        await h.memory.confirm(() => true);
        assert.deepEqual(h.state.writes.at(-1), candidate);
        assert.equal(h.memory.pending(), false);
        const cached = await h.memory.index(journey, [firstInput, lastInput], last.connection, new AbortController().signal, () => true);
        assert.deepEqual(entriesByChunk(cached), expected);
        assert.equal(last.calls.length, 1);
    });
}

for (const invalidation of ['guard', 'abort']) {
    for (const timing of ['before', 'during']) {
        test(`${invalidation} invalidation ${timing} embedding prevents accepting a candidate`, async () => {
            const h = await memoryHarness();
            const embedding = gatedEmbedding(), abort = new AbortController();
            let current = true;
            const invalidate = () => { if (invalidation === 'abort') { abort.abort(); } else { current = false; } };
            if (timing === 'before') { invalidate(); }
            const writes = h.state.writes.length;
            const run = h.memory.index(journey, [input('cancelled')], embedding.connection, abort.signal, () => current);
            const rejected = assert.rejects(run, invalidation === 'abort' ? { name: 'AbortError' } : { code: 'island_stale' });
            if (timing === 'during') {
                await embedding.started();
                invalidate();
                embedding.complete([[1, 0]]);
            }
            await rejected;
            assert.equal(h.state.writes.length, writes);
            assert.equal(h.saved(), null);
            assert.equal(h.memory.pending(), false);
            assert.equal(embedding.calls.length, timing === 'before' ? 0 : 1);
        });
    }
}

for (const changed of ['journey', 'space']) {
    test(`changing ${changed} replaces the cache instead of merging incompatible vectors`, async () => {
        const h = await memoryHarness();
        const oldInput = input('old'), nextInput = input('next');
        await h.store.transact(tx => tx.replace({ journey, index: { space, dimensions: 2, entries: [entry(oldInput, [1, 0])] } }));
        const nextJourney = changed === 'journey' ? 'next-journey' : journey;
        const nextSpace = changed === 'space' ? 'next-space' : space;
        const nextVector = [1, 0, 1];
        const index = await h.memory.index(nextJourney, [nextInput], { space: nextSpace, embed: async () => [nextVector] },
            new AbortController().signal, () => true);
        assert.deepEqual(h.saved(), { journey: nextJourney, index: { space: nextSpace, dimensions: 3, entries: [entry(nextInput, nextVector)] } });
        assert.deepEqual(index, h.saved().index);
    });
}
