import { createAgentAdapter, resolveActiveProviderConfig } from '../../../agent-core/provider-config.js';
import { createLightBrakeController } from '../../../agent-core/runtime/light-brake.js';
import {
    buildProviderAssistantToolCallMessage,
    buildProviderToolResultMessage,
    hasVisibleText,
    resolveResultToolCalls,
} from '../../../agent-core/runtime/protocol.js';
import { isTavilyConfigured, runTavilySearchTool, TAVILY_TOOL_NAME } from '../../../agent-core/tavily-search.js';
import type { XbTavernContext, XbTavernMessage } from '../../shared/message-assembler';
import { buildTavernManagerSystemPrompt, type TavernAssistantPreset } from '../../shared/assistant-presets';
import {
    ensureTavernMemoryDefaults,
    executeTavernSourceFileTool,
    getTavernManagerToolDefinitions,
    listTavernMemoryFiles,
    rebuildTavernMemoryDerivedIndex,
    TAVERN_SOURCE_FILE_TOOL_NAMES,
    type TavernMemoryToolResult,
} from '../../shared/memory-files';
import { cleanSourceTextForManager } from '../../shared/memory-retrieval';
import { buildTavernCommunicationEvidenceAtAnchor } from '../../shared/communications';
import {
    assertTavernManagerRunSourceMessages,
    assertRunningTavernManagerRunLease,
    clearTavernManagerRunSnapshots,
    claimNextQueuedAcceptedTurnManagerRun,
    createRecoveredAcceptedTurnManagerRun,
    createTavernManagerRun,
    deleteTavernManagerCandidateForMessageRange,
    getTavernMessage,
    getTavernSession,
    listTavernManagerMemorySnapshots,
    listTavernManagerRuns,
    markExpiredAcceptedTurnManagerRunsInterrupted,
    rollbackManagerRunMemoryWrites,
    rollbackManagerRunsForMessageRange,
    touchRunningTavernManagerRun,
    updateTavernManagerRun,
    type TavernManagerRunRecord,
    type TavernManagerRunSourceIdentity,
    type TavernMaintenanceRunTrigger,
    type TavernMessageRecord,
} from '../../shared/session-db';
import { TAVERN_MANAGER_HEARTBEAT_INTERVAL_MS } from '../../shared/manager-run-liveness';
import { executeTavernStateTool, getTavernAtlasStateForSession, TAVERN_STATE_TOOL_NAMES, type TavernStateToolResult } from '../../shared/structured-state';
import {
    describeStatusStateRollbackImpactForMessageRange,
    executeTavernStatusTool,
    getTavernStatusStateForSession,
    isTavernStatusToolName,
    rollbackStatusStateForManagerRun,
    rollbackStatusStateForMessageRange,
    TAVERN_STATUS_TOOL_NAMES,
    type TavernStatusToolResult,
} from '../../shared/status-state';
import { resolveTavernSessionContractRuntime, type TavernSessionContract, type TavernSessionContractRuntime } from '../../shared/session-contract';
import {
    createTavernTaskStagingContext,
    hasMaintainableTavernTasksAtAnchor,
    listTavernTasksAtAnchor,
} from '../../shared/tasks/task-service';
import {
    executeTavernTaskTool,
    getTavernTaskToolDefinitions,
    isTavernTaskToolName,
    type TavernTaskToolResult,
} from '../../shared/tasks/task-tools';
import type { TavernTaskStagedAction, TavernTaskStagingContext } from '../../shared/tasks/task-types';
import {
    buildDeniedAutoManagerToolResult,
    filterAutoManagerToolDefinitions,
    isAutoManagerToolAllowed,
} from './contract-policy';
import { getXbTavernProviderLabel } from './provider';
import {
    applyTavernToolLoopRequestPlan,
    resolveTavernToolLoopRequestPlan,
    type TavernToolLoopResponse,
} from './tool-loop-request';
import { createTavernStateWriteCasTracker } from './state-write-cas';
import { buildTavernManagerTaskContextBlock } from './task-context';

const ACCEPTED_TURN_MANAGER_TRIGGER = 'accepted_turn';
const TAVERN_MANAGER_TIMEOUT_MS = 5 * 60 * 1000;
export const TAVERN_MANAGER_LEASE_DURATION_MS = 30000;

export type TavernManagerStreamSnapshot = {
    text?: string;
    thoughts?: Array<{ label?: string; text?: string }>;
    toolCalls?: unknown[];
    toolCallDraft?: boolean;
};

export type TavernManagerProtocolEvent =
    | { type: 'assistant_tool_round'; message: XbTavernMessage }
    | { type: 'tool_result'; message: XbTavernMessage }
    | { type: 'final_assistant'; message: XbTavernMessage }
    | { type: 'clear_stream_draft' };

export interface XbTavernManagerOnceOptions {
    agentConfig: Record<string, unknown>;
    messages?: XbTavernMessage[];
    tools?: unknown[];
    toolChoice?: 'auto' | 'none' | string;
    toolResponses?: TavernToolLoopResponse[];
    finalAnswerReminderText?: string;
    signal?: AbortSignal;
    onStreamProgress?: (snapshot: TavernManagerStreamSnapshot) => void;
}

export interface XbTavernManagerOnceResult {
    text: string;
    provider?: string;
    model?: string;
    toolCalls?: unknown[];
    thoughts?: Array<{ label?: string; text?: string }>;
    providerPayload?: unknown;
}

export interface XbTavernManagerRunInput {
    sessionId: string;
    agentConfig: Record<string, unknown>;
    userMessage: TavernMessageRecord;
    assistantMessage: TavernMessageRecord;
    turn: number;
    managerRunId?: string;
    leaseOwnerId?: string;
    deferCompletion?: boolean;
    sourceUserMessageId?: string;
    sourceAssistantMessageId?: string;
    sourceUserCreatedAt?: number;
    sourceAssistantCreatedAt?: number;
    sourceUserRevision?: number;
    sourceAssistantRevision?: number;
    sessionContract?: TavernSessionContract;
    contextSnapshot?: XbTavernContext;
    assistantPreset?: TavernAssistantPreset;
    signal?: AbortSignal;
    executeManagerOnce?: (options: XbTavernManagerOnceOptions) => Promise<XbTavernManagerOnceResult>;
    onManagerRunSaved?: (run: TavernManagerRunRecord) => void | Promise<void>;
    onProtocolEvent?: (event: TavernManagerProtocolEvent) => void;
}

export interface XbTavernManagerRunResult {
    ok: boolean;
    managerRun: TavernManagerRunRecord;
    changedFiles?: string[];
    changedStates?: string[];
    stagedTaskActions?: TavernTaskStagedAction[];
    protocolMessages?: XbTavernMessage[];
    error?: string;
}

const activeAutoManagerRuns = new Map<string, {
    controller: AbortController;
    sessionId: string;
    userOrder: number;
    assistantOrder: number;
}>();
const sessionStateWriteTails = new Map<string, Promise<void>>();
export const MAX_MANAGER_TOOL_ROUNDS = 48;

async function withSessionStateWriteLock<T>(sessionId = '', operation: () => Promise<T>, signal?: AbortSignal): Promise<T> {
    const id = String(sessionId || '').trim();
    if (!id) {return await operation();}
    const previous = sessionStateWriteTails.get(id) || Promise.resolve();
    let release = () => {};
    const gate = new Promise<void>((resolve) => {release = resolve;});
    const tail = previous.catch(() => {}).then(() => gate);
    sessionStateWriteTails.set(id, tail);
    await previous.catch(() => {});
    try {
        throwIfManagerAborted(signal);
        return await operation();
    } finally {
        release();
        if (sessionStateWriteTails.get(id) === tail) {
            sessionStateWriteTails.delete(id);
        }
    }
}

function isStateWritingTool(toolName = ''): boolean {
    const name = String(toolName || '').trim();
    return [
        TAVERN_SOURCE_FILE_TOOL_NAMES.WRITE,
        TAVERN_SOURCE_FILE_TOOL_NAMES.EDIT,
        TAVERN_STATE_TOOL_NAMES.PATCH,
        TAVERN_STATE_TOOL_NAMES.EDIT_SCENE,
        TAVERN_STATUS_TOOL_NAMES.INIT,
        TAVERN_STATUS_TOOL_NAMES.PATCH,
    ].includes(name as never);
}

function normalizeText(value: unknown = '', limit = 4000): string {
    const text = String(value || '').trim();
    return text.length > limit ? text.slice(0, limit) : text;
}

function safeJson(value: unknown): string {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value || '');
    }
}

