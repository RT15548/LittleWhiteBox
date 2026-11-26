import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequestImageProjection, hasImageToolMessages, imageDataUrl, MODEL_IMAGE_LIMITS } from '../app-src/runtime/request-images.js';
import { createAgentAdapter } from '../../agent-core/provider-config.js';
import { buildNativeMessages } from '../../agent-core/adapters/openai-compatible.js';
import { buildAnthropicMessages } from '../../agent-core/adapters/anthropic.js';
import { estimateConversationTokens, estimateMessageTokenCosts, IMAGE_PART_TOKEN_ESTIMATE } from '../../agent-core/runtime/context-tokens.js';

// Browser canvas normalization is outside Node; these tests use the byte-preserving encoder.
const encode = async blob => ({ url: await imageDataUrl(blob) });
const file = { path: 'local/images/cat.png', name: 'cat.png', kind: 'image', mimeType: 'image/png', sizeBytes: 4, blobId: 'immutable-picture' };
const result = { ok: true, images: [file] };
const history = [{ role: 'user', content: 'Look at the generated picture' }, { role: 'assistant', content: '', tool_calls: [
    { id: 'a', type: 'function', function: { name: 'DrawImage', arguments: '{}' } }, { id: 'b', type: 'function', function: { name: 'Read', arguments: '{}' } },
] }, { role: 'tool', tool_call_id: 'a', content: JSON.stringify(result) }, { role: 'tool', tool_call_id: 'b', content: '{"ok":true}' }];
const imageParts = messages => messages.flatMap(message => Array.isArray(message.content) ? message.content : []).filter(part => part.type === 'image_url');

test('image results enter model input after all tool responses without persisting payloads or changing the user turn', async () => {
    const projection = createRequestImageProjection({ encode, readBlob: async id => { assert.equal(id, file.blobId); return new Blob(['test'], { type: 'image/png' }); } });
    const saved = JSON.stringify(history);
    await projection.load(history);
    await projection.load(history);
    const messages = projection.project(history);
    assert.equal(JSON.stringify(history), saved);
    assert.deepEqual(projection.collapseCosts(messages, [1, 2, 3, 4, 5]), [1, 2, 3, 9]);
    assert.deepEqual(messages.slice(0, 4), history);
    assert.equal(messages.at(-1).role, 'user');
    assert.equal(messages.at(-1).content.at(-1).type, 'image_url');
    assert.equal(messages.at(-1).content.at(-1).image_url.url, 'data:image/png;base64,dGVzdA==');
    const native = buildNativeMessages({ messages }, 'offline');
    assert.equal(native.at(-1).content.at(-1).type, 'image_url');
    const anthropic = buildAnthropicMessages(messages);
    assert.equal(anthropic.at(-1).content.some(part => part.type === 'image'), true);
    assert.equal(hasImageToolMessages(history), true);
    assert.equal(hasImageToolMessages([history[0]]), false);
});

test('each image costs the fixed estimate in the whole request and in its history cost', async () => {
    const projection = createRequestImageProjection({ encode, readBlob: async () => new Blob(['test'], { type: 'image/png' }) });
    await projection.load(history);
    const messages = projection.project(history);
    const withoutImage = messages.map(message => Array.isArray(message.content)
        ? { ...message, content: message.content.filter(part => part.type !== 'image_url') } : message);
    assert.ok(estimateConversationTokens({ messages }) - estimateConversationTokens({ messages: withoutImage }) >= IMAGE_PART_TOKEN_ESTIMATE);
    const costs = projection.collapseCosts(messages, estimateMessageTokenCosts(messages, [], {}));
    assert.ok(costs.at(-1) >= IMAGE_PART_TOKEN_ESTIMATE, 'Compaction attributes the image to the tool batch that returned it');
});

