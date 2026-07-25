import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

import db, {
    appendTavernMessage,
    createTavernTurnStateSnapshot,
    createTavernManagerRun,
    createTavernSession,
    getTavernManagerCandidate,
    getTavernSession,
    listTavernManagerMemorySnapshots,
    listTavernManagerRuns,
    listTavernMessages,
    updateTavernSessionState,
    updateTavernMessage,
} from '../shared/session-db';
import {
    executeTavernMemoryTool,
    getTavernMemoryFile,
    getTavernMemoryIndex,
    getTavernManagerToolDefinitions,
    listTavernMemorySnapshots,
    writeTavernMemoryFile,
} from '../shared/memory-files';
import { executeTavernStateTool } from '../shared/structured-state';
import { createDefaultXbTavernPreset } from '../shared/presets';
import type { XbTavernMessage } from '../shared/message-assembler';
import { buildTavernManagerSystemPrompt } from '../shared/assistant-presets';
import { ACTION_CHECK_TOOL_NAME } from '../shared/action-checks';
import {
    buildXbTavernMemoryIgnoredTerms,
    buildXbTavernMemoryQuery,
    selectXbTavernMemoryContext,
} from '../shared/memory-retrieval';
import { mergeTavernSessionContract } from '../shared/session-contract';
import {
    CHANCE_ENCOUNTER_LABEL,
    createActionCheckEvent,
    getActionCheckEvents,
    getChanceEncounterEvent,
    injectActionCheckRenderMarkers,
} from '../shared/runtime-events';
import {
    buildContextHistory,
    buildTavernRequestSnapshot,
    loadTavernPromptHistoryWindow,
    resolveTavernContextWindow,
    runTavernOnce,
    runXbTavernTurn as runXbTavernTurnRuntime,
    simulateXbTavernRequest as simulateXbTavernRequestRuntime,
    TAVERN_LOCAL_PROMPT_MESSAGES,
    trimFinalAssistantMessageEnd,
    waitForQueuedAcceptedTurnManagers,
    type XbTavernRunTurnInput,
    type XbTavernSimulateRequestInput,
    type XbTavernRunResult,
    type TavernRunOnceOptions,
} from '../app-src/runtime/run-once';
import {
    runXbTavernManagerAfterTurn,
    type XbTavernManagerOnceOptions,
} from '../app-src/runtime/manager';
import { runXbTavernAssistantChat as runXbTavernManagerChat } from '../app-src/runtime/assistant-chat-runner';
import { getTavilySearchToolDefinition, TAVILY_TOOL_NAME } from '../../agent-core/tavily-search.js';
import { executeTavernStatusTool, TAVERN_STATUS_TOOL_NAMES } from '../shared/status-state';
import {
    appendSentTavernCommunicationMessage,
    completeTavernCommunicationReply,
    createTavernCommunicationContact,
} from '../shared/communications';
import { createXbTavernAgentRuntime, EMPTY_XB_TAVERN_CAPABILITY_REGISTRY } from '../app-src/runtime/agent-runtime';
import { resolveXbTavernProviderConfig } from '../app-src/runtime/provider';
import type { TavernApplyRegexItem } from '../shared/regex';
import type { TavernSubstituteParamsItem } from '../shared/substitute-params';
import { replaceTavernTaskBoard } from '../shared/tasks/task-board';
import { acceptTavernTaskListing } from '../shared/tasks/task-service';
import { TAVERN_TASK_TOOL_NAMES } from '../shared/tasks/task-tools';
import type { TavernTaskListing, TavernTaskVersionRecord } from '../shared/tasks/task-types';
import { captureTavernPhoneBoundary } from '../shared/phone-boundary';
import {
    activateTavernShopItem,
    getCurrentTavernShopState,
    purchaseTavernShopItem,
} from '../shared/shop/shop-service';

async function resetDb() {
    await waitForQueuedAcceptedTurnManagers();
    await db.delete();
    await db.open();
}

function makeContextWindowMessage(order: number, role: string, content = `message-${order}`) {
    return {
        messageId: `window-message-${order}`,
        sessionId: 'window-test',
        order,
        role,
        content,
        createdAt: order + 1,
    };
}

const identityApplyRegex = async (items: TavernApplyRegexItem[]) => ({
    items: items.map((item) => ({
        id: item.id,
        text: item.text,
        changed: false,
    })),
    changedCount: 0,
});

const identityApplySubstituteParams = async (items: TavernSubstituteParamsItem[]) => ({
    items: items.map((item) => ({
        id: item.id,
        text: item.text,
        changed: false,
    })),
    changedCount: 0,
});

function createLocalTestNativePrompt(): NonNullable<XbTavernRunTurnInput['buildNativeChatPrompt']> {
    return async (input) => {
        const messages = input[TAVERN_LOCAL_PROMPT_MESSAGES] || [];
        return {
            source: 'test-local-prompt',
            promptMessageCount: messages.length,
            messages,
            currentUserMessageIndex: messages.findIndex((message) => (
                message.role === 'user' && message.content === input.currentUserMessage
            )),
        };
    };
}

function withDefaultNativePromptHooks<T extends XbTavernRunTurnInput | XbTavernSimulateRequestInput>(input: T): T {
    return {
        applyRegex: identityApplyRegex,
        applySubstituteParams: identityApplySubstituteParams,
        buildNativeChatPrompt: createLocalTestNativePrompt(),
        ...input,
    };
}

function runTurnTaskListings(): TavernTaskListing[] {
    const rows = [
        ['E', 10],
        ['D', 25],
        ['C', 60],
        ['B', 180],
        ['A', 400],
        ['S', 900],
    ] as const;
    return rows.map(([grade, reward], index) => ({
        id: `runtime-listing-${index + 1}`,
        grade,
        tags: [`runtime-tag-${index + 1}`],
        title: `运行时委托 ${index + 1}`,
        issuer: {
            id: `runtime-issuer-${index + 1}`,
            name: `陌生发布者 ${index + 1}`,
            description: `发布者描述 ${index + 1}`,
        },
        hook: `异常钩子 ${index + 1}`,
        objective: `完成运行时目标 ${index + 1}`,
        location: `地点 ${index + 1}`,
        risk: `风险 ${index + 1}`,
        reward,
    }));
}

async function createRunTurnActiveTask(sessionId: string, suffix: string): Promise<TavernTaskVersionRecord> {
    const board = await replaceTavernTaskBoard({
        sessionId,
        expectedRevision: 0,
        expectedEpoch: 1,
        boundary: null,
        generationId: `runtime-board-${suffix}`,
        listings: runTurnTaskListings(),
    });
    return await acceptTavernTaskListing({
        sessionId,
        boardId: board.generationId,
        boardRevision: board.revision,
        boardEpoch: board.epoch,
        listingId: board.listings[2].id,
        boundary: null,
        actionId: `runtime-accept-${suffix}`,
        taskId: `runtime-task-${suffix}`,
        playerName: '测试玩家',
    });
}

function runXbTavernTurn(input: XbTavernRunTurnInput): Promise<XbTavernRunResult> {
    return runXbTavernTurnRuntime(withDefaultNativePromptHooks(input));
}

function simulateXbTavernRequest(input: XbTavernSimulateRequestInput) {
    return simulateXbTavernRequestRuntime(withDefaultNativePromptHooks(input));
}

test('local native prompt fixtures are symbol keyed and never enter host JSON payloads', () => {
    const payload = {
        currentUserMessage: 'hello',
        [TAVERN_LOCAL_PROMPT_MESSAGES]: [{ role: 'user', content: 'large local prompt' }],
    };
    assert.equal(JSON.stringify(payload), '{"currentUserMessage":"hello"}');
});

function createPromptStatusDocument() {
    return {
        meta: { revision: 0, activeSubject: 'user' },
        subjects: [{
            id: 'user',
            name: '阿瑟',
            subtitle: '私家侦探',
            icon: 'person',
            tabs: [{
                id: 'overview',
                label: '概览',
                blocks: [{
                    id: 'stats',
                    title: '核心值',
                    form: 'gauge',
                    fields: [
                        { id: 'san', name: '理智', value: 62, min: 0, max: 99, step: 1, display: 'bar', accent: true },
                    ],
                }, {
                    id: 'conditions',
                    title: '状态',
                    form: 'tag',
                    fields: [
                        { id: 'wet', label: '衣物湿透', kind: 'state' },
                    ],
                }, {
                    id: 'items',
                    title: '持有物',
                    form: 'item',
                    layout: 'grid',
                    fields: [
                        { id: 'lamp', name: '煤油灯', qty: 1, key: true, slot: '右手', lore: '灯芯还剩一半。', icon: 'local_fire_department' },
                    ],
                }, {
                    id: 'scene',
                    title: '当前情境',
                    form: 'text',
                    fields: [
                        { id: 'now', name: '位置', value: '站在档案室门口。' },
                    ],
                }],
            }],
        }],
    };
}

test('xb tavern run turn saves user and assistant messages and updates session state', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster', description: 'Pilot.' },
            user: { name: 'Player' },
            worldBooks: [{
                name: 'Lore',
                entries: [{
                    uid: 'sticky-entry',
                    content: 'Station lore.',
                    constant: true,
                    sticky: 2,
                }],
            }],
        },
        preset,
        currentUserMessage: 'Hello.',
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Hi from Aster.',
            provider: 'fake-provider',
            model: 'fake-model',
            finishReason: 'stop',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                provider: 'fake-provider',
                model: 'fake-model',
            }),
        }),
    });

    assert.equal(result.error, undefined);
    assert.equal(result.previewMatchesRequest, true);
    assert.equal(result.nextTurn, 1);
    assert.equal(result.requestSnapshot.provider, 'fake-provider');
    assert.equal(result.requestSnapshot.model, 'fake-model');
    assert.equal(result.requestSnapshot.presetName, '默认');
    const messages = await listTavernMessages(result.sessionId);
    assert.deepEqual(messages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(messages[1]?.content, 'Hi from Aster.');
    assert.equal(messages[1]?.provider, 'fake-provider');
    assert.equal(messages[1]?.model, 'fake-model');
    assert.equal(messages[1]?.finishReason, 'stop');
    const session = await getTavernSession(result.sessionId);
    assert.equal(session?.state?.turn, 1);
    assert.equal(Object.keys(session?.state?.worldEntryStates || {}).some((key) => key.includes('sticky-entry')), true);
    assert.equal(session?.state?.lastProvider, 'fake-provider');
});
test('xb tavern provider requests trim only the last assistant message content end', () => {
    type ProviderMessage = Parameters<typeof trimFinalAssistantMessageEnd>[0][number];
    const cases: Array<{
        name: string;
        messages: ProviderMessage[];
        expected: ProviderMessage[];
    }> = [
        {
            name: 'assistant at end',
            messages: [
                { role: 'user', content: 'hello' },
                { role: 'assistant', content: 'prefill \n\t' },
            ],
            expected: [
                { role: 'user', content: 'hello' },
                { role: 'assistant', content: 'prefill' },
            ],
        },
        {
            name: 'assistant followed by system',
            messages: [
                { role: 'system', content: '<meta_protocol>' },
                { role: 'assistant', content: 'prefill \n\t' },
                { role: 'system', content: '</meta_protocol>' },
            ],
            expected: [
                { role: 'system', content: '<meta_protocol>' },
                { role: 'assistant', content: 'prefill' },
                { role: 'system', content: '</meta_protocol>' },
            ],
        },
        {
            name: 'assistant followed by user',
            messages: [
                { role: 'assistant', content: 'history prefill \n\t' },
                { role: 'user', content: 'current turn' },
            ],
            expected: [
                { role: 'assistant', content: 'history prefill' },
                { role: 'user', content: 'current turn' },
            ],
        },
        {
            name: 'system before assistant',
            messages: [
                { role: 'system', content: 'rules' },
                { role: 'assistant', content: 'prefill \n\t' },
            ],
            expected: [
                { role: 'system', content: 'rules' },
                { role: 'assistant', content: 'prefill' },
            ],
        },
        {
            name: 'multiple assistants',
            messages: [
                { role: 'assistant', content: 'history \n\t' },
                { role: 'user', content: 'continue' },
                { role: 'assistant', content: 'prefill \n\t' },
                { role: 'system', content: 'tail marker' },
            ],
            expected: [
                { role: 'assistant', content: 'history \n\t' },
                { role: 'user', content: 'continue' },
                { role: 'assistant', content: 'prefill' },
                { role: 'system', content: 'tail marker' },
            ],
        },
        {
            name: 'no assistant',
            messages: [
                { role: 'system', content: 'rules \n\t' },
                { role: 'user', content: 'hello \n\t' },
            ],
            expected: [
                { role: 'system', content: 'rules \n\t' },
                { role: 'user', content: 'hello \n\t' },
            ],
        },
    ];

    for (const item of cases) {
        assert.deepEqual(trimFinalAssistantMessageEnd(item.messages), item.expected, item.name);
    }
});

test('xb tavern request snapshot exposes prompt diagnostics outside provider request payload', () => {
    const snapshot = buildTavernRequestSnapshot(
        { provider: 'fake-provider', model: 'fake-model' },
        [{ role: 'user', content: 'hello' }],
        {
            promptDiagnostics: {
                nativePrompt: {
                    nativeInputHistoryCount: 2,
                    nativeMatchedHistoryCount: 0,
                },
            },
            requestInspection: {
                provider: 'fake-provider',
                model: 'fake-model',
                transport: 'fake',
                request: {
                    body: {
                        messages: [{ role: 'user', content: 'hello' }],
                    },
                },
            },
        },
    );
    const raw = JSON.parse(snapshot.rawRequestJson) as {
        promptDiagnostics?: unknown;
        request?: { body?: Record<string, unknown> };
    };
    assert.deepEqual(snapshot.promptDiagnostics, {
        nativePrompt: {
            nativeInputHistoryCount: 2,
            nativeMatchedHistoryCount: 0,
        },
    });
    assert.deepEqual(raw.promptDiagnostics, snapshot.promptDiagnostics);
    assert.equal(raw.request?.body?.promptDiagnostics, undefined);
});

test('xb tavern run turn skips random encounters when contract disables them', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let rawMessages = '';
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Keep the road quiet.',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                randomEncounters: false,
            }),
        },
        randomEncounterRoll: () => 0,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            rawMessages = JSON.stringify(options.messages);
            return {
                text: 'No encounter.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    const [userMessage] = await listTavernMessages(result.sessionId);
    assert.deepEqual(userMessage?.runtimeEvents, []);
    assert.doesNotMatch(rawMessages, /Chance Encounter Triggered/);
});

test('xb tavern run turn injects chance encounter as D1 before action-check protocol and afterHistory', async () => {
    await resetDb();
    const presetBase = createDefaultXbTavernPreset();
    const preset = {
        ...presetBase,
        sections: [
            ...(presetBase.sections || []),
            {
                id: 'after-history-sentinel',
                label: 'After History Sentinel',
                placement: 'afterHistory' as const,
                role: 'system' as const,
                content: 'AFTER_HISTORY_SENTINEL',
            },
        ],
    };
    let requestMessages: Array<{ role: string; content: string }> = [];
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Step into the clearing.',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: true,
            }),
        },
        randomEncounterRoll: () => 0.05,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            requestMessages = options.messages.map((message) => ({
                role: message.role,
                content: message.content,
            }));
            return {
                text: 'The wind shifts.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    const [userMessage] = await listTavernMessages(result.sessionId);
    assert.equal(getChanceEncounterEvent(userMessage?.runtimeEvents)?.label, CHANCE_ENCOUNTER_LABEL);
    const userIndex = requestMessages.findIndex((message) => message.role === 'user' && message.content.includes('Step into the clearing.'));
    const eventIndex = requestMessages.findIndex((message) => message.role === 'system' && message.content.includes('Chance Encounter Triggered'));
    const protocolIndex = requestMessages.findIndex((message) => message.role === 'system' && message.content.includes('Runtime Protocol: Action Checks'));
    const afterHistoryIndex = requestMessages.findIndex((message) => message.content.includes('AFTER_HISTORY_SENTINEL'));
    assert.ok(userIndex >= 0);
    assert.ok(eventIndex >= 0);
    assert.ok(eventIndex < userIndex);
    assert.match(requestMessages[eventIndex]?.content || '', /Chance Encounter Triggered/);
    assert.doesNotMatch(requestMessages[eventIndex]?.content || '', /<world_info_depth/);
    assert.ok(protocolIndex > userIndex);
    assert.ok(afterHistoryIndex > protocolIndex);
});

test('xb tavern run turn sends the same ST-native prompt shape used by simulation', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Native prompt real send',
        characterKey: 'char-native',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-native', name: 'Aster', description: 'Pilot.' },
        },
        state: {
            contract: mergeTavernSessionContract(undefined, {
                memoryArchiving: true,
                statusPanel: true,
                actionChecks: true,
                randomEncounters: true,
            }),
        },
    });
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nNATIVE_MEMORY_NOTE', { source: 'user' });
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, {
        document: createPromptStatusDocument(),
    });
    let nativeInput: { chatPreset?: unknown; memoryPrompt?: string; chancePrompt?: string; actionCheckPrompt?: string } | null = null;
    let sentMessages: Array<{ role?: string; content?: string }> = [];

    const result = await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'Recall NATIVE_MEMORY_NOTE and enter the clearing.',
        randomEncounterRoll: () => 0.05,
        applyRegex: identityApplyRegex,
        applySubstituteParams: identityApplySubstituteParams,
        buildNativeChatPrompt: async (input) => {
            nativeInput = input;
            return {
                source: 'test-native-builder',
                promptMessageCount: 1,
                messages: [{ role: 'assistant', content: 'NATIVE_MESSAGE \n\t' }],
                currentUserMessageIndex: null,
            };
        },
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            sentMessages = options.messages.map((message) => ({
                role: message.role,
                content: message.content,
            }));
            return {
                text: 'Native answer.',
                provider: 'fake-provider',
                model: 'fake-model',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    assert.deepEqual(sentMessages, [{ role: 'assistant', content: 'NATIVE_MESSAGE' }]);
    assert.equal(result.buildResult.messages[0]?.content, 'NATIVE_MESSAGE');
    assert.equal(result.requestSnapshot.rawMessagesJson.includes('NATIVE_MESSAGE \\n'), false);
    assert.equal(result.requestSnapshot.rawRequestJson.includes('NATIVE_MESSAGE \\n'), false);
    assert.equal((nativeInput?.chatPreset as { name?: string } | undefined)?.name, preset.name);
    assert.match(nativeInput?.memoryPrompt || '', /NATIVE_MEMORY_NOTE/);
    assert.match(nativeInput?.memoryPrompt || '', /## 状态栏/);
    assert.match(nativeInput?.memoryPrompt || '', /status_panel:/);
    assert.match(nativeInput?.memoryPrompt || '', /name: 理智/);
    assert.match(nativeInput?.memoryPrompt || '', /value: 62/);
    assert.doesNotMatch(nativeInput?.memoryPrompt || '', /\bid:|revision|docType|docId|icon|display|accent|layout/);
    assert.match(nativeInput?.chancePrompt || '', /Chance Encounter Triggered/);
    assert.match(nativeInput?.actionCheckPrompt || '', /Runtime Protocol: Action Checks/);
    assert.equal(getChanceEncounterEvent(result.userMessage.runtimeEvents)?.label, CHANCE_ENCOUNTER_LABEL);
});

test('xb tavern queued accepted-turn manager runs independently from the current send signal', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const managerContract = mergeTavernSessionContract(undefined, {
        memoryArchiving: true,
    });

    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-signal', name: 'Aster', description: 'Pilot.' },
        },
        preset,
        runtimeState: {
            contract: managerContract,
        },
        currentUserMessage: '上一轮。',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '上一轮回复。',
            provider: 'fake-provider',
            model: 'fake-model',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce: async () => {
            throw new Error('first turn manager must not run yet');
        },
    });
    assert.deepEqual((await listTavernMessages(first.sessionId)).map((message) => message.role), ['user', 'assistant']);

    assert.equal(first.managerStatus, '');
    assert.equal(first.managerRunId, '');
    const firstCandidate = await getTavernManagerCandidate(first.sessionId);
    assert.ok(firstCandidate);
    const controller = new AbortController();
    let managerCalls = 0;
    let managerSignalAbortedAfterCurrentAbort = false;
    let markManagerStarted!: () => void;
    const managerStarted = new Promise<void>((resolve) => {
        markManagerStarted = resolve;
    });
    let releaseManager!: () => void;
    const managerRelease = new Promise<void>((resolve) => {
        releaseManager = resolve;
    });
    const turnPromise = runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-signal', name: 'Aster', description: 'Pilot.' },
        },
        preset,
        signal: controller.signal,
        currentUserMessage: '下一轮继续。',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            await new Promise<void>((resolve) => {
                if (options.signal?.aborted) {
                    resolve();
                    return;
                }
                options.signal?.addEventListener('abort', () => resolve(), { once: true });
            });
            const error = new Error('current turn aborted');
            error.name = 'AbortError';
            throw error;
        },
        executeManagerOnce: async (options) => {
            managerCalls += 1;
            markManagerStarted();
            await managerRelease;
            managerSignalAbortedAfterCurrentAbort = options.signal?.aborted === true;
            if (managerCalls === 1) {
                return {
                    text: 'pending manager completed after current turn abort.',
                    provider: 'fake-provider',
                    model: 'fake-model',
                };
            }
            return {
                text: 'extra pending manager completed.',
                provider: 'fake-provider',
                model: 'fake-model',
            };
        },
    });
    await managerStarted;
    controller.abort();
    const result = await turnPromise;

    assert.equal(result.error, '已停止生成。');
    let runs = await listTavernManagerRuns(first.sessionId);
    assert.equal(runs.find((run) => run.id === firstCandidate?.id)?.status, 'running');
    releaseManager();
    await waitForQueuedAcceptedTurnManagers(first.sessionId);
    assert.equal(managerSignalAbortedAfterCurrentAbort, false);
    assert.equal(managerCalls, 1);
    assert.doesNotMatch((await getTavernMemoryFile(first.sessionId, 'memory/state.md'))?.content || '', /pending 维护被当前停止打断/);
    runs = await listTavernManagerRuns(first.sessionId);
    assert.equal(runs.find((run) => run.id === firstCandidate?.id)?.status, 'completed');
    assert.deepEqual(await listTavernManagerMemorySnapshots(firstCandidate?.id || ''), []);

    const next = await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-signal', name: 'Aster', description: 'Pilot.' },
        },
        preset,
        currentUserMessage: '再继续。',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '这次正常继续。',
            provider: 'fake-provider',
            model: 'fake-model',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce: async () => {
            managerCalls += 1;
            return {
                text: 'new pending manager completed.',
                provider: 'fake-provider',
                model: 'fake-model',
            };
        },
    });
    assert.equal(next.error, undefined);
    assert.equal(next.managerStatus, '');
    assert.equal(next.managerRunId, '');
    runs = await listTavernManagerRuns(first.sessionId);
    assert.equal(runs.find((run) => run.id === firstCandidate?.id)?.status, 'completed');
    const nextCandidate = await getTavernManagerCandidate(first.sessionId);
    assert.equal(nextCandidate?.userOrder, next.userMessage.order);
    assert.equal(nextCandidate?.assistantOrder, next.assistantMessage?.order);
});

