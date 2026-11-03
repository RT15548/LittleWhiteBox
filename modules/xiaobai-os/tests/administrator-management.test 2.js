import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled, withLoadedTools } from './administrator-harness.js';
import { createTasksManagement } from '../apps/tasks/management/participant.js';
import { createMapManagement } from '../apps/map/management/participant.js';
import { createWorldManagement } from '../apps/world/management/participant.js';
import { mapAtlasFixture } from './fixtures/map-atlas.js';

async function receivedTask(h) {
    await h.tasks.refreshCurrent();
    const board = await h.tasks.replaceBoard({ expectedBoardId: null, generatedAt: 10, listings: [{ grade: 'B', tags: ['禁忌'], posture: '中介入', title: '送信', hook: '把信送给守卫', objective: '守卫收到信', requirements: '必须亲手送信并汇报', location: '钟楼', timing: '任意时候', risk: '盘查', reward: 150 }] }, () => true);
    return (await h.tasks.acceptListing({ actionId: 'accept', boardId: board.view.domain.board.boardId, listingId: board.view.domain.board.listings[0].listingId }, () => true)).record;
}
test('task management completes an active objective through its existing atomic reward; retry confirms the original action without another payment', async () => {
    const h = await administratorHarness(), record = await receivedTask(h);
    const session = await createTasksManagement(h.tasks, () => 30).open();
    h.state.replace = async input => { h.state.persisted = structuredClone(input.candidate); return { status: 'unconfirmed', observed: null }; };
    await assert.rejects(session.execute('TaskComplete', { taskId: record.taskId, revision: record.taskRevision, resultSummary: '第55楼：信由同伴转交，守卫已收下。' }, () => true));
    const writes = h.state.writes.length;
    h.state.replace = null;
    assert.equal((await session.recover(() => true)).status, 'saved');
    assert.equal(h.state.writes.length, writes);
    assert.equal(h.economy.getPlayerBalance(), 250);
    assert.equal(h.tasks.readCurrent().records[0].status, 'completed');
    assert.equal((await session.execute('TaskComplete', { taskId: record.taskId, revision: record.taskRevision, resultSummary: '重复' }, () => true)).status, 'failed');
    assert.equal(h.economy.getPlayerBalance(), 250);
});
test('source changes block a new write and an unconfirmed retry that would have to dispatch again', async () => {
    const h = await administratorHarness(); let step = 0;
    h.state.generate = withLoadedTools(['world'], async () => {
        if (step++ === 0) { return { toolCalls: [{ id: 'read', name: 'ChatRead', arguments: '{"from":55}' }] }; }
        if (step === 2) { h.state.messages[55].swipe_id++; return { toolCalls: [{ id: 'write', name: 'WorldEdit', arguments: '{"overview":"旧证据"}' }] }; }
        return { text: '原文版本改变，需要重新查阅。' };
    });
    await h.request('send', { text: '根据55楼更正概况' }); await settled(h.runtime);
    assert.equal(h.world.readCurrent().world.overview, '');
    const session = await createWorldManagement(h.world).open();
    h.state.replace = async () => ({ status: 'unconfirmed', observed: h.state.persisted });
    await assert.rejects(session.execute('WorldEdit', { overview: '旧证据' }, () => true));
    const writes = h.state.writes.length;
    h.state.replace = null;
    await assert.rejects(session.recover(() => false));
    assert.equal(h.state.writes.length, writes); assert.equal(h.world.readCurrent().world.overview, '');
});
test('World and Map reject competing changes to the same object and preserve independent changes', async () => {
    const h = await administratorHarness();
    const one = await createWorldManagement(h.world).open(), two = await createWorldManagement(h.world).open();
    await two.execute('WorldEdit', { overview: '新的概况' }, () => true);
    await assert.rejects(one.execute('WorldEdit', { overview: '过时概况' }, () => true));
    assert.equal(h.world.readCurrent().world.overview, '新的概况');
    const mapOne = await createMapManagement(h.map, () => ({ actorKey: 'player', displayName: '玩家' })).open();
    const mapTwo = await createMapManagement(h.map, () => ({ actorKey: 'player', displayName: '玩家' })).open();
    await mapTwo.execute('MapAtlasEdit', { locations: [{ key: 'new-port', name: '新港', scale: 'region' }] }, () => true);
    const before = h.map.readCurrent().map;
    await assert.rejects(mapOne.execute('MapAtlasEdit', { locations: [{ key: 'new-port', name: '旧港', scale: 'region' }] }, () => true));
    assert.deepEqual(h.map.readCurrent().map, before);
    await mapOne.execute('MapAtlasEdit', { locations: [{ key: 'other-port', name: '另一个港', scale: 'region' }] }, () => true);
    assert.deepEqual(h.map.readCurrent().map.atlas.locations.map(l => l.key), ['new-port', 'other-port']);
});
test('map administrator reports partial success with real saved and skipped item reports', async () => {
    const h = await administratorHarness();
    const session = await createMapManagement(h.map, () => ({ actorKey: 'player', displayName: '玩家' })).open();
    const result = await session.execute('MapAtlasEdit', { locations: [{ key: 'new-port', name: '新港', scale: 'region' }, { key: 'invalid', name: '', scale: 'invalid' }] }, () => true);
    assert.equal(result.status, 'partial'); assert.equal(result.data.applied.length, 1); assert.equal(result.data.skipped.length, 1);
    assert.equal(h.map.readCurrent().map.atlas.locations.length, 1);
});

