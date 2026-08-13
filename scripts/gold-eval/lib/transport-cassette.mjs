/* global Buffer */
// Strict offline replay for captured Embedding/Rerank transport responses.

import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';

function sha256(value) {
    return createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function cassetteKey(value = {}) {
    return [
        String(value.host || ''),
        String(value.path || ''),
        String(value.requestHash || ''),
    ].join('\0');
}

function cassetteFailure({ caseId, kind, message }) {
    const error = new Error(message);
    error.goldFailure = {
        stage: 'transport-cassette',
        kind,
        status: null,
        caseId: caseId || null,
        message,
    };
    return error;
}

function safeRateHeaders(headers) {
    const out = {};
    try {
        for (const [key, value] of headers.entries()) {
            if (/^(?:x-)?ratelimit|^x-ratelimit|^retry-after$/i.test(key)) out[key.toLowerCase()] = value;
        }
    } catch {}
    return out;
}

function validateCapturedRow(row, caseId, index) {
    const endpoint = String(row?.endpoint || '');
    const status = Number(row?.status);
    if (!['embedding', 'rerank'].includes(endpoint)) {
        throw cassetteFailure({
            caseId,
            kind: 'invalid-source',
            message: `Cassette source 含非 Embedding/Rerank 请求: index=${index} endpoint=${endpoint || 'unknown'}`,
        });
    }
    if (!String(row?.host || '') || !String(row?.path || '') || !String(row?.requestHash || '')) {
        throw cassetteFailure({
            caseId,
            kind: 'invalid-source',
            message: `Cassette source 缺少请求身份: index=${index}`,
        });
    }
    if (!Number.isInteger(status) || status < 200 || status >= 300 || row?.responseBody == null) {
        throw cassetteFailure({
            caseId,
            kind: 'invalid-source',
            message: `Cassette source 没有可复放的成功响应: index=${index} status=${row?.status ?? 'unknown'}`,
        });
    }
    const responseHash = sha256(JSON.stringify(row.responseBody));
    if (row.responseHash !== responseHash) {
        throw cassetteFailure({
            caseId,
            kind: 'invalid-source',
            message: `Cassette source 响应 hash 不匹配: index=${index}`,
        });
    }
}

export function summarizeExternalRequest(input, init = {}) {
    const url = typeof input === 'string' || input instanceof URL
        ? String(input)
        : String(input?.url || '');
    const bodyText = typeof init?.body === 'string' ? init.body : '';
    let body = null;
    try {
        body = bodyText ? JSON.parse(bodyText) : null;
    } catch {}
    let endpoint = 'other';
    if (/\/embeddings(?:\?|$)/i.test(url)) endpoint = 'embedding';
    if (/\/rerank(?:\?|$)/i.test(url)) endpoint = 'rerank';
    const inputs = Array.isArray(body?.input) ? body.input.map(value => String(value || '')) : [];
    const documents = Array.isArray(body?.documents) ? body.documents.map(value => String(value || '')) : [];
    return {
        endpoint,
        host: (() => {
            try { return new URL(url).host; } catch { return ''; }
        })(),
        path: (() => {
            try { return new URL(url).pathname; } catch { return ''; }
        })(),
        method: String(init?.method || 'GET').toUpperCase(),
        model: String(body?.model || ''),
        requestHash: sha256(bodyText),
        requestBytes: Buffer.byteLength(bodyText, 'utf8'),
        inputCount: inputs.length,
        inputChars: inputs.reduce((sum, value) => sum + value.length, 0),
        queryChars: String(body?.query || '').length,
        documentCount: documents.length,
        documentChars: documents.reduce((sum, value) => sum + value.length, 0),
        topN: Number.isInteger(body?.top_n) ? body.top_n : null,
    };
}

export function createStrictTransportCassette(rows, { caseId = null } = {}) {
    if (!Array.isArray(rows) || rows.length === 0) {
        throw cassetteFailure({
            caseId,
            kind: 'invalid-source',
            message: `Cassette source 没有 production transport: case=${caseId || 'unknown'}`,
        });
    }

    const queues = new Map();
    for (const [index, row] of rows.entries()) {
        validateCapturedRow(row, caseId, index);
        const key = cassetteKey(row);
        if (!queues.has(key)) queues.set(key, []);
        queues.get(key).push(row);
    }
    let remaining = rows.length;

    return {
        sourceRequestCount: rows.length,
        consume(request) {
            const queue = queues.get(cassetteKey(request));
            if (!queue?.length) {
                throw cassetteFailure({
                    caseId,
                    kind: 'miss',
                    message: `Cassette miss，必须建立新的 production capture: case=${caseId || 'unknown'} endpoint=${request?.endpoint || 'unknown'} host=${request?.host || 'unknown'} path=${request?.path || 'unknown'} requestHash=${request?.requestHash || 'unknown'}`,
                });
            }
            remaining -= 1;
            return queue.shift();
        },
        assertFullyConsumed() {
            if (remaining === 0) return;
            throw cassetteFailure({
                caseId,
                kind: 'unused-source-requests',
                message: `Cassette 请求集合已变化，必须建立新的 production capture: case=${caseId || 'unknown'} unused=${remaining}`,
            });
        },
    };
}

function isSuccessfulRow(row) {
    const status = row?.status == null ? null : Number(row.status);
    const requiresReplayBody = row?.endpoint === 'embedding' || row?.endpoint === 'rerank';
    return Number.isInteger(status) && status >= 200 && status < 300
        && (!requiresReplayBody || row?.responseBody != null);
}

function isRetryableRow(row) {
    const status = row?.status == null ? null : Number(row.status);
    if (!Number.isInteger(status)) return ['timeout', 'network'].includes(String(row?.errorKind || ''));
    return [408, 409, 425, 429].includes(status) || (status >= 500 && status <= 599);
}

function requestIdentity(row) {
    return [
        String(row?.host || ''),
        String(row?.path || ''),
        String(row?.method || ''),
        String(row?.model || ''),
        String(row?.requestHash || ''),
    ].join('\0');
}

export function assertSuccessfulExternalTrace(rows, {
    caseId = null,
    stage = 'external',
    allowEmpty = true,
    allowRecoveredTransient = false,
    allowUnrecoveredTransient = false,
    maxAttemptsPerRequest = 3,
} = {}) {
    if (!Array.isArray(rows)) {
        throw cassetteFailure({
            caseId,
            kind: 'invalid-trace',
            message: `外部调用 trace 不是数组: stage=${stage}`,
        });
    }
    if (!rows.length && allowEmpty) return;
    if (!rows.length) {
        throw cassetteFailure({
            caseId,
            kind: 'missing-trace',
            message: `外部调用 trace 为空: stage=${stage}`,
        });
    }
    const attemptsByIdentity = new Map();
    for (const [index, row] of rows.entries()) {
        const identity = requestIdentity(row);
        if (!attemptsByIdentity.has(identity)) attemptsByIdentity.set(identity, []);
        attemptsByIdentity.get(identity).push({ index, row });
    }
    const recovered = [];
    const pending = [];
    for (const attempts of attemptsByIdentity.values()) {
        if (Number.isInteger(maxAttemptsPerRequest) && attempts.length > maxAttemptsPerRequest) {
            const error = cassetteFailure({
                caseId,
                kind: 'excessive-retry',
                message: `外部调用重试超过上限: stage=${stage} attempts=${attempts.length} max=${maxAttemptsPerRequest}`,
            });
            error.goldFailure.stage = stage;
            throw error;
        }
        for (let offset = 0; offset < attempts.length; offset++) {
            const { index, row } = attempts[offset];
            if (isSuccessfulRow(row)) continue;
            const laterSuccess = attempts.slice(offset + 1).find(item => isSuccessfulRow(item.row));
            if (allowRecoveredTransient && isRetryableRow(row) && laterSuccess) {
                recovered.push({
                    failedIndex: index,
                    recoveredByIndex: laterSuccess.index,
                    endpoint: row?.endpoint || 'unknown',
                    status: row?.status != null && Number.isInteger(Number(row.status)) ? Number(row.status) : null,
                    errorKind: row?.errorKind || null,
                });
                continue;
            }
            if (allowUnrecoveredTransient && isRetryableRow(row)) {
                pending.push({
                    failedIndex: index,
                    endpoint: row?.endpoint || 'unknown',
                    status: row?.status != null && Number.isInteger(Number(row.status)) ? Number(row.status) : null,
                    errorKind: row?.errorKind || null,
                });
                continue;
            }
            const status = row?.status == null ? null : Number(row.status);
            const error = cassetteFailure({
                caseId,
                kind: 'external-failure',
                message: `外部调用失败: stage=${stage} index=${index} endpoint=${row?.endpoint || 'unknown'} status=${row?.status ?? 'unknown'}`,
            });
            error.goldFailure.stage = stage;
            error.goldFailure.status = Number.isInteger(status) ? status : null;
            throw error;
        }
    }
    return { recovered, pending };
}

export function buildCassetteResponse(capturedRow) {
    return new Response(JSON.stringify(capturedRow.responseBody), {
        status: capturedRow.status,
        headers: {
            'content-type': 'application/json',
            ...(capturedRow.rateHeaders || {}),
        },
    });
}

export async function withExternalCallTrace(operation, { cassette = null } = {}) {
    const originalFetch = globalThis.fetch;
    if (typeof originalFetch !== 'function' && !cassette) {
        return { value: await operation(), calls: null, requestCount: null, trace: [] };
    }
    const trace = [];
    const pending = [];
    globalThis.fetch = async (...args) => {
        const index = trace.length;
        const startedAt = performance.now();
        const row = {
            index,
            ...summarizeExternalRequest(args[0], args[1]),
            status: null,
            elapsedMs: null,
            rateHeaders: {},
            usage: null,
            responseHash: null,
            responseBody: null,
            errorKind: null,
            source: cassette ? 'cassette' : 'network',
            cassetteHit: false,
        };
        trace.push(row);
        try {
            const capturedRow = cassette ? cassette.consume(row) : null;
            const response = cassette
                ? buildCassetteResponse(capturedRow)
                : await Reflect.apply(originalFetch, globalThis, args);
            row.cassetteHit = !!cassette;
            row.status = response.status;
            row.elapsedMs = Math.max(0, Math.round(performance.now() - startedAt));
            row.rateHeaders = safeRateHeaders(response.headers);
            const contentType = String(response.headers?.get?.('content-type') || '');
            if (/json/i.test(contentType)) {
                pending.push(response.clone().json()
                    .then(payload => {
                        row.usage = payload?.usage || payload?.meta?.tokens || payload?.meta?.billed_units || null;
                        if (row.endpoint === 'embedding' || row.endpoint === 'rerank') {
                            row.responseBody = payload;
                            row.responseHash = capturedRow?.responseHash || sha256(JSON.stringify(payload));
                        }
                    })
                    .catch(() => {}));
            }
            return response;
        } catch (error) {
            row.elapsedMs = Math.max(0, Math.round(performance.now() - startedAt));
            row.errorKind = error?.goldFailure?.kind
                || (error?.name === 'AbortError' ? 'timeout' : 'network');
            row.errorMessage = String(error?.message || error).replace(/\s+/g, ' ').slice(0, 300);
            throw error;
        }
    };
    try {
        const value = await operation();
        await Promise.allSettled(pending);
        if (cassette) cassette.assertFullyConsumed();
        return {
            value,
            calls: cassette ? 0 : trace.length,
            requestCount: trace.length,
            trace,
        };
    } catch (error) {
        await Promise.allSettled(pending);
        error.externalTrace = trace;
        error.externalCalls = cassette ? 0 : trace.length;
        error.externalRequests = trace.length;
        throw error;
    } finally {
        globalThis.fetch = originalFetch;
    }
}