test('active formal tasks still create and run an accepted manager when every contract domain is disabled', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const disabledContract = mergeTavernSessionContract(undefined, {
        memoryArchiving: false,
        cartographyEngine: false,
        statusPanel: false,
        actionChecks: false,
        randomEncounters: false,
    });
    const session = await createTavernSession({
        title: 'Task-only accepted manager',
        characterKey: 'char-task-only',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-task-only', name: 'Aster', description: 'A courier.' },
            user: { name: '测试玩家' },
        },
        state: { contract: disabledContract },
    });
    const task = await createRunTurnActiveTask(session.id, 'task-only-manager');
    let managerCalls = 0;
    let managerPrompt = '';
    let managerToolNames: string[] = [];
    const executeManagerOnce = async (options: XbTavernManagerOnceOptions) => {
        managerCalls += 1;
        managerPrompt = JSON.stringify(options.messages);
        managerToolNames = (options.tools || [])
            .map((tool) => String((tool as { function?: { name?: string } }).function?.name || ''))
            .filter(Boolean);
        return {
            text: '本轮任务证据不足，无需改变任务。',
            provider: 'fake-provider',
            model: 'fake-model',
        };
    };
    const executeRunOnce = async (options: TavernRunOnceOptions) => ({
        text: '剧情继续。',
        provider: 'fake-provider',
        model: 'fake-model',
        requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
    });

    const first = await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '先观察交付地点。',
        runManager: true,
        executeRunOnce,
        executeManagerOnce,
    });
    const candidate = await getTavernManagerCandidate(session.id);
    assert.ok(candidate);
    assert.equal(candidate?.assistantOrder, first.assistantMessage?.order);
    assert.equal(managerCalls, 0);

    await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '继续潜入。',
        runManager: true,
        executeRunOnce,
        executeManagerOnce,
    });
    await waitForQueuedAcceptedTurnManagers(session.id);

    const completedRun = (await listTavernManagerRuns(session.id)).find((run) => run.id === candidate?.id);
    const taskToolNames = new Set<string>(Object.values(TAVERN_TASK_TOOL_NAMES));
    assert.equal(managerCalls, 1);
    assert.equal(completedRun?.status, 'completed');
    assert.match(managerPrompt, new RegExp(task.taskId));
    assert.deepEqual(managerToolNames.filter((name) => taskToolNames.has(name)).sort(), [...taskToolNames].sort());
});

test('xb tavern session author note reaches native prompt for real and simulated requests', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Author note session',
        characterKey: 'char-note',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-note', name: 'Aster', description: 'Pilot.' },
            authorNote: {
                prompt: 'PLAYER_AUTHOR_NOTE',
                interval: 1,
                position: 1,
                depth: 4,
                role: 0,
                scan: false,
            },
        },
    });

    let realNativeAuthorNote: unknown = null;
    let realMessages: Array<{ role?: string; content?: string }> = [];
    await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'Use the note.',
        applyRegex: identityApplyRegex,
        applySubstituteParams: identityApplySubstituteParams,
        buildNativeChatPrompt: async (input) => {
            realNativeAuthorNote = input.context?.authorNote;
            return {
                source: 'test-native-builder',
                promptMessageCount: 1,
                messages: [{ role: 'system', content: String((input.context?.authorNote as { prompt?: string } | undefined)?.prompt || '') }],
                currentUserMessageIndex: null,
            };
        },
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            realMessages = options.messages.map((message) => ({ role: message.role, content: message.content }));
            return {
                text: 'Done.',
                provider: 'fake-provider',
                model: 'fake-model',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    assert.equal((realNativeAuthorNote as { prompt?: string } | null)?.prompt, 'PLAYER_AUTHOR_NOTE');
    assert.deepEqual(realMessages, [{ role: 'system', content: 'PLAYER_AUTHOR_NOTE' }]);

    const simulated = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': { model: 'fake-model' },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'Preview the note.',
        applyRegex: identityApplyRegex,
        applySubstituteParams: identityApplySubstituteParams,
        buildNativeChatPrompt: async (input) => ({
            source: 'test-native-builder',
            promptMessageCount: 1,
            messages: [{ role: 'system', content: String((input.context?.authorNote as { prompt?: string } | undefined)?.prompt || '') }],
            currentUserMessageIndex: null,
        }),
    });
    assert.match(simulated.requestSnapshot.rawMessagesJson || '', /PLAYER_AUTHOR_NOTE/);
    assert.match(simulated.requestSnapshot.rawRequestJson || '', /PLAYER_AUTHOR_NOTE/);
});

test('xb tavern author note world scan can activate local worldbook without consuming chat depth', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Author note scan session',
        characterKey: 'char-note-scan',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-note-scan', name: 'Aster', description: 'Pilot.' },
            authorNote: {
                prompt: 'NOTE_SCAN_KEY',
                interval: 1,
                position: 1,
                depth: 4,
                role: 0,
                scan: true,
            },
            worldEntries: [
                { uid: 'note-entry', content: 'Author note triggered lore.', key: ['NOTE_SCAN_KEY'], order: 10 },
                { uid: 'chat-entry', content: 'Current chat triggered lore.', key: ['current-chat-key'], order: 20 },
                { uid: 'old-entry', content: 'Old chat lore.', key: ['old-chat-key'], order: 30 },
            ],
        },
    });
    const simulated = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': { model: 'fake-model' },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'current-chat-key',
        runtimeState: {
            worldSettings: {
                scanDepth: 1,
            },
        },
    });

    assert.equal(simulated.buildResult.meta.scanText, 'current-chat-key');
    assert.deepEqual(simulated.buildResult.activatedWorldEntries.map((entry) => entry.uid).sort(), ['chat-entry', 'note-entry']);
    assert.match(simulated.requestSnapshot.rawMessagesJson || '', /Author note triggered lore/);
    assert.match(simulated.requestSnapshot.rawMessagesJson || '', /Current chat triggered lore/);
    assert.doesNotMatch(simulated.requestSnapshot.rawMessagesJson || '', /Old chat lore/);
});

test('xb tavern rerun reuses an existing chance encounter without rerolling', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Keep watch.',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                randomEncounters: true,
            }),
        },
        randomEncounterRoll: () => 0.05,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'First answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });

    let rollCalls = 0;
    let rerunRawMessages = '';
    await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                randomEncounters: true,
            }),
        },
        randomEncounterRoll: () => {
            rollCalls += 1;
            return 0.95;
        },
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            rerunRawMessages = JSON.stringify(options.messages);
            return {
                text: 'Second answer.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    const [userMessage] = await listTavernMessages(first.sessionId);
    assert.equal(userMessage?.runtimeEvents?.length, 1);
    assert.equal(rollCalls, 0);
    assert.match(rerunRawMessages, /Chance Encounter Triggered/);
});

test('xb tavern random encounter cooldown skips the next two new user turns and allows the one after', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const runtimeState = {
        contract: mergeTavernSessionContract(undefined, {
            randomEncounters: true,
        }),
    };
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Turn one.',
        runtimeState,
        randomEncounterRoll: () => 0.05,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'First answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Turn two.',
        runtimeState,
        randomEncounterRoll: () => 0.05,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Second answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Turn three.',
        runtimeState,
        randomEncounterRoll: () => 0.05,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Third answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Turn four.',
        runtimeState,
        randomEncounterRoll: () => 0.05,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Fourth answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });

    const userMessages = (await listTavernMessages(first.sessionId)).filter((message) => message.role === 'user');
    assert.equal(userMessages[0]?.runtimeEvents?.length, 1);
    assert.equal(userMessages[1]?.runtimeEvents?.length, 0);
    assert.equal(userMessages[2]?.runtimeEvents?.length, 0);
    assert.equal(userMessages[3]?.runtimeEvents?.length, 1);
});

test('xb tavern edited rerun can reroll runtime events on the reused user message', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const runtimeState = {
        contract: mergeTavernSessionContract(undefined, {
            randomEncounters: true,
        }),
    };
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Original turn.',
        runtimeState,
        randomEncounterRoll: () => 0.05,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Original answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });

    const [storedUser] = await listTavernMessages(first.sessionId);
    assert.ok(storedUser);
    await updateTavernMessage(first.sessionId, storedUser.order, {
        content: 'Edited turn.',
        runtimeEvents: [],
    });

    let rerunRawMessages = '';
    await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        rerollRuntimeEvents: true,
        runtimeState,
        randomEncounterRoll: () => 0.05,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            rerunRawMessages = JSON.stringify(options.messages);
            return {
                text: 'Edited answer.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    const [updatedUser] = await listTavernMessages(first.sessionId);
    assert.equal(updatedUser?.content, 'Edited turn.');
    assert.equal(updatedUser?.runtimeEvents?.length, 1);
    assert.match(rerunRawMessages, /Chance Encounter Triggered/);
});

test('xb tavern run turn does not inject action-check protocol or tools when contract disables it', async () => {
    await resetDb();
    const presetBase = createDefaultXbTavernPreset();
    const preset = {
        ...presetBase,
        sections: [
            ...(presetBase.sections || []),
            {
                id: 'after-history-sentinel',
                label: 'After History Sentinel',
                placement: 'afterHistory' as const,
                role: 'system' as const,
                content: 'AFTER_HISTORY_SENTINEL',
            },
        ],
    };
    let rawMessages = '';
    let exposedTools: unknown[] = [];
    await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我想撬开这扇门。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: false,
                randomEncounters: false,
            }),
        },
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            rawMessages = JSON.stringify(options.messages);
            exposedTools = Array.isArray(options.tools) ? options.tools : [];
            return {
                text: '她抬手试了试门把。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    assert.equal(exposedTools.length, 0);
    assert.doesNotMatch(rawMessages, /Runtime Protocol: Action Checks/);
    assert.doesNotMatch(rawMessages, /AFTER_HISTORY_SENTINEL.+Runtime Protocol: Action Checks/);
});

test('xb tavern run turn injects action-check protocol after current user and exposes ActionCheck tool', async () => {
    await resetDb();
    const presetBase = createDefaultXbTavernPreset();
    const preset = {
        ...presetBase,
        sections: [
            ...(presetBase.sections || []),
            {
                id: 'after-history-sentinel',
                label: 'After History Sentinel',
                placement: 'afterHistory' as const,
                role: 'system' as const,
                content: 'AFTER_HISTORY_SENTINEL',
            },
        ],
    };
    let requestMessages: Array<{ role: string; content: string }> = [];
    let exposedToolNames: string[] = [];
    await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我想撬开这扇门。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            requestMessages = options.messages.map((message) => ({
                role: message.role,
                content: message.content,
            }));
            exposedToolNames = (Array.isArray(options.tools) ? options.tools : [])
                .map((tool) => String((tool as { function?: { name?: string } })?.function?.name || ''))
                .filter(Boolean);
            return {
                text: '她先观察锁孔的磨损。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    requestTask: {
                        messages: options.messages,
                        tools: options.tools,
                        toolChoice: options.toolChoice,
                    },
                }),
            };
        },
    });

    const userIndex = requestMessages.findIndex((message) => message.role === 'user' && message.content.includes('我想撬开这扇门'));
    const protocolIndex = requestMessages.findIndex((message) => message.role === 'system' && message.content.includes('Runtime Protocol: Action Checks'));
    const afterHistoryIndex = requestMessages.findIndex((message) => message.content.includes('AFTER_HISTORY_SENTINEL'));
    assert.ok(userIndex >= 0);
    assert.ok(protocolIndex > userIndex);
    assert.ok(afterHistoryIndex > protocolIndex);
    const protocolContent = requestMessages[protocolIndex]?.content || '';
    assert.match(protocolContent, /overwhelming advantage/);
    assert.match(protocolContent, /Consensual or natural intimacy/);
    assert.match(protocolContent, /How to call the tool \(Before the roll\):/);
    assert.match(protocolContent, /before narrating any consequence or assuming the outcome/);
    assert.match(protocolContent, /How to narrate the outcome \(After the roll\):/);
    assert.match(protocolContent, /pick up exactly where the attempted action paused/);
    assert.match(protocolContent, /do not restart headers, speaker labels, thinking formats/);
    assert.match(protocolContent, /Do not step out of character to comment on the dice or the tool/);
    assert.match(protocolContent, /On Critical Success or Critical Failure, push the result further/);
    assert.doesNotMatch(protocolContent, /How to narrate:/);
    assert.doesNotMatch(protocolContent, /Choose the stat that best fits the action from the status panel/);
    assert.doesNotMatch(protocolContent, /Difficulty levels: `easy`, `ordinary`, `hard`, `very_hard`, `nearly_impossible`/);
    assert.deepEqual(exposedToolNames, [ACTION_CHECK_TOOL_NAME]);
});

test('xb tavern run turn injects status panel yaml without exposing status tools to RP', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Status prompt',
        characterKey: 'char-status',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-status', name: 'Aster' },
        },
        state: {
            contract: mergeTavernSessionContract(undefined, {
                statusPanel: true,
                actionChecks: true,
                randomEncounters: false,
            }),
        },
    });
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, {
        document: createPromptStatusDocument(),
    });

    let rawMessages = '';
    let exposedToolNames: string[] = [];
    await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '我看看自己的状态。',
        applyRegex: identityApplyRegex,
        applySubstituteParams: identityApplySubstituteParams,
        buildNativeChatPrompt: async (input) => ({
            source: 'test-native-builder',
            promptMessageCount: 2,
            messages: [
                { role: 'system', content: input.memoryPrompt || '' },
                { role: 'user', content: input.currentUserMessage || '' },
            ],
            currentUserMessageIndex: 1,
        }),
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            rawMessages = JSON.stringify(options.messages);
            exposedToolNames = (Array.isArray(options.tools) ? options.tools : [])
                .map((tool) => String((tool as { function?: { name?: string } })?.function?.name || ''))
                .filter(Boolean);
            return {
                text: '你短暂确认了一下自己的状态。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    requestTask: {
                        messages: options.messages,
                        tools: options.tools,
                        toolChoice: options.toolChoice,
                    },
                }),
            };
        },
    });

    assert.match(rawMessages, /## 状态栏/);
    assert.match(rawMessages, /status_panel/);
    assert.match(rawMessages, /name: 阿瑟/);
    assert.match(rawMessages, /subtitle: 私家侦探/);
    assert.match(rawMessages, /title: 核心值/);
    assert.match(rawMessages, /form: gauge/);
    assert.match(rawMessages, /name: 理智/);
    assert.match(rawMessages, /value: 62/);
    assert.match(rawMessages, /label: 衣物湿透/);
    assert.match(rawMessages, /name: 煤油灯/);
    assert.match(rawMessages, /lore: 灯芯还剩一半。/);
    assert.match(rawMessages, /value: 站在档案室门口。/);
    assert.doesNotMatch(rawMessages, /\bid:|revision|docType|docId|icon|display|accent|layout|activeSubject/);
    assert.deepEqual(exposedToolNames, [ACTION_CHECK_TOOL_NAME]);
});

test('xb tavern action check uses status panel gauge when stat matches', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Status action check',
        characterKey: 'char-status-check',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-status-check', name: 'Aster' },
        },
        state: {
            contract: mergeTavernSessionContract(undefined, {
                statusPanel: true,
                actionChecks: true,
                randomEncounters: false,
            }),
        },
    });
    await executeTavernStatusTool(session.id, TAVERN_STATUS_TOOL_NAMES.INIT, {
        document: createPromptStatusDocument(),
    });

    let requestCount = 0;
    let exposedToolNames: string[] = [];
    const executeRunOnce = Object.assign(async (options: TavernRunOnceOptions) => {
        requestCount += 1;
        if (requestCount === 1) {
            exposedToolNames = (Array.isArray(options.tools) ? options.tools : [])
                .map((tool) => String((tool as { function?: { name?: string } })?.function?.name || ''))
                .filter(Boolean);
            return {
                text: '阿瑟屏住呼吸，逼自己盯住门缝里的冷光。 ',
                toolCalls: [{
                    id: 'status-check-1',
                    name: ACTION_CHECK_TOOL_NAME,
                    arguments: JSON.stringify({
                        action: '稳住心神观察冷光',
                        stat: '理智',
                        difficulty: 'hard',
                    }),
                }],
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    requestTask: {
                        messages: options.messages,
                        tools: options.tools,
                        toolChoice: options.toolChoice,
                    },
                }),
            };
        }
        const response = options.toolResponses?.[0]?.response as Record<string, unknown> | undefined;
        assert.equal(response?.mode, 'statusGauge');
        assert.equal(response?.difficultyLabel, 'hard');
        assert.equal(response?.difficulty, 15);
        assert.equal(response?.roll, 43);
        assert.equal(response?.threshold, 43);
        assert.equal(response?.statValue, 62);
        assert.equal(response?.statMax, 99);
        assert.equal(response?.success, true);
        return {
            text: '他稳住了，没有被那点冷光牵着走。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                requestTask: {
                    messages: options.messages,
                    toolResponses: options.toolResponses,
                },
            }),
        };
    }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'];

    await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '我盯着门缝里的光。',
        actionCheckRoll: () => 1,
        actionCheckPercentRoll: () => 43,
        applyRegex: identityApplyRegex,
        applySubstituteParams: identityApplySubstituteParams,
        buildNativeChatPrompt: async (input) => ({
            source: 'test-native-builder',
            promptMessageCount: 2,
            messages: [
                { role: 'system', content: [input.memoryPrompt || '', input.actionCheckPrompt || ''].filter(Boolean).join('\n\n') },
                { role: 'user', content: input.currentUserMessage || '' },
            ],
            currentUserMessageIndex: 1,
        }),
        executeRunOnce,
    });

    const messages = await listTavernMessages(session.id);
    const assistantEvents = getActionCheckEvents(messages[1]?.runtimeEvents);
    assert.deepEqual(exposedToolNames, [ACTION_CHECK_TOOL_NAME]);
    assert.equal(assistantEvents.length, 1);
    assert.equal(assistantEvents[0]?.mode, 'statusGauge');
    assert.equal(assistantEvents[0]?.difficultyLabel, 'hard');
    assert.equal(assistantEvents[0]?.difficulty, 15);
    assert.equal(assistantEvents[0]?.roll, 43);
    assert.equal(assistantEvents[0]?.threshold, 43);
    assert.equal(assistantEvents[0]?.statValue, 62);
    assert.equal(assistantEvents[0]?.statMax, 99);
    assert.equal(assistantEvents[0]?.success, true);
    assert.equal(assistantEvents[0]?.outcome, 'success');
});

test('xb tavern run turn executes multiple action checks and persists assistant runtime events', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const rolls = [16, 12];
    let requestCount = 0;
    const executeRunOnce = Object.assign(async (options: TavernRunOnceOptions) => {
        requestCount += 1;
        if (requestCount === 1) {
            return {
                text: '她猛地跃向断桥彼端。 ',
                toolCalls: [{
                    id: 'check-1',
                    name: ACTION_CHECK_TOOL_NAME,
                    arguments: JSON.stringify({
                        action: 'Leap across the broken bridge',
                        stat: 'Agility',
                        difficulty: 14,
                    }),
                }, {
                    id: 'check-2',
                    name: ACTION_CHECK_TOOL_NAME,
                    arguments: JSON.stringify({
                        action: 'Catch the far stone lip',
                        stat: 'Grip',
                        difficulty: 10,
                    }),
                }],
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    requestTask: {
                        messages: options.messages,
                        tools: options.tools,
                        toolChoice: options.toolChoice,
                    },
                }),
            };
        }
        assert.equal(options.toolResponses?.length, 2);
        assert.equal(options.messages.length, 0);
        return {
            text: '落点稳住，手指也死死扣进了石缝。',
            finishReason: 'stop',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                requestTask: {
                    messages: options.messages,
                    tools: options.tools,
                    toolResponses: options.toolResponses,
                },
            }),
        };
    }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'];
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我跳过去，然后抓住对岸石沿。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => rolls.shift() || 1,
        executeRunOnce,
    });

    assert.equal(requestCount, 2);
    const messages = await listTavernMessages(result.sessionId);
    const assistantEvents = getActionCheckEvents(messages[1]?.runtimeEvents);
    assert.equal(assistantEvents.length, 2);
    assert.equal(assistantEvents[0]?.roll, 16);
    assert.equal(assistantEvents[0]?.success, true);
    assert.equal(assistantEvents[1]?.roll, 12);
    assert.equal(assistantEvents[1]?.success, true);
    assert.equal(assistantEvents[0]?.insertAfterChars, assistantEvents[1]?.insertAfterChars);
    assert.match(messages[1]?.content || '', /她猛地跃向断桥彼端/);
    assert.match(messages[1]?.content || '', /落点稳住/);
});

test('xb tavern action checks can anchor the dice card before already-written consequence text', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我揍他一顿。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => 7,
        executeRunOnce: Object.assign(async (options: TavernRunOnceOptions) => {
            if (!options.toolResponses?.length) {
                return {
                    text: '我揍一顿噢哎呀没揍到',
                    toolCalls: [{
                        id: 'check-anchor',
                        name: ACTION_CHECK_TOOL_NAME,
                        arguments: JSON.stringify({
                            action: 'Punch the guard',
                            stat: '力量',
                            difficulty: 12,
                            insertAfter: '我揍一顿噢',
                        }),
                    }],
                    requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
                };
            }
            return {
                text: '，对方趁势向后撤开半步。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'],
    });

    const messages = await listTavernMessages(result.sessionId);
    const assistantEvents = getActionCheckEvents(messages[1]?.runtimeEvents);
    assert.equal(assistantEvents.length, 1);
    assert.equal(assistantEvents[0]?.insertAfterChars, '我揍一顿噢'.length);
    assert.equal((messages[1]?.content || '').slice(0, assistantEvents[0]?.insertAfterChars || 0), '我揍一顿噢');
    assert.match((messages[1]?.content || '').slice(assistantEvents[0]?.insertAfterChars || 0), /^哎呀没揍到/);
});

test('xb tavern action checks keep live dice visible even when the model calls the tool before any preface text', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const liveSnapshots: Array<{ text: string; eventCount: number }> = [];
    let requestCount = 0;
    await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我立刻翻过窗台。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => 18,
        onStreamProgress: (snapshot) => {
            liveSnapshots.push({
                text: String(snapshot.text || ''),
                eventCount: Array.isArray(snapshot.liveActionCheckEvents) ? snapshot.liveActionCheckEvents.length : 0,
            });
        },
        executeRunOnce: Object.assign(async (options: TavernRunOnceOptions) => {
            requestCount += 1;
            if (requestCount === 1) {
                return {
                    text: '',
                    toolCalls: [{
                        id: 'check-preface-free',
                        name: ACTION_CHECK_TOOL_NAME,
                        arguments: JSON.stringify({
                            action: 'Vault through the window',
                            stat: 'Agility',
                            difficulty: 13,
                        }),
                    }],
                    requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
                };
            }
            assert.equal(options.messages.length, 0);
            assert.equal(options.toolResponses?.[0]?.id, 'check-preface-free');
            return {
                text: '她一撑窗沿，顺势翻进了室内。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'],
    });

    assert.equal(requestCount, 2);
    assert.equal(liveSnapshots.some((snapshot) => snapshot.text === '' && snapshot.eventCount === 1), true);
});

test('xb tavern action checks stream cumulative text across tool rounds', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const streamed: string[] = [];
    const liveEventCounts: number[] = [];
    let requestCount = 0;
    await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我试着撬锁，然后推门。 ',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => 17,
        onStreamProgress: (snapshot) => {
            if (typeof snapshot.text === 'string') {
                streamed.push(snapshot.text);
            }
            if (Array.isArray(snapshot.liveActionCheckEvents)) {
                liveEventCounts.push(snapshot.liveActionCheckEvents.length);
            }
        },
        executeRunOnce: Object.assign(async (options: TavernRunOnceOptions) => {
            requestCount += 1;
            if (requestCount === 1) {
                options.onStreamProgress?.({ text: '她把铁丝探进锁孔。 ' });
                return {
                    text: '她把铁丝探进锁孔。 ',
                    toolCalls: [{
                        id: 'check-stream',
                        name: ACTION_CHECK_TOOL_NAME,
                        arguments: JSON.stringify({
                            action: 'Pick the lock',
                            stat: 'Finesse',
                            difficulty: 12,
                        }),
                    }],
                    requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
                };
            }
            assert.equal(options.messages.length, 0);
            options.onStreamProgress?.({ text: '门闩一松，她顺势推门而入。' });
            return {
                text: '门闩一松，她顺势推门而入。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'],
    });

    assert.deepEqual(streamed, [
        '她把铁丝探进锁孔。 ',
        '她把铁丝探进锁孔。 ',
        '她把铁丝探进锁孔。 门闩一松，她顺势推门而入。',
    ]);
    assert.deepEqual(liveEventCounts, [1]);
});

