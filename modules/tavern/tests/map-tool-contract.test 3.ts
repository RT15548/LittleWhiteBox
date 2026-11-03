import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import db, { createTavernSession, getTavernStructuredStateDocument, listTavernStructuredStatePatches, appendTavernMessage, createTavernManagerRun, rollbackManagerRunWrites } from '../shared/session-db';
import { executeTavernStateTool, getTavernManagerStateToolDefinitions, type TavernAtlasDocument } from '../shared/structured-state';
import { projectMapToolResult, type MapToolElement } from '../shared/map/tool-projection';
import { runXbTavernAssistantChat as runXbTavernManagerChat } from '../app-src/runtime/assistant-chat-runner';

const elements = [
    { id: 'table', cat: 'furniture', shape: 'rect', geo: { center: [200, 150], size: [100, 60] }, label: '桌子', material: 'metal', certainty: 'inferred' },
    { id: 'well', cat: 'decoration', shape: 'circle', geo: { at: [80, 90], radius: 20 }, label: '水井' },
    { id: 'road', cat: 'road', shape: 'path', geo: { points: [[50, 300], [180, 270], [300, 280]] }, label: '通道', closed: false },
    { id: 'pond', cat: 'water', shape: 'curve', geo: { curve: [[300, 30], [350, 90], [320, 150]] }, closed: true, material: 'water' },
    { id: 'actor', cat: 'actor', shape: 'icon', geo: { at: [100, 200] }, kind: 'actor', actorKey: 'courier', label: '信使' },
    { id: 'north', cat: 'label', shape: 'label', geo: { at: [200, 20] }, label: '北' },
];

async function setup() {
    await db.delete();
    await db.open();
    return (await createTavernSession({ title: 'Map contract' })).id;
}

async function call(sessionId: string, name: string, args: Record<string, unknown>) {
    const raw = await executeTavernStateTool(sessionId, name, args);
    return projectMapToolResult(name, args, raw);
}

async function scene(sessionId: string) {
    const result = await call(sessionId, 'MapSceneRead', { scene: '广场', mode: 'document' });
    assert.equal(result.ok, true);
    return result.document as { scene: string; title: string; elements: MapToolElement[] };
}

test('model tool schemas expose one geometry vocabulary and keep icon names separate from semantic kinds', () => {
    // This is the provider's external JSON-schema contract, not a source-code inventory.
    const tools = getTavernManagerStateToolDefinitions();
    assert.deepEqual(tools.map(tool => tool.function.name).sort(), ['MapAtlasEdit', 'MapAtlasRead', 'MapSceneEdit', 'MapSceneRead']);
    type Node = { properties?: Record<string, Node>; items?: Node; enum?: string[]; type?: string };
    const schema = tools.find(tool => tool.function.name === 'MapSceneEdit')!.function.parameters as Node;
    const fields = schema.properties!.elements.items!.properties!;
    assert.equal(fields.geo.properties!.center.type, 'array');
    assert.equal(fields.geo.properties!.size.type, 'array');
    assert.equal(fields.geo.properties!.icon.type, 'string');
    assert.equal(fields.kind.enum!.includes('door'), true);
    assert.equal(fields.kind.enum!.includes('table_bar'), false);
    assert.equal(fields.rect, undefined);
});

test('model scene reads round-trip every shape without moving geometry or creating derived labels', async () => {
    const id = await setup();
    const created = await executeTavernStateTool(id, 'MapSceneEdit', { scene: '广场', elements });
    assert.equal(created.ok, true);
    assert.deepEqual(created.skipped, []);
    const before = await getTavernStructuredStateDocument(id, 'tavern.map', created.docId);
    const read = await scene(id);
    assert.equal(read.elements.length, elements.length);
    assert.deepEqual(read.elements.map(item => item.shape), elements.map(item => item.shape));
    assert.deepEqual(read.elements[0].geo, elements[0].geo);
    const again = await call(id, 'MapSceneEdit', read);
    assert.equal(again.ok, true);
    assert.equal(again.changed, false);
    assert.deepEqual(await getTavernStructuredStateDocument(id, 'tavern.map', created.docId), before);
    let offset = 0;
    const pages: MapToolElement[] = [];
    do {
        const page = await call(id, 'MapSceneRead', { scene: '广场', mode: 'elements', limit: 1, offset });
        assert.equal(page.count, elements.length);
        pages.push(...page.elements as MapToolElement[]);
        offset = Number(page.nextOffset);
    } while (offset);
    assert.deepEqual(pages, read.elements);
    const single = await call(id, 'MapSceneRead', { scene: '广场', mode: 'element', elementId: 'table' });
    assert.deepEqual(single.element, read.elements[0]);
});

