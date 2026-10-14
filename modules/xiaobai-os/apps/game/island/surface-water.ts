import type { Journey, Point } from './model.js';
import { basinWaterLevel, elevationAt, seaLevel } from './terrain.js';
import { basinExtent, basinFraction } from './water-basins.js';
import { RESOURCE_RULES } from './survival-content.js';

// Instantaneous water over the actual footing. No separate flood map or saved tide.
export function surfaceWaterDepth(world: Pick<Journey, 'resources'>, point: Point, tide: number): number {
    let level = seaLevel(tide);
    for (const source of Object.values(world.resources)) {
        if (source.kind !== 'seep' && source.kind !== 'reef_food') { continue; }
        const extent = basinExtent(source.kind);
        if (Math.abs(point.x - source.position.x) > extent || Math.abs(point.y - source.position.y) > extent) { continue; }
        if (basinFraction(point, { ...source, kind: source.kind }) >= 1) { continue; }
        const fill = source.kind === 'seep' ? source.stock / RESOURCE_RULES.seep.capacity : 1;
        if (fill > 0) { level = Math.max(level, basinWaterLevel(source.kind, source.position, fill)); }
    }
    return Math.max(0, level - elevationAt(point));
}
