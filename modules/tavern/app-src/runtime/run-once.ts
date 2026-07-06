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
    appendTavernMessage,
    createTavernSession,
    deleteTavernMessages,
    getTavernMessage,
    getTavernSession,
    listLatestTavernMessagesWithCount,
    listLatestTavernUserMessagesBefore,
    listTavernMessageOrdersFrom,
    listTavernMessagesInRange,
    listTavernMessagesInRangeWithCount,
    mergeWorldEntryStates,
    normalizeTavernSessionState,
    replaceTavernSessionState,
    updateTavernMessage,
    updateTavernSessionState,
    updateTavernSessionSnapshot,
    type TavernMessageRecord,
    type TavernSessionRecord,
    type TavernSessionState,
} from '../../shared/session-db';
import {
    rebuildTavernMemoryDerivedIndex,
    restoreTavernMemoryToFloor,
    trimTavernMemorySnapshotsFromFloor,
} from '../../shared/memory-files';
import { saveAcceptedStateSnapshot } from '../../shared/accepted-state';
import {
    getLatestQuestHooksForPrompt,
    restoreTavernTasksToFloor,
    trimTavernTaskSnapshotsFromFloor,
} from '../../shared/tasks';
import { buildXbTavernBrain, buildXbTavernBrainAsync } from '../../shared/brain';
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
import { getTavernStatusStateForSession, type TavernStatusDocument } from '../../shared/status-state';
import { buildTavernStatusPanelYaml } from '../../shared/status-prompt';
import { createXbTavernAgentRuntime } from './agent-runtime';
import {
    cancelAndRollbackXbTavernManagersForMessageRange,
    markXbTavernManagerTurnPending,
    runPendingAcceptedTurnManager,
    type XbTavernManagerOnceOptions,
    type XbTavernManagerOnceResult,
} from './manager';
import { assertXbTavernProviderReady, resolveXbTavernProviderConfig } from './provider';
import {
    applyTavernToolLoopRequestPlan,
    buildGoogleSessionToolLoopSendPayload,
    resolveTavernToolLoopRequestPlan,
    type TavernToolLoopResponse,
} from './tool-loop-request';

const TAVERN_IMAGE_MARKER_REGEX = /\[tavern-image:[a-z0-9\-_]+\]/gi;
const TAVERN_INLINE_IMAGE_TOKEN_REGEX = /\[(?:img|图片)\s*:\s*[^\]]+\]/gi;
const MAX_ACTION_CHECK_ROUNDS = 8;
export const TAVERN_CONTEXT_WINDOW_MAX = 20;
export const TAVERN_CONTEXT_WINDOW_RETAIN = 10;
export const TAVERN_CONTEXT_WINDOW_MIN_SAFE = 5;

function stripTavernImageMarkers(text = ''): string {
    return String(text || '')
        .replace(TAVERN_IMAGE_MARKER_REGEX, '')
        .replace(TAVERN_INLINE_IMAGE_TOKEN_REGEX, '')
        .trim();
}

function isUsableContextWindowMessage(message: TavernMessageRecord): boolean {
    return !message.error && !!stripTavernImageMarkers(message.content);
}

function hasUsableCurrentUserMessage(text = ''): boolean {
    return !!stripTavernImageMarkers(text);
}

export interface TavernContextWindowResolution {
    contextWindowStartOrder: number;
    historyMessages: TavernMessageRecord[];
    usableHistoryCount: number;
    windowHistoryCount: number;
    currentUserCount: number;
}

