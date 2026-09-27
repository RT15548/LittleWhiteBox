import assert from 'node:assert/strict';
import test from 'node:test';

import {
    createMapMaintenanceParticipant,
    MAP_MAINTENANCE_TOOL_NAMES,
} from '../apps/map/host/maintenance-participant.js';
import { MAX_ATLAS_DATA_MESSAGE_CHARS } from '../apps/map/tools/atlas-data-message.js';
import {
    MAX_MAP_LOCATIONS,
    MAX_SCENE_ELEMENTS,
} from '../domains/map/invariants.js';
import { buildMapPromptBlock } from '../domains/map/projection.js';
import { createMapKernelHarness } from './map-kernel-harness.js';
import { mapAtlasFixture } from './fixtures/map-atlas.js';

function acceptedSource() {
    return {
        chatIdentity: 'character:1:map-chat',
        messages: [{ index: 0, role: 'assistant', text: 'The room is confirmed.', swipeId: 0, speakerName: 'Narrator' }],
        messageCount: 1,
        assistantCount: 1,
        player: { actorKey: 'player', displayName: 'Alice' },
    };
}

function createHarness(initialMap = null) {
    const kernel = createMapKernelHarness(initialMap);
    const { map } = kernel;
    let settings = { autoMaintenance: false };
    const participant = createMapMaintenanceParticipant({ map, readSettings: () => ({ ...settings }) });
    return {
        map,
        participant,
        writes: kernel.state.writes,
        setSettings: next => { settings = { ...next }; },
    };
}

const indoorFixture = {
    scene: 'Inn Room',
    playerHere: true,
    viewBox: [0, 0, 400, 300],
    mood: 'warm',
    elements: [
        { id: 'room-terrain', cat: 'terrain', shape: 'rect', geo: { center: [200, 150], size: [320, 220] }, material: 'wood' },
        { id: 'wall', cat: 'wall', shape: 'rect', geo: { center: [200, 150], size: [320, 220] }, material: 'stone', label: 'Inn Room' },
        { id: 'door', cat: 'door', kind: 'door', shape: 'icon', geo: { at: [200, 260] }, label: 'Door' },
        { id: 'player-room', cat: 'actor', kind: 'player', actorKey: 'player', shape: 'icon', geo: { at: [200, 180] } },
    ],
};

const outdoorFixture = {
    scene: 'Forest Road',
    playerHere: true,
    viewBox: [0, 0, 800, 600],
    elements: [
        { id: 'ground', cat: 'terrain', shape: 'circle', geo: { at: [400, 300], radius: 150 }, material: 'grass' },
        { id: 'path', cat: 'road', shape: 'path', geo: { points: [[0, 300], [800, 300]] }, material: 'dirt' },
        { id: 'player-road', cat: 'actor', kind: 'player', actorKey: 'player', shape: 'icon', geo: { at: [400, 320] } },
    ],
};

test('participant always supports explicit maintenance and gates only automatic maintenance', () => {
    const { participant, setSettings } = createHarness();
    assert.equal(participant.isEnabled('manual'), true);
    assert.equal(participant.isEnabled('automatic'), false);
    setSettings({ autoMaintenance: true });
    assert.equal(participant.isEnabled('automatic'), true);
    setSettings({ autoMaintenance: false });
    assert.equal(participant.isEnabled('manual'), true);
});

test('Map injects the current atlas as data and keeps captured player data out of its static system prompt', async () => {
    const harness = createHarness();
    const empty = await harness.participant.createSession(acceptedSource(), 'manual');
    assert.equal(empty.dataMessages.length, 1);
    assert.equal(empty.dataMessages[0].role, 'user');
    assert.match(empty.dataMessages[0].content, /^<map_atlas_state>\n[\s\S]*\n<\/map_atlas_state>$/u);
    assert.match(empty.dataMessages[0].content, /"locations":\s*\[\]/u);
    assert.doesNotMatch(empty.prompt, /Alice/);

    await empty.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: mapAtlasFixture([{ key: 'Inn Room' }]).atlas.locations,
    });
    await empty.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, indoorFixture);
    await empty.commit(() => true);

    const populated = await harness.participant.createSession(acceptedSource(), 'manual');
    const injected = populated.dataMessages[0].content;
    assert.match(injected, /"key":\s*"Inn Room"/u);
    assert.match(injected, /"hasScene":\s*true/u);
    assert.match(injected, /"displayName":\s*"Alice"/u);
    assert.doesNotMatch(injected, /sceneKey/);
    assert.doesNotMatch(populated.prompt, /Alice/);

    const rebuild = await harness.participant.createSession(acceptedSource(), 'rebuild');
    assert.match(rebuild.dataMessages[0].content, /"locations":\s*\[\]/u);
});

test('Map falls back to an atlas summary when the full document exceeds the injection budget', async () => {
    const harness = createHarness();
    const seed = await harness.participant.createSession(acceptedSource(), 'manual');
    const brief = 'LONG_BRIEF_MARKER '.repeat(24);
    const result = await seed.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: Array.from({ length: 60 }, (_, index) => ({ key: `place-${index}`, name: `Place ${index}`, scale: 'region', brief })),
        actors: [{ actorKey: 'player', locationKey: 'place-0' }],
    });
    assert.equal(result.status, 'updated');
    await seed.commit(() => true);

    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const injected = session.dataMessages[0].content;
    assert.equal(Array.from(injected).length <= MAX_ATLAS_DATA_MESSAGE_CHARS, true);
    assert.match(injected, /"counts":\s*\{"locations":\s*60/u);
    assert.match(injected, /MapAtlasRead/);
    assert.doesNotMatch(injected, /LONG_BRIEF_MARKER/);
});