test('xb tavern action checks discard live dice results when the assistant never reaches a saved final reply', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const liveEventCounts: number[] = [];
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我赌一把，从塔窗翻进去。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => 19,
        onStreamProgress: (snapshot) => {
            if (Array.isArray(snapshot.liveActionCheckEvents)) {
                liveEventCounts.push(snapshot.liveActionCheckEvents.length);
            }
        },
        executeRunOnce: Object.assign(async (options: TavernRunOnceOptions) => {
            if (!options.toolResponses?.length) {
                return {
                    text: '她踩上窗沿，准备一口气翻进去。 ',
                    toolCalls: [{
                        id: 'check-void',
                        name: ACTION_CHECK_TOOL_NAME,
                        arguments: JSON.stringify({
                            action: 'Vault through the tower window',
                            stat: 'Agility',
                            difficulty: 13,
                        }),
                    }],
                    requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
                };
            }
            assert.equal(options.messages.length, 0);
            throw new Error('provider_exploded_mid_reply');
        }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'],
    });

    assert.deepEqual(liveEventCounts, [1]);
    assert.equal(result.assistantMessage, undefined);
    assert.match(result.errorMessage?.content || '', /provider_exploded_mid_reply/);
    const messages = await listTavernMessages(result.sessionId);
    assert.equal(messages.length, 2);
    assert.equal(messages[1]?.error, true);
    assert.equal(getActionCheckEvents(messages[1]?.runtimeEvents).length, 0);
});

test('xb tavern action checks render markers keep one whole markdown string and group same-offset rolls', () => {
    const payload = injectActionCheckRenderMarkers('她把铁丝探进锁孔。门开了。', [
        createActionCheckEvent({
            action: 'Pick the lock',
            stat: 'Finesse',
            difficulty: 12,
            roll: 15,
            success: true,
            insertAfterChars: 9,
        }),
        createActionCheckEvent({
            action: 'Keep the hinges quiet',
            stat: 'Stealth',
            difficulty: 10,
            roll: 14,
            success: true,
            insertAfterChars: 9,
        }),
    ]);

    assert.equal(payload.groups.length, 1);
    assert.equal(payload.groups[0]?.events.length, 2);
    assert.match(payload.text, /门开了/);
    assert.equal(payload.text.length, '她把铁丝探进锁孔。门开了。'.length + 1);
});

test('xb tavern run turn denies unknown RP tools and does not persist action-check events for them', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let requestCount = 0;
    const executeRunOnce = Object.assign(async (options: TavernRunOnceOptions) => {
        requestCount += 1;
        if (requestCount === 1) {
            return {
                text: '她屏住呼吸，手已经探向警铃底座。 ',
                toolCalls: [{
                    id: 'weird-tool',
                    name: 'ImprovisedExplosionSolver',
                    arguments: JSON.stringify({ problem: 'alarm' }),
                }],
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        }
        assert.match(JSON.stringify(options.toolResponses || []), /只允许调用 ActionCheck/);
        return {
            text: '她停下手，决定先重新判断线路走向。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        };
    }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'];
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我试着摸黑拆掉警铃。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        executeRunOnce,
    });

    assert.equal(requestCount, 2);
    const messages = await listTavernMessages(result.sessionId);
    assert.equal(getActionCheckEvents(messages[1]?.runtimeEvents).length, 0);
});

test('xb tavern action checks replay tool results through messages when session tool loop is unavailable', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let requestCount = 0;
    await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我赌一把，从窗台翻进塔里。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => 18,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            requestCount += 1;
            if (requestCount === 1) {
                assert.equal(Array.isArray(options.toolResponses), false);
                return {
                    text: '她踩上窗沿，呼吸压得极轻。 ',
                    toolCalls: [{
                        id: 'check-replay',
                        name: ACTION_CHECK_TOOL_NAME,
                        arguments: JSON.stringify({
                            action: 'Vault through the tower window',
                            stat: 'Agility',
                            difficulty: 13,
                        }),
                    }],
                    requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
                };
            }
            assert.equal(Array.isArray(options.toolResponses), false);
            const replayTool = options.messages.find((message) => message.role === 'tool') as {
                tool_call_id?: string;
                toolName?: string;
            } | undefined;
            assert.equal(replayTool?.tool_call_id, 'check-replay');
            assert.equal(replayTool?.toolName, ACTION_CHECK_TOOL_NAME);
            return {
                text: '她借着惯性翻入塔内，靴跟轻轻擦过石窗。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    assert.equal(requestCount, 2);
});

test('xb tavern action checks send a final reminder when tools finished but model returns no visible text', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let requestCount = 0;
    const executeRunOnce = Object.assign(async (options: TavernRunOnceOptions) => {
        requestCount += 1;
        if (requestCount === 1) {
            return {
                text: '她把发夹探进锁孔。 ',
                toolCalls: [{
                    id: 'check-reminder',
                    name: ACTION_CHECK_TOOL_NAME,
                    arguments: JSON.stringify({
                        action: 'Pick the lock',
                        stat: 'Finesse',
                        difficulty: 12,
                    }),
                }],
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        }
        if (requestCount === 2) {
            assert.equal(options.toolResponses?.[0]?.id, 'check-reminder');
            assert.equal(options.messages.length, 0);
            return {
                text: '',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    requestTask: {
                        finalAnswerReminderText: options.finalAnswerReminderText,
                    },
                }),
            };
        }
        assert.match(String(options.finalAnswerReminderText || ''), /Do not call more tools/);
        assert.equal(options.messages.length, 0);
        return {
            text: '锁芯发出一声轻响，门闩终于松开。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                requestTask: {
                    finalAnswerReminderText: options.finalAnswerReminderText,
                },
            }),
        };
    }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'];

    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我试着撬开这把锁。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => 15,
        executeRunOnce,
    });

    assert.equal(requestCount, 3);
    assert.match(result.assistantMessage?.content || '', /门闩终于松开/);
});

test('xb tavern action checks still send the final reminder after the max tool round only returns more tools', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let requestCount = 0;
    const executeRunOnce = Object.assign(async (options: TavernRunOnceOptions) => {
        requestCount += 1;
        if (requestCount <= 8) {
            if (requestCount === 1) {
                assert.equal(Array.isArray(options.toolResponses), false);
            } else {
                assert.equal(options.messages.length, 0);
                assert.equal(options.toolResponses?.[0]?.id, `check-${requestCount - 1}`);
                assert.equal(String(options.finalAnswerReminderText || ''), '');
            }
            return {
                text: '',
                toolCalls: [{
                    id: `check-${requestCount}`,
                    name: ACTION_CHECK_TOOL_NAME,
                    arguments: JSON.stringify({
                        action: `Risky attempt ${requestCount}`,
                        stat: 'Luck',
                        difficulty: 12,
                    }),
                }],
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    requestTask: {
                        messages: options.messages,
                        toolResponses: options.toolResponses,
                        finalAnswerReminderText: options.finalAnswerReminderText,
                    },
                }),
            };
        }
        if (requestCount === 9) {
            assert.equal(options.messages.length, 0);
            assert.equal(options.toolResponses?.[0]?.id, 'check-8');
            assert.equal(String(options.finalAnswerReminderText || ''), '');
            return {
                text: '',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    requestTask: {
                        messages: options.messages,
                        toolResponses: options.toolResponses,
                        finalAnswerReminderText: options.finalAnswerReminderText,
                    },
                }),
            };
        }
        assert.equal(requestCount, 10);
        assert.equal(options.messages.length, 0);
        assert.match(String(options.finalAnswerReminderText || ''), /Do not call more tools/);
        return {
            text: '命运终于尘埃落定，她没有继续冒险，而是收住了动作。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                requestTask: {
                    messages: options.messages,
                    toolResponses: options.toolResponses,
                    finalAnswerReminderText: options.finalAnswerReminderText,
                },
            }),
        };
    }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'];

    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我连续冒险，直到命运给出最后结果。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => 15,
        executeRunOnce,
    });

    assert.equal(requestCount, 10);
    assert.match(result.assistantMessage?.content || '', /命运终于尘埃落定/);
});

test('xb tavern action checks fail the turn when the model still gives no conclusion after the final reminder', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let requestCount = 0;
    const executeRunOnce = Object.assign(async (options: TavernRunOnceOptions) => {
        requestCount += 1;
        if (requestCount === 1) {
            return {
                text: '她把发夹探进锁孔。 ',
                toolCalls: [{
                    id: 'check-no-conclusion',
                    name: ACTION_CHECK_TOOL_NAME,
                    arguments: JSON.stringify({
                        action: 'Pick the lock',
                        stat: 'Finesse',
                        difficulty: 12,
                    }),
                }],
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        }
        return {
            text: '',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                requestTask: {
                    finalAnswerReminderText: options.finalAnswerReminderText,
                },
            }),
        };
    }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'];

    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我试着撬开这把锁。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => 4,
        executeRunOnce,
    });

    assert.equal(requestCount, 3);
    assert.equal(result.assistantMessage, undefined);
    assert.match(result.errorMessage?.content || '', /没有给出有效结论/);
});

test('xb tavern action checks remap dice-card offsets after aiOutput regex rewrites the final assistant text', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const liveSnapshots: Array<{ text: string; events: ReturnType<typeof getActionCheckEvents> }> = [];
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我跳过断桥。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => 18,
        onStreamProgress: (snapshot) => {
            liveSnapshots.push({
                text: String(snapshot.text || ''),
                events: getActionCheckEvents(snapshot.liveActionCheckEvents),
            });
        },
        applyRegex: async (items) => ({
            items: items.map((item) => item.placement === 'aiOutput'
                ? {
                    id: item.id,
                    text: String(item.text || '').replace('她猛地跃向断桥彼端。 ', '她先深吸一口气，猛地跃向断桥彼端。 '),
                    changed: true,
                }
                : { id: item.id, text: item.text, changed: false }),
            changedCount: items.some((item) => item.placement === 'aiOutput') ? 1 : 0,
        }),
        executeRunOnce: Object.assign(async (options: TavernRunOnceOptions) => {
            if (!options.toolResponses?.length) {
                return {
                    text: '她猛地跃向断桥彼端。 ',
                    toolCalls: [{
                        id: 'check-remap',
                        name: ACTION_CHECK_TOOL_NAME,
                        arguments: JSON.stringify({
                            action: 'Leap across the broken bridge',
                            stat: 'Agility',
                            difficulty: 14,
                        }),
                    }],
                    requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
                };
            }
            return {
                text: '落地时她稳稳收住重心。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        }, { supportsSessionToolLoop: true }) as Parameters<typeof runXbTavernTurn>[0]['executeRunOnce'],
    });

    const messages = await listTavernMessages(result.sessionId);
    const assistant = messages.find((message) => message.role === 'assistant' && !message.error);
    const events = getActionCheckEvents(assistant?.runtimeEvents);
    assert.match(assistant?.content || '', /她先深吸一口气/);
    assert.equal(events.length, 1);
    assert.equal(
        (assistant?.content || '').slice(0, events[0]?.insertAfterChars || 0),
        '她先深吸一口气，猛地跃向断桥彼端。 ',
    );
    const finalLiveSnapshot = liveSnapshots.find((snapshot) => snapshot.text.includes('她先深吸一口气'));
    assert.ok(finalLiveSnapshot);
    assert.equal(finalLiveSnapshot.events.length, 1);
    assert.equal(
        finalLiveSnapshot.text.slice(0, finalLiveSnapshot.events[0]?.insertAfterChars || 0),
        '她先深吸一口气，猛地跃向断桥彼端。 ',
    );
});

test('xb tavern rerun regenerates assistant action checks cleanly instead of reusing old dice events', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我撬门。',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        actionCheckRoll: () => 17,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            if (!options.messages.some((message) => message.role === 'tool')) {
                return {
                    text: '她把铁丝探进锁孔。 ',
                    toolCalls: [{
                        id: 'check-1',
                        name: ACTION_CHECK_TOOL_NAME,
                        arguments: JSON.stringify({
                            action: 'Pick the lock',
                            stat: 'Finesse',
                            difficulty: 12,
                        }),
                    }],
                    requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
                };
            }
            return {
                text: '锁芯轻轻一响，门开了。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });
    const firstMessages = await listTavernMessages(first.sessionId);
    assert.deepEqual(firstMessages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(firstMessages[1]?.error, false);

    let rerunCalls = 0;
    await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: true,
                randomEncounters: false,
            }),
        },
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            rerunCalls += 1;
            assert.equal(options.toolResponses?.length || 0, 0);
            return {
                text: '她停手，决定先听门后的动静。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    assert.equal(rerunCalls, 1);
    const messages = await listTavernMessages(first.sessionId);
    assert.equal(messages.length, 2);
    assert.equal(getActionCheckEvents(messages[1]?.runtimeEvents).length, 0);
});

test('xb tavern run turn does not block RP and completes its fixed pair after the timeline advances', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let managerProvider = '';
    let managerPrompt = '';
    let managerCalls = 0;
    const first = await runXbTavernTurn({
        agentConfig: {
            currentPresetName: '主聊天',
            delegatePresetName: '记忆管理员',
            presets: {
                主聊天: {
                    provider: 'sillytavern-claude',
                    modelConfigs: {
                        'sillytavern-claude': { model: 'main-model' },
                    },
                },
            },
            delegateConfig: {
                provider: 'sillytavern-openai-compatible',
                modelConfigs: {
                    'sillytavern-openai-compatible': { model: 'manager-model' },
                },
            },
        },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '我们去码头。',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '她点头，把灯吹灭。',
            provider: 'sillytavern-claude',
            model: 'main-model',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                provider: 'sillytavern-claude',
                model: 'main-model',
            }),
        }),
        executeManagerOnce: async (options) => {
            managerCalls += 1;
            managerPrompt = JSON.stringify(options.messages);
            const delegateConfig = options.agentConfig.delegateConfig as { provider?: string } | undefined;
            managerProvider = String(delegateConfig?.provider || '');
            if (managerCalls === 1) {
                return {
                    provider: 'sillytavern-openai-compatible',
                    model: 'manager-model',
                    text: '',
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: [
                                '# 会话记忆',
                                '',
                                '两人决定去码头，Aster 接受行动。',
                                '',
                                '状态：',
                                'Aster 更主动。',
                                '',
                                '关系：',
                                '信任增加。',
                                '',
                                '地点与物品：',
                                '目标地点变成码头。',
                            ].join('\n'),
                        },
                    }],
                };
            }
            return {
                provider: 'sillytavern-openai-compatible',
                model: 'manager-model',
                text: '已更新本轮记忆档案。',
            };
        },
    });

    const pendingRuns = await listTavernManagerRuns(first.sessionId);
    assert.equal(first.managerStatus, '');
    assert.equal(first.managerRunId, '');
    assert.equal(managerCalls, 0);
    assert.deepEqual(pendingRuns, []);
    const firstCandidate = await getTavernManagerCandidate(first.sessionId);
    assert.ok(firstCandidate);

    let markManagerStarted!: () => void;
    const managerStarted = new Promise<void>((resolve) => {
        markManagerStarted = resolve;
    });
    let releaseManager!: () => void;
    const managerRelease = new Promise<void>((resolve) => {
        releaseManager = resolve;
    });
    const managerRunStatuses: string[] = [];
    const turnPromise = runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: {
            currentPresetName: '主聊天',
            delegatePresetName: '记忆管理员',
            presets: {
                主聊天: {
                    provider: 'sillytavern-claude',
                    modelConfigs: {
                        'sillytavern-claude': { model: 'main-model' },
                    },
                },
            },
            delegateConfig: {
                provider: 'sillytavern-openai-compatible',
                modelConfigs: {
                    'sillytavern-openai-compatible': { model: 'manager-model' },
                },
            },
        },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '继续。',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '她把船绳绕在腕上，准备登船。',
            provider: 'sillytavern-claude',
            model: 'main-model',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                provider: 'sillytavern-claude',
                model: 'main-model',
            }),
        }),
        executeManagerOnce: async (options) => {
            managerCalls += 1;
            managerPrompt = JSON.stringify(options.messages);
            const delegateConfig = options.agentConfig.delegateConfig as { provider?: string } | undefined;
            managerProvider = String(delegateConfig?.provider || '');
            if (managerCalls === 1) {
                markManagerStarted();
                await managerRelease;
                return {
                    provider: 'sillytavern-openai-compatible',
                    model: 'manager-model',
                    text: '',
                    toolCalls: [{
                        id: 'write-state',
                        name: 'Write',
                        arguments: {
                            filePath: 'memory/state.md',
                            content: [
                                '# 会话记忆',
                                '',
                                '两人决定去码头，Aster 接受行动。',
                                '',
                                '状态：',
                                'Aster 更主动。',
                                '',
                                '关系：',
                                '信任增加。',
                                '',
                                '地点与物品：',
                                '目标地点变成码头。',
                            ].join('\n'),
                        },
                    }],
                };
            }
            return {
                provider: 'sillytavern-openai-compatible',
                model: 'manager-model',
                text: '已更新本轮记忆档案。',
            };
        },
        onManagerRunSaved: async (_sessionId, run) => {
            managerRunStatuses.push(`${run.id}:${run.status}`);
        },
    });

    await managerStarted;
    const sawRunningStatusBeforeRpCompleted = managerRunStatuses.includes(`${firstCandidate?.id}:running`);
    const result = await turnPromise;
    assert.equal(result.managerStatus, 'queued');
    assert.equal(result.managerRunId, firstCandidate?.id);
    assert.equal(managerCalls, 1);
    releaseManager();
    await waitForQueuedAcceptedTurnManagers(result.sessionId);
    assert.equal(sawRunningStatusBeforeRpCompleted, true);
    assert.equal(managerCalls, 2);
    assert.equal(managerProvider, 'sillytavern-openai-compatible');
    assert.match(managerPrompt, /# Backstage Manager — LittleWhiteTavern/);
    assert.match(managerPrompt, /main chat handles immersive roleplay/i);
    assert.match(managerPrompt, /## Who You Are/);
    assert.match(managerPrompt, /## What You Already Have/);
    assert.match(managerPrompt, /## Your Tools/);
    assert.match(managerPrompt, /## General Rules/);
    assert.match(managerPrompt, /## Map/);
    assert.match(managerPrompt, /memory\/state\.md/);
    assert.match(managerPrompt, /accepted reply actually establishes a new long-term fact/i);
    assert.doesNotMatch(managerPrompt, /建议流水路径/);
    assert.doesNotMatch(managerPrompt, /suggested turn note/i);
    assert.match(managerPrompt, /Spatial records are files/i);
    assert.match(managerPrompt, /MapAtlasRead to read `world`/i);
    assert.match(managerPrompt, /MapSceneEdit to edit by explicit scene name/i);
    assert.match(managerPrompt, /Do not rely on `main`, current map, active map, docType\/docId, activate, or ops/i);
    assert.match(managerPrompt, /Player position lives at `world\.actors\.player\.locationKey`/i);
    assert.match(managerPrompt, /MapSceneEdit.*auto-creates if missing/i);
    assert.match(managerPrompt, /Element syntax:/i);
    assert.match(managerPrompt, /Do not fill unused geo keys/i);
    assert.match(managerPrompt, /set `playerHere:true` only when/i);
    assert.match(managerPrompt, /First-map rule/i);
    assert.match(managerPrompt, /retry only the skipped element/i);
    assert.match(managerPrompt, /Update the atlas only when a place is confirmed/i);
    assert.match(managerPrompt, /Keep editing the same scene name/i);
    assert.match(managerPrompt, /separate scene name/i);
    assert.match(managerPrompt, /Actors use .*actorKey/i);
    assert.match(managerPrompt, /Indoor, vehicle, structure, cave, platform, rooftop/i);
    assert.match(managerPrompt, /Construction order/i);
    assert.match(managerPrompt, /Closed or contained scenes usually need both a filled main surface/i);
    assert.match(managerPrompt, /`cat:\\?"terrain\\?"` for the main continuous surface or filled base area/i);
    assert.match(managerPrompt, /Open scenes .* may use a main surface/i);
    assert.match(managerPrompt, /Let scene pressure shape composition/i);
    assert.match(managerPrompt, /Translate place names into local geometry/i);
    assert.match(managerPrompt, /viewBox is the camera/i);
    assert.doesNotMatch(managerPrompt, /meta \+ add|initialize it with one MapPatch/i);
    assert.match(managerPrompt, /Place text labels 15–25 units beside what they describe/i);
    assert.match(managerPrompt, /Reply with a short maintenance report grouped by affected domain/i);
    assert.doesNotMatch(managerPrompt, /电纸书|ebook file-operation/i);
    assert.match(managerPrompt, /Grep with `path:\\?"memory\/\\?"` to check whether a fact is already stored/is);
    assert.doesNotMatch(managerPrompt, /可派生格式/);
    assert.doesNotMatch(managerPrompt, /messages userOrder\/assistantOrder/);
    assert.doesNotMatch(managerPrompt, /ChatHistory recent 读取最新消息/);
    assert.doesNotMatch(managerPrompt, /MemoryEdit `edits` 必须是真正的非空数组/);
    const memoryFiles = (await getTavernMemoryIndex(result.sessionId))?.files || [];
    assert.equal(memoryFiles.some((file) => file.path === 'memory/state.md'), true);
    assert.match((await getTavernMemoryFile(result.sessionId, 'memory/state.md'))?.content || '', /两人决定去码头/);
    const acceptedMemoryFloors = (await listTavernMemorySnapshots(result.sessionId)).map((snapshot) => snapshot.floor);
    assert.equal(acceptedMemoryFloors.includes(first.assistantMessage?.order || -1), true);
    assert.equal(acceptedMemoryFloors.includes(result.assistantMessage?.order || -1), false);
    const runs = await listTavernManagerRuns(result.sessionId);
    const completed = runs.find((run) => run.id === firstCandidate?.id);
    assert.equal(completed?.status, 'completed');
    assert.equal(completed?.error, '');
    assert.equal(completed?.confirmedByUserOrder, result.userMessage.order);
    const nextCandidate = await getTavernManagerCandidate(result.sessionId);
    assert.equal(nextCandidate?.userOrder, result.userMessage.order);
    assert.equal(nextCandidate?.assistantOrder, result.assistantMessage?.order);
});

test('rapid RP turns preserve every confirmed manager pair in strict story order', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const managerContract = mergeTavernSessionContract(undefined, { memoryArchiving: true });
    let managerCalls = 0;
    let markManagerStarted!: () => void;
    const managerStarted = new Promise<void>((resolve) => {markManagerStarted = resolve;});
    let releaseFirstManager!: () => void;
    const firstManagerGate = new Promise<void>((resolve) => {releaseFirstManager = resolve;});
    const executeManagerOnce = async () => {
        managerCalls += 1;
        if (managerCalls === 1) {
            markManagerStarted();
            await firstManagerGate;
        }
        return { text: `维护完成 ${managerCalls}。`, provider: 'fake-manager', model: 'manager-model' };
    };
    const contextSnapshot = {
        character: { characterKey: 'char-fast-queue', name: 'Aster' },
    };

    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        runtimeState: { contract: managerContract },
        currentUserMessage: 'U0',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'A1',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce,
    });
    const firstCandidate = await getTavernManagerCandidate(first.sessionId);
    assert.equal(firstCandidate?.assistantOrder, 1);

    const secondPromise = runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'U2',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'A3',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce,
    });
    await managerStarted;
    const second = await secondPromise;
    assert.equal(second.managerRunId, firstCandidate?.id);

    const secondCandidate = await getTavernManagerCandidate(first.sessionId);
    assert.equal(secondCandidate?.assistantOrder, 3);
    const third = await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'U4',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'A5',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce,
    });
    assert.equal(third.managerRunId, secondCandidate?.id);

    let runs = await listTavernManagerRuns(first.sessionId);
    assert.equal(runs.find((run) => run.assistantOrder === 1)?.status, 'running');
    assert.equal(runs.find((run) => run.assistantOrder === 3)?.status, 'queued');
    releaseFirstManager();
    await waitForQueuedAcceptedTurnManagers(first.sessionId);

    runs = await listTavernManagerRuns(first.sessionId);
    assert.equal(managerCalls, 2);
    assert.deepEqual(
        runs.filter((run) => [1, 3].includes(run.assistantOrder))
            .sort((left, right) => left.assistantOrder - right.assistantOrder)
            .map((run) => [run.assistantOrder, run.confirmedByUserOrder, run.status]),
        [[1, 2, 'completed'], [3, 4, 'completed']],
    );
});

