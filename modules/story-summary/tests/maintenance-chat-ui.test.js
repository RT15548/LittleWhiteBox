import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { parseHTML } from 'linkedom';
import { createMemoryChatDialog } from '../maintenance/chat-ui.js';
import { MEMORY_CHAT_MESSAGES as routes } from '../maintenance/chat-contract.js';

// Protect UI actions, identity isolation, literal tool/error rendering and draft ownership.
// The DOM shim supplies only browser layout/dialog APIs; the real UI and markdown run unchanged.
let cleanup = () => {};
afterEach(() => cleanup());
function harness(initial = {}, viewportState = null) {
    const { document, window } = parseHTML('<html><body><button id="opener"></button></body></html>');
    Object.assign(globalThis, { document, window, ResizeObserver: class { observe() {} disconnect() {} } });
    window.matchMedia = () => ({ matches: false });
    window.innerHeight = 800;
    if (viewportState) window.visualViewport = Object.assign(new window.EventTarget(), viewportState);
    const proto = window.HTMLElement.prototype;
    proto.getBoundingClientRect = function () { return this._rect || { top: 0, bottom: 100, height: 100 }; };
    proto.showModal = function () { this.open = true; };
    proto.close = function () { this.open = false; this.dispatchEvent(new window.Event('close')); };
    const sent = [];
    const ui = createMemoryChatDialog({ send: (type, payload) => sent.push({ type, payload }) });
    cleanup = () => { ui.dispose(); delete globalThis.document; delete globalThis.window; delete globalThis.ResizeObserver; };
    const snapshot = { identity: 'owner-a', chatId: 'chat-a', turns: [], draft: '', activeId: null, busy: false,
        automatic: { status: 'idle' }, ranges: { cutoff: 415, completed: [{ from: 1, to: 140 }], pending: [{ from: 141, to: 415 }] },
        context: { used: 12300, limit: 198000, trigger: 178000, source: 'tokenizer', sections: { rules: 1000, history: 300, material: 11000 } }, ...initial };
    const dialog = document.querySelector('dialog');
    const input = dialog.querySelector('textarea');
    const action = name => dialog.querySelector(`[data-action="${name}"]`);
    const type = text => { input.value = text; input.dispatchEvent(new window.Event('input')); };
    const render = patch => { Object.assign(snapshot, patch); ui.render(structuredClone(snapshot)); };
    return { ui, snapshot, sent, dialog, input, action, type, render, window, document };
}
const turn = (overrides = {}) => ({ id: 't-1', question: '检查这次失败', answer: '', status: 'running', phase: 'reading', tools: [], saved: 0, ...overrides });

test('opening only queries; closing preserves unsent text without stopping work', () => {
    const h = harness();
    h.ui.open();
    assert.equal(h.dialog.open, true);
    assert.deepEqual(h.sent, [{ type: routes.query, payload: undefined }]);
    h.render({});
    h.type('正在写的问题');
    h.ui.close();
    assert.equal(h.dialog.open, false);
    assert.equal(h.input.value, '正在写的问题');
    assert.deepEqual(h.sent.at(-1), { type: routes.draft, payload: { identity: 'owner-a', text: '正在写的问题' } });
    assert.equal(h.sent.some(item => item.type === routes.stop || item.type === routes.send), false);
    h.ui.open();
    assert.equal(h.input.value, '正在写的问题');
});

test('late draft echoes cannot replace newer typing or a post-send draft', () => {
    const h = harness();
    h.render({ draft: '已存草稿' });
    assert.equal(h.input.value, '已存草稿');
    h.type('较新的草稿');
    h.render({ draft: '旧的回声' });
    assert.equal(h.input.value, '较新的草稿');
    h.action('send').click();
    assert.deepEqual(h.sent.at(-1), { type: routes.send, payload: { identity: 'owner-a', text: '较新的草稿' } });
    h.type('下一条');
    h.render({ draft: '', turns: [turn({ status: 'queued' })] });
    assert.equal(h.input.value, '下一条');
});

