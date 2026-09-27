import assert from 'node:assert/strict';
import test from 'node:test';
import { createMapKernelHarness } from './map-kernel-harness.js';
import { administratorHarness, settled, withLoadedTools } from './administrator-harness.js';
import { createMapManagement } from '../apps/map/management/participant.js';
import { createEmptyMapDomain } from '../domains/map/state.js';
import { createProductionMapModule } from '../apps/map/production-module.js';
import { createAppModuleRegistry } from '../kernel/app-registry.js';
import { createManagementRegistry, MANAGEMENT_CAPABILITY } from '../capabilities/management/index.js';
import { MANAGEMENT_READ_CHARS } from '../capabilities/management/read-page.js';
import { createEmptyWorld } from '../domains/world/types.js';
import { createAdministratorToolExecutor } from '../apps/administrator/agent/tool-executor.js';
import { createAdministratorChatReader } from '../apps/administrator/host/chat-reader.js';
import { userEconomyHarness } from './user-economy-harness.js';
import { TASKS_PARTITION } from '../apps/tasks/partition.js';
import { USER_DOCUMENT_FILENAME } from '../kernel/user-document.js';

const player = () => ({ actorKey: 'player', displayName: 'Player' });
const set = (path, value) => ({ op: 'set', path, value });
const read = (session, path = '', offset = 0) => session.execute('MapAtlasRead', { mode: 'document', path, offset }, () => true);
const edit = (session, patches, guard = () => true) => session.execute('MapAtlasEdit', { patches }, guard);

for (const phase of ['install', 'activate', 'background']) {
    test(`production management registration survives ${phase} failure, retries and disposal without APP use`, async t => {
        const data = createEmptyMapDomain(); data.schemaVersion = 99;
        const h = createMapKernelHarness(data), management = createManagementRegistry();
        const production = createProductionMapModule({ getPlayerDisplayName: () => 'Player' });
        let broken = true, released = 0;
        const fail = () => { if (broken) { throw new TypeError('fixture-runtime-failed'); } };
        const module = { ...production, async install({ execution }) {
            execution.addCleanup(() => { released++; });
            if (phase === 'install') { fail(); }
            return { activate: fail, startBackground: fail };
        } };
        const apps = createAppModuleRegistry([module], { createStore: () => h.store, files: h.coordinator,
            hasCapability: () => true, requireCapability(token) { assert.equal(token, MANAGEMENT_CAPABILITY); return management; } });
        t.after(async () => { await apps.dispose(); h.map.dispose(); });
        await apps.installAll();
        assert.equal(h.state.reads, 0);
        assert.equal(management.list().length, 1);
        if (phase === 'activate') { await assert.rejects(apps.activate('map', {})); }
        if (phase === 'background') { await apps.startBackground(); }
        assert.equal(apps.status('map').state, 'failed');
        assert.equal(released, 1);
        const participant = management.get('map');
        assert.deepEqual(participant.tools.map(tool => tool.definition.function.name), ['MapAtlasRead', 'MapAtlasEdit', 'MapSceneRead', 'MapSceneEdit']);
        const session = await participant.open();
        assert.equal(session.initial.validation.valid, false);
        assert.equal((await edit(session, [set('/schemaVersion', 1)])).status, 'saved');
        assert.equal(h.map.readCurrent().map.schemaVersion, 1);
        broken = false;
        await apps.retry('map'); await apps.retry('map');
        assert.equal(management.get('map'), participant);
        assert.equal(apps.status('map').state, 'ready');
        await apps.dispose();
        assert.equal(management.list().length, 0);
        assert.equal(released, 3);
    });
}

test('first use: administrator loads map tools and creates a map without opening the map APP', async () => {
    const h = await administratorHarness({}, { fresh: true });
    let step = 0;
    h.state.generate = withLoadedTools(['map'], async () => step++ === 0 ? {
        toolCalls: [{ id: 'create', name: 'MapAtlasEdit', arguments: JSON.stringify({ locations: [{ key: 'harbor', name: 'Harbor', scale: 'region' }] }) }],
    } : { text: 'done' });
    await h.request('send', { text: 'Create the harbor' }); await settled(h.runtime);
    assert.equal(h.map.readCurrent().map.atlas.locations[0].key, 'harbor');
    assert.equal(h.repository.read().turns[0].status, 'finished');
});

