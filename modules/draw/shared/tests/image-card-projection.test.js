import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';
import { patchImageCard } from '../image-card-view.js';

// Acceptance contracts:
// - Mounting or refreshing a paid image preserves its action targets (lost access).
// - Changing title mode/version preserves the live image and TAG draft (lost edits).
// - Unknown paid outcomes retain evidence without buying a retry; recovery retains
//   the original title and orientation (duplicate charges / lost result metadata).
const args = { slotId: 'probe', imgId: 'first', url: '/image.png',
    tags: 'scene', title: '雨后', messageId: 0, state: 'saved' };

test('image projections keep actions, image identity and an open TAG draft through title changes', async t => {
    const h = await fixture(['[image:probe]']);
    t.after(h.stop);
    const card = document.createElement('div');
    card.className = 'xb-nd-img';
    h.body(0).append(card);
    let mode = 'collapse';
    h.api.setImageTitleSettingsProvider(() => ({ imageTitleMode: mode }));
    const project = title => patchImageCard(card, { html: h.api.buildImageHtml({ ...args, title }) });
    project(args.title);
    assert.ok(card.querySelector('[data-action="toggle-menu"]'));
    const img = card.querySelector('img');
    const details = card.querySelector('details');
    details.open = true;
    const editor = card.querySelector('.xb-nd-edit');
    editor.style.display = 'flex';
    editor.querySelector('textarea').value = 'unsaved draft';
    project('夜色');
    assert.ok(card.querySelector('details') === details);
    assert.ok(details.open);
    mode = 'overlay';
    project('清晨');
    mode = 'none';
    project('午后');
    mode = 'collapse';
    project('傍晚');
    assert.ok(card.querySelector('img') === img);
    assert.ok(card.querySelector('.xb-nd-edit') === editor);
    assert.equal(editor.querySelector('textarea').value, 'unsaved draft');
    assert.equal(editor.dataset.imgId, 'first');
    assert.ok(card.querySelector('[data-action="toggle-menu"]'));
    assert.ok(card.querySelector('[data-action="edit-tags"]'));
    assert.ok(card.querySelector('[data-action="delete-image"]'));
});

test('retained images keep recovery controls while pending, failed and successful projections change', async t => {
    const h = await fixture(['[image:probe]']);
    t.after(h.stop);
    const card = document.createElement('div');
    h.body(0).append(card);
    const imageHtml = h.api.buildImageHtml(args);
    const failed = h.api.buildFailedPlaceholderHtml({ ...args, historyCount: 1, errorMessage: 'HTTP 502' });
    patchImageCard(card, { html: failed, imageHtml });
    assert.ok(card.querySelector('[data-action="retry-image"]'));
    assert.ok(card.querySelector('[data-action="restore-image"]'));
    assert.ok(card.querySelector('[data-action="edit-tags"]'));
    patchImageCard(card, { html: h.api.buildPendingImageHtml({ ...args, label: 'generating' }), imageHtml });
    assert.ok(card.querySelector('.xb-nd-status .xb-nd-indicator'));
    patchImageCard(card, { html: imageHtml });
    assert.equal(card.querySelector('.xb-nd-status'), null);
    assert.ok(card.querySelector('[data-action="toggle-menu"]'));
    patchImageCard(card, { html: failed });
    assert.equal(card.querySelector('img'), null);
    assert.ok(card.querySelector('[data-action="retry-image"]'));
});

test('uncertain failures preserve transport evidence and recovery metadata without resubmission', async t => {
    const h = await fixture(['[image:probe]']);
    t.after(h.stop);
    h.start();
    await h.pump(3);
    for (const [reason, outcome] of [['HTTP 502', 'unknown'], ['decode failed', 'unknown'], ['auth rejected', 'rejected']]) {
        let plan, submitted = 0;
        const result = await h.api.submitPreparedChatImages({
            ctx: h.ctx, message: h.messages[0], messageId: 0, sourceText: h.messages[0].mes,
            tasks: [{ scene: 'scene', placement: { mode: 'existing', slotId: 'probe' } }],
            metadata: [{ tags: 'scene', title: '雨后', orientation: 'landscape' }], backend: false,
            run: async handlers => {
                submitted++;
                plan = handlers.recoverable.plan;
                await handlers.onItemStarting({ index: 0 });
                await handlers.onItemSettled({ index: 0, state: 'failed',
                    error: Object.assign(new Error(reason), { imageRequestOutcome: outcome }) });
            },
        });
        const record = await h.api.getPreview(result.results[0].imgId);
        assert.equal(submitted, 1);
        assert.equal(record.status, outcome === 'unknown' ? 'unknown' : 'failed');
        assert.ok(record.errorMessage.includes(reason));
        assert.equal(plan.items[0].previewMetadata.title, '雨后');
        assert.equal(plan.items[0].previewMetadata.orientation, 'landscape');
        await h.pump(6);
        assert.ok(h.body(0).querySelector('.xb-nd-failed-desc').textContent.includes(reason));
    }
});