test('automatic work permits sending; queued manual work exposes takeover and manual stop', () => {
    const h = harness();
    h.render({ automatic: { status: 'running' }, busy: false });
    h.type('继续');
    assert.equal(h.action('send').disabled, false);
    h.action('send').click();
    h.render({ turns: [turn({ status: 'queued' })], busy: true, activeId: 't-1' });
    assert.equal(h.action('takeover').hidden, false);
    h.action('takeover').click();
    assert.deepEqual(h.sent.at(-1), { type: routes.takeover, payload: { identity: 'owner-a' } });
    h.action('stop').click();
    assert.deepEqual(h.sent.at(-1), { type: routes.stop, payload: { identity: 'owner-a' } });
    h.render({ automatic: { status: 'idle' } });
    assert.equal(h.action('takeover').hidden, true);
    assert.equal(h.action('stop').disabled, false);
});

test('clear is confirmed and sends only the chat clear action, preserving supplied memory state', () => {
    const h = harness();
    h.render({ turns: [turn({ saved: 2 })], busy: true });
    const original = structuredClone(h.snapshot);
    h.action('clear').click();
    assert.equal(h.dialog.querySelector('[role="alertdialog"]').hidden, false);
    assert.equal(h.sent.length, 0);
    h.action('cancel-clear').click();
    assert.equal(h.sent.length, 0);
    h.action('clear').click();
    h.action('confirm-clear').click();
    assert.deepEqual(h.sent, [{ type: routes.clear, payload: { identity: 'owner-a' } }]);
    assert.deepEqual(h.snapshot, original);
});

test('reroll is explicit, identity-bound and unavailable while manual work is active', () => {
    const h = harness();
    h.render({ turns: [turn({ status: 'completed', answer: '答复', saved: 2 })] });
    h.action('regenerate').click();
    assert.deepEqual(h.sent.at(-1), { type: routes.regenerate, payload: { identity: 'owner-a' } });
    h.render({ turns: [turn()] });
    assert.equal(h.action('regenerate').disabled, true);
});

test('chat switching closes and clears draft; late state from the old chat is ignored', () => {
    const h = harness();
    h.render({ turns: [turn({ status: 'completed' })] });
    h.ui.open();
    h.type('旧聊天输入');
    h.ui.setChat('chat-b');
    assert.equal(h.dialog.open, false);
    assert.equal(h.input.value, '');
    assert.equal(h.dialog.querySelectorAll('[data-turn-id]').length, 0);
    h.ui.render(structuredClone(h.snapshot));
    assert.equal(h.input.value, '');
    assert.equal(h.action('send').disabled, true);
    h.render({ chatId: 'chat-b', identity: 'owner-b', turns: [], draft: '新聊天草稿' });
    assert.equal(h.input.value, '新聊天草稿');
    h.action('send').click();
    assert.equal(h.sent.at(-1).payload.identity, 'owner-b');
});

test('a new identity for the same chat closes the old session and clears its local draft', () => {
    const h = harness();
    h.render({});
    h.ui.open();
    h.type('旧会话草稿');
    h.render({ identity: 'owner-a-reloaded', turns: [], draft: '' });
    assert.equal(h.dialog.open, false);
    assert.equal(h.input.value, '');
    h.type('新会话请求');
    h.action('send').click();
    assert.equal(h.sent.at(-1).payload.identity, 'owner-a-reloaded');
});

test('answers use sanitized markdown and tool details remain literal across stream updates', () => {
    const h = harness();
    const tools = [{ name: 'ReadMemory', status: 'completed', arguments: '<img src=x onerror=alert(1)>', response: { value: '<script>alert(1)</script>' } }];
    h.render({ turns: [turn({ answer: '**正常文本**<script>alert(1)</script><img src="https://bad.invalid/x" onerror="alert(1)">', tools })] });
    assert.equal(h.dialog.querySelectorAll('script,img,iframe').length, 0);
    assert.equal(h.dialog.querySelector('.memory-chat-answer strong').textContent, '正常文本');
    const details = h.dialog.querySelector('.memory-chat-process');
    details.open = true;
    const literal = h.dialog.querySelector('.memory-chat-tool-details pre');
    assert.equal(literal.textContent, tools[0].arguments);
    h.render({ turns: [turn({ answer: '继续流式回复', tools, status: 'failed', saved: 1, error: { code: 'provider_error', message: '<b>失败详情</b>' } })] });
    assert.equal(h.dialog.querySelector('.memory-chat-process'), details);
    assert.equal(details.open, true);
    assert.equal(h.dialog.querySelector('.memory-chat-turn-error b'), null);
    assert.equal(h.dialog.querySelector('.memory-chat-saved').hidden, false);
});

