import { geometryBounds, geometryContains } from '../../../../domains/map/space/geometry.js';
import { MAX_SPACE_DETAILS, type MapFeature, type SpaceBounds } from '../../../../domains/map/space/types.js';

export interface AtlasDetail { id: string; x: number; y: number; size: number; variant: number }
export function atlasSeed(value: string): number {
    let result = 2166136261;
    for (let i = 0; i < value.length; i++) { result = Math.imul(result ^ value.charCodeAt(i), 16777619); }
    return result >>> 0;
}
/** A scale selects a nested subset of a source-space lattice. No viewport or region enters its seed. */
export function atlasDetails(feature: MapFeature, viewport: SpaceBounds, unitsPerPixel: number, budget = MAX_SPACE_DETAILS, spacing = 48): AtlasDetail[] {
    const base = spacing;
    let stride = 2 ** Math.max(0, Math.ceil(Math.log2(unitsPerPixel * 6 / base)));
    const bounds = geometryBounds(feature.geometry);
    const contains = geometryContains(feature.geometry);
    const range = (step: number) => [
        Math.floor(Math.max(bounds[0], viewport[0] - base * 2) / step),
        Math.floor(Math.max(bounds[1], viewport[1] - base * 2) / step),
        Math.ceil(Math.min(bounds[0] + bounds[2], viewport[0] + viewport[2] + base * 2) / step),
        Math.ceil(Math.min(bounds[1] + bounds[3], viewport[1] + viewport[3] + base * 2) / step),
    ];
    let cells = range(base * stride);
    // Bound examined cells, not only emitted symbols, including very thin/empty bands.
    // A lattice straddling both source axes has four cells even at its coarsest
    // level. Keep that finite examination floor; the emitted count still obeys budget.
    while (Math.max(0, cells[2] - cells[0]) * Math.max(0, cells[3] - cells[1]) > Math.max(4, budget)) { stride *= 2; cells = range(base * stride); }
    const [minX, minY, maxX, maxY] = cells;
    const result: AtlasDetail[] = [];
    for (let row = minY; row < maxY && result.length < budget; row++) {
        for (let col = minX; col < maxX && result.length < budget; col++) {
            const ix = col * stride, iy = row * stride, id = `${feature.id}:${ix}:${iy}`;
            const seed = atlasSeed(id), x = ix * base + ((seed & 255) / 255 - .5) * base * .55, y = iy * base + (((seed >>> 8) & 255) / 255 - .5) * base * .55;
            if (feature.form === 'scattered' && seed % 3 !== 0) { continue; }
            if (!contains([x, y])) { continue; }
            result.push({ id, x, y, size: base * (.45 + ((seed >>> 16) & 255) / 255 * .2), variant: seed % 3 });
        }
    }
    return result;
}
