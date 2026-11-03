import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { openXiaobaiOsAgentSession, testXiaobaiOsAgentConnection } from '../agent/browser-entry.js';

test('OS connection testing and ordinary sessions share the keyless CORE transport', async t => {
    const requests = [];
    const server = createServer(async (request, response) => {
        let raw = '';
        for await (const chunk of request) raw += chunk;
        requests.push({ headers: request.headers, body: JSON.parse(raw) });
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ model: 'test-model', choices: [{ message: { role: 'assistant', content: 'OK' }, finish_reason: 'stop' }] }));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
    const config = { provider: 'openai-compatible', model: 'test-model', apiKey: '', baseUrl: `http://127.0.0.1:${server.address().port}`, timeoutMs: 3000 };
    const connection = await testXiaobaiOsAgentConnection(config);
    assert.equal(connection.provider, config.provider);
    assert.equal(connection.model, config.model);
    const session = openXiaobaiOsAgentSession(config);
    const result = await session.run({ systemPrompt: '', messages: [{ role: 'user', content: 'test' }] });
    assert.equal(result.text, 'OK');
    assert.equal(requests.length, 2);
    assert.equal(requests[0].body.max_tokens, 1600);
    for (const request of requests) assert.equal(request.headers.authorization, undefined);
});
