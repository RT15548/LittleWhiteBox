import test from 'node:test';
import assert from 'node:assert/strict';

import {
    buildTavernChatTimeline,
    buildTavernMessageDisplayDepths,
} from '../app-src/components/chat/chat-timeline';
import type { TavernMessageRecord } from '../shared/session-db';

function message(role: TavernMessageRecord['role'], order: number): TavernMessageRecord {
    return {
        messageId: `message-${order}`,
        sessionId: 'session-1',
        role,
        content: `${role}-${order}`,
        order,
        createdAt: order + 1,
    };
}

const messageKey = (item: TavernMessageRecord) => `${item.sessionId}:${item.order}`;

test('live and finalized assistant occupy the same keyed timeline slot', () => {
    const user = message('user', 0);
    const assistant = message('assistant', 1);

    const live = buildTavernChatTimeline({
        messages: [user],
        messageKey,
        pendingUserVisible: false,
        liveAssistantVisible: true,
        liveAssistantKey: 'session-1:1',
    });
    const persistedDuringHandoff = buildTavernChatTimeline({
        messages: [user, assistant],
        messageKey,
        pendingUserVisible: false,
        liveAssistantVisible: true,
        liveAssistantKey: 'session-1:1',
    });
    const finalized = buildTavernChatTimeline({
        messages: [user, assistant],
        messageKey,
        pendingUserVisible: false,
        liveAssistantVisible: false,
        liveAssistantKey: '',
    });

    assert.deepEqual(live.map((item) => item.key), ['session-1:0', 'session-1:1']);
    assert.deepEqual(persistedDuringHandoff.map((item) => item.key), ['session-1:0', 'session-1:1']);
    assert.deepEqual(finalized.map((item) => item.key), ['session-1:0', 'session-1:1']);
    assert.equal(live[1]?.kind, 'assistant');
    assert.equal(persistedDuringHandoff[1]?.kind, 'assistant');
    assert.equal(finalized[1]?.kind, 'assistant');
    assert.equal(persistedDuringHandoff.length, 2);
    assert.equal(persistedDuringHandoff[1]?.kind === 'assistant' && persistedDuringHandoff[1].message, assistant);
});

test('pending user and live assistant are timeline items, not out-of-band siblings', () => {
    const pending = buildTavernChatTimeline({
        messages: [],
        messageKey,
        pendingUserVisible: true,
        liveAssistantVisible: false,
        liveAssistantKey: '',
    });
    assert.deepEqual(pending.map((item) => [item.kind, item.key]), [['pending-user', 'pending:user']]);

    const live = buildTavernChatTimeline({
        messages: [message('user', 0)],
        messageKey,
        pendingUserVisible: false,
        liveAssistantVisible: true,
        liveAssistantKey: 'session-1:1',
    });
    assert.deepEqual(live.map((item) => [item.kind, item.key]), [
        ['persisted', 'session-1:0'],
        ['assistant', 'session-1:1'],
    ]);
});

test('assistant persistence does not invalidate historical display depths', () => {
    const history = [
        message('user', 0),
        message('assistant', 1),
        message('user', 2),
    ];
    const assistant = message('assistant', 3);
    const isDisplayMessage = (item: TavernMessageRecord) => (
        ['user', 'assistant'].includes(item.role)
        && !item.error
        && !!item.content.trim()
    );
    const liveDepths = buildTavernMessageDisplayDepths({
        messages: history,
        sessionId: 'session-1',
        liveAssistantKey: 'session-1:3',
        messageKey,
        isDisplayMessage,
    });
    const finalizedDepths = buildTavernMessageDisplayDepths({
        messages: [...history, assistant],
        sessionId: 'session-1',
        liveAssistantKey: '',
        messageKey,
        isDisplayMessage,
    });

    assert.deepEqual(liveDepths, {
        'session-1:0': 3,
        'session-1:1': 2,
        'session-1:2': 1,
    });
    assert.deepEqual(finalizedDepths, {
        ...liveDepths,
        'session-1:3': 0,
    });
});

test('an error assistant still occupies its logical depth even when it skips display regex', () => {
    const history = [message('user', 0)];
    const errorAssistant = { ...message('assistant', 1), error: true };
    const depths = buildTavernMessageDisplayDepths({
        messages: [...history, errorAssistant],
        sessionId: 'session-1',
        liveAssistantKey: '',
        messageKey,
        isDisplayMessage: (item) => !item.error,
    });

    assert.deepEqual(depths, { 'session-1:0': 1 });
});
