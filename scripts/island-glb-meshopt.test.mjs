import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { compressGlbLosslessly, readGlbChunks, writeGlbChunks, semanticSnapshot, viewBytes } from './island-glb-meshopt.mjs';
import { optimizeCharacterDirectory } from './optimize-island-characters.mjs';

function fixture({ image = false, interleaved = false } = {}) {
    const count = 256, stride = interleaved ? 16 : 12, positions = Buffer.alloc(count * stride), indices = Buffer.alloc(768);
    for (let i = 0; i < count; i++) {
        positions.writeFloatLE((i % 16) / 16, i * stride); positions.writeFloatLE(Math.floor(i / 16) / 16, i * stride + 4);
        positions.writeFloatLE(0, i * stride + 8); if (interleaved) positions.writeUInt32LE(0xff0080ff, i * stride + 12);
    }
    for (let i = 0; i < 384; i++) indices.writeUInt16LE([0, 1, 16][i % 3], i * 2);
    const times = Buffer.from(new Float32Array([0, 1]).buffer), output = Buffer.from(new Float32Array([0, 0, 0, 0, 1, 0]).buffer);
    const parts = [positions, indices, times, output], views = []; let offset = 0;
    for (const part of parts) { views.push({ buffer: 0, byteOffset: offset, byteLength: part.length }); offset += part.length; }
    views[0].target = 34962; if (interleaved) views[0].byteStride = stride;
    views[1].target = 34963;
    const json = {
        asset: { version: '2.0', generator: 'test' }, buffers: [{ byteLength: offset }], bufferViews: views,
        accessors: [
            { bufferView: 0, componentType: 5126, count, type: 'VEC3', min: [0, 0, 0], max: [15 / 16, 15 / 16, 0] },
            { bufferView: 1, componentType: 5123, count: 384, type: 'SCALAR' },
            { bufferView: 2, componentType: 5126, count: 2, type: 'SCALAR', min: [0], max: [1] },
            { bufferView: 3, componentType: 5126, count: 2, type: 'VEC3' },
        ],
        meshes: [{ name: 'body', extras: { asset_role: 'body.skin' }, primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
        nodes: [{ mesh: 0, name: 'character' }], scenes: [{ nodes: [0] }], scene: 0,
        animations: [{ name: 'walk', samplers: [{ input: 2, output: 3, interpolation: 'LINEAR' }], channels: [{ sampler: 0, target: { node: 0, path: 'translation' } }] }],
    };
    if (interleaved) { json.accessors.push({ bufferView: 0, byteOffset: 12, componentType: 5121, count, type: 'VEC4', normalized: true }); json.meshes[0].primitives[0].attributes.COLOR_0 = 4; }
    if (image) {
        const encoded = Buffer.isBuffer(image) ? image : Buffer.alloc(1024, 17); json.images = [{ bufferView: views.length, mimeType: 'image/png', name: 'encoded-bytes' }];
        views.push({ buffer: 0, byteOffset: offset, byteLength: encoded.length }); parts.push(encoded); json.buffers[0].byteLength += encoded.length;
    }
    return writeGlbChunks(json, Buffer.concat(parts));
}

test('meshopt v0 + INDICES roundtrip is byte exact and keeps animation/scene identity', async () => {
    const original = fixture(), result = await compressGlbLosslessly(original), compressed = readGlbChunks(result.glb);
    assert(result.compressedViews >= 2); assert(result.glb.length < original.length);
    assert(compressed.json.extensionsRequired.includes('EXT_meshopt_compression'));
    assert(compressed.json.bufferViews.some(view => view.extensions?.EXT_meshopt_compression?.mode === 'INDICES'));
    for (const view of compressed.json.bufferViews) if (view.extensions) assert.equal(view.extensions.EXT_meshopt_compression.filter, 'NONE');
    assert.deepEqual(await semanticSnapshot(result.decodedGlb), await semanticSnapshot(original));
    const decoded = readGlbChunks(result.decodedGlb), source = readGlbChunks(original);
    source.json.bufferViews.forEach((_, i) => assert.deepEqual(viewBytes(decoded, i), viewBytes(source, i)));
});

test('real project GLTFLoader decodes encoded fixture without index rotation', async () => {
    const original = fixture(), { glb } = await compressGlbLosslessly(original);
    const parse = bytes => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length), '');
    const [a, b] = await Promise.all([parse(original), parse(glb)]);
    const mesh = root => { let found; root.traverse(object => { if (object.isMesh) found = object; }); return found; };
    assert.deepEqual(mesh(a.scene).geometry.index.array, mesh(b.scene).geometry.index.array);
    assert.deepEqual(mesh(a.scene).geometry.attributes.position.array, mesh(b.scene).geometry.attributes.position.array);
    assert.deepEqual(a.animations.map(clip => [clip.name, clip.duration, clip.tracks.map(track => [track.name, [...track.values], [...track.times]])]),
        b.animations.map(clip => [clip.name, clip.duration, clip.tracks.map(track => [track.name, [...track.values], [...track.times]])]));
});