test('one request keeps the newest images within the count and byte limits and describes the rest', async () => {
    const count = MODEL_IMAGE_LIMITS.maxRequestImages + 2;
    const files = Array.from({ length: count }, (_, index) => ({ ...file, path: `local/images/${index}.png`, name: `${index}.png`, blobId: `blob-${index}` }));
    const many = [{ role: 'user', content: 'Compare them' }, ...files.flatMap((item, index) => [
        { role: 'assistant', content: '', tool_calls: [{ id: `c${index}`, type: 'function', function: { name: 'ReadImage', arguments: '{}' } }] },
        { role: 'tool', tool_call_id: `c${index}`, content: JSON.stringify({ ok: true, images: [item] }) },
    ])];
    let encoded = 0;
    const projection = createRequestImageProjection({ readBlob: async id => {
        if (['blob-0', 'blob-1'].includes(id)) throw new Error('old_corrupt_image');
        return new Blob([id], { type: 'image/png' });
    },
        encode: async blob => { encoded += 1; return { url: `data:image/png;base64,${await blob.text()}` }; } });
    await projection.load(many);
    await projection.load(many);
    assert.equal(encoded, MODEL_IMAGE_LIMITS.maxRequestImages, 'Older files outside the budget are never opened');
    const sent = imageParts(projection.project(many)).map(part => part.image_url.url);
    assert.equal(sent.length, MODEL_IMAGE_LIMITS.maxRequestImages);
    assert.deepEqual(sent, files.slice(-MODEL_IMAGE_LIMITS.maxRequestImages).map(item => `data:image/png;base64,${item.blobId}`));

    // Two such data URLs fit the request byte budget; a third does not.
    const half = 'x'.repeat(Math.floor(MODEL_IMAGE_LIMITS.maxRequestBytes / 2) - 64);
    const heavy = createRequestImageProjection({ readBlob: async id => new Blob([id], { type: 'image/png' }), encode: async () => ({ url: `data:image/png;base64,${half}` }) });
    const three = many.slice(0, 7);
    await heavy.load(three);
    const projected = heavy.project(three);
    assert.equal(imageParts(projected).length, 2);
    const firstBatch = projected[3];
    assert.equal(firstBatch.content.some(part => part.type === 'image_url'), false, 'The earliest image is the one left out');
    assert.equal(firstBatch.content.length, 2, 'The omitted image is still described by its path');
});

test('an image that cannot be reduced under the per-image cap is described, not sent', async () => {
    const projection = createRequestImageProjection({ readBlob: async () => new Blob(['huge'], { type: 'image/png' }), encode: async () => ({ tooLarge: true }) });
    await projection.load(history);
    const message = projection.project(history).at(-1);
    assert.equal(message.content.some(part => part.type === 'image_url'), false);
    assert.equal(message.content.length, 2);
});

for (const provider of ['google', 'google-vertex']) {
    test(`${provider} receives image bytes in full tool-history replay without an extra persisted user turn`, async t => {
        const sent = [];
        t.mock.method(globalThis, 'fetch', async (input, init) => {
            const request = new Request(input, init); assert.equal(new URL(request.url).hostname, 'offline.invalid');
            sent.push(await request.json());
            return new Response(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'Seen' }] }, finishReason: 'STOP' }] }), { headers: { 'Content-Type': 'application/json' } });
        });
        const messages = [{ role: 'user', content: [{ type: 'image_url', name: 'upload.gif', mimeType: 'image/gif',
            image_url: { url: 'data:image/gif;base64,Z2lm' } }] }, ...history.slice(1)];
        const projection = createRequestImageProjection({ encode: async () => ({ url: 'data:image/png;base64,dGVzdA==' }),
            readBlob: async () => new Blob(['test'], { type: 'image/png' }) });
        await projection.load(messages);
        const adapter = createAgentAdapter({ provider, model: 'offline-model', apiKey: 'offline', baseUrl: 'https://offline.invalid', vertex: { authMode: 'relay' } });
        await adapter.chat({ messages: projection.project(messages) });
        const parts = sent[0].contents.flatMap(message => message.parts);
        const images = parts.filter(part => part.inlineData);
        assert.equal(images.length, 2);
        assert.ok(images.every(part => part.inlineData.data === 'dGVzdA==' && part.inlineData.mimeType === 'image/png'));
        assert.equal(parts.filter(part => part.functionResponse).length, 2);
        assert.equal(history.length, 4);
    });
}

test('an image result preserves the current native assistant tool envelope', async () => {
    const messages = structuredClone(history);
    const envelope = { ...messages[1], reasoning_content: 'native thought', custom_provider_field: { signature: 'original' } };
    messages[1].providerPayload = { openaiCompatibleMessage: envelope };
    const projection = createRequestImageProjection({ encode, readBlob: async () => new Blob(['test'], { type: 'image/png' }) });
    await projection.load(messages);
    const wire = buildNativeMessages({ messages: projection.project(messages) }, 'offline');
    assert.deepEqual(wire[1], envelope);
});

