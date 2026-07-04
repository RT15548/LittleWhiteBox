import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

import db, {
    appendTavernMessage,
    appendTavernManagerMessage,
    appendTavernStructuredStatePatch,
    branchTavernSession,
    createTavernSession,
    countTavernMessagesInRange,
    deleteTavernSession,
    deleteTavernMessages,
    deriveAndActivateDefaultTavernPreset,
    ensureDefaultTavernAssistantPreset,
    getActiveTavernPresetId,
    getSelectedTavernSessionId,
    getLatestTavernAssistantOrder,
    getLatestTavernManagerMessage,
    getLatestTavernMessage,
    getTavernSession,
    getTavernMessage,
    getLatestTavernUserMessageAtOrBefore,
    listTavernManagerMessages,
    listTavernManagerMemorySnapshots,
    listLatestTavernMessages,
    listLatestTavernMessagesWithCount,
    listLatestTavernUserMessagesBefore,
    listTavernManagerRuns,
    listTavernMessageOrdersFrom,
    listUserTavernPresets,
    listTavernMessages,
    listTavernMessagesInRange,
    listTavernMessagesInRangeWithCount,
    loadTavernMessageWindow,
    loadActiveTavernAssistantPreset,
    loadActiveTavernPreset,
    mergeWorldEntryStates,
    normalizeTavernSessionState,
    replaceTavernSessionState,
    rollbackManagerRunsForMessageRange,
    rollbackManagerStateRunsForMessageRange,
    saveTavernPreset,
    setActiveTavernPresetId,
    tavernAssistantPresetsTable,
    tavernManagerMemorySnapshotsTable,
    tavernManagerMessagesTable,
    tavernManagerRunsTable,
    tavernManagerStateSnapshotsTable,
    tavernManagerTaskSnapshotsTable,
    tavernMemoryFilesTable,
    tavernMemoryIndexesTable,
    tavernMemorySnapshotsTable,
    tavernStateDocumentsTable,
    tavernStatePatchesTable,
    tavernStatusSnapshotsTable,
    tavernTaskFingerprintStatesTable,
    tavernTaskSnapshotsTable,
    tavernTasksTable,
    touchRunningTavernManagerRun,
    updateTavernManagerMessage,
    updateTavernMessage,
    updateTavernManagerRun,
    updateTavernSessionState,
    createTavernManagerRun,
    getTavernStructuredStateDocument,
    listTavernStructuredStatePatches,
    putTavernStructuredStateDocument,
    type TavernStructuredStateDocumentRecord,
} from '../shared/session-db';
import { DEFAULT_XB_TAVERN_PRESET_ID, createDefaultXbTavernPreset } from '../shared/presets';
import { DEFAULT_TAVERN_SESSION_CONTRACT, mergeTavernSessionContract } from '../shared/session-contract';
import { buildXbTavernMessages, createXbTavernBuildSnapshot } from '../shared/message-assembler';
import { createActionCheckEvent, createChanceEncounterEvent } from '../shared/runtime-events';
import { applyTrustedMapPatchOps } from '../shared/map-state-ops';
import { createSeedMapDocument } from '../shared/map-state-seed';
import {
    MAX_MANAGER_TOOL_ROUNDS,
    cancelAndRollbackXbTavernManagersForMessageRange,
    describeXbTavernManagerRollbackImpactForMessageRange,
    runXbTavernManagerChat,
    runXbTavernManagerAfterTurn,
    runPendingAcceptedTurnManager,
} from '../app-src/runtime/manager';
import { rollbackImpactLines } from '../app-src/features/accepted-rollback/accepted-rollback';
import {
    buildDefaultTavernCharacterMemoryContent,
    buildDefaultTavernMemoryStateContent,
    ensureTavernMemoryDefaults,
    executeTavernMemoryTool,
    executeTavernSourceFileTool,
    getTavernManagerToolDefinitions,
    getTavernMemoryFile,
    getTavernMemoryIndex,
    normalizeCharacterMemoryPath,
    normalizeTavernMemoryPath,
    describeTavernMemoryRestoreImpact,
    listTavernMemorySnapshots,
    listTavernMemoryFiles,
    rebuildTavernMemoryDerivedIndex,
    restoreTavernMemoryToFloor,
    saveTavernMemorySnapshot,
    trimTavernMemorySnapshotsFromFloor,
    writeTavernMemoryFile,
} from '../shared/memory-files';
import {
    createDefaultTavernAssistantPreset,
    DEFAULT_TAVERN_ASSISTANT_PRESET_ID,
    DEFAULT_TAVERN_ASSISTANT_PRESET_VERSION,
    normalizeTavernAssistantPreset,
} from '../shared/assistant-presets';
import {
    buildTavernSpatialStateDigest,
    executeTavernStateTool,
    getTavernAtlasStateForSession,
    getTavernMapStateForSession,
    getTavernStateToolDefinitions,
    listTavernStructuredStateDigests,
    type TavernAtlasDocument,
    type TavernMapDocument,
} from '../shared/structured-state';
import { resolveMapElementIconName } from '../shared/map-material-symbols';
import {
    TAVERN_STATUS_TOOL_NAMES,
    executeTavernStatusTool,
    listTavernStatusSnapshots,
} from '../shared/status-state';
import {
    abandonStaleTavernTasks,
    describeTavernTaskRestoreImpact,
    executeTavernTaskTool,
    getLatestQuestHooksForPrompt,
    listTavernTasks,
    listTavernTaskSnapshots,
    restoreTavernTasksToFloor,
    saveTavernTaskSnapshot,
    trimTavernTaskSnapshotsFromFloor,
} from '../shared/tasks';
import { saveAcceptedStateSnapshot } from '../shared/accepted-state';
import { retrieveXbTavernMemoryContext } from '../shared/memory-retrieval';
import * as looseToolArgumentsModule from '../../agent-core/runtime/loose-tool-arguments.js';

const { repairLooseToolArguments } = looseToolArgumentsModule as unknown as {
    repairLooseToolArguments: (text: string, toolName?: string) => string;
};

test('tavern session db stores independent sessions and messages', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({
        title: 'Aster test',
        characterKey: '0',
        characterName: 'Aster',
        contextSnapshot: { character: { characterKey: '0', name: 'Aster' } },
        presetId: 'preset-1',
        presetName: 'Preset One',
    });
    const buildResult = buildXbTavernMessages({
        character: { characterKey: '0', name: 'Aster' },
    }, {
        id: 'preset-1',
        name: 'Preset One',
    }, {
        currentUserMessage: 'Hello.',
    });
    const buildSnapshot = createXbTavernBuildSnapshot({ character: { characterKey: '0', name: 'Aster' } }, { id: 'preset-1', name: 'Preset One' }, buildResult);
    await appendTavernMessage(session.id, {
        role: 'user',
        content: 'Hello.',
        buildSnapshot,
        presetId: 'preset-1',
        presetName: 'Preset One',
    });
    await appendTavernMessage(session.id, {
        role: 'assistant',
        content: 'Hi.',
        requestSnapshot: { messageCount: buildResult.messages.length },
    });

    assert.equal(await getSelectedTavernSessionId(), session.id);
    const messages = await listTavernMessages(session.id);
    assert.deepEqual(messages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(messages[0]?.buildSnapshot?.presetId, 'preset-1');
    assert.deepEqual(messages[1]?.requestSnapshot, { messageCount: buildResult.messages.length });
});

test('branchTavernSession clones a complete archive without selecting the branch', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({
        title: '主线档案',
        characterKey: 'char-a',
        characterName: 'Aster',
        contextSnapshot: { character: { characterKey: 'char-a', name: 'Aster' } },
    });
    const user = await appendTavernMessage(session.id, { role: 'user', content: '开门。' });
    const assistant = await appendTavernMessage(session.id, { role: 'assistant', content: '门后是地图室。' });
    await appendTavernManagerMessage(session.id, { role: 'assistant', content: '档案整理完毕。' });
    const run = await createTavernManagerRun({
        id: 'source-run',
        sessionId: session.id,
        turn: 1,
        userOrder: user.order,
        assistantOrder: assistant.order,
        trigger: 'after_turn',
        status: 'completed',
    });
    const timestamp = Date.now();
    const memoryFile = {
        sessionId: session.id,
        path: 'memory/state.md',
        content: '# 会话记忆\n\n地图室出现。',
        status: 'active' as const,
        source: 'manager',
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    await tavernMemoryFilesTable.put(memoryFile);
    await tavernMemorySnapshotsTable.put({
        sessionId: session.id,
        floor: assistant.order,
        files: [{ path: memoryFile.path, file: memoryFile }],
        createdAt: timestamp,
    });
    await tavernMemoryIndexesTable.put({
        sessionId: session.id,
        kind: 'derived',
        status: 'ready',
        updatedAt: timestamp,
        files: [{
            path: memoryFile.path,
            status: memoryFile.status,
            source: memoryFile.source,
            createdAt: memoryFile.createdAt,
            updatedAt: memoryFile.updatedAt,
            contentLength: memoryFile.content.length,
            preview: '地图室出现。',
        }],
    });
    await tavernManagerMemorySnapshotsTable.put({
        managerRunId: run.id,
        sessionId: session.id,
        path: memoryFile.path,
        beforeExists: true,
        beforeFile: memoryFile,
        beforeHash: 'before-memory',
        afterHash: 'after-memory',
        rollbackStatus: 'pending',
        error: '',
        createdAt: timestamp,
        updatedAt: timestamp,
    });
    const stateDocument: TavernStructuredStateDocumentRecord = {
        sessionId: session.id,
        docType: 'tavern.map',
        docId: 'branch-map',
        title: '分支地图',
        revision: 2,
        data: { elements: [{ id: 'door', label: '门' }] },
        digest: 'map-digest',
        status: 'active',
        source: 'manager',
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    const statusDocument: TavernStructuredStateDocumentRecord = {
        sessionId: session.id,
        docType: 'tavern.status',
        docId: 'main',
        title: '状态栏',
        revision: 1,
        data: { subjects: [{ id: 'user', name: '玩家' }] },
        digest: 'status-digest',
        status: 'active',
        source: 'manager',
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    await tavernStateDocumentsTable.bulkPut([stateDocument, statusDocument]);
    const patch = await appendTavernStructuredStatePatch({
        id: 'source-patch',
        sessionId: session.id,
        docType: stateDocument.docType,
        docId: stateDocument.docId,
        revision: 2,
        managerRunId: run.id,
        sourceAssistantOrder: assistant.order,
        ops: [{ op: 'add', path: '/elements/0', value: { id: 'door' } }],
        summary: '新增地图门',
    });
    await tavernManagerStateSnapshotsTable.put({
        managerRunId: run.id,
        sessionId: session.id,
        docType: stateDocument.docType,
        docId: stateDocument.docId,
        beforeExists: true,
        beforeDocument: stateDocument,
        beforeHash: 'before-state',
        afterHash: 'after-state',
        rollbackStatus: 'pending',
        error: '',
        createdAt: timestamp,
        updatedAt: timestamp,
    });
    await tavernStatusSnapshotsTable.put({
        sessionId: session.id,
        floor: assistant.order,
        document: statusDocument,
        digest: statusDocument.digest,
        createdAt: timestamp,
    });
    const task = {
        id: 'event-door',
        sessionId: session.id,
        status: 'active' as const,
        title: '开门线',
        vision: '查清门后的地图室。',
        doneWhen: '确认地图室的用途。',
        hookForModel: '门后的地图室还在等玩家检查。',
        fingerprint: 'event-door-fingerprint',
        createdOrder: user.order,
        updatedOrder: assistant.order,
        sourceManagerRunId: run.id,
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    await tavernTasksTable.put(task);
    await tavernTaskSnapshotsTable.put({
        sessionId: session.id,
        floor: assistant.order,
        tasks: [task],
        abandonedFingerprints: ['old-event-fingerprint'],
        createdAt: timestamp,
    });
    await tavernManagerTaskSnapshotsTable.put({
        managerRunId: run.id,
        sessionId: session.id,
        beforeTasks: [task],
        beforeFingerprints: ['old-event-fingerprint'],
        beforeHash: 'before-task',
        afterHash: 'after-task',
        rollbackStatus: 'pending',
        error: '',
        createdAt: timestamp,
        updatedAt: timestamp,
    });
    await tavernTaskFingerprintStatesTable.put({
        sessionId: session.id,
        abandonedFingerprints: ['old-event-fingerprint'],
        updatedAt: timestamp,
    });

    assert.equal(await getSelectedTavernSessionId(), session.id);
    const sourceCounts = await Promise.all([
        listTavernMessages(session.id),
        tavernManagerMessagesTable.where('sessionId').equals(session.id).toArray(),
        tavernManagerRunsTable.where('sessionId').equals(session.id).toArray(),
        tavernMemoryFilesTable.where('sessionId').equals(session.id).toArray(),
        tavernMemorySnapshotsTable.where('sessionId').equals(session.id).toArray(),
        tavernMemoryIndexesTable.where('sessionId').equals(session.id).toArray(),
        tavernStateDocumentsTable.where('sessionId').equals(session.id).toArray(),
        tavernStatePatchesTable.where('sessionId').equals(session.id).toArray(),
        tavernStatusSnapshotsTable.where('sessionId').equals(session.id).toArray(),
        tavernTasksTable.where('sessionId').equals(session.id).toArray(),
        tavernTaskSnapshotsTable.where('sessionId').equals(session.id).toArray(),
        tavernTaskFingerprintStatesTable.where('sessionId').equals(session.id).toArray(),
    ]);

    const branch = await branchTavernSession(session.id);
    assert.ok(branch);
    assert.notEqual(branch.id, session.id);
    assert.equal(branch.title, '主线档案 · 分支');
    assert.equal(await getSelectedTavernSessionId(), session.id);

    const branchCounts = await Promise.all([
        listTavernMessages(branch.id),
        tavernManagerMessagesTable.where('sessionId').equals(branch.id).toArray(),
        tavernManagerRunsTable.where('sessionId').equals(branch.id).toArray(),
        tavernMemoryFilesTable.where('sessionId').equals(branch.id).toArray(),
        tavernMemorySnapshotsTable.where('sessionId').equals(branch.id).toArray(),
        tavernMemoryIndexesTable.where('sessionId').equals(branch.id).toArray(),
        tavernStateDocumentsTable.where('sessionId').equals(branch.id).toArray(),
        tavernStatePatchesTable.where('sessionId').equals(branch.id).toArray(),
        tavernStatusSnapshotsTable.where('sessionId').equals(branch.id).toArray(),
        tavernTasksTable.where('sessionId').equals(branch.id).toArray(),
        tavernTaskSnapshotsTable.where('sessionId').equals(branch.id).toArray(),
        tavernTaskFingerprintStatesTable.where('sessionId').equals(branch.id).toArray(),
    ]);
    assert.deepEqual(branchCounts.map((items) => items.length), sourceCounts.map((items) => items.length));
    branchCounts.forEach((items) => {
        assert.equal(items.every((item) => item.sessionId === branch.id), true);
    });

    const [branchRun] = await tavernManagerRunsTable.where('sessionId').equals(branch.id).toArray();
    assert.ok(branchRun);
    assert.notEqual(branchRun.id, run.id);
    const [branchPatch] = await tavernStatePatchesTable.where('sessionId').equals(branch.id).toArray();
    assert.ok(branchPatch);
    assert.notEqual(branchPatch.id, patch.id);
    assert.equal(branchPatch.managerRunId, branchRun.id);
    const [branchTask] = await tavernTasksTable.where('sessionId').equals(branch.id).toArray();
    assert.equal(branchTask?.sourceManagerRunId, branchRun.id);

    const [branchMemorySnapshot] = await tavernMemorySnapshotsTable.where('sessionId').equals(branch.id).toArray();
    assert.equal(branchMemorySnapshot?.files[0]?.file.sessionId, branch.id);
    const [branchManagerMemorySnapshot] = await tavernManagerMemorySnapshotsTable.where('sessionId').equals(branch.id).toArray();
    assert.equal(branchManagerMemorySnapshot?.managerRunId, branchRun.id);
    assert.equal(branchManagerMemorySnapshot?.beforeFile?.sessionId, branch.id);
    const [branchManagerStateSnapshot] = await tavernManagerStateSnapshotsTable.where('sessionId').equals(branch.id).toArray();
    assert.equal(branchManagerStateSnapshot?.managerRunId, branchRun.id);
    assert.equal(branchManagerStateSnapshot?.beforeDocument?.sessionId, branch.id);
    const [branchStatusSnapshot] = await tavernStatusSnapshotsTable.where('sessionId').equals(branch.id).toArray();
    assert.equal(branchStatusSnapshot?.document?.sessionId, branch.id);
    const [branchTaskSnapshot] = await tavernTaskSnapshotsTable.where('sessionId').equals(branch.id).toArray();
    assert.equal(branchTaskSnapshot?.tasks[0]?.sessionId, branch.id);
    assert.equal(branchTaskSnapshot?.tasks[0]?.sourceManagerRunId, branchRun.id);
    const [branchManagerTaskSnapshot] = await tavernManagerTaskSnapshotsTable.where('sessionId').equals(branch.id).toArray();
    assert.equal(branchManagerTaskSnapshot?.managerRunId, branchRun.id);
    assert.equal(branchManagerTaskSnapshot?.beforeTasks[0]?.sessionId, branch.id);
    assert.equal(branchManagerTaskSnapshot?.beforeTasks[0]?.sourceManagerRunId, branchRun.id);

    assert.ok(await getTavernSession(session.id));
    assert.ok(await tavernManagerRunsTable.get(run.id));
    assert.ok(await tavernStatePatchesTable.get(patch.id));
    assert.equal((await listTavernMessages(session.id)).length, sourceCounts[0].length);
});

test('tavern message indexed helpers read latest, direct, recent, and range windows', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Message windows' });
    for (let index = 0; index < 6; index += 1) {
        await appendTavernMessage(session.id, {
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: `消息 ${index}`,
        });
    }

    assert.equal((await getTavernMessage(session.id, 3))?.content, '消息 3');
    assert.equal(await getTavernMessage(session.id, 99), null);
    assert.equal((await getLatestTavernMessage(session.id))?.order, 5);
    assert.deepEqual((await listLatestTavernMessages(session.id, 3)).map((message) => message.order), [3, 4, 5]);
    assert.deepEqual((await listLatestTavernMessages(session.id, 2, 2)).map((message) => message.order), [2, 3]);
    const latestWithCount = await listLatestTavernMessagesWithCount(session.id, 2, 2);
    assert.deepEqual(latestWithCount.messages.map((message) => message.order), [2, 3]);
    assert.equal(latestWithCount.total, 6);
    const loadedWindow = await loadTavernMessageWindow(session.id, 3);
    assert.deepEqual(loadedWindow.messages.map((message) => message.order), [3, 4, 5]);
    assert.equal(loadedWindow.total, 6);
    assert.equal(loadedWindow.loadedStartOrder, 3);
    assert.equal(loadedWindow.loadedEndOrder, 5);
    assert.deepEqual(await listTavernMessageOrdersFrom(session.id, 3), [3, 4, 5]);
    assert.deepEqual((await listLatestTavernUserMessagesBefore(session.id, 5, 2)).map((message) => message.order), [2, 4]);
    assert.equal((await getLatestTavernUserMessageAtOrBefore(session.id, 5))?.order, 4);
    assert.deepEqual((await listTavernMessagesInRange(session.id, 1, 4, 2, 1)).map((message) => message.order), [2, 3]);
    assert.equal(await countTavernMessagesInRange(session.id, 1, 4), 4);
    const rangeWithCount = await listTavernMessagesInRangeWithCount(session.id, 1, 4, 2, 1);
    assert.deepEqual(rangeWithCount.messages.map((message) => message.order), [2, 3]);
    assert.equal(rangeWithCount.total, 4);
    assert.deepEqual((await listTavernMessagesInRange(session.id, 4, Number.POSITIVE_INFINITY)).map((message) => message.order), [4, 5]);
});

test('tavern latest assistant order ignores non-assistant and error messages', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Latest assistant floor' });
    await appendTavernMessage(session.id, { role: 'user', content: '用户 0。' });
    const assistant = await appendTavernMessage(session.id, { role: 'assistant', content: '助手 1。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '错误助手。', error: true });
    await appendTavernMessage(session.id, { role: 'user', content: '用户 3。' });

    assert.equal(await getLatestTavernAssistantOrder(session.id), assistant.order);
});

test('tavern append uses latest indexed order without scanning the full session', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Append latest order' });
    await appendTavernMessage(session.id, { role: 'user', content: '0' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '1' });
    await appendTavernMessage(session.id, { role: 'user', content: '2' });
    await deleteTavernMessages(session.id, [2]);

    const appended = await appendTavernMessage(session.id, { role: 'assistant', content: 'tail' });

    assert.equal(appended.order, 2);
    assert.deepEqual((await listTavernMessages(session.id)).map((message) => message.content), ['0', '1', 'tail']);
});

test('tavern manager append uses latest indexed order per session', async () => {
    await db.delete();
    await db.open();

    const first = await createTavernSession({ title: 'Manager latest A' });
    const second = await createTavernSession({ title: 'Manager latest B' });
    await appendTavernManagerMessage(first.id, { role: 'user', content: 'A0' });
    await appendTavernManagerMessage(first.id, { role: 'assistant', content: 'A1' });
    await appendTavernManagerMessage(second.id, { role: 'user', content: 'B0' });

    assert.equal((await getLatestTavernManagerMessage(first.id))?.content, 'A1');
    assert.equal((await getLatestTavernManagerMessage(second.id))?.order, 0);
});

test('tavern session db keeps session display names clean', async () => {
    await db.delete();
    await db.open();

    const titled = await createTavernSession({
        title: 'Seraphina · 小白酒馆',
        characterName: 'SillyTavern System · 第 96 轮 · 134 条可用消息',
    });
    assert.equal(titled.title, 'Seraphina');
    assert.equal(titled.characterName, '');

    const named = await createTavernSession({
        characterName: 'Seraphina · 会话',
    });
    assert.equal(named.title, 'Seraphina');
    assert.equal(named.characterName, 'Seraphina');
});

test('new tavern sessions start with a seed map document', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Seed map' });
    const document = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');

    assert.equal(document?.revision, 0);
    assert.equal((document?.data as { meta?: { status?: string } })?.meta?.status, 'uninitialized');
    assert.equal((document?.data as { elements?: unknown[] })?.elements?.length, 0);
    const hint = (document?.data as { meta?: { hint?: string } })?.meta?.hint || '';
    assert.match(hint, /Indoor MapSceneEdit example/);
    assert.match(hint, /Outdoor MapSceneEdit example/);
    assert.match(hint, /at least one spatial geometry element/);
    assert.match(hint, /Scene-map construction order/i);
    assert.match(hint, /Closed or contained scenes usually need both a filled main surface/i);
    assert.match(hint, /floor, ground, deck, platform, clearing, yard, roadbed, shoreline area/i);
    assert.match(hint, /Open scenes are the exception/i);
    assert.doesNotMatch(hint, /MapPatch|activate:true/);
    assert.equal((await listTavernStructuredStatePatches({ sessionId: session.id })).length, 0);
});

test('tavern session db stores only cloneable snapshots from runtime inputs', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({
        title: 'Clone guard',
        contextSnapshot: {
            character: { characterKey: '1', name: 'Nia' },
        },
        state: {
            turn: 1,
            helper: () => 'not cloneable',
        },
    });

    await appendTavernMessage(session.id, {
        role: 'assistant',
        content: 'OK.',
        thoughts: [{ label: 'thinking', text: 'Reasoning.' }],
        providerPayload: {
            text: 'OK.',
            helper: () => 'not cloneable',
        },
        requestSnapshot: {
            messageCount: 1,
            helper: () => 'not cloneable',
        },
    });

    const messages = await listTavernMessages(session.id);
    assert.equal(messages.length, 1);
    assert.deepEqual(messages[0]?.thoughts, [{ label: 'thinking', text: 'Reasoning.' }]);
    assert.deepEqual(messages[0]?.providerPayload, { text: 'OK.' });
    assert.deepEqual(messages[0]?.requestSnapshot, { messageCount: 1 });
    assert.deepEqual(messages[0]?.runtimeEvents, []);
});

test('tavern session db preserves runtime events and lets user edits clear them', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Runtime events' });
    const userMessage = await appendTavernMessage(session.id, {
        role: 'user',
        content: 'Roll the road.',
        runtimeEvents: [createChanceEncounterEvent('2026-06-11T10:00:00.000Z')],
    });

    assert.equal(userMessage.runtimeEvents?.[0]?.type, 'chanceEncounter');
    assert.equal(userMessage.runtimeEvents?.[0]?.label, '[ 🎲 CHANCE ENCOUNTER TRIGGERED ]');

    const listed = await listTavernMessages(session.id);
    assert.equal(listed[0]?.runtimeEvents?.length, 1);

    const updated = await updateTavernMessage(session.id, userMessage.order, {
        content: 'Roll the road again.',
        runtimeEvents: [],
    });

    assert.equal(updated?.content, 'Roll the road again.');
    assert.deepEqual(updated?.runtimeEvents, []);
});

test('tavern session db preserves multiple assistant action-check events without collapsing them by type', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Action check events' });
    const assistantMessage = await appendTavernMessage(session.id, {
        role: 'assistant',
        content: 'She moves. Then she catches the ledge.',
        runtimeEvents: [
            createActionCheckEvent({
                action: 'Leap over the gap',
                stat: 'Agility',
                difficulty: 14,
                roll: 16,
                success: true,
                insertAfterChars: 12,
                toolCallId: 'check-1',
            }),
            createActionCheckEvent({
                action: 'Catch the far ledge',
                stat: 'Grip',
                difficulty: 10,
                roll: 12,
                success: true,
                insertAfterChars: 12,
                toolCallId: 'check-2',
            }),
        ],
    });

    assert.equal(assistantMessage.runtimeEvents?.length, 2);
    const listed = await listTavernMessages(session.id);
    assert.equal(listed[0]?.runtimeEvents?.length, 2);
});

test('tavern session db deletes sessions with related records', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Delete me', characterName: 'Aster' });
    const other = await createTavernSession({ title: 'Keep me', characterName: 'Nia' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: 'Hi.' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: 'Hello.' });
    await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'after_turn',
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'add', element: { id: 'delete-map-room', type: 'rect', pos: [0, 0], size: [10, 10], cat: 'wall' } }],
    });

    assert.equal(await deleteTavernSession(session.id), 1);
    assert.equal(await getTavernSession(session.id), null);
    assert.equal((await listTavernMessages(session.id)).length, 0);
    assert.equal((await listTavernManagerRuns(session.id)).length, 0);
    assert.equal(await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main'), null);
    assert.equal((await listTavernStructuredStatePatches({ sessionId: session.id })).length, 0);
    assert.equal((await listTavernMemoryFiles(session.id, { includeStale: true })).length, 0);
    await assert.rejects(() => ensureTavernMemoryDefaults(session.id), /memory_session_missing/);
    assert.equal((await listTavernMemoryFiles(session.id, { includeStale: true })).length, 0);
    assert.equal(await getSelectedTavernSessionId(), other.id);
});

test('tavern session db updates and deletes message records by order', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Edit messages' });
    await appendTavernMessage(session.id, { role: 'user', content: 'Original user.' });
    await appendTavernMessage(session.id, {
        role: 'assistant',
        content: 'Original assistant.',
        thoughts: [{ label: '旧思考', text: '旧内容。' }],
    });
    await appendTavernMessage(session.id, { role: 'user', content: 'Next user.' });

    const updated = await updateTavernMessage(session.id, 0, { content: 'Edited user.' });
    assert.equal(updated?.content, 'Edited user.');
    const updatedAssistant = await updateTavernMessage(session.id, 1, {
        thoughts: [{ label: '新思考', text: '新内容。' }],
    });
    assert.deepEqual(updatedAssistant?.thoughts, [{ label: '新思考', text: '新内容。' }]);

    assert.equal(await deleteTavernMessages(session.id, [1]), 1);
    const messages = await listTavernMessages(session.id);
    assert.deepEqual(messages.map((message) => `${message.order}:${message.content}`), [
        '0:Edited user.',
        '2:Next user.',
    ]);
});

test('tavern chat preset compatibility wrappers do not create local prompt presets', async () => {
    await db.delete();
    await db.open();

    assert.equal(await getActiveTavernPresetId(), DEFAULT_XB_TAVERN_PRESET_ID);
    assert.equal((await loadActiveTavernPreset()).id, DEFAULT_XB_TAVERN_PRESET_ID);

    const derived = await deriveAndActivateDefaultTavernPreset('我的测试预设');
    assert.equal(derived.id, DEFAULT_XB_TAVERN_PRESET_ID);
    assert.equal(await getActiveTavernPresetId(), DEFAULT_XB_TAVERN_PRESET_ID);
    assert.equal((await listUserTavernPresets()).length, 0);

    const edited = {
        ...derived.preset,
        name: '改过的预设',
        sections: [
            ...(derived.preset.sections || []),
            {
                id: 'custom',
                label: '自定义',
                placement: 'afterHistory' as const,
                role: 'system' as const,
                content: '只存在用户预设里。',
            },
        ],
    };
    const saved = await saveTavernPreset(edited);
    assert.equal(saved.name, '改过的预设');
    assert.equal((await loadActiveTavernPreset()).name, '酒馆当前聊天预设');
    assert.equal((await listUserTavernPresets()).length, 0);

    await setActiveTavernPresetId('local-preset-id');
    assert.deepEqual(await loadActiveTavernPreset(), createDefaultXbTavernPreset());
});

test('tavern built-in assistant preset upgrades stale local defaults', async () => {
    await db.delete();
    await db.open();

    const staleDefault = createDefaultTavernAssistantPreset();
    const staleTwoPagePreset = {
        ...staleDefault,
        statePrompt: '过期规则：只维护全局记忆。',
        characterPrompt: '过期规则：不单独维护人物记忆。',
    };
    await tavernAssistantPresetsTable.put({
        id: DEFAULT_TAVERN_ASSISTANT_PRESET_ID,
        name: '默认助手预设',
        description: '旧内置默认。',
        version: 'stale-two-page-memory',
        isBuiltIn: true,
        createdAt: 1,
        updatedAt: 1,
        preset: staleTwoPagePreset,
    });

    const upgraded = await ensureDefaultTavernAssistantPreset();
    assert.equal(upgraded.version, DEFAULT_TAVERN_ASSISTANT_PRESET_VERSION);
    assert.equal(upgraded.createdAt, 1);

    const active = await loadActiveTavernAssistantPreset();
    assert.doesNotMatch(active.statePrompt, /memory\/session\.md|memory\/turns/i);
    assert.doesNotMatch(active.statePrompt, /memory\/state\.md/);
    assert.doesNotMatch(active.characterPrompt, /memory\/characters\/<角色名>\.md/);
    assert.doesNotMatch(active.characterPrompt, /Recent Related Events|最近发生了什么/);
});

