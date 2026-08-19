import {
    shuffleTavernBankValues,
    type TavernBankRandomSource,
} from '../bank-random';
import {
    throwTavernBankError,
    type TavernBankPrivatePushGame,
    type TavernBankPushCard,
} from '../bank-types';

export const TAVERN_BANK_PUSH_BET = 50 as const;
export const TAVERN_BANK_PUSH_COIN_VALUE = 50 as const;
export const TAVERN_BANK_PUSH_COIN_COUNT = 7 as const;
export const TAVERN_BANK_PUSH_BOMB_COUNT = 3 as const;

export interface CreateTavernBankPushGameInput {
    id: string;
    startedAtTurn: number;
    startedAtOrder: number;
    createdAt: number;
}

export interface TavernBankPushStatistics {
    remainingCards: number;
    remainingBombs: number;
    nextBombProbabilityBps: number;
}

export type TavernBankPushTransition =
    | { kind: 'continued'; game: TavernBankPrivatePushGame; statistics: TavernBankPushStatistics }
    | { kind: 'settled'; outcome: 'cashed-out' | 'busted' | 'cleared'; payout: number; revealedCoins: number };

function assertPushId(value: unknown): string {
    const id = String(value || '').trim();
    if (!id) {throwTavernBankError('bank_game_id_required');}
    return id;
}

function assertNonNegativeSafeInteger(value: unknown, detail: string): number {
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < 0) {
        throwTavernBankError('bank_game_invalid', detail);
    }
    return number;
}

export function createTavernBankPushGame(
    input: CreateTavernBankPushGameInput,
    random: TavernBankRandomSource,
): TavernBankPrivatePushGame {
    const id = assertPushId(input.id);
    const startedAtTurn = assertNonNegativeSafeInteger(input.startedAtTurn, 'push-start-turn');
    const startedAtOrder = assertNonNegativeSafeInteger(input.startedAtOrder, 'push-start-order');
    const createdAt = assertNonNegativeSafeInteger(input.createdAt, 'push-created-at');
    const deck = shuffleTavernBankValues<TavernBankPushCard>([
        ...Array<TavernBankPushCard>(TAVERN_BANK_PUSH_COIN_COUNT).fill('coin'),
        ...Array<TavernBankPushCard>(TAVERN_BANK_PUSH_BOMB_COUNT).fill('bomb'),
    ], random);
    return {
        id,
        bet: TAVERN_BANK_PUSH_BET,
        deck,
        drawIndex: 0,
        revealedCoins: 0,
        cashoutAmount: 0,
        startedAtTurn,
        startedAtOrder,
        createdAt,
    };
}

function assertActivePushGame(game: TavernBankPrivatePushGame): void {
    if (!game || !Array.isArray(game.deck) || game.deck.length !== TAVERN_BANK_PUSH_COIN_COUNT + TAVERN_BANK_PUSH_BOMB_COUNT
        || game.deck.filter((card) => card === 'coin').length !== TAVERN_BANK_PUSH_COIN_COUNT
        || game.deck.filter((card) => card === 'bomb').length !== TAVERN_BANK_PUSH_BOMB_COUNT
        || game.deck.some((card) => card !== 'coin' && card !== 'bomb')
        || !Number.isSafeInteger(game.drawIndex) || game.drawIndex < 0 || game.drawIndex >= TAVERN_BANK_PUSH_COIN_COUNT
        || !Number.isSafeInteger(game.revealedCoins) || game.revealedCoins !== game.drawIndex || game.revealedCoins > 6
        || !Number.isSafeInteger(game.cashoutAmount) || game.cashoutAmount !== game.revealedCoins * TAVERN_BANK_PUSH_COIN_VALUE
        || game.deck.slice(0, game.drawIndex).some((card) => card !== 'coin')) {
        throwTavernBankError('bank_game_invalid', 'push-game');
    }
}

export function getTavernBankPushStatistics(game: TavernBankPrivatePushGame): TavernBankPushStatistics {
    assertActivePushGame(game);
    const remainingCards = game.deck.length - game.drawIndex;
    const remainingBombs = game.deck.slice(game.drawIndex).filter((card) => card === 'bomb').length;
    return {
        remainingCards,
        remainingBombs,
        nextBombProbabilityBps: Math.floor((remainingBombs * 10_000) / remainingCards),
    };
}

