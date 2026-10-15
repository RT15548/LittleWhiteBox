import type { Water } from './model.js';
import { DRINKING } from './survival-content.js';
import { exposedFoodCondition, spoilageIllness, type FoodObservation } from './food.js';

export type ObservedWater = Omit<Water, 'coconut'> & { food: FoodObservation | null };
export function plainWater(millilitres = 0, quality: Water['quality'] = 'untreated'): Water { return { millilitres, quality, coconut: null }; }
export function coconutWater(millilitres: number, openedAt: number): Water {
    return { millilitres, quality: 'untreated', coconut: { millilitres, openedAt } };
}

// Callers validate reach and amount before mutation. A draw is a proportional portion, not a new batch.
export function drawWater(source: Water, millilitres: number): Water {
    const drawn: Water = { millilitres, quality: source.quality, coconut: source.coconut
        ? { millilitres: source.coconut.millilitres / source.millilitres * millilitres, openedAt: source.coconut.openedAt } : null };
    source.millilitres -= millilitres;
    if (source.coconut) {
        if (source.millilitres === 0) { source.coconut = null; }
        else { source.coconut.millilitres -= drawn.coconut!.millilitres; }
    }
    return drawn;
}
export function mixWater(target: Water, incoming: Water) {
    if (target.millilitres === 0) { target.quality = incoming.quality; }
    else if (incoming.quality === 'untreated') { target.quality = 'untreated'; }
    target.millilitres += incoming.millilitres;
    if (incoming.coconut) {
        target.coconut = target.coconut
            ? { millilitres: target.coconut.millilitres + incoming.coconut.millilitres,
                openedAt: Math.min(target.coconut.openedAt, incoming.coconut.openedAt) }
            : { ...incoming.coconut };
    }
}
export function waterIllness(water: Water, clock: number): number {
    return (water.quality === 'untreated' ? DRINKING.untreatedIllness * water.millilitres / DRINKING.portionMl : 0)
        + (water.coconut ? spoilageIllness(water.coconut.openedAt, clock) * water.coconut.millilitres / DRINKING.portionMl : 0);
}
export function observeWater(water: Water | null, clock: number, withinReach: boolean): ObservedWater | null {
    if (!water) { return null; }
    return { millilitres: water.millilitres, quality: water.quality,
        food: water.coconut ? exposedFoodCondition(water.coconut.openedAt, clock, withinReach) : null };
}
