import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyMapDomain } from '../domains/map/state.js';
import { validateMapDomain } from '../domains/map/invariants.js';
import { createMapManagement } from '../apps/map/management/participant.js';
import { createMapMaintenanceParticipant } from '../apps/map/host/maintenance-participant.js';
import { runProviderToolLoop } from '../capabilities/maintenance/provider-tool-loop.js';
import { createMapKernelHarness } from './map-kernel-harness.js';
import { administratorHarness, settled, withLoadedTools } from './administrator-harness.js';

const player = { actorKey: 'player', displayName: 'Player' };
const source = { chatIdentity: 'fixture', messages: [], messageCount: 0, assistantCount: 0, player };
const place = (key, extra = {}) => ({ key, name: key, scale: 'region', status: 'mentioned', ...extra });
const paths = report => report.issues.map(issue => issue.path);

test('document reads and failed repairs expose independent errors together without modifying storage', async t => {
    // Deliberately corrupt the current format; this is not a historical-version compatibility fixture.
    const data = createEmptyMapDomain();
    data.schemaVersion = 99;
    data.atlas.unexpected = true;
    data.atlas.locations = [place('port', { position: {}, terrain: 'unsupported' }), place('valley', { position: [false, 'north'] })];
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    const session = await createMapManagement(h.map, () => player).open();
    const expectedPaths = ['partitions.map.schemaVersion', 'partitions.map.atlas.unexpected',
        'partitions.map.atlas.locations.0.position', 'partitions.map.atlas.locations.0.terrain',
        'partitions.map.atlas.locations.1.position.0', 'partitions.map.atlas.locations.1.position.1'];
    assert.deepEqual(paths(session.initial.validation), expectedPaths);
    const result = await session.execute('MapAtlasEdit', { patches: [{ op: 'set', path: '/schemaVersion', value: 1 }] }, () => true);
    assert.equal(result.status, 'failed');
    assert.deepEqual(paths(result.data.validation), expectedPaths.slice(1));
    assert.deepEqual(h.state.persisted.partitions.map, data);
    assert.equal(h.state.writes.length, 0);
    const corrected = await session.execute('MapAtlasEdit', { patches: [
        { op: 'set', path: '/schemaVersion', value: 1 }, { op: 'remove', path: '/atlas/unexpected' },
        { op: 'set', path: '/atlas/locations/0/position', value: [1, 2] },
        { op: 'set', path: '/atlas/locations/0/terrain', value: 'plain' },
        { op: 'set', path: '/atlas/locations/1/position', value: [3, 4] },
    ] }, () => true);
    assert.equal(corrected.status, 'saved');
    assert.equal(h.state.writes.length, 1);
    assert.deepEqual(h.map.readCurrent().map.atlas.locations.map(location => location.key), ['port', 'valley']);
});

test('invalid structures leave dependent checks explicitly unchecked while other branches are inspected', () => {
    const data = createEmptyMapDomain();
    data.atlas.locations = null;
    data.scenes.room = { key: 'room', name: 'Room', status: 'active', viewBox: [0, 0, -1, -2], elements: [
        { id: 'wall', category: 'wall', shape: 'rect', geometry: { x: 'east', y: 'north', width: -1, height: -2 } },
    ] };
    assert.throws(() => validateMapDomain(data), error => {
        assert.equal(error.code, 'map_invalid_domain');
        assert.deepEqual(paths(error.validation), ['domains.map.atlas.locations', 'domains.map.scenes.room.viewBox.2',
            'domains.map.scenes.room.viewBox.3', 'domains.map.scenes.room.elements.0.geometry.x',
            'domains.map.scenes.room.elements.0.geometry.y', 'domains.map.scenes.room.elements.0.geometry.width',
            'domains.map.scenes.room.elements.0.geometry.height']);
        assert.deepEqual(error.validation.unchecked, ['domains.map.atlas.locations', 'references']);
        return true;
    });
});

