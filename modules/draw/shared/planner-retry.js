// 场景 Agent 请求失败后的自动重试：判定哪些失败值得重试、指数退避等待。
// 只重试 Agent（LLM 规划）这一步；出图失败走各自的重试入口，不经过这里。
// 浏览器与后台 Draw Run 共用同一份实现：executePreparedScenePlanner 在两处都会读取 planner.retry。

export const DEFAULT_PLANNER_MAX_RETRIES = 3;
export const MAX_PLANNER_MAX_RETRIES = 10;
export const DEFAULT_PLANNER_RETRY_BASE_DELAY_MS = 2000;
export const PLANNER_RETRY_MAX_DELAY_MS = 30000;

// 重试不会改善的失败：取消、配置/输入/提示词错误、我们自己的契约错误。
const NON_RETRYABLE_CODES = new Set([
    'REQUEST_ABORTED',
    'AGENT_CORE_LOAD_FAILED',
    'AGENT_SETTINGS_LOAD_FAILED',
    'HOST_REQUEST_HEADERS_LOAD_FAILED',
    'AGENT_PRESET_INVALID',
    'MODEL_MISSING',
    'EMPTY_MESSAGE',
    'NO_INSERT_POINTS',
    'IMAGE_LIMIT_EXCEEDED',
    'PROMPT_EXPANSION_FAILED',
    'PREPARED_INPUT_INVALID',
    'TOOL_CONTRACT_INVALID',
    // Provider 配置或 Agent Core 没注入：确定性的配置错误，重试多少次都一样。
    'AGENT_CONTEXT_REQUIRED',
]);

// 这些 HTTP 状态说明请求本身有问题（密钥、模型名、参数），重试只会白等。
const NON_RETRYABLE_HTTP_STATUS = new Set([400, 401, 403, 404, 405, 413, 422]);

// 只接受 number 或可解析的非空字符串；null / '' / 布尔 / NaN 视为“未提供”。
// 不能直接 Number(value)：Number(null)、Number('')、Number(false) 都是 0，会静默关闭重试。
function readNumericSetting(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
    if (typeof value === 'string' && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

/** 规范化重试设置；缺失或非法时回落到默认值。显式的 maxRetries 为 0（或 '0'）表示不重试。 */
export function normalizePlannerRetry(raw) {
    const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const count = readNumericSetting(source.maxRetries);
    const maxRetries = count !== undefined && count >= 0
        ? Math.min(MAX_PLANNER_MAX_RETRIES, Math.floor(count)) || 0 // 把 -0 规整为 0
        : DEFAULT_PLANNER_MAX_RETRIES;
    const base = readNumericSetting(source.baseDelayMs);
    const baseDelayMs = base !== undefined && base > 0
        ? Math.min(PLANNER_RETRY_MAX_DELAY_MS, Math.floor(base))
        : DEFAULT_PLANNER_RETRY_BASE_DELAY_MS;
    return { maxRetries, baseDelayMs };
}

// 各 Agent 适配器的 HTTP 错误都把状态码放在错误对象自身的 `status`：
// 宿主 Client（shared/host-llm）与 openai-compatible 手写 fetch 直接设置 error.status，
// OpenAI / Anthropic / Google SDK 的 APIError / ApiError 同样是 error.status。
// 运行时再把它们包成 ScenePlannerError（PROVIDER_REQUEST_FAILED），原错误在 error.cause。
// statusCode / response.status / details.status 是其它常见库的写法，一并兼容；沿 cause 链向下找几层。
const MAX_ERROR_CHAIN_DEPTH = 5;

function readHttpStatus(error) {
    let current = error;
    for (let depth = 0; current && typeof current === 'object' && depth < MAX_ERROR_CHAIN_DEPTH; depth += 1) {
        for (const candidate of [
            current.status,
            current.statusCode,
            current.response?.status,
            current.response?.statusCode,
            current.details?.status,
            current.details?.statusCode,
        ]) {
            const status = readNumericSetting(candidate);
            if (Number.isInteger(status) && status >= 100 && status <= 599) return status;
        }
        current = current.cause;
    }
    return 0;
}

/** 超时、供应商/网络错误、Tool 协议或 Tool 参数最终仍不合格，都算 Agent 生成失败；取消和配置类错误不算。 */
export function isRetryablePlannerError(error) {
    if (!error) return false;
    const code = String(error.code || '').toUpperCase();
    if (NON_RETRYABLE_CODES.has(code)) return false;
    if (error.name === 'AbortError') return false;
    return !NON_RETRYABLE_HTTP_STATUS.has(readHttpStatus(error));
}

/**
 * 第 retryNumber 次重试前的等待时间（从 1 起）：base * 2^(n-1)，封顶 30 秒，再乘 0.8～1.2 的抖动，
 * 避免多个任务同时重试时撞在一起。random 可注入以便测试。
 */
export function computePlannerRetryDelay(retryNumber, { baseDelayMs = DEFAULT_PLANNER_RETRY_BASE_DELAY_MS } = {}, random = Math.random) {
    const exponent = Math.max(0, Math.floor(Number(retryNumber) || 1) - 1);
    const raw = Math.min(PLANNER_RETRY_MAX_DELAY_MS, baseDelayMs * (2 ** exponent));
    const jitter = 0.8 + 0.4 * Math.min(1, Math.max(0, Number(random()) || 0));
    return Math.max(0, Math.round(raw * jitter));
}

function createAbortError() {
    const error = new Error('已取消');
    error.name = 'AbortError';
    error.code = 'REQUEST_ABORTED';
    return error;
}

/** 可被取消的等待；信号触发时立即以 AbortError 结束。 */
export function sleepWithAbort(ms, signal, { setTimeoutImpl = setTimeout, clearTimeoutImpl = clearTimeout } = {}) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(createAbortError());
            return;
        }
        const onAbort = () => {
            clearTimeoutImpl(timer);
            reject(createAbortError());
        };
        const timer = setTimeoutImpl(() => {
            signal?.removeEventListener?.('abort', onAbort);
            resolve();
        }, ms);
        signal?.addEventListener?.('abort', onAbort, { once: true });
    });
}
