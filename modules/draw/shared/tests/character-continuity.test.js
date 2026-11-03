import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';
import { executePreparedSlots } from '../prepared-slot-executor.js';
import { normalizePendingImageJob } from '../pending-image-jobs.js';
import { prepareImageInput } from '../prepared-image-input.js';
import { compileNovelPromptForTask } from '../../providers/novelai/compiler.js';
import projection from '../../server/draw-runs/projection.js';
import { buildContinuityFromImageRecords } from '../character-continuity.js';

// Acceptance contracts (cost: unintended paid requests / invisible false history):
// - Manual planning never calls transport, even with backend mode enabled; failed placement cleans up.
// - Only visible, successful, selected images on each living source branch contribute facts.
// - Compiler facts survive backend journal and saved-chat reload without a parallel history store.
// - Character TAG edits revoke the affected snapshot, including earlier stale facts, without guessing new tags.
for (const backend of [false, true]) test(`manual planning makes no paid request, backend=${backend}`, async () => {
    const saved = new Map(); let commits = 0; let requests = 0;
    const options = {
        items: [{ slotId: 'slot', imgId: 'image' }], backend, manual: true,
        store: async item => saved.set(item.imgId, item), remove: async id => saved.delete(id),
        activity: () => {}, render: async () => {},
        commit: async () => { commits++; return true; }, run: async () => { requests++; },
    };
    assert.equal((await executePreparedSlots(options)).manual, true);
    assert.equal(saved.get('image').status, 'ungenerated');
    assert.equal(commits, 1);
    await assert.rejects(executePreparedSlots({ ...options, commit: async () => false }));
    assert.equal(saved.size, 0);
    assert.equal(requests, 0);
});

async function image(h, slotId, costume, extra = {}) {
    await h.api.storePreview({ imgId: slotId, slotId, messageId: 1, chatId: h.ctx.chatId,
        status: 'success', savedUrl: '/images/test.png',
        continuityChars: [{ name: 'Alice', costume }], ...extra });
}
const read = h => h.api.getContinuityImageRecords({ chat: h.ctx.chat, beforeMessageId: h.ctx.chat.length - 1 });
const costumes = records => records.flatMap(record => record.continuityChars.map(char => char.costume));

test('historical branches and selected versions, not target swipe or generation time, own continuity', async t => {
    const h = await fixture(['start', '[image:red]', 'target']); t.after(() => h.stop());
    const previous = h.ctx.chat[1];
    previous.swipes = ['[image:red]', '[image:blue]'];
    previous.swipe_id = 1; previous.mes = previous.swipes[1];
    await image(h, 'red', 'red dress', { swipeIndex: 0 });
    await image(h, 'blue', 'blue dress', { swipeIndex: 1 });
    await image(h, 'blue', 'discarded green dress', { imgId: 'green' });
    await h.api.setSlotSelection('blue', 'blue');
    assert.deepEqual(costumes(await read(h)), ['blue dress']);
    previous.swipe_id = 0; previous.mes = previous.swipes[0];
    assert.deepEqual(costumes(await read(h)), ['red dress']);
    previous.swipe_id = 1; previous.mes = previous.swipes[1];
    await image(h, 'blue', 'failed dress', { imgId: 'failed', status: 'failed', savedUrl: null });
    await h.api.setSlotSelection('blue', 'failed');
    assert.deepEqual(await read(h), []);
});

test('middle deletion and slot removal cannot reuse stale gallery floor numbers', async t => {
    const h = await fixture(['start', '[image:deleted]', '[image:kept]', 'target']); t.after(() => h.stop());
    await image(h, 'deleted', 'deleted dress');
    await image(h, 'kept', 'kept dress', { messageId: 2 });
    h.ctx.chat.splice(1, 1);
    assert.deepEqual(costumes(await read(h)), ['kept dress']);
    h.ctx.chat[1].mes = 'image removed';
    assert.deepEqual(await read(h), []);
    assert.ok(await h.api.getPreview('deleted'), 'removing a floor must not erase paid gallery images');
});