test('indoor and outdoor first-map fixtures create observable scenes and use the captured player identity', async () => {
    const harness = createHarness();
    const rebuild = await harness.participant.createSession(acceptedSource(), 'rebuild');
    await rebuild.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: mapAtlasFixture([{ key: 'Inn Room' }]).atlas.locations,
    });
    const indoor = await rebuild.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, indoorFixture);
    assert.equal(indoor.status, 'updated');
    assert.equal(indoor.skipped.length, 0);
    await rebuild.commit(() => true);

    const first = harness.map.readCurrent().map;
    assert.equal(first.scenes['Inn Room'].elements.find(element => element.actorKey === 'player').label, 'Alice');
    assert.deepEqual(first.scenes['Inn Room'].elements.find(element => element.id === 'room-terrain').geometry, {
        x: 40, y: 40, width: 320, height: 220,
    });
    assert.deepEqual(first.atlas.actors.find(actor => actor.actorKey === 'player'), {
        actorKey: 'player', displayName: 'Alice', locationKey: 'Inn Room',
    });

    const incremental = await harness.participant.createSession(acceptedSource(), 'manual');
    await incremental.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: [{ key: 'Forest Road', name: 'Forest Road', parent: 'fixture-region', scale: 'outdoor' }],
    });
    const outdoor = await incremental.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, outdoorFixture);
    assert.equal(outdoor.status, 'updated');
    await incremental.commit(() => true);
    const second = harness.map.readCurrent().map;
    assert.equal(second.atlas.locations.find(location => location.key === 'Forest Road').scale, 'outdoor');
    assert.equal(second.atlas.actors.find(actor => actor.actorKey === 'player').locationKey, 'Forest Road');
    assert.equal(second.scenes['Inn Room'].elements.some(element => element.actorKey === 'player'), false);
    assert.equal(second.scenes['Forest Road'].elements.some(element => element.actorKey === 'player'), true);
});

test('scene intent infers omitted shapes, saves valid siblings, and clears a skipped id after repair', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Courtyard' }]));
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const mixed = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Courtyard',
        playerHere: true,
        elements: [
            { id: 'yard', cat: 'ground', geo: { center: [100, 80], size: [160, 100] } },
            { id: 'brook', cat: 'water', shape: 'curve', geo: { curve: [[0, 50], [200, 60]] } },
            { id: 'guide', cat: 'actor', shape: 'icon', geo: { at: [80, 70], icon: 'actor' }, label: 'Guide' },
            { id: 'bench', cat: 'furniture', shape: 'rect', geo: { center: [120, 90], size: [30, 8] }, icon: 'chair' },
            { id: 'trail', cat: 'road', geo: { center: [100, 80], size: [160, 20], points: [[0, 80], [200, 80]] } },
            { id: 'watcher', cat: 'actor', geo: { at: [140, 70], radius: 8 }, label: 'Watcher' },
            { id: 'caption', cat: 'label', geo: { at: [100, 40] }, label: 'Courtyard' },
            { id: 'broken', cat: 'wall', shape: 'rect', geo: { size: [20, 10] } },
        ],
    });

    assert.equal(mixed.status, 'partial');
    assert.deepEqual(mixed.skipped.map(item => item.id), ['broken']);
    assert.equal(session.getResult().status, 'partial');

    const repaired = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Courtyard',
        elements: [{ id: 'broken', cat: 'wall', shape: 'rect', geo: { center: [100, 80], size: [200, 140] } }],
    });
    assert.equal(repaired.status, 'updated');
    assert.equal(session.getResult().status, 'updated');
    await session.commit(() => true);

    const map = harness.map.readCurrent().map;
    const elements = map.scenes.Courtyard.elements;
    assert.equal(elements.find(element => element.id === 'yard').category, 'terrain');
    assert.equal(elements.find(element => element.id === 'yard').shape, 'rect');
    assert.deepEqual(elements.find(element => element.id === 'brook').geometry.points, [[0, 50], [200, 60]]);
    assert.equal(elements.find(element => element.id === 'guide').actorKey, 'guide');
    assert.equal(elements.find(element => element.id === 'guide').icon, 'actor');
    assert.equal(Object.hasOwn(elements.find(element => element.id === 'bench'), 'actorKey'), false);
    assert.equal(elements.find(element => element.id === 'trail').shape, 'path');
    assert.equal(elements.find(element => element.id === 'watcher').shape, 'icon');
    assert.equal(elements.find(element => element.id === 'caption').shape, 'label');
});

test('removing a skipped element resolves that entity failure across scene aliases', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'failure-room', name: 'Failure Room' }]));
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const mixed = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'failure-room',
        elements: [
            { id: 'valid', cat: 'marker', shape: 'icon', geo: { at: [20, 20] } },
            { id: 'bad-a', cat: 'wall', shape: 'rect', geo: { size: [20, 10] } },
            { id: 'bad-b', cat: 'wall', shape: 'rect', geo: { size: [30, 10] } },
        ],
    });
    assert.equal(mixed.status, 'partial');

    const firstRemoval = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Failure Room', remove: ['bad-a'],
    });
    assert.equal(firstRemoval.status, 'unchanged');
    assert.equal(session.getResult().status, 'partial');

    const secondRemoval = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Failure Room', remove: ['bad-b'],
    });
    assert.equal(secondRemoval.status, 'unchanged');
    assert.equal(session.getResult().status, 'updated');
});

