import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';

// Acceptance (wrong-chat writes / undeletable data): a gallery-only image must
// never acquire floor-zero callbacks; actual floor-zero images keep their controls.
// Opening a chat image from gallery management without a mounted card must still
// persist use/save. Deletion is owned by the shared gallery transaction, never repeated by view callbacks.
for (const [provider, file] of [['sd', 'sd-webui/sd-draw.js'], ['comfy', 'comfyui/comfy-draw.js']]) {
    test(`${provider}: chat gallery actions work without an initiating image card`, async () => {
        const source = readFileSync(new URL(`../../providers/${file}`, import.meta.url), 'utf8');
        const start = source.indexOf('function buildSharedGalleryCallbacks(');
        const body = source.slice(start, source.indexOf('\n}', start) + 2).replaceAll('import.meta.url', JSON.stringify(file));
        const writes = [];
        const preview = { imgId: 'image', slotId: 'slot', savedUrl: '/saved.png' };
        const callbacks = runInNewContext(`(${body})('slot', 0)`, {
            console, getPreview: async () => preview,
            syncDrawSavedFromPreview: async (...args) => writes.push(['saved', ...args]),
            syncDrawSavedAfterDeletion: async (...args) => writes.push(['deleted', ...args]),
            clearDrawSavedEntry: async (...args) => writes.push(['cleared', ...args]),
            storeFailedPlaceholder: async (...args) => writes.push(['empty', ...args]),
            getSettingsElement: () => null,
        });
        callbacks.onUse('slot', 0, preview, 1);
        await callbacks.onSave('image', '/saved.png');
        await callbacks.onDelete('slot', 'image', []);
        await callbacks.onBecameEmpty('slot', 0);
        assert.deepEqual(writes.map(item => item[0]), ['saved', 'saved']);
        assert.equal(writes[0][1], 0);
        assert.equal(writes[1][1], 0);
    });

    test(`${provider}: management deletes other chats' images without touching the current chat`, async t => {
        const source = readFileSync(new URL(`../../providers/${file}`, import.meta.url), 'utf8');
        const start = source.indexOf('async function renderGalleryManagement()');
        const body = source.slice(start, source.indexOf('\n}', start) + 2).replaceAll('import.meta.url', JSON.stringify(file));
        const h = await fixture(['[image:slot]']);
        t.after(() => { h.api.closeGallery(); h.stop(); });
        window.HTMLElement.prototype.scrollIntoView = () => {};
        const prevConfirm = globalThis.confirm;
        globalThis.confirm = () => true;
        t.after(() => { globalThis.confirm = prevConfirm; });
        for (const id of ['container', 'empty', 'count', 'size']) {
            const el = document.createElement('div'); el.id = `${provider}-gallery-${id}`; document.body.append(el);
        }
        for (const [messageId, owned] of [[0, false], [9, false], [0, true], [null, false]]) {
            const external = messageId !== null && !owned;
            const id = 'image' + messageId + owned;
            await h.api.storePreview({ imgId: id, slotId: 'slot', messageId, tags: 'keep me', base64: 'UEFJRA==',
                source: messageId === null ? 'public-api' : '', chatId: external ? 'elsewhere' : h.ctx.chatId });
            let click;
            const render = runInNewContext(`(${body})`, {
                document, console, getSettingsElement: id => document.getElementById(id), formatBytes: String,
                getGallerySummary: async () => ({ Original: { count: 1, slots: { slot: { latestImgId: id, count: 1 } } } }),
                getPreview: h.api.getPreview, getPreviewDisplayUrl: () => '/fixture.png',
                observeAsyncCallback: fn => (...args) => { click = fn(...args); },
                openManagementGallery: h.api.openManagementGallery, buildSharedGalleryCallbacks: () => ({}),
            });
            await render();
            document.querySelector('.gallery-slot-btn').click();
            await click;
            assert.equal(document.getElementById('nd-gallery-use').hidden, !owned);
            document.getElementById('nd-gallery-delete').click();
            await h.pump(8);
            const remaining = await h.api.getPreview(id);
            if (owned) assert.deepEqual([remaining.status, remaining.tags], ['failed', 'keep me']);
            else assert.equal(remaining, undefined);
            assert.equal(h.ctx.chat[0].mes, '[image:slot]');
            assert.equal(h.counters.saves, 0);
            h.api.closeGallery();
        }
    });
}
