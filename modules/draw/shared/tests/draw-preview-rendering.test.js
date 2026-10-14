import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { setImmediate } from 'node:timers';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { indexedDB, IDBObjectStore } from 'fake-indexeddb';
import { parseHTML } from 'linkedom';
import showdown from 'showdown';

// 只替换酒馆宿主边界；版本查询、选择持久化、标记识别和卡片渲染都执行生产实现。
// 使用酒馆的 Markdown 选项，不能用原文代替格式化后跨文本节点的标记。
const markdown = new showdown.Converter({
    emoji: true, literalMidWordUnderscores: true, parseImgDimensions: true,
    tables: true, underline: true, simpleLineBreaks: true, strikethrough: true,
    disableForced4SpacesIndentedSublists: true,
});
const host = { ctx: null, messageFormatting: text => markdown.makeHtml(text) };
globalThis.__drawPreviewTest = host;
globalThis.indexedDB = indexedDB;
globalThis.BroadcastChannel = undefined;
const stubs = {
    'extensions.js': 'export const getContext = () => globalThis.__drawPreviewTest.ctx;',
    'user.js': 'export const getCurrentUserHandle = () => "fixture";',
    'script.js': 'export const messageFormatting = text => globalThis.__drawPreviewTest.messageFormatting(text);',
    'utils.js': 'export const saveBase64AsFile = async () => { throw new Error("Unexpected image upload"); };',
    'event-manager.js': `
        export const createModuleEvents = () => ({ on() {}, cleanup() {} });
        export const event_types = { MESSAGE_UPDATED: 'message_updated' };
    `,
    'generate-interceptor.js': `
        export const GENERATE_INTERCEPTOR_ORDER = {};
        export const registerGenerateInterceptor = () => {};
        export const unregisterGenerateInterceptor = () => {};
    `,
};
const bundle = await build({
    stdin: {
        contents: "export * from './draw-common.js'; export * from './gallery-cache.js'; export * from './slot-activity.js'; export * from './image-card-view.js';",
        resolveDir: fileURLToPath(new URL('..', import.meta.url)),
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    plugins: [{
        name: 'preview-host-boundaries',
        setup(builder) {
            builder.onResolve({ filter: /\.js$/ }, ({ path }) => {
                const name = path.split('/').at(-1);
                return Object.hasOwn(stubs, name) ? { path: name, namespace: 'host' } : null;
            });
            builder.onLoad({ filter: /.*/, namespace: 'host' }, ({ path }) => ({ contents: stubs[path] }));
        },
    }],
});
// 只执行本测试现场构建的本地模块，没有外部输入。
// eslint-disable-next-line no-unsanitized/method
const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

function mountMessage(t, sourceText) {
    const { document, window } = parseHTML('<html><body><div id="chat"><div class="mes" mesid="0"><div class="mes_text"></div></div></div></body></html>');
    globalThis.document = document;
    globalThis.window = window;
    // DOM-only harness: resource loading is a browser boundary, tested separately.
    window.HTMLImageElement.prototype.decode = async () => {};
    const message = { mes: sourceText, name: 'Alice', extra: {} };
    host.ctx = { chatId: 'test-chat', chat: [message] };
    const root = document.querySelector('.mes_text');
    // Test-owned text formatted through the host's Markdown engine.
    // eslint-disable-next-line no-unsanitized/property
    root.innerHTML = host.messageFormatting(sourceText);
    t.after(() => api.clearPreviewObjectUrls());
    t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected network request'); });
    return { message, root };
}

function stagePendingSlots(root) {
    // Providers format the entire planned message before installing the new pending cards,
    // while the persisted message still contains only the old slots.
    const plannedText = `${host.ctx.chat[0].mes}\n[image:new-a]\n[image:new-b]`;
    // eslint-disable-next-line no-unsanitized/property
    root.innerHTML = host.messageFormatting(plannedText);
    const pending = ['new-a', 'new-b'].map((slotId, index) => {
        const inserted = api.insertPreviewIntoRenderedMessage({
            messageId: 0, slotId,
            html: api.buildPendingImageHtml({ slotId, messageId: 0, index: index + 1, total: 2 }),
        });
        assert.equal(inserted, true);
        return root.querySelector(`[data-slot-id="${slotId}"]`);
    });
    return pending;
}

async function seedImage(slotId, suffix, options = {}) {
    const imgId = `${slotId}-${suffix}`;
    await api.storePreview({ slotId, imgId, messageId: 0, characterName: 'Alice', base64: 'YWJj', ...options });
    return imgId;
}

test('host-rendered slots have a card before asynchronous gallery hydration', async t => {
    const { root } = mountMessage(t, 'Before[image:loading-slot]After');
    const iframe = document.createElement('iframe');
    root.append(iframe);
    await seedImage('loading-slot', 'image');
    const rendered = api.renderPreviewsForMessage(0, { content: root });
    assert.ok(root.querySelector('.xb-nd-img'));
    assert.equal(root.textContent.includes('[image:'), false);
    assert.ok(root.contains(iframe));
    await rendered;
    assert.ok(root.querySelector('.xb-nd-img img'));
    assert.ok(root.contains(iframe));
});

for (const savedReference of [false, true]) {
    test(`appending images preserves the selected history position (${savedReference ? 'saved reference' : 'gallery selection'})`, async t => {
        const slotId = savedReference ? 'saved-history' : 'selected-history';
        const sourceText = `Before[image:${slotId}]After`;
        const { message, root } = mountMessage(t, sourceText);
        for (const suffix of ['a', 'b', 'c']) await seedImage(slotId, suffix);
        await seedImage(slotId, 'failed', { status: 'failed', base64: null });
        const versions = (await api.getPreviewsBySlot(slotId)).filter(preview => preview.status !== 'failed');
        const selected = versions[1];
        await api.setSlotSelection(slotId, selected.imgId);
        if (savedReference) {
            message.extra.xiaobaixDrawSaved = {
                [slotId]: { imgId: selected.imgId, savedUrl: '/saved-history.png' },
            };
        }
        const pending = stagePendingSlots(root);

        await api.renderPreviewsForMessage(0);

        const card = root.querySelector(`[data-slot-id="${slotId}"]`);
        assert.equal(card.dataset.imgId, selected.imgId);
        assert.equal(card.dataset.currentIndex, '1');
        assert.equal(card.dataset.historyCount, '3');
        assert.equal(card.querySelector('.xb-nd-nav-text').textContent, '2 / 3');
        assert.equal(card.querySelector('[data-action="nav-next"]').title, '下一版本');
        assert.equal(card.querySelector('[data-action="nav-prev"]').disabled, false);
        assert.equal(await api.getSlotSelection(slotId), selected.imgId);
        for (const node of pending) assert.equal(root.contains(node), true);
        assert.equal(message.mes, sourceText);
    });
}

test('a stale gallery selection displays the latest available version with a matching position', async t => {
    const slotId = 'stale-selection';
    const { root } = mountMessage(t, `[image:${slotId}]`);
    await seedImage(slotId, 'a');
    await seedImage(slotId, 'b');
    await api.setSlotSelection(slotId, 'deleted-version');
    const latest = (await api.getPreviewsBySlot(slotId))[0];
    await api.renderPreviewsForMessage(0);
    const card = root.querySelector(`[data-slot-id="${slotId}"]`);
    assert.equal(card.dataset.imgId, latest.imgId);
    assert.equal(card.dataset.currentIndex, '0');
    assert.equal(card.querySelector('[data-action="nav-next"]').title, '重新生成');
});

test('all supported marker spellings preserve the two staged cards while rendering three old images', async t => {
    for (const spelling of ['image:', 'image : ', 'image\t:\n', 'image\n\n:\n\n', 'IMAGE:']) {
        const sourceText = [1, 2, 3].map(n => `Paragraph ${n}[${spelling}old-${n}]`).join('\n');
        const { message, root } = mountMessage(t, sourceText);
        for (const n of [1, 2, 3]) await seedImage(`old-${n}`, 'image');
        const pending = stagePendingSlots(root);

        await api.renderPreviewsForMessage(0);

        assert.equal(root.querySelectorAll('.xb-nd-img').length, 5, spelling);
        for (const node of pending) assert.equal(root.contains(node), true, spelling);
        for (const n of [1, 2, 3]) assert.ok(root.querySelector(`[data-slot-id="old-${n}"] img`), spelling);
        assert.equal(message.mes, sourceText);
    }
});

test('settlement and reopening retain old images alongside newly completed and failed slots', async t => {
    const sourceText = [1, 2, 3].map(n => `Paragraph ${n}[image\n:\nsettled-${n}]`).join('\n');
    const { message, root } = mountMessage(t, sourceText);
    for (const n of [1, 2, 3]) await seedImage(`settled-${n}`, 'image');
    stagePendingSlots(root);
    await api.renderPreviewsForMessage(0);
    const oldCards = [...root.querySelectorAll('.xb-nd-img[data-state="preview"]')];
    assert.equal(oldCards.length, 3);

    await seedImage('new-a', 'complete', { savedUrl: '/saved-new-a.png' });
    await seedImage('new-b', 'failure', { base64: null, status: 'failed', errorMessage: 'generation failed' });
    message.mes = `${sourceText}\n[image:new-a]\n[image:new-b]`;
    await api.renderPreviewsForMessage(0, { refreshSlotIds: ['new-a', 'new-b'] });
    for (const node of oldCards) assert.equal(root.contains(node), true);

    // A subsequent host render must reconstruct the same five slots from saved text/gallery.
    // eslint-disable-next-line no-unsanitized/property
    root.innerHTML = host.messageFormatting(message.mes);
    await api.renderPreviewsForMessage(0);
    assert.equal(root.querySelectorAll('.xb-nd-img').length, 5);
    assert.equal(root.querySelectorAll('.xb-nd-img img').length, 4);
    assert.equal(root.querySelector('[data-slot-id="new-a"]').dataset.state, 'saved');
    assert.equal(root.querySelector('[data-slot-id="new-b"]').dataset.state, 'failed');
    for (const n of [1, 2, 3]) {
        assert.ok(root.querySelector(`[data-slot-id="settled-${n}"] img`));
        assert.equal((await api.getPreviewsBySlot(`settled-${n}`)).length, 1);
    }
});

test('content leases respect host-filtered markers instead of restoring the raw message', async t => {
    const { root } = mountMessage(t, 'Before[image:filtered]After');
    root.textContent = 'Filtered by host';
    await api.renderPreviewsForMessage(0, { content: root, signal: new AbortController().signal });
    assert.equal(root.textContent, 'Filtered by host');
    assert.equal(root.querySelector('.xb-nd-img'), null);
});

test('only an explicit text synchronization rebuilds missing anchors', async t => {
    const slotId = 'missing-anchor';
    const { message, root } = mountMessage(t, `Before[image : ${slotId}]After`);
    await seedImage(slotId, 'image');
    root.textContent = 'outdated rendering';

    await api.renderPreviewsForMessage(0);

    assert.equal(root.textContent, 'outdated rendering');
    await api.syncRenderedMessageFromState(0, { chatId: 'test-chat', expectedMessage: message });

    assert.ok(root.querySelector(`[data-slot-id="${slotId}"] img`));
    assert.ok(root.textContent.startsWith('Before'));
    assert.ok(root.textContent.endsWith('After'));
    assert.equal(message.mes, `Before[image : ${slotId}]After`);
});

test('ordinary projections respect hidden siblings and preserve unrelated iframe identity', async t => {
    const { root } = mountMessage(t, '[image:visible-sibling]\n[image:hidden-sibling]');
    root.textContent = '[image:visible-sibling]';
    const iframe = document.createElement('iframe'); root.append(iframe);
    await seedImage('visible-sibling', 'old');
    const formatting = t.mock.method(host, 'messageFormatting');
    for (let i = 0; i < 3; i++) {
        await api.renderPreviewsForMessage(0, { refreshSlotIds: ['visible-sibling'] });
    }
    assert.equal(formatting.mock.calls.length, 0);
    assert.equal(root.querySelector('iframe'), iframe);
    assert.ok(root.querySelector('[data-slot-id="visible-sibling"] img'));
    assert.equal(root.querySelector('[data-slot-id="hidden-sibling"]'), null);
});

test('redraw progress and failure keep the old image without changing the attempt input', async t => {
    const slotId = 'stable-redraw';
    const { root } = mountMessage(t, `[image:${slotId}]`);
    const oldId = await seedImage(slotId, 'old', { tags: 'old tags' });
    await api.setSlotSelection(slotId, oldId);
    await api.renderPreviewsForMessage(0);
    const card = root.querySelector('.xb-nd-img'), img = card.querySelector('img');
    const owner = {};
    api.setSlotActivity(slotId, { owner, index: 0, total: 1, label: 'test progress' });
    t.after(() => api.clearSlotActivity(slotId, owner));
    await api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId] });
    assert.equal(root.querySelector('.xb-nd-img'), card);
    assert.equal(card.querySelector('img'), img);
    assert.equal(card.dataset.state, 'pending');
    api.clearSlotActivity(slotId, owner);
    const failedId = await seedImage(slotId, 'failed', { base64: null, status: 'failed', tags: 'new tags' });
    await api.setSlotSelection(slotId, failedId);
    await api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId] });
    assert.equal(card.querySelector('img'), img);
    assert.equal(card.dataset.state, 'failed');
    assert.equal(card.dataset.imgId, failedId);
    assert.equal(card.dataset.tags, 'new tags');
    assert.ok(card.querySelector('[data-action="restore-image"]'));
    assert.equal(card.querySelector('[data-action="restore-image"]').closest('details'), null);
    assert.equal(await api.getSlotSelection(slotId), failedId);
});

