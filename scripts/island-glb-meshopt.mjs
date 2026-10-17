// Lossless transport encoding for validated GLB outputs from island-glb-lossless.mjs.
// No simplification, quantization, filters, triangle rotation or animation pruning.
import assert from 'node:assert/strict';
import { MeshoptEncoder } from 'meshoptimizer/encoder';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { sha256 } from './island-glb-lossless.mjs';

const EXTENSION = 'EXT_meshopt_compression';
const MATERIAL_EXTENSIONS = new Set(['KHR_materials_specular', 'KHR_materials_anisotropy']);
const COMPONENT_BYTES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const TYPES = { SCALAR: [1, 1], VEC2: [1, 2], VEC3: [1, 3], VEC4: [1, 4], MAT2: [2, 2], MAT3: [3, 3], MAT4: [4, 4] };
const align4 = n => Math.ceil(n / 4) * 4;

export function readGlbChunks(input) {
    const bytes = Buffer.from(input);
    assert(bytes.length >= 20 && bytes.readUInt32LE(0) === 0x46546c67 && bytes.readUInt32LE(4) === 2, 'Expected GLB 2');
    assert.equal(bytes.readUInt32LE(8), bytes.length, 'GLB length');
    const jsonLength = bytes.readUInt32LE(12);
    assert(jsonLength % 4 === 0 && 20 + jsonLength <= bytes.length, 'JSON bounds');
    assert.equal(bytes.readUInt32LE(16), 0x4e4f534a, 'JSON first');
    const json = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(20, 20 + jsonLength)));
    if (20 + jsonLength === bytes.length) return { json, bin: Buffer.alloc(0) };
    const offset = 20 + jsonLength;
    assert(offset + 8 <= bytes.length && bytes.readUInt32LE(offset + 4) === 0x004e4942, 'BIN second');
    const binLength = bytes.readUInt32LE(offset);
    assert(binLength % 4 === 0 && offset + 8 + binLength === bytes.length, 'BIN bounds / unexpected chunk');
    return { json, bin: bytes.subarray(offset + 8) };
}
export function writeGlbChunks(json, bin) {
    const text = Buffer.from(JSON.stringify(json)), jsonLength = align4(text.length), binLength = align4(bin.length);
    const bytes = Buffer.alloc(28 + jsonLength + binLength);
    bytes.writeUInt32LE(0x46546c67); bytes.writeUInt32LE(2, 4); bytes.writeUInt32LE(bytes.length, 8);
    bytes.writeUInt32LE(jsonLength, 12); bytes.writeUInt32LE(0x4e4f534a, 16);
    bytes.fill(32, 20, 20 + jsonLength); text.copy(bytes, 20);
    bytes.writeUInt32LE(binLength, 20 + jsonLength); bytes.writeUInt32LE(0x004e4942, 24 + jsonLength);
    bin.copy(bytes, 28 + jsonLength); return bytes;
}
export function viewBytes(document, index) {
    const view = document.json.bufferViews[index], offset = view.byteOffset ?? 0;
    assert.equal(view.buffer, 0, 'Expected decoded embedded buffer');
    assert(Number.isSafeInteger(offset) && offset >= 0 && Number.isSafeInteger(view.byteLength) && view.byteLength > 0);
    assert(offset + view.byteLength <= document.json.buffers[0].byteLength && offset + view.byteLength <= document.bin.length, 'View bounds');
    return document.bin.subarray(offset, offset + view.byteLength);
}
export function accessorLayout(accessor) {
    assert(!accessor.sparse && accessor.bufferView !== undefined, 'Sparse / implicit accessors not supported');
    const component = COMPONENT_BYTES[accessor.componentType], shape = TYPES[accessor.type];
    assert(component && shape, 'Accessor component / shape');
    const [columns, rows] = shape;
    return { component, columns, rows, bytes: columns * (columns > 1 ? align4(rows * component) : rows * component) };
}
function binaryBuilder() {
    const parts = [], buckets = new Map(); let length = 0;
    return {
        append(bytes) {
            const key = sha256(bytes), bucket = buckets.get(key) ?? [];
            const existing = bucket.find(entry => entry.bytes.equals(bytes));
            if (existing) return existing.offset;
            const offset = length;
            bucket.push({ bytes, offset }); buckets.set(key, bucket);
            parts.push(bytes, Buffer.alloc(align4(bytes.length) - bytes.length)); length += align4(bytes.length);
            return offset;
        },
        get length() { return length; },
        finish() { return Buffer.concat(parts); },
    };
}
export async function compressGlbLosslessly(input) {
    await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
    assert(MeshoptEncoder.supported && MeshoptDecoder.supported, 'WebAssembly codec unavailable');
    const original = readGlbChunks(input), json = structuredClone(original.json);
    assert.equal(json.buffers?.length, 1, 'One embedded uncompressed source buffer required');
    assert(!json.buffers[0].uri && !json.buffers[0].extensions, 'External/compressed source buffer not supported');
    for (const key of ['extensionsUsed', 'extensionsRequired']) {
        for (const name of json[key] ?? []) assert(MATERIAL_EXTENSIONS.has(name), `Unexpected source extension ${name}`);
    }
    const sizes = new Map(), images = new Set((json.images ?? []).filter(image => image.bufferView !== undefined).map(image => image.bufferView));
    for (const accessor of json.accessors ?? []) {
        const size = accessorLayout(accessor).bytes, set = sizes.get(accessor.bufferView) ?? new Set();
        set.add(size); sizes.set(accessor.bufferView, set);
    }
    const payload = binaryBuilder(); let virtualLength = 0, compressedViews = 0;
    json.bufferViews = (json.bufferViews ?? []).map((view, index) => {
        assert(!view.extensions, 'Source view extensions not supported');
        const bytes = viewBytes(original, index), choices = sizes.get(index);
        if (!images.has(index) && choices?.size === 1 && bytes.length >= 256) {
            const stride = view.byteStride ?? [...choices][0], mode = view.target === 34963 ? 'INDICES' : 'ATTRIBUTES';
            const eligible = Number.isSafeInteger(stride) && stride > 0 && bytes.length % stride === 0
                && (mode === 'INDICES' ? stride === 2 || stride === 4 : stride % 4 === 0 && stride <= 256);
            if (eligible) {
                const count = bytes.length / stride;
                // v0 is understood by the project's bundled decoder. INDICES preserves order exactly.
                const encoded = Buffer.from(MeshoptEncoder.encodeGltfBuffer(bytes, count, stride, mode, 0));
                if (encoded.length + 180 < bytes.length) {
                    const decoded = Buffer.alloc(bytes.length);
                    MeshoptDecoder.decodeGltfBuffer(decoded, count, stride, encoded, mode, 'NONE');
                    assert.deepEqual(decoded, bytes, `Lossless decode view ${index}`);
                    const result = { ...view, buffer: 1, byteOffset: virtualLength, extensions: { [EXTENSION]: {
                        buffer: 0, byteOffset: payload.append(encoded), byteLength: encoded.length,
                        byteStride: stride, count, mode, filter: 'NONE',
                    } } };
                    virtualLength += align4(bytes.length); compressedViews++; return result;
                }
            }
        }
        return { ...view, buffer: 0, byteOffset: payload.append(bytes) };
    });
    if (!compressedViews) return { glb: Buffer.from(input), decodedGlb: Buffer.from(input), compressedViews: 0 };
    json.buffers = [{ ...json.buffers[0], byteLength: payload.length }, { byteLength: virtualLength, extensions: { [EXTENSION]: { fallback: true } } }];
    json.extensionsUsed = [...(json.extensionsUsed ?? []), EXTENSION];
    json.extensionsRequired = [...(json.extensionsRequired ?? []), EXTENSION];
    const glb = writeGlbChunks(json, payload.finish()), packed = readGlbChunks(glb);
    const restored = structuredClone(original.json), decodedPayload = binaryBuilder();
    restored.bufferViews = json.bufferViews.map((view, index) => {
        const extension = view.extensions?.[EXTENSION]; let bytes;
        if (extension) {
            bytes = Buffer.alloc(view.byteLength);
            MeshoptDecoder.decodeGltfBuffer(bytes, extension.count, extension.byteStride,
                packed.bin.subarray(extension.byteOffset, extension.byteOffset + extension.byteLength), extension.mode, extension.filter);
        } else bytes = viewBytes(packed, index);
        assert.deepEqual(bytes, viewBytes(original, index), `Serialized roundtrip view ${index}`);
        return { ...original.json.bufferViews[index], buffer: 0, byteOffset: decodedPayload.append(bytes) };
    });
    restored.buffers[0].byteLength = decodedPayload.length;
    return { glb, decodedGlb: writeGlbChunks(restored, decodedPayload.finish()), compressedViews };
}