function getManagerToolArgumentSchemaHint(toolName = ''): string {
    if (toolName === TAVERN_STATE_TOOL_NAMES.EDIT_SCENE) {
        return 'Expected MapSceneEdit arguments: {"scene":"酒馆大厅","playerHere":true,"viewBox":[0,0,360,240],"elements":[{"id":"outer-wall","cat":"wall","shape":"rect","geo":{"at":[20,20],"size":[300,180]},"label":"大厅"},{"id":"player","cat":"actor","actorKey":"player","shape":"circle","geo":{"at":[160,120],"radius":8},"label":"玩家"}]}.';
    }
    if (toolName === TAVERN_STATE_TOOL_NAMES.PATCH) {
        return 'MapPatch is advanced/internal. Prefer MapSceneEdit with scene + elements using shape/geo/label. If you must use MapPatch, arguments must be a valid JSON object with an ops array.';
    }
    if (toolName === TAVERN_STATUS_TOOL_NAMES.INIT) {
        return 'Expected StatusInit arguments: {"document":{"meta":{"activeSubject":"user"},"subjects":[{"id":"user","name":"角色","tabs":[{"id":"overview","label":"概览","blocks":[{"id":"stats","title":"属性","form":"gauge","fields":[{"id":"san","name":"理智","value":62,"max":99}]}]}]}]}}.';
    }
    if (toolName === TAVERN_STATUS_TOOL_NAMES.PATCH) {
        return 'Expected StatusPatch arguments: {"ops":[{"op":"delta","subjectId":"user","tabId":"overview","blockId":"stats","fieldId":"san","delta":-5}]}. Patch may only set/delta/push/remove fields inside existing blocks.';
    }
    if (toolName === 'Edit') {
        return 'Expected Edit arguments: {"filePath":"memory/state.md","edits":[{"oldString":"...","newString":"..."}]} or line-range edits with startLine/endLine/newString.';
    }
    if (toolName === 'Write') {
        return 'Expected Write arguments: {"filePath":"memory/state.md","content":"..."}';
    }
    return 'Expected tool arguments must be a valid JSON object matching the tool schema.';
}

function extractPathFromRawToolArguments(rawArguments = ''): string {
    const text = String(rawArguments || '');
    const match = text.match(/"(?:filePath|path|docId|fromPath)"\s*:\s*"([^"]*)"/);
    return match ? match[1] : '';
}

function buildInvalidManagerToolArgumentsResult(toolCall: { name?: string; arguments?: unknown }, error: unknown): TavernMemoryToolResult {
    const rawArguments = typeof toolCall.arguments === 'string' ? toolCall.arguments : safeJson(toolCall.arguments);
    return {
        ok: false,
        toolName: String(toolCall.name || ''),
        path: extractPathFromRawToolArguments(rawArguments),
        changed: false,
        error: 'invalid_tool_arguments',
        summary: 'Tool arguments are not valid JSON. The tool was not executed. Rebuild the call with valid JSON arguments.',
        message: 'Tool arguments are not valid JSON. The tool was not executed. Rebuild the call with valid JSON arguments.',
        raw: error instanceof Error ? error.message : String(error || 'invalid_tool_arguments'),
        argumentLength: rawArguments.length,
        argumentPreview: rawArguments.slice(0, 500),
        schemaHint: getManagerToolArgumentSchemaHint(toolCall.name),
    } as TavernMemoryToolResult;
}

function parseManagerToolArguments(toolCall: { name?: string; arguments?: unknown }): {
    ok: boolean;
    args: Record<string, unknown>;
    result?: TavernMemoryToolResult;
} {
    if (toolCall.arguments && typeof toolCall.arguments === 'object' && !Array.isArray(toolCall.arguments)) {
        return { ok: true, args: toolCall.arguments as Record<string, unknown> };
    }
    try {
        const parsed = JSON.parse(String(toolCall.arguments || '{}').trim() || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('tool_arguments_must_be_json_object');
        }
        return { ok: true, args: parsed as Record<string, unknown> };
    } catch (error) {
        return {
            ok: false,
            args: {},
            result: buildInvalidManagerToolArgumentsResult(toolCall, error),
        };
    }
}

export function buildManagerSystemPrompt(
    assistantPreset: TavernAssistantPreset | undefined,
    options: {
        includeMemory?: boolean;
        includeCartography?: boolean;
        includeStatus?: boolean;
        includeWebSearch?: boolean;
        includeTasks?: boolean;
        workMode?: 'accepted-turn' | 'manual-chat';
        playerName?: string;
        hasCommunicationEvidence?: boolean;
    } = {},
): string {
    return buildTavernManagerSystemPrompt(assistantPreset, options).trim();
}

export function isManagerWebSearchEnabled(agentConfig: Record<string, unknown> = {}): boolean {
    return isTavilyConfigured(agentConfig);
}

function resolveSessionContractRuntime(contract?: Partial<TavernSessionContract> | null): TavernSessionContractRuntime {
    return resolveTavernSessionContractRuntime(contract);
}

export function buildResidentMemoryBlock(memoryFiles: Array<{ path: string; status: string; updatedAt: number; content: string }>): string {
    const stateFile = memoryFiles.find((file) => file.path === 'memory/state.md');
    const blocks = [
        stateFile ? ['[Global memory state.md]', stateFile.content].join('\n') : '[Global memory state.md]\nNo state.md file.',
    ].filter(Boolean);
    return blocks.join('\n\n');
}

