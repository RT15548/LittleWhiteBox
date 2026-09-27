import type { MapAtlas } from '../types.js';
import { isMapRegion } from '../hierarchy.js';
import { atlasClipPlan } from './composition.js';
import { geometryContains } from './geometry.js';
import { mapBrowseScope, projectAtlas } from './projection.js';

export interface AtlasBaseCoverage { hasBase: boolean; uncoveredLocationKeys: string[] }
export function atlasBaseCoverage(atlas: MapAtlas, region: string | null): AtlasBaseCoverage {
    const projection = projectAtlas(atlas, mapBrowseScope(atlas, region));
    const bases = projection.features.filter(f => ['surface', 'environment'].includes(f.source.role));
    const pool = [...projection.features, ...projection.carriers];
    // A harbour entrance may be on water; a river alone still is not a main base.
    const covers = projection.features.filter(f => bases.includes(f) || f.source.material === 'water').map(f => {
        const mask = atlasClipPlan(f, pool);
        return { intersections: mask.intersections.map(geometryContains), exclusions: mask.exclusions.map(f => geometryContains(f.geometry)) };
    });
    return {
        hasBase: bases.length > 0,
        uncoveredLocationKeys: projection.nodes.filter(n => !covers.some(mask =>
            mask.intersections.every(contains => contains([n.x, n.y])) && !mask.exclusions.some(contains => contains([n.x, n.y])),
        )).map(n => n.location.key),
    };
}
export function atlasBaseGaps(atlas: MapAtlas) {
    return [null, ...atlas.locations.filter(isMapRegion).map(l => l.key)].flatMap(map => {
        const coverage = atlasBaseCoverage(atlas, map);
        return !coverage.hasBase || coverage.uncoveredLocationKeys.length ? [{ map, ...coverage }] : [];
    });
}
