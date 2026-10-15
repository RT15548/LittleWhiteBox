import type { Battle, Enemy } from '../types.js';
import { fieldRayLength, type CombatField } from './field.js';
import { beam, fan, hazard, slam } from './events.js';
import { angleTo, atAngle } from './geometry.js';
import { ENEMIES } from '../content.js';
import { COMBAT_POLICY } from '../content/combat-policy.js';

export function worldBossPhase(e: Enemy) {
    if (e.kind === 'warden') { return e.hp <= e.maxHp * .3 ? 3 : e.hp <= e.maxHp * .65 ? 2 : 1; }
    return e.hp <= e.maxHp * .5 ? 2 : 1;
}
function charge(b: Battle, e: Enemy, field: CombatField, follow: boolean) {
    const angle = angleTo(e, e.target), length = fieldRayLength(field, e, angle, Math.min(7.5, Math.hypot(e.target.x - e.x, e.target.y - e.y) + 1), ENEMIES[e.kind].radius);
    e.motionAngle = angle; e.motion = Math.ceil(length / .32); e.stun = 24;
    const warning = beam(b, e, angle, length, ENEMIES[e.kind].radius, 24, 0); warning.life = Math.max(1, e.motion);
    if (follow) {
        // The follow-up is locked to the projected landing, not retargeted beneath a dodging player.
        const p = atAngle(e, angle, length);
        // Collisions may shorten the charge; the follow-up must stay on navigable ground.
        if (length > 1) {
            slam(b, p, 2.8, 24 + e.motion + 20, 23);
        }
    }
    e.exposed = Math.max(e.exposed, 24 + e.motion + 70);
}
/** Chapter bosses use the real field; no arena-coordinate teleports or recurring summons. */
export function worldBossAttack(b: Battle, e: Enemy, field: CombatField) {
    const n = e.pattern % (e.kind === 'keeper' && e.phase === 1 ? 2 : 3);
    const line = (angle: number, length: number, width: number, wait: number, damage: number) =>
        beam(b, e, angle, fieldRayLength(field, e, angle, length, width), width, wait, damage);
    if (e.kind === 'warden' || e.kind === 'keeper') {
        if (n === 0) { charge(b, e, field, e.kind === 'warden' && e.phase > 1); }
        else if (n === 1) {
            const angle = angleTo(e, e.target);
            slam(b, atAngle(e, angle, fieldRayLength(field, e, angle, 2.4, .3)), e.kind === 'keeper' ? 2.5 : 3, 25, e.kind === 'keeper' ? 20 : 24);
            e.exposed = Math.max(e.exposed, 95); e.stun = 25;
        } else if (e.kind === 'keeper' || e.phase === 3) {
            line(angleTo(e, e.target), e.kind === 'keeper' ? 10 : 15, .9, 30, 23);
            e.exposed = Math.max(e.exposed, 100); e.stun = 30;
        } else { fan(b, e, e.angle, 5, 1.3, 14, .2); e.exposed = Math.max(e.exposed, 65); }
    } else {
        if (n === 0) {
            line(angleTo(e, e.target), 16, .8, 30, 20);
            if (e.phase > 1) {
                const pools = b.hazards.filter(h => !h.friendly && h.kind === 'poison');
                if (pools.length < 2) { hazard(b, e.target, 'poison', 2, 40, 150, 9); }
            }
        } else if (n === 1) {
            // Alternating spokes leave two broad, reachable escape lanes without a full arena ring.
            for (const side of [-1, 1]) { line(e.angle + side * .7, 13, 1, 32, 21); }
            e.exposed = Math.max(e.exposed, 110); e.stun = 32;
        } else {
            hazard(b, e, 'ring', 7, 36, 10, 22, false, { inner: 3.8, angle: e.angle + Math.PI / 2, gap: COMBAT_POLICY.rootRingGap });
            e.exposed = Math.max(e.exposed, 110); e.stun = 36;
        }
    }
    e.pattern++;
}
