import 'fake-indexeddb/auto';
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import db, {
    createTavernSession,
    getTavernStructuredStateDocument,
    listTavernStructuredStatePatches,
} from '../shared/session-db';
import {
    TAVERN_STATUS_DOC_ID,
    TAVERN_STATUS_DOC_TYPE,
    TAVERN_STATUS_TOOL_NAMES,
    createStatusFieldKey,
    executeTavernStatusTool,
    getTavernStatusToolDefinitions,
    getTavernStatusStateForSession,
    normalizeStatusDocument,
    rollbackStatusStateForMessageRange,
    saveTavernStatusSnapshot,
    type TavernStatusDocument,
} from '../shared/status-state';
import { buildTavernStatusPanelYaml } from '../shared/status-prompt';

beforeEach(async () => {
    await db.delete();
    await db.open();
});

test('StatusInit tool definition documents gauge display mapping', () => {
    const initTool = getTavernStatusToolDefinitions().find((tool) => tool.function.name === TAVERN_STATUS_TOOL_NAMES.INIT);
    const parameters = initTool?.function.parameters as { properties?: { document?: { description?: string } } } | undefined;
    const documentDescription = String(parameters?.properties?.document?.description || '');
    assert.match(documentDescription, /Gauge fields may set display to bar, percent, dots, or num/);
    assert.match(documentDescription, /百分比\/percent => display "percent"/);
    assert.match(documentDescription, /点阵\/dots => display "dots"/);
});

