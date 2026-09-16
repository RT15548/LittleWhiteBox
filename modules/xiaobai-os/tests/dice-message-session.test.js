import assert from 'node:assert/strict';
import test from 'node:test';
import { captureDiceTarget, clearNewDiceSwipe, clearDiceMessageData, readDiceRecords, isDiceTargetCurrent } from '../apps/dice/host/message-records.ts';
import { createDiceMessageSave } from '../apps/dice/host/message-save.ts';
import { createActionCheckSession } from '../apps/dice/application/action-check-session.ts';
import { prepareActionCheck } from '../apps/dice/application/prepare-action-check.ts';

const call = '<xb_action_check>{"action":"Climb","stat":"Agility","difficulty":"hard"}</xb_action_check>';
function fixture() {
    const message = { name: 'Mira', mes: `Attempt.\n\n${call}`, extra: { other: { keep: 1 } }, swipe_id: 1,
        swipes: ['Old reply', `Attempt.\n\n${call}`], swipe_info: [{ extra: { other: 'old' } }, { extra: { reasoning: 'retained' } }] };
    const source = { key: 'character:mira:chat', chatId: 'chat', chat: [message], characterId: 0, characterName: 'Mira', avatar: 'mira.png' };
    const target = captureDiceTarget(source, 0, 0);
    const candidate = prepareActionCheck({ body: message.mes, generatedFrom: 0, id: 'one', random: () => .3 });
    return { source, target, message, candidate };
}
const failed = status => ({ status, error: new Error('fixture failure') });

test('candidate save commits active swipe only, preserves foreign fields and does not read after confirmation', async () => {
    const { source, target, candidate, message } = fixture();
    const before = structuredClone(message.swipe_info[0]);
    let reads = 0;
    const saver = createDiceMessageSave({ capture: () => source, save: async guard => {
        assert.equal(guard(), true);
        assert.equal(saver.readConfirmed(message), undefined);
        return { status: 'confirmed' };
    }, read: async () => { reads++; return []; } });
    assert.equal((await saver.commit(target, candidate, new AbortController().signal)).status, 'confirmed');
    assert.equal(reads, 0);
    assert.equal(message.mes, 'Attempt.\n\n[dice:one]');
    assert.equal(message.swipes[1], message.mes);
    assert.deepEqual(message.extra.other, { keep: 1 });
    assert.equal(message.swipe_info[1].extra.reasoning, 'retained');
    assert.deepEqual(message.swipe_info[0], before);
    assert.deepEqual(message.swipe_info[1].extra.xiaobaiOsDice, candidate.records);
    assert.deepEqual(saver.readConfirmed(message), candidate.records);
});

test('unknown acknowledgement confirms by captured chat readback, never the switched chat', async () => {
    const { source, target, candidate, message } = fixture();
    let current = source;
    const saver = createDiceMessageSave({ capture: () => current, save: async () => {
        current = { ...source, key: 'other', chat: [] };
        return failed('unconfirmed');
    }, read: async captured => { assert.equal(captured, source); return structuredClone(source.chat); } });
    assert.equal((await saver.commit(target, candidate, new AbortController().signal)).status, 'confirmed');
    assert.deepEqual(message.extra.xiaobaiOsDice, candidate.records);
});

test('failed or unknown writes do not display unconfirmed rolls and guarded rollback preserves edits', async () => {
    for (const status of ['failed', 'unconfirmed']) {
        const { source, target, candidate, message } = fixture();
        const original = structuredClone(source.chat);
        const saver = createDiceMessageSave({ capture: () => source, save: async () => {
            message.extra.foreign = true;
            return failed(status);
        }, read: async () => original });
        assert.equal((await saver.commit(target, candidate, new AbortController().signal)).status, status);
        assert.equal(readDiceRecords(message), undefined);
        assert.equal(message.mes, target.body);
        assert.equal(message.extra.foreign, true);
    }
    const { source, target, candidate, message } = fixture();
    const saver = createDiceMessageSave({ capture: () => source, save: async () => {
        message.mes = 'User edit'; return failed('failed');
    }, read: async () => [] });
    await saver.commit(target, candidate, new AbortController().signal);
    assert.equal(message.mes, 'User edit');
});

