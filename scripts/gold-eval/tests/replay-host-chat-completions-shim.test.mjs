import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildHostOpenAICompatibleGeneratePayload,
    createHostChatCompletion,
    streamHostChatCompletion,
} from '../../story-summary-replay/shims/host-chat-completions-client.js';

function payload(stream = false) {
    return buildHostOpenAICompatibleGeneratePayload(
        { baseUrl: 'https://provider.example/v1/', apiKey: 'secret', model: 'model-a' },
        { temperature: 0 },
        [{ role: 'user', content: 'hello' }],
        stream,
    );
}

test('replay host adapter将酒馆代理payload等价直发到OpenAI-compatible上游', async t => {
    const previousFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = previousFetch; });
    let observed = null;
    globalThis.fetch = async (url, init) => {
        observed = { url, init, body: JSON.parse(init.body) };
        return new Response(JSON.stringify({ choices: [{ message: { content: 'ok' } }] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    };

    const result = await createHostChatCompletion(payload(false));
    assert.equal(result.choices[0].message.content, 'ok');
    assert.equal(observed.url, 'https://provider.example/v1/chat/completions');
    assert.equal(observed.init.headers.Authorization, 'Bearer secret');
    assert.equal(observed.body.model, 'model-a');
    assert.equal(observed.body.temperature, 0);
    assert.equal(observed.body.stream, false);
    assert.equal(Object.hasOwn(observed.body, 'reverse_proxy'), false);
    assert.equal(Object.hasOwn(observed.body, 'proxy_password'), false);
});

test('replay host adapter保留真实SSE流而不走相对host URL', async t => {
    const previousFetch = globalThis.fetch;
    t.after(() => { globalThis.fetch = previousFetch; });
    let observedUrl = null;
    globalThis.fetch = async (url, init) => {
        observedUrl = url;
        assert.equal(JSON.parse(init.body).stream, true);
        return new Response([
            'data: {"choices":[{"delta":{"content":"A"}}]}',
            '',
            'data: {"choices":[{"delta":{"content":"B"}}]}',
            '',
            'data: [DONE]',
            '',
        ].join('\n'), {
            status: 200,
            headers: { 'Content-Type': 'text/event-stream' },
        });
    };
    const events = [];
    await streamHostChatCompletion(payload(true), event => events.push(event));
    assert.equal(observedUrl, 'https://provider.example/v1/chat/completions');
    assert.equal(events.length, 2);
});
