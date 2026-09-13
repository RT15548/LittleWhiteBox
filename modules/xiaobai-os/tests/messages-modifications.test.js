import assert from 'node:assert/strict';
import test from 'node:test';
import { harness, controllerHarness, photo } from './helpers/messages-harness.js';
import { createMessagesModifications, messagesRevision } from '../apps/messages/application/modifications.js';
import { regenerateMessageReply } from '../apps/messages/application/regenerate.js';
import { resolveCopiedMessages, branchMessages } from '../apps/messages/application/branch.js';
import { MESSAGES_PARTITION } from '../apps/messages/partition.js';
import { unsyncedIds } from '../apps/messages/application/projection.js';
import { projectionText } from '../domains/messages/transcript.js';
import { resolveConversationTokens } from '../../agent-core/runtime/context-tokens.js';

const target = (h, messageId, contactId = '甲') => ({ messageId, contactId, revision: messagesRevision(h.service.current()) });
const modify = (h, messageId, kind = 'delete', contactId = '甲') => h.deps.modifications.commit(target(h, messageId, contactId), kind, () => true);
const regenerate = (h, contactId = '甲', signal = new AbortController().signal, guard = () => true) => {
    const last = h.service.current().messages.filter(message => message.contactId === contactId).at(-1);
    return regenerateMessageReply(h.deps, h.deps.modifications, target(h, last.id, contactId), { signal, guard, stage() {} });
};

test('tokenizer failure does not prevent reroll from replacing replies and updating the native projection', async t => {
    const h = await harness(); await h.send('甲', 'a');
    const before = structuredClone(h.service.current()); const calls = h.apiCalls;
    h.deps.countTokens = options => resolveConversationTokens({ ...options, requestHeaders: () => ({}) });
    t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 403 }));
    await regenerate(h);
    assert.equal(h.apiCalls, calls + 1);
    const current = h.service.current();
    assert.deepEqual(current.messages.filter(m => m.sender === 'user'), before.messages.filter(m => m.sender === 'user'));
    assert.ok(current.messages.filter(m => m.sender === 'contact').every(m => !before.messages.some(old => old.id === m.id)));
    assert.equal(h.remote[0].mes, projectionText(current, current.segments[0]));
});

test('single deletion updates both files, preserves later replies and other contacts, invalidates only affected summaries', async () => {
    const h = await harness(); await h.send('甲', 'photo', photo); await h.send('乙', 'other');
    await h.service.change(state => {for (const contact of state.contacts) {contact.summary = { throughSeq: state.messages.filter(m => m.contactId === contact.id).at(-1).seq, text: contact.name + '旧摘要' };}});
    const original = h.service.current(); const originalB = original.messages.filter(m => m.contactId === '乙');
    const request = target(h, 'photo');
    await h.deps.modifications.commit(request, 'delete', () => true);
    const state = h.service.current();
    assert.equal(state.messages.some(m => m.id === 'photo'), false);
    assert.deepEqual(state.messages.filter(m => m.contactId === '乙'), originalB);
    assert.ok(state.messages.filter(m => m.contactId === '甲').every(m => m.replyTo === null));
    assert.equal(state.contacts[0].summary, null); assert.equal(state.contacts[1].summary.text, '乙旧摘要');
    assert.equal(h.images.size, 1); assert.equal(state.nextSeq, original.nextSeq);
    assert.equal(h.remote[0].mes, projectionText(state, state.segments[0]));
    assert.equal(state.segments[0].sealed, false); assert.deepEqual(unsyncedIds(state), []);
    await assert.rejects(h.deps.modifications.commit(request, 'delete', () => true), /记录已经变化/);
    await modify(h, undefined, 'delete-contact', '甲');
    assert.deepEqual(h.service.current().messages, originalB);
    await modify(h, undefined, 'delete-contact', '乙');
    assert.deepEqual(h.messages, []); assert.deepEqual(h.remote, []); assert.deepEqual(h.service.current().segments, []);
    assert.equal(h.service.current().nextSeq, original.nextSeq);
});

