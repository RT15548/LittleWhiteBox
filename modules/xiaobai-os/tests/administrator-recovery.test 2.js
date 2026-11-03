import assert from 'node:assert/strict';
import test from 'node:test';
import { administratorHarness, settled, tick, withLoadedTools } from './administrator-harness.js';
import { createAdministratorData } from '../apps/administrator/domain/data.js';
import { createWorldManagement } from '../apps/world/management/participant.js';

const call = (name, args) => ({ toolCalls: [{ id: 'call', name, arguments: JSON.stringify(args) }] });
async function interruptedWrite({ applied = false, stopped = false } = {}) {
    const h = await administratorHarness(); let release, step = 0;
    h.state.generate = withLoadedTools(['world'], async () => ++step === 1 ? call('ChatRead', { from: 55 }) : call('WorldEdit', { overview: 'changed' }));
    h.state.replace = async input => {
        if (input.candidate.partitions.world?.overview === 'changed') {
            return new Promise(resolve => { release = () => {
                if (applied) { h.state.persisted = structuredClone(input.candidate); }
                resolve({ status: 'unconfirmed', observed: applied ? null : h.state.persisted });
            }; });
        }
        h.state.persisted = structuredClone(input.candidate); return { status: 'confirmed' };
    };
    const sent = await h.request('send', { text: '根据55楼更正概况' });
    while (!release) { await tick(); }
    if (stopped) { await h.request('stop'); }
    release(); await settled(h.runtime); h.state.replace = null;
    return { h, sent };
}

test('a stopped uncertain write can be inspected and abandoned without dispatch or deadlock', async () => {
    const { h } = await interruptedWrite({ stopped: true });
    const writes = h.state.writes.length;
    await h.request('check'); assert.equal(h.state.writes.length, writes); assert.equal(h.conversation.unsaved(), true);
    await assert.rejects(h.request('confirm')); assert.equal(h.state.writes.length, writes);
    await h.request('adopt'); assert.equal(h.conversation.unsaved(), false); assert.equal(h.world.readCurrent().world.overview, '');
    h.state.generate = async () => ({ text: '可继续交流' });
    await h.request('send', { text: '重新核查' }); await settled(h.runtime);
    assert.equal(h.conversation.read().turns.at(-1).status, 'finished');
});

test('owner confirmation cannot bypass the pending write original evidence guard', async () => {
    const { h } = await interruptedWrite();
    h.state.messages[55].swipe_id++;
    const writes = h.state.writes.length;
    const result = await h.world.confirmPending();
    assert.equal(result.status, 'failed'); assert.equal(h.state.writes.length, writes);
    assert.equal(h.world.readCurrent().world.overview, '');
    await h.request('adopt'); assert.equal(h.conversation.unsaved(), false);
});

test('read-back after stop confirms saved business and its receipt without another model request or business write', async () => {
    const { h } = await interruptedWrite({ stopped: true, applied: true });
    const requests = h.state.requests.length, revision = h.state.persisted.partitions.world;
    await h.request('check');
    assert.equal(h.conversation.unsaved(), false);
    assert.equal(h.conversation.read().turns[0].operations.at(-1).status, 'saved');
    const confirmed = JSON.parse(h.conversation.read().turns[0].toolMessages.at(-1).content);
    assert.equal(confirmed.ok, true); assert.equal(confirmed.status, 'saved');
    assert.deepEqual(confirmed.receipt, h.conversation.read().turns[0].operations.at(-1));
    assert.equal(JSON.parse(h.conversation.read().turns[0].toolMessages[1].content).status, 'read');
    assert.deepEqual(h.state.persisted.partitions.world, revision); assert.equal(h.state.requests.length, requests);
    const reload = await administratorHarness(h.state.persisted.partitions);
    assert.equal(reload.conversation.read().turns[0].operations.at(-1).status, 'saved');
    reload.state.generate = async request => {
        assert.deepEqual(JSON.parse(request.messages.filter(message => message.role === 'tool').at(-1).content), confirmed);
        return { text: 'confirmed' };
    };
    await reload.request('send', { text: 'what changed?' }); await settled(reload.runtime);
    assert.equal(reload.conversation.read().turns.at(-1).status, 'finished');
});

test('confirmation persistence failure retries the receipt and tool result together without repeating business', async () => {
    const { h, sent } = await interruptedWrite({ applied: true });
    const business = structuredClone(h.state.persisted.partitions.world), requests = h.state.requests.length;
    h.state.replace = async () => ({ status: 'failed', error: { code: 'offline', message: 'offline', retryable: true } });
    await assert.rejects(h.request('check')); assert.equal(h.conversation.unsaved(), true);
    h.state.replace = null; await h.request('confirm');
    assert.equal(h.conversation.read().turns[0].operations.at(-1).status, 'saved');
    const output = JSON.parse(h.conversation.read().turns[0].toolMessages.at(-1).content);
    assert.equal(output.status, 'saved'); assert.deepEqual(output.receipt, h.conversation.read().turns[0].operations.at(-1));
    assert.equal(h.state.requests.length, requests);
    h.state.generate = async () => ({ text: '已保存' }); await h.request('regenerate', { turnId: sent.turnId }); await settled(h.runtime);
    assert.deepEqual(h.state.persisted.partitions.world, business);
});

