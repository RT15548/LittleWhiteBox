import { createDefaultFourthWallChatState, createDefaultFourthWallGlobalSettings } from '../domain/defaults.js';
import {
    addSession,
    appendMessage,
    clearSession,
    deleteMessage,
    deleteSession,
    editMessage,
    getActiveSession,
    prepareRegeneration,
    renameSession,
    switchSession,
    updateChatSettings,
    updateMemory,
} from '../domain/state.js';
import { estimateFourthWallContext } from '../domain/context-stats.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';
import { createFourthWallHistoryView } from './history-view.js';
import type { FourthWallContextService } from './context-service.js';
import { buildFourthWallCommentaryPrompt, buildFourthWallPrompt } from '../domain/prompt.js';
import { projectGenerationProgress, projectGenerationResult } from '../domain/response-projection.js';
import { createFourthWallCommentaryRuntime } from './commentary-runtime.js';
import { createFourthWallGenerationRuntime, type FourthWallGenerateResponse } from './generation-runtime.js';
import type {
    FourthWallCapturedCommentary,
    FourthWallChatSnapshot,
    FourthWallChatState,
    FourthWallClientState,
    FourthWallCommentaryKind,
    FourthWallGenerationResult,
    FourthWallGlobalSettings,
    FourthWallGlobalSettingsPatch,
    FourthWallPromptInput,
    FourthWallSession,
} from '../types.js';
import type { XiaobaiOsAppRuntime, XiaobaiOsChatIdentity } from '../../../types.js';
import type { FourthWallMutationOptions } from './repository.js';
import type { FourthWallImageProtocol } from './image-protocol.js';
import type { FourthWallVoiceProtocol } from './voice-protocol.js';

type UnknownRecord = Record<string, unknown>;

interface ControllerChatRepository {
    prepareCurrentChatFourthWall: () => Promise<FourthWallChatState>;
    readCurrentChatFourthWall: () => FourthWallChatState | null;
    mutateCurrentChatFourthWall: (
        action: (current: FourthWallChatState) => FourthWallChatState,
        options?: FourthWallMutationOptions,
    ) => Promise<FourthWallChatState>;
}

interface ControllerSettingsRepository {
    read: () => { apps: { fourthWall: FourthWallGlobalSettings } } | null;
    mutateFourthWall: (action: (current: FourthWallGlobalSettings) => FourthWallGlobalSettings) => Promise<unknown>;
}

interface CommentaryCaptured extends FourthWallCapturedCommentary {
    chatState: FourthWallChatState;
    sessionId: string;
    globalSettings: FourthWallGlobalSettings;
}

interface CommentaryDependencies {
    subscribe?: (handler: (event: { kind?: string }) => Promise<boolean>) => (() => void) | void;
    capture?: (event: { kind?: string }) => FourthWallCapturedCommentary | null;
    show?: (text: string) => void;
    hide?: () => void;
    random?: () => number;
    now?: () => number;
    setTimer?: (callback: () => void, milliseconds: number) => ReturnType<typeof setTimeout>;
    clearTimer?: (timer: ReturnType<typeof setTimeout>) => void;
    cooldownMs?: number;
}

interface ControllerDependencies {
    chatRepository: ControllerChatRepository;
    settingsRepository: ControllerSettingsRepository;
    getChatIdentity: () => XiaobaiOsChatIdentity | { key?: unknown } | string | null;
    getChatSnapshot: (maxLayers?: number) => FourthWallChatSnapshot | null;
    generateResponse: FourthWallGenerateResponse;
    contextService: FourthWallContextService;
    loadAgentConfig: () => unknown | Promise<unknown>;
    imageProtocol?: FourthWallImageProtocol;
    voiceProtocol?: FourthWallVoiceProtocol;
    commentary?: CommentaryDependencies | null;
    now?: () => number;
    createId?: () => string;
}

interface Activation {
    generation: number;
    chatIdentity: string;
    post?: (type: string, payload?: unknown, responseId?: string) => unknown;
}

interface GenerationRun {
    activationGeneration: number;
    chatIdentity: string;
    sessionId: string;
    requestId: string;
}

function identityKey(identity: ControllerDependencies['getChatIdentity'] extends () => infer T ? T : never): string {
    if (typeof identity === 'string') {
        return identity;
    }
    return String(identity?.key || '');
}

