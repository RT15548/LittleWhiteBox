import type {
    TavernExpectedPhoneBoundary,
} from '../phone-boundary';

export const TAVERN_BANK_CURRENT_MARKER = 'current' as const;

export type TavernBankDieFace = 1 | 2 | 3 | 4 | 5 | 6;
export type TavernBankBidFace = 2 | 3 | 4 | 5 | 6;
export type TavernBankPushCard = 'coin' | 'bomb';
export type TavernBankLadderChoice = 'safe' | 'medium' | 'risky';

export interface TavernBankDepositProduct {
    id: string;
    name: string;
    lockRounds: number;
    interestBps: number;
    earlyPenaltyBps: number;
    minAmount: number;
    maxAmount: number;
}

export interface TavernBankFundProduct {
    id: string;
    name: string;
    description: string;
    lockRounds: number;
    returnRangeBps: {
        min: number;
        max: number;
    };
    riskLevel: 'low' | 'medium' | 'high';
    minAmount: number;
    maxAmount: number;
}

export interface TavernBankDepositPosition {
    id: string;
    productId: string;
    principal: number;
    startTurn: number;
    maturityTurn: number;
    maturityAmount: number;
    earlyWithdrawalAmount: number;
    openedAtOrder: number;
    openedAt: number;
}

export interface TavernBankFundPosition {
    id: string;
    productId: string;
    principal: number;
    startTurn: number;
    maturityTurn: number;
    resolvedReturnBps: number;
    settlementAmount: number;
    openedAtOrder: number;
    openedAt: number;
}

export interface TavernBankDiceBid {
    by: 'player' | 'dealer';
    count: number;
    face: TavernBankBidFace;
}

export interface TavernBankPrivateDiceGame {
    id: string;
    bet: number;
    playerDice: [TavernBankDieFace, TavernBankDieFace, TavernBankDieFace, TavernBankDieFace, TavernBankDieFace];
    dealerDice: [TavernBankDieFace, TavernBankDieFace, TavernBankDieFace, TavernBankDieFace, TavernBankDieFace];
    bids: TavernBankDiceBid[];
    startedAtTurn: number;
    startedAtOrder: number;
    createdAt: number;
}

export interface TavernBankPrivatePushGame {
    id: string;
    bet: 50;
    deck: TavernBankPushCard[];
    drawIndex: number;
    revealedCoins: number;
    cashoutAmount: number;
    startedAtTurn: number;
    startedAtOrder: number;
    createdAt: number;
}

export interface TavernBankLadderSuccessStep {
    floor: number;
    choice: TavernBankLadderChoice;
    amountAfterSuccess: number;
}

export interface TavernBankPrivateLadderGame {
    id: string;
    bet: number;
    riskBase: number;
    completedFloors: number;
    cashoutAmount: number;
    history: TavernBankLadderSuccessStep[];
    startedAtTurn: number;
    startedAtOrder: number;
    createdAt: number;
}

export type TavernBankActiveGame =
    | { kind: 'dice'; game: TavernBankPrivateDiceGame }
    | { kind: 'push'; game: TavernBankPrivatePushGame }
    | { kind: 'ladder'; game: TavernBankPrivateLadderGame };

export interface TavernBankState {
    openDeposits: TavernBankDepositPosition[];
    openInvestments: TavernBankFundPosition[];
    activeGame?: TavernBankActiveGame;
}

export interface TavernBankDiceActivityDetail {
    kind: 'dice';
    result: 'player-win' | 'dealer-win';
    challenger: 'player' | 'dealer';
    finalBid: TavernBankDiceBid;
    bids: TavernBankDiceBid[];
    playerDice: TavernBankPrivateDiceGame['playerDice'];
    dealerDice: TavernBankPrivateDiceGame['dealerDice'];
}

export type TavernBankActivityDetail =
    | {
        kind: 'deposit';
        productId: string;
        outcome: 'matured' | 'withdrawn-early';
    }
    | {
        kind: 'fund';
        productId: string;
        resolvedReturnBps: number;
    }
    | TavernBankDiceActivityDetail
    | {
        kind: 'push';
        outcome: 'cashed-out' | 'busted' | 'cleared';
        revealedCoins: number;
    }
    | {
        kind: 'ladder';
        outcome: 'cashed-out' | 'failed' | 'cleared' | 'capped';
        steps: Array<{
            floor: number;
            choice: TavernBankLadderChoice;
            success: boolean;
            amountAfterStep: number;
        }>;
    };

