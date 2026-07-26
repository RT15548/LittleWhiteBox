import {
    createTavernBankDepositContract,
    createTavernBankFundContract,
    findTavernBankDepositContract,
    findTavernBankFundContract,
} from './bank-products';
import {
    countTavernBankDiceBidMatches,
    isTavernBankDiceBidHigher,
    normalizeTavernBankDiceBet,
} from './games/dice-bluff';
import {
    TAVERN_BANK_PUSH_BET,
    TAVERN_BANK_PUSH_BOMB_COUNT,
    TAVERN_BANK_PUSH_COIN_COUNT,
    TAVERN_BANK_PUSH_COIN_VALUE,
} from './games/push-your-luck';
import {
    calculateTavernBankLadderRiskBase,
    calculateTavernBankLadderSuccessAmount,
    normalizeTavernBankLadderBet,
    TAVERN_BANK_LADDER_MAX_FLOORS,
    TAVERN_BANK_LADDER_PAYOUT_CAP,
} from './games/risk-ladder';
import {
    TAVERN_BANK_CURRENT_MARKER,
    throwTavernBankError,
    type TavernBankActivityRecord,
    type TavernBankDiceBid,
    type TavernBankDieFace,
    type TavernBankLadderChoice,
    type TavernBankPrivateDiceGame,
    type TavernBankState,
    type TavernBankStateAction,
    type TavernBankStateVersionRecord,
} from './bank-types';

export type TavernBankInvariantViolationCode =
    | 'state-shape-invalid'
    | 'position-id-duplicate'
    | 'position-invalid'
    | 'active-game-invalid'
    | 'activity-invalid';

export interface TavernBankInvariantViolation {
    code: TavernBankInvariantViolationCode;
    detail: string;
}

function violation(code: TavernBankInvariantViolationCode, detail: string): TavernBankInvariantViolation {
    return { code, detail };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && Boolean(value.trim());
}

function isSafeIntegerAtLeast(value: unknown, minimum: number): value is number {
    return Number.isSafeInteger(value) && Number(value) >= minimum;
}

function isDieFace(value: unknown): value is TavernBankDieFace {
    return Number.isSafeInteger(value) && Number(value) >= 1 && Number(value) <= 6;
}

function isDiceTuple(value: unknown): value is TavernBankPrivateDiceGame['playerDice'] {
    return Array.isArray(value) && value.length === 5 && value.every(isDieFace);
}

function isBid(value: unknown): value is TavernBankDiceBid {
    return isRecord(value)
        && (value.by === 'player' || value.by === 'dealer')
        && isSafeIntegerAtLeast(value.count, 1) && Number(value.count) <= 10
        && isSafeIntegerAtLeast(value.face, 2) && Number(value.face) <= 6;
}

function isLadderChoice(value: unknown): value is TavernBankLadderChoice {
    return value === 'safe' || value === 'medium' || value === 'risky';
}

function cloneCanonical<T>(value: T): T {
    if (typeof structuredClone === 'function') {return structuredClone(value);}
    return JSON.parse(JSON.stringify(value)) as T;
}

function assertCanonicalObject(
    value: unknown,
    keys: readonly string[],
    detail: string,
): Record<string, unknown> {
    if (!isRecord(value)) {throwTavernBankError('bank_state_invalid', `${detail}.shape`);}
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
        throwTavernBankError('bank_state_invalid', `${detail}.prototype`);
    }
    const actual = Object.keys(value).sort();
    const expected = [...keys].sort();
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
        throwTavernBankError('bank_state_invalid', `${detail}.keys`);
    }
    return value;
}

function assertCanonicalString(value: unknown, detail: string): string {
    if (typeof value !== 'string' || !value || value !== value.trim()) {
        throwTavernBankError('bank_state_invalid', detail);
    }
    return value;
}

function assertCanonicalInteger(value: unknown, minimum: number, detail: string): number {
    if (!Number.isSafeInteger(value) || Number(value) < minimum) {
        throwTavernBankError('bank_state_invalid', detail);
    }
    return Number(value);
}

function assertCanonicalStringArray(value: unknown, detail: string): string[] {
    if (!Array.isArray(value)) {throwTavernBankError('bank_state_invalid', `${detail}.shape`);}
    const result = value.map((entry, index) => assertCanonicalString(entry, `${detail}.${index}`));
    if (new Set(result).size !== result.length) {
        throwTavernBankError('bank_state_invalid', `${detail}.duplicate`);
    }
    return result;
}

function assertCanonicalDiceTuple(value: unknown, detail: string): void {
    if (!Array.isArray(value) || value.length !== 5 || value.some((face) => (
        !Number.isSafeInteger(face) || Number(face) < 1 || Number(face) > 6
    ))) {
        throwTavernBankError('bank_state_invalid', detail);
    }
}

