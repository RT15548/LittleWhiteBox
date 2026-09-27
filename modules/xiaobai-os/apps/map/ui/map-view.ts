import type { MapDomainV1 } from '../../../domains/map/types.js';

export function resolveInitialMapView(map: MapDomainV1 | null): 'scene' | 'world' {
    const player = map?.atlas.actors.find(actor => actor.actorKey === 'player');
    const place = map?.atlas.locations.find(location => location.key === player?.locationKey);
    return place?.sceneKey && map?.scenes[place.sceneKey]?.status === 'active' ? 'scene' : 'world';
}
