/* eslint-env node */
// Offline conversion only. Pass the directory containing the four verified Kenney packs.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { Box3, BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const sourceRoot = process.argv[2];
if (!sourceRoot) throw new Error('Usage: node scripts/prepare-map-scene-assets.mjs <extracted-pack-directory>');
const target = 'modules/xiaobai-os/apps/map/ui/three/assets/kenney';
const files = [
    ['furniture', 'table', 'table'], ['furniture', 'chairRounded', 'chair'], ['furniture', 'bedSingle', 'bed'],
    ['furniture', 'bookcaseOpenLow', 'shelf'], ['nature', 'tree_oak', 'tree'], ['nature', 'stone_largeE', 'rock'],
    ['furniture', 'stoolBar', 'stool'], ['furniture', 'bench', 'bench'], ['furniture', 'loungeSofa', 'sofa'], ['furniture', 'kitchenCabinet', 'cabinet'],
    ['furniture', 'kitchenStove', 'stove'], ['furniture', 'kitchenFridge', 'refrigerator'], ['furniture', 'kitchenSink', 'sink'],
    ['furniture', 'toilet', 'toilet'], ['furniture', 'bathtub', 'bathtub'], ['furniture', 'pottedPlant', 'potted-plant'], ['furniture', 'lampRoundFloor', 'light'],
    ['nature', 'statue_ring', 'statue'], ['survival', 'chest', 'chest'], ['survival', 'barrel', 'barrel'], ['survival', 'tent-canvas', 'tent'], ['car', 'sedan', 'car'],
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
function encodeGlb(json, bin) {
    const text = Buffer.from(JSON.stringify(json)), padding = (4 - text.length % 4) % 4;
    const jsonChunk = Buffer.concat([text, Buffer.alloc(padding, 32)]);
    const header = Buffer.alloc(20); header.writeUInt32LE(0x46546c67); header.writeUInt32LE(2, 4);
    header.writeUInt32LE(28 + jsonChunk.length + bin.length, 8); header.writeUInt32LE(jsonChunk.length, 12); header.writeUInt32LE(0x4e4f534a, 16);
    const binHeader = Buffer.alloc(8); binHeader.writeUInt32LE(bin.length); binHeader.writeUInt32LE(0x004e4942, 4);
    return Buffer.concat([header, jsonChunk, binHeader, bin]);
}
const manifest = [];
await mkdir(target, { recursive: true });
for (const [pack, name, icon] of files) {
    const originalFile = `${pack}/Models/${['car', 'survival'].includes(pack) ? 'GLB' : 'GLTF'} format/${name}.glb`;
    const bytes = await readFile(path.join(sourceRoot, originalFile));
    // Strip texture references before decoding. Palette columns below become semantic surfaces,
    // not a tinted atlas, and conversion never fetches an image or an external resource.
    const sourceJson = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
    const binary = bytes.subarray(28 + bytes.readUInt32LE(12));
    sourceJson.buffers = [{ byteLength: binary.length }];
    sourceJson.materials = sourceJson.materials.map(material => ({ name: material.name, pbrMetallicRoughness: { metallicFactor: 0 } }));
    delete sourceJson.textures; delete sourceJson.images; delete sourceJson.samplers;
    delete sourceJson.extensionsUsed; delete sourceJson.extensionsRequired;
    const prepared = encodeGlb(sourceJson, binary);
    const gltf = await new GLTFLoader().parseAsync(prepared.buffer.slice(prepared.byteOffset, prepared.byteOffset + prepared.byteLength), '');
    if (name === 'bathtub') gltf.scene.rotation.y = Math.PI / 2;
    gltf.scene.updateMatrixWorld(true);
    const bounds = new Box3().setFromObject(gltf.scene);
    const center = bounds.getCenter(new Vector3());
    const batches = new Map();
    gltf.scene.traverse(mesh => {
        if (!mesh.isMesh) return;
        if (Array.isArray(mesh.material)) throw new Error('Unexpected multi-material primitive');
        const source = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
        source.applyMatrix4(mesh.matrixWorld).translate(-center.x, -bounds.min.y, -center.z);
        const positions = source.getAttribute('position'), normals = source.getAttribute('normal');
        const sourceUv = source.getAttribute('uv');
        const surfaces = new Map();
        function roleAt(i) {
            const material = mesh.material.name;
            if (pack === 'car') {
                if (mesh.name.startsWith('wheel')) return 'detail';
                const u = sourceUv.getX(i);
                return Math.abs(u - .84375) < .001 ? 'main' : Math.abs(u - .46875) < .001 ? 'window' : 'detail';
            }
            if (name === 'tent-canvas') return Math.abs(sourceUv.getX(i) - .59375) < .001 ? 'wood' : 'main';
            if (pack === 'survival') return Math.abs(sourceUv.getX(i) - .34375) < .001 ? 'detail' : 'main';
            if (name === 'tree_oak') return material === 'woodBark' ? 'bark' : 'main';
            if (name === 'pottedPlant') return material === 'plant' ? 'foliage' : 'main';
            if (name === 'lampRoundFloor') return material === 'lamp' ? 'shade' : 'main';
            if (name === 'bedSingle') return material === 'carpetWhite' ? 'soft' : ['wood', 'metal'].includes(material) ? 'detail' : 'main';
            if (name === 'loungeSofa') return material === 'wood' ? 'detail' : 'main';
            if (['metalDark', 'woodDark', 'stoneDark', 'glass'].includes(material)) return 'detail';
            return 'main';
        }
        for (let i = 0; i < positions.count; i++) {
            const role = roleAt(i - i % 3);
            if (!surfaces.has(role)) surfaces.set(role, { position: [], normal: [], uv: [] });
            const surface = surfaces.get(role);
            const axis = [Math.abs(normals.getX(i)), Math.abs(normals.getY(i)), Math.abs(normals.getZ(i))];
            const dominant = axis.indexOf(Math.max(...axis));
            surface.position.push(positions.getX(i), positions.getY(i), positions.getZ(i));
            surface.normal.push(normals.getX(i), normals.getY(i), normals.getZ(i));
            surface.uv.push(dominant === 0 ? positions.getZ(i) : positions.getX(i), dominant === 1 ? positions.getZ(i) : positions.getY(i));
        }
        for (const [role, surface] of surfaces) {
            const geometry = new BufferGeometry();
            geometry.setAttribute('position', new Float32BufferAttribute(surface.position, 3));
            geometry.setAttribute('normal', new Float32BufferAttribute(surface.normal, 3));
            geometry.setAttribute('uv', new Float32BufferAttribute(surface.uv, 2));
            if (!batches.has(role)) batches.set(role, []);
            batches.get(role).push(geometry);
        }
        source.dispose();
    });
    // Minimal static GLB: baked transforms, semantic surfaces, no images, lights, extras or extensions.
    const json = { asset: { version: '2.0', generator: 'LittleWhiteBox/prepare-map-scene-assets' }, scene: 0,
        scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }], meshes: [{ primitives: [] }],
        materials: [], accessors: [], bufferViews: [], buffers: [{ byteLength: 0 }] };
    const chunks = [];
    let triangles = 0, radius = 0;
    const bakedBounds = new Box3();
    for (const [role, parts] of batches) {
        const geometry = mergeGeometries(parts); geometry.computeBoundingBox();
        bakedBounds.union(geometry.boundingBox);
        const positions = geometry.getAttribute('position');
        for (let i = 0; i < positions.count; i++) radius = Math.max(radius, Math.hypot(positions.getX(i), positions.getZ(i)));
        const attributes = {};
        for (const [key, semantic, type] of [['position', 'POSITION', 'VEC3'], ['normal', 'NORMAL', 'VEC3'], ['uv', 'TEXCOORD_0', 'VEC2']]) {
            const attribute = geometry.getAttribute(key), buffer = Buffer.from(attribute.array.buffer);
            const accessor = { bufferView: json.bufferViews.length, componentType: 5126, count: attribute.count, type };
            if (key === 'position') { accessor.min = geometry.boundingBox.min.toArray(); accessor.max = geometry.boundingBox.max.toArray(); }
            attributes[semantic] = json.accessors.length; json.accessors.push(accessor);
            json.bufferViews.push({ buffer: 0, byteOffset: json.buffers[0].byteLength, byteLength: buffer.length, target: 34962 });
            chunks.push(buffer); json.buffers[0].byteLength += buffer.length;
        }
        triangles += geometry.getAttribute('position').count / 3;
        json.meshes[0].primitives.push({ attributes, material: json.materials.length, mode: 4 });
        json.materials.push({ name: role, pbrMetallicRoughness: { baseColorFactor: [1, 1, 1, 1], metallicFactor: 0, roughnessFactor: 1 } });
        geometry.dispose(); parts.forEach(part => part.dispose());
    }
    const bin = Buffer.concat(chunks), output = encodeGlb(json, bin);
    if (output.length > 250 * 1024 || triangles > 5000 || batches.size > 3) throw new Error(`${name}: asset budget exceeded`);
    await writeFile(`${target}/${name}.glb`, output);
    manifest.push({ icon, file: `${name}.glb`, originalFile, sourceSha256: hash(bytes), sha256: hash(output), bytes: output.length,
        triangles, batches: batches.size, geometryBytes: bin.length, size: bakedBounds.getSize(new Vector3()).toArray(), radius });
}
for (const pack of ['furniture', 'nature', 'car', 'survival']) await copyFile(path.join(sourceRoot, pack, 'License.txt'), `${target}/LICENSE-${pack}.txt`);
await writeFile(`${target}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
