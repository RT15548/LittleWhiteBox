import { normalizeAgentSettings } from '../../../../agent-core/config.js';
import { resolveActiveProviderConfig } from '../../../../agent-core/provider-resolution.js';
import type { XiaobaiOsAgentGateway } from '../../../capabilities/agent/gateway.js';
import { jsonValuesEqual } from '../../../host/json-values-equal.js';
import type { TasksActionResult, TasksService } from '../application/service.js';
import type { TaskGenerationContextAdapter } from '../host/context-adapter.js';
import { buildTaskBoardPrompt } from './board-prompt.js';
import { buildTaskCandidatePrompt } from './candidate-prompt.js';
import { compileTaskBoardResponse, compileTaskCandidateResponse } from './response-compiler.js';
import type {
    BoardCompileResult,
    CandidateCompileResult,
    RecruitingTaskPromptData,
    TaskCompileStatus,
    TaskGenerationBoundary,
    TaskGenerationPrompt,
} from './types.js';

type UnknownRecord = Record<string, unknown>;
type GenerationKind = TaskGenerationBoundary['kind'];

export interface TaskGenerationRequestResult<TCompile extends BoardCompileResult | CandidateCompileResult> {
    readonly kind: GenerationKind;
    readonly status: TaskCompileStatus | 'cancelled';
    readonly changed: boolean;
    readonly compile?: TCompile;
    readonly action?: TasksActionResult;
}

export interface TaskGenerationRequests {
    refreshBoard: () => Promise<TaskGenerationRequestResult<BoardCompileResult>>;
    refreshCandidates: (input: {
        taskId: string;
        expectedTaskRevision: number;
        expectedEventId: string;
    }) => Promise<TaskGenerationRequestResult<CandidateCompileResult>>;
    cancelAll: (reason?: string) => void;
}

interface TaskGenerationRequestDependencies {
    readonly gateway: Pick<XiaobaiOsAgentGateway, 'loadConfig' | 'openSession'>;
    readonly tasks: Pick<
        TasksService,
        'readCurrent' | 'getWriteState' | 'createActionId' | 'replaceBoard' | 'replaceCandidates'
    >;
    readonly context: TaskGenerationContextAdapter;
    readonly isMainGenerationActive: () => boolean;
    readonly now?: () => number;
    readonly report?: (error: unknown) => void;
}

interface ActiveRequest {
    readonly token: number;
    readonly controller: AbortController;
}

function responseText(result: UnknownRecord): string {
    return String(result.text || '');
}

function cancelled<TCompile extends BoardCompileResult | CandidateCompileResult>(
    kind: GenerationKind,
): TaskGenerationRequestResult<TCompile> {
    return { kind, status: 'cancelled', changed: false };
}

function isStaleRequestError(error: unknown): boolean {
    return error instanceof Error
        && (error.message === 'tasks_chat_changed' || error.message === 'tasks_commit_guard_failed');
}

function recruitingPromptData(record: ReturnType<TaskGenerationRequestDependencies['tasks']['readCurrent']>['records'][number]): RecruitingTaskPromptData {
    return {
        issuer: { displayName: record.issuer.displayName },
        title: record.title,
        objective: record.objective,
        ...(record.requirements ? { requirements: record.requirements } : {}),
        location: record.location,
        risk: record.risk,
        reward: record.reward,
    };
}