test('invalid predecessor can be corrected; invalid replacement leaves every partition intact and can be corrected in the same session', async t => {
    const data = createEmptyMapDomain(); data.atlas.locations = 'damaged';
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    h.state.persisted.partitions.unrelated = { keep: ['exact', 7] };
    const session = await createMapManagement(h.map, player).open();
    assert.deepEqual(JSON.parse(session.initial.text), data);
    const original = structuredClone(h.state.persisted);
    assert.equal((await edit(session, [set('/atlas/locations', {})])).status, 'failed');
    assert.deepEqual(h.state.persisted, original); assert.equal(h.state.writes.length, 0);
    assert.equal((await edit(session, [set('/atlas/locations', [])])).status, 'saved');
    assert.deepEqual(h.state.persisted.partitions.unrelated, original.partitions.unrelated);
    assert.deepEqual(h.state.persisted.partitions.map, { ...createEmptyMapDomain(), revision: 1 });
    const again = await createMapManagement(h.map, player).open();
    assert.equal(again.initial.mode, 'summary');
});

test('document corrections use a read snapshot and reject stale data and chat changes', async t => {
    const h = createMapKernelHarness(createEmptyMapDomain()); t.after(h.map.dispose);
    const a = await createMapManagement(h.map, player).open(), b = await createMapManagement(h.map, player).open();
    assert.equal((await edit(a, [set('/atlas/locations', [])])).code, 'management_document_read_required');
    await read(a, '/schemaVersion');
    assert.equal((await edit(a, [set('/atlas/locations', [])])).code, 'management_document_read_required');
    await read(a, '/atlas/locations');
    assert.equal((await edit(a, [set('/atlas/locations', [])])).status, 'unchanged');
    await read(a, '/atlas/locations');
    await b.execute('MapAtlasEdit', { locations: [{ key: 'port', name: 'Port', scale: 'region' }] }, () => true);
    const original = structuredClone(h.state.persisted);
    await assert.rejects(edit(a, [set('/atlas/locations', [])]));
    assert.deepEqual(h.state.persisted, original);
    const c = await createMapManagement(h.map, player).open();
    await read(c);
    h.state.capture.identityKey = 'another-chat';
    await assert.rejects(edit(c, [set('/atlas/locations', [])]));
    assert.deepEqual(h.state.persisted, original);
});

test('large invalid JSON is paged losslessly and a requested rebuild does not require reading every page', async t => {
    const data = createEmptyMapDomain(); data.atlas.locations = '坏🙂'.repeat(MANAGEMENT_READ_CHARS);
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    const session = await createMapManagement(h.map, player).open();
    let text = session.initial.text, offset = session.initial.nextOffset;
    while (offset !== null) {
        const page = (await read(session, '', offset)).data;
        text += page.text; offset = page.nextOffset;
    }
    assert.deepEqual(JSON.parse(text), data);
    const rebuilding = await createMapManagement(h.map, player).open();
    assert.notEqual(rebuilding.initial.nextOffset, null);
    assert.equal((await edit(rebuilding, [set('', createEmptyMapDomain())])).status, 'saved');
    assert.deepEqual(h.map.readCurrent().map, { ...createEmptyMapDomain(), revision: 1 });
});

test('uncertain repair confirms its original candidate without a duplicate write', async t => {
    const data = createEmptyMapDomain(); data.schemaVersion = 99;
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    const session = await createMapManagement(h.map, player).open();
    h.state.replaceImpl = async input => { h.state.persisted = structuredClone(input.candidate); return { status: 'unconfirmed', observed: null }; };
    await assert.rejects(edit(session, [set('/schemaVersion', 1)]));
    assert.equal(h.state.writes.length, 1);
    h.state.replaceImpl = null;
    assert.equal((await session.recover(() => true)).status, 'saved');
    assert.equal(h.state.writes.length, 1);
    assert.equal(h.map.readCurrent().map.revision, 1);
});

