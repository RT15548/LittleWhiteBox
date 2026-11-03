import assert from 'node:assert/strict';
import test from 'node:test';

import {
    countGameDiceBidMatches,
    createGameDiceGame,
    respondToGameDicePlayerBid,
} from '../domains/game/games/dice-bluff.js';
import { cashOutGamePushGame, createGamePushGame, drawGamePushCard } from '../domains/game/games/push-your-luck.js';
import { validateGameDomain } from '../domains/game/invariants.js';
import { createGameSequenceRandom } from '../domains/game/random.js';
import {
    appendGameEvent,
    createEmptyGameDomain,
    createEmptyGameState,
    flattenGameActivities,
    getGameCasToken,
    replayGameEvents,
} from '../domains/game/timeline.js';
import { createGameView } from '../domains/game/view.js';

function eventInput(domain, sequence, command, result, options = {}) {
    return {
        ...getGameCasToken(domain),
        eventId: `game-event-${sequence}`,
        actionId: `game-action-${sequence}`,
        command,
        result,
        createdAt: 1_000 + sequence,
        ...options,
    };
}

function append(domain, sequence, command, result, options) {
    return appendGameEvent(domain, eventInput(domain, sequence, command, result, options));
}

function startPush(domain, sequence, push, options) {
    return append(domain, sequence, {
        kind: 'push-start', gameId: push.id,
    }, {
        changes: [{ kind: 'game-started', game: { kind: 'push', game: push } }],
        activities: [],
    }, options);
}

function advancePush(domain, sequence, push, options) {
    const transition = drawGamePushCard(push);
    if (transition.kind !== 'continued') {assert.fail('push draw should continue');}
    return append(domain, sequence, {
        kind: 'push-draw', gameId: push.id,
    }, {
        changes: [{ kind: 'game-advanced', game: { kind: 'push', game: transition.game } }],
        activities: [],
    }, options);
}

function cashOutPush(domain, sequence, push, options) {
    const settlement = cashOutGamePushGame(push);
    return append(domain, sequence, {
        kind: 'push-cash-out', gameId: push.id,
    }, {
        changes: [{ kind: 'game-ended', gameId: push.id }],
        activities: [{
            id: `activity-${push.id}`,
            sourceId: push.id,
            detail: { kind: 'push', outcome: settlement.outcome, revealedCoins: settlement.revealedCoins },
            amountIn: push.bet,
            payout: settlement.payout,
            net: settlement.payout - push.bet,
        }],
    }, options);
}

test('schema v1 replays one active game and flattens terminal activity boundaries', () => {
    const push = createGamePushGame({ id: 'push-1' }, createGameSequenceRandom(Array(9).fill(0)));
    const started = startPush(createEmptyGameDomain(), 1, push);
    const advanced = advancePush(started.domain, 2, push);
    const active = replayGameEvents(advanced.domain).activeGame.game;
    const ended = cashOutPush(advanced.domain, 3, active);

    assert.deepEqual(createEmptyGameState(), {});
    assert.deepEqual(replayGameEvents(started.domain), { activeGame: { kind: 'push', game: push } });
    assert.deepEqual(replayGameEvents(ended.domain), {});
    assert.deepEqual(flattenGameActivities(ended.domain), [{
        id: 'activity-push-1',
        sourceId: 'push-1',
        detail: { kind: 'push', outcome: 'cashed-out', revealedCoins: 1 },
        amountIn: 50,
        payout: 50,
        net: 0,
        revision: 3,
        eventId: 'game-event-3',
        actionId: 'game-action-3',
        createdAt: 1_003,
    }]);
    assert.deepEqual(getGameCasToken(ended.domain), {
        expectedRevision: 3,
        expectedEventId: 'game-event-3',
    });
});

test('Game chronology preserves regressed wall-clock timestamps', () => {
    const push = createGamePushGame({ id: 'clock-game' }, createGameSequenceRandom(Array(9).fill(0)));
    const started = startPush(createEmptyGameDomain(), 1, push, { createdAt: 2_000 });
    const advanced = advancePush(started.domain, 2, push, { createdAt: 1_000 });

    assert.equal(advanced.domain.events[1].createdAt, 1_000);
    assert.equal(replayGameEvents(advanced.domain).activeGame.game.revealedCoins, 1);
});

