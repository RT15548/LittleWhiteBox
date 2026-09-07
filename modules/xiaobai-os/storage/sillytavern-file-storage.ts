import type {
    StorageFailure,
    StorageReplaceInput,
    StorageReplaceResult,
    XiaobaiOsSidecarV1,
    XiaobaiOsStoragePort,
} from '../kernel/contracts.js';
import {
    parseXiaobaiOsEnvelope,
    sameSidecarRevision,
    serializeXiaobaiOsEnvelope,
} from '../kernel/envelope.js';
import type { JsonUserFilePort } from './sidecar-index.js';
import { XiaobaiOsStorageError } from './storage-port.js';

// Native saves have no short client deadline. A slow VPS is not evidence of a failed write.
const DEFAULT_TIMEOUT_MS = 0;

export interface SillyTavernFileStorageOptions {
    fetch?: typeof globalThis.fetch;
    getRequestHeaders?: () => HeadersInit;
    requestTimeoutMs?: number;
    readbackTimeoutMs?: number;
    nonce?: () => string;
}

function filename(osId: string): string {
    return `LittleWhiteBox_OS_${osId}.json`;
}

function failure(code: string, message: string, retryable: boolean): StorageFailure {
    return { code, message, retryable };
}

function encodeBase64Utf8(value: string): string {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return btoa(binary);
}

function createTimedSignal(signal: AbortSignal | undefined, timeoutMs: number): {
    signal: AbortSignal;
    timedOut: () => boolean;
    cleanup: () => void;
} {
    const controller = new AbortController();
    let didTimeOut = false;
    const forwardAbort = () => controller.abort(signal?.reason);
    signal?.addEventListener('abort', forwardAbort, { once: true });
    if (signal?.aborted) { controller.abort(signal.reason); }
    const timer = timeoutMs > 0 ? globalThis.setTimeout(() => {
        didTimeOut = true;
        controller.abort(new DOMException('Request timed out', 'TimeoutError'));
    }, timeoutMs) : undefined;
    return {
        signal: controller.signal,
        timedOut: () => didTimeOut,
        cleanup: () => {
            if (timer !== undefined) { globalThis.clearTimeout(timer); }
            signal?.removeEventListener('abort', forwardAbort);
        },
    };
}

async function responseDetail(response: Response): Promise<string> {
    try {
        return (await response.text()).replace(/\s+/g, ' ').trim();
    } catch {
        return '';
    }
}

function responseMessage(action: string, status: number, detail: string): string {
    return detail ? `${action} failed (HTTP ${status}): ${detail}` : `${action} failed (HTTP ${status})`;
}

function isDefiniteWriteRejection(status: number): boolean {
    return status >= 400 && status < 500 && status !== 408 && status !== 429;
}

export function createSillyTavernUserJsonFilePort(
    options: SillyTavernFileStorageOptions = {},
): JsonUserFilePort {
    const request = options.fetch ?? globalThis.fetch.bind(globalThis);
    const getRequestHeaders = options.getRequestHeaders ?? (() => ({}));
    const requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    const nonce = options.nonce ?? (() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    return Object.freeze({
        async read(name: string): Promise<unknown | null> {
            const timed = createTimedSignal(undefined, requestTimeoutMs);
            try {
                const query = new URLSearchParams({ v: nonce() });
                const response = await request(`/user/files/${encodeURIComponent(name)}?${query}`, {
                    method: 'GET',
                    headers: {
                        ...getRequestHeaders(),
                        'Cache-Control': 'no-store',
                        Pragma: 'no-cache',
                    },
                    cache: 'no-store',
                    signal: timed.signal,
                });
                if (response.status === 404) { return null; }
                if (!response.ok) {
                    throw new XiaobaiOsStorageError(
                        'storage_read_http',
                        responseMessage('JSON file read', response.status, await responseDetail(response)),
                        response.status >= 500,
                    );
                }
                return JSON.parse(await response.text()) as unknown;
            } finally {
                timed.cleanup();
            }
        },
        async replace(name: string, value: unknown): Promise<void> {
            const serialized = JSON.stringify(value);
            const timed = createTimedSignal(undefined, requestTimeoutMs);
            try {
                const response = await request('/api/files/upload', {
                    method: 'POST',
                    headers: {
                        ...getRequestHeaders(),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, data: encodeBase64Utf8(serialized) }),
                    signal: timed.signal,
                });
                if (!response.ok) {
                    throw new XiaobaiOsStorageError(
                        'storage_write_http',
                        responseMessage('JSON file write', response.status, await responseDetail(response)),
                        response.status >= 500,
                        { httpStatus: response.status },
                    );
                }
            } finally {
                timed.cleanup();
            }
        },
    });
}

