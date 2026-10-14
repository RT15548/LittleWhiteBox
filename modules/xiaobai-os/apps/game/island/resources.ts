import type { Resource, ResourceKind } from './model.js';
import { RESOURCE_RULES } from './survival-content.js';
import { TIDE } from './content.js';

export function resourceAccessible(kind: ResourceKind, tide: number) {
    return kind !== 'reef_food' || tide <= TIDE.forageMax;
}

// Normalize the high-water interval so the authored daily rate is a cycle mean,
// not an extra copy of the harvesting threshold or a refill on every visit.
const highWaterFraction = Math.acos(2 * TIDE.forageMax - 1) / Math.PI;
export function renewResources(resources: Record<string, Resource>, tide: number) {
    for (const source of Object.values(resources)) {
        const rule = RESOURCE_RULES[source.kind];
        const rate = rule.renewal === 'continuous' ? rule.renewalPerDay / 86400
            : tide > TIDE.forageMax ? rule.renewalPerDay / (86400 * highWaterFraction) : 0;
        source.stock = Math.min(rule.capacity, source.stock + rate);
    }
}
