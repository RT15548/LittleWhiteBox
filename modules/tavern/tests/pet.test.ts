import assert from 'node:assert/strict';
import test from 'node:test';

import {
    canonicalTavernPetStaticVerdict,
    isTavernPetVerdictText,
    TAVERN_PET_CURIOS,
    TAVERN_PET_INTERFERENCE_COPY,
    TAVERN_PET_REGULAR_CURIO_IDS,
    TAVERN_PET_STATIC_VERDICTS,
    renderTavernPetInterferenceText,
    renderTavernPetTemplate,
} from '../shared/pet/pet-copy';
import {
    buildTavernPetChatMessages,
    buildTavernPetEvolutionMessages,
    normalizeTavernPetChatResponse,
    normalizeTavernPetPlayerText,
    parseTavernPetChatResponse,
    parseTavernPetEvolutionVerdict,
    tavernPetStaticEvolutionVerdict,
} from '../shared/pet/pet-chat';
import {
    TAVERN_PET_EVENTS,
    collectTavernPetEventCandidates,
} from '../shared/pet/pet-events';
import {
    assertTavernPetStateInvariant,
    parseCanonicalTavernPetActionRecord,
    parseCanonicalTavernPetCompanionRecord,
    parseCanonicalTavernPetJournalRecord,
} from '../shared/pet/pet-invariants';
import {
    TAVERN_PET_JUVENILE_PROFILE,
    TAVERN_PET_PERSONAS,
    tavernPetFaceForEmotion,
} from '../shared/pet/pet-personas';
import {
    createTavernPetSequenceRandomSource,
    drawTavernPetOrigin,
} from '../shared/pet/pet-random';
import {
    advanceTavernPetTurn,
    applyTavernPetAxesDelta,
    applyTavernPetChatResponse,
    applyTavernPetInteraction,
    createTavernPetInteractionWindow,
    createTavernPetLuringState,
    deriveTavernPetPersona,
    setTavernPetEmotion,
    tavernPetBaselineEmotion,
    wakeTavernPetState,
} from '../shared/pet/pet-rules';
import {
    TAVERN_PET_EVENT_IDS,
    TAVERN_PET_PERSONA_IDS,
    type TavernPetChatResponse,
    type TavernPetCompanionRecord,
    type TavernPetJournalRecord,
    type TavernPetState,
    type TavernPetTurnContext,
} from '../shared/pet/pet-types';
import { createTavernPetView } from '../shared/pet/pet-view';
import { createTavernPetTestState, PET_TEST_ORIGIN } from './pet-test-helpers';

function turnContext(
    petTurn: number,
    overrides: Partial<TavernPetTurnContext> = {},
): TavernPetTurnContext {
    return {
        sourceSessionId: 'session-a',
        sourceTurn: petTurn + 40,
        sourceAnchorOrder: petTurn * 2,
        petTurn,
        recentExternalSpend: 0,
        playerBalance: 100,
        knownTargetName: '',
        evolutionRequestId: `evolution:${petTurn}`,
        ...overrides,
    };
}

function clone<T>(value: T): T {
    return structuredClone(value);
}

function stateAt(phase: 'luring' | 'egg' | 'juvenile' | 'adult', overrides: Partial<TavernPetState> = {}): TavernPetState {
    return createTavernPetTestState(phase, overrides);
}

function tracingSequence(values: readonly number[]) {
    const source = createTavernPetSequenceRandomSource(values);
    const calls: number[] = [];
    return {
        calls,
        random: {
            nextInt(maxExclusive: number): number {
                calls.push(maxExclusive);
                return source.nextInt(maxExclusive);
            },
        },
    };
}

function journal(detail: TavernPetJournalRecord['detail']): TavernPetJournalRecord {
    return {
        id: 'journal-1',
        sourceActionId: 'action-1',
        sourceSessionId: 'session-a',
        sourceTurn: 1,
        sourceAnchorOrder: 2,
        petTurn: 1,
        detail,
        coinDelta: 0,
        createdAt: 1,
    };
}

