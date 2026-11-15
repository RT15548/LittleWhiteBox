import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { createTestModuleUrl } from './helpers/bundle-module.js';
import { validateCurrentSources } from '../vector/storage/current-source-validation.js';

// Protect recovery decisions without host IO or model calls. Only host config and
// the storage module's chunk identity helpers are substituted; validation is real.
const root = fileURLToPath(new URL('../../../', import.meta.url));
const shims = {
    'config.js': 'export const getTextFilterRules=()=>[];',
    'chunk-store.js': 'export const makeChunkId=(floor,index)=>`c-${floor}-${index}`; export const hashText=()=>"unused"; export const CHUNK_MAX_TOKENS=200;',
};
const bundled = await build({
    stdin: { resolveDir: root, contents: [
        "export * from './modules/story-summary/vector/storage/cache-consistency.js';",
        "export * from './modules/story-summary/vector/storage/package/sources.js';",
        "export * from './modules/story-summary/vector/utils/vector-input-digest.js';",
    ].join('\n') },
    bundle: true, write: false, format: 'esm', platform: 'node',
    plugins: [{ name: 'host-boundaries', setup(api) {
        api.onResolve({ filter: /.*/ }, args => {
            const name = path.basename(args.path);
            return Object.hasOwn(shims, name) ? { path: name, namespace: 'host' } : null;
        });
        api.onLoad({ filter: /.*/, namespace: 'host' }, args => ({ contents: shims[args.path] }));
    } }],
});
// eslint-disable-next-line no-unsanitized/method -- Local test bundle, no external code.
const mod = await import(await createTestModuleUrl(bundled.outputFiles[0].text));

function snapshot() {
    return { chat: [{ mes: 'Saved material.' }],
        atoms: [{ atomId: 'a-0', floor: 0, semantic: 'Anchor.', edges: [] }],
        events: [{ id: 'e-0', title: 'Event', summary: 'Summary.' }] };
}

function fixture() {
    const current = snapshot();
    const sources = mod.buildSourceIndex(current);
    return { snapshot: current, cache: {
        meta: { fingerprint: 'current' },
        chunks: [...sources.chunks.values()].map(source => source.chunk),
        chunkVectors: [...sources.chunks.values()].map(source => ({ chunkId: source.id, fingerprint: 'current', sourceHash: source.sourceHash })),
        stateVectors: [...sources.states.values()].map(source => ({ atomId: source.id, floor: source.floor,
            fingerprint: 'current', sourceHash: source.sourceHash, relationHash: source.relationHash, hasRelationVector: true })),
        eventVectors: [...sources.events.values()].map(source => ({ eventId: source.id, fingerprint: 'current', sourceHash: source.sourceHash })),
    } };
}
const inspect = item => mod.inspectCacheSourceCoverage(item.cache, { snapshot: item.snapshot });
const sourceFault = details => error => {
    assert.equal(error.code, 'source_invalid');
    assert.deepEqual(error.details, details);
    assert.equal(mod.isCacheConsistencyFailure(error), true);
    return true;
};

for (const floor of [-1, 1, 0.5, '0', undefined, null, NaN]) {
    test(`invalid anchor floor ${String(floor)} is a source fault even without any vectors`, () => {
        const current = snapshot();
        current.atoms[0].floor = floor;
        const before = structuredClone(current);
        assert.throws(() => validateCurrentSources(current), sourceFault({ kind: 'state', id: 'a-0',
            floor: floor ?? null, reason: 'invalid_floor', repairable: false }));
        assert.deepEqual(current, before);
    });
}

for (const [collection, key, kind] of [['atoms', 'atomId', 'state'], ['events', 'id', 'event']]) {
    for (const id of ['', undefined, null, 42]) {
        test(`${kind} invalid ID ${String(id)} is a source fault`, () => {
            const current = snapshot();
            current[collection][0][key] = id;
            assert.throws(() => validateCurrentSources(current), sourceFault({ kind, id: id ?? null,
                ...(kind === 'state' ? { floor: 0 } : {}), reason: 'invalid_id', repairable: false }));
        });
    }
    test(`${kind} duplicate IDs are diagnosed before replaceable cache faults`, () => {
        const item = fixture();
        item.snapshot[collection].push({ ...item.snapshot[collection][0] });
        item.cache.chunkVectors[0].fingerprint = 'other';
        item.cache.chunks[0].text = '';
        assert.throws(() => inspect(item), sourceFault({ kind, id: item.snapshot[collection][0][key],
            ...(kind === 'state' ? { floor: 0 } : {}), reason: 'duplicate_id', repairable: false }));
    });
}

