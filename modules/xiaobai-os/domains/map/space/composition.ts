import type { AtlasFeatureProjection } from './projection.js';
import { boundsOverlap, geometryClosed } from './geometry.js';

const ROLE_ORDER = { environment: 0, surface: 1, cover: 2, relief: 3, channel: 4, structure: 5, zone: 6, landmark: 7, boundary: 8 };
export function atlasPaintOrder(features: AtlasFeatureProjection[]): AtlasFeatureProjection[] {
    const pending = [...features].sort((a, b) => ROLE_ORDER[a.source.role] - ROLE_ORDER[b.source.role] || a.source.id.localeCompare(b.source.id));
    const done = new Set<string>(), result: AtlasFeatureProjection[] = [];
    const ids = new Set(pending.map(f => f.source.id));
    while (pending.length) {
        const index = pending.findIndex(f => [f.source.support, ...(f.source.crosses || [])].every(id => !id || !ids.has(id) || done.has(id)));
        if (index < 0) { throw new Error('space_support_cycle'); }
        const item = pending.splice(index, 1)[0]; done.add(item.source.id); result.push(item);
    }
    return result;
}
/** Exclude complete footprints, including their decoration, rather than sample centres. */
export function atlasOccluders(feature: AtlasFeatureProjection, all: AtlasFeatureProjection[]): AtlasFeatureProjection[] {
    const source = feature.source;
    return all.filter(other => {
        const b = other.source;
        if (!boundsOverlap(feature.bounds, other.bounds)) { return false; }
        if (source.id === b.id || source.support !== b.support || source.crosses?.includes(b.id)) { return false; }
        if (b.material === 'water' && b.role !== 'environment' && source.material !== 'water' && ['surface', 'cover', 'relief', 'structure'].includes(source.role)) { return true; }
        if (['scattered', 'compact', 'blocks', 'towers'].includes(source.form || '')) {
            return b.role === 'channel' || b.role === 'cover' || (b.role === 'structure' && !!b.destination && geometryClosed(b.geometry));
        }
        return false;
    });
}

/** The same mask expression is used by GPU clipping and map coverage diagnostics. */
export function atlasClipPlan(feature: AtlasFeatureProjection, pool: AtlasFeatureProjection[]) {
    const intersections = [feature.geometry], exclusions = [] as AtlasFeatureProjection[];
    const visited = new Set<string>(), crossed = new Set<string>();
    let current: AtlasFeatureProjection | undefined = feature;
    while (current) {
        if (visited.has(current.source.id)) { throw new Error('space_support_cycle'); }
        visited.add(current.source.id);
        for (const id of current.source.crosses || []) { crossed.add(id); }
        exclusions.push(...atlasOccluders(current, pool));
        current = pool.find(f => f.source.id === current!.source.support);
        if (current) { intersections.push(current.geometry); }
    }
    // An explicit bridge stays above a river even when that river cuts its carrier.
    return { intersections, exclusions: [...new Map(exclusions.filter(f => !crossed.has(f.source.id)).map(f => [f.source.id, f])).values()] };
}