export interface TavernBankActivityRecord {
    sessionId: string;
    id: string;
    sourceId: string;
    detail: TavernBankActivityDetail;
    amountIn: number;
    payout: number;
    net: number;
    anchorOrder: number;
    createdAt: number;
}

export type TavernBankStateAction =
    | { kind: 'deposit-open'; productId: string; positionId: string; amount: number; settledPositionIds: string[] }
    | { kind: 'deposit-withdraw-early'; positionId: string; settledPositionIds: string[] }
    | { kind: 'fund-open'; productId: string; positionId: string; amount: number; settledPositionIds: string[] }
    | { kind: 'settle-due'; settledPositionIds: string[] }
    | { kind: 'dice-start'; gameId: string; bet: number; settledPositionIds: string[] }
    | { kind: 'dice-bid'; gameId: string; bid: Pick<TavernBankDiceBid, 'count' | 'face'>; settledPositionIds: string[] }
    | { kind: 'dice-challenge'; gameId: string; settledPositionIds: string[] }
    | { kind: 'push-start'; gameId: string; settledPositionIds: string[] }
    | { kind: 'push-draw'; gameId: string; settledPositionIds: string[] }
    | { kind: 'push-cash-out'; gameId: string; settledPositionIds: string[] }
    | { kind: 'ladder-start'; gameId: string; bet: number; settledPositionIds: string[] }
    | { kind: 'ladder-step'; gameId: string; choice: TavernBankLadderChoice; settledPositionIds: string[] }
    | { kind: 'ladder-cash-out'; gameId: string; settledPositionIds: string[] };

export interface TavernBankStateVersionRecord {
    sessionId: string;
    revision: number;
    versionId: string;
    currentMarker?: typeof TAVERN_BANK_CURRENT_MARKER;
    actionId: string;
    action: TavernBankStateAction;
    anchorOrder: number;
    turn: number;
    state: TavernBankState;
    createdAt: number;
    updatedAt: number;
}

export interface TavernBankDepositView {
    id: string;
    productId: string;
    name: string;
    principal: number;
    startTurn: number;
    maturityTurn: number;
    remainingRounds: number;
    maturityAmount: number;
    earlyWithdrawalAmount: number;
}

export interface TavernBankFundView {
    id: string;
    productId: string;
    name: string;
    description: string;
    riskLevel: TavernBankFundProduct['riskLevel'];
    principal: number;
    startTurn: number;
    maturityTurn: number;
    remainingRounds: number;
}

export interface TavernBankDiceGameView {
    kind: 'dice';
    id: string;
    bet: number;
    playerDice: TavernBankPrivateDiceGame['playerDice'];
    bids: TavernBankDiceBid[];
}

export interface TavernBankPushGameView {
    kind: 'push';
    id: string;
    bet: 50;
    revealedCoins: number;
    cashoutAmount: number;
    remainingCards: number;
    remainingBombs: number;
    nextBombProbabilityBps: number;
}

export interface TavernBankLadderGameView {
    kind: 'ladder';
    id: string;
    bet: number;
    completedFloors: number;
    cashoutAmount: number;
    canCashOut: boolean;
    history: TavernBankLadderSuccessStep[];
    nextChoices: Array<{
        choice: TavernBankLadderChoice;
        successProbabilityBps: number;
        successAmount: number;
    }>;
}

export type TavernBankPublicGameView = TavernBankDiceGameView | TavernBankPushGameView | TavernBankLadderGameView;

export interface TavernBankView {
    revision: number;
    versionId: string;
    currentTurn: number;
    deposits: TavernBankDepositView[];
    investments: TavernBankFundView[];
    activeGame?: TavernBankPublicGameView;
}

export interface TavernBankMutationBoundary {
    sessionId: string;
    boundary: TavernExpectedPhoneBoundary;
    actionId: string;
    expectedRevision: number;
    expectedVersionId: string;
}

