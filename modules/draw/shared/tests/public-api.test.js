import assert from 'node:assert/strict';
import test from 'node:test';
import { createDrawPublicApi } from '../public-api.js';

// Acceptance contracts: overrides never mutate configuration (configuration loss);
// caller/config changes cannot change admitted requests (wrong paid request);
// all results survive and failures never resend (lost images / double charge);
// preset discovery never returns credentials (credential disclosure).
function harness() {
    const saved = { apiKey: 'private', apiPresets: [{ id: 'api', name: 'API', config: { apiKey: 'other' } }],
        presets: [{ id: 'one', name: 'One' }, { id: 'two', name: 'Two' }], selected: 'one' };
    const calls = [];
    const adapter = { presetsKey: 'presets', selectedKey: 'selected', snapshot: () => structuredClone(saved),
        generate: async (...args) => { calls.push(args); return [new Blob(['a']), new Blob(['b'])]; } };
    const api = createDrawPublicApi({ isEnabled: () => true, getProvider: () => 'sdwebui', providers: { sdwebui: adapter } });
    return { api, saved, calls, adapter };
}
test('request and configuration are snapshotted before the async boundary', async () => {
    const h = harness();
    const request = { prompt: 'before', paramsPresetId: 'two', apiPresetId: 'api', params: { seed: 0 } };
    const promise = h.api.generate(request);
    request.prompt = 'after'; request.params.seed = 9; h.saved.apiKey = 'changed';
    const result = await promise;
    assert.equal(result.images.length, 2);
    assert.equal(h.calls[0][0].prompt, 'before');
    assert.equal(h.calls[0][0].params.seed, 0);
    assert.equal(h.calls[0][1].apiKey, 'other');
    assert.equal(h.saved.selected, 'one');
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
    const api = createDrawPublicApi({ isEnabled: () => false, getProvider: () => 'test', providers: { test: h.adapter } });
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
});
