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
    tavernEconomyTransactionsTable,
    tavernPetActivitiesTable,
    tavernPetStateVersionsTable,
} from '../shared/session-db';
import {
    getTavernPetPendingEvolutionRequest,
    getTavernPetPrivateSnapshotForChat,
    interactWithTavernPet,
} from '../shared/pet/pet-service';
import {
    canonicalTavernPetStaticVerdict,
} from '../shared/pet/pet-copy';
import {
    TAVERN_PET_JUVENILE_PROFILE,
} from '../shared/pet/pet-personas';
import {
    TAVERN_PET_INSUFFICIENT_FUNDS_REASON,
    TavernPetError,
    type TavernPetState,
    type TavernPetStateVersionRecord,
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
    seedCurrentTavernPetState,
    tavernPetMutationBoundary,
} from './pet-test-helpers';

function deferred<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, reject, resolve };
}

function modelResult(text: string): TavernRunOnceResult {
    return { text } as TavernRunOnceResult;
}

async function waitUntil(predicate: () => boolean, label = 'pet_controller_timeout'): Promise<void> {
    for (let index = 0; index < 160; index += 1) {
        if (predicate()) {return;}
        await new Promise<void>((resolve) => setTimeout(resolve, 5));
    }
    throw new Error(label);
}

function createPendingAdultState(requestId = 'pet-controller-evolution'): TavernPetState {
    const state = createTavernPetTestState('adult');
    state.pendingEvolution = {
        requestId,
        milestoneId: 'adulthood',
        personaId: 'sunlet',
        axes: structuredClone(state.axes),
        stats: structuredClone(state.lifetimeStats),
        turn: 0,
        anchorOrder: 0,
    };
    return state;
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
        wallet: {
            refreshAfterEconomyDomainChange: input.refreshWallet || (() => {}),
        },
        showToast: input.showToast,
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

test('Pet controller turns a rapid double lure into one mutation', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet controller double click');
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
        assert.equal(await tavernPetStateVersionsTable.where('sessionId').equals(session.id).count(), 1);
        assert.equal(
            (await tavernEconomyTransactionsTable.where('sessionId').equals(session.id).toArray())
                .filter((transaction) => transaction.sourceDomain === 'pet').length,
            1,
        );
    } finally {
        scope.stop();
    }
});

test('Pet controller reports a committed action when Wallet refresh fails', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet controller Wallet refresh');
    const selectedSessionId = ref(session.id);
    const toasts: string[] = [];
    const { controller, scope } = createController({
        selectedSessionId,
        refreshWallet: async () => {throw new Error('wallet_refresh_failed');},
        showToast: (message) => {toasts.push(message);},
    });
    try {
        await controller.preparePet();
        assert.ok(await controller.performAction('lure'));
        assert.equal(controller.actionError.value, '');
        assert.equal(controller.status.value, '操作已经完成，余额显示稍后刷新。');
        assert.deepEqual(toasts, ['操作已经完成，余额显示稍后刷新。']);
        assert.equal(await tavernPetStateVersionsTable.where('sessionId').equals(session.id).count(), 1);
    } finally {
        scope.stop();
    }
});

test('Pet controller clears app-local drawers and drafts when its route deactivates', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet controller route deactivation');
    await seedCurrentTavernPetState(session.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({ selectedSessionId });
    try {
        await controller.preparePet();
        controller.openNest();
        controller.openNaming();
        controller.nameDraft.value = '小灯';
        controller.deactivatePet();
        assert.equal(controller.nestOpen.value, false);
        assert.equal(controller.namingOpen.value, false);
        assert.equal(controller.nameDraft.value, '');
    } finally {
        scope.stop();
    }
});

