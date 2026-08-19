import test from 'node:test';
import assert from 'node:assert/strict';

import {
    TAVERN_ASSISTANT_CHAT_LIVE_TOOL_LIMIT,
    useTavernAssistantChatLiveController,
} from '../app-src/features/assistant-chat/useTavernAssistantChatLiveController';
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
        providerPayload: message.providerPayload,
        provider: message.provider,
        model: message.model,
        finishReason: message.finishReason,
        toolCalls: message.toolCalls,
        toolCallId: message.toolCallId,
        toolName: message.toolName,
        toolDisplay: message.toolDisplay,
    }));
}

test('assistant live refs retain only text, thought count, and compact tool summaries', async () => {
    const persistedBatches: TavernAppendAssistantChatMessageInput[][] = [];
    const controller = useTavernAssistantChatLiveController({
        minFlushIntervalMs: 0,
        appendMessages: async (sessionId, messages) => {
            persistedBatches.push(messages);
            return persistedRecords(sessionId, messages);
        },
    });
    const run = controller.startRun('session-1');
    const thoughtMarker = `THOUGHT_SECRET_${'x'.repeat(100_000)}`;
    const argumentMarker = `ARGUMENT_SECRET_${'y'.repeat(100_000)}`;
    const resultMarker = `RESULT_SECRET_${'z'.repeat(100_000)}`;
    const providerMarker = 'PROVIDER_PAYLOAD_SECRET';

    run.onStreamProgress({
        text: '已经显示的正文',
        thoughts: [{ label: '思考', text: thoughtMarker }],
    });
    run.flushStreamNow();
    assert.equal(controller.assistantDraft.value?.content, '已经显示的正文');
    assert.equal(controller.assistantDraft.value?.thoughtCount, 1);
    assert.doesNotMatch(JSON.stringify(controller.assistantDraft.value), /THOUGHT_SECRET/);

    const assistantToolMessage = {
        role: 'assistant' as const,
        content: '读取目标文件。',
        providerPayload: { marker: providerMarker },
        toolCalls: [{ id: 'read-1', name: 'Read', arguments: JSON.stringify({ path: 'src/App.vue', marker: argumentMarker }) }],
    };
    const toolMessage = {
        role: 'tool' as const,
        content: JSON.stringify({ ok: true, source: resultMarker }),
        toolCallId: 'read-1',
        toolName: 'Read',
        toolDisplay: { status: 'resolved', path: 'src/App.vue', elapsedMs: 42, summary: '已读取目标文件。' },
    };
    run.onProtocolEvent({ type: 'assistant_tool_round', message: assistantToolMessage });
    run.onProtocolEvent({ type: 'tool_result', message: toolMessage });

    const liveJson = JSON.stringify(controller.toolRound.value);
    assert.match(liveJson, /src\/App\.vue/);
    assert.doesNotMatch(liveJson, /ARGUMENT_SECRET|RESULT_SECRET|PROVIDER_PAYLOAD_SECRET/);
    assert.equal(persistedBatches.length, 0);

    await run.persistResult(
        [assistantToolMessage, toolMessage, { role: 'assistant', content: '处理完成。' }],
        '没有返回内容。',
        { provider: 'test', model: 'test-model', finishReason: 'stop', error: false },
    );
    assert.match(String(persistedBatches[0]?.[0]?.toolCalls?.[0]?.arguments), /ARGUMENT_SECRET/);
    assert.match(JSON.stringify(persistedBatches[0]?.[0]?.providerPayload), /PROVIDER_PAYLOAD_SECRET/);
    assert.match(String(persistedBatches[0]?.[1]?.content), /RESULT_SECRET/);

    run.clear();
    assert.equal(controller.assistantDraft.value, null);
    assert.equal(controller.toolRound.value, null);
});

test('assistant live tool ring keeps only the latest eight summaries across rounds', async () => {
    const controller = useTavernAssistantChatLiveController({
        minFlushIntervalMs: 0,
        appendMessages: async (sessionId, messages) => persistedRecords(sessionId, messages),
    });
    const run = controller.startRun('session-1');
    for (let index = 1; index <= 12; index += 1) {
        const id = `tool-${index}`;
        run.onProtocolEvent({
            type: 'assistant_tool_round',
            message: {
                role: 'assistant',
                content: `第 ${index} 轮`,
                toolCalls: [{ id, name: 'Read', arguments: '{}' }],
            },
        });
        run.onProtocolEvent({
            type: 'tool_result',
            message: {
                role: 'tool',
                content: '{"ok":true}',
                toolCallId: id,
                toolName: 'Read',
                toolDisplay: { status: 'resolved', summary: `完成 ${index}` },
            },
        });
    }
    assert.equal(controller.toolRound.value?.calls.length, TAVERN_ASSISTANT_CHAT_LIVE_TOOL_LIMIT);
    assert.deepEqual(controller.toolRound.value?.calls.map((call) => call.protocolId), [
        'tool-5', 'tool-6', 'tool-7', 'tool-8', 'tool-9', 'tool-10', 'tool-11', 'tool-12',
    ]);
    assert.equal(new Set(controller.toolRound.value?.calls.map((call) => call.displayKey)).size, 8);
});