test('reference checks report separate missing parents, endpoints and actor locations together', () => {
    const data = createEmptyMapDomain();
    data.atlas.locations = [place('a', { parent: 'missing-a' }), place('b', { parent: 'missing-b' })];
    data.atlas.links = [{ id: 'route', from: 'missing-a', to: 'missing-b', kind: 'road', bidirectional: true }];
    data.atlas.actors = [{ actorKey: 'player', displayName: 'Player', locationKey: 'missing-c' }];
    assert.throws(() => validateMapDomain(data), error => {
        assert.deepEqual(paths(error.validation), ['domains.map.atlas.locations.0.parent', 'domains.map.atlas.locations.1.parent',
            'domains.map.atlas.links.0.from', 'domains.map.atlas.links.0.to', 'domains.map.atlas.actors.0.locationKey']);
        assert.deepEqual(error.validation.unchecked, []);
        return true;
    });
});

test('map maintenance returns all candidate field errors once per related group and accepts a single corrected retry', async t => {
    const h = createMapKernelHarness(createEmptyMapDomain()); t.after(h.map.dispose);
    const participant = createMapMaintenanceParticipant({ map: h.map, readSettings: () => ({ autoMaintenance: false }) });
    const session = await participant.createSession(source, 'rebuild');
    const declarations = [place('region', { position: {}, terrain: 'unsupported' }),
        place('room', { scale: 'room', parent: 'region', position: [false, true], terrain: 'unsupported' })];
    const result = await session.executeTool('MapAtlasEdit', { locations: declarations });
    assert.equal(result.status, 'failed');
    assert.equal(result.skipped.filter(item => item.validation).length, 1);
    assert.deepEqual(paths(result.skipped[0].validation), ['domains.map.atlas.locations.0.position', 'domains.map.atlas.locations.0.terrain',
        'domains.map.atlas.locations.1.position.0', 'domains.map.atlas.locations.1.position.1', 'domains.map.atlas.locations.1.terrain']);
    assert.equal(session.canCommit(), false);
    assert.equal(h.state.writes.length, 0);
    const fixed = await session.executeTool('MapAtlasEdit', { locations: declarations.map((location, index) => ({
        ...location, position: [index * 100, index * 100], terrain: 'plain',
    })) });
    assert.equal(fixed.status, 'updated');
    await session.commit(() => true);
    assert.equal(h.state.writes.length, 1);
    assert.equal(h.map.readCurrent().map.atlas.locations.length, 2);
});

const malformedArguments = [
    { raw: '{"locations":[', code: 'arguments_invalid_json' },
    { raw: JSON.stringify('{"locations":[]}'), code: 'arguments_must_be_object', receivedType: 'string' },
    { raw: '[]', code: 'arguments_must_be_object', receivedType: 'array' },
    { raw: 'null', code: 'arguments_must_be_object', receivedType: 'null' },
    { raw: 'true', code: 'arguments_must_be_object', receivedType: 'boolean' },
];

test('scene maintenance carries multiple candidate geometry errors back to the assistant without staging a broken scene', async t => {
    const data = createEmptyMapDomain();
    data.atlas.locations = [place('region'), place('room', { scale: 'room', parent: 'region' })];
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    const participant = createMapMaintenanceParticipant({ map: h.map, readSettings: () => ({ autoMaintenance: false }) });
    const session = await participant.createSession(source, 'manual');
    const wall = { id: 'wall', cat: 'wall', shape: 'rect', geo: { center: [-100_000, -100_000], size: [100_000, 100_000] } };
    const result = await session.executeTool('MapSceneEdit', { scene: 'room', elements: [wall] });
    assert.equal(result.status, 'failed');
    assert.deepEqual(paths(result.skipped[0].validation), ['domains.map.scenes.room.elements.0.geometry.x', 'domains.map.scenes.room.elements.0.geometry.y']);
    assert.equal(session.canCommit(), false);
    assert.equal(h.state.writes.length, 0);
    const corrected = await session.executeTool('MapSceneEdit', { scene: 'room', elements: [{ ...wall, geo: { center: [10, 10], size: [10, 10] } }] });
    assert.equal(corrected.status, 'updated');
    await session.commit(() => true);
    assert.equal(h.state.writes.length, 1);
    assert.equal(h.map.readCurrent().map.scenes.room.elements[0].id, 'wall');
});

