import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { test } from 'node:test';
import { BufferGeometry, Material, Texture } from 'three';
import { MeshoptEncoder } from 'meshoptimizer';
import { loadCharacterGltf } from '../apps/game/island/presentation/character-gltf.ts';

// Run with Node's native TS support (Node 24), or esbuild CLI bundle then node --test.
// Actual three/Meshopt decoding and fetch/blob lifecycle; the bitmap boundary is mocked.
// These tests do not claim browser image decoding, WebGL rendering or gameplay acceptance.
const modelURL = 'https://example.test/extensions/island/assets/characters/ye.glb?v=123';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aONsAAAAASUVORK5CYII=', 'base64');
const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
const times = new Float32Array([0, 1]);
const translations = new Float32Array([0, 0, 0, .25, .5, .75]);
const align = n => Math.ceil(n / 4) * 4;
function pack(json, binary) {
    const text = Buffer.from(JSON.stringify(json)), size = 28 + align(text.length) + align(binary.length);
    const bytes = Buffer.alloc(size), offset = 20 + align(text.length);
    bytes.writeUInt32LE(0x46546c67, 0); bytes.writeUInt32LE(2, 4); bytes.writeUInt32LE(size, 8);
    bytes.writeUInt32LE(align(text.length), 12); bytes.writeUInt32LE(0x4e4f534a, 16);
    bytes.fill(32, 20, offset); text.copy(bytes, 20);
    bytes.writeUInt32LE(align(binary.length), offset); bytes.writeUInt32LE(0x004e4942, offset + 4); binary.copy(bytes, offset + 8);
    return bytes;
}
async function fixture({ compressed = true, images = [], brokenAnimation = false } = {}) {
    await MeshoptEncoder.ready;
    const chunks = [], views = []; let length = 0, decodedLength = 0;
    const append = bytes => { const offset = align(length); chunks.push([offset, bytes]); length = offset + bytes.length; return offset; };
    for (const [array, stride] of [[positions, 12], [times, 4], [translations, 12]]) {
        const bytes = new Uint8Array(array.buffer);
        const data = compressed ? MeshoptEncoder.encodeGltfBuffer(bytes, bytes.length / stride, stride, 'ATTRIBUTES', 0) : bytes;
        const offset = append(data);
        views.push(compressed ? { buffer: 1, byteOffset: decodedLength, byteLength: bytes.length,
            extensions: { EXT_meshopt_compression: { buffer: 0, byteOffset: offset, byteLength: data.length, byteStride: stride, count: bytes.length / stride, mode: 'ATTRIBUTES', filter: 'NONE' } } }
            : { buffer: 0, byteOffset: offset, byteLength: bytes.length });
        decodedLength += bytes.length;
    }
    const imageDefs = images.map(uri => {
        if (uri !== 'embedded') return { uri, mimeType: 'image/png' };
        const bufferView = views.length;
        views.push({ buffer: 0, byteOffset: append(png), byteLength: png.length });
        return { bufferView, mimeType: 'image/png' };
    });
    const json = {
        asset: { version: '2.0' }, buffers: [{ byteLength: length }], bufferViews: views,
        accessors: [
            { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] },
            { bufferView: 1, componentType: 5126, count: 2, type: 'SCALAR', min: [0], max: [1] },
            { bufferView: 2, componentType: 5126, count: 2, type: 'VEC3' },
        ],
        meshes: [{ primitives: [{ attributes: { POSITION: 0 }, material: 0 }] }],
        nodes: [{ mesh: 0, name: 'authored-node', extras: { garment_id: 'shirt' } }],
        scenes: [{ nodes: [0] }], scene: 0,
        animations: [{ name: 'idle', samplers: [{ input: brokenAnimation ? 99 : 1, output: 2 }], channels: [{ sampler: 0, target: { node: 0, path: 'translation' } }] }],
        images: imageDefs, textures: imageDefs.map((_, source) => ({ source, sampler: 0 })),
        samplers: [{ magFilter: 9728, minFilter: 9728, wrapS: 33071, wrapT: 33071 }],
        materials: [{ name: 'authored-material', pbrMetallicRoughness: { baseColorFactor: [.2, .3, .4, 1], ...(images.length ? { baseColorTexture: { index: 0 } } : {}) },
            ...(images.length > 1 ? { normalTexture: { index: 1 } } : {}) }],
    };
    if (compressed) {
        json.buffers.push({ byteLength: decodedLength, extensions: { EXT_meshopt_compression: { fallback: true } } });
        json.extensionsUsed = json.extensionsRequired = ['EXT_meshopt_compression'];
    }
    const binary = Buffer.alloc(length); for (const [offset, bytes] of chunks) binary.set(bytes, offset);
    return pack(json, binary);
}
function browser(t, bytes, imageRequest = async () => new Response(png, { headers: { 'content-type': 'image/png' } })) {
    const originalFetch = globalThis.fetch, createURL = URL.createObjectURL, revokeURL = URL.revokeObjectURL;
    const descriptors = new Map(['self', 'createImageBitmap'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    const requested = [], created = [], revoked = [], decoded = [], closed = [];
    Object.defineProperty(globalThis, 'self', { configurable: true, value: globalThis });
    Object.defineProperty(globalThis, 'createImageBitmap', { configurable: true, writable: true, value: async (blob, options) => {
        decoded.push({ bytes: Buffer.from(await blob.arrayBuffer()), options });
        const bitmap = { width: 1, height: 1, close() { closed.push(bitmap); } }; return bitmap;
    } });
    t.after(() => { for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } });
    t.mock.method(URL, 'createObjectURL', blob => { const url = createURL(blob); created.push(url); return url; });
    t.mock.method(URL, 'revokeObjectURL', url => { revoked.push(url); revokeURL(url); });
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        const address = String(url); requested.push({ url: address, signal: options?.signal });
        if (address.startsWith('blob:') || address.startsWith('data:')) return originalFetch(url, options);
        if (address === modelURL) return new Response(bytes);
        return imageRequest(address, options);
    });
    return { requested, created, revoked, decoded, closed };
}
function dispose(gltf) {
    const geometry = new Set(), materials = new Set(), textures = new Set(), bitmaps = new Set();
    gltf.scene.traverse(object => {
        if (!object.isMesh) return;
        geometry.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
            materials.add(material); for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
        }
    });
    geometry.forEach(value => value.dispose()); materials.forEach(value => value.dispose());
    textures.forEach(value => { if (value.source.data?.close) bitmaps.add(value.source.data); value.dispose(); });
    bitmaps.forEach(value => value.close());
}
function disposalCounts(t) {
    const counts = { geometry: [], material: [], texture: [] };
    for (const [type, prototype] of [['geometry', BufferGeometry.prototype], ['material', Material.prototype], ['texture', Texture.prototype]]) {
        const original = prototype.dispose;
        t.mock.method(prototype, 'dispose', function () { counts[type].push(this); original.call(this); });
    }
    return counts;
}

