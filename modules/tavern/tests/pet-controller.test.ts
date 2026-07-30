import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';
import {
    computed,
    effectScope,
    nextTick,
    ref,
    type Ref,
} from 'vue';
import Dexie from '../../../libs/dexie.mjs';

import {
    appendTavernMessage,
    tavernPetActionsTable,
    tavernPetJournalTable,
} from '../shared/session-db';
import { canonicalTavernPetStaticVerdict } from '../shared/pet/pet-copy';
import { TAVERN_PET_JUVENILE_PROFILE } from '../shared/pet/pet-personas';
import {
    getTavernPetPendingEvolutionRequest,
    getTavernPetPrivateSnapshotForChat,
    interactWithTavernPet,
} from '../shared/pet/pet-service';
import {
    TAVERN_PET_INSUFFICIENT_FUNDS_REASON,
    TavernPetError,
    type TavernPetState,
} from '../shared/pet/pet-types';
import type { TavernRunOnceResult } from '../app-src/runtime/run-once';
import {
    useTavernPetController,
    type TavernPetControllerOptions,
} from '../app-src/features/phone-os/apps/pet/useTavernPetController';
import { TAVERN_PET_REBUFF_FACE } from '../app-src/features/phone-os/apps/pet/tavern-pet-presentation';
import { tavernPetUiError } from '../app-src/features/phone-os/apps/pet/tavern-pet-errors';
import {
    createTavernPetTestSession,
    createTavernPetTestState,
    resetTavernPetTestDb,
    seedTavernPetForTest,
    tavernPetMutationBoundary,
} from './pet-test-helpers';

function modelResult(text: string): TavernRunOnceResult {
    return { text } as TavernRunOnceResult;
}

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, reject, resolve };
}

function juvenileChatJson(text = '好'): string {
    return JSON.stringify({
        face: TAVERN_PET_JUVENILE_PROFILE.faces.happy,
        text,
        motion: 'bounce',
        emotionShift: 'happy',
        murmur: null,
        summaryUpdate: null,
    });
}

function createPendingAdultState(
    sourceSessionId: string,
    requestId = 'pet-controller-evolution',
): TavernPetState {
    const state = createTavernPetTestState('adult');
    state.pendingEvolution = {
        requestId,
        milestoneId: 'adulthood',
        personaId: 'sunlet',
        axes: structuredClone(state.axes),
        stats: structuredClone(state.lifetimeStats),
        sourceSessionId,
        sourceTurn: 1,
        sourcePetTurn: state.petTurn,
        sourceAnchorOrder: 0,
    };
    return state;
}

function createController(input: {
    selectedSessionId: Ref<string>;
    runModel?: TavernPetControllerOptions['runModel'];
    refreshWallet?: () => void | Promise<void>;
    showToast?: TavernPetControllerOptions['showToast'];
    chatRunning?: Ref<boolean>;
    chatCancelling?: Ref<boolean>;
    memoryEditorMode?: Ref<'preview' | 'edit'>;
    characterArchiveBusy?: Ref<boolean>;
    acceptedRollbackBusy?: Ref<boolean>;
}) {
    const scope = effectScope();
    const chatRunning = input.chatRunning || ref(false);
    const chatCancelling = input.chatCancelling || ref(false);
    const memoryEditorMode = input.memoryEditorMode || ref<'preview' | 'edit'>('preview');
    const characterArchiveBusy = input.characterArchiveBusy || ref(false);
    const acceptedRollbackBusy = input.acceptedRollbackBusy || ref(false);
    const controller = scope.run(() => useTavernPetController({
        selectedSessionId: input.selectedSessionId,
        agentConfig: ref({}),
        chatRunning,
        chatCancelling,
        memoryEditorMode,
        characterArchiveBusy: computed(() => characterArchiveBusy.value),
        acceptedRollbackBusy: computed(() => acceptedRollbackBusy.value),
        wallet: { refreshAfterEconomyDomainChange: input.refreshWallet || (() => {}) },
        ...(input.showToast ? { showToast: input.showToast } : {}),
        runModel: input.runModel,
    }));
    if (!controller) {throw new Error('pet_controller_scope_missing');}
    return {
        acceptedRollbackBusy,
        characterArchiveBusy,
        chatCancelling,
        chatRunning,
        controller,
        memoryEditorMode,
        scope,
    };
}

