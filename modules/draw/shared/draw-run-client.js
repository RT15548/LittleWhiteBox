import { DRAW_RUNS_ENDPOINT } from './draw-run-coordinator.js';

const DEFAULT_TIMEOUT_MS = 15_000;

export const DRAW_RUNS_CAPABILITY = 'draw-runs-v1';

export function hasDrawRunsCapability(status) {
    return status?.ready === true
        && Array.isArray(status.capabilities)
        && status.capabilities.includes(DRAW_RUNS_CAPABILITY);
}

export class DrawRunClientError extends Error {
    constructor(message, { code = 'draw_run_request_failed', status = 0, retriable = false, cause } = {}) {
        super(message);
        this.name = 'DrawRunClientError';
        this.code = code;
        this.status = status;
        this.retriable = retriable;
        if (cause !== undefined) this.cause = cause;
    }
}

async function readBody(response) {
    let text;
    try {
        text = await response.text();
    } catch (cause) {
        throw new DrawRunClientError('读取后台 Draw Run 响应时连接中断', {
            code: 'draw_run_body_interrupted',
            retriable: true,
            cause,
        });
    }
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch {
        return { error: text.slice(0, 500) };
    }
}

export function createDrawRunClient({
    fetchImpl = globalThis.fetch,
    getHeaders = () => ({}),
    timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
    if (typeof fetchImpl !== 'function') throw new TypeError('Draw Run client 需要 fetch');
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new TypeError('Draw Run client timeout 无效');

    async function request(path = '', { method = 'GET', signal } = {}) {
        if (signal?.aborted) {
            throw new DrawRunClientError('后台 Draw Run 请求已取消', {
                code: 'draw_run_aborted',
            });
        }
        const controller = new AbortController();
        const forwardAbort = () => controller.abort();
        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, timeoutMs);
        signal?.addEventListener('abort', forwardAbort, { once: true });
        try {
            const response = await fetchImpl(`${DRAW_RUNS_ENDPOINT}${path}`, {
                method,
                headers: getHeaders(),
                cache: 'no-store',
                signal: controller.signal,
            });
            const body = await readBody(response);
            if (!response.ok) {
                throw new DrawRunClientError(String(body?.error || `HTTP ${response.status}`), {
                    code: String(body?.code || (response.status === 404 ? 'draw_run_not_found' : 'draw_run_http_error')),
                    status: response.status,
                    retriable: response.status === 408 || response.status >= 500,
                });
            }
            if (body?.ok !== true) {
                throw new DrawRunClientError('后台 Draw Run 返回了无效响应', {
                    code: 'draw_run_invalid_response',
                    status: response.status,
                });
            }
            return body;
        } catch (error) {
            if (error instanceof DrawRunClientError) {
                if (!timedOut || error.code !== 'draw_run_body_interrupted') throw error;
                throw new DrawRunClientError('后台 Draw Run 请求超时', {
                    code: 'draw_run_timeout',
                    retriable: true,
                    cause: error,
                });
            }
            const externallyAborted = signal?.aborted === true;
            throw new DrawRunClientError(
                externallyAborted
                    ? '后台 Draw Run 请求已取消'
                    : timedOut
                        ? '后台 Draw Run 请求超时'
                        : '无法连接后台 Draw Run 服务',
                {
                    code: externallyAborted
                        ? 'draw_run_aborted'
                        : timedOut
                            ? 'draw_run_timeout'
                            : 'draw_run_unreachable',
                    retriable: !externallyAborted,
                    cause: error,
                },
            );
        } finally {
            clearTimeout(timer);
            signal?.removeEventListener('abort', forwardAbort);
        }
    }

    return Object.freeze({
        async listRuns(options = {}) {
            const body = await request('', options);
            if (!Array.isArray(body.runs)) {
                throw new DrawRunClientError('后台 Draw Run 列表格式无效', { code: 'draw_run_invalid_response' });
            }
            return body.runs;
        },
        async getRun(runId, options = {}) {
            const expectedRunId = String(runId || '');
            const body = await request(`/${encodeURIComponent(expectedRunId)}`, options);
            if (!body.run || typeof body.run !== 'object' || body.run.id !== expectedRunId) {
                throw new DrawRunClientError('后台 Draw Run 详情格式无效', { code: 'draw_run_invalid_response' });
            }
            return body.run;
        },
        async cancelRun(runId, options = {}) {
            const expectedRunId = String(runId || '');
            const body = await request(`/${encodeURIComponent(expectedRunId)}/cancel`, {
                ...options,
                method: 'POST',
            });
            if (!body.run || typeof body.run !== 'object' || body.run.id !== expectedRunId) {
                throw new DrawRunClientError('后台 Draw Run 取消响应格式无效', { code: 'draw_run_invalid_response' });
            }
            return body.run;
        },
        async acknowledgeRun(runId, options = {}) {
            try {
                await request(`/${encodeURIComponent(String(runId || ''))}`, { ...options, method: 'DELETE' });
            } catch (error) {
                // DELETE 已到但响应丢失时，重试会得到 404；这就是确认完成，不是失败。
                if (error?.code !== 'draw_run_not_found') throw error;
            }
            return true;
        },
    });
}
