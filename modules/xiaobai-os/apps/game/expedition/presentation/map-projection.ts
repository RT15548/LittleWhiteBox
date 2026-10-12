import type { Campaign } from '../campaign/types.js';
import { COURTYARD } from '../content/courtyard.js';
import type { DistrictScene } from '../content/world-types.js';
import { districtScene } from '../content/living-spaces.js';
import { visibleInteractions } from '../world/exploration.js';
import type { Point } from '../types.js';

export function discoveredRoutes(campaign: Campaign) {
    const scenes = new Set(campaign.location.visited.map(districtScene)), facts = new Set(campaign.facts);
    const links = new Map<string, { id: string; from: DistrictScene; to: DistrictScene }>();
    for (const visited of campaign.location.visited) {
        const from = districtScene(visited);
        for (const exit of visibleInteractions(COURTYARD[visited], facts)) {
            if (exit.kind !== 'exit') { continue; }
            const to = districtScene(exit.target.to), id = [from, to].sort().join('/');
            if (from === to) { continue; }
            scenes.add(to); links.set(id, { id, from, to });
        }
    }
    return { scenes: [...scenes], links: [...links.values()] };
}
/** Bounded label placement. A dense cluster may overlap; it never escapes the map or loops forever. */
export function mapMarkerScale(bounds: { width: number; depth: number }) { return Math.min(1, Math.min(bounds.width, bounds.depth) / 48); }
export function mapMarkers(points: readonly Point[], bounds: { x: number; z: number; width: number; depth: number }) {
    const scale = mapMarkerScale(bounds), inset = 3 * scale, placed: Point[] = [];
    const clamp = (point: Point) => ({
        x: Math.max(bounds.x - bounds.width / 2 + inset, Math.min(bounds.x + bounds.width / 2 - inset, point.x)),
        y: Math.max(bounds.z - bounds.depth / 2 + inset, Math.min(bounds.z + bounds.depth / 2 - inset, point.y)),
    });
    for (const point of points) {
        let chosen = clamp(point), best = -1;
        for (let step = 0; step <= 48; step++) {
            const radius = Math.ceil(step / 8) * 5.2 * scale, angle = step * Math.PI / 4;
            const candidate = clamp({ x: point.x + Math.cos(angle) * radius, y: point.y + Math.sin(angle) * radius });
            const space = Math.min(Infinity, ...placed.map(p => Math.hypot(p.x - candidate.x, p.y - candidate.y)));
            if (space > best) { chosen = candidate; best = space; }
            if (space >= 5.2 * scale) { break; }
        }
        placed.push(chosen);
    }
    return placed;
}
