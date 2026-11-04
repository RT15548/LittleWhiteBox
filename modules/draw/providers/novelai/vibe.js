// Vibe belongs to NovelAI. Groups are reusable templates; a preset's selections
// are its sole generation/export snapshot. Encodings belong to image + model + info.
const MODEL_KEYS = Object.freeze({
    'nai-diffusion-4-curated-preview': 'v4curated',
    'nai-diffusion-4-full': 'v4full',
    'nai-diffusion-4-5-curated': 'v4-5curated',
    'nai-diffusion-4-5-full': 'v4-5full',
});

export const getVibeModelKey = model => MODEL_KEYS[model] || null;
export function clampVibeInfoExtracted(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.round(Math.min(1, Math.max(0, n)) * 100) / 100 : 1;
}
export function clampVibeStrength(value) {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.6;
}
export function vibeEncodingKey(modelKey, info) {
    return `${modelKey}@${clampVibeInfoExtracted(info).toFixed(2)}`;
}
export function normalizeVibeEncodings(raw) {
    const result = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return result;
    for (const [key, value] of Object.entries(raw)) {
        const [model, info] = key.split('@');
        if (!Object.values(MODEL_KEYS).includes(model) || !/^(?:0\.\d{2}|1\.00)$/.test(info || '')) continue;
        if (key !== vibeEncodingKey(model, Number(info)) || typeof value !== 'string' || !value.trim()) continue;
        result[key] = value;
    }
    return result;
}