for (const failedBeforeRedraw of [false, true]) test(`an unavailable retained image cannot hide redraw state or recovery actions (already broken: ${failedBeforeRedraw})`, async t => {
    const slotId = `broken-redraw-${failedBeforeRedraw}`;
    const { root } = mountMessage(t, `[image:${slotId}]`);
    const oldId = await seedImage(slotId, 'old', { savedUrl: '/missing.png', tags: 'old tags' });
    await api.setSlotSelection(slotId, oldId);
    await api.renderPreviewsForMessage(0);
    const card = root.querySelector('.xb-nd-img'), img = card.querySelector('img');
    const input = card.querySelector('textarea');
    card.querySelector('.xb-nd-edit').style.display = 'block';
    input.value = 'retained draft';
    const failImage = () => {
        Object.defineProperties(img, { complete: { value: true, configurable: true }, naturalWidth: { value: 0, configurable: true } });
        img.dispatchEvent(new window.Event('error'));
    };
    if (failedBeforeRedraw) failImage();
    // State changes must not wait for or repeatedly retry an unavailable context image.
    const decoding = t.mock.method(window.HTMLImageElement.prototype, 'decode', () => new Promise(() => {}));
    const owner = {};
    api.setSlotActivity(slotId, { owner, index: 0, total: 1, phase: 'generating', label: 'test progress' });
    t.after(() => api.clearSlotActivity(slotId, owner));
    await api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId] });
    if (!failedBeforeRedraw) failImage();
    assert.equal(card.dataset.state, 'pending');
    assert.equal(card.querySelector('img'), img);
    assert.ok(!card.querySelector('[data-action="open-gallery"]'));
    assert.ok(!card.querySelector('[data-xb-image-view-error]'));

    api.clearSlotActivity(slotId, owner);
    const failedId = await seedImage(slotId, 'failed', { base64: null, status: 'failed', tags: 'new tags' });
    await api.setSlotSelection(slotId, failedId);
    await api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId] });
    assert.equal(root.querySelector('.xb-nd-img'), card);
    assert.equal(card.dataset.state, 'failed');
    assert.equal(card.dataset.imgId, failedId);
    assert.equal(card.dataset.tags, 'new tags');
    assert.ok(card.querySelector('[data-action="retry-image"]'));
    assert.ok(card.querySelector('[data-action="restore-image"]'));
    assert.ok(!card.querySelector('[data-xb-image-view-error]'));
    assert.equal(card.querySelector('textarea'), input);
    assert.equal(input.value, 'retained draft');
    assert.equal(decoding.mock.calls.length, 0);
    assert.equal(await api.getSlotSelection(slotId), failedId);
    assert.equal((await api.getPreview(oldId)).status, 'success');
});

