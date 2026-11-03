import assert from 'node:assert/strict';
import test from 'node:test';
import { fixture } from './helpers/draw-journey.js';

// Acceptance (cost: unintended paid requests / interrupted chat image workflow):
// - NAI auto-queue OFF blocks only NAI; switching providers cannot carry that restriction.
// - NAI auto-queue ON submits each new reply once, including duplicate host events.
test('NAI manual queue stays provider-scoped across switches and duplicate receive events', async t => {
    const h = await fixture(['start']);
    t.after(() => h.stop());
    const submitted = [];
    for (const provider of ['novelai', 'sdwebui', 'comfyui']) {
        h.api.registerPreparedImageProvider(provider, async input => {
            submitted.push({ provider, messageId: input.messageId });
            input.onPrepared();
        });
    }
    h.start();
    await h.pump(2);
    for (const [provider, autoGenerateImages, shouldSubmit] of [
        ['novelai', false, false],
        ['sdwebui', false, true],
        ['comfyui', false, true],
        ['novelai', false, false],
        ['novelai', true, true],
    ]) {
        window.xiaobaixDraw.getProvider = () => provider;
        h.api.getSharedDrawSettings().autoGenerateImages = autoGenerateImages;
        await h.emit('GENERATION_AFTER_COMMANDS', 'normal');
        await h.emit('GENERATE_AFTER_DATA', {}, false);
        const messageId = h.ctx.chat.length;
        h.ctx.chat.push({ mes: '[img: portrait]', name: 'review', swipe_id: 0 });
        const before = submitted.length;
        await h.emit('MESSAGE_RECEIVED', messageId, 'normal');
        await h.emit('MESSAGE_RECEIVED', messageId, 'normal');
        assert.deepEqual(submitted.slice(before), shouldSubmit ? [{ provider, messageId }] : [],
            `${provider}, autoGenerateImages=${autoGenerateImages}`);
    }
    assert.deepEqual(h.counters.errors, []);
});