test('tavern assistant preset editable sections hide fixed memory paths', () => {
    const normalized = normalizeTavernAssistantPreset({
        id: 'legacy-visible-paths',
        name: '旧可见路径',
        statePrompt: [
            'Use `memory/state.md` for facts and states that are still true right now.',
            'Keep character state, relationships, places, time, possessions, and ongoing constraints.',
            'Do not keep transient events after they stop being true.',
        ].join('\n'),
        characterPrompt: [
            'Maintain current-session character long-term memory in `memory/characters/<角色名>.md`.',
            '## Relationships',
            '- Toward the player:',
        ].join('\n'),
    });

    assert.doesNotMatch(normalized.statePrompt, /memory\/state\.md|facts and states that are still true/i);
    assert.match(normalized.statePrompt, /## 事件时间线/);
    assert.match(normalized.statePrompt, /## 世界状态/);
    assert.doesNotMatch(normalized.characterPrompt, /memory\/characters\/<角色名>\.md/);
    assert.match(normalized.characterPrompt, /## Relationships/);
});

test('tavern session state stores turn and merges world entry states', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({
        title: 'Runtime state',
        state: {
            turn: 2,
            worldEntryStates: {
                'Lore\u0000gate': { stickyUntilTurn: 4 },
            },
        },
    });

    assert.deepEqual(normalizeTavernSessionState(session.state), {
        turn: 2,
        activeMapDocId: 'main',
        contextWindowStartOrder: 0,
        contract: DEFAULT_TAVERN_SESSION_CONTRACT,
        worldEntryStates: {
            'Lore\u0000gate': { stickyUntilTurn: 4 },
        },
        nativeWorldInfoTimedState: {
            sticky: {},
            cooldown: {},
        },
    });

    await updateTavernSessionState(session.id, {
        turn: 3,
        worldEntryStates: {
            'Lore\u0000gate': { cooldownUntilTurn: 5 },
            'Lore\u0000new': { delayUntilTurn: 6 },
        },
        lastProvider: 'fake-provider',
    });

    const updated = await getTavernSession(session.id);
    assert.equal(updated?.state?.turn, 3);
    assert.deepEqual(updated?.state?.worldEntryStates, {
        'Lore\u0000gate': { stickyUntilTurn: 4, cooldownUntilTurn: 5 },
        'Lore\u0000new': { delayUntilTurn: 6 },
    });
    assert.equal(updated?.state?.lastProvider, 'fake-provider');

    assert.deepEqual(mergeWorldEntryStates({
        a: { stickyUntilTurn: 1 },
    }, {
        a: { cooldownUntilTurn: 2 },
    }), {
        a: { stickyUntilTurn: 1, cooldownUntilTurn: 2 },
    });

    await replaceTavernSessionState(session.id, {
        turn: 1,
        worldEntryStates: {
            'Lore\u0000fresh': { stickyUntilTurn: 2 },
        },
        lastProvider: '',
    });
    const replaced = await getTavernSession(session.id);
    assert.equal(replaced?.state?.turn, 1);
    assert.deepEqual(replaced?.state?.worldEntryStates, {
        'Lore\u0000fresh': { stickyUntilTurn: 2 },
    });
    assert.deepEqual(replaced?.state?.contract, DEFAULT_TAVERN_SESSION_CONTRACT);
    assert.equal(replaced?.state?.lastProvider, '');
});

test('replaceTavernSessionState preserves stored contract when runtime rebuild omits config fields', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({
        title: 'Contract replace',
        state: {
            turn: 2,
            activeMapDocId: 'office',
            contract: {
                memoryArchiving: false,
                cartographyEngine: false,
                statusPanel: true,
                actionChecks: true,
                randomEncounters: true,
                questOrchestration: false,
            },
            worldEntryStates: {
                'Lore\u0000gate': { stickyUntilTurn: 4 },
            },
        },
    });

    await replaceTavernSessionState(session.id, {
        turn: 5,
        worldEntryStates: {
            'Lore\u0000gate': { cooldownUntilTurn: 8 },
        },
    });

    const replaced = await getTavernSession(session.id);
    assert.deepEqual(normalizeTavernSessionState(replaced?.state), {
        turn: 5,
        activeMapDocId: 'office',
        contextWindowStartOrder: 0,
        contract: {
            memoryArchiving: false,
            cartographyEngine: false,
            statusPanel: true,
            actionChecks: true,
            randomEncounters: true,
            questOrchestration: false,
        },
        worldEntryStates: {
            'Lore\u0000gate': { cooldownUntilTurn: 8 },
        },
        nativeWorldInfoTimedState: {
            sticky: {},
            cooldown: {},
        },
    });
});

test('tavern memory db tracks state snapshots and manager runs', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Memory' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '去码头。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '两人确认了共同目标。' });
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n两人确认了共同目标。', { source: 'manager' });
    await saveTavernMemorySnapshot(session.id, assistantMessage.order);
    const run = await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        status: 'queued',
    });
    await updateTavernManagerRun(run.id, {
        status: 'completed',
        parsedAction: 'create_new_episode',
    });

    assert.equal((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content.includes('共同目标'), true);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [assistantMessage.order]);
    assert.equal((await listTavernManagerRuns(session.id))[0]?.status, 'completed');
});

test('tavern manager run heartbeat only touches active running runs', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager heartbeat' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: 0,
        assistantOrder: 1,
        status: 'running',
    });
    await new Promise((resolve) => setTimeout(resolve, 5));

    const touched = await touchRunningTavernManagerRun(run.id);
    assert.equal(touched?.status, 'running');
    assert.ok(Number(touched?.updatedAt || 0) >= run.updatedAt);

    const completed = await updateTavernManagerRun(run.id, { status: 'completed' });
    const afterTerminalHeartbeat = await touchRunningTavernManagerRun(run.id);
    assert.equal(afterTerminalHeartbeat?.status, 'completed');
    assert.equal((await listTavernManagerRuns(session.id))[0]?.status, 'completed');
    assert.equal(completed?.status, 'completed');
});

test('tavern memory files are scoped markdown sources with derived index', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Memory files', characterName: 'Aster' });
    const defaults = await ensureTavernMemoryDefaults(session.id, { characterName: 'Aster' });
    assert.deepEqual(defaults.map((file) => file.path).sort(), ['memory/state.md']);
    assert.match(defaults[0]?.content || '', /# 会话记忆/);

    const blocked = await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'book/state.md',
        content: 'nope',
    });
    assert.equal(blocked.ok, false);
    assert.match(blocked.error || '', /memory_path_scope_required/);
    assert.equal(normalizeCharacterMemoryPath('椎名真昼'), 'memory/characters/椎名真昼.md');
    assert.throws(() => normalizeTavernMemoryPath('memory/characters/bad/name.md'), /memory_path_invalid/);
    assert.throws(() => normalizeTavernMemoryPath('memory/characters/bad:name.md'), /memory_path_invalid/);
    assert.match(buildDefaultTavernCharacterMemoryContent('椎名真昼'), /# 椎名真昼/);

    const written = await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: [
            '# 会话记忆',
            '',
            'Aster 把银钥匙藏在码头钟楼下面。',
            '',
            '## 线索',
            '- 银钥匙',
        ].join('\n'),
    });
    assert.equal(written.ok, true);
    const oldPath = await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/turns/20260601-0000.md',
        content: '旧楼层小记不应再由工具创建。',
    });
    assert.equal(oldPath.ok, false);
    assert.equal(oldPath.error, 'memory_path_invalid');

    const userFileWrite = await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/characters/User.md',
        content: '# User\n\n不应创建用户侧人物档案。',
    });
    assert.equal(userFileWrite.ok, false);
    assert.equal(userFileWrite.error, 'memory_character_user_reserved');

    await writeTavernMemoryFile(session.id, 'memory/characters/玩家.md', '# 玩家\n\n旧数据或测试直写仍可能存在。', { source: 'manager' });
    const userFileEdit = await executeTavernMemoryTool(session.id, 'MemoryEdit', {
        filePath: 'memory/characters/玩家.md',
        edits: [{ oldString: '旧数据', newString: '新数据' }],
    });
    assert.equal(userFileEdit.ok, false);
    assert.equal(userFileEdit.error, 'memory_character_user_reserved');

    for (const reservedName of ['自己', '本人', 'host', 'DM', 'GM', 'narrator', '叙述者', '主持人', 'protagonist', 'operator', '我方', '主人翁']) {
        const blockedWrite = await executeTavernMemoryTool(session.id, 'MemoryWrite', {
            filePath: `memory/characters/${reservedName}.md`,
            content: `# ${reservedName}\n\n不应绕过保留词。`,
        });
        assert.equal(blockedWrite.ok, false, `expected ${reservedName} to be reserved`);
        assert.equal(blockedWrite.error, 'memory_character_user_reserved', `expected ${reservedName} to be reserved`);
    }

    const characterPath = 'memory/characters/椎名真昼.md';
    const characterWrite = await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: characterPath,
        content: '# 椎名真昼\n\n## 当前状态\n- 在场并保管蓝伞。',
    });
    assert.equal(characterWrite.ok, true);
    assert.equal((await getTavernMemoryFile(session.id, characterPath))?.content.includes('蓝伞'), true);
    const characterEdit = await executeTavernMemoryTool(session.id, 'MemoryEdit', {
        filePath: characterPath,
        edits: [{ oldString: '蓝伞', newString: '银伞' }],
    });
    assert.equal(characterEdit.ok, true);
    assert.equal((await getTavernMemoryFile(session.id, characterPath))?.content.includes('银伞'), true);

    const grep = await executeTavernMemoryTool(session.id, 'MemoryGrep', {
        pattern: '银钥匙',
    });
    assert.equal(grep.ok, true);
    assert.equal(grep.matches?.some((match) => String(match.text || '').includes('银钥匙')), true);

    const index = await rebuildTavernMemoryDerivedIndex(session.id);
    assert.equal(index.status, 'ready');
    assert.equal((await getTavernMemoryIndex(session.id))?.status, 'ready');
    assert.equal(index.files?.find((file) => file.path === 'memory/state.md')?.searchText?.includes('Aster 把银钥匙藏在码头钟楼下面'), true);
    assert.equal(index.files?.find((file) => file.path === characterPath)?.title, '椎名真昼');

    await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: [
            '# 会话记忆',
            '',
            '这份记录没有固定标题，但仍然是普通 Markdown 档案。',
        ].join('\n'),
    });
    const rebuilt = await rebuildTavernMemoryDerivedIndex(session.id);
    assert.equal(rebuilt.status, 'ready');
    assert.equal(Array.isArray(rebuilt.files), true);
    assert.equal(rebuilt.files?.some((file) => file.path === 'memory/state.md'), true);
    assert.equal(rebuilt.files?.find((file) => file.path === 'memory/state.md')?.contentLength, '# 会话记忆\n\n这份记录没有固定标题，但仍然是普通 Markdown 档案。'.length);
    const looseGrep = await executeTavernMemoryTool(session.id, 'MemoryGrep', {
        pattern: '固定标题',
        path: 'memory/state.md',
    });
    assert.equal(looseGrep.count, 1);
});

test('tavern memory retrieval uses the derived file index only', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Derived retrieval' });
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nThe silver key is still on hand. The harbor coordinates are now clear. Harbor coordinates marked on the wall.', { source: 'manager' });

    const memory = await retrieveXbTavernMemoryContext({
        sessionId: session.id,
        queryText: 'harbor coordinates',
        includeStructuredStates: false,
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), ['memory/state.md']);
    assert.equal(memory.memoryFiles?.[0]?.content.includes('harbor coordinates'), true);
});

test('tavern memory retrieval hydrates full state prompt content without expanding index preview', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Full state retrieval' });
    const tailMarker = 'STATE_TAIL_AFTER_2400_MUST_SURVIVE_DB_CHAIN';
    const longState = `# 会话记忆\n\n${'stable memory paragraph. '.repeat(180)}\n${tailMarker}`;
    assert.ok(longState.length > 2400);
    await writeTavernMemoryFile(session.id, 'memory/state.md', longState, { source: 'manager' });

    const index = await rebuildTavernMemoryDerivedIndex(session.id);
    const stateIndexFile = index.files?.find((file) => file.path === 'memory/state.md');
    assert.ok(stateIndexFile);
    assert.ok(String(stateIndexFile.preview || '').length < longState.length);
    assert.equal(String(stateIndexFile.preview || '').includes(tailMarker), false);

    const memory = await retrieveXbTavernMemoryContext({
        sessionId: session.id,
        queryText: 'stable memory',
        includeStructuredStates: false,
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), ['memory/state.md']);
    assert.equal(memory.memoryFiles?.[0]?.content.includes(tailMarker), true);
});

test('tavern memory retrieval injects character files by deterministic entity name hits', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Character memory retrieval', characterName: '椎名真昼' });
    const characterTailMarker = 'CHARACTER_TAIL_AFTER_2400_MUST_SURVIVE_DB_CHAIN';
    const longCharacterMemory = `# 椎名真昼\n\n${'真昼的长期变化继续记录。'.repeat(260)}\n${characterTailMarker}`;
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n全局主线仍在推进。', { source: 'manager' });
    await writeTavernMemoryFile(session.id, 'memory/characters/椎名真昼.md', longCharacterMemory, { source: 'manager' });
    await writeTavernMemoryFile(session.id, 'memory/characters/佐藤.md', '# 佐藤\n\n佐藤掌握码头钥匙。', { source: 'manager' });
    const index = await rebuildTavernMemoryDerivedIndex(session.id);
    const characterIndexFile = index.files?.find((file) => file.path === 'memory/characters/椎名真昼.md');
    assert.ok(characterIndexFile);
    assert.ok(String(characterIndexFile.preview || '').length < longCharacterMemory.length);
    assert.equal(String(characterIndexFile.preview || '').includes(characterTailMarker), false);

    const hit = await retrieveXbTavernMemoryContext({
        sessionId: session.id,
        queryText: '我们去找椎名真昼确认约定。',
        ignoredTerms: ['玩家'],
        includeStructuredStates: false,
    });
    assert.deepEqual(hit.memoryFiles?.map((file) => file.path), ['memory/state.md', 'memory/characters/椎名真昼.md']);
    assert.equal(hit.memoryFiles?.[1]?.content.includes(characterTailMarker), true);

    const miss = await retrieveXbTavernMemoryContext({
        sessionId: session.id,
        queryText: '玩家继续向前走。',
        ignoredTerms: ['玩家'],
        includeStructuredStates: false,
    });
    assert.deepEqual(miss.memoryFiles?.map((file) => file.path), ['memory/state.md']);

    await writeTavernMemoryFile(session.id, 'memory/characters/玩家.md', '# 玩家\n\n不应由用户名触发。', { source: 'manager' });
    await rebuildTavernMemoryDerivedIndex(session.id);
    const userNameOnly = await retrieveXbTavernMemoryContext({
        sessionId: session.id,
        queryText: '玩家检查背包。',
        ignoredTerms: ['玩家'],
        includeStructuredStates: false,
    });
    assert.deepEqual(userNameOnly.memoryFiles?.map((file) => file.path), ['memory/state.md']);
});

test('tavern memory snapshots restore file collections around user and assistant floors', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'State rollback floors', characterName: 'Aster' });
    const user0 = await appendTavernMessage(session.id, { role: 'user', content: '第一步。' });
    const assistant1 = await appendTavernMessage(session.id, { role: 'assistant', content: '第一步成立。' });
    await appendTavernMessage(session.id, { role: 'user', content: '第二步。' });
    const assistant3 = await appendTavernMessage(session.id, { role: 'assistant', content: '第二步成立。' });
    const user4 = await appendTavernMessage(session.id, { role: 'user', content: '第三步。' });
    const assistant5 = await appendTavernMessage(session.id, { role: 'assistant', content: '第三步成立。' });
    assert.equal(user0.order, 0);

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nfloor 1 state', { source: 'manager' });
    await writeTavernMemoryFile(session.id, 'memory/characters/Aster.md', '# Aster\n\nfloor 1 character', { source: 'manager' });
    await saveTavernMemorySnapshot(session.id, assistant1.order);
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nfloor 3 state', { source: 'manager' });
    await writeTavernMemoryFile(session.id, 'memory/characters/Aster.md', '# Aster\n\nfloor 3 character', { source: 'manager' });
    await writeTavernMemoryFile(session.id, 'memory/characters/Future.md', '# Future\n\nfuture file from floor 3', { source: 'manager' });
    await saveTavernMemorySnapshot(session.id, assistant3.order);
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nfloor 5 state', { source: 'manager' });
    await writeTavernMemoryFile(session.id, 'memory/characters/Aster.md', '# Aster\n\nfloor 5 character', { source: 'manager' });
    await saveTavernMemorySnapshot(session.id, assistant5.order);

    await restoreTavernMemoryToFloor(session.id, user4.order - 1);
    await trimTavernMemorySnapshotsFromFloor(session.id, user4.order);
    assert.match((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /floor 3 state/);
    assert.match((await getTavernMemoryFile(session.id, 'memory/characters/Aster.md'))?.content || '', /floor 3 character/);
    assert.notEqual(await getTavernMemoryFile(session.id, 'memory/characters/Future.md'), null);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [assistant1.order, assistant3.order]);

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nfloor 5 state again', { source: 'manager' });
    await writeTavernMemoryFile(session.id, 'memory/characters/Future.md', '# Future\n\nfuture file from floor 5', { source: 'manager' });
    await saveTavernMemorySnapshot(session.id, assistant5.order);
    await restoreTavernMemoryToFloor(session.id, assistant3.order - 1);
    await trimTavernMemorySnapshotsFromFloor(session.id, assistant3.order);
    assert.match((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /floor 1 state/);
    assert.match((await getTavernMemoryFile(session.id, 'memory/characters/Aster.md'))?.content || '', /floor 1 character/);
    assert.equal(await getTavernMemoryFile(session.id, 'memory/characters/Future.md'), null);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [assistant1.order]);
});

test('tavern memory snapshots commit manual edits only when the next turn accepts the floor', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manual state snapshot' });
    await appendTavernMessage(session.id, { role: 'user', content: '第一步。' });
    const assistant1 = await appendTavernMessage(session.id, { role: 'assistant', content: '第一步成立。' });
    const user2 = await appendTavernMessage(session.id, { role: 'user', content: '第二步。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '第二步成立。' });

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nfloor 1 base', { source: 'manager' });
    await saveTavernMemorySnapshot(session.id, assistant1.order);
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nmanual correction latest', { source: 'user' });
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nmanual correction overwritten', { source: 'user' });

    let snapshots = await listTavernMemorySnapshots(session.id);
    assert.deepEqual(snapshots.map((snapshot) => snapshot.floor), [assistant1.order]);

    await saveTavernMemorySnapshot(session.id);
    snapshots = await listTavernMemorySnapshots(session.id);
    assert.deepEqual(snapshots.map((snapshot) => snapshot.floor), [assistant1.order, 3]);
    assert.match(snapshots.find((snapshot) => snapshot.floor === 3)?.files.find((file) => file.path === 'memory/state.md')?.file.content || '', /overwritten/);

    await restoreTavernMemoryToFloor(session.id, user2.order - 1);
    await trimTavernMemorySnapshotsFromFloor(session.id, user2.order);
    assert.match((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /floor 1 base/);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [assistant1.order]);
});

test('tavern memory restore falls back to default and ignores current file hash', async () => {
    await db.delete();
    await db.open();

    const empty = await createTavernSession({ title: 'No snapshot', characterName: 'Aster' });
    await ensureTavernMemoryDefaults(empty.id, { characterName: 'Aster' });
    assert.equal(await saveTavernMemorySnapshot(empty.id), null);
    assert.deepEqual(await listTavernMemorySnapshots(empty.id), []);
    await writeTavernMemoryFile(empty.id, 'memory/characters/Future.md', '# Future\n\nshould disappear', { source: 'manager' });
    const restoredDefault = await restoreTavernMemoryToFloor(empty.id, 10);
    assert.equal(restoredDefault[0]?.path, 'memory/state.md');
    assert.equal(restoredDefault[0]?.content, buildDefaultTavernMemoryStateContent('Aster'));
    assert.equal(await getTavernMemoryFile(empty.id, 'memory/characters/Future.md'), null);
    assert.deepEqual(await listTavernMemorySnapshots(empty.id), []);

    const session = await createTavernSession({ title: 'Hashless restore' });
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nsnapshot truth', { source: 'manager' });
    await saveTavernMemorySnapshot(session.id, 2);
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nuser diverged before rollback', { source: 'user' });
    await restoreTavernMemoryToFloor(session.id, 2);
    assert.match((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /snapshot truth/);
});

test('tavern memory baseline snapshots can restore pre-first-turn character files', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Baseline character memory', characterName: 'Aster' });
    await ensureTavernMemoryDefaults(session.id, { characterName: 'Aster' });
    await writeTavernMemoryFile(session.id, 'memory/characters/Aster.md', '# Aster\n\n开局前用户修正。', { source: 'user' });
    const baseline = await saveTavernMemorySnapshot(session.id);
    assert.equal(baseline?.floor, -1);
    assert.equal(baseline?.files.some((file) => file.path === 'memory/characters/Aster.md'), true);

    await writeTavernMemoryFile(session.id, 'memory/characters/Future.md', '# Future\n\n第一轮后创建。', { source: 'manager' });
    await restoreTavernMemoryToFloor(session.id, -1);

    assert.match((await getTavernMemoryFile(session.id, 'memory/characters/Aster.md'))?.content || '', /开局前用户修正/);
    assert.equal(await getTavernMemoryFile(session.id, 'memory/characters/Future.md'), null);
});

test('tavern memory snapshots skip unchanged file collections', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Snapshot dedupe', characterName: 'Aster' });
    const assistant1 = await appendTavernMessage(session.id, { role: 'assistant', content: '第一步成立。' });
    const assistant2 = await appendTavernMessage(session.id, { role: 'assistant', content: '第二步无变化。' });

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n同一份状态。', { source: 'manager' });
    await writeTavernMemoryFile(session.id, 'memory/characters/Aster.md', '# Aster\n\n同一份人物状态。', { source: 'manager' });
    const first = await saveTavernMemorySnapshot(session.id, assistant1.order);
    const second = await saveTavernMemorySnapshot(session.id, assistant2.order);

    assert.notEqual(first, null);
    assert.equal(second, null);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [assistant1.order]);

    await writeTavernMemoryFile(session.id, 'memory/characters/Aster.md', '# Aster\n\n状态真的变了。', { source: 'manager' });
    const third = await saveTavernMemorySnapshot(session.id, assistant2.order);
    assert.notEqual(third, null);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [assistant1.order, assistant2.order]);
});

test('ChatHistory range mode treats missing endOrder as open-ended', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'ChatHistory range' });
    await appendTavernMessage(session.id, { role: 'user', content: '第 0 条。' });
    await appendTavernMessage(session.id, {
        role: 'assistant',
        content: '第 1 条。',
        thoughts: [{ label: 'hidden', text: '第 1 条思考。' }],
    });
    await appendTavernMessage(session.id, { role: 'user', content: '第 2 条。' });

    const result = await executeTavernMemoryTool(session.id, 'ChatHistory', {
        mode: 'range',
        startOrder: 1,
        full: true,
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.messages?.map((message) => message.order), [1, 2]);
    assert.deepEqual(result.messages?.[0]?.thoughts, [{ label: 'hidden', text: '第 1 条思考。' }]);

    const preview = await executeTavernMemoryTool(session.id, 'ChatHistory', {
        mode: 'range',
        startOrder: 1,
        limit: 1,
    });
    assert.equal(preview.messages?.[0]?.reasoningSnippet, '第 1 条思考。');
});

test('ChatHistory recent mode reads an indexed latest window in chronological order', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'ChatHistory recent' });
    for (let index = 0; index < 5; index += 1) {
        await appendTavernMessage(session.id, {
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: `第 ${index} 条。`,
        });
    }

    const firstPage = await executeTavernMemoryTool(session.id, 'ChatHistory', {
        mode: 'recent',
        limit: 2,
    });
    assert.equal(firstPage.ok, true);
    assert.equal(firstPage.count, 5);
    assert.equal(firstPage.truncated, true);
    assert.equal(firstPage.nextOffset, 2);
    assert.deepEqual(firstPage.messages?.map((message) => message.order), [3, 4]);

    const secondPage = await executeTavernMemoryTool(session.id, 'ChatHistory', {
        mode: 'recent',
        limit: 2,
        offset: 2,
    });
    assert.deepEqual(secondPage.messages?.map((message) => message.order), [1, 2]);
});

test('MemoryRead returns raw content, line numbers, and pagination hints', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Memory read lines' });
    await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: ['# 状态栏', '', '## 当前事实', '- 银钥匙在钟楼。', '- 小满知道暗号。'].join('\n'),
    });

    const result = await executeTavernMemoryTool(session.id, 'MemoryRead', {
        filePath: 'memory/state.md',
        offset: 3,
        limit: 2,
    });

    assert.equal(result.ok, true);
    assert.equal(result.lineStart, 3);
    assert.equal(result.lineEnd, 4);
    assert.equal(result.totalLines, 5);
    assert.equal(result.truncated, true);
    assert.equal(result.nextOffset, 5);
    assert.match(result.content || '', /## 当前事实/);
    assert.match(result.numberedContent || '', /^3: ## 当前事实/m);
});

test('MemoryGrep supports scope, context, pagination, and output modes', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Memory grep paging' });
    await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: ['# 状态栏', '银钥匙在钟楼。', '她没有拿走钥匙。', '银钥匙仍是伏笔。'].join('\n'),
    });

    const firstPage = await executeTavernMemoryTool(session.id, 'MemoryGrep', {
        pattern: '银钥匙',
        path: 'memory/state.md',
        limit: 1,
        contextLines: 1,
    });

    assert.equal(firstPage.ok, true);
    assert.equal(firstPage.count, 2);
    assert.equal(firstPage.truncated, true);
    assert.equal(firstPage.nextOffset, 1);
    assert.equal(firstPage.matches?.[0]?.line, 2);
    assert.match(firstPage.matches?.[0]?.context || '', /^1: # 状态栏/m);

    const counts = await executeTavernMemoryTool(session.id, 'MemoryGrep', {
        pattern: '钥匙',
        path: 'memory/state.md',
        outputMode: 'count',
    });
    assert.equal(counts.matches?.[0]?.count, 3);
});

test('MemoryEdit persists partial successes and reports diagnostics like ebook Edit', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Memory edit partial' });
    await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: ['# 状态栏', '- 旧事实。', '- 保留。'].join('\n'),
    });

    const edit = await executeTavernMemoryTool(session.id, 'MemoryEdit', {
        filePath: 'memory/state.md',
        edits: [
            { oldString: '旧事实', newString: '新事实' },
            { oldString: '不存在的片段', newString: '不会出现' },
        ],
    });

    assert.equal(edit.ok, false);
    assert.equal(edit.changed, true);
    assert.equal(edit.partial, true);
    assert.equal(edit.appliedCount, 1);
    assert.equal(edit.failedCount, 1);

    const read = await executeTavernMemoryTool(session.id, 'MemoryRead', {
        filePath: 'memory/state.md',
    });
    assert.match(read.content || '', /新事实/);
    assert.doesNotMatch(read.content || '', /不会出现/);
});

test('source file tools read chat, worldbooks, and memory while keeping evidence sources read-only', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Source file tools' });
    await appendTavernMessage(session.id, { role: 'user', content: 'a.b 字面值在第一楼。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: 'axb 只是相似文本。' });
    await executeTavernSourceFileTool(session.id, 'Write', {
        filePath: 'memory/state.md',
        content: '# 会话记忆\n\n银钥匙在钟楼。',
    });
    const contextSnapshot = {
        worldBooks: [{
            name: '钟楼传说',
            worldSourceType: 'global',
            entries: [{
                uid: 'bell',
                comment: '钟楼',
                key: ['钟楼'],
                content: '钟楼顶层藏着旧铃。',
            }],
        }],
    };

    const literal = await executeTavernSourceFileTool(session.id, 'Grep', {
        pattern: 'a.b',
        path: 'chat/',
    }, { contextSnapshot });
    assert.equal(literal.ok, true);
    assert.deepEqual(literal.matches?.map((match) => match.path), ['chat/messages/0.md']);

    const regex = await executeTavernSourceFileTool(session.id, 'Grep', {
        pattern: 'a.b',
        path: 'chat/',
        useRegex: true,
    }, { contextSnapshot });
    assert.deepEqual(regex.matches?.map((match) => match.path), ['chat/messages/0.md', 'chat/messages/1.md']);

    const exactFileRegex = await executeTavernSourceFileTool(session.id, 'Grep', {
        pattern: 'a.b',
        filePath: 'chat/messages/1.md',
        regex: true,
    }, { contextSnapshot });
    assert.deepEqual(exactFileRegex.matches?.map((match) => match.path), ['chat/messages/1.md']);

    const worldbookList = await executeTavernSourceFileTool(session.id, 'LS', {
        path: 'worldbooks/global/钟楼传说/',
    }, { contextSnapshot });
    assert.equal(worldbookList.entries?.[0]?.path, 'worldbooks/global/钟楼传说/bell.md');

    const worldbookRead = await executeTavernSourceFileTool(session.id, 'Read', {
        filePath: 'worldbooks/global/钟楼传说/bell.md',
    }, { contextSnapshot });
    assert.match(worldbookRead.content || '', /钟楼顶层藏着旧铃/);

    const memoryRead = await executeTavernSourceFileTool(session.id, 'Read', {
        filePath: 'memory/state.md',
        tail: 2,
    });
    assert.match(memoryRead.content || '', /银钥匙在钟楼/);

    const blocked = await executeTavernSourceFileTool(session.id, 'Edit', {
        filePath: 'chat/messages/0.md',
        edits: [{ oldString: 'a.b', newString: '改写' }],
    });
    assert.equal(blocked.ok, false);
    assert.equal(blocked.error, 'source_file_read_only');
});
test('source file reads do not create default memory files', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Source reads only' });
    await appendTavernMessage(session.id, { role: 'user', content: '钟楼传说只在聊天里出现。' });
    const contextSnapshot = {
        worldBooks: [{
            name: '只读设定',
            worldSourceType: 'global',
            entries: [{
                uid: 'tower',
                comment: '钟楼',
                key: ['钟楼'],
                content: '钟楼不会创建记忆文件。',
            }],
        }],
    };

    assert.deepEqual((await listTavernMemoryFiles(session.id, { includeStale: true })).map((file) => file.path), []);

    const chatRead = await executeTavernSourceFileTool(session.id, 'Read', {
        filePath: 'chat/transcript.md',
        tail: 5,
    }, { contextSnapshot });
    assert.equal(chatRead.ok, true);
    const worldbookGrep = await executeTavernSourceFileTool(session.id, 'Grep', {
        pattern: '钟楼',
        path: 'worldbooks/',
    }, { contextSnapshot });
    assert.equal(worldbookGrep.ok, true);
    const worldbookList = await executeTavernSourceFileTool(session.id, 'LS', {
        path: 'worldbooks/global/只读设定/',
    }, { contextSnapshot });
    assert.equal(worldbookList.ok, true);

    assert.deepEqual((await listTavernMemoryFiles(session.id, { includeStale: true })).map((file) => file.path), []);

    const write = await executeTavernSourceFileTool(session.id, 'Write', {
        filePath: 'memory/state.md',
        content: '# 会话记忆\n\n钟楼被正式记录。',
    });
    assert.equal(write.ok, true);
    assert.deepEqual((await listTavernMemoryFiles(session.id, { includeStale: true })).map((file) => file.path), ['memory/state.md']);
});

