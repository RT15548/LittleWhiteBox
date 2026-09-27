import assert from 'node:assert/strict';
import test from 'node:test';

import { createEmptyMapDomain } from '../domains/map/state.js';
import { createMapKernelHarness } from './map-kernel-harness.js';

function mapDomain(revision, keys) {
    return {
        schemaVersion: 1,
        revision,
        atlas: {
            locations: keys.map(key => ({ key, name: key, scale: 'room', status: 'visited' })),
            links: [],
            actors: [],
        },
        scenes: {},
    };
}

function createHarness(initialRoot = null) {
    return createMapKernelHarness(initialRoot);
}

test('Map read-only access and no-op edits do not create chat data', async () => {
    const harness = createHarness();

    assert.deepEqual(harness.map.readCurrent(), { map: null, writeState: 'ready' });
    assert.deepEqual(await harness.map.replaceCurrent(createEmptyMapDomain(), { expectedRevision: 0 }), {
        map: null,
        writeState: 'ready',
    });
    assert.equal(harness.state.capture.reference, null);
    assert.equal(harness.state.persisted, null);
    assert.equal(harness.state.writes.length, 0);
});

test('Map replaces one complete staging snapshot, saves once, advances once and rejects stale revisions', async () => {
    const harness = createHarness();
    const view = await harness.map.replaceCurrent(mapDomain(0, ['hall']), { expectedRevision: 0 });

    assert.equal(view.map.revision, 1);
    assert.equal(view.map.atlas.locations[0].name, 'hall');
    assert.equal(harness.state.writes.length, 1);
    assert.equal(harness.state.writes[0].candidate.partitions.map.revision, 1);
    view.map.atlas.locations[0].name = 'mutated client clone';
    assert.equal(harness.map.readCurrent().map.atlas.locations[0].name, 'hall');

    await assert.rejects(
        harness.map.replaceCurrent(mapDomain(0, ['hall']), { expectedRevision: 0 }),
        error => error.code === 'map_revision_conflict' && error.message === 'map_revision_conflict',
    );
    assert.equal(harness.state.writes.length, 1);
});

test('Map replacement validates a complete candidate and owns its committed revision', async () => {
    const harness = createHarness(mapDomain(4, ['hall']));
    const rebuilt = await harness.map.replaceCurrent(mapDomain(99, ['forest']), { expectedRevision: 4 });

    assert.equal(rebuilt.map.revision, 5);
    assert.deepEqual(rebuilt.map.atlas.locations.map(location => location.key), ['forest']);
    assert.equal(harness.state.writes.length, 1);

    const noOp = await harness.map.replaceCurrent(mapDomain(0, ['forest']), { expectedRevision: 5 });
    assert.equal(noOp.map.revision, 5);
    assert.equal(harness.state.writes.length, 1);
    await assert.rejects(
        harness.map.replaceCurrent({ revision: 0 }, { expectedRevision: 5 }),
        error => error.code === 'map_invalid_domain',
    );
});

test('Map definite save failure restores the previously committed domain', async () => {
    const harness = createHarness(mapDomain(2, ['hall']));
    const before = structuredClone(harness.state.persisted);
    harness.state.replaceImpl = async () => ({
        status: 'failed',
        error: { code: 'SAVE_UNAVAILABLE', message: 'save unavailable', retryable: true },
    });

    await assert.rejects(
        harness.map.replaceCurrent(mapDomain(0, ['hall', 'yard']), { expectedRevision: 2 }),
        error => error.code === 'SAVE_UNAVAILABLE',
    );
    assert.deepEqual(harness.state.persisted, before);
    assert.equal(harness.map.readCurrent().map.revision, 2);
    assert.equal(harness.map.getWriteState(), 'ready');
});

test('Map uncertain save freezes one candidate until root confirmation', async () => {
    const harness = createHarness(mapDomain(2, ['hall']));
    harness.state.replaceImpl = async input => {
        const previous = structuredClone(harness.state.persisted);
        harness.state.persisted = structuredClone(input.candidate);
        return { status: 'unconfirmed', observed: previous };
    };
    const replacement = mapDomain(0, ['hall', 'yard']);

    await assert.rejects(
        harness.map.replaceCurrent(replacement, { expectedRevision: 2 }),
        error => error.code === 'SAVE_UNCONFIRMED',
    );
    assert.equal(harness.map.readCurrent().map.revision, 2);
    assert.equal(harness.map.getWriteState(), 'unconfirmed');
    await assert.rejects(
        harness.map.replaceCurrent(replacement, { expectedRevision: 3 }),
        error => error.code === 'storage_unconfirmed',
    );
    assert.equal(harness.state.writes.length, 1);

    assert.deepEqual(await harness.map.confirmPending(), { status: 'confirmed' });
    assert.equal(harness.map.getWriteState(), 'ready');
    assert.equal(harness.map.readCurrent().map.revision, 3);
});

test('Map beforeCommit guard rejects before install and save', async () => {
    const harness = createHarness(mapDomain(7, ['hall']));
    const before = structuredClone(harness.state.persisted);
    let guardCalls = 0;

    await assert.rejects(harness.map.replaceCurrent(mapDomain(0, ['forest']), {
        expectedRevision: 7,
        beforeCommit() {
            guardCalls += 1;
            throw new Error('map_source_changed');
        },
    }), /map_source_changed/);

    assert.equal(guardCalls, 1);
    assert.equal(harness.state.writes.length, 0);
    assert.deepEqual(harness.state.persisted, before);
});