test('tavern manager prompt strips unauthorized module rules cleanly', () => {
    const memoryOnly = buildTavernManagerSystemPrompt({}, {
        includeMemory: true,
        includeCartography: false,
    });
    assert.match(memoryOnly, /## Memory/);
    assert.match(memoryOnly, /Global facts → `memory\/state\.md`/);
    assert.match(memoryOnly, /Character files → `memory\/characters\/<name>\.md`/);
    assert.match(memoryOnly, /the tags only govern internal format/);
    assert.match(memoryOnly, /<全局记忆设定>/);
    assert.match(memoryOnly, /<人物记忆设定>/);
    assert.doesNotMatch(memoryOnly, /## Structured State/);
    assert.doesNotMatch(memoryOnly, /## Map/);
    assert.doesNotMatch(memoryOnly, /StateRead/);
    assert.doesNotMatch(memoryOnly, /inspect or change the map/i);
    assert.doesNotMatch(memoryOnly, /spatial relation view/i);
    assert.doesNotMatch(memoryOnly, /separate spatial state/i);

    const mapOnly = buildTavernManagerSystemPrompt({}, {
        includeMemory: false,
        includeCartography: true,
    });
    assert.match(mapOnly, /## Map/);
    assert.match(mapOnly, /MapAtlasRead/);
    assert.match(mapOnly, /MapSceneEdit/);
    assert.doesNotMatch(mapOnly, /MemoryWrite/);
    assert.doesNotMatch(mapOnly, /memory\/session\.md/);
    assert.doesNotMatch(mapOnly, /校正记忆/);

});

test('xb tavern queued accepted-turn manager failure does not block the next RP send', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let managerCalls = 0;
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '先记住这一轮。',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '她把黑匣子交给你保管。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce: async () => {
            throw new Error('first turn manager must not run yet');
        },
    });

    assert.equal(first.managerStatus, '');
    assert.equal(managerCalls, 0);
    const firstCandidate = await getTavernManagerCandidate(first.sessionId);
    assert.ok(firstCandidate);

    let markManagerStarted!: () => void;
    const managerStarted = new Promise<void>((resolve) => {
        markManagerStarted = resolve;
    });
    let releaseManager!: () => void;
    const managerRelease = new Promise<void>((resolve) => {
        releaseManager = resolve;
    });
    const turnPromise = runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '继续。',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '她低声说，别让第三个人知道。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce: async () => {
            managerCalls += 1;
            markManagerStarted();
            await managerRelease;
            throw new Error('manager_pre_send_failed');
        },
    });

    await managerStarted;
    const second = await turnPromise;
    assert.equal(second.error, undefined);
    assert.equal(second.assistantMessage?.content, '她低声说，别让第三个人知道。');
    assert.equal(second.managerStatus, 'queued');
    assert.equal(second.managerRunId, firstCandidate?.id);
    assert.equal(managerCalls, 1);
    releaseManager();
    await waitForQueuedAcceptedTurnManagers(first.sessionId);
    const runs = await listTavernManagerRuns(first.sessionId);
    const failed = runs.find((run) => run.id === firstCandidate?.id);
    assert.equal(failed?.status, 'failed');
    assert.equal(failed?.error, 'manager_pre_send_failed');
    const nextCandidate = await getTavernManagerCandidate(first.sessionId);
    assert.equal(nextCandidate?.userOrder, second.userMessage.order);
    assert.equal(nextCandidate?.assistantOrder, second.assistantMessage?.order);
});

test('xb tavern reroll replaces the unconfirmed manager candidate without calling the manager API', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let managerCalls = 0;
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: '试一次。',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '第一版回复。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce: async () => {
            managerCalls += 1;
            return { text: '不应该维护旧候选。' };
        },
    });
    assert.equal(first.managerStatus, '');
    const firstCandidate = await getTavernManagerCandidate(first.sessionId);
    assert.ok(firstCandidate);

    const rerun = await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '最终保留回复。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce: async () => {
            managerCalls += 1;
            return { text: '不应该维护重 roll 过程。' };
        },
    });

    assert.equal(rerun.managerStatus, '');
    assert.equal(managerCalls, 0);
    const runs = await listTavernManagerRuns(first.sessionId);
    assert.deepEqual(runs, []);
    const rerunCandidate = await getTavernManagerCandidate(first.sessionId);
    assert.ok(rerunCandidate);
    assert.notEqual(rerunCandidate?.id, firstCandidate?.id);
    assert.equal(rerunCandidate?.assistantOrder, rerun.assistantMessage?.order);
    const messages = await listTavernMessages(first.sessionId);
    assert.deepEqual(messages.map((message) => message.content), ['试一次。', '最终保留回复。']);
});

test('xb tavern reroll uses the latest user checkpoint while preserving the old timeline until commit', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Checkpoint reroll',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        state: {
            turn: 7,
            contextWindowStartOrder: 0,
            worldEntryStates: {
                remembered: { stickyUntilTurn: 10 },
            },
            nativeWorldInfoTimedState: { sticky: { lore: { end: 9 } }, cooldown: {} },
        },
    });
    const first = await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '从这里开始。',
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '第一版回复。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    assert.equal(first.userMessage.runtimeStateSnapshot?.turn, 7);
    assert.deepEqual(first.userMessage.runtimeStateSnapshot?.worldEntryStates, {
        remembered: { stickyUntilTurn: 10 },
    });

    await updateTavernSessionState(session.id, {
        turn: 99,
        contextWindowStartOrder: 88,
        worldEntryStates: { polluted: { stickyUntilTurn: 100 } },
        nativeWorldInfoTimedState: { sticky: { polluted: { end: 100 } }, cooldown: {} },
    });
    let preparedTimeline: string[] = [];
    const rerun = await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        onLatestAssistantRerollPrepared: async () => {
            preparedTimeline = (await listTavernMessages(session.id)).map((message) => message.content);
        },
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '第二版回复。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });

    assert.deepEqual(preparedTimeline, ['从这里开始。', '第一版回复。']);
    assert.equal(rerun.userMessage.order, first.userMessage.order);
    assert.deepEqual((await listTavernMessages(session.id)).map((message) => message.content), ['从这里开始。', '第二版回复。']);
    assert.equal((await getTavernSession(session.id))?.state?.turn, 8);
    assert.equal((await getTavernSession(session.id))?.state?.worldEntryStates?.polluted, undefined);
});

test('xb tavern reroll keeps the previous AI and candidate when prompt, API, or stop fails', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Checkpoint reroll failure',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        state: {
            turn: 7,
            contract: mergeTavernSessionContract(undefined, { memoryArchiving: true }),
            worldEntryStates: { remembered: { stickyUntilTurn: 10 } },
            nativeWorldInfoTimedState: { sticky: {}, cooldown: {} },
        },
    });
    const first = await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '从这里重试。',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '旧回复。',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    await updateTavernSessionState(session.id, {
        turn: 99,
        worldEntryStates: { polluted: { stickyUntilTurn: 100 } },
    });
    const stateBeforeFailedReroll = (await getTavernSession(session.id))?.state;

    await assert.rejects(() => runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        applyRegex: identityApplyRegex,
        applySubstituteParams: identityApplySubstituteParams,
        buildNativeChatPrompt: async () => {
            throw new Error('reroll_prompt_failed');
        },
        executeRunOnce: async () => {
            throw new Error('provider_should_not_run');
        },
    }), /reroll_prompt_failed/);

    await assert.rejects(() => runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        applyRegex: identityApplyRegex,
        applySubstituteParams: identityApplySubstituteParams,
        buildNativeChatPrompt: createLocalTestNativePrompt(),
        executeRunOnce: async () => {
            throw new Error('reroll_api_failed');
        },
    }), /reroll_api_failed/);

    await assert.rejects(() => runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        applyRegex: identityApplyRegex,
        applySubstituteParams: identityApplySubstituteParams,
        buildNativeChatPrompt: createLocalTestNativePrompt(),
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: '未完成的半截回复。',
            finishReason: 'aborted',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    }), /已停止重 roll，原回复已保留/);

    assert.deepEqual((await listTavernMessages(session.id)).map((message) => message.content), ['从这里重试。', '旧回复。']);
    assert.equal((await getTavernManagerCandidate(session.id))?.assistantOrder, first.assistantMessage?.order);
    const rebuilt = await getTavernSession(session.id);
    assert.deepEqual(rebuilt?.state, stateBeforeFailedReroll);
});

test('xb tavern run turn retrieves relevant old memory beyond recent summaries', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Memory retrieval',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
    });
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nAster 把银钥匙藏在码头钟楼下面。', {
        source: 'manager',
    });

    let rawMessagesJson = '';
    await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '她还记得银钥匙放在哪里吗？',
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            rawMessagesJson = JSON.stringify(options.messages);
            return {
                text: '她记得。',
                provider: 'fake-provider',
                model: 'fake-model',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    provider: 'fake-provider',
                    model: 'fake-model',
                }),
            };
        },
    });

    assert.match(rawMessagesJson, /银钥匙藏在码头钟楼下面/);
});

test('xb tavern regex transforms user input, world info, and AI output in the real turn path', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Regex turn',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
            worldBooks: [{
                name: 'Lore',
                entries: [{
                    uid: 'regex-world',
                    content: 'RAW_WORLD should be transformed.',
                    constant: true,
                }],
            }],
        },
        state: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: false,
                randomEncounters: false,
            }),
        },
    });
    await appendTavernMessage(session.id, { role: 'user', content: 'OLD_USER already saved.' });
    await appendTavernMessage(session.id, {
        role: 'assistant',
        content: 'OLD_AI already saved.',
        thoughts: [{ label: 'hidden', text: 'OLD_REASONING already saved.' }],
    });
    const calls: Array<{ placement: string; isPrompt: boolean; depth: unknown; text: string }> = [];
    const streamed: string[] = [];
    let providerMessagesJson = '';
    const applyRegex = async (items: TavernApplyRegexItem[]) => ({
        items: items.map((item) => {
            calls.push({
                placement: item.placement,
                isPrompt: item.options?.isPrompt === true,
                depth: item.options?.depth,
                text: item.text,
            });
            const isPrompt = item.options?.isPrompt === true;
            return {
                id: item.id,
                text: isPrompt && item.placement === 'userInput'
                    ? item.text.replace(/SAVED_USER/g, 'PROMPT_USER').replace(/OLD_USER/g, 'PROMPT_OLD_USER')
                    : isPrompt && item.placement === 'aiOutput'
                        ? item.text.replace(/OLD_AI/g, 'PROMPT_OLD_AI')
                        : isPrompt && item.placement === 'reasoning'
                            ? item.text.replace(/OLD_REASONING/g, 'PROMPT_OLD_REASONING')
                        : item.text
                            .replace(/RAW_USER/g, 'SAVED_USER')
                            .replace(/RAW_WORLD/g, 'REGEX_WORLD')
                            .replace(/RAW_AI/g, 'REGEX_AI')
                            .replace(/RAW_REASONING/g, 'REGEX_REASONING'),
                changed: /RAW_(USER|WORLD|AI|REASONING)|SAVED_USER|OLD_USER|OLD_AI|OLD_REASONING/.test(item.text),
            };
        }),
        changedCount: items.filter((item) => /RAW_(USER|WORLD|AI|REASONING)|SAVED_USER|OLD_USER|OLD_AI|OLD_REASONING/.test(item.text)).length,
    });
    const result = await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'RAW_USER asks.',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                actionChecks: false,
                randomEncounters: false,
            }),
        },
        applyRegex,
        onStreamProgress: (snapshot) => {
            if (typeof snapshot.text === 'string') {streamed.push(snapshot.text);}
        },
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            providerMessagesJson = JSON.stringify(options.messages);
            return {
                text: 'RAW_AI replies.',
                thoughts: [{ label: 'thinking', text: 'RAW_REASONING hidden thought.' }],
                provider: 'fake-provider',
                model: 'fake-model',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    provider: 'fake-provider',
                    model: 'fake-model',
                    regexApplications: options.regexApplications,
                }),
            };
        },
    });

    assert.equal(calls.some((call) => call.placement === 'userInput' && !call.isPrompt && call.text === 'RAW_USER asks.'), true);
    assert.equal(calls.some((call) => call.placement === 'userInput' && call.isPrompt && call.text === 'SAVED_USER asks.' && call.depth === 0), true);
    assert.equal(calls.some((call) => call.placement === 'userInput' && call.isPrompt && call.text === 'OLD_USER already saved.' && call.depth === 2), true);
    assert.equal(calls.some((call) => call.placement === 'aiOutput' && call.isPrompt && call.text === 'OLD_AI already saved.' && call.depth === 1), true);
    assert.equal(calls.some((call) => call.placement === 'reasoning' && call.isPrompt && call.text === 'OLD_REASONING already saved.' && call.depth === 1), true);
    assert.match(providerMessagesJson, /PROMPT_USER asks/);
    assert.match(providerMessagesJson, /PROMPT_OLD_USER already saved/);
    assert.match(providerMessagesJson, /PROMPT_OLD_AI already saved/);
    assert.match(providerMessagesJson, /PROMPT_OLD_REASONING already saved/);
    assert.match(providerMessagesJson, /REGEX_WORLD should be transformed/);
    assert.doesNotMatch(providerMessagesJson, /"thoughts"/);
    assert.doesNotMatch(providerMessagesJson, /RAW_USER|RAW_WORLD|SAVED_USER/);
    assert.equal(providerMessagesJson.includes('"content":"OLD_USER already saved."'), false);
    assert.equal(providerMessagesJson.includes('"content":"OLD_AI already saved."'), false);
    assert.equal(streamed.at(-1), 'REGEX_AI replies.');
    const messages = await listTavernMessages(result.sessionId);
    assert.equal(messages[0]?.content, 'OLD_USER already saved.');
    assert.equal(messages[1]?.content, 'OLD_AI already saved.');
    assert.deepEqual(messages[1]?.thoughts, [{ label: 'hidden', text: 'OLD_REASONING already saved.' }]);
    assert.equal(messages[2]?.content, 'SAVED_USER asks.');
    assert.equal(messages[3]?.content, 'REGEX_AI replies.');
    assert.deepEqual(messages[3]?.thoughts, [{ label: 'thinking', text: 'REGEX_REASONING hidden thought.' }]);
    assert.equal((result.requestSnapshot.regexApplications as { userInput?: number; worldInfo?: number; aiOutput?: number; reasoning?: number } | undefined)?.userInput, 3);
    assert.equal((result.requestSnapshot.regexApplications as { userInput?: number; worldInfo?: number } | undefined)?.worldInfo, 1);
    assert.equal((result.requestSnapshot.regexApplications as { aiOutput?: number } | undefined)?.aiOutput, 2);
    assert.equal((result.requestSnapshot.regexApplications as { reasoning?: number } | undefined)?.reasoning, 2);
});

test('xb tavern simulated request applies regex without saving messages', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Regex simulation',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
            worldBooks: [{
                name: 'Lore',
                entries: [{
                    uid: 'regex-world',
                    content: 'RAW_WORLD prompt lore.',
                    constant: true,
                }],
            }],
        },
    });
    const applyRegex = async (items: TavernApplyRegexItem[]) => ({
        items: items.map((item) => ({
            id: item.id,
            text: item.text.replace(/RAW_USER/g, 'REGEX_USER').replace(/RAW_WORLD/g, 'REGEX_WORLD'),
            changed: /RAW_(USER|WORLD)/.test(item.text),
        })),
        changedCount: items.filter((item) => /RAW_(USER|WORLD)/.test(item.text)).length,
    });

    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'RAW_USER simulate.',
        applyRegex,
    });

    assert.match(result.requestSnapshot.rawRequestJson, /REGEX_USER simulate/);
    assert.match(result.requestSnapshot.rawRequestJson, /REGEX_WORLD prompt lore/);
    assert.doesNotMatch(result.requestSnapshot.rawRequestJson, /RAW_USER|RAW_WORLD/);
    assert.deepEqual(await listTavernMessages(session.id), []);
});

test('xb tavern native world info keeps WORLD_INFO regex out of local world entries', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const worldInfoTexts: string[] = [];
    const applyRegex = async (items: TavernApplyRegexItem[]) => ({
        items: items.map((item) => {
            if (item.placement === 'worldInfo') {
                worldInfoTexts.push(item.text);
            }
            return {
                id: item.id,
                text: item.text
                    .replace(/RAW_USER/g, 'REGEX_USER')
                    .replace(/RAW_BOUND/g, 'REGEX_BOUND')
                    .replace(/RAW_NATIVE/g, 'REGEX_NATIVE'),
                changed: /RAW_(USER|BOUND|NATIVE)/.test(item.text),
            };
        }),
        changedCount: items.filter((item) => /RAW_(USER|BOUND|NATIVE)/.test(item.text)).length,
    });

    const result = await simulateXbTavernRequest({
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
            worldBooks: [
                {
                    name: 'Bound Character Book',
                    worldSourceType: 'character',
                    entries: [{
                        uid: 'bound-book',
                        content: 'RAW_BOUND bound lore.',
                        constant: true,
                        worldSourceType: 'character',
                    }],
                },
                {
                    name: 'Raw Card Book',
                    worldSourceType: 'card',
                    entries: [{
                        uid: 'raw-card-book',
                        content: 'RAW_CARD card lore.',
                        constant: true,
                        worldSourceType: 'card',
                    }],
                },
            ],
        },
        preset,
        currentUserMessage: 'RAW_USER simulate.',
        applyRegex,
        getNativeWorldInfoRuntime: async () => ({
            trigger: 'normal',
            worldInfoBefore: 'RAW_NATIVE native lore.',
            timedState: { sticky: {}, cooldown: {} },
        }),
    });

    assert.deepEqual(worldInfoTexts, []);
    assert.match(result.requestSnapshot.rawRequestJson, /REGEX_USER simulate/);
    assert.match(result.requestSnapshot.rawRequestJson, /RAW_NATIVE native lore/);
    assert.doesNotMatch(result.requestSnapshot.rawRequestJson, /RAW_CARD|RAW_BOUND|REGEX_CARD|REGEX_NATIVE|REGEX_BOUND/);
    assert.equal((result.requestSnapshot.regexApplications as { worldInfo?: number } | undefined)?.worldInfo || 0, 0);
});

test('xb tavern simulated request applies prompt-stage regex to history without rewriting saved text', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Regex prompt simulation',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
    });
    await appendTavernMessage(session.id, { role: 'user', content: 'OLD_USER saved.' });
    await appendTavernMessage(session.id, {
        role: 'assistant',
        content: 'OLD_AI saved.',
        thoughts: [{ label: 'hidden', text: 'OLD_REASONING saved.' }],
    });
    const applyRegex = async (items: TavernApplyRegexItem[]) => ({
        items: items.map((item) => {
            const isPrompt = item.options?.isPrompt === true;
            const text = isPrompt && item.placement === 'userInput'
                ? item.text.replace(/SAVED_USER/g, 'PROMPT_USER').replace(/OLD_USER/g, 'PROMPT_OLD_USER')
                : isPrompt && item.placement === 'aiOutput'
                    ? item.text.replace(/OLD_AI/g, 'PROMPT_OLD_AI')
                    : isPrompt && item.placement === 'reasoning'
                        ? item.text.replace(/OLD_REASONING/g, 'PROMPT_OLD_REASONING')
                    : item.text.replace(/RAW_USER/g, 'SAVED_USER');
            return {
                id: item.id,
                text,
                changed: text !== item.text,
            };
        }),
        changedCount: items.length,
    });

    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'RAW_USER simulate.',
        applyRegex,
    });

    assert.match(result.requestSnapshot.rawRequestJson, /PROMPT_USER simulate/);
    assert.match(result.requestSnapshot.rawRequestJson, /PROMPT_OLD_USER saved/);
    assert.match(result.requestSnapshot.rawRequestJson, /PROMPT_OLD_AI saved/);
    assert.match(result.requestSnapshot.rawRequestJson, /PROMPT_OLD_REASONING saved/);
    assert.doesNotMatch(result.requestSnapshot.rawRequestJson, /"thoughts"/);
    assert.doesNotMatch(result.requestSnapshot.rawRequestJson, /RAW_USER|SAVED_USER/);
    assert.equal(result.requestSnapshot.rawRequestJson.includes('"content": "OLD_USER saved."'), false);
    assert.equal(result.requestSnapshot.rawRequestJson.includes('"content": "OLD_AI saved."'), false);
    assert.deepEqual((await listTavernMessages(session.id)).map((message) => message.content), [
        'OLD_USER saved.',
        'OLD_AI saved.',
    ]);
    assert.deepEqual((await listTavernMessages(session.id))[1]?.thoughts, [{ label: 'hidden', text: 'OLD_REASONING saved.' }]);
});

test('xb tavern native prompt build receives prompt-stage regexed history and current input', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Native prompt regex',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
    });
    await appendTavernMessage(session.id, {
        role: 'user',
        content: 'OLD_USER visible. <guidance>HIDE_USER</guidance>',
    });
    await appendTavernMessage(session.id, {
        role: 'assistant',
        content: 'OLD_AI visible. <guidance>HIDE_AI</guidance>',
    });
    const stripGuidance = (text: string) => text.replace(/<guidance>[\s\S]*?<\/guidance>/g, '');
    const applyRegex = async (items: TavernApplyRegexItem[]) => ({
        items: items.map((item) => {
            const text = item.options?.isPrompt === true ? stripGuidance(item.text) : item.text;
            return {
                id: item.id,
                text,
                changed: text !== item.text,
            };
        }),
        changedCount: items.length,
    });
    let nativeReceived = {
        history: [] as string[],
        currentUserMessage: '',
    };

    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'NOW visible. <guidance>HIDE_NOW</guidance>',
        applyRegex,
        applySubstituteParams: identityApplySubstituteParams,
        buildNativeChatPrompt: async (input) => {
            const history = Array.isArray(input.context?.history) ? input.context.history : [];
            nativeReceived = {
                history: history.map((message) => String(message.content || '')),
                currentUserMessage: String(input.currentUserMessage || ''),
            };
            const messages = [
                ...history.map((message) => ({
                    role: message.role === 'user' ? 'user' as const : 'assistant' as const,
                    content: String(message.content || ''),
                })),
                {
                    role: 'user' as const,
                    content: String(input.currentUserMessage || ''),
                },
            ].filter((message) => message.content);
            return {
                messages,
                source: 'test-native-prompt',
                promptMessageCount: messages.length,
                currentUserMessageIndex: messages.findIndex((message) => (
                    message.role === 'user' && message.content === input.currentUserMessage
                )),
            };
        },
    });

    assert.deepEqual(nativeReceived.history, [
        'OLD_USER visible. ',
        'OLD_AI visible. ',
    ]);
    assert.equal(nativeReceived.currentUserMessage, 'NOW visible. ');
    assert.match(result.requestSnapshot.rawRequestJson, /OLD_USER visible/);
    assert.match(result.requestSnapshot.rawRequestJson, /OLD_AI visible/);
    assert.match(result.requestSnapshot.rawRequestJson, /NOW visible/);
    assert.doesNotMatch(result.requestSnapshot.rawRequestJson, /HIDE_USER|HIDE_AI|HIDE_NOW|<guidance>/);
    assert.deepEqual((result.requestSnapshot.promptDiagnostics as {
        nativePrompt?: Record<string, unknown>;
    } | undefined)?.nativePrompt, {
        nativeInputHistoryCount: 2,
        nativeInputHistoryChars: 32,
        nativeBuiltConversationMessageCount: 3,
        nativeBuiltConversationChars: 44,
        nativePreparedMessageCount: 3,
        nativePreparedMessageChars: 44,
        nativeMatchedHistoryCount: 2,
        nativeMatchedHistoryChars: 32,
        nativeMatchedConversationCount: 3,
        nativeMatchedConversationChars: 44,
    });
    assert.deepEqual((await listTavernMessages(session.id)).map((message) => message.content), [
        'OLD_USER visible. <guidance>HIDE_USER</guidance>',
        'OLD_AI visible. <guidance>HIDE_AI</guidance>',
    ]);
});

