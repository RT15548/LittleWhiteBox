import {
    multiplyTavernBankAmount,
} from '../bank-products';
import {
    drawTavernBankProbabilityBasisPoints,
    type TavernBankRandomSource,
} from '../bank-random';
import {
    throwTavernBankError,
    type TavernBankLadderChoice,
    type TavernBankLadderSuccessStep,
    type TavernBankPrivateLadderGame,
} from '../bank-types';

export const TAVERN_BANK_LADDER_MIN_BET = 30 as const;
export const TAVERN_BANK_LADDER_MAX_BET = 800 as const;
export const TAVERN_BANK_LADDER_BET_STEP = 10 as const;
export const TAVERN_BANK_LADDER_MAX_FLOORS = 5 as const;
export const TAVERN_BANK_LADDER_PAYOUT_CAP = 50_000 as const;

export interface TavernBankLadderOption {
    choice: TavernBankLadderChoice;
    successProbabilityBps: number;
    numerator: number;
    denominator: number;
}

const TAVERN_BANK_LADDER_OPTIONS: readonly TavernBankLadderOption[] = Object.freeze([
    { choice: 'safe', successProbabilityBps: 8_000, numerator: 5, denominator: 4 },
    { choice: 'medium', successProbabilityBps: 5_500, numerator: 20, denominator: 11 },
    { choice: 'risky', successProbabilityBps: 3_000, numerator: 10, denominator: 3 },
]);

export interface CreateTavernBankLadderGameInput {
    id: string;
    bet: number;
    startedAtTurn: number;
    startedAtOrder: number;
    createdAt: number;
}

export type TavernBankLadderTransition =
    | {
        kind: 'continued';
        game: TavernBankPrivateLadderGame;
        success: true;
        step: TavernBankLadderSuccessStep;
    }
    | {
        kind: 'settled';
        outcome: 'cashed-out' | 'failed' | 'cleared' | 'capped';
        payout: number;
        success?: boolean;
        step?: {
            floor: number;
            choice: TavernBankLadderChoice;
            success: boolean;
            amountAfterStep: number;
        };
    };

function assertLadderId(value: unknown): string {
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

export function normalizeTavernBankLadderBet(value: unknown): number {
    const bet = Number(value);
    if (!Number.isSafeInteger(bet) || bet < TAVERN_BANK_LADDER_MIN_BET || bet > TAVERN_BANK_LADDER_MAX_BET
        || bet % TAVERN_BANK_LADDER_BET_STEP !== 0) {
        throwTavernBankError('bank_amount_out_of_range', 'ladder-bet');
    }
    return bet;
}

export function getTavernBankLadderOption(choice: TavernBankLadderChoice): TavernBankLadderOption {
    const option = TAVERN_BANK_LADDER_OPTIONS.find((candidate) => candidate.choice === choice);
    if (!option) {throwTavernBankError('bank_ladder_choice_invalid');}
    return option;
}

export function listTavernBankLadderOptions(): readonly TavernBankLadderOption[] {
    return TAVERN_BANK_LADDER_OPTIONS;
}

export function calculateTavernBankLadderRiskBase(bet: unknown): number {
    return multiplyTavernBankAmount(normalizeTavernBankLadderBet(bet), 9, 10);
}

export function calculateTavernBankLadderSuccessAmount(currentAmount: number, choice: TavernBankLadderChoice): number {
    const option = getTavernBankLadderOption(choice);
    return Math.min(
        TAVERN_BANK_LADDER_PAYOUT_CAP,
        multiplyTavernBankAmount(currentAmount, option.numerator, option.denominator),
    );
}

export function createTavernBankLadderGame(
    input: CreateTavernBankLadderGameInput,
): TavernBankPrivateLadderGame {
    const bet = normalizeTavernBankLadderBet(input.bet);
    const riskBase = calculateTavernBankLadderRiskBase(bet);
    return {
        id: assertLadderId(input.id),
        bet,
        riskBase,
        completedFloors: 0,
        cashoutAmount: riskBase,
        history: [],
        startedAtTurn: assertNonNegativeSafeInteger(input.startedAtTurn, 'ladder-start-turn'),
        startedAtOrder: assertNonNegativeSafeInteger(input.startedAtOrder, 'ladder-start-order'),
        createdAt: assertNonNegativeSafeInteger(input.createdAt, 'ladder-created-at'),
    };
}

function assertActiveLadderGame(game: TavernBankPrivateLadderGame): void {
    if (!game || !Array.isArray(game.history) || !Number.isSafeInteger(game.completedFloors)
        || game.completedFloors < 0 || game.completedFloors >= TAVERN_BANK_LADDER_MAX_FLOORS
        || game.completedFloors !== game.history.length || game.cashoutAmount < 1
        || game.cashoutAmount >= TAVERN_BANK_LADDER_PAYOUT_CAP) {
        throwTavernBankError('bank_game_invalid', 'ladder-game');
    }
}

function copyLadderGame(
    game: TavernBankPrivateLadderGame,
    history: TavernBankLadderSuccessStep[],
    cashoutAmount: number,
): TavernBankPrivateLadderGame {
    return {
        ...game,
        completedFloors: history.length,
        cashoutAmount,
        history,
    };
}

export function stepTavernBankLadderGame(
    game: TavernBankPrivateLadderGame,
    choice: TavernBankLadderChoice,
    random: TavernBankRandomSource,
): TavernBankLadderTransition {
    assertActiveLadderGame(game);
    const option = getTavernBankLadderOption(choice);
    const floor = game.completedFloors + 1;
    const success = drawTavernBankProbabilityBasisPoints(random) < option.successProbabilityBps;
    if (!success) {
        return {
            kind: 'settled',
            outcome: 'failed',
            payout: 0,
            success: false,
            step: { floor, choice, success: false, amountAfterStep: 0 },
        };
    }
    const amountAfterSuccess = calculateTavernBankLadderSuccessAmount(game.cashoutAmount, choice);
    const step: TavernBankLadderSuccessStep = { floor, choice, amountAfterSuccess };
    if (amountAfterSuccess >= TAVERN_BANK_LADDER_PAYOUT_CAP) {
        return {
            kind: 'settled',
            outcome: 'capped',
            payout: amountAfterSuccess,
            success: true,
            step: { ...step, success: true, amountAfterStep: amountAfterSuccess },
        };
    }
    if (floor === TAVERN_BANK_LADDER_MAX_FLOORS) {
        return {
            kind: 'settled',
            outcome: 'cleared',
            payout: amountAfterSuccess,
            success: true,
            step: { ...step, success: true, amountAfterStep: amountAfterSuccess },
        };
    }
    return {
        kind: 'continued',
        game: copyLadderGame(game, [...game.history, step], amountAfterSuccess),
        success: true,
        step,
    };
}

export function cashOutTavernBankLadderGame(
    game: TavernBankPrivateLadderGame,
): Extract<TavernBankLadderTransition, { kind: 'settled' }> {
    assertActiveLadderGame(game);
    if (game.completedFloors < 1) {throwTavernBankError('bank_ladder_cashout_invalid');}
    return {
        kind: 'settled',
        outcome: 'cashed-out',
        payout: game.cashoutAmount,
    };
}