test('adopting history after a failed confirmation save retains the verified business outcome', async () => {
    const { h } = await interruptedWrite({ applied: true });
    const business = structuredClone(h.state.persisted.partitions.world), requests = h.state.requests.length;
    h.state.replace = async () => ({ status: 'failed', error: { code: 'offline', message: 'offline', retryable: true } });
    await assert.rejects(h.request('check'));
    h.state.replace = null;
    await h.request('adopt');
    const turn = h.conversation.read().turns[0], result = JSON.parse(turn.toolMessages.at(-1).content);
    assert.equal(result.status, 'saved'); assert.deepEqual(result.receipt, turn.operations.at(-1));
    assert.deepEqual(h.state.persisted.partitions.world, business);
    assert.equal(h.state.requests.length, requests); assert.equal(h.conversation.unsaved(), false);
});

test('confirmed first-send storage resumes exactly once in the live session; reload never starts it', async () => {
    const h = await administratorHarness();
    h.state.replace = async () => ({ status: 'unconfirmed', observed: h.state.persisted });
    await assert.rejects(h.request('send', { text: '更正记录' }));
    const turnId = h.runtime.submission()?.turnId; assert.ok(turnId); assert.equal(h.state.requests.length, 0);
    await h.request('check'); assert.equal(h.state.requests.length, 0);
    h.state.replace = null; await h.request('confirm'); await settled(h.runtime);
    await h.request('confirm'); await settled(h.runtime);
    assert.equal(h.state.requests.length, 1); assert.equal(h.conversation.read().turns.length, 1);
    assert.equal(h.conversation.read().turns[0].id, turnId);
    const reloaded = await administratorHarness(h.state.persisted.partitions); assert.equal(reloaded.state.requests.length, 0);
});

test('regeneration discards the previous attempt, including uncertain receipts', async () => {
    const operations = [{ id: 'old-write', appId: 'world', name: 'world', target: '', status: 'unconfirmed', elapsedMs: 1, summary: '' }];
    const h = await administratorHarness({ administrator: { ...createAdministratorData(), turns: [{ id: 'old', createdAt: 1,
        user: { text: '更正' }, assistant: null, toolMessages: [], status: 'failed', error: 'old failure', operations }] } });
    await h.request('regenerate', { turnId: 'old' }); await settled(h.runtime);
    const actual = h.conversation.read().turns[0];
    assert.equal(actual.status, 'finished'); assert.equal(actual.error, ''); assert.deepEqual(actual.operations, []);
});

test('reroll reclaims only discarded attachments after truncation is confirmed', async () => {
    const turns = ['before', 'target', 'later'].map(id => ({ id, createdAt: 1,
        user: { text: id, image: { name: `${id}.png`, path: `/user/images/xb-os-admin-admin-os/${id}.png` } },
        assistant: 'old answer', toolMessages: [], status: 'finished', error: '', operations: [] }));
    for (const action of ['confirm', 'stop', 'adopt']) {
        const h = await administratorHarness({ administrator: { ...createAdministratorData(), turns } });
        h.state.replace = async input => {
            // Stopping permits read-back of an already saved truncation, never a new submission.
            if (action === 'stop') { h.state.persisted = structuredClone(input.candidate); }
            return { status: 'unconfirmed', observed: null };
        };
        await assert.rejects(h.request('regenerate', { turnId: 'target' }));
        assert.equal(h.state.requests.length, 0); assert.deepEqual(h.state.removed, []);
        assert.deepEqual(h.conversation.read().turns.map(turn => turn.id), ['before', 'target', 'later']);
        h.state.replace = null;
        if (action === 'stop') { await h.request('stop'); }
        await h.request(action === 'adopt' ? 'adopt' : 'confirm'); await settled(h.runtime);
        assert.equal(h.state.requests.length, action === 'confirm' ? 1 : 0);
        assert.deepEqual(h.state.removed, action === 'adopt' ? [] : [{ osId: 'admin-os', image: turns[2].user.image }]);
        assert.deepEqual(h.conversation.read().turns.map(turn => turn.id), action === 'adopt' ? ['before', 'target', 'later'] : ['before', 'target']);
        const reloaded = await administratorHarness(h.state.persisted.partitions);
        assert.equal(reloaded.state.requests.length, 0);
    }
});