test('explicit save retry checks disk, reuses the same roll, and cannot overwrite a conflicting candidate', async () => {
    const { source, target, candidate } = fixture();
    const old = structuredClone(source.chat);
    let writes = 0;
    let disk = old;
    const saver = createDiceMessageSave({ capture: () => source, save: async () => {
        writes++; return writes === 1 ? failed('unconfirmed') : { status: 'confirmed' };
    }, read: async () => disk });
    await saver.commit(target, candidate, new AbortController().signal);
    disk = [{ ...old[0], mes: 'Changed remotely' }];
    assert.equal((await saver.commit(target, candidate, new AbortController().signal, true)).status, 'conflict');
    assert.equal(writes, 1);
    disk = old;
    assert.equal((await saver.commit(target, candidate, new AbortController().signal, true)).status, 'confirmed');
    assert.equal(writes, 2);
    assert.equal(source.chat[0].extra.xiaobaiOsDice.checks[0].roll, 7);
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
    const changed = clearDiceMessageData([user, sample, message]);
    assert.deepEqual([user, sample], unchanged);
    assert.deepEqual([...changed], [message]);
    assert.equal(message.mes, 'Active  literal [dice:two]');
    assert.deepEqual(message.swipes, ['Other  literal [dice:one]', 'Active  literal [dice:two]']);
    assert.equal(message.extra.display_text, '译文  示例 [dice:two]');
    assert.equal(message.swipe_info[0].extra.display_text, '旧译文  示例 [dice:one]');
    assert.equal(message.swipe_info[1].extra.display_text, '译文 ');
});

test('session waits, saves, then continues; repeat completion and explicit retry never reroll', async () => {
    const { source, target } = fixture();
    let randomCalls = 0;
    let continuations = 0;
    let rejected = true;
    let disk = structuredClone(source.chat);
    const saver = createDiceMessageSave({ capture: () => source, save: async () => {
        if (rejected) { return failed('failed'); }
        disk = structuredClone(source.chat); return { status: 'confirmed' };
    }, read: async () => disk });
    const session = createActionCheckSession({ enabled: () => true, current: target => isDiceTargetCurrent(source, target), same: (a,b) => a.message === b.message && a.swipe === b.swipe,
        ready: async () => {}, reveal: async () => {}, save: saver.commit, changed() {}, id: () => 'id', random: () => { randomCalls++; return .3; },
        continue: async (current, candidate) => {
            continuations++;
            assert.deepEqual(readDiceRecords(current.message), candidate.records);
            current.message.mes += '\n\nAfterward.';
            return captureDiceTarget(source, 0, candidate.body.length);
        } });
    session.accept(target);
    await Promise.all([session.drain(), session.drain()]);
    assert.equal(session.view().phase.kind, 'save-error');
    const retained = structuredClone(session.view().phase.candidate.records);
    assert.equal(retained.checks[0].dc, 12);
    assert.equal(retained.checks[0].roll, 7);
    assert.equal(randomCalls, 2); assert.equal(continuations, 0);
    rejected = false;
    await session.retry(target);
    assert.equal(randomCalls, 2); assert.equal(continuations, 1);
    assert.deepEqual(readDiceRecords(source.chat[0]), retained);
    assert.equal(session.view(), null);
});

