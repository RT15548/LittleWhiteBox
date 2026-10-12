// Model-list authentication is a preset preference, independent of generation auth.
export const DEFAULT_MODEL_LIST_AUTH = 'x-api-key';
export const MODEL_LIST_AUTH_OPTIONS = Object.freeze([
    { value: DEFAULT_MODEL_LIST_AUTH, label: 'x-api-key' },
    { value: 'bearer', label: 'Bearer' },
]);

export function supportsModelListAuth(provider) {
    return provider === 'anthropic' || provider === 'sillytavern-claude';
}

export function normalizeModelListAuth(value) {
    return value === 'bearer' ? value : DEFAULT_MODEL_LIST_AUTH;
}