test('xb tavern native prompt build fails instead of falling back when native messages are empty', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Native prompt empty',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
    });

    await assert.rejects(
        () => simulateXbTavernRequest({
            sessionId: session.id,
            agentConfig: {
                currentPresetName: '酒馆 OpenAI',
                presets: {
                    '酒馆 OpenAI': {
                        provider: 'sillytavern-openai-compatible',
                        modelConfigs: {
                            'sillytavern-openai-compatible': {
                                model: 'gpt-test',
                            },
                        },
                    },
                },
            },
            contextSnapshot: session.contextSnapshot || {},
            preset,
            currentUserMessage: 'Hello.',
            applyRegex: identityApplyRegex,
            applySubstituteParams: identityApplySubstituteParams,
            buildNativeChatPrompt: async () => ({
                source: 'test-native-prompt',
                promptMessageCount: 0,
                messages: [],
                currentUserMessageIndex: null,
            }),
        }),
        /native_prompt_builder_returned_empty_messages/,
    );
});

test('xb tavern native prompt runtime fails before request when regex hook is missing', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Missing regex hook',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
    });
    let providerCalls = 0;

    await assert.rejects(
        () => runXbTavernTurnRuntime({
            sessionId: session.id,
            agentConfig: { provider: 'fake-provider', model: 'fake-model' },
            contextSnapshot: session.contextSnapshot || {},
            preset,
            currentUserMessage: 'Hello.',
            applySubstituteParams: identityApplySubstituteParams,
            buildNativeChatPrompt: async () => ({
                source: 'test-native-prompt',
                promptMessageCount: 1,
                messages: [{ role: 'user', content: 'Should not send.' }],
                currentUserMessageIndex: 0,
            }),
            executeRunOnce: async () => {
                providerCalls += 1;
                throw new Error('provider_should_not_run');
            },
        }),
        /native_prompt_regex_runtime_unavailable/,
    );
    assert.equal(providerCalls, 0);
});

test('xb tavern native prompt runtime fails before request when substitute hook is missing', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Missing substitute hook',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
    });
    let nativeBuilderCalls = 0;

    await assert.rejects(
        () => simulateXbTavernRequestRuntime({
            sessionId: session.id,
            agentConfig: {
                currentPresetName: '酒馆 OpenAI',
                presets: {
                    '酒馆 OpenAI': {
                        provider: 'sillytavern-openai-compatible',
                        modelConfigs: {
                            'sillytavern-openai-compatible': {
                                model: 'gpt-test',
                            },
                        },
                    },
                },
            },
            contextSnapshot: session.contextSnapshot || {},
            preset,
            currentUserMessage: 'Hello.',
            applyRegex: identityApplyRegex,
            buildNativeChatPrompt: async () => {
                nativeBuilderCalls += 1;
                return {
                    source: 'test-native-prompt',
                    promptMessageCount: 1,
                    messages: [{ role: 'user', content: 'Should not inspect.' }],
                    currentUserMessageIndex: 0,
                };
            },
        }),
        /native_prompt_substitute_params_runtime_unavailable/,
    );
    assert.equal(nativeBuilderCalls, 0);
});

test('xb tavern regex failure before sending preserves the raw user message without calling provider', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Regex failure',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
    });

    await assert.rejects(
        () => runXbTavernTurn({
            sessionId: session.id,
            agentConfig: { provider: 'fake-provider', model: 'fake-model' },
            contextSnapshot: session.contextSnapshot || {},
            preset,
            currentUserMessage: 'RAW_USER fails.',
            applyRegex: async () => {
                throw new Error('regex_failed_before_send');
            },
            executeRunOnce: async () => {
                throw new Error('provider_should_not_run');
            },
        }),
        /regex_failed_before_send/,
    );
    const messages = await listTavernMessages(session.id);
    assert.deepEqual(messages.map((message) => `${message.role}:${message.content}`), [
        'user:RAW_USER fails.',
    ]);
    assert.equal(messages[0]?.buildSnapshot, undefined);
    assert.equal(messages[0]?.requestSnapshot, undefined);
});

test('xb tavern native prompt build failure preserves the saved user message', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Native prompt failure',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
    });
    let providerCalls = 0;

    await assert.rejects(
        () => runXbTavernTurn({
            sessionId: session.id,
            agentConfig: { provider: 'fake-provider', model: 'fake-model' },
            contextSnapshot: session.contextSnapshot || {},
            preset,
            currentUserMessage: 'Keep this even if prompt building fails.',
            applyRegex: identityApplyRegex,
            applySubstituteParams: identityApplySubstituteParams,
            buildNativeChatPrompt: async () => {
                throw new Error('native_prompt_failed_before_provider');
            },
            executeRunOnce: async () => {
                providerCalls += 1;
                throw new Error('provider_should_not_run');
            },
        }),
        /native_prompt_failed_before_provider/,
    );

    assert.equal(providerCalls, 0);
    const messages = await listTavernMessages(session.id);
    assert.deepEqual(messages.map((message) => `${message.role}:${message.content}`), [
        'user:Keep this even if prompt building fails.',
    ]);
    assert.equal(messages[0]?.buildSnapshot, undefined);
    assert.equal(messages[0]?.requestSnapshot, undefined);
});

test('xb tavern applies native macro substitution to user input, world keys, world content, and final prompt JSON', async () => {
    await resetDb();
    const session = await createTavernSession({
        title: 'Macro substitution',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster', description: 'Pilot for {{user}}.' },
            user: { name: 'Player' },
            worldBooks: [{
                name: 'Lore',
                entries: [{
                    uid: 'macro-world',
                    key: ['{{char}} beacon'],
                    content: 'World says {{char}} trusts {{user}}.',
                }],
            }],
            worldSettings: {
                scanDepth: 2,
            },
        },
    });
    await appendTavernMessage(session.id, { role: 'assistant', content: 'Earlier {{char}} note.' });
    const applySubstituteParams = async (items: TavernSubstituteParamsItem[]) => ({
        items: items.map((item) => {
            const text = item.text
                .replace(/\{\{char\}\}/g, String(item.options?.name2Override || 'Aster'))
                .replace(/\{\{user\}\}/g, String(item.options?.name1Override || 'Player'));
            return {
                id: item.id,
                text,
                changed: text !== item.text,
            };
        }),
        changedCount: items.filter((item) => /\{\{(?:char|user)\}\}/.test(item.text)).length,
    });
    let providerMessagesJson = '';

    const result = await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        chatPreset: {
            sections: [{
                id: 'macro-preset',
                role: 'system',
                placement: 'top',
                content: 'Preset greets {{char}} and {{user}}.',
            }],
        },
        currentUserMessage: '{{char}} beacon from {{user}}.',
        applySubstituteParams,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            providerMessagesJson = JSON.stringify(options.messages);
            return {
                text: 'Done.',
                provider: 'fake-provider',
                model: 'fake-model',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    assert.match(providerMessagesJson, /Preset greets Aster and Player/);
    assert.match(providerMessagesJson, /Pilot for Player/);
    assert.match(providerMessagesJson, /World says Aster trusts Player/);
    assert.match(providerMessagesJson, /Earlier Aster note/);
    assert.match(providerMessagesJson, /Aster beacon from Player/);
    assert.doesNotMatch(providerMessagesJson, /\{\{char\}\}|\{\{user\}\}/);
    assert.match(result.requestSnapshot.rawRequestJson, /World says Aster trusts Player/);
    assert.doesNotMatch(result.requestSnapshot.rawRequestJson, /\{\{char\}\}|\{\{user\}\}/);
    const messages = await listTavernMessages(result.sessionId);
    assert.equal(messages.find((message) => message.role === 'user')?.content, 'Aster beacon from Player.');
});

test('xb tavern does not pass empty macro name overrides that would hide SillyTavern globals', async () => {
    await resetDb();
    const session = await createTavernSession({
        title: 'Macro fallback',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
            user: { name: '' },
        },
    });
    const seenOptions: Array<Record<string, unknown> | undefined> = [];
    const applySubstituteParams = async (items: TavernSubstituteParamsItem[]) => ({
        items: items.map((item) => {
            seenOptions.push(item.options as Record<string, unknown> | undefined);
            const charName = Object.prototype.hasOwnProperty.call(item.options || {}, 'name2Override')
                ? String(item.options?.name2Override ?? '')
                : 'GlobalChar';
            const userName = Object.prototype.hasOwnProperty.call(item.options || {}, 'name1Override')
                ? String(item.options?.name1Override ?? '')
                : 'GlobalUser';
            const text = item.text
                .replace(/\{\{char\}\}/g, charName)
                .replace(/\{\{user\}\}/g, userName);
            return {
                id: item.id,
                text,
                changed: text !== item.text,
            };
        }),
        changedCount: items.filter((item) => /\{\{(?:char|user)\}\}/.test(item.text)).length,
    });
    let providerMessagesJson = '';

    const result = await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        chatPreset: {
            sections: [{
                id: 'macro-fallback-preset',
                role: 'system',
                placement: 'top',
                content: 'Preset sees {{char}} and {{user}}.',
            }],
        },
        currentUserMessage: '{{char}} meets {{user}}.',
        applySubstituteParams,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            providerMessagesJson = JSON.stringify(options.messages);
            return {
                text: 'Done.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    assert.equal(seenOptions.some((options) => Object.prototype.hasOwnProperty.call(options || {}, 'name1Override')), false);
    assert.equal(seenOptions.some((options) => String(options?.name2Override || '') === 'Aster'), true);
    assert.match(providerMessagesJson, /Preset sees Aster and GlobalUser/);
    assert.match(providerMessagesJson, /Aster meets GlobalUser/);
    assert.equal((await listTavernMessages(result.sessionId)).find((message) => message.role === 'user')?.content, 'Aster meets GlobalUser.');
});

test('xb tavern memory recall keeps global state and deterministic character hits', () => {
    const context = {
        character: { name: 'Aster' },
        user: { name: 'Player' },
        history: [] as Array<{ role: 'assistant'; content: string }>,
    };
    const queryText = buildXbTavernMemoryQuery(context, 'Player：Aster 还记得银钥匙吗？');
    const ignoredTerms = buildXbTavernMemoryIgnoredTerms(context);
    const memoryFiles = [{
        sessionId: 'session',
        path: 'memory/state.md',
        content: '# 会话记忆\n\nAster 把银钥匙藏在码头钟楼下面。',
        status: 'active' as const,
        source: 'manager',
        createdAt: 1,
        updatedAt: 1,
    }, {
        sessionId: 'session',
        path: 'memory/characters/Aster.md',
        content: '# Aster\n\nAster 守着银钥匙。',
        status: 'active' as const,
        source: 'manager',
        createdAt: 2,
        updatedAt: 2,
    }, {
        sessionId: 'session',
        path: 'memory/characters/Mira.md',
        content: '# Mira\n\nMira 在远方。',
        status: 'active' as const,
        source: 'manager',
        createdAt: 3,
        updatedAt: 3,
    }];

    const memory = selectXbTavernMemoryContext({
        memoryFiles,
        queryText,
        ignoredTerms,
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), [
        'memory/state.md',
        'memory/characters/Aster.md',
    ]);
});

test('xb tavern memory query uses current input plus the last two history messages', () => {
    const queryText = buildXbTavernMemoryQuery({
        character: { name: 'Aster' },
        user: { name: 'Player' },
        history: [
            { role: 'user', content: 'old-1 银钥匙' },
            { role: 'assistant', content: 'old-2 码头' },
            { role: 'user', content: 'near-1 钟楼' },
            { role: 'assistant', content: 'near-2 暗门' },
        ],
    }, 'Player：继续');

    assert.match(queryText, /继续/);
    assert.match(queryText, /near-1/);
    assert.match(queryText, /near-2/);
    assert.match(queryText, /Aster/);
    assert.doesNotMatch(queryText, /old-1/);
    assert.doesNotMatch(queryText, /old-2/);
    assert.doesNotMatch(queryText, /Player：/);
});

test('xb tavern memory query applies story-summary text filter rules before entity recall', () => {
    const host = globalThis as unknown as {
        localStorage?: { getItem: (key: string) => string | null };
    };
    const previousStorage = host.localStorage;
    host.localStorage = {
        getItem: (key: string) => key === 'summary_panel_config'
            ? JSON.stringify({ textFilterRules: [{ start: '<status>', end: '</status>' }] })
            : null,
    };
    try {
        const queryText = buildXbTavernMemoryQuery({
            character: { name: 'Aster' },
            user: { name: 'Player' },
            history: [
                { role: 'assistant', content: '<status>莉娜 真昼 铁壁 都在状态栏里但不在场</status> Aster 看向门口。' },
            ],
        }, '<status>Mira 莉娜 真昼 铁壁</status> Aster 继续调查。');

        assert.match(queryText, /Aster 继续调查/);
        assert.doesNotMatch(queryText, /莉娜|真昼|铁壁|Mira|状态栏/);
    } finally {
        if (previousStorage) {
            host.localStorage = previousStorage;
        } else {
            delete host.localStorage;
        }
    }
});

test('xb tavern memory recall ignores non-memory and unmatched character files', () => {
    const memory = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/notes.md',
            content: '# 普通闲聊\n\n普通闲聊',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Mira.md',
            content: '# Mira\n\nMira 在远方。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }],
        queryText: '银钥匙在哪里？',
    });

    assert.deepEqual(memory.memoryFiles, []);
});

test('xb tavern memory recall keeps state memory without treating arbitrary lexical matches as entities', () => {
    const memory = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 路过记录\n\n银钥匙在码头，钟楼下面。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Mira.md',
            content: '# 银钥匙码头钟楼\n\n他们换了一个话题。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }],
        queryText: '银钥匙 码头 钟楼',
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), ['memory/state.md']);
});

test('xb tavern memory recall excludes generic user/player character files', () => {
    const memory = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 会话记忆\n\n玩家和 Aster 正在档案室。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/User.md',
            content: '# User\n\n不应作为人物实体注入。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }, {
            sessionId: 'session',
            path: 'memory/characters/玩家.md',
            content: '# 玩家\n\n不应作为人物实体注入。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 3,
            updatedAt: 3,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Aster.md',
            content: '# Aster\n\nAster 正在档案室。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 4,
            updatedAt: 4,
        }],
        queryText: 'User 玩家 Aster 都被提到了。',
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), [
        'memory/state.md',
        'memory/characters/Aster.md',
    ]);
});

test('xb tavern memory recall matches character filenames with normalized Japanese entity text', () => {
    const memory = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 赤いお守り\n\n凛音は古い神社で赤いお守りを隠した。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/凛音.md',
            content: '# 凛音\n\n赤いお守りを持つ。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }],
        queryText: '凛音の赤いお守りはどこ？',
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), [
        'memory/state.md',
        'memory/characters/凛音.md',
    ]);
});

test('xb tavern memory recall excludes user names with the same entity normalization as character names', () => {
    const context = {
        character: { name: 'Aster' },
        user: { name: 'John Doe' },
        history: [] as Array<{ role: 'assistant'; content: string }>,
    };
    const memory = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 会话记忆\n\nJohn Doe 收到了银钥匙。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/John Doe.md',
            content: '# John Doe\n\n玩家自己的记忆不该作为角色实体注入。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }],
        queryText: buildXbTavernMemoryQuery(context, 'John Doe：继续调查银钥匙。'),
        ignoredTerms: buildXbTavernMemoryIgnoredTerms(context),
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), ['memory/state.md']);
});

test('xb tavern memory recall rejects short latin substring entity hits', () => {
    const memory = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 会话记忆\n\nAlice 在档案室。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Al.md',
            content: '# Al\n\n短名不应该因为 also 被命中。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Alice.md',
            content: '# Alice\n\nAlice 正在档案室。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 3,
            updatedAt: 3,
        }],
        queryText: 'also ask Alice about the archive',
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), [
        'memory/state.md',
        'memory/characters/Alice.md',
    ]);
});

test('xb tavern memory recall uses token boundaries for latin character names', () => {
    const memory = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 会话记忆\n\nTom Hardy 在码头留下过线索。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Tom.md',
            content: '# Tom\n\nTom 的人物记忆。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Tom Hardy.md',
            content: '# Tom Hardy\n\nTom Hardy 的人物记忆。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 3,
            updatedAt: 3,
        }],
        queryText: 'tomorrow custom bottom. Tom-Hardy just arrived.',
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), [
        'memory/state.md',
        'memory/characters/Tom Hardy.md',
    ]);

    const miss = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 会话记忆\n\n普通状态。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Tom.md',
            content: '# Tom\n\nTom 的人物记忆。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }],
        queryText: 'tomorrow custom bottom',
    });

    assert.deepEqual(miss.memoryFiles?.map((file) => file.path), ['memory/state.md']);

    const shortNameHit = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 会话记忆\n\n普通状态。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Tom.md',
            content: '# Tom\n\nTom 的人物记忆。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }],
        queryText: 'Tom went home.',
    });
    assert.deepEqual(shortNameHit.memoryFiles?.map((file) => file.path), [
        'memory/state.md',
        'memory/characters/Tom.md',
    ]);

    const shortNameInsideFullName = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 会话记忆\n\n普通状态。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Tom.md',
            content: '# Tom\n\nTom 的人物记忆。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }],
        queryText: 'Tom Hardy arrived.',
    });
    assert.deepEqual(shortNameInsideFullName.memoryFiles?.map((file) => file.path), ['memory/state.md']);
});

test('xb tavern memory recall does not remove ignored user keys from unrelated entity names', () => {
    const context = {
        character: { name: 'Alice' },
        user: { name: 'Al' },
        history: [] as Array<{ role: 'assistant'; content: string }>,
    };
    const memory = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 会话记忆\n\nAlice 在档案室。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Alice.md',
            content: '# Alice\n\nAlice 正在档案室。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }],
        queryText: buildXbTavernMemoryQuery(context, 'Alice 还在吗？'),
        ignoredTerms: buildXbTavernMemoryIgnoredTerms(context),
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), [
        'memory/state.md',
        'memory/characters/Alice.md',
    ]);
});

test('xb tavern memory recall keeps state memory only once', () => {
    const memory = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 银钥匙 码头 钟楼\n\nAster 把银钥匙藏在码头钟楼下面。银钥匙。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/notes.md',
            content: '# 临时笔记\n\n银钥匙在这里也出现。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }],
        queryText: '银钥匙 码头 钟楼',
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), ['memory/state.md']);
});

test('xb tavern memory recall does not depend on tokenizer availability', () => {
    const memory = selectXbTavernMemoryContext({
        memoryFiles: [{
            sessionId: 'session',
            path: 'memory/state.md',
            content: '# 银钥匙\n\n银钥匙藏在码头钟楼下面。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 1,
            updatedAt: 1,
        }, {
            sessionId: 'session',
            path: 'memory/characters/Aster.md',
            content: '# Aster\n\nAster 知道银钥匙。',
            status: 'active' as const,
            source: 'manager',
            createdAt: 2,
            updatedAt: 2,
        }],
        queryText: 'Aster，银钥匙在哪里？',
    });

    assert.deepEqual(memory.memoryFiles?.map((file) => file.path), [
        'memory/state.md',
        'memory/characters/Aster.md',
    ]);
});

test('xb tavern provider resolver reports shared API readiness and request audit metadata', () => {
    const missing = resolveXbTavernProviderConfig({
        currentPresetName: '默认',
        presets: {
            默认: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': {
                        baseUrl: 'https://example.com/v1',
                        model: '',
                        apiKey: '',
                    },
                },
            },
        },
    });
    assert.equal(missing.readiness.ok, false);
    assert.deepEqual(missing.readiness.missing, ['模型', 'API Key']);

    const ready = resolveXbTavernProviderConfig({
        currentPresetName: '酒馆 Claude',
        presets: {
            '酒馆 Claude': {
                provider: 'sillytavern-claude',
                modelConfigs: {
                    'sillytavern-claude': {
                        model: 'claude-sonnet-4-0',
                        apiKey: '',
                    },
                },
            },
        },
    });
    assert.equal(ready.readiness.ok, true);
    assert.equal(ready.currentPresetName, '酒馆 Claude');
    assert.equal(ready.providerLabel, '酒馆 Claude');

    const onlyMainConfig = {
        currentPresetName: '主剧情',
        presets: {
            主剧情: {
                provider: 'sillytavern-claude',
                modelConfigs: {
                    'sillytavern-claude': { model: 'ready-main-model' },
                },
            },
        },
    };
    const onlyMainDelegate = resolveXbTavernProviderConfig(onlyMainConfig, { role: 'delegate' });
    assert.equal(onlyMainDelegate.readiness.ok, false);
    assert.deepEqual(onlyMainDelegate.readiness.missing, ['分身模型']);
    assert.match(onlyMainDelegate.readiness.message, /配置分身模型/);
    assert.equal(onlyMainDelegate.provider, '');
    assert.equal(onlyMainDelegate.model, '');

    const emptyDelegate = resolveXbTavernProviderConfig({
        ...onlyMainConfig,
        delegateConfig: {},
        delegateConfigured: true,
    }, { role: 'delegate' });
    assert.equal(emptyDelegate.readiness.ok, false);
    assert.deepEqual(emptyDelegate.readiness.missing, ['分身模型']);
    assert.match(emptyDelegate.readiness.message, /配置分身模型/);
    assert.equal(emptyDelegate.provider, '');
    assert.equal(emptyDelegate.model, '');

    const delegate = resolveXbTavernProviderConfig({
        currentPresetName: '主剧情',
        delegatePresetName: '任务分身',
        presets: {
            主剧情: {
                provider: 'sillytavern-claude',
                modelConfigs: {
                    'sillytavern-claude': { model: 'main-story-model' },
                },
            },
            任务分身: {
                provider: 'sillytavern-google',
                modelConfigs: {
                    'sillytavern-google': { model: 'delegate-task-model' },
                },
            },
        },
        delegateConfig: {
            provider: 'sillytavern-google',
            modelConfigs: {
                'sillytavern-google': { model: 'delegate-task-model' },
            },
        },
    }, { role: 'delegate' });
    assert.equal(delegate.readiness.ok, true);
    assert.equal(delegate.currentPresetName, '任务分身');
    assert.equal(delegate.provider, 'sillytavern-google');
    assert.equal(delegate.model, 'delegate-task-model');
    const delegateSnapshot = buildTavernRequestSnapshot({}, [{ role: 'user', content: 'Generate tasks.' }], {
        resolvedProviderConfig: delegate,
    });
    assert.equal(delegateSnapshot.apiPresetName, '任务分身');
    assert.equal(delegateSnapshot.provider, 'sillytavern-google');
    assert.equal(delegateSnapshot.model, 'delegate-task-model');

    const incompleteDelegate = resolveXbTavernProviderConfig({
        currentPresetName: '主剧情',
        delegatePresetName: '任务分身',
        presets: {
            主剧情: {
                provider: 'sillytavern-claude',
                modelConfigs: {
                    'sillytavern-claude': { model: 'ready-main-model' },
                },
            },
            任务分身: {
                provider: 'openai-compatible',
                modelConfigs: {
                    'openai-compatible': { model: '', apiKey: '' },
                },
            },
        },
        delegateConfig: {
            provider: 'openai-compatible',
            modelConfigs: {
                'openai-compatible': { model: '', apiKey: '' },
            },
        },
    }, { role: 'delegate' });
    assert.equal(incompleteDelegate.readiness.ok, false);
    assert.deepEqual(incompleteDelegate.readiness.missing, ['模型', 'API Key']);
    assert.match(incompleteDelegate.readiness.message, /配置分身模型/);
    assert.notEqual(incompleteDelegate.model, 'ready-main-model');

    const snapshot = buildTavernRequestSnapshot({
        currentPresetName: '酒馆 Claude',
        presets: {
            '酒馆 Claude': {
                provider: 'sillytavern-claude',
                modelConfigs: {
                    'sillytavern-claude': {
                        model: 'claude-sonnet-4-0',
                    },
                },
            },
        },
    }, [{ role: 'user', content: 'Hello.' }]);
    assert.equal(snapshot.presetName, '酒馆 Claude');
    assert.equal(snapshot.providerLabel, '酒馆 Claude');
    assert.equal(snapshot.model, 'claude-sonnet-4-0');
    assert.match(snapshot.rawRequestJson, /"request"/);
    assert.match(snapshot.rawRequestJson, /"messages"/);

    const inspectionErrorSnapshot = buildTavernRequestSnapshot({
        provider: 'fake-provider',
        model: 'fake-model',
    }, [{ role: 'user', content: 'Hello.' }], {
        requestKind: 'actual',
        requestInspectionError: 'inspect_failed_for_test',
    });
    assert.equal(inspectionErrorSnapshot.requestKind, 'actual');
    assert.equal(inspectionErrorSnapshot.requestInspectionError, 'inspect_failed_for_test');
    assert.match(inspectionErrorSnapshot.rawRequestJson, /"transport": "inspection-error"/);
    assert.match(inspectionErrorSnapshot.rawRequestJson, /inspect_failed_for_test/);
    assert.doesNotMatch(inspectionErrorSnapshot.rawRequestJson, /"transport": "unavailable"/);
});

