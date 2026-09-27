import type {
    EconomyActionLeg,
    EconomyTransactionCapability,
} from '../../../capabilities/economy/index.js';
import { validateGameDomain } from '../../../domains/game/invariants.js';
import { replayGameEvents } from '../../../domains/game/timeline.js';
import type { EconomyTransaction } from '../../../domains/economy/types.js';
import type { GameDomainV1, GameEvent } from '../../../domains/game/types.js';

export interface GameEconomyLeg {
    idempotencyKey: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    kind: string;
    title: string;
}

const GAME_ESCROW_PREFIX = 'escrow:game:';
const GAME_RESERVE_ACCOUNT = 'counterparty:game:reserve';
const GAME_SOURCE_DOMAIN = 'game';
const GAME_TRANSACTION_PREFIX = 'game:';

function escrowAccount(gameId: string): string {
    return `${GAME_ESCROW_PREFIX}${gameId}`;
}

export function startGameStakeLeg(gameId: string, amount: number): GameEconomyLeg {
    return {
        idempotencyKey: `${GAME_TRANSACTION_PREFIX}${gameId}:stake`,
        fromAccountId: 'player',
        toAccountId: escrowAccount(gameId),
        amount,
        kind: 'game_stake',
        title: 'Game stake escrow',
    };
}

export function gameSettlementLegs(gameId: string, amountIn: number, payout: number): GameEconomyLeg[] {
    const escrow = escrowAccount(gameId);
    const legs: GameEconomyLeg[] = [];
    if (payout > amountIn) {
        legs.push({
            idempotencyKey: `${GAME_TRANSACTION_PREFIX}${gameId}:reserve`,
            fromAccountId: GAME_RESERVE_ACCOUNT,
            toAccountId: escrow,
            amount: payout - amountIn,
            kind: 'game_reserve',
            title: 'Game reserve funding',
        });
    }
    if (payout > 0) {
        legs.push({
            idempotencyKey: `${GAME_TRANSACTION_PREFIX}${gameId}:payout`,
            fromAccountId: escrow,
            toAccountId: 'player',
            amount: payout,
            kind: 'game_payout',
            title: 'Game payout',
        });
    }
    if (payout < amountIn) {
        legs.push({
            idempotencyKey: `${GAME_TRANSACTION_PREFIX}${gameId}:loss`,
            fromAccountId: escrow,
            toAccountId: 'system:sink',
            amount: amountIn - payout,
            kind: 'game_loss',
            title: 'Game loss settlement',
        });
    }
    return legs;
}

export function toEconomyActionLegs(
    legs: readonly GameEconomyLeg[],
    actionId: string,
    gameId: string,
): EconomyActionLeg[] {
    return legs.map((leg) => ({ ...leg, actionId, sourceId: gameId }));
}

function expectedEconomyLegs(event: GameEvent): GameEconomyLeg[] {
    if (event.command.kind === 'dice-start' || event.command.kind === 'push-start'
        || event.command.kind === 'ladder-start') {
        const change = event.result.changes[0];
        return change?.kind === 'game-started'
            ? [startGameStakeLeg(event.command.gameId, change.game.game.bet)]
            : [];
    }
    const activity = event.result.activities[0];
    return activity ? gameSettlementLegs(event.command.gameId, activity.amountIn, activity.payout) : [];
}

function sameEconomyLeg(transaction: EconomyTransaction, event: GameEvent, expected: GameEconomyLeg): boolean {
    return transaction.idempotencyKey === expected.idempotencyKey
        && transaction.actionId === event.actionId
        && transaction.fromAccountId === expected.fromAccountId
        && transaction.toAccountId === expected.toAccountId
        && transaction.amount === expected.amount
        && transaction.kind === expected.kind
        && transaction.title === expected.title
        && transaction.note === ''
        && transaction.sourceDomain === GAME_SOURCE_DOMAIN
        && transaction.sourceId === event.command.gameId
        && transaction.reversalOfTransactionId === undefined;
}

/** Checks Game's owned money protocol without exposing the Economy ledger or root envelope. */
export function validateGameEconomyConsistency(
    game: GameDomainV1,
    economy: EconomyTransactionCapability,
    path = 'partitions.game',
): void {
    validateGameDomain(game);
    const expected = game.events.flatMap((event) => expectedEconomyLegs(event).map((leg) => ({ event, leg })));
    // Game owns several feature partitions; this protocol owns only its wagering legs.
    const actual = economy.listOwnedTransactions().filter(transaction => transaction.idempotencyKey.startsWith(GAME_TRANSACTION_PREFIX));
    if (actual.length !== expected.length) {
        throw new Error(`${path} Game events and Economy transactions are inconsistent`);
    }
    for (let index = 0; index < expected.length; index += 1) {
        const pair = expected[index];
        const transaction = actual[index];
        if (!pair || !transaction || !sameEconomyLeg(transaction, pair.event, pair.leg)) {
            throw new Error(`${path} Game action is inconsistent: ${pair?.event.actionId ?? 'unknown'}`);
        }
    }

    const state = replayGameEvents(game);
    for (const gameId of new Set(game.events.map((event) => event.command.gameId))) {
        const expectedEscrow = state.activeGame?.game.id === gameId ? state.activeGame.game.bet : 0;
        if (economy.getAccountBalance(escrowAccount(gameId)) !== expectedEscrow) {
            throw new Error(`${path} Game escrow is inconsistent: ${gameId}`);
        }
    }
}