function assertCanonicalBidShape(value: unknown, detail: string): void {
    const bid = assertCanonicalObject(value, ['by', 'count', 'face'], detail);
    if (bid.by !== 'player' && bid.by !== 'dealer') {
        throwTavernBankError('bank_state_invalid', `${detail}.by`);
    }
    const count = assertCanonicalInteger(bid.count, 1, `${detail}.count`);
    const face = assertCanonicalInteger(bid.face, 2, `${detail}.face`);
    if (count > 10 || face > 6) {throwTavernBankError('bank_state_invalid', detail);}
}

function assertCanonicalPlayerBidShape(value: unknown, detail: string): void {
    const bid = assertCanonicalObject(value, ['count', 'face'], detail);
    const count = assertCanonicalInteger(bid.count, 1, `${detail}.count`);
    const face = assertCanonicalInteger(bid.face, 2, `${detail}.face`);
    if (count > 10 || face > 6) {throwTavernBankError('bank_state_invalid', detail);}
}

function assertCanonicalPositionShape(value: unknown, kind: 'deposit' | 'fund', detail: string): void {
    const keys = kind === 'deposit'
        ? ['id', 'productId', 'principal', 'startTurn', 'maturityTurn', 'maturityAmount', 'earlyWithdrawalAmount', 'openedAtOrder', 'openedAt']
        : ['id', 'productId', 'principal', 'startTurn', 'maturityTurn', 'resolvedReturnBps', 'settlementAmount', 'openedAtOrder', 'openedAt'];
    const position = assertCanonicalObject(value, keys, detail);
    assertCanonicalString(position.id, `${detail}.id`);
    assertCanonicalString(position.productId, `${detail}.productId`);
    assertCanonicalInteger(position.principal, 1, `${detail}.principal`);
    assertCanonicalInteger(position.startTurn, 0, `${detail}.startTurn`);
    assertCanonicalInteger(position.maturityTurn, 0, `${detail}.maturityTurn`);
    assertCanonicalInteger(position.openedAtOrder, 0, `${detail}.openedAtOrder`);
    assertCanonicalInteger(position.openedAt, 0, `${detail}.openedAt`);
    if (kind === 'deposit') {
        assertCanonicalInteger(position.maturityAmount, 0, `${detail}.maturityAmount`);
        assertCanonicalInteger(position.earlyWithdrawalAmount, 0, `${detail}.earlyWithdrawalAmount`);
    } else {
        if (!Number.isSafeInteger(position.resolvedReturnBps)) {
            throwTavernBankError('bank_state_invalid', `${detail}.resolvedReturnBps`);
        }
        assertCanonicalInteger(position.settlementAmount, 0, `${detail}.settlementAmount`);
    }
}

