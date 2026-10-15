import { BLUEPRINT_IDS, RESOURCE_KINDS, ITEM_KINDS, type WorkTask } from './model.js';
import { BLUEPRINTS, ITEMS, RESOURCE_RULES, SURVIVAL, WEAR_SLOTS } from './survival-content.js';
import { LANDSCAPE } from './content.js';
import { canStand } from './space.js';
import { boolean, identifier, integer, member, number, object, person, point, shape } from './validation.js';
import { fail } from './fault.js';
import { coveringMaterial } from './remains.js';
import { isPerishable } from './food.js';

export function stand(raw: unknown) { const p = point(raw); if (!canStand(p, LANDSCAPE)) { fail('invalid'); } return p; }
export function needs(raw: unknown) {
    const n = shape(raw, ['waterDeficit', 'energy', 'fatigue', 'bladder', 'bowel', 'soiling', 'footWound', 'skinWound', 'infection', 'illness']);
    number(n.waterDeficit, 0, SURVIVAL.lethalWaterDeficit);
    number(n.energy, SURVIVAL.lethalEnergyBalance, SURVIVAL.maxEnergy); number(n.fatigue, 0, 100);
    number(n.bladder, 0, SURVIVAL.bladderLimit); number(n.bowel, 0, SURVIVAL.bowelLimit);
    for (const key of ['soiling', 'footWound', 'skinWound', 'infection', 'illness']) { number(n[key], 0, 1); }
}
function water(raw: unknown, capacity: number, clock: number) {
    if (!capacity) { if (raw !== null) { fail('invalid'); } return; }
    const w = shape(raw, ['millilitres', 'quality', 'coconut']); number(w.millilitres, 0, capacity); member(w.quality, ['untreated', 'treated']);
    if (w.coconut !== null) {
        const c = shape(w.coconut, ['millilitres', 'openedAt']); number(c.millilitres, Number.MIN_VALUE, number(w.millilitres)); integer(c.openedAt, 0, clock);
    }
}
export function validateObjects(items: Record<string, unknown>, resources: Record<string, unknown>, structures: Record<string, unknown>, waste: Record<string, unknown>, clock: number) {
    const worn = new Set<string>();
    for (const [id, raw] of Object.entries(items)) {
        identifier(id); const item = shape(raw, ['kind', 'location', 'quantity', 'water', 'wetness', 'foodSince']), kind = member(item.kind, ITEM_KINDS);
        integer(item.quantity, 0, 100); number(item.wetness, 0, 1);
        if (isPerishable(kind)) { integer(item.foodSince, 0, clock); }
        else if (item.foodSince !== null) { fail('invalid'); }
        if (item.quantity !== 0 || item.water !== null) { water(item.water, ITEMS[kind].capacity, clock); }
        if (ITEMS[kind].capacity && number(item.quantity) > 1) { fail('invalid'); }
        const location = object(item.location);
        if (location.kind === 'ground') { shape(location, ['kind', 'position']); stand(location.position); }
        else {
            shape(location, ['kind', 'person']); member(location.kind, ['carried', 'worn', 'covering']); const owner = person(location.person);
            if (location.kind === 'covering' && !coveringMaterial(kind)) { fail('invalid'); }
            if (location.kind === 'worn' && item.quantity !== 0) {
                const slot = WEAR_SLOTS[kind], key = `${owner}:${slot}`;
                if (!slot || worn.has(key) || item.quantity !== 1) { fail('invalid'); } worn.add(key);
            }
        }
    }
    for (const [id, raw] of Object.entries(resources)) {
        identifier(id); const r = shape(raw, ['kind', 'position', 'stock']), kind = member(r.kind, RESOURCE_KINDS);
        stand(r.position); number(r.stock, 0, RESOURCE_RULES[kind].capacity);
    }
    for (const [id, raw] of Object.entries(structures)) {
        identifier(id); const s = shape(raw, ['kind', 'position', 'builder', 'workLeft', 'water', 'fuelSeconds', 'burning']), kind = member(s.kind, BLUEPRINT_IDS);
        stand(s.position); person(s.builder); integer(s.workLeft, 0, BLUEPRINTS[kind].seconds); water(s.water, BLUEPRINTS[kind].capacity, clock);
        number(s.fuelSeconds); boolean(s.burning);
        if (kind !== 'firepit' && (s.fuelSeconds !== 0 || s.burning) || s.burning && (s.workLeft !== 0 || s.fuelSeconds === 0)) { fail('invalid'); }
    }
    for (const [id, raw] of Object.entries(waste)) {
        identifier(id); const w = shape(raw, ['kind', 'position', 'amount', 'covered', 'createdAt']);
        member(w.kind, ['urine', 'feces']); stand(w.position); number(w.amount); boolean(w.covered); integer(w.createdAt, 0, clock);
    }
}
export function workReferences(task: WorkTask, items: Record<string, unknown>, resources: Record<string, unknown>, structures: Record<string, unknown>, waste: Record<string, unknown>) {
    const ref = (collection: Record<string, unknown>, id: string) => { if (!Object.hasOwn(collection, id)) { fail('invalid'); } };
    if ('materials' in task) { for (const use of task.materials) { ref(items, use.item); } }
    if ('container' in task) { ref(items, task.container); }
    if (task.kind === 'wash') {
        const supply = task.supply;
        if (supply.kind === 'container') { ref(items, supply.id); }
        else if (!Object.hasOwn(resources, supply.id)) { ref(structures, supply.id); }
    }
    if (task.kind === 'pour') { ref(items, task.from); }
    if ('site' in task) { ref(structures, task.site); }
    if (task.kind === 'gather') { ref(resources, task.source); }
    if ((task.kind === 'fill' || task.kind === 'sip') && !Object.hasOwn(resources, task.source)) { ref(structures, task.source); }
    if (task.kind === 'eat' || task.kind === 'cover_body') { ref(items, task.item); }
    if (task.kind === 'cover_waste') { ref(waste, task.waste); }
    if (task.kind === 'ignite') { ref(items, task.tinder); ref(items, task.drill); }
}