test('embedded encoded images are never mesh-compressed or changed', async () => {
    const original = fixture({ image: true }), result = await compressGlbLosslessly(original), packed = readGlbChunks(result.glb), source = readGlbChunks(original);
    const index = packed.json.images[0].bufferView;
    assert(!packed.json.bufferViews[index].extensions);
    assert.deepEqual(viewBytes(packed, index), viewBytes(source, index));
});

test('interleaved mixed attributes retain padding and exact vertex colors', async () => {
    const original = fixture({ interleaved: true }), result = await compressGlbLosslessly(original);
    assert.deepEqual(await semanticSnapshot(result.decodedGlb), await semanticSnapshot(original));
    assert.deepEqual(viewBytes(readGlbChunks(result.decodedGlb), 0), viewBytes(readGlbChunks(original), 0));
});

test('source extension, external buffer, sparse and malformed GLBs fail closed', async () => {
    const original = fixture();
    for (const mutate of [j => { j.extensionsUsed = ['UNKNOWN']; }, j => { j.buffers[0].uri = 'remote.bin'; }, j => { j.accessors[0].sparse = {}; }]) {
        const d = readGlbChunks(original); mutate(d.json); await assert.rejects(compressGlbLosslessly(writeGlbChunks(d.json, d.bin)));
    }
    const encoded = await compressGlbLosslessly(original); await assert.rejects(compressGlbLosslessly(encoded.glb));
    assert.throws(() => readGlbChunks(original.subarray(0, original.length - 4)));
});

test('no profitable views returns original bytes rather than growing the file', async () => {
    const bin = Buffer.from(new Float32Array([1, 2, 3]).buffer), json = { asset: { version: '2.0' }, buffers: [{ byteLength: bin.length }], bufferViews: [{ buffer: 0, byteLength: bin.length }], accessors: [{ bufferView: 0, componentType: 5126, count: 1, type: 'VEC3' }] };
    const original = writeGlbChunks(json, bin), result = await compressGlbLosslessly(original);
    assert.equal(result.compressedViews, 0); assert.deepEqual(result.glb, original);
});

test('directory pipeline shares exact PNG bytes and counts them once across models', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'island-shared-images-'));
    try {
        const source = path.join(root, 'source'), output = path.join(root, 'candidate'); await fs.mkdir(source);
        const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aONsAAAAASUVORK5CYII=', 'base64');
        const original = fixture({ image: png });
        for (const file of ['one.glb', 'two.glb']) await fs.writeFile(path.join(source, file), original);
        const report = await optimizeCharacterDirectory(source, output);
        assert.equal(report.shared.length, 1); assert.equal(report.sharedBytes, png.length);
        assert.equal(report.totalOutputBytes, report.outputGlbBytes + png.length);
        assert.match(report.shared[0].file, /^shared\/[a-f0-9]{64}\.png$/);
        assert.deepEqual(await fs.readFile(path.join(output, report.shared[0].file)), png);
        assert.equal((await fs.readdir(path.join(output, 'shared'))).length, 1);
        for (const file of ['one.glb', 'two.glb']) {
            const candidate = readGlbChunks(await fs.readFile(path.join(output, file)));
            assert.equal(candidate.json.images[0].uri, report.shared[0].file);
            assert.equal(candidate.json.images[0].bufferView, undefined);
            assert.deepEqual(await fs.readFile(path.join(source, file)), original);
        }
        for (const model of report.models) assert.equal(model.validation.decoded.errors, 0);
    } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('directory pipeline rejects junction aliases into source before creating output', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'island-output-alias-'));
    try {
        const source = path.join(root, 'source'), alias = path.join(root, 'alias'); await fs.mkdir(source);
        await fs.writeFile(path.join(source, 'one.glb'), fixture());
        await fs.symlink(source, alias, process.platform === 'win32' ? 'junction' : 'dir');
        await assert.rejects(optimizeCharacterDirectory(source, path.join(alias, 'candidate')), /separate/);
        await assert.rejects(optimizeCharacterDirectory(source, path.join(alias, 'nested', 'candidate')), /separate/);
        await assert.rejects(fs.access(path.join(source, 'candidate')));
        await assert.rejects(fs.access(path.join(source, 'nested')));
        assert.deepEqual(await fs.readdir(source), ['one.glb']);
    } finally { await fs.rm(root, { recursive: true, force: true }); }
});

test('directory pipeline validates two models, preserves source and refuses reuse/in-place', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'island-asset-pipeline-'));
    try {
        const source = path.join(root, 'source'), output = path.join(root, 'candidate'); await fs.mkdir(source);
        const bytes = fixture(); for (const file of ['one.glb', 'two.glb']) await fs.writeFile(path.join(source, file), bytes);
        const report = await optimizeCharacterDirectory(source, output);
        assert.equal(report.models.length, 2); assert.equal(report.sharedBytes, 0); assert(report.totalOutputBytes < report.originalBytes);
        assert.deepEqual(await fs.readFile(path.join(source, 'one.glb')), bytes);
        assert.equal(report.models[0].validation.decoded.errors, 0);
        await assert.rejects(optimizeCharacterDirectory(source, output), /EEXIST/);
        await assert.rejects(optimizeCharacterDirectory(source, source), /separate/);
        await assert.rejects(optimizeCharacterDirectory(source, path.join(source, 'candidate')), /separate/);
    } finally { await fs.rm(root, { recursive: true, force: true }); }
});