function assertCanonicalPrivateGameShape(value: unknown, kind: 'dice' | 'push' | 'ladder', detail: string): void {
    if (kind === 'dice') {
        const game = assertCanonicalObject(value, [
            'id', 'bet', 'playerDice', 'dealerDice', 'bids', 'startedAtTurn', 'startedAtOrder', 'createdAt',
        ], detail);
        assertCanonicalString(game.id, `${detail}.id`);
        assertCanonicalInteger(game.bet, 1, `${detail}.bet`);
        assertCanonicalDiceTuple(game.playerDice, `${detail}.playerDice`);
        assertCanonicalDiceTuple(game.dealerDice, `${detail}.dealerDice`);
        if (!Array.isArray(game.bids)) {throwTavernBankError('bank_state_invalid', `${detail}.bids`);}
        game.bids.forEach((bid, index) => assertCanonicalBidShape(bid, `${detail}.bids.${index}`));
        assertCanonicalInteger(game.startedAtTurn, 0, `${detail}.startedAtTurn`);
        assertCanonicalInteger(game.startedAtOrder, 0, `${detail}.startedAtOrder`);
        assertCanonicalInteger(game.createdAt, 0, `${detail}.createdAt`);
        return;
    }
    if (kind === 'push') {
        const game = assertCanonicalObject(value, [
            'id', 'bet', 'deck', 'drawIndex', 'revealedCoins', 'cashoutAmount', 'startedAtTurn', 'startedAtOrder', 'createdAt',
        ], detail);
        assertCanonicalString(game.id, `${detail}.id`);
        assertCanonicalInteger(game.bet, 1, `${detail}.bet`);
        if (!Array.isArray(game.deck) || game.deck.some((card) => card !== 'coin' && card !== 'bomb')) {
            throwTavernBankError('bank_state_invalid', `${detail}.deck`);
        }
        assertCanonicalInteger(game.drawIndex, 0, `${detail}.drawIndex`);
        assertCanonicalInteger(game.revealedCoins, 0, `${detail}.revealedCoins`);
        assertCanonicalInteger(game.cashoutAmount, 0, `${detail}.cashoutAmount`);
        assertCanonicalInteger(game.startedAtTurn, 0, `${detail}.startedAtTurn`);
        assertCanonicalInteger(game.startedAtOrder, 0, `${detail}.startedAtOrder`);
        assertCanonicalInteger(game.createdAt, 0, `${detail}.createdAt`);
        return;
    }
    const game = assertCanonicalObject(value, [
        'id', 'bet', 'riskBase', 'completedFloors', 'cashoutAmount', 'history', 'startedAtTurn', 'startedAtOrder', 'createdAt',
    ], detail);
    assertCanonicalString(game.id, `${detail}.id`);
    assertCanonicalInteger(game.bet, 1, `${detail}.bet`);
    assertCanonicalInteger(game.riskBase, 1, `${detail}.riskBase`);
    assertCanonicalInteger(game.completedFloors, 0, `${detail}.completedFloors`);
    assertCanonicalInteger(game.cashoutAmount, 1, `${detail}.cashoutAmount`);
    if (!Array.isArray(game.history)) {throwTavernBankError('bank_state_invalid', `${detail}.history`);}
    game.history.forEach((step, index) => {
        const row = assertCanonicalObject(step, ['floor', 'choice', 'amountAfterSuccess'], `${detail}.history.${index}`);
        assertCanonicalInteger(row.floor, 1, `${detail}.history.${index}.floor`);
        if (!isLadderChoice(row.choice)) {throwTavernBankError('bank_state_invalid', `${detail}.history.${index}.choice`);}
        assertCanonicalInteger(row.amountAfterSuccess, 1, `${detail}.history.${index}.amountAfterSuccess`);
    });
    assertCanonicalInteger(game.startedAtTurn, 0, `${detail}.startedAtTurn`);
    assertCanonicalInteger(game.startedAtOrder, 0, `${detail}.startedAtOrder`);
    assertCanonicalInteger(game.createdAt, 0, `${detail}.createdAt`);
}

function assertCanonicalStateShape(value: unknown): void {
    const source = isRecord(value) ? value : {};
    const keys = ['openDeposits', 'openInvestments', ...(source.activeGame !== undefined ? ['activeGame'] : [])];
    const state = assertCanonicalObject(value, keys, 'state');
    if (!Array.isArray(state.openDeposits) || !Array.isArray(state.openInvestments)) {
        throwTavernBankError('bank_state_invalid', 'state.positions');
    }
    state.openDeposits.forEach((position, index) => assertCanonicalPositionShape(position, 'deposit', `state.openDeposits.${index}`));
    state.openInvestments.forEach((position, index) => assertCanonicalPositionShape(position, 'fund', `state.openInvestments.${index}`));
    if (state.activeGame !== undefined) {
        const active = assertCanonicalObject(state.activeGame, ['kind', 'game'], 'state.activeGame');
        if (active.kind !== 'dice' && active.kind !== 'push' && active.kind !== 'ladder') {
            throwTavernBankError('bank_state_invalid', 'state.activeGame.kind');
        }
        assertCanonicalPrivateGameShape(active.game, active.kind, 'state.activeGame.game');
    }
}

function assertCanonicalActionShape(value: unknown): void {
    const source = isRecord(value) ? value : {};
    const kind = String(source.kind || '') as TavernBankStateAction['kind'];
    const base = ['kind', 'settledPositionIds'];
    const keysByKind: Record<TavernBankStateAction['kind'], string[]> = {
        'deposit-open': [...base, 'productId', 'positionId', 'amount'],
        'deposit-withdraw-early': [...base, 'positionId'],
        'fund-open': [...base, 'productId', 'positionId', 'amount'],
        'settle-due': base,
        'dice-start': [...base, 'gameId', 'bet'],
        'dice-bid': [...base, 'gameId', 'bid'],
        'dice-challenge': [...base, 'gameId'],
        'push-start': [...base, 'gameId'],
        'push-draw': [...base, 'gameId'],
        'push-cash-out': [...base, 'gameId'],
        'ladder-start': [...base, 'gameId', 'bet'],
        'ladder-step': [...base, 'gameId', 'choice'],
        'ladder-cash-out': [...base, 'gameId'],
    };
    const keys = keysByKind[kind];
    if (!keys) {throwTavernBankError('bank_state_invalid', 'action.kind');}
    const action = assertCanonicalObject(value, keys, 'action');
    assertCanonicalStringArray(action.settledPositionIds, 'action.settledPositionIds');
    if ('productId' in action) {assertCanonicalString(action.productId, 'action.productId');}
    if ('positionId' in action) {assertCanonicalString(action.positionId, 'action.positionId');}
    if ('gameId' in action) {assertCanonicalString(action.gameId, 'action.gameId');}
    if ('amount' in action) {assertCanonicalInteger(action.amount, 1, 'action.amount');}
    if ('bet' in action) {assertCanonicalInteger(action.bet, 1, 'action.bet');}
    if ('bid' in action) {assertCanonicalPlayerBidShape(action.bid, 'action.bid');}
    if ('choice' in action && !isLadderChoice(action.choice)) {
        throwTavernBankError('bank_state_invalid', 'action.choice');
    }
}