test('xb tavern simulated request builds raw API JSON without saving chat messages', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Aster',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster', description: 'A careful scout.' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '只模拟，不发送。',
    });
    assert.equal(result.requestSnapshot.requestKind, 'simulated');
    assert.match(result.requestSnapshot.rawRequestJson, /"url": "\/api\/backends\/chat-completions\/generate"/);
    assert.match(result.requestSnapshot.rawRequestJson, /"stream": true/);
    assert.match(result.requestSnapshot.rawRequestJson, /只模拟，不发送。/);
    assert.deepEqual(await listTavernMessages(session.id), []);
});

test('formal tasks enter both local and ST-native depth-1 prompts while board candidates stay out', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Formal task prompt',
        characterKey: 'char-task-prompt',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-task-prompt', name: 'Aster', description: 'A careful courier.' },
            user: { name: '测试玩家' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    await createRunTurnActiveTask(session.id, 'prompt');
    let nativeDepthPrompts: Array<{ layer?: string; depth?: number; role?: string; content?: string }> = [];
    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': { model: 'gpt-test' },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '查看当前目标。',
        buildNativeChatPrompt: async (input) => {
            nativeDepthPrompts = input.runtimeDepthPrompts;
            return {
                source: 'test-native-task-prompt',
                promptMessageCount: input[TAVERN_LOCAL_PROMPT_MESSAGES]?.length || 0,
                messages: input[TAVERN_LOCAL_PROMPT_MESSAGES] || [],
                currentUserMessageIndex: (input[TAVERN_LOCAL_PROMPT_MESSAGES] || []).findIndex((message) => (
                    message.role === 'user' && message.content === input.currentUserMessage
                )),
            };
        },
    });

    const taskDepth = (nativeDepthPrompts || []).find((entry) => entry.layer === 'runtime-task');
    assert.equal(taskDepth?.depth, 1);
    assert.equal(taskDepth?.role, 'system');
    assert.match(String(taskDepth?.content || ''), /《运行时委托 3》/);
    assert.match(String(taskDepth?.content || ''), /完成运行时目标 3/);
    assert.match(result.buildSnapshot.rawMessagesJson, /<active_tasks>/);
    assert.match(result.requestSnapshot.rawRequestJson, /完成运行时目标 3/);
    assert.doesNotMatch(result.requestSnapshot.rawRequestJson, /完成运行时目标 1|完成运行时目标 2|完成运行时目标 4/);
});

test('active shop effects close the system message before USER in local and ST-native prompts', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Shop prompt',
        characterKey: 'char-shop-prompt',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-shop-prompt', name: 'Aster', description: 'A careful courier.' },
            user: { name: '测试玩家' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    const boundary = await captureTavernPhoneBoundary(session.id);
    const purchased = await purchaseTavernShopItem({
        sessionId: session.id,
        itemId: 'no-anger-sticker',
        actionId: 'prompt-buy-sticker',
        boundary,
        expectedRevision: 0,
        expectedVersionId: '',
    });
    await activateTavernShopItem({
        sessionId: session.id,
        itemId: 'no-anger-sticker',
        parameters: { targetName: '艾拉' },
        actionId: 'prompt-use-sticker',
        boundary,
        expectedRevision: purchased.record.revision,
        expectedVersionId: purchased.record.versionId,
    });
    let nativeDepthPrompts: Array<{ layer?: string; depth?: number; role?: string; content?: string }> = [];
    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': { model: 'gpt-test' },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '继续。',
        buildNativeChatPrompt: async (input) => {
            nativeDepthPrompts = (input.runtimeDepthPrompts || []) as Array<{ layer?: string; depth?: number; role?: string; content?: string }>;
            const local = (input[TAVERN_LOCAL_PROMPT_MESSAGES] || []) as XbTavernMessage[];
            // Simulate the ST host scattering the shop block into a standalone,
            // wrongly-ordered system message (dictionary-ordered extension prompts).
            const moved: XbTavernMessage[] = [];
            let shopBlock = '';
            for (const message of local) {
                if (message.role === 'system' && String(message.content).includes('## 当前生效道具')) {
                    shopBlock = String(message.content).match(/## 当前生效道具[\s\S]*<\/shop_effect>/)?.[0] || '';
                    const stripped = String(message.content).replace(/## 当前生效道具[\s\S]*<\/shop_effect>/, '').trim();
                    if (stripped) {moved.push({ ...message, content: stripped });}
                    continue;
                }
                moved.push(message);
            }
            if (shopBlock) {moved.unshift({ role: 'system', content: shopBlock });}
            moved.push({ role: 'user', content: 'depth-0 user after current USER' });
            return {
                source: 'test-native-shop-prompt',
                promptMessageCount: moved.length,
                messages: moved,
                currentUserMessageIndex: moved.findIndex((message) => (
                    message.role === 'user' && message.content === input.currentUserMessage
                )),
            };
        },
    });

    const shopDepth = (nativeDepthPrompts || []).find((entry) => entry.layer === 'runtime-shop');
    assert.equal(shopDepth?.depth, 1);
    assert.equal(shopDepth?.role, 'system');
    assert.match(String(shopDepth?.content || ''), /## 当前生效道具/);

    const finalMessages = result.buildResult.messages;
    assert.equal(
        finalMessages.filter((message) => String(message.content).includes('## 当前生效道具')).length,
        1,
        'the shop block must appear exactly once in the final request',
    );
    const currentUserIndex = finalMessages.findIndex((message) => message.content === '继续。');
    const depthZeroUserAfterCurrentIndex = finalMessages.findIndex((message) => message.content === 'depth-0 user after current USER');
    assert.ok(currentUserIndex > 0);
    assert.ok(depthZeroUserAfterCurrentIndex > currentUserIndex);
    const beforeUser = finalMessages[currentUserIndex - 1];
    assert.equal(beforeUser.role, 'system');
    assert.match(String(beforeUser.content), /## 当前生效道具[\s\S]*<\/shop_effect>\s*$/, 'shop block must be the last block before USER');
    assert.match(String(beforeUser.content), /剩余主回合：5/);
    assert.match(result.requestSnapshot.rawRequestJson, /## 当前生效道具/);
});

test('reroll uses the shop state at the original user turn and excludes later activations', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Shop reroll anchor',
        characterKey: 'char-shop-reroll',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-shop-reroll', name: 'Aster', description: 'A careful courier.' },
            user: { name: '测试玩家' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    const initialBoundary = await captureTavernPhoneBoundary(session.id);
    const firstPurchase = await purchaseTavernShopItem({
        sessionId: session.id,
        itemId: 'flower',
        actionId: 'reroll-buy-first-flower',
        boundary: initialBoundary,
        expectedRevision: 0,
        expectedVersionId: '',
    });
    const firstActivation = await activateTavernShopItem({
        sessionId: session.id,
        itemId: 'flower',
        parameters: { targetName: '艾拉' },
        actionId: 'reroll-use-first-flower',
        boundary: initialBoundary,
        expectedRevision: firstPurchase.record.revision,
        expectedVersionId: firstPurchase.record.versionId,
    });
    const execute = async (options: TavernRunOnceOptions) => ({
        text: 'Aster replies.',
        provider: 'fake-provider',
        model: 'fake-model',
        finishReason: 'stop',
        requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
            provider: 'fake-provider',
            model: 'fake-model',
        }),
    });
    await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '把花递给艾拉。',
        executeRunOnce: execute,
    });

    const laterBoundary = await captureTavernPhoneBoundary(session.id);
    const secondPurchase = await purchaseTavernShopItem({
        sessionId: session.id,
        itemId: 'flower',
        actionId: 'reroll-buy-later-flower',
        boundary: laterBoundary,
        expectedRevision: firstActivation.record.revision,
        expectedVersionId: firstActivation.record.versionId,
    });
    await activateTavernShopItem({
        sessionId: session.id,
        itemId: 'flower',
        parameters: { targetName: '贝塔' },
        actionId: 'reroll-use-later-flower',
        boundary: laterBoundary,
        expectedRevision: secondPurchase.record.revision,
        expectedVersionId: secondPurchase.record.versionId,
    });

    let rerollPrompt = '';
    await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '',
        rerollLatestAssistant: true,
        executeRunOnce: async (options) => {
            rerollPrompt = options.messages.map((message) => String(message.content || '')).join('\n');
            return await execute(options);
        },
    });
    assert.match(rerollPrompt, /"targetName":"艾拉"/);
    assert.doesNotMatch(rerollPrompt, /"targetName":"贝塔"/);
});

test('normal RP uses the current USER anchor and excludes Shop activations made after it was saved', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Shop normal turn anchor',
        characterKey: 'char-shop-normal-anchor',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-shop-normal-anchor', name: 'Aster', description: 'A careful courier.' },
            user: { name: '测试玩家' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    const initialBoundary = await captureTavernPhoneBoundary(session.id);
    const firstPurchase = await purchaseTavernShopItem({
        sessionId: session.id,
        itemId: 'flower',
        actionId: 'normal-anchor-buy-first',
        boundary: initialBoundary,
        expectedRevision: 0,
        expectedVersionId: '',
    });
    const firstActivation = await activateTavernShopItem({
        sessionId: session.id,
        itemId: 'flower',
        parameters: { targetName: '艾拉' },
        actionId: 'normal-anchor-use-first',
        boundary: initialBoundary,
        expectedRevision: firstPurchase.record.revision,
        expectedVersionId: firstPurchase.record.versionId,
    });
    let capturedPrompt = '';
    let activatedAfterCurrentUser = false;
    await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '我把另一束花放到桌上。',
        onUserMessageSaved: async (sessionId) => {
            if (activatedAfterCurrentUser) {return;}
            activatedAfterCurrentUser = true;
            const boundary = await captureTavernPhoneBoundary(sessionId);
            const current = await getCurrentTavernShopState(sessionId);
            const laterPurchase = await purchaseTavernShopItem({
                sessionId,
                itemId: 'flower',
                actionId: 'normal-anchor-buy-later',
                boundary,
                expectedRevision: current?.revision || 0,
                expectedVersionId: current?.versionId || '',
            });
            await activateTavernShopItem({
                sessionId,
                itemId: 'flower',
                parameters: { targetName: '贝塔' },
                actionId: 'normal-anchor-use-later',
                boundary,
                expectedRevision: laterPurchase.record.revision,
                expectedVersionId: laterPurchase.record.versionId,
            });
        },
        executeRunOnce: async (options) => {
            capturedPrompt = options.messages.map((message) => String(message.content || '')).join('\n');
            return {
                text: 'Aster replies.',
                provider: 'fake-provider',
                model: 'fake-model',
                finishReason: 'stop',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    provider: 'fake-provider',
                    model: 'fake-model',
                }),
            };
        },
    });
    assert.equal(firstActivation.record.state.items.flower.activations.length, 1);
    assert.match(capturedPrompt, /"targetName":"艾拉"/);
    assert.doesNotMatch(capturedPrompt, /"targetName":"贝塔"/);
});

test('xb tavern world entry substitution skips null worldbook records', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const loreEntry = {
        uid: 'lore-1',
        key: ['Aster'],
        content: '{{char}} meets {{user}} in the old hall.',
        sourceWorldBook: 'BrokenLore',
        world: 'BrokenLore',
        position: 0,
    };
    const contextSnapshot = {
        character: { characterKey: 'char-1', name: 'Aster', description: 'A careful scout.' },
        user: { name: 'Player' },
        worldBooks: [
            null,
            { name: 'BrokenLore', entries: [null, loreEntry] },
        ],
        worldEntries: [null, loreEntry],
    } as unknown as Parameters<typeof simulateXbTavernRequest>[0]['contextSnapshot'];
    const session = await createTavernSession({
        title: 'Aster',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot,
        presetId: preset.id,
        presetName: preset.name,
    });
    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot,
        preset,
        currentUserMessage: 'Aster 继续前进。',
        applySubstituteParams: async (items: TavernSubstituteParamsItem[]) => ({
            items: items.map((item) => ({
                id: item.id,
                text: item.text.replace(/\{\{char\}\}/g, 'Aster').replace(/\{\{user\}\}/g, 'Player'),
                changed: item.text.includes('{{'),
            })),
            changedCount: items.filter((item) => item.text.includes('{{')).length,
        }),
    });
    assert.match(result.buildSnapshot.rawMessagesJson, /Aster meets Player in the old hall\./);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /null/);
});

test('xb tavern simulated request keeps active map digest in snapshot without injecting legacy prompt fallback', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Map digest',
        characterKey: 'char-map',
        characterName: 'Mapper',
        contextSnapshot: {
            character: { characterKey: 'char-map', name: 'Mapper', description: 'A cartographer.' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'init',
            document: {
                meta: { name: 'Hidden Cellar', theme: 'parchment', viewBox: [0, 0, 500, 400] },
                elements: [
                    { id: 'cellar-room', type: 'rect', pos: [30, 30], size: [120, 80], cat: 'wall' },
                    { id: 'cellar-label', type: 'text', pos: [90, 80], content: 'Cellar', cat: 'label' },
                ],
            },
        }],
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'office',
        activate: true,
        ops: [{
            op: 'meta',
            set: { name: 'Office', theme: 'parchment', viewBox: [0, 0, 500, 400], status: 'active', mood: 'cold' },
        }, {
            op: 'add',
            element: { id: 'office-desk', at: [80, 80], rect: [120, 60], cat: 'furniture', text: 'Desk', material: 'metal' },
        }],
    });

    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '我看向地窖。',
    });

    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /状态摘要/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /空间地图状态/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /Office/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /Desk/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /可互动/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /氛围：|材质：|cold|metal/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /Hidden Cellar/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /revision 1|tavern\.map\/office|tavern\.map\/main|docId|docType/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /"elements"/);
    assert.equal(result.buildSnapshot.structuredStates?.[0]?.docType, 'tavern.map');
    assert.equal(result.buildSnapshot.structuredStates?.[0]?.docId, 'office');
    assert.equal(result.buildSnapshot.structuredStates?.[0]?.revision, 1);
    assert.ok(Number(result.buildSnapshot.structuredStates?.[0]?.digestChars) > 0);
});

test('xb tavern simulated request keeps main map digest in snapshot when active map id is orphaned', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Map digest fallback',
        characterKey: 'char-map-fallback',
        characterName: 'Mapper',
        contextSnapshot: {
            character: { characterKey: 'char-map-fallback', name: 'Mapper', description: 'A cartographer.' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'main',
        ops: [{
            op: 'meta',
            set: { name: 'Main Square', theme: 'parchment', viewBox: [0, 0, 500, 400], status: 'active' },
        }, {
            op: 'add',
            element: { id: 'square', at: [40, 40], rect: [90, 90], cat: 'terrain', text: 'Square' },
        }],
    });
    await executeTavernStateTool(session.id, 'MapPatch', {
        docId: 'office',
        activate: true,
        ops: [{
            op: 'meta',
            set: { name: 'Office', theme: 'parchment', viewBox: [0, 0, 500, 400], status: 'active' },
        }, {
            op: 'add',
            element: { id: 'office-desk', at: [80, 80], rect: [120, 60], cat: 'furniture', text: 'Desk' },
        }],
    });
    await updateTavernSessionState(session.id, { activeMapDocId: 'missing-map' });

    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '我回到广场。',
    });

    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /状态摘要/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /Main Square/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /Square/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /Office/);
    assert.equal(result.buildSnapshot.structuredStates?.[0]?.docId, 'main');
});

test('xb tavern simulated request injects only memory files when cartography is disabled', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Memory only contract',
        characterKey: 'char-memory',
        characterName: 'Archivist',
        contextSnapshot: {
            character: { characterKey: 'char-memory', name: 'Archivist', description: 'Keeps notes.' },
        },
        presetId: preset.id,
        presetName: preset.name,
        state: {
            contract: mergeTavernSessionContract(undefined, {
                memoryArchiving: true,
                cartographyEngine: false,
            }),
        },
    });
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nSECRET_MEMORY_NOTE', { source: 'user' });
    await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'meta',
            set: {
                name: 'Hidden Cellar',
                viewBox: [0, 0, 500, 400],
                status: 'active',
            },
        }, {
            op: 'add',
            element: { id: 'cellar-room', at: [30, 30], rect: [120, 80], cat: 'wall' },
        }],
    });

    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '把档案给我。',
    });

    assert.match(result.buildSnapshot.rawMessagesJson, /SECRET_MEMORY_NOTE/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /可视化结构状态摘要/);
    assert.equal(result.buildSnapshot.structuredStates, undefined);
});

test('xb tavern simulated request does not inject legacy structured state prompt when memory archiving is disabled', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Map only contract',
        characterKey: 'char-map-only',
        characterName: 'Scout',
        contextSnapshot: {
            character: { characterKey: 'char-map-only', name: 'Scout', description: 'Checks routes.' },
        },
        presetId: preset.id,
        presetName: preset.name,
        state: {
            contract: mergeTavernSessionContract(undefined, {
                memoryArchiving: false,
                cartographyEngine: true,
            }),
        },
    });
    await writeTavernMemoryFile(session.id, 'memory/state.md', '# 会话记忆\n\nSECRET_MEMORY_NOTE', { source: 'user' });
    await executeTavernStateTool(session.id, 'MapPatch', {
        ops: [{
            op: 'meta',
            set: {
                name: 'River Road',
                viewBox: [0, 0, 500, 400],
                status: 'active',
            },
        }, {
            op: 'add',
            element: { id: 'camp', at: [120, 90], rect: [180, 120], cat: 'terrain' },
        }],
    });

    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '前面有什么路？',
    });

    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /状态摘要/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /River Road/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /SECRET_MEMORY_NOTE/);
    assert.doesNotMatch(result.buildSnapshot.rawMessagesJson, /记忆|memory\/session\.md|tavern\.map\/main|revision/);
    assert.equal(result.buildSnapshot.structuredStates?.[0]?.docId, 'main');
});

test('xb tavern simulated request ignores unusable empty session snapshots', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: '旧空会话',
        characterKey: '',
        characterName: '',
        contextSnapshot: {},
        presetId: preset.id,
        presetName: preset.name,
    });
    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: {
            character: {
                characterKey: 'char-live',
                name: 'Live Aster',
                description: 'Live character card.',
            },
            worldBooks: [{
                name: 'Live Lore',
                entries: [{
                    uid: 'live-lore',
                    content: 'Live constant lore.',
                    constant: true,
                }],
            }],
        },
        preset,
        currentUserMessage: '模拟当前资料。',
    });

    assert.match(result.requestSnapshot.rawRequestJson, /<character_card>/);
    assert.match(result.requestSnapshot.rawRequestJson, /Live Aster/);
    assert.match(result.requestSnapshot.rawRequestJson, /Live constant lore/);
});

test('xb tavern simulated request rejects system-name sessions with a different live character', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: '坏快照',
        characterKey: 'system',
        characterName: 'SillyTavern System',
        contextSnapshot: {
            character: {
                characterKey: 'system',
                name: 'SillyTavern System',
            },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    await assert.rejects(
        () => simulateXbTavernRequest({
            sessionId: session.id,
            agentConfig: {
                currentPresetName: '酒馆 OpenAI',
                presets: {
                    '酒馆 OpenAI': {
                        provider: 'sillytavern-openai-compatible',
                        modelConfigs: {
                            'sillytavern-openai-compatible': {
                                model: 'gpt-test',
                            },
                        },
                    },
                },
            },
            contextSnapshot: {
                character: {
                    characterKey: 'seraphina',
                    name: 'Seraphina',
                    description: 'A real character card.',
                },
                worldBooks: [{
                    name: 'Seraphina Lore',
                    entries: [{
                        uid: 'seraphina-lore',
                        content: 'Seraphina constant lore.',
                        constant: true,
                    }],
                }],
            },
            preset,
            currentUserMessage: '继续。',
        }),
        /会话角色身份不匹配/,
    );
});

test('xb tavern runtime keeps capability registry empty until agent tools are added', () => {
    const provider = resolveXbTavernProviderConfig({
        currentPresetName: '默认',
        presets: {
            默认: {
                provider: 'sillytavern-claude',
                modelConfigs: {
                    'sillytavern-claude': { model: 'claude-sonnet-4-0' },
                },
            },
        },
    });
    const runtime = createXbTavernAgentRuntime(provider);
    const task = runtime.buildChatTask({
        messages: [{ role: 'user', content: 'Hello.' }],
    });
    assert.deepEqual(runtime.capabilities, EMPTY_XB_TAVERN_CAPABILITY_REGISTRY);
    assert.deepEqual(task.tools, []);
    assert.equal(task.toolChoice, 'none');
});

test('xb tavern manager web search uses the shared Tavily tool definition', () => {
    assert.equal(
        getTavernManagerToolDefinitions()
            .some((definition) => definition.function.name === TAVILY_TOOL_NAME),
        false,
    );

    const webSearch = getTavernManagerToolDefinitions({ webSearchEnabled: true })
        .find((definition) => definition.function.name === TAVILY_TOOL_NAME);

    assert.deepEqual(webSearch, getTavilySearchToolDefinition());
});

test('assistant manual chat receives formal tasks as read-only context without task mutation tools', async () => {
    await resetDb();
    const session = await createTavernSession({
        title: 'Read-only assistant tasks',
        contextSnapshot: {
            character: { characterKey: 'char-task-chat', name: 'Aster' },
            user: { name: '测试玩家' },
        },
    });
    const task = await createRunTurnActiveTask(session.id, 'manual-chat');
    let requestMessages = '';
    let toolNames: string[] = [];
    const result = await runXbTavernManagerChat({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        question: '我现在接了什么任务？',
        executeManagerOnce: async (options) => {
            requestMessages = JSON.stringify(options.messages);
            toolNames = (options.tools || [])
                .map((tool) => String((tool as { function?: { name?: string } }).function?.name || ''))
                .filter(Boolean);
            return {
                text: '你正在处理一项正式委托。',
                provider: 'fake-provider',
                model: 'fake-model',
            };
        },
    });

    assert.equal(result.ok, true);
    assert.match(requestMessages, /formal_phone_tasks_read_only/);
    assert.match(requestMessages, new RegExp(task.taskId));
    assert.match(requestMessages, /不得据此执行任务状态变化、托管、付款或退款/);
    const taskToolNames = new Set<string>(Object.values(TAVERN_TASK_TOOL_NAMES));
    assert.deepEqual(toolNames.filter((name) => taskToolNames.has(name)), []);
});

