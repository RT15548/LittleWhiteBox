import {
    type TavernPetOrigin,
    throwTavernPetError,
} from './pet-types';
import type { TavernPetEventCandidate } from './pet-events';

export interface TavernPetRandomSource {
    nextInt(maxExclusive: number): number;
}

function assertMaxExclusive(value: number): number {
    if (!Number.isSafeInteger(value) || value <= 0) {
        throwTavernPetError('pet_random_invalid', `max:${String(value)}`);
    }
    return value;
}

function assertRandomValue(value: number, maxExclusive: number): number {
    if (!Number.isSafeInteger(value) || value < 0 || value >= maxExclusive) {
        throwTavernPetError('pet_random_invalid', `${String(value)}/${maxExclusive}`);
    }
    return value;
}

export const tavernPetRandomSource: TavernPetRandomSource = Object.freeze({
    nextInt(maxExclusive: number): number {
        const max = assertMaxExclusive(maxExclusive);
        return Math.floor(Math.random() * max);
    },
});

export function createTavernPetSequenceRandomSource(values: readonly number[]): TavernPetRandomSource {
    let index = 0;
    return {
        nextInt(maxExclusive: number): number {
            const max = assertMaxExclusive(maxExclusive);
            if (index >= values.length) {throwTavernPetError('pet_random_exhausted');}
            return assertRandomValue(Number(values[index++]), max);
        },
    };
}

export function drawTavernPetInclusiveInteger(
    minimum: number,
    maximum: number,
    random: TavernPetRandomSource,
): number {
    if (!Number.isSafeInteger(minimum) || !Number.isSafeInteger(maximum) || maximum < minimum) {
        throwTavernPetError('pet_random_invalid', `range:${minimum}:${maximum}`);
    }
    return minimum + random.nextInt(maximum - minimum + 1);
}

function drawBirthBiasAxis(random: TavernPetRandomSource): number {
    const value = random.nextInt(30);
    return value < 15 ? value - 15 : value - 14;
}

/** Origin has a frozen draw order: specimen, delay, tameness, generosity, brightness. */
export function drawTavernPetOrigin(random: TavernPetRandomSource): TavernPetOrigin {
    const specimenNumber = random.nextInt(999) + 1;
    const arrivalAfterTurns = random.nextInt(3) + 1;
    return {
        specimenNumber,
        arrivalAfterTurns,
        birthBias: {
            tameness: drawBirthBiasAxis(random),
            generosity: drawBirthBiasAxis(random),
            brightness: drawBirthBiasAxis(random),
        },
    };
}

export function tavernPetProbabilityPasses(
    probabilityPercent: number,
    random: TavernPetRandomSource,
): boolean {
    if (!Number.isSafeInteger(probabilityPercent) || probabilityPercent < 0 || probabilityPercent > 100) {
        throwTavernPetError('pet_random_invalid', `chance:${probabilityPercent}`);
    }
    return random.nextInt(100) < probabilityPercent;
}

export function drawWeightedTavernPetCandidate<T extends { weight: number }>(
    candidates: readonly T[],
    random: TavernPetRandomSource,
): T {
    const total = candidates.reduce((sum, candidate) => {
        if (!Number.isSafeInteger(candidate.weight) || candidate.weight <= 0) {
            throwTavernPetError('pet_random_invalid', `weight:${String(candidate.weight)}`);
        }
        return sum + candidate.weight;
    }, 0);
    if (!candidates.length || !Number.isSafeInteger(total) || total <= 0) {
        throwTavernPetError('pet_random_invalid', 'empty-weight-pool');
    }
    const roll = random.nextInt(total);
    let cursor = 0;
    for (const candidate of candidates) {
        cursor += candidate.weight;
        if (roll < cursor) {return candidate;}
    }
    throwTavernPetError('pet_random_invalid', `weight-roll:${roll}/${total}`);
}

export function drawWeightedTavernPetEventCandidate(
    candidates: readonly TavernPetEventCandidate[],
    random: TavernPetRandomSource,
): TavernPetEventCandidate {
    return drawWeightedTavernPetCandidate(candidates, random);
}
