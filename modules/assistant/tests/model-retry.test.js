import assert from 'node:assert/strict';
import test from 'node:test';
import { APIConnectionError, APIConnectionTimeoutError, APIUserAbortError } from 'openai';
import { APIConnectionError as AnthropicConnectionError, APIConnectionTimeoutError as AnthropicTimeoutError, APIUserAbortError as AnthropicAbortError } from '@anthropic-ai/sdk';
import { OpenAIResponsesAdapter } from '../../agent-core/adapters/openai-responses.js';
import { GoogleAdapter } from '../../agent-core/adapters/google.js';
import { readResponseCompletion } from '../../agent-core/runtime/response-completion.js';
import { createModelRequestRetry, isRetryableModelError, isModelRefusal, waitForModelRetry } from '../app-src/runtime/model-retry.js';

const failure = status => Object.assign(new Error('fixture failure'), { status });

// A single paid model round has one wire budget, including relay format negotiation.
// A live SDK must also preserve server cooldowns or the round burns through that budget early.
async function runRound(adapter, retry, request) {
    for (;;) {
        try {
            const result = await adapter.chat(request, retry.transport);
            retry.reset();
            return result;
        } catch (error) {
            if (!await retry.wait(error, request.signal)) throw error;
        }
    }
}

for (const streaming of [false, true]) test(`relay format fallback shares four sends; a new round negotiates independently (stream=${streaming})`, async t => {
    const formats = [];
    let rejectModern = true;
    t.mock.method(globalThis, 'fetch', async (_url, init) => {
        const modern = !!JSON.parse(init.body).instructions;
        formats.push(modern ? 'modern' : 'legacy');
        const unsupported = modern && rejectModern;
        return Response.json({ error: { message: unsupported ? 'Unknown parameter: instructions' : 'server error' } },
            { status: unsupported ? 400 : 503 });
    });
    const adapter = new OpenAIResponsesAdapter({ apiKey: 'fixture', baseUrl: 'https://relay.invalid/v1', model: 'fixture' });
    const retry = createModelRequestRetry({ wait: async () => {} });
    const request = { systemPrompt: 'fixture', messages: [{ role: 'user', content: 'test' }], ...(streaming ? { onStreamProgress() {} } : {}) };
    await assert.rejects(runRound(adapter, retry, request), { status: 503 });
    assert.deepEqual(formats, ['modern', 'legacy', 'legacy', 'legacy']);
    formats.length = 0;
    retry.reset();
    rejectModern = false;
    await assert.rejects(runRound(adapter, retry, request), { status: 503 });
    assert.deepEqual(formats, Array(4).fill('modern'));
});

for (const streaming of [false, true]) test(`Gemini SDK honors a short cooldown and surfaces a long one without another send (stream=${streaming})`, async t => {
    let sends = 0;
    t.mock.method(globalThis, 'fetch', async () => Response.json({ error: { message: 'busy', status: 'RESOURCE_EXHAUSTED' } },
        { status: 429, headers: { 'Retry-After': ++sends === 1 ? '2' : '60' } }));
    const waits = [];
    const retry = createModelRequestRetry({ wait: async ms => waits.push(ms) });
    const adapter = new GoogleAdapter({ apiKey: 'fixture', model: 'gemini-fixture', baseUrl: 'https://gemini.invalid' });
    await assert.rejects(runRound(adapter, retry, { messages: [{ role: 'user', content: 'test' }],
        ...(streaming ? { onStreamProgress() {} } : {}) }), error => error.retryAfterMs === 60000 && error.cause?.status === 429);
    assert.deepEqual(waits, [2000]);
    assert.equal(sends, 2);
});

test('a relay rejecting instructions on the last send cannot start a fifth compatibility request', async t => {
    let sends = 0;
    t.mock.method(globalThis, 'fetch', async () => ++sends < 4
        ? Response.json({ error: { message: 'busy' } }, { status: 503 })
        : Response.json({ error: { message: 'Unknown parameter: instructions' } }, { status: 400 }));
    const adapter = new OpenAIResponsesAdapter({ apiKey: 'fixture', baseUrl: 'https://relay.invalid/v1', model: 'fixture' });
    await assert.rejects(runRound(adapter, createModelRequestRetry({ wait: async () => {} }),
        { systemPrompt: 'fixture', messages: [{ role: 'user', content: 'test' }] }), { status: 400 });
    assert.equal(sends, 4);
});

