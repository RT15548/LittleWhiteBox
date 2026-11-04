import assert from 'node:assert/strict';
import test from 'node:test';
import { createVibeEncodingService } from '../vibe-encoding.js';

// Acceptance (double billing / encoding loss): reopening the UI cannot duplicate
// a paid request; completion persists without the iframe; only explicit force re-encodes.
test('host owns in-flight encoding and reuses persisted results after iframe replacement', async () => {
    let release;
    let calls = 0;
    let item = { id: 'one', image: 'image', encodings: {} };
    const service = createVibeEncodingService({
        readItem: () => item,
        encode: () => { calls++; return new Promise(resolve => { release = resolve; }); },
        save: async (_input, key, encoding) => { item.encodings[key] = encoding; return true; },
    });
    const input = { id: 'one', image: 'image', model: 'nai-diffusion-4-5-full', informationExtracted: .65 };
    const first = service.run(input);
    await Promise.resolve();
    item = structuredClone(item);
    const reopened = service.run(input);
    assert.equal(calls, 1);
    release('paid');
    assert.deepEqual(await first, await reopened);
    assert.deepEqual(service.activeIds(), []);
    assert.equal((await service.run(input)).encoding, 'paid');
    assert.equal(calls, 1);
    const forced = service.run({ ...input, force: true });
    await Promise.resolve();
    assert.equal(calls, 2);
    release('new-paid');
    assert.equal((await forced).encoding, 'new-paid');
});
