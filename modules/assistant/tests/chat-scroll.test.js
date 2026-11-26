import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { createChatUi } from '../app-src/ui/chat-ui.js';

// Explicit geometry supplies the layout linkedom lacks. Scroll events use the same
// handler as the app; microtasks run normally rather than mocking the scheduler.
async function withChat(run) {
    const { document, window } = parseHTML('<html><body><div id="chat"></div></body></html>');
    const previousDocument = globalThis.document;
    globalThis.document = document;
    document.getSelection = () => ({ isCollapsed: true });
    try {
        const state = { messages: [{ role: 'user', content: 'New message' }], autoScroll: true, editingMessageIndex: -1 };
        const ui = createChatUi({ state, getToolActivity: () => null,
            normalizeThoughtBlocks: value => value || [], normalizeAttachments: value => value || [],
            renderAttachmentGallery() {} });
        const chat = document.getElementById('chat');
        let top = 0;
        Object.defineProperties(chat, {
            clientHeight: { value: 300, writable: true },
            scrollHeight: { value: 900, writable: true },
            scrollTop: { get: () => top, set: value => { top = Math.max(0, Math.min(value, chat.scrollHeight - chat.clientHeight)); } },
        });
        chat.addEventListener('scroll', () => ui.trackChatScroll(chat));
        const scroll = () => chat.dispatchEvent(new window.Event('scroll'));
        const render = () => { ui.renderMessages(chat); ui.followChatToBottom(chat); };
        await run({ state, ui, chat, scroll, render });
    } finally {
        globalThis.document = previousDocument;
    }
}

test('cached messages still follow after resuming, using settled layout', () => withChat(async ({ state, ui, chat, scroll, render }) => {
    chat.scrollTop = 100;
    scroll();
    render();
    await Promise.resolve();
    assert.equal(chat.scrollTop, 100);
    const bubble = chat.firstChild;
    state.autoScroll = true;
    render();
    ui.followChatToBottom(chat);
    chat.scrollHeight = 1200;
    await Promise.resolve();
    assert.equal(chat.firstChild, bubble);
    assert.equal(chat.scrollTop, 900);
    scroll();
    assert.equal(state.autoScroll, true);
}));

test('content growth settles before the preceding programmatic scroll event', () => withChat(async ({ state, chat, scroll, render }) => {
    render();
    await Promise.resolve();
    assert.equal(chat.scrollTop, 600);
    // More content arrives before the browser dispatches the preceding scroll event.
    state.messages.push({ role: 'assistant', content: 'Streaming reply' });
    chat.scrollHeight = 1800;
    render();
    await Promise.resolve();
    scroll();
    assert.equal(state.autoScroll, true);
    assert.equal(chat.scrollTop, 1500);
}));

test('a fitting or barely overflowing conversation does not page history on resize', () => withChat(async ({ state, chat, scroll, render }) => {
    state.messages = Array.from({ length: 12 }, (_, index) => ({ role: 'user', content: `Turn ${index}` }));
    chat.scrollHeight = 300;
    render();
    await Promise.resolve();
    scroll();
    assert.equal(state.uiMessageWindowLimit, 5);
    assert.equal(state.autoScroll, true);
    chat.scrollHeight = 332;
    render();
    await Promise.resolve();
    scroll();
    assert.equal(chat.scrollTop, 32);
    assert.equal(state.uiMessageWindowLimit, 5);
    assert.equal(state.autoScroll, true);
    // Actual history reading still pages when away from the bottom.
    chat.scrollHeight = 1200;
    chat.scrollTop = 0;
    scroll();
    assert.ok(state.uiMessageWindowLimit > 5);
    assert.equal(state.autoScroll, false);
}));

test('older records remain explicitly accessible when recent turns fit the viewport', () => withChat(async ({ state, chat, scroll, render }) => {
    state.messages = Array.from({ length: 12 }, (_, index) => ({ role: 'user', content: `Turn ${index}` }));
    chat.scrollHeight = 300;
    render();
    await Promise.resolve();
    scroll();
    assert.equal(state.uiMessageWindowLimit, 5);
    chat.querySelector('.xb-assistant-history-gate').click();
    assert.ok(state.uiMessageWindowLimit > 5);
    assert.equal(state.autoScroll, false);
}));

test('reading history cancels pending following and survives further replies', () => withChat(async ({ state, ui, chat, scroll, render }) => {
    render();
    await Promise.resolve();
    ui.followChatToBottom(chat);
    chat.scrollTop = 100;
    scroll();
    await Promise.resolve();
    assert.equal(state.autoScroll, false);
    assert.equal(chat.scrollTop, 100);
    state.messages.push({ role: 'assistant', content: 'More reply text' });
    chat.scrollHeight = 1200;
    render();
    await Promise.resolve();
    assert.equal(chat.scrollTop, 100);
}));
