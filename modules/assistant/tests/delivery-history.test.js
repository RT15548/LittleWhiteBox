import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { createSessionStore } from '../app-src/state/session-store.js';
import { createChatUi } from '../app-src/ui/chat-ui.js';
import { deliveredText } from '../plugins/delivery/history.js';
import { DEFAULT_REQUIREMENTS, TOOL_DELIVER } from '../plugins/delivery/protocol.js';
import { loadDeliverySettings, saveDeliverySettings } from '../plugins/delivery/settings.js';

function session() {
    const state = { messages: [], compactions: [], editingMessageIndex: -1 };
    const deps = { state, normalizeAttachments: items => items || [], normalizeThoughtBlocks: items => items || [],
        createRequestId: () => 'restored', getActiveContextMessages: () => state.messages };
    return { state, store: createSessionStore(deps), ui: createChatUi({ ...deps, getToolActivity: () => null }) };
}

test('a successful delivery is one Markdown reply after disabling and reopening; failed receipts never become replies', async () => {
    const { document } = parseHTML('<html><body><div id="chat"></div></body></html>');
    const previous = globalThis.document;
    globalThis.document = document;
    try {
        const map = new Map();
        const storage = { getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: key => map.delete(key) };
        const preferences = loadDeliverySettings(storage);
        assert.deepEqual(preferences, { enabled: false, requirements: DEFAULT_REQUIREMENTS });
        saveDeliverySettings({ enabled: true, requirements: 'concise' }, storage);
        assert.equal(loadDeliverySettings(storage).enabled, true);
        const original = session();
        await original.store.restoreSession();
        const body = '**published**';
        const call = (id, text) => ({ role: 'assistant', content: '', toolCalls: [{ id, name: TOOL_DELIVER, arguments: JSON.stringify({ body: text }) }] });
        const receipt = (id, value) => ({ role: 'tool', toolName: TOOL_DELIVER, toolCallId: id, content: JSON.stringify(value) });
        original.state.messages.push({ role: 'user', content: 'reply' }, call('a', 'draft only'), receipt('a', { ok: false, body: 'failed' }),
            call('a', body), receipt('a', { ok: true }));
        assert.equal((await original.store.persistSession()).ok, true);
        saveDeliverySettings({ enabled: false, requirements: 'concise' }, storage);
        assert.deepEqual(loadDeliverySettings(storage), { enabled: false, requirements: 'concise' });
        const reopened = session();
        await reopened.store.restoreSession();
        assert.equal(reopened.state.messages.length, original.state.messages.length);
        assert.equal(deliveredText(reopened.state.messages, reopened.state.messages.length - 1), body);
        const chat = document.getElementById('chat');
        reopened.ui.renderMessages(chat);
        reopened.ui.renderMessages(chat);
        const replies = chat.querySelectorAll('.xb-assistant-bubble.role-assistant');
        assert.equal(replies.length, 1);
        assert.equal(replies[0].querySelector('.xb-assistant-markdown strong').textContent, 'published');
        assert.ok(replies[0].querySelector('[data-message-action="copy"]'));
        assert.ok(!chat.querySelector('.xb-assistant-process .xb-assistant-bubble'));
        saveDeliverySettings(preferences, storage);
        assert.equal(map.size, 0);
    } finally {
        globalThis.document = previous;
    }
});
