import assert from 'node:assert/strict';
import test from 'node:test';
import 'fake-indexeddb/auto';
import {
    computed,
    effectScope,
    ref,
    type Ref,
} from 'vue';

import {
    appendTavernMessage,
    tavernPetActionsTable,
    tavernPetJournalTable,
} from '../shared/session-db';
import { canonicalTavernPetStaticVerdict } from '../shared/pet/pet-copy';
import { TAVERN_PET_JUVENILE_PROFILE } from '../shared/pet/pet-personas';
import { getTavernPetPrivateSnapshotForChat } from '../shared/pet/pet-service';
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
    advanceTavernPetStoryTurnForTest,
    createTavernPetTestSession,
    createTavernPetTestState,
    lureTavernPetForTest,
    resetTavernPetTestDb,
    seedTavernPetForTest,
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

function createPendingAdultState(sourceSessionId: string, requestId = 'pet-controller-evolution'): TavernPetState {
    const state = createTavernPetTestState('adult');
    const personaId = state.personaId;
    if (!personaId) {throw new Error('pet_test_adult_persona_missing');}
    state.pendingEvolution = {
        requestId,
        milestoneId: 'adulthood',
        personaId,
        traits: structuredClone(state.traits),
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
    agentConfig?: Ref<Record<string, unknown>>;
    runModel?: TavernPetControllerOptions['runModel'];
    refreshWallet?: () => void | Promise<void>;
    showToast?: TavernPetControllerOptions['showToast'];
    openApiSettings?: () => void;
    memoryEditorMode?: Ref<'preview' | 'edit'>;
    characterArchiveBusy?: Ref<boolean>;
    acceptedRollbackBusy?: Ref<boolean>;
}) {
    const scope = effectScope();
    const memoryEditorMode = input.memoryEditorMode || ref<'preview' | 'edit'>('preview');
    const characterArchiveBusy = input.characterArchiveBusy || ref(false);
    const acceptedRollbackBusy = input.acceptedRollbackBusy || ref(false);
    const agentConfig = input.agentConfig || ref<Record<string, unknown>>({
        delegateConfigured: true,
        delegateConfig: {
            provider: 'openai-compatible',
            modelConfigs: {
                'openai-compatible': {
                    baseUrl: 'https://delegate.example/v1',
                    model: 'pet-model',
                    apiKey: 'pet-key',
                },
            },
        },
    });
    const controller = scope.run(() => useTavernPetController({
        selectedSessionId: input.selectedSessionId,
        agentConfig,
        memoryEditorMode,
        characterArchiveBusy: computed(() => characterArchiveBusy.value),
        acceptedRollbackBusy: computed(() => acceptedRollbackBusy.value),
        wallet: { refreshAfterEconomyDomainChange: input.refreshWallet || (() => {}) },
        ...(input.showToast ? { showToast: input.showToast } : {}),
        ...(input.openApiSettings ? { openApiSettings: input.openApiSettings } : {}),
        runModel: input.runModel,
    }));
    if (!controller) {throw new Error('pet_controller_scope_missing');}
    return {
        acceptedRollbackBusy,
        characterArchiveBusy,
        controller,
        memoryEditorMode,
        scope,
    };
}

async function waitUntil(predicate: () => boolean, detail = 'pet_controller_wait_timeout'): Promise<void> {
    for (let attempt = 0; attempt < 160; attempt += 1) {
        if (predicate()) {return;}
        await new Promise<void>((resolve) => setTimeout(resolve, 5));
    }
    throw new Error(detail);
}

test('controller serializes rapid mutations against the one global companion', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller lure');
    const { controller, scope } = createController({ selectedSessionId: ref(session.id) });
    try {
        await controller.preparePet();
        const [first, second] = await Promise.all([
            controller.performAction('lure'),
            controller.performAction('lure'),
        ]);
        assert.ok(first);
        assert.equal(second, null);
        assert.equal(controller.view.value.phase, 'egg');
        assert.equal(await tavernPetActionsTable.where('revision').equals(1).count(), 1);
    } finally {
        scope.stop();
    }
});

test('a local milestone notifies once instead of being swallowed by snapshot baselining', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller local Journal notice');
    const toasts: string[] = [];
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        showToast: (message) => {toasts.push(message);},
    });
    try {
        await controller.preparePet();
        assert.ok(await controller.performAction('lure'));
        assert.deepEqual(toasts, ['角落里多了一枚蛋。']);
    } finally {
        scope.stop();
    }
});

test('a committed pet action releases the UI without waiting for wallet presentation refresh', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller nest mutation guard');
    const walletRefresh = deferred<void>();
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        refreshWallet: async () => await walletRefresh.promise,
    });
    try {
        await controller.preparePet();
        const operation = controller.performAction('lure');
        await waitUntil(() => controller.view.value.phase === 'egg');
        await operation;
        assert.equal(controller.busyAction.value, '');
        controller.openNest();
        controller.closeNest();
        assert.equal(controller.nestOpen.value, false);
        walletRefresh.resolve();
    } finally {
        walletRefresh.resolve();
        scope.stop();
    }
});