async function waitUntil(predicate: () => boolean, detail: string): Promise<void> {
    for (let attempt = 0; attempt < 160; attempt += 1) {
        if (predicate()) {return;}
        await new Promise<void>((resolve) => setTimeout(resolve, 5));
    }
    throw new Error(detail);
}

test('controller serializes rapid mutations against the one global companion', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller lure');
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({ selectedSessionId });
    try {
        await controller.preparePet();
        const [first, second] = await Promise.all([
            controller.performAction('lure'),
            controller.performAction('lure'),
        ]);
        assert.ok(first);
        assert.equal(second, null);
        assert.equal(controller.view.value.existence, 'present');
        assert.equal(await tavernPetActionsTable.where('revision').equals(1).count(), 1);
    } finally {
        scope.stop();
    }
});

test('a committed action remains visible when the wallet refresh fails', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller wallet refresh');
    const toasts: string[] = [];
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        refreshWallet: async () => {throw new Error('wallet_refresh_failed');},
        showToast: (message) => {toasts.push(message);},
    });
    try {
        await controller.preparePet();
        assert.ok(await controller.performAction('lure'));
        assert.equal(controller.actionError.value, '');
        assert.equal(controller.status.value, '操作已经完成，余额显示稍后刷新。');
        assert.deepEqual(toasts, ['操作已经完成，余额显示稍后刷新。']);
        assert.equal(await tavernPetActionsTable.where('revision').equals(1).count(), 1);
    } finally {
        scope.stop();
    }
});

test('route deactivation clears only local Pet drawers and drafts', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller route deactivation');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const { controller, scope } = createController({ selectedSessionId: ref(session.id) });
    try {
        await controller.preparePet();
        controller.openNest();
        controller.openNaming();
        controller.nameDraft.value = '小灯';
        controller.deactivatePet();
        assert.equal(controller.nestOpen.value, false);
        assert.equal(controller.namingOpen.value, false);
        assert.equal(controller.nameDraft.value, '');
        assert.equal(controller.view.value.existence, 'present');
    } finally {
        scope.stop();
    }
});

test('an empty model reply stays temporary and writes neither journal nor chat memory', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller empty chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async () => modelResult(''),
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '你好';
        await controller.sendChat();
        assert.equal(controller.chatError.value, '它不想理你。');
        assert.equal(controller.utterance.value.face, TAVERN_PET_REBUFF_FACE);
        assert.equal(controller.utterance.value.text, '它不想理你。');
        assert.equal(await tavernPetJournalTable.count(), 0);
        const snapshot = await getTavernPetPrivateSnapshotForChat(session.id);
        assert.equal(snapshot?.companion.revision, 1);
        assert.equal(snapshot?.companion.state.chatMemory.recent.length, 0);
    } finally {
        scope.stop();
    }
});

test('a failed model request leaves the normalized sent text visible', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller normalized failed chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    let sentText = '';
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async (options) => {
            sentText = String(options.messages.at(-1)?.content || '');
            throw new Error('pet_test_network_failure');
        },
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '㍿'.repeat(120);
        await controller.sendChat();
        assert.equal([...controller.chatInput.value].length, 120);
        assert.equal(controller.chatInput.value, '株式会社'.repeat(30));
        assert.equal(sentText, controller.chatInput.value);
        assert.equal(await tavernPetJournalTable.count(), 0);
    } finally {
        scope.stop();
    }
});

test('a player message that normalizes to empty is a local input error', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller empty normalized chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    let modelCalls = 0;
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async () => {
            modelCalls += 1;
            return modelResult(juvenileChatJson());
        },
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '\u0000\u0007';
        await controller.sendChat();
        assert.equal(controller.chatInput.value, '');
        assert.equal(controller.chatError.value, '先跟它说点什么。');
        assert.equal(modelCalls, 0);
        assert.equal(await tavernPetJournalTable.count(), 0);
    } finally {
        scope.stop();
    }
});

test('wallet UI classification uses the structured Pet reason rather than localized text', () => {
    assert.deepEqual(tavernPetUiError(new TavernPetError(
        'pet_interaction_unavailable',
        TAVERN_PET_INSUFFICIENT_FUNDS_REASON,
    )), { kind: 'wallet', message: '小白币不够。' });
    assert.equal(tavernPetUiError(new TavernPetError(
        'pet_interaction_unavailable',
        '小白币不足',
    )).kind, 'generic');
});

