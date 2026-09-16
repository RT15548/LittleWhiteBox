import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { indexedDB } from 'fake-indexeddb';
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
    'script.js': 'export const messageFormatting = text => globalThis.__drawPreviewTest.messageFormatting(text);',
    'utils.js': 'export const saveBase64AsFile = async () => { throw new Error("Unexpected image upload"); };',
    'event-manager.js': `
        export const createModuleEvents = () => ({ on() {}, cleanup() {} });
        export const event_types = {};
    `,
    'generate-interceptor.js': `
        export const GENERATE_INTERCEPTOR_ORDER = {};
        export const registerGenerateInterceptor = () => {};
        export const unregisterGenerateInterceptor = () => {};
    `,
};
const bundle = await build({
    stdin: {
        contents: "export * from './draw-common.js'; export * from './gallery-cache.js';",
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

test('genuinely missing anchors still rebuild from the current persisted message', async t => {
    const slotId = 'missing-anchor';
    const { message, root } = mountMessage(t, `Before[image : ${slotId}]After`);
    await seedImage(slotId, 'image');
    root.textContent = 'outdated rendering';

    await api.renderPreviewsForMessage(0);

    assert.ok(root.querySelector(`[data-slot-id="${slotId}"] img`));
    assert.ok(root.textContent.startsWith('Before'));
    assert.ok(root.textContent.endsWith('After'));
    assert.equal(message.mes, `Before[image : ${slotId}]After`);
});
