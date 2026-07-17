import test from 'node:test';
import assert from 'node:assert/strict';

import { useTavernAssistantChatLiveController } from '../app-src/features/assistant-chat/useTavernAssistantChatLiveController';
import type {
    TavernAppendAssistantChatMessageInput,
    TavernAssistantChatMessageRecord,
} from '../shared/session-db';

function persistedRecords(
    sessionId: string,
    messages: TavernAppendAssistantChatMessageInput[],
): TavernAssistantChatMessageRecord[] {
    return messages.map((message, order) => ({
        sessionId,
        order,
        role: message.role,
        content: message.content,
        error: message.error === true,
        createdAt: 1000 + order,
        updatedAt: 1000 + order,
        thoughts: message.thoughts,
        provider: message.provider,
        model: message.model,
        finishReason: message.finishReason,
        toolCalls: message.toolCalls,
        toolCallId: message.toolCallId,
        toolName: message.toolName,
        toolDisplay: message.toolDisplay,
    }));
}

function normalizeThoughts(value: unknown) {
    return Array.isArray(value)
        ? value.map((item) => ({
            label: String((item as { label?: unknown })?.label || ''),
            text: String((item as { text?: unknown })?.text || ''),
        }))
        : [];
}

test('assistant chat live stream applies text and thoughts as independent partial patches', () => {
    const controller = useTavernAssistantChatLiveController({
        normalizeThoughts,
        minFlushIntervalMs: 0,
    });
    const run = controller.startRun('session-1');

    run.onStreamProgress({
        text: '已经显示的正文',
        thoughts: [{ label: '思考', text: '第一段' }],
    });
    run.flushStreamNow();
    assert.equal(controller.assistantDraft.value?.content, '已经显示的正文');
    assert.deepEqual(controller.assistantDraft.value?.thoughts, [{ label: '思考', text: '第一段' }]);

    run.onStreamProgress({ thoughts: [{ label: '思考', text: '第二段' }] });
    run.flushStreamNow();
    assert.equal(controller.assistantDraft.value?.content, '已经显示的正文');
    assert.deepEqual(controller.assistantDraft.value?.thoughts, [{ label: '思考', text: '第二段' }]);

    run.onStreamProgress({ text: '正文继续增长' });
    run.flushStreamNow();
    assert.equal(controller.assistantDraft.value?.content, '正文继续增长');
    assert.deepEqual(controller.assistantDraft.value?.thoughts, [{ label: '思考', text: '第二段' }]);

    run.onStreamProgress({ toolCalls: [{ id: 'read-1', name: 'Read' }], toolCallDraft: true });
    run.flushStreamNow();
    assert.equal(controller.assistantDraft.value?.content, '正文继续增长');
    assert.ok(Array.isArray(controller.assistantDraft.value?.thoughts));
});

test('completed old tool round cannot clear a newer live tool round after slow persistence', async () => {
    let resolveFirstPersist: ((records: TavernAssistantChatMessageRecord[]) => void) | null = null;
    const persistedBatches: TavernAppendAssistantChatMessageInput[][] = [];
    const controller = useTavernAssistantChatLiveController({
        normalizeThoughts,
        minFlushIntervalMs: 0,
        appendMessages: async (sessionId, messages) => {
            persistedBatches.push(messages);
            if (persistedBatches.length === 1) {
                return await new Promise<TavernAssistantChatMessageRecord[]>((resolve) => {
                    resolveFirstPersist = resolve;
                });
            }
            return persistedRecords(sessionId, messages);
        },
    });
    const run = controller.startRun('session-1');
    const firstAssistant = {
        role: 'assistant' as const,
        content: '先读取。',
        toolCalls: [{ id: 'read-1', name: 'Read', arguments: '{}' }],
    };
    const firstTool = {
        role: 'tool' as const,
        content: '{"ok":true}',
        toolCallId: 'read-1',
        toolName: 'Read',
        toolDisplay: '读取完成。',
    };
    run.onProtocolEvent({ type: 'assistant_tool_round', message: firstAssistant });
    run.onProtocolEvent({ type: 'tool_result', message: firstTool });
    await Promise.resolve();

    run.onProtocolEvent({
        type: 'assistant_tool_round',
        message: {
            role: 'assistant',
            content: '再写入。',
            toolCalls: [{ id: 'write-2', name: 'Write', arguments: '{}' }],
        },
    });
    const secondRoundKey = controller.toolRound.value?.key;
    assert.equal(controller.toolRound.value?.calls[0]?.id, 'write-2');

    assert.ok(resolveFirstPersist);
    resolveFirstPersist(persistedRecords('session-1', [firstAssistant, firstTool]));
    await run.waitForProtocolPersistence();

    assert.equal(persistedBatches[0]?.length, 2);
    assert.equal(controller.toolRound.value?.key, secondRoundKey);
    assert.equal(controller.toolRound.value?.calls[0]?.id, 'write-2');
});

test('protocol persistence stores complete tool rounds once and appends only the remaining final message', async () => {
    const persistedBatches: TavernAppendAssistantChatMessageInput[][] = [];
    const controller = useTavernAssistantChatLiveController({
        normalizeThoughts,
        minFlushIntervalMs: 0,
        appendMessages: async (sessionId, messages) => {
            persistedBatches.push(messages);
            return persistedRecords(sessionId, messages);
        },
    });
    const run = controller.startRun('session-1');
    const assistantToolMessage = {
        role: 'assistant' as const,
        content: '先查一下。',
        toolCalls: [{ id: 'read-1', name: 'Read', arguments: '{}' }],
    };
    const toolMessage = {
        role: 'tool' as const,
        content: '{"ok":true}',
        toolCallId: 'read-1',
        toolName: 'Read',
        toolDisplay: '读取完成。',
    };
    const finalMessage = { role: 'assistant' as const, content: '已经处理完成。' };

    run.onProtocolEvent({ type: 'assistant_tool_round', message: assistantToolMessage });
    run.onProtocolEvent({ type: 'tool_result', message: toolMessage });
    await run.persistResult(
        [assistantToolMessage, toolMessage, finalMessage],
        '没有返回内容。',
        { provider: 'test', model: 'test-model', finishReason: 'stop', error: false },
    );

    assert.deepEqual(persistedBatches.map((batch) => batch.length), [2, 1]);
    assert.equal(persistedBatches[1]?.[0]?.content, '已经处理完成。');
    assert.equal(persistedBatches[1]?.[0]?.finishReason, 'stop');
});