test('saved chat metadata retains continuity after cache loss and reload', async t => {
    const h = await fixture(['[image:saved]', 'target']); t.after(() => h.stop());
    const chars = [{ name: 'Alice', costume: 'saved coat' }];
    await h.api.setDrawSavedEntry(0, 'saved', { imgId: 'saved-image', savedUrl: '/images/saved.png', continuityChars: chars });
    h.ctx.chat = structuredClone(h.persisted());
    assert.deepEqual(costumes(await read(h)), ['saved coat']);
    const materialized = await h.api.materializeDrawSavedPreview(h.ctx.chat[0], 'saved', { messageId: 0, chatId: h.ctx.chatId });
    assert.deepEqual(materialized.continuityChars, chars);
    assert.deepEqual((await h.api.getPreview('saved-image')).continuityChars, chars);
});

test('browser and signed runtime use identical compiled snapshots through journal normalization', () => {
    const chars = [{ name: 'Alice', appear: 'black hair', costume: 'blue dress' }];
    const prepared = prepareImageInput('novelai', [{ scene: 'portrait', chars }], {
        apiBaseUrl: 'https://example.com', apiKey: 'fixture', timeout: 30000, requestDelay: { min: 0, max: 0 },
        autoLearnEnabled: false, autoLearnMode: 'new_only', resolveForBackend: false, seeds: [1],
        params: { model: 'nai-diffusion-4-5-full', width: 832, height: 1216, steps: 28, scale: 5, sampler: 'k_euler', scheduler: 'native' },
    });
    for (const metadata of [prepared.metadata[0], projection.buildDisplayMetadata(prepared.compiledBatch.artifacts[0])]) {
        const record = normalizePendingImageJob({ jobId: 'job', provider: 'novelai', leaseId: 'lease', state: 'active',
            delivery: { mode: 'slots', chatId: 'chat', messageId: '1', swipeIndex: 1 },
            items: [{ index: 0, slotId: 'slot', imgId: 'image', previewMetadata: metadata }] });
        assert.deepEqual(record.items[0].previewMetadata.continuityChars, chars);
    }
});

for (const mode of ['single', 'failed-floor']) test(`TAG edits revoke stale facts before ${mode} redraw`, async t => {
    const h = await fixture(['[image:edited-slot]']); t.after(() => h.stop());
    const characters = [{ prompt: 'red dress', uc: '' }, { prompt: 'black coat', uc: '' }];
    const chars = [{ name: 'Alice', costume: 'red dress' }, { name: 'Bobby', costume: 'black coat' }];
    await h.api.storePreview({ imgId: 'edited-image', slotId: 'edited-slot', messageId: 0,
        chatId: h.ctx.chatId, tags: 'portrait', status: mode === 'single' ? 'ungenerated' : 'failed', characterPrompts: characters, continuityChars: chars });
    await h.api.setSlotSelection('edited-slot', 'edited-image');
    h.start(); await h.pump(8);
    const card = h.body(0).querySelector('.xb-nd-img'), panel = card.querySelector('.xb-nd-edit');
    panel.replaceChildren();
    for (const field of [{ type: 'scene', value: 'portrait' }, ...h.api.getCharacterTagEditGroups(characters)]) {
        const input = document.createElement('textarea'); input.dataset.type = field.type;
        if (field.index !== undefined) input.dataset.index = field.index;
        input.value = field.value; panel.append(input);
    }
    await h.api.readCardTagEditor(card);
    panel.querySelector('[data-type="char"][data-index="0"]').value = 'blue dress';
    await h.api.persistCardTagEdits(card, () => ({}));
    let submitted;
    h.api.registerPreparedImageProvider('continuity-check', async input => { submitted = input.tasks[0]; });
    if (mode === 'single') await h.api.redrawImageCard('continuity-check', card);
    else await h.api.redrawFloorFailedImageCards('continuity-check', card);
    assert.equal(compileNovelPromptForTask(submitted).characterPrompts[0].prompt, 'blue dress');
    const history = buildContinuityFromImageRecords([{ continuityChars: chars }, { continuityChars: submitted.chars }]);
    assert.deepEqual(history.entries.map(({ name, costume }) => ({ name, costume })), [{ name: 'Bobby', costume: 'black coat' }]);
});
