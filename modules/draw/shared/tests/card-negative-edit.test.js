import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';
import { compileNovelPromptForTask } from '../../providers/novelai/compiler.js';
import { compileSdPromptForTask } from '../../providers/sd-webui/compiler.js';
import { compileComfyPromptForTask } from '../../providers/comfyui/compiler.js';

// Acceptance contracts (cost: lost edits / paying for an image with unintended inputs):
// - Saving a card can change or clear each character's negative without changing another character or the library.
// - Single and failed-floor redraws combine saved character edits with the current global negative, not a historical result.
const characters = [
    { name: 'Alice', prompt: 'red dress', uc: 'hat', center: { x: 0.2, y: 0.5 } },
    { name: 'Bob', prompt: 'blue coat', uc: 'glasses', center: { x: 0.8, y: 0.5 } },
];

async function setup(t) {
    const h = await fixture(['[image:edited-slot]']);
    t.after(() => h.stop());
    await h.api.storePreview({ imgId: 'edited-image', slotId: 'edited-slot', messageId: 0,
        chatId: h.ctx.chatId, tags: 'portrait', status: 'failed',
        characterPrompts: structuredClone(characters), negativePrompt: 'old global, hat, glasses' });
    await h.api.setSlotSelection('edited-slot', 'edited-image');
    h.start(); await h.pump(8);
    const card = h.body(0).querySelector('.xb-nd-img');
    const panel = card.querySelector('.xb-nd-edit');
    panel.replaceChildren();
    for (const field of [{ type: 'scene', value: 'portrait' }, ...h.api.getCharacterTagEditGroups(characters)]) {
        const input = document.createElement('textarea');
        input.dataset.type = field.type;
        if (field.index !== undefined) input.dataset.index = field.index;
        input.value = field.value;
        panel.append(input);
    }
    await h.api.readCardTagEditor(card);
    return { h, card, panel };
}

test('card negative edits persist by character, including an explicit clear', async t => {
    const { h, card, panel } = await setup(t);
    panel.querySelector('[data-type="uc"][data-index="0"]').value = '  scarf  ';
    panel.querySelector('[data-type="uc"][data-index="1"]').value = '';
    await h.api.persistCardTagEdits(card, () => ({}));
    const saved = await h.api.getPreview('edited-image');
    assert.deepEqual(saved.characterPrompts, [
        { ...characters[0], uc: 'scarf' }, { ...characters[1], uc: '' },
    ]);
    assert.equal(characters[0].uc, 'hat');
    assert.equal(characters[1].uc, 'glasses');
    assert.equal(h.counters.requests.length, 0);
});

for (const mode of ['single', 'failed-floor']) {
    test(`${mode} redraw uses the edited characters and current global negative for all providers`, async t => {
        const { h, card, panel } = await setup(t);
        panel.querySelector('[data-type="uc"][data-index="0"]').value = 'scarf';
        panel.querySelector('[data-type="uc"][data-index="1"]').value = '';
        await h.api.persistCardTagEdits(card, () => ({}));
        const submitted = [];
        h.api.registerPreparedImageProvider('negative-check', async input => { submitted.push(...input.tasks); });
        if (mode === 'single') await h.api.redrawImageCard('negative-check', card);
        else await h.api.redrawFloorFailedImageCards('negative-check', card);
        assert.equal(submitted.length, 1);
        const task = submitted[0];
        assert.equal(Object.hasOwn(task, 'negativePrompt'), false);
        for (const negativePrefix of ['current global', '']) {
            const recipe = { negativePrefix, knownCharacters: [{ name: 'Alice', negativeTags: 'library negative' }] };
            for (const compile of [compileSdPromptForTask, compileComfyPromptForTask]) {
                assert.equal(compile(task, recipe).negative, negativePrefix ? `${negativePrefix}, scarf` : 'scarf');
            }
            const novel = compileNovelPromptForTask(task, recipe);
            assert.equal(novel.negativePrompt, negativePrefix);
            assert.deepEqual(novel.characterPrompts.map(character => character.uc), ['scarf', '']);
        }
    });
}