const refusal = (protocol = 'google', reason = 'PROHIBITED_CONTENT', refused = false) => {
    try { readResponseCompletion(protocol, reason, refused); }
    catch (error) { return error; }
    assert.fail('fixture must be a structured refusal');
};

for (const [protocol, reason, refused] of [['google', 'PROHIBITED_CONTENT', false], ['anthropic', 'refusal', false], ['responses', 'completed', true]]) {
    test(`structured ${protocol} refusal gets only two retries and resets after success`, async () => {
        const events = [], retry = createModelRequestRetry({ wait: async () => {}, onRetry: event => events.push(event) });
        const error = refusal(protocol, reason, refused);
        error.message = 'arbitrary presentation';
        assert.equal(isModelRefusal(error), true);
        assert.equal(isRetryableModelError(new Error('wrapped', { cause: error })), true);
        assert.equal(await retry.wait(error), true);
        assert.equal(await retry.wait(error), true);
        assert.equal(await retry.wait(error), false);
        assert.equal(retry.attempts, 2);
        assert.deepEqual(events.map(({ kind, attempt, limit }) => ({ kind, attempt, limit })), [
            { kind: 'refusal', attempt: 1, limit: 2 }, { kind: 'refusal', attempt: 2, limit: 2 },
        ]);
        retry.reset();
        assert.equal(await retry.wait(error), true);
        assert.equal(retry.attempts, 1);
    });
}

test('refusals and transport failures share the same overall allowance without stacking', async () => {
    for (const sequence of [[refusal(), failure(500), refusal()], [failure(500), failure(500), refusal()], [refusal(), refusal(), failure(500)]]) {
        const events = [], retry = createModelRequestRetry({ wait: async () => {}, onRetry: event => events.push(event) });
        for (const error of sequence) assert.equal(await retry.wait(error), true);
        assert.equal(await retry.wait(refusal()), false);
        assert.equal(await retry.wait(failure(500)), false);
        assert.equal(retry.attempts, 3);
        assert.ok(events.every(event => event.attempt <= event.limit && event.limit <= 3));
    }
    assert.equal(isRetryableModelError(new Error('Model response was refused.')), false);
    assert.equal(isModelRefusal(new Error('Provider stopped with: PROHIBITED_CONTENT')), false);
});

test('a refusal backoff remains immediately cancellable', async () => {
    const controller = new AbortController();
    const retry = createModelRequestRetry({ onRetry: () => controller.abort() });
    await assert.rejects(retry.wait(refusal(), controller.signal), { name: 'AbortError' });
    await assert.rejects(retry.wait(refusal(), controller.signal), { name: 'AbortError' });
    assert.equal(retry.attempts, 1);
});

test('transient API failures allow three extra attempts and reset only after success', async () => {
    const waits = [], events = [];
    const retry = createModelRequestRetry({ random: () => 0.5, wait: async ms => waits.push(ms), onRetry: event => events.push(event) });
    for (let n = 0; n < 3; n++) assert.equal(await retry.wait(failure(500)), true);
    assert.equal(await retry.wait(failure(500)), false);
    assert.equal(retry.attempts, 3);
    assert.deepEqual(events.map(event => event.attempt), [1, 2, 3]);
    assert.ok(waits.every(ms => ms > 0 && ms <= 10000));
    assert.ok(waits[0] < waits[1] && waits[1] < waits[2]);
    retry.reset();
    assert.equal(await retry.wait(failure(503)), true);
    assert.equal(retry.attempts, 1);
});

