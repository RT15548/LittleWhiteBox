import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { createPlannerPreview } from '../ena-planner-preview.js';

const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const markup = '<div class="mes" mesid="0" is_user="true"><div class="mes_block"><div class="mes_text">input</div></div></div>';

function fixture(t) {
    const { document } = parseHTML(`<html><head></head><body><div id="chat">${markup}</div></body></html>`);
    const source = { is_user: true, mes: 'input', extra: { untouched: true } };
    const context = { chat: [source] };
    const state = { chatId: 'chat-a' };
    const run = { chatId: 'chat-a', index: 0, source, sourceText: 'input', phase: 'preview', previewText: 'plan\nline two' };
    const calls = [];
    const actions = Object.fromEntries(['stop', 'replan', 'send', 'discard'].map(name => [name, async () => { calls.push(name); }]));
    const preview = createPlannerPreview({ getContext: () => context, identity: () => state.chatId, document });
    t.after(() => preview.cleanup());
    const root = () => document.querySelector('.ena-planner-preview');
    const button = name => root().querySelector(`[data-action="${name}"]`);
    actions.edit = value => { run.previewText = value; preview.render(run, actions); };
    const render = () => preview.render(run, actions);
    return { document, source, context, state, run, calls, actions, preview, root, button, render };
}

function replaceChat(f) {
    const replacement = f.document.createElement('div');
    replacement.id = 'chat';
    const { document } = parseHTML(`<html><body>${markup}</body></html>`);
    replacement.append(document.body.firstElementChild.cloneNode(true));
    f.document.getElementById('chat').replaceWith(replacement);
}

test('safe streaming text is a sibling of USER body and never changes message or extra', t => {
    const f = fixture(t);
    const original = structuredClone(f.source);
    f.run.phase = 'planning';
    f.run.previewText = '<img src=x onerror=alert(1)>\n<script>bad()</script>';
    f.run.error = '<svg onload=bad()>\nerror';
    f.render();
    const body = f.document.querySelector('.mes_text');
    assert.equal(body.nextElementSibling, f.root());
    assert.equal(body.parentNode, f.root().parentNode);
    assert.equal(body.textContent, 'input');
    assert.equal(f.root().querySelector('.ena-planner-preview__text').value, f.run.previewText);
    assert.equal(f.root().querySelector('.ena-planner-preview__error').textContent, f.run.error);
    assert.equal(f.root().querySelector('img, script, svg'), null);
    f.run.previewText += '\nchunk two';
    f.render();
    assert.equal(f.root().querySelector('.ena-planner-preview__text').value, f.run.previewText);
    assert.deepEqual(f.source, original);
});

test('one current run survives body and entire chat redraw without observer loops', async t => {
    const f = fixture(t);
    f.render();
    const node = f.root();
    for (let i = 0; i < 5; i++) f.render();
    assert.equal(f.root(), node);
    const body = f.document.querySelector('.mes_text');
    body.replaceWith(body.cloneNode(true));
    await flush();
    assert.equal(f.document.querySelector('.mes_text').nextElementSibling, node);
    replaceChat(f);
    await flush();
    assert.equal(f.root(), node);
    assert.equal(f.document.querySelectorAll('.ena-planner-preview').length, 1);
    assert.equal(f.document.querySelectorAll('style[data-ena-planner-preview]').length, 1);
    let mutations = 0;
    const observer = new f.document.defaultView.MutationObserver(() => { mutations++; });
    observer.observe(f.document.documentElement, { childList: true, subtree: true });
    await flush();
    observer.disconnect();
    assert.equal(mutations, 0);
    f.preview.render({ ...f.run, previewText: 'replacement run' }, f.actions);
    assert.equal(f.document.querySelectorAll('.ena-planner-preview').length, 1);
    assert.equal(node.isConnected, false);
});

test('editing detaches preview and finishing editing remounts it', async t => {
    const f = fixture(t);
    f.render();
    const editor = f.document.createElement('textarea');
    editor.className = 'edit_textarea';
    f.document.querySelector('.mes').append(editor);
    await flush();
    assert.equal(f.root(), null);
    editor.remove();
    await flush();
    assert.ok(f.root());
});

for (const [phase, expected] of [
    ['preparing', ['discard']], ['planning', ['stop', 'discard']], ['preview', ['replan', 'send', 'discard']],
    ['stopped', ['replan', 'send', 'discard']], ['error', ['replan', 'send', 'discard']], ['sending', []],
]) test(`${phase} exposes only valid actions`, async t => {
    const f = fixture(t);
    f.run.phase = phase;
    f.render();
    for (const name of ['stop', 'replan', 'send', 'discard']) {
        assert.equal(f.button(name).disabled, !expected.includes(name));
        if (!expected.includes(name)) f.button(name).click();
    }
    await flush();
    assert.deepEqual(f.calls, []);
    for (const name of expected) {
        f.button(name).click();
        await flush();
    }
    assert.deepEqual(f.calls, expected);
});

for (const phase of ['preview', 'stopped', 'error']) test(`${phase} cannot send whitespace-only text`, t => {
    const f = fixture(t);
    f.run.phase = phase;
    f.run.previewText = ' \n\t';
    f.render();
    assert.equal(f.button('send').disabled, true);
    assert.equal(f.button('replan').disabled, false);
});

