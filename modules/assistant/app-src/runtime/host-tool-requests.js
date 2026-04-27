import {
    WORKSPACE_SOURCES,
    buildWorkspaceOpMeta,
    isWorkspaceMutationTool,
} from '../../shared/workspace-protocol.js';

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
        if (typeof args.patchText === 'string') {
            summary.patchLength = args.patchText.length;
        }
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
        return buildWorkspaceOpMeta(options.workspaceMeta, {
            source: isWorkspaceMutationTool(name) ? WORKSPACE_SOURCES.TOOL : WORKSPACE_SOURCES.HYDRATE,
            baseVersion: Number(state.runtime?.workspace?.version) || 0,
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
        });
    }

    async function callHostTool(name, args, options = {}) {
        if (typeof flushBeforeToolCall === 'function') {
            await flushBeforeToolCall({
                toolName: String(name || ''),
                args,
                runId: options.runId || '',
            });
        }
        const workspaceMeta = buildWorkspaceRequestMeta(name, args, options);
        const requestId = createRequestId('tool');
        const run = state.activeRun;
        if (run && run.id === options.runId) {
            run.toolRequestIds.add(requestId);
        }
        return await new Promise((resolve, reject) => {
            let settled = false;
            let timer = null;
            let abortHandler = null;

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

            const finishResolve = (value) => {
                if (settled) return;
                settled = true;
                pendingToolCalls.delete(requestId);
                cleanup();
                resolve(value);
            };

            abortHandler = () => {
                post('xb-assistant:tool-abort', { requestId });
                finishReject(new Error('tool_aborted'));
            };

            timer = setTimeout(() => {
                post('xb-assistant:tool-abort', { requestId });
                finishReject(new Error('tool_timeout'));
            }, REQUEST_TIMEOUT_MS);

            pendingToolCalls.set(requestId, {
                runId: options.runId,
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

            postHostToolCall(requestId, name, args, workspaceMeta);
        });
    }

    function postHostToolCallWithoutResponse(name, args, options = {}) {
        const workspaceMeta = buildWorkspaceRequestMeta(name, args, options);
        const requestId = createRequestId('tool');
        postHostToolCall(requestId, name, args, workspaceMeta);
        return requestId;
    }

    function buildToolFailureResult(toolName, args, error) {
        const raw = String(error?.message || error || 'tool_failed');
        const [code] = raw.split(':');
        return {
            ok: false,
            toolName,
            path: typeof args?.path === 'string' ? args.path : '',
            error: code || 'tool_failed',
            raw,
            message: describeError(error),
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
        postHostToolCallWithoutResponse,
        clearPendingToolCalls,
        recordToolErrorForLightBrake,
        resetToolErrorLightBrake,
    };
}
