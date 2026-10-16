import type { Item, Journey, PersonId, Point, WashSupply } from './model.js';
import { CARE, ITEMS } from './survival-content.js';
import { GARMENTS } from './clothing.js';
import { accessibleItem } from './inventory.js';
import { withinReach } from './space.js';
import { elevationAt, seaLevel } from './terrain.js';
import { drawWater, mixWater, plainWater } from './water.js';
import { fail } from './fault.js';

export type Cleanliness = 'clean' | 'used' | 'dirty' | 'unexamined';
export function cleanliness(soiling: number, near: boolean): Cleanliness {
    return !near ? 'unexamined' : soiling <= CARE.cleanLimit ? 'clean' : soiling < CARE.dirtyLimit ? 'used' : 'dirty';
}
export function seaWithinReach(position: Point, tide: number) {
    // Reach is measured against the same tide and terrain used by shallow-water movement.
    return [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([x, y]) => {
        const point = { x: position.x + x, y: position.y + y };
        return withinReach(position, point) && seaLevel(tide) - elevationAt(point) > .05;
    });
}
export function sourceWater(world: Journey, actor: PersonId, id: string) {
    const resource = Object.hasOwn(world.resources, id) ? world.resources[id] : null;
    const site = Object.hasOwn(world.structures, id) ? world.structures[id] : null;
    if (resource?.kind === 'seep') {
        if (!withinReach(world.people[actor].position, resource.position)) { fail('unavailable'); }
        return { available: resource.stock, clean: false, take: (ml: number) => { resource.stock -= ml; return plainWater(ml); } };
    }
    if (!site?.water || site.workLeft > 0 || !withinReach(world.people[actor].position, site.position)) { fail('unavailable'); }
    return { available: site.water.millilitres, clean: site.water.quality === 'treated' && !site.water.coconut,
        take: (ml: number) => drawWater(site.water!, ml) };
}
export function retainResidue(item: Item) {
    if (!item.water?.millilitres) { return; }
    if (item.water.quality === 'untreated') { item.soiling = Math.max(item.soiling, CARE.untreatedResidue); }
    if (item.water.coconut) { item.soiling = Math.max(item.soiling, CARE.coconutResidue); }
}
export function takeWater(item: Item, ml: number) {
    retainResidue(item);
    const water = drawWater(item.water!, ml);
    if (item.soiling > CARE.cleanLimit) { water.quality = 'untreated'; }
    return water;
}
export function putWater(item: Item, water: ReturnType<typeof plainWater>) {
    retainResidue(item);
    mixWater(item.water!, water);
    if (item.soiling > CARE.cleanLimit) { item.water!.quality = 'untreated'; }
    retainResidue(item);
}
export function washingWater(world: Journey, actor: PersonId, supply: WashSupply, tide: number) {
    if (supply.kind === 'sea') {
        if (!seaWithinReach(world.people[actor].position, tide)) { fail('unavailable'); }
        return { available: Infinity, clean: false, take: (_ml: number) => null };
    }
    if (supply.kind === 'source') { return sourceWater(world, actor, supply.id); }
    const item = accessibleItem(world, actor, supply.id);
    if (!item.water) { fail('conditions'); }
    return { available: item.water.millilitres, clean: item.soiling <= CARE.cleanLimit && item.water.quality === 'treated' && !item.water.coconut,
        take: (ml: number) => takeWater(item, ml) };
}
export function washable(item: Pick<Item, 'kind' | 'location'> & { water: { millilitres: number } | null }) {
    return (item.location.kind === 'ground' || item.location.kind === 'carried')
        && (!!GARMENTS[item.kind] || item.kind === 'cloth' || ITEMS[item.kind].capacity > 0 && !ITEMS[item.kind].energy)
        && !item.water?.millilitres;
}
export function washVolume(item: Pick<Item, 'kind' | 'quantity'>) {
    return (ITEMS[item.kind].capacity ? CARE.containerWashMl : CARE.garmentWashMl) * item.quantity;
}
export function washFloor(supply: WashSupply, clean: boolean) {
    return supply.kind === 'sea' ? CARE.seaWashFloor : clean ? 0 : CARE.untreatedWashFloor;
}