test('controller sends normalized input and commits a forgiving model response', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(session.id);
    let sentText = '';
    const { controller, scope } = createController({
        selectedSessionId,
        runModel: async (options) => {
            sentText = String(options.messages.at(-1)?.content || '');
            return modelResult('{}\n{"response":{"text":"咱就是说"}}');
        },
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = ` ㍿${'啊'.repeat(119)} `;
        await controller.sendChat();
        assert.equal([...sentText].length, 120);
        assert.equal([...controller.chatInput.value].length, 0);
        assert.equal(controller.view.value.latestUtterance?.text, '咱就是说');
    } finally {
        scope.stop();
    }
});

test('leave confirmation clears the shared companion only after explicit confirmation', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller leave');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({ selectedSessionId });
    try {
        await controller.preparePet();
        controller.openLeaveConfirmation();
        assert.equal(controller.leaveConfirmOpen.value, true);
        await controller.confirmPetLeave();
        assert.equal(controller.leaveConfirmOpen.value, false);
        assert.equal(controller.view.value.existence, 'undiscovered');
    } finally {
        scope.stop();
    }
});

test('opening a Pet intent dialog does not inherit an earlier action error', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller dialog error scope');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const { controller, scope } = createController({ selectedSessionId: ref(session.id) });
    try {
        await controller.preparePet();
        controller.actionError.value = '上一项操作失败。';
        controller.openNaming();
        assert.equal(controller.namingOpen.value, true);
        assert.equal(controller.actionError.value, '');
        controller.closeNaming();

        controller.actionError.value = '另一项操作失败。';
        controller.openLeaveConfirmation();
        assert.equal(controller.leaveConfirmOpen.value, true);
        assert.equal(controller.actionError.value, '');
    } finally {
        scope.stop();
    }
});

test('memory editing invalidates stale model work without clearing its in-flight owner', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller stale chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(session.id);
    let resolveModel!: (value: TavernRunOnceResult) => void;
    const pending = new Promise<TavernRunOnceResult>((resolve) => {resolveModel = resolve;});
    const { controller, memoryEditorMode, scope } = createController({
        selectedSessionId,
        runModel: async () => await pending,
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '你好';
        const sending = controller.sendChat();
        await Promise.resolve();
        memoryEditorMode.value = 'edit';
        resolveModel(modelResult(JSON.stringify({
            face: TAVERN_PET_JUVENILE_PROFILE.faces.default,
            text: '迟到的话',
            motion: 'none',
            emotionShift: null,
            murmur: null,
            summaryUpdate: null,
        })));
        await sending;
        assert.notEqual(controller.view.value.latestUtterance?.text, '迟到的话');
    } finally {
        scope.stop();
    }
});

test('Pet chat re-captures the current Phone boundary after the model returns', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller fresh boundary');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(session.id);
    let resolveModel!: (result: TavernRunOnceResult) => void;
    let modelStarted!: () => void;
    const model = new Promise<TavernRunOnceResult>((resolve) => {resolveModel = resolve;});
    const started = new Promise<void>((resolve) => {modelStarted = resolve;});
    const { controller, scope } = createController({
        selectedSessionId,
        runModel: async () => {
            modelStarted();
            return await model;
        },
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '还在吗';
        const sending = controller.sendChat();
        await started;
        await appendTavernMessage(session.id, { role: 'user', content: '另一标签页推进的输入。' });
        await appendTavernMessage(session.id, { role: 'assistant', content: '另一标签页推进的回复。' });
        resolveModel(modelResult(JSON.stringify({ text: '我在。' })));
        await sending;
        assert.equal(controller.chatError.value, '');
        assert.equal(controller.view.value.latestUtterance?.text, '我在。');
        assert.equal(await tavernPetActionsTable.where('revision').equals(2).count(), 1);
    } finally {
        scope.stop();
    }
});

test('a session resolving another session’s pending evolution refreshes globally without leaking its toast', async () => {
    await resetTavernPetTestDb();
    const source = await createTavernPetTestSession('Controller evolution source');
    const observer = await createTavernPetTestSession('Controller evolution observer');
    const pendingState = createTavernPetTestState('adult', { petTurn: 1, phaseTurnCount: 30 });
    pendingState.pendingEvolution = {
        requestId: 'cross-session-evolution',
        milestoneId: 'adulthood',
        personaId: 'sunlet',
        axes: structuredClone(pendingState.axes),
        stats: structuredClone(pendingState.lifetimeStats),
        sourceSessionId: source.id,
        sourceTurn: 1,
        sourcePetTurn: 1,
        sourceAnchorOrder: 0,
    };
    await seedTavernPetForTest(source.id, pendingState);
    const toasts: string[] = [];
    const { controller, scope } = createController({
        selectedSessionId: ref(observer.id),
        showToast: (message) => {toasts.push(message);},
        runModel: async () => modelResult(canonicalTavernPetStaticVerdict('sunlet')),
    });
    try {
        await controller.preparePet();
        await waitUntil(() => controller.view.value.pendingEvolution === false, 'cross_session_evolution_not_committed');
        assert.equal(controller.view.value.existence, 'present');
        assert.deepEqual(toasts, []);
    } finally {
        scope.stop();
    }
});