function checkArgumentFailure(result, expected) {
    assert.equal(result.ok, false); assert.equal(result.status, 'failed');
    assert.equal(result.code, expected.code); assert.equal(result.data.stage, 'arguments');
    if (expected.receivedType) { assert.equal(result.data.receivedType, expected.receivedType); }
    else { assert.equal(typeof result.data.parserMessage, 'string'); assert.ok(result.data.parserMessage.length > 0); }
}

test('administrator distinguishes malformed JSON from outer argument types and still saves a large root replacement', async () => {
    const damaged = { ...createEmptyMapDomain(), schemaVersion: 99 };
    const replacement = createEmptyMapDomain();
    replacement.atlas.locations = Array.from({ length: 90 }, (_, index) => place(`place-${index}`, { brief: 'Landscape. '.repeat(20).trim() }));
    const h = await administratorHarness({ map: damaged });
    let step = 0;
    h.state.generate = withLoadedTools(['map'], async request => {
        if (step > 0 && step <= malformedArguments.length) {
            checkArgumentFailure(JSON.parse(request.messages.filter(message => message.role === 'tool').at(-1).content), malformedArguments[step - 1]);
            assert.deepEqual(h.state.persisted.partitions.map, damaged);
            assert.equal(h.coordinator.hasPendingCommit(), false);
        }
        const raw = malformedArguments[step]?.raw ?? JSON.stringify({ patches: [{ op: 'set', path: '', value: replacement }] });
        return step++ <= malformedArguments.length ? { toolCalls: [{ id: `attempt-${step}`, name: 'MapAtlasEdit', arguments: raw }] } : { text: 'Done' };
    });
    await h.request('send', { text: 'Rebuild this map' }); await settled(h.runtime);
    const turn = h.repository.read().turns[0];
    assert.equal(turn.status, 'finished');
    assert.equal(JSON.parse(turn.toolMessages.at(-1).content).status, 'saved');
    assert.equal(h.map.readCurrent().map.atlas.locations.length, 90);
});

for (const native of [false, true]) {
    test(`map maintenance ${native ? 'native continuation' : 'message replay'} receives precise argument errors and can correct them`, async t => {
        const h = createMapKernelHarness(createEmptyMapDomain()); t.after(h.map.dispose);
        const participant = createMapMaintenanceParticipant({ map: h.map, readSettings: () => ({ autoMaintenance: false }) });
        const session = await participant.createSession(source, 'rebuild');
        let step = 0;
        const agent = { providerConfig: {}, supportsSessionToolLoop: native, async run(request) {
            if (step > 0 && step <= malformedArguments.length) {
                const result = native ? request.toolResponses.at(-1).response : JSON.parse(request.messages.filter(message => message.role === 'tool').at(-1).content);
                checkArgumentFailure(result, malformedArguments[step - 1]);
                assert.equal(session.canCommit(), false);
            }
            const raw = malformedArguments[step]?.raw ?? JSON.stringify({ locations: [place('region')] });
            return step++ <= malformedArguments.length ? { toolCalls: [{ id: `attempt-${step}`, name: 'MapAtlasEdit', arguments: raw }] } : { text: 'Done' };
        } };
        const result = await runProviderToolLoop({ agent, sessions: [{ session, isActive: () => true }],
            sourceMessage: { role: 'user', content: 'Maintain the map' }, signal: new AbortController().signal, guard: () => true });
        assert.equal(result.status, 'finished');
        assert.deepEqual(result.unresolvedParticipantIds, []);
        assert.equal(session.canCommit(), true);
        await session.commit(() => true);
        assert.equal(h.state.writes.length, 1);
    });
}
