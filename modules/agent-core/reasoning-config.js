export const REASONING_MODE_OPTIONS = Object.freeze([
    Object.freeze({ value: 'inherit', label: '跟随模型默认' }),
    Object.freeze({ value: 'on', label: '开启' }),
    Object.freeze({ value: 'off', label: '关闭' }),
]);

export function normalizeReasoningMode(value = '') {
    return value === 'on' || value === 'off' ? value : 'inherit';
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
        ...(effort ? { effort } : {}),
        ...(budgetTokens !== undefined ? { budgetTokens } : {}),
    };
}

export function isReasoningOutputVisible(reasoning = {}) {
    return reasoning?.mode !== 'off' && reasoning?.output === 'show';
}
