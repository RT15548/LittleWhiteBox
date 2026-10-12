import { RULES } from '../content.js';
import type { Battle, Point } from '../types.js';
import { moveInWorld } from '../world/geometry.js';
import type { CombatField } from './field.js';
export const TAU = Math.PI * 2;
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const angleTo = (a: Point, b: Point) => Math.atan2(b.y - a.y, b.x - a.x);
export const direction = (move: number) => (move - 1) * Math.PI / 4 - Math.PI / 2;
export const atAngle = (p: Point, angle: number, length: number): Point => ({ x: p.x + Math.cos(angle) * length, y: p.y + Math.sin(angle) * length });
export function moveBody(b: Battle, body: Point, angle: number, speed: number, radius: number, field?: CombatField) {
    if (field) { moveInWorld(field.space, body, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }, radius); return; }
    body.x += Math.cos(angle) * speed; body.y += Math.sin(angle) * speed;
    for (const obstacle of b.obstacles) {
        const d = distance(body, obstacle), min = radius + obstacle.radius;
        if (d < min) { const a = d < .001 ? angle : angleTo(obstacle, body); body.x = obstacle.x + Math.cos(a) * min; body.y = obstacle.y + Math.sin(a) * min; }
    }
    body.x = Math.max(-RULES.arena + radius, Math.min(RULES.arena - radius, body.x));
    body.y = Math.max(-RULES.arena + radius, Math.min(RULES.arena - radius, body.y));
}
export function lineDistance(p: Point, origin: Point, angle: number, length: number) {
    const dx = p.x - origin.x, dy = p.y - origin.y;
    const along = Math.max(0, Math.min(length, dx * Math.cos(angle) + dy * Math.sin(angle)));
    return Math.hypot(dx - Math.cos(angle) * along, dy - Math.sin(angle) * along);
}
