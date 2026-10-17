import test from 'node:test';
import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { optimizeGlb, parseGlb, processGlbFile, sha256 } from './island-glb-lossless.mjs';

const align4 = n => Math.ceil(n / 4) * 4;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aONsAAAAASUVORK5CYII=', 'base64');
function pack(json, bin, pretty = false) {
    const text = Buffer.from(JSON.stringify(json, null, pretty ? 2 : 0));
    const length = 20 + align4(text.length) + (bin ? 8 + align4(bin.length) : 0);
    const out = Buffer.alloc(length);
    out.writeUInt32LE(0x46546c67, 0); out.writeUInt32LE(2, 4); out.writeUInt32LE(length, 8);
    out.writeUInt32LE(align4(text.length), 12); out.writeUInt32LE(0x4e4f534a, 16);
    out.fill(32, 20, 20 + align4(text.length)); text.copy(out, 20);
    if (bin) {
        const p = 20 + align4(text.length);
        out.writeUInt32LE(align4(bin.length), p); out.writeUInt32LE(0x004e4942, p + 4); bin.copy(out, p + 8);
    }
    return out;
}
function raw(bytes) {
    const length = bytes.readUInt32LE(12);
    return { json: JSON.parse(bytes.subarray(20, 20 + length).toString()), bin: bytes.subarray(28 + length) };
}
function fixture() {
    const chunks = [], views = [];
    let size = 0;
    const add = (bytes, metadata = {}) => {
        const offset = align4(size); chunks.push({ bytes, offset }); size = offset + bytes.length;
        views.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, ...metadata }); return views.length - 1;
    };
    const floats = values => { const out = Buffer.alloc(values.length * 4); values.forEach((v, i) => out.writeFloatLE(v, i * 4)); return out; };
    const position = add(floats([1, 2, 3]));
    const color = add(Buffer.from([20, 40, 60, 255]));
    const matrix = add(floats([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
    const time = add(floats([0]));
    const duplicatePosition = add(floats([1, 2, 3]), { name: 'same bytes, different view metadata' });
    const image = add(png, { name: 'embedded original' });
    const duplicateImage = add(png);
    const unused = add(Buffer.from([9, 8, 7, 6]), { name: 'must retain unused view' });
    const json = {
        asset: { version: '2.0', generator: 'lossless synthetic test' },
        buffers: [{ byteLength: size, name: 'binary', extras: { retain: true } }], bufferViews: views,
        accessors: [
            { bufferView: position, componentType: 5126, count: 1, type: 'VEC3', min: [1, 2, 3], max: [1, 2, 3] },
            { bufferView: color, componentType: 5121, count: 1, type: 'VEC4', normalized: true, name: 'vertex color' },
            { bufferView: matrix, componentType: 5126, count: 1, type: 'MAT4', name: 'bind' },
            { bufferView: time, componentType: 5126, count: 1, type: 'SCALAR', min: [0], max: [0] },
            { bufferView: duplicatePosition, componentType: 5126, count: 1, type: 'VEC3', min: [1, 2, 3], max: [1, 2, 3] },
            { bufferView: matrix, componentType: 5126, count: 1, type: 'MAT4', name: 'bind' },
            { bufferView: time, componentType: 5126, count: 1, type: 'SCALAR', min: [0], max: [0] },
        ],
        nodes: [{ name: 'mesh', mesh: 0, skin: 0, children: [1] }, { name: 'joint' }],
        meshes: [{ name: 'mesh original', primitives: [{ attributes: { POSITION: 4, COLOR_0: 1 }, targets: [{ POSITION: 4 }], material: 0 }] }],
        skins: [{ name: 'skin original', inverseBindMatrices: 5, skeleton: 1, joints: [1] }],
        images: [{ bufferView: image, mimeType: 'image/png', name: 'first', extras: { role: 1 } }, { bufferView: duplicateImage, mimeType: 'image/png', name: 'second' }],
        textures: [{ name: 't1', source: 0 }, { name: 't2', source: 1 }],
        materials: [{ name: 'material original', pbrMetallicRoughness: { baseColorTexture: { index: 0 } }, extensions: {
            KHR_materials_specular: { specularFactor: 0.2, specularTexture: { index: 1 } },
            KHR_materials_anisotropy: { anisotropyStrength: 0.4, anisotropyTexture: { index: 0 } },
        } }],
        extensionsUsed: ['KHR_materials_specular', 'KHR_materials_anisotropy'],
        animations: [
            { name: 'idle', samplers: [{ input: 6, output: 4 }], channels: [{ sampler: 0, target: { node: 1, path: 'translation' } }] },
            { name: 'walk', samplers: [{ input: 3, output: 0 }], channels: [{ sampler: 0, target: { node: 1, path: 'translation' } }, { sampler: 0, target: { node: 1, path: 'scale' } }] },
        ],
        scenes: [{ name: 'scene', nodes: [0] }], scene: 0,
    };
    const bin = Buffer.alloc(size); chunks.forEach(chunk => chunk.bytes.copy(bin, chunk.offset));
    return { json, bin, unused };
}
function viewBytes(doc, index) {
    const view = doc.json.bufferViews[index]; return doc.bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
}
function externalOptions() {
    return { sharedImageHashes: new Set([sha256(png)]), sharedDir: path.resolve('shared images'), outputGlbPath: path.resolve('models', 'result.glb') };
}

test('exact accessor/view dedup preserves skin, COLOR_0, morph, all clips/channels and metadata', () => {
    const original = fixture(), input = pack(original.json, original.bin, true), saved = Buffer.from(input);
    const result = optimizeGlb(input), output = parseGlb(result.glb);
    assert.deepEqual(input, saved);
    assert.equal(result.stats.mergedAccessors, 3);
    assert.equal(output.json.accessors.length, 4);
    assert.equal(output.json.meshes[0].primitives[0].attributes.POSITION, 0);
    assert.equal(output.json.meshes[0].primitives[0].attributes.COLOR_0, 1);
    assert.equal(output.json.meshes[0].primitives[0].targets[0].POSITION, 0);
    assert.equal(output.json.skins[0].inverseBindMatrices, 2);
    assert.deepEqual(output.json.animations.map(a => a.channels), original.json.animations.map(a => a.channels));
    assert.deepEqual(output.json.animations.map(a => a.name), ['idle', 'walk']);
    assert.deepEqual(output.json.animations[0].samplers, [{ input: 3, output: 0 }]);
    for (const key of ['nodes', 'materials', 'textures', 'images', 'scenes']) assert.deepEqual(output.json[key], original.json[key]);
    assert.equal(output.json.bufferViews.length, original.json.bufferViews.length);
    for (let i = 0; i < original.json.bufferViews.length; i++) assert.deepEqual(viewBytes(output, i), viewBytes(original, i));
    assert.equal(output.json.bufferViews[4].byteOffset, output.json.bufferViews[0].byteOffset);
    assert.equal(output.json.bufferViews[4].name, original.json.bufferViews[4].name);
    assert.ok(result.stats.reusedViewBytes > png.length);
    assert.ok(result.glb.length < input.length);
});

test('view definitions merge only when every metadata field except byteOffset and bytes agree', () => {
    const f = fixture(); delete f.json.bufferViews[4].name;
    const result = optimizeGlb(pack(f.json, f.bin), { deduplicateAccessors: false });
    assert.equal(result.stats.mergedBufferViews, 1);
    assert.equal(result.stats.removedImageViews, 0);
    assert.equal(result.json.bufferViews.length, f.json.bufferViews.length - 1);
    assert.equal(result.json.accessors[4].bufferView, 0);
    assert.equal(result.json.accessors.length, f.json.accessors.length);
    const output = parseGlb(result.glb);
    for (let i = 0; i < f.json.accessors.length; i++) {
        assert.deepEqual(viewBytes(output, output.json.accessors[i].bufferView), viewBytes(f, f.json.accessors[i].bufferView));
    }
    for (const metadata of [{ name: 'different' }, { extras: { retain: true } }, { target: 34962 }, { byteStride: 12 }]) {
        const changed = fixture(); delete changed.json.bufferViews[4].name; Object.assign(changed.json.bufferViews[4], metadata);
        assert.equal(optimizeGlb(pack(changed.json, changed.bin)).stats.mergedBufferViews, 0);
    }
    const differentBytes = fixture(); delete differentBytes.json.bufferViews[4].name;
    differentBytes.bin[differentBytes.json.bufferViews[4].byteOffset] ^= 1;
    assert.equal(optimizeGlb(pack(differentBytes.json, differentBytes.bin)).stats.mergedBufferViews, 0);
});

test('identical image views may share a definition, but images and texture references never merge', () => {
    const f = fixture(); delete f.json.bufferViews[5].name;
    const result = optimizeGlb(pack(f.json, f.bin));
    assert.equal(result.stats.mergedBufferViews, 1);
    assert.equal(result.json.images[0].bufferView, result.json.images[1].bufferView);
    assert.deepEqual(result.json.images.map(image => image.name), ['first', 'second']);
    assert.deepEqual(result.json.textures, f.json.textures);
    assert.deepEqual(viewBytes(parseGlb(result.glb), result.json.images[0].bufferView), png);
});

test('JSON is compact with legal space padding; output is deterministic', () => {
    const f = fixture(), input = pack(f.json, f.bin, true);
    const a = optimizeGlb(input), b = optimizeGlb(input);
    assert.deepEqual(a.glb, b.glb);
    const text = a.glb.subarray(20, 20 + a.glb.readUInt32LE(12)).toString();
    assert.equal(text.trimEnd(), JSON.stringify(a.json));
    assert.match(text.slice(JSON.stringify(a.json).length), /^ {0,3}$/);
    assert.deepEqual(optimizeGlb(a.glb).glb, a.glb);
});

test('metadata differences, including absent vs explicit values, forbid accessor merging', () => {
    const changes = [{ name: 'different' }, { extras: { keep: 1 } }, { min: [0, 2, 3] }, { max: [4, 2, 3] }, { normalized: false }];
    for (const change of changes) {
        const f = fixture(); Object.assign(f.json.accessors[4], change);
        assert.equal(optimizeGlb(pack(f.json, f.bin)).stats.mergedAccessors, 2);
    }
    const f = fixture(); f.bin[f.json.bufferViews[4].byteOffset] ^= 1;
    assert.equal(optimizeGlb(pack(f.json, f.bin)).stats.mergedAccessors, 2);
});

test('optional accessor dedup disabled keeps every accessor and reference', () => {
    const f = fixture(); const result = optimizeGlb(pack(f.json, f.bin), { deduplicateAccessors: false });
    assert.deepEqual(result.json.accessors, f.json.accessors);
    assert.deepEqual(result.json.meshes, f.json.meshes);
    assert.deepEqual(result.json.animations, f.json.animations);
});

test('mesh indices are remapped as well as attribute and morph references', () => {
    const f = fixture(); f.json.meshes[0].primitives[0].indices = 6;
    assert.equal(optimizeGlb(pack(f.json, f.bin)).json.meshes[0].primitives[0].indices, 3);
});

test('strided elements compare exactly while interleaved padding remains intact', () => {
    const bin = Buffer.from([1, 2, 3, 4, 99, 98, 97, 96, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]);
    const json = { asset: { version: '2.0' }, buffers: [{ byteLength: bin.length }], bufferViews: [
        { buffer: 0, byteOffset: 0, byteLength: 12, byteStride: 8 }, { buffer: 0, byteOffset: 12, byteLength: 8 },
    ], accessors: [0, 1].map(bufferView => ({ bufferView, componentType: 5121, type: 'VEC4', count: 2 })) };
    const out = optimizeGlb(pack(json, bin)); assert.equal(out.stats.mergedAccessors, 1);
    assert.deepEqual(viewBytes(parseGlb(out.glb), 0), bin.subarray(0, 12));
    json.bufferViews[0].byteStride = 6; assert.throws(() => parseGlb(pack(json, bin)), /byteStride/);
    json.bufferViews[0].byteStride = 4; json.accessors[0].type = 'MAT4';
    assert.throws(() => parseGlb(pack(json, bin)), /stride/);
});

test('matrix column padding participates conservatively in equality and bounds', () => {
    const bin = Buffer.alloc(24, 1); bin[15] = 9;
    const json = { asset: { version: '2.0' }, buffers: [{ byteLength: 24 }], bufferViews: [
        { buffer: 0, byteOffset: 0, byteLength: 12 }, { buffer: 0, byteOffset: 12, byteLength: 12 },
    ], accessors: [0, 1].map(bufferView => ({ bufferView, componentType: 5121, type: 'MAT3', count: 1 })) };
    assert.equal(optimizeGlb(pack(json, bin)).stats.mergedAccessors, 0);
    json.bufferViews[1].byteLength = 9;
    assert.throws(() => parseGlb(pack(json, bin)), /accessors\[1\].*bounds/);
});

test('only confirmed hashes externalize exact encoded texture bytes; images stay distinct', () => {
    const f = fixture(), input = pack(f.json, f.bin);
    assert.equal(optimizeGlb(input).sharedImages.length, 0);
    const result = optimizeGlb(input, externalOptions()), out = raw(result.glb);
    assert.equal(result.stats.externalizedImages, 2); assert.equal(result.stats.removedImageViews, 2);
    assert.equal(out.json.images.length, 2);
    assert.deepEqual(out.json.images.map(i => i.name), ['first', 'second']);
    assert.deepEqual(out.json.images[0].extras, { role: 1 });
    assert.equal(out.json.images[0].uri, out.json.images[1].uri);
    assert.match(out.json.images[0].uri, /^\.\.\/shared%20images\/[a-f0-9]{64}\.png$/);
    assert.deepEqual(out.json.textures, f.json.textures); assert.deepEqual(out.json.materials, f.json.materials);
    result.sharedImages.forEach(image => assert.deepEqual(image.bytes, png));
    assert.deepEqual(viewBytes(out, out.json.bufferViews.length - 1), viewBytes(f, f.unused));
    assert.throws(() => optimizeGlb(result.glb), /URI images.*re-entry/);
    assert.throws(() => optimizeGlb(input, { sharedImageHashes: [sha256(png)] }), /Set/);
    assert.throws(() => optimizeGlb(input, { sharedImageHashes: new Set(['bad']) }), /SHA-256/);
    assert.throws(() => optimizeGlb(input, { sharedImageHashes: new Set([sha256(png)]) }), /requires/);
});

test('image view shared with an accessor is not removed', () => {
    const f = fixture();
    f.json.accessors.push({ bufferView: 5, componentType: 5121, type: 'SCALAR', count: png.length });
    const out = optimizeGlb(pack(f.json, f.bin), externalOptions());
    assert.equal(out.stats.removedImageViews, 1);
    const doc = raw(out.glb); const accessor = doc.json.accessors.at(-1);
    assert.deepEqual(viewBytes(doc, accessor.bufferView), png);
});

test('image-only GLB keeps buffer metadata with minimal inert buffer', () => {
    const json = { asset: { version: '2.0' }, buffers: [{ byteLength: png.length, name: 'keep' }], bufferViews: [{ buffer: 0, byteLength: png.length }], images: [{ bufferView: 0, mimeType: 'image/png' }] };
    const out = optimizeGlb(pack(json, png), externalOptions());
    assert.equal(out.json.buffers[0].name, 'keep'); assert.equal(out.json.buffers[0].byteLength, 1);
    assert.equal(out.json.bufferViews, undefined); assert.deepEqual(out.sharedImages[0].bytes, png);
});

test('JSON-only GLB supported', () => {
    const input = pack({ asset: { version: '2.0' }, nodes: [{ name: 'empty' }] });
    assert.deepEqual(parseGlb(optimizeGlb(input).glb).json.nodes, [{ name: 'empty' }]);
});

test('malformed headers, chunks, lengths, UTF-8 and JSON rejected', () => {
    const f = fixture(), input = pack(f.json, f.bin);
    assert.throws(() => parseGlb(Buffer.alloc(12)), /truncated/);
    const mutations = [
        [b => b.writeUInt32LE(0, 0), /magic/], [b => b.writeUInt32LE(1, 4), /version/],
        [b => b.writeUInt32LE(1, 8), /length mismatch/], [b => b.writeUInt32LE(0xfffffffc, 12), /bounds/],
        [b => b.writeUInt32LE(3, 12), /aligned/], [b => b.writeUInt32LE(0, 16), /first chunk/],
        [b => b.writeUInt32LE(0, 24 + b.readUInt32LE(12)), /unknown/],
        [b => { b[20] = 0xff; }, /JSON\/UTF-8/], [b => { b[20] = 0x21; }, /JSON/],
    ];
    for (const [mutate, pattern] of mutations) { const bytes = Buffer.from(input); mutate(bytes); assert.throws(() => parseGlb(bytes), pattern); }
    const extra = Buffer.concat([input, Buffer.alloc(8)]); extra.writeUInt32LE(extra.length, 8);
    assert.throws(() => parseGlb(extra), /unknown/);
    const shortHeader = Buffer.concat([input, Buffer.alloc(4)]); shortHeader.writeUInt32LE(shortHeader.length, 8);
    assert.throws(() => parseGlb(shortHeader), /truncated chunk header/);
});

test('buffer, view and accessor boundaries and sparse/implicit accessors rejected', () => {
    const cases = [
        [f => { f.json.buffers[0].uri = 'external.bin'; }, /external buffer/],
        [f => { f.json.buffers[0].byteLength += 8; }, /BIN length/],
        [f => { f.json.buffers[0].byteLength -= 8; }, /BIN length/],
        [f => { f.json.bufferViews[0].byteLength = f.bin.length + 1; }, /buffer bounds/],
        [f => { f.json.bufferViews[0].buffer = 1; }, /buffer.*invalid/],
        [f => { f.json.bufferViews[0].byteOffset = 1; }, /unaligned/],
        [f => { f.json.accessors[0].count = 2; }, /bufferView bounds/],
        [f => { f.json.accessors[0].byteOffset = 1; }, /alignment/],
        [f => { f.json.accessors[0].sparse = {}; }, /sparse/],
        [f => { delete f.json.accessors[0].bufferView; }, /implicit zero/],
        [f => { f.json.accessors[0].componentType = 123; }, /componentType/],
        [f => { f.json.accessors[0].count = Number.MAX_SAFE_INTEGER; }, /bounds/],
    ];
    for (const [mutate, pattern] of cases) { const f = fixture(); mutate(f); assert.throws(() => parseGlb(pack(f.json, f.bin)), pattern); }
});

test('unknown extensions and misplaced known extensions fail closed', () => {
    const cases = [
        f => { f.json.extensionsUsed.push('KHR_draco_mesh_compression'); },
        f => { f.json.accessors[0].extensions = { KHR_materials_specular: {} }; },
        f => { f.json.materials[0].extensions.KHR_materials_specular.accessor = 0; },
        f => { f.json.materials[0].extensions.KHR_materials_specular.specularTexture.extensions = { KHR_texture_transform: {} }; },
        f => { f.json.materials[0].extensions.KHR_materials_specular.specularTexture.index = 99; },
        f => { f.json.extensionsRequired = ['EXT_meshopt_compression']; },
        f => { f.json.materials[0].extensions.KHR_materials_specular.specularFactor = { accessor: 0 }; },
        f => { f.json.materials[0].extensions.KHR_materials_anisotropy.anisotropyTexture.texCoord = -1; },
        f => { f.json.materials[0].extensions.KHR_materials_specular.specularColorFactor = [1, 2, { accessor: 0 }]; },
    ];
    for (const mutate of cases) { const f = fixture(); mutate(f); assert.throws(() => optimizeGlb(pack(f.json, f.bin)), /unsupported|extensions|reference|finite|integer/); }
});

test('invalid known references rejected before remapping', () => {
    const cases = [
        f => { f.json.meshes[0].primitives[0].attributes.COLOR_0 = 999; },
        f => { f.json.meshes[0].primitives[0].targets[0].POSITION = 999; },
        f => { f.json.skins[0].inverseBindMatrices = 999; },
        f => { f.json.animations[0].samplers[0].input = 999; },
        f => { f.json.animations[0].samplers[0].output = 999; },
        f => { f.json.animations[0].channels[0].sampler = 999; },
        f => { f.json.animations[0].channels[0].target.node = 999; },
        f => { f.json.textures[0].source = 999; },
    ];
    for (const mutate of cases) { const f = fixture(); mutate(f); assert.throws(() => optimizeGlb(pack(f.json, f.bin)), /reference out of range/); }
});

async function withTemp(run) {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'island-glb-lossless-test-'));
    try { await run(root); }
    finally {
        // Verify the exact absolute temporary target before recursive removal.
        assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
        assert.ok(path.basename(root).startsWith('island-glb-lossless-test-'));
        await fs.rm(root, { recursive: true, force: true });
    }
}
test('file API writes original image bytes, reuses identical files, never overwrites input/output', async () => withTemp(async root => {
    const f = fixture(), source = path.join(root, 'source.glb'), output = path.join(root, 'output.glb');
    const bytes = pack(f.json, f.bin); await fs.writeFile(source, bytes);
    const options = { sharedDir: path.join(root, 'shared'), sharedImageHashes: new Set([sha256(png)]) };
    await assert.rejects(processGlbFile(source, source, options), /in-place/);
    const result = await processGlbFile(source, output, options);
    assert.deepEqual(await fs.readFile(source), bytes);
    assert.deepEqual(await fs.readFile(result.sharedImages[0].path), png);
    assert.deepEqual(await fs.readFile(output), result.glb);
    assert.deepEqual(await fs.readdir(options.sharedDir), [`${sha256(png)}.png`]);
    await assert.rejects(processGlbFile(source, output, options), /already exists/);
    await processGlbFile(source, path.join(root, 'second.glb'), options);
    await assert.rejects(processGlbFile(output, path.join(root, 'reentry.glb'), options), /re-entry/);
    const alias = path.join(root, 'alias.glb'); await fs.link(source, alias);
    await assert.rejects(processGlbFile(source, alias, options), /already exists/);
    assert.deepEqual(await fs.readFile(source), bytes);
}));

