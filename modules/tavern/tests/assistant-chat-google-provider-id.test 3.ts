import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';

import db, {
    appendTavernAssistantChatMessages,
    createTavernSession,
    listTavernAssistantChatMessages,
} from '../shared/session-db';
import { buildAssistantChatMessages } from '../app-src/runtime/assistant-chat-context';

test('assistant chat preserves an id-less Google tool call through IndexedDB replay', async () => {
    await db.delete();
    await db.open();
    const session = await createTavernSession({ title: 'Google provider id replay' });
    await appendTavernAssistantChatMessages(session.id, [
        { role: 'user', content: '读取状态' },
        {
            role: 'assistant',
            content: '',
            toolCalls: [{
                id: 'google-tool-1-1',
                name: 'Read',
                arguments: '{"path":"memory/state.md"}',
                providerId: '',
            }],
        },
        {
            role: 'tool',
            content: '{"ok":true}',
            toolCallId: 'google-tool-1-1',
            toolName: 'Read',
        },
    ]);

    const stored = await listTavernAssistantChatMessages(session.id);
    const storedToolCall = stored.find((message) => message.role === 'assistant')?.toolCalls?.[0];
    assert.equal(storedToolCall?.providerId, '');
    assert.equal(Object.prototype.hasOwnProperty.call(storedToolCall || {}, 'providerId'), true);

    const replay = await buildAssistantChatMessages({
        sessionId: session.id,
        question: '继续处理',
        history: stored,
    });
    const replayToolCall = replay.find((message) => message.role === 'assistant')?.tool_calls?.[0];
    assert.equal(replayToolCall?.providerToolCallId, '');
    assert.equal(Object.prototype.hasOwnProperty.call(replayToolCall || {}, 'providerToolCallId'), true);
});
