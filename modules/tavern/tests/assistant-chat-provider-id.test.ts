import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

import db, {
    appendTavernAssistantChatMessage,
    createTavernSession,
    listTavernAssistantChatMessages,
} from '../shared/session-db';
import { buildAssistantChatMessages } from '../app-src/runtime/assistant-chat-context';

test('assistant chat keeps explicit Google provider ids through IndexedDB cold replay', async () => {
    await db.delete();
    await db.open();

    const session = await createTavernSession({ title: 'Google provider id replay' });
    await appendTavernAssistantChatMessage(session.id, {
        role: 'assistant',
        content: '先读取文件。',
        toolCalls: [
            {
                id: 'google-tool-1-1',
                name: 'Read',
                arguments: '{"path":"a.md"}',
                providerId: '',
            },
            {
                id: 'google-tool-1-2',
                name: 'Read',
                arguments: '{"path":"b.md"}',
                providerId: 'google-server-id',
            },
            {
                id: 'legacy-local-id',
                name: 'Read',
                arguments: '{"path":"legacy.md"}',
            },
        ],
    });

    const stored = await listTavernAssistantChatMessages(session.id);
    const storedCalls = stored[0]?.toolCalls || [];
    assert.equal(Object.prototype.hasOwnProperty.call(storedCalls[0], 'providerId'), true);
    assert.equal(storedCalls[0]?.providerId, '');
    assert.equal(storedCalls[1]?.providerId, 'google-server-id');
    assert.equal(Object.prototype.hasOwnProperty.call(storedCalls[2], 'providerId'), false);

    const replay = await buildAssistantChatMessages({
        sessionId: session.id,
        question: '继续。',
        history: stored,
    });
    const assistant = replay.find((message) => message.role === 'assistant' && message.content === '先读取文件。');
    const replayCalls = assistant?.toolCalls || [];
    const providerCalls = assistant?.tool_calls || [];

    assert.equal(Object.prototype.hasOwnProperty.call(replayCalls[0], 'providerId'), true);
    assert.equal(replayCalls[0]?.providerId, '');
    assert.equal(replayCalls[1]?.providerId, 'google-server-id');
    assert.equal(Object.prototype.hasOwnProperty.call(replayCalls[2], 'providerId'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(providerCalls[0], 'providerToolCallId'), true);
    assert.equal(providerCalls[0]?.providerToolCallId, '');
    assert.equal(providerCalls[1]?.providerToolCallId, 'google-server-id');
    assert.equal(Object.prototype.hasOwnProperty.call(providerCalls[2], 'providerToolCallId'), false);
});
