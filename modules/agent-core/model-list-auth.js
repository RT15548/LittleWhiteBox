// Model-list authentication is a preset preference, independent of generation auth.
export const DEFAULT_MODEL_LIST_AUTH = 'x-api-key';
export const MODEL_LIST_AUTH_OPTIONS = Object.freeze([
    { value: DEFAULT_MODEL_LIST_AUTH, label: 'x-api-key' },
    { value: 'bearer', label: 'Bearer' },
]);
const GOOGLE_MODEL_LIST_AUTH_OPTIONS = Object.freeze([
    { value: 'x-goog-api-key', label: 'Google API Key' },
    MODEL_LIST_AUTH_OPTIONS[1],
]);

export function getModelListAuthOptions(provider) {
    return provider === 'google' || provider === 'sillytavern-google'
        ? GOOGLE_MODEL_LIST_AUTH_OPTIONS : MODEL_LIST_AUTH_OPTIONS;
}

export function supportsModelListAuth(provider) {
    return ['anthropic', 'sillytavern-claude', 'google', 'sillytavern-google'].includes(provider);
}

export function normalizeModelListAuth(value, provider) {
    return value === 'bearer' ? value : getModelListAuthOptions(provider)[0].value;
}
