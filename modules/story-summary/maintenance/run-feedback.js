import { memoryFailureCode } from './errors.js';

/** Keep useful failure facts, never request objects, headers, or configured secrets. */
export function memoryRunError(error, config = {}) {
    let message = String(error?.message || error || 'agent_failed');
    if (typeof config.apiKey === 'string' && config.apiKey) message = message.split(config.apiKey).join('[redacted]');
    message = message.replace(/(Bearer\s+)[^\s"']+/giu, '$1[redacted]')
        .replace(/((?:api[_-]?key|access_token|authorization)["']?\s*[:=]\s*["']?)[^\s"'&,}]+/giu, '$1[redacted]');
    return { code: error?.name === 'AbortError' ? 'cancelled' : String(memoryFailureCode(error)), message: message.slice(0, 2000),
        ...(Number.isFinite(error?.status) ? { status: error.status } : {}),
        ...(error?.cause && error.cause !== error ? { cause: describeCause(error.cause, config) } : {}) };
}

function describeCause(cause, config) {
    return memoryRunError({ message: cause?.message || String(cause), code: cause?.code || cause?.name || 'save_diagnostic', status: cause?.status }, config);
}

export function recordMemoryResponse(call, result) {
    call.stage = 'response';
    call.usage = result.usage || null;
    if (result.finishReason !== undefined) call.finishReason = result.finishReason;
    if (result.completion !== undefined) call.completion = result.completion;
    if (typeof result.truncated === 'boolean') call.truncated = result.truncated;
}

export function recordMemoryToolErrors(call, tools, config) {
    call.toolErrors = tools.flatMap(({ name, response }) => {
        if (!['error', 'needs_fix', 'unconfirmed', 'not_executed'].includes(response.status)) return [];
        const rejected = response.rejected?.length ? response.rejected : [response];
        return rejected.map(error => ({ name, ...memoryRunError(error, config),
            ...(error.field ? { field: error.field } : {}) }));
    });
    if (!call.toolErrors.length) delete call.toolErrors;
}