test('a recreated session continues the saved random target and die without sampling or saving them again', async () => {
    const { source, target, candidate } = fixture();
    const saver = createDiceMessageSave({ capture: () => source, save: async () => ({ status: 'confirmed' }), read: async () => [] });
    await saver.commit(target, candidate, new AbortController().signal);
    source.chat = JSON.parse(JSON.stringify(source.chat));
    const restored = captureDiceTarget(source, 0, 0);
    let continuations = 0;
    const session = createActionCheckSession({ enabled: () => true,
        current: target => isDiceTargetCurrent(source, target), same: (a,b) => a.message === b.message && a.swipe === b.swipe,
        ready: async () => {}, changed() {}, id: () => assert.fail('restored checks already have an ID'),
        random: () => assert.fail('restored targets and dice must not be sampled again'),
        save: async () => assert.fail('the restored result is already saved'),
        reveal: async () => assert.fail('the restored result is already revealed'),
        continue: async (_target, saved) => {
            continuations++;
            assert.deepEqual(saved.records, candidate.records);
            assert.equal(saved.records.checks[0].dc, 12);
            assert.equal(saved.records.checks[0].roll, 7);
            source.chat[0].mes += '\n\nAfter reload.';
            return captureDiceTarget(source, 0, saved.body.length);
        } });
    await session.retry(restored);
    assert.equal(continuations, 1);
    assert.equal(session.view(), null);
    assert.deepEqual(readDiceRecords(source.chat[0]), candidate.records);
});

test('cancellation while save is in flight prevents late confirmed continuation', async () => {
    const { source, target } = fixture();
    let release;
    let continueCalls = 0;
    const saving = new Promise(resolve => { release = resolve; });
    const saver = createDiceMessageSave({ capture: () => source, save: () => saving, read: async () => [] });
    const session = createActionCheckSession({ enabled: () => true, current: target => isDiceTargetCurrent(source, target), same: (a,b) => a.message === b.message && a.swipe === b.swipe,
        ready: async () => {}, reveal: async () => {}, save: saver.commit, changed() {}, id: () => 'id',
        continue: async () => { continueCalls++; return null; } });
    session.accept(target);
    const pending = session.drain();
    await Promise.resolve(); await Promise.resolve();
    session.cancel();
    release({ status: 'confirmed' });
    await pending;
    assert.equal(continueCalls, 0);
    assert.equal(readDiceRecords(source.chat[0]).checks.length, 1);
});

// Presentation is a barrier after durable save, not a second random operation or a background timer.
test('fresh result waits for reveal; stop, target edits, and recovery cannot reroll or send early', async () => {
    for (const ending of ['finish', 'cancel', 'edit']) {
        const { source, target } = fixture();
        const steps = [];
        let release;
        let started;
        const shown = new Promise(resolve => { started = resolve; });
        const saver = createDiceMessageSave({ capture: () => source, read: async () => [],
            save: async () => { steps.push('save'); return { status: 'confirmed' }; } });
        const session = createActionCheckSession({ enabled: () => true,
            current: target => isDiceTargetCurrent(source, target), same: (a,b) => a.message === b.message && a.swipe === b.swipe,
            ready: async () => {}, save: saver.commit, changed() {}, id: () => 'revealed',
            random: () => { steps.push('sample'); return .3; },
            reveal: async (_target, candidate, signal) => {
                assert.deepEqual(saver.readConfirmed(source.chat[0]), candidate.records);
                steps.push('reveal'); started();
                await new Promise(resolve => { release = resolve; signal.addEventListener('abort', resolve, { once: true }); });
            },
            continue: async () => { steps.push('continue'); return null; },
        });
        session.accept(target);
        const operation = session.drain();
        await shown;
        assert.deepEqual(steps, ['sample', 'sample', 'save', 'reveal']);
        await session.drain();
        if (ending === 'cancel') session.cancel();
        if (ending === 'edit') source.chat[0].mes = 'Edited action';
        release(); await operation;
        assert.equal(readDiceRecords(source.chat[0]).checks[0].roll, 7);
        if (ending === 'edit') { assert.equal(session.view(), null); continue; }
        if (ending === 'cancel') assert.deepEqual(steps, ['sample', 'sample', 'save', 'reveal']);
        else assert.deepEqual(steps, ['sample', 'sample', 'save', 'reveal', 'continue']);
        await session.retry(captureDiceTarget(source, 0, 0));
        assert.equal(steps.filter(step => step === 'sample').length, 2);
        assert.equal(steps.filter(step => step === 'reveal').length, 1);
        assert.equal(steps.at(-1), 'continue');
    }
});

