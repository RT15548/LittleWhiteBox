import type { Point } from '../types.js';

export interface Cell { column: number; row: number }
export interface WorldGate { id: string; cells: readonly Cell[] }
/** A dot is ground, # is a solid wall, and a space is outside the traversable world. */
export interface WorldMap {
    origin: Point;
    cellSize: number;
    rows: readonly string[];
    gates: readonly WorldGate[];
}
export interface WorldSpace {
    readonly map: WorldMap;
    readonly columns: number;
    readonly rows: number;
    readonly closedGates: ReadonlySet<string>;
    blocked(column: number, row: number): boolean;
}
export type WorldFault = 'map_invalid' | 'gate_unknown' | 'position_blocked' | 'input_invalid'
    | 'interaction_unavailable' | 'out_of_reach' | 'encounter_unsupported';
export function worldFault(code: WorldFault): never {
    throw Object.assign(new Error(`expedition_world_${code}`), { code: `expedition_world_${code}` });
}
