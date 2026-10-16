import {
    ECONOMY_TRANSACTION_CAPABILITY,
    type EconomyReadCapability,
    type EconomyTransactionCapability,
} from '../../../capabilities/economy/index.js';
import { gameRandomSource } from '../../../domains/game/random.js';
import { createStorageId } from '../../../kernel/identity.js';
import {
    appendGameEvent,
    createEmptyGameDomain,
    replayGameEvents,
} from '../../../domains/game/timeline.js';
import {
    throwGameError,
    type GameCasToken,
    type GameClientView,
    type GameDiceBidValue,
    type GameDomainV1,
    type GameLadderChoice,
    type GameRandomSource,
    type GameState,
} from '../../../domains/game/types.js';
import { createGameView, type CreateGameViewInput } from '../../../domains/game/view.js';
import type {
    PendingCommitRecoveryResult,
    PartitionStore,
    XiaobaiOsFileControls,
    XiaobaiOsFileState,
} from '../../../kernel/contracts.js';
import {
    assertCas,
    replayExistingAction,
    requireActionId,
    requireGeneratedId,
    type GameExplicitIntent,
    type PreparedGameAction,
} from './action-policy.js';
import { createGameCommands } from './commands.js';
import {
    toEconomyActionLegs,
    validateGameEconomyConsistency,
} from './economy-protocol.js';
import { GAME_PARTITION } from '../partition.js';

export interface GameServiceView extends GameClientView {
    balance: number;
    writeState: XiaobaiOsFileState;
    pendingCommit: boolean;
}

export interface GameServiceCommand extends GameCasToken {
    actionId: string;
}

export interface GameStartDiceCommand extends GameServiceCommand {
    bet: number;
}

export interface GameBidDiceCommand extends GameServiceCommand {
    gameId: string;
    bid: GameDiceBidValue;
}

export interface GameCommand extends GameServiceCommand {
    gameId: string;
}

export interface GameStartLadderCommand extends GameServiceCommand {
    bet: number;
}

export interface GameStepLadderCommand extends GameCommand {
    choice: GameLadderChoice;
}

export type GamePendingRecoveryResult = PendingCommitRecoveryResult | { status: 'rejected' };

export interface GameService {
    readCurrent: (input?: Pick<CreateGameViewInput, 'activityOffset' | 'activityLimit'>) => GameServiceView;
    refreshCurrent: () => Promise<GameServiceView>;
    startDice: (input: GameStartDiceCommand) => Promise<GameServiceView>;
    bidDice: (input: GameBidDiceCommand) => Promise<GameServiceView>;
    challengeDice: (input: GameCommand) => Promise<GameServiceView>;
    startPush: (input: GameServiceCommand) => Promise<GameServiceView>;
    drawPush: (input: GameCommand) => Promise<GameServiceView>;
    cashOutPush: (input: GameCommand) => Promise<GameServiceView>;
    startLadder: (input: GameStartLadderCommand) => Promise<GameServiceView>;
    stepLadder: (input: GameStepLadderCommand) => Promise<GameServiceView>;
    cashOutLadder: (input: GameCommand) => Promise<GameServiceView>;
    confirmPending: () => Promise<GamePendingRecoveryResult>;
    getWriteState: () => XiaobaiOsFileState;
    hasPendingSave: () => boolean;
    subscribe(listener: () => void): () => void;
    dispose(): void;
}

export interface GameServiceDependencies {
    now?: () => number;
    createGameId?: (kind: 'dice' | 'push' | 'ladder') => string;
    createEventId?: () => string;
    createActivityId?: () => string;
    random?: GameRandomSource;
    isMainGenerationActive?: () => boolean;
}

export interface PreparedGameContext {
    game: GameDomainV1;
    state: GameState;
    balance: number;
}

export type RunGameAction = (
    input: GameServiceCommand,
    intent: GameExplicitIntent,
    createAction: (prepared: PreparedGameContext, activityId: string) => PreparedGameAction,
) => Promise<GameServiceView>;

interface TransactionProjection {
    game: GameDomainV1;
    balance: number;
}

function defaultId(prefix: string): string {
    return `${prefix}-${createStorageId()}`;
}

function transactionError(result: {
    status: 'failed' | 'unconfirmed' | 'conflict';
    error?: { code: string; message: string; retryable: boolean };
}): Error {
    const code = result.error?.code
        ?? (result.status === 'unconfirmed' ? 'storage_unconfirmed' : 'storage_conflict');
    return Object.assign(new Error(result.error?.message ?? `game_${result.status}`), {
        code,
        retryable: result.error?.retryable ?? true,
        uncertain: result.status === 'unconfirmed' || code === 'storage_unconfirmed',
    });
}

