import type { Journey, PersonId } from './model.js';
import { CARE, SURVIVAL } from './survival-content.js';
import { dressing, WOUND_FIELDS } from './care.js';
import { footProtection } from './inventory.js';

// Shared world-time conditions, independent of the player's presence.
export function livingConditions(world: Journey, actor: PersonId, resting: boolean, pollution: number, walked: number) {
    const body = world.people[actor].body;
    if (body.kind !== 'living') { return; }
    const n = body.needs;
    const worn = Object.values(world.items).filter(i => i.quantity > 0 && i.location.kind === 'worn' && i.location.person === actor);
    const dirtyClothes = worn.reduce((dirt, i) => Math.max(dirt, i.soiling * (1 + i.wetness)), 0);
    n.soiling = Math.min(1, n.soiling + CARE.bodySoilPerHour * (1 + dirtyClothes + pollution * 2) / 3600);
    let burden = 0;
    for (const wound of ['foot', 'skin'] as const) {
        const fields = WOUND_FIELDS[wound], bandage = dressing(world, actor, wound)?.[1];
        if (n[fields.severity] <= 0) { n[fields.dirt] = 0; continue; }
        const protectedWound = bandage && bandage.soiling <= CARE.cleanLimit && bandage.wetness <= CARE.dressingMaxWetness;
        const exposure = n.soiling + pollution + (wound === 'foot' && walked > 0 ? 1 - footProtection(world, actor) : 0);
        n[fields.dirt] = Math.min(1, n[fields.dirt] + CARE.woundSoilPerHour * exposure * (protectedWound ? .15 : 1) / 3600);
        if (bandage) { bandage.soiling = Math.min(1, bandage.soiling + CARE.dressingSoilPerHour * (1 + n[fields.dirt] + bandage.wetness) / 3600); }
        burden += n[fields.severity] * (n[fields.dirt] + (bandage ? bandage.soiling + bandage.wetness : 0));
        if (resting && n.energy > 0 && n.waterDeficit < SURVIVAL.thirstSignal && n.infection < .6 && n[fields.dirt] <= CARE.cleanLimit) {
            n[fields.severity] = Math.max(0, n[fields.severity] - CARE.healingPerHour * (protectedWound ? 1 : .5) / 3600);
        }
    }
    const recovery = resting && n.soiling <= CARE.cleanLimit && n.footSoiling <= CARE.cleanLimit && n.skinSoiling <= CARE.cleanLimit
        && n.energy > 0 && n.waterDeficit < SURVIVAL.thirstSignal ? CARE.infectionRecoveryPerHour : 0;
    n.infection = Math.max(0, Math.min(1, n.infection + (burden * SURVIVAL.infectionPerHour - recovery) / 3600));
}