test('unchanged refresh preserves the open editor, its unsaved draft and menu', async t => {
    const slotId = 'stable-editor';
    const { root } = mountMessage(t, `[image:${slotId}]`);
    await seedImage(slotId, 'old', { tags: 'persisted tags' });
    await api.renderPreviewsForMessage(0);
    const card = root.querySelector('.xb-nd-img'), editor = card.querySelector('.xb-nd-edit');
    const input = editor.querySelector('textarea');
    editor.style.display = 'block'; input.value = 'unsaved draft';
    card.querySelector('.xb-nd-menu-wrap').classList.add('open');
    await api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId] });
    assert.equal(root.querySelector('.xb-nd-img'), card);
    assert.equal(card.querySelector('textarea'), input);
    assert.equal(input.value, 'unsaved draft');
    assert.equal(editor.style.display, 'block');
    assert.ok(card.querySelector('.xb-nd-menu-wrap.open'));
});

for (const failure of ['event', 'cached']) test(`first image load failure is retryable without changing the saved record (${failure})`, async t => {
    const slotId = `first-load-${failure}`;
    const { root } = mountMessage(t, `[image:${slotId}]`);
    const imgId = await seedImage(slotId, 'saved', { savedUrl: '/saved.png', tags: 'saved tags' });
    await api.renderPreviewsForMessage(0);
    const card = root.querySelector('.xb-nd-img'), img = card.querySelector('img');
    const original = await api.getPreview(imgId);
    Object.defineProperties(img, { complete: { value: true, configurable: true }, naturalWidth: { value: 0, configurable: true } });
    const decoding = t.mock.method(window.HTMLImageElement.prototype, 'decode', async function () {
        Object.defineProperties(this, { complete: { value: true }, naturalWidth: { value: 480 } });
    });
    if (failure === 'event') img.dispatchEvent(new window.Event('error'));
    else {
        // A new projection must observe an error whose event already fired.
        api.patchImageCard(card, { html: api.buildImageHtml({ slotId, imgId, url: '/saved.png', tags: 'saved tags', messageId: 0 }) }, {
            retry: () => api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId] }),
        });
    }
    assert.ok(card.querySelector('[role="alert"] button'));
    assert.notEqual(card.dataset.state, 'failed');
    assert.equal(card.hasAttribute('data-xb-draw-loading'), false);
    await api.renderPreviewsForMessage(0);
    assert.ok(card.querySelector('[role="alert"] button'));
    assert.equal(decoding.mock.calls.length, 0, 'ordinary projection does not retry a failed resource');
    card.querySelector('[role="alert"] button').click();
    for (let turn = 0; turn < 100 && card.querySelector('[role="alert"]'); turn++) await new Promise(resolve => setImmediate(resolve));
    assert.equal(card.querySelector('[role="alert"]'), null);
    assert.equal(decoding.mock.calls.length, 1);
    assert.equal(card.dataset.imgId, imgId);
    assert.equal(card.querySelector('img').naturalWidth, 480);
    assert.deepEqual(await api.getPreview(imgId), original);
    assert.equal((await api.getPreviewsBySlot(slotId)).length, 1);
});