test('loose JSON repair knows tavern manager tool arguments', () => {
    const repairedHistory = JSON.parse(repairLooseToolArguments(
        '{path:"chat/transcript.md", tail:40, limit:3}',
        'Read',
    ));
    assert.deepEqual(repairedHistory, {
        filePath: 'chat/transcript.md',
        tail: 40,
        limit: 3,
    });

    const repairedGrep = JSON.parse(repairLooseToolArguments(
        '{query:"银钥匙", scope:"memory/state.md", useRegex:false, contextLines:1}',
        'Grep',
    ));
    assert.equal(repairedGrep.pattern, '银钥匙');
    assert.equal(repairedGrep.path, 'memory/state.md');
    assert.equal(repairedGrep.useRegex, false);
    assert.equal(repairedGrep.contextLines, 1);

    const repairedEventPatch = JSON.parse(repairLooseToolArguments(
        '{op:"upsert-vision", title:"码头名", vision:"弄清码头名字", doneWhen:"角色当场说出答案。", hookForModel:"码头名字在对话里轻轻擦过。"}',
        'EventPatch',
    ));
    assert.equal(repairedEventPatch.title, '码头名');
    assert.equal(repairedEventPatch.vision, '弄清码头名字');
    assert.equal(repairedEventPatch.doneWhen, '角色当场说出答案。');
    assert.equal(repairedEventPatch.hookForModel, '码头名字在对话里轻轻擦过。');
});

test('Tavern Grep accepts ebook-style query and scope aliases', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Grep aliases' });
    await executeTavernSourceFileTool(session.id, 'Write', {
        filePath: 'memory/state.md',
        content: '# 会话记忆\n\n银钥匙在钟楼。',
    });

    const result = await executeTavernSourceFileTool(session.id, 'Grep', {
        query: '银钥匙',
        scope: 'memory/',
        outputMode: 'files-with-matches',
    });

    assert.equal(result.ok, true);
    assert.equal(result.outputMode, 'files_with_matches');
    assert.deepEqual(result.matches?.map((match) => match.path), ['memory/state.md']);
});

test('Read tool schema documents filePath and tail semantics', () => {
    const readTool = getTavernManagerToolDefinitions()
        .find((tool) => tool.function.name === 'Read');
    const parameters = readTool?.function.parameters as {
        properties?: Record<string, { description?: string }>;
    };

    assert.match(readTool?.function.description || '', /line-numbered content/);
    assert.match(readTool?.function.description || '', /Use `tail` by itself/i);
    assert.match(readTool?.function.description || '', /argument name is `filePath`, not `path`/i);
    assert.match(parameters.properties?.tail?.description || '', /Do not combine with offset\/limit/i);
});