test('touching the stage is transient: it writes no global action or journal', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller touch');
    await lureTavernPetForTest(session.id, 'touch-lure');
    const { controller, scope } = createController({ selectedSessionId: ref(session.id) });
    try {
        await controller.preparePet();
        const actions = await tavernPetActionsTable.count();
        const journal = await tavernPetJournalTable.count();
        controller.touchStage();
        assert.match(controller.utterance.value.text, /咚|蛋壳|\?/, 'a local egg reaction is visible');
        assert.equal(await tavernPetActionsTable.count(), actions);
        assert.equal(await tavernPetJournalTable.count(), journal);
    } finally {
        scope.stop();
    }
});

test('egg chat is static, does not call a model, and does not persist a chat', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller egg chat');
    await lureTavernPetForTest(session.id, 'egg-chat-lure');
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
        const journalBefore = await tavernPetJournalTable.count();
        controller.chatInput.value = '在里面吗';
        await controller.sendChat();
        assert.equal(modelCalls, 0);
        assert.equal(controller.chatInput.value, '');
        assert.ok(controller.utterance.value.text.length > 0);
        assert.equal(await tavernPetJournalTable.count(), journalBefore);
    } finally {
        scope.stop();
    }
});

test('a model failure keeps normalized player input and says it did not hear clearly', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller failed chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async () => {throw new Error('provider_down');},
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = ` \u337f${'啊'.repeat(119)} `;
        await controller.sendChat();
        assert.equal([...controller.chatInput.value].length, 120);
        assert.equal(controller.chatError.value, '它没听清。');
        assert.equal(controller.utterance.value.face, TAVERN_PET_REBUFF_FACE);
        assert.equal(await tavernPetJournalTable.count(), 0);
    } finally {
        scope.stop();
    }
});

test('main-story generation neither blocks nor cancels an in-flight pet chat', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller independent pet chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile', {
        petTurn: 24,
        nextMomentPetTurn: 30,
    }));
    const gate = deferred<TavernRunOnceResult>();
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async (options) => options.promptDiagnostics?.operation === 'evolution'
            ? modelResult(canonicalTavernPetStaticVerdict('blank'))
            : await gate.promise,
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '你也听见外面了吗';
        const send = controller.sendChat();
        await waitUntil(() => controller.isChatWaiting.value);
        assert.equal(controller.chatBlockedReason.value, '它正在想怎么回答你。');
        await advanceTavernPetStoryTurnForTest(session.id, [99]);
        gate.resolve(modelResult(juvenileChatJson('听见了。')));
        await send;
        assert.equal(controller.chatError.value, '');
        assert.equal(controller.chatInput.value, '');
        assert.equal(controller.view.value.phase, 'adult');
        assert.equal(controller.utterance.value.text, '听见了。');
        await waitUntil(() => controller.view.value.pendingEvolution === false);
    } finally {
        gate.resolve(modelResult(juvenileChatJson()));
        scope.stop();
    }
});

test('disposing the controller cannot restart pending evolution from an old chat finally', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller disposed evolution');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile', {
        petTurn: 24,
        nextMomentPetTurn: 30,
    }));
    const chatGate = deferred<TavernRunOnceResult>();
    const modelOperations: string[] = [];
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async (options) => {
            const operation = String(options.promptDiagnostics?.operation || '');
            modelOperations.push(operation);
            return operation === 'chat'
                ? await chatGate.promise
                : modelResult(canonicalTavernPetStaticVerdict('blank'));
        },
    });
    let stopped = false;
    try {
        await controller.preparePet();
        controller.chatInput.value = '等你长大再回答也可以';
        const send = controller.sendChat();
        await waitUntil(() => controller.isChatWaiting.value);
        await advanceTavernPetStoryTurnForTest(session.id, [99]);
        await controller.refreshAfterPetDomainChange();
        assert.equal(controller.view.value.pendingEvolution, true);

        scope.stop();
        stopped = true;
        chatGate.resolve(modelResult(juvenileChatJson('我长大了。')));
        await send;
        await new Promise<void>((resolve) => setTimeout(resolve, 30));

        assert.deepEqual(modelOperations, ['chat']);
        assert.equal(
            (await getTavernPetPrivateSnapshotForChat(session.id))?.companion.state.pendingEvolution?.milestoneId,
            'adulthood',
        );
    } finally {
        chatGate.resolve(modelResult(juvenileChatJson()));
        if (!stopped) {scope.stop();}
    }
});

test('missing delegate configuration blocks only model chat and exposes the configuration action', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller missing pet model');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    let modelCalls = 0;
    let settingsOpens = 0;
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        agentConfig: ref({}),
        openApiSettings: () => {settingsOpens += 1;},
        runModel: async () => {
            modelCalls += 1;
            return modelResult(juvenileChatJson());
        },
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '你在吗';
        assert.equal(controller.delegateModelReady.value, false);
        assert.equal(controller.chatBlockedReason.value, '还没有配置分身模型。');
        assert.equal(controller.canSubmitChat.value, false);
        await controller.sendChat();
        assert.equal(modelCalls, 0);
        assert.equal(controller.chatInput.value, '你在吗');
        controller.openApiSettings();
        assert.equal(settingsOpens, 1);
    } finally {
        scope.stop();
    }
});

