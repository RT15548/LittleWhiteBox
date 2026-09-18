// Evaluation-only generation settings. No plugin config or stored memory changes.
import { AsyncLocalStorage } from 'node:async_hooks';

const requestContext = new AsyncLocalStorage();

export function validateSummaryRequestOverride(value) {
    if (value == null) return;
    if (Object.keys(value).sort().join(',') !== 'fromFloor,reasoningEffort'
        || value.reasoningEffort !== 'low' || !Number.isSafeInteger(value.fromFloor) || value.fromFloor < 0) {
        throw new Error('Evaluation Summary override requires reasoningEffort=low and a nonnegative fromFloor');
    }
}

export function withSummaryRequestOverride(value, floor, operation) {
    validateSummaryRequestOverride(value);
    return requestContext.run(value && floor >= value.fromFloor ? { reasoning_effort: value.reasoningEffort } : null, operation);
}

export function applySummaryRequestOverride(body) {
    const override = requestContext.getStore();
    return override ? { ...body, ...override } : body;
}
