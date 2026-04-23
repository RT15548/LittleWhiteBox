export function createApprovalController(deps) {
    const {
        state,
        render,
        pendingApprovals,
        createRequestId,
        normalizeJsApiRequestKind,
    } = deps;

    function clearPendingApprovals(runId, error) {
        for (const [requestId, entry] of pendingApprovals.entries()) {
            if (entry.runId !== runId) continue;
            pendingApprovals.delete(requestId);
            if (state.pendingApproval?.id === requestId) {
                state.pendingApproval = null;
            }
            entry.cleanup?.();
            entry.reject(error);
        }
        render();
    }

    function requestApproval(approvalRequest, options = {}) {
        const requestId = createRequestId('approval');
        const run = state.activeRun?.id === options.runId ? state.activeRun : null;

        state.pendingApproval = {
            id: requestId,
            ...approvalRequest,
            status: 'pending',
        };
        render();

        return new Promise((resolve, reject) => {
            let settled = false;
            let abortHandler = null;

            const cleanup = () => {
                if (run) {
                    run.toolRequestIds.delete(requestId);
                }
                if (options.signal && abortHandler) {
                    options.signal.removeEventListener('abort', abortHandler);
                }
            };

            const clearApprovalPanel = () => {
                if (state.pendingApproval?.id !== requestId) return;
                state.pendingApproval = null;
                render();
            };

            const finishResolve = (value) => {
                if (settled) return;
                settled = true;
                pendingApprovals.delete(requestId);
                cleanup();
                clearApprovalPanel();
                resolve(value);
            };

            const finishReject = (error) => {
                if (settled) return;
                settled = true;
                pendingApprovals.delete(requestId);
                cleanup();
                clearApprovalPanel();
                reject(error);
            };

            abortHandler = () => {
                finishReject(new Error('tool_aborted'));
            };

            if (run) {
                run.toolRequestIds.add(requestId);
            }

            pendingApprovals.set(requestId, {
                runId: options.runId,
                cleanup,
                resolve: (approved) => {
                    finishResolve(approved);
                },
                reject: finishReject,
            });

            if (options.signal) {
                if (options.signal.aborted) {
                    abortHandler();
                    return;
                }
                options.signal.addEventListener('abort', abortHandler, { once: true });
            }
        });
    }

    function requestSlashCommandApproval(command, options = {}) {
        return requestApproval({
            kind: 'slash-command',
            command,
        }, options);
    }

    function requestJsApiApproval(args = {}, analysis = {}, options = {}) {
        return requestApproval({
            kind: 'jsapi-run',
            code: String(args.code || '').trim(),
            purpose: String(args.purpose || '').trim(),
            apiPaths: Array.isArray(args.apiPaths)
                ? args.apiPaths.map((item) => String(item || '').trim()).filter(Boolean)
                : [],
            safety: String(args.safety || '').trim(),
            expectedOutput: String(args.expectedOutput || '').trim(),
            requestKind: normalizeJsApiRequestKind(analysis.requestKind),
            usedApis: Array.isArray(analysis.usedApis) ? analysis.usedApis : [],
            calledApis: Array.isArray(analysis.calledApis) ? analysis.calledApis : [],
            calledApiSemantics: analysis.calledApiSemantics && typeof analysis.calledApiSemantics === 'object'
                ? analysis.calledApiSemantics
                : {},
        }, options);
    }

    function requestSkillGenerationApproval(args = {}, options = {}) {
        return requestApproval({
            kind: 'generate-skill',
            title: String(args.title || '').trim(),
            reason: String(args.reason || '').trim(),
            sourceSummary: String(args.sourceSummary || '').trim(),
        }, options);
    }

    return {
        clearPendingApprovals,
        requestApproval,
        requestJsApiApproval,
        requestSkillGenerationApproval,
        requestSlashCommandApproval,
    };
}
