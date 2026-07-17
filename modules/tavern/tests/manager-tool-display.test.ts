import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildManagerChatDisplayItems,
} from '../app-src/manager-tool-display';
import type { TavernAssistantChatMessageRecord as TavernManagerMessageRecord } from '../shared/session-db';

function managerMessage(patch: Partial<TavernManagerMessageRecord> & Pick<TavernManagerMessageRecord, 'order' | 'role'>): TavernManagerMessageRecord {
    return {
        sessionId: 'session-1',
        order: patch.order,
        role: patch.role,
        content: patch.content || '',
        error: patch.error === true,
        finishReason: patch.finishReason,
        createdAt: patch.createdAt || 1000 + patch.order,
        updatedAt: patch.updatedAt || 1000 + patch.order,
        name: patch.name,
        thoughts: patch.thoughts,
        providerPayload: patch.providerPayload,
        toolCalls: patch.toolCalls,
        toolCallId: patch.toolCallId,
        toolName: patch.toolName,
        toolDisplay: patch.toolDisplay,
    };
}

test('manager chat display groups consecutive tool protocol rounds into one turn', () => {
    const items = buildManagerChatDisplayItems([
        managerMessage({ order: 0, role: 'user', content: '查状态。' }),
        managerMessage({
            order: 1,
            role: 'assistant',
            content: '先读状态。',
            toolCalls: [{ id: 'read-state', name: 'Read', arguments: '{"filePath":"memory/state.md"}' }],
        }),
        managerMessage({
            order: 2,
            role: 'tool',
            toolCallId: 'read-state',
            toolName: 'Read',
            content: '{"ok":true,"summary":"读到了状态。"}',
        }),
        managerMessage({
            order: 3,
            role: 'assistant',
            content: '再写入。',
            toolCalls: [{ id: 'write-state', name: 'Write', arguments: '{"filePath":"memory/state.md"}' }],
        }),
        managerMessage({
            order: 4,
            role: 'tool',
            toolCallId: 'write-state',
            toolName: 'Write',
            content: '{"ok":true,"summary":"已写入状态。"}',
        }),
        managerMessage({ order: 5, role: 'assistant', content: '完成。' }),
    ]);

    assert.equal(items.length, 3);
    assert.equal(items[0]?.kind, 'message');
    assert.equal(items[1]?.kind, 'tool-turn');
    assert.equal(items[2]?.kind, 'message');
    if (items[1]?.kind !== 'tool-turn') {
        throw new Error('expected_tool_turn');
    }
    assert.equal(items[1].rounds.length, 2);
    assert.equal(items[1].calls.length, 2);
});

test('manager chat display treats aborted or errored draft messages as normal messages', () => {
    const items = buildManagerChatDisplayItems([
        managerMessage({ order: 0, role: 'user', content: '停一下。' }),
        managerMessage({
            order: 1,
            role: 'assistant',
            content: '已停止。',
            finishReason: 'aborted',
            toolCalls: [{ id: 'draft-read', name: 'Read', arguments: '{"filePath":"memory/state.md"}' }],
        }),
        managerMessage({
            order: 2,
            role: 'assistant',
            content: 'provider failed',
            error: true,
            finishReason: 'error',
            toolCalls: [{ id: 'draft-write', name: 'Write', arguments: '{"filePath":"memory/state.md"}' }],
        }),
    ]);

    assert.equal(items.length, 3);
    assert.equal(items.every((item) => item.kind === 'message'), true);
});
