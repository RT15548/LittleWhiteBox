#!/usr/bin/env node
/**
 * Conservative GLB 2 repacking; Node built-ins only, no codec or channel removal.
 * optimizeGlb(bytes, { deduplicateAccessors = true, sharedImageHashes = new Set(),
 *   outputGlbPath, sharedDir }) is pure: { glb, json, sharedImages, stats }.
 * processGlbFile(inputPath, outputPath, options) writes exact shared image bytes,
 * never overwrites output. Unsupported: sparse, URI images/buffers, unknown extensions.
 */
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;
const EXTENSIONS = new Set(['KHR_materials_specular', 'KHR_materials_anisotropy']);
const COMPONENT_BYTES = new Map([[5120, 1], [5121, 1], [5122, 2], [5123, 2], [5125, 4], [5126, 4]]);
const TYPES = { SCALAR: [1, 1], VEC2: [1, 2], VEC3: [1, 3], VEC4: [1, 4], MAT2: [2, 2], MAT3: [3, 3], MAT4: [4, 4] };
const fail = message => { throw new Error(`GLB lossless: ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };
const align4 = value => Math.ceil(value / 4) * 4;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const uint = (value, label, min = 0) => {
    assert(Number.isSafeInteger(value) && value >= min, `${label} must be an integer >= ${min}`);
    return value;
};
const list = (json, key) => {
    assert(json[key] === undefined || Array.isArray(json[key]), `${key} must be an array`);
    return json[key] ?? [];
};
const ref = (value, array, label) => {
    uint(value, label); assert(value < array.length, `${label} reference out of range`);
};
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const stable = value => {
    if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
    if (object(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
    return JSON.stringify(value);
};
function validateExtensions(json) {
    for (const key of ['extensionsUsed', 'extensionsRequired']) {
        for (const extension of list(json, key)) assert(EXTENSIONS.has(extension), `unsupported extension ${extension}`);
    }
    const materials = new Set(list(json, 'materials'));
    const visit = value => {
        if (Array.isArray(value)) { value.forEach(visit); return; }
        if (!object(value)) return;
        for (const [key, child] of Object.entries(value)) {
            if (key === 'extras') continue; // Opaque metadata, never extension-defined references.
            if (key === 'extensions') {
                assert(materials.has(value) && object(child), 'extensions only supported on materials');
                for (const [name, payload] of Object.entries(child)) {
                    assert(EXTENSIONS.has(name) && object(payload), `unsupported extension ${name}`);
                    const allowed = name === 'KHR_materials_specular'
                        ? ['specularFactor', 'specularTexture', 'specularColorFactor', 'specularColorTexture']
                        : ['anisotropyStrength', 'anisotropyRotation', 'anisotropyTexture'];
                    for (const field of Object.keys(payload)) {
                        assert(allowed.includes(field), `unsupported ${name} field ${field}`);
                        if (field.endsWith('Texture')) {
                            const info = payload[field];
                            assert(object(info), `${name}.${field} must be a texture info`);
                            for (const infoKey of Object.keys(info)) assert(['index', 'texCoord', 'extras'].includes(infoKey), `unsupported texture info field ${infoKey}`);
                            ref(info.index, list(json, 'textures'), `${name}.${field}.index`);
                            if (info.texCoord !== undefined) uint(info.texCoord, `${name}.${field}.texCoord`);
                        } else if (field === 'specularColorFactor') {
                            assert(Array.isArray(payload[field]) && payload[field].length === 3 && payload[field].every(value => typeof value === 'number' && Number.isFinite(value)), `${name}.${field} must be three finite numbers`);
                        } else {
                            assert(typeof payload[field] === 'number' && Number.isFinite(payload[field]), `${name}.${field} must be a finite number`);
                        }
                    }
                    visit(payload);
                }
            } else visit(child);
        }
    };
    visit(json);
}
function accessorLayout(accessor, view, index) {
    const label = `accessors[${index}]`;
    assert(object(accessor), `${label} must be an object`);
    assert(!Object.hasOwn(accessor, 'sparse'), `${label} sparse accessors are unsupported`);
    const size = COMPONENT_BYTES.get(accessor.componentType);
    const dims = Object.hasOwn(TYPES, accessor.type) ? TYPES[accessor.type] : undefined;
    assert(size && dims, `${label} invalid componentType/type`);
    const count = uint(accessor.count, `${label}.count`, 1);
    const offset = uint(accessor.byteOffset ?? 0, `${label}.byteOffset`);
    assert(offset % size === 0 && ((view.byteOffset ?? 0) + offset) % size === 0, `${label} component alignment`);
    const [columns, rows] = dims;
    const columnBytes = columns > 1 ? align4(rows * size) : rows * size;
    const elementBytes = columns * columnBytes;
    const stride = view.byteStride ?? elementBytes;
    assert(stride >= elementBytes && stride % size === 0, `${label} invalid stride`);
    if (columns > 1) assert(((view.byteOffset ?? 0) + offset) % 4 === 0, `${label} matrix alignment`);
    const end = offset + (count - 1) * stride + elementBytes;
    assert(Number.isSafeInteger(end) && end <= view.byteLength, `${label} exceeds bufferView bounds`);
    return { count, offset, stride, elementBytes };
}
function validateDocument(json, bin, hasBin) {
    const finiteNumbers = value => {
        if (typeof value === 'number') assert(Number.isFinite(value), 'JSON contains a non-finite number');
        else if (value !== null && typeof value === 'object') Object.values(value).forEach(finiteNumbers);
    };
    finiteNumbers(json);
    assert(object(json) && object(json.asset) && json.asset.version === '2.0', 'asset.version must be 2.0');
    assert(json.asset.minVersion === undefined || json.asset.minVersion === '2.0', 'unsupported asset.minVersion');
    const rootKeys = new Set(['asset', 'accessors', 'animations', 'buffers', 'bufferViews', 'cameras', 'images', 'materials', 'meshes', 'nodes', 'samplers', 'scene', 'scenes', 'skins', 'textures', 'extensions', 'extensionsUsed', 'extensionsRequired', 'extras']);
    for (const key of Object.keys(json)) assert(rootKeys.has(key), `unsupported root field ${key}`);
    const arrays = {};
    for (const key of ['accessors', 'animations', 'buffers', 'bufferViews', 'cameras', 'images', 'materials', 'meshes', 'nodes', 'samplers', 'scenes', 'skins', 'textures']) {
        arrays[key] = list(json, key);
        for (const item of arrays[key]) assert(object(item), `${key} entries must be objects`);
    }
    validateExtensions(json);
    const { buffers, bufferViews: views, accessors, images, meshes, nodes, skins, textures, animations } = arrays;
    assert(buffers.length <= 1, 'only one embedded buffer is supported');
    if (buffers.length) {
        assert(!Object.hasOwn(buffers[0], 'uri'), 'external buffer URI is unsupported');
        const length = uint(buffers[0].byteLength, 'buffers[0].byteLength', 1);
        assert(hasBin && length <= bin.length && bin.length - length <= 3, 'BIN length does not match buffer length');
    } else assert(!hasBin && views.length === 0, 'BIN/bufferViews require an embedded buffer');
    views.forEach((view, index) => {
        assert(view.buffer === 0 && buffers.length === 1, `bufferViews[${index}].buffer invalid`);
        const offset = uint(view.byteOffset ?? 0, `bufferViews[${index}].byteOffset`);
        const length = uint(view.byteLength, `bufferViews[${index}].byteLength`, 1);
        assert(Number.isSafeInteger(offset + length) && offset + length <= buffers[0].byteLength, `bufferViews[${index}] exceeds buffer bounds`);
        assert(offset % 4 === 0, `bufferViews[${index}] unaligned offset is unsupported`);
        if (view.byteStride !== undefined) {
            uint(view.byteStride, `bufferViews[${index}].byteStride`, 4);
            assert(view.byteStride <= 252 && view.byteStride % 4 === 0, `bufferViews[${index}] invalid byteStride`);
        }
    });
    accessors.forEach((accessor, index) => {
        assert(!Object.hasOwn(accessor, 'sparse'), `accessors[${index}] sparse accessors are unsupported`);
        ref(accessor.bufferView, views, `accessors[${index}].bufferView (implicit zero accessors unsupported)`);
        accessorLayout(accessor, views[accessor.bufferView], index);
    });
    images.forEach((image, index) => {
        assert(!Object.hasOwn(image, 'uri'), `images[${index}] external/URI images are unsupported (no re-entry)`);
        ref(image.bufferView, views, `images[${index}].bufferView`);
        assert(['image/png', 'image/jpeg'].includes(image.mimeType), `images[${index}] unsupported mimeType`);
        assert(views[image.bufferView].byteStride === undefined, `images[${index}] cannot use a strided view`);
    });
    meshes.forEach((mesh, m) => {
        assert(Array.isArray(mesh.primitives) && mesh.primitives.length > 0, `meshes[${m}] requires primitives`);
        mesh.primitives.forEach((primitive, p) => {
            assert(object(primitive) && object(primitive.attributes), `meshes[${m}].primitives[${p}] invalid attributes`);
            for (const value of Object.values(primitive.attributes)) ref(value, accessors, 'mesh attribute');
            if (primitive.indices !== undefined) ref(primitive.indices, accessors, 'mesh indices');
            if (primitive.material !== undefined) ref(primitive.material, arrays.materials, 'mesh material');
            if (primitive.targets !== undefined) {
                assert(Array.isArray(primitive.targets), 'morph targets must be an array');
                for (const target of primitive.targets) {
                    assert(object(target), 'morph target must be an object');
                    for (const value of Object.values(target)) ref(value, accessors, 'morph target');
                }
            }
        });
    });
    nodes.forEach(node => {
        if (node.mesh !== undefined) ref(node.mesh, meshes, 'node.mesh');
        if (node.skin !== undefined) ref(node.skin, skins, 'node.skin');
        if (node.camera !== undefined) ref(node.camera, arrays.cameras, 'node.camera');
        if (node.children !== undefined) {
            assert(Array.isArray(node.children), 'node.children must be an array');
            node.children.forEach(child => ref(child, nodes, 'node child'));
        }
    });
    skins.forEach(skin => {
        if (skin.inverseBindMatrices !== undefined) ref(skin.inverseBindMatrices, accessors, 'skin.inverseBindMatrices');
        assert(Array.isArray(skin.joints) && skin.joints.length > 0, 'skin requires joints');
        skin.joints.forEach(joint => ref(joint, nodes, 'skin joint'));
        if (skin.skeleton !== undefined) ref(skin.skeleton, nodes, 'skin skeleton');
    });
    animations.forEach(animation => {
        assert(Array.isArray(animation.samplers) && Array.isArray(animation.channels), 'animation requires samplers/channels');
        animation.samplers.forEach(sampler => {
            assert(object(sampler), 'animation sampler must be an object');
            ref(sampler.input, accessors, 'animation sampler input'); ref(sampler.output, accessors, 'animation sampler output');
        });
        animation.channels.forEach(channel => {
            assert(object(channel) && object(channel.target), 'animation channel requires target');
            ref(channel.sampler, animation.samplers, 'animation channel sampler');
            ref(channel.target.node, nodes, 'animation target node');
            assert(['translation', 'rotation', 'scale', 'weights'].includes(channel.target.path), 'unsupported animation target path');
        });
    });
    textures.forEach(texture => {
        ref(texture.source, images, 'texture.source');
        if (texture.sampler !== undefined) ref(texture.sampler, arrays.samplers, 'texture.sampler');
    });
    const checkTexture = info => {
        if (info !== undefined) { assert(object(info), 'invalid texture info'); ref(info.index, textures, 'material texture index'); }
    };
    arrays.materials.forEach(material => {
        for (const key of ['normalTexture', 'occlusionTexture', 'emissiveTexture']) checkTexture(material[key]);
        if (material.pbrMetallicRoughness) {
            checkTexture(material.pbrMetallicRoughness.baseColorTexture); checkTexture(material.pbrMetallicRoughness.metallicRoughnessTexture);
        }
    });
    arrays.scenes.forEach(scene => {
        if (scene.nodes !== undefined) {
            assert(Array.isArray(scene.nodes), 'scene.nodes must be an array');
            scene.nodes.forEach(node => ref(node, nodes, 'scene node'));
        }
    });
    if (json.scene !== undefined) ref(json.scene, arrays.scenes, 'scene');
}
/** Parse and validate GLB/chunk/bufferView/accessor boundaries before transformation. */
export function parseGlb(input) {
    assert(Buffer.isBuffer(input) || input instanceof Uint8Array, 'input must be bytes');
    const bytes = Buffer.from(input);
    assert(bytes.length >= 20, 'truncated header/JSON chunk');
    assert(bytes.readUInt32LE(0) === 0x46546c67, 'invalid GLB magic');
    assert(bytes.readUInt32LE(4) === 2, 'only GLB version 2 is supported');
    assert(bytes.readUInt32LE(8) === bytes.length, 'GLB total length mismatch');
    let offset = 12;
    const chunks = [];
    while (offset < bytes.length) {
        assert(offset + 8 <= bytes.length, 'truncated chunk header');
        const length = bytes.readUInt32LE(offset);
        const type = bytes.readUInt32LE(offset + 4);
        assert(length % 4 === 0, 'chunk length must be four-byte aligned');
        assert(offset + 8 + length <= bytes.length, 'chunk exceeds GLB bounds');
        chunks.push({ type, bytes: bytes.subarray(offset + 8, offset + 8 + length) });
        offset += 8 + length;
    }
    assert(chunks.length >= 1 && chunks[0].type === JSON_CHUNK, 'first chunk must be JSON');
    assert(chunks.length <= 2 && (chunks.length === 1 || chunks[1].type === BIN_CHUNK), 'unknown/duplicate/out-of-order chunks');
    let json;
    try { json = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(chunks[0].bytes)); }
    catch (error) { fail(`invalid JSON/UTF-8: ${error.message}`); }
    const bin = chunks[1]?.bytes ?? Buffer.alloc(0);
    validateDocument(json, bin, chunks.length === 2);
    return { json, bin };
}
function encodeGlb(json, bin) {
    const text = Buffer.from(JSON.stringify(json));
    const jsonBytes = Buffer.alloc(align4(text.length), 0x20); text.copy(jsonBytes);
    const hasBin = (json.buffers?.length ?? 0) > 0;
    const length = 20 + jsonBytes.length + (hasBin ? 8 + align4(bin.length) : 0);
    assert(length <= 0xffffffff, 'output exceeds GLB 32-bit length');
    const output = Buffer.alloc(length);
    output.writeUInt32LE(0x46546c67, 0); output.writeUInt32LE(2, 4); output.writeUInt32LE(length, 8);
    output.writeUInt32LE(jsonBytes.length, 12); output.writeUInt32LE(JSON_CHUNK, 16); jsonBytes.copy(output, 20);
    if (hasBin) {
        const offset = 20 + jsonBytes.length;
        output.writeUInt32LE(align4(bin.length), offset); output.writeUInt32LE(BIN_CHUNK, offset + 4); bin.copy(output, offset + 8);
    }
    return output;
}
function deduplicateAccessors(json, bin) {
    const old = json.accessors ?? [], result = [], mapping = [], buckets = new Map();
    old.forEach((accessor, index) => {
        const view = json.bufferViews[accessor.bufferView];
        const layout = accessorLayout(accessor, view, index);
        const metadata = { ...accessor };
        delete metadata.bufferView;
        delete metadata.byteOffset;
        // All metadata must match; matrix column padding is compared conservatively.
        const elements = Buffer.alloc(layout.count * layout.elementBytes);
        for (let n = 0; n < layout.count; n++) {
            const start = (view.byteOffset ?? 0) + layout.offset + n * layout.stride;
            bin.copy(elements, n * layout.elementBytes, start, start + layout.elementBytes);
        }
        const key = `${stable(metadata)}:${sha256(elements)}`;
        const candidates = buckets.get(key) ?? [];
        const existing = candidates.find(candidate => candidate.bytes.equals(elements));
        if (existing) mapping.push(existing.index);
        else {
            mapping.push(result.length);
            candidates.push({ bytes: elements, index: result.length }); buckets.set(key, candidates); result.push(accessor);
        }
    });
    for (const mesh of json.meshes ?? []) for (const primitive of mesh.primitives) {
        for (const key of Object.keys(primitive.attributes)) primitive.attributes[key] = mapping[primitive.attributes[key]];
        if (primitive.indices !== undefined) primitive.indices = mapping[primitive.indices];
        for (const target of primitive.targets ?? []) for (const key of Object.keys(target)) target[key] = mapping[target[key]];
    }
    for (const skin of json.skins ?? []) if (skin.inverseBindMatrices !== undefined) skin.inverseBindMatrices = mapping[skin.inverseBindMatrices];
    for (const animation of json.animations ?? []) for (const sampler of animation.samplers) {
        sampler.input = mapping[sampler.input]; sampler.output = mapping[sampler.output];
    }
    if (json.accessors !== undefined) json.accessors = result;
    return old.length - result.length;
}
export function optimizeGlb(input, options = {}) {
    const { json, bin } = parseGlb(input);
    const hashes = options.sharedImageHashes ?? new Set();
    assert(hashes instanceof Set, 'sharedImageHashes must be an explicitly confirmed Set of SHA-256 hashes');
    for (const hash of hashes) assert(typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash), 'invalid SHA-256 hash');
    const views = json.bufferViews ?? [], removedCandidates = new Set(), sharedImages = [];
    for (const image of json.images ?? []) {
        const view = views[image.bufferView];
        const bytes = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
        const hash = sha256(bytes);
        if (!hashes.has(hash)) continue;
        assert(typeof options.outputGlbPath === 'string' && typeof options.sharedDir === 'string', 'externalization requires outputGlbPath and sharedDir');
        const target = path.resolve(options.sharedDir, `${hash}${image.mimeType === 'image/png' ? '.png' : '.jpg'}`);
        const outputPath = path.resolve(options.outputGlbPath);
        const samePath = process.platform === 'win32' ? target.toLowerCase() === outputPath.toLowerCase() : target === outputPath;
        assert(!samePath, 'shared image path must differ from output GLB path');
        const relative = path.relative(path.dirname(outputPath), target);
        assert(relative && !path.isAbsolute(relative), 'shared image directory must be on the output GLB filesystem root');
        const uri = relative.split(path.sep).map(encodeURIComponent).join('/');
        sharedImages.push({ hash, mimeType: image.mimeType, bytes: Buffer.from(bytes), path: target, uri });
        removedCandidates.add(image.bufferView); delete image.bufferView; image.uri = uri;
    }
    // Count before merging: even duplicate/unused accessor views remain. Remove only
    // views exclusively referenced by images which have all been externalized.
    const retainedReferences = new Set((json.accessors ?? []).map(accessor => accessor.bufferView));
    for (const image of json.images ?? []) if (image.bufferView !== undefined) retainedReferences.add(image.bufferView);
    const mergedAccessors = options.deduplicateAccessors === false ? 0 : deduplicateAccessors(json, bin);
    const newViews = [], mapping = new Map(), segments = [], buckets = new Map(), definitions = new Map();
    let length = 0, reusedViewBytes = 0, mergedBufferViews = 0, removedImageViews = 0;
    for (let index = 0; index < views.length; index++) {
        if (removedCandidates.has(index) && !retainedReferences.has(index)) { removedImageViews++; continue; }
        const view = views[index];
        const bytes = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
        const key = sha256(bytes), candidates = buckets.get(key) ?? [];
        let existing = candidates.find(candidate => candidate.bytes.equals(bytes));
        if (!existing) {
            existing = { bytes, offset: align4(length) }; length = existing.offset + bytes.length;
            candidates.push(existing); buckets.set(key, candidates); segments.push(existing);
        } else reusedViewBytes += bytes.length;
        const metadata = { ...view };
        delete metadata.byteOffset;
        const definitionKey = `${stable(metadata)}:${key}`;
        const matchingDefinitions = definitions.get(definitionKey) ?? [];
        const definition = matchingDefinitions.find(candidate => candidate.bytes.equals(bytes));
        if (definition) {
            mapping.set(index, definition.index); mergedBufferViews++;
        } else {
            mapping.set(index, newViews.length);
            matchingDefinitions.push({ bytes, index: newViews.length }); definitions.set(definitionKey, matchingDefinitions);
            newViews.push({ ...view, buffer: 0, byteOffset: existing.offset });
        }
    }
    for (const accessor of json.accessors ?? []) accessor.bufferView = mapping.get(accessor.bufferView);
    for (const image of json.images ?? []) if (image.bufferView !== undefined) image.bufferView = mapping.get(image.bufferView);
    let newBin = Buffer.alloc(length);
    for (const segment of segments) segment.bytes.copy(newBin, segment.offset);
    if (newViews.length) {
        json.bufferViews = newViews; json.buffers[0].byteLength = length;
    } else {
        delete json.bufferViews; // glTF arrays, when present, must not be empty.
        if (json.buffers?.length) {
            // Keep buffer-level metadata and one inert byte (zero-length buffers invalid).
            newBin = Buffer.alloc(1); json.buffers[0].byteLength = 1;
        }
    }
    const glb = encodeGlb(json, newBin);
    return { glb, json, sharedImages, stats: {
        inputBytes: input.length, outputBytes: glb.length, mergedAccessors,
        removedImageViews, mergedBufferViews, reusedViewBytes, externalizedImages: sharedImages.length,
    } };
}
/** Never overwrite input, any existing output, or differing existing shared bytes. */
export async function processGlbFile(inputPath, outputPath, options = {}) {
    const source = path.resolve(inputPath), destination = path.resolve(outputPath);
    assert(source !== destination, 'in-place overwrite is forbidden');
    try { await fs.lstat(destination); fail('output already exists; overwrite/re-entry is forbidden'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    const result = optimizeGlb(await fs.readFile(source), { ...options, outputGlbPath: destination });
    const unique = new Map(result.sharedImages.map(image => [image.path, image]));
    for (const image of unique.values()) {
        try { assert((await fs.readFile(image.path)).equals(image.bytes), `shared image collision at ${image.path}`); }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    for (const image of unique.values()) {
        await fs.mkdir(path.dirname(image.path), { recursive: true });
        try { await fs.writeFile(image.path, image.bytes, { flag: 'wx' }); }
        catch (error) {
            if (error.code !== 'EEXIST') throw error;
            assert((await fs.readFile(image.path)).equals(image.bytes), `shared image collision at ${image.path}`);
        }
    }
    await fs.writeFile(destination, result.glb, { flag: 'wx' }); return result;
}
async function main(args) {
    const [input, output, ...flags] = args;
    assert(input && output, 'usage: node scripts/island-glb-lossless.mjs INPUT.glb OUTPUT.glb [--shared-dir DIR --shared-hashes SHA256,SHA256] [--no-accessor-dedup]');
    const options = {};
    for (let i = 0; i < flags.length; i++) {
        if (flags[i] === '--no-accessor-dedup') options.deduplicateAccessors = false;
        else if (flags[i] === '--shared-dir') { assert(flags[i + 1], 'missing shared directory'); options.sharedDir = flags[++i]; }
        else if (flags[i] === '--shared-hashes') { assert(flags[i + 1], 'missing hashes'); options.sharedImageHashes = new Set(flags[++i].split(',')); }
        else fail(`unknown CLI argument ${flags[i]}`);
    }
    console.log(JSON.stringify((await processGlbFile(input, output, options)).stats));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
    main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
