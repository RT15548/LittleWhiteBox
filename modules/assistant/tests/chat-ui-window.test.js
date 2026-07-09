import test from 'node:test';
import assert from 'node:assert/strict';

import {
    collectAssistantMessageWindowUnits,
    getAssistantMessageWindow,
    getAssistantVisibleMessageRange,
} from '../app-src/ui/chat-ui.js';

test('assistant chat UI windows latest five conversation turns without trimming messages', () => {
    const messages = Array.from({ length: 8 }, (_, index) => ([
        { role: 'user', content: `user-${index + 1}` },
        { role: 'assistant', content: `assistant-${index + 1}` },
    ])).flat();
    const state = {
        messages,
        uiMessageWindowLimit: 5,
    };

    const window = getAssistantMessageWindow(state);

    assert.equal(messages.length, 16);
    assert.equal(state.messages.length, 16);
    assert.equal(window.total, 8);
    assert.equal(window.hiddenBefore, 3);
    assert.equal(window.visibleUnits.length, 5);
    assert.deepEqual(window.visibleUnits.map((unit) => [unit.startIndex, unit.endIndex]), [
        [6, 8],
        [8, 10],
        [10, 12],
        [12, 14],
        [14, 16],
    ]);
});

test('assistant chat UI keeps a multi-tool exchange inside its user turn', () => {
    const messages = [
        { role: 'user', content: 'before' },
        {
            role: 'assistant',
            content: 'checking',
            toolCalls: [{ id: 'read-1', name: 'Read', arguments: {} }],
        },
        { role: 'tool', toolCallId: 'read-1', toolName: 'Read', content: '{"ok":true}' },
        {
            role: 'assistant',
            content: 'checking again',
            toolCalls: [{ id: 'grep-1', name: 'Grep', arguments: {} }],
        },
        { role: 'tool', toolCallId: 'grep-1', toolName: 'Grep', content: '{"ok":true}' },
        { role: 'assistant', content: 'done' },
    ];

    const units = collectAssistantMessageWindowUnits(messages);

    assert.deepEqual(units.map((unit) => unit.type), ['turn']);
    assert.deepEqual(units.map((unit) => [unit.startIndex, unit.endIndex]), [[0, 6]]);
});

test('assistant chat UI reveal window grows UI only', () => {
    const state = {
        messages: Array.from({ length: 12 }, (_, index) => [
            { role: 'user', content: `u-${index}` },
            { role: 'assistant', content: `a-${index}` },
        ]).flat(),
        uiMessageWindowLimit: 5,
    };

    const first = getAssistantMessageWindow(state);
    state.uiMessageWindowLimit = 25;
    const expanded = getAssistantMessageWindow(state);

    assert.equal(first.hiddenBefore, 7);
    assert.equal(expanded.hiddenBefore, 0);
    assert.equal(state.messages.length, 24);
});

test('assistant chat UI exposes only the visible tail message range for rendering', () => {
    const messages = Array.from({ length: 9 }, (_, index) => [
        { role: 'user', content: `u-${index}` },
        { role: 'assistant', content: `a-${index}` },
    ]).flat();
    const state = {
        messages,
        uiMessageWindowLimit: 5,
    };

    const window = getAssistantVisibleMessageRange(state);

    assert.equal(window.hiddenBefore, 4);
    assert.equal(window.visibleStartIndex, 8);
    assert.equal(window.visibleEndIndex, 18);
    assert.equal(state.messages[window.visibleStartIndex].content, 'u-4');
});