test('administrator scene pages round-trip through the published edit schema and preserve atlas metadata', async () => {
    const h = await administratorHarness();
    const session = await createMapManagement(h.map, () => ({ actorKey: 'player', displayName: 'Player' })).open();
    await session.execute('MapAtlasEdit', { locations: mapAtlasFixture([{ key: 'room', name: 'Room', scale: 'building' }]).atlas.locations }, () => true);
    await session.execute('MapSceneEdit', { scene: 'room', elements: [
        { id: 'floor', cat: 'terrain', shape: 'rect', geo: { center: [50, 50], size: [100, 100] } },
    ] }, () => true);
    const before = structuredClone(h.map.readCurrent().map);
    const read = await session.execute('MapSceneRead', { scene: 'room' }, () => true);
    assert.equal(read.status, 'read');
    assert.equal(read.data.nextOffset, null);
    const layout = JSON.parse(read.data.text);
    const schema = session.tools.find(tool => tool.definition.function.name === 'MapSceneEdit').definition.function.parameters;
    assert.equal(schema.additionalProperties, false);
    assert.ok(Object.keys(layout).every(key => Object.hasOwn(schema.properties, key)));
    assert.deepEqual(layout, { scene: 'room', viewBox: [0, 0, 400, 300], elements: [
        { id: 'floor', cat: 'terrain', shape: 'rect', geo: { center: [50, 50], size: [100, 100] } },
    ] });
    layout.elements[0].geo.center = [60, 70];
    const edit = await session.execute('MapSceneEdit', layout, () => true);
    assert.equal(edit.status, 'saved');
    assert.deepEqual(edit.data.skipped, []);
    const after = h.map.readCurrent().map;
    assert.deepEqual(after.atlas, before.atlas);
    assert.deepEqual(after.scenes.room.elements[0].geometry, { x: 10, y: 20, width: 100, height: 100 });
});