function assertCanonicalActivityDetailShape(value: unknown): void {
    const source = isRecord(value) ? value : {};
    if (source.kind === 'deposit') {
        const detail = assertCanonicalObject(value, ['kind', 'productId', 'outcome'], 'activity.detail');
        assertCanonicalString(detail.productId, 'activity.detail.productId');
        if (detail.outcome !== 'matured' && detail.outcome !== 'withdrawn-early') {
            throwTavernBankError('bank_activity_invalid', 'activity.detail.outcome');
        }
        return;
    }
    if (source.kind === 'fund') {
        const detail = assertCanonicalObject(value, ['kind', 'productId', 'resolvedReturnBps'], 'activity.detail');
        assertCanonicalString(detail.productId, 'activity.detail.productId');
        if (!Number.isSafeInteger(detail.resolvedReturnBps)) {
            throwTavernBankError('bank_activity_invalid', 'activity.detail.resolvedReturnBps');
        }
        return;
    }
    if (source.kind === 'dice') {
        const detail = assertCanonicalObject(value, [
            'kind', 'result', 'challenger', 'finalBid', 'bids', 'playerDice', 'dealerDice',
        ], 'activity.detail');
        if (detail.result !== 'player-win' && detail.result !== 'dealer-win') {
            throwTavernBankError('bank_activity_invalid', 'activity.detail.result');
        }
        if (detail.challenger !== 'player' && detail.challenger !== 'dealer') {
            throwTavernBankError('bank_activity_invalid', 'activity.detail.challenger');
        }
        assertCanonicalBidShape(detail.finalBid, 'activity.detail.finalBid');
        if (!Array.isArray(detail.bids)) {throwTavernBankError('bank_activity_invalid', 'activity.detail.bids');}
        detail.bids.forEach((bid, index) => assertCanonicalBidShape(bid, `activity.detail.bids.${index}`));
        assertCanonicalDiceTuple(detail.playerDice, 'activity.detail.playerDice');
        assertCanonicalDiceTuple(detail.dealerDice, 'activity.detail.dealerDice');
        return;
    }
    if (source.kind === 'push') {
        const detail = assertCanonicalObject(value, ['kind', 'outcome', 'revealedCoins'], 'activity.detail');
        if (!['cashed-out', 'busted', 'cleared'].includes(String(detail.outcome))) {
            throwTavernBankError('bank_activity_invalid', 'activity.detail.outcome');
        }
        assertCanonicalInteger(detail.revealedCoins, 0, 'activity.detail.revealedCoins');
        return;
    }
    if (source.kind === 'ladder') {
        const detail = assertCanonicalObject(value, ['kind', 'outcome', 'steps'], 'activity.detail');
        if (!['cashed-out', 'failed', 'cleared', 'capped'].includes(String(detail.outcome)) || !Array.isArray(detail.steps)) {
            throwTavernBankError('bank_activity_invalid', 'activity.detail.ladder');
        }
        detail.steps.forEach((step, index) => {
            const row = assertCanonicalObject(step, ['floor', 'choice', 'success', 'amountAfterStep'], `activity.detail.steps.${index}`);
            assertCanonicalInteger(row.floor, 1, `activity.detail.steps.${index}.floor`);
            if (!isLadderChoice(row.choice) || typeof row.success !== 'boolean') {
                throwTavernBankError('bank_activity_invalid', `activity.detail.steps.${index}`);
            }
            assertCanonicalInteger(row.amountAfterStep, 0, `activity.detail.steps.${index}.amountAfterStep`);
        });
        return;
    }
    throwTavernBankError('bank_activity_invalid', 'activity.detail.kind');
}

function positionMetadataIsCanonical(position: Record<string, unknown>): boolean {
    return isNonEmptyString(position.id)
        && isSafeIntegerAtLeast(position.startTurn, 0)
        && isSafeIntegerAtLeast(position.openedAtOrder, 0)
        && isSafeIntegerAtLeast(position.openedAt, 0)
        && isSafeIntegerAtLeast(position.principal, 1);
}

