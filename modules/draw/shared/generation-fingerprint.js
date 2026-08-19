export function stableSerialize(value, seen = new WeakSet()) {
    if (value === null || typeof value !== 'object') {
        if (typeof value === 'number' && !Number.isFinite(value)) return JSON.stringify(String(value));
        if (typeof value === 'undefined' || typeof value === 'function') return 'null';
        return JSON.stringify(value);
    }
    if (seen.has(value)) return '"[Circular]"';
    seen.add(value);
    if (Array.isArray(value)) {
        const serialized = `[${value.map(item => stableSerialize(item, seen)).join(',')}]`;
        seen.delete(value);
        return serialized;
    }
    const entries = Object.keys(value)
        .sort()
        .filter(key => typeof value[key] !== 'undefined' && typeof value[key] !== 'function')
        .map(key => `${JSON.stringify(key)}:${stableSerialize(value[key], seen)}`);
    seen.delete(value);
    return `{${entries.join(',')}}`;
}

export function hashStableValue(value, prefix = 'fp') {
    const serialized = typeof value === 'string' ? value : stableSerialize(value);
    let first = 2166136261;
    let second = 2246822507;
    for (let index = 0; index < serialized.length; index += 1) {
        const code = serialized.charCodeAt(index);
        first = Math.imul(first ^ code, 16777619);
        second = Math.imul(second ^ code, 3266489909);
    }
    return `${prefix}_${(first >>> 0).toString(36)}_${(second >>> 0).toString(36)}`;
}
