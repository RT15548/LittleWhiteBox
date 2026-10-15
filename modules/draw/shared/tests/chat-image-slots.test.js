import assert from 'node:assert/strict';
import test from 'node:test';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { setImmediate } from 'node:timers';
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
    'user.js': 'export const getCurrentUserHandle = () => "fixture";',
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
        'draw-run-controls', 'draw-run-activity', 'draw-run-markers', 'confirmable-chat-save', 'slot-activity',
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
    window.HTMLImageElement.prototype.decode = async () => {};
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
    let stateHook;
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
        getCurrentContext: () => host.ctx, setStateForMessage: (_id, state, data) => { states.push({ state, data }); stateHook?.(state, data); },
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
        generateTag() { root.querySelector('[data-xb-draw-tag-action]').click(); },
        get saves() { return saves; }, get requests() { return responses; },
        set hold(value) { hold = value; }, finish() { for (const deliver of deliveries.splice(0)) deliver(); },
        set saveMode(value) { saveMode = value; }, set cacheReadsFail(value) { cacheReadsFail = value; },
        set onSave(value) { onSave = value; },
        set prepareBarrier(value) { prepareBarrier = value; },
        set stateHook(value) { stateHook = value; },
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
    await until(() => h.root.querySelectorAll('[data-xb-draw-tag-action]').length === 2);
    assert.equal(h.requests, 0);
    h.generateTag();
    await until(() => h.root.querySelectorAll('.xb-nd-img img').length === 1);
    // Visible delivery precedes floor-batch release. This test purchases the
    // next historical tag only after the unchanged floor exclusion permits it.
    await until(() => h.jobs.size === 0);
    assert.ok(h.message.mes.includes('[img: later]'));
    api.cleanupChatMessageImages(); h.format(); api.initChatMessageImages();
    await until(() => h.root.querySelectorAll('[data-xb-draw-tag-action]').length === 1);
    assert.equal(h.requests, 1);
    h.generateTag();
    await until(() => h.requests === 2);
    await until(() => !h.message.mes.includes('[img:'));
});

