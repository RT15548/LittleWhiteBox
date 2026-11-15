import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { getMessageActions, getRerollUserIndex } from '../app-src/state/message-actions.js';
import { createChatUi } from '../app-src/ui/chat-ui.js';

const user = content => ({ role: 'user', content });
const answer = content => ({ role: 'assistant', content });

// Acceptance: old turns cannot be deleted or rerolled through message actions (cost: losing conversation history).
test('only the last user and the final answer in its turn allow destructive actions', () => {
    const messages = [user('first'), answer('first answer'), user('last'), answer('last answer')];
    assert.deepEqual(getMessageActions(messages, 0), []);
    assert.deepEqual(getMessageActions(messages, 1), ['copy', 'edit']);
    assert.deepEqual(getMessageActions(messages, 2), ['copy', 'edit', 'reroll', 'delete']);
    assert.deepEqual(getMessageActions(messages, 3), ['copy', 'edit', 'reroll', 'delete']);
    messages.pop();
    assert.deepEqual(getMessageActions(messages, 1), ['copy', 'edit']);
    messages.pop();
    assert.ok(getMessageActions(messages, 1).includes('delete'));
});

// Acceptance: reroll from the user keeps that exact input and attachments, omitting only its subsequent run (cost: wrong API context).
test('user and assistant rerolls target the same user across tools, approvals and attachment-only input', () => {
    const input = { ...user(''), attachments: [{ kind: 'image', name: 'fixture.png' }] };
    const messages = [user('earlier'), answer('earlier answer'), input,
        { ...answer('reading'), toolCalls: [{ id: 'read-1', name: 'Read' }] },
        { role: 'tool', toolCallId: 'read-1', content: 'result' },
        { ...answer('approval'), approvalRequest: { id: 'approval-1' } }, answer('final')];
    for (const index of [2, 6]) {
        const retained = messages.slice(0, getRerollUserIndex(messages, index) + 1);
        assert.deepEqual(retained, messages.slice(0, 3));
        assert.equal(retained.at(-1), input);
        assert.ok(getMessageActions(messages, index).includes('reroll'));
    }
    for (const index of [3, 4, 5]) assert.deepEqual(getMessageActions(messages, index), []);
    messages[6].streaming = true;
    assert.deepEqual(getMessageActions(messages, 6), []);
    assert.equal(getRerollUserIndex([answer('no user')], 0), -1);
});

// Acceptance: cached bubbles revoke old destructive actions after a new turn and restore them after deletion (cost: deleting the wrong turn).
test('rendered action eligibility follows appended and removed turns instead of stale bubble caches', () => {
    const { document, window } = parseHTML('<html><body><div id="chat"></div></body></html>');
    const previousDocument = globalThis.document;
    globalThis.document = document;
    document.getSelection = () => ({ isCollapsed: true });
    try {
        const state = { messages: [user('first'), answer('first answer')], editingMessageIndex: -1 };
        const ui = createChatUi({ state, getToolActivity: () => null,
            normalizeThoughtBlocks: value => value || [], normalizeAttachments: value => value || [],
            renderAttachmentGallery() {} });
        const chat = document.getElementById('chat');
        const actions = index => [...chat.querySelectorAll(`[data-message-index="${index}"] nav button`)]
            .map(button => button.dataset.messageAction);
        ui.renderMessages(chat);
        const bubble = chat.querySelector('[data-message-index="0"]');
        bubble.dispatchEvent(new window.Event('click', { bubbles: true }));
        assert.equal(bubble.querySelector('nav').hidden, false);
        assert.ok(actions(0).includes('edit'));
        state.messages.push(user('second'), answer('second answer'));
        ui.renderMessages(chat);
        assert.deepEqual(actions(0), []);
        assert.deepEqual(actions(1), ['copy', 'edit']);
        assert.ok(actions(2).includes('delete'));
        state.editingMessageIndex = 2;
        ui.renderMessages(chat);
        assert.equal(chat.querySelector('textarea').value, 'second');
        assert.deepEqual(actions(2), ['save-edit', 'cancel-edit']);
        state.editingMessageIndex = -1;
        state.messages.splice(2);
        ui.renderMessages(chat);
        assert.ok(actions(0).includes('delete'));
        assert.ok(actions(1).includes('reroll'));
    } finally {
        globalThis.document = previousDocument;
    }
});
