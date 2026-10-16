// Extract rotation-only pose deltas from the approved local paired study.
// No character meshes, proportions, clothing, or root translations are copied.
import { readFile, writeFile } from 'node:fs/promises';
import { Quaternion } from 'three';

const [source, output] = process.argv.slice(2);
if (!source || !output) { throw new Error('Usage: node export-embrace.mjs source.glb output.json'); }
const bytes = await readFile(source), jsonLength = bytes.readUInt32LE(12);
const gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString());
const bin = bytes.subarray(28 + jsonLength), animation = gltf.animations[0];
function values(index, width) {
    const a = gltf.accessors[index], b = gltf.bufferViews[a.bufferView], result = [];
    if (a.componentType !== 5126 || a.sparse) { throw new Error('Expected dense float animation'); }
    for (let i = 0; i < a.count; i++) {
        const offset = (b.byteOffset ?? 0) + (a.byteOffset ?? 0) + i * (b.byteStride ?? width * 4);
        result.push(Array.from({ length: width }, (_, j) => bin.readFloatLE(offset + j * 4)));
    }
    return result;
}
function pose(rootName) {
    const root = gltf.nodes.findIndex(n => n.name === rootName), nodes = new Set();
    if (root < 0) { throw new Error(`Missing actor ${rootName}`); }
    function visit(i) { nodes.add(i); (gltf.nodes[i].children ?? []).forEach(visit); }
    visit(root);
    return Object.fromEntries(animation.channels.filter(c => nodes.has(c.target.node) && c.target.path === 'rotation'
        && /^(spine|neck|head|clavicle|shoulder|upperarm|lowerarm|wrist|finger)/u.test(gltf.nodes[c.target.node].name)).map(c => {
        const sampler = animation.samplers[c.sampler], times = values(sampler.input, 1).flat(), samples = values(sampler.output, 4);
        let frame = times.findIndex(t => t >= 3.2);
        if (frame < 0) { frame = times.length - 1; }
        const before = Math.max(0, frame - 1), fraction = times[frame] === times[before] ? 1 : Math.min(1, (3.2 - times[before]) / (times[frame] - times[before]));
        const contact = new Quaternion().fromArray(samples[before]).slerp(new Quaternion().fromArray(samples[frame]), fraction);
        const delta = new Quaternion().fromArray(samples[0]).invert().multiply(contact);
        return [gltf.nodes[c.target.node].name, delta.toArray().map(v => +v.toFixed(7))];
    }));
}
await writeFile(output, JSON.stringify({ lower: pose('ye.Survivor'), upper: pose('player.Survivor') }) + '\n');
