import type { Point, Resource } from './model.js';
import { INITIAL_RESOURCES } from './survival-content.js';

export type BasinKind = 'seep' | 'reef_food';
export const BASIN_SHAPES = {
    seep: { radius: .8, depth: .18, waterDepth: .065 },
    reef_food: { radius: 3.3, depth: .55, waterDepth: .32 },
} as const;
const outline = { base: .9, lobes: .08, detail: .06 };
export const WATER_BASINS = Object.values(INITIAL_RESOURCES).filter((r): r is Resource & { kind: BasinKind } => r.kind === 'seep' || r.kind === 'reef_food');

// Shared authored landform: the ground, water outline and footing use this shape.
export function basinRadius(kind: BasinKind, center: Point, angle: number): number {
    const phase = center.x * .13 + center.y * .07;
    return BASIN_SHAPES[kind].radius * (outline.base + Math.sin(angle * 3 + phase) * outline.lobes + Math.cos(angle * 5 - phase) * outline.detail);
}
export function basinExtent(kind: BasinKind): number {
    return BASIN_SHAPES[kind].radius * (outline.base + outline.lobes + outline.detail);
}
export function basinFraction(position: Point, basin: Pick<Resource, 'position'> & { kind: BasinKind }): number {
    const x = position.x - basin.position.x, y = position.y - basin.position.y;
    return Math.hypot(x, y) / basinRadius(basin.kind, basin.position, Math.atan2(y, x));
}
