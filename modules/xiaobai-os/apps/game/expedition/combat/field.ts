import type { EnemyKind, Point } from '../types.js';
import { isBoss } from '../content.js';
import type { WorldSpace } from '../world/types.js';
import { canStandInWorld, cellCenter, worldCell, worldLineClear } from '../world/geometry.js';
import { findWorldPath } from '../world/navigation.js';

export interface FieldSpawn { kind: EnemyKind; position: Point }
export const supportsFieldEnemy = (kind: EnemyKind) => !isBoss(kind) || kind === 'warden' || kind === 'thornheart';
/** Authored content and derived geometry are runtime context, not duplicated in a battle save. */
export interface CombatField {
    space: WorldSpace;
    entry: Point;
    objective: Point;
    waves: readonly (readonly FieldSpawn[])[];
    summonPoints: readonly Point[];
}
export const fieldVisible = (field: CombatField | undefined, from: Point, to: Point, radius = 0) => !field || worldLineClear(field.space, from, to, radius);

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
