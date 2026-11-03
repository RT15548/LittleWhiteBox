import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { applyDiceCandidate, captureDiceTarget, clearNewDiceSwipe, clearDiceMessageData, collectDiceCheckIds, readDiceRecords, isDiceTargetCurrent } from '../apps/dice/host/message-records.ts';
import { createActionCheckSession } from '../apps/dice/application/action-check-session.ts';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';
import { DICE_RECORDS_SCHEMA_VERSION } from '../apps/dice/domain/check-records.ts';

const call = '<xb_action_check>{"action":"Climb","stat":"Agility","difficulty":"hard"}</xb_action_check>';
function fixture() {
    const message = { name: 'Mira', mes: `Attempt.\n\n${call}`, extra: { other: { keep: 1 } }, swipe_id: 1,
        swipes: ['Old reply', `Attempt.\n\n${call}`], swipe_info: [{ extra: { other: 'old' } }, { extra: { reasoning: 'retained' } }] };
    const source = { key: 'character:mira:chat', chatId: 'chat', chat: [message], characterId: 0, characterName: 'Mira', avatar: 'mira.png' };
    const target = captureDiceTarget(source, 0, 0);
    const candidate = prepareActionCheck({ body: message.mes, generatedFrom: 0, id: 'one', random: () => .3 });
    return { source, target, message, candidate };
}
function createSession(source, overrides) {
    return createActionCheckSession({ enabled: () => true,
        current: target => isDiceTargetCurrent(source, target), same: (a, b) => a.message === b.message && a.swipe === b.swipe,
        ready: async () => {}, saveRecovered: async () => {}, reveal: async () => {}, changed() {}, id: () => 'id',
        apply: (target, candidate) => applyDiceCandidate(source, target, candidate), ...overrides });
}

test('free-roll persistence does not hold the choice or request the model; continuation uses the same result', async () => {
    const { source, target } = fixture();
    let saves = 0, samples = 0, continuations = 0;
    const busy = [];
    const session = createSession(source, {
        random: () => { samples++; return .3; }, busy: value => busy.push(value),
        saveRecovered: () => { saves++; },
        continue: async () => { continuations++; return null; },
    });
    session.accept(target); await session.drain();
    assert.equal(session.view().phase.kind, 'awaiting-choice');
    assert.deepEqual(busy, []);
    assert.equal(continuations, 0);
    await session.continueCheck(session.view().target);
    assert.equal(samples, 2);
    assert.equal(saves, 0);
    assert.equal(continuations, 1);
});

test('applying a check after editing upstream prose upgrades only the active swipe and retains all prior results', () => {
    const message = JSON.parse(readFileSync(new URL('./fixtures/dice-message-a32c28d0.json', import.meta.url), 'utf8'));
    message.mes = 'Rewritten approach. [dice:wall]\n\n' + call;
    message.swipes[0] = message.mes;
    message.swipes.push('Inactive reply.');
    message.swipe_info.push({ extra: { foreign: true, xiaobaiOsDice: structuredClone(message.extra.xiaobaiOsDice) } });
    const original = structuredClone(message);
    const { source } = fixture();
    source.chat = [message];
    const target = captureDiceTarget(source, 0, message.mes.indexOf(call));
    let samples = 0;
    const candidate = prepareActionCheck({ body: target.body, records: target.records,
        generatedFrom: target.generatedFrom, id: 'new', random: () => { samples++; return .3; } });
    applyDiceCandidate(source, target, candidate);
    assert.equal(samples, 2);
    assert.deepEqual(target.records, original.extra.xiaobaiOsDice, 'captured upstream data is not rewritten');
    assert.deepEqual(message.extra.xiaobaiOsDice, candidate.records);
    assert.equal(message.extra.xiaobaiOsDice.schemaVersion, DICE_RECORDS_SCHEMA_VERSION);
    assert.equal(message.extra.xiaobaiOsDice.checks.length, 3, 'deleting a reference does not delete saved history');
    assert.deepEqual(message.swipe_info[0].extra.xiaobaiOsDice, candidate.records);
    assert.deepEqual(message.swipe_info[1], original.swipe_info[1]);
    assert.equal(message.swipes[1], original.swipes[1]);
    assert.equal(message.extra.keep, original.extra.keep);
    assert.equal(message.mes, candidate.body);
});