test('gallery read failure preserves the usable image and never fabricates a failed attempt', async t => {
    const slotId = 'stable-read-error';
    const { root } = mountMessage(t, `[image:${slotId}]`);
    const imgId = await seedImage(slotId, 'old', { tags: 'retained tags' });
    await api.renderPreviewsForMessage(0);
    const card = root.querySelector('.xb-nd-img'), img = card.querySelector('img');
    const get = IDBObjectStore.prototype.get;
    t.mock.method(IDBObjectStore.prototype, 'get', function (...args) {
        const request = get.apply(this, args);
        if (this.name === 'selections') this.transaction.abort();
        return request;
    });
    const reports = t.mock.method(console, 'error', () => {});
    await api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId] });
    assert.equal(root.querySelector('.xb-nd-img'), card);
    assert.equal(card.querySelector('img'), img);
    assert.equal(card.dataset.imgId, imgId);
    assert.equal(card.dataset.tags, 'retained tags');
    assert.notEqual(card.dataset.state, 'failed');
    assert.ok(card.querySelector('[role="alert"]'));
    assert.ok(reports.mock.calls.length);
});

for (const outcome of ['ready', 'error', 'superseded', 'detached']) {
    test(`new image decoding is independent of projection and cannot destroy the old view (${outcome})`, async t => {
        const slotId = `decode-${outcome}`;
        const { root } = mountMessage(t, `[image:${slotId}]`);
        await seedImage(slotId, 'old', { savedUrl: '/old.png' });
        await api.renderPreviewsForMessage(0);
        const card = root.querySelector('.xb-nd-img'), img = card.querySelector('img');
        let finish, fail;
        const decoding = new Promise((resolve, reject) => { finish = resolve; fail = reject; });
        const markup = id => ({ html: api.buildImageHtml({ slotId, imgId: id, url: `/${id}.png`, tags: id, positive: '', messageId: 0 }) });
        api.patchImageCard(card, markup('new'), { loadImage: () => decoding });
        assert.equal(img.getAttribute('src'), '/old.png');
        assert.equal(card.dataset.imgId, `${slotId}-old`);
        if (outcome === 'superseded') api.patchImageCard(card, markup('newest'), { loadImage: async () => {} });
        if (outcome === 'detached') card.remove();
        if (outcome === 'error') { t.mock.method(console, 'error', () => {}); fail(new Error('decode failed')); }
        else finish();
        await new Promise(resolve => setImmediate(resolve));
        assert.ok(card.querySelector('img') === img);
        assert.equal(img.getAttribute('src'), outcome === 'ready' ? '/new.png' : outcome === 'superseded' ? '/newest.png' : '/old.png');
        if (outcome === 'error') {
            assert.ok(card.querySelector('[role="alert"]'));
            assert.notEqual(card.dataset.state, 'failed');
        }
    });
}