test('native tag handoff never exposes markers or rebuilds live sibling content', async t => {
    const h = setup(t, 'Before [img: first] middle [img: second] after');
    h.hold = true;
    api.initChatMessageImages();
    await h.begin();
    await until(() => h.root.querySelectorAll('[data-xb-draw-tag="streaming"]').length === 2);
    const iframe = document.createElement('iframe');
    h.root.append(iframe);
    await tick();
    const frames = [];
    const observer = new MutationObserver(() => frames.push({
        raw: /\[(?:img|image)\s*:/.test(h.root.textContent),
        cards: h.root.querySelectorAll('.xb-nd-img').length,
        sameFrame: h.root.contains(iframe),
    }));
    observer.observe(h.root, { childList: true, subtree: true, characterData: true });
    t.after(() => observer.disconnect());
    await h.receive();
    await until(() => h.requests === 1);
    await until(() => h.root.querySelectorAll('.xb-nd-img[data-slot-id]:not([data-slot-id=""])').length === 2);
    h.finish();
    await until(() => h.root.querySelectorAll('.xb-nd-img img').length === 2);
    assert.ok(frames.length > 0);
    assert.deepEqual(frames.filter(frame => frame.raw || frame.cards !== 2 || !frame.sameFrame), []);
    assert.equal(h.requests, 1);
});

for (const retry of [false, true]) for (const saveMode of ['ok', 'uncertain']) {
    test(`manual tag handoff keeps cards and live siblings through delayed ${saveMode} save (retry: ${retry})`, async t => {
        const h = setup(t, '[img: same] and [img: same]');
        api.initChatMessageImages();
        if (retry) {
            h.prepareBarrier = () => { throw new Error('preparation rejected'); };
            await h.begin(); await h.receive();
            await until(() => h.root.querySelectorAll('[data-xb-draw-tag="failed"]').length === 2);
            h.prepareBarrier = async () => {};
        } else await until(() => h.root.querySelectorAll('[data-xb-draw-tag-action]').length === 2);
        const iframe = document.createElement('iframe');
        h.root.append(iframe);
        const gate = Promise.withResolvers();
        h.onSave = () => gate.promise;
        h.saveMode = saveMode;
        const frames = [];
        const observer = new MutationObserver(() => frames.push({
            raw: /\[(?:img|image)\s*:/.test(h.root.textContent),
            cards: h.root.querySelectorAll('.xb-nd-img').length,
            sameFrame: h.root.contains(iframe),
        }));
        observer.observe(h.root, { childList: true, subtree: true, characterData: true });
        t.after(() => { gate.resolve(); observer.disconnect(); });
        h.generateTag();
        await until(() => h.saves === 1);
        api.refreshChatMessageImages();
        await tick();
        assert.equal(h.requests, 0, 'no supplier request before save confirmation');
        assert.equal(h.root.querySelectorAll('.xb-nd-img').length, 2);
        assert.equal(/\[(?:img|image)\s*:/.test(h.root.textContent), false);
        gate.resolve();
        if (saveMode === 'ok') await until(() => h.root.querySelector('.xb-nd-img img'));
        else await until(() => h.root.querySelector('.xb-nd-img[data-state="failed"]'));
        await until(() => h.jobs.size === 0);
        assert.equal(h.requests, saveMode === 'ok' ? 1 : 0);
        assert.equal(api.parseChatImageTags(h.message.mes).length, 1);
        assert.equal(api.extractSlotIds(h.message.mes).size, 1);
        assert.ok(frames.length > 0);
        assert.deepEqual(frames.filter(frame => frame.raw || frame.cards !== 2 || !frame.sameFrame), []);
    });
}

test('unchanged tag projections retain manual controls and use the current source on click', async t => {
    const h = setup(t, '[img: first] and [img: second]');
    api.initChatMessageImages();
    await until(() => h.root.querySelectorAll('[data-xb-draw-tag-action]').length === 2);
    const cards = [...h.root.querySelectorAll('.xb-nd-img')];
    const button = cards[0].querySelector('button');
    h.message.mes += ' appended prose';
    h.root.append(document.createTextNode(' appended prose'));
    await host.emit('MESSAGE_UPDATED', 0);
    await tick();
    assert.equal(h.root.querySelectorAll('.xb-nd-img').length, cards.length);
    assert.ok([...h.root.querySelectorAll('.xb-nd-img')].every((card, index) => card === cards[index]));
    assert.ok(cards[0].querySelector('button') === button);
    button.click();
    await until(() => h.requests === 1);
    await until(() => h.root.querySelector('.xb-nd-img img'));
    assert.equal(h.message.mes.endsWith(' appended prose'), true);
    assert.deepEqual(host.errors, []);
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
    api.initChatMessageImages(); await until(() => h.root.querySelector('[data-xb-draw-tag-action]'));
    const iframe = document.createElement('iframe');
    h.root.append(iframe);
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
    assert.ok(h.root.contains(iframe));
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

function markSlotBusy(t, slotId) {
    const owner = {};
    api.setSlotActivity(slotId, { index: 0, total: 1, phase: 'generating', label: '生成', owner, discard() {} });
    t.after(() => api.clearSlotActivity(slotId, owner));
}

// 图库（IndexedDB）在本文件的所有测试间共享，每个测试必须使用自己的格子名。
async function storeFailedSlots(h, prefix, slots, status = 'failed') {
    for (const [name, tags] of slots) {
        await api.storePreview({ slotId: `${prefix}-${name}`, imgId: `${prefix}-${name}-img`, messageId: 0, tags, positive: tags,
            characterPrompts: [{ prompt: `${tags} char`, uc: '', center: { x: 0.5, y: 0.5 } }],
            negativePrompt: `neg ${tags}`, postPrompt: `tail ${tags}`, status, errorType: 'failed', errorMessage: 'supplier rejected' });
    }
    h.format();
    await api.renderPreviewsForMessage(0);
}
const floorSource = (prefix, names) => names.map(name => `[image:${prefix}-${name}]`).join(' ');
const failedCards = h => [...h.root.querySelectorAll('.xb-nd-img[data-state="failed"]')];

test('failed cards keep single redraw primary and floor-wide actions collapsed', async t => {
    const h = setup(t, floorSource('fr1', ['a', 'b']));
    await storeFailedSlots(h, 'fr1', [['a', 'tag a'], ['b', 'tag b']]);
    assert.equal(failedCards(h).length, 2);
    for (const card of failedCards(h)) {
        const retry = card.querySelector('[data-action="retry-image"]');
        assert.ok(retry);
        assert.equal(retry.closest('details'), null);
        for (const action of ['retry-floor-failed', 'edit-tags', 'remove-placeholder']) {
            const menu = card.querySelector(`[data-action="${action}"]`).closest('details');
            assert.ok(menu);
            assert.equal(menu.hasAttribute('open'), false);
        }
    }
});

test('floor-wide redraw submits every failed card of the floor as one batch with its own saved prompts', async t => {
    const h = setup(t, floorSource('fr2', ['a', 'b', 'c']));
    await storeFailedSlots(h, 'fr2', [['a', 'tag a'], ['b', 'tag b']]);
    await api.storePreview({ slotId: 'fr2-c', imgId: 'fr2-c-img', messageId: 0, tags: 'tag c', positive: 'tag c', base64: 'YWJj' });
    h.format(); await api.renderPreviewsForMessage(0);
    const failed = failedCards(h);
    assert.equal(failed.length, 2);

    const result = await api.redrawFloorFailedImageCards('novelai', failed[1]);
    assert.deepEqual(result, { submitted: 2, skipped: 0 });
    assert.equal(h.submissions.length, 1);
    const tasks = h.submissions[0].tasks;
    assert.deepEqual(tasks.map(task => task.placement), [
        { mode: 'existing', slotId: 'fr2-a' }, { mode: 'existing', slotId: 'fr2-b' },
    ]);
    assert.deepEqual(tasks.map(task => task.scene), ['tag a', 'tag b']);
    assert.deepEqual(tasks.map(task => task.negativePrompt), ['neg tag a', 'neg tag b']);
    assert.deepEqual(tasks.map(task => task.post_prompt), ['tail tag a', 'tail tag b']);
    assert.equal(tasks[0].characterPrompts[0].prompt, 'tag a char');
    assert.equal(h.requests, 1);
    assert.equal(h.root.querySelectorAll('.xb-nd-img img').length, 3);
    assert.equal(failedCards(h).length, 0);
    assert.equal(h.message.mes, floorSource('fr2', ['a', 'b', 'c']));
});

test('floor-wide redraw includes result-unknown cards and skips cards that are already running', async t => {
    const h = setup(t, floorSource('fr3', ['a', 'b', 'c']));
    await storeFailedSlots(h, 'fr3', [['a', 'tag a'], ['c', 'tag c']]);
    // “绘图结果未知”与失败同属失败状态，默认一并重新生成。
    await storeFailedSlots(h, 'fr3', [['b', 'tag b']], 'unknown');
    const cards = failedCards(h);
    assert.equal(cards.length, 3);
    markSlotBusy(t, 'fr3-c');
    const result = await api.redrawFloorFailedImageCards('novelai', cards[0]);
    assert.deepEqual(result, { submitted: 2, skipped: 1 });
    assert.deepEqual(h.submissions[0].tasks.map(task => task.placement.slotId), ['fr3-a', 'fr3-b']);
});

test('floor-wide redraw ignores a second click while the first is still running and never double-submits', async t => {
    const h = setup(t, floorSource('fr4', ['a', 'b'])); h.hold = true;
    await storeFailedSlots(h, 'fr4', [['a', 'tag a'], ['b', 'tag b']]);
    const card = failedCards(h)[0];
    const first = api.redrawFloorFailedImageCards('novelai', card);
    const second = api.redrawFloorFailedImageCards('novelai', card);
    assert.equal(first, second);
    await until(() => h.requests === 1);
    // 整楼重生期间，对其中某一张再点单张“重新生成”同样被挡住：拿到的是同一批的进行中结果，不会新提交。
    const single = api.redrawImageCard('novelai', card);
    await tick();
    assert.equal(h.submissions.length, 1);
    h.finish();
    await Promise.all([first, single]);
    assert.equal(h.submissions.length, 1);
    assert.equal(h.requests, 1);
});

test('a redraw queues behind a running job on the same floor instead of failing as busy', async t => {
    const h = setup(t, floorSource('fr5', ['a', 'b'])); h.hold = true;
    t.after(() => { h.hold = false; h.finish(); });
    await storeFailedSlots(h, 'fr5', [['a', 'tag a'], ['b', 'tag b']]);
    const [cardA, cardB] = failedCards(h);
    const firstRedraw = api.redrawImageCard('novelai', cardA);
    await until(() => h.requests === 1);
    assert.ok(h.jobs.size >= 1);
    // 同楼层已有任务：以前这里会抛“该楼层已有任务进行中”。
    const second = api.redrawImageCard('novelai', cardB);
    await until(() => h.submissions.length === 2);
    h.finish();
    await until(() => h.requests === 2);
    h.finish();
    await Promise.all([firstRedraw, second]);
    assert.equal(h.submissions.length, 2);
    assert.equal(h.root.querySelectorAll('.xb-nd-img img').length, 2);
    assert.equal(h.jobs.size, 0);
});

test('the whole-floor redraw reports when there is nothing to redraw', async t => {
    const h = setup(t, floorSource('fr6', ['a']));
    await storeFailedSlots(h, 'fr6', [['a', 'tag a']]);
    const card = failedCards(h)[0];
    markSlotBusy(t, 'fr6-a');
    const result = await api.redrawFloorFailedImageCards('novelai', card);
    assert.deepEqual(result, { submitted: 0, skipped: 1 });
    assert.equal(h.submissions.length, 0);
});

test('a single redraw during the whole-floor collection phase joins the floor operation instead of double-submitting', async t => {
    const h = setup(t, floorSource('fr7', ['a', 'b']));
    await storeFailedSlots(h, 'fr7', [['a', 'tag a'], ['b', 'tag b']]);
    const [cardA, cardB] = failedCards(h);
    const floor = api.redrawFloorFailedImageCards('novelai', cardA);
    // 此刻整楼重生还停在收集阶段（逐格 await 读取记录），尚未占住各格子：单张重新生成必须并入同一操作。
    const single = api.redrawImageCard('novelai', cardB);
    const result = await floor;
    await single;
    assert.deepEqual(result, { submitted: 2, skipped: 0 });
    assert.equal(h.submissions.length, 1);
    assert.equal(h.requests, 1);
    // 操作结束后认领自动释放：同一格再次单张重生会正常提交。
    await api.redrawImageCard('novelai', failedCards(h)[0] ?? cardB);
    assert.equal(h.submissions.length, 2);
});

test('a card the whole-floor redraw skips is released, so its single redraw is not swallowed by the floor operation', async t => {
    const h = setup(t, floorSource('fr10', ['a', 'b'])); h.hold = true;
    t.after(() => h.finish()); // 断言失败时也要放行被挂起的请求，避免测试进程悬挂
    await storeFailedSlots(h, 'fr10', [['a', 'tag a']]);
    // b 没有任何 TAG：整楼重生会跳过它。
    await api.storePreview({ slotId: 'fr10-b', imgId: 'fr10-b-img', messageId: 0, tags: '', positive: '', characterPrompts: [],
        negativePrompt: '', status: 'failed', errorType: 'failed', errorMessage: 'supplier rejected' });
    h.format(); await api.renderPreviewsForMessage(0);
    const [cardA, cardB] = failedCards(h);
    assert.equal(cardB.dataset.slotId, 'fr10-b');
    const floor = api.redrawFloorFailedImageCards('novelai', cardA);
    await until(() => h.requests === 1);
    // 整楼重生仍在进行（a 已提交并被占住）；b 被跳过，单张重新生成必须独立处理（这里给出“没有 TAG”的错误），而不是等整楼结束后什么都不做。
    const single = api.redrawImageCard('novelai', cardB);
    let outcome = 'pending';
    single.then(() => { outcome = 'resolved'; }, error => { outcome = error.message; });
    await tick();
    assert.match(outcome, /TAG|标签|tag/i);
    // a 仍被整楼重生占住：单张重新生成并入同一批，不会重复提交。
    const singleA = api.redrawImageCard('novelai', cardA);
    await tick();
    assert.equal(h.submissions.length, 1);
    h.finish();
    assert.deepEqual(await floor, { submitted: 1, skipped: 1 });
    await singleA;
    assert.equal(h.submissions.length, 1);
});

test('a whole-floor redraw only claims its own failed cards; another card of the floor still queues normally', async t => {
    const h = setup(t, floorSource('fr8', ['a', 'b', 'c'])); h.hold = true;
    t.after(() => { h.hold = false; h.finish(); });
    await storeFailedSlots(h, 'fr8', [['a', 'tag a'], ['b', 'tag b']]);
    await api.storePreview({ slotId: 'fr8-c', imgId: 'fr8-c-img', messageId: 0, tags: 'tag c', positive: 'tag c', base64: 'YWJj' });
    h.format(); await api.renderPreviewsForMessage(0);
    const cardC = h.root.querySelector('.xb-nd-img[data-slot-id="fr8-c"]');
    assert.ok(cardC);
    const floor = api.redrawFloorFailedImageCards('novelai', failedCards(h)[0]);
    await until(() => h.requests === 1);
    const other = api.redrawImageCard('novelai', cardC);
    assert.notEqual(other, floor);
    await until(() => h.submissions.length === 2);
    h.finish();
    await until(() => h.requests === 2);
    h.finish();
    await Promise.all([floor, other]);
    assert.equal(h.submissions.length, 2);
});

test('clicking whole-floor redraw twice shows the skipped-cards notice only once', async t => {
    const notices = [];
    globalThis.toastr = { info: message => notices.push(['info', message]), error: message => notices.push(['error', message]) };
    t.after(() => { delete globalThis.toastr; });
    const h = setup(t, floorSource('fr9', ['a', 'b', 'c'])); h.hold = true;
    await storeFailedSlots(h, 'fr9', [['a', 'tag a'], ['b', 'tag b'], ['c', 'tag c']]);
    markSlotBusy(t, 'fr9-c');
    const card = failedCards(h)[0];
    const first = api.retryFloorFailedImageCards('novelai', card);
    const second = api.retryFloorFailedImageCards('novelai', card);
    await until(() => h.requests === 1);
    h.finish();
    await Promise.all([first, second]);
    assert.equal(h.submissions.length, 1);
    assert.deepEqual(notices, [['info', '已重新生成 2 张，另有 1 张正在处理中已跳过']]);
    // 操作结束后再点一次是新的操作，会重新给出提示。
    notices.length = 0;
    h.hold = false;
    await api.retryFloorFailedImageCards('novelai', card);
    assert.equal(notices.length, 1);
});

test('a failing whole-floor redraw reports its error once, even when a single redraw of a claimed card joined it', async t => {
    const notices = [];
    globalThis.toastr = { info: message => notices.push(['info', message]), error: message => notices.push(['error', message]) };
    t.after(() => { delete globalThis.toastr; });
    const h = setup(t, floorSource('fr11', ['a', 'b']));
    await storeFailedSlots(h, 'fr11', [['a', 'tag a'], ['b', 'tag b']]);
    const [cardA, cardB] = failedCards(h);
    h.prepareBarrier = async () => { throw new Error('floor boom'); };
    const floor = api.retryFloorFailedImageCards('novelai', cardA);
    // 整楼重生还在收集阶段时点单张“重新生成”（并入整楼操作）。供应商入口 refreshSingleImage 对异常再弹一次 error，所以这里不能再抛。
    const single = api.redrawImageCard('novelai', cardB);
    await assert.doesNotReject(single);
    await floor;
    assert.deepEqual(notices, [['error', 'floor boom']]);
});

test('a single redraw clicked after the floor batch settled, while the floor only re-renders, is a real redraw instead of being swallowed', async t => {
    const h = setup(t, floorSource('fr12', ['a', 'b']));
    await storeFailedSlots(h, 'fr12', [['a', 'tag a'], ['b', 'tag b']]);
    const [cardA, cardB] = failedCards(h);
    let single;
    let floorSettled = false;
    let settledAtClick = null;
    let clickedAfterBatch = null;
    let successes = 0;
    h.stateHook = (state) => {
        if (state === 'success' && ++successes === 2) {
            // 最后一格完成的回调之后的下一轮事件循环：批次已经收场，整楼操作只剩收尾重绘（IndexedDB 读写要好几轮）。
            clickedAfterBatch = new Promise(resolve => setImmediate(() => {
                settledAtClick = floorSettled;
                single = api.redrawImageCard('novelai', cardB);
                resolve();
            }));
        }
    };
    const floor = api.redrawFloorFailedImageCards('novelai', cardA).then((result) => { floorSettled = true; return result; });
    assert.deepEqual(await floor, { submitted: 2, skipped: 0 });
    await clickedAfterBatch;
    assert.equal(settledAtClick, false, '前提：点击发生时整楼操作尚未结束');
    assert.ok(single, '点击确实发生在整楼操作结束前');
    await single;
    assert.equal(h.submissions.length, 2, '单张点击走了正常的单张重绘（新提交一次），没有被吞掉');
    assert.equal(h.requests, 2);
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
    api.initChatMessageImages(); await h.begin();
    await until(() => h.root.querySelector('[data-xb-draw-tag="streaming"]'));
    const card = h.root.querySelector('.xb-nd-img');
    await h.receive();
    await until(() => h.root.querySelector('[data-xb-draw-tag="failed"]'));
    assert.ok(h.root.querySelector('.xb-nd-img') === card);
    assert.ok(card.querySelector('[data-xb-draw-tag-action]'));
    assert.equal(h.root.textContent.includes('[img:'), false);
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
    await until(() => h.root.querySelector('[data-xb-draw-tag-action]'));
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
    await until(() => h.root.querySelector('[data-xb-draw-tag-action]'));
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
    const operation = api.cancelFloorDrawWork(0, { recordsLoader: () => gate.promise,
        imageJobClient: { cancelWork: async ({ jobIds }) => calls.push(...jobIds) } });
    h.message.swipe_id = 1; h.message.mes = next;
    gate.resolve(await api.listPendingImageJobs()); await operation;
    assert.deepEqual(calls, [first.jobId]);
    assert.equal((await api.getPendingImageJob(first.jobId)).cancelRequested, true);
    assert.equal((await api.getPendingImageJob(second.jobId)).cancelRequested, false);
});

test('a global runtime stop does not accidentally target the first floor recovered jobs', async t => {
    const h = setup(t, '[img: unrelated recovered image]');
    const record = await stageNativeJob(t, h, { active: true });
    const calls = [];
    assert.equal(await api.cancelFloorDrawWork(null, {
        imageJobClient: { cancelWork: async targets => calls.push(targets) },
    }), false);
    assert.deepEqual(calls, []);
    assert.equal((await api.getPendingImageJob(record.jobId)).cancelRequested, false);
});

test('a settled sibling cannot prevent cancellation of a remaining journal task', async t => {
    const h = setup(t, '[img: first]');
    const first = await stageNativeJob(t, h, { active: true });
    h.message.mes += ' [img: second]';
    const second = await stageNativeJob(t, h, { active: true });
    const records = await api.listPendingImageJobs(), calls = [];
    await api.forgetPendingImageJob(first.jobId, first.leaseId);
    await api.cancelFloorDrawWork(0, { recordsLoader: async () => records,
        imageJobClient: { cancelWork: async ({ jobIds }) => calls.push(...jobIds) } });
    assert.ok(calls.includes(second.jobId));
    assert.equal((await api.getPendingImageJob(second.jobId)).cancelRequested, true);
});

for (const change of ['swipe', 'chat', 'earlier-floor']) test(`marker cancellation retains only its clicked target after ${change}`, async t => {
    const h = setup(t, 'original');
    api.setDrawRunMarker({ message: h.message, messageId: 0, runId: 'run-cancel-original',
        marker: { provider: 'sd-webui', sourceHash: 'source', targetHash: 'target', createdAt: 1 } });
    const gate = Promise.withResolvers(), requests = [];
    const operation = api.cancelFloorDrawWork(0, {
        recordsLoader: () => gate.promise,
        imageJobClient: { cancelWork: async targets => requests.push(targets) },
    });
    if (change === 'chat') host.ctx = { ...h.ctx, chatId: 'other-chat', chat: [{ mes: 'other' }] };
    if (change === 'swipe') {
        h.message.swipe_info = [{ extra: structuredClone(h.message.extra) }, { extra: {} }];
        h.message.swipe_id = 1; h.message.swipes.push('other'); h.message.mes = 'other'; h.message.extra = {};
    }
    if (change === 'earlier-floor') h.ctx.chat.unshift({ mes: 'earlier' });
    const before = structuredClone(host.ctx.chat);
    gate.resolve([]); await operation;
    assert.deepEqual(requests, [{ owner: 'fixture', jobIds: [], runIds: ['run-cancel-original'] }]);
    assert.deepEqual(host.ctx.chat, before);
    assert.equal(h.saves, 0);
});

test('recovered native image jobs are capsule-visible and cancelled by their existing journal identity', async t => {
    const h = setup(t, '[img: recover cancel]');
    const record = await stageNativeJob(t, h, { active: true });
    assert.equal(h.jobs.size, 0);
    assert.equal(record.originRunId, '');
    const state = await api.getPendingDrawWorkState(0);
    assert.equal(state.pending, true); assert.equal(state.backendAccepted, true);
    const cancelled = [];
    assert.equal(await api.cancelFloorDrawWork(0, {
        imageJobClient: { cancelWork: async ({ jobIds, runIds }) => { assert.deepEqual(runIds, []); cancelled.push(...jobIds); } },
    }), true);
    assert.deepEqual(cancelled, [record.jobId]);
    assert.equal((await api.getPendingImageJob(record.jobId)).cancelRequested, true);
    assert.equal((await api.getPendingDrawWorkState(0)).cancelling, true);
    host.ctx = { ...h.ctx, chatId: 'another', chat: [{ mes: h.message.mes }] };
    assert.equal((await api.getPendingDrawWorkState(0)).pending, false);
    assert.equal(await api.cancelFloorDrawWork(0), false);
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
    api.initChatMessageImages(); await until(() => h.root.querySelector('[data-xb-draw-tag-action]'));
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

// Version-directed operations must not share the gallery's display fallback.
// Exercise real storage + card actions: a source-only test cannot detect a
// correct-looking card whose edits or paid redraw use a different record.
for (const status of ['failed', 'success']) for (const selected of [false, true]) {
    test(`saved card edits and redraw never borrow a ${status} sibling (explicit selection: ${selected})`, async t => {
        const slotId = `exact-card-${status}-${selected}`, imgId = slotId + '-saved';
        const h = setup(t, `[image:${slotId}]`);
        h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId, tags: 'saved scene', savedUrl: '/saved.png' } };
        await api.storePreview({ slotId, imgId: slotId + '-other', status, tags: 'other scene',
            savedUrl: status === 'success' ? '/other.png' : null,
            characterPrompts: [{ name: 'Other', prompt: 'other character' }], negativePrompt: 'other negative' });
        const other = await api.getPreview(slotId + '-other');
        if (selected) await api.setSlotSelection(slotId, imgId);
        await api.renderPreviewsForMessage(0);
        const card = h.root.querySelector('.xb-nd-img'), panel = card.querySelector('.xb-nd-edit');
        assert.equal(card.dataset.imgId, imgId);
        assert.equal(await api.getCardPreview({ slotId, imgId }), null);
        assert.equal(await api.getCardPreview({ slotId }), null);
        assert.equal((await api.getDisplayPreviewForSlot(slotId)).preview.imgId, other.imgId);
        const opened = await api.readCardTagEditor(card);
        assert.equal(opened.imgId, imgId);
        assert.equal(opened.tags, 'saved scene');
        assert.equal(await api.getPreview(imgId), undefined, 'opening is read-only');
        panel.style.display = 'block'; panel.querySelector('textarea').value = 'edited saved scene';
        const saved = await api.persistCardTagEdits(card, tags => ({ positive: tags }));
        assert.equal(saved.imgId, imgId);
        assert.equal(saved.savedUrl, '/saved.png');
        assert.equal(api.getDrawSavedEntry(h.message, slotId).tags, 'edited saved scene');
        assert.deepEqual(await api.getPreview(other.imgId), other);
        assert.equal(h.requests, 0);
        await api.redrawImageCard('novelai', card);
        assert.equal(h.submissions[0].tasks[0].scene, 'edited saved scene');
        assert.deepEqual(h.submissions[0].tasks[0].characterPrompts, []);
        assert.equal(h.submissions[0].tasks[0].negativePrompt, undefined);
        assert.deepEqual(await api.getPreview(other.imgId), other);
    });
}

for (const savedUrl of ['/user/images/fixture.png', 'user/images/fixture.png']) {
    test(`saved upload ${savedUrl} remains displayable without its base64 cache`, async t => {
        const slotId = 'saved-upload-path', imgId = slotId + '-image';
        const h = setup(t, `[image:${slotId}]`);
        await api.storePreview({ slotId, imgId, messageId: 0, base64: 'YWJj', tags: 'portrait' });
        await api.updatePreviewSavedUrl(imgId, savedUrl);
        const saved = await api.getPreview(imgId);
        assert.equal(saved.base64, null);
        assert.equal(api.getPreviewDisplayUrl(saved), '/user/images/fixture.png');
        await api.renderPreviewsForMessage(0);
        assert.equal(h.root.querySelector('.xb-nd-img img').getAttribute('src'), '/user/images/fixture.png');
        assert.equal(h.requests, 0);
    });
}

test('saved redraw input survives cache loss, edits, clearing and portable gallery export', async t => {
    const slotId = 'saved-full-input', imgId = 'saved-full-input-image';
    const h = setup(t, `[image:${slotId}]`);
    const original = { slotId, imgId, messageId: 0, tags: 'portrait', positive: 'portrait, girl, dusk',
        base64: 'YWJj', savedUrl: '/saved-input.png', postPrompt: 'dusk',
        characterPrompts: [{ prompt: 'girl' }], negativePrompt: 'blur' };
    await api.storePreview(original);
    await api.syncDrawSavedFromPreview(0, original);
    const portable = await api.exportPortablePreviewsForSlots([slotId]);
    assert.equal(portable.previews[0].postPrompt, 'dusk');
    await api.deletePreview(imgId);
    const saved = api.getDrawSavedPreview(h.message, slotId, 0, h.ctx.chatId);
    assert.equal(saved.postPrompt, 'dusk');
    assert.deepEqual(saved.characterPrompts, original.characterPrompts);
    assert.equal(saved.negativePrompt, original.negativePrompt);
    await api.renderPreviewsForMessage(0);
    const card = h.root.querySelector('.xb-nd-img');
    await api.redrawImageCard('novelai', card);
    assert.equal(h.submissions[0].tasks[0].post_prompt, 'dusk');
    assert.deepEqual(h.submissions[0].tasks[0].characterPrompts, original.characterPrompts);
    await api.importPortablePreviews(portable.previews, portable.selections);
    assert.equal((await api.getPreview(imgId)).postPrompt, 'dusk');
    await api.updatePreviewSavedUrl(imgId, original.savedUrl);
    await api.setSlotSelection(slotId, imgId);
    await api.syncDrawSavedFromPreview(0, original);
    h.format(); await api.renderPreviewsForMessage(0);
    const editable = h.root.querySelector('.xb-nd-img');
    const tail = document.createElement('textarea');
    tail.dataset.type = 'post_prompt';
    editable.querySelector('.xb-nd-edit').append(tail);
    for (const value of ['moonlight', '']) {
        tail.value = value;
        await api.persistCardTagEdits(editable, (_tags, _characters, _record, postPrompt) => {
            assert.equal(postPrompt, value);
            return {};
        });
        assert.equal((await api.getPreview(imgId)).postPrompt, value);
        assert.equal(api.getDrawSavedEntry(h.message, slotId).postPrompt, value);
    }
});

test('redrawing a portable-only card uses its own input without first editing it', async t => {
    const slotId = 'portable-exact-redraw', imgId = slotId + '-saved';
    const h = setup(t, `[image:${slotId}]`);
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId, tags: 'saved scene', savedUrl: '/saved.png' } };
    await api.storePreview({ slotId, imgId: slotId + '-failed', status: 'failed', tags: 'wrong scene',
        characterPrompts: [{ prompt: 'wrong character' }], negativePrompt: 'wrong negative' });
    await api.renderPreviewsForMessage(0);
    await api.redrawImageCard('novelai', h.root.querySelector('.xb-nd-img'));
    assert.equal(h.submissions[0].tasks[0].scene, 'saved scene');
    assert.deepEqual(h.submissions[0].tasks[0].characterPrompts, []);
    assert.equal(h.submissions[0].tasks[0].negativePrompt, undefined);
    assert.equal((await api.getPreview(imgId)).savedUrl, '/saved.png');
});

for (const savedReference of ['absent', 'other-version']) test(`missing explicit target rejects edits and redraw with ${savedReference} reference`, async t => {
    const slotId = `missing-exact-${savedReference}`, imgId = slotId + '-a';
    const h = setup(t, `[image:${slotId}]`);
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId, tags: 'scene a', savedUrl: '/a.png' } };
    await api.renderPreviewsForMessage(0);
    const card = h.root.querySelector('.xb-nd-img'), panel = card.querySelector('.xb-nd-edit');
    panel.style.display = 'block'; panel.querySelector('textarea').value = 'draft a';
    if (savedReference === 'absent') delete h.message.extra.xiaobaixDrawSaved[slotId];
    else h.message.extra.xiaobaixDrawSaved[slotId] = { imgId: slotId + '-b', savedUrl: '/b.png', tags: 'scene b' };
    const before = structuredClone(h.message.extra);
    await assert.rejects(api.readCardTagEditor(card));
    await assert.rejects(api.persistCardTagEdits(card, tags => ({ positive: tags })));
    assert.equal(panel.querySelector('textarea').value, 'draft a');
    await assert.rejects(api.redrawImageCard('novelai', card));
    assert.equal((await api.getPreviewsBySlot(slotId)).length, 0);
    assert.deepEqual(h.message.extra, before);
    assert.equal(h.requests, 0);
});

for (const action of ['open', 'save', 'redraw']) for (const change of ['version', 'chat', 'branch', 'delete']) {
    test(`${action} cannot retarget after ${change} during its record read`, async t => {
        const slotId = `target-race-${action}-${change}`, imgId = slotId + '-a';
        const h = setup(t, `[image:${slotId}]`);
        await api.storePreview({ slotId, imgId, status: 'failed', tags: 'scene a' });
        await api.renderPreviewsForMessage(0);
        const card = h.root.querySelector('.xb-nd-img'), panel = card.querySelector('.xb-nd-edit');
        panel.style.display = 'block'; panel.dataset.imgId = imgId;
        panel.querySelector('textarea').value = 'draft a';
        const get = IDBObjectStore.prototype.get;
        let changed = false;
        t.mock.method(IDBObjectStore.prototype, 'get', function (key) {
            const request = get.call(this, key);
            if (!changed && this.name === 'previews' && key === imgId) {
                changed = true;
                request.addEventListener('success', () => {
                    if (change === 'version') card.dataset.imgId = slotId + '-b';
                    if (change === 'chat') h.ctx.chatId += '-switched';
                    if (change === 'branch') h.message.swipe_id = 1;
                    if (change === 'delete') { h.message.mes = ''; h.message.swipes = ['']; }
                }, { once: true });
            }
            return request;
        });
        const run = action === 'open' ? api.readCardTagEditor(card)
            : action === 'save' ? api.persistCardTagEdits(card, tags => ({ positive: tags }))
                : api.redrawImageCard('novelai', card);
        await assert.rejects(run);
        assert.equal(changed, true);
        assert.equal((await api.getPreview(imgId)).tags, 'scene a');
        assert.equal(panel.querySelector('textarea').value, 'draft a');
        assert.equal(panel.dataset.imgId, imgId);
        assert.equal(h.requests, 0);
    });
}

test('an ID-less placeholder creates its own editable input, never edits a historical sibling', async t => {
    const slotId = 'first-edit-exact';
    const h = setup(t, `[image:${slotId}]`);
    await api.renderPreviewsForMessage(0);
    const card = h.root.querySelector('.xb-nd-img'), panel = card.querySelector('.xb-nd-edit');
    assert.equal(card.dataset.imgId || '', '');
    await api.storePreview({ slotId, imgId: slotId + '-history', status: 'failed', tags: 'history' });
    assert.equal(await api.readCardTagEditor(card), null);
    panel.style.display = 'block'; panel.querySelector('textarea').value = 'first draft';
    const saved = await api.persistCardTagEdits(card, tags => ({ positive: tags }));
    assert.notEqual(saved.imgId, slotId + '-history');
    assert.equal(saved.tags, 'first draft');
    assert.equal(panel.dataset.imgId, saved.imgId);
    assert.equal(card.dataset.imgId, saved.imgId);
    assert.equal(await api.getSlotSelection(slotId), saved.imgId);
    assert.equal((await api.getPreview(slotId + '-history')).tags, 'history');
    panel.querySelector('textarea').value = 'second draft';
    await api.persistCardTagEdits(card, tags => ({ positive: tags }));
    assert.equal((await api.getPreview(saved.imgId)).tags, 'second draft');
    assert.equal(h.requests, 0);
});

for (const projection of ['own', 'other']) test(`first TAG save accepts only its ${projection} projection while storage completion is pending`, async t => {
    const slotId = `first-save-projection-${projection}`;
    const h = setup(t, `[image:${slotId}]`);
    await api.renderPreviewsForMessage(0);
    const card = h.root.querySelector('.xb-nd-img'), panel = card.querySelector('.xb-nd-edit');
    await api.readCardTagEditor(card);
    panel.style.display = 'block'; panel.querySelector('textarea').value = 'first draft';
    const gate = Promise.withResolvers();
    let resume, createdImgId;
    const put = IDBObjectStore.prototype.put;
    const storage = t.mock.method(IDBObjectStore.prototype, 'put', function (value) {
        const request = put.call(this, value);
        if (!createdImgId && this.name === 'selections' && value.slotId === slotId) {
            createdImgId = value.selectedImgId;
            this.transaction.addEventListener('complete', event => {
                event.stopImmediatePropagation();
                resume = () => this.transaction.oncomplete(event);
                gate.resolve();
            }, { once: true });
        }
        return request;
    });
    const saving = api.persistCardTagEdits(card, tags => ({ positive: tags }));
    const rejected = projection === 'other' ? assert.rejects(saving) : null;
    await gate.promise; storage.mock.restore();
    if (projection === 'other') {
        await api.storePreview({ slotId, imgId: slotId + '-other', status: 'failed', tags: 'other' });
        await api.setSlotSelection(slotId, slotId + '-other');
    }
    await api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId] });
    assert.equal(card.dataset.imgId, projection === 'own' ? createdImgId : slotId + '-other');
    resume();
    if (rejected) {
        await rejected;
        assert.equal((await api.getPreview(slotId + '-other')).tags, 'other');
        assert.equal(await api.getSlotSelection(slotId), slotId + '-other');
        assert.equal(panel.dataset.imgId, '');
    } else {
        assert.equal((await saving).imgId, createdImgId);
        assert.equal(panel.dataset.imgId, createdImgId);
        assert.equal(await api.getSlotSelection(slotId), createdImgId);
    }
    assert.equal(panel.querySelector('textarea').value, 'first draft');
    assert.equal(h.requests, 0);
});

