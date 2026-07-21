import test from 'node:test';
import assert from 'node:assert/strict';
import { ref } from 'vue';

import {
    createTavernChatRunState,
    useTavernChatRunController,
    type TavernChatRunControllerOptions,
} from '../app-src/features/chat-run/useTavernChatRunController';

test('chat run releases its lifecycle when async window reset fails', async () => {
    const state = createTavernChatRunState();
    state.currentUserMessage.value = '继续。';
    let resetCalls = 0;
    const toasts: string[] = [];
    const options = {
        state,
        activeAssistantPreset: ref({}),
        activeSession: ref(null),
        agentConfig: ref({}),
        chatComposeTextareaRef: ref(null),
        diagnostics: ref({}),
        historyMode: ref('raw'),
        selectedSessionCharacterError: ref(''),
        selectedSessionId: ref('session-1'),
        async applyRegex(items: Array<{ id: string; text: string }>) {
            return { items: items.map((item) => ({ ...item, changed: false })), changedCount: 0 };
        },
        async applySubstituteParams(items: Array<{ id: string; text: string }>) {
            return { items: items.map((item) => ({ ...item, changed: false })), changedCount: 0 };
        },
        async buildNativeChatPrompt() {return { messages: [] as Array<Record<string, unknown>> };},
        clearRuntimeDisplayRegexRequests() {},
        compactLoadedSessionMessageWindow() {return 0;},
        async createSessionFromContext() {},
        describeError(error: unknown) {return error instanceof Error ? error.message : String(error);},
        async getNativeWorldInfoRuntime() {return { timedState: { sticky: {}, cooldown: {} } };},
        async loadSelectedSessionMessageWindow() {},
        async persistSelectedSessionId() {},
        async prepareAssistantMessageDisplay() {},
        pruneLoadedSessionMessagesFromOrder() {return 0;},
        async onManagerRunSaved() {},
        onManagerProgress() {},
        async refreshRuntimeChatPresetFromHost() {
            return { id: 'preset', name: 'Preset', sections: [] as Array<Record<string, unknown>> };
        },
        async refreshSessionRecord() {},
        preserveDetachedChatScroll<T>(mutation: () => T) {return mutation();},
        requestUserMessageBottom() {},
        async resetChatMessageWindowForUserTurn() {
            resetCalls += 1;
            throw new Error('window_reset_failed');
        },
        resetTextareaHeight() {},
        async resolveRuntimeContextForSession() {return { character: { name: 'Aster' } };},
        async resolveSlashCommandMessageText(text: string) {return text;},
        setSelectedSessionId() {},
        showToast(message: string) {toasts.push(message);},
        thoughtBlocks(): Array<Record<string, unknown>> {return [];},
        touchSessionLocally() {},
        updateChatScrollButtons() {},
        upsertLoadedSessionMessage() {},
        cancelDrawJobsForMessageRange() {},
    } as unknown as TavernChatRunControllerOptions;
    const controller = useTavernChatRunController(options);

    await controller.runOnce();
    assert.equal(state.isRunning.value, false);
    assert.equal(state.isCancellingRun.value, false);
    assert.equal(state.runtimeError.value, 'window_reset_failed');
    assert.deepEqual(toasts, ['window_reset_failed']);

    await controller.runOnce();
    assert.equal(resetCalls, 2);
    assert.equal(state.isRunning.value, false);
});
