import type { MapElement } from '../../../../domains/map/types.js';
import { isSceneMarker } from '../scene-geometry.js';

// Only these icon/footprint combinations have a faithful local 3D recipe.
export const SCENE_TEMPLATES = {
    table: ['rect', 'circle'], counter: ['rect'], chair: ['rect'], bed: ['rect'],
    shelf: ['rect'], sofa: ['rect'], bridge: ['rect'], tree: ['rect', 'circle'], rock: ['rect', 'circle'],
    column: ['rect', 'circle'], partition: ['rect'], ladder: ['rect'], well: ['rect', 'circle'], fountain: ['rect', 'circle'],
    fire: ['rect', 'circle'], flag: ['rect'], sign: ['rect'], terminal: ['rect'], machine: ['rect'], 'vending-machine': ['rect'],
} as const;
export type SceneTemplate = keyof typeof SCENE_TEMPLATES;
export function sceneTemplate(element: MapElement): SceneTemplate | undefined {
    if (isSceneMarker(element) || ['wall', 'grid'].includes(element.category) || !element.icon || !Object.hasOwn(SCENE_TEMPLATES, element.icon)) {return undefined;}
    const key = element.icon as SceneTemplate;
    return (SCENE_TEMPLATES[key] as readonly string[]).includes(element.shape) ? key : undefined;
}