test('a retry readiness failure retains the same candidate until recovery succeeds', async () => {
    for (const firstFailure of ['save-error', 'continue-error']) {
        const { source, target } = fixture();
        let randomCalls = 0;
        let failReadiness = false;
        let failOperation = true;
        let continuations = 0;
        const original = structuredClone(source.chat);
        const saver = createDiceMessageSave({ capture: () => source, read: async () => original,
            save: async () => failOperation && firstFailure === 'save-error' ? failed('failed') : { status: 'confirmed' } });
        const session = createActionCheckSession({ enabled: () => true,
            current: target => isDiceTargetCurrent(source, target), same: (a,b) => a.message === b.message && a.swipe === b.swipe,
            ready: async () => { if (failReadiness) throw new Error('Host is still saving'); },
            reveal: async () => {}, save: saver.commit, changed() {}, id: () => 'retained', random: () => { randomCalls++; return .3; },
            continue: async (_current, candidate) => {
                continuations++;
                if (failOperation) return null;
                source.chat[0].mes += '\n\nAfterward.';
                return captureDiceTarget(source, 0, candidate.body.length);
            } });
        session.accept(target);
        await session.drain();
        const candidate = structuredClone(session.view().phase.candidate);
        assert.equal(session.view().phase.kind, firstFailure);
        failReadiness = true;
        const before = continuations;
        await session.retry(captureDiceTarget(source, 0, 0));
        assert.equal(session.view().phase.kind, firstFailure);
        assert.deepEqual(session.view().phase.candidate, candidate);
        assert.equal(randomCalls, 2);
        assert.equal(continuations, before);
        failReadiness = false; failOperation = false;
        await session.retry(captureDiceTarget(source, 0, 0));
        assert.equal(session.view(), null);
        assert.equal(randomCalls, 2);
        assert.deepEqual(readDiceRecords(source.chat[0]), candidate.records);
    }
});

test('target changes and cancellation during retry readiness prevent continuation and discard eligibility', async () => {
    for (const reason of ['changed', 'cancelled']) {
        const { source, target } = fixture();
        let rejectWait;
        let retrying = false;
        let continuations = 0;
        let randomCalls = 0;
        const saver = createDiceMessageSave({ capture: () => source, read: async () => [], save: async () => ({ status: 'confirmed' }) });
        const session = createActionCheckSession({ enabled: () => true,
            current: target => isDiceTargetCurrent(source, target), same: (a,b) => a.message === b.message && a.swipe === b.swipe,
            ready: () => retrying ? new Promise((_resolve, reject) => { rejectWait = reject; }) : Promise.resolve(),
            reveal: async () => {}, save: saver.commit, changed() {}, id: () => 'retained', random: () => { randomCalls++; return .3; },
            continue: async () => { continuations++; return null; } });
        session.accept(target);
        await session.drain();
        retrying = true;
        const retry = session.retry(captureDiceTarget(source, 0, 0));
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

test('shutdown waits for staged writes to settle before a restarted reader can see history', async () => {
    const { source, target, candidate, message } = fixture();
    let release;
    let stopped = false;
    const saver = createDiceMessageSave({ capture: () => source,
        save: () => new Promise(resolve => { release = resolve; }), read: async () => [] });
    const operation = saver.commit(target, candidate, new AbortController().signal);
    const shutdown = saver.settled().then(() => { stopped = true; });
    await Promise.resolve();
    assert.equal(stopped, false);
    assert.equal(saver.readConfirmed(message), undefined);
    assert.equal((await saver.commit(target, candidate, new AbortController().signal)).status, 'failed');
    release(failed('failed'));
    await Promise.all([operation, shutdown]);
    assert.equal(stopped, true);
    assert.equal(readDiceRecords(message), undefined);
    assert.equal(message.mes, target.body);
});