test('built-in Meshopt decoder preserves exact geometry, node metadata and animation track values', async t => {
    browser(t, await fixture());
    const gltf = await loadCharacterGltf(modelURL, new AbortController().signal);
    const mesh = gltf.scene.children[0], track = gltf.animations[0].tracks[0];
    assert.deepEqual(mesh.geometry.attributes.position.array, positions);
    assert.equal(mesh.name, 'authored-node'); assert.equal(mesh.userData.garment_id, 'shirt');
    assert.equal(gltf.animations[0].name, 'idle'); assert.equal(track.name, 'authored-node.position');
    assert.deepEqual(track.times, times); assert.deepEqual(track.values, translations);
    assert.equal(mesh.material.name, 'authored-material'); dispose(gltf);
});

for (const compressed of [false, true]) test(`embedded image GLB loads unchanged (Meshopt=${compressed})`, async t => {
    const b = browser(t, await fixture({ compressed, images: ['embedded'] }));
    const gltf = await loadCharacterGltf(modelURL, new AbortController().signal);
    assert.deepEqual(b.decoded[0].bytes, png); assert.equal(b.decoded[0].options.colorSpaceConversion, 'none');
    assert.equal(gltf.scene.children[0].material.map.flipY, false);
    assert.equal(b.requested.filter(r => !r.url.startsWith('blob:')).length, 1);
    assert.ok(b.created.every(url => b.revoked.includes(url))); assert.equal(b.closed.length, 0);
    dispose(gltf); assert.equal(b.closed.length, 1);
});

for (const uri of [`shared/${'a'.repeat(64)}.png`, '../shared-textures/原图 test.png']) test(`relative image URL uses GLB directory: ${uri}`, async t => {
    const b = browser(t, await fixture({ images: [uri] }));
    const gltf = await loadCharacterGltf(modelURL, new AbortController().signal);
    assert.deepEqual(b.requested.filter(r => !r.url.startsWith('blob:')).map(r => r.url), [modelURL, new URL(uri, modelURL).href]);
    assert.deepEqual(b.decoded[0].bytes, png); assert.equal(gltf.parser.json.images[0].uri, uri);
    assert.equal(gltf.scene.children[0].material.map.name, uri);
    assert.ok(b.created.every(url => b.revoked.includes(url))); assert.equal(b.closed.length, 0); dispose(gltf);
});

test('shared image is fetched once per load, with no retained cross-load cache', async t => {
    const uri = `shared/${'b'.repeat(64)}.png`, b = browser(t, await fixture({ images: [uri, uri] }));
    for (let i = 0; i < 2; i++) dispose(await loadCharacterGltf(modelURL, new AbortController().signal));
    assert.equal(b.requested.filter(r => r.url === new URL(uri, modelURL).href).length, 2);
    assert.equal(b.created.length, 2); assert.deepEqual(new Set(b.created), new Set(b.revoked));
});

