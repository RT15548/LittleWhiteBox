import { TIDE } from './content.js';
import { shoreDistance } from './coastline.js';
import type { Point } from './model.js';
import { BASIN_SHAPES, WATER_BASINS, basinExtent, basinFraction, type BasinKind } from './water-basins.js';

export function seaLevel(tide: number): number { return TIDE.lowWater + (TIDE.highWater - TIDE.lowWater) * tide; }

// Authored game topography, in metres; not a claim about a real island's geology.
function naturalElevationAt(position: Point): number {
    const coast = Math.min(1, shoreDistance(position) / 55);
    const interior = Math.exp(-((position.x + 40) ** 2 / 380000 + position.y ** 2 / 120000));
    const ridges = Math.sin(position.x / 43) * Math.cos(position.y / 51) * .3;
    return coast * (1.2 + interior * 11.5 + ridges);
}

const basinFloors = WATER_BASINS.map(b => naturalElevationAt(b.position) - BASIN_SHAPES[b.kind].depth);
export function basinWaterLevel(kind: BasinKind, center: Point, fill = 1): number {
    const shape = BASIN_SHAPES[kind];
    return naturalElevationAt(center) - shape.depth + shape.waterDepth * fill;
}
export function elevationAt(position: Point): number {
    const ground = naturalElevationAt(position);
    for (let i = 0; i < WATER_BASINS.length; i++) {
        const basin = WATER_BASINS[i], extent = basinExtent(basin.kind);
        if (Math.abs(position.x - basin.position.x) > extent || Math.abs(position.y - basin.position.y) > extent) { continue; }
        const fraction = basinFraction(position, basin);
        if (fraction >= 1) { continue; }
        const blend = fraction * fraction * (3 - 2 * fraction);
        return basinFloors[i] + (ground - basinFloors[i]) * blend;
    }
    return ground;
}