test('scene failure identity falls back to a stable location key before scene creation', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: mapAtlasFixture([{ key: 'stable-room', name: 'Display Room' }]).atlas.locations,
    });
    const failed = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Display Room',
        elements: [{ id: 'broken', cat: 'wall', shape: 'rect', geo: { size: [20, 10] } }],
    });
    assert.equal(failed.status, 'failed');
    assert.equal(session.getResult().status, 'partial');

    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'stable-room', remove: ['broken'],
    });
    assert.equal(session.getResult().status, 'updated');
});

test('valid retries clear unidentified Scene and Atlas item failures as call failures', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Scene Retry' }]));
    const sceneSession = await harness.participant.createSession(acceptedSource(), 'manual');
    const sceneMixed = await sceneSession.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Scene Retry',
        elements: [
            { id: 'valid', cat: 'marker', shape: 'icon', geo: { at: [20, 20] } },
            { cat: 'marker', shape: 'icon', geo: { at: [40, 20] } },
        ],
    });
    assert.equal(sceneMixed.status, 'partial');
    assert.equal(sceneSession.getResult().status, 'partial');
    await sceneSession.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Scene Retry',
        elements: [{ id: 'fixed', cat: 'marker', shape: 'icon', geo: { at: [40, 20] } }],
    });
    assert.equal(sceneSession.getResult().status, 'updated');

    const atlasSession = await harness.participant.createSession(acceptedSource(), 'manual');
    const atlasMixed = await atlasSession.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: [
            { key: 'valid-place', name: 'Valid Place', scale: 'region' },
            { name: 'Missing Key' },
        ],
    });
    assert.equal(atlasMixed.status, 'partial');
    assert.equal(atlasSession.getResult().status, 'partial');
    await atlasSession.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: [{ key: 'fixed-place', name: 'Fixed Place', scale: 'region' }],
    });
    assert.equal(atlasSession.getResult().status, 'updated');
});

test('exact location keys take precedence over colliding scene display names', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: mapAtlasFixture([
            { key: 'source', name: 'target' },
            { key: 'target', name: 'Destination' },
        ]).atlas.locations,
    });
    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'target',
        elements: [{ id: 'target-marker', cat: 'marker', shape: 'icon', geo: { at: [20, 20] } }],
    });

    const source = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'source' });
    const target = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'target' });
    assert.equal(source.data.scene, null);
    assert.deepEqual(target.data.scene.elements.map(element => element.id), ['target-marker']);
});

test('tool collection limits are declared and oversized calls fail before staging', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const sceneTool = session.tools.find(tool => tool.function.name === MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT);
    const atlasTool = session.tools.find(tool => tool.function.name === MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT);
    const atlasReadTool = session.tools.find(tool => tool.function.name === MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ);
    assert.equal(sceneTool.function.parameters.properties.elements.maxItems, MAX_SCENE_ELEMENTS);
    assert.equal(atlasTool.function.parameters.properties.locations.maxItems, MAX_MAP_LOCATIONS);
    assert.deepEqual(atlasReadTool.function.parameters.properties.mode.enum, ['summary', 'document', 'locations', 'links', 'actors']);
    assert.equal(atlasReadTool.function.parameters.properties.limit.maximum, 300);
    const locationProperties = atlasTool.function.parameters.properties.locations.items.properties;
    const elementProperties = sceneTool.function.parameters.properties.elements.items.properties;
    assert.equal(Object.hasOwn(locationProperties, 'aliases'), false);
    assert.equal(Object.hasOwn(locationProperties, 'sceneKey'), false);
    assert.deepEqual(locationProperties.parent.type, ['string', 'null']);
    assert.equal(elementProperties.cat.enum.includes('ground'), false);
    assert.equal(Object.hasOwn(elementProperties.geo.properties, 'icon'), false);
    assert.equal(Object.hasOwn(elementProperties, 'icon'), true);
    assert.equal(Object.hasOwn(elementProperties.rotation, 'exclusiveMaximum'), false);
    assert.deepEqual(elementProperties.id.type, 'string');
    assert.deepEqual(sceneTool.function.parameters.required, ['scene']);
    assert.equal(sceneTool.function.parameters.properties.remove.maxItems, MAX_SCENE_ELEMENTS);

    const sceneResult = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Oversized Scene',
        elements: Array.from({ length: MAX_SCENE_ELEMENTS + 1 }, (_, index) => ({
            id: `marker-${index}`,
            cat: 'marker',
            shape: 'icon',
            geo: { at: [index, 0] },
        })),
    });
    assert.equal(sceneResult.status, 'failed');
    assert.equal(sceneResult.skipped[0].reason, 'scene_elements_exceed_limit');

    const atlasResult = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: Array.from({ length: MAX_MAP_LOCATIONS + 1 }, (_, index) => ({
            key: `place-${index}`,
            name: `Place ${index}`,
        })),
    });
    assert.equal(atlasResult.status, 'failed');
    assert.equal(atlasResult.skipped[0].reason, 'atlas_collection_exceeds_limit');
    assert.equal(await session.canCommit(), false);
    assert.equal(harness.map.readCurrent().map, null);

    const retry = await harness.participant.createSession(acceptedSource(), 'manual');
    const tooLarge = await retry.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: Array.from({ length: MAX_MAP_LOCATIONS + 1 }, (_, index) => ({
            key: `retry-place-${index}`,
            name: `Retry Place ${index}`,
        })),
    });
    assert.equal(tooLarge.status, 'failed');
    const corrected = await retry.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: [{ key: 'retry-place', name: 'Retry Place', scale: 'region' }],
    });
    assert.equal(corrected.status, 'updated');
    assert.equal(retry.getResult().status, 'updated');
});

