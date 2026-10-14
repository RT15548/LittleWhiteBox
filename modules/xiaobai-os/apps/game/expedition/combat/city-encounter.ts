import type { Battle } from '../types.js';
import { CITY_COMBAT, CITY_VENTS } from '../content/inner-city/combat.js';
import { beam } from './events.js';
import { fieldRayLength, type CombatField } from './field.js';

export function cityEncounterTick(battle: Battle, field: CombatField) {
    if (field.segment !== 'pipe_gallery') { return; }
    for (const vent of CITY_VENTS[field.segment]) {
        if (battle.tick < vent.offset || (battle.tick - vent.offset) % vent.period) { continue; }
        beam(battle, vent, vent.angle, fieldRayLength(field, vent, vent.angle, vent.length, vent.width), vent.width, CITY_COMBAT.ventWait, CITY_COMBAT.ventDamage);
    }
}
