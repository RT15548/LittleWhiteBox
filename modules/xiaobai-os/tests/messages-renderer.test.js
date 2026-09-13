import assert from 'node:assert/strict';
import test from 'node:test';
import { DOMParser, parseHTML } from 'linkedom';
import { renderPrivateMessages } from '../apps/messages/host/message-renderer.js';
import { PRIVATE_MESSAGE_MARKER } from '../apps/messages/application/projection.js';
import { projectionText } from '../domains/messages/transcript.js';

function entry(contact, sender, text, payload) {
    return { id: text, contactId: contact, sender, from: sender === 'user' ? '玩家' : contact,
        to: sender === 'user' ? contact : '玩家', payload: payload ?? { type: 'text', text }, createdAt: 0 };
}

function floor(entries, segmentId = 'segment', recovered = false) {
    const messages = entries.map((message, i) => ({ ...message, seq: message.seq ?? i + 1 }));
    return { mes: projectionText({ messages }, { messageIds: messages.map(m => m.id), recovered }),
        extra: { [PRIVATE_MESSAGE_MARKER]: { version: 1, segmentId, throughSeq: messages.length, digest: 'a'.repeat(64) } } };
}

function mount(t) {
    const previous = globalThis.DOMParser;
    globalThis.DOMParser = DOMParser;
    t.after(() => {
        if (previous === undefined) {delete globalThis.DOMParser;}
        else {globalThis.DOMParser = previous;}
    });
    const { document } = parseHTML('<html><body><div class="mes" mesid="0"><div class="mes_text">原始正文</div></div></body></html>');
    return { document, target: document.querySelector('.mes_text'), render: message => renderPrivateMessages([message], document) };
}

function toggle(h, open) {
    const details = h.target.querySelector('details');
    details.toggleAttribute('open', open);
    details.dispatchEvent(new h.document.defaultView.Event('toggle'));
}

test('private floor groups consecutive contacts without reordering or rewriting the saved transcript', t => {
    const h = mount(t);
    const message = floor([entry('甲', 'user', '第一句'), entry('甲', 'character', '第二句'),
        entry('乙', 'character', '第三句'), entry('甲', 'user', '第四句')], 'segment', true);
    const original = structuredClone(message);
    h.render(message);
    assert.deepEqual(message, original);
    assert.equal(h.target.querySelector('details').hasAttribute('open'), false);
    assert.equal(h.target.querySelector('article'), null);
    toggle(h, true);
    assert.deepEqual([...h.target.querySelectorAll('h4')].map(n => n.textContent), ['与甲', '与乙', '与甲']);
    assert.deepEqual([...h.target.querySelectorAll('article')].map(n => n.textContent), ['第一句', '第二句', '第三句', '第四句']);
    assert.equal(h.target.querySelector('article').getAttribute('aria-label'), '玩家发给甲');
    assert.match(h.target.querySelector('p').textContent, /此前已发生/u);
    assert.equal(h.target.querySelector('details').hasAttribute('open'), true);
    assert.match(h.target.querySelector('summary').textContent, /4 条消息/u);
    assert.equal(h.target.querySelector('small'), null);
});

test('all floors start folded; reopening shows latest, and native text replacement preserves an open record', t => {
    const h = mount(t);
    const entries = Array.from({ length: 7 }, (_, i) => entry('甲', 'user', `消息${i}`));
    const message = floor(entries);
    h.render(message);
    const details = h.target.querySelector('details');
    assert.equal(details.hasAttribute('open'), false);
    toggle(h, true);
    h.render(message);
    assert.equal(h.target.querySelector('details'), details);
    h.target.textContent = '宿主重绘';
    h.render(floor([...entries, entry('甲', 'character', '新增回复')]));
    assert.equal(h.target.querySelector('details').hasAttribute('open'), true);
    toggle(h, false);
    assert.equal(h.target.querySelector('article'), null);
    h.render(floor([entry('甲', 'user', '变短了')]));
    assert.equal(h.target.querySelector('details').hasAttribute('open'), false);
    h.render(floor([entry('乙', 'user', '新的片段')], 'new-segment'));
    assert.equal(h.target.querySelector('details').hasAttribute('open'), false);
    assert.equal(h.target.querySelector('h4'), null);
    assert.match(h.target.querySelector('summary').textContent, /与乙的通讯/u);
    h.render(floor([entry('乙', 'user', '长'.repeat(1601))], 'long-text'));
    assert.equal(h.target.querySelector('details').hasAttribute('open'), false);
    assert.ok(h.target.querySelector('.xb-private-preview').textContent.length < 100);
});

