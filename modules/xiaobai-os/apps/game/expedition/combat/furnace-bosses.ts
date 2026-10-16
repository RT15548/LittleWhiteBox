import type { Battle, Enemy } from '../types.js';
import { FURNACE_COMBAT as C } from '../content/furnace/combat.js';
import { beam, effect, hazard, slam, spawn } from './events.js';
import { angleTo, atAngle } from './geometry.js';
import { fieldRayLength, type CombatField } from './field.js';

/** Same hit shapes as their warnings; the furnace never closes every escape lane. */
export function furnaceBossAttack(b: Battle, e: Enemy, field: CombatField) {
    const angle = angleTo(e, e.target), n = e.pattern++ % 3;
    const line = (a: number, length: number, width: number, wait: number, damage: number) =>
        beam(b, e, a, fieldRayLength(field, e, a, length, width), width, wait, damage);
    if (e.kind === 'kilnheart') {
        if (n === 0) { line(angle, 19, 1.1, 32, 23); }
        else if (n === 1) {
            hazard(b, e, 'ring', 8, 39, 10, 25, false, { inner: 3.8, angle: angle + Math.PI / 2, gap: 1.5 });
        } else {
            for (const side of [-1, 1]) { line(angle + side * .72, 17, 1.2, 35, 23); }
        }
        e.stun = 40; e.exposed = Math.max(e.exposed, 125); return;
    }
    if (e.phase >= 2 && e.memory.length === 0) {
        for (const point of field.summonPoints) {
            const coupler = spawn(b, 'coupler', point, field);
            if (coupler) { coupler.hp = coupler.maxHp = field.furnacePrepared ? C.preparedCouplerHp : C.couplerHp; }
        }
        e.memory = field.summonPoints.map(point => ({ ...point }));
        effect(b, e, 'burst', 4);
    }
    const connected = b.enemies.some(other => other.kind === 'coupler' && other.hp > 0);
    if (n === 0) {
        const length = fieldRayLength(field, e, angle, Math.min(8, Math.hypot(e.target.x - e.x, e.target.y - e.y) + 1), 1.45);
        e.motionAngle = angle; e.motion = Math.floor(length / .32); e.stun = 30;
        const warning = beam(b, e, angle, length, 1.45, 30, 0); warning.life = Math.max(1, e.motion);
        e.exposed = Math.max(e.exposed, 30 + e.motion + (e.phase === 3 ? 105 : 75));
    } else if (n === 1) {
        const point = atAngle(e, angle, fieldRayLength(field, e, angle, 3, .4));
        slam(b, point, 3.8, 32, 29);
        if (connected) { line(angle + (e.pattern % 2 ? 1 : -1) * .9, 22, 1.2, 53, 24); }
        e.stun = 54; e.exposed = Math.max(e.exposed, e.phase === 3 ? 185 : 145);
    } else {
        for (const side of [-1, 1]) { line(angle + side * .65, 26, 1.3, 40, 27); }
        if (e.phase === 3 && connected) { slam(b, e.target, 2.8, 65, 25); }
        e.stun = 66; e.exposed = Math.max(e.exposed, e.phase === 3 ? 200 : 155);
    }
}
export function furnaceDeath(b: Battle, e: Enemy) {
    if (e.kind === 'coupler') {
        const master = b.enemies.find(enemy => enemy.kind === 'furnacemaster' && enemy.hp > 0);
        if (master) {
            master.stun = Math.max(master.stun, C.couplerStun); master.exposed = Math.max(master.exposed, C.couplerExposed);
            master.motion = 0; master.windup = 0; effect(b, master, 'guard', 3);
        }
    } else if (e.kind === 'furnacemaster') {
        // Optional targets cannot prolong a won final battle or award repeat kills.
        for (const other of b.enemies) { if (other.kind === 'coupler') { other.hp = 0; } }
    }
}
