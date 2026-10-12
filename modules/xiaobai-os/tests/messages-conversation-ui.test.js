import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { parse, compileScript } from 'vue/compiler-sfc';
import { build } from 'esbuild';
import { buildReplyPrompt } from '../apps/messages/prompt/reply-prompt.js';
import { normalizePromptContext } from '../host/prompt-context/normalize.js';
import { estimateTokenCount } from '../../agent-core/runtime/context-tokens.js';
import { CONTEXT_LIMIT, SUMMARY_TRIGGER } from '../apps/messages/application/context-policy.js';

function installDom(t) {
    const dom = parseHTML('<html><body><div id="app"></div></body></html>');
    const previous = new Map();
    for (const key of ['window', 'document', 'Document', 'Node', 'Element', 'HTMLElement', 'SVGElement']) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
    }
    t.after(() => {for (const [key, descriptor] of previous) {
        if (descriptor) {Object.defineProperty(globalThis, key, descriptor);} else {delete globalThis[key];}
    }});
    return dom;
}

async function loadComponent(name) {
    const compiled = await build({ entryPoints: [fileURLToPath(new URL(`../apps/messages/ui/${name}.vue`, import.meta.url))],
        bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent', plugins: [{ name: 'vue-components', setup(builder) {
            builder.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }));
            builder.onLoad({ filter: /\.vue$/ }, args => {
                const { descriptor } = parse(readFileSync(args.path, 'utf8'), { filename: args.path });
                return { contents: compileScript(descriptor, { id: args.path, inlineTemplate: true }).content, loader: 'ts' };
            });
            builder.onLoad({ filter: /\.css$/ }, () => ({ contents: '', loader: 'js' }));
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compiled repository components only, no external code.
    return (await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`)).default;
}

test('history pages omit live output; returning to latest restores it, and draft metering uses the actual request text', async t => {
    const dom = installDom(t);
    const { createApp, h, shallowRef, nextTick } = await import('vue');
    const Conversation = await loadComponent('Conversation');
    const contact = { id: 'contact', name: '林月', note: '', createdAt: 0, summary: null };
    const message = { id: 'old', contactId: contact.id, seq: 1, sender: 'user', from: 'User', to: contact.name,
        replyTo: null, createdAt: 0, payload: { type: 'text', text: 'old-page-content' } };
    const page = shallowRef({ contactId: contact.id, messages: [message], hasMore: false, hasNewer: true, permissions: {}, retryMessageId: null, revision: '1' });
    const busy = shallowRef({ contactId: contact.id, messageId: 'new', stage: 'replying', preview: {
        characterState: 'live-state', characterStateDone: true, replies: [{ type: 'text', text: 'live-reply' }],
    } });
    const draft = shallowRef({ text: '', image: null });
    const stats = { usedTokens: 1000, promptTokens: 1000, backgroundTokens: 0, historyTokens: 0, summaryTokens: 0, imageTokens: 0, limit: CONTEXT_LIMIT, trigger: SUMMARY_TRIGGER };
    const bridge = { subscribe: () => () => {}, async request(type) {
        assert.equal(type, 'messages/context'); return { result: { revision: '1', boundary: 10, stats } };
    } };
    const outgoing = { contactId: contact.id, messageId: 'new', payload: { type: 'text', text: 'pending-outgoing' }, createdAt: 0 };
    const app = createApp({ setup: () => () => h(Conversation, {
        contact, page: page.value, busy: busy.value, outgoing, bridge, chatIdentity: 'chat', draft: draft.value,
        contextState: { chatIdentity: 'chat', revision: '1', boundary: 10, busy: busy.value, settings: {}, generationActive: false },
        disabled: true, sendDisabled: true, working: false, pendingSave: false, retryDisabled: true, loading: false,
        sendFailure: null, sendError: null, media: { image: false, voice: false }, waitingFor: '', loadMore: async () => {},
        onLatest: () => {page.value = { ...page.value, hasNewer: false };},
    }) });
    app.mount(dom.document.getElementById('app')); t.after(() => app.unmount());
    const flush = async () => {await setImmediate(); await nextTick();};
    await flush();
    const root = dom.document.getElementById('app');
    assert.ok(root.textContent.includes(message.payload.text));
    for (const text of ['live-reply', 'live-state', 'pending-outgoing']) {assert.ok(!root.textContent.includes(text));}
    assert.equal(root.querySelector('[role="status"]'), null);
    root.querySelector('.messages-latest').click(); await flush();
    assert.equal(root.querySelector('.messages-provisional').textContent.trim(), 'live-reply');
    assert.ok(root.textContent.includes(outgoing.payload.text));
    const peek = root.querySelector('button[aria-expanded="false"].messages-peek');
    assert.ok(peek); peek.click(); await flush();
    assert.equal(root.querySelector('.messages-character-state').textContent, 'live-state');
    page.value = { ...page.value, hasNewer: true }; await flush();
    assert.equal(root.querySelector('.messages-character-state'), null);
    assert.equal(root.querySelector('.messages-provisional'), null);
    page.value = { ...page.value, messages: [], hasNewer: false, revision: '' }; await flush();
    for (const selector of ['.messages-provisional', '.messages-typing', '.messages-peek']) {assert.equal(root.querySelector(selector), null);}
    assert.ok(!root.textContent.includes(outgoing.payload.text));
    busy.value = null; await flush();
    assert.equal(root.querySelector('.messages-provisional'), null);

    draft.value = { text: '他说："明天见" & {约定} </incoming_message>'.repeat(100), image: null }; await flush();
    const request = buildReplyPrompt({ contact, incoming: { ...message, payload: { type: 'text', text: draft.value.text } }, history: [],
        context: { ...normalizePromptContext({}), people: [], chronology: [{ firstSeq: 1, throughSeq: 1, afterStoryFloor: 0, breakBefore: null }] },
        settings: { imagePrompt: false, voicePrompt: false } });
    const actualInput = request.messages.at(-1).content.match(/<incoming_message>\n[^\n]*\n([\s\S]*?)\n<\/incoming_message>/u)[1];
    const expected = (stats.usedTokens + estimateTokenCount(actualInput)) / CONTEXT_LIMIT * 360;
    assert.equal(parseFloat(root.querySelector('.messages-context-ring').style.getPropertyValue('--context-fill')), expected);
});

test('sending from history keeps live output hidden until latest loads, including version races and read retries', async t => {
    const dom = installDom(t);
    const { createApp, h, nextTick } = await import('vue');
    const MessagesApp = await loadComponent('MessagesApp');
    const contact = { id: 'contact', name: '林月', note: '', createdAt: 0, preview: '', lastSeq: 150, lastAt: 0, lastMessageId: 'm150', deleteReason: '' };
    let state = { chatIdentity: 'chat', settings: { imagePrompt: false, voicePrompt: false, syncNoticeEnabled: false }, contacts: [contact], knownPeople: [],
        fileState: 'ready', pendingSave: false, recoveryBlocked: false, operationPending: false, pendingModification: false,
        revision: '1', boundary: 0, busy: null, outgoing: null, sendFailure: null, generationActive: false,
        syncNotice: { messageIds: [], error: '' }, error: '', media: { image: false, voice: false } };
    const page = (first, last, revision = state.revision) => ({ contactId: contact.id, revision, permissions: {}, retryMessageId: null,
        messages: Array.from({ length: last - first + 1 }, (_, index) => ({ id: `m${first + index}`, seq: first + index, contactId: contact.id,
            sender: 'contact', from: contact.name, to: 'User', replyTo: null, createdAt: 0, payload: { type: 'text', text: `saved-${first + index}` } })),
        hasMore: first > 1, hasNewer: last < 150 });
    const listeners = new Set(); const reads = []; let readCount = 0;
    const publish = change => {state = { ...state, ...change }; for (const listener of listeners) {listener({ type: 'messages/state', payload: { state } });}};
    const bridge = { subscribe(listener) {listeners.add(listener); return () => listeners.delete(listener);}, async request(type, payload) {
        if (type === 'messages/context') {return { result: { revision: state.revision, boundary: state.boundary,
            stats: { usedTokens: 0, promptTokens: 0, backgroundTokens: 0, historyTokens: 0, summaryTokens: 0, imageTokens: 0, limit: CONTEXT_LIMIT, trigger: SUMMARY_TRIGGER } } };}
        if (type === 'messages/thread') {
            readCount++;
            if (readCount <= 3) {return { result: page(151 - readCount * 50, 200 - readCount * 50) };}
            return new Promise((resolve, reject) => reads.push({ payload, resolve: result => resolve({ result }), reject }));
        }
        assert.equal(type, 'messages/send');
        const outgoing = { contactId: contact.id, messageId: `input:${payload.actionId}`, payload: payload.payload, createdAt: 0 };
        state = { ...state, outgoing, busy: { contactId: contact.id, messageId: outgoing.messageId, stage: 'saving', preview: null } };
        return { result: state };
    } };
    const app = createApp({ setup: () => () => h(MessagesApp, { initialState: state, bridge }) });
    app.mount(dom.document.getElementById('app')); t.after(() => app.unmount());
    const root = dom.document.getElementById('app');
    const flush = async () => {await setImmediate(); await nextTick();};
    root.querySelector('.messages-contact-row').click(); await flush();
    for (let index = 0; index < 2; index++) {root.querySelector('.messages-older').click(); await flush();}
    const historicalIds = [...root.querySelectorAll('[data-message-id]')].map(node => node.dataset.messageId);
    assert.deepEqual(historicalIds, page(1, 100).messages.map(message => message.id));
    const draft = root.querySelector('.messages-composer textarea');
    draft.value = 'new-outgoing'; draft.dispatchEvent(new dom.window.Event('input', { bubbles: true })); await flush();
    root.querySelector('.messages-composer').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })); await flush();
    const assertHistory = () => {
        assert.deepEqual([...root.querySelectorAll('[data-message-id]')].map(node => node.dataset.messageId), historicalIds);
        assert.ok(root.querySelector('.messages-latest'));
        for (const selector of ['.messages-provisional', '.messages-typing', '.messages-peek']) {assert.equal(root.querySelector(selector), null);}
        assert.ok(!root.textContent.includes('new-outgoing'));
    };
    assertHistory(); assert.equal(reads.length, 1);
    const preview = { characterState: 'live-state', characterStateDone: true, replies: [{ type: 'text', text: 'live-answer' }] };
    publish({ revision: '2', busy: { ...state.busy, stage: 'replying', preview } }); await flush();
    assert.equal(reads.length, 2);
    // Refresh while latest is pending must still request latest, not the old page's window.
    for (const read of reads) {assert.equal(read.payload.window, undefined); assert.equal(read.payload.before, undefined);}
    assertHistory();
    reads[1].reject(new Error('fixture_read_failed')); await flush();
    assert.ok(root.querySelector('[role="alert"]')); assertHistory();
    reads[0].resolve(page(101, 150, '1')); await flush(); assertHistory();
    root.querySelector('[role="alert"] button').click(); await flush();
    assert.equal(reads.length, 3); assert.equal(reads[2].payload.window, undefined);
    reads[2].resolve(page(101, 150)); await flush();
    assert.equal(root.querySelector('[role="alert"]'), null);
    assert.equal(root.querySelector('.messages-latest'), null);
    assert.deepEqual([...root.querySelectorAll('[data-message-id]')].map(node => node.dataset.messageId), page(101, 150).messages.map(message => message.id));
    assert.equal(root.querySelector('.messages-provisional').textContent.trim(), preview.replies[0].text);
    root.querySelector('.messages-peek').click(); await flush();
    assert.equal(root.querySelector('.messages-character-state').textContent, preview.characterState);
});