test('validation rejects non-canonical persistence and forged private progression', () => {
    const push = createGamePushGame({ id: 'push-strict' }, createGameSequenceRandom(Array(9).fill(0)));
    const started = startPush(createEmptyGameDomain(), 1, push).domain;
    validateGameDomain(started);

    const extraTopLevel = structuredClone(started);
    extraTopLevel.metadata = {};
    const extraCommand = structuredClone(started);
    extraCommand.events[0].command.settledPositionIds = [];
    const wrongRevision = structuredClone(started);
    wrongRevision.events[0].revision = 2;
    const paddedId = structuredClone(started);
    paddedId.events[0].eventId = ' padded ';
    const forgedDeck = structuredClone(started);
    forgedDeck.events[0].result.changes[0].game.game.deck[0] = 'forged';

    for (const candidate of [extraTopLevel, extraCommand, wrongRevision, paddedId, forgedDeck]) {
        assert.throws(() => validateGameDomain(candidate), error => error.code === 'game_invalid_domain');
    }

    const advanced = advancePush(started, 2, push).domain;
    const reordered = structuredClone(advanced);
    reordered.events[1].result.changes[0].game.game.deck.reverse();
    assert.throws(() => validateGameDomain(reordered), error => error.code === 'game_invalid_domain');
});

test('event chains permit at most one active game', () => {
    const push = createGamePushGame({ id: 'push-active' }, createGameSequenceRandom(Array(9).fill(0)));
    const domain = startPush(createEmptyGameDomain(), 1, push).domain;
    const dice = createGameDiceGame({ id: 'dice-second', bet: 50 }, createGameSequenceRandom(Array(10).fill(0)));
    assert.throws(() => append(domain, 2, {
        kind: 'dice-start', gameId: dice.id, bet: dice.bet,
    }, {
        changes: [{ kind: 'game-started', game: { kind: 'dice', game: dice } }],
        activities: [],
    }), error => error.code === 'game_invalid_domain');
});

test('dice terminal activity exactly matches the private transition', () => {
    const dice = createGameDiceGame(
        { id: 'dice-terminal', bet: 50 },
        createGameSequenceRandom(Array(10).fill(0)),
    );
    let domain = append(createEmptyGameDomain(), 1, {
        kind: 'dice-start', gameId: dice.id, bet: dice.bet,
    }, {
        changes: [{ kind: 'game-started', game: { kind: 'dice', game: dice } }],
        activities: [],
    }).domain;
    const transition = respondToGameDicePlayerBid(
        dice,
        { count: 10, face: 6 },
        createGameSequenceRandom([]),
    );
    if (transition.kind !== 'settled') {assert.fail('maximum bid must settle');}
    const settlement = transition.settlement;
    domain = append(domain, 2, {
        kind: 'dice-bid', gameId: dice.id, bid: { count: 10, face: 6 },
    }, {
        changes: [{ kind: 'game-ended', gameId: dice.id }],
        activities: [{
            id: 'activity-dice-terminal',
            sourceId: dice.id,
            detail: {
                kind: 'dice',
                outcome: settlement.outcome,
                challenger: settlement.challenger,
                finalBid: settlement.finalBid,
                bids: settlement.bids,
                playerDice: settlement.playerDice,
                dealerDice: settlement.dealerDice,
                matchingDiceCount: settlement.matchingDiceCount,
            },
            amountIn: dice.bet,
            payout: settlement.payout,
            net: settlement.payout - dice.bet,
        }],
    }).domain;
    assert.deepEqual(replayGameEvents(domain), {});

    const forged = structuredClone(domain);
    forged.events[1].result.activities[0].detail.dealerDice[0] = 6;
    assert.throws(() => validateGameDomain(forged), error => error.code === 'game_invalid_domain');
});