function createStatusDoc(value = 50): TavernStatusDocument {
    return {
        meta: {
            revision: 0,
            activeSubject: 'user',
        },
        subjects: [
            {
                id: 'user',
                name: '阿瑟',
                subtitle: '私家侦探',
                icon: 'person',
                tabs: [
                    {
                        id: 'overview',
                        label: '概览',
                        blocks: [
                            {
                                id: 'stats',
                                title: '核心值',
                                form: 'gauge',
                                fields: [
                                    { id: 'san', name: '理智', value, max: 99, display: 'bar', accent: true },
                                ],
                            },
                            {
                                id: 'state',
                                title: '当前状态',
                                form: 'tag',
                                fields: [
                                    { id: 'wet', label: '衣物湿透', kind: 'state' },
                                ],
                            },
                            {
                                id: 'items',
                                title: '持有物',
                                form: 'item',
                                layout: 'grid',
                                fields: [],
                            },
                            {
                                id: 'scene',
                                title: '当前情境',
                                form: 'text',
                                fields: [
                                    { id: 'now', value: '站在档案室门口。' },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    };
}

test('status document normalize keeps the closed form set and skips invalid fields', () => {
    const normalized = normalizeStatusDocument({
        meta: { activeSubject: 'user', revision: 3 },
        subjects: [
            {
                id: 'user',
                name: 'User',
                tabs: [
                    {
                        id: 'overview',
                        label: '概览',
                        blocks: [
                            { id: 'good', title: '数值', form: 'gauge', fields: [{ id: 'hp', name: 'HP', value: 20, max: 30 }] },
                            { id: 'bad-form', title: '坏块', form: 'table', fields: [{ id: 'x', value: 1 }] },
                            { id: 'bad-field', title: '坏字段', form: 'text', fields: [{ id: 'missing-value', name: '空' }] },
                        ],
                    },
                ],
            },
        ],
    });

    assert.equal(normalized.document.subjects.length, 1);
    assert.equal(normalized.document.subjects[0].tabs[0].blocks.length, 2);
    assert.equal(normalized.document.subjects[0].tabs[0].blocks[0].form, 'gauge');
    assert.equal(normalized.document.subjects[0].tabs[0].blocks[1].fields.length, 0);
    assert.match(normalized.warnings.join('\n'), /未知form/);
    assert.match(normalized.warnings.join('\n'), /text缺value/);
});

test('status panel prompt yaml keeps full RP fields without implementation metadata', () => {
    const document = createStatusDoc(62);
    document.subjects[0].tabs[0].blocks[2].fields = [
        { id: 'lamp', name: '煤油灯', icon: 'local_fire_department', qty: 1, key: true, slot: '右手', lore: '灯芯还剩一半。' },
        { id: 'empty-pocket', name: '- 空口袋', empty: true, slot: '? 外套', lore: '~' },
    ];
    document.subjects[0].tabs[0].blocks[3].fields[0] = {
        id: 'now',
        name: '位置',
        value: '站在档案室门口。\n门缝里有冷光。',
    };

    const yaml = buildTavernStatusPanelYaml(document);

    assert.match(yaml, /^status_panel:/);
    assert.match(yaml, /subjects:/);
    assert.match(yaml, /name: 阿瑟/);
    assert.match(yaml, /subtitle: 私家侦探/);
    assert.match(yaml, /label: 概览/);
    assert.match(yaml, /title: 核心值/);
    assert.match(yaml, /form: gauge/);
    assert.match(yaml, /name: 理智/);
    assert.match(yaml, /value: 62/);
    assert.match(yaml, /max: 99/);
    assert.doesNotMatch(yaml, /\bmin: 0\b/);
    assert.doesNotMatch(yaml, /\bstep:/);
    assert.match(yaml, /label: 衣物湿透/);
    assert.match(yaml, /kind: state/);
    assert.match(yaml, /name: 煤油灯/);
    assert.match(yaml, /qty: 1/);
    assert.match(yaml, /key: true/);
    assert.match(yaml, /slot: 右手/);
    assert.match(yaml, /lore: 灯芯还剩一半。/);
    assert.match(yaml, /name: "- 空口袋"/);
    assert.match(yaml, /slot: "\? 外套"/);
    assert.match(yaml, /lore: "~"/);
    assert.match(yaml, /empty: true/);
    assert.match(yaml, /value: \|-/);
    assert.match(yaml, /门缝里有冷光。/);
    assert.doesNotMatch(yaml, /\bid:/);
    assert.doesNotMatch(yaml, /revision|docType|docId|icon|display|accent|layout|activeSubject/);
});

test('status panel prompt yaml keeps non-zero gauge min', () => {
    const document = createStatusDoc(3);
    document.subjects[0].tabs[0].blocks[0].fields[0] = {
        id: 'rank',
        name: '阶位',
        value: 3,
        min: 1,
        max: 5,
        step: 1,
    };

    const yaml = buildTavernStatusPanelYaml(document);

    assert.match(yaml, /name: 阶位/);
    assert.match(yaml, /value: 3/);
    assert.match(yaml, /min: 1/);
    assert.match(yaml, /max: 5/);
    assert.doesNotMatch(yaml, /\bstep:/);
});

test('StatusInit writes the current document and a reversible patch record', async () => {
    const session = await createTavernSession({ title: 'Status init' });
    const result = await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, {
        desc: '初始化角色档案',
        document: createStatusDoc(),
    }, {
        managerRunId: 'run-init',
        sourceUserOrder: 1,
        sourceAssistantOrder: 2,
    });

    assert.equal(result.ok, true);
    assert.equal(result.changed, true);
    assert.equal(result.revision, 1);

    const record = await getTavernStructuredStateDocument(session.id, TAVERN_STATUS_DOC_TYPE, TAVERN_STATUS_DOC_ID);
    assert.equal(record?.docType, TAVERN_STATUS_DOC_TYPE);
    assert.equal(record?.revision, 1);

    const patches = await listTavernStructuredStatePatches({
        sessionId: session.id,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
    });
    assert.equal(patches.length, 1);
    assert.equal(patches[0].managerRunId, 'run-init');
    assert.equal(patches[0].sourceUserOrder, 1);
    assert.ok(patches[0].beforeData);
    assert.ok(patches[0].afterData);
    assert.deepEqual(patches[0].ops, [{ op: 'init' }]);
});

test('StatusPatch only mutates existing blocks and skips semantic no-op writes', async () => {
    const session = await createTavernSession({ title: 'Status patch' });
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, { document: createStatusDoc() });

    const patch = await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        desc: '本轮状态变化',
        ops: [
            { op: 'delta', subjectId: 'user', tabId: 'overview', blockId: 'stats', fieldId: 'san', delta: -8 },
            { op: 'push', subjectId: 'user', tabId: 'overview', blockId: 'state', id: 'hurt', label: '轻伤', kind: 'harm' },
            { op: 'push', subjectId: 'user', tabId: 'overview', blockId: 'items', id: 'key', name: '黄铜钥匙', icon: 'key', qty: 1, key: true, lore: '从桌下捡到。' },
            { op: 'set', subjectId: 'user', tabId: 'overview', blockId: 'scene', fieldId: 'now', value: '雨声盖住了脚步。' },
        ],
    }, {
        managerRunId: 'run-patch',
        sourceUserOrder: 3,
        sourceAssistantOrder: 4,
    });

    assert.equal(patch.ok, true);
    assert.equal(patch.changed, true);
    assert.equal(patch.revision, 2);

    const state = await getTavernStatusStateForSession(session.id);
    const tab = state.status.subjects[0].tabs[0];
    const stats = tab.blocks.find((block) => block.id === 'stats');
    const tags = tab.blocks.find((block) => block.id === 'state');
    const items = tab.blocks.find((block) => block.id === 'items');
    const text = tab.blocks.find((block) => block.id === 'scene');
    assert.equal((stats?.fields[0] as { value?: number }).value, 42);
    assert.equal(tags?.fields.length, 2);
    assert.equal(items?.fields.length, 1);
    assert.equal((text?.fields[0] as { value?: string }).value, '雨声盖住了脚步。');
    assert.equal(state.fieldDeltas[createStatusFieldKey('user', 'overview', 'stats', 'san')], -8);

    const invalid = await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'push', subjectId: 'user', tabId: 'new-tab', blockId: 'stats', id: 'ghost', name: '幽灵值', value: 1 },
        ],
    });
    assert.equal(invalid.ok, false);
    assert.equal(invalid.error, 'status_patch_invalid');
    assert.match(invalid.errors?.join('\n') || '', /tab_not_found:new-tab/);

    const beforeNoopPatches = await listTavernStructuredStatePatches({
        sessionId: session.id,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
    });
    const noOp = await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'set', subjectId: 'user', tabId: 'overview', blockId: 'stats', fieldId: 'san', value: 42 },
        ],
    });
    const afterNoopPatches = await listTavernStructuredStatePatches({
        sessionId: session.id,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
    });
    assert.equal(noOp.ok, true);
    assert.equal(noOp.changed, false);
    assert.equal(afterNoopPatches.length, beforeNoopPatches.length);
});

