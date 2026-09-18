import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

export function validateRequestRecovery(policy) {
    if (!policy || policy.maxAttempts !== 3
        || !Number.isSafeInteger(policy.baseDelayMs) || policy.baseDelayMs < 1
        || !Number.isSafeInteger(policy.maxDelayMs) || policy.maxDelayMs < policy.baseDelayMs) {
        throw new Error('Request recovery needs maxAttempts=3 and positive bounded retry delays');
    }
}

function stopped(kind) {
    const error = new Error(`Prepared request recovery stopped: ${kind}; preserve this run, do not restart the batch`);
    error.goldFailure = { stage: 'request-recovery', kind, transmitted: false };
    return error;
}

function retryAfterMs(response, now) {
    const value = response?.headers?.get('retry-after');
    if (!value) return 0;
    const seconds = Number(value);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
    const date = Date.parse(value);
    return Number.isFinite(date) ? Math.max(0, date - now) : 0;
}

// Scoped to one prepared invocation. Only failed request identities remain here;
// completed sibling requests/results are never replayed by this recovery loop.
export function createRequestRecovery(policy, {
    clock = Date.now,
    wait = (ms, signal) => delay(ms, undefined, { signal }),
    onRetry = () => {},
} = {}) {
    validateRequestRecovery(policy);
    const failures = new Map();
    const cooldowns = new Map();
    return async (args, dispatch) => {
        const [input, init = {}] = args;
        const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
        // The prepared APIs use string JSON bodies; do not retry consumed streams.
        const replayable = !(input instanceof Request) && (init.body == null || typeof init.body === 'string');
        const identity = createHash('sha256').update(JSON.stringify([
            url.href, init.method || 'GET', typeof init.body === 'string' ? init.body : null,
        ])).digest('hex');
        const signal = init.signal || input?.signal;
        const state = failures.get(identity) || { attempts: 0, terminal: false };
        if (state.terminal || state.attempts >= policy.maxAttempts) throw stopped('retry-exhausted');
        while (state.attempts < policy.maxAttempts) {
            let waitedMs = 0;
            while ((cooldowns.get(url.origin) || 0) > clock()) {
                const remaining = cooldowns.get(url.origin) - clock();
                if (waitedMs + remaining > policy.maxDelayMs) throw stopped('retry-delay-limit');
                await wait(remaining, signal);
                waitedMs += remaining;
            }
            signal?.throwIfAborted();
            state.attempts++;
            failures.set(identity, state);
            let response;
            let failure;
            try {
                response = await dispatch({ retryAttempt: state.attempts, retryWaitMs: waitedMs });
            } catch (error) {
                failure = error;
                if (error?.goldFailure || signal?.aborted || error?.name === 'AbortError') {
                    state.terminal = true;
                    throw error;
                }
            }
            if (response?.ok) {
                failures.delete(identity);
                return response;
            }
            const retryable = failure || [408, 429].includes(response?.status)
                || (response?.status >= 500 && response.status <= 599);
            if (!retryable || !replayable || state.attempts >= policy.maxAttempts) {
                state.terminal = true;
                if (failure) throw failure;
                return response;
            }
            const delayMs = Math.max(retryAfterMs(response, clock()),
                Math.min(policy.maxDelayMs, policy.baseDelayMs * (2 ** (state.attempts - 1))));
            if (delayMs > policy.maxDelayMs) {
                state.terminal = true;
                return response;
            }
            const elapsedSinceReceipt = response?.preparedReceipt?.source === 'journal'
                ? Math.max(0, clock() - response.preparedReceipt.receivedAt) : 0;
            const remainingDelayMs = Math.max(0, delayMs - elapsedSinceReceipt);
            cooldowns.set(url.origin, Math.max(cooldowns.get(url.origin) || 0, clock() + remainingDelayMs));
            onRetry({ host: url.host, status: response?.status || 'network', attempt: state.attempts, delayMs });
            await response?.body?.cancel().catch(() => {});
        }
        throw stopped('retry-exhausted');
    };
}