test('async action disables repeat clicks and rejection is safely rendered', async t => {
    const f = fixture(t);
    let reject;
    f.actions.send = () => { f.calls.push('send'); return new Promise((_, fail) => { reject = fail; }); };
    f.render();
    f.button('send').click();
    f.button('send').click();
    f.button('replan').click();
    assert.deepEqual(f.calls, ['send']);
    assert.equal(f.button('send').disabled, true);
    reject(new Error('<img src=x>failed'));
    await flush();
    assert.equal(f.button('send').disabled, false);
    assert.equal(f.root().querySelector('.ena-planner-preview__error').textContent, '<img src=x>failed');
    assert.equal(f.root().querySelector('img'), null);
});

test('asynchronous replanning remains stoppable while its stream is pending', async t => {
    const f = fixture(t);
    let finish;
    f.actions.replan = () => {
        f.calls.push('replan');
        f.run.phase = 'planning';
        f.render();
        return new Promise(resolve => { finish = resolve; });
    };
    f.actions.stop = async () => { f.calls.push('stop'); f.run.phase = 'stopped'; f.render(); };
    f.render();
    f.button('replan').click();
    assert.equal(f.button('stop').disabled, false);
    f.button('stop').click();
    await flush();
    assert.deepEqual(f.calls, ['replan', 'stop']);
    finish();
    await flush();
    assert.equal(f.button('send').disabled, false);
});

test('stale detached buttons cannot act on a new run', async t => {
    const f = fixture(t);
    f.render();
    const oldButton = f.button('send');
    f.preview.render({ ...f.run }, f.actions);
    oldButton.click();
    await flush();
    assert.deepEqual(f.calls, []);
});

test('old pending action cannot lock or change a replacement run', async t => {
    const f = fixture(t);
    let reject;
    f.actions.send = () => new Promise((_, fail) => { reject = fail; });
    f.render();
    f.button('send').click();
    f.preview.render({ ...f.run, previewText: 'new run' }, { send() {} });
    reject(new Error('old failure'));
    await flush();
    assert.equal(f.button('send').disabled, false);
    assert.equal(f.root().querySelector('.ena-planner-preview__error').textContent, '');
});

for (const change of ['chat', 'message', 'assistant', 'system', 'dom-assistant', 'index', 'duplicate']) {
    test(`${change} identity mismatch refuses mount and stale clicks`, async t => {
        const f = fixture(t);
        f.render();
        const oldButton = f.button('send');
        if (change === 'chat') f.state.chatId = 'chat-b';
        if (change === 'message') f.context.chat[0] = { ...f.source };
        if (change === 'assistant') f.source.is_user = false;
        if (change === 'system') f.source.is_system = true;
        if (change === 'dom-assistant') f.document.querySelector('.mes').setAttribute('is_user', 'false');
        if (change === 'index') f.run.index = -1;
        if (change === 'duplicate') f.document.getElementById('chat').append(f.document.querySelector('.mes').cloneNode(false));
        oldButton.click();
        await flush();
        assert.deepEqual(f.calls, []);
        f.render();
        assert.equal(f.root(), null);
    });
}

test('switching chats then host redraw never moves old preview onto new USER', async t => {
    const f = fixture(t);
    f.render();
    f.state.chatId = 'chat-b';
    replaceChat(f);
    await flush();
    assert.equal(f.root(), null);
    f.state.chatId = 'chat-a';
    replaceChat(f);
    await flush();
    assert.ok(f.root());
});

test('clear cancels queued refresh and removes styles; cleanup prevents future rendering', async t => {
    const f = fixture(t);
    f.render();
    replaceChat(f);
    f.preview.clear();
    await flush();
    assert.equal(f.root(), null);
    assert.equal(f.document.querySelector('style[data-ena-planner-preview]'), null);
    replaceChat(f);
    await flush();
    assert.equal(f.root(), null);
    f.render();
    assert.ok(f.root());
    f.run.phase = 'completed';
    f.render();
    assert.equal(f.root(), null);
    assert.equal(f.document.querySelector('style[data-ena-planner-preview]'), null);
    f.run.phase = 'preview';
    f.render();
    f.preview.cleanup();
    f.render();
    replaceChat(f);
    await flush();
    assert.equal(f.root(), null);
    assert.equal(f.document.querySelector('style[data-ena-planner-preview]'), null);
});
test('editor input changes only the transient draft and survives redraw', async t => {
    const f = fixture(t);
    f.render();
    const editor = f.root().querySelector('textarea');
    editor.value = '<plot>user edit</plot>';
    editor.dispatchEvent(new f.document.defaultView.Event('input', {bubbles:true}));
    replaceChat(f);
    await flush();
    assert.equal(f.run.previewText, '<plot>user edit</plot>');
    assert.equal(f.root().querySelector('textarea').value, f.run.previewText);
    assert.deepEqual(f.source, {is_user:true,mes:'input',extra:{untouched:true}});
    editor.value = '';
    editor.dispatchEvent(new f.document.defaultView.Event('input', {bubbles:true}));
    assert.equal(f.button('send').disabled, true);
    editor.value = 'manual plan';
    editor.dispatchEvent(new f.document.defaultView.Event('input', {bubbles:true}));
    assert.equal(f.button('send').disabled, false);
});
