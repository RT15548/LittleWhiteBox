import { createAgentAdapter } from '../../../agent-core/provider-config.js';
import {
    buildProviderAssistantToolCallMessage,
    buildProviderToolResultMessage,
    hasVisibleText,
    resolveResultToolCalls,
} from '../../../agent-core/runtime/protocol.js';
import {
    createXbTavernBuildSnapshot,
    type XbTavernBuildSnapshot,
    type XbTavernContext,
    type XbTavernMemoryContext,
    type XbTavernMessage,
    type XbTavernMessageBuildResult,
    type XbTavernMessageLayer,
    type XbTavernNativeWorldInfoRuntime,
    type XbTavernNativeWorldInfoTimedState,
    type XbTavernHistoryMessage,
    type ActivatedWorldEntry,
    type TavernChatPromptPresetBundle,
    type XbTavernRuntimeState,
    XBTavernWorldPosition,
    normalizeRole,
} from '../../shared/message-assembler';
import type { TavernAssistantPreset } from '../../shared/assistant-presets';
import {
    hasTavernSessionContractOverride,
    mergeTavernSessionContract,
    normalizeTavernSessionContract,
    resolveTavernSessionContractRuntime,
    type TavernSessionContract,
    type TavernSessionContractRuntime,
} from '../../shared/session-contract';
import {
    appendTavernUserMessageAndConfirmManagerCandidate,
    commitTavernAssistantResponseForLatestUser,
    commitTavernLatestAssistantReroll,
    createTavernSession,
    getAcceptedTurnManagerQueueState,
    getTavernSession,
    listLatestTavernUserMessagesBefore,
    mergeWorldEntryStates,
    createTavernTurnStateSnapshot,
    normalizeTavernSessionState,
    prepareTavernLatestAssistantReroll,
    updateTavernMessage,
    updateTavernSessionSnapshot,
    type TavernManagerRunRecord,
    type TavernMessageRecord,
    type TavernSessionRecord,
    type TavernSessionState,
} from '../../shared/session-db';
import {
    completeAcceptedTurnManagerRunWithSnapshot,
    resolveTavernAcceptedStateSnapshotDomains,
    saveAcceptedStateSnapshot,
} from '../../shared/accepted-state';
import {
    listTavernCommunicationTimelineEvents,
    type TavernCommunicationTimelineEvent,
} from '../../shared/communications';
import { buildXbTavernBrainAsync } from '../../shared/brain';
import {
    ACTION_CHECK_TOOL_NAME,
    buildActionCheckProtocolMessage,
    buildDeniedActionCheckToolResult,
    executeTavernActionCheck,
    getActionCheckToolDefinitions,
    type TavernActionCheckToolResult,
} from '../../shared/action-checks';
import {
    buildChanceEncounterPromptMessage,
    createActionCheckEvent,
    createChanceEncounterEvent,
    extractActionCheckRegexMarkers,
    getActionCheckEvents,
    getChanceEncounterEvent,
    hasChanceEncounterEvent,
    injectActionCheckRegexMarkers,
    RANDOM_ENCOUNTER_COOLDOWN_TURNS,
    RANDOM_ENCOUNTER_PROBABILITY,
    type TavernActionCheckRuntimeEvent,
    type TavernChanceEncounterRuntimeEvent,
    type TavernRuntimeEvent,
} from '../../shared/runtime-events';
import {
    countRegexApplications,
    hasRegexApplications,
    type TavernApplyRegex,
    type TavernApplyRegexItem,
    type TavernAppliedRegexItem,
    type TavernRegexApplicationSummary,
} from '../../shared/regex';
import type {
    TavernApplySubstituteParams,
    TavernSubstituteParamsItem,
    TavernSubstituteParamsOptions,
    TavernSubstitutedParamsItem,
} from '../../shared/substitute-params';
import {
    buildXbTavernMemoryIgnoredTerms,
    buildXbTavernMemoryQuery,
    retrieveXbTavernMemoryContext,
} from '../../shared/memory-retrieval';
import { getTavernStatusDocumentForSession, type TavernStatusDocument } from '../../shared/status-state';
import { buildTavernStatusPanelYaml } from '../../shared/status-prompt';
import { hasMaintainableTavernTasksAtAnchor } from '../../shared/tasks/task-service';
import { createXbTavernAgentRuntime } from './agent-runtime';
import {
    failAndRollbackAcceptedTurnManagerRun,
    recoverInterruptedAcceptedTurnManagerRuns,
    resolveTavernManagerFailureStatus,
    runNextQueuedAcceptedTurnManager,
    type TavernManagerLiveProgress,
    type XbTavernManagerOnceOptions,
    type XbTavernManagerOnceResult,
} from './manager';
import {
    assertXbTavernProviderReady,
    resolveXbTavernProviderConfig,
    type XbTavernProviderRole,
    type XbTavernResolvedProvider,
} from './provider';
import {
    applyTavernToolLoopRequestPlan,
    buildGoogleSessionToolLoopSendPayload,
    resolveTavernToolLoopRequestPlan,
    type TavernToolLoopResponse,
} from './tool-loop-request';
import {
    loadTavernPromptHistoryWindow,
    stripTavernImageMarkers,
} from './prompt-history-window';
import { buildTavernStoryTaskDepthEntries } from './task-context';
import {
    buildTavernShopRuntimeDepthEntries,
    placeTavernShopPromptBlockBeforeCurrentUser,
} from '../../shared/shop/shop-prompt';

export {
    loadTavernPromptHistoryWindow,
    resolveTavernContextWindow,
    TAVERN_CONTEXT_WINDOW_MAX,
    TAVERN_CONTEXT_WINDOW_MIN_SAFE,
    TAVERN_CONTEXT_WINDOW_RETAIN,
} from './prompt-history-window';

const MAX_ACTION_CHECK_ROUNDS = 8;

function isRandomEncounterCooldownActive(messages: TavernMessageRecord[] = []): boolean {
    if (RANDOM_ENCOUNTER_COOLDOWN_TURNS <= 0) {return false;}
    const recentUsers = messages
        .filter((message) => message.role === 'user')
        .slice(-RANDOM_ENCOUNTER_COOLDOWN_TURNS);
    return recentUsers.some((message) => hasChanceEncounterEvent(message.runtimeEvents));
}

function shouldTriggerRandomEncounter(roll: number): boolean {
    return Number.isFinite(roll) && roll < RANDOM_ENCOUNTER_PROBABILITY;
}

function resolveRandomEncounterForTurn(input: {
    runtime: TavernSessionContractRuntime;
    sessionMessages: TavernMessageRecord[];
    historyMessages: TavernMessageRecord[];
    reusedUserMessage: TavernMessageRecord | null;
    rerollRuntimeEvents?: boolean;
    randomEncounterRoll?: () => number;
}): TavernChanceEncounterRuntimeEvent | null {
    if (!input.runtime.includeRandomEncounters) {return null;}
    const existingEncounter = getChanceEncounterEvent(input.reusedUserMessage?.runtimeEvents);
    if (existingEncounter) {return existingEncounter;}
    if (input.reusedUserMessage && input.rerollRuntimeEvents !== true) {return null;}
    const cooldownSource = input.reusedUserMessage ? input.historyMessages : input.sessionMessages;
    if (isRandomEncounterCooldownActive(cooldownSource)) {return null;}
    const roll = input.randomEncounterRoll ? input.randomEncounterRoll() : Math.random();
    return shouldTriggerRandomEncounter(roll) ? createChanceEncounterEvent() : null;
}

function buildActionCheckCapabilities(runtime: TavernSessionContractRuntime): {
    tools: ReturnType<typeof getActionCheckToolDefinitions>;
    toolChoice: 'auto' | 'none';
} {
    if (!runtime.includeActionChecks) {
        return {
            tools: [],
            toolChoice: 'none' as const,
        };
    }
    return {
        tools: getActionCheckToolDefinitions(),
        toolChoice: 'auto' as const,
    };
}

function buildPhoneCommunicationProtocolMessage(): XbTavernMessage {
    return {
        role: 'system',
        name: 'private_message_protocol',
        content: [
            '<private_message_rules>',
            '标有“私人消息 · 发生于剧情此刻”的历史片段，是在对应剧情位置已经发生的私人通讯。',
            '默认只有片段中点名的参与者知道消息内容。',
            '消息里的计划、邀请和承诺只表示通讯事实；除非后续剧情明确确认，不得视为对应现场行动已经完成。',
            '</private_message_rules>',
        ].join('\n'),
    };
}

function buildRuntimeProtocolMessages(
    runtime: TavernSessionContractRuntime,
    options: { includePhoneCommunication?: boolean } = {},
): XbTavernMessage[] {
    return [
        ...(runtime.includeActionChecks ? [buildActionCheckProtocolMessage()] : []),
        ...(options.includePhoneCommunication ? [buildPhoneCommunicationProtocolMessage()] : []),
    ];
}

function buildChanceEncounterDepthEntries(event: TavernChanceEncounterRuntimeEvent | null | undefined): XbTavernRuntimeState['runtimeDepthEntries'] {
    if (!event) {return [];}
    return [{
        content: buildChanceEncounterPromptMessage().content,
        depth: 1,
        role: 'system',
        order: 1_000_000_000,
        label: 'chance encounter',
        layer: 'runtime-event',
    }];
}

function buildMemoryPromptContent(memoryContext: XbTavernMemoryContext = {}): string {
    const memoryFiles = Array.isArray(memoryContext.memoryFiles) ? memoryContext.memoryFiles : [];
    const spatialState = String(memoryContext.spatialState || '').trim();
    const statusPanelYaml = String(memoryContext.statusPanelYaml || '').trim();
    const sections: string[] = [];
    const stateFile = memoryFiles.find((file) => String(file.path || '') === 'memory/state.md');
    const stateContent = String(stateFile?.content || '').trim();
    if (stateContent) {
        sections.push(`## 会话记忆\n${stateContent}`);
    }
    const characterLines = memoryFiles
        .filter((file) => String(file.path || '').startsWith('memory/characters/'))
        .map((file) => {
            const path = String(file.path || '');
            const fallbackTitle = path.slice('memory/characters/'.length).replace(/\.md$/i, '');
            const title = String(file.title || fallbackTitle || '相关人物').trim();
            const content = String(file.content || '').trim();
            return content ? `### ${title}\n${content}` : '';
        })
        .filter(Boolean);
    if (characterLines.length) {
        sections.push(`## 相关人物记忆\n${characterLines.join('\n\n')}`);
    }
    if (statusPanelYaml) {
        sections.push(`## 状态栏\n${statusPanelYaml}`);
    }
    if (spatialState) {
        sections.push(`## 空间地图状态\n${spatialState}`);
    }
    return sections.join('\n\n');
}

function joinPromptMessages(messages: XbTavernMessage[] = []): string {
    return messages
        .map((message) => String(message.content || '').trim())
        .filter(Boolean)
        .join('\n\n');
}

export function trimFinalAssistantMessageEnd(messages: XbTavernMessage[] = []): XbTavernMessage[] {
    if (!messages.length) {return [];}
    let finalAssistantIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
        if (messages[index]?.role === 'assistant') {
            finalAssistantIndex = index;
            break;
        }
    }
    if (finalAssistantIndex < 0) {return messages;}
    return messages.map((message, index) => {
        if (index !== finalAssistantIndex) {
            return message;
        }
        const content = String(message.content || '').trimEnd();
        if (content === message.content) {return message;}
        return {
            ...message,
            content,
        };
    });
}

function buildSyntheticMessageLayers(messages: XbTavernMessage[] = [], source = 'sillytavern-native'): XbTavernMessageLayer[] {
    return messages.map((message, index) => {
        const chars = String(message.content || '').length;
        return {
            index,
            role: message.role,
            layer: source,
            label: `${source} ${index + 1}`,
            chars,
            tokenEstimate: Math.max(1, Math.ceil(chars / 4)),
        };
    });
}

function replaceBuildResultForPromptSource(
    result: XbTavernMessageBuildResult,
    messages: XbTavernMessage[] = [],
    source = 'sillytavern-native',
): XbTavernMessageBuildResult {
    const nextMessages = trimFinalAssistantMessageEnd(messages)
        .map((message) => ({
            ...message,
            content: String(message.content || ''),
        }))
        .filter((message) => message.content);
    return {
        ...result,
        messages: nextMessages,
        messageLayers: buildSyntheticMessageLayers(nextMessages, source),
        meta: {
            ...result.meta,
            rawMessagesJson: JSON.stringify(nextMessages, null, 2),
        },
    };
}

function normalizeDiagnosticContent(value: unknown): string {
    return String(value || '').trim();
}

function countMatchedPromptMessages(sourceMessages: XbTavernMessage[] = [], targetMessages: XbTavernMessage[] = []): {
    count: number;
    chars: number;
} {
    const remaining = new Map<string, number>();
    targetMessages.forEach((message) => {
        const content = normalizeDiagnosticContent(message.content);
        if (!content) {return;}
        const key = `${message.role}\n${content}`;
        remaining.set(key, (remaining.get(key) || 0) + 1);
    });
    let count = 0;
    let chars = 0;
    sourceMessages.forEach((message) => {
        const content = normalizeDiagnosticContent(message.content);
        if (!content) {return;}
        const key = `${message.role}\n${content}`;
        const left = remaining.get(key) || 0;
        if (left <= 0) {return;}
        remaining.set(key, left - 1);
        count += 1;
        chars += content.length;
    });
    return { count, chars };
}

function buildNativePromptDiagnostics(input: {
    context: XbTavernContext;
    currentUserMessage: string;
    nativeMessages: XbTavernMessage[];
    hostDiagnostics?: Record<string, unknown>;
}): Record<string, unknown> {
    const historyMessages = (Array.isArray(input.context.history) ? input.context.history : [])
        .map((message: XbTavernHistoryMessage) => ({
            role: normalizeRole(message.role ?? message.is_user),
            content: normalizeDiagnosticContent(message.content || message.mes || message.message),
        }))
        .filter((message) => message.content) as XbTavernMessage[];
    const currentUserContent = normalizeDiagnosticContent(input.currentUserMessage);
    const conversationMessages = currentUserContent
        ? [...historyMessages, { role: 'user' as const, content: currentUserContent }]
        : historyMessages;
    const matchedHistory = countMatchedPromptMessages(historyMessages, input.nativeMessages);
    const matchedConversation = countMatchedPromptMessages(conversationMessages, input.nativeMessages);
    const appDiagnostics = {
        nativeInputHistoryCount: historyMessages.length,
        nativeInputHistoryChars: historyMessages.reduce((sum, message) => sum + normalizeDiagnosticContent(message.content).length, 0),
        nativeBuiltConversationMessageCount: conversationMessages.length,
        nativeBuiltConversationChars: conversationMessages.reduce((sum, message) => sum + normalizeDiagnosticContent(message.content).length, 0),
        nativePreparedMessageCount: input.nativeMessages.length,
        nativePreparedMessageChars: input.nativeMessages.reduce((sum, message) => sum + normalizeDiagnosticContent(message.content).length, 0),
        nativeMatchedHistoryCount: matchedHistory.count,
        nativeMatchedHistoryChars: matchedHistory.chars,
        nativeMatchedConversationCount: matchedConversation.count,
        nativeMatchedConversationChars: matchedConversation.chars,
    };
    return {
        ...appDiagnostics,
        ...(input.hostDiagnostics && typeof input.hostDiagnostics === 'object' ? input.hostDiagnostics : {}),
    };
}

