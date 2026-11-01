// Shared by the two public media APIs; no host, UI, storage or provider dependencies.
const COPY = Object.freeze({
    disabled: '此生成功能未启用',
    invalid_request: '请求字段无效',
    unsupported_field: '当前后端不支持此字段',
    preset_not_found: '指定的预设不存在',
    not_configured: '请先完成生成配置',
    invalid_result: '生成结果无效',
    partial_result: '部分结果未能取得，已取得的结果保留在 partialResult 中',
    provider_error: '生成请求失败',
    aborted: '请求已取消',
});

export class MediaApiError extends Error {
    constructor(code, { field, cause, partialResult } = {}) {
        super(COPY[code] || COPY.provider_error, { cause });
        this.name = code === 'aborted' ? 'AbortError' : 'MediaApiError';
        this.code = code;
        if (field) this.field = field;
        if (partialResult) this.partialResult = partialResult;
    }
}

export function requireFields(value, fields, path = '') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new MediaApiError('invalid_request', { field: path });
    }
    for (const key of Object.keys(value)) {
        if (!fields.includes(key)) throw new MediaApiError('unsupported_field', { field: path ? `${path}.${key}` : key });
    }
    return value;
}

export function copyRequest(value, controls = ['signal', 'onProgress']) {
    const data = {};
    for (const [key, item] of Object.entries(value)) {
        if (!controls.includes(key) && item !== undefined) data[key] = item;
    }
    try { return structuredClone(data); }
    catch (cause) { throw new MediaApiError('invalid_request', { cause }); }
}

export function selectPreset(presets, id, field) {
    const preset = presets?.find(item => item.id === id);
    if (!preset) throw new MediaApiError('preset_not_found', { field });
    return preset;
}

export function mediaFailure(error, signal) {
    if (error instanceof MediaApiError) return new MediaApiError(error.code, { field: error.field, partialResult: error.partialResult });
    const code = signal?.aborted || error?.name === 'AbortError' ? 'aborted' : 'provider_error';
    // Do not expose provider bodies/headers through the public error surface.
    const failure = new MediaApiError(code, { partialResult: error?.partialResult });
    if (Number.isInteger(error?.status)) failure.status = error.status;
    return failure;
}
