export const ImageRequestOutcome = Object.freeze({
    NOT_SUBMITTED: 'not-submitted', REJECTED: 'rejected', UNKNOWN: 'unknown',
});

export function withImageRequestOutcome(error, outcome) {
    error.imageRequestOutcome = outcome;
    return error;
}

// Transport semantics, deliberately independent of UI error classifications.
export function imageHttpOutcome(status) {
    return [400, 401, 402, 403, 404, 405, 413, 415, 422, 429].includes(status)
        ? ImageRequestOutcome.REJECTED : ImageRequestOutcome.UNKNOWN;
}

export function imageHttpFailure(error, status) {
    error.status = status;
    return withImageRequestOutcome(error, imageHttpOutcome(status));
}

export function createImageRequestAttempt() {
    let submitted = false;
    return {
        submit(signal) {
            signal?.throwIfAborted();
            submitted = true;
        },
        failure(error) {
            return withImageRequestOutcome(error, error.imageRequestOutcome
                ?? (submitted ? ImageRequestOutcome.UNKNOWN : ImageRequestOutcome.NOT_SUBMITTED));
        },
    };
}