test('portable references without a stored ID use one identity for display, editing and archival', async t => {
    const slotId = 'portable-no-id';
    const h = setup(t, `[image:${slotId}]`);
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { savedUrl: '/saved.png', tags: 'saved scene' } };
    await api.renderPreviewsForMessage(0);
    const card = h.root.querySelector('.xb-nd-img');
    const imgId = card.dataset.imgId;
    assert.ok(imgId);
    assert.equal((await api.readCardTagEditor(card)).imgId, imgId);
    card.querySelector('textarea').value = 'edited scene';
    assert.equal((await api.persistCardTagEdits(card, tags => ({ positive: tags }))).imgId, imgId);
    assert.equal(api.getDrawSavedEntry(h.message, slotId).imgId, imgId);
    assert.equal((await api.getPreview(imgId)).tags, 'edited scene');
});

test('a gallery record from another slot cannot authorize saved-reference edits', async t => {
    const slotId = 'foreign-slot-target', imgId = 'foreign-slot-image';
    const h = setup(t, `[image:${slotId}]`);
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId, tags: 'saved', savedUrl: '/saved.png' } };
    await api.storePreview({ slotId: 'foreign-slot-owner', imgId, tags: 'foreign', savedUrl: '/foreign.png' });
    const foreign = await api.getPreview(imgId);
    assert.equal(await api.getCardPreview({ slotId, imgId }), null);
    await api.renderPreviewsForMessage(0);
    const card = h.root.querySelector('.xb-nd-img');
    card.querySelector('textarea').value = 'edited';
    await assert.rejects(api.persistCardTagEdits(card, tags => ({ positive: tags })));
    assert.deepEqual(await api.getPreview(imgId), foreign);
    assert.equal(api.getDrawSavedEntry(h.message, slotId).tags, 'saved');
    assert.equal(h.requests, 0);
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
    await api.commitPendingImageJobItem(job.record.jobId, job.record.leaseId, 0);
    h.format(); await api.renderPreviewsForMessage(0);
    assert.ok(h.root.querySelector('img'));
    assert.equal(h.root.querySelector('.xb-nd-img').dataset.imgId, job.imgId);
    assert.ok(await api.getPendingImageJob(job.record.jobId));
});