const CODE_BLOCK = ['', '', '```html', '<div>frontend</div>', '```', ''].join('\n');

for (const refreshBeforeDecode of [false, true]) test(`continuation during image decode transfers the pending view (host refresh: ${refreshBeforeDecode})`, async t => {
    const slotId = `decode-continuation-${refreshBeforeDecode}`;
    const { message, root } = mountMessage(t, `[image:${slotId}]`);
    const oldId = await seedImage(slotId, 'old', { savedUrl: '/old.png' });
    await api.setSlotSelection(slotId, oldId);
    await api.renderPreviewsForMessage(0);
    const card = root.querySelector('.xb-nd-img'), img = card.querySelector('img');
    const editor = card.querySelector('.xb-nd-edit'), input = editor.querySelector('textarea');
    editor.style.display = 'block'; input.value = 'retained draft';
    const iframe = document.createElement('iframe'); root.append(iframe);
    const decoding = Promise.withResolvers();
    t.mock.method(window.HTMLImageElement.prototype, 'decode', () => decoding.promise);
    const newId = await seedImage(slotId, 'new', { savedUrl: '/new.png' });
    await api.setSlotSelection(slotId, newId);
    await api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId] });
    assert.equal(img.getAttribute('src'), '/old.png');
    message.mes += ' continuation'; root.append(document.createTextNode(' continuation'));
    if (refreshBeforeDecode) await api.renderPreviewsForMessage(0);
    decoding.resolve();
    // The replacement performs real asynchronous gallery reads, not a timer-based repaint.
    for (let turn = 0; turn < 100 && card.dataset.imgId !== newId; turn++) await new Promise(resolve => setImmediate(resolve));
    assert.equal(card.dataset.imgId, newId);
    assert.equal(img.getAttribute('src'), '/new.png');
    assert.equal(card.querySelector('[role="status"]'), null);
    assert.equal(root.querySelector('.xb-nd-img'), card);
    assert.equal(card.querySelector('img'), img);
    assert.equal(card.querySelector('textarea'), input);
    assert.equal(input.value, 'retained draft');
    assert.equal(root.querySelector('iframe'), iframe);
});