export function resolveTavernContextWindow(input: {
    messages?: TavernMessageRecord[];
    contextWindowStartOrder?: unknown;
    currentUserMessage?: string;
} = {}): TavernContextWindowResolution {
    const sorted = [...(input.messages || [])].sort((left, right) => left.order - right.order);
    const usableMessages = sorted.filter(isUsableContextWindowMessage);
    const currentUserCount = hasUsableCurrentUserMessage(input.currentUserMessage || '') ? 1 : 0;
    let startOrder = Math.max(0, Math.floor(Number(input.contextWindowStartOrder) || 0));

    if (!usableMessages.length || usableMessages.length < TAVERN_CONTEXT_WINDOW_MIN_SAFE) {
        startOrder = 0;
    } else if (usableMessages.length + currentUserCount <= TAVERN_CONTEXT_WINDOW_MAX) {
        startOrder = 0;
    } else if (startOrder > 0) {
        let windowUsableMessages = usableMessages.filter((message) => message.order >= startOrder);
        const exactStartExists = usableMessages.some((message) => message.order === startOrder);
        if (!exactStartExists && windowUsableMessages.length) {
            startOrder = windowUsableMessages[0].order;
            windowUsableMessages = usableMessages.filter((message) => message.order >= startOrder);
        }
        if (windowUsableMessages.length < TAVERN_CONTEXT_WINDOW_MIN_SAFE) {
            startOrder = usableMessages[Math.max(0, usableMessages.length - TAVERN_CONTEXT_WINDOW_RETAIN)]?.order || 0;
        }
    }

    let windowUsableMessages = startOrder > 0
        ? usableMessages.filter((message) => message.order >= startOrder)
        : usableMessages;
    if (windowUsableMessages.length + currentUserCount > TAVERN_CONTEXT_WINDOW_MAX) {
        const retainHistoryCount = Math.max(0, TAVERN_CONTEXT_WINDOW_RETAIN - currentUserCount);
        startOrder = retainHistoryCount > 0
            ? windowUsableMessages.slice(-retainHistoryCount)[0]?.order || 0
            : 0;
        windowUsableMessages = startOrder > 0
            ? usableMessages.filter((message) => message.order >= startOrder)
            : usableMessages;
    }

    const historyMessages = startOrder > 0
        ? sorted.filter((message) => message.order >= startOrder)
        : sorted;
    return {
        contextWindowStartOrder: startOrder,
        historyMessages,
        usableHistoryCount: usableMessages.length,
        windowHistoryCount: windowUsableMessages.length,
        currentUserCount,
    };
}

async function listAllTavernMessagesInRangePaged(
    sessionId = '',
    startOrder = 0,
    endOrder = Number.POSITIVE_INFINITY,
): Promise<TavernMessageRecord[]> {
    const pageSize = 1000;
    const messages: TavernMessageRecord[] = [];
    let offset = 0;
    while (true) {
        const page = await listTavernMessagesInRange(sessionId, startOrder, endOrder, pageSize, offset);
        messages.push(...page);
        if (page.length < pageSize) {break;}
        offset += pageSize;
    }
    return messages;
}

function countUsableContextWindowMessages(messages: TavernMessageRecord[]) {
    return messages.filter(isUsableContextWindowMessage).length;
}

export async function loadTavernPromptHistoryWindow(input: {
    sessionId: string;
    contextWindowStartOrder?: unknown;
    currentUserMessage?: string;
    beforeOrder?: number;
}): Promise<TavernContextWindowResolution> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {
        return resolveTavernContextWindow({
            messages: [],
            contextWindowStartOrder: input.contextWindowStartOrder,
            currentUserMessage: input.currentUserMessage,
        });
    }
    const finiteBefore = Number.isFinite(Number(input.beforeOrder));
    const beforeOrder = finiteBefore ? Math.floor(Number(input.beforeOrder) || 0) : Number.POSITIVE_INFINITY;
    if (finiteBefore && beforeOrder <= 0) {
        return resolveTavernContextWindow({
            messages: [],
            contextWindowStartOrder: input.contextWindowStartOrder,
            currentUserMessage: input.currentUserMessage,
        });
    }
    const endOrder = finiteBefore ? beforeOrder - 1 : Number.POSITIVE_INFINITY;
    const startOrder = Math.max(0, Math.floor(Number(input.contextWindowStartOrder) || 0));
    const currentUserCount = hasUsableCurrentUserMessage(input.currentUserMessage || '') ? 1 : 0;
    const targetUsable = Math.max(TAVERN_CONTEXT_WINDOW_MAX, TAVERN_CONTEXT_WINDOW_RETAIN + currentUserCount);
    const pageSize = Math.max(TAVERN_CONTEXT_WINDOW_MAX * 3, 60);

    if (startOrder > 0) {
        const range = await listTavernMessagesInRangeWithCount(sessionId, startOrder, endOrder, pageSize, 0);
        if (range.total <= pageSize) {
            const resolved = resolveTavernContextWindow({
                messages: range.messages,
                contextWindowStartOrder: startOrder,
                currentUserMessage: input.currentUserMessage,
            });
            if (resolved.contextWindowStartOrder >= startOrder) {
                return resolved;
            }
        }
    }

    const collected = new Map<number, TavernMessageRecord>();
    let offset = 0;
    let finiteRangeTotal: number | null = null;
    let finiteRangeLoadedFromEnd = 0;
    let total = 0;
    while (true) {
        let page: { messages: TavernMessageRecord[]; total: number };
        if (finiteBefore) {
            if (finiteRangeTotal === null) {
                const probe = await listTavernMessagesInRangeWithCount(sessionId, 0, endOrder, 1, 0);
                finiteRangeTotal = probe.total;
            }
            const remaining = Math.max(0, finiteRangeTotal - finiteRangeLoadedFromEnd);
            const limit = Math.min(pageSize, remaining);
            const offsetFromStart = Math.max(0, finiteRangeTotal - finiteRangeLoadedFromEnd - limit);
            page = limit > 0
                ? await listTavernMessagesInRangeWithCount(sessionId, 0, endOrder, limit, offsetFromStart)
                : { messages: [], total: finiteRangeTotal };
            finiteRangeLoadedFromEnd += page.messages.length;
        } else {
            page = await listLatestTavernMessagesWithCount(sessionId, pageSize, offset);
            offset += pageSize;
        }
        total = page.total;
        page.messages.forEach((message) => collected.set(message.order, message));
        const messages = [...collected.values()].sort((left, right) => left.order - right.order);
        if (messages.length >= total || countUsableContextWindowMessages(messages) >= targetUsable) {
            return resolveTavernContextWindow({
                messages,
                contextWindowStartOrder: startOrder,
                currentUserMessage: input.currentUserMessage,
            });
        }
        if (!page.messages.length) {
            return resolveTavernContextWindow({
                messages,
                contextWindowStartOrder: startOrder,
                currentUserMessage: input.currentUserMessage,
            });
        }
    }
}

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

