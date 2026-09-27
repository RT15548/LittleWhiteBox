import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';
import { indexedDB, IDBObjectStore } from 'fake-indexeddb';
import { parseHTML } from 'linkedom';
import showdown from 'showdown';
import { prepareTauriTavernDrawBranches } from '../../../../integrations/tauritavern/features/draw/chat-branches.js';

// Real markup, gallery transactions, chat save/readback, executor and UI. Only
// SillyTavern boundaries and image-provider responses are simulated; no paid API.
const host = { ctx: null, events: new Map(), afterAi: null, errors: [] };
host.emit = async (key, ...args) => { for (const fn of host.events.get(key) || []) await fn(...args); };
globalThis.__chatImageSlotsTest = host;
globalThis.indexedDB = indexedDB;
globalThis.BroadcastChannel = undefined;
const markdown = new showdown.Converter({ simpleLineBreaks: true, tables: true });
host.format = value => markdown.makeHtml(value);
const stubs = {
    'extensions.js': 'export const getContext = () => globalThis.__chatImageSlotsTest.ctx;',
    'script.js': 'export const messageFormatting = text => globalThis.__chatImageSlotsTest.format(text); export const getRequestHeaders = () => ({}); export const syncMesToSwipe = () => {};',
    'utils.js': 'export const uuidv4 = () => crypto.randomUUID(); export const saveBase64AsFile = async () => { throw new Error("unexpected upload"); };',
    'event-manager.js': `
        const host = globalThis.__chatImageSlotsTest;
        export const event_types = new Proxy({}, { get: (_, key) => key });
        export const createModuleEvents = () => {
            const owned = [];
            return { on(key, fn) { const listeners = host.events.get(key) || [];
                listeners.push(fn); host.events.set(key, listeners); owned.push([key, fn]); },
                cleanup() { for (const [key, fn] of owned.splice(0)) host.events.set(key, (host.events.get(key) || []).filter(item => item !== fn)); }
            };
        };`,
    'generate-interceptor.js': `export const GENERATE_INTERCEPTOR_ORDER = {};
        export const registerGenerateInterceptor = () => {}; export const unregisterGenerateInterceptor = () => {};`,
    'after-ai-gate.js': `export const initAfterAiGate = () => {};
        export const notifyAfterAiHint = () => globalThis.__chatImageSlotsTest.afterAi?.();
        export const registerAfterAiHandler = (_, fn) => { globalThis.__chatImageSlotsTest.afterAi = fn;
            return () => { globalThis.__chatImageSlotsTest.afterAi = null; }; };`,
    'debug-core.js': 'export const xbLog = { error(...args) { globalThis.__chatImageSlotsTest.errors.push(args.at(-1)?.message); }, warn() {}, info() {} };',
    'draw-run-recovery-runtime.js': 'export const runDrawRunRecoveryPass = async () => {};',
};
const bundle = await build({
    stdin: { contents: [
        'draw-common', 'gallery-cache', 'prepared-chat-images', 'chat-message-images',
        'chat-image-tag-migration', 'card-tag-editor', 'image-card-actions', 'generated-image-runtime',
        'pending-image-jobs', 'image-job-recovery-runtime',
        'image-card-redraw-provider', 'floor-image-job',
        'chat-message-image-markup',
        'draw-run-controls', 'draw-run-activity', 'draw-run-markers', 'confirmable-chat-save',
    ].map(name => `export * from './${name}.js';`).join('\n'), resolveDir: fileURLToPath(new URL('..', import.meta.url)) },
    bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'host', setup(builder) {
        builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
            const name = path.split('/').at(-1);
            return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
        });
        builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
    } }],
});
// Executes the local production bundle above, not untrusted generated code.
// eslint-disable-next-line no-unsanitized/method
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text + '\n//# sourceURL=draw-slots-test.mjs').toString('base64')}`);
const tick = () => new Promise(resolve => setTimeout(resolve, 10));
async function until(predicate) {
    for (let i = 0; i < 100; i++) { if (await predicate()) return; await tick(); }
    assert.fail('condition not reached: ' + JSON.stringify(host.errors));
}

let chatNumber = 0;
function setup(t, source, { legacy = false } = {}) {
    host.errors = [];
    const { document, window } = parseHTML('<html><head></head><body><div id="chat"><div class="mes" mesid="0"><div class="mes_text"></div></div></div></body></html>');
    globalThis.document = document;
    globalThis.window = window;
    globalThis.MutationObserver = window.MutationObserver;
    const observed = new Set();
    globalThis.IntersectionObserver = class {
        constructor(callback) { this.callback = callback; host.observer = this; }
        observe(node) { observed.add(node); }
        unobserve(node) { observed.delete(node); }
        disconnect() { observed.clear(); }
    };
    const message = { name: 'Alice', mes: source, swipe_id: 0, swipes: [source], extra: {} };
    let persisted;
    let saves = 0;
    let responses = 0;
    const deliveries = [];
    let hold = false;
    let saveMode = 'ok';
    let cacheReadsFail = false;
    let onSave;
    let failures = new Set();
    const ctx = host.ctx = { chatId: `chat-${++chatNumber}`, chat: [message], characterId: 0,
        characters: [{ name: 'Alice', avatar: 'alice.png' }],
        chatMetadata: legacy ? {} : { [api.CHAT_IMAGE_TAG_FORMAT_KEY]: api.CHAT_IMAGE_TAG_FORMAT_VERSION },
        getRequestHeaders: () => ({}), saveChat: async () => {
            saves++;
            await onSave?.();
            if (saveMode === 'uncertain') throw new Error('save disconnected');
            persisted = structuredClone([{ chat_metadata: ctx.chatMetadata }, ...ctx.chat]);
        } };
    globalThis.fetch = async () => {
        if (saveMode === 'uncertain') throw new Error('readback disconnected');
        return new Response(JSON.stringify(persisted));
    };
    window.xiaobaixDraw = {
        getStatus: () => ({ enabled: true, ready: true }), getProvider: () => 'novelai',
        prepareGeneration(input) {
            if (cacheReadsFail) throw new Error('cache descriptor failed');
            return { fingerprint: { provider: 'novelai', promptData: { positive: input.prompt,
                characterPrompts: [], negativePrompt: '' } }, execute: async () => { throw new Error('legacy generation forbidden'); } };
        },
    };
    const submissions = [];
    const jobs = new Map(), states = [];
    let prepareBarrier = async () => {};
    const execute = async input => {
        submissions.push(input);
        await prepareBarrier(input);
        return api.submitPreparedChatImages({ ...input, backend: false,
            metadata: input.tasks.map(task => ({ tags: task.scene, positive: task.scene,
                characterPrompts: task.characterPrompts, negativePrompt: task.negativePrompt ?? '' })),
            run: async callbacks => {
                responses++;
                if (hold) await new Promise(resolve => { deliveries.push(resolve); });
                for (const index of input.tasks.keys()) {
                    if (await callbacks.onItemStarting({ index }) === false) continue;
                    if (failures.has(index)) await callbacks.onItemSettled({ index, state: 'failed',
                        error: Object.assign(new Error('supplier rejected'), { imageRequestOutcome: 'rejected' }) });
                    else await callbacks.onItemReady({ index, base64: 'YWJj' });
                }
            } });
    };
    const dispose = api.registerPreparedImageProvider('novelai', api.createImageCardRedrawProvider({ execute,
        createJob: (messageId, options) => api.acquireFloorImageJob(jobs, host.ctx, messageId, () => ({
            controller: new AbortController(), backendCancel: new AbortController(),
        }), options), releaseJob: job => api.releaseFloorImageJob(jobs, job),
        getCurrentContext: () => host.ctx, setStateForMessage: (_id, state, data) => states.push({ state, data }),
        classifyError: api.classifyError,
    }));
    const root = document.querySelector('.mes_text');
    function format() {
        // Test-owned message formatted through Markdown, as the host would.
        // eslint-disable-next-line no-unsanitized/property
        root.innerHTML = host.format(message.mes);
    }
    format();
    t.after(() => {
        api.stopImageJobRecovery(); api.configureChatImageTagMigration();
        api.cleanupChatMessageImages(); api.clearPreviewObjectUrls(); dispose();
    });
    return { ctx, message, root, observed, submissions, format, jobs, states,
        set failures(value) { failures = new Set(value); },
        get persisted() { return structuredClone(persisted); },
        async begin({ type = 'normal', streaming = true, dryRun = false } = {}) {
            if (type === 'regenerate') ctx.chat[0] = { ...message };
            else if (!['continue', 'swipe'].includes(type)) ctx.chat.pop();
            await host.emit('GENERATION_STARTED', type, {}, dryRun);
            await host.emit('GENERATION_AFTER_COMMANDS', type, {}, dryRun);
            if (type === 'regenerate') { ctx.chat.pop(); await host.emit('MESSAGE_DELETED'); }
            await host.emit('GENERATE_AFTER_DATA', {}, dryRun);
            if (!ctx.chat.includes(message)) ctx.chat.push(message);
            if (streaming) ctx.streamingProcessor = { messageId: 0, isStopped: false, isFinished: false };
            format();
        },
        async receive(type = 'normal') {
            if (ctx.streamingProcessor) ctx.streamingProcessor.isFinished = true;
            await host.emit('GENERATION_ENDED');
            await host.emit('MESSAGE_RECEIVED', 0, type);
        },
        generateTag() { root.querySelector('[data-action="generate-tag"]').click(); },
        get saves() { return saves; }, get requests() { return responses; },
        set hold(value) { hold = value; }, finish() { for (const deliver of deliveries.splice(0)) deliver(); },
        set saveMode(value) { saveMode = value; }, set cacheReadsFail(value) { cacheReadsFail = value; },
        set onSave(value) { onSave = value; },
        set prepareBarrier(value) { prepareBarrier = value; },
    };
}

test('received tags batch once without visibility, update swipe, and survive duplicate events and remount', async t => {
    const h = setup(t, 'before [img: same] middle [img: other] end [img: same]');
    api.initChatMessageImages();
    await h.begin();
    await until(() => h.root.querySelectorAll('[data-xb-draw-tag="streaming"]').length === 3);
    assert.equal(h.requests, 0);
    await Promise.all([h.receive(), h.receive()]);
    await until(() => h.root.querySelectorAll('.xb-nd-img img').length === 3);
    assert.equal(h.requests, 1);
    assert.equal(h.saves, 0);
    assert.equal(h.message.swipes[0], h.message.mes);
    assert.equal(new Set(h.root.querySelectorAll('[data-slot-id]')).size, 3);
    const slots = [...h.root.querySelectorAll('[data-slot-id]')].map(node => node.dataset.slotId);
    assert.equal(new Set(slots).size, 3);
    for (const id of slots) assert.equal((await api.getPreviewsBySlot(id)).length, 1);
    h.format();
    const release = api.mountChatMessageImages(h.root, 0);
    await api.renderPreviewsForMessage(0);
    await tick(); release();
    assert.equal(h.requests, 1);
    assert.equal(h.root.querySelectorAll('.xb-nd-img img').length, 3);
});

test('historical tags stay raw through reload; only an explicit action generates one occurrence', async t => {
    const h = setup(t, '[img: first] and [img: later]');
    api.initChatMessageImages();
    await until(() => h.root.querySelectorAll('[data-action="generate-tag"]').length === 2);
    assert.equal(h.requests, 0);
    h.generateTag();
    await until(() => h.root.querySelectorAll('.xb-nd-img img').length === 1);
    assert.ok(h.message.mes.includes('[img: later]'));
    api.cleanupChatMessageImages(); h.format(); api.initChatMessageImages();
    await until(() => h.root.querySelectorAll('[data-action="generate-tag"]').length === 1);
    assert.equal(h.requests, 1);
    h.generateTag();
    await until(() => h.requests === 2);
    await until(() => !h.message.mes.includes('[img:'));
});

test('content lease disposal does not cancel a claimed request', async t => {
    const h = setup(t, '[img: keep]'); h.hold = true;
    api.initChatMessageImages(); await h.begin(); await h.receive();
    await until(() => h.requests === 1);
    const release = api.mountChatMessageImages(h.root, 0); release();
    h.finish();
    await until(() => h.root.querySelector('img'));
    assert.equal(h.requests, 1);
});

test('DOM-only replacement restores owned images without a host message event or new request', async t => {
    const h = setup(t, '[img: restore]');
    api.initChatMessageImages(); await h.begin(); await h.receive();
    await until(() => h.root.querySelector('img'));
    await until(() => h.jobs.size === 0);
    await tick();
    h.format();
    await until(() => h.root.querySelector('img'));
    assert.equal(h.requests, 1);
    assert.equal(h.jobs.size, 0);
});

test('uncertain save retains registered input but makes zero generation requests', async t => {
    const h = setup(t, '[img: retain]'); h.saveMode = 'uncertain';
    api.initChatMessageImages(); await until(() => h.root.querySelector('[data-action="generate-tag"]'));
    h.generateTag(); await until(() => h.root.querySelector('[data-state="failed"]'));
    assert.equal(h.requests, 0);
    const card = h.root.querySelector('[data-slot-id]');
    assert.equal((await api.getCardPreview(card.dataset)).status, 'failed');
    assert.equal((await api.getCardPreview(card.dataset)).tags, 'retain');
    api.refreshChatMessageImages(); await tick();
    assert.equal(h.requests, 0);
    const savedSource = h.message.mes;
    const slotId = card.dataset.slotId;
    h.saveMode = 'ok';
    await api.redrawImageCard('novelai', card);
    assert.equal(h.requests, 1);
    assert.equal(h.message.mes, savedSource);
    assert.equal(h.root.querySelector('.xb-nd-img').dataset.slotId, slotId);
    assert.equal(h.root.querySelectorAll('img').length, 1);
});

test('edited tags persist for image and interrupted card, redraw reads the selected record rather than stale DOM', async t => {
    const h = setup(t, '[image:edit-slot]');
    await api.storePreview({ slotId: 'edit-slot', imgId: 'edit-img', messageId: 0, tags: 'old',
        positive: 'old', characterPrompts: [], negativePrompt: '', status: 'pending' });
    await api.renderPreviewsForMessage(0);
    let card = h.root.querySelector('.xb-nd-img');
    card.querySelector('textarea').value = 'new tags';
    await api.persistCardTagEdits(card, tags => ({ positive: tags }));
    h.format(); await api.renderPreviewsForMessage(0);
    card = h.root.querySelector('.xb-nd-img');
    assert.equal(card.dataset.tags, 'new tags');
    card.dataset.tags = 'stale DOM';
    await api.redrawImageCard('novelai', card);
    assert.equal(h.submissions[0].tasks[0].scene, 'new tags');
    assert.deepEqual(h.submissions[0].tasks[0].characterPrompts, []);
    assert.equal(h.root.querySelectorAll('img').length, 1);
});

test('removing a slot clears its active swipe, every version and selection; never restores shorthand', async t => {
    const h = setup(t, '[image:remove-slot]');
    await api.storePreview({ slotId: 'remove-slot', imgId: 'remove-img', tags: 'tag', messageId: 0, status: 'pending' });
    await api.setSlotSelection('remove-slot', 'remove-img');
    await api.renderPreviewsForMessage(0);
    await api.removeChatImageSlot(h.root.querySelector('.xb-nd-img'));
    assert.equal(h.message.mes, '');
    assert.equal(h.message.swipes[0], '');
    assert.equal((await api.getPreviewsBySlot('remove-slot')).length, 0);
    assert.equal(await api.getSlotSelection('remove-slot'), null);
});

test('slot deletion finishing after a chat switch never clears the other chat saved image', async t => {
    const h = setup(t, '[image:delete-original]');
    await api.storePreview({ slotId: 'delete-original', imgId: 'delete-original-image', tags: 'tag', messageId: 0, base64: 'YWJj' });
    await api.setDrawSavedEntry(0, 'delete-original', { imgId: 'delete-original-image', savedUrl: '/saved.png' });
    await api.renderPreviewsForMessage(0);
    const nextMessage = structuredClone(h.message);
    const before = structuredClone(nextMessage);
    h.onSave = () => { host.ctx = { ...h.ctx, chatId: 'other-chat', chat: [nextMessage] }; };
    await api.removeChatImageSlot(h.root.querySelector('.xb-nd-img'));
    assert.deepEqual(nextMessage, before);
    assert.equal(h.message.mes, '');
    assert.equal((await api.getPreviewsBySlot('delete-original')).length, 0);
    assert.equal(h.requests, 0);
});

test('failed redraw retains access to existing versions without another image request', async t => {
    const h = setup(t, '[image:retained-version]');
    await api.storePreview({ slotId: 'retained-version', imgId: 'retained-image', tags: 'old scene',
        messageId: 0, base64: 'YWJj' });
    await api.storePreview({ slotId: 'retained-version', imgId: 'failed-attempt', tags: 'edited scene',
        messageId: 0, status: 'failed' });
    await api.setSlotSelection('retained-version', 'failed-attempt');
    await api.renderPreviewsForMessage(0);
    const failedCard = h.root.querySelector('.xb-nd-img');
    assert.equal(failedCard.dataset.state, 'failed');
    assert.ok(failedCard.querySelector('[data-action="restore-image"]'));
    assert.equal(await api.restoreImageCard(failedCard), true);
    h.format(); await api.renderPreviewsForMessage(0);
    assert.equal(h.root.querySelector('.xb-nd-img').dataset.imgId, 'retained-image');
    assert.ok(h.root.querySelector('img'));
    assert.equal((await api.getPreview('failed-attempt')).tags, 'edited scene');
    assert.equal(h.requests, 0);
});

test('legacy miss migration is cache-only across active and inactive swipes; new tags stay unclaimed', async t => {
    const h = setup(t, '[img: old]', { legacy: true });
    h.message.swipes.push('[图片: alternate]');
    await api.ensureChatImageTagFormat(h.ctx);
    assert.equal(h.ctx.chatMetadata[api.CHAT_IMAGE_TAG_FORMAT_KEY], api.CHAT_IMAGE_TAG_FORMAT_VERSION);
    for (const text of [h.message.mes, h.message.swipes[1]]) assert.match(text, /^\[image:/);
    assert.equal(h.requests, 0);
    h.message.mes += '[img: new]';
    await api.ensureChatImageTagFormat(h.ctx);
    assert.ok(h.message.mes.endsWith('[img: new]'));
});

test('100 rounds of native ordering: normal/regenerate/swipe/continue, streaming/plain, single/group, no DOM and duplicate events', async t => {
    let batches = 0, images = 0;
    const rounds = Number(process.env.DRAW_TIMING_ROUNDS || 100);
    const h = setup(t, 'previous [img: historical]');
    h.root.remove();
    api.initChatMessageImages();
    for (let round = 0; round < rounds; round++) {
        for (const type of ['normal', 'regenerate', 'swipe', 'continue']) {
            for (const streaming of [false, true]) for (const group of [false, true]) {
                    h.states.length = 0; h.submissions.length = 0;
                    h.ctx.chat.splice(0, h.ctx.chat.length, h.message);
                    h.ctx.groupId = group ? 'group' : null;
                    h.ctx.streamingProcessor = null;
                    h.message.mes = 'previous [img: historical]';
                    h.message.swipe_id = 0; h.message.swipes = [h.message.mes];
                    h.format();
                    const before = h.requests;
                    if (type === 'swipe') {
                        h.message.swipe_id = 1; h.message.swipes.push('new branch');
                    }
                    document.body.dataset.generating = 'true';
                    await h.begin({ type, streaming });
                    const prefix = type === 'continue' ? h.message.mes : '';
                    h.message.mes = prefix + ' new [img: same] middle [图片: other] end [img: same] ` [img: code] `';
                    h.format();
                    await Promise.all([h.receive(type), h.receive(type)]);
                    const slots = [...api.extractSlotIds(h.message.mes)];
                    assert.equal(slots.length, 3);
                    assert.equal(h.message.swipes[h.message.swipe_id], h.message.mes);
                    assert.equal(h.saves, 0);
                    await until(() => h.jobs.size === 0);
                    assert.equal(h.requests, before + 1, `${round}:${type}:${streaming}:${group}`);
                    assert.equal(h.states.at(-1).state, 'success');
                    assert.equal(h.states.at(-1).data.success, 3);
                    for (const slot of slots) {
                        const records = await api.getPreviewsBySlot(slot);
                        assert.equal(records.length, 1); assert.equal(records[0].status, 'success'); images++;
                        // Each scenario owns its isolated gallery input/output.
                        await api.deletePreview(records[0].imgId);
                    }
                    if (type === 'continue') assert.ok(h.message.mes.startsWith(prefix));
                    batches++;
            }
        }
    }
    assert.equal(batches, rounds * 16); assert.equal(images, rounds * 48);
    t.diagnostic(`${rounds} rounds / ${batches} batches / ${images} images: no missed claims or duplicate submissions`);
});

test('native save delay and failure cannot hold or undo drawing; lost unsaved placement retains gallery', async t => {
    const h = setup(t, '[img: retained despite save]'); h.hold = true;
    api.initChatMessageImages(); await h.begin(); await h.receive();
    await until(() => h.requests === 1);
    const slot = [...api.extractSlotIds(h.message.mes)][0];
    h.saveMode = 'uncertain';
    let releaseSave;
    h.onSave = () => new Promise(resolve => { releaseSave = resolve; });
    const saving = h.ctx.saveChat();
    h.message.mes = 'unsaved message lost'; h.message.swipes[0] = h.message.mes;
    h.finish();
    await until(async () => (await api.getDisplayPreviewForSlot(slot)).hasData);
    assert.equal(h.requests, 1);
    releaseSave(); await assert.rejects(saving);
    assert.equal(h.message.mes, 'unsaved message lost');
    assert.equal((await api.getDisplayPreviewForSlot(slot)).preview.chatId, h.ctx.chatId);
});

test('preparation storage failure keeps a raw retryable tag and never resubmits on repaint', async t => {
    const h = setup(t, '[img: retry input]');
    let failStorage = true;
    const put = IDBObjectStore.prototype.put;
    t.mock.method(IDBObjectStore.prototype, 'put', function (...args) {
        const result = put.apply(this, args);
        if (failStorage && this.name === 'previews') this.transaction.abort();
        return result;
    });
    api.initChatMessageImages(); await h.begin(); await h.receive();
    await until(() => h.root.querySelector('[data-xb-draw-tag="failed"]'));
    assert.equal(h.message.mes, '[img: retry input]'); assert.equal(h.requests, 0);
    h.format(); api.refreshChatMessageImages(); await tick(); assert.equal(h.requests, 0);
    failStorage = false; h.generateTag();
    await until(() => h.root.querySelector('img'));
    assert.equal(h.requests, 1);
});

for (const condition of ['quiet', 'preview', 'stopped', 'failed', 'stale-failed']) test(`host ${condition} boundary is handled without mistaking stale processors for current failure`, async t => {
    const h = setup(t, '[img: observed]');
    h.ctx.streamingProcessor = { isStopped: true };
    api.initChatMessageImages();
    await h.begin({ type: condition === 'quiet' ? 'quiet' : 'normal',
        dryRun: condition === 'preview', streaming: condition !== 'stale-failed' });
    if (condition === 'stopped') await host.emit('GENERATION_STOPPED');
    if (condition === 'failed') h.ctx.streamingProcessor.isStopped = true;
    await h.receive(); await tick();
    assert.equal(h.requests, condition === 'stale-failed' ? 1 : 0);
});

test('DICE first listener removes a tail before tag adoption; editing later is never automatic', async t => {
    const h = setup(t, '[img: keep] DICE [img: removed]');
    api.initChatMessageImages(); await h.begin();
    host.events.get('MESSAGE_RECEIVED').unshift(() => { h.message.mes = '[img: keep]'; });
    await h.receive(); await until(() => h.jobs.size === 0);
    assert.equal(h.submissions[0].tasks.length, 1);
    h.message.mes += ' [img: edited]'; h.format(); await host.emit('MESSAGE_EDITED');
    await until(() => h.root.querySelector('[data-action="generate-tag"]'));
    assert.equal(h.requests, 1);
    host.events.get('MESSAGE_RECEIVED').shift();
});

test('partial and total supplier failures finish every item with matching capsule counts', async t => {
    for (const failures of [[1], [0, 1]]) await t.test(failures.join(','), async child => {
        const h = setup(child, '[img: first] [img: second]'); h.failures = failures;
        api.initChatMessageImages(); await h.begin(); await h.receive();
        await until(() => h.jobs.size === 0);
        const records = await Promise.all([...api.extractSlotIds(h.message.mes)].map(async slot => (await api.getPreviewsBySlot(slot))[0]));
        assert.equal(records.filter(record => record.status === 'failed').length, failures.length);
        assert.equal(h.states.at(-1).data.success, 2 - failures.length);
        assert.equal(h.states.at(-1).data.total, 2);
        assert.equal(h.root.querySelectorAll('[data-state="pending"]').length, 0);
    });
});

test('explicit deletion during a native batch discards one item without cancelling its sibling', async t => {
    const h = setup(t, '[img: first] [img: second]'); h.hold = true;
    api.initChatMessageImages(); await h.begin(); await h.receive();
    await until(() => h.requests === 1);
    const slots = [...api.extractSlotIds(h.message.mes)];
    await api.renderPreviewsForMessage(0);
    await api.removeChatImageSlot(h.root.querySelector(`[data-slot-id="${slots[0]}"]`));
    h.finish(); await until(() => h.jobs.size === 0);
    assert.equal((await api.getPreviewsBySlot(slots[0])).length, 0);
    assert.equal(await api.getSlotSelection(slots[0]), null);
    assert.equal((await api.getDisplayPreviewForSlot(slots[1])).hasData, true);
    assert.deepEqual([...api.extractSlotIds(h.message.mes)], [slots[1]]);
    assert.equal(h.states.at(-1).data.success, 1);
});

test('a completed continuation joins an active floor job instead of losing its new tag', async t => {
    const h = setup(t, '[img: first]'); h.hold = true;
    api.initChatMessageImages(); await h.begin(); await h.receive();
    await until(() => h.requests === 1);
    const firstSlot = [...api.extractSlotIds(h.message.mes)][0];
    await h.begin({ type: 'continue' });
    h.message.mes += ' [img: second]';
    await h.receive('continue'); await until(() => h.requests === 2);
    const batches = api.getFloorImageJobs(h.jobs, h.ctx, 0);
    assert.equal(batches.length, 2);
    assert.notEqual(batches[0].controller, batches[1].controller);
    h.finish(); await until(() => h.jobs.size === 0);
    const slots = [...api.extractSlotIds(h.message.mes)];
    assert.equal(slots.length, 2); assert.equal(slots[0], firstSlot);
    assert.equal(h.states.at(-1).state, 'success');
    assert.equal(h.states.at(-1).data.success, 2); assert.equal(h.states.at(-1).data.total, 2);
});

for (const newerFirst of [false, true]) test(`continuation during local preparation claims every occurrence (newer first: ${newerFirst})`, async t => {
    for (let round = 0; round < Number(process.env.DRAW_TIMING_ROUNDS || 100); round++) await t.test(`round ${round}`, async child => {
        const h = setup(child, '[img: same]');
        const gates = [Promise.withResolvers(), Promise.withResolvers()];
        let prepared = 0;
        h.prepareBarrier = () => gates[prepared++].promise;
        api.initChatMessageImages(); await h.begin();
        const first = h.receive();
        await until(() => prepared === 1);
        await h.begin({ type: 'continue' }); h.message.mes += ' tail [img: same]';
        const second = h.receive('continue');
        await until(() => prepared === 2);
        const operations = [first, second];
        const order = newerFirst ? [1, 0] : [0, 1];
        gates[order[0]].resolve(); await operations[order[0]];
        gates[order[1]].resolve(); await operations[order[1]];
        await until(() => h.jobs.size === 0);
        await h.receive('continue');
        assert.equal(h.submissions.length, 2);
        assert.equal(h.requests, 2);
        assert.equal(api.parseChatImageTags(h.message.mes).length, 0);
        assert.equal(api.extractSlotIds(h.message.mes).size, 2);
        assert.equal(h.message.swipes[0], h.message.mes);
        assert.equal(h.states.at(-1).data.success, 2);
        assert.equal(host.errors.length, 0);
    });
});

for (const discard of [false, true]) test(`a continuation stream restores owned slots without repurchasing or undoing deletion (discard: ${discard})`, async t => {
    const h = setup(t, '[img: first]');
    const gate = Promise.withResolvers();
    h.prepareBarrier = input => input.tasks[0].scene === 'first' ? gate.promise : undefined;
    api.initChatMessageImages(); await h.begin();
    const first = h.receive(); await until(() => h.submissions.length === 1);
    await h.begin({ type: 'continue' });
    h.message.mes += ' partial';
    gate.resolve(); await first;
    const slot = [...api.extractSlotIds(h.message.mes)][0];
    if (discard) {
        await api.renderPreviewsForMessage(0);
        await api.removeChatImageSlot(h.root.querySelector(`[data-slot-id="${slot}"]`));
    }
    h.message.mes = '[img: first] continued [img: second]';
    await h.receive('continue'); await until(() => h.jobs.size === 0);
    assert.equal(h.requests, 2);
    assert.deepEqual(h.submissions.map(input => input.tasks[0].scene), ['first', 'second']);
    assert.equal(api.parseChatImageTags(h.message.mes).length, 0);
    assert.equal(api.extractSlotIds(h.message.mes).has(slot), !discard);
    assert.equal(api.extractSlotIds(h.message.mes).size, discard ? 1 : 2);
});

test('three overlapping continuations retain every claim when streaming restores an older prefix', async t => {
    for (let round = 0; round < Number(process.env.DRAW_TIMING_ROUNDS || 100); round++) await t.test(`round ${round}`, async child => {
        const h = setup(child, '[img: same]');
        const gates = [Promise.withResolvers(), Promise.withResolvers()];
        h.prepareBarrier = () => gates[h.submissions.length - 1]?.promise;
        api.initChatMessageImages(); await h.begin();
        const first = h.receive(); await until(() => h.submissions.length === 1);
        await h.begin({ type: 'continue' }); h.message.mes += ' second [img: same]';
        const second = h.receive('continue'); await until(() => h.submissions.length === 2);
        const prefix = h.message.mes;
        await h.begin({ type: 'continue' }); h.message.mes += ' partial';
        gates[0].resolve(); await first;
        h.message.mes = prefix + ' next token';
        gates[1].resolve(); await second;
        h.message.mes = prefix + ' third [img: same]';
        await h.receive('continue'); await until(() => h.jobs.size === 0);
        assert.equal(h.requests, 3);
        assert.equal(api.extractSlotIds(h.message.mes).size, 3);
        assert.equal(api.parseChatImageTags(h.message.mes).length, 0);
        assert.equal(host.errors.length, 0);
    });
});

test('deleting another slot during preparation does not revoke an unrelated tag', async t => {
    const h = setup(t, '[img: first]'); h.hold = true;
    api.initChatMessageImages(); await h.begin(); await h.receive();
    await until(() => h.requests === 1);
    const slot = [...api.extractSlotIds(h.message.mes)][0];
    const gate = Promise.withResolvers(); h.prepareBarrier = () => gate.promise;
    await h.begin({ type: 'continue' }); h.message.mes += ' next [img: second]';
    const second = h.receive('continue'); await until(() => h.submissions.length === 2);
    await api.renderPreviewsForMessage(0);
    await api.removeChatImageSlot(h.root.querySelector(`[data-slot-id="${slot}"]`));
    gate.resolve(); await second; await until(() => h.requests === 2);
    h.finish(); await until(() => h.jobs.size === 0);
    assert.equal(api.parseChatImageTags(h.message.mes).length, 0);
    assert.equal(api.extractSlotIds(h.message.mes).size, 1);
    assert.equal(host.errors.length, 0);
});

test('a preparing message follows its identity when an earlier floor is deleted', async t => {
    const h = setup(t, '[img: scene]');
    const gate = Promise.withResolvers(); h.prepareBarrier = () => gate.promise;
    api.initChatMessageImages(); await h.begin();
    h.ctx.chat.unshift({ mes: 'earlier', is_user: true });
    const received = host.emit('MESSAGE_RECEIVED', 1, 'normal');
    await until(() => h.submissions.length === 1);
    h.ctx.chat.shift(); await host.emit('MESSAGE_DELETED');
    gate.resolve(); await received; await until(() => h.jobs.size === 0);
    assert.equal(h.requests, 1);
    assert.equal(api.extractSlotIds(h.message.mes).size, 1);
    assert.equal(host.errors.length, 0);
});

for (const boundary of ['input-storage', 'chat-save', 'chat-readback']) test(`manual image preparation follows a moved floor during ${boundary}`, async t => {
    const h = setup(t, '[img: manual scene]');
    h.ctx.chat.unshift({ mes: 'earlier', is_user: true });
    h.root.closest('.mes').setAttribute('mesid', '1');
    const move = () => {
        h.ctx.chat.shift();
        h.root.closest('.mes').setAttribute('mesid', '0');
    };
    if (boundary === 'input-storage') {
        const put = IDBObjectStore.prototype.put;
        t.mock.method(IDBObjectStore.prototype, 'put', function(value, ...args) {
            const request = put.call(this, value, ...args);
            if (value.status === 'pending') move();
            return request;
        });
    } else if (boundary === 'chat-save') h.onSave = move;
    else {
        const fetch = globalThis.fetch;
        t.mock.method(globalThis, 'fetch', async (...args) => {
            const response = await fetch(...args);
            move();
            return response;
        });
    }
    const result = await api.generatePreparedChatImages('novelai', {
        ctx: h.ctx, message: h.message, messageId: 1, sourceText: h.message.mes,
        tasks: api.parseChatImageTags(h.message.mes).map(tag => ({ scene: tag.tags, placement: { ...tag, mode: 'replace' } })),
    });
    assert.equal(result.success, 1);
    assert.equal(h.requests, 1);
    assert.equal(h.saves, 1);
    const slot = [...api.extractSlotIds(h.message.mes)][0];
    assert.ok(h.persisted.some(message => api.extractSlotIds(message.mes).has(slot)));
    assert.equal((await api.getDisplayPreviewForSlot(slot)).preview.messageId, 0);
    assert.ok(h.root.querySelector('img'));
});

for (const event of ['CHAT_CHANGED', 'MESSAGE_SWIPED']) test(`leaving and returning during preparation revokes ownership (${event})`, async t => {
    const h = setup(t, '[img: keep for retry]');
    const gate = Promise.withResolvers(); h.prepareBarrier = () => gate.promise;
    api.initChatMessageImages(); await h.begin();
    const received = h.receive(); await until(() => h.submissions.length === 1);
    await host.emit(event);
    await host.emit(event);
    gate.resolve(); await received; await until(() => h.jobs.size === 0);
    assert.equal(h.requests, 0);
    assert.equal(api.parseChatImageTags(h.message.mes).length, 1);
    assert.equal(api.extractSlotIds(h.message.mes).size, 0);
    await until(() => h.root.querySelector('[data-action="generate-tag"]'));
});

test('stream tokens cannot resurrect a slot removed from the original continuation prefix', async t => {
    const h = setup(t, '[img: first]');
    api.initChatMessageImages(); await h.begin(); await h.receive();
    await until(() => h.jobs.size === 0);
    const original = h.message.mes;
    const slot = [...api.extractSlotIds(original)][0];
    await h.begin({ type: 'continue' });
    await api.renderPreviewsForMessage(0);
    await api.removeChatImageSlot(h.root.querySelector(`[data-slot-id="${slot}"]`));
    h.message.mes = original + ' [img: second]';
    await h.receive('continue'); await until(() => h.jobs.size === 0);
    assert.equal(h.requests, 2);
    assert.equal(api.extractSlotIds(h.message.mes).has(slot), false);
    assert.equal(api.extractSlotIds(h.message.mes).size, 1);
    assert.equal(host.errors.length, 0);
});

test('continuation can complete an unfinished tag without reclaiming earlier complete tags', async t => {
    const h = setup(t, '[img: historical] text [img: unfinished');
    api.initChatMessageImages(); await h.begin({ type: 'continue' });
    h.message.mes += ' scene]';
    await h.receive('continue'); await until(() => h.jobs.size === 0);
    assert.equal(h.requests, 1); assert.equal(h.submissions[0].tasks.length, 1);
    assert.equal(h.submissions[0].tasks[0].scene, 'unfinished scene');
    assert.ok(h.message.mes.startsWith('[img: historical]'));
});

test('a quiet or preview call during a main reply does not revoke that reply observation', async t => {
    const h = setup(t, '[img: main]');
    api.initChatMessageImages(); await h.begin();
    await host.emit('GENERATION_STARTED', 'quiet', {}, false);
    await host.emit('GENERATION_AFTER_COMMANDS', 'quiet', {}, false);
    await host.emit('MESSAGE_RECEIVED', 0, 'quiet');
    await host.emit('GENERATION_STARTED', 'normal', {}, true);
    await host.emit('GENERATION_AFTER_COMMANDS', 'normal', {}, true);
    await h.receive(); await until(() => h.jobs.size === 0);
    assert.equal(h.requests, 1); assert.equal(api.extractSlotIds(h.message.mes).size, 1);
});

test('disabled drawing observes no tag requests or preparation errors', async t => {
    const h = setup(t, '[img: not enabled]');
    window.xiaobaixDraw.getStatus = () => ({ enabled: false, ready: false });
    api.initChatMessageImages(); await h.begin(); await h.receive(); await tick();
    assert.equal(h.requests, 0); assert.equal(host.errors.length, 0);
    assert.equal(h.message.mes, '[img: not enabled]');
});

async function stageNativeJob(t, h, { active = false } = {}) {
    const tasks = api.parseChatImageTags(h.message.mes).map(tag => ({ scene: tag.tags, placement: { ...tag, mode: 'replace' } }));
    let record;
    await assert.rejects(api.submitPreparedChatImages({ ctx: h.ctx, message: h.message, messageId: 0,
        sourceText: h.message.mes, nativeMessage: true, tasks, backend: true,
        metadata: tasks.map(task => ({ tags: task.scene, positive: task.scene, characterPrompts: [], negativePrompt: '' })),
        run: async ({ recoverable }) => {
            record = await api.recordPendingImageJob({ ...recoverable.plan, jobId: crypto.randomUUID(), provider: 'sd-webui' });
            await recoverable.commitPlacements();
            if (active) await api.markPendingImageJobActive(record.jobId, record.leaseId);
            await api.renewPendingImageJobLease(record.jobId, record.leaseId, { now: 0 });
            throw Object.assign(new Error('page closed'), { detached: true });
        } }), error => error.detached);
    t.after(async () => {
        const current = await api.getPendingImageJob(record.jobId);
        if (current) await api.forgetPendingImageJob(current.jobId, current.leaseId);
    });
    return record;
}

test('cancellation keeps the clicked swipe across an asynchronous journal read', async t => {
    const h = setup(t, '[img: original]');
    const first = await stageNativeJob(t, h, { active: true });
    const original = h.message.mes;
    h.message.swipe_id = 1; h.message.mes = '[img: next]'; h.message.swipes.push(h.message.mes);
    const second = await stageNativeJob(t, h, { active: true });
    const next = h.message.mes;
    h.message.swipe_id = 0; h.message.mes = original;
    const gate = Promise.withResolvers(), calls = [];
    const operation = api.cancelPendingChildDrawRuns(0, { recordsLoader: () => gate.promise,
        imageJobClient: { cancelJob: async id => calls.push(id) } });
    h.message.swipe_id = 1; h.message.mes = next;
    gate.resolve(await api.listPendingImageJobs()); await operation;
    assert.deepEqual(calls, [first.jobId]);
    assert.equal((await api.getPendingImageJob(first.jobId)).cancelRequested, true);
    assert.equal((await api.getPendingImageJob(second.jobId)).cancelRequested, false);
});

test('a settled sibling cannot prevent cancellation of a remaining journal task', async t => {
    const h = setup(t, '[img: first]');
    const first = await stageNativeJob(t, h, { active: true });
    h.message.mes += ' [img: second]';
    const second = await stageNativeJob(t, h, { active: true });
    const records = await api.listPendingImageJobs(), calls = [];
    await api.forgetPendingImageJob(first.jobId, first.leaseId);
    await api.cancelPendingChildDrawRuns(0, { recordsLoader: async () => records,
        imageJobClient: { cancelJob: async id => calls.push(id) } });
    assert.ok(calls.includes(second.jobId));
    assert.equal((await api.getPendingImageJob(second.jobId)).cancelRequested, true);
});

for (const change of ['swipe', 'chat', 'earlier-floor']) test(`queued marker cancellation retains its clicked target after ${change}`, async t => {
    const h = setup(t, 'original');
    api.setDrawRunMarker({ message: h.message, messageId: 0, runId: 'run-cancel-original',
        marker: { provider: 'sd-webui', sourceHash: 'source', targetHash: 'target', createdAt: 1 } });
    const gate = Promise.withResolvers(), entered = Promise.withResolvers();
    const blocker = api.withConfirmableChatMutation(h.ctx, async () => { entered.resolve(); await gate.promise; });
    await entered.promise;
    const requests = [], mirrors = [], saves = [];
    const operation = api.cancelPendingDrawRuns(0, {
        drawRunClient: { cancelRun: async id => requests.push(id) },
        syncActiveSwipe: id => { mirrors.push(id); return true; },
        saveAndConfirm: async () => saves.push(h.ctx.chat.indexOf(h.message)),
    });
    // Install rejection handling before releasing the queued mutation.
    const done = change === 'chat' ? assert.rejects(operation) : operation;
    if (change === 'chat') host.ctx = { ...h.ctx, chatId: 'other-chat', chat: [{ mes: 'other' }] };
    if (change === 'swipe') {
        h.message.swipe_info = [{ extra: structuredClone(h.message.extra) }, { extra: {} }];
        h.message.swipe_id = 1; h.message.swipes.push('other'); h.message.mes = 'other'; h.message.extra = {};
    }
    if (change === 'earlier-floor') {
        h.ctx.chat.unshift({ mes: 'earlier' });
        h.message.swipe_info = [{ extra: h.message.extra }];
    }
    gate.resolve(); await blocker; await done;
    assert.deepEqual(requests, ['run-cancel-original']);
    assert.deepEqual(saves, change === 'chat' ? [] : [change === 'earlier-floor' ? 1 : 0]);
    assert.deepEqual(mirrors, change === 'earlier-floor' ? [1] : []);
    const marker = api.listDrawRunMarkers(h.message).find(entry => entry.runId === 'run-cancel-original');
    assert.equal(Boolean(marker.marker.cancelRequestedAt), change !== 'chat');
    if (change === 'swipe') assert.deepEqual(h.message.extra, {});
});

test('recovered native image jobs are capsule-visible and cancelled by their existing journal identity', async t => {
    const h = setup(t, '[img: recover cancel]');
    const record = await stageNativeJob(t, h, { active: true });
    assert.equal(h.jobs.size, 0);
    assert.equal(record.originRunId, '');
    const state = await api.getPendingDrawWorkState(0);
    assert.equal(state.pending, true); assert.equal(state.backendAccepted, true);
    const cancelled = [];
    assert.equal(await api.cancelPendingChildDrawRuns(0, {
        imageJobClient: { cancelJob: async id => cancelled.push(id) },
        drawRunClient: { cancelRun: () => assert.fail('native images are not a Draw Run') },
    }), true);
    assert.deepEqual(cancelled, [record.jobId]);
    assert.equal((await api.getPendingImageJob(record.jobId)).cancelRequested, true);
    assert.equal((await api.getPendingDrawWorkState(0)).cancelling, true);
    host.ctx = { ...h.ctx, chatId: 'another', chat: [{ mes: h.message.mes }] };
    assert.equal((await api.getPendingDrawWorkState(0)).pending, false);
    assert.equal(await api.cancelPendingChildDrawRuns(0), false);
});

for (const phase of ['before-submit', 'after-submit', 'unknown-submit']) test(`native refresh ${phase} queries existing identity, never purchases again`, async t => {
    const h = setup(t, '[img: recover]');
    const record = await stageNativeJob(t, h, { active: phase === 'after-submit' });
    assert.equal(h.saves, 0);
    let attachments = 0;
    // Simulate loss of an unsaved marker and navigation to a different chat.
    host.ctx = { ...h.ctx, chatId: 'different-chat', chat: [{ mes: 'unrelated' }] };
    api.startImageJobRecovery({ client: {
        listJobs: async () => phase === 'before-submit' ? [] : [{ id: record.jobId }],
        runJob: () => assert.fail('recovery cannot purchase'),
        attachJob: async (id, callbacks) => {
            assert.equal(id, record.jobId); attachments++;
            await callbacks.onItemReady({ index: 0, response: new Response('image') }); return {};
        },
    }, decoders: { 'sd-webui': async () => 'YWJj' } });
    await api.reconcilePendingImageJobs(); api.stopImageJobRecovery();
    assert.equal(attachments, phase === 'before-submit' ? 0 : 1);
    const preview = await api.getPreview(record.items[0].imgId);
    assert.equal(preview.status, phase === 'before-submit' ? 'failed' : 'success');
    assert.equal(preview.chatId, h.ctx.chatId);
    assert.equal(host.ctx.chat[0].mes, 'unrelated');
    assert.equal(await api.getPendingImageJob(record.jobId), null);
});

test('native recovery selects its surviving slot after an earlier swipe is deleted', async t => {
    const h = setup(t, '[img: shifted branch]');
    h.message.swipes.unshift('earlier'); h.message.swipe_id = 1;
    const record = await stageNativeJob(t, h, { active: true });
    h.message.swipes.splice(0, 1); h.message.swipe_id = 0;
    let attachments = 0;
    api.startImageJobRecovery({ client: {
        listJobs: async () => [{ id: record.jobId }],
        runJob: () => assert.fail('recovery cannot purchase'),
        attachJob: async (id, callbacks) => {
            assert.equal(id, record.jobId); attachments++;
            await callbacks.onItemReady({ index: 0, response: new Response('image') }); return {};
        },
    }, decoders: { 'sd-webui': async () => 'YWJj' } });
    await api.reconcilePendingImageJobs(); api.stopImageJobRecovery();
    assert.equal(attachments, 1);
    const { slotId, imgId } = record.items[0];
    assert.equal(await api.getSlotSelection(slotId), imgId);
    assert.equal((await api.getPreview(imgId)).status, 'success');
    assert.equal(h.root.querySelector('img')?.closest('[data-slot-id]')?.dataset.slotId, slotId);
    assert.equal(await api.getPendingImageJob(record.jobId), null);
});

test('durable explicit item deletion overrides native gallery retention after refresh', async t => {
    const h = setup(t, '[img: discard] [img: keep]');
    const record = await stageNativeJob(t, h, { active: true });
    await api.renderPreviewsForMessage(0);
    await api.removeChatImageSlot(h.root.querySelector(`[data-slot-id="${record.items[0].slotId}"]`));
    assert.equal((await api.getPendingImageJob(record.jobId)).items[0].discarded, true);
    api.startImageJobRecovery({ client: {
        listJobs: async () => [{ id: record.jobId }],
        attachJob: async (_id, callbacks) => {
            for (const item of record.items) await callbacks.onItemReady({ index: item.index, response: new Response('image') });
            return {};
        },
    }, decoders: { 'sd-webui': async () => 'YWJj' } });
    await api.reconcilePendingImageJobs(); api.stopImageJobRecovery();
    assert.ok(!await api.getPreview(record.items[0].imgId));
    assert.equal((await api.getPreview(record.items[1].imgId)).status, 'success');
    assert.deepEqual([...api.extractSlotIds(h.message.mes)], [record.items[1].slotId]);
});

test('native recovery does not acknowledge an unstored result and reattaches the same request after storage recovers', async t => {
    const warnings = t.mock.method(console, 'warn', () => {});
    const h = setup(t, '[img: storage recovery]');
    const record = await stageNativeJob(t, h, { active: true });
    let failStorage = true, attachments = 0, acknowledgements = 0;
    const put = IDBObjectStore.prototype.put;
    t.mock.method(IDBObjectStore.prototype, 'put', function (...args) {
        const result = put.apply(this, args);
        if (failStorage && this.name === 'previews' && args[0].status === 'success') this.transaction.abort();
        return result;
    });
    api.startImageJobRecovery({ client: {
        listJobs: async () => [{ id: record.jobId }],
        attachJob: async (id, callbacks) => {
            assert.equal(id, record.jobId); attachments++;
            try { await callbacks.onItemReady({ index: 0, response: new Response('image') }); }
            catch (error) { return { deliveryErrors: new Map([[0, error]]) }; }
            assert.equal((await api.getPreview(record.items[0].imgId)).status, 'success');
            acknowledgements++; return {};
        },
    }, decoders: { 'sd-webui': async () => 'YWJj' } });
    await api.reconcilePendingImageJobs();
    assert.equal(acknowledgements, 0); assert.ok(await api.getPendingImageJob(record.jobId));
    failStorage = false;
    await api.reconcilePendingImageJobs(); api.stopImageJobRecovery();
    assert.ok(attachments >= 2); assert.equal(acknowledgements, 1);
    assert.ok(warnings.mock.calls.length > 0);
    assert.equal(await api.getPendingImageJob(record.jobId), null);
});

test('legacy cache hit imports the exact old cache identity without calling generation', async t => {
    const h = setup(t, '[img: cached]', { legacy: true });
    const facade = window.xiaobaixDraw;
    const prepare = facade.prepareGeneration;
    facade.prepareGeneration = input => ({ ...prepare(input), execute: async () => 'YWJj' });
    await api.generateSharedImage({ prompt: 'cached', cacheNamespace: 'fourth-wall' });
    facade.prepareGeneration = prepare;
    await api.ensureChatImageTagFormat(h.ctx);
    await api.renderPreviewsForMessage(0);
    assert.equal(h.root.querySelectorAll('img').length, 1);
    assert.equal(h.requests, 0);
});

test('legacy read error aborts migration without marker or metadata writes and without generation', async t => {
    const h = setup(t, '[img: old]', { legacy: true }); h.cacheReadsFail = true;
    await assert.rejects(api.ensureChatImageTagFormat(h.ctx));
    assert.equal(h.message.mes, '[img: old]');
    assert.equal(h.ctx.chatMetadata[api.CHAT_IMAGE_TAG_FORMAT_KEY], undefined);
    assert.equal(h.requests, 0); assert.equal(h.saves, 0);
});

test('new chat format registration does not migrate or claim its first new tags', async t => {
    const h = setup(t, '[img: first]', { legacy: true });
    api.markFreshImageTagChat(h.ctx);
    await api.ensureChatImageTagFormat(h.ctx);
    assert.equal(h.message.mes, '[img: first]'); assert.equal(h.requests, 0);
    assert.equal(h.ctx.chatMetadata[api.CHAT_IMAGE_TAG_FORMAT_KEY], api.CHAT_IMAGE_TAG_FORMAT_VERSION);
});

test('migration identity follows chat metadata when SillyTavern reuses its chat array', async t => {
    const h = setup(t, '[img: old a]', { legacy: true });
    await api.ensureChatImageTagFormat(h.ctx);
    h.ctx.chatId = 'other-chat';
    h.ctx.chatMetadata = {};
    h.ctx.chat.splice(0, 1, { name: 'Bob', mes: '[img: old b]', extra: {} });
    await api.ensureChatImageTagFormat(h.ctx);
    assert.match(h.ctx.chat[0].mes, /^\[image:/);
    assert.equal(h.requests, 0);
});

test('SillyTavern 1.14 group metadata is confirmed from its group record, not a nonexistent chat header', async t => {
    const h = setup(t, '[img: old group]', { legacy: true });
    let savedChat, savedGroup;
    h.ctx.groupId = 'group-114';
    h.ctx.saveChat = async () => { savedChat = structuredClone(h.ctx.chat); };
    h.ctx.saveMetadata = async () => { savedGroup = { id: h.ctx.groupId, chat_id: h.ctx.chatId,
        chat_metadata: structuredClone(h.ctx.chatMetadata) }; };
    globalThis.fetch = async url => new Response(JSON.stringify(url === '/api/groups/all' ? [savedGroup] : savedChat));
    await api.ensureChatImageTagFormat(h.ctx);
    assert.equal(savedGroup.chat_metadata[api.CHAT_IMAGE_TAG_FORMAT_KEY], api.CHAT_IMAGE_TAG_FORMAT_VERSION);
    assert.match(savedChat[0].mes, /^\[image:/);
    assert.equal(h.requests, 0);
});

test('editing or swiping before placement cannot overwrite user changes', async t => {
    const h = setup(t, '[img: original]');
    const input = { ctx: h.ctx, message: h.message, messageId: 0, sourceText: h.message.mes,
        tasks: [{ scene: 'original', characterPrompts: [], placement: { mode: 'replace', start: 0, end: 15, marker: h.message.mes } }] };
    h.message.mes = 'user edit';
    await assert.rejects(api.generatePreparedChatImages('novelai', input));
    assert.equal(h.message.mes, 'user edit'); assert.equal(h.requests, 0);
});

test('switching branch during save stops submission and preserves both branch texts', async t => {
    const h = setup(t, '[img: branch]');
    h.message.swipes.push('alternate');
    h.onSave = () => { h.message.swipe_id = 1; h.message.mes = 'alternate'; };
    api.initChatMessageImages(); await until(() => h.root.querySelector('[data-action="generate-tag"]'));
    h.generateTag(); await until(() => host.errors.length > 0);
    assert.equal(h.message.mes, 'alternate');
    assert.match(h.message.swipes[0], /^\[image:/);
    assert.equal(h.requests, 0);
});

test('local delivery after navigation retains original gallery ownership despite a reused host array', async t => {
    const h = setup(t, '[img: original]'); h.hold = true;
    api.initChatMessageImages(); await h.begin(); await h.receive(); await until(() => h.requests === 1);
    const sourceId = h.ctx.chatId;
    const slot = h.message.mes.match(/\[image:([^\]]+)\]/)[1];
    host.ctx = { ...h.ctx, chatId: 'next', chatMetadata: {} };
    h.ctx.chat.splice(0, 1, { mes: 'next chat', name: 'Bob' });
    h.finish();
    await until(async () => (await api.getDisplayPreviewForSlot(slot)).hasData);
    const record = (await api.getDisplayPreviewForSlot(slot)).preview;
    assert.equal(record.chatId, sourceId);
    assert.equal(host.ctx.chat[0].mes, 'next chat');
});

test('deleting the selected image clears only its own selection', async t => {
    setup(t, '[image:delete-selection]');
    await api.storePreview({ slotId: 'delete-selection', imgId: 'selection-image', base64: 'YWJj', tags: 'x', messageId: 0 });
    await api.setSlotSelection('delete-selection', 'selection-image');
    await api.deletePreview('selection-image');
    assert.equal(await api.getSlotSelection('delete-selection'), null);
});

test('aborted TAG edit does not change card text, image or stored metadata', async t => {
    const h = setup(t, '[image:abort-edit]');
    await api.storePreview({ slotId: 'abort-edit', imgId: 'abort-img', base64: 'YWJj', tags: 'old',
        messageId: 0, characterPrompts: [], negativePrompt: 'negative' });
    await api.renderPreviewsForMessage(0);
    const card = h.root.querySelector('.xb-nd-img');
    card.querySelector('textarea').value = 'new';
    const put = IDBObjectStore.prototype.put;
    t.mock.method(IDBObjectStore.prototype, 'put', function (value, ...args) {
        if (value.imgId === 'abort-img') { this.transaction.abort(); return; }
        return put.call(this, value, ...args);
    });
    await assert.rejects(api.persistCardTagEdits(card, tags => ({ positive: tags })));
    assert.equal(card.dataset.tags, 'old');
    const record = await api.getPreview('abort-img');
    assert.equal(record.tags, 'old'); assert.equal(record.base64, 'YWJj'); assert.equal(record.negativePrompt, 'negative');
});

test('aborted legacy IndexedDB read is not treated as a cache miss or a generation request', async t => {
    const h = setup(t, '[img: cache failure]', { legacy: true });
    const get = IDBObjectStore.prototype.get;
    t.mock.method(IDBObjectStore.prototype, 'get', function (...args) {
        const request = get.apply(this, args);
        if (this.name === 'images') this.transaction.abort();
        return request;
    });
    await assert.rejects(api.ensureChatImageTagFormat(h.ctx));
    assert.equal(h.message.mes, '[img: cache failure]');
    assert.equal(h.ctx.chatMetadata[api.CHAT_IMAGE_TAG_FORMAT_KEY], undefined);
    assert.equal(h.saves, 0); assert.equal(h.requests, 0);
});

test('editing a saved card after preview cache loss keeps its saved image reference', async t => {
    const h = setup(t, '[image:saved-editor]');
    h.message.extra.xiaobaixDrawSaved = { 'saved-editor': { imgId: 'saved-editor-image', tags: 'old', savedUrl: '/existing-image.png' } };
    await api.renderPreviewsForMessage(0);
    const card = h.root.querySelector('.xb-nd-img');
    card.querySelector('textarea').value = 'changed';
    await api.persistCardTagEdits(card, tags => ({ positive: tags }));
    assert.equal((await api.getPreview('saved-editor-image')).savedUrl, '/existing-image.png');
    h.format(); await api.renderPreviewsForMessage(0);
    assert.equal(h.root.querySelector('.xb-nd-img').dataset.tags, 'changed');
    assert.equal(h.root.querySelector('img').getAttribute('src'), '/existing-image.png');
});

async function registerHeldRedraw(t, h, { oldImage = true, saved = true, cancelled = false } = {}) {
    const slotId = api.extractSlotIds(h.message.mes).values().next().value;
    const oldId = `${slotId}-old`;
    if (saved) h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId: oldId, savedUrl: '/old.png', tags: 'old' } };
    if (oldImage) {
        await api.storePreview({ slotId, imgId: oldId, tags: 'old', base64: 'YWJj', messageId: 0 });
        await api.setSlotSelection(slotId, oldId);
    }
    await h.ctx.saveChat();
    // Use the production prepared executor to create the local delivery plan;
    // the simulated backend pauses before delivering anything.
    let record;
    await assert.rejects(api.submitPreparedChatImages({ ctx: h.ctx, message: h.message, messageId: 0,
        sourceText: h.message.mes, tasks: [{ scene: 'new', placement: { mode: 'existing', slotId } }],
        metadata: [{ tags: 'new', positive: 'new', characterPrompts: [], negativePrompt: '' }], backend: true,
        run: async ({ recoverable }) => {
            record = await api.recordPendingImageJob({ ...recoverable.plan, jobId: `job-${slotId}`, provider: 'sd-webui' });
            await recoverable.commitPlacements();
            await api.markPendingImageJobActive(record.jobId, record.leaseId);
            if (cancelled) await api.markPendingImageJobCancelling(record.jobId, record.leaseId);
            await api.renewPendingImageJobLease(record.jobId, record.leaseId, { now: 0 });
            throw Object.assign(new Error('page detached'), { detached: true });
        } }), error => error.detached === true);
    t.after(async () => {
        const current = await api.getPendingImageJob(record.jobId);
        if (current) await api.forgetPendingImageJob(current.jobId, current.leaseId);
    });
    return { slotId, oldId, imgId: record.items[0].imgId, record };
}

test('refresh with an existing image and active redraw shows pending and cannot resubmit through a stale card', async t => {
    const h = setup(t, '[image:refresh-redraw]');
    const job = await registerHeldRedraw(t, h);
    h.format(); await api.renderPreviewsForMessage(0);
    assert.equal(h.root.querySelector('[data-state="pending"]')?.dataset.slotId, job.slotId);
    await api.redrawImageCard('novelai', { dataset: { slotId: job.slotId, imgId: job.oldId, mesid: '0', tags: 'old' } });
    assert.equal(h.submissions.length, 0);
    assert.ok(await api.getPendingImageJob(job.record.jobId));
});

test('journal read failure never authorizes another redraw', async t => {
    const h = setup(t, '[image:unreadable-journal]');
    const reports = t.mock.method(console, 'error', () => {});
    const getAll = IDBObjectStore.prototype.getAll;
    t.mock.method(IDBObjectStore.prototype, 'getAll', function (...args) {
        const request = getAll.apply(this, args);
        if (this.name === 'jobs') this.transaction.abort();
        return request;
    });
    await assert.rejects(api.redrawImageCard('novelai', { dataset: {
        slotId: 'unreadable-journal', mesid: '0', tags: 'scene',
    } }));
    assert.equal(h.submissions.length, 0);
    assert.ok(reports.mock.calls.length > 0);
});

test('already delivered item remains visible while its journal is awaiting final settlement', async t => {
    const h = setup(t, '[image:delivered-pending-settlement]');
    const job = await registerHeldRedraw(t, h);
    await api.storePreview({ slotId: job.slotId, imgId: job.imgId, base64: 'ZGVm', tags: 'new', messageId: 0 });
    await api.setSlotSelection(job.slotId, job.imgId);
    h.format(); await api.renderPreviewsForMessage(0);
    assert.ok(h.root.querySelector('img'));
    assert.equal(h.root.querySelector('.xb-nd-img').dataset.imgId, job.imgId);
    assert.ok(await api.getPendingImageJob(job.record.jobId));
});

for (const oldImage of [true, false]) test(`cancel recovery retains existing slot and editable input${oldImage ? ' with old image' : ' after old cache expired'}`, async t => {
    const h = setup(t, `[image:cancel-redraw-${oldImage}]`);
    const source = h.message.mes;
    const job = await registerHeldRedraw(t, h, { oldImage, cancelled: true });
    api.startImageJobRecovery({ client: { listJobs: async () => [] } });
    await api.reconcilePendingImageJobs(); api.stopImageJobRecovery();
    assert.equal(h.message.mes, source);
    assert.equal(h.message.swipes[0], source);
    assert.equal(h.persisted[1].mes, source);
    assert.equal(await api.getPendingImageJob(job.record.jobId), null);
    const interrupted = await api.getPreview(job.imgId);
    assert.equal(interrupted.status, 'failed');
    assert.equal(interrupted.tags, 'new');
    assert.deepEqual(interrupted.characterPrompts, []);
    assert.equal(interrupted.negativePrompt, '');
    assert.equal(h.root.querySelector('.xb-nd-img').dataset.imgId, job.imgId);
    if (oldImage) {
        assert.ok((await api.getPreview(job.oldId)).base64);
        assert.equal(await api.restoreImageCard(h.root.querySelector('.xb-nd-img')), true);
        assert.equal(h.root.querySelector('.xb-nd-img').dataset.imgId, job.oldId);
    }
    assert.equal(h.requests, 0);
});

test('recovered redraw selects and displays its new image over the old saved reference', async t => {
    const h = setup(t, '[image:recovered-version]');
    const job = await registerHeldRedraw(t, h);
    api.startImageJobRecovery({ client: {
        listJobs: async () => [{ id: job.record.jobId }],
        attachJob: async (_id, handlers) => {
            await handlers.onItemReady({ index: 0, response: new Response('simulated image') });
            return {};
        },
    }, decoders: { 'sd-webui': async () => 'ZGVm' } });
    await api.reconcilePendingImageJobs(); api.stopImageJobRecovery();
    assert.equal(await api.getSlotSelection(job.slotId), job.imgId);
    assert.equal(await api.getPendingImageJob(job.record.jobId), null);
    h.format(); await api.renderPreviewsForMessage(0);
    assert.equal(h.root.querySelector('.xb-nd-img').dataset.imgId, job.imgId);
    assert.notEqual(h.root.querySelector('img').getAttribute('src'), '/old.png');
});

test('redraw completed in another chat is selected on return without writing the current chat', async t => {
    const h = setup(t, '[image:detached-redraw]');
    const slotId = 'detached-redraw';
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId: 'detached-old', savedUrl: '/old.png', tags: 'old' } };
    await api.storePreview({ slotId, imgId: 'detached-old', tags: 'old', base64: 'YWJj', messageId: 0 });
    await api.setSlotSelection(slotId, 'detached-old');
    await h.ctx.saveChat();
    await api.renderPreviewsForMessage(0);
    h.hold = true;
    const operation = api.redrawImageCard('novelai', h.root.querySelector('.xb-nd-img'));
    await until(() => h.requests === 1);
    const sourceId = h.ctx.chatId;
    const originalSaved = h.persisted[1];
    let wrongChatSaves = 0;
    host.ctx = { ...h.ctx, chatId: 'other-chat', chatMetadata: {}, saveChat: async () => { wrongChatSaves++; } };
    h.ctx.chat.splice(0, 1, { name: 'Bob', mes: 'unrelated chat' });
    h.finish(); await operation;
    assert.equal(wrongChatSaves, 0);
    assert.equal(host.ctx.chat[0].mes, 'unrelated chat');
    const selected = await api.getSlotSelection(slotId);
    assert.notEqual(selected, 'detached-old');
    assert.equal((await api.getPreview(selected)).chatId, sourceId);
    // Returning loads the server's original saved reference, not the detached
    // in-memory message. The explicit gallery selection must still win.
    host.ctx = h.ctx;
    h.ctx.chat.splice(0, 1, originalSaved);
    h.root.textContent = originalSaved.mes;
    await api.renderPreviewsForMessage(0);
    assert.equal(h.root.querySelector('.xb-nd-img').dataset.imgId, selected);
    assert.notEqual(h.root.querySelector('img').getAttribute('src'), '/old.png');
});

test('saved selected image remains available after its preview cache expires', async t => {
    const h = setup(t, '[image:saved-fallback]');
    h.message.extra.xiaobaixDrawSaved = { 'saved-fallback': { imgId: 'saved-only', savedUrl: '/saved.png', tags: 'saved' } };
    await api.setSlotSelection('saved-fallback', 'saved-only');
    await api.renderPreviewsForMessage(0);
    assert.equal(h.root.querySelector('img').getAttribute('src'), '/saved.png');
    assert.equal(h.root.querySelector('.xb-nd-img').dataset.imgId, 'saved-only');
});

const coldSwipeFixture = JSON.parse(await readFile(new URL(
    '../../../../integrations/tauritavern/tests/fixtures/cold-swipes-2.3.json', import.meta.url,
), 'utf8'));

function setupColdChat(t) {
    const h = setup(t, 'current body', { legacy: true });
    const original = structuredClone(coldSwipeFixture.original);
    original.swipes[0] += ' [img: historic image]';
    Object.assign(h.message, original, structuredClone(coldSwipeFixture.projection));
    return { h, original };
}

test('Tauri cold historical branch is migrated before version commit and never auto-generated on first opening', async t => {
    const { h, original } = setupColdChat(t);
    let hydrationCalls = 0;
    api.configureChatImageTagMigration({ prepareBranches: ctx => prepareTauriTavernDrawBranches(ctx, async () => ({
        hydrateMessageSwipes: async message => {
            hydrationCalls++;
            for (const key of ['swipes', 'swipe_info']) original[key].forEach((value, i) => { message[key][i] ??= value; });
            delete message.tt_swipe_cold;
        },
    })) });
    await api.ensureChatImageTagFormat(h.ctx);
    assert.equal(hydrationCalls, 1);
    assert.equal(h.message.mes, original.mes);
    const slots = api.extractSlotIds(h.message.swipes[0]);
    assert.equal(slots.size, 1);
    const preview = (await api.getPreviewsBySlot([...slots][0]))[0];
    assert.equal(preview.tags, 'historic image');
    assert.equal(preview.status, 'failed');
    assert.equal(h.persisted[0].chat_metadata[api.CHAT_IMAGE_TAG_FORMAT_KEY], api.CHAT_IMAGE_TAG_FORMAT_VERSION);
    assert.equal(h.persisted[1].swipes[0], h.message.swipes[0]);
    h.message.swipe_id = 0; h.message.mes = h.message.swipes[0]; h.format();
    api.initChatMessageImages(); await tick(); await tick();
    assert.equal(h.observed.size, 0);
    assert.equal(h.requests, 0);
});

test('cold swipe read failure leaves migration and requests uncommitted', async t => {
    const { h } = setupColdChat(t);
    api.configureChatImageTagMigration({ prepareBranches: ctx => prepareTauriTavernDrawBranches(ctx, async () => ({
        hydrateMessageSwipes: async () => { throw new Error('cold source unavailable'); },
    })) });
    await assert.rejects(api.ensureChatImageTagFormat(h.ctx));
    assert.equal(h.ctx.chatMetadata[api.CHAT_IMAGE_TAG_FORMAT_KEY], undefined);
    assert.equal(h.message.swipes[0], null);
    assert.equal(h.saves, 0); assert.equal(h.requests, 0);
});

test('navigating while hydrating old branches never marks the next chat migrated', async t => {
    const { h } = setupColdChat(t);
    api.configureChatImageTagMigration({ prepareBranches: async () => {
        host.ctx = { ...h.ctx, chatId: 'next-cold-chat', chatMetadata: {} };
        h.ctx.chat.splice(0, 1, { name: 'Bob', mes: '[img: next chat]' });
    } });
    await assert.rejects(api.ensureChatImageTagFormat(h.ctx));
    assert.equal(host.ctx.chatMetadata[api.CHAT_IMAGE_TAG_FORMAT_KEY], undefined);
    assert.equal(host.ctx.chat[0].mes, '[img: next chat]');
    assert.equal(h.saves, 0); assert.equal(h.requests, 0);
});