function validateDepositPosition(position: unknown): string | null {
    if (!isRecord(position) || !positionMetadataIsCanonical(position) || !isNonEmptyString(position.productId)) {
        return 'deposit:shape';
    }
    const product = findTavernBankDepositContract(position.productId);
    if (!product) {return `deposit:${position.productId}:product`;}
    try {
        const contract = createTavernBankDepositContract(product, position.principal);
        if (position.maturityTurn !== Number(position.startTurn) + product.lockRounds
            || position.maturityAmount !== contract.maturityAmount
            || position.earlyWithdrawalAmount !== contract.earlyWithdrawalAmount) {
            return `deposit:${position.id}:contract`;
        }
    } catch {
        return `deposit:${position.id}:amount`;
    }
    return null;
}

function validateFundPosition(position: unknown): string | null {
    if (!isRecord(position) || !positionMetadataIsCanonical(position) || !isNonEmptyString(position.productId)) {
        return 'fund:shape';
    }
    const product = findTavernBankFundContract(position.productId);
    if (!product) {return `fund:${position.productId}:product`;}
    if (!Number.isSafeInteger(position.resolvedReturnBps)) {return `fund:${position.id}:return`;}
    try {
        const contract = createTavernBankFundContract(product, position.principal, position.resolvedReturnBps);
        if (position.maturityTurn !== Number(position.startTurn) + product.lockRounds
            || position.settlementAmount !== contract.settlementAmount) {
            return `fund:${position.id}:contract`;
        }
    } catch {
        return `fund:${position.id}:amount`;
    }
    return null;
}

function validateDiceGame(game: unknown): string | null {
    if (!isRecord(game) || !isNonEmptyString(game.id) || !isDiceTuple(game.playerDice) || !isDiceTuple(game.dealerDice)
        || !Array.isArray(game.bids) || !isSafeIntegerAtLeast(game.startedAtTurn, 0)
        || !isSafeIntegerAtLeast(game.startedAtOrder, 0) || !isSafeIntegerAtLeast(game.createdAt, 0)) {
        return 'dice:shape';
    }
    try {
        if (normalizeTavernBankDiceBet(game.bet) !== game.bet) {return 'dice:bet';}
    } catch {
        return 'dice:bet';
    }
    if (game.bids.length % 2 !== 0 || (game.bids.length > 0 && game.bids.at(-1)?.by !== 'dealer')) {
        return 'dice:turn';
    }
    let previous: TavernBankDiceBid | undefined;
    for (let index = 0; index < game.bids.length; index += 1) {
        const bid = game.bids[index];
        if (!isBid(bid) || bid.by !== (index % 2 === 0 ? 'player' : 'dealer')
            || (previous && !isTavernBankDiceBidHigher(bid, previous))) {
            return 'dice:bids';
        }
        previous = bid;
    }
    return null;
}

function validatePushGame(game: unknown): string | null {
    if (!isRecord(game) || !isNonEmptyString(game.id) || game.bet !== TAVERN_BANK_PUSH_BET
        || !Array.isArray(game.deck) || game.deck.length !== TAVERN_BANK_PUSH_COIN_COUNT + TAVERN_BANK_PUSH_BOMB_COUNT
        || !isSafeIntegerAtLeast(game.drawIndex, 0) || !isSafeIntegerAtLeast(game.revealedCoins, 0)
        || !isSafeIntegerAtLeast(game.cashoutAmount, 0) || !isSafeIntegerAtLeast(game.startedAtTurn, 0)
        || !isSafeIntegerAtLeast(game.startedAtOrder, 0) || !isSafeIntegerAtLeast(game.createdAt, 0)) {
        return 'push:shape';
    }
    if (game.deck.some((card) => card !== 'coin' && card !== 'bomb')
        || game.deck.filter((card) => card === 'coin').length !== TAVERN_BANK_PUSH_COIN_COUNT
        || game.deck.filter((card) => card === 'bomb').length !== TAVERN_BANK_PUSH_BOMB_COUNT
        || game.drawIndex !== game.revealedCoins || game.drawIndex >= TAVERN_BANK_PUSH_COIN_COUNT
        || game.deck.slice(0, game.drawIndex).some((card) => card !== 'coin')
        || game.cashoutAmount !== game.revealedCoins * TAVERN_BANK_PUSH_COIN_VALUE) {
        return 'push:progress';
    }
    return null;
}