test('chat boundary is forgiving while canonical persistence stays strict', () => {
    const state = createTavernPetTestState('juvenile');
    const face = TAVERN_PET_JUVENILE_PROFILE.faces.default;

    const laterObject = parseTavernPetChatResponse('{}\n{"response":{"text":"后来写对了"}}', state);
    assert.equal(laterObject.response.text, '后来写对了');
    assert.equal(laterObject.response.motion, 'none');

    const faceOnly = parseTavernPetChatResponse(JSON.stringify({ face }), state);
    assert.equal(faceOnly.response.face, face);
    assert.equal(faceOnly.response.text, face);

    const plain = parseTavernPetChatResponse('```\n只是普通正文\n```', state);
    assert.equal(plain.response.text, '只是普通正文');

    const noisy = parseTavernPetChatResponse(JSON.stringify({
        text: '啊'.repeat(121),
        face: 'not-a-face',
        motion: 'spin',
        emotionShift: 'wrong',
        murmur: 1,
        extra: true,
    }), state);
    assert.equal([...noisy.response.text].length, 120);
    assert.equal(noisy.response.motion, 'none');
    assert.equal(noisy.response.emotionShift, null);
    assert.equal(noisy.response.murmur, null);
    assert.ok(noisy.warnings.length > 0);

    assert.throws(() => normalizeTavernPetChatResponse({
        face,
        text: '好',
        motion: 'none',
        emotionShift: null,
        murmur: null,
        summaryUpdate: null,
        extra: true,
    }, state), /pet_chat_invalid/);
});

test('player text is normalized then silently clipped by Unicode code point', () => {
    const normalized = normalizeTavernPetPlayerText(` \u337f${'啊'.repeat(119)} `);
    assert.equal(normalized.startsWith('株式会社'), true);
    assert.equal([...normalized].length, 120);
    assert.doesNotThrow(() => buildTavernPetChatMessages({
        state: createTavernPetTestState('juvenile'),
        recentJournal: [],
        playerText: normalized,
    }));
});

test('interference text is restricted to its four event IDs and canonical verdicts stay strict', () => {
    const unexpectedInjectedText = {
        ...journal({
            kind: 'event',
            eventId: 'watch-cursor',
            renderedText: '它看着光标。',
            face: '(・_・)',
            motion: 'none',
        }),
        detail: {
            kind: 'event',
            eventId: 'watch-cursor',
            renderedText: '它看着光标。',
            face: '(・_・)',
            motion: 'none',
            injectedText: 'forged',
        },
    };
    assert.throws(() => parseCanonicalTavernPetJournalRecord(unexpectedInjectedText), /pet_state_invalid:journal\.detail\./);

    const missingInjectedText = {
        ...journal({
            kind: 'event',
            eventId: 'watch-cursor',
            renderedText: '它看着光标。',
            face: '(・_・)',
            motion: 'none',
        }),
        detail: {
            kind: 'event',
            eventId: 'brief-glimpse',
            renderedText: '它朝外看了一眼。',
            face: '(・_・)',
            motion: 'none',
        },
    };
    assert.throws(() => parseCanonicalTavernPetJournalRecord(missingInjectedText), /pet_state_invalid:journal\.detail\./);

    assert.throws(() => parseCanonicalTavernPetActionRecord({
        id: 'action-1',
        revision: 1,
        sourceSessionId: 'session-a',
        sourceTurn: 1,
        sourceAnchorOrder: 2,
        action: { kind: 'resolve-evolution', requestId: 'request-1', verdict: '短。', usedFallback: false },
        createdAt: 1,
    }), /pet_state_invalid/);
    assert.equal(isTavernPetVerdictText('它经过了一段漫长而安静的成长。它终于长成了自己的轮廓。它现在会认真看着玻璃外的人。'), true);

    const text = renderTavernPetInterferenceText('nibble-sleeve', '宠物店老板');
    assert.match(text, /【宠物店老板】/u);
});

