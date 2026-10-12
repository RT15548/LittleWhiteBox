import type { EnemyKind, Point } from '../types.js';
import { isBoss } from '../content.js';
import type { WorldSpace } from '../world/types.js';
import { canStandInWorld, cellCenter, worldCell, worldLineClear } from '../world/geometry.js';
import { findWorldPath } from '../world/navigation.js';
import type { EncounterSegment } from '../content/courtyard-encounters.js';

export interface FieldSpawn { kind: EnemyKind; position: Point }
export const supportsFieldEnemy = (kind: EnemyKind) => !isBoss(kind) || kind === 'warden' || kind === 'thornheart' || kind === 'keeper';
export interface FieldBounds { left: number; right: number; top: number; bottom: number }
const boundedSpaces = new WeakMap<WorldSpace, WeakMap<FieldBounds, WorldSpace>>();
export function boundedFieldSpace(space: WorldSpace, bounds: FieldBounds): WorldSpace {
    let cache = boundedSpaces.get(space);
    if (!cache) { cache = new WeakMap(); boundedSpaces.set(space, cache); }
    let result = cache.get(bounds);
    if (!result) {
        result = { ...space, blocked(column, row) {
            const p = cellCenter(space.map, column, row);
            return p.x < bounds.left || p.x > bounds.right || p.y < bounds.top || p.y > bounds.bottom || space.blocked(column, row);
        } }; cache.set(bounds, result);
    }
    return result;
}
/** Authored content and derived geometry are runtime context, not duplicated in a battle save. */
export interface CombatField {
    space: WorldSpace;
    entry: Point;
    objective: Point;
    waves: readonly (readonly FieldSpawn[])[];
    summonPoints: readonly Point[];
    bounds?: FieldBounds;
    segment?: EncounterSegment;
    reinforcement?: boolean;
    enemyLimit?: number;
    signalPoint?: Point;
}
export const fieldVisible = (field: CombatField | undefined, from: Point, to: Point, radius = 0) => !field || worldLineClear(field.space, from, to, radius);

/** Shared by the stored warning and its damage shape; walls stop both at the same endpoint. */
export function fieldRayLength(field: CombatField, from: Point, angle: number, length: number, radius: number) {
    let clear = 0;
    for (let step = .2; step <= length + .2; step += .2) {
        const d = Math.min(step, length), p = { x: from.x + Math.cos(angle) * d, y: from.y + Math.sin(angle) * d };
        if (!worldLineClear(field.space, from, p, radius)) { break; }
        clear = d;
    }
    return clear;
}

/** New summons use only authored entrances connected to the encounter, never arbitrary wall coordinates. */
export function fieldSummonPosition(field: CombatField, requested: Point, radius: number): Point | null {
    return field.summonPoints.filter(point => canStandInWorld(field.space, point, radius)
        && findWorldPath(field.space, field.entry, point, radius))
        .sort((a, b) => Math.hypot(a.x - requested.x, a.y - requested.y) - Math.hypot(b.x - requested.x, b.y - requested.y))[0] ?? null;
}

/** Placement of a new familiar/turret is local to the caster and cannot cross a wall. */
export function fieldCompanionPosition(field: CombatField | undefined, caster: Point, requested: Point): Point {
    if (!field || worldLineClear(field.space, caster, requested, .3)) { return requested; }
    // The caster's valid body is wider than a companion. A blocked deployment stays at their feet.
    return { x: caster.x, y: caster.y };
}

export function fieldPursuitAngle(field: CombatField | undefined, body: Point, target: Point, radius: number): number | null {
    if (!field) { return Math.atan2(target.y - body.y, target.x - body.x); }
    let goal = target;
    if (!canStandInWorld(field.space, goal, radius)) {
        // A small player can hug a wall closer than a large pursuer. Approach a reachable centre beside them.
        const candidates: Point[] = [];
        const reach = radius + field.space.map.cellSize;
        const first = worldCell(field.space.map, { x: target.x - reach, y: target.y - reach });
        const last = worldCell(field.space.map, { x: target.x + reach, y: target.y + reach });
        for (let row = Math.max(0, first.row); row <= Math.min(field.space.rows - 1, last.row); row++) {for (let column = Math.max(0, first.column); column <= Math.min(field.space.columns - 1, last.column); column++) {
            const point = cellCenter(field.space.map, column, row);
            if (Math.hypot(point.x - target.x, point.y - target.y) <= radius + field.space.map.cellSize
                && canStandInWorld(field.space, point, radius) && worldLineClear(field.space, point, target)) { candidates.push(point); }
        }}
        candidates.sort((a, b) => Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y));
        const reachable = candidates.find(point => findWorldPath(field.space, body, point, radius));
        if (!reachable) { return null; }
        goal = reachable;
    }
    const path = findWorldPath(field.space, body, goal, radius);
    return path?.length ? Math.atan2(path[0].y - body.y, path[0].x - body.x) : null;
}
