import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';
import { Mesh, SkinnedMesh, Texture, NoColorSpace, SRGBColorSpace } from 'three';
import { loadCharacterGltf } from '../apps/game/island/presentation/character-gltf.ts';

// Deployment contract for the real runtime files, not a replacement for browser rendering.
// The bitmap boundary is mocked; GLB parsing and the bundled Meshopt decoder are real.
const directory = new URL('../apps/game/island/assets/characters/', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('../apps/game/island/character-catalog.json', import.meta.url), 'utf8'));
const keys = [...Object.keys(catalog.npcs), ...Object.keys(catalog.playerBodies).flatMap(gender =>
    Object.keys(catalog.playerAges).map(age => `player-${gender}-${age}`))].sort();
const clips = ['idle', 'walk', 'rest', 'work', 'construct', 'drink', 'wash', 'offer', 'drag', 'dead'].sort();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

test('published character roster is complete, self-contained and decodable with unchanged texture roles', async t => {
    assert.equal(keys.length, 14);
    assert.deepEqual((await readdir(directory)).filter(name => name.endsWith('.glb')).sort(), keys.map(key => `${key}.glb`));
    const nativeFetch = globalThis.fetch;
    const descriptors = new Map(['self', 'createImageBitmap'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    Object.defineProperty(globalThis, 'self', { configurable: true, value: globalThis });
    Object.defineProperty(globalThis, 'createImageBitmap', { configurable: true, value: async () => ({ width: 1, height: 1, close() {} }) });
    t.after(() => {
        for (const [key, descriptor] of descriptors) {
            if (descriptor) Object.defineProperty(globalThis, key, descriptor);
            else delete globalThis[key];
        }
    });
    t.mock.method(globalThis, 'fetch', async (url, options) => {
        if (!String(url).startsWith('file:')) return nativeFetch(url, options);
        options?.signal?.throwIfAborted();
        return new Response(await readFile(new URL(url)), { headers: { 'content-type': String(url).endsWith('.png') ? 'image/png' : 'model/gltf-binary' } });
    });
    const referencedImages = new Set();
    for (const key of keys) await t.test(key, async () => {
        const url = new URL(`${key}.glb`, directory);
        const bytes = await readFile(url);
        const json = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
        assert.ok(json.extensionsRequired.includes('EXT_meshopt_compression'));
        assert.ok(json.bufferViews.some(view => view.extensions?.EXT_meshopt_compression));
        for (const view of json.bufferViews) {
            const encoding = view.extensions?.EXT_meshopt_compression;
            if (!encoding) continue;
            assert.equal(encoding.filter, 'NONE');
            assert.ok(['INDICES', 'ATTRIBUTES'].includes(encoding.mode));
            assert.ok(encoding.byteOffset + encoding.byteLength <= json.buffers[encoding.buffer].byteLength);
        }
        for (const image of json.images) if (image.uri) {
            const match = /^shared\/([a-f0-9]{64})\.(png|jpg)$/.exec(image.uri);
            assert.ok(match, `${key}: non-content-addressed image URI`);
            assert.equal(hash(await readFile(new URL(image.uri, directory))), match[1]);
            referencedImages.add(image.uri.slice('shared/'.length));
        }
        const gltf = await loadCharacterGltf(url.href, new AbortController().signal);
        try {
            assert.deepEqual(gltf.animations.map(clip => clip.name).sort(), clips);
            for (const clip of gltf.animations) {
                assert.ok(clip.tracks.length > 0);
                for (const track of clip.tracks) {
                    assert.ok(track.times.every(Number.isFinite));
                    assert.ok(track.values.every(Number.isFinite));
                }
            }
            const garments = new Set(); let skinned = 0;
            gltf.scene.traverse(object => {
                if (object.userData.garment_id) garments.add(object.userData.garment_id);
                if (!(object instanceof Mesh)) return;
                assert.ok(object.geometry.getAttribute('position').array.every(Number.isFinite));
                if (object instanceof SkinnedMesh) { skinned++; assert.ok(object.skeleton.bones.length > 0); }
                for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
                    for (const slot of ['normalMap', 'roughnessMap', 'metalnessMap', 'aoMap']) {
                        if (material[slot]) assert.equal(material[slot].colorSpace, NoColorSpace, `${key}: ${material.name}.${slot}`);
                    }
                    for (const slot of ['map', 'emissiveMap']) {
                        if (material[slot]) assert.equal(material[slot].colorSpace, SRGBColorSpace, `${key}: ${material.name}.${slot}`);
                    }
                }
            });
            assert.ok(skinned > 0);
            for (const garment of ['shirt', 'trousers', 'inner-top', 'inner-shorts', 'lifejacket', 'shoes', 'wraps']) assert.ok(garments.has(garment), `${key}: ${garment}`);
        } finally {
            const resources = new Set();
            gltf.scene.traverse(object => {
                if (!(object instanceof Mesh)) return;
                resources.add(object.geometry);
                if (object instanceof SkinnedMesh) resources.add(object.skeleton);
                for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
                    resources.add(material);
                    for (const value of Object.values(material)) if (value instanceof Texture) resources.add(value);
                }
            });
            resources.forEach(resource => resource.dispose());
        }
    });
    assert.deepEqual((await readdir(new URL('shared/', directory))).sort(), [...referencedImages].sort());
});