test('Host rejects all deletion entry points and reroll for history, manual changes, removed or summarized native floors', async t => {
    for (const [name, close, reason] of [
        ['story continued', h => h.messages.push({ mes: '下一段剧情' }), /推进到新楼层/],
        ['manual edit', h => {h.messages[0].mes = '手动改写';}, /手动修改/],
        ['deleted floor', h => {h.messages = [];}, /已被删除/],
        ['summarized', h => {h.finalizedThrough = 0;}, /纳入剧情总结/],
    ]) {await t.test(name, async () => {
        const h = await harness(); await h.send('甲', 'photo', photo); const c = await controllerHarness(h);
        const stale = target(h, 'photo'); close(h);
        const previous = h.service.current(); const floors = structuredClone(h.messages);
        const page = await c.command('thread', { contactId: '甲' });
        assert.match(page.permissions.photo.reason, reason);
        assert.ok(Object.values(page.permissions).every(p => !p.regenerate));
        await assert.rejects(c.command('message/delete', stale), reason);
        await assert.rejects(c.command('contact/delete', stale), reason);
        await assert.rejects(c.command('regenerate', { ...stale, messageId: previous.messages.at(-1).id }));
        await assert.rejects(c.command('message/delete-image', stale));
        assert.deepEqual(h.service.current(), previous); assert.deepEqual(h.messages, floors);
    });}
});

test('sealed communications never reopen when later story is deleted; an empty contact can be removed', async () => {
    const h = await harness(); await h.send('甲', 'a');
    h.messages.push({ mes: '剧情已推进' }); await h.timeline.seal(h.timeline.observe(), () => true); h.messages.pop();
    await assert.rejects(modify(h, 'a'), /推进到新楼层/);
    await modify(h, undefined, 'delete-contact', '乙');
    assert.equal(h.service.current().contacts.length, 1);
});

test('reroll replaces an entire latest reply group in its original floor position without renumbering another contact', async () => {
    const h = await harness(); await h.send('甲', 'a'); await h.send('乙', 'b');
    const before = h.service.current(); const other = before.messages.filter(m => m.contactId === '乙');
    const latest = target(h, before.messages.filter(m => m.contactId === '甲').at(-1).id);
    h.response = () => ({ text: '{"replies":[{"type":"text","text":"重新回答甲"}]}' });
    await regenerate(h);
    let state = h.service.current();
    assert.deepEqual(state.messages.filter(m => m.contactId === '乙'), other);
    const newReply = state.messages.at(-1);
    assert.equal(newReply.seq, before.nextSeq); assert.equal(newReply.replyTo, 'a');
    assert.deepEqual(state.segments[0].messageIds, ['a', newReply.id, ...other.map(m => m.id)]);
    assert.ok(h.remote[0].mes.indexOf('重新回答甲') < h.remote[0].mes.indexOf('接收者="乙"'));
    assert.equal(h.remote[0].extra.xiaobai_private_messages.throughSeq, newReply.seq);
    assert.deepEqual(unsyncedIds(state), []);
    await assert.rejects(h.deps.modifications.commit(latest, 'regenerate', () => true), /记录已经变化/);
    await regenerate(h, '乙'); await h.send('甲', 'new');
    state = h.service.current();
    assert.equal(h.remote[0].mes, projectionText(state, state.segments[0]));
    assert.deepEqual(state.messages.map(m => m.seq), [...state.messages.map(m => m.seq)].sort((a, b) => a - b));
});

test('reroll rebuilds a contaminated summary only in candidate context; failure/cancel preserves all original records', async () => {
    const h = await harness(); await h.send('甲', 'a');
    await h.service.change(state => {state.contacts[0].summary = { throughSeq: state.messages.at(-1).seq, text: 'OLD_ANSWER_SECRET' };});
    const original = h.service.current();
    h.response = () => {throw new Error('model offline');};
    await assert.rejects(regenerate(h), /model offline/);
    assert.deepEqual(h.service.current(), original);
    assert.doesNotMatch(JSON.stringify(h.requests.at(-1)), /OLD_ANSWER_SECRET|马上到|等我一下/);
    let release; let started;
    const entered = new Promise(resolve => {started = resolve;});
    h.response = () => {started(); return new Promise(resolve => {release = resolve;});};
    const controller = new AbortController(); const pending = regenerate(h, '甲', controller.signal);
    await entered; controller.abort(); release({ text: '{"replies":[{"type":"text","text":"too late"}]}' });
    await assert.rejects(pending, /cancelled/); assert.deepEqual(h.service.current(), original);
});