for (const boundary of ['chat', 'swipe', 'lease', 'edit', 'removed']) test(`obsolete image decode cannot paint across ${boundary}; a current view can resume`, async t => {
    const slotId = `decode-revoked-${boundary}`;
    const { message, root } = mountMessage(t, `[image:${slotId}]`);
    await seedImage(slotId, 'old', { savedUrl: '/old.png' });
    await api.renderPreviewsForMessage(0);
    const card = root.querySelector('.xb-nd-img'), img = card.querySelector('img');
    const decoding = Promise.withResolvers(), controller = new AbortController();
    t.mock.method(window.HTMLImageElement.prototype, 'decode', () => decoding.promise);
    const newId = await seedImage(slotId, 'new', { savedUrl: '/new.png' });
    await api.setSlotSelection(slotId, newId);
    await api.renderPreviewsForMessage(0, { refreshSlotIds: [slotId], signal: controller.signal });
    const ctx = host.ctx, source = message.mes;
    if (boundary === 'chat') host.ctx = { chatId: 'other', chat: [] };
    if (boundary === 'swipe') message.swipe_id = 1;
    if (boundary === 'lease') controller.abort();
    if (boundary === 'edit') root.closest('.mes').classList.add('editing');
    if (boundary === 'removed') message.mes = 'slot removed';
    decoding.resolve();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(img.getAttribute('src'), '/old.png');
    if (boundary === 'removed') return;
    host.ctx = ctx; message.swipe_id = 0; message.mes = source;
    root.closest('.mes').classList.remove('editing');
    await api.renderPreviewsForMessage(0);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(card.dataset.imgId, newId);
    assert.equal(img.getAttribute('src'), '/new.png');
});

test('a revoked content lease does not paint; remount reads the existing image without generating again', async t => {
    const slotId = 'leased-image';
    const { message, root } = mountMessage(t, `Before[image:${slotId}]After`);
    const imgId = await seedImage(slotId, 'image');
    await api.renderPreviewsForMessage(0, { content: root, signal: AbortSignal.abort() });
    assert.equal(root.querySelector('.xb-nd-img'), null);
    const controller = new AbortController();
    const pending = api.renderPreviewsForMessage(0, { content: root, signal: controller.signal });
    const shell = root.querySelector('.xb-nd-img');
    assert.ok(shell);
    controller.abort();
    await pending;
    // The shell predates revocation; no asynchronous hydration may replace it.
    assert.ok(root.querySelector('.xb-nd-img') === shell);
    assert.equal(shell.querySelector('img'), null);

    const nextContent = root.cloneNode(true);
    root.replaceWith(nextContent);
    const nextShell = nextContent.querySelector('.xb-nd-img');
    await api.renderPreviewsForMessage(0, { content: root, signal: new AbortController().signal });
    assert.ok(nextContent.querySelector('.xb-nd-img') === nextShell, 'stale content cannot write into its replacement');
    assert.equal(nextShell.querySelector('img'), null);
    await api.renderPreviewsForMessage(0, { content: nextContent, signal: new AbortController().signal });
    assert.equal(nextContent.querySelector('.xb-nd-img').dataset.imgId, imgId);
    assert.equal((await api.getPreviewsBySlot(slotId)).length, 1);
    assert.equal(message.mes, `Before[image:${slotId}]After`);
});