function createSessionId(): string {
    if (globalThis.crypto?.randomUUID) {
        return `session-${globalThis.crypto.randomUUID()}`;
    }
    return `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function describeError(error: unknown): string {
    return error instanceof Error ? error.message : String(error || 'unknown_error');
}

function isUnconfirmedSave(error: unknown): boolean {
    return (
        error !== null &&
        typeof error === 'object' &&
        (('code' in error && error.code === 'SAVE_UNCONFIRMED') || ('uncertain' in error && error.uncertain === true))
    );
}

function normalizeGlobalSettings(
    current: FourthWallGlobalSettings,
    patch: FourthWallGlobalSettingsPatch = {},
): FourthWallGlobalSettings {
    const next = structuredClone(current);
    if (patch.image) {
        next.image.enablePrompt = patch.image.enablePrompt === true;
    }
    if (patch.voice) {
        next.voice.enabled = patch.voice.enabled === true;
    }
    if (patch.commentary) {
        if (Object.hasOwn(patch.commentary, 'enabled')) {
            next.commentary.enabled = patch.commentary.enabled === true;
        }
        if (Object.hasOwn(patch.commentary, 'probability')) {
            const probability = Number(patch.commentary.probability);
            if (!Number.isInteger(probability) || probability < 1 || probability > 99) {
                throw new Error('吐槽概率必须是 1 到 99 的整数');
            }
            next.commentary.probability = probability;
        }
    }
    if (patch.promptTemplates) {
        const keys: Array<keyof FourthWallGlobalSettings['promptTemplates']> = [
            'topuser',
            'confirm',
            'metaProtocol',
            'bottom',
        ];
        for (const key of keys) {
            if (Object.hasOwn(patch.promptTemplates, key)) {
                next.promptTemplates[key] = String(patch.promptTemplates[key]);
            }
        }
    }
    return next;
}

function classifyGenerationError(error: unknown): 'configuration' | 'parse' | 'network' {
    const message = describeError(error);
    if (/api key|配置|provider|model/i.test(message)) {
        return 'configuration';
    }
    if (/parse|格式|<msg>/i.test(message)) {
        return 'parse';
    }
    return 'network';
}

export function createFourthWallController({
    chatRepository,
    settingsRepository,
    getChatIdentity,
    getChatSnapshot,
    generateResponse,
    contextService,
    loadAgentConfig,
    imageProtocol,
    voiceProtocol,
    commentary = null,
    now = Date.now,
    createId = createSessionId,
}: ControllerDependencies): XiaobaiOsAppRuntime & {
    activate: NonNullable<XiaobaiOsAppRuntime['activate']>;
    handleMessage: NonNullable<XiaobaiOsAppRuntime['handleMessage']>;
} {
    if (
        !chatRepository ||
        !settingsRepository ||
        typeof getChatIdentity !== 'function' ||
        typeof getChatSnapshot !== 'function' ||
        typeof generateResponse !== 'function' ||
        !contextService ||
        typeof loadAgentConfig !== 'function'
    ) {
        throw new TypeError('fourth-wall controller dependencies are incomplete');
    }

    let activation: Activation | null = null;
    let activationGeneration = 0;

    const generationRuntime = createFourthWallGenerationRuntime({ generateResponse, loadAgentConfig });
    const historyView = createFourthWallHistoryView();

    function readChatState(): FourthWallChatState {
        return chatRepository.readCurrentChatFourthWall() || createDefaultFourthWallChatState(now());
    }

    function getGlobalSettings(): FourthWallGlobalSettings {
        const root = settingsRepository.read();
        if (!root) {
            throw new Error('小白 OS 设置尚未准备');
        }
        return root.apps.fourthWall;
    }

    function buildClientState(chatState: FourthWallChatState): FourthWallClientState {
        const snapshot = getChatSnapshot(chatState.settings.maxChatLayers);
        const session = getActiveSession(chatState)!;
        const input = promptInput(chatState, session, '', snapshot);
        return {
            chatIdentity: snapshot?.chatIdentity || identityKey(getChatIdentity()),
            userName: String(snapshot?.userName || 'User'),
            characterName: String(snapshot?.characterName || 'Assistant'),
            userAvatar: String(snapshot?.userAvatar || ''),
            characterAvatar: String(snapshot?.characterAvatar || ''),
            chat: {
                settings: { ...chatState.settings },
                activeSessionId: chatState.activeSessionId,
                sessions: chatState.sessions.map(({ history, memory, ...info }) => ({
                    ...info, messageCount: history.length, hasMemory: !!memory,
                })),
            },
            history: historyView.project(chatState),
            context: estimateFourthWallContext(buildFourthWallPrompt(input), input, session),
            global: structuredClone(getGlobalSettings()),
            capabilities: {
                image: imageProtocol?.getCapabilities?.() || { available: false },
                voice: voiceProtocol?.getCapabilities?.() || { available: false },
            },
        };
    }

    function promptInput(
        state: FourthWallChatState, session: FourthWallSession, userInput: string,
        snapshot = getChatSnapshot(state.settings.maxChatLayers),
    ): FourthWallPromptInput {
        return {
            userInput, history: session.history.slice(session.archivedCount), memory: session.memory,
            chatSnapshot: snapshot, settings: state.settings, globalSettings: getGlobalSettings(),
        };
    }

    async function commitMemory(
        source: FourthWallChatState, session: FourthWallSession, memory: string, archivedCount: number,
        signal: AbortSignal, isCurrent: () => boolean,
    ): Promise<void> {
        const next = await chatRepository.mutateCurrentChatFourthWall(state => {
            const current = getActiveSession(state);
            if (!isCurrent() || signal.aborted || state.activeSessionId !== session.id
                || !jsonValuesEqual(current, session) || !jsonValuesEqual(state.settings, source.settings)) {
                throw new Error('总结期间聊天已变化，结果未保存，请重试');
            }
            current!.memory = memory;
            current!.archivedCount = archivedCount;
            return state;
        }, { beforeCommit() {
            if (signal.aborted || !isCurrent()) { throw new Error('summary_result_invalidated'); }
        } });
        if (!signal.aborted && isCurrent() && activation) { emitState(next); }
    }

    function assertActivation(payload: UnknownRecord = {}, expectedSession = false): Activation {
        if (!activation) {
            throw new Error('四次元壁 APP 未激活');
        }
        const currentIdentity = identityKey(getChatIdentity());
        if (
            !currentIdentity ||
            currentIdentity !== activation.chatIdentity ||
            String(payload.chatIdentity || '') !== activation.chatIdentity
        ) {
            throw new Error('聊天已切换，请重新打开四次元壁');
        }
        if (expectedSession && !String(payload.sessionId || '')) {
            throw new Error('四次元壁记录标识缺失');
        }
        if (expectedSession && readChatState().activeSessionId !== payload.sessionId) {
            throw new Error('皮下会话已切换，请重试');
        }
        return activation;
    }

    function assertSameActivation(
        expected: Activation,
        payload: UnknownRecord = {},
        expectedSession = false,
    ): Activation {
        const current = assertActivation(payload, expectedSession);
        if (current !== expected) {
            throw new Error('四次元壁页面已切换，请重试');
        }
        return current;
    }

    function post(type: string, payload: unknown = {}): void {
        activation?.post?.(type, payload);
    }

    function emitState(chatState: FourthWallChatState): FourthWallClientState {
        const state = buildClientState(chatState);
        post('fourth-wall/state', { state });
        return state;
    }

    function isRunCurrent(run: GenerationRun): boolean {
        return (
            !!activation &&
            activation.generation === run.activationGeneration &&
            activation.chatIdentity === run.chatIdentity &&
            identityKey(getChatIdentity()) === run.chatIdentity
        );
    }

    function launchGeneration({
        chatState,
        sessionId,
        userInput,
        requestId,
        manual = false,
        initialize,
        inputDraft,
    }: {
        chatState: FourthWallChatState;
        sessionId: string;
        userInput: string;
        requestId: string;
        manual?: boolean;
        initialize?: (signal: AbortSignal) => Promise<{ state: FourthWallChatState; userInput: string }>;
        inputDraft?: string;
    }): void {
        let session = chatState.sessions.find((item) => item.id === sessionId);
        if (!session) {
            throw new Error('四次元壁记录不存在');
        }
        const currentActivation = activation;
        if (!currentActivation) {
            throw new Error('四次元壁 APP 未激活');
        }
        const run: GenerationRun = {
            activationGeneration: currentActivation.generation,
            chatIdentity: currentActivation.chatIdentity,
            sessionId,
            requestId,
        };
        let input = promptInput(chatState, session, userInput);
        const buildPrompt = (current: FourthWallSession) => buildFourthWallPrompt({
            ...input, memory: current.memory, history: current.history.slice(current.archivedCount),
        });
        const builtPrompt = buildPrompt(session);
        let expectedSession = session;
        let taskSignal: AbortSignal | null = null;
        let inputSaved = !initialize;
        let inputSaveUnconfirmed = false;
        function recoverInput(): { inputDraft?: string; message?: string } {
            if (inputSaved || !inputDraft) { return {}; }
            return inputSaveUnconfirmed
                ? { message: `输入保存结果未确认，请核对聊天记录后再发送。原输入：${inputDraft}` }
                : { inputDraft };
        }
        post('fourth-wall/generation', { requestId, status: 'started', sessionId, manual, phase: initialize ? 'saving' : 'counting' });
        generationRuntime.start({
            requestId,
            builtPrompt,
            stream: chatState.settings.stream,
            disableAssistantPrefill: chatState.settings.disableAssistantPrefill,
            prepareOnly: manual,
            async initialize(signal) {
                taskSignal = signal;
                if (!initialize) { return; }
                let initialized;
                try { initialized = await initialize(signal); }
                catch (error) { inputSaveUnconfirmed = isUnconfirmedSave(error); throw error; }
                inputSaved = true;
                chatState = initialized.state;
                userInput = initialized.userInput;
                session = chatState.sessions.find(item => item.id === sessionId)!;
                expectedSession = session;
                input = promptInput(chatState, session, userInput);
                if (isRunCurrent(run)) { emitState(chatState); }
            },
            async prepare(config, signal) {
                taskSignal = signal;
                const prepared = await contextService.prepare({
                    session: session!, buildPrompt, config, signal, manual,
                    disableAssistantPrefill: chatState.settings.disableAssistantPrefill,
                    onPhase(phase) {
                        if (isRunCurrent(run)) { post('fourth-wall/generation', { requestId, sessionId, status: 'started', manual, phase }); }
                    },
                    async commit(memory, archivedCount) {
                        await commitMemory(chatState, session!, memory, archivedCount, signal, () => isRunCurrent(run));
                        expectedSession = { ...session!, memory, archivedCount };
                    },
                });
                if (!isRunCurrent(run)) { throw new DOMException('已取消', 'AbortError'); }
                if (!manual) { post('fourth-wall/generation', { requestId, sessionId, status: 'started', phase: 'replying' }); }
                return prepared;
            },
            onProgress(result: FourthWallGenerationResult) {
                if (!isRunCurrent(run)) {
                    return;
                }
                post('fourth-wall/generation', {
                    requestId,
                    sessionId,
                    status: 'progress',
                    ...projectGenerationProgress(result),
                });
            },
            async onComplete(result: FourthWallGenerationResult) {
                if (!isRunCurrent(run)) {
                    return;
                }
                if (manual) {
                    post('fourth-wall/generation', { requestId, sessionId, status: 'complete', manual: true });
                    return;
                }
                const projected = projectGenerationResult(result);
                try {
                    const next = await chatRepository.mutateCurrentChatFourthWall(
                        (state) => {
                            if (state.activeSessionId !== sessionId || !jsonValuesEqual(getActiveSession(state), expectedSession)
                                || !jsonValuesEqual(state.settings, chatState.settings)) {
                                throw new Error('记录已切换，回复未保存');
                            }
                            return appendMessage(state, sessionId, {
                                role: 'ai',
                                content: projected.text,
                                thinking: projected.thinking || undefined,
                                ts: now(),
                            });
                        },
                        {
                            beforeCommit() {
                                if (!isRunCurrent(run) || taskSignal?.aborted) {
                                    throw new Error('generation_result_invalidated');
                                }
                            },
                        },
                    );
                    if (!isRunCurrent(run)) {
                        return;
                    }
                    emitState(next);
                    post('fourth-wall/generation', {
                        requestId,
                        sessionId,
                        status: 'complete',
                        ...projected,
                    });
                } catch (error) {
                    if (!isRunCurrent(run)) {
                        return;
                    }
                    const unconfirmed = isUnconfirmedSave(error);
                    if (unconfirmed) {
                        const retained = chatRepository.readCurrentChatFourthWall();
                        if (retained) {
                            emitState(retained);
                        }
                    }
                    post('fourth-wall/generation', {
                        requestId,
                        sessionId,
                        status: 'error',
                        kind: 'save',
                        message: unconfirmed
                            ? `回复已生成，但保存结果未确认：${describeError(error)}`
                            : `回复已生成，但未保存：${describeError(error)}`,
                        draft: unconfirmed ? undefined : projected,
                    });
                }
            },
            onError(error: unknown) {
                if (!isRunCurrent(run)) {
                    return;
                }
                post('fourth-wall/generation', {
                    requestId,
                    sessionId,
                    status: 'error',
                    kind: !inputSaved ? 'input-save' : classifyGenerationError(error),
                    message: describeError(error),
                    ...recoverInput(),
                    manual,
                });
            },
            onCancelled() {
                if (!isRunCurrent(run)) {
                    return;
                }
                post('fourth-wall/generation', { requestId, sessionId, status: 'cancelled', ...recoverInput() });
            },
        });
    }

    const commentaryRuntime = commentary
        ? createFourthWallCommentaryRuntime({
              ...commentary,
              getSettings: () => {
                  try {
                      return getGlobalSettings().commentary;
                  } catch {
                      return { enabled: false, probability: 30 };
                  }
              },
              isForegroundActive: () => activation !== null,
              async capture(event: { kind?: string }): Promise<CommentaryCaptured | null> {
                  const host = commentary.capture?.(event);
                  if (!host) {
                      return null;
                  }
                  let chatState;
                  try {
                      chatState =
                          chatRepository.readCurrentChatFourthWall() ||
                          (await chatRepository.prepareCurrentChatFourthWall());
                  } catch {
                      return null;
                  }
                  if (!chatState || identityKey(getChatIdentity()) !== host.chatIdentity) {
                      return null;
                  }
                  const session = getActiveSession(chatState);
                  if (!session) {
                      return null;
                  }
                  return {
                      ...host,
                      chatState,
                      sessionId: session.id,
                      globalSettings: structuredClone(getGlobalSettings()),
                  };
              },
              async generate(captured: CommentaryCaptured, signal: AbortSignal): Promise<string> {
                  const source = captured.chatState;
                  const session = source.sessions.find(item => item.id === captured.sessionId)!;
                  const input = promptInput(source, session, '', getChatSnapshot(source.settings.maxChatLayers));
                  const buildPrompt = (current: FourthWallSession) => buildFourthWallCommentaryPrompt({
                      ...input, globalSettings: captured.globalSettings,
                      memory: current.memory, history: current.history.slice(current.archivedCount),
                      targetText: captured.text, type: captured.kind,
                  })!;
                  const config = await loadAgentConfig();
                  const builtPrompt = await contextService.prepare({
                      session, buildPrompt, config, signal,
                      disableAssistantPrefill: source.settings.disableAssistantPrefill,
                      async commit(memory, archivedCount) {
                          await commitMemory(source, session, memory, archivedCount, signal,
                              () => !activation && identityKey(getChatIdentity()) === captured.chatIdentity);
                          captured.chatState = { ...source, sessions: source.sessions.map(item => item.id === session.id
                              ? { ...item, memory, archivedCount } : item) };
                      },
                  });
                  const result = await generateResponse({
                      config,
                      builtPrompt,
                      stream: false,
                      disableAssistantPrefill: captured.chatState.settings.disableAssistantPrefill,
                      signal,
                  });
                  return projectGenerationResult(result).text;
              },
              async commit(captured: CommentaryCaptured, text: string, signal: AbortSignal): Promise<void> {
                  if (identityKey(getChatIdentity()) !== captured.chatIdentity) {
                      throw new Error('聊天已切换');
                  }
                  const prefixes: Record<FourthWallCommentaryKind, string> = {
                      ai_message: '(glanced at the last line) ',
                      edit_own: '(caught you sneaking edits) ',
                      edit_ai: '(noticed you edited my line) ',
                  };
                  await chatRepository.mutateCurrentChatFourthWall(
                      (state) => {
                          if (state.activeSessionId !== captured.sessionId || !jsonValuesEqual(getActiveSession(state),
                              captured.chatState.sessions.find(item => item.id === captured.sessionId))) {
                              throw new Error('吐槽期间聊天已变化，结果未保存');
                          }
                          return appendMessage(state, captured.sessionId, {
                          role: 'ai',
                          content: `${prefixes[captured.kind]}${text}`,
                          ts: now(),
                          type: 'commentary',
                          });
                      },
                      {
                          beforeCommit() {
                              if (signal.aborted || identityKey(getChatIdentity()) !== captured.chatIdentity) {
                                  throw new Error('commentary_result_invalidated');
                              }
                          },
                      },
                  );
              },
          })
        : null;

    async function activate(
        { post: postToFrame }: { post?: Activation['post'] } = {},
    ): Promise<FourthWallClientState> {
        cancelForeground('reactivated');
        commentaryRuntime?.cancel();
        historyView.reset();
        const identity = getChatIdentity();
        const chatIdentity = identityKey(identity);
        if (!chatIdentity) {
            throw new Error('请先打开一个聊天');
        }
        const generation = ++activationGeneration;
        const chatState = await chatRepository.prepareCurrentChatFourthWall();
        if (identityKey(getChatIdentity()) !== chatIdentity || generation !== activationGeneration) {
            throw new Error('聊天已切换，请重新打开四次元壁');
        }
        const clientState = buildClientState(chatState);
        activation = { generation, chatIdentity, post: postToFrame };
        commentaryRuntime?.cancel();
        return clientState;
    }

    function deactivate(reason = 'deactivated'): void {
        cancelForeground(reason);
    }

    async function mutateBoundChat(
        current: Activation,
        payload: UnknownRecord,
        action: (state: FourthWallChatState) => FourthWallChatState,
        signal?: AbortSignal,
    ): Promise<FourthWallChatState> {
        let next: FourthWallChatState;
        try {
            const guard = () => {
                assertSameActivation(current, payload, true);
                if (signal?.aborted) { throw new DOMException('已取消', 'AbortError'); }
            };
            next = await chatRepository.mutateCurrentChatFourthWall(state => {
                guard();
                if (state.activeSessionId !== payload.sessionId) { throw new Error('皮下会话已切换，请重试'); }
                return action(state);
            }, { beforeCommit: guard });
        } catch (error) {
            if (isUnconfirmedSave(error)) {
                assertSameActivation(current, payload);
                const retained = chatRepository.readCurrentChatFourthWall();
                if (retained) {
                    emitState(retained);
                }
            }
            throw error;
        }
        assertSameActivation(current, payload);
        return next;
    }

    async function mutateChat(
        payload: UnknownRecord,
        action: (state: FourthWallChatState) => FourthWallChatState,
    ): Promise<FourthWallClientState> {
        const current = assertActivation(payload, true);
        generationRuntime.cancel('data-changed');
        const next = await mutateBoundChat(current, payload, action);
        return emitState(next);
    }

    async function mutateGlobalSettings(
        current: Activation,
        payload: UnknownRecord,
        action: (settings: FourthWallGlobalSettings) => FourthWallGlobalSettings,
    ): Promise<void> {
        try {
            await settingsRepository.mutateFourthWall(action);
        } catch (error) {
            if (isUnconfirmedSave(error)) {
                assertSameActivation(current, payload);
                const retained = chatRepository.readCurrentChatFourthWall();
                if (retained) {
                    emitState(retained);
                }
            }
            throw error;
        }
    }

    async function handleMessage(
        message: { type: string; requestId?: string; payload?: unknown },
    ): Promise<unknown> {
        const payload =
            message.payload && typeof message.payload === 'object' && !Array.isArray(message.payload)
                ? (message.payload as UnknownRecord)
                : {};
        const action = message.type.slice('fourth-wall/'.length);

        if (action === 'cancel') {
            assertActivation(payload);
            return { cancelled: generationRuntime.cancel('user-cancelled') };
        }
        if (action === 'refresh') {
            assertActivation(payload);
            return emitState(readChatState());
        }
        if (action === 'history-page') {
            assertActivation(payload, true);
            return historyView.page(readChatState(), payload.direction, payload.revision);
        }
        if (action === 'read-memory') {
            assertActivation(payload, true);
            historyView.assertRevision(payload.revision);
            return { content: getActiveSession(readChatState())!.memory };
        }
        if (action === 'save-memory') {
            assertActivation(payload, true);
            historyView.assertRevision(payload.revision);
            if (typeof payload.content !== 'string') { throw new Error('记忆必须是文本'); }
            if (typeof payload.expectedContent !== 'string') { throw new Error('请重新打开记忆面板后保存'); }
            return await mutateChat(payload, state => {
                if (getActiveSession(state)?.memory !== payload.expectedContent) { throw new Error('记忆已变化，请重新打开后编辑'); }
                return updateMemory(state, String(payload.sessionId), String(payload.content));
            });
        }
        if (action === 'summarize' || action === 'retry') {
            assertActivation(payload, true);
            if (generationRuntime.isRunning()) { throw new Error('已有任务正在进行'); }
            const state = readChatState();
            const session = getActiveSession(state)!;
            let userIndex = session.history.length - 1;
            while (userIndex >= 0 && session.history[userIndex].role !== 'user') { userIndex--; }
            const lastUser = session.history[userIndex];
            if (action === 'retry' && (!lastUser || session.history.slice(userIndex + 1)
                .some(item => item.role === 'ai' && item.type !== 'commentary'))) {
                throw new Error('没有待回答的用户消息');
            }
            launchGeneration({ chatState: state, sessionId: session.id,
                userInput: action === 'retry' ? lastUser!.content : '',
                requestId: String(message.requestId || ''), manual: action === 'summarize' });
            return { accepted: true };
        }
        if (action === 'update-chat-settings') {
            const patch =
                payload.patch && typeof payload.patch === 'object' && !Array.isArray(payload.patch)
                    ? (payload.patch as Partial<FourthWallChatState['settings']>)
                    : {};
            return await mutateChat(payload, (state) => updateChatSettings(state, patch));
        }
        if (action === 'switch-session') {
            generationRuntime.cancel('session-switched');
            return await mutateChat(payload, (state) => switchSession(state, String(payload.targetSessionId || '')));
        }
        if (action === 'add-session') {
            generationRuntime.cancel('session-created');
            return await mutateChat(payload, (state) =>
                addSession(state, {
                    id: createId(),
                    name: payload.name,
                    createdAt: now(),
                }),
            );
        }
        if (action === 'rename-session') {
            return await mutateChat(payload, (state) =>
                renameSession(state, String(payload.sessionId || ''), payload.name),
            );
        }
        if (action === 'delete-session') {
            generationRuntime.cancel('session-deleted');
            return await mutateChat(payload, (state) => deleteSession(state, String(payload.sessionId || '')));
        }
        if (action === 'edit-message') {
            assertActivation(payload, true);
            historyView.assertRevision(payload.revision);
            return await mutateChat(payload, (state) => {
                historyView.assertMessage(state, Number(payload.messageIndex), payload.revision);
                return editMessage(state, String(payload.sessionId || ''), Number(payload.messageIndex), payload.content);
            });
        }
        if (action === 'delete-message') {
            assertActivation(payload, true);
            historyView.assertRevision(payload.revision);
            return await mutateChat(payload, (state) => {
                historyView.assertMessage(state, Number(payload.messageIndex), payload.revision);
                return deleteMessage(state, String(payload.sessionId || ''), Number(payload.messageIndex));
            });
        }
        if (action === 'clear-history') {
            generationRuntime.cancel('history-cleared');
            return await mutateChat(payload, (state) => clearSession(state, String(payload.sessionId || ''), payload.clearMemory === true));
        }
        if (action === 'send') {
            const current = assertActivation(payload, true);
            if (generationRuntime.isRunning()) {
                throw new Error('已有回复正在生成');
            }
            const userInput = String(payload.content || '').trim();
            if (!userInput) { throw new Error('请输入消息'); }
            const sessionId = String(payload.sessionId || '');
            const source = readChatState();
            launchGeneration({
                chatState: source,
                sessionId,
                userInput,
                inputDraft: userInput,
                requestId: String(message.requestId || ''),
                async initialize(signal) {
                    const state = await mutateBoundChat(current, payload, state => {
                        if (!jsonValuesEqual(state.settings, source.settings)) { throw new Error('上下文设置已变化，请刷新后重试'); }
                        return appendMessage(state, sessionId, { role: 'user', content: userInput, ts: now() });
                    }, signal);
                    return { state, userInput };
                },
            });
            return { accepted: true };
        }
        if (action === 'regenerate') {
            const current = assertActivation(payload, true);
            if (generationRuntime.isRunning()) { throw new Error('已有任务正在进行'); }
            const sessionId = String(payload.sessionId || '');
            const source = readChatState();
            launchGeneration({
                chatState: source,
                sessionId,
                userInput: '',
                requestId: String(message.requestId || ''),
                async initialize(signal) {
                    let userInput = '';
                    const state = await mutateBoundChat(current, payload, state => {
                        if (!jsonValuesEqual(state.settings, source.settings)) { throw new Error('上下文设置已变化，请刷新后重试'); }
                        const prepared = prepareRegeneration(state, sessionId);
                        userInput = prepared.userInput;
                        return prepared.state;
                    }, signal);
                    return { state, userInput };
                },
            });
            return { accepted: true };
        }
        if (action === 'update-global-settings') {
            const current = assertActivation(payload);
            generationRuntime.cancel('settings-changed');
            const patch =
                payload.patch && typeof payload.patch === 'object' && !Array.isArray(payload.patch)
                    ? (payload.patch as FourthWallGlobalSettingsPatch)
                    : {};
            await mutateGlobalSettings(current, payload, (settings) => normalizeGlobalSettings(settings, patch));
            commentaryRuntime?.sync();
            assertSameActivation(current, payload);
            return emitState(readChatState());
        }
        if (action === 'restore-prompts') {
            const current = assertActivation(payload);
            generationRuntime.cancel('settings-changed');
            const defaults = createDefaultFourthWallGlobalSettings();
            await mutateGlobalSettings(current, payload, (settings) => ({
                ...settings,
                promptTemplates: defaults.promptTemplates,
            }));
            assertSameActivation(current, payload);
            return emitState(readChatState());
        }
        if (action === 'image-check') {
            assertActivation(payload, true);
            if (!imageProtocol) {
                throw new Error('画图能力不可用');
            }
            return await imageProtocol.check({ tags: payload.tags });
        }
        if (action === 'image-generate') {
            const current = assertActivation(payload, true);
            if (!imageProtocol) {
                throw new Error('画图能力不可用');
            }
            return await imageProtocol.generate({
                requestId: payload.mediaRequestId,
                tags: payload.tags,
                onProgress(progress) {
                    if (activation === current) {
                        post('fourth-wall/image-progress', { mediaRequestId: payload.mediaRequestId, ...progress });
                    }
                },
            });
        }
        if (action === 'image-cancel') {
            assertActivation(payload);
            if (!imageProtocol) {
                return { cancelled: false };
            }
            return { cancelled: imageProtocol.cancel(payload.mediaRequestId) };
        }
        if (action === 'voice-play') {
            const current = assertActivation(payload, true);
            if (!voiceProtocol) {
                throw new Error('TTS 能力不可用');
            }
            return voiceProtocol.play({
                requestId: payload.mediaRequestId,
                text: payload.text,
                emotion: payload.emotion,
                onState(state) {
                    if (activation === current) {
                        post('fourth-wall/voice-state', state);
                    }
                },
            });
        }
        if (action === 'voice-stop') {
            assertActivation(payload);
            if (!voiceProtocol) {
                return { stopped: false };
            }
            return { stopped: voiceProtocol.stop(String(payload.mediaRequestId || '')) };
        }
        throw new Error('unsupported_fourth_wall_action');
    }

    function cancelForeground(reason: string): void {
        activationGeneration += 1;
        activation = null;
        generationRuntime.cancel(reason);
        imageProtocol?.cancelAll?.();
        voiceProtocol?.cancelAll?.();
    }

    return Object.freeze({
        activate,
        deactivate,
        handleMessage,
        cancelForeground,
        cancelAll(reason: string) {
            cancelForeground(reason);
            commentaryRuntime?.cancel();
        },
        handleWindowOpened() {
            commentaryRuntime?.cancel();
        },
        handleChatChanged() {
            commentaryRuntime?.cancel();
        },
        startBackground() {
            commentaryRuntime?.start();
        },
        stopBackground() {
            commentaryRuntime?.stop();
        },
    });
}