for (const stop of ['stop', 'stopBackground']) {
    test(`${stop} keeps a queued reroll cancelled through save confirmation and abandonment`, async () => {
        const turns = ['target', 'later'].map(id => ({ id, createdAt: 1,
            user: { text: id, image: { name: `${id}.png`, path: `/user/images/xb-os-admin-admin-os/${id}.png` } },
            assistant: 'old answer', toolMessages: [], operations: [], status: 'finished', error: '' }));
        const h = await administratorHarness({ administrator: { ...createAdministratorData(), turns } });
        let release;
        h.state.replace = async input => {
            await new Promise(resolve => { release = resolve; });
            h.state.persisted = structuredClone(input.candidate); return { status: 'confirmed' };
        };
        const participant = await createWorldManagement(h.world).open();
        const savingOtherApp = participant.execute('WorldEdit', { overview: 'other APP save' }, () => true);
        while (!release) { await tick(); }
        const regenerating = h.request('regenerate', { turnId: 'target' });
        const stopped = assert.rejects(regenerating);
        await tick();
        if (stop === 'stop') { await h.request('stop'); } else { await h.controller.stopBackground(); }
        release(); await savingOtherApp; await stopped;
        h.state.replace = null;
        assert.equal(h.repository.pending(), false);
        const writes = h.state.writes.length;
        await h.request('check');
        await assert.rejects(h.request('confirm'));
        assert.equal(h.state.writes.length, writes);
        assert.equal(h.state.requests.length, 0);
        assert.deepEqual(h.conversation.read().turns, turns);
        assert.deepEqual(h.state.removed, []);
        await h.request('adopt');
        assert.equal(h.conversation.unsaved(), false);
        assert.deepEqual(h.conversation.read().turns, turns);
        assert.equal(h.world.readCurrent().world.overview, 'other APP save');
        await h.request('regenerate', { turnId: 'target' }); await settled(h.runtime);
        assert.deepEqual(h.conversation.read().turns.map(turn => turn.id), ['target']);
        assert.equal(h.state.requests.length, 1);
        assert.deepEqual(h.state.removed, [{ osId: 'admin-os', image: turns[1].user.image }]);
    });
}

test('late send completion after switching chats cannot install old data, candidates or errors in the new session', async () => {
    for (const status of ['confirmed', 'unconfirmed', 'failed']) {
        const h = await administratorHarness(); let release;
        h.state.replace = async () => new Promise(resolve => { release = () => resolve(status === 'failed'
            ? { status, error: { code: 'offline', message: 'offline', retryable: true } } : { status, observed: null }); });
        const sending = h.request('send', { text: 'old request' }).catch(error => error);
        while (!release) { await tick(); }
        h.state.capture = { ...h.state.capture, identityKey: 'other-chat', binding: { ...h.state.capture.binding, chatId: 'other-chat' }, reference: { formatVersion: 1, osId: 'other-os' } };
        h.state.persisted = { ...h.state.persisted, osId: 'other-os', binding: h.state.capture.binding, partitions: {} };
        await h.controller.handleChatChanged();
        release(); await sending; h.state.replace = null;
        const state = await h.controller.activate({ isCurrent: () => true, activationToken: 'next', post: () => true });
        assert.equal(state.chatIdentity.includes('other-chat'), true);
        assert.equal(state.unsaved, false); assert.equal(state.error, ''); assert.equal(state.page.total, 0);
        assert.equal(h.runtime.submission(), null); assert.equal(h.state.requests.length, 0);
        await h.request('send', { text: 'new request' }); await settled(h.runtime);
        assert.deepEqual(h.conversation.read().turns.map(turn => turn.user.text), ['new request']);
    }
});

test('abandoning an unconfirmed image message reclaims only attachments absent from confirmed history', async () => {
    for (const applied of [false, true]) {
        const h = await administratorHarness();
        h.state.replace = async input => {
            if (applied) { h.state.persisted = structuredClone(input.candidate); }
            return { status: 'unconfirmed', observed: null };
        };
        await assert.rejects(h.request('send', { text: '查看截图', image: { name: 'screen.png', dataUrl: 'data:image/png;base64,YQ==' } }));
        h.state.replace = null; await h.request('adopt');
        assert.equal(h.conversation.unsaved(), false); assert.equal(h.state.requests.length, 0);
        assert.equal(h.state.removed.length, applied ? 0 : 1);
        assert.equal(h.conversation.read().turns.length, applied ? 1 : 0);
    }
});

test('confirmation through the owner APP reconciles receipts on return without invoking the model', async () => {
    const { h } = await interruptedWrite({ applied: true });
    const requests = h.state.requests.length;
    h.controller.deactivate(); await h.world.confirmPending();
    await h.controller.activate({ isCurrent: () => true, activationToken: 'back', post: () => true });
    assert.equal(h.conversation.read().turns[0].operations.at(-1).status, 'saved');
    assert.equal(h.state.requests.length, requests);
});