test('persisted Dice facts do not replay current dealer or payout policy', () => {
    const high = {
        id: 'dice-policy-high',
        bet: 50,
        playerDice: [2, 2, 3, 4, 5],
        dealerDice: [3, 3, 3, 3, 3],
        bids: [],
    };
    const highStarted = append(createEmptyGameDomain(), 1, {
        kind: 'dice-start', gameId: high.id, bet: high.bet,
    }, {
        changes: [{ kind: 'game-started', game: { kind: 'dice', game: high } }],
        activities: [],
    }).domain;
    const playerBid = { by: 'player', count: 1, face: 3 };
    const matchingDiceCount = countGameDiceBidMatches(high, playerBid);
    const settledByHistoricalDealer = append(highStarted, 2, {
        kind: 'dice-bid', gameId: high.id, bid: { count: 1, face: 3 },
    }, {
        changes: [{ kind: 'game-ended', gameId: high.id }],
        activities: [{
            id: 'activity-policy-high',
            sourceId: high.id,
            detail: {
                kind: 'dice', outcome: 'player-win', challenger: 'dealer', finalBid: playerBid,
                bids: [playerBid], playerDice: high.playerDice, dealerDice: high.dealerDice,
                matchingDiceCount,
            },
            amountIn: 50,
            payout: 95,
            net: 45,
        }],
    });
    assert.equal(flattenGameActivities(settledByHistoricalDealer.domain)[0].payout, 95);

    const low = { ...high, id: 'dice-policy-low', dealerDice: [2, 2, 3, 4, 5] };
    const lowStarted = append(createEmptyGameDomain(), 1, {
        kind: 'dice-start', gameId: low.id, bet: low.bet,
    }, {
        changes: [{ kind: 'game-started', game: { kind: 'dice', game: low } }],
        activities: [],
    }).domain;
    // The current dealer would choose another response. History only requires
    // the recorded dealer raise to be a legal continuation of the bid chain.
    const historicalRaise = append(lowStarted, 2, {
        kind: 'dice-bid', gameId: low.id, bid: { count: 3, face: 6 },
    }, {
        changes: [{
            kind: 'game-advanced',
            game: {
                kind: 'dice',
                game: { ...low, bids: [{ by: 'player', count: 3, face: 6 }, { by: 'dealer', count: 4, face: 3 }] },
            },
        }],
        activities: [],
    });
    assert.equal(replayGameEvents(historicalRaise.domain).activeGame.game.bids.at(-1).face, 3);

    assert.throws(() => append(highStarted, 2, {
        kind: 'dice-bid', gameId: high.id, bid: { count: 1, face: 3 },
    }, {
        changes: [{
            kind: 'game-advanced',
            game: {
                kind: 'dice',
                game: { ...high, bids: [playerBid, { by: 'dealer', count: 1, face: 2 }] },
            },
        }],
        activities: [],
    }), error => error.code === 'game_invalid_domain');
});

test('persisted Push and Ladder facts do not replay current stake, coin, multiplier, floor, or cap policy', () => {
    const push = {
        id: 'push-frozen-policy',
        bet: 75,
        deck: ['coin', 'coin', 'bomb'],
        drawIndex: 0,
        revealedCoins: 0,
        cashoutAmount: 0,
    };
    let pushDomain = append(createEmptyGameDomain(), 1, {
        kind: 'push-start', gameId: push.id,
    }, {
        changes: [{ kind: 'game-started', game: { kind: 'push', game: push } }],
        activities: [],
    }).domain;
    const pushed = { ...push, drawIndex: 1, revealedCoins: 1, cashoutAmount: 30 };
    pushDomain = append(pushDomain, 2, {
        kind: 'push-draw', gameId: push.id,
    }, {
        changes: [{ kind: 'game-advanced', game: { kind: 'push', game: pushed } }],
        activities: [],
    }).domain;
    assert.equal(createGameView({ domain: pushDomain }).activeGame.bet, 75);
    const currentPushTransition = drawGamePushCard(replayGameEvents(pushDomain).activeGame.game);
    assert.equal(currentPushTransition.kind, 'settled');
    assert.equal(currentPushTransition.settlement.payout, 80);
    pushDomain = append(pushDomain, 3, {
        kind: 'push-cash-out', gameId: push.id,
    }, {
        changes: [{ kind: 'game-ended', gameId: push.id }],
        activities: [{
            id: 'activity-push-frozen-policy', sourceId: push.id,
            detail: { kind: 'push', outcome: 'cashed-out', revealedCoins: 1 },
            amountIn: 75, payout: 30, net: -45,
        }],
    }).domain;
    assert.equal(flattenGameActivities(pushDomain)[0].payout, 30);

    const ladder = { id: 'ladder-frozen-policy', bet: 40, riskBase: 37, steps: [] };
    let ladderDomain = append(createEmptyGameDomain(), 1, {
        kind: 'ladder-start', gameId: ladder.id, bet: ladder.bet,
    }, {
        changes: [{ kind: 'game-started', game: { kind: 'ladder', game: ladder } }],
        activities: [],
    }).domain;
    for (let floor = 1; floor <= 6; floor += 1) {
        const previous = replayGameEvents(ladderDomain).activeGame.game;
        const next = {
            ...previous,
            steps: [...previous.steps, { floor, choice: 'safe', amountAfterSuccess: 30 + floor * 10 }],
        };
        ladderDomain = append(ladderDomain, floor + 1, {
            kind: 'ladder-step', gameId: ladder.id, choice: 'safe',
        }, {
            changes: [{ kind: 'game-advanced', game: { kind: 'ladder', game: next } }],
            activities: [],
        }).domain;
    }
    const activeLadder = replayGameEvents(ladderDomain).activeGame.game;
    assert.deepEqual(createGameView({ domain: ladderDomain }).activeGame.legalActions, ['cash-out']);
    ladderDomain = append(ladderDomain, 8, {
        kind: 'ladder-cash-out', gameId: ladder.id,
    }, {
        changes: [{ kind: 'game-ended', gameId: ladder.id }],
        activities: [{
            id: 'activity-ladder-frozen-policy', sourceId: ladder.id,
            detail: {
                kind: 'ladder', outcome: 'cashed-out',
                steps: activeLadder.steps.map(step => ({
                    floor: step.floor,
                    choice: step.choice,
                    success: true,
                    amountAfterStep: step.amountAfterSuccess,
                })),
            },
            amountIn: 40, payout: 90, net: 50,
        }],
    }).domain;
    assert.equal(flattenGameActivities(ladderDomain)[0].detail.steps.length, 6);
});

