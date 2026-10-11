import type { SceneDefinition, SceneGate } from '../content/world-types.js';
import type { Point } from '../types.js';
import { RULES } from '../content.js';
import { canStandInWorld, createWorldSpace } from './geometry.js';
import { type WorldMap, worldFault } from './types.js';

export interface Footprint { x: number; z: number; width: number; depth: number }
export type LandscapeKind = 'clinic' | 'storehouse' | 'tree' | 'planter' | 'wall' | 'tower' | 'water'
    | 'wagon' | 'supplies' | 'bench' | 'ruin' | 'thicket' | 'arch' | 'column' | 'beacon' | 'bunk' | 'root'
    | 'dwelling' | 'workshop' | 'stove' | 'medicine' | 'cargo' | 'fuel' | 'ledger'
    | 'bed' | 'cabinet' | 'wardrobe' | 'toolrack' | 'table' | 'chair' | 'basin' | 'screen' | 'workbench' | 'door';
export interface LandscapeFeature {
    id: string;
    kind: LandscapeKind;
    footprint: Footprint;
    height?: number;
    tint?: 'sage' | 'amber' | 'rose';
    wallUse?: 'homes' | 'room';
    damaged?: boolean;
    entrance?: boolean;
}
export interface LandscapeRoad { points: readonly (readonly [number, number])[]; width: number }
/** Suspended between existing masonry; no posts or ground-level collision. */
export interface SuspendedDetail { kind: 'pipe' | 'washing'; from: readonly [number, number, number]; to: readonly [number, number, number] }
export interface Landscape {
    bounds: Footprint;
    features: readonly LandscapeFeature[];
    roads: readonly LandscapeRoad[];
    gates: readonly (SceneGate & { footprint: Footprint })[];
    vista: 'camp' | 'ramparts' | 'interior' | 'garden' | 'room';
    surface: 'grass' | 'paving' | 'wet' | 'marble' | 'street' | 'boards';
    suspended?: readonly SuspendedDetail[];
}

export function insideFootprint(p: Point, f: Footprint) {
    return p.x >= f.x - f.width / 2 && p.x < f.x + f.width / 2
        && p.y >= f.z - f.depth / 2 && p.y < f.z + f.depth / 2;
}

/** Occupancy and visible solids share unit-aligned footprints; no second collision sketch. */
export function defineLandscapeScene(scene: Omit<SceneDefinition, 'map' | 'gates'> & { landscape: Landscape }): SceneDefinition {
    const { landscape } = scene, { bounds } = landscape;
    const origin = { x: bounds.x - bounds.width / 2, y: bounds.z - bounds.depth / 2 };
    const footprints = [bounds, ...landscape.features.map(f => f.footprint), ...landscape.gates.map(g => g.footprint)];
    if (footprints.some(f => ![f.x, f.z, f.width, f.depth].every(Number.isFinite) || f.width <= 0 || f.depth <= 0
        || ![f.x - f.width / 2, f.z - f.depth / 2, f.width, f.depth].every(Number.isInteger))) { worldFault('map_invalid'); }
    const ids = landscape.features.map(f => f.id);
    if (new Set(ids).size !== ids.length) { worldFault('map_invalid'); }
    if (landscape.features.some(f => ['tree', 'tower', 'wall', 'arch', 'column', 'root'].includes(f.kind)
        && (f.height === undefined || !Number.isFinite(f.height) || f.height <= 0))) { worldFault('map_invalid'); }
    for (const f of footprints.slice(1)) {
        if (f.x - f.width / 2 < origin.x || f.z - f.depth / 2 < origin.y
            || f.x + f.width / 2 > origin.x + bounds.width || f.z + f.depth / 2 > origin.y + bounds.depth) { worldFault('map_invalid'); }
    }
    if (landscape.roads.some(road => !Number.isFinite(road.width) || road.width <= 0 || road.points.length < 2
        || road.points.some(([x, z], i) => !Number.isFinite(x) || !Number.isFinite(z)
            || i > 0 && x === road.points[i - 1][0] && z === road.points[i - 1][1]))) { worldFault('map_invalid'); }
    const rows: string[] = [];
    for (let row = 0; row < bounds.depth; row++) {
        let line = '';
        for (let column = 0; column < bounds.width; column++) {
            const p = { x: origin.x + column + .5, y: origin.y + row + .5 };
            line += landscape.features.some(f => f.kind !== 'arch' && insideFootprint(p, f.footprint)) ? '#' : '.';
        }
        rows.push(line);
    }
    const map: WorldMap = { origin, cellSize: 1, rows, gates: landscape.gates.map(g => {
        const f = g.footprint, cells = [];
        for (let row = f.z - f.depth / 2 - origin.y; row < f.z + f.depth / 2 - origin.y; row++) {
            for (let column = f.x - f.width / 2 - origin.x; column < f.x + f.width / 2 - origin.x; column++) { cells.push({ column, row }); }
        }
        return { id: g.id, cells };
    }) };
    const space = createWorldSpace(map, new Set(map.gates.map(g => g.id)));
    if (Object.values(scene.anchors).some(p => !canStandInWorld(space, p, RULES.playerRadius))) { worldFault('map_invalid'); }
    const objectIds = new Set<string>();
    for (const item of [...scene.exits, ...scene.objects]) {
        if (!scene.anchors[item.anchor] || objectIds.has(item.id)) { worldFault('map_invalid'); }
        objectIds.add(item.id);
    }
    return { ...scene, map, gates: landscape.gates };
}