test('status item icons canonicalize before fingerprinting and ignore invalid set icons', async () => {
    const session = await createTavernSession({ title: 'Status icon canonical' });
    const document = createStatusDoc();
    document.subjects[0].icon = 'Face 3';
    const items = document.subjects[0].tabs[0].blocks.find((block) => block.id === 'items');
    items?.fields.push({ id: 'brass-key', name: '黄铜钥匙', icon: 'Key', qty: 1 });

    const init = await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, { document });
    assert.equal(init.ok, true);
    assert.equal(init.document?.subjects[0].icon, 'face_3');
    const initItem = init.document?.subjects[0].tabs[0].blocks.find((block) => block.id === 'items')?.fields[0] as { icon?: string };
    assert.equal(initItem.icon, 'key');

    const beforeNoopPatches = await listTavernStructuredStatePatches({
        sessionId: session.id,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
    });
    const noOp = await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'set', subjectId: 'user', tabId: 'overview', blockId: 'items', fieldId: 'brass-key', set: { icon: 'Key' } },
        ],
    });
    const afterNoopPatches = await listTavernStructuredStatePatches({
        sessionId: session.id,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
    });
    assert.equal(noOp.ok, true);
    assert.equal(noOp.changed, false);
    assert.equal(noOp.revision, 1);
    assert.equal(afterNoopPatches.length, beforeNoopPatches.length);

    const emptyIconSet = await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'set', subjectId: 'user', tabId: 'overview', blockId: 'items', fieldId: 'brass-key', set: { icon: '' } },
        ],
    });
    assert.equal(emptyIconSet.ok, true);
    assert.equal(emptyIconSet.changed, false);
    assert.equal(emptyIconSet.document, undefined);

    const invalidSet = await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'set', subjectId: 'user', tabId: 'overview', blockId: 'items', fieldId: 'brass-key', set: { icon: 'sword_icon' } },
        ],
    });
    assert.equal(invalidSet.ok, true);
    assert.equal(invalidSet.changed, false);
    assert.match(invalidSet.warnings?.join('\n') || '', /icon非法\(sword_icon\).*保留原图标/);
    const stateAfterIgnoredSet = await getTavernStatusStateForSession(session.id);
    const retainedItem = stateAfterIgnoredSet.status.subjects[0].tabs[0].blocks.find((block) => block.id === 'items')?.fields[0] as { icon?: string };
    assert.equal(retainedItem.icon, 'key');

    const push = await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'push', subjectId: 'user', tabId: 'overview', blockId: 'items', id: 'fake-sword', name: '旧剑', icon: 'sword_icon' },
        ],
    });
    assert.equal(push.ok, true);
    assert.equal(push.changed, true);
    assert.match(push.warnings?.join('\n') || '', /icon非法\(sword_icon\).*已忽略/);
    const pushedItem = push.document?.subjects[0].tabs[0].blocks.find((block) => block.id === 'items')?.fields.find((field) => field.id === 'fake-sword') as { icon?: string };
    assert.equal(pushedItem.icon, undefined);
});

