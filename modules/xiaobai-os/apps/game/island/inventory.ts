import type { ItemKind, Journey, MaterialUse, PersonId } from './model.js';
import { ITEMS, SURVIVAL, uniqueMaterials } from './survival-content.js';
import { withinReach, itemPosition } from './space.js';
import { fail } from './fault.js';
import { isPerishable } from './food.js';
import { coconutWater, plainWater } from './water.js';
import { GARMENTS } from './clothing.js';
import { buriedBodies } from './burial-state.js';

export function carriedWeight(world: Journey, actor: PersonId): number {
    return Object.values(world.items).reduce((sum, item) => item.quantity > 0 && item.location.kind !== 'ground' && item.location.person === actor
        ? sum + ITEMS[item.kind].kilograms * item.quantity + (item.water?.millilitres ?? 0) / 1000 : sum, 0);
}
export function carryLimit(world: Journey, actor: PersonId): number {
    return SURVIVAL.maxCarryKg + (Object.values(world.items).some(i => i.quantity > 0 && i.kind === 'basket'
        && i.location.kind !== 'ground' && i.location.person === actor) ? SURVIVAL.basketBonusKg : 0);
}
export function accessibleItem(world: Journey, actor: PersonId, id: string) {
    const item = Object.hasOwn(world.items, id) ? world.items[id] : null;
    if (!item || item.quantity <= 0) { fail('unavailable'); }
    if (item.location.kind === 'dressing' || item.location.kind !== 'ground' && (item.location.person !== actor || buriedBodies(world).has(item.location.person))) { fail('unavailable'); }
    const position = itemPosition(world, id)!;
    if (!withinReach(world.people[actor].position, position)) { fail('unavailable'); }
    return item;
}
export function accessibleItems(world: Journey, actor: PersonId) {
    return Object.values(world.items).filter(item => item.quantity > 0 && item.location.kind !== 'dressing' && (item.location.kind === 'ground'
        ? withinReach(item.location.position, world.people[actor].position) : item.location.person === actor));
}
export function readMaterials(world: Journey, actor: PersonId, uses: MaterialUse[]) {
    if (!uses.length || !uniqueMaterials(uses)) { fail('materials'); }
    return uses.map(use => {
        const item = accessibleItem(world, actor, use.item);
        if (!Number.isSafeInteger(use.units) || use.units < 1 || use.units > item.quantity || item.water && item.water.millilitres > 0) { fail('materials'); }
        return { kind: item.kind, units: use.units };
    });
}
export function consumeMaterials(world: Journey, uses: MaterialUse[]) {
    for (const use of uses) { world.items[use.item].quantity -= use.units; }
}
export function createItem(world: Journey, actor: PersonId, kind: ItemKind, quantity: number, wetness = 0, soiling = 0): string {
    const id = `item-${Object.keys(world.items).length + 1}`;
    const weight = ITEMS[kind].kilograms * quantity + (kind === 'coconut_open' ? ITEMS[kind].capacity / 1000 : 0);
    const canCarry = carriedWeight(world, actor) + weight <= carryLimit(world, actor);
    world.items[id] = { kind, quantity, wetness, soiling, foodSince: isPerishable(kind) ? world.clock : null,
        location: canCarry ? { kind: 'carried', person: actor } : { kind: 'ground', position: { ...world.people[actor].position } },
        water: kind === 'coconut_open' ? coconutWater(ITEMS[kind].capacity, world.clock) : ITEMS[kind].capacity ? plainWater() : null };
    return id;
}
export function footProtection(world: Journey, actor: PersonId): number {
    const worn = Object.values(world.items).filter(i => i.quantity > 0 && i.location.kind === 'worn' && i.location.person === actor);
    return worn.reduce((protection, item) => Math.max(protection, GARMENTS[item.kind]?.footProtection ?? 0), 0);
}
