import {
    INTERNAL_WORKSPACE_TOOL_NAMES,
    WORKSPACE_SOURCES,
    buildWorkspaceOpMeta,
    isWorkspaceMutationTool,
} from '../../shared/workspace-protocol.js';
import { applyWorkspaceObservations, buildWorkspacePreconditions } from '../../shared/workspace-preconditions.js';
import { INVALID_LOOKUP_SCOPE, LOOKUP_SCOPES, describeInvalidLookupScope } from '../../shared/lookup-scope.js';
import { JSAPI_CANCEL_NOTICE } from '../../shared/jsapi-contract.js';
import { buildPatchFailureResult } from '../../../agent-core/tools/apply-patch-execution.js';
import { DRAW_COPY } from '../../../draw/assistant/contract.js';
import { TOOL_NAMES } from '../tooling.js';

export function createHostToolRequestController(deps) {
    const {
        state,
        post,
        pendingToolCalls,
        createRequestId,
        REQUEST_TIMEOUT_MS,
        describeError,
        flushBeforeToolCall,
    } = deps;

    function summarizeToolArguments(args = {}) {
        if (!args || typeof args !== 'object') {
            return {
                kind: typeof args,
            };
        }
        const summary = {
            keys: Object.keys(args),
        };
        if (typeof args.path === 'string') {
            summary.path = args.path;
        }
        if (Array.isArray(args.files)) summary.fileCount = args.files.length;
        return summary;
    }

    function clearPendingToolCalls(runId, error) {
        for (const [requestId, entry] of pendingToolCalls.entries()) {
            if (entry.runId !== runId) continue;
            pendingToolCalls.delete(requestId);
            entry.cleanup?.();
            entry.reject(error);
        }
    }

    function buildWorkspaceRequestMeta(name, args, options = {}) {
        const run = state.activeRun?.id === options.runId ? state.activeRun : null;
        return buildWorkspaceOpMeta(options.workspaceMeta, {
            source: isWorkspaceMutationTool(name) ? WORKSPACE_SOURCES.TOOL : WORKSPACE_SOURCES.HYDRATE,
            baseVersion: Number(state.runtime?.workspace?.version) || 0,
            preconditions: isWorkspaceMutationTool(name)
                ? buildWorkspacePreconditions(name, args, run ? run.workspaceBaseline : state.localSources)
                : undefined,
            path: typeof args?.path === 'string'
                ? args.path
                : (typeof args?.filePath === 'string'
                    ? args.filePath
                    : (typeof args?.fromPath === 'string' ? args.fromPath : '')),
        });
    }

    function postHostToolCall(requestId, name, args, workspaceMeta) {
        console.info('[Assistant][ToolCall] iframe->host', {
            requestId,
            toolName: String(name || ''),
            args: summarizeToolArguments(args),
        });
        post('xb-assistant:tool-call', {
            requestId,
            name,
            arguments: args,
            workspaceMeta,
            assistantSessionId: String(state.assistantSessionId || ''),
        });
    }

    async function callHostTool(name, args, options = {}) {
        const requestId = createRequestId('tool');
        const run = state.activeRun?.id === options.runId ? state.activeRun : null;
        if (run) {
            run.toolRequestIds.add(requestId);
        }
        return await new Promise((resolve, reject) => {
            let settled = false;
            let timer = null;
            let abortHandler = null;
            let dispatched = false;

            const cleanup = () => {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                if (options.signal && abortHandler) {
                    options.signal.removeEventListener('abort', abortHandler);
                }
                const activeRun = state.activeRun;
                if (activeRun && activeRun.id === options.runId) {
                    activeRun.toolRequestIds.delete(requestId);
                }
            };

            const finishReject = (error) => {
                if (settled) return;
                settled = true;
                pendingToolCalls.delete(requestId);
                cleanup();
                reject(error);
            };

            const finishResolve = (value, observations = [], conflictSnapshot) => {
                if (settled) return;
                settled = true;
                pendingToolCalls.delete(requestId);
                cleanup();
                try {
                    if (run && observations.length) run.workspaceBaseline = applyWorkspaceObservations(run.workspaceBaseline, observations);
                    options.onWorkspaceObserved?.(observations);
                    if (conflictSnapshot) options.onWorkspaceConflict?.(conflictSnapshot);
                    resolve(value);
                } catch (error) { reject(error); }
            };

            abortHandler = () => {
                if (dispatched) post('xb-assistant:tool-abort', { requestId });
                finishReject(new Error('tool_aborted'));
            };

            // Drawing owns provider timeouts and may spend time in a remote queue.
            // The user's Stop action still aborts it; a generic text-tool deadline must not orphan paid work.
            if (name !== TOOL_NAMES.DRAW_IMAGE) timer = setTimeout(() => {
                if (dispatched) post('xb-assistant:tool-abort', { requestId });
                finishReject(new Error('tool_timeout'));
            }, REQUEST_TIMEOUT_MS);

            pendingToolCalls.set(requestId, {
                runId: options.runId,
                toolName: name,
                get dispatched() { return dispatched; },
                cleanup,
                resolve: finishResolve,
                reject: finishReject,
            });

            if (options.signal) {
                if (options.signal.aborted) {
                    abortHandler();
                    return;
                }
                options.signal.addEventListener('abort', abortHandler, { once: true });
            }

            const dispatch = async () => {
                const cardPaths = name === TOOL_NAMES.CARD_FILES && args.action === 'save' ? args.paths
                    : name === TOOL_NAMES.CARD_ASSETS && ['set', 'remove'].includes(args.action) ? [args.taskPath] : null;
                const cardFiles = cardPaths?.filter(path => typeof path === 'string').map(path => ({ path }));
                const flush = cardFiles?.length ? { toolName: INTERNAL_WORKSPACE_TOOL_NAMES.BATCH_WRITE_FILES, args: { files: cardFiles } }
                    : isWorkspaceMutationTool(name) ? { toolName: name, args } : null;
                if (options.runId && flush && typeof flushBeforeToolCall === 'function') {
                    const flushed = await flushBeforeToolCall(flush);
                    if (flushed === false) throw new Error('workspace_unsaved_changes');
                }
                if (settled) return;
                const workspaceMeta = buildWorkspaceRequestMeta(name, args, options);
                dispatched = true;
                postHostToolCall(requestId, name, args, workspaceMeta);
                options.onDispatched?.();
            };
            void dispatch().catch(finishReject);
        });
    }

    function buildToolFailureResult(toolName, args, error) {
        if (toolName === TOOL_NAMES.APPLY_PATCH && error?.patchIssue) return buildPatchFailureResult(error);
        const raw = String(error?.message || error || 'tool_failed');
        const [code] = raw.split(':');
        return {
            ok: false,
            toolName,
            path: typeof args?.path === 'string' ? args.path : '',
            error: code || 'tool_failed',
            raw,
            message: describeError(error),
            ...(toolName === TOOL_NAMES.DRAW_IMAGE && ['tool_timeout', 'tool_aborted'].includes(code) ? { message: DRAW_COPY.cancelled } : {}),
            ...(toolName === TOOL_NAMES.RUN_JAVASCRIPT_API && ['tool_timeout', 'tool_aborted'].includes(code)
                ? { message: `${describeError(error)} ${JSAPI_CANCEL_NOTICE}` } : {}),
            ...(code === INVALID_LOOKUP_SCOPE ? {
                parameter: 'scope',
                received: args?.scope,
                allowed: LOOKUP_SCOPES,
                message: describeInvalidLookupScope(args?.scope),
            } : {}),
        };
    }

    function recordToolErrorForLightBrake(run, toolName, errorCode) {
        if (!run || !toolName || !errorCode) return;
        const nextKey = `${toolName}::${errorCode}`;
        if (run.toolErrorStreakKey === nextKey) {
            run.toolErrorStreakCount += 1;
        } else {
            run.toolErrorStreakKey = nextKey;
            run.toolErrorStreakCount = 1;
        }

        if (run.toolErrorStreakCount >= 3 && run.lastLightBrakeKey !== nextKey) {
            run.lightBrakeMessage = `系统提醒：刚刚连续三次调用工具 \`${toolName}\` 都返回了同一个错误：\`${errorCode}\`。请不要继续重复同一路径，改用别的工具、缩小范围，或先向用户确认缺失信息。`;
            run.lastLightBrakeKey = nextKey;
        }
    }

    function resetToolErrorLightBrake(run) {
        if (!run) return;
        run.toolErrorStreakKey = '';
        run.toolErrorStreakCount = 0;
    }

    return {
        buildToolFailureResult,
        callHostTool,
        clearPendingToolCalls,
        recordToolErrorForLightBrake,
        resetToolErrorLightBrake,
    };
}