test('Atlas reads default to a compact summary and page explicit collections', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: Array.from({ length: 35 }, (_, index) => ({
            key: `place-${index}`,
            name: `Place ${index}`,
            scale: 'region',
            status: index % 2 ? 'mentioned' : 'visited',
        })),
        links: [{ from: 'place-0', to: 'place-1', kind: 'road', label: 'Main Road' }],
        actors: [
            { actorKey: 'player', locationKey: 'place-0' },
            { actorKey: 'keeper', displayName: 'Keeper', locationKey: 'place-1' },
        ],
    });

    const summary = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, {});
    assert.deepEqual(summary.data.counts, { locations: 35, links: 1, actors: 2, needsRegion: 0 });
    assert.equal(summary.data.player.displayName, 'Alice');
    assert.equal(Object.hasOwn(summary.data, 'atlas'), false);
    assert.equal(Object.hasOwn(summary.data, 'locations'), false);

    const firstPage = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, {
        mode: 'locations', limit: 10,
    });
    assert.equal(firstPage.data.count, 35);
    assert.equal(firstPage.data.returned, 10);
    assert.equal(firstPage.data.truncated, true);
    assert.equal(firstPage.data.nextOffset, 10);
    assert.deepEqual(firstPage.data.locations.map(location => location.key), Array.from({ length: 10 }, (_, index) => `place-${index}`));

    const filtered = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, {
        mode: 'locations', query: 'Place 3', status: 'mentioned', limit: 30,
    });
    assert.deepEqual(filtered.data.locations.map(location => location.key), ['place-3', 'place-31', 'place-33']);

    const links = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, {
        mode: 'links', from: 'place-1', query: 'main',
    });
    assert.equal(links.data.links.length, 1);
    assert.deepEqual([links.data.links[0].from, links.data.links[0].to, links.data.links[0].kind], ['place-0', 'place-1', 'road']);

    const actor = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, {
        mode: 'actors', actorKey: 'keeper',
    });
    assert.deepEqual(actor.data.actors, [{ actorKey: 'keeper', displayName: 'Keeper', locationKey: 'place-1' }]);

    const document = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, { mode: 'document' });
    assert.equal(document.data.atlas.locations.length, 35);
});

test('Atlas reads expose whether a location has a scene but never the internal Scene linkage', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Inn Room' }, { key: 'yard' }]));
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, indoorFixture);
    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, { locations: [{ key: 'yard', name: 'Yard' }] });
    const locations = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, { mode: 'locations' });
    const document = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, { mode: 'document' });
    const byKey = Object.fromEntries(locations.data.locations.map(location => [location.key, location]));
    assert.equal(byKey['Inn Room'].hasScene, true);
    assert.equal(byKey.yard.hasScene, false);
    for (const location of [...locations.data.locations, ...document.data.atlas.locations]) {
        assert.equal(Object.hasOwn(location, 'sceneKey'), false);
    }
});

test('Atlas edit rejects fields owned by the internal Scene linkage', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const result = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: [{ key: 'inn', name: 'Inn', sceneKey: 'manual-scene', aliases: ['old inn'] }],
    });
    assert.equal(result.status, 'failed');
    assert.equal(result.skipped[0].reason, 'location_has_unsupported_fields');
    assert.equal(await session.canCommit(), false);
});

test('declarative Atlas edits preserve region ownership with idempotent bidirectional routes', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const result = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: mapAtlasFixture([
            { key: 'inn', name: 'Inn', scale: 'building', status: 'visited' },
            { key: 'cellar', name: 'Cellar', parent: 'inn', scale: 'room', status: 'mentioned' },
        ]).atlas.locations,
        links: [{ from: 'inn', to: 'cellar', kind: 'stairs' }],
        actors: [{ actorKey: 'player', displayName: 'Wrong name', locationKey: 'inn' }],
    });
    assert.equal(result.status, 'updated');
    assert.equal(session.tools.some(tool => JSON.stringify(tool).includes('upsert-location')), false);
    const reversed = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        links: [{ from: 'cellar', to: 'inn', kind: 'stairs' }],
    });
    assert.equal(reversed.status, 'unchanged');
    await session.commit(() => true);
    const map = harness.map.readCurrent().map;
    assert.equal(map.atlas.locations.find(location => location.key === 'cellar').parent, 'inn');
    assert.equal(map.atlas.links.length, 1);
    assert.equal(map.atlas.links[0].id, result.applied.find(item => item.collection === 'links').id);
    assert.equal(map.atlas.actors[0].displayName, 'Alice');

    const unparent = await harness.participant.createSession(acceptedSource(), 'manual');
    const unparentResult = await unparent.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: [{ key: 'cellar', name: 'Cellar', parent: null }],
    });
    assert.equal(unparentResult.status, 'failed');
    assert.equal(unparentResult.skipped[0].reason, 'location_region_required');
    assert.equal(await unparent.canCommit(), false);
    assert.deepEqual(harness.map.readCurrent().map, map);
});