test('xb tavern assistant manual chat exposes and executes web_search from shared API config', async () => {
    await resetDb();
    const session = await createTavernSession({
        title: 'Manager web search',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
    });
    const originalFetch = globalThis.fetch;
    const fetchCalls: Array<{ url: string; body: Record<string, unknown> }> = [];
    globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
        fetchCalls.push({
            url: String(url),
            body: JSON.parse(String(init?.body || '{}')),
        });
        return {
            ok: true,
            async json() {
                return {
                    results: [{
                        title: 'Kyoto Gion history',
                        url: 'https://example.test/gion',
                        content: 'Gion is a historic Kyoto district.',
                        score: 0.92,
                    }],
                };
            },
            async text() {
                return '';
            },
        } as Response;
    }) as typeof fetch;

    try {
        let requestCount = 0;
        let exposedToolNames: string[] = [];
        let managerSystemPrompt = '';
        const executeManagerOnce = Object.assign(async (options: XbTavernManagerOnceOptions) => {
            requestCount += 1;
            if (requestCount === 1) {
                exposedToolNames = (Array.isArray(options.tools) ? options.tools : [])
                    .map((tool) => String((tool as { function?: { name?: string } })?.function?.name || ''))
                    .filter(Boolean);
                managerSystemPrompt = String(options.messages?.[0]?.content || '');
                return {
                    text: '',
                    provider: 'fake-provider',
                    model: 'fake-model',
                    toolCalls: [{
                        id: 'search-gion',
                        name: TAVILY_TOOL_NAME,
                        arguments: JSON.stringify({ query: 'Kyoto Gion history', maxResults: 3 }),
                    }],
                };
            }
            assert.equal(options.messages.length, 0);
            assert.equal(options.toolResponses?.[0]?.name, TAVILY_TOOL_NAME);
            const response = options.toolResponses?.[0]?.response as Record<string, unknown> | undefined;
            assert.equal(response?.ok, true);
            assert.equal(response?.query, 'Kyoto Gion history');
            assert.equal(response?.count, 1);
            return {
                text: '已查到祇园是京都历史街区。',
                provider: 'fake-provider',
                model: 'fake-model',
            };
        }, { supportsSessionToolLoop: true });

        const result = await runXbTavernManagerChat({
            sessionId: session.id,
            agentConfig: {
                tavilyApiKey: 'test-tavily-key',
                tavilyBaseUrl: 'https://tavily.example.test',
                currentPresetName: '默认',
                presets: {
                    默认: {
                        provider: 'fake-provider',
                        modelConfigs: {
                            'fake-provider': { model: 'fake-model', apiKey: 'not-used' },
                        },
                    },
                },
            },
            question: '帮我查一下祇园历史背景。',
            executeManagerOnce,
        });

        assert.equal(result.ok, true);
        assert.equal(result.text, '已查到祇园是京都历史街区。');
        assert.equal(requestCount, 2);
        assert.equal(exposedToolNames.includes(TAVILY_TOOL_NAME), true);
        assert.match(managerSystemPrompt, /Web research:/);
        assert.match(managerSystemPrompt, /web_search/);
        assert.equal(fetchCalls.length, 1);
        assert.equal(fetchCalls[0]?.url, 'https://tavily.example.test/search');
        assert.equal(fetchCalls[0]?.body.api_key, 'test-tavily-key');
        assert.equal(fetchCalls[0]?.body.query, 'Kyoto Gion history');
        assert.equal(fetchCalls[0]?.body.max_results, 3);
        assert.equal(result.protocolMessages.some((message) => message.role === 'tool' && message.toolName === TAVILY_TOOL_NAME), true);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('xb tavern assistant automatic run exposes and executes the same web_search tool', async () => {
    await resetDb();
    const session = await createTavernSession({
        title: 'Auto manager web search',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
    });
    const userMessage = await appendTavernMessage(session.id, {
        role: 'user',
        content: '她提到想去祇园。',
    });
    const assistantMessage = await appendTavernMessage(session.id, {
        role: 'assistant',
        content: '她开始回忆那片街区的灯光。',
    });
    const originalFetch = globalThis.fetch;
    const fetchCalls: Array<{ url: string; body: Record<string, unknown> }> = [];
    globalThis.fetch = (async (url: RequestInfo | URL, init?: RequestInit) => {
        fetchCalls.push({
            url: String(url),
            body: JSON.parse(String(init?.body || '{}')),
        });
        return {
            ok: true,
            async json() {
                return {
                    results: [{
                        title: 'Gion Kyoto',
                        url: 'https://example.test/gion-auto',
                        content: 'Gion is associated with Kyoto geisha districts and historic streets.',
                        score: 0.9,
                    }],
                };
            },
            async text() {
                return '';
            },
        } as Response;
    }) as typeof fetch;

    try {
        let requestCount = 0;
        let exposedToolNames: string[] = [];
        let managerSystemPrompt = '';
        const executeManagerOnce = Object.assign(async (options: XbTavernManagerOnceOptions) => {
            requestCount += 1;
            if (requestCount === 1) {
                exposedToolNames = (Array.isArray(options.tools) ? options.tools : [])
                    .map((tool) => String((tool as { function?: { name?: string } })?.function?.name || ''))
                    .filter(Boolean);
                managerSystemPrompt = String(options.messages?.[0]?.content || '');
                return {
                    text: '',
                    provider: 'fake-provider',
                    model: 'fake-model',
                    toolCalls: [{
                        id: 'auto-search-gion',
                        name: TAVILY_TOOL_NAME,
                        arguments: JSON.stringify({ query: 'Kyoto Gion geisha district', maxResults: 2 }),
                    }],
                };
            }
            assert.equal(options.messages.length, 0);
            assert.equal(options.toolResponses?.[0]?.name, TAVILY_TOOL_NAME);
            const response = options.toolResponses?.[0]?.response as Record<string, unknown> | undefined;
            assert.equal(response?.ok, true);
            assert.equal(response?.query, 'Kyoto Gion geisha district');
            assert.equal(response?.count, 1);
            return {
                text: '已核对祇园现实背景。',
                provider: 'fake-provider',
                model: 'fake-model',
            };
        }, { supportsSessionToolLoop: true });

        const result = await runXbTavernManagerAfterTurn({
            sessionId: session.id,
            agentConfig: {
                tavilyApiKey: 'test-tavily-key',
                tavilyBaseUrl: 'https://tavily.example.test',
                currentPresetName: '默认',
                presets: {
                    默认: {
                        provider: 'fake-provider',
                        modelConfigs: {
                            'fake-provider': { model: 'fake-model', apiKey: 'not-used' },
                        },
                    },
                },
            },
            userMessage,
            assistantMessage,
            turn: 1,
            sessionContract: mergeTavernSessionContract(undefined, {
                memoryArchiving: true,
            }),
            executeManagerOnce,
        });

        assert.equal(result.ok, true);
        assert.equal(requestCount, 2);
        assert.equal(exposedToolNames.includes(TAVILY_TOOL_NAME), true);
        assert.match(managerSystemPrompt, /Web research:/);
        assert.match(managerSystemPrompt, /web_search/);
        assert.equal(fetchCalls.length, 1);
        assert.equal(fetchCalls[0]?.url, 'https://tavily.example.test/search');
        assert.equal(fetchCalls[0]?.body.api_key, 'test-tavily-key');
        assert.equal(fetchCalls[0]?.body.query, 'Kyoto Gion geisha district');
        assert.equal(fetchCalls[0]?.body.max_results, 2);
        assert.equal(result.protocolMessages?.some((message) => message.role === 'tool' && message.toolName === TAVILY_TOOL_NAME), true);
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test('xb tavern direct runtime fails before provider call when shared API config is incomplete', async () => {
    await assert.rejects(
        () => runTavernOnce({
            agentConfig: {
                currentPresetName: '默认',
                presets: {
                    默认: {
                        provider: 'openai-compatible',
                        modelConfigs: {
                            'openai-compatible': {
                                model: '',
                                apiKey: '',
                            },
                        },
                    },
                },
            },
            messages: [{ role: 'user', content: 'Hello.' }],
        }),
        /请先在 API 配置里选择模型\/填写 Key/,
    );
});

test('xb tavern delegate runtime refuses to inherit a configured main provider', async () => {
    await assert.rejects(
        () => runTavernOnce({
            agentConfig: {
                currentPresetName: '主剧情',
                presets: {
                    主剧情: {
                        provider: 'sillytavern-claude',
                        modelConfigs: {
                            'sillytavern-claude': {
                                model: 'ready-main-model',
                            },
                        },
                    },
                },
            },
            providerRole: 'delegate',
            messages: [{ role: 'user', content: 'Generate tasks.' }],
        }),
        /配置分身模型/,
    );
});

test('xb tavern run turn records provider failures as error assistant messages', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Fail once.',
        executeRunOnce: async () => {
            throw new Error('provider_failed');
        },
    });

    assert.equal(result.error, 'provider_failed');
    assert.equal(result.finishReason, 'error');
    assert.equal(result.nextTurn, 0);
    const messages = await listTavernMessages(result.sessionId);
    const savedRequestSnapshot = messages[1]?.requestSnapshot as { messageCount?: number } | undefined;
    assert.deepEqual(messages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(messages[1]?.error, true);
    assert.equal(messages[1]?.content, 'provider_failed');
    assert.equal(savedRequestSnapshot?.messageCount, result.requestSnapshot.messageCount);
    const session = await getTavernSession(result.sessionId);
    assert.equal(session?.state?.lastError, 'provider_failed');
    assert.equal(session?.state?.turn, 0);

    let retryRaw = '';
    await runXbTavernTurn({
        sessionId: result.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Retry.',
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            retryRaw = JSON.stringify(options.messages);
            return {
                text: 'Recovered.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });
    assert.doesNotMatch(retryRaw, /provider_failed/);
});

test('xb tavern provider fetch failures suggest switching tavern completion source', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Fail fetch.',
        executeRunOnce: async () => {
            throw new Error('[xb-tavern:provider_chat] Failed to fetch');
        },
    });

    assert.match(result.error || '', /^\[xb-tavern:provider_chat\] Failed to fetch/);
    assert.match(result.error || '', /可以尝试在 API 配置中切换酒馆补全源。/);
    const messages = await listTavernMessages(result.sessionId);
    assert.equal(messages[1]?.error, true);
    assert.match(messages[1]?.content || '', /可以尝试在 API 配置中切换酒馆补全源。/);
});

test('xb tavern run turn keeps the actual failed request snapshot when provider exposes it', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Fail with request snapshot.',
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            const error = new Error('provider_failed_after_request') as Error & { requestSnapshot?: unknown };
            error.requestSnapshot = buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                provider: 'actual-provider',
                model: 'actual-model',
                requestInspection: {
                    provider: 'actual-provider',
                    model: 'actual-model',
                    transport: 'test',
                    request: {
                        body: {
                            stream: true,
                            marker: 'actual-failed-request',
                        },
                    },
                },
            });
            throw error;
        },
    });

    assert.equal(result.error, 'provider_failed_after_request');
    assert.match(result.requestSnapshot.rawRequestJson, /actual-failed-request/);
    assert.equal(result.requestSnapshot.provider, 'actual-provider');
    const messages = await listTavernMessages(result.sessionId);
    assert.match(JSON.stringify(messages[1]?.requestSnapshot || {}), /actual-failed-request/);
    const session = await getTavernSession(result.sessionId);
    assert.match(JSON.stringify(session?.state?.lastRequestSnapshot || {}), /actual-failed-request/);
});

test('xb tavern run turn records aborted partial text as assistant message', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let managerCalls = 0;
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Start then stop.',
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            options.onStreamProgress?.({ text: '# Partial\n\nStill useful.' });
            const error = new Error('aborted by user');
            error.name = 'AbortError';
            throw error;
        },
        executeManagerOnce: async () => {
            managerCalls += 1;
            return { text: '不应该调用自动管理员。' };
        },
    });

    assert.equal(result.error, undefined);
    assert.equal(result.finishReason, 'aborted');
    assert.equal(result.nextTurn, 1);
    assert.equal(result.managerRunId, '');
    assert.equal(result.managerStatus, '');
    assert.equal(managerCalls, 0);
    const messages = await listTavernMessages(result.sessionId);
    assert.deepEqual(messages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(messages[1]?.content, '# Partial\n\nStill useful.');
    assert.equal(messages[1]?.error, false);
    assert.equal(messages[1]?.finishReason, 'aborted');
    assert.doesNotMatch(messages[1]?.content || '', /<h1>/);
    assert.equal((await listTavernManagerRuns(result.sessionId)).length, 0);
});

test('xb tavern aborted partial output records AI_OUTPUT regex in request snapshot metadata', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Start then stop.',
        applyRegex: async (items: TavernApplyRegexItem[]) => ({
            items: items.map((item) => ({
                id: item.id,
                text: item.placement === 'aiOutput' ? item.text.replace(/RAW_PARTIAL/g, 'REGEX_PARTIAL') : item.text,
                changed: item.placement === 'aiOutput' && item.text.includes('RAW_PARTIAL'),
            })),
            changedCount: items.filter((item) => item.placement === 'aiOutput' && item.text.includes('RAW_PARTIAL')).length,
        }),
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            options.onStreamProgress?.({ text: 'RAW_PARTIAL text.' });
            const error = new Error('aborted by user');
            error.name = 'AbortError';
            throw error;
        },
    });

    assert.equal(result.finishReason, 'aborted');
    assert.equal(result.assistantMessage?.content, 'REGEX_PARTIAL text.');
    assert.equal((result.requestSnapshot.regexApplications as { aiOutput?: number } | undefined)?.aiOutput, 1);
    const messages = await listTavernMessages(result.sessionId);
    assert.equal(messages[1]?.content, 'REGEX_PARTIAL text.');
    assert.equal(((messages[1]?.requestSnapshot as { regexApplications?: { aiOutput?: number } })?.regexApplications)?.aiOutput, 1);
});

test('xb tavern run turn records aborted empty run as error assistant message', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Stop before text.',
        executeRunOnce: async () => {
            const error = new Error('request aborted');
            error.name = 'AbortError';
            throw error;
        },
    });

    assert.equal(result.error, '已停止生成。');
    assert.equal(result.finishReason, 'aborted');
    assert.equal(result.nextTurn, 0);
    const messages = await listTavernMessages(result.sessionId);
    assert.deepEqual(messages.map((message) => message.role), ['user', 'assistant']);
    assert.equal(messages[1]?.content, '已停止生成。');
    assert.equal(messages[1]?.error, true);
    assert.equal(messages[1]?.finishReason, 'aborted');
    const session = await getTavernSession(result.sessionId);
    assert.equal(session?.state?.turn, 0);
});

test('xb tavern run turn keeps running when UI callbacks fail', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const originalWarn = console.warn;
    console.warn = () => {};
    let result: XbTavernRunResult | undefined;
    try {
        result = await runXbTavernTurn({
            agentConfig: { provider: 'fake-provider', model: 'fake-model' },
            contextSnapshot: {
                character: { characterKey: 'char-1', name: 'Aster' },
            },
            preset,
            currentUserMessage: 'Do not let UI callbacks stop the turn.',
            onUserMessageSaved: () => {
                throw new Error('ui_user_callback_failed');
            },
            onAssistantMessageSaved: () => {
                throw new Error('ui_assistant_callback_failed');
            },
            executeRunOnce: async (options: TavernRunOnceOptions) => ({
                text: 'Still completed.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            }),
        });
    } finally {
        console.warn = originalWarn;
    }

    assert.ok(result);
    assert.equal(result.error, undefined);
    assert.equal(result.nextTurn, 1);
    const messages = await listTavernMessages(result.sessionId);
    assert.deepEqual(messages.map((message) => `${message.role}:${message.content}`), [
        'user:Do not let UI callbacks stop the turn.',
        'assistant:Still completed.',
    ]);
});

test('xb tavern run turn can rerun from an existing user without duplicating the user message', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Try again.',
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Old answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    let rawMessages = '';
    await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'ignored because reused order wins',
        rerollLatestAssistant: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            rawMessages = JSON.stringify(options.messages);
            return {
                text: 'New answer.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    const messages = await listTavernMessages(first.sessionId);
    assert.deepEqual(messages.map((message) => `${message.order}:${message.role}:${message.content}`), [
        '0:user:Try again.',
        '1:assistant:New answer.',
    ]);
    assert.equal((rawMessages.match(/Try again\./g) || []).length, 1);
    assert.doesNotMatch(rawMessages, /ignored because reused order wins/);
});

test('xb tavern reroll replies to an existing user tail without creating a duplicate user', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const contextSnapshot = {
        character: { characterKey: 'char-1', name: 'Aster' },
    };
    const session = await createTavernSession({
        title: 'Dangling user reroll',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot,
        state: { turn: 0 },
    });
    const user = await appendTavernMessage(session.id, {
        role: 'user',
        content: 'Reply to this existing user.',
        runtimeStateSnapshot: createTavernTurnStateSnapshot((await getTavernSession(session.id))?.state),
    });

    const result = await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'must not be appended',
        rerollLatestAssistant: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Fresh reply.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });

    assert.equal(result.userMessage.messageId, user.messageId);
    assert.deepEqual((await listTavernMessages(session.id)).map((message) => `${message.order}:${message.role}:${message.content}`), [
        '0:user:Reply to this existing user.',
        '1:assistant:Fresh reply.',
    ]);
});

test('xb tavern reroll replaces a failed assistant tail', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const contextSnapshot = {
        character: { characterKey: 'char-1', name: 'Aster' },
    };
    const session = await createTavernSession({
        title: 'Failed assistant reroll',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot,
        state: { turn: 0 },
    });
    await appendTavernMessage(session.id, {
        role: 'user',
        content: 'Retry the failed reply.',
        runtimeStateSnapshot: createTavernTurnStateSnapshot((await getTavernSession(session.id))?.state),
    });
    const failedAssistant = await appendTavernMessage(session.id, {
        role: 'assistant',
        content: 'provider_failed',
        error: true,
        finishReason: 'error',
    });

    const result = await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Recovered reply.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });

    assert.notEqual(result.assistantMessage?.messageId, failedAssistant.messageId);
    assert.deepEqual((await listTavernMessages(session.id)).map((message) => `${message.order}:${message.role}:${message.content}`), [
        '0:user:Retry the failed reply.',
        '1:assistant:Recovered reply.',
    ]);
});

test('xb tavern discards a late assistant reply when another tab advances the user tail', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Late assistant guard',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: { character: { characterKey: 'char-1', name: 'Aster' } },
    });
    let releaseProvider!: () => void;
    const providerGate = new Promise<void>((resolve) => {
        releaseProvider = resolve;
    });
    let providerStarted!: () => void;
    const providerStartedPromise = new Promise<void>((resolve) => {
        providerStarted = resolve;
    });
    const runPromise = runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: '原标签页用户消息。',
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            providerStarted();
            await providerGate;
            return {
                text: '这条回复已经迟到了。',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });
    await providerStartedPromise;
    await appendTavernMessage(session.id, {
        role: 'user',
        content: '另一标签页抢先发送。',
        runtimeStateSnapshot: createTavernTurnStateSnapshot((await getTavernSession(session.id))?.state),
    });
    releaseProvider();

    await assert.rejects(runPromise, /assistant_timeline_advanced/);
    assert.deepEqual((await listTavernMessages(session.id)).map((message) => `${message.role}:${message.content}`), [
        'user:原标签页用户消息。',
        'user:另一标签页抢先发送。',
    ]);
});

test('xb tavern rerun uses regenerate world info trigger', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const contextSnapshot = {
        character: { characterKey: 'char-1', name: 'Aster' },
        worldBooks: [{
            name: 'Lore',
            entries: [
                { uid: 'normal-only', content: 'NORMAL_TRIGGER_LORE', constant: true, triggers: ['normal'] },
                { uid: 'regen-only', content: 'REGENERATE_TRIGGER_LORE', constant: true, triggers: ['regenerate'] },
            ],
        }],
    };
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'Try again.',
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            const rawMessages = JSON.stringify(options.messages);
            assert.match(rawMessages, /NORMAL_TRIGGER_LORE/);
            assert.doesNotMatch(rawMessages, /REGENERATE_TRIGGER_LORE/);
            return {
                text: 'Old answer.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });
    let rerunRawMessages = '';
    await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            rerunRawMessages = JSON.stringify(options.messages);
            return {
                text: 'New answer.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    assert.match(rerunRawMessages, /REGENERATE_TRIGGER_LORE/);
    assert.doesNotMatch(rerunRawMessages, /NORMAL_TRIGGER_LORE/);
});

test('xb tavern rerun rejects a last user that has no saved pre-generation RP state', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const contextSnapshot = {
        character: { characterKey: 'char-1', name: 'Aster' },
    };
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'First.',
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'First answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    const second = await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'Legacy target.',
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Old second answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    const legacyUser = (await listTavernMessages(second.sessionId)).find((message) => message.order === 2);
    assert.ok(legacyUser);
    await updateTavernMessage(second.sessionId, legacyUser.order, { runtimeStateSnapshot: undefined });
    await updateTavernSessionState(second.sessionId, {
        worldEntryStates: { stale: { stickyUntilTurn: 99 } },
        nativeWorldInfoTimedState: {
            sticky: { stale: { start: 1, end: 99 } },
            cooldown: { stale: { start: 1, end: 99 } },
        },
    });

    let nativeWorldInfoCalls = 0;
    await assert.rejects(() => runXbTavernTurn({
        sessionId: second.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        getNativeWorldInfoRuntime: async () => {
            nativeWorldInfoCalls += 1;
            return {
                trigger: 'regenerate',
                worldInfoBefore: '',
                timedState: { sticky: {}, cooldown: {} },
            };
        },
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Replacement answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    }), /reroll_latest_pair_invalid/);

    assert.equal(nativeWorldInfoCalls, 0);
    assert.deepEqual((await listTavernMessages(second.sessionId)).map((message) => message.content), [
        'First.',
        'First answer.',
        'Legacy target.',
        'Old second answer.',
    ]);
});

test('xb tavern rerun restores the checkpoint created with macro-substituted world keys', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const contextSnapshot = {
        character: { characterKey: 'char-1', name: 'Aster' },
        user: { name: 'Player' },
        worldBooks: [{
            name: 'Lore',
            entries: [{
                uid: 'macro-sticky',
                key: ['{{char}} trigger'],
                content: 'MACRO_STICKY_LORE',
                sticky: 8,
            }],
        }],
    };
    const applySubstituteParams = async (items: TavernSubstituteParamsItem[]) => ({
        items: items.map((item) => {
            const text = item.text
                .replace(/\{\{char\}\}/g, String(item.options?.name2Override || 'Aster'))
                .replace(/\{\{user\}\}/g, String(item.options?.name1Override || 'Player'));
            return {
                id: item.id,
                text,
                changed: text !== item.text,
            };
        }),
        changedCount: items.filter((item) => /\{\{(?:char|user)\}\}/.test(item.text)).length,
    });
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: '{{char}} trigger.',
        applySubstituteParams,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'First.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    const second = await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'No trigger here.',
        applySubstituteParams,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Second.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    let rerunRawMessages = '';
    await runXbTavernTurn({
        sessionId: second.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        applySubstituteParams,
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            rerunRawMessages = JSON.stringify(options.messages);
            return {
                text: 'Second again.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    assert.match(rerunRawMessages, /MACRO_STICKY_LORE/);
});

test('xb tavern rerun always replaces only the database latest assistant pair', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const contextSnapshot = {
        character: { characterKey: 'char-1', name: 'Aster' },
        worldBooks: [{
            name: 'Lore',
            entries: [{
                uid: 'sticky-entry',
                content: 'Persistent lore.',
                constant: true,
                sticky: 8,
            }, {
                uid: 'second-entry',
                content: 'Only second turn lore.',
                key: ['Second user'],
                sticky: 6,
            }],
        }],
    };
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'First user.',
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'First answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'Second user.',
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Second answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });

    const rerun = await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot,
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Replacement answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });

    assert.equal(rerun.nextTurn, 2);
    const messages = await listTavernMessages(first.sessionId);
    assert.deepEqual(messages.map((message) => `${message.order}:${message.role}:${message.content}`), [
        '0:user:First user.',
        '1:assistant:First answer.',
        '2:user:Second user.',
        '3:assistant:Replacement answer.',
    ]);
    const session = await getTavernSession(first.sessionId);
    assert.equal(session?.state?.turn, 2);
});

