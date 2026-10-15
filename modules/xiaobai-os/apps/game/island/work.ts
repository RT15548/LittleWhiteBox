import { PERSON_IDS, type Journey, type Landscape, type MaterialUse, type Needs, type PersonId, type Water, type WorkTask } from './model.js';
import { BLUEPRINTS, DRINKING, HYGIENE, ITEMS, RECIPES, RESOURCE_RULES, SURVIVAL, materialAmounts } from './survival-content.js';
import { accessibleItem, accessibleItems, consumeMaterials, createItem, readMaterials, carriedWeight, carryLimit } from './inventory.js';
import { craftBlocker } from './crafting.js';
import { buildingGround, fireAt, shelterAt, sitesConflict, weatherAt } from './environment.js';
import { canStand, withinReach } from './space.js';
import { fail, isActionFault } from './fault.js';
import { record } from './experience.js';
import { depositWaste } from './physiology.js';
import { checkBodyCover } from './remains.js';
import { resourceAccessible } from './resources.js';
import { foodIllness } from './food.js';
import { drawWater, mixWater, plainWater, waterIllness } from './water.js';

function near(world: Journey, actor: PersonId, position: { x: number; y: number }) {
    if (!withinReach(world.people[actor].position, position)) { fail('unavailable'); }
}
function materialCheck(world: Journey, actor: PersonId, inputs: MaterialUse[], needs: Record<string, number>, kinds: Record<string, number> = {}) {
    const amounts = materialAmounts(readMaterials(world, actor, inputs));
    if (Object.entries(needs).some(([key, count]) => (amounts.capabilities[key as keyof typeof amounts.capabilities] ?? 0) < count)
        || Object.entries(kinds).some(([key, count]) => (amounts.kinds[key as keyof typeof amounts.kinds] ?? 0) < count)) { fail('materials'); }
}
function fuelDuration(world: Journey, actor: PersonId, inputs: MaterialUse[]) {
    return materialAmounts(readMaterials(world, actor, inputs)).capabilities.fuel! * SURVIVAL.fireSecondsPerFuel;
}
function sourceWater(world: Journey, actor: PersonId, id: string) {
    const resource = Object.hasOwn(world.resources, id) ? world.resources[id] : null;
    if (resource?.kind === 'seep') {
        near(world, actor, resource.position);
        return { available: resource.stock, take: (ml: number) => { resource.stock -= ml; return plainWater(ml); } };
    }
    const site = Object.hasOwn(world.structures, id) ? world.structures[id] : null;
    if (!site?.water || site.workLeft > 0) { fail('unavailable'); }
    near(world, actor, site.position);
    return { available: site.water.millilitres, take: (ml: number) => drawWater(site.water!, ml) };
}
function siteFor(world: Journey, actor: PersonId, id: string) {
    const site = Object.hasOwn(world.structures, id) ? world.structures[id] : null;
    if (!site || site.kind !== 'firepit' || site.workLeft !== 0) { fail('unavailable'); }
    near(world, actor, site.position); return site;
}
function washingWater(world: Journey, actor: PersonId, supply: Extract<WorkTask, { kind: 'wash' }>['supply']) {
    if (supply.kind === 'source') { return sourceWater(world, actor, supply.id); }
    const container = accessibleItem(world, actor, supply.id);
    if (!container.water) { fail('conditions'); }
    return { available: container.water.millilitres, take: (ml: number) => drawWater(container.water!, ml) };
}
function drinkWater(needs: Needs, water: Water, clock: number) {
    const { millilitres } = water;
    needs.waterDeficit = Math.max(0, needs.waterDeficit - millilitres); needs.bladder += millilitres * 0.25;
    needs.illness = Math.min(1, needs.illness + waterIllness(water, clock) + needs.soiling * DRINKING.soilingIllness * millilitres / DRINKING.portionMl);
}
export function workDuration(world: Journey, actor: PersonId, task: WorkTask, land: Landscape): number {
    const p = world.people[actor];
    if (p.body.kind !== 'living') { fail('dead'); }
    switch (task.kind) {
        case 'gather': {
            const source = Object.hasOwn(world.resources, task.source) ? world.resources[task.source] : null;
            if (!source || !RESOURCE_RULES[source.kind].output || source.stock < 1) { fail('unavailable'); }
            near(world, actor, source.position);
            if (!resourceAccessible(source.kind, weatherAt(world).tide)) { fail('conditions'); }
            return RESOURCE_RULES[source.kind].seconds;
        }
        case 'fill': {
            const container = accessibleItem(world, actor, task.container);
            if (!container.water) { fail('conditions'); }
            if (ITEMS[container.kind].capacity - container.water.millilitres < task.millilitres
                || container.location.kind !== 'ground' && carriedWeight(world, actor) + task.millilitres / 1000 > carryLimit(world, actor)) { fail('capacity'); }
            if (sourceWater(world, actor, task.source).available < task.millilitres) { fail('unavailable'); }
            return Math.ceil(task.millilitres / SURVIVAL.fillMlPerSecond);
        }
        case 'sip': {
            if (sourceWater(world, actor, task.source).available < task.millilitres) { fail('unavailable'); }
            return Math.ceil(task.millilitres / SURVIVAL.sipMlPerSecond);
        }
        case 'pour': {
            const source = accessibleItem(world, actor, task.from), container = accessibleItem(world, actor, task.container);
            if (task.from === task.container || !source.water || !container.water) { fail('conditions'); }
            if (source.water.millilitres < task.millilitres) { fail('unavailable'); }
            const carriedChange = ((container.location.kind !== 'ground' ? 1 : 0) - (source.location.kind !== 'ground' ? 1 : 0)) * task.millilitres / 1000;
            if (container.water.millilitres + task.millilitres > ITEMS[container.kind].capacity
                || carriedWeight(world, actor) + carriedChange > carryLimit(world, actor)) { fail('capacity'); }
            return Math.ceil(task.millilitres / SURVIVAL.fillMlPerSecond);
        }
        case 'wash': {
            if (task.millilitres < HYGIENE.minimumWashMl) { fail('conditions'); }
            if (washingWater(world, actor, task.supply).available < task.millilitres) { fail('unavailable'); }
            return SURVIVAL.washSeconds;
        }
        case 'drink': case 'empty': {
            const container = accessibleItem(world, actor, task.container);
            if (!container.water || container.water.millilitres < task.millilitres) { fail('unavailable'); }
            return Math.ceil(task.millilitres
                / (task.kind === 'empty' ? SURVIVAL.fillMlPerSecond : SURVIVAL.drinkMlPerSecond));
        }
        case 'eat': {
            if (!ITEMS[accessibleItem(world, actor, task.item).kind].energy) { fail('conditions'); }
            return 120;
        }
        case 'craft': {
            const recipe = RECIPES[task.recipe];
            materialCheck(world, actor, task.materials, recipe.needs, recipe.kinds);
            const blocker = craftBlocker(task.recipe, accessibleItems(world, actor), task.materials.map(m => world.items[m.item]), fireAt(world, p.position));
            if (blocker) { fail(blocker); }
            return recipe.seconds;
        }
        case 'build': {
            const blueprint = BLUEPRINTS[task.blueprint];
            materialCheck(world, actor, task.materials, blueprint.needs);
            if (!canStand(p.position, land) || !buildingGround(p.position)) { fail('building_ground'); }
            if (Object.values(world.structures).some(s => sitesConflict({ kind: task.blueprint, position: p.position }, s))) { fail('building_overlap'); }
            return 1;
        }
        case 'relieve':
            if ((task.waste === 'urine' ? p.body.needs.bladder : p.body.needs.bowel) < 1) { fail('conditions'); }
            return task.waste === 'urine' ? SURVIVAL.urineSeconds : SURVIVAL.fecesSeconds;
        case 'cover_waste': {
            const waste = Object.hasOwn(world.waste, task.waste) ? world.waste[task.waste] : null;
            if (!waste || waste.covered || !buildingGround(waste.position)) { fail('unavailable'); }
            near(world, actor, waste.position); return SURVIVAL.coverSeconds;
        }
        case 'cover_body':
            checkBodyCover(world, actor, task.subject, task.item, land); return SURVIVAL.coverBodySeconds;
        case 'ignite': {
            const site = siteFor(world, actor, task.site), tinder = accessibleItem(world, actor, task.tinder), drill = accessibleItem(world, actor, task.drill);
            if (site.burning || site.fuelSeconds <= 0 || tinder.kind !== 'tinder' || tinder.wetness > 0.25 || drill.kind !== 'fire_drill'
                || weatherAt(world).rain && !shelterAt(world, site.position)) { fail('conditions'); }
            return 900;
        }
        case 'fuel':
            siteFor(world, actor, task.site); materialCheck(world, actor, task.materials, { fuel: 1 }); return 30;
        case 'boil': {
            const site = siteFor(world, actor, task.site), container = accessibleItem(world, actor, task.container);
            if (!site.burning || !container.water?.millilitres || !ITEMS[container.kind].heatSafe) { fail('conditions'); }
            return 600;
        }
    }
}
export function beginConstruction(world: Journey, actor: PersonId, id: string) {
    const site = Object.hasOwn(world.structures, id) ? world.structures[id] : null;
    if (!site || site.workLeft <= 0) { fail('unavailable'); }
    near(world, actor, site.position);
    world.people[actor].activity = { kind: 'construct', site: id };
}
function claims(task: WorkTask): string[] {
    switch (task.kind) {
        case 'craft': case 'build': case 'fuel': return task.materials.map(m => m.item);
        case 'drink': case 'fill': case 'boil': case 'empty': return [task.container];
        case 'wash': return task.supply.kind === 'container' ? [task.supply.id] : [];
        case 'pour': return [task.from, task.container];
        case 'eat': case 'cover_body': return [task.item];
        case 'ignite': return [task.tinder, task.drill];
        default: return [];
    }
}
function finish(world: Journey, actor: PersonId, task: WorkTask, land: Landscape) {
    workDuration(world, actor, task, land);
    const person = world.people[actor];
    if (person.body.kind !== 'living') { fail('dead'); }
    const needs = person.body.needs, outputs: string[] = [];
    let target: string | null = null;
    switch (task.kind) {
        case 'gather': {
            const source = world.resources[task.source]; source.stock--;
            outputs.push(createItem(world, actor, RESOURCE_RULES[source.kind].output!, 1, weatherAt(world).rain ? 0.8 : 0.2));
            target = task.source;
            if (task.units > 1) { person.activity = { kind: 'work', task: { ...task, units: task.units - 1 }, remaining: RESOURCE_RULES[source.kind].seconds }; }
            break;
        }
        case 'fill': {
            const container = world.items[task.container]; mixWater(container.water!, sourceWater(world, actor, task.source).take(task.millilitres));
            target = task.container; break;
        }
        case 'pour':
            mixWater(world.items[task.container].water!, drawWater(world.items[task.from].water!, task.millilitres));
            record(world, { kind: 'poured', actor, from: task.from, to: task.container, millilitres: task.millilitres }, person.position, 'sight', land, [actor]); return;
        case 'empty':
            drawWater(world.items[task.container].water!, task.millilitres);
            record(world, { kind: 'poured', actor, from: task.container, to: null, millilitres: task.millilitres }, person.position, 'sight', land, [actor]); return;
        case 'drink': {
            const water = drawWater(world.items[task.container].water!, task.millilitres);
            drinkWater(needs, water, world.clock);
            target = task.container; break;
        }
        case 'sip': {
            drinkWater(needs, sourceWater(world, actor, task.source).take(task.millilitres), world.clock); target = task.source; break;
        }
        case 'wash': {
            washingWater(world, actor, task.supply).take(task.millilitres);
            needs.soiling = Math.max(0, needs.soiling - task.millilitres / HYGIENE.fullWashMl); target = task.supply.id; break;
        }
        case 'eat': {
            const item = world.items[task.item];
            needs.energy = Math.min(SURVIVAL.maxEnergy, needs.energy + ITEMS[item.kind].energy); needs.bowel += ITEMS[item.kind].energy / 15;
            needs.illness = Math.min(1, needs.illness + foodIllness(item, world.clock) + needs.soiling * 0.004);
            if (item.kind === 'coconut_open') {
                const shell = createItem(world, actor, 'shell', 1); world.items[shell].water = structuredClone(item.water); outputs.push(shell); item.water = null;
            }
            item.quantity--; target = task.item; break;
        }
        case 'craft': {
            const wetness = Math.max(...task.materials.map(m => world.items[m.item].wetness));
            const foodInputs = task.materials.map(m => world.items[m.item].foodSince).filter((since): since is number => since !== null);
            consumeMaterials(world, task.materials);
            for (const [kind, quantity] of Object.entries(RECIPES[task.recipe].outputs)) {
                const output = createItem(world, actor, kind as keyof typeof ITEMS, quantity, RECIPES[task.recipe].fire ? 0 : wetness);
                if (world.items[output].foodSince !== null && foodInputs.length) { world.items[output].foodSince = Math.min(...foodInputs); }
                outputs.push(output);
            }
            target = task.recipe; break;
        }
        case 'build': {
            const spec = BLUEPRINTS[task.blueprint], id = `site-${Object.keys(world.structures).length + 1}`;
            const fuelSeconds = task.blueprint === 'firepit' ? fuelDuration(world, actor, task.materials) : 0;
            consumeMaterials(world, task.materials);
            world.structures[id] = { kind: task.blueprint, position: { ...person.position }, builder: actor, workLeft: spec.seconds,
                water: spec.capacity ? plainWater() : null, fuelSeconds, burning: false };
            person.activity = { kind: 'construct', site: id }; target = id; break;
        }
        case 'relieve': {
            target = depositWaste(world, actor, task.waste, task.waste === 'urine' ? needs.bladder : needs.bowel);
            if (task.waste === 'urine') { needs.bladder = 0; } else { needs.bowel = 0; }
            needs.soiling = Math.min(1, needs.soiling + (task.waste === 'feces' ? 0.25 : 0.05));
            break;
        }
        case 'cover_waste': world.waste[task.waste].covered = true; needs.soiling = Math.min(1, needs.soiling + 0.1); target = task.waste; break;
        case 'cover_body':
            world.items[task.item].location = { kind: 'covering', person: task.subject };
            record(world, { kind: 'body_covered', actor, subject: task.subject, item: task.item }, world.people[task.subject].position, 'sight', land, [actor]);
            return;
        case 'fuel': {
            const duration = fuelDuration(world, actor, task.materials);
            consumeMaterials(world, task.materials); world.structures[task.site].fuelSeconds += duration; target = task.site; break;
        }
        case 'ignite': world.items[task.tinder].quantity--; world.structures[task.site].burning = true; target = task.site; break;
        case 'boil': world.items[task.container].water!.quality = 'treated'; target = task.container; break;
    }
    record(world, { kind: 'worked', actor, task: task.kind, target, outputs }, person.position, task.kind === 'relieve' || task.kind === 'wash' ? 'self' : 'sight', land, [actor]);
}