test('auto route IDs distinguish colon-bearing keys, long keys, and direction, and remain stable on retries', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const long = '市'.repeat(70);
    const routes = [
        { from: 'city:gate', to: 'road', kind: 'road' }, { from: 'city', to: 'gate:road', kind: 'road' },
        { from: 'city', to: 'gate:road', kind: 'road', bidirectional: false },
        { from: 'gate:road', to: 'city', kind: 'road', bidirectional: false },
        { from: `${long}:a`, to: 'b', kind: 'path' }, { from: long, to: 'a:b', kind: 'path' },
    ];
    const keys = [...new Set(routes.flatMap(route => [route.from, route.to]))];
    const first = await session.executeTool('MapAtlasEdit', { locations: keys.map(key => ({ key, name: key, scale: 'region' })), links: routes });
    assert.equal(first.ok, true);
    await session.commit(() => true);
    const before = harness.map.readCurrent().map.atlas.links;
    assert.equal(new Set(before.map(link => link.id)).size, routes.length);
    assert.ok(before.every(link => [...link.id].length <= 80));
    const retry = await harness.participant.createSession(acceptedSource(), 'manual');
    const reversed = routes.map(route => route.bidirectional === false ? route : { ...route, from: route.to, to: route.from });
    assert.equal((await retry.executeTool('MapAtlasEdit', { links: reversed })).status, 'unchanged');
    assert.deepEqual((await retry.executeTool('MapAtlasRead', { mode: 'document' })).data.atlas.links, before);
});

test('a valid 128-child region is deleted atomically with its links, scenes and actors', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const result = await session.executeTool('MapAtlasEdit', {
        locations: [{ key: 'region', name: 'Region', scale: 'region' }, { key: 'outside', name: 'Outside', scale: 'region' },
            ...Array.from({ length: 128 }, (_, index) => ({ key: `child-${index}`, name: `Child ${index}`, parent: 'region' }))],
        links: Array.from({ length: 128 }, (_, index) => ({ from: `child-${index}`, to: 'outside', kind: 'road' })),
        actors: [{ actorKey: 'player', locationKey: 'child-0' }, { actorKey: 'keeper', displayName: 'Keeper', locationKey: 'outside' }],
    });
    assert.equal(result.status, 'updated');
    assert.equal((await session.executeTool('MapSceneEdit', { ...indoorFixture, scene: 'child-0' })).ok, true);
    await session.commit(() => true);
    const removal = await harness.participant.createSession(acceptedSource(), 'manual');
    const deleted = await removal.executeTool('MapAtlasEdit', { remove: { locationKeys: ['region'] } });
    assert.equal(deleted.ok, true, JSON.stringify(deleted));
    assert.equal((await removal.executeTool('MapAtlasEdit', { remove: { locationKeys: ['region'] } })).status, 'unchanged');
    await removal.commit(() => true);
    await harness.map.refreshCurrent();
    const map = harness.map.readCurrent().map;
    assert.deepEqual(map.atlas.locations.map(place => place.key), ['outside']);
    assert.deepEqual(map.atlas.links, []); assert.deepEqual(map.scenes, {});
    assert.deepEqual(map.atlas.actors.map(actor => actor.actorKey), ['keeper']);
});

test('a rebuild cannot directly commit unresolved edits, but may commit after repair', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'rebuild');
    await session.executeTool('MapAtlasEdit', { locations: [{ key: 'good', name: 'Good', scale: 'region' }, { key: 'bad', name: '' }] });
    assert.equal(await session.canCommit(), false);
    assert.deepEqual(session.getResult(), { status: 'failed', changed: false });
    await assert.rejects(session.commit(() => true), /map_rebuild_edits_unresolved/);
    assert.equal(harness.writes.length, 0);
    await session.executeTool('MapAtlasEdit', { locations: [{ key: 'bad', name: 'Fixed', scale: 'region' }] });
    assert.equal(await session.canCommit(), true);
    await session.commit(() => true);
    assert.equal(harness.map.readCurrent().map.atlas.locations.length, 2);
});

test('Atlas retry tracking does not conflate identical location and actor keys', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const mixed = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: [
            { key: 'inn', name: 'Inn', scale: 'region' },
            { key: 'player', name: '' },
        ],
        actors: [{ actorKey: 'player', locationKey: 'inn' }],
    });
    assert.equal(mixed.status, 'partial');
    assert.equal(session.getResult().status, 'partial');

    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        actors: [{ actorKey: 'player', locationKey: 'inn' }],
    });
    assert.equal(session.getResult().status, 'partial');

    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: [{ key: 'player', name: 'Player Quarters', scale: 'region' }],
    });
    assert.equal(session.getResult().status, 'updated');
});

test('same-scene player updates and same-location Atlas edits preserve the actor icon', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Inn Room' }]));
    const first = await harness.participant.createSession(acceptedSource(), 'manual');
    await first.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, indoorFixture);
    await first.commit(() => true);

    const second = await harness.participant.createSession(acceptedSource(), 'manual');
    await second.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Inn Room',
        playerHere: true,
        elements: [{ id: 'table', cat: 'furniture', shape: 'rect', geo: { center: [120, 120], size: [40, 20] } }],
    });
    await second.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        actors: [{ actorKey: 'player', locationKey: 'Inn Room' }],
    });
    const read = await second.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Inn Room' });
    assert.equal(read.data.scene.elements.some(element => element.actorKey === 'player'), true);
});

