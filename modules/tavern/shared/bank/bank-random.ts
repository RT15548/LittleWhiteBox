import {
    throwTavernBankError,
    type TavernBankDieFace,
} from './bank-types';

export interface TavernBankRandomSource {
    nextInt(maxExclusive: number): number;
}

function normalizeRandomBound(value: unknown): number {
    const maxExclusive = Number(value);
    if (!Number.isSafeInteger(maxExclusive) || maxExclusive <= 0) {
        throwTavernBankError('bank_random_invalid', `bound:${String(value)}`);
    }
    return maxExclusive;
}

function checkedRandomInteger(source: TavernBankRandomSource, maxExclusive: number): number {
    const value = source.nextInt(maxExclusive);
    if (!Number.isSafeInteger(value) || value < 0 || value >= maxExclusive) {
        throwTavernBankError('bank_random_invalid', `value:${String(value)}/${maxExclusive}`);
    }
    return value;
}

export const tavernBankRandomSource: TavernBankRandomSource = Object.freeze({
    nextInt(maxExclusive: number): number {
        const bound = normalizeRandomBound(maxExclusive);
        return Math.floor(Math.random() * bound);
    },
});

export function createTavernBankSequenceRandom(
    values: readonly number[],
    options: { repeat?: boolean } = {},
): TavernBankRandomSource {
    const sequence = [...values];
    let cursor = 0;
    return {
        nextInt(maxExclusive: number): number {
            const bound = normalizeRandomBound(maxExclusive);
            if (sequence.length === 0 || (!options.repeat && cursor >= sequence.length)) {
                throwTavernBankError('bank_random_exhausted');
            }
            const value = sequence[cursor % sequence.length];
            cursor += 1;
            if (!Number.isSafeInteger(value) || value < 0 || value >= bound) {
                throwTavernBankError('bank_random_invalid', `sequence:${String(value)}/${bound}`);
            }
            return value;
        },
    };
}

export function rollTavernBankDie(source: TavernBankRandomSource): TavernBankDieFace {
    return (checkedRandomInteger(source, 6) + 1) as TavernBankDieFace;
}

export function shuffleTavernBankValues<T>(values: readonly T[], source: TavernBankRandomSource): T[] {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const selected = checkedRandomInteger(source, index + 1);
        [shuffled[index], shuffled[selected]] = [shuffled[selected], shuffled[index]];
    }
    return shuffled;
}

export function drawTavernBankInclusiveInteger(
    min: number,
    max: number,
    source: TavernBankRandomSource,
): number {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min > max) {
        throwTavernBankError('bank_random_invalid', `range:${String(min)}:${String(max)}`);
    }
    const size = max - min + 1;
    if (!Number.isSafeInteger(size) || size <= 0) {
        throwTavernBankError('bank_random_invalid', `range-size:${String(size)}`);
    }
    return min + checkedRandomInteger(source, size);
}

export function drawTavernBankProbabilityBasisPoints(source: TavernBankRandomSource): number {
    return checkedRandomInteger(source, 10_000);
}
