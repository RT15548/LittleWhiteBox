import assert from 'node:assert/strict';
import test from 'node:test';
import { createDrawPublicApi } from '../public-api.js';
import { MediaApiError } from '../../../../shared/media-api.js';

// Acceptance contracts: overrides never mutate configuration (configuration loss);
// caller/config changes cannot change admitted requests (wrong paid request);
// all results survive and failures never resend (lost images / double charge);
// preset discovery never returns credentials (credential disclosure).
function harness() {
    const saved = { apiKey: 'private', apiPresets: [{ id: 'api', name: 'API', config: { apiKey: 'other' } }],
        presets: [{ id: 'one', name: 'One' }, { id: 'two', name: 'Two' }], selected: 'one' };
    const calls = [], collected = [];
    const owner = { chatId: 'original-chat', characterName: 'Original' };
    const captureGallery = request => {
        const captured = { ...owner };
        return async images => { collected.push({ owner: captured, request, images }); };
    };
    const adapter = { presetsKey: 'presets', selectedKey: 'selected', snapshot: () => structuredClone(saved),
        generate: async (...args) => { calls.push(args); return [new Blob(['a']), new Blob(['b'])]; } };
    const api = createDrawPublicApi({ isEnabled: () => true, getProvider: () => 'sdwebui', providers: { sdwebui: adapter }, captureGallery });
    return { api, saved, calls, adapter, owner, collected, captureGallery };
}
test('request and configuration are snapshotted before the async boundary', async () => {
    const h = harness();
    const request = { prompt: 'before', paramsPresetId: 'two', apiPresetId: 'api', params: { seed: 0 } };
    const promise = h.api.generate(request);
    request.prompt = 'after'; request.params.seed = 9; h.saved.apiKey = 'changed';
    h.owner.chatId = 'another-chat'; h.owner.characterName = 'Another';
    const result = await promise;
    assert.equal(result.images.length, 2);
    assert.equal(h.calls[0][0].prompt, 'before');
    assert.equal(h.calls[0][0].params.seed, 0);
    assert.equal(h.calls[0][1].apiKey, 'other');
    assert.equal(h.saved.selected, 'one');
    assert.deepEqual(h.collected[0].owner, { chatId: 'original-chat', characterName: 'Original' });
    assert.equal(h.collected[0].request.prompt, 'before');
    assert.equal(h.collected[0].images, result.images);
});
test('unknown fields and missing presets never execute', async () => {
    const h = harness();
    await assert.rejects(h.api.generate({ prompt: 'x', payload: {} }), { code: 'unsupported_field' });
    await assert.rejects(h.api.generate({ prompt: 'x', apiPresetId: 'missing' }), { code: 'preset_not_found' });
    assert.equal(h.calls.length, 0);
});

test('concurrent calls keep their own snapshot and an inactive configured provider is not activated', async () => {
    const h = harness();
    const requests = [h.api.generate({ prompt: 'one' }), h.api.generate({ prompt: 'two' })];
    h.saved.apiKey = 'changed';
    await Promise.all(requests);
    assert.deepEqual(h.calls.map(call => call[0].prompt), ['one', 'two']);
    assert.ok(h.calls.every(call => call[1].apiKey !== 'changed'));
    const api = createDrawPublicApi({ isEnabled: () => false, getProvider: () => 'test', providers: { test: h.adapter }, captureGallery: h.captureGallery });
    await assert.rejects(api.generate({ prompt: 'disabled' }), { code: 'disabled' });
    assert.equal(h.calls.length, 2);
});
test('discovery is credential-free and caller-owned', async () => {
    const h = harness();
    const presets = await h.api.getPresets();
    assert.equal(JSON.stringify(presets).includes('private'), false);
    assert.equal(JSON.stringify(presets).includes('apiKey'), false);
    presets.params[0].name = 'changed';
    assert.equal(h.saved.presets[0].name, 'One');
});
test('failure and cancellation never resend', async () => {
    const h = harness(); let calls = 0;
    h.adapter.generate = async () => { calls++; throw new Error('secret provider response'); };
    await assert.rejects(h.api.generate({ prompt: 'x' }), error => error.code === 'provider_error' && !error.message.includes('secret'));
    const controller = new AbortController(); controller.abort();
    await assert.rejects(h.api.generate({ prompt: 'x', signal: controller.signal }), { name: 'AbortError' });
    assert.equal(calls, 1);
    assert.equal(h.collected.length, 0);
});

// Paid images must reach their original gallery once, even on partial delivery or cancellation (lost images / double charge).
test('gallery ownership is captured before an asynchronous settings read', async () => {
    const h = harness();
    h.adapter.snapshot = async () => { h.owner.chatId = 'changed-during-settings'; return h.saved; };
    await h.api.generate({ prompt: 'one' });
    assert.equal(h.collected[0].owner.chatId, 'original-chat');
});

test('partial delivery and late cancellation retain all obtained images in the gallery without retry', async () => {
    for (const mode of ['partial', 'cancelled', 'cancelled-during-save']) {
        const h = harness(), controller = new AbortController();
        const images = [new Blob(['paid'])];
        let calls = 0;
        h.adapter.generate = async () => {
            calls++;
            if (mode === 'partial') throw new MediaApiError('partial_result', { partialResult: { images } });
            if (mode === 'cancelled') controller.abort();
            return images;
        };
        const captureGallery = request => {
            const save = h.captureGallery(request);
            return async value => { await save(value); if (mode === 'cancelled-during-save') controller.abort(); };
        };
        const api = createDrawPublicApi({ isEnabled: () => true, getProvider: () => 'test', providers: { test: h.adapter }, captureGallery });
        await assert.rejects(api.generate({ prompt: mode, signal: controller.signal }), error => {
            assert.equal(error.code, mode === 'partial' ? 'partial_result' : 'aborted');
            assert.equal(error.partialResult.images, images);
            return true;
        });
        assert.equal(calls, 1);
        assert.equal(h.collected.length, 1);
        assert.equal(h.collected[0].images, images);
    }
});
