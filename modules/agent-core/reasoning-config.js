export const REASONING_MODE_OPTIONS = Object.freeze([
    Object.freeze({ value: 'inherit', label: '跟随模型默认' }),
    Object.freeze({ value: 'on', label: '开启' }),
    Object.freeze({ value: 'off', label: '关闭' }),
]);

export const REASONING_OUTPUT_OPTIONS = Object.freeze([
    Object.freeze({ value: 'hide', label: '隐藏' }),
    Object.freeze({ value: 'show', label: '显示' }),
]);

export function normalizeReasoningMode(value = '') {
    return value === 'on' || value === 'off' ? value : 'inherit';
}

export function normalizeReasoningOutput(value = '') {
    return value === 'show' ? 'show' : 'hide';
}

function normalizeOptionalEffort(value) {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized || undefined;
}

function normalizeOptionalBudget(value) {
    if (value === undefined || value === null || value === '') return undefined;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.floor(numeric) : undefined;
}

export function normalizeReasoningConfig(source = {}) {
    const normalizedSource = source && typeof source === 'object' ? source : {};
    const effort = normalizeOptionalEffort(normalizedSource.effort);
    const budgetTokens = normalizeOptionalBudget(normalizedSource.budgetTokens);
    return {
        mode: normalizeReasoningMode(normalizedSource.mode),
        output: normalizeReasoningOutput(normalizedSource.output),
        ...(effort ? { effort } : {}),
        ...(budgetTokens !== undefined ? { budgetTokens } : {}),
    };
}

export function isReasoningOutputVisible(reasoning = {}) {
    return normalizeReasoningOutput(reasoning?.output) === 'show';
}