test('World uses the same validated correction path; damaged task history is readable but cannot bypass settlement', async () => {
    const world = createEmptyWorld(); world.overview = 7;
    const tasks = { schemaVersion: 2, events: 'damaged' };
    const h = await administratorHarness({ world, tasks });
    const session = await h.registry.get('world').open();
    assert.equal(session.initial.validation.valid, false);
    assert.equal((await session.execute('WorldEdit', { patches: [set('/overview', 'Restored')] }, () => true)).status, 'saved');
    assert.equal(h.world.readCurrent().world.overview, 'Restored');
    const taskSession = await h.registry.get('tasks').open();
    assert.deepEqual(JSON.parse(taskSession.initial.text), tasks);
    assert.equal((await taskSession.execute('TaskComplete', { taskId: 'unknown' }, () => true)).status, 'failed');
    assert.deepEqual(h.state.persisted.partitions.tasks, tasks);
    assert.equal(h.economy.getPlayerBalance(), 100);
});

test('a failed initial read never removes tools; a later read retries within the same administrator run', async () => {
    const h = await administratorHarness();
    const original = h.registry.get('map');
    let broken = true;
    h.registry = createManagementRegistry();
    h.registry.register({ ...original, async open() { if (broken) { throw Object.assign(new Error('fixture-read'), { code: 'storage_read_failed' }); } return original.open(); } });
    const executor = await createAdministratorToolExecutor({ registry: h.registry,
        reader: createAdministratorChatReader(h.capture, () => new AbortController().signal), readEnvironment: h.readEnvironment,
        operations: [], guard: () => true, onChange() {}, async saveReceipts() {} });
    assert.equal(executor.data.readErrors[0].code, 'storage_read_failed');
    assert.equal((await executor.execute('ToolsLoad', { apps: ['map'] }, 'load', 0)).status, 'read');
    assert.ok(executor.getTools().some(tool => tool.function.name === 'MapAtlasRead'));
    assert.equal((await executor.execute('MapAtlasRead', {}, 'read-1', 1)).status, 'failed');
    broken = false;
    assert.equal((await executor.execute('MapAtlasRead', {}, 'read-2', 2)).status, 'read');
});

test('raw user-story reads preserve corrupt JSON and stay scoped to the selected chat without rewriting the user file', async () => {
    const h = await userEconomyHarness();
    await h.transactions.prepare();
    const data = structuredClone(h.document());
    data.stories.a = { tasks: { schemaVersion: 2, events: 'broken-a' } };
    data.stories.b = { tasks: null };
    h.state.files.set(USER_DOCUMENT_FILENAME, data);
    const writes = h.state.writes.length;
    const store = h.store(TASKS_PARTITION);
    await assert.rejects(store.read(), { code: 'partition_invalid' });
    assert.deepEqual((await store.readRaw()).value, data.stories.a.tasks);
    h.switchStory('b');
    assert.equal((await store.readRaw()).value, null);
    h.switchStory('c');
    assert.equal((await store.readRaw()).value, undefined);
    assert.equal(h.state.writes.length, writes);
    assert.deepEqual(h.document(), data);
});

test('null stored map is invalid rather than absent, and array patches address preceding patch results', async t => {
    const data = createEmptyMapDomain();
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    h.state.persisted.partitions.map = null;
    const invalid = await createMapManagement(h.map, player).open();
    assert.equal(invalid.initial.validation.present, true);
    assert.equal(invalid.initial.validation.valid, false);
    assert.equal((await edit(invalid, [set('', data)])).status, 'saved');
    const session = await createMapManagement(h.map, player).open();
    await session.execute('MapAtlasEdit', { locations: ['a', 'b', 'c'].map(key => ({ key, name: key, scale: 'region' })) }, () => true);
    await read(session, '/atlas/locations/0');
    assert.equal((await edit(session, [{ op: 'remove', path: '/atlas/locations/0' }])).status, 'saved');
    assert.deepEqual(h.map.readCurrent().map.atlas.locations.map(location => location.key), ['b', 'c']);
    await read(session, '/atlas/locations');
    assert.equal((await edit(session, [{ op: 'remove', path: '/atlas/locations/0' }, set('/atlas/locations/0/name', 'Updated')])).status, 'saved');
    assert.deepEqual(h.map.readCurrent().map.atlas.locations.map(location => location.key), ['c']);
    assert.equal(h.map.readCurrent().map.atlas.locations[0].name, 'Updated');
});