test('different cards accept rerolls together while duplicate clicks share one purchase', async t => {
    const h = setup(t, '[image:queued-a] [image:queued-b]');
    for (const slotId of ['queued-a', 'queued-b']) {
        await api.storePreview({ slotId, imgId: `old-${slotId}`, tags: slotId, messageId: 0, base64: 'YWJj' });
    }
    await api.renderPreviewsForMessage(0);
    h.hold = true;
    const [a, b] = h.root.querySelectorAll('.xb-nd-img');
    const first = api.redrawImageCard('novelai', a);
    assert.equal(api.redrawImageCard('novelai', a), first);
    const second = api.redrawImageCard('novelai', b);
    await until(() => h.requests === 2);
    assert.equal(h.jobs.size, 2);
    assert.deepEqual(h.submissions.map(input => input.tasks[0].scene), ['queued-a', 'queued-b']);
    h.finish();
    await Promise.all([first, second]);
    assert.equal(h.jobs.size, 0);
    assert.equal(h.requests, 2);
});

test('a committed backend item can reroll while its uncommitted sibling stays protected', async t => {
    const h = setup(t, '[image:batch-finished-a] [image:batch-running-b]');
    const items = ['batch-finished-a', 'batch-running-b'].map((slotId, index) => ({ index, slotId, imgId: `old-${slotId}` }));
    for (const item of items) await api.storePreview({ ...item, tags: item.slotId, messageId: 0, base64: 'YWJj' });
    const record = await api.recordPendingImageJob({ jobId: 'partial-reroll', provider: 'sd-webui',
        delivery: { mode: 'slots', chatId: h.ctx.chatId, messageId: '0' }, items });
    t.after(() => api.forgetPendingImageJob(record.jobId, record.leaseId));
    await api.commitPendingImageJobItem(record.jobId, record.leaseId, 0);
    await api.renderPreviewsForMessage(0);
    const [a, b] = h.root.querySelectorAll('.xb-nd-img');
    await api.redrawImageCard('novelai', b);
    assert.equal(h.requests, 0);
    await api.redrawImageCard('novelai', a);
    assert.equal(h.requests, 1);
    assert.notEqual(await api.getSlotSelection(items[0].slotId), items[0].imgId);
    assert.equal((await api.getPendingImageJobSlots()).has(items[1].slotId), true);
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

for (const phase of ['preparation', 'save']) test(`existing-slot redraw preserves unrelated continuation during ${phase}`, async t => {
    const slotId = `redraw-continuation-${phase}`;
    const h = setup(t, `Before [image:${slotId}] after`);
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId: `${slotId}-old`, savedUrl: '/kept.png', tags: 'saved tags' } };
    await api.renderPreviewsForMessage(0);
    const expected = h.message.mes + ' continued narration';
    const continueText = () => { h.message.mes = expected; h.message.swipes[0] = expected; };
    if (phase === 'preparation') h.prepareBarrier = continueText;
    else h.onSave = continueText;
    const result = await api.redrawImageCard('novelai', h.root.querySelector('.xb-nd-img'));
    assert.equal(result.success, 1);
    assert.equal(h.requests, 1);
    assert.equal(h.message.mes, expected);
    assert.equal(h.message.swipes[0], expected);
    assert.equal(h.persisted[1].mes, expected);
    const selected = await api.getPreview(await api.getSlotSelection(slotId));
    assert.equal(selected.status, 'success');
    assert.equal(selected.tags, 'saved tags');
    assert.equal((await api.getPreview(`${slotId}-old`)).savedUrl, '/kept.png');
});

