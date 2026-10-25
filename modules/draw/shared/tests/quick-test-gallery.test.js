import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';

// Acceptance (paid data / wrong-chat writes): a quick-test gallery opens the
// requested cached image without attaching it to chat; returning to a normal
// chat gallery still exposes that gallery's existing use-image action.
test('quick-test selection stays local and does not become a chat attachment', async t => {
    const h = await fixture(['first message']);
    t.after(() => { h.api.closeGallery(); h.stop(); });
    const elementPrototype = Object.getPrototypeOf(h.body(0));
    const previousScroll = elementPrototype.scrollIntoView;
    elementPrototype.scrollIntoView = () => {};
    t.after(() => { elementPrototype.scrollIntoView = previousScroll; });
    for (const imgId of ['older', 'newer']) {
        await h.api.storePreview({ imgId, slotId: 'test-history', savedUrl: `/images/${imgId}.png`, source: 'quick-test' });
    }
    await h.api.openGallery('test-history', null, {}, 'older');
    assert.equal(document.getElementById('nd-gallery-img').dataset.imgId, 'older');
    assert.equal(document.getElementById('nd-gallery-use').hidden, true);
    assert.equal(await h.api.getSlotSelection('test-history'), null);
    assert.equal(h.counters.saves, 0);
    assert.deepEqual(h.ctx.chat.map(message => message.mes), ['first message']);
    h.api.closeGallery();
    await h.api.openGallery('test-history', 0);
    assert.equal(document.getElementById('nd-gallery-use').hidden, false);
    const pendingOpen = h.api.openGallery('test-history', null);
    h.api.closeGallery();
    await pendingOpen;
    assert.equal(document.getElementById('nd-gallery-overlay').classList.contains('visible'), false);
});
