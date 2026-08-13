// Gold Eval - auditable preparation accumulated between two natural query boundaries.

import { assertSuccessfulExternalTrace } from './transport-cassette.mjs';

export function mergeNaturalPreparation(target, value, context) {
    if (!value) return target;
    const calls = Number(value.externalCalls ?? 0);
    const requests = Number(value.externalRequests ?? value.transportTrace?.length ?? 0);
    const trace = Array.isArray(value.transportTrace) ? value.transportTrace : [];
    if (!Number.isInteger(calls) || calls < 0 || !Number.isInteger(requests) || requests < 0
        || calls !== requests || requests !== trace.length) {
        throw new Error(`natural preparation network计数不一致: ${context}`);
    }

    let health;
    try {
        health = assertSuccessfulExternalTrace(trace, {
            caseId: value.caseId || null,
            stage: context,
            allowEmpty: true,
            allowRecoveredTransient: true,
            allowUnrecoveredTransient: value.allowUnrecoveredTransient === true,
        });
    } catch (error) {
        error.externalTrace = trace.map(row => ({ ...row, preparationStage: context }));
        error.externalCalls = calls;
        error.externalRequests = requests;
        throw error;
    }

    target.externalCalls += calls;
    target.externalRequests += requests;
    target.transportTrace.push(...trace.map(row => ({ ...row, preparationStage: context })));
    target.steps.push({
        stage: context,
        floor: value.floor ?? null,
        externalCalls: calls,
        recoveredTransientAttempts: health?.recovered || [],
        pendingTransientAttempts: health?.pending || [],
        result: value.result || null,
    });
    return target;
}

export function assertNaturalPreparationHealthy(preparation, { caseId = null, stage = 'natural-query-boundary' } = {}) {
    return assertSuccessfulExternalTrace(preparation?.transportTrace || [], {
        caseId,
        stage,
        allowEmpty: true,
        allowRecoveredTransient: true,
        // Cross-turn L0 retry is driven by real user turns, not by the transport
        // retry limit used for a single request invocation.
        maxAttemptsPerRequest: null,
    });
}

export function validateRecoverableNaturalPreparation(preparation, { caseId = null, stage = 'natural-recovery' } = {}) {
    return assertSuccessfulExternalTrace(preparation?.transportTrace || [], {
        caseId,
        stage,
        allowEmpty: true,
        allowRecoveredTransient: true,
        allowUnrecoveredTransient: true,
        maxAttemptsPerRequest: null,
    });
}