export function workTick(world: Journey, land: Landscape) {
    const ready = new Set<PersonId>(), itemClaims = new Map<string, PersonId[]>(), sourceClaims = new Map<string, { actor: PersonId; amount: number }[]>();
    for (const actor of PERSON_IDS) {
        const person = world.people[actor], activity = person.activity;
        if (activity?.kind === 'work') {
            const t = activity.task;
            const needsFire = t.kind === 'boil' || t.kind === 'craft' && RECIPES[t.recipe].fire;
            if (needsFire && (t.kind === 'boil' ? !world.structures[t.site]?.burning : !fireAt(world, person.position))) {
                person.activity = null;
                record(world, { kind: 'work_failed', actor, task: t.kind, reason: 'island_fire_missing' }, person.position, 'self', land, [actor]);
                continue;
            }
            activity.remaining--;
            if (activity.remaining <= 0) { ready.add(actor); }
        }
        const taken = activity?.kind === 'take' && activity.until <= world.clock;
        const ids = taken ? [activity.item] : ready.has(actor) && activity?.kind === 'work' ? claims(activity.task) : [];
        for (const id of ids) { itemClaims.set(id, [...(itemClaims.get(id) ?? []), actor]); }
        if (ready.has(actor) && activity?.kind === 'work') {
            const task = activity.task;
            const claim = task.kind === 'gather' ? { source: task.source, amount: 1 }
                : task.kind === 'fill' || task.kind === 'sip' ? { source: task.source, amount: task.millilitres }
                : task.kind === 'wash' && task.supply.kind === 'source' ? { source: task.supply.id, amount: task.millilitres } : null;
            if (claim) { sourceClaims.set(claim.source, [...(sourceClaims.get(claim.source) ?? []), { actor, amount: claim.amount }]); }
        }
    }
    for (const [item, actors] of itemClaims) {
        if (actors.length < 2) { continue; }
        for (const id of actors) { world.people[id].activity = null; ready.delete(id); }
        record(world, { kind: 'contested', actors, item }, world.people[actors[0]].position, 'sight', land, actors);
    }
    for (const [source, requests] of sourceClaims) {
        const active = requests.filter(r => ready.has(r.actor));
        const stock = world.resources[source]?.stock ?? world.structures[source]?.water?.millilitres ?? 0;
        if (active.length < 2 || active.reduce((sum, r) => sum + r.amount, 0) <= stock) { continue; }
        const actors = active.map(r => r.actor);
        for (const actor of actors) { world.people[actor].activity = null; ready.delete(actor); }
        record(world, { kind: 'resource_contested', actors, source }, world.people[actors[0]].position, 'sight', land, actors);
    }
    const builds = [...ready].flatMap(actor => {
        const a = world.people[actor].activity;
        return a?.kind === 'work' && a.task.kind === 'build' ? [{ actor, kind: a.task.blueprint, position: world.people[actor].position }] : [];
    });
    for (let i = 0; i < builds.length; i++) {
        for (let j = i + 1; j < builds.length; j++) {
            if (!sitesConflict(builds[i], builds[j])) { continue; }
            const actors = [builds[i].actor, builds[j].actor];
            for (const id of actors) { world.people[id].activity = null; ready.delete(id); }
            record(world, { kind: 'site_contested', actors }, builds[i].position, 'sight', land, actors);
        }
    }
    for (const actor of ready) {
        const activity = world.people[actor].activity;
        if (activity?.kind !== 'work') { continue; }
        world.people[actor].activity = null;
        try { finish(world, actor, activity.task, land); }
        catch (error) {
            if (!isActionFault(error)) { throw error; }
            record(world, { kind: 'work_failed', actor, task: activity.task.kind, reason: error.code }, world.people[actor].position, 'self', land, [actor]);
        }
    }
    const crews = new Map<string, PersonId[]>();
    for (const actor of PERSON_IDS) {
        const a = world.people[actor].activity;
        if (a?.kind === 'construct') { crews.set(a.site, [...(crews.get(a.site) ?? []), actor]); }
    }
    for (const [id, actors] of crews) {
        const site = world.structures[id]; site.workLeft = Math.max(0, site.workLeft - actors.length);
        if (site.workLeft > 0) { continue; }
        for (const actor of actors) {
            world.people[actor].activity = null;
            record(world, { kind: 'worked', actor, task: 'construct', target: id, outputs: [] }, site.position, 'sight', land, actors);
        }
    }
}