function buildRuntimeProtocolMessages(runtime: TavernSessionContractRuntime): XbTavernMessage[] {
    return runtime.includeActionChecks ? [buildActionCheckProtocolMessage()] : [];
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
    const questHooks = Array.isArray(memoryContext.questHooks)
        ? memoryContext.questHooks.map((hook) => String(hook || '').trim()).filter(Boolean)
        : [];
    const sections: string[] = [];
    if (questHooks.length) {
        sections.push(questHooks.join('\n'));
    }
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
    chatPreset?: TavernChatPromptPresetBundle;
    regexApplications?: TavernRegexApplicationSummary;
    tools?: unknown[];
    toolChoice?: 'auto' | 'none' | string;
    toolResponses?: TavernToolLoopResponse[];
    finalAnswerReminderText?: string;
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
}

export interface TavernRunOnceResult {
    text: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    model?: string;
    provider?: string;
    finishReason?: string;
    providerPayload?: unknown;
    toolCalls?: Array<{ id?: string; name?: string; arguments?: string }>;
    requestSnapshot: TavernRequestSnapshot;
}

export interface TavernDiagnostics {
    ok?: boolean;
    message?: string;
    worldbookErrors?: Array<{ name: string; error: string }>;
    pendingManagerError?: string;
}

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
}) => Promise<{
    messages?: XbTavernMessage[];
    source?: string;
    promptMessageCount?: number;
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
    onAssistantMessageSaved?: (sessionId: string, message: TavernMessageRecord) => void | Promise<void>;
    onManagerRunSaved?: (sessionId: string, managerRunId: string) => void | Promise<void>;
    reuseUserMessageOrder?: number;
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
    runtimeProtocolMessages?: XbTavernMessage[];
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
    }));
    const nativeMessages = Array.isArray(nativePrompt?.messages) ? nativePrompt.messages : [];
    if (!nativeMessages.length) {
        throw new Error('native_prompt_builder_returned_empty_messages');
    }
    const buildResult = replaceBuildResultForPromptSource(input.baseBuildResult, nativeMessages, 'sillytavern-native');
    const buildSnapshot = createXbTavernBuildSnapshot(input.contextForBuild, input.chatPreset, buildResult, {
        ...(input.diagnostics && typeof input.diagnostics === 'object' ? input.diagnostics : {}),
        promptSource: nativePrompt?.source || 'sillytavern-prepareOpenAIMessages',
        promptMessageCount: nativePrompt?.promptMessageCount ?? nativeMessages.length,
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

async function persistRunSessionState(
    sessionId: string,
    state: Partial<TavernSessionState>,
    options: { replace?: boolean } = {},
): Promise<TavernSessionRecord | null> {
    return options.replace
        ? await replaceTavernSessionState(sessionId, state)
        : await updateTavernSessionState(sessionId, state);
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
    if (!runtime.includeMemoryFiles && !runtime.includeStructuredStates && !runtime.includeStatusStates && !runtime.includeQuestOrchestration) {
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
    if (runtime.includeQuestOrchestration && Array.isArray(memoryContext.questHooks)) {
        filtered.questHooks = memoryContext.questHooks;
    }
    return filtered;
}

async function buildStatusPanelPromptContext(sessionId = '', runtime: TavernSessionContractRuntime): Promise<{
    statusPanelYaml: string;
    statusDocument?: TavernStatusDocument;
}> {
    const id = String(sessionId || '').trim();
    if (!id || !runtime.includeStatusStates) {return { statusPanelYaml: '' };}
    const state = await getTavernStatusStateForSession(id);
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
    } = {},
): TavernRequestSnapshot {
    const providerConfig = resolveXbTavernProviderConfig(agentConfig);
    const requestInspection = override.requestInspection || null;
    const requestInspectionError = String(override.requestInspectionError || '').trim();
    const chatPresetName = String(override.chatPreset?.name || '').trim();
    const snapshotMessages = normalizeRequestSnapshotMessages(messages);
    const rawMessagesJson = JSON.stringify(snapshotMessages, null, 2);
    const requestForJson = requestInspection
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
            provider: String(requestInspection?.provider || providerConfig.provider || ''),
            model: String(requestInspection?.model || providerConfig.model || ''),
            requestInspection,
            requestKind: input.requestKind || 'actual',
            chatPreset: input.chatPreset,
            regexApplications: input.regexApplications,
            requestTask: task as unknown as Record<string, unknown>,
        }),
        snapshotMessages: requestPlan.requestMessages,
    };
}