test('dormancy consumes the global pet clock without consuming active evolution cooldown', () => {
    const state = createTavernPetTestState('adult', {
        petTurn: 10,
        phaseTurnCount: 10,
        lastEvolutionActiveTurn: 0,
        dormant: true,
        axes: { tameness: 0, generosity: 0, brightness: 0 },
    });
    let sleeping = state;
    for (let turn = 11; turn <= 40; turn += 1) {
        sleeping = advanceTavernPetTurn(
            sleeping,
            turnContext(turn),
            createTavernPetSequenceRandomSource([99]),
        ).state;
    }
    assert.equal(sleeping.petTurn, 40);
    assert.equal(sleeping.phaseTurnCount, 10);

    const awake = wakeTavernPetState(sleeping, sleeping.petTurn);
    const active = advanceTavernPetTurn(
        awake,
        turnContext(41),
        createTavernPetSequenceRandomSource([99]),
    ).state;
    assert.equal(active.phaseTurnCount, 11);
    assert.equal(active.pendingEvolution, undefined);
});

test('the pure turn rule advances only the global pet clock', () => {
    const luring = createTavernPetLuringState({ origin: PET_TEST_ORIGIN, petTurn: 4 });
    const transition = advanceTavernPetTurn(
        luring,
        { ...turnContext(5), sourceTurn: 999 },
        createTavernPetSequenceRandomSource([99]),
    );
    assert.equal(transition.state.petTurn, 5);
    assert.equal(transition.state.phase, 'egg');
});

test('pet catalogs keep the reviewed thirty events, personas, curios and verdicts frozen', () => {
    assert.deepEqual(Object.keys(TAVERN_PET_PERSONAS), [...TAVERN_PET_PERSONA_IDS]);
    assert.equal(Object.keys(TAVERN_PET_PERSONAS).length, 9);
    const profiles = [TAVERN_PET_JUVENILE_PROFILE, ...Object.values(TAVERN_PET_PERSONAS)];
    assert.equal(profiles.length, 10);
    profiles.forEach((profile) => {
        assert.equal(Object.keys(profile.faces).length, 8);
        assert.equal(Object.isFrozen(profile), true);
        assert.equal(Object.isFrozen(profile.faces), true);
    });
    assert.equal(Object.keys(TAVERN_PET_CURIOS).length, 6);
    assert.deepEqual(TAVERN_PET_REGULAR_CURIO_IDS, ['bottle-cap', 'glass-bead', 'paper-star', 'rusted-key', 'old-ticket']);
    assert.equal(TAVERN_PET_EVENTS.length, 30);
    assert.deepEqual(TAVERN_PET_EVENTS.map((event) => event.id), [...TAVERN_PET_EVENT_IDS]);
    assert.deepEqual(TAVERN_PET_EVENTS.reduce<Record<string, number>>((counts, event) => {
        counts[event.category] = (counts[event.category] || 0) + 1;
        return counts;
    }, {}), {
        milestone: 4,
        ambient: 8,
        mischief: 8,
        foray: 6,
        interference: 4,
    });
    Object.values(TAVERN_PET_STATIC_VERDICTS)
        .forEach((verdict) => assert.equal(isTavernPetVerdictText(verdict), true));
});