test('cancelling pet chat restores idle presentation and preserves the draft', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller cancel pet chat');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const gate = deferred<TavernRunOnceResult>();
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async () => await gate.promise,
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '先等等';
        const send = controller.sendChat();
        await waitUntil(() => controller.isChatWaiting.value);
        controller.cancelChat();
        assert.equal(controller.isChatWaiting.value, false);
        assert.equal(controller.chatInput.value, '先等等');
        gate.resolve(modelResult(juvenileChatJson('迟到的回答')));
        await send;
        assert.equal(await tavernPetJournalTable.count(), 0);
    } finally {
        gate.resolve(modelResult(juvenileChatJson()));
        scope.stop();
    }
});

test('background evolution never presents as a pet reply or blocks the chat composer', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller silent evolution');
    await seedTavernPetForTest(session.id, createPendingAdultState(session.id));
    const gate = deferred<TavernRunOnceResult>();
    let modelCalls = 0;
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async () => {
            modelCalls += 1;
            return await gate.promise;
        },
    });
    try {
        await controller.preparePet();
        await waitUntil(() => modelCalls === 1);
        controller.chatInput.value = '你现在是什么样子';
        assert.equal(controller.isChatWaiting.value, false);
        assert.equal(controller.chatBlockedReason.value, '');
        assert.equal(controller.canSubmitChat.value, true);
    } finally {
        gate.resolve(modelResult(canonicalTavernPetStaticVerdict('blank')));
        scope.stop();
    }
});

test('a cancelled background evolution is rescheduled after the cancelling action settles', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller resumes cancelled evolution');
    await seedTavernPetForTest(session.id, createPendingAdultState(session.id, 'resume-evolution'));
    const firstRequest = deferred<TavernRunOnceResult>();
    let modelCalls = 0;
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async () => {
            modelCalls += 1;
            if (modelCalls === 1) {return await firstRequest.promise;}
            return modelResult(canonicalTavernPetStaticVerdict('blank'));
        },
    });
    try {
        await controller.preparePet();
        await waitUntil(() => modelCalls === 1);
        assert.ok(await controller.performAction('feed'));
        firstRequest.resolve(modelResult(canonicalTavernPetStaticVerdict('blank')));
        await waitUntil(() => modelCalls === 2, 'cancelled_evolution_was_not_rescheduled');
        await waitUntil(() => controller.view.value.pendingEvolution === false, 'rescheduled_evolution_did_not_settle');
    } finally {
        firstRequest.resolve(modelResult(canonicalTavernPetStaticVerdict('blank')));
        scope.stop();
    }
});

test('chat captures a fresh phone boundary after model parsing, not before the request', async () => {
    await resetTavernPetTestDb();
    const session = await createTavernPetTestSession('Controller fresh boundary');
    await seedTavernPetForTest(session.id, createTavernPetTestState('juvenile'));
    const gate = deferred<TavernRunOnceResult>();
    const { controller, scope } = createController({
        selectedSessionId: ref(session.id),
        runModel: async () => await gate.promise,
    });
    try {
        await controller.preparePet();
        controller.chatInput.value = '你在吗';
        const send = controller.sendChat();
        await waitUntil(() => controller.isChatWaiting.value);
        controller.openNest();
        controller.closeNest();
        assert.equal(controller.nestOpen.value, false, 'model work does not trap the read-only drawer');
        await appendTavernMessage(session.id, { role: 'user', content: '另一个标签页刚推进了边界。' });
        gate.resolve(modelResult(juvenileChatJson('听见了。')));
        await send;
        assert.equal(controller.chatError.value, '');
        assert.equal((await getTavernPetPrivateSnapshotForChat(session.id))?.companion.state.chatMemory.recent.at(-1)?.petText, '听见了。');
    } finally {
        scope.stop();
    }
});

test('cross-session evolution resolution does not toast an event whose source belongs to A', async () => {
    await resetTavernPetTestDb();
    const a = await createTavernPetTestSession('Evolution source A');
    const b = await createTavernPetTestSession('Evolution observer B');
    await seedTavernPetForTest(a.id, createPendingAdultState(a.id));
    const toasts: string[] = [];
    const { controller, scope } = createController({
        selectedSessionId: ref(b.id),
        showToast: (message) => {toasts.push(message);},
        runModel: async () => modelResult(canonicalTavernPetStaticVerdict('blank')),
    });
    try {
        await controller.preparePet();
        await waitUntil(() => !controller.view.value.pendingEvolution, 'evolution_not_resolved');
        assert.deepEqual(toasts, []);
    } finally {
        scope.stop();
    }
});

test('route deactivation only clears local drawers and drafts', async () => {
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

test('wallet presentation reads the structured insufficient-funds reason instead of Chinese text', () => {
    const error = new TavernPetError('pet_interaction_unavailable', TAVERN_PET_INSUFFICIENT_FUNDS_REASON);
    assert.deepEqual(tavernPetUiError(error), { kind: 'wallet', message: '小白币不够。' });
});