test('runtime rejects concurrent/duplicate rerolls and keeps an accepted operation alive after closing the APP', async () => {
    const h = await harness(); await h.send('甲', 'a'); const c = await controllerHarness(h);
    let release; let started; const entered = new Promise(resolve => {started = resolve;});
    h.response = () => {started(); return new Promise(resolve => {release = resolve;});};
    const command = target(h, h.service.current().messages.at(-1).id);
    await c.command('regenerate', command); await entered;
    await assert.rejects(c.command('regenerate', command), /上一项操作/);
    assert.equal(h.service.current().messages.length, 3); c.controller.deactivate();
    release({ text: '{"replies":[{"type":"text","text":"完成新的回复"}]}' }); await c.idle();
    assert.equal(h.service.current().messages.at(-1).payload.text, '完成新的回复');
    c.activate(); await assert.rejects(c.command('regenerate', command), /记录已经变化/);
    assert.equal(h.apiCalls, 2);
});

test('each cross-file save failure retains originals until native confirmation; checking save never regenerates', async t => {
    for (const phase of ['candidate', 'native', 'commit']) {
        for (const status of ['failed', 'unconfirmed']) {await t.test(`${phase}/${status}`, async () => {
            const h = await harness(); await h.send('甲', 'a'); const original = h.service.current();
            const originalFloors = structuredClone(h.messages); let writes = 0;
            if (phase === 'native') {h.failProjection = true;}
            else {h.replace = input => {
                writes++;
                if (writes === (phase === 'candidate' ? 1 : 2)) {
                    if (status === 'unconfirmed') {h.persisted = structuredClone(input.candidate); return { status, observed: null };}
                    return { status, error: { code: 'network', message: 'offline', retryable: true } };
                }
                h.persisted = structuredClone(input.candidate); return { status: 'confirmed' };
            };}
            await assert.rejects(regenerate(h));
            assert.deepEqual(h.service.current().messages, original.messages);
            if (phase === 'candidate') {assert.deepEqual(h.messages, originalFloors);}
            const calls = h.apiCalls;
            h.replace = null; h.failProjection = false;
            await h.service.confirm(); await h.deps.modifications.recover(() => true);
            const current = h.service.current();
            assert.equal(current.pendingMutation, null); assert.equal(h.apiCalls, calls);
            assert.notEqual(current.messages.at(-1).id, original.messages.at(-1).id);
            assert.equal(h.remote[0].mes, projectionText(current, current.segments[0]));
        });}
    }
});

test('restart resolves confirmed target, retries only original writable floors, and cancels conflicting pending writes', async t => {
    for (const outcome of ['target-saved', 'base-saved', 'story-continued', 'manual-edit', 'deleted']) {await t.test(outcome, async () => {
        const h = await harness(); await h.send('甲', 'a'); const original = h.service.current();
        h.failProjection = true; await assert.rejects(modify(h, 'a'));
        const candidate = MESSAGES_PARTITION.parse(h.persisted.partitions.messages).value;
        assert.ok(candidate.pendingMutation);
        if (outcome === 'target-saved') {h.remote = structuredClone(h.messages); h.remote.push({ mes: '后续剧情' });}
        if (outcome === 'story-continued') {h.remote.push({ mes: '后续剧情' });}
        if (outcome === 'manual-edit') {h.remote[0].mes = '用户改写';}
        if (outcome === 'deleted') {h.remote = [];}
        h.messages = structuredClone(h.remote); h.restart(); h.failProjection = false;
        const fresh = await harness({ persisted: h.persisted, remote: h.remote });
        Object.assign(h, { service: fresh.service, chat: fresh.chat });
        const restored = createMessagesModifications(fresh.service, fresh.timeline, fresh.chat, () => 'recovered');
        await restored.recover(() => true);
        assert.equal(h.service.current().pendingMutation, null);
        assert.equal(h.apiCalls, 1);
        if (['target-saved', 'base-saved'].includes(outcome)) {assert.ok(!h.service.current().messages.some(m => m.id === 'a'));}
        else {assert.deepEqual(h.service.current().messages, original.messages);}
        if (outcome === 'deleted') {assert.deepEqual(h.messages, []);}
        if (outcome === 'manual-edit') {assert.equal(h.messages[0].mes, '用户改写');}
        assert.equal(fresh.apiCalls, 0);
    });}
});

