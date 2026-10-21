import test from 'node:test';
import assert from 'node:assert/strict';
import { PLANNER_RETRY_MAX_DELAY_MS, isSceneSourceChangedError, retryOnSceneSourceChange, retryScenePlanning } from '../planner-retry.js';
import { ScenePlacementError, assertSceneSourceUnchanged } from '../scene-placement.js';

// Contract: retry only changed source text within the configured limit; cancellation stops requests (wrong placement or duplicate API charges).
function sourceChangedError() {
    try {
        assertSceneSourceUnchanged('new text', 'old-hash');
    } catch (error) {
        return error;
    }
    throw new Error('assertSceneSourceUnchanged did not throw');
}

test('the real source check raises the code the retry recognises', () => {
    const error = sourceChangedError();
    assert.ok(error instanceof ScenePlacementError);
    assert.equal(isSceneSourceChangedError(error), true);
    assert.equal(isSceneSourceChangedError(new ScenePlacementError('x')), false);
    assert.equal(isSceneSourceChangedError(null), false);
});

test('a changed source is re-planned with exponential backoff until it holds still', async () => {
    const delays = [];
    const retries = [];
    const runs = [];
    const result = await retryOnSceneSourceChange(async (retryNumber) => {
        runs.push(retryNumber);
        if (retryNumber < 2) throw sourceChangedError();
        return 'planned';
    }, {
        maxRetries: 3,
        baseDelayMs: 1000,
        random: () => 0.5,
        sleep: async (ms) => { delays.push(ms); },
        onRetry: info => retries.push([info.retry, info.maxRetries, info.delayMs]),
    });
    assert.equal(result, 'planned');
    assert.deepEqual(runs, [0, 1, 2]);
    assert.deepEqual(delays, [1000, 2000]);
    assert.deepEqual(retries, [[1, 3, 1000], [2, 3, 2000]]);
});

test('retryScenePlanning follows the Agent retry setting and reports each retry through onStateChange', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const states = [];
    let runs = 0;
    const pending = retryScenePlanning(async () => {
        runs += 1;
        if (runs === 1) throw sourceChangedError();
        return 'planned';
    }, { maxRetries: 2, onStateChange: (...args) => states.push(args) });
    await new Promise(resolve => globalThis.setImmediate(resolve));
    t.mock.timers.tick(PLANNER_RETRY_MAX_DELAY_MS);
    assert.equal(await pending, 'planned');
    assert.equal(runs, 2);
    assert.deepEqual(states, [['llm', { phase: 'retry', retry: { current: 1, total: 2 } }]]);
});

test('retryScenePlanning with maxRetries 0 surfaces the first source change without waiting', async () => {
    let runs = 0;
    await assert.rejects(() => retryScenePlanning(async () => {
        runs += 1;
        throw sourceChangedError();
    }, { maxRetries: 0, onStateChange: () => assert.fail('no retry state expected') }), error => isSceneSourceChangedError(error));
    assert.equal(runs, 1);
});

test('the source-changed retry gives up after maxRetries and surfaces the original error', async () => {
    let runs = 0;
    await assert.rejects(() => retryOnSceneSourceChange(async () => {
        runs += 1;
        throw sourceChangedError();
    }, { maxRetries: 2, sleep: async () => {} }), error => isSceneSourceChangedError(error));
    assert.equal(runs, 3);
});

test('a zero retry setting keeps the old behaviour: one attempt, no waiting', async () => {
    let runs = 0;
    let slept = false;
    await assert.rejects(() => retryOnSceneSourceChange(async () => {
        runs += 1;
        throw sourceChangedError();
    }, { maxRetries: 0, sleep: async () => { slept = true; } }), error => isSceneSourceChangedError(error));
    assert.equal(runs, 1);
    assert.equal(slept, false);
});

test('only a changed source is retried here; other failures are thrown untouched', async () => {
    let runs = 0;
    const failure = Object.assign(new Error('boom'), { code: 'PROVIDER_REQUEST_FAILED' });
    await assert.rejects(() => retryOnSceneSourceChange(async () => {
        runs += 1;
        throw failure;
    }, { maxRetries: 3, sleep: async () => {} }), error => error === failure);
    assert.equal(runs, 1);
});

test('cancelling stops the source-changed retry without another run', async () => {
    const controller = new AbortController();
    let runs = 0;
    await assert.rejects(() => retryOnSceneSourceChange(async () => {
        runs += 1;
        controller.abort();
        throw sourceChangedError();
    }, { maxRetries: 3, signal: controller.signal, sleep: async () => {} }), error => isSceneSourceChangedError(error));
    assert.equal(runs, 1);
});

test('cancelling while waiting between source-changed retries rejects as an abort', async () => {
    const controller = new AbortController();
    let runs = 0;
    await assert.rejects(() => retryOnSceneSourceChange(async () => {
        runs += 1;
        throw sourceChangedError();
    }, {
        maxRetries: 3,
        baseDelayMs: 60_000,
        signal: controller.signal,
        onRetry: () => queueMicrotask(() => controller.abort()),
    }), error => error.code === 'REQUEST_ABORTED');
    assert.equal(runs, 1);
});