test('an invalid unvectorized anchor wins over stale inputs in earlier layers', () => {
    const item = fixture();
    item.snapshot.atoms.push({ atomId: 'invalid-source', floor: 10, semantic: 'Invalid.' });
    item.cache.chunkVectors[0].sourceHash = 'stale';
    assert.throws(() => inspect(item), sourceFault({ kind: 'state', id: 'invalid-source', floor: 10,
        reason: 'invalid_floor', repairable: false }));
});

for (const layer of ['chunkVectors', 'stateVectors', 'eventVectors']) {
    test(`${layer} fingerprint mismatch remains repairable`, () => {
        const item = fixture();
        item.cache[layer][0].fingerprint = 'other';
        assert.throws(() => inspect(item), error => {
            assert.equal(error.code, 'invalid_package');
            assert.deepEqual(error.details, { field: 'fingerprint', repairable: true });
            return true;
        });
    });
}

test('uniform stale row fingerprints are compared with metadata, not just one another', () => {
    const item = fixture();
    for (const layer of ['chunkVectors', 'stateVectors', 'eventVectors']) {
        item.cache[layer].forEach(record => { record.fingerprint = 'other'; });
    }
    assert.throws(() => inspect(item), error => error.code === 'invalid_package' && error.details.repairable === true);
});

test('without a metadata fingerprint the existing row baseline still detects mixtures', () => {
    const item = fixture();
    item.cache.meta.fingerprint = null;
    item.cache.eventVectors[0].fingerprint = 'other';
    assert.throws(() => inspect(item), error => error.code === 'invalid_package' && error.details.repairable === true);
});

test('missing provenance alone remains usable in daily checking and is never invented', () => {
    const item = fixture();
    for (const layer of ['chunkVectors', 'stateVectors', 'eventVectors']) {
        item.cache[layer].forEach(record => { delete record.sourceHash; delete record.relationHash; });
    }
    const before = structuredClone(item);
    assert.deepEqual(inspect(item), { missingChunkFloors: [] });
    assert.deepEqual(item, before);
});

test('a malformed saved L1 material remains an unrepaired cache-structure fault', () => {
    const item = fixture();
    item.cache.chunks[0].chunkIdx = -1;
    assert.throws(() => inspect(item), error => {
        assert.equal(error.code, 'incomplete_cache');
        assert.deepEqual(error.details, { reason: 'l1_content_mismatch', floor: 0 });
        return true;
    });
});

test('portable source validation keeps its existing mismatch contract', () => {
    const current = snapshot();
    current.atoms.push({ ...current.atoms[0] });
    assert.throws(() => mod.buildSourceIndex(current), error => {
        assert.equal(error.code, 'source_mismatch');
        assert.deepEqual(error.details, {});
        return true;
    });
    const item = fixture();
    const sources = mod.buildSourceIndex(item.snapshot);
    assert.throws(() => mod.resolvePackageSources({ chunks: [], events: [],
        states: [{ id: 'a-0', floor: 1, sourceHash: sources.states.get('a-0').sourceHash, relationHash: null }] }, sources),
    error => error.code === 'source_mismatch' && error.details.kind === 'state');
});

test('portable export still rejects mixed fingerprints without daily repair metadata', () => {
    const item = fixture();
    item.cache.stateVectors[0].fingerprint = 'other';
    assert.throws(() => mod.buildCacheSourceManifest(item.cache,
        { chatId: 'chat', sources: mod.buildSourceIndex(item.snapshot) }), error => {
        assert.equal(error.code, 'invalid_package');
        assert.deepEqual(error.details, { field: 'fingerprint' });
        return true;
    });
});