function buildCharacterMemoryFilenameListBlock(memoryFiles: Array<{ path: string; status: string }>): string {
    const filenames = memoryFiles
        .filter((file) => String(file.status || 'active') !== 'stale')
        .map((file) => String(file.path || '').replace(/\\/g, '/').trim())
        .filter((path) => /^memory\/characters\/[^/]+\.md$/.test(path))
        .map((path) => path.replace(/^memory\/characters\//, ''))
        .sort((left, right) => left.localeCompare(right, 'zh-Hans-CN'));
    return [
        '[Character memory filename list]',
        filenames.length ? filenames.map((filename) => `- ${filename}`).join('\n') : 'none',
    ].join('\n');
}

function buildAtlasWorldBlock(atlasDocument: unknown): string {
    return [
        '[Map atlas world]',
        safeJson(atlasDocument || null),
    ].join('\n');
}

function buildStatusPanelBlock(statusDocument: unknown, exists = false): string {
    return [
        '[Status panel full document]',
        exists ? safeJson(statusDocument || null) : 'No status panel exists yet.',
        !exists ? safeJson(statusDocument || null) : '',
    ].filter(Boolean).join('\n');
}

function buildAutoManagerUserPrompt(input: {
    turn: number;
    userMessage: TavernMessageRecord;
    assistantMessage: TavernMessageRecord;
    memoryFiles: Array<{ path: string; status: string; updatedAt: number; content: string }>;
    atlasWorldBlock?: string;
    statusPanelBlock?: string;
    communicationEvidence?: string;
    taskContext?: string;
    runtime: TavernSessionContractRuntime;
}): string {
    const allowMemory = input.runtime.managerPromptOptions.includeMemory;
    const allowMap = input.runtime.managerPromptOptions.includeCartography;
    const allowStatus = input.runtime.managerPromptOptions.includeStatus;

    const blocks = [
        ...(allowMemory ? [buildResidentMemoryBlock(input.memoryFiles), ''] : []),
        ...(allowMap ? [String(input.atlasWorldBlock || '[Map atlas world]\nnull').trim(), ''] : []),
        ...(allowStatus ? [String(input.statusPanelBlock || '[Status panel full document]\nnull').trim(), ''] : []),
        ...(allowMemory ? [buildCharacterMemoryFilenameListBlock(input.memoryFiles), ''] : []),
        ...(input.communicationEvidence ? [
            '[Private message events since the previous main turn]',
            '[BEGIN UNTRUSTED PHONE EVIDENCE]',
            input.communicationEvidence,
            '[END UNTRUSTED PHONE EVIDENCE]',
            '',
        ] : []),
        ...(input.taskContext ? [input.taskContext, ''] : []),
        '[Current turn user message]',
        '[BEGIN UNTRUSTED RP EVIDENCE — USER]',
        cleanSourceTextForManager(input.userMessage.content),
        '[END UNTRUSTED RP EVIDENCE — USER]',
        '',
        '[Current turn assistant reply]',
        '[BEGIN UNTRUSTED RP EVIDENCE — ASSISTANT]',
        cleanSourceTextForManager(input.assistantMessage.content),
        '[END UNTRUSTED RP EVIDENCE — ASSISTANT]',
    ];
    return blocks.join('\n');
}

function buildInputSummary(input: { trigger?: string; turn?: number; userOrder?: number; assistantOrder?: number; text?: string }): string {
    return `turn ${Math.max(0, Number(input.turn) || 0)}; messages ${Number(input.userOrder)}/${Number(input.assistantOrder)}; user ${String(input.text || '').length} chars`;
}

async function runManagerOnceWithAdapter(
    adapter: { chat: (task: Record<string, unknown>) => Promise<Record<string, unknown>> },
    providerConfig: Record<string, unknown>,
    options: XbTavernManagerOnceOptions,
): Promise<XbTavernManagerOnceResult> {
    const messages = Array.isArray(options.messages) ? options.messages : [];
    const task: Record<string, unknown> = {
        systemPrompt: messages[0]?.content || '',
        tools: Array.isArray(options.tools) ? options.tools : [],
        toolChoice: options.toolChoice || (options.tools?.length ? 'auto' : 'none'),
        temperature: providerConfig.temperature,
        maxTokens: providerConfig.maxTokens,
        reasoning: {
            enabled: providerConfig.reasoningEnabled,
            effort: providerConfig.reasoningEffort,
        },
        signal: options.signal,
        onStreamProgress: (snapshot: TavernManagerStreamSnapshot) => {
            options.onStreamProgress?.({
                ...(typeof snapshot.text === 'string' ? { text: snapshot.text } : {}),
                ...(Array.isArray(snapshot.thoughts) ? { thoughts: normalizeManagerThoughtBlocks(snapshot.thoughts) } : {}),
                ...(Array.isArray(snapshot.toolCalls) ? { toolCalls: snapshot.toolCalls } : {}),
                ...(snapshot.toolCallDraft ? { toolCallDraft: true } : {}),
            });
        },
    };
    applyTavernToolLoopRequestPlan(task, resolveTavernToolLoopRequestPlan({
        supportsSessionToolLoop: (adapter as { supportsSessionToolLoop?: boolean } | null)?.supportsSessionToolLoop === true,
        messages,
        toolResponses: options.toolResponses,
        finalAnswerReminderText: options.finalAnswerReminderText,
    }));
    const result = await adapter.chat(task);
    return {
        text: String(result?.text || '').trim(),
        provider: String(result?.provider || providerConfig.provider || ''),
        model: String(result?.model || providerConfig.model || ''),
        toolCalls: Array.isArray(result?.toolCalls) ? result.toolCalls : [],
        thoughts: normalizeManagerThoughtBlocks(result?.thoughts),
        providerPayload: result?.providerPayload,
    };
}

function summarizeToolArguments(args: Record<string, unknown> = {}): string {
    return ['filePath', 'path', 'pattern', 'query', 'mode', 'docType', 'docId', 'elementId', 'startOrder', 'endOrder']
        .map((key) => {
            const value = normalizeText(args[key], 160);
            return value ? `${key}: ${value}` : '';
        })
        .filter(Boolean)
        .join('; ');
}

function summarizeToolResult(result: TavernMemoryToolResult | TavernStateToolResult | TavernStatusToolResult | TavernTaskToolResult): string {
    const summary = normalizeText(result.summary || result.error || '', 360);
    if (result.ok !== false) {return summary;}
    const details = (result as { details?: unknown }).details;
    if (!Array.isArray(details) || !details.length) {return summary;}
    const detailText = details
        .slice(0, 2)
        .map((item) => {
            const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            return normalizeText(record.hint || record.error || item, 180);
        })
        .filter(Boolean)
        .join('；');
    return normalizeText([summary, detailText].filter(Boolean).join(' '), 420);
}

function isStateToolName(name = ''): boolean {
    return Object.values(TAVERN_STATE_TOOL_NAMES).includes(name as typeof TAVERN_STATE_TOOL_NAMES[keyof typeof TAVERN_STATE_TOOL_NAMES]);
}

function isStatusToolName(name = ''): boolean {
    return isTavernStatusToolName(name);
}

function isSourceFileToolName(name = ''): boolean {
    return Object.values(TAVERN_SOURCE_FILE_TOOL_NAMES).includes(name as typeof TAVERN_SOURCE_FILE_TOOL_NAMES[keyof typeof TAVERN_SOURCE_FILE_TOOL_NAMES]);
}

function isWebSearchToolName(name = ''): boolean {
    return String(name || '') === TAVILY_TOOL_NAME;
}

function normalizeManagerThoughtBlocks(value: unknown): Array<{ label?: string; text?: string }> {
    if (!Array.isArray(value)) {return [];}
    const thoughts: Array<{ label: string; text: string }> = [];
    value.forEach((item, index) => {
            const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
            const text = String(record.text || record.content || record.thinking || '').trim();
            if (!text) {return;}
            thoughts.push({
                label: String(record.label || record.summary || `思考 ${index + 1}`).trim() || `思考 ${index + 1}`,
                text,
            });
        });
    return thoughts;
}

async function persistRunningManagerToolTrace(managerRunId = '', toolTrace: Array<Record<string, unknown>> = []): Promise<void> {
    const id = String(managerRunId || '').trim();
    if (!id) {return;}
    await updateTavernManagerRun(id, {
        status: 'running',
        toolTrace: toolTrace.map((item) => ({ ...item })),
    });
}

function isManagerAbortLike(error: unknown, signal?: AbortSignal): boolean {
    if (signal?.aborted) {return true;}
    const message = error instanceof Error ? error.message : String(error || '');
    const name = error instanceof Error ? error.name : '';
    return name === 'AbortError' || /abort|aborted|cancelled|canceled/i.test(message);
}

function managerFailureStatus(error: unknown, signal?: AbortSignal): TavernManagerRunRecord['status'] {
    const message = error instanceof Error ? error.message : String(error || '');
    if (isManagerAbortLike(error, signal)) {return 'cancelled';}
    if (
        message === 'manager_source_messages_changed'
        || message === 'assistant_timeline_advanced'
        || message === 'manager_lease_lost'
        || message.startsWith('manager_resource_revision_conflict:')
    ) {return 'superseded';}
    return 'failed';
}

async function rollbackManagerRunWritesIfNeeded(managerRunId = ''): Promise<{
    managerRun: TavernManagerRunRecord | null;
    conflicts: string[];
} | null> {
    const memorySnapshots = await listTavernManagerMemorySnapshots(managerRunId);
    const hasMemoryWrites = memorySnapshots.some((snapshot) => String(snapshot.afterHash || '').trim());
    const statusResult = await rollbackStatusStateForManagerRun(managerRunId);
    const hasStatusWrites = statusResult.rolledBack > 0 || statusResult.skipped > 0 || statusResult.conflicts.length > 0;
    if (!hasMemoryWrites && !hasStatusWrites) {
        return null;
    }
    const memoryResult = hasMemoryWrites
        ? await rollbackManagerRunMemoryWrites(managerRunId)
        : { rolledBack: 0, conflicts: [], skipped: 0 };
    const conflicts = [...memoryResult.conflicts, ...statusResult.conflicts];
    const run = await updateTavernManagerRun(managerRunId, {});
    if (run && conflicts.length) {
        await updateTavernManagerRun(managerRunId, {
            error: mergeRollbackRunError(run.error, conflicts),
        });
    } else if (run && hasStatusWrites && !hasMemoryWrites) {
        await updateTavernManagerRun(managerRunId, {
            status: 'rolled_back',
            error: '',
        });
    }
    return {
        managerRun: await updateTavernManagerRun(managerRunId, {}),
        conflicts,
    };
}

function mergeRollbackRunError(existing = '', conflicts: string[] = []): string {
    const current = String(existing || '').trim();
    if (!conflicts.length) {return current;}
    const prefix = 'rollback_conflict:';
    const currentConflicts = current.startsWith(prefix)
        ? current.slice(prefix.length).split(',').map((item) => item.trim()).filter(Boolean)
        : [];
    const merged = [...new Set([...currentConflicts, ...conflicts])];
    return `${prefix}${merged.join(',')}`;
}

async function restoreQueuedAcceptedTurnAfterCurrentAbort(input: {
    selected: {
        run: TavernManagerRunRecord;
        userMessage: TavernMessageRecord;
        assistantMessage: TavernMessageRecord;
    };
    leaseOwnerId: string;
    onManagerRunSaved?: (run: TavernManagerRunRecord) => void | Promise<void>;
}): Promise<XbTavernManagerRunResult> {
    const runId = input.selected.run.id;
    try {
        await assertRunningTavernManagerRunLease(runId, input.leaseOwnerId);
    } catch {
        const interrupted = await updateTavernManagerRun(runId, {}) || input.selected.run;
        return {
            ok: false,
            managerRun: interrupted,
            error: interrupted.error || 'manager_lease_lost',
        };
    }
    const rollback = await rollbackManagerRunWritesIfNeeded(runId);
    if (!rollback?.conflicts.length) {
        await rebuildTavernMemoryDerivedIndexForLiveSession(input.selected.run.sessionId);
    }
    if (rollback?.conflicts.length) {
        const conflicted = rollback.managerRun || await updateTavernManagerRun(runId, {
            status: 'failed',
            error: mergeRollbackRunError('manager_queue_interrupted_by_current_turn_abort', rollback.conflicts),
        }) || input.selected.run;
        await input.onManagerRunSaved?.(conflicted);
        return {
            ok: false,
            managerRun: conflicted,
            error: conflicted.error || 'manager_queue_interrupted_rollback_conflict',
        };
    }

    try {
        const sourceMessages = await resolveManagerSourceMessagesByOrder(
            input.selected.run.sessionId,
            input.selected.run.userOrder,
            input.selected.run.assistantOrder,
        );
        assertManagerSourceIdentity({
            sourceUserMessageId: input.selected.run.sourceUserMessageId,
            sourceAssistantMessageId: input.selected.run.sourceAssistantMessageId,
            sourceUserCreatedAt: input.selected.run.sourceUserCreatedAt,
            sourceAssistantCreatedAt: input.selected.run.sourceAssistantCreatedAt,
            sourceUserRevision: input.selected.run.sourceUserRevision,
            sourceAssistantRevision: input.selected.run.sourceAssistantRevision,
        }, sourceMessages);
    } catch {
        const cancelled = await updateTavernManagerRun(runId, {
            status: 'cancelled',
            error: 'manager_source_messages_superseded',
        }) || input.selected.run;
        await input.onManagerRunSaved?.(cancelled);
        return {
            ok: false,
            managerRun: cancelled,
            error: cancelled.error,
        };
    }

    await clearTavernManagerRunSnapshots(runId);
    const queuedAgain = await updateTavernManagerRun(runId, {
        status: 'queued',
        leaseOwnerId: '',
        leaseExpiresAt: 0,
        provider: '',
        model: '',
        outputText: '任务已恢复队列，等待按剧情顺序重新维护。',
        parsedAction: '',
        toolTrace: undefined,
        changedFiles: [],
        changedStates: [],
        error: 'manager_queue_interrupted_by_current_turn_abort',
    }) || input.selected.run;
    await input.onManagerRunSaved?.(queuedAgain);
    return {
        ok: false,
        managerRun: queuedAgain,
        error: queuedAgain.error,
    };
}

function throwIfManagerAborted(signal?: AbortSignal) {
    if (!signal?.aborted) {return;}
    const error = new Error('manager_aborted');
    error.name = 'AbortError';
    throw error;
}

export async function runSharedManagerToolLoop(input: {
    sessionId: string;
    agentConfig: Record<string, unknown>;
    caller: 'auto' | 'chat';
    messages: XbTavernMessage[];
    managerRunId?: string;
    turn?: number;
    userOrder?: number;
    assistantOrder?: number;
    beforeWriteGuard?: () => Promise<void> | void;
    sessionContract?: TavernSessionContract;
    contextSnapshot?: XbTavernContext;
    signal?: AbortSignal;
    executeManagerOnce?: (options: XbTavernManagerOnceOptions) => Promise<XbTavernManagerOnceResult>;
    onStreamProgress?: (snapshot: TavernManagerStreamSnapshot) => void;
    onProtocolEvent?: (event: TavernManagerProtocolEvent) => void;
    onStateChanged?: (changes: { changedFiles: string[]; changedStates: string[] }) => void;
}): Promise<{
    text: string;
    provider: string;
    model: string;
    toolTrace: Array<Record<string, unknown>>;
    changedFiles: string[];
    changedStates: string[];
    stagedTaskActions: TavernTaskStagedAction[];
    protocolMessages: XbTavernMessage[];
}> {
    const providerConfig = resolveActiveProviderConfig(input.agentConfig || {}, {
        role: 'delegate',
        timeoutMs: TAVERN_MANAGER_TIMEOUT_MS,
    });
    const defaultAdapter = input.executeManagerOnce
        ? null
        : createAgentAdapter(providerConfig, {
            missingApiKeyMessage: '请先在 API 配置里填写记忆管理员 API。',
        }) as { chat: (task: Record<string, unknown>) => Promise<Record<string, unknown>>; supportsSessionToolLoop?: boolean };
    const executeManagerOnce = input.executeManagerOnce
        || ((options: XbTavernManagerOnceOptions) => runManagerOnceWithAdapter(defaultAdapter!, providerConfig, options));
    const supportsSessionToolLoop = !!defaultAdapter?.supportsSessionToolLoop
        || (input.executeManagerOnce as { supportsSessionToolLoop?: boolean } | undefined)?.supportsSessionToolLoop === true;
    const taskStagingContext: TavernTaskStagingContext | null = input.caller === 'auto'
        && Number.isInteger(Number(input.assistantOrder))
        ? await createTavernTaskStagingContext(input.sessionId, Number(input.assistantOrder))
        : null;
    const hasActiveTaskAtSource = !!taskStagingContext
        && [...taskStagingContext.projected.values()].some((task) => task.status === 'active');
    const managerToolDefinitions = [
        ...getTavernManagerToolDefinitions({
            webSearchEnabled: isManagerWebSearchEnabled(input.agentConfig),
        }),
        ...(hasActiveTaskAtSource ? getTavernTaskToolDefinitions() : []),
    ];
    const tools = input.caller === 'auto'
        ? filterAutoManagerToolDefinitions(managerToolDefinitions, input.sessionContract)
        : managerToolDefinitions;
    const toolTrace: Array<Record<string, unknown>> = [];
    const protocolMessages: XbTavernMessage[] = [];
    const changedFiles = new Set<string>();
    const changedStates = new Set<string>();
    const stateWriteCas = await createTavernStateWriteCasTracker(input.sessionId);
    let resultProvider = '';
    let resultModel = '';
    let reminded = false;
    let pendingToolResponses: TavernToolLoopResponse[] | null = null;
    let pendingFinalAnswerReminderText = '';
    let lastFailedToolSignature = '';
    let failedToolRepeatCount = 0;
    let toolCircuitBreakerTripped = false;
    let lightBrakeInjected = false;
    const lightBrake = createLightBrakeController({
        threshold: 3,
        getMessageText: (name: string, code: string, count: number) => [
            `[工具失败提示] ${name} 已连续 ${count} 次因为 ${code} 失败。`,
            '不要继续原样重复同一个工具调用。先按工具错误改参数；地图首选 MapAtlasRead + MapSceneEdit，用 scene、shape、geo、label 重写失败元素。若仍无法修复，直接向用户汇报阻塞点。',
        ].join('\n'),
    });
    const emitProtocolEvent = (event: TavernManagerProtocolEvent) => {
        input.onProtocolEvent?.(event);
    };

    function buildToolFailureSignature(name: string, args: Record<string, unknown>, error: string): string {
        try {
            return `${String(name || '').trim()}|${safeJson(args)}|${String(error || '').trim()}`;
        } catch {
            return `${String(name || '').trim()}|${String(error || '').trim()}`;
        }
    }

    for (let round = 1; round <= MAX_MANAGER_TOOL_ROUNDS; round += 1) {
        throwIfManagerAborted(input.signal);
        let streamText = '';
        let streamThoughts: Array<{ label?: string; text?: string }> = [];
        const requestPlan = resolveTavernToolLoopRequestPlan({
            supportsSessionToolLoop,
            messages: input.messages,
            toolResponses: pendingToolResponses,
            finalAnswerReminderText: pendingFinalAnswerReminderText,
        });
        const result = await executeManagerOnce({
            agentConfig: input.agentConfig,
            messages: requestPlan.requestMessages,
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
                if (typeof snapshot.text === 'string') {streamText = snapshot.text;}
                if (Array.isArray(snapshot.thoughts)) {streamThoughts = normalizeManagerThoughtBlocks(snapshot.thoughts);}
                input.onStreamProgress?.({
                    ...(typeof snapshot.text === 'string' ? { text: snapshot.text } : {}),
                    ...(Array.isArray(snapshot.thoughts) ? { thoughts: streamThoughts } : {}),
                    ...(Array.isArray(snapshot.toolCalls) ? { toolCalls: snapshot.toolCalls } : {}),
                    ...(snapshot.toolCallDraft ? { toolCallDraft: true } : {}),
                });
            },
        });
        pendingToolResponses = null;
        pendingFinalAnswerReminderText = '';
        throwIfManagerAborted(input.signal);
        const roundVisibleText = String(result.text || streamText || '');
        const normalizedRoundText = roundVisibleText.trim();
        resultProvider = String(result.provider || resultProvider || providerConfig.provider || '');
        resultModel = String(result.model || resultModel || providerConfig.model || '');
        const resultRecord = result as unknown as Record<string, unknown>;
        const resultThoughts = normalizeManagerThoughtBlocks(result.thoughts?.length ? result.thoughts : streamThoughts);
        const toolCalls = resolveResultToolCalls(resultRecord, providerConfig, {
            fallbackPrefix: 'tavern-manager-tool',
        });
        if (!toolCalls.length) {
            if (!hasVisibleText(normalizedRoundText) && toolTrace.length && !reminded) {
                reminded = true;
                const reminder = '工具结果已经齐备，请收束为本轮处理结论。';
                if (supportsSessionToolLoop) {
                    pendingFinalAnswerReminderText = reminder;
                } else {
                    input.messages.push({
                        role: 'system',
                        content: reminder,
                    });
                }
                continue;
            }
            const finalAssistantMessage: XbTavernMessage = {
                role: 'assistant',
                content: normalizedRoundText,
                thoughts: resultThoughts,
                providerPayload: result.providerPayload,
            };
            emitProtocolEvent({ type: 'clear_stream_draft' });
            emitProtocolEvent({ type: 'final_assistant', message: finalAssistantMessage });
            return {
                text: normalizedRoundText,
                provider: resultProvider,
                model: resultModel,
                toolTrace,
                changedFiles: [...changedFiles],
                changedStates: [...changedStates],
                stagedTaskActions: taskStagingContext
                    ? taskStagingContext.actions.map((action) => ({ ...action }))
                    : [],
                protocolMessages: [
                    ...protocolMessages,
                    finalAssistantMessage,
                ],
            };
        }

        const parsedToolCalls = toolCalls.map((toolCall) => ({
            toolCall,
            parsedArguments: parseManagerToolArguments(toolCall),
        }));
        const storedToolCalls = parsedToolCalls.map(({ toolCall, parsedArguments }) => {
            if (parsedArguments.ok) {return toolCall;}
            const rawArguments = String(toolCall.arguments || '');
            return {
                ...toolCall,
                arguments: safeJson({
                    invalidToolArguments: true,
                    argumentLength: rawArguments.length,
                    argumentPreview: rawArguments.slice(0, 500),
                }),
            };
        });

        const assistantToolMessage = buildProviderAssistantToolCallMessage({
            ...resultRecord,
            text: roundVisibleText,
        }, storedToolCalls, {
            fallbackPrefix: 'tavern-manager-tool',
        }) as unknown as XbTavernMessage;
        assistantToolMessage.thoughts = resultThoughts;
        assistantToolMessage.toolCalls = storedToolCalls.map((toolCall) => ({
            id: String(toolCall.id || ''),
            name: String(toolCall.name || ''),
            arguments: String(toolCall.arguments || '{}'),
        }));
        input.messages.push(assistantToolMessage);
        protocolMessages.push(assistantToolMessage);
        emitProtocolEvent({ type: 'clear_stream_draft' });
        emitProtocolEvent({ type: 'assistant_tool_round', message: assistantToolMessage });

        const toolResponses: TavernToolLoopResponse[] = [];
        for (const [toolIndex, parsed] of parsedToolCalls.entries()) {
            const { toolCall, parsedArguments } = parsed;
            const args = parsedArguments.args;
            const beforeToolWrite = async () => {
                await stateWriteCas.assertCurrent(toolCall.name, args);
                await input.beforeWriteGuard?.();
            };
            const afterToolWrite = async () => {
                await stateWriteCas.acceptCurrent(toolCall.name, args);
            };
            throwIfManagerAborted(input.signal);
            const traceEntry: Record<string, unknown> = {
                id: String(toolCall.id || ''),
                round,
                name: toolCall.name,
                status: 'running',
                ok: true,
                args: summarizeToolArguments(args),
                path: '',
                summary: '工具运行中，等待返回。',
                preface: toolIndex === 0 ? normalizedRoundText : '',
                thoughts: toolIndex === 0 ? resultThoughts : [],
                startedAt: Date.now(),
            };
            toolTrace.push(traceEntry);
            await persistRunningManagerToolTrace(input.managerRunId, toolTrace);
            let toolResult: TavernMemoryToolResult | TavernStateToolResult | TavernStatusToolResult | TavernTaskToolResult;
            if (!parsedArguments.ok) {
                toolResult = parsedArguments.result!;
            } else if (input.caller === 'auto' && !isAutoManagerToolAllowed(toolCall.name, input.sessionContract)) {
                toolResult = buildDeniedAutoManagerToolResult(toolCall.name, input.sessionContract);
            } else if (isSourceFileToolName(toolCall.name)) {
                const executeTool = () => executeTavernSourceFileTool(input.sessionId, toolCall.name, args, {
                    caller: input.caller,
                    managerRunId: input.managerRunId,
                    turn: input.turn,
                    sourceUserOrder: input.userOrder,
                    sourceAssistantOrder: input.assistantOrder,
                    beforeWriteGuard: beforeToolWrite,
                    afterWriteObserver: afterToolWrite,
                    contextSnapshot: input.contextSnapshot,
                });
                toolResult = isStateWritingTool(toolCall.name)
                    ? await withSessionStateWriteLock(input.sessionId, executeTool, input.signal)
                    : await executeTool();
            } else if (isStateToolName(toolCall.name)) {
                const executeTool = () => executeTavernStateTool(input.sessionId, toolCall.name, args, {
                    caller: input.caller,
                    managerRunId: input.managerRunId,
                    sourceUserOrder: input.userOrder,
                    sourceAssistantOrder: input.assistantOrder,
                    beforeWriteGuard: beforeToolWrite,
                    afterWriteObserver: afterToolWrite,
                });
                toolResult = isStateWritingTool(toolCall.name)
                    ? await withSessionStateWriteLock(input.sessionId, executeTool, input.signal)
                    : await executeTool();
            } else if (isStatusToolName(toolCall.name)) {
                const executeTool = () => executeTavernStatusTool(input.sessionId, toolCall.name, args, {
                    caller: input.caller,
                    managerRunId: input.managerRunId,
                    sourceUserOrder: input.userOrder,
                    sourceAssistantOrder: input.assistantOrder,
                    beforeWriteGuard: beforeToolWrite,
                    afterWriteObserver: afterToolWrite,
                });
                toolResult = isStateWritingTool(toolCall.name)
                    ? await withSessionStateWriteLock(input.sessionId, executeTool, input.signal)
                    : await executeTool();
            } else if (isTavernTaskToolName(toolCall.name) && taskStagingContext) {
                await beforeToolWrite();
                toolResult = await executeTavernTaskTool(toolCall.name, args, {
                    caller: input.caller,
                    stagingContext: taskStagingContext,
                    actionId: `${String(input.managerRunId || 'manager')}:${String(toolCall.id || `${round}-${toolIndex}`)}`,
                });
            } else if (isWebSearchToolName(toolCall.name)) {
                toolResult = await runTavilySearchTool(input.agentConfig, args, {
                    signal: input.signal,
                    isAbortError: (error: unknown) => error instanceof Error && error.name === 'AbortError',
                }) as unknown as TavernMemoryToolResult;
            } else {
                toolResult = {
                    ok: false,
                    summary: `${toolCall.name || 'tool'} 不可用。`,
                    changed: false,
                    error: 'manager_tool_not_available',
                } as TavernMemoryToolResult;
            }
            const toolError = String(toolResult.error || '');
            if (
                toolError === 'assistant_timeline_advanced'
                || toolError.startsWith('manager_resource_revision_conflict:')
            ) {
                throw new Error(toolError);
            }
            const resultPath = 'path' in toolResult ? toolResult.path : '';
            const resultTaskKey = 'taskId' in toolResult && toolResult.taskId ? `tavern.task/${toolResult.taskId}` : '';
            const resultStateKey = 'docType' in toolResult && toolResult.docType
                ? `${toolResult.docType}/${toolResult.docId || ''}`
                : '';
            const resultTracePath = resultPath || resultStateKey || resultTaskKey;
            if (toolResult.changed && resultPath) {
                changedFiles.add(resultPath);
            }
            if (toolResult.changed && resultStateKey) {
                changedStates.add(resultStateKey);
            }
            if (toolResult.changed && (resultPath || resultStateKey)) {
                input.onStateChanged?.({
                    changedFiles: [...changedFiles],
                    changedStates: [...changedStates],
                });
            }
            Object.assign(traceEntry, {
                status: 'resolved',
                ok: toolResult.ok,
                args: summarizeToolArguments(args),
                path: resultTracePath,
                summary: summarizeToolResult(toolResult),
                error: toolResult.error || '',
                finishedAt: Date.now(),
            });
            if (Number(traceEntry.startedAt)) {
                traceEntry.elapsedMs = Math.max(0, Number(traceEntry.finishedAt) - Number(traceEntry.startedAt));
            }
            await persistRunningManagerToolTrace(input.managerRunId, toolTrace);
            const toolMessage = buildProviderToolResultMessage({
                toolCallId: toolCall.id,
                toolName: toolCall.name,
                content: safeJson(toolResult),
            }) as unknown as XbTavernMessage;
            toolMessage.toolCallId = String(toolCall.id || '');
            toolMessage.toolDisplay = summarizeToolResult(toolResult);
            toolMessage.error = toolResult.ok !== true;
            input.messages.push(toolMessage);
            protocolMessages.push(toolMessage);
            emitProtocolEvent({ type: 'tool_result', message: toolMessage });
            toolResponses.push({
                id: toolCall.id,
                name: toolCall.name,
                response: toolResult,
            });
            if (!toolResult.ok) {
                lightBrake.record(String(toolCall.name || ''), String(toolResult.error || toolResult.summary || 'tool_failed'));
                const signature = buildToolFailureSignature(String(toolCall.name || ''), args, String(toolResult.error || ''));
                if (signature === lastFailedToolSignature) {
                    failedToolRepeatCount += 1;
                } else {
                    lastFailedToolSignature = signature;
                    failedToolRepeatCount = 1;
                }
            } else {
                lightBrake.reset();
                lightBrakeInjected = false;
                lastFailedToolSignature = '';
                failedToolRepeatCount = 0;
            }
        }
        const lightBrakeMessage = lightBrake.getMessage();
        if (lightBrakeMessage && !lightBrakeInjected) {
            lightBrakeInjected = true;
            input.messages.push({
                role: 'system',
                content: lightBrakeMessage,
            });
            const lastToolResponseIndex = toolResponses.length - 1;
            const lastToolResponse = lastToolResponseIndex >= 0 ? toolResponses[lastToolResponseIndex] : null;
            if (lastToolResponse?.response && typeof lastToolResponse.response === 'object' && !Array.isArray(lastToolResponse.response)) {
                toolResponses[lastToolResponseIndex] = {
                    ...lastToolResponse,
                    response: {
                        ...lastToolResponse.response as Record<string, unknown>,
                        lightBrakeHint: lightBrakeMessage,
                    },
                };
            }
        }
        if (failedToolRepeatCount >= 3) {
            if (toolCircuitBreakerTripped) {
                throw new Error('manager_tool_repeat_loop');
            }
            reminded = true;
            toolCircuitBreakerTripped = true;
            const reminder = 'A tool keeps failing with the same arguments and error. Stop repeating it. Either adjust the arguments and strategy, or finish with a summary of what you verified, skipped, or left pending.';
            if (supportsSessionToolLoop) {
                pendingFinalAnswerReminderText = reminder;
            } else {
                input.messages.push({
                    role: 'system',
                    content: reminder,
                });
            }
            lastFailedToolSignature = '';
            failedToolRepeatCount = 0;
        }
        if (supportsSessionToolLoop) {
            pendingToolResponses = toolResponses;
        }
    }

    throw new Error(`工具轮次达到上限（${MAX_MANAGER_TOOL_ROUNDS}），已停止。`);
}

async function resolveCurrentManagerSourceMessages(input: XbTavernManagerRunInput): Promise<{
    userMessage: TavernMessageRecord;
    assistantMessage: TavernMessageRecord;
}> {
    const messages = await resolveManagerSourceMessagesByOrder(input.sessionId, input.userMessage.order, input.assistantMessage.order);
    assertManagerSourceIdentity(resolveExpectedManagerSourceIdentity(input), messages);
    return messages;
}

function resolveExpectedManagerSourceIdentity(input: XbTavernManagerRunInput): TavernManagerRunSourceIdentity {
    return {
        sourceUserMessageId: input.sourceUserMessageId || input.userMessage.messageId,
        sourceAssistantMessageId: input.sourceAssistantMessageId || input.assistantMessage.messageId,
        sourceUserCreatedAt: input.sourceUserCreatedAt ?? input.userMessage.createdAt,
        sourceAssistantCreatedAt: input.sourceAssistantCreatedAt ?? input.assistantMessage.createdAt,
        sourceUserRevision: input.sourceUserRevision ?? input.userMessage.timelineRevision,
        sourceAssistantRevision: input.sourceAssistantRevision ?? input.assistantMessage.timelineRevision,
    };
}

function assertManagerSourceIdentity(
    expected: Pick<XbTavernManagerRunInput,
        | 'sourceUserMessageId'
        | 'sourceAssistantMessageId'
        | 'sourceUserCreatedAt'
        | 'sourceAssistantCreatedAt'
        | 'sourceUserRevision'
        | 'sourceAssistantRevision'
    >,
    messages: { userMessage: TavernMessageRecord; assistantMessage: TavernMessageRecord },
): void {
    assertTavernManagerRunSourceMessages(expected, messages);
}

async function resolveManagerSourceMessagesByOrder(sessionId = '', userOrder = -1, assistantOrder = -1): Promise<{
    userMessage: TavernMessageRecord;
    assistantMessage: TavernMessageRecord;
}> {
    const [userMessage, assistantMessage] = await Promise.all([
        getTavernMessage(sessionId, userOrder),
        getTavernMessage(sessionId, assistantOrder),
    ]);
    const userMatches = userMessage?.role === 'user'
        && userMessage.error !== true;
    const assistantMatches = assistantMessage?.role === 'assistant'
        && assistantMessage.error !== true
        && !['aborted', 'error'].includes(String(assistantMessage.finishReason || '').trim());
    if (!userMatches || !assistantMatches) {
        throw new Error('manager_source_messages_changed');
    }
    return {
        userMessage,
        assistantMessage,
    };
}

async function createOrUpdateManagerRun(input: {
    managerRunId?: string;
    sessionId: string;
    trigger: TavernMaintenanceRunTrigger;
    turn: number;
    userOrder?: number;
    assistantOrder?: number;
    inputSummary: string;
    agentConfig: Record<string, unknown>;
    leaseOwnerId?: string;
}): Promise<TavernManagerRunRecord> {
    const providerConfig = resolveActiveProviderConfig(input.agentConfig || {}, {
        role: 'delegate',
        timeoutMs: TAVERN_MANAGER_TIMEOUT_MS,
    });
    const providerLabel = getXbTavernProviderLabel(String(providerConfig.provider || ''));
    const patch = {
        status: 'running' as const,
        provider: providerLabel,
        model: String(providerConfig.model || ''),
        inputSummary: input.inputSummary,
    };
    if (input.managerRunId && input.leaseOwnerId) {
        await assertRunningTavernManagerRunLease(input.managerRunId, input.leaseOwnerId);
    }
    const record = input.managerRunId
        ? await updateTavernManagerRun(input.managerRunId, patch)
        : await createTavernManagerRun({
            sessionId: input.sessionId,
            trigger: input.trigger,
            turn: input.turn,
            userOrder: Number.isInteger(Number(input.userOrder)) ? Number(input.userOrder) : -1,
            assistantOrder: Number.isInteger(Number(input.assistantOrder)) ? Number(input.assistantOrder) : -1,
            ...patch,
        });
    if (!record) {
        throw new Error('manager_run_missing');
    }
    return record;
}

async function assertManagerRunLease(input: Pick<XbTavernManagerRunInput, 'managerRunId' | 'leaseOwnerId'>): Promise<void> {
    if (!input.managerRunId || !input.leaseOwnerId) {return;}
    await assertRunningTavernManagerRunLease(input.managerRunId, input.leaseOwnerId);
}

function startManagerRunHeartbeat(managerRunId = '', leaseOwnerId = '', signal?: AbortSignal): () => void {
    const id = String(managerRunId || '').trim();
    if (!id) {return () => undefined;}
    let stopped = false;
    const timer = setInterval(() => {
        if (stopped || signal?.aborted) {return;}
        void touchRunningTavernManagerRun(id, {
            leaseOwnerId,
            leaseDurationMs: TAVERN_MANAGER_LEASE_DURATION_MS,
        });
    }, TAVERN_MANAGER_HEARTBEAT_INTERVAL_MS);
    return () => {
        stopped = true;
        clearInterval(timer);
    };
}

async function finalizeManagerRun(record: TavernManagerRunRecord, patch: Partial<TavernManagerRunRecord>): Promise<TavernManagerRunRecord> {
    return await updateTavernManagerRun(record.id, patch) || record;
}

async function rebuildTavernMemoryDerivedIndexForLiveSession(sessionId = ''): Promise<void> {
    const id = String(sessionId || '').trim();
    if (!id || !await getTavernSession(id)) {return;}
    await rebuildTavernMemoryDerivedIndex(id);
}

async function buildAutoManagerMessages(input: XbTavernManagerRunInput, sourceMessages: {
    userMessage: TavernMessageRecord;
    assistantMessage: TavernMessageRecord;
}): Promise<XbTavernMessage[]> {
    const contractRuntime = resolveSessionContractRuntime(input.sessionContract);
    const session = await getTavernSession(input.sessionId);
    const playerName = String(
        input.contextSnapshot?.user?.name
        || sourceMessages.assistantMessage.contextSnapshot?.user?.name
        || sourceMessages.userMessage.contextSnapshot?.user?.name
        || session?.contextSnapshot?.user?.name
        || '',
    ).trim();
    if (contractRuntime.includeMemoryFiles) {
        await ensureTavernMemoryDefaults(input.sessionId);
    }
    const memoryFiles = contractRuntime.includeMemoryFiles
        ? await listTavernMemoryFiles(input.sessionId, { includeStale: true })
        : [];
    const atlasState = contractRuntime.includeStructuredStates
        ? await getTavernAtlasStateForSession(input.sessionId)
        : null;
    const statusState = contractRuntime.includeStatusStates
        ? await getTavernStatusStateForSession(input.sessionId)
        : null;
    const communicationEvidence = await buildTavernCommunicationEvidenceAtAnchor(
        input.sessionId,
        sourceMessages.userMessage.order - 1,
        playerName,
    );
    const tasksAtSource = await listTavernTasksAtAnchor(input.sessionId, sourceMessages.assistantMessage.order);
    const taskContext = buildTavernManagerTaskContextBlock(
        tasksAtSource,
        sourceMessages.assistantMessage.order,
    );
    return [
        {
            role: 'system',
            content: buildManagerSystemPrompt(input.assistantPreset, {
                ...contractRuntime.managerPromptOptions,
                workMode: 'accepted-turn',
                includeWebSearch: isManagerWebSearchEnabled(input.agentConfig),
                playerName,
                hasCommunicationEvidence: !!communicationEvidence,
                includeTasks: !!taskContext,
            }),
        },
        {
            role: 'user',
            content: buildAutoManagerUserPrompt({
                turn: input.turn,
                userMessage: sourceMessages.userMessage,
                assistantMessage: sourceMessages.assistantMessage,
                memoryFiles,
                atlasWorldBlock: atlasState ? buildAtlasWorldBlock(atlasState.document?.data || null) : '',
                statusPanelBlock: statusState ? buildStatusPanelBlock(statusState.status, !!statusState.document) : '',
                communicationEvidence,
                taskContext,
                runtime: contractRuntime,
            }),
        },
    ];
}

async function runManagerTask(input: {
    sessionId: string;
    agentConfig: Record<string, unknown>;
    trigger: TavernMaintenanceRunTrigger;
    turn: number;
    messages: XbTavernMessage[];
    managerRunId?: string;
    inputSummary: string;
    caller: 'auto' | 'chat';
    requireChangedFiles: boolean;
    beforeWriteGuard?: () => Promise<void> | void;
    beforeCompletionGuard?: () => Promise<void> | void;
    deferCompletion?: boolean;
    leaseOwnerId?: string;
    sessionContract?: TavernSessionContract;
    contextSnapshot?: XbTavernContext;
    signal?: AbortSignal;
    executeManagerOnce?: (options: XbTavernManagerOnceOptions) => Promise<XbTavernManagerOnceResult>;
    onStreamProgress?: (snapshot: TavernManagerStreamSnapshot) => void;
    userOrder?: number;
    assistantOrder?: number;
    onProtocolEvent?: (event: TavernManagerProtocolEvent) => void;
}): Promise<{
    ok: boolean;
    managerRun: TavernManagerRunRecord;
    text: string;
    provider: string;
    model: string;
    toolTrace: Array<Record<string, unknown>>;
    changedFiles: string[];
    changedStates: string[];
    stagedTaskActions: TavernTaskStagedAction[];
    protocolMessages: XbTavernMessage[];
    error?: string;
}> {
    const managerRun = await createOrUpdateManagerRun({
        managerRunId: input.managerRunId,
        sessionId: input.sessionId,
        trigger: input.trigger,
        turn: input.turn,
        userOrder: input.userOrder,
        assistantOrder: input.assistantOrder,
        inputSummary: input.inputSummary,
        agentConfig: input.agentConfig,
        leaseOwnerId: input.leaseOwnerId,
    });

    let resultText = '';
    let resultProvider = managerRun.provider || '';
    let resultModel = managerRun.model || '';
    let toolTrace: Array<Record<string, unknown>> = [];
    let changedFiles: string[] = [];
    let changedStates: string[] = [];
    let stagedTaskActions: TavernTaskStagedAction[] = [];
    let protocolMessages: XbTavernMessage[] = [];
    const stopHeartbeat = startManagerRunHeartbeat(managerRun.id, input.leaseOwnerId, input.signal);
    const relayProtocolEvent = (event: TavernManagerProtocolEvent) => {
        if (event.type !== 'clear_stream_draft') {
            protocolMessages.push(event.message);
        }
        input.onProtocolEvent?.(event);
    };
    try {
        const result = await runSharedManagerToolLoop({
            sessionId: input.sessionId,
            agentConfig: input.agentConfig,
            caller: input.caller,
            messages: input.messages,
            managerRunId: managerRun.id,
            turn: input.turn,
            userOrder: input.userOrder,
            assistantOrder: input.assistantOrder,
            beforeWriteGuard: input.beforeWriteGuard,
            sessionContract: input.sessionContract,
            contextSnapshot: input.contextSnapshot,
            signal: input.signal,
            executeManagerOnce: input.executeManagerOnce,
            onStreamProgress: input.onStreamProgress,
            onProtocolEvent: relayProtocolEvent,
        });
        resultText = result.text;
        resultProvider = result.provider || resultProvider;
        resultModel = result.model || resultModel;
        toolTrace = result.toolTrace;
        changedFiles = result.changedFiles;
        changedStates = result.changedStates;
        stagedTaskActions = result.stagedTaskActions;
        protocolMessages = result.protocolMessages.length ? result.protocolMessages : protocolMessages;
        if (input.requireChangedFiles && !changedFiles.length) {
            throw new Error('manager_memory_tool_required');
        }
        await rebuildTavernMemoryDerivedIndexForLiveSession(input.sessionId);
        await input.beforeCompletionGuard?.();
        const taskActionCount = stagedTaskActions.length;
        const changedStructuredStateCount = changedStates.length;
        const changedCount = changedFiles.length + changedStructuredStateCount + taskActionCount;
        const changedTargets = [
            changedFiles.length ? `${changedFiles.length} 个记忆文件` : '',
            changedStructuredStateCount ? `${changedStructuredStateCount} 份结构化状态` : '',
            taskActionCount ? `${taskActionCount} 次正式任务变更` : '',
        ].filter(Boolean);
        const defaultOutput = changedCount
            ? `已维护 ${changedTargets.join('、')}。`
            : '已检查并回复。';
        const completed = await finalizeManagerRun(managerRun, {
            status: input.deferCompletion ? 'running' : 'completed',
            provider: resultProvider,
            model: resultModel,
            outputText: resultText || defaultOutput,
            parsedAction: changedCount ? 'manager_state_updated' : 'memory_checked',
            toolTrace,
            changedFiles,
            changedStates,
            ...(input.deferCompletion ? {} : { leaseOwnerId: '', leaseExpiresAt: 0 }),
            error: '',
        });
        return {
            ok: true,
            managerRun: completed,
            text: resultText,
            provider: resultProvider,
            model: resultModel,
            toolTrace,
            changedFiles,
            changedStates,
            stagedTaskActions,
            protocolMessages,
        };
    } catch (error) {
        const errorText = error instanceof Error ? error.message : String(error || 'manager_failed');
        const status = managerFailureStatus(error, input.signal);
        const failed = await finalizeManagerRun(managerRun, {
            status,
            provider: resultProvider,
            model: resultModel,
            outputText: resultText,
            toolTrace,
            changedFiles,
            changedStates,
            leaseOwnerId: '',
            leaseExpiresAt: 0,
            error: errorText,
        });
        const rolledBack = input.caller === 'auto' || ['cancelled', 'superseded'].includes(status)
            ? await rollbackManagerRunWritesIfNeeded(managerRun.id)
            : null;
        if (!rolledBack?.conflicts.length) {
            await rebuildTavernMemoryDerivedIndexForLiveSession(input.sessionId);
        }
        return {
            ok: false,
            managerRun: rolledBack?.managerRun || failed,
            text: resultText,
            provider: resultProvider,
            model: resultModel,
            toolTrace,
            changedFiles,
            changedStates,
            stagedTaskActions: [],
            protocolMessages,
            error: errorText,
        };
    } finally {
        stopHeartbeat();
    }
}

export async function runXbTavernManagerAfterTurn(input: XbTavernManagerRunInput): Promise<XbTavernManagerRunResult> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {throw new Error('manager_session_required');}
    const sourceIdentity = resolveExpectedManagerSourceIdentity(input);
    const contractRuntime = resolveSessionContractRuntime(input.sessionContract);
    const hasTaskWork = await hasMaintainableTavernTasksAtAnchor(sessionId, input.assistantMessage.order);
    if (!contractRuntime.hasAutomaticManagerWork && !hasTaskWork) {
        await assertManagerRunLease(input);
        const skipped = input.managerRunId
            ? await updateTavernManagerRun(input.managerRunId, {
                status: input.deferCompletion ? 'running' : 'completed',
                outputText: '契约未授权后台记忆或地图维护，本轮已跳过。',
                parsedAction: 'manager_skipped_by_contract',
                ...(input.deferCompletion ? {} : { leaseOwnerId: '', leaseExpiresAt: 0 }),
                error: '',
            })
            : await createTavernManagerRun({
                sessionId,
                trigger: ACCEPTED_TURN_MANAGER_TRIGGER,
                turn: input.turn,
                userOrder: input.userMessage.order,
                assistantOrder: input.assistantMessage.order,
                ...sourceIdentity,
                status: 'completed',
                inputSummary: 'contract skipped',
                outputText: '契约未授权后台记忆或地图维护，本轮已跳过。',
                parsedAction: 'manager_skipped_by_contract',
            });
        return {
            ok: true,
            managerRun: skipped!,
            changedFiles: [],
            changedStates: [],
            protocolMessages: [],
        };
    }
    const inputSummary = buildInputSummary({
        trigger: ACCEPTED_TURN_MANAGER_TRIGGER,
        turn: input.turn,
        userOrder: input.userMessage.order,
        assistantOrder: input.assistantMessage.order,
        text: input.userMessage.content,
    });
    const managerRun = input.managerRunId
        ? await (async () => {
            await assertManagerRunLease(input);
            return updateTavernManagerRun(input.managerRunId, {
            status: 'running',
            inputSummary,
            });
        })()
        : await createTavernManagerRun({
            sessionId,
            trigger: ACCEPTED_TURN_MANAGER_TRIGGER,
            turn: input.turn,
            userOrder: input.userMessage.order,
            assistantOrder: input.assistantMessage.order,
            ...sourceIdentity,
            status: 'queued',
            inputSummary,
        });
    if (!managerRun) {
        throw new Error('manager_run_missing');
    }
    await input.onManagerRunSaved?.(managerRun);
    try {
        const currentSourceMessages = await resolveCurrentManagerSourceMessages(input);
        const currentInputSummary = buildInputSummary({
            trigger: ACCEPTED_TURN_MANAGER_TRIGGER,
            turn: input.turn,
            userOrder: currentSourceMessages.userMessage.order,
            assistantOrder: currentSourceMessages.assistantMessage.order,
            text: currentSourceMessages.userMessage.content,
        });
        const messages = await buildAutoManagerMessages(input, currentSourceMessages);
        const result = await runManagerTask({
            sessionId,
            agentConfig: input.agentConfig,
            trigger: ACCEPTED_TURN_MANAGER_TRIGGER,
            turn: input.turn,
            userOrder: currentSourceMessages.userMessage.order,
            assistantOrder: currentSourceMessages.assistantMessage.order,
            inputSummary: currentInputSummary,
            messages,
            managerRunId: managerRun.id,
            caller: 'auto',
            requireChangedFiles: false,
            beforeWriteGuard: async () => {
                throwIfManagerAborted(input.signal);
                await assertManagerRunLease(input);
                await resolveCurrentManagerSourceMessages(input);
            },
            beforeCompletionGuard: async () => {
                throwIfManagerAborted(input.signal);
                await assertManagerRunLease(input);
                await resolveCurrentManagerSourceMessages(input);
            },
            deferCompletion: input.deferCompletion,
            leaseOwnerId: input.leaseOwnerId,
            sessionContract: input.sessionContract,
            contextSnapshot: input.contextSnapshot || currentSourceMessages.assistantMessage.contextSnapshot || currentSourceMessages.userMessage.contextSnapshot || {},
            signal: input.signal,
            executeManagerOnce: input.executeManagerOnce,
            onProtocolEvent: input.onProtocolEvent,
        });
        if (!result.ok) {
            return {
                ok: false,
                managerRun: result.managerRun,
                protocolMessages: result.protocolMessages,
                error: result.error,
            };
        }
        await resolveCurrentManagerSourceMessages(input);
        const changedFiles = [...(result.changedFiles || [])];
        await assertManagerRunLease(input);
        return {
            ok: true,
            managerRun: result.managerRun,
            changedFiles,
            changedStates: result.changedStates,
            stagedTaskActions: result.stagedTaskActions,
            protocolMessages: result.protocolMessages,
        };
    } catch (error) {
        const errorText = error instanceof Error ? error.message : String(error || 'manager_failed');
        const status = managerFailureStatus(error, input.signal);
        const failed = await finalizeManagerRun(managerRun, {
            status,
            error: errorText,
        });
        const rolledBack = await rollbackManagerRunWritesIfNeeded(managerRun.id);
        if (!rolledBack?.conflicts.length) {
            await rebuildTavernMemoryDerivedIndexForLiveSession(sessionId);
        }
        return {
            ok: false,
            managerRun: rolledBack?.managerRun || failed,
            protocolMessages: [],
            error: errorText,
        };
    }
}

