import { NEED_KINDS, PERSON_IDS, type Journey, type Landscape, type Needs, type PersonId } from './model.js';
import { SURVIVAL, BLUEPRINTS, WADING, CARE, NEED_SIGNALS } from './survival-content.js';
import { GARMENTS } from './clothing.js';
import { shelterAt, terrainAt, weatherAt } from './environment.js';
import { footProtection } from './inventory.js';
import { record } from './experience.js';
import { applyDeath } from './mortality.js';
import { renewResources } from './resources.js';
import { mixWater, plainWater } from './water.js';
import { surfaceWaterDepth } from './surface-water.js';
import { livingConditions } from './living-conditions.js';
import { retainResidue } from './hygiene.js';
import { sanitationAt } from './sanitation.js';
import { buriedBodies } from './burial-state.js';

export function initialNeeds(): Needs {
    return { waterDeficit: 250, energy: 1800, fatigue: 30, bladder: 140, bowel: 50,
        soiling: 0.1, footWound: 0, skinWound: 0.08, infection: 0, illness: 0, footSoiling: 0, skinSoiling: .2 };
}
export function depositWaste(world: Journey, actor: PersonId, kind: 'urine' | 'feces', amount: number): string {
    let serial = Object.keys(world.waste).length + 1;
    while (Object.hasOwn(world.waste, `waste-${serial}`)) { serial++; }
    const id = `waste-${serial}`;
    world.waste[id] = { kind, position: { ...world.people[actor].position }, amount, covered: false, createdAt: world.clock };
    return id;
}
export function walkSpeedFactor(world: Journey, actor: PersonId): number {
    const body = world.people[actor].body;
    if (body.kind === 'dead') { return 0; }
    const depth = surfaceWaterDepth(world, world.people[actor].position, weatherAt(world).tide);
    return Math.max(0.25, 1 - body.needs.footWound * 0.65 - Math.max(0, body.needs.fatigue - 60) / 200
        - Math.max(0, -body.needs.energy) / -SURVIVAL.lethalEnergyBalance * .5)
        * Math.max(WADING.minimumSpeedFactor, 1 - depth * WADING.speedLossPerMetre);
}
export function physiologyTick(world: Journey, land: Landscape, before: Record<PersonId, Needs | null>, walked: Record<PersonId, number>): boolean {
    const weather = weatherAt(world);
    let interrupted = false;
    for (const id of PERSON_IDS) {
        const person = world.people[id], body = person.body;
        if (body.kind === 'dead') { continue; }
        const n = body.needs, sheltered = shelterAt(world, person.position), resting = person.activity?.kind === 'rest' || person.activity?.kind === 'receive_care';
        const surroundings = sanitationAt(world, person.position);
        const working = person.activity && ['travel', 'drag', 'work', 'construct', 'strike', 'guard'].includes(person.activity.kind);
        const wet = Object.values(world.items).filter(i => i.quantity && i.location.kind === 'worn' && i.location.person === id)
            .reduce((max, item) => Math.max(max, item.wetness), 0);
        const exertion = person.activity?.kind === 'drag' ? SURVIVAL.dragExertionFactor : 1;
        n.waterDeficit += (working ? SURVIVAL.waterLossWorkPerHour * exertion : SURVIVAL.waterLossRestPerHour) / 3600;
        n.energy = Math.max(SURVIVAL.lethalEnergyBalance, n.energy - (working ? SURVIVAL.energyWorkPerHour * exertion : SURVIVAL.energyRestPerHour) / 3600);
        n.fatigue = Math.max(0, Math.min(100, n.fatigue + (resting
            ? -SURVIVAL.fatigueRestPerHour * (sheltered ? 1 : 0.5) * (1 - wet * 0.5) * (n.energy <= 0 ? .6 : 1) * surroundings.restFactor : working ? SURVIVAL.fatigueWorkPerHour * exertion : 0) / 3600));
        n.bladder = Math.min(SURVIVAL.bladderLimit, n.bladder + SURVIVAL.bladderPerHour / 3600);
        if (terrainAt(person.position) !== 'sand' && walked[id] > 0) {
            const damage = walked[id] * SURVIVAL.footDamagePerRoughMetre * (1 - footProtection(world, id));
            n.footWound = Math.min(1, n.footWound + damage);
            if (damage > 0) { n.footSoiling = Math.max(n.footSoiling, CARE.roughWoundDirt); }
        }
        livingConditions(world, id, resting, surroundings.exposure, walked[id]);
        n.illness = Math.max(0, Math.min(1, n.illness + (n.infection > 0.6 ? 0.02 : -0.004) / 3600));
        for (const kind of ['urine', 'feces'] as const) {
            const full = kind === 'urine' ? n.bladder >= SURVIVAL.bladderLimit : n.bowel >= SURVIVAL.bowelLimit;
            if (!full) { continue; }
            depositWaste(world, id, kind, kind === 'urine' ? n.bladder : n.bowel);
            if (kind === 'urine') { n.bladder = 0; } else { n.bowel = 0; }
            n.soiling = Math.min(1, n.soiling + 0.3);
            for (const item of Object.values(world.items)) {
                if (item.quantity && item.location.kind === 'worn' && item.location.person === id
                    && ['inner_shorts', 'trousers', 'charcoal_trousers'].includes(item.kind)) {
                    item.soiling = 1; item.wetness = Math.max(item.wetness, .7);
                }
            }
            record(world, { kind: 'accident', actor: id, waste: kind }, person.position, 'self', land, [id]);
            interrupted = true;
        }
        const previous = before[id];
        if (!previous) { continue; }
        for (const need of NEED_KINDS) {
            const { field, levels, falling } = NEED_SIGNALS[need];
            const crossed = levels.some(level => falling ? previous[field] > level && n[field] <= level : previous[field] < level && n[field] >= level);
            if (!crossed) { continue; }
            record(world, { kind: 'need', actor: id, need }, person.position, 'self', land, [id]);
            interrupted = true;
        }
    }
    const waterDepths = new Map<PersonId, number>();
    function depthAtPerson(id: PersonId) {
        let depth = waterDepths.get(id);
        if (depth === undefined) { depth = surfaceWaterDepth(world, world.people[id].position, weather.tide); waterDepths.set(id, depth); }
        return depth;
    }
    for (const item of Object.values(world.items)) {
        if (!item.quantity || item.location.kind !== 'ground' && buriedBodies(world).has(item.location.person)) { continue; }
        const position = item.location.kind === 'ground' ? item.location.position : world.people[item.location.person].position;
        const depth = item.location.kind === 'ground' ? surfaceWaterDepth(world, position, weather.tide) : depthAtPerson(item.location.person);
        const garment = GARMENTS[item.kind];
        const immersed = item.location.kind === 'ground' || item.location.kind === 'covering'
            || item.location.kind === 'dressing' && item.location.wound === 'foot'
            || world.people[item.location.person].body.kind === 'dead'
            ? depth > WADING.groundContactMetres : item.location.kind === 'worn' && garment !== undefined && depth > garment.hemMetres;
        item.wetness = immersed ? 1 : Math.max(0, Math.min(1, item.wetness + (weather.rain && !shelterAt(world, position) ? SURVIVAL.rainWetPerSecond : -SURVIVAL.dryPerSecond)));
        if (item.location.kind === 'worn') {
            item.soiling = Math.min(1, item.soiling + CARE.wornSoilPerHour * (1 + item.wetness) / 3600);
        } else if (item.location.kind === 'ground' && item.soiling < .1) {
            item.soiling = Math.min(.1, item.soiling + CARE.groundSoilPerHour / 3600);
        }
        retainResidue(item);
        if (item.water?.millilitres && item.soiling > CARE.cleanLimit) { item.water.quality = 'untreated'; }
    }
    renewResources(world.resources, weather.tide);
    for (const site of Object.values(world.structures)) {
        if (site.workLeft > 0) { continue; }
        if (site.water && weather.rain) {
            const amount = Math.min(BLUEPRINTS[site.kind].capacity - site.water.millilitres, SURVIVAL.rainCollectionMlPerSecond);
            if (amount > 0) { mixWater(site.water, plainWater(amount)); }
        }
        if (site.burning) {
            site.fuelSeconds = Math.max(0, site.fuelSeconds - 1);
            if (!site.fuelSeconds || weather.rain && !shelterAt(world, site.position)) { site.burning = false; }
        }
    }
    // Death of the player is the final event of a run, including simultaneous deaths.
    for (const id of [...PERSON_IDS.filter(id => id !== 'player'), 'player' as const]) {
        const body = world.people[id].body;
        if (body.kind === 'dead') { continue; }
        if (body.needs.skinWound >= 1) { applyDeath(world, id, 'trauma', land); }
        else if (body.needs.waterDeficit >= SURVIVAL.lethalWaterDeficit) { applyDeath(world, id, 'dehydration', land); }
        else if (body.needs.energy <= SURVIVAL.lethalEnergyBalance) { applyDeath(world, id, 'starvation', land); }
        else if (body.needs.infection >= 1 || body.needs.illness >= 1) { applyDeath(world, id, 'illness', land); }
    }
    return interrupted;
}