for (const phase of ['preparation', 'save']) for (const boundary of ['chat', 'swipe', 'removed', 'edit']) {
    test(`existing-slot redraw still rejects ${boundary} during ${phase}`, async t => {
        const slotId = `redraw-boundary-${phase}-${boundary}`;
        const h = setup(t, `[image:${slotId}]`);
        h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId: `${slotId}-old`, savedUrl: '/kept.png', tags: 'saved tags' } };
        await api.renderPreviewsForMessage(0);
        const invalidate = () => {
            if (boundary === 'chat') host.ctx = { chatId: 'other', chat: [{ mes: 'other chat' }] };
            if (boundary === 'swipe') { h.message.swipe_id = 1; h.message.mes = 'other branch'; }
            if (boundary === 'removed') h.message.mes = 'slot removed';
            if (boundary === 'edit') h.root.closest('.mes').classList.add('editing');
        };
        if (phase === 'preparation') h.prepareBarrier = invalidate;
        else h.onSave = invalidate;
        await assert.rejects(api.redrawImageCard('novelai', h.root.querySelector('.xb-nd-img')));
        assert.equal(h.requests, 0);
        if (boundary === 'chat') assert.equal(host.ctx.chat[0].mes, 'other chat');
        if (boundary === 'swipe') assert.equal(h.message.mes, 'other branch');
        if (boundary === 'removed') assert.equal(h.message.mes, 'slot removed');
    });
}

