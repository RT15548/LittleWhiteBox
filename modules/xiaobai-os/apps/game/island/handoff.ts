import { PERSON_IDS, type Journey, type Landscape, type PersonId } from './model.js';
import { ITEMS } from './survival-content.js';
import { carriedWeight, carryLimit, createItem } from './inventory.js';
import { withinReach, perceives } from './space.js';
import { record } from './experience.js';
import { fail } from './fault.js';
import { observeFood } from './food.js';
import { observeWater } from './water.js';

export function canOffer(world: Journey, from: PersonId, to: PersonId, itemId: string, units: number, land: Landscape) {
    const item = Object.hasOwn(world.items, itemId) ? world.items[itemId] : null;
    return from !== to && world.people[from].body.kind === 'living' && world.people[to].body.kind === 'living'
        && !!item && item.location.kind === 'carried' && item.location.person === from && item.quantity >= units && units > 0
        && withinReach(world.people[from].position, world.people[to].position)
        && perceives(world, from, world.people[to].position, 'sight', land) && perceives(world, to, world.people[from].position, 'sight', land);
}

export function acceptOffer(world: Journey, actor: PersonId, from: PersonId, land: Landscape) {
    const offer = world.people[from].activity;
    if (offer?.kind !== 'offer' || offer.to !== actor || !canOffer(world, from, actor, offer.item, offer.units, land)) { fail('unavailable'); }
    const item = world.items[offer.item];
    if (carriedWeight(world, actor) + ITEMS[item.kind].kilograms * offer.units + (item.water?.millilitres ?? 0) / 1000 > carryLimit(world, actor)) { fail('capacity'); }
    let received = offer.item;
    if (offer.units === item.quantity) { item.location = { kind: 'carried', person: actor }; }
    else {
        item.quantity -= offer.units;
        received = createItem(world, actor, item.kind, offer.units, item.wetness);
        world.items[received].foodSince = item.foodSince;
    }
    world.people[from].activity = null;
    record(world, { kind: 'received', actor, from, item: received, form: item.kind, units: offer.units }, world.people[actor].position, 'sight', land, [actor, from]);
}

export function cancelBrokenOffers(world: Journey, land: Landscape) {
    for (const actor of PERSON_IDS) {
        const person = world.people[actor], offer = person.activity;
        if (offer?.kind !== 'offer' || canOffer(world, actor, offer.to, offer.item, offer.units, land)) { continue; }
        person.activity = null;
        record(world, { kind: 'interrupted', actor }, person.position, 'sight', land, [actor]);
    }
}

export function visibleOffers(world: Journey, observer: PersonId, land: Landscape) {
    return PERSON_IDS.flatMap(from => {
        const offer = world.people[from].activity;
        if (offer?.kind !== 'offer' || !perceives(world, observer, world.people[from].position, 'sight', land)) { return []; }
        const item = world.items[offer.item];
        const near = withinReach(world.people[observer].position, world.people[from].position);
        return [{ from, to: offer.to, item: offer.item, form: item.kind, units: offer.units, wetness: item.wetness,
            water: observeWater(item.water, world.clock, near), food: observeFood(item, world.clock, near) }];
    });
}
