import assert from 'node:assert/strict';
import test from 'node:test';
import { createImageRequestAttempt, imageHttpFailure, ImageRequestOutcome } from '../image-request-outcome.js';

// The transport boundary, not the earlier queue/preparation phase, determines
// whether cancellation can leave a possibly billed image request behind.
test('cancellation during asynchronous preparation never sends an image request', async () => {
    const controller = new AbortController();
    const attempt = createImageRequestAttempt();
    let finishPreparation;
    const preparation = new Promise(resolve => { finishPreparation = resolve; });
    let requests = 0;
    const submission = (async () => {
        try {
            await preparation;
            attempt.submit(controller.signal);
            requests += 1;
        } catch (error) {
            throw attempt.failure(error);
        }
    })();
    controller.abort();
    finishPreparation();
    await assert.rejects(submission, error => error === controller.signal.reason
        && error.imageRequestOutcome === ImageRequestOutcome.NOT_SUBMITTED);
    assert.equal(requests, 0);
});

for (const failure of ['abort', 'network']) test(`a submitted request remains unknown after ${failure}`, async () => {
    const controller = new AbortController();
    const attempt = createImageRequestAttempt();
    let failTransport;
    let requests = 0;
    const submission = (async () => {
        try {
            attempt.submit(controller.signal);
            requests += 1;
            await new Promise((resolve, reject) => { failTransport = reject; });
        } catch (error) {
            throw attempt.failure(error);
        }
    })();
    controller.abort();
    const error = failure === 'abort' ? controller.signal.reason : new TypeError('offline');
    failTransport(error);
    await assert.rejects(submission, caught => caught === error
        && caught.imageRequestOutcome === ImageRequestOutcome.UNKNOWN);
    assert.equal(requests, 1);
});

test('a definite provider rejection retains its outcome even when cancellation follows', () => {
    for (const status of [400, 401, 402, 403, 404, 405, 413, 415, 422, 429]) {
        const controller = new AbortController();
        const attempt = createImageRequestAttempt();
        attempt.submit(controller.signal);
        const rejection = imageHttpFailure(new Error('rejected'), status);
        controller.abort();
        assert.equal(attempt.failure(rejection), rejection);
        assert.equal(rejection.imageRequestOutcome, ImageRequestOutcome.REJECTED);
    }
});