test('an empty Pet model reply stays temporary and writes no Activity or memory', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet controller chat failure');
    await seedCurrentTavernPetState(session.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(session.id);
    const { controller, scope } = createController({
        selectedSessionId,
        runModel: async () => modelResult(''),
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '你好';
        await controller.sendChat();
        assert.equal(controller.chatError.value, '它不想理你。');
        assert.equal(controller.utterance.value.face, TAVERN_PET_REBUFF_FACE);
        assert.equal(controller.utterance.value.text, '它不想理你。');
        assert.equal(await tavernPetActivitiesTable.where('sessionId').equals(session.id).count(), 0);
        const state = await getTavernPetPrivateSnapshotForChat(session.id);
        assert.equal(state?.record.revision, 1);
        assert.equal(state?.record.state.chatMemory.recent.length, 0);
    } finally {
        scope.stop();
    }
});

test('Pet chat keeps the normalized text visible when the request fails', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet controller normalized failed chat');
    await seedCurrentTavernPetState(session.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(session.id);
    let sentText = '';
    const { controller, scope } = createController({
        selectedSessionId,
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
        assert.equal(await tavernPetActivitiesTable.where('sessionId').equals(session.id).count(), 0);
    } finally {
        scope.stop();
    }
});

test('a player message that normalizes to empty stays a local input error', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet controller empty normalized chat');
    await seedCurrentTavernPetState(session.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(session.id);
    let modelCalls = 0;
    const { controller, scope } = createController({
        selectedSessionId,
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
        assert.equal(await tavernPetActivitiesTable.where('sessionId').equals(session.id).count(), 0);
    } finally {
        scope.stop();
    }
});

test('Pet wallet errors are classified by structured reason instead of localized message text', () => {
    assert.deepEqual(tavernPetUiError(new TavernPetError(
        'pet_interaction_unavailable',
        TAVERN_PET_INSUFFICIENT_FUNDS_REASON,
    )), { kind: 'wallet', message: '小白币不够。' });
    assert.equal(tavernPetUiError(new TavernPetError(
        'pet_interaction_unavailable',
        '小白币不足',
    )).kind, 'generic');
});

test('archive invalidation keeps the Pet mutation owner until its original write promise settles', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet controller mutation epoch');
    const selectedSessionId = ref(session.id);
    const characterArchiveBusy = ref(false);
    const { controller, scope } = createController({ selectedSessionId, characterArchiveBusy });
    const table = tavernPetStateVersionsTable as unknown as {
        add(record: TavernPetStateVersionRecord): Promise<unknown>;
    };
    const originalAdd = table.add.bind(table);
    const writeStarted = deferred<void>();
    const releaseWrite = deferred<void>();
    table.add = async (record) => {
        writeStarted.resolve();
        await (Dexie as unknown as { waitFor<T>(promise: Promise<T>): Promise<T> }).waitFor(releaseWrite.promise);
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
        assert.equal(await tavernPetStateVersionsTable.where('sessionId').equals(session.id).count(), 1);
    } finally {
        table.add = originalAdd;
        releaseWrite.resolve();
        scope.stop();
    }
});

test('a stale Pet chat result is discarded and refreshed after an external mutation', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet controller stale chat');
    await seedCurrentTavernPetState(session.id, createTavernPetTestState('juvenile'));
    const selectedSessionId = ref(session.id);
    const response = deferred<TavernRunOnceResult>();
    const started = deferred<void>();
    const { controller, scope } = createController({
        selectedSessionId,
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
        assert.equal(await tavernPetActivitiesTable.where('sessionId').equals(session.id).count(), 0);
        assert.equal((await getTavernPetPrivateSnapshotForChat(session.id))?.record.state.chatMemory.recent.length, 0);
    } finally {
        response.reject(new Error('disposed'));
        scope.stop();
    }
});

test('session switch aborts the old chat and its finally cannot clear the new request owner', async () => {
    await resetTavernPetTestDb();
    const firstSession = await createTavernPetTestSession('Pet old chat owner');
    const secondSession = await createTavernPetTestSession('Pet new chat owner');
    await seedCurrentTavernPetState(firstSession.id, createTavernPetTestState('juvenile'));
    await seedCurrentTavernPetState(secondSession.id, createTavernPetTestState('juvenile'));
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
        await waitUntil(() => controller.view.value.versionId.includes(secondSession.id), 'pet_new_session_not_prepared');
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
        assert.equal(await tavernPetActivitiesTable.where('sessionId').equals(firstSession.id).count(), 0);
        assert.equal(await tavernPetActivitiesTable.where('sessionId').equals(secondSession.id).count(), 1);
    } finally {
        calls.forEach((call) => call.response.reject(new Error('disposed')));
        scope.stop();
    }
});

test('pending evolution waits for the main chat and falls back without leaving a request lock', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet pending fallback');
    await seedCurrentTavernPetState(session.id, createPendingAdultState('pet-controller-fallback'));
    const selectedSessionId = ref(session.id);
    const chatRunning = ref(true);
    let modelCalls = 0;
    const { controller, scope } = createController({
        selectedSessionId,
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
        const rows = await tavernPetStateVersionsTable.where('sessionId').equals(session.id).toArray();
        const resolution = rows.find((row) => row.action.kind === 'resolve-evolution');
        assert.ok(resolution && resolution.action.kind === 'resolve-evolution');
        if (resolution?.action.kind === 'resolve-evolution') {
            assert.equal(resolution.action.usedFallback, true);
            assert.equal(resolution.action.verdict, canonicalTavernPetStaticVerdict('sunlet'));
        }
    } finally {
        scope.stop();
    }
});

test('an active pending evolution yields to the main chat and retries after it ends', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet pending main-chat yield');
    await seedCurrentTavernPetState(session.id, createPendingAdultState('pet-controller-main-chat-yield'));
    const selectedSessionId = ref(session.id);
    const chatRunning = ref(false);
    let modelCalls = 0;
    let firstSignal: AbortSignal | undefined;
    const { controller, scope } = createController({
        selectedSessionId,
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

test('an aborted pending evolution remains recoverable by a new Phone root scope', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet pending recovery');
    await seedCurrentTavernPetState(session.id, createPendingAdultState('pet-controller-recovery'));
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
        const rows = await tavernPetStateVersionsTable.where('sessionId').equals(session.id).toArray();
        const resolutions = rows.filter((row) => row.action.kind === 'resolve-evolution');
        assert.equal(resolutions.length, 1);
        assert.equal(resolutions[0].action.kind === 'resolve-evolution' && resolutions[0].action.usedFallback, false);
    } finally {
        firstResponse.reject(new Error('disposed'));
        second.scope.stop();
    }
});

test('two Phone roots resolving one pending evolution converge on the first verdict', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet pending race');
    await seedCurrentTavernPetState(session.id, createPendingAdultState('pet-controller-race'));
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
        const rows = await tavernPetStateVersionsTable.where('sessionId').equals(session.id).toArray();
        const resolutions = rows.filter((row) => row.action.kind === 'resolve-evolution');
        assert.equal(resolutions.length, 1);
        const action = resolutions[0].action;
        assert.equal(action.kind === 'resolve-evolution' ? action.verdict : '', winningVerdict);
        assert.equal(await tavernPetActivitiesTable.where('sessionId').equals(session.id).count(), 1);
        assert.equal(first.controller.actionError.value, '');
        assert.equal(second.controller.actionError.value, '');
    } finally {
        firstResponse.reject(new Error('disposed'));
        secondResponse.reject(new Error('disposed'));
        first.scope.stop();
        second.scope.stop();
    }
});

test('a committed wake toast is not repeated by the same-tab domain refresh', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Pet toast dedupe');
    await seedCurrentTavernPetState(session.id, createTavernPetTestState('adult', {
        dormant: true,
        satiety: 0,
    }));
    const selectedSessionId = ref(session.id);
    const toasts: string[] = [];
    const { controller, scope } = createController({
        selectedSessionId,
        showToast: (message) => {toasts.push(message);},
    });
    try {
        await controller.preparePet();
        const result = await controller.performAction('wake');
        const activityId = result?.actionRecord?.activityId || '';
        assert.ok(activityId);
        assert.deepEqual(toasts, ['它回来了。']);
        await controller.refreshAfterPetDomainChange(session.id, [activityId]);
        assert.deepEqual(toasts, ['它回来了。']);
    } finally {
        scope.stop();
    }
});