test('status rollback restores accepted snapshots by message range', async () => {
    const session = await createTavernSession({ title: 'Status rollback' });
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, { document: createStatusDoc(50) }, {
        managerRunId: 'run-init',
        sourceUserOrder: 1,
        sourceAssistantOrder: 2,
    });
    await saveTavernStatusSnapshot(session.id, 2);
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'delta', subjectId: 'user', tabId: 'overview', blockId: 'stats', fieldId: 'san', delta: 10 },
        ],
    }, {
        managerRunId: 'run-early',
        sourceUserOrder: 3,
        sourceAssistantOrder: 4,
    });
    await saveTavernStatusSnapshot(session.id, 4);
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'delta', subjectId: 'user', tabId: 'overview', blockId: 'stats', fieldId: 'san', delta: -25 },
        ],
    }, {
        managerRunId: 'run-late',
        sourceUserOrder: 5,
        sourceAssistantOrder: 6,
    });

    const beforeRollback = await getTavernStatusStateForSession(session.id);
    assert.equal((beforeRollback.status.subjects[0].tabs[0].blocks[0].fields[0] as { value?: number }).value, 35);

    const rollback = await rollbackStatusStateForMessageRange(session.id, 5);
    assert.equal(rollback.rolledBack, 1);
    assert.deepEqual(rollback.runIds, ['run-late']);

    const afterRollback = await getTavernStatusStateForSession(session.id);
    assert.equal((afterRollback.status.subjects[0].tabs[0].blocks[0].fields[0] as { value?: number }).value, 60);

    const patches = await listTavernStructuredStatePatches({
        sessionId: session.id,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
        includeRolledBack: true,
    });
    assert.equal(patches.filter((patch) => patch.status === 'rolled_back').length, 1);
});

test('status rollback preserves user-anchored manager chat status snapshots', async () => {
    const session = await createTavernSession({ title: 'Status rollback user anchor' });
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, { document: createStatusDoc(50) }, {
        managerRunId: 'run-init',
        sourceUserOrder: 1,
        sourceAssistantOrder: 2,
    });
    await saveTavernStatusSnapshot(session.id, 2);
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'delta', subjectId: 'user', tabId: 'overview', blockId: 'stats', fieldId: 'san', delta: -10 },
        ],
    }, {
        caller: 'auto',
        managerRunId: 'run-auto',
        sourceUserOrder: 5,
        sourceAssistantOrder: 6,
    });
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'set', subjectId: 'user', tabId: 'overview', blockId: 'stats', fieldId: 'san', value: 80 },
        ],
    }, {
        caller: 'chat',
        managerRunId: 'run-manual',
    });
    await saveTavernStatusSnapshot(session.id, 5);

    const rollback = await rollbackStatusStateForMessageRange(session.id, 6);
    assert.equal(rollback.rolledBack, 1);
    assert.deepEqual(rollback.conflicts, []);

    const state = await getTavernStatusStateForSession(session.id);
    assert.equal((state.status.subjects[0].tabs[0].blocks[0].fields[0] as { value?: number }).value, 80);
    const patches = await listTavernStructuredStatePatches({
        sessionId: session.id,
        docType: TAVERN_STATUS_DOC_TYPE,
        docId: TAVERN_STATUS_DOC_ID,
        includeRolledBack: true,
    });
    assert.equal(patches.filter((patch) => patch.status === 'rolled_back').length, 1);
});
