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
    const enabled = typeof overrides.enabled === 'boolean'
        ? overrides.enabled
        : task.reasoning?.enabled === true;
    const includeOutput = enabled && (typeof overrides.includeOutput === 'boolean'
        ? overrides.includeOutput
        : task.reasoning?.includeOutput !== false);
    return {
        reasoningEnabled: enabled,
        reasoningEffort: enabled
            ? String(overrides.effort ?? task.reasoning?.effort ?? '')
            : '',
        reasoningIncludeOutput: includeOutput,
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