test('reading article B does not advance article A evidence, while a fresh read of A permits its correction', async () => {
    const h = await administratorHarness();
    const seed = await createWorldManagement(h.world).open();
    await seed.execute('WorldEdit', { upsert: [{ id: 'a', title: 'A', body: 'initial A' }, { id: 'b', title: 'B', body: 'initial B' }] }, () => true);
    const session = await createWorldManagement(h.world).open();
    await session.execute('WorldRead', { id: 'a' }, () => true);
    const other = await createWorldManagement(h.world).open();
    await other.execute('WorldEdit', { upsert: [{ id: 'a', title: 'A', body: 'new A' }] }, () => true);
    await session.execute('WorldRead', { id: 'b' }, () => true);
    await assert.rejects(session.execute('WorldEdit', { upsert: [{ id: 'a', title: 'A', body: 'stale rewrite' }] }, () => true));
    assert.equal(h.world.readCurrent().world.news.find(n => n.id === 'a').body, 'new A');
    await session.execute('WorldRead', { id: 'a' }, () => true);
    await session.execute('WorldEdit', { upsert: [{ id: 'a', title: 'A', body: 'fresh rewrite' }] }, () => true);
    assert.equal(h.world.readCurrent().world.news.find(n => n.id === 'a').body, 'fresh rewrite');
});

test('map page B cannot authorize old changes to A or its parent, and independent edits retain other updates', async () => {
    const h = await administratorHarness(), player = () => ({ actorKey: 'player', displayName: '玩家' });
    const seed = await createMapManagement(h.map, player).open();
    await seed.execute('MapAtlasEdit', { locations: [{ key: 'a', name: 'A', scale: 'region' }, { key: 'b', name: 'B', scale: 'region' }] }, () => true);
    const session = await createMapManagement(h.map, player).open(), other = await createMapManagement(h.map, player).open();
    await session.execute('MapAtlasRead', { mode: 'locations', query: 'A' }, () => true);
    await other.execute('MapAtlasEdit', { locations: [{ key: 'a', name: 'A', brief: 'concurrent A' }] }, () => true);
    await session.execute('MapAtlasRead', { mode: 'locations', query: 'B' }, () => true);
    await assert.rejects(session.execute('MapAtlasEdit', { locations: [{ key: 'a', name: 'A', brief: 'stale A' }] }, () => true));
    await assert.rejects(session.execute('MapAtlasEdit', { locations: [{ key: 'child', name: 'Child', scale: 'room', parent: 'a' }] }, () => true));
    await session.execute('MapAtlasEdit', { locations: [{ key: 'b', name: 'B', brief: 'independent B' }] }, () => true);
    assert.equal(h.map.readCurrent().map.atlas.locations.find(l => l.key === 'a').brief, 'concurrent A');
    await session.execute('MapAtlasRead', { mode: 'locations', query: 'A' }, () => true);
    await session.execute('MapAtlasEdit', { locations: [{ key: 'a', name: 'A', brief: 'fresh A' }] }, () => true);
    assert.equal(h.map.readCurrent().map.atlas.locations.find(l => l.key === 'a').brief, 'fresh A');
});

test('scene B reads and long scene continuation do not replace changed scene A evidence', async () => {
    const h = await administratorHarness(), player = () => ({ actorKey: 'player', displayName: '玩家' });
    const seed = await createMapManagement(h.map, player).open();
    await seed.execute('MapAtlasEdit', { locations: mapAtlasFixture([{ key: 'a' }, { key: 'b' }]).atlas.locations }, () => true);
    for (const scene of ['a', 'b']) {
        await seed.execute('MapSceneEdit', { scene, elements: [{ id: 'floor', cat: 'terrain', shape: 'rect', geo: { center: [50, 50], size: [100, 100] } }] }, () => true);
    }
    const session = await createMapManagement(h.map, player).open(), other = await createMapManagement(h.map, player).open();
    await session.execute('MapSceneRead', { scene: 'a' }, () => true);
    await other.execute('MapSceneEdit', { scene: 'a', mood: 'warm' }, () => true);
    await session.execute('MapSceneRead', { scene: 'b' }, () => true);
    await assert.rejects(session.execute('MapSceneRead', { scene: 'a', offset: 1 }, () => true));
    await assert.rejects(session.execute('MapSceneEdit', { scene: 'a', mood: 'cold' }, () => true));
    await session.execute('MapSceneRead', { scene: 'a' }, () => true);
    await session.execute('MapSceneEdit', { scene: 'a', mood: 'cold' }, () => true);
    assert.equal(h.map.readCurrent().map.scenes.a.mood, 'cold');
});