test('reviewed copy slots and random draw order remain explicit without persisting replay draws', () => {
    assert.equal(renderTavernPetTemplate('[[displayName]] / [[amount]]', {
        displayName: '实验体 #072',
        amount: 10,
    }), '实验体 #072 / 10');
    assert.throws(() => renderTavernPetTemplate('[[unknownSlot]]', {}), /pet_template_slot_unknown/);
    assert.throws(() => renderTavernPetTemplate('[[amount]]', {}), /pet_template_slot_missing/);
    Object.values(TAVERN_PET_INTERFERENCE_COPY).forEach((template) => {
        assert.doesNotMatch(template, /宠物|实验体|手机生物|缸中之脑|玩家饲养/u);
    });

    const originRandom = tracingSequence([71, 2, 0, 14, 29]);
    assert.deepEqual(drawTavernPetOrigin(originRandom.random), {
        specimenNumber: 72,
        arrivalAfterTurns: 3,
        birthBias: { tameness: -15, generosity: -1, brightness: 15 },
    });
    assert.deepEqual(originRandom.calls, [999, 3, 30, 30, 30]);

    const failedGate = tracingSequence([99]);
    const failed = advanceTavernPetTurn(stateAt('juvenile'), turnContext(1), failedGate.random);
    assert.equal(failed.outcome.eventId, undefined);
    assert.deepEqual(failedGate.calls, [100]);
    const passedGate = tracingSequence([0, 0]);
    const passed = advanceTavernPetTurn(stateAt('juvenile'), turnContext(1), passedGate.random);
    assert.equal(passed.outcome.eventId, 'watch-cursor');
    assert.deepEqual(passedGate.calls.slice(0, 1), [100]);
    assert.ok(passedGate.calls[1] > 1);
});

test('interaction, emotion and persona rules preserve their phase-local behavior', () => {
    const adult = stateAt('adult', {
        axes: { tameness: 0, generosity: 0, brightness: 0 },
        personaId: 'blank',
        dormant: true,
        satiety: 0,
    });
    applyTavernPetAxesDelta(adult, { tameness: 4, generosity: -2, brightness: 2 });
    assert.deepEqual(adult.axes, { tameness: 2, generosity: -1, brightness: 1 });
    const awake = wakeTavernPetState(adult, 4);
    assert.equal(awake.phase, 'adult');
    assert.equal(awake.dormant, false);
    assert.equal(awake.satiety, 30);

    let egg = stateAt('egg');
    egg = applyTavernPetInteraction(egg, 'feed', 0).state;
    egg = applyTavernPetInteraction(egg, 'tap-shell', 0).state;
    egg = applyTavernPetInteraction(egg, 'play-bgm', 0).state;
    assert.deepEqual(egg.axes, { tameness: 0, generosity: 0, brightness: 0 });
    assert.deepEqual(egg.incubation, { feedCount: 1, tapCount: 1, bgmCount: 1 });

    let juvenile = stateAt('juvenile');
    for (let index = 0; index < 7; index += 1) {
        juvenile = applyTavernPetInteraction(juvenile, 'pat', 0).state;
    }
    assert.equal(juvenile.emotion, 'resentful');
    const response: TavernPetChatResponse = {
        face: TAVERN_PET_JUVENILE_PROFILE.faces.happy,
        text: '好',
        motion: 'bounce',
        emotionShift: 'happy',
        murmur: null,
        summaryUpdate: null,
    };
    const firstChat = applyTavernPetChatResponse(stateAt('juvenile'), 0, '你好', response);
    const secondChat = applyTavernPetChatResponse(firstChat.state, 0, '还在吗', response);
    assert.equal(firstChat.appliedAxes, true);
    assert.equal(secondChat.appliedAxes, false);

    const emotionState = stateAt('juvenile', { axes: { tameness: -80, generosity: 0, brightness: -80 } });
    assert.equal(tavernPetBaselineEmotion(emotionState), 'bored');
    emotionState.axes = { tameness: 0, generosity: 0, brightness: 80 };
    assert.equal(tavernPetBaselineEmotion(emotionState), 'happy');
    setTavernPetEmotion(emotionState, 'aggrieved');
    assert.equal(emotionState.emotionRemainingTurns, 4);
    assert.equal(deriveTavernPetPersona({
        axes: { tameness: -30, generosity: 30, brightness: 30 },
        origin: PET_TEST_ORIGIN,
    }), 'wanderer');
});

