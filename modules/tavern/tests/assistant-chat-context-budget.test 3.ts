import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { setHostChatCompletionsRequestHeadersProvider } from '../../../shared/host-llm/chat-completions/client.js';
import { ensureTavernAssistantChatBudget } from '../app-src/runtime/assistant-chat-context';
import db, { createTavernSession } from '../shared/session-db';

test('manager chat continues with estimates when Host authentication is unavailable', async t => {
    await db.delete(); await db.open();
    const session = await createTavernSession({ title: 'Budget boundary' });
    let csrf = '';
    setHostChatCompletionsRequestHeadersProvider(() => ({ 'X-CSRF-Token': csrf }));
    t.after(() => setHostChatCompletionsRequestHeadersProvider(null));
    t.mock.method(globalThis, 'fetch', async (_url: string | URL | Request, options?: RequestInit) => new Headers(options?.headers).get('X-CSRF-Token') === 'valid'
        ? Response.json({ count: 100, ids: Array(100).fill(1) })
        : new Response('', { status: 403 }));
    const input: Parameters<typeof ensureTavernAssistantChatBudget>[0] = { sessionId: session.id, agentConfig: {}, question: '继续', history: [] };
    const estimated = await ensureTavernAssistantChatBudget(input);
    assert.equal(estimated.canProceed, true);
    assert.ok(estimated.currentTokens > 0);
    csrf = 'valid';
    const result = await ensureTavernAssistantChatBudget(input);
    assert.equal(result.canProceed, true);
    assert.equal(result.currentTokens, 100);
    assert.deepEqual(result.removedOrders, []);
});