test('scene field-only updates preserve other facts and report only the bad element', async () => {
    const id = await setup();
    const created = await executeTavernStateTool(id, 'MapSceneEdit', { scene: '广场', elements });
    await executeTavernStateTool(id, 'MapPatch', { docId: created.docId, ops: [
        { op: 'modify', id: 'table', set: { at: [150.125, 120.125], style: { color: '#777' } } },
    ] });
    const before = await scene(id);
    const update = await call(id, 'MapSceneEdit', { scene: '广场', elements: [
        { id: 'table', material: 'wood', certainty: 'confirmed' },
        { id: 'pond', closed: false },
        { id: 'bad', cat: 'furniture', shape: 'rect', geo: { size: [0, 30] } },
    ] });
    assert.equal(update.ok, true);
    assert.equal((update.skipped as unknown[]).length, 1);
    const after = await scene(id);
    assert.deepEqual(after.elements[0].geo, before.elements[0].geo);
    assert.equal(after.elements[0].material, 'wood');
    assert.equal(after.elements[0].certainty, undefined);
    assert.equal(after.elements[0].label, '桌子');
    const stored = await getTavernStructuredStateDocument(id, 'tavern.map', created.docId);
    assert.deepEqual((stored?.data as { elements: Array<{ id: string; style?: unknown }> }).elements.find(item => item.id === 'table')?.style, { color: '#777' });
    assert.equal(after.elements.find(item => item.id === 'pond')?.closed, undefined);
    for (const key of ['well', 'road', 'actor', 'north']) {
        assert.deepEqual(after.elements.find(item => item.id === key), before.elements.find(item => item.id === key));
    }
    await call(id, 'MapSceneEdit', { scene: '广场', elements: [{ id: 'table', label: '' }] });
    assert.equal((await scene(id)).elements[0].label, undefined);
    await call(id, 'MapSceneEdit', { scene: '广场', elements: [{ id: 'table', cat: 'label', shape: 'label', geo: { at: [20, 30] }, label: '旧桌位置' }] });
    const label = (await scene(id)).elements.find(item => item.id === 'table');
    assert.equal(label?.shape, 'label');
    assert.deepEqual(label?.geo, { at: [20, 30] });
});

test('atlas edit creates parent/child geography atomically, reads no private scene ids, and preserves omitted facts', async () => {
    const id = await setup();
    const input = {
        locations: [{ key: 'dock', name: '码头', parent: 'city', brief: '渡口' }, { key: 'city', name: '城市', scale: 'city' }],
        links: [{ from: 'city', to: 'dock', kind: 'road' }],
    };
    assert.equal((await call(id, 'MapAtlasEdit', input)).ok, true);
    assert.equal((await call(id, 'MapAtlasEdit', input)).changed, false);
    const before = await getTavernStructuredStateDocument(id, 'tavern.atlas', 'main');
    const invalid = await call(id, 'MapAtlasEdit', { locations: [{ key: 'city', name: '不应保存' }], links: [{ from: 'city', to: 'missing', kind: 'road' }] });
    assert.equal(invalid.ok, false);
    assert.deepEqual(await getTavernStructuredStateDocument(id, 'tavern.atlas', 'main'), before);
    const dry = await call(id, 'MapAtlasEdit', { locations: [{ key: 'city', name: '预览' }], dryRun: true });
    assert.equal(dry.ok, true);
    assert.equal(dry.dryRun, true);
    assert.deepEqual(await getTavernStructuredStateDocument(id, 'tavern.atlas', 'main'), before);
    const cycle = await call(id, 'MapAtlasEdit', { locations: [{ key: 'city', parent: 'dock' }] });
    assert.equal(cycle.ok, false);
    await call(id, 'MapAtlasEdit', { locations: [{ key: 'dock', parent: null, brief: null }] });
    const read = await call(id, 'MapAtlasRead', { mode: 'document' });
    const atlas = read.document as { locations: Array<Record<string, unknown>>; links: Array<{ id: string }> };
    assert.deepEqual(atlas.locations.find(item => item.key === 'dock'), { key: 'dock', name: '码头', scale: 'room', status: 'mentioned', hasScene: false });
    assert.equal(JSON.stringify(read).includes('mapDocId'), false);
    assert.equal((await call(id, 'MapAtlasEdit', { removeLinks: [atlas.links[0].id] })).ok, true);

    const key = 'east'.repeat(30);
    const key2 = 'west'.repeat(30);
    const longRoute = { locations: [{ key, name: '东边' }, { key: key2, name: '西边' }], links: [{ from: key, to: key2, kind: 'road' }] };
    assert.equal((await call(id, 'MapAtlasEdit', longRoute)).ok, true);
    assert.equal((await call(id, 'MapAtlasEdit', longRoute)).changed, false);
    const routes = (await call(id, 'MapAtlasRead', { mode: 'links' })).links as Array<{ id: string }>;
    assert.equal((await call(id, 'MapAtlasEdit', { removeLinks: [routes[0].id] })).ok, true);
});

