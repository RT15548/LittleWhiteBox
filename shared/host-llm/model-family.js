function normalizeModelName(model = '') {
    return String(model || '').trim().toLowerCase();
}

/**
 * Resolve only from the model name. Provider URLs are routing details and must never
 * participate in model capability decisions. Specific family names win over relay
 * or vendor prefixes such as `openai/...`.
 */
export function resolveModelFamily(model = '') {
    const normalized = normalizeModelName(model);
    if (normalized.includes('deepseek')) return 'deepseek';
    if (normalized.includes('kimi') || normalized.includes('moonshot')) return 'kimi';
    if (normalized.includes('gemini')) return 'gemini';
    if (normalized.includes('claude')) return 'claude';
    if (/(?:^|[/_.-])gpt(?:\d|[/_.-]|$)/.test(normalized)
        || /(?:^|[/_.-])o\d+(?:[/_.-]|$)/.test(normalized)) return 'openai';
    return '';
}