test('event selection protects stage, wallet, interference and empty-pool contracts', () => {
    const adult = stateAt('adult', {
        axes: { tameness: -30, generosity: -30, brightness: 30 },
        personaId: 'merry-bandit',
        emotion: 'calm',
        satiety: 80,
    });
    const candidates = collectTavernPetEventCandidates({
        state: adult,
        playerBalance: 1_000,
        recentExternalSpend: 0,
        knownTargetName: '',
    });
    assert.equal(candidates.some((candidate) => candidate.spec.id === 'sleep-on-status'), false);
    assert.equal(candidates.find((candidate) => candidate.spec.id === 'fake-alert')?.weight, 10);
    assert.equal(candidates.some((candidate) => candidate.spec.id === 'nibble-sleeve'), false);
    adult.interferenceGateTurns = 1;
    assert.equal(collectTavernPetEventCandidates({
        state: adult,
        playerBalance: 1_000,
        recentExternalSpend: 0,
        knownTargetName: '裴韵',
    }).some((candidate) => candidate.spec.category === 'interference'), false);

    const locked = stateAt('juvenile');
    locked.eventCooldowns = Object.fromEntries(TAVERN_PET_EVENTS
        .filter((event) => event.category !== 'milestone')
        .map((event) => [event.id, 2]));
    const noDraw = tracingSequence([]);
    assert.equal(advanceTavernPetTurn(locked, turnContext(1), noDraw.random).outcome.eventId, undefined);
    assert.deepEqual(noDraw.calls, []);
});

test('arrival, hatch, adulthood and repattern outrank ordinary events', () => {
    const arrival = advanceTavernPetTurn(stateAt('luring'), turnContext(1), createTavernPetSequenceRandomSource([]));
    assert.equal(arrival.state.phase, 'egg');
    assert.equal(arrival.outcome.milestoneId, 'arrival');

    const hatch = advanceTavernPetTurn(stateAt('egg', {
        phaseTurnCount: 7,
        incubation: { feedCount: 9, tapCount: 7, bgmCount: 4 },
    }), turnContext(1), createTavernPetSequenceRandomSource([]));
    assert.equal(hatch.state.phase, 'juvenile');
    assert.equal(hatch.outcome.milestoneId, 'hatch');

    const adulthood = advanceTavernPetTurn(stateAt('juvenile', { phaseTurnCount: 39 }), turnContext(1), createTavernPetSequenceRandomSource([]));
    assert.equal(adulthood.state.phase, 'adult');
    assert.equal(adulthood.state.pendingEvolution?.milestoneId, 'adulthood');

    const repattern = advanceTavernPetTurn(stateAt('adult', {
        axes: { tameness: -30, generosity: 30, brightness: 30 },
        personaId: 'sunlet',
        phaseTurnCount: 29,
        lastEvolutionActiveTurn: 0,
    }), turnContext(1), createTavernPetSequenceRandomSource([]));
    assert.equal(repattern.state.personaId, 'wanderer');
    assert.equal(repattern.state.pendingEvolution?.previousPersonaId, 'sunlet');
    assert.equal(repattern.outcome.milestoneId, 'repattern');
});

test('public view redacts private axes, requests and chat input while remaining deeply projected', () => {
    const state = stateAt('adult', {
        curios: ['glass-bead'],
        nestCoins: 10,
        pendingEvolution: {
            requestId: 'secret-request',
            milestoneId: 'adulthood',
            personaId: 'sunlet',
            axes: { tameness: 30, generosity: 30, brightness: 30 },
            stats: clone(stateAt('adult').lifetimeStats),
            sourceSessionId: 'secret-source',
            sourceTurn: 1,
            sourcePetTurn: 1,
            sourceAnchorOrder: 2,
        },
    });
    const companion: TavernPetCompanionRecord = {
        id: 'companion', revision: 1, versionId: 'view-1', state, createdAt: 1, updatedAt: 1,
    };
    const privateChat = journal({
        kind: 'chat',
        playerText: '不要回显',
        petText: '知道了',
        face: TAVERN_PET_PERSONAS.sunlet.faces.happy,
        motion: 'bounce',
        murmur: '才没有',
    });
    const view = createTavernPetView({ companion, journal: [privateChat], playerBalance: 100 });
    const serialized = JSON.stringify(view);
    assert.equal(view.pendingEvolution, true);
    assert.equal(view.latestUtterance?.text, '知道了');
    assert.doesNotMatch(serialized, /不要回显|secret-request|chatMemory|eventCooldowns|birthBias|tameness|generosity|brightness/u);
    state.curios.push('paper-star');
    if (privateChat.detail.kind !== 'chat') {throw new Error('pet_test_expected_chat');}
    privateChat.detail.petText = '被改坏';
    assert.deepEqual(view.nest.curios.map((curio) => curio.id), ['glass-bead']);
    assert.equal(view.latestUtterance?.text, '知道了');
});