test('Grep tool schema documents literal default and source scopes', () => {
    const grepTool = getTavernManagerToolDefinitions()
        .find((tool) => tool.function.name === 'Grep');
    const parameters = grepTool?.function.parameters as {
        properties?: Record<string, { description?: string }>;
    };

    assert.match(grepTool?.function.description || '', /literal text search by default/i);
    assert.match(grepTool?.function.description || '', /chat\/.*worldbooks\/.*memory\//s);
    assert.match(grepTool?.function.description || '', /filePath.*alias/i);
    assert.match(grepTool?.function.description || '', /regex: true.*useRegex: true/i);
    assert.match(parameters.properties?.filePath?.description || '', /Alias for path/i);
    assert.match(parameters.properties?.regex?.description || '', /Default false/i);
    assert.match(parameters.properties?.useRegex?.description || '', /Default false/i);
});

test('Write tool schema documents memory path discipline and whole-file semantics', () => {
    const writeTool = getTavernManagerToolDefinitions()
        .find((tool) => tool.function.name === 'Write');

    assert.match(writeTool?.function.description || '', /chat\/.*worldbooks\/.*read-only evidence sources/s);
    assert.match(writeTool?.function.description || '', /Do not create index files, turn files, session files/i);
    assert.match(writeTool?.function.description || '', /User, Player, 用户, or 玩家/);
    assert.match(writeTool?.function.description || '', /Use Edit instead for small corrections/i);
    assert.match(writeTool?.function.description || '', /Writable paths are exactly `memory\/state\.md` and `memory\/characters\/<角色名>\.md`/);
});

test('Edit tool schema documents edit modes and array discipline', () => {
    const editTool = getTavernManagerToolDefinitions()
        .find((tool) => tool.function.name === 'Edit');
    const parameters = editTool?.function.parameters as {
        properties?: Record<string, { description?: string }>;
    };

    assert.match(editTool?.function.description || '', /Read the target file first/i);
    assert.match(editTool?.function.description || '', /not a JSON-stringified string/i);
    assert.match(editTool?.function.description || '', /normalizes by priority/i);
    assert.match(editTool?.function.description || '', /Do not issue multiple Edit tool calls for the same file in one assistant turn/i);
    assert.match(editTool?.function.description || '', /Keep oldString edits separate from line-number edits/i);
    assert.match(editTool?.function.description || '', /Wrong: `"edits":/);
    assert.match(editTool?.function.description || '', /Correct line-range item/i);
    assert.match(editTool?.function.description || '', /insertion falls inside a line range/i);
    assert.match(editTool?.function.description || '', /Failure Handling/i);
    assert.match(editTool?.function.description || '', /If two changes overlap, merge them/i);
    assert.match(editTool?.function.description || '', /User, Player, 用户, or 玩家/);
    assert.match(editTool?.function.description || '', /bottom to top/);
    assert.match(editTool?.function.description || '', /Common punctuation equivalence is supported/i);
    assert.match(parameters.properties?.edits?.description || '', /real, non-empty JSON array/i);
    assert.match(parameters.properties?.edits?.description || '', /not a quoted JSON string/);
    assert.match(parameters.properties?.edits?.description || '', /startLine\/endLine\/newString/);
    assert.match(parameters.properties?.edits?.description || '', /insertAtLine\/newString/);
    assert.match(parameters.properties?.edits?.description || '', /Stray optional fields are ignored by mode priority/i);
});

test('MapInspect tool schema documents summary-first and mode semantics', () => {
    const readTool = getTavernStateToolDefinitions()
        .find((tool) => tool.function.name === 'MapInspect');
    const parameters = readTool?.function.parameters as {
        properties?: Record<string, { description?: string }>;
    };

    assert.match(readTool?.function.description || '', /For `tavern\.map`/i);
    assert.match(readTool?.function.description || '', /For `tavern\.atlas`/i);
    assert.match(readTool?.function.description || '', /Atlas does not have map elements/i);
    assert.match(parameters.properties?.docId?.description || '', /atlas always uses `main`/i);
    assert.match(parameters.properties?.mode?.description || '', /For maps: summary\/elements\/document\/element\/history/i);
    assert.match(parameters.properties?.elementId?.description || '', /Required for `element` mode/i);
    assert.match(parameters.properties?.tail?.description || '', /For `history` mode, return the final N patch transactions/i);
});

test('MapPatch tool schema documents canonical ops and camera semantics', () => {
    const patchTool = getTavernStateToolDefinitions()
        .find((tool) => tool.function.name === 'MapPatch');
    type SchemaNode = {
        description?: string;
        enum?: string[];
        properties?: Record<string, SchemaNode>;
        items?: SchemaNode;
        anyOf?: SchemaNode[];
        required?: string[];
    };
    const parameters = patchTool?.function.parameters as {
        properties?: Record<string, SchemaNode>;
        required?: string[];
    };
    const opSchemas = parameters.properties?.ops?.items?.anyOf || [];
    const findOpSchema = (op: string) => {
        const schema = opSchemas.find((candidate) => candidate.properties?.op?.enum?.includes(op));
        assert.ok(schema, `missing MapPatch op schema for ${op}`);
        return schema;
    };
    const metaOpProperties = findOpSchema('meta').properties || {};
    const addOpProperties = findOpSchema('add').properties || {};
    const modifyOpProperties = findOpSchema('modify').properties || {};
    const atlasLocationOpProperties = findOpSchema('upsert-location').properties || {};
    const elementProperties = addOpProperties.element?.properties || {};
    const metaSetProperties = metaOpProperties.set?.properties || {};
    const elementSetProperties = modifyOpProperties.set?.properties || {};
    const atlasLocationSetProperties = atlasLocationOpProperties.set?.properties || {};

    assert.match(patchTool?.function.description || '', /For `tavern\.map`, canonical ops are `meta`, `add`, `modify`, and `remove`/);
    assert.match(patchTool?.function.description || '', /For `tavern\.atlas\/main`/);
    assert.match(patchTool?.function.description || '', /Move the player between places with `move-actor`/);
    assert.match(patchTool?.function.description || '', /one atomic transaction/i);
    assert.match(patchTool?.function.description || '', /`meta\.viewBox` is the camera/i);
    assert.match(patchTool?.function.description || '', /Activate-only calls may omit `ops` or pass `ops:\[\]`/i);
    assert.match(patchTool?.function.description || '', /Never send empty `path:\[\]`, `curve:\[\]`, `points:\[\]`, or `line:\[\]`/i);
    assert.match(patchTool?.function.description || '', /Minimal first scene-map example/i);
    assert.match(patchTool?.function.description || '', /Mood enum is neutral\/warm\/cold\/dark\/mystic\/danger\/calm/i);
    assert.match(patchTool?.function.description || '', /Material enum is unknown\/wood\/stone\/tile\/carpet\/bed-sheet\/fabric\/tatami\/sand\/marble\/blood\/water\/grass\/dirt\/snow\/metal\/rune\/warm-light\/cold-light\/shadow/i);
    assert.match(patchTool?.function.description || '', /Use cat:"terrain" for the main continuous scene surface or filled base area/i);
    assert.match(patchTool?.function.description || '', /indoor floor, outdoor ground, deck, platform, clearing, yard, roadbed, shoreline area/i);
    assert.match(patchTool?.function.description || '', /Do not use floor, ground, surface, deck, platform, base, area, region, subtype, opacity/i);
    assert.match(patchTool?.function.description || '', /visual scale/i);
    assert.match(patchTool?.function.description || '', /splits the text into a system label element automatically/i);
    assert.match(patchTool?.function.description || '', /`kind` drives map logic such as exits/i);
    assert.match(parameters.properties?.docId?.description || '', /atlas always uses `main`/i);
    assert.match(parameters.properties?.activate?.description || '', /With `ops:\[\]`, this only switches the active map/i);
    assert.equal(Array.isArray(parameters.required) && parameters.required.includes('ops'), false);
    assert.match(parameters.properties?.ops?.description || '', /Required unless `activate:true`/i);
    assert.equal(opSchemas.length, 9);
    assert.match(metaOpProperties.set?.description || '', /For map `meta`/i);
    assert.match(modifyOpProperties.set?.description || '', /For map `modify`/i);
    assert.match(atlasLocationOpProperties.set?.description || '', /For atlas `upsert-location`/i);
    assert.match(addOpProperties.element?.description || '', /Full element object for `add`/i);
    assert.match(addOpProperties.element?.description || '', /never send empty `path:\[\]`/i);
    assert.match(elementProperties.kind?.description || '', /closed system semantic/i);
    assert.deepEqual(elementProperties.shape?.enum, ['icon']);
    assert.match(elementProperties.shape?.description || '', /Explicit icon geometry/i);
    assert.match(elementProperties.icon?.description || '', /Material Symbols official/i);
    assert.match(elementProperties.path?.description || '', /do not send an empty array/i);
    assert.match(elementProperties.curve?.description || '', /do not send an empty array/i);
    assert.deepEqual(elementProperties.material?.enum, [
        'unknown',
        'wood',
        'stone',
        'tile',
        'carpet',
        'bed-sheet',
        'fabric',
        'tatami',
        'sand',
        'marble',
        'blood',
        'water',
        'grass',
        'dirt',
        'snow',
        'metal',
        'rune',
        'warm-light',
        'cold-light',
        'shadow',
    ]);
    assert.deepEqual(elementProperties.certainty?.enum, ['confirmed', 'inferred', 'unknown']);
    assert.equal(elementProperties.fill, undefined);
    assert.equal(elementProperties.style, undefined);
    assert.equal(metaSetProperties.at, undefined);
    assert.equal(metaSetProperties.shape, undefined);
    assert.equal(metaSetProperties.icon, undefined);
    assert.deepEqual(metaSetProperties.status?.enum, ['uninitialized', 'active']);
    assert.deepEqual(metaSetProperties.mood?.enum, ['neutral', 'warm', 'cold', 'dark', 'mystic', 'danger', 'calm']);
    assert.equal(elementSetProperties.fill, undefined);
    assert.equal(elementSetProperties.style, undefined);
    assert.equal(elementSetProperties.opacity, undefined);
    assert.equal(elementSetProperties.zIndex, undefined);
    assert.equal(elementSetProperties.name, undefined);
    assert.equal(elementSetProperties.viewBox, undefined);
    assert.equal(elementSetProperties.status, undefined);
    assert.deepEqual(elementSetProperties.shape?.enum, ['icon']);
    assert.match(elementSetProperties.icon?.description || '', /does not change geometry/i);
    assert.deepEqual(elementSetProperties.material?.enum, [
        'unknown',
        'wood',
        'stone',
        'tile',
        'carpet',
        'bed-sheet',
        'fabric',
        'tatami',
        'sand',
        'marble',
        'blood',
        'water',
        'grass',
        'dirt',
        'snow',
        'metal',
        'rune',
        'warm-light',
        'cold-light',
        'shadow',
    ]);
    assert.deepEqual(elementSetProperties.certainty?.enum, ['confirmed', 'inferred', 'unknown']);
    assert.deepEqual(atlasLocationSetProperties.scale?.enum, ['city', 'district', 'building', 'floor', 'room', 'outdoor']);
    assert.deepEqual(atlasLocationSetProperties.status?.enum, ['mentioned', 'visited']);
    assert.equal(atlasLocationSetProperties.shape, undefined);
    assert.equal(atlasLocationSetProperties.icon, undefined);
    assert.equal(atlasLocationSetProperties.rect, undefined);
    assert.equal(atlasLocationSetProperties.circle, undefined);
    assert.equal(atlasLocationSetProperties.path, undefined);
    assert.equal(atlasLocationSetProperties.curve, undefined);
    assert.equal(atlasLocationSetProperties.at, undefined);
    assert.equal(atlasLocationSetProperties.cat, undefined);
    assert.equal(atlasLocationSetProperties.material, undefined);
    assert.equal(atlasLocationSetProperties.certainty, undefined);
});

test('Map tools support tavern atlas without entering map element semantics', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Atlas session' });
    const listAll = await executeTavernStateTool(session.id, 'MapDocs', {});
    assert.equal(listAll.ok, true);
    assert.deepEqual(listAll.documents?.map((document) => document.docType).sort(), ['tavern.atlas', 'tavern.map']);

    const list = await executeTavernStateTool(session.id, 'MapDocs', { docType: 'tavern.atlas' });
    assert.equal(list.ok, true);
    assert.equal(list.documents?.[0]?.docType, 'tavern.atlas');
    assert.equal(list.documents?.[0]?.docId, 'main');

    const readEmpty = await executeTavernStateTool(session.id, 'MapInspect', { docType: 'tavern.atlas', mode: 'summary' });
    assert.equal(readEmpty.ok, true);
    assert.equal(readEmpty.count, 0);

    const patch = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [
            { op: 'upsert-location', key: 'office', set: { name: '办公室', scale: 'room', status: 'mentioned', brief: '公司三楼开放办公区', mapDocId: 'office' } },
            { op: 'move-actor', actorKey: 'player', locationKey: 'office' },
        ],
    });
    assert.equal(patch.ok, true);
    assert.equal(patch.activeLocationKey, 'office');
    assert.equal((await getTavernSession(session.id))?.state?.activeMapDocId, 'office');

    const readLocations = await executeTavernStateTool(session.id, 'MapInspect', { docType: 'tavern.atlas', mode: 'locations' });
    assert.equal(readLocations.locations?.[0]?.status, 'visited');
    assert.equal(readLocations.locations?.[0]?.mapDocId, 'office');

    const elementRead = await executeTavernStateTool(session.id, 'MapInspect', { docType: 'tavern.atlas', mode: 'elements' });
    assert.equal(elementRead.ok, false);
    assert.equal(elementRead.error, 'state_read_mode_invalid');
});

test('Atlas patch validates merge, links, dependencies, dryRun, and player sync rules', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Atlas rules' });
    const seed = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [
            { op: 'upsert-location', key: 'company', set: { name: '公司', scale: 'building', status: 'visited' } },
            { op: 'upsert-location', key: 'office', set: { name: '办公室', scale: 'room', status: 'visited', parent: 'company', mapDocId: 'office' } },
            { op: 'upsert-location', key: 'hall', set: { name: '大厅', scale: 'room', status: 'mentioned', parent: 'company' } },
            { op: 'upsert-link', from: 'office', to: 'hall', kind: 'door' },
        ],
    });
    assert.equal(seed.ok, true);

    const downgrade = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [{ op: 'upsert-location', key: 'office', set: { status: 'mentioned', brief: '靠窗工位区' } }],
    });
    assert.equal(downgrade.ok, true);
    const office = await executeTavernStateTool(session.id, 'MapInspect', { docType: 'tavern.atlas', mode: 'location', locationKey: 'office' });
    assert.equal(office.location?.status, 'visited');
    assert.equal(office.location?.brief, '靠窗工位区');

    const missingParent = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [{ op: 'upsert-location', key: 'roof', set: { name: '天台', scale: 'floor', status: 'mentioned', parent: 'missing' } }],
    });
    assert.equal(missingParent.ok, false);
    assert.equal(missingParent.error, 'state_patch_failed');

    const invalidMapDocId = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [{ op: 'upsert-location', key: 'street', set: { name: '街道', scale: 'outdoor', status: 'mentioned', mapDocId: 'street/main' } }],
    });
    assert.equal(invalidMapDocId.ok, false);
    assert.match(invalidMapDocId.summary || '', /atlas_location_map_doc_id_invalid/);

    const invalidUnset = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [{ op: 'upsert-location', key: 'office', unset: ['status'] }],
    });
    assert.equal(invalidUnset.ok, false);
    assert.match(invalidUnset.summary || '', /atlas_unset_field_invalid:status/);

    const cycle = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [{ op: 'upsert-location', key: 'company', set: { parent: 'office' } }],
    });
    assert.equal(cycle.ok, false);

    const danglingLink = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [{ op: 'upsert-link', from: 'office', to: 'missing', kind: 'door' }],
    });
    assert.equal(danglingLink.ok, false);

    const directional = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [
            { op: 'upsert-link', from: 'office', to: 'hall', kind: 'passage', bidirectional: false },
            { op: 'upsert-link', from: 'hall', to: 'office', kind: 'passage', bidirectional: false },
        ],
    });
    assert.equal(directional.ok, true);
    const links = await executeTavernStateTool(session.id, 'MapInspect', { docType: 'tavern.atlas', mode: 'links', kind: 'passage' });
    assert.deepEqual(links.links?.map((link) => link.id).sort(), ['link:hall:office:passage', 'link:office:hall:passage']);

    const dryRun = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        dryRun: true,
        ops: [{ op: 'move-actor', actorKey: 'lina', locationKey: 'hall' }],
    });
    assert.equal(dryRun.ok, true);
    const actorsAfterDryRun = await executeTavernStateTool(session.id, 'MapInspect', { docType: 'tavern.atlas', mode: 'actors' });
    assert.equal(actorsAfterDryRun.actors?.some((actor) => actor.actorKey === 'lina'), false);

    const npcMove = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [{ op: 'move-actor', actorKey: 'lina', locationKey: 'hall' }],
    });
    assert.equal(npcMove.ok, true);
    assert.equal(npcMove.activeLocationKey, undefined);
    assert.equal((await getTavernAtlasStateForSession(session.id)).activeLocationKey, '');

    const playerMove = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [{ op: 'move-actor', actorKey: 'player', locationKey: 'office' }],
    });
    assert.equal(playerMove.ok, true);
    assert.equal((await getTavernAtlasStateForSession(session.id)).activeLocationKey, 'office');

    const blockedRemove = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [{ op: 'remove-location', key: 'office' }],
    });
    assert.equal(blockedRemove.ok, false);
});

test('Map activate does not move atlas and spatial digest uses atlas active map', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Atlas digest' });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.map',
        docId: 'office',
        ops: [
            { op: 'meta', set: { name: '办公室', viewBox: [0, 0, 400, 300], status: 'active', mood: 'cold' } },
            { op: 'add', element: { id: 'desk', cat: 'furniture', at: [90, 90], rect: [120, 60], text: '办公桌', material: 'metal' } },
            { op: 'add', element: { id: 'door', cat: 'door', kind: 'door', at: [200, 260], shape: 'icon', icon: 'door_open', text: '门' } },
            { op: 'add', element: { id: 'player-office', cat: 'actor', kind: 'player', actorKey: 'player', at: [200, 180], shape: 'icon', icon: 'person_pin_circle', text: '玛雅' } },
            { op: 'add', element: { id: 'generic-user', cat: 'actor', actorKey: 'user', at: [240, 180], shape: 'icon', icon: 'person', text: '玩家' } },
        ],
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.map',
        docId: 'home',
        ops: [
            { op: 'meta', set: { name: '家', viewBox: [0, 0, 400, 300], status: 'active' } },
            { op: 'add', element: { id: 'bed', cat: 'furniture', at: [100, 100], rect: [80, 40], text: '床' } },
        ],
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [
            { op: 'upsert-location', key: 'office', set: { name: '办公室', scale: 'room', status: 'visited', mapDocId: 'office' } },
            { op: 'upsert-location', key: 'home', set: { name: '家', scale: 'room', status: 'visited', mapDocId: 'home' } },
            { op: 'move-actor', actorKey: 'player', locationKey: 'office' },
        ],
    });

    const activateHome = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.map',
        docId: 'home',
        activate: true,
        ops: [],
    });
    assert.equal(activateHome.ok, true);
    assert.equal(activateHome.warnings?.length, 1);
    assert.equal((await getTavernAtlasStateForSession(session.id)).activeLocationKey, 'office');

    const spatial = await buildTavernSpatialStateDigest(session.id);
    assert.match(spatial, /当前地点：办公室/);
    assert.match(spatial, /当前场景：办公室/);
    assert.match(spatial, /场景人物：玛雅/);
    assert.match(spatial, /出入口：门/);
    assert.match(spatial, /可互动：办公桌/);
    assert.match(spatial, /当前场景标注：/);
    assert.match(spatial, /办公桌/);
    assert.match(spatial, /门/);
    assert.match(spatial, /玛雅/);
    assert.doesNotMatch(spatial, /氛围：|材质：|cold|metal|玩家|user/);

    const memoryContext = await retrieveXbTavernMemoryContext({
        sessionId: session.id,
        includeMemoryFiles: false,
        includeStructuredStates: true,
    });
    assert.match(memoryContext.spatialState || '', /当前地点：办公室/);
    assert.equal(memoryContext.structuredStates?.some((state) => /地图：家/.test(state.digest || '')), true);
    const build = buildXbTavernMessages({ character: { characterKey: '0', name: 'Aster' } }, createDefaultXbTavernPreset(), {
        currentUserMessage: '看看四周。',
        memoryContext,
    });
    assert.match(build.meta.rawMessagesJson, /空间地图状态/);
    assert.match(build.meta.rawMessagesJson, /当前场景：办公室/);
    assert.match(build.meta.rawMessagesJson, /可互动：办公桌/);
    assert.doesNotMatch(build.meta.rawMessagesJson, /氛围：|材质：/);
    assert.doesNotMatch(build.meta.rawMessagesJson, /状态摘要/);
    assert.doesNotMatch(build.meta.rawMessagesJson, /地图：家/);
});

test('MapPatch creates and updates tavern map documents with semantic ops', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map state' });
    const init = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.map',
        docId: 'main',
        ops: [{
            op: 'init',
            document: {
                meta: { name: 'Rusty Flagon', theme: 'parchment', viewBox: [0, 0, 600, 420] },
                elements: [
                    { id: 'hall', type: 'rect', pos: [50, 50], size: [300, 200], cat: 'wall' },
                ],
            },
        }],
    }, { caller: 'auto' });

    assert.equal(init.ok, true);
    assert.equal(init.changed, true);
    assert.equal(init.revision, 1);

    const update = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.map',
        docId: 'main',
        baseRevision: 1,
        desc: '打开北门并出现标记',
        ops: [
            { op: 'add', element: { id: 'north-door', type: 'arc', center: [180, 50], r: 20, startAngle: 0, endAngle: 90, cat: 'door' } },
            { op: 'modify', id: 'hall', changes: { style: { color: '#553' } } },
            { op: 'meta', changes: { name: 'Rusty Flagon - North Door' } },
        ],
    }, { caller: 'auto' });

    assert.equal(update.ok, true);
    assert.equal(update.changed, true);
    assert.equal(update.appliedCount, 3);
    assert.equal(update.revision, 2);
    assert.deepEqual(update.changedIds?.sort(), ['hall', 'meta', 'north-door'].sort());

    const read = await executeTavernStateTool(session.id, 'MapInspect', {
        docType: 'tavern.map',
        docId: 'main',
        mode: 'summary',
    });
    assert.equal(read.ok, true);
    assert.match(read.digest || '', /Rusty Flagon - North Door/);
    assert.equal(read.meta?.hint, undefined);

    const doors = await executeTavernStateTool(session.id, 'MapInspect', {
        docType: 'tavern.map',
        docId: 'main',
        mode: 'elements',
        category: 'door',
    });
    assert.equal(doors.ok, true);
    assert.equal(doors.count, 1);
    assert.equal(doors.elements?.[0]?.id, 'north-door');

    const remove = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.map',
        docId: 'main',
        baseRevision: 2,
        desc: '北门被移除',
        ops: [
            { op: 'remove', id: 'north-door' },
        ],
    }, { caller: 'auto' });
    assert.equal(remove.ok, true);
    assert.equal(remove.revision, 3);
    assert.equal(remove.removedElements?.[0]?.id, 'north-door');
    assert.equal(Array.isArray(remove.removedElements?.[0]?.curve), true);
    const patches = await listTavernStructuredStatePatches({ sessionId: session.id });
    assert.equal(patches.at(-1)?.changedIds?.includes('north-door'), true);
    const removed = patches.at(-1)?.removedElements as Array<{ id?: string; curve?: unknown[] }> | undefined;
    assert.equal(removed?.[0]?.id, 'north-door');
    assert.equal(Array.isArray(removed?.[0]?.curve), true);
});

test('MapPatch rejects quoted ops, revision conflicts, invalid ids, and keeps atomic state', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map patch discipline' });
    const badArray = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: JSON.stringify([{ op: 'meta', changes: { name: 'bad' } }]),
    });
    assert.equal(badArray.ok, false);
    assert.equal(badArray.error, 'state_patch_ops_must_be_array');

    await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'add', element: { id: 'room', type: 'rect', pos: [0, 0], size: [100, 80], cat: 'wall' } }],
    });
    const conflict = await executeTavernStateTool(session.id, 'MapPatch', {
        baseRevision: 0,
        ops: [{ op: 'meta', changes: { name: 'should not save' } }],
    });
    assert.equal(conflict.ok, false);
    assert.equal(conflict.error, 'state_revision_conflict');

    const invalid = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'add', element: { id: 'bad-type', type: 'polygon', cat: 'wall' } },
            { op: 'add', element: { id: 'valid-later', type: 'circle', center: [1, 2], r: 3, cat: 'marker' } },
        ],
    });
    assert.equal(invalid.ok, false);
    assert.equal(invalid.changed, false);
    const doc = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const elements = (doc?.data as { elements?: Array<{ id?: string }> })?.elements || [];
    assert.equal(elements.some((element) => element.id === 'valid-later'), false);
});

test('MapPatch rejects map elements without drawable geometry', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map geometry discipline' });
    const invalid = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'add', element: { id: 'floating-label', type: 'text', cat: 'label', content: 'Nowhere' } },
            { op: 'add', element: { id: 'empty-line', type: 'line', cat: 'road' } },
            { op: 'add', element: { id: 'valid-room', type: 'rect', pos: [10, 10], size: [80, 50], cat: 'wall' } },
        ],
    });

    assert.equal(invalid.ok, false);
    assert.equal(invalid.changed, false);
    assert.match(JSON.stringify(invalid.details), /map_element_at_required:floating-label/);
    const seed = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    assert.equal(seed?.revision, 0);
    assert.equal((seed?.data as { meta?: { status?: string } })?.meta?.status, 'uninitialized');

    const iconOnly = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'add', element: { id: 'bare-visual-icon', cat: 'marker', at: [80, 40], icon: 'location_on' } },
        ],
    });
    assert.equal(iconOnly.ok, false);
    assert.equal(iconOnly.changed, false);
    assert.match(JSON.stringify(iconOnly.details), /map_element_shape_required:bare-visual-icon/);
    const afterIconOnly = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    assert.equal(afterIconOnly?.revision, 0);

    const fallbackIcon = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'add', element: { id: 'invalid-visual-icon', type: 'icon', cat: 'marker', pos: [80, 40], icon: 'sword_icon' } },
        ],
    });
    assert.equal(fallbackIcon.ok, true);
    assert.equal(fallbackIcon.changed, true);
    assert.match(JSON.stringify(fallbackIcon.warnings), /invalid Material Symbols icon/i);
    let document = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    let elements = (document?.data as { elements?: Array<Record<string, unknown>> })?.elements || [];
    const invalidVisualIcon = elements.find((element) => element.id === 'invalid-visual-icon');
    assert.equal(invalidVisualIcon?.shape, 'icon');
    assert.equal(invalidVisualIcon?.icon, undefined);
    assert.equal(resolveMapElementIconName(invalidVisualIcon?.icon, {
        kind: invalidVisualIcon?.kind,
        cat: invalidVisualIcon?.cat,
        actorKey: invalidVisualIcon?.actorKey,
    }), 'location_on');

    const valid = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'add', element: { id: 'current-position', type: 'icon', cat: 'marker', pos: [60, 35], icon: 'location_on' } },
            { op: 'add', element: { id: 'private-note', type: 'icon', cat: 'marker', pos: [72, 35], icon: 'favorite' } },
            { op: 'add', element: { id: 'room-label', type: 'text', cat: 'label', pos: [60, 65], content: 'Forest clearing' } },
        ],
    });

    assert.equal(valid.ok, true);
    assert.equal(valid.appliedCount, 3);
    document = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    elements = (document?.data as { elements?: Array<Record<string, unknown>> })?.elements || [];
    assert.equal(elements.find((element) => element.id === 'private-note')?.icon, 'favorite');
});

test('MapPatch accepts common map geometry aliases and explains failures', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map alias ergonomics' });
    const result = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'init',
            meta: { name: 'Alias map', viewBox: [0, 0, 400, 300] },
            elements: [
                { id: 'room', type: 'rect', x: 20, y: 30, width: 200, height: 120, cat: 'wall' },
                { id: 'player', type: 'circle', cx: 80, cy: 90, radius: 6, cat: 'marker' },
                { id: 'road', type: 'line', x1: 20, y1: 160, x2: 260, y2: 160, cat: 'road' },
                { id: 'label', type: 'text', x: 90, y: 72, label: 'Clearing', cat: 'label' },
            ],
        }],
    });

    assert.equal(result.ok, true);
    const document = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const elements = (document?.data as { elements?: Array<Record<string, unknown>> })?.elements || [];
    assert.deepEqual(elements.find((element) => element.id === 'room')?.at, [20, 30]);
    assert.deepEqual(elements.find((element) => element.id === 'room')?.rect, [200, 120]);
    assert.deepEqual(elements.find((element) => element.id === 'player')?.at, [80, 90]);
    assert.equal(elements.find((element) => element.id === 'player')?.circle, 6);
    assert.deepEqual(elements.find((element) => element.id === 'road')?.at, [20, 160]);
    assert.deepEqual(elements.find((element) => element.id === 'road')?.path, [[0, 0], [240, 0]]);
    assert.equal(elements.find((element) => element.id === 'label')?.text, 'Clearing');

    const invalid = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'add', element: { id: 'bad-label', type: 'text', cat: 'label', content: 'No position' } }],
    });
    assert.equal(invalid.ok, false);
    assert.match(invalid.summary, /bad-label is missing a position/i);
    assert.match(JSON.stringify(invalid.details), /at:\[x,y\]/);
});

function createStoredMapRecord(
    sessionId: string,
    elements: Array<Record<string, unknown>>,
    revision = 1,
): TavernStructuredStateDocumentRecord {
    const timestamp = Date.now();
    return {
        sessionId,
        docType: 'tavern.map',
        docId: 'main',
        title: 'Stored map',
        revision,
        data: {
            meta: { name: 'Stored map', theme: 'parchment', viewBox: [0, 0, 400, 300], status: 'active' },
            elements,
        },
        digest: '',
        status: 'active',
        source: 'test',
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

test('MapPatch repairs stored map duplicate ids while keeping model input strict', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map duplicate repair' });
    await putTavernStructuredStateDocument(createStoredMapRecord(session.id, [
        { id: 'dup', at: [10, 12], rect: [30, 20], cat: 'wall' },
        { id: 'dup', at: [40, 42], circle: 6, cat: 'marker' },
    ]));

    const document = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'document' });
    assert.equal(document.ok, true);
    const elements = ((document.document as { elements?: Array<Record<string, unknown>> })?.elements || []);
    assert.equal(elements.filter((element) => element.id === 'dup').length, 1);
    assert.deepEqual(elements.find((element) => element.id === 'dup')?.at, [40, 42]);
    assert.equal(elements.find((element) => element.id === 'dup')?.circle, 6);

    const duplicateInput = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'reset',
            document: {
                meta: { name: 'Strict input', viewBox: [0, 0, 400, 300] },
                elements: [
                    { id: 'strict', at: [0, 0], rect: [10, 10], cat: 'wall' },
                    { id: 'strict', at: [20, 20], circle: 5, cat: 'marker' },
                ],
            },
        }],
    });
    assert.equal(duplicateInput.ok, false);
    assert.match(duplicateInput.summary, /strict is duplicated/i);
});

test('MapPatch repairs stored geometry text collisions with derived labels', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map label collision repair' });
    const atlas = await executeTavernStateTool(session.id, 'MapPatch', {
        docType: 'tavern.atlas',
        ops: [
            { op: 'upsert-location', key: 'office', set: { name: '办公室', scale: 'room', status: 'visited', mapDocId: 'main' } },
            { op: 'move-actor', actorKey: 'player', locationKey: 'office' },
        ],
    });
    assert.equal(atlas.ok, true);
    await putTavernStructuredStateDocument(createStoredMapRecord(session.id, [
        { id: '__label__player_actor', at: [1, 1], text: '玛雅', cat: 'label' },
        { id: 'player_actor', at: [80, 90], icon: 'person_pin_circle', kind: 'player', cat: 'actor', actorKey: 'player', text: '玛雅（压制）' },
    ]));

    const spatial = await buildTavernSpatialStateDigest(session.id);
    assert.match(spatial, /玛雅（压制）/);

    const document = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'document' });
    assert.equal(document.ok, true);
    const elements = ((document.document as { elements?: Array<Record<string, unknown>> })?.elements || []);
    const actor = elements.find((element) => element.id === 'player_actor');
    const labels = elements.filter((element) => element.id === '__label__player_actor');
    assert.equal(actor?.text, undefined);
    assert.equal(actor?.icon, 'person_pin_circle');
    assert.equal(labels.length, 1);
    assert.equal(labels[0]?.text, '玛雅（压制）');
});

test('MapPatch repairs stale derived labels when later stored geometry wins', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map stale derived label repair' });
    await putTavernStructuredStateDocument(createStoredMapRecord(session.id, [
        { id: 'dup', at: [10, 12], rect: [30, 20], cat: 'wall', text: 'OLD' },
        { id: 'dup', at: [40, 42], circle: 6, cat: 'marker' },
    ]));

    const document = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'document' });
    assert.equal(document.ok, true);
    const elements = ((document.document as { elements?: Array<Record<string, unknown>> })?.elements || []);
    assert.equal(elements.filter((element) => element.id === 'dup').length, 1);
    assert.equal(elements.some((element) => element.id === '__label__dup'), false);
    assert.equal(elements.find((element) => element.id === 'dup')?.circle, 6);

    await putTavernStructuredStateDocument(createStoredMapRecord(session.id, [
        { id: 'dup', at: [10, 12], rect: [30, 20], cat: 'wall', text: 'OLD' },
        { id: '__label__dup', at: [12, 4], text: 'EXPLICIT', cat: 'label' },
        { id: 'dup', at: [40, 42], circle: 6, cat: 'marker' },
    ], 2));
    const explicitDocument = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'document' });
    assert.equal(explicitDocument.ok, true);
    const explicitElements = ((explicitDocument.document as { elements?: Array<Record<string, unknown>> })?.elements || []);
    assert.equal(explicitElements.find((element) => element.id === '__label__dup')?.text, 'EXPLICIT');
});

test('MapPatch keeps system-derived label ids readable while rejecting reserved ids from model input', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map derived labels' });
    const write = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'add',
            element: { id: 'room', at: [20, 30], rect: [140, 90], cat: 'wall', text: 'South room' },
        }],
    });

    assert.equal(write.ok, true);
    assert.equal(write.appliedCount, 2);
    const summary = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'summary' });
    assert.equal(summary.ok, true);
    const document = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'document' });
    const ids = ((document.document as { elements?: Array<{ id?: string }> })?.elements || []).map((element) => element.id);
    assert.deepEqual(ids.sort(), ['__label__room', 'room']);

    const reserved = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'add',
            element: { id: '__label__intruder', at: [0, 0], text: 'Bad', cat: 'label' },
        }],
    });
    assert.equal(reserved.ok, false);
    assert.match(reserved.summary, /reserved `__label__` prefix/i);
});

test('MapPatch stores map material mood certainty and treats repeated semantic patches as no-op', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map material semantics' });
    const write = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'meta', set: { name: 'Old Hound Inn', viewBox: [0, 0, 400, 300], status: 'active', mood: 'warm' } },
            { op: 'add', element: { id: 'floor', at: [20, 20], rect: [360, 260], cat: 'terrain', material: 'wood' } },
            { op: 'add', element: { id: 'firelight', at: [60, 60], circle: 90, cat: 'light', material: 'warm-light' } },
            { op: 'add', element: { id: 'uncertain-door', at: [190, 270], shape: 'icon', icon: 'door_open', kind: 'door', cat: 'door', certainty: 'inferred' } },
        ],
    });
    assert.equal(write.ok, true);
    assert.equal(write.revision, 1);

    const repeat = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'meta', set: { mood: 'warm' } },
            { op: 'modify', id: 'floor', set: { material: 'wood' } },
            { op: 'modify', id: 'uncertain-door', set: { certainty: 'inferred' } },
        ],
    });
    assert.equal(repeat.ok, true);
    assert.equal(repeat.changed, false);
    assert.equal(repeat.revision, 1);

    const record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const data = record?.data as TavernMapDocument;
    assert.equal(data.meta.mood, 'warm');
    assert.equal(data.elements.find((element) => element.id === 'floor')?.material, 'wood');
    assert.equal(data.elements.find((element) => element.id === 'firelight')?.cat, 'light');
    assert.equal(data.elements.find((element) => element.id === 'uncertain-door')?.certainty, 'inferred');
});

test('MapPatch rejects material styling escape hatches and invalid enum churn', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map material guards' });
    const write = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'add', element: { id: 'rug', at: [40, 40], rect: [80, 50], cat: 'furniture', material: 'carpet', fill: '#ff0000' } },
            { op: 'add', element: { id: 'ghost', at: [120, 80], shape: 'icon', icon: 'person', cat: 'actor', actorKey: 'ghost', material: 'shadow' } },
            { op: 'add', element: { id: 'old-fill', at: [12, 12], rect: [24, 24], cat: 'terrain', fill: '#00ff00' } },
        ],
    });
    assert.equal(write.ok, true);
    assert.equal(write.warnings?.some((warning) => /Dropped legacy fill.*rug/i.test(warning)), true);
    assert.equal(write.warnings?.some((warning) => /Ignored material:"shadow" for actor ghost/i.test(warning)), true);

    const record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const elements = (record?.data as TavernMapDocument).elements;
    assert.equal(elements.find((element) => element.id === 'rug')?.material, 'carpet');
    assert.equal(elements.find((element) => element.id === 'rug')?.fill, undefined);
    assert.equal(elements.find((element) => element.id === 'ghost')?.material, undefined);

    const legacyFill = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'modify', id: 'old-fill', set: { material: 'wood' } }],
    });
    assert.equal(legacyFill.ok, true);
    assert.equal(legacyFill.warnings?.some((warning) => /Dropped legacy fill.*old-fill/i.test(warning)), true);
    const afterLegacyFill = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const oldFill = (afterLegacyFill?.data as TavernMapDocument).elements.find((element) => element.id === 'old-fill');
    assert.equal(oldFill?.material, 'wood');
    assert.equal(oldFill?.fill, undefined);
    const legacyFillPatches = await listTavernStructuredStatePatches({ sessionId: session.id });
    const legacyFillReplay = applyTrustedMapPatchOps(
        createSeedMapDocument(),
        legacyFillPatches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>),
    );
    const replayedOldFill = legacyFillReplay.elements.find((element) => element.id === 'old-fill');
    assert.equal(replayedOldFill?.material, 'wood');
    assert.equal(replayedOldFill?.fill, undefined);
    const legacyFillModify = legacyFillPatches.at(-1)?.ops as Array<{ op?: string; id?: string; set?: Record<string, unknown> }> | undefined;
    assert.deepEqual(legacyFillModify?.find((op) => op.op === 'modify' && op.id === 'old-fill')?.set, { fill: null, material: 'wood' });

    const invalid = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'meta', set: { mood: 'cozy' } },
            { op: 'modify', id: 'rug', set: { material: 'oak wood', certainty: 'maybe' } },
        ],
    });
    assert.equal(invalid.ok, true);
    assert.equal(invalid.changed, false);
    assert.equal(invalid.revision, 2);
    assert.equal(invalid.warnings?.some((warning) => /invalid map mood: cozy/i.test(warning)), true);
    assert.equal(invalid.warnings?.some((warning) => /invalid map material.*oak wood/i.test(warning)), true);
    assert.equal(invalid.warnings?.some((warning) => /invalid map certainty.*maybe/i.test(warning)), true);
});

test('MapPatch replay preserves canonical field deletions', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map replay canonical deletions' });
    const write = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'add', element: { id: 'door', at: [20, 20], shape: 'icon', icon: 'door_open', kind: 'door', cat: 'door', certainty: 'inferred' } },
            { op: 'add', element: { id: 'floor', at: [0, 0], rect: [80, 60], cat: 'terrain', material: 'wood' } },
        ],
    });
    assert.equal(write.ok, true);

    const clear = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'modify', id: 'door', set: { certainty: 'confirmed' } },
            { op: 'modify', id: 'floor', set: { material: null } },
        ],
    });
    assert.equal(clear.ok, true);

    const record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const stored = record?.data as TavernMapDocument;
    const patches = await listTavernStructuredStatePatches({ sessionId: session.id });
    const replayed = applyTrustedMapPatchOps(
        createSeedMapDocument(),
        patches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>),
    );
    const effectiveClearOps = patches.at(-1)?.ops as Array<{ op?: string; id?: string; set?: Record<string, unknown> }> | undefined;

    assert.equal(stored.elements.find((element) => element.id === 'door')?.certainty, undefined);
    assert.equal(stored.elements.find((element) => element.id === 'floor')?.material, undefined);
    assert.equal(replayed.elements.find((element) => element.id === 'door')?.certainty, undefined);
    assert.equal(replayed.elements.find((element) => element.id === 'floor')?.material, undefined);
    assert.deepEqual(effectiveClearOps?.find((op) => op.op === 'modify' && op.id === 'door')?.set, { certainty: null });
    assert.deepEqual(effectiveClearOps?.find((op) => op.op === 'modify' && op.id === 'floor')?.set, { material: null });
});

test('MapPatch label lifecycle skips terrain and light and clears stale derived labels', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map label lifecycle v1.1' });
    const add = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'add', element: { id: 'floor', at: [0, 0], rect: [100, 80], cat: 'terrain', material: 'wood', text: 'Wood floor' } },
            { op: 'add', element: { id: 'firelight', at: [20, 20], circle: 40, cat: 'light', material: 'warm-light', text: 'Firelight' } },
            { op: 'add', element: { id: 'rug', at: [20, 30], rect: [30, 20], cat: 'furniture', material: 'carpet', text: 'Rug' } },
        ],
    });
    assert.equal(add.ok, true);
    assert.equal(add.warnings?.some((warning) => /floor.*does not derive map labels/i.test(warning)), true);
    assert.equal(add.warnings?.some((warning) => /firelight.*does not derive map labels/i.test(warning)), true);

    let record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    let elements = (record?.data as TavernMapDocument).elements;
    assert.equal(elements.some((element) => element.id === '__label__floor'), false);
    assert.equal(elements.some((element) => element.id === '__label__firelight'), false);
    assert.equal(elements.find((element) => element.id === '__label__rug')?.text, 'Rug');

    const retint = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'modify', id: 'rug', set: { material: 'wood' } }],
    });
    assert.equal(retint.ok, true);
    record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    elements = (record?.data as TavernMapDocument).elements;
    assert.equal(elements.find((element) => element.id === 'rug')?.material, 'wood');
    assert.equal(elements.find((element) => element.id === '__label__rug')?.text, 'Rug');

    const clear = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'modify', id: 'rug', set: { text: null } }],
    });
    assert.equal(clear.ok, true);
    assert.equal(clear.changedIds?.includes('__label__rug'), true);

    record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    elements = (record?.data as TavernMapDocument).elements;
    assert.equal(elements.some((element) => element.id === '__label__rug'), false);
    assert.equal(elements.find((element) => element.id === 'rug')?.text, undefined);
});

test('MapPatch canonicalizes modify text on geometry into a derived label upsert', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map modify label upsert' });
    const add = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'add',
            element: { id: 'player_actor', at: [80, 90], shape: 'icon', icon: 'person_pin_circle', kind: 'player', cat: 'actor', actorKey: 'player' },
        }],
    });
    assert.equal(add.ok, true);

    const label = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'modify',
            id: 'player_actor',
            set: { text: '玛雅（压制）' },
        }],
    });
    assert.equal(label.ok, true);
    assert.equal(label.changed, true);
    assert.equal(label.changedIds?.includes('__label__player_actor'), true);

    const record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const storedElements = ((record?.data as { elements?: Array<Record<string, unknown>> })?.elements || []);
    const actor = storedElements.find((element) => element.id === 'player_actor');
    const labelElement = storedElements.find((element) => element.id === '__label__player_actor');
    assert.equal(actor?.text, undefined);
    assert.equal(actor?.icon, 'person_pin_circle');
    assert.equal(actor?.actorKey, 'player');
    assert.equal(labelElement?.text, '玛雅（压制）');

    const document = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'document' });
    assert.equal(document.ok, true);
    const ids = ((document.document as { elements?: Array<Record<string, unknown>> })?.elements || []).map((element) => element.id);
    assert.equal(ids.filter((id) => id === 'player_actor').length, 1);
    assert.equal(ids.filter((id) => id === '__label__player_actor').length, 1);
});

test('MapPatch canonicalizes modify shape plus text after candidate merge', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map modify candidate split' });
    const add = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'add',
            element: { id: 'note', at: [12, 14], text: '旧标注', cat: 'label' },
        }],
    });
    assert.equal(add.ok, true);

    const modify = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'modify',
            id: 'note',
            set: { rect: [90, 40], text: '储物间', cat: 'wall' },
        }],
    });
    assert.equal(modify.ok, true);

    const record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const storedElements = ((record?.data as { elements?: Array<Record<string, unknown>> })?.elements || []);
    const geometry = storedElements.find((element) => element.id === 'note');
    const label = storedElements.find((element) => element.id === '__label__note');
    assert.deepEqual(geometry?.rect, [90, 40]);
    assert.equal(geometry?.text, undefined);
    assert.equal(label?.cat, 'label');
    assert.equal(label?.text, '储物间');
});

test('MapPatch modify visual icon does not replace non-icon geometry', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map visual icon boundary' });
    const add = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'add', element: { id: 'room', at: [20, 20], rect: [100, 100], cat: 'wall' } },
            { op: 'add', element: { id: 'exit', at: [140, 20], shape: 'icon', icon: 'door_open', kind: 'door', cat: 'door' } },
        ],
    });
    assert.equal(add.ok, true);

    const clear = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'modify', id: 'room', set: { icon: null } }],
    });
    const invalid = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'modify', id: 'room', set: { icon: 'sword_icon' } },
            { op: 'modify', id: 'exit', set: { icon: 'sword_icon' } },
        ],
    });
    const convert = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'modify', id: 'room', set: { shape: 'icon', kind: 'portal' } }],
    });
    const record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const elements = ((record?.data as { elements?: Array<Record<string, unknown>> })?.elements || []);
    const room = elements.find((element) => element.id === 'room');
    const exit = elements.find((element) => element.id === 'exit');

    assert.equal(clear.ok, true);
    assert.equal(clear.changed, false);
    assert.equal(invalid.ok, true);
    assert.equal(invalid.changed, false);
    assert.match((invalid.warnings || []).join('\n'), /invalid Material Symbols icon/i);
    assert.equal(exit?.shape, 'icon');
    assert.equal(exit?.icon, 'door_open');
    assert.equal(convert.ok, true);
    assert.equal(room?.shape, 'icon');
    assert.equal(room?.rect, undefined);
    assert.equal(room?.icon, undefined);
    assert.equal(resolveMapElementIconName(room?.icon, { kind: room?.kind, cat: room?.cat }), 'captive_portal');
});

test('MapPatch label upsert patch replays over bad derived labels canonically', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map bad label replay' });
    const badDocument = createStoredMapRecord(session.id, [
        { id: 'player_actor', at: [80, 90], icon: 'person_pin_circle', kind: 'player', cat: 'actor', actorKey: 'player' },
        { id: '__label__player_actor', at: [98, 72], rect: [30, 12], cat: 'marker', actorKey: 'bad-label-actor' },
    ]);
    await putTavernStructuredStateDocument(badDocument);

    const modify = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'modify',
            id: 'player_actor',
            set: { text: '玛雅（压制）' },
        }],
    });
    assert.equal(modify.ok, true);

    const record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const storedLabel = ((record?.data as { elements?: Array<Record<string, unknown>> })?.elements || [])
        .find((element) => element.id === '__label__player_actor');
    assert.equal(storedLabel?.cat, 'label');
    assert.equal(storedLabel?.text, '玛雅（压制）');
    assert.equal(storedLabel?.rect, undefined);
    assert.equal(storedLabel?.actorKey, undefined);

    const patches = await listTavernStructuredStatePatches({ sessionId: session.id });
    const replayed = applyTrustedMapPatchOps(badDocument.data as TavernMapDocument, patches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>));
    const replayedLabel = replayed.elements.find((element) => element.id === '__label__player_actor');
    assert.equal(replayedLabel?.cat, 'label');
    assert.equal(replayedLabel?.text, '玛雅（压制）');
    assert.equal(replayedLabel?.rect, undefined);
    assert.equal(replayedLabel?.actorKey, undefined);
});

test('MapPatch keeps direct derived label modify canonical even with geometry input', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map direct label modify' });
    const add = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'add',
            element: { id: 'player_actor', at: [80, 90], shape: 'icon', icon: 'person_pin_circle', kind: 'player', cat: 'actor', actorKey: 'player', text: '玛雅' },
        }],
    });
    assert.equal(add.ok, true);

    const modify = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'modify',
            id: '__label__player_actor',
            set: { rect: [50, 20], cat: 'marker', text: '玛雅（压制）', at: [110, 70] },
        }],
    });
    assert.equal(modify.ok, true);

    const record = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const storedElements = ((record?.data as { elements?: Array<Record<string, unknown>> })?.elements || []);
    const label = storedElements.find((element) => element.id === '__label__player_actor');
    assert.equal(label?.cat, 'label');
    assert.equal(label?.text, '玛雅（压制）');
    assert.deepEqual(label?.at, [110, 70]);
    assert.equal(label?.rect, undefined);
    assert.equal(storedElements.some((element) => element.id === '__label____label__player_actor'), false);

    const patches = await listTavernStructuredStatePatches({ sessionId: session.id });
    const replayed = applyTrustedMapPatchOps(createSeedMapDocument(), patches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>));
    const replayedLabel = replayed.elements.find((element) => element.id === '__label__player_actor');
    assert.equal(replayedLabel?.cat, 'label');
    assert.equal(replayedLabel?.text, '玛雅（压制）');
    assert.equal(replayedLabel?.rect, undefined);
    assert.equal(replayed.elements.some((element) => element.id === '__label____label__player_actor'), false);
});

test('MapPatch direct derived label style changes replay canonically', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map label style replay' });
    const add = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'add',
            element: { id: 'player_actor', at: [80, 90], shape: 'icon', icon: 'person_pin_circle', kind: 'player', cat: 'actor', actorKey: 'player', text: '玛雅' },
        }],
    });
    assert.equal(add.ok, true);

    const styled = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'modify',
            id: '__label__player_actor',
            set: { style: { color: '#f00' }, text: '玛雅' },
        }],
    });
    assert.equal(styled.ok, true);
    const styleRecord = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const stylePatches = await listTavernStructuredStatePatches({ sessionId: session.id });
    const styleReplay = applyTrustedMapPatchOps(createSeedMapDocument(), stylePatches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>));
    const storedStyledLabel = ((styleRecord?.data as { elements?: Array<Record<string, unknown>> })?.elements || [])
        .find((element) => element.id === '__label__player_actor');
    const replayedStyledLabel = styleReplay.elements.find((element) => element.id === '__label__player_actor');
    assert.deepEqual(storedStyledLabel?.style, { color: '#f00' });
    assert.deepEqual(replayedStyledLabel?.style, { color: '#f00' });

    const moved = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'modify',
            id: '__label__player_actor',
            set: { at: [116, 74] },
        }],
    });
    assert.equal(moved.ok, true);
    assert.equal(moved.changed, true);
    const movedRecord = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const movedLabel = ((movedRecord?.data as { elements?: Array<Record<string, unknown>> })?.elements || [])
        .find((element) => element.id === '__label__player_actor');
    assert.deepEqual(movedLabel?.at, [116, 74]);

    const cleared = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'modify',
            id: '__label__player_actor',
            set: { style: null, text: '玛雅' },
        }],
    });
    assert.equal(cleared.ok, true);
    const clearedRecord = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const clearedPatches = await listTavernStructuredStatePatches({ sessionId: session.id });
    const clearedReplay = applyTrustedMapPatchOps(createSeedMapDocument(), clearedPatches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>));
    const storedClearedLabel = ((clearedRecord?.data as { elements?: Array<Record<string, unknown>> })?.elements || [])
        .find((element) => element.id === '__label__player_actor');
    const replayedClearedLabel = clearedReplay.elements.find((element) => element.id === '__label__player_actor');
    assert.equal(storedClearedLabel?.style, undefined);
    assert.equal(replayedClearedLabel?.style, undefined);
});

test('MapPatch infers path anchors without at and keeps at optional in the public schema', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map inferred anchors' });
    const result = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'add',
            element: { id: 'road', path: [[20, 160], [260, 160]], cat: 'road' },
        }],
    });

    assert.equal(result.ok, true);
    const document = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const road = ((document?.data as { elements?: Array<Record<string, unknown>> })?.elements || []).find((element) => element.id === 'road');
    assert.deepEqual(road?.at, [20, 160]);
    assert.deepEqual(road?.path, [[0, 0], [240, 0]]);

    const mapPatch = getTavernStateToolDefinitions().find((tool) => tool.function.name === 'MapPatch');
    type SchemaNode = {
        enum?: string[];
        properties?: Record<string, SchemaNode>;
        items?: SchemaNode;
        anyOf?: SchemaNode[];
        required?: string[];
    };
    const parameters = mapPatch?.function.parameters as { properties?: Record<string, SchemaNode> };
    const addSchema = parameters.properties?.ops?.items?.anyOf?.find((candidate) => candidate.properties?.op?.enum?.includes('add'));
    const required = addSchema?.properties?.element?.required || [];
    assert.equal(required.includes('at'), false);
});

test('MapPatch ignores model soft remove flags and still reports missing targets', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map remove discipline' });
    const result = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'remove', id: 'missing', soft: true }],
    });

    assert.equal(result.ok, false);
    assert.equal(result.error, 'state_patch_failed');
    assert.match(result.summary, /missing does not exist/i);
});

test('MapPatch keeps weak maps uninitialized until they have spatial content', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map activation gate' });
    const weak = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [
            { op: 'meta', set: { name: 'Only label', viewBox: [0, 0, 400, 300], status: 'active' } },
            { op: 'add', element: { id: 'label', at: [200, 120], text: 'Only label', cat: 'label' } },
        ],
    });

    assert.equal(weak.ok, true);
    assert.match((weak.warnings || []).join('\n'), /at least one spatial geometry element/i);
    const weakRead = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'summary' });
    assert.equal(weakRead.meta?.status, 'uninitialized');

    const strong = await executeTavernStateTool(session.id, 'MapPatch', {
        baseRevision: weakRead.revision,
        ops: [
            { op: 'add', element: { id: 'ground', at: [200, 160], circle: 80, cat: 'terrain' } },
        ],
    });

    assert.equal(strong.ok, true);
    const strongRead = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'summary' });
    assert.equal(strongRead.meta?.status, 'active');
});

test('MapPatch accepts large initial map patches without the old low op ceiling', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Large map init' });
    const ops = Array.from({ length: 120 }, (_, index) => ({
        op: 'add',
        element: {
            id: `tile-${index + 1}`,
            type: 'rect',
            pos: [(index % 20) * 12, Math.floor(index / 20) * 12],
            size: [8, 8],
            cat: 'terrain',
        },
    }));

    const result = await executeTavernStateTool(session.id, 'MapPatch', { ops });

    assert.equal(result.ok, true);
    assert.equal(result.appliedCount, 120);
    const doc = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    assert.equal(((doc?.data as { elements?: unknown[] })?.elements || []).length, 120);
});

test('MapPatch dryRun keeps revision stable and legacy reset/init inputs are still absorbed atomically', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map dry-run reset' });
    await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'add', element: { id: 'old-room', type: 'rect', pos: [0, 0], size: [90, 70], cat: 'wall' } }],
    });

    const unsafeInit = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'init',
            document: {
                meta: { name: 'New Map' },
                elements: [{ id: 'new-room', type: 'rect', pos: [10, 10], size: [40, 40], cat: 'wall' }],
            },
        }],
    });
    assert.equal(unsafeInit.ok, false);
    assert.equal(unsafeInit.error, 'state_patch_failed');

    const dryRun = await executeTavernStateTool(session.id, 'MapPatch', {
        baseRevision: 1,
        dryRun: true,
        ops: [{ op: 'modify', id: 'old-room', changes: { cat: 'secret' } }],
    });
    assert.equal(dryRun.ok, true);
    assert.equal(dryRun.changed, true);
    assert.equal((await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main'))?.revision, 1);
    assert.equal((await listTavernStructuredStatePatches({ sessionId: session.id })).length, 1);

    const reset = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'reset',
            document: {
                meta: { name: 'New Map' },
                elements: [{ id: 'new-room', type: 'rect', pos: [10, 10], size: [40, 40], cat: 'wall' }],
            },
        }],
    });
    assert.equal(reset.ok, true);
    assert.equal(reset.revision, 2);
    const doc = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const ids = ((doc?.data as { elements?: Array<{ id?: string }> })?.elements || []).map((element) => element.id);
    assert.deepEqual(ids, ['new-room']);
});

test('MapPatch manager map writes are not rolled back by message rollback', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map survives rollback' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '进北屋。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '北屋里有一口井。' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'after_turn',
        status: 'running',
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
    });

    await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'add', element: { id: 'north-room', type: 'rect', pos: [10, 10], size: [80, 60], cat: 'wall' } }],
    }, {
        caller: 'auto',
        managerRunId: run.id,
        sourceUserOrder: userMessage.order,
        sourceAssistantOrder: assistantMessage.order,
    });

    const rollback = await rollbackManagerStateRunsForMessageRange(session.id, userMessage.order);
    assert.deepEqual(rollback, { runIds: [], rolledBack: 0, conflicts: [], skipped: 0 });
    const map = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const elements = (map?.data as { elements?: Array<{ id?: string }> })?.elements || [];
    assert.equal(elements.some((element) => element.id === 'north-room'), true);
    assert.equal((await listTavernStructuredStatePatches({ sessionId: session.id })).length, 1);
    assert.equal((await listTavernStructuredStatePatches({ sessionId: session.id, includeRolledBack: true }))[0]?.status, 'active');
});

test('MapPatch serializes concurrent map writes without losing elements', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map concurrency' });
    const [left, right] = await Promise.all([
        executeTavernStateTool(session.id, 'MapPatch', {
            ops: [{ op: 'add', element: { id: 'left-room', type: 'rect', pos: [0, 0], size: [60, 40], cat: 'wall' } }],
        }, { caller: 'auto' }),
        executeTavernStateTool(session.id, 'MapPatch', {
            ops: [{ op: 'add', element: { id: 'right-room', type: 'rect', pos: [80, 0], size: [60, 40], cat: 'wall' } }],
        }, { caller: 'chat' }),
    ]);

    assert.equal(left.ok, true);
    assert.equal(right.ok, true);
    const doc = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const elements = (doc?.data as { elements?: Array<{ id?: string }> })?.elements || [];
    assert.equal(doc?.revision, 2);
    assert.equal(elements.some((element) => element.id === 'left-room'), true);
    assert.equal(elements.some((element) => element.id === 'right-room'), true);
    assert.deepEqual((await listTavernStructuredStatePatches({ sessionId: session.id })).map((patch) => patch.revision), [1, 2]);
});

test('MapPatch supports explicit active map switching without replacing other maps', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Multi map active' });
    const office = await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'office',
        activate: true,
        ops: [
            { op: 'meta', set: { name: '办公室' } },
            { op: 'add', element: { id: 'desk', at: [40, 40], rect: [30, 16], cat: 'furniture', text: '工位' } },
        ],
    });
    assert.equal(office.ok, true);

    const home = await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'home',
        ops: [
            { op: 'meta', set: { name: '家' } },
            { op: 'add', element: { id: 'door', at: [10, 20], rect: [10, 30], cat: 'door', text: '门' } },
        ],
    });
    assert.equal(home.ok, true);

    let state = await getTavernMapStateForSession(session.id);
    assert.equal(state.activeDocId, 'office');
    assert.equal(state.activeDocument?.docId, 'office');
    assert.deepEqual(state.documents.map((document) => [document.docId, document.active]), [
        ['office', true],
        ['home', false],
    ]);
    assert.equal((await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main'))?.revision, 0);

    const listed = await executeTavernStateTool(session.id, 'MapDocs', { docType: 'tavern.map' });
    assert.equal(listed.ok, true);
    assert.deepEqual((listed.documents || []).map((document) => [document.docId, document.active]), [
        ['office', true],
        ['home', false],
        ['main', false],
    ]);

    const activateHome = await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'home',
        activate: true,
        ops: [],
    });
    assert.equal(activateHome.ok, true);

    state = await getTavernMapStateForSession(session.id);
    assert.equal(state.activeDocId, 'home');
    assert.equal(state.activeDocument?.docId, 'home');
    assert.deepEqual(state.activePatches.map((patch) => patch.docId), ['home']);

    const activeSummary = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'summary' });
    assert.equal(activeSummary.ok, true);
    assert.equal(activeSummary.docId, 'home');

    const activePatch = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'add', element: { id: 'sofa', at: [70, 30], rect: [24, 12], cat: 'furniture', text: '沙发' } }],
    });
    assert.equal(activePatch.ok, true);
    assert.equal(activePatch.docId, 'home');
    assert.deepEqual((await listTavernStructuredStatePatches({ sessionId: session.id, docId: 'home' })).map((patch) => patch.revision), [1, 2]);

    const activateOfficeWithNoopPatch = await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'office',
        activate: true,
        ops: [{ op: 'meta', set: { name: '办公室' } }],
    });
    assert.equal(activateOfficeWithNoopPatch.ok, true);
    assert.equal(activateOfficeWithNoopPatch.changed, true);
    state = await getTavernMapStateForSession(session.id);
    assert.equal(state.activeDocId, 'office');
    assert.equal(state.activeDocument?.docId, 'office');
    assert.deepEqual((await listTavernStructuredStatePatches({ sessionId: session.id, docId: 'office' })).map((patch) => patch.revision), [1]);
});

test('map state hides the uninitialized seed map when real scene maps exist', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Seed map hidden' });
    const apartment = await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'apartment',
        ops: [
            { op: 'meta', set: { name: '公寓' } },
            { op: 'add', element: { id: 'room', at: [40, 40], rect: [180, 120], cat: 'room', text: '一楼公寓' } },
        ],
    });
    assert.equal(apartment.ok, true);

    const state = await getTavernMapStateForSession(session.id);
    assert.equal(state.activeDocId, 'apartment');
    assert.equal(state.activeDocument?.docId, 'apartment');
    assert.deepEqual(state.documents.map((document) => [document.docId, document.title, document.active]), [
        ['apartment', '公寓', true],
    ]);
    assert.equal((await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main'))?.revision, 0);

    const activeSummary = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'summary' });
    assert.equal(activeSummary.ok, true);
    assert.equal(activeSummary.docId, 'apartment');

    const listed = await executeTavernStateTool(session.id, 'MapDocs', { docType: 'tavern.map' });
    assert.equal(listed.ok, true);
    assert.deepEqual((listed.documents || []).map((document) => [document.docId, document.active]), [
        ['apartment', true],
        ['main', false],
    ]);
});

test('map active resolution falls back to main consistently across workspace, tools, and digests', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map fallback' });
    const mainPatch = await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'main',
        ops: [
            { op: 'meta', set: { name: '主地图', status: 'active' } },
            { op: 'add', element: { id: 'plaza', at: [30, 30], rect: [40, 40], cat: 'terrain', text: '广场' } },
        ],
    });
    assert.equal(mainPatch.ok, true);

    await updateTavernSessionState(session.id, { activeMapDocId: 'missing-map' });

    const state = await getTavernMapStateForSession(session.id);
    assert.equal(state.activeDocId, 'main');
    assert.equal(state.activeDocument?.docId, 'main');
    assert.deepEqual(state.documents.map((document) => [document.docId, document.active]), [
        ['main', true],
    ]);

    const listed = await executeTavernStateTool(session.id, 'MapDocs', { docType: 'tavern.map' });
    assert.equal(listed.ok, true);
    assert.equal(listed.docId, 'main');
    assert.deepEqual((listed.documents || []).map((document) => [document.docId, document.active]), [
        ['main', true],
    ]);

    const activeSummary = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'summary' });
    assert.equal(activeSummary.ok, true);
    assert.equal(activeSummary.docId, 'main');

    const digests = await listTavernStructuredStateDigests(session.id);
    assert.deepEqual(digests.map((digest) => digest.docId), ['main']);
    assert.match(digests[0]?.digest || '', /主地图|广场/);
});

test('MapPatch activate-only calls may omit ops', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Activate without ops' });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'office',
        ops: [
            { op: 'meta', set: { name: 'Office', viewBox: [0, 0, 320, 220], status: 'active' } },
            { op: 'add', element: { id: 'office-floor', at: [20, 20], rect: [220, 150], cat: 'terrain' } },
        ],
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'main',
        ops: [
            { op: 'meta', set: { name: 'Main', viewBox: [0, 0, 320, 220], status: 'active' } },
            { op: 'add', element: { id: 'main-floor', at: [20, 20], rect: [220, 150], cat: 'terrain' } },
        ],
    });

    const activate = await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'office',
        activate: true,
    });
    const summary = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'summary' });

    assert.equal(activate.ok, true);
    assert.match(activate.summary, /Activated tavern\.map\/office/);
    assert.equal(summary.docId, 'office');
});

test('MapPatch ignores empty path and curve pollution when a real shape is present', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map empty shape repair' });
    const result = await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'main',
        activate: true,
        ops: [{
            op: 'add',
            element: {
                id: 'outer-wall',
                cat: 'wall',
                at: [20, 20],
                rect: [260, 180],
                path: [],
                curve: [],
                text: '房间',
            },
        }],
    });
    const document = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'document' });
    const element = (document.document as TavernMapDocument).elements.find((item) => item.id === 'outer-wall');
    const patches = await listTavernStructuredStatePatches({ sessionId: session.id });
    const add = (patches[0]?.ops as Array<{ op?: string; element?: Record<string, unknown> }> | undefined)
        ?.find((op) => op.op === 'add' && op.element?.id === 'outer-wall');

    assert.equal(result.ok, true);
    assert.match((result.warnings || []).join('\n'), /Ignored empty shape field\(s\).*path/i);
    assert.match((result.warnings || []).join('\n'), /Ignored empty shape field\(s\).*curve/i);
    assert.deepEqual(element?.rect, [260, 180]);
    assert.equal(Array.isArray(element?.path), false);
    assert.equal(Array.isArray(element?.curve), false);
    assert.equal(Array.isArray(add?.element?.path), false);
    assert.equal(Array.isArray(add?.element?.curve), false);
});

test('MapPatch rejects empty path-only elements with actionable guidance', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map empty path failure' });
    const result = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'add',
            element: {
                id: 'bad-line',
                cat: 'road',
                path: [],
            },
        }],
    });

    assert.equal(result.ok, false);
    assert.equal(result.error, 'state_patch_failed');
    assert.equal(result.failed?.[0]?.error, 'map_element_points_required:bad-line');
    assert.match(result.failed?.[0]?.hint || '', /omit empty path\/curve fields/i);
    assert.match(result.failed?.[0]?.hint || '', /rect\/circle\/icon\/text/i);
});

test('MapPatch modify ignores empty path pollution when replacing shape', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Map modify empty path repair' });
    await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'add',
            element: { id: 'table', cat: 'furniture', at: [40, 40], rect: [80, 30] },
        }],
    });
    const result = await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'modify',
            id: 'table',
            set: {
                rect: [90, 36],
                path: [],
                curve: [],
            },
        }],
    });
    const document = await executeTavernStateTool(session.id, 'MapInspect', { mode: 'document' });
    const element = (document.document as TavernMapDocument).elements.find((item) => item.id === 'table');
    const patches = await listTavernStructuredStatePatches({ sessionId: session.id });
    const modify = (patches.at(-1)?.ops as Array<{ op?: string; id?: string; set?: Record<string, unknown> }> | undefined)
        ?.find((op) => op.op === 'modify' && op.id === 'table');

    assert.equal(result.ok, true);
    assert.match((result.warnings || []).join('\n'), /Ignored empty shape field\(s\).*path/i);
    assert.match((result.warnings || []).join('\n'), /Ignored empty shape field\(s\).*curve/i);
    assert.deepEqual(element?.rect, [90, 36]);
    assert.equal(Array.isArray(element?.path), false);
    assert.equal(Array.isArray(element?.curve), false);
    assert.equal(Array.isArray(modify?.set?.path), false);
    assert.equal(Array.isArray(modify?.set?.curve), false);
});

test('MapSceneEdit creates a named scene file and links world actor location', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit create' });
    const result = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '酒馆大厅',
        playerHere: true,
        viewBox: [0, 0, 360, 240],
        elements: [
            { id: 'outer-wall', cat: 'wall', shape: 'rect', geo: { at: [20, 20], size: [300, 180] }, label: '大厅' },
            { id: 'player', cat: 'actor', actorKey: 'player', shape: 'circle', geo: { at: [160, 120], radius: 8 }, label: '玩家' },
        ],
    });
    const world = await executeTavernStateTool(session.id, 'MapAtlasRead', { mode: 'document' });
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '酒馆大厅', mode: 'document' });
    const atlas = world.document as TavernAtlasDocument;
    const location = atlas.locations.find((item) => item.name === '酒馆大厅');

    assert.equal(result.ok, true);
    assert.equal(result.file, '酒馆大厅');
    assert.equal(result.skipped?.length, 0);
    assert.equal(location?.mapDocId, result.docId);
    assert.equal(atlas.actors.find((actor) => actor.actorKey === 'player')?.locationKey, location?.key);
    assert.equal(scene.ok, true);
    assert.equal((scene.document as TavernMapDocument).elements.some((element) => element.id === 'outer-wall'), true);
    assert.equal((scene.document as TavernMapDocument).elements.some((element) => element.id === '__label__outer-wall'), true);
});

test('MapSceneEdit edits the same named scene without relying on active map', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit repeat' });
    const first = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '地下走廊',
        elements: [
            { id: 'corridor', cat: 'road', shape: 'path', geo: { points: [[0, 50], [220, 50]] }, label: '走廊' },
        ],
    });
    const second = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '地下走廊',
        elements: [
            { id: 'corridor', cat: 'road', shape: 'path', geo: { points: [[0, 50], [260, 50]] }, label: '地下走廊' },
            { id: 'door-east', cat: 'door', kind: 'door', shape: 'icon', geo: { at: [260, 50] }, label: '东门' },
        ],
    });
    const secondScene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '地下走廊', mode: 'document' });
    const secondDocument = secondScene.document as TavernMapDocument;
    const doorBeforeKindChange = secondDocument.elements.find((element) => element.id === 'door-east');
    const third = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '地下走廊',
        elements: [
            { id: 'door-east', cat: 'door', kind: 'portal', shape: 'icon', geo: { at: [260, 50] }, label: '传送门' },
        ],
    });
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '地下走廊', mode: 'document' });
    const document = scene.document as TavernMapDocument;
    const doorAfterKindChange = document.elements.find((element) => element.id === 'door-east');

    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.equal(third.ok, true);
    assert.equal(first.docId, second.docId);
    assert.equal(second.docId, third.docId);
    assert.deepEqual(document.elements.find((element) => element.id === 'corridor')?.path, [[0, 0], [260, 0]]);
    assert.equal(doorBeforeKindChange?.shape, 'icon');
    assert.equal(doorBeforeKindChange?.icon, undefined);
    assert.equal(resolveMapElementIconName(doorBeforeKindChange?.icon, {
        kind: doorBeforeKindChange?.kind,
        cat: doorBeforeKindChange?.cat,
        actorKey: doorBeforeKindChange?.actorKey,
    }), 'door_open');
    assert.equal(doorAfterKindChange?.shape, 'icon');
    assert.equal(doorAfterKindChange?.icon, undefined);
    assert.equal(doorAfterKindChange?.kind, 'portal');
    assert.equal(resolveMapElementIconName(doorAfterKindChange?.icon, {
        kind: doorAfterKindChange?.kind,
        cat: doorAfterKindChange?.cat,
        actorKey: doorAfterKindChange?.actorKey,
    }), 'captive_portal');
});

test('MapSceneEdit skips one bad element while saving clean canonical ops for the rest', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit partial' });
    const result = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '测试房间',
        elements: [
            { id: 'room', cat: 'wall', shape: 'rect', geo: { at: [10, 10], size: [200, 120] }, label: '房间' },
            { id: 'bad-line', cat: 'road', shape: 'path', geo: { points: [] }, label: '坏线' },
            { id: 'lamp', cat: 'light', shape: 'circle', geo: { at: [80, 60], radius: 30 }, material: 'warm-light' },
        ],
    });
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '测试房间', mode: 'document' });
    const document = scene.document as TavernMapDocument;
    const patches = await listTavernStructuredStatePatches({ sessionId: session.id, docType: 'tavern.map', docId: result.docId });
    const savedOps = patches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>);

    assert.equal(result.ok, true);
    assert.equal(result.applied?.length, 2);
    assert.equal(result.skipped?.length, 1);
    assert.match(String(result.skipped?.[0]?.hint || ''), /point array|shape\/geo/i);
    assert.equal(document.elements.some((element) => element.id === 'room'), true);
    assert.equal(document.elements.some((element) => element.id === 'lamp'), true);
    assert.equal(document.elements.some((element) => element.id === 'bad-line'), false);
    assert.equal(JSON.stringify(savedOps).includes('"path":[]'), false);
    assert.equal(JSON.stringify(savedOps).includes('"curve":[]'), false);
});

test('MapSceneEdit infers shape from geo without exposing multiple shape fields', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit infer' });
    const result = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '推断房间',
        elements: [
            { id: 'room', cat: 'wall', geo: { at: [5, 5], size: [180, 90] }, label: '推断房间' },
            { id: 'line', cat: 'road', geo: { points: [[10, 70], [120, 70]] } },
        ],
    });
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '推断房间', mode: 'document' });
    const document = scene.document as TavernMapDocument;
    const schema = getTavernStateToolDefinitions().find((tool) => tool.function.name === 'MapSceneEdit')?.function.parameters as {
        properties?: {
            elements?: {
                items?: {
                    required?: string[];
                    properties?: Record<string, unknown>;
                };
            };
        };
    };
    const elementSchema = schema?.properties?.elements?.items;

    assert.equal(result.ok, true);
    assert.equal(result.applied?.length, 2);
    assert.match((result.warnings || []).join('\n'), /Inferred shape "rect" for room/);
    assert.deepEqual(document.elements.find((element) => element.id === 'room')?.rect, [180, 90]);
    assert.equal(document.elements.some((element) => element.id === '__label__room'), true);
    assert.deepEqual(elementSchema?.required, ['id']);
    assert.equal('rect' in (elementSchema?.properties || {}), false);
    assert.equal('circle' in (elementSchema?.properties || {}), false);
    assert.equal('path' in (elementSchema?.properties || {}), false);
    assert.equal('label' in (elementSchema?.properties || {}), true);
    assert.deepEqual(Object.keys(((elementSchema?.properties?.geo as { properties?: Record<string, unknown> } | undefined)?.properties || {})).sort(), [
        'at',
        'center',
        'curve',
        'icon',
        'points',
        'radius',
        'size',
    ]);
});

test('MapSceneEdit honors explicit shape when geo contains unrelated empty shape pollution', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit polluted explicit shape' });
    const result = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '污染小酒馆',
        elements: [
            {
                id: 'front-door',
                cat: 'door',
                shape: 'icon',
                kind: 'door',
                geo: { at: [160, 190], icon: 'door_open', rect: [0, 0], radius: 0, path: [], curve: [] },
                label: '正门',
            },
            {
                id: 'round-table',
                cat: 'furniture',
                shape: 'circle',
                geo: { at: [90, 100], radius: 18, rect: [0, 0], path: [], curve: [] },
                label: '圆桌',
            },
            {
                id: 'hearth-light',
                cat: 'light',
                shape: 'circle',
                geo: { at: [235, 80], radius: 45, rect: [0, 0], path: [], curve: [] },
                material: 'warm-light',
            },
        ],
    });
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '污染小酒馆', mode: 'document' });
    const document = scene.document as TavernMapDocument;
    const patches = await listTavernStructuredStatePatches({ sessionId: session.id, docType: 'tavern.map', docId: result.docId });
    const savedOpsJson = JSON.stringify(patches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>));

    assert.equal(result.ok, true);
    assert.equal(result.skipped?.length, 0);
    assert.equal(document.elements.find((element) => element.id === 'front-door')?.icon, 'door_open');
    assert.equal(document.elements.find((element) => element.id === 'front-door')?.kind, 'door');
    assert.equal(document.elements.find((element) => element.id === 'round-table')?.circle, 18);
    assert.equal(document.elements.find((element) => element.id === 'hearth-light')?.circle, 45);
    assert.equal(savedOpsJson.includes('"rect":[0,0]'), false);
    assert.equal(savedOpsJson.includes('"path":[]'), false);
    assert.equal(savedOpsJson.includes('"curve":[]'), false);
});

test('MapSceneEdit infers drawable shapes despite zero and empty geo pollution', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit polluted inference' });
    const result = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '推断污染小酒馆',
        viewBox: [0, 0, 360, 240],
        elements: [
            {
                id: 'front-door',
                cat: 'door',
                kind: 'door',
                geo: { at: [180, 210], icon: 'door_open', rect: [0, 0], radius: 0, path: [], curve: [] },
                label: '正门',
            },
            {
                id: 'round-table',
                cat: 'furniture',
                geo: { at: [115, 120], radius: 22, rect: [0, 0], points: [], curve: [] },
                label: '圆桌',
            },
            {
                id: 'hearth-light',
                cat: 'light',
                geo: { at: [275, 72], radius: 54, rect: [0, 0], path: [] },
                material: 'warm-light',
            },
            {
                id: 'main-path',
                cat: 'road',
                geo: { points: [], path: [[30, 200], [180, 210], [330, 200]], rect: [0, 0] },
                material: 'dirt',
            },
        ],
    });
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '推断污染小酒馆', mode: 'document' });
    const document = scene.document as TavernMapDocument;

    assert.equal(result.ok, true);
    assert.equal(result.skipped?.length, 0);
    assert.equal(document.elements.find((element) => element.id === 'front-door')?.icon, 'door_open');
    assert.equal(document.elements.find((element) => element.id === 'front-door')?.kind, 'door');
    assert.equal(document.elements.find((element) => element.id === 'round-table')?.circle, 22);
    assert.equal(document.elements.find((element) => element.id === 'hearth-light')?.circle, 54);
    assert.deepEqual(document.elements.find((element) => element.id === 'main-path')?.path, [[0, 0], [150, 10], [300, 0]]);
});

test('MapSceneEdit saves a complete tavern first map from common filled-geo model output', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit tavern first map' });
    const result = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '测试小酒馆',
        playerHere: true,
        viewBox: [0, 0, 420, 300],
        mood: 'warm',
        elements: [
            { id: 'hall-floor', cat: 'terrain', shape: 'rect', geo: { center: [210, 149], size: [340, 226], rect: [0, 0], path: [], curve: [] }, material: 'wood' },
            { id: 'outer-wall', cat: 'wall', shape: 'rect', geo: { center: [210, 149], size: [340, 226], radius: 0, points: [], curve: [] }, material: 'stone', label: '测试小酒馆' },
            { id: 'bar-counter', cat: 'furniture', shape: 'rect', geo: { center: [118, 75], size: [104, 34], circle: 0, path: [] }, material: 'wood', label: '吧台' },
            { id: 'front-door', cat: 'door', kind: 'door', shape: 'icon', geo: { at: [210, 262], icon: 'door_open', rect: [0, 0], radius: 0, path: [], curve: [] }, label: '正门' },
            { id: 'round-table-a', cat: 'furniture', shape: 'circle', geo: { at: [250, 125], radius: 23, rect: [0, 0], path: [], curve: [] }, label: '圆桌' },
            { id: 'round-table-b', cat: 'furniture', shape: 'circle', geo: { at: [315, 178], radius: 20, rect: [0, 0], path: [], curve: [] }, label: '圆桌' },
            { id: 'hearth-light', cat: 'light', shape: 'circle', geo: { at: [333, 62], radius: 62, rect: [0, 0], path: [], curve: [] }, material: 'warm-light' },
            { id: 'player-view', cat: 'actor', kind: 'player', actorKey: 'player', shape: 'icon', geo: { at: [204, 205], icon: 'person_pin_circle', rect: [0, 0], radius: 0, path: [], curve: [] }, label: '玩家' },
        ],
    });
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '测试小酒馆', mode: 'document' });
    const document = scene.document as TavernMapDocument;
    const patches = await listTavernStructuredStatePatches({ sessionId: session.id, docType: 'tavern.map', docId: result.docId });
    const savedOpsJson = JSON.stringify(patches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>));

    assert.equal(result.ok, true);
    assert.equal(result.skipped?.length, 0);
    assert.deepEqual(document.meta.viewBox, [0, 0, 420, 300]);
    assert.equal(document.meta.mood, 'warm');
    assert.deepEqual(document.elements.find((element) => element.id === 'hall-floor')?.at, [40, 36]);
    assert.deepEqual(document.elements.find((element) => element.id === 'outer-wall')?.at, [40, 36]);
    assert.deepEqual(document.elements.find((element) => element.id === 'bar-counter')?.at, [66, 58]);
    assert.equal(document.elements.find((element) => element.id === 'front-door')?.icon, 'door_open');
    assert.equal(document.elements.find((element) => element.id === 'front-door')?.kind, 'door');
    assert.equal(document.elements.find((element) => element.id === 'round-table-a')?.circle, 23);
    assert.equal(document.elements.find((element) => element.id === 'round-table-b')?.circle, 20);
    assert.equal(document.elements.find((element) => element.id === 'hearth-light')?.circle, 62);
    assert.equal(document.elements.find((element) => element.id === 'player-view')?.actorKey, 'player');
    assert.equal(savedOpsJson.includes('"rect":[0,0]'), false);
    assert.equal(savedOpsJson.includes('"path":[]'), false);
    assert.equal(savedOpsJson.includes('"curve":[]'), false);
});

test('MapSceneEdit treats rect at as center so model-centered layouts stay aligned', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit centered rect' });
    const result = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '测试酒馆',
        viewBox: [-130, -90, 260, 180],
        mood: 'warm',
        theme: 'parchment',
        elements: [
            { id: 'floor-main', cat: 'terrain', shape: 'rect', geo: { at: [0, 0], size: [220, 140] }, material: 'wood' },
            { id: 'table-west', cat: 'furniture', shape: 'icon', geo: { at: [-70, -35], icon: 'table_bar' }, material: 'wood', label: '西侧桌' },
            { id: 'table-east', cat: 'furniture', shape: 'icon', geo: { at: [45, -25], icon: 'table_bar' }, material: 'wood', label: '东侧桌' },
            { id: 'door-south', cat: 'door', kind: 'door', shape: 'icon', geo: { at: [0, 70], icon: 'door_open' }, material: 'wood', label: '南门' },
            { id: 'actor-player', cat: 'actor', kind: 'player', actorKey: 'player', shape: 'icon', geo: { at: [0, 25], icon: 'person_pin_circle' }, material: 'unknown', label: '你' },
        ],
    });
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '测试酒馆', mode: 'document' });
    const document = scene.document as TavernMapDocument;
    const floor = document.elements.find((element) => element.id === 'floor-main');

    assert.equal(result.ok, true);
    assert.equal(result.skipped?.length, 0);
    assert.match((result.warnings || []).join('\n'), /Interpreted rect position for floor-main as center/);
    assert.deepEqual(floor?.at, [-110, -70]);
    assert.deepEqual(floor?.rect, [220, 140]);
    assert.equal(document.elements.every((element) => {
        if (element.id.startsWith('__label__') || element.id === 'floor-main') {return true;}
        const [x, y] = element.at;
        return x >= -110 && x <= 110 && y >= -70 && y <= 70;
    }), true);
});

test('MapSceneEdit normalizes natural main-surface category aliases to terrain', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit terrain aliases' });
    const result = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '环形平台',
        viewBox: [0, 0, 300, 180],
        elements: [
            { id: 'main-deck', cat: 'deck', shape: 'rect', geo: { center: [150, 90], size: [240, 120] }, material: 'metal' },
            { id: 'upper-surface', cat: 'surface', shape: 'rect', geo: { center: [150, 74], size: [160, 48] }, material: 'metal' },
            { id: 'east-platform', cat: 'platform', shape: 'rect', geo: { center: [236, 90], size: [42, 66] }, material: 'metal' },
            { id: 'guard-rail', cat: 'wall', shape: 'rect', geo: { center: [150, 90], size: [240, 120] }, material: 'metal', label: '护栏' },
        ],
    });
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '环形平台', mode: 'document' });
    const document = scene.document as TavernMapDocument;

    assert.equal(result.ok, true);
    assert.equal(document.elements.find((element) => element.id === 'main-deck')?.cat, 'terrain');
    assert.equal(document.elements.find((element) => element.id === 'upper-surface')?.cat, 'terrain');
    assert.equal(document.elements.find((element) => element.id === 'east-platform')?.cat, 'terrain');
    assert.equal(document.elements.find((element) => element.id === 'guard-rail')?.cat, 'wall');
});

test('MapSceneEdit repeats the same scene intent without increasing scene revision', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit noop' });
    const payload = {
        scene: '重复房间',
        playerHere: true,
        elements: [
            { id: 'room', cat: 'wall', shape: 'rect', geo: { at: [10, 10], size: [200, 120] }, label: '重复房间' },
            { id: 'player', cat: 'actor', actorKey: 'player', shape: 'circle', geo: { at: [90, 70], radius: 8 }, label: '玩家' },
        ],
    };
    const first = await executeTavernStateTool(session.id, 'MapSceneEdit', payload);
    const second = await executeTavernStateTool(session.id, 'MapSceneEdit', payload);
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '重复房间', mode: 'document' });
    const patches = await listTavernStructuredStatePatches({ sessionId: session.id, docType: 'tavern.map', docId: first.docId });

    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.equal(first.revision, 1);
    assert.equal(second.revision, 1);
    assert.equal(second.changed, false);
    assert.equal(scene.revision, 1);
    assert.equal(patches.length, 1);
});

test('MapSceneEdit clears an existing derived label when label is empty', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Scene edit label clear' });
    const first = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '清标签房间',
        elements: [
            { id: 'room', cat: 'wall', shape: 'rect', geo: { at: [10, 10], size: [120, 80] }, label: '旧标签' },
        ],
    });
    const clear = await executeTavernStateTool(session.id, 'MapSceneEdit', {
        scene: '清标签房间',
        elements: [
            { id: 'room', cat: 'wall', shape: 'rect', geo: { at: [10, 10], size: [120, 80] }, label: '' },
        ],
    });
    const scene = await executeTavernStateTool(session.id, 'MapSceneRead', { scene: '清标签房间', mode: 'document' });
    const document = scene.document as TavernMapDocument;
    const patches = await listTavernStructuredStatePatches({ sessionId: session.id, docType: 'tavern.map', docId: first.docId });
    const savedOps = patches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>);

    assert.equal(first.ok, true);
    assert.equal(clear.ok, true);
    assert.equal(document.elements.some((element) => element.id === 'room'), true);
    assert.equal(document.elements.some((element) => element.id === '__label__room'), false);
    assert.equal(JSON.stringify(savedOps).includes('"text":""'), false);
    assert.equal(savedOps.some((op) => op.op === 'remove' && op.id === '__label__room'), true);
});

test('MapPatch dedupes actors by actorKey across map documents', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Actor dedupe' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '去办公室。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '玩家站在办公室。' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'after_turn',
        status: 'running',
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'office',
        activate: true,
        ops: [
            { op: 'meta', set: { name: '办公室' } },
            { op: 'add', element: { id: 'player-office', at: [20, 20], shape: 'icon', icon: 'person_pin_circle', kind: 'player', cat: 'actor', actorKey: 'player', text: '玩家' } },
        ],
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'home',
        activate: true,
        ops: [
            { op: 'meta', set: { name: '家' } },
            { op: 'add', element: { id: 'player-home', at: [80, 60], shape: 'icon', icon: 'person_pin_circle', kind: 'player', cat: 'actor', actorKey: 'player', text: '玩家' } },
        ],
    }, {
        managerRunId: run.id,
        sourceUserOrder: userMessage.order,
        sourceAssistantOrder: assistantMessage.order,
    });

    const office = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'office');
    const home = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'home');
    const officeActors = ((office?.data as { elements?: Array<{ id?: string; cat?: string }> })?.elements || [])
        .filter((element) => element.cat === 'actor');
    const homeActors = ((home?.data as { elements?: Array<{ id?: string; cat?: string }> })?.elements || [])
        .filter((element) => element.cat === 'actor');
    const officePatches = await listTavernStructuredStatePatches({ sessionId: session.id, docId: 'office' });
    const homePatches = await listTavernStructuredStatePatches({ sessionId: session.id, docId: 'home' });
    const replayedOffice = applyTrustedMapPatchOps(createSeedMapDocument(), officePatches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>));
    const replayedHome = applyTrustedMapPatchOps(createSeedMapDocument(), homePatches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>));

    assert.equal(office?.revision, 2);
    assert.deepEqual(officePatches.map((patch) => patch.revision), [1, 2]);
    assert.deepEqual((officePatches[1]?.ops as Array<{ op?: string; id?: string }>).map((op) => [op.op, op.id]), [
        ['remove', 'player-office'],
        ['remove', '__label__player-office'],
    ]);
    assert.equal(officePatches[1]?.managerRunId, run.id);
    assert.equal(officePatches[1]?.sourceUserOrder, userMessage.order);
    assert.equal(officePatches[1]?.sourceAssistantOrder, assistantMessage.order);
    assert.deepEqual(replayedOffice, office?.data);
    assert.deepEqual(replayedHome, home?.data);
    assert.deepEqual(officeActors.map((element) => element.id), []);
    assert.deepEqual(homeActors.map((element) => element.id), ['player-home']);
});

test('MapPatch actor dedupe keeps same-document patch replay equivalent', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Actor same doc dedupe' });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'office',
        ops: [
            { op: 'meta', set: { name: '办公室' } },
            { op: 'add', element: { id: 'player-east', at: [20, 20], shape: 'icon', icon: 'person_pin_circle', kind: 'player', cat: 'actor', actorKey: 'player', text: '玩家东侧' } },
            { op: 'add', element: { id: 'player-west', at: [80, 60], shape: 'icon', icon: 'person_pin_circle', kind: 'player', cat: 'actor', actorKey: 'player', text: '玩家西侧' } },
        ],
    });

    const office = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'office');
    const patches = await listTavernStructuredStatePatches({ sessionId: session.id, docId: 'office' });
    const replayed = applyTrustedMapPatchOps(createSeedMapDocument(), patches.flatMap((patch) => patch.ops as Array<Record<string, unknown>>));
    const actors = ((office?.data as { elements?: Array<{ id?: string; cat?: string }> })?.elements || [])
        .filter((element) => element.cat === 'actor');
    const ops = patches[0]?.ops as Array<{ op?: string; id?: string; element?: { id?: string } }>;

    assert.equal(office?.revision, 1);
    assert.deepEqual(actors.map((element) => element.id), ['player-west']);
    assert.deepEqual(ops.map((op) => [op.op, op.id || op.element?.id]), [
        ['meta', undefined],
        ['add', 'player-east'],
        ['add', '__label__player-east'],
        ['add', 'player-west'],
        ['add', '__label__player-west'],
        ['meta', undefined],
        ['remove', 'player-east'],
        ['remove', '__label__player-east'],
    ]);
    assert.deepEqual(replayed, office?.data);
});

test('MapPatch actor dedupe falls back to actor id when actorKey is missing', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Actor id fallback' });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'street',
        ops: [{ op: 'add', element: { id: 'npc-kai', at: [10, 10], shape: 'icon', icon: 'person', cat: 'actor', text: '凯恩' } }],
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'bar',
        ops: [{ op: 'add', element: { id: 'npc-kai', at: [30, 30], shape: 'icon', icon: 'person', cat: 'actor', text: '凯恩' } }],
    });

    const street = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'street');
    const bar = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'bar');
    const streetActors = ((street?.data as { elements?: Array<{ id?: string; cat?: string }> })?.elements || [])
        .filter((element) => element.cat === 'actor');
    const barActors = ((bar?.data as { elements?: Array<{ id?: string; cat?: string }> })?.elements || [])
        .filter((element) => element.cat === 'actor');

    assert.deepEqual(streetActors.map((element) => element.id), []);
    assert.deepEqual(barActors.map((element) => element.id), ['npc-kai']);
});

test('manager range cancellation does not roll back map-only writes', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'State-only range rollback' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '进入庭院。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '庭院里有一道侧门。' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'after_turn',
        status: 'running',
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
    });

    await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{ op: 'add', element: { id: 'yard', type: 'rect', pos: [0, 0], size: [100, 80], cat: 'terrain' } }],
    }, {
        caller: 'auto',
        managerRunId: run.id,
        sourceUserOrder: userMessage.order,
        sourceAssistantOrder: assistantMessage.order,
    });

    const rollback = await cancelAndRollbackXbTavernManagersForMessageRange(session.id, assistantMessage.order);
    assert.equal(rollback.rolledBack, 0);
    const map = await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main');
    const elements = (map?.data as { elements?: Array<{ id?: string }> })?.elements || [];
    assert.equal(elements.some((element) => element.id === 'yard'), true);
    assert.equal((await listTavernManagerRuns(session.id))[0]?.status, 'cancelled');
});

test('Map tools are in the unified manager tool schema', () => {
    const names = getTavernManagerToolDefinitions().map((tool) => tool.function.name);
    assert.deepEqual(names.filter((name) => ['LS', 'Grep', 'Read', 'Edit', 'Write', 'MapDocs', 'MapInspect', 'MapPatch', 'MapAtlasRead', 'MapSceneRead', 'MapSceneEdit', 'EventInspect', 'EventPatch'].includes(name)).sort(), [
        'Edit',
        'EventInspect',
        'EventPatch',
        'Grep',
        'LS',
        'MapAtlasRead',
        'MapSceneEdit',
        'MapSceneRead',
        'Read',
        'Write',
    ]);
    assert.equal(names.includes('MapDocs'), false);
    assert.equal(names.includes('MapInspect'), false);
    assert.equal(names.includes('MapPatch'), false);
    assert.equal(names.includes('MemoryEdit'), false);
    assert.equal(names.includes('MemoryWrite'), false);
    assert.equal(names.includes('ChatHistory'), false);
    assert.equal(names.includes('StateList'), false);
    assert.equal(names.includes('StateRead'), false);
    assert.equal(names.includes('StatePatch'), false);
    assert.equal(names.includes('TaskPatch'), false);

    const mapPatch = getTavernStateToolDefinitions().find((tool) => tool.function.name === 'MapPatch');
    assert.match(mapPatch?.function.description || '', /Canonical ops are .*meta.*add.*modify.*remove/i);
    assert.match(mapPatch?.function.description || '', /one atomic transaction/);
    assert.match(mapPatch?.function.description || '', /at:\[x,y\]/);
    assert.match(mapPatch?.function.description || '', /Legacy .*init.*reset.*replace.*still absorbed/i);

    const eventInspect = getTavernManagerToolDefinitions().find((tool) => tool.function.name === 'EventInspect');
    const eventInspectSchema = JSON.stringify(eventInspect?.function.parameters || {});
    assert.match(eventInspectSchema, /eventId/);
    assert.doesNotMatch(eventInspectSchema, /taskId/);

    const eventPatch = getTavernManagerToolDefinitions().find((tool) => tool.function.name === 'EventPatch');
    const eventPatchText = [
        eventPatch?.function.description || '',
        JSON.stringify(eventPatch?.function.parameters || {}),
    ].join('\n');
    assert.match(eventPatch?.function.description || '', /Allowed ops: upsert-vision, complete-vision, abandon-vision/);
    assert.match(eventPatch?.function.description || '', /title, vision, doneWhen, and hookForModel/);
    assert.match(eventPatch?.function.description || '', /title: short single-line UI title\. Aim for 2-8 characters; hard limit 12/);
    assert.match(eventPatch?.function.description || '', /hookForModel: one soft in-world sentence/);
    assert.match(eventPatch?.function.description || '', /"op":"upsert-vision"/);
    assert.match(eventPatch?.function.description || '', /"op":"complete-vision"/);
    assert.match(eventPatchText, /upsert-vision/);
    assert.match(eventPatchText, /eventId/);
    assert.match(eventPatchText, /title/);
    assert.doesNotMatch(eventPatchText, /hookForUser|fingerprint|taskId|horizon|"current"|advance-event|upsert-event|complete-event|abandon-event|upsert-task|advance-task|complete-task|abandon-task/);
});

test('EventPatch maintains active, completed, and abandoned ambitions', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Events' });
    const created = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'dock-name',
        title: '莉娜码头',
        vision: '弄清莉娜避开的码头名字',
        doneWhen: '角色当场说出答案。',
        hookForModel: '莉娜似乎在刻意避开某个码头名字。',
    }, { sourceAssistantOrder: 5 });
    assert.equal(created.ok, true);
    assert.equal(created.changed, true);
    assert.equal((await listTavernTasks(session.id))[0]?.id, 'dock-name');
    assert.deepEqual(await getLatestQuestHooksForPrompt(session.id), ['莉娜似乎在刻意避开某个码头名字。']);

    const rejectedAdvance = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'advance-event',
        eventId: 'dock-name',
        doneWhen: '角色当场说出答案。',
        hookForModel: '有人提到旧码头时，莉娜的手指短暂收紧。',
    }, { sourceAssistantOrder: 7 });
    assert.equal(rejectedAdvance.ok, false);
    assert.equal(rejectedAdvance.error, 'task_op_invalid');

    const completed = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'complete-vision',
        eventId: 'dock-name',
    }, { sourceAssistantOrder: 9 });
    assert.equal(completed.ok, true);
    const allTasks = await listTavernTasks(session.id, { includeCompleted: true });
    assert.equal(allTasks[0]?.status, 'completed');
    assert.deepEqual(await getLatestQuestHooksForPrompt(session.id), []);

    await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'repeat',
        title: '重复线',
        vision: '重复方向',
        doneWhen: '角色当场说出答案。',
        hookForModel: '重复方向仍在阴影里。',
    }, { sourceAssistantOrder: 10 });
    const abandoned = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'abandon-vision',
        eventId: 'repeat',
    }, { sourceAssistantOrder: 11 });
    assert.equal(abandoned.ok, true);
    const recreated = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'repeat-2',
        title: '重复线',
        vision: '重复方向',
        doneWhen: '角色当场说出答案。',
        hookForModel: '重复方向仍在阴影里。',
    }, { sourceAssistantOrder: 12 });
    assert.equal(recreated.ok, false);
    assert.equal(recreated.error, 'task_fingerprint_abandoned');

    const duplicateSession = await createTavernSession({ title: 'Duplicate active event' });
    const firstUpsert = await executeTavernTaskTool(duplicateSession.id, 'EventPatch', {
        op: 'upsert-vision',
        title: '城东母亲',
        vision: '莉娜的家庭压力把你们牵进城东旧屋。',
        doneWhen: '角色亲自到达城东旧屋并见到莉娜的母亲。',
        hookForModel: '莉娜提过她母亲一个人住在城东，最近似乎想找人帮忙修房子。',
    }, { sourceAssistantOrder: 13 });
    const secondUpsert = await executeTavernTaskTool(duplicateSession.id, 'EventPatch', {
        op: 'upsert-vision',
        title: '城东母亲',
        vision: '莉娜的家庭压力把你们牵进城东旧屋。',
        doneWhen: '角色亲自到达城东旧屋并见到莉娜的母亲。',
        hookForModel: '莉娜提过她母亲一个人住在城东，最近似乎想找人帮忙修房子。',
    }, { sourceAssistantOrder: 14 });
    const duplicateTasks = await listTavernTasks(duplicateSession.id);
    assert.equal(firstUpsert.ok, true);
    assert.equal(secondUpsert.ok, true);
    assert.equal(secondUpsert.eventId, firstUpsert.eventId);
    assert.equal(duplicateTasks.length, 1);
    assert.equal(duplicateTasks[0]?.updatedOrder, 14);

    const completedSession = await createTavernSession({ title: 'Duplicate completed event' });
    const completedCreated = await executeTavernTaskTool(completedSession.id, 'EventPatch', {
        op: 'upsert-vision',
        title: '码头名',
        vision: '弄清码头名字',
        doneWhen: '角色当场说出答案。',
        hookForModel: '码头名字在对话里轻轻擦过。',
    }, { sourceAssistantOrder: 15 });
    assert.equal(completedCreated.ok, true);
    const completedOnce = await executeTavernTaskTool(completedSession.id, 'EventPatch', {
        op: 'complete-vision',
        eventId: completedCreated.eventId,
    }, { sourceAssistantOrder: 16 });
    assert.equal(completedOnce.ok, true);
    const completedRecreated = await executeTavernTaskTool(completedSession.id, 'EventPatch', {
        op: 'upsert-vision',
        title: '码头名',
        vision: '弄清码头名字',
        doneWhen: '角色当场说出答案。',
        hookForModel: '码头名字在对话里轻轻擦过。',
    }, { sourceAssistantOrder: 17 });
    const completedTasks = await listTavernTasks(completedSession.id, { includeCompleted: true });
    assert.equal(completedRecreated.ok, false);
    assert.equal(completedRecreated.error, 'task_fingerprint_completed');
    assert.deepEqual(completedTasks.map((task) => task.status), ['completed']);

    const stableSession = await createTavernSession({ title: 'Stable abandoned event' });
    const stableCreated = await executeTavernTaskTool(stableSession.id, 'EventPatch', {
        op: 'upsert-vision',
        title: '旧屋线',
        vision: '旧屋背后的家庭压力浮出水面。',
        doneWhen: '角色见到莉娜的母亲。',
        hookForModel: '莉娜提过她母亲一个人住在城东。',
    }, { sourceAssistantOrder: 15 });
    assert.equal(stableCreated.ok, true);
    const stableUpdated = await executeTavernTaskTool(stableSession.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: stableCreated.eventId,
        title: '门锁线',
        vision: '旧屋背后的家庭压力牵出更具体的阻碍。',
        doneWhen: '角色查清是谁换了旧屋门锁。',
        hookForModel: '莉娜母亲家的门锁看起来像是最近才被人换过。',
    }, { sourceAssistantOrder: 16 });
    assert.equal(stableUpdated.ok, true);
    const stableAbandoned = await executeTavernTaskTool(stableSession.id, 'EventPatch', {
        op: 'abandon-vision',
        eventId: stableCreated.eventId,
    }, { sourceAssistantOrder: 17 });
    assert.equal(stableAbandoned.ok, true);
    const stableRecreated = await executeTavernTaskTool(stableSession.id, 'EventPatch', {
        op: 'upsert-vision',
        title: '旧屋线',
        vision: '旧屋背后的家庭压力浮出水面。',
        doneWhen: '角色见到莉娜的母亲。',
        hookForModel: '莉娜提过她母亲一个人住在城东。',
    }, { sourceAssistantOrder: 18 });
    assert.equal(stableRecreated.ok, false);
    assert.equal(stableRecreated.error, 'task_fingerprint_abandoned');
});

test('EventPatch event ids are scoped by session', async () => {
    await db.delete();
    await db.open();

    const left = await createTavernSession({ title: 'Left tasks' });
    const right = await createTavernSession({ title: 'Right tasks' });
    const taskArgs = {
        op: 'upsert-vision',
        eventId: 'dock-name',
        title: '码头名',
        vision: '弄清码头名字',
        doneWhen: '角色当场说出答案。',
        hookForModel: '码头名字在对话里轻轻擦过。',
    };

    const leftCreate = await executeTavernTaskTool(left.id, 'EventPatch', {
        ...taskArgs,
    }, { sourceAssistantOrder: 5 });
    const rightCreate = await executeTavernTaskTool(right.id, 'EventPatch', {
        ...taskArgs,
        title: '右侧码头',
        vision: '追问右侧会话的码头名字',
    }, { sourceAssistantOrder: 5 });

    assert.equal(leftCreate.ok, true);
    assert.equal(rightCreate.ok, true);
    assert.deepEqual((await listTavernTasks(left.id)).map((task) => `${task.id}:${task.vision}`), ['dock-name:弄清码头名字']);
    assert.deepEqual((await listTavernTasks(right.id)).map((task) => `${task.id}:${task.vision}`), ['dock-name:追问右侧会话的码头名字']);
});

test('EventPatch enforces auto generation floor, pool cap, and hook wording guards', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Event guards' });
    const early = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'too-early',
        title: '过早方向',
        vision: '过早远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '窗外的雾还没有散。',
    }, { caller: 'auto', sourceAssistantOrder: 4 });
    assert.equal(early.ok, false);
    assert.equal(early.error, 'task_floor_too_early');

    const missingTitle = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'missing-title',
        vision: '缺标题远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '门外有人轻轻敲了两下。',
    }, { caller: 'chat', sourceAssistantOrder: 5 });
    assert.equal(missingTitle.ok, false);
    assert.equal(missingTitle.error, 'task_fields_required');

    const shortTitle = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'short-title',
        title: '短',
        vision: '短标题远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '门外的人把一封信塞进缝里。',
    }, { caller: 'chat', sourceAssistantOrder: 5 });
    assert.equal(shortTitle.ok, false);
    assert.equal(shortTitle.error, 'task_title_too_short');

    const naturalTitleSession = await createTavernSession({ title: 'Natural event title length' });
    const naturalLongTitle = await executeTavernTaskTool(naturalTitleSession.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'natural-long-title',
        title: '城东旧屋门锁真相',
        vision: '自然长标题远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '门外的人把旧钥匙放在窗台上。',
    }, { caller: 'chat', sourceAssistantOrder: 5 });
    assert.equal(naturalLongTitle.ok, true);
    assert.equal((await listTavernTasks(naturalTitleSession.id)).find((task) => task.id === 'natural-long-title')?.title, '城东旧屋门锁真相');

    const longTitle = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'long-title',
        title: '这个标题确实已经明显太长了',
        vision: '长标题远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '门外的人把第二封信压在花盆下。',
    }, { caller: 'chat', sourceAssistantOrder: 5 });
    assert.equal(longTitle.ok, false);
    assert.equal(longTitle.error, 'task_title_too_long');

    const titleSession = await createTavernSession({ title: 'Event title normalization' });
    const multilineTitle = await executeTavernTaskTool(titleSession.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'multiline-title',
        title: '城东\n母亲',
        vision: '换行标题远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '门外的人把第三封信放在窗台上。',
    }, { caller: 'chat', sourceAssistantOrder: 5 });
    assert.equal(multilineTitle.ok, true);
    assert.equal((await listTavernTasks(titleSession.id)).find((task) => task.id === 'multiline-title')?.title, '城东 母亲');

    const metaHook = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'meta-hook',
        title: '元词方向',
        vision: '元词远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '这是下一个任务目标。',
    }, { caller: 'auto', sourceAssistantOrder: 5 });
    assert.equal(metaHook.ok, false);
    assert.equal(metaHook.error, 'task_hook_meta_words');

    for (let index = 1; index <= 2; index += 1) {
        const created = await executeTavernTaskTool(session.id, 'EventPatch', {
            op: 'upsert-vision',
            eventId: `pool-${index}`,
            title: `池子${index}`,
            vision: `池子远景 ${index}`,
            doneWhen: '角色当场说出答案。',
            hookForModel: `第 ${index} 条暗线在门后轻轻晃动。`,
        }, { caller: 'auto', sourceAssistantOrder: 5 + index });
        assert.equal(created.ok, true);
    }
    const [firstStored] = await listTavernTasks(session.id);
    assert.equal(typeof firstStored?.fingerprint, 'string');
    assert.notEqual(firstStored?.fingerprint, '');

    const autoBlocked = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'pool-3-auto',
        title: '第三条',
        vision: '第三条远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '第三条暗线在远处亮了一下。',
    }, { caller: 'auto', sourceAssistantOrder: 8 });
    assert.equal(autoBlocked.ok, false);
    assert.equal(autoBlocked.error, 'task_auto_create_pool_busy');

    const manual = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'manual-extra',
        title: '手动线',
        vision: '手动远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '额外暗线贴着墙根延伸。',
    }, { caller: 'chat', sourceAssistantOrder: 10 });
    assert.equal(manual.ok, true);

    const overflow = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'pool-4',
        title: '第四条',
        vision: '第四条远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '第四条暗线在远处亮了一下。',
    }, { caller: 'chat', sourceAssistantOrder: 10 });
    assert.equal(overflow.ok, false);
    assert.equal(overflow.error, 'task_active_pool_full');

    const badHookUpdate = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'manual-extra',
        hookForModel: '这个目标已经完成。',
    }, { caller: 'chat', sourceAssistantOrder: 11 });
    assert.equal(badHookUpdate.ok, false);
    assert.equal(badHookUpdate.error, 'task_hook_meta_words');
});

test('event snapshots restore covering event pool and trim future snapshots', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Task snapshots' });
    await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'first',
        title: '第一线',
        vision: '第一条远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '第一条软句。',
    }, { sourceAssistantOrder: 5 });
    await saveTavernTaskSnapshot(session.id, 5);
    await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'future',
        title: '未来线',
        vision: '未来远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '未来软句。',
    }, { sourceAssistantOrder: 7 });
    await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'complete-vision',
        eventId: 'first',
    }, { sourceAssistantOrder: 8 });
    await saveTavernTaskSnapshot(session.id, 8);

    const restored = await restoreTavernTasksToFloor(session.id, 5);
    assert.deepEqual(restored.map((task) => `${task.id}:${task.status}`).sort(), ['first:active']);
    assert.deepEqual((await listTavernTasks(session.id, { includeCompleted: true })).map((task) => task.id), ['first']);

    const trimmed = await trimTavernTaskSnapshotsFromFloor(session.id, 6);
    assert.equal(trimmed, 1);
    assert.deepEqual((await listTavernTaskSnapshots(session.id)).map((snapshot) => snapshot.floor), [5]);
});

test('accepted state snapshot saves memory, tasks, and status on the same floor', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Accepted snapshot' });
    await appendTavernMessage(session.id, { role: 'user', content: '开始。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '第一个回复。' });
    await ensureTavernMemoryDefaults(session.id);
    await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'same-floor',
        title: '同楼线',
        vision: '同楼层远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '同楼层软句。',
    }, { sourceAssistantOrder: 1 });
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, {
        document: {
            meta: { activeSubject: 'user' },
            subjects: [{
                id: 'user',
                name: '测试角色',
                tabs: [{
                    id: 'overview',
                    label: '概览',
                    blocks: [{
                        id: 'stats',
                        title: '属性',
                        form: 'gauge',
                        fields: [{ id: 'san', name: '理智', value: 50, max: 100 }],
                    }],
                }],
            }],
        },
    }, { sourceAssistantOrder: 1 });

    const saved = await saveAcceptedStateSnapshot(session.id);
    assert.equal(saved.floor, 1);
    assert.equal(saved.memorySnapshotSaved, true);
    assert.equal(saved.taskSnapshotSaved, true);
    assert.equal(saved.statusSnapshotSaved, true);
    assert.equal((await listTavernMemorySnapshots(session.id))[0]?.floor, 1);
    assert.equal((await listTavernTaskSnapshots(session.id))[0]?.floor, 1);
    assert.equal((await listTavernStatusSnapshots(session.id))[0]?.floor, 1);
});

test('accepted state snapshot can explicitly anchor user-confirmed memory edits to the latest user order', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'User anchored accepted snapshot' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '请记住修正。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '我会照做。' });

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n用户手动确认的修正。', { source: 'user' });
    const latestUser = await getLatestTavernUserMessageAtOrBefore(session.id, Number.POSITIVE_INFINITY);
    const saved = await saveAcceptedStateSnapshot(session.id, latestUser?.order);

    assert.equal(latestUser?.order, userMessage.order);
    assert.equal(saved.floor, userMessage.order);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [userMessage.order]);

    await trimTavernMemorySnapshotsFromFloor(session.id, assistantMessage.order);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [userMessage.order]);
});

test('accepted state snapshot can explicitly anchor user-confirmed changes to baseline when no user message exists', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Baseline user accepted snapshot' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '先有一条系统回复。' });

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n没有用户楼层时，用户确认改动挂在基线。', { source: 'user' });
    const saved = await saveAcceptedStateSnapshot(session.id, -1);

    assert.equal(saved.floor, -1);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [-1]);
});

test('accepted state snapshot can anchor user-initiated manager chat changes to the latest user order', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager chat accepted snapshot' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '请帮我修正记忆。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '我来处理。' });
    let managerCalls = 0;

    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        question: '把状态修正成用户确认版。',
        executeManagerOnce: async () => {
            managerCalls += 1;
            if (managerCalls === 1) {
                return {
                    text: '',
                    provider: 'fake-provider',
                    model: 'fake-model',
                    toolCalls: [{
                        id: 'write-user-confirmed-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: '# 会话记忆\n\n助手聊天按用户要求修正。',
                        },
                    }],
                };
            }
            return {
                text: '已按用户要求修正记忆。',
                provider: 'fake-provider',
                model: 'fake-model',
            };
        },
    });
    const latestUser = await getLatestTavernUserMessageAtOrBefore(session.id, Number.POSITIVE_INFINITY);
    const saved = await saveAcceptedStateSnapshot(session.id, latestUser?.order);

    assert.equal(result.ok, true);
    assert.deepEqual(result.changedFiles, ['memory/state.md']);
    assert.equal(saved.floor, userMessage.order);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [userMessage.order]);
});

test('accepted state snapshots use floor-aware dedupe for memory, tasks, and status', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Floor-aware accepted snapshots' });
    await appendTavernMessage(session.id, { role: 'user', content: '第一轮。' });
    const assistant1 = await appendTavernMessage(session.id, { role: 'assistant', content: '第一轮回复。' });
    const user2 = await appendTavernMessage(session.id, { role: 'user', content: '请按我的修正更新。' });
    const assistant2 = await appendTavernMessage(session.id, { role: 'assistant', content: '已更新。' });

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n旧状态。', { source: 'manager' });
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, {
        document: {
            meta: { activeSubject: 'user' },
            subjects: [{
                id: 'user',
                name: '测试角色',
                tabs: [{
                    id: 'overview',
                    label: '概览',
                    blocks: [{
                        id: 'stats',
                        title: '属性',
                        form: 'gauge',
                        fields: [{ id: 'san', name: '理智', value: 40, max: 100 }],
                    }],
                }],
            }],
        },
    }, { sourceAssistantOrder: assistant1.order });
    await saveAcceptedStateSnapshot(session.id, assistant1.order);

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n用户确认的新状态。', { source: 'user' });
    await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'user-anchor-task',
        title: '用户锚点事件',
        vision: '用户锚点远景',
        doneWhen: '用户锚点完成。',
        hookForModel: '用户锚点软句。',
    }, { sourceAssistantOrder: assistant2.order });
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.PATCH, {
        ops: [
            { op: 'set', subjectId: 'user', tabId: 'overview', blockId: 'stats', fieldId: 'san', value: 80 },
        ],
    }, { caller: 'chat' });

    await saveAcceptedStateSnapshot(session.id, assistant2.order);
    const userAnchor = await saveAcceptedStateSnapshot(session.id, user2.order);

    assert.equal(userAnchor.floor, user2.order);
    assert.equal(userAnchor.memorySnapshotSaved, true);
    assert.equal(userAnchor.taskSnapshotSaved, true);
    assert.equal(userAnchor.statusSnapshotSaved, true);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [assistant1.order, user2.order, assistant2.order]);
    assert.deepEqual((await listTavernTaskSnapshots(session.id)).map((snapshot) => snapshot.floor), [assistant1.order, user2.order, assistant2.order]);
    assert.deepEqual((await listTavernStatusSnapshots(session.id)).map((snapshot) => snapshot.floor), [assistant1.order, user2.order, assistant2.order]);
});

test('accepted state snapshot preserves user memory edits against later rollback', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manual accepted memory' });
    await appendTavernMessage(session.id, { role: 'user', content: '第一步。' });
    const assistant1 = await appendTavernMessage(session.id, { role: 'assistant', content: '第一步成立。' });
    await appendTavernMessage(session.id, { role: 'user', content: '第二步。' });
    const assistant2 = await appendTavernMessage(session.id, { role: 'assistant', content: '第二步成立。' });

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n旧锚点。', { source: 'manager' });
    await saveAcceptedStateSnapshot(session.id, assistant1.order);
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n用户手动修正。', { source: 'user' });
    const saved = await saveAcceptedStateSnapshot(session.id);
    const duplicate = await saveAcceptedStateSnapshot(session.id);

    assert.equal(saved.floor, assistant2.order);
    assert.equal(saved.memorySnapshotSaved, true);
    assert.equal(duplicate.memorySnapshotSaved, false);
    assert.deepEqual((await listTavernMemorySnapshots(session.id)).map((snapshot) => snapshot.floor), [assistant1.order, assistant2.order]);

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n未来临时内容。', { source: 'manager' });
    await restoreTavernMemoryToFloor(session.id, assistant2.order);

    assert.match((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /用户手动修正/);
});

test('manager event snapshot rolls back failed event writes', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager event rollback' });
    await appendTavernMessage(session.id, { role: 'user', content: '前情一。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '前情二。' });
    await appendTavernMessage(session.id, { role: 'user', content: '前情三。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '前情四。' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '继续。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她提到了码头。' });
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 6,
        sessionContract: mergeTavernSessionContract(undefined, {
            memoryArchiving: false,
            cartographyEngine: false,
            questOrchestration: true,
        }),
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    provider: 'fake-manager',
                    model: 'event-model',
                    text: '生成野望。',
                    toolCalls: [{
                        id: 'event',
                        name: 'EventPatch',
                        arguments: {
                            op: 'upsert-vision',
                            eventId: 'rollback-task',
                            title: '回滚线',
                            vision: '回滚远景',
                            doneWhen: '角色当场说出答案。',
                            hookForModel: '回滚软句。',
                        },
                    }],
                };
            }
            throw new Error('manager_failed_after_task');
        },
    });

    assert.equal(result.ok, false);
    assert.deepEqual(await listTavernTasks(session.id, { includeCompleted: true, includeAbandoned: true }), []);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.equal(run?.status, 'rolled_back');
});

test('manager rollback keeps memory conflict audit when event rollback also succeeds', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager rollback conflict audit' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '继续。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '北门半开。' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'after_turn',
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        status: 'running',
    });

    const memoryWrite = await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: '# 会话记忆\n\n北门半开。',
    }, { caller: 'auto', managerRunId: run.id });
    assert.equal(memoryWrite.ok, true);

    const taskWrite = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'rollback-audit-task',
        title: '审计线',
        vision: '审计远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '审计软句。',
    }, { caller: 'auto', managerRunId: run.id, sourceAssistantOrder: 5 });
    assert.equal(taskWrite.ok, true);

    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n用户手动改过。', { source: 'manual' });
    const rolledBack = await cancelAndRollbackXbTavernManagersForMessageRange(session.id, userMessage.order);

    assert.deepEqual(rolledBack.conflicts, ['memory/state.md']);
    assert.deepEqual(await listTavernTasks(session.id, { includeCompleted: true, includeAbandoned: true }), []);
    const updatedRun = (await listTavernManagerRuns(session.id))[0];
    assert.equal(updatedRun?.status, 'rolled_back');
    assert.equal(updatedRun?.error, 'rollback_conflict:memory/state.md');
});

test('manager rollback marks event-only conflicts as rolled back with audit error', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager event conflict audit' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '继续。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '码头有新线索。' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        trigger: 'after_turn',
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        status: 'running',
    });

    const taskWrite = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'task-conflict',
        title: '冲突线',
        vision: '冲突远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '冲突软句。',
    }, { caller: 'auto', managerRunId: run.id, sourceAssistantOrder: 5 });
    assert.equal(taskWrite.ok, true);

    const userEdit = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'task-conflict',
        title: '冲突线',
        vision: '用户后续手动改过的野望',
        doneWhen: '角色当场说出答案。',
        hookForModel: '冲突软句后来变了。',
    }, { caller: 'chat', sourceAssistantOrder: 6 });
    assert.equal(userEdit.ok, true);

    const rolledBack = await cancelAndRollbackXbTavernManagersForMessageRange(session.id, userMessage.order);

    assert.deepEqual(rolledBack.conflicts, ['tasks']);
    const updatedRun = (await listTavernManagerRuns(session.id))[0];
    assert.equal(updatedRun?.status, 'rolled_back');
    assert.equal(updatedRun?.error, 'rollback_conflict:tasks');
    assert.equal((await listTavernTasks(session.id, { includeCompleted: true }))[0]?.vision, '用户后续手动改过的野望');
});

test('manager EventPatch writes are counted in run summaries', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager event summary' });
    await appendTavernMessage(session.id, { role: 'user', content: '前情一。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '前情二。' });
    await appendTavernMessage(session.id, { role: 'user', content: '前情三。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '前情四。' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '继续。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她提到了码头。' });
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 6,
        sessionContract: mergeTavernSessionContract(undefined, {
            memoryArchiving: false,
            cartographyEngine: false,
            questOrchestration: true,
        }),
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    provider: 'fake-manager',
                    model: 'event-model',
                    text: '创建野望。',
                    toolCalls: [{
                        id: 'event',
                        name: 'EventPatch',
                        arguments: {
                            op: 'upsert-vision',
                            eventId: 'counted-task',
                            title: '统计线',
                            vision: '统计远景',
                            doneWhen: '角色当场说出答案。',
                            hookForModel: '统计软句。',
                        },
                    }],
                };
            }
            return { provider: 'fake-manager', model: 'event-model', text: '' };
        },
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.changedTasks, ['event/counted-task']);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.deepEqual(run?.changedTasks, ['event/counted-task']);
    assert.equal(run?.parsedAction, 'manager_state_updated');
    assert.match(run?.outputText || '', /1 条野望/);
});

test('manager stale event sweep is counted in run summaries', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager stale summary' });
    await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'stale-by-manager',
        title: '过期线',
        vision: '过期远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '过期软句。',
    }, { sourceAssistantOrder: 5 });
    for (let index = 0; index < 7; index += 1) {
        await appendTavernMessage(session.id, { role: 'user', content: `铺垫 ${index}。` });
        await appendTavernMessage(session.id, { role: 'assistant', content: `回应 ${index}。` });
    }
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '继续。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '没有推进旧线索。' });

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 8,
        sessionContract: mergeTavernSessionContract(undefined, {
            memoryArchiving: false,
            cartographyEngine: false,
            questOrchestration: true,
        }),
        executeManagerOnce: async () => ({
            provider: 'fake-manager',
            model: 'event-model',
            text: '',
        }),
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.changedTasks, ['event/stale-by-manager']);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.deepEqual(run?.changedTasks, ['event/stale-by-manager']);
    assert.equal(run?.parsedAction, 'manager_state_updated');
    assert.match(run?.outputText || '', /系统已放弃 1 条过期野望/);
    const tasks = await listTavernTasks(session.id, { includeAbandoned: true });
    assert.equal(tasks[0]?.status, 'abandoned');
});

test('stale active events are abandoned internally with fingerprints', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Stale event' });
    await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'stale',
        title: '过期线',
        vision: '过期远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '过期软句。',
    }, { sourceAssistantOrder: 5 });
    const abandoned = await abandonStaleTavernTasks(session.id, 12, { threshold: 3 });
    assert.equal(abandoned.length, 1);
    const tasks = await listTavernTasks(session.id, { includeAbandoned: true });
    assert.equal(tasks[0]?.status, 'abandoned');
    const recreate = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'stale-again',
        title: '过期线',
        vision: '过期远景',
        doneWhen: '角色当场说出答案。',
        hookForModel: '过期软句。',
    }, { sourceAssistantOrder: 13 });
    assert.equal(recreate.error, 'task_fingerprint_abandoned');
});

test('tavern manager uses memory tools and records tool trace', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Tool manager' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '把银钥匙藏好。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她把银钥匙塞进码头钟楼的砖缝。' });
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    provider: 'fake-manager',
                    model: 'memory-model',
                    text: '先记录本轮银钥匙位置。',
                    thoughts: [{
                        label: '空间线索',
                        text: '银钥匙位置发生了明确变化，需要写入流水。',
                    }],
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: [
                                '# 会话记忆',
                                '',
                                '本轮确认银钥匙被藏进码头钟楼砖缝。',
                                '',
                                '## 当前状态',
                                '银钥匙暂时安全。',
                                '',
                                '## 线索',
                                '- 码头钟楼',
                            ].join('\n'),
                        },
                    }],
                };
            }
            const liveRun = (await listTavernManagerRuns(session.id))[0];
            const liveTrace = liveRun?.toolTrace as Array<Record<string, unknown>>;
            assert.equal(liveRun?.status, 'running');
            assert.equal(liveTrace?.[0]?.status, 'resolved');
            assert.equal(liveTrace?.[0]?.preface, '先记录本轮银钥匙位置。');
            assert.equal(((liveTrace?.[0]?.thoughts as Array<{ text?: string }>) || [])[0]?.text, '银钥匙位置发生了明确变化，需要写入流水。');
            return {
                provider: 'fake-manager',
                model: 'memory-model',
                text: '已更新 memory/state.md。',
            };
        },
    });

    assert.equal(result.ok, true);
    assert.deepEqual(result.changedFiles, ['memory/state.md']);
    assert.equal((await listTavernMemoryFiles(session.id)).some((file) => file.path === 'memory/state.md'), true);
    assert.match((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /银钥匙/);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.equal(run?.status, 'completed');
    assert.equal(Array.isArray(run?.toolTrace), true);
    assert.equal(run?.changedFiles?.[0], 'memory/state.md');
});

test('tavern auto manager prompt omits unauthorized module instructions from both system and user messages', async () => {
    await db.delete();
    await db.open();

    const memorySession = await createTavernSession({ title: 'Memory-only prompt' });
    const memoryUser = await appendTavernMessage(memorySession.id, { role: 'user', content: '把线索记下来。' });
    const memoryAssistant = await appendTavernMessage(memorySession.id, { role: 'assistant', content: '线索已经明确。' });
    let memoryPrompt = '';
    await runXbTavernManagerAfterTurn({
        sessionId: memorySession.id,
        agentConfig: {},
        userMessage: memoryUser,
        assistantMessage: memoryAssistant,
        turn: 1,
        sessionContract: mergeTavernSessionContract(undefined, {
            memoryArchiving: true,
            cartographyEngine: false,
        }),
        contextSnapshot: {
            user: { name: 'Mira' },
        },
        executeManagerOnce: async (options) => {
            memoryPrompt = JSON.stringify(options.messages);
            return { provider: 'fake-manager', model: 'memory-only', text: '已检查。' };
        },
    });
    assert.match(memoryPrompt, /Edit\/Write/);
    assert.doesNotMatch(memoryPrompt, /MapAtlasRead|MapSceneEdit|MapInspect summary/);
    assert.doesNotMatch(memoryPrompt, /## Structured State/);
    assert.doesNotMatch(memoryPrompt, /The map does not replace this turn's written memory/i);
    assert.doesNotMatch(memoryPrompt, /spatial relation view/i);

    const mapSession = await createTavernSession({ title: 'Map-only prompt' });
    const mapUser = await appendTavernMessage(mapSession.id, { role: 'user', content: '看看前面地形。' });
    const mapAssistant = await appendTavernMessage(mapSession.id, { role: 'assistant', content: '前面是一条狭长走廊。' });
    let mapPrompt = '';
    await runXbTavernManagerAfterTurn({
        sessionId: mapSession.id,
        agentConfig: {},
        userMessage: mapUser,
        assistantMessage: mapAssistant,
        turn: 1,
        sessionContract: mergeTavernSessionContract(undefined, {
            memoryArchiving: false,
            cartographyEngine: true,
        }),
        executeManagerOnce: async (options) => {
            mapPrompt = JSON.stringify(options.messages);
            return { provider: 'fake-manager', model: 'map-only', text: '已检查。' };
        },
    });
    assert.match(mapPrompt, /MapAtlasRead/);
    assert.match(mapPrompt, /MapSceneEdit/);
    assert.match(mapPrompt, /Construction order/i);
    assert.match(mapPrompt, /Closed or contained scenes usually need both a filled main surface/i);
    assert.match(mapPrompt, /`cat:\\"terrain\\"` for the main continuous surface or filled base area/i);
    assert.match(mapPrompt, /Open scenes .* may use a main surface/i);
    assert.match(mapPrompt, /Each domain owns its own records: map is spatial records, status panel is UI state/i);
    assert.doesNotMatch(mapPrompt, /Edit and Write/);
    assert.doesNotMatch(mapPrompt, /memory\/session\.md/);
    assert.doesNotMatch(mapPrompt, /建议流水路径：/);

    const questSession = await createTavernSession({ title: 'Quest prompt' });
    await executeTavernTaskTool(questSession.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'existing-hook',
        title: '旧码头',
        vision: '弄清旧码头',
        doneWhen: '角色当场说出答案。',
        hookForModel: '莉娜听见旧码头时短暂停顿。',
    }, { sourceAssistantOrder: 5 });
    const questUser = await appendTavernMessage(questSession.id, { role: 'user', content: '继续。' });
    const questAssistant = await appendTavernMessage(questSession.id, { role: 'assistant', content: '莉娜没有接码头这个话题。' });
    let questPrompt = '';
    await runXbTavernManagerAfterTurn({
        sessionId: questSession.id,
        agentConfig: {},
        userMessage: questUser,
        assistantMessage: questAssistant,
        turn: 6,
        sessionContract: mergeTavernSessionContract(undefined, {
            memoryArchiving: false,
            cartographyEngine: false,
            questOrchestration: true,
        }),
        executeManagerOnce: async (options) => {
            questPrompt = JSON.stringify(options.messages);
            return { provider: 'fake-manager', model: 'quest-only', text: '已检查。' };
        },
    });
    assert.match(questPrompt, /\[Current Ambition Palette\]/);
    assert.match(questPrompt, /id: existing-hook/);
    assert.match(questPrompt, /title: 旧码头/);
    assert.match(questPrompt, /vision: 弄清旧码头/);
    assert.match(questPrompt, /updated floor: 5/);
    assert.match(questPrompt, /Active count: 1\/3/);
    assert.doesNotMatch(questPrompt, /user hook|fingerprint|莉娜绕开旧码头名字/);
    assert.doesNotMatch(questPrompt, /\[Global memory state\.md\]/);
});

test('tavern auto manager denies unauthorized Write without side effects', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Blocked memory write' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '别写记忆。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '那就只看地图。' });
    let calls = 0;

    const executeManagerOnce = (async (options) => {
        calls += 1;
        if (calls === 1) {
            return {
                provider: 'fake-manager',
                model: 'map-only',
                text: '我先试着写记忆。',
                toolCalls: [{
                    id: 'blocked-memory',
                    name: 'Write',
                    arguments: {
                        filePath: 'memory/session.md',
                        content: 'should not be written',
                    },
                }],
            };
        }
        assert.equal(options.toolResponses?.[0]?.name, 'Write');
        assert.match(JSON.stringify(options.toolResponses?.[0]?.response || {}), /契约未授权 记忆存档/);
        return {
            provider: 'fake-manager',
            model: 'map-only',
            text: '已跳过未授权记忆写入。',
        };
    }) as Parameters<typeof runXbTavernManagerAfterTurn>[0]['executeManagerOnce'] & { supportsSessionToolLoop?: boolean };
    executeManagerOnce.supportsSessionToolLoop = true;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        sessionContract: mergeTavernSessionContract(undefined, {
            memoryArchiving: false,
            cartographyEngine: true,
        }),
        executeManagerOnce,
    });

    assert.equal(result.ok, true);
    assert.equal(calls, 2);
    assert.deepEqual(result.changedFiles, []);
    assert.equal((await listTavernMemoryFiles(session.id)).some((file) => file.path !== 'memory/state.md'), false);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.match(JSON.stringify(run?.toolTrace || []), /契约未授权 记忆存档/);
});

test('tavern auto manager denies unauthorized MapPatch without side effects', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Blocked state patch' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '别动地图。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '那我只整理文字。' });
    let calls = 0;

    const executeManagerOnce = (async (options) => {
        calls += 1;
        if (calls === 1) {
            return {
                provider: 'fake-manager',
                model: 'memory-only',
                text: '我先试着改地图。',
                toolCalls: [{
                    id: 'blocked-state',
                    name: 'MapPatch',
                    arguments: {
                        ops: [{
                            op: 'add',
                            element: { id: 'marker', at: [80, 60], shape: 'icon', icon: 'location_on', cat: 'marker' },
                        }],
                    },
                }],
            };
        }
        assert.equal(options.toolResponses?.[0]?.name, 'MapPatch');
        assert.match(JSON.stringify(options.toolResponses?.[0]?.response || {}), /契约未授权 制图引擎/);
        return {
            provider: 'fake-manager',
            model: 'memory-only',
            text: '已跳过未授权地图改动。',
        };
    }) as Parameters<typeof runXbTavernManagerAfterTurn>[0]['executeManagerOnce'] & { supportsSessionToolLoop?: boolean };
    executeManagerOnce.supportsSessionToolLoop = true;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        sessionContract: mergeTavernSessionContract(undefined, {
            memoryArchiving: true,
            cartographyEngine: false,
        }),
        executeManagerOnce,
    });

    assert.equal(result.ok, true);
    assert.equal(calls, 2);
    assert.deepEqual(result.changedStates, []);
    assert.equal((await listTavernStructuredStatePatches({ sessionId: session.id })).length, 0);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.match(JSON.stringify(run?.toolTrace || []), /契约未授权 制图引擎/);
});

test('tavern auto manager denies unauthorized EventPatch without side effects', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Blocked event patch' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '别动野望。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '好的，我只整理记忆。' });
    let calls = 0;

    const executeManagerOnce = (async (options) => {
        calls += 1;
        if (calls === 1) {
            return {
                provider: 'fake-manager',
                model: 'memory-only',
                text: '我先试着建一个野望。',
                toolCalls: [{
                    id: 'blocked-task',
                    name: 'EventPatch',
                    arguments: {
                        op: 'upsert-vision',
                        title: '城东事',
                        vision: '某个野望',
                        doneWhen: '某件事发生',
                        hookForModel: '莉娜提过她母亲一个人住在城东。',
                    },
                }],
            };
        }
        assert.equal(options.toolResponses?.[0]?.name, 'EventPatch');
        assert.match(JSON.stringify(options.toolResponses?.[0]?.response || {}), /契约未授权 织线者/);
        return {
            provider: 'fake-manager',
            model: 'memory-only',
            text: '已跳过未授权野望。',
        };
    }) as Parameters<typeof runXbTavernManagerAfterTurn>[0]['executeManagerOnce'] & { supportsSessionToolLoop?: boolean };
    executeManagerOnce.supportsSessionToolLoop = true;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        sessionContract: mergeTavernSessionContract(undefined, {
            memoryArchiving: true,
            cartographyEngine: false,
            questOrchestration: false,
        }),
        executeManagerOnce,
    });

    assert.equal(result.ok, true);
    assert.equal(calls, 2);
    assert.deepEqual(result.changedTasks, []);
    assert.equal((await listTavernTasks(session.id, { includeCompleted: true, includeAbandoned: true })).length, 0);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.match(JSON.stringify(run?.toolTrace || []), /契约未授权 织线者/);
});

test('tavern manager chat keeps full tool access even when the stored contract disables auto work', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({
        title: 'Manual manager full tools',
        state: {
            contract: mergeTavernSessionContract(undefined, {
                memoryArchiving: false,
                cartographyEngine: false,
            }),
        },
    });
    let calls = 0;
    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '把这件事记到会话记忆里。',
        executeManagerOnce: async (options) => {
            calls += 1;
            if (calls === 1) {
                assert.match(JSON.stringify(options.messages), /Write/);
                return {
                    provider: 'fake-manager',
                    model: 'chat-tools',
                    text: '我直接更新现有记忆。',
                    toolCalls: [{
                        id: 'manual-write',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: '# 会话记忆\n\n手动管理员仍可写入。',
                        },
                    }],
                };
            }
            return {
                provider: 'fake-manager',
                model: 'chat-tools',
                text: '已写入。',
            };
        },
    });

    assert.equal(result.ok, true);
    assert.equal(calls, 2);
    assert.match((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /手动管理员仍可写入/);
});

test('tavern manager stores one preface for parallel tool calls in the same round', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Parallel trace display' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '记录两件事。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她提到北门和银钥匙。' });
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    provider: 'fake-manager',
                    model: 'memory-model',
                    text: '同时写两份档案。',
                    thoughts: [{ label: '归档', text: '同一轮并行工具共享这段思考。' }],
                    toolCalls: [{
                        id: 'write-state-a',
                        name: 'Write',
                        arguments: { filePath: 'memory/state.md', content: '# 会话记忆\n\n北门存在。' },
                    }, {
                        id: 'write-state-b',
                        name: 'Write',
                        arguments: { filePath: 'memory/state.md', content: '# 会话记忆\n\n北门存在，银钥匙在场。' },
                    }],
                };
            }
            return {
                provider: 'fake-manager',
                model: 'memory-model',
                text: '已写入。',
            };
        },
    });

    assert.equal(result.ok, true);
    const run = (await listTavernManagerRuns(session.id))[0];
    const trace = run?.toolTrace as Array<{ preface?: string; thoughts?: unknown[] }>;
    assert.equal(trace?.[0]?.preface, '同时写两份档案。');
    assert.equal(trace?.[1]?.preface, '');
    assert.equal((trace?.[0]?.thoughts || []).length, 1);
    assert.equal((trace?.[1]?.thoughts || []).length, 0);
});

test('tavern manager tool loop follows ebook round budget instead of stopping after eight rounds', async () => {
    await db.delete();
    await db.open();

    assert.equal(MAX_MANAGER_TOOL_ROUNDS, 48);

    const session = await createTavernSession({ title: 'Long manager tool loop' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '把这些线索都整理进去。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她连续列出了九个地点线索。' });
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async () => {
            calls += 1;
            if (calls <= 9) {
                return {
                    provider: 'fake-manager',
                    model: 'memory-model',
                    text: '',
                    toolCalls: [{
                        id: `write-${calls}`,
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: `# 会话记忆\n\n第 ${calls} 条线索。`,
                        },
                    }],
                };
            }
            return {
                provider: 'fake-manager',
                model: 'memory-model',
                text: '九条线索已整理。',
            };
        },
    });

    assert.equal(result.ok, true);
    assert.equal(calls, 10);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.equal(run?.status, 'completed');
    assert.equal((run?.toolTrace as unknown[] | undefined)?.length, 9);
    assert.equal((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content.includes('第 9 条线索'), true);
});