test('failed redraw preserves a saved-only image as a recoverable gallery version', async t => {
    const slotId = 'redraw-saved-only';
    const h = setup(t, `[image:${slotId}]`);
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId: 'saved-only-before-redraw', savedUrl: '/kept.png', tags: 'saved tags' } };
    await api.setSlotSelection(slotId, 'saved-only-before-redraw');
    await api.renderPreviewsForMessage(0);
    h.failures = [0];
    await api.redrawImageCard('novelai', h.root.querySelector('.xb-nd-img'));
    const failed = await api.getPreview(await api.getSlotSelection(slotId));
    assert.equal(failed.status, 'failed');
    assert.equal((await api.getPreview('saved-only-before-redraw')).savedUrl, '/kept.png');
    assert.equal(await api.restoreImageCard(h.root.querySelector('.xb-nd-img')), true);
    assert.equal(await api.getSlotSelection(slotId), 'saved-only-before-redraw');
    assert.equal(h.requests, 1);
});

test('failure to preserve a saved-only image cannot clear its reference or purchase a redraw', async t => {
    const slotId = 'redraw-saved-write-error';
    const h = setup(t, `[image:${slotId}]`);
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId: 'write-error-old', savedUrl: '/kept.png', tags: 'saved tags' } };
    await api.setSlotSelection(slotId, 'write-error-old');
    await api.renderPreviewsForMessage(0);
    const put = IDBObjectStore.prototype.put;
    t.mock.method(IDBObjectStore.prototype, 'put', function (value, ...args) {
        const result = put.call(this, value, ...args);
        if (this.name === 'previews' && value.imgId === 'write-error-old') this.transaction.abort();
        return result;
    });
    await assert.rejects(api.redrawImageCard('novelai', h.root.querySelector('.xb-nd-img')));
    assert.equal(h.requests, 0);
    assert.equal(api.getDrawSavedEntry(h.message, slotId).savedUrl, '/kept.png');
});

