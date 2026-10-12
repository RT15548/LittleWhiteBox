import type { MapElement, MapMaterial } from '../../../domains/map/types.js';
import { closesPath } from './scene-geometry.js';

// Appearance defaults belong to the renderer and are never written into map facts.
export const GROWTH_SURFACES = { vine: 'forest', root: 'wood', tentacle: 'flesh', pipe: 'metal' } as const satisfies Record<string, MapMaterial>;
export const SCULPTED_SURFACES = { mushroom: 'flesh', crystal: 'glass', slime: 'slime', dragon: 'forest', dwarf: 'metal', elf: 'forest' } as const satisfies Record<string, MapMaterial>;
const FORM_SURFACES: Partial<Record<NonNullable<MapElement['icon']>, MapMaterial>> = { ...GROWTH_SURFACES, ...SCULPTED_SURFACES };

export function isGrowth(element: MapElement): boolean {
    return !!element.icon && Object.hasOwn(GROWTH_SURFACES, element.icon) && ['path', 'curve'].includes(element.shape)
        && !closesPath(element) && !['wall', 'grid', 'actor', 'door'].includes(element.category);
}

export function hasSculptedForm(element: MapElement): boolean {
    return !!element.icon && Object.hasOwn(SCULPTED_SURFACES, element.icon) && ['rect', 'circle'].includes(element.shape)
        && !['wall', 'grid', 'door'].includes(element.category);
}

export function formSurface(element: MapElement): MapMaterial | undefined {
    return element.material || (element.icon ? FORM_SURFACES[element.icon] : undefined);
}