test('rebuilding a message with a code block notifies other renderers only after the rewritten DOM is in place', async t => {
    const slotId = 'rewrite-notify';
    const { message, root } = mountMessage(t, `Before[image:${slotId}]After${CODE_BLOCK}`);
    await seedImage(slotId, 'image');
    root.textContent = 'outdated rendering';
    const emitted = [];
    host.ctx.eventSource = {
        emit: async (event, messageId) => emitted.push({ event, messageId, domRewritten: root.textContent.startsWith('Before') }),
    };

    const rebuilt = await api.syncRenderedMessageFromState(0, { chatId: 'test-chat', expectedMessage: message });

    assert.equal(rebuilt, true);
    assert.deepEqual(emitted, [{ event: 'message_updated', messageId: 0, domRewritten: true }]);
});

test('rebuilding a message without any code block does not emit MESSAGE_UPDATED', async t => {
    const slotId = 'rewrite-no-pre';
    const { message, root } = mountMessage(t, `Before[image:${slotId}]After`);
    await seedImage(slotId, 'image');
    root.textContent = 'outdated rendering';
    const emitted = [];
    host.ctx.eventSource = { emit: async (...args) => emitted.push(args) };

    const rebuilt = await api.syncRenderedMessageFromState(0, { chatId: 'test-chat', expectedMessage: message });

    assert.equal(rebuilt, true);
    assert.deepEqual(emitted, []);
});

test('a failing MESSAGE_UPDATED listener does not break rebuilding the message', async t => {
    const slotId = 'rewrite-notify-error';
    const { message, root } = mountMessage(t, `Before[image:${slotId}]After${CODE_BLOCK}`);
    await seedImage(slotId, 'image');
    root.textContent = 'outdated rendering';
    host.ctx.eventSource = { emit: async () => { throw new Error('listener failed'); } };
    t.mock.method(console, 'warn', () => {});

    const rebuilt = await api.syncRenderedMessageFromState(0, { chatId: 'test-chat', expectedMessage: message });

    assert.equal(rebuilt, true);
    assert.ok(root.querySelector(`[data-slot-id="${slotId}"] img`));
});

// ── 图片管理分页读取（NovelAI 面板“往下拉再加载”的宿主侧）──────────────────

async function seedGalleryImage(characterName, slotId, imgId, { timestamp, ...options } = {}) {
    host.ctx = { chatId: 'paged-chat', chat: [] };
    await api.storePreview({ slotId, imgId, messageId: 0, characterName, base64: 'YWJj', ...options });
    if (timestamp !== undefined) await api.updatePreviewRecord(imgId, { timestamp });
}

