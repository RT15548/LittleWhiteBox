import type { MapAtlas, MapLink, MapLocation } from '../../../domains/map/types.js';
import { locationTrail } from '../../../domains/map/hierarchy.js';
import type { MapBrowseScope } from './map-browse.js';

export interface WorldMapNode { location: MapLocation; x: number; y: number; placed: boolean }
export interface WorldMapRoute { link: MapLink; from: WorldMapNode; to: WorldMapNode; path: string; x: number; y: number }

/** The closest visible ancestor represents off-scope actors and route endpoints. */
export function locationInScope(atlas: MapAtlas, key: string, locations: readonly MapLocation[]): string {
    const visible = new Set(locations.map(location => location.key));
    return locationTrail(atlas, key).reverse().find(location => visible.has(location.key))?.key || '';
}

export function connectedPlaces(atlas: MapAtlas, key: string) {
    return atlas.links.flatMap(link => {
        if (link.from !== key && link.to !== key) {return [];}
        const location = atlas.locations.find(item => item.key === (link.from === key ? link.to : link.from));
        return location ? [{ location, link, outgoing: link.bidirectional || link.from === key }] : [];
    });
}

/** Authored positions are immutable during layout; missing positions get a clearly schematic arrangement. */
export function layoutWorldMap(atlas: MapAtlas, scope: Pick<MapBrowseScope, 'locations' | 'positionParent'>) {
    const locations = [...scope.locations].sort((a, b) => a.key.localeCompare(b.key, 'en'));
    const positioned = (location: MapLocation) => location.position && (location.parent || '') === scope.positionParent;
    const nodes: WorldMapNode[] = locations.filter(positioned)
        .map(location => ({ location, x: location.position![0], y: location.position![1], placed: true }));
    let candidate = 0;
    for (const location of locations.filter(item => !positioned(item))) {
        let x: number;
        let y: number;
        do {
            const angle = candidate * 2.3999632297;
            const radius = 155 * Math.sqrt(candidate++);
            x = Math.round(500 + Math.cos(angle) * radius);
            y = Math.round(420 + Math.sin(angle) * radius);
        } while (nodes.some(node => Math.hypot(node.x - x, node.y - y) < 160));
        nodes.push({ location, x, y, placed: false });
    }
    nodes.sort((a, b) => a.location.key.localeCompare(b.location.key, 'en'));
    const byKey = new Map(nodes.map(node => [node.location.key, node]));
    const routes: WorldMapRoute[] = atlas.links.flatMap(link => {
        const from = byKey.get(locationInScope(atlas, link.from, locations));
        const to = byKey.get(locationInScope(atlas, link.to, locations));
        if (!from || !to || from === to) {return [];}
        const x = (from.x + to.x) / 2;
        const y = (from.y + to.y) / 2;
        return [{ link, from, to, x, y, path: `M ${from.x} ${from.y} Q ${x + (to.y - from.y) * .12} ${y - (to.x - from.x) * .12} ${to.x} ${to.y}` }];
    });
    const minX = nodes.length ? Math.min(...nodes.map(node => node.x)) - 140 : 0;
    const minY = nodes.length ? Math.min(...nodes.map(node => node.y)) - 150 : 0;
    const width = nodes.length ? Math.max(420, Math.max(...nodes.map(node => node.x)) - minX + 140) : 800;
    const height = nodes.length ? Math.max(500, Math.max(...nodes.map(node => node.y)) - minY + 190) : 900;
    return { nodes, routes, viewBox: [minX, minY, width, height] as [number, number, number, number] };
}