test('tavern manager preserves streamed thoughts and provider tool replay payloads', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Provider replay manager' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '记下北门。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '北门半开，门后有蓝光。' });
    const statePath = 'memory/state.md';
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async (options) => {
            calls += 1;
            if (calls === 1) {
                options.onStreamProgress?.({
                    text: '先记录北门状态。',
                    thoughts: [{ label: 'Gemini 思考', text: '这里有空间状态变化。' }],
                });
                return {
                    provider: 'sillytavern-google',
                    model: 'gemini-test',
                    text: '',
                    providerPayload: {
                        googleContent: {
                            role: 'model',
                            parts: [
                                { thought: true, text: '这里有空间状态变化。', thoughtSignature: 'sig-thought' },
                                { functionCall: { id: 'write-state', name: 'Write', args: { filePath: statePath, content: '# 会话记忆\n\n北门半开，门后有蓝光。' } }, thoughtSignature: 'sig-tool' },
                            ],
                        },
                    },
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: statePath,
                            content: '# 会话记忆\n\n北门半开，门后有蓝光。',
                        },
                    }],
                };
            }
            const replayAssistant = options.messages?.find((message) => message.role === 'assistant' && Array.isArray((message as { tool_calls?: unknown[] }).tool_calls)) as ({ providerPayload?: unknown } | undefined);
            const replayTool = options.messages?.find((message) => message.role === 'tool') as { toolName?: string; tool_call_id?: string } | undefined;
            assert.equal(replayAssistant?.providerPayload && typeof replayAssistant.providerPayload === 'object', true);
            assert.equal((replayTool?.toolName || ''), 'Write');
            assert.equal(replayTool?.tool_call_id, 'write-state');
            return {
                provider: 'sillytavern-google',
                model: 'gemini-test',
                text: '已记录北门。',
            };
        },
    });

    assert.equal(result.ok, true);
    const run = (await listTavernManagerRuns(session.id))[0];
    const trace = run?.toolTrace as Array<Record<string, unknown>>;
    assert.equal(trace?.[0]?.preface, '先记录北门状态。');
    assert.equal(((trace?.[0]?.thoughts as Array<{ text?: string }>) || [])[0]?.text, '这里有空间状态变化。');
});