for (const switchChat of [false, true]) for (const boundary of ['lookup', 'write']) test(`deleting a saved-only slot during archive ${boundary} cannot recreate its gallery version (switch chat: ${switchChat})`, async t => {
    const slotId = `delete-during-archive-${boundary}-${switchChat}`, imgId = `archive-deleted-image-${boundary}-${switchChat}`;
    const h = setup(t, `[image:${slotId}]`);
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId, savedUrl: '/kept.png', tags: 'saved tags' } };
    await api.renderPreviewsForMessage(0);
    const gate = Promise.withResolvers();
    let resume;
    const method = boundary === 'lookup' ? 'get' : 'put';
    const original = IDBObjectStore.prototype[method];
    const mock = t.mock.method(IDBObjectStore.prototype, method, function (value) {
        const request = original.call(this, value);
        if (this.name === 'previews' && (boundary === 'lookup' ? value : value.imgId) === imgId) {
            const emitter = boundary === 'lookup' ? request : this.transaction;
            const eventName = boundary === 'lookup' ? 'success' : 'complete';
            emitter.addEventListener(eventName, event => {
                event.stopImmediatePropagation();
                resume = () => emitter['on' + eventName](event);
                gate.resolve();
            }, { once: true });
        }
        return request;
    });
    const archive = api.materializeDrawSavedPreview(h.message, slotId, { messageId: 0, chatId: h.ctx.chatId });
    await gate.promise;
    mock.mock.restore();
    if (switchChat) h.onSave = () => { host.ctx = { ...h.ctx, chatId: 'other-chat', chat: [{ mes: 'other', extra: {} }] }; };
    await api.removeChatImageSlot(h.root.querySelector('.xb-nd-img'));
    const rejected = assert.rejects(archive);
    resume();
    await rejected;
    assert.equal(await api.getPreview(imgId), undefined);
    assert.equal(api.extractSlotIds(h.message.mes).size, 0);
    assert.equal(h.requests, 0);
});