test('copies resolve pending changes using their own native evidence, never inherit executable operations', async () => {
    const h = await harness(); await h.send('甲', 'a'); const originalFloor = structuredClone(h.messages);
    h.failProjection = true; await assert.rejects(modify(h, 'a'));
    const source = h.service.current(); assert.ok(source.pendingMutation);
    for (const copy of [resolveCopiedMessages, branchMessages]) {
        const base = copy(source, originalFloor); const targetCopy = copy(source, h.messages);
        assert.equal(base.pendingMutation, null); assert.equal(targetCopy.pendingMutation, null);
        assert.ok(base.messages.some(m => m.id === 'a')); assert.ok(!targetCopy.messages.some(m => m.id === 'a'));
    }
    for (const floor of [originalFloor, h.messages]) {
        const copied = resolveCopiedMessages(source, [...floor, { mes: '子聊天已有后续剧情' }]);
        assert.equal(copied.pendingMutation, null);
        assert.equal(copied.segments[0].sealed, true);
    }
    assert.ok(source.pendingMutation);
});

test('pending native result is not discarded while main-chat save is in flight; sends and other mutations stay blocked', async () => {
    const h = await harness(); await h.send('甲', 'a'); const original = h.service.current();
    h.failProjection = true; await assert.rejects(modify(h, 'a'));
    const c = await controllerHarness(h);
    await assert.rejects(c.command('send', { contactId: '乙', actionId: 'blocked', payload: { type: 'text', text: 'later' } }));
    await assert.rejects(modify(h, original.messages.at(-1).id), /尚待确认/);
    await assert.rejects(regenerate(h));
    h.messages.push({ mes: '随后推进的主剧情' });
    await h.timeline.seal(h.timeline.observe(), () => true);
    await assert.rejects(h.deps.modifications.recover(() => true), /尚待保存确认/);
    assert.ok(h.service.current().pendingMutation); assert.deepEqual(h.service.current().messages, original.messages);
    h.remote = structuredClone(h.messages);
    await h.deps.modifications.recover(() => true);
    assert.equal(h.service.current().pendingMutation, null);
    assert.equal(h.service.current().segments[0].sealed, true);
    assert.equal(h.apiCalls, 1);
});

test('authoritative page refresh removes deleted rows while stale older-page requests are rejected', async () => {
    const h = await harness(); await h.send('甲', 'a'); const c = await controllerHarness(h);
    const originalPage = await c.command('thread', { contactId: '甲' });
    const first = originalPage.messages[0].seq; const last = originalPage.messages.at(-1).seq;
    await c.command('message/delete', target(h, 'a'));
    const page = await c.command('thread', { contactId: '甲', window: { first, last, latest: true } });
    assert.deepEqual(page.messages.map(m => m.id), originalPage.messages.slice(1).map(m => m.id));
    assert.ok(page.messages.every(m => m.replyTo === null));
    assert.notEqual(page.revision, originalPage.revision);
    await assert.rejects(c.command('thread', { contactId: '甲', before: last, revision: originalPage.revision }));
    await assert.rejects(c.command('thread', { contactId: '甲', window: { first: -1, last, latest: true } }));
});