test('tavern manager chat forwards streamed tool drafts for live manager work status', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager live tool draft' });
    const progress: Array<Record<string, unknown>> = [];
    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '查一下状态。',
        executeManagerOnce: async (options) => {
            options.onStreamProgress?.({
                text: '',
                toolCallDraft: true,
                toolCalls: [{
                    id: 'draft-read',
                    name: 'Read',
                    arguments: { filePath: 'memory/state.md' },
                }],
            });
            return {
                provider: 'fake-manager',
                model: 'memory-model',
                text: '我会先查状态档案。',
            };
        },
        onStreamProgress: (snapshot) => {
            progress.push(snapshot as Record<string, unknown>);
        },
    });

    assert.equal(result.ok, true);
    assert.equal(progress.some((snapshot) => snapshot.toolCallDraft === true), true);
    assert.equal(progress.some((snapshot) => (snapshot.toolCalls as Array<{ name?: string }> | undefined)?.[0]?.name === 'Read'), true);
});

test('tavern manager chat returns segmented protocol messages and keeps final text separate from tool prefaces', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager protocol segmentation' });
    const protocolEvents: string[] = [];
    let calls = 0;
    const executeManagerOnce = Object.assign(async (
        options: Parameters<NonNullable<Parameters<typeof runXbTavernManagerChat>[0]['executeManagerOnce']>>[0],
    ) => {
        calls += 1;
        if (calls === 1) {
            assert.equal(Array.isArray(options.toolResponses), false);
            return {
                provider: 'fake-manager',
                model: 'memory-model',
                text: '我先读一下记忆档案。',
                toolCalls: [{
                    id: 'read-memory',
                    name: 'Read',
                    arguments: { filePath: 'memory/state.md' },
                }],
            };
        }
        if (calls === 2) {
            assert.equal(options.toolResponses?.[0]?.id, 'read-memory');
            assert.equal(options.messages?.length || 0, 0);
            return {
                provider: 'fake-manager',
                model: 'memory-model',
                text: '再核对一下地图。',
                toolCalls: [{
                    id: 'read-world',
                    name: 'MapAtlasRead',
                    arguments: { mode: 'summary' },
                }],
            };
        }
        assert.equal(options.toolResponses?.[0]?.id, 'read-world');
        assert.equal(options.messages?.length || 0, 0);
        return {
            provider: 'fake-manager',
            model: 'memory-model',
            text: '结论：北门仍然半开，没有新的异常。',
        };
    }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernManagerChat>[0]['executeManagerOnce'];

    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '现在北门情况如何？',
        executeManagerOnce,
        onProtocolEvent: (event) => {
            protocolEvents.push(event.type);
        },
    });

    assert.equal(result.ok, true);
    assert.equal(result.text, '结论：北门仍然半开，没有新的异常。');
    assert.equal(result.managerRun.outputText, '结论：北门仍然半开，没有新的异常。');
    assert.deepEqual(result.protocolMessages.map((message) => message.role), ['assistant', 'tool', 'assistant', 'tool', 'assistant']);
    assert.equal(result.protocolMessages[0]?.content, '我先读一下记忆档案。');
    assert.equal(result.protocolMessages[2]?.content, '再核对一下地图。');
    assert.equal(result.protocolMessages[4]?.content, '结论：北门仍然半开，没有新的异常。');
    assert.deepEqual(protocolEvents, [
        'clear_stream_draft',
        'assistant_tool_round',
        'tool_result',
        'clear_stream_draft',
        'assistant_tool_round',
        'tool_result',
        'clear_stream_draft',
        'final_assistant',
    ]);
});