test('non-finite JSON cannot be silently serialized to null', () => {
    const input = pack({ asset: { version: '2.0' }, extras: { huge: 1e100 } });
    const position = input.indexOf('1e+100'); assert.ok(position >= 0);
    input.write('1e+999', position);
    assert.throws(() => optimizeGlb(input), /non-finite/);
});

test('metadata object key order does not matter, signed-zero binary bytes do', () => {
    const f = fixture();
    f.json.accessors[0].extras = { a: 1, b: [2, 3] };
    f.json.accessors[4].extras = { b: [2, 3], a: 1 };
    assert.equal(optimizeGlb(pack(f.json, f.bin)).stats.mergedAccessors, 3);
    f.bin.writeFloatLE(0, f.json.bufferViews[0].byteOffset);
    f.bin.writeFloatLE(-0, f.json.bufferViews[4].byteOffset);
    assert.equal(optimizeGlb(pack(f.json, f.bin)).stats.mergedAccessors, 2);
});

test('CLI creates a new output and rejects overwrite and unknown arguments', async () => withTemp(async root => {
    const f = fixture(), source = path.join(root, 'source.glb'), output = path.join(root, 'output.glb');
    await fs.writeFile(source, pack(f.json, f.bin));
    const script = fileURLToPath(new URL('./island-glb-lossless.mjs', import.meta.url));
    const run = args => spawnSync(process.execPath, [script, ...args], { stdio: 'ignore' });
    const success = run([source, output, '--no-accessor-dedup']);
    assert.ifError(success.error); assert.equal(success.status, 0);
    assert.equal(parseGlb(await fs.readFile(output)).json.accessors.length, 7);
    assert.equal(run([source, output]).status, 1);
    assert.equal(run([source, source]).status, 1);
    assert.equal(run([source, path.join(root, 'not-created.glb'), '--unknown']).status, 1);
    await assert.rejects(fs.stat(path.join(root, 'not-created.glb')), { code: 'ENOENT' });
}));

test('shared hash destination collision aborts without touching files or creating output', async () => withTemp(async root => {
    const f = fixture(), source = path.join(root, 'source.glb'), output = path.join(root, 'output.glb');
    await fs.writeFile(source, pack(f.json, f.bin));
    const collision = path.join(root, `${sha256(png)}.png`); await fs.writeFile(collision, 'not original bytes');
    await assert.rejects(processGlbFile(source, output, { sharedDir: root, sharedImageHashes: new Set([sha256(png)]) }), /collision/);
    assert.equal(await fs.readFile(collision, 'utf8'), 'not original bytes');
    await assert.rejects(fs.stat(output), { code: 'ENOENT' });
}));