test('xb tavern rerun preserves contract and skips automatic manager work when disabled', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let managerCalls = 0;
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'Keep the contract.',
        runtimeState: {
            contract: mergeTavernSessionContract(undefined, {
                memoryArchiving: false,
                cartographyEngine: false,
                statusPanel: false,
            }),
        },
        runManager: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'First answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce: async () => {
            managerCalls += 1;
            throw new Error('manager should stay disabled');
        },
    });

    assert.equal(first.managerRunId, '');
    assert.equal(first.managerStatus, '');
    assert.equal(managerCalls, 0);
    assert.equal((await getTavernSession(first.sessionId))?.state?.contract?.memoryArchiving, false);
    let rerollPreparedContract: boolean | undefined;

    const rerun = await runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        runManager: true,
        onLatestAssistantRerollPrepared: async () => {
            rerollPreparedContract = (await getTavernSession(first.sessionId))?.state?.contract?.memoryArchiving;
        },
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Rerun answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
        executeManagerOnce: async () => {
            managerCalls += 1;
            throw new Error('manager should stay disabled');
        },
    });

    assert.equal(rerun.managerRunId, '');
    assert.equal(rerun.managerStatus, '');
    assert.equal(managerCalls, 0);
    assert.equal(rerollPreparedContract, false);
    assert.equal((await listTavernManagerRuns(first.sessionId)).length, 0);
    const session = await getTavernSession(first.sessionId);
    assert.equal(session?.state?.contract?.memoryArchiving, false);
    assert.equal(session?.state?.contract?.cartographyEngine, false);
});

test('xb tavern rerun refuses an already-confirmed pair and never rolls back memory', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const first = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'First turn.',
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'First answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    });
    const messages = await listTavernMessages(first.sessionId);
    const userMessage = messages.find((message) => message.role === 'user');
    const assistantMessage = messages.find((message) => message.role === 'assistant');
    assert.ok(userMessage);
    assert.ok(assistantMessage);
    const run = await createTavernManagerRun({
        sessionId: first.sessionId,
        turn: 1,
        userOrder: userMessage.order,
        assistantOrder: assistantMessage.order,
        trigger: 'after_turn',
        status: 'completed',
        changedFiles: ['memory/state.md'],
    });
    const before = (await getTavernMemoryFile(first.sessionId, 'memory/state.md'))?.content || '';
    const writeResult = await executeTavernMemoryTool(first.sessionId, 'MemoryWrite', {
        filePath: 'memory/state.md',
        content: `${before}\n\n管理员写入。`,
    }, {
        caller: 'auto',
        managerRunId: run.id,
    });
    assert.equal(writeResult.ok, true);
    await writeTavernMemoryFile(first.sessionId, 'memory/state.md', '用户手动修正。', { source: 'user' });

    await assert.rejects(() => runXbTavernTurn({
        sessionId: first.sessionId,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster' },
        },
        preset,
        currentUserMessage: 'ignored',
        rerollLatestAssistant: true,
        executeRunOnce: async (options: TavernRunOnceOptions) => ({
            text: 'Replacement answer.',
            requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
        }),
    }), /reroll_latest_pair_already_confirmed/);

    assert.equal((await getTavernMemoryFile(first.sessionId, 'memory/state.md'))?.content, '用户手动修正。');
    assert.equal((await listTavernManagerRuns(first.sessionId)).find((item) => item.id === run.id)?.status, 'completed');
});

test('xb tavern context history filters saved error messages for preview and runtime', () => {
    const history = buildContextHistory([
        {
            messageId: 'history-message-0',
            sessionId: 'session',
            order: 0,
            role: 'user',
            content: 'Hello.\n[img: 1girl, office, night]\n[图片: 1boy, street]',
            createdAt: 1,
        },
        {
            messageId: 'history-message-1',
            sessionId: 'session',
            order: 1,
            role: 'assistant',
            content: 'provider_failed',
            error: true,
            createdAt: 2,
        },
        {
            messageId: 'history-message-2',
            sessionId: 'session',
            order: 2,
            role: 'assistant',
            content: 'Recovered.',
            createdAt: 3,
        },
    ]);

    assert.deepEqual(history, [
        { role: 'user', content: 'Hello.' },
        { role: 'assistant', content: 'Recovered.' },
    ]);
});

test('xb tavern context cleanup ignores inline image-only messages for provider history', () => {
    const messages = [
        makeContextWindowMessage(0, 'assistant', '[img: 1girl, office]'),
        makeContextWindowMessage(1, 'user', 'Actual text.'),
    ];
    const resolved = resolveTavernContextWindow({
        messages,
        currentUserMessage: '[图片: 1boy, street]',
    });

    assert.equal(resolved.usableHistoryCount, 1);
    assert.equal(resolved.currentUserCount, 0);
    assert.deepEqual(buildContextHistory(resolved.historyMessages), [
        { role: 'user', content: 'Actual text.' },
    ]);
});

test('xb tavern keeps inline image tokens in saved user messages but strips them from provider requests', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    let providerMessagesJson = '';

    const result = await runXbTavernTurn({
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster', description: 'Pilot.' },
            user: { name: 'Player' },
        },
        preset,
        currentUserMessage: 'Look.\n[img: 1girl, office]\n[图片: 1boy, street]',
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            providerMessagesJson = JSON.stringify(options.messages);
            return {
                text: 'Done.',
                provider: 'fake-provider',
                model: 'fake-model',
                finishReason: 'stop',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages, {
                    provider: 'fake-provider',
                    model: 'fake-model',
                }),
            };
        },
    });

    const messages = await listTavernMessages(result.sessionId);
    assert.equal(messages.find((message) => message.role === 'user')?.content, 'Look.\n[img: 1girl, office]\n[图片: 1boy, street]');
    assert.doesNotMatch(providerMessagesJson, /\[(?:img|图片)\s*:/i);
    assert.doesNotMatch(result.requestSnapshot.rawRequestJson, /\[(?:img|图片)\s*:/i);
    assert.match(providerMessagesJson, /Look\./);
});

test('xb tavern context window keeps a stable 20 message API window without deleting history', () => {
    const firstTwenty = Array.from({ length: 20 }, (_, index) => makeContextWindowMessage(
        index,
        index % 2 ? 'assistant' : 'user',
    ));
    const compressed = resolveTavernContextWindow({
        messages: firstTwenty,
        contextWindowStartOrder: 0,
        currentUserMessage: 'message-20',
    });
    assert.equal(compressed.contextWindowStartOrder, 11);
    assert.deepEqual(compressed.historyMessages.map((message) => message.order), [11, 12, 13, 14, 15, 16, 17, 18, 19]);
    assert.equal(compressed.windowHistoryCount, 9);
    assert.equal(compressed.currentUserCount, 1);

    const stable = resolveTavernContextWindow({
        messages: Array.from({ length: 30 }, (_, index) => makeContextWindowMessage(index, index % 2 ? 'assistant' : 'user')),
        contextWindowStartOrder: 11,
        currentUserMessage: 'message-30',
    });
    assert.equal(stable.contextWindowStartOrder, 11);

    const nextCompressed = resolveTavernContextWindow({
        messages: Array.from({ length: 31 }, (_, index) => makeContextWindowMessage(index, index % 2 ? 'assistant' : 'user')),
        contextWindowStartOrder: 11,
        currentUserMessage: 'message-31',
    });
    assert.equal(nextCompressed.contextWindowStartOrder, 22);
    assert.deepEqual(nextCompressed.historyMessages.map((message) => message.order), [22, 23, 24, 25, 26, 27, 28, 29, 30]);
});

test('xb tavern context window recovers from tail deletion using the remaining full history', () => {
    const deletedTail = resolveTavernContextWindow({
        messages: Array.from({ length: 25 }, (_, index) => makeContextWindowMessage(index, index % 2 ? 'assistant' : 'user')),
        contextWindowStartOrder: 22,
    });
    assert.equal(deletedTail.contextWindowStartOrder, 15);
    assert.deepEqual(deletedTail.historyMessages.map((message) => message.order), [15, 16, 17, 18, 19, 20, 21, 22, 23, 24]);

    const tinyHistory = resolveTavernContextWindow({
        messages: Array.from({ length: 4 }, (_, index) => makeContextWindowMessage(index, index % 2 ? 'assistant' : 'user')),
        contextWindowStartOrder: 22,
    });
    assert.equal(tinyHistory.contextWindowStartOrder, 0);
    assert.deepEqual(tinyHistory.historyMessages.map((message) => message.order), [0, 1, 2, 3]);

    const beyondTail = resolveTavernContextWindow({
        messages: Array.from({ length: 30 }, (_, index) => makeContextWindowMessage(index, index % 2 ? 'assistant' : 'user')),
        contextWindowStartOrder: 999,
    });
    assert.equal(beyondTail.contextWindowStartOrder, 20);
    assert.deepEqual(beyondTail.historyMessages.map((message) => message.order), [20, 21, 22, 23, 24, 25, 26, 27, 28, 29]);
});

test('xb tavern context window resets stale start order while under the max API window', () => {
    const sixTurnHistory = resolveTavernContextWindow({
        messages: Array.from({ length: 12 }, (_, index) => makeContextWindowMessage(index, index % 2 ? 'assistant' : 'user')),
        contextWindowStartOrder: 8,
        currentUserMessage: 'message-12',
    });
    assert.equal(sixTurnHistory.contextWindowStartOrder, 0);
    assert.deepEqual(sixTurnHistory.historyMessages.map((message) => message.order), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    assert.equal(sixTurnHistory.windowHistoryCount, 12);
    assert.equal(sixTurnHistory.currentUserCount, 1);
});

test('xb tavern prompt history loader matches full context window resolution from the DB tail', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Prompt history window' });
    for (let index = 0; index < 36; index += 1) {
        await appendTavernMessage(session.id, {
            role: index % 2 ? 'assistant' : 'user',
            content: `stored-${index}`,
        });
    }
    await appendTavernMessage(session.id, {
        role: 'assistant',
        content: '',
        error: true,
    });

    const fullMessages = await listTavernMessages(session.id);
    const expected = resolveTavernContextWindow({
        messages: fullMessages,
        contextWindowStartOrder: 11,
        currentUserMessage: 'fresh-user',
    });
    const loaded = await loadTavernPromptHistoryWindow({
        sessionId: session.id,
        contextWindowStartOrder: 11,
        currentUserMessage: 'fresh-user',
    });

    assert.equal(loaded.contextWindowStartOrder, expected.contextWindowStartOrder);
    assert.deepEqual(loaded.historyMessages.map((message) => message.order), expected.historyMessages.map((message) => message.order));
    assert.equal(loaded.historyMessages.at(-1)?.content, '');

    const beforeExpected = resolveTavernContextWindow({
        messages: fullMessages.filter((message) => message.order < 24),
        contextWindowStartOrder: 0,
        currentUserMessage: 'rerun-user',
    });
    const beforeLoaded = await loadTavernPromptHistoryWindow({
        sessionId: session.id,
        contextWindowStartOrder: 0,
        currentUserMessage: 'rerun-user',
        beforeOrder: 24,
    });

    assert.deepEqual(beforeLoaded.historyMessages.map((message) => message.order), beforeExpected.historyMessages.map((message) => message.order));

    const firstOrderLoaded = await loadTavernPromptHistoryWindow({
        sessionId: session.id,
        contextWindowStartOrder: 0,
        currentUserMessage: 'first-user',
        beforeOrder: 0,
    });
    assert.deepEqual(firstOrderLoaded.historyMessages.map((message) => message.order), []);
    assert.equal(firstOrderLoaded.currentUserCount, 1);
});

test('xb tavern prompt history loader recovers stale start orders by loading earlier history', async () => {
    await resetDb();
    const session = await createTavernSession({ title: 'Stale prompt history window' });
    for (let index = 0; index < 12; index += 1) {
        await appendTavernMessage(session.id, {
            role: index % 2 ? 'assistant' : 'user',
            content: `stale-${index}`,
        });
    }

    const fullMessages = await listTavernMessages(session.id);
    const expected = resolveTavernContextWindow({
        messages: fullMessages,
        contextWindowStartOrder: 10,
        currentUserMessage: 'fresh-after-delete',
    });
    const nearTailLoaded = await loadTavernPromptHistoryWindow({
        sessionId: session.id,
        contextWindowStartOrder: 10,
        currentUserMessage: 'fresh-after-delete',
    });
    const beyondTailLoaded = await loadTavernPromptHistoryWindow({
        sessionId: session.id,
        contextWindowStartOrder: 999,
        currentUserMessage: 'fresh-after-delete',
    });

    assert.equal(expected.contextWindowStartOrder, 0);
    assert.deepEqual(nearTailLoaded.historyMessages.map((message) => message.order), expected.historyMessages.map((message) => message.order));
    assert.deepEqual(beyondTailLoaded.historyMessages.map((message) => message.order), expected.historyMessages.map((message) => message.order));

    const longSession = await createTavernSession({ title: 'Long stale prompt history window' });
    for (let index = 0; index < 36; index += 1) {
        await appendTavernMessage(longSession.id, {
            role: index % 2 ? 'assistant' : 'user',
            content: `long-stale-${index}`,
        });
    }
    const longFullMessages = await listTavernMessages(longSession.id);
    const longExpected = resolveTavernContextWindow({
        messages: longFullMessages,
        contextWindowStartOrder: 999,
        currentUserMessage: 'fresh-after-long-delete',
    });
    const longLoaded = await loadTavernPromptHistoryWindow({
        sessionId: longSession.id,
        contextWindowStartOrder: 999,
        currentUserMessage: 'fresh-after-long-delete',
    });
    assert.deepEqual(longLoaded.historyMessages.map((message) => message.order), longExpected.historyMessages.map((message) => message.order));
});

test('xb tavern run turn trims only API history and keeps stored messages intact', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Windowed',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster', description: 'Pilot.' },
            user: { name: 'Player' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    for (let index = 0; index < 20; index += 1) {
        await appendTavernMessage(session.id, {
            role: index % 2 ? 'assistant' : 'user',
            content: `stored-${index}`,
        });
    }

    let sentRaw = '';
    await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster', description: 'Pilot.' },
            user: { name: 'Player' },
        },
        preset,
        currentUserMessage: 'fresh-user',
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            sentRaw = JSON.stringify(options.messages);
            return {
                text: 'fresh-assistant',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });

    assert.doesNotMatch(sentRaw, /stored-0/);
    assert.doesNotMatch(sentRaw, /stored-10/);
    assert.match(sentRaw, /stored-11/);
    assert.match(sentRaw, /stored-19/);
    assert.match(sentRaw, /fresh-user/);
    const stored = await listTavernMessages(session.id);
    assert.equal(stored.length, 22);
    assert.equal(stored[0]?.content, 'stored-0');
    assert.equal(stored[20]?.content, 'fresh-user');
    assert.equal(stored[21]?.content, 'fresh-assistant');
    const updated = await getTavernSession(session.id);
    assert.equal(updated?.state?.contextWindowStartOrder, 11);
});

test('xb tavern simulated request uses the same trimmed API history without saving messages', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Windowed simulate',
        characterKey: 'char-1',
        characterName: 'Aster',
        contextSnapshot: {
            character: { characterKey: 'char-1', name: 'Aster', description: 'Pilot.' },
            user: { name: 'Player' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    for (let index = 0; index < 20; index += 1) {
        await appendTavernMessage(session.id, {
            role: index % 2 ? 'assistant' : 'user',
            content: `simulate-stored-${index}`,
        });
    }

    const result = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig: {
            currentPresetName: '酒馆 OpenAI',
            presets: {
                '酒馆 OpenAI': {
                    provider: 'sillytavern-openai-compatible',
                    modelConfigs: {
                        'sillytavern-openai-compatible': {
                            model: 'gpt-test',
                        },
                    },
                },
            },
        },
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'simulate-fresh-user',
    });

    assert.doesNotMatch(result.requestSnapshot.rawRequestJson, /simulate-stored-0/);
    assert.doesNotMatch(result.requestSnapshot.rawRequestJson, /simulate-stored-10/);
    assert.match(result.requestSnapshot.rawRequestJson, /simulate-stored-11/);
    assert.match(result.requestSnapshot.rawRequestJson, /simulate-stored-19/);
    assert.match(result.requestSnapshot.rawRequestJson, /simulate-fresh-user/);
    assert.equal((await listTavernMessages(session.id)).length, 20);
});

test('phone timeline events stay at their anchor and leave the main prompt with the history window', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Anchored phone prompt',
        characterName: 'Aster',
        contextSnapshot: {
            character: { name: 'Aster', description: 'Aster card.' },
            user: { name: '沈知意' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    await appendTavernMessage(session.id, { role: 'user', content: 'main-before-phone-user' });
    await appendTavernMessage(session.id, { role: 'assistant', content: 'main-before-phone-assistant' });
    const contact = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '艾琳',
        source: 'manual',
    });
    const sent = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: contact.thread.id,
        payload: { type: 'text', text: 'ANCHOR_PHONE_USER' },
    });
    await completeTavernCommunicationReply({
        userMessage: sent.message,
        replyRequestId: sent.replyRequest.id,
        replies: [{ type: 'text', text: 'ANCHOR_PHONE_REPLY' }],
    });
    const agentConfig = {
        currentPresetName: '酒馆 OpenAI',
        presets: {
            '酒馆 OpenAI': {
                provider: 'sillytavern-openai-compatible',
                modelConfigs: {
                    'sillytavern-openai-compatible': { model: 'fake-model' },
                },
            },
        },
    };
    const anchored = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig,
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'first-preview',
    });
    assert.match(anchored.requestSnapshot.rawRequestJson, /ANCHOR_PHONE_USER/);
    assert.match(anchored.requestSnapshot.rawRequestJson, /ANCHOR_PHONE_REPLY/);
    assert.match(anchored.requestSnapshot.rawRequestJson, /\[沈知意 与 艾琳 的私人消息 · 发生于剧情此刻\]/);
    assert.match(anchored.requestSnapshot.rawRequestJson, /沈知意（文字）：ANCHOR_PHONE_USER/);
    assert.match(anchored.requestSnapshot.rawRequestJson, /艾琳（文字）：ANCHOR_PHONE_REPLY/);
    assert.match(anchored.requestSnapshot.rawRequestJson, /private_message_rules/);
    assert.doesNotMatch(anchored.requestSnapshot.rawRequestJson, /参与者：玩家|只有参与者天然知道|消息里的计划、邀请和承诺不表示/);

    for (let index = 2; index < 25; index += 1) {
        await appendTavernMessage(session.id, {
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: `later-main-${index}`,
        });
    }
    const advanced = await simulateXbTavernRequest({
        sessionId: session.id,
        agentConfig,
        contextSnapshot: session.contextSnapshot || {},
        preset,
        currentUserMessage: 'advanced-preview',
    });
    assert.doesNotMatch(advanced.requestSnapshot.rawRequestJson, /ANCHOR_PHONE_USER/);
    assert.doesNotMatch(advanced.requestSnapshot.rawRequestJson, /ANCHOR_PHONE_REPLY/);
    assert.match(advanced.requestSnapshot.rawRequestJson, /later-main-24/);
});

test('accepted-turn manager receives phone events anchored immediately before the main turn', async () => {
    await resetDb();
    const session = await createTavernSession({
        title: 'Manager phone evidence',
        contextSnapshot: {
            character: { name: 'Aster', description: 'Aster card.' },
            user: { name: '沈知意' },
        },
    });
    await appendTavernMessage(session.id, { role: 'assistant', content: '剧情停在站台。' });
    const contact = await createTavernCommunicationContact({
        sessionId: session.id,
        name: '艾琳',
        source: 'manual',
    });
    const sent = await appendSentTavernCommunicationMessage({
        sessionId: session.id,
        threadId: contact.thread.id,
        payload: { type: 'text', text: 'MANAGER_PHONE_USER' },
    });
    await completeTavernCommunicationReply({
        userMessage: sent.message,
        replyRequestId: sent.replyRequest.id,
        replies: [{ type: 'text', text: 'MANAGER_PHONE_REPLY' }],
    });
    const userMessage = await appendTavernMessage(session.id, { role: 'user', content: '继续剧情。' });
    const assistantMessage = await appendTavernMessage(session.id, { role: 'assistant', content: '列车进站。' });
    let managerPrompt = '';
    const result = await runXbTavernManagerAfterTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        userMessage,
        assistantMessage,
        turn: 1,
        sessionContract: mergeTavernSessionContract(undefined, { memoryArchiving: true }),
        executeManagerOnce: async (options) => {
            managerPrompt = JSON.stringify(options.messages);
            return {
                text: '本轮无需修改。',
                provider: 'fake-provider',
                model: 'fake-model',
            };
        },
    });

    assert.equal(result.ok, true);
    assert.match(managerPrompt, /MANAGER_PHONE_USER/);
    assert.match(managerPrompt, /MANAGER_PHONE_REPLY/);
    assert.match(managerPrompt, /BEGIN UNTRUSTED PHONE EVIDENCE/);
    assert.match(managerPrompt, /\[沈知意 与 艾琳 的私人消息 · 发生于剧情此刻\]/);
    assert.match(managerPrompt, /沈知意（文字）：MANAGER_PHONE_USER/);
    assert.match(managerPrompt, /艾琳（文字）：MANAGER_PHONE_REPLY/);
    assert.match(managerPrompt, /Private Message Evidence/);
    assert.doesNotMatch(managerPrompt, /参与者：玩家|只有参与者天然知道|消息里的计划、邀请和承诺不表示/);
});

test('xb tavern run turn accepts refreshed live context for the same session character', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Locked',
        characterKey: 'char-refresh',
        characterName: 'Old Character',
        contextSnapshot: {
            character: { characterKey: 'char-refresh', name: 'Old Character', description: 'Old card.' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    let sentRaw = '';
    await runXbTavernTurn({
        sessionId: session.id,
        agentConfig: { provider: 'fake-provider', model: 'fake-model' },
        contextSnapshot: {
            character: { characterKey: 'char-refresh', name: 'New Character', description: 'New card.' },
        },
        preset,
        currentUserMessage: 'Who are you?',
        executeRunOnce: async (options: TavernRunOnceOptions) => {
            sentRaw = JSON.stringify(options.messages);
            return {
                text: 'I am new.',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            };
        },
    });
    assert.match(sentRaw, /New Character/);
    assert.doesNotMatch(sentRaw, /Old Character/);
    const updated = await getTavernSession(session.id);
    assert.equal(updated?.contextSnapshot?.character?.name, 'New Character');
});

test('xb tavern run turn rejects live context from a different character', async () => {
    await resetDb();
    const preset = createDefaultXbTavernPreset();
    const session = await createTavernSession({
        title: 'Locked',
        characterKey: 'char-a',
        characterName: 'Character A',
        contextSnapshot: {
            character: { characterKey: 'char-a', name: 'Character A', description: 'A card.' },
        },
        presetId: preset.id,
        presetName: preset.name,
    });
    await assert.rejects(
        () => runXbTavernTurn({
            sessionId: session.id,
            agentConfig: { provider: 'fake-provider', model: 'fake-model' },
            contextSnapshot: {
                character: { characterKey: 'char-b', name: 'Character B', description: 'B card.' },
            },
            preset,
            currentUserMessage: 'Who are you?',
            executeRunOnce: async (options: TavernRunOnceOptions) => ({
                text: 'wrong',
                requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, options.messages),
            }),
        }),
        /会话角色身份不匹配/,
    );
    const updated = await getTavernSession(session.id);
    assert.equal(updated?.contextSnapshot?.character?.name, 'Character A');
    assert.equal((await listTavernMessages(session.id)).length, 0);
});