test('tavern manager stores provider tool protocol messages but skips them in later chat prompts', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Persisted manager protocol' });
    await appendTavernManagerMessage(session.id, { role: 'user', content: '读一下北门。' });
    await appendTavernManagerMessage(session.id, {
        role: 'assistant',
        content: '我先查档案。',
        thoughts: [{ label: 'Gemini 思考', text: '需要读取 memory/state.md。' }],
        providerPayload: {
            googleContent: {
                role: 'model',
                parts: [
                    { thought: true, text: '需要读取 memory/state.md。', thoughtSignature: 'sig-read' },
                    { functionCall: { id: 'read-state', name: 'Read', args: { filePath: 'memory/state.md' } }, thoughtSignature: 'sig-tool' },
                ],
            },
        },
        tool_calls: [{
            id: 'read-state',
            type: 'function',
            function: {
                name: 'Read',
                arguments: '{"path":"memory/state.md"}',
            },
        }],
    });
    await appendTavernManagerMessage(session.id, {
        role: 'tool',
        content: '{"ok":true,"content":"北门半开。"}',
        toolCallId: 'read-state',
        toolName: 'Read',
    });
    await appendTavernManagerMessage(session.id, { role: 'assistant', content: '北门半开。' });

    let replayMessages: Array<Record<string, unknown>> = [];
    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '继续判断。',
        executeManagerOnce: async (options) => {
            replayMessages = (options.messages || []) as unknown as Array<Record<string, unknown>>;
            const replayAssistant = replayMessages.find((message) => (
                message.role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length
            ));
            const replayTool = replayMessages.find((message) => message.role === 'tool');
            assert.equal(replayAssistant, undefined);
            assert.equal(replayTool, undefined);
            return { provider: 'fake-manager', model: 'memory-model', text: '已确认。' };
        },
    });

    assert.equal(result.ok, true);
    assert.equal(replayMessages.some((message) => message.role === 'user' && String(message.content || '').includes('读一下北门')), true);
    assert.equal(replayMessages.some((message) => message.role === 'assistant' && message.content === '北门半开。'), true);
});

test('tavern manager uses session toolResponses when runner supports session tool loop', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Session tool loop' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '记下北门。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '北门半开。' });
    let calls = 0;
    const executeManagerOnce = (async (options) => {
        calls += 1;
        if (calls === 1) {
            assert.equal(Array.isArray(options.toolResponses), false);
            return {
                provider: 'sillytavern-google',
                model: 'gemini-test',
                text: '',
                providerPayload: {
                    googleContent: {
                        role: 'model',
                        parts: [
                            { functionCall: { id: 'write-state', name: 'Write', args: { filePath: 'memory/state.md', content: '# 会话记忆\n\n北门半开。' } } },
                        ],
                    },
                },
                toolCalls: [{
                    id: 'write-state',
                    name: 'Write',
                    arguments: {
                        filePath: 'memory/state.md',
                        content: '# 会话记忆\n\n北门半开。',
                    },
                }],
            };
        }
        assert.equal(options.toolResponses?.length, 1);
        assert.equal(options.toolResponses?.[0]?.id, 'write-state');
        assert.equal(options.toolResponses?.[0]?.name, 'Write');
        assert.equal(options.messages?.length || 0, 0);
        return {
            provider: 'sillytavern-google',
            model: 'gemini-test',
            text: '已记录北门。',
        };
    }) as Parameters<typeof runXbTavernManagerAfterTurn>[0]['executeManagerOnce'] & { supportsSessionToolLoop?: boolean };
    executeManagerOnce.supportsSessionToolLoop = true;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce,
    });

    assert.equal(result.ok, true);
    assert.equal(calls, 2);
});

test('accepted-turn tavern manager emits segmented protocol events and persists tool protocol for replay', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'After-turn protocol segmentation' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '我们去北门。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她点头，朝北门走去。' });
    const protocolEvents: string[] = [];
    let calls = 0;
    const executeManagerOnce = Object.assign(async (
        options: Parameters<NonNullable<Parameters<typeof runXbTavernManagerAfterTurn>[0]['executeManagerOnce']>>[0],
    ) => {
        calls += 1;
        if (calls === 1) {
            assert.equal(Array.isArray(options.toolResponses), false);
            return {
                provider: 'fake-manager',
                model: 'memory-model',
                text: '先确认一下地图状态。',
                toolCalls: [{
                    id: 'read-world',
                    name: 'MapAtlasRead',
                    arguments: { mode: 'summary' },
                }],
            };
        }
        assert.equal(options.toolResponses?.[0]?.id, 'read-world');
        assert.equal(options.messages?.length || 0, 0);
        return {
            provider: 'fake-manager',
            model: 'memory-model',
            text: '已确认北门路线，没有额外冲突需要记录。',
        };
    }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernManagerAfterTurn>[0]['executeManagerOnce'];

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce,
        onProtocolEvent: (event) => {
            protocolEvents.push(event.type);
        },
    });

    assert.equal(result.ok, true);
    assert.equal(result.managerRun.outputText, '已确认北门路线，没有额外冲突需要记录。');
    assert.equal(calls, 2);
    const stored = await listTavernManagerMessages(session.id);
    assert.deepEqual(stored.map((message) => message.role), ['assistant', 'tool']);
    assert.equal(stored[0]?.toolCalls?.[0]?.name, 'MapAtlasRead');
    assert.equal(stored[1]?.toolName, 'MapAtlasRead');
    assert.match(stored[1]?.content || '', /"ok":\s*true/);
    assert.deepEqual(protocolEvents, [
        'clear_stream_draft',
        'assistant_tool_round',
        'tool_result',
        'clear_stream_draft',
        'final_assistant',
    ]);
});

test('pending accepted-turn manager persists tool protocol messages for replay', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Pending tool replay' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '我们到北门。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她到了北门。' });
    await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'accepted_turn',
        status: 'pending',
    });
    let calls = 0;
    const executeManagerOnce = Object.assign(async (
        options: Parameters<NonNullable<Parameters<typeof runPendingAcceptedTurnManager>[0]['executeManagerOnce']>>[0],
    ) => {
        calls += 1;
        if (calls === 1) {
            assert.equal(Array.isArray(options.toolResponses), false);
            return {
                provider: 'fake-manager',
                model: 'memory-model',
                text: '先读世界图。',
                toolCalls: [{
                    id: 'read-world',
                    name: 'MapAtlasRead',
                    arguments: { mode: 'summary' },
                }],
            };
        }
        assert.equal(options.toolResponses?.[0]?.id, 'read-world');
        return {
            provider: 'fake-manager',
            model: 'memory-model',
            text: '已确认北门位置。',
        };
    }, { supportsSessionToolLoop: true }) as Parameters<typeof runPendingAcceptedTurnManager>[0]['executeManagerOnce'];

    const result = await runPendingAcceptedTurnManager({
        sessionId: session.id,
        agentConfig: {},
        executeManagerOnce,
    });
    const stored = await listTavernManagerMessages(session.id);

    assert.equal(result?.ok, true);
    assert.equal(calls, 2);
    assert.deepEqual(stored.map((message) => message.role), ['assistant', 'tool']);
    assert.equal(stored[0]?.toolCalls?.[0]?.name, 'MapAtlasRead');
    assert.equal(stored[1]?.toolName, 'MapAtlasRead');
    assert.match(stored[1]?.content || '', /"ok":\s*true/);
});

test('accepted-turn tavern manager prompts for global and character memory without turn-note coverage', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'State and character memory' });
    const currentUser = await appendTavernMessage(session.id, { role: 'user', content: '第三轮。' });
    const currentAssistant = await appendTavernMessage(session.id, { role: 'assistant', content: '第三轮回复。' });
    let managerSystemPrompt = '';
    let managerUserPrompt = '';

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage: currentUser,
        assistantMessage: currentAssistant,
        turn: 3,
        executeManagerOnce: async (options) => {
            managerSystemPrompt = String(options.messages?.[0]?.content || '');
            managerUserPrompt = String(options.messages?.[1]?.content || '');
            return { text: '已检查小记覆盖。' };
        },
    });

    assert.equal(result.ok, true);
    assert.match(managerSystemPrompt, /memory\/state\.md/);
    assert.match(managerSystemPrompt, /memory\/characters\/<name>\.md/);
    assert.match(managerSystemPrompt, /accepted reply actually establishes a new long-term fact/i);
    assert.match(managerUserPrompt, /\[Global memory state\.md\]/);
    assert.match(managerUserPrompt, /\[Character memory filename list\]/);
    assert.doesNotMatch(managerSystemPrompt + managerUserPrompt, /楼层小记覆盖/);
    assert.doesNotMatch(managerSystemPrompt + managerUserPrompt, /建议流水路径/);
    assert.doesNotMatch(managerSystemPrompt + managerUserPrompt, /memory\/turns/);
});

