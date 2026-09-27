import { BoxGeometry, Color, ConeGeometry, DataTexture, DodecahedronGeometry, DoubleSide, EqualStencilFunc, IcosahedronGeometry, KeepStencilOp, LinearFilter, MeshBasicMaterial, MeshLambertMaterial, MultiplyBlending, NormalBlending, PlaneGeometry, RepeatWrapping, SphereGeometry, SRGBColorSpace } from 'three';
import type { SpaceMaterial } from '../../../../domains/map/space/types.js';
import { RenderResources } from '../render/resources.js';
import { ATLAS_MATERIALS } from './materials.js';

export function createAtlasMaterials() {
    const resources = new RenderResources();
    // One small, neutral grain map for the entire renderer, never a per-terrain image.
    const bytes = new Uint8Array(64 * 64 * 4);
    let seed = 21841;
    for (let i = 0; i < bytes.length; i += 4) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        bytes[i] = bytes[i + 1] = bytes[i + 2] = 250 + seed % 6; bytes[i + 3] = 255;
    }
    const texture = resources.own(new DataTexture(bytes, 64, 64));
    texture.wrapS = texture.wrapT = RepeatWrapping; texture.magFilter = LinearFilter; texture.colorSpace = SRGBColorSpace; texture.needsUpdate = true;
    const feather = new Uint8Array(64 * 64 * 4);
    for (let y = 0; y < 64; y++) { for (let x = 0; x < 64; x++) {
        const i = (y * 64 + x) * 4;
        feather[i] = feather[i + 1] = feather[i + 2] = 255;
        feather[i + 3] = Math.round(Math.max(0, 1 - Math.hypot(x - 31.5, y - 31.5) / 31.5) ** 2 * 255);
    }
    }
    const mist = resources.own(new DataTexture(feather, 64, 64)); mist.magFilter = LinearFilter; mist.needsUpdate = true;
    const materials = new Map<string, MeshBasicMaterial | MeshLambertMaterial>();
    const shapes = {
        tree: resources.own(new IcosahedronGeometry(1, 1)),
        mist: resources.own(new PlaneGeometry(2, 2)),
        roof: resources.own(new ConeGeometry(1, 1, 4).rotateX(Math.PI / 2).rotateZ(Math.PI / 4)),
        cube: resources.own(new BoxGeometry(1, 1, 1)),
        rock: resources.own(new DodecahedronGeometry(1, 0)),
        sphere: resources.own(new SphereGeometry(1, 32, 20)),
    };
    function material(token: SpaceMaterial, purpose: 'base' | 'relief' | 'dunes' | 'detail' | 'celestial' | 'mist' | 'star' = 'base', overlay = false) {
        const lit = ['relief', 'dunes', 'detail', 'celestial'].includes(purpose), detail = purpose === 'detail', nebula = purpose === 'mist';
        const key = `${token}:${purpose}:${overlay}`;
        if (!materials.has(key)) {
            const palette = ATLAS_MATERIALS[token], color = new Color(detail ? palette.ink : palette.base);
            if (detail && token === 'forest') { color.lerp(new Color(palette.light), .45); }
            const common = { color, side: DoubleSide, depthTest: lit, depthWrite: lit, transparent: overlay, premultipliedAlpha: overlay, blending: overlay ? MultiplyBlending : NormalBlending, stencilWrite: true, stencilFunc: EqualStencilFunc, stencilFail: KeepStencilOp, stencilZFail: KeepStencilOp, stencilZPass: KeepStencilOp, stencilWriteMask: 0 };
            materials.set(key, resources.own(nebula ? new MeshBasicMaterial({ ...common, map: mist, transparent: true, opacity: .28, depthTest: false, depthWrite: false }) : lit ? new MeshLambertMaterial({ ...common, flatShading: purpose !== 'celestial' && purpose !== 'dunes' }) : new MeshBasicMaterial({ ...common, map: texture })));
        }
        return materials.get(key)!;
    }
    function stencil(bit: number) {
        for (const material of materials.values()) { setAtlasStencil(material, bit); }
    }
    return { material, shapes, stencil, dispose: () => resources.dispose() };
}
function setAtlasStencil(material: MeshBasicMaterial | MeshLambertMaterial, bit: number) { material.stencilRef = bit; material.stencilFuncMask = bit; }
