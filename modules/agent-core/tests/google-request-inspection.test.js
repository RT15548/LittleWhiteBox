import test from 'node:test';
import assert from 'node:assert/strict';
import { GoogleAdapter } from '../adapters/google.js';

// Cost/security contract: diagnostic context matches the real SDK request, without credentials.
for (const streaming of [false, true]) {
    test(`Google ${streaming ? 'streaming' : 'non-streaming'} inspection preserves system and history across tool continuation`, async t => {
        const sent = [];
        const opening = 'OFFLINE_SYSTEM_SENTINEL';
        t.mock.method(globalThis, 'fetch', async (input, init) => {
            const request = new Request(input, init);
            assert.equal(new URL(request.url).hostname, 'offline.invalid');
            sent.push(await request.json());
            const part = sent.length === 1 ? { functionCall: { name: 'ping', args: {} } } : { text: 'OK' };
            const body = JSON.stringify({ candidates: [{ content: { role: 'model', parts: [part] }, finishReason: 'STOP' }] });
            return new Response(streaming ? `data: ${body}\n\n` : body, {
                headers: { 'Content-Type': streaming ? 'text/event-stream' : 'application/json' },
            });
        });
        const adapter = new GoogleAdapter({ model: 'offline-model', apiKey: 'offline-secret', resolvedBaseUrl: 'https://offline.invalid/v1beta' });
        const common = { signal: new AbortController().signal, ...(streaming ? { onStreamProgress() {} } : {}) };
        const first = await adapter.chat({ ...common,
            messages: [{ role: 'system', content: opening }, { role: 'user', content: 'ping' }],
            tools: [{ type: 'function', function: { name: 'ping', description: 'Ping', parameters: { type: 'object', properties: {} } } }],
        });
        const second = await adapter.chat({ ...common, toolResponses: [{ name: 'ping', providerId: '', response: { ok: true } }] });
        assert.equal(sent.length, 2);
        for (const [index, result] of [first, second].entries()) {
            const body = result.requestInspection.request.body;
            const session = body.chatCreate || body.session;
            assert.equal(session.config.systemInstruction, opening);
            assert.deepEqual(sent[index].systemInstruction.parts, [{ text: opening }]);
            assert.deepEqual(sent[index].contents.slice(0, -1), session.history);
            assert.deepEqual(sent[index].tools, [{ functionDeclarations: session.config.tools[0].functionDeclarations.map(tool => ({
                ...tool, parameters: { ...tool.parameters, type: 'OBJECT' },
            })) }]);
            assert.equal(JSON.stringify(result.requestInspection).includes('offline-secret'), false);
        }
        const continuation = sent[1].contents.at(-1);
        assert.equal(continuation.role, 'user');
        assert.deepEqual(continuation.parts, [{ functionResponse: { name: 'ping', response: { ok: true } } }]);
        assert.deepEqual(second.requestInspection.request.body.sendMessage.message, continuation);
    });
}
