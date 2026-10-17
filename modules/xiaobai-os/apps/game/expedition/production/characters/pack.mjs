/** Author-side packaging: lossless buffers and exact affine support points for grounding. */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
import process from 'node:process';
import { Mesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptEncoder } from 'meshoptimizer';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const [input, output] = process.argv.slice(2);
assert.ok(input && output && input !== output, 'Usage: node pack.mjs original.glb packed.glb');
const bytes = await fs.readFile(input), jsonSize = bytes.readUInt32LE(12);
const doc = JSON.parse(bytes.subarray(20, 20 + jsonSize)), bin = bytes.subarray(28 + jsonSize);
assert.equal(doc.buffers.length, 1);
assert.ok(!doc.extensionsUsed?.includes('EXT_meshopt_compression'), 'Pack the original export, not a packed asset');
const gltf = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
gltf.scene.updateMatrixWorld(true);
let originalContacts = 0, packedContacts = 0, contactGroups = 0;
gltf.scene.traverse(mesh => {
    if (!(mesh instanceof Mesh)) { return; }
    const positions = mesh.geometry.getAttribute('position'), weights = mesh.geometry.getAttribute('skinWeight'), joints = mesh.geometry.getAttribute('skinIndex');
    const groups = new Map(), point = new Vector3();
    for (let i = 0; i < positions.count; i++) {
        mesh.getVertexPosition(i, point).applyMatrix4(mesh.matrixWorld);
        if (point.y >= .09) { continue; }
        originalContacts++;
        // Equal skin influences transform all points in a group by the same affine map.
        const key = [0, 1, 2, 3].map(k => [joints.getComponent(i, k), weights.getComponent(i, k)]).flat().join(',');
        if (!groups.has(key)) { groups.set(key, new Map()); }
        const local = new Vector3().fromBufferAttribute(positions, i);
        groups.get(key).set(local.toArray().join(','), i);
    }
    assert.ok(!mesh.morphTargetInfluences?.length, 'Grounding support is authored without morph targets');
    const contacts = [...groups.values()].map(group => [...group.values()]);
    packedContacts += contacts.flat().length; contactGroups += contacts.length;
    const node = doc.nodes[gltf.parser.associations.get(mesh).nodes];
    node.extras = { ...node.extras, groundContacts: contacts };
});

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const sizes = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const widths = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const indices = new Set(doc.meshes.flatMap(m => m.primitives.map(p => p.indices)));
const chunks = []; let packedLength = 0;
for (const [index, view] of doc.bufferViews.entries()) {
    const users = doc.accessors.map((a, i) => ({ ...a, id: i })).filter(a => a.bufferView === index);
    assert.equal(users.length, 1, 'Current authored export uses one accessor per buffer view');
    const a = users[0], stride = view.byteStride ?? sizes[a.componentType] * widths[a.type];
    assert.equal(a.byteOffset ?? 0, 0); assert.equal(view.byteLength, a.count * stride);
    const original = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
    // INDICES retains even the exact order within each triangle, not just winding.
    const mode = indices.has(a.id) ? 'INDICES' : 'ATTRIBUTES';
    const encoded = MeshoptEncoder.encodeGltfBuffer(original, a.count, stride, mode);
    const restored = new Uint8Array(original.length);
    MeshoptDecoder.decodeGltfBuffer(restored, a.count, stride, encoded, mode);
    assert.deepEqual(Buffer.from(restored), original, `Buffer ${index} must round-trip byte for byte`);
    view.buffer = 1;
    view.extensions = { EXT_meshopt_compression: { buffer: 0, byteOffset: packedLength, byteLength: encoded.length,
        byteStride: stride, count: a.count, mode } };
    chunks.push(encoded, new Uint8Array((4 - encoded.length % 4) % 4));
    packedLength += Math.ceil(encoded.length / 4) * 4;
}
doc.buffers = [{ byteLength: packedLength }, { byteLength: doc.buffers[0].byteLength,
    extensions: { EXT_meshopt_compression: { fallback: true } } }];
doc.extensionsUsed = [...doc.extensionsUsed ?? [], 'EXT_meshopt_compression'];
doc.extensionsRequired = [...doc.extensionsRequired ?? [], 'EXT_meshopt_compression'];
const json = Buffer.from(JSON.stringify(doc)), jsonPadding = Buffer.alloc((4 - json.length % 4) % 4, 0x20);
const binary = Buffer.concat(chunks), header = Buffer.alloc(20), binaryHeader = Buffer.alloc(8);
header.writeUInt32LE(0x46546c67, 0); header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + json.length + jsonPadding.length + binary.length, 8);
header.writeUInt32LE(json.length + jsonPadding.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
binaryHeader.writeUInt32LE(binary.length, 0); binaryHeader.writeUInt32LE(0x004e4942, 4);
const packed = Buffer.concat([header, json, jsonPadding, binaryHeader, binary]);
await fs.writeFile(output, packed);
console.log(JSON.stringify({ before: bytes.length, after: packed.length, buffersVerified: doc.bufferViews.length, originalContacts, packedContacts, contactGroups }));
