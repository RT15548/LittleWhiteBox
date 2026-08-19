import {
    multiplyTavernBankAmount,
} from '../bank-products';
import {
    drawTavernBankInclusiveInteger,
    rollTavernBankDie,
    type TavernBankRandomSource,
} from '../bank-random';
import {
    throwTavernBankError,
    type TavernBankBidFace,
    type TavernBankDiceBid,
    type TavernBankDieFace,
    type TavernBankPrivateDiceGame,
} from '../bank-types';

export const TAVERN_BANK_DICE_MIN_BET = 50 as const;
export const TAVERN_BANK_DICE_MAX_BET = 500 as const;
export const TAVERN_BANK_DICE_BET_STEP = 10 as const;
export const TAVERN_BANK_DICE_PAYOUT_NUMERATOR = 19 as const;
export const TAVERN_BANK_DICE_PAYOUT_DENOMINATOR = 10 as const;

export interface CreateTavernBankDiceGameInput {
    id: string;
    bet: number;
    startedAtTurn: number;
    startedAtOrder: number;
    createdAt: number;
}

export interface TavernBankDiceSettlement {
    result: 'player-win' | 'dealer-win';
    challenger: 'player' | 'dealer';
    finalBid: TavernBankDiceBid;
    matchingDiceCount: number;
    payout: number;
}

export type TavernBankDiceDealerResponse =
    | {
        kind: 'dealer-bid';
        game: TavernBankPrivateDiceGame;
        probability: number;
        dealerBid: TavernBankDiceBid;
    }
    | {
        kind: 'settled';
        settlement: TavernBankDiceSettlement;
    };

function assertDiceGameId(value: unknown): string {
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

export function normalizeTavernBankDiceBet(value: unknown): number {
    const bet = Number(value);
    if (!Number.isSafeInteger(bet) || bet < TAVERN_BANK_DICE_MIN_BET || bet > TAVERN_BANK_DICE_MAX_BET
        || bet % TAVERN_BANK_DICE_BET_STEP !== 0) {
        throwTavernBankError('bank_amount_out_of_range', 'dice-bet');
    }
    return bet;
}

export function normalizeTavernBankDiceBid(value: unknown, by: TavernBankDiceBid['by']): TavernBankDiceBid {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throwTavernBankError('bank_dice_bid_invalid');
    }
    const raw = value as Record<string, unknown>;
    const count = Number(raw.count);
    const face = Number(raw.face);
    if (!Number.isSafeInteger(count) || count < 1 || count > 10
        || !Number.isSafeInteger(face) || face < 2 || face > 6) {
        throwTavernBankError('bank_dice_bid_invalid');
    }
    return { by, count, face: face as TavernBankBidFace };
}

export function isTavernBankDiceBidHigher(next: Pick<TavernBankDiceBid, 'count' | 'face'>, current: Pick<TavernBankDiceBid, 'count' | 'face'>): boolean {
    return next.count > current.count || (next.count === current.count && next.face > current.face);
}

export function listTavernBankLegalDiceBids(current?: Pick<TavernBankDiceBid, 'count' | 'face'>): Array<Pick<TavernBankDiceBid, 'count' | 'face'>> {
    const bids: Array<Pick<TavernBankDiceBid, 'count' | 'face'>> = [];
    for (let count = 1; count <= 10; count += 1) {
        for (let face = 2; face <= 6; face += 1) {
            const bid = { count, face: face as TavernBankBidFace };
            if (!current || isTavernBankDiceBidHigher(bid, current)) {bids.push(bid);}
        }
    }
    return bids;
}

export function countTavernBankDiceMatches(
    dice: readonly TavernBankDieFace[],
    face: TavernBankBidFace,
): number {
    return dice.filter((die) => die === 1 || die === face).length;
}

export function countTavernBankDiceBidMatches(
    game: Pick<TavernBankPrivateDiceGame, 'playerDice' | 'dealerDice'>,
    bid: Pick<TavernBankDiceBid, 'face'>,
): number {
    return countTavernBankDiceMatches(game.playerDice, bid.face)
        + countTavernBankDiceMatches(game.dealerDice, bid.face);
}

function binomialCoefficient(n: number, k: number): number {
    const selected = Math.min(k, n - k);
    let result = 1;
    for (let index = 1; index <= selected; index += 1) {
        result = (result * (n - selected + index)) / index;
    }
    return result;
}

/** Exact binomial tail for the five unknown dice used by the dealer. */
export function tavernBankBinomialAtLeastProbability(
    trials: number,
    hitProbability: number,
    minimumHits: number,
): number {
    if (!Number.isSafeInteger(trials) || trials < 0 || !Number.isFinite(hitProbability)
        || hitProbability < 0 || hitProbability > 1 || !Number.isSafeInteger(minimumHits)) {
        throwTavernBankError('bank_game_invalid', 'binomial');
    }
    if (minimumHits <= 0) {return 1;}
    if (minimumHits > trials) {return 0;}
    let probability = 0;
    for (let hits = minimumHits; hits <= trials; hits += 1) {
        probability += binomialCoefficient(trials, hits)
            * (hitProbability ** hits)
            * ((1 - hitProbability) ** (trials - hits));
    }
    return probability;
}

export function getTavernBankDiceBidProbabilityForDealer(
    dealerDice: TavernBankPrivateDiceGame['dealerDice'],
    bid: Pick<TavernBankDiceBid, 'count' | 'face'>,
): number {
    const normalized = normalizeTavernBankDiceBid(bid, 'player');
    const knownMatches = countTavernBankDiceMatches(dealerDice, normalized.face);
    return tavernBankBinomialAtLeastProbability(5, 1 / 3, normalized.count - knownMatches);
}