test('Scene element patches preserve omitted fields, clear optional fields with null, and support deletion', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Workshop' }]));
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Workshop',
        mood: 'warm',
        elements: [{
            id: 'worktable',
            cat: 'furniture',
            kind: 'marker',
            shape: 'rect',
            geo: { center: [100, 80], size: [60, 30] },
            label: 'Workbench',
            icon: 'table',
            material: 'wood',
            certainty: 'confirmed',
        }],
    });

    const moved = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Workshop',
        elements: [{ id: 'worktable', geo: { center: [160, 120], size: [60, 30] } }],
    });
    assert.equal(moved.status, 'updated');
    let read = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Workshop' });
    let table = read.data.scene.elements.find(element => element.id === 'worktable');
    assert.deepEqual(table, {
        id: 'worktable',
        cat: 'furniture',
        kind: 'marker',
        shape: 'rect',
        geo: { center: [160, 120], size: [60, 30] },
        label: 'Workbench',
        icon: 'table',
        material: 'wood',
        certainty: 'confirmed',
    });

    const cleared = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Workshop',
        mood: null,
        elements: [{ id: 'worktable', kind: null, label: null, icon: null, material: null, certainty: null }],
    });
    assert.equal(cleared.status, 'updated');
    read = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Workshop' });
    table = read.data.scene.elements.find(element => element.id === 'worktable');
    assert.equal(Object.hasOwn(read.data.scene, 'mood'), false);
    for (const field of ['kind', 'label', 'icon', 'material', 'certainty']) {
        assert.equal(Object.hasOwn(table, field), false);
    }

    const removed = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Workshop',
        remove: ['worktable'],
    });
    assert.equal(removed.status, 'updated');
    read = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Workshop' });
    assert.equal(read.data.scene.elements.some(element => element.id === 'worktable'), false);
});

test('actor movement uses the merged canonical element and preserves an existing NPC name', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Inn' }, { key: 'Cellar' }]));
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Inn',
        elements: [{ id: 'keeper-inn', cat: 'actor', actorKey: 'keeper', shape: 'icon', geo: { at: [80, 80] }, label: 'Mara' }],
    });
    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Cellar',
        elements: [{ id: 'cellar-floor', cat: 'terrain', shape: 'rect', geo: { center: [100, 100], size: [180, 140] } }],
    });

    const incompleteMove = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Cellar',
        elements: [{ id: 'keeper-cellar', geo: { at: [70, 90] } }],
    });
    assert.equal(incompleteMove.status, 'failed');
    assert.equal(incompleteMove.skipped[0].reason, 'new_element_requires_category:keeper-cellar');
    let atlas = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, { mode: 'actors', actorKey: 'keeper' });
    assert.deepEqual(atlas.data.actors, [{ actorKey: 'keeper', displayName: 'Mara', locationKey: 'Inn' }]);
    let cellar = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Cellar' });
    assert.equal(cellar.data.scene.elements.some(element => element.id === 'keeper-cellar'), false);

    const movedByScene = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Cellar',
        elements: [{ id: 'keeper-cellar', cat: 'actor', actorKey: 'keeper', shape: 'icon', geo: { at: [70, 90] } }],
    });
    assert.equal(movedByScene.status, 'updated');
    assert.deepEqual(movedByScene.warnings, []);
    atlas = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, { mode: 'actors', actorKey: 'keeper' });
    assert.deepEqual(atlas.data.actors, [{ actorKey: 'keeper', displayName: 'Mara', locationKey: 'Cellar' }]);
    const inn = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Inn' });
    assert.equal(inn.data.scene.elements.some(element => element.actorKey === 'keeper'), false);

    const movedInsideScene = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Cellar',
        elements: [{ id: 'keeper-cellar', geo: { at: [90, 110] } }],
    });
    assert.equal(movedInsideScene.status, 'updated');
    atlas = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, { mode: 'actors', actorKey: 'keeper' });
    assert.deepEqual(atlas.data.actors, [{ actorKey: 'keeper', displayName: 'Mara', locationKey: 'Cellar' }]);
    cellar = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Cellar' });
    const keeper = cellar.data.scene.elements.find(element => element.id === 'keeper-cellar');
    assert.equal(keeper.cat, 'actor');
    assert.equal(keeper.actorKey, 'keeper');
    assert.equal(keeper.label, 'Mara');
    assert.deepEqual(keeper.geo, { at: [90, 110] });

    const movedByAtlas = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        actors: [{ actorKey: 'keeper', locationKey: 'Inn' }],
    });
    assert.equal(movedByAtlas.status, 'updated');
    atlas = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, { mode: 'actors', actorKey: 'keeper' });
    assert.deepEqual(atlas.data.actors, [{ actorKey: 'keeper', displayName: 'Mara', locationKey: 'Inn' }]);
    cellar = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Cellar' });
    assert.equal(cellar.data.scene.elements.some(element => element.actorKey === 'keeper'), false);
});

test('unnamed actors request a name while explicit label clearing remains available', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Inn' }]));
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const placed = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Inn',
        elements: [
            { id: 'stranger', cat: 'actor', actorKey: 'stranger', shape: 'icon', geo: { at: [60, 60] } },
            { id: 'player', cat: 'actor', kind: 'player', actorKey: 'player', shape: 'icon', geo: { at: [90, 90] } },
        ],
    });
    assert.equal(placed.status, 'updated');
    assert.equal(placed.warnings.length, 1);
    const named = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, { scene: 'Inn', elements: [{ id: 'stranger', label: 'Ivo' }] });
    assert.deepEqual(named.warnings, []);
    const atlas = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, { mode: 'actors', actorKey: 'stranger' });
    assert.equal(atlas.data.actors[0].displayName, 'Ivo');
    const cleared = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, { scene: 'Inn', elements: [{ id: 'stranger', label: null }] });
    assert.equal(cleared.status, 'updated');
    const read = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Inn' });
    assert.equal(Object.hasOwn(read.data.scene.elements.find(element => element.id === 'stranger'), 'label'), false);
    assert.equal(read.data.scene.elements.find(element => element.actorKey === 'player').label, 'Alice');
});