function copyPushGame(game: TavernBankPrivatePushGame, next: Pick<TavernBankPrivatePushGame, 'drawIndex' | 'revealedCoins' | 'cashoutAmount'>): TavernBankPrivatePushGame {
    return {
        ...game,
        deck: [...game.deck],
        ...next,
    };
}

export function drawTavernBankPushCard(game: TavernBankPrivatePushGame): TavernBankPushTransition {
    assertActivePushGame(game);
    const card = game.deck[game.drawIndex];
    if (card === 'bomb') {
        return {
            kind: 'settled',
            outcome: 'busted',
            payout: 0,
            revealedCoins: game.revealedCoins,
        };
    }
    const revealedCoins = game.revealedCoins + 1;
    const cashoutAmount = revealedCoins * TAVERN_BANK_PUSH_COIN_VALUE;
    if (revealedCoins === TAVERN_BANK_PUSH_COIN_COUNT) {
        return {
            kind: 'settled',
            outcome: 'cleared',
            payout: cashoutAmount,
            revealedCoins,
        };
    }
    const continued = copyPushGame(game, {
        drawIndex: game.drawIndex + 1,
        revealedCoins,
        cashoutAmount,
    });
    return {
        kind: 'continued',
        game: continued,
        statistics: getTavernBankPushStatistics(continued),
    };
}

export function cashOutTavernBankPushGame(game: TavernBankPrivatePushGame): TavernBankPushTransition {
    assertActivePushGame(game);
    if (game.revealedCoins < 1) {throwTavernBankError('bank_push_cashout_invalid');}
    return {
        kind: 'settled',
        outcome: 'cashed-out',
        payout: game.cashoutAmount,
        revealedCoins: game.revealedCoins,
    };
}

/** Exact optimal payout before the fixed 50-coin entry fee. */
export function getTavernBankPushOptimalExpectedPayout(): { numerator: number; denominator: number } {
    interface Fraction {
        numerator: number;
        denominator: number;
    }
    const greatestCommonDivisor = (left: number, right: number): number => {
        let a = Math.abs(left);
        let b = Math.abs(right);
        while (b > 0) {[a, b] = [b, a % b];}
        return a || 1;
    };
    const normalize = (fraction: Fraction): Fraction => {
        const divisor = greatestCommonDivisor(fraction.numerator, fraction.denominator);
        return { numerator: fraction.numerator / divisor, denominator: fraction.denominator / divisor };
    };
    const multiply = (fraction: Fraction, numerator: number, denominator: number): Fraction => normalize({
        numerator: fraction.numerator * numerator,
        denominator: fraction.denominator * denominator,
    });
    const greaterThan = (left: Fraction, right: Fraction): boolean => left.numerator * right.denominator > right.numerator * left.denominator;
    const values: Fraction[] = [];
    for (let revealedCoins: number = TAVERN_BANK_PUSH_COIN_COUNT; revealedCoins >= 0; revealedCoins -= 1) {
        const payoutIfCleared = { numerator: TAVERN_BANK_PUSH_COIN_COUNT * TAVERN_BANK_PUSH_COIN_VALUE, denominator: 1 };
        const remainingCoins = TAVERN_BANK_PUSH_COIN_COUNT - revealedCoins;
        const remainingCards = TAVERN_BANK_PUSH_COIN_COUNT + TAVERN_BANK_PUSH_BOMB_COUNT - revealedCoins;
        const drawValue = remainingCoins === 0
            ? payoutIfCleared
            : multiply(values[revealedCoins + 1] || payoutIfCleared, remainingCoins, remainingCards);
        if (revealedCoins === 0) {
            values[revealedCoins] = drawValue;
            continue;
        }
        const cashOut = { numerator: revealedCoins * TAVERN_BANK_PUSH_COIN_VALUE, denominator: 1 };
        values[revealedCoins] = greaterThan(drawValue, cashOut) ? drawValue : cashOut;
    }
    return values[0];
}