export interface OpenTavernBankDepositInput extends TavernBankMutationBoundary {
    productId: string;
    amount: number;
}

export interface WithdrawTavernBankDepositEarlyInput extends TavernBankMutationBoundary {
    positionId: string;
}

export interface OpenTavernBankFundInput extends TavernBankMutationBoundary {
    productId: string;
    amount: number;
}

export interface SettleDueTavernBankPositionsInput extends TavernBankMutationBoundary {}

export interface StartTavernBankDiceGameInput extends TavernBankMutationBoundary {
    bet: number;
}

export interface BidTavernBankDiceGameInput extends TavernBankMutationBoundary {
    gameId: string;
    bid: {
        count: unknown;
        face: unknown;
    };
}

export interface ChallengeTavernBankDiceGameInput extends TavernBankMutationBoundary {
    gameId: string;
}

export interface StartTavernBankPushGameInput extends TavernBankMutationBoundary {}

export interface DrawTavernBankPushCardInput extends TavernBankMutationBoundary {
    gameId: string;
}

export interface CashOutTavernBankPushGameInput extends TavernBankMutationBoundary {
    gameId: string;
}

export interface StartTavernBankLadderGameInput extends TavernBankMutationBoundary {
    bet: number;
}

export interface StepTavernBankLadderGameInput extends TavernBankMutationBoundary {
    gameId: string;
    choice: TavernBankLadderChoice;
}

export interface CashOutTavernBankLadderGameInput extends TavernBankMutationBoundary {
    gameId: string;
}

export interface TavernBankMutationResult {
    record: TavernBankStateVersionReceipt | null;
    actionRecord: TavernBankStateVersionReceipt | null;
    playerBalance: number;
    activities: TavernBankActivityRecord[];
    replay: boolean;
    changed: boolean;
}

/**
 * Controller-safe version metadata. Private Bank state never crosses the
 * service boundary through a mutation result.
 */
export interface TavernBankStateVersionReceipt {
    sessionId: string;
    revision: number;
    versionId: string;
    actionId: string;
    action: TavernBankStateAction;
    anchorOrder: number;
    turn: number;
    createdAt: number;
    updatedAt: number;
}

export interface TavernBankRestoreImpact {
    changed: boolean;
    targetFloor: number;
    deletedVersionCount: number;
    deletedActivityCount: number;
    affectedPositionCount: number;
    activeGameAffected: boolean;
}

export type TavernBankErrorCode =
    | 'bank_session_required'
    | 'bank_session_missing'
    | 'bank_action_required'
    | 'bank_action_conflict'
    | 'bank_revision_invalid'
    | 'bank_revision_conflict'
    | 'bank_version_id_invalid'
    | 'bank_version_conflict'
    | 'bank_anchor_order_invalid'
    | 'bank_anchor_order_regression'
    | 'bank_turn_regression'
    | 'bank_product_id_required'
    | 'bank_product_missing'
    | 'bank_product_invalid'
    | 'bank_amount_invalid'
    | 'bank_amount_out_of_range'
    | 'bank_amount_overflow'
    | 'bank_random_invalid'
    | 'bank_random_exhausted'
    | 'bank_game_id_required'
    | 'bank_game_active'
    | 'bank_game_missing'
    | 'bank_game_invalid'
    | 'bank_game_action_invalid'
    | 'bank_game_kind_conflict'
    | 'bank_dice_bid_invalid'
    | 'bank_dice_bid_not_higher'
    | 'bank_dice_challenge_invalid'
    | 'bank_push_cashout_invalid'
    | 'bank_ladder_cashout_invalid'
    | 'bank_ladder_choice_invalid'
    | 'bank_state_invalid'
    | 'bank_activity_invalid';

export class TavernBankError extends Error {
    readonly code: TavernBankErrorCode;

    constructor(code: TavernBankErrorCode, detail = '') {
        super(detail ? `${code}:${detail}` : code);
        this.name = 'TavernBankError';
        this.code = code;
    }
}

export function throwTavernBankError(code: TavernBankErrorCode, detail = ''): never {
    throw new TavernBankError(code, detail);
}