test('assistant live tools keep display identity separate when provider ids repeat across rounds', () => {
    const controller = useTavernAssistantChatLiveController({
        minFlushIntervalMs: 0,
        appendMessages: async (sessionId, messages) => persistedRecords(sessionId, messages),
    });
    const run = controller.startRun('session-1');
    run.onProtocolEvent({
        type: 'assistant_tool_round',
        message: {
            role: 'assistant',
            content: '第一轮',
            toolCalls: [{ id: 'provider-reused-id', name: 'Read', arguments: '{}' }],
        },
    });
    run.onProtocolEvent({
        type: 'tool_result',
        message: {
            role: 'tool',
            content: '{"ok":true}',
            toolCallId: 'provider-reused-id',
            toolName: 'Read',
            toolDisplay: { status: 'resolved', summary: '第一轮完成' },
        },
    });
    const firstDisplayKey = controller.toolRound.value?.calls[0]?.displayKey;

    run.onProtocolEvent({
        type: 'assistant_tool_round',
        message: {
            role: 'assistant',
            content: '第二轮',
            toolCalls: [{ id: 'provider-reused-id', name: 'Write', arguments: '{}' }],
        },
    });
    assert.deepEqual(controller.toolRound.value?.calls.map((call) => call.protocolId), [
        'provider-reused-id',
        'provider-reused-id',
    ]);
    assert.equal(new Set(controller.toolRound.value?.calls.map((call) => call.displayKey)).size, 2);
    assert.equal(controller.toolRound.value?.calls[0]?.summary, '第一轮完成');
    assert.equal(controller.toolRound.value?.calls[1]?.status, 'running');

    run.onProtocolEvent({
        type: 'tool_result',
        message: {
            role: 'tool',
            content: '{"ok":true}',
            toolCallId: 'provider-reused-id',
            toolName: 'Write',
            toolDisplay: { status: 'resolved', summary: '第二轮完成' },
        },
    });
    assert.equal(controller.toolRound.value?.calls[0]?.displayKey, firstDisplayKey);
    assert.equal(controller.toolRound.value?.calls[0]?.summary, '第一轮完成');
    assert.equal(controller.toolRound.value?.calls[1]?.summary, '第二轮完成');
});

test('assistant live tools without provider ids still receive unique display keys and resolve in their own round', () => {
    const controller = useTavernAssistantChatLiveController({
        minFlushIntervalMs: 0,
        appendMessages: async (sessionId, messages) => persistedRecords(sessionId, messages),
    });
    const run = controller.startRun('session-1');
    for (const summary of ['第一轮完成', '第二轮完成']) {
        run.onProtocolEvent({
            type: 'assistant_tool_round',
            message: {
                role: 'assistant',
                content: summary,
                toolCalls: [{ name: 'Read', arguments: '{}' }],
            },
        });
        run.onProtocolEvent({
            type: 'tool_result',
            message: {
                role: 'tool',
                content: '{"ok":true}',
                toolName: 'Read',
                toolDisplay: { status: 'resolved', summary },
            },
        });
    }
    assert.deepEqual(controller.toolRound.value?.calls.map((call) => call.protocolId), ['', '']);
    assert.equal(new Set(controller.toolRound.value?.calls.map((call) => call.displayKey)).size, 2);
    assert.deepEqual(controller.toolRound.value?.calls.map((call) => call.summary), ['第一轮完成', '第二轮完成']);
});

test('protocol persistence stores the complete terminal protocol in one batch', async () => {
    const persistedBatches: TavernAppendAssistantChatMessageInput[][] = [];
    const controller = useTavernAssistantChatLiveController({
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
        toolCalls: [{ id: 'google-tool-1-1', name: 'Read', arguments: '{"path":"a.ts"}', providerId: '' }],
    };
    const toolMessage = { role: 'tool' as const, content: '{"ok":true}', toolCallId: 'google-tool-1-1', toolName: 'Read', toolDisplay: '读取完成。' };
    const finalMessage = { role: 'assistant' as const, content: '已经处理完成。' };
    run.onProtocolEvent({ type: 'assistant_tool_round', message: assistantToolMessage });
    run.onProtocolEvent({ type: 'tool_result', message: toolMessage });
    await run.persistResult(
        [assistantToolMessage, toolMessage, finalMessage],
        '没有返回内容。',
        { provider: 'test', model: 'test-model', finishReason: 'stop', error: false },
    );

    assert.deepEqual(persistedBatches.map((batch) => batch.length), [3]);
    assert.equal(Object.prototype.hasOwnProperty.call(persistedBatches[0]?.[0]?.toolCalls?.[0] || {}, 'providerId'), true);
    assert.equal(persistedBatches[0]?.[0]?.toolCalls?.[0]?.providerId, '');
    assert.equal(persistedBatches[0]?.[2]?.content, '已经处理完成。');
    assert.equal(persistedBatches[0]?.[2]?.finishReason, 'stop');
});
