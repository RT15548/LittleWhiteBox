import type { Battle, Enemy } from '../types.js';
import { CITY_COMBAT as C } from '../content/inner-city/combat.js';
import { beam, slam } from './events.js';
import { angleTo, atAngle } from './geometry.js';
import { fieldRayLength, type CombatField } from './field.js';

/** Locked aim, bounded lines and a recovery after every pattern; pillars stop both warning and damage. */
export function cityBossAttack(b: Battle, e: Enemy, field: CombatField) {
    const pattern = e.pattern % (e.kind === 'bridgekeeper' ? 3 : 4);
    const line = (angle: number, length: number, width: number, wait: number = C.ventWait, damage: number = C.ventDamage) =>
        beam(b, e, angle, fieldRayLength(field, e, angle, length, width), width, wait, damage);
    if (pattern === 0) {
        // A thin tether leaves a broad side-step lane. It cannot track during its visible warning.
        const tether = line(angleTo(e, e.target), 18, .55, 36, 15);
        tether.pull = C.pullDistance;
        e.stun = 36; e.exposed = Math.max(e.exposed, 108);
    } else if (pattern === 1) {
        const angle = angleTo(e, e.target), length = fieldRayLength(field, e, angle, 2.8, .35);
        slam(b, atAngle(e, angle, length), 2.7, 28, 26);
        e.stun = 28; e.exposed = Math.max(e.exposed, 112);
    } else if (pattern === 2) {
        // The center is a safe lane; later phases close one side, never all directions at once.
        const angle = angleTo(e, e.target);
        for (const side of [-1, 1]) { line(angle + side * .62, 20, 1.15); }
        e.stun = C.ventWait; e.exposed = Math.max(e.exposed, 125);
    } else {
        const angle = angleTo(e, e.target), side = e.pattern % 8 < 4 ? -1 : 1;
        line(angle, 18, 1.1, 38);
        if (e.phase > 1) { line(angle + side * .9, 18, 1.1, 58); }
        e.stun = 38; e.exposed = Math.max(e.exposed, 135);
    }
    e.pattern++;
}