export function createTavernBankDiceGame(
    input: CreateTavernBankDiceGameInput,
    random: TavernBankRandomSource,
): TavernBankPrivateDiceGame {
    const id = assertDiceGameId(input.id);
    const bet = normalizeTavernBankDiceBet(input.bet);
    const startedAtTurn = assertNonNegativeSafeInteger(input.startedAtTurn, 'dice-start-turn');
    const startedAtOrder = assertNonNegativeSafeInteger(input.startedAtOrder, 'dice-start-order');
    const createdAt = assertNonNegativeSafeInteger(input.createdAt, 'dice-created-at');
    const playerDice = Array.from({ length: 5 }, () => rollTavernBankDie(random)) as TavernBankPrivateDiceGame['playerDice'];
    const dealerDice = Array.from({ length: 5 }, () => rollTavernBankDie(random)) as TavernBankPrivateDiceGame['dealerDice'];
    return {
        id,
        bet,
        playerDice,
        dealerDice,
        bids: [],
        startedAtTurn,
        startedAtOrder,
        createdAt,
    };
}

function assertDiceGameWaitingForPlayer(game: TavernBankPrivateDiceGame): void {
    if (!game || !Array.isArray(game.bids)) {throwTavernBankError('bank_game_invalid', 'dice-game');}
    if (game.bids.length === 0) {return;}
    if (game.bids.length % 2 !== 0 || game.bids.at(-1)?.by !== 'dealer') {
        throwTavernBankError('bank_game_action_invalid', 'dice-turn');
    }
}

function copyDiceGame(game: TavernBankPrivateDiceGame, bids: TavernBankDiceBid[]): TavernBankPrivateDiceGame {
    return {
        ...game,
        playerDice: [...game.playerDice] as TavernBankPrivateDiceGame['playerDice'],
        dealerDice: [...game.dealerDice] as TavernBankPrivateDiceGame['dealerDice'],
        bids,
    };
}

function dealerBidCandidates(
    current: TavernBankDiceBid,
    dealerDice: TavernBankPrivateDiceGame['dealerDice'],
): TavernBankDiceBid[] {
    const legal = listTavernBankLegalDiceBids(current)
        .filter((bid) => bid.count <= current.count + 1)
        .map((bid) => ({ ...bid, by: 'dealer' as const }));
    return legal.sort((left, right) => {
        const leftMatches = countTavernBankDiceMatches(dealerDice, left.face);
        const rightMatches = countTavernBankDiceMatches(dealerDice, right.face);
        if (rightMatches !== leftMatches) {return rightMatches - leftMatches;}
        if (left.count !== right.count) {return left.count - right.count;}
        return right.face - left.face;
    });
}

function createDiceSettlement(
    game: TavernBankPrivateDiceGame,
    challenger: TavernBankDiceSettlement['challenger'],
): TavernBankDiceSettlement {
    const finalBid = game.bids.at(-1);
    if (!finalBid) {throwTavernBankError('bank_dice_challenge_invalid', 'no-bid');}
    const matchingDiceCount = countTavernBankDiceBidMatches(game, finalBid);
    const bidHolds = matchingDiceCount >= finalBid.count;
    const bidder = finalBid.by;
    const winner = bidHolds ? bidder : (bidder === 'player' ? 'dealer' : 'player');
    return {
        result: winner === 'player' ? 'player-win' : 'dealer-win',
        challenger,
        finalBid: { ...finalBid },
        matchingDiceCount,
        payout: winner === 'player' ? multiplyTavernBankAmount(game.bet, TAVERN_BANK_DICE_PAYOUT_NUMERATOR, TAVERN_BANK_DICE_PAYOUT_DENOMINATOR) : 0,
    };
}

export function challengeTavernBankDiceGame(
    game: TavernBankPrivateDiceGame,
    challenger: TavernBankDiceSettlement['challenger'],
): TavernBankDiceSettlement {
    assertDiceGameWaitingForPlayer(game);
    const finalBid = game.bids.at(-1);
    if (!finalBid || finalBid.by === challenger) {
        throwTavernBankError('bank_dice_challenge_invalid');
    }
    return createDiceSettlement(game, challenger);
}

/**
 * Applies the player's bid and the dealer's complete response as one pure
 * transition. A retained game consequently always waits for the player.
 */
export function respondToTavernBankDicePlayerBid(
    game: TavernBankPrivateDiceGame,
    rawBid: { count: unknown; face: unknown },
    random: TavernBankRandomSource,
): TavernBankDiceDealerResponse {
    assertDiceGameWaitingForPlayer(game);
    const playerBid = normalizeTavernBankDiceBid(rawBid, 'player');
    const previousBid = game.bids.at(-1);
    if (previousBid && !isTavernBankDiceBidHigher(playerBid, previousBid)) {
        throwTavernBankError('bank_dice_bid_not_higher');
    }
    const afterPlayerBid = copyDiceGame(game, [...game.bids, playerBid]);
    const probability = getTavernBankDiceBidProbabilityForDealer(afterPlayerBid.dealerDice, playerBid);
    const candidates = dealerBidCandidates(playerBid, afterPlayerBid.dealerDice);
    const shouldChallenge = probability < 0.25 || candidates.length === 0
        || (probability <= 0.55 && drawTavernBankInclusiveInteger(0, 9, random) >= 3);
    if (shouldChallenge) {
        return {
            kind: 'settled',
            settlement: createDiceSettlement(afterPlayerBid, 'dealer'),
        };
    }
    const dealerBid = candidates[0];
    return {
        kind: 'dealer-bid',
        game: copyDiceGame(afterPlayerBid, [...afterPlayerBid.bids, dealerBid]),
        probability,
        dealerBid: { ...dealerBid },
    };
}
