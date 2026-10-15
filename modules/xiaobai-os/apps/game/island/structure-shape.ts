import type { Point, Structure } from './model.js';

// The two-post screen is open on its other three sides. Rendering and perception
// use these same endpoints; it is not an invisible privacy radius.
export const LATRINE_SCREEN = { halfWidth: .95, offset: .8, height: 1.75 } as const;
export function structureScreen(site: Pick<Structure, 'kind' | 'position' | 'workLeft'>): readonly [Point, Point] | null {
    if (site.kind !== 'latrine' || site.workLeft > 0) { return null; }
    const { x, y } = site.position, { halfWidth, offset } = LATRINE_SCREEN;
    return [{ x: x - halfWidth, y: y + offset }, { x: x + halfWidth, y: y + offset }];
}