function summarizeActionCheckResult(result: TavernActionCheckToolResult): string {
    const errorText = 'error' in result ? result.error : '';
    return String(result.summary || errorText || '').trim();
}

function resolveActionCheckInsertAfterChars(text = '', result: TavernActionCheckToolResult, fallbackOffset = 0): number {
    const sourceText = String(text || '');
    const fallback = Math.max(0, Math.min(sourceText.length, Number(fallbackOffset) || 0));
    if (!result.ok) {return fallback;}
    const anchor = String(result.insertAfter ?? '');
    if (!anchor.trim()) {return fallback;}
    const index = sourceText.lastIndexOf(anchor);
    if (index < 0) {return fallback;}
    return Math.max(0, Math.min(sourceText.length, index + anchor.length));
}

export interface TavernRunStreamSnapshot {
    text?: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    liveActionCheckEvents?: TavernActionCheckRuntimeEvent[];
}

export type TavernRunStatusLabel =
    | '同步状态'
    | '整理历史'
    | '构建请求'
    | '请求模型'
    | '接收回复'
    | '保存回复';

export interface TavernRunStatusSnapshot {
    label: TavernRunStatusLabel;
}

export interface TavernRunOnceOptions {
    agentConfig: Record<string, unknown>;
    messages: XbTavernMessage[];
    providerRole?: XbTavernProviderRole;
    chatPreset?: TavernChatPromptPresetBundle;
    regexApplications?: TavernRegexApplicationSummary;
    tools?: unknown[];
    toolChoice?: 'auto' | 'none' | string;
    toolResponses?: TavernToolLoopResponse[];
    finalAnswerReminderText?: string;
    promptDiagnostics?: Record<string, unknown>;
    signal?: AbortSignal;
    onStreamProgress?: (snapshot: TavernRunStreamSnapshot) => void;
}

export type TavernRunOnceExecutor = ((options: TavernRunOnceOptions) => Promise<TavernRunOnceResult>) & {
    supportsSessionToolLoop?: boolean;
};

type TavernChatAdapter = {
    chat: (task: unknown) => Promise<Record<string, unknown>>;
    inspectRequest?: (task: unknown) => Promise<TavernRequestInspection> | TavernRequestInspection;
    inspectSendRequest?: (sendPayload: unknown, task: unknown) => Promise<TavernRequestInspection> | TavernRequestInspection;
    supportsSessionToolLoop?: boolean;
};

export interface TavernRequestInspection {
    provider?: string;
    model?: string;
    transport?: string;
    request?: unknown;
    [key: string]: unknown;
}

export interface TavernRequestSnapshot {
    presetName: string;
    chatPresetName: string;
    apiPresetName: string;
    provider: string;
    providerLabel: string;
    model: string;
    toolMode: string;
    messageCount: number;
    messageChars: number;
    rawMessagesJson: string;
    rawRequestJson: string;
    requestKind: 'actual' | 'simulated';
    capturedAt: number;
    requestInspection?: TavernRequestInspection;
    requestInspectionError?: string;
    regexApplications?: TavernRegexApplicationSummary;
    promptDiagnostics?: Record<string, unknown>;
}

export interface TavernRunOnceResult {
    text: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    model?: string;
    provider?: string;
    finishReason?: string;
    providerPayload?: unknown;
    toolCalls?: Array<{ id?: string; name?: string; arguments?: string; providerId?: string }>;
    requestSnapshot: TavernRequestSnapshot;
}

export interface TavernDiagnostics {
    ok?: boolean;
    message?: string;
    worldbookErrors?: Array<{ name: string; error: string }>;
    pendingManagerError?: string;
}

export const TAVERN_LOCAL_PROMPT_MESSAGES = Symbol('tavern-local-prompt-messages');

export type TavernGetNativeWorldInfoRuntime = (input: {
    context: XbTavernContext;
    currentUserMessage: string;
    trigger?: string;
    timedState?: XbTavernNativeWorldInfoTimedState;
    maxContext?: number;
}) => Promise<XbTavernNativeWorldInfoRuntime>;

export type TavernBuildNativeChatPromptRuntime = (input: {
    context: XbTavernContext;
    chatPreset?: TavernChatPromptPresetBundle;
    currentUserMessage: string;
    generationType?: string;
    debugStage?: string;
    signal?: AbortSignal;
    memoryPrompt?: string;
    chancePrompt?: string;
    actionCheckPrompt?: string;
    runtimeDepthPrompts?: XbTavernRuntimeState['runtimeDepthEntries'];
    [TAVERN_LOCAL_PROMPT_MESSAGES]?: XbTavernMessage[];
}) => Promise<{
    messages?: XbTavernMessage[];
    /** Explicit final-array boundary for the current USER; never infer it by role. */
    currentUserMessageIndex: number | null;
    source?: string;
    promptMessageCount?: number;
    diagnostics?: Record<string, unknown>;
}>;

export interface XbTavernRunTurnInput {
    sessionId?: string;
    agentConfig: Record<string, unknown>;
    contextSnapshot: XbTavernContext;
    chatPreset?: TavernChatPromptPresetBundle;
    preset?: TavernChatPromptPresetBundle;
    assistantPreset?: TavernAssistantPreset;
    currentUserMessage: string;
    runtimeState?: TavernSessionState;
    diagnostics?: TavernDiagnostics;
    historyMode?: XbTavernRuntimeState['historyMode'];
    signal?: AbortSignal;
    onStreamProgress?: (snapshot: TavernRunStreamSnapshot) => void;
    onRuntimeStatus?: (snapshot: TavernRunStatusSnapshot) => void;
    onUserMessageSaved?: (sessionId: string, message: TavernMessageRecord) => void | Promise<void>;
    onLatestAssistantRerollPrepared?: (
        sessionId: string,
        userMessage: TavernMessageRecord,
        previousAssistantMessage: TavernMessageRecord | null,
    ) => void | Promise<void>;
    onAssistantMessageSaved?: (sessionId: string, message: TavernMessageRecord) => void | Promise<void>;
    onManagerRunSaved?: (
        sessionId: string,
        managerRun: TavernManagerRunRecord,
    ) => void | Promise<void>;
    onManagerProgress?: (progress: TavernManagerLiveProgress) => void | Promise<void>;
    rerollLatestAssistant?: boolean;
    runManager?: boolean;
    generationTrigger?: string;
    executeRunOnce?: TavernRunOnceExecutor;
    executeManagerOnce?: (options: XbTavernManagerOnceOptions) => Promise<XbTavernManagerOnceResult>;
    applyRegex?: TavernApplyRegex;
    applySubstituteParams?: TavernApplySubstituteParams;
    getNativeWorldInfoRuntime?: TavernGetNativeWorldInfoRuntime;
    buildNativeChatPrompt?: TavernBuildNativeChatPromptRuntime;
    randomEncounterRoll?: () => number;
    rerollRuntimeEvents?: boolean;
    actionCheckRoll?: () => number;
    actionCheckPercentRoll?: () => number;
}

export interface XbTavernRunResult {
    sessionId: string;
    userMessage: TavernMessageRecord;
    assistantMessage?: TavernMessageRecord;
    errorMessage?: TavernMessageRecord;
    buildResult: XbTavernMessageBuildResult;
    buildSnapshot: XbTavernBuildSnapshot;
    requestSnapshot: TavernRequestSnapshot;
    provider: string;
    model: string;
    finishReason?: string;
    previewMatchesRequest: boolean;
    nextTurn: number;
    managerRunId?: string;
    managerStatus?: string;
    error?: string;
}

export interface XbTavernSimulateRequestInput {
    sessionId?: string;
    agentConfig: Record<string, unknown>;
    contextSnapshot: XbTavernContext;
    chatPreset?: TavernChatPromptPresetBundle;
    preset?: TavernChatPromptPresetBundle;
    currentUserMessage: string;
    runtimeState?: TavernSessionState;
    diagnostics?: TavernDiagnostics;
    historyMode?: XbTavernRuntimeState['historyMode'];
    generationTrigger?: string;
    applyRegex?: TavernApplyRegex;
    applySubstituteParams?: TavernApplySubstituteParams;
    getNativeWorldInfoRuntime?: TavernGetNativeWorldInfoRuntime;
    buildNativeChatPrompt?: TavernBuildNativeChatPromptRuntime;
}

export interface XbTavernSimulateRequestResult {
    buildResult: XbTavernMessageBuildResult;
    buildSnapshot: XbTavernBuildSnapshot;
    requestSnapshot: TavernRequestSnapshot;
    provider: string;
    model: string;
}

async function applyNativeChatPromptBuild(input: {
    stage: string;
    buildNativeChatPrompt?: TavernBuildNativeChatPromptRuntime;
    contextForBuild: XbTavernContext;
    chatPreset: TavernChatPromptPresetBundle;
    baseBuildResult: XbTavernMessageBuildResult;
    baseBuildSnapshot: XbTavernBuildSnapshot;
    currentUserMessage: string;
    generationType: string;
    signal?: AbortSignal;
    memoryContext?: XbTavernMemoryContext;
    chancePrompt?: string;
    runtimeDepthPrompts?: XbTavernRuntimeState['runtimeDepthEntries'];
    runtimeProtocolMessages?: XbTavernMessage[];
    /**
     * Last-mile repair applied to the final native message array. The Shop
     * block uses it to guarantee the observable "last block before USER"
     * ordering, which the SillyTavern extension-prompt key order cannot.
     */
    finalizeNativeMessages?: (
        messages: XbTavernMessage[],
        currentUserMessageIndex: number | null | undefined,
    ) => XbTavernMessage[];
    diagnostics?: TavernDiagnostics;
}): Promise<{ buildResult: XbTavernMessageBuildResult; buildSnapshot: XbTavernBuildSnapshot }> {
    if (!input.buildNativeChatPrompt) {
        throw new Error('native_prompt_builder_unavailable');
    }
    const nativePrompt = await runTavernStage(input.stage, () => input.buildNativeChatPrompt?.({
        context: input.contextForBuild,
        chatPreset: input.chatPreset,
        currentUserMessage: input.currentUserMessage,
        generationType: input.generationType,
        debugStage: input.stage,
        signal: input.signal,
        memoryPrompt: buildMemoryPromptContent(input.memoryContext),
        chancePrompt: input.chancePrompt || '',
        actionCheckPrompt: joinPromptMessages(input.runtimeProtocolMessages || []),
        runtimeDepthPrompts: input.runtimeDepthPrompts || [],
        [TAVERN_LOCAL_PROMPT_MESSAGES]: input.baseBuildResult.messages,
    }));
    const nativeMessages = Array.isArray(nativePrompt?.messages) ? nativePrompt.messages : [];
    if (!nativeMessages.length) {
        throw new Error('native_prompt_builder_returned_empty_messages');
    }
    const finalizedMessages = input.finalizeNativeMessages
        ? input.finalizeNativeMessages(nativeMessages, nativePrompt?.currentUserMessageIndex)
        : nativeMessages;
    if (!Array.isArray(finalizedMessages) || !finalizedMessages.length) {
        throw new Error('native_prompt_finalizer_returned_empty_messages');
    }
    const nativePromptDiagnostics = buildNativePromptDiagnostics({
        context: input.contextForBuild,
        currentUserMessage: input.currentUserMessage,
        nativeMessages: finalizedMessages,
        hostDiagnostics: nativePrompt?.diagnostics,
    });
    const buildResult = replaceBuildResultForPromptSource(input.baseBuildResult, finalizedMessages, 'sillytavern-native');
    const buildSnapshot = createXbTavernBuildSnapshot(input.contextForBuild, input.chatPreset, buildResult, {
        ...(input.diagnostics && typeof input.diagnostics === 'object' ? input.diagnostics : {}),
        promptSource: nativePrompt?.source || 'sillytavern-prepareOpenAIMessages',
        promptMessageCount: nativePrompt?.promptMessageCount ?? nativeMessages.length,
        nativePrompt: nativePromptDiagnostics,
    });
    return {
        buildResult,
        buildSnapshot,
    };
}

function assertNativePromptRuntimeHooks(input: {
    applyRegex?: TavernApplyRegex;
    applySubstituteParams?: TavernApplySubstituteParams;
    buildNativeChatPrompt?: TavernBuildNativeChatPromptRuntime;
}): void {
    if (!input.buildNativeChatPrompt) {
        throw new Error('native_prompt_builder_unavailable');
    }
    if (!input.applyRegex) {
        throw new Error('native_prompt_regex_runtime_unavailable');
    }
    if (!input.applySubstituteParams) {
        throw new Error('native_prompt_substitute_params_runtime_unavailable');
    }
}

function isAbortLikeError(error: unknown, signal?: AbortSignal): boolean {
    if (signal?.aborted) {return true;}
    if (!error || typeof error !== 'object') {return false;}
    const record = error as { name?: unknown; code?: unknown; message?: unknown };
    const name = String(record.name || '');
    const code = String(record.code || '');
    const message = String(record.message || '');
    return name === 'AbortError'
        || code === 'ABORT_ERR'
        || /abort|aborted|cancelled|canceled/i.test(message);
}

function wrapTavernStageError(stage: string, error: unknown): Error {
    if (error instanceof Error && /^\[xb-tavern:[^\]]+\]/.test(error.message)) {
        return error;
    }
    const message = error instanceof Error ? error.message : String(error || 'unknown_error');
    const wrapped = new Error(`[xb-tavern:${stage}] ${message}`);
    wrapped.name = error instanceof Error ? error.name : 'Error';
    if (error instanceof Error && error.stack) {
        wrapped.stack = `${wrapped.name}: ${wrapped.message}\nCaused by: ${error.stack}`;
    }
    return wrapped;
}

function formatTavernRunErrorMessage(errorText: string): string {
    const text = String(errorText || 'run_failed');
    if (/^\[xb-tavern:provider_chat\]\s*Failed to fetch\b/i.test(text)
        && !/切换酒馆补全源/.test(text)) {
        return `${text}\n\n可以尝试在 API 配置中切换酒馆补全源。`;
    }
    return text;
}

async function runTavernStage<T>(stage: string, task: () => Promise<T> | T): Promise<T> {
    const startedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
        ? performance.now()
        : Date.now();
    console.info('[小白酒馆] turn stage start', { stage });
    try {
        const result = await task();
        const finishedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
            ? performance.now()
            : Date.now();
        console.info('[小白酒馆] turn stage end', {
            stage,
            ms: Math.round(finishedAt - startedAt),
        });
        return result;
    } catch (error) {
        const finishedAt = typeof performance !== 'undefined' && typeof performance.now === 'function'
            ? performance.now()
            : Date.now();
        console.info('[小白酒馆] turn stage failed', {
            stage,
            ms: Math.round(finishedAt - startedAt),
            error: error instanceof Error ? error.message : String(error || 'unknown_error'),
        });
        throw wrapTavernStageError(stage, error);
    }
}

