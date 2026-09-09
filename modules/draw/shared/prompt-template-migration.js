function normalizeLineEndings(value) {
    return String(value || '').replace(/\r\n?/g, '\n');
}

function fnv1a(text, seed) {
    let hash = seed >>> 0;
    for (let index = 0; index < text.length; index++) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

export function promptTemplateFingerprint(value) {
    const text = normalizeLineEndings(value);
    const reversed = Array.from(text).reverse().join('');
    return `${text.length}:${fnv1a(text, 2166136261)}:${fnv1a(reversed, 2246822507)}`;
}
