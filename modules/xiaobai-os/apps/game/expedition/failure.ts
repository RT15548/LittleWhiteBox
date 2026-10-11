export interface ExpeditionFailure { code: string; message?: string }

/** Runtime diagnostics cross the frame as plain data, never the provider's request/config object. */
export function expeditionFailure(error: unknown): ExpeditionFailure {
    const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : 'expedition_agent_failed';
    const message = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message : typeof error === 'string' ? error : undefined;
    return { code, ...(message && message !== code ? { message } : {}) };
}