function validateLadderGame(game: unknown): string | null {
    if (!isRecord(game) || !isNonEmptyString(game.id) || !Array.isArray(game.history)
        || !isSafeIntegerAtLeast(game.completedFloors, 0) || !isSafeIntegerAtLeast(game.cashoutAmount, 1)
        || !isSafeIntegerAtLeast(game.riskBase, 1) || !isSafeIntegerAtLeast(game.startedAtTurn, 0)
        || !isSafeIntegerAtLeast(game.startedAtOrder, 0) || !isSafeIntegerAtLeast(game.createdAt, 0)) {
        return 'ladder:shape';
    }
    try {
        if (normalizeTavernBankLadderBet(game.bet) !== game.bet
            || calculateTavernBankLadderRiskBase(game.bet) !== game.riskBase) {
            return 'ladder:bet';
        }
    } catch {
        return 'ladder:bet';
    }
    if (game.completedFloors !== game.history.length || game.completedFloors >= TAVERN_BANK_LADDER_MAX_FLOORS
        || game.cashoutAmount >= TAVERN_BANK_LADDER_PAYOUT_CAP) {
        return 'ladder:progress';
    }
    let amount = game.riskBase;
    for (let index = 0; index < game.history.length; index += 1) {
        const step = game.history[index];
        if (!isRecord(step) || step.floor !== index + 1 || !isLadderChoice(step.choice)
            || !isSafeIntegerAtLeast(step.amountAfterSuccess, 1)) {
            return 'ladder:history';
        }
        const expected = calculateTavernBankLadderSuccessAmount(amount, step.choice);
        if (step.amountAfterSuccess !== expected || expected >= TAVERN_BANK_LADDER_PAYOUT_CAP) {
            return 'ladder:history';
        }
        amount = expected;
    }
    return game.cashoutAmount === amount ? null : 'ladder:cashout';
}

function validateActiveGame(value: unknown): string | null {
    if (!isRecord(value) || !isRecord(value.game)) {return 'active-game:shape';}
    if (value.kind === 'dice') {return validateDiceGame(value.game);}
    if (value.kind === 'push') {return validatePushGame(value.game);}
    if (value.kind === 'ladder') {return validateLadderGame(value.game);}
    return 'active-game:kind';
}

/** Shared current-model invariant. It rejects malformed data; it does not repair it. */
export function findTavernBankStateInvariantViolation(state: unknown): TavernBankInvariantViolation | null {
    if (!isRecord(state) || !Array.isArray(state.openDeposits) || !Array.isArray(state.openInvestments)) {
        return violation('state-shape-invalid', 'state');
    }
    const ids = new Set<string>();
    for (const position of state.openDeposits) {
        const detail = validateDepositPosition(position);
        if (detail) {return violation('position-invalid', detail);}
        const id = String((position as { id: string }).id);
        if (ids.has(id)) {return violation('position-id-duplicate', id);}
        ids.add(id);
    }
    for (const position of state.openInvestments) {
        const detail = validateFundPosition(position);
        if (detail) {return violation('position-invalid', detail);}
        const id = String((position as { id: string }).id);
        if (ids.has(id)) {return violation('position-id-duplicate', id);}
        ids.add(id);
    }
    if (state.activeGame !== undefined) {
        const detail = validateActiveGame(state.activeGame);
        if (detail) {return violation('active-game-invalid', detail);}
        const gameId = String((state.activeGame as { game: { id: string } }).game.id);
        if (ids.has(gameId)) {return violation('position-id-duplicate', gameId);}
    }
    return null;
}

function validateActivityDiceDetail(detail: Record<string, unknown>, amountIn: number, payout: number): boolean {
    if (!isBid(detail.finalBid) || !Array.isArray(detail.bids) || !isDiceTuple(detail.playerDice)
        || !isDiceTuple(detail.dealerDice) || (detail.result !== 'player-win' && detail.result !== 'dealer-win')
        || (detail.challenger !== 'player' && detail.challenger !== 'dealer') || detail.bids.length === 0) {
        return false;
    }
    let previous: TavernBankDiceBid | undefined;
    for (let index = 0; index < detail.bids.length; index += 1) {
        const bid = detail.bids[index];
        if (!isBid(bid) || bid.by !== (index % 2 === 0 ? 'player' : 'dealer')
            || (previous && !isTavernBankDiceBidHigher(bid, previous))) {
            return false;
        }
        previous = bid;
    }
    const finalBid = detail.bids.at(-1);
    if (!finalBid || JSON.stringify(finalBid) !== JSON.stringify(detail.finalBid) || finalBid.by === detail.challenger) {
        return false;
    }
    try {
        if (normalizeTavernBankDiceBet(amountIn) !== amountIn) {return false;}
    } catch {
        return false;
    }
    const matching = countTavernBankDiceBidMatches({
        playerDice: detail.playerDice,
        dealerDice: detail.dealerDice,
    }, finalBid);
    const bidHolds = matching >= finalBid.count;
    const bidderWins = bidHolds;
    const playerWins = bidderWins ? finalBid.by === 'player' : finalBid.by === 'dealer';
    const expectedPayout = playerWins ? Math.floor((amountIn * 19) / 10) : 0;
    return (detail.result === 'player-win') === playerWins && payout === expectedPayout;
}