test('media remains inert text except validated local photos; host editing and unrelated floors are left alone', t => {
    const h = mount(t);
    const safe = `/user/images/xb-os-messages/${'a'.repeat(64)}.png`;
    const message = floor([entry('甲', 'user', 'photo', { type: 'image', description: '<script>not markup</script>', attachment: { path: safe, name: '照片' } }),
        entry('甲', 'character', 'voice', { type: 'voice', transcript: '听得到吗？' })]);
    h.render(message);
    assert.equal(h.target.querySelector('img'), null);
    toggle(h, true);
    assert.equal(h.target.querySelector('img').getAttribute('src'), safe);
    assert.equal(h.target.querySelector('script'), null);
    assert.match(h.target.textContent, /<script>not markup<\/script>/u);
    assert.match(h.target.textContent, /［语音］听得到吗/u);
    h.render({ ...message, mes: message.mes.replace(safe, 'https://example.org/tracker.png') });
    assert.equal(h.target.querySelector('img'), null);
    h.target.textContent = '原生编辑内容';
    const editor = h.document.createElement('textarea'); editor.className = 'edit_textarea'; h.target.parentNode.append(editor);
    h.render(message);
    assert.equal(h.target.textContent, '原生编辑内容');
    editor.remove();
    h.render({ mes: message.mes });
    h.render({ ...message, mes: '<其他内容>手动改写</其他内容>' });
    assert.equal(h.target.textContent, '原生编辑内容');
});

// Protect the rendering budget and source immutability, not exact page sizes.
test('10,000 messages stay lazy while folded and bounded when paging in either direction', t => {
    const h = mount(t);
    const entries = Array.from({ length: 10000 }, (_, i) => entry(i % 2 ? '乙' : '甲', 'user', `消息${i}`));
    const message = floor(entries);
    const original = structuredClone(message);
    h.render(message);
    assert.equal(h.target.querySelectorAll('article').length, 0);
    assert.match(h.target.querySelector('summary').textContent, /10000 条消息/u);
    toggle(h, true);
    const text = () => [...h.target.querySelectorAll('article')].map(node => node.textContent);
    const page = label => [...h.target.querySelectorAll('button')].find(node => node.textContent === label).click();
    assert.equal(text().at(-1), '消息9999');
    for (let i = 0; i < 12; i++) {
        const first = Number(text()[0].slice(2));
        page('查看更早消息');
        assert.ok(Number(text()[0].slice(2)) < first);
        assert.ok(text().length <= 100);
        assert.ok(text().includes(`消息${first}`));
    }
    const last = Number(text().at(-1).slice(2));
    page('查看较新消息');
    assert.ok(Number(text().at(-1).slice(2)) > last);
    assert.ok(text().length <= 100);
    assert.ok(text().includes(`消息${last}`));
    h.target.querySelector('.xb-private-latest').click();
    assert.equal(text().at(-1), '消息9999');
    assert.ok(text().length <= 100);
    page('查看更早消息');
    toggle(h, false);
    assert.equal(text().length, 0);
    toggle(h, true);
    assert.equal(text().at(-1), '消息9999');
    assert.deepEqual(message, original);
});

test('paging back to the latest bottom resumes following without another scroll event', t => {
    const h = mount(t);
    const entries = Array.from({ length: 81 }, (_, i) => entry('甲', 'user', `消息${i}`));
    h.render(floor(entries));
    toggle(h, true);
    const body = h.target.querySelector('.xb-private-body');
    // Linkedom has no layout. Hold viewport/content height fixed to reproduce a page
    // replacement that ends at the bottom without changing scrollTop or firing scroll.
    Object.defineProperties(body, {
        clientHeight: { value: 600 },
        scrollHeight: { value: 4800 },
    });
    const scrollTo = top => {
        body.scrollTop = top;
        body.dispatchEvent(new h.document.defaultView.Event('scroll'));
    };
    const button = label => [...h.target.querySelectorAll('button')].find(node => node.textContent === label);
    while (button('查看更早消息')) {
        scrollTo(0);
        button('查看更早消息').click();
    }
    scrollTo(body.scrollHeight - body.clientHeight);
    assert.equal(button('回到最新').hidden, false);
    button('查看较新消息').click();
    assert.equal(button('查看较新消息'), undefined);
    assert.equal(button('回到最新').hidden, true);

    entries.push(entry('甲', 'character', '新消息'));
    h.render(floor(entries));
    assert.equal([...body.querySelectorAll('article')].at(-1).textContent, '新消息');

    scrollTo(1000);
    entries.push(entry('甲', 'character', '阅读历史时到达的消息'));
    h.render(floor(entries));
    assert.equal([...body.querySelectorAll('article')].at(-1).textContent, '新消息');
    assert.equal(button('回到最新').hidden, false);
});

test('deleting earlier records relocates the reading window by stable message identity', t => {
    const h = mount(t);
    const entries = Array.from({ length: 200 }, (_, i) => ({ ...entry('甲', 'user', `消息${i}`), seq: i + 1 }));
    h.render(floor(entries)); toggle(h, true);
    const body = h.target.querySelector('.xb-private-body');
    Object.defineProperties(body, { clientHeight: { value: 600 }, scrollHeight: { value: 2400 } });
    body.scrollTop = 400; body.dispatchEvent(new h.document.defaultView.Event('scroll'));
    const first = body.querySelector('article').textContent;
    h.render(floor(entries.slice(10)));
    assert.equal(body.querySelector('article').textContent, first);
    assert.equal(body.querySelector('article').dataset.recordKey, 'message:161');
    assert.ok(body.querySelectorAll('article').length <= 80);
});
