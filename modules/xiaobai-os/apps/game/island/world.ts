import { LANDING } from './content.js';
import { ISLAND_FORMAT_VERSION, PERSON_IDS, type IslandData, type Journey } from './model.js';
import { fail } from './fault.js';
import { identifier } from './validation.js';
import { initialNeeds } from './physiology.js';
import { INITIAL_RESOURCES } from './survival-content.js';
import { plainWater } from './water.js';
import { CAST, type PlayerIdentity } from './characters.js';
import { parsePlayerIdentity } from './identity.js';

export function emptyIsland(): IslandData { return { formatVersion: ISLAND_FORMAT_VERSION, revision: 0, active: null, last: null }; }
export function newJourney(id: string, identity: PlayerIdentity): Journey {
    identifier(id);
    const playerIdentity = parsePlayerIdentity(identity);
    const people = Object.fromEntries(PERSON_IDS.map(person => [person, {
        position: { ...LANDING[person] }, body: { kind: 'living', needs: initialNeeds() }, activity: null,
    }])) as Journey['people'];
    const items: Journey['items'] = {};
    for (const person of PERSON_IDS) {
        // Authored starting objects, not generated salvage or occupation-based abilities.
        const clothing = person === 'ye'
            ? ['lifejacket', 'ivory_blouse', 'charcoal_trousers', 'inner_top', 'inner_shorts'] as const
            : ['lifejacket', 'shirt', 'trousers', 'inner_shorts',
                ...((person === 'player' ? playerIdentity.gender : CAST[person].gender) === 'female' ? ['inner_top'] as const : [])] as const;
        for (const kind of clothing) {
            items[`${person}-${kind}`] = { kind, location: { kind: 'worn', person }, quantity: 1, water: null, wetness: 0.8, soiling: .2, foodSince: null };
        }
    }
    for (const person of ['player', 'lin', 'zhou', 'ye'] as const) {
        items[`${person}-shoes`] = { kind: 'shoes', location: { kind: 'worn', person }, quantity: 1, water: null, wetness: 0.8, soiling: .3, foodSince: null };
    }
    items.salvage_bottle = { kind: 'bottle', location: { kind: 'ground', position: { x: -724, y: -8 } }, quantity: 1, water: plainWater(), wetness: 1, soiling: .5, foodSince: null };
    items.salvage_edge = { kind: 'metal_edge', location: { kind: 'ground', position: { x: -718, y: -11 } }, quantity: 1, water: null, wetness: 1, soiling: .3, foodSince: null };
    items.salvage_cup = { kind: 'metal_cup', location: { kind: 'ground', position: { x: -722, y: -20 } }, quantity: 1, water: plainWater(), wetness: 1, soiling: .5, foodSince: null };
    items.shore_stone = { kind: 'coral_stone', location: { kind: 'ground', position: { x: -703, y: 19 } }, quantity: 1, water: null, wetness: 0.2, soiling: .4, foodSince: null };
    return { id, playerIdentity, clock: 0, people, items, resources: structuredClone(INITIAL_RESOURCES), structures: {}, waste: {}, experiences: [] };
}
export function isEnded(world: Journey): boolean { return world.people.player.body.kind === 'dead'; }
export function requireLivingWorld(world: Journey) { if (isEnded(world)) { fail('ended'); } }