test('existing element category and actor identity cannot be rewritten by a patch', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Inn Room' }]));
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, indoorFixture);

    const patched = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Inn Room',
        elements: [
            { id: 'player-room', cat: 'not-a-category', kind: 'actor', actorKey: 'keeper', geo: { at: [240, 190] } },
            { id: 'room-terrain', cat: 'marker', geo: { center: [200, 150], size: [300, 200] } },
            { id: 'keeper-room', cat: 'actor', kind: 'player', actorKey: 'keeper', shape: 'icon', geo: { at: [160, 120] }, label: 'Mara' },
        ],
    });
    assert.equal(patched.status, 'failed');
    assert.deepEqual(patched.skipped.map(item => item.id), ['player-room', 'room-terrain', 'keeper-room']);
    assert.ok(patched.skipped.every(item => item.inputIssues.length));

    const scene = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Inn Room' });
    const player = scene.data.scene.elements.find(element => element.id === 'player-room');
    const terrain = scene.data.scene.elements.find(element => element.id === 'room-terrain');
    assert.equal(player.cat, 'actor');
    assert.equal(player.actorKey, 'player');
    assert.equal(player.kind, 'player');
    assert.equal(player.label, 'Alice');
    assert.deepEqual(player.geo, { at: [200, 180] });
    assert.equal(terrain.cat, 'terrain');
    assert.equal(scene.data.scene.elements.some(element => element.id === 'keeper-room'), false);

    const actors = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, { mode: 'actors' });
    assert.deepEqual(actors.data.actors, [
        { actorKey: 'player', displayName: 'Alice', locationKey: 'Inn Room' },
    ]);
});

test('a canonical player element marks its location visited without playerHere', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Quiet Room', status: 'mentioned' }]));
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const result = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Quiet Room',
        elements: [
            { id: 'floor', cat: 'terrain', shape: 'rect', geo: { center: [100, 80], size: [180, 120] } },
            { id: 'player-quiet-room', cat: 'actor', kind: 'player', actorKey: 'player', shape: 'icon', geo: { at: [100, 90] } },
        ],
    });
    assert.equal(result.status, 'updated');

    const locations = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, {
        mode: 'locations', query: 'Quiet Room',
    });
    assert.equal(locations.data.locations[0].status, 'visited');
});

test('Scene tools report unsupported fields precisely while retaining the geo.icon tolerance', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Gallery' }]));
    const rootSession = await harness.participant.createSession(acceptedSource(), 'manual');
    const rootFailure = await rootSession.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Gallery', elements: [], operation: 'draw',
    });
    assert.equal(rootFailure.status, 'failed');
    assert.equal(rootFailure.skipped[0].reason, 'scene_has_unsupported_fields');
    assert.match(rootFailure.skipped[0].hint, /operation/);

    const itemSession = await harness.participant.createSession(acceptedSource(), 'manual');
    const mixed = await itemSession.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Gallery',
        elements: [
            { id: 'valid', cat: 'marker', shape: 'icon', geo: { at: [40, 40], icon: 'marker' } },
            { id: 'bad-element', cat: 'marker', shape: 'icon', geo: { at: [60, 40] }, position: [60, 40] },
            { id: 'bad-geo', cat: 'marker', shape: 'icon', geo: { at: [80, 40], position: [80, 40] } },
        ],
    });
    assert.equal(mixed.status, 'partial');
    assert.deepEqual(mixed.skipped.map(item => item.reason), [
        'element_has_unsupported_fields:position',
        'invalid_arguments',
    ]);
    assert.equal(mixed.skipped[1].inputIssues[0].path, 'elements[2].geo.position');
    const read = await itemSession.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Gallery' });
    assert.deepEqual(read.data.scene.elements.map(element => element.id), ['valid']);
    assert.equal(read.data.scene.elements[0].icon, 'marker');
    assert.throws(
        () => itemSession.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_READ, { scene: 'Gallery', extra: true }),
        /unsupported fields: extra/,
    );
});

test('all-invalid scene edits and zero-write rebuilds do not replace Map data', async () => {
    const initial = mapAtlasFixture([{ key: 'Void' }]);
    const harness = createHarness(initial);
    const invalid = await harness.participant.createSession(acceptedSource(), 'manual');
    const result = await invalid.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Void',
        elements: [{ id: 'bad', cat: 'terrain', shape: 'rect', geo: { size: [0, 0] } }],
    });
    assert.equal(result.status, 'failed');
    assert.equal(result.skipped[0].collection, 'elements');
    assert.equal(await invalid.canCommit(), false);
    assert.equal(invalid.getResult().status, 'failed');
    assert.equal(harness.writes.length, 0);

    const untouched = await harness.participant.createSession(acceptedSource(), 'rebuild');
    assert.equal(untouched.getResult().status, 'unchanged');
    assert.equal(await untouched.canCommit(), false);
    assert.deepEqual(harness.map.readCurrent().map, initial);
});

