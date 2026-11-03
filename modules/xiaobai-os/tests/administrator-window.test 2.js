import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import { parseHTML } from 'linkedom';
import { parse, compileScript } from 'vue/compiler-sfc';
import { build } from 'esbuild';
import { administratorPage } from '../apps/administrator/application/projection.ts';
import { createAdministratorData } from '../apps/administrator/domain/data.ts';

// Component boundary: a delayed Host must not delay the local input bubble, duplicate
// accepted messages, expand the mounted window or take over deliberate history reading.
test('administrator keeps a bounded reading window and projects submissions before Host acceptance', async t => {
    const { window, document } = parseHTML('<html><body><div id="app"></div></body></html>');
    const previous = new Map();
    const upload = { name: 'draft.png', dataUrl: 'data:image/png;base64,YQ==' };
    const browserStubs = {
        ResizeObserver: class { observe() {} disconnect() {} },
        KeyboardEvent: class extends window.Event {},
        FileReader: class { readAsDataURL() { this.result = upload.dataUrl; this.onload(); } },
        Image: class { async decode() {} },
    };
    for (const key of ['window', 'document', 'Document', 'Node', 'Element', 'HTMLElement', 'SVGElement', ...Object.keys(browserStubs)]) {
        previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
        Object.defineProperty(globalThis, key, { configurable: true, value: browserStubs[key] ?? window[key] });
    }
    let app;
    t.after(() => { app?.unmount(); for (const [key, descriptor] of previous) {
        if (descriptor) { Object.defineProperty(globalThis, key, descriptor); } else { delete globalThis[key]; }
    } });
    const { createApp, nextTick } = await import('vue');
    const compiled = await build({ entryPoints: [fileURLToPath(new URL('../apps/administrator/ui/AdministratorApp.vue', import.meta.url))],
        bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent', loader: { '.css': 'empty' },
        plugins: [{ name: 'administrator-components', setup(builder) {
            builder.onResolve({ filter: /^vue$/ }, () => ({ path: import.meta.resolve('vue'), external: true }));
            builder.onLoad({ filter: /MessageMarkdown\.vue$/ }, () => ({ contents: "import {h} from 'vue'; export default {props:['text'],setup:p=>()=>h('div',{'data-text':''},p.text)}", loader: 'js' }));
            builder.onLoad({ filter: /\.vue$/ }, args => {
                const { descriptor } = parse(readFileSync(args.path, 'utf8'), { filename: args.path });
                return { contents: compileScript(descriptor, { id: args.path, inlineTemplate: true }).content, loader: 'ts' };
            });
        } }],
    });
    // eslint-disable-next-line no-unsanitized/method -- Compiled local components, not external input.
    const { default: App } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputFiles[0].text).toString('base64')}`);
    const turn = id => ({ id, createdAt: 1, user: { text: `input-${id}` }, assistant: `reply-${id}`, toolMessages: [], operations: [], status: 'finished', error: '' });
    let data, state, listener, releaseSend, rejectSend, releasePage, holdPage, pageFailure, submission, calls, confirm;
    const emit = () => listener({ type: 'administrator/state', payload: { state: structuredClone(state) } });
    const publish = () => { state.page = administratorPage(data); emit(); };
    const accept = () => {
        data.turns.push({ ...turn(submission.id), user: { text: submission.text }, assistant: null, status: 'interrupted' }); data.revision++;
        state.submission = { id: submission.submissionId, turnId: submission.id, accepted: true };
        state.unsaved = false;
        state.live = { turnId: submission.id, startedAt: 1, text: '', totalChars: 0, process: [], preview: [], phase: 'waiting' };
        publish();
    };
    const bridge = { subscribe(fn) { listener = fn; return () => {}; }, post() {}, async request(type, payload) {
        calls.push({ type, payload });
        if (type === 'administrator/page') {
            if (pageFailure) { throw new Error('fixture_page_failed'); }
            const page = administratorPage(data, payload.start);
            if (holdPage) { holdPage = false; await new Promise(resolve => { releasePage = resolve; }); }
            return { result: page };
        }
        if (type === 'administrator/send') {
            submission = { ...payload, id: `sent-${data.revision}` };
            await new Promise((resolve, reject) => { releaseSend = resolve; rejectSend = reject; });
            return { result: { turnId: submission.id, state: structuredClone(state) } };
        }
        if (type === 'administrator/confirm' || type === 'administrator/check') {
            if (confirm) { await confirm(); } else { accept(); }
            return { result: structuredClone(state) };
        }
        if (type === 'administrator/regenerate') {
            await new Promise(resolve => { releaseSend = resolve; });
            data.turns = data.turns.slice(0, data.turns.findIndex(t => t.id === payload.turnId) + 1); data.revision++;
            publish(); return { result: structuredClone(state) };
        }
        throw new Error(type);
    } };
    const root = document.getElementById('app');
    const settle = async () => { await setImmediate(); await nextTick(); };
    const rows = () => [...root.querySelectorAll('[data-row-id]')];
    const keys = () => rows().map(row => row.dataset.rowId);
    const log = () => root.querySelector('.admin-conversation');
    const navigate = async direction => { root.querySelector(`[data-history=${direction}]`).click(); await settle(); };
    const edit = text => { const input = root.querySelector('.admin-composer textarea'); input.value = text; input.dispatchEvent(new window.Event('input')); };
    const submit = async text => { edit(text); root.querySelector('.admin-composer').dispatchEvent(new window.Event('submit', { cancelable: true })); await settle(); };
    const attach = async () => {
        const input = root.querySelector('input[type=file]');
        Object.defineProperty(input, 'files', { configurable: true, value: [{ name: upload.name, type: 'image/png', size: 1 }] });
        input.dispatchEvent(new window.Event('change')); await settle();
    };
    async function mount() {
        app?.unmount();
        data = { ...createAdministratorData(), turns: Array.from({ length: 100 }, (_, i) => turn(`history-${i}`)), summary: { throughId: 'history-60', throughToolMessage: null, text: 'existing memory' } };
        state = { chatIdentity: 'fixture', page: administratorPage(data), live: null, unsavedProcess: null, context: { used: 0, limit: 158000, trigger: 128000, history: 0, rules: 0, tools: 0, images: 0, runtime: 0 }, error: '', corrupted: false, unsaved: false, submission: null, conflict: false };
        calls = []; holdPage = false; pageFailure = false; releasePage = null; releaseSend = null; confirm = null;
        app = createApp(App, { bridge, initialState: structuredClone(state) }); app.mount(root); await settle();
        Object.defineProperties(log(), { scrollHeight: { value: 5000 }, clientHeight: { value: 300 } });
    }
    await t.test('10 recent messages, at most 30 while paging both ways, and no history or summary writes', async () => {
        await mount(); const saved = structuredClone(data);
        assert.equal(rows().length, 10); assert.equal(keys()[0], 'history-95:user');
        await navigate('older'); assert.equal(rows().length, 20);
        await navigate('older'); assert.equal(rows().length, 30);
        const removed = rows().at(-1);
        await navigate('older'); assert.equal(rows().length, 30); assert.equal(removed.isConnected, false);
        const visited = new Set(keys());
        while (root.querySelector('[data-history=older]')) { await navigate('older'); assert.ok(rows().length <= 30); keys().forEach(key => visited.add(key)); }
        assert.equal(keys()[0], 'history-0:user');
        while (root.querySelector('[data-history=newer]')) { await navigate('newer'); assert.ok(rows().length <= 30); keys().forEach(key => visited.add(key)); }
        assert.equal(visited.size, 200);
        await navigate('latest'); assert.equal(rows().length, 10);
        assert.deepEqual(data, saved); assert.ok(calls.every(call => call.type === 'administrator/page'));
    });
    await t.test('the pending user counts as one of ten immediately; acceptance and a late request result never duplicate it or steal reading', async () => {
        await mount(); const saved = structuredClone(data);
        for (let i = 0; i < 4; i++) { await navigate('older'); }
        await submit('instant input');
        assert.equal(rows().length, 10); assert.equal(keys().at(-1), 'pending');
        assert.equal(rows().at(-1).textContent.trim(), 'instant input');
        assert.equal(root.querySelector('.admin-composer textarea').value, '');
        assert.equal(log().scrollTop, log().scrollHeight); assert.deepEqual(data, saved);
        for (let i = 0; i < 4; i++) { await navigate('older'); }
        log().scrollTop = 120; log().dispatchEvent(new window.Event('scroll'));
        const reading = keys();
        accept(); await settle(); releaseSend(); await settle();
        assert.deepEqual(keys(), reading); assert.equal(log().scrollTop, 120);
        assert.equal(root.querySelector('[data-row-id=pending]'), null);
        state.live = null; data.turns.at(-1).assistant = 'response'; data.turns.at(-1).status = 'finished'; data.revision++; publish(); await settle();
        assert.deepEqual(keys(), reading); assert.equal(log().scrollTop, 120);
        await navigate('latest'); assert.equal(rows().length, 10);
        assert.equal(rows().filter(row => row.textContent.trim() === 'instant input').length, 1);
        assert.deepEqual(data.turns.slice(0, -1), saved.turns); assert.deepEqual(data.summary, saved.summary);
    });
    await t.test('an obsolete page request cannot reopen history after send', async () => {
        await mount(); await navigate('older');
        holdPage = true; root.querySelector('[data-history=older]').click(); await settle(); assert.ok(releasePage);
        await submit('newest'); releasePage(); await settle();
        assert.equal(rows().length, 10); assert.equal(keys().at(-1), 'pending');
        accept(); releaseSend(); await settle(); assert.equal(rows().length, 10);
    });
    for (const pages of [0, 1, 2]) {
        await t.test(`reading near the tail after ${pages} history expansions keeps incoming replies mounted without auto-scrolling`, async () => {
            await mount(); await submit('read while waiting');
            for (let i = 0; i < pages; i++) { await navigate('older'); }
            const anchor = keys().at(-3);
            log().scrollTop = 120; log().dispatchEvent(new window.Event('scroll')); await settle();
            accept(); await settle(); releaseSend(); await settle();
            assert.ok(keys().includes(anchor));
            assert.equal(keys().at(-1), `${submission.id}:assistant`);
            assert.equal(rows().length, Math.min(11 + pages * 10, 30));
            assert.equal(log().scrollTop, 120);
            assert.equal(root.querySelector('[data-history=newer]'), null);
            state.live = { ...state.live, text: 'incoming reply', phase: 'replying' }; emit(); await settle();
            assert.equal(log().scrollTop, 120);
            assert.equal(keys().at(-1), `${submission.id}:assistant`);
            state.live = null; data.turns.at(-1).assistant = 'finished reply'; data.turns.at(-1).status = 'finished';
            data.revision++; publish(); await settle();
            assert.equal(log().scrollTop, 120);
            assert.equal(root.querySelector('[data-history=newer]'), null);
            log().scrollTop = 4700; log().dispatchEvent(new window.Event('scroll')); await settle();
            assert.equal(rows().length, 10);
        });
    }
    for (const direction of ['older', 'newer']) {
        await t.test(`acceptance preserves an in-flight ${direction} navigation, without another click or adopting its stale page`, async () => {
            await mount(); await submit('navigation in progress'); await navigate('older');
            if (direction === 'newer') { for (let i = 0; i < 3; i++) { await navigate('older'); } }
            const reading = keys();
            holdPage = true; await navigate(direction); assert.ok(releasePage);
            assert.deepEqual(keys(), reading);
            accept(); await settle(); releaseSend(); await settle();
            assert.equal(rows().length, 30);
            assert.equal(keys()[0], direction === 'older' ? 'history-86:user' : 'history-80:assistant');
            if (direction === 'older') {
                assert.equal(keys().at(-1), `${submission.id}:assistant`);
                assert.equal(root.querySelector('[data-history=newer]'), null);
            }
            const destination = keys();
            releasePage(); await settle();
            assert.deepEqual(keys(), destination);
            assert.equal(!!root.querySelector('.admin-notice'), false);
        });
    }
    await t.test('a failed history read leaves the current window intact and a successful retry clears only that read error', async () => {
        await mount(); await navigate('older'); const reading = keys();
        pageFailure = true; await navigate('older');
        assert.deepEqual(keys(), reading); assert.ok(root.querySelector('.admin-notice'));
        pageFailure = false; emit(); await settle(); assert.deepEqual(keys(), reading);
        await navigate('older');
        assert.equal(rows().length, 30); assert.equal(root.querySelector('.admin-notice'), null);
    });
    await t.test('a rejected submission restores its input, while an unconfirmed save keeps its bubble until explicit confirmation', async () => {
        await mount(); await submit('keep this'); rejectSend(new Error('upload failed')); await settle();
        assert.equal(root.querySelector('.admin-composer textarea').value, 'keep this');
        assert.equal(root.querySelector('[data-row-id=pending]'), null); assert.equal(data.turns.length, 100);
        await submit('unconfirmed'); state.unsaved = true; state.submission = { id: submission.submissionId, turnId: submission.id, accepted: false }; emit();
        rejectSend(new Error('save failed')); await settle();
        assert.equal(keys().at(-1), 'pending'); assert.equal(rows().length, 10);
        for (let i = 0; i < 4; i++) { await navigate('older'); }
        root.querySelector('[data-action=confirm]').click(); await settle();
        assert.equal(rows().length, 10); assert.equal(log().scrollTop, log().scrollHeight);
        assert.equal(root.querySelector('[data-row-id=pending]'), null); assert.equal(data.turns.length, 101);
        assert.equal(calls.filter(call => call.type === 'administrator/send').length, 2);
    });
    for (const action of ['confirm', 'check']) {
        await t.test(`${action} restores unaccepted text and image when resumed upload fails after storage confirmation`, async () => {
            await mount(); await attach(); await submit('recover with image');
            state.unsaved = true; state.submission = { id: submission.submissionId, turnId: submission.id, accepted: false }; emit();
            rejectSend(new Error('save failed')); await settle();
            assert.ok(root.querySelector('[data-row-id=pending] img'));
            confirm = async () => { state.unsaved = false; emit(); throw new Error('upload failed'); };
            root.querySelector(`[data-action=${action}]`).click(); await settle();
            assert.equal(root.querySelector('.admin-composer textarea').value, 'recover with image');
            assert.equal(root.querySelector('.admin-attachment img')?.getAttribute('src'), upload.dataUrl);
            assert.equal(!!root.querySelector('[data-row-id=pending]'), false);
            assert.equal(data.turns.length, 100);
            assert.equal(calls.filter(call => call.type === 'administrator/send').length, 1);
        });
    }
    await t.test('an uncertain retry retains its pending input; terminal rejection cannot overwrite a newer draft', async () => {
        await mount(); await attach(); await submit('original input');
        state.unsaved = true; emit(); rejectSend(new Error('save failed')); await settle();
        confirm = async () => { throw new Error('still unconfirmed'); };
        root.querySelector('[data-action=confirm]').click(); await settle();
        assert.ok(root.querySelector('[data-row-id=pending] img'));
        assert.equal(root.querySelector('.admin-composer textarea').value, '');
        edit('new draft');
        confirm = async () => { state.unsaved = false; emit(); throw new Error('upload failed'); };
        root.querySelector('[data-action=confirm]').click(); await settle();
        assert.equal(root.querySelector('.admin-composer textarea').value, 'new draft');
        assert.equal(!!root.querySelector('.admin-attachment'), false);
        assert.equal(!!root.querySelector('[data-row-id=pending]'), false);
    });
    await t.test('regeneration resets immediately, then adopts its truncated history without reopening discarded records', async () => {
        await mount(); for (let i = 0; i < 4; i++) { await navigate('older'); }
        const message = rows().find(row => row.classList.contains('is-user'));
        message.querySelector('.admin-bubble').click(); await settle();
        message.querySelector('[data-action=regenerate]').click(); await settle();
        assert.equal(calls.at(-1).type, 'administrator/regenerate');
        assert.equal(rows().length, 10); assert.equal(log().scrollTop, log().scrollHeight);
        releaseSend(); await settle(); assert.equal(rows().length, 10);
        assert.equal(keys().at(-1), `${data.turns.at(-1).id}:assistant`);
    });
    await t.test('switching chats rejects late input and page results from the old chat', async () => {
        await mount(); await submit('old input');
        await navigate('older'); holdPage = true; await navigate('older'); assert.ok(releasePage);
        state = { ...state, chatIdentity: 'other', page: administratorPage(createAdministratorData()) }; emit(); await settle();
        releaseSend(); releasePage(); await settle();
        assert.equal(rows().length, 0); assert.equal(root.querySelector('.admin-composer textarea').value, '');
    });
    await t.test('an unsaved first message is not an empty chat, and rejected input never overwrites a newer draft', async () => {
        await mount(); data.turns = []; data.revision++; publish(); await settle();
        await submit('first message'); state.unsaved = true; emit(); rejectSend(new Error('save failed')); await settle();
        assert.equal(rows().length, 1); assert.equal(keys()[0], 'pending'); assert.equal(root.querySelector('.admin-empty'), null);
        await mount(); await submit('old input'); edit('new draft'); rejectSend(new Error('upload failed')); await settle();
        assert.equal(root.querySelector('.admin-composer textarea').value, 'new draft'); assert.equal(root.querySelector('[data-row-id=pending]'), null);
    });
});
