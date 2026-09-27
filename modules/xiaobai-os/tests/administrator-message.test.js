import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { parse, compileScript } from 'vue/compiler-sfc';
import { build } from 'esbuild';
import { administratorPage } from '../apps/administrator/application/projection.js';
import { createAdministratorData } from '../apps/administrator/domain/data.js';
import { ADMINISTRATOR_POLICY } from '../apps/administrator/domain/policy.js';
import { administratorProcess } from '../apps/administrator/application/process.js';

// Mount the production message with a plain-text renderer in place of Markdown.
// Text delivery/expansion is the contract here; real Markdown rendering is checked in the browser.
test('administrator message retains expanded text and only folds the work process at the end of a turn', async t => {
    const dom = parseHTML('<html><body><div id="app"></div></body></html>');
    const previous = new Map();
    for (const key of ['window', 'document', 'Document', 'Node', 'Element', 'HTMLElement', 'SVGElement']) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
    }
    t.after(() => { for (const [key, descriptor] of previous) {
        if (descriptor) { Object.defineProperty(globalThis, key, descriptor); } else { delete globalThis[key]; }
    } });
    const { createApp, h, shallowRef, nextTick } = await import('vue');
    const path = new URL('../apps/administrator/ui/AdministratorMessage.vue', import.meta.url);
    const compiled = await build({ entryPoints: [fileURLToPath(path)], bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
        plugins: [{ name: 'vue-components', setup(builder) {
            builder.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }));
            builder.onLoad({ filter: /MessageMarkdown\.vue$/ }, () => ({ contents:
                "import { h } from 'vue'; export default { props: ['text'], setup: props => () => h('div', { 'data-message-text': '' }, props.text) };", loader: 'js' }));
            builder.onLoad({ filter: /\.vue$/ }, args => {
                const { descriptor } = parse(readFileSync(args.path, 'utf8'), { filename: args.path });
                return { contents: compileScript(descriptor, { id: args.path, inlineTemplate: true }).content, loader: 'ts' };
            });
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compiled repository components, not user input.
    const { default: Message } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
    const bodies = new Map();
    let pause = false, fail = false;
    const delayed = [];
    const rowFor = (revision, text, id = 'reply') => {
        bodies.set(`${id}:${revision}`, text);
        return administratorPage({ ...createAdministratorData(), revision, turns: [{ id, createdAt: 1, user: { text: 'request' },
            assistant: text, toolMessages: [], operations: [], status: 'finished', error: '' }] }).rows.find(row => row.role === 'assistant');
    };
    const original = 'paragraph '.repeat(1250);
    const latest = original.slice(0, -100) + 'new tail '.repeat(10);
    const row = shallowRef(rowFor(1, original)), chat = shallowRef('chat-a'), live = shallowRef(null), unsavedProcess = shallowRef(null), mountKey = shallowRef(0);
    let processTurn = null;
    let pauseProcess = false, failProcess = false, processRequests = 0;
    const bridge = { async request(type, payload) {
        if (type === 'administrator/process') {
            processRequests++;
            const result = administratorProcess(processTurn);
            if (pauseProcess) { pauseProcess = false; await new Promise(resolve => delayed.push(resolve)); }
            if (failProcess) { throw new Error('transport unavailable'); }
            return { result };
        }
        assert.equal(type, 'administrator/text');
        const body = bodies.get(`${payload.turnId}:${payload.revision}`);
        const result = { text: body.slice(payload.offset, payload.offset + ADMINISTRATOR_POLICY.textBlock), totalChars: body.length, offset: payload.offset };
        if (pause) { pause = false; await new Promise(resolve => delayed.push(resolve)); }
        if (fail) { throw new Error('transport unavailable'); }
        return { result };
    } };
    const app = createApp({ setup: () => () => h(Message, { key: mountKey.value, row: row.value, live: live.value, unsavedProcess: unsavedProcess.value, bridge, chatIdentity: chat.value, disabled: false }) });
    app.mount(dom.document.getElementById('app'));
    t.after(() => app.unmount());
    const flush = async () => { await setImmediate(); await nextTick(); };
    const content = () => dom.document.querySelector('[data-message-text]')?.textContent.trim();
    const more = () => dom.document.querySelector('.admin-pager button');
    await flush();
    while (more()) {
        const before = content();
        more().click(); await flush();
        assert.notEqual(content(), before);
    }
    assert.equal(content(), original.trim());

    pause = true; row.value = rowFor(2, original); await flush();
    assert.equal(delayed.length, 1);
    assert.equal(content(), original.trim());
    row.value = rowFor(3, latest); await flush();
    assert.equal(content(), latest.trim()); assert.equal(more(), null);
    delayed.shift()(); await flush();
    assert.equal(content(), latest.trim());

    fail = true; row.value = rowFor(4, latest); await flush();
    assert.ok(more()); assert.equal(more().disabled, false);
    fail = false; more().click(); await flush();
    assert.equal(content(), latest.trim()); assert.equal(more(), null);

    pause = true; row.value = rowFor(5, latest); await flush();
    const other = 'other message '.repeat(900);
    row.value = rowFor(1, other, 'another'); chat.value = 'chat-b'; await flush();
    assert.equal(content(), row.value.text.trim()); assert.ok(more());
    delayed.shift()(); await flush();
    assert.equal(content(), row.value.text.trim());

    processTurn = { id: 'process', createdAt: 1, user: { text: 'request' }, assistant: null, toolMessages: [], operations: [], status: 'interrupted', error: '' };
    let revision = 0;
    function update(running, text = '') {
        row.value = administratorPage({ ...createAdministratorData(), revision: ++revision, turns: [processTurn] }).rows.find(row => row.role === 'assistant');
        live.value = running ? { turnId: processTurn.id, text, totalChars: text.length, preview: [], phase: 'replying', process: administratorProcess(processTurn, true) } : null;
    }
    function addRound(text) {
        processTurn.toolMessages.push({ role: 'assistant', content: text, toolCalls: [{ id: 'same-id', name: 'Read', arguments: '{"private":"arguments"}' }] },
            { role: 'tool', toolCallId: 'same-id', toolName: 'Read', content: JSON.stringify({ status: 'read', data: 'private-result' }) });
    }
    const narration = () => [...dom.document.querySelectorAll('.admin-process-narration')].map(element => element.textContent.trim());
    const fold = () => dom.document.querySelector('.admin-process-toggle');
    addRound('first preface'); update(true, 'next streamed preface'); await flush();
    assert.deepEqual(narration(), ['first preface']); assert.equal(fold(), null);
    for (let index = 2; index <= 7; index++) {
        addRound(`preface ${index}`); update(true, `next stream ${index}`); await flush();
        assert.equal(narration().length, index); assert.equal(narration()[0], 'first preface'); assert.equal(fold(), null);
    }
    // Reopening mid-run receives all rounds immediately, even if process requests
    // would be slow. Further stream snapshots must not start background refetches.
    const requestsBeforeReopen = processRequests;
    mountKey.value++; await flush();
    for (let index = 0; index < 6; index++) {
        live.value = { ...live.value, text: `stream ${index}`, process: administratorProcess(processTurn, true) };
        await flush();
        assert.equal(narration().length, 7); assert.equal(narration()[0], 'first preface');
    }
    assert.equal(processRequests, requestsBeforeReopen);
    assert.equal(dom.document.body.textContent.includes('private-result'), false);
    assert.equal(dom.document.body.textContent.includes('arguments'), false);
    processTurn.assistant = 'final response'; processTurn.status = 'finished'; update(false); await flush();
    assert.equal(fold().getAttribute('aria-expanded'), 'false'); assert.deepEqual(narration(), []);
    assert.equal(content(), 'final response');
    fold().click(); await flush();
    assert.equal(fold().getAttribute('aria-expanded'), 'true'); assert.equal(narration().length, 7);
    const textOrder = [...dom.document.querySelectorAll('[data-message-text]')].map(element => element.textContent.trim());
    assert.equal(textOrder[0], 'first preface'); assert.equal(textOrder.at(-1), 'final response');
    update(false); await flush();
    assert.equal(fold().getAttribute('aria-expanded'), 'true'); assert.equal(narration().length, 7);
    // An unrelated history save advances the revision without changing this turn.
    // Keep its narration mounted and readable throughout the delayed refresh.
    const reading = narration(), readingNode = dom.document.querySelector('.admin-process-narration');
    pauseProcess = true; update(false); await flush();
    assert.equal(delayed.length, 1);
    assert.deepEqual(narration(), reading);
    assert.equal(dom.document.querySelector('.admin-process-narration'), readingNode);
    assert.equal(fold().getAttribute('aria-expanded'), 'true');
    delayed.shift()(); await flush();
    assert.deepEqual(narration(), reading);
    assert.equal(dom.document.querySelector('.admin-process-narration'), readingNode);
    // Whole-process replacement is revision-bound: an older delayed response
    // cannot restore a stale tail, even when the new narration has the same prefix.
    processTurn.toolMessages[0].content = 'A'.repeat(5000) + 'OLD';
    pauseProcess = true; update(false); await flush();
    assert.equal(delayed.length, 1);
    assert.deepEqual(narration(), reading);
    processTurn.toolMessages[0].content = 'A'.repeat(5000) + 'NEW';
    update(false); await flush();
    assert.equal(narration()[0], processTurn.toolMessages[0].content);
    delayed.shift()(); await flush();
    assert.equal(narration()[0], processTurn.toolMessages[0].content);
    assert.equal(fold().getAttribute('aria-expanded'), 'true');
    failProcess = true; update(false); await flush();
    assert.ok(dom.document.querySelector('.admin-process [role="status"]'));
    assert.equal(narration()[0], processTurn.toolMessages[0].content);
    failProcess = false; pauseProcess = true;
    dom.document.querySelector('.admin-process [role="status"] button').click(); await flush();
    assert.equal(narration()[0], processTurn.toolMessages[0].content);
    delayed.shift()(); await flush();
    assert.equal(dom.document.querySelector('.admin-process [role="status"]'), null);
    assert.equal(narration()[0], processTurn.toolMessages[0].content);
    // Closing while a request is in flight unmounts the body; its late response
    // must neither reopen the turn nor repopulate hidden narration nodes.
    pauseProcess = true; update(false); await flush();
    fold().click(); await flush(); delayed.shift()(); await flush();
    assert.equal(fold().getAttribute('aria-expanded'), 'false'); assert.deepEqual(narration(), []);
    // A reroll is a new run even though the message ID is reused; old narration must disappear.
    processTurn.toolMessages = []; processTurn.assistant = null; processTurn.status = 'interrupted';
    update(true, 'new attempt'); await flush();
    assert.deepEqual(narration(), []); assert.equal(fold(), null); assert.equal(content(), 'new attempt');
    addRound('new attempt preface'); update(true); await flush();
    assert.deepEqual(narration(), ['new attempt preface']);
    processTurn.status = 'failed'; processTurn.error = 'stopped'; update(false); await flush();
    assert.equal(fold().getAttribute('aria-expanded'), 'false');
    fold().click(); await flush(); assert.deepEqual(narration(), ['new attempt preface']);

    // Failed first-group save leaves the confirmed row empty. The runtime's
    // unsaved process remains readable, but must still fold at the turn boundary.
    processTurn.toolMessages = []; processTurn.error = ''; update(true); await flush();
    addRound('failed save preface');
    const pendingRounds = administratorProcess(processTurn);
    live.value = { ...live.value, process: pendingRounds }; await flush();
    assert.deepEqual(narration(), ['failed save preface']);
    processTurn.toolMessages = []; unsavedProcess.value = pendingRounds; update(false); await flush();
    assert.equal(row.value.processCount, 0);
    assert.equal(fold().getAttribute('aria-expanded'), 'false'); assert.deepEqual(narration(), []);
    fold().click(); await flush(); assert.deepEqual(narration(), ['failed save preface']);
    mountKey.value++; await flush();
    assert.equal(fold().getAttribute('aria-expanded'), 'false');
    fold().click(); await flush(); assert.deepEqual(narration(), ['failed save preface']);

    // Confirmation changes the source from retained failed work to saved history,
    // not the reader's content or expansion choice while the history request waits.
    const pendingNode = dom.document.querySelector('.admin-process-narration');
    addRound(pendingRounds[0].text);
    pauseProcess = true; unsavedProcess.value = null; update(false); await flush();
    assert.equal(delayed.length, 1);
    assert.deepEqual(narration(), pendingRounds.map(round => round.text));
    assert.equal(dom.document.querySelector('.admin-process-narration'), pendingNode);
    assert.equal(fold().getAttribute('aria-expanded'), 'true');
    delayed.shift()(); await flush();
    assert.equal(dom.document.querySelector('.admin-process-narration'), pendingNode);

    // A failed history read after confirmation still leaves the retained work
    // readable; retry replaces it only once the current response succeeds.
    unsavedProcess.value = pendingRounds; processTurn.toolMessages = []; update(false); await flush();
    addRound('confirmed narration');
    failProcess = true; unsavedProcess.value = null; update(false); await flush();
    assert.ok(dom.document.querySelector('.admin-process [role="status"]'));
    assert.deepEqual(narration(), pendingRounds.map(round => round.text));
    failProcess = false; pauseProcess = true;
    dom.document.querySelector('.admin-process [role="status"] button').click(); await flush();
    assert.deepEqual(narration(), pendingRounds.map(round => round.text));
    delayed.shift()(); await flush();
    assert.deepEqual(narration(), [processTurn.toolMessages[0].content]);
    assert.equal(dom.document.querySelector('.admin-process [role="status"]'), null);

    // Abandonment with no saved process must not retain the discarded narration.
    unsavedProcess.value = pendingRounds; processTurn.toolMessages = []; update(false); await flush();
    unsavedProcess.value = null; await flush();
    assert.equal(fold(), null); assert.deepEqual(narration(), []);
});