export function createGameService(
    store: PartitionStore<GameDomainV1>,
    files: XiaobaiOsFileControls,
    economyRead: EconomyReadCapability,
    {
        now = Date.now,
        createGameId = kind => defaultId(`game-${kind}`),
        createEventId = () => defaultId('game-event'),
        createActivityId = () => defaultId('game-activity'),
        random = gameRandomSource,
        isMainGenerationActive = () => false,
    }: GameServiceDependencies = {},
): GameService {
    const listeners = new Set<() => void>();
    const publish = (): void => {
        for (const listener of listeners) {
            try { listener(); } catch (error) {
                console.error('[LittleWhiteBox] Game state listener failed', error);
            }
        }
    };
    const unsubscribeStore = store.subscribe(publish);
    const unsubscribeEconomy = economyRead.subscribe(publish);
    const unsubscribeFiles = files.subscribeFileState(publish);
    const currentDomain = (): GameDomainV1 | null => store.peekCurrent()?.value ?? null;

    function buildView(
        domain = currentDomain(),
        balance = economyRead.getPlayerBalance(),
        paging: Pick<CreateGameViewInput, 'activityOffset' | 'activityLimit'> = {},
    ): GameServiceView {
        return {
            ...createGameView({ domain, ...paging }),
            balance,
            writeState: files.getFileState(),
            pendingCommit: files.hasPendingCommit(GAME_PARTITION.key),
        };
    }

    function readCurrent(
        input: Pick<CreateGameViewInput, 'activityOffset' | 'activityLimit'> = {},
    ): GameServiceView {
        return buildView(currentDomain(), economyRead.getPlayerBalance(), input);
    }

    async function refreshCurrent(): Promise<GameServiceView> {
        await economyRead.refresh();
        await store.read();
        return readCurrent();
    }

    function prepare(
        current: GameDomainV1 | null,
        economy: EconomyTransactionCapability,
    ): PreparedGameContext {
        const game = current ?? createEmptyGameDomain();
        validateGameEconomyConsistency(game, economy);
        return {
            game,
            state: replayGameEvents(game),
            balance: economy.getPlayerBalance(),
        };
    }

    function unusedGameId(prepared: PreparedGameContext, kind: 'dice' | 'push' | 'ladder'): string {
        const gameId = requireGeneratedId(createGameId(kind), 'game-id', true);
        if (prepared.game.events.some((event) => event.command.gameId === gameId)) {
            throwGameError('game_invalid', 'game-id-conflict');
        }
        return gameId;
    }

    const runAction: RunGameAction = async (
        input,
        intent,
        createAction,
    ): Promise<GameServiceView> => {
        let replayed = false;
        const assertGenerationIdle = () => {
            if (isMainGenerationActive()) {throw new Error('game_main_generation_active');}
        };
        const result = await store.transact<TransactionProjection>((transaction) => {
            const economy = transaction.useCapability(ECONOMY_TRANSACTION_CAPABILITY);
            const prepared = prepare(transaction.current, economy);
            if (replayExistingAction(prepared.game, input.actionId, intent)) {
                replayed = true;
                return { game: prepared.game, balance: prepared.balance };
            }
            assertGenerationIdle();
            const actionId = requireActionId(input.actionId);
            assertCas(prepared.game, input);
            const eventId = requireGeneratedId(createEventId(), 'event-id');
            if (prepared.game.events.some((event) => event.eventId === eventId)) {
                throwGameError('game_invalid_context', 'event-id-conflict');
            }
            const activityId = requireGeneratedId(createActivityId(), 'activity-id');
            if (prepared.game.events.some((event) => (
                event.result.activities.some((activity) => activity.id === activityId)
            ))) {
                throwGameError('game_invalid_context', 'activity-id-conflict');
            }
            const action = createAction(prepared, activityId);
            const appended = appendGameEvent(prepared.game, {
                ...input,
                eventId,
                actionId,
                command: action.command,
                result: action.result,
                createdAt: now(),
            });
            if (action.economyLegs.length > 0) {
                economy.postAction({
                    legs: toEconomyActionLegs(action.economyLegs, actionId, action.command.gameId),
                });
            }
            validateGameEconomyConsistency(appended.domain, economy);
            transaction.replace(appended.domain);
            return { game: appended.domain, balance: economy.getPlayerBalance() };
        }, {
            retainFailedCandidate: true,
            commitGuard() {
                if (!replayed) {assertGenerationIdle();}
                return true;
            },
        });
        if (result.status === 'failed' || result.status === 'unconfirmed' || result.status === 'conflict') {
            throw transactionError(result);
        }
        const projection = result.result;
        const domain = structuredClone(result.status === 'confirmed'
            ? result.snapshot.value ?? projection.game
            : projection.game);
        return buildView(domain, projection.balance);
    };

    const commands = createGameCommands({ random, runAction, unusedGameId });

    return Object.freeze({
        readCurrent,
        refreshCurrent,
        ...commands,
        confirmPending: () => files.retryPending(),
        getWriteState: () => files.getFileState(),
        hasPendingSave: () => files.hasPendingCommit(GAME_PARTITION.key),
        subscribe(listener: () => void) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        dispose() {
            unsubscribeStore();
            unsubscribeEconomy();
            unsubscribeFiles();
            listeners.clear();
        },
    });
}
