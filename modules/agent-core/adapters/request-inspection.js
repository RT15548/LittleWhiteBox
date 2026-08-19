export function redactRequestSecrets(value) {
    if (Array.isArray(value)) {
        return value.map((item) => redactRequestSecrets(item));
    }
    if (!value || typeof value !== 'object') {
        return value;
    }
    const redacted = {};
    Object.entries(value).forEach(([key, entry]) => {
        redacted[key] = /authorization|csrf|token|api[-_]?key|proxy_password|password/i.test(key)
            ? '[redacted]'
            : redactRequestSecrets(entry);
    });
    return redacted;
}

export function buildEffectiveReasoningConfig(task = {}, overrides = {}) {
    const requestedMode = String(task.reasoning?.mode || 'inherit');
    const requestedOutput = task.reasoning?.output === 'show' ? 'show' : 'hide';
    const effectiveMode = String(overrides.effectiveMode || requestedMode);
    return {
        reasoningRequestedMode: requestedMode,
        reasoningRequestedOutput: requestedOutput,
        reasoningProfileId: String(overrides.profileId || task.reasoning?.profileId || 'unsupported'),
        reasoningEffectiveMode: effectiveMode,
        reasoningEffort: effectiveMode === 'on'
            ? String(overrides.effort ?? task.reasoning?.effort ?? '')
            : '',
        reasoningBudgetTokens: effectiveMode === 'on'
            && Number.isFinite(Number(overrides.budgetTokens ?? task.reasoning?.budgetTokens))
            ? Number(overrides.budgetTokens ?? task.reasoning?.budgetTokens)
            : null,
        reasoningControlFields: redactRequestSecrets(overrides.controlFields || {}),
        reasoningOutputVisible: effectiveMode !== 'off' && requestedOutput === 'show',
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
