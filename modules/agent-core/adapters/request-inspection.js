export function redactRequestSecrets(value) {
    if (Array.isArray(value)) {
        return value.map((item) => redactRequestSecrets(item));
    }
    if (!value || typeof value !== 'object') {
        return value;
    }
    const redacted = {};
    Object.entries(value).forEach(([key, entry]) => {
        redacted[key] = /^(?:authorization|proxy[-_]?authorization|(?:x[-_])?csrf(?:[-_]?token)?|token|access[-_]?token|refresh[-_]?token|id[-_]?token|api[-_]?key|x[-_](?:goog[-_])?api[-_]?key|proxy[-_]?password|password|client[-_]?secret)$/i.test(key)
            ? '[redacted]'
            : redactRequestSecrets(entry);
    });
    return redacted;
}

export function buildEffectiveReasoningConfig(task = {}, overrides = {}) {
    const effectiveReasoning = overrides.reasoning && typeof overrides.reasoning === 'object'
        ? overrides.reasoning
        : {};
    const requestedMode = String(task.reasoning?.mode || 'inherit');
    const requestedOutput = task.reasoning?.output === 'show' || task.reasoning?.output === 'hide'
        ? task.reasoning.output
        : (effectiveReasoning.output === 'show' ? 'show' : 'hide');
    const effectiveMode = String(effectiveReasoning.mode || overrides.effectiveMode || requestedMode);
    return {
        reasoningRequestedMode: requestedMode,
        reasoningRequestedOutput: requestedOutput,
        reasoningProfileId: String(
            effectiveReasoning.profileId
            || overrides.profileId
            || task.reasoning?.profileId
            || 'unsupported',
        ),
        reasoningEffectiveMode: effectiveMode,
        reasoningEffort: effectiveMode === 'on'
            ? String(overrides.effort ?? effectiveReasoning.effort ?? task.reasoning?.effort ?? '')
            : '',
        reasoningBudgetTokens: effectiveMode === 'on'
            && Number.isFinite(Number(
                overrides.budgetTokens
                ?? effectiveReasoning.budgetTokens
                ?? task.reasoning?.budgetTokens,
            ))
            ? Number(
                overrides.budgetTokens
                ?? effectiveReasoning.budgetTokens
                ?? task.reasoning?.budgetTokens,
            )
            : null,
        reasoningControlFields: redactRequestSecrets(overrides.controlFields || {}),
        reasoningOutputVisible: effectiveMode !== 'off' && effectiveReasoning.output === 'show',
    };
}

export function buildSdkRequestInspection(input = {}) {
    return {
        provider: input.provider || '',
        model: input.model || '',
        transport: input.transport || 'sdk',
        request: redactRequestSecrets({
            url: input.url || '',
            method: input.method || 'POST',
            headers: input.headers || {},
            body: input.body || {},
            sdk: input.sdk || undefined,
        }),
        ...(input.effectiveConfig ? { effectiveConfig: input.effectiveConfig } : {}),
    };
}
