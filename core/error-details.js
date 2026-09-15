// Native Error messages and causes are non-enumerable.
export function formatErrorDetails(error, { includeStack = true } = {}) {
    const seen = new Set();
    function describe(value) {
        if (value == null) return '';
        if (typeof value === 'string') return value;
        if (typeof value !== 'object') return String(value);
        if (seen.has(value)) return '[circular error]';
        seen.add(value);
        let text = (includeStack && typeof value.stack === 'string' && value.stack)
            || (typeof value.message === 'string' && value.message);
        if (!text) {
            try { text = JSON.stringify(value); } catch { text = String(value); }
        }
        if (value.cause != null) text += `\nCaused by: ${describe(value.cause)}`;
        if (Array.isArray(value.errors)) {
            for (const item of value.errors) text += `\n- ${describe(item)}`;
        }
        seen.delete(value);
        return text;
    }
    return describe(error);
}
