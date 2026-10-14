import * as T from 'three';
import type { GarmentSpec } from '../clothing.js';

export function garmentColor(spec: GarmentSpec) {
    return typeof spec.color === 'string' ? new T.Color(spec.color) : new T.Color(...spec.color);
}
export function wetFabric(material: T.MeshStandardMaterial, spec: GarmentSpec, wetness: number) {
    material.color.copy(garmentColor(spec)).multiplyScalar(1 - wetness * .28);
    material.roughness = spec.dryRoughness - wetness * .24;
}