function validateActivityLadderDetail(detail: Record<string, unknown>, amountIn: number, payout: number): boolean {
    if (!Array.isArray(detail.steps) || !['cashed-out', 'failed', 'cleared', 'capped'].includes(String(detail.outcome))) {
        return false;
    }
    if (detail.steps.length > TAVERN_BANK_LADDER_MAX_FLOORS) {return false;}
    let bet: number;
    try {
        bet = normalizeTavernBankLadderBet(amountIn);
    } catch {
        return false;
    }
    let amount = calculateTavernBankLadderRiskBase(bet);
    for (let index = 0; index < detail.steps.length; index += 1) {
        const step = detail.steps[index];
        if (!isRecord(step) || step.floor !== index + 1 || !isLadderChoice(step.choice) || typeof step.success !== 'boolean'
            || !isSafeIntegerAtLeast(step.amountAfterStep, 0)) {
            return false;
        }
        if (!step.success) {
            return index === detail.steps.length - 1 && step.amountAfterStep === 0 && detail.outcome === 'failed' && payout === 0;
        }
        amount = calculateTavernBankLadderSuccessAmount(amount, step.choice);
        if (step.amountAfterStep !== amount) {return false;}
    }
    if (detail.outcome === 'failed') {return false;}
    if (detail.outcome === 'capped') {
        return amount === TAVERN_BANK_LADDER_PAYOUT_CAP && payout === amount;
    }
    if (detail.outcome === 'cleared') {
        return detail.steps.length === TAVERN_BANK_LADDER_MAX_FLOORS && amount < TAVERN_BANK_LADDER_PAYOUT_CAP && payout === amount;
    }
    return detail.steps.length >= 1 && detail.steps.length < TAVERN_BANK_LADDER_MAX_FLOORS
        && amount < TAVERN_BANK_LADDER_PAYOUT_CAP && payout === amount;
}

function validateActivityDetail(detail: unknown, amountIn: number, payout: number): boolean {
    if (!isRecord(detail) || !isNonEmptyString(detail.kind)) {return false;}
    if (detail.kind === 'deposit') {
        const product = findTavernBankDepositContract(String(detail.productId || ''));
        if (!product || (detail.outcome !== 'matured' && detail.outcome !== 'withdrawn-early')) {return false;}
        try {
            const contract = createTavernBankDepositContract(product, amountIn);
            return payout === (detail.outcome === 'matured' ? contract.maturityAmount : contract.earlyWithdrawalAmount);
        } catch {return false;}
    }
    if (detail.kind === 'fund') {
        const product = findTavernBankFundContract(String(detail.productId || ''));
        if (!product) {return false;}
        try {return payout === createTavernBankFundContract(product, amountIn, detail.resolvedReturnBps).settlementAmount;} catch {return false;}
    }
    if (detail.kind === 'dice') {return validateActivityDiceDetail(detail, amountIn, payout);}
    if (detail.kind === 'push') {
        if (amountIn !== TAVERN_BANK_PUSH_BET || !isSafeIntegerAtLeast(detail.revealedCoins, 0)
            || Number(detail.revealedCoins) > TAVERN_BANK_PUSH_COIN_COUNT) {return false;}
        if (detail.outcome === 'busted') {return detail.revealedCoins < TAVERN_BANK_PUSH_COIN_COUNT && payout === 0;}
        if (detail.outcome === 'cleared') {return detail.revealedCoins === TAVERN_BANK_PUSH_COIN_COUNT && payout === TAVERN_BANK_PUSH_COIN_COUNT * TAVERN_BANK_PUSH_COIN_VALUE;}
        return detail.outcome === 'cashed-out' && detail.revealedCoins >= 1 && detail.revealedCoins < TAVERN_BANK_PUSH_COIN_COUNT
            && payout === Number(detail.revealedCoins) * TAVERN_BANK_PUSH_COIN_VALUE;
    }
    if (detail.kind === 'ladder') {return validateActivityLadderDetail(detail, amountIn, payout);}
    return false;
}