export function buildContextHistory(messages: TavernMessageRecord[] = []): XbTavernMessage[] {
    return messages
        .filter((message) => !message.error)
        .map((message) => ({
            role: ['system', 'user', 'assistant', 'tool'].includes(message.role)
                ? message.role as XbTavernMessage['role']
                : 'assistant',
            content: stripTavernImageMarkers(message.content),
            ...(message.name ? { name: message.name } : {}),
            ...(Array.isArray(message.thoughts) && message.thoughts.length ? { thoughts: message.thoughts } : {}),
        }))
        .filter((message) => String(message.content || '').trim());
}

function findCompletedAssistantForUser(messages: TavernMessageRecord[] = [], userIndex = -1): TavernMessageRecord | null {
    if (userIndex < 0) {return null;}
    for (let index = userIndex + 1; index < messages.length; index += 1) {
        const message = messages[index];
        if (message.role === 'user') {break;}
        if (message.role === 'assistant' && !message.error && String(message.content || '').trim()) {
            return message;
        }
    }
    return null;
}

export function deriveTavernSessionStateFromMessages(input: {
    messages?: TavernMessageRecord[];
    contextSnapshot?: XbTavernContext;
    chatPreset?: TavernChatPromptPresetBundle;
    preset?: TavernChatPromptPresetBundle;
    historyMode?: XbTavernRuntimeState['historyMode'];
    diagnostics?: TavernDiagnostics;
}): TavernSessionState {
    const chatPreset = resolveInputChatPreset(input);
    const sorted = [...(input.messages || [])].sort((left, right) => left.order - right.order);
    const contextSnapshot = input.contextSnapshot || {};
    const priorMessages: TavernMessageRecord[] = [];
    let turn = 0;
    let lastBuildSnapshot: XbTavernBuildSnapshot | undefined;
    let lastRequestSnapshot: unknown;
    let lastProvider = '';
    let lastModel = '';

    sorted.forEach((message, index) => {
        const cleanContent = stripTavernImageMarkers(message.content);
        if (message.role !== 'user' || message.error || !cleanContent) {
            priorMessages.push(message);
            return;
        }
        const assistant = findCompletedAssistantForUser(sorted, index);
        if (assistant) {
            const brain = buildXbTavernBrain({
                context: {
                    ...contextSnapshot,
                    history: buildContextHistory(priorMessages),
                },
                chatPreset,
                currentUserMessage: cleanContent,
                historyMode: input.historyMode || 'raw',
                turn,
                entryStates: {},
                diagnostics: input.diagnostics || {},
            });
            turn += 1;
            lastBuildSnapshot = brain.buildSnapshot;
            lastRequestSnapshot = assistant.requestSnapshot || message.requestSnapshot;
            lastProvider = String(assistant.provider || '');
            lastModel = String(assistant.model || '');
        }
        priorMessages.push(message);
    });

    const lastMessage = sorted[sorted.length - 1];
    return {
        turn,
        worldEntryStates: {},
        nativeWorldInfoTimedState: { sticky: {}, cooldown: {} },
        lastBuildSnapshot,
        lastRequestSnapshot,
        lastProvider,
        lastModel,
        lastError: lastMessage?.error ? String(lastMessage.content || '') : '',
    };
}