export function createSillyTavernFileStorage(
    options: SillyTavernFileStorageOptions = {},
): XiaobaiOsStoragePort {
    const request = options.fetch ?? globalThis.fetch.bind(globalThis);
    const getRequestHeaders = options.getRequestHeaders ?? (() => ({}));
    const requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    const readbackTimeoutMs = options.readbackTimeoutMs ?? requestTimeoutMs;
    const nonce = options.nonce ?? (() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    async function readWithTimeout(osId: string, signal: AbortSignal | undefined, timeoutMs: number) {
        const timed = createTimedSignal(signal, timeoutMs);
        try {
            const query = new URLSearchParams({ v: nonce() });
            const response = await request(`/user/files/${encodeURIComponent(filename(osId))}?${query}`, {
                method: 'GET',
                headers: {
                    ...getRequestHeaders(),
                    'Cache-Control': 'no-store',
                    Pragma: 'no-cache',
                },
                cache: 'no-store',
                signal: timed.signal,
            });
            if (response.status === 404) { return null; }
            if (!response.ok) {
                const detail = await responseDetail(response);
                throw new XiaobaiOsStorageError(
                    'storage_read_http',
                    responseMessage('Sidecar read', response.status, detail),
                    response.status >= 500 || response.status === 408 || response.status === 429,
                );
            }
            let parsed: unknown;
            try {
                parsed = JSON.parse(await response.text());
            } catch (cause) {
                throw new XiaobaiOsStorageError('storage_invalid_json', 'Sidecar contains invalid JSON', false, { cause });
            }
            try {
                const envelope = parseXiaobaiOsEnvelope(parsed);
                if (envelope.osId !== osId) {
                    throw new XiaobaiOsStorageError(
                        'storage_identity_mismatch',
                        `Sidecar ${filename(osId)} contains osId ${envelope.osId}`,
                        false,
                    );
                }
                return envelope;
            } catch (cause) {
                if (cause instanceof XiaobaiOsStorageError) { throw cause; }
                throw new XiaobaiOsStorageError('storage_invalid_envelope', 'Sidecar envelope is invalid', false, { cause });
            }
        } catch (cause) {
            if (cause instanceof XiaobaiOsStorageError) { throw cause; }
            const timedOut = timed.timedOut();
            throw new XiaobaiOsStorageError(
                timedOut ? 'storage_read_timeout' : 'storage_read_network',
                timedOut ? 'Sidecar read timed out' : 'Sidecar read failed',
                true,
                { cause },
            );
        } finally {
            timed.cleanup();
        }
    }

    async function read(osId: string, signal?: AbortSignal): Promise<XiaobaiOsSidecarV1 | null> {
        return await readWithTimeout(osId, signal, requestTimeoutMs);
    }

    async function replace(input: StorageReplaceInput, signal?: AbortSignal): Promise<StorageReplaceResult> {
        let serialized: string;
        try {
            if (signal?.aborted) {
                return { status: 'failed', error: failure('storage_aborted', 'Sidecar write was cancelled before send', false) };
            }
            const candidate = parseXiaobaiOsEnvelope(input.candidate);
            if (input.expected && input.expected.osId !== candidate.osId) {
                return {
                    status: 'failed',
                    error: failure('storage_identity_mismatch', 'Expected and candidate osId do not match', false),
                };
            }
            serialized = serializeXiaobaiOsEnvelope(candidate);
        } catch (cause) {
            return {
                status: 'failed',
                error: failure(
                    'storage_candidate_invalid',
                    cause instanceof Error ? cause.message : 'Sidecar candidate is invalid',
                    false,
                ),
            };
        }

        const timed = createTimedSignal(undefined, requestTimeoutMs);
        try {
            const response = await request('/api/files/upload', {
                method: 'POST',
                headers: {
                    ...getRequestHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: filename(input.candidate.osId),
                    data: encodeBase64Utf8(serialized),
                }),
                signal: timed.signal,
            });
            if (!response.ok && isDefiniteWriteRejection(response.status)) {
                const detail = await responseDetail(response);
                return {
                    status: 'failed',
                    error: failure(
                        'storage_write_http',
                        responseMessage('Sidecar write', response.status, detail),
                        false,
                    ),
                };
            }
            if (!response.ok) {
                // The request reached the server, but this response cannot prove that no file was replaced.
                await responseDetail(response);
                throw new Error('Sidecar write outcome is unknown');
            }
            return { status: 'confirmed' };
        } catch {
            // A network result is unknown once fetch has started. Confirm by a separate no-store read.
        } finally {
            timed.cleanup();
        }

        let observed: XiaobaiOsSidecarV1 | null;
        try {
            observed = await readWithTimeout(input.candidate.osId, undefined, readbackTimeoutMs);
        } catch {
            return { status: 'unconfirmed', observed: null };
        }
        if (observed?.commitId === input.candidate.commitId) {
            return { status: 'confirmed' };
        }
        if (sameSidecarRevision(input.expected, observed)) {
            return { status: 'unconfirmed', observed };
        }
        if (observed === null && input.expected === null) {
            return { status: 'unconfirmed', observed: null };
        }
        if (observed !== null) {
            return { status: 'conflict', observed };
        }
        return { status: 'unconfirmed', observed: null };
    }

    async function deleteSidecar(osId: string, signal?: AbortSignal): Promise<'deleted' | 'missing'> {
        const timed = createTimedSignal(signal, requestTimeoutMs);
        try {
            const response = await request('/api/files/delete', {
                method: 'POST',
                headers: {
                    ...getRequestHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ path: `user/files/${filename(osId)}` }),
                signal: timed.signal,
            });
            if (response.status === 404) { return 'missing'; }
            if (!response.ok) {
                const detail = await responseDetail(response);
                throw new XiaobaiOsStorageError(
                    'storage_delete_http',
                    responseMessage('Sidecar delete', response.status, detail),
                    response.status >= 500 || response.status === 408 || response.status === 429,
                );
            }
            return 'deleted';
        } catch (cause) {
            if (cause instanceof XiaobaiOsStorageError) { throw cause; }
            throw new XiaobaiOsStorageError(
                timed.timedOut() ? 'storage_delete_timeout' : 'storage_delete_network',
                timed.timedOut() ? 'Sidecar delete timed out' : 'Sidecar delete failed',
                true,
                { cause },
            );
        } finally {
            timed.cleanup();
        }
    }

    return Object.freeze({ read, replace, delete: deleteSidecar });
}
