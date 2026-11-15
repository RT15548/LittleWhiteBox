import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { parseHTML } from 'linkedom';

// Acceptance (wrong-chat writes / undeletable data): a gallery-only image must
// never acquire floor-zero callbacks; actual floor-zero images keep their controls.
// Opening a chat image from gallery management without a mounted card must still
// persist use/save/delete actions (lost selected image / stale saved metadata).
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
        assert.deepEqual(writes.map(item => item[0]), ['saved', 'saved', 'deleted', 'empty', 'cleared']);
        assert.equal(writes[0][1], 0);
        assert.equal(writes[1][1], 0);
    });

    test(`${provider}: public gallery actions cannot write chat or recreate a deleted slot`, async () => {
        const source = readFileSync(new URL(`../../providers/${file}`, import.meta.url), 'utf8');
        const start = source.indexOf('async function renderGalleryManagement()');
        const body = source.slice(start, source.indexOf('\n}', start) + 2).replaceAll('import.meta.url', JSON.stringify(file));
        for (const messageId of [undefined, null, 0]) {
            const { document } = parseHTML('<html><body></body></html>');
            for (const id of ['container', 'empty', 'count', 'size']) {
                const el = document.createElement('div'); el.id = `${provider}-gallery-${id}`; document.body.append(el);
            }
            let click, opened, chatBindings = 0;
            const chatCallbacks = { onUse: () => {} };
            const render = runInNewContext(`(${body})`, {
                document, console, getSettingsElement: id => document.getElementById(id), formatBytes: String,
                getGallerySummary: async () => ({ Original: { count: 1, slots: { slot: { latestImgId: 'image', count: 1 } } } }),
                getPreview: async () => ({ imgId: 'image', messageId }), getPreviewDisplayUrl: () => '/fixture.png',
                observeAsyncCallback: fn => (...args) => { click = fn(...args); },
                openGallery: async (...args) => { opened = args; },
                buildSharedGalleryCallbacks: () => { chatBindings++; return chatCallbacks; },
            });
            await render();
            document.querySelector('.gallery-slot-btn').click();
            await click;
            assert.equal(opened[0], 'slot');
            if (messageId === 0) {
                assert.equal(opened[1], 0);
                assert.equal(opened[2], chatCallbacks);
                assert.equal(chatBindings, 1);
            } else {
                assert.equal(opened[1], null);
                assert.equal(opened[2].onUse, undefined);
                for (const action of ['onSave', 'onDelete', 'onBecameEmpty']) await opened[2][action]();
                assert.equal(chatBindings, 0);
            }
        }
    });
}
