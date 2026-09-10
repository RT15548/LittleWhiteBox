import { logScenePlannerDiagnostic, logScenePlannerValidationFailure } from './scene-planner-debug.js';

const MAX_TRACKED_RUNS = 100;
const loggedFailureSignatures = new Map();

function failureSignature(failure = {}) {
    return [
        Number(failure.attempt) || 0,
        String(failure.errorCode || ''),
        String(failure.errorPath || ''),
    ].join('\0');
}

function seenFailuresForRun(runId) {
    let signatures = loggedFailureSignatures.get(runId);
    if (!signatures) {
        signatures = new Set();
        loggedFailureSignatures.set(runId, signatures);
        if (loggedFailureSignatures.size > MAX_TRACKED_RUNS) {
            loggedFailureSignatures.delete(loggedFailureSignatures.keys().next().value);
        }
    }
    return signatures;
}

export function logDrawRunPlannerDiagnostics(run, logger = console) {
    if (!run?.id || !Array.isArray(run?.progress?.validationFailures)) return 0;
    const runId = String(run.id);
    const seen = seenFailuresForRun(runId);
    const context = {
        runId,
        presetName: run.progress.presetName,
        provider: run.progress.provider,
        model: run.progress.model,
    };
    for (const attempt of run.progress.attempts || []) {
        const signature = `attempt:${attempt.attempt}`;
        if (!seen.has(signature) && logScenePlannerDiagnostic(
            attempt.errorCode ? '请求失败' : '请求完成', { ...context, ...attempt }, logger,
        )) seen.add(signature);
    }
    let logged = 0;
    for (const failure of run.progress.validationFailures) {
        if (!failure || typeof failure !== 'object') continue;
        const signature = failureSignature(failure);
        if (seen.has(signature)) continue;
        if (logScenePlannerValidationFailure(failure, context, logger)) {
            seen.add(signature);
            logged += 1;
        }
    }
    return logged;
}

export function resetDrawRunPlannerFailureLogsForTests() {
    loggedFailureSignatures.clear();
}