async function notifyRunCallback(callback: (() => void | Promise<void>) | undefined): Promise<void> {
    if (!callback) {return;}
    try {
        await callback();
    } catch (error) {
        console.warn('[小白酒馆] run callback failed', error);
    }
}

function notifyRunStatus(callback: ((snapshot: TavernRunStatusSnapshot) => void) | undefined, label: TavernRunStatusLabel) {
    if (!callback) {return;}
    try {
        callback({ label });
    } catch (error) {
        console.warn('[小白酒馆] run status callback failed', error);
    }
}

function hasUsableTavernContext(context?: XbTavernContext | null): boolean {
    const name = String(context?.character?.name || '').trim();
    return !!name && !/^(sillytavern\s+system|system)\b/i.test(name);
}

function tavernContextCharacterKey(context?: XbTavernContext | null): string {
    return String(context?.character?.characterKey || '').trim();
}

function resolveSessionContext(
    session?: Pick<TavernSessionRecord, 'characterKey' | 'contextSnapshot'> | null,
    fallbackContext: XbTavernContext = {},
): XbTavernContext {
    if (session) {
        const sessionCharacterKey = String(session.characterKey || tavernContextCharacterKey(session.contextSnapshot)).trim();
        const fallbackCharacterKey = tavernContextCharacterKey(fallbackContext);
        if (hasUsableTavernContext(fallbackContext)) {
            if (sessionCharacterKey && fallbackCharacterKey && sessionCharacterKey !== fallbackCharacterKey) {
                throw new Error('会话角色身份不匹配，请重新选择对应角色会话。');
            }
            if (!sessionCharacterKey || fallbackCharacterKey === sessionCharacterKey) {
                return fallbackContext || {};
            }
        }
        if (hasUsableTavernContext(session.contextSnapshot)) {return session.contextSnapshot || {};}
        return session.contextSnapshot || {};
    }
    if (hasUsableTavernContext(fallbackContext)) {return fallbackContext || {};}
    return fallbackContext || {};
}

function assertUsableTavernContext(context: XbTavernContext = {}): void {
    if (hasUsableTavernContext(context)) {return;}
    throw new Error('当前没有可用角色，请先选择角色或刷新当前会话。');
}

function resolveInputChatPreset(input: {
    chatPreset?: TavernChatPromptPresetBundle;
    preset?: TavernChatPromptPresetBundle;
} = {}): TavernChatPromptPresetBundle {
    return input.chatPreset || input.preset || {};
}

function resolveSessionContract(state?: TavernSessionState | null): TavernSessionContract {
    return normalizeTavernSessionContract(state?.contract);
}

function normalizeRuntimeSessionStateWithContract(
    state: Partial<TavernSessionState> | null | undefined,
    existingContract: Partial<TavernSessionContract> | null | undefined,
): TavernSessionState {
    const source = state && typeof state === 'object' && !Array.isArray(state) ? state : {};
    return normalizeTavernSessionState({
        ...source,
        contract: hasTavernSessionContractOverride(source.contract)
            ? mergeTavernSessionContract(existingContract, source.contract)
            : mergeTavernSessionContract(existingContract, undefined),
    });
}

function filterMemoryContextByRuntime(
    memoryContext: XbTavernMemoryContext | undefined,
    runtime: TavernSessionContractRuntime,
): XbTavernMemoryContext | undefined {
    if (!memoryContext) {return memoryContext;}
    if (!runtime.includeMemoryFiles && !runtime.includeStructuredStates && !runtime.includeStatusStates) {
        return {};
    }
    const filtered: XbTavernMemoryContext = {};
    if (runtime.includeMemoryFiles) {
        if (Array.isArray(memoryContext.memoryFiles)) {filtered.memoryFiles = memoryContext.memoryFiles;}
    }
    if (runtime.includeStructuredStates && Array.isArray(memoryContext.structuredStates)) {
        filtered.structuredStates = memoryContext.structuredStates;
    }
    if (runtime.includeStructuredStates && memoryContext.spatialState) {
        filtered.spatialState = memoryContext.spatialState;
    }
    if (runtime.includeStatusStates && memoryContext.statusPanelYaml) {
        filtered.statusPanelYaml = memoryContext.statusPanelYaml;
    }
    return filtered;
}

async function buildStatusPanelPromptContext(sessionId = '', runtime: TavernSessionContractRuntime): Promise<{
    statusPanelYaml: string;
    statusDocument?: TavernStatusDocument;
}> {
    const id = String(sessionId || '').trim();
    if (!id || !runtime.includeStatusStates) {return { statusPanelYaml: '' };}
    const state = await getTavernStatusDocumentForSession(id);
    if (!state.document) {return { statusPanelYaml: '' };}
    return {
        statusPanelYaml: buildTavernStatusPanelYaml(state.status),
        statusDocument: state.status,
    };
}

function addRegexSummary(target: TavernRegexApplicationSummary, source?: TavernRegexApplicationSummary): void {
    if (!source) {return;}
    (['userInput', 'worldInfo', 'aiOutput', 'reasoning'] as const).forEach((key) => {
        const count = Number(source[key]) || 0;
        if (count > 0) {
            target[key] = (target[key] || 0) + count;
        }
    });
}

function unchangedRegexItems(items: TavernApplyRegexItem[] = []): TavernAppliedRegexItem[] {
    return items.map((item) => ({
        id: item.id,
        text: item.text,
        changed: false,
    }));
}

async function applyTavernRegexItems(
    applyRegex: TavernApplyRegex | undefined,
    items: TavernApplyRegexItem[] = [],
): Promise<TavernAppliedRegexItem[]> {
    if (!items.length) {return [];}
    if (!applyRegex) {return unchangedRegexItems(items);}
    const result = await applyRegex(items);
    const byId = new Map((Array.isArray(result.items) ? result.items : []).map((item) => [item.id, item]));
    return items.map((item) => byId.get(item.id) || {
        id: item.id,
        text: item.text,
        changed: false,
    });
}

async function applySingleTavernRegex(input: {
    applyRegex?: TavernApplyRegex;
    placement: TavernApplyRegexItem['placement'];
    text: string;
    id: string;
    options?: TavernApplyRegexItem['options'];
}): Promise<{ text: string; summary?: TavernRegexApplicationSummary }> {
    const [item] = await applyTavernRegexItems(input.applyRegex, [{
        id: `${input.placement}:${input.id}`,
        text: input.text,
        placement: input.placement,
        options: input.options,
    }]);
    return {
        text: item?.text ?? input.text,
        summary: countRegexApplications(item ? [item] : []),
    };
}

async function applyReasoningRegex(input: {
    applyRegex?: TavernApplyRegex;
    thoughts?: Array<{ label?: string; text?: string }>;
}): Promise<{ thoughts?: Array<{ label?: string; text?: string }>; summary?: TavernRegexApplicationSummary }> {
    const thoughts = Array.isArray(input.thoughts) ? input.thoughts : [];
    const regexItems = thoughts
        .map((thought, index) => ({
            id: `reasoning:${index}`,
            text: String(thought.text || ''),
            placement: 'reasoning' as const,
        }))
        .filter((item) => item.text);
    if (!regexItems.length) {
        return { thoughts: input.thoughts };
    }
    const applied = await applyTavernRegexItems(input.applyRegex, regexItems);
    const byId = new Map(applied.map((item) => [item.id, item]));
    return {
        thoughts: thoughts.map((thought, index) => ({
            ...thought,
            text: byId.get(`reasoning:${index}`)?.text ?? thought.text,
        })),
        summary: countRegexApplications(applied),
    };
}

async function applyPromptRegexToConversationMessages(input: {
    applyRegex?: TavernApplyRegex;
    messages: XbTavernMessage[];
}): Promise<{ messages: XbTavernMessage[]; summary?: TavernRegexApplicationSummary }> {
    const messages = Array.isArray(input.messages) ? input.messages : [];
    const regexItems = messages.reduce<TavernApplyRegexItem[]>((items, message, index) => {
        const depth = messages.length - index - 1;
        if (['user', 'assistant'].includes(message.role) && String(message.content || '')) {
            const placement = message.role === 'user' ? 'userInput' : 'aiOutput';
            items.push({
                id: `${placement}:prompt:${index}`,
                text: String(message.content || ''),
                placement,
                options: {
                    isPrompt: true,
                    depth,
                },
            });
        }
        if (message.role === 'assistant' && Array.isArray(message.thoughts)) {
            message.thoughts.forEach((thought, thoughtIndex) => {
                const text = String(thought?.text || '');
                if (!text) {return;}
                items.push({
                    id: `reasoning:prompt:${index}:${thoughtIndex}`,
                    text,
                    placement: 'reasoning',
                    options: {
                        isPrompt: true,
                        depth,
                    },
                });
            });
        }
        return items;
    }, []);
    if (!regexItems.length) {
        return { messages };
    }
    const applied = await applyTavernRegexItems(input.applyRegex, regexItems);
    const byId = new Map(applied.map((item) => [item.id, item]));
    return {
        messages: messages.map((message, index) => {
            const placement = message.role === 'user' ? 'userInput' : message.role === 'assistant' ? 'aiOutput' : '';
            const item = placement ? byId.get(`${placement}:prompt:${index}`) : null;
            const thoughts = Array.isArray(message.thoughts)
                ? message.thoughts.map((thought, thoughtIndex) => ({
                    ...thought,
                    text: byId.get(`reasoning:prompt:${index}:${thoughtIndex}`)?.text ?? thought.text,
                }))
                : message.thoughts;
            return {
                ...message,
                ...(item ? { content: item.text } : {}),
                ...(thoughts ? { thoughts } : {}),
            };
        }),
        summary: countRegexApplications(applied),
    };
}

async function applyNativePromptConversationTransforms(input: {
    applyRegex?: TavernApplyRegex;
    applySubstituteParams?: TavernApplySubstituteParams;
    context: XbTavernContext;
    currentUserMessage: string;
    substituteOptions: TavernSubstituteParamsOptions;
}): Promise<{ context: XbTavernContext; currentUserMessage: string; summary?: TavernRegexApplicationSummary }> {
    const history = Array.isArray(input.context.history) ? input.context.history : [];
    const entries: Array<{ kind: 'history'; index: number } | { kind: 'current' }> = [];
    const messages: XbTavernMessage[] = [];

    history.forEach((message, index) => {
        const content = String(message.content || message.mes || message.message || '');
        if (!content) {return;}
        entries.push({ kind: 'history', index });
        messages.push({
            role: message.is_user === true ? 'user' : normalizeRole(message.role, 'assistant'),
            content,
            ...(message.name ? { name: String(message.name) } : {}),
        });
    });

    if (input.currentUserMessage) {
        entries.push({ kind: 'current' });
        messages.push({
            role: 'user',
            content: input.currentUserMessage,
            ...(input.context.user?.name ? { name: String(input.context.user.name) } : {}),
        });
    }

    if (!messages.length) {
        return {
            context: input.context,
            currentUserMessage: input.currentUserMessage,
        };
    }

    const substitutedMessages = await applyPromptSubstitutionToMessages({
        applySubstituteParams: input.applySubstituteParams,
        messages,
        options: input.substituteOptions,
    });
    const applied = await applyPromptRegexToConversationMessages({
        applyRegex: input.applyRegex,
        messages: substitutedMessages,
    });
    const transformedHistory = history.map((message) => ({ ...message }));
    let currentUserMessage = input.currentUserMessage;

    entries.forEach((entry, index) => {
        const transformed = applied.messages[index];
        if (!transformed) {return;}
        if (entry.kind === 'current') {
            currentUserMessage = transformed.content || '';
            return;
        }
        const original = transformedHistory[entry.index] as XbTavernHistoryMessage | undefined;
        if (!original) {return;}
        transformedHistory[entry.index] = {
            ...original,
            content: transformed.content || '',
        };
    });

    return {
        context: {
            ...input.context,
            history: transformedHistory,
        },
        currentUserMessage,
        summary: applied.summary,
    };
}

function unchangedSubstituteParamsItems(items: TavernSubstituteParamsItem[] = []): TavernSubstitutedParamsItem[] {
    return items.map((item) => ({
        id: item.id,
        text: item.text,
        changed: false,
    }));
}

async function applyTavernSubstituteParamsItems(
    applySubstituteParams: TavernApplySubstituteParams | undefined,
    items: TavernSubstituteParamsItem[] = [],
): Promise<TavernSubstitutedParamsItem[]> {
    if (!items.length) {return [];}
    if (!applySubstituteParams) {return unchangedSubstituteParamsItems(items);}
    const result = await applySubstituteParams(items);
    const byId = new Map((Array.isArray(result.items) ? result.items : []).map((item) => [item.id, item]));
    return items.map((item) => byId.get(item.id) || {
        id: item.id,
        text: item.text,
        changed: false,
    });
}

function buildSubstituteParamsOptions(context: XbTavernContext = {}): TavernSubstituteParamsOptions {
    const options: TavernSubstituteParamsOptions = {};
    const userName = String(context.user?.name || '').trim();
    const characterName = String(context.character?.name || '').trim();
    if (userName) {options.name1Override = userName;}
    if (characterName) {options.name2Override = characterName;}
    return options;
}

async function applySingleTavernSubstituteParams(input: {
    applySubstituteParams?: TavernApplySubstituteParams;
    text: string;
    id: string;
    options?: TavernSubstituteParamsOptions;
}): Promise<string> {
    const [item] = await applyTavernSubstituteParamsItems(input.applySubstituteParams, [{
        id: input.id,
        text: input.text,
        options: input.options,
    }]);
    return item?.text ?? input.text;
}

