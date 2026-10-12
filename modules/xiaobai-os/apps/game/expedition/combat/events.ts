import { CONTRACT, ENEMIES, isBoss, RULES } from '../content.js';
import { random } from '../random.js';
import type { Battle, Companion, DamageSource, Effect, EnemyKind, Hazard, Point, Shot } from '../types.js';
import { TAU } from './geometry.js';
import { type CombatField, fieldSummonPosition } from './field.js';

export function effect(b: Battle, p: Point, kind: Effect['kind'], size = 1, angle = 0) {
    b.effects.push({ id: ++b.serial, x: p.x, y: p.y, kind, size, angle, life: kind === 'slash' ? 9 : 15 });
}
export function spawn(b: Battle, kind: EnemyKind, p: Point, field?: CombatField) {
    if (!isBoss(kind) && b.enemies.filter(e => e.hp > 0).length >= RULES.maxEnemies) { return null; }
    if (field) {
        const point = fieldSummonPosition(field, p, ENEMIES[kind].radius);
        if (!point) { return null; }
        p = point;
    }
    const spec = ENEMIES[kind], hp = spec.hp * (isBoss(kind) ? 1 : 1 + b.chapter * .2 + (b.elite ? .25 : 0));
    const enemy = { id: ++b.serial, kind, x: p.x, y: p.y, hp, maxHp: hp, angle: Math.PI / 2,
        cooldown: 35 + Math.floor(random(b) * 20), windup: 0, target: { ...p }, pattern: 0, phase: 1, chill: 0, burn: 0, marked: 0,
        stun: 0, bleed: 0, poison: 0, exposed: 0, motion: 0, motionAngle: 0, stagger: 0, memory: [] as Point[] };
    b.enemies.push(enemy); return enemy;
}
export function shot(b: Battle, from: Point, angle: number, damage: number, friendly: boolean, options: Partial<Omit<Shot, 'id' | 'x' | 'y' | 'angle' | 'damage' | 'friendly' | 'hits'>> = {}) {
    const s: Shot = { id: ++b.serial, x: from.x, y: from.y, angle, damage, friendly, source: 'attack', pierce: 0, hits: [], speed: .22, life: 130, radius: .16, splash: 0, bounce: 0, ...options };
    b.shots.push(s); return s;
}
export function hazard(b: Battle, p: Point, kind: Hazard['kind'], radius: number, wait: number, life: number, damage: number, friendly = false, options: Partial<Pick<Hazard, 'angle' | 'length' | 'width' | 'inner' | 'source'>> = {}) {
    const h: Hazard = { id: ++b.serial, x: p.x, y: p.y, kind, radius, wait, life, damage, friendly, angle: 0, length: 0, width: .65, inner: 0, source: friendly ? 'passive' : 'attack', hits: [], ...options };
    b.hazards.push(h); return h;
}
export function slam(b: Battle, p: Point, radius: number, delay: number, damage: number) { return hazard(b, p, 'slam', radius, delay, 8, damage); }
export function beam(b: Battle, p: Point, angle: number, length: number, width: number, delay: number, damage: number) {
    return hazard(b, p, 'beam', 0, delay, 9, damage, false, { angle, length, width });
}
export function fan(b: Battle, p: Point, angle: number, count: number, arc: number, damage: number, speed = .22) {
    for (let i = 0; i < count; i++) { shot(b, p, angle + (i / Math.max(1, count - 1) - .5) * arc, damage, false, { speed }); }
}
export function ringShots(b: Battle, p: Point, count: number, angle: number, damage: number, speed = .16) {
    for (let i = 0; i < count; i++) { shot(b, p, angle + i * TAU / count, damage, false, { speed }); }
}
export function companion(b: Battle, kind: Companion['kind'], p: Point, life: number, empowered = 0) {
    const ally: Companion = { id: ++b.serial, kind, x: p.x, y: p.y, hp: kind === 'turret' ? 65 : kind === 'familiar' ? CONTRACT.familiarHp : 38, life, cooldown: 12, angle: 0, empowered };
    b.companions.push(ally); return ally;
}
export const sourceIsDirect = (source: DamageSource) => source === 'attack' || source === 'skill';
