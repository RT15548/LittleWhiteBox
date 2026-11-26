import { APIConnectionError as OpenAIConnectionError, APIUserAbortError as OpenAIAbortError } from 'openai/core/error';
import { APIConnectionError as AnthropicConnectionError, APIUserAbortError as AnthropicAbortError } from '@anthropic-ai/sdk/core/error';
import { ACTIVITY_COPY } from '../ui/activity-copy.js';

// Assistant-only policy. Adapters retain their single-attempt SDK settings.
export const MODEL_RETRY_LIMIT = 3;
const REFUSAL_RETRY_LIMIT = 2;
const MAX_DELAY_MS = 10000;
const PERMANENT_CODES = new Set(['insufficient_quota', 'billing_hard_limit_reached', 'invalid_api_key', 'authentication_error', 'permission_error', 'invalid_request_error', 'context_length_exceeded']);
const TRANSIENT_CODES = new Set(['server_error', 'internal_server_error', 'api_error', 'overloaded_error', 'rate_limit_exceeded', 'rate_limit_error', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN']);

function modelErrorKind(error) {
    const seen = new Set();
    for (let current = error; current && !seen.has(current); current = current.cause) {
        seen.add(current);
        if (current.name === 'AbortError' || current instanceof OpenAIAbortError || current instanceof AnthropicAbortError) return null;
        if (current.code === 'AGENT_RESPONSE_REFUSED') return 'refusal';
        const codes = [current.code, current.type, current.error?.code, current.error?.type,
            ...(current.code === 'OPENAI_RESPONSES_FAILED' ? [current.reason] : [])];
        if (codes.some(code => PERMANENT_CODES.has(code))) return null;
        const status = [current.status, ...[current.code, current.error?.code].filter(code => typeof code === 'number')]
            .map(Number).find(value => value >= 400 && value <= 599);
        if (status !== undefined) return [408, 429].includes(status) || status >= 500 ? 'transient' : null;
        if (current instanceof OpenAIConnectionError || current instanceof AnthropicConnectionError
            || codes.some(code => TRANSIENT_CODES.has(code)) || current.name === 'TimeoutError') return 'transient';
    }
    return null;
}

export const isRetryableModelError = error => modelErrorKind(error) !== null;
export const isModelRefusal = error => modelErrorKind(error) === 'refusal';

function retryAfterMs(error) {
    const headers = error?.headers;
    if (!headers) return undefined;
    const value = name => typeof headers.get === 'function' ? headers.get(name) : headers[name];
    const milliseconds = value('retry-after-ms');
    if (milliseconds != null && Number.isFinite(Number(milliseconds)) && Number(milliseconds) > 0) return Number(milliseconds);
    const raw = value('retry-after');
    if (raw == null) return undefined;
    const seconds = Number(raw);
    const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(raw) - Date.now();
    return Number.isFinite(delay) && delay > 0 ? delay : undefined;
}

export function waitForModelRetry(delayMs, signal) {
    signal?.throwIfAborted();
    return new Promise((resolve, reject) => {
        const abort = () => { clearTimeout(timer); reject(signal.reason); };
        const timer = setTimeout(() => { signal?.removeEventListener('abort', abort); resolve(); }, delayMs);
        signal?.addEventListener('abort', abort, { once: true });
    });
}

// One controller per logical request sequence; successful chat resets the budget.
// Call only around adapter.chat, never around tools, compaction, or persistence.
export function createModelRequestRetry({ wait = waitForModelRetry, random = Math.random, onRetry, onResume } = {}) {
    let attempts = 0, refusalAttempts = 0, fallbacks = 0, responseCooldown;
    // Only the owner of this logical request sees its format choice and wire budget.
    function newTransport() {
        return {
            claimFallback() {
                if (attempts + fallbacks >= MODEL_RETRY_LIMIT) return false;
                fallbacks++;
                return true;
            },
            // Google GenAI's ApiError drops response headers. Observe the SDK's actual
            // response without consuming its body or replacing its error or cancellation.
            async fetch(...args) {
                responseCooldown = undefined;
                const response = await globalThis.fetch(...args);
                if (!response.ok) responseCooldown = retryAfterMs(response);
                return response;
            },
        };
    }
    let transport = newTransport();
    return {
        get transport() { return transport; },
        get attempts() { return attempts; },
        reset() { attempts = 0; refusalAttempts = 0; fallbacks = 0; responseCooldown = undefined; transport = newTransport(); },
        async wait(error, signal, beforeWait) {
            signal?.throwIfAborted();
            const kind = modelErrorKind(error);
            const advised = retryAfterMs(error) ?? responseCooldown;
            responseCooldown = undefined;
            if (!kind) return false;
            if (advised > MAX_DELAY_MS) throw Object.assign(new Error(ACTIVITY_COPY.modelCooldown(advised), { cause: error }), { retryAfterMs: advised });
            const remainingLimit = MODEL_RETRY_LIMIT - fallbacks;
            if (attempts >= remainingLimit || (kind === 'refusal' && refusalAttempts >= REFUSAL_RETRY_LIMIT)) return false;
            const delayMs = advised ?? Math.min(500 * 2 ** attempts * (0.9 + 0.2 * random()), MAX_DELAY_MS);
            attempts += 1;
            if (kind === 'refusal') refusalAttempts += 1;
            const limit = kind === 'refusal' ? Math.min(remainingLimit, attempts + REFUSAL_RETRY_LIMIT - refusalAttempts) : remainingLimit;
            beforeWait?.();
            onRetry?.({ kind, attempt: attempts, limit, delayMs });
            try {
                await wait(delayMs, signal);
                signal?.throwIfAborted();
                return true;
            } finally { onResume?.(); }
        },
    };
}
