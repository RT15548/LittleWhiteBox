import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';

const SLOT = 'slot';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN3sAAAAASUVORK5CYII=';
const SAVED_URL = '/user/images/fixture.png';

async function settingsGallery(t) {
    const h = await fixture(['[image:slot]'], {
        sources: ['provider-settings-sections.js', 'provider-settings-markup.js'],
        stubs: {
            'image-save.js': `export const saveImageToServer=async()=>${JSON.stringify(SAVED_URL)}; export const getImageFolderName=()=>"review"; export const openImageFolder=async()=>{};`,
        },
    });
    const prevConfirm = globalThis.confirm;
    globalThis.confirm = () => true;
    t.after(() => { h.api.closeGallery(); h.stop(); globalThis.confirm = prevConfirm; });
    window.HTMLElement.prototype.scrollIntoView = () => {};
    const panel = document.createElement('section');
    panel.dataset.drawSharedSection = 'gallery';
    document.body.append(panel);
    h.api.mountProviderSettingsSections(document);
    const settings = h.api.createProviderSettingsSections({ getSettingsDocument: () => document });
    const open = async image => {
        await h.api.storePreview({ imgId: 'fixture', slotId: SLOT, characterName: 'Original', tags: 'keep me',
            base64: PNG, chatId: h.ctx.chatId, ...image });
        await settings.renderGalleryManagement();
        panel.querySelector('.gallery-slot-btn').click();
        await h.pump(2);
    };
    return { ...h, open };
}

// An external or gallery-only image must never inherit floor-zero callbacks;
// an owned floor-zero image keeps its controls and a retriable slot on deletion.
test('shared management gallery resolves ownership before deleting a slot image', async t => {
    for (const [messageId, owned] of [[0, false], [9, false], [0, true], [null, false]]) {
        await t.test(`message ${messageId}; owned ${owned}`, async sub => {
            const h = await settingsGallery(sub);
            await h.open({ messageId,
                ...(messageId === null ? { source: 'public-api' } : !owned ? { chatId: 'elsewhere' } : {}) });
            assert.equal(document.getElementById('nd-gallery-use').hidden, !owned);
            document.getElementById('nd-gallery-delete').click();
            await h.pump(8);
            const remaining = await h.api.getPreview('fixture');
            if (owned) assert.deepEqual([remaining.status, remaining.tags], ['failed', 'keep me']);
            else assert.equal(remaining, undefined);
            assert.equal(h.ctx.chat[0].mes, '[image:slot]');
            assert.equal(h.counters.saves, 0);
        });
    }
});

test('saving a gallery-managed image attaches its saved preview without a mounted card', async t => {
    const h = await settingsGallery(t);
    await h.open({ messageId: 0 });
    assert.equal(document.querySelector('.xb-nd-img'), null);
    document.getElementById('nd-gallery-save').click();
    await h.pump(8);
    const preview = h.api.getDrawSavedPreview(h.ctx.chat[0], SLOT, 0, h.ctx.chatId);
    assert.equal(preview?.savedUrl, SAVED_URL);
    assert.equal((await h.api.getPreview('fixture'))?.savedUrl, SAVED_URL);
    assert.equal(h.counters.saves, 1);
});
