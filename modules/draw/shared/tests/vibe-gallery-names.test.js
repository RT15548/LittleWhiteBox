import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareImageInput } from '../prepared-image-input.js';
import { normalizePendingImageJob } from '../pending-image-jobs.js';
import { normalizeDrawRunHandoff } from '../draw-run-adoption.js';
import { deriveDrawRunChildJobId, deriveDrawRunItemIds } from '../draw-run-identifiers.js';
import projection from '../../server/draw-runs/projection.js';
import { fixture } from './helpers/draw-journey.js';

// Acceptance: applied Vibe provenance survives live/backend delivery, export and
// saved-chat restoration (invisible metadata loss); unsupported models must not
// claim references they did not send (misleading paid-generation provenance).
const names = '水彩、夜景';
const recipe = () => ({ seeds: [1], timeout: 30000, requestDelay: { min: 0, max: 0 },
    apiBaseUrl: 'https://example.com', apiKey: 'fixture', autoLearnEnabled: false, autoLearnMode: 'new_only',
    params: { model: 'nai-diffusion-4-5-full', width: 832, height: 1216 },
    vibeReferences: [{ name: '水彩', encoding: 'paid-one', strength: .3 },
        { name: '夜景', encoding: 'paid-two', strength: .6 }, { name: '未编码', encoding: '' }] });

test('browser and backend handoff retain the names of the compiled Vibe references', () => {
    const source = recipe();
    const prepared = prepareImageInput('novelai', [{ scene: 'portrait' }], source);
    source.vibeReferences[0].name = 'renamed after submission';
    assert.equal(prepared.metadata[0].vibeNames, names);
    const runId = 'vibe-run';
    const marker = { version: 1, provider: 'novelai', sourceHash: 'source', targetHash: 'target', createdAt: 1 };
    const handoff = normalizeDrawRunHandoff({ id: runId, provider: 'novelai', state: 'dispatched', sourceHash: 'source',
        handoffManifest: { childJobId: deriveDrawRunChildJobId(runId), provider: 'novelai', sourceHash: 'source', placementContract: 1,
            items: [{ index: 0, ...deriveDrawRunItemIds(runId, 0), insertOffset: 0,
                displayMetadata: projection.buildDisplayMetadata(prepared.compiledBatch.artifacts[0]) }] } }, marker);
    const record = normalizePendingImageJob({ jobId: handoff.childJobId, provider: 'novelai', state: 'active', leaseId: 'lease',
        delivery: { mode: 'gallery' }, items: handoff.items });
    assert.equal(record.items[0].previewMetadata.vibeNames, names);
    for (const model of ['nai-diffusion-3', 'nai-diffusion-5-full']) {
        const input = recipe(); input.params.model = model;
        assert.equal(prepareImageInput('novelai', [{ scene: 'portrait' }], input).metadata[0].vibeNames, '');
    }
});

test('live delivery and its recoverable plan keep compiled Vibe provenance', async t => {
    const h = await fixture(['[image:live-vibe]']); t.after(h.stop);
    const tasks = [{ scene: 'portrait', placement: { mode: 'existing', slotId: 'live-vibe' } }];
    const prepared = prepareImageInput('novelai', tasks, recipe());
    let delivered;
    await h.api.submitPreparedChatImages({ ctx: h.ctx, message: h.messages[0], messageId: 0, sourceText: h.messages[0].mes,
        tasks, metadata: prepared.metadata, backend: false,
        run: async handlers => {
            assert.equal(handlers.recoverable.plan.items[0].previewMetadata.vibeNames, names);
            delivered = handlers.recoverable.plan.items[0].imgId;
            await handlers.onItemStarting({ index: 0 });
            await handlers.onItemReady({ index: 0, base64: 'aGVsbG8=' });
        } });
    assert.equal((await h.api.getPreview(delivered)).vibeNames, names);
});

test('Vibe provenance survives export, saved-chat restoration and failed placeholders', async t => {
    const h = await fixture(['[image:vibe-slot]']); t.after(h.stop);
    const input = { imgId: 'vibe-image', slotId: 'vibe-slot', messageId: 0, base64: 'aGVsbG8=', vibeNames: names };
    await h.api.storePreview(input);
    assert.equal((await h.api.getSlotVersions(undefined, input.slotId))[0].vibeNames, names);
    const portable = await h.api.exportPortablePreviewsForSlots(['vibe-slot']);
    await h.api.deletePreview(input.imgId);
    await h.api.importPortablePreviews(portable.previews, portable.selections);
    await h.api.updatePreviewSavedUrl(input.imgId, '/images/vibe.png');
    await h.api.syncDrawSavedFromPreview(0, await h.api.getPreview(input.imgId));
    await h.api.deletePreview(input.imgId);
    h.ctx.chat = structuredClone(h.persisted());
    await h.api.materializeDrawSavedPreview(h.ctx.chat[0], input.slotId, { messageId: 0, chatId: h.ctx.chatId });
    assert.equal((await h.api.getPreview(input.imgId)).vibeNames, names);
    await h.api.updatePreviewRecord(input.imgId, { vibeNames: '另一组' });
    await h.api.syncDrawSavedFromPreview(0, await h.api.getPreview(input.imgId));
    assert.equal(h.api.getDrawSavedPreview(h.ctx.chat[0], input.slotId, 0, h.ctx.chatId).vibeNames, '另一组');
    await h.api.storeFailedPlaceholder({ ...input, imgId: 'failed-vibe' });
    assert.equal((await h.api.getPreview('failed-vibe')).vibeNames, names);
});