for (const confirmation of ['immediate', 'readback']) {
    test(`a ${confirmation} repair preserves its saved baseline for later edits and detects concurrent changes`, async t => {
        const data = createEmptyMapDomain(); data.schemaVersion = 99;
        data.atlas.locations = [{ key: 'town', name: 'Original', scale: 'region', status: 'mentioned' }];
        const h = createMapKernelHarness(data); t.after(h.map.dispose);
        const participant = createMapManagement(h.map, player), repairing = await participant.open();
        if (confirmation === 'readback') {
            h.state.replaceImpl = async input => { h.state.persisted = structuredClone(input.candidate); return { status: 'unconfirmed', observed: null }; };
            await assert.rejects(edit(repairing, [set('/schemaVersion', 1)]));
            h.state.replaceImpl = null;
            assert.equal((await h.map.confirmPending()).status, 'confirmed');
            assert.equal((await repairing.confirmSaved()).status, 'confirmed');
        } else {
            assert.equal((await edit(repairing, [set('/schemaVersion', 1)])).status, 'saved');
        }
        assert.equal(h.state.writes.length, 1);
        const concurrent = await participant.open();
        await concurrent.execute('MapAtlasEdit', { locations: [{ key: 'town', name: 'Concurrent' }] }, () => true);
        const before = structuredClone(h.state.persisted), writes = h.state.writes.length;
        await assert.rejects(repairing.execute('MapAtlasEdit', { locations: [{ key: 'town', name: 'Stale' }] }, () => true));
        assert.deepEqual(h.state.persisted, before); assert.equal(h.state.writes.length, writes);
        await repairing.execute('MapAtlasRead', { mode: 'locations' }, () => true);
        assert.equal((await repairing.execute('MapAtlasEdit', { locations: [{ key: 'town', name: 'Reconciled' }] }, () => true)).status, 'saved');
        assert.equal(h.map.readCurrent().map.atlas.locations[0].name, 'Reconciled');
    });
}

test('an invalid session cannot silently adopt an external repair as its own read baseline', async t => {
    const data = createEmptyMapDomain(); data.schemaVersion = 99;
    data.atlas.locations = [{ key: 'town', name: 'Original', scale: 'region', status: 'mentioned' }];
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    const participant = createMapManagement(h.map, player), waiting = await participant.open(), repairing = await participant.open();
    await edit(repairing, [set('/schemaVersion', 1), set('/atlas/locations/0/name', 'Repaired elsewhere')]);
    await assert.rejects(waiting.execute('MapAtlasEdit', { locations: [{ key: 'town', name: 'Stale' }] }, () => true));
    assert.equal(h.map.readCurrent().map.atlas.locations[0].name, 'Repaired elsewhere');
});

test('repairs advance the stored revision independently of the replacement counter', async t => {
    const data = createEmptyMapDomain(); data.revision = 10;
    data.atlas.locations = [{ key: 'town', name: 'Original', scale: 'region', status: 'mentioned' }];
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    await h.map.refreshCurrent();
    const stale = h.map.readCurrent().map, session = await createMapManagement(h.map, player).open();
    await read(session);
    assert.equal((await edit(session, [set('/atlas/locations/0/name', 'Repaired'), set('/revision', 9)])).status, 'saved');
    assert.equal(h.map.readCurrent().map.revision, 11);
    stale.atlas.locations[0].brief = 'Old work';
    await assert.rejects(h.map.replaceCurrent(stale, { expectedRevision: 10 }), { code: 'map_revision_conflict' });
    assert.equal(h.map.readCurrent().map.atlas.locations[0].name, 'Repaired');
    assert.equal(h.state.writes.length, 1);
});

test('a damaged revision can be corrected, and the final prepared value is validated before saving', async t => {
    const data = createEmptyMapDomain(); data.revision = 'damaged';
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    const session = await createMapManagement(h.map, player).open();
    const invalid = await edit(session, [set('/revision', Number.MAX_SAFE_INTEGER)]);
    assert.equal(invalid.status, 'failed'); assert.equal(invalid.data.validation.valid, false);
    assert.equal(await session.confirmSaved(), null);
    assert.equal(h.state.writes.length, 0);
    assert.equal((await edit(session, [set('/revision', 0)])).status, 'saved');
    assert.equal(h.map.readCurrent().map.revision, 1);
});