export async function failAndRollbackAcceptedTurnManagerRun(
    managerRunId = '',
    error = 'manager_accepted_snapshot_failed',
): Promise<TavernManagerRunRecord | null> {
    const runId = String(managerRunId || '').trim();
    if (!runId) {return null;}
    await updateTavernManagerRun(runId, {
        status: 'failed',
        leaseOwnerId: '',
        leaseExpiresAt: 0,
        error,
    });
    const rollback = await rollbackManagerRunWritesIfNeeded(runId);
    const run = rollback?.managerRun || await updateTavernManagerRun(runId, {});
    const finalError = rollback?.conflicts.length
        ? mergeRollbackRunError(error, rollback.conflicts)
        : error;
    const failed = run ? await updateTavernManagerRun(runId, {
        status: 'failed',
        leaseOwnerId: '',
        leaseExpiresAt: 0,
        error: finalError,
    }) : null;
    if (run && !rollback?.conflicts.length) {
        await rebuildTavernMemoryDerivedIndexForLiveSession(run.sessionId);
    }
    return failed || run;
}

export async function recoverInterruptedAcceptedTurnManagerRuns(input: {
    sessionId: string;
    onManagerRunSaved?: (run: TavernManagerRunRecord) => void | Promise<void>;
}): Promise<TavernManagerRunRecord[]> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return [];}
    await markExpiredAcceptedTurnManagerRunsInterrupted(sessionId);
    const interrupted = (await listTavernManagerRuns(sessionId))
        .filter((run) => run.status === 'failed' && run.error === 'manager_worker_interrupted');
    const recovered: TavernManagerRunRecord[] = [];
    for (const run of interrupted) {
        const failed = await failAndRollbackAcceptedTurnManagerRun(run.id, 'manager_worker_interrupted') || run;
        await input.onManagerRunSaved?.(failed);
        const failedWithConflict = String(failed.error || '').startsWith('rollback_conflict:');
        if (failedWithConflict) {continue;}
        try {
            const sourceMessages = await resolveManagerSourceMessagesByOrder(sessionId, run.userOrder, run.assistantOrder);
            assertManagerSourceIdentity({
                sourceUserMessageId: run.sourceUserMessageId,
                sourceAssistantMessageId: run.sourceAssistantMessageId,
                sourceUserCreatedAt: run.sourceUserCreatedAt,
                sourceAssistantCreatedAt: run.sourceAssistantCreatedAt,
                sourceUserRevision: run.sourceUserRevision,
                sourceAssistantRevision: run.sourceAssistantRevision,
            }, sourceMessages);
        } catch {
            continue;
        }
        const replacement = await createRecoveredAcceptedTurnManagerRun(run.id);
        if (!replacement?.created) {continue;}
        recovered.push(replacement.run);
        await input.onManagerRunSaved?.(replacement.run);
    }
    return recovered;
}

