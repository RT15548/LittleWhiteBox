import type { MapAtlas, MapLocation } from '../../../domains/map/types.js';
import { isMapRegion, isMapSceneLocation, locationRegion, locationTrail, visitedMapLocationKeys } from '../../../domains/map/hierarchy.js';

export type MapBrowseKind = 'world' | 'region';
export type MapBrowseFilter = 'all' | 'unvisited' | 'visited';

export interface MapBrowseScope {
    kind: MapBrowseKind;
    region?: MapLocation;
    locations: MapLocation[];
    unvisited: number;
    /** Only positions in this coordinate frame can be drawn together. */
    positionParent: string | null;
}

/** World containers are not regions; scene existence does not determine a location's scale. */
export function mapBrowseScope(atlas: MapAtlas, regionKey: string | null): MapBrowseScope {
    const region = regionKey === null ? undefined : atlas.locations.find(place => place.key === regionKey && isMapRegion(place));
    const visited = visitedMapLocationKeys(atlas);
    const members = regionKey === null
        ? atlas.locations.filter(isMapRegion)
        : region ? atlas.locations.filter(place => isMapSceneLocation(place) && locationRegion(atlas, place.key)?.key === region.key) : [];
    const locations = members.map(place => visited.has(place.key) ? { ...place, status: 'visited' as const } : place);
    // Nested regions have local coordinates; they cannot change the world's outer frame.
    const outerRegions = regionKey === null ? locations.filter(place => !locationTrail(atlas, place.key).slice(0, -1).some(isMapRegion)) : [];
    const parents = new Set(outerRegions.map(place => place.parent || ''));
    return {
        kind: regionKey === null ? 'world' : 'region',
        region,
        locations,
        unvisited: locations.filter(place => place.status !== 'visited').length,
        positionParent: region ? region.key : parents.size === 1 ? [...parents][0] : null,
    };
}

/** The input is already scoped; searching never widens it to the full atlas. */
export function searchMapScope(scope: MapBrowseScope, query: string, filter: MapBrowseFilter): MapLocation[] {
    const term = query.trim().toLocaleLowerCase();
    return scope.locations.filter(place =>
        [place.name, place.brief].some(value => value?.toLocaleLowerCase().includes(term))
        && (filter === 'all' || (filter === 'visited' ? place.status === 'visited' : place.status !== 'visited')),
    );
}