test('abandon reconciles a verified operation without overwriting a concurrently saved reply', async () => {
    const { h } = await interruptedWrite({ applied: true });
    h.state.persisted.partitions.administrator.turns[0].assistant = 'another window reply';
    h.state.persisted.partitions.administrator.turns[0].status = 'finished';
    h.state.persisted.partitions.administrator.revision++;
    h.state.persisted.commitId = 'other-window'; h.state.persisted.revision++;
    await h.request('adopt');
    const turn = h.conversation.read().turns[0];
    assert.equal(turn.assistant, 'another window reply'); assert.equal(turn.status, 'finished');
    assert.equal(turn.operations.at(-1).status, 'saved');
    assert.equal(JSON.parse(turn.toolMessages.at(-1).content).status, 'saved');
});

test('adopting a clear that already reached storage still completes its confirmed attachment cleanup', async () => {
    const h = await administratorHarness();
    await h.request('send', { text: '查看截图', image: { name: 'screen.png', dataUrl: 'data:image/png;base64,YQ==' } }); await settled(h.runtime);
    h.state.replace = async input => { h.state.persisted = structuredClone(input.candidate); return { status: 'unconfirmed', observed: null }; };
    await assert.rejects(h.request('clear')); assert.equal(h.state.removed.length, 0);
    h.state.replace = null; await h.request('adopt');
    assert.deepEqual(h.state.removed, [{ osId: 'admin-os', all: true }]);
    assert.equal(h.conversation.read().turns.length, 0); assert.equal(h.conversation.unsaved(), false);
});

test('a confirmed business write superseded later does not block activation or replay the old request', async () => {
    const { h, sent } = await interruptedWrite({ applied: true });
    await h.world.confirmPending();
    const other = await createWorldManagement(h.world).open();
    await other.execute('WorldEdit', { overview: 'later change' }, () => true);
    const requests = h.state.requests.length;
    const state = await h.controller.activate({ isCurrent: () => true, activationToken: 'again', post: () => true });
    assert.equal(state.unsaved, false);
    assert.equal(h.conversation.read().turns[0].operations.at(-1).status, 'unconfirmed');
    assert.equal(h.state.requests.length, requests);
    h.state.generate = async () => ({ text: 'current facts' });
    await h.request('regenerate', { turnId: sent.turnId }); await settled(h.runtime);
    assert.equal(h.world.readCurrent().world.overview, 'later change');
    assert.deepEqual(h.conversation.read().turns[0].operations, []);
    assert.equal(h.state.requests.length, requests + 1);
});

test('regeneration after confirming a pre-dispatch receipt does not dispatch the old business write', async () => {
    const h = await administratorHarness(); let step = 0, businessWrites = 0, fail = true;
    h.state.generate = withLoadedTools(['world'], async () => ++step === 1 ? call('WorldEdit', { overview: 'changed' }) : { text: 'done' });
    h.state.replace = async input => {
        if (fail && input.candidate.partitions.administrator?.turns[0]?.operations.some(operation => operation.status === 'unconfirmed')) {
            fail = false; return { status: 'unconfirmed', observed: h.state.persisted };
        }
        if (input.candidate.partitions.world?.overview !== h.state.persisted.partitions.world?.overview) { businessWrites++; }
        h.state.persisted = structuredClone(input.candidate); return { status: 'confirmed' };
    };
    const { turnId } = await h.request('send', { text: '修改概况' }); await settled(h.runtime);
    assert.equal(businessWrites, 0);
    await h.request('confirm');
    assert.equal(h.conversation.read().turns[0].operations.length, 2);
    h.state.generate = async () => ({ text: 'done' });
    await h.request('regenerate', { turnId }); await settled(h.runtime);
    const operations = h.conversation.read().turns[0].operations;
    assert.deepEqual(operations, []);
    assert.equal(businessWrites, 0);
    const reload = await administratorHarness(h.state.persisted.partitions);
    assert.deepEqual(reload.conversation.read().turns[0].operations, operations);
});

test('receipt reconciliation failure on activation leaves the APP open with a recoverable save', async () => {
    const { h } = await interruptedWrite({ applied: true });
    await h.world.confirmPending();
    const business = structuredClone(h.state.persisted.partitions.world);
    h.state.replace = async () => ({ status: 'failed', error: { code: 'offline', message: 'offline', retryable: true } });
    const state = await h.controller.activate({ isCurrent: () => true, activationToken: 'again', post: () => true });
    assert.equal(state.unsaved, true); assert.ok(state.error);
    h.state.replace = null; await h.request('confirm');
    assert.deepEqual(h.state.persisted.partitions.world, business);
    assert.equal(h.conversation.read().turns[0].operations.at(-1).status, 'saved');
});
