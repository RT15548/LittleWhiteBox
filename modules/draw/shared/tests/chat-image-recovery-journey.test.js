import assert from 'node:assert/strict';
import test from 'node:test';
import { IDBObjectStore, IDBIndex } from 'fake-indexeddb';
import { fixture } from './helpers/draw-journey.js';
import { hashSceneSource } from '../scene-source.js';

// Acceptance contracts (cost: lost paid results / duplicate charges / unusable chat):
// - Opening historical tags restores paid images but never submits generation.
// - One click uses that TAG once, acknowledges immediately, and survives a page close before the host saves.
// - Removal withdraws recovery authority before a slow/failed chat save.
// - Upgrade contention exposes controls and a recoverable error, not an endless wait.
// - Lazy recovery reads only admitted floors and loads only their image bodies.
// - Navigation and edits cannot redirect results or mark unread text as recovered.
// - Same filenames in different roles/groups/accounts never borrow attachment authority.
// - Explicitly deleted slots stay deleted, including after late results.
// - Drawing never saves the chat itself; the host's autosave owns persistence.
// - Recovered multi-image scene insertions retain their original batch order.

async function setup(t, sources, options) {
    const h = await fixture(sources, options);
    t.after(() => h.stop());
    return h;
}

// Gallery acceptance (cost: lost saved inputs / cross-chat writes): a new device
// can open a saved image without generation; navigation/deletion cannot lend
// another message's authority while the initial IndexedDB read is pending.
async function savedGallery(t) {
    const h = await setup(t, ['[image:portable-slot]']);
    window.HTMLElement.prototype.scrollIntoView = () => {};
    h.ctx.chat[0].extra = { xiaobaixDrawSaved: { 'portable-slot': {
        imgId: 'portable-image', savedUrl: '/user/images/saved.png', tags: 'saved tags',
        characterPrompts: [{ name: 'Alice', prompt: 'green dress' }], postPrompt: 'fine detail',
    } } };
    return h;
}

test('opening a portable image materializes its inputs once without changing the chat or buying a result', async t => {
    const h = await savedGallery(t);
    const before = structuredClone(h.ctx.chat);
    await h.api.openGallery('portable-slot', 0);
    const record = await h.api.getPreview('portable-image');
    assert.equal(record.chatId, h.ctx.chatId);
    assert.equal(record.negativePrompt, null);
    assert.equal(record.postPrompt, 'fine detail');
    assert.deepEqual(record.characterPrompts, [{ name: 'Alice', prompt: 'green dress' }]);
    assert.equal(document.getElementById('nd-gallery-img').getAttribute('src'), '/user/images/saved.png');
    h.api.closeGallery();
    await h.api.openGallery('portable-slot', 0);
    assert.equal((await h.api.getPreviewsBySlot('portable-slot')).length, 1);
    assert.deepEqual(h.ctx.chat, before);
    assert.equal(h.counters.saves, 0);
    assert.deepEqual(h.counters.requests, []);
    h.api.closeGallery();
});

for (const change of ['chat', 'group', 'account', 'message', 'swipe', 'delete']) {
    test(`portable gallery refuses a changed source during initial read: ${change}`, async t => {
        const h = await savedGallery(t);
        const opening = h.api.openGallery('portable-slot', 0);
        if (change === 'chat') h.ctx.chatId = 'another-chat';
        if (change === 'group') h.ctx.groupId = 'another-group';
        if (change === 'account') globalThis.__drawJourneyReview.user = 'another-account';
        if (change === 'message') h.ctx.chat[0] = structuredClone(h.ctx.chat[0]);
        if (change === 'swipe') h.ctx.chat[0].swipe_id = 1;
        if (change === 'delete') h.ctx.chat[0].mes = '';
        await assert.rejects(opening);
        assert.equal(await h.api.getPreview('portable-image'), undefined);
        assert.equal(document.getElementById('nd-gallery-overlay').classList.contains('visible'), false);
        assert.deepEqual(h.counters.requests, []);
    });
}

