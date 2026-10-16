import type { Journey, PersonId, Point, Waste } from './model.js';
import { SANITATION } from './survival-content.js';
import { distance } from './space.js';
import { buriedBodies } from './burial-state.js';

export type Odor = 'none' | 'noticeable' | 'strong';
export type RemainsCondition = 'fresh' | 'changing' | 'weathered';
export function wasteRemaining(waste: Waste, clock: number) {
    const duration = waste.kind === 'urine' ? SANITATION.urineSeconds : SANITATION.fecesSeconds;
    return Math.max(0, 1 - (clock - waste.createdAt) / duration);
}
export function remainsAge(world: Journey, subject: PersonId) {
    const body = world.people[subject].body;
    return body.kind === 'dead' ? world.clock - world.experiences[body.death - 1].at : 0;
}
export function remainsCondition(world: Journey, subject: PersonId): RemainsCondition {
    const age = remainsAge(world, subject);
    return age < SANITATION.bodyOdorAfter ? 'fresh' : age < SANITATION.bodyWeatheredAfter ? 'changing' : 'weathered';
}
export function sanitationAt(world: Journey, position: Point) {
    let odor = 0, exposure = 0;
    for (const waste of Object.values(world.waste)) {
        const remaining = wasteRemaining(waste, world.clock);
        if (!remaining || waste.covered) { continue; }
        const nearby = Math.max(0, 1 - distance(position, waste.position) / SANITATION.wasteRadius);
        const load = remaining * Math.min(1, waste.amount / SANITATION.wastePortion);
        odor += nearby * load * (waste.kind === 'feces' ? 1 : .15);
        if (waste.kind === 'feces') { exposure += nearby * load; }
    }
    const buried = buriedBodies(world);
    for (const [id, person] of Object.entries(world.people)) {
        if (person.body.kind !== 'dead' || buried.has(id as PersonId)) { continue; }
        const age = remainsAge(world, id as PersonId);
        const stage = age < SANITATION.bodyOdorAfter || age >= SANITATION.bodyOdorEnds ? 0
            : age < SANITATION.bodyWeatheredAfter ? 1 : SANITATION.weatheredOdor * (SANITATION.bodyOdorEnds - age) / (SANITATION.bodyOdorEnds - SANITATION.bodyWeatheredAfter);
        const covered = Object.values(world.items).some(i => i.quantity > 0 && i.location.kind === 'covering' && i.location.person === id);
        odor += stage * (covered ? SANITATION.coverOdorFactor : 1) * Math.max(0, 1 - distance(position, person.position) / SANITATION.bodyRadius);
    }
    const feeling: Odor = odor >= SANITATION.strongOdor ? 'strong' : odor >= SANITATION.noticeableOdor ? 'noticeable' : 'none';
    // Odor and insects disturb rest. A corpse is not an airborne infection aura.
    return { odor: feeling, flies: odor >= SANITATION.fliesThreshold,
        restFactor: 1 - Math.min(1, odor) * SANITATION.restLoss, exposure: Math.min(1, exposure) };
}
