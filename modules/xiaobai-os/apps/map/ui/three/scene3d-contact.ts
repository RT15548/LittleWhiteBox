import { CircleGeometry, DataTexture, LinearFilter, Mesh, MeshBasicMaterial, RGBAFormat, type Group } from 'three';
import type { Scene3DResources } from './scene3d-resources.js';

/** Bounded ambient contact, inside an actual object's footprint, independent of sun direction. */
export function createContactShadows(resources: Scene3DResources) {
    const size = 48, pixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const radius = Math.hypot((x + .5) / size * 2 - 1, (y + .5) / size * 2 - 1);
            pixels[(y * size + x) * 4 + 3] = Math.round(Math.max(0, 1 - radius) ** 1.5 * 120);
        }
    }
    const texture = resources.own(new DataTexture(pixels, size, size, RGBAFormat));
    texture.magFilter = texture.minFilter = LinearFilter; texture.needsUpdate = true;
    const geometry = resources.own(new CircleGeometry(.5, 32).rotateX(-Math.PI / 2));
    const materials = new Map<number, MeshBasicMaterial>();
    let count = 0;
    return (parent: Group, width: number, depth: number, opacity: number) => {
        if (count++ >= 96) {return;}
        if (!materials.has(opacity)) {
            materials.set(opacity, resources.own(new MeshBasicMaterial({ map: texture, transparent: true, opacity, depthWrite: false, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -1 })));
        }
        const mesh = new Mesh(geometry, materials.get(opacity));
        mesh.scale.set(width, 1, depth); mesh.position.y = .019;
        parent.add(mesh);
    };
}