function textList(value: unknown): string[] {
    if (Array.isArray(value)) {return value.map((item) => String(item || ''));}
    if (value === undefined || value === null) {return [];}
    return [String(value)];
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function recordList(value: unknown): Array<Record<string, unknown>> {
    return Array.isArray(value) ? value.filter(isRecord) : [];
}

async function substituteWorldEntryPromptFields(input: {
    applySubstituteParams?: TavernApplySubstituteParams;
    entries: unknown;
    options: TavernSubstituteParamsOptions;
    scope: string;
}): Promise<Array<Record<string, unknown>>> {
    const entries = recordList(input.entries);
    const items: TavernSubstituteParamsItem[] = [];
    const refs: Array<{ entryIndex: number; field: 'content' | 'key' | 'keysecondary' | 'secondary_keys'; valueIndex?: number; id: string }> = [];
    entries.forEach((entry, entryIndex) => {
        const content = String(entry.content || '');
        if (content) {
            const id = `${input.scope}:${entryIndex}:content`;
            refs.push({ entryIndex, field: 'content', id });
            items.push({ id, text: content, options: input.options });
        }
        (['key', 'keysecondary', 'secondary_keys'] as const).forEach((field) => {
            textList(entry[field]).forEach((text, valueIndex) => {
                if (!text) {return;}
                const id = `${input.scope}:${entryIndex}:${field}:${valueIndex}`;
                refs.push({ entryIndex, field, valueIndex, id });
                items.push({ id, text, options: input.options });
            });
        });
    });
    const applied = await applyTavernSubstituteParamsItems(input.applySubstituteParams, items);
    const byId = new Map(applied.map((item) => [item.id, item.text]));
    const output = entries.map((entry) => ({ ...entry }));
    refs.forEach((ref) => {
        const text = byId.get(ref.id);
        if (text === undefined) {return;}
        const entry = output[ref.entryIndex];
        if (!entry) {return;}
        if (ref.field === 'content') {
            entry.content = text;
            return;
        }
        const original = entry[ref.field];
        if (Array.isArray(original)) {
            const list = [...original];
            list[ref.valueIndex || 0] = text;
            entry[ref.field] = list;
        } else {
            entry[ref.field] = text;
        }
    });
    return output;
}

async function substituteContextWorldEntriesForPrompt(input: {
    applySubstituteParams?: TavernApplySubstituteParams;
    context: XbTavernContext;
    options: TavernSubstituteParamsOptions;
}): Promise<XbTavernContext> {
    if (!input.applySubstituteParams) {return input.context;}
    const context: XbTavernContext = {
        ...input.context,
        worldEntries: Array.isArray(input.context.worldEntries)
            ? await substituteWorldEntryPromptFields({
                applySubstituteParams: input.applySubstituteParams,
                entries: input.context.worldEntries,
                options: input.options,
                scope: 'worldEntries',
            }) as XbTavernContext['worldEntries']
            : input.context.worldEntries,
    };
    if (Array.isArray(input.context.worldBooks)) {
        const worldBooks = await Promise.all(recordList(input.context.worldBooks).map(async (book, bookIndex) => ({
            ...book,
            entries: await substituteWorldEntryPromptFields({
                applySubstituteParams: input.applySubstituteParams,
                entries: book.entries,
                options: input.options,
                scope: `worldBooks:${bookIndex}`,
            }) as typeof book.entries,
        })));
        context.worldBooks = worldBooks as XbTavernContext['worldBooks'];
    }
    return context;
}

async function applyPromptSubstitutionToMessages(input: {
    applySubstituteParams?: TavernApplySubstituteParams;
    messages: XbTavernMessage[];
    options: TavernSubstituteParamsOptions;
}): Promise<XbTavernMessage[]> {
    const messages = Array.isArray(input.messages) ? input.messages : [];
    const items: TavernSubstituteParamsItem[] = [];
    messages.forEach((message, index) => {
        const content = String(message.content || '');
        if (content) {
            items.push({
                id: `message:${index}`,
                text: content,
                options: input.options,
            });
        }
        if (message.role === 'assistant' && Array.isArray(message.thoughts)) {
            message.thoughts.forEach((thought, thoughtIndex) => {
                const text = String(thought?.text || '');
                if (!text) {return;}
                items.push({
                    id: `thought:${index}:${thoughtIndex}`,
                    text,
                    options: input.options,
                });
            });
        }
    });
    const applied = await applyTavernSubstituteParamsItems(input.applySubstituteParams, items);
    const byId = new Map(applied.map((item) => [item.id, item.text]));
    return messages.map((message, index) => {
        const thoughts = Array.isArray(message.thoughts)
            ? message.thoughts.map((thought, thoughtIndex) => ({
                ...thought,
                text: byId.get(`thought:${index}:${thoughtIndex}`) ?? thought.text,
            }))
            : message.thoughts;
        return {
            ...message,
            content: byId.get(`message:${index}`) ?? message.content,
            ...(thoughts ? { thoughts } : {}),
        };
    });
}

function normalizeNativeWorldInfoTimedState(value: unknown): XbTavernNativeWorldInfoTimedState {
    const source = value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};
    const normalizeBucket = (bucket: unknown) => {
        if (!bucket || typeof bucket !== 'object' || Array.isArray(bucket)) {return {};}
        const result: Record<string, { hash?: number; start?: number; end?: number; protected?: boolean }> = {};
        Object.entries(bucket as Record<string, unknown>).forEach(([key, item]) => {
            if (!key || !item || typeof item !== 'object' || Array.isArray(item)) {return;}
            const record = item as Record<string, unknown>;
            const normalized: { hash?: number; start?: number; end?: number; protected?: boolean } = {};
            const hash = Number(record.hash);
            const start = Number(record.start);
            const end = Number(record.end);
            if (Number.isFinite(hash)) {normalized.hash = hash;}
            if (Number.isFinite(start)) {normalized.start = start;}
            if (Number.isFinite(end)) {normalized.end = end;}
            if (record.protected === true) {normalized.protected = true;}
            if (Object.keys(normalized).length) {
                result[key] = normalized;
            }
        });
        return result;
    };
    return {
        sticky: normalizeBucket(source.sticky),
        cooldown: normalizeBucket(source.cooldown),
    };
}

async function injectNativeWorldInfoRuntime(input: {
    getNativeWorldInfoRuntime?: TavernGetNativeWorldInfoRuntime;
    context: XbTavernContext;
    currentUserMessage: string;
    trigger?: string;
    timedState?: XbTavernNativeWorldInfoTimedState;
}): Promise<{
    context: XbTavernContext;
    timedState: XbTavernNativeWorldInfoTimedState;
}> {
    const timedState = normalizeNativeWorldInfoTimedState(input.timedState);
    if (!input.getNativeWorldInfoRuntime) {
        return {
            context: input.context,
            timedState,
        };
    }
    const nativeWorldInfo = await input.getNativeWorldInfoRuntime({
        context: input.context,
        currentUserMessage: input.currentUserMessage,
        trigger: input.trigger,
        timedState,
    });
    return {
        context: {
            ...input.context,
            nativeWorldInfo,
        },
        timedState: normalizeNativeWorldInfoTimedState(nativeWorldInfo?.timedState),
    };
}

function shouldApplyWorldInfoRegexToEntry(entry: ActivatedWorldEntry, hasNativeWorldInfo = false): boolean {
    void entry;
    return !hasNativeWorldInfo;
}

function mergeBuildWorldEntryStateUpdates(
    sessionState: TavernSessionState = {},
    buildResult: XbTavernMessageBuildResult,
    shouldReplaceSessionState = false,
): NonNullable<TavernSessionState['worldEntryStates']> {
    const current = sessionState.worldEntryStates || {};
    const updates = buildResult.meta.worldEntryStateUpdates || {};
    return shouldReplaceSessionState
        ? mergeWorldEntryStates(current, updates)
        : updates;
}

function normalizeRequestSnapshotMessages(messages: XbTavernMessage[] = []): XbTavernMessage[] {
    return (Array.isArray(messages) ? messages : []).map((message) => {
        const normalized: XbTavernMessage = {
            role: message.role,
            content: String(message.content || ''),
        };
        if (message.name) {normalized.name = String(message.name);}
        if (Array.isArray(message.tool_calls) && message.tool_calls.length) {
            normalized.tool_calls = message.tool_calls.map((toolCall) => ({
                ...(toolCall.id ? { id: String(toolCall.id) } : {}),
                ...(toolCall.type ? { type: String(toolCall.type) } : {}),
                ...(Object.prototype.hasOwnProperty.call(toolCall, 'providerToolCallId')
                    ? { providerToolCallId: String(toolCall.providerToolCallId || '') }
                    : {}),
                ...(toolCall.function ? {
                    function: {
                        name: String(toolCall.function.name || ''),
                        arguments: String(toolCall.function.arguments || ''),
                    },
                } : {}),
            }));
        }
        if (Array.isArray(message.toolCalls) && message.toolCalls.length) {
            normalized.toolCalls = message.toolCalls.map((toolCall) => ({
                ...(toolCall.id ? { id: String(toolCall.id) } : {}),
                name: String(toolCall.name || ''),
                arguments: String(toolCall.arguments || ''),
                ...(Object.prototype.hasOwnProperty.call(toolCall, 'providerId')
                    ? { providerId: String(toolCall.providerId || '') }
                    : {}),
            }));
        }
        if (message.tool_call_id) {normalized.tool_call_id = String(message.tool_call_id);}
        if (message.toolCallId) {normalized.toolCallId = String(message.toolCallId);}
        if (message.toolName) {normalized.toolName = String(message.toolName);}
        return normalized;
    });
}

export function buildTavernRequestSnapshot(
    agentConfig: Record<string, unknown> = {},
    messages: XbTavernMessage[] = [],
    override: Partial<Pick<TavernRequestSnapshot, 'provider' | 'model' | 'requestKind'>> & {
        requestInspection?: TavernRequestInspection | null;
        requestInspectionError?: string;
        chatPreset?: TavernChatPromptPresetBundle;
        regexApplications?: TavernRegexApplicationSummary;
        requestTask?: Record<string, unknown> | null;
        promptDiagnostics?: Record<string, unknown> | null;
        resolvedProviderConfig?: XbTavernResolvedProvider;
    } = {},
): TavernRequestSnapshot {
    const providerConfig = override.resolvedProviderConfig || resolveXbTavernProviderConfig(agentConfig);
    const requestInspection = override.requestInspection || null;
    const requestInspectionError = String(override.requestInspectionError || '').trim();
    const chatPresetName = String(override.chatPreset?.name || '').trim();
    const snapshotMessages = normalizeRequestSnapshotMessages(messages);
    const rawMessagesJson = JSON.stringify(snapshotMessages, null, 2);
    const promptDiagnostics = override.promptDiagnostics && typeof override.promptDiagnostics === 'object'
        ? override.promptDiagnostics
        : null;
    const requestForJsonBase = requestInspection
        || (requestInspectionError
            ? {
                provider: String(override.provider || providerConfig.provider || ''),
                model: String(override.model || providerConfig.model || ''),
                transport: 'inspection-error',
                requestInspectionError,
                request: override.requestTask || { messages: snapshotMessages },
            }
            : {
                provider: String(override.provider || providerConfig.provider || ''),
                model: String(override.model || providerConfig.model || ''),
                transport: 'unavailable',
                request: override.requestTask || { messages: snapshotMessages },
            });
    const requestForJson = promptDiagnostics
        ? {
            ...requestForJsonBase,
            promptDiagnostics,
        }
        : requestForJsonBase;
    const rawRequestJson = JSON.stringify(requestForJson, null, 2);
    return {
        presetName: chatPresetName || providerConfig.currentPresetName,
        chatPresetName,
        apiPresetName: providerConfig.currentPresetName,
        provider: String(override.provider || providerConfig.provider || ''),
        providerLabel: providerConfig.providerLabel,
        model: String(override.model || providerConfig.model || ''),
        toolMode: providerConfig.toolMode,
        messageCount: snapshotMessages.length,
        messageChars: snapshotMessages.reduce((sum, message) => sum + String(message.content || '').length, 0),
        rawMessagesJson,
        rawRequestJson,
        requestKind: override.requestKind || 'actual',
        capturedAt: Date.now(),
        ...(hasRegexApplications(override.regexApplications) ? { regexApplications: override.regexApplications } : {}),
        ...(promptDiagnostics ? { promptDiagnostics } : {}),
        ...(requestInspection ? { requestInspection } : {}),
        ...(requestInspectionError ? { requestInspectionError } : {}),
    };
}

async function inspectTavernRequest(input: {
    agentConfig: Record<string, unknown>;
    messages: XbTavernMessage[];
    chatPreset?: TavernChatPromptPresetBundle;
    tools?: unknown[];
    toolChoice?: 'auto' | 'none' | string;
    toolResponses?: Array<{ id?: string; name?: string; response?: unknown }>;
    finalAnswerReminderText?: string;
    signal?: AbortSignal;
    onStreamProgress?: TavernRunOnceOptions['onStreamProgress'];
    requestKind?: TavernRequestSnapshot['requestKind'];
    regexApplications?: TavernRegexApplicationSummary;
    promptDiagnostics?: Record<string, unknown>;
    providerConfig?: ReturnType<typeof assertXbTavernProviderReady>;
    adapter?: TavernChatAdapter;
}): Promise<{
    task: ReturnType<ReturnType<typeof createXbTavernAgentRuntime>['buildChatTask']>;
    adapter: TavernChatAdapter;
    providerConfig: ReturnType<typeof assertXbTavernProviderReady>;
    requestSnapshot: TavernRequestSnapshot;
    snapshotMessages: XbTavernMessage[];
}> {
    const providerConfig = input.providerConfig || assertXbTavernProviderReady(input.agentConfig);
    const providerMessages = trimFinalAssistantMessageEnd(input.messages);
    const runtime = createXbTavernAgentRuntime(providerConfig, {
        tools: Array.isArray(input.tools) ? input.tools : [],
        toolChoice: input.toolChoice || (Array.isArray(input.tools) && input.tools.length ? 'auto' : 'none'),
    });
    const adapter = input.adapter || createAgentAdapter(providerConfig as unknown as Record<string, unknown>, {
        missingApiKeyMessage: '请先在 API 配置里选择模型/填写 Key。',
    }) as TavernChatAdapter;
    const task = runtime.buildChatTask({
        messages: providerMessages,
        signal: input.signal,
        onStreamProgress: input.onStreamProgress,
    });
    const requestPlan = resolveTavernToolLoopRequestPlan({
        supportsSessionToolLoop: adapter.supportsSessionToolLoop === true,
        messages: providerMessages,
        toolResponses: input.toolResponses,
        finalAnswerReminderText: input.finalAnswerReminderText,
    });
    applyTavernToolLoopRequestPlan(task as unknown as Record<string, unknown>, requestPlan);
    const sendPayload = buildGoogleSessionToolLoopSendPayload(requestPlan);
    const requestInspection = sendPayload && typeof adapter.inspectSendRequest === 'function'
        ? await adapter.inspectSendRequest(sendPayload, task)
        : typeof adapter.inspectRequest === 'function'
            ? await adapter.inspectRequest(task)
            : null;
    return {
        task,
        adapter,
        providerConfig,
        requestSnapshot: buildTavernRequestSnapshot(input.agentConfig, requestPlan.requestMessages, {
            resolvedProviderConfig: providerConfig,
            provider: String(requestInspection?.provider || providerConfig.provider || ''),
            model: String(requestInspection?.model || providerConfig.model || ''),
            requestInspection,
            requestKind: input.requestKind || 'actual',
            chatPreset: input.chatPreset,
            regexApplications: input.regexApplications,
            promptDiagnostics: input.promptDiagnostics,
            requestTask: task as unknown as Record<string, unknown>,
        }),
        snapshotMessages: requestPlan.requestMessages,
    };
}