async function deleteRecordBehindTheCache(imgId) {
    const raw = await new Promise((resolve, reject) => {
        const request = indexedDB.open('xb_novel_draw_previews');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    await new Promise((resolve) => {
        const tx = raw.transaction('previews', 'readwrite');
        tx.objectStore('previews').delete(imgId);
        tx.oncomplete = resolve;
    });
    raw.close();
}

test('slot pages are ordered by each slot\'s latest image and carry only that image; saved records carry savedUrl only', async () => {
    const who = 'PagedChar-A';
    await seedGalleryImage(who, 'p1', 'p1-a', { timestamp: 100 });
    await seedGalleryImage(who, 'p1', 'p1-b', { timestamp: 500, savedUrl: '/img/p1-b.png' });
    await seedGalleryImage(who, 'p2', 'p2-a', { timestamp: 300 });
    await seedGalleryImage(who, 'p3', 'p3-a', { timestamp: 200 });
    await seedGalleryImage(who, 'p3', 'p3-failed', { timestamp: 900, status: 'failed', base64: null }); // 失败记录不算
    await seedGalleryImage(who, 'p4', 'p4-a', { timestamp: 400 });
    await seedGalleryImage(who, 'p4', 'p4-b', { timestamp: 50 });
    await seedGalleryImage('PagedChar-Other', 'x1', 'x1-a', { timestamp: 9999 });

    const first = await api.getCharacterSlotsPage(who, { offset: 0, limit: 2 });
    assert.deepEqual(first.order, ['p1', 'p4']);
    assert.deepEqual([first.offset, first.limit, first.total, first.hasMore, first.nextOffset], [0, 2, 4, true, 2]);
    assert.deepEqual(Object.keys(first.slots).sort(), ['p1', 'p4']);
    assert.equal(first.slots.p1.length, 1, '每组只带最新一张');
    assert.equal(first.slots.p1[0].imgId, 'p1-b');
    assert.equal(first.slots.p1[0].savedUrl, '/img/p1-b.png');
    assert.equal(first.slots.p1[0].base64, null, '已保存的只带 savedUrl');
    assert.equal(first.slots.p4[0].imgId, 'p4-a');
    assert.equal(first.slots.p4[0].base64, 'YWJj', '未保存的才带 base64');
    assert.deepEqual(first.slotMeta.p1, { count: 2, hasSaved: true });
    assert.deepEqual(first.slotMeta.p4, { count: 2, hasSaved: false });

    const second = await api.getCharacterSlotsPage(who, { offset: 2, limit: 2 });
    assert.deepEqual(second.order, ['p2', 'p3']);
    assert.deepEqual([second.total, second.hasMore, second.nextOffset], [4, false, 4]);
    assert.deepEqual(second.slotMeta.p3, { count: 1, hasSaved: false });

    const all = await api.getCharacterSlotsPage(who);
    assert.equal(all.limit, 24, '缺省每页 24 个图组');
    assert.deepEqual(all.order, ['p1', 'p4', 'p2', 'p3']);
    assert.deepEqual((await api.getCharacterSlotsPage(who, { offset: 99 })).order, []);

    // 写入 / 删除会作废图组排序缓存
    await seedGalleryImage(who, 'p3', 'p3-new');
    assert.deepEqual((await api.getCharacterSlotsPage(who)).order, ['p3', 'p1', 'p4', 'p2']);
    await api.deletePreview('p3-new');
    assert.deepEqual((await api.getCharacterSlotsPage(who)).order, ['p1', 'p4', 'p2', 'p3']);
});

test('a slot whose latest record is missing or broken is skipped without failing the page', async () => {
    const who = 'PagedChar-B';
    await seedGalleryImage(who, 'q1', 'q1-a', { timestamp: 300 });
    await seedGalleryImage(who, 'q2', 'q2-a', { timestamp: 200 });
    await seedGalleryImage(who, 'q3', 'q3-a', { timestamp: 100 });
    assert.deepEqual((await api.getCharacterSlotsPage(who)).order, ['q1', 'q2', 'q3']);
    await deleteRecordBehindTheCache('q2-a'); // 排序缓存还在：读最新一张时才发现它没了
    const page = await api.getCharacterSlotsPage(who);
    assert.deepEqual(page.order, ['q1', 'q3']);
    assert.deepEqual([page.hasMore, page.nextOffset], [false, 3], '跳过的图组仍计入已消耗的位置');
});

for (const failure of ['abort', 'throw']) {
    test(`slot page ${failure} rejects rather than consuming offsets as an empty successful page; retry recovers`, async t => {
        const who = `PagedReadFailure-${failure}`;
        const slotId = `read-failure-${failure}`;
        await seedGalleryImage(who, slotId, `${slotId}-a`, { timestamp: 100 });
        assert.deepEqual((await api.getCharacterSlotsPage(who)).order, [slotId]);
        const originalGet = IDBObjectStore.prototype.get;
        const injected = new Error('injected read failure');
        const mock = t.mock.method(IDBObjectStore.prototype, 'get', function (key) {
            if (this.name !== 'previews') return originalGet.call(this, key);
            if (failure === 'throw') throw injected;
            const request = originalGet.call(this, key);
            this.transaction.abort();
            return request;
        });
        await assert.rejects(api.getCharacterSlotsPage(who), error => failure === 'abort' ? error.name === 'AbortError' : error === injected);
        mock.mock.restore();
        const retry = await api.getCharacterSlotsPage(who);
        assert.deepEqual(retry.order, [slotId]);
        assert.equal(retry.slots[slotId][0].imgId, `${slotId}-a`);
    });
}

test('slot versions load on demand: every displayable version, newest first, saved ones with savedUrl only', async () => {
    const who = 'PagedChar-C';
    await seedGalleryImage(who, 'v1', 'v1-a', { timestamp: 100 });
    await seedGalleryImage(who, 'v1', 'v1-b', { timestamp: 300, savedUrl: '/img/v1-b.png' });
    await seedGalleryImage(who, 'v1', 'v1-c', { timestamp: 200 });
    await seedGalleryImage(who, 'v1', 'v1-failed', { timestamp: 999, status: 'failed', base64: null });
    const versions = await api.getSlotVersions(who, 'v1');
    assert.deepEqual(versions.map(image => image.imgId), ['v1-b', 'v1-c', 'v1-a']);
    assert.equal(versions[0].base64, null);
    assert.equal(versions[0].savedUrl, '/img/v1-b.png');
    assert.equal(versions[1].base64, 'YWJj');
    assert.deepEqual(await api.getSlotVersions('PagedChar-Other', 'v1'), [], '角色不符不返回');
    assert.deepEqual(await api.getSlotVersions(who, 'no-such-slot'), []);
});