test('atlas writes honor before/after guards and participate in manager rollback', async () => {
    const id = await setup();
    const user = await appendTavernMessage(id, { role: 'user', content: '港口在哪里？' });
    const assistant = await appendTavernMessage(id, { role: 'assistant', content: '城市北方。' });
    const run = await createTavernManagerRun({ sessionId: id, turn: 1, userOrder: user.order, assistantOrder: assistant.order, trigger: 'after_turn', status: 'running' });
    const before = await getTavernStructuredStateDocument(id, 'tavern.atlas', 'main');
    const input = { locations: [{ key: 'harbor', name: '港口' }] };
    for (const guard of ['beforeWriteGuard', 'afterWriteObserver']) {
        const result = await executeTavernStateTool(id, 'MapAtlasEdit', input, { [guard]: () => { throw new Error('test_write_failed'); } });
        assert.equal(result.ok, false);
        assert.deepEqual(await getTavernStructuredStateDocument(id, 'tavern.atlas', 'main'), before);
        assert.equal((await listTavernStructuredStatePatches({ sessionId: id })).length, 0);
    }
    assert.equal((await executeTavernStateTool(id, 'MapAtlasEdit', input, { managerRunId: run.id, caller: 'auto' })).ok, true);
    await rollbackManagerRunWrites(run.id, { expectedLeaseOwnerId: '', expectedStatus: 'running', finalStatus: 'cancelled' });
    const restored = await getTavernStructuredStateDocument(id, 'tavern.atlas', 'main');
    assert.deepEqual((restored?.data as TavernAtlasDocument | undefined)?.locations || [], (before?.data as TavernAtlasDocument | undefined)?.locations || []);
});

test('ordinary and session provider continuations receive the same editable scene projection', async () => {
    const id = await setup();
    await call(id, 'MapSceneEdit', { scene: '广场', elements });
    for (const supportsSessionToolLoop of [false, true]) {
        let count = 0;
        const executeManagerOnce = Object.assign(async (options: Parameters<NonNullable<Parameters<typeof runXbTavernManagerChat>[0]['executeManagerOnce']>>[0]) => {
            count++;
            if (count === 1) {return { text: '', toolCalls: [{ id: 'read', name: 'MapSceneRead', arguments: { scene: '广场', mode: 'document' } }] };}
            const response = supportsSessionToolLoop ? options.toolResponses?.[0]?.response
                : JSON.parse(String(options.messages?.find(item => item.role === 'tool')?.content || '{}'));
            assert.deepEqual((response as { document: unknown }).document, await scene(id));
            assert.equal(JSON.stringify(response).includes('__label__'), false);
            assert.equal(JSON.stringify(response).includes('docId'), false);
            return { text: '已查看。' };
        }, { supportsSessionToolLoop });
        const result = await runXbTavernManagerChat({ sessionId: id, agentConfig: {}, question: '查看广场', executeManagerOnce });
        assert.equal(result.ok, true);
        assert.equal(count, 2);
    }
});
