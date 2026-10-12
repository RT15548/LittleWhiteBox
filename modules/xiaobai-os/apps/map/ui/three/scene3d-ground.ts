import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RepeatWrapping, RGBAFormat, SRGBColorSpace } from 'three';
import { createGroundSurface, GROUND_SURFACES, type GroundSurface } from '../scene-ground-surfaces.js';
import type { Scene3DResources } from './scene3d-resources.js';

/** The scene owns the three GPU channels. Albedo alone is sRGB; scalar data stays linear. */
export function createGroundTextures(material: GroundSurface, resources: Scene3DResources) {
    const pixels = createGroundSurface(material), profile = GROUND_SURFACES[material];
    function texture(source: Uint8Array, color: boolean) {
        const rgba = color ? source : new Uint8Array(pixels.size * pixels.size * 4);
        if (!color) {
            for (let i = 0; i < source.length; i++) { rgba.set([source[i], source[i], source[i], 255], i * 4); }
        }
        const result = resources.own(new DataTexture(rgba, pixels.size, pixels.size, RGBAFormat));
        if (color) { result.colorSpace = SRGBColorSpace; }
        result.wrapS = result.wrapT = RepeatWrapping;
        result.repeat.setScalar(1 / profile.size);
        result.magFilter = LinearFilter; result.minFilter = LinearMipmapLinearFilter;
        result.generateMipmaps = true; result.anisotropy = 4; result.needsUpdate = true;
        return result;
    }
    return { map: texture(pixels.color, true), bumpMap: texture(pixels.height, false), roughnessMap: texture(pixels.roughness, false), bumpScale: profile.relief };
}
