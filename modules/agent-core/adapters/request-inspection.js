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
    };
}
