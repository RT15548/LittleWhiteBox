import * as T from 'three';
import atlas from '../assets/foliage-atlas.png?url&no-inline';

export type LeafKind = 'palm' | 'coastal' | 'mangrove' | 'dry';
const CELLS: Record<LeafKind, readonly [number, number]> = { palm: [0, 1], coastal: [1, 1], mangrove: [0, 0], dry: [1, 0] };

// One atlas and one shared material for all leaf geometry. The scene owns their lifetime.
export function createFoliage(onLoad: () => void, onError: () => void) {
    const texture = new T.TextureLoader().load(atlas, onLoad, undefined, onError);
    texture.colorSpace = T.SRGBColorSpace;
    const material = new T.MeshStandardMaterial({ map: texture, color: '#d2e0c3', alphaTest: .45, side: T.DoubleSide, roughness: .95 });
    function leaf(kind: LeafKind, length: number, width: number, arch = .35, droop = .2) {
        const positions: number[] = [], uvs: number[] = [], indices: number[] = [], cell = CELLS[kind];
        const steps = 8;
        for (let row = 0; row <= steps; row++) {
            const t = row / steps;
            for (let column = 0; column < 3; column++) {
                const u = column / 2, x = (u - .5) * width;
                positions.push(x, Math.sin(t * Math.PI) * arch - droop * t - Math.abs(x) * .08, t * length);
                uvs.push((cell[0] + u) / 2, (cell[1] + t) / 2);
            }
        }
        for (let row = 0; row < steps; row++) { for (let column = 0; column < 2; column++) {
            const a = row * 3 + column, b = a + 3;
            indices.push(a, b, a + 1, a + 1, b, b + 1);
        } }
        const geometry = new T.BufferGeometry();
        geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
        const object = new T.Mesh(geometry, material); object.castShadow = true; object.receiveShadow = true;
        return object;
    }
    return { leaf, materials: [material], dispose() { texture.dispose(); material.dispose(); } };
}
export type Foliage = ReturnType<typeof createFoliage>;