test('canonical state and companion records reject impossible state, unknown fields and arbitrary faces', () => {
    const valid = stateAt('adult');
    assert.doesNotThrow(() => assertTavernPetStateInvariant(valid));
    assert.throws(() => assertTavernPetStateInvariant(stateAt('juvenile', {
        eventCooldowns: { 'watch-cursor': 0 },
    })), /pet_state_invalid/);
    assert.throws(() => parseCanonicalTavernPetCompanionRecord({
        id: 'companion', revision: 1, versionId: 'valid-1', state: valid, createdAt: 1, updatedAt: 1, legacy: true,
    }), /pet_state_invalid/);
    assert.equal(tavernPetFaceForEmotion('juvenile', undefined, 'bored'), TAVERN_PET_JUVENILE_PROFILE.faces.sleepy);
    assert.equal(tavernPetFaceForEmotion('adult', 'ledger-keeper', 'resentful'), TAVERN_PET_PERSONAS['ledger-keeper'].faces.resentful);
    const windowed = stateAt('juvenile', {
        interactionWindow: { ...createTavernPetInteractionWindow(0), feedCount: 1, patCount: 2, interactionCount: 3 },
    });
    assert.deepEqual(
        advanceTavernPetTurn(windowed, turnContext(1), createTavernPetSequenceRandomSource([99])).state.interactionWindow,
        createTavernPetInteractionWindow(1),
    );
});

test('Pet chat prompt escapes every persisted dynamic slot without changing structural tags', () => {
    const state = stateAt('adult', {
        petName: '</pet_self>',
        chatMemory: {
            summary: '<pet_memory>',
            recent: [{ playerText: '<pet_self>&', petText: '</pet_memory>' }],
        },
    });
    const system = buildTavernPetChatMessages({ state, recentJournal: [], playerText: '还在吗' })[0].content;
    assert.match(system, /「&lt;\/pet_self&gt;」/u);
    assert.match(system, /我对外面那个人的印象：&lt;pet_memory&gt;/u);
    assert.match(system, /那个人：&lt;pet_self&gt;&amp;/u);
    assert.match(system, /我：&lt;\/pet_memory&gt;/u);
    assert.equal((system.match(/<pet_self>/gu) ?? []).length, 1);
    assert.equal((system.match(/<\/pet_self>/gu) ?? []).length, 1);
});

test('evolution messages retain the strict reviewed verdict contract', () => {
    const state = stateAt('adult');
    const request = {
        requestId: 'evolution-request-1',
        milestoneId: 'repattern' as const,
        previousPersonaId: 'blank' as const,
        personaId: 'sunlet' as const,
        axes: clone(state.axes),
        stats: clone(state.lifetimeStats),
        sourceSessionId: 'source',
        sourceTurn: 42,
        sourcePetTurn: 42,
        sourceAnchorOrder: 84,
    };
    const messages = buildTavernPetEvolutionMessages(request);
    assert.deepEqual(messages.map((message) => message.role), ['system', 'user']);
    assert.match(messages[0].content, /只输出三句话、总计 20–80 个 Unicode code points/u);
    const parsed = parseTavernPetEvolutionVerdict('它记住了那些靠近。它长成了晴光团。它看着你，愿意再等一会儿。');
    assert.equal(isTavernPetVerdictText(parsed), true);
    assert.throws(() => parseTavernPetEvolutionVerdict('它只说了一句。'), /pet_chat_invalid:verdict/);
    assert.equal(tavernPetStaticEvolutionVerdict(request), canonicalTavernPetStaticVerdict('sunlet'));
});