export function buildContextHistory(
    messages: TavernMessageRecord[] = [],
    communicationEvents: TavernCommunicationTimelineEvent[] = [],
): XbTavernMessage[] {
    const eventsByAnchor = new Map<number, TavernCommunicationTimelineEvent[]>();
    communicationEvents.forEach((event) => {
        const rows = eventsByAnchor.get(event.anchorOrder) || [];
        rows.push(event);
        eventsByAnchor.set(event.anchorOrder, rows);
    });
    const history: XbTavernMessage[] = [];
    const pushEvents = (anchorOrder: number) => {
        (eventsByAnchor.get(anchorOrder) || [])
            .sort((left, right) => left.createdAt - right.createdAt)
            .forEach((event) => history.push(event.message as XbTavernMessage));
    };
    pushEvents(-1);
    [...messages]
        .sort((left, right) => left.order - right.order)
        .forEach((message) => {
            if (!message.error) {
                const item: XbTavernMessage = {
                    role: ['system', 'user', 'assistant', 'tool'].includes(message.role)
                        ? message.role as XbTavernMessage['role']
                        : 'assistant',
                    content: stripTavernImageMarkers(message.content),
                    ...(message.name ? { name: message.name } : {}),
                    ...(Array.isArray(message.thoughts) && message.thoughts.length ? { thoughts: message.thoughts } : {}),
                };
                if (String(item.content || '').trim()) {history.push(item);}
            }
            pushEvents(message.order);
        });
    return history;
}

export async function loadCommunicationEventsForHistory(
    sessionId = '',
    messages: TavernMessageRecord[] = [],
    playerName = '',
): Promise<TavernCommunicationTimelineEvent[]> {
    const sorted = [...messages].sort((left, right) => left.order - right.order);
    const firstOrder = sorted[0]?.order;
    const lastOrder = sorted.at(-1)?.order;
    const fromAnchorOrder = Number.isInteger(Number(firstOrder)) && Number(firstOrder) > 0
        ? Number(firstOrder)
        : -1;
    const toAnchorOrder = Number.isInteger(Number(lastOrder)) ? Number(lastOrder) : -1;
    return listTavernCommunicationTimelineEvents(sessionId, {
        fromAnchorOrder,
        toAnchorOrder,
        playerName,
    });
}

async function ensureRunSession(input: XbTavernRunTurnInput, buildSnapshot?: XbTavernBuildSnapshot): Promise<TavernSessionRecord> {
    const existing = await getTavernSession(input.sessionId || '');
    if (existing) {return existing;}
    const chatPreset = resolveInputChatPreset(input);
    const contextSnapshot = input.contextSnapshot || {};
    const character = contextSnapshot.character || {};
    const initialRuntimeState = normalizeTavernSessionState(input.runtimeState || {});
    return await createTavernSession({
        title: String(character.name || '未选择角色'),
        characterKey: String(character.characterKey || ''),
        characterName: String(character.name || '未选择角色'),
        contextSnapshot,
        buildSnapshot,
        chatPresetId: String(chatPreset.id || ''),
        chatPresetName: String(chatPreset.name || ''),
        presetId: String(chatPreset.id || ''),
        presetName: String(chatPreset.name || ''),
        state: {
            turn: 0,
            contract: initialRuntimeState.contract,
            worldEntryStates: {},
            nativeWorldInfoTimedState: { sticky: {}, cooldown: {} },
        },
    });
}

export async function runTavernOnce(options: TavernRunOnceOptions): Promise<TavernRunOnceResult> {
    const providerConfig = assertXbTavernProviderReady(options.agentConfig, {
        role: options.providerRole,
    });
    const adapter = createAgentAdapter(providerConfig as unknown as Record<string, unknown>, {
        missingApiKeyMessage: '请先在 API 配置里选择模型/填写 Key。',
    }) as TavernChatAdapter;
    return runTavernOnceWithAdapter(adapter, providerConfig, options);
}

async function runTavernOnceWithAdapter(
    adapter: TavernChatAdapter,
    providerConfig: ReturnType<typeof assertXbTavernProviderReady>,
    options: TavernRunOnceOptions,
): Promise<TavernRunOnceResult> {
    const inspected = await runTavernStage('provider_request_inspection', () => inspectTavernRequest({
        agentConfig: options.agentConfig,
        messages: options.messages,
        chatPreset: options.chatPreset,
        regexApplications: options.regexApplications,
        tools: options.tools,
        toolChoice: options.toolChoice,
        toolResponses: options.toolResponses,
        finalAnswerReminderText: options.finalAnswerReminderText,
        promptDiagnostics: options.promptDiagnostics,
        signal: options.signal,
        onStreamProgress: options.onStreamProgress,
        requestKind: 'actual',
        providerConfig,
        adapter,
    }));
    let result: Record<string, unknown>;
    try {
        result = await runTavernStage('provider_chat', () => inspected.adapter.chat(inspected.task));
    } catch (error) {
        const requestInspection = (error as { requestInspection?: TavernRequestInspection } | null)?.requestInspection;
        if (requestInspection && error && typeof error === 'object') {
            (error as { requestSnapshot?: TavernRequestSnapshot }).requestSnapshot = buildTavernRequestSnapshot(options.agentConfig, inspected.snapshotMessages, {
                resolvedProviderConfig: inspected.providerConfig,
                provider: String(requestInspection.provider || inspected.providerConfig.provider || ''),
                model: String(requestInspection.model || inspected.providerConfig.model || ''),
                requestInspection,
                requestKind: 'actual',
                chatPreset: options.chatPreset,
                regexApplications: options.regexApplications,
                promptDiagnostics: options.promptDiagnostics,
                requestTask: inspected.task as unknown as Record<string, unknown>,
            });
        }
        throw error;
    }
    const finalInspection = (result?.requestInspection || inspected.requestSnapshot.requestInspection || null) as TavernRequestInspection | null;
    const text = String(result?.text || '');
    const provider = String(result?.provider || finalInspection?.provider || inspected.providerConfig.provider || '');
    const model = String(result?.model || finalInspection?.model || inspected.providerConfig.model || '');
    const toolCalls = resolveResultToolCalls(result || {}, inspected.providerConfig as unknown as Record<string, unknown>, {
        fallbackPrefix: 'tavern-rp-tool',
    });
    return {
        text,
        thoughts: result?.thoughts as Array<{ label?: string; text?: string }> | undefined,
        model,
        provider,
        finishReason: result?.finishReason as string | undefined,
        providerPayload: result?.providerPayload,
        toolCalls,
        requestSnapshot: buildTavernRequestSnapshot(options.agentConfig, inspected.snapshotMessages, {
            resolvedProviderConfig: inspected.providerConfig,
            provider,
            model,
            requestInspection: finalInspection,
            requestKind: 'actual',
            chatPreset: options.chatPreset,
            regexApplications: options.regexApplications,
            promptDiagnostics: options.promptDiagnostics,
            requestTask: inspected.task as unknown as Record<string, unknown>,
        }),
    };
}

export async function simulateXbTavernRequest(input: XbTavernSimulateRequestInput): Promise<XbTavernSimulateRequestResult> {
    assertNativePromptRuntimeHooks(input);
    const chatPreset = resolveInputChatPreset(input);
    const session = input.sessionId ? await getTavernSession(input.sessionId) : null;
    const liveContext = resolveSessionContext(session, input.contextSnapshot);
    assertUsableTavernContext(liveContext);
    const sessionState = normalizeTavernSessionState(session?.state || input.runtimeState || {});
    const sessionContract = resolveSessionContract(sessionState);
    const sessionContractRuntime = resolveTavernSessionContractRuntime(sessionContract);
    const actionCheckCapabilities = buildActionCheckCapabilities(sessionContractRuntime);
    const inputRegex = await runTavernStage('simulate_user_input_regex', () => applySingleTavernRegex({
        applyRegex: input.applyRegex,
        placement: 'userInput',
        id: 'simulate',
        text: input.currentUserMessage,
    }));
    const regexApplications: TavernRegexApplicationSummary = {};
    addRegexSummary(regexApplications, inputRegex.summary);
    const substituteOptions = buildSubstituteParamsOptions(liveContext);
    const storedUserMessage = await runTavernStage('simulate_user_input_substitute', () => applySingleTavernSubstituteParams({
        applySubstituteParams: input.applySubstituteParams,
        id: 'userInput:simulate',
        text: inputRegex.text,
        options: substituteOptions,
    }));
    const currentUserMessage = stripTavernImageMarkers(storedUserMessage);
    const contextWindow = session
        ? await loadTavernPromptHistoryWindow({
            sessionId: session.id,
            contextWindowStartOrder: sessionState.contextWindowStartOrder,
            currentUserMessage,
        })
        : null;
    const communicationEvents = session
        ? await runTavernStage(
            'simulate_phone_timeline',
            () => loadCommunicationEventsForHistory(
                session.id,
                contextWindow?.historyMessages || [],
                liveContext.user?.name || '',
            ),
        )
        : [];
    const contextForBuildRaw: XbTavernContext = {
        ...liveContext,
        worldSettings: {
            ...(liveContext.worldSettings || {}),
            trigger: String(input.generationTrigger || 'normal'),
        },
        history: session
            ? buildContextHistory(contextWindow?.historyMessages || [], communicationEvents)
            : (input.contextSnapshot.history || []),
    };
    const nativeContext = await runTavernStage('simulate_native_worldbook_runtime', () => injectNativeWorldInfoRuntime({
        getNativeWorldInfoRuntime: input.getNativeWorldInfoRuntime,
        context: contextForBuildRaw,
        currentUserMessage,
        trigger: String(input.generationTrigger || 'normal'),
        timedState: sessionState.nativeWorldInfoTimedState,
    }));
    const contextForBuild = await runTavernStage('simulate_world_entry_substitute', () => substituteContextWorldEntriesForPrompt({
        applySubstituteParams: input.applySubstituteParams,
        context: nativeContext.context,
        options: substituteOptions,
    }));
    const memoryQuery = await runTavernStage('simulate_memory_query', () => buildXbTavernMemoryQuery(contextForBuild, currentUserMessage));
    const retrievedMemoryContext = session && (sessionContractRuntime.includeMemoryFiles || sessionContractRuntime.includeStructuredStates)
        ? await runTavernStage('simulate_memory_retrieval', () => retrieveXbTavernMemoryContext({
            sessionId: session.id,
            queryText: memoryQuery,
            ignoredTerms: buildXbTavernMemoryIgnoredTerms(contextForBuild),
            includeMemoryFiles: sessionContractRuntime.includeMemoryFiles,
            includeStructuredStates: sessionContractRuntime.includeStructuredStates,
        }))
        : undefined;
    const statusPromptContext = session
        ? await runTavernStage('simulate_status_panel_prompt', () => buildStatusPanelPromptContext(session.id, sessionContractRuntime))
        : { statusPanelYaml: '' };
    const statusPanelYaml = statusPromptContext.statusPanelYaml;
    const memoryContext: XbTavernMemoryContext | undefined = retrievedMemoryContext || statusPanelYaml
        ? {
            ...(retrievedMemoryContext || {}),
            ...(statusPanelYaml ? { statusPanelYaml } : {}),
        }
        : undefined;
    const filteredMemoryContext = filterMemoryContextByRuntime(memoryContext, sessionContractRuntime);
    const taskDepthEntries = session
        ? await runTavernStage('simulate_task_context', () => buildTavernStoryTaskDepthEntries(session.id, {
            atAnchorOrder: (contextWindow?.historyMessages.at(-1)?.order ?? -1) + 1,
        }))
        : [];
    const shopDepthEntries = session
        ? await runTavernStage('simulate_shop_context', () => buildTavernShopRuntimeDepthEntries({
            sessionId: session.id,
            currentTurn: sessionState.turn,
            atAnchorOrder: (contextWindow?.historyMessages.at(-1)?.order ?? -1) + 1,
        }))
        : [];
    const runtimeProtocolMessages = buildRuntimeProtocolMessages(sessionContractRuntime, {
        includePhoneCommunication: communicationEvents.length > 0,
    });
    const brain = await runTavernStage('simulate_brain_build', () => buildXbTavernBrainAsync({
        context: contextForBuild,
        chatPreset,
        currentUserMessage,
        historyMode: input.historyMode || 'raw',
        turn: sessionState.turn,
        entryStates: sessionState.worldEntryStates,
        memoryContext: filteredMemoryContext,
        runtimeDepthEntries: [...taskDepthEntries, ...shopDepthEntries],
        runtimeProtocolMessages,
        diagnostics: input.diagnostics || {},
        regexApplications,
        transformConversationMessages: async (messages) => {
            const substitutedMessages = await applyPromptSubstitutionToMessages({
                applySubstituteParams: input.applySubstituteParams,
                messages,
                options: substituteOptions,
            });
            const applied = await applyPromptRegexToConversationMessages({
                applyRegex: input.applyRegex,
                messages: substitutedMessages,
            });
            addRegexSummary(regexApplications, applied.summary);
            return applied.messages;
        },
        transformFinalMessages: async (messages) => applyPromptSubstitutionToMessages({
            applySubstituteParams: input.applySubstituteParams,
            messages,
            options: substituteOptions,
        }),
        transformWorldEntries: async (entries) => {
            const hasNativeWorldInfo = !!contextForBuild.nativeWorldInfo;
            const regexEntries = entries.filter((entry) => shouldApplyWorldInfoRegexToEntry(entry, hasNativeWorldInfo));
            const applied = await applyTavernRegexItems(input.applyRegex, regexEntries.map((entry) => ({
                id: `worldInfo:${entry.activationKey}`,
                text: entry.content,
                placement: 'worldInfo',
                options: {
                    isMarkdown: false,
                    isPrompt: true,
                    depth: entry.position === XBTavernWorldPosition.atDepth ? entry.depth : null,
                },
            })));
            addRegexSummary(regexApplications, countRegexApplications(applied));
            const byId = new Map(applied.map((item) => [item.id, item]));
            return entries.map((entry) => {
                const item = byId.get(`worldInfo:${entry.activationKey}`);
                const content = item?.text ?? entry.content;
                return {
                    ...entry,
                    content,
                    contentChars: content.length,
                };
            });
        },
    }));
    const nativePromptConversation = input.buildNativeChatPrompt
        ? await runTavernStage('simulate_native_prompt_conversation_transform', () => applyNativePromptConversationTransforms({
            applyRegex: input.applyRegex,
            applySubstituteParams: input.applySubstituteParams,
            context: contextForBuild,
            currentUserMessage,
            substituteOptions,
        }))
        : {
            context: contextForBuild,
            currentUserMessage,
        };
    const { buildResult, buildSnapshot } = await applyNativeChatPromptBuild({
        stage: 'simulate_native_prompt_build',
        buildNativeChatPrompt: input.buildNativeChatPrompt,
        contextForBuild: nativePromptConversation.context,
        chatPreset,
        baseBuildResult: brain.buildResult,
        baseBuildSnapshot: brain.buildSnapshot,
        currentUserMessage: nativePromptConversation.currentUserMessage,
        generationType: String(input.generationTrigger || 'normal'),
        memoryContext: filteredMemoryContext,
        runtimeDepthPrompts: [...taskDepthEntries, ...shopDepthEntries],
        runtimeProtocolMessages,
        finalizeNativeMessages: (messages, currentUserMessageIndex) => placeTavernShopPromptBlockBeforeCurrentUser(
            messages,
            shopDepthEntries[0]?.content || '',
            currentUserMessageIndex,
        ),
        diagnostics: input.diagnostics,
    });
    const inspected = await runTavernStage('simulate_request_inspection', () => inspectTavernRequest({
        agentConfig: input.agentConfig,
        messages: buildResult.messages,
        chatPreset,
        tools: actionCheckCapabilities.tools,
        toolChoice: actionCheckCapabilities.toolChoice,
        onStreamProgress: () => {},
        requestKind: 'simulated',
        regexApplications,
        promptDiagnostics: buildSnapshot.diagnostics as Record<string, unknown> | undefined,
    }));
    const provider = inspected.requestSnapshot.provider;
    const model = inspected.requestSnapshot.model;
    return {
        buildResult,
        buildSnapshot,
        requestSnapshot: inspected.requestSnapshot,
        provider,
        model,
    };
}

