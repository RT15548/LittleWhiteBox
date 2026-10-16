import type { Battle } from '../types.js';
import { pressureVents } from '../content/pressure-vents.js';
import { beam } from './events.js';
import { fieldRayLength, type CombatField } from './field.js';

export function pressureVentTick(battle: Battle, field: CombatField) {
    for (const vent of pressureVents(field.segment)) {
        if (battle.tick < vent.offset || (battle.tick - vent.offset) % vent.period) { continue; }
        beam(battle, vent, vent.angle, fieldRayLength(field, vent, vent.angle, vent.length, vent.width), vent.width, vent.wait, vent.damage);
    }
}