export function findTavernBankActivityInvariantViolation(activity: unknown): TavernBankInvariantViolation | null {
    if (!isRecord(activity) || !isNonEmptyString(activity.sessionId) || !isNonEmptyString(activity.id)
        || !isNonEmptyString(activity.sourceId) || !isSafeIntegerAtLeast(activity.amountIn, 1)
        || !isSafeIntegerAtLeast(activity.payout, 0) || !Number.isSafeInteger(activity.net)
        || !isSafeIntegerAtLeast(activity.anchorOrder, 0) || !isSafeIntegerAtLeast(activity.createdAt, 0)
        || Number(activity.net) !== Number(activity.payout) - Number(activity.amountIn)
        || !validateActivityDetail(activity.detail, Number(activity.amountIn), Number(activity.payout))) {
        return violation('activity-invalid', 'activity');
    }
    return null;
}

export function findTavernBankActivitiesInvariantViolation(activities: unknown): TavernBankInvariantViolation | null {
    if (!Array.isArray(activities)) {return violation('activity-invalid', 'activities');}
    const ids = new Set<string>();
    const sourceIds = new Set<string>();
    for (const activity of activities) {
        const found = findTavernBankActivityInvariantViolation(activity);
        if (found) {return found;}
        const record = activity as TavernBankActivityRecord;
        if (ids.has(record.id)) {return violation('activity-invalid', `id-duplicate:${record.id}`);}
        if (sourceIds.has(record.sourceId)) {return violation('activity-invalid', `source-id-duplicate:${record.sourceId}`);}
        ids.add(record.id);
        sourceIds.add(record.sourceId);
    }
    return null;
}

/**
 * Archive ingress for Bank versions. It accepts only the exact current shape,
 * then returns the same canonical value that was validated for persistence.
 */
export function parseCanonicalTavernBankStateVersionRecord(value: unknown): TavernBankStateVersionRecord {
    const source = isRecord(value) ? value : {};
    const keys = [
        'sessionId',
        'revision',
        'versionId',
        ...(source.currentMarker !== undefined ? ['currentMarker'] : []),
        'actionId',
        'action',
        'anchorOrder',
        'turn',
        'state',
        'createdAt',
        'updatedAt',
    ];
    const record = assertCanonicalObject(value, keys, 'version');
    assertCanonicalString(record.sessionId, 'version.sessionId');
    assertCanonicalInteger(record.revision, 1, 'version.revision');
    assertCanonicalString(record.versionId, 'version.versionId');
    if (record.currentMarker !== undefined && record.currentMarker !== TAVERN_BANK_CURRENT_MARKER) {
        throwTavernBankError('bank_state_invalid', 'version.currentMarker');
    }
    assertCanonicalString(record.actionId, 'version.actionId');
    assertCanonicalActionShape(record.action);
    assertCanonicalInteger(record.anchorOrder, 0, 'version.anchorOrder');
    assertCanonicalInteger(record.turn, 0, 'version.turn');
    assertCanonicalStateShape(record.state);
    assertCanonicalInteger(record.createdAt, 0, 'version.createdAt');
    assertCanonicalInteger(record.updatedAt, 0, 'version.updatedAt');
    assertTavernBankStateInvariant(record.state as TavernBankState);
    return cloneCanonical(record as unknown as TavernBankStateVersionRecord);
}

/** Strict current-shape archive ingress for completed Bank activities. */
export function parseCanonicalTavernBankActivityRecord(value: unknown): TavernBankActivityRecord {
    const record = assertCanonicalObject(value, [
        'sessionId', 'id', 'sourceId', 'detail', 'amountIn', 'payout', 'net', 'anchorOrder', 'createdAt',
    ], 'activity');
    assertCanonicalString(record.sessionId, 'activity.sessionId');
    assertCanonicalString(record.id, 'activity.id');
    assertCanonicalString(record.sourceId, 'activity.sourceId');
    assertCanonicalActivityDetailShape(record.detail);
    assertCanonicalInteger(record.amountIn, 1, 'activity.amountIn');
    assertCanonicalInteger(record.payout, 0, 'activity.payout');
    if (!Number.isSafeInteger(record.net)) {throwTavernBankError('bank_activity_invalid', 'activity.net');}
    assertCanonicalInteger(record.anchorOrder, 0, 'activity.anchorOrder');
    assertCanonicalInteger(record.createdAt, 0, 'activity.createdAt');
    assertTavernBankActivityInvariant(record as unknown as TavernBankActivityRecord);
    return cloneCanonical(record as unknown as TavernBankActivityRecord);
}

export function assertTavernBankStateInvariant(state: TavernBankState): void {
    const found = findTavernBankStateInvariantViolation(state);
    if (found) {throwTavernBankError('bank_state_invalid', `${found.code}:${found.detail}`);}
}

export function assertTavernBankActivityInvariant(activity: TavernBankActivityRecord): void {
    const found = findTavernBankActivityInvariantViolation(activity);
    if (found) {throwTavernBankError('bank_activity_invalid', `${found.code}:${found.detail}`);}
}