test('concurrent archive and removal cannot resurrect a saved image after leaving the chat', async t => {
    const slotId = 'archive-concurrent-removal', imgId = slotId + '-old';
    const h = setup(t, `[image:${slotId}]`);
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId, savedUrl: '/old.png', tags: 'old' } };
    await api.storePreview({ slotId, imgId: slotId + '-failed', status: 'failed', tags: 'retry', messageId: 0 });
    await api.setSlotSelection(slotId, slotId + '-failed');
    await api.renderPreviewsForMessage(0);
    const other = { mes: 'other chat', extra: {} };
    h.onSave = () => { host.ctx = { ...h.ctx, chatId: 'other-chat', chat: [other] }; };
    // No storage hooks: both real production operations use normal IDB ordering.
    const deletion = api.removeChatImageSlot(h.root.querySelector('.xb-nd-img'));
    const archive = api.materializeDrawSavedPreview(h.message, slotId, { messageId: 0, chatId: h.ctx.chatId })
        .then(() => null, error => error);
    await Promise.all([deletion, archive]);
    assert.equal(api.extractSlotIds(h.message.mes).size, 0);
    assert.equal((await api.getPreviewsBySlot(slotId)).length, 0);
    assert.equal(await api.getSlotSelection(slotId), null);
    assert.deepEqual(other, { mes: 'other chat', extra: {} });
    assert.equal(h.requests, 0);
});

test('archive preserves an inactive branch but rejects a removed message with a remaining saved reference', async t => {
    const slotId = 'archive-inactive-branch', imgId = slotId + '-old';
    const h = setup(t, 'current branch');
    h.message.swipes.push(`[image:${slotId}]`);
    h.message.extra.xiaobaixDrawSaved = { [slotId]: { imgId, savedUrl: '/old.png', tags: 'old' } };
    await api.materializeDrawSavedPreview(h.message, slotId, { messageId: 0, chatId: h.ctx.chatId });
    assert.equal((await api.getPreview(imgId)).savedUrl, '/old.png');
    await api.deletePreview(imgId);
    h.ctx.chat.splice(0, 1);
    await assert.rejects(api.materializeDrawSavedPreview(h.message, slotId, { messageId: 0, chatId: h.ctx.chatId }));
    assert.equal(await api.getPreview(imgId), undefined);
    assert.equal(h.requests, 0);
});

test('first gallery read error settles under DOM observation and retries only on explicit action', async t => {
    const slotId = 'first-gallery-error', imgId = slotId + '-image';
    const h = setup(t, `[image:${slotId}]`);
    await api.storePreview({ slotId, imgId, savedUrl: '/old.png', tags: 'old', messageId: 0 });
    const get = IDBObjectStore.prototype.get;
    let reads = 0;
    const storage = t.mock.method(IDBObjectStore.prototype, 'get', function (...args) {
        const request = get.apply(this, args);
        if (this.name === 'selections') {
            reads++;
            this.transaction.abort();
            // Bound a broken observer loop so a regression fails, not hangs.
            if (reads === 5) api.cleanupChatMessageImages();
        }
        return request;
    });
    t.mock.method(console, 'error', () => {});
    api.initChatMessageImages();
    await until(() => h.root.querySelector('[role="alert"]'));
    const card = h.root.querySelector('.xb-nd-img');
    h.message.mes += ' continuation'; h.root.append(document.createTextNode(' continuation'));
    for (let turn = 0; turn < 3; turn++) { await tick(); await api.renderPreviewsForMessage(0); }
    assert.equal(reads, 1);
    assert.equal(h.requests, 0);
    storage.mock.restore();
    card.querySelector('[role="alert"] button').click();
    await until(() => card.dataset.imgId === imgId);
    assert.equal(h.root.querySelector('.xb-nd-img'), card);
    assert.equal(card.querySelector('[role="alert"]'), null);
    assert.equal(h.requests, 0);
});

test('a sibling starting and finishing leaves a completed card draft and nodes intact', async t => {
    const slotIds = ['draft-complete', 'draft-running'];
    const h = setup(t, slotIds.map(id => `[image:${id}]`).join('\n'));
    await api.submitPreparedChatImages({ ctx: h.ctx, message: h.message, messageId: 0, sourceText: h.message.mes,
        tasks: slotIds.map(slotId => ({ scene: slotId, placement: { mode: 'existing', slotId } })),
        metadata: slotIds.map(tags => ({ tags, positive: tags })), backend: false,
        run: async callbacks => {
            await callbacks.onItemStarting({ index: 0 });
            await callbacks.onItemReady({ index: 0, base64: 'YWJj' });
            const card = h.root.querySelector('[data-slot-id="draft-complete"]');
            const editor = card.querySelector('.xb-nd-edit'), input = editor.querySelector('textarea');
            editor.style.display = 'block'; input.value = 'unsaved sibling draft';
            await callbacks.onItemStarting({ index: 1 });
            await callbacks.onItemReady({ index: 1, base64: 'ZGVm' });
            assert.ok(h.root.querySelector('[data-slot-id="draft-complete"]') === card);
            assert.ok(card.querySelector('textarea') === input);
            assert.equal(input.value, 'unsaved sibling draft');
            assert.equal(editor.style.display, 'block');
        } });
});

test('hidden slots and code blocks cannot create a MESSAGE_UPDATED feedback loop', async t => {
    const h = setup(t, '[image:hidden-loop]\n\n```html\n<div>widget</div>\n```');
    const original = host.format;
    const format = t.mock.method(host, 'format', source => original(source.replace('[image:hidden-loop]', '')));
    h.ctx.eventSource = { emit: host.emit };
    h.format();
    const before = format.mock.calls.length;
    t.mock.timers.enable({ apis: ['setTimeout'] });
    api.startSharedDrawPreviewRuntime();
    t.after(() => api.stopSharedDrawPreviewRuntime());
    await host.emit('MESSAGE_UPDATED', 0);
    for (let i = 0; i < 3; i++) {
        t.mock.timers.tick(300);
        await api.renderPreviewsForMessage(0);
    }
    assert.equal(format.mock.calls.length, before);
    assert.equal(h.requests, 0);
});

test('a preserved draft cannot be saved into a newly selected version', async t => {
    const slotId = 'changed-editor-version';
    const h = setup(t, `[image:${slotId}]`);
    await api.storePreview({ slotId, imgId: 'edit-first', tags: 'first', savedUrl: '/same.png', messageId: 0 });
    await api.setSlotSelection(slotId, 'edit-first');
    await api.renderPreviewsForMessage(0);
    const card = h.root.querySelector('.xb-nd-img'), editor = card.querySelector('.xb-nd-edit');
    editor.style.display = 'block'; editor.querySelector('textarea').value = 'unsaved first draft';
    await api.storePreview({ slotId, imgId: 'edit-second', tags: 'second', savedUrl: '/same.png', messageId: 0 });
    await api.setSlotSelection(slotId, 'edit-second');
    await api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId] });
    await assert.rejects(api.persistCardTagEdits(card, tags => ({ positive: tags })));
    assert.equal((await api.getPreview('edit-second')).tags, 'second');
    assert.equal(editor.querySelector('textarea').value, 'unsaved first draft');
});

test('cancelled recovery preserves a saved-only version before selecting the interrupted attempt', async t => {
    const h = setup(t, '[image:cancel-saved-only]');
    const job = await registerHeldRedraw(t, h, { oldImage: false, cancelled: true });
    // Simulate a separate browser whose gallery lacks the old portable image.
    await api.deletePreview(job.oldId);
    api.startImageJobRecovery({ client: { listJobs: async () => [] } });
    await api.reconcilePendingImageJobs(); api.stopImageJobRecovery();
    assert.equal((await api.getPreview(job.imgId)).status, 'failed');
    assert.equal((await api.getPreview(job.oldId)).savedUrl, '/old.png');
    assert.equal(await api.restoreImageCard(h.root.querySelector('.xb-nd-img')), true);
    assert.equal(await api.getSlotSelection(job.slotId), job.oldId);
    assert.equal(h.requests, 0);
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