test('Chinese composition and mobile Enter do not submit; desktop Enter does', () => {
    const h = harness();
    h.render({});
    h.type('你好');
    const key = (extra = {}) => {
        const event = new h.window.Event('keydown', { cancelable: true });
        Object.assign(event, { key: 'Enter', keyCode: 13, ...extra });
        h.input.dispatchEvent(event);
    };
    h.input.dispatchEvent(new h.window.Event('compositionstart'));
    key();
    h.input.dispatchEvent(new h.window.Event('compositionend'));
    key({ keyCode: 229 });
    h.window.matchMedia = () => ({ matches: true });
    key();
    assert.equal(h.sent.length, 0);
    h.window.matchMedia = () => ({ matches: false });
    key();
    assert.equal(h.sent.at(-1).type, routes.send);
});

test('context ring reads supplied budget and exposes real section totals without a model request', () => {
    const h = harness();
    h.render({});
    h.action('context').click();
    assert.equal(h.dialog.querySelector('.memory-chat-context-popover').hidden, false);
    assert.deepEqual([...h.dialog.querySelectorAll('.memory-chat-context-popover dd')].map(node => node.textContent), ['1.0k', '300', '11.0k']);
    assert.equal(h.sent.length, 0);
    h.render({ context: { ...h.snapshot.context, used: 180000 } });
    assert.equal(h.action('context').classList.contains('is-warning'), true);
});

test('reroll keeps the prior answer available while the new reply is unfinished', () => {
    const h = harness();
    h.render({ turns: [turn({ previousAnswer: '**上次答复**', answer: '' })] });
    const previous = h.dialog.querySelector('.memory-chat-previous');
    assert.equal(previous.hidden, false);
    assert.equal(previous.querySelector('strong').textContent, '上次答复');
    previous.open = true;
    h.render({ turns: [turn({ previousAnswer: '**上次答复**', answer: '正在生成新答复' })] });
    assert.equal(h.dialog.querySelector('.memory-chat-previous'), previous);
    assert.equal(previous.open, true);
});

test('streaming does not move a reader away from older messages; latest is an explicit action', () => {
    const h = harness();
    h.render({ turns: [turn({ answer: '旧回复' })] });
    const viewport = h.dialog.querySelector('[role="log"]');
    Object.assign(viewport, { scrollHeight: 2000, clientHeight: 400, scrollTop: 300 });
    viewport.dispatchEvent(new h.window.Event('scroll'));
    h.render({ turns: [turn({ answer: '流式更新后的回复' })] });
    assert.equal(viewport.scrollTop, 300);
    const latest = h.dialog.querySelector('.memory-chat-latest');
    assert.equal(latest.hidden, false);
    latest.click();
    assert.equal(viewport.scrollTop, 2000);
    assert.equal(latest.hidden, true);
});

test('visible viewport changes resize the dialog budget without losing text or dispatching work', () => {
    const h = harness({}, { height: 780, offsetTop: 0 });
    h.render({});
    h.ui.open();
    h.type('软键盘输入中的草稿');
    h.window.visualViewport.height = 360;
    h.window.visualViewport.offsetTop = 18;
    h.window.visualViewport.dispatchEvent(new h.window.Event('resize'));
    assert.equal(h.dialog.style.getPropertyValue('--memory-chat-view-height'), '360px');
    assert.equal(h.dialog.style.getPropertyValue('--memory-chat-view-top'), '18px');
    assert.equal(h.input.value, '软键盘输入中的草稿');
    assert.equal(h.sent.some(item => item.type === routes.send || item.type === routes.stop), false);
});
