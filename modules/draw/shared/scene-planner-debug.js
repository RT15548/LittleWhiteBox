import { redactRequestSecrets } from '../../agent-core/adapters/request-inspection.js';

// Use log, not the monitored error/warn channels or an intercepted module prefix.
// Planner diagnostics belong in F12 even when the LittleWhiteBox monitor is off.
export function logScenePlannerDiagnostic(label, details, logger = console) {
    try {
        logger.log(`[Scene Planner] ${label}`, redactRequestSecrets(details));
        return true;
    } catch {
        // A console implementation must never interrupt generation or recovery.
        return false;
    }
}

export function logScenePlannerValidationFailure(failure, context = {}, logger = console) {
    let output = String(failure.modelOutput || '');
    try {
        output = JSON.parse(output);
    } catch {
        // A diagnostic from an older backend may contain a truncated JSON string.
    }
    return logScenePlannerDiagnostic('Tool 返回未通过校验', {
        event: 'scene_planner_tool_validation_failed',
        ...context,
        attempt: failure.attempt,
        startedAt: failure.startedAt,
        durationMs: failure.durationMs,
        errorCode: failure.errorCode,
        errorMessage: failure.errorMessage,
        errorPath: failure.errorPath,
        errorRule: failure.errorRule,
        received: failure.received,
        expected: failure.expected,
        llmResult: output,
        llmResultTruncated: failure.modelOutputTruncated === true,
    }, logger);
}
