import type { MapAtlas } from '../types.js';
import { isMapSceneLocation, locationRegion } from '../hierarchy.js';
import type { MapFeature } from './types.js';

/** Ownership is independent of the coordinate frame used to express a shape. */
export function featureRegion(atlas: MapAtlas, feature: MapFeature): string | null | undefined {
    const destination = feature.role === 'structure' && feature.destination
        ? atlas.locations.find(place => place.key === feature.destination) : undefined;
    const owner = destination && isMapSceneLocation(destination) ? destination.key : feature.owner;
    if (!owner) { return null; }
    const region = locationRegion(atlas, owner);
    if (region) { return region.key; }
    return atlas.locations.some(l => l.key === owner && isMapSceneLocation(l)) ? undefined : null;
}
