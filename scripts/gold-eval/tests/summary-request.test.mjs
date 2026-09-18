import test from 'node:test';
import assert from 'node:assert/strict';
import { withSummaryRequestOverride, validateSummaryRequestOverride } from '../../story-summary-replay/summary-request.mjs';
import { createHostChatCompletion } from '../../story-summary-replay/shims/host-chat-completions-client.js';
import { withExternalCallTrace } from '../lib/transport-cassette.mjs';

test('evaluation effort reaches the actual Summary request and trace, stays scoped, and preserves the saved prefix', async () => {
    const previous = globalThis.fetch;
    const sent = [];
    globalThis.fetch = async (_url, init) => {
        sent.push(JSON.parse(init.body));
        return Response.json({ choices: [{ message: { content: '{}' } }] });
    };
    const payload = { reverse_proxy: 'https://fixture.invalid/v1', model: 'summary', messages: [], stream: false };
    const settings = { reasoningEffort: 'low', fromFloor: 124 };
    const request = () => createHostChatCompletion(payload);
    try {
        await withSummaryRequestOverride(settings, 123, request);
        const result = await withSummaryRequestOverride(settings, 124, () => withExternalCallTrace(request));
        await request();
        assert.deepEqual(sent.map(body => body.reasoning_effort), [undefined, 'low', undefined]);
        assert.equal(Object.hasOwn(payload, 'reasoning_effort'), false);
        assert.equal(result.trace.length, 1);
        assert.equal(result.calls, 1);
        await assert.rejects(() => withSummaryRequestOverride(settings, 124, async () => { throw new Error('stop'); }), /stop/);
        await request();
        assert.equal(sent.at(-1).reasoning_effort, undefined);
        assert.throws(() => validateSummaryRequestOverride({ ...settings, fromFloor: -1 }));
        assert.throws(() => validateSummaryRequestOverride({ ...settings, maxTokens: 100 }));
    } finally { globalThis.fetch = previous; }
});
