import { SUMMARY_FEEDBACK_COPY } from '../feedback-copy.js';
import { createAbortError, throwIfSignalAborted } from '../../../shared/common/abort-utils.js';

// Manual L0/rerank probes share request ownership, not embedding initialization.
export function createServiceTests({ probes, onStatus }) {
    const active = new Map();
    const states = new Map();
    const publish = (target, state) => { states.set(target, state); onStatus(target, state); };
    function cancel(target) {
        for (const key of target ? [target] : Object.keys(probes)) {
            const request = active.get(key);
            active.delete(key);
            request?.abort();
            publish(key, { status: 'idle', message: '' });
        }
    }
    async function test(target, config, { isCurrent = () => true } = {}) {
        cancel(target);
        const controller = new AbortController();
        active.set(target, controller);
        const owns = () => active.get(target) === controller;
        publish(target, { status: 'downloading', message: SUMMARY_FEEDBACK_COPY.connectionChecking });
        let onAbort;
        const aborted = new Promise((_, reject) => {
            onAbort = () => reject(createAbortError());
            controller.signal.addEventListener('abort', onAbort, { once: true });
        });
        try {
            const result = await Promise.race([probes[target](config, { signal: controller.signal }), aborted]);
            throwIfSignalAborted(controller.signal);
            if (!owns() || !isCurrent()) throw createAbortError();
            publish(target, { status: 'success', message: result.message });
            return result;
        } catch (error) {
            if (controller.signal.aborted) throw createAbortError();
            if (owns() && isCurrent() && error.name !== 'AbortError') {
                publish(target, { status: 'error', message: error.message });
            }
            throw error;
        } finally {
            controller.signal.removeEventListener('abort', onAbort);
            if (owns()) {
                active.delete(target);
                if (states.get(target)?.status === 'downloading') publish(target, { status: 'idle', message: '' });
            }
        }
    }
    return { test, cancel, getStatus: target => states.get(target) || { status: 'idle', message: '' } };
}