export async function runNextQueuedAcceptedTurnManager(input: Omit<XbTavernManagerRunInput, 'userMessage' | 'assistantMessage' | 'turn'> & {
    onManagerRunSaved?: (run: TavernManagerRunRecord) => void | Promise<void>;
}): Promise<XbTavernManagerRunResult | null> {
    const sessionId = String(input.sessionId || '').trim();
    if (!sessionId) {return null;}
    const leaseOwnerId = `manager-worker-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const claimedRun = await claimNextQueuedAcceptedTurnManagerRun(sessionId, {
        leaseOwnerId,
        leaseDurationMs: TAVERN_MANAGER_LEASE_DURATION_MS,
    });
    if (!claimedRun) {return null;}
    let selected: {
        run: TavernManagerRunRecord;
        userMessage: TavernMessageRecord;
        assistantMessage: TavernMessageRecord;
    };
    try {
        const sourceMessages = await resolveManagerSourceMessagesByOrder(sessionId, claimedRun.userOrder, claimedRun.assistantOrder);
        selected = {
            run: claimedRun,
            userMessage: sourceMessages.userMessage,
            assistantMessage: sourceMessages.assistantMessage,
        };
    } catch {
        const cancelled = await updateTavernManagerRun(claimedRun.id, {
            status: 'cancelled',
            leaseOwnerId: '',
            leaseExpiresAt: 0,
            error: 'manager_source_messages_changed',
        }) || claimedRun;
        await input.onManagerRunSaved?.(cancelled);
        return {
            ok: false,
            managerRun: cancelled,
            error: cancelled.error,
        };
    }

    const controller = new AbortController();
    let abortedByCurrentTurnSignal = false;
    const abortFromInput = () => {
        abortedByCurrentTurnSignal = true;
        controller.abort();
    };
    if (input.signal?.aborted) {
        abortedByCurrentTurnSignal = true;
        controller.abort();
    } else {
        input.signal?.addEventListener('abort', abortFromInput, { once: true });
    }
    activeAutoManagerRuns.set(selected.run.id, {
        controller,
        sessionId,
        userOrder: selected.userMessage.order,
        assistantOrder: selected.assistantMessage.order,
    });
    try {
        throwIfManagerAborted(controller.signal);
        const result = await runXbTavernManagerAfterTurn({
            ...input,
            managerRunId: selected.run.id,
            turn: selected.run.turn,
            userMessage: selected.userMessage,
            assistantMessage: selected.assistantMessage,
            sourceUserMessageId: selected.run.sourceUserMessageId,
            sourceAssistantMessageId: selected.run.sourceAssistantMessageId,
            sourceUserCreatedAt: selected.run.sourceUserCreatedAt,
            sourceAssistantCreatedAt: selected.run.sourceAssistantCreatedAt,
            sourceUserRevision: selected.run.sourceUserRevision,
            sourceAssistantRevision: selected.run.sourceAssistantRevision,
            leaseOwnerId,
            deferCompletion: true,
            signal: controller.signal,
        });
        if (!result.ok && abortedByCurrentTurnSignal && input.signal?.aborted) {
            return await restoreQueuedAcceptedTurnAfterCurrentAbort({
                selected,
                leaseOwnerId,
                onManagerRunSaved: input.onManagerRunSaved,
            });
        }
        await input.onManagerRunSaved?.(result.managerRun);
        return result;
    } catch (error) {
        if (abortedByCurrentTurnSignal && input.signal?.aborted) {
            return await restoreQueuedAcceptedTurnAfterCurrentAbort({
                selected,
                leaseOwnerId,
                onManagerRunSaved: input.onManagerRunSaved,
            });
        }
        const errorText = error instanceof Error ? error.message : String(error || 'manager_failed');
        const failed = await updateTavernManagerRun(selected.run.id, {
            status: managerFailureStatus(error, controller.signal),
            leaseOwnerId: '',
            leaseExpiresAt: 0,
            error: errorText,
        }) || selected.run;
        await input.onManagerRunSaved?.(failed);
        return {
            ok: false,
            managerRun: failed,
            error: errorText,
        };
    } finally {
        input.signal?.removeEventListener('abort', abortFromInput);
        activeAutoManagerRuns.delete(selected.run.id);
    }
}

export async function describeXbTavernManagerRollbackImpactForMessageRange(sessionId = '', fromOrder = 0): Promise<{
    affectedRuns: number;
    pendingRuns: number;
    writtenMemoryFiles: number;
    writtenStatusPatches: number;
    hasWrittenState: boolean;
}> {
    const id = String(sessionId || '').trim();
    const order = Number(fromOrder);
    if (!id || !Number.isFinite(order)) {
        return { affectedRuns: 0, pendingRuns: 0, writtenMemoryFiles: 0, writtenStatusPatches: 0, hasWrittenState: false };
    }
    const runs = (await listTavernManagerRuns(id))
        .filter((run) => ['accepted_turn', 'after_turn'].includes(run.trigger)
            && (Number(run.userOrder) >= order || Number(run.assistantOrder) >= order));
    const statusImpact = await describeStatusStateRollbackImpactForMessageRange(id, order);
    let pendingRuns = 0;
    let writtenMemoryFiles = 0;
    for (const run of runs) {
        if (['queued', 'running'].includes(run.status)) {
            pendingRuns += 1;
        }
        const memorySnapshots = await listTavernManagerMemorySnapshots(run.id);
        writtenMemoryFiles += memorySnapshots.filter((snapshot) => String(snapshot.afterHash || '').trim()).length;
    }
    return {
        affectedRuns: runs.length,
        pendingRuns,
        writtenMemoryFiles,
        writtenStatusPatches: statusImpact.writtenStatusPatches,
        hasWrittenState: writtenMemoryFiles > 0 || statusImpact.changed,
    };
}

export async function cancelAndRollbackXbTavernManagersForMessageRange(sessionId = '', fromOrder = 0): Promise<{
    runIds: string[];
    rolledBack: number;
    conflicts: string[];
    skipped: number;
}> {
    const id = String(sessionId || '').trim();
    const order = Number(fromOrder);
    if (!id || !Number.isFinite(order)) {
        return { runIds: [], rolledBack: 0, conflicts: [], skipped: 0 };
    }
    await deleteTavernManagerCandidateForMessageRange(id, order);
    activeAutoManagerRuns.forEach((run) => {
        if (run.sessionId !== id) {return;}
        if (run.userOrder >= order || run.assistantOrder >= order) {
            run.controller.abort();
        }
    });
    const memory = await rollbackManagerRunsForMessageRange(id, order);
    const status = await rollbackStatusStateForMessageRange(id, order);
    return {
        runIds: [...new Set([...memory.runIds, ...status.runIds])],
        rolledBack: memory.rolledBack + status.rolledBack,
        conflicts: [...memory.conflicts, ...status.conflicts],
        skipped: memory.skipped + status.skipped,
    };
}
