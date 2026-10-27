import { sha256 } from '../../../libs/js-sha256.mjs';

const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
export const memoryDigest = value => sha256(JSON.stringify(canonical(value)) ?? 'null');

// Keep the source filters with their batch/review receipt so maintenance reads
// the same story evidence. This snapshot disappears with that history.
export function memoryPolicy(filterRules = []) {
    return { filterRules: structuredClone(filterRules) };
}

export function isMemoryPolicy(value) {
    return !!value && Array.isArray(value.filterRules)
        && value.filterRules.every(rule => rule && typeof rule.start === 'string' && typeof rule.end === 'string');
}
