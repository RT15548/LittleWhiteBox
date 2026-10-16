import * as T from 'three';
import type { GarmentSpec } from '../clothing.js';
import type { FabricAppearance } from './survivor-visual.js';

export function garmentColor(spec: GarmentSpec) {
    return typeof spec.color === 'string' ? new T.Color(spec.color) : new T.Color(...spec.color);
}
const soil = new T.Color('#786447');
export function fabricAppearance(material: T.MeshStandardMaterial, dry: T.Color, roughness: number, appearance: FabricAppearance) {
    const dirt = appearance.cleanliness === 'dirty' ? .42 : appearance.cleanliness === 'used' ? .14 : 0;
    material.color.copy(dry).lerp(soil, dirt).multiplyScalar(1 - appearance.wetness * .28);
    material.roughness = Math.max(.05, roughness - appearance.wetness * .24);
}
export function wetFabric(material: T.MeshStandardMaterial, spec: GarmentSpec, appearance: FabricAppearance) {
    fabricAppearance(material, garmentColor(spec), spec.dryRoughness, appearance);
}