// Reference-expanded semantic snapshot. Identity, all material/extras/animation fields,
// image encoded bytes, and effective accessor elements are compared, not numeric indices.
export async function semanticSnapshot(bytes, readImage) {
    const document = readGlbChunks(bytes), json = structuredClone(document.json);
    const accessor = index => {
        const value = document.json.accessors[index], { bytes: elementBytes } = accessorLayout(value);
        const view = document.json.bufferViews[value.bufferView], source = viewBytes(document, value.bufferView);
        const stride = view.byteStride ?? elementBytes, offset = value.byteOffset ?? 0;
        assert(Number.isSafeInteger(value.count) && value.count > 0 && stride >= elementBytes);
        assert(offset >= 0 && offset + (value.count - 1) * stride + elementBytes <= source.length, 'Accessor bounds');
        const elements = Buffer.alloc(value.count * elementBytes);
        for (let i = 0; i < value.count; i++) source.copy(elements, i * elementBytes, offset + i * stride, offset + i * stride + elementBytes);
        const metadata = { ...value }; delete metadata.bufferView; delete metadata.byteOffset;
        return { metadata, sha256: sha256(elements) };
    };
    for (const mesh of json.meshes ?? []) for (const primitive of mesh.primitives) {
        for (const key in primitive.attributes) primitive.attributes[key] = accessor(primitive.attributes[key]);
        if (primitive.indices !== undefined) primitive.indices = accessor(primitive.indices);
        for (const target of primitive.targets ?? []) for (const key in target) target[key] = accessor(target[key]);
    }
    for (const skin of json.skins ?? []) if (skin.inverseBindMatrices !== undefined) skin.inverseBindMatrices = accessor(skin.inverseBindMatrices);
    for (const animation of json.animations ?? []) {
        animation.channels = animation.channels.map(channel => {
            const sampler = animation.samplers[channel.sampler];
            return { ...channel, sampler: { ...sampler, input: accessor(sampler.input), output: accessor(sampler.output) } };
        });
        delete animation.samplers;
    }
    for (const image of json.images ?? []) {
        const payload = image.uri === undefined ? viewBytes(document, image.bufferView) : await readImage(image.uri);
        delete image.uri; delete image.bufferView; image.sha256 = sha256(payload);
    }
    delete json.accessors; delete json.bufferViews; delete json.buffers;
    return json;
}