test('a targeted repair preserves unrelated records without reading the whole document', async t => {
    const data = createEmptyMapDomain(); data.schemaVersion = 99;
    data.atlas.locations = Array.from({ length: 90 }, (_, index) => ({ key: `town-${index}`, name: `Town ${index}`,
        scale: 'region', status: 'mentioned', brief: 'Local geography. '.repeat(20).trim() }));
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    const session = await createMapManagement(h.map, player).open();
    assert.notEqual(session.initial.nextOffset, null);
    await read(session, '/schemaVersion');
    assert.equal((await edit(session, [set('/schemaVersion', 1)])).status, 'saved');
    assert.deepEqual(h.map.readCurrent().map.atlas, data.atlas);
});

test('reading another path cannot acknowledge a concurrent change to the original patch target', async t => {
    const data = createEmptyMapDomain();
    data.atlas.locations = [{ key: 'town', name: 'Original', scale: 'region', status: 'mentioned' }];
    const h = createMapKernelHarness(data); t.after(h.map.dispose);
    const participant = createMapManagement(h.map, player), a = await participant.open(), b = await participant.open();
    await read(a, '/atlas/locations/0');
    await b.execute('MapAtlasEdit', { locations: [{ key: 'town', name: 'Concurrent' }] }, () => true);
    await read(a, '/schemaVersion');
    const before = structuredClone(h.state.persisted);
    assert.equal((await edit(a, [set('/atlas/locations/0/name', 'Stale')])).code, 'management_document_read_required');
    assert.deepEqual(h.state.persisted, before);
    await read(a, '/atlas/locations/0');
    assert.equal((await edit(a, [set('/atlas/locations/0/name', 'Reconciled')])).status, 'saved');
});

for (const app of ['map', 'world']) {
    test(`${app}: malformed patches return actionable failures and the administrator continues in the same run`, async () => {
        const invalid = app === 'map' ? { ...createEmptyMapDomain(), schemaVersion: 99 } : { ...createEmptyWorld(), overview: 7 };
        const tool = app === 'map' ? 'MapAtlasEdit' : 'WorldEdit';
        const correction = app === 'map' ? set('/schemaVersion', 1) : set('/overview', 'Restored');
        const h = await administratorHarness({ [app]: invalid });
        const badInputs = [
            { patches: [correction, { op: 'remove', path: '/missing' }] },
            { patches: [set('/missing/child', true)] },
            { patches: [{ op: 'set', path: '/overview' }] },
            { patches: [set('invalid-path', true)] },
            { patches: [{ op: 'remove', path: '' }] },
            { patches: [] },
        ];
        let step = 0;
        h.state.generate = withLoadedTools([app], async request => {
            if (step > 0 && step <= badInputs.length) {
                const response = JSON.parse(request.messages.filter(message => message.role === 'tool').at(-1).content);
                assert.equal(response.status, 'failed'); assert.equal(response.ok, false);
                assert.equal(typeof response.code, 'string'); assert.equal(typeof response.data.message, 'string');
                assert.equal(h.coordinator.hasPendingCommit(), false);
                assert.deepEqual(h.state.persisted.partitions[app], invalid);
            }
            const args = badInputs[step] ?? { patches: [correction] };
            return step++ <= badInputs.length
                ? { toolCalls: [{ id: `patch-${step}`, name: tool, arguments: JSON.stringify(args) }] } : { text: 'Done' };
        });
        await h.request('send', { text: 'Repair the record' }); await settled(h.runtime);
        const turn = h.repository.read().turns[0];
        assert.equal(turn.status, 'finished');
        const outcomes = turn.toolMessages.filter(message => message.role === 'tool' && message.toolName === tool).map(message => JSON.parse(message.content));
        assert.deepEqual(outcomes.map(outcome => outcome.status), [...badInputs.map(() => 'failed'), 'saved']);
        assert.equal(h.coordinator.hasPendingCommit(), false);
    });
}