test('applying a result updates the active message and swipe together without replacing foreign fields or other swipes', () => {
    const { source, target, candidate, message } = fixture();
    const before = message.swipe_info[0];
    applyDiceCandidate(source, target, candidate);
    assert.equal(message.mes, 'Attempt.\n\n[dice:one]');
    assert.equal(message.swipes[1], message.mes);
    assert.deepEqual(message.extra.other, { keep: 1 });
    assert.equal(message.swipe_info[1].extra.reasoning, 'retained');
    assert.equal(message.swipe_info[0], before);
    assert.deepEqual(message.swipe_info[1].extra.xiaobaiOsDice, candidate.records);
    assert.deepEqual(readDiceRecords(message), candidate.records);
    assert.throws(() => applyDiceCandidate(source, target, candidate), 'an old target cannot be applied twice');
});

test('stale chat, message, swipe, body or record snapshots cannot be overwritten by a prepared result', () => {
    for (const change of [
        source => ({ ...source, key: 'other-chat' }),
        source => ({ ...source, chat: [...source.chat] }),
        source => { source.chat.push({ mes: 'New message' }); return source; },
        source => { source.chat[0] = structuredClone(source.chat[0]); return source; },
        source => { source.chat[0].swipe_id = 0; return source; },
        source => { source.chat[0].mes = 'Edited body'; return source; },
        source => { source.chat[0].extra.xiaobaiOsDice = { schemaVersion: DICE_RECORDS_SCHEMA_VERSION, checks: [] }; return source; },
    ]) {
        const { source, target, candidate } = fixture();
        const current = change(source);
        const before = structuredClone([source.chat, current.chat, target.message]);
        assert.throws(() => applyDiceCandidate(current, target, candidate));
        assert.deepEqual([source.chat, current.chat, target.message], before);
    }
});

test('new swipe and selected-chat cleanup remove only Dice-owned facts', () => {
    const { message, candidate } = fixture();
    message.mes = '【1】之前。[dice:one]【8】之后。';
    message.swipes = ['历史。[dice:old]尾部。', message.mes];
    message.extra.xiaobaiOsDice = candidate.records;
    message.swipe_info[0].extra.xiaobaiOsDice = candidate.records;
    clearNewDiceSwipe(message);
    assert.equal(readDiceRecords(message), undefined);
    assert.deepEqual(message.swipe_info[0].extra.xiaobaiOsDice, candidate.records);
    // Actual ownership belongs to each candidate, never to the marker-shaped text alone.
    message.extra.xiaobaiOsDice = candidate.records;
    message.swipe_info[0].extra.xiaobaiOsDice = prepareActionCheck({ body: call, generatedFrom: 0, id: 'old', random: () => .3 }).records;
    clearDiceMessageData([message]);
    assert.equal(message.mes, '【1】之前。【8】之后。');
    assert.deepEqual(message.swipes, ['历史。尾部。', message.mes]);
    assert.equal(message.swipe_info[0].extra.xiaobaiOsDice, undefined);
    assert.equal(message.swipe_info[0].extra.other, 'old');
});

test('cleanup preserves literal marker examples and matches ownership separately for each swipe', () => {
    const { candidate } = fixture();
    const other = prepareActionCheck({ body: call, generatedFrom: 0, id: 'two', random: () => .3 });
    const user = { is_user: true, mes: 'Explain `[dice:one]` and [dice:example].' };
    const sample = { mes: 'Example: [dice:one]', swipes: ['Example: [dice:one]'] };
    const message = { mes: 'Active [dice:one] literal [dice:two]', extra: { xiaobaiOsDice: candidate.records, display_text: '译文 [dice:one] 示例 [dice:two]' }, swipe_id: 1,
        swipes: ['Other [dice:two] literal [dice:one]', 'Active [dice:one] literal [dice:two]'],
        swipe_info: [{ extra: { xiaobaiOsDice: other.records, display_text: '旧译文 [dice:two] 示例 [dice:one]' } },
            { extra: { xiaobaiOsDice: candidate.records, display_text: '译文 [dice:one]' } }] };
    const unchanged = structuredClone([user, sample]);
    const before = structuredClone([user, sample, message]);
    assert.deepEqual(collectDiceCheckIds([user, sample, message]), new Set(['one', 'two']));
    assert.deepEqual([user, sample, message], before);
    const changed = clearDiceMessageData([user, sample, message]);
    assert.deepEqual([user, sample], unchanged);
    assert.deepEqual([...changed], [message]);
    assert.equal(message.mes, 'Active  literal [dice:two]');
    assert.deepEqual(message.swipes, ['Other  literal [dice:one]', 'Active  literal [dice:two]']);
    assert.equal(message.extra.display_text, '译文  示例 [dice:two]');
    assert.equal(message.swipe_info[0].extra.display_text, '旧译文  示例 [dice:one]');
    assert.equal(message.swipe_info[1].extra.display_text, '译文 ');
});