test('classification uses structured protocol fields, SDK identities and causes, not error prose', () => {
    for (const status of [408, 429, 500, 502, 503, 504, 529]) assert.equal(isRetryableModelError(failure(status)), true);
    for (const status of [400, 401, 402, 403, 404, 413, 422]) assert.equal(isRetryableModelError(failure(status)), false);
    assert.equal(isRetryableModelError(Object.assign(failure(429), { code: 'insufficient_quota' })), false);
    assert.equal(isRetryableModelError(new Error('500 server error timeout connection reset')), false);
    assert.equal(isRetryableModelError(new TypeError('Failed to fetch')), false, 'Do not retry arbitrary programming TypeErrors');
    assert.equal(isRetryableModelError({ status: 200, error: { code: 'server_error' } }), true, 'In-band errors are not successful HTTP responses');
    assert.equal(isRetryableModelError({ status: 200, error: { code: 'insufficient_quota' } }), false);
    assert.equal(isRetryableModelError({ status: 200, error: { code: 503 } }), true, 'Hosted Google in-band numeric status');
    assert.equal(isRetryableModelError({ status: 200, error: { code: 400 } }), false);
    assert.equal(isRetryableModelError({ code: 503 }), true, 'Google structured HTTP code');
    assert.equal(isRetryableModelError({ code: 'OPENAI_RESPONSES_FAILED', reason: 'server_error' }), true);
    assert.equal(isRetryableModelError({ code: 'OPENAI_RESPONSES_FAILED', reason: 'invalid_prompt' }), false);
    for (const error of [new APIConnectionError({}), new APIConnectionTimeoutError(), new AnthropicConnectionError({}), new AnthropicTimeoutError()]) {
        assert.equal(isRetryableModelError(error), true);
        assert.equal(isRetryableModelError(new Error('wrapped', { cause: error })), true);
    }
    for (const error of [new APIUserAbortError(), new AnthropicAbortError(), new DOMException('stopped', 'AbortError')]) assert.equal(isRetryableModelError(error), false);
});

test('server cooldowns are honored within the automatic retry budget', async () => {
    const waits = [];
    const retry = createModelRequestRetry({ wait: async ms => waits.push(ms) });
    assert.equal(await retry.wait(Object.assign(failure(429), { headers: new Headers({ 'retry-after': '2' }) })), true);
    assert.equal(await retry.wait(Object.assign(failure(429), { headers: { 'retry-after-ms': '750' } })), true);
    await assert.rejects(retry.wait(Object.assign(failure(429), { headers: new Headers({ 'retry-after': '60' }) })), { retryAfterMs: 60000 });
    assert.deepEqual(waits, [2000, 750]);
    assert.equal(retry.attempts, 2);
});

test('stop cancels a pending backoff and a pre-aborted request never starts waiting', async () => {
    const controller = new AbortController();
    const pending = waitForModelRetry(10000, controller.signal);
    controller.abort();
    await assert.rejects(pending, { name: 'AbortError' });
    const retry = createModelRequestRetry({ wait: () => assert.fail('already cancelled') });
    await assert.rejects(retry.wait(failure(500), controller.signal), { name: 'AbortError' });
    assert.equal(retry.attempts, 0);
});

for (const streaming of [false, true]) for (const nested of [false, true]) test(`actual Responses SDK HTTP500 stays structured with exactly four sends (stream=${streaming}, nested=${nested})`, async t => {
    let sends = 0;
    t.mock.method(globalThis, 'fetch', async () => {
        sends++;
        const details = { message: 'Internal Server Error', type: 'server_error', param: '', code: 'server_error' };
        return new Response(JSON.stringify(nested ? { error: details } : details),
            { status: 500, headers: { 'content-type': 'application/json', 'x-request-id': 'fixture-request' } });
    });
    const adapter = new OpenAIResponsesAdapter({ apiKey: 'fixture', baseUrl: 'https://api.openai.com/v1', model: 'fixture' });
    const retry = createModelRequestRetry({ wait: async () => {} });
    const request = { messages: [{ role: 'user', content: 'fixture' }], tools: [], ...(streaming ? { onStreamProgress() {} } : {}) };
    let last;
    while (true) {
        try { await adapter.chat(request); assert.fail('fixture must fail'); }
        catch (error) { last = error; if (!await retry.wait(error)) break; }
    }
    assert.equal(sends, 4, 'SDK retries must not multiply Assistant retries');
    assert.equal(last.status, 500);
    if (nested) {
        assert.equal(last.code, 'server_error');
        assert.equal(last.type, 'server_error');
    }
    assert.equal(last.requestID, 'fixture-request');
    assert.equal(last.requestInspection.requestCount, 1);
});
