import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveConversationTokens } from '../../agent-core/runtime/context-tokens.js';

test('OpenAI-compatible context counting sends one complete message payload', async () => {
    const requests = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url, options = {}) => {
        requests.push({
            url: String(url),
            body: JSON.parse(String(options.body || '[]')),
        });
        return {
            ok: true,
            json: async () => ({ token_count: 321 }),
        };
    };
    try {
        const tokens = await resolveConversationTokens({
            messages: [
                { role: 'system', content: '规则' },
                { role: 'user', content: '请求' },
            ],
            tools: [{ function: { name: 'Read', parameters: { type: 'object' } } }],
            providerConfig: { provider: 'openai-compatible', model: 'deepseek-test' },
        });
        assert.equal(tokens, 321);
        assert.equal(requests.length, 1);
        assert.match(requests[0].url, /\/api\/tokenizers\/openai\/count\?model=deepseek-test/);
        assert.equal(requests[0].body.length, 3);
    } finally {
        globalThis.fetch = originalFetch;
    }
});