test('session applies once before continuing; request failure and explicit retry reuse the same in-memory result', async () => {
    const { source, target } = fixture();
    let randomCalls = 0;
    let continuations = 0;
    let rejected = true;
    let applications = 0;
    const session = createSession(source, {
        apply: (target, candidate) => { applications++; applyDiceCandidate(source, target, candidate); },
        random: () => { randomCalls++; return .3; },
        continue: async (current, candidate) => {
            continuations++;
            assert.deepEqual(readDiceRecords(current.message), candidate.records);
            if (rejected) return null;
            current.message.mes += '\n\nAfterward.';
            return captureDiceTarget(source, 0, candidate.body.length);
        } });
    session.accept(target);
    await Promise.all([session.drain(), session.drain()]);
    assert.equal(session.view().phase.kind, 'awaiting-choice');
    assert.equal(continuations, 0);
    await session.continueCheck(captureDiceTarget(source, 0, 0));
    assert.equal(session.view().phase.kind, 'continue-error');
    const retained = structuredClone(session.view().phase.candidate.records);
    assert.equal(retained.checks[0].dc, 12);
    assert.equal(retained.checks[0].roll, 7);
    assert.equal(randomCalls, 2); assert.equal(continuations, 1);
    rejected = false;
    await session.continueCheck(captureDiceTarget(source, 0, 0));
    assert.equal(randomCalls, 2); assert.equal(continuations, 2);
    assert.equal(applications, 1);
    assert.deepEqual(readDiceRecords(source.chat[0]), retained);
    assert.equal(session.view(), null);
});

test('a recreated session continues a message result without sampling, applying or revealing it again', async () => {
    const { source, target, candidate } = fixture();
    applyDiceCandidate(source, target, candidate);
    source.chat = JSON.parse(JSON.stringify(source.chat));
    const restored = captureDiceTarget(source, 0, 0);
    let continuations = 0;
    const session = createSession(source, { id: () => assert.fail('restored checks already have an ID'),
        random: () => assert.fail('restored targets and dice must not be sampled again'),
        apply: () => assert.fail('the restored result is already in the message'),
        reveal: async () => assert.fail('the restored result is already revealed'),
        continue: async (_target, saved) => {
            continuations++;
            assert.deepEqual(saved.records, candidate.records);
            assert.equal(saved.records.checks[0].dc, 12);
            assert.equal(saved.records.checks[0].roll, 7);
            source.chat[0].mes += '\n\nAfter reload.';
            return captureDiceTarget(source, 0, saved.body.length);
        } });
    await session.continueCheck(restored);
    assert.equal(continuations, 1);
    assert.equal(session.view(), null);
    assert.deepEqual(readDiceRecords(source.chat[0]), candidate.records);
});