test('tavern manager accepts arbitrary state markdown without schema parsing', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Normalized state markdown' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '继续。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她继续。' });
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    provider: 'fake-manager',
                    model: 'memory-model',
                    text: '',
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: [
                                '# 会话记忆',
                                '',
                                '这份 state 记录没有任何额外固定骨架，但系统仍会按当前消息维护检索元数据。',
                            ].join('\n'),
                        },
                    }],
                };
            }
            return {
                provider: 'fake-manager',
                model: 'memory-model',
                text: '已写入。',
            };
        },
    });

    assert.equal(result.ok, true);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.equal(run?.status, 'completed');
    const file = await getTavernMemoryFile(session.id, 'memory/state.md');
    assert.doesNotMatch(file?.content || '', /messages 0\/1/);
    assert.match(file?.content || '', /固定骨架/);
    assert.notEqual(await getTavernStructuredStateDocument(session.id, 'tavern.map', 'main'), null);
});

test('tavern manager does not roll back just because state markdown has no fixed headings', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Invalid state markdown' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '继续。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她继续。' });
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    provider: 'fake-manager',
                    model: 'memory-model',
                    text: '',
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: [
                                '# 自由记录',
                                '',
                                '这份 state 记录只有一段普通正文。',
                            ].join('\n'),
                        },
                    }],
                };
            }
            return {
                provider: 'fake-manager',
                model: 'memory-model',
                text: '已写入，但格式坏了。',
            };
        },
    });

    assert.equal(result.ok, true);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.equal(run?.status, 'completed');
    assert.equal(run?.error, '');
    assert.match((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /普通正文/);
});

test('tavern manager keeps state markdown as readable file without parsing summary ids', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Bounded manager' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '去码头。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她答应了。' });

    let calls = 0;
    await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 7,
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: [
                                '# 会话记忆',
                                '',
                                '本轮决定去码头。',
                            ].join('\n'),
                        },
                    }],
                };
            }
            return {
                text: '已更新会话记忆。',
            };
        },
    });

    const stateFile = await getTavernMemoryFile(session.id, 'memory/state.md');
    assert.match(stateFile?.content || '', /本轮决定去码头/);
    const grep = await executeTavernMemoryTool(session.id, 'MemoryGrep', {
        pattern: '本轮决定去码头',
        path: 'memory/state.md',
    });
    assert.equal(grep.count, 1);
});

test('tavern manager completes when no current turn memory file is written', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'No tools' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '继续。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她继续。' });

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async () => ({
            provider: 'fake-manager',
            model: 'memory-model',
            text: JSON.stringify({
                turnSummary: {
                    summary: '这段 JSON 不应该被系统代写成 MD。',
                },
            }),
        }),
    });

    const runs = await listTavernManagerRuns(session.id);
    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
    assert.equal(runs[0]?.status, 'completed');
    assert.match(runs[0]?.outputText || '', /不应该被系统代写/);
    assert.equal((await listTavernMemoryFiles(session.id)).some((file) => file.path.startsWith('memory/turns/')), false);
});

test('tavern manager accepts ordinary source message content edits without rollback', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Edited source content' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '原句。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '原回复。' });
    await updateTavernMessage(session.id, assistantMessage.order, { content: '新回复。' });
    let promptText = '';

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async (options) => {
            promptText = JSON.stringify(options.messages);
            return {
                text: JSON.stringify({
                    turnSummary: { summary: '普通内容编辑不撤回。' },
                }),
            };
        },
    });

    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
    assert.match(promptText, /新回复/);
    assert.doesNotMatch(promptText, /原回复/);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.equal(run?.status, 'completed');
    assert.match(run?.outputText || '', /普通内容编辑不撤回/);
});

test('tavern manager cleans image markers from prompt without using content for freshness', async () => {
    await db.delete();
    await db.open();

    const host = globalThis as unknown as {
        localStorage?: { getItem: (key: string) => string | null };
    };
    const previousStorage = host.localStorage;
    host.localStorage = {
        getItem: (key: string) => key === 'summary_panel_config'
            ? JSON.stringify({ textFilterRules: [{ start: '<status>', end: '</status>' }] })
            : null,
    };

    const session = await createTavernSession({ title: 'Image marker freshness' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '原句。\n<status>旧状态栏</status>' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '原回复。\n<state>旧内心状态</state>' });
    await updateTavernMessage(session.id, userMessage.order, { content: '原句。\n```状态栏\n床头柜上有银钥匙。\n```\n<status>状态栏：莉娜站在门边。</status>\n[tavern-image : user-slot]' });
    await updateTavernMessage(session.id, assistantMessage.order, { content: '[img : assistant-slot]\n原回复。\n```state\n她记住了钥匙在床头柜。\n```\n<state>她仍在观察银钥匙。</state>\n[图片 : 完成图]' });
    let promptText = '';

    try {
        const result = await runXbTavernManagerAfterTurn({
            sessionId: session.id,
            agentConfig: {},
            userMessage,
            assistantMessage,
            turn: 1,
            executeManagerOnce: async (options) => {
                promptText = JSON.stringify(options.messages);
                return { text: '只检查图片标记。' };
            },
        });

        const run = (await listTavernManagerRuns(session.id))[0];
        assert.equal(result.ok, true);
        assert.equal(result.error, undefined);
        assert.equal(run?.status, 'completed');
        assert.doesNotMatch(promptText, /tavern-image|\[img\s*:|\[图片\s*:/);
        assert.match(promptText, /床头柜上有银钥匙/);
        assert.match(promptText, /她记住了钥匙在床头柜/);
        assert.match(promptText, /状态栏：莉娜站在门边/);
        assert.match(promptText, /她仍在观察银钥匙/);
    } finally {
        if (previousStorage) {
            host.localStorage = previousStorage;
        } else {
            delete host.localStorage;
        }
    }
});

test('tavern manager keeps written memory when source message content changes mid-run', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Mid-run content edit' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '记录这段。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她把线索放进抽屉。' });
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: '# 会话记忆\n\n这条写入应该保留。',
                        },
                    }],
                };
            }
            await updateTavernMessage(session.id, assistantMessage.order, { content: '她把线索放进抽屉。[tavern-image:slot-1]' });
            return { text: '内容更新不代表撤回剧情。' };
        },
    });

    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
    assert.match((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /应该保留/);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.equal(run?.status, 'completed');
    assert.match(run?.outputText || '', /不代表撤回剧情/);
    const snapshots = await listTavernManagerMemorySnapshots(run?.id || '');
    assert.equal(snapshots.length, 1);
    assert.equal(snapshots[0]?.rollbackStatus, 'pending');
});

test('tavern manager rolls back earlier memory writes when a source message is deleted mid-run', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Mid-run deleted source rollback' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '记录这段。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她把线索放进抽屉。' });
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: '# 会话记忆\n\n这条写入稍后必须回滚。',
                        },
                    }],
                };
            }
            await deleteTavernMessages(session.id, [assistantMessage.order]);
            return {
                text: '',
                toolCalls: [{
                    id: 'write-state',
                    name: 'Write',
                    arguments: {
                        filePath: 'memory/state.md',
                        content: '# State\n\n不应该写到这里。',
                    },
                }],
            };
        },
    });

    assert.equal(result.ok, false);
    assert.equal(result.error, 'manager_source_messages_changed');
    assert.doesNotMatch((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /稍后必须回滚/);
    assert.doesNotMatch((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /不应该写到这里/);
    assert.deepEqual(await listTavernMemorySnapshots(session.id), []);
    await restoreTavernMemoryToFloor(session.id, assistantMessage.order);
    assert.doesNotMatch((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /稍后必须回滚/);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.equal(run?.status, 'rolled_back');
    const snapshots = await listTavernManagerMemorySnapshots(run?.id || '');
    assert.equal(snapshots.length, 1);
    assert.equal(snapshots[0]?.path, 'memory/state.md');
    assert.equal(snapshots[0]?.rollbackStatus, 'rolled_back');
});

test('tavern manager cancellation aborts an active auto run and rolls back written memory', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Active cancel rollback' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '第一轮。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '第一轮回复。' });
    let calls = 0;
    let releaseSecondRound!: () => void;
    let resolveSecondRoundStarted!: () => void;
    const secondRoundGate = new Promise<void>((resolve) => {
        releaseSecondRound = resolve;
    });
    const secondRoundSeen = new Promise<void>((resolve) => {
        resolveSecondRoundStarted = resolve;
    });

    const pending = await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'accepted_turn',
        status: 'pending',
    });
    const running = runPendingAcceptedTurnManager({
        sessionId: session.id,
        agentConfig: {},
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: '# 会话记忆\n\n会被取消的旧管理员写入。',
                        },
                    }],
                };
            }
            resolveSecondRoundStarted();
            await secondRoundGate;
            return { text: '如果没有检查 abort，这里会错误完成。' };
        },
    });

    await secondRoundSeen;
    const rollback = await cancelAndRollbackXbTavernManagersForMessageRange(session.id, assistantMessage.order);
    assert.equal(rollback.rolledBack, 1);
    assert.doesNotMatch((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /会被取消/);
    releaseSecondRound();
    const completed = await running;

    assert.equal(completed?.ok, false);
    assert.notEqual(completed?.managerRun.status, 'completed');
    assert.doesNotMatch((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /会被取消/);
    assert.deepEqual(await listTavernMemorySnapshots(session.id), []);
    await restoreTavernMemoryToFloor(session.id, assistantMessage.order);
    assert.doesNotMatch((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /会被取消/);
    const run = (await listTavernManagerRuns(session.id)).find((item) => item.id === pending.id);
    assert.equal(run?.status, 'rolled_back');
});

test('tavern manager rollback uses snapshots even when changedFiles were not finalized', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Snapshot truth' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '第一轮。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '第一轮回复。' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'after_turn',
        status: 'running',
        changedFiles: [],
    });

    const writeResult = await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: '# 尚未 finalize\n\nchangedFiles 还没落库。',
    }, {
        caller: 'auto',
        managerRunId: run.id,
    });
    assert.equal(writeResult.ok, true);

    const rollback = await rollbackManagerRunsForMessageRange(session.id, assistantMessage.order);

    assert.equal(rollback.rolledBack, 1);
    assert.doesNotMatch((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /尚未 finalize/);
    assert.deepEqual(await listTavernMemorySnapshots(session.id), []);
    await restoreTavernMemoryToFloor(session.id, assistantMessage.order);
    assert.doesNotMatch((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '', /尚未 finalize/);
    assert.equal((await listTavernManagerRuns(session.id))[0]?.status, 'rolled_back');
});

test('tavern manager rollback cancels pending accepted-turn runs without rollback writes', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Pending accepted rollback' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '第一轮。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '第一轮回复。' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'accepted_turn',
        status: 'pending',
    });

    const rollback = await rollbackManagerRunsForMessageRange(session.id, assistantMessage.order);

    assert.deepEqual(rollback.runIds, [run.id]);
    assert.equal(rollback.rolledBack, 0);
    assert.deepEqual(rollback.conflicts, []);
    const updated = (await listTavernManagerRuns(session.id)).find((item) => item.id === run.id);
    assert.equal(updated?.status, 'cancelled');
    assert.equal(updated?.error, 'manager_source_messages_superseded');
});

test('rollback impact treats pending accepted-turn runs as cancellable work, not state rollback', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Pending rollback impact' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '第一轮。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '第一轮回复。' });
    await ensureTavernMemoryDefaults(session.id);
    await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'accepted_turn',
        status: 'pending',
    });

    const [memoryImpact, taskImpact, managerImpact] = await Promise.all([
        describeTavernMemoryRestoreImpact(session.id, assistantMessage.order - 1),
        describeTavernTaskRestoreImpact(session.id, assistantMessage.order - 1),
        describeXbTavernManagerRollbackImpactForMessageRange(session.id, assistantMessage.order),
    ]);

    assert.equal(memoryImpact.changed, false);
    assert.equal(taskImpact.changed, false);
    assert.equal(managerImpact.pendingRuns, 1);
    assert.equal(managerImpact.hasWrittenState, false);
});

test('memory rollback impact reports same-path content changes in changedPaths', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Memory impact changed paths' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '第一轮回复。' });
    await ensureTavernMemoryDefaults(session.id);
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n基线内容。', { source: 'manager' });
    await saveAcceptedStateSnapshot(session.id, assistantMessage.order);
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n改写后的内容。', { source: 'manager' });

    const impact = await describeTavernMemoryRestoreImpact(session.id, assistantMessage.order);

    assert.equal(impact.changed, true);
    assert.deepEqual(impact.changedPaths, ['memory/state.md']);
});

test('rollback impact ignores old manager writes once current memory and tasks already match the target floor', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Rollback impact target match' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '第一轮。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '第一轮回复。' });

    await ensureTavernMemoryDefaults(session.id);
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\n原始状态。', { source: 'manager' });
    await saveAcceptedStateSnapshot(session.id, assistantMessage.order);

    const run = await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'after_turn',
        status: 'completed',
    });

    const memoryWrite = await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: '# 会话记忆\n\n稍后会被恢复的临时状态。',
    }, {
        managerRunId: run.id,
        sourceUserOrder: userMessage.order,
        sourceAssistantOrder: assistantMessage.order,
    });
    assert.equal(memoryWrite.ok, true);

    const taskWrite = await executeTavernTaskTool(session.id, 'EventPatch', {
        op: 'upsert-vision',
        eventId: 'impact-task',
        title: '临时线',
        vision: '临时远景',
        doneWhen: '临时完成条件。',
        hookForModel: '临时软句。',
    }, {
        caller: 'chat',
        managerRunId: run.id,
        sourceAssistantOrder: assistantMessage.order,
    });
    assert.equal(taskWrite.ok, true);

    await restoreTavernMemoryToFloor(session.id, assistantMessage.order);
    await restoreTavernTasksToFloor(session.id, assistantMessage.order);

    const [memoryImpact, taskImpact, managerImpact] = await Promise.all([
        describeTavernMemoryRestoreImpact(session.id, assistantMessage.order),
        describeTavernTaskRestoreImpact(session.id, assistantMessage.order),
        describeXbTavernManagerRollbackImpactForMessageRange(session.id, assistantMessage.order),
    ]);

    assert.equal(memoryImpact.changed, false);
    assert.equal(taskImpact.changed, false);
    assert.equal(managerImpact.hasWrittenState, true);
    assert.equal(managerImpact.writtenMemoryFiles, 1);
    assert.equal(managerImpact.writtenTaskRuns, 1);
});

test('rollback impact reports status-only manager writes as state rollback', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Status rollback impact' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '第一轮。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '第一轮回复。' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'after_turn',
        status: 'completed',
    });

    const write = await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, {
        document: {
            meta: { activeSubject: 'user' },
            subjects: [{
                id: 'user',
                name: '测试角色',
                tabs: [{
                    id: 'overview',
                    label: '概览',
                    blocks: [{
                        id: 'stats',
                        title: '属性',
                        form: 'gauge',
                        fields: [{ id: 'san', name: '理智', value: 50, max: 100 }],
                    }],
                }],
            }],
        },
    }, {
        caller: 'auto',
        managerRunId: run.id,
        sourceUserOrder: userMessage.order,
        sourceAssistantOrder: assistantMessage.order,
    });
    assert.equal(write.ok, true);

    const managerImpact = await describeXbTavernManagerRollbackImpactForMessageRange(session.id, assistantMessage.order);

    assert.equal(managerImpact.hasWrittenState, true);
    assert.equal(managerImpact.writtenMemoryFiles, 0);
    assert.equal(managerImpact.writtenTaskRuns, 0);
    assert.equal(managerImpact.writtenStatusPatches, 1);
    assert.deepEqual(rollbackImpactLines({
        targetFloor: assistantMessage.order - 1,
        memory: { changed: false, currentFileCount: 0, targetFileCount: 0, changedPaths: [] },
        tasks: { changed: false, currentTaskCount: 0, targetTaskCount: 0 },
        status: { changed: true, currentExists: true, targetExists: false },
        managers: managerImpact,
        willRollbackState: true,
        willCancelWork: false,
    }), [`状态栏会恢复到第 ${assistantMessage.order} 楼后的状态。`]);
});

test('tavern manager memory rollback is idempotent', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Idempotent rollback' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '第一轮。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '第一轮回复。' });
    const run = await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'after_turn',
        status: 'completed',
        changedFiles: ['memory/state.md'],
    });
    await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: '# 可重复回滚\n\n第一次回滚后第二次不应冲突。',
    }, {
        caller: 'auto',
        managerRunId: run.id,
    });

    const first = await rollbackManagerRunsForMessageRange(session.id, assistantMessage.order);
    const second = await rollbackManagerRunsForMessageRange(session.id, assistantMessage.order);

    assert.equal(first.rolledBack, 1);
    assert.equal(second.rolledBack, 0);
    assert.deepEqual(second.conflicts, []);
    const snapshot = (await listTavernManagerMemorySnapshots(run.id))[0];
    assert.equal(snapshot?.rollbackStatus, 'rolled_back');
});

test('tavern manager rollback does not overwrite user-edited memory conflicts', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Rollback conflict' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '第一轮。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '第一轮回复。' });
    await ensureTavernMemoryDefaults(session.id);
    const before = (await getTavernMemoryFile(session.id, 'memory/state.md'))?.content || '';
    const run = await createTavernManagerRun({
        sessionId: session.id,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'after_turn',
        status: 'completed',
        changedFiles: ['memory/state.md'],
    });

    const writeResult = await executeTavernMemoryTool(session.id, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: `${before}\n\n管理员写入。`,
    }, {
        caller: 'auto',
        managerRunId: run.id,
    });
    assert.equal(writeResult.ok, true);
    await writeTavernMemoryFile(session.id, 'memory/state.md', '用户手动修正。', { source: 'user' });

    const rollback = await rollbackManagerRunsForMessageRange(session.id, assistantMessage.order);

    assert.deepEqual(rollback.conflicts, ['memory/state.md']);
    assert.equal((await getTavernMemoryFile(session.id, 'memory/state.md'))?.content, '用户手动修正。');
    const snapshot = (await listTavernManagerMemorySnapshots(run.id))[0];
    assert.equal(snapshot?.rollbackStatus, 'conflict');
    assert.equal((await listTavernManagerRuns(session.id))[0]?.status, 'rolled_back');
    assert.match((await getTavernMemoryIndex(session.id))?.error || '', /rollback_conflict:memory\/state\.md/);
});

test('tavern manager keeps raw output when no current memory file is written', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Bad JSON' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '继续。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她继续。' });

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async () => ({
            provider: 'fake-manager',
            model: 'memory-model',
            text: '这不是 JSON',
        }),
    });

    const runs = await listTavernManagerRuns(session.id);
    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
    assert.equal(runs[0]?.status, 'completed');
    assert.equal(runs[0]?.outputText, '这不是 JSON');
    assert.equal(runs[0]?.provider, 'fake-manager');
    assert.equal(runs[0]?.model, 'memory-model');
    assert.equal((await listTavernMemoryFiles(session.id)).some((file) => file.path.startsWith('memory/turns/')), false);
});

test('tavern manager keeps auto run completed when a non-critical tool call fails', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Tool failure' });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '藏好钥匙。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '她把钥匙藏好。' });
    let calls = 0;

    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: {},
        userMessage,
        assistantMessage,
        turn: 1,
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: [
                                '# 会话记忆',
                                '',
                                '钥匙已经藏好。',
                            ].join('\n'),
                        },
                    }, {
                        id: 'bad-read',
                        name: 'Read',
                        arguments: {
                            filePath: 'book/state.md',
                        },
                    }],
                };
            }
            return { text: '已更新。' };
        },
    });

    const runs = await listTavernManagerRuns(session.id);
    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
    assert.equal(runs[0]?.status, 'completed');
    assert.deepEqual(runs[0]?.changedFiles, ['memory/state.md']);
    assert.notEqual(await getTavernMemoryFile(session.id, 'memory/state.md'), null);
    assert.equal((runs[0]?.toolTrace as Array<{ ok?: boolean }>).some((item) => item.ok === false), true);
});

test('tavern manager chat carries persisted manager history and can read RP raw text through Read', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager chat history' });
    await appendTavernMessage(session.id, { role: 'user', content: '上一轮原文。' });
    await appendTavernMessage(session.id, { role: 'assistant', content: '上一轮回复。' });
    await appendTavernManagerMessage(session.id, { role: 'user', content: '先前问：这段关系现在到哪了？' });
    await appendTavernManagerMessage(session.id, { role: 'assistant', content: '先前答：还在试探阶段。' });

    let firstRoundMessages = '';
    let toolNames: string[] = [];
    let calls = 0;
    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '继续看原文，帮我判断。',
        executeManagerOnce: async (options) => {
            calls += 1;
            firstRoundMessages = firstRoundMessages || JSON.stringify(options.messages);
            toolNames = Array.isArray(options.tools)
                ? options.tools.map((tool) => String((tool as { function?: { name?: string } }).function?.name || ''))
                : [];
            if (calls === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'chat-history',
                        name: 'Read',
                        arguments: {
                            filePath: 'chat/transcript.md',
                            tail: 6,
                        },
                    }],
                };
            }
            return {
                text: '我已经读了原文，也保留了管理员自己的上下文。',
            };
        },
    });

    assert.equal(result.ok, true);
    const firstMessages = JSON.parse(firstRoundMessages) as Array<{ role?: string; content?: string }>;
    assert.equal(firstMessages[0]?.role, 'system');
    assert.match(firstMessages[0]?.content || '', /# Backstage Manager — LittleWhiteTavern/);
    assert.match(firstRoundMessages, /先前问：这段关系现在到哪了/);
    assert.match(firstRoundMessages, /先前答：还在试探阶段/);
    assert.match(firstRoundMessages, /继续看原文，帮我判断/);
    assert.equal(toolNames.includes('Read'), true);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.equal(Array.isArray(run?.toolTrace), true);
    assert.equal((run?.toolTrace as Array<{ name?: string }>)[0]?.name, 'Read');
});

test('tavern manager chat treats local tool failures as recoverable trace items', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager chat guard' });
    let calls = 0;
    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '帮我直接改 turns。',
        executeManagerOnce: async () => {
            calls += 1;
            if (calls === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'write-turn',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/turns/20260601-0000.md',
                            content: '# 手动写入流水',
                        },
                    }],
                };
            }
            return { text: '流水文件不能直接写，我已说明原因。' };
        },
    });

    assert.equal(result.ok, true);
    assert.equal(result.error, undefined);
    assert.equal((await listTavernMemoryFiles(session.id)).some((file) => file.path.startsWith('memory/turns/')), false);
    const run = (await listTavernManagerRuns(session.id))[0];
    assert.equal(run?.status, 'completed');
    assert.match(run?.outputText || '', /不能直接写/);
    assert.equal((run?.toolTrace as Array<{ ok?: boolean; error?: string }>)?.[0]?.ok, false);
    assert.equal((run?.toolTrace as Array<{ ok?: boolean; error?: string }>)?.[0]?.error, 'memory_path_invalid');
});

test('tavern manager chat returns invalid tool arguments without executing the tool', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager invalid tool args' });
    let calls = 0;
    let secondRoundToolResult = '';
    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '尝试坏参数。',
        executeManagerOnce: async (options) => {
            calls += 1;
            if (calls === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'bad-map-args',
                        name: 'MapPatch',
                        arguments: '[]',
                    }],
                };
            }
            secondRoundToolResult = String(options.messages?.find((message) => message.role === 'tool')?.content || '');
            return { text: 'MapPatch 参数不是对象，我已停止执行。' };
        },
    });
    const toolResult = JSON.parse(result.protocolMessages.find((message) => message.role === 'tool')?.content || '{}');
    const storedArgs = JSON.parse(result.protocolMessages.find((message) => message.role === 'assistant')?.toolCalls?.[0]?.arguments || '{}');

    assert.equal(result.ok, true);
    assert.equal(calls, 2);
    assert.equal(toolResult.ok, false);
    assert.equal(toolResult.error, 'invalid_tool_arguments');
    assert.match(toolResult.schemaHint, /MapPatch is advanced\/internal/i);
    assert.equal(storedArgs.invalidToolArguments, true);
    assert.match(secondRoundToolResult, /invalid_tool_arguments/);
    assert.equal((await listTavernStructuredStatePatches({ sessionId: session.id })).length, 0);
});

test('tavern manager chat keeps protocol messages when aborted after a tool result', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager abort protocol' });
    const controller = new AbortController();
    let calls = 0;
    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '读地图后停止。',
        signal: controller.signal,
        executeManagerOnce: async () => {
            calls += 1;
            return {
                text: '先读地图。',
                toolCalls: [{
                    id: 'read-map-before-abort',
                    name: 'MapInspect',
                    arguments: { docType: 'tavern.map', docId: 'main', mode: 'summary' },
                }],
            };
        },
        onProtocolEvent: (event) => {
            if (event.type === 'tool_result') {
                controller.abort();
            }
        },
    });

    assert.equal(result.ok, false);
    assert.equal(result.error, 'manager_aborted');
    assert.equal(calls, 1);
    assert.deepEqual(result.protocolMessages.map((message) => message.role), ['assistant', 'tool']);
    assert.equal(result.protocolMessages[0]?.toolCalls?.[0]?.name, 'MapInspect');
    assert.match(result.protocolMessages[1]?.content || '', /"ok": true/);
    assert.equal(result.managerRun.status, 'cancelled');
});

test('tavern manager chat injects a light brake after repeated MapPatch failures', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager light brake' });
    let calls = 0;
    let brakePrompt = '';
    const badPatchCall = {
        id: 'bad-map-patch',
        name: 'MapPatch',
        arguments: {
            ops: [{
                op: 'add',
                element: { id: 'bad-line', cat: 'road', path: [] as Array<[number, number]> },
            }],
        },
    };
    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '画个地图。',
        executeManagerOnce: async (options) => {
            calls += 1;
            if (calls <= 3) {
                return {
                    text: '尝试写地图。',
                    toolCalls: [badPatchCall],
                };
            }
            brakePrompt = JSON.stringify(options.messages || []);
            return { text: 'MapPatch 连续失败，我已停止重复。' };
        },
    });

    assert.equal(result.ok, true);
    assert.equal(calls, 4);
    assert.match(brakePrompt, /工具失败提示/);
    assert.match(brakePrompt, /MapAtlasRead \+ MapSceneEdit/);
});

test('tavern manager chat keeps session tool responses when light brake triggers', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager session light brake' });
    let calls = 0;
    let hintedToolResponse = '';
    const badPatchCall = {
        id: 'bad-map-patch-session',
        name: 'MapPatch',
        arguments: {
            ops: [{
                op: 'add',
                element: { id: 'bad-session-line', cat: 'road', path: [] as Array<[number, number]> },
            }],
        },
    };
    const executeManagerOnce = Object.assign(async (
        options: Parameters<NonNullable<Parameters<typeof runXbTavernManagerChat>[0]['executeManagerOnce']>>[0],
    ) => {
        calls += 1;
        if (calls > 1) {
            assert.equal(options.toolResponses?.[0]?.name, 'MapPatch');
        }
        if (calls <= 3) {
            return {
                text: '尝试写地图。',
                toolCalls: [badPatchCall],
            };
        }
        hintedToolResponse = JSON.stringify(options.toolResponses?.[0]?.response || {});
        return { text: 'MapPatch 连续失败，我已停止重复。' };
    }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernManagerChat>[0]['executeManagerOnce'];

    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '画个地图。',
        executeManagerOnce,
    });

    assert.equal(result.ok, true);
    assert.equal(calls, 4);
    assert.match(hintedToolResponse, /lightBrakeHint/);
    assert.match(hintedToolResponse, /MapAtlasRead \+ MapSceneEdit/);
});

test('tavern manager messages are session-scoped', async () => {
    await db.delete();
    await db.open();

    const first = await createTavernSession({ title: 'Manager A' });
    const second = await createTavernSession({ title: 'Manager B' });
    await appendTavernManagerMessage(first.id, { role: 'user', content: 'A-1' });
    await appendTavernManagerMessage(first.id, { role: 'assistant', content: 'A-2' });
    await appendTavernManagerMessage(second.id, { role: 'user', content: 'B-1' });

    assert.deepEqual((await listTavernManagerMessages(first.id)).map((message) => message.content), ['A-1', 'A-2']);
    assert.deepEqual((await listTavernManagerMessages(second.id)).map((message) => message.content), ['B-1']);
});

test('tavern manager message update reuses one timestamp for row and session', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager timestamp' });
    const message = await appendTavernManagerMessage(session.id, { role: 'assistant', content: '旧内容。' });
    const originalNow = Date.now;
    let tick = 1000;
    Date.now = () => {
        tick += 1;
        return tick;
    };
    try {
        const updated = await updateTavernManagerMessage(session.id, message.order, { content: '新内容。' });
        const refreshedSession = await getTavernSession(session.id);
        assert.equal(updated?.updatedAt, refreshedSession?.updatedAt);
    } finally {
        Date.now = originalNow;
    }
});

test('tavern manager message edit can clear stale provider protocol payloads', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Manager protocol edit' });
    const message = await appendTavernManagerMessage(session.id, {
        role: 'assistant',
        content: '旧内容。',
        providerPayload: {
            googleContent: {
                role: 'model',
                parts: [{ text: '旧内容。' }],
            },
        },
        tool_calls: [{
            id: 'old-tool',
            type: 'function',
            function: {
                name: 'Read',
                arguments: '{"path":"memory/state.md"}',
            },
        }],
    });

    const updated = await updateTavernManagerMessage(session.id, message.order, {
        content: '新内容。',
        clearProtocolPayload: true,
    });

    assert.equal(updated?.content, '新内容。');
    assert.equal(updated?.providerPayload, undefined);
    assert.equal(updated?.toolCalls, undefined);
    assert.equal(updated?.toolCallId, undefined);
    assert.equal(updated?.toolName, undefined);
});

test('tavern manager chat does not replay stale tool drafts from errored history messages', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Stale manager draft' });
    const user = await appendTavernManagerMessage(session.id, {
        role: 'user',
        content: '停一下。',
    });
    const staleAssistant = await appendTavernManagerMessage(session.id, {
        role: 'assistant',
        content: 'provider failed',
        error: true,
        finishReason: 'error',
        toolCalls: [{
            id: 'draft-read',
            name: 'Read',
            arguments: '{"path":"memory/state.md"}',
        }],
    });
    let replayMessages: unknown[] = [];

    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: {},
        question: '现在状态如何？',
        history: [user, staleAssistant],
        executeManagerOnce: async (options) => {
            replayMessages = options.messages || [];
            return { text: '可以继续。', provider: 'fake-manager', model: 'memory-model' };
        },
    });

    const assistantReplay = (replayMessages as Array<Record<string, unknown>>).find((message) => (
        message.role === 'assistant' && message.content === 'provider failed'
    ));
    assert.equal(result.ok, true);
    assert.equal(assistantReplay, undefined);
});
