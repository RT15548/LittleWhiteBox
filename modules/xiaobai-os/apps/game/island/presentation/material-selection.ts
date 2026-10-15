import type { Item, MaterialUse } from '../model.js';
import type { ObservedItem } from '../food.js';

type AvailableItem = Pick<ObservedItem, 'id' | 'kind' | 'location' | 'quantity' | 'wetness' | 'food'>;
export interface MaterialGroup { key: string; kind: Item['kind']; location: Item['location']['kind']; food: ObservedItem['food']; items: AvailableItem[]; quantity: number }

export function groupMaterials(items: readonly AvailableItem[]): MaterialGroup[] {
    const groups = new Map<string, MaterialGroup>();
    for (const item of items) {
        const key = `${item.kind}:${item.location.kind}:${item.food}`;
        let group = groups.get(key);
        if (!group) { group = { key, kind: item.kind, location: item.location.kind, food: item.food, items: [], quantity: 0 }; groups.set(key, group); }
        group.items.push(item); group.quantity += item.quantity;
    }
    // Within a pile, choose the driest usable pieces first. No physical objects are merged.
    for (const group of groups.values()) { group.items.sort((a, b) => a.wetness - b.wetness); }
    return [...groups.values()];
}

export function selectMaterials(groups: readonly MaterialGroup[], quantities: Readonly<Record<string, number>>): MaterialUse[] | null {
    const result: MaterialUse[] = [];
    for (const group of groups) {
        let remaining = quantities[group.key] ?? 0;
        if (!Number.isSafeInteger(remaining) || remaining < 0 || remaining > group.quantity) { return null; }
        for (const item of group.items) {
            const units = Math.min(remaining, item.quantity);
            if (units) { result.push({ item: item.id, units }); remaining -= units; }
        }
    }
    return result;
}
