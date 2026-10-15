const INVALID_DESCRIPTIONS = '字段说明格式无效：需要字段路径到说明文本的 JSON 对象。';

// Preset import, editing and model requests share the same file-format boundary.
export function parseFieldDescriptions(value = '') {
    const invalid = cause => Object.assign(new TypeError(INVALID_DESCRIPTIONS, { cause }), {
        code: 'INVALID_FIELD_DESCRIPTIONS',
    });
    if (typeof value !== 'string') throw invalid();
    if (!value.trim()) return {};
    let parsed;
    try { parsed = JSON.parse(value); } catch (error) { throw invalid(error); }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)
        || Object.values(parsed).some(text => typeof text !== 'string')) throw invalid();
    return parsed;
}