test('CAS append is immutable and idempotent action replay precedes stale-token checks', () => {
    const push = createGamePushGame({ id: 'push-cas' }, createGameSequenceRandom(Array(9).fill(0)));
    const empty = createEmptyGameDomain();
    const firstInput = eventInput(empty, 1, {
        kind: 'push-start', gameId: push.id,
    }, {
        changes: [{ kind: 'game-started', game: { kind: 'push', game: push } }],
        activities: [],
    });
    const first = appendGameEvent(empty, firstInput);
    const second = advancePush(first.domain, 2, push);
    const replay = appendGameEvent(second.domain, firstInput);

    assert.equal(first.created, true);
    assert.equal(replay.created, false);
    assert.equal(replay.event.eventId, 'game-event-1');
    assert.equal(replay.domain.events.length, 2);
    assert.deepEqual(empty, createEmptyGameDomain());
    replay.state.activeGame.game.deck.reverse();
    assert.deepEqual(second.domain.events[1].result.changes[0].game.game.deck, second.state.activeGame.game.deck);

    assert.throws(() => appendGameEvent(second.domain, {
        ...firstInput,
        command: { kind: 'push-draw', gameId: push.id },
    }), error => error.code === 'game_action_conflict');
    assert.throws(() => cashOutPush(second.domain, 3, second.state.activeGame.game, {
        expectedRevision: 0,
        expectedEventId: '',
    }), error => error.code === 'game_revision_conflict');
});

test('public views hide live decks and dealer dice, publish settled hands, and stay deep copies', () => {
    const push = createGamePushGame({ id: 'private-push' }, createGameSequenceRandom(Array(9).fill(0)));
    const pushDomain = startPush(createEmptyGameDomain(), 1, push).domain;
    const pushView = createGameView({ domain: pushDomain });
    assert.equal(Object.hasOwn(pushView.activeGame, 'deck'), false);
    assert.equal(JSON.stringify(pushView).includes('deck'), false);
    pushView.activeGame.legalActions[0] = 'cash-out';
    assert.equal(replayGameEvents(pushDomain).activeGame.game.drawIndex, 0);

    const dice = createGameDiceGame(
        { id: 'private-dice', bet: 50 },
        createGameSequenceRandom(Array(10).fill(0)),
    );
    let diceDomain = append(createEmptyGameDomain(), 1, {
        kind: 'dice-start', gameId: dice.id, bet: dice.bet,
    }, {
        changes: [{ kind: 'game-started', game: { kind: 'dice', game: dice } }],
        activities: [],
    }).domain;
    const activeView = createGameView({ domain: diceDomain });
    assert.equal(Object.hasOwn(activeView.activeGame, 'dealerDice'), false);

    const terminal = respondToGameDicePlayerBid(dice, { count: 10, face: 6 }, createGameSequenceRandom([]));
    if (terminal.kind !== 'settled') {assert.fail('maximum bid must settle');}
    const settled = terminal.settlement;
    diceDomain = append(diceDomain, 2, {
        kind: 'dice-bid', gameId: dice.id, bid: { count: 10, face: 6 },
    }, {
        changes: [{ kind: 'game-ended', gameId: dice.id }],
        activities: [{
            id: 'activity-private-dice',
            sourceId: dice.id,
            detail: {
                kind: 'dice', outcome: settled.outcome, challenger: settled.challenger,
                finalBid: settled.finalBid, bids: settled.bids, playerDice: settled.playerDice,
                dealerDice: settled.dealerDice, matchingDiceCount: settled.matchingDiceCount,
            },
            amountIn: dice.bet,
            payout: settled.payout,
            net: settled.payout - dice.bet,
        }],
    }).domain;
    const terminalView = createGameView({ domain: diceDomain });
    // A settled hand is a showdown: the dealer's dice become public so the
    // player can see how the challenge actually resolved. Hiding them while the
    // game is live is asserted above.
    assert.deepEqual(terminalView.activities[0].detail.dealerDice, [...settled.dealerDice]);
    terminalView.activities[0].detail.dealerDice[0] = 6;
    assert.deepEqual(
        createGameView({ domain: diceDomain }).activities[0].detail.dealerDice,
        [...settled.dealerDice],
    );
});