// Presentation follows the in-memory result, not a network write or a second random operation.
test('fresh result waits for reveal; stop, target edits, and recovery cannot reroll or send early', async () => {
    for (const ending of ['finish', 'cancel', 'edit']) {
        const { source, target } = fixture();
        const steps = [];
        let release;
        let started;
        const shown = new Promise(resolve => { started = resolve; });
        const session = createSession(source, { id: () => 'revealed',
            apply: (target, candidate) => { applyDiceCandidate(source, target, candidate); steps.push('apply'); },
            random: () => { steps.push('sample'); return .3; },
            reveal: async (_target, candidate, signal) => {
                assert.deepEqual(readDiceRecords(source.chat[0]), candidate.records);
                steps.push('reveal'); started();
                await new Promise(resolve => { release = resolve; signal.addEventListener('abort', resolve, { once: true }); });
            },
            continue: async () => { steps.push('continue'); return null; },
        });
        session.accept(target);
        const operation = session.drain();
        await shown;
        assert.deepEqual(steps, ['sample', 'sample', 'apply', 'reveal']);
        await session.drain();
        if (ending === 'cancel') session.cancel();
        if (ending === 'edit') source.chat[0].mes = 'Edited action. [dice:revealed]';
        release(); await operation;
        assert.equal(readDiceRecords(source.chat[0]).checks[0].roll, 7);
        if (ending === 'edit') {
            assert.equal(session.view(), null);
            assert.equal(source.chat[0].mes, 'Edited action. [dice:revealed]');
        }
        if (ending !== 'finish') assert.deepEqual(steps, ['sample', 'sample', 'apply', 'reveal']);
        else {
            assert.equal(session.view().phase.kind, 'awaiting-choice');
            assert.deepEqual(steps, ['sample', 'sample', 'apply', 'reveal']);
        }
        await session.continueCheck(captureDiceTarget(source, 0, 0));
        assert.equal(steps.filter(step => step === 'sample').length, 2);
        assert.equal(steps.filter(step => step === 'reveal').length, 1);
        assert.equal(steps.at(-1), 'continue');
    }
});

test('a retry readiness failure retains the same candidate until recovery succeeds', async () => {
    const { source, target } = fixture();
    let randomCalls = 0;
    let failReadiness = false;
    let failOperation = true;
    let continuations = 0;
    const session = createSession(source, {
        ready: async () => { if (failReadiness) throw new Error('host_generation_pending'); },
        id: () => 'retained', random: () => { randomCalls++; return .3; },
        continue: async (_current, candidate) => {
            continuations++;
            if (failOperation) return null;
            source.chat[0].mes += '\n\nAfterward.';
            return captureDiceTarget(source, 0, candidate.body.length);
        } });
    session.accept(target);
    await session.drain();
    await session.continueCheck(captureDiceTarget(source, 0, 0));
    const candidate = structuredClone(session.view().phase.candidate);
    assert.equal(session.view().phase.kind, 'continue-error');
    failReadiness = true;
    const before = continuations;
    await session.continueCheck(captureDiceTarget(source, 0, 0));
    assert.equal(session.view().phase.kind, 'continue-error');
    assert.deepEqual(session.view().phase.candidate, candidate);
    assert.equal(randomCalls, 2);
    assert.equal(continuations, before);
    failReadiness = false; failOperation = false;
    await session.continueCheck(captureDiceTarget(source, 0, 0));
    assert.equal(session.view(), null);
    assert.equal(randomCalls, 2);
    assert.deepEqual(readDiceRecords(source.chat[0]), candidate.records);
});

test('target changes and cancellation during retry readiness prevent continuation and discard eligibility', async () => {
    for (const reason of ['changed', 'cancelled']) {
        const { source, target } = fixture();
        let rejectWait;
        let retrying = false;
        let continuations = 0;
        let randomCalls = 0;
        const session = createSession(source, {
            ready: () => retrying ? new Promise((_resolve, reject) => { rejectWait = reject; }) : Promise.resolve(),
            id: () => 'retained', random: () => { randomCalls++; return .3; },
            continue: async () => { continuations++; return null; } });
        session.accept(target);
        await session.drain();
        await session.continueCheck(captureDiceTarget(source, 0, 0));
        retrying = true;
        const retry = session.continueCheck(captureDiceTarget(source, 0, 0));
        if (reason === 'changed') source.chat[0].mes = 'User edit';
        else session.cancel();
        rejectWait(new Error(reason));
        await retry;
        assert.equal(session.view(), null);
        assert.equal(continuations, 1);
        assert.equal(randomCalls, 2);
        assert.equal(readDiceRecords(source.chat[0]).checks.length, 1);
    }
});