test('correcting a failed first-scene call clears its call-level failure', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Observatory' }]));
    const session = await harness.participant.createSession(acceptedSource(), 'manual');
    const empty = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Observatory',
        elements: [],
    });
    assert.equal(empty.status, 'failed');

    const corrected = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, {
        scene: 'Observatory',
        elements: [{ id: 'platform', cat: 'terrain', geo: { center: [100, 100], size: [160, 120] } }],
    });
    assert.equal(corrected.status, 'updated');
    assert.equal(session.getResult().status, 'updated');
});

test('a missing scene owner is repaired within the same maintenance run before commit', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'rebuild');
    const rejected = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, indoorFixture);
    assert.equal(rejected.status, 'failed');
    assert.equal(rejected.skipped[0].reason, 'scene_location_required');
    assert.equal(await session.canCommit(), false);
    assert.equal(harness.writes.length, 0);
    const atlas = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: mapAtlasFixture([{ key: 'Inn Room' }]).atlas.locations,
    });
    assert.equal(atlas.status, 'updated');
    assert.equal((await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, indoorFixture)).status, 'updated');
    assert.equal(session.getResult().status, 'updated');
    assert.equal(await session.canCommit(), true);
    await session.commit(() => true);
    assert.equal(harness.writes.length, 1);
    assert.equal(harness.map.readCurrent().map.atlas.locations.find(item => item.key === 'Inn Room').parent, 'fixture-region');
});

test('session invalidation and commit guards prevent stale writes', async () => {
    const harness = createHarness(mapAtlasFixture([{ key: 'Inn Room' }]));
    const invalidated = await harness.participant.createSession(acceptedSource(), 'manual');
    await invalidated.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, indoorFixture);
    invalidated.invalidate('chat-changed');
    await assert.rejects(invalidated.commit(() => true), /session_invalid/);

    const guarded = await harness.participant.createSession(acceptedSource(), 'manual');
    await guarded.executeTool(MAP_MAINTENANCE_TOOL_NAMES.SCENE_EDIT, indoorFixture);
    await assert.rejects(guarded.commit(() => false), /commit_guard_rejected/);
    assert.equal(harness.writes.length, 0);
});

test('world destinations persist before a visit or scene and later edits preserve their geography', async () => {
    const harness = createHarness();
    const session = await harness.participant.createSession(acceptedSource(), 'rebuild');
    const result = await session.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: [
            { key: 'coast', name: '潮汐海岸', scale: 'region', terrain: 'water' },
            { key: 'home', name: '家', parent: 'coast', scale: 'building', position: [200, 650] },
            { key: 'lighthouse', name: '潮声灯塔', parent: 'coast', scale: 'building', position: [750, 100], terrain: 'water', brief: '可以俯瞰整片海湾的古老灯塔。' },
        ],
        links: [{ from: 'home', to: 'lighthouse', kind: 'road' }],
        actors: [{ actorKey: 'player', locationKey: 'home' }],
    });
    assert.equal(result.status, 'updated');
    await session.commit(() => true);
    let map = harness.map.readCurrent().map;
    const destination = map.atlas.locations.find(place => place.key === 'lighthouse');
    assert.deepEqual(destination.position, [750, 100]);
    assert.equal(destination.status, 'mentioned');
    assert.equal(destination.terrain, 'water');
    assert.equal(map.atlas.locations.find(place => place.key === 'home').status, 'visited');
    assert.equal(map.atlas.actors[0].locationKey, 'home');
    assert.deepEqual(map.scenes, {});
    const prompt = buildMapPromptBlock(map);
    assert.match(prompt, /当前位置：家/u);
    assert.match(prompt, /潮声灯塔/u);
    assert.doesNotMatch(prompt, /750|position|terrain|sceneKey/);

    const update = await harness.participant.createSession(acceptedSource(), 'manual');
    await update.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, {
        locations: [{ key: 'lighthouse', name: '潮声灯塔', brief: '海湾北侧的观景地。' }],
    });
    const read = await update.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_READ, { mode: 'locations', query: '潮声灯塔' });
    assert.deepEqual(read.data.locations[0].position, [750, 100]);
    assert.equal(read.data.locations[0].terrain, 'water');
    assert.equal(read.data.locations[0].status, 'mentioned');
    await update.commit(() => true);
    map = harness.map.readCurrent().map;
    assert.equal(map.atlas.actors[0].locationKey, 'home');

    for (const patch of [{ position: [0] }, { position: [Infinity, 0] }, { position: [0, 1e9] }, { terrain: 'made-up' }]) {
        const invalid = await harness.participant.createSession(acceptedSource(), 'manual');
        const rejected = await invalid.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, { locations: [{ key: 'lighthouse', name: '潮声灯塔', ...patch }] });
        assert.equal(rejected.status, 'failed');
        assert.equal(await invalid.canCommit(), false);
        assert.deepEqual(harness.map.readCurrent().map, map);
    }
    const clear = await harness.participant.createSession(acceptedSource(), 'manual');
    await clear.executeTool(MAP_MAINTENANCE_TOOL_NAMES.ATLAS_EDIT, { locations: [{ key: 'lighthouse', name: '潮声灯塔', position: null, terrain: null }] });
    await clear.commit(() => true);
    const cleared = harness.map.readCurrent().map.atlas.locations.find(place => place.key === 'lighthouse');
    assert.equal(Object.hasOwn(cleared, 'position'), false);
    assert.equal(Object.hasOwn(cleared, 'terrain'), false);
});