test('two concurrent model replies converge through global Companion CAS without a lost chat write', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller concurrent chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(session.id);
    let resolveFirst!: (result: TavernRunOnceResult) => void;
    let resolveSecond!: (result: TavernRunOnceResult) => void;
    const firstResult = new Promise<TavernRunOnceResult>((resolve) => {resolveFirst = resolve;});
    const secondResult = new Promise<TavernRunOnceResult>((resolve) => {resolveSecond = resolve;});
    const first = createController({ selectedSessionId, runModel: async () => await firstResult });
    const second = createController({ selectedSessionId, runModel: async () => await secondResult });
    try {
        await Promise.all([first.controller.preparePet(), second.controller.preparePet()]);
        first.controller.chatInput.value = '第一句';
        second.controller.chatInput.value = '第二句';
        const sends = [first.controller.sendChat(), second.controller.sendChat()];
        await Promise.resolve();
        resolveFirst(modelResult(JSON.stringify({ text: '先到。' })));
        resolveSecond(modelResult(JSON.stringify({ text: '后到。' })));
        await Promise.all(sends);
        assert.equal(await tavernPetActionsTable.where('revision').equals(2).count(), 1);
        assert.equal([first.controller.view.value.latestUtterance?.text, second.controller.view.value.latestUtterance?.text]
            .filter(Boolean).length >= 1, true);
    } finally {
        first.scope.stop();
        second.scope.stop();
    }
});

test('archive invalidation keeps a mutation owner until its original write settles', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller mutation epoch');
    const characterArchiveBusy = ref(false);
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        characterArchiveBusy,
    });
    const table = tavernPetActionsTable as unknown as {
        add(record: unknown): Promise<unknown>;
    };
    const originalAdd = table.add.bind(table);
    const writeStarted = deferred<void>();
    const releaseWrite = deferred<void>();
    table.add = async (record) => {
        writeStarted.resolve();
        await (Dexie as unknown as {
            waitFor<T>(promise: Promise<T>): Promise<T>;
        }).waitFor(releaseWrite.promise);
        return await originalAdd(record);
    };
    try {
        await controller.preparePet();
        const first = controller.performAction('lure');
        await writeStarted.promise;
        characterArchiveBusy.value = true;
        await nextTick();
        characterArchiveBusy.value = false;
        await nextTick();

        assert.equal(controller.busyAction.value, 'lure');
        assert.equal(await controller.setInterferenceEnabled(false), null);

        releaseWrite.resolve();
        assert.equal(await first, null);
        assert.equal(controller.busyAction.value, '');
        assert.equal(controller.view.value.existence, 'undiscovered');
        assert.equal(await tavernPetActionsTable.where('revision').equals(1).count(), 1);
    } finally {
        table.add = originalAdd;
        releaseWrite.resolve();
        scope.stop();
    }
});

test('a stale chat result is discarded after another writer changes the global companion', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller stale chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const response = deferred<TavernRunOnceResult>();
    const started = deferred<void>();
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async () => {
            started.resolve();
            return await response.promise;
        },
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '你在吗';
        const pendingChat = controller.sendChat();
        await started.promise;
        await interactWithTavernPet({
            ...await tavernPetMutationBoundary(session.id, 'external-pat'),
            interactionId: 'pat',
        });
        response.resolve(modelResult(juvenileChatJson()));
        await pendingChat;
        assert.equal(controller.chatError.value, '它在你等回复的时候变了主意。');
        assert.equal(controller.view.value.revision, 2);
        assert.equal(await tavernPetJournalTable.count(), 0);
        assert.equal((await getTavernPetPrivateSnapshotForChat(session.id))?.companion.state.chatMemory.recent.length, 0);
    } finally {
        response.reject(new Error('disposed'));
        scope.stop();
    }
});