async function legacyDatabase(h, prompt) {
    const db = await new Promise((resolve, reject) => {
        const request = h.idb.open('xb_draw_generated_images', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('images', { keyPath: 'cacheKey' });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
        const tx = db.transaction('images', 'readwrite');
        tx.objectStore('images').put({ cacheKey: 'released-v1', provider: 'old-provider', prompt,
            base64: 'UEFJRA==', timestamp: Date.now() - 9 * 86400000 });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
    return db;
}

test('old paid cache survives changed settings, expiry and a prematurely set migration flag', async t => {
    const h = await setup(t, ['[img: old paid]'], { metadata: { xbDrawTagFormat: 1 } });
    (await legacyDatabase(h, 'old paid')).close();
    h.start(); await h.pump(12);
    assert.ok(h.body(0).querySelector('img'));
    assert.equal((await h.api.getPreviewsForMessage(h.ctx.chatId, 0)).length, 1);
    assert.deepEqual(h.counters.requests, []);
    assert.equal(h.frames.size, 0);
});

test('legacy non-attempt becomes usable input and recovery stops refreshing', async t => {
    const h = await setup(t, ['[image:legacy-input]']);
    await h.api.storePreview({ imgId: 'input', slotId: 'legacy-input', messageId: 0,
        chatId: h.ctx.chatId, tags: 'never generated', status: 'failed', errorType: h.api.DRAW_SLOT_ERRORS.legacy.label });
    h.start(); await h.pump(40);
    assert.equal(h.frames.size, 0);
    assert.equal(h.body(0).querySelector('.xb-nd-img').dataset.state, 'ungenerated');
    assert.equal((await h.api.getDisplayPreviewForSlot('legacy-input')).isFailed, false);
    assert.deepEqual(h.counters.requests, []);
    await h.api.withDrawActionFeedback(h.body(0).querySelector('.xb-nd-img'),
        () => h.api.redrawImageCard('review-provider', h.body(0).querySelector('.xb-nd-img')));
    assert.deepEqual(h.counters.requests, [{ messageId: 0, tags: 'never generated' }]);
});

test('double click submits once, and reload before the host saves attaches without repurchase', async t => {
    const h = await setup(t, ['[img: untouched]', '[img: chosen]'], { holdRequest: true });
    h.start(); await h.pump(5);
    const button = h.body(1).querySelector('[data-xb-draw-tag-action]');
    button.click();
    assert.equal(button.disabled, true);
    assert.equal(button.getAttribute('aria-busy'), 'true');
    button.click(); await h.pump(6);
    assert.deepEqual(h.counters.requests, [{ messageId: 1, tags: 'chosen' }]);
    h.releaseRequest(); await h.pump(6);
    const [record] = await h.api.getPreviewsForMessage(h.ctx.chatId, 1);
    assert.equal(record.status, 'success'); assert.ok(record.base64);
    h.ctx.chat[1] = structuredClone(h.persisted()[1]);
    h.body(1).textContent = h.ctx.chat[1].mes;
    await h.emit('CHAT_CHANGED'); await h.pump(10);
    assert.equal(h.ctx.chat[1].mes, `[image:${record.slotId}]`);
    assert.ok(h.body(1).querySelector('img'));
    assert.equal(h.counters.requests.length, 1);
    assert.equal(h.ctx.chat[0].mes, '[img: untouched]');
    assert.equal(h.counters.saves, 0);
});

test('placing, reopening and rerolling never save the chat; reopening never regenerates', async t => {
    const h = await setup(t, ['[img: chosen]']);
    h.start(); await h.pump(5);
    h.body(0).querySelector('[data-xb-draw-tag-action]').click(); await h.pump(10);
    await h.emit('CHAT_CHANGED'); await h.pump(8);
    assert.equal(h.counters.requests.length, 1);
    await h.api.redrawImageCard('review-provider', h.body(0).querySelector('.xb-nd-img'));
    assert.equal(h.counters.saves, 0);
    assert.equal((await h.api.getPreviewsForMessage(h.ctx.chatId, 0)).filter(h.api.hasPreviewImage).length, 2);
});

test('removal cannot be recovered after reload', async t => {
    const h = await setup(t, ['body\n[image:delete-slot]']);
    await h.api.storePreview({ imgId: 'paid', slotId: 'delete-slot', messageId: 0, chatId: h.ctx.chatId,
        tags: 'paid', status: 'success', base64: 'UEFJRA==',
        placement: h.api.captureImagePlacement(h.api.getImageChatIdentity(h.ctx), 'body\n', 0, { mode: 'tail' }, 0) });
    h.start(); await h.pump(5);
    await h.api.removeChatImageSlot(h.body(0).querySelector('.xb-nd-img'));
    assert.equal(h.ctx.chat[0].mes, 'body\n');
    assert.equal(await h.api.getPreview('paid'), undefined);
    await h.emit('CHAT_CHANGED'); await h.pump(5);
    assert.equal(h.ctx.chat[0].mes, 'body\n');
    assert.deepEqual(h.counters.requests, []);
    assert.equal(h.counters.saves, 0);
});

test('old open tab cannot hide controls; closing it and reopening recovers the paid image', async t => {
    const h = await setup(t, ['[img: blocked old]']);
    const old = await legacyDatabase(h, 'blocked old'); t.after(() => old.close());
    h.start(); await h.pump(10);
    assert.ok(h.body(0).querySelector('[data-xb-draw-tag-action]'));
    assert.ok(h.counters.errors.length);
    assert.equal(h.frames.size, 0);
    assert.deepEqual(h.counters.requests, []);
    old.close(); await h.settle();
    await h.emit('CHAT_CHANGED'); await h.pump(12);
    assert.ok(h.body(0).querySelector('img'));
    assert.deepEqual(h.counters.requests, []);
});

test('per-floor query does not load image bodies from other chats', async t => {
    const h = await setup(t, ['body']);
    for (let id = 0; id < 20; id++) await h.api.storePreview({ imgId: `image-${id}`, slotId: `slot-${id}`,
        chatId: id ? `other-${id}` : h.ctx.chatId, messageId: 0, tags: 'tag', base64: 'A'.repeat(100000), status: 'success' });
    const originalGet = IDBObjectStore.prototype.get, originalGetAll = IDBIndex.prototype.getAll;
    let loaded = 0;
    IDBObjectStore.prototype.get = function (...args) {
        const request = originalGet.apply(this, args);
        if (this.name === 'previews') request.addEventListener('success', () => { loaded += request.result ? 1 : 0; });
        return request;
    };
    IDBIndex.prototype.getAll = function (...args) {
        const request = originalGetAll.apply(this, args);
        if (this.objectStore.name === 'previews') request.addEventListener('success', () => { loaded += request.result.length; });
        return request;
    };
    t.after(() => { IDBObjectStore.prototype.get = originalGet; IDBIndex.prototype.getAll = originalGetAll; });
    assert.equal((await h.api.getPreviewsForMessage(h.ctx.chatId, 0)).length, 1);
    assert.equal(loaded, 1);
});

test('an edit during history lookup is not falsely marked recovered', async t => {
    const h = await setup(t, ['[img: before]']);
    (await legacyDatabase(h, 'after')).close();
    const pending = h.api.adoptChatImageMessage(h.ctx, 0);
    h.ctx.chat[0].mes = '[img: after]'; h.body(0).textContent = h.ctx.chat[0].mes;
    assert.equal(await pending, false);
    h.start(); await h.pump(12);
    assert.ok(h.body(0).querySelector('img'));
    assert.deepEqual(h.counters.requests, []);
});

test('first open and streaming of 1000 floors do not read history; explicit scroll/click submits only that floor', async t => {
    const h = await setup(t, Array.from({ length: 1000 }, (_, id) => `[img: floor ${id}]`));
    const reads = new Set();
    for (const [id, message] of h.ctx.chat.entries()) {
        let value = message.mes;
        Object.defineProperty(message, 'mes', { enumerable: true, get() { reads.add(id); return value; }, set(next) { value = next; } });
    }
    h.start(); await h.pump(5); assert.deepEqual([...reads], [999]); reads.clear();
    await h.emit('GENERATION_AFTER_COMMANDS', 'continue'); await h.emit('GENERATE_AFTER_DATA', {}, false);
    for (let i = 0; i < 20; i++) {
        h.ctx.chat[999].mes += ' token'; h.body(999).textContent = h.ctx.chat[999].mes;
        h.api.drawMessageViewport.invalidate(h.body(999)); await h.pump();
    }
    assert.deepEqual([...reads], [999]); assert.deepEqual(h.counters.requests, []);
    for (const observer of h.observers) observer.callback([{ target: h.body(500), isIntersecting: true }]);
    await h.pump(5); h.body(500).querySelector('[data-xb-draw-tag-action]').click(); await h.pump(10);
    assert.deepEqual(h.counters.requests, [{ messageId: 500, tags: 'floor 500' }]);
});

test('native completion submits only new tags and does not await paid transport; navigation preserves original result owner', async t => {
    const h = await setup(t, ['[img: historical]'], { holdRequest: true });
    h.start(); await h.pump(5);
    await h.emit('GENERATION_AFTER_COMMANDS', 'continue'); await h.emit('GENERATE_AFTER_DATA', {}, false);
    h.ctx.chat[0].mes += '\n[img: new input]'; h.body(0).textContent = h.ctx.chat[0].mes;
    await h.emit('MESSAGE_RECEIVED', 0, 'continue'); await h.pump(6);
    assert.deepEqual(h.counters.requests, [{ messageId: 0, tags: 'new input' }]);
    const originalChatId = h.ctx.chatId;
    const next = { ...h.ctx, chatId: 'different-chat', chat: [{ mes: 'untouched', swipe_id: 0 }] };
    globalThis.__drawJourneyReview.ctx = next; h.body(0).textContent = 'untouched';
    await h.emit('CHAT_CHANGED'); h.releaseRequest(); await h.pump(8);
    assert.equal(next.chat[0].mes, 'untouched');
    const [result] = await h.api.getPreviewsForMessage(originalChatId, 0);
    assert.equal(result.status, 'success'); assert.ok(result.base64);
    assert.equal(h.counters.requests.length, 1);
});

function generate(h, placements = [{ mode: 'tail' }]) {
    return h.api.generatePreparedChatImages('review-provider', { ctx: h.ctx, message: h.ctx.chat[0], messageId: 0,
        sourceText: h.ctx.chat[0].mes, tasks: placements.map((placement, index) => ({ scene: `paid-${index}`, placement })) });
}

for (const scope of ['character', 'group', 'account']) test(`same filename and source in another ${scope} cannot recover the original image`, async t => {
    const h = await setup(t, ['body'], { save: 'read-fail' });
    h.ctx.chatId = 'same-filename';
    if (scope === 'character') Object.assign(h.ctx, { groupId: null, characterId: 0,
        characters: [{ name: 'same-name', avatar: 'a.png' }, { name: 'same-name', avatar: 'b.png' }] });
    await generate(h); await h.settle();
    const [record] = await h.api.getPreviewsForMessage(h.ctx.chatId, 0);
    assert.ok(record.placement); assert.ok(record.base64);
    const ctxB = { ...h.ctx, ...(scope === 'character' ? { characterId: 1 } : scope === 'group' ? { groupId: 'other-group' } : {}) };
    // Real SillyTavern reuses the same array when loading another chat.
    h.ctx.chat.splice(0, h.ctx.chat.length, { mes: 'body', swipe_id: 0 });
    globalThis.__drawJourneyReview.ctx = ctxB;
    if (scope === 'account') globalThis.__drawJourneyReview.user = 'other-user';
    const saves = h.counters.saves;
    assert.equal(await h.api.adoptChatImageMessage(ctxB, 0), false);
    assert.equal(ctxB.chat[0].mes, 'body'); assert.equal(h.counters.saves, saves);
    assert.ok((await h.api.getPreview(record.imgId)).base64);
    globalThis.__drawJourneyReview.ctx = h.ctx;
    globalThis.__drawJourneyReview.user = 'review-user';
    h.api.releaseChatImageAdmission(h.ctx.chat[0]);
    assert.equal(await h.api.adoptChatImageMessage(h.ctx, 0), true);
    assert.equal(h.ctx.chat[0].mes, `body\n[image:${record.slotId}]`);
    assert.equal(h.counters.requests.length, 1);
    await h.settle();
});

test('native deletion withdraws the placement without deleting the paid image', async t => {
    const h = await setup(t, ['body']); h.start(); await h.pump(3);
    await generate(h); await h.pump(6);
    const [record] = await h.api.getPreviewsForMessage(h.ctx.chatId, 0);
    h.ctx.chat[0].mes = 'body'; h.ctx.chat[0].swipes[0] = 'body';
    await h.emit('MESSAGE_EDITED', 0); await h.ctx.saveChat();
    h.ctx.chat[0] = structuredClone(h.persisted()[0]); h.body(0).textContent = 'body';
    await h.emit('CHAT_CHANGED'); await h.pump(6);
    assert.equal(h.ctx.chat[0].mes, 'body');
    assert.ok((await h.api.getPreview(record.imgId)).base64);
    assert.equal(h.counters.requests.length, 1);
});

test('native deletion withdraws authority before a late paid result', async t => {
    const h = await setup(t, ['body'], { holdRequest: true }); h.start(); await h.pump(3);
    const completion = generate(h); await h.pump(5);
    const [pending] = await h.api.getPreviewsForMessage(h.ctx.chatId, 0);
    assert.equal(h.counters.requests.length, 1);
    assert.ok(pending.placement);
    h.ctx.chat[0].mes = 'body'; h.ctx.chat[0].swipes[0] = 'body';
    // An in-flight recovery must not outlive the explicit native edit either.
    h.api.releaseChatImageAdmission(h.ctx.chat[0]);
    const recovery = h.api.adoptChatImageMessage(h.ctx, 0);
    await h.emit('MESSAGE_EDITED', 0);
    assert.equal(await recovery, false);
    h.releaseRequest(); await completion; await h.pump(4);
    const result = await h.api.getPreview(pending.imgId);
    assert.equal(result.status, 'success'); assert.ok(result.base64); assert.equal(result.placement, null);
    h.ctx.chat[0] = { mes: 'body', swipe_id: 0, swipes: ['body'] }; h.body(0).textContent = 'body';
    await h.emit('CHAT_CHANGED'); await h.pump(5);
    assert.equal(h.ctx.chat[0].mes, 'body'); assert.equal(h.counters.requests.length, 1);
});

test('source insertion recovers original multi-image order, not random imgId order', async t => {
    const source = 'scene\nnext';
    const h = await setup(t, [source]);
    const ids = ['z-first', 'a-second']; globalThis.__drawJourneyReview.uuid = () => ids.shift();
    const placement = { mode: 'source', sourceHash: hashSceneSource(source), offset: 5 };
    await generate(h, [placement, placement]); await h.settle();
    const original = h.ctx.chat[0].mes;
    assert.equal(original, 'scene\n[image:slot-z-first]\n[image:slot-a-second]\nnext');
    h.ctx.chat[0] = { mes: source, swipe_id: 0, swipes: [source] }; h.body(0).textContent = source;
    assert.equal(await h.api.adoptChatImageMessage(h.ctx, 0), true); await h.settle();
    assert.equal(h.ctx.chat[0].mes, original);
    assert.equal(h.counters.requests.length, 2);
    assert.ok((await h.api.getPreviewsForMessage(h.ctx.chatId, 0)).every(record => record.base64));
});
