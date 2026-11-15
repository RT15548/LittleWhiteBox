// Model-list authentication is a preset preference, independent of generation auth.
export const DEFAULT_MODEL_LIST_AUTH = 'bearer';
export const MODEL_LIST_AUTH_OPTIONS = Object.freeze([
    { value: DEFAULT_MODEL_LIST_AUTH, label: 'Bearer' },
    { value: 'x-api-key', label: 'x-api-key' },
]);
const GOOGLE_MODEL_LIST_AUTH_OPTIONS = Object.freeze([
    MODEL_LIST_AUTH_OPTIONS[0],
    { value: 'x-goog-api-key', label: 'Google API Key' },
]);

export function getModelListAuthOptions(provider) {
    return provider === 'google' || provider === 'sillytavern-google'
        ? GOOGLE_MODEL_LIST_AUTH_OPTIONS : MODEL_LIST_AUTH_OPTIONS;
}

export function supportsModelListAuth(provider) {
    return ['anthropic', 'sillytavern-claude', 'google', 'sillytavern-google'].includes(provider);
}

export function normalizeModelListAuth(value, provider) {
    return getModelListAuthOptions(provider).some(option => option.value === value) ? value : DEFAULT_MODEL_LIST_AUTH;
}