function safeJsonParse(value: unknown, fallback: Record<string, unknown> = {}): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    try {
        const parsed = JSON.parse(String(value || '{}'));
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? parsed as Record<string, unknown>
            : fallback;
    } catch {
        return fallback;
    }
}

function safeJsonStringify(value: unknown): string {
    try {
        return JSON.stringify(value || {});
    } catch {
        return '{}';
    }
}

async function runTavernActionCheckLoop(input: {
    agentConfig: Record<string, unknown>;
    messages: XbTavernMessage[];
    chatPreset?: TavernChatPromptPresetBundle;
    regexApplications?: TavernRegexApplicationSummary;
    promptDiagnostics?: Record<string, unknown>;
    signal?: AbortSignal;
    onStreamProgress?: TavernRunOnceOptions['onStreamProgress'];
    executeRunOnce: TavernRunOnceExecutor;
    actionCheckRoll?: () => number;
    actionCheckPercentRoll?: () => number;
    statusDocument?: TavernStatusDocument;
}): Promise<TavernRunOnceResult & { runtimeEvents: TavernActionCheckRuntimeEvent[] }> {
    const tools = getActionCheckToolDefinitions();
    const protocolMessages = [...input.messages];
    const runtimeEvents: TavernActionCheckRuntimeEvent[] = [];
    const supportsSessionToolLoop = resolveRunOnceSessionToolLoopSupport(input.agentConfig, input.executeRunOnce);
    let finalText = '';
    let finalThoughts: Array<{ label?: string; text?: string }> | undefined = undefined;
    let finalProvider = '';
    let finalModel = '';
    let finalFinishReason = '';
    let finalProviderPayload: unknown = undefined;
    let finalRequestSnapshot = buildTavernRequestSnapshot(input.agentConfig, input.messages, {
        chatPreset: input.chatPreset,
        regexApplications: input.regexApplications,
        promptDiagnostics: input.promptDiagnostics,
    });
    let pendingToolResponses: TavernToolLoopResponse[] | undefined = undefined;
    let pendingFinalAnswerReminderText = '';
    let sawToolExecution = false;
    let finalAnswerReminderSent = false;

    for (let round = 1; round <= MAX_ACTION_CHECK_ROUNDS + 2; round += 1) {
        const requestPlan = resolveTavernToolLoopRequestPlan({
            supportsSessionToolLoop,
            messages: protocolMessages,
            toolResponses: pendingToolResponses,
            finalAnswerReminderText: pendingFinalAnswerReminderText,
        });
        const result = await input.executeRunOnce({
            agentConfig: input.agentConfig,
            messages: requestPlan.requestMessages,
            chatPreset: input.chatPreset,
            regexApplications: input.regexApplications,
            promptDiagnostics: input.promptDiagnostics,
            tools,
            toolChoice: 'auto',
            ...(requestPlan.mode === 'session_tool_response_round'
                ? { toolResponses: requestPlan.toolResponses }
                : {}),
            ...(requestPlan.mode === 'session_final_reminder_round'
                ? { finalAnswerReminderText: requestPlan.finalAnswerReminderText }
                : {}),
            signal: input.signal,
            onStreamProgress: (snapshot) => {
                if (!input.onStreamProgress) {return;}
                if (typeof snapshot?.text !== 'string') {
                    input.onStreamProgress(snapshot);
                    return;
                }
                input.onStreamProgress({
                    ...snapshot,
                    text: finalText + snapshot.text,
                });
            },
        });
        pendingToolResponses = undefined;
        pendingFinalAnswerReminderText = '';
        finalProvider = String(result.provider || finalProvider || '');
        finalModel = String(result.model || finalModel || '');
        finalFinishReason = String(result.finishReason || finalFinishReason || '');
        finalProviderPayload = result.providerPayload;
        finalRequestSnapshot = result.requestSnapshot || finalRequestSnapshot;

        const prefaceText = String(result.text || '');
        const toolCalls = Array.isArray(result.toolCalls) ? result.toolCalls : [];
        if (!toolCalls.length) {
            if (!hasVisibleText(prefaceText) && sawToolExecution && !finalAnswerReminderSent) {
                finalAnswerReminderSent = true;
                const reminder = 'All required action checks are complete. Do not call more tools. Finish the assistant reply now.';
                if (supportsSessionToolLoop) {
                    pendingFinalAnswerReminderText = reminder;
                } else {
                    protocolMessages.push({ role: 'system', content: reminder });
                }
                continue;
            }
            if (!hasVisibleText(prefaceText) && sawToolExecution) {
                throw new Error('模型在检定后没有给出有效结论。');
            }
            finalText += prefaceText;
            finalThoughts = result.thoughts;
            return {
                ...result,
                text: finalText,
                thoughts: finalThoughts,
                provider: finalProvider,
                model: finalModel,
                finishReason: finalFinishReason,
                providerPayload: finalProviderPayload,
                requestSnapshot: finalRequestSnapshot,
                runtimeEvents,
            };
        }

        if (round > MAX_ACTION_CHECK_ROUNDS) {
            throw new Error('action_check_tool_round_limit_exceeded');
        }

        sawToolExecution = true;
        finalText += prefaceText;
        const insertAfterChars = finalText.length;
        const assistantToolMessage = buildProviderAssistantToolCallMessage({
            text: prefaceText,
            providerPayload: result.providerPayload,
        }, toolCalls, {
            fallbackPrefix: 'tavern-rp-tool',
        }) as unknown as XbTavernMessage;
        assistantToolMessage.thoughts = result.thoughts;
        protocolMessages.push(assistantToolMessage);

        const toolResponses: TavernToolLoopResponse[] = [];
        toolCalls.forEach((toolCall) => {
            const args = safeJsonParse(toolCall.arguments, {});
            const toolResult = toolCall.name === ACTION_CHECK_TOOL_NAME
                ? executeTavernActionCheck(args, {
                    rollDie: input.actionCheckRoll,
                    rollPercent: input.actionCheckPercentRoll,
                    statusDocument: input.statusDocument,
                })
                : buildDeniedActionCheckToolResult(toolCall.name);
            if (toolResult.ok) {
                const eventInsertAfterChars = resolveActionCheckInsertAfterChars(finalText, toolResult, insertAfterChars);
                runtimeEvents.push(createActionCheckEvent({
                    action: toolResult.action,
                    character: toolResult.character,
                    stat: toolResult.stat,
                    difficulty: toolResult.difficulty,
                    difficultyLabel: toolResult.difficultyLabel,
                    mode: toolResult.mode,
                    roll: toolResult.roll,
                    threshold: toolResult.threshold,
                    statValue: toolResult.statValue,
                    statMax: toolResult.statMax,
                    success: toolResult.success,
                    outcome: toolResult.outcome,
                    insertAfterChars: eventInsertAfterChars,
                    toolCallId: String(toolCall.id || ''),
                    summary: summarizeActionCheckResult(toolResult),
                    stakes: toolResult.stakes,
                }));
                input.onStreamProgress?.({
                    text: finalText,
                    liveActionCheckEvents: runtimeEvents.map((event) => ({ ...event })),
                });
            }
            toolResponses.push({
                id: String(toolCall.id || ''),
                name: String(toolCall.name || ''),
                response: toolResult,
                ...(Object.prototype.hasOwnProperty.call(toolCall, 'providerId')
                    ? { providerId: String(toolCall.providerId || '') }
                    : {}),
            });
            protocolMessages.push(buildProviderToolResultMessage({
                toolCallId: String(toolCall.id || ''),
                toolName: String(toolCall.name || ''),
                content: safeJsonStringify(toolResult),
            }) as unknown as XbTavernMessage);
        });
        if (supportsSessionToolLoop) {
            pendingToolResponses = toolResponses;
        }
    }

    throw new Error('action_check_tool_round_limit_exceeded');
}

function resolveRunOnceSessionToolLoopSupport(
    _agentConfig: Record<string, unknown>,
    executeRunOnce: TavernRunOnceExecutor,
): boolean {
    return executeRunOnce?.supportsSessionToolLoop === true;
}

interface QueuedAcceptedTurnManagerScheduleInput {
    sessionId: string;
    agentConfig: Record<string, unknown>;
    assistantPreset?: TavernAssistantPreset;
    sessionContract: TavernSessionContract;
    executeManagerOnce?: (options: XbTavernManagerOnceOptions) => Promise<XbTavernManagerOnceResult>;
    onManagerRunSaved?: (
        sessionId: string,
        managerRun: TavernManagerRunRecord,
    ) => void | Promise<void>;
    onManagerProgress?: (progress: TavernManagerLiveProgress) => void | Promise<void>;
}

const queuedAcceptedTurnManagerWorkers = new Map<string, Promise<void>>();
const queuedAcceptedTurnManagerRecoveryTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearQueuedAcceptedTurnManagerRecoveryTimer(sessionId: string): void {
    const timer = queuedAcceptedTurnManagerRecoveryTimers.get(sessionId);
    if (!timer) {return;}
    clearTimeout(timer);
    queuedAcceptedTurnManagerRecoveryTimers.delete(sessionId);
}

function scheduleQueuedAcceptedTurnManagerLeaseRecovery(
    input: QueuedAcceptedTurnManagerScheduleInput,
    leaseExpiresAt = 0,
): void {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return;}
    clearQueuedAcceptedTurnManagerRecoveryTimer(sessionId);
    const deadline = Number(leaseExpiresAt) || Date.now() + 30000;
    const delay = Math.max(250, deadline - Date.now() + 50);
    const timer = setTimeout(() => {
        if (queuedAcceptedTurnManagerRecoveryTimers.get(sessionId) !== timer) {return;}
        queuedAcceptedTurnManagerRecoveryTimers.delete(sessionId);
        scheduleQueuedAcceptedTurnManager(input);
    }, delay);
    (timer as unknown as { unref?: () => void }).unref?.();
    queuedAcceptedTurnManagerRecoveryTimers.set(sessionId, timer);
}

function scheduleQueuedAcceptedTurnManager(input: QueuedAcceptedTurnManagerScheduleInput): void {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return;}
    if (queuedAcceptedTurnManagerWorkers.has(sessionId)) {return;}
    clearQueuedAcceptedTurnManagerRecoveryTimer(sessionId);
    const run = Promise.resolve()
        .then(async (): Promise<void> => {
            for (;;) {
                await recoverInterruptedAcceptedTurnManagerRuns({
                    sessionId,
                    onManagerRunSaved: async (managerRun) => {
                        await notifyRunCallback(() => input.onManagerRunSaved?.(sessionId, managerRun));
                    },
                });
                const result = await runNextQueuedAcceptedTurnManager({
                    sessionId,
                    agentConfig: input.agentConfig,
                    assistantPreset: input.assistantPreset,
                    sessionContract: input.sessionContract,
                    executeManagerOnce: input.executeManagerOnce,
                    onManagerProgress: input.onManagerProgress,
                    onManagerRunSaved: async (managerRun) => {
                        await notifyRunCallback(() => input.onManagerRunSaved?.(sessionId, managerRun));
                    },
                });
                if (!result) {
                    const queue = await getAcceptedTurnManagerQueueState(sessionId);
                    if (queue.queued && !queue.running) {continue;}
                    if (queue.running) {
                        scheduleQueuedAcceptedTurnManagerLeaseRecovery(input, queue.nextLeaseExpiresAt);
                    }
                    break;
                }
                if (result.ok && result.managerRun.status === 'completed') {
                    throw new Error('manager_completed_before_accepted_snapshot');
                }
                if (result.ok && result.managerRun.status === 'running') {
                    const domains = resolveTavernAcceptedStateSnapshotDomains({
                        changedFiles: result.changedFiles,
                        changedStates: result.changedStates,
                    });
                    try {
                        const completed = await completeAcceptedTurnManagerRunWithSnapshot({
                            sessionId,
                            managerRunId: result.managerRun.id,
                            floor: result.managerRun.assistantOrder,
                            domains,
                            stagedTaskActions: result.stagedTaskActions,
                            leaseOwnerId: String(result.managerRun.leaseOwnerId || ''),
                        });
                        await notifyRunCallback(() => input.onManagerRunSaved?.(sessionId, completed));
                    } catch (error) {
                        const errorText = error instanceof Error ? error.message : String(error || 'manager_accepted_snapshot_failed');
                        const failed = await failAndRollbackAcceptedTurnManagerRun(
                            result.managerRun.id,
                            `manager_accepted_snapshot_failed:${errorText}`,
                            String(result.managerRun.leaseOwnerId || ''),
                            resolveTavernManagerFailureStatus(error),
                        );
                        if (failed) {
                            await notifyRunCallback(() => input.onManagerRunSaved?.(sessionId, failed));
                        }
                    }
                }
            }
        })
        .catch(async (error): Promise<void> => {
            console.warn('[小白酒馆] accepted-turn manager background task failed', error);
        })
        .finally(async () => {
            if (queuedAcceptedTurnManagerWorkers.get(sessionId) === run) {
                queuedAcceptedTurnManagerWorkers.delete(sessionId);
                const queue = await getAcceptedTurnManagerQueueState(sessionId).catch(() => ({ queued: 0, running: 0, nextLeaseExpiresAt: 0 }));
                if (queue.queued && !queue.running) {
                    scheduleQueuedAcceptedTurnManager(input);
                } else if (queue.running) {
                    scheduleQueuedAcceptedTurnManagerLeaseRecovery(input, queue.nextLeaseExpiresAt);
                } else {
                    clearQueuedAcceptedTurnManagerRecoveryTimer(sessionId);
                }
            }
        });
    queuedAcceptedTurnManagerWorkers.set(sessionId, run);
}

