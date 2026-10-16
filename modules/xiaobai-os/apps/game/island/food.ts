import type { Item, ItemKind } from './model.js';
import type { ObservedWater } from './water.js';
import { FOOD } from './survival-content.js';
import type { Cleanliness } from './hygiene.js';

export type FoodObservation = 'unexamined' | 'no_obvious_spoilage' | 'off_odor';
export type ObservedItem = Omit<Item, 'foodSince' | 'water' | 'soiling'> & { id: string; water: ObservedWater | null; food: FoodObservation | null; cleanliness: Cleanliness };

export function isPerishable(kind: ItemKind): boolean { return kind === 'fish' || kind === 'cooked_fish' || kind === 'coconut_open'; }

export function exposedFoodCondition(since: number, clock: number, withinReach: boolean): FoodObservation {
    if (!withinReach) { return 'unexamined'; }
    return clock - since >= FOOD.odorAfterSeconds ? 'off_odor' : 'no_obvious_spoilage';
}

export function observeFood(item: Item, clock: number, withinReach: boolean): FoodObservation | null {
    if (item.foodSince === null) { return null; }
    return exposedFoodCondition(item.foodSince, clock, withinReach);
}

export function spoilageIllness(since: number, clock: number): number {
    return Math.max(0, Math.min(1, (clock - since - FOOD.riskAfterSeconds)
        / (FOOD.odorAfterSeconds - FOOD.riskAfterSeconds))) * FOOD.spoilageIllness;
}
export function foodIllness(item: Item, clock: number): number {
    return (item.foodSince === null ? 0 : spoilageIllness(item.foodSince, clock)) + (item.kind === 'fish' ? FOOD.rawFishIllness : 0);
}