test('already cancelled load makes no requests', async t => {
    const b = browser(t, await fixture()), controller = new AbortController(); controller.abort();
    await assert.rejects(loadCharacterGltf(modelURL, controller.signal), { name: 'AbortError' });
    assert.equal(b.requested.length, 0);
});

test('GLB HTTP failure is explicit and does not start image loading', async t => {
    const b = browser(t, await fixture({ images: ['shared/unused.png'] }));
    t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 503 }));
    await assert.rejects(loadCharacterGltf(modelURL, new AbortController().signal), /island_character_load:503/);
    assert.equal(b.decoded.length, 0); assert.equal(b.created.length, 0);
});

test('cancel during GLB body read prevents parsing and external image requests', async t => {
    const bytes = await fixture({ images: ['shared/unused.png'] }), b = browser(t, bytes), controller = new AbortController();
    let requestSignal;
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
        requestSignal = options.signal;
        return { ok: true, async arrayBuffer() { controller.abort(); return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); } };
    });
    await assert.rejects(loadCharacterGltf(modelURL, controller.signal), { name: 'AbortError' });
    assert.equal(requestSignal.aborted, true); assert.equal(b.decoded.length, 0); assert.equal(b.created.length, 0);
});

test('cancel during external image fetch aborts that request and never starts bitmap decoding', async t => {
    const controller = new AbortController(); let imageSignal;
    const b = browser(t, await fixture({ images: ['shared/cancel.png'] }), async (_url, options) => {
        imageSignal = options.signal;
        return new Promise((_resolve, reject) => {
            imageSignal.addEventListener('abort', () => reject(imageSignal.reason), { once: true });
            controller.abort();
        });
    });
    await assert.rejects(loadCharacterGltf(modelURL, controller.signal), { name: 'AbortError' });
    assert.equal(imageSignal.aborted, true); assert.equal(b.decoded.length, 0); assert.equal(b.created.length, 0);
});

test('one missing image aborts sibling requests instead of returning an untextured character', async t => {
    let siblingSignal;
    const b = browser(t, await fixture({ images: ['shared/missing.png', 'shared/pending.png'] }), async (url, options) => {
        if (url.endsWith('/missing.png')) return new Response(null, { status: 404 });
        siblingSignal = options.signal;
        return new Promise((_resolve, reject) => siblingSignal.addEventListener('abort', () => reject(siblingSignal.reason), { once: true }));
    });
    await assert.rejects(loadCharacterGltf(modelURL, new AbortController().signal), /island_character_image:404/);
    assert.equal(siblingSignal.aborted, true); assert.equal(b.decoded.length, 0);
});

test('cancel during non-abortable bitmap decode drains and disposes every resource exactly once', async t => {
    const b = browser(t, await fixture({ images: ['shared/cancel-after-fetch.png'] }));
    const counts = disposalCounts(t), controller = new AbortController();
    const decode = globalThis.createImageBitmap;
    globalThis.createImageBitmap = async (...args) => { const bitmap = await decode(...args); controller.abort(); return bitmap; };
    await assert.rejects(loadCharacterGltf(modelURL, controller.signal), { name: 'AbortError' });
    // three clones the authored material for a primitive without normals (flat shading).
    assert.equal(counts.geometry.length, 1); assert.equal(counts.material.length, 2); assert.equal(counts.texture.length, 1);
    for (const list of Object.values(counts)) { assert.equal(new Set(list).size, list.length); }
    assert.equal(b.closed.length, 1); assert.deepEqual(new Set(b.created), new Set(b.revoked));
});

test('parse failure drains sibling image decoding and frees partially created resources', async t => {
    const b = browser(t, await fixture({ images: ['embedded'], brokenAnimation: true })), counts = disposalCounts(t);
    await assert.rejects(loadCharacterGltf(modelURL, new AbortController().signal));
    assert.equal(b.decoded.length, 1); assert.equal(b.closed.length, 1);
    // three clones the authored material for a primitive without normals (flat shading).
    assert.equal(counts.geometry.length, 1); assert.equal(counts.material.length, 2); assert.equal(counts.texture.length, 1);
    for (const list of Object.values(counts)) { assert.equal(new Set(list).size, list.length); }
    assert.deepEqual(new Set(b.created), new Set(b.revoked));
});

test('bitmap decode failure is fatal and releases the temporary URL', async t => {
    const b = browser(t, await fixture({ images: ['shared/corrupt.png'] }));
    t.mock.method(console, 'error', () => {});
    globalThis.createImageBitmap = async () => { throw new Error('bad png'); };
    await assert.rejects(loadCharacterGltf(modelURL, new AbortController().signal), /island_character_texture:0/);
    assert.deepEqual(new Set(b.created), new Set(b.revoked));
});