export function resumeQueuedAcceptedTurnManagers(input: {
    sessionId: string;
    agentConfig: Record<string, unknown>;
    assistantPreset?: TavernAssistantPreset;
    sessionContract: TavernSessionContract;
    executeManagerOnce?: (options: XbTavernManagerOnceOptions) => Promise<XbTavernManagerOnceResult>;
    onManagerRunSaved?: (
        sessionId: string,
        managerRun: TavernManagerRunRecord,
    ) => void | Promise<void>;
    onManagerProgress?: (progress: TavernManagerLiveProgress) => void | Promise<void>;
}): void {
    scheduleQueuedAcceptedTurnManager(input);
}

export async function waitForQueuedAcceptedTurnManagers(sessionId = ''): Promise<void> {
    const target = String(sessionId || '').trim();
    for (;;) {
        const queues = target
            ? [queuedAcceptedTurnManagerWorkers.get(target)].filter(Boolean) as Promise<void>[]
            : [...queuedAcceptedTurnManagerWorkers.values()];
        if (!queues.length) {return;}
        await Promise.allSettled(queues);
    }
}

export async function runXbTavernTurn(input: XbTavernRunTurnInput): Promise<XbTavernRunResult> {
    notifyRunStatus(input.onRuntimeStatus, '同步状态');
    assertNativePromptRuntimeHooks(input);
    const chatPreset = resolveInputChatPreset(input);
    if (!input.sessionId) {
        assertUsableTavernContext(input.contextSnapshot || {});
    }
    const baseSession = await ensureRunSession(input);
    const liveContext = resolveSessionContext(baseSession, input.contextSnapshot);
    assertUsableTavernContext(liveContext);
    const rerollPreparation = input.rerollLatestAssistant
        ? await prepareTavernLatestAssistantReroll(baseSession.id)
        : null;
    const persistedSessionState = normalizeTavernSessionState(
        rerollPreparation?.runtimeState || baseSession.state || input.runtimeState || {},
    );
    const persistedSessionContract = resolveSessionContract(persistedSessionState);
    const turnDiagnostics: TavernDiagnostics = {
        ...(input.diagnostics || {}),
    };
    const reusedUserMessage = rerollPreparation?.userMessage || null;
    const sessionState = normalizeRuntimeSessionStateWithContract(persistedSessionState, persistedSessionState.contract);
    if (rerollPreparation) {
        await notifyRunCallback(() => input.onLatestAssistantRerollPrepared?.(
            baseSession.id,
            rerollPreparation.userMessage,
            rerollPreparation.previousAssistantMessage,
        ));
    } else {
        await saveAcceptedStateSnapshot(baseSession.id);
    }
    notifyRunStatus(input.onRuntimeStatus, '整理历史');
    const sessionContract = resolveSessionContract(sessionState);
    const sessionContractRuntime = resolveTavernSessionContractRuntime(sessionContract);
    const actionCheckCapabilities = buildActionCheckCapabilities(sessionContractRuntime);
    const shouldReplaceSessionState = !!rerollPreparation;
    const rawCurrentUserMessage = String(reusedUserMessage?.content || input.currentUserMessage || '');
    const initialPresetId = String(chatPreset.id || baseSession.chatPresetId || baseSession.presetId || '');
    const initialPresetName = String(chatPreset.name || baseSession.chatPresetName || baseSession.presetName || '');
    let confirmedManagerRunId = '';
    let confirmedManagerStatus = '';
    let userMessage = reusedUserMessage;
    if (!userMessage) {
        const appended = await appendTavernUserMessageAndConfirmManagerCandidate(baseSession.id, {
            role: 'user',
            content: rawCurrentUserMessage,
            runtimeStateSnapshot: createTavernTurnStateSnapshot(persistedSessionState),
            contextSnapshot: liveContext,
            chatPresetId: initialPresetId,
            chatPresetName: initialPresetName,
            presetId: initialPresetId,
            presetName: initialPresetName,
        }, {
            confirmManagerCandidate: input.runManager === true,
        });
        userMessage = appended.userMessage;
        const confirmedManagerRun = appended.managerRun;
        confirmedManagerRunId = String(confirmedManagerRun?.id || '');
        confirmedManagerStatus = String(confirmedManagerRun?.status || '');
        await notifyRunCallback(() => input.onUserMessageSaved?.(baseSession.id, userMessage as TavernMessageRecord));
        if (confirmedManagerRun) {
            await notifyRunCallback(() => input.onManagerRunSaved?.(baseSession.id, confirmedManagerRun));
        }
        if (input.runManager === true && confirmedManagerRun) {
            scheduleQueuedAcceptedTurnManager({
                sessionId: baseSession.id,
                agentConfig: input.agentConfig,
                assistantPreset: input.assistantPreset,
                sessionContract: persistedSessionContract,
                executeManagerOnce: input.executeManagerOnce,
                onManagerProgress: input.onManagerProgress,
                onManagerRunSaved: input.onManagerRunSaved,
            });
        }
    }
    const regexApplications: TavernRegexApplicationSummary = {};
    const inputRegex = reusedUserMessage
        ? { text: rawCurrentUserMessage, summary: undefined }
        : await runTavernStage('turn_user_input_regex', () => applySingleTavernRegex({
            applyRegex: input.applyRegex,
            placement: 'userInput',
            id: 'turn',
            text: rawCurrentUserMessage,
        }));
    addRegexSummary(regexApplications, inputRegex.summary);
    const substituteOptions = buildSubstituteParamsOptions(liveContext);
    const storedUserMessage = reusedUserMessage
        ? inputRegex.text
        : await runTavernStage('turn_user_input_substitute', () => applySingleTavernSubstituteParams({
            applySubstituteParams: input.applySubstituteParams,
            id: 'userInput:turn',
            text: inputRegex.text,
            options: substituteOptions,
        }));
    const currentUserMessage = stripTavernImageMarkers(storedUserMessage);
    if (userMessage && !reusedUserMessage && userMessage.content !== storedUserMessage) {
        userMessage = await updateTavernMessage(baseSession.id, userMessage.order, {
            content: storedUserMessage,
        }) || userMessage;
        await notifyRunCallback(() => input.onUserMessageSaved?.(baseSession.id, userMessage as TavernMessageRecord));
    }
    const contextWindow = await loadTavernPromptHistoryWindow({
        sessionId: baseSession.id,
        contextWindowStartOrder: sessionState.contextWindowStartOrder,
        currentUserMessage,
        beforeOrder: userMessage?.order,
    });
    const historyMessages = contextWindow.historyMessages;
    const communicationEvents = await runTavernStage(
        'turn_phone_timeline',
        () => loadCommunicationEventsForHistory(
            baseSession.id,
            historyMessages,
            liveContext.user?.name || '',
        ),
    );
    const cooldownMessages = reusedUserMessage
        ? await listLatestTavernUserMessagesBefore(baseSession.id, reusedUserMessage.order, RANDOM_ENCOUNTER_COOLDOWN_TURNS)
        : await listLatestTavernUserMessagesBefore(baseSession.id, userMessage?.order ?? Number.POSITIVE_INFINITY, RANDOM_ENCOUNTER_COOLDOWN_TURNS);
    const chanceEncounterEvent = resolveRandomEncounterForTurn({
        runtime: sessionContractRuntime,
        sessionMessages: cooldownMessages,
        historyMessages: reusedUserMessage ? cooldownMessages : historyMessages,
        reusedUserMessage,
        rerollRuntimeEvents: input.rerollRuntimeEvents,
        randomEncounterRoll: input.randomEncounterRoll,
    });
    if (userMessage && !reusedUserMessage && chanceEncounterEvent) {
        userMessage = await updateTavernMessage(baseSession.id, userMessage.order, {
            runtimeEvents: [chanceEncounterEvent],
        }) || userMessage;
        await notifyRunCallback(() => input.onUserMessageSaved?.(baseSession.id, userMessage as TavernMessageRecord));
    }
    const generationTrigger = String(input.generationTrigger || (reusedUserMessage ? 'regenerate' : 'normal'));
    const contextForBuildRaw: XbTavernContext = {
        ...liveContext,
        worldSettings: {
            ...(liveContext.worldSettings || {}),
            trigger: generationTrigger,
        },
        history: buildContextHistory(contextWindow.historyMessages, communicationEvents),
    };
    notifyRunStatus(input.onRuntimeStatus, '构建请求');
    const nativeContext = await runTavernStage('turn_native_worldbook_runtime', () => injectNativeWorldInfoRuntime({
        getNativeWorldInfoRuntime: input.getNativeWorldInfoRuntime,
        context: contextForBuildRaw,
        currentUserMessage,
        trigger: generationTrigger,
        timedState: sessionState.nativeWorldInfoTimedState,
    }));
    const contextForBuild = await runTavernStage('turn_world_entry_substitute', () => substituteContextWorldEntriesForPrompt({
        applySubstituteParams: input.applySubstituteParams,
        context: nativeContext.context,
        options: substituteOptions,
    }));
    const memoryQuery = await runTavernStage('turn_memory_query', () => buildXbTavernMemoryQuery(contextForBuild, currentUserMessage));
    const retrievedMemoryContext = (sessionContractRuntime.includeMemoryFiles || sessionContractRuntime.includeStructuredStates)
        ? await runTavernStage('turn_memory_retrieval', () => retrieveXbTavernMemoryContext({
            sessionId: baseSession.id,
            queryText: memoryQuery,
            ignoredTerms: buildXbTavernMemoryIgnoredTerms(contextForBuild),
            includeMemoryFiles: sessionContractRuntime.includeMemoryFiles,
            includeStructuredStates: sessionContractRuntime.includeStructuredStates,
        }))
        : undefined;
    const statusPromptContext = await runTavernStage('turn_status_panel_prompt', () => buildStatusPanelPromptContext(baseSession.id, sessionContractRuntime));
    const statusPanelYaml = statusPromptContext.statusPanelYaml;
    const memoryContext: XbTavernMemoryContext | undefined = retrievedMemoryContext || statusPanelYaml
        ? {
            ...(retrievedMemoryContext || {}),
            ...(statusPanelYaml ? { statusPanelYaml } : {}),
        }
        : undefined;
    const filteredMemoryContext = filterMemoryContextByRuntime(memoryContext, sessionContractRuntime);
    const taskDepthEntries = await runTavernStage('turn_task_context', () => buildTavernStoryTaskDepthEntries(baseSession.id, {
        atAnchorOrder: userMessage?.order ?? contextWindow.historyMessages.at(-1)?.order ?? -1,
    }));
    const shopDepthEntries = await runTavernStage('turn_shop_context', () => buildTavernShopRuntimeDepthEntries({
        sessionId: baseSession.id,
        currentTurn: sessionState.turn,
        atAnchorOrder: userMessage?.order ?? contextWindow.historyMessages.at(-1)?.order ?? -1,
    }));
    const runtimeProtocolMessages = buildRuntimeProtocolMessages(sessionContractRuntime, {
        includePhoneCommunication: communicationEvents.length > 0,
    });
    const brain = await runTavernStage('turn_brain_build', () => buildXbTavernBrainAsync({
        context: contextForBuild,
        chatPreset,
        currentUserMessage,
        historyMode: input.historyMode || 'raw',
        turn: sessionState.turn,
        entryStates: sessionState.worldEntryStates,
        memoryContext: filteredMemoryContext,
        runtimeDepthEntries: [
            ...taskDepthEntries,
            ...buildChanceEncounterDepthEntries(chanceEncounterEvent),
            ...shopDepthEntries,
        ],
        runtimeProtocolMessages,
        diagnostics: turnDiagnostics,
        regexApplications,
        transformConversationMessages: async (messages) => {
            const substitutedMessages = await applyPromptSubstitutionToMessages({
                applySubstituteParams: input.applySubstituteParams,
                messages,
                options: substituteOptions,
            });
            const applied = await applyPromptRegexToConversationMessages({
                applyRegex: input.applyRegex,
                messages: substitutedMessages,
            });
            addRegexSummary(regexApplications, applied.summary);
            return applied.messages;
        },
        transformFinalMessages: async (messages) => applyPromptSubstitutionToMessages({
            applySubstituteParams: input.applySubstituteParams,
            messages,
            options: substituteOptions,
        }),
        transformWorldEntries: async (entries) => {
            const hasNativeWorldInfo = !!contextForBuild.nativeWorldInfo;
            const regexEntries = entries.filter((entry) => shouldApplyWorldInfoRegexToEntry(entry, hasNativeWorldInfo));
            const applied = await applyTavernRegexItems(input.applyRegex, regexEntries.map((entry) => ({
                id: `worldInfo:${entry.activationKey}`,
                text: entry.content,
                placement: 'worldInfo',
                options: {
                    isMarkdown: false,
                    isPrompt: true,
                    depth: entry.position === XBTavernWorldPosition.atDepth ? entry.depth : null,
                },
            })));
            addRegexSummary(regexApplications, countRegexApplications(applied));
            const byId = new Map(applied.map((item) => [item.id, item]));
            return entries.map((entry) => {
                const item = byId.get(`worldInfo:${entry.activationKey}`);
                const content = item?.text ?? entry.content;
                return {
                    ...entry,
                    content,
                    contentChars: content.length,
                };
            });
        },
    }));
    const nativePromptConversation = input.buildNativeChatPrompt
        ? await runTavernStage('turn_native_prompt_conversation_transform', () => applyNativePromptConversationTransforms({
            applyRegex: input.applyRegex,
            applySubstituteParams: input.applySubstituteParams,
            context: contextForBuild,
            currentUserMessage,
            substituteOptions,
        }))
        : {
            context: contextForBuild,
            currentUserMessage,
        };
    const { buildResult, buildSnapshot } = await applyNativeChatPromptBuild({
        stage: 'turn_native_prompt_build',
        buildNativeChatPrompt: input.buildNativeChatPrompt,
        contextForBuild: nativePromptConversation.context,
        chatPreset,
        baseBuildResult: brain.buildResult,
        baseBuildSnapshot: brain.buildSnapshot,
        currentUserMessage: nativePromptConversation.currentUserMessage,
        generationType: generationTrigger,
        signal: input.signal,
        memoryContext: filteredMemoryContext,
        chancePrompt: chanceEncounterEvent ? buildChanceEncounterPromptMessage().content : '',
        runtimeDepthPrompts: [...taskDepthEntries, ...shopDepthEntries],
        runtimeProtocolMessages,
        finalizeNativeMessages: (messages, currentUserMessageIndex) => placeTavernShopPromptBlockBeforeCurrentUser(
            messages,
            shopDepthEntries[0]?.content || '',
            currentUserMessageIndex,
        ),
        diagnostics: turnDiagnostics,
    });
    const sessionSnapshot = {
        contextSnapshot: liveContext,
        buildSnapshot,
        chatPresetId: String(chatPreset.id || baseSession.chatPresetId || baseSession.presetId || ''),
        chatPresetName: String(chatPreset.name || baseSession.chatPresetName || baseSession.presetName || ''),
        presetId: String(chatPreset.id || baseSession.presetId || ''),
        presetName: String(chatPreset.name || baseSession.presetName || ''),
    };
    const session = rerollPreparation
        ? baseSession
        : await updateTavernSessionSnapshot(baseSession.id, sessionSnapshot) || baseSession;
    let latestStreamText = '';
    let sawStreamProgress = false;
    const handleStreamProgress = (snapshot: TavernRunStreamSnapshot) => {
        if (!sawStreamProgress) {
            sawStreamProgress = true;
            notifyRunStatus(input.onRuntimeStatus, '接收回复');
        }
        if (typeof snapshot.text === 'string') {latestStreamText = snapshot.text;}
        input.onStreamProgress?.(snapshot);
    };

    let requestSnapshot = buildTavernRequestSnapshot(input.agentConfig, buildResult.messages, {
        chatPreset,
        regexApplications,
        promptDiagnostics: buildSnapshot.diagnostics as Record<string, unknown> | undefined,
    });
    try {
        requestSnapshot = (await inspectTavernRequest({
            agentConfig: input.agentConfig,
            messages: buildResult.messages,
            chatPreset,
            tools: actionCheckCapabilities.tools,
            toolChoice: actionCheckCapabilities.toolChoice,
            onStreamProgress: handleStreamProgress,
            requestKind: 'actual',
            regexApplications,
            promptDiagnostics: buildSnapshot.diagnostics as Record<string, unknown> | undefined,
        })).requestSnapshot;
    } catch (error) {
        requestSnapshot = buildTavernRequestSnapshot(input.agentConfig, buildResult.messages, {
            requestKind: 'actual',
            chatPreset,
            regexApplications,
            promptDiagnostics: buildSnapshot.diagnostics as Record<string, unknown> | undefined,
            requestInspectionError: error instanceof Error ? error.message : String(error || 'request_inspection_failed'),
            requestTask: {
                messages: buildResult.messages,
                tools: actionCheckCapabilities.tools,
                toolChoice: actionCheckCapabilities.toolChoice,
            },
        });
    }
    const presetId = String(chatPreset.id || session.chatPresetId || session.presetId || '');
    const presetName = String(chatPreset.name || session.chatPresetName || session.presetName || '');
    const existingEncounter = getChanceEncounterEvent(userMessage?.runtimeEvents);
    const userMessagePatch = {
        contextSnapshot: liveContext,
        buildSnapshot,
        chatPresetId: presetId,
        chatPresetName: presetName,
        presetId,
        presetName,
        requestSnapshot,
        runtimeEvents: !existingEncounter && chanceEncounterEvent
            ? [chanceEncounterEvent]
            : userMessage?.runtimeEvents || [],
    };
    if (userMessage && !rerollPreparation) {
        userMessage = await updateTavernMessage(session.id, userMessage.order, {
            ...userMessagePatch,
        }) || userMessage;
    }
    if (!userMessage) {
        throw new Error('user_message_save_failed');
    }
    if (!rerollPreparation) {
        await notifyRunCallback(() => input.onUserMessageSaved?.(session.id, userMessage));
    }

    try {
        const executeRunOnce = input.executeRunOnce || createDefaultTavernRunOnceExecutor(input.agentConfig);
        notifyRunStatus(input.onRuntimeStatus, '请求模型');
        const result = sessionContractRuntime.includeActionChecks
            ? await runTavernActionCheckLoop({
                agentConfig: input.agentConfig,
                messages: buildResult.messages,
                chatPreset,
                regexApplications,
                promptDiagnostics: buildSnapshot.diagnostics as Record<string, unknown> | undefined,
                signal: input.signal,
                onStreamProgress: handleStreamProgress,
                executeRunOnce,
                actionCheckRoll: input.actionCheckRoll,
                actionCheckPercentRoll: input.actionCheckPercentRoll,
                statusDocument: statusPromptContext.statusDocument,
            })
            : await executeRunOnce({
                agentConfig: input.agentConfig,
                messages: buildResult.messages,
                chatPreset,
                regexApplications,
                promptDiagnostics: buildSnapshot.diagnostics as Record<string, unknown> | undefined,
                signal: input.signal,
                onStreamProgress: handleStreamProgress,
            });
        notifyRunStatus(input.onRuntimeStatus, '保存回复');
        const rawAssistantRuntimeEvents = sessionContractRuntime.includeActionChecks
            ? getActionCheckEvents((result as TavernRunOnceResult & { runtimeEvents?: TavernRuntimeEvent[] }).runtimeEvents)
            : [];
        const regexMarkerPayload = injectActionCheckRegexMarkers(result.text, rawAssistantRuntimeEvents);
        const outputRegex = await applySingleTavernRegex({
            applyRegex: input.applyRegex,
            placement: 'aiOutput',
            id: 'assistant',
            text: regexMarkerPayload.text,
        });
        const reasoningRegex = await applyReasoningRegex({
            applyRegex: input.applyRegex,
            thoughts: result.thoughts,
        });
        addRegexSummary(regexApplications, outputRegex.summary);
        addRegexSummary(regexApplications, reasoningRegex.summary);
        const normalizedOutput = extractActionCheckRegexMarkers(
            outputRegex.text,
            rawAssistantRuntimeEvents,
            regexMarkerPayload.boundaries,
        );
        if (normalizedOutput.text !== result.text || reasoningRegex.thoughts !== result.thoughts) {
            input.onStreamProgress?.({
                text: normalizedOutput.text,
                thoughts: reasoningRegex.thoughts,
                liveActionCheckEvents: normalizedOutput.events.map((event) => ({ ...event })),
            });
        }
        const assistantRuntimeEvents = normalizedOutput.events;
        const assistantRequestSnapshot: TavernRequestSnapshot = {
            ...result.requestSnapshot,
            regexApplications,
        };
        const nextTurn = Number(sessionState.turn || 0) + 1;
        const nextSessionState = {
            turn: nextTurn,
            contextWindowStartOrder: contextWindow.contextWindowStartOrder,
            worldEntryStates: mergeBuildWorldEntryStateUpdates(sessionState, buildResult, shouldReplaceSessionState),
            nativeWorldInfoTimedState: contextForBuild.nativeWorldInfo
                ? nativeContext.timedState
                : normalizeNativeWorldInfoTimedState(sessionState.nativeWorldInfoTimedState),
            lastBuildSnapshot: buildSnapshot,
            lastRequestSnapshot: assistantRequestSnapshot,
            lastProvider: result.provider || '',
            lastModel: result.model || '',
        } satisfies Partial<TavernSessionState>;
        const assistantFinishReason = String(result.finishReason || '').trim();
        if (rerollPreparation && ['aborted', 'error'].includes(assistantFinishReason)) {
            throw new Error(assistantFinishReason === 'aborted'
                ? '已停止重 roll，原回复已保留。'
                : '重 roll 未完成，原回复已保留。');
        }
        const canRunManager = input.runManager === true
            && !['aborted', 'error'].includes(assistantFinishReason);
        const hasTaskManagerWork = canRunManager
            ? await hasMaintainableTavernTasksAtAnchor(session.id, userMessage.order + 1)
            : false;
        const assistantMessageInput = {
            role: 'assistant',
            content: normalizedOutput.text,
            thoughts: reasoningRegex.thoughts,
            providerPayload: result.providerPayload,
            contextSnapshot: liveContext,
            buildSnapshot,
            chatPresetId: presetId,
            chatPresetName: presetName,
            presetId,
            presetName,
            requestSnapshot: assistantRequestSnapshot,
            provider: result.provider || '',
            model: result.model || '',
            finishReason: result.finishReason || '',
            runtimeEvents: assistantRuntimeEvents,
        } as const;
        const commitOptions = {
            sessionState: nextSessionState,
            replaceSessionState: shouldReplaceSessionState,
            ...(rerollPreparation ? { userMessagePatch, sessionSnapshot } : {}),
            ...(canRunManager && (sessionContractRuntime.hasAutomaticManagerWork || hasTaskManagerWork) ? {
                managerCandidate: {
                    turn: nextTurn,
                    inputSummary: `turn ${nextTurn}; messages ${userMessage.order}/${userMessage.order + 1}; user ${userMessage.content.length} chars`,
                },
            } : {}),
        };
        const committed = rerollPreparation?.mode === 'replace_assistant'
            ? await commitTavernLatestAssistantReroll(
                session.id,
                rerollPreparation.userMessage,
                rerollPreparation.previousAssistantMessage,
                rerollPreparation.candidate,
                assistantMessageInput,
                commitOptions,
            )
            : await commitTavernAssistantResponseForLatestUser(
                session.id,
                userMessage,
                assistantMessageInput,
                commitOptions,
            );
        const assistantMessage = committed.assistantMessage;
        await notifyRunCallback(() => input.onAssistantMessageSaved?.(session.id, assistantMessage));
        return {
            sessionId: session.id,
            userMessage,
            assistantMessage,
            buildResult,
            buildSnapshot,
            requestSnapshot: assistantRequestSnapshot,
            provider: result.provider || '',
            model: result.model || '',
            finishReason: result.finishReason,
            previewMatchesRequest: buildResult.meta.rawMessagesJson === assistantRequestSnapshot.rawMessagesJson,
            nextTurn,
            managerRunId: confirmedManagerRunId,
            managerStatus: confirmedManagerStatus,
        };
    } catch (error) {
        if (rerollPreparation) {throw error;}
        const commitError = error instanceof Error ? error.message : String(error || '');
        if (['assistant_timeline_advanced', 'assistant_candidate_conflict'].includes(commitError)) {
            throw error;
        }
        const failedRequestSnapshot = (error as { requestSnapshot?: TavernRequestSnapshot } | null)?.requestSnapshot;
        if (failedRequestSnapshot) {
            requestSnapshot = {
                ...failedRequestSnapshot,
                regexApplications,
            };
        }
        const aborted = isAbortLikeError(error, input.signal);
        const partialText = String(latestStreamText || '').trim();
        if (aborted && partialText) {
            const partialRegex = await applySingleTavernRegex({
                applyRegex: input.applyRegex,
                placement: 'aiOutput',
                id: 'assistant-partial',
                text: partialText,
            });
            addRegexSummary(regexApplications, partialRegex.summary);
            if (hasRegexApplications(regexApplications)) {
                requestSnapshot = {
                    ...requestSnapshot,
                    regexApplications,
                };
            }
            if (partialRegex.text !== partialText) {
                input.onStreamProgress?.({ text: partialRegex.text });
            }
            const nextTurn = Number(sessionState.turn || 0) + 1;
            const committed = await commitTavernAssistantResponseForLatestUser(
                session.id,
                userMessage,
                {
                    role: 'assistant',
                    content: partialRegex.text,
                    error: false,
                    contextSnapshot: liveContext,
                    buildSnapshot,
                    chatPresetId: presetId,
                    chatPresetName: presetName,
                    presetId,
                    presetName,
                    requestSnapshot,
                    provider: requestSnapshot.provider,
                    model: requestSnapshot.model,
                    finishReason: 'aborted',
                },
                {
                    replaceSessionState: shouldReplaceSessionState,
                    sessionState: {
                        turn: nextTurn,
                        contextWindowStartOrder: contextWindow.contextWindowStartOrder,
                        worldEntryStates: mergeBuildWorldEntryStateUpdates(sessionState, buildResult, shouldReplaceSessionState),
                        nativeWorldInfoTimedState: contextForBuild.nativeWorldInfo
                            ? nativeContext.timedState
                            : normalizeNativeWorldInfoTimedState(sessionState.nativeWorldInfoTimedState),
                        lastBuildSnapshot: buildSnapshot,
                        lastRequestSnapshot: requestSnapshot,
                        lastProvider: requestSnapshot.provider,
                        lastModel: requestSnapshot.model,
                    },
                },
            );
            const errorMessage = committed.assistantMessage;
            await notifyRunCallback(() => input.onAssistantMessageSaved?.(session.id, errorMessage));
            return {
                sessionId: session.id,
                userMessage,
                assistantMessage: errorMessage,
                buildResult,
                buildSnapshot,
                requestSnapshot,
                provider: requestSnapshot.provider,
                model: requestSnapshot.model,
                finishReason: 'aborted',
                previewMatchesRequest: buildResult.meta.rawMessagesJson === requestSnapshot.rawMessagesJson,
                nextTurn,
                managerRunId: '',
                managerStatus: '',
            };
        }
        const errorText = formatTavernRunErrorMessage(error instanceof Error ? error.message : String(error || 'run_failed'));
        const committed = await commitTavernAssistantResponseForLatestUser(
            session.id,
            userMessage,
            {
                role: 'assistant',
                content: aborted ? '已停止生成。' : errorText,
                error: true,
                contextSnapshot: liveContext,
                buildSnapshot,
                chatPresetId: presetId,
                chatPresetName: presetName,
                presetId,
                presetName,
                requestSnapshot,
                provider: requestSnapshot.provider,
                model: requestSnapshot.model,
                finishReason: aborted ? 'aborted' : 'error',
            },
            {
                replaceSessionState: shouldReplaceSessionState,
                sessionState: {
                    turn: Number(sessionState.turn || 0),
                    contextWindowStartOrder: contextWindow.contextWindowStartOrder,
                    worldEntryStates: shouldReplaceSessionState ? sessionState.worldEntryStates || {} : {},
                    nativeWorldInfoTimedState: normalizeNativeWorldInfoTimedState(sessionState.nativeWorldInfoTimedState),
                    lastBuildSnapshot: buildSnapshot,
                    lastRequestSnapshot: requestSnapshot,
                    lastProvider: requestSnapshot.provider,
                    lastModel: requestSnapshot.model,
                    lastError: aborted ? '已停止生成。' : errorText,
                },
            },
        );
        const errorMessage = committed.assistantMessage;
        await notifyRunCallback(() => input.onAssistantMessageSaved?.(session.id, errorMessage));
        return {
            sessionId: session.id,
            userMessage,
            errorMessage,
            buildResult,
            buildSnapshot,
            requestSnapshot,
            provider: requestSnapshot.provider,
            model: requestSnapshot.model,
            finishReason: aborted ? 'aborted' : 'error',
            previewMatchesRequest: buildResult.meta.rawMessagesJson === requestSnapshot.rawMessagesJson,
            nextTurn: Number(sessionState.turn || 0),
            error: aborted ? '已停止生成。' : errorText,
        };
    }
}

function createDefaultTavernRunOnceExecutor(agentConfig: Record<string, unknown>): TavernRunOnceExecutor {
    const providerConfig = assertXbTavernProviderReady(agentConfig);
    const adapter = createAgentAdapter(providerConfig as unknown as Record<string, unknown>, {
        missingApiKeyMessage: '请先在 API 配置里选择模型/填写 Key。',
    }) as TavernChatAdapter;
    const execute = ((options: TavernRunOnceOptions) => runTavernOnceWithAdapter(adapter, providerConfig, options)) as TavernRunOnceExecutor;
    execute.supportsSessionToolLoop = adapter.supportsSessionToolLoop === true;
    return execute;
}