export function createTaskGenerationRequests({
    gateway,
    tasks,
    context,
    isMainGenerationActive,
    now = Date.now,
    report = error => console.error('[LittleWhiteBox] Tasks 显式生成失败', error),
}: TaskGenerationRequestDependencies): TaskGenerationRequests {
    let nextToken = 0;
    let boardRequest: ActiveRequest | null = null;
    let candidateRequest: ActiveRequest | null = null;

    function active(kind: GenerationKind): ActiveRequest | null {
        return kind === 'board' ? boardRequest : candidateRequest;
    }

    function begin(kind: GenerationKind): ActiveRequest {
        cancel(kind, 'replaced');
        const request = { token: ++nextToken, controller: new AbortController() };
        if (kind === 'board') {boardRequest = request;} else {candidateRequest = request;}
        return request;
    }

    function cancel(kind: GenerationKind, _reason = 'cancelled'): void {
        const request = active(kind);
        request?.controller.abort();
        if (kind === 'board') {boardRequest = null;} else {candidateRequest = null;}
    }

    function finish(kind: GenerationKind, request: ActiveRequest): void {
        if (active(kind) !== request) {return;}
        if (kind === 'board') {boardRequest = null;} else {candidateRequest = null;}
    }

    function requestActive(kind: GenerationKind, request: ActiveRequest): boolean {
        return active(kind)?.token === request.token && !request.controller.signal.aborted;
    }

    function ready(kind: GenerationKind, request: ActiveRequest, chatIdentity: string): boolean {
        if (!requestActive(kind, request) || isMainGenerationActive() || tasks.getWriteState() !== 'ready') {return false;}
        try {
            return context.currentChatIdentity() === chatIdentity;
        } catch {
            return false;
        }
    }

    async function captureCurrent(includeWorldInfo = true): Promise<Awaited<ReturnType<TaskGenerationContextAdapter['capture']>>> {
        try { return await context.capture({ includeWorldInfo }); }
        catch (error) {
            if (isStaleRequestError(error)) { throw error; }
            throw new Error('tasks_context_failed', { cause: error });
        }
    }

    function assertConfigured(value: unknown): void {
        const config = normalizeAgentSettings((value || {}) as UnknownRecord);
        const provider = resolveActiveProviderConfig(config);
        if (!String(provider.model || '').trim()) {
            throw new Error('tasks_agent_not_configured');
        }
    }

    async function runPrompt(
        request: ActiveRequest,
        prompt: TaskGenerationPrompt,
        preflight: () => boolean,
    ): Promise<UnknownRecord> {
        let loaded: unknown;
        try { loaded = await gateway.loadConfig(); }
        catch (error) { throw new Error('tasks_config_load_failed', { cause: error }); }
        if (!preflight()) {throw new DOMException('Aborted', 'AbortError');}
        assertConfigured(loaded);
        let session: Awaited<ReturnType<typeof gateway.openSession>>;
        try { session = await gateway.openSession(loaded); }
        catch (error) { throw new Error('tasks_agent_session_failed', { cause: error }); }
        if (!preflight()) {throw new DOMException('Aborted', 'AbortError');}
        return await session.run({
            systemPrompt: prompt.systemPrompt,
            messages: prompt.messages.map(message => ({ ...message })),
            tools: [],
            signal: request.controller.signal,
        });
    }

    function boardCas(expectedBoardId: string | null): boolean {
        const board = tasks.readCurrent().domain?.board ?? null;
        return (board?.boardId ?? null) === expectedBoardId;
    }

    function candidateRecord(input: {
        taskId: string;
        expectedTaskRevision: number;
        expectedEventId: string;
    }) {
        const record = tasks.readCurrent().records.find(candidate => candidate.taskId === input.taskId);
        return record?.source === 'published'
            && record.status === 'recruiting'
            && record.taskRevision === input.expectedTaskRevision
            && record.eventId === input.expectedEventId
            ? record
            : null;
    }

    async function boundaryStillCurrent(
        kind: GenerationKind,
        request: ActiveRequest,
        boundary: TaskGenerationBoundary,
    ): Promise<{ valid: boolean }> {
        if (!requestActive(kind, request) || isMainGenerationActive() || tasks.getWriteState() !== 'ready') {
            return { valid: false };
        }
        try {
            const current = await captureCurrent(false);
            const casValid = boundary.kind === 'board'
                ? boardCas(boundary.expectedBoardId)
                : !!candidateRecord(boundary);
            return {
                valid: requestActive(kind, request)
                    && !isMainGenerationActive()
                    && tasks.getWriteState() === 'ready'
                    && current.chatIdentity === boundary.chatIdentity
                    // World info/news are frozen reference material, not live task/story state.
                    && jsonValuesEqual(
                        { ...current.contextSnapshot, worldInfo: null, worldContent: null },
                        { ...boundary.contextSnapshot, worldInfo: null, worldContent: null },
                    )
                    && casValid,
            };
        } catch {
            return { valid: false };
        }
    }

    async function refreshBoard(): Promise<TaskGenerationRequestResult<BoardCompileResult>> {
        const kind = 'board' as const;
        const request = begin(kind);
        try {
            if (isMainGenerationActive() || tasks.getWriteState() !== 'ready') {return cancelled(kind);}
            const view = tasks.readCurrent();
            const captured = await captureCurrent();
            const boundary: Extract<TaskGenerationBoundary, { kind: 'board' }> = {
                kind,
                chatIdentity: captured.chatIdentity,
                contextSnapshot: captured.contextSnapshot,
                expectedBoardId: view.domain?.board?.boardId ?? null,
            };
            if (!ready(kind, request, boundary.chatIdentity) || !boardCas(boundary.expectedBoardId)) {
                return cancelled(kind);
            }
            const response = await runPrompt(
                request,
                buildTaskBoardPrompt(boundary.contextSnapshot),
                () => ready(kind, request, boundary.chatIdentity) && boardCas(boundary.expectedBoardId),
            );
            if (!requestActive(kind, request)) {return cancelled(kind);}
            const compile = compileTaskBoardResponse(responseText(response));
            const checked = await boundaryStillCurrent(kind, request, boundary);
            if (!checked.valid) {return cancelled(kind);}
            if (!compile.changed || !compile.data) {
                return { kind, status: compile.status, changed: false, compile };
            }
            const action = await tasks.replaceBoard({
                expectedBoardId: boundary.expectedBoardId,
                listings: compile.data.listings,
                generatedAt: now(),
            }, async () => (await boundaryStillCurrent(kind, request, boundary)).valid);
            return { kind, status: compile.status, changed: action.changed, compile, action };
        } catch (error) {
            if (request.controller.signal.aborted || !requestActive(kind, request) || isStaleRequestError(error)) {
                return cancelled(kind);
            }
            report(error);
            throw error;
        } finally {
            finish(kind, request);
        }
    }

    async function refreshCandidates(input: {
        taskId: string;
        expectedTaskRevision: number;
        expectedEventId: string;
    }): Promise<TaskGenerationRequestResult<CandidateCompileResult>> {
        const kind = 'candidates' as const;
        const request = begin(kind);
        try {
            if (isMainGenerationActive() || tasks.getWriteState() !== 'ready') {return cancelled(kind);}
            const record = candidateRecord(input);
            if (!record) {throw new Error('task_generation_candidate_conflict');}
            const captured = await captureCurrent();
            const boundary: Extract<TaskGenerationBoundary, { kind: 'candidates' }> = {
                kind,
                chatIdentity: captured.chatIdentity,
                contextSnapshot: captured.contextSnapshot,
                ...input,
            };
            if (!ready(kind, request, boundary.chatIdentity) || !candidateRecord(boundary)) {
                return cancelled(kind);
            }
            const response = await runPrompt(
                request,
                buildTaskCandidatePrompt(boundary.contextSnapshot, recruitingPromptData(record)),
                () => ready(kind, request, boundary.chatIdentity) && !!candidateRecord(boundary),
            );
            if (!requestActive(kind, request)) {return cancelled(kind);}
            const compile = compileTaskCandidateResponse(responseText(response), record.candidates);
            const checked = await boundaryStillCurrent(kind, request, boundary);
            if (!checked.valid) {return cancelled(kind);}
            if (!compile.changed || compile.data?.mode !== 'replace') {
                return { kind, status: compile.status, changed: false, compile };
            }
            const actionId = tasks.createActionId();
            const action = await tasks.replaceCandidates({
                actionId,
                taskId: boundary.taskId,
                expectedTaskRevision: boundary.expectedTaskRevision,
                expectedEventId: boundary.expectedEventId,
                candidates: compile.data.candidates,
            }, async () => (await boundaryStillCurrent(kind, request, boundary)).valid);
            return { kind, status: compile.status, changed: action.changed, compile, action };
        } catch (error) {
            if (request.controller.signal.aborted || !requestActive(kind, request) || isStaleRequestError(error)) {
                return cancelled(kind);
            }
            report(error);
            throw error;
        } finally {
            finish(kind, request);
        }
    }

    return Object.freeze({
        refreshBoard,
        refreshCandidates,
        cancelAll(reason?: string) {
            cancel('board', reason);
            cancel('candidates', reason);
        },
    });
}