export async function deriveTavernSessionStateFromMessagesAsync(input: {
    messages?: TavernMessageRecord[];
    contextSnapshot?: XbTavernContext;
    chatPreset?: TavernChatPromptPresetBundle;
    preset?: TavernChatPromptPresetBundle;
    historyMode?: XbTavernRuntimeState['historyMode'];
    diagnostics?: TavernDiagnostics;
    applySubstituteParams?: TavernApplySubstituteParams;
    getNativeWorldInfoRuntime?: TavernGetNativeWorldInfoRuntime;
}): Promise<TavernSessionState> {
    if (!input.applySubstituteParams && !input.getNativeWorldInfoRuntime) {
        return deriveTavernSessionStateFromMessages(input);
    }
    const chatPreset = resolveInputChatPreset(input);
    const sorted = [...(input.messages || [])].sort((left, right) => left.order - right.order);
    const contextSnapshot = input.contextSnapshot || {};
    const substituteOptions = buildSubstituteParamsOptions(contextSnapshot);
    const priorMessages: TavernMessageRecord[] = [];
    let turn = 0;
    let worldEntryStates: NonNullable<TavernSessionState['worldEntryStates']> = {};
    let nativeWorldInfoTimedState: XbTavernNativeWorldInfoTimedState = { sticky: {}, cooldown: {} };
    let lastBuildSnapshot: XbTavernBuildSnapshot | undefined;
    let lastRequestSnapshot: unknown;
    let lastProvider = '';
    let lastModel = '';

    for (let index = 0; index < sorted.length; index += 1) {
        const message = sorted[index];
        const cleanContent = stripTavernImageMarkers(message.content);
        if (message.role !== 'user' || message.error || !cleanContent) {
            priorMessages.push(message);
            continue;
        }
        const assistant = findCompletedAssistantForUser(sorted, index);
        if (assistant) {
            const trigger = String(
                (assistant.buildSnapshot as { nativeWorldInfo?: { trigger?: string } } | undefined)?.nativeWorldInfo?.trigger
                || (message.buildSnapshot as { nativeWorldInfo?: { trigger?: string } } | undefined)?.nativeWorldInfo?.trigger
                || 'normal',
            );
            const contextBase = {
                ...contextSnapshot,
                worldSettings: {
                    ...(contextSnapshot.worldSettings || {}),
                    trigger,
                },
                history: buildContextHistory(priorMessages),
            };
            const nativeContext = await injectNativeWorldInfoRuntime({
                getNativeWorldInfoRuntime: input.getNativeWorldInfoRuntime,
                context: contextBase,
                currentUserMessage: cleanContent,
                trigger,
                timedState: nativeWorldInfoTimedState,
            });
            nativeWorldInfoTimedState = nativeContext.timedState;
            const contextForBuild = await substituteContextWorldEntriesForPrompt({
                applySubstituteParams: input.applySubstituteParams,
                context: nativeContext.context,
                options: substituteOptions,
            });
            const brain = await buildXbTavernBrainAsync({
                context: contextForBuild,
                chatPreset,
                currentUserMessage: cleanContent,
                historyMode: input.historyMode || 'raw',
                turn,
                entryStates: worldEntryStates,
                diagnostics: input.diagnostics || {},
            });
            worldEntryStates = mergeWorldEntryStates(
                worldEntryStates,
                brain.buildResult.meta.worldEntryStateUpdates,
            );
            turn += 1;
            lastBuildSnapshot = brain.buildSnapshot;
            lastRequestSnapshot = assistant.requestSnapshot || message.requestSnapshot;
            lastProvider = String(assistant.provider || '');
            lastModel = String(assistant.model || '');
        }
        priorMessages.push(message);
    }

    const lastMessage = sorted[sorted.length - 1];
    return {
        turn,
        worldEntryStates,
        nativeWorldInfoTimedState,
        lastBuildSnapshot,
        lastRequestSnapshot,
        lastProvider,
        lastModel,
        lastError: lastMessage?.error ? String(lastMessage.content || '') : '',
    };
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
    const providerConfig = assertXbTavernProviderReady(options.agentConfig);
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
                provider: String(requestInspection.provider || inspected.providerConfig.provider || ''),
                model: String(requestInspection.model || inspected.providerConfig.model || ''),
                requestInspection,
                requestKind: 'actual',
                chatPreset: options.chatPreset,
                regexApplications: options.regexApplications,
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
            provider,
            model,
            requestInspection: finalInspection,
            requestKind: 'actual',
            chatPreset: options.chatPreset,
            regexApplications: options.regexApplications,
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
    const contextForBuildRaw: XbTavernContext = {
        ...liveContext,
        worldSettings: {
            ...(liveContext.worldSettings || {}),
            trigger: String(input.generationTrigger || 'normal'),
        },
        history: session ? buildContextHistory(contextWindow?.historyMessages || []) : (input.contextSnapshot.history || []),
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
    const simulateQuestHooks = session && sessionContractRuntime.includeQuestOrchestration
        ? await runTavernStage('simulate_quest_hook_retrieval', () => getLatestQuestHooksForPrompt(session.id, 1))
        : [];
    const statusPromptContext = session
        ? await runTavernStage('simulate_status_panel_prompt', () => buildStatusPanelPromptContext(session.id, sessionContractRuntime))
        : { statusPanelYaml: '' };
    const statusPanelYaml = statusPromptContext.statusPanelYaml;
    const memoryContext: XbTavernMemoryContext | undefined = retrievedMemoryContext || simulateQuestHooks.length || statusPanelYaml
        ? {
            ...(retrievedMemoryContext || {}),
            ...(simulateQuestHooks.length ? { questHooks: simulateQuestHooks } : {}),
            ...(statusPanelYaml ? { statusPanelYaml } : {}),
        }
        : undefined;
    const filteredMemoryContext = filterMemoryContextByRuntime(memoryContext, sessionContractRuntime);
    const runtimeProtocolMessages = buildRuntimeProtocolMessages(sessionContractRuntime);
    const brain = await runTavernStage('simulate_brain_build', () => buildXbTavernBrainAsync({
        context: contextForBuild,
        chatPreset,
        currentUserMessage,
        historyMode: input.historyMode || 'raw',
        turn: sessionState.turn,
        entryStates: sessionState.worldEntryStates,
        memoryContext: filteredMemoryContext,
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
        runtimeProtocolMessages,
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

const pendingAcceptedTurnManagerQueues = new Map<string, Promise<void>>();

function schedulePendingAcceptedTurnManager(input: {
    sessionId: string;
    agentConfig: Record<string, unknown>;
    assistantPreset?: TavernAssistantPreset;
    sessionContract: TavernSessionContract;
    contextSnapshot: XbTavernContext;
    executeManagerOnce?: (options: XbTavernManagerOnceOptions) => Promise<XbTavernManagerOnceResult>;
    onManagerRunSaved?: (sessionId: string, managerRunId: string) => void | Promise<void>;
}): void {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return;}
    const previous = pendingAcceptedTurnManagerQueues.get(sessionId) || Promise.resolve();
    const run = previous
        .catch((): void => undefined)
        .then(async (): Promise<void> => {
            const result = await runPendingAcceptedTurnManager({
                sessionId,
                agentConfig: input.agentConfig,
                assistantPreset: input.assistantPreset,
                sessionContract: input.sessionContract,
                contextSnapshot: input.contextSnapshot,
                executeManagerOnce: input.executeManagerOnce,
                onManagerRunSaved: async (managerRun) => {
                    await notifyRunCallback(() => input.onManagerRunSaved?.(sessionId, managerRun.id));
                },
            });
            if (result?.ok && result.managerRun?.status === 'completed') {
                await saveAcceptedStateSnapshot(sessionId, result.managerRun.assistantOrder);
            }
        })
        .catch(async (error): Promise<void> => {
            console.warn('[小白酒馆] accepted-turn manager background task failed', error);
        })
        .finally(() => {
            if (pendingAcceptedTurnManagerQueues.get(sessionId) === run) {
                pendingAcceptedTurnManagerQueues.delete(sessionId);
            }
        });
    pendingAcceptedTurnManagerQueues.set(sessionId, run);
}

export async function waitForPendingAcceptedTurnManagers(sessionId = ''): Promise<void> {
    const target = String(sessionId || '').trim();
    for (;;) {
        const queues = target
            ? [pendingAcceptedTurnManagerQueues.get(target)].filter(Boolean) as Promise<void>[]
            : [...pendingAcceptedTurnManagerQueues.values()];
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
    const reusedOrder = Number(input.reuseUserMessageOrder);
    const reusedCandidate = Number.isInteger(reusedOrder) && reusedOrder >= 0
        ? await getTavernMessage(baseSession.id, reusedOrder)
        : null;
    const reusedUserMessage = reusedCandidate?.role === 'user' && !reusedCandidate.error ? reusedCandidate : null;
    if (reusedUserMessage) {
        const changedOrder = reusedUserMessage.order + 1;
        await cancelAndRollbackXbTavernManagersForMessageRange(baseSession.id, changedOrder);
        await restoreTavernMemoryToFloor(baseSession.id, changedOrder - 1);
        await restoreTavernTasksToFloor(baseSession.id, changedOrder - 1);
        await trimTavernMemorySnapshotsFromFloor(baseSession.id, changedOrder);
        await trimTavernTaskSnapshotsFromFloor(baseSession.id, changedOrder);
        await rebuildTavernMemoryDerivedIndex(baseSession.id);
        await deleteTavernMessages(baseSession.id, await listTavernMessageOrdersFrom(baseSession.id, changedOrder));
    }
    const persistedSessionState = normalizeTavernSessionState(baseSession.state || input.runtimeState || {});
    const persistedSessionContract = resolveSessionContract(persistedSessionState);
    const persistedSessionContractRuntime = resolveTavernSessionContractRuntime(persistedSessionContract);
    const turnDiagnostics: TavernDiagnostics = {
        ...(input.diagnostics || {}),
    };
    if (!reusedUserMessage) {
        if (input.runManager === true && persistedSessionContractRuntime.hasAutomaticManagerWork) {
            schedulePendingAcceptedTurnManager({
                sessionId: baseSession.id,
                agentConfig: input.agentConfig,
                assistantPreset: input.assistantPreset,
                sessionContract: persistedSessionContract,
                contextSnapshot: liveContext,
                executeManagerOnce: input.executeManagerOnce,
                onManagerRunSaved: input.onManagerRunSaved,
            });
        }
        await saveAcceptedStateSnapshot(baseSession.id);
    }
    notifyRunStatus(input.onRuntimeStatus, '整理历史');
    const rebuildHistoryMessages = reusedUserMessage
        ? await listAllTavernMessagesInRangePaged(baseSession.id, 0, reusedUserMessage.order - 1)
        : null;
    const rebuiltSessionState = reusedUserMessage
        ? await deriveTavernSessionStateFromMessagesAsync({
            messages: rebuildHistoryMessages || [],
            contextSnapshot: liveContext,
            chatPreset: input.chatPreset,
            historyMode: input.historyMode || 'raw',
            diagnostics: turnDiagnostics,
            applySubstituteParams: input.applySubstituteParams,
            getNativeWorldInfoRuntime: input.getNativeWorldInfoRuntime,
        })
        : null;
    const sessionState = reusedUserMessage
        ? normalizeRuntimeSessionStateWithContract(
            {
                ...rebuiltSessionState,
                contextWindowStartOrder: persistedSessionState.contextWindowStartOrder,
            },
            persistedSessionState.contract,
        )
        : persistedSessionState;
    const sessionContract = resolveSessionContract(sessionState);
    const sessionContractRuntime = resolveTavernSessionContractRuntime(sessionContract);
    const actionCheckCapabilities = buildActionCheckCapabilities(sessionContractRuntime);
    const shouldReplaceSessionState = !!reusedUserMessage;
    const rawCurrentUserMessage = String(reusedUserMessage?.content || input.currentUserMessage || '');
    const initialPresetId = String(chatPreset.id || baseSession.chatPresetId || baseSession.presetId || '');
    const initialPresetName = String(chatPreset.name || baseSession.chatPresetName || baseSession.presetName || '');
    let userMessage = reusedUserMessage;
    if (!userMessage) {
        userMessage = await appendTavernMessage(baseSession.id, {
            role: 'user',
            content: rawCurrentUserMessage,
            contextSnapshot: liveContext,
            chatPresetId: initialPresetId,
            chatPresetName: initialPresetName,
            presetId: initialPresetId,
            presetName: initialPresetName,
        });
        await notifyRunCallback(() => input.onUserMessageSaved?.(baseSession.id, userMessage as TavernMessageRecord));
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
        history: buildContextHistory(contextWindow.historyMessages),
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
    const questHooks = sessionContractRuntime.includeQuestOrchestration
        // RP gets only the freshest one. The event panel may show more, but prompt hooks should stay soft and sparse.
        ? await runTavernStage('turn_quest_hook_retrieval', () => getLatestQuestHooksForPrompt(baseSession.id, 1))
        : [];
    const statusPromptContext = await runTavernStage('turn_status_panel_prompt', () => buildStatusPanelPromptContext(baseSession.id, sessionContractRuntime));
    const statusPanelYaml = statusPromptContext.statusPanelYaml;
    const memoryContext: XbTavernMemoryContext | undefined = retrievedMemoryContext || questHooks.length || statusPanelYaml
        ? {
            ...(retrievedMemoryContext || {}),
            ...(questHooks.length ? { questHooks } : {}),
            ...(statusPanelYaml ? { statusPanelYaml } : {}),
        }
        : undefined;
    const filteredMemoryContext = filterMemoryContextByRuntime(memoryContext, sessionContractRuntime);
    const runtimeProtocolMessages = buildRuntimeProtocolMessages(sessionContractRuntime);
    const brain = await runTavernStage('turn_brain_build', () => buildXbTavernBrainAsync({
        context: contextForBuild,
        chatPreset,
        currentUserMessage,
        historyMode: input.historyMode || 'raw',
        turn: sessionState.turn,
        entryStates: sessionState.worldEntryStates,
        memoryContext: filteredMemoryContext,
        runtimeDepthEntries: buildChanceEncounterDepthEntries(chanceEncounterEvent),
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
        runtimeProtocolMessages,
        diagnostics: turnDiagnostics,
    });
    const session = await updateTavernSessionSnapshot(baseSession.id, {
        contextSnapshot: liveContext,
        buildSnapshot,
        chatPresetId: String(chatPreset.id || baseSession.chatPresetId || baseSession.presetId || ''),
        chatPresetName: String(chatPreset.name || baseSession.chatPresetName || baseSession.presetName || ''),
        presetId: String(chatPreset.id || baseSession.presetId || ''),
        presetName: String(chatPreset.name || baseSession.presetName || ''),
    }) || baseSession;
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
        })).requestSnapshot;
    } catch (error) {
        requestSnapshot = buildTavernRequestSnapshot(input.agentConfig, buildResult.messages, {
            requestKind: 'actual',
            chatPreset,
            regexApplications,
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
    if (userMessage) {
        const existingEncounter = getChanceEncounterEvent(userMessage.runtimeEvents);
        userMessage = await updateTavernMessage(session.id, userMessage.order, {
            contextSnapshot: liveContext,
            buildSnapshot,
            chatPresetId: presetId,
            chatPresetName: presetName,
            presetId,
            presetName,
            requestSnapshot,
            runtimeEvents: !existingEncounter && chanceEncounterEvent
                ? [chanceEncounterEvent]
                : userMessage.runtimeEvents || [],
        }) || userMessage;
    }
    if (!userMessage) {
        throw new Error('user_message_save_failed');
    }
    await notifyRunCallback(() => input.onUserMessageSaved?.(session.id, userMessage));

    try {
        const executeRunOnce = input.executeRunOnce || createDefaultTavernRunOnceExecutor(input.agentConfig);
        notifyRunStatus(input.onRuntimeStatus, '请求模型');
        const result = sessionContractRuntime.includeActionChecks
            ? await runTavernActionCheckLoop({
                agentConfig: input.agentConfig,
                messages: buildResult.messages,
                chatPreset,
                regexApplications,
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
        const assistantMessage = await appendTavernMessage(session.id, {
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
        });
        await notifyRunCallback(() => input.onAssistantMessageSaved?.(session.id, assistantMessage));
        const nextTurn = Number(sessionState.turn || 0) + 1;
        await persistRunSessionState(session.id, {
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
        }, {
            replace: shouldReplaceSessionState,
        });
        let managerRunId = '';
        let managerStatus = '';
        const assistantFinishReason = String(result.finishReason || '').trim();
        const canRunManager = input.runManager === true
            && !assistantMessage.error
            && !['aborted', 'error'].includes(assistantFinishReason);
        if (canRunManager && sessionContractRuntime.hasAutomaticManagerWork) {
            const manager = await markXbTavernManagerTurnPending({
                sessionId: session.id,
                agentConfig: input.agentConfig,
                userMessage,
                assistantMessage,
                turn: nextTurn,
                assistantPreset: input.assistantPreset,
                sessionContract,
                contextSnapshot: liveContext,
                executeManagerOnce: input.executeManagerOnce,
                onManagerRunSaved: async (run) => {
                    await notifyRunCallback(() => input.onManagerRunSaved?.(session.id, run.id));
                },
            });
            managerRunId = manager.managerRunId;
            managerStatus = manager.managerStatus;
        }
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
            managerRunId,
            managerStatus,
        };
    } catch (error) {
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
            const errorMessage = await appendTavernMessage(session.id, {
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
            });
            await notifyRunCallback(() => input.onAssistantMessageSaved?.(session.id, errorMessage));
            const nextTurn = Number(sessionState.turn || 0) + 1;
            await persistRunSessionState(session.id, {
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
            }, {
                replace: shouldReplaceSessionState,
            });
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
        const errorMessage = await appendTavernMessage(session.id, {
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
        });
        await notifyRunCallback(() => input.onAssistantMessageSaved?.(session.id, errorMessage));
        await persistRunSessionState(session.id, {
            turn: Number(sessionState.turn || 0),
            contextWindowStartOrder: contextWindow.contextWindowStartOrder,
            worldEntryStates: shouldReplaceSessionState ? sessionState.worldEntryStates || {} : {},
            nativeWorldInfoTimedState: normalizeNativeWorldInfoTimedState(sessionState.nativeWorldInfoTimedState),
            lastBuildSnapshot: buildSnapshot,
            lastRequestSnapshot: requestSnapshot,
            lastProvider: requestSnapshot.provider,
            lastModel: requestSnapshot.model,
            lastError: aborted ? '已停止生成。' : errorText,
        }, {
            replace: shouldReplaceSessionState,
        });
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