test('session switch aborts the old chat without letting its finally clear the new owner', async () => {
    await resetTavernPetTestDb();
    const firstSession = await createTavernPetTestSession('Controller old chat owner');
    const secondSession = await createTavernPetTestSession('Controller new chat owner');
    await seedTavernPetForTest(firstSession.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(firstSession.id);
    const calls: Array<{
        signal: AbortSignal | undefined;
        response: ReturnType<typeof deferred<TavernRunOnceResult>>;
    }> = [];
    const { controller, scope } = createController({
        selectedSessionId,
        runModel: async (options) => {
            const response = deferred<TavernRunOnceResult>();
            calls.push({ signal: options.signal, response });
            return await response.promise;
        },
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '旧会话';
        const oldChat = controller.sendChat();
        await waitUntil(() => calls.length === 1, 'pet_old_chat_not_started');
        selectedSessionId.value = secondSession.id;
        await nextTick();
        await waitUntil(() => controller.view.value.existence === 'present', 'pet_new_session_not_prepared');
        assert.equal(calls[0].signal?.aborted, true);

        controller.chatInput.value = '新会话';
        const newChat = controller.sendChat();
        await waitUntil(() => calls.length === 2, 'pet_new_chat_not_started');
        calls[0].response.resolve(modelResult(juvenileChatJson('旧')));
        await oldChat;
        assert.equal(controller.modelRequestKind.value, 'chat');

        calls[1].response.resolve(modelResult(juvenileChatJson('新')));
        await newChat;
        assert.equal(controller.modelRequestKind.value, '');
        assert.equal(controller.view.value.revision, 2);
        assert.equal(await tavernPetJournalTable.where('sourceSessionId').equals(firstSession.id).count(), 0);
        assert.equal(await tavernPetJournalTable.where('sourceSessionId').equals(secondSession.id).count(), 1);
    } finally {
        calls.forEach((call) => call.response.reject(new Error('disposed')));
        scope.stop();
    }
});

test('pending evolution waits for main chat and falls back without leaving a request lock', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller pending fallback');
    await seedTavernPetForTest(session.id, createPendingAdultState(session.id, 'pending-fallback'));
    const chatRunning = ref(true);
    let modelCalls = 0;
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        chatRunning,
        runModel: async () => {
            modelCalls += 1;
            throw new Error('provider unavailable');
        },
    });
    try {
        await controller.preparePet();
        await new Promise<void>((resolve) => setTimeout(resolve, 20));
        assert.equal(modelCalls, 0);
        assert.equal(controller.view.value.pendingEvolution, true);
        chatRunning.value = false;
        await nextTick();
        await waitUntil(() => controller.view.value.pendingEvolution === false, 'pet_fallback_not_committed');
        assert.equal(modelCalls, 1);
        assert.equal(controller.modelRequestKind.value, '');
        const resolution = (await tavernPetActionsTable.toArray()).find((row) => row.action.kind === 'resolve-evolution');
        assert.equal(resolution?.action.kind === 'resolve-evolution' && resolution.action.usedFallback, true);
    } finally {
        scope.stop();
    }
});

test('an active pending evolution yields to main chat and retries after it ends', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller pending yield');
    await seedTavernPetForTest(session.id, createPendingAdultState(session.id, 'pending-yield'));
    const chatRunning = ref(false);
    let modelCalls = 0;
    let firstSignal: AbortSignal | undefined;
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        chatRunning,
        runModel: async (options) => {
            modelCalls += 1;
            if (modelCalls === 1) {
                firstSignal = options.signal;
                return await new Promise<TavernRunOnceResult>((_resolve, reject) => {
                    options.signal?.addEventListener('abort', () => {
                        reject(new DOMException('Aborted', 'AbortError'));
                    }, { once: true });
                });
            }
            throw new Error('provider unavailable');
        },
    });
    try {
        await controller.preparePet();
        await waitUntil(() => controller.modelRequestKind.value === 'evolution', 'pet_pending_request_not_started');
        chatRunning.value = true;
        await nextTick();
        await waitUntil(() => controller.modelRequestKind.value === '', 'pet_pending_request_not_cancelled');
        assert.equal(firstSignal?.aborted, true);
        assert.equal(controller.view.value.pendingEvolution, true);

        chatRunning.value = false;
        await nextTick();
        await waitUntil(() => controller.view.value.pendingEvolution === false, 'pet_pending_request_not_retried');
        assert.equal(modelCalls, 2);
        assert.equal(controller.modelRequestKind.value, '');
    } finally {
        scope.stop();
    }
});

