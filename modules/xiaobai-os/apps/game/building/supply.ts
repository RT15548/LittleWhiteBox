import { ROOM_CHOICES, type Room, type RoomChoice } from './policy.js';

export type StockKind = Exclude<RoomChoice, 'path'>;
// Owned materials and the one visible draw survive reload. No future supply schedule is stored.
export interface Supply { owned: StockKind[]; remaining: number; offers: StockKind[][] }
export const SUPPLY_ROUNDS = 3;
export const SUPPLY_CHOICES = 3;
export const STARTER_ROOMS: readonly StockKind[] = ['room', 'room'];
const PACKS: readonly (readonly StockKind[])[] = [
    ['wide', 'room'], ['study', 'room'], ['garden', 'room', 'room'],
    ['terrace', 'room', 'room'], ['study', 'garden'], ['wide', 'terrace'], ['garden', 'garden', 'room'],
];
export const STOCK_KINDS = ROOM_CHOICES.filter((k): k is StockKind => k !== 'path');
export function newSupply(offers: StockKind[][]): Supply { return { owned: [...STARTER_ROOMS], remaining: SUPPLY_ROUNDS, offers: structuredClone(offers) }; }
/** Each call uses fresh entropy, never the plot, previous choices, inventory or delivery goals. */
export function drawOffers(random: () => number = () => crypto.getRandomValues(new Uint32Array(1))[0]): StockKind[][] {
    const deck = PACKS.map(p => [...p]);
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor((random() >>> 0) / 0x100000000 * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck.slice(0, SUPPLY_CHOICES);
}
export function stock(supply: Supply, rooms: readonly Room[]) {
    return Object.fromEntries(STOCK_KINDS.map(kind => [kind, supply.owned.filter(k => k === kind).length - rooms.filter(p => p.kind === kind).length])) as Record<StockKind, number>;
}
export function supplied(supply: Supply, rooms: readonly Room[]) { return Object.values(stock(supply, rooms)).every(n => n >= 0); }
export function validOffers(value: unknown): value is StockKind[][] {
    return Array.isArray(value) && value.length === SUPPLY_CHOICES
        && value.every(pack => Array.isArray(pack) && PACKS.some(p => p.length === pack.length && p.every((kind, i) => kind === pack[i])))
        && new Set(value.map(pack => pack.join(','))).size === SUPPLY_CHOICES;
}