test('deleted image history explicitly reports unavailable bytes and never loads a path replacement', async () => {
    const projection = createRequestImageProjection({ encode, readBlob: async id => { assert.equal(id, file.blobId); throw new Error('workspace_image_blob_not_found'); } });
    await projection.load(history);
    const message = projection.project(history).at(-1);
    assert.equal(message.content.some(part => part.type === 'image_url'), false);
    assert.equal(message.content.length, 2);
    const broken = createRequestImageProjection({ encode, readBlob: async () => { throw new Error('storage_offline'); } });
    await assert.rejects(broken.load(history), error => error.cause?.message === 'storage_offline');
});

const uploadPart = (name, text = name, mimeType = 'image/png') => ({
    type: 'image_url', name, mimeType, image_url: { url: `data:${mimeType};base64,${btoa(text)}` },
});

test('uploads and tool images share the count limit, including repeated occurrences of one upload', async () => {
    const part = uploadPart('repeated.gif', 'animation', 'image/gif');
    const messages = [{ role: 'user', content: [
        { type: 'text', text: 'Compare these images.' },
        ...Array.from({ length: MODEL_IMAGE_LIMITS.maxRequestImages }, () => part),
    ] }, ...history.slice(1)];
    const original = structuredClone(messages);
    let encoded = 0;
    const projection = createRequestImageProjection({
        readBlob: async () => new Blob(['tool image'], { type: 'image/png' }),
        encode: async blob => { encoded++; return { url: await imageDataUrl(new Blob([await blob.arrayBuffer()], { type: 'image/png' })) }; },
    });
    await projection.load(messages);
    await projection.load(messages);
    const projected = projection.project(messages);
    assert.equal(encoded, 2, 'Repeated uploads and tool reads reuse normalized copies, not budget slots');
    assert.equal(imageParts(projected).length, MODEL_IMAGE_LIMITS.maxRequestImages);
    assert.equal(imageParts([projected[0]]).length, MODEL_IMAGE_LIMITS.maxRequestImages - 1);
    assert.equal(projected[0].content[0].text, messages[0].content[0].text);
    assert.equal(projected[0].content[1].type, 'text', 'Only the oldest occurrence is omitted');
    assert.ok(projected[0].content[1].text.includes(part.name));
    assert.equal(imageParts(projected).every(image => image.image_url.url.startsWith('data:image/png;') && image.mimeType !== 'image/gif'), true);
    assert.deepEqual(messages, original);
    assert.equal(projection.collapseCosts(projected, projected.map(() => 1)).length, messages.length);
});

test('one byte budget covers historical uploads, current uploads and tool images together', async () => {
    const earlier = uploadPart('earlier.png');
    const current = uploadPart('current.png');
    const second = { ...file, path: 'local/images/second.png', name: 'second.png', blobId: 'second' };
    const messages = [{ role: 'user', content: [earlier] }, { role: 'assistant', content: 'Earlier reply' },
        { role: 'user', content: [current] }, ...history.slice(1, 2),
        { ...history[2], content: JSON.stringify({ ok: true, images: [file, second] }) }, history[3]];
    const original = structuredClone(messages);
    // Each fixture represents a 3MiB encoded image, below the single-image cap.
    const url = `data:image/png;base64,${'A'.repeat(4 * 1024 * 1024)}`;
    const projection = createRequestImageProjection({ encode: async () => ({ url }),
        readBlob: async () => new Blob(['tool'], { type: 'image/png' }) });
    await projection.load(messages);
    const projected = projection.project(messages);
    const images = imageParts(projected);
    assert.deepEqual(images.map(image => image.name), [current.name, file.name, second.name]);
    assert.ok(images.reduce((bytes, image) => bytes + image.image_url.url.length, 0) <= MODEL_IMAGE_LIMITS.maxRequestBytes);
    assert.ok(projected[0].content.every(part => part.type === 'text'));
    assert.ok(projected[0].content.some(part => part.text.includes(earlier.name)));
    assert.deepEqual(messages, original);
    assert.deepEqual(projection.project(messages), projected, 'History stays visible on subsequent requests while it fits');
});

test('malformed uploads and decoder failures stop preparation with their original cause', async () => {
    const part = uploadPart('broken.png');
    const originalError = new Error('decoder_rejected_image');
    const projection = createRequestImageProjection({ encode: async () => { throw originalError; } });
    await assert.rejects(projection.load([{ role: 'user', content: [part] }]), error => error.cause === originalError);
    const malformed = { ...part, image_url: { url: 'data:image/png;base64,%%%' } };
    await assert.rejects(projection.load([{ role: 'user', content: [malformed] }]), error => error.cause?.name === 'InvalidCharacterError');
});