test('a cancelled pending evolution remains recoverable from a fresh Phone root', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller pending recovery');
    await seedTavernPetForTest(session.id, createPendingAdultState(session.id, 'pending-recovery'));
    const selectedSessionId = ref(session.id);
    const firstResponse = deferred<TavernRunOnceResult>();
    let firstSignal: AbortSignal | undefined;
    const first = createController({
        selectedSessionId,
        runModel: async (options) => {
            firstSignal = options.signal;
            return await firstResponse.promise;
        },
    });
    await first.controller.preparePet();
    await waitUntil(() => first.controller.modelRequestKind.value === 'evolution', 'pet_recovery_first_not_started');
    first.scope.stop();
    assert.equal(firstSignal?.aborted, true);
    assert.ok(await getTavernPetPendingEvolutionRequest(session.id));
    firstResponse.resolve(modelResult(canonicalTavernPetStaticVerdict('sunlet')));
    await new Promise<void>((resolve) => setTimeout(resolve, 10));

    const second = createController({
        selectedSessionId,
        runModel: async () => modelResult(canonicalTavernPetStaticVerdict('sunlet')),
    });
    try {
        await second.controller.preparePet();
        await waitUntil(() => second.controller.view.value.pendingEvolution === false, 'pet_recovery_not_committed');
        const resolutions = (await tavernPetActionsTable.toArray())
            .filter((row) => row.action.kind === 'resolve-evolution');
        assert.equal(resolutions.length, 1);
        assert.equal(resolutions[0].action.kind === 'resolve-evolution' && resolutions[0].action.usedFallback, false);
    } finally {
        firstResponse.reject(new Error('disposed'));
        second.scope.stop();
    }
});

test('two Phone roots resolving one pending evolution preserve the first verdict', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller pending race');
    await seedTavernPetForTest(session.id, createPendingAdultState(session.id, 'pending-race'));
    const selectedSessionId = ref(session.id);
    const chatRunning = ref(true);
    const firstResponse = deferred<TavernRunOnceResult>();
    const secondResponse = deferred<TavernRunOnceResult>();
    const first = createController({ selectedSessionId, chatRunning, runModel: async () => await firstResponse.promise });
    const second = createController({ selectedSessionId, chatRunning, runModel: async () => await secondResponse.promise });
    try {
        await Promise.all([first.controller.preparePet(), second.controller.preparePet()]);
        chatRunning.value = false;
        await nextTick();
        await waitUntil(() => (
            first.controller.modelRequestKind.value === 'evolution'
            && second.controller.modelRequestKind.value === 'evolution'
        ), 'pet_race_not_started');
        const winningVerdict = canonicalTavernPetStaticVerdict('sunlet');
        const losingVerdict = canonicalTavernPetStaticVerdict('rain-courier');
        firstResponse.resolve(modelResult(winningVerdict));
        await waitUntil(() => first.controller.view.value.pendingEvolution === false, 'pet_race_first_not_committed');
        secondResponse.resolve(modelResult(losingVerdict));
        await waitUntil(() => second.controller.modelRequestKind.value === '', 'pet_race_second_not_finished');
        const resolutions = (await tavernPetActionsTable.toArray())
            .filter((row) => row.action.kind === 'resolve-evolution');
        assert.equal(resolutions.length, 1);
        assert.equal(
            resolutions[0].action.kind === 'resolve-evolution' ? resolutions[0].action.verdict : '',
            winningVerdict,
        );
        assert.equal(first.controller.actionError.value, '');
        assert.equal(second.controller.actionError.value, '');
    } finally {
        firstResponse.reject(new Error('disposed'));
        secondResponse.reject(new Error('disposed'));
        first.scope.stop();
        second.scope.stop();
    }
});

test('a committed wake toast is not repeated by a same-tab domain refresh', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller toast dedupe');
    await seedTavernPetForTest(session.id, createTavernPetTestState('adult', {
        dormant: true,
        satiety: 0,
    }));
    const toasts: string[] = [];
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        showToast: (message) => {toasts.push(message);},
    });
    try {
        await controller.preparePet();
        const result = await controller.performAction('wake');
        const journalId = result?.actionRecord?.activityId || '';
        assert.ok(journalId);
        assert.deepEqual(toasts, ['它回来了。']);
        await controller.refreshAfterPetDomainChange([journalId]);
        assert.deepEqual(toasts, ['它回来了。']);
    } finally {
        scope.stop();
    }
});
