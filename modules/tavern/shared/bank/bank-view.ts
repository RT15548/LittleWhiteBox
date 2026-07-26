import {
    getTavernBankDepositContract,
    getTavernBankFundContract,
} from './bank-products';
import {
    getTavernBankPushStatistics,
} from './games/push-your-luck';
import {
    calculateTavernBankLadderSuccessAmount,
    listTavernBankLadderOptions,
} from './games/risk-ladder';
import type {
    TavernBankActiveGame,
    TavernBankLadderGameView,
    TavernBankStateVersionRecord,
    TavernBankView,
} from './bank-types';

function normalizeCurrentTurn(value: unknown): number {
    const turn = Number(value);
    return Number.isSafeInteger(turn) && turn >= 0 ? turn : 0;
}

function remainingRounds(maturityTurn: number, currentTurn: number): number {
    return Math.max(0, maturityTurn - currentTurn);
}

function projectActiveGame(activeGame: TavernBankActiveGame): TavernBankView['activeGame'] {
    if (activeGame.kind === 'dice') {
        return {
            kind: 'dice',
            id: activeGame.game.id,
            bet: activeGame.game.bet,
            playerDice: [...activeGame.game.playerDice] as typeof activeGame.game.playerDice,
            bids: activeGame.game.bids.map((bid) => ({ ...bid })),
        };
    }
    if (activeGame.kind === 'push') {
        const statistics = getTavernBankPushStatistics(activeGame.game);
        return {
            kind: 'push',
            id: activeGame.game.id,
            bet: activeGame.game.bet,
            revealedCoins: activeGame.game.revealedCoins,
            cashoutAmount: activeGame.game.cashoutAmount,
            ...statistics,
        };
    }
    const nextChoices: TavernBankLadderGameView['nextChoices'] = listTavernBankLadderOptions().map((option) => ({
        choice: option.choice,
        successProbabilityBps: option.successProbabilityBps,
        successAmount: calculateTavernBankLadderSuccessAmount(activeGame.game.cashoutAmount, option.choice),
    }));
    return {
        kind: 'ladder',
        id: activeGame.game.id,
        bet: activeGame.game.bet,
        completedFloors: activeGame.game.completedFloors,
        cashoutAmount: activeGame.game.cashoutAmount,
        canCashOut: activeGame.game.completedFloors > 0,
        history: activeGame.game.history.map((step) => ({ ...step })),
        nextChoices,
    };
}

/**
 * Creates a Controller-safe snapshot. It never returns a private State object
 * or nested private array by reference.
 */
export function createTavernBankView(input: {
    currentTurn: number;
    record?: Pick<TavernBankStateVersionRecord, 'revision' | 'versionId' | 'state'> | null;
}): TavernBankView {
    const currentTurn = normalizeCurrentTurn(input.currentTurn);
    const record = input.record || null;
    if (!record) {
        return {
            revision: 0,
            versionId: '',
            currentTurn,
            deposits: [],
            investments: [],
        };
    }
    return {
        revision: record.revision,
        versionId: record.versionId,
        currentTurn,
        deposits: record.state.openDeposits.map((position) => {
            const product = getTavernBankDepositContract(position.productId);
            return {
                id: position.id,
                productId: product.id,
                name: product.name,
                principal: position.principal,
                startTurn: position.startTurn,
                maturityTurn: position.maturityTurn,
                remainingRounds: remainingRounds(position.maturityTurn, currentTurn),
                maturityAmount: position.maturityAmount,
                earlyWithdrawalAmount: position.earlyWithdrawalAmount,
            };
        }),
        investments: record.state.openInvestments.map((position) => {
            const product = getTavernBankFundContract(position.productId);
            return {
                id: position.id,
                productId: product.id,
                name: product.name,
                description: product.description,
                riskLevel: product.riskLevel,
                principal: position.principal,
                startTurn: position.startTurn,
                maturityTurn: position.maturityTurn,
                remainingRounds: remainingRounds(position.maturityTurn, currentTurn),
            };
        }),
        ...(record.state.activeGame ? { activeGame: projectActiveGame(record.state.activeGame) } : {}),
    };
}
