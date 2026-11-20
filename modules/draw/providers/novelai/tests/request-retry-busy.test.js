import assert from 'node:assert/strict';
import test from 'node:test';
import { requestNovelImageWithRetry } from '../novel-request-retry.js';

// Acceptance (cost: a paid request lost to a rate-limit blip / two pages hammering one account):
// - A 429 waits one request interval and retries instead of failing the item immediately.
const busy = () => Object.assign(new Error('当前并发繁忙'), { status: 429 });

test('a 429 retries after the request interval instead of failing', async () => {
    let calls = 0;
    const result = await requestNovelImageWithRetry({
        request: async () => { calls += 1; if (calls === 1) throw busy(); return 'image'; },
        sendMode: 'frontend',
        retryDelayMs: 5,
    });
    assert.equal(result, 'image');
    assert.equal(calls, 2);
});

test('a second 429 also retries, then gives up with the real error', async () => {
    let calls = 0;
    await assert.rejects(requestNovelImageWithRetry({
        request: async () => { calls += 1; throw busy(); },
        sendMode: 'frontend',
        retryDelayMs: 1,
    }), error => error.status === 429);
    assert.equal(calls, 3);
});

test('a 5xx keeps its single retry and is not treated as a rate limit', async () => {
    let calls = 0;
    await assert.rejects(requestNovelImageWithRetry({
        request: async () => { calls += 1; throw Object.assign(new Error('boom'), { status: 503 }); },
        sendMode: 'frontend',
        retryDelayMs: 5,
    }));
    assert.equal(calls, 2);
});

test('an aborted signal cancels the retry wait', async () => {
    const controller = new AbortController();
    let sent = 0, notify;
    const firstAttempt = new Promise(resolve => { notify = resolve; });
    const retry = requestNovelImageWithRetry({
        request: async () => { sent++; notify(); throw busy(); },
        sendMode: 'frontend',
        retryDelayMs: 5000,
        signal: controller.signal,
    });
    await firstAttempt;
    await new Promise(resolve => setTimeout(resolve, 0));
    controller.abort();
    await assert.rejects(retry, error => error.status === 429);
    assert.equal(sent, 1);
});
